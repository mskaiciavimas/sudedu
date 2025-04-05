
let modeChoiceElement1 = document.querySelector('#mode_choice_1');
let numberLabel = document.querySelector('#number_label');
let modeChoice2Element = document.querySelector('#mode_choice_2');
let selectedNumberElement = document.querySelector('#selected_number');
let numberLabel2 = document.querySelector('#number_label_2');
let selectedNumber2Element = document.querySelector('#selected_number_2');
let remainderOptionElement = document.querySelector('#remainder-option');
let modeChoice3Element = document.querySelector('#mode_choice_3');
let modeChoice5Element = document.querySelector('#mode_choice_5');
let modeChoice6Element = document.querySelector('#mode_choice_6');
let modeChoice7Element = document.querySelector('#mode_choice_7');
let modeChoice14Element = document.querySelector('#mode_choice_14');

function toggleVisibility(element, isVisible) {
        if (isVisible) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }

    function handleModeChoiceChange() {
        let modeChoice1Selection = modeChoiceElement1.value;
        let modeChoice2Selection = modeChoice2Element.value;
        let modeChoice5Selection = modeChoice5Element.value;

        if (modeChoice5Selection === "C41") {
            toggleVisibility(modeChoice7Element, true);
            toggleVisibility(modeChoice14Element, true);
        } else {
            toggleVisibility(modeChoice7Element, false);
        }

        if (
                (modeChoice1Selection === "C4" || modeChoice1Selection === "C5" || modeChoice1Selection === "C6") && 
                (
                    modeChoice2Selection !== "C28" &&
                    modeChoice2Selection !== "C29" && 
                    modeChoice2Selection !== "C19" && 
                    modeChoice2Selection !== "C20" && 
                    modeChoice2Selection !== "C21" &&
                    modeChoice2Selection !== "C23" &&
                    modeChoice2Selection !== "C24" && 
                    modeChoice2Selection !== "C25" &&
                    modeChoice2Selection !== "C22" &&
                    modeChoice2Selection !== "C30" &&
                    modeChoice2Selection !== "C26" &&
                    modeChoice2Selection !== "C27" &&
                    modeChoice2Selection !== "C15" &&
                    modeChoice2Selection !== "C16"
                )
            ) {
            toggleVisibility(numberLabel, true);
            toggleVisibility(selectedNumberElement, true);
            toggleVisibility(numberLabel2, true);
            toggleVisibility(selectedNumber2Element, true);
            toggleVisibility(modeChoice3Element, false);
            toggleVisibility(modeChoice5Element, true);
        } else if (modeChoice1Selection === "C1" || modeChoice1Selection === "C2" || modeChoice1Selection === "C3") {
            toggleVisibility(numberLabel, false);
            toggleVisibility(selectedNumberElement, false);
            toggleVisibility(numberLabel2, false);
            toggleVisibility(selectedNumber2Element, false);
            toggleVisibility(modeChoice3Element, true);
            toggleVisibility(modeChoice5Element, true);
        } else {
            toggleVisibility(numberLabel, false);
            toggleVisibility(selectedNumberElement, false);
            toggleVisibility(numberLabel2, false);
            toggleVisibility(selectedNumber2Element, false);
            toggleVisibility(modeChoice3Element, false);
            toggleVisibility(modeChoice5Element, true);
        }
        if ((modeChoice1Selection === "C5" || modeChoice1Selection === "C6") && modeChoice2Selection === "C18") {
            toggleVisibility(remainderOptionElement, true);
        }
        else if (modeChoice1Selection === "C5" || modeChoice1Selection === "C6") {
            toggleVisibility(remainderOptionElement, true);
        }
        else {
            toggleVisibility(remainderOptionElement, false);
        }
        if (modeChoice1Selection === "C7") {
            toggleVisibility(modeChoice3Element, false);
        }
        if (modeChoice5Selection === "C41") {
            toggleVisibility(modeChoice6Element, false)
        } else if (modeChoice5Selection === "C42") {
            toggleVisibility(modeChoice6Element, true)					
        }
    }

