// square-game.js - Логика игры "Поиск квадрата"

// Конфигурация уровней
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

// Цветовая палитра
const COLORS = [
    '#ef4444',
    '#3b82f6',
    '#10b981',
    '#f59e0b'
];

// Глобальные переменные
let currentLevel = 'easy';
let gameStarted = false;
let startTime = null;
let timerInterval = null;
let wrongAttempts = 0;
let rotationCount = 0;
let correctSquare = null;
let squares = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.game-area')) {
        // Получаем параметр из URL
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

function getAllRotateTransformations(square) {
    const transformations = [];

    // Повороты: 0°, 90°, 180°, 270°
    for (let rotation = 0; rotation < 4; rotation++) {
        let rotated = square;
        for (let r = 0; r < rotation; r++) {
            rotated = rotate90(rotated);
        }
        transformations.push(rotated);
    }

    return transformations;
}

// Генерация всех трансформаций квадрата
function getAllTransformations(square) {
    const transformations = [];
    const size = square.length;

    // Повороты: 0°, 90°, 180°, 270°
    for (let rotation = 0; rotation < 4; rotation++) {
        let rotated = square;
        for (let r = 0; r < rotation; r++) {
            rotated = rotate90(rotated);
        }
        transformations.push(rotated);

        // Повороты с отражением
        let reflected = mirror(rotated);
        transformations.push(reflected);
    }

    return transformations;
}

// Поворот матрицы на 90°
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

// Отражение матрицы
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

// Сравнение двух квадратов
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

// Проверка, являются ли квадраты одинаковыми с учетом трансформаций
function isMatch(square1, square2) {
    const transformations = getAllTransformations(square2);

    for (const transformation of transformations) {
        if (squaresEqual(square1, transformation)) {
            return true;
        }
    }
    return false;
}

// Подсчет различий между квадратами
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

    // Создаем копию базового квадрата
    const newSquare = [];
    for (let i = 0; i < size; i++) {
        newSquare.push([...baseSquare[i]]);
    }

    // Генерируем случайные позиции для изменений
    const positions = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            positions.push({ i, j });
        }
    }

    // Перемешиваем позиции
    shuffleArray(positions);

    // Изменяем РОВНО exactDifferences клеток
    for (let d = 0; d < exactDifferences; d++) {
        const { i, j } = positions[d];

        // Выбираем новый цвет, отличный от текущего
        let newColor;
        do {
            newColor = Math.floor(Math.random() * numColors);
        } while (newColor === baseSquare[i][j]);

        newSquare[i][j] = newColor;
    }

    return newSquare;
}

// Генерация неправильных квадратов
function generateWrongSquares(correctSquare, numSquares, exactDifferences) {
    const wrongSquares = [];

    while (wrongSquares.length < numSquares - 1) {
        // Генерируем квадрат с РОВНО exactDifferences отличиями
        let wrongSquare = generateSquareWithExactDifferences(correctSquare, exactDifferences);
        let isUnique = true;

        // Проверяем, что квадрат не совпадает с правильным
        if (isMatch(correctSquare, wrongSquare)) {
            continue;
        }

        // Проверяем, что квадрат не совпадает с уже сгенерированными неправильными
        for (let existingSquare of wrongSquares) {
            if (isMatch(existingSquare, wrongSquare)) {
                isUnique = false;
                break;
            }
        }

        // Если квадрат уникален, добавляем его
        if (isUnique) {
            wrongSquares.push(wrongSquare);
        }
    }

    return wrongSquares;
}

// Создание DOM-элемента для квадрата
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
            cell.className = `cell color-${square[i][j]}`;
            grid.appendChild(cell);
        }
    }

    container.appendChild(grid);
    return container;
}

