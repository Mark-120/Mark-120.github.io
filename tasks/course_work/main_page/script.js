document.addEventListener('DOMContentLoaded', function () {
    let selectedLevel = 'easy';

    // Выделяем первый уровень по умолчанию
    document.querySelector('.level-item').classList.add('active');

    // Обработка выбора уровня
    document.querySelectorAll('.level-item').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.level-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            selectedLevel = this.dataset.level;
        });
    });

    // Обработка кнопки "Играть"
    document.querySelector('.play-btn').addEventListener('click', function () {
        console.log(window.location.href);
        window.location.href = `../square_game/square_game.html?level=${selectedLevel}`;
    });
});