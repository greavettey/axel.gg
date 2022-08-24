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