const LEVELS = {
    easy: {
        name: 'Легкий',
        size: 3,
        colors: 2,
        squares: 6,
        n: 200,
        m: 100
    },
    medium: {
        name: 'Средний',
        size: 4,
        colors: 3,
        squares: 12,
        n: 150,
        m: 75
    },
    hard: {
        name: 'Сложный',
        size: 5,
        colors: 4,
        squares: 16,
        n: 100,
        m: 50
    },
    expert: {
        name: 'Эксперт',
        size: 6,
        colors: 4,
        squares: 20,
        n: 50,
        m: 25
    }
};

const LEVEL_ORDER = ['easy', 'medium', 'hard', 'expert'];
const LEVELS_PER_DIFFICULTY = 3;
const TOTAL_LEVELS = LEVEL_ORDER.length * LEVELS_PER_DIFFICULTY;
const TOTAL_TIME = 10 * 60 * 1000;
const START_SCORE = 1200;

let gameState = {
    currentDifficulty: 'easy',
    levelIndex: 0, // 0-2 для текущей сложности
    totalProgress: 0, // 0-11 общий прогресс
    wrongAttempts: 0,
    rotations: 0,
    wrongAttemptsCurrentLevel: 0,
    score: START_SCORE,
    startTime: null,
    timerInterval: null,
    gameStarted: false,
    correctSquare: null,
    currentLevelData: null
};

let timerElement, wrongAttemptsElement, rotationsElement;
let wrongAttemptsCurrentElement, scoreElement, levelInfoElement;
let errorMessageElement, squaresContainer, sampleContainer;

let isGameOver = false;

document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.game-area')) {
        initElements();
        startNewGame();
        updateUserInfo();
        initModals();
    }
});

function initElements() {
    timerElement = document.getElementById('timer');
    wrongAttemptsElement = document.getElementById('wrong-attempts');
    rotationsElement = document.getElementById('rotation-count');
    wrongAttemptsCurrentElement = document.getElementById('wrong-attempts-current');
    scoreElement = document.getElementById('current-score');
    levelInfoElement = document.getElementById('level-info');
    errorMessageElement = document.getElementById('error-message');
    squaresContainer = document.getElementById('squares-container');
    sampleContainer = document.getElementById('sample-square');
}

function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        const username = localStorage.getItem('squareGameUsername') || 'Игрок';
        userInfo.innerHTML = `
            <span class="username">${username}</span>
        `;
    }
}

function startNewGame() {
    isGameOver = false;
    resetGameState();
    updateGameStats();
    generateLevel();
    startTimer();
    gameState.gameStarted = true;

    const squares = document.querySelectorAll('#squares-container .square');
    squares.forEach(square => {
        square.style.border = '';
        square.style.boxShadow = '';
        const numberIndicator = square.querySelector('.correct-number');
        if (numberIndicator) {
            numberIndicator.remove();
        }
    });
}

function resetGameState() {
    gameState = {
        currentDifficulty: 'easy',
        levelIndex: 0,
        totalProgress: 0,
        wrongAttempts: 0,
        rotations: 0,
        wrongAttemptsCurrentLevel: 0,
        score: START_SCORE,
        startTime: Date.now(),
        timerInterval: null,
        gameStarted: true,
        correctSquare: null,
        currentLevelData: LEVELS.easy
    };
}

function updateGameStats() {
    updateTimer();

    wrongAttemptsElement.textContent = gameState.wrongAttempts;
    rotationsElement.textContent = gameState.rotations;

    if (wrongAttemptsCurrentElement) {
        wrongAttemptsCurrentElement.textContent = gameState.wrongAttemptsCurrentLevel;
    }

    if (scoreElement) {
        scoreElement.textContent = gameState.score;
    }

    if (levelInfoElement) {
        const level = LEVELS[gameState.currentDifficulty];
        const levelNum = gameState.totalProgress + 1;
        levelInfoElement.innerHTML = `
            <strong>${level.name}</strong><br>
            Размер: ${level.size}×${level.size}<br>
            Цвета: ${level.colors}<br>
            Вариантов: ${level.squares}<br>
            Прогресс: ${levelNum}/12<br>
            Цена ошибки: ${level.n} баллов<br>
            Цена поворота: ${level.m} баллов
        `;
    }
}

function updateTimer() {
    if (!gameState.startTime || isGameOver) return;

    const elapsed = Date.now() - gameState.startTime;
    const remaining = Math.max(0, TOTAL_TIME - elapsed);

    if (remaining <= 0) {
        gameOver('time');
        return;
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        updateTimer();

        if (gameState.score <= 0) {
            gameOver('score');
        }
    }, 1000);
}

