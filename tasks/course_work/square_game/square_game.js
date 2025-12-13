const LEVELS = {
    easy: {
        name: 'Легкий',
        size: 3,
        colors: 2,
        squares: 6,
        minDifferences: 3
    },
    medium: {
        name: 'Средний',
        size: 4,
        colors: 3,
        squares: 12,
        minDifferences: 4
    },
    hard: {
        name: 'Сложный',
        size: 5,
        colors: 4,
        squares: 16,
        minDifferences: 5
    },
    expert: {
        name: 'Эксперт',
        size: 6,
        colors: 4,
        squares: 20,
        minDifferences: 6
    }
};

let currentLevel = 'easy';
let gameStarted = false;
let startTime = null;
let timerInterval = null;
let wrongAttempts = 0;
let rotationCount = 0;
let correctSquare = null;

document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.game-area')) {

        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('level') || 'easy';

        currentLevel = level;

        initModals();
        startNewGame();
    }
});

function generateRandomSquare(size, numColors) {
    const square = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            let rand = Math.random() * numColors;
            console.log(rand, Math.floor(rand));
            row.push(Math.floor(Math.random() * numColors));
        }
        square.push(row);
    }
    return square;
}

function hasAtLeastTwoColors(square) {
    if (!square || square.length === 0) return false;

    const size = square.length;
    const firstColor = square[0][0];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (i === 0 && j === 0) continue;

            if (square[i][j] !== firstColor) {
                return true;
            }
        }
    }

    return false;
}

function getAllRotateTransformations(square) {
    const transformations = [];

    for (let rotation = 0; rotation < 4; rotation++) {
        let rotated = square;
        for (let r = 0; r < rotation; r++) {
            rotated = rotate90(rotated);
        }
        transformations.push(rotated);
    }

    return transformations;
}

function getAllTransformations(square) {
    const transformations = [];

    for (let rotation = 0; rotation < 4; rotation++) {
        let rotated = square;
        for (let r = 0; r < rotation; r++) {
            rotated = rotate90(rotated);
        }
        transformations.push(rotated);

        let reflected = mirror(rotated);
        transformations.push(reflected);
    }

    return transformations;
}

function rotate90(matrix) {
    const size = matrix.length;
    const result = Array.from({ length: size }, () => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            result[j][size - 1 - i] = matrix[i][j];
        }
    }

    return result;
}

function mirror(matrix) {
    const size = matrix.length;
    const result = Array.from({ length: size }, () => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            result[i][size - 1 - j] = matrix[i][j];
        }
    }

    return result;
}

function squaresEqual(square1, square2) {
    if (square1.length !== square2.length) return false;

    const size = square1.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (square1[i][j] !== square2[i][j]) {
                return false;
            }
        }
    }
    return true;
}

function isMatch(square1, square2) {
    const transformations = getAllRotateTransformations(square2);

    for (const transformation of transformations) {
        if (squaresEqual(square1, transformation)) {
            return true;
        }
    }
    return false;
}

function countDifferences(square1, square2) {
    const size = square1.length;
    let differences = 0;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (square1[i][j] !== square2[i][j]) {
                differences++;
            }
        }
    }
    return differences;
}

function generateSquareWithExactDifferences(baseSquare, exactDifferences) {
    const size = baseSquare.length;
    const numColors = LEVELS[currentLevel].colors;

    const newSquare = [];
    for (let i = 0; i < size; i++) {
        newSquare.push([...baseSquare[i]]);
    }

    const positions = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            positions.push({ i, j });
        }
    }

    shuffleArray(positions);

    for (let d = 0; d < exactDifferences; d++) {
        const { i, j } = positions[d];

        let newColor;
        do {
            newColor = Math.floor(Math.random() * numColors);
        } while (newColor === baseSquare[i][j]);

        newSquare[i][j] = newColor;
    }

    return newSquare;
}

function generateWrongSquares(correctSquare, numSquares, exactDifferences) {
    const wrongSquares = [];

    while (wrongSquares.length < numSquares - 1) {

        let wrongSquare = generateSquareWithExactDifferences(correctSquare, exactDifferences);
        let isUnique = true;

        if (isMatch(correctSquare, wrongSquare)) {
            continue;
        }

        for (let existingSquare of wrongSquares) {
            if (isMatch(existingSquare, wrongSquare)) {
                isUnique = false;
                break;
            }
        }

        if (isUnique) {
            wrongSquares.push(wrongSquare);
        }
    }
    return wrongSquares;
}

