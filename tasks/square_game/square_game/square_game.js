const LEVELS = [
    { mode: 1, difficulty: 'Лёгкая', size: 3, colors: 2, squares: 9, p: 100, n: 200, m: 50 },
    { mode: 1, difficulty: 'Средняя', size: 4, colors: 3, squares: 9, p: 100, n: 150, m: 30 },
    { mode: 1, difficulty: 'Тяжёлая', size: 5, colors: 4, squares: 9, p: 100, n: 100, m: 20 },
    { mode: 2, difficulty: 'Лёгкая', size: 3, colors: 2, squares: 9, p: 200, n: 200, m: 50 },
    { mode: 2, difficulty: 'Средняя', size: 4, colors: 3, squares: 9, p: 200, n: 150, m: 30 },
    { mode: 2, difficulty: 'Тяжёлая', size: 5, colors: 4, squares: 9, p: 200, n: 100, m: 20 },
    { mode: 3, difficulty: 'Лёгкая', size: 3, colors: 2, squares: 9, p: 300, n: 200, m: 50 },
    { mode: 3, difficulty: 'Средняя', size: 4, colors: 3, squares: 9, p: 300, n: 150, m: 30 },
    { mode: 3, difficulty: 'Тяжёлая', size: 5, colors: 4, squares: 9, p: 300, n: 100, m: 20 }
];

const TOTAL_LEVELS = 9;
const TOTAL_TIME = 10 * 60 * 1000;
const START_SCORE = 0;

function getModeName(mode) {
    const names = { 1: 'Обычный', 2: 'Хаотичный', 3: 'Летающий' };
    return names[mode] || 'Unknown';
}

let gameState = {
    currentLevel: 1,
    wrongAttempts: 0,
    rotations: 0,
    score: START_SCORE,
    startTime: null,
    timerInterval: null,
    gameStarted: false,
    correctSquare: null,
    currentLevelData: null,
    chaoticComplicationMode: false,
    chaoticRepositionTimer: null,
    rotationSpeed: 1,
    flyingMode: false,
    displayMode: 'normal',
    selectedSquareIndex: 0,
    squareVelocities: []
};

let wrongAttemptsElement, rotationsElement;
let scoreElement, levelInfoElement;
let errorMessageElement, squaresContainer, sampleContainer;
let levelInfoPanel, levelInfoToggle;
let rotationSpeedSlider, flyingModeCheckbox, displayModeSelect;
let chaoticComplicationCheckbox, dropZone;
let isGameOver = false;

document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.game-area')) {
        initElements();
        startNewGame();
        getUserInfo();
        initModals();
    }
});

function initElements() {
    wrongAttemptsElement = document.getElementById('wrong-attempts');
    rotationsElement = document.getElementById('rotation-count');
    scoreElement = document.getElementById('current-score');
    levelInfoElement = document.getElementById('level-info');
    errorMessageElement = document.getElementById('error-message');
    squaresContainer = document.getElementById('squares-container');
    sampleContainer = document.getElementById('sample-square');
    levelInfoPanel = document.getElementById('level-info-panel');
    levelInfoToggle = document.getElementById('level-info-toggle');
    rotationSpeedSlider = document.getElementById('rotation-speed-slider');
    flyingModeCheckbox = document.getElementById('flying-mode-checkbox');
    displayModeSelect = document.getElementById('display-mode-select');
    chaoticComplicationCheckbox = document.getElementById('chaotic-complication-checkbox');
    dropZone = document.getElementById('drop-zone');

    if (levelInfoToggle) {
        levelInfoToggle.addEventListener('click', toggleLevelInfoPanel);
    }

    if (rotationSpeedSlider) {
        rotationSpeedSlider.addEventListener('input', updateRotationSpeed);
    }
    if (flyingModeCheckbox) {
        flyingModeCheckbox.addEventListener('change', toggleFlyingMode);
    }
    if (displayModeSelect) {
        displayModeSelect.addEventListener('change', updateDisplayMode);
    }
    if (chaoticComplicationCheckbox) {
        chaoticComplicationCheckbox.addEventListener('change', toggleChaoticComplication);
    }
}

