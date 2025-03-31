let modeChoiceElement = document.querySelector('#mode_choice');
let numberLabel = document.querySelector('#number_label');
let modeChoice2Element = document.querySelector('#mode_choice_2');
let selectedNumberElement = document.querySelector('#selected_number');
let numberLabel2 = document.querySelector('#number_label_2');
let selectedNumber2Element = document.querySelector('#selected_number_2');
let remainderOptionElement = document.querySelector('#remainder-option');
let modeChoice3Element = document.querySelector('#mode_choice_3');
let emptySpaceholder = document.querySelector('#placeholder-bottom');
let modeChoice5Element = document.querySelector('#mode_choice_5');
let modeChoice6Element = document.querySelector('#mode_choice_6');
let modeChoice7Element = document.querySelector('#mode_choice_7');
let placeholderBeforeSkaitinisElement = document.querySelector('.placeholder-before-skaitinis');
let placeholderAfterNumbersElement = document.querySelector('#empty-placeholder-after-numbers');
let timerInputDiv = document.querySelector('#timer-input-div');
let questionNumberInputDiv = document.querySelector('#question-number-input-div');
let modeChoice4Element = document.querySelector('#mode_choice_4');

    function handleModeChoiceChange() {
        let modeChoiceSelection = modeChoiceElement.value;
        let modeChoice2Selection = modeChoice2Element.value;
        let modeChoice5Selection = modeChoice5Element.value;

        function toggleVisibility(element, isVisible) {
        if (isVisible) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }

        if (modeChoice5Selection === 'skaitiniai') {
            toggleVisibility(modeChoice7Element, true);
        } else {
            toggleVisibility(modeChoice7Element, false);
        }
        if (
                (modeChoiceSelection === 'daugyba' || modeChoiceSelection === 'dalyba' || modeChoiceSelection === 'daugyba ir dalyba') && 
                (
                    modeChoice2Selection !== 'pil10' && 
                    modeChoice2Selection !== 'pil' && 
                    modeChoice2Selection !== 'daugdvivien' && 
                    modeChoice2Selection !== 'daugtrivien' && 
                    modeChoice2Selection !== 'daugketvien' &&
                    modeChoice2Selection !== 'daugdvidvi' && 
                    modeChoice2Selection !== 'daugtridvi' && 
                    modeChoice2Selection !== 'daugketdvi' &&
                    modeChoice2Selection !== 'daugdaugvien' &&
                    modeChoice2Selection !== 'daugdaugviendalmnul' &&
                    modeChoice2Selection !== 'daugdaugdvi' &&
                    modeChoice2Selection !== 'daugdaug' &&
                    modeChoice2Selection !== 'mil' &&
                    modeChoice2Selection !== 'gretnul'
                )
            ) {
            toggleVisibility(numberLabel, true);
            toggleVisibility(selectedNumberElement, true);
            toggleVisibility(numberLabel2, true);
            toggleVisibility(selectedNumber2Element, true);
            toggleVisibility(modeChoice3Element, false);
            toggleVisibility(emptySpaceholder, true);
            toggleVisibility(placeholderBeforeSkaitinisElement, true);
            toggleVisibility(modeChoice5Element, true);
        } else if (modeChoiceSelection === 'sudetis' || modeChoiceSelection === 'atimtis' || modeChoiceSelection === 'sudetis ir atimtis') {
            toggleVisibility(numberLabel, false);
            toggleVisibility(selectedNumberElement, false);
            toggleVisibility(numberLabel2, false);
            toggleVisibility(selectedNumber2Element, false);
            toggleVisibility(modeChoice3Element, true);
            toggleVisibility(emptySpaceholder, true);
            toggleVisibility(placeholderBeforeSkaitinisElement, true);
            toggleVisibility(modeChoice5Element, true);
        } else {
            toggleVisibility(numberLabel, false);
            toggleVisibility(selectedNumberElement, false);
            toggleVisibility(numberLabel2, false);
            toggleVisibility(selectedNumber2Element, false);
            toggleVisibility(modeChoice3Element, false);
            toggleVisibility(emptySpaceholder, true);
            toggleVisibility(placeholderBeforeSkaitinisElement, false);
            toggleVisibility(modeChoice5Element, true);
        }
        if ((modeChoiceSelection === 'dalyba' || modeChoiceSelection === 'daugyba ir dalyba') && modeChoice2Selection === 'dauglent') {
            toggleVisibility(remainderOptionElement, true);
            toggleVisibility(placeholderBeforeSkaitinisElement, true);
            toggleVisibility(placeholderAfterNumbersElement, true)
        }
        else if (modeChoiceSelection === 'dalyba' || modeChoiceSelection === 'daugyba ir dalyba') {
            toggleVisibility(remainderOptionElement, true);
            toggleVisibility(placeholderBeforeSkaitinisElement, true);
            toggleVisibility(placeholderAfterNumbersElement, false)
        }
        else {
            toggleVisibility(remainderOptionElement, false);
            toggleVisibility(placeholderAfterNumbersElement, false)
        }
        if (modeChoiceSelection === 'visi') {
            toggleVisibility(modeChoice3Element, false);
            toggleVisibility(emptySpaceholder, false);
            toggleVisibility(placeholderBeforeSkaitinisElement, true);
        }
        if (modeChoice5Selection === 'skaitiniai') {
            toggleVisibility(modeChoice6Element, false)
        } else if (modeChoice5Selection === 'nezinomieji') {
            toggleVisibility(modeChoice6Element, true)					
        }
    }

