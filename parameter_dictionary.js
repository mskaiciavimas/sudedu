/* Texts used by the Apibendrinimas cards (sudedu-insights.js). Each key, and the sentence it goes into:
 *
 *  insightsListLabel - a name that stands on its own, capitalised. Mokymosi sritys list items:
 *      "1. {insightsListLabel} (68%)"   e.g. "1. Dviženkliai ir vienaženkliai skaičiai iki 100 (68%)"
 *    (also, lower-cased, inside longer list items: "…, {insightsListLabel} (22%)")
 *
 *  insightsOperationGenitive - an operation (C1-C7) in the genitive. Fills {op} in insightsTaskSetLocative.
 *
 *  insightsTaskSetLocative - a set of math tasks (by its number range, C8-C36, C77), "…užduotyse" - {op} is the
 *    task's operation (insightsOperationGenitive). Tendencijos, at the start of a sentence (capitalised):
 *      "{insightsTaskSetLocative} klaidų dažnis sumažėjo 40% (nuo apie 12 iki 7 klaidų per 100 veiksmų)."
 *      "{insightsTaskSetLocative} atlikimo greitis augo 25% (…)."
 *    e.g. "Dviženklio ir vienaženklio skaičių iki 100 sudėties ir atimties užduotyse klaidų dažnis sumažėjo 40%."
 *    (a value that needs a comma before "klaidų dažnis" ends with it: "…, kai turinyje yra gretimų nulių,")
 *    Graph title: "Klaidų dažnis {insightsTaskSetLocative}" / "Atlikimo greitis {insightsTaskSetLocative}".
 *
 *  insightsSpellingGenitive - a spelling category in the genitive. A spelling task set (up to 3 categories) in
 *    Tendencijos: "{A}, {B} bei {C} užduotyse klaidų dažnis …" - when they all end with " rašybos", only the last
 *    keeps it: "„E“ ir „Ė“, „I“ ir „Y“ bei minkštumo ženklo rašybos užduotyse klaidų dažnis sumažėjo 30%."
 */
