let modeChoiceElement = document.querySelector('#mode_choice');
let modeChoice1Element = document.querySelector('#mode_choice_1');
let modeChoice2Element = document.querySelector('#mode_choice_2');
let numberLabel = document.querySelector('#number_label');
let selectedNumberElement = document.querySelector('#selected_number');
let numberLabel2 = document.querySelector('#number_label_2');
let selectedNumber2Element = document.querySelector('#selected_number_2');
let remainderOptionElement = document.querySelector('#remainder-option');
let remainderCheckBox = document.querySelector('#remainder-input');
let modeChoice3Element = document.querySelector('#mode_choice_3');
let modeChoice5Element = document.querySelector('#mode_choice_5');
let modeChoice6Element = document.querySelector('#mode_choice_6');
let modeChoice7Element = document.querySelector('#mode_choice_7');
let timerInputDiv = document.querySelector('#timer-input-div');
let questionNumberInputDiv = document.querySelector('#question-number-input-div');
let modeChoice4Element = document.querySelector('#mode_choice_4');
let timerQuestionNumberDiv = document.querySelector('.timer-question-number-div');

let classChoiceElement = document.querySelector('#class_choice');
let modeChoice8Element = document.querySelector('#mode_choice_8');
let modeChoice9Element = document.querySelector('#mode_choice_9');
let modeChoice10Element = document.querySelector('#mode_choice_10');
let modeChoice11DivElement = document.querySelector('#mode_choice_11_div');
let modeChoice12Element = document.querySelector('#mode_choice_12');
let modeChoice13Element = document.querySelector('#mode_choice_13');
let modeChoice14Element = document.querySelector('#mode_choice_14');
let rasybaOptionsLabelTextGaluneElement = document.querySelector('#rasyba-options-label-text-galune');

const isTeacher = userData && userData.accType === "teacher"
let modeChoice15Element = null;

