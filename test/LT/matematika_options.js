let modeChoiceElement = document.querySelector('#mode_choice');
let modeChoice1Element = document.querySelector('#mode_choice_1');
let modeChoice2Element = document.querySelector('#mode_choice_2');
let numberLabel = document.querySelector('#number_label');
let selectedNumberElement = document.querySelector('#selected_number');
let numberLabel2 = document.querySelector('#number_label_2');
let selectedNumber2Element = document.querySelector('#selected_number_2');
let remainderOptionElement = document.querySelector('#remainder-option');
let modeChoice3Element = document.querySelector('#mode_choice_3');
let modeChoice5Element = document.querySelector('#mode_choice_5');
let modeChoice6Element = document.querySelector('#mode_choice_6');
let modeChoice7Element = document.querySelector('#mode_choice_7');
let timerInputDiv = document.querySelector('#timer-input-div');
let questionNumberInputDiv = document.querySelector('#question-number-input-div');
let modeChoice4Element = document.querySelector('#mode_choice_4');

let classChoiceElement = document.querySelector('#class_choice');
let modeChoice8Element = document.querySelector('#mode_choice_8');
let modeChoice9Element = document.querySelector('#mode_choice_9');
let modeChoice10Element = document.querySelector('#mode_choice_10');
let modeChoice11DivElement = document.querySelector('#mode_choice_11_div');
let modeChoice12Element = document.querySelector('#mode_choice_12');
let modeChoice13Element = document.querySelector('#mode_choice_13');
let rasybaOptionsLabelTextGaluneElement = document.querySelector('#rasyba-options-label-text-galune');



    function toggleVisibility(element, isVisible) {
        if (isVisible) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }

    function handleModeChoiceChange () {
        let modeChoiceSelection = modeChoiceElement.value;

        if (modeChoiceSelection === "kalba") {
            toggleVisibility(modeChoice1Element, false);
            toggleVisibility(modeChoice2Element, false);
            toggleVisibility(modeChoice3Element, false);
            toggleVisibility(modeChoice5Element, false);
            toggleVisibility(modeChoice6Element, false);
            toggleVisibility(modeChoice7Element, false);
            toggleVisibility(numberLabel, false);
            toggleVisibility(selectedNumberElement, false);
            toggleVisibility(numberLabel2, false);
            toggleVisibility(selectedNumber2Element, false);
            toggleVisibility(remainderOptionElement, false);

            toggleVisibility(classChoiceElement, true);
            toggleVisibility(modeChoice8Element, true);
            toggleVisibility(modeChoice9Element, true);
            toggleVisibility(modeChoice10Element, true);

            let changeEvent = new Event('change');
            modeChoice8Element.value = 'tekstas';
            modeChoice8Element.dispatchEvent(changeEvent);

        } else if (modeChoiceSelection === "matematika") {
            toggleVisibility(modeChoice1Element, true);
            let changeEvent = new Event('change');
            modeChoice1Element.value = "C1";
            modeChoice1Element.dispatchEvent(changeEvent);

            toggleVisibility(classChoiceElement, false);
            toggleVisibility(modeChoice8Element, false);
            toggleVisibility(modeChoice9Element, false);
            toggleVisibility(modeChoice10Element, false);
            toggleVisibility(modeChoice11DivElement, false);
            toggleVisibility(modeChoice12Element, false);
            toggleVisibility(modeChoice13Element, false);
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
        modeChoice3Element.innerHTML += '<option value="C37">PERŽENGIANT DEŠIMTĮ</option>';
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


function handleModeChoice8Change() { 
    let classChoiceSelection = classChoiceElement.value;
    let modeChoice8Selection = modeChoice8Element.value;
    let modeChoice9Selection = modeChoice9Element.value;
    modeChoice9Element.innerHTML = "";

    function toggleVisibility(element, isVisible) {
    if (isVisible) {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

if (modeChoice8Selection === "rasyba") {
    toggleVisibility(modeChoice10Element, false);
    modeChoice9Element.innerHTML += '<option value="C53">1 SAKINYS EKRANE</option>';
    modeChoice9Element.innerHTML += '<option value="C54">2 SAKINIAI EKRANE</option>';
    modeChoice9Element.innerHTML += '<option value="C55">3 SAKINIAI EKRANE</option>';
    modeChoice9Element.innerHTML += '<option value="C56">4 SAKINIAI EKRANE</option>';
    modeChoice9Element.innerHTML += '<option value="C57">5 SAKINIAI EKRANE</option>';
    toggleVisibility(modeChoice11DivElement, true);
    if (classChoiceSelection === "C75") {
        toggleVisibility(modeChoice13Element, true);
        toggleVisibility(modeChoice12Element, false);
        rasybaOptionsLabelTextGaluneElement.innerHTML = "ŽODŽIO PABAIGA";
    } else {
        toggleVisibility(modeChoice13Element, false);
        toggleVisibility(modeChoice12Element, true);
        rasybaOptionsLabelTextGaluneElement.innerHTML = "ŽODŽIO PABAIGA:";
    }
} else if (modeChoice8Selection === "tekstas") {
    toggleVisibility(modeChoice10Element, true);
    toggleVisibility(modeChoice11DivElement, false);
    toggleVisibility(modeChoice13Element, false);
    modeChoice9Element.innerHTML += '<option value="C51">TURINIO KOMPONAVIMĄ</option>';
    modeChoice9Element.innerHTML += '<option value="C52">STRUKTŪROS IŠDĖSTYMĄ</option>';

}
}

modeChoice8Element.addEventListener('change', handleModeChoice8Change);
classChoiceElement.addEventListener('change', handleModeChoice8Change);


function handleClassChoiceChange() {
if (classChoiceElement.value === "C75") {
    const elements = document.querySelectorAll('.options-for-third-fourth-classes');

    // Loop through each element and set its display style to "none"
    elements.forEach(function(element) {
        element.style.display = 'none';
    });

    const elements2 = document.querySelectorAll('.options-for-first-second-classes');

    // Loop through each element and set its display style to "none"
    elements2.forEach(function(element) {
        element.style.display = 'block';
    });

    const inputs = document.querySelectorAll('.options-for-third-fourth-classes-input');
    inputs.forEach(function(input) {
        input.checked = false;  // Uncheck the checkbox or radio button
    });

    const inputs2 = document.querySelectorAll('.options-for-first-second-classes-input');
    inputs2.forEach(function(input) {
        input.checked = true;  // Uncheck the checkbox or radio button
    });
} else if (classChoiceElement.value === "C76") {
    const elements = document.querySelectorAll('.options-for-third-fourth-classes');
    // Loop through each element and set its display style to "block"
    elements.forEach(function(element) {
        element.style.display = 'block';
    });

    const elements2 = document.querySelectorAll('.options-for-first-second-classes');
    // Loop through each element and set its display style to "block"
    elements2.forEach(function(element) {
        element.style.display = 'none';
    });

    const inputs = document.querySelectorAll('.options-for-third-fourth-classes-input');
    inputs.forEach(function(input) {
        input.checked = true;  // Uncheck the checkbox or radio button
    });

    const inputs2 = document.querySelectorAll('.options-for-first-second-classes-input');
    inputs2.forEach(function(input) {
        input.checked = false;  // Uncheck the checkbox or radio button
    });

}	
}

classChoiceElement.addEventListener('change', handleClassChoiceChange);


function getSelectedRasybaConditions() {
    const conditions = {};
  
    // Get all checked checkboxes for the "rasyba-option"
    const checkboxes = document.querySelectorAll('.rasyba-options:checked');
  
    // Iterate over each checkbox and add its value to the conditions object
    checkboxes.forEach(checkbox => {
      const name = checkbox.name;
      const value = JSON.parse(checkbox.value);
  
      // Merge the values into the dictionary entry (or create a new entry if it doesn't exist)
      Object.keys(value).forEach(key => {
        if (!conditions[key]) {
          conditions[key] = [];
        }
        conditions[key] = conditions[key].concat(value[key]);
      });
    });
  
    // Check if "ĮSIDĖMĖTINA RAŠYBA" checkbox is checked
    const isIsidmetinaChecked = document.getElementById("C66").checked;
  
    // If it's checked, get the selected radio button for klase
    if (isIsidmetinaChecked) {
      if (classChoiceElement.value === "C75") {
          conditions["C66"] = ["2kl"];
      } else if (classChoiceElement.value === "C76") {
          conditions["C66"] = ["4kl"];
      }
    } else {
      // If the "ĮSIDĖMĖTINA RAŠYBA" checkbox is not checked, remove the "C66" key
      delete conditions["C66"];
    }
  
    // Log the conditions object in the desired format
    return conditions;
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    // Get the "GALŪNĖS" checkbox and the "galuniu-div" element
    const galunesCheckbox = document.querySelector('input[value="GALŪNĖS"]');
    const galuniuDiv = document.getElementById('galuniu-div'); // Ensure the div has this ID
  
    // Function to sync the specific checkboxes related to "GALŪNĖS"
    const syncRelatedCheckboxes = (isChecked) => {
      const relatedCheckboxes = document.querySelectorAll('input[value=\'{"C62": []}\'], input[value=\'{"C63": [], "C64": []}\'], input[value=\'{"C65": []}\']');
  
      // Loop through each related checkbox and update its checked status
      relatedCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
      });
    };
  
    // Function to show/hide the "galuniu-div" based on the "GALŪNĖS" checkbox4
    const firstSecondClassEndingCheckbox = document.getElementById('first-second-class-endings');
    const toggleGaluniuDiv = (isChecked) => {
      if (isChecked) {
        galuniuDiv.style.display = 'block'; // Show the div
        firstSecondClassEndingCheckbox.checked = true;
      } else {
        galuniuDiv.style.display = 'none';  // Hide the div
        firstSecondClassEndingCheckbox.checked = false;
      }
    };
  
    // Initialize the visibility of the "galuniu-div" based on the initial checkbox state
    toggleGaluniuDiv(galunesCheckbox.checked);
  
    // Add event listener to "GALŪNĖS" checkbox
    galunesCheckbox.addEventListener('change', function() {
      syncRelatedCheckboxes(this.checked);
      toggleGaluniuDiv(this.checked); // Toggle the div visibility when the checkbox changes
    });
  });


const timerInputChoiceElement = document.querySelector('#timer-input');
let timerChoiceLabel = document.querySelector('.timer-choice-label');

function changeQuestionNumberLabel () {
	if (document.getElementById('answer-number-label')) {
	if (document.getElementById('mode_choice').value === "kalba") {
	if (document.getElementById('mode_choice_8').value === "tekstas") {
		if (document.getElementById('mode_choice_4').value === "C40") {
				document.getElementById("question-number-input").value = 5;
				document.getElementById('answer-number-label').innerHTML = 'tekstus';
			}
	} else if (document.getElementById('mode_choice_8').value === "rasyba") {
		if (document.getElementById('mode_choice_4').value === "C40") {
				document.getElementById("question-number-input").value = 20;
				document.getElementById('answer-number-label').innerHTML = 'sakinių';
			}
	} 
	} else {
		document.getElementById("question-number-input").value = 20;
		document.getElementById('answer-number-label').innerHTML = 'veiksmų';
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
	if (document.getElementById('mode_choice').value === "kalba") {
		if (document.getElementById('mode_choice_8').value === "tekstas") {
			document.getElementById('mode_choice_4').innerHTML += '<option value="C39">NUSTATYTI LAIKO TRUKMĘ</option>';
			document.getElementById('mode_choice_4').innerHTML += '<option value="C40">NUSTATYTI TEKSTŲ KIEKĮ</option>';

		} else if (document.getElementById('mode_choice_8').value === "rasyba") {
			document.getElementById('mode_choice_4').innerHTML += '<option value="C39">NUSTATYTI LAIKO TRUKMĘ</option>';
			document.getElementById('mode_choice_4').innerHTML += '<option value="C40">NUSTATYTI SAKINIŲ KIEKĮ</option>';
		}
	} else {
		document.getElementById('mode_choice_4').innerHTML += '<option value="C39">NUSTATYTI LAIKO TRUKMĘ</option>';
		document.getElementById('mode_choice_4').innerHTML += '<option value="C40">NUSTATYTI VEIKSMŲ KIEKĮ</option>'; 
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
	if (document.getElementById('mode_choice').value === "kalba") {
	if (document.getElementById('mode_choice_8').value === "tekstas") {
		if (parseInt(questionNumberInputChoiceElement.value) === 1 || parseInt(questionNumberInputChoiceElement.value.slice(-1)[0]) === 1 && parseInt(questionNumberInputChoiceElement.value) !== 11) {
			answerNumberLabelTeacher.innerHTML = 'tekstą';
		} else if ((parseInt(questionNumberInputChoiceElement.value) > 1 && parseInt(questionNumberInputChoiceElement.value) < 10) || (parseInt(questionNumberInputChoiceElement.value) > 20 && parseInt(questionNumberInputChoiceElement.value.slice(-1)[0]) !== 0))  {
			answerNumberLabelTeacher.innerHTML = 'tekstus';
		} else if (parseInt(questionNumberInputChoiceElement.value) >= 10) {
			answerNumberLabelTeacher.innerHTML = 'tekstų';
		}

	} else if (document.getElementById('mode_choice_8').value === "rasyba") {
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
function incrementValue(inputId, min, max) {
    const input = document.getElementById(inputId);
    let value = parseInt(input.value) || min;
    if (value < max) {
        input.value = value + 1;
    }
    setLabelEndingForDuration();
    setLabelEndingForQuestionNumber();
}

function decrementValue(inputId, min, max) {
    const input = document.getElementById(inputId);
    let value = parseInt(input.value) || min;
    if (value > min) {
        input.value = value - 1;
    }
    setLabelEndingForDuration();
    setLabelEndingForQuestionNumber();
}

// Validate input on change
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

        setLabelEndingForDuration();
        setLabelEndingForQuestionNumber();
    });
});
