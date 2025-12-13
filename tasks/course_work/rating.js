// Инициализация
document.addEventListener('DOMContentLoaded', function () {
    updateUserInfo();
    loadRating();

    // Инициализация модальных окон
    const overlay = document.getElementById('name-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', hideNameModal);
    }

    // Проверка имени при загрузке
    if (!localStorage.getItem('squareGameUsername')) {
        setTimeout(showNameModal, 500);
    }
});

// Общие функции для работы с пользователем
function getUsername() {
    return localStorage.getItem('squareGameUsername') || 'Игрок';
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
            <span class="username">${username}</span>
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
    }
}

// Функции для рейтинга
function loadRating() {
    const rating = JSON.parse(localStorage.getItem('squareGameRating') || '[]');
    const tbody = document.getElementById('rating-body');
    const noData = document.getElementById('no-data');

    if (!rating || rating.length === 0) {
        tbody.innerHTML = '';
        noData.style.display = 'block';
        return;
    }

    noData.style.display = 'none';

    // Сортировка по баллам (по убыванию)
    rating.sort((a, b) => b.score - a.score);

    let html = '';
    rating.forEach((player, index) => {

        html += `
            <tr>
                <td>
                    ${index + 1}
                </td>
                <td>${player.username}</td>
                <td>${formatTime(player.time)}</td>
                <td>${player.wrongAttempts}</td>
                <td>${player.rotations}</td>
                <td><strong>${player.score}</strong></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function addToRating(gameData) {
    const rating = JSON.parse(localStorage.getItem('squareGameRating') || '[]');

    rating.push({
        username: gameData.username,
        time: gameData.time,
        wrongAttempts: gameData.wrongAttempts,
        rotations: gameData.rotations,
        score: gameData.score,
        date: new Date().toISOString()
    });

    localStorage.setItem('squareGameRating', JSON.stringify(rating));
}

function clearRating() {
    if (confirm('Вы уверены, что хотите очистить весь рейтинг? Это действие нельзя отменить.')) {
        localStorage.removeItem('squareGameRating');
        loadRating();
    }
}

window.showNameModal = showNameModal;
window.hideNameModal = hideNameModal;
window.saveNewUsername = saveNewUsername;
window.clearRating = clearRating;