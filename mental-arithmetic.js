let controller = {
  language: '',
  mode: '',
	currentMistakes: [],
	totalMistakes: [],
	mistakesTracker: 0,
  classChoice: '',
	modeChoice: '',
	modeChoice2: '',
  modeChoice3: [],
  modeChoice4: '',
  modeChoice5: '',
  modeChoice6: '',
  modeChoice7: '',
  modeChoice8: '',
  task: null,
  setTaskDuration: '',
  taskCompleted: false,
  taskRecorded: false,
  modeChoiceLtDifficulty: '',
  questionFrequency: 0,
  timerLimit: 0,
  questionNumber: 0,
	selectedNumbers: [],
  withRemainder: false,
	randomSelection: [],
	combinations: [],
	equation: '',
  equation2: '',
  result: ['', '', '', '', ''],
	answeredQuestionTracker: 0,
  correctAnswersTracker: 0,
  questionsStopped: false
}

const LONG_TERM_RECORDING_ENABLED = true;
const PET_STATS_EXPIRATION = 0.0035 // EXPIRE FULLY IN 48 hrs
const MAX_CURRENT_MISTAKES_STORED = 100;
let columnFields = [];   // (checkAnswer: the column fields of the current check)

// Spelling tasks: what the results analysis needs to replay the task's questions - the seed they were generated from
// (LT/rasyba.html, rasyba-generator.js) and the student's grade (it decides which sentences fit). Saved in the
// result's duration after the length: ["C40", 20, seed, grade, highest text id, texts fingerprint] (a teacher's task
// already keeps its seed there); the texts there were, so that texts added later can be left out of a replay.
function grammarReplayInfo() {
  if (controller.mode !== "lang" || controller.modeChoice1 !== "C83" || !controller.grammarSeed) return null;
  const grade = typeof userData !== "undefined" && userData && Number.isInteger(Number(userData.knowledgeLvl)) ? Number(userData.knowledgeLvl) : null;
  const texts = Array.isArray(controller.grammarTexts) && controller.grammarTexts.length === 2 ? controller.grammarTexts : [null, null];
  return { seed: String(controller.grammarSeed).slice(0, 40), grade, textsMax: texts[0], textsHash: texts[1] };
}

// EXPERIMENTAL (pages that mark testers with html.experimental-on, e.g. uzduotys.html): mistake tables show the wrong
// answers next to each word / example, and a word's sentence only highlights the word
function mistakeTableShowsAnswers() {
  return window.SUDEDU_TABLE_ANSWERS === true || document.documentElement.classList.contains('experimental-on');
}
function escapeMistakeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}


const animationStepsAndDurationNumberDict = {
    "cat-1-sits-idle": [10, 2],
    "cat-1-sits-idle-blinks": [10, 2],
    "cat-1-sleeps": [4, 2],
    "cat-1-dances": [4, 0.5],
    "cat-1-talks": [8, 2],
    "cat-1-excited": [12, 1.5],
    "cat-1-lays-idle": [12, 2],
    "cat-1-sits-idle-thinks": [9, 2],
    "cat-1-cries": [4, 0.5],
    "cat-1-in-box-1": [12, 1.5],
    "cat-1-in-box-2": [4, 2],
    "cat-1-in-box-3": [4, 0.5],
    "cat-1-surprised": [12, 1.5],
    "cat-1-eats": [15, 2],
    "cat-1-waits": [6, 0.5],
    "cat-1-refuses": [13, 2],
    "cat-1-angry": [9, 2],
    "cat-1-happy": [12, 2],
    "cat-1-angry-2": [4, 1],
    "cat-1-licks-paw": [11, 2],
    "cat-1-medicine": [5, 1.5],
    "cat-1-sick": [4, 1],
    "cat-1-walks-upwards": [4, 0.85],
    "cat-1-walks-downwards": [4, 0.85],
    "cat-1-walks-sideways": [4, 0.85],
    "cat-1-stands-idle": [4, 0.85],
    "cat-1-claps": [3, 0.5],
    "cat-1-dragged": [4, 1],
    "cat-1-hidden": [1, 1],
    "cat-1-jumps-on-platform": [10 ,1],
    "cat-2-sits-idle": [10, 2],
    "cat-2-sits-idle-blinks": [10, 2],
    "cat-2-sleeps": [4, 2],
    "cat-2-dances": [4, 0.5],
    "cat-2-talks": [8, 2],
    "cat-2-excited": [12, 1.5],
    "cat-2-lays-idle": [12, 2],
    "cat-2-sits-idle-thinks": [9, 2],
    "cat-2-cries": [4, 0.5],
    "cat-2-in-box-1": [12, 1.5],
    "cat-2-in-box-2": [4, 2],
    "cat-2-in-box-3": [4, 0.5],
    "cat-2-surprised": [12, 1.5],
    "cat-2-eats": [15, 2],
    "cat-2-waits": [6, 0.5],
    "cat-2-refuses": [13, 2],
    "cat-2-angry": [9, 2],
    "cat-2-happy": [12, 2],
    "cat-2-angry-2": [4, 1],
    "cat-2-licks-paw": [11, 2],
    "cat-2-medicine": [5, 1.5],
    "cat-2-sick": [4, 1],
    "cat-2-walks-upwards": [4, 0.85],
    "cat-2-walks-downwards": [4, 0.85],
    "cat-2-walks-sideways": [4, 0.85],
    "cat-2-stands-idle": [4, 0.85],
    "musicPlayerOff": [1, 1],
    "musicPlayerOn": [1, 1],
    "bath-1-empty": [1, 1],
    "bath-1-filled": [6 ,1],
    "bath-1-with-pet": [6, 1],

    "ghost-1-invisible": [1, 1],
    "ghost-1-appears": [4, 0.5],
    "ghost-1-disappears": [4, 0.5],
    "ghost-1-stands-idle": [12, 1.5],
    "ghost-1-stands-idle": [12, 1.5],
    "ghost-1-walks-downwards": [12, 1.5],
    "ghost-1-walks-upwards": [12, 1.5],
    "ghost-1-walks-sideways": [12, 1.5],
    "ghost-1-scares": [24, 1.5],
    "ghost-1-chats": [12, 1.5],
    "ghost-1-surprised": [12, 1.5],
    "ghost-1-haunting": [24, 1.5],
}

function resetControllerTaskSettings () {
  controller.mode = '',
  controller.currentMistakes = [],
  controller.mistakesTracker = 0,
  controller.classChoice = '',
  controller.modeChoice = '',
  controller.modeChoice2 = '',
  controller.modeChoice3 = [],
  controller.modeChoice4 = '',
  controller.modeChoice5 = '',
  controller.modeChoice6 = '',
  controller.modeChoice7 = '',
  controller.modeChoice8 = '',
  controller.setTaskDuration = '',
  controller.task = null;
  controller.taskCompleted = false,
  controller.taskRecorded = false,
  controller.modeChoiceLtDifficulty = '',
  controller.questionFrequency = 0,
  controller.timerLimit = 0,
  controller.questionNumber = 0,
  controller.selectedNumbers = [],
  controller.withRemainder = false,
  controller.randomSelection = [],
  controller.combinations = [],
  controller.equation = '',
  controller.equation2 = '',
  controller.result = ['', '', '', '', ''],
  controller.answeredQuestionTracker = 0,
  controller.correctAnswersTracker = 0,
  controller.questionsStopped = false
  controller.grammarSeed = ''
  controller.grammarTexts = null
  localStorage.setItem('controller', JSON.stringify(controller))
}

const fireworksDiv = document.querySelector('#fireworks-div');
let upperLineElement = document.querySelector('.upper-line');
let previousEquationElement = document.querySelector('.previous-equation');
let answerTrackerElement = document.querySelector('#answer-tracker');
let mistakeTrackerElement = document.querySelector('#mistake-tracker');
let stulpeliuDivElement = document.querySelector('#stulpeliu-div');
let divisionStulp2InnerElement = document.querySelector('#division-stulp-2-inner');
let divisionStulp3InnerElement = document.querySelector('#division-stulp-3-inner');
let arithmeticSymbol = document.querySelector('#arithmetic-symbol');
let answerFieldDivInvisibleDiv = document.querySelector('#answer-field-div-invisible-div');

if (document.querySelector("#stopButton")) {
  document.querySelector("#stopButton").disabled = false;
}
if (document.querySelector(".summary-button")) {
  document.querySelector(".summary-button").disabled = false;
}
if (document.querySelector("#stop-button-span")) {
  document.querySelector("#stop-button-span").disabled = false;
}

    async function formatFinalMessage () {

      if (document.querySelector(".upper-line")) {
        document.querySelector(".upper-line").style.display = "none";
      }

      let aditionalFinalMessage = null;

      if (userData && userData.accType === "student" && controller.taskCompleted && !controller.taskRecorded) {
        aditionalFinalMessage = await sendSetTaskResultsToDatabase();
        setPetOnWalkActionAfterQuestionsCompleted();
      }

      document.querySelector('#invisibleRow').style.display = "none";
      if (!controller.questionsStopped && controller.mistakesTracker === 0 && controller.answeredQuestionTracker >= 10) {
        triggerFireworks();
      }

      if (controller.task) {
        if (!controller.taskCompleted) {
          showUnfinishedTaskMessage();
        }
      }

      controller.equation = finalMessageText();

      if (aditionalFinalMessage) {
        controller.equation += aditionalFinalMessage
      }
      
      controller.equation2 = '';
      controller.result = ['', '', '', '', ''];
      controller.questionsStopped = true;
      clearInterval(timerInterval);
      const stopButtonSpanElement = document.querySelector('#stop-button-span');
      stopButtonSpanElement.innerHTML = "refresh";
      localStorage.setItem('controller', JSON.stringify(controller))
    }

	async function formEquation () {
    let remainingTime = parseInt(localStorage.getItem('remainingTime'));
    if (controller.modeChoice4 === "C39") {
      if (controller.combinations.length === 0 && remainingTime > 0 && !controller.questionsStopped) {
        generateCombinations()
      }
      if (controller.combinations.length > 0 && remainingTime > 0 && !controller.questionsStopped) {
        formatEquation()
      }
      if (remainingTime <= 0) {
        controller.taskCompleted = true;
        localStorage.setItem('controller', JSON.stringify(controller))
        await formatFinalMessage()
      }
    } else if (controller.modeChoice4 === "C40") {
      if (controller.combinations.length === 0 && controller.answeredQuestionTracker < controller.questionNumber && !controller.questionsStopped) {
        generateCombinations()
        if (controller.combinations.length > controller.questionNumber - controller.answeredQuestionTracker) {
          controller.combinations = controller.combinations.slice(0, controller.questionNumber - controller.answeredQuestionTracker);
        }
      }
      if (controller.combinations.length > 0 && controller.answeredQuestionTracker < controller.questionNumber && !controller.questionsStopped) {
        formatEquation()
      }
      if (controller.answeredQuestionTracker === controller.questionNumber) {
        localStorage.setItem("elapsedTime", timerDisplay.textContent)
        controller.taskCompleted = true;
        localStorage.setItem('controller', JSON.stringify(controller))
        await formatFinalMessage()
      }
    }
  
    function formatEquation () { 
    if (controller.result[0] === "Correct" && controller.result[1] === controller.randomSelection[0] && controller.result[2] === controller.randomSelection[1] || controller.randomSelection.length === 0) {
		controller.randomSelection = controller.combinations[Math.floor(Math.random() * controller.combinations.length)];
    };
    if (controller.modeChoice5 === "C41") {
      if (controller.modeChoice7 === "C47") {
        if (controller.randomSelection[2] === 'A') {
          controller.equation = `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = `;
        } else if (controller.randomSelection[2] === 'S') {
          controller.equation = `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = `;
        } else if (controller.randomSelection[2] === 'M') {
          controller.equation = `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = `;
        } else if (controller.randomSelection[2] === 'D') {
          if (controller.language === 'LT') {
            controller.equation = `${controller.randomSelection[0]} \uA789 ${controller.randomSelection[1]} = `;
          } else if (controller.language === 'EN') {
            controller.equation = `${controller.randomSelection[0]} \u00F7 ${controller.randomSelection[1]} = `;            
          }
        } 
      } else if (controller.modeChoice7 === "C48") {
        if (controller.randomSelection[2] === 'A') {
        const maxLength = 20; // Adjust as needed
        const item1 = String(controller.randomSelection[0]);
        const item2 = String(controller.randomSelection[1]);
    
        // Pad the items with appropriate spaces to align them
        const paddedItem1 = item1.padStart(maxLength);
        const paddedItem2 = item2.padStart(maxLength);
    
        // Concatenate the padded items
        controller.equation = `<div class="demuo-turinys-ateminys" style="text-align: right;">${paddedItem1}</div><div class="demuo-turinys-ateminys" style="text-align: right;">${paddedItem2}</div>`;
        } else if (controller.randomSelection[2] === 'S') {
        const maxLength = 20; // Adjust as needed
        const item1 = String(controller.randomSelection[0]);
        const item2 = String(controller.randomSelection[1]);
    
        // Pad the items with appropriate spaces to align them
        const paddedItem1 = item1.padStart(maxLength);
        const paddedItem2 = item2.padStart(maxLength);
    
        // Concatenate the padded items
        controller.equation = `<div class="demuo-turinys-ateminys" style="text-align: right;">${paddedItem1}</div><div class="demuo-turinys-ateminys" style="text-align: right;">${paddedItem2}</div>`;
      } else if (controller.randomSelection[2] === 'M') {
        const maxLength = 0; // Adjust as needed
        const item1 = String(controller.randomSelection[0]);
        const item2 = String(controller.randomSelection[1]);
    
        // Pad the items with appropriate spaces to align them
        const paddedItem1 = item1.padStart(maxLength);
        const paddedItem2 = item2.padStart(maxLength);
    
        // Concatenate the padded items
        controller.equation = `<div class="daugiklis" style="text-align: right;">${paddedItem1}</div><div id="antras-daugiklis" class="daugiklis" style="text-align: right;">${paddedItem2}</div>`;
      } else if (controller.randomSelection[2] === 'D') {
        const item1 = String(controller.randomSelection[0]);
        const item2 = String(controller.randomSelection[1]);
    
        // Concatenate the padded items
        if (controller.modeChoice8 === "" || controller.modeChoice8 === 'C79') {
          controller.equation = `<div id="equation-div-kampu-holder" style="display: flex; position: relative;"><div id="dalinys-outer" style="display: flex; position: relative;"><div id="dalinys">${item1}</div></div><div id="daliklis-outer"><div id="daliklis" style="border-bottom: 2px solid black; border-left: 2px solid black;">${item2}</div></div></div>`;
        } else if (controller.modeChoice8 === 'C78') {
          controller.equation = `<div id="first-number-outer-div" style="display: flex; position: relative;"><div id="daliklis">${item2}</div><div id="dalinys" style="border-top: 2px solid black; border-left: 2px solid black;">${item1}</div></div>`;
        }
      } 
    }
    } else if (controller.modeChoice5 === "C42") {
      if (controller.randomSelection[2] === 'A') {
        if (controller.randomSelection[3]) {
          if (controller.randomSelection[3] === 'first') {
            controller.equation = ``;
            controller.equation2 = ` + ${controller.randomSelection[1]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`
          } else if (controller.randomSelection[3] === 'second') {
            controller.equation = `${controller.randomSelection[0]} + `;
            controller.equation2 = `= ${controller.randomSelection[0] + controller.randomSelection[1]}`
          }
        } else {
          const randomNum = Math.random();
          if (randomNum < 0.5) {
          controller.randomSelection.push("first");
          controller.equation = ``;
          controller.equation2 = ` + ${controller.randomSelection[1]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`;
        } else {
          controller.randomSelection.push("second");
          controller.equation = `${controller.randomSelection[0]} + `;
          controller.equation2 = `= ${controller.randomSelection[0] + controller.randomSelection[1]}`;
        }
        }
      } else if (controller.randomSelection[2] === 'S') {
        
        if (controller.randomSelection[3]) {
          if (controller.randomSelection[3] === 'first') {
            controller.equation = ``;
            controller.equation2 = ` - ${controller.randomSelection[1]} = ${controller.randomSelection[0] - controller.randomSelection[1]}`
          } else if (controller.randomSelection[3] === 'second') {
            controller.equation = `${controller.randomSelection[0]} - `;
            controller.equation2 = `= ${controller.randomSelection[0] - controller.randomSelection[1]}`
          }
        } else {
          if (controller.modeChoice1 === "C7" || controller.modeChoice1 === "C3") {
            const randomNum = Math.random();
            if (randomNum < 0.5) {
            controller.randomSelection.push("first");
            controller.equation = ``;
            controller.equation2 = ` - ${controller.randomSelection[1]} = ${controller.randomSelection[0] - controller.randomSelection[1]}`;
          } else {
            controller.randomSelection.push("second");
            controller.equation = `${controller.randomSelection[0]} - `;
            controller.equation2 = `= ${controller.randomSelection[0] - controller.randomSelection[1]}`
          }
          }
          else if (controller.modeChoice6 === "C43") {
            controller.randomSelection.push("first");
            controller.equation = ``;
            controller.equation2 = ` - ${controller.randomSelection[1]} = ${controller.randomSelection[0] - controller.randomSelection[1]}`;
          } else if (controller.modeChoice6 === "C44") {
            controller.randomSelection.push("second");
            controller.equation = `${controller.randomSelection[0]} - `;
            controller.equation2 = `= ${controller.randomSelection[0] - controller.randomSelection[1]}`
          }
        }

      } else if (controller.randomSelection[2] === 'M') {
        
        if (controller.randomSelection[3]) {
          if (controller.randomSelection[3] === 'first') {
            controller.equation = ``;
            controller.equation2 = ` \u00D7 ${controller.randomSelection[1]} = ${controller.randomSelection[0] * controller.randomSelection[1]}`
          } else if (controller.randomSelection[3] === 'second') {
            controller.equation = `${controller.randomSelection[0]} \u00D7 `;
            controller.equation2 = `= ${controller.randomSelection[0] * controller.randomSelection[1]}`;
          }
        } else {
          const randomNum = Math.random();
          if (randomNum < 0.5) {
          controller.randomSelection.push("first");
          controller.equation = ``;
          controller.equation2 = ` \u00D7 ${controller.randomSelection[1]} = ${controller.randomSelection[0] * controller.randomSelection[1]}`
        } else {
          controller.randomSelection.push("second");
          controller.equation = `${controller.randomSelection[0]} \u00D7 `;
          controller.equation2 = `= ${controller.randomSelection[0] * controller.randomSelection[1]}`;
        }
        }

      } else if (controller.randomSelection[2] === 'D') {
          if (controller.randomSelection[3]) {
            if (controller.randomSelection[3] === 'first') {
              controller.equation = ``;
              controller.equation2 = ` \uA789 ${controller.randomSelection[1]} = ${controller.randomSelection[0] / controller.randomSelection[1]}`
            } else if (controller.randomSelection[3] === 'second') {
              controller.equation = `${controller.randomSelection[0]} \uA789 `;
              controller.equation2 = `= ${controller.randomSelection[0] / controller.randomSelection[1]}`
            }
          } else {
            if (controller.modeChoice1 === "C7" || controller.modeChoice1 === "C6") {
              const randomNum = Math.random();
              if (randomNum < 0.5) {
              controller.randomSelection.push("first");
              controller.equation = ``;
              controller.equation2 = ` \uA789 ${controller.randomSelection[1]} = ${controller.randomSelection[0] / controller.randomSelection[1]}`
            } else {
              controller.randomSelection.push("second");
              controller.equation = `${controller.randomSelection[0]} \uA789 `;
              controller.equation2 = `= ${controller.randomSelection[0] / controller.randomSelection[1]}`
            }
            }
            if (!controller.randomSelection[3] && controller.modeChoice6 === "C45") {
              controller.randomSelection.push("first");
              controller.equation = ``;
              controller.equation2 = ` \uA789 ${controller.randomSelection[1]} = ${controller.randomSelection[0] / controller.randomSelection[1]}`
            } else if (!controller.randomSelection[3] && controller.modeChoice6 === "C46") {
              controller.randomSelection.push("second");
              controller.equation = `${controller.randomSelection[0]} \uA789 `;
              controller.equation2 = `= ${controller.randomSelection[0] / controller.randomSelection[1]}`
            }
          }
    }
  }

    } 

    localStorage.setItem('controller', JSON.stringify(controller))
}

async function recordGrammarFinalMistakes() {
	Object.keys(mistakeRecords).forEach(key => {
		controller.currentMistakes.push([mistakeRecords[key]["wordWithAnswer"], mistakeRecords[key]["wordGrammarType"], [mistakeRecords[key]["mistakesCounter"], mistakeRecords[key]["wrongAnswer"]], mistakeRecords[key]["wordId"]])
		controller.totalMistakes.push([mistakeRecords[key]["wordWithAnswer"], mistakeRecords[key]["wordGrammarType"], [mistakeRecords[key]["mistakesCounter"], mistakeRecords[key]["wrongAnswer"]], mistakeRecords[key]["wordId"]])
	});

	while (controller.currentMistakes.length > MAX_CURRENT_MISTAKES_STORED) {
      controller.currentMistakes.splice(0, 1)
    }
	
	while (controller.totalMistakes.length > 29) {
      controller.totalMistakes.splice(0, 1)
    }
  }

function styleGrammarPage () {
  document.querySelector("#field-for-final-message").style.height = "auto";
  const linkElement = document.querySelector("#questionsStyleSheet");
  if (controller.questionsStopped) {
    linkElement.setAttribute("href", "../questions-stopped.css");
  } else {
    linkElement.removeAttribute("href");
  }
}

async function formatFinalMessageForGrammar() {
  localStorage.setItem("elapsedTime", timerDisplay.textContent)
  await recordGrammarFinalMistakes();

    let aditionalFinalMessage = null

    if (userData && userData.accType === "student" && controller.taskCompleted && !controller.taskRecorded) {
      aditionalFinalMessage = await sendSetTaskResultsToDatabase();
      setPetOnWalkActionAfterQuestionsCompleted();
    }

  document.querySelector('#restart-reset-button-row').style.display = "flex";
  document.getElementById('next-question').style.display = "none";
  document.getElementById('check-answers').style.visibility = "hidden";
  document.getElementById('show-answers').style.visibility = "hidden";
  document.querySelector('.help-toggle-holder').style.visibility = "hidden";
  clearInterval(timerInterval);
  document.querySelector('#stop-button-span').innerHTML = "refresh";
  document.getElementById("field-for-sentences").innerHTML = "";

  if (!controller.questionsStopped && controller.mistakesTracker === 0 && controller.answeredQuestionTracker >= 5) {
    triggerFireworks();
  }

  if (controller.task) {
    if (!controller.taskCompleted) {
      showUnfinishedTaskMessage();
    }
  }

  document.getElementById("field-for-final-message").innerHTML = `<div class="field-for-final-message-inner">${finalMessageText()}</div>`;
  
  if (aditionalFinalMessage) {
      document.getElementById("field-for-final-message").innerHTML += aditionalFinalMessage
    }

  if (document.getElementById('hidden-input')) {
    document.getElementById('hidden-input').dataset.currentId = "";
    document.getElementById('hidden-input').value = ''
    document.getElementById('hidden-input').blur();
  }

  controller.questionsStopped = true;
  styleGrammarPage();
  localStorage.setItem('controller', JSON.stringify(controller))
}

function styleTextComprahensionPage () {
  const linkElement = document.querySelector("#questionsStyleSheet");
  if (controller.questionsStopped) {
    linkElement.setAttribute("href", "../questions-stopped.css");
  } else {
    linkElement.removeAttribute("href");
  }
}

function recordFinalMistakesForTextComprehension() {
  let mistakeList = [];

  // Calculate how many extra entries exist
  const extraLength = mistakesSummary.length - controller.answeredQuestionTracker;

  // Truncate mistakesSummary from the end if it's longer
  const trimmedMistakesSummary = extraLength > 0
    ? mistakesSummary.slice(0, mistakesSummary.length - extraLength)
    : mistakesSummary;

  // Process the (possibly trimmed) mistakesSummary
  for (const entry of trimmedMistakesSummary) {
    for (let i = 0; i < entry.attempts.length; i++) {
      mistakeList.push([entry.textId, entry.attempts[i]]);
    }
  }

  controller.currentMistakes = mistakeList;
}

async function formatFinalMessageForTextcomprehension() {
    localStorage.setItem("elapsedTime", timerDisplay.textContent)
    recordFinalMistakesForTextComprehension();

      let aditionalFinalMessage = null

      if (userData && userData.accType === "student" && controller.taskCompleted && !controller.taskRecorded) {
        aditionalFinalMessage = await sendSetTaskResultsToDatabase();
        setPetOnWalkActionAfterQuestionsCompleted();
      }

    if (!controller.questionsStopped && controller.mistakesTracker === 0 && controller.answeredQuestionTracker >= 1) {
      triggerFireworks();
    }

    if (controller.task) {
      if (!controller.taskCompleted) {
        showUnfinishedTaskMessage();
      }
    }

    document.getElementById("final-message-div").innerHTML = finalMessageText();

    if (aditionalFinalMessage) {
      document.getElementById("final-message-div").innerHTML += aditionalFinalMessage
    }
    
    document.getElementById('check-answer-btn').disabled = true;
    document.getElementById('help-btn').disabled = true;
    document.getElementById('next-question-btn').disabled = true;
    clearInterval(timerInterval);
    document.querySelector('#stop-button-span').innerHTML = "refresh";
    document.getElementById("fields-row").style.display = "none";
    document.getElementById("final-message-row").style.display = "flex";
    document.querySelector(".help-and-check-button-holder").style.display = "none"
    controller.questionsStopped = true;
    styleTextComprahensionPage();
    localStorage.setItem('controller', JSON.stringify(controller))
}

let redirectingToAuthentication = false;

async function sendSetTaskResultsToDatabase() {
  let closer;
  let showMessageTimeout;
  let additionalFinalMessage = null;

  showMessageTimeout = setTimeout(() => {
    let closerText; 
    if (controller.language === 'LT') {
      closerText= "Rezultatai saugomi. Neuždarykite šio lango."
    } else if (controller.language === 'EN') {
      closerText = "Saving results. Please do not leave this page."
    }
    closer = messageToTheUser(closerText, false);
  }, 500);

  let storedElapsedTimeMs = 0;
  const storedElapsedTime = localStorage.getItem("elapsedTime");
  if (storedElapsedTime) {
    const elapsedParts = String(storedElapsedTime).split(':').map(Number);
    if (elapsedParts.length === 3 && elapsedParts.every(Number.isFinite)) {
      storedElapsedTimeMs = ((elapsedParts[0] * 60 * 60) + (elapsedParts[1] * 60) + elapsedParts[2]) * 1000;
    } else if (elapsedParts.length === 2 && elapsedParts.every(Number.isFinite)) {
      storedElapsedTimeMs = ((elapsedParts[0] * 60) + elapsedParts[1]) * 1000;
    } else if (Number.isFinite(Number(storedElapsedTime))) {
      storedElapsedTimeMs = Number(storedElapsedTime);
    }
  }
  const taskElapsedTime = Number.isFinite(elapsedTime) && elapsedTime > 0
    ? elapsedTime
    : storedElapsedTimeMs;


  if (document.querySelector("#stopButton")) {
    document.querySelector("#stopButton").disabled = true;
  }
  if (document.querySelector("#stopButtonTextComp")) {
    document.querySelector("#stopButtonTextComp").disabled = true;
  }
  if (document.querySelector(".summary-button")) {
    document.querySelector(".summary-button").disabled = true;
  }
  if (document.querySelector("#stop-button-span")) {
    document.querySelector("#stop-button-span").disabled = true;
  }

  let requestSuccess;

  if (controller.task) {
    if (controller.task[0] === "setTask") {
      const totalAnswers = Number(controller.answeredQuestionTracker);
      const mistakes = Number(controller.mistakesTracker);
      if (!Number.isFinite(Number(totalAnswers)) || Number(totalAnswers) < 0) {
        throw new Error('Unable to save task results: total answer count is invalid.');
      }
      if (!Number.isFinite(mistakes) || mistakes < 0) {
        throw new Error('Unable to save task results: mistake count is invalid.');
      }
      const answerRate = taskElapsedTime > 0
        ? Number((totalAnswers / (taskElapsedTime / 1000 / 60)).toFixed(1))
        : 0;
      resultsData = {
        correct: Math.max(0, totalAnswers - mistakes),
        mistakes,
        totalAnswers,
        answerRate,
        mistakesDetail: controller.currentMistakes || []
      };
      const replay = grammarReplayInfo();
      if (replay) Object.assign(resultsData, replay);

      requestSuccess = await sendTaskResults(controller.task[1], resultsData)
      if (requestSuccess) {
        [requestSuccess, pointsEarned, coinsEarned] = await updateStudentPointsAndStatistics(coinMultiplier=1);
      }

      if (requestSuccess) {
        // No recordTaskToLongTerm() here: the results route already writes this result to the archive (with the
        // teacher task id, group and duration). Posting it again created a second row that counted as own practice.
        clearTimeout(showMessageTimeout);
        if (closer) {
          setTimeout(() => closer(), 0);
        }
        if (controller.language === 'LT') {
          messageToTheUser("Rezultatai sėkmingai išsaugoti.", false)
          additionalFinalMessage = `
          <span class="additional-final-message-holder">
              <span>uždirbai: </span>
              <span class="earnings-holder">
                <span class="coin-icon">
                        <img src="../images/icons/icon-sudedu-coin.png">
                </span>
                <span class="coin-amount">${coinsEarned.toFixed(2)}</span>
              </span>
          </span>
          `
        } else if (controller.language === 'EN') {
          messageToTheUser("Results were saved successfully.", false)
          additionalFinalMessage = `
          <span class="additional-final-message-holder">
              <span>you earned: </span>
              <span class="earnings-holder">
                <span class="coin-icon">
                        <img src="../images/icons/icon-sudedu-coin.png">
                </span>
                <span class="coin-amount">${coinsEarned.toFixed(2)}</span>
              </span>
          </span>
          `
        }

      } else {
        clearTimeout(showMessageTimeout);
        if (closer) {
          setTimeout(() => closer(), 0);
        }
        if (controller.language === 'LT') {
          messageToTheUser("Įvyko klaida. Rezultatai neišsaugoti. Bandykite vėl vėliau.")
        } else if (controller.language === 'EN') {
          messageToTheUser("An error has occurred. Results were not saved. Please try again later.")
        }
      }
    } else if (controller.task[0] === "weekChl") {

      const answered = controller.answeredQuestionTracker || 0;
      const mistakes = controller.mistakesTracker || 1; // avoid dividing by 0

      function calculateTotalScoreForTextComp(list) {
        // define mistake → multiplier rules per difficulty
        const difficultyRules = {
          C58: [1, 0.5],               // 0, 1 mistakes
          C59: [1, 0.5, 0.25],         // 0–2 mistakes
          C60: [1, 0.5, 0.25, 0.1]     // 0–3 mistakes
        };

        const rules = difficultyRules[controller.modeChoiceLtDifficulty] || [];

        const total = list.reduce((sum, [, mistakes]) => {
          const multiplier = rules[mistakes] ?? 0;
          return sum + multiplier;
        }, 0);

        // round final result to 2 decimals
        return Number(total.toFixed(2));
      }


      let resultsData;

      if (controller.modeChoice1 === "C49") {
        resultsData = calculateTotalScoreForTextComp(controller.currentMistakes);
      } else {
        resultsData = Math.max(0, answered - mistakes);
      }

      console.log(resultsData);

      try {
        const response = await apiFetch(apiBase + 'class/updateWeekChlScore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: userData.userId,
            weekChlId: controller.task[1],
            weekChlScore: resultsData
          })
        });

        if (!response) {
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        clearTimeout(showMessageTimeout);
        if (closer) {
          setTimeout(() => closer(), 0); // close after 0.5s
        }

        if (controller.language === 'LT') {
          additionalFinalMessage = `
          <span class="additional-final-message-holder">
              <span>surinkti taškai: </span>
              <span class="week-chl-points">
                ${resultsData}
              </span>
          </span>
          `;
          messageToTheUser("Savaitės iššūkio taškai sėkmingai išsaugoti.", false);
        } else if (controller.language === 'EN') {
          messageToTheUser("Weekly challenge score saved successfully.", false);
          additionalFinalMessage = `
          <span class="additional-final-message-holder">
              <span>points acquired: </span>
              <span class="week-chl-points">
                ${resultsData}
              </span>
          </span>
          `;
        }

      } catch (error) {
        console.error('Error saving week challenge score:', error);
        clearTimeout(showMessageTimeout);
        if (closer) {
          setTimeout(() => closer(), 0); // close after 0.5s
        }
        if (controller.language === 'LT') {
          messageToTheUser("Įvyko klaida. Savaitės iššūkio taškai neišsaugoti. Bandykite vėliau.");
        } else if (controller.language === 'EN') {
          messageToTheUser("An error occurred. Weekly challenge score not saved. Please try again later.");
        }
      }
      } else if (controller.task[0] === "personalChl") {
        [requestSuccess, pointsEarned, coinsEarned] = await updateStudentPointsAndStatistics(coinMultiplier=personalChlCoinBonusMultiplier);

        if (requestSuccess) {
          await recordTaskToLongTerm();
          clearTimeout(showMessageTimeout);
          if (closer) {
            setTimeout(() => closer(), 0);
          }
          if (controller.language === 'LT') {
            additionalFinalMessage = `
          <span class="additional-final-message-holder">
              <span>uždirbai: </span>
              <span class="earnings-holder">
                <span class="coin-icon">
                        <img src="../images/icons/icon-sudedu-coin.png">
                </span>
                <span class="coin-amount">${coinsEarned.toFixed(2)}</span>
              </span>
          </span>
          `;
            messageToTheUser("Rezultatai sėkmingai išsaugoti.", false)
          } else if (controller.language === 'EN') {
            additionalFinalMessage = `
            <span class="additional-final-message-holder">
                <span>you earned: </span>
                <span class="earnings-holder">
                  <span class="coin-icon">
                          <img src="../images/icons/icon-sudedu-coin.png">
                  </span>
                  <span class="coin-amount">${coinsEarned.toFixed(2)}</span>
                </span>
            </span>
            `;

            messageToTheUser("Results were saved successfully.", false)
          }
        } else {
          clearTimeout(showMessageTimeout);
          if (closer) {
            setTimeout(() => closer(), 0);
          }
          if (controller.language === 'LT') {
            messageToTheUser("Įvyko klaida. Rezultatai neišsaugoti. Bandykite vėl vėliau.")
          } else if (controller.language === 'EN') {
            messageToTheUser("An error has occurred. Results were not saved. Please try again later.")
          }
        }
      }
    } else {
      [requestSuccess, pointsEarned, coinsEarned] = await updateStudentPointsAndStatistics();

      if (requestSuccess) {
        await recordTaskToLongTerm();
        clearTimeout(showMessageTimeout);
        if (closer) {
          setTimeout(() => closer(), 0);
        }
        if (controller.language === 'LT') {
          additionalFinalMessage = `
          <span class="additional-final-message-holder">
              <span>uždirbai: </span>
              <span class="earnings-holder">
                <span class="coin-icon">
                        <img src="../images/icons/icon-sudedu-coin.png">
                </span>
                <span class="coin-amount">${coinsEarned.toFixed(2)}</span>
              </span>
          </span>
          `;
          messageToTheUser("Rezultatai sėkmingai išsaugoti.", false)
        } else if (controller.language === 'EN') {
          additionalFinalMessage = `
          <span class="additional-final-message-holder">
              <span>you earned: </span>
              <span class="earnings-holder">
                <span class="coin-icon">
                        <img src="../images/icons/icon-sudedu-coin.png">
                </span>
                <span class="coin-amount">${coinsEarned.toFixed(2)}</span>
              </span>
          </span>
          `;
          messageToTheUser("Results were saved successfully.", false)
        }
      } else {
        clearTimeout(showMessageTimeout);
        if (closer) {
          setTimeout(() => closer(), 0);
        }
        if (controller.language === 'LT') {
          messageToTheUser("Įvyko klaida. Rezultatai neišsaugoti. Bandykite vėl vėliau.")
        } else if (controller.language === 'EN') {
          messageToTheUser("An error has occurred. Results were not saved. Please try again later.")
        }
      }
    }

    if (controller.task && controller.task[0] !== "weekChl") {
      stopTaskProgressSync();
      controller.task = null;
    }
    controller.taskRecorded = true;
    localStorage.setItem('controller', JSON.stringify(controller))

    if (document.querySelector("#stopButton")) {
      document.querySelector("#stopButton").disabled = false;
    }
    if (document.querySelector("#stopButtonTextComp")) {
      document.querySelector("#stopButtonTextComp").disabled = false;
    }
    if (document.querySelector(".summary-button")) {
      document.querySelector(".summary-button").disabled = false;
    }
    if (document.querySelector("#stop-button-span")) {
      document.querySelector("#stop-button-span").disabled = false;
    }

    return additionalFinalMessage
}