function updateModeChoice2() {
    let modeChoiceSelection = modeChoiceElement.value;
    let modeChoice2Selection = modeChoice2Element.value;

    modeChoice2Element.innerHTML = "";
    modeChoice6Element.innerHTML = "";

    if (modeChoiceSelection === "sudetis") {
        modeChoice2Element.innerHTML += '<option value="viena10">VIENAŽENKLIŲ SKAIČIŲ IKI 10</option>';
        modeChoice2Element.innerHTML += '<option value="viena">VIENAŽENKLIŲ SKAIČIŲ IKI 20 (LENTELINĖ SUDĖTIS)</option>';
        modeChoice2Element.innerHTML += '<option value="dvivien20">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="dvivien">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="dvi">DVIŽENKLIŲ SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="tukst">SKAIČIŲ IKI 1 000</option>';
        modeChoice2Element.innerHTML += '<option value="dtukst">SKAIČIŲ IKI 10 000</option>';
        modeChoice2Element.innerHTML += '<option value="mil">SKAIČIŲ IKI 1 000 000</option>';
        modeChoice6Element.innerHTML += '<option value="turinys">NEŽINOMAS DĖMUO</option>';

    } else if (modeChoiceSelection === "atimtis") {
        modeChoice2Element.innerHTML += '<option value="viena10">VIENAŽENKLIŲ SKAIČIŲ IKI 10</option>';
        modeChoice2Element.innerHTML += '<option value="dvivien20">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="dvivien">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="dvi">DVIŽENKLIŲ SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="tukst">SKAIČIŲ IKI 1 000</option>';
        modeChoice2Element.innerHTML += '<option value="dtukst">SKAIČIŲ IKI 10 000</option>';
        modeChoice2Element.innerHTML += '<option value="mil">SKAIČIŲ IKI 1 000 000</option>';
        modeChoice2Element.innerHTML += '<option value="gretnul">KAI TURINYJE GRETIMI NULIAI</option>';
        modeChoice6Element.innerHTML += '<option value="turinys">NEŽINOMAS TURINYS</option>';
        modeChoice6Element.innerHTML += '<option value="ateminys">NEŽINOMAS ATĖMINYS</option>';

    } else if (modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice2Element.innerHTML += '<option value="viena10">VIENAŽENKLIŲ SKAIČIŲ IKI 10</option>';
        modeChoice2Element.innerHTML += '<option value="lent">LENTELINĖ SUDĖTIS IR ATIMTIS IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="dvivien20">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="dvivien">DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="dvi">DVIŽENKLIŲ SKAIČIŲ IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="tukst">SKAIČIŲ IKI 1 000</option>';
        modeChoice2Element.innerHTML += '<option value="dtukst">SKAIČIŲ IKI 10 000</option>';
        modeChoice2Element.innerHTML += '<option value="mil">SKAIČIŲ IKI 1 000 000</option>';
        modeChoice6Element.innerHTML += '<option value="turinys">NEŽINOMAS DĖMUO/TURINYS/ATĖMINYS</option>';

    } else if (modeChoiceSelection === "daugyba") {
        modeChoice2Element.innerHTML += '<option value="dauglent">DAUGYBOS LENTELĖ</option>';
        modeChoice2Element.innerHTML += '<option value="daugdvivien">DVIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugtrivien">TRIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugketvien">KETURŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaugvien">DAUGIAŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdvidvi">DVIŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugtridvi">TRIŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugketdvi">KETURŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaugdvi">DAUGIAŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaug">*DAUGIAŽENKLIŲ SKAIČIŲ</option>';
        modeChoice2Element.innerHTML += '<option value="pil10">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ (LENGVESNI)</option>';
        modeChoice2Element.innerHTML += '<option value="pil">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ/TŪKSTANČIŲ</option>';
        modeChoice6Element.innerHTML += '<option value="dalinys">NEŽINOMAS DAUGINAMASIS</option>';

    } else if (modeChoiceSelection === "dalyba") {
        modeChoice2Element.innerHTML += '<option value="dauglent">IŠ DAUGYBOS LENTELĖS</option>';
        modeChoice2Element.innerHTML += '<option value="daugdvivien">DVIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugtrivien">TRIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugketvien">KETURŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaugvien">DAUGIAŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaugviendalmnul">DAUGIAŽENKLIO IŠ VIENAŽENKLIO (DALMENYJE 0)</option>';
        modeChoice2Element.innerHTML += '<option value="daugtridvi">*TRIŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugketdvi">*KETURŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaugdvi">*DAUGIAŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaug">*DAUGIAŽENKLIŲ SKAIČIŲ</option>';
        modeChoice2Element.innerHTML += '<option value="pil10">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ (LENGVESNI)</option>';
        modeChoice2Element.innerHTML += '<option value="pil">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ/TŪKSTANČIŲ</option>';
        modeChoice6Element.innerHTML += '<option value="dalinys">NEŽINOMAS DALINYS</option>';
        modeChoice6Element.innerHTML += '<option value="daliklis">NEŽINOMAS DALIKLIS</option>';

    } else if (modeChoiceSelection === "daugyba ir dalyba") {
        modeChoice2Element.innerHTML += '<option value="dauglent">IŠ DAUGYBOS LENTELĖS</option>';
        modeChoice2Element.innerHTML += '<option value="daugdvivien">DVIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugtrivien">TRIŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugketvien">KETURŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaugvien">DAUGIAŽENKLIO IŠ VIENAŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugtridvi">*TRIŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugketdvi">*KETURŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaugdvi">*DAUGIAŽENKLIO IŠ DVIŽENKLIO</option>';
        modeChoice2Element.innerHTML += '<option value="daugdaug">*DAUGIAŽENKLIŲ SKAIČIŲ</option>';
        modeChoice2Element.innerHTML += '<option value="pil10">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ (LENGVESNI)</option>';
        modeChoice2Element.innerHTML += '<option value="pil">IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ/TŪKSTANČIŲ</option>';
        modeChoice6Element.innerHTML += '<option value="dalinys">NEŽINOMAS DAUGINAMASIS/DALINYS/DALIKLIS</option>';

    } else if (modeChoiceSelection === "visi") {
        modeChoice2Element.innerHTML += '<option value="iki10">IKI 10</option>';
        modeChoice2Element.innerHTML += '<option value="iki20">IKI 20</option>';
        modeChoice2Element.innerHTML += '<option value="iki100">IKI 100</option>';
        modeChoice2Element.innerHTML += '<option value="iki1000">IKI 1,000</option>';
        modeChoice2Element.innerHTML += '<option value="iki10000">IKI 10,000</option>';
        modeChoice2Element.innerHTML += '<option value="iki1000000">IKI 1,000,000</option>';
        modeChoice6Element.innerHTML += '<option value="dalinys">NEŽINOMAS DĖMUO/TURINYS/ATĖMINYS/DAUGINAMASIS/DALINYS/DALIKLIS</option>';
    }
}

