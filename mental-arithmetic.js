let controller = {
	currentMistakes: [],
	totalMistakes: [],
	mistakesTracker: 0,
	modeChoice: '',
	modeChoice2: '',
  modeChoice3: [],
  modeChoice4: '',
  modeChoice5: '',
  modeChoice6: '',
  timerLimit: 0,
  questionNumber: 0,
	selectedNumbers: [],
	randomSelection: [],
	combinations: [],
	equation: '',
  equation2: '',
  result: ['', '', '', '', ''],
	correctAnswerTracker: 0,
}

const fireworksDiv = document.querySelector('#fireworks-div');
let upperLineElement = document.querySelector('.upper-line');
let previousEquationElement = document.querySelector('.previous-equation');
let answerTrackerElement = document.querySelector('#answer-tracker');
let mistakeTrackerElement = document.querySelector('#mistake-tracker');


	function formEquation () {
    let remainingTime = parseInt(localStorage.getItem('remainingTime'));
    if (controller.modeChoice4 === 'timer') {
      if (controller.combinations.length === 0 && remainingTime > 0 && controller.equation !== 'Puiku!' && controller.equation !== 'Gerai!') {
        generateCombinations()
      }
      if (controller.combinations.length > 0 && remainingTime > 0 && controller.equation !== 'Puiku!' && controller.equation !== 'Gerai!') {
        formatEquation()
      }
      if (remainingTime <= 0) {
        formatFinalMessage()
      }
    } else if (controller.modeChoice4 === 'questionNumber') {
      if (controller.combinations.length === 0 && controller.correctAnswerTracker < controller.questionNumber && controller.equation !== 'Puiku!' && controller.equation !== 'Gerai!') {
        generateCombinations()
        if (controller.combinations.length > controller.questionNumber - controller.correctAnswerTracker) {
          controller.combinations = controller.combinations.slice(0, controller.questionNumber - controller.correctAnswerTracker);
        }
      }
      if (controller.combinations.length > 0 && controller.correctAnswerTracker < controller.questionNumber && controller.equation !== 'Puiku!' && controller.equation !== 'Gerai!') {
        formatEquation()
      }
      if (controller.correctAnswerTracker === controller.questionNumber) {
        formatFinalMessage()
      }
    }
  
    function formatEquation () { 
    console.log(controller.result)
    if (controller.result[0] === "Correct" && controller.result[1] === controller.randomSelection[0] && controller.result[2] === controller.randomSelection[1] || controller.randomSelection.length === 0) {
		controller.randomSelection = controller.combinations[Math.floor(Math.random() * controller.combinations.length)];
    };
    if (controller.modeChoice5 === "skaitiniai") {
		if (controller.randomSelection[2] === 'addition') {
			controller.equation = `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = `;
		} else if (controller.randomSelection[2] === 'subtraction') {
			controller.equation = `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = `;
		} else if (controller.randomSelection[2] === 'multiplication') {
			controller.equation = `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = `;
		} else if (controller.randomSelection[2] === 'division') {
			controller.equation = `${controller.randomSelection[0]} \uA789 ${controller.randomSelection[1]} = `;
    } 
    } else if (controller.modeChoice5 === "nezinomieji") {
      if (controller.randomSelection[2] === 'addition') {

        if (controller.randomSelection[3]) {
          if (controller.randomSelection[3] === 'first') {
            controller.equation = ``;
            controller.equation2 = ` + ${controller.randomSelection[0]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`
          } else if (controller.randomSelection[3] === 'second') {
            controller.equation = `${controller.randomSelection[0]} + `;
            controller.equation2 = `= ${controller.randomSelection[0] + controller.randomSelection[1]}`
          }
        } else {
          const randomNum = Math.random();
          if (randomNum < 0.5) {
          controller.randomSelection.push("first");
          controller.equation = ``;
          controller.equation2 = ` + ${controller.randomSelection[0]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`;
        } else {
          controller.randomSelection.push("second");
          controller.equation = `${controller.randomSelection[0]} + `;
          controller.equation2 = `= ${controller.randomSelection[0] + controller.randomSelection[1]}`;
        }
        }
      }
      } else if (controller.randomSelection[2] === 'subtraction') {
        controller.equation = `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = `;
      } else if (controller.randomSelection[2] === 'multiplication') {
        controller.equation = `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = `;
      } else if (controller.randomSelection[2] === 'division') {
        controller.equation = `${controller.randomSelection[0]} \uA789 ${controller.randomSelection[1]} = `;
    }
    } 

    function formatFinalMessage () {
      if (controller.equation !== 'Puiku!' && controller.mistakesTracker === 0 && controller.correctAnswerTracker > 0 ) {
        triggerFireworks();
      }
      controller.equation = 'Puiku!';
      controller.result = ['', '', '', '', ''];
      clearInterval(timerInterval);
    }
    localStorage.setItem('controller', JSON.stringify(controller))
}


  function triggerFireworks () {
    fireworksDiv.innerHTML = '<img src="images/fireworks.gif" style="width: 500px; height: auto;" id="fireworks">';
    setTimeout(disableFireworks, 4500);
  }

  function disableFireworks () {
    fireworksDiv.innerHTML = '';
  }

  function displayEquation () {
    controller = JSON.parse(localStorage.getItem('controller'));

    if (controller.modeChoice5 === 'skaitiniai') {
      controller.equation2 = '';
      equationPart1Element.innerHTML = '<label class="equation text-nowrap" for="answer-field"></label>'
      equationPart2Element.innerHTML = '<label class="equation_2 text-nowrap" for="answer-field"></label>'
    } else if (controller.modeChoice5 === 'nezinomieji') {
      if (controller.modeChoice6 ==='demuo') {
      equationPart1Element.innerHTML = '<label class="equation text-nowrap" for="answer-field"></label>'
      equationPart2Element.innerHTML = '<label class="equation_2 text-nowrap" for="answer-field"></label>'
      }
    }


    if (controller.equation === "Puiku!" || controller.equation === "Gerai!") {
      answerFieldDivElement.style.display = "none";
      questionsSubmitButtonElement.style.display = "none";
      resetMistakeButtonsElement.style.display = "flex";
    }



    document.querySelector('.equation').innerHTML = controller.equation;
    document.querySelector('.equation_2').innerHTML = controller.equation2;
    if (controller.result[0] === 'Incorrect') {
      upperLineElement.setAttribute("style", "background-color: #D57E7E")
    } else if (controller.result[0] === 'Correct') {
      upperLineElement.setAttribute("style", "background-color: #B6C867")
    } else {
      upperLineElement.setAttribute("style", "background-color: #FAEDCD")
    };
    previousEquationElement.innerHTML = controller.result[4];
    if (controller.modeChoice4 === 'timer') {
      answerTrackerElement.innerHTML = `Atsakei: ${controller.correctAnswerTracker}`;
    } else if (controller.modeChoice4 === 'questionNumber') {
      answerTrackerElement.innerHTML = `Atsakei: ${controller.correctAnswerTracker}/${controller.questionNumber}`;
    }
    mistakeTrackerElement.innerHTML = `Suklydai: ${controller.mistakesTracker}`;
    answerInputElement.focus();
  }

  function checkAnswer () {
    userAnswer = Number(answerInputElement.value);
    const indexToRemove = controller.combinations.findIndex(
      (item) =>
        item[0] === controller.randomSelection[0] &&
        item[1] === controller.randomSelection[1] &&
        item[2] === controller.randomSelection[2]
    );
    if (controller.modeChoice5 === "skaitiniai") {
    if (controller.randomSelection[2] === 'addition') {
      if (userAnswer === controller.randomSelection[0] + controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.correctAnswerTracker++;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
        controller.mistakesTracker++;
        recordMistakes(); 
      }
     } else if (controller.randomSelection[2] === 'subtraction') {
      if (userAnswer === controller.randomSelection[0] - controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.correctAnswerTracker++;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "-", `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "-", `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = ${userAnswer}`];
        controller.mistakesTracker++;
        recordMistakes(); 
      }
      } else if (controller.randomSelection[2] === 'multiplication') {
        if (userAnswer === controller.randomSelection[0] * controller.randomSelection[1]) {
          controller.combinations.splice(indexToRemove, 1);
          controller.correctAnswerTracker++;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7", `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = ${userAnswer}`];
        } else {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\u00D7", `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = ${userAnswer}`];
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      } else if (controller.randomSelection[2] === 'division') {
        if (userAnswer === controller.randomSelection[0] / controller.randomSelection[1]) {
          controller.combinations.splice(indexToRemove, 1);
          controller.correctAnswerTracker++;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\uA789", `${controller.randomSelection[0]} \uA789 ${controller.randomSelection[1]} = ${userAnswer}`];
        } else {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\uA789", `${controller.randomSelection[0]} \uA789 ${controller.randomSelection[1]} = ${userAnswer}`];
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      }
    } else if (controller.modeChoice5 === "nezinomieji") {
      if (controller.randomSelection[2] === 'addition') {
        if (userAnswer + controller.randomSelection[0] === controller.randomSelection[0] + controller.randomSelection[1]) {
          controller.correctAnswerTracker++;
          console.log(controller.randomSelection)
          if (controller.randomSelection[3] === "first") {
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+ first", `${userAnswer} + ${controller.randomSelection[0]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
          } else if (controller.randomSelection[3] === "second") {
            controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+ second", `${controller.randomSelection[0]} + ${userAnswer} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
          }
          controller.combinations.splice(indexToRemove, 1);
        } else {
          if (controller.randomSelection[3] === "first") {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+ first", `${userAnswer} + ${controller.randomSelection[0]} = ${controller.randomSelection[0] + controller.randomSelection[1]}`];
        } else if (controller.randomSelection[3] === "second") {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+ second", `${controller.randomSelection[0]} + ${userAnswer} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
        }
          controller.mistakesTracker++;
          recordMistakes(); 
      } 
    }
  }
      

        function recordMistakes () {
        while (controller.currentMistakes.length > 29) {
          controller.currentMistakes.splice(0, 1)
        }
        controller.currentMistakes.push(controller.randomSelection)
        while (controller.totalMistakes.length > 29) {
          controller.totalMistakes.splice(0, 1)
        }
        controller.totalMistakes.push(controller.randomSelection)
      }
    localStorage.setItem('controller', JSON.stringify(controller))
    formEquation();
    displayEquation();
  }

  function restartEquations () {
    controller.currentMistakes = [];
    generateCombinations();
    if (controller.combinations.length > controller.questionNumber) {
      controller.combinations = controller.combinations.slice(0, controller.questionNumber);
    }
    controller.result = ['', '', '', '', ''];
    controller.equation = '';
    controller.equation2 = '';
    controller.mistakesTracker = 0;
    controller.correctAnswerTracker = 0;
    controller.randomSelection = [];
    answerFieldDivElement.style.display = "flex";
    questionsSubmitButtonElement.style.display = "flex";
    resetMistakeButtonsElement.style.display = "none";
    answerInputElement.style.display = "flex";
    if (localStorage.getItem("startTime")) {
      localStorage.removeItem("startTime");
    };
    if (localStorage.getItem("remainingTime")) {
      localStorage.removeItem("remainingTime");
    };
    if (controller.modeChoice4 === 'timer') {
      countDown();
    } else if (controller.modeChoice4 === 'questionNumber') {
      startTimer()
    }
    formEquation();
    displayEquation();
    disableFireworks();
  }

  function stopEquations () {
    if (controller.equation !== 'Puiku!') {
    controller.equation = 'Gerai!';
    controller.result = ['', '', '', '', ''];
    controller.combinations = [];
    controller.randomSelection = []; 

    document.querySelector('.answer-field-div').style.display = "none";
    questionsSubmitButtonElement.style.display = "none";
    resetMistakeButtonsElement.style.display = "flex";
    localStorage.setItem('controller', JSON.stringify(controller))
    clearInterval(timerInterval);
    displayEquation()
  }
}