function updateModeChoice2() {
    let modeChoice1Selection = modeChoiceElement1.value;
    let modeChoice2Selection = modeChoice2Element.value;

    modeChoice2Element.innerHTML = "";
    modeChoice6Element.innerHTML = "";

    if (modeChoice1Selection === "C1") {
        modeChoice2Element.innerHTML += '<option value="C8">1-DIGIT NUMBERS UP TO 10</option>';
        modeChoice2Element.innerHTML += '<option value="C9">1-DIGIT NUMBERS UP TO 20</option>';
        modeChoice2Element.innerHTML += '<option value="C10">2-DIGIT AND 1-DIGIT NUMBERS UP TO 20</option>';
        modeChoice2Element.innerHTML += '<option value="C11">2-DIGIT AND 1-DIGIT NUMBERS UP TO 100</option>';
        modeChoice2Element.innerHTML += '<option value="C12">2-DIGIT NUMBERS UP TO 100</option>';
        modeChoice2Element.innerHTML += '<option value="C13">SKAIČIŲ IKI 1 000</option>';
        modeChoice2Element.innerHTML += '<option value="C14">NUMBERS UP TO 10,000</option>';
        modeChoice2Element.innerHTML += '<option value="C15">NUMBERS UP TO 1,000,000</option>';
        modeChoice6Element.innerHTML += '<option value="C43">UNKNOWN ADDEND</option>';

    } else if (modeChoice1Selection === "C2") {
        modeChoice2Element.innerHTML += '<option value="C8">1-DIGIT NUMBERS UP TO 10</option>';
        modeChoice2Element.innerHTML += '<option value="C10">1-DIGIT FROM 2-DIGIT NUMBERS UP TO 20</option>';
        modeChoice2Element.innerHTML += '<option value="C11">1-DIGIT FROM 2-DIGIT NUMBERS UP TO 100</option>';
        modeChoice2Element.innerHTML += '<option value="C12">2-DIGIT NUMBERS UP TO 100</option>';
        modeChoice2Element.innerHTML += '<option value="C13">NUMBERS UP TO 1,000</option>';
        modeChoice2Element.innerHTML += '<option value="C14">NUMBERS UP TO 10,000</option>';
        modeChoice2Element.innerHTML += '<option value="C15">NUMBERS UP TO 1,000,000</option>';
        modeChoice2Element.innerHTML += '<option value="C16">WHEN MINUEND CONTAINS ADJACENT ZEROS</option>';
        modeChoice6Element.innerHTML += '<option value="C43">UNKNOWN MINUEND</option>';
        modeChoice6Element.innerHTML += '<option value="C44">UNKNOWN SUBTRAHEND </option>';

    } else if (modeChoice1Selection === "C3") {
        modeChoice2Element.innerHTML += '<option value="C8">1-DIGIT NUMBERS UP TO 10</option>';
        modeChoice2Element.innerHTML += '<option value="C17">1-DIGIT NUMBERS UP TO 20</option>';
        modeChoice2Element.innerHTML += '<option value="C10">2-DIGIT AND 1-DIGIT NUMBERS UP TO 20</option>';
        modeChoice2Element.innerHTML += '<option value="C11">2-DIGIT AND 1-DIGIT NUMBERS UP TO 100</option>';
        modeChoice2Element.innerHTML += '<option value="C12">2-DIGIT NUMBERS UP TO 100</option>';
        modeChoice2Element.innerHTML += '<option value="C13">NUMBERS UP TO 1,000</option>';
        modeChoice2Element.innerHTML += '<option value="C14">NUMBERS UP TO 10,000</option>';
        modeChoice2Element.innerHTML += '<option value="C15">NUMBERS UP TO 1,000,000</option>';
        modeChoice6Element.innerHTML += '<option value="C43">UNKNOWN ADDEND/MINUEND/SUBTRAHEND </option>';

    } else if (modeChoice1Selection === "C4") {
        modeChoice2Element.innerHTML += '<option value="C18">MULTIPLICATION TABLE</option>';
        modeChoice2Element.innerHTML += '<option value="C19">2-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C20">3-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C21">4-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C22">MULTI-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C23">2-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C24">3-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C25">4-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C26">MULTI-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C27">MULTI-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C28">MULTIPLES OF TEN/HUNDRED (EASIER)</option>';
        modeChoice2Element.innerHTML += '<option value="C29">MULTIPLES OF TEN/HUNDRED/THOUSAND (HARDER)</option>';
        modeChoice6Element.innerHTML += '<option value="C45">UNKNOWN MULTIPLICAND/MULTIPLIER</option>';

    } else if (modeChoice1Selection === "C5") {
        modeChoice2Element.innerHTML += '<option value="C18">MULTIPLICATION TABLE</option>';
        modeChoice2Element.innerHTML += '<option value="C19">2-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C20">3-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C21">4-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C22">MULTI-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C30">MULTI-DIGIT BY 1-DIGIT NUMBERS (QUOTIENT CONTAINS 0)</option>';
        modeChoice2Element.innerHTML += '<option value="C24">3-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C25">4-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C26">MULTI-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C27">MULTI-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C28">MULTIPLES OF TEN/HUNDRED (EASIER)</option>';
        modeChoice2Element.innerHTML += '<option value="C29">MULTIPLES OF TEN/HUNDRED/THOUSAND (HARDER)</option>';
        modeChoice6Element.innerHTML += '<option value="C45">UNKNOWN DIVIDEND</option>';
        modeChoice6Element.innerHTML += '<option value="C46">UNKNOWN DIVISOR</option>';

    } else if (modeChoice1Selection === "C6") {
        modeChoice2Element.innerHTML += '<option value="C18">MULTIPLICATION TABLE</option>';
        modeChoice2Element.innerHTML += '<option value="C19">2-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C20">3-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C21">4-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C22">MULTI-DIGIT BY 1-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C24">3-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C25">4-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C26">MULTI-DIGIT BY 2-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C27">MULTI-DIGIT NUMBERS</option>';
        modeChoice2Element.innerHTML += '<option value="C28">MULTIPLES OF TEN/HUNDRED (EASIER)</option>';
        modeChoice2Element.innerHTML += '<option value="C29">MULTIPLES OF TEN/HUNDRED/THOUSAND (HARDER)</option>';
        modeChoice6Element.innerHTML += '<option value="C45">UNKNOWN MULTIPLICAND/MULTIPLIER/DIVIDEND/DIVISOR</option>';

    } else if (modeChoice1Selection === "C7") {
        modeChoice2Element.innerHTML += '<option value="C31">UP TO 10</option>';
        modeChoice2Element.innerHTML += '<option value="C32">UP TO 20</option>';
        modeChoice2Element.innerHTML += '<option value="C33">UP TO 100</option>';
        modeChoice2Element.innerHTML += '<option value="C34">UP TO 1,000</option>';
        modeChoice2Element.innerHTML += '<option value="C35">UP TO 10,000</option>';
        modeChoice2Element.innerHTML += '<option value="C36">UP TO 1,000,000</option>';
        modeChoice6Element.innerHTML += '<option value="C45">UNKNOWN ADDEND/MINUEND/SUBTRAHEND/MULTIPLICAND/MULTIPLIER/DIVIDEND/DIVISOR</option>';
    }
}

