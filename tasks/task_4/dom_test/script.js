const questions = [
    {
        question: "А голос у него был не такой, как у почтальона Печкина, дохленький. У Гаврюши голосище был, как у электрички. Он _____ _____ на ноги поднимал.",
        answers: [
            { text: "Пол деревни, за раз", correct: false },
            { text: "Полдеревни, зараз", correct: true },
            { text: "Пол-деревни, за раз", correct: false }
        ],
        explanation: "Правильно! Раздельно существительное будет писаться в случае наличия дополнительного слова между существительным и частицей. Правильный ответ: полдеревни пишется слитно. Зараз (ударение на второй слог) — это обстоятельственное наречие, пишется слитно. Означает быстро, одним махом."
    },
    {
        question: "А эти слова как пишутся?",
        answers: [
            { text: "Капуччино и эспрессо", correct: false },
            { text: "Каппуччино и экспресо", correct: false },
            { text: "Капучино и эспрессо", correct: true }
        ],
        explanation: "Конечно! По орфографическим нормам русского языка единственно верным написанием будут «капучино» и «эспрессо»."
    },
    {
        question: "Как нужно писать?",
        answers: [
            { text: "Черезчур", correct: false },
            { text: "Черес-чур", correct: false },
            { text: "Чересчур", correct: true }
        ],
        explanation: "Да! Это слово появилось от соединения предлога «через» и древнего слова «чур», которое означает «граница», «край». Но слово претерпело изменения, так что правильное написание учим наизусть — «чересчур»."
    },
    {
        question: "Где допущена ошибка?",
        answers: [
            { text: "Аккордеон", correct: false },
            { text: "Белиберда", correct: false },
            { text: "Эпелепсия", correct: true }
        ],
        explanation: "Верно! Это слово пишется так: «эпИлепсия»."
    }
];

// Переменные состояния
let currentQuestionIndex = 0;
let shuffledQuestions = [];
let score = 0;
const totalQuestions = questions.length;
let quizCompleted = false;
let currentActiveQuestion = null;

// Элементы DOM
const questionsContainer = document.getElementById('questions-container');
const answersContainer = document.getElementById('answers-container');
const noQuestionsElement = document.getElementById('no-questions');
const statsElement = document.getElementById('stats');
const scoreTextElement = document.getElementById('score-text');

// Функция для перемешивания массива
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Функция для перемешивания ответов
function shuffleAnswers(answers) {
    return shuffleArray(answers);
}

// Функция инициализации теста
function initQuiz() {
    shuffledQuestions = shuffleArray(questions);
    displayQuestionBlocks();
    activateQuestion(0);
}

function displayQuestionBlocks() {
    // Сначала показываем только первый вопрос
    const firstQuestion = shuffledQuestions[0];
    const questionTextElement = document.getElementById('question-text-0');
    questionTextElement.textContent = firstQuestion.question.length > 100
        ? firstQuestion.question.substring(0, 100) + '...'
        : firstQuestion.question;

    // Обработчик клика на первый вопрос
    const firstQuestionBlock = document.querySelector('.question-block[data-index="0"]');
    addQuestionBlockListener(firstQuestionBlock, 0);
}

function addQuestionBlockListener(questionBlock, questionIndex) {
    questionBlock.addEventListener('click', () => {
        if (quizCompleted) {
            showQuestionAnswer(questionIndex);
        } else if (currentQuestionIndex === questionIndex) {
            activateQuestion(questionIndex);
        }
    });
}

// Функция для показа следующего вопроса
function showNextQuestion(nextIndex) {
    const question = shuffledQuestions[nextIndex];

    const questionBlock = document.createElement('div');
    questionBlock.className = 'question-block';
    questionBlock.dataset.index = nextIndex;

    const questionNumber = document.createElement('div');
    questionNumber.className = 'question-number';
    questionNumber.textContent = `Вопрос ${nextIndex + 1}`;

    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = question.question.length > 100
        ? question.question.substring(0, 100) + '...'
        : question.question;

    questionBlock.appendChild(questionNumber);
    questionBlock.appendChild(questionText);

    // Обработчик клика на блок вопроса
    addQuestionBlockListener(questionBlock, nextIndex);

    questionsContainer.appendChild(questionBlock);
}

// Функция активации вопроса
function activateQuestion(index) {
    // Деактивируем предыдущий активный вопрос
    if (currentActiveQuestion !== null) {
        const prevQuestion = document.querySelector(`.question-block[data-index="${currentActiveQuestion}"]`);
        if (prevQuestion) {
            prevQuestion.classList.remove('active');
        }
    }

    // Активируем новый вопрос
    const questionBlock = document.querySelector(`.question-block[data-index="${index}"]`);
    questionBlock.classList.add('active');
    currentActiveQuestion = index;

    // Показываем варианты ответов
    displayAnswers(index);

    if (index + 1 < totalQuestions && !document.querySelector(`.question-block[data-index="${index + 1}"]`)) {
        showNextQuestion(index + 1);
    }
}

// Функция отображения вариантов ответов
function displayAnswers(questionIndex) {
    const question = shuffledQuestions[questionIndex];

    // Очищаем контейнер с ответами
    answersContainer.innerHTML = '';

    // Добавляем текст текущего вопроса
    const currentQuestionElement = document.createElement('div');
    currentQuestionElement.className = 'current-question';
    currentQuestionElement.textContent = `Вопрос ${questionIndex + 1}: ${question.question}`;
    answersContainer.appendChild(currentQuestionElement);

    // Создаем контейнер для ответов
    const answersElement = document.createElement('div');
    answersElement.className = 'answers';

    // Перемешиваем ответы
    const shuffledAnswers = shuffleAnswers(question.answers);

    // Добавляем варианты ответов
    shuffledAnswers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer';
        answerElement.textContent = answer.text;
        answerElement.dataset.correct = answer.correct;
        answerElement.addEventListener('click', () => selectAnswer(answerElement, questionIndex));
        answersElement.appendChild(answerElement);
    });

    answersContainer.appendChild(answersElement);

    // Добавляем блок для пояснения
    const explanationElement = document.createElement('div');
    explanationElement.className = 'explanation';
    explanationElement.textContent = question.explanation;
    answersContainer.appendChild(explanationElement);
}

// Функция выбора ответа
function selectAnswer(answerElement, questionIndex) {
    // Если уже отвечали на этот вопрос, не позволяем выбрать другой ответ
    const questionBlock = document.querySelector(`.question-block[data-index="${questionIndex}"]`);

    // Отмечаем выбранный ответ
    const answers = answersContainer.querySelectorAll('.answer');
    answers.forEach(answer => {
        answer.classList.remove('selected');
        answer.style.pointerEvents = 'none'; // Блокируем возможность выбора других ответов
    });
    answerElement.classList.add('selected');

    // Проверяем правильность ответа
    const isCorrect = answerElement.dataset.correct === 'true';

    // Добавляем маркер правильности в блок вопроса
    const questionNumberElement = questionBlock.querySelector('.question-number');
    const marker = document.createElement('span');
    marker.className = `marker ${isCorrect ? 'correct-marker' : 'incorrect-marker'}`;
    marker.textContent = isCorrect ? ' ✓' : ' ✗';
    questionNumberElement.appendChild(marker);

    // Обновляем счетчик
    if (isCorrect) {
        score++;
    }

    // Отмечаем вопрос как отвеченный
    questionBlock.classList.add('answered');
    questionBlock.classList.remove('active');

    // Показываем пояснение для правильного ответа
    if (isCorrect) {
        const correctAnswer = answersContainer.querySelector('.answer[data-correct="true"]');
        correctAnswer.classList.add('correct');

        const explanationElement = answersContainer.querySelector('.explanation');
        explanationElement.style.display = 'block';

        // Увеличиваем блок с правильным ответом
        correctAnswer.style.transform = 'scale(1.05)';
        correctAnswer.style.transition = 'all 0.3s ease';
    } else {
        answerElement.classList.add('incorrect');
    }

    // Через 1 секунду начинаем анимацию исчезновения ответов
    setTimeout(() => {
        // Сначала скрываем неправильные ответы
        const incorrectAnswers = answersContainer.querySelectorAll('.answer:not(.correct)');
        incorrectAnswers.forEach((answer, index) => {
            setTimeout(() => {
                answer.style.transform = 'translateY(100px)';
                answer.style.opacity = '0';
            }, index * 300);
        });

        // Затем скрываем правильный ответ
        const correctAnswer = answersContainer.querySelector('.answer.correct');
        if (correctAnswer) {
            setTimeout(() => {
                correctAnswer.style.transform = 'translateY(100px)';
                correctAnswer.style.opacity = '0';
            }, incorrectAnswers.length * 300 + 300);
        }

        // Переходим к следующему вопросу
        setTimeout(() => {
            currentQuestionIndex++;

            if (currentQuestionIndex < totalQuestions) {
                // Активируем следующий вопрос
                activateQuestion(currentQuestionIndex);
            } else {
                // Завершаем тест
                completeQuiz();
            }
        }, incorrectAnswers.length * 300 + 800);
    }, 1000);
}

// Функция завершения теста
function completeQuiz() {
    quizCompleted = true;

    // Показываем сообщение о завершении вопросов
    noQuestionsElement.classList.remove('hidden');

    // Показываем статистику
    statsElement.classList.remove('hidden');
    scoreTextElement.textContent = `Вы ответили правильно на ${score} из ${totalQuestions} вопросов`;

    // Очищаем контейнер с ответами
    answersContainer.innerHTML = '';

    // Добавляем сообщение о завершении теста
    const completionMessage = document.createElement('div');
    completionMessage.className = 'no-questions';
    completionMessage.textContent = 'Тест завершен! Нажмите на любой вопрос, чтобы увидеть правильный ответ.';
    answersContainer.appendChild(completionMessage);
}

// Функция показа правильного ответа (после завершения теста)
function showQuestionAnswer(questionIndex) {
    const question = shuffledQuestions[questionIndex];

    // Очищаем контейнер с ответами
    answersContainer.innerHTML = '';

    // Добавляем текст вопроса
    const currentQuestionElement = document.createElement('div');
    currentQuestionElement.className = 'current-question';
    currentQuestionElement.textContent = `Вопрос ${questionIndex + 1}: ${question.question}`;
    answersContainer.appendChild(currentQuestionElement);

    // Создаем контейнер для ответов
    const answersElement = document.createElement('div');
    answersElement.className = 'answers';

    // Добавляем варианты ответов с выделением правильного
    question.answers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer';
        answerElement.textContent = answer.text;

        if (answer.correct) {
            answerElement.classList.add('correct');
        }

        answersElement.appendChild(answerElement);
    });

    answersContainer.appendChild(answersElement);

    // Добавляем пояснение
    const explanationElement = document.createElement('div');
    explanationElement.className = 'explanation';
    explanationElement.textContent = question.explanation;
    explanationElement.style.display = 'block';
    answersContainer.appendChild(explanationElement);
}

// Инициализация теста при загрузке страницы
document.addEventListener('DOMContentLoaded', initQuiz);
