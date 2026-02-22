let nodes, edges, network;

let isResizing = false;
let resizingNodeId = null;
let initialPointer = null;
let initialNodeSize = null;
let initialNodePos = null;

let isSelecting = false;
let selectionRect = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };

let isAddingPrereq = false;
let prereqSourceNode = null;
let prereqCurrentPointer = null;

window.isIsolated = false;

let undoStack = [];
let redoStack = [];
let isRestoring = false;

let modalState = { mode: "add", nodeId: null, x: 0, y: 0 };

window.updateCourseStats = function () {
    if (!nodes) return;
    let allNodes = nodes.get();
    let statsNode = allNodes.find(n => n.id === "COMMENT_Stats");
    if (!statsNode) return;

    let stats = {};

    allNodes.forEach(n => {
        if (String(n.id).startsWith("BG_") || String(n.id).startsWith("COMMENT_")) return;

        let label = n.label || "";
        let codePart = label.split("\n")[0].trim();
        let credits = parseFloat(n.credits !== undefined ? n.credits : 0.5);

        let match = codePart.match(/^([A-Za-z]{2,4})\s*(\d)\d{2,3}/);
        if (match) {
            let prefix = match[1].toUpperCase();
            let level = match[2];

            if (!stats[prefix]) {
                stats[prefix] = {
                    totalCount: 0,
                    totalCredits: 0,
                    levels: {
                        1: { count: 0, credits: 0 },
                        2: { count: 0, credits: 0 },
                        3: { count: 0, credits: 0 },
                        4: { count: 0, credits: 0 },
                        5: { count: 0, credits: 0 },
                        6: { count: 0, credits: 0 }
                    }
                };
            }
            stats[prefix].totalCount++;
            stats[prefix].totalCredits += credits;
            stats[prefix].levels[level].count++;
            stats[prefix].levels[level].credits += credits;
        }
    });

    let statsText = "COURSE STATISTICS\n";
    let prefixes = Object.keys(stats).sort();

    if (prefixes.length === 0) {
        statsText += "\nNo coded courses found.";
    } else {
        prefixes.forEach(prefix => {
            let s = stats[prefix];
            statsText += `\n${prefix}: ${s.totalCredits} Credits (${s.totalCount})`;
            for (let lvl = 1; lvl <= 6; lvl++) {
                if (s.levels[lvl].count > 0) {
                    statsText += `\n  ↳ ${lvl}000-level: ${s.levels[lvl].credits} Credits (${s.levels[lvl].count})`;
                }
            }
        });
    }

    if (statsNode.label !== statsText) {
        nodes.update({ id: "COMMENT_Stats", label: statsText });
    }
};

function saveState() {
    if (isRestoring || !network) return;

    window.updateCourseStats();

    let currentPositions = network.getPositions();

    let cleanNodes = nodes.get().map(n => {
        let obj = { ...n };
        if (currentPositions[obj.id]) {
            obj.x = currentPositions[obj.id].x;
            obj.y = currentPositions[obj.id].y;
        }
        delete obj.opacity;
        return obj;
    });

    cleanNodes.sort((a, b) => String(a.id).localeCompare(String(b.id)));

    let cleanEdges = edges.get().map(e => {
        let obj = { ...e };
        if (obj.color && obj.color.opacity !== undefined) {
            delete obj.color.opacity;
        }
        return obj;
    });
    cleanEdges.sort((a, b) => String(a.id).localeCompare(String(b.id)));

    let currentState = JSON.stringify({ nodes: cleanNodes, edges: cleanEdges });

    if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== currentState) {
        undoStack.push(currentState);
        if (undoStack.length > 50) undoStack.shift();
        redoStack = [];
    }
}

function undo() {
    if (undoStack.length > 1) {
        window.clearIsolation();
        redoStack.push(undoStack.pop());
        let previousStateStr = undoStack[undoStack.length - 1];
        restoreState(JSON.parse(previousStateStr));
    }
}

function redo() {
    if (redoStack.length > 0) {
        window.clearIsolation();
        let nextStateStr = redoStack.pop();
        undoStack.push(nextStateStr);
        restoreState(JSON.parse(nextStateStr));
    }
}