modeChoiceElement1.addEventListener('change', updateModeChoice2);


function updateModeChoice3() {
    let modeChoice1Selection = modeChoiceElement1.value;
    let modeChoice2Selection = modeChoice2Element.value;

    modeChoice3Element.innerHTML = "";
    modeChoice5Element.innerHTML = "";
    modeChoice5Element.innerHTML += '<option value="C41">SIMPLE EQUATION</option>';
    modeChoice5Element.innerHTML += '<option value="C42">EQUATION WITH UNKNOWN NUMBER</option>';

    if (modeChoice2Selection === "C9" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">CARRYING OVER PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C9" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C9" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER/REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">CARRYING OVER/REGROUPING PLACE VALUES</option>';

    } else if (modeChoice2Selection === "C17" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C38">CARRYING OVER/REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C8" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C8" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C8" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER/REGROUPING PLACE VALUES</option>';

    } else if (modeChoice2Selection === "C10" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C10" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C10" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER/REGROUPING PLACE VALUES</option>';

    } else if (modeChoice2Selection === "C11" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">CARRYING OVER PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C11" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C11" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER/REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">CARRYING OVER/REGROUPING PLACE VALUES</option>';

    } else if (modeChoice2Selection === "C12" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">CARRYING OVER PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C12" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C12" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER/REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">CARRYING OVER/REGROUPING PLACE VALUES</option>';

    } else if (modeChoice2Selection === "C13" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">CARRYING OVER PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C13" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C13" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';

    } else if (modeChoice2Selection === "C14" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">CARRYING OVER PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C14" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C14" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';
    
    } else if (modeChoice2Selection === "C15" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT CARRYING OVER PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">CARRYING OVER PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C15" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C15" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">WITHOUT REGROUPING PLACE VALUES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';
    } else if (modeChoice2Selection === "C16") {
        modeChoice3Element.innerHTML += '<option value="C38">REGROUPING PLACE VALUES</option>';
    }
    
    else {
    }
}