// Начало новой игры
function startNewGame() {
    const level = LEVELS[currentLevel];

    // Сброс статистики
    wrongAttempts = 0;
    rotationCount = 0;
    gameStarted = false;

    // Обновление UI
    document.getElementById('wrong-attempts').textContent = `${wrongAttempts}/3`;
    document.getElementById('rotation-count').textContent = rotationCount;
    document.getElementById('timer').textContent = '00:00';

    // Генерация правильного квадрата
    correctSquare = generateRandomSquare(level.size, level.colors);
    console.log(correctSquare);

    // Генерация неправильных квадратов
    const wrongSquares = generateWrongSquares(correctSquare, level.squares, level.minDifferences);

    // Создание массива всех квадратов
    squares = [correctSquare, ...wrongSquares];

    // Перемешивание квадратов
    shuffleArray(squares);

    // Создание случайных ориентаций для всех квадратов
    const squaresWithTransformations = squares.map(square => {
        const transformations = getAllRotateTransformations(square);
        const randomIndex = Math.floor(Math.random() * transformations.length);
        return transformations[randomIndex];
    });

    // Определение индекса правильного квадрата после перемешивания
    let correctIndex = -1;
    for (let i = 0; i < squaresWithTransformations.length; i++) {
        if (isMatch(correctSquare, squaresWithTransformations[i])) {
            correctIndex = i;
            break;
        }
    }

    // Отображение образца
    const sampleContainer = document.getElementById('sample-square');
    sampleContainer.innerHTML = '';
    sampleContainer.appendChild(createSquareElement(correctSquare, true));

    // Отображение квадратов для поиска
    const squaresContainer = document.getElementById('squares-container');
    squaresContainer.innerHTML = '';

    squaresWithTransformations.forEach((square, index) => {
        const squareElement = createSquareElement(square);

        // Сохраняем индекс правильного квадрата
        if (index === correctIndex) {
            squareElement.dataset.correct = 'true';
        }

        squareElement.addEventListener('click', () => handleSquareClick(index === correctIndex, squareElement));
        squaresContainer.appendChild(squareElement);
    });

    // Запуск таймера
    startTimer();
    gameStarted = true;
}

// Обработка клика по квадрату
function handleSquareClick(isCorrect, element) {
    if (!gameStarted) return;

    const errorMessage = document.getElementById('error-message');

    if (isCorrect) {
        // Правильный выбор
        gameStarted = false;
        clearInterval(timerInterval);
        document.getElementById('win-attempts').textContent = wrongAttempts + 1;
        showWinModal();
    } else {
        // Неправильный выбор
        wrongAttempts++;
        // Обновляем отображение в формате "X/3"
        document.getElementById('wrong-attempts').textContent = `${wrongAttempts}/3`;

        // Показываем ошибку
        errorMessage.textContent = 'Неправильный квадрат!';
        errorMessage.style.display = 'block';

        // Убираем сообщение об ошибке через 2 секунды
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 2000);

        // Проверяем, не превышен ли лимит попыток
        if (wrongAttempts >= 3) {
            gameStarted = false;
            clearInterval(timerInterval);
            showLoseModal();
        }
    }
}

// Поворот образца
function rotateSample() {
    if (!gameStarted) return;

    rotationCount++;
    document.getElementById('rotation-count').textContent = rotationCount;

    // Поворачиваем образец на 90° по часовой стрелке
    correctSquare = rotate90(correctSquare);

    // Обновляем отображение
    const sampleContainer = document.getElementById('sample-square');
    sampleContainer.innerHTML = '';
    sampleContainer.appendChild(createSquareElement(correctSquare, true));
}

// Запуск таймера
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

// Перемешивание массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Инициализация модальных окон
function initModals() {
    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', hideModal);
}

// Показать модальное окно победы
function showWinModal() {
    const modal = document.getElementById('win-modal');
    const overlay = document.getElementById('modal-overlay');

    // Заполняем статистику
    document.getElementById('win-time').textContent = document.getElementById('timer').textContent;
    document.getElementById('win-attempts').textContent = wrongAttempts + 1; // Всего попыток
    document.getElementById('win-hints').textContent = rotationCount;

    // Показываем окно
    modal.classList.add('show');
    overlay.style.display = 'block';
}

// Показать модальное окно поражения
function showLoseModal() {
    const modal = document.getElementById('lose-modal');
    const overlay = document.getElementById('modal-overlay');

    // Показываем правильный ответ
    const correctAnswerDiv = document.getElementById('correct-answer');
    correctAnswerDiv.innerHTML = '';
    correctAnswerDiv.appendChild(createSquareElement(correctSquare));

    // Показываем окно
    modal.classList.add('show');
    overlay.style.display = 'block';
}

// Скрыть все модальные окна
function hideModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.getElementById('modal-overlay').style.display = 'none';
}

// Перезапуск игры
function restartGame() {
    hideModal();
    startNewGame();
}

// Глобальные функции для использования в HTML
window.restartGame = restartGame;
window.rotateSample = rotateSample;
window.hideModal = hideModal;