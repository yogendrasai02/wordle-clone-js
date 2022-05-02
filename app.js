// DOM references
const wordleGrid = document.querySelector(".wordleGrid");
const youWonModal = document.querySelector("#youWonModal");
const youWonModalCloseBtn = document.querySelector("#youWonModal .closeModal");
const refreshBtns = document.querySelectorAll('.refreshBtn');
const selectLenBtns = document.querySelectorAll('.selectLenBtn');
const settingsModal = document.querySelector('#settingsModal');
const settingsModalCloseBtn = document.querySelector('#settingsModal .closeModal');
const revealAnswerBtn = document.querySelector('#revealAnswerBtn');
const settingsBtn = document.querySelector('#settingsBtn');
const helpBtn = document.querySelector('#helpBtn');
const helpModal = document.querySelector('#helpModal');
const helpModalCloseBtn = document.querySelector('#helpModal .closeModal');
const revealAnswerModal = document.querySelector('#revealAnswerModal');
const revealAnswerModalCloseBtn = document.querySelector('#revealAnswerModal .closeModal');
const showAnswerWord = document.querySelector('#showAnswerWord');
const virtualKeyboard = document.querySelector('.virtualKeyboard');

// global variables to track the status of the game
let wordLength;
const chances = 6;
let actualWord;
let rowPtr, colPtr, typedWord;
let gameOver = false;

// words list
const words = [
    { 
        wordLength: 4,
        wordList: ["more", "care", "beat", "bush", "calm", "plan", "palm", "pill", "pink", "rose", "beam", "cone", "cane", "post", "cape", "desk", "leaf", "lead", "snow", "case", "pile", "door", "pour"]
    }, 
    {
        wordLength: 5,
        wordList: ["apple", "chair", "watch", "ridge", "pitch", "mouse", "table", "index", "climb", "image", "paper", "patch", "catch", "match", "hatch", "latch", "batch", "stick", "light", "stand"]
    },
    {
        wordLength: 6,
        wordList: ["clutch", "violet", "active", "accept", "border", "cables", "galaxy", "easter", "ignore", "ladder", "remote", "laptop", "handle", "laptop", "butter", "cheese", "switch"]
    }
]; 

// function to display the wordle grid
const displayGrid = (rows, columns) => {
    wordleGrid.style.gridTemplateColumns = `repeat(${wordLength}, 70px)`;
    for(let row = 0; row < rows; row++) {
        for(let col = 0; col < columns; col++) {
            const letterDiv = document.createElement('div');
            letterDiv.classList.add('letterDiv', 'fs-xxl');
            letterDiv.setAttribute('id', `cell-${row}-${col}`);
            wordleGrid.appendChild(letterDiv);
        }
    }
};

// upon load, display the grid and keyboard
window.onload = () => {
    // if the word length is not yet selected, select a 4 letter word
    if(!localStorage.getItem('wordLength')) {
        localStorage.setItem('wordLength', '4');
    }
    // choose the length of the word
    wordLength = +localStorage.getItem('wordLength');
    displayGrid(chances, wordLength);
    // initialise
    rowPtr = colPtr = 0;
    typedWord = "";
    // pick a random word (current puzzle answer)
    for(wordsObj of words) {
        if(wordsObj.wordLength === wordLength) {
            const randInd = Math.floor(Math.random() * wordsObj.wordList.length);
            actualWord = wordsObj.wordList[randInd];
            console.log(actualWord);
            break;
        }
    }
    // add virtual keyboard
    const row1 = "qwertyuiop", row2 = "asdfghjkl", row3 = "zxcvbnm";
    const rows = [row1, row2, row3];
    for(let row of rows) {
        let len = row.length;
        const div = document.createElement("div");
        for(let i = 0; i < len; i++) {
            const elem = document.createElement('button');
            elem.classList.add('keyboardBtn');
            elem.textContent = row[i].toUpperCase();
            elem.setAttribute('value', row[i].toLowerCase());
            div.appendChild(elem);
        }
        if(row[0] === 'z') {
            // add enter and backspace
            let elem = document.createElement('button');
            elem.classList.add('keyboardBtn');
            elem.textContent = 'ENTER';
            elem.style.width = 'auto';
            elem.setAttribute('value', 'enter');
            div.appendChild(elem);
            elem = document.createElement('button');
            elem.classList.add('keyboardBtn');
            elem.textContent = 'BACK';
            elem.style.width = 'auto';
            elem.setAttribute('value', 'backspace');
            div.appendChild(elem);
        }
        virtualKeyboard.appendChild(div);
    }
};

