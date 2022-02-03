function loader() {
    start();
    greeting();
    commit();
    randomStart();
    draggable([
        "desc",
        "socials",
        "site"
    ]);
    logger();
}

function greeting() {
    let greetings = [
        "'Sup?",
        "Hi.",
        "Oh, hey...",
        "&#128064;",
        "<placeholder greeting>",
        "Hej.",
        "Hallo.",
        "Bonjour."
    ]

    let intro = document.querySelector("#intro");
    return intro.innerHTML = greetings[greetings.length * Math.random() | 0]
}

function commit() {
    fetch("https://api.github.com/repos/axelgrvt/axel.gg/commits/master").then(res => {
        res.json().then(r => {
            let full = r.sha;
            console.log(full)
            let cut = full.substring(0, 6);
            document.querySelector("#sha").innerHTML = "<a href=\"https://github.com/axelgrvt/axel.gg/commit/" + full + "\">" + cut + "</a>";
        });

    });
}

function unhide(e) {
    document.querySelector(e).style.visibility = "visible";
}

function start() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        document.querySelector("#site-w").style.visibility = "hidden";
        document.querySelector("#socials-hidden-button").style.display = "inline";
    }
}

function logger() {
    console.log(`
        /$$$$$$                   /$$        /$$$$$$                                                /$$    /$$             
        /$$__  $$                 | $$       /$$__  $$                                              | $$   | $$             
        | $$  \ $$/$$   /$$ /$$$$$$| $$      | $$  \__/ /$$$$$$  /$$$$$$  /$$$$$$ /$$    /$$/$$$$$$ /$$$$$$/$$$$$$   /$$$$$$ 
        | $$$$$$$|  $$ /$$//$$__  $| $$      | $$ /$$$$/$$__  $$/$$__  $$|____  $|  $$  /$$/$$__  $|_  $$_|_  $$_/  /$$__  $$
        | $$__  $$\  $$$$/| $$$$$$$| $$      | $$|_  $| $$  \__| $$$$$$$$ /$$$$$$$\  $$/$$| $$$$$$$$ | $$   | $$   | $$$$$$$$
        | $$  | $$ >$$  $$| $$_____| $$      | $$  \ $| $$     | $$_____//$$__  $$ \  $$$/| $$_____/ | $$ /$| $$ /$| $$_____/
        | $$  | $$/$$/\  $|  $$$$$$| $$      |  $$$$$$| $$     |  $$$$$$|  $$$$$$$  \  $/ |  $$$$$$$ |  $$$$|  $$$$|  $$$$$$$
        |__/  |__|__/  \__/\_______|__/       \______/|__/      \_______/\_______/   \_/   \_______/  \___/  \___/  \_______/                                                                                         
    `);
}