modeChoiceElement.addEventListener('change', updateModeChoice2);


function updateModeChoice3() {
    let modeChoiceSelection = modeChoiceElement.value;
    let modeChoice2Selection = modeChoice2Element.value;

    modeChoice3Element.innerHTML = "";
    modeChoice5Element.innerHTML = "";
    modeChoice5Element.innerHTML += '<option value="skaitiniai">SKAITINĖ LYGYBĖ</option>';
    modeChoice5Element.innerHTML += '<option value="nezinomieji">SKAITINĖ LYGYBĖ SU NEŽINOMUOJU</option>';

    if (modeChoice2Selection === "viena" && modeChoiceSelection === "sudetis") {
        modeChoice3Element.innerHTML += '<option value="neper">PERŽENGIANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "viena" && modeChoiceSelection === "atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEIŠARDANT DEŠIMTIES</option>';
    } else if (modeChoice2Selection === "viena" && modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT/IŠARDANT DEŠIMTĮ</option>';

    } else if (modeChoice2Selection === "lent" && modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT/IŠARDANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "viena10" && modeChoiceSelection === "sudetis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT DEŠIMTIES</option>';
    } else if (modeChoice2Selection === "viena10" && modeChoiceSelection === "atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEIŠARDANT DEŠIMTIES</option>';
    } else if (modeChoice2Selection === "viena10" && modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';

    } else if (modeChoice2Selection === "dvivien20" && modeChoiceSelection === "sudetis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT DEŠIMTIES</option>';
    } else if (modeChoice2Selection === "dvivien20" && modeChoiceSelection === "atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="per10">IŠARDANT DEŠIMTĮ (LENTELINĖ ATIMTIS)</option>';
    } else if (modeChoice2Selection === "dvivien20" && modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';

    } else if (modeChoice2Selection === "dvivien" && modeChoiceSelection === "sudetis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "dvivien" && modeChoiceSelection === "atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="per10">IŠARDANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "dvivien" && modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT/IŠARDANT DEŠIMTĮ</option>';

    } else if (modeChoice2Selection === "dvi" && modeChoiceSelection === "sudetis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "dvi" && modeChoiceSelection === "atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="per10">IŠARDANT DEŠIMTĮ</option>';
    } else if (modeChoice2Selection === "dvi" && modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT/NEIŠARDANT DEŠIMTIES</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT/IŠARDANT DEŠIMTĮ</option>';

    } else if (modeChoice2Selection === "tukst" && modeChoiceSelection === "sudetis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "tukst" && modeChoiceSelection === "atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="per10">IŠARDANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "tukst" && modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT/NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT/IŠARDANT SKAIČIŲ SKYRIUS</option>';

    } else if (modeChoice2Selection === "dtukst" && modeChoiceSelection === "sudetis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "dtukst" && modeChoiceSelection === "atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="per10">IŠARDANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "dtukst" && modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT/NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT/IŠARDANT SKAIČIŲ SKYRIUS</option>';
    
    } else if (modeChoice2Selection === "mil" && modeChoiceSelection === "sudetis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "mil" && modeChoiceSelection === "atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="per10">IŠARDANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "mil" && modeChoiceSelection === "sudetis ir atimtis") {
        modeChoice3Element.innerHTML += '<option value="neper">NEPERŽENGIANT/NEIŠARDANT SKAIČIŲ SKYRIŲ</option>';
        modeChoice3Element.innerHTML += '<option value="per10">PERŽENGIANT/IŠARDANT SKAIČIŲ SKYRIUS</option>';
    } else if (modeChoice2Selection === "gretnul") {
        modeChoice3Element.innerHTML += '<option value="per10">IŠARDANT SKAIČIŲ SKYRIUS</option>';
    }
    
    else {
    }
}