// function to check if the typed word is the answer or not
const checkWord = () => {
    if(actualWord === typedWord) {
        console.log("Guessed it correctly");
        gameOver = true;
        // display the you won modal
        youWonModal.style.display = "flex";
        youWonModal.style.justifyContent = "center";
        youWonModal.style.alignItems = "center";
    } else {
        console.log("Wrong guess");
    }
    // color as per convention
    for(let col = 0; col < wordLength; col++) {
        const elem = document.querySelector(`#cell-${rowPtr}-${col}`);
        if(actualWord[col] === typedWord[col]) {
            // add 'presentInPlace' class
            elem.classList.remove('notPresent');
            elem.classList.remove('presentOutOfPlace');
            elem.classList.add('presentInPlace');
        } else if(!actualWord.includes(typedWord[col])) {
            // add 'notPresent' class
            elem.classList.remove('presentOutOfPlace');
            elem.classList.remove('presentInPlace');
            elem.classList.add('notPresent');
        } else {
            // add 'presentOutofPlace' class
            elem.classList.remove('notPresent');
            elem.classList.remove('presentInPlace');
            elem.classList.add('presentOutOfPlace');
        }
    }
    // move row pointer to next row, set col ptr to 0th col, typedWord become empty
    rowPtr++;
    colPtr = 0;
    typedWord = "";
    if(rowPtr === chances && gameOver == false) {
        gameOver = true;
        // show the better luck next time modal
        revealAnswerModal.style.display = "flex";
        revealAnswerModal.style.justifyContent = "center";
        revealAnswerModal.style.alignItems = "center";
        showAnswerWord.innerHTML = actualWord.toUpperCase();
    }
};

// function to delete one letter, from the DOM and string
const deleteOneLetter = () => {
    const targetDiv = document.querySelector(`#cell-${rowPtr}-${colPtr}`);
    targetDiv.classList.remove('letterTyped');
    targetDiv.classList.add('letterNotTyped');
    targetDiv.innerHTML = '';
    // remove the deleted character (last character)
    typedWord = typedWord.slice(0, -1);
};

// function to add one letter, from the DOM and string
const addOneLetter = (letter) => {
    const targetDiv = document.querySelector(`#cell-${rowPtr}-${colPtr}`);
    targetDiv.innerHTML = letter.toUpperCase();
    targetDiv.classList.add('letterTyped');
    targetDiv.classList.remove('letterNotTyped');
    // add the letter at the end of string
    typedWord += letter;
    // move to next column
    colPtr++;
};

// process the input letter and handle it appropriately
const processInputLetter = (inputLetter) => {
    if(inputLetter === "enter") {
        if(colPtr === wordLength) {
            checkWord();
        } else {
            console.log("Incomplete word");
        }
        return;
    }
    if(inputLetter === "backspace") {
        if(colPtr > 0) {
            // move the colPtr to one step back (delete that letter)
            colPtr--;
            deleteOneLetter();
        } else {
            console.log("Empty word");
        }
        return;
    }
    if(typedWord.length === wordLength) {
        console.log("Press enter");
        return;
    }
    const pattern = /[a-z]/;
    if(!pattern.test(inputLetter)) {
        // invalid input key, do nothing
        console.log("Invalid input key");
        return;
    }
    addOneLetter(inputLetter);
};

let alphabets = [];
for(let i = 97; i <= 122; i++) alphabets.push(String.fromCharCode(i));
const validKeys = ["enter", "backspace", ...alphabets];

// listen to the keyboard event
document.addEventListener('keyup', event => {
    event.stopPropagation();
    if(gameOver === false && validKeys.indexOf(event.key.toLowerCase()) !== -1) {
        const enteredLetter = event.key.toLowerCase();
        processInputLetter(enteredLetter);
        console.log("Ptrs: ", rowPtr, colPtr);
        // console.log(typedWord);
        if(gameOver) {
            console.log("Game over");
            // display the 'you won' modal

        }
    }
});

// close the 'youWon' modal on clicking the close button
youWonModalCloseBtn.addEventListener('click', () => {
    youWonModal.style.display = "none";
});

// close the settings modal on clicking the close button
settingsModalCloseBtn.addEventListener('click', () => {
    settingsModal.style.display = "none";
});

// on clicking the settings button, show the settings modal
settingsBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    settingsModal.style.display = "flex";
    settingsModal.style.justifyContent = "center";
    settingsModal.style.alignItems = "center";
});

// on clicking the reveal answer button, show the reveal answer modal
revealAnswerBtn.addEventListener('click', event => {
    event.stopPropagation();
    revealAnswerModal.style.display = "flex";
    revealAnswerModal.style.justifyContent = "center";
    revealAnswerModal.style.alignItems = "center";
    showAnswerWord.innerHTML = actualWord.toUpperCase();
});

// when clicked outside any modal, hide it
window.onclick = () => {
    youWonModal.style.display = "none";
    settingsModal.style.display = "none";
    revealAnswerModal.style.display = "none";
    showAnswerWord.innerHTML = '';
};

// when clicked on the 'Try again' button, refresh the page to get a new puzzle
refreshBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        location.reload();
    });
});

// on selecting the word length, change the wordLength in local storage and refresh
selectLenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        localStorage.setItem('wordLength', btn.value);
        location.reload();
    });
});

// when clicked on help btn display the help modal
helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    helpModal.style.display = 'flex';
    helpModal.style.justifyContent = 'center';
    helpModal.style.alignItems = 'center';
});

// when clicked on close bt, close the help modal
helpModalCloseBtn.addEventListener('click', () => {
    helpModal.style.display = 'none';
});

// react to the input from the virtual keyboard
virtualKeyboard.addEventListener('click', e => {
    e.stopPropagation();
    const key = e.target.getAttribute('value');
    console.log(key);
    if(gameOver === false && validKeys.indexOf(key) !== -1) {
        processInputLetter(key);
        console.log("Ptrs: ", rowPtr, colPtr);
        // console.log(typedWord);
        if(gameOver) {
            console.log("Game over");
        }
    }
});