if (isTeacher && window.location.pathname.includes("uzduotys.html")) {
    modeChoice15Element = document.querySelector('#mode_choice_15');
}

    function toggleVisibility(element, isVisible) {
        if (isVisible) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }

    function handleModeChoiceChange () {
        let modeChoiceSelection = modeChoiceElement.value;

        if (modeChoiceSelection === "lang") {
            toggleVisibility(modeChoice1Element, false);
            toggleVisibility(modeChoice2Element, false);
            toggleVisibility(modeChoice3Element, false);
            toggleVisibility(modeChoice5Element, false);
            toggleVisibility(modeChoice6Element, false);
            toggleVisibility(modeChoice7Element, false);
            toggleVisibility(numberLabel, false);
            toggleVisibility(selectedNumberElement, false);
            selectedNumberElement.value = 1
            toggleVisibility(numberLabel2, false);
            toggleVisibility(selectedNumber2Element, false);
            selectedNumber2Element.value = 1
            toggleVisibility(remainderOptionElement, false);
            remainderCheckBox.checked = false;

            toggleVisibility(classChoiceElement, true);
            toggleVisibility(modeChoice8Element, true);
            toggleVisibility(modeChoice9Element, true);
            toggleVisibility(modeChoice10Element, true);
            toggleVisibility(modeChoice14Element, true);

            let changeEvent = new Event('change');
            modeChoice8Element.value = 'C49';
            modeChoice8Element.dispatchEvent(changeEvent);

            if (modeChoice15Element) {
                toggleVisibility(modeChoice15Element, true);
                let changeEvent = new Event('change');
                modeChoice15Element.dispatchEvent(changeEvent);
            }

        } else if (modeChoiceSelection === "math") {
            toggleVisibility(modeChoice1Element, true);
            let changeEvent = new Event('change');
            modeChoice1Element.value = "C1";
            modeChoice1Element.dispatchEvent(changeEvent);

            toggleVisibility(classChoiceElement, false);
            toggleVisibility(modeChoice8Element, false);
            toggleVisibility(modeChoice9Element, false);
            toggleVisibility(modeChoice10Element, false);
            toggleVisibility(modeChoice14Element, false);

            if (modeChoice15Element) toggleVisibility(modeChoice15Element, false);

            toggleVisibility(modeChoice11DivElement, false);
            toggleVisibility(modeChoice12Element, false);
            toggleVisibility(modeChoice13Element, false);
            toggleVisibility(timerQuestionNumberDiv, true);
        }

        if (modeChoice15Element) {
            let changeEvent = new Event('change');
            modeChoice15Element.dispatchEvent(changeEvent);
        }
    }

    modeChoiceElement.addEventListener('change', handleModeChoiceChange);

    function handleModeChoice1Change() {
        let modeChoice1Selection = modeChoice1Element.value;
        let modeChoice2Selection = modeChoice2Element.value;
        let modeChoice5Selection = modeChoice5Element.value;
        toggleVisibility(modeChoice2Element, true);

        if (modeChoice5Selection === "C41") {
            toggleVisibility(modeChoice7Element, true);
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
            selectedNumberElement.value = 1;
            toggleVisibility(numberLabel2, false);
            toggleVisibility(selectedNumber2Element, false);
            selectedNumber2Element.value = 1;
            toggleVisibility(modeChoice3Element, true);
            toggleVisibility(modeChoice5Element, true);
        } else {
            toggleVisibility(numberLabel, false);
            toggleVisibility(selectedNumberElement, false);
            selectedNumberElement.value = 1;
            toggleVisibility(numberLabel2, false);
            toggleVisibility(selectedNumber2Element, false);
            selectedNumber2Element.value = 1;
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
            remainderCheckBox.checked = false;
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
    let modeChoice1Selection = modeChoice1Element.value;
    let modeChoice2Selection = modeChoice2Element.value;

    modeChoice2Element.innerHTML = "";
    modeChoice6Element.innerHTML = "";

    if (modeChoice1Selection === "C1") {
        modeChoice2Element.innerHTML += '<option value="C8">VIENAŽENKLIŲ SKAIČIŲ IKI 10</option>';
        modeChoice2Element.innerHTML += '<option value="C9">VIENAŽENKLIŲ SKAIČIŲ IKI 20 (LENTELINĖ SUDĖTIS)</option>';
        modeChoice2Element.innerHTML += '<option value="C10">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="C11">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="C12">DVIŽENKLIŲ SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="C13">SKAIČIŲ IKI 1 000</option>';
        modeChoice2Element.innerHTML += '<option value="C14">SKAIČIŲ IKI 10 000</option>';
        modeChoice2Element.innerHTML += '<option value="C15">SKAIČIŲ IKI 1 000 000</option>';
        modeChoice6Element.innerHTML += '<option value="C43">NEŽINOMAS DĖMUO</option>';

    } else if (modeChoice1Selection === "C2") {
        modeChoice2Element.innerHTML += '<option value="C8">VIENAŽENKLIŲ SKAIČIŲ IKI 10</option>';
        modeChoice2Element.innerHTML += '<option value="C10">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="C11">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="C12">DVIŽENKLIŲ SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="C13">SKAIČIŲ IKI 1 000</option>';
        modeChoice2Element.innerHTML += '<option value="C14">SKAIČIŲ IKI 10 000</option>';
        modeChoice2Element.innerHTML += '<option value="C15">SKAIČIŲ IKI 1 000 000</option>';
        modeChoice2Element.innerHTML += '<option value="C16">KAI TURINYJE GRETIMI NULIAI</option>';
        modeChoice6Element.innerHTML += '<option value="C43">NEŽINOMAS TURINYS</option>';
        modeChoice6Element.innerHTML += '<option value="C44">NEŽINOMAS ATĖMINYS</option>';

    } else if (modeChoice1Selection === "C3") {
        modeChoice2Element.innerHTML += '<option value="C8">VIENAŽENKLIŲ SKAIČIŲ IKI 10</option>';
        modeChoice2Element.innerHTML += '<option value="C17">LENTELINĖ SUDĖTIS IR ATIMTIS IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="C10">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="C11">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="C12">DVIŽENKLIŲ SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="C13">SKAIČIŲ IKI 1 000</option>';
        modeChoice2Element.innerHTML += '<option value="C14">SKAIČIŲ IKI 10 000</option>';
        modeChoice2Element.innerHTML += '<option value="C15">SKAIČIŲ IKI 1 000 000</option>';
        modeChoice6Element.innerHTML += '<option value="C43">NEŽINOMAS DĖMUO/TURINYS/ATĖMINYS</option>';

    } else if (modeChoice1Selection === "C4") {
        modeChoice2Element.innerHTML += '<option value="C18">DAUGYBOS LENTELĖ</option>';
        modeChoice2Element.innerHTML += '<option value="C19">DVIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C20">TRIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C21">KETURŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C22">DAUGIAŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C23">DVIŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C24">TRIŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C25">KETURŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C26">DAUGIAŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C27">*DAUGIAŽENKLIŲ SKAIČIŲ</option>';
        modeChoice2Element.innerHTML += '<option value="C28">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ (LENGVESNI)</option>';
        modeChoice2Element.innerHTML += '<option value="C29">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ/TŪKSTANČIŲ</option>';
        modeChoice6Element.innerHTML += '<option value="C45">NEŽINOMAS DAUGINAMASIS</option>';

    } else if (modeChoice1Selection === "C5") {
        modeChoice2Element.innerHTML += '<option value="C18">IŠ DAUGYBOS LENTELĖS</option>';
        modeChoice2Element.innerHTML += '<option value="C19">DVIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C20">TRIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C21">KETURŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C22">DAUGIAŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C30">DAUGIAŽENKLIO IŠ VIENAŽENKLIO (DALMENYJE 0)</option>';
        modeChoice2Element.innerHTML += '<option value="C24">*TRIŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C25">*KETURŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C26">*DAUGIAŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C27">*DAUGIAŽENKLIŲ SKAIČIŲ</option>';
        modeChoice2Element.innerHTML += '<option value="C28">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ (LENGVESNI)</option>';
        modeChoice2Element.innerHTML += '<option value="C29">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ/TŪKSTANČIŲ</option>';
        modeChoice6Element.innerHTML += '<option value="C45">NEŽINOMAS DALINYS</option>';
        modeChoice6Element.innerHTML += '<option value="C46">NEŽINOMAS DALIKLIS</option>';

    } else if (modeChoice1Selection === "C6") {
        modeChoice2Element.innerHTML += '<option value="C18">IŠ DAUGYBOS LENTELĖS</option>';
        modeChoice2Element.innerHTML += '<option value="C19">DVIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C20">TRIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C21">KETURŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C22">DAUGIAŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C24">*TRIŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C25">*KETURŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C26">*DAUGIAŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="C27">*DAUGIAŽENKLIŲ SKAIČIŲ</option>';
        modeChoice2Element.innerHTML += '<option value="C28">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ (LENGVESNI)</option>';
        modeChoice2Element.innerHTML += '<option value="C29">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ/TŪKSTANČIŲ</option>';
        modeChoice6Element.innerHTML += '<option value="C45">NEŽINOMAS DAUGINAMASIS/DALINYS/DALIKLIS</option>';

    } else if (modeChoice1Selection === "C7") {
        modeChoice2Element.innerHTML += '<option value="C31">IKI 10</option>';
        modeChoice2Element.innerHTML += '<option value="C32">IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="C33">IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="C34">IKI 1 000</option>';
        modeChoice2Element.innerHTML += '<option value="C35">IKI 10 000</option>';
        modeChoice2Element.innerHTML += '<option value="C36">IKI 1 000 000</option>';
        modeChoice6Element.innerHTML += '<option value="C45">NEŽINOMAS DĖMUO/TURINYS/ATĖMINYS/DAUGINAMASIS/DALINYS/DALIKLIS</option>';
    }
}

modeChoice1Element.addEventListener('change', updateModeChoice2);


function updateModeChoice3() {
    let modeChoice1Selection = modeChoice1Element.value;
    let modeChoice2Selection = modeChoice2Element.value;

    modeChoice3Element.innerHTML = "";
    modeChoice5Element.innerHTML = "";
    modeChoice5Element.innerHTML += '<option value="C41">SKAITINĖ LYGYBĖ</option>';
    modeChoice5Element.innerHTML += '<option value="C42">SKAITINĖ LYGYBĖ SU NEŽINOMUOJU</option>';

    if (modeChoice2Selection === "C9" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "C9" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">NEIŠARDANT DEŠIMTIES</option>';
    } else if (modeChoice2Selection === "C9" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT/IŠARDANT DEŠIMTĮ</option>';

    } else if (modeChoice2Selection === "C17" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT/IŠARDANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "C8" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT DEŠIMTIES</option>';
    } else if (modeChoice2Selection === "C8" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">NEIŠARDANT DEŠIMTIES</option>';
    } else if (modeChoice2Selection === "C8" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';

    } else if (modeChoice2Selection === "C10" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT DEŠIMTIES</option>';
    } else if (modeChoice2Selection === "C10" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">IŠARDANT DEŠIMTĮ (LENTELINĖ ATIMTIS)</option>';
    } else if (modeChoice2Selection === "C10" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';

    } else if (modeChoice2Selection === "C11" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "C11" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">IŠARDANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "C11" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT/IŠARDANT DEŠIMTĮ</option>';

    } else if (modeChoice2Selection === "C12" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "C12" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">IŠARDANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "C12" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT/IŠARDANT DEŠIMTĮ</option>';

    } else if (modeChoice2Selection === "C13" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "C13" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="C38">IŠARDANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "C13" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT/NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT/IŠARDANT SKAIČIŲ SKYRIUS</option>';

    } else if (modeChoice2Selection === "C14" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "C14" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="C38">IŠARDANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "C14" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT/NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT/IŠARDANT SKAIČIŲ SKYRIUS</option>';
    
    } else if (modeChoice2Selection === "C15" && modeChoice1Selection === "C1") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "C15" && modeChoice1Selection === "C2") {
        modeChoice3Element.innerHTML += '<option value="C37">NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="C38">IŠARDANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "C15" && modeChoice1Selection === "C3") {
        modeChoice3Element.innerHTML += '<option value="C37">NEPERŽENGIANT/NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="C38">PERŽENGIANT/IŠARDANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "C16") {
        modeChoice3Element.innerHTML += '<option value="C38">IŠARDANT SKAIČIŲ SKYRIUS</option>';
    }
    
    else {
    }
}

