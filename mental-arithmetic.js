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
	correctAnswerTracker: 0,
  questionsStopped: false
}

const fireworksDiv = document.querySelector('#fireworks-div');
let upperLineElement = document.querySelector('.upper-line');
let previousEquationElement = document.querySelector('.previous-equation');
let answerTrackerElement = document.querySelector('#answer-tracker');
let mistakeTrackerElement = document.querySelector('#mistake-tracker');
let stulpeliuDivElement = document.querySelector('#stulpeliu-div');
let divisionStulp1Element = document.querySelector('#division-stulp-1');
let divisionStulp2Element = document.querySelector('#division-stulp-2');
let divisionStulp3Element = document.querySelector('#division-stulp-3');
let divisionStulp4Element = document.querySelector('#division-stulp-4')
let arithmeticSymbol = document.querySelector('#arithmetic-symbol');
let answerFieldDivInvisibleDiv = document.querySelector('#answer-field-div-invisible-div');


	function formEquation () {
    let remainingTime = parseInt(localStorage.getItem('remainingTime'));
    if (controller.modeChoice4 === 'timer') {
      if (controller.combinations.length === 0 && remainingTime > 0 && !controller.questionsStopped) {
        generateCombinations()
      }
      if (controller.combinations.length > 0 && remainingTime > 0 && !controller.questionsStopped) {
        formatEquation()
      }
      if (remainingTime <= 0) {
        formatFinalMessage()
      }
    } else if (controller.modeChoice4 === 'questionNumber') {
      if (controller.combinations.length === 0 && controller.correctAnswerTracker < controller.questionNumber && !controller.questionsStopped) {
        generateCombinations()
        if (controller.combinations.length > controller.questionNumber - controller.correctAnswerTracker) {
          controller.combinations = controller.combinations.slice(0, controller.questionNumber - controller.correctAnswerTracker);
        }
      }
      if (controller.combinations.length > 0 && controller.correctAnswerTracker < controller.questionNumber && !controller.questionsStopped) {
        formatEquation()
      }
      if (controller.correctAnswerTracker === controller.questionNumber) {
        formatFinalMessage()
      }
    }
  
    function formatEquation () { 
    if (controller.result[0] === "Correct" && controller.result[1] === controller.randomSelection[0] && controller.result[2] === controller.randomSelection[1] || controller.randomSelection.length === 0) {
		controller.randomSelection = controller.combinations[Math.floor(Math.random() * controller.combinations.length)];
    };
    if (controller.modeChoice5 === "skaitiniai") {
      if (controller.modeChoice7 === "eilute") {
        if (controller.randomSelection[2] === 'addition') {
          controller.equation = `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = `;
        } else if (controller.randomSelection[2] === 'subtraction') {
          controller.equation = `${controller.randomSelection[0]} - ${controller.randomSelection[1]} = `;
        } else if (controller.randomSelection[2] === 'multiplication') {
          controller.equation = `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = `;
        } else if (controller.randomSelection[2] === 'division') {
          if (controller.language === 'LT') {
            controller.equation = `${controller.randomSelection[0]} \uA789 ${controller.randomSelection[1]} = `;
          } else if (controller.language === 'EN') {
            controller.equation = `${controller.randomSelection[0]} \u00F7 ${controller.randomSelection[1]} = `;            
          }
        } 
      } else if (controller.modeChoice7 === "stulpeliu") {
        if (controller.randomSelection[2] === 'addition') {
        const maxLength = 20; // Adjust as needed
        const item1 = String(controller.randomSelection[0]);
        const item2 = String(controller.randomSelection[1]);
    
        // Pad the items with appropriate spaces to align them
        const paddedItem1 = item1.padStart(maxLength);
        const paddedItem2 = item2.padStart(maxLength);
    
        // Concatenate the padded items
        controller.equation = `<div class="demuo-turinys-ateminys" style="text-align: right;">${paddedItem1}</div><div class="demuo-turinys-ateminys" style="text-align: right;">${paddedItem2}</div>`;
        } else if (controller.randomSelection[2] === 'subtraction') {
        const maxLength = 20; // Adjust as needed
        const item1 = String(controller.randomSelection[0]);
        const item2 = String(controller.randomSelection[1]);
    
        // Pad the items with appropriate spaces to align them
        const paddedItem1 = item1.padStart(maxLength);
        const paddedItem2 = item2.padStart(maxLength);
    
        // Concatenate the padded items
        controller.equation = `<div class="demuo-turinys-ateminys" style="text-align: right;">${paddedItem1}</div><div class="demuo-turinys-ateminys" style="text-align: right;">${paddedItem2}</div>`;
      } else if (controller.randomSelection[2] === 'multiplication') {
        const maxLength = 0; // Adjust as needed
        const item1 = String(controller.randomSelection[0]);
        const item2 = String(controller.randomSelection[1]);
    
        // Pad the items with appropriate spaces to align them
        const paddedItem1 = item1.padStart(maxLength);
        const paddedItem2 = item2.padStart(maxLength);
    
        // Concatenate the padded items
        controller.equation = `<div class="daugiklis" style="text-align: right;">${paddedItem1}</div><div id="antras-daugiklis" class="daugiklis" style="text-align: right;">${paddedItem2}</div>`;
      } else if (controller.randomSelection[2] === 'division') {
        const item1 = String(controller.randomSelection[0]);
        const item2 = String(controller.randomSelection[1]);
    
        // Concatenate the padded items
        if (controller.modeChoice8 === "" || controller.modeChoice8 === 'eeu-version') {
          controller.equation = `<div id="dalinys-outer-div" style="display: flex; position: relative;"><div id='dalinys'>${item1}</div><div id='daliklis' style="border-bottom: 2px solid black; border-left: 2px solid black;">${item2}</div></div>`;
        } else if (controller.modeChoice8 === 'us-version') {
          controller.equation = `<div id="first-number-outer-div" style="display: flex; position: relative;"><div id='daliklis'>${item2}</div><div id='dalinys' style="border-top: 2px solid black; border-left: 2px solid black;">${item1}</div></div>`;
        }
      } 
    }
    } else if (controller.modeChoice5 === "nezinomieji") {
      if (controller.randomSelection[2] === 'addition') {
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
      } else if (controller.randomSelection[2] === 'subtraction') {
        
        if (controller.randomSelection[3]) {
          if (controller.randomSelection[3] === 'first') {
            controller.equation = ``;
            controller.equation2 = ` - ${controller.randomSelection[1]} = ${controller.randomSelection[0] - controller.randomSelection[1]}`
          } else if (controller.randomSelection[3] === 'second') {
            controller.equation = `${controller.randomSelection[0]} - `;
            controller.equation2 = `= ${controller.randomSelection[0] - controller.randomSelection[1]}`
          }
        } else {
          if (controller.modeChoice === 'visi' || controller.modeChoice === 'sudetis ir atimtis') {
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
          else if (controller.modeChoice6 === "turinys") {
            controller.randomSelection.push("first");
            controller.equation = ``;
            controller.equation2 = ` - ${controller.randomSelection[1]} = ${controller.randomSelection[0] - controller.randomSelection[1]}`;
          } else if (controller.modeChoice6 === 'ateminys') {
            controller.randomSelection.push("second");
            controller.equation = `${controller.randomSelection[0]} - `;
            controller.equation2 = `= ${controller.randomSelection[0] - controller.randomSelection[1]}`
          }
        }

      } else if (controller.randomSelection[2] === 'multiplication') {
        
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

      } else if (controller.randomSelection[2] === 'division') {
          if (controller.randomSelection[3]) {
            if (controller.randomSelection[3] === 'first') {
              controller.equation = ``;
              controller.equation2 = ` \uA789 ${controller.randomSelection[1]} = ${controller.randomSelection[0] / controller.randomSelection[1]}`
            } else if (controller.randomSelection[3] === 'second') {
              controller.equation = `${controller.randomSelection[0]} \uA789 `;
              controller.equation2 = `= ${controller.randomSelection[0] / controller.randomSelection[1]}`
            }
          } else {
            if (controller.modeChoice === 'visi' || controller.modeChoice === 'daugyba ir dalyba') {
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
            if (!controller.randomSelection[3] && controller.modeChoice6 === "dalinys") {
              controller.randomSelection.push("first");
              controller.equation = ``;
              controller.equation2 = ` \uA789 ${controller.randomSelection[1]} = ${controller.randomSelection[0] / controller.randomSelection[1]}`
            } else if (!controller.randomSelection[3] && controller.modeChoice6 === 'daliklis') {
              controller.randomSelection.push("second");
              controller.equation = `${controller.randomSelection[0]} \uA789 `;
              controller.equation2 = `= ${controller.randomSelection[0] / controller.randomSelection[1]}`
            }
          }
    }
  }

    }

    function formatFinalMessage () {
      document.querySelector('#invisibleRow').style.display = "none";
      if (!controller.questionsStopped && controller.mistakesTracker === 0 && controller.correctAnswerTracker >= 10) {
        triggerFireworks();
      }

      setFontSize();
      var contentContainerElement = document.getElementById('content-container');
      contentContainerElement.style.width = '100%';
      contentContainerElement.style.marginRight = '0';
			contentContainerElement.style.marginLeft = '0';
      
      if (controller.correctAnswerTracker / (controller.correctAnswerTracker + controller.mistakesTracker) >= 0.95) {
        if (controller.language === 'LT') {
          controller.equation = 'Puikiai skaičiuoji!';
        } else if (controller.language === 'EN') {
          controller.equation = 'Perfection! Well done!';          
        }
      } else if (controller.correctAnswerTracker / (controller.correctAnswerTracker + controller.mistakesTracker) >= 0.7) {
        if (controller.language === 'LT') {
          controller.equation = 'Tobulėji! Pirmyn!';
        } else if (controller.language === 'EN') {
          controller.equation = 'Very good! Well done!';          
        }
      } else if (controller.correctAnswerTracker / (controller.correctAnswerTracker + controller.mistakesTracker) >= 0.6) {
        if (controller.language === 'LT') {
          controller.equation = 'Mokaisi! Nesustok!';
        } else if (controller.language === 'EN') {
          controller.equation = "You're learning!";          
        }
      } else if (controller.correctAnswerTracker / (controller.correctAnswerTracker + controller.mistakesTracker)) {
        if (controller.language === 'LT') {
          controller.equation = 'Pasikartok su pagalba!';
        } else if (controller.language === 'EN') {
          controller.equation = "Ask for some help!";          
        }
      } else {
        if (controller.language === 'LT') {
          controller.equation = 'Bandyk dar kartą!';   
        } else if (controller.language === 'EN') {
          controller.equation = "Try again!";       
      }
    };
      controller.equation2 = '';
      controller.result = ['', '', '', '', ''];
      controller.questionsStopped = true;
      clearInterval(timerInterval);
      const stopButtonSpanElement = document.querySelector('#stop-button-span');
      stopButtonSpanElement.innerHTML = "refresh";
    }
    localStorage.setItem('controller', JSON.stringify(controller))
}


  function triggerFireworks () {
    fireworksDiv.innerHTML = '<img src="../../images/fireworks.gif" style="width: 500px; height: auto;" id="fireworks">';
    setTimeout(disableFireworks, 4500);
  }

  function disableFireworks () {
    fireworksDiv.innerHTML = '';
  }

  function updateScore () {
    controller = JSON.parse(localStorage.getItem('controller'));
    if (controller.modeChoice4 === 'timer') {
      if (controller.language === 'LT') {
        answerTrackerElement.innerHTML = `Atlikai: ${controller.correctAnswerTracker}`;
      } else if (controller.language === 'EN') {
        answerTrackerElement.innerHTML = `Answered: ${controller.correctAnswerTracker}`;        
      }
    } else if (controller.modeChoice4 === 'questionNumber') {
      if (controller.language === 'LT') {
        answerTrackerElement.innerHTML = `Atlikai: ${controller.correctAnswerTracker}/${controller.questionNumber}`;
      } else if (controller.language === 'EN') {
        answerTrackerElement.innerHTML = `Completed: ${controller.correctAnswerTracker}/${controller.questionNumber}`;     
      }
    }

    if (controller.language === 'LT') {
      mistakeTrackerElement.innerHTML = `Suklydai: ${controller.mistakesTracker}`;
    } else if (controller.language === 'EN') {
      mistakeTrackerElement.innerHTML = `Mistakes: ${controller.mistakesTracker}`;    
    }
    
    if (controller.modeChoice7 !== 'stulpeliu') {
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
    if (controller.modeChoice7 === 'stulpeliu' && controller.randomSelection[2] === 'division' && (controller.modeChoice8 === '' || controller.modeChoice8 === 'eeu-version')) {
				linkElement.setAttribute("href", "../../questions-stulpeliu-div.css");
		} else if (controller.modeChoice7 === 'stulpeliu' && controller.randomSelection[2] === 'division' && controller.modeChoice8 === 'us-version') {
				linkElement.setAttribute("href", "../../questions-stulpeliu-div-us.css");
		}  else if (controller.modeChoice7 === 'stulpeliu') {
			linkElement.setAttribute("href", "../../questions-stulpeliu.css");
      var answerSeparator2 = document.getElementById('answer-separator-2');
      answerSeparator2.style.display = 'block';
    } else if (controller.withRemainder) {
			linkElement.setAttribute("href", "../../questions-remainder.css");
		} else if (
      controller.modeChoice2 === "mil" ||
      controller.modeChoice2 === "iki1000000"
    )	{
    linkElement.setAttribute("href", "../../questions-extra-small.css");
    } else if (controller.modeChoice2 === "tukst" || 
    controller.modeChoice2 === "dtukst" || 
    controller.modeChoice2 === "iki1000" || 
    controller.modeChoice2 === "iki10000" || 
    controller.modeChoice2 === "pil10" || 
    controller.modeChoice2 === "pil100" ||
    controller.modeChoice2 === "pil" ||
    controller.modeChoice2 === "daugtrivien" ||
    controller.modeChoice2 === "daugketvien" ||
    controller.modeChoice2 === "daugdvidvi" ||
    controller.modeChoice2 === "daugtridvi" ||
    controller.modeChoice2 === "daugketdvi" ||
    controller.modeChoice2 === "daugdaug" ||
    controller.modeChoice2 === "gretnul" 
  ) {
			linkElement.setAttribute("href", "../../questions-smaller.css");
		} else {
      linkElement.setAttribute("href", "../../questions-bigger.css");
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

    if (controller.modeChoice7 === 'stulpeliu') {
      if (controller.randomSelection[2] === 'division') {
        if (controller.modeChoice8 === '' || controller.modeChoice8 === 'eeu-version') {
          equation2Element.style.display = "none";
          equationElement.innerHTML = controller.equation;
          equation2Element.innerHTML = '';
        } else if (controller.modeChoice8 === 'us-version') {
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
    } else if (controller.modeChoice5 === 'skaitiniai' || controller.withRemainder) {
      equation2Element.style.display = "none";
      equationElement.innerHTML = controller.equation;
      equation2Element.innerHTML = '';
      contentContainerElement.style.visibility = 'visible';
    } else if (controller.modeChoice5 === 'nezinomieji') {
      equationElement.innerHTML = controller.equation;
      equation2Element.style.display = "block";
      equation2Element.innerHTML = controller.equation2;
      contentContainerElement.style.visibility = 'visible';
    };


    if (controller.withRemainder && controller.randomSelection[2] === "division" && controller.modeChoice7 !== 'stulpeliu') {
      mainRemainderField.style.display = 'block';
    }

    if (controller.modeChoice7 === 'stulpeliu') {
      // Need to adjust the modofier
      fontSizeFullREM = 3*1.3;
      stulpeliuDivElement.innerHTML = '';
      divisionStulp1Element .innerHTML = '';
      divisionStulp2Element .innerHTML = '';

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
    } else if (controller.randomSelection[2] === 'addition') {
      arithmeticSymbol.innerHTML = '+';
    } else if (controller.randomSelection[2] === 'subtraction') {
      arithmeticSymbol.innerHTML = '-';
    } else if (controller.randomSelection[2] === 'multiplication') {
      arithmeticSymbol.innerHTML = `\u00D7`;
    } else if (controller.randomSelection[2] === 'division') {
      arithmeticSymbol.innerHTML = ``;
    } 
      
   if (controller.randomSelection[2] === 'multiplication') {
    
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
              stulpeliuDivElement.innerHTML += '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-right: 0; margin-bottom: 10px;"><input type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></div>';
            } else {
            stulpeliuDivElement.innerHTML += '<div style="position: relative;"><div class="stulpeliu-symbol" style="position: absolute; left: calc((-0.65 * 3rem) + ' + (i*fontSizeFullREM*-0.9) + 'px); top: ' + -100 + '%;">+</div><div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-right: calc(' + fontSizeFullREM*0.9 + 'rem * (' + (i) + ')) !important; margin-bottom: 10px;"><input type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></div></div>';
            }
        }
    }
  }
  }

  if (controller.randomSelection[2] === 'division') {
    
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
      let number1 = controller.randomSelection[0];
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
            } else {
              subtract = [Math.floor(Number(number1.toString().slice(0, daliklisDigits)) / number2) * number2, false]; 
              stopAddingTwoExtraDigits = false;  
            }
            } else if (Number(number1) === number2) {
              subtract = [number1, false];
            } else if (Number(number1) < number2) {
              subtract = [0, false];
            }
            if (i > 1) {
              if (subtract[1]) {
                interSplitNumber1Str = number1.toString().slice(0, daliklisDigits+1);
              } else {
                interSplitNumber1Str = number1.toString().slice(0, daliklisDigits)
              }
              if (interSplitNumber1Str.length > subtract[0].toString.length && !halfpush) {
                tempOffset = 1 * (interSplitNumber1Str.length - subtract[0].toString().length);
              }
            }
            counter++;
        }

        if (controller.modeChoice8 === '' || controller.modeChoice8 === 'eeu-version') {

        if (i === 0) {
          divisionStulp1Element.innerHTML += '<div style="position: relative;"><div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-underline" style="margin-left: calc(' + fontSizeFullREM*0.9 + 'rem * (' + (offset) + ')) !important;"><input type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></div></div>';
          var dalinysOuterDivElement = document.getElementById('dalinys-outer-div');
          dalinysOuterDivElement.innerHTML += '<div style="position: absolute; left: calc((-1.5 * 1.95rem) + ' + (offset)*47 + 'px); top: 40% !important" class="stulpeliu-symbol-div">-</div>';
        } else {
          if (counter !== 0) {
            divisionStulp2Element.innerHTML += '<div class="d-flex justify-content-center align-items-center"><div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub stulpeliu-field-underline" style="margin-bottom: 10px; margin-left: calc(' + fontSizeFullREM*0.9 + 'rem * (' + (offset+tempOffset) + ')) !important;"><input type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></div><div class="invisibleDiv" style="visibility: hidden; display: block;"></div></div>';
          } else if (i+1 !== subAnswerNumber*2) {
            divisionStulp2Element.innerHTML += '<div class="d-flex justify-content-center align-items-center">' +
            '<div style="position: relative;">' +
            '<div style="position: absolute; left: calc((-1.5 * 1.5rem) + ' + (offset)*60 + 'px);" class="stulpeliu-symbol-div">-</div>' +
            '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px; margin-left: calc(' + fontSizeFullREM*0.9 + 'rem * (' + (offset+tempOffset) + ')) !important;">' +
            '<input type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off">' +
            '</div>' +
            '</div>' +
            '<div class="invisibleDiv" style="visibility: hidden; display: block;"></div>' +
            '</div>';
          } else {
            if (controller.language === 'LT') {
              divisionStulp2Element.innerHTML += '<div class="d-flex justify-content-center align-items-center">' +
              '<div style="position: relative;">' +
              '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px; margin-left: calc(' + fontSizeFullREM*0.9 + 'rem * (' + (offset+tempOffset) + ')) !important;">' +
              '<input type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off">' +
              '</div>' +
              '</div>' +
              '<div id="liek" class="invisibleDiv" style="visibility: hidden; display: block;">(liek.)</div>' +
              '</div>';
            } else {
              divisionStulp2Element.innerHTML += '<div class="d-flex justify-content-center align-items-center">' +
              '<div style="position: relative;">' +
              '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px; margin-left: calc(' + fontSizeFullREM*0.9 + 'rem * (' + (offset+tempOffset) + ')) !important;">' +
              '<input type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off">' +
              '</div>' +
              '</div>' +
              '<div id="liek" class="invisibleDiv" style="visibility: hidden; display: block;">(remainder)</div>' +
              '</div>';
            }
          }
    }
  } else if (controller.modeChoice8 === "us-version") {

    answerFieldDivInvisibleDiv.innerHTML += '<div class="invisibleDiv" style="visibility: hidden; display: block;"></div>';

    if (i === 0) {
      divisionStulp3Element.innerHTML += '<div class="d-flex justify-content-center align-items-center"><div class="invisibleDiv" style="visibility: hidden; display: block;"></div><div style="position: relative;"><div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub stulpeliu-field-underline" style="margin-bottom: 10px; margin-left: calc(' + fontSizeFullREM*0.9 + 'rem * (' + (offset+tempOffset) + ')) !important;"> <div style="position: absolute; transform: translatex(-150%); top: -14%" class="stulpeliu-symbol-div">-</div><input type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off"></div></div></div>';
    } else {
      if (counter !== 0) {
        divisionStulp4Element.innerHTML += `
        <div class="d-flex justify-content-center align-items-center">
          <div class="invisibleDiv" style="visibility: hidden; display: block;"></div>
          <div style="position: relative;">
            <div id="stulpeliu-field-${i}" class="stulpeliu-field stulpeliu-field-sub stulpeliu-field-underline" style="margin-bottom: 10px; margin-left: calc(${fontSizeFullREM * 0.9}rem * (${offset + tempOffset})) !important;">
              <div style="position: absolute; transform: translatex(-150%); top: -14%" class="stulpeliu-symbol-div">-</div>
              <input type="text" id="stulpeliu-${i}" name="stulpeliu-${i}" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off">
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
              <input type="text" id="stulpeliu-${i}" name="stulpeliu-${i}" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off">
            </div>
          </div>
        </div>
      `;
      
      } else {
        divisionStulp4Element.innerHTML += '<div class="d-flex justify-content-center align-items-center">' +
        '<div id="liek" class="invisibleDiv" style="visibility: hidden; display: block;"></div>' +
        '<div style="position: relative;">' +
        '<div id="stulpeliu-field-' + i + '" class="stulpeliu-field stulpeliu-field-sub" style="margin-bottom: 10px; margin-left: calc(' + fontSizeFullREM*0.9 + 'rem * (' + (offset+tempOffset) + ')) !important;">' +
        '<input type="text" id="stulpeliu-' + i + '" name="stulpeliu-' + i + '" class="form-control text-center stulpeliu-input" placeholder="" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '</div>';
      }
}
  }
    


    }
}
}
    if (controller.randomSelection[2] !== 'division') {
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

    
    if (controller.modeChoice7 === 'stulpeliu') {
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
      upperLineElement.setAttribute("style", "background-color: #D57E7E")
    } else if (controller.result[0] === 'Correct') {
      upperLineElement.setAttribute("style", "background-color: #B6C867")
    } else {
      upperLineElement.setAttribute("style", "background-color: #FAEDCD")
    };
    previousEquationElement.innerHTML = controller.result[4];
    updateScore();
    clearAnswerField();
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
          element.setAttribute("style", "background-color: #D57E7E")
          clearTimeout(timeoutReference);
          removeError(element)
          element.classList.add('error')
          var timeoutReference = setTimeout(function() {
            removeError(element);
        }, 500);
        } else if (corectness === true) {
          element.setAttribute("style", "background-color: #B6C867")
        } else {
          element.setAttribute("style", "background-color: #FAEDCD")
        };
      }

      function flipNumber(number) {
        var output = number.split('').reverse().join('');
        return Number(output);
    }

    if (controller.modeChoice7 === "stulpeliu") {
      if (controller.randomSelection[2] === 'multiplication') {

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
        controller.correctAnswerTracker++;
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\u00D7", `${controller.randomSelection[0]} \u00D7 ${controller.randomSelection[1]} = ${flipNumber(userInput)}`];
        controller.mistakesTracker++;
        recordMistakes(); 
      }
    
    
    } else if (controller.randomSelection[2] === 'division') {
      var expectedAnswer = Math.floor(controller.randomSelection[0] / controller.randomSelection[1]);
      var isCorrect = true;
    
      if (Number(userInput) !== expectedAnswer) {
        isCorrect = false;
      } 
      answerFieldColor(answerInputElement, isCorrect);

      if (controller.modeChoice8 === 'us-version' && controller.withRemainder === true) {
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
        controller.correctAnswerTracker++;
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], ":", `${controller.randomSelection[0]} ${divisionSymbol} ${controller.randomSelection[1]} = ${userInput}`];
        controller.mistakesTracker++;
        recordMistakes(); 
      }

    } else if (controller.randomSelection[2] === 'addition') {
      if (flipNumber(userInput) === controller.randomSelection[0] + controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.correctAnswerTracker++;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
        isCorrect = false;
        controller.mistakesTracker++;
        recordMistakes(); 
      }
      answerFieldColor(answerInputElement, isCorrect);
     } else if (controller.randomSelection[2] === 'subtraction') {
      if (flipNumber(userInput) === controller.randomSelection[0] - controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.correctAnswerTracker++;
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
     } else if (controller.modeChoice5 === "skaitiniai") {
    if (controller.randomSelection[2] === 'addition') {
      if (userAnswer === controller.randomSelection[0] + controller.randomSelection[1]) {
        controller.combinations.splice(indexToRemove, 1);
        controller.correctAnswerTracker++;
        controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
      } else {
        controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+", `${controller.randomSelection[0]} + ${controller.randomSelection[1]} = ${userAnswer}`];
        isCorrect = false;
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
        isCorrect = false;
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
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      } else if (controller.randomSelection[2] === 'division') {
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
          controller.correctAnswerTracker++;
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
    } else if (controller.modeChoice5 === "nezinomieji") {
      if (controller.randomSelection[2] === 'addition') {
        if (controller.randomSelection[3] === "first") {
          if (userAnswer === controller.randomSelection[0]) {
            controller.correctAnswerTracker++;
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
            controller.correctAnswerTracker++;
            controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "+ second", `${controller.randomSelection[0]} + ${userAnswer} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
            controller.combinations.splice(indexToRemove, 1);
          } else {
            controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "+ second", `${controller.randomSelection[0]} + ${userAnswer} = ${controller.randomSelection[0] + controller.randomSelection[1]}`]; 
            isCorrect = false;
            controller.mistakesTracker++;
            recordMistakes(); 
          }
        }
    } else if (controller.randomSelection[2] === 'subtraction') {
      if (controller.randomSelection[3] === "first") {
        if (userAnswer === controller.randomSelection[0]) {
          controller.correctAnswerTracker++;
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
          controller.correctAnswerTracker++;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "- second", `${controller.randomSelection[0]} - ${userAnswer} = ${controller.randomSelection[0] - controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "- second", `${controller.randomSelection[0]} - ${userAnswer} = ${controller.randomSelection[0] - controller.randomSelection[1]}`];  
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      }
    } else if (controller.randomSelection[2] === 'multiplication') {
      if (controller.randomSelection[3] === "first") {
        if (userAnswer === controller.randomSelection[0]) {
          controller.correctAnswerTracker++;
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
          controller.correctAnswerTracker++;
          controller.result = ["Correct", controller.randomSelection[0], controller.randomSelection[1], "\u00D7 first", `${controller.randomSelection[0]} \u00D7 ${userAnswer} = ${controller.randomSelection[0] * controller.randomSelection[1]}`]; 
          controller.combinations.splice(indexToRemove, 1);
        } else {
          controller.result = ["Incorrect", controller.randomSelection[0], controller.randomSelection[1], "\u00D7 first", `${controller.randomSelection[0]} \u00D7 ${userAnswer} = ${controller.randomSelection[0] * controller.randomSelection[1]}`];  
          isCorrect = false;
          controller.mistakesTracker++;
          recordMistakes(); 
        }
      }
  } else if (controller.randomSelection[2] === 'division') {

    divisionSymbol = ''
    if (controller.language === 'EN') {
      divisionSymbol = '\u00F7';
    } else if (controller.language === 'LT') {
      divisionSymbol = '\uA789';
    }

    if (controller.randomSelection[3] === "first") {
      if (userAnswer === controller.randomSelection[0]) {
        controller.correctAnswerTracker++;
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
        controller.correctAnswerTracker++;
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
    controller.currentMistakes.push(controller.randomSelection)
    while (controller.totalMistakes.length > 29) {
      controller.totalMistakes.splice(0, 1)
    }
    controller.totalMistakes.push(controller.randomSelection)
  }
    localStorage.setItem('controller', JSON.stringify(controller));


    if (isCorrect || controller.modeChoice7 !== "stulpeliu") {
      formEquation();
      displayEquation();
      answerInputElement.setAttribute("style", "background-color: #FAEDCD")
      answerRemainderWesternInputElement.setAttribute("style", "background-color: #FAEDCD")
    } else {
      updateScore();
      setMargins();
    }
  }

  function restartEquations () {	
    disableFireworks();
    equationElement.style.fontSize = '';
    equationElement.style.paddingTop = '0rem';
    equationElement.style.paddingBottom = '6px';
    document.querySelector('#invisibleRow').style.display = "block";
    controller.currentMistakes = [];
    generateCombinations();
    if (controller.combinations.length > controller.questionNumber) {
      controller.combinations = controller.combinations.slice(0, controller.questionNumber);
    }
    answerInputElement.value = '';
    answerRemainderInputElement.value = '';
    answerInputElement.setAttribute("style", "background-color: #FAEDCD");
    if (controller.modeChoice8 === 'us-version') {
    answerRemainderWesternInputElement.value = '';
    answerRemainderWesternInputElement.setAttribute("style", "background-color: #FAEDCD");
    }
    controller.result = ['', '', '', '', ''];
    controller.equation = '';
    controller.equation2 = '';
    controller.mistakesTracker = 0;
    controller.correctAnswerTracker = 0;
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
    if (controller.modeChoice4 === 'timer') {
      countDown();
    } else if (controller.modeChoice4 === 'questionNumber') {
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

  function stopEquations () {
    const stopButtonSpanElement = document.querySelector('#stop-button-span');
    if (stopButtonSpanElement.innerHTML === "close") {
      var answerSeparator1 = document.getElementById('answer-separator-1');
      var answerSeparator2 = document.getElementById('answer-separator-2');
      var contentContainerElement = document.getElementById('content-container');

      contentContainerElement.style.width = '100%';
      contentContainerElement.style.marginRight = '0';
			contentContainerElement.style.marginLeft = '0';
      contentContainerElement.style.paddingLeft = 0 + 'px';
			contentContainerElement.style.paddingRight = 0 + 'px';

      answerSeparator1.style.display = 'none';
      answerSeparator2.style.display = 'none';
      arithmeticSymbol.innerHTML = '';
      
      setFontSize();
    
      if (controller.correctAnswerTracker / (controller.correctAnswerTracker + controller.mistakesTracker) >= 0.95) {
        if (controller.language === 'LT') {
          controller.equation = 'Puikiai skaičiuoji!';
        } else if (controller.language === 'EN') {
          controller.equation = 'Perfection! Well done!';          
        }
      } else if (controller.correctAnswerTracker / (controller.correctAnswerTracker + controller.mistakesTracker) >= 0.7) {
        if (controller.language === 'LT') {
          controller.equation = 'Tobulėji! Pirmyn!';
        } else if (controller.language === 'EN') {
          controller.equation = 'Very good! Well done!';          
        }
      } else if (controller.correctAnswerTracker / (controller.correctAnswerTracker + controller.mistakesTracker) >= 0.6) {
        if (controller.language === 'LT') {
          controller.equation = 'Mokaisi! Nesustok!';
        } else if (controller.language === 'EN') {
          controller.equation = "You're learning!";          
        }
      } else if (controller.correctAnswerTracker / (controller.correctAnswerTracker + controller.mistakesTracker)) {
        if (controller.language === 'LT') {
          controller.equation = 'Pasikartok su pagalba!';
        } else if (controller.language === 'EN') {
          controller.equation = "Ask for some help!";          
        }
      } else {
        if (controller.language === 'LT') {
          controller.equation = 'Bandyk dar kartą!';   
        } else if (controller.language === 'EN') {
          controller.equation = "Try again!";       
      }
    }

    controller.equation2 = '';
    controller.result = ['', '', '', '', ''];
    controller.combinations = [];
    controller.randomSelection = []; 
    controller.questionsStopped = true;

    document.querySelector('#invisibleRow').style.display = "none";
    document.querySelector('.answer-field-div').style.display = "none";
    questionsSubmitButtonRowElement.style.display = "none";
    resetMistakeButtonsElement.style.display = "flex";
    localStorage.setItem('controller', JSON.stringify(controller))
    clearInterval(timerInterval);
    displayEquation()
    stopButtonSpanElement.innerHTML = "refresh";
  } else if (stopButtonSpanElement.innerHTML === "refresh") {
    stopButtonSpanElement.innerHTML = "close";
    restartEquations();
  }
}

function redirectToIntermediate() {
  window.location.href = "./pasirinkimai";
}

  function redirectToQuestions() {
    window.location.href = "./veiksmai";
  }

  function redirectToIndex() {
    localStorage.setItem('controller', JSON.stringify(controller))
    window.location.href = "./";
  }

  function redirectToOuterIndex() {
    localStorage.setItem('controller', JSON.stringify(controller))
    window.location.href = "../";
  }

  function redirectToSummary () {
    window.location.href = "./klaidos";
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
        if (mistake[3]) {
          if (mistake[3] === "first") {
              result = eval(`${first_number} ${parseOperator(action)} ${second_number}`);
              firstAsIs = `&#x25fb ${action}  ${second_number} = ${result}`;
          } else if (mistake[3] === "second") {
            result = eval(`${first_number} ${parseOperator(action)} ${second_number}`);
            firstAsIs = `${first_number} ${action} &#x25fb = ${result}`;
          }
        } else {
        firstAsIs = `${first_number} ${action} ${second_number} = &#x25fb`;
        swappedOrder = `${second_number} ${action} ${first_number} = &#x25fb`;
        }
      
        // Check if the action is "/" or "*" and update the accumulator accordingly
        if ((action === "\uA789" || action === "\u00D7") && (!mistake[3])) {
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
          Veiksmas: veiksmas,
          "Suklydai (kartai)": mistakes
      }));

      // Sort the data by Suklydai (kartai) in descending order
      summaryData.sort((a, b) => b["Suklydai (kartai)"] - a["Suklydai (kartai)"]);

      // Generate the summary table HTML
      const summaryTable = document.createElement("table");
      if (controller.language === 'LT') {
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
      }

      // Display the summary table
      const summaryTableElement = document.getElementById("summary-table");
      summaryTableElement.innerHTML = "";
      summaryTableElement.appendChild(summaryTable);
  } else {
      // Display a message when there are no mistakes
      const summaryTableOuterDivElement = document.querySelector("#summary-table-outer-div");
      if (controller.language === 'LT') {
      summaryTableOuterDivElement.innerHTML = "<h2>Nėra klaidų!</h2>";
      } else if ((controller.language === 'EN')) {
        summaryTableOuterDivElement.innerHTML = "<h2>Nothing here!</h2>";
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
      formEquation();
      displayEquation();
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