async function sendTaskResults(taskId, resultsData) {
  const taskResults = {
    taskId,
    results: resultsData
  };
  try {
    const response = await apiFetch(apiBase + 'results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskResults)
    });

    if (!response) return false;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(errorData.message || `HTTP error! Status: ${response.status}`);
      return false
    }

    return true

  } catch (error) {
    console.log('Error saving task results:', error);
    return false
  }
}

// ---------------------------------------------------------------------------------------------
// Mid-task progress sync for teacher-assigned tasks ("setTask"). Shared by veiksmai.html (math),
// rasyba.html (grammar) and teksto-suvokimas.html (text comprehension) — all three already load
// this file and share the same `controller` object and tracker fields.
//
// Saves every 5s if something changed (answeredQuestionTracker/mistakesTracker moved), falls
// back to a time-only save every 30s if nothing changed (so elapsed/remaining time doesn't go
// stale during a long thinking/reading pause), and text-comprehension additionally calls
// `saveTaskProgressNow()` after every answer submit. On top of that, every time the mistake count
// goes up (one mistake, or several marked at once, e.g. in grammar) the progress is saved at once,
// so a teacher watching the task sees mistakes straight away. All of these funnel through the same
// `scheduleProgressSave` coalescing queue: at most one request in flight at a time, so rapid
// button-spam or several triggers firing close together never produce more than ~1 extra request
// beyond whatever is already in flight — important on a free-tier DB with a small connection cap.
// ---------------------------------------------------------------------------------------------
let taskProgressTimer = null;
let taskProgressIdleTicks = 0;
let taskProgressLastAnswered = 0;
let taskProgressLastMistakes = 0;
let taskProgressSaveInFlight = false;
let taskProgressSavePending = null;
let taskProgressStartedFlagSent = false;
let taskMistakeWatch = null;      // checks every 400 ms whether new mistakes were made (then saves at once)

function computeTaskSecondsElapsed() {
  const startTimeRaw = localStorage.getItem("startTime");
  if (startTimeRaw) {
    return Math.max(0, Math.floor((Date.now() - parseInt(startTimeRaw, 10)) / 1000));
  }
  const remainingRaw = localStorage.getItem("remainingTime");
  if (remainingRaw && controller.timerLimit) {
    const remainingMs = parseInt(remainingRaw, 10);
    return Math.max(0, controller.timerLimit * 60 - Math.floor(remainingMs / 1000));
  }
  return 0;
}

// Reads whatever the task-type-specific code already tracks on `controller` (and, for text
// comprehension / grammar, the page-local mistake-detail objects they only ever fold into
// `controller.currentMistakes` once, at actual task completion) — no new tracking variables needed.
function buildProgressSnapshot() {
  const sequencePosition = (controller.randomSelection && typeof controller.randomSelection[2] === "number")
    ? controller.randomSelection[2]
    : (controller.answeredQuestionTracker || 0);

  // controller.currentMistakes only ever holds mistakes carried over from a PRIOR interrupted
  // session (set once, at resume-hydration) — it is never written to again until the task is
  // actually finished. Math is the exception: recordMistakes() pushes onto it live, so it's
  // already current there. Grammar instead accumulates live detail in a page-local `mistakeRecords`
  // object, only converted into controller.currentMistakes once, at completion
  // (recordGrammarFinalMistakes) — so without this, every mid-session snapshot would report
  // `currentMistakes: []` no matter how many mistakes were actually made. Converting it here too
  // (into a throwaway array, without mutating mistakeRecords or controller.currentMistakes) closes
  // that gap: if the task gets interrupted again, this merged snapshot becomes next time's
  // resume-hydration baseline, and mistakeRecords starts clean next session — no double-counting.
  let currentMistakesForSnapshot = controller.currentMistakes || [];
  if (typeof mistakeRecords !== "undefined" && mistakeRecords) {
    const liveGrammarMistakes = Object.keys(mistakeRecords).map(key => [
      mistakeRecords[key]["wordWithAnswer"],
      mistakeRecords[key]["wordGrammarType"],
      [mistakeRecords[key]["mistakesCounter"], mistakeRecords[key]["wrongAnswer"]],
      mistakeRecords[key]["wordId"]
    ]);
    if (liveGrammarMistakes.length) {
      currentMistakesForSnapshot = [...currentMistakesForSnapshot, ...liveGrammarMistakes];
    }
  }

  return {
    answeredCount: controller.answeredQuestionTracker || 0,
    mistakesSoFar: controller.mistakesTracker || 0,
    secondsElapsed: computeTaskSecondsElapsed(),
    progress: {
      currentMistakes: currentMistakesForSnapshot,
      sequencePosition,
      passNumber: controller.passNumber || 0,
      // Only teksto-suvokimas.html defines this (page-local, not on `controller`); everywhere
      // else `typeof mistakesSummary` is safely "undefined".
      mistakesSummary: (typeof mistakesSummary !== "undefined" && Array.isArray(mistakesSummary))
        ? mistakesSummary
        : undefined
    }
  };
}