modeChoice1Element.addEventListener('change', updateModeChoice3);
modeChoice2Element.addEventListener('change', updateModeChoice3);

function updateModeChoice7() {
    let modeChoice5Selection = modeChoice5Element.value;
    let modeChoice2Selection = modeChoice2Element.value;

    if (modeChoice5Selection === "C42") {
        modeChoice7Element.innerHTML = '<option value="C47">EILUTE</option>';
    } else if (modeChoice5Selection === "C41" && modeChoice2Selection !== "C18" && modeChoice2Selection !== "C28" && modeChoice2Selection !== "C29") {
        modeChoice7Element.innerHTML = '';
        if (typeof browsingHistory !== "undefined" && browsingHistory) {
            modeChoice7Element.innerHTML += '<option value="C47-C48">EILUTE ARBA STULPELIU / KAMPU</option>';
        }

        modeChoice7Element.innerHTML += '<option value="C47">EILUTE</option>';
        modeChoice7Element.innerHTML += '<option value="C48">STULPELIU / KAMPU</option>';
} else {
    modeChoice7Element.innerHTML = '';
    modeChoice7Element.innerHTML += '<option value="C47">EILUTE</option>';
}
}

modeChoice1Element.addEventListener('change', updateModeChoice7);
modeChoice5Element.addEventListener('change', updateModeChoice7);
modeChoice2Element.addEventListener('change', updateModeChoice7);

modeChoice1Element.addEventListener('change', handleModeChoice1Change);
modeChoice2Element.addEventListener('change', handleModeChoice1Change);
modeChoice5Element.addEventListener('change', handleModeChoice1Change);


