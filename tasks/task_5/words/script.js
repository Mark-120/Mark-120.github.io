document.addEventListener('DOMContentLoaded', function () {
    const inputField = document.getElementById('inputField');
    const parseButton = document.getElementById('parseButton');
    const block2 = document.getElementById('block2');
    const block1 = document.getElementById('block1');
    const block3 = document.getElementById('block3');

    const originalColor = '#95ff95';

    parseButton.addEventListener('click', function () {
        block1.querySelectorAll('.word-item').forEach(el => el.remove());
        block2.innerHTML = '';

        const inputString = inputField.value.trim();
        if (!inputString) return;

        const words = inputString.split('-').map(word => word.trim()).filter(word => word);

        const sortedWords = sortWords(words);

        sortedWords.forEach(item => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            wordElement.textContent = item.key + ' - ' + item.word;
            wordElement.dataset.key = item.key;
            wordElement.draggable = true;

            addDragHandlers(wordElement);

            block2.appendChild(wordElement);
        });
    });

    function sortWords(words) {
        const lowercaseWords = [];
        const uppercaseWords = [];
        const numbers = [];

        words.forEach(word => {
            if (!isNaN(word) && !isNaN(parseFloat(word))) {
                numbers.push(parseFloat(word));
            }
            else if (word.charAt(0) === word.charAt(0).toUpperCase() &&
                word.charAt(0) !== word.charAt(0).toLowerCase()) {
                uppercaseWords.push(word);
            }
            else {
                lowercaseWords.push(word);
            }
        });

        lowercaseWords.sort((a, b) => a.localeCompare(b));
        uppercaseWords.sort((a, b) => a.localeCompare(b));
        numbers.sort((a, b) => a.value - b.value);

        const result = [];

        lowercaseWords.forEach((word, index) => {
            result.push({
                word: word,
                key: `a${index + 1}`
            });
        });

        uppercaseWords.forEach((word, index) => {
            result.push({
                word: word,
                key: `b${index + 1}`
            });
        });

        numbers.forEach((word, index) => {
            result.push({
                word: word,
                key: `n${index + 1}`
            });
        });

        return result;
    }

    function addDragHandlers(element) {
        element.addEventListener('dragstart', function (e) {
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.dataset.key);
        });

        element.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });
    }

    block1.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    block2.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    block1.addEventListener('drop', function (e) {
        const key = e.dataTransfer.getData('text/plain');
        const draggedElement = document.querySelector(`[data-key="${key}"]`);

        if (draggedElement) {
            const randomColor = getRandomColor();
            draggedElement.style.backgroundColor = randomColor;
            draggedElement.classList.add('in-block-1');

            const x = e.clientX - draggedElement.offsetWidth / 2;
            const y = e.clientY - draggedElement.offsetHeight / 2;

            draggedElement.style.left = `${x}px`;
            draggedElement.style.top = `${y}px`;

            block1.appendChild(draggedElement);
        }
    });

    block1.addEventListener('click', function (e) {
        if (e.target.classList.contains('word-item') &&
            e.target.parentElement === block1) {

            const word = e.target.textContent.split(' - ')[1];
            const currentText = block3.textContent;

            block3.textContent = currentText + ' ' + word;
        }
    });

    block2.addEventListener('drop', function (e) {
        const key = e.dataTransfer.getData('text/plain');
        const draggedElement = document.querySelector(`[data-key="${key}"]`);

        if (draggedElement && draggedElement.parentElement !== block2) {
            draggedElement.style.backgroundColor = originalColor;
            draggedElement.classList.remove('in-block-1');

            const allElements = Array.from(block2.querySelectorAll('.word-item'));
            const currentElementIndex = allElements.findIndex(el =>
                compareKeys(el, draggedElement) > 0);

            if (currentElementIndex === -1) {
                block2.appendChild(draggedElement);
            } else {
                block2.insertBefore(draggedElement, allElements[currentElementIndex]);
            }
        }
    });

    function compareKeys(el1, el2) {
        let key1 = el1.dataset.key;
        let key2 = el2.dataset.key;

        let key1Prefix = key1.substring(0, 1);
        let key2Prefix = key2.substring(0, 1);

        let comparedPrefixes = key1Prefix.localeCompare(key2Prefix);
        if (comparedPrefixes !== 0) {
            return comparedPrefixes;
        }

        let key1Num = parseInt(key1.substring(1));
        let key2Num = parseInt(key2.substring(1));

        if (key1Num < key2Num) {
            return -1;
        } else if (key1Num > key2Num) {
            return 1;
        } else {
            return 0;
        }
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});