function restoreState(state) {
    isRestoring = true;

    try {
        let stateNodeIds = state.nodes.map(n => n.id);
        let nodesToRemove = nodes.getIds().filter(id => !stateNodeIds.includes(id));
        if (nodesToRemove.length > 0) nodes.remove(nodesToRemove);

        let stateEdgeIds = state.edges.map(e => e.id);
        let edgesToRemove = edges.getIds().filter(id => !stateEdgeIds.includes(id));
        if (edgesToRemove.length > 0) edges.remove(edgesToRemove);

        nodes.update(state.nodes);
        edges.update(state.edges);

        state.nodes.forEach(n => {
            if (n.x !== undefined && n.y !== undefined) {
                try { network.moveNode(n.id, n.x, n.y); } catch (err) { }
            }
        });

        network.redraw();
    } catch (error) {
        console.error("Error restoring state:", error);
    } finally {
        isRestoring = false;
    }
}

document.addEventListener("keydown", function (e) {
    if (!network) return;

    let modal = document.getElementById("course-modal");
    if (modal && modal.style.display === "flex") {
        if (e.key === "Escape") window.closeCourseModal();
        if (e.key === "Enter") window.saveCourseModal();
        return;
    }

    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.key === "Escape") {
        if (isAddingPrereq) {
            isAddingPrereq = false;
            prereqSourceNode = null;
            network.redraw();
        } else {
            network.unselectAll();
            window.clearIsolation();
        }
        return;
    }

    if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "s") {
            e.preventDefault();
            window.saveJSON(e);
            return;
        }
        if (e.code === "KeyZ" || e.key.toLowerCase() === "z") {
            undo();
            e.preventDefault();
            return;
        }
        if (e.code === "KeyY" || e.key.toLowerCase() === "y") {
            redo();
            e.preventDefault();
            return;
        }
    }

    if (e.key === "Delete" || e.key === "Backspace") {
        let selectedNodes = network.getSelectedNodes();
        let selectedEdges = network.getSelectedEdges();
        let hasDeletions = false;

        if (selectedNodes.length > 0) {
            let validNodes = selectedNodes.filter(id => !String(id).startsWith("BG_"));
            if (validNodes.length > 0) {
                window.clearIsolation();
                nodes.remove(validNodes);
                hasDeletions = true;
            }
        }

        if (selectedEdges.length > 0) {
            let existingEdges = selectedEdges.filter(id => edges.get(id) !== null);
            if (existingEdges.length > 0) {
                window.clearIsolation();
                try { edges.remove(existingEdges); } catch (err) { }
                hasDeletions = true;
            }
        }

        if (hasDeletions) {
            network.unselectAll();
            saveState();
            e.preventDefault();
        }
    }
});

// INITIALIZE EMPTY NETWORK FIRST
nodes = new vis.DataSet([]);
edges = new vis.DataSet([]);

let container = document.getElementById("course-network");
let data = { nodes: nodes, edges: edges };

let options = {
    physics: { enabled: false },
    layout: { hierarchical: false },
    interaction: {
        dragView: true,
        dragNodes: true,
        multiselect: true
    },
    manipulation: { enabled: false },
    nodes: { font: { size: 14, color: "#000000", face: "Arial" }, borderWidth: 1, shadow: true },
    edges: { color: "#aaaaaa", smooth: { type: "cubicBezier" }, width: 2 }
};

network = new vis.Network(container, data, options);

network.on("dragEnd", function (params) {
    if (params.nodes.length > 0) {
        let pos = network.getPositions(params.nodes);
        let updates = params.nodes.map(id => ({ id: id, x: pos[id].x, y: pos[id].y }));
        nodes.update(updates);
        saveState();
    }
});

network.on("doubleClick", function (params) {
    if (params.nodes.length === 0 && params.edges.length === 0) {
        window.openCourseModal("add", params.pointer.canvas.x, params.pointer.canvas.y);
    } else if (params.nodes.length === 1) {
        let nodeId = params.nodes[0];
        if (!String(nodeId).startsWith("BG_") && !String(nodeId).startsWith("COMMENT_")) {
            network.selectNodes([nodeId]);
            window.startAddEdgeMode(nodeId, params.pointer.canvas);
        }
    } else if (params.nodes.length === 0 && params.edges.length === 1) {
        let edgeId = params.edges[0];
        let edge = edges.get(edgeId);
        let sourceNode = edge.from;
        window.clearIsolation();
        edges.remove(edgeId);
        saveState();
        window.startAddEdgeMode(sourceNode, params.pointer.canvas);
    }
});

network.on("click", function (params) {
    document.getElementById("context-menu").style.display = "none";

    if (isAddingPrereq) {
        let clickedNodes = params.nodes;
        if (clickedNodes.length > 0) {
            let targetId = clickedNodes[0];
            if (!String(targetId).startsWith("BG_") && !String(targetId).startsWith("COMMENT_") && targetId !== prereqSourceNode) {
                edges.add({ from: prereqSourceNode, to: targetId, arrows: "to" });
                saveState();
            }
        }
        isAddingPrereq = false;
        prereqSourceNode = null;
        network.redraw();
    } else if (params.nodes.length === 0 && params.edges.length === 0) {
        if (window.isIsolated) {
            window.clearIsolation();
        }
    }
});