function generateLevel() {
    gameState.currentLevelData = LEVELS[gameState.currentDifficulty];
    const level = gameState.currentLevelData;
    gameState.wrongAttemptsCurrentLevel = 0;
    let square;
    do {
        square = generateRandomSquare(level.size, level.colors);
    } while (!hasAtLeastTwoColors(square));

    gameState.correctSquare = square;

    let randomRotations = Math.floor(Math.random() * 4);
    console.log(randomRotations);
    let changedSquare = square;
    for (let i = 0; i < randomRotations; i++) {
        changedSquare = rotate90(changedSquare);
    }

    const wrongSquares = generateWrongSquares(changedSquare, level.squares - 1, level.size);

    let squares = [changedSquare, ...wrongSquares];
    shuffleArray(squares);

    sampleContainer.innerHTML = '';
    sampleContainer.appendChild(createSquareElement(square, true));

    squaresContainer.innerHTML = '';
    squares.forEach((sq, index) => {
        const isCorrect = isMatch(sq, square);
        const squareElement = createSquareElement(sq);
        if (isCorrect) {
            squareElement.dataset.correct = 'true';
        }
        squareElement.addEventListener('click', () => handleSquareClick(isCorrect, squareElement));
        squaresContainer.appendChild(squareElement);
    });

    updateGameStats();
}

function generateRandomSquare(size, numColors) {
    const square = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(Math.floor(Math.random() * numColors));
        }
        square.push(row);
    }
    return square;
}

function hasAtLeastTwoColors(square) {
    if (!square || square.length === 0) return false;
    const firstColor = square[0][0];
    for (let i = 0; i < square.length; i++) {
        for (let j = 0; j < square[i].length; j++) {
            if (i === 0 && j === 0) continue;
            if (square[i][j] !== firstColor) return true;
        }
    }
    return false;
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

function squaresEqual(square1, square2) {
    if (square1.length !== square2.length) return false;
    for (let i = 0; i < square1.length; i++) {
        for (let j = 0; j < square1[i].length; j++) {
            if (square1[i][j] !== square2[i][j]) return false;
        }
    }
    return true;
}

function isMatch(square1, square2) {
    let current = square2;
    for (let rotation = 0; rotation < 4; rotation++) {
        if (squaresEqual(square1, current)) return true;
        current = rotate90(current);
    }
    return false;
}

function generateWrongSquares(correctSquare, count, minDifferences) {
    const wrongSquares = [];
    const size = correctSquare.length;

    while (wrongSquares.length < count) {
        const wrongSquare = [];
        for (let i = 0; i < size; i++) {
            wrongSquare.push([...correctSquare[i]]);
        }
        const changes = Math.max(minDifferences, 2);
        const positions = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                positions.push({ i, j });
            }
        }
        shuffleArray(positions);
        for (let c = 0; c < changes && c < positions.length; c++) {
            const { i, j } = positions[c];
            const numColors = gameState.currentLevelData.colors;
            let newColor;

            do {
                newColor = Math.floor(Math.random() * numColors);
            } while (newColor === wrongSquare[i][j] && numColors > 1);

            wrongSquare[i][j] = newColor;
        }
        if (!isMatch(correctSquare, wrongSquare)) {

            let isUnique = true;
            for (const existing of wrongSquares) {
                if (isMatch(existing, wrongSquare)) {
                    isUnique = false;
                    break;
                }
            }

            if (isUnique) {
                wrongSquares.push(wrongSquare);
            }
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

function handleSquareClick(isCorrect, element) {
    if (!gameState.gameStarted || isGameOver) return;
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer(element);
    }
}

function handleCorrectAnswer() {
    gameState.totalProgress++;
    gameState.levelIndex++;
    showMessage('Правильно!', 'success');

    if (gameState.levelIndex >= LEVELS_PER_DIFFICULTY) {
        gameState.levelIndex = 0;
        const currentIndex = LEVEL_ORDER.indexOf(gameState.currentDifficulty);
        if (currentIndex < LEVEL_ORDER.length - 1) {
            gameState.currentDifficulty = LEVEL_ORDER[currentIndex + 1];
        } else {
            gameOver('win');
            return;
        }
    }
    setTimeout(() => {
        generateLevel();
    }, 1000);

}

function handleWrongAnswer(element) {
    gameState.wrongAttempts++;
    gameState.wrongAttemptsCurrentLevel++;
    const level = gameState.currentLevelData;
    gameState.score = Math.max(0, gameState.score - level.n);
    updateGameStats();
    element.style.borderColor = '#ef4444';
    element.style.boxShadow = '0 0 10px #ef4444';
    showMessage('Неправильный квадрат!', 'error');
    if (gameState.wrongAttemptsCurrentLevel >= 3) {
        gameOver('attempts');
        return;
    }
    if (gameState.score <= 0) {
        gameOver('score');
        return;
    }
    setTimeout(() => {
        element.style.borderColor = '';
        element.style.boxShadow = '';
    }, 1000);
}

function rotateSample() {
    if (!gameState.gameStarted || isGameOver) return;

    gameState.correctSquare = rotate90(gameState.correctSquare);
    gameState.rotations++;

    const level = gameState.currentLevelData;
    gameState.score = Math.max(0, gameState.score - level.m);

    sampleContainer.innerHTML = '';
    sampleContainer.appendChild(createSquareElement(gameState.correctSquare, true));

    updateGameStats();

    if (gameState.score <= 0) {
        gameOver('score');
    }

}

function showMessage(text, type) {
    errorMessageElement.textContent = text;
    errorMessageElement.className = `error-message ${type}`;
    errorMessageElement.style.display = 'block';

    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 2000);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function gameOver(reason) {
    if (isGameOver) return;
    isGameOver = true;
    clearInterval(gameState.timerInterval);
    gameState.gameStarted = false;

    const timeSpent = Date.now() - gameState.startTime;

    if (reason === 'win') {

        showWinModal(timeSpent);

        // Сохраняем в рейтинг
        const gameData = {
            username: localStorage.getItem('squareGameUsername') || 'Игрок',
            time: timeSpent,
            wrongAttempts: gameState.wrongAttempts,
            rotations: gameState.rotations,
            score: gameState.score
        };

        addToRating(gameData);

    } else {

        let message = '';
        switch (reason) {
            case 'attempts':
                message = '3 неправильных ответа на уровне';
                break;
            case 'time':
                message = 'Время вышло!';
                break;
            case 'score':
                message = 'Баллы закончились!';
                break;
        }

        highlightCorrectSquare();

        showLoseModal(timeSpent, message);
    }
}

function highlightCorrectSquare() {
    const squares = document.querySelectorAll('#squares-container .square');
    squares.forEach((square, index) => {
        if (square.dataset.correct === 'true') {

            square.style.border = '3px solid #10b981';
            square.style.boxShadow = '0 0 15px #10b981';

            const numberIndicator = document.createElement('div');
            numberIndicator.className = 'correct-number';
            numberIndicator.textContent = `✓ ${index + 1}`;
            numberIndicator.style.cssText = `
                position: absolute;
                top: -10px;
                right: -10px;
                background: #10b981;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                z-index: 10;
            `;
            square.style.position = 'relative';
            square.appendChild(numberIndicator);
        }
    });
}

function initModals() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', hideModal);
    }
}

