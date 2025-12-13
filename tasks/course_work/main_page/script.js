document.addEventListener('DOMContentLoaded', function () {
    // Обновляем информацию о пользователе
    updateUserInfo();

    // Проверяем, есть ли сохраненное имя
    if (!localStorage.getItem('squareGameUsername')) {
        showNameModal();
    }


    // Обработчик кнопки "Пройти игру"
    document.getElementById('play-btn').addEventListener('click', function () {
        const username = getUsername();
        if (!username || username.trim() === '') {
            showNameModal();
            return;
        }
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

    modal.style.display = 'block';;
    overlay.style.display = 'block';

    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveNewUsername();
        }
    });
}

function hideNameModal() {
    document.getElementById('name-modal').style.display = 'none';
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

function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Глобальные функции
window.showNameModal = showNameModal;
window.hideNameModal = hideNameModal;
window.saveNewUsername = saveNewUsername;