const parameterDictionary = {
    "C1": {
        "parameter": "sudetis",
        "decodedParameterText": "SUDĖTIS",
        "insightsListLabel": "Sudėtis",
        "insightsOperationGenitive": "sudėties"
    },
    "C2": {
        "parameter": "atimtis",
        "decodedParameterText": "ATIMTIS",
        "insightsListLabel": "Atimtis",
        "insightsOperationGenitive": "atimties"
    },
    "C3": {
        "parameter": "sudetis ir atimtis",
        "decodedParameterText": "SUDĖTIS IR ATIMTIS",
        "insightsListLabel": "Sudėtis ir atimtis",
        "insightsOperationGenitive": "sudėties ir atimties"
    },
    "C4": {
        "parameter": "daugyba",
        "decodedParameterText": "DAUGYBA",
        "insightsListLabel": "Daugyba",
        "insightsOperationGenitive": "daugybos"
    },
    "C5": {
        "parameter": "dalyba",
        "decodedParameterText": "DALYBA",
        "insightsListLabel": "Dalyba",
        "insightsOperationGenitive": "dalybos"
    },
    "C6": {
        "parameter": "daugyba ir dalyba",
        "decodedParameterText": "DAUGYBA IR DALYBA",
        "insightsListLabel": "Daugyba ir dalyba",
        "insightsOperationGenitive": "daugybos ir dalybos"
    },
    "C7": {
        "parameter": "visi",
        "decodedParameterText": "ĮVAIRŪS VEIKSMAI",
        "insightsListLabel": "Įvairūs veiksmai",
        "insightsOperationGenitive": "įvairių veiksmų"
    },
    "C8": {
        "parameter": "viena10",
        "decodedParameterText": "VIENAŽENKLIŲ SKAIČIŲ IKI 10",
        "insightsListLabel": "Vienaženkliai skaičiai iki 10",
        "insightsTaskSetLocative": "vienaženklių skaičių iki 10 {op} užduotyse"
    },
    "C9": {
        "parameter": "viena",
        "decodedParameterText": "VIENAŽENKLIŲ SKAIČIŲ IKI 20 (LENTELINĖ SUDĖTIS)",
        "insightsListLabel": "Vienaženkliai skaičiai iki 20 (lentelinė sudėtis)",
        "insightsTaskSetLocative": "vienaženklių skaičių iki 20 lentelinės {op} užduotyse"
    },
    "C10": {
        "parameter": "dvivien20",
        "decodedParameterText": "DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 20",
        "insightsListLabel": "Dviženkliai ir vienaženkliai skaičiai iki 20",
        "insightsTaskSetLocative": "dviženklio ir vienaženklio skaičių iki 20 {op} užduotyse"
    },
    "C11": {
        "parameter": "dvivien",
        "decodedParameterText": "DVIŽENKLIO IR VIENAŽENKLIO SKAIČIŲ IKI 100",
        "insightsListLabel": "Dviženkliai ir vienaženkliai skaičiai iki 100",
        "insightsTaskSetLocative": "dviženklio ir vienaženklio skaičių iki 100 {op} užduotyse"
    },
    "C12": {
        "parameter": "dvi",
        "decodedParameterText": "DVIŽENKLIŲ SKAIČIŲ IKI 100",
        "insightsListLabel": "Dviženkliai skaičiai iki 100",
        "insightsTaskSetLocative": "dviženklių skaičių iki 100 {op} užduotyse"
    },
    "C13": {
        "parameter": "tukst",
        "decodedParameterText": "SKAIČIŲ IKI 1 000",
        "insightsListLabel": "Skaičiai iki 1 000",
        "insightsTaskSetLocative": "skaičių iki 1 000 {op} užduotyse"
    },
    "C14": {
        "parameter": "dtukst",
        "decodedParameterText": "SKAIČIŲ IKI 10 000",
        "insightsListLabel": "Skaičiai iki 10 000",
        "insightsTaskSetLocative": "skaičių iki 10 000 {op} užduotyse"
    },
    "C15": {
        "parameter": "mil",
        "decodedParameterText": "SKAIČIŲ IKI 1 000 000",
        "insightsListLabel": "Skaičiai iki 1 000 000",
        "insightsTaskSetLocative": "skaičių iki 1 000 000 {op} užduotyse"
    },
    "C16": {
        "parameter": "gretnul",
        "decodedParameterText": "KAI TURINYJE GRETIMI NULIAI",
        "insightsListLabel": "Veiksmai, kai turinyje gretimi nuliai",
        "insightsTaskSetLocative": "{op} užduotyse, kai turinyje yra gretimų nulių,"
    },
    "C17": {
        "parameter": "lent",
        "decodedParameterText": "LENTELINĖ SUDĖTIS IR ATIMTIS IKI 20",
        "insightsListLabel": "Lentelinė sudėtis ir atimtis iki 20",
        "insightsTaskSetLocative": "lentelinės {op} iki 20 užduotyse"
    },
    "C18": {
        "parameter": "dauglent",
        "decodedParameterText": "DAUGYBOS LENTELĖ",
        "insightsListLabel": "Daugybos lentelė",
        "insightsTaskSetLocative": "{op} pagal daugybos lentelę užduotyse"
    },
    "C19": {
        "parameter": "daugdvivien",
        "decodedParameterText": "DVIŽENKLIO IŠ VIENAŽENKLIO",
        "insightsListLabel": "Dviženklis skaičius su vienaženkliu",
        "insightsTaskSetLocative": "dviženklio skaičiaus su vienaženkliu {op} užduotyse"
    },
    "C20": {
        "parameter": "daugtrivien",
        "decodedParameterText": "TRIŽENKLIO IŠ VIENAŽENKLIO",
        "insightsListLabel": "Triženklis skaičius su vienaženkliu",
        "insightsTaskSetLocative": "triženklio skaičiaus su vienaženkliu {op} užduotyse"
    },
    "C21": {
        "parameter": "daugketvien",
        "decodedParameterText": "KETURŽENKLIO IŠ VIENAŽENKLIO",
        "insightsListLabel": "Keturženklis skaičius su vienaženkliu",
        "insightsTaskSetLocative": "keturženklio skaičiaus su vienaženkliu {op} užduotyse"
    },
    "C22": {
        "parameter": "daugdaugvien",
        "decodedParameterText": "DAUGIAŽENKLIO IŠ VIENAŽENKLIO",
        "insightsListLabel": "Daugiaženklis skaičius su vienaženkliu",
        "insightsTaskSetLocative": "daugiaženklio skaičiaus su vienaženkliu {op} užduotyse"
    },
    "C23": {
        "parameter": "daugdvidvi",
        "decodedParameterText": "DVIŽENKLIO IŠ DVIŽENKLIO",
        "insightsListLabel": "Dviženklis skaičius su dviženkliu",
        "insightsTaskSetLocative": "dviženklio skaičiaus su dviženkliu {op} užduotyse"
    },
    "C24": {
        "parameter": "daugtridvi",
        "decodedParameterText": "TRIŽENKLIO IŠ DVIŽENKLIO",
        "insightsListLabel": "Triženklis skaičius su dviženkliu",
        "insightsTaskSetLocative": "triženklio skaičiaus su dviženkliu {op} užduotyse"
    },
    "C25": {
        "parameter": "daugketdvi",
        "decodedParameterText": "KETURŽENKLIO IŠ DVIŽENKLIO",
        "insightsListLabel": "Keturženklis skaičius su dviženkliu",
        "insightsTaskSetLocative": "keturženklio skaičiaus su dviženkliu {op} užduotyse"
    },
    "C26": {
        "parameter": "daugdaugdvi",
        "decodedParameterText": "DAUGIAŽENKLIO IŠ DVIŽENKLIO",
        "insightsListLabel": "Daugiaženklis skaičius su dviženkliu",
        "insightsTaskSetLocative": "daugiaženklio skaičiaus su dviženkliu {op} užduotyse"
    },
    "C27": {
        "parameter": "daugdaug",
        "decodedParameterText": "*DAUGIAŽENKLIŲ SKAIČIŲ",
        "insightsListLabel": "Daugiaženkliai skaičiai",
        "insightsTaskSetLocative": "daugiaženklių skaičių {op} užduotyse"
    },
    "C28": {
        "parameter": "pil10",
        "decodedParameterText": "IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ (LENGVESNI)",
        "insightsListLabel": "Pilnos dešimtys ir šimtai (lengvesni)",
        "insightsTaskSetLocative": "lengvesnėse pilnų dešimčių ir šimtų {op} užduotyse"
    },
    "C29": {
        "parameter": "pil",
        "decodedParameterText": "IŠ PILNŲ DEŠIMČIŲ/ŠIMTŲ/TŪKSTANČIŲ",
        "insightsListLabel": "Pilnos dešimtys, šimtai ir tūkstančiai",
        "insightsTaskSetLocative": "pilnų dešimčių, šimtų ir tūkstančių {op} užduotyse"
    },
    "C30": {
        "parameter": "daugdaugviendalmnul",
        "decodedParameterText": "DAUGIAŽENKLIO IŠ VIENAŽENKLIO (DALMENYJE 0)",
        "insightsListLabel": "Daugiaženklis skaičius su vienaženkliu (dalmenyje 0)",
        "insightsTaskSetLocative": "daugiaženklio skaičiaus su vienaženkliu {op} užduotyse, kai dalmenyje yra 0,"
    },
    "C31": {
        "parameter": "iki10",
        "decodedParameterText": "IKI 10",
        "insightsListLabel": "Skaičiai iki 10 (įvairūs veiksmai)",
        "insightsTaskSetLocative": "skaičių iki 10 {op} užduotyse"
    },
    "C32": {
        "parameter": "iki20",
        "decodedParameterText": "IKI 20",
        "insightsListLabel": "Skaičiai iki 20 (įvairūs veiksmai)",
        "insightsTaskSetLocative": "skaičių iki 20 {op} užduotyse"
    },
    "C33": {
        "parameter": "iki100",
        "decodedParameterText": "IKI 100",
        "insightsListLabel": "Skaičiai iki 100 (įvairūs veiksmai)",
        "insightsTaskSetLocative": "skaičių iki 100 {op} užduotyse"
    },
    "C34": {
        "parameter": "iki1000",
        "decodedParameterText": "IKI 1 000",
        "insightsListLabel": "Skaičiai iki 1 000 (įvairūs veiksmai)",
        "insightsTaskSetLocative": "skaičių iki 1 000 {op} užduotyse"
    },
    "C35": {
        "parameter": "iki10000",
        "decodedParameterText": "IKI 10 000",
        "insightsListLabel": "Skaičiai iki 10 000 (įvairūs veiksmai)",
        "insightsTaskSetLocative": "skaičių iki 10 000 {op} užduotyse"
    },
    "C36": {
        "parameter": "iki1000000",
        "decodedParameterText": "IKI 1 000 000",
        "insightsListLabel": "Skaičiai iki 1 000 000 (įvairūs veiksmai)",
        "insightsTaskSetLocative": "skaičių iki 1 000 000 {op} užduotyse"
    },
    "C37": {
        "parameter": "neper",
        "decodedParameterText": "NEPERGRUPUOJANT SKAIČIŲ SKYRIŲ",
        "insightsListLabel": "Nepergrupuojant skaičių skyrių"
    },
    "C38": {
        "parameter": "per10",
        "decodedParameterText": "PERGRUPUOJANT SKAIČIŲ SKYRIUS",
        "insightsListLabel": "Pergrupuojant skaičių skyrius"
    },
    "C39": {
        "parameter": "timer",
        "decodedParameterText": "NUSTATYTI LAIKO TRUKMĘ"
    },
    "C40": {
        "parameter": "questionNumber",
        "decodedParameterText": "NUSTATYTI KLAUSIMŲ KIEKĮ"
    },
    "C41": {
        "parameter": "skaitiniai",
        "decodedParameterText": "SKAITINĖ LYGYBĖ",
        "insightsListLabel": "Skaitinė lygybė"
    },
    "C42": {
        "parameter": "nezinomieji",
        "decodedParameterText": "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU",
        "insightsListLabel": "Skaitinė lygybė su nežinomuoju"
    },
    "C43": {
        "parameter": "turinys",
        "decodedParameterText": "NEŽINOMAS DĖMUO",
        "insightsListLabel": "Nežinomas dėmuo"
    },
    "C44": {
        "parameter": "ateminys",
        "decodedParameterText": "NEŽINOMAS ATĖMINYS",
        "insightsListLabel": "Nežinomas atėminys"
    },
    "C45": {
        "parameter": "dalinys",
        "decodedParameterText": "NEŽINOMAS DAUGINAMASIS",
        "insightsListLabel": "Nežinomas dauginamasis"
    },
    "C46": {
        "parameter": "daliklis",
        "decodedParameterText": "NEŽINOMAS DALIKLIS",
        "insightsListLabel": "Nežinomas daliklis"
    },
    "C47": {
        "parameter": "eilute",
        "decodedParameterText": "EILUTE",
        "insightsListLabel": "Eilute"
    },
    "C48": {
        "parameter": "stulpeliu",
        "decodedParameterText": "STULPELIU / KAMPU",
        "insightsListLabel": "Stulpeliu / kampu"
    },
    "C47-C48": {
        "parameter": "eilute-stulpeliu",
        "decodedParameterText": "EILUTE ARBA STULPELIU / KAMPU"
    },
    "C49": {
        "parameter": "text-comprehension",
        "decodedParameterText": "TEKSTO SUPRATIMAS",
        "insightsListLabel": "Teksto supratimas"
    },
    "C50": {
        "parameter": "spelling",
        "decodedParameterText": "RAŠYBA",
        "insightsListLabel": "Rašyba"
    },
    "C51": {
        "parameter": "komponavimas",
        "decodedParameterText": "TURINIO KOMPONAVIMAS",
        "insightsListLabel": "Turinio komponavimas"
    },
    "C52": {
        "parameter": "isdestymas",
        "decodedParameterText": "STRUKTŪROS IŠDĖSTYMAS",
        "insightsListLabel": "Struktūros išdėstymas"
    },
    "C53": {
        "parameter": "vsak",
        "decodedParameterText": "1 SAKINYS EKRANE"
    },
    "C54": {
        "parameter": "dsak",
        "decodedParameterText": "2 SAKINIAI EKRANE"
    },
    "C55": {
        "parameter": "tsak",
        "decodedParameterText": "3 SAKINIAI EKRANE"
    },
    "C56": {
        "parameter": "ksak",
        "decodedParameterText": "4 SAKINIAI EKRANE"
    },
    "C57": {
        "parameter": "psak",
        "decodedParameterText": "5 SAKINIAI EKRANE"
    },
    "C58": {
        "parameter": "lengvas",
        "decodedParameterText": "LENGVAS LYGIS",
        "insightsListLabel": "Lengvas lygis"
    },
    "C59": {
        "parameter": "vidutinis",
        "decodedParameterText": "VIDUTINIS LYGIS",
        "insightsListLabel": "Vidutinis lygis"
    },
    "C60": {
        "parameter": "sunkus",
        "decodedParameterText": "SUNKUS LYGIS",
        "insightsListLabel": "Sunkus lygis"
    },
    "C61": {
        "parameter": "j-c",
        "decodedParameterText": "H - CH - F",
        "insightsListLabel": "„H“, „CH“ ir „F“ rašyba",
        "insightsSpellingGenitive": "„H“, „CH“ ir „F“ rašybos"
    },
    "C62": {
        "parameter": "dkt",
        "decodedParameterText": "DAIKTAVARDŽIO GALŪNĖ",
        "insightsListLabel": "Daiktavardžių galūnės",
        "insightsSpellingGenitive": "daiktavardžių galūnių rašybos"
    },
    "C63": {
        "parameter": "bdv",
        "decodedParameterText": "BŪDVARDŽIO GALŪNĖ",
        "insightsListLabel": "Būdvardžių galūnės",
        "insightsSpellingGenitive": "būdvardžių galūnių rašybos"
    },
    "C64": {
        "parameter": "sudr",
        "decodedParameterText": "SUDURTINIAI ŽODŽIAI",
        "insightsListLabel": "Sudurtiniai žodžiai",
        "insightsSpellingGenitive": "sudurtinių žodžių rašybos"
    },
    "C65": {
        "parameter": "vks",
        "decodedParameterText": "VEIKSMAŽODŽIO GALŪNĖ",
        "insightsListLabel": "Veiksmažodžių galūnės",
        "insightsSpellingGenitive": "veiksmažodžių galūnių rašybos"
    },
    "C66": {
        "parameter": "įsi-r",
        "decodedParameterText": "ĮSIDĖMĖTINA RAŠYBA",
        "insightsListLabel": "Įsidėmėtina rašyba",
        "insightsSpellingGenitive": "įsidėmėtinos rašybos"
    },
    "C67": {
        "parameter": "fsc-con",
        "decodedParameterText": "PANAŠIAI SKAMBANČIOS PRIEBALSĖS",
        "insightsListLabel": "Panašiai skambančios priebalsės",
        "insightsSpellingGenitive": "panašiai skambančių priebalsių rašybos"
    },
    "C68": {
        "parameter": "fsc-vow",
        "decodedParameterText": "DVIBALSIAI",
        "insightsListLabel": "Dvibalsiai",
        "insightsSpellingGenitive": "dvibalsių rašybos"
    },
    "C69": {
        "parameter": "prš",
        "decodedParameterText": "PRIEŠDĖLIAI",
        "insightsListLabel": "Priešdėliai",
        "insightsSpellingGenitive": "priešdėlių rašybos"
    },
    "C70": {
        "parameter": "prs",
        "decodedParameterText": "PRIESAGOS",
        "insightsListLabel": "Priesagos",
        "insightsSpellingGenitive": "priesagų rašybos"
    },
    "C71": {
        "parameter": "asim",
        "decodedParameterText": "PRIEBALSIŲ SUPANAŠĖJIMAS",
        "insightsListLabel": "Priebalsių supanašėjimas",
        "insightsSpellingGenitive": "priebalsių supanašėjimo"
    },
    "C72": {
        "parameter": "md",
        "decodedParameterText": "MIŠRIEJI DVIGARSIAI",
        "insightsListLabel": "Mišrieji dvigarsiai",
        "insightsSpellingGenitive": "mišriųjų dvigarsių rašybos"
    },
    "C73": {
        "parameter": "lengvesnes",
        "decodedParameterText": "LENGVESNĖS ŽODŽIŲ PABAIGŲ KOMBINACIJOS"
    },
    "C74": {
        "parameter": "sunkesnes",
        "decodedParameterText": "SUNKESNĖS ŽODŽIŲ PABAIGŲ KOMBINACIJOS"
    },
    "C73-C74": {
        "parameter": "sunkesnes-ir-sunkesnes",
        "decodedParameterText": "LENGVESNĖS IR SUNKESNĖS ŽODŽIŲ PABAIGŲ KOMBINACIJOS"
    },
    "C75": {
        "parameter": "pirma-antra",
        "decodedParameterText": "1-2 KLASĖ",
        "insightsListLabel": "1–2 klasė"
    },
    "C76": {
        "parameter": "trecia-ketvirta",
        "decodedParameterText": "3-4 KLASĖ",
        "insightsListLabel": "3–4 klasė"
    },
    "C77": {
        "parameter": "pil100",
        "decodedParameterText": "IŠ PILNŲ ŠIMTŲ",
        "insightsListLabel": "Pilni šimtai",
        "insightsTaskSetLocative": "pilnų šimtų {op} užduotyse"
    },
    "C78": {
        "parameter": "C78",
        "decodedParameterText": "US/UK/INDONESIA VERSION"
    },
    "C79": {
        "parameter": "C79",
        "decodedParameterText": "EASTERN EUROPE VERSION"
    },
    "C80": {
        "parameter": "beDis",
        "decodedParameterText": "BE DISTRAKTORIAUS",
        "insightsListLabel": "Be distraktoriaus"
    },
    "C81": {
        "parameter": "sudDis",
        "decodedParameterText": "SU DISTRAKTORIUMI",
        "insightsListLabel": "Su distraktoriumi"
    },
    "C82": {
        "parameter": "randomTexts",
        "decodedParameterText": "ATSITIKTINIAI TEKSTAI",
        "insightsListLabel": "Atsitiktiniai tekstai"
    },
    "C83": {
        "parameter": "gramatika",
        "decodedParameterText": "GRAMATIKA"
    },
    "C84": {
        "parameter": "selectedTexts",
        "decodedParameterText": "PARINKTI TEKSTAI",
        "insightsListLabel": "Parinkti tekstai"
    },
    "C85": {
        "parameter": "fsc-vg-gal-c",
        "decodedParameterText": "KĄ VIENĄ?",
        "insightsListLabel": "Galininko galūnės (ką vieną?)",
        "insightsSpellingGenitive": "galininko galūnių (ką vieną?) rašybos"
    },
    "C86": {
        "parameter": "fsc-dk-gal-c",
        "decodedParameterText": "KO DAUG?",
        "insightsListLabel": "Daugiskaitos kilmininko galūnės (ko daug?)",
        "insightsSpellingGenitive": "daugiskaitos kilmininko galūnių (ko daug?) rašybos"
    },
    "C87": {
        "parameter": "fsc-vvt-gal-c",
        "decodedParameterText": "KUR KAME?",
        "insightsListLabel": "Vietininko galūnės (kur kame?)",
        "insightsSpellingGenitive": "vietininko galūnių (kur kame?) rašybos"
    },
    "C88": {
        "parameter": "vow-e-c",
        "decodedParameterText": "E - Ė",
        "insightsListLabel": "„E“ ir „Ė“",
        "insightsSpellingGenitive": "„E“ ir „Ė“ rašybos"
    },
    "C89": {
        "parameter": "vow-i-c",
        "decodedParameterText": "I - Y",
        "insightsListLabel": "„I“ ir „Y“",
        "insightsSpellingGenitive": "„I“ ir „Y“ rašybos"
    },
    "C90": {
        "parameter": "vow-u-c",
        "decodedParameterText": "U - Ū",
        "insightsListLabel": "„U“ ir „Ū“",
        "insightsSpellingGenitive": "„U“ ir „Ū“ rašybos"
    },
    "C91": {
        "parameter": "soft-sign",
        "decodedParameterText": "MINKŠTUMO ŽENKLAS",
        "insightsListLabel": "Minkštumo ženklas",
        "insightsSpellingGenitive": "minkštumo ženklo rašybos"
    },
    "C92": {
        "parameter": "prv",
        "decodedParameterText": "PRIEVEIKSMIO PABAIGA",
        "insightsListLabel": "Prieveiksmių pabaigos",
        "insightsSpellingGenitive": "prieveiksmių pabaigų rašybos"
    }
}

