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
        "what up?",
        "Hello &#128075;",
        "&lpar;&#32;&ast;&#12539;&forall;&#12539;&rpar;&#12494;&#12443;",
        "Oh, hi there!",
        "[picks up phone] ... hmmm ... right ... ok ... alright ... [puts down phone]",
        "sup",
        "crud",
        "AM I STILL STUCK IN HERE",
        "CAN ANYBODY HEAR ME",
    ];

    let intro = document.querySelector("#intro");
    return intro.innerHTML = greetings[greetings.length * Math.random() | 0];
}

function commit() {
    fetch("https://api.github.com/repos/greavettey/axel.gg/commits/master").then(res => {
        res.json().then(r => {
            let full = r.sha;
            let cut = full.substring(0, 6);
            document.querySelector("#sha").innerHTML = "<a href=\"https://github.com/greavettey/axel.gg/commit/" + full + "\">" + cut + "</a>";
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
        "I'm also a rapper...",
        "My Minecraft username is <strong>grvt</strong>.",
        "Al be super cute &#129392",
        "My girlfriend is insanely awesome.",
        "I'm on a roll today.",
        "Oh yeah?",
        "I had a funny joke in here, but I removed it.",
        "Yeah, I've made a few ARGs in my day.",
        "It's my day.",
        "This website doesn't work as well on a phone.",
        "I really like <strong>Malcolm T. Liepke</strong>'s oil-on-canvas portraits.",
        "Dune II looks insane",
        "I'm so excited for Dune II",
        "Loving the <i>Rememberance of Earth's Past</i> series",
        "I'm serving as a mentor of Team 6864",
        "surrounded by a room full of winners",
        "engineers are insane",
        //"I work full time",
        "There are 1429 seconds in a day",
        "I've hid nine letters around the Carleton campus, each containing a unique set of coordinates.",
        "It <i>is</i> snowboarding time",
        "Tremblant, anyone?",
        "I love you Alice"
    ]
    
    document.querySelector("#fact").innerHTML = facts[facts.length * Math.random() | 0];
}

function logger() {
    let logs = [
        `
        /$$$$$$                   /$$        /$$$$$$                                                /$$    /$$             
        /$$__  $$                 | $$       /$$__  $$                                              | $$   | $$             
        | $$  \\ $$/$$   /$$ /$$$$$$| $$      | $$  \\__/ /$$$$$$  /$$$$$$  /$$$$$$ /$$    /$$/$$$$$$ /$$$$$$/$$$$$$   /$$$$$$ 
        | $$$$$$$|  $$ /$$//$$__  $| $$      | $$ /$$$$/$$__  $$/$$__  $$|____  $|  $$  /$$/$$__  $|_  $$_|_  $$_/  /$$__  $$
        | $$__  $$\\  $$$$/| $$$$$$$| $$      | $$|_  $| $$  \\__| $$$$$$$$ /$$$$$$$\\  $$/$$| $$$$$$$$ | $$   | $$   | $$$$$$$$
        | $$  | $$ >$$  $$| $$_____| $$      | $$  \\ $| $$     | $$_____//$$__  $$ \\  $$$/| $$_____/ | $$ /$| $$ /$| $$_____/
        | $$  | $$/$$/\\  $|  $$$$$$| $$      |  $$$$$$| $$     |  $$$$$$|  $$$$$$$  \\  $/ |  $$$$$$$ |  $$$$|  $$$$|  $$$$$$$
        |__/  |__|__/  \\__/\\_______|__/       \\______/|__/      \\_______/\_______/   \\_/   \\_______/  \\___/  \\___/  \\_______/                                                                                         
        `,
        `                                                                                                                                  
           ,---,                             ,--,             ,----..                                                      ___      ___               
          '  .' \\                          ,--.'|            /   /   \\                                                   ,--.'|_  ,--.'|_             
         /  ;    '.                        |  | :           |   :     :   __  ,-.                                        |  | :,' |  | :,'            
        :  :       \\  ,--,  ,--,           :  : '           .   |  ;. / ,' ,'/ /|                        .---.           :  : ' : :  : ' :            
        :  |   /\\   \\ |'. \\/ .\`|    ,---.  |  ' |           .   ; /--\`  '  | |' | ,---.     ,--.--.    /.  ./|  ,---.  .;__,'  /.;__,'  /     ,---.   
        |  :  ' ;.   :'  \\/  / ;   /     \\ '  | |           ;   | ;  __ |  |   ,'/     \\   /       \\ .-' . ' | /     \\ |  |   | |  |   |     /     \\  
        |  |  ;/  \\   \\  \\.' /   /    /  ||  | :           |   : |.' .''  :  / /    /  | .--.  .-. /___/ \\: |/    /  |:__,'| : :__,'| :    /    /  | 
        '  :  | \\  \\ ,' \\  ;  ;  .    ' / |'  : |__         .   | '_.' :|  | ' .    ' / |  \\__\\/: . .   \\  ' .    ' / |  '  : |__ '  : |__ .    ' / | 
        |  |  '  '--'  / \\  \\  \\ '   ;   /||  | '.'|        '   ; : \  |;  : | '   ;   /|  ," .--.; |\\   \\   '   ;   /|  |  | '.'||  | '.'|'   ;   /| 
        |  :  :      ./__;   ;  \\'   |  / |;  :    ;        '   | '/  .'|  , ; '   |  / | /  /  ,.  | \\   \\  '   |  / |  ;  :    ;;  :    ;'   |  / | 
        |  | ,'      |   :/\\  \\ ;|   :    ||  ,   /         |   :    /   ---'  |   :    |;  :   .'   \\ \\   \\ |   :    |  |  ,   / |  ,   / |   :    | 
        \`--''        \`---'  \`--\`  \\   \\  /  ---\`-'           \\   \\ .'           \\   \\  / |  ,     .-./  '---" \\   \\  /    ---\`-'   ---\`-'   \\   \\  /  
                                   \`----'                     \`---\`              \`----'   \`--\`---'             \`----'                        \`----'                                                                                                                                       
        `,
        `
           #                             #####                                                        
          # #   #    # ###### #         #     # #####  ######   ##   #    # ###### ##### ##### ###### 
         #   #   #  #  #      #         #       #    # #       #  #  #    # #        #     #   #      
        #     #   ##   #####  #         #  #### #    # #####  #    # #    # #####    #     #   #####  
        #######   ##   #      #         #     # #####  #      ###### #    # #        #     #   #      
        #     #  #  #  #      #         #     # #   #  #      #    #  #  #  #        #     #   #      
        #     # #    # ###### ######     #####  #    # ###### #    #   ##   ######   #     #   ###### 
        `,
        `
               d8888                   888       .d8888b.                                             888    888            
              d88888                   888      d88P  Y88b                                            888    888            
             d88P888                   888      888    888                                            888    888            
            d88P 888 888  888  .d88b.  888      888        888d888 .d88b.   8888b.  888  888  .d88b.  888888 888888 .d88b.  
           d88P  888 \`Y8bd8P' d8P  Y8b 888      888  88888 888P"  d8P  Y8b     "88b 888  888 d8P  Y8b 888    888   d8P  Y8b 
          d88P   888   X88K   88888888 888      888    888 888    88888888 .d888888 Y88  88P 88888888 888    888   88888888 
         d8888888888 .d8""8b. Y8b.     888      Y88b  d88P 888    Y8b.     888  888  Y8bd8P  Y8b.     Y88b.  Y88b. Y8b.     
        d88P     888 888  888  "Y8888  888       "Y8888P88 888     "Y8888  "Y888888   Y88P    "Y8888   "Y888  "Y888 "Y8888                                                                                                            
        `,
        `       
         .----------------.  .----------------.  .----------------.  .----------------.   .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
        | .--------------. || .--------------. || .--------------. || .--------------. | | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
        | |      __      | || |  ____  ____  | || |  _________   | || |   _____      | | | |    ______    | || |  _______     | || |  _________   | || |      __      | || | ____   ____  | || |  _________   | || |  _________   | || |  _________   | || |  _________   | |
        | |     /  \\     | || | |_  _||_  _| | || | |_   ___  |  | || |  |_   _|     | | | |  .' ___  |   | || | |_   __  \\    | || | |_   ___  |  | || |     /  \\     | || ||_  _| |_  _| | || | |_   ___  |  | || | |  _   _  |  | || | |  _   _  |  | || | |_   ___  |  | |
        | |    / /\\ \\    | || |   \\ \\  / /   | || |   | |_  \\_|  | || |    | |       | | | | / .'   \\_|   | || |   | |__) |   | || |   | |_  \\_|  | || |    / /\\ \\    | || |  \\ \\   / /   | || |   | |_  \\_|  | || | |_/ | | \\_|  | || | |_/ | | \\_|  | || |   | |_  \_|  | |
        | |   / ____ \\   | || |    > \`' <    | || |   |  _|  _   | || |    | |   _   | | | | | |    ____  | || |   |  __ /    | || |   |  _|  _   | || |   / ____ \\   | || |   \\ \\ / /    | || |   |  _|  _   | || |     | |      | || |     | |      | || |   |  _|  _   | |
        | | _/ /    \\ \\_ | || |  _/ /'\`\\ \\_  | || |  _| |___/ |  | || |   _| |__/ |  | | | | \\ \`.___]  _| | || |  _| |  \\ \\_  | || |  _| |___/ |  | || | _/ /    \\ \\_ | || |    \\ ' /     | || |  _| |___/ |  | || |    _| |_     | || |    _| |_     | || |  _| |___/ |  | |
        | ||____|  |____|| || | |____||____| | || | |_________|  | || |  |________|  | | | |  \`._____.'   | || | |____| |___| | || | |_________|  | || ||____|  |____|| || |     \\_/      | || | |_________|  | || |   |_____|    | || |   |_____|    | || | |_________|  | |
        | |              | || |              | || |              | || |              | | | |              | || |              | || |              | || |              | || |              | || |              | || |              | || |              | || |              | |
        | '--------------' || '--------------' || '--------------' || '--------------' | | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
         '----------------'  '----------------'  '----------------'  '----------------'   '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
        `
    ]

    console.log(logs[logs.length * Math.random() | 0]);
}