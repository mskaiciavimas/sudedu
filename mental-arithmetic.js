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
          if (controller.language === 'LT') {
            messageToTheUser('Užduotis nebaigta iki galo. Rezultatai neišsaugoti.');
          } else if (controller.language === 'EN') {
            messageToTheUser('Task was not completed. Results were not saved.');
          }
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

	while (controller.currentMistakes.length > 29) {
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
      if (controller.language === 'LT') {
        messageToTheUser('Užduotis nebaigta iki galo. Rezultatai neišsaugoti.')
      } else if (controller.language === 'EN') {
        messageToTheUser('Task was not completed. Results were not saved.')
      }
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
        if (controller.language === 'LT') {
          messageToTheUser('Užduotis nebaigta iki galo. Rezultatai neišsaugoti.')
        } else if (controller.language === 'EN') {
          messageToTheUser('Task was not completed. Results were not saved.')
        }
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

  let elapsedTime = 0;
  if (localStorage.getItem("elapsedTime")) {
    elapsedTime = localStorage.getItem("elapsedTime")
  }


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
      resultsData = [ [controller.answeredQuestionTracker, controller.mistakesTracker],
                      controller.currentMistakes, elapsedTime
                    ]

      requestSuccess = await sendTaskResults(controller.task[1], resultsData)
      if (requestSuccess) {
        [requestSuccess, pointsEarned, coinsEarned] = await updateStudentPointsAndStatistics(coinMultiplier=1);
      }

      if (requestSuccess) {
        recordTaskToLongTerm();
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
        const total = list.reduce((sum, [, mistakes]) => {
          let score = 1 - mistakes * 0.25;
          score = Math.max(0, score); // prevent negatives
          return sum + score;
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
          recordTaskToLongTerm();
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
        recordTaskToLongTerm();
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
  const resultsDataString = JSON.stringify(resultsData);

  const taskResults = {
    taskId,
    results: resultsDataString
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

async function updateStudentPointsAndStatistics(coinMultiplier=1) {
  let pointsEarned = 0;
  let coinsEarned = 0;
  let statType = 'c'; // default to consistency

  // Calculate points and coins
  if (controller.modeChoice7 === "C84") {
    pointsEarned = await calculateTasksPerCorrectAnswerPoints(
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

      controller.currentMistakes.forEach(([id, value]) => {
          if (value === 0) IDsOfTextsWithZeroMistakes.push(id);
          else if (value === 1) IDsOfTextsWithOneMistake.push(id);
          else if (value === 2) IDsOfTextsWithTwoMistakes.push(id);
          else if (value === 3) IDsOfTextsWithThreeMistakes.push(id);
      });

      pointsEarned = await calculateTasksPerCorrectAnswerPoints("controller");

      pointsEarned = 
          (IDsOfTextsWithZeroMistakes.length * pointsEarned * 1)
        + (IDsOfTextsWithOneMistake.length * pointsEarned * 0.75)
        + (IDsOfTextsWithTwoMistakes.length * pointsEarned * 0.5)
        + (IDsOfTextsWithThreeMistakes.length * pointsEarned * 0.25);

    } else {
      pointsEarned = await calculateTasksPerCorrectAnswerPoints("controller");
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
          if (i+1 === subAnswerNumber*2) {
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
    while (controller.currentMistakes.length > 29) {
      controller.currentMistakes.splice(0, 1)
    }
    while (controller.totalMistakes.length > 29) {
      controller.totalMistakes.splice(0, 1)
    }

    if (controller.randomSelection[3]) {
      if (controller.randomSelection[3] === "first") {
        controller.currentMistakes.push([[controller.randomSelection[0], controller.randomSelection[1], "F"], controller.randomSelection[2]])
        controller.totalMistakes.push([[controller.randomSelection[0], controller.randomSelection[1], "F"], controller.randomSelection[2]])
      } else if (controller.randomSelection[3] === "second") {
        controller.currentMistakes.push([[controller.randomSelection[0], controller.randomSelection[1], "S"], controller.randomSelection[2]])
        controller.totalMistakes.push([[controller.randomSelection[0], controller.randomSelection[1], "S"], controller.randomSelection[2]])
      }
    } else {
      controller.currentMistakes.push([[controller.randomSelection[0], controller.randomSelection[1]], controller.randomSelection[2]])
      controller.totalMistakes.push([[controller.randomSelection[0], controller.randomSelection[1]], controller.randomSelection[2]])
    }
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

        if ((action === "\u00D7" || action === "+")) {
          if (acc[firstAsIs]) {
            acc[firstAsIs] += 1;
          } else if (acc[swappedOrder]) {
            acc[swappedOrder] += 1;
          } else {
            acc[firstAsIs] = 1;
          }
        } else {
          // For other actions, follow the previous behavior
          const veiksmas = `${firstAsIs}`;
          acc[veiksmas] = (acc[veiksmas] || 0) + 1;
        }
      
        return acc;
      }, {});

      // Convert the data to an array of objects
      const summaryData = Object.entries(performanceData).map(([veiksmas, mistakes]) => ({
          Veiksmai: veiksmas,
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
              <tr>
                  <th>Veiksmai</th>
                  <th>${usePercentage ? 'Suklysta (%)' : 'Suklysta (kartai)'}</th>
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
                            
                            return `<div class="col-12 table-container">
                            <tr>
                                <td>${row["Veiksmai"]}</td>
                                <td>${displayValue}</td>
                                <td>
                                    <div class="bar" style="width: ${barWidth}; background-color: ${barColor};"></div>
                                </td>
                            </tr>
                        `}
                    )
                  .join("")}
          </div>`;
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
                              
                              return `<div class="col-12 table-container">
                              <tr>
                                  <td>${row["Veiksmai"]}</td>
                                  <td>${displayValue}</td>
                                  <td>
                                      <div class="bar" style="width: ${barWidth}; background-color: ${barColor};"></div>
                                  </td>
                              </tr>
                          `}
                      )
                  .join("")}
          </div>`;
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
  const wordOccurrences = grammarMistakes.reduce((acc, [wordParts, wordCategory, usersMistakes, wordId]) => {
    const key = wordParts.join('|');
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
    const decodedWordCategory = parameterDictionary[wordCategory]["decodedParameterText"];
    const [prefix, answer, suffix] = wordParts;

    // Create highlighted word form with all occurrence data
    const highlightedWord = `
      <span class="clickable-word" 
            data-word-parts='${JSON.stringify(wordParts)}'
            data-category="${decodedWordCategory}"
            data-occurrences='${encodeURIComponent(JSON.stringify(occurrences))}'>
        ${prefix}<span class="incorrect-part">${answer}</span>${suffix}
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
    countHeader.textContent = isLT ? 'Suklysta (kartai)' : 'Mistakes';
    
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
            const displayValue = usePercentage ? item.percentage + '%' : item.count;
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
async function showAllSentencesForWord(wordParts, occurrences) {
    // 1. Get the results container
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

    const container = userData.accType === "teacher" ? resultsContainer : resultsContainerForStudents;
    
    if (!container) {
        console.error("Container not found for user type:", userData.accType);
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

        // Prepare user mistakes display
        const wrappedMistakes = Array.isArray(usersMistakes) && Array.isArray(usersMistakes[1])
            ? usersMistakes[1].map(m => `<span class="user-incorrect-answer">${m}</span>`).join(", ")
            : '';

        // Construct marked sentence
        const beforeMatch = originalSentence.substring(0, matchData.index).replace(/\uE000/g, "");
        const afterMatch = originalSentence.substring(matchData.index + matchData[0].length).replace(/\uE000/g, "");

        return `
            <div class="sentence-occurrence">${beforeMatch}<span class="answered-word">${wordParts[0]}<span class="incorrect-part">${wordParts[1]}</span>${wordParts[2]}${wrappedMistakes ? `(${wrappedMistakes})` : ''}</span>${afterMatch}</div>
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
          showAllSentencesForWord(wordParts, occurrences);
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
    // If start time is not in local storage, get the current time and save it
    startTime = new Date().getTime();
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
  
  // If there is no remaining time, set it to the total time
  if (!remainingTime) {
    remainingTime = timerLimit * 1000;
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

	if (localStorage.getItem("remainingTime")) {
	localStorage.removeItem("remainingTime");
	}

	if (localStorage.getItem("elapsedTime")) {
	localStorage.removeItem("elapsedTime");
	}

	if (localStorage.getItem("startTime")) {
	localStorage.removeItem("startTime");
	}
	controller.result = ['', '', '', '', '']
	controller.currentMistakes = [];
	controller.mistakesTracker = 0;
	controller.answeredQuestionTracker = 0;
  controller.correctAnswersTracker = 0;
	controller.equation = '';
	controller.equation2 = '';
	controller.randomSelection = [];
	controller.questionsStopped = false;
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
	if (localStorage.getItem("startTime")) {
	localStorage.removeItem("startTime");
	}
	controller.result = ['', '', '', '', '']
  controller.currentMistakes = [];
  controller.mistakesTracker = 0;
  controller.answeredQuestionTracker = 0;
  controller.correctAnswersTracker = 0;
  controller.equation = '';
	controller.randomSelection = [];
	controller.questionsStopped = false;
	if (controller.mode === "math") {
			generateCombinations();
	}
	if (controller.combinations.length > controller.questionNumber) {
	controller.combinations = controller.combinations.sort(() => 0.5 - Math.random()).slice(0, controller.questionNumber);
	}

	localStorage.setItem('controller', JSON.stringify(controller));
	redirectToQuestions();
}

function getOptionTextFromValues(values, taskDuration, forTeacher = false) {
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

        if (result[0] === "SUDĖTIS" || result[0] === "ATIMTIS" || result[0] === "SUDĖTIS IR ATIMTIS") {
            final_results.push(result[1]);
            final_results.push(result[2]);
            final_results.push(result[3]);
            if (result[4] === "SKAITINĖ LYGYBĖ") {
                final_results.push(result[5]);
            } else if (result[4] === "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU") {
                final_results.push(result[4]);
            }
            final_results.push(result[5]);
            final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
        } else if (result[0] === "DAUGYBA") {
            final_results.push(result[1]);
            if (result[1] === "DAUGYBOS LENTELĖ") {
                final_results.push(`NUO ${result[6][0]} IKI ${result[6][1]}`);
            }
            final_results.push(result[3]);
            if (result[4] === "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU") {
                final_results.push(result[5]);
            }
            final_results.push(result[5]);
            final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
        } else if (result[0] === "DALYBA" || result[0] === "DAUGYBA IR DALYBA") {
            final_results.push(result[1]);
            if (result[1] === "DAUGYBOS LENTELĖ") {
                final_results.push(`NUO ${result[6][0]} IKI ${result[6][1]}`);
            }
            final_results.push(result[7]);
            final_results.push(result[3]);
            if (result[4] === "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU") {
                final_results.push(result[4]);
            }
            final_results.push(result[5]);
            final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
        } else if (result[0] === "ĮVAIRŪS VEIKSMAI") {
            final_results.push(result[1]);
            final_results.push(result[3]);
            if (result[4] === "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU") {
                final_results.push(result[4]);
            }
            final_results.push(result[5]);
            final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
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
            result.push(values[6] === 1 ? "DAŽNESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI" : "RETESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI");
        }

        final_results.push(result[0]);
        final_results.push(result[1]);

        if (result[0] === "TEKSTO SUPRATIMAS") {
            if (values[4] === "C82") {
                if (forTeacher) {
                    result.push(parameterDictionary[values[5]]["decodedParameterText"]);
                    result.push(parameterDictionary[values[6]]["decodedParameterText"]);
                    result.push(parameterDictionary[values[4]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[5]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[6]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[4]]["decodedParameterText"]);
                } else {
                    result.push(parameterDictionary[values[6]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[5]]["decodedParameterText"]);
                    final_results.push(parameterDictionary[values[6]]["decodedParameterText"]);
                }
                final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
            } else if (values[4] === "C84") {
                if (forTeacher) {
                    final_results.push(parameterDictionary[values[4]]["decodedParameterText"]);

                    const outerDiv = document.createElement("div");
                    outerDiv.classList = "selected-text-task-info-for-teachers-list";

                    const htmlItems = taskDuration[1]
                        .map(id => `<span class="selected-text-task-info-for-teachers-item" id="${id}" onclick="openTextBrowser(${id})">ID: ${id}</span>`)
                        .join(", ");

                    outerDiv.innerHTML = htmlItems;
                    final_results.push(outerDiv.outerHTML);
                } else {
                    final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1].length.toString()));
                }
            }
        } else if (result[0] === "GRAMATIKA") {
          final_results.push(result[2]);
          if (result[1] === "RAŠYBA") {
            let outerLiItem = document.createElement('li');
                outerLiItem.textContent = "RAŠYBOS NUSTATYMAI:"; // Add a label for the outer <li>
                let grammarParamsList = document.createElement('ul');
                grammarParamsList.classList.add('grammar-params-list');
                Object.keys(values[4]).forEach(key => {
                    let listItem = document.createElement('li');
                    listItem.innerHTML = parameterDictionary[key]["decodedParameterText"]; // Use innerHTML instead of textContent
                    grammarParamsList.appendChild(listItem);
                });

                outerLiItem.appendChild(grammarParamsList);

                // Store as an HTML string
                result.push(outerLiItem.outerHTML);
                result.push(parameterDictionary[values[5]]["decodedParameterText"])

                if (values[6] === 1) {
                    result.push("DAŽNESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI")
                } else {
                    result.push("RETESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI")
                }
            
            final_results.push(result[3]);
            if (result[2] === "3-4 KLASĖ") {
                if ("C62" in values[4] || "C63" in values[4] || "C65" in values[4]) {
                    final_results.push(result[4]);
                }
            } else {
                final_results.push(result[5]);
            }
            final_results.push(determineQuestionNumberTimeLabelEnding(taskDuration[0], taskDuration[1]));
          }
      }
    }
    
    return final_results;
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
            answerRate: answerRate
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
                    answerRate: answerRate
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
                    answerRate: answerRate
                }];
            }
        }
    }

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
            answerRate: answerRate
        });
    }

    return recordsList;
}