function showWinModal(timeSpent) {
    const modal = document.getElementById('win-modal');
    const overlay = document.getElementById('modal-overlay');

    document.getElementById('win-time').textContent = formatTime(timeSpent);
    document.getElementById('win-attempts').textContent = gameState.wrongAttempts;
    document.getElementById('win-rotations').textContent = gameState.rotations;
    document.getElementById('win-score').textContent = gameState.score;
    document.getElementById('win-username').textContent = localStorage.getItem('squareGameUsername') || 'Игрок';

    modal.classList.add('show');
    overlay.style.display = 'block';
}

function showLoseModal(timeSpent, reason) {
    const modal = document.getElementById('lose-modal');
    const overlay = document.getElementById('modal-overlay');

    document.getElementById('lose-time').textContent = formatTime(timeSpent);
    document.getElementById('lose-attempts').textContent = gameState.wrongAttempts;
    document.getElementById('lose-rotations').textContent = gameState.rotations;
    document.getElementById('lose-score').textContent = gameState.score;
    document.getElementById('lose-reason').textContent = reason;

    modal.classList.add('show');
    overlay.style.display = 'block';
}

function hideModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.getElementById('modal-overlay').style.display = 'none';
}

function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function restartGame() {
    hideModal();
    isGameOver = false;
    startNewGame();
}

function goBack() {
    hideModal();
    isGameOver = false;

    window.location.href = '../main_page/index.html';
}

function addToRating(gameData) {
    const rating = JSON.parse(localStorage.getItem('squareGameRating') || '[]');
    rating.push(gameData);
    localStorage.setItem('squareGameRating', JSON.stringify(rating));
}

function showExitModal() {
    const modal = document.getElementById('confirm-exit-modal');
    const overlay = document.getElementById('modal-overlay');

    modal.classList.add('show');
    overlay.style.display = 'block';

    return false;
}

function showRestartModal() {
    const modal = document.getElementById('confirm-restart-modal');
    const overlay = document.getElementById('modal-overlay');

    modal.classList.add('show');
    overlay.style.display = 'block';

    return false;
}

// Глобальные функции
window.showExitModal = showExitModal;
window.showRestartModal = showRestartModal;
window.restartGame = restartGame;
window.rotateSample = rotateSample;
window.hideModal = hideModal;
window.goBack = goBack;