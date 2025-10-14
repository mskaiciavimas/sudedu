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
  taskId: 0,
  setTaskDuration: '',
  taskCompleted: false,
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
  questionsStopped: false,
  tempTracking: true
}

const fireworksDiv = document.querySelector('#fireworks-div');
let upperLineElement = document.querySelector('.upper-line');
let previousEquationElement = document.querySelector('.previous-equation');
let answerTrackerElement = document.querySelector('#answer-tracker');
let mistakeTrackerElement = document.querySelector('#mistake-tracker');
let stulpeliuDivElement = document.querySelector('#stulpeliu-div');
let divisionStulp2InnerElement = document.querySelector('#division-stulp-2-inner');
let divisionStulp3Element = document.querySelector('#division-stulp-3');
let divisionStulp4Element = document.querySelector('#division-stulp-4')
let arithmeticSymbol = document.querySelector('#arithmetic-symbol');
let answerFieldDivInvisibleDiv = document.querySelector('#answer-field-div-invisible-div');
let taskSavingMessageDiv = document.querySelector("#task-saving-message");

if (document.querySelector("#stopButton")) {
  document.querySelector("#stopButton").disabled = false;
}
if (document.querySelector(".summary-button")) {
  document.querySelector(".summary-button").disabled = false;
}
if (document.querySelector("#stop-button-span")) {
  document.querySelector("#stop-button-span").disabled = false;
}

    function formatFinalMessage () {

      if (document.querySelector(".upper-line")) {
        document.querySelector(".upper-line").style.display = "none";
      }

      if (controller.taskCompleted && controller.tempTracking) {
        sendTaskInfoToDatabase();
        controller.tempTracking = false
      }

      document.querySelector('#invisibleRow').style.display = "none";
      if (!controller.questionsStopped && controller.mistakesTracker === 0 && controller.answeredQuestionTracker >= 10) {
        triggerFireworks();
      }

      setFontSize();
      var contentContainerElement = document.getElementById('content-container');
      contentContainerElement.style.width = '100%';
      contentContainerElement.style.marginRight = '0';
			contentContainerElement.style.marginLeft = '0';

      if (controller.taskId !== 0) {
        controller.equation = '';
        if (controller.taskCompleted === true) {
          sendSetTaskResultsToDatabase();
        } else {
          if (controller.language === 'LT') {
            taskSavingMessageDiv.innerHTML = 'Užduotis nebaigta iki galo. Rezultatai neišsaugoti.';
          } else if (controller.language === 'EN') {
            taskSavingMessageDiv.innerHTML = 'Task was not completed. Results were not saved.';
          }
        }
      } else {
        controller.equation = finalMessageText();
      }
      
      controller.equation2 = '';
      controller.result = ['', '', '', '', ''];
      controller.questionsStopped = true;
      clearInterval(timerInterval);
      const stopButtonSpanElement = document.querySelector('#stop-button-span');
      stopButtonSpanElement.innerHTML = "refresh";
      localStorage.setItem('controller', JSON.stringify(controller))
    }

	function formEquation () {
    taskSavingMessageDiv.innerHTML = ''
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
        formatFinalMessage()
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
        formatFinalMessage()
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

function recordGrammarFinalMistakes() {
  const mistakeEncodingIndex = {
		"fsc-gal": "C61",
		"dkt": "C62",
		"bdv": "C63",
		"prv": "C64",
		"vks": "C65",
		"įsi-r": "C66",
		"fsc-con": "C67",
		"fsc-vow": "C68",
		"prš": "C69",
		"prs": "C70",
		"asim": "C71",
		"md": "C72"
	}

	Object.keys(mistakeRecords).forEach(key => {
		const answer = atsakymai[key]
		mistakeRecords[key]["wordWithAnswer"] = [answer["klausimas"][0], answer["atsakymas"][0][0], answer["klausimas"][1]],
		mistakeRecords[key]["wordGrammarType"] = mistakeEncodingIndex[answer["kl-grupe"]]
		mistakeRecords[key]["wordId"] = answer["zodzio-id"]
	});

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

function formatFinalMessageForGrammar() {
  localStorage.setItem("elapsedTime", timerDisplay.textContent)
  recordGrammarFinalMistakes();

      if (controller.taskCompleted && controller.tempTracking) {
        sendTaskInfoToDatabase();
        controller.tempTracking = false
      }

  document.querySelector('#restart-reset-button-row').style.display = "flex";
  document.getElementById('next-question').style.display = "none";
  document.getElementById('check-answers').style.visibility = "hidden";
  document.getElementById('show-answers').style.visibility = "hidden";
  document.getElementById('help-button').style.visibility = "hidden";
  document.getElementById('warning').style.visibility = "hidden";
  clearInterval(timerInterval);
  document.querySelector('#stop-button-span').innerHTML = "refresh";
  document.getElementById("field-for-sentences").innerHTML = "";

  if (!controller.questionsStopped && controller.mistakesTracker === 0 && controller.answeredQuestionTracker >= 5) {
    triggerFireworks();
  }

  if (controller.taskId !== 0) {
    if (controller.taskCompleted === true) {
      sendSetTaskResultsToDatabase();
    } else {
      document.getElementById("field-for-final-message").innerHTML = ''
      if (controller.language === 'LT') {
        taskSavingMessageDiv.innerHTML = 'Užduotis nebaigta iki galo. Rezultatai neišsaugoti.'
      } else if (controller.language === 'EN') {
        taskSavingMessageDiv.innerHTML = 'Task was not completed. Results were not saved.'
      }
    }
  } else {
    document.getElementById("field-for-final-message").innerHTML = `<div style="min-height: 200px; display: flex; justify-content: center; align-items: center;">${finalMessageText()}</div>`;
  }
  controller.questionsStopped = true;
  localStorage.setItem('controller', JSON.stringify(controller))
}

function recordFinalMistakesForTextComprehension() {
  let mistakeList = [];
  for (const outerKey in mistakesSummary) {
    const innerObj = mistakesSummary[outerKey];
    for (const innerKey in innerObj) {
      mistakeList.push([outerKey, innerObj[innerKey]]);
    }
  }
  controller.currentMistakes = mistakeList
}

function formatFinalMessageForTextcomprehension() {
    localStorage.setItem("elapsedTime", timerDisplay.textContent)
    recordFinalMistakesForTextComprehension();

      if (controller.taskCompleted && controller.tempTracking) {
        sendTaskInfoToDatabase();
        controller.tempTracking = false
      }

    if (!controller.questionsStopped && controller.mistakesTracker === 0 && controller.answeredQuestionTracker >= 1) {
      triggerFireworks();
    }

    if (controller.taskId !== 0) {
      if (controller.taskCompleted === true) {
        sendSetTaskResultsToDatabase();
      } else {
        document.getElementById("final-message-div").innerHTML = '';
        if (controller.language === 'LT') {
          taskSavingMessageDiv.innerHTML = 'Užduotis nebaigta iki galo. Rezultatai neišsaugoti.'
        } else if (controller.language === 'EN') {
          taskSavingMessageDiv.innerHTML = 'Task was not completed. Results were not saved.'
        }
      }
    } else {
      document.getElementById("final-message-div").innerHTML = finalMessageText();
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
    localStorage.setItem('controller', JSON.stringify(controller))
}

let redirectingToAuthentication = false;

async function sendSetTaskResultsToDatabase() {

  function clearUserDataCookie() {
    localStorage.removeItem('userData');
  }

  const userDataString = localStorage.getItem('userData');
  let userData;

  if (userDataString) {
      userData = JSON.parse(userDataString);
  } else {
      window.location.href = '/LT/';
      return;
  }

  let elapsedTime = 0;
  if (localStorage.getItem("elapsedTime")) {
    elapsedTime = localStorage.getItem("elapsedTime")
  }

  resultsData = [ [controller.answeredQuestionTracker, controller.mistakesTracker],
                  controller.currentMistakes, elapsedTime
                ]
  resultsDataString = JSON.stringify(resultsData);

  const taskResults = {
      taskId: controller.taskId,
      results: resultsDataString
  };

  const apiBase = 'http://localhost:5000/';

  if (document.querySelector("#stopButton")) {
    document.querySelector("#stopButton").disabled = true;
  }
  if (document.querySelector(".summary-button")) {
    document.querySelector(".summary-button").disabled = true;
  }
  if (document.querySelector("#stop-button-span")) {
    document.querySelector("#stop-button-span").disabled = true;
  }

  if (controller.language === 'LT') {
    taskSavingMessageDiv.innerHTML = "Rezultatai saugomi. Neuždarykite šio lango."
  } else if (controller.language === 'EN') {
    taskSavingMessageDiv.innerHTML = "Saving results. Please do not leave this page."
  }

  try {
      const response = await fetch(apiBase + 'results', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `${userData.token}`
          },
          body: JSON.stringify(taskResults)
      });

      if (!response.ok) {
          const errorData  = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      } else {
        controller.taskId = 0;
        controller.taskCompleted = false;
        localStorage.setItem('controller', JSON.stringify(controller))
        if (controller.language === 'LT') {
          taskSavingMessageDiv.innerHTML = "Rezultatai sėkmingai išsaugoti."
        } else if (controller.language === 'EN') {
          taskSavingMessageDiv.innerHTML = "Results were saved successfully."
        }
      }

  } catch (error) {
      console.log('Error saving task results:', error);
      if (error.message === "Unauthorized") {
        redirectingToAuthentication = true;
          clearUserDataCookie();
          localStorage.setItem('controller', JSON.stringify(controller))
          window.location.href = "prisijungimas";
      } else {
        if (controller.language === 'LT') {
          taskSavingMessageDiv.innerHTML = "Įvyko klaida. Rezultatai neišsaugoti. Bandykite vėl vėliau."
        } else if (controller.language === 'EN') {
          taskSavingMessageDiv.innerHTML = "An error has occurred. Results were not saved. Please try again later."
        }
        controller.taskId = 0;
        controller.taskCompleted = false;
        localStorage.setItem('controller', JSON.stringify(controller))
    }
  }
  if (document.querySelector("#stopButton")) {
    document.querySelector("#stopButton").disabled = false;
  }
  if (document.querySelector(".summary-button")) {
    document.querySelector(".summary-button").disabled = false;
  }
  if (document.querySelector("#stop-button-span")) {
    document.querySelector("#stop-button-span").disabled = false;
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
		contentContainerElement.style.visibility = 'hidden';
    var mainRemainderField = document.getElementById('remainder-field');
    mainRemainderField.style.display = 'none';

    if (!controller.questionsStopped) {
    if (controller.modeChoice7 === "C48" && controller.randomSelection[2] === 'D' && (controller.modeChoice8 === '' || controller.modeChoice8 === 'C79')) {
				linkElement.setAttribute("href", "../questions-stulpeliu-div.css");
		} else if (controller.modeChoice7 === "C48" && controller.randomSelection[2] === 'D' && controller.modeChoice8 === 'C78') {
				linkElement.setAttribute("href", "../questions-stulpeliu-div-us.css");
		}  else if (controller.modeChoice7 === "C48") {
			linkElement.setAttribute("href", "../questions-stulpeliu.css");
      var answerSeparator2 = document.getElementById('answer-separator-2');
      answerSeparator2.style.display = 'block';
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
  }   
		

    if (controller.questionsStopped) {
      equationElement.style.display = "flex";
      answerFieldDivElement.style.display = "none";
      questionsSubmitButtonRowElement.style.display = "none";
      resetMistakeButtonsElement.style.display = "flex";
      contentContainerElement.style.visibility = 'visible';

      //added newly
      contentContainerElement.style.width = '100%';
      contentContainerElement.style.marginRight = '0';
			contentContainerElement.style.marginLeft = '0';
      contentContainerElement.style.paddingLeft = 0 + 'px';
			contentContainerElement.style.paddingRight = 0 + 'px';
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
      contentContainerElement.style.visibility = 'visible';
    } else if (controller.modeChoice5 === "C42") {
      equationElement.innerHTML = controller.equation;
      equation2Element.style.display = "block";
      equation2Element.innerHTML = controller.equation2;
      contentContainerElement.style.visibility = 'visible';
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
        answerFieldDivInvisibleDiv.innerHTML = '';
        divisionStulp3Element .innerHTML = '';
        divisionStulp4Element .innerHTML = '';
      }

    var answerSeparator1 = document.getElementById('answer-separator-1');
    var answerSeparator2 = document.getElementById('answer-separator-2');

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
            stulpeliuDivElement.innerHTML += '<div style="position: relative;"><div class="stulpeliu-symbol" style="position: absolute; left: calc((-0.65 * 3rem) + ' + (i*fontSizeFullREM*-0.9) + 'px); top: ' + -100 + '%;">+</div><div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-right: calc(' + fontSizeFullREM*0.45 + 'rem * (' + (i) + ')) !important; margin-bottom: 10px;"><textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></textarea></div></div>';
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

    answerFieldDivInvisibleDiv.innerHTML += '<div class="invisibleDiv" style="visibility: hidden; display: block;"></div>';

    if (i === 0) {
      divisionStulp3Element.innerHTML += '<div class="d-flex justify-content-center align-items-center"><div class="invisibleDiv" style="visibility: hidden; display: block;"></div><div style="position: relative;"><div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub stulpeliu-field-underline" style="margin-bottom: 10px; margin-left: calc(' + fontSizeFullREM*0.45 + 'rem * (' + (offset+tempOffset) + ')) !important;"> <div style="position: absolute; transform: translatex(-150%); top: -14%" class="stulpeliu-symbol-div">-</div><textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></textarea></div></div></div>';
    } else {
      if (counter !== 0) {
        divisionStulp4Element.innerHTML += `
        <div class="d-flex justify-content-center align-items-center">
          <div class="invisibleDiv" style="visibility: hidden; display: block;"></div>
          <div style="position: relative;">
            <div id="stulpeliu-field-${i}" class="stulpeliu-field stulpeliu-field-sub stulpeliu-field-underline" style="margin-bottom: 10px; margin-left: calc(${fontSizeFullREM * 0.9}rem * (${offset + tempOffset})) !important;">
              <div style="position: absolute; transform: translatex(-150%); top: -14%" class="stulpeliu-symbol-div">-</div>
              <textarea type="text" id="stulpeliu-${i}" name="stulpeliu-${i}" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></textarea>
            </div>
          </div>
        </div>
      `
      } else if (i+1 !== subAnswerNumber*2) {
        divisionStulp4Element.innerHTML += `
        <div class="d-flex justify-content-center align-items-center">
          <div class="invisibleDiv" style="visibility: hidden; display: block;"></div>
          <div style="position: relative;">
            <div id="stulpeliu-field-${i}" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px; margin-left: calc(${fontSizeFullREM * 0.9}rem * (${offset + tempOffset})) !important;">
              <textarea type="text" id="stulpeliu-${i}" name="stulpeliu-${i}" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></textarea>
            </div>
          </div>
        </div>
      `;
      
      } else {
        divisionStulp4Element.innerHTML += '<div class="d-flex justify-content-center align-items-center">' +
        '<div id="liek" class="invisibleDiv" style="visibility: hidden; display: block;"></div>' +
        '<div style="position: relative;">' +
        '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px; margin-left: calc(' + fontSizeFullREM*0.45 + 'rem * (' + (offset+tempOffset) + ')) !important;">' +
        '<textarea type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></textarea>' +
        '</div>' +
        '</div>' +
        '</div>';
      }
}
  }
    


    }
}
}
    if (controller.randomSelection[2] !== 'D') {
    answerSeparator2.style.display = 'block'
    var element3 = document.querySelector('#stulpeliu-' + (subAnswerNumber - 1));
    if (element3) {
      answerSeparator1.style.display = 'block';
    } else {
      answerSeparator1.style.display = 'none';
    }

    if (controller.questionsStopped) {  
      answerSeparator1.style.display = 'none';
      answerSeparator2.style.display = 'none';
    }
    } else {
      answerSeparator1.style.display = 'none';
      answerSeparator2.style.display = 'none';
    }

    
    if (controller.modeChoice7 === "C48") {
      setTimeout(function() {
        if (!controller.questionsStopped) {
          setMargins();
        }
      }, 100);
    }

      // Select all elements with the class 'stulpeliu-input'
      const inputElements = document.querySelectorAll('.stulpeliu-input');

      // Loop through each input element and add an event listener
      inputElements.forEach(function(element) {
	  element.setAttribute("inputmode", "numeric");    
          element.addEventListener('input', function(event) {
              // Sanitize input field value on input event
              const sanitizedValue = event.target.value.replace(/[^0-9]/g, '');
              event.target.value = sanitizedValue;
          });
          element.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                checkAnswer();
                clearAnswerField();
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
    handleRemainderCompensatoryMargin();
  }



  function checkAnswer () {
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

      function answerFieldColor(element, corectness) {
        if (corectness === false) {
          element.style.backgroundColor = 'rgba(213, 126, 126, 0.6)';
          clearTimeout(timeoutReference);
          removeError(element);
          element.classList.add('error');
          var timeoutReference = setTimeout(function() {
            removeError(element);
          }, 500);
        } else if (corectness === true) {
          element.style.backgroundColor = 'rgba(64, 201, 169, 0.6)';
        } else {
          element.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
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
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7", `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = ${flipNumber(userInput)}`];
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
      } else {
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

      if (controller.modeChoice8 === 'C78' && controller.withRemainder === true) {
        var expectedRemainderAnswer = controller.randomSelection[0] % controller.randomSelection[1];
        let answerRemainderWesternInputElement = document.querySelector('#answer-remainder');
        userRemainderInput = answerRemainderWesternInputElement.value.trim();
  
        if (Number(userRemainderInput) !== expectedRemainderAnswer) {
          isCorrect = false;
        } 
        answerFieldColor(answerRemainderWesternInputElement, isCorrect);
      }
        
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
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], ":", `${controller.randomSelection[0]} ${divisionSymbol} ${controller.randomSelection[1]} = ${userInput}`];
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], ":", `${controller.randomSelection[0]} ${divisionSymbol} ${controller.randomSelection[1]} = ${userInput}`];
        controller.mistakesTracker++;
        recordMistakes(); 
      }

    } else if (controller.randomSelection[2] === 'A') {
      if (flipNumber(userInput) === controller.randomSelection[0] + controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
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
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "-", `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
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
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
        isCorrect = false;
        controller.mistakesTracker++;
        recordMistakes(); 
      }
     } else if (controller.randomSelection[2] === 'S') {
      if (userAnswer === controller.randomSelection[0] - controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.answeredQuestionTracker++;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "-", `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "-", `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = ${userAnswer}`];
        isCorrect = false;
        controller.mistakesTracker++;
        recordMistakes(); 
      }
      } else if (controller.randomSelection[2] === 'M') {
        if (userAnswer === controller.randomSelection[0] * controller.randomSelection[1]) {
          controller.combinations.splice(indexToRemove, 1);
          controller.answeredQuestionTracker++;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7", `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = ${userAnswer}`];
        } else {
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
            controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+ first", `${userAnswer} + ${controller.randomSelection[1]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
            controller.combinations.splice(indexToRemove, 1);
          } else {
            controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+ first", `${userAnswer} + ${controller.randomSelection[1]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`];
            isCorrect = false;
            controller.mistakesTracker++;
            recordMistakes(); 
          }
        } else if (controller.randomSelection[3] === "second") {
          if (userAnswer === controller.randomSelection[1]) {
            controller.answeredQuestionTracker++;
            controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+ second", `${controller.randomSelection[0]} + ${userAnswer} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
            controller.combinations.splice(indexToRemove, 1);
          } else {
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
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "- first", `${userAnswer} - ${controller.randomSelection[1]} = ${controller.randomSelection[0] - controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "- first", `${userAnswer} - ${controller.randomSelection[1]} = ${controller.randomSelection[0] - controller.randomSelection[1]}`]; 
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      } else if (controller.randomSelection[3] === "second") {
        if (userAnswer === controller.randomSelection[1]) {
          controller.answeredQuestionTracker++;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "- second", `${controller.randomSelection[0]} - ${userAnswer} = ${controller.randomSelection[0] - controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "- second", `${controller.randomSelection[0]} - ${userAnswer} = ${controller.randomSelection[0] - controller.randomSelection[1]}`];  
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      }
    } else if (controller.randomSelection[2] === 'M') {
      if (controller.randomSelection[3] === "first") {
        if (userAnswer === controller.randomSelection[0]) {
          controller.answeredQuestionTracker++;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7 first", `${userAnswer} \u00D7 ${controller.randomSelection[1]} = ${controller.randomSelection[0] * controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\u00D7 first", `${userAnswer} \u00D7 ${controller.randomSelection[1]} = ${controller.randomSelection[0] * controller.randomSelection[1]}`]; 
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      } else if (controller.randomSelection[3] === "second") {
        if (userAnswer === controller.randomSelection[1]) {
          controller.answeredQuestionTracker++;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7 first", `${controller.randomSelection[0]} \u00D7 ${userAnswer} = ${controller.randomSelection[0] * controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
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
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\uA789 first", `${userAnswer} ${divisionSymbol} ${controller.randomSelection[1]} = ${controller.randomSelection[0] / controller.randomSelection[1]}`]; 
        controller.combinations.splice(indexToRemove, 1);
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\uA789 first", `${userAnswer} ${divisionSymbol} ${controller.randomSelection[1]} = ${controller.randomSelection[0] / controller.randomSelection[1]}`]; 
        isCorrect = false;
        controller.mistakesTracker++;
        recordMistakes(); 
      }
    } else if (controller.randomSelection[3] === "second") {
      if (userAnswer === parseInt(controller.randomSelection[1])) {
        controller.answeredQuestionTracker++;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\uA789 first", `${controller.randomSelection[0]} ${divisionSymbol} ${userAnswer} = ${controller.randomSelection[0] / controller.randomSelection[1]}`]; 
        controller.combinations.splice(indexToRemove, 1);
      } else {
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
      formEquation();
      displayEquation();
      answerInputElement.setAttribute("style", "background-color: rgba(255, 255, 255, 0.6)")
      //answerRemainderWesternInputElement.setAttribute("style", "background-color: rgba(255, 255, 255, 0.6)") recently removed
    } else {
      updateScore();
      setMargins();
    }
  }

  function restartEquations () {	
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
    if (controller.modeChoice8 === 'C78') {
      answerRemainderWesternInputElement.value = '';
      answerRemainderWesternInputElement.setAttribute("style", "background-color: rgba(255, 255, 255, 0.6)");
    }
    controller.result = ['', '', '', '', ''];
    controller.equation = '';
    controller.equation2 = '';
    controller.mistakesTracker = 0;
    controller.answeredQuestionTracker = 0;
    controller.randomSelection = [];
    controller.questionsStopped = false;
    controller.tempTracking = true;
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
    formEquation();
    displayEquation();
  }

  var smallScreen = window.matchMedia('(max-width: 768px)');
  var mediumScreen = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
  var largeScreen = window.matchMedia('(min-width: 1025px)');
  
  // Function to set font size based on screen size
  function setFontSize() {
      var smallScreen = window.matchMedia('(max-width: 649px)');
      var mediumScreen = window.matchMedia('(min-width: 650px) and (max-width: 1199px)');
      var largeScreen = window.matchMedia('(min-width: 1200px)');
      if (smallScreen.matches) {
          // Small screen
          equationElement.style.fontSize = '2rem';
      } else if (mediumScreen.matches) {
          // Medium screen
          equationElement.style.fontSize = '3rem';
      } else if (largeScreen.matches) {
          // Large screen
          equationElement.style.fontSize = '4rem';
      }
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

function redirectToIntermediate() {
  window.location.href = "./pasirinkimai";
}

  function redirectToQuestions() {
    if (controller.mode === "lang") {
    if (controller.modeChoice1 === "C50") {
      window.location.href = "./rasyba";
    } else if (controller.modeChoice1 === "C49") {
      window.location.href = "./teksto-suvokimas";
    } 
  } else if (controller.mode === "math") {
      window.location.href = "./veiksmai";
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
function generateSummaryTable(type, mistakeList=null, customDivForSummaryTable=null, customDivForGrammarSummaryTable=null) {
  controller = JSON.parse(localStorage.getItem('controller'));

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

      // Sort the data by Suklysta (kartai) in descending order
      summaryData.sort((a, b) => b["Suklysta (kartai)"] - a["Suklysta (kartai)"]);

      // Generate the summary table HTML
      const summaryTable = document.createElement("table");
      if (controller.language === 'LT') {
      summaryTable.innerHTML = `
          <tr>
              <th>Veiksmai</th>
              <th>Suklysta (kartai)</th>
              <th></th>
          </tr>
          ${summaryData
              .map(
                  (row) => `<div class="col-12 table-container">
                  <tr>
                      <td>${row["Veiksmai"]}</td>
                      <td>${row["Suklysta (kartai)"]}</td>
                      <td>
                          <div class="bar" style="width: ${Math.min(
                              row["Suklysta (kartai)"] * 10,
                              100
                          )}px; background-color: ${getBarColor(
                      row["Suklysta (kartai)"]
                  )};"></div>
                      </td>
                  </tr>
              `
              )
              .join("")}
      </div>`;
      } else if (controller.language === 'EN') {
        summaryTable.innerHTML = `
            <tr>
                <th>Equation</th>
                <th>Mistake Frequency</th>
                <th></th>
            </tr>
            ${summaryData
                .map(
                    (row) => `<div class="col-12 table-container">
                    <tr>
                        <td>${row["Veiksmai"]}</td>
                        <td>${row["Suklysta (kartai)"]}</td>
                        <td>
                            <div class="bar" style="width: ${Math.min(
                                row["Suklysta (kartai)"] * 10,
                                100
                            )}px; background-color: ${getBarColor(
                        row["Suklysta (kartai)"]
                    )};"></div>
                        </td>
                    </tr>
                `
                )
                .join("")}
        </div>`;
      }

      // Display the summary table
      let summaryTableElement;
      if (customDivForSummaryTable) {
        summaryTableElement = document.getElementById(customDivForSummaryTable);
        console.log(summaryTableElement)
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
      console.log(summaryTableElement)
    } else {
      summaryTableElement = document.getElementById("summary-table");
    }
    summaryTableElement.innerHTML = controller.language === 'LT' 
      ? 'Klaidų nėra!' 
      : 'No mistakes!';
  }



 if (grammarMistakes.length > 0) {
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
    acc[key].occurrences.push({ usersMistakes, wordId });
    acc[key].totalMistakes += usersMistakes[0];
    return acc;
  }, {});

  // Then process into the final mistake data structure
  const mistakeData = Object.values(wordOccurrences).reduce((result, { wordParts, wordCategory, occurrences, totalMistakes }) => {
    const wordCategoryCoding = {
      "C61": "žodžio pabaiga",
      "C62": "daiktavardžio pabaiga",
      "C63": "būdvardžio pabaiga",
      "C64": "prieveiksmio pabaiga", 
      "C65": "veiksmažodžio pabaiga",
      "C66": "įsimintina rašyba",
      "C67": "panašiai skambančios priebalsės",
      "C68": "balsės ir dvibalsės",
      "C69": "priešdėliai",
      "C70": "priesagos",
      "C71": "priebalsių supanašėjimas",
      "C72": "mišrieji dvigarsiai",
    };

    const decodedWordCategory = wordCategoryCoding[wordCategory];
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

  // Generate table data for current view
  const getTableData = (viewType) => {
    const data = viewType === 'words' ? mistakeData.words : mistakeData.categories;
    return Object.entries(data)
      .map(([display, count]) => ({ display, count }))
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
    tbody.innerHTML = tableData.map(item => `
      <tr>
        <td>${item.display}</td>
        <td>${item.count}</td>
        <td>
          <div class="bar" style="width: ${Math.min(item.count * 10, 100)}px;
               background-color: ${getBarColor(item.count)};">
          </div>
        </td>
      </tr>
    `).join('');
    
    table.appendChild(thead);
    table.appendChild(tbody);
    
    return table;
  };

  // Function to process and display all sentences for a word
  async function showAllSentencesForWord(wordParts, occurrences) {
    // 1. Get the results container first
    const resultsContainer = document.getElementById('sentence-with-mistake-field');
    const resultsContainerForStudents = document.getElementById('sentence-with-mistake-field-for-student');
    if (!resultsContainer && !resultsContainerForStudents) {
        return;
    }

    // Show loading state
    userData = JSON.parse(userDataString);

    if (userData.accType === "teacher") {
      if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
        resultsContainer.innerHTML += '<div class="loading">Ieškoma sakinių...</div>';
      }
    } else if (userData.accType === "student") {
      if (resultsContainerForStudents) {
        resultsContainerForStudents.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
        resultsContainerForStudents.innerHTML += '<div class="loading">Loading sentences...</div>';
      }
    }

    try {
        // 2. Load the database
        const response = await fetch('../databases/sudedu_duomenu_baze.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const sudedu_duomenu_baze = await response.json();

        // 3. Process each occurrence
        const processOccurrence = async ({ usersMistakes, wordId }) => {
            try {
                // Validate wordId structure
                if (!Array.isArray(wordId) || wordId.length < 3) {
                    throw new Error(`Invalid wordId structure: ${JSON.stringify(wordId)}`);
                }

                const entry = sudedu_duomenu_baze.find(item => item.id === wordId[0]);
                if (!entry) {
                    if (userData.accType === "teacher") {
                      if (resultsContainer) {
                        resultsContainer.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                        resultsContainer.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                      }
                    } else if (userData.accType === "student") {
                      if (resultsContainerForStudents) {
                        resultsContainerForStudents.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                        resultsContainerForStudents.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                      }
                    }
                    return
                }

                // Combine text parts safely
                const allTextParts = [
                    ...(entry.text?.start || []),
                    ...(entry.text?.middle || []),
                    ...(entry.text?.end || [])
                ];

                let allTextPartsMerged = allTextParts.join(" ").trim();

                // Split sentences more reliably
                allTextPartsMerged = allTextPartsMerged.replace(/\n/g, ' ');
                const allTextPartsSentences = allTextPartsMerged.match(/[^.!?]+[.!?]+(?:[”"’'»“]*)/g) || [allTextPartsMerged];
                if (wordId[1] < 0 || wordId[1] >= allTextPartsSentences.length) {
                    console.error("Invalid sentence index:", wordId[1]);
                    if (userData.accType === "teacher") {
                      if (resultsContainer) {
                        resultsContainer.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                        resultsContainer.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                      }
                    } else if (userData.accType === "student") {
                      if (resultsContainerForStudents) {
                        resultsContainerForStudents.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                        resultsContainerForStudents.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                      }
                    }
                    return
                }
                const originalSentence = allTextPartsSentences[wordId[1]].trim();
                
                // Process words with punctuation handling
                const sentenceWithoutPunctuation = originalSentence.replace(/\p{P}/gu, " ");;
                const words = sentenceWithoutPunctuation.split(/\s+/).filter(word => word.trim() !== '');
                
                if (wordId[2] < 0 || wordId[2] >= words.length) {
                    console.error("Invalid word index:", wordId[2]);
                    if (userData.accType === "teacher") {
                      if (resultsContainer) {
                        resultsContainer.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                        resultsContainer.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                      }
                    } else if (userData.accType === "student") {
                      if (resultsContainerForStudents) {
                        resultsContainerForStudents.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                        resultsContainerForStudents.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                      }
                    }
                    return
                }

                const targetWord = words[wordId[2]];
                const originalWord = wordParts.join("")

                if (targetWord.toLowerCase().trim() !== originalWord.toLowerCase().trim()) {
                  console.error("Mismatch between targetWord and originalWord:", error);
                  if (userData.accType === "teacher") {
                    resultsContainer.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                    resultsContainer.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                  } else if (userData.accType === "student") {
                    resultsContainerForStudents.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                    resultsContainerForStudents.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                  }
                  return
                }

                const fullWordForm = wordParts.join('');

                // Create case-insensitive regex with word boundaries
                const escapedTarget = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const hyphens = '\u002D\u2010\u2011\u2012\u2013\u2014\u2015';
                const punctuation = '.,!?;:';
                const regex = new RegExp(`(^|\\s)${escapedTarget}(?=\\s|$|[${punctuation}${hyphens}])`, 'gi');
                
                // Find all matches safely
                const matches = [];
                let match;
                while (match = regex.exec(originalSentence)) {
                    matches.push(match);
                    // Prevent infinite loop for zero-length matches
                    if (match.index === regex.lastIndex) regex.lastIndex++;
                }

                if (matches.length === 0) {
                    return `
                        <div class="sentence-occurrence">
                            ${originalSentence} 
                            <span class="error-marker">
                                (žodis "${fullWordForm}" sakinyje nerastas)
                            </span>
                        </div>
                    `;
                }

                // Get the correct instance
                const instanceIndex = Math.min(wordId[2], matches.length - 1);
                const matchData = matches[instanceIndex];
                const matchedText = matchData[0].trim();

                // Prepare user mistakes display
                const wrappedMistakes = Array.isArray(usersMistakes[1]) 
                    ? usersMistakes[1].map(m => `<span class="user-incorrect-answer">${m}</span>`).join(",")
                    : '';

                // Construct marked sentence
                const beforeMatch = originalSentence.substring(0, matchData.index);
                const afterMatch = originalSentence.substring(matchData.index + matchData[0].length);
                
                return `
                    <div class="sentence-occurrence">
                        ${beforeMatch} <span class="answered-word">${wordParts[0]}<span class="incorrect-part">${wordParts[1]}</span>${wordParts[2]}(${wrappedMistakes})</span> ${afterMatch}</div>
                `;

            } catch (error) {
                console.error("Error processing occurrence:", error);
                if (userData.accType === "teacher") {
                  resultsContainer.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                  resultsContainer.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                } else if (userData.accType === "student") {
                  resultsContainerForStudents.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>';
                  resultsContainerForStudents.innerHTML += '<div class="loading">*sakinys nerastas*</div>';
                }
                return
            }
        };

        // 4. Execute all processing and display results
        const sentencesHtml = await Promise.all(occurrences.map(processOccurrence));

      if (userData.accType === "teacher") {
          resultsContainer.innerHTML = '';
          resultsContainer.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>'
          resultsContainer.innerHTML += sentencesHtml.join('');
        } else if (userData.accType === "student") {
          resultsContainerForStudents.innerHTML = '';
          resultsContainerForStudents.innerHTML = '<div class="task-info-subtitle">Klaidos sakiniuose:</div>'
          resultsContainerForStudents.innerHTML += sentencesHtml.join('');
        }

    } catch (error) {
        console.error("Error in showAllSentencesForWord:", error);
        if (userData.accType === "teacher") {
              resultsContainer.innerHTML = `
              <div class="error">
                  Failed to load sentences: ${error.message}
                  <button onclick="location.reload()">Retry</button>
              </div>
            `;
          } else if (userData.accType === "student") {
            resultsContainerForStudents.innerHTML = `
            <div class="error">
                Failed to load sentences: ${error.message}
                <button onclick="location.reload()">Retry</button>
            </div>
          `;
          }
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
    let elapsedTime = currentTime - startTime;

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

  function updateTimer() {
    remainingTime -= 1000;

    if (remainingTime <= 0) {
      // If the timer has ended, clear the interval and display "00:00:00"
      localStorage.setItem("remainingTime", remainingTime);
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00:00";
      controller.taskCompleted = true;
      localStorage.setItem('controller', JSON.stringify(controller))
      if (controller.mode === "math") {
        formatFinalMessage();
        displayEquation();
      } else if (controller.mode === "lang") {
        if (controller.modeChoice1 === "C50") {
        formatFinalMessageForGrammar();
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

//TASK INFO COLLECTION START

async function sendTaskInfoToDatabase() {
    // Restore controller

    if (!controller) {
        const storedController = localStorage.getItem("controller");
        if (storedController) {
            try {
                controller = JSON.parse(storedController);
            } catch {
                controller = {};
            }
        }
    }

    // Prepare results
    const resultsData = [
        [controller.answeredQuestionTracker || 0, controller.mistakesTracker || 0],
        controller.currentMistakes || []
    ];

    // Task info template
    let taskInfo = {
        "userClass": -1,
        "lang": false,
        "math": false,
        "C1": false,
        "C2": false,
        "C3": false,
        "C4": false,
        "C5": false,
        "C6": false,
        "C7": false,
        "C8": false,
        "C9": false,
        "C10": false,
        "C11": false,
        "C12": false,
        "C13": false,
        "C14": false,
        "C15": false,
        "C16": false,
        "C17": false,
        "C18": false,
        "C19": false,
        "C20": false,
        "C21": false,
        "C22": false,
        "C23": false,
        "C24": false,
        "C25": false,
        "C26": false,
        "C27": false,
        "C28": false,
        "C29": false,
        "C30": false,
        "C31": false,
        "C32": false,
        "C33": false,
        "C34": false,
        "C35": false,
        "C36": false,
        "C37": false,
        "C38": false,
        "C41": false,
        "C42": false,
        "C47": false,
        "C48": false,
        "C49": false,
        "C50": false,
        "C51": false,
        "C52": false,
        "C58": false,
        "C59": false,
        "C60": false,
        "C75": false,
        "C76": false,
        "C77": false,
        "C80": false,
        "C81": false,
        "C82": false,
        "remainder": false,
        "mult-table-selection": [],
        "correct-ans": 0,
        "total-ans": 0
    };

    // Restore user class
    const storedClass = localStorage.getItem("userClassV2");
    if (storedClass) {
        try {
            taskInfo.userClass = JSON.parse(storedClass).value;
        } catch {
            taskInfo.userClass = -1;
        }
    }

    // Mark C-flags from controller values
    for (let key in controller) {
        const val = controller[key];
        if (taskInfo.hasOwnProperty(val)) {
            taskInfo[val] = true;
        }
    }

    if (controller.withRemainder) {
        taskInfo.remainder = true;
    }

    if (controller.modeChoice2 === "C18") {
        taskInfo["mult-table-selection"] = controller.selectedNumbers || [];
    }

    // Calculate correctness
    let correctAnswers = 0;
    let totalAnswers = 0;

    if (controller.mode === "lang") {
        if (controller.modeChoice1 === "C49") {
            let totalTexts = 0;
            let textsWithoutError = 0;
            resultsData[1].forEach(([outerKey, value]) => {
                totalTexts++;
                if (value === 0) textsWithoutError++;
            });
            correctAnswers = textsWithoutError;
            totalAnswers = totalTexts;
        } else if (controller.modeChoice1 === "C50") {
            correctAnswers = resultsData[0][0] - resultsData[0][1];
            totalAnswers = resultsData[0][0];
        }
        taskInfo["C47"] = false;
        taskInfo["C48"] = false;
        taskInfo["remainder"] = false;
    } else if (controller.mode === "math") {
        correctAnswers = resultsData[0][0] - resultsData[0][1];
        totalAnswers = resultsData[0][0];
        taskInfo["C49"] = false;
        taskInfo["C50"] = false;
        taskInfo["C51"] = false;
        taskInfo["C52"] = false;
        taskInfo["C58"] = false;
        taskInfo["C59"] = false;
        taskInfo["C60"] = false;
        taskInfo["C75"] = false;
        taskInfo["C76"] = false;
        taskInfo["C80"] = false;
        taskInfo["C81"] = false;
        taskInfo["C82"] = false;
    }

    taskInfo["correct-ans"] = correctAnswers;
    taskInfo["total-ans"] = totalAnswers;

    // Send to server
    //https://sudedu-server.onrender.com/record
   try {
        const response = await fetch("https://sudedu-task-info-server.onrender.com/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskInfo)
        });
    } catch (error) {
        console.error("Error saving task results:", error);
    }
}

//TASK INFO COLLECTION END

function messageToTheUser(message, errorMessage = true) {
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
    const autoClose = setTimeout(closePopup, 6000);

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
function showCustomConfirm(text, onConfirm, item=null) {
      const modal = document.getElementById('customConfirmModal');
      const modalText = document.getElementById('customModalText');
      const yesBtn = document.getElementById('customConfirmYes');
      const noBtn = document.getElementById('customConfirmNo');

      // Set text
      modalText.textContent = text;

      // Show modal
      modal.style.display = 'flex';

      // Remove previous click handlers
      yesBtn.onclick = null;
      noBtn.onclick = null;

      // Yes click
      yesBtn.onclick = () => {
          if (item !== undefined && item !== null) {
            onConfirm(item);
          } else {
            onConfirm();
          }
          modal.style.display = 'none';
      };

      // No click
      noBtn.onclick = () => {
          modal.style.display = 'none';
      };
  }