var checkbox = document.getElementById("remainder-input");
function updateModeChoice5() {
    if (checkbox.checked) {
        modeChoice5Element.innerHTML = '<option value="C41">SKAITINĖ LYGYBĖ</option>';
    } else {
        modeChoice5Element.innerHTML = '';
        modeChoice5Element.innerHTML += '<option value="C41">SKAITINĖ LYGYBĖ</option>';
        modeChoice5Element.innerHTML += '<option value="C42">SKAITINĖ LYGYBĖ SU NEŽINOMUOJU</option>';
    }
}

checkbox.addEventListener('change', updateModeChoice5);
checkbox.addEventListener('change', handleModeChoice1Change);
checkbox.addEventListener('change', updateModeChoice7);

function updateModeChoice12 () {
    modeChoice12Element.innerHTML = "";
    if (typeof browsingHistory !== "undefined" && browsingHistory) {
        modeChoice12Element.innerHTML += '<option value="C73-C74">LENGVESNĖS IR SUNKESNĖS KOMBINACIJOS</option>';
    }
    modeChoice12Element.innerHTML += '<option value="C73">LENGVESNĖS KOMBINACIJOS</option>';
    modeChoice12Element.innerHTML += '<option value="C74">SUNKESNĖS KOMBINACIJOS</option>';
}

function updateModeChoice13 () {
    modeChoice13Element.innerHTML = "";
    if (typeof browsingHistory !== "undefined" && browsingHistory) {
        modeChoice13Element.innerHTML += '<option value="0">RETESNI IR DAŽNESNI ATVEJAI</option>';
    }
    modeChoice13Element.innerHTML += '<option value="3">RETESNI ATVEJAI</option>';
    modeChoice13Element.innerHTML += '<option value="1">DAŽNESNI ATVEJAI</option>';
}

function handleModeChoice8Change() { 
    let classChoiceSelection = classChoiceElement.value;
    let modeChoice8Selection = modeChoice8Element.value;
    let modeChoice15Selection;
    if (modeChoice15Element) {
        modeChoice15Selection = modeChoice15Element.value;
    }
    modeChoice9Element.innerHTML = "";

    if (modeChoice8Selection === "C83") {
        toggleVisibility(timerQuestionNumberDiv, true);
        toggleVisibility(modeChoice10Element, false);
        toggleVisibility(modeChoice14Element, false);
        if (modeChoice15Element) toggleVisibility(modeChoice15Element, false);
        modeChoice9Element.innerHTML += '<option value="C50">RAŠYBĄ</option>';
        toggleVisibility(modeChoice11DivElement, true);
        if (classChoiceSelection === "C75") {
            toggleVisibility(modeChoice13Element, true);
            modeChoice13Element.innerHTML = "";
            if (typeof browsingHistory !== "undefined" && browsingHistory) {
                modeChoice13Element.innerHTML += '<option value="0">RETESNI IR DAŽNESNI ATVEJAI</option>';
            }
            modeChoice13Element.innerHTML += '<option value="3">RETESNI ATVEJAI</option>';
            modeChoice13Element.innerHTML += '<option value="1">DAŽNESNI ATVEJAI</option>';
            toggleVisibility(modeChoice12Element, false);
            rasybaOptionsLabelTextGaluneElement.innerHTML = "ŽODŽIO PABAIGA:";
        } else {
            toggleVisibility(modeChoice13Element, true);
            modeChoice13Element.innerHTML = "";
            if (typeof browsingHistory !== "undefined" && browsingHistory) {
                modeChoice13Element.innerHTML += '<option value="0">RETESNI IR DAŽNESNI ATVEJAI</option>';
            }
            modeChoice13Element.innerHTML += '<option value="1">DAŽNESNI ATVEJAI</option>';
            modeChoice13Element.innerHTML += '<option value="3">RETESNI ATVEJAI</option>';
            toggleVisibility(modeChoice12Element, true);
            rasybaOptionsLabelTextGaluneElement.innerHTML = "ŽODŽIO PABAIGA:";
        }
    } else if (modeChoice8Selection === "C49") {
        toggleVisibility(modeChoice10Element, true);
        toggleVisibility(modeChoice14Element, true);
        if (modeChoice15Element) toggleVisibility(modeChoice15Element, true);
        toggleVisibility(modeChoice11DivElement, false);
        toggleVisibility(modeChoice13Element, false);
        modeChoice9Element.innerHTML += '<option value="C51">TURINIO KOMPONAVIMĄ</option>';
        modeChoice9Element.innerHTML += '<option value="C52">STRUKTŪROS IŠDĖSTYMĄ</option>';
        if (modeChoice15Selection === "C82") {
            toggleVisibility(timerQuestionNumberDiv, true);
        } else if (modeChoice15Selection === "C84") {
            toggleVisibility(timerQuestionNumberDiv, false);
        }
    }

    if (modeChoice15Element) {
        let changeEvent = new Event('change');
        modeChoice15Element.dispatchEvent(changeEvent);
    }
}

modeChoice8Element.addEventListener('change', handleModeChoice8Change);
classChoiceElement.addEventListener('change', handleModeChoice8Change);