async function dispatchProgressSave(payload) {
  if (!controller.task || controller.task[0] !== "setTask") return false;
  const assignmentId = controller.task[1];
  const finalPayload = taskProgressStartedFlagSent ? payload : { ...payload, started: true };
  let saved = false;
  taskProgressSaveInFlight = true;
  try {
    const response = await apiFetch(apiBase + `tasks/${assignmentId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload)
    });
    if (response) {
      if (response.status === 404) {
        // Assignment already completed (archived) or deleted by the teacher — stop trying.
        stopTaskProgressSync();
      } else if (response.ok) {
        taskProgressStartedFlagSent = true;
        saved = true;
      }
    }
  } catch (error) {
    console.log('Error saving task progress:', error);
  } finally {
    taskProgressSaveInFlight = false;
    if (taskProgressSavePending) {
      const next = taskProgressSavePending;
      taskProgressSavePending = null;
      dispatchProgressSave(next);
    }
  }
  return saved;
}

// A teacher's task stopped with the stop button before its end: the progress so far is saved at once
// (the same save as above), so the teacher sees it and the student can carry on from there later.
// Called first thing in the page's stopQuestionsCloseActions: the snapshot is taken before the page
// folds or clears anything. The syncing pauses until the task is started again.
let stoppedTaskProgressSave = null;
function saveStoppedTaskProgress() {
  stoppedTaskProgressSave = null;
  if (!controller.task || controller.task[0] !== "setTask" || controller.taskCompleted) return;
  if (typeof userData !== "undefined" && userData && userData.accType !== "student") return;
  const snapshot = buildProgressSnapshot();
  stopTaskProgressSync();
  stoppedTaskProgressSave = (async () => {
    // let a save that is already on its way finish first; the newest snapshot then replaces what was queued
    for (let i = 0; taskProgressSaveInFlight && i < 100; i++) await new Promise(resolve => setTimeout(resolve, 100));
    taskProgressSavePending = null;
    return dispatchProgressSave(snapshot);
  })();
}
// the message for a task that was not finished (after a stop: whether its progress was saved)
async function showUnfinishedTaskMessage() {
  const save = stoppedTaskProgressSave;
  stoppedTaskProgressSave = null;
  const saved = save ? await save : false;
  if (controller.language === 'EN') {
    messageToTheUser(save ? (saved ? 'Task was not completed. Progress was saved.' : 'Task was not completed. Progress could not be saved.') : 'Task was not completed. Results were not saved.');
  } else {
    messageToTheUser(save ? (saved ? 'Užduotis nebaigta iki galo. Progresas išsaugotas.' : 'Užduotis nebaigta iki galo. Progreso išsaugoti nepavyko.') : 'Užduotis nebaigta iki galo. Rezultatai neišsaugoti.');
  }
}

// Coalescing entry point: if a save is already in flight, the newest payload simply replaces
// whatever was queued to go next (never piles up), and fires the moment the in-flight one
// resolves.
function scheduleProgressSave(payload) {
  if (!controller.task || controller.task[0] !== "setTask") return;
  if (taskProgressSaveInFlight) {
    taskProgressSavePending = payload;
    return;
  }
  dispatchProgressSave(payload);
}

function startTaskProgressSync() {
  if (taskProgressTimer) return;
  if (!controller.task || controller.task[0] !== "setTask") return;
  taskProgressIdleTicks = 0;
  taskProgressLastAnswered = controller.answeredQuestionTracker;
  taskProgressLastMistakes = controller.mistakesTracker;
  // new mistakes (one or several at a time): save right away instead of waiting for the next tick
  taskMistakeWatch = setInterval(() => {
    if ((controller.mistakesTracker || 0) > (taskProgressLastMistakes || 0)) saveTaskProgressNow();
  }, 400);
  taskProgressTimer = setInterval(() => {
    const dirty = controller.answeredQuestionTracker !== taskProgressLastAnswered
      || controller.mistakesTracker !== taskProgressLastMistakes;
    taskProgressLastAnswered = controller.answeredQuestionTracker;
    taskProgressLastMistakes = controller.mistakesTracker;
    if (dirty) {
      taskProgressIdleTicks = 0;
      scheduleProgressSave(buildProgressSnapshot());
    } else {
      taskProgressIdleTicks += 1;
      // 6 idle ticks of the 5s base interval below = 30s between time-only saves.
      if (taskProgressIdleTicks >= 6) {
        taskProgressIdleTicks = 0;
        scheduleProgressSave({ secondsElapsed: computeTaskSecondsElapsed() });
      }
    }
  }, 5000);
}

function stopTaskProgressSync() {
  if (taskProgressTimer) {
    clearInterval(taskProgressTimer);
    taskProgressTimer = null;
  }
  if (taskMistakeWatch) {
    clearInterval(taskMistakeWatch);
    taskMistakeWatch = null;
  }
}

// Called right after an answer is checked (text comprehension only, where answers come slowly
// enough that this stays cheap) — goes through the same coalescing queue as the tick loop, so
// clicking rapidly never produces more than ~1 extra request beyond whatever's already in flight.
function saveTaskProgressNow() {
  taskProgressIdleTicks = 0;
  if (controller.task) {
    taskProgressLastAnswered = controller.answeredQuestionTracker;
    taskProgressLastMistakes = controller.mistakesTracker;
  }
  scheduleProgressSave(buildProgressSnapshot());
}

async function updateStudentPointsAndStatistics(coinMultiplier=1) {
  let pointsEarned = 0;
  let coinsEarned = 0;
  let pointsPerCorrectAnswer;
  let statType = 'c'; // default to consistency

  // Calculate points and coins
  if (controller.modeChoice7 === "C84") {
    [pointsEarned, pointsPerCorrectAnswer] = await calculateTasksPerCorrectAnswerPoints(
        "selectedTexts",
        {
          taskSettings: [controller.mode, controller.modeChoice1, controller.modeChoice2, controller.modeChoice6, controller.modeChoice7],
          textMistakes: controller.currentMistakes
        }
    );
  } else {
    if (controller.mode === "lang" && controller.modeChoice1 === "C49") {
      const IDsOfTextsWithZeroMistakes = [];
      const IDsOfTextsWithOneMistake = [];
      const IDsOfTextsWithTwoMistakes = [];
      const IDsOfTextsWithThreeMistakes = [];
      controller.correctAnswersTracker = 0

      controller.currentMistakes.forEach(([id, value]) => {
          if (value === 0) IDsOfTextsWithZeroMistakes.push(id);
          else if (value === 1) IDsOfTextsWithOneMistake.push(id);
          else if (value === 2) IDsOfTextsWithTwoMistakes.push(id);
          else if (value === 3) IDsOfTextsWithThreeMistakes.push(id);
      });

      pointsEarned = await calculateTasksPerCorrectAnswerPoints("controller");
      pointsPerCorrectAnswer = pointsEarned

      if (controller.modeChoiceLtDifficulty === "C58") {
        pointsEarned = 
            (IDsOfTextsWithZeroMistakes.length * pointsEarned * 1)
          + (IDsOfTextsWithOneMistake.length * pointsEarned * 0.5)

        controller.correctAnswersTracker = 
            (IDsOfTextsWithZeroMistakes.length * 1)
          + (IDsOfTextsWithOneMistake.length * 0.5)
      } else if (controller.modeChoiceLtDifficulty === "C59") {
        pointsEarned = 
            (IDsOfTextsWithZeroMistakes.length * pointsEarned * 1)
          + (IDsOfTextsWithOneMistake.length * pointsEarned * 0.5)
          + (IDsOfTextsWithTwoMistakes.length * pointsEarned * 0.25)

        controller.correctAnswersTracker = 
            (IDsOfTextsWithZeroMistakes.length * 1)
          + (IDsOfTextsWithOneMistake.length * 0.5)
          + (IDsOfTextsWithTwoMistakes.length * 0.25)
      } else if (controller.modeChoiceLtDifficulty === "C60") {
        pointsEarned = 
            (IDsOfTextsWithZeroMistakes.length * pointsEarned * 1)
          + (IDsOfTextsWithOneMistake.length * pointsEarned * 0.5)
          + (IDsOfTextsWithTwoMistakes.length * pointsEarned * 0.25)
          + (IDsOfTextsWithThreeMistakes.length * pointsEarned * 0.1);

        controller.correctAnswersTracker = 
            (IDsOfTextsWithZeroMistakes.length * 1)
          + (IDsOfTextsWithOneMistake.length * 0.5)
          + (IDsOfTextsWithTwoMistakes.length * 0.25)
          + (IDsOfTextsWithThreeMistakes.length * 0.1);
      }


    } else {
      pointsEarned = await calculateTasksPerCorrectAnswerPoints("controller");
      pointsPerCorrectAnswer = pointsEarned
      pointsEarned = pointsEarned * controller.correctAnswersTracker
    } 
  }

  if (coinMultiplier) {
    coinsEarned = pointsEarned * coinMultiplier;
  }

  // Determine stat type based on mode
  if (controller.mode === "math") {
    statType = "m";
  } else if (controller.mode === "lang") {
    if (controller.modeChoice1 === "C49") statType = "t"; // text composition
    else if (controller.modeChoice1 === "C83") statType = "g"; // grammar
  }

  let response;

  pointsEarned = parseFloat(pointsEarned.toFixed(2));
  try {
    response = await apiFetch(apiBase + 'students/updateStudentStats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coins: coinsEarned,
        points: pointsEarned,
        statType,
        correctAnswers: controller.correctAnswersTracker,
        mistakes: controller.mistakesTracker,
        totalAnswers: controller.answeredQuestionTracker,
        pointsPerCorrectAnswer: pointsPerCorrectAnswer || 0,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    return [true, pointsEarned, coinsEarned];
  } catch (error) {
    console.error('Error saving statistics:', error);
    return [false, pointsEarned, coinsEarned];
  }
}

  function triggerFireworks () {
    fireworksDiv.innerHTML = '<img src="../images/sudedu_logo_animation_transparent.gif" style="width: 100%; height: auto;" id="fireworks">';
    setTimeout(disableFireworks, 4500);
  }

  function disableFireworks () {
    fireworksDiv.innerHTML = '';
  }

  function updateScore () {
    controller = JSON.parse(localStorage.getItem('controller'));
    if (controller.modeChoice4 === "C39") {
      if (controller.language === 'LT') {
        answerTrackerElement.innerHTML = `Atlikai: ${controller.answeredQuestionTracker}`;
      } else if (controller.language === 'EN') {
        answerTrackerElement.innerHTML = `Answered: ${controller.answeredQuestionTracker}`;        
      }
    } else if (controller.modeChoice4 === "C40") {
      if (controller.language === 'LT') {
        answerTrackerElement.innerHTML = `Atlikai: ${controller.answeredQuestionTracker}/${controller.questionNumber}`;
      } else if (controller.language === 'EN') {
        answerTrackerElement.innerHTML = `Completed: ${controller.answeredQuestionTracker}/${controller.questionNumber}`;     
      }
    }

    if (controller.language === 'LT') {
      mistakeTrackerElement.innerHTML = `Suklydai: ${controller.mistakesTracker}`;
    } else if (controller.language === 'EN') {
      mistakeTrackerElement.innerHTML = `Mistakes: ${controller.mistakesTracker}`;    
    }
    
    if (controller.modeChoice7 !== "C48") {
    answerInputElement.focus();
    }
  }

  function displayEquation () {
    controller = JSON.parse(localStorage.getItem('controller'));
    var contentContainerElement = document.getElementById('content-container');
		contentContainerElement.style.opacity = '0';
    var mainRemainderField = document.getElementById('remainder-field');
    mainRemainderField.style.display = 'none';

    if (controller.questionsStopped) {
				linkElement.setAttribute("href", "../questions-stopped.css");
		} else if (controller.modeChoice7 === "C48" && controller.randomSelection[2] === 'D' && (controller.modeChoice8 === '' || controller.modeChoice8 === 'C79')) {
				linkElement.setAttribute("href", "../questions-stulpeliu-div.css");
		} else if (controller.modeChoice7 === "C48" && controller.randomSelection[2] === 'D' && controller.modeChoice8 === 'C78') {
				linkElement.setAttribute("href", "../questions-stulpeliu-div-us.css");
		}  else if (controller.modeChoice7 === "C48") {
			linkElement.setAttribute("href", "../questions-stulpeliu.css");
    } else if (controller.withRemainder) {
			linkElement.setAttribute("href", "../questions-remainder.css");
		} else if (
      controller.modeChoice2 === "C15" ||
      controller.modeChoice2 === "C36"
    )	{
    linkElement.setAttribute("href", "../questions-extra-small.css");
    } else if (controller.modeChoice2 === "C13" || 
    controller.modeChoice2 === "C14" || 
    controller.modeChoice2 === "C34" || 
    controller.modeChoice2 === "C35" || 
    controller.modeChoice2 === "C28" || 
    controller.modeChoice2 === "C77" ||
    controller.modeChoice2 === "C29" ||
    controller.modeChoice2 === "C20" ||
    controller.modeChoice2 === "C21" ||
    controller.modeChoice2 === "C23" ||
    controller.modeChoice2 === "C24" ||
    controller.modeChoice2 === "C25" ||
    controller.modeChoice2 === "C26" ||
    controller.modeChoice2 === "C27" ||
    controller.modeChoice2 === "C16" 
  ) {
			linkElement.setAttribute("href", "../questions-smaller.css");
		} else {
      linkElement.setAttribute("href", "../questions-bigger.css");
    }

    if (controller.modeChoice5 === "C42" && !controller.questionsStopped) {
      dynamicStyleSheet.setAttribute("href", "../questions-unknown-number-style-supplement.css");
    } else {
      dynamicStyleSheet.setAttribute("href", "");
    } 
		

    if (controller.questionsStopped) {
      equationElement.style.display = "flex";
      answerFieldDivElement.style.display = "none";
      questionsSubmitButtonRowElement.style.display = "none";
      resetMistakeButtonsElement.style.display = "flex";
      contentContainerElement.style.opacity = '1';
    }

    if (controller.modeChoice7 === "C48") {
      if (controller.randomSelection[2] === 'D') {
        if (controller.modeChoice8 === '' || controller.modeChoice8 === 'C79') {
          equation2Element.style.display = "none";
          equationElement.innerHTML = controller.equation;
          equation2Element.innerHTML = '';
        } else if (controller.modeChoice8 === 'C78') {
          equationElement.style.display = "none";
          equationElement.innerHTML = '';
          equation2Element.style.display = "block";
          equation2Element.innerHTML = controller.equation;
        }

      } else {
      equation2Element.style.display = "none";
      equationElement.innerHTML = controller.equation;
      equationElement.style.display = "inline-block";
      equation2Element.innerHTML = '';
      }
    } else if (controller.modeChoice5 === "C41" || controller.withRemainder) {
      equation2Element.style.display = "none";
      equationElement.innerHTML = controller.equation;
      equation2Element.innerHTML = '';
    } else if (controller.modeChoice5 === "C42") {
      equationElement.innerHTML = controller.equation;
      equation2Element.style.display = "block";
      equation2Element.innerHTML = controller.equation2;
    };


    if (controller.withRemainder && controller.randomSelection[2] === "D" && controller.modeChoice7 !== "C48") {
      mainRemainderField.style.display = 'block';
    }

    if (controller.modeChoice7 === "C48") {
      // Need to adjust the modofier
      fontSizeFullREM = 3*1.3;
      if (window.innerWidth <= 575) {
				fontSizeFullREM = 2.5*1.3;
			}
      stulpeliuDivElement.innerHTML = '';
      divisionStulp2InnerElement .innerHTML = '';

      if (controller.language !== 'LT') {
        divisionStulp3InnerElement .innerHTML = '';
      }

    arithmeticSymbol.style.display = 'block';
    if (controller.questionsStopped) {
      arithmeticSymbol.innerHTML = '';
    } else if (controller.randomSelection[2] === 'A') {
      arithmeticSymbol.innerHTML = '+';
    } else if (controller.randomSelection[2] === 'S') {
      arithmeticSymbol.innerHTML = '-';
    } else if (controller.randomSelection[2] === 'M') {
      arithmeticSymbol.innerHTML = `\u00D7`;
    } else if (controller.randomSelection[2] === 'D') {
      arithmeticSymbol.innerHTML = ``;
    } 
      
   if (controller.randomSelection[2] === 'M') {
    
    if (!controller.questionsStopped) {
      var digitNumber = (controller.randomSelection[1]).toString();
  
      var subAnswerNumber = 0;
      if (digitNumber.length > 1) {
          subAnswerNumber = parseInt(digitNumber.length);
      }
   
    if (digitNumber.length > 1) {
        // Add the symbol outside the loop for digitNumber.length - 1 times
        var parentHeight = stulpeliuDivElement.clientHeight; // Get the height of the parent container
        var increment = 100 / (digitNumber.length); // Calculate the increment for top position
        
        for (var i = 0; i < digitNumber.length; i++) {
            // Add divs for input fields
            if (i === 0) {
              stulpeliuDivElement.innerHTML += '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-right: 0; margin-bottom: 10px;"><textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></textarea></div>';
            } else {
              stulpeliuDivElement.innerHTML +=
                '<div style="position: relative;">' +
                  '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" ' +
                    'style="margin-right: calc(' + (i * 3) + 'ch - ' + (0.5 * i) + 'px) !important; margin-bottom: 10px;">' +
                    '<div class="stulp-text-area-holder" style="position: relative;">' +
                      '<div class="stulpeliu-symbol" ' +
                      'style="position: absolute">+</div>' +
                        '<textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" ' +
                          'class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></textarea>' +
                      '</div' +
                  '</div>' +
                '</div>';
            }
        }
    }
  }
  }

  if (controller.randomSelection[2] === 'D') {
    
    if (!controller.questionsStopped) {
      var digitNumber = controller.randomSelection[1].toString();
  
      var subAnswerNumber = 0;
      subAnswerNumber = parseInt((Math.floor(controller.randomSelection[0]/controller.randomSelection[1])).toString().length);
 
      var counter = 0;
      var offset = 0;
      var tempOffset = 0;
      var subtract = [];
      var splitNumber1Str;
      var splitNumber2Str;
      var splitNumber1Str;
      var interSplitNumber1Str;
      var subtractedValueStr;
      var subtractedValue;
      var subtractedValueLength;
      var startsWithZero = false;
      var halfpush = false;
      var stopAddingTwoExtraDigits = false;
      var partialSub = '';
      var movedDownNumber;
      let number1 = controller.randomSelection[0];
      let totalNumberDigits = number1.toString().length
      const number2 = controller.randomSelection[1];
      const daliklisDigits = controller.randomSelection[1].toString().length;
      for (var i = 0; i < subAnswerNumber*2; i++) {
        tempOffset = 0;
        if (counter === 1) {
          if (startsWithZero) {
            splitNumber1Str = subtractedValueStr.slice(0, daliklisDigits);
            splitNumber2Str = subtractedValueStr.slice(daliklisDigits);
            partialSub = (Number(splitNumber1Str) - subtract[0]).toString();
            offset = offset + 1;
            startsWithZero = false;
          } else if (subtract[1]) {
            splitNumber1Str = number1.toString().slice(0, daliklisDigits+1);
            splitNumber2Str = number1.toString().slice(daliklisDigits+1);
            partialSub = (Number(splitNumber1Str) - subtract[0]).toString();
          } else {
            splitNumber1Str = number1.toString().slice(0, daliklisDigits);
            splitNumber2Str = number1.toString().slice(daliklisDigits);
            partialSub = (Number(splitNumber1Str) - subtract[0]).toString();
          }

          if (Number(splitNumber2Str[0]) === 0 && Number(partialSub) === 0 && Number(splitNumber2Str) !== 0) {
            startsWithZero = true;
            subtractedValueStr = splitNumber2Str
            subtractedValueLength = subtractedValueStr.length
            subtractedValue = Number(subtractedValueStr)
          } else if (Number(partialSub) === 0 && splitNumber2Str.length !== 0) {
            subtractedValueStr = splitNumber2Str
            subtractedValueLength = subtractedValueStr.length
            subtractedValue = Number(subtractedValueStr)
          } else {
            subtractedValueStr = partialSub + splitNumber2Str
            subtractedValueLength = subtractedValueStr.length
            subtractedValue = Number(subtractedValueStr)
          }

          if (Number(partialSub) === 0 || partialSub.length === daliklisDigits-1 || Number(subtractedValueStr[0]) === 0) {
            stopAddingTwoExtraDigits = true;
          }

          if (subtractedValueLength === number1.toString().length) {
            number1 = subtractedValue;

          if (Number(partialSub) === 0 && Number(subtractedValueStr) === 0 && splitNumber1Str.length !== 1) {
            offset = offset + 1 * (Number(number1).toString().length - (subtractedValueLength - 1)); 
          }

          } else if (subtractedValueLength < number1.toString().length) {
            if (!halfpush) {
              offset = offset + 1 * (Number(number1).toString().length - (subtractedValueLength)); 
            } else {
              halfpush = false;
              if (subtract[0].toString().length > partialSub.length) {
                offset = offset + 1 * (subtract[0].toString().length - partialSub.length);
              }
            }
            number1 = subtractedValue;
          }
          counter--;
        } else {
          if (startsWithZero) {
            subtract = [0, false];
          } else if (Number(number1) > number2) {
            
            if (Number(number1.toString().slice(0, daliklisDigits)) < number2 && !stopAddingTwoExtraDigits) { 
              movedDownNumber = Number(number1.toString().slice(0, daliklisDigits+1))
              subtract = [Math.floor(movedDownNumber / number2) * number2, true];
              if (subtract[0].toString().length < daliklisDigits+1) {
                offset = offset + 1;  
                halfpush = true;
              }
            } else if (stopAddingTwoExtraDigits) {
              let digitsToTake = 1
              if (Number(partialSub) !== 0) {
                digitsToTake = digitsToTake + partialSub.length
              }
              movedDownNumber = Number(number1.toString().slice(0, digitsToTake))
              subtract = [Math.floor(movedDownNumber / number2) * number2, false]; 
              stopAddingTwoExtraDigits = false; 
            } else {
              movedDownNumber = Number(number1.toString().slice(0, daliklisDigits))
              subtract = [Math.floor(movedDownNumber / number2) * number2, false]; 
              stopAddingTwoExtraDigits = false;  
            }
            } else if (Number(number1) === number2) {
              movedDownNumber = number1
              subtract = [number1, false];
            } else if (Number(number1) < number2) {
              movedDownNumber = number1
              subtract = [0, false];
            }
            if (i > 1) {
              if (subtract[1]) {
                interSplitNumber1Str = number1.toString().slice(0, movedDownNumber.toString().length);
              } else {
                interSplitNumber1Str = number1.toString().slice(0, movedDownNumber.toString().length)
              }
              if (interSplitNumber1Str.length > subtract[0].toString().length && !halfpush) {
                tempOffset = 1 * (interSplitNumber1Str.length - subtract[0].toString().length);
              }
            }
            counter++;
        }

        if (controller.modeChoice8 === '' || controller.modeChoice8 === 'C79') {
        if (i === 0) {
        divisionStulp2InnerElement.innerHTML +=
          '<div class="stulpeliu-input-outer-holder" style="position: relative;">' +
            '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-underline" style="margin-bottom: 10px;">' +
              '<textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off" ' +
              'style="width:' + ((totalNumberDigits + 1 - offset) + 'ch') + ';"></textarea>' +
            '</div>' +
          '</div>';
          var dalinys = document.getElementById('dalinys');
          dalinys.innerHTML += '<div class="stulpeliu-symbol-div">-</div>';
        } else {
          if (counter !== 0) {
            divisionStulp2InnerElement.innerHTML +=
            '<div class="stulpeliu-input-outer-holder">' +
              '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub stulpeliu-field-underline" style="margin-bottom: 10px;">' +
                '<textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off" ' +
                'style="width:' + ((totalNumberDigits + 1 - offset - tempOffset) + 'ch') + ';"></textarea>' +
              '</div>' +
            '</div>';

          } else if (i+1 !== subAnswerNumber*2) {
            divisionStulp2InnerElement.innerHTML += 
            '<div class="d-flex justify-content-center align-items-center">' +
              '<div class="stulpeliu-input-outer-holder" style="position: relative;">' +
                '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px;">' +
                    '<div class="stulpeliu-symbol-div">-</div>' +
                  '<textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off" style="width:' + ((totalNumberDigits + 1 - offset - tempOffset) + 'ch') + ';"></textarea>' +
                '</div>' +
              '</div>' +
            '</div>';

          } else {
            if (controller.language === 'LT') {
              divisionStulp2InnerElement.innerHTML +=
              '<div class="d-flex justify-content-center align-items-center">' +
                '<div class="stulpeliu-input-outer-holder" style="position: relative;">' +
                  '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px;">' +
                    '<textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off" ' +
                    'style="width:' + ((totalNumberDigits + 1 - offset - tempOffset) + 'ch') + ';"></textarea>' +
                  '</div>' +
                '</div>' +
              '</div>';

            } else {
              divisionStulp2InnerElement.innerHTML += '<div class="d-flex justify-content-center align-items-center">' +
              '<div style="position: relative;">' +
              '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px; margin-left: calc(' + fontSizeFullREM*0.45 + 'rem * (' + (offset+tempOffset) + ')) !important;">' +
              '<textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></textarea>' +
              '</div>' +
              '</div>' +
              '</div>';
            }
          }
    }
  } else if (controller.modeChoice8 === "C78") {
    if (i === 0) {
      divisionStulp3InnerElement.innerHTML += `
        <div class="d-flex justify-content-center align-items-center">
          <div style="position: relative;" class="stulpeliu-field-outer-holder">
            <div 
              id="stulpeliu-field-${i}" 
              class="stulpeliu-field stulpeliu-field-sub stulpeliu-field-underline" 
              style="margin-bottom: 10px;"
            >
              <div class="stulpeliu-symbol-div">-</div>
              <textarea 
                type="text" 
                id="stulpeliu-${i}" 
                name="stulpeliu-${i}" 
                class="form-control text-center stulpeliu-input" 
                placeholder="" 
                autocomplete="off"
                style="width: calc(${totalNumberDigits + 1 - offset - tempOffset}ch);"
              ></textarea>
            </div>
          </div>
        </div>`;

    } else {
      if (counter !== 0) {
        divisionStulp3InnerElement.innerHTML += `
          <div class="d-flex justify-content-center align-items-center">
            <div style="position: relative;" class="stulpeliu-field-outer-holder">
              <div 
                id="stulpeliu-field-${i}" 
                class="stulpeliu-field stulpeliu-field-sub stulpeliu-field-underline" 
                style="margin-bottom: 10px;"
              >
                <div class="stulpeliu-symbol-div"
                >-</div>
                <textarea 
                  type="text" 
                  id="stulpeliu-${i}" 
                  name="stulpeliu-${i}" 
                  class="form-control text-center stulpeliu-input" 
                  placeholder="" 
                  autocomplete="off"
                  style="width: calc(${totalNumberDigits + 1 - offset - tempOffset}ch);"
                ></textarea>
              </div>
            </div>
          </div>
        `;
      } else if (i+1 !== subAnswerNumber*2) {
        divisionStulp3InnerElement.innerHTML += `
          <div class="d-flex justify-content-center align-items-center">
            <div style="position: relative;" class="stulpeliu-field-outer-holder">
              <div 
                id="stulpeliu-field-${i}" 
                class="stulpeliu-field stulpeliu-field-sub" 
                style="margin-bottom: 10px;"
              >
                <textarea 
                  type="text" 
                  id="stulpeliu-${i}" 
                  name="stulpeliu-${i}" 
                  class="form-control text-center stulpeliu-input" 
                  placeholder="" 
                  autocomplete="off"
                  style="width: calc(${totalNumberDigits + 1 - offset - tempOffset}ch);"
                ></textarea>
              </div>
            </div>
          </div>
        `;

      
      } else {
        divisionStulp3InnerElement.innerHTML +=
          '<div class="d-flex justify-content-center align-items-center">' +
            '<div style="position: relative;" class="stulpeliu-field-outer-holder">' +
              '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px;">' +
                '<textarea ' +
                  'type="text" ' +
                  'id="stulpeliu-' + i + '" ' +
                  'name="stulpeliu-' + i + '" ' +
                  'class="form-control text-center stulpeliu-input" ' +
                  'placeholder="" ' +
                  'autocomplete="off" ' +
                  'style="width: calc(' + (totalNumberDigits + 1 - offset - tempOffset) + 'ch);"' +
                '></textarea>' +
              '</div>' +
            '</div>' +
          '</div>';

      }
}
  }
    


    }
}
}

      // Select all elements with the class 'stulpeliu-input'
      const inputElements = document.querySelectorAll('.stulpeliu-input');

      // Loop through each input element and add an event listener
      inputElements.forEach(function(element) {
    element.setAttribute("inputmode", "numeric");    

    // Sanitize input on input event
    element.addEventListener('input', function(event) {
        const sanitizedValue = event.target.value.replace(/[^0-9]/g, '');
        event.target.value = sanitizedValue;
    });

    element.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleTextareaFocusing(element);
        }
    });

    });


    }

    if (controller.result[0] === 'Incorrect') {
      upperLineElement.style.backgroundColor = 'rgba(213, 126, 126, 0.8)';
    } else if (controller.result[0] === 'Correct') {
      upperLineElement.style.backgroundColor = 'rgba(64, 201, 169, 0.8)';
    } else {
      upperLineElement.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    }

    previousEquationElement.innerHTML = controller.result[4];
    updateScore();
    clearAnswerField();
    adjustMiddleLineHeight();
    stylePage();
    setTimeout(function() {
      if (!controller.questionsStopped) {
        setMargins();
      }
    }, 100);
  }



async function checkAnswer () {
    document.getElementById('hidden-input').focus();
    var isCorrect = true;
    // (column notation: [expected, typed] of every intermediate field, in their order - kept with a mistake, recordMistakes)
    columnFields = [];
    userInput = answerInputElement.value.trim();
    userAnswer = Number(userInput);
    userAnswerRemainder = Number(answerRemainderInputElement.value);
    const indexToRemove = controller.combinations.findIndex(
      (item) =>
        item[0] === controller.randomSelection[0] &&
        item[1] === controller.randomSelection[1] &&
        item[2] === controller.randomSelection[2]
    );

    function middleLineCorrectAnswerColor () {
      var middleLine = document.getElementById('middle-line');
      middleLine.classList.add('pulse')
      setTimeout(function() {
        middleLine.classList.remove('pulse');
    }, 800);
    }

    function removeError(element) { 
      element.classList.remove('error'); 
    };

    function answerFieldColor(element, correctness) {
      // Remove wrong-answer-field if it's correct or neutral
      if (correctness === true) {
        element.classList.add('correct-answer-field');
        element.classList.remove('wrong-answer-field');
      } else if (correctness === false) {
        element.classList.add('wrong-answer-field');
        clearTimeout(timeoutReference);
        removeError(element);
        var timeoutReference = setTimeout(function() {
          removeError(element);
        }, 500);
      } else {
        element.classList.remove('wrong-answer-field');
        element.classList.remove('correct-answer-field');
      }
    }

      function flipNumber(number) {
        var output = number.split('').reverse().join('');
        return Number(output);
    }

    if (controller.modeChoice7 === "C48") {
      if (controller.randomSelection[2] === 'M') {

      var expectedAnswer = controller.randomSelection[0] * controller.randomSelection[1];
    
      if (flipNumber(userInput) !== expectedAnswer) {
        isCorrect = false;
      }

      answerFieldColor(answerInputElement, isCorrect);

      var digitNumber = controller.randomSelection[1].toString();
  
      if (digitNumber.length > 1) {
        for (var i = 0; i < digitNumber.length; i++) {
          var localIsCorrect = true;
          var reversedDigitNumber = digitNumber.split('').reverse().join('');
          var digit = parseInt(reversedDigitNumber[i]);
          if (document.getElementById(`stulpeliu-${i}`).value === '') {
            localIsCorrect = false;
            isCorrect = false;
          }
  
          if (flipNumber(document.querySelector('#stulpeliu-' + i).value) !== digit * controller.randomSelection[0]) {
            isCorrect = false;
            localIsCorrect = false;
          }
          columnFields.push([digit * controller.randomSelection[0], document.querySelector('#stulpeliu-' + i).value === '' ? '' : flipNumber(document.querySelector('#stulpeliu-' + i).value)]);
          
          if (document.querySelector('#stulpeliu-' + i).value === '') {
            localIsCorrect = false;
          }

          answerFieldColor(document.querySelector('#stulpeliu-' + i), localIsCorrect);
        }
      }
    
      if (isCorrect) {
        if (firstTimeChecking) {
          controller.correctAnswersTracker++
        }
        firstTimeChecking = true;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7", `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = ${flipNumber(userInput)}`];
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
      } else {
        firstTimeChecking = false;
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\u00D7", `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = ${flipNumber(userInput)}`];
        controller.mistakesTracker++;
        recordMistakes(); 
      }
    
    
    } else if (controller.randomSelection[2] === 'D') {
      var expectedAnswer = Math.floor(controller.randomSelection[0] / controller.randomSelection[1]);
      var isCorrect = true;
    
      if (Number(userInput) !== expectedAnswer) {
        isCorrect = false;
      } 
      answerFieldColor(answerInputElement, isCorrect);
        
        var subAnswerNumber = 0;
        subAnswerNumber = parseInt((Math.floor(controller.randomSelection[0]/controller.randomSelection[1])).toString().length);

        var counter = 0;
        var offset = 0;
        var tempOffset = 0;
        var subtract = [];
        var splitNumber1Str;
        var splitNumber2Str;
        var splitNumber1Str;
        var interSplitNumber1Str;
        var subtractedValueStr;
        var subtractedValue;
        var subtractedValueLength;
        var startsWithZero = false;
        var halfpush = false;
        var stopAddingTwoExtraDigits = false;
        var partialSub = '';
        let number1 = controller.randomSelection[0];
        const number2 = controller.randomSelection[1];
        const daliklisDigits = controller.randomSelection[1].toString().length;
        for (var i = 0; i < subAnswerNumber*2; i++) {
          var localIsCorrect = true;
          divUserSubAnswer = Number(document.getElementById(`stulpeliu-${i}`).value);
          if (document.getElementById(`stulpeliu-${i}`).value === '') {
            localIsCorrect = false;
            isCorrect = false;
          }
          const typedField = document.getElementById(`stulpeliu-${i}`).value === '' ? '' : divUserSubAnswer;
          if (i+1 === subAnswerNumber*2) {
            columnFields.push([controller.randomSelection[0] % controller.randomSelection[1], typedField]);
            if (divUserSubAnswer !== controller.randomSelection[0] % controller.randomSelection[1]) {
              isCorrect = false;
              localIsCorrect = false;
            }
          } else {
          if (counter === 1) {
            if (startsWithZero) {
              splitNumber1Str = subtractedValueStr.slice(0, daliklisDigits);
              splitNumber2Str = subtractedValueStr.slice(daliklisDigits);
              partialSub = (Number(splitNumber1Str) - subtract[0]).toString();
              offset = offset + 1;
              startsWithZero = false;
            } else if (subtract[1]) {
              splitNumber1Str = number1.toString().slice(0, daliklisDigits+1);
              splitNumber2Str = number1.toString().slice(daliklisDigits+1);
              partialSub = (Number(splitNumber1Str) - subtract[0]).toString();
            } else {
              splitNumber1Str = number1.toString().slice(0, daliklisDigits);
              splitNumber2Str = number1.toString().slice(daliklisDigits);
              partialSub = (Number(splitNumber1Str) - subtract[0]).toString();
            }

            if (Number(splitNumber2Str[0]) === 0 && Number(partialSub) === 0 && Number(splitNumber2Str) !== 0) {
              startsWithZero = true;
              subtractedValueStr = splitNumber2Str
              subtractedValueLength = subtractedValueStr.length
              subtractedValue = Number(subtractedValueStr)
            } else if (Number(partialSub) === 0 && splitNumber2Str.length !== 0) {
              subtractedValueStr = splitNumber2Str
              subtractedValueLength = subtractedValueStr.length
              subtractedValue = Number(subtractedValueStr)
            } else {
              subtractedValueStr = partialSub + splitNumber2Str
              subtractedValueLength = subtractedValueStr.length
              subtractedValue = Number(subtractedValueStr)
            }

            columnFields.push([Number(partialSub) >= number2 ? Number(partialSub) : Number(partialSub + splitNumber2Str[0]), typedField]);
            if (Number(partialSub) >= number2) {
              if (divUserSubAnswer !== Number(partialSub)) {
                isCorrect = false;
                localIsCorrect = false;
              }
            } else {
              if (divUserSubAnswer !== Number(partialSub + splitNumber2Str[0])) {
                isCorrect = false;
                localIsCorrect = false;
              }
            }


            subtractedValue = Number(partialSub + splitNumber2Str);

            if (Number(partialSub) === 0 || partialSub.length === daliklisDigits-1) {
              stopAddingTwoExtraDigits = true;
            }

            if (subtractedValueLength === number1.toString().length) {
              number1 = subtractedValue;

            if (Number(partialSub) === 0 && Number(subtractedValueStr) === 0 && splitNumber1Str.length !== 1) {
              offset = offset + 1 * (Number(number1).toString().length - (subtractedValueLength - 1)); 
            }
    
            } else if (subtractedValueLength < number1.toString().length) {
              if (!halfpush) {
                offset = offset + 1 * (Number(number1).toString().length - (subtractedValueLength)); 
              } else {
                halfpush = false;
                if (subtract[0].toString().length > partialSub.length) {
                  offset = offset + 1 * (subtract[0].toString().length - partialSub.length);
                }
              }
              number1 = subtractedValue;
            }
            counter--;
          } else {
              if (startsWithZero) {
                subtract = [0, false];
              } else if (Number(number1) > number2) {
              if (Number(number1.toString().slice(0, daliklisDigits)) < number2 && !stopAddingTwoExtraDigits) {
                subtract = [Math.floor(Number(number1.toString().slice(0, daliklisDigits+1)) / number2) * number2, true];
                if (subtract[0].toString().length < daliklisDigits+1) {
                  offset = offset + 1;  
                  halfpush = true;
                } 
              } else if (stopAddingTwoExtraDigits) {
                let digitsToTake = 1
                if (Number(partialSub) !== 0) {
                  digitsToTake = digitsToTake + partialSub.length
                }
                subtract = [Math.floor(Number(number1.toString().slice(0, digitsToTake)) / number2) * number2, false]; 
                stopAddingTwoExtraDigits = false; 
              } else {
                subtract = [Math.floor(Number(number1.toString().slice(0, daliklisDigits)) / number2) * number2, false];  
                stopAddingTwoExtraDigits = false;      
              }
              } else if (Number(number1) === number2) {
                subtract = [number1, false];
              } else if (Number(number1) < number2) {
                subtract = [0, false];
              }
              columnFields.push([subtract[0], typedField]);
              if (divUserSubAnswer !== subtract[0]) {
                isCorrect = false;
                localIsCorrect = false;
              }
              counter++;
          }
        }
        answerFieldColor(document.querySelector('#stulpeliu-' + i), localIsCorrect);
      }

      divisionSymbol = ''
      if (controller.language === 'EN') {
        divisionSymbol = '\u00F7';
      } else if (controller.language === 'LT') {
        divisionSymbol = '\uA789';
      }

      if (isCorrect) {
        if (firstTimeChecking) {
          controller.correctAnswersTracker++
        }
        firstTimeChecking = true;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], ":", `${controller.randomSelection[0]} ${divisionSymbol} ${controller.randomSelection[1]} = ${userInput}`];
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
      } else {
        firstTimeChecking = false;
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], ":", `${controller.randomSelection[0]} ${divisionSymbol} ${controller.randomSelection[1]} = ${userInput}`];
        controller.mistakesTracker++;
        recordMistakes(); 
      }

    } else if (controller.randomSelection[2] === 'A') {
      if (flipNumber(userInput) === controller.randomSelection[0] + controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
        if (firstTimeChecking) {
          controller.correctAnswersTracker++
        }
        firstTimeChecking = true;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        firstTimeChecking = false;
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
        isCorrect = false;
        controller.mistakesTracker++;
        recordMistakes(); 
      }
      answerFieldColor(answerInputElement, isCorrect);
     } else if (controller.randomSelection[2] === 'S') {
      if (flipNumber(userInput) === controller.randomSelection[0] - controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
        if (firstTimeChecking) {
          controller.correctAnswersTracker++
        }
        firstTimeChecking = true;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "-", `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        firstTimeChecking = false;
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "-", `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = ${userAnswer}`];
        isCorrect = false;
        controller.mistakesTracker++;
        recordMistakes(); 
      }
      answerFieldColor(answerInputElement, isCorrect);
     }
      if (isCorrect) {
        middleLineCorrectAnswerColor();
      }
     } else if (controller.modeChoice5 === "C41") {
    if (controller.randomSelection[2] === 'A') {
      if (userAnswer === controller.randomSelection[0] + controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
        if (firstTimeChecking) {
          controller.correctAnswersTracker++
        }
        firstTimeChecking = true;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        firstTimeChecking = false;
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
        isCorrect = false;
        controller.mistakesTracker++;
        recordMistakes(); 
      }
     } else if (controller.randomSelection[2] === 'S') {
      if (userAnswer === controller.randomSelection[0] - controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
        if (firstTimeChecking) {
          controller.correctAnswersTracker++
        }
        firstTimeChecking = true;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "-", `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        firstTimeChecking = false;
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "-", `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = ${userAnswer}`];
        isCorrect = false;
        controller.mistakesTracker++;
        recordMistakes(); 
      }
      } else if (controller.randomSelection[2] === 'M') {
        if (userAnswer === controller.randomSelection[0] * controller.randomSelection[1]) {
          controller.combinations.splice(indexToRemove, 1);
          controller.answeredQuestionTracker++;
          if (firstTimeChecking) {
            controller.correctAnswersTracker++
          }
          firstTimeChecking = true;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7", `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = ${userAnswer}`];
        } else {
          firstTimeChecking = false;
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\u00D7", `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = ${userAnswer}`];
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      } else if (controller.randomSelection[2] === 'D') {
        if (userAnswer !== Math.floor(controller.randomSelection[0] / controller.randomSelection[1])) {
          isCorrect = false;
        }
        if (controller.withRemainder) {
          if (userAnswerRemainder !== controller.randomSelection[0] % controller.randomSelection[1]) {
            isCorrect = false;
          }
        }

        divisionSymbol = '';
        remainderText = '';
        if (controller.language === 'EN') {
          divisionSymbol = '\u00F7';
          remainderText = 'r.'
        } else if (controller.language === 'LT') {
          divisionSymbol = '\uA789';
          remainderText = 'liek.'
        }
        
        if (isCorrect) {
          controller.combinations.splice(indexToRemove, 1);
          controller.answeredQuestionTracker++;
          if (firstTimeChecking) {
            controller.correctAnswersTracker++
          }
          firstTimeChecking = true;
          if (controller.withRemainder) {
            controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\uA789", `${controller.randomSelection[0]} ${divisionSymbol} ${controller.randomSelection[1]} = ${userAnswer} (${remainderText} ${userAnswerRemainder})`];
          } else {
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\uA789", `${controller.randomSelection[0]} ${divisionSymbol} ${controller.randomSelection[1]} = ${userAnswer}`];
          }
        } else {
          if (controller.withRemainder) {
            controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\uA789", `${controller.randomSelection[0]} ${divisionSymbol} ${controller.randomSelection[1]} = ${userAnswer} (${remainderText} ${userAnswerRemainder})`];
          } else {
            controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\uA789", `${controller.randomSelection[0]} ${divisionSymbol} ${controller.randomSelection[1]} = ${userAnswer}`];
          }
          firstTimeChecking = false;
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      } 
    } else if (controller.modeChoice5 === "C42") {
      if (controller.randomSelection[2] === 'A') {
        if (controller.randomSelection[3] === "first") {
          if (userAnswer === controller.randomSelection[0]) {
            controller.answeredQuestionTracker++;
            if (firstTimeChecking) {
              controller.correctAnswersTracker++
            }
            firstTimeChecking = true;
            controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+ first", `${userAnswer} + ${controller.randomSelection[1]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
            controller.combinations.splice(indexToRemove, 1);
          } else {
            firstTimeChecking = false;
            controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+ first", `${userAnswer} + ${controller.randomSelection[1]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`];
            isCorrect = false;
            controller.mistakesTracker++;
            recordMistakes(); 
          }
        } else if (controller.randomSelection[3] === "second") {
          if (userAnswer === controller.randomSelection[1]) {
            if (firstTimeChecking) {
              controller.correctAnswersTracker++
            }
            firstTimeChecking = true;
            controller.answeredQuestionTracker++;
            controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+ second", `${controller.randomSelection[0]} + ${userAnswer} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
            controller.combinations.splice(indexToRemove, 1);
          } else {
            firstTimeChecking = false;
            controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+ second", `${controller.randomSelection[0]} + ${userAnswer} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
            isCorrect = false;
            controller.mistakesTracker++;
            recordMistakes(); 
          }
        }
    } else if (controller.randomSelection[2] === 'S') {
      if (controller.randomSelection[3] === "first") {
        if (userAnswer === controller.randomSelection[0]) {
          controller.answeredQuestionTracker++;
          if (firstTimeChecking) {
            controller.correctAnswersTracker++
          }
          firstTimeChecking = true;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "- first", `${userAnswer} - ${controller.randomSelection[1]} = ${controller.randomSelection[0] - controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
          firstTimeChecking = false;
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "- first", `${userAnswer} - ${controller.randomSelection[1]} = ${controller.randomSelection[0] - controller.randomSelection[1]}`]; 
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      } else if (controller.randomSelection[3] === "second") {
        if (userAnswer === controller.randomSelection[1]) {
          controller.answeredQuestionTracker++;
          if (firstTimeChecking) {
            controller.correctAnswersTracker++
          }
          firstTimeChecking = true;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "- second", `${controller.randomSelection[0]} - ${userAnswer} = ${controller.randomSelection[0] - controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "- second", `${controller.randomSelection[0]} - ${userAnswer} = ${controller.randomSelection[0] - controller.randomSelection[1]}`];  
          isCorrect = false;
          controller.mistakesTracker++;
          firstTimeChecking = false;
          recordMistakes(); 
        }
      }
    } else if (controller.randomSelection[2] === 'M') {
      if (controller.randomSelection[3] === "first") {
        if (userAnswer === controller.randomSelection[0]) {
          controller.answeredQuestionTracker++;
          if (firstTimeChecking) {
            controller.correctAnswersTracker++
          }
          firstTimeChecking = true;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7 first", `${userAnswer} \u00D7 ${controller.randomSelection[1]} = ${controller.randomSelection[0] * controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\u00D7 first", `${userAnswer} \u00D7 ${controller.randomSelection[1]} = ${controller.randomSelection[0] * controller.randomSelection[1]}`]; 
          isCorrect = false;
          firstTimeChecking = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      } else if (controller.randomSelection[3] === "second") {
        if (userAnswer === controller.randomSelection[1]) {
          controller.answeredQuestionTracker++;
          if (firstTimeChecking) {
            controller.correctAnswersTracker++
          }
          firstTimeChecking = true;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7 first", `${controller.randomSelection[0]} \u00D7 ${userAnswer} = ${controller.randomSelection[0] * controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
          firstTimeChecking = false;
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\u00D7 first", `${controller.randomSelection[0]} \u00D7 ${userAnswer} = ${controller.randomSelection[0] * controller.randomSelection[1]}`];  
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      }
  } else if (controller.randomSelection[2] === 'D') {

    divisionSymbol = ''
    if (controller.language === 'EN') {
      divisionSymbol = '\u00F7';
    } else if (controller.language === 'LT') {
      divisionSymbol = '\uA789';
    }

    if (controller.randomSelection[3] === "first") {
      if (userAnswer === controller.randomSelection[0]) {
        controller.answeredQuestionTracker++;
        if (firstTimeChecking) {
          controller.correctAnswersTracker++
        }
        firstTimeChecking = true;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\uA789 first", `${userAnswer} ${divisionSymbol} ${controller.randomSelection[1]} = ${controller.randomSelection[0] / controller.randomSelection[1]}`]; 
        controller.combinations.splice(indexToRemove, 1);
      } else {
        firstTimeChecking = false;
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\uA789 first", `${userAnswer} ${divisionSymbol} ${controller.randomSelection[1]} = ${controller.randomSelection[0] / controller.randomSelection[1]}`]; 
        isCorrect = false;
        controller.mistakesTracker++;
        recordMistakes(); 
      }
    } else if (controller.randomSelection[3] === "second") {
      if (userAnswer === parseInt(controller.randomSelection[1])) {
        controller.answeredQuestionTracker++;
        if (firstTimeChecking) {
          controller.correctAnswersTracker++
        }
        firstTimeChecking = true;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\uA789 first", `${controller.randomSelection[0]} ${divisionSymbol} ${userAnswer} = ${controller.randomSelection[0] / controller.randomSelection[1]}`]; 
        controller.combinations.splice(indexToRemove, 1);
      } else {
        firstTimeChecking = false;
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\uA789 first", `${controller.randomSelection[0]} ${divisionSymbol} ${userAnswer} = ${controller.randomSelection[0] / controller.randomSelection[1]}`]; 
        isCorrect = false; 
        controller.mistakesTracker++;
        recordMistakes(); 
      }
    }
  }
}
      

    function recordMistakes () {
    while (controller.currentMistakes.length > MAX_CURRENT_MISTAKES_STORED) {
      controller.currentMistakes.splice(0, 1)
    }
    while (controller.totalMistakes.length > 29) {
      controller.totalMistakes.splice(0, 1)
    }

    // [[a, b, "F"|"S" when a number is unknown], op, [tries, answers given (at most 3)]]: another try on the same example
    // (the last mistake recorded) adds to it instead of making a new record
    const flag = controller.randomSelection[3] === "first" ? "F" : controller.randomSelection[3] === "second" ? "S" : null;
    const numbers = flag ? [controller.randomSelection[0], controller.randomSelection[1], flag] : [controller.randomSelection[0], controller.randomSelection[1]];
    const op = controller.randomSelection[2];
    let given = controller.modeChoice7 === "C48" && op !== 'D' && !flag ? flipNumber(userInput) : userAnswer;
    if (op === 'D' && controller.withRemainder && !flag && controller.modeChoice7 !== "C48") given = `${userAnswer} (${userAnswerRemainder})`;
    // (a value with more than 2 digits over the right one is typed at random: the try counts, the value is not kept)
    const digitsOf = v => String(v).replace(/\D/g, '').length;
    const tooLong = (value, right) => digitsOf(value) > digitsOf(right) + 2;
    const rightAnswer = flag === 'F' ? numbers[0] : flag === 'S' ? numbers[1]
      : op === 'A' ? numbers[0] + numbers[1] : op === 'S' ? numbers[0] - numbers[1] : op === 'M' ? numbers[0] * numbers[1] : Math.floor(numbers[0] / numbers[1]);
    const keepGiven = !tooLong(given, rightAnswer);
    [controller.currentMistakes, controller.totalMistakes].forEach(list => {
      const last = list[list.length - 1];
      const same = last && Array.isArray(last[0]) && last[1] === op && Array.isArray(last[2]) &&
        JSON.stringify(last[0]) === JSON.stringify(numbers);
      // (column notation: every field's expected value and the wrong values typed in it, at most 3 a field)
      const fields = controller.modeChoice7 === "C48" && !flag
        ? columnFields.map(([expected, typed]) => [expected, typed !== '' && typed !== expected && !tooLong(typed, expected) ? [typed] : []]) : null;
      if (same) {
        last[2][0] = (Number(last[2][0]) || 1) + 1;
        if (last[2][1].length < 3 && keepGiven) last[2][1].push(given);
        if (fields) {
          const kept = last[3] && Array.isArray(last[3].f) && last[3].f.length === fields.length ? last[3].f : null;
          if (!kept) last[3] = { f: fields };
          else fields.forEach(([, wrong], k) => wrong.forEach(w => { if (!kept[k][1].includes(w) && kept[k][1].length < 3) kept[k][1].push(w); }));
        }
      } else {
        const answers = keepGiven ? [given] : [];
        list.push(fields ? [numbers, op, [1, answers], { f: fields }] : [numbers, op, [1, answers]]);
      }
    });
  }
    localStorage.setItem('controller', JSON.stringify(controller));


    if (isCorrect || controller.modeChoice7 !== "C48") {
      if (isCorrect) {
        firstTimeChecking = true;
      }
      await formEquation();
      displayEquation();
      answerInputElement.classList.remove('correct-answer-field');
    } else {
      updateScore();
    }

    if (controller.modeChoice7 === "C48") {
      setTimeout(function() {
        const el = document.querySelector('.wrong-answer-field');
        if (el) {
          el.focus({ preventScroll: true });
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } else {
          const inputs = document.querySelectorAll('textarea');
          for (const input of inputs) {
            if (input.value.trim() === '') {
              input.focus();
              return;
            }
          }  
        }

        if (!controller.questionsStopped) {
          setMargins();
        }
      }, 100);
    }
  }

  async function restartEquations () {	
    disableFireworks();
    equationElement.style.fontSize = '';
    equationElement.style.paddingTop = '0rem';
    document.querySelector('#invisibleRow').style.display = "block";
    controller.currentMistakes = [];
    generateCombinations();
    if (controller.combinations.length > controller.questionNumber) {
      controller.combinations = controller.combinations.slice(0, controller.questionNumber);
    }
    answerInputElement.value = '';
    answerRemainderInputElement.value = '';
    answerInputElement.setAttribute("style", "background-color: rgba(255, 255, 255, 0.6)");
    controller.result = ['', '', '', '', ''];
    controller.equation = '';
    controller.equation2 = '';
    controller.mistakesTracker = 0;
    controller.answeredQuestionTracker = 0;
    controller.correctAnswersTracker = 0;
    firstTimeChecking = true;
    controller.randomSelection = [];
    controller.questionsStopped = false;
    answerFieldDivElement.style.display = "flex";
    questionsSubmitButtonRowElement.style.display = "flex";
    resetMistakeButtonsElement.style.display = "none";
    answerInputElement.style.display = "flex";
    if (localStorage.getItem("startTime")) {
      localStorage.removeItem("startTime");
    };
    if (localStorage.getItem("remainingTime")) {
      localStorage.removeItem("remainingTime");
    };
    if (controller.modeChoice4 === "C39") {
      countDown();
    } else if (controller.modeChoice4 === "C40") {
      startTimer()
    }
    await formEquation();
    displayEquation();
  }

  function finalMessageText () {
    let message = '';
    if ((controller.answeredQuestionTracker - controller.mistakesTracker) / controller.answeredQuestionTracker >= 0.95) {
      if (controller.language === 'LT') {
        message = 'Puikiai mokaisi!';
      } else if (controller.language === 'EN') {
        message = 'Perfection! Well done!';          
      }
    } else if ((controller.answeredQuestionTracker - controller.mistakesTracker) / controller.answeredQuestionTracker >= 0.7) {
      if (controller.language === 'LT') {
        message = 'Tobulėji! Pirmyn!';
      } else if (controller.language === 'EN') {
        message = 'Very good! Well done!';          
      }
    } else if ((controller.answeredQuestionTracker - controller.mistakesTracker) / controller.answeredQuestionTracker >= 0.6) {
      if (controller.language === 'LT') {
        message = 'Mokaisi! Nesustok!';
      } else if (controller.language === 'EN') {
        message = "You're learning!";          
      }
    } else if ((controller.answeredQuestionTracker - controller.mistakesTracker) / controller.answeredQuestionTracker > 0) {
      if (controller.language === 'LT') {
        message = 'Pasikartok su pagalba!';
      } else if (controller.language === 'EN') {
        message = "Ask for some help!";          
      }
    } else {
      if (controller.language === 'LT') {
        message = 'Bandyk dar kartą!';   
      } else if (controller.language === 'EN') {
        message = "Try again!";       
    }
  }
    return message
  }

  function redirectToQuestions() {
    if (controller.mode === "lang") {
    if (controller.modeChoice1 === "C83") {
      if (controller.modeChoice2 === "C50") {
        window.location.href = "./rasyba.html";
      }
    } else if (controller.modeChoice1 === "C49") {
      window.location.href = "./teksto-suvokimas.html";
    } 
  } else if (controller.mode === "math") {
      window.location.href = "./veiksmai.html";
  }
  }

  function redirectToIndex() {
    localStorage.setItem('controller', JSON.stringify(controller))
    window.location.href = "./";
  }

  function redirectToSummary () {
    window.location.href = "./klaidos";
  }

 // Function to calculate bar color based on the number of mistakes
