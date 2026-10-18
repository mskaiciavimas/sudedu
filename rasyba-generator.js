// The spelling (rašyba) questions' generator: which sentences, words and gaps a task asks, decided by its seed.
// Shared by the task page (LT/rasyba.html), which asks them, and the results analysis (LT/uzduotys.html,
// sudedu-insights.js), which replays a finished task's questions from its seed (saved in the result's duration).
// Moved here unchanged from LT/rasyba.html; the page's own values come in as settings (config): classChoice,
// maximumQuestionFrequencyPerWord, taskFrequency, the grade flags (userIn…), generateHelpSpans,
// generateConstantHelpSpans and quiet (no console messages).
(function () {
'use strict';

// The rules' version a seed's questions follow, told by the seed itself - so a task and its replay always use the same:
//   (no mark) the first rules;
//   "R2-…"    a word written with a capital letter is not asked, unless it starts the sentence or comes right after
//             quotation marks (a name, not a spelling question). New seeds come from mental-arithmetic.js's
//             generateGrammarSeed().
function seedRules(seed) {
    return { skipCapitalized: /^R2-/.test(String(seed)) };
}

// (the same as mental-arithmetic.js's parseSeed: the seed string's number)
function parseSeed(seedString) {
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        const char = seedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash) || 1;
}

/**
 * Seeded Random Number Generator (Mulberry32)
 */
class SeededRandom {
    constructor(seed) {
        this.state = typeof seed === 'string' ? parseSeed(seed) : seed;
    }
    
    next() {
        let t = this.state += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min)) + min;
    }
    
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    
    choice(array) {
        return array[Math.floor(this.next() * array.length)];
    }
    
    derive(suffix) {
        return new SeededRandom(this.state + parseSeed(String(suffix)));
    }
}


// ===== CATEGORY INDEX BUILDER =====

/**
 * Build index: category -> Set of textIds that contain words matching that category
 * This is FAST - just checks if words appear in text, doesn't process sentences
 */
function buildCategoryToTextsIndex(texts, suitableWords, conditionsSet) {
    const categoryIndex = new Map();
    
    conditionsSet.forEach(cat => categoryIndex.set(cat, new Set()));
    
    for (const textId in texts) {
        const textObj = texts[textId];
        const sections = textObj.text || {};
        const parts = [];
        
        if (sections.start) parts.push(...sections.start);
        if (sections.middle) parts.push(...sections.middle);
        if (sections.end) parts.push(...sections.end);
        
        const combined = parts.join(" ").toLowerCase();
        const textCategories = new Set();
        
        for (const word in suitableWords) {
            if (combined.includes(word)) {
                const wordConditions = suitableWords[word];
                for (const condKey in wordConditions) {
                    if (conditionsSet.has(condKey)) {
                        textCategories.add(condKey);
                    }
                }
            }
        }
        
        textCategories.forEach(cat => {
            categoryIndex.get(cat).add(textId);
        });
    }
    
    return categoryIndex;
}

