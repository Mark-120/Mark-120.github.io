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

window.clearRating = clearRating;