modeChoiceElement1.addEventListener('change', updateModeChoice3);
modeChoice2Element.addEventListener('change', updateModeChoice3);

function updateModeChoice7() {
    let modeChoice1Selection = modeChoiceElement1.value;
    let modeChoice5Selection = modeChoice5Element.value;
    let modeChoice2Selection = modeChoice2Element.value;

    if (modeChoice5Selection === "C42") {
        modeChoice7Element.innerHTML = '<option value="C47">SIMPLE ADDITION/SUBTRACTION/DIVISION/MULTIPLICATION</option>';
    } else if (modeChoice5Selection === "C41" && modeChoice2Selection !== "C18" && modeChoice2Selection !== "C28" && modeChoice2Selection !== "C29") {
        modeChoice7Element.innerHTML = '';

        if (modeChoice1Selection === "C1") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE ADDITION</option>';
            modeChoice7Element.innerHTML += '<option value="C48">LONG ADDITION</option>';
        } else if (modeChoice1Selection === "C2") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE SUBTRACTION</option>';
            modeChoice7Element.innerHTML += '<option value="C48">LONG SUBTRACTION</option>';
        } else if (modeChoice1Selection === "C3") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE ADDITION/SUBTRACTION</option>';
            modeChoice7Element.innerHTML += '<option value="C48">LONG ADDITION/SUBTRACTION</option>';
        } else if (modeChoice1Selection === "C4") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE MULTIPLICATION</option>';
            modeChoice7Element.innerHTML += '<option value="C48">LONG MULTIPLICATION</option>';
        } else if (modeChoice1Selection === "C5") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE DIVISION</option>';
            modeChoice7Element.innerHTML += '<option value="C48">LONG DIVISION</option>';
        } else if (modeChoice1Selection === "C6") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE MULTIPLICATION/DIVISION</option>';
            modeChoice7Element.innerHTML += '<option value="C48">LONG MULTIPLICATION/DIVISION</option>';
        } else if (modeChoice1Selection === "C7") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE ADDITION/SUBTRACTION/DIVISION/MULTIPLICATION</option>';
            modeChoice7Element.innerHTML += '<option value="C48">LONG ADDITION/SUBTRACTION/DIVISION/MULTIPLICATION</option>';
        }
} else {
    modeChoice7Element.innerHTML = '';
    if (modeChoice1Selection === "C1") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE ADDITION</option>';
        } else if (modeChoice1Selection === "C2") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE SUBTRACTION</option>';
        } else if (modeChoice1Selection === "C3") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE ADDITION/SUBTRACTION</option>';
        } else if (modeChoice1Selection === "C4") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE MULTIPLICATION</option>';
        } else if (modeChoice1Selection === "C5") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE DIVISION</option>';
        } else if (modeChoice1Selection === "C6") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE MULTIPLICATION/DIVISION</option>';
        } else if (modeChoice1Selection === "C7") {
            modeChoice7Element.innerHTML += '<option value="C47">SIMPLE ADDITION/SUBTRACTION/DIVISION/MULTIPLICATION</option>';
        }
}
}