function extractSentencesWithCoords(texts) {
    const results = [];
    const NO_SPLIT_MARKER = '\uE000';
    
    for (const textID in texts) {
        const textObj = texts[textID];
        const sections = textObj.text || {};
        const parts = [];
        
        if (sections.start) parts.push(...sections.start);
        if (sections.middle) parts.push(...sections.middle);
        if (sections.end) parts.push(...sections.end);
        
        if (parts.length === 0) continue;
        
        const combined = parts.join("").trim();
        if (!combined) continue;
        
        // Process the combined text to find sentence boundaries
        let currentPos = 0;
        let sentenceStart = 0;
        let sentenceNumber = 0; // Add sentence counter
        
        while (currentPos < combined.length) {
            // Check if we're at a potential sentence end
            const match = findSentenceEnd(combined, currentPos);
            
            if (match) {
                const endPos = match.index + match[0].length;
                
                // Check if this is followed by NO_SPLIT_MARKER
                if (combined.substring(endPos, endPos + NO_SPLIT_MARKER.length) !== NO_SPLIT_MARKER) {
                    // Extract the sentence (including the end markers)
                    const sentence = combined.substring(sentenceStart, endPos).trim();
                    if (sentence) {
                        results.push([sentence, [Number(textID), sentenceNumber]]);
                        sentenceNumber++; // Increment sentence counter
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
        if (sentenceStart < combined.length) {
            const remaining = combined.substring(sentenceStart).trim();
            if (remaining) {
                results.push([remaining, [Number(textID), sentenceNumber]]);
            }
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


function indexSentenceWords(sentence, coords) {
	// (whether a word comes right after quotation marks: the characters between it and the word before - the words are
	// the same runs of letters the cleaning below splits into)
	const afterQuote = [];
	{
		const plain = sentence.replace(/\uE000/g, "");
		const re = /[^\p{P}\p{S}\s\u00A0]+/gu;
		let m, last = 0;
		while ((m = re.exec(plain))) {
			afterQuote.push(/["'`„“”«»‚‘’]/.test(plain.slice(last, m.index)));
			last = m.index + m[0].length;
		}
	}
	const cleaned = sentence
		.replace(/\uE000/g, "")
        .replace(/[\p{P}\p{S}]+/gu, " ")
        .replace(/[\s\u00A0]+/g, " ")
        .trim();

    if (!cleaned) return [];

    const words = cleaned.split(" ");
    const result = [];

    words.forEach((word, absoluteIndex) => {
        const w = word.trim();
        if (!w) return;

        const newCoords = Array.isArray(coords) ? [...coords, absoluteIndex] : [absoluteIndex];

        result[absoluteIndex] = {
            word: w,
            coords: newCoords,
            afterQuote: Boolean(afterQuote[absoluteIndex])
        };
    });

    return result;
}

function processAdjacentEndlessWords(words, rng) {
    const result = [...words];
    let i = 0;
    
    const separators = new Set(['ir', 'ar', 'o', 'ne']);
    
    const isSeparator = (wordObj) => {
        const wordText = (wordObj.word || '').toLowerCase();
        return separators.has(wordText);
    };
    
    while (i < result.length) {
        if (isSeparator(result[i])) {
            i++;
            continue;
        }
        
        const patterns = result[i].suitablePatterns;
        if (!patterns) {
            i++;
            continue;
        }
        
        // Only check for C62/C63
        const hasC62C63 = 'C62' in patterns || 'C63' in patterns;
        
        if (!hasC62C63) {
            i++;
            continue;
        }
        
        let sequenceIndices = [i];
        let j = i + 1;
        
        while (j < result.length) {
            if (isSeparator(result[j])) {
                j++;
                continue;
            }
            
            const nextPatterns = result[j].suitablePatterns;
            if (!nextPatterns) {
                break;
            }
            
            // Only check for C62/C63
            const nextHasC62C63 = 'C62' in nextPatterns || 'C63' in nextPatterns;
            
            if (!nextHasC62C63) {
                break;
            }
            
            sequenceIndices.push(j);
            j++;
        }
        
        const sequenceLength = sequenceIndices.length;
        
        if (sequenceLength >= 2) {
            const keepOdd = rng.next() < 0.5;
            
            for (let k = 0; k < sequenceIndices.length; k++) {
                const shouldRemove = keepOdd ? (k % 2 === 1) : (k % 2 === 0);
                
                if (shouldRemove) {
                    const wordIdx = sequenceIndices[k];
                    const p = result[wordIdx].suitablePatterns;
                    delete p.C62;
                    delete p.C63;
                    if (Object.keys(p).length === 0) {
                        delete result[wordIdx].suitablePatterns;
                    }
                }
            }
            
            i = j;
        } else {
            i++;
        }
    }
    
    return result;
}

function reduceToQuestionQuota(words, questionQuota, rng, PRIORITIZED_TASK_CATEGORIES) {
    let usableWordsPerSentence = words.filter(w => w.suitablePatterns && Object.keys(w.suitablePatterns).length > 0).length;
    
    if (usableWordsPerSentence <= questionQuota) {
        return words;
    }
    
    const amountToRemove = usableWordsPerSentence - questionQuota;
    const wordsWithPrioritized = [];
    const wordsWithoutPrioritized = [];
    
    words.forEach((word, index) => {
        if (!word.suitablePatterns || Object.keys(word.suitablePatterns).length === 0) {
            return;
        }
        
        const hasPrioritizedCategory = PRIORITIZED_TASK_CATEGORIES.some(cat => cat in word.suitablePatterns);
        
        if (hasPrioritizedCategory) {
            wordsWithPrioritized.push(index);
        } else {
            wordsWithoutPrioritized.push(index);
        }
    });
    
    const shuffledNonPrioritized = rng.derive('non-priority').shuffle(wordsWithoutPrioritized);
    const shuffledPrioritized = rng.derive('priority').shuffle(wordsWithPrioritized);
    
    let removed = 0;
    const result = [...words];
    
    for (const index of shuffledNonPrioritized) {
        if (removed >= amountToRemove) break;
        delete result[index].suitablePatterns;
        removed++;
    }
    
    for (const index of shuffledPrioritized) {
        if (removed >= amountToRemove) break;
        delete result[index].suitablePatterns;
        removed++;
    }
    
    return result;
}

function pickRandomPatterns(words, rng) {
    const modifiedWords = words.map((word, index) => {
        if (!word.suitablePatterns || Object.keys(word.suitablePatterns).length === 0) {
            return null;  // ← Changed from {} to null
        }

        const patternTypes = Object.keys(word.suitablePatterns);
        const wordRng = rng.derive(`word-${index}`);
        const randomPatternType = patternTypes[Math.floor(wordRng.next() * patternTypes.length)];

        const sublists = word.suitablePatterns[randomPatternType];
        const randomSublist = sublists[Math.floor(wordRng.next() * sublists.length)];

        return {
            ...word,
            suitablePatterns: {
                [randomPatternType]: [randomSublist]
            }
        };
    }).filter(word => word !== null);  // ← Filter out nulls

    const categorySet = new Set();
    modifiedWords.forEach(word => {
        const keys = Object.keys(word.suitablePatterns || {});
        keys.forEach(k => categorySet.add(k));
    });

    const uniqueCategories = Array.from(categorySet);
    return [modifiedWords, uniqueCategories];
}


function addSentenceToCategorisedSentences(sentence, categoryList, sentenceAnswers, categories, items, globalFormattedSentenceCounter) {
    if (!Array.isArray(categoryList)) {
        console.log("Second argument must be an array of categories");
        return globalFormattedSentenceCounter;
    }

    const uniqueID = "s" + (globalFormattedSentenceCounter++);

    items.set(uniqueID, {
        sentence,
        categories: new Set(),
        sentenceAnswers: sentenceAnswers
    });

    for (const category of categoryList) {
        if (!categories.has(category)) categories.set(category, new Set());
        categories.get(category).add(uniqueID);
        items.get(uniqueID).categories.add(category);
    }

    return globalFormattedSentenceCounter;
}

function drainAllCategories(categories, items, taskFrequency = {}) {
    const finalSentences = [];
    
    // Initialize category counters for frequency-based selection
    const categoryCounters = new Map();
    for (const [category] of categories) {
        categoryCounters.set(category, 0);
    }

    while (true) {
        let progress = false;

        for (const [category, set] of categories) {
            if (set.size > 0) {
                // Get the frequency for this category (default to 1)
                const frequency = taskFrequency[category] || 1;
                
                // Check if we should pick from this category based on frequency
                const counter = categoryCounters.get(category);
                const shouldPick = counter >= (1 / frequency);
                
                if (shouldPick) {
                    const uniqueID = set.values().next().value;
                    const entry = items.get(uniqueID);

                    if (!entry) continue;

                    const sentenceHTML = entry.sentence;
                    const answersForSentence = entry.sentenceAnswers;

                    // Remove from all categories
                    for (const cat of entry.categories) {
                        categories.get(cat).delete(uniqueID);
                    }
                    items.delete(uniqueID);

                    finalSentences.push({
                        sentenceHTML,
                        answers: answersForSentence
                    });

                    // Reset counter for this category
                    categoryCounters.set(category, 0);
                    progress = true;
                } else {
                    // Increment counter
                    categoryCounters.set(category, counter + 1);
                    progress = true;
                }
            }
        }

        if (!progress) break;
    }

    return finalSentences;
}


function processSentences(extractedSentences, sessionSeed, passNumber, config, state) {
    const {
        precomputedWordPatterns,
        conditionsSet,
        allowAdjacentEndlessWords,
        MAX_SENTENCE_CHARACTER_NUMBER_FOR_GRADES_0_to_1,
        MIN_SENTENCE_WORD_NUMBER_FOR_GRADES_0_to_1,
        MIN_SENTENCE_WORD_NUMBER_FOR_GRADES_2_to_5,
        PRIORITIZED_TASK_CATEGORIES,
        userInPreSchool,
        userInFirstGrade,
        userInSecondGrade,
        userInThirdGrade,
        userInFourthGrade,
        userInHigherGrade,
        generateHelpSpans
    } = config;

    const {
		categories,
		items,
		questionIdRef,
		counterRef
	} = state;

    const rules = seedRules(sessionSeed);
    const mainRng = new SeededRandom(sessionSeed);
    const textRng = mainRng.derive(`pass-${passNumber}`);
    
    const shuffledSentences = textRng.derive('sentence-order').shuffle(extractedSentences);
    
	let currentQuestionId = questionIdRef.value;
	let currentCounter = counterRef.value;
    
    for (const [sentence, coords] of shuffledSentences) {
        if (config.classChoice === "C75" && (userInPreSchool || userInFirstGrade)) {
            if (sentence.length > MAX_SENTENCE_CHARACTER_NUMBER_FOR_GRADES_0_to_1) {
                continue;
            }
        }

        let indexedSentenceWords = indexSentenceWords(sentence, coords);

        if (((userInPreSchool || userInFirstGrade) && indexedSentenceWords.length < MIN_SENTENCE_WORD_NUMBER_FOR_GRADES_0_to_1) ||
            ((userInSecondGrade || userInThirdGrade || userInFourthGrade || userInHigherGrade) && indexedSentenceWords.length < MIN_SENTENCE_WORD_NUMBER_FOR_GRADES_2_to_5)) {
            continue;
        }

        let usableWordsInSentence = 0;

        for (let i = 0; i < indexedSentenceWords.length; i++) {
            const item = indexedSentenceWords[i];
            // (seeds "R2-…": a capitalized word inside the sentence - not its first word, not right after quotation
            // marks - is a name: not asked)
            if (rules.skipCapitalized && i > 0 && !item.afterQuote && item.word[0] !== item.word[0].toLowerCase()) continue;
            const word = item.word.toLowerCase();
            const matchedPatterns = {};
            const matchedConditionsHelpSpans = {};

            if (precomputedWordPatterns[word]) {
                const wordConditions = precomputedWordPatterns[word];

                let wordIsSuitable = false;
                for (const condKey in wordConditions) {
                    if (conditionsSet.has(condKey)) {
                        wordIsSuitable = true;
						let [startIdx, endIdx, answerLetters] = wordConditions[condKey][0];
                        matchedConditionsHelpSpans[condKey] = generateHelpSpans(word, condKey, answerLetters);
                        matchedPatterns[condKey] = wordConditions[condKey];
                    }
                }

                if (wordIsSuitable) usableWordsInSentence += 1;
            }

            if (Object.keys(matchedPatterns).length > 0) {
                item.suitablePatterns = matchedPatterns;
                item.helpSpans = matchedConditionsHelpSpans;
            }
        }
        
        if (usableWordsInSentence === 0) continue;
        
        const sentenceRng = textRng.derive(`sentence-${coords.join('-')}`);
        
        if (!allowAdjacentEndlessWords) {
            indexedSentenceWords = processAdjacentEndlessWords(indexedSentenceWords, sentenceRng.derive('adjacent'));
        }

		const sentenceLength = indexedSentenceWords.length;
        const questionQuota = Math.floor(sentenceLength / config.maximumQuestionFrequencyPerWord);

        if (usableWordsInSentence > questionQuota) {
            indexedSentenceWords = reduceToQuestionQuota(indexedSentenceWords, questionQuota, sentenceRng.derive('quota'), PRIORITIZED_TASK_CATEGORIES);
        }

        const [modifiedWords, remainingCategories] = pickRandomPatterns(indexedSentenceWords, sentenceRng.derive('patterns'));

        if (remainingCategories.length === 0) continue;

        let sentenceDiv = sentence.replace(/\uE000/g, '');

        const sentenceAnswers = {};

		for (const item of modifiedWords) {
			if (item.suitablePatterns) {
				let selectedCategory = Object.keys(item.suitablePatterns)[0];
				
				// Add safety check
				if (!item.suitablePatterns[selectedCategory] || 
					!Array.isArray(item.suitablePatterns[selectedCategory]) ||
					item.suitablePatterns[selectedCategory].length === 0) {
					console.error('Invalid pattern structure for word:', item.word, item.suitablePatterns);
					continue;
				}
				
				let [startIdx, endIdx, answerLetters] = item.suitablePatterns[selectedCategory][0];

                const wordStart = item.word.slice(0, startIdx);
                const removedPart = item.word.slice(startIdx, endIdx); 
                const firstLetterCapitalized = removedPart[0] === removedPart[0].toUpperCase() && /[A-ZĄČĘĖĮŠŲŪŽ]/.test(removedPart[0]);
                
                if (firstLetterCapitalized) {
                    answerLetters = answerLetters.map(str => {
                        if (!str) return str;
                        return str[0].toUpperCase() + str.slice(1);
                    });
                }

                const wordEnd = item.word.slice(endIdx).replace(/\d+/g, '');

				let wordHTML;

				if (selectedCategory === "C67") {
					const constantHelpSpan = config.generateConstantHelpSpans(answerLetters[0], "C67")
					wordHTML = `<span class="question-word-span middle" style="display: inline; white-space: nowrap;">${wordStart}<textarea autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" maxlength="6" id="id-${currentQuestionId}" class="question-input middle"></textarea>${wordEnd}<span class="pagalba-div-constant">${constantHelpSpan}</span></span>`;
				} else {
					wordHTML = `<span class="question-word-span middle" style="display: inline; white-space: nowrap;">${wordStart}<textarea autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" maxlength="6" id="id-${currentQuestionId}" class="question-input middle"></textarea>${wordEnd}<span class="pagalba-div">${item.helpSpans[selectedCategory]}</span></span>`;
				}                
                sentenceAnswers[`id-${currentQuestionId}`] = {};
                sentenceAnswers[`id-${currentQuestionId}`]["klausimas"] = [wordStart, wordEnd];
                sentenceAnswers[`id-${currentQuestionId}`]["atsakymas"] = [answerLetters];
                sentenceAnswers[`id-${currentQuestionId}`]["kl-grupe"] = selectedCategory;
                sentenceAnswers[`id-${currentQuestionId}`]["zodzio-id"] = item.coords;
                currentQuestionId++;

                sentenceDiv = sentenceDiv.replace(item.word, wordHTML);
				sentenceDiv = sentenceDiv.replace(
					/(\p{L}+)(\d+)(?![^<]*>)/gu,
					'$1'
				);
            }
        }

        currentCounter = addSentenceToCategorisedSentences(
            `<div class="sakiniai">${sentenceDiv}</div>`, 
            remainingCategories, 
            sentenceAnswers,
            categories,
            items,
            currentCounter
        );
    }
    
    // Update state
    questionIdRef.value = currentQuestionId;
    counterRef.value = currentCounter;
}


async function prepareSentences(sessionSeed, passNumber, targetFormattedSentences, config, state) {
    const {
        textsForGrammar,
        suitableWords,
        suitableWordPatterns,
        codedConditions
    } = config;

    if (!(textsForGrammar && suitableWords && suitableWordPatterns)) return;

    const conditions = [];
    Object.entries(codedConditions).forEach(([key, value]) => {
        if (key === "C66") {
            if (config.classChoice === "C75") {
                conditions.push("C66-C75");
            } else if (config.classChoice === "C76") {
                conditions.push("C66-C76");
            }
        } else if (key === "C87") {
			if (config.userInPreSchool || config.userInFirstGrade) {
                conditions.push("C87-1");
            } else {
                conditions.push("C87-2");
            }
		} else if (key === "C88") {
			conditions.push("C88-1");
			conditions.push("C88-2");
		} else if (key === "C89") {
			conditions.push("C89-1");
			conditions.push("C89-2");
		} else if (key === "C90") {
			conditions.push("C90-1");
			conditions.push("C90-2");
		} else if (key === "C91") {
			conditions.push("C91-1");
			conditions.push("C91-2");
			conditions.push("C91-3");
			conditions.push("C91-4");
			conditions.push("C91-5");
			conditions.push("C91-6");
		} if (key === "C68") {
            if (config.classChoice === "C75") {
                conditions.push("C68-1");
            } else if (config.classChoice === "C76") {
                conditions.push("C68-1");
				conditions.push("C68-2");
            }
        } else {
            conditions.push(key);
        }
    });

    const conditionsSet = new Set(conditions);
    config.conditionsSet = conditionsSet;

    const mainRng = new SeededRandom(sessionSeed);
    const allTextIds = Object.keys(textsForGrammar);
    const shuffledTextIds = mainRng.derive(`text-selection-pass-${passNumber}`).shuffle(allTextIds);
    
    let processedTextCount = 0;
    const BATCH_SIZE = 50;
    
    // Calculate how much more we need to generate to account for frequency weighting
	const maxFrequency = Math.max(...conditions.map(condition => {
		const baseCondition = condition.split('-')[0];
		return (config.taskFrequency || {})[baseCondition] || 1;
	}), 1);

	const adjustedTarget = Math.ceil(targetFormattedSentences * maxFrequency);

	while (state.sakiniaiAndAtsakymai.length < adjustedTarget && processedTextCount < shuffledTextIds.length) {
        const batchTextIds = shuffledTextIds.slice(processedTextCount, processedTextCount + BATCH_SIZE);
        const batchTexts = {};
        batchTextIds.forEach(id => {
            batchTexts[id] = textsForGrammar[id];
        });
        
        const extractedSentences = extractSentencesWithCoords(batchTexts);
        
        processSentences(extractedSentences, sessionSeed, passNumber, config, state);
        
        // Drain and add to sakiniaiAndAtsakymai
        const newSentences = drainAllCategories(state.categories, state.items, config.taskFrequency);
        state.sakiniaiAndAtsakymai.push(...newSentences);
        
        processedTextCount += BATCH_SIZE;
        
        if (processedTextCount >= shuffledTextIds.length) {
            if (!config.quiet) console.log(`Processed all ${shuffledTextIds.length} texts, got ${state.sakiniaiAndAtsakymai.length} formatted sentences`);
            break;
        }
    }
    
    if (!config.quiet) console.log(`Generated ${state.sakiniaiAndAtsakymai.length} formatted sentences from ${processedTextCount} texts`);
}

// a short fingerprint of a texts file's ids (in their order): saved with a result, it tells whether a replay has the
// same texts the task had
function textIdsFingerprint(ids) {
    return parseSeed(ids.join(',')).toString(36);
}

// word -> { category: [patterns] } (the patterns of LT/rasyba.html's precomputedWordPatterns)
function buildPrecomputedWordPatterns(suitableWords, suitableWordPatterns) {
    const precomputedWordPatterns = {};
    for (const [word, wordData] of Object.entries(suitableWords)) {
        const wordsPattern = wordData.suitableTasks;
        precomputedWordPatterns[word] = {};
        for (const [conditionKey, patternIds] of Object.entries(wordsPattern)) {
            precomputedWordPatterns[word][conditionKey] = patternIds
                .filter(id => suitableWordPatterns[id])
                .map(id => suitableWordPatterns[id]);
        }
    }
    return precomputedWordPatterns;
}

window.SudRasybaGenerator = {
    SeededRandom, parseSeed, buildCategoryToTextsIndex, extractSentencesWithCoords, findSentenceEnd, indexSentenceWords,
    processAdjacentEndlessWords, reduceToQuestionQuota, pickRandomPatterns, addSentenceToCategorisedSentences,
    drainAllCategories, processSentences, prepareSentences, buildPrecomputedWordPatterns, textIdsFingerprint, seedRules
};
})();
