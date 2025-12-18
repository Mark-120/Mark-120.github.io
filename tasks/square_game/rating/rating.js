document.addEventListener('DOMContentLoaded', function () {
    updateUserInfo();
    loadRating();
});

function getUsername() {
    return localStorage.getItem('squareGameUsername') || 'Игрок';
}

function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        const username = getUsername();
        userInfo.innerHTML = `
            <span class="username">${username}</span>
            ${username ? '<button class="change-name-btn" onclick="showNameModal()">Сменить имя</button>' : ''}
        `;
    }
}

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

function clearRating() {
    if (confirm('Вы уверены, что хотите очистить весь рейтинг? Это действие нельзя отменить.')) {
        localStorage.removeItem('squareGameRating');
        loadRating();
    }
}

function showNameModal() {
    const modal = document.getElementById('name-modal');
    const overlay = document.getElementById('name-modal-overlay');
    const input = document.getElementById('new-username');

    if (!modal || !overlay || !input) return;

    input.value = getUsername();
    input.focus();

    modal.style.display = 'block';
    overlay.style.display = 'block';

    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveNewUsername();
        }
    });
}

function hideNameModal() {
    const modal = document.getElementById('name-modal');
    const overlay = document.getElementById('name-modal-overlay');
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
}

function saveNewUsername() {
    const input = document.getElementById('new-username');
    if (!input) return;

    const newName = input.value.trim();
    if (newName && newName.length > 0) {
        localStorage.setItem('squareGameUsername', newName);
        updateUserInfo();
        hideNameModal();
    } else {
        alert('Пожалуйста, введите имя');
    }
}

window.clearRating = clearRating;
window.showNameModal = showNameModal;
window.hideNameModal = hideNameModal;
window.saveNewUsername = saveNewUsername;