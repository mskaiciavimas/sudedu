const resetButtonElement = document.querySelector('.reset-button');
resetButtonElement.addEventListener("click", redirectToIndex);

const setTimerElement = document.querySelector('.set-timer-button');
const setQuestionNumberElement = document.querySelector('.set-question-number-button');
const modeChoice4DIv = document.querySelector('.modeChoice4-div');

const timerInputElement = document.querySelector('#timer-input');
const timerInputDivElement = document.querySelector('.timer-input-div');
const questionNumberDivElement = document.querySelector('.question-number-input-div');
const questionNumberInputElement = document.querySelector('#question-number-input');
const startQuestionsTimerButtonElement = document.querySelector('.start-questions-timer-button');
const startQuestionsNumberButtonElement = document.querySelector('.start-questions-number-button');

let answerInputElement = document.querySelector('#answer');
const trackersElement = document.querySelector('.trackers');

let modeChoiceMessageElement = document.querySelector('.mode-choice-message');
let equationAnswerDivElement = document.querySelector('.equation-answer-div');

let timerLabelElement = document.querySelector('.timer-label');
let answerNumberLabelElement = document.querySelector('.answer-number-label');

const linkElement = document.querySelector("#questionsStyleSheet");

function startQuestions () {
    controller = JSON.parse(localStorage.getItem('controller'));
    if (controller.modeChoice4 === "C39") {
        startQuestionsTimer()
      } else if (controller.modeChoice4 = "C40") {
        startQuestionsNumber()
      }
  };


function startQuestionsTimer () {
    controller = JSON.parse(localStorage.getItem('controller'));
    if (controller.taskId !== 0) {
        controller.timerLimit = parseInt(controller.setTaskDuration);
      } else {
    controller.timerLimit = parseInt(timerInputElement.value);
    }
if (!controller.timerLimit) {
controller.timerLimit = 5;
}
if (localStorage.getItem("startTime")) {
localStorage.removeItem("startTime");
}
    controller.result = ['', '', '', '', '']
    controller.currentMistakes = [];
    controller.mistakesTracker = 0;
    controller.answeredQuestionTracker = 0;
    controller.equation = '';
    controller.equation2 = '';
    controller.randomSelection = [];
    controller.questionsStopped = false;
    generateCombinations();
    localStorage.setItem('controller', JSON.stringify(controller));
redirectToQuestions();

};

function startQuestionsNumber () {
    controller = JSON.parse(localStorage.getItem('controller'));
    if (controller.taskId !== 0) { 
        controller.questionNumber = parseInt(controller.setTaskDuration);
      } else {
        controller.questionNumber = parseInt(questionNumberInputElement.value);
      }
if (!controller.questionNumber) {
controller.questionNumber = 20;
}
if (localStorage.getItem("startTime")) {
localStorage.removeItem("startTime");
}
    controller.result = ['', '', '', '', '']
    controller.currentMistakes = [];
    controller.mistakesTracker = 0;
    controller.answeredQuestionTracker = 0;
    controller.equation = '';
    controller.randomSelection = [];
    controller.questionsStopped = false;
    generateCombinations();
    if (controller.combinations.length > controller.questionNumber) {
    controller.combinations = controller.combinations.sort(() => 0.5 - Math.random()).slice(0, controller.questionNumber);
    }
    localStorage.setItem('controller', JSON.stringify(controller));
    redirectToQuestions();

}

questionNumberInputElement.addEventListener("input", function(event) {
if (parseInt(questionNumberInputElement.value) === 1 || parseInt(questionNumberInputElement.value.slice(-1)[0]) === 1 && parseInt(questionNumberInputElement.value) !== 11) {
answerNumberLabelElement.innerHTML = 'equation';
} else {
answerNumberLabelElement.innerHTML = 'equations';
} 
})


// Get the input elements
const timerInput = document.getElementById('timer-input');
const questionNumberInput = document.getElementById('question-number-input');

// Function to restrict input to the defined min and max values
function restrictInputToMinMax(event) {
const input = event.target;
const min = parseInt(input.min);
const max = parseInt(input.max);
const value = parseInt(input.value);

if (isNaN(value)) {
input.value = min; // Reset to min value if input is not a number
} else if (value < min) {
input.value = 1; // Restrict input to min value
} else if (value > max) {
input.value = max; // Restrict input to max value
timerLabelElement.innerHTML = 'minutes';
answerNumberLabelElement.innerHTML = 'equations';
}
}