function getBarColor(value) {
  if (value < 3) {
      return "rgba(64, 201, 169, 1)";
  } else if (value <= 6) {
      return "#E7B10A";
  } else {
      return "rgba(213, 126, 126, 1)";
  }
}

// Function to generate the summary table
// ---------- a math mistake, as it was done (the mistakes tables: a click on the example) ----------
// records: [[a, b, "F"|"S"?], op, [tries, answers], { f: [[expected, [wrong typed]], ...] }?]. Eilute: the example and the
// wrong answers after it; an unknown number: the wrong answers where it goes; column notation (records with f): the
// solved example laid out in columns, the wrong values next to the field they were typed in. Older records (no answers)
// have nothing to show.
// the right answers of a record (a division also as "q (r)"): not listed among its wrong ones
function mathMistakeRightAnswers(record) {
  const a = Number(record[0][0]), b = Number(record[0][1]), flag = record[0][2], op = record[1];
  if (flag === 'F') return [String(a)];
  if (flag === 'S') return [String(b)];
  if (op === 'D') return [String(Math.floor(a / b)), `${Math.floor(a / b)} (${a % b})`];
  return [String(op === 'A' ? a + b : op === 'S' ? a - b : a * b)];
}
function mathMistakeHasDetail(record) {
  return (Array.isArray(record[2]) && Array.isArray(record[2][1]) && record[2][1].length > 0) ||
    Boolean(record[3] && Array.isArray(record[3].f));
}
const MM_OP = { A: '+', S: '\u2212', M: '\u00D7', D: ':' };
function mmEsc(v) { return escapeMistakeText(String(v)); }
function mmWrongList(values) {
  return values.map(v => `<span class="mm-w">${mmEsc(v)}</span>`).join('');
}
// a grid of character columns (monospace): lines of segments { col, text, cls }, a line's underline range, its note
function mmGrid(lines) {
  const width = Math.max(...lines.map(l => Math.max(0, ...l.segs.map(g => g.col + String(g.text).length), l.ul ? l.ul[1] + 1 : 0)));
  const rows = lines.map(l => {
    const cells = Array.from({ length: width }, () => ({ ch: ' ', cls: '' }));
    l.segs.forEach(g => String(g.text).split('').forEach((ch, i) => { if (g.col + i >= 0 && g.col + i < width) cells[g.col + i] = { ch, cls: g.cls || '' }; }));
    if (l.ul) for (let c = l.ul[0]; c <= l.ul[1]; c++) cells[c].cls += ' mm-ul';
    let html = '', run = null;
    cells.forEach(c => {
      if (run && run.cls === c.cls) { run.text += c.ch; return; }
      if (run) html += run.cls.trim() ? `<span class="${run.cls.trim()}">${mmEsc(run.text)}</span>` : mmEsc(run.text);
      run = { cls: c.cls, text: c.ch };
    });
    if (run) html += run.cls.trim() ? `<span class="${run.cls.trim()}">${mmEsc(run.text)}</span>` : mmEsc(run.text);
    return `<span class="mm-side l">${l.left || ''}</span><span class="mm-line">${html}</span><span class="mm-side r">${l.right || ''}</span>`;
  });
  return `<div class="mm-grid">${rows.join('')}</div>`;
}
const mmAt = (end, value, cls) => ({ col: end - String(value).length + 1, text: String(value), cls });   // (right-aligned at a column)
const mmField = f => (f && f[1] && f[1].length ? { cls: 'mm-bad', note: mmWrongList(f[1]) } : { cls: '', note: '' });
function mmColumnHtml(a, b, op, fields, answers) {
  const correct = op === 'A' ? a + b : op === 'S' ? a - b : op === 'M' ? a * b : Math.floor(a / b);
  const wrongAnswers = answers.filter(x => (op === 'D' ? String(parseInt(x, 10)) : String(x)) !== String(correct))
    .map(x => (op === 'D' ? parseInt(x, 10) : x)).filter((x, i, all) => all.indexOf(x) === i);
  const answerCls = wrongAnswers.length ? 'mm-bad' : 'mm-ok';
  if (op === 'D') {
    const A = String(a), n = A.length, L = String(correct).length;
    if (fields.length !== 2 * L) return null;
    const p = k => 1 + (n - L + k);      // (column 0: the minus signs)
    const lines = [{ segs: [{ col: 1, text: A }, { col: n + 2, text: '\u2502' }, { col: n + 3, text: String(b) }], ul: [n + 3, n + 2 + Math.max(String(b).length, String(correct).length)] }];
    for (let k = 0; k < L; k++) {
      const prod = fields[2 * k], m = mmField(prod), v = String(prod[0]);
      const start = p(k) - v.length + 1;
      const line = { segs: [{ col: start - 1, text: '\u2212', cls: 'mm-minus' }, mmAt(p(k), v, m.cls)], ul: [start, p(k)], left: m.note };
      if (k === 0) {
        line.segs.push({ col: n + 3, text: String(correct), cls: answerCls });
        if (wrongAnswers.length) line.right = mmWrongList(wrongAnswers);
      }
      lines.push(line);
      const next = fields[2 * k + 1], mn = mmField(next);
      lines.push({ segs: [mmAt(k < L - 1 ? p(k) + 1 : n, next[0], mn.cls)], left: mn.note });
    }
    return mmGrid(lines);
  }
  const partials = op === 'M' ? fields : [];
  const R = Math.max(String(a).length, String(b).length + 1, String(correct).length, ...partials.map((f, i) => String(f[0]).length + i)) ;
  const lines = [
    { segs: [mmAt(R, a)] },
    { segs: [{ col: 0, text: MM_OP[op] }, mmAt(R, b)], ul: [0, R] }
  ];
  partials.forEach((f, i) => {
    const m = mmField(f);
    const line = { segs: [mmAt(R - i, f[0], m.cls)], left: m.note };
    if (i === partials.length - 1) { line.segs.unshift({ col: 0, text: '+' }); line.ul = [0, R]; }
    lines.push(line);
  });
  lines.push({ segs: [mmAt(R, correct, answerCls)], right: wrongAnswers.length ? mmWrongList(wrongAnswers) : '' });
  return mmGrid(lines);
}
function mathMistakeVisual(record) {
  const [nums, op] = record;
  const a = Number(nums[0]), b = Number(nums[1]), flag = nums[2];
  const answers = mathMistakeHasDetail(record) ? record[2][1] : [];
  const sign = MM_OP[op] || op;
  const fields = record[3] && Array.isArray(record[3].f) ? record[3].f : null;
  if (fields && !flag) {
    const html = mmColumnHtml(a, b, op, fields, answers);
    if (html) return html;
  }
  const result = op === 'A' ? a + b : op === 'S' ? a - b : op === 'M' ? a * b : a / b;
  if (flag === 'F' || flag === 'S') {
    // the unknown number: the wrong answers in its place, the right one after
    const slot = `<span class="mm-slot">${mmWrongList(answers.filter(x => !mathMistakeRightAnswers(record).includes(String(x))))}</span>`;
    const eq = flag === 'F' ? `${slot} ${sign} ${b} = ${mmEsc(result)}` : `${a} ${sign} ${slot} = ${mmEsc(result)}`;
    return `<div class="mm-eq">${eq}<span class="mm-lbl">teisingai: ${flag === 'F' ? a : b}</span></div>`;
  }
  const correct = op === 'D' ? Math.floor(a / b) + (a % b ? ` (${a % b})` : '') : result;
  return `<div class="mm-eq">${a} ${sign} ${b} = <span class="mm-ok">${mmEsc(correct)}</span>${answers.length ? ` <span class="mm-lbl">atsakyta:</span>${mmWrongList(answers.filter(x => String(x) !== String(correct) && !mathMistakeRightAnswers(record).includes(String(x))))}` : ''}</div>`;
}
const MM_SHOWN = 4;
function mathMistakeDetailHtml(records) {
  // (the same example from several tasks / students: once, the wrong answers together)
  const merged = new Map();
  records.filter(mathMistakeHasDetail).forEach(r => {
    const key = JSON.stringify([r[0], r[1], r[3] && Array.isArray(r[3].f) ? r[3].f.map(f => f[0]) : null]);
    const m = merged.get(key);
    if (!m) { merged.set(key, [r[0], r[1], [r[2][0], [...r[2][1]]], r[3] ? { f: r[3].f.map(f => [f[0], [...f[1]]]) } : undefined]); return; }
    r[2][1].forEach(x => { if (!m[2][1].map(String).includes(String(x))) m[2][1].push(x); });
    if (m[3] && r[3]) r[3].f.forEach((f, i) => f[1].forEach(w => { if (!m[3].f[i][1].includes(w)) m[3].f[i][1].push(w); }));
  });
  const list = [...merged.values()];
  const shown = list.slice(0, MM_SHOWN).map(r => `<div class="mm-item">${mathMistakeVisual(r)}</div>`).join('');
  const more = list.length > MM_SHOWN ? `<div class="mm-more">dar ${list.length - MM_SHOWN}</div>` : '';
  return `<div class="mm-detail">${shown}${more}</div>`;
}
// the records of each row that can open (one registry for the page; a row keeps its id)
const MM_RECORDS = new Map();
let mmNextId = 1;
function mmRegister(records) {
  const id = String(mmNextId++);
  MM_RECORDS.set(id, records);
  return id;
}
document.addEventListener('click', event => {
  const cell = event.target.closest && event.target.closest('.mm-toggle');
  if (!cell || event.target.closest('.mm-detail')) return;
  const open = cell.querySelector('.mm-detail');
  const button = cell.querySelector('.mm-btn');
  if (open) { open.remove(); cell.classList.remove('open'); if (button) button.setAttribute('aria-expanded', 'false'); return; }
  injectMathMistakeStyle();
  cell.insertAdjacentHTML('beforeend', mathMistakeDetailHtml(MM_RECORDS.get(cell.dataset.mmId) || []));
  cell.classList.add('open');
  if (button) button.setAttribute('aria-expanded', 'true');
  // (the opened example in view: every scrolling area it is in)
  const detail = cell.querySelector('.mm-detail');
  if (detail) requestAnimationFrame(() => {
    if (typeof revealExpanded === 'function') revealExpanded(detail);
    else detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
});
function injectMathMistakeStyle() {
  if (document.getElementById('mm-style')) return;
  const st = document.createElement('style');
  st.id = 'mm-style';
  st.textContent = `
.mm-toggle{cursor:pointer}
.mm-btn{display:inline-flex;align-items:center;gap:4px;margin:0 8px 0 8px;padding:2px 9px 2px 7px;border:0;border-radius:999px;background:rgba(40,109,138,.12);color:#1d566e;font-family:inherit;font-size:12px;font-weight:600;line-height:1.5;vertical-align:middle;cursor:pointer;transition:background .15s}
.mm-btn:hover,.mm-toggle.open .mm-btn{background:rgba(40,109,138,.22)}
.mm-btn .mm-chev{display:inline-block;font-size:10px;transition:transform .15s}
.mm-toggle.open .mm-btn .mm-chev{transform:rotate(90deg)}
.mm-detail{display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px 22px;margin:6px 0 2px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.6);text-align:left;overflow-x:auto;cursor:default}
.mm-detail,.mm-detail *{font-size:13px !important;line-height:1.3 !important;letter-spacing:0 !important;text-transform:none !important}
.mm-detail .mm-lbl,.mm-detail .mm-more{font-size:12px !important}
.mm-detail .mm-w{font-size:12.5px !important}
.mm-item{min-width:0}
.mm-grid{display:grid;grid-template-columns:auto auto auto;align-items:center;column-gap:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;color:#1f2a30}
.mm-line{white-space:pre}
.mm-side{display:flex;gap:3px;white-space:nowrap}
.mm-side.l{justify-content:flex-end}
.mm-side.r{justify-content:flex-start}
.mm-side .mm-w{margin:0}
.mm-ul{border-bottom:1px solid #1f2a30}
.mm-minus{position:relative;top:-.65em}
.mm-bad{background:rgba(213,126,126,.28);border-radius:2px}
.mm-ok{color:#17705d;font-weight:700}
.mm-w{display:inline-block;margin:0 3px 0 0;padding:0 5px;border-radius:5px;background:#f8dada;color:#983a3a;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.35}
.mm-eq{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:nowrap}
.mm-detail .mm-eq{line-height:1.6 !important}
.mm-slot{display:inline-block;padding:0 2px;border:1px dashed #b05f5f;border-radius:5px}
.mm-slot .mm-w{margin:0 1px}
.mm-lbl{margin-left:8px;color:#5f7480;font-family:inherit;font-size:12px}
.mm-more{align-self:center;color:#5f7480;font-size:12px}
.mm-unk .mm-ok{color:#32ac93;font-weight:700}
.mm-unk .mm-wrongs{color:#1f2a30;font-weight:400}
.mm-unk .mm-wa{color:#D57E7E;font-weight:700}`;
  document.head.appendChild(st);
}
function generateSummaryTable(type, mistakeList=null, customDivForSummaryTable=null, customDivForGrammarSummaryTable=null, usePercentage=false) {  controller = JSON.parse(localStorage.getItem('controller'));

  mistakes = [];
  if (type === 'total') {
    mistakes = controller.totalMistakes;
  } else if (type === 'current') {
    mistakes = controller.currentMistakes;
  } else if (type === 'custom') {
    mistakes = mistakeList;
  };

  mathMistakes = [];
  grammarMistakes = [];

  mistakes.forEach(mistake => {
    if (mistake[1] == "A" ||
        mistake[1] == "S" ||
        mistake[1] == "M" ||
        mistake[1] == "D"
    ) {
      mathMistakes.push(mistake)
    } else {
      grammarMistakes.push(mistake)
    }
  }
  );

  if (mathMistakes.length > 0) {
      // Group the data and calculate the number of mistakes for each action and pair of numbers
      const mathAnswersByKey = {};   // the answers given (new records keep up to 3 per example)
      const mathRecordsByKey = {};   // (the records of each row: a click shows how they were done)
      const performanceData = mathMistakes.reduce((acc, mistake) => {
        const first_number = mistake[0][0];
        const second_number = mistake[0][1];
        let unknwownNumber = false;
        let action = '';
        if (mistake[1] === "A") {
          action = '+';
        } else if (mistake[1] === "S") {
          action = '-';
        } else if (mistake[1] === "M") {
          action = '\u00D7';
        } else if (mistake[1] === "D") {
            if (controller.language === 'LT') {
              action = '\uA789';
          } else if (controller.language === 'EN') {
              action = '\u00F7';
          }
        }

        function parseOperator(operatorString) {
          const operatorMap = {
            "+": "+",
            "-": "-",
            "\u00D7": "*",
            "\uA789": "/",
	          "\u00F7": "/",
          };
        
          return operatorMap[operatorString] || null;
        }
        
      
        let firstAsIs = '';
        let swappedOrder = '';
        // If action is "/" or "*", create both order variations for first_number and second_number

        if (mistake[0][2]) {
        if (mistake[0][2] === "F") {
            result = eval(`${first_number} ${parseOperator(action)} ${second_number}`);
            firstAsIs = `&#x25fb ${action}  ${second_number} = ${result}`;
            swappedOrder = `${first_number} ${action} &#x25fb = ${result}`
            unknwownNumber = true;
        } else if (mistake[0][2] === "S") {
            result = eval(`${first_number} ${parseOperator(action)} ${second_number}`);
            firstAsIs = `${first_number} ${action} &#x25fb = ${result}`;
            swappedOrder = `&#x25fb ${action}  ${second_number} = ${result}`;
            unknwownNumber = true;
        }  
        } else {
          firstAsIs = `${first_number} ${action} ${second_number} = &#x25fb`;
          swappedOrder = `${second_number} ${action} ${first_number} = &#x25fb`;
        }

        // a mistake counts its tries ([..., op, [tries, answers]]; older records are one try each)
        const tries = Array.isArray(mistake[2]) ? Math.max(1, Number(mistake[2][0]) || 1) : 1;
        let usedKey;
        if ((action === "\u00D7" || action === "+")) {
          usedKey = acc[firstAsIs] ? firstAsIs : acc[swappedOrder] ? swappedOrder : firstAsIs;
        } else {
          // For other actions, follow the previous behavior
          usedKey = `${firstAsIs}`;
        }
        acc[usedKey] = (acc[usedKey] || 0) + tries;
        (mathRecordsByKey[usedKey] = mathRecordsByKey[usedKey] || []).push(mistake);
        if (Array.isArray(mistake[2]) && Array.isArray(mistake[2][1])) {
          if (!mathAnswersByKey[usedKey]) mathAnswersByKey[usedKey] = new Set();
          const right = mathMistakeRightAnswers(mistake);
          if (!(mistake[3] && Array.isArray(mistake[3].f))) mistake[2][1].forEach(answer => { if (!right.includes(String(answer))) mathAnswersByKey[usedKey].add(String(answer)); });
        }
      
        return acc;
      }, {});

      // Convert the data to an array of objects
      // (EXPERIMENTAL pages: the answers given, next to the example)
      const answersHtml = key => mathAnswersByKey[key] && mathAnswersByKey[key].size
        ? ` <span class="word-wrong-answers">(${[...mathAnswersByKey[key]].map(a => `<span class="wa">${escapeMistakeText(a)}</span>`).join(', ')})</span>`
        : '';
      // every example (in a row, with an unknown number): the right number in green where the box was, the wrong
      // answers in brackets after it (in the mistakes' pink). Only an example done in columns opens "Sprendimas"
      // (its layout); its wrong answers are shown there.
      const filledRowHtml = key => {
        const unknown = key.match(/^(&#x25fb|-?\d+) (\S+)\s+(&#x25fb|-?\d+) = (-?[\d.]+)$/);
        const plain = !unknown && key.match(/^(-?\d+) (\S+)\s+(-?\d+) = &#x25fb$/);
        const m = unknown || plain;
        if (!m) return null;
        const op = { '+': 'A', '-': 'S', '\u2212': 'S', '\u00D7': 'M', '\uA789': 'D', '\u00F7': 'D' }[m[2]];
        let correct = null;
        if (unknown) {
          const r = Number(m[4]), known = Number(m[1] === '&#x25fb' ? m[3] : m[1]), first = m[1] === '&#x25fb';
          correct = op === 'A' ? r - known : op === 'S' ? (first ? r + known : known - r) : op === 'M' ? r / known : op === 'D' ? (first ? r * known : known / r) : null;
        } else {
          const a = Number(m[1]), b = Number(m[3]);
          correct = op === 'A' ? a + b : op === 'S' ? a - b : op === 'M' ? a * b : op === 'D' && b ? (a % b ? `${Math.floor(a / b)} (${a % b})` : Math.floor(a / b)) : null;
        }
        if (correct == null || (typeof correct === 'number' && !isFinite(correct))) return null;
        const right = String(correct), quotient = right.split(' ')[0];
        const wrong = [...(mathAnswersByKey[key] || [])].filter(a => String(a) !== right && String(a) !== quotient);
        const slot = `<span class="mm-unk"><span class="mm-ok">${escapeMistakeText(right)}</span>${wrong.length ? ` <span class="mm-wrongs">(${wrong.map(a => `<span class="mm-wa">${escapeMistakeText(a)}</span>`).join(', ')})</span>` : ''}</span>`;
        return key.replace('&#x25fb', slot);
      };
      const mmRowOpens = records => (records || []).some(r => mathMistakeHasDetail(r) && r[3] && Array.isArray(r[3].f));
      const summaryData = Object.entries(performanceData).map(([veiksmas, mistakes]) => ({
          Veiksmai: filledRowHtml(veiksmas) || veiksmas + answersHtml(veiksmas),
          key: veiksmas,
          "Suklysta (kartai)": mistakes
      }));

      // Calculate total mistakes for percentage
      const totalMathMistakes = summaryData.reduce((sum, row) => sum + row["Suklysta (kartai)"], 0);

      // Add percentage if needed
      if (usePercentage && totalMathMistakes > 0) {
          summaryData.forEach(row => {
              row["Percentage"] = ((row["Suklysta (kartai)"] / totalMathMistakes) * 100).toFixed(1);
          });
      }

      // Sort the data by Suklysta (kartai) in descending order
      summaryData.sort((a, b) => b["Suklysta (kartai)"] - a["Suklysta (kartai)"]);

      // Generate the summary table HTML
      const summaryTable = document.createElement("table");
      if (controller.language === 'LT') {
          summaryTable.innerHTML = `
              <thead>
                  <th>Veiksmai</th>
                  <th>${usePercentage ? 'Klaidų kiekis<br>(% visų klaidų)' : 'Suklysta (kartai)'}</th>
                  <th></th>
              </thead>
              ${summaryData
                  .map(
                        (row) => {
                            const displayValue = usePercentage ? `${row["Suklysta (kartai)"]}` + ' (' + row["Percentage"] + '%)' : row["Suklysta (kartai)"];
                            let barWidth, barColor;
                            
                            if (usePercentage) {
                                const percentValue = parseFloat(row["Percentage"]);
                                barWidth = percentValue + '%'; // 10% = "10%", 50% = "50%", etc.
                                
                                // Color based on thresholds
                                if (percentValue < 25) {
                                    barColor = "rgba(64, 201, 169, 1)"; // green
                                } else if (percentValue <= 50) {
                                    barColor = "#E7B10A"; // yellow
                                } else {
                                    barColor = "rgba(213, 126, 126, 1)"; // red
                                }
                            } else {
                                barWidth = Math.min(row["Suklysta (kartai)"] * 10, 100) + 'px';
                                barColor = getBarColor(row["Suklysta (kartai)"]);
                            }
                            
                            return `<tr>
                                <td${mmRowOpens(mathRecordsByKey[row.key]) ? ` class="mm-toggle" data-mm-id="${mmRegister(mathRecordsByKey[row.key])}" title="Rodyti, kaip spręsta"` : ''}>${row["Veiksmai"]}${mmRowOpens(mathRecordsByKey[row.key]) ? '<button type="button" class="mm-btn" aria-expanded="false"><span class="mm-chev" aria-hidden="true">\u25B8</span>Sprendimas</button>' : ''}</td>
                                <td>${displayValue}</td>
                                <td>
                                    <div class="bar" style="width: ${barWidth}; background-color: ${barColor};"></div>
                                </td>
                            </tr>
                        `}
                    )
                  .join("")}
          `;
      } else if (controller.language === 'EN') {
          summaryTable.innerHTML = `
              <tr>
                  <th>Equation</th>
                  <th>${usePercentage ? 'Percentage' : 'Mistake Frequency'}</th>
                  <th></th>
              </tr>
              ${summaryData
                  .map(
                          (row) => {
                              const displayValue = usePercentage ? row["Percentage"] + '%' : row["Suklysta (kartai)"];
                              let barWidth, barColor;
                              
                              if (usePercentage) {
                                  const percentValue = parseFloat(row["Percentage"]);
                                  barWidth = percentValue + '%'; // 10% = "10%", 50% = "50%", etc.
                                  
                                  // Color based on thresholds
                                  if (percentValue < 25) {
                                      barColor = "rgba(64, 201, 169, 1)"; // green
                                  } else if (percentValue <= 50) {
                                      barColor = "#E7B10A"; // yellow
                                  } else {
                                      barColor = "rgba(213, 126, 126, 1)"; // red
                                  }
                              } else {
                                  barWidth = Math.min(row["Suklysta (kartai)"] * 10, 100) + 'px';
                                  barColor = getBarColor(row["Suklysta (kartai)"]);
                              }
                              
                              return `<tr>
                                  <td${mmRowOpens(mathRecordsByKey[row.key]) ? ` class="mm-toggle" data-mm-id="${mmRegister(mathRecordsByKey[row.key])}" title="Rodyti, kaip spręsta"` : ''}>${row["Veiksmai"]}${mmRowOpens(mathRecordsByKey[row.key]) ? '<button type="button" class="mm-btn" aria-expanded="false"><span class="mm-chev" aria-hidden="true">\u25B8</span>Sprendimas</button>' : ''}</td>
                                  <td>${displayValue}</td>
                                  <td>
                                      <div class="bar" style="width: ${barWidth}; background-color: ${barColor};"></div>
                                  </td>
                              </tr>
                          `}
                      )
                  .join("")}
          `;
      }

      // Display the summary table
      let summaryTableElement;
      if (customDivForSummaryTable) {
        summaryTableElement = document.getElementById(customDivForSummaryTable);
      } else {
        summaryTableElement = document.getElementById("summary-table");
      }
      summaryTableElement.innerHTML = "";
      summaryTableElement.appendChild(summaryTable);
      injectMathMistakeStyle();
  } else {
    // Display the summary table
    let summaryTableElement;
    
    if (customDivForSummaryTable) {
      summaryTableElement = document.getElementById(customDivForSummaryTable);
    } else {
      summaryTableElement = document.getElementById("summary-table");
    }
    if (summaryTableElement) {
      summaryTableElement.innerHTML = controller.language === 'LT' 
        ? 'Klaidų nėra!' 
        : 'No mistakes!';
    }
  }



 if (grammarMistakes.length > 0) {
  // First, group all word occurrences by their base form (prefix+answer+suffix)
// First, group all word occurrences by their base form (prefix+answer+suffix)
  const wordOccurrences = grammarMistakes.reduce((acc, [rawWordParts, wordCategory, rawUsersMistakes, wordId]) => {
    const wordParts = Array.isArray(rawWordParts)
      ? rawWordParts
      : rawWordParts && typeof rawWordParts === 'object'
        ? [rawWordParts.prefix || '', rawWordParts.answer || rawWordParts.word || '', rawWordParts.suffix || '']
        : [String(rawWordParts || ''), '', ''];
    const key = wordParts.join('|');
    const usersMistakes = Array.isArray(rawUsersMistakes)
      ? [Number(rawUsersMistakes[0]) || 0, Array.isArray(rawUsersMistakes[1]) ? rawUsersMistakes[1] : []]
      : [0, []];
    if (!acc[key]) {
      acc[key] = {
        wordParts,
        wordCategory,
        occurrences: [],
        totalMistakes: 0
      };
    }
    
    // Check if this wordId already exists in occurrences
    const existingOccurrence = acc[key].occurrences.find(occ => 
      JSON.stringify(occ.wordId) === JSON.stringify(wordId)
    );
    
    if (existingOccurrence) {
      // Merge mistakes: increment count and combine mistake arrays
      existingOccurrence.usersMistakes[0] += usersMistakes[0];
      existingOccurrence.usersMistakes[1] = [
        ...new Set([...existingOccurrence.usersMistakes[1], ...usersMistakes[1]])
      ];
    } else {
      // New occurrence
      acc[key].occurrences.push({ 
        usersMistakes: [usersMistakes[0], [...usersMistakes[1]]], 
        wordId 
      });
    }
    
    acc[key].totalMistakes += usersMistakes[0];
    return acc;
  }, {});

  // Then process into the final mistake data structure
  const mistakeData = Object.values(wordOccurrences).reduce((result, { wordParts, wordCategory, occurrences, totalMistakes }) => {
    const categoryEntry = typeof parameterDictionary !== "undefined"
      ? parameterDictionary[wordCategory]
      : null;
    const decodedWordCategory = categoryEntry?.decodedParameterText || String(wordCategory || "Kita klaida");
    const [prefix, answer, suffix] = wordParts;

    // EXPERIMENTAL (testers' pages only, html.experimental-on): the wrong answers next to the word, e.g. "pažinsi (q, ž)"
    const wrongAnswers = mistakeTableShowsAnswers()
      ? [...new Set(occurrences.flatMap(occ => occ.usersMistakes[1] || []))].map(escapeMistakeText)
      : [];

    // Create highlighted word form with all occurrence data
    const highlightedWord = `
      <span class="clickable-word"
            data-word-parts='${JSON.stringify(wordParts)}'
            data-category="${decodedWordCategory}"
            data-occurrences='${encodeURIComponent(JSON.stringify(occurrences))}'>
        ${prefix}<span class="incorrect-part">${answer}</span>${suffix}${wrongAnswers.length ? ` <span class="word-wrong-answers">(${wrongAnswers.map(w => `<span class="wa">${w}</span>`).join(', ')})</span>` : ''}
      </span>
    `;
    
    // Store in words collection
    result.words[highlightedWord] = totalMistakes;
    
    // Count category occurrences
    result.categories[decodedWordCategory] = (result.categories[decodedWordCategory] || 0) + totalMistakes;
    
    return result;
  }, { words: {}, categories: {} });

  // Calculate total grammar mistakes for percentage
  const totalGrammarMistakes = Object.values(mistakeData.words).reduce((sum, count) => sum + count, 0);

  const getTableData = (viewType) => {
    const data = viewType === 'words' ? mistakeData.words : mistakeData.categories;
    return Object.entries(data)
      .map(([display, count]) => {
          const result = { display, count };
          if (usePercentage && totalGrammarMistakes > 0) {
              result.percentage = ((count / totalGrammarMistakes) * 100).toFixed(1);
          }
          return result;
      })
      .sort((a, b) => b.count - a.count);
  };

  // Create the table with integrated view selector
  const createTable = (viewType) => {
    const tableData = getTableData(viewType);
    const isLT = controller.language === 'LT';
    
    const table = document.createElement('table');
    table.className = 'grammar-mistakes-table';
    
    // Create header with integrated selector
    const headerRow = document.createElement('tr');
    
    // Word Form header with dropdown
    const wordHeader = document.createElement('th');
    wordHeader.className = 'header-with-selector';
    wordHeader.innerHTML = `
      <div class="header-selector-container">
        <select class="grammar-view-selector">
          <option value="words" ${viewType === 'words' ? 'selected' : ''}>${isLT ? 'Žodžiai' : 'Words'}</option>
          <option value="categories" ${viewType === 'categories' ? 'selected' : ''}>${isLT ? 'Kategorijos' : 'Categories'}</option>
        </select>
      </div>
    `;
    
    // Mistakes header
    const countHeader = document.createElement('th');
    countHeader.innerHTML = usePercentage ? 'Klaidų kiekis<br>(% visų klaidų)' : 'Suklysta (kartai)';
    
    // Bar header (empty)
    const barHeader = document.createElement('th');
    
    headerRow.appendChild(wordHeader);
    headerRow.appendChild(countHeader);
    headerRow.appendChild(barHeader);
    
    // Create table structure
    const thead = document.createElement('thead');
    thead.appendChild(headerRow);
    
    const tbody = document.createElement('tbody');
        tbody.innerHTML = tableData.map(item => {
            const displayValue = usePercentage ?  item.count + ' (' + item.percentage + '%)' :  item.count;
            let barWidth, barColor;
            
            if (usePercentage) {
                const percentValue = parseFloat(item.percentage);
                barWidth = percentValue + '%'; // 10% = "10%", 50% = "50%", etc.
                
                // Color based on thresholds
                if (percentValue < 25) {
                    barColor = "rgba(64, 201, 169, 1)"; // green
                } else if (percentValue <= 50) {
                    barColor = "#E7B10A"; // yellow
                } else {
                    barColor = "rgba(213, 126, 126, 1)"; // red
                }
            } else {
                barWidth = Math.min(item.count * 10, 100) + 'px';
                barColor = getBarColor(item.count);
            }
            
            return `
          <tr>
            <td>${item.display}</td>
            <td>${displayValue}</td>
            <td>
              <div class="bar" style="width: ${barWidth}; background-color: ${barColor};">
              </div>
            </td>
          </tr>
        `}).join('');
    
    table.appendChild(thead);
    table.appendChild(tbody);
    
    return table;
  };

// Optimized function to process and display sentences for a word
// targetContainerId: optional id of a specific element to render into (used when the
// mistakes table lives in its own isolated context, e.g. an embedded archive row's
// detail cell) — falls back to the shared global fields when not provided.
async function showAllSentencesForWord(wordParts, occurrences, targetContainerId = null) {
    // 1. Get the results container
    let container = targetContainerId ? document.getElementById(targetContainerId) : null;

    if (!container) {
        const resultsContainer = document.getElementById('sentence-with-mistake-field');
        const resultsContainerForStudents = document.getElementById('sentence-with-mistake-field-for-student');

        if (!resultsContainer && !resultsContainerForStudents) {
            console.error("Results container not found");
            return;
        }

        // Parse user data
        let userData;
        try {
            userData = JSON.parse(userDataString);
        } catch (error) {
            console.error("Failed to parse user data:", error);
            return;
        }

        container = userData.accType === "teacher" ? resultsContainer : resultsContainerForStudents;
    }
    
    if (!container) {
        console.error("Sentence results container not found");
        return;
    }

    // Show initial loading state
    container.innerHTML = `
        <div class="task-info-subtitle">Klaidos sakiniuose:</div>
        <div class="loading">Ieškoma sakinių...</div>
    `;

    // 2. Load database with timeout
    let sudedu_duomenu_baze;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('../databases/sudedu_duomenu_baze.json', {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        sudedu_duomenu_baze = await response.json();
        
        if (!sudedu_duomenu_baze || typeof sudedu_duomenu_baze !== 'object') {
            throw new Error("Invalid database format");
        }
    } catch (error) {
        console.error("Failed to load database:", error);
        container.innerHTML = `
            <div class="task-info-subtitle">Klaidos sakiniuose:</div>
            <div class="error">*nepavyko įkelti duomenų bazės*</div>
        `;
        return;
    }

    // 3. Process occurrences with lazy loading
    const sentencesHtml = [];
    
    for (const occurrence of occurrences) {
        try {
            const html = await processOccurrence(occurrence, wordParts, sudedu_duomenu_baze);
            if (html) {
                sentencesHtml.push(html);
                
                // Update UI progressively (lazy loading)
                container.innerHTML = `
                    <div class="task-info-subtitle">Klaidos sakiniuose:</div>
                    ${sentencesHtml.join('')}
                `;
            }
        } catch (error) {
            console.error("Error processing occurrence:", error);
            sentencesHtml.push(`
                <div class="sentence-occurrence">
                    <span class="error-marker">*sakinys nerastas*</span>
                </div>
            `);
        }
    }

    // 4. Final display
    if (sentencesHtml.length === 0) {
        container.innerHTML = `
            <div class="task-info-subtitle">Klaidos sakiniuose:</div>
            <div class="error">*sakiniai nerasti*</div>
        `;
    } else {
        container.innerHTML = `
            <div class="task-info-subtitle">Klaidos sakiniuose:</div>
            ${sentencesHtml.join('')}
        `;
    }
}

function extractSentences(text) {
    const results = [];
    const NO_SPLIT_MARKER = '\uE000';
    
    // Process the combined text to find sentence boundaries
    let currentPos = 0;
    let sentenceStart = 0;
    
    while (currentPos < text.length) {
        // Check if we're at a potential sentence end
        const match = findSentenceEnd(text, currentPos);
        
        if (match) {
            const endPos = match.index + match[0].length;
            
            // Check if this is followed by NO_SPLIT_MARKER
            if (text.substring(endPos, endPos + NO_SPLIT_MARKER.length) !== NO_SPLIT_MARKER) {
                // Extract the sentence (including the end markers)
                const sentence = text.substring(sentenceStart, endPos).trim();
                if (sentence) {
                    results.push(sentence);
                }
                sentenceStart = endPos;
                currentPos = endPos;
                continue;
            } else {
                // Skip the NO_SPLIT_MARKER and continue
                currentPos = endPos + NO_SPLIT_MARKER.length;
                continue;
            }
        }
        
        currentPos++;
    }
    
    // Add any remaining text as the last sentence
    if (sentenceStart < text.length) {
        const remaining = text.substring(sentenceStart).trim();
        if (remaining) {
            results.push([remaining, [Number(textID), sentenceStart]]);
        }
    }

    return results;
}

function findSentenceEnd(text, startPos) {
    const EOS_SYMBOLS = /[!\.?]/;
    const QUOTATION_MARKS = /["'`„“”«»]/; // Including Lithuanian quotation marks
    
    let i = startPos;
    let foundEos = false;
    let sequence = '';
    
    // Look for the pattern: any quotes + EOS symbols + any quotes
    while (i < text.length) {
        const char = text[i];
        
        if (char === ' ') {
            // Spaces are allowed between symbols
            sequence += char;
            i++;
            continue;
        }
        
        if (QUOTATION_MARKS.test(char)) {
            sequence += char;
            i++;
            continue;
        }
        
        if (EOS_SYMBOLS.test(char)) {
            sequence += char;
            foundEos = true;
            i++;
            continue;
        }
        
        // If we encounter a non-matching character, stop
        break;
    }
    
    // We have a valid sentence end if we found at least one EOS symbol
    // and the sequence is not empty
    if (foundEos && sequence.length > 0) {
        return {
            index: startPos,
            length: sequence.length,
            0: sequence
        };
    }
    
    return null;
}

function splitSentenceToWords(sentence) {
    const cleaned = sentence
        .replace(/\uE000/g, "")
        .replace(/[\p{P}\p{S}]+/gu, " ")
        .replace(/[\s\u00A0]+/g, " ")
        .trim();

    if (!cleaned) return [];

    return cleaned.split(" ");
}

// Helper function to process a single occurrence
async function processOccurrence({ usersMistakes, wordId }, wordParts, database) {
    // Validate wordId structure
    if (!Array.isArray(wordId) || wordId.length < 3) {
        console.error("Invalid wordId structure:", wordId);
        return `<div class="sentence-occurrence"><span class="error-marker">*sakinys nerastas*</span></div>`;
    }

    // Get entry from database
    const entryKey = wordId[0].toString();
    const entry = database[entryKey];
    
    if (!entry || !entry.text) {
        console.error("Entry not found for key:", entryKey);
        return `<div class="sentence-occurrence"><span class="error-marker">*sakinys nerastas*</span></div>`;
    }

    try {
        // Combine text parts
        const allTextParts = [
            ...(entry.text.start || []),
            ...(entry.text.middle || []),
            ...(entry.text.end || [])
        ];

        if (allTextParts.length === 0) {
            console.error("No text parts found in entry");
            return `<div class="sentence-occurrence"><span class="error-marker">*sakinys nerastas*</span></div>`;
        }
        
        let allTextPartsMerged = allTextParts.join(" ").trim();

        // Split into sentences
        const allTextPartsSentences = extractSentences(allTextPartsMerged) 
            || [allTextPartsMerged];

        // Validate sentence index
        const sentenceIndex = wordId[1];

        if (sentenceIndex < 0 || sentenceIndex >= allTextPartsSentences.length) {
            console.error(`Invalid sentence index: ${sentenceIndex} (max: ${allTextPartsSentences.length - 1})`);
            return `<div class="sentence-occurrence"><span class="error-marker">*sakinys nerastas*</span></div>`;
        }

        const originalSentence = allTextPartsSentences[sentenceIndex].trim();
        
        const words = splitSentenceToWords(originalSentence);
        
        // Validate word index
        const wordIndex = wordId[2];
        if (wordIndex < 0 || wordIndex >= words.length) {
            console.error(`Invalid word index: ${wordIndex} (max: ${words.length - 1})`);
            return `<div class="sentence-occurrence"><span class="error-marker">*sakinys nerastas*</span></div>`;
        }

        const targetWord = words[wordIndex];
        const originalWord = wordParts.join("");

        // Verify word match
        if (targetWord.toLowerCase().trim() !== originalWord.toLowerCase().trim()) {
            console.error(`Word mismatch: "${targetWord}" !== "${originalWord}"`);
            return `<div class="sentence-occurrence"><span class="error-marker">*sakinys nerastas*</span></div>`;
        }

        // Find the word in the original sentence with punctuation
        const escapedTarget = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<!\\p{L})${escapedTarget}(?!\\p{L})`, 'giu');
        
        const matches = [];
        let match;
        while ((match = regex.exec(originalSentence)) !== null) {
            matches.push(match);
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }
        }

        if (matches.length === 0) {
            console.error(`Word "${targetWord}" not found in sentence`);
            return `<div class="sentence-occurrence"><span class="error-marker">*sakinys nerastas*</span></div>`;
        }

        // Get the correct instance (use first match if wordIndex exceeds matches)
        const instanceIndex = Math.min(wordIndex, matches.length - 1);
        const matchData = matches[instanceIndex];

        // Prepare user mistakes display (EXPERIMENTAL pages: the answers are in the table, the sentence only highlights the word)
        const wrappedMistakes = !mistakeTableShowsAnswers() && Array.isArray(usersMistakes) && Array.isArray(usersMistakes[1])
            ? usersMistakes[1].map(m => `<span class="user-incorrect-answer">${m}</span>`).join(", ")
            : '';

        // Construct marked sentence
        const beforeMatch = originalSentence.substring(0, matchData.index).replace(/\uE000/g, "");
        const afterMatch = originalSentence.substring(matchData.index + matchData[0].length).replace(/\uE000/g, "");

        // (EXPERIMENTAL pages: the whole word highlighted, without marking the letters asked)
        const answeredWord = mistakeTableShowsAnswers()
            ? `${wordParts[0]}${wordParts[1]}${wordParts[2]}`
            : `${wordParts[0]}<span class="incorrect-part">${wordParts[1]}</span>${wordParts[2]}`;
        return `
            <div class="sentence-occurrence">${beforeMatch}<span class="answered-word">${answeredWord}${wrappedMistakes ? `(${wrappedMistakes})` : ''}</span>${afterMatch}</div>
        `;

    } catch (error) {
        console.error("Error in processOccurrence:", error);
        return `<div class="sentence-occurrence"><span class="error-marker">*sakinys nerastas*</span></div>`;
    }
}

  if (customDivForGrammarSummaryTable !== "none") {
    // Initialize display
    let currentView = 'words';
    const container = document.getElementById(customDivForGrammarSummaryTable) || 
                     document.getElementById('summary-table-grammar');
    
    container.innerHTML = '';
    const table = createTable(currentView);
    container.appendChild(table);

    // If this table belongs to an embedded archive row's detail cell, target that
    // row's own sentence container so the result appears right there, not in a
    // shared field elsewhere on the page.
    let sentenceTargetId = null;
    if (customDivForGrammarSummaryTable && customDivForGrammarSummaryTable.startsWith('archive-detail-mistakes-grammar-')) {
      const rowIdSuffix = customDivForGrammarSummaryTable.slice('archive-detail-mistakes-grammar-'.length);
      sentenceTargetId = `archive-detail-sentence-${rowIdSuffix}`;
    } else if (customDivForGrammarSummaryTable && customDivForGrammarSummaryTable.startsWith('archive-popup-grammar-')) {
      const rowIdSuffix = customDivForGrammarSummaryTable.slice('archive-popup-grammar-'.length);
      sentenceTargetId = `archive-popup-sentence-${rowIdSuffix}`;
    }

    // Add click handler for word rows
    container.addEventListener('click', (e) => {
      // Only process if we're in words view
      if (currentView === 'words') {
        const clickableWord = e.target.closest('.clickable-word');
        if (clickableWord) {
          // Extract stored data
          const wordParts = JSON.parse(clickableWord.getAttribute('data-word-parts'));
          const occurrences = JSON.parse(decodeURIComponent(clickableWord.getAttribute('data-occurrences')));
          
          // Show all sentences for this word
          showAllSentencesForWord(wordParts, occurrences, sentenceTargetId);
        }
      }
    });
  
    // Handle view changes from the integrated selector
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('grammar-view-selector')) {
        currentView = e.target.value;
        container.replaceChild(createTable(currentView), container.querySelector('table'));
      }
    });
  }
} else {
    const grammarSummaryContainer = document.getElementById(customDivForGrammarSummaryTable) || 
                    document.getElementById('summary-table-grammar');
    if (grammarSummaryContainer) {
    // No mistakes case
    grammarSummaryContainer.innerHTML = controller.language === 'LT' 
      ? 'Klaidų nėra!' 
      : 'No mistakes!';
    }
  }
}

let timerDisplay = document.querySelector("#timer");
let timerInterval = 0;
let elapsedTime = 0;

function startTimer() {
  // Check if start time is stored in local storage
  let startTime = localStorage.getItem("startTime");

  if (!startTime) {
    // If start time is not in local storage, get the current time and save it — computed HERE,
    // the moment the timer actually starts ticking (not earlier, back on uzduotys.html before
    // navigation), so page-load time is never counted against the student. Resuming a task with
    // prior elapsed time just backdates this same starting point by that amount.
    startTime = new Date().getTime();
    // Only a resumed teacher-assigned task gets backdated — resumeData can otherwise still be
    // sitting in `controller` from an earlier teacher task's resume (completeTask() is the only
    // thing that sets/clears it, and a practice run never goes through it), which would wrongly
    // dock time off a fresh practice session. Consumed once, then cleared, so it can't leak again.
    if (controller.task && controller.task[0] === "setTask" && controller.resumeData
        && typeof controller.resumeData.secondsElapsed === "number") {
      startTime -= controller.resumeData.secondsElapsed * 1000;
      controller.resumeData = null;
      localStorage.setItem('controller', JSON.stringify(controller));
    }
    localStorage.setItem("startTime", startTime);
  } else {
    // If start time is in local storage, parse it to a number
    startTime = parseInt(startTime, 10);
  }

  function updateTimer() {
    let currentTime = new Date().getTime();
    elapsedTime = currentTime - startTime;

    // Calculate hours, minutes, and seconds
    var hours = Math.floor(elapsedTime / 3600000);
    var minutes = Math.floor((elapsedTime % 3600000) / 60000);
    var seconds = Math.floor((elapsedTime % 60000) / 1000);

    // Update the timer display
    timerDisplay.textContent =
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0");

      if (controller && controller.modeChoice4 === "C40") {
        if (elapsedTime > 2 * 60 * 60 * 1000) {
          stopQuestionsCloseActions();
        }
      }
  }

  

  updateTimer();

  timerInterval = setInterval(updateTimer, 1000);
}

function countDown() {
  const timerLimit = controller.timerLimit * 60;

  // Check if there is remaining time stored in the memory
  let remainingTime = parseInt(localStorage.getItem("remainingTime"), 10);
  
  // If there is no remaining time, set it to the total time — computed HERE, the moment the
  // countdown actually starts ticking (not earlier, back on uzduotys.html before navigation), so
  // page-load time is never counted against the student. Resuming a task with prior elapsed time
  // just starts this same countdown that much further along.
  if (!remainingTime) {
    remainingTime = timerLimit * 1000;
    // Only a resumed teacher-assigned task gets this head start docked off — resumeData can
    // otherwise still be sitting in `controller` from an earlier teacher task's resume
    // (completeTask() is the only thing that sets/clears it, and a practice run never goes
    // through it), which would wrongly shorten a fresh practice countdown. Consumed once, then
    // cleared, so it can't leak again.
    if (controller.task && controller.task[0] === "setTask" && controller.resumeData
        && typeof controller.resumeData.secondsElapsed === "number") {
      remainingTime = Math.max(0, timerLimit - controller.resumeData.secondsElapsed) * 1000;
      controller.resumeData = null;
      localStorage.setItem('controller', JSON.stringify(controller));
    }
    localStorage.setItem("remainingTime", remainingTime);
  }

  async function updateTimer() {
    remainingTime -= 1000;

    if (remainingTime <= 0) {
      // If the timer has ended, clear the interval and display "00:00:00"
      localStorage.setItem("remainingTime", remainingTime);
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00:00";
      controller.taskCompleted = true;
      localStorage.setItem('controller', JSON.stringify(controller))
      if (controller.mode === "math") {
        await formatFinalMessage();
        displayEquation();
      } else if (controller.mode === "lang") {
        if (controller.modeChoice1 === "C83") {
          if (controller.modeChoice2 === "C50") {
            formatFinalMessageForGrammar();
          }
      } else if (controller.modeChoice1 === "C49") {
        formatFinalMessageForTextcomprehension();
      }
    }
      localStorage.removeItem("remainingTime");
    } else {
      // Calculate hours, minutes, and seconds from the remaining time
      var hours = Math.floor(remainingTime / 3600000);
      var minutes = Math.floor((remainingTime % 3600000) / 60000);
      var seconds = Math.floor((remainingTime % 60000) / 1000);

      // Update the timer display
      timerDisplay.textContent =
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0");

      // Store the remaining time in the memory
      localStorage.setItem("remainingTime", remainingTime);
    }
  }

  // Call updateTimer initially to start the countdown
  updateTimer();

  // Set up the timer interval to call updateTimer every second
  timerInterval = setInterval(updateTimer, 1000);
}

function setLanguage(lang) {
	if (lang !== controller.language) {
  // Update the language controller and store it in localStorage
  controller.language = lang;
  localStorage.setItem('controller', JSON.stringify(controller));

  // Select all language options
  const options = document.querySelectorAll('.language-option');

  // Update the selected class for the clicked option
  options.forEach(option => {
    if (option.classList.contains(`language-option-${lang}`)) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });

		window.location.href = `/${lang}`;
}
}

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
	if (controller.task) {
	controller.timerLimit = parseInt(controller.setTaskDuration);
	} else {
		controller.timerLimit = parseInt(timerInputElement.value);
	}
	if (!controller.timerLimit) {
	controller.timerLimit = 5;
	}

	// Resuming a teacher-assigned task that already has saved progress: restore trackers and
	// pick the countdown back up from where it was, instead of wiping everything to a fresh start.
	const resuming = !!(controller.task && controller.task[0] === "setTask" && controller.resumeData);

	if (localStorage.getItem("elapsedTime")) {
	localStorage.removeItem("elapsedTime");
	}

	if (localStorage.getItem("startTime")) {
	localStorage.removeItem("startTime");
	}
	controller.result = ['', '', '', '', '']
	controller.equation = '';
	controller.equation2 = '';
	controller.randomSelection = [];
	controller.questionsStopped = false;

	if (resuming) {
		const resumeSeconds = Number(controller.resumeData.secondsElapsed) || 0;
		const resumeProgress = controller.resumeData.progress || {};
		controller.currentMistakes = resumeProgress.currentMistakes || [];
		controller.mistakesTracker = Number(controller.resumeData.mistakesSoFar) || 0;
		controller.answeredQuestionTracker = Number(controller.resumeData.answeredCount) || 0;
		controller.correctAnswersTracker = 0;
		// NOTE: deliberately not touching controller.randomSelection here — it means something
		// different per task type (math: [num1,num2,op]; text comprehension: [currentItem]) and
		// writing to index 2 generically made its .length non-zero for all of them, which broke
		// their own "is there already a buffered item" checks. Grammar (rasyba.html) restores its
		// own sequence position itself, using controller.resumeData directly, not this field.
		if (typeof resumeProgress.passNumber === "number") {
			controller.passNumber = resumeProgress.passNumber;
		}
		// Deliberately NOT writing "remainingTime" here: this runs on uzduotys.html, before the
		// navigation + script-load time it takes to actually reach the task page — pre-computing
		// it against Date.now() here would count that navigation delay against the student (the
		// countdown would already show a few seconds gone the moment they can see/interact with
		// it). countDown() on the destination page computes the resume-adjusted value itself, the
		// moment it actually starts ticking, so only real navigation time is ever "free".
		if (localStorage.getItem("remainingTime")) {
		localStorage.removeItem("remainingTime");
		}
	} else {
		if (localStorage.getItem("remainingTime")) {
		localStorage.removeItem("remainingTime");
		}
		controller.currentMistakes = [];
		controller.mistakesTracker = 0;
		controller.answeredQuestionTracker = 0;
		controller.correctAnswersTracker = 0;
	}

	if (controller.mode === "math") {
		generateCombinations();
	}

	localStorage.setItem('controller', JSON.stringify(controller));
	redirectToQuestions();
};

function startQuestionsNumber () {
	controller = JSON.parse(localStorage.getItem('controller'));

	if (controller.task) {
	  controller.questionNumber = parseInt(controller.setTaskDuration);
	} else {
			controller.questionNumber = parseInt(questionNumberInputElement.value);
	}
	if (!controller.questionNumber) {
	controller.questionNumber = 20;
	}

	// Resuming a teacher-assigned task that already has saved progress: restore trackers and the
	// elapsed stopwatch instead of wiping everything to a fresh start.
	const resuming = !!(controller.task && controller.task[0] === "setTask" && controller.resumeData);

	controller.result = ['', '', '', '', '']
	controller.equation = '';
	controller.randomSelection = [];
	controller.questionsStopped = false;

	if (resuming) {
		const resumeSeconds = Number(controller.resumeData.secondsElapsed) || 0;
		const resumeProgress = controller.resumeData.progress || {};
		controller.currentMistakes = resumeProgress.currentMistakes || [];
		controller.mistakesTracker = Number(controller.resumeData.mistakesSoFar) || 0;
		controller.answeredQuestionTracker = Number(controller.resumeData.answeredCount) || 0;
		controller.correctAnswersTracker = 0;
		// NOTE: deliberately not touching controller.randomSelection here — it means something
		// different per task type (math: [num1,num2,op]; text comprehension: [currentItem]) and
		// writing to index 2 generically made its .length non-zero for all of them, which broke
		// their own "is there already a buffered item" checks. Grammar (rasyba.html) restores its
		// own sequence position itself, using controller.resumeData directly, not this field.
		if (typeof resumeProgress.passNumber === "number") {
			controller.passNumber = resumeProgress.passNumber;
		}
		// Deliberately NOT writing "startTime" here: this runs on uzduotys.html, before the
		// navigation + script-load time it takes to actually reach the task page — pre-computing
		// it against Date.now() here would count that navigation delay against the student (the
		// stopwatch would already show a few seconds elapsed the moment they can see/interact
		// with it). startTimer() on the destination page computes the resume-adjusted value
		// itself, the moment it actually starts ticking, so only real navigation time is free.
		if (localStorage.getItem("startTime")) {
		localStorage.removeItem("startTime");
		}
	} else {
		if (localStorage.getItem("startTime")) {
		localStorage.removeItem("startTime");
		}
		controller.currentMistakes = [];
		controller.mistakesTracker = 0;
		controller.answeredQuestionTracker = 0;
		controller.correctAnswersTracker = 0;
	}

	if (controller.mode === "math") {
			generateCombinations();
	}
	if (controller.combinations.length > controller.questionNumber) {
	controller.combinations = controller.combinations.sort(() => 0.5 - Math.random()).slice(0, controller.questionNumber);
	}

	localStorage.setItem('controller', JSON.stringify(controller));
	redirectToQuestions();
}

function getOptionTextFromValues(values, taskDuration, forTeacher = false, compact=false) {
    let compactDescription = []
    // Helper function to get the Lithuanian plural form based on number
    function getLithuanianPlural(number, forms) {
        const num = parseInt(number);
        const lastDigit = parseInt(number.toString().slice(-1));
        
        if (num === 1 || (lastDigit === 1 && num !== 11)) {
            return forms[0]; // singular
        } else if ((num > 1 && num < 10) || (num > 20 && lastDigit !== 0)) {
            return forms[1]; // plural (2-9)
        } else if (num >= 10) {
            return forms[2]; // plural (10+)
        }
        return forms[2];
    }

    function determineQuestionNumberTimeLabelEnding(type, string) {
        
        if (type === "C39") {
            const forms = ['MINUTĘ', 'MINUTES', 'MINUČIŲ'];
            const durationTypeTag = getLithuanianPlural(string, forms);
            return `PRAKTIKUOTIS ${string} ${durationTypeTag}`;
        }
        
        if (values[0] === "math") {
            const forms = ['VEIKSMĄ', 'VEIKSMUS', 'VEIKSMŲ'];
            const durationTypeTag = getLithuanianPlural(string, forms);
            return `ATLIKTI ${string} ${durationTypeTag}`;
        }
        
        if (values[0] === "lang") {
            if (values[1] === "C49") {
                const forms = ['TEKSTĄ', 'TEKSTUS', 'TEKSTŲ'];
                const durationTypeTag = getLithuanianPlural(string, forms);
                return `SUDĖLIOTI ${string} ${durationTypeTag}`;
            }
            
            if (values[1] === "C83") {
                const forms = ['SAKINYS', 'SAKINIAI', 'SAKINIŲ'];
                const durationTypeTag = getLithuanianPlural(string, forms);
                return `${string} ${durationTypeTag}`;
            }
        }
    }

    // Map operation codes to unknown component text
    const unknownComponentMap = {
        'C1': 'NEŽINOMAS DĖMUO',
        'C2': {
            'C43': 'NEŽINOMAS TURINYS',
            'C44': 'NEŽINOMAS ATĖMINYS'
        },
        'C3': 'NEŽINOMAS DĖMUO / TURINYS / ATĖMINYS',
        'C4': 'NEŽINOMAS DAUGINAMASIS',
        'C5': {
            'C45': 'NEŽINOMAS DALINYS',
            'C46': 'NEŽINOMAS DALIKLIS'
        },
        'C6': 'NEŽINOMAS DAUGINAMASIS / DALINYS / DALIKLIS',
        'C7': 'NEŽINOMAS DĖMUO / TURINYS / ATĖMINYS / DAUGINAMASIS / DALINYS / DALIKLIS'
    };

    function getUnknownComponent(operationType, subType) {
        const mapping = unknownComponentMap[operationType];
        return typeof mapping === 'object' ? mapping[subType] : mapping;
    }

    const result = [];
    const final_results = [];

    if (values[0] === "math") {
        result.push(parameterDictionary[values[1]]["decodedParameterText"]);
        result.push(parameterDictionary[values[2]]["decodedParameterText"]);
        result.push(parameterDictionary[values[3]]?.["decodedParameterText"] || "");
        result.push(parameterDictionary[values[4]]["decodedParameterText"]);
        
        if (values[4] === "C42") {
            result.push(getUnknownComponent(values[1], values[5]));
        } else {
            result.push(parameterDictionary[values[5]]["decodedParameterText"]);
        }

        result.push(parameterDictionary[values[6]]["decodedParameterText"]);
        result.push(values[7]);
        result.push(values[8] ? "DALYBA SU LIEKANA" : "DALYBA BE LIEKANOS");
        result.push(values[9]);

        final_results.push(result[0]);
        compactDescription.push([result[0], "primary"])

        if (result[0] === "SUDĖTIS" || result[0] === "ATIMTIS" || result[0] === "SUDĖTIS IR ATIMTIS") {
            final_results.push(result[1]);
            final_results.push(result[2]);
            final_results.push(result[3]);

            compactDescription.push([result[1], "primary"])

            if (result[3] === "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU") {
                final_results.push(result[4]);

                compactDescription.push(["SU NEŽINOMUOJU", "primary"])
                compactDescription.push([result[4], "secondary"])
            }

            final_results.push(result[5]);
            compactDescription.push([result[5], "secondary"])

            if (taskDuration) {
              final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
            }
        } else if (result[0] === "DAUGYBA") {
            final_results.push(result[1]);
            compactDescription.push([result[1], "primary"])

            if (result[1] === "DAUGYBOS LENTELĖ") {
                final_results.push(`NUO ${result[6][0]} IKI ${result[6][1]}`);
                compactDescription.push([`NUO ${result[6][0]} IKI ${result[6][1]}`, "primary"])
            }
            final_results.push(result[3]);
            if (result[3] === "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU") {
                final_results.push(result[4]);

                compactDescription.push(["SU NEŽINOMUOJU", "primary"])
                compactDescription.push([result[4], "secondary"])
            }

            final_results.push(result[5]);
            compactDescription.push([result[5], "secondary"])

            if (taskDuration) {
              final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
            }
        } else if (result[0] === "DALYBA" || result[0] === "DAUGYBA IR DALYBA") {
            final_results.push(result[1]);
            compactDescription.push([result[1], "primary"])

            if (result[1] === "DAUGYBOS LENTELĖ") {
                final_results.push(`NUO ${result[6][0]} IKI ${result[6][1]}`);
                compactDescription.push([`NUO ${result[6][0]} IKI ${result[6][1]}`, "primary"])
            }

            final_results.push(result[7]);

            if (result[3] === "DALYBA SU LIEKANA") {
              compactDescription.push(["SU LIEKANA", "primary"])
            }

            final_results.push(result[3]);
            if (result[4] === "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU") {
                final_results.push(result[4]);

                compactDescription.push(["SU NEŽINOMUOJU", "primary"])
                compactDescription.push([result[4], "secondary"])
            }
            final_results.push(result[5]);
            compactDescription.push([result[5], "secondary"])

            if (taskDuration) {
              final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
            }
        } else if (result[0] === "ĮVAIRŪS VEIKSMAI") {
            final_results.push(result[1]);
            final_results.push(result[3]);

            compactDescription.push([result[1], "primary"])

            if (result[4] === "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU") {
                final_results.push(result[4]);

                compactDescription.push(["SU NEŽINOMUOJU", "primary"])
                compactDescription.push([result[4], "secondary"])
            }
            final_results.push(result[5]);
            compactDescription.push([result[5], "secondary"])

            if (taskDuration) {
              final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
            }
        }
    } else if (values[0] === "lang") {
        result.push(parameterDictionary[values[1]]["decodedParameterText"]);
        result.push(parameterDictionary[values[2]]["decodedParameterText"]);
        result.push(parameterDictionary[values[3]]["decodedParameterText"]);

        if (values[3] === "C50") {
            const outerLiItem = document.createElement('li');
            outerLiItem.textContent = "RAŠYBOS NUSTATYMAI:";

            const grammarParamsList = document.createElement('ul');
            grammarParamsList.classList.add('grammar-params-list');

            Object.keys(values[4]).forEach(key => {
                const listItem = document.createElement('li');
                listItem.innerHTML = parameterDictionary[key]["decodedParameterText"];
                grammarParamsList.appendChild(listItem);
            });

            outerLiItem.appendChild(grammarParamsList);
            result.push(outerLiItem.outerHTML);
            result.push(parameterDictionary[values[5]]["decodedParameterText"]);
            if (values[6] === 0) {
              result.push("RETESNI IR DAŽNESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI")
            } else if (values[6] === 1) {
                result.push("DAŽNESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI")
            } else if (values[6] === 3) {
                result.push("RETESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI")
            }
        }

        final_results.push(result[0]);
        final_results.push(result[1]);

        compactDescription.push([result[1], "primary"])

        if (result[0] === "TEKSTO SUPRATIMAS") {
            if (values[4] === "C82") {
                if (forTeacher) {
                    result.push(parameterDictionary[values[5]]["decodedParameterText"]);
                    result.push(parameterDictionary[values[6]]["decodedParameterText"]);
                    result.push(parameterDictionary[values[4]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[5]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[6]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[4]]["decodedParameterText"]);

                    compactDescription.push([parameterDictionary[values[6]]["decodedParameterText"], "primary"])

                } else {
                    result.push(parameterDictionary[values[6]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[5]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[6]]["decodedParameterText"]);
                }
                final_results.push(parameterDictionary[values[3]]["decodedParameterText"]);

                if (parameterDictionary[values[3]]["decodedParameterText"] === "BE DISTRAKTORIAUS") {
                  compactDescription.push([parameterDictionary[values[3]]["decodedParameterText"], "secondary"])
                } else {
                  compactDescription.push([parameterDictionary[values[3]]["decodedParameterText"], "primary"])
                }

                if (taskDuration) {
                  final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
                }
            } else if (values[4] === "C84") {
                if (forTeacher) {
                    final_results.push(parameterDictionary[values[4]]["decodedParameterText"]);

                    compactDescription.push([parameterDictionary[values[4]]["decodedParameterText"], "primary"])

                    const outerDiv = document.createElement("div");
                    outerDiv.classList = "selected-text-task-info-for-teachers-list";

                    if (taskDuration) {
                      // "Tekstų ID:" and each text's number as a small button (in a pop-up it opens the pop-up's own browser)
                      const htmlItems = taskDuration[1]
                          .map(id => `<button type="button" class="selected-text-task-info-for-teachers-item text-id-chip" data-text-id-chip="${id}" title="Atidaryti tekstą naršyklėje" onclick="event.stopPropagation(); (typeof openTextIdChip === 'function' ? openTextIdChip(${id}, this) : openTextBrowser(${id}))">${id}</button>`)
                          .join("");

                      outerDiv.innerHTML = `<span class="selected-text-ids-label">Tekstų ID:</span>${htmlItems}`;
                    }
                    final_results.push(outerDiv.outerHTML);
                    final_results.push(parameterDictionary[values[3]]["decodedParameterText"]);

                    compactDescription.push([parameterDictionary[values[3]]["decodedParameterText"], "primary"])
                } else {
                    final_results.push(parameterDictionary[values[3]]["decodedParameterText"]);

                    compactDescription.push([parameterDictionary[values[3]]["decodedParameterText"], "primary"])
                    
                    if (taskDuration) {
                      final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1].length.toString()));
                    }
                }
            }

        } else if (result[0] === "GRAMATIKA") {
          final_results.push(result[2]);

          if (result[1] === "RAŠYBA") {
            let compactParams = []
            let outerLiItem = document.createElement('li');
                outerLiItem.textContent = "RAŠYBOS NUSTATYMAI:"; // Add a label for the outer <li>
                let grammarParamsList = document.createElement('ul');
                grammarParamsList.classList.add('grammar-params-list');
                Object.keys(values[4]).forEach(key => {
                    const param = parameterDictionary[key]["decodedParameterText"]
                    compactParams.push(param)
                    let listItem = document.createElement('li');
                    listItem.innerHTML = param;
                    grammarParamsList.appendChild(listItem);
                });

                outerLiItem.appendChild(grammarParamsList);

                // Store as an HTML string
                result.push(outerLiItem.outerHTML);
                result.push(parameterDictionary[values[5]]["decodedParameterText"])

                if (values[6] === 0) {
                  result.push("RETESNI IR DAŽNESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI")
                } else if (values[6] === 1) {
                    result.push("DAŽNESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI")
                } else if (values[6] === 3) {
                    result.push("RETESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI")
                }
            
            final_results.push(result[3]);
            compactDescription.push([compactParams, "grammar-params"])

            if (result[2] === "3-4 KLASĖ") {
                if ("C62" in values[4] || "C63" in values[4] || "C65" in values[4]) {
                    final_results.push(result[4]);

                    compactDescription.push([result[4], "secondary"])
                }
            }

            final_results.push(result[5]);
            compactDescription.push([result[5], "secondary"])

            if (taskDuration) {
              final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
            }
          }
      }
    }
    
    if (compact) {
      return compactDescription
    } else {
      return final_results;
    }
    
}

//TASK INFO COLLECTION START

async function recordTaskToLongTerm() {
  if (!LONG_TERM_RECORDING_ENABLED) {
    return;
  }

  const recordsList = await controllerToTask();
  console.log(recordsList)

  try {
    const response = await apiFetch(apiBase + 'students/long-term', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: userData.userId,
        records: recordsList
      })
    });

    if (!response) return;

    if (response.ok) {
      console.log('Completed task recorded successfully');
      return true;
    } else {
      console.error(`Failed to record task: ${response.status}`);
      return false;
    }
  } catch (err) {
    console.error('Error recording completed task:', err);
    return false;
  }
}

async function controllerToTask() {
    console.log(controller)
    const correctAnswers = controller.correctAnswersTracker;
    const mistakes = controller.mistakesTracker;

    const totalAnswers = controller.answeredQuestionTracker;
    const mode = controller.mode;
    let recordsList = [];
    let task = [];
    let timeSpentInTask

    if (controller.modeChoice4 === "C40") {
      timeSpentInTask = elapsedTime;
    } else if (controller.modeChoice4 === "C39") {
      timeSpentInTask = controller.timerLimit * 60000;
    }

    if (mode === "math") {
        const modeChoice3Value = controller.modeChoice3 ? "C37" : "C38";
        
        task = [
            mode,
            controller.modeChoice1,
            controller.modeChoice2,
            modeChoice3Value,
            controller.modeChoice5,
            controller.modeChoice6,
            controller.modeChoice7,
            controller.selectedNumbers,
            controller.withRemainder,
            controller.modeChoice8
        ];
        
        console.log(timeSpentInTask)
        const answerRate = Number((totalAnswers / (timeSpentInTask / 1000 / 60)).toFixed(1));

        recordsList = [{
            taskInfo: task,
            correct: correctAnswers,
            mistakes: mistakes,
            totalAnswers: totalAnswers,
            answerRate: answerRate,
            mistakesDetail: controller.currentMistakes
        }];
        
    } else if (mode === "lang") {
        if (controller.modeChoice1 === "C49") {
            if (controller.modeChoice7 === "C82") {
                task = [
                    mode,
                    controller.modeChoice1,
                    controller.modeChoice2,
                    controller.modeChoice6,
                    "C82",
                    controller.classChoice,
                    controller.modeChoiceLtDifficulty
                ];
                
                const answerRate = Number((totalAnswers / (timeSpentInTask / 1000 / 60)).toFixed(1));
                recordsList = [{
                    taskInfo: task,
                    correct: correctAnswers,
                    mistakes: mistakes,
                    totalAnswers: totalAnswers,
                    answerRate: answerRate,
                    mistakesDetail: controller.currentMistakes
                }];
                
            } else if (controller.modeChoice7 === "C84") {
                // Process C84 selected texts
                recordsList = await processSelectedTexts();
            }
            
        } else if (controller.modeChoice1 === "C83") {
            if (controller.modeChoice2 === "C50") {
                task = [
                    mode,
                    controller.modeChoice1,
                    controller.modeChoice2,
                    controller.classChoice,
                    controller.modeChoice3,
                    controller.modeChoice5,
                    controller.questionFrequency
                ];
                
                const answerRate = Number((totalAnswers / (timeSpentInTask / 1000 / 60)).toFixed(1));
                recordsList = [{
                    taskInfo: task,
                    correct: correctAnswers,
                    mistakes: mistakes,
                    totalAnswers: totalAnswers,
                    answerRate: answerRate,
                    mistakesDetail: controller.currentMistakes
                }];
            }
        }
    }

    // the task's length, in the teacher tasks' format: ["C40", questions] / ["C39", minutes]. Own practice rows are told
    // apart from the older archive rows by it (those have no teacher task, group or duration).
    const taskLength = controller.modeChoice4 === "C39" ? controller.timerLimit : controller.questionNumber;
    const replay = grammarReplayInfo();
    recordsList.forEach(record => {
        if (!record.duration) record.duration = JSON.stringify(replay
            ? [controller.modeChoice4 || "C40", Number(taskLength) || 0, replay.seed, replay.grade, replay.textsMax, replay.textsHash]
            : [controller.modeChoice4 || "C40", Number(taskLength) || 0]);
    });

    return recordsList;
}

async function processSelectedTexts() {
    const validTextTimes = Object.entries(timeTakenForEachText).filter(([textId, times]) => {
        return times.startTime !== undefined && times.endTime !== undefined;
    });

    if (validTextTimes.length === 0) {
        return [];
    }

    // Load the text database
    let textLibrary;
    try {
        const response = await fetch('../databases/sudedu_duomenu_baze.json');
        textLibrary = await response.json();
    } catch (error) {
        console.error('Error loading text database:', error);
        return [];
    }

    // Create a map of mistakes by textId
    const mistakesByText = {};
    controller.currentMistakes.forEach(([textId, mistakeCount]) => {
        mistakesByText[textId] = mistakeCount;
    });

    // Process each text and group by difficulty AND class
    const groupedByDifficultyAndClass = {};
    
    validTextTimes.forEach(([textId, times]) => {
        const text = textLibrary[textId.toString()];
        
        if (!text) {
            console.warn(`Text with id ${textId} not found in database`);
            return;
        }

        // Determine class level
        let classLevel = null;
        const classChoiceArray = text["class"];
        
        if (classChoiceArray && Array.isArray(classChoiceArray)) {
            // If both are present, take 3_4_klase
            if (classChoiceArray.includes("C76")) {
                classLevel = 'C76'; // 3_4_klase
            } else if (classChoiceArray.includes("C75")) {
                classLevel = 'C75'; // 1_2_klase
            }
        }

        if (!classLevel) {
            console.warn(`Could not determine class level for text ${textId}`);
            return;
        }

        // Determine difficulty level based on modeChoice2
        let difficultyLevel = null;

        if (controller.modeChoice2 === "C51") {
          const difficultyCode = text["SF"]?.["C51"];
          if (difficultyCode && ["C58", "C59", "C60"].includes(difficultyCode)) {
              difficultyLevel = difficultyCode;
          }
        } else if (controller.modeChoice2 === "C52") {
            const difficultyCode = text["SF"]?.["C52"];
            if (difficultyCode && ["C58", "C59", "C60"].includes(difficultyCode)) {
                difficultyLevel = difficultyCode;
            }
        }

        if (!difficultyLevel) {
            console.warn(`Could not determine difficulty for text ${textId}`);
            return;
        }

        // Create group key combining class and difficulty
        const groupKey = `${classLevel}_${difficultyLevel}`;

        // Initialize group if it doesn't exist
        if (!groupedByDifficultyAndClass[groupKey]) {
            groupedByDifficultyAndClass[groupKey] = {
                classLevel: classLevel,
                difficultyLevel: difficultyLevel,
                texts: [],
                totalTime: 0
            };
        }

        // Add text to group
        const textMistakes = mistakesByText[textId] || 0;
        const textTime = times.endTime - times.startTime;
        
        groupedByDifficultyAndClass[groupKey].texts.push({
            id: textId,
            mistakes: textMistakes,
            time: textTime
        });
        groupedByDifficultyAndClass[groupKey].totalTime += textTime;
    });

    console.log(groupedByDifficultyAndClass)

    // Create records for each difficulty + class group
    const recordsList = [];

    for (const [groupKey, group] of Object.entries(groupedByDifficultyAndClass)) {
        const totalTexts = group.texts.length;
        const correctAnswers = group.texts.filter(t => t.mistakes === 0).length;
        const totalMistakes = group.texts.reduce((sum, t) => sum + t.mistakes, 0);
        const totalTimeMinutes = group.totalTime / 1000 / 60;
        const answerRate = Number((totalTexts / totalTimeMinutes).toFixed(1));

        const task = [
            "lang",
            controller.modeChoice1,      // "C49"
            controller.modeChoice2,      // "C51" or "C52"
            controller.modeChoice6,      // e.g., "C80"
            "C82",                       // Changed from C84 to C82
            group.classLevel,            // "C75" or "C76"
            group.difficultyLevel        // e.g., "C58", "C59", etc.
        ];

        recordsList.push({
            taskInfo: task,
            correct: correctAnswers,
            mistakes: totalMistakes,
            totalAnswers: totalTexts,
            answerRate: answerRate,
            mistakesDetail: group.texts.map(t => [t.id, t.mistakes]),
            duration: JSON.stringify(["C40", totalTexts])
        });
    }

    return recordsList;
}

async function fetchTaskStats(studentId, taskInfoList) {
    try {
        if (!Array.isArray(taskInfoList) || taskInfoList.length === 0) {
            console.error('taskInfoList must be a non-empty array');
            return null;
        }

        const allStudentIds = Array.from(
            document.querySelectorAll('.outer-student-list-entry-item .student-name')
        ).map(el => Number(el.dataset.studentId));

        await ensureAllStudentsCached(allStudentIds);

        return buildGraphDataFromCache(studentId, taskInfoList);

    } catch (error) {
        messageToTheUser("Nepavyko pasiekti duomenų. Bandykite vėl vėliau.");
        console.error('Error fetching task stats:', error);
        return null;
    }
}

async function ensureAllStudentsCached(studentIds) {
    const now = Date.now();
    const missing = studentIds.filter(id => {
        const cached = taskArchiveCache[id];
        return !cached || (now - cached.cachedAt) >= TASK_ARCHIVE_CACHE_TTL;
    });

    await Promise.all(missing.map(async (id) => {
        try {
            const response = await apiFetch(`${apiBase}students/task-history/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response && response.ok) {
                taskArchiveCache[id] = { rows: await response.json(), cachedAt: now };
            }
        } catch (e) {
            console.error(`Failed to cache student ${id}:`, e);
        }
    }));
}

function getCategory(taskInfoStr) {
    try {
        const parsed = JSON.parse(taskInfoStr);
        if (parsed[0] === 'math') return 'math';
        if (parsed[0] === 'lang' && parsed[1] === 'C49') return 'text';
        if (parsed[0] === 'lang' && parsed[1] === 'C83') return 'grammar';
        return 'other';
    } catch (e) { return 'other'; }
}

function upperOutlierThreshold(values) {
    if (values.length < 4) return Infinity;
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    return q3 + 1.5 * iqr;
}

function removeOutliers(values) {
    if (values.length < 4) return values;
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    return sorted.filter(v => v >= lower && v <= upper);
}

function isOutlierIndex(values) {
    if (values.length < 4) return values.map(() => false);
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    return values.map(v => v < lower || v > upper);
}

function median(values) {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}

function filterOutlierRows(rows) {
    if (rows.length < 4) return rows.filter(r => r.answerRate > 0);

    const validRows = rows.filter(r => r.answerRate > 0);

    // Per-category upper-only mistake threshold
    const catMistakes = {};
    validRows.forEach(r => {
        const cat = getCategory(r.taskInfo);
        if (!catMistakes[cat]) catMistakes[cat] = [];
        catMistakes[cat].push(r.totalAnswers > 0 ? (r.mistakes / r.totalAnswers) * 100 : 0);
    });
    const catThresholds = {};
    Object.entries(catMistakes).forEach(([cat, vals]) => {
        catThresholds[cat] = upperOutlierThreshold(vals);
    });

    // Speed — symmetric IQR
    const speedVals = validRows.map(r => r.answerRate);
    const sOutliers = isOutlierIndex(speedVals);

    return validRows.filter((r, i) => {
        if (sOutliers[i]) return false;
        const cat = getCategory(r.taskInfo);
        const mistakePct = r.totalAnswers > 0 ? (r.mistakes / r.totalAnswers) * 100 : 0;
        if (mistakePct > catThresholds[cat]) return false;
        return true;
    });
}

function aggregateRowsByDate(rows) {
    const grouped = new Map();

    rows.forEach(row => {
        const key = row.date;
        if (!grouped.has(key)) {
            grouped.set(key, {
                date: row.date,
                totalMistakes: 0,
                totalAnswers: 0,
                correctSum: 0,
                weightedAnswerRateSum: 0
            });
        }
        const bucket = grouped.get(key);
        bucket.totalMistakes += row.mistakes;
        bucket.totalAnswers += row.totalAnswers;
        bucket.correctSum += row.correct;
        bucket.weightedAnswerRateSum += row.answerRate * row.totalAnswers;
    });

    return Array.from(grouped.values()).map(bucket => ({
        date: bucket.date,
        correct: Number(bucket.correctSum.toFixed(2)),
        mistakes: bucket.totalMistakes,
        totalAnswers: bucket.totalAnswers,
        answerRate: bucket.totalAnswers > 0
            ? Number((bucket.weightedAnswerRateSum / bucket.totalAnswers).toFixed(1))
            : 0
    }));
}

function buildGraphDataFromCache(studentId, taskInfoList) {
    const taskInfoStrings = new Set(taskInfoList.map(t => JSON.stringify(t)));
    const filterRows = rows => rows.filter(row => taskInfoStrings.has(row.taskInfo));

    const studentCache = taskArchiveCache[studentId];
    if (!studentCache) return null;

    const rawStudentRows = aggregateRowsByDate(filterRows(studentCache.rows))
        .sort((a, b) => a.date.localeCompare(b.date));

    if (rawStudentRows.length === 0) return {
        studentDates: [], mistakeFrequency: [], answerRate: [],
        averageDates: [], averageMistakeFrequency: [], averageAnswerRate: []
    };

    const cleanStudentRows = filterOutlierRows(rawStudentRows);

    if (cleanStudentRows.length < 5) return { insufficient: true };

    const graphData = {
        studentDates: cleanStudentRows.map(r => r.date),
        mistakeFrequency: cleanStudentRows.map(r =>
            r.totalAnswers > 0 ? Math.round((r.mistakes / r.totalAnswers) * 100) : 0
        ),
        answerRate: cleanStudentRows.map(r => r.answerRate),
        averageDates: [],
        averageMistakeFrequency: [],
        averageAnswerRate: []
    };

    const allDataPoints = [];
    Object.entries(taskArchiveCache).forEach(([cachedId, cached]) => {
        const cleanRows = filterOutlierRows(aggregateRowsByDate(filterRows(cached.rows)));
        cleanRows.forEach(row => {
            allDataPoints.push({
                date: row.date,
                timestamp: new Date(row.date).getTime(),
                mistakeFreq: row.totalAnswers > 0 ? (row.mistakes / row.totalAnswers) * 100 : 0,
                answerRate: row.answerRate,
                totalAnswers: row.totalAnswers,
                studentId: Number(cachedId)
            });
        });
    });

    if (allDataPoints.length >= 2) {
        const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
        const TIME_DECAY = 0.15;
        const totalStudents = Object.keys(taskArchiveCache).length;
        const MIN_STUDENTS = Math.max(3, Math.ceil(totalStudents * 0.3));
        const allDates = [...new Set(allDataPoints.map(dp => dp.date))].sort();

        // Full date range: union of all student dates and average dates
        const allRelevantDates = [...new Set([
            ...cleanStudentRows.map(r => r.date),
            ...allDates
        ])].sort();

        const averages = { dates: [], mistakeFrequency: [], answerRate: [] };

        allDates.forEach(dateStr => {
            const target = new Date(dateStr).getTime();
            const window = allDataPoints.filter(dp => Math.abs(dp.timestamp - target) <= WINDOW_MS);

            const byStudent = new Map();
            window.forEach(dp => {
                if (!byStudent.has(dp.studentId)) byStudent.set(dp.studentId, []);
                byStudent.get(dp.studentId).push(dp);
            });

            if (byStudent.size < MIN_STUDENTS) return;

            const studentMistakes = [];
            const studentAnswerRates = [];

            byStudent.forEach(points => {
                let wMistake = 0, wAnswerRate = 0, wTotal = 0;
                points.forEach(dp => {
                    const timeWeight = Math.exp(-TIME_DECAY * Math.abs(dp.timestamp - target) / (24 * 60 * 60 * 1000));
                    const sampleWeight = dp.totalAnswers || 1;
                    const w = timeWeight * sampleWeight;
                    wMistake += dp.mistakeFreq * w;
                    wAnswerRate += dp.answerRate * w;
                    wTotal += w;
                });
                if (wTotal > 0) {
                    studentMistakes.push(wMistake / wTotal);
                    studentAnswerRates.push(wAnswerRate / wTotal);
                }
            });

            const medMistake = median(removeOutliers(studentMistakes));
            const medAnswerRate = median(removeOutliers(studentAnswerRates));

            if (medMistake !== null && medAnswerRate !== null) {
                averages.dates.push(dateStr);
                averages.mistakeFrequency.push(medMistake);
                averages.answerRate.push(medAnswerRate);
            }
        });

        if (averages.dates.length > 1) {

            // Compute linear trendline over known average points
            function trendlineValue(dates, values, targetDate) {
                const xs = dates.map((d, i) => i);
                const ys = values;
                const n = xs.length;
                const sumX = xs.reduce((a, b) => a + b, 0);
                const sumY = ys.reduce((a, b) => a + b, 0);
                const sumXY = xs.reduce((a, x) => a + x * ys[xs.indexOf(x)], 0);
                const sumXX = xs.reduce((a, x) => a + x * x, 0);
                const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                const intercept = (sumY - slope * sumX) / n;

                // Find where targetDate falls relative to known dates
                const knownTimestamps = dates.map(d => new Date(d).getTime());
                const targetTs = new Date(targetDate).getTime();
                const firstTs = knownTimestamps[0];
                const lastTs = knownTimestamps[knownTimestamps.length - 1];
                const totalSpan = lastTs - firstTs || 1;
                const x = (targetTs - firstTs) / totalSpan * (n - 1);
                return slope * x + intercept;
            }

            // Fill all relevant dates: interpolate between known points, extrapolate outside
            function fillSeries(knownDates, knownValues, targetDates) {
                return targetDates.map(dateStr => {
                    const knownIdx = knownDates.indexOf(dateStr);
                    if (knownIdx !== -1) return knownValues[knownIdx];

                    const targetTs = new Date(dateStr).getTime();
                    const knownTs = knownDates.map(d => new Date(d).getTime());
                    const firstKnownTs = knownTs[0];
                    const lastKnownTs = knownTs[knownTs.length - 1];

                    if (targetTs < firstKnownTs || targetTs > lastKnownTs) {
                        // Extrapolate using trendline
                        return trendlineValue(knownDates, knownValues, dateStr);
                    }

                    // Interpolate between surrounding known points
                    let prevIdx = -1, nextIdx = -1;
                    for (let i = 0; i < knownTs.length; i++) {
                        if (knownTs[i] <= targetTs) prevIdx = i;
                        if (knownTs[i] >= targetTs && nextIdx === -1) nextIdx = i;
                    }

                    if (prevIdx === -1) return knownValues[0];
                    if (nextIdx === -1) return knownValues[knownValues.length - 1];
                    if (prevIdx === nextIdx) return knownValues[prevIdx];

                    const t = (targetTs - knownTs[prevIdx]) / (knownTs[nextIdx] - knownTs[prevIdx]);
                    return knownValues[prevIdx] + t * (knownValues[nextIdx] - knownValues[prevIdx]);
                });
            }

            const filledMistake = fillSeries(averages.dates, averages.mistakeFrequency, allRelevantDates);
            const filledAnswerRate = fillSeries(averages.dates, averages.answerRate, allRelevantDates);

            // 3-point moving average smooth
            const smoothed = arr => arr.map((_, i) => {
                const s = Math.max(0, i - 1), e = Math.min(arr.length, s + 3);
                const w = arr.slice(s, e);
                return w.reduce((a, b) => a + b, 0) / w.length;
            });

            graphData.averageDates = allRelevantDates;
            graphData.averageMistakeFrequency = smoothed(filledMistake).map(v => Math.round(v));
            graphData.averageAnswerRate = smoothed(filledAnswerRate).map(v => Number(v.toFixed(1)));
        }
    }

    return graphData;
}

function messageToTheUser(message, errorMessage=true, extendedMessage=false) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.modern-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.className = errorMessage ? 'modern-popup error' : 'modern-popup';

    const iconSvg = errorMessage
    ? `<svg viewBox="0 0 24 24" class="popup-icon-svg">
          <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>`
    : `<svg viewBox="0 0 24 24" class="popup-icon-svg">
          <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>`;

    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-icon">${iconSvg}</div>
            <div class="popup-message">${message}</div>
            <button class="popup-close">&times;</button>
        </div>
    `;

    document.body.appendChild(popup);

    // define closePopup first
    const closePopup = () => {
        clearTimeout(autoClose);
        popup.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 300);
    };

    // auto-close after 6s
    let autoClose;
    
    if (extendedMessage) {
      autoClose = setTimeout(closePopup, 600000);
    } else {
      autoClose = setTimeout(closePopup, 6000);
    }

    // close button
    const closeBtn = popup.querySelector('.popup-close');
    closeBtn.addEventListener('click', closePopup);

    // optional: click outside to close
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closePopup();
        }
    });

    // return manual closer
    return closePopup;
}

//CUSTOM CONFIRM MODAL


//OBJECT POP UP START

const objectPopup = document.getElementById("object-popup");
const objectPopupContent = document.getElementById("object-popup-content");
const objectPopupTitle = document.getElementById("object-popup-title");
const objectPopupSubtitle = document.getElementById("object-popup-subtitle");
const objectPopupClose = objectPopup.querySelector(".object-popup-close");

const infoMessages = {
  "coin-amount-custom-timer": {
    "content": `Pasirinkę šią užduotį, uždirbsite nurodytą kiekį „SUDEDU“ monetų už kiekvieną iš pirmo karto teisingai atsakytą klausimą (plačiau <a href="apie.html#sudedu-monetos">čia</a>).`,
    "title": "Uždarbis",
    "subtitle": ""
  },
  "coin-amount-custom-question-number": {
    "content": `Pasirinkę šią užduotį, galite uždirbti iki nurodyto kiekio „SUDEDU“ monetų, priklausomai nuo iš pirmo karto teisingai atsakytų klausimų skaičiaus (plačiau <a href="apie.html#sudedu-monetos">čia</a>).`,
    "title": "Uždarbis",
    "subtitle": ""
  }
}

let popupOpenTime = 0;
// Open popup with dynamic content
function openObjectPopup(content, title='', subtitle = '', functionToTrigger=null, saferClosing=false, options={}) {
    popupOpenTime = Date.now();
    // Clear existing content
    objectPopupContent.innerHTML = '';
    objectPopupTitle.innerHTML = '';
    objectPopupSubtitle.innerHTML = '';

    if (typeof content === 'string') {
        // If it's an HTML string, insert it
        objectPopupContent.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        // If it's a DOM element, append it directly
        objectPopupContent.appendChild(content);
    }

    objectPopupTitle.innerHTML = title;
    objectPopupSubtitle.innerHTML = subtitle;
    const popupPanel = objectPopup.querySelector('.object-popup-panel');
    if (popupPanel) {
      popupPanel.classList.remove('archive-task-info-popup');
      if (options.className) popupPanel.classList.add(options.className);
      popupPanel.style.width = options.width || '';
      popupPanel.style.maxWidth = options.maxWidth || '';
      popupPanel.style.height = options.height || '';
      popupPanel.style.maxHeight = options.maxHeight || '';
      popupPanel.style.padding = options.padding || '';
      popupPanel.style.margin = options.margin || '';
    }

    // Show the popup
    objectPopup.style.display = 'flex';

    function closeObjectPopup () {
        objectPopup.style.display = 'none';
        if (functionToTrigger) {
          setTimeout(() => {
            functionToTrigger();
          }, 750);
        }
    }

    objectPopupClose.addEventListener("click", () => {
        closeObjectPopup();
    }, { once: true });

    if (!saferClosing) {
      objectPopup.addEventListener("click", (e) => {
          if (e.target === objectPopup && Date.now() - popupOpenTime > 300) {
              closeObjectPopup();
          }
      }, { once: true });
    }
}

function closeObjectPopup () {
    objectPopup.style.display = 'none';
}

//OBJECT POP UP END


function showCustomConfirm(text, onConfirm, args = []) {
    const modal = document.getElementById('customConfirmModal');
    const modalText = document.getElementById('customModalText');
    const yesBtn = document.getElementById('customConfirmYes');
    const noBtn = document.getElementById('customConfirmNo');

    // Set text
    modalText.innerHTML = text;

    // Show modal
    modal.style.display = 'flex';

    // Remove previous click handlers
    yesBtn.onclick = null;
    noBtn.onclick = null;

    // Yes click
    yesBtn.onclick = () => {
        onConfirm(...args); // spread array as multiple arguments
        modal.style.display = 'none';
    };

    // No click
    noBtn.onclick = () => {
        modal.style.display = 'none';
    };
}


// POINTS CALCULATION START

function getLithuanianSchoolPeriod(date = new Date(), periods = [
    { name: "9-10", months: [9, 10] },
    { name: "11-12", months: [11, 12] },
    { name: "1-2", months: [1, 2] },
    { name: "3-8", months: [3, 4, 5, 6, 7, 8] },
]) {
    const month = date.getMonth() + 1;
    for (const period of periods) {
        if (period.months.includes(month)) return period.name;
    }
    return "unknown";
}

const currentSchoolPeriod = getLithuanianSchoolPeriod();

// The coins a correct answer earns: base × the weight of each of the task's settings (per school period and the
// student's grade 0-5), × the multiplication table's weight, × a per-task adjustment when one matches. The weights are
// set on the admin page (Taškai) and kept in the database (AppSetting "points", served by /config/points); browsers
// keep them for a day. These built-in ones are used until then (and when the server has none).
const BUILTIN_POINT_WEIGHTS = {
  "9-10": {"C1":{"label":"sudetis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C10":{"label":"dvizenkliu ir vienazenkliu iki 20","values":[1.5,1.25,0.2,0.0,0.0,0.0]},"C11":{"label":"dvizenkliu ir vienazenkliu iki 100","values":[2.0,1.75,0.75,0.35,0.0,0.0]},"C12":{"label":"dvizenkliu iki 100","values":[2.0,2.0,0.85,0.325,0.25,0.25]},"C13":{"label":"skaiciu iki 1000","values":[2.0,2.0,1.25,0.85,0.5,0.5]},"C14":{"label":"skaiciu iki 10000","values":[2.0,2.0,2.0,1.25,1.15,0.75]},"C15":{"label":"skaiciu iki 1000000","values":[2.0,2.0,2.0,2.0,1.5,1.15]},"C16":{"label":"turinyje gretimi nuliai","values":[2.0,2.0,2.0,1.25,1.25,1.0]},"C17":{"label":"lenteline sudetis ir atimtis iki 20","values":[2.0,1.0,0.3,0.0,0.0,0.0]},"C18":{"label":"daugybos lentele","values":[2.0,2.0,1.0,0.25,0.35,0.25]},"C19":{"label":"dvizenklio is vienazenklio","values":[2.0,2.0,2.0,1.15,0.65,0.5]},"C2":{"label":"atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C20":{"label":"trizenklio is vienazenklio","values":[2.0,2.0,2.0,1.5,0.85,0.75]},"C21":{"label":"keturzenklio is vienazenklio","values":[2.0,2.0,2.0,1.75,1.15,1.0]},"C22":{"label":"daugiazenklio is vienzenklio","values":[2.0,2.0,2.0,1.75,1.25,1.0]},"C23":{"label":"dvizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.5]},"C24":{"label":"trizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.65]},"C25":{"label":"keturzenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C26":{"label":"daugiazenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C27":{"label":"daugiazenkliu","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C28":{"label":"is pilnu lengvesni","values":[2.0,2.0,2.0,1.0,0.35,0.15]},"C29":{"label":"is pilnu sunkesni","values":[2.0,2.0,2.0,1.0,0.5,0.45]},"C3":{"label":"sudetis ir atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C30":{"label":"daugiazenklio is vienazenklio (dalmenyje 0)","values":[2.0,2.0,1.5,1.25,1.25,1.25]},"C31":{"label":"ivairus iki 10","values":[1.25,1.0,0.1,0,0,0]},"C32":{"label":"ivairus iki 20","values":[1.5,1.25,0.2,0,0,0]},"C33":{"label":"ivairus iki 100","values":[2.0,1.75,0.85,0.325,0,0]},"C34":{"label":"ivairus iki 1000","values":[2.0,2.0,1.25,0.85,0.75,0.65]},"C35":{"label":"ivairus iki 10000","values":[2.0,2.0,2.0,1.15,1.25,0.95]},"C36":{"label":"ivairus iki 1000000","values":[2.0,2.0,2.0,2.0,1.25,1.15]},"C37":{"label":"neperzengiant","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C38":{"label":"perzengiant","values":[1.5,1.5,1.5,1.5,1.5,1.5]},"C4":{"label":"daugyba","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C41":{"label":"skaitine","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C42":{"label":"su nezinomuoju","values":[1.25,1.75,1.65,1.25,1.25,1.25]},"C49":{"label":"teksto supratimas","values":[3.0,10.0,7.0,3.0,6.0,6.0]},"C5":{"label":"dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C50":{"label":"rasyba","values":[2.0,6.0,2.0,0.35,0.35,0.25]},"C51":{"label":"turinio komponavimas","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C52":{"label":"strukturos isdestumas","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C58":{"label":"teksto supratimas lengvas","values":[1.0,1.0,0.75,1.15,0.75,0.5]},"C59":{"label":"teksto supratimas vidutinis","values":[1.75,1.75,1.25,2.0,1.25,0.85]},"C6":{"label":"daugyba ir dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C60":{"label":"teksto supratimas sunkus","values":[2.0,2.0,1.75,2.0,1.75,1.25]},"C7":{"label":"ivairius","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C75":{"label":"lietuviu klases 1-2","values":[1.5,1.5,1.0,0.0,0.0,0.0]},"C76":{"label":"lietuviu klases 3-4","values":[2.0,1.75,1.5,1.25,1.0,1.0]},"C77":{"label":"is pilnu simtu","values":[2.0,2.0,1.0,1.0,0.5,0.15]},"C8":{"label":"vienazenkliu iki 10","values":[1.25,1.0,0.1,0.0,0.0,0.0]},"C80":{"label":"be distraktoriaus","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C81":{"label":"su distraktoriumi","values":[1.25,1.25,1.5,1.25,1.25,1.25]},"C9":{"label":"vienazenkliu iki 20","values":[1.5,1.25,0.2,0.0,0.0,0.0]},"DL1":{"label":"daugybos range[1] === 1","values":[1.0,0.5,0.15,0.0,0.0,0.0]},"DL10":{"label":"daugybos range[0] === 10 AND daugybos range[1] ===10","values":[1.25,0.75,0.15,0,0,0]},"DL2":{"label":"daugybos range[1] === 2","values":[2.0,1.0,0.75,0,0,0]},"DLALL":{"label":"daugybos range else","values":[2.0,1.0,1.0,1.0,1.0,1.0]},"base":{"label":"base","values":[0.875,0.1325,0.13,0.475,0.17,0.305]},"remainder":{"label":"su liekana","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"userClass":{"label":"ziniu lygis","values":[0,1,2,3,4,5]}},
  "11-12": {"C1":{"label":"sudetis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C10":{"label":"dvizenkliu ir vienazenkliu iki 20","values":[1.5,1.15,0.2,0.0,0.0,0.0]},"C11":{"label":"dvizenkliu ir vienazenkliu iki 100","values":[2.0,1.75,0.65,0.35,0.0,0.0]},"C12":{"label":"dvizenkliu iki 100","values":[2.0,2.0,0.85,0.35,0.25,0.25]},"C13":{"label":"skaiciu iki 1000","values":[2.0,2.0,1.25,0.85,0.5,0.5]},"C14":{"label":"skaiciu iki 10000","values":[2.0,2.0,2.0,1.25,1.15,0.85]},"C15":{"label":"skaiciu iki 1000000","values":[2.0,2.0,2.0,2.0,1.5,1.15]},"C16":{"label":"turinyje gretimi nuliai","values":[2.0,2.0,2.0,1.25,1.15,0.85]},"C17":{"label":"lenteline sudetis ir atimtis iki 20","values":[2.0,1.25,0.3,0.0,0.0,0.0]},"C18":{"label":"daugybos lentele","values":[2.0,2.0,0.75,0.3,0.35,0.25]},"C19":{"label":"dvizenklio is vienazenklio","values":[2.0,2.0,2.0,1.15,0.65,0.5]},"C2":{"label":"atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C20":{"label":"trizenklio is vienazenklio","values":[2.0,2.0,2.0,1.5,0.85,0.75]},"C21":{"label":"keturzenklio is vienazenklio","values":[2.0,2.0,2.0,1.75,1.15,1.0]},"C22":{"label":"daugiazenklio is vienzenklio","values":[2.0,2.0,2.0,1.75,1.25,1.0]},"C23":{"label":"dvizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C24":{"label":"trizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C25":{"label":"keturzenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C26":{"label":"daugiazenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C27":{"label":"daugiazenkliu","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C28":{"label":"is pilnu lengvesni","values":[2.0,2.0,2.0,1.0,0.35,0.15]},"C29":{"label":"is pilnu sunkesni","values":[2.0,2.0,2.0,1.0,0.5,0.25]},"C3":{"label":"sudetis ir atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C30":{"label":"daugiazenklio is vienazenklio (dalmenyje 0)","values":[2.0,2.0,1.5,1.25,1.25,1.25]},"C31":{"label":"ivairus iki 10","values":[1.25,1.0,0.1,0,0,0]},"C32":{"label":"ivairus iki 20","values":[1.5,1.15,0.2,0,0,0]},"C33":{"label":"ivairus iki 100","values":[2.0,1.75,0.65,0.35,0,0]},"C34":{"label":"ivairus iki 1000","values":[2.0,2.0,1.25,0.85,0.5,0.5]},"C35":{"label":"ivairus iki 10000","values":[2.0,2.0,2.0,1.15,1.15,0.85]},"C36":{"label":"ivairus iki 1000000","values":[2.0,2.0,2.0,2.0,1.25,1.15]},"C37":{"label":"neperzengiant","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C38":{"label":"perzengiant","values":[1.5,1.5,1.5,1.5,1.5,1.5]},"C4":{"label":"daugyba","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C41":{"label":"skaitine","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C42":{"label":"su nezinomuoju","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C49":{"label":"teksto supratimas","values":[6.5,9.0,5.0,4.5,6.5,6.0]},"C5":{"label":"dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C50":{"label":"rasyba","values":[4.5,3.0,0.75,0.4,0.35,0.25]},"C51":{"label":"turinio komponavimas","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C52":{"label":"strukturos isdestumas","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C58":{"label":"teksto supratimas lengvas","values":[1.0,1.25,0.75,1.0,0.85,0.5]},"C59":{"label":"teksto supratimas vidutinis","values":[1.75,1.75,1.25,1.5,1.25,0.75]},"C6":{"label":"daugyba ir dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C60":{"label":"teksto supratimas sunkus","values":[2.0,2.0,1.85,1.75,2.0,1.15]},"C7":{"label":"ivairius","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C75":{"label":"lietuviu klases 1-2","values":[1.5,1.25,1.0,0.0,0.0,0.0]},"C76":{"label":"lietuviu klases 3-4","values":[2.0,1.75,1.5,1.0,1.0,1.0]},"C77":{"label":"is pilnu simtu","values":[2.0,2.0,1.0,1.0,0.5,0.15]},"C8":{"label":"vienazenkliu iki 10","values":[1.25,0.65,0.1,0.0,0.0,0.0]},"C80":{"label":"be distraktoriaus","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C81":{"label":"su distraktoriumi","values":[1.25,1.25,1.25,1.2,1.25,1.25]},"C9":{"label":"vienazenkliu iki 20","values":[1.5,1.25,0.2,0.0,0.0,0.0]},"DL1":{"label":"daugybos range[1] === 1","values":[1.0,0.5,0.15,0.0,0.0,0.0]},"DL10":{"label":"daugybos range[0] === 10 AND daugybos range[1] ===10","values":[1.25,0.75,0.15,0,0,0]},"DL2":{"label":"daugybos range[1] === 2","values":[2.0,1.0,0.75,0,0,0]},"DLALL":{"label":"daugybos range else","values":[2.0,1.0,1.0,1.0,1.0,1.0]},"base":{"label":"base","values":[0.425,0.0975,0.1625,0.385,0.12,0.235]},"remainder":{"label":"su liekana","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"userClass":{"label":"ziniu lygis","values":[0,1,2,3,4,5]}},
  "1-2": {"C1":{"label":"sudetis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C10":{"label":"dvizenkliu ir vienazenkliu iki 20","values":[1.5,0.7,0.2,0.0,0.0,0.0]},"C11":{"label":"dvizenkliu ir vienazenkliu iki 100","values":[2.0,1.75,0.65,0.0,0.0,0.0]},"C12":{"label":"dvizenkliu iki 100","values":[2.0,2.0,0.65,0.35,0.25,0.25]},"C13":{"label":"skaiciu iki 1000","values":[2.0,2.0,1.25,0.65,0.5,0.5]},"C14":{"label":"skaiciu iki 10000","values":[2.0,2.0,2.0,1.25,1.0,0.75]},"C15":{"label":"skaiciu iki 1000000","values":[2.0,2.0,2.0,1.4,1.95,1.15]},"C16":{"label":"turinyje gretimi nuliai","values":[2.0,2.0,2.0,1.25,1.0,0.85]},"C17":{"label":"lenteline sudetis ir atimtis iki 20","values":[2.0,0.8,0.3,0.0,0.0,0.0]},"C18":{"label":"daugybos lentele","values":[2.0,2.0,0.75,0.3,0.35,0.25]},"C19":{"label":"dvizenklio is vienazenklio","values":[2.0,2.0,2.0,1.25,0.65,0.5]},"C2":{"label":"atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C20":{"label":"trizenklio is vienazenklio","values":[2.0,2.0,2.0,1.5,0.85,0.75]},"C21":{"label":"keturzenklio is vienazenklio","values":[2.0,2.0,2.0,1.65,1.15,1.0]},"C22":{"label":"daugiazenklio is vienzenklio","values":[2.0,2.0,2.0,1.65,1.2,1.0]},"C23":{"label":"dvizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C24":{"label":"trizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C25":{"label":"keturzenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C26":{"label":"daugiazenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C27":{"label":"daugiazenkliu","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C28":{"label":"is pilnu lengvesni","values":[2.0,2.0,2.0,0.75,0.35,0.15]},"C29":{"label":"is pilnu sunkesni","values":[2.0,2.0,2.0,1.0,0.5,0.25]},"C3":{"label":"sudetis ir atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C30":{"label":"daugiazenklio is vienazenklio (dalmenyje 0)","values":[2.0,2.0,1.5,1.25,1.25,1.25]},"C31":{"label":"ivairus iki 10","values":[1.25,0.1,0.1,0,0,0]},"C32":{"label":"ivairus iki 20","values":[1.5,0.8,0.2,0,0,0]},"C33":{"label":"ivairus iki 100","values":[2.0,1.75,0.65,0,0,0]},"C34":{"label":"ivairus iki 1000","values":[2.0,2.0,1.25,0.75,0.5,0.5]},"C35":{"label":"ivairus iki 10000","values":[2.0,2.0,2.0,1.15,1.0,0.75]},"C36":{"label":"ivairus iki 1000000","values":[2.0,2.0,2.0,2.0,1.25,1.15]},"C37":{"label":"neperzengiant","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C38":{"label":"perzengiant","values":[1.5,1.5,1.5,1.5,1.5,1.5]},"C4":{"label":"daugyba","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C41":{"label":"skaitine","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C42":{"label":"su nezinomuoju","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C49":{"label":"teksto supratimas","values":[6.5,10.0,8.0,5.5,5.5,6.0]},"C5":{"label":"dalyba","values":[1.25,1.25,1.25,1.25,1.15,1.0]},"C50":{"label":"rasyba","values":[4.0,2.5,1.0,0.65,0.3,0.25]},"C51":{"label":"turinio komponavimas","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C52":{"label":"strukturos isdestumas","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C58":{"label":"teksto supratimas lengvas","values":[1.0,1.0,0.75,1.15,0.75,0.5]},"C59":{"label":"teksto supratimas vidutinis","values":[1.75,1.85,1.15,1.5,1.25,0.75]},"C6":{"label":"daugyba ir dalyba","values":[1.25,1.25,1.25,1.25,1.15,1.0]},"C60":{"label":"teksto supratimas sunkus","values":[2.0,2.0,1.75,2.0,1.75,1.15]},"C7":{"label":"ivairius","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C75":{"label":"lietuviu klases 1-2","values":[1.5,1.0,1.0,0.0,0.0,0.0]},"C76":{"label":"lietuviu klases 3-4","values":[2.0,1.75,1.5,1.0,1.0,1.0]},"C77":{"label":"is pilnu simtu","values":[2.0,2.0,1.0,1.0,0.5,0.15]},"C8":{"label":"vienazenkliu iki 10","values":[1.25,0.1,0.1,0.0,0.0,0.0]},"C80":{"label":"be distraktoriaus","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C81":{"label":"su distraktoriumi","values":[1.25,1.25,1.25,1.2,1.25,1.25]},"C9":{"label":"vienazenkliu iki 20","values":[1.5,0.8,0.2,0.0,0.0,0.0]},"DL1":{"label":"daugybos range[1] === 1","values":[1.0,0.5,0.15,0.0,0.0,0.0]},"DL10":{"label":"daugybos range[0] === 10 AND daugybos range[1] ===10","values":[1.25,0.75,0.15,0,0,0]},"DL2":{"label":"daugybos range[1] === 2","values":[2.0,1.0,0.75,0,0,0]},"DLALL":{"label":"daugybos range else","values":[2.0,1.0,1.0,1.0,1.0,1.0]},"base":{"label":"base","values":[0.425,0.1,0.11,0.137,0.14,0.255]},"remainder":{"label":"su liekana","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"userClass":{"label":"ziniu lygis","values":[0,1,2,3,4,5]}},
  "3-8": {"C1":{"label":"sudetis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C10":{"label":"dvizenkliu ir vienazenkliu iki 20","values":[1.5,0.4,0.2,0.0,0.0,0.0]},"C11":{"label":"dvizenkliu ir vienazenkliu iki 100","values":[2.0,1.25,0.65,0.0,0.0,0.0]},"C12":{"label":"dvizenkliu iki 100","values":[2.0,1.75,0.65,0.35,0.25,0.25]},"C13":{"label":"skaiciu iki 1000","values":[2.0,2.0,1.85,0.65,0.5,0.5]},"C14":{"label":"skaiciu iki 10000","values":[2.0,2.0,2.0,1.25,0.75,0.75]},"C15":{"label":"skaiciu iki 1000000","values":[2.0,2.0,2.0,2.0,1.85,1.15]},"C16":{"label":"turinyje gretimi nuliai","values":[2.0,2.0,2.0,1.25,0.75,0.75]},"C17":{"label":"lenteline sudetis ir atimtis iki 20","values":[2.0,0.5,0.3,0.0,0.0,0.0]},"C18":{"label":"daugybos lentele","values":[2.0,2.0,0.35,0.5,0.35,0.25]},"C19":{"label":"dvizenklio is vienazenklio","values":[2.0,2.0,2.0,1.15,0.65,0.5]},"C2":{"label":"atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C20":{"label":"trizenklio is vienazenklio","values":[2.0,2.0,2.0,1.5,0.85,0.75]},"C21":{"label":"keturzenklio is vienazenklio","values":[2.0,2.0,2.0,1.55,1.0,1.0]},"C22":{"label":"daugiazenklio is vienzenklio","values":[2.0,2.0,2.0,1.6,1.0,1.0]},"C23":{"label":"dvizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.75]},"C24":{"label":"trizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.75]},"C25":{"label":"keturzenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.75]},"C26":{"label":"daugiazenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.75]},"C27":{"label":"daugiazenkliu","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C28":{"label":"is pilnu lengvesni","values":[2.0,2.0,2.0,1.0,0.35,0.15]},"C29":{"label":"is pilnu sunkesni","values":[2.0,2.0,2.0,1.0,0.5,0.25]},"C3":{"label":"sudetis ir atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C30":{"label":"daugiazenklio is vienazenklio (dalmenyje 0)","values":[2.0,2.0,1.5,1.25,1.25,1.25]},"C31":{"label":"ivairus iki 10","values":[1.25,0.0,0.1,0,0,0]},"C32":{"label":"ivairus iki 20","values":[1.5,0.5,0.2,0,0,0]},"C33":{"label":"ivairus iki 100","values":[2.0,1.25,0.65,0,0,0]},"C34":{"label":"ivairus iki 1000","values":[2.0,2.0,1.25,0.75,0.5,0.5]},"C35":{"label":"ivairus iki 10000","values":[2.0,2.0,2.0,1.25,0.95,0.75]},"C36":{"label":"ivairus iki 1000000","values":[2.0,2.0,2.0,2.0,1.25,1.15]},"C37":{"label":"neperzengiant","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C38":{"label":"perzengiant","values":[1.5,1.5,1.5,1.5,1.5,1.5]},"C4":{"label":"daugyba","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C41":{"label":"skaitine","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C42":{"label":"su nezinomuoju","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C49":{"label":"teksto supratimas","values":[7.0,7.5,5.5,4.25,4.0,4.0]},"C5":{"label":"dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C50":{"label":"rasyba","values":[4.0,3.5,1.0,0.35,0.25,0.25]},"C51":{"label":"turinio komponavimas","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C52":{"label":"strukturos isdestumas","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C58":{"label":"teksto supratimas lengvas","values":[1.0,1.0,0.75,1.15,0.75,0.5]},"C59":{"label":"teksto supratimas vidutinis","values":[1.75,1.85,1.15,1.5,1.15,0.75]},"C6":{"label":"daugyba ir dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C60":{"label":"teksto supratimas sunkus","values":[2.0,2.0,1.75,1.75,1.75,1.15]},"C7":{"label":"ivairius","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C75":{"label":"lietuviu klases 1-2","values":[1.5,1.0,1.0,0.0,0.0,0.0]},"C76":{"label":"lietuviu klases 3-4","values":[2.0,1.75,1.5,1.0,1.0,1.0]},"C77":{"label":"is pilnu simtu","values":[2.0,2.0,1.0,1.0,0.5,0.15]},"C8":{"label":"vienazenkliu iki 10","values":[1.25,0.0,0.1,0.0,0.0,0.0]},"C80":{"label":"be distraktoriaus","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C81":{"label":"su distraktoriumi","values":[1.25,1.25,1.25,1.2,1.25,1.25]},"C9":{"label":"vienazenkliu iki 20","values":[1.5,0.65,0.2,0.0,0.0,0.0]},"DL1":{"label":"daugybos range[1] === 1","values":[1.0,0.5,0.15,0.0,0.0,0.0]},"DL10":{"label":"daugybos range[0] === 10 AND daugybos range[1] ===10","values":[1.25,0.75,0.15,0,0,0]},"DL2":{"label":"daugybos range[1] === 2","values":[2.0,1.0,0.75,0,0,0]},"DLALL":{"label":"daugybos range else","values":[2.0,1.0,1.0,1.0,1.0,1.0]},"base":{"label":"base","values":[0.4,0.089,0.12,0.305,0.16,0.265]},"remainder":{"label":"su liekana","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"userClass":{"label":"ziniu lygis","values":[0,1,2,3,4,5]}}
};
const POINT_PERIODS = ["9-10", "11-12", "1-2", "3-8"];
let pointWeights = BUILTIN_POINT_WEIGHTS[currentSchoolPeriod] || BUILTIN_POINT_WEIGHTS["1-2"];
let pointOverrides = [];   // [{ codes: [...], grades: [0..5] | null, factor, note }]
// the settings codes a task's coins depend on (the flags of calculateTasksPerCorrectAnswerPoints)
const POINT_CODES = ["C1","C2","C3","C4","C5","C6","C7","C8","C9","C10","C11","C12","C13","C14","C15","C16","C17","C18","C19","C20",
  "C21","C22","C23","C24","C25","C26","C27","C28","C29","C30","C31","C32","C33","C34","C35","C36","C37","C38","C41","C42",
  "C49","C50","C51","C52","C58","C59","C60","C75","C76","C77","C80","C81"];
const POINT_SETTINGS_KEY = 'sudeduPointSettings';
const POINT_SETTINGS_TTL = 24 * 60 * 60 * 1000;
function applyPointSettings(settings) {
  if (!settings || !(settings.v >= 1) || !settings.periods) return false;
  pointWeights = settings.periods[currentSchoolPeriod] || settings.periods["1-2"] || pointWeights;
  pointOverrides = Array.isArray(settings.overrides) ? settings.overrides : [];
  return true;
}
// (from the browser's copy at once - the coins shown before anything is fetched are the saved ones)
try {
  const cached = JSON.parse(localStorage.getItem(POINT_SETTINGS_KEY) || 'null');
  if (cached && cached.data) applyPointSettings(cached.data);
} catch (e) { /* no copy */ }
let pointSettingsPromise = null;
// the saved weights: the browser's copy while under a day old, otherwise fetched (and kept); never waits more than 4 s
function loadPointSettings(force = false) {
  if (pointSettingsPromise && !force) return pointSettingsPromise;
  pointSettingsPromise = (async () => {
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(POINT_SETTINGS_KEY) || 'null'); } catch (e) { cached = null; }
    if (!force && cached && cached.data && Date.now() - cached.at < POINT_SETTINGS_TTL) return applyPointSettings(cached.data);
    if (typeof apiBase === 'undefined') return false;
    try {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = setTimeout(() => ctrl && ctrl.abort(), 4000);
      const response = await fetch(`${apiBase}config/points`, ctrl ? { signal: ctrl.signal } : {});
      clearTimeout(timer);
      if (!response.ok) return false;
      const data = await response.json();
      try { localStorage.setItem(POINT_SETTINGS_KEY, JSON.stringify({ at: Date.now(), data })); } catch (e) { /* storage full */ }
      return applyPointSettings(data);
    } catch (e) {
      return false;   // (offline / slow: the copy or the built-in weights)
    }
  })();
  return pointSettingsPromise;
}
// the multiplication table's weight code: DL1 (×1 only), DL2 (×2), DL10 (only 10), DLALL
function multiplicationTableCode(selection) {
  if (!Array.isArray(selection) || selection.length < 2) return null;
  const [first, second] = selection.map(x => parseInt(x, 10));
  if (isNaN(first) || isNaN(second)) return null;
  return second === 1 ? 'DL1' : second === 2 ? 'DL2' : first === 10 && second === 10 ? 'DL10' : 'DLALL';
}
// the adjustment of a task (its codes, with the table's code) for a grade: the most specific rule that matches
// (all of its codes in the task's), its factor; 1 when none
function pointOverrideFactor(codes, grade, overrides = pointOverrides) {
  let best = null;
  for (const rule of overrides || []) {
    if (!rule || !Array.isArray(rule.codes) || !rule.codes.length) continue;
    if (Array.isArray(rule.grades) && rule.grades.length && !rule.grades.includes(grade)) continue;
    if (!rule.codes.every(c => codes.has(c))) continue;
    if (!best || rule.codes.length > best.codes.length) best = rule;
  }
  return best && Number.isFinite(Number(best.factor)) ? Number(best.factor) : 1;
}
// a saved task's (taskInfo array) codes, as the coin calculation flags them - for the admin page's analysis
function pointCodesOfTaskInfo(info) {
  const codes = new Set();
  if (!Array.isArray(info)) return codes;
  info.forEach(v => { if (typeof v === 'string' && POINT_CODES.includes(v)) codes.add(v); });
  if (info[0] === 'math') {
    ["C49","C50","C51","C52","C58","C59","C60","C75","C76","C80","C81"].forEach(c => codes.delete(c));
    if (info[8] === true) codes.add('remainder');
    if (info[2] === 'C18') { const dl = multiplicationTableCode(info[7]); if (dl) codes.add(dl); }
  }
  return codes;
}
// a correct answer's coins for a task's codes and a grade with given weights (the calculation below, for the admin page)
function pointsPerCorrectForCodes(codes, grade, weights = pointWeights, overrides = pointOverrides) {
  const w = code => { const v = weights[code] && weights[code].values; return v && v[grade] != null ? Number(v[grade]) : 1; };
  let total = weights.base ? w('base') : 1;
  codes.forEach(code => { if (!/^DL/.test(code)) total *= w(code); });
  if (codes.has('C18')) ['DL1', 'DL2', 'DL10', 'DLALL'].forEach(dl => { if (codes.has(dl)) total *= w(dl); });
  return total * pointOverrideFactor(codes, grade, overrides);
}

const personalChlCoinBonusMultiplier = 1.1;

async function calculateTasksPerCorrectAnswerPoints(type, selectedTextInfo = null) {
    // Helper to get task weight
    const getTaskWeight = (task) => {
        const taskWeightArray = pointWeights[task]?.values;
        return taskWeightArray ? taskWeightArray[taskInfoTemp.userClass] : 1;
    };

    // Special handling for C18
    const getC18Weight = (multSelection) => {
        if (!Array.isArray(multSelection) || multSelection.length < 2) return 1;
        const nums = multSelection.map(x => parseInt(x, 10));
        if (nums.some(isNaN)) return 1;
        const [first, second] = nums;
        if (second === 1) return pointWeights.DL1?.values[taskInfoTemp.userClass] ?? 1;
        if (second === 2) return pointWeights.DL2?.values[taskInfoTemp.userClass] ?? 1;
        if (first === 10 && second === 10) return pointWeights.DL10?.values[taskInfoTemp.userClass] ?? 1;
        return pointWeights.DLALL?.values[taskInfoTemp.userClass] ?? 1;
    };

    const userClass = userData?.knowledgeLvl;
    
    if ((userClass == null)) return;
    await loadPointSettings();
    // the task's flagged codes (with the multiplication table's) → its adjustment
    const overrideOf = flags => {
        const codes = new Set(Object.keys(flags).filter(k => flags[k] === true && !skipTasks.includes(k)));
        if (flags.C18) { const dl = multiplicationTableCode(flags['mult-table-selection']); if (dl) codes.add(dl); }
        return pointOverrideFactor(codes, flags.userClass);
    };

    let taskInfoTemp = {
        userClass,
        lang: false,
        math: false,
        C1: false, C2: false, C3: false, C4: false, C5: false,
        C6: false, C7: false, C8: false, C9: false, C10: false,
        C11: false, C12: false, C13: false, C14: false, C15: false,
        C16: false, C17: false, C18: false, C19: false, C20: false,
        C21: false, C22: false, C23: false, C24: false, C25: false,
        C26: false, C27: false, C28: false, C29: false, C30: false,
        C31: false, C32: false, C33: false, C34: false, C35: false,
        C36: false, C37: false, C38: false, C41: false, C42: false,
        C47: false, C48: false, C49: false, C50: false, C51: false,
        C52: false, C58: false, C59: false, C60: false, C75: false,
        C76: false, C77: false, C80: false, C81: false,
        remainder: false,
        "mult-table-selection": [],
        "correct-ans": 0,
        "total-ans": 0
    };

    let total = pointWeights.base?.values[taskInfoTemp.userClass] ?? 1;
    const skipTasks = ['C47', 'C48', 'userClass'];

    let tempController = {};
    if (type === "controller") {
        if (controller.mode === "math") {
            tempController.mode = 'math';
            tempController.modeChoice1 = controller.modeChoice1;
            tempController.modeChoice2 = controller.modeChoice2;
            if (controller.modeChoice3) {
              tempController.modeChoice3 = "C37";
            } else {
              tempController.modeChoice3 = "C38";
            }
            tempController.modeChoice5 = controller.modeChoice5;
            tempController.modeChoice6 = controller.modeChoice6;
            tempController.modeChoice7 = controller.modeChoice7
            tempController.selectedNumbers = controller.selectedNumbers;
            tempController.withRemainder = controller.withRemainder;
            tempController.modeChoice8 = controller.modeChoice8;
        } else if (controller.mode === "lang") {
            tempController.mode = 'lang';
            if (controller.modeChoice1 === "C49") {
                tempController.modeChoice1 = controller.modeChoice1;
                tempController.modeChoice2 = controller.modeChoice2;
                tempController.modeChoice6 = controller.modeChoice6;
                tempController.classChoice = controller.classChoice;
                tempController.modeChoiceLtDifficulty = controller.modeChoiceLtDifficulty;
            } else if (controller.modeChoice1 === "C83") {
                if (controller.modeChoice2 === "C50") {
                    tempController.classChoice = controller.classChoice;
                    tempController.modeChoice1 = controller.modeChoice1;
                    tempController.modeChoice2 = controller.modeChoice2;
                    tempController.modeChoice3 = controller.modeChoice3;
                    tempController.modeChoice5 = controller.modeChoice5;
                    tempController.questionFrequency = controller.questionFrequency;
                }
            }
        }

        for (let key in tempController) {
            const val = tempController[key];
            if (taskInfoTemp.hasOwnProperty(val)) taskInfoTemp[val] = true;
        }

        if (controller.withRemainder) taskInfoTemp.remainder = true;
        if (controller.modeChoice2 === "C18") taskInfoTemp["mult-table-selection"] = controller.selectedNumbers || [];

        if (controller.mode === "lang") {
            taskInfoTemp.C47 = false;
            taskInfoTemp.C48 = false;
            taskInfoTemp.remainder = false;
        } else if (controller.mode === "math") {
            ["C49","C50","C51","C52","C58","C59","C60","C75","C76","C80","C81"].forEach(k => taskInfoTemp[k] = false);
        }

        Object.keys(taskInfoTemp).forEach(task => {
            if (!taskInfoTemp[task] || skipTasks.includes(task)) return;
            let weight = getTaskWeight(task);
            if (task === 'C18') weight *= getC18Weight(taskInfoTemp['mult-table-selection']);
            total *= weight;
        });
        total *= overrideOf(taskInfoTemp);

        return Number(total.toFixed(2));

      } else if (type === "selectedTexts") {
          let taskInfoArray = [];
          let selectedTextIDs = [];
          let mistakesMap = new Map();
          controller.correctAnswersTracker = 0

          // Handle both call styles
          if (Array.isArray(selectedTextInfo.taskSettings[0])) {
              // Nested array style: [taskSettingsArray, textIDs]
              taskInfoArray = selectedTextInfo.taskSettings[0];
              selectedTextIDs = selectedTextInfo.taskSettings[1] ?? [];
              selectedTextIDs.forEach(id => mistakesMap.set(id, 0));
          } else {
              // Flat taskSettings
              taskInfoArray = selectedTextInfo.taskSettings;
              if (selectedTextInfo.textMistakes?.length > 0) {
                  // Use provided mistakes
                  selectedTextIDs = selectedTextInfo.textMistakes.map(([id]) => id);
                  mistakesMap = new Map(selectedTextInfo.textMistakes);
              } else if (selectedTextInfo.textIDs?.length > 0) {
                  // Only IDs provided, assume 0 mistakes
                  selectedTextIDs = selectedTextInfo.textIDs;
                  selectedTextIDs.forEach(id => mistakesMap.set(id, 0));
              }
          }

          const textCompType = taskInfoArray[2];

          const response = await fetch("../databases/sudedu_duomenu_baze.json");
          const textDatabase = await response.json();

          const textInfoList = buildList(textDatabase, selectedTextIDs, textCompType);

          let customTextsTotal = 0;

          for (const info of textInfoList) {
              const classCode = info[0];
              const difficulty = info[1];
              const textId = info[2];

              let perTextTotal = pointWeights.base?.values[taskInfoTemp.userClass] ?? 1;

              // Reset boolean tasks
              Object.keys(taskInfoTemp).forEach(key => {
                  if (typeof taskInfoTemp[key] === "boolean") taskInfoTemp[key] = false;
              });

              taskInfoTemp["mult-table-selection"] = [];

              // Prepare controller object
              let tempController = {};
              tempController.modeChoice1 = taskInfoArray[1];
              tempController.modeChoice2 = taskInfoArray[2];
              tempController.modeChoice6 = taskInfoArray[3];
              tempController.classChoice = classCode;
              tempController.modeChoiceLtDifficulty = difficulty;

              for (let key in tempController) {
                  const val = tempController[key];
                  if (taskInfoTemp.hasOwnProperty(val)) taskInfoTemp[val] = true;
              }

              // Clean up language tasks
              taskInfoTemp.C47 = false;
              taskInfoTemp.C48 = false;
              taskInfoTemp.remainder = false;

              Object.keys(taskInfoTemp).forEach(task => {
                  if (!taskInfoTemp[task] || skipTasks.includes(task)) return;
                  const weight = getTaskWeight(task);
                  perTextTotal *= weight;
              });
              perTextTotal *= overrideOf(taskInfoTemp);

              const mistakes = mistakesMap.get(textId) ?? 0;

              let multiplier;

              if (difficulty === "C58") {
                multiplier =
                  mistakes === 0 ? 1 :
                  mistakes === 1 ? 0.5 : 0
              } else if (difficulty === "C59") {
                multiplier =
                  mistakes === 0 ? 1 :
                  mistakes === 1 ? 0.5 :
                  mistakes === 2 ? 0.25 : 0
              } else if (difficulty === "C60") {
                multiplier =
                  mistakes === 0 ? 1 :
                  mistakes === 1 ? 0.5 :
                  mistakes === 2 ? 0.25 :
                  mistakes === 3 ? 0.1 : 0;
              }

              controller.correctAnswersTracker += multiplier

              customTextsTotal += perTextTotal * multiplier;
          }

          const perCorrectAnserPointAverage = customTextsTotal / controller.correctAnswersTracker

          return [Number(customTextsTotal.toFixed(2)), Number(perCorrectAnserPointAverage.toFixed(2))];
      } else {
        const parsedCurrentTaskInstructions = type;
        let tempController = {};

        if (parsedCurrentTaskInstructions[0] === "math") {
            tempController.mode = 'math';
            tempController.modeChoice1 = parsedCurrentTaskInstructions[1];
            tempController.modeChoice2 = parsedCurrentTaskInstructions[2];
            tempController.modeChoice3 = parsedCurrentTaskInstructions[3];
            tempController.modeChoice5 = parsedCurrentTaskInstructions[4];
            tempController.modeChoice6 = parsedCurrentTaskInstructions[5];
            tempController.modeChoice7 = parsedCurrentTaskInstructions[6];
            tempController.selectedNumbers = parsedCurrentTaskInstructions[7];
            tempController.withRemainder = parsedCurrentTaskInstructions[8];
            tempController.modeChoice8 = parsedCurrentTaskInstructions[9];
        } else if (parsedCurrentTaskInstructions[0] === "lang") {
            tempController.mode = 'lang';
            if (parsedCurrentTaskInstructions[1] === "C49") {
                tempController.modeChoice1 = parsedCurrentTaskInstructions[1];
                tempController.modeChoice2 = parsedCurrentTaskInstructions[2];
                tempController.modeChoice6 = parsedCurrentTaskInstructions[3];
                tempController.classChoice = parsedCurrentTaskInstructions[5];
                tempController.modeChoiceLtDifficulty = parsedCurrentTaskInstructions[6];
            } else if (parsedCurrentTaskInstructions[1] === "C83") {
                if (parsedCurrentTaskInstructions[2] === "C50") {
                    tempController.classChoice = parsedCurrentTaskInstructions[1];
                    tempController.modeChoice1 = parsedCurrentTaskInstructions[2];
                    tempController.modeChoice2 = parsedCurrentTaskInstructions[3];
                    tempController.modeChoice3 = parsedCurrentTaskInstructions[4];
                    tempController.modeChoice5 = parsedCurrentTaskInstructions[5];
                    tempController.questionFrequency = parsedCurrentTaskInstructions[6];
                }
            }
        }

        for (let key in tempController) {
            const val = tempController[key];
            if (taskInfoTemp.hasOwnProperty(val)) taskInfoTemp[val] = true;
        }

        if (tempController.withRemainder) taskInfoTemp.remainder = true;
        if (tempController.modeChoice2 === "C18") taskInfoTemp["mult-table-selection"] = tempController.selectedNumbers || [];

        if (tempController.mode === "lang") {
            taskInfoTemp.C47 = false;
            taskInfoTemp.C48 = false;
            taskInfoTemp.remainder = false;
            taskInfoTemp["mult-table-selection"] = false;
        } else if (tempController.mode === "math") {
            ["C49","C50","C51","C52","C58","C59","C60","C75","C76","C80","C81"].forEach(k => taskInfoTemp[k] = false);
        }

        Object.keys(taskInfoTemp).forEach(task => {
            if (!taskInfoTemp[task] || skipTasks.includes(task)) return;
            let weight = getTaskWeight(task);
            if (task === 'C18') weight *= getC18Weight(taskInfoTemp['mult-table-selection']);
            total *= weight;
        });
        total *= overrideOf(taskInfoTemp);

        return Number(total.toFixed(2));
    }

    function buildList(textDatabase, textIds, textCompType) {
      const result = [];

        for (const id of textIds) {
            const entry = textDatabase[id.toString()]; // <-- direct lookup

            if (!entry) continue;

            const classes = entry["class"] ?? [];
            let classCode = null;
            const has12 = classes.includes("C75");
            const has34 = classes.includes("C76");
            if (has12 && !has34) classCode = "C75";
            else if (has34 || (has12 && has34)) classCode = "C76";

            let complexityCode = null;
            if (textCompType === "C51") complexityCode = entry["SF"]?.C51 ?? null;
            else if (textCompType === "C52") complexityCode = entry["SF"]?.C52 ?? null;

            // Validate it's a known difficulty level
            if (!["C58", "C59", "C60"].includes(complexityCode)) continue;

            result.push([classCode, complexityCode, id]);
        }

        return result;
    }
}


async function displayCustomTaskPotentialEarnings() {
    const coinAmountEl = document.querySelector(".custom-coin-amount");
    const coinAmountValueEl = coinAmountEl?.querySelector(".coin-amount");
    const earningsHolder = document.querySelector(".custom-earnings-iki-holder");

    // Helper to attach click/touch listener safely
    const attachCoinPopup = (messageKey) => {
        if (!coinAmountEl) return;

        // Make element interactive on touch devices
        coinAmountEl.style.cursor = "pointer";
        coinAmountEl.setAttribute("tabindex", "0");

        // Remove any old listeners by cloning
        const newEl = coinAmountEl.cloneNode(true);
        coinAmountEl.replaceWith(newEl);

        const handleClick = () => {
            const info = infoMessages[messageKey];
            if (!info) return;
            openObjectPopup(info.content, info.title, info.subtitle);
        };

        newEl.addEventListener("click", handleClick);
        newEl.addEventListener("touchend", handleClick);
    };

    if (controller.modeChoice4 === "C39" || controller.modeChoice1 === "C83") {
        if (earningsHolder) earningsHolder.innerHTML = 'x';
        if (coinAmountValueEl) {
            coinAmountValueEl.innerHTML = await calculateTasksPerCorrectAnswerPoints("controller");
        }

        attachCoinPopup('coin-amount-custom-timer');

    } else if (controller.modeChoice4 === "C40") {
        if (earningsHolder) earningsHolder.innerHTML = 'IKI';

        let potentialEarnings = await calculateTasksPerCorrectAnswerPoints("controller");
  
        const questionNumber = parseInt(questionNumberInputElement.value) || 1;

        if (potentialEarnings != null && coinAmountValueEl) {
            coinAmountValueEl.innerHTML = Number((potentialEarnings * questionNumber).toFixed(2));
        }

        attachCoinPopup('coin-amount-custom-question-number');
    }
}


// POINTS CALCULATION END
function initScrollIndicators() {
    const containers = document.querySelectorAll('.scroll-indicators');
   
    containers.forEach(function(container) {
        if (container.dataset.scrollInit) return;
        container.dataset.scrollInit = 'true';
       
        const parent = container.parentElement;
        if (!parent) return;
       
        const computedStyle = window.getComputedStyle(parent);
        if (computedStyle.position === 'static') {
            parent.style.position = 'relative';
        }
       
        // Create line indicators
        const topIndicator = document.createElement('div');
        topIndicator.className = 'scroll-indicator-line top';
        
        const bottomIndicator = document.createElement('div');
        bottomIndicator.className = 'scroll-indicator-line bottom';
        
        // Create three horizontal lines for top indicator (pointing up - inverted triangle)
        const topLine1 = document.createElement('div');
        topLine1.className = 'indicator-line line-short';
        topLine1.style.animationDelay = '0s';
        
        const topLine2 = document.createElement('div');
        topLine2.className = 'indicator-line line-medium';
        topLine2.style.animationDelay = '0.15s';
        
        const topLine3 = document.createElement('div');
        topLine3.className = 'indicator-line line-long';
        topLine3.style.animationDelay = '0.3s';
        
        topIndicator.appendChild(topLine1);
        topIndicator.appendChild(topLine2);
        topIndicator.appendChild(topLine3);
        
        // Create three horizontal lines for bottom indicator (pointing down)
        const bottomLine1 = document.createElement('div');
        bottomLine1.className = 'indicator-line line-long';
        bottomLine1.style.animationDelay = '0s';
        
        const bottomLine2 = document.createElement('div');
        bottomLine2.className = 'indicator-line line-medium';
        bottomLine2.style.animationDelay = '0.15s';
        
        const bottomLine3 = document.createElement('div');
        bottomLine3.className = 'indicator-line line-short';
        bottomLine3.style.animationDelay = '0.3s';
        
        bottomIndicator.appendChild(bottomLine1);
        bottomIndicator.appendChild(bottomLine2);
        bottomIndicator.appendChild(bottomLine3);
       
        parent.appendChild(topIndicator);
        parent.appendChild(bottomIndicator);
       
        function updateIndicators() {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const canScroll = scrollHeight > clientHeight;
           
            if (!canScroll) {
                topIndicator.classList.remove('visible');
                bottomIndicator.classList.remove('visible');
                return;
            }
           
            const isAtTop = scrollTop <= 5;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
           
            topIndicator.classList.toggle('visible', !isAtTop);
            bottomIndicator.classList.toggle('visible', !isAtBottom);
        }
       
        container.addEventListener('scroll', updateIndicatorsWithDelays);
        window.addEventListener('resize', updateIndicatorsWithDelays);
        window.addEventListener('click', updateIndicatorsWithDelays);
        window.addEventListener('touchend', updateIndicatorsWithDelays);
       
        const observer = new MutationObserver(updateIndicators);
        observer.observe(container, { childList: true, subtree: true });
       
        function updateIndicatorsWithDelays () {
          // Multiple checks to ensure reliable initialization
          setTimeout(updateIndicators, 100);
          setTimeout(updateIndicators, 300);
          setTimeout(updateIndicators, 500);
        }

        updateIndicatorsWithDelays();
        
        // Also check when images/content loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateIndicators);
        }
        window.addEventListener('load', updateIndicators);
    });
}

// Initialize existing containers
initScrollIndicators();

// Watch for dynamically added containers
const bodyObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
                // Check if the added node itself has the class
                if (node.classList && node.classList.contains('scroll-indicators')) {
                    initScrollIndicators();
                }
                // Check if any descendants have the class
                if (node.querySelectorAll) {
                    const newContainers = node.querySelectorAll('.scroll-indicators');
                    if (newContainers.length > 0) {
                        initScrollIndicators();
                    }
                }
            }
        });
    });
});

// Start observing the document body for changes
bodyObserver.observe(document.body, {
    childList: true,
    subtree: true
});

function initHorizontalScrollIndicators() {
    const containers = document.querySelectorAll('.scroll-indicators-horizontal');
   
    containers.forEach(function(container) {
        if (container.dataset.scrollInitHorizontal) return;
        container.dataset.scrollInitHorizontal = 'true';
       
        const parent = container.parentElement;
        if (!parent) return;
       
        const computedStyle = window.getComputedStyle(parent);
        if (computedStyle.position === 'static') {
            parent.style.position = 'relative';
        }
       
        // Create left and right indicators
        const leftIndicator = document.createElement('div');
        leftIndicator.className = 'scroll-indicator-line-horizontal top';
        
        const rightIndicator = document.createElement('div');
        rightIndicator.className = 'scroll-indicator-line-horizontal bottom';
        
        // === Left indicator (pointing left - inverted triangle) ===
        const leftLine1 = document.createElement('div');
        leftLine1.className = 'indicator-line-horizontal line-short';
        leftLine1.style.animationDelay = '0s';
        
        const leftLine2 = document.createElement('div');
        leftLine2.className = 'indicator-line-horizontal line-medium';
        leftLine2.style.animationDelay = '0.15s';
        
        const leftLine3 = document.createElement('div');
        leftLine3.className = 'indicator-line-horizontal line-long';
        leftLine3.style.animationDelay = '0.3s';
        
        leftIndicator.appendChild(leftLine1);
        leftIndicator.appendChild(leftLine2);
        leftIndicator.appendChild(leftLine3);
        
        // === Right indicator (pointing right) ===
        const rightLine1 = document.createElement('div');
        rightLine1.className = 'indicator-line-horizontal line-long';
        rightLine1.style.animationDelay = '0s';
        
        const rightLine2 = document.createElement('div');
        rightLine2.className = 'indicator-line-horizontal line-medium';
        rightLine2.style.animationDelay = '0.15s';
        
        const rightLine3 = document.createElement('div');
        rightLine3.className = 'indicator-line-horizontal line-short';
        rightLine3.style.animationDelay = '0.3s';
        
        rightIndicator.appendChild(rightLine1);
        rightIndicator.appendChild(rightLine2);
        rightIndicator.appendChild(rightLine3);
       
        parent.appendChild(leftIndicator);
        parent.appendChild(rightIndicator);
       
        function updateIndicators() {
            const scrollLeft = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            const canScroll = scrollWidth > clientWidth;
           
            if (!canScroll) {
                leftIndicator.classList.remove('visible');
                rightIndicator.classList.remove('visible');
                return;
            }
           
            const isAtLeft = scrollLeft <= 5;
            const isAtRight = scrollLeft + clientWidth >= scrollWidth - 5;
           
            leftIndicator.classList.toggle('visible', !isAtLeft);
            rightIndicator.classList.toggle('visible', !isAtRight);
        }
       
        function updateIndicatorsWithDelays() {
            setTimeout(updateIndicators, 100);
            setTimeout(updateIndicators, 300);
            setTimeout(updateIndicators, 500);
        }
       
        container.addEventListener('scroll', updateIndicatorsWithDelays);
        window.addEventListener('resize', updateIndicatorsWithDelays);
        window.addEventListener('click', updateIndicatorsWithDelays);
        window.addEventListener('touchend', updateIndicatorsWithDelays);
       
        const observer = new MutationObserver(updateIndicators);
        observer.observe(container, { childList: true, subtree: true });
       
        updateIndicatorsWithDelays();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateIndicators);
        }
        window.addEventListener('load', updateIndicators);
    });
}

// Initialize existing containers
initHorizontalScrollIndicators();

// Watch for dynamically added containers
const bodyObserverHorizontal = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
                if (node.classList && node.classList.contains('scroll-indicators-horizontal')) {
                    initHorizontalScrollIndicators();
                }
                if (node.querySelectorAll) {
                    const newContainers = node.querySelectorAll('.scroll-indicators-horizontal');
                    if (newContainers.length > 0) {
                        initHorizontalScrollIndicators();
                    }
                }
            }
        });
    });
});

bodyObserverHorizontal.observe(document.body, {
    childList: true,
    subtree: true
});


async function renderPetOnWalk () {
  if (typeof userData === "undefined" || !userData) return;
  if (!userData.petOnWalk || userData.petOnWalk === "") return;

  function petOnWalkIsHappy () {
    const petStatsData =
      typeof userData.petStats === "string"
        ? JSON.parse(userData.petStats)
        : userData.petStats;
    const [recordedFoodAmount, recordedWaterAmount, recordedLoveAmount, recordedTime] = petStatsData
    const currentTime = Math.floor(Date.now() / 1000 / 60);
    const timeElapsed = currentTime - recordedTime;
    const statDecrease = Math.floor(timeElapsed * PET_STATS_EXPIRATION);

    const foodAmount = Math.max(0, recordedFoodAmount - statDecrease);
    const waterAmount = Math.max(0, recordedWaterAmount - statDecrease);
    const loveAmount = Math.max(0, recordedLoveAmount - statDecrease);

    const happinesIndex = Math.round(((foodAmount + waterAmount + loveAmount) / 30) * 100) / 100;

    if (foodAmount === 0 || waterAmount === 0) {
        return false
    } else if (happinesIndex < 0.35) {
        return false
    } else {
        return true
    }
  }

  if (petOnWalkIsHappy()) {
    const petOnWalkDiv = document.querySelector("#pet-on-walk")
    petOnWalkDiv.classList.add(userData.petOnWalk)
    petOnWalkDiv._petType = userData.petOnWalk.split('-').slice(0, 2).join('-');
    petOnWalkDiv._hasJumpedOn = false; // Track if pet has jumped on platform
    const randomPosition = await getRandomLeft();
    petOnWalkDiv.style.left = `${randomPosition}px`
    const petEl = document.querySelector("#pet-on-walk");
    if (!petEl || !petEl._petType) return;
    setObjectAnimation(petEl, `${petEl._petType}-hidden`);

    // Start walking once the DOM is ready
    setTimeout(() => {
      walkToRandomPosition();
    }, 1000);
  }
}

async function initPetOnWalk() {
  // Wait for window to fully load
  if (document.readyState !== 'complete') {
    await new Promise(resolve => {
      window.addEventListener('load', resolve);
    });
  }
  
  // Wait for userData to be defined (if it loads asynchronously)
  let attempts = 0;
  while (typeof userData === "undefined" && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  // Now render
  renderPetOnWalk();
}

function getRandomLeft() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const petEl = document.querySelector("#pet-on-walk");
      const parentEl = document.querySelector(".pet-on-walk-holder");
      
      if (!petEl || !parentEl) {
        resolve(0);
        return;
      }

      // Use computed style width - the ACTUAL rendered width
      const parentComputedStyle = getComputedStyle(parentEl);
      const parentWidth = parseFloat(parentComputedStyle.width);
      
      const petWidth = petEl.offsetWidth;
      
      const maxLeft = Math.max(0, parentWidth - petWidth);
      const randomLeft = Math.random() * maxLeft;
      
      resolve(randomLeft);
    }, 200); // 200ms delay to let flex fully compute
  });
}

// ============================================================================
// PET ON WALK - ANIMATION SYSTEM
// ============================================================================

// Configuration Dictionary
const petOnWalkActionDict = {
  // Actions during active questions (looping animations)
  questionActive: [
    { action: "sits-idle", transitionBefore: null, transitionAfter: null },
    { action: "lays-idle", transitionBefore: null, transitionAfter: null },
    { action: "licks-paw", transitionBefore: null, transitionAfter: null },
    { 
      action: "sleeps", 
      transitionBefore: { 
        animation: "stands-idle", duration: 1000,
        animation: "lays-idle", duration: 3000 
      }, // 2 full loops before sleeping
      transitionAfter: [
        { animation: "lays-idle", duration: 500 },   // 1 loop - waking up
        { animation: "surprised", duration: null, chance: 0.5 }     // 50% chance surprised reaction (play once)
      ]
    }
  ],
  
  // Actions after questions completed (celebration animations)
  questionsStopped: [
    { action: "claps", transitionBefore: null, transitionAfter: null }
  ],
  
  // Timing settings (in milliseconds)
  timing: {
    actionInterval: { min: 60000, max: 180000 },      // 1-3 minutes between actions
    celebrationDelay: { min: 15000, max: 45000 }      // 15-45 seconds before walking after celebration
  }
};

// State tracking
let petOnWalkAction = null;
let currentPetAction = null;
let currentPetState = null; // Track actual state: 'transition-before' | 'main-action' | 'transition-after'
let ongoingTransition = null; // Store abort controller for transitions

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Play a single animation once and wait for completion
 */
async function playAnimationOnce(petEl, animationName, abortSignal) {
  if (!petEl || !petEl._petType) return;

  const animKey = `${petEl._petType}-${animationName}`;
  const animData = animationStepsAndDurationNumberDict[animKey];
  
  if (!animData) {
    console.error('Animation data not found for:', animKey);
    return;
  }
  
  petEl.style.animation = 'none';
  void petEl.offsetHeight;
  
  setObjectAnimation(petEl, animKey, 1);
  
  const animationDuration = animData[1] * 1000;
  
  await new Promise((resolve, reject) => {
    let resolved = false;
    
    // Handle abort
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        if (!resolved) {
          resolved = true;
          petEl.removeEventListener("animationend", onAnimationEnd);
          reject(new Error('Animation aborted'));
        }
      });
    }
    
    const calculatedTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        petEl.removeEventListener("animationend", onAnimationEnd);
        resolve();
      }
    }, animationDuration + 100);
    
    function onAnimationEnd(e) {
      if (e.animationName.includes(animationName) && !resolved) {
        resolved = true;
        clearTimeout(calculatedTimeout);
        petEl.removeEventListener("animationend", onAnimationEnd);
        resolve();
      }
    }
    petEl.addEventListener("animationend", onAnimationEnd);
  });
}

/**
 * Play a transition animation for a specified duration
 * If duration is null, plays animation once and waits for completion
 */
async function playTransitionAnimation(petEl, animationName, duration, abortSignal) {
  if (!petEl || !petEl._petType) return;
  const animKey = `${petEl._petType}-${animationName}`;
  
  if (duration === null) {
    // Play once and wait for completion
    await playAnimationOnce(petEl, animationName, abortSignal);
  } else {
    // Loop for specified duration
    petEl.style.animation = 'none';
    void petEl.offsetHeight;
    setObjectAnimation(petEl, animKey);
    
    await new Promise((resolve, reject) => {
      // Handle abort
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          reject(new Error('Transition aborted'));
        });
      }
      
      setTimeout(resolve, duration);
    });
  }
}

/**
 * Get random position for pet to walk to
 */
function getRandomLeft() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const petEl = document.querySelector("#pet-on-walk");
      const parentEl = document.querySelector(".pet-on-walk-holder");
      
      if (!petEl || !parentEl) {
        resolve(0);
        return;
      }

      const parentComputedStyle = getComputedStyle(parentEl);
      const parentWidth = parseFloat(parentComputedStyle.width);
      const petWidth = petEl.offsetWidth;
      const maxLeft = Math.max(0, parentWidth - petWidth);
      const randomLeft = Math.random() * maxLeft;
      
      resolve(randomLeft);
    }, 200);
  });
}

// ============================================================================
// MAIN ANIMATION FUNCTIONS
// ============================================================================

/**
 * Start a random pet action during active questions
 */
async function startRandomPetOnWalkAction() {
  const petEl = document.querySelector("#pet-on-walk");
  if (!petEl || !petEl._petType) return;
  
  // Create abort controller for this animation sequence
  const abortController = new AbortController();
  ongoingTransition = abortController;
  
  try {
    // Pick random action from questionActive list
    const actionConfig = petOnWalkActionDict.questionActive[
      Math.floor(Math.random() * petOnWalkActionDict.questionActive.length)
    ];
    
    currentPetAction = actionConfig.action;
    
    // Play transition animation before main action (if defined)
    if (actionConfig.transitionBefore) {
      currentPetState = 'transition-before';
      await playTransitionAnimation(
        petEl, 
        actionConfig.transitionBefore.animation, 
        actionConfig.transitionBefore.duration,
        abortController.signal
      );
    }
    
    // Start main looping animation
    currentPetState = 'main-action';
    setObjectAnimation(petEl, `${petEl._petType}-${actionConfig.action}`);
    
    // Clear abort controller since transitions are done
    ongoingTransition = null;
    
    // Schedule next random action
    const delay = petOnWalkActionDict.timing.actionInterval.min + 
                  Math.random() * (petOnWalkActionDict.timing.actionInterval.max - 
                                   petOnWalkActionDict.timing.actionInterval.min);
    petOnWalkAction = setTimeout(startRandomPetOnWalkAction, delay);
  } catch (error) {
    if (error.message === 'Animation aborted' || error.message === 'Transition aborted') {
      ongoingTransition = null;
    } else {
      throw error;
    }
  }
}

/**
 * Trigger celebration action after questions are completed
 */
async function setPetOnWalkActionAfterQuestionsCompleted() {
  const petEl = document.querySelector("#pet-on-walk");
  if (!petEl || !petEl._petType) return;
  
  // Cancel any scheduled random action
  if (petOnWalkAction) {
    clearTimeout(petOnWalkAction);
    petOnWalkAction = null;
  }
  
  // Abort any ongoing transitions
  if (ongoingTransition) {
    ongoingTransition.abort();
    ongoingTransition = null;
  }
  
  // Determine what transition to play based on current state
  const currentActionConfig = petOnWalkActionDict.questionActive.find(
    config => config.action === currentPetAction
  );
  
  // Handle wake-up/transition based on what the pet is currently doing
  if (currentActionConfig && currentActionConfig.transitionAfter) {
    // Handle single transition or array of transitions
    const transitions = Array.isArray(currentActionConfig.transitionAfter) 
      ? currentActionConfig.transitionAfter 
      : [currentActionConfig.transitionAfter];
    
    // Play each transition in sequence (respecting chance if defined)
    for (const transition of transitions) {
      // Check if this transition has a chance requirement
      if (transition.chance !== undefined) {
        // Roll the dice
        if (Math.random() < transition.chance) {
          await playTransitionAnimation(
            petEl,
            transition.animation,
            transition.duration
          );
        }
      } else {
        // Always play if no chance is defined
        await playTransitionAnimation(
          petEl,
          transition.animation,
          transition.duration
        );
      }
    }
  }

  // Pick a random celebration action
  const celebrationConfig = petOnWalkActionDict.questionsStopped[
    Math.floor(Math.random() * petOnWalkActionDict.questionsStopped.length)
  ];
  
  currentPetAction = celebrationConfig.action;
  currentPetState = 'main-action';
  
  // Play transition before celebration (if defined)
  if (celebrationConfig.transitionBefore) {
    await playTransitionAnimation(
      petEl,
      celebrationConfig.transitionBefore.animation,
      celebrationConfig.transitionBefore.duration
    );
  }

  // Start celebration animation
  setObjectAnimation(petEl, `${petEl._petType}-${celebrationConfig.action}`);
  
  // Schedule return to walking after celebration
  const delay = petOnWalkActionDict.timing.celebrationDelay.min +
                Math.random() * (petOnWalkActionDict.timing.celebrationDelay.max -
                                 petOnWalkActionDict.timing.celebrationDelay.min);
  petOnWalkAction = setTimeout(walkToRandomPosition, delay);
}

/**
 * Restart pet actions (cancel current and trigger new walk)
 */
function restartPetOnWalkActions() {
  if (petOnWalkAction) {
    clearTimeout(petOnWalkAction);
    petOnWalkAction = null;
  }
  
  // Abort any ongoing transitions
  if (ongoingTransition) {
    ongoingTransition.abort();
    ongoingTransition = null;
  }

  walkToRandomPosition();
}

/**
 * Main walk function - handles jumping on platform and walking
 */
async function walkToRandomPosition() {
  const petEl = document.querySelector("#pet-on-walk");

  if (!petEl || !petEl._petType) return;
  
  const newLeft = await getRandomLeft();
  const currentLeft = petEl.offsetLeft;
  const delta = newLeft - currentLeft;

  // ===== FIRST APPEARANCE: JUMP ON PLATFORM =====
  if (!petEl._hasJumpedOn) {
    // Flip sprite based on direction
    if (delta < 0) {
      petEl.classList.remove("pet-right");
      petEl.classList.add("pet-left");
    } else {
      petEl.classList.remove("pet-left");
      petEl.classList.add("pet-right");
    }
    
    // Play jump animation
    petEl.style.animation = 'none';
    void petEl.offsetHeight;
    
    setObjectAnimation(petEl, `${petEl._petType}-jumps-on-platform`, 1);
    
    const animKey = `${petEl._petType}-jumps-on-platform`;
    const animData = animationStepsAndDurationNumberDict[animKey];
    
    if (!animData) {
      console.error('Animation data not found for:', animKey);
      petEl._hasJumpedOn = true;
    } else {
      const animationDuration = animData[1] * 1000;
      
      await new Promise(resolve => {
        let resolved = false;
        
        const calculatedTimeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            petEl.removeEventListener("animationend", onAnimationEnd);
            resolve();
          }
        }, animationDuration + 100);
        
        function onAnimationEnd(e) {
          if (e.animationName.includes('jumps-on-platform') && !resolved) {
            resolved = true;
            clearTimeout(calculatedTimeout);
            petEl.removeEventListener("animationend", onAnimationEnd);
            resolve();
          }
        }
        petEl.addEventListener("animationend", onAnimationEnd);
      });
      
      petEl._hasJumpedOn = true;
    }
  }
  
  // ===== SUBSEQUENT MOVEMENTS: WALK IF ENOUGH SPACE =====
  if (Math.abs(delta) > 50) {
    // Flip sprite based on direction
    if (delta < 0) {
      petEl.classList.remove("pet-right");
      petEl.classList.add("pet-left");
    } else {
      petEl.classList.remove("pet-left");
      petEl.classList.add("pet-right");
    }
    
    // Start walking animation
    petEl.style.animation = 'none';
    void petEl.offsetHeight;
    
    setObjectAnimation(petEl, `${petEl._petType}-walks-sideways`);

    // Calculate walk duration based on distance
    const speed = 0.1; // pixels per ms
    const distance = Math.abs(newLeft - currentLeft);
    const duration = distance / speed;
    
    petEl.style.transition = `left ${duration}ms linear`;
    petEl.style.left = `${newLeft}px`;

    // Wait for walk to complete
    await new Promise(resolve => {
      let resolved = false;
      
      const calculatedTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          petEl.removeEventListener("transitionend", onTransitionEnd);
          resolve();
        }
      }, duration + 500);
      
      function onTransitionEnd(e) {
        if (e.propertyName === "left" && !resolved) {
          resolved = true;
          clearTimeout(calculatedTimeout);
          petEl.removeEventListener("transitionend", onTransitionEnd);
          resolve();
        }
      }
      petEl.addEventListener("transitionend", onTransitionEnd);
    });

    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  startRandomPetOnWalkAction();
}

//Switch animation dynamically with JavaScript
function setObjectAnimation(object, animationName, iterations = 'infinite') {
  object.style.animation = `${animationName} ${animationStepsAndDurationNumberDict[animationName][1]}s steps(${animationStepsAndDurationNumberDict[animationName][0]}) ${iterations}`;
}

function redirectToAppropriateLanguage(targetFolder) {
  if (!targetFolder) return;

  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);

  // Determine current folder (language folder like LT, EN, etc.)
  // If the last part looks like a file (has '.' or no subfolder after it), take the one before it.
  let currentFolder;
  if (parts.length >= 2 && (parts[parts.length - 1].includes('.') || parts[parts.length - 1] !== '')) {
    currentFolder = parts[parts.length - 2]; // e.g. "LT"
  } else {
    currentFolder = parts[parts.length - 1];
  }

  // Detect filename or default to index.html
  let fileName = 'index.html';
  const lastPart = parts[parts.length - 1];
  if (lastPart.includes('.')) {
    fileName = lastPart;
  } else if (lastPart !== targetFolder) {
    fileName = lastPart + '.html'; // for /LT/game → game.html
  }

  if (currentFolder !== targetFolder) {
    const newPath = `/${targetFolder}/${fileName}`;
    // window.location.replace(newPath);
  }
}

// SEED OF RANDOMNESS GENERATION FOR LANGUAGE TASKS

  function generateSessionSeed() {
      const timestamp = Date.now() % 1000000;
      const random = Math.floor(Math.random() * 46656);
      return (timestamp * 46656 + random).toString(36).toUpperCase();
  }
  // a spelling task's seed: marked with the questions' rules version (rasyba-generator.js seedRules) - the task and the
  // results analysis's replay of it follow the same rules; older seeds (no mark) keep the first ones
  function generateGrammarSeed() {
      return 'R2-' + generateSessionSeed();
  }

  /**
   * Parses seed string into numeric seed for RNG
   */
  function parseSeed(seedString) {
      let hash = 0;
      for (let i = 0; i < seedString.length; i++) {
          const char = seedString.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
      }
      return Math.abs(hash) || 1;
  }