modeChoiceElement.addEventListener('change', updateModeChoice3);
modeChoice2Element.addEventListener('change', updateModeChoice3);

function updateModeChoice7() {
    let modeChoice5Selection = modeChoice5Element.value;
    let modeChoice2Selection = modeChoice2Element.value;

    if (modeChoice5Selection === 'nezinomieji') {
        modeChoice7Element.innerHTML = '<option value="eilute">EILUTE</option>';
    } else if (modeChoice5Selection === 'skaitiniai' && modeChoice2Selection !== "dauglent" && modeChoice2Selection !== "pil10" && modeChoice2Selection !== "pil") {
        modeChoice7Element.innerHTML = '';
        modeChoice7Element.innerHTML += '<option value="eilute">EILUTE</option>';
        modeChoice7Element.innerHTML += '<option value="stulpeliu">STULPELIU / KAMPU</option>';
} else {
    modeChoice7Element.innerHTML = '';
    modeChoice7Element.innerHTML += '<option value="eilute">EILUTE</option>';
}
}

modeChoiceElement.addEventListener('change', updateModeChoice7);
modeChoice5Element.addEventListener('change', updateModeChoice7);
modeChoice2Element.addEventListener('change', updateModeChoice7);

modeChoiceElement.addEventListener('change', handleModeChoiceChange);
modeChoice2Element.addEventListener('change', handleModeChoiceChange);
modeChoice5Element.addEventListener('change', handleModeChoiceChange);


var checkbox = document.getElementById("remainder-input");
function updateModeChoice5() {
    if (checkbox.checked) {
        modeChoice5Element.innerHTML = '<option value="skaitiniai">SKAITINĖ LYGYBĖ</option>';
    } else {
        modeChoice5Element.innerHTML = '';
        modeChoice5Element.innerHTML += '<option value="skaitiniai">SKAITINĖ LYGYBĖ</option>';
        modeChoice5Element.innerHTML += '<option value="nezinomieji">SKAITINĖ LYGYBĖ SU NEŽINOMUOJU</option>';
    }
}


function updateModeChoice4() {
    let modeChoice4ElementSelection = modeChoice4Element.value;
    if (modeChoice4ElementSelection === "timer") {
        timerInputDiv.style.display = 'flex';
        questionNumberInputDiv.style.display = 'none';
    } else if (modeChoice4ElementSelection === "questionNumber") {
        timerInputDiv.style.display = 'none';
        questionNumberInputDiv.style.display = 'flex';
    }
}

modeChoice4Element.addEventListener('change', updateModeChoice4);

checkbox.addEventListener('change', updateModeChoice5);
checkbox.addEventListener('change', handleModeChoiceChange);
checkbox.addEventListener('change', updateModeChoice7);
