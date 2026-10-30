

/* =====================================================
   TYPING PASSAGES
===================================================== */

const passages = {

general:
`Typing is an important computer skill for students and professionals. Regular typing practice improves speed, accuracy, concentration, confidence, and productivity. A good typist should focus on accuracy first and gradually increase typing speed through consistent daily practice.`,

office:
`Office employees regularly type letters, reports, emails, invoices, forms, customer records, spreadsheets, and business documents. Fast and accurate typing helps complete office work efficiently and reduces mistakes in important documents.`,

computer:
`Computers are used in education, business, banking, communication, government services, and many other areas. Strong keyboard skills make computer work easier and help users complete digital tasks quickly and accurately.`,

business:
`Professional business communication requires accuracy, speed, and attention to detail. Employees prepare emails, reports, customer records, presentations, invoices, and other documents. Good typing skills save time and improve workplace productivity.`
};


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let content = passages.general;

let duration = 60;

let timeLeft = 60;

let timer = null;

let started = false;

let paused = false;

let startTimestamp = null;

let elapsed = 0;

let correct = 0;

let errors = 0;

let typed = 0;

let keyErrors = 0;


/* =====================================================
   DOM
===================================================== */

const display =
document.getElementById("textDisplay");

const input =
document.getElementById("typingInput");

const customText =
document.getElementById("customText");


/* =====================================================
   LOAD TEXT
===================================================== */

function loadContent(text){

    content = text.trim();

    display.innerHTML = "";

    [...content].forEach(function(character){

        const span =
        document.createElement("span");

        span.className = "char";

        span.textContent = character;

        display.appendChild(span);

    });


    customText.value = content;


    document.getElementById("totalChars")
    .textContent = content.length;


    document.getElementById("wordCount")
    .textContent =
    countWords(content);


    updateExpectedKey();

}


/* =====================================================
   COUNT ACTUAL WORDS
===================================================== */

function countWords(text){

    if(!text.trim()){
        return 0;
    }

    return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;

}


/* =====================================================
   COUNT COMPLETED WORDS
===================================================== */

function getCompletedWords(){

    const typedText =
    input.value;

    if(!typedText.trim()){
        return 0;
    }


    /*
       A word becomes completed
       when it is followed by a space
       or when typing reaches the end.
    */

    const parts =
    typedText.split(/\s+/);

    let completed = 0;


    for(let i = 0; i < parts.length; i++){

        if(parts[i].length === 0){
            continue;
        }

        const typedWord =
        parts[i];

        const originalWords =
        content.trim()
        .split(/\s+/);


        const wordIndex =
        completed;


        if(
            originalWords[wordIndex] &&
            typedWord ===
            originalWords[wordIndex]
        ){

            completed++;

        }

    }


    return completed;

}


/* =====================================================
   COMPLETED CORRECT WORDS
===================================================== */

function getCorrectWords(){

    const typedText =
    input.value;


    const typedWords =
    typedText
    .trim()
    .split(/\s+/)
    .filter(Boolean);


    const originalWords =
    content
    .trim()
    .split(/\s+/)
    .filter(Boolean);


    let correctWords = 0;


    typedWords.forEach(function(word,index){

        if(
            originalWords[index] &&
            word === originalWords[index]
        ){

            correctWords++;

        }

    });


    return correctWords;

}


/* =====================================================
   TIME FORMAT
===================================================== */

function formatTime(seconds){

    const min =
    Math.floor(seconds / 60)
    .toString()
    .padStart(2,"0");


    const sec =
    Math.floor(seconds % 60)
    .toString()
    .padStart(2,"0");


    return min + ":" + sec;

}


/* =====================================================
   CALCULATE WPM
===================================================== */