function handleModeChoice15Change () {
    if (!modeChoice15Element) {
        return
    }

    let modeChoiceSelection = modeChoiceElement.value;
    let modeChoice15Selection = modeChoice15Element.value;
    let modeChoice8Selection = modeChoice8Element.value;

    if (modeChoiceSelection === "lang") {
        if (modeChoice8Selection === "C83") {
            toggleVisibility(classChoiceElement, true);
            toggleVisibility(modeChoice10Element, false);
            toggleVisibility(modeChoice4Element, true);
            toggleVisibility(timerQuestionNumberDiv, true);
        } else if (modeChoice8Selection === "C49") {
             if (modeChoice15Selection === "C82") {
                toggleVisibility(classChoiceElement, true);
                toggleVisibility(modeChoice10Element, true);
                toggleVisibility(modeChoice4Element, true);
                toggleVisibility(timerQuestionNumberDiv, true);
                isSelectionModeEnabled = false;
                refilterTexts();
             } else if (modeChoice15Selection === "C84") {
                toggleVisibility(classChoiceElement, false);
                toggleVisibility(modeChoice10Element, false);
                toggleVisibility(modeChoice4Element, false);
                toggleVisibility(timerQuestionNumberDiv, false);
                messageToTheUser("Pasirinkite norimus tekstus tekstų naršyklėje.", false)
                isSelectionModeEnabled = true;
                refilterTexts();
            }
        }
    } else if (modeChoiceSelection === "math") {
        toggleVisibility(modeChoice4Element, true);
        toggleVisibility(timerQuestionNumberDiv, true);
    }
}

if (modeChoice15Element) modeChoice15Element.addEventListener('change', handleModeChoice15Change);


document.addEventListener('DOMContentLoaded', function() {
    // Generic handler for all parent toggle checkboxes
    const parentToggles = document.querySelectorAll('.parent-toggle');
    
    parentToggles.forEach(parentCheckbox => {
        const targetDivId = parentCheckbox.getAttribute('data-controls');
        const targetDiv = document.getElementById(targetDivId);
        
        if (!targetDiv) return;
        
        // Function to sync child checkboxes
        const syncChildren = (isChecked) => {
            const childCheckboxes = targetDiv.querySelectorAll('.rasyba-options');
            childCheckboxes.forEach(child => {
                child.checked = isChecked;
            });
        };
        
        // Function to toggle visibility and sync
        const toggle = (isChecked) => {
            targetDiv.style.display = isChecked ? 'block' : 'none';
            syncChildren(isChecked);
        };
        
        // Initialize on page load
        toggle(parentCheckbox.checked);
        
        // Add event listener
        parentCheckbox.addEventListener('change', function() {
            toggle(this.checked);
        });
    });
});

function handleClassChoiceChange() {
    const isFirstSecond = classChoiceElement.value === "C75";
    
    // Show/hide labels based on class
    document.querySelectorAll('.options-for-third-fourth-classes').forEach(el => {
        el.style.display = isFirstSecond ? 'none' : 'block';
    });
    
    document.querySelectorAll('.options-for-first-second-classes').forEach(el => {
        el.style.display = isFirstSecond ? 'block' : 'none';
    });
    
    // Uncheck ALL inputs for the class being hidden
    const inputsToUncheck = isFirstSecond 
        ? '.options-for-third-fourth-classes-input'
        : '.options-for-first-second-classes-input';
    
    document.querySelectorAll(inputsToUncheck).forEach(input => {
        input.checked = false;
    });
    
    // Check inputs for the class being shown
    const inputsToCheck = isFirstSecond
        ? '.options-for-first-second-classes-input'
        : '.options-for-third-fourth-classes-input';
    
    document.querySelectorAll(inputsToCheck).forEach(input => {
        // Check if this input is inside a controlled div
        const controlledDiv = input.closest('[data-parent]');
        
        if (!controlledDiv) {
            // Not in a controlled div, always check it
            input.checked = true;
        } else {
            // In a controlled div, only check if:
            // 1. The controlled div is visible AND
            // 2. The parent checkbox is checked
            const parentValue = controlledDiv.getAttribute('data-parent');
            const parentCheckbox = document.querySelector(`.parent-toggle[value="${parentValue}"]`);
            
            // Only check if parent checkbox exists, is checked, AND the div should be visible for this class
            if (parentCheckbox && parentCheckbox.checked && controlledDiv.style.display !== 'none') {
                input.checked = true;
            }
        }
    });
}

classChoiceElement.addEventListener('change', handleClassChoiceChange);

function getSelectedRasybaConditions() {
    const conditions = {};
    const checkboxes = document.querySelectorAll('.rasyba-options:checked');
    
    checkboxes.forEach(checkbox => {
        // Skip if parent label is hidden
        const label = checkbox.closest('label');
        if (label && (label.classList.contains('temporarily-disabled') || label.style.display === 'none')) return;
        
        // Skip if inside a hidden controlled div
        const controlledDiv = checkbox.closest('[data-parent]');
        if (controlledDiv && controlledDiv.style.display === 'none') return;
        
        const value = JSON.parse(checkbox.value);
        
        Object.keys(value).forEach(key => {
            if (!conditions[key]) {
                conditions[key] = [];
            }
            conditions[key] = conditions[key].concat(value[key]);
        });
    });
    
    return conditions;
}

const timerInputChoiceElement = document.querySelector('#timer-input');
let timerChoiceLabel = document.querySelector('.timer-choice-label');