/* The spelling mistake patterns' texts (Klaidų dėsningumai and the Apibendrinimas cards; sudedu-insights.js reads them as
 * INSIGHTS). Each pattern, by its key:
 *  label - the pattern's name, the title of its line in "Klaidų dėsningumai":  "{label}   27% atvejų"
 *  area  - where the mistakes are, inside sentences (a phrase that follows the verb):
 *      Klaidos: "Nustatytu laikotarpiu dažniausiai buvo klystama {area}, {area} ir {area}."
 *               "Dažniausiai klystama {area}." / "Klystama {area}." / "Klaidų nedaug – pavieniais atvejais suklysta {area}."
 *        (several areas are joined: "… minkštumo ženklo bei trumpųjų ir ilgųjų balsių rašyboje ir painiojant …")
 *      Tendencijos: "Klaidų {area} sumažėjo 40% (nuo apie 24% iki 13% atvejų)."
 *  note  - (optional) a short remark in fainter letters right under the pattern's name
 *  tip   - advice under the pattern's line in "Klaidų dėsningumai"
 *  topic - the pattern as a noun phrase (not shown at the moment)
 * (math mistake patterns are built from the operations' names in sudedu-insights.js, not listed here)
 */
const insightsMistakePatterns = {
        raides: { area: 'painiojant panašias raides', label: 'Painioja raides', topic: 'panašių raidžių painiojimas',
            tip: '' },
        garsai: { area: 'painiojant panašius garsus („g“–„h“, „k“–„ch“, „p“–„f“)', label: 'Painioja garsus', topic: 'panašių garsų painiojimas',
            tip: '' },
        minkst: { area: 'minkštumo ženklo rašyboje', label: 'Minkštumo ženklo rašyba', topic: 'minkštumo ženklo rašyba',
            tip: 'Klaidos, kai praleidžiamas minkštumo ženklas „i“ (pvz., „kelas“ vietoje „kelias“) arba parašomas ten, kur jo neturi būti (pvz., po „j“: „jiūra“ vietoje „jūra“).' },
        vietininkas: { area: 'vietininko galūnių rašyboje', label: 'Vietininko galūnės rašyba', topic: 'vietininko galūnės rašyba',
            tip: 'Klaidos vienaskaitos vietininko galūnėje (kur? kame? – mieste, klasėje).' },
        e_ee: { area: 'painiojant „e“ su „ė“', label: 'Maišo „e“ ir „ė“', topic: '„e“ ir „ė“ painiojimas',
            tip: '' },
        ilgi: { area: 'trumpųjų ir ilgųjų balsių rašyboje', label: 'Trumpųjų ir ilgųjų balsių rašyba', topic: 'trumpųjų ir ilgųjų balsių („i“–„y“, „u“–„ū“) rašyba',
            tip: '' },
        md: { area: 'mišriųjų dvigarsių rašyboje', label: 'Mišriųjų dvigarsių rašyba', topic: 'mišriųjų dvigarsių rašyba',
            tip: 'Klaidos mišriuosiuose dvigarsiuose („al“, „am“, „an“, „ar“, „el“, „em“, „en“, „er“, „il“, „im“, „in“, „ir“, „ul“, „um“, „un“, „ur“).' },
        dvibalsiai: { area: 'dvibalsių rašyboje', label: 'Dvibalsių rašyba', topic: 'dvibalsių rašyba',
            tip: 'Klaidos dvibalsiuose („ai“, „au“, „ei“, „ie“, „ui“, „uo“).' },
        ee_ie: { area: 'painiojant „ė“ su „ie“', label: 'Maišo „ė“ su „ie“', topic: '„ė“ ir „ie“ painiojimas',
            tip: '' },
        e_ie: { area: 'painiojant „e“ su „ie“', label: 'Maišo „e“ su „ie“', topic: '„e“ ir „ie“ painiojimas',
            tip: '' },
        ie_ei: { area: 'painiojant „ie“ su „ei“', label: 'Maišo „ie“ su „ei“', topic: '„ie“ ir „ei“ painiojimas',
            tip: '' },
        ie_ia: { area: 'painiojant „ie“ su „ia“', label: 'Maišo „ie“ su „ia“', topic: '„ie“ ir „ia“ painiojimas',
            tip: '' },
        dzh: { area: 'painiojant „dž“, „d“ ir „ž“', label: 'Maišo „dž“, „d“ ir „ž“', topic: '„dž“, „d“ ir „ž“ painiojimas',
            tip: 'Klaidos, kai „dž“ (vienas garsas, rašomas dviem raidėmis) painiojamas su „d“ ar „ž“ (pvz., džiaugsmas).' },
        dz: { area: 'painiojant „dz“, „d“ ir „z“', label: 'Maišo „dz“, „d“ ir „z“', topic: '„dz“, „d“ ir „z“ painiojimas',
            tip: 'Klaidos, kai „dz“ (vienas garsas, rašomas dviem raidėmis) painiojamas su „d“ ar „z“ (pvz., dzūkas).' },
        ia_e_nos: { area: 'painiojant „ią“ su „ę“', label: 'Painioja „ią“ ir „ę“', topic: '„ią“ ir „ę“ painiojimas',
            tip: 'Klaidos galininko galūnėje, kai „ią“ painiojamas su „ę“ (kėdė – kėdę, vyšnia – vyšnią).' },
        ui: { area: 'dvibalsio „ui“ rašyboje', label: 'Dvibalsio „ui“ rašyba', topic: 'dvibalsio „ui“ rašyba',
            tip: 'Klaidos, kai vietoje dvibalsio „ui“ rašoma „uj“ (pvz., muilas).' },
        prv_iai: { area: 'prieveiksmių priesagos „-iai“ rašyboje', label: 'Prieveiksmio priesagos „-iai“ rašyba', topic: 'prieveiksmio priesagos „-iai“ rašyba',
            tip: 'Klaidos prieveiksmių priesagoje, kai vietoje „-iai“ rašoma „-ei“ (pvz., gražiai, tyliai).' },
        dkt_dgs_v: { area: 'daiktavardžių daugiskaitos vardininko galūnių rašyboje', label: 'Dkt. dgs. vardininko galūnės rašyba', topic: 'daiktavardžio daugiskaitos vardininko galūnės rašyba',
            tip: 'Klaidos daugiskaitos vardininko galūnėje, kai vietoje „-iai“ rašoma „-ei“ (pvz., arkliai, kiškiai).' },
        e_ia: { area: 'painiojant „e“ su „ia“', label: 'Painioja „e“ ir „ia“', topic: '„e“ ir „ia“ painiojimas',
            tip: 'Klaidos, kai po minkštųjų priebalsių vietoje „ia“ rašoma „e“ (pvz., kiaušinis, vėliava).' },
        asim: { area: 'supanašėjusių priebalsių rašyboje', label: 'Priebalsių supanašėjimas', topic: 'priebalsių rašyba, kai jie supanašėja',
            tip: 'Klaidos, kai supanašėjusi priebalsė rašoma pagal tarimą, o ne pagal žodžio kilmę (apdalijo, nors tariama [abdalijo]).' },
        priesdelis: { area: 'priešdėlių rašyboje', label: 'Priešdėlio rašyba', topic: 'priešdėlių rašyba',
            tip: 'Klaidos priešdėliuose („iš-“, „į-“, „už-“, „at-“, „ap-“), kai jie rašomi pagal tarimą.' },
        galune: { area: 'galūnių su nosinėmis raidėmis rašyboje', label: 'Galūnės rašyba (nosinės)', topic: 'nosinių raidžių galūnėse rašyba',
            tip: '' },
        sudurt: { area: 'sudurtinių žodžių rašyboje', label: 'Sudurtinių žodžių rašyba', topic: 'sudurtinių žodžių rašyba',
            tip: 'Klaidos sudurtinių žodžių jungiamosiose balsėse (pvz., angliakasys).' },
        v_bkl_vns2: { area: 'veiksmažodžių būtojo kartinio laiko vienaskaitos 2 asmens galūnėse', label: 'Veiksm. būt. k. l. vns. 2 asm. galūnė', topic: 'veiksmažodžio būtojo kartinio laiko vienaskaitos 2 asmens galūnės rašyba',
            tip: 'Klaidos galūnėje „-ei“ (tu skaitei), kai 3 asmuo baigiasi „-ė“ (jis skaitė).' },
        v_esl_dgs1: { area: 'veiksmažodžių esamojo laiko daugiskaitos 1 asmens galūnėse', label: 'Veiksm. es. l. dgs. 1 asm. galūnė', topic: 'veiksmažodžio esamojo laiko daugiskaitos 1 asmens galūnės rašyba',
            tip: 'Klaidos galūnėse „-ame“ / „-ome“ (dirbame, skaitome).' },
        v_esl_dgs2: { area: 'veiksmažodžių esamojo laiko daugiskaitos 2 asmens galūnėse', label: 'Veiksm. es. l. dgs. 2 asm. galūnė', topic: 'veiksmažodžio esamojo laiko daugiskaitos 2 asmens galūnės rašyba',
            tip: 'Klaidos galūnėse „-ate“ / „-ote“ (dirbate, skaitote).' },
        v_bkl_vns1: { area: 'veiksmažodžių būtojo kartinio laiko vienaskaitos 1 asmens galūnėse', label: 'Veiksm. būt. k. l. vns. 1 asm. galūnė', topic: 'veiksmažodžio būtojo kartinio laiko vienaskaitos 1 asmens galūnės rašyba',
            tip: 'Klaidos galūnėje „-iau“ (skaičiau, mačiau).' },
        v_bkl_dgs1: { area: 'veiksmažodžių būtojo kartinio laiko daugiskaitos 1 asmens galūnėse', label: 'Veiksm. būt. k. l. dgs. 1 asm. galūnė', topic: 'veiksmažodžio būtojo kartinio laiko daugiskaitos 1 asmens galūnės rašyba',
            tip: 'Klaidos galūnėje „-ėme“ (skaitėme).' },
        v_busl_dgs1: { area: 'veiksmažodžių būsimojo laiko daugiskaitos 1 asmens galūnėse', label: 'Veiksm. būs. l. dgs. 1 asm. galūnė', topic: 'veiksmažodžio būsimojo laiko daugiskaitos 1 asmens galūnės rašyba',
            tip: 'Klaidos galūnėje „-sime“ (skaitysime).' },
        v_busl_dgs2: { area: 'veiksmažodžių būsimojo laiko daugiskaitos 2 asmens galūnėse', label: 'Veiksm. būs. l. dgs. 2 asm. galūnė', topic: 'veiksmažodžio būsimojo laiko daugiskaitos 2 asmens galūnės rašyba',
            tip: 'Klaidos galūnėje „-site“ (skaitysite).' },
        isidemetina: { area: 'įsidėmėtinos rašybos žodžiuose', label: 'Įsidėmėtina rašyba', topic: 'įsidėmėtinos rašybos žodžiai',
            tip: '' },
        priebalses: { area: 'painiojant panašiai skambančias priebalses', label: 'Maišo panašiai skambančias priebalses', topic: 'panašiai skambančių priebalsių painiojimas',
            tip: 'Klaidos, kai painiojamos skardžiosios ir duslios priebalsės („b“–„p“, „d“–„t“, „g“–„k“, „z“–„s“, „ž“–„š“).' },
        svilp: { area: 'painiojant švilpiamąsias ir šnypščiamąsias priebalses', label: 'Maišo švilpiamąsias ir šnypščiamąsias priebalses (s–š, z–ž, c–č)', topic: 'švilpiamųjų ir šnypščiamųjų priebalsių painiojimas',
            tip: 'Klaidos, kai painiojamos švilpiamosios ir šnypščiamosios priebalsės („s“–„š“, „z“–„ž“, „c“–„č“, „dz“–„dž“).' },
        atskiri: { area: 'skaitant pavienius žodžius jų nesiejant sakinyje', label: 'Skaito pavienius žodžius, nesieja žodžių sakinyje', topic: 'tikri, bet sakiniui netinkami žodžiai',
            tip: 'Klaidingas atsakymas sudaro tikrą žodį, tik netinkamą sakiniui. Apima ir atvejus, kai tiktų keli atsakymai, bet teisingu laikomas tik tas, kuris yra originaliame tekste.' },
        nedemesys: { area: 'įrašant netinkamas raides dėl dėmesio stokos', label: 'Nekreipia dėmesio, ką rašo, arba netyčia įrašė ne tą raidę', topic: 'netyčia ar neatidžiai įrašytos raidės',
            tip: 'Įrašytos raidės nesudaro tikro žodžio ir neatitinka tipinių klaidų (pvz., viena raidė pakeista kita ar įrašyta du kartus).' },
        bet_kokias: { area: 'įrašinėjant bet kokias raides', label: 'Įrašinėja bet kokias raides', topic: 'bet kokios įrašytos raidės',
            tip: 'Įrašytos raidės aiškiai nėra bandymas teisingai atlikti užduotį: neįprasti raidžių junginiai (pvz., „hįh“), lietuvių kalboje nevartojamos raidės ar ženklai, ta pati raidė kelis kartus iš eilės, neteisinga didžioji raidė žodžio viduryje, vien priebalsės vietoje balsės arba tas pats neteisingas atsakymas įrašytas į daugumą užduoties žodžių.' },
        didziosios: { area: 'rašant didžiąsias raides', label: 'Neteisingas didžiųjų raidžių naudojimas', topic: 'didžiųjų raidžių naudojimas',
            tip: 'Raidės įrašytos teisingai, tačiau netinkamai panaudotos didžiosios raidės: didžioji raidė neparašyta ten, kur jos reikia (pvz., sakinio pradžioje ar varde), arba parašyta ten, kur jos nereikia.' },
        kita: { area: 'kitais atvejais', label: 'Kitos klaidos', topic: 'kitos klaidos', tip: '' }
    
};

