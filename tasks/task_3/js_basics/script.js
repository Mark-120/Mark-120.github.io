const formulaFunctions = [
    (a, b, c) => (Math.PI * Math.sqrt(a ** 2)) / (b ** 2 * c),
    (a, b, c) => ((a + Math.sqrt(b)) ** 2) / (c ** 3),
    (a, b, c) => Math.sqrt(a + b + Math.sqrt(c)) / (Math.PI * b),
];

const formulaImages = [
    'pictures/formula_1.JPG',
    'pictures/formula_2.JPG',
    'pictures/formula_3.JPG'
];

const chooseBtn = document.getElementById("chooseBtn");
const resultDiv = document.getElementById("result");

chooseBtn.addEventListener("click", () => {
    resultDiv.innerHTML = "";
    const count = parseInt(document.getElementById("formulaCount").value);
    if (isNaN(count) || count < 1 || count > 3) {
        alert("Введите число от 1 до 3!");
        return;
    }

    handleFormula(0, count);
});

function getNumber(str, index) {
    var num = prompt(`Введите значение ${str} для формулы ${index + 1}:`);
    if (num === null) return null;
    return parseFloat(num);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleFormula(index, total) {
    if (index >= total) {
        alert("Вычисления завершены!");
        return;
    }

    resultDiv.innerHTML +=
        `
        Вводимая вами формула:
        <img class="formula-img" src="${formulaImages[index]}" alt="Формула">
        `;

    await delay(1000);

    const a = getNumber('a', index);
    if (a === null) return;
    const b = getNumber('b', index);
    if (b === null) return;
    const c = getNumber('c', index);
    if (c === null) return;

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        alert("Ошибка: введены нечисловые значения.");
        resultDiv.innerHTML +=
            `
        ❌ Ошибка вычислений 😞<br><br>
        `;
    } else {
        const res = formulaFunctions[index](a, b, c);
        resultDiv.innerHTML +=
            `
        Результат: <b>${res}</b> 😊<br><br>
        `;
    }
    setTimeout(() => handleFormula(index + 1, total), 1000);
}