function changeQuestionNumberLabel () {
	if (document.querySelector('.answer-number-label')) {
	if (document.getElementById('mode_choice').value === "lang") {
	if (document.getElementById('mode_choice_8').value === "C49") {
		if (document.getElementById('mode_choice_4').value === "C40") {
				document.getElementById("question-number-input").value = 5;
				document.querySelector('.answer-number-label').innerHTML = 'tekstus';
			}
	} else if (document.getElementById('mode_choice_8').value === "C83") {
		if (document.getElementById('mode_choice_4').value === "C40") {
				document.getElementById("question-number-input").value = 20;
				document.querySelector('.answer-number-label').innerHTML = 'sakinių';
			}
	} 
	} else {
		document.getElementById("question-number-input").value = 20;
		document.querySelector('.answer-number-label').innerHTML = 'veiksmų';
	}
	}
}

function updateModeChoice4() {
	let modeChoice4ElementSelection = modeChoice4Element.value;
	if (modeChoice4ElementSelection === "C39") {
		timerInputDiv.style.display = 'flex';
		questionNumberInputDiv.style.display = 'none';
	} else if (modeChoice4ElementSelection === "C40") {
		timerInputDiv.style.display = 'none';
		questionNumberInputDiv.style.display = 'flex';
	}
    
	changeQuestionNumberLabel();

	setLabelEndingForDuration();
    setLabelEndingForQuestionNumber();
}

document.querySelector("#mode_choice_4").addEventListener('change', updateModeChoice4);


function updateModeChoice4Options () {
	document.getElementById('mode_choice_4').innerHTML = '';
	if (document.getElementById('mode_choice').value === "lang") {
		if (document.getElementById('mode_choice_8').value === "C49") {
			document.getElementById('mode_choice_4').innerHTML += '<option value="C40">NUSTATYTI TEKSTŲ KIEKĮ</option>';
            document.getElementById('mode_choice_4').innerHTML += '<option value="C39">NUSTATYTI LAIKO TRUKMĘ</option>';

		} else if (document.getElementById('mode_choice_8').value === "C83") {
			document.getElementById('mode_choice_4').innerHTML += '<option value="C40">NUSTATYTI SAKINIŲ KIEKĮ</option>';
            document.getElementById('mode_choice_4').innerHTML += '<option value="C39">NUSTATYTI LAIKO TRUKMĘ</option>';
		}
	} else {
		document.getElementById('mode_choice_4').innerHTML += '<option value="C40">NUSTATYTI VEIKSMŲ KIEKĮ</option>'; 
    	document.getElementById('mode_choice_4').innerHTML += '<option value="C39">NUSTATYTI LAIKO TRUKMĘ</option>';
	}
	updateModeChoice4();
}


document.getElementById('mode_choice').addEventListener('change', updateModeChoice4Options);
document.getElementById('mode_choice_8').addEventListener('change', updateModeChoice4Options);


timerInputChoiceElement.addEventListener("input", function(event) {
	setLabelEndingForDuration();
})

function setLabelEndingForDuration () {
	if (timerChoiceLabel) {
	if (parseInt(timerInputChoiceElement.value) === 1 || parseInt(timerInputChoiceElement.value.slice(-1)[0]) === 1 && parseInt(timerInputChoiceElement.value) !== 11) {
		timerChoiceLabel.innerHTML = 'minutę';
	} else if ((parseInt(timerInputChoiceElement.value) > 1 && parseInt(timerInputChoiceElement.value) < 10) || (parseInt(timerInputChoiceElement.value) > 20 && parseInt(timerInputChoiceElement.value.slice(-1)[0]) !== 0)) {
		timerChoiceLabel.innerHTML = 'minutes';
	} else if (parseInt(timerInputChoiceElement.value) >= 10 ) {
		timerChoiceLabel.innerHTML = 'minučių';
	}
}
}

const questionNumberInputChoiceElement = document.querySelector('#question-number-input');
let answerNumberLabelTeacher = document.querySelector('.answer-number-label');

questionNumberInputChoiceElement.addEventListener("input", function(event) {
	setLabelEndingForQuestionNumber();
})