function calculate(){

    const minutes =
    Math.max(
        elapsed / 60,
        1 / 60
    );


    /*
       Gross WPM
       Based on actual typed words.
    */

    const grossWords =
    countWords(input.value);


    const gross =
    Math.round(
        grossWords / minutes
    );


    /*
       Net WPM
       Based on correctly typed words.
    */

    const correctWords =
    getCorrectWords();


    const net =
    Math.round(
        correctWords / minutes
    );


    /*
       Accuracy
    */

    const accuracy =
    typed > 0
    ? Math.round(
        (correct / typed) * 100
      )
    : 100;


    return {

        gross:
        Math.max(0,gross),

        net:
        Math.max(0,net),

        accuracy:

        Math.min(
            100,
            Math.max(
                0,
                accuracy
            )
        ),

        grossWords:
        grossWords,

        correctWords:
        correctWords

    };

}


/* =====================================================
   UPDATE LIVE STATS
===================================================== */

function updateStats(){

    const result =
    calculate();


    document.getElementById("netWpm")
    .textContent =
    result.net;


    document.getElementById("grossWpm")
    .textContent =
    result.gross;


    document.getElementById("accuracy")
    .textContent =
    result.accuracy + "%";


    document.getElementById("errors")
    .textContent =
    errors;


    document.getElementById("totalTyped")
    .textContent =
    typed;


    document.getElementById("charCount")
    .textContent =
    input.value.length;


    document.getElementById("correctChars")
    .textContent =
    correct;


    document.getElementById("infoTotal")
    .textContent =
    typed;


    document.getElementById("infoAccuracy")
    .textContent =
    result.accuracy + "%";


    document.getElementById("keyErrors")
    .textContent =
    keyErrors;


    const progress =
    content.length
    ? Math.min(
        (
            input.value.length /
            content.length
        ) * 100,
        100
      )
    : 0;


    document.getElementById("progressBar")
    .style.width =
    progress + "%";


    document.getElementById("progressText")
    .textContent =
    Math.round(progress) + "%";

}


/* =====================================================
   RENDER TYPING
===================================================== */

function renderTyping(){

    const value =
    input.value;


    const chars =
    display.children;


    correct = 0;

    errors = 0;

    typed = value.length;


    [...chars].forEach(
    function(span,index){

        span.classList.remove(
            "correct",
            "wrong",
            "current",
            "space-wrong"
        );


        if(index < value.length){

            if(
                value[index] ===
                span.textContent
            ){

                span.classList.add(
                    "correct"
                );

                correct++;

            }
            else{

                span.classList.add(
                    "wrong"
                );

                if(
                    span.textContent === " "
                ){

                    span.classList.add(
                        "space-wrong"
                    );

                }

                errors++;

            }

        }


        if(
            index ===
            value.length
        ){

            span.classList.add(
                "current"
            );

        }

    });


    updateExpectedKey();

    updateStats();


    if(
        value.length >=
        content.length
    ){

        finishTest();

    }

}


/* =====================================================
   EXPECTED KEY
===================================================== */

function updateExpectedKey(){

    document
    .querySelectorAll(".key")
    .forEach(function(key){

        key.classList.remove(
            "expected"
        );

    });


    const index =
    input.value.length;


    const expected =
    content[index]
    ?.toLowerCase();


    const nextKey =
    document.getElementById(
        "nextKey"
    );


    if(!expected){

        nextKey.textContent =
        "—";

        return;

    }


    nextKey.textContent =
    expected === " "
    ? "SPACE"
    : expected.toUpperCase();


    const key =
    document.querySelector(
        `.key[data-key="${CSS.escape(expected)}"]`
    );


    if(key){

        key.classList.add(
            "expected"
        );

    }

}


/* =====================================================
   STATUS
===================================================== */

function setStatus(text,type){

    document.getElementById(
        "statusText"
    ).textContent =
    text;


    document.getElementById(
        "sessionStatus"
    ).textContent =
    text;


    const dot =
    document.getElementById(
        "statusDot"
    );


    if(type === "running"){

        dot.style.background =
        "#22c55e";

    }
    else if(type === "paused"){

        dot.style.background =
        "#f59e0b";

    }
    else if(type === "completed"){

        dot.style.background =
        "#2563eb";

    }
    else{

        dot.style.background =
        "#94a3b8";

    }

}


