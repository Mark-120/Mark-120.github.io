document.addEventListener('DOMContentLoaded', function () {
    // Обновляем информацию о пользователе
    updateUserInfo();

    // Проверяем, есть ли сохраненное имя
    if (!localStorage.getItem('squareGameUsername')) {
        showNameModal();
    }

    // Загружаем прогресс
    loadProgress();

    // Обработчик кнопки "Пройти игру"
    document.getElementById('play-btn').addEventListener('click', function () {
        const username = getUsername();
        if (!username || username.trim() === '') {
            showNameModal();
            return;
        }

        // Сбрасываем прогресс при начале новой игры
        resetGameProgress();
        window.location.href = `../square_game/square_game.html`;
    });
});

// Функции для работы с пользователем
function getUsername() {
    return localStorage.getItem('squareGameUsername') || '';
}

function setUsername(name) {
    localStorage.setItem('squareGameUsername', name);
    updateUserInfo();
}

function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        const username = getUsername();
        userInfo.innerHTML = `
            <span class="username">${username || 'Гость'}</span>
            ${username ? '<button class="change-name-btn" onclick="showNameModal()">Сменить имя</button>' : ''}
        `;
    }
}

function showNameModal() {
    const modal = document.getElementById('name-modal');
    const overlay = document.getElementById('name-modal-overlay');
    const input = document.getElementById('new-username');

    input.value = getUsername();
    input.focus();

    modal.classList.add('show');
    overlay.style.display = 'block';

    // Обработчик Enter
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveNewUsername();
        }
    });
}

function hideNameModal() {
    document.getElementById('name-modal').classList.remove('show');
    document.getElementById('name-modal-overlay').style.display = 'none';
}

function saveNewUsername() {
    const newName = document.getElementById('new-username').value.trim();
    if (newName && newName.length > 0) {
        setUsername(newName);
        hideNameModal();

        // Если это первое введение имени, показываем приветствие
        if (!localStorage.getItem('squareGameFirstLogin')) {
            alert(`Добро пожаловать, ${newName}! Удачи в игре!`);
            localStorage.setItem('squareGameFirstLogin', 'true');
        }
    } else {
        alert('Пожалуйста, введите имя');
    }
}

// Функции для прогресса
function loadProgress() {
    const progress = JSON.parse(localStorage.getItem('squareGameProgress'));
    const progressText = document.getElementById('progress-text');
    const recentResults = document.getElementById('recent-results');
    const lastResult = document.getElementById('last-result');

    if (progress) {
        const currentLevel = progress.currentLevel || 'easy';
        const levelIndex = progress.levelIndex || 0;
        const levelNames = {
            'easy': 'Лёгкий',
            'medium': 'Средний',
            'hard': 'Сложный',
            'expert': 'Эксперт'
        };

        const totalProgress = progress.totalProgress || 0;
        progressText.textContent = `Прогресс: ${totalProgress}/12 уровней`;

        // Показываем последний результат
        const lastGame = JSON.parse(localStorage.getItem('squareGameLastResult'));
        if (lastGame) {
            recentResults.style.display = 'block';
            lastResult.innerHTML = `
                <p>Баллы: <strong>${lastGame.score}</strong></p>
                <p>Время: ${formatTime(lastGame.time)}</p>
                <p>Уровень: ${levelNames[lastGame.level] || 'Неизвестно'}</p>
            `;
        }
    } else {
        progressText.textContent = 'Новая игра';
    }
}

function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resetGameProgress() {
    localStorage.removeItem('squareGameProgress');
    localStorage.removeItem('squareGameCurrentGame');
}

// Глобальные функции
window.showNameModal = showNameModal;
window.hideNameModal = hideNameModal;
window.saveNewUsername = saveNewUsername;