/* The math mistake patterns' texts (Klaidų dėsningumai and the Apibendrinimas cards; sudedu-insights.js, mathText).
 * label / area / tip as in insightsMistakePatterns above (label: the line's name in Klaidų dėsningumai; area: inside
 * sentences, "Nustatytu laikotarpiu dažniausiai buvo klystama {area}", "Klaidų {area} sumažėjo 40%"; tip: the advice).
 * Slots: {name} / {inName} - the operation (operations below), {n} - the multiplication table's number,
 * {which} / {whichIns} - the unknown number's name ("dėmuo" / "dėmeniu", "turinys", "atėminys", "dauginamasis", "dalinys",
 * "daliklis"). tip_A / tip_S: the advice for addition / subtraction (not shown on the cards).
 * m_set - a kind of task (a mistake is put under the task it was made in, unless it is a multiplication table fact):
 *   {Set} / {set} - the task's number set with the operation, from insightsTaskSetLocative without "užduotyse"
 *   ("Triženklio skaičiaus su vienaženkliu dalybos"), {more} - what follows "užduotyse" there (", kai turinyje yra
 *   gretimų nulių"), {details} - " pergrupuojant skaičių skyrius" / " nepergrupuojant skaičių skyrių", " su liekana", " stulpeliu" /
 *   " kampu", no commas: "… užduotyse pergrupuojant skaičių skyrius stulpeliu" (addition / subtraction keep the crossing advice of
 *   m_cross / m_plain as their tip).
 * The code adds to some of them: "pergrupuojant skaičių skyrius" → "pergrupuojant skaičių skyrius" (the place values crossed), and
 * the number ranges after the operation: "Sudėtis iki 20 ir 100, pergrupuojant skaičių skyrius" / "sudėtyje iki 100 …".
 */