/* =====================================================
   START TEST
===================================================== */

function startTest(){

    if(started && !paused){

        input.focus();

        return;

    }


    if(!started){

        started = true;

        paused = false;

        elapsed = 0;

        timeLeft = duration;

        startTimestamp =
        Date.now();


        timer =
        setInterval(
            timerTick,
            1000
        );

    }
    else{

        paused = false;

        startTimestamp =
        Date.now() -
        elapsed * 1000;

    }


    setStatus(
        "Running",
        "running"
    );


    document.getElementById(
        "pauseBtn"
    ).textContent =
    "⏸ Pause";


    input.focus();

}


/* =====================================================
   TIMER
===================================================== */

function timerTick(){

    if(
        !started ||
        paused
    ){

        return;

    }


    elapsed =
    (
        Date.now() -
        startTimestamp
    ) / 1000;


    timeLeft =
    Math.max(
        duration -
        Math.floor(elapsed),
        0
    );


    document.getElementById(
        "timer"
    ).textContent =
    formatTime(timeLeft);


    updateStats();


    if(timeLeft <= 0){

        finishTest();

    }

}


/* =====================================================
   INPUT EVENT
===================================================== */

input.addEventListener(
"input",
function(){

    if(paused){

        return;

    }


    if(!started){

        startTest();

    }


    renderTyping();

});


/* =====================================================
   KEY DOWN
===================================================== */

input.addEventListener(
"keydown",
function(event){

    if(paused){

        event.preventDefault();

        return;

    }


    if(event.key.length !== 1){

        return;

    }


    const pressed =
    event.key.toLowerCase();


    const expected =
    content[
        input.value.length
    ]?.toLowerCase();


    if(
        expected &&
        pressed !== expected
    ){

        keyErrors++;


        const wrongKey =
        document.querySelector(
            `.key[data-key="${CSS.escape(pressed)}"]`
        );


        if(wrongKey){

            wrongKey.classList.add(
                "error"
            );


            setTimeout(
            function(){

                wrongKey.classList.remove(
                    "error"
                );

            },
            220);

        }

    }


    const key =
    document.querySelector(
        `.key[data-key="${CSS.escape(pressed)}"]`
    );


    if(key){

        key.classList.add(
            "active"
        );

    }


    updateStats();

});


/* =====================================================
   KEY UP
===================================================== */

input.addEventListener(
"keyup",
function(event){

    if(event.key.length !== 1){

        return;

    }


    const pressed =
    event.key.toLowerCase();


    const key =
    document.querySelector(
        `.key[data-key="${CSS.escape(pressed)}"]`
    );


    if(key){

        key.classList.remove(
            "active"
        );

    }

});


/* =====================================================
   START BUTTON
===================================================== */

document
.getElementById("startBtn")
.addEventListener(
"click",
startTest
);


/* =====================================================
   PAUSE BUTTON
===================================================== */

document
.getElementById("pauseBtn")
.addEventListener(
"click",
function(){

    if(!started){

        return;

    }


    if(!paused){

        paused = true;

        setStatus(
            "Paused",
            "paused"
        );


        this.textContent =
        "▶ Resume";

    }
    else{

        paused = false;

        startTimestamp =
        Date.now() -
        elapsed * 1000;


        setStatus(
            "Running",
            "running"
        );


        this.textContent =
        "⏸ Pause";


        input.focus();

    }

});


/* =====================================================
   RESET
===================================================== */

function resetTest(){

    clearInterval(timer);


    started = false;

    paused = false;

    elapsed = 0;

    duration =
    Number(
        document.getElementById(
            "durationSelect"
        ).value
    );


    timeLeft =
    duration;


    correct = 0;

    errors = 0;

    typed = 0;

    keyErrors = 0;


    input.value = "";


    document.getElementById(
        "pauseBtn"
    ).textContent =
    "⏸ Pause";


    document.getElementById(
        "timer"
    ).textContent =
    formatTime(timeLeft);


    setStatus(
        "Ready",
        "ready"
    );


    loadContent(content);

    updateStats();

}