// Cache for task averages - shared across all students for same task combination
const taskAverageCache = new Map();
const retrievedInfoCache = {};

// Frontend function to fetch task stats with caching for multiple tasks
async function fetchTaskStats(studentId, taskInfoList) {
  try {
    // taskInfoList should be an array of taskInfo objects
    // e.g., [taskInfo1, taskInfo2, taskInfo3]
    
    if (!Array.isArray(taskInfoList) || taskInfoList.length === 0) {
      console.error('taskInfoList must be a non-empty array');
      return null;
    }

    // Create a stable cache key by sorting and stringifying the task list
    const sortedTaskList = [...taskInfoList].sort((a, b) => 
      JSON.stringify(a).localeCompare(JSON.stringify(b))
    );
    const cacheKey = JSON.stringify(sortedTaskList);

    // Initialize per-student cache if needed
    retrievedInfoCache[studentId] ??= {};

    // Return fully cached task data if available
    if (retrievedInfoCache[studentId][cacheKey]) {
      console.log('Using fully cached data for student', studentId, 'with', taskInfoList.length, 'tasks');
      return retrievedInfoCache[studentId][cacheKey];
    }

    // Check if averages are already cached for this task combination
    const cachedAverage = taskAverageCache.get(cacheKey);

    // Build URL with task list and optional skipAverages flag
    const taskInfoListString = JSON.stringify(taskInfoList);
    const url = `${apiBase}students/task-stats/${studentId}?taskInfoList=${encodeURIComponent(taskInfoListString)}`
      + (cachedAverage ? `&skipAverages=true` : `&skipAverages=false`);

    // Fetch student data (and possibly averages)
    const response = await apiFetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response || !response.ok) {
      console.error('Failed to fetch task stats');
      return null;
    }

    const data = await response.json();

    // If averages were already cached, apply them to the response
    if (cachedAverage) {
      console.log('Using cached average data for', taskInfoList.length, 'tasks combined');
      data.averageDates = cachedAverage.averageDates;
      data.averageMistakeFrequency = cachedAverage.averageMistakeFrequency;
      data.averageAnswerRate = cachedAverage.averageAnswerRate;
    } else {
      // First fetch - cache the averages for this task combination
      console.log('Caching average data for', taskInfoList.length, 'tasks combined');
      taskAverageCache.set(cacheKey, {
        averageDates: data.averageDates,
        averageMistakeFrequency: data.averageMistakeFrequency,
        averageAnswerRate: data.averageAnswerRate
      });
    }

    // Cache the complete data for this student
    retrievedInfoCache[studentId][cacheKey] = data;

    return data;

  } catch (error) {
    messageToTheUser("Nepavyko pasiekti duomenų. Bandykite vėl vėliau.");
    console.error('Error fetching task stats:', error);
    return null;
  }
}