function redirectToIntermediate() {
  window.location.href = "intermediate.html";
}

  function redirectToQuestions() {
    window.location.href = "questions.html";
  }

  function redirectToIndex() {
    localStorage.setItem('controller', JSON.stringify(controller))
    window.location.href = "index.html";
  }
  function redirectToSummary () {
    window.location.href = "summary.html";
  }

 // Function to calculate bar color based on the number of mistakes
function getBarColor(value) {
  if (value < 3) {
      return "#B6C867";
  } else if (value <= 6) {
      return "#E7B10A";
  } else {
      return "#D57E7E";
  }
}

// Function to generate the summary table
function generateSummaryTable(type) {
  controller = JSON.parse(localStorage.getItem('controller'));
  mistakes = [];
  if (type === 'total') {
    mistakes = controller.totalMistakes;
  } else if (type === 'current') {
    mistakes = controller.currentMistakes;
  };

  if (mistakes.length > 0) {
      // Group the data and calculate the number of mistakes for each action and pair of numbers
      const performanceData = mistakes.reduce((acc, mistake) => {
        const first_number = mistake[0];
        const second_number = mistake[1];
        let action = '';
        if (mistake[2] === "addition") {
          action = '+';
        } else if (mistake[2] === "subtraction") {
          action = '-';
        } else if (mistake[2] === "multiplication") {
          action = '\u00D7';
        } else if (mistake[2] === "division") {
          action = '\uA789';
        }
        
      
        // If action is "/" or "*", create both order variations for first_number and second_number
        const firstAsIs = `${first_number} ${action} ${second_number}`;
        const swappedOrder = `${second_number} ${action} ${first_number}`;
      
        // Check if the action is "/" or "*" and update the accumulator accordingly
        if (action === "\uA789" || action === "\u00D7") {
          if (acc[firstAsIs]) {
            acc[firstAsIs] += 1;
          } else if (acc[swappedOrder]) {
            acc[swappedOrder] += 1;
          } else {
            acc[firstAsIs] = 1;
          }
        } else {
          // For other actions, follow the previous behavior
          const veiksmas = `${first_number} ${action} ${second_number}`;
          acc[veiksmas] = (acc[veiksmas] || 0) + 1;
        }
      
        return acc;
      }, {});

      // Convert the data to an array of objects
      const summaryData = Object.entries(performanceData).map(([veiksmas, mistakes]) => ({
          Veiksmas: veiksmas,
          "Suklydai (kartai)": mistakes
      }));

      // Sort the data by Suklydai (kartai) in descending order
      summaryData.sort((a, b) => b["Suklydai (kartai)"] - a["Suklydai (kartai)"]);

      // Generate the summary table HTML
      const summaryTable = document.createElement("table");
      summaryTable.innerHTML = `
          <tr>
              <th>Veiksmas</th>
              <th>Suklydai (kartai)</th>
              <th></th>
          </tr>
          ${summaryData
              .map(
                  (row) => `<div class="col-12 table-container">
                  <tr>
                      <td>${row["Veiksmas"]}</td>
                      <td>${row["Suklydai (kartai)"]}</td>
                      <td>
                          <div class="bar" style="width: ${Math.min(
                              row["Suklydai (kartai)"] * 10,
                              100
                          )}px; background-color: ${getBarColor(
                      row["Suklydai (kartai)"]
                  )};"></div>
                      </td>
                  </tr>
              `
              )
              .join("")}
      </div>`;

      // Display the summary table
      const summaryTableElement = document.getElementById("summary-table");
      summaryTableElement.innerHTML = "";
      summaryTableElement.appendChild(summaryTable);
  } else {
      // Display a message when there are no mistakes
      const summaryTableOuterDivElement = document.querySelector("#summary-table-outer-div");
      summaryTableOuterDivElement.innerHTML = "<h2>Nepadarei klaid&#x173;! &#x160;aunu!</h2>";
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
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00:00";
      localStorage.removeItem("remainingTime");
      formEquation();
      displayEquation();
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
