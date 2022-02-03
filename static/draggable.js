function draggable(items) {
    items.forEach(i => {
        let wrap = "#" + i + "-w";
        let head = "#" + i + "-m";
        
        let wrapper = document.querySelector(wrap);
        let header = wrapper.querySelector(head);

        let previousTouch;

        function onDrag({movementX, movementY}) {
            let getStyle = window.getComputedStyle(wrapper);
            let leftVal = parseInt(getStyle.left);
            let topVal = parseInt(getStyle.top);
            wrapper.style.left = `${leftVal + movementX}px`;
            wrapper.style.top = `${topVal + movementY}px`;
        }

        header.addEventListener("mousedown", () => {
            header.classList.add("active");
            header.addEventListener("mousemove", onDrag);
            document.querySelectorAll(".zi").forEach(d => {
                d.classList.remove("zi");
            });

            wrapper.classList.add("zi")
        });

        header.addEventListener("touchstart", () => {
            console.log("hey")
            header.classList.add("active");
            header.addEventListener("touchmove", e => {
                const touch = e.touches[0];

                if (previousTouch) {
                    e.movementX = touch.pageX - previousTouch.pageX;
                    e.movementY = touch.pageY - previousTouch.pageY;

                    onDrag(e);
                };

                previousTouch = touch;
            });
            document.querySelectorAll(".zi").forEach(d => {
                d.classList.remove("zi");
            });

            wrapper.classList.add("zi")
        })

        document.addEventListener("mouseup", () => {
            header.classList.remove("active");
            header.removeEventListener("mousemove", onDrag);
        });

        document.addEventListener("touchend", () => {
            header.classList.remove("active");
            header.removeEventListener("touchmove", onDrag);
            previousTouch = null;
        });
    })
    
}

function randomStart() {
    let wrappers = document.querySelectorAll(".wrapper");
    
    wrappers[wrappers.length * Math.random() | 0].classList.add("zi");

    wrappers.forEach(w => {        
        screen.width 
        
        w.style.left = `${((screen.width / 2) - 200) + Math.random() * 275 + (Math.random() + 50)}px`;
        w.style.top = `${((screen.height / 2) - 200) + Math.random() * 275 + (Math.random() + 50)}px`;

        console.log(w.style.left, w.style.right);
    });
}