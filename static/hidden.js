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
    console.log("\"Hit the g for dark mode\" - Axel")
    if (document.cookie.includes("darkmode=true")) {
        darkMode();
    }
    if(!document.cookie.includes("darkmode")) {
        document.cookie = "darkmode=true";
        darkMode();
    }
}