function updateModeChoice8() {
    let modeChoice7Selection = modeChoice7Element.value;

    if (modeChoice7Selection === "C48") {
            toggleVisibility(modeChoice14Element, true);
        } else {
            toggleVisibility(modeChoice14Element, false);
        }
    }

modeChoiceElement1.addEventListener('change', updateModeChoice7);
modeChoice5Element.addEventListener('change', updateModeChoice7);
modeChoice2Element.addEventListener('change', updateModeChoice7);

modeChoiceElement1.addEventListener('change', handleModeChoiceChange);
modeChoice2Element.addEventListener('change', handleModeChoiceChange);
modeChoice5Element.addEventListener('change', handleModeChoiceChange);

modeChoiceElement1.addEventListener('change', updateModeChoice8);
modeChoice2Element.addEventListener('change', updateModeChoice8);
modeChoice3Element.addEventListener('change', updateModeChoice8);
modeChoice5Element.addEventListener('change', updateModeChoice8);
modeChoice6Element.addEventListener('change', updateModeChoice8);
modeChoice7Element.addEventListener('change', updateModeChoice8);


var checkbox = document.getElementById("remainder-input");
function updateModeChoice5() {
    if (checkbox.checked) {
        modeChoice5Element.innerHTML = '<option value="C41">SIMPLE EQUATION</option>';
    } else {
        modeChoice5Element.innerHTML = '';
        modeChoice5Element.innerHTML += '<option value="C41">SIMPLE EQUATION</option>';
        modeChoice5Element.innerHTML += '<option value="C42">EQUATION WITH UNKNOWN NUMBER</option>';
    }
}

checkbox.addEventListener('change', updateModeChoice5);
checkbox.addEventListener('change', handleModeChoiceChange);
checkbox.addEventListener('change', updateModeChoice7);
checkbox.addEventListener('change', updateModeChoice8);

function submitSelection() {
    if (localStorage.getItem('controller') !== null) {
        controller = JSON.parse(localStorage.getItem('controller'))
    }
    modeChoice1Selection = modeChoiceElement1.value;
    modeChoice2Selection = modeChoice2Element.value;
    selectedNumbers = [selectedNumberElement.value, selectedNumber2Element.value].sort();
    modeChoice3Selection = modeChoice3Element.value;
    modeChoice5Selection = modeChoice5Element.value;
    modeChoice6Selection = modeChoice6Element.value;
    modeChoice7Selection = modeChoice7Element.value;
    modeChoice8Selection = modeChoice14Element.value;

    var checkbox = document.getElementById("remainder-input");

    controller.language = "EN";
    controller.mode = 'math';
    controller.modeChoice = modeChoice1Selection;
    controller.modeChoice2 = modeChoice2Selection;
    controller.selectedNumbers = selectedNumbers;
    controller.withRemainder = checkbox.checked;
    if (modeChoice3Selection === "C37") {
        controller.modeChoice3 = true;
    } else if (modeChoice3Selection === "C38") {
        controller.modeChoice3 = false;
    }
    controller.modeChoice5 = modeChoice5Selection;
    controller.modeChoice6 = modeChoice6Selection;
    controller.modeChoice7 = modeChoice7Selection;
    controller.modeChoice8 = modeChoice8Selection;
    controller.result = ['', '', '', '', '']

    localStorage.setItem('controller', JSON.stringify(controller))
    redirectToIntermediate()
}