const insightsMathPatterns = {
    operations: {
        A: { name: 'Sudėtis', inName: 'sudėtyje' },
        S: { name: 'Atimtis', inName: 'atimtyje' }
    },
    m_op: { label: '{name}', area: '{inName}', tip: '' },
    m_cross: { label: '{name}, pergrupuojant skaičių skyrius', area: '{inName} pergrupuojant skaičių skyrius',
        tip_A: 'Verta pakartoti sudėtį pergrupuojant skaičių skyrius: pirmiausia papildyti iki dešimties (8 + 5 = 8 + 2 + 3).',
        tip_S: 'Verta pakartoti atimtį pergrupuojant skaičių skyrius: pirmiausia atimti iki dešimties (13 − 5 = 13 − 3 − 2).' },
    m_plain: { label: '{name}, nepergrupuojant skaičių skyrių', area: '{inName} nepergrupuojant skaičių skyrių',
        tip: 'Klystama ir paprastesniuose pavyzdžiuose – gali būti, kad skubama; verta atidžiau patikrinti atsakymą.' },
    m_table: { label: 'Daugyba ir dalyba su skaičiumi {n}', area: 'skaičiaus {n} daugybos lentelėje', tip: 'Verta pakartoti skaičiaus {n} daugybos lentelę.' },
    m_muldiv: { label: 'Kita daugyba ir dalyba', area: 'kitoje daugyboje ir dalyboje', tip: '' },
    m_set: { label: '{Set} užduotys{details}{more}', area: '{set} užduotyse{details}{more}', tip: '' },
    m_unknown: { label: 'Nežinomas {which}', area: 'veiksmuose su nežinomu {whichIns}',
        tip: 'Verta pakartoti, kaip randamas nežinomas skaičius – atvirkštiniu veiksmu (□ + 3 = 8 → 8 − 3).' },
    m_zero: { label: 'Veiksmai su nuliu', area: 'veiksmuose su nuliu', tip: 'Verta pakartoti veiksmų su nuliu taisykles (a + 0 = a, a × 0 = 0).' },
    m_off1: { label: 'Apsirinkama vienetu', area: 'apsirinkant vienetu',
        tip: 'Sudedant ar atimant iki 20 atsakymas skiriasi vienetu. Gali būti, kad skaičiuojama po vieną (pvz., pirštais) ir apsirinkama – tada verta pakartoti skaičių sudėtį ir atimtį iki 20 bei skaičių kaimynus.' },
    m_off10: { label: 'Pamirštama perkelti ar paskolinti dešimtį', area: 'pamirštant perkelti ar paskolinti dešimtį',
        tip: 'Atsakymas skiriasi dešimtimi ar šimtu – greičiausiai pamirštama perkelti ar paskolinti dešimtį (šimtą).' },
    m_wrong_op: { label: 'Supainiojamas veiksmas', area: 'supainiojant veiksmą',
        tip: 'Atsakymas atitinka kitą veiksmą (pvz., atimta vietoje sudėties) – verta atkreipti dėmesį į veiksmo ženklą.' },
    m_unknown_op: { label: 'Ieškant nežinomojo atliekamas ne tas veiksmas', area: 'ieškant nežinomojo',
        tip: 'Nežinomas skaičius randamas atvirkštiniu veiksmu – mokinys atlieka tą patį veiksmą (□ + 3 = 8 → 8 + 3).' },
    m_swap: { label: 'Sukeičiami skaitmenys', area: 'sukeičiant skaitmenis vietomis',
        tip: 'Skaitmenys sukeičiami vietomis (41 vietoje 14) – verta pakartoti skaičių skyrius (dešimtys ir vienetai).' }
};