function setLabelEndingForQuestionNumber () {
	if (answerNumberLabelTeacher) {
	if (document.getElementById('mode_choice').value === "lang") {
	if (document.getElementById('mode_choice_8').value === "C49") {
		if (parseInt(questionNumberInputChoiceElement.value) === 1 || parseInt(questionNumberInputChoiceElement.value.slice(-1)[0]) === 1 && parseInt(questionNumberInputChoiceElement.value) !== 11) {
			answerNumberLabelTeacher.innerHTML = 'tekstą';
		} else if ((parseInt(questionNumberInputChoiceElement.value) > 1 && parseInt(questionNumberInputChoiceElement.value) < 10) || (parseInt(questionNumberInputChoiceElement.value) > 20 && parseInt(questionNumberInputChoiceElement.value.slice(-1)[0]) !== 0))  {
			answerNumberLabelTeacher.innerHTML = 'tekstus';
		} else if (parseInt(questionNumberInputChoiceElement.value) >= 10) {
			answerNumberLabelTeacher.innerHTML = 'tekstų';
		}

	} else if (document.getElementById('mode_choice_8').value === "C83") {
		if (parseInt(questionNumberInputChoiceElement.value) === 1 || parseInt(questionNumberInputChoiceElement.value.slice(-1)[0]) === 1 && parseInt(questionNumberInputChoiceElement.value) !== 11) {
			answerNumberLabelTeacher.innerHTML = 'sakinį';
		} else if ((parseInt(questionNumberInputChoiceElement.value) > 1 && parseInt(questionNumberInputChoiceElement.value) < 10) || (parseInt(questionNumberInputChoiceElement.value) > 20 && parseInt(questionNumberInputChoiceElement.value.slice(-1)[0]) !== 0))  {
			answerNumberLabelTeacher.innerHTML = 'sakinius';
		} else if (parseInt(questionNumberInputChoiceElement.value) >= 10) {
			answerNumberLabelTeacher.innerHTML = 'sakinių';
		}
	}
	} else if (parseInt(questionNumberInputChoiceElement.value) === 1 || parseInt(questionNumberInputChoiceElement.value.slice(-1)[0]) === 1 && parseInt(questionNumberInputChoiceElement.value) !== 11) {
		answerNumberLabelTeacher.innerHTML = 'veiksmą';
	} else if ((parseInt(questionNumberInputChoiceElement.value) > 1 && parseInt(questionNumberInputChoiceElement.value) < 10) || (parseInt(questionNumberInputChoiceElement.value) > 20 && parseInt(questionNumberInputChoiceElement.value.slice(-1)[0]) !== 0))  {
		answerNumberLabelTeacher.innerHTML = 'veiksmus';
	} else if (parseInt(questionNumberInputChoiceElement.value) >= 10) {
		answerNumberLabelTeacher.innerHTML = 'veiksmų';
	}
}
}
// Configuration
const HOLD_CONFIG = {
    initialSpeed: 200,
    minSpeed: 50,
    speedMultiplier: 0.9,
    initialDelay: 300,
    vibration: true,
    vibrationDuration: 10 // milliseconds
};

// Shared state for hold operations
let holdInterval = null;
let holdTimeout = null;
let currentSpeed = HOLD_CONFIG.initialSpeed;

// Value change functions
function incrementValue(inputId, min, max, shouldVibrate = false) {
    const input = document.getElementById(inputId);
    let value = parseInt(input.value) || min;
    if (value < max) {
        input.value = value + 1;
        if (shouldVibrate) {
            triggerVibration();
        }
    }
    updateLabels();
}

function decrementValue(inputId, min, max, shouldVibrate = false) {
    const input = document.getElementById(inputId);
    let value = parseInt(input.value) || min;
    if (value > min) {
        input.value = value - 1;
        if (shouldVibrate) {
            triggerVibration();
        }
    }
    updateLabels();
}

function triggerVibration() {
    if (HOLD_CONFIG.vibration && navigator.vibrate) {
        navigator.vibrate(HOLD_CONFIG.vibrationDuration);
    }
}

function updateLabels() {
    if (typeof setLabelEndingForDuration === 'function') {
        setLabelEndingForDuration();
    }
    if (typeof setLabelEndingForQuestionNumber === 'function') {
        setLabelEndingForQuestionNumber();
    }
}

// Hold button logic with acceleration
function startHold(inputId, min, max, isIncrement) {
    // Immediate first action WITH vibration (single click)
    if (isIncrement) {
        incrementValue(inputId, min, max, true);
    } else {
        decrementValue(inputId, min, max, true);
    }
    
    currentSpeed = HOLD_CONFIG.initialSpeed;
    
    // Wait before starting continuous changes
    holdTimeout = setTimeout(() => {
        const repeat = () => {
            // No vibration during hold
            if (isIncrement) {
                incrementValue(inputId, min, max, false);
            } else {
                decrementValue(inputId, min, max, false);
            }
            
            // Accelerate: reduce interval time
            if (currentSpeed > HOLD_CONFIG.minSpeed) {
                currentSpeed = Math.max(
                    HOLD_CONFIG.minSpeed, 
                    currentSpeed * HOLD_CONFIG.speedMultiplier
                );
            }
            
            // Restart interval with new speed
            clearInterval(holdInterval);
            holdInterval = setInterval(repeat, currentSpeed);
        };
        
        holdInterval = setInterval(repeat, currentSpeed);
    }, HOLD_CONFIG.initialDelay);
}

function stopHold() {
    clearTimeout(holdTimeout);
    clearInterval(holdInterval);
    holdInterval = null;
    holdTimeout = null;
    currentSpeed = HOLD_CONFIG.initialSpeed;
}

// Validate number inputs
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('change', function() {
        const min = parseInt(this.min);
        const max = parseInt(this.max);
        let value = parseInt(this.value);
        
        if (isNaN(value) || value < min) {
            this.value = min;
        } else if (value > max) {
            this.value = max;
        }
        
        updateLabels();
    });
});

// Update controller for custom tasks (if not on uzduotys.html)
if (!window.location.pathname.endsWith('uzduotys.html')) {
    document.addEventListener('change', function(event) {
        if (event.target.matches("input[type='checkbox'], select")) {
            if (typeof updateControllerCustomTaskChoices === 'function') {
                updateControllerCustomTaskChoices();
            }
        }
    });

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('control-btn')) {
            if (typeof updateControllerCustomTaskChoices === 'function') {
                updateControllerCustomTaskChoices();
            }
        }
    });
}