function getUserInfo() {
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

    if (rotationAnimationId) {
        cancelAnimationFrame(rotationAnimationId);
        rotationAnimationId = null;
    }
    if (flyingAnimationId) {
        cancelAnimationFrame(flyingAnimationId);
        flyingAnimationId = null;
    }

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
        currentLevel: 1,
        wrongAttempts: 0,
        rotations: 0,
        score: START_SCORE,
        startTime: Date.now(),
        timerInterval: null,
        gameStarted: true,
        correctSquare: null,
        currentLevelData: LEVELS[0],
        chaoticComplicationMode: false,
        chaoticRepositionTimer: null,
        rotationSpeed: 1,
        flyingMode: false,
        displayMode: 'normal',
        selectedSquareIndex: 0,
        squareVelocities: []
    };

    if (chaoticComplicationCheckbox) chaoticComplicationCheckbox.checked = false;
    if (flyingModeCheckbox) flyingModeCheckbox.checked = false;
    if (displayModeSelect) displayModeSelect.value = 'normal';
    if (rotationSpeedSlider) rotationSpeedSlider.value = 1;

    if (gameState.chaoticRepositionTimer) {
        clearInterval(gameState.chaoticRepositionTimer);
        gameState.chaoticRepositionTimer = null;
    }
}

function updateGameStats() {
    if (wrongAttemptsElement) {
        wrongAttemptsElement.textContent = gameState.wrongAttempts;
    }
    if (rotationsElement) {
        rotationsElement.textContent = gameState.rotations;
    }

    if (scoreElement) {
        scoreElement.textContent = gameState.score;
    }

    const headerTimer = document.getElementById('header-timer');
    const headerProgress = document.getElementById('header-progress');
    const headerScore = document.getElementById('header-score');
    const headerErrors = document.getElementById('header-errors');
    const headerTurns = document.getElementById('header-turns');

    if (headerTimer) {
        headerTimer.textContent = '10:00';
    }
    if (headerProgress) {
        headerProgress.textContent = `${gameState.currentLevel}/9`;
    }
    if (headerScore) {
        headerScore.textContent = gameState.score;
    }
    if (headerErrors) {
        headerErrors.textContent = gameState.wrongAttempts;
    }
    if (headerTurns) {
        headerTurns.textContent = gameState.rotations;
    }

    updateLevelInfo();
    updateTimer();

}

function getModeDescription(mode) {
    const descriptions = {
        1: "В этом режиме квадраты расположены в сетке. Кликните на правильный квадрат, соответствующий образцу.",
        2: "В этом режиме квадраты расположены случайным образом на экране. Перетащите правильный квадрат в зону сброса, удерживая правую кнопку мыши.",
        3: "В этом режиме квадраты вращаются и могут летать по экрану. Используйте Ctrl для выбора и Enter для подтверждения."
    };
    return descriptions[mode] || "";
}

function getDifficultyDescription(difficulty) {
    const descriptions = {
        'Лёгкая': "Размер квадрата: 3х3<br>Количество цветов:2",
        'Средняя': "Размер квадрата: 4х4<br>Количество цветов:3",
        'Тяжёлая': "Размер квадрата: 5х5<br>Количество цветов:4",
    };
    return descriptions[difficulty] || "";
}