network.on("oncontext", function (params) {
    params.event.preventDefault();

    if (isAddingPrereq) {
        isAddingPrereq = false;
        prereqSourceNode = null;
        network.redraw();
        return;
    }

    let nodeId = network.getNodeAt(params.pointer.DOM);
    let edgeId = network.getEdgeAt(params.pointer.DOM);

    let menu = document.getElementById("context-menu");
    let list = document.getElementById("context-menu-list");
    list.innerHTML = "";

    let isBgNode = nodeId && String(nodeId).startsWith("BG_");
    let isCommentNode = nodeId && String(nodeId).startsWith("COMMENT_");

    if (nodeId && !isBgNode && !isCommentNode) {
        network.selectNodes([nodeId]);

        let renameItem = document.createElement("li");
        renameItem.innerText = "Edit Course";
        renameItem.onclick = function () { window.openCourseModal("edit", 0, 0, nodeId); };
        list.appendChild(renameItem);

        let colorItem = document.createElement("li");
        colorItem.innerText = "Change Color";
        colorItem.onclick = function () {
            document.getElementById("context-menu").style.display = "none";
            window.targetColorNode = nodeId;
            let node = nodes.get(nodeId);
            let picker = document.getElementById("node-color-picker");

            let currentColor = "#ffffff";
            if (node.color) {
                if (typeof node.color === "string") {
                    currentColor = node.color;
                } else if (node.color.background) {
                    currentColor = node.color.background;
                }
            }

            if (currentColor.length === 7 && currentColor.startsWith("#")) {
                picker.value = currentColor;
            } else {
                picker.value = "#ffffff";
            }

            picker.click();
        };
        list.appendChild(colorItem);

        let reqItem = document.createElement("li");
        reqItem.innerText = "Add Prerequisite";
        reqItem.onclick = function () { window.startAddEdgeMode(nodeId, params.pointer.canvas); };
        list.appendChild(reqItem);

        let isolateItem = document.createElement("li");
        isolateItem.innerText = "Isolate";
        isolateItem.onclick = function () { window.isolateNode(nodeId); };
        list.appendChild(isolateItem);

        let delItem = document.createElement("li");
        delItem.innerText = "Delete Course";
        delItem.onclick = function () { window.deleteNode(nodeId); };
        list.appendChild(delItem);

    } else if (nodeId && isCommentNode) {
        network.selectNodes([nodeId]);

        let renameItem = document.createElement("li");
        renameItem.innerText = "Edit Text";
        renameItem.onclick = function () { window.editComment(nodeId); };
        list.appendChild(renameItem);

        let colorItem = document.createElement("li");
        colorItem.innerText = "Change Color";
        colorItem.onclick = function () {
            document.getElementById("context-menu").style.display = "none";
            window.targetColorNode = nodeId;
            let picker = document.getElementById("node-color-picker");
            picker.value = "#cccccc";
            picker.click();
        };
        list.appendChild(colorItem);

        let delItem = document.createElement("li");
        delItem.innerText = "Delete Comment";
        delItem.onclick = function () { window.deleteNode(nodeId); };
        list.appendChild(delItem);

    } else if (edgeId && !nodeId) {
        network.selectEdges([edgeId]);
        let edge = edges.get(edgeId);
        let isConcurrent = edge.dashes === true;

        let toggleItem = document.createElement("li");
        toggleItem.innerText = isConcurrent ? "Set as Hard Prerequisite" : "Set as Concurrent";
        toggleItem.onclick = function () {
            document.getElementById("context-menu").style.display = "none";
            window.clearIsolation();
            edges.update({
                id: edgeId,
                dashes: !isConcurrent
            });
            saveState();
        };
        list.appendChild(toggleItem);

        let delEdgeItem = document.createElement("li");
        delEdgeItem.innerText = "Delete Prerequisite";
        delEdgeItem.onclick = function () { window.deleteEdge(edgeId); };
        list.appendChild(delEdgeItem);

    } else {
        let addHereItem = document.createElement("li");
        addHereItem.innerText = "Add Course Here";
        let x = params.pointer.canvas.x;
        let y = params.pointer.canvas.y;
        addHereItem.onclick = function () { window.openCourseModal("add", x, y); };
        list.appendChild(addHereItem);

        let addCommentItem = document.createElement("li");
        addCommentItem.innerText = "Add Comment Here";
        addCommentItem.onclick = function () { window.addCommentAt(x, y); };
        list.appendChild(addCommentItem);

        let addStatsItem = document.createElement("li");
        addStatsItem.innerText = "Add Stats Block";
        addStatsItem.onclick = function () { window.addStatsAt(x, y); };
        list.appendChild(addStatsItem);
    }

    menu.style.display = "block";
    menu.style.left = params.event.clientX + "px";
    menu.style.top = params.event.clientY + "px";
});