// Setup hold button with acceleration
function setupHoldButton(buttonSelector, inputId, min, max, increment = true) {
    const button = document.querySelector(buttonSelector);
    if (!button) return;

    let localInterval = null;
    let localTimeout = null;
    let localSpeed = HOLD_CONFIG.initialSpeed;

    const changeValue = () => {
        const input = document.getElementById(inputId);
        if (!input) return;

        let val = parseInt(input.value) || 0;
        val = increment ? Math.min(val + 1, max) : Math.max(val - 1, min);
        input.value = val;

        updateLabels();
        
        if (typeof displayCustomTaskPotentialEarnings === 'function') {
            displayCustomTaskPotentialEarnings();
        }
    };

    const startHoldLocal = (e) => {
        e.preventDefault();
        
        changeValue(); // Immediate first change
        triggerVibration(); // Vibrate only on initial click
        localSpeed = HOLD_CONFIG.initialSpeed;
        
        localTimeout = setTimeout(() => {
            const repeat = () => {
                changeValue(); // No vibration during hold
                
                // Accelerate
                if (localSpeed > HOLD_CONFIG.minSpeed) {
                    localSpeed = Math.max(
                        HOLD_CONFIG.minSpeed,
                        localSpeed * HOLD_CONFIG.speedMultiplier
                    );
                }
                
                // Restart with new speed
                clearInterval(localInterval);
                localInterval = setInterval(repeat, localSpeed);
            };
            
            localInterval = setInterval(repeat, localSpeed);
        }, HOLD_CONFIG.initialDelay);
    };

    const stopHoldLocal = () => {
        clearTimeout(localTimeout);
        clearInterval(localInterval);
        localInterval = null;
        localTimeout = null;
        localSpeed = HOLD_CONFIG.initialSpeed;
    };

    // Mouse events
    button.addEventListener('mousedown', startHoldLocal);
    button.addEventListener('mouseup', stopHoldLocal);
    button.addEventListener('mouseleave', stopHoldLocal);
    
    // Touch events
    button.addEventListener('touchstart', startHoldLocal);
    button.addEventListener('touchend', stopHoldLocal);
    button.addEventListener('touchcancel', stopHoldLocal);
}

// Initialize hold buttons
setupHoldButton('.timer-minus', 'timer-input', 1, 60, false);
setupHoldButton('.timer-plus', 'timer-input', 1, 60, true);
setupHoldButton('.question-minus', 'question-number-input', 1, 200, false);
setupHoldButton('.question-plus', 'question-number-input', 1, 200, true);


function updateControllerCustomTaskChoices () {
    let modeChoiceSelection = document.querySelector('#mode_choice').value;
    if (!controller && localStorage.getItem('controller') !== null) {
        controller = JSON.parse(localStorage.getItem('controller'))
    }

    controller.mode = modeChoiceSelection;

    controller.language = "LT";

    if (controller.mode === "math") {
        modeChoice1Selection = modeChoice1Element.value;
        modeChoice2Selection = modeChoice2Element.value;
        selectedNumbers = [
                    Number(selectedNumberElement.value),
                    Number(selectedNumber2Element.value)
                ].sort((a, b) => a - b);
        modeChoice3Selection = modeChoice3Element.value;
        modeChoice5Selection = modeChoice5Element.value;
        modeChoice6Selection = modeChoice6Element.value;
        modeChoice7Selection = modeChoice7Element.value;

        var checkbox = document.getElementById("remainder-input");

        controller.modeChoice1 = modeChoice1Selection;
        controller.modeChoice2 = modeChoice2Selection;
        controller.selectedNumbers = selectedNumbers;
        controller.withRemainder = checkbox.checked;
        if (modeChoice3Selection === "C37") {
            controller.modeChoice3 = true;
        } else if (modeChoice3Selection === "C38") {
            controller.modeChoice3 = false;
        } else {
            controller.modeChoice3 = true;
        }
        controller.modeChoice5 = modeChoice5Selection;
        controller.modeChoice6 = modeChoice6Selection;
        controller.modeChoice7 = modeChoice7Selection;
        controller.modeChoice8 = 'C79';
        controller.result = ['', '', '', '', '']
        controller.task = null;
        controller.taskCompleted = false;
	    controller.taskRecorded = false;


    } else if (controller.mode === "lang") {
        const modeChoice8Value = document.querySelector('#mode_choice_8').value;
        const rasybaOptions = document.querySelectorAll('[name="rasyba-option"]');
        let anyChecked = false;
        rasybaOptions.forEach(option => {
        if (option.checked) {
            anyChecked = true;
        }
        });
    if ((modeChoice8Value === "C83" && anyChecked) || modeChoice8Value !== "C83") {
        modeChoice8Selection = modeChoice8Element.value;
        modeChoice9Selection = modeChoice9Element.value;
        modeChoice12Selection = modeChoice12Element.value;
        modeChoice13Selection = modeChoice13Element.value;
        modeChoice14Selection = modeChoice14Element.value;
        classChoiceSelection = classChoiceElement.value;

        controller.classChoice = classChoiceSelection;

        controller.modeChoice1 = modeChoice8Selection
       
        controller.modeChoice2 = modeChoice9Selection;
        
        controller.modeChoice3 = getSelectedRasybaConditions();
        controller.modeChoice5 = modeChoice12Selection;

        controller.modeChoice6 = modeChoice14Selection;

        controller.result = ['', '', '', '', ''];
        controller.modeChoiceLtDifficulty = document.getElementById('mode_choice_10').value;
        controller.questionFrequency = Number(modeChoice13Selection);
        controller.task = null;
        controller.taskCompleted = false;
	    controller.taskRecorded = false;
    }
}

controller.modeChoice4 = modeChoice4Element.value

displayCustomTaskPotentialEarnings();
}