// Clear cache when needed (e.g., when switching between different task combinations)
function clearTaskAverageCache() {
    taskAverageCache.clear();
    console.log('Cleared all task average cache');
}

function clearStudentTaskCache(studentId) {
    if (retrievedInfoCache[studentId]) {
        delete retrievedInfoCache[studentId];
        console.log('Cleared cache for student', studentId);
    }
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
function openObjectPopup(content, title='', subtitle = '', functionToTrigger=null, saferClosing=false) {
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

let pointWeights;

if (currentSchoolPeriod === "9-10") {
  pointWeights = {"C1":{"label":"sudetis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C10":{"label":"dvizenkliu ir vienazenkliu iki 20","values":[1.5,1.25,0.2,0.0,0.0,0.0]},"C11":{"label":"dvizenkliu ir vienazenkliu iki 100","values":[2.0,1.75,0.75,0.35,0.0,0.0]},"C12":{"label":"dvizenkliu iki 100","values":[2.0,2.0,0.85,0.325,0.25,0.25]},"C13":{"label":"skaiciu iki 1000","values":[2.0,2.0,1.25,0.85,0.5,0.5]},"C14":{"label":"skaiciu iki 10000","values":[2.0,2.0,2.0,1.25,1.15,0.75]},"C15":{"label":"skaiciu iki 1000000","values":[2.0,2.0,2.0,2.0,1.5,1.15]},"C16":{"label":"turinyje gretimi nuliai","values":[2.0,2.0,2.0,1.25,1.25,1.0]},"C17":{"label":"lenteline sudetis ir atimtis iki 20","values":[2.0,1.0,0.3,0.0,0.0,0.0]},"C18":{"label":"daugybos lentele","values":[2.0,2.0,1.0,0.25,0.35,0.25]},"C19":{"label":"dvizenklio is vienazenklio","values":[2.0,2.0,2.0,1.15,0.65,0.5]},"C2":{"label":"atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C20":{"label":"trizenklio is vienazenklio","values":[2.0,2.0,2.0,1.5,0.85,0.75]},"C21":{"label":"keturzenklio is vienazenklio","values":[2.0,2.0,2.0,1.75,1.15,1.0]},"C22":{"label":"daugiazenklio is vienzenklio","values":[2.0,2.0,2.0,1.75,1.25,1.0]},"C23":{"label":"dvizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.5]},"C24":{"label":"trizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.65]},"C25":{"label":"keturzenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C26":{"label":"daugiazenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C27":{"label":"daugiazenkliu","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C28":{"label":"is pilnu lengvesni","values":[2.0,2.0,2.0,1.0,0.35,0.15]},"C29":{"label":"is pilnu sunkesni","values":[2.0,2.0,2.0,1.0,0.5,0.45]},"C3":{"label":"sudetis ir atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C30":{"label":"daugiazenklio is vienazenklio (dalmenyje 0)","values":[2.0,2.0,1.5,1.25,1.25,1.25]},"C31":{"label":"ivairus iki 10","values":[1.25,1.0,0.1,0,0,0]},"C32":{"label":"ivairus iki 20","values":[1.5,1.25,0.2,0,0,0]},"C33":{"label":"ivairus iki 100","values":[2.0,1.75,0.85,0.325,0,0]},"C34":{"label":"ivairus iki 1000","values":[2.0,2.0,1.25,0.85,0.75,0.65]},"C35":{"label":"ivairus iki 10000","values":[2.0,2.0,2.0,1.15,1.25,0.95]},"C36":{"label":"ivairus iki 1000000","values":[2.0,2.0,2.0,2.0,1.25,1.15]},"C37":{"label":"neperzengiant","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C38":{"label":"perzengiant","values":[1.5,1.5,1.5,1.5,1.5,1.5]},"C4":{"label":"daugyba","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C41":{"label":"skaitine","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C42":{"label":"su nezinomuoju","values":[1.25,1.75,1.65,1.25,1.25,1.25]},"C49":{"label":"teksto supratimas","values":[3.0,10.0,7.0,3.0,6.0,6.0]},"C5":{"label":"dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C50":{"label":"rasyba","values":[2.0,6.0,2.0,0.35,0.35,0.25]},"C51":{"label":"turinio komponavimas","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C52":{"label":"strukturos isdestumas","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C58":{"label":"teksto supratimas lengvas","values":[1.0,1.0,0.75,1.15,0.75,0.5]},"C59":{"label":"teksto supratimas vidutinis","values":[1.75,1.75,1.25,2.0,1.25,0.85]},"C6":{"label":"daugyba ir dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C60":{"label":"teksto supratimas sunkus","values":[2.0,2.0,1.75,2.0,1.75,1.25]},"C7":{"label":"ivairius","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C75":{"label":"lietuviu klases 1-2","values":[1.5,1.5,1.0,0.0,0.0,0.0]},"C76":{"label":"lietuviu klases 3-4","values":[2.0,1.75,1.5,1.25,1.0,1.0]},"C77":{"label":"is pilnu simtu","values":[2.0,2.0,1.0,1.0,0.5,0.15]},"C8":{"label":"vienazenkliu iki 10","values":[1.25,1.0,0.1,0.0,0.0,0.0]},"C80":{"label":"be distraktoriaus","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C81":{"label":"su distraktoriumi","values":[1.25,1.25,1.5,1.25,1.25,1.25]},"C9":{"label":"vienazenkliu iki 20","values":[1.5,1.25,0.2,0.0,0.0,0.0]},"DL1":{"label":"daugybos range[1] === 1","values":[1.0,0.5,0.15,0.0,0.0,0.0]},"DL10":{"label":"daugybos range[0] === 10 AND daugybos range[1] ===10","values":[1.25,0.75,0.15,0,0,0]},"DL2":{"label":"daugybos range[1] === 2","values":[2.0,1.0,0.75,0,0,0]},"DLALL":{"label":"daugybos range else","values":[2.0,1.0,1.0,1.0,1.0,1.0]},"base":{"label":"base","values":[0.875,0.1325,0.13,0.475,0.17,0.305]},"remainder":{"label":"su liekana","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"userClass":{"label":"ziniu lygis","values":[0,1,2,3,4,5]}}
} else if (currentSchoolPeriod === "11-12") {
  pointWeights = {"C1":{"label":"sudetis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C10":{"label":"dvizenkliu ir vienazenkliu iki 20","values":[1.5,1.15,0.2,0.0,0.0,0.0]},"C11":{"label":"dvizenkliu ir vienazenkliu iki 100","values":[2.0,1.75,0.65,0.35,0.0,0.0]},"C12":{"label":"dvizenkliu iki 100","values":[2.0,2.0,0.85,0.35,0.25,0.25]},"C13":{"label":"skaiciu iki 1000","values":[2.0,2.0,1.25,0.85,0.5,0.5]},"C14":{"label":"skaiciu iki 10000","values":[2.0,2.0,2.0,1.25,1.15,0.85]},"C15":{"label":"skaiciu iki 1000000","values":[2.0,2.0,2.0,2.0,1.5,1.15]},"C16":{"label":"turinyje gretimi nuliai","values":[2.0,2.0,2.0,1.25,1.15,0.85]},"C17":{"label":"lenteline sudetis ir atimtis iki 20","values":[2.0,1.25,0.3,0.0,0.0,0.0]},"C18":{"label":"daugybos lentele","values":[2.0,2.0,0.75,0.3,0.35,0.25]},"C19":{"label":"dvizenklio is vienazenklio","values":[2.0,2.0,2.0,1.15,0.65,0.5]},"C2":{"label":"atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C20":{"label":"trizenklio is vienazenklio","values":[2.0,2.0,2.0,1.5,0.85,0.75]},"C21":{"label":"keturzenklio is vienazenklio","values":[2.0,2.0,2.0,1.75,1.15,1.0]},"C22":{"label":"daugiazenklio is vienzenklio","values":[2.0,2.0,2.0,1.75,1.25,1.0]},"C23":{"label":"dvizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C24":{"label":"trizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C25":{"label":"keturzenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C26":{"label":"daugiazenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C27":{"label":"daugiazenkliu","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C28":{"label":"is pilnu lengvesni","values":[2.0,2.0,2.0,1.0,0.35,0.15]},"C29":{"label":"is pilnu sunkesni","values":[2.0,2.0,2.0,1.0,0.5,0.25]},"C3":{"label":"sudetis ir atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C30":{"label":"daugiazenklio is vienazenklio (dalmenyje 0)","values":[2.0,2.0,1.5,1.25,1.25,1.25]},"C31":{"label":"ivairus iki 10","values":[1.25,1.0,0.1,0,0,0]},"C32":{"label":"ivairus iki 20","values":[1.5,1.15,0.2,0,0,0]},"C33":{"label":"ivairus iki 100","values":[2.0,1.75,0.65,0.35,0,0]},"C34":{"label":"ivairus iki 1000","values":[2.0,2.0,1.25,0.85,0.5,0.5]},"C35":{"label":"ivairus iki 10000","values":[2.0,2.0,2.0,1.15,1.15,0.85]},"C36":{"label":"ivairus iki 1000000","values":[2.0,2.0,2.0,2.0,1.25,1.15]},"C37":{"label":"neperzengiant","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C38":{"label":"perzengiant","values":[1.5,1.5,1.5,1.5,1.5,1.5]},"C4":{"label":"daugyba","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C41":{"label":"skaitine","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C42":{"label":"su nezinomuoju","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C49":{"label":"teksto supratimas","values":[6.5,9.0,5.0,4.5,6.5,6.0]},"C5":{"label":"dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C50":{"label":"rasyba","values":[4.5,3.0,0.75,0.4,0.35,0.25]},"C51":{"label":"turinio komponavimas","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C52":{"label":"strukturos isdestumas","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C58":{"label":"teksto supratimas lengvas","values":[1.0,1.25,0.75,1.0,0.85,0.5]},"C59":{"label":"teksto supratimas vidutinis","values":[1.75,1.75,1.25,1.5,1.25,0.75]},"C6":{"label":"daugyba ir dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C60":{"label":"teksto supratimas sunkus","values":[2.0,2.0,1.85,1.75,2.0,1.15]},"C7":{"label":"ivairius","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C75":{"label":"lietuviu klases 1-2","values":[1.5,1.25,1.0,0.0,0.0,0.0]},"C76":{"label":"lietuviu klases 3-4","values":[2.0,1.75,1.5,1.0,1.0,1.0]},"C77":{"label":"is pilnu simtu","values":[2.0,2.0,1.0,1.0,0.5,0.15]},"C8":{"label":"vienazenkliu iki 10","values":[1.25,0.65,0.1,0.0,0.0,0.0]},"C80":{"label":"be distraktoriaus","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C81":{"label":"su distraktoriumi","values":[1.25,1.25,1.25,1.2,1.25,1.25]},"C9":{"label":"vienazenkliu iki 20","values":[1.5,1.25,0.2,0.0,0.0,0.0]},"DL1":{"label":"daugybos range[1] === 1","values":[1.0,0.5,0.15,0.0,0.0,0.0]},"DL10":{"label":"daugybos range[0] === 10 AND daugybos range[1] ===10","values":[1.25,0.75,0.15,0,0,0]},"DL2":{"label":"daugybos range[1] === 2","values":[2.0,1.0,0.75,0,0,0]},"DLALL":{"label":"daugybos range else","values":[2.0,1.0,1.0,1.0,1.0,1.0]},"base":{"label":"base","values":[0.425,0.0975,0.1625,0.385,0.12,0.235]},"remainder":{"label":"su liekana","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"userClass":{"label":"ziniu lygis","values":[0,1,2,3,4,5]}}
} else if (currentSchoolPeriod === "1-2") {
  pointWeights = {"C1":{"label":"sudetis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C10":{"label":"dvizenkliu ir vienazenkliu iki 20","values":[1.5,0.7,0.2,0.0,0.0,0.0]},"C11":{"label":"dvizenkliu ir vienazenkliu iki 100","values":[2.0,1.75,0.65,0.0,0.0,0.0]},"C12":{"label":"dvizenkliu iki 100","values":[2.0,2.0,0.65,0.35,0.25,0.25]},"C13":{"label":"skaiciu iki 1000","values":[2.0,2.0,1.25,0.65,0.5,0.5]},"C14":{"label":"skaiciu iki 10000","values":[2.0,2.0,2.0,1.25,1.0,0.75]},"C15":{"label":"skaiciu iki 1000000","values":[2.0,2.0,2.0,2.0,1.95,1.15]},"C16":{"label":"turinyje gretimi nuliai","values":[2.0,2.0,2.0,1.25,1.0,0.85]},"C17":{"label":"lenteline sudetis ir atimtis iki 20","values":[2.0,0.8,0.3,0.0,0.0,0.0]},"C18":{"label":"daugybos lentele","values":[2.0,2.0,0.75,0.3,0.35,0.25]},"C19":{"label":"dvizenklio is vienazenklio","values":[2.0,2.0,2.0,1.25,0.65,0.5]},"C2":{"label":"atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C20":{"label":"trizenklio is vienazenklio","values":[2.0,2.0,2.0,1.5,0.85,0.75]},"C21":{"label":"keturzenklio is vienazenklio","values":[2.0,2.0,2.0,1.65,1.15,1.0]},"C22":{"label":"daugiazenklio is vienzenklio","values":[2.0,2.0,2.0,1.65,1.2,1.0]},"C23":{"label":"dvizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C24":{"label":"trizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C25":{"label":"keturzenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C26":{"label":"daugiazenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C27":{"label":"daugiazenkliu","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C28":{"label":"is pilnu lengvesni","values":[2.0,2.0,2.0,1.0,0.35,0.15]},"C29":{"label":"is pilnu sunkesni","values":[2.0,2.0,2.0,1.0,0.5,0.25]},"C3":{"label":"sudetis ir atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C30":{"label":"daugiazenklio is vienazenklio (dalmenyje 0)","values":[2.0,2.0,1.5,1.25,1.25,1.25]},"C31":{"label":"ivairus iki 10","values":[1.25,0.1,0.1,0,0,0]},"C32":{"label":"ivairus iki 20","values":[1.5,0.8,0.2,0,0,0]},"C33":{"label":"ivairus iki 100","values":[2.0,1.75,0.65,0,0,0]},"C34":{"label":"ivairus iki 1000","values":[2.0,2.0,1.25,0.75,0.5,0.5]},"C35":{"label":"ivairus iki 10000","values":[2.0,2.0,2.0,1.15,1.0,0.75]},"C36":{"label":"ivairus iki 1000000","values":[2.0,2.0,2.0,2.0,1.25,1.15]},"C37":{"label":"neperzengiant","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C38":{"label":"perzengiant","values":[1.5,1.5,1.5,1.5,1.5,1.5]},"C4":{"label":"daugyba","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C41":{"label":"skaitine","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C42":{"label":"su nezinomuoju","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C49":{"label":"teksto supratimas","values":[6.5,10.0,8.0,5.5,5.5,6.0]},"C5":{"label":"dalyba","values":[1.25,1.25,1.25,1.25,1.15,1.0]},"C50":{"label":"rasyba","values":[4.0,2.5,1.0,0.65,0.3,0.25]},"C51":{"label":"turinio komponavimas","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C52":{"label":"strukturos isdestumas","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C58":{"label":"teksto supratimas lengvas","values":[1.0,1.0,0.75,1.15,0.75,0.5]},"C59":{"label":"teksto supratimas vidutinis","values":[1.75,1.85,1.15,1.5,1.25,0.75]},"C6":{"label":"daugyba ir dalyba","values":[1.25,1.25,1.25,1.25,1.15,1.0]},"C60":{"label":"teksto supratimas sunkus","values":[2.0,2.0,1.75,2.0,1.75,1.15]},"C7":{"label":"ivairius","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C75":{"label":"lietuviu klases 1-2","values":[1.5,1.0,1.0,0.0,0.0,0.0]},"C76":{"label":"lietuviu klases 3-4","values":[2.0,1.75,1.5,1.0,1.0,1.0]},"C77":{"label":"is pilnu simtu","values":[2.0,2.0,1.0,1.0,0.5,0.15]},"C8":{"label":"vienazenkliu iki 10","values":[1.25,0.1,0.1,0.0,0.0,0.0]},"C80":{"label":"be distraktoriaus","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C81":{"label":"su distraktoriumi","values":[1.25,1.25,1.25,1.2,1.25,1.25]},"C9":{"label":"vienazenkliu iki 20","values":[1.5,0.8,0.2,0.0,0.0,0.0]},"DL1":{"label":"daugybos range[1] === 1","values":[1.0,0.5,0.15,0.0,0.0,0.0]},"DL10":{"label":"daugybos range[0] === 10 AND daugybos range[1] ===10","values":[1.25,0.75,0.15,0,0,0]},"DL2":{"label":"daugybos range[1] === 2","values":[2.0,1.0,0.75,0,0,0]},"DLALL":{"label":"daugybos range else","values":[2.0,1.0,1.0,1.0,1.0,1.0]},"base":{"label":"base","values":[0.425,0.105,0.11,0.275,0.14,0.255]},"remainder":{"label":"su liekana","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"userClass":{"label":"ziniu lygis","values":[0,1,2,3,4,5]}}
} else if (currentSchoolPeriod === "3-8") {
  pointWeights = {"C1":{"label":"sudetis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C10":{"label":"dvizenkliu ir vienazenkliu iki 20","values":[1.5,0.4,0.2,0.0,0.0,0.0]},"C11":{"label":"dvizenkliu ir vienazenkliu iki 100","values":[2.0,1.25,0.65,0.0,0.0,0.0]},"C12":{"label":"dvizenkliu iki 100","values":[2.0,1.75,0.65,0.35,0.25,0.25]},"C13":{"label":"skaiciu iki 1000","values":[2.0,2.0,1.85,0.65,0.5,0.5]},"C14":{"label":"skaiciu iki 10000","values":[2.0,2.0,2.0,1.25,0.75,0.75]},"C15":{"label":"skaiciu iki 1000000","values":[2.0,2.0,2.0,2.0,1.85,1.15]},"C16":{"label":"turinyje gretimi nuliai","values":[2.0,2.0,2.0,1.25,0.75,0.75]},"C17":{"label":"lenteline sudetis ir atimtis iki 20","values":[2.0,0.5,0.3,0.0,0.0,0.0]},"C18":{"label":"daugybos lentele","values":[2.0,2.0,0.35,0.5,0.35,0.25]},"C19":{"label":"dvizenklio is vienazenklio","values":[2.0,2.0,2.0,1.15,0.65,0.5]},"C2":{"label":"atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C20":{"label":"trizenklio is vienazenklio","values":[2.0,2.0,2.0,1.5,0.85,0.75]},"C21":{"label":"keturzenklio is vienazenklio","values":[2.0,2.0,2.0,1.55,1.0,1.0]},"C22":{"label":"daugiazenklio is vienzenklio","values":[2.0,2.0,2.0,1.6,1.0,1.0]},"C23":{"label":"dvizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.75]},"C24":{"label":"trizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.75]},"C25":{"label":"keturzenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.75]},"C26":{"label":"daugiazenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.75]},"C27":{"label":"daugiazenkliu","values":[2.0,2.0,2.0,2.0,2.0,2.0]},"C28":{"label":"is pilnu lengvesni","values":[2.0,2.0,2.0,1.0,0.35,0.15]},"C29":{"label":"is pilnu sunkesni","values":[2.0,2.0,2.0,1.0,0.5,0.25]},"C3":{"label":"sudetis ir atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C30":{"label":"daugiazenklio is vienazenklio (dalmenyje 0)","values":[2.0,2.0,1.5,1.25,1.25,1.25]},"C31":{"label":"ivairus iki 10","values":[1.25,0.0,0.1,0,0,0]},"C32":{"label":"ivairus iki 20","values":[1.5,0.5,0.2,0,0,0]},"C33":{"label":"ivairus iki 100","values":[2.0,1.25,0.65,0,0,0]},"C34":{"label":"ivairus iki 1000","values":[2.0,2.0,1.25,0.75,0.5,0.5]},"C35":{"label":"ivairus iki 10000","values":[2.0,2.0,2.0,1.25,0.95,0.75]},"C36":{"label":"ivairus iki 1000000","values":[2.0,2.0,2.0,2.0,1.25,1.15]},"C37":{"label":"neperzengiant","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C38":{"label":"perzengiant","values":[1.5,1.5,1.5,1.5,1.5,1.5]},"C4":{"label":"daugyba","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C41":{"label":"skaitine","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C42":{"label":"su nezinomuoju","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C49":{"label":"teksto supratimas","values":[7.0,7.5,5.5,4.25,4.0,4.0]},"C5":{"label":"dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C50":{"label":"rasyba","values":[4.0,3.5,1.0,0.35,0.25,0.25]},"C51":{"label":"turinio komponavimas","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C52":{"label":"strukturos isdestumas","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C58":{"label":"teksto supratimas lengvas","values":[1.0,1.0,0.75,1.15,0.75,0.5]},"C59":{"label":"teksto supratimas vidutinis","values":[1.75,1.85,1.15,1.5,1.15,0.75]},"C6":{"label":"daugyba ir dalyba","values":[1.25,1.25,1.25,1.15,1.15,1.0]},"C60":{"label":"teksto supratimas sunkus","values":[2.0,2.0,1.75,1.75,1.75,1.15]},"C7":{"label":"ivairius","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C75":{"label":"lietuviu klases 1-2","values":[1.5,1.0,1.0,0.0,0.0,0.0]},"C76":{"label":"lietuviu klases 3-4","values":[2.0,1.75,1.5,1.0,1.0,1.0]},"C77":{"label":"is pilnu simtu","values":[2.0,2.0,1.0,1.0,0.5,0.15]},"C8":{"label":"vienazenkliu iki 10","values":[1.25,0.0,0.1,0.0,0.0,0.0]},"C80":{"label":"be distraktoriaus","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C81":{"label":"su distraktoriumi","values":[1.25,1.25,1.25,1.2,1.25,1.25]},"C9":{"label":"vienazenkliu iki 20","values":[1.5,0.65,0.2,0.0,0.0,0.0]},"DL1":{"label":"daugybos range[1] === 1","values":[1.0,0.5,0.15,0.0,0.0,0.0]},"DL10":{"label":"daugybos range[0] === 10 AND daugybos range[1] ===10","values":[1.25,0.75,0.15,0,0,0]},"DL2":{"label":"daugybos range[1] === 2","values":[2.0,1.0,0.75,0,0,0]},"DLALL":{"label":"daugybos range else","values":[2.0,1.0,1.0,1.0,1.0,1.0]},"base":{"label":"base","values":[0.4,0.089,0.12,0.305,0.16,0.265]},"remainder":{"label":"su liekana","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"userClass":{"label":"ziniu lygis","values":[0,1,2,3,4,5]}}
} else {
  console.log("school period undefined - defaulting to 1-2");
  pointWeights = {"C1":{"label":"sudetis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C10":{"label":"dvizenkliu ir vienazenkliu iki 20","values":[1.5,0.7,0.2,0.0,0.0,0.0]},"C11":{"label":"dvizenkliu ir vienazenkliu iki 100","values":[2.0,1.75,0.65,0.0,0.0,0.0]},"C12":{"label":"dvizenkliu iki 100","values":[2.0,2.0,0.65,0.35,0.25,0.25]},"C13":{"label":"skaiciu iki 1000","values":[2.0,2.0,1.25,0.65,0.5,0.5]},"C14":{"label":"skaiciu iki 10000","values":[2.0,2.0,2.0,1.25,1.0,0.75]},"C15":{"label":"skaiciu iki 1000000","values":[2.0,2.0,2.0,2.0,1.95,1.15]},"C16":{"label":"turinyje gretimi nuliai","values":[2.0,2.0,2.0,1.25,1.0,0.85]},"C17":{"label":"lenteline sudetis ir atimtis iki 20","values":[2.0,0.8,0.3,0.0,0.0,0.0]},"C18":{"label":"daugybos lentele","values":[2.0,2.0,0.75,0.3,0.35,0.25]},"C19":{"label":"dvizenklio is vienazenklio","values":[2.0,2.0,2.0,1.25,0.65,0.5]},"C2":{"label":"atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C20":{"label":"trizenklio is vienazenklio","values":[2.0,2.0,2.0,1.5,0.85,0.75]},"C21":{"label":"keturzenklio is vienazenklio","values":[2.0,2.0,2.0,1.65,1.15,1.0]},"C22":{"label":"daugiazenklio is vienzenklio","values":[2.0,2.0,2.0,1.65,1.2,1.0]},"C23":{"label":"dvizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C24":{"label":"trizenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C25":{"label":"keturzenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C26":{"label":"daugiazenklio is dvizenklio","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C27":{"label":"daugiazenkliu","values":[2.0,2.0,2.0,2.0,2.0,1.85]},"C28":{"label":"is pilnu lengvesni","values":[2.0,2.0,2.0,1.0,0.35,0.15]},"C29":{"label":"is pilnu sunkesni","values":[2.0,2.0,2.0,1.0,0.5,0.25]},"C3":{"label":"sudetis ir atimtis","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C30":{"label":"daugiazenklio is vienazenklio (dalmenyje 0)","values":[2.0,2.0,1.5,1.25,1.25,1.25]},"C31":{"label":"ivairus iki 10","values":[1.25,0.1,0.1,0,0,0]},"C32":{"label":"ivairus iki 20","values":[1.5,0.8,0.2,0,0,0]},"C33":{"label":"ivairus iki 100","values":[2.0,1.75,0.65,0,0,0]},"C34":{"label":"ivairus iki 1000","values":[2.0,2.0,1.25,0.75,0.5,0.5]},"C35":{"label":"ivairus iki 10000","values":[2.0,2.0,2.0,1.15,1.0,0.75]},"C36":{"label":"ivairus iki 1000000","values":[2.0,2.0,2.0,2.0,1.25,1.15]},"C37":{"label":"neperzengiant","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C38":{"label":"perzengiant","values":[1.5,1.5,1.5,1.5,1.5,1.5]},"C4":{"label":"daugyba","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C41":{"label":"skaitine","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C42":{"label":"su nezinomuoju","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C49":{"label":"teksto supratimas","values":[6.5,10.0,8.0,5.5,5.5,6.0]},"C5":{"label":"dalyba","values":[1.25,1.25,1.25,1.25,1.15,1.0]},"C50":{"label":"rasyba","values":[4.0,2.5,1.0,0.65,0.3,0.25]},"C51":{"label":"turinio komponavimas","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"C52":{"label":"strukturos isdestumas","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C58":{"label":"teksto supratimas lengvas","values":[1.0,1.0,0.75,1.15,0.75,0.5]},"C59":{"label":"teksto supratimas vidutinis","values":[1.75,1.85,1.15,1.5,1.25,0.75]},"C6":{"label":"daugyba ir dalyba","values":[1.25,1.25,1.25,1.25,1.15,1.0]},"C60":{"label":"teksto supratimas sunkus","values":[2.0,2.0,1.75,2.0,1.75,1.15]},"C7":{"label":"ivairius","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C75":{"label":"lietuviu klases 1-2","values":[1.5,1.0,1.0,0.0,0.0,0.0]},"C76":{"label":"lietuviu klases 3-4","values":[2.0,1.75,1.5,1.0,1.0,1.0]},"C77":{"label":"is pilnu simtu","values":[2.0,2.0,1.0,1.0,0.5,0.15]},"C8":{"label":"vienazenkliu iki 10","values":[1.25,0.1,0.1,0.0,0.0,0.0]},"C80":{"label":"be distraktoriaus","values":[1.0,1.0,1.0,1.0,1.0,1.0]},"C81":{"label":"su distraktoriumi","values":[1.25,1.25,1.25,1.2,1.25,1.25]},"C9":{"label":"vienazenkliu iki 20","values":[1.5,0.8,0.2,0.0,0.0,0.0]},"DL1":{"label":"daugybos range[1] === 1","values":[1.0,0.5,0.15,0.0,0.0,0.0]},"DL10":{"label":"daugybos range[0] === 10 AND daugybos range[1] ===10","values":[1.25,0.75,0.15,0,0,0]},"DL2":{"label":"daugybos range[1] === 2","values":[2.0,1.0,0.75,0,0,0]},"DLALL":{"label":"daugybos range else","values":[2.0,1.0,1.0,1.0,1.0,1.0]},"base":{"label":"base","values":[0.425,0.105,0.11,0.275,0.14,0.255]},"remainder":{"label":"su liekana","values":[1.25,1.25,1.25,1.25,1.25,1.25]},"userClass":{"label":"ziniu lygis","values":[0,1,2,3,4,5]}}
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

        return Number(total.toFixed(2));

      } else if (type === "selectedTexts") {
          let taskInfoArray = [];
          let selectedTextIDs = [];
          let mistakesMap = new Map();

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

              const mistakes = mistakesMap.get(textId) ?? 0;

              let multiplier =
                  mistakes === 0 ? 1 :
                  mistakes === 1 ? 0.75 :
                  mistakes === 2 ? 0.5 :
                  mistakes === 3 ? 0.25 : 0;

              customTextsTotal += perTextTotal * multiplier;
          }

          return Number(customTextsTotal.toFixed(2));
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
    const [recordedFoodAmount, recordedWaterAmount, recordedLoveAmount, recordedTime] = userData.petStats
    const currentTime = Math.floor(Date.now() / 1000 / 60);
    const timeElapsed = currentTime - recordedTime;
    const statDecrease = Math.floor(timeElapsed * PET_STATS_EXPIRATION);

    const foodAmount = recordedFoodAmount - statDecrease;
    const waterAmount = recordedWaterAmount - statDecrease;
    const loveAmount = recordedLoveAmount - statDecrease;

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
  
  if (!petEl) {
    console.error('Pet element not found!');
    return;
  }
  
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
    
    startRandomPetOnWalkAction();
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
      }, duration + 100);
      
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