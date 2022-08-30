function loader() {
    greeting();
    commit();
    getAge();
    fact();
    draggable([
        "desc",
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
        "Bonjour.",
        "Greetings",
        "Greetings, human.",
        "Greetings, fellow human.",
        "&#128075",
        "Hello &#128075;",
        "( *・∀・)ノ゛",
        "Oh, hi there!",
        "[picks up phone] ... hmmm ... right ... ok ... alright ... [puts down phone]"
    ];

    let intro = document.querySelector("#intro");
    return intro.innerHTML = greetings[greetings.length * Math.random() | 0];
}

function commit() {
    fetch("https://api.github.com/repos/axelgrvt/axel.gg/commits/master").then(res => {
        res.json().then(r => {
            let full = r.sha;
            let cut = full.substring(0, 6);
            document.querySelector("#sha").innerHTML = "<a href=\"https://github.com/axelgrvt/axel.gg/commit/" + full + "\">" + cut + "</a>";
        });
    });
}

function getAge() {
    document.querySelector("#age").innerHTML = Math.floor((new Date() - new Date("2004-12-12")) / 1000 / 60 / 60 / 24 / 365);
}

async function fact() {
    let facts = [
        "I know <strong>JavaScript</strong>, <strong>Java</strong>, <strong>Python</strong>, <strong>PERL</strong>, <strong>SQL</strong>, <strong>HTML</strong>, <strong>CSS</strong>, and <strong>Swift</strong>.",
        "I love <strong>board games</strong> and <strong>pen & paper RPGS</strong>.",
        "I like to <strong>collect cards and dice</strong>.",
        "I live in <strong>Ontario, Canada</strong>.",
        "I am in your walls.",
        "I am rapidly approaching your current location.",
        "I am a human.",
        "<a href='https://www.goodreads.com/book/show/18713259-worm'>WORM by Wildbow</a> is my favourite book.",
        "I'm <strong>red-green colourblind</strong>.",
        "I'm considering studying <strong>architectural design</strong> at <strong>uWaterloo</strong>.",
        "I'm also a rapper...",
        "That new DJ Khaled album is kinda heat.",
        "New JID goes hard",
        "My Minecraft username is <strong>grvt</strong>.",
        "Al be super cute &#129392",
        "My girlfriend is insanely awesome.",
        "I'm on a roll today.",
        "Oh yeah?",
        "I had a funny joke in here, but I removed it.",
        "Yeah, I've made a few ARGs in my day.",
        "It's my day.",
        "I'm tempted to turn this into a full web-app but I'm not sure what the point would be.",
        "I really like <strong>Malcolm T. Liepke</strong>'s oil-on-canvas portraits.",
        "Jordan Peele's \"Nope\" was really mid."
    ]
    
    document.querySelector("#fact").innerHTML = facts[facts.length * Math.random() | 0];
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