function createSquareElement(square, isSample = false) {
    const size = square.length;
    const container = document.createElement('div');
    container.className = `square ${isSample ? 'sample-square' : ''}`;

    const grid = document.createElement('div');
    grid.className = 'cell-grid';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.className = `color-${square[i][j]}`;
            grid.appendChild(cell);
        }
    }

    container.appendChild(grid);
    return container;
}

function startNewGame() {
    const level = LEVELS[currentLevel];

    wrongAttempts = 0;
    rotationCount = 0;
    gameStarted = false;

    document.getElementById('wrong-attempts').textContent = `${wrongAttempts}/3`;
    document.getElementById('rotation-count').textContent = rotationCount;
    document.getElementById('timer').textContent = '00:00';

    while (!hasAtLeastTwoColors(correctSquare)) {
        correctSquare = generateRandomSquare(level.size, level.colors);
    }
    console.log(correctSquare);

    const wrongSquares = generateWrongSquares(correctSquare, level.squares, level.minDifferences);

    let squares = [correctSquare, ...wrongSquares];

    shuffleArray(squares);

    let correctIndex = -1;
    for (let i = 0; i < squares.length; i++) {
        if (isMatch(correctSquare, squares[i])) {
            correctIndex = i;
            break;
        }
    }

    const sampleContainer = document.getElementById('sample-square');
    sampleContainer.innerHTML = '';
    sampleContainer.appendChild(createSquareElement(correctSquare, true));

    const squaresContainer = document.getElementById('squares-container');
    squaresContainer.innerHTML = '';

    squares.forEach((square, index) => {
        const squareElement = createSquareElement(square);

        if (index === correctIndex) {
            squareElement.dataset.correct = 'true';
        }

        squareElement.addEventListener('click', () => handleSquareClick(index === correctIndex, squareElement));
        squaresContainer.appendChild(squareElement);
    });

    startTimer();
    gameStarted = true;
}

function handleSquareClick(isCorrect, element) {
    if (!gameStarted) return;

    const errorMessage = document.getElementById('error-message');

    if (isCorrect) {

        gameStarted = false;
        clearInterval(timerInterval);
        document.getElementById('win-attempts').textContent = wrongAttempts + 1;
        showWinModal();
    } else {

        wrongAttempts++;
        document.getElementById('wrong-attempts').textContent = `${wrongAttempts}/3`;

        errorMessage.textContent = 'Неправильный квадрат!';
        errorMessage.style.display = 'block';

        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 2000);

        if (wrongAttempts >= 3) {
            gameStarted = false;
            clearInterval(timerInterval);
            showLoseModal();
        }
    }
}

function rotateSample() {
    if (!gameStarted) return;

    rotationCount++;
    document.getElementById('rotation-count').textContent = rotationCount;

    correctSquare = rotate90(correctSquare);

    const sampleContainer = document.getElementById('sample-square');
    sampleContainer.innerHTML = '';
    sampleContainer.appendChild(createSquareElement(correctSquare, true));
}

function startTimer() {
    startTime = Date.now();
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        document.getElementById('timer').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initModals() {
    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', hideModal);
}

function showWinModal() {
    const modal = document.getElementById('win-modal');
    const overlay = document.getElementById('modal-overlay');

    document.getElementById('win-time').textContent = document.getElementById('timer').textContent;
    document.getElementById('win-attempts').textContent = wrongAttempts + 1;
    document.getElementById('win-hints').textContent = rotationCount;

    modal.classList.add('show');
    overlay.style.display = 'block';
}

function showLoseModal() {
    const modal = document.getElementById('lose-modal');
    const overlay = document.getElementById('modal-overlay');

    const correctAnswerDiv = document.getElementById('correct-answer');
    correctAnswerDiv.innerHTML = '';
    correctAnswerDiv.appendChild(createSquareElement(correctSquare));

    modal.classList.add('show');
    overlay.style.display = 'block';
}

function hideModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.getElementById('modal-overlay').style.display = 'none';
}

function restartGame() {
    hideModal();
    startNewGame();
}

window.restartGame = restartGame;
window.rotateSample = rotateSample;
window.hideModal = hideModal;