function updateLevelInfo() {
    if (!levelInfoElement) return;

    const level = gameState.currentLevelData;
    const mode = getModeName(level.mode);
    const modeDescription = getModeDescription(level.mode);
    const difficultyDescription = getDifficultyDescription(level.difficulty);

    levelInfoElement.innerHTML = `
        <strong>Режим: ${mode}</strong><br>
        Описание: ${modeDescription}<br>&nbsp;<br>
        <strong>Сложность: ${level.difficulty}</strong><br>
        ${difficultyDescription}<br>&nbsp;<br>
        Баллы за правильный ответ: ${level.p}<br>
        Штраф за ошибку: ${level.n}<br>
        Штраф за поворот: ${level.m}
    `;
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

    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const headerTimer = document.getElementById('header-timer');
    if (headerTimer) {
        headerTimer.textContent = timeString;
    }

}

function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        updateTimer();

    }, 1000);
}

function generateLevel() {
    gameState.currentLevelData = LEVELS[gameState.currentLevel - 1];
    const level = gameState.currentLevelData;

    gameState.selectedSquareIndex = 0;
    gameState.squareVelocities = [];

    if (gameState.chaoticRepositionTimer) {
        clearInterval(gameState.chaoticRepositionTimer);
        gameState.chaoticRepositionTimer = null;
    }

    let square;
    do {
        square = generateRandomSquare(level.size, level.colors);
    } while (!hasAtLeastTwoColors(square));

    gameState.correctSquare = square;

    let randomRotations = Math.floor(Math.random() * 4);
    let changedSquare = square;
    for (let i = 0; i <= randomRotations; i++) {
        changedSquare = rotate90(changedSquare);
    }

    const wrongSquares = generateWrongSquares(changedSquare, level.squares - 1, level.size);

    let squares = [changedSquare, ...wrongSquares];
    shuffleArray(squares);

    sampleContainer.innerHTML = '';
    sampleContainer.appendChild(createSquareElement(square, true));

    squaresContainer.innerHTML = '';

    updateSampleAreaText();

    updateModeControls();

    squares.forEach((sq, index) => {
        const isCorrect = isMatch(sq, square);
        const squareElement = createSquareElement(sq);
        if (isCorrect) {
            squareElement.dataset.correct = 'true';
        }
        squareElement.dataset.index = index;

        if (level.mode === 1) {

            squareElement.addEventListener('click', () => handleSquareClick(isCorrect, squareElement));
        } else if (level.mode === 2) {

            setupDragAndDrop(squareElement, isCorrect);
        }

        squaresContainer.appendChild(squareElement);
    });

    if (level.mode === 2) {

        document.addEventListener('contextmenu', preventContextMenuMode2, true);

        positionSquaresRandomly();
        
    } else if (level.mode === 3) {

        document.removeEventListener('contextmenu', preventContextMenuMode2, true);
        positionSquaresRandomly();
        startRotationAnimation();

        setTimeout(() => {
            if (gameState.flyingMode) {
                setTimeout(() => startFlyingAnimation(), 100);
            }
            highlightSelectedSquare();
        }, 100);
    } else {

        const squares = document.querySelectorAll('#squares-container .square');
        squares.forEach(square => {
            square.style.position = '';
            square.style.left = '';
            square.style.top = '';
            square.style.transform = '';
        });
    }

    applyDisplayMode();

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

function showScoreChange(points, isPositive) {
    const scoreChangeContainer = document.getElementById('score-change-container');
    if (!scoreChangeContainer) return;

    const label = document.createElement('div');
    label.className = `score-change-label ${isPositive ? 'positive' : 'negative'}`;
    label.textContent = `${isPositive ? '+' : '-'}${points}`;

    scoreChangeContainer.appendChild(label);

    setTimeout(() => {
        if (label.parentNode) {
            label.parentNode.removeChild(label);
        }
    }, 1500);
}

function handleCorrectAnswer() {
    const level = gameState.currentLevelData;
    let pointsToAdd = level.p;

    if (level.mode === 2 && gameState.chaoticComplicationMode) {
        pointsToAdd += 50;
    } else if (level.mode === 3 && gameState.flyingMode) {
        pointsToAdd += 200;
    }

    gameState.score += pointsToAdd;
    showScoreChange(pointsToAdd, true);
    gameState.currentLevel++;
    showMessage('Правильно!', 'success');
    updateGameStats();

    if (gameState.currentLevel > TOTAL_LEVELS) {
        gameOver('win');
        return;
    }

    setTimeout(() => {
        generateLevel();
    }, 1000);
}

function handleWrongAnswer(element) {
    gameState.wrongAttempts++;
    const level = gameState.currentLevelData;
    gameState.score -= level.n;
    showScoreChange(level.n, false);
    updateGameStats();
    showMessage('Неправильный квадрат!', 'error');

}

function rotateSample() {
    if (!gameState.gameStarted || isGameOver) return;

    gameState.correctSquare = rotate90(gameState.correctSquare);
    gameState.rotations++;

    const level = gameState.currentLevelData;
    gameState.score -= level.m;

    sampleContainer.innerHTML = '';
    sampleContainer.appendChild(createSquareElement(gameState.correctSquare, true));

    updateGameStats();
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

    if (rotationAnimationId) {
        cancelAnimationFrame(rotationAnimationId);
        rotationAnimationId = null;
    }
    if (flyingAnimationId) {
        cancelAnimationFrame(flyingAnimationId);
        flyingAnimationId = null;
    }

    if (gameState.chaoticRepositionTimer) {
        clearInterval(gameState.chaoticRepositionTimer);
        gameState.chaoticRepositionTimer = null;
    }

    const timeSpent = Date.now() - gameState.startTime;

    if (reason === 'win') {
        showWinModal(timeSpent);

        const gameData = {
            username: localStorage.getItem('squareGameUsername') || 'Игрок',
            time: timeSpent,
            wrongAttempts: gameState.wrongAttempts,
            rotations: gameState.rotations,
            score: gameState.score
        };

        addToRating(gameData);

    } else {

        let message = 'Время вышло!';
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

function createConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
    const confetti = [];
    const confettiCount = 150;

    for (let i = 0; i < confettiCount; i++) {
        const side = i % 2 === 0 ? 'left' : 'right';
        confetti.push({
            x: side === 'left' ? 0 : canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 4 + 2,
            d: Math.random() * confettiCount,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }

    let animationId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confetti.forEach((c, index) => {
            ctx.beginPath();
            ctx.lineWidth = c.r;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
            ctx.stroke();

            c.tiltAngle += c.tiltAngleIncrement;
            c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
            c.tilt = Math.sin(c.tiltAngle - c.r / 2) * 15;

            if (c.y > canvas.height) {
                confetti[index] = {
                    x: Math.random() * canvas.width,
                    y: -20,
                    r: c.r,
                    d: c.d,
                    color: c.color,
                    tilt: Math.floor(Math.random() * 10) - 10,
                    tiltAngleIncrement: c.tiltAngleIncrement,
                    tiltAngle: c.tiltAngle
                };
            }
        });

        animationId = requestAnimationFrame(animate);
    }

    animate();

    setTimeout(() => {
        cancelAnimationFrame(animationId);
        if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    }, 3000);
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

    createConfetti();
}

function showLoseModal(timeSpent, reason) {
    const modal = document.getElementById('lose-modal');
    const overlay = document.getElementById('modal-overlay');

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

function toggleLevelInfoPanel() {
    if (levelInfoPanel) {
        levelInfoPanel.classList.toggle('hidden');
        const arrow = levelInfoToggle.querySelector('.arrow');
        if (arrow) {
            arrow.classList.toggle('rotated');
        }
    }
}

function updateSampleAreaText() {
    const level = gameState.currentLevelData;
    const sampleAreaText = document.getElementById('sample-area-text');
    if (!sampleAreaText) return;

    if (level.mode === 1) {
        sampleAreaText.style.display = 'none';
        sampleAreaText.textContent = '';
    } else {
        sampleAreaText.style.display = 'block';
        if (level.mode === 2) {
            sampleAreaText.textContent = 'Перетащите правильный квадрат в эту область, удерживая правую кнопку мыши.';
        } else if (level.mode === 3) {
            sampleAreaText.textContent = 'Нажимайте Ctrl до тех пор, пока не выделится квадрат, который вы хотите выбрать. Нажмите Enter, чтобы подтвердить свой выбор';
        }
    }
}

function preventContextMenuMode2(e) {
    if (gameState.currentLevelData && gameState.currentLevelData.mode === 2) {
        e.preventDefault();
        return false;
    }
}

function updateModeControls() {
    const level = gameState.currentLevelData;

    const mode2Controls = document.querySelector('.mode-2-controls');
    const mode3Controls = document.querySelector('.mode-3-controls');

    if (mode2Controls) {
        mode2Controls.style.display = level.mode === 2 ? 'block' : 'none';
    }
    if (mode3Controls) {
        mode3Controls.style.display = level.mode === 3 ? 'block' : 'none';
    }

    if (dropZone) {
        dropZone.style.display = level.mode === 2 ? 'flex' : 'none';
    }

    if (squaresContainer) {
        if (level.mode === 2 || level.mode === 3) {
            squaresContainer.style.position = 'relative';
            squaresContainer.style.height = '70%';
        } else {
            squaresContainer.style.position = '';
            squaresContainer.style.minHeight = '';
        }
    }
}

function positionSquaresRandomly() {
    const squares = document.querySelectorAll('#squares-container .square');
    const container = document.getElementById('squares-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const minDistance = 80;
    const squareSize = 100;

    squares.forEach((square, index) => {
        square.style.position = 'absolute';
        square.style.cursor = 'move';
        square.style.width = squareSize + 'px';
        square.style.height = squareSize + 'px';

        let attempts = 0;
        let x, y;
        let validPosition = false;

        while (!validPosition && attempts < 100) {
            x = Math.random() * (containerRect.width - squareSize - 20) + 10;
            y = Math.random() * (containerRect.height - squareSize - 20) + 10;

            validPosition = true;

            for (let i = 0; i < index; i++) {
                const otherSquare = squares[i];
                if (!otherSquare) continue;
                const otherX = parseFloat(otherSquare.style.left) || 0;
                const otherY = parseFloat(otherSquare.style.top) || 0;

                const distance = Math.sqrt((x - otherX) ** 2 + (y - otherY) ** 2);
                if (distance < minDistance) {
                    validPosition = false;
                    break;
                }
            }
            attempts++;
        }

        square.style.left = x + 'px';
        square.style.top = y + 'px';
        const rotation = Math.random() * 360;
        square.style.transform = `rotate(${rotation}deg)`;
        square.style.transition = 'all 0.3s ease';
    });
}

function setupDragAndDrop(squareElement, isCorrect) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    let moveHandler = null;
    let upHandler = null;

    const mousedownHandler = (e) => {
        if (e.button === 2) {
            e.preventDefault();
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = squareElement.getBoundingClientRect();
            const containerRect = squaresContainer.getBoundingClientRect();
            initialX = rect.left - containerRect.left;
            initialY = rect.top - containerRect.top;
            squareElement.style.zIndex = '1000';
            squareElement.style.cursor = 'grabbing';

            squareElement.style.transition = 'none';
        }
    };

    moveHandler = (e) => {
        if (isDragging && squareElement) {
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            squareElement.style.left = (initialX + dx) + 'px';
            squareElement.style.top = (initialY + dy) + 'px';
        }
    };

    upHandler = (e) => {
        if (isDragging && squareElement) {
            isDragging = false;

            squareElement.style.transition = 'all 0.3s ease';
            squareElement.style.zIndex = '';
            squareElement.style.cursor = 'move';

            if (dropZone) {
                const dropRect = dropZone.getBoundingClientRect();
                const squareRect = squareElement.getBoundingClientRect();
                const squareCenterX = squareRect.left + squareRect.width / 2;
                const squareCenterY = squareRect.top + squareRect.height / 2;

                if (squareCenterX >= dropRect.left && squareCenterX <= dropRect.right &&
                    squareCenterY >= dropRect.top && squareCenterY <= dropRect.bottom) {

                    if (isCorrect) {
                        handleCorrectAnswer();
                    } else {
                        handleWrongAnswer(squareElement);
                    }

                    squareElement.style.opacity = '0';
                    squareElement.style.transform = 'scale(0)';
                    setTimeout(() => {
                        if (squareElement && squareElement.parentNode) {
                            squareElement.remove();
                        }
                    }, 300);
                }
            }
        }
    };

    squareElement.addEventListener('mousedown', mousedownHandler);
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);

    squareElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

function toggleChaoticComplication() {
    gameState.chaoticComplicationMode = chaoticComplicationCheckbox.checked;

    if (gameState.chaoticComplicationMode) {

        if (gameState.currentLevelData.mode === 2) {
            positionSquaresRandomly();
        }

        gameState.chaoticRepositionTimer = setInterval(() => {
            if (gameState.currentLevelData.mode === 2) {
                positionSquaresRandomly();
            }
        }, 10000);
    } else {
        if (gameState.chaoticRepositionTimer) {
            clearInterval(gameState.chaoticRepositionTimer);
            gameState.chaoticRepositionTimer = null;
        }
    }
}

let rotationAnimationId = null;

function startRotationAnimation() {

    if (rotationAnimationId) {
        cancelAnimationFrame(rotationAnimationId);
    }

    const squares = document.querySelectorAll('#squares-container .square');
    squares.forEach(square => {
        square.style.transition = 'transform 0.1s linear';
        if (!square.dataset.rotation) {
            square.dataset.rotation = '0';
        }

        if (!square.dataset.rotationDirection) {
            square.dataset.rotationDirection = Math.random() < 0.5 ? '1' : '-1';
        }
    });

    function animate() {
        if (gameState.currentLevelData && gameState.currentLevelData.mode === 3 && !isGameOver && gameState.gameStarted) {
            const squares = document.querySelectorAll('#squares-container .square');
            squares.forEach(square => {
                const currentRotation = parseFloat(square.dataset.rotation || 0);
                const direction = parseFloat(square.dataset.rotationDirection || 1);
                const newRotation = currentRotation + (gameState.rotationSpeed * direction);
                square.dataset.rotation = newRotation.toString();

                square.style.transform = `rotate(${newRotation}deg)`;

            });
            rotationAnimationId = requestAnimationFrame(animate);
        }
    }
    rotationAnimationId = requestAnimationFrame(animate);
}

function updateRotationSpeed() {
    if (rotationSpeedSlider) {
        gameState.rotationSpeed = parseFloat(rotationSpeedSlider.value);
    }
}

let flyingAnimationId = null;

function startFlyingAnimation() {

    if (flyingAnimationId) {
        cancelAnimationFrame(flyingAnimationId);
    }

    const squares = document.querySelectorAll('#squares-container .square');
    const container = squaresContainer;
    if (!container) return;

    squares.forEach((square, index) => {
        if (!gameState.squareVelocities[index]) {
            gameState.squareVelocities[index] = {
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3
            };
        }

        square.style.position = 'absolute';
        if (!square.style.left) {
            const rect = square.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            square.style.left = (rect.left - containerRect.left) + 'px';
            square.style.top = (rect.top - containerRect.top) + 'px';
        }
    });

    function animate() {
        if (gameState.flyingMode && gameState.currentLevelData && gameState.currentLevelData.mode === 3 && !isGameOver && gameState.gameStarted) {
            const containerRect = container.getBoundingClientRect();
            const squares = document.querySelectorAll('#squares-container .square');

            squares.forEach((square, index) => {
                if (!square) return;

                const velocity = gameState.squareVelocities[index];
                if (!velocity) return;

                let x = parseFloat(square.style.left) || 0;
                let y = parseFloat(square.style.top) || 0;
                const size = 100;

                x += velocity.vx;
                y += velocity.vy;

                if (x <= 0) {
                    velocity.vx = Math.abs(velocity.vx);
                    x = 0;
                } else if (x + size >= containerRect.width) {
                    velocity.vx = -Math.abs(velocity.vx);
                    x = containerRect.width - size;
                }

                if (y <= 0) {
                    velocity.vy = Math.abs(velocity.vy);
                    y = 0;
                } else if (y + size >= containerRect.height) {
                    velocity.vy = -Math.abs(velocity.vy);
                    y = containerRect.height - size;
                }

                square.style.left = x + 'px';
                square.style.top = y + 'px';
            });

            flyingAnimationId = requestAnimationFrame(animate);
        }
    }
    flyingAnimationId = requestAnimationFrame(animate);
}

function toggleFlyingMode() {
    gameState.flyingMode = flyingModeCheckbox.checked;
    if (gameState.flyingMode && gameState.currentLevelData && gameState.currentLevelData.mode === 3) {
        startFlyingAnimation();
    }
}

function updateDisplayMode() {
    if (displayModeSelect) {
        gameState.displayMode = displayModeSelect.value;
        applyDisplayMode();
    }
}

function applyDisplayMode() {
    const body = document.body;
    if (!body) return;

    body.style.filter = '';

    switch (gameState.displayMode) {
        case 'sepia':
            body.style.filter = 'sepia(60%)';
            break;
        case 'invert':
            body.style.filter = 'invert(100%)';
            break;
        case 'grayscale':
            body.style.filter = 'grayscale(80%)';
            break;
        default:
            body.style.filter = '';
    }
}

function highlightSelectedSquare() {
    const squares = document.querySelectorAll('#squares-container .square');
    squares.forEach((square, index) => {
        square.classList.remove('selected');
        if (index === gameState.selectedSquareIndex) {
            square.classList.add('selected');
        }
    });
}

let lastCtrlPress = 0;
let ctrlKeyPressed = false;

document.addEventListener('keydown', (e) => {
    if (!gameState.gameStarted || isGameOver) return;
    if (gameState.currentLevelData && gameState.currentLevelData.mode === 3) {

        if (e.key === 'Control' || e.ctrlKey) {

            const now = Date.now();
            if (!ctrlKeyPressed && now - lastCtrlPress > 50) {
                e.preventDefault();
                const squares = document.querySelectorAll('#squares-container .square');
                if (squares.length > 0) {
                    gameState.selectedSquareIndex = (gameState.selectedSquareIndex + 1) % squares.length;
                    highlightSelectedSquare();
                }
                lastCtrlPress = now;
                ctrlKeyPressed = true;
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const squares = document.querySelectorAll('#squares-container .square');
            if (squares[gameState.selectedSquareIndex]) {
                const isCorrect = squares[gameState.selectedSquareIndex].dataset.correct === 'true';
                handleSquareClick(isCorrect, squares[gameState.selectedSquareIndex]);
            }
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Control' || !e.ctrlKey) {
        ctrlKeyPressed = false;
    }
});

function openSecondMode() {
    while (gameState.currentLevel != 4 && gameState.currentLevel < 10) handleCorrectAnswer();
}

function openThirdMode() {
    while (gameState.currentLevel != 7 && gameState.currentLevel < 10) handleCorrectAnswer();
}

window.showExitModal = showExitModal;
window.showRestartModal = showRestartModal;
window.restartGame = restartGame;
window.rotateSample = rotateSample;
window.hideModal = hideModal;
window.goBack = goBack;
window.openSecondMode = openSecondMode;
window.openThirdMode = openThirdMode;
