function darkMode(bypass = false) {
    let bod = document.getElementsByClassName("box")[0];

    if(bod.id.includes("darkmode")) {
        bod.id = bod.id.replace("darkmode", "");
        document.cookie = "darkmode=false";
    } else {
        bod.id = bod.id + "darkmode";
        document.cookie = "darkmode=true";
    }
}

function loadMode() {
    commit();
    console.log("\"Hit the g for dark mode\" - Axel")
    if (document.cookie.includes("darkmode=false")) {
        darkMode();
    }
}   

function commit() {
    fetch("https://api.github.com/repos/greavettey/axel.gg/commits/master").then(res => {
        res.json().then(r => {
            if(r.message) {
                document.querySelector("#sha-master").innerHTML += "000000"
            } else {
                let full = r.sha;
                let cut = full.substring(0, 6);
                document.querySelector("#sha-master").innerHTML += "<a href=\"https://github.com/greavettey/axel.gg/commit/" + full + "\">" + cut + "</a>";
            }

        });
    });
    //strange not sure why this is bugging out on release because it's correct here
    fetch("https://api.github.com/repos/greavettey/axel.gg/commits/portfolio").then(res => {
        res.json().then(r => {
            if(r.message) {
                document.querySelector("#sha-dev").innerHTML += "000000"
            } else {
                let full = r.sha;
                let cut = full.substring(0, 6);
                document.querySelector("#sha-dev").innerHTML += "<a href=\"https://github.com/greavettey/axel.gg/commit/" + full + "\">" + cut + "</a>";
            }
        });
    });
}