network.on("dragStart", function () {
    document.getElementById("context-menu").style.display = "none";
});

network.on("beforeDrawing", function (ctx) {
    let pos = network.getPositions();
    let allNodes = nodes.get();
    let courseNodes = allNodes.filter(n => !String(n.id).startsWith("BG_") && !String(n.id).startsWith("COMMENT_"));

    allNodes.forEach(function (node) {
        if (String(node.id).startsWith("BG_")) {
            let p = pos[node.id];
            if (!p) return;

            let w = node.customW || 190;
            let baseH = node.customH || 850;

            let colLeft = p.x - (w / 2);
            let colRight = p.x + (w / 2);
            let colTop = p.y - (baseH / 2);
            let colBottom = colTop + baseH;

            courseNodes.forEach(cn => {
                let box = network.getBoundingBox(cn.id);
                if (box) {
                    let nodeCenterX = (box.left + box.right) / 2;
                    let isOverlappingX = (nodeCenterX >= colLeft && nodeCenterX <= colRight) || (p.x >= box.left && p.x <= box.right);

                    if (isOverlappingX) {
                        if (box.bottom + 40 > colBottom) {
                            colBottom = box.bottom + 40;
                        }
                    }
                }
            });

            let totalCredits = 0;
            courseNodes.forEach(cn => {
                let box = network.getBoundingBox(cn.id);
                if (box) {
                    let nodeCenterX = (box.left + box.right) / 2;
                    let nodeCenterY = (box.top + box.bottom) / 2;
                    let nodeWidth = box.right - box.left;

                    let isOverlappingX = (nodeCenterX >= colLeft && nodeCenterX <= colRight) || (p.x >= box.left && p.x <= box.right);

                    if (isOverlappingX && nodeCenterY >= colTop && nodeCenterY <= colBottom) {
                        let credits = parseFloat(cn.credits !== undefined ? cn.credits : 0.5);
                        if (nodeWidth > 300) {
                            credits = credits / 2;
                        }
                        totalCredits += credits;
                    }
                }
            });

            let dynamicH = colBottom - colTop;

            ctx.fillStyle = node.customColor;
            ctx.strokeStyle = node.customBorder;
            ctx.lineWidth = 2;
            ctx.fillRect(colLeft, colTop, w, dynamicH);
            ctx.strokeRect(colLeft, colTop, w, dynamicH);

            if (node.customLabel) {
                ctx.fillStyle = "#777777";
                ctx.font = "22px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                let lines = node.customLabel.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], p.x, colTop + 15 + (i * 26));
                }

                ctx.fillStyle = "#888888";
                ctx.font = "bold 16px Arial";
                ctx.fillText("Credits: " + totalCredits, p.x, colTop + 15 + (lines.length * 26) + 5);
            }
        }
    });
});

network.on("afterDrawing", function (ctx) {
    if (isAddingPrereq && prereqSourceNode && prereqCurrentPointer) {
        let pos = network.getPositions([prereqSourceNode])[prereqSourceNode];
        if (pos) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(prereqCurrentPointer.x, prereqCurrentPointer.y);
            ctx.strokeStyle = "#aaaaaa";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    let selectedNodes = network.getSelectedNodes();
    if (selectedNodes.length === 1 && !isAddingPrereq) {
        let nodeId = selectedNodes[0];
        if (!String(nodeId).startsWith("BG_")) {
            let box = network.getBoundingBox(nodeId);
            if (box) {
                ctx.fillStyle = "#2196F3";
                ctx.beginPath();
                ctx.moveTo(box.right - 15, box.bottom);
                ctx.lineTo(box.right, box.bottom);
                ctx.lineTo(box.right, box.bottom - 15);
                ctx.fill();
            }
        }
    }

    if (isSelecting) {
        ctx.strokeStyle = "rgba(33, 150, 243, 0.8)";
        ctx.fillStyle = "rgba(33, 150, 243, 0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        let w = selectionRect.end.x - selectionRect.start.x;
        let h = selectionRect.end.y - selectionRect.start.y;

        ctx.fillRect(selectionRect.start.x, selectionRect.start.y, w, h);
        ctx.strokeRect(selectionRect.start.x, selectionRect.start.y, w, h);
        ctx.setLineDash([]);
    }
});

let canvas = container.getElementsByTagName("canvas")[0];

canvas.addEventListener("mousedown", function (e) {
    if (e.button === 2) return;

    let rect = canvas.getBoundingClientRect();
    let pointerDOM = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    let pointerCanvas = network.DOMtoCanvas(pointerDOM);

    if (e.shiftKey) {
        isSelecting = true;
        selectionRect.start = { x: pointerCanvas.x, y: pointerCanvas.y };
        selectionRect.end = { x: pointerCanvas.x, y: pointerCanvas.y };
        network.setOptions({ interaction: { dragView: false } });
        e.preventDefault();
        return;
    }

    if (isAddingPrereq) return;

    let selectedNodes = network.getSelectedNodes();
    if (selectedNodes.length === 1) {
        let nodeId = selectedNodes[0];
        if (!String(nodeId).startsWith("BG_")) {
            let box = network.getBoundingBox(nodeId);

            if (box && pointerCanvas.x >= box.right - 15 && pointerCanvas.y >= box.bottom - 15 &&
                pointerCanvas.x <= box.right + 10 && pointerCanvas.y <= box.bottom + 10) {

                isResizing = true;
                resizingNodeId = nodeId;
                initialPointer = pointerCanvas;

                let node = nodes.get(nodeId);
                initialNodeSize = {
                    width: node.widthConstraint && node.widthConstraint.minimum ? node.widthConstraint.minimum : (box.right - box.left),
                    height: node.heightConstraint && node.heightConstraint.minimum ? node.heightConstraint.minimum : (box.bottom - box.top)
                };

                let currentPositions = network.getPositions([nodeId]);
                initialNodePos = { x: currentPositions[nodeId].x, y: currentPositions[nodeId].y };

                network.setOptions({ interaction: { dragView: false, dragNodes: false } });
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }
}, true);

window.addEventListener("mousemove", function (e) {
    let rect = canvas.getBoundingClientRect();
    let pointerDOM = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    let pointerCanvas = network.DOMtoCanvas(pointerDOM);

    if (isAddingPrereq) {
        prereqCurrentPointer = pointerCanvas;
        network.redraw();
        return;
    }

    if (isSelecting) {
        selectionRect.end = { x: pointerCanvas.x, y: pointerCanvas.y };
        network.redraw();
    } else if (isResizing && resizingNodeId) {
        let dx = pointerCanvas.x - initialPointer.x;
        let dy = pointerCanvas.y - initialPointer.y;

        let newWidth = Math.max(80, initialNodeSize.width + dx);
        let newHeight = Math.max(40, initialNodeSize.height + dy);

        let deltaW = newWidth - initialNodeSize.width;
        let deltaH = newHeight - initialNodeSize.height;

        nodes.update({
            id: resizingNodeId,
            widthConstraint: { minimum: newWidth },
            heightConstraint: { minimum: newHeight, valign: "top" },
            x: initialNodePos.x + (deltaW / 2),
            y: initialNodePos.y + (deltaH / 2)
        });
    } else if (network) {
        let selectedNodes = network.getSelectedNodes();
        let overHandle = false;
        if (selectedNodes.length === 1) {
            let nodeId = selectedNodes[0];
            if (!String(nodeId).startsWith("BG_")) {
                let box = network.getBoundingBox(nodeId);
                if (box && pointerCanvas.x >= box.right - 15 && pointerCanvas.y >= box.bottom - 15 &&
                    pointerCanvas.x <= box.right + 10 && pointerCanvas.y <= box.bottom + 10) {
                    overHandle = true;
                }
            }
        }
        canvas.style.cursor = overHandle ? "nwse-resize" : "default";
    }
}, true);

window.addEventListener("mouseup", function (e) {
    if (isSelecting) {
        isSelecting = false;
        network.setOptions({ interaction: { dragView: true } });

        let minX = Math.min(selectionRect.start.x, selectionRect.end.x);
        let maxX = Math.max(selectionRect.start.x, selectionRect.end.x);
        let minY = Math.min(selectionRect.start.y, selectionRect.end.y);
        let maxY = Math.max(selectionRect.start.y, selectionRect.end.y);

        let selectedIds = [];
        nodes.forEach(n => {
            if (!String(n.id).startsWith("BG_")) {
                let pos = network.getPositions([n.id])[n.id];
                if (pos && pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
                    selectedIds.push(n.id);
                }
            }
        });

        network.selectNodes(selectedIds);
        network.redraw();
    } else if (isResizing) {
        network.setOptions({ interaction: { dragView: true, dragNodes: true } });
        isResizing = false;
        resizingNodeId = null;
        saveState();
    }
}, true);


// REUSABLE FUNCTION TO LOAD ANY MAP JSON FROM SERVER
window.loadPredefinedMap = function (url) {
    if (!url) return;
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("File not found on server");
            return res.json();
        })
        .then(loadedData => {
            nodes.clear();
            edges.clear();

            let columnCounters = {};
            loadedData.nodes.forEach(node => {
                if (node.x === undefined || node.y === undefined) {
                    if (node.col !== undefined) {
                        if (columnCounters[node.col] === undefined) columnCounters[node.col] = 0;
                        node.x = node.col * 220;
                        node.y = (columnCounters[node.col] * 75) + 120;
                        columnCounters[node.col]++;
                    }
                }

                if (String(node.id).startsWith("BG_")) {
                    if (node.y === 315) {
                        node.y = 415;
                    }
                    node.customColor = (node.color && node.color.background) ? node.color.background : "rgba(100, 180, 255, 0.15)";
                    node.customBorder = (node.color && node.color.border) ? node.color.border : "rgba(100, 180, 255, 0.4)";
                    node.customLabel = node.label;
                    node.customW = (node.widthConstraint && node.widthConstraint.minimum) ? node.widthConstraint.minimum : 190;
                    node.customH = (node.heightConstraint && node.heightConstraint.minimum) ? node.heightConstraint.minimum : 850;

                    node.shape = "text";
                    node.label = "";
                    node.color = "rgba(0,0,0,0)";
                    node.font = { size: 0 };
                    node.borderWidth = 0;
                    node.fixed = true;

                    delete node.widthConstraint;
                    delete node.heightConstraint;
                }
            });

            nodes.add(loadedData.nodes);
            edges.add(loadedData.edges);

            undoStack = [];
            redoStack = [];
            window.isIsolated = false;

            network.fit({ animation: { duration: 1000, easingFunction: "easeInOutQuad" } });

            setTimeout(() => {
                saveState();
            }, 200);
        })
        .catch(error => {
            console.error("Error loading JSON file:", error);
            if (url === "default.json") {
                document.getElementById("course-network").innerHTML =
                    "<div style=\"padding: 20px; color: #ff5555;\"><b>Error: Could not load default.json.</b><br>Make sure your local web server is running.</div>";
            } else {
                alert("Could not load the selected map. Please make sure " + url + " exists in your directory.");
            }
        });
};

// LOAD THE DEFAULT FILE ON STARTUP
window.loadPredefinedMap("maps/default.json");

window.openCourseModal = function (mode, x, y, nodeId = null) {
    let modal = document.getElementById("course-modal");
    if (!modal) {
        let code = prompt("Enter Course Code:");
        if (code) {
            let name = prompt("Enter Course Name (optional):");
            let credits = prompt("Enter Credits:", "0.5");
            nodes.add({
                id: "custom_" + Math.random().toString(36).substring(7),
                label: code + (name ? "\n" + name : ""),
                credits: parseFloat(credits) || 0.5,
                color: "#ffffff",
                shape: "box",
                x: x,
                y: y
            });
            saveState();
        }
        return;
    }

    modalState.mode = mode;
    modalState.x = x;
    modalState.y = y;
    modalState.nodeId = nodeId;

    document.getElementById("context-menu").style.display = "none";

    if (mode === "edit" && nodeId) {
        document.getElementById("modal-title").innerText = "Edit Course";
        let node = nodes.get(nodeId);
        let parts = node.label.split("\n");
        document.getElementById("modal-code").value = parts[0] || "";
        document.getElementById("modal-name").value = parts[1] || "";
        document.getElementById("modal-credits").value = node.credits !== undefined ? node.credits : 0.5;
    } else {
        document.getElementById("modal-title").innerText = "Add Course";
        document.getElementById("modal-code").value = "";
        document.getElementById("modal-name").value = "";
        document.getElementById("modal-credits").value = "0.5";
    }

    modal.style.display = "flex";
    document.getElementById("modal-code").focus();
};

window.closeCourseModal = function () {
    let modal = document.getElementById("course-modal");
    if (modal) modal.style.display = "none";
};

window.saveCourseModal = function () {
    let code = document.getElementById("modal-code").value.trim();
    let name = document.getElementById("modal-name").value.trim();
    let credits = parseFloat(document.getElementById("modal-credits").value) || 0;

    if (!code) {
        alert("Course Code is required.");
        return;
    }

    let newLabel = code + (name ? "\n" + name : "");

    if (modalState.mode === "add") {
        nodes.add({
            id: "custom_" + Math.random().toString(36).substring(7),
            label: newLabel,
            credits: credits,
            color: "#ffffff",
            shape: "box",
            x: modalState.x,
            y: modalState.y
        });
    } else if (modalState.mode === "edit" && modalState.nodeId) {
        nodes.update({
            id: modalState.nodeId,
            label: newLabel,
            credits: credits
        });
    }

    saveState();
    closeCourseModal();
};

window.clearIsolation = function () {
    if (!window.isIsolated) return;

    let updatesNodes = [];
    nodes.forEach(n => {
        if (!String(n.id).startsWith("BG_")) {
            updatesNodes.push({ id: n.id, opacity: 1 });
        }
    });
    nodes.update(updatesNodes);

    let updatesEdges = [];
    edges.forEach(e => {
        updatesEdges.push({ id: e.id, color: { color: "#aaaaaa", opacity: 1 } });
    });
    edges.update(updatesEdges);

    window.isIsolated = false;
};

window.isolateNode = function (startNodeId) {
    document.getElementById("context-menu").style.display = "none";
    window.clearIsolation();

    let downstream = new Set();
    let stack = [startNodeId];
    downstream.add(startNodeId);

    let allEdges = edges.get();

    while (stack.length > 0) {
        let current = stack.pop();
        allEdges.forEach(edge => {
            if (edge.from === current && !downstream.has(edge.to)) {
                downstream.add(edge.to);
                stack.push(edge.to);
            }
        });
    }

    let downstreamArr = Array.from(downstream);
    let downstreamEdges = [];

    allEdges.forEach(edge => {
        if (downstreamArr.includes(edge.from) && downstreamArr.includes(edge.to)) {
            downstreamEdges.push(edge.id);
        }
    });

    let updatesNodes = [];
    nodes.forEach(n => {
        if (!String(n.id).startsWith("BG_")) {
            if (downstreamArr.includes(n.id)) {
                updatesNodes.push({ id: n.id, opacity: 1 });
            } else {
                updatesNodes.push({ id: n.id, opacity: 0.15 });
            }
        }
    });
    nodes.update(updatesNodes);

    let updatesEdges = [];
    edges.forEach(e => {
        if (downstreamEdges.includes(e.id)) {
            updatesEdges.push({ id: e.id, color: { color: "#aaaaaa", opacity: 1 } });
        } else {
            updatesEdges.push({ id: e.id, color: { color: "#aaaaaa", opacity: 0.1 } });
        }
    });
    edges.update(updatesEdges);

    window.isIsolated = true;
};

document.getElementById("node-color-picker").addEventListener("change", function (e) {
    if (window.targetColorNode) {
        let hex = e.target.value;
        let bgColor = hex;
        let borderColor = "#999999";

        if (String(window.targetColorNode).startsWith("COMMENT_")) {
            let r = parseInt(hex.slice(1, 3), 16);
            let g = parseInt(hex.slice(3, 5), 16);
            let b = parseInt(hex.slice(5, 7), 16);
            bgColor = `rgba(${r}, ${g}, ${b}, 0.15)`;
            borderColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
        }

        nodes.update({
            id: window.targetColorNode,
            color: { background: bgColor, border: borderColor }
        });
        saveState();
    }
});

window.editComment = function (nodeId) {
    if (nodeId === "COMMENT_Stats") {
        alert("This is an auto-generated statistics block and cannot be manually edited.");
        document.getElementById("context-menu").style.display = "none";
        return;
    }
    document.getElementById("context-menu").style.display = "none";
    let node = nodes.get(nodeId);
    let currentLabel = node.label.replace(/\n/g, "\\n");
    let newLabel = prompt("Enter text (use \\n for new lines):", currentLabel);
    if (newLabel !== null) {
        nodes.update({ id: nodeId, label: newLabel.replace(/\\n/g, "\n") });
        saveState();
    }
};

window.deleteNode = function (nodeId) {
    document.getElementById("context-menu").style.display = "none";
    window.clearIsolation();
    nodes.remove(nodeId);
    network.unselectAll();
    saveState();
};

window.deleteEdge = function (edgeId) {
    document.getElementById("context-menu").style.display = "none";
    window.clearIsolation();
    edges.remove(edgeId);
    network.unselectAll();
    saveState();
};

window.addCommentAt = function (x, y) {
    document.getElementById("context-menu").style.display = "none";
    let text = prompt("Enter comment text (use \\n for new lines):");
    if (text !== null && text.trim() !== "") {
        nodes.add({
            id: "COMMENT_" + Math.random().toString(36).substring(7),
            label: text.replace(/\\n/g, "\n"),
            color: { background: "rgba(204, 204, 204, 0.15)", border: "rgba(204, 204, 204, 0.4)" },
            font: { color: "#dddddd", align: "left", face: "Arial", size: 14 },
            shape: "box",
            x: x,
            y: y
        });
        saveState();
    }
};

window.addStatsAt = function (x, y) {
    document.getElementById("context-menu").style.display = "none";
    if (nodes.get("COMMENT_Stats")) {
        alert("A statistics block already exists on the map.");
        return;
    }
    nodes.add({
        id: "COMMENT_Stats",
        label: "COURSE STATISTICS\n\nCalculating...",
        color: { background: "rgba(204, 204, 204, 0.15)", border: "rgba(204, 204, 204, 0.4)" },
        font: { color: "#dddddd", align: "left", face: "Arial", "size": 14 },
        shape: "box",
        x: x,
        y: y,
        widthConstraint: { minimum: 250 }
    });
    saveState();
};

window.startAddEdgeMode = function (nodeId, pointerCanvas) {
    document.getElementById("context-menu").style.display = "none";
    isAddingPrereq = true;
    prereqSourceNode = nodeId;
    prereqCurrentPointer = pointerCanvas || network.getPositions([nodeId])[nodeId];
    network.redraw();
};

window.saveJSON = async function (e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    let currentPositions = network.getPositions();

    let exportNodes = nodes.get().map(node => {
        let n = JSON.parse(JSON.stringify(node));

        if (currentPositions[n.id]) {
            n.x = currentPositions[n.id].x;
            n.y = currentPositions[n.id].y;
        }

        delete n.opacity;

        if (String(n.id).startsWith("BG_")) {
            n.color = { background: n.customColor, border: n.customBorder };
            n.label = n.customLabel;
            n.shape = "box";
            n.widthConstraint = { minimum: n.customW };
            n.heightConstraint = { minimum: n.customH, valign: "top" };
            n.font = { size: 22, color: "#777777", face: "Arial" };
            delete n.customColor;
            delete n.customBorder;
            delete n.customLabel;
            delete n.customW;
            delete n.customH;
        }
        return n;
    });

    let exportEdges = edges.get().map(edge => {
        let e = JSON.parse(JSON.stringify(edge));
        if (e.color && e.color.opacity !== undefined) {
            delete e.color.opacity;
        }
        return e;
    });

    let dataToSave = { nodes: exportNodes, edges: exportEdges };
    let jsonStr = JSON.stringify(dataToSave, null, 2);

    try {
        if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'MyCustomCourseMap.json',
                types: [{
                    description: 'JSON File',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(jsonStr);
            await writable.close();
            return;
        }
    } catch (err) {
        if (err.name === 'AbortError') return;
        console.error("File System API fallback triggered:", err);
    }

    let blob = new Blob([jsonStr], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "MyCustomCourseMap.json";
    a.target = "_blank";

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 1000);
};

function loadCustomJSON(event) {
    let file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = function (e) {
        try {
            let loadedData = JSON.parse(e.target.result);
            nodes.clear();
            edges.clear();

            loadedData.nodes.forEach(n => {
                if (String(n.id).startsWith("BG_")) {
                    n.customColor = (n.color && n.color.background) ? n.color.background : "rgba(100, 180, 255, 0.15)";
                    n.customBorder = (n.color && n.color.border) ? n.color.border : "rgba(100, 180, 255, 0.4)";
                    n.customLabel = n.label;
                    n.customW = (n.widthConstraint && n.widthConstraint.minimum) ? n.widthConstraint.minimum : 190;
                    n.customH = (n.heightConstraint && n.heightConstraint.minimum) ? n.heightConstraint.minimum : 850;

                    n.shape = "text";
                    n.label = "";
                    n.color = "rgba(0,0,0,0)";
                    n.font = { size: 0 };
                    n.borderWidth = 0;
                    n.fixed = true;

                    delete n.widthConstraint;
                    delete n.heightConstraint;
                }
            });

            nodes.add(loadedData.nodes);
            edges.add(loadedData.edges);
            document.getElementById("load-file").value = "";

            undoStack = [];
            redoStack = [];
            initialLoadComplete = false;
            window.isIsolated = false;

            setTimeout(saveState, 150);

        } catch (error) {
            alert("Error loading JSON file.");
        }
    };
    reader.readAsText(file);
}