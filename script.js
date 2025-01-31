const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const nextButton = document.getElementById('next-btn');
const scoreElement = document.getElementById('score');
const scoreContainer = document.getElementById('score-container');
const quizContainer = document.getElementById('quiz');
const restartButton = document.getElementById('restart-btn');
const summaryContainer = document.getElementById('summary');
const correctCountElement = document.getElementById('correct-count');
const wrongCountElement = document.getElementById('wrong-count');
const accuracyFill = document.getElementById('accuracy-fill');
const accuracyPercentage = document.getElementById('accuracy-percentage');

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let userAnswers = [];
let correctCount = 0;
let wrongCount = 0;

async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        const data = await response.json();
        questions = data.results.map(question => ({
            question: question.question,
            answers: [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5),
            correct: question.correct_answer
        }));
        userAnswers = [];
        startQuiz();
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionElement.innerHTML = 'Error loading questions. Please try again.';
    }
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    correctCountElement.textContent = '0';
    wrongCountElement.textContent = '0';
    updateAccuracy();
    nextButton.innerHTML = 'Next';
    showQuestion();
}

function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    questionElement.innerHTML = decodeHTMLEntities(currentQuestion.question);

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = decodeHTMLEntities(answer);
        button.classList.add('btn');
        button.addEventListener('click', selectAnswer);
        choicesElement.appendChild(button);
    });
}

function resetState() {
    nextButton.style.display = 'none';
    while (choicesElement.firstChild) {
        choicesElement.removeChild(choicesElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const currentQuestion = questions[currentQuestionIndex];
    const correct = currentQuestion.correct;
    const isCorrect = selectedButton.innerHTML === decodeHTMLEntities(correct);

    userAnswers.push({
        question: currentQuestion.question,
        userAnswer: selectedButton.innerHTML,
        correctAnswer: correct,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        selectedButton.classList.add('correct');
        score++;
        correctCount++;
        correctCountElement.textContent = correctCount;
    } else {
        selectedButton.classList.add('wrong');
        wrongCount++;
        wrongCountElement.textContent = wrongCount;
    }

    updateAccuracy();

    Array.from(choicesElement.children).forEach(button => {
        if (button.innerHTML === decodeHTMLEntities(correct)) {
            button.classList.add('correct');
        }
        button.disabled = true;
    });

    nextButton.style.display = 'block';
}

function showScore() {
    resetState();
    questionElement.innerHTML = '';
    scoreElement.innerHTML = `${score} out of ${questions.length}`;
    summaryContainer.innerHTML = ''; // Clear previous summary

    userAnswers.forEach((answer, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question-summary');
        
        const questionText = decodeHTMLEntities(answer.question);
        const userAnswer = decodeHTMLEntities(answer.userAnswer);
        const correctAnswer = decodeHTMLEntities(answer.correctAnswer);
        
        questionDiv.innerHTML = `
            <p class="summary-question">Question ${index + 1}: ${questionText}</p>
            <p class="summary-answer ${answer.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                Your answer: ${userAnswer}
                ${!answer.isCorrect ? `<br>Correct answer: ${correctAnswer}` : ''}
            </p>
        `;
        
        summaryContainer.appendChild(questionDiv);
    });

    quizContainer.classList.add('hide');
    scoreContainer.classList.remove('hide');
}

function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

function updateAccuracy() {
    const totalAnswers = correctCount + wrongCount;
    const accuracy = totalAnswers === 0 ? 0 : (correctCount / totalAnswers) * 100;
    accuracyFill.style.height = `${accuracy}%`;
    accuracyPercentage.textContent = `${Math.round(accuracy)}%`;
}

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
});

restartButton.addEventListener('click', () => {
    summaryContainer.innerHTML = '';
    quizContainer.classList.remove('hide');
    scoreContainer.classList.add('hide');
    fetchQuestions();
});

// Start the quiz
fetchQuestions(); 