/* =====================================================
   RESTART
===================================================== */

document
.getElementById("restartBtn")
.addEventListener(
"click",
resetTest
);


/* =====================================================
   DURATION CHANGE
===================================================== */

document
.getElementById("durationSelect")
.addEventListener(
"change",
function(){

    resetTest();

});


/* =====================================================
   PASSAGE CHANGE
===================================================== */

document
.getElementById("passageSelect")
.addEventListener(
"change",
function(){

    content =
    passages[this.value];


    resetTest();

});


/* =====================================================
   APPLY CUSTOM CONTENT
===================================================== */

document
.getElementById("applyText")
.addEventListener(
"click",
function(){

    const value =
    customText.value.trim();


    if(!value){

        alert(
            "Please enter typing content."
        );

        return;

    }


    content = value;

    resetTest();

});


/* =====================================================
   FINISH BUTTON
===================================================== */

document
.getElementById("finishBtn")
.addEventListener(
"click",
function(){

    if(started){

        finishTest();

    }

});


/* =====================================================
   FINISH TEST
===================================================== */

function finishTest(){

    if(!started){

        return;

    }


    if(
        startTimestamp &&
        !paused
    ){

        elapsed =
        (
            Date.now() -
            startTimestamp
        ) / 1000;

    }


    clearInterval(timer);


    started = false;


    const result =
    calculate();


    document.getElementById(
        "finalNet"
    ).textContent =
    result.net;


    document.getElementById(
        "finalGross"
    ).textContent =
    result.gross;


    document.getElementById(
        "finalAccuracy"
    ).textContent =
    result.accuracy + "%";


    document.getElementById(
        "finalErrors"
    ).textContent =
    errors;


    document.getElementById(
        "finalCorrect"
    ).textContent =
    correct;


    document.getElementById(
        "finalTyped"
    ).textContent =
    typed;


    document.getElementById(
        "finalTime"
    ).textContent =
    formatTime(
        Math.round(elapsed)
    );


    document.getElementById(
        "finalWords"
    ).textContent =
    result.grossWords;


    let message =
    "Keep practicing to improve your typing performance.";


    if(
        result.net >= 60 &&
        result.accuracy >= 98
    ){

        message =
        "Excellent! Your typing performance is professional.";

    }
    else if(
        result.net >= 45 &&
        result.accuracy >= 95
    ){

        message =
        "Very good! Your speed and accuracy are strong.";

    }
    else if(
        result.accuracy >= 90
    ){

        message =
        "Good accuracy. Continue practicing to increase your speed.";

    }


    document.getElementById(
        "resultMessage"
    ).textContent =
    message;


    setStatus(
        "Completed",
        "completed"
    );


    document.getElementById(
        "resultModal"
    ).classList.add(
        "show"
    );

}


/* =====================================================
   CLOSE RESULT
===================================================== */

document
.getElementById("closeResult")
.addEventListener(
"click",
function(){

    document.getElementById(
        "resultModal"
    ).classList.remove(
        "show"
    );

});


/* =====================================================
   TRY AGAIN
===================================================== */

document
.getElementById("tryAgain")
.addEventListener(
"click",
function(){

    document.getElementById(
        "resultModal"
    ).classList.remove(
        "show"
    );


    resetTest();

    input.focus();

});


/* =====================================================
   ESCAPE MODAL
===================================================== */

document.addEventListener(
"keydown",
function(event){

    if(event.key === "Escape"){

        document.getElementById(
            "resultModal"
        ).classList.remove(
            "show"
        );

    }

});


/* =====================================================
   INITIALIZE
===================================================== */

loadContent(content);

duration = 60;

timeLeft = 60;

document.getElementById(
    "timer"
).textContent =
formatTime(timeLeft);

updateStats();

updateExpectedKey();

