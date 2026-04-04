import re
import copy
from typing import Dict, List, Tuple, Set, Any
import hashlib
from difflib import SequenceMatcher

class TextHandler:
    def __init__(self, ambiguities_checker):
        self.ambiguities_checker = ambiguities_checker
        self.annotated_types =  ["dkt." , "tikr. dkt.", "bdv.", "vksm.", "prv."] # !!! TO BE UPDATED IF
        # self.categories_used_for_tasks WAS UPDATED IN word_analysis_modules/endings.py

    def filter_by_class_and_SF(self, all_texts):
        GRADE_MAP = {
            "1_2": "C75",
            "3_4": "C76",
        }

        SF_MAP = {
            "gramatika": {"C50"},
            "teksto_suvokimas": {"C51", "C52"},
        }

        result = {
            grade: {category: {} for category in SF_MAP}
            for grade in GRADE_MAP
        }

        for text_id, entry in all_texts.items():
            classes = set(entry.get("class", []))
            suitable_for = set(entry.get("SF", []))

            for grade_name, grade_code in GRADE_MAP.items():
                if grade_code not in classes:
                    continue

                for category, sf_codes in SF_MAP.items():
                    if suitable_for & sf_codes:
                        result[grade_name][category][text_id] = entry

        return result

    def extract_sentences_from_story(self, story):
        sentence_match_regex = r'.*?[.!?…][”"’\'»„“]*'
        parts = []
        text_obj = story.get("text", {})
        for section in ("start", "middle", "end"):
            if section in text_obj:
                parts.extend(text_obj[section])
        combined = " ".join(parts).strip()
        if not combined:
            return []
        raw_sentences = re.findall(sentence_match_regex, combined)
        return [s.strip() for s in raw_sentences if s.strip()]

    def split_sentence_into_words(self, sentence, lowercase=True):
        cleaned = re.sub(r"[^A-Za-zÀ-ž0-9]+", " ", sentence)
        if lowercase:
            return [word.lower() for word in cleaned.split() if word]
        else:
            return [word for word in cleaned.split() if word]

    def find_new_grammar_words(self, all_grammar_texts, memory_dictionary, current_task_meta):
        print("* Finding new grammar words...")
        def empty_memory_word(word):
            return {
                "word": word,
                "lemma": "",
                "suitableTasks": {},
                "morphInfo": [],
                "syllables": {},
                "ending": "",
                "prefix": "",
                "suffix": "",
                "metadata": []
            }

        new_grammar_words = {}

        for word, word_info in memory_dictionary.items():
            mem_task_meta = word_info["metadata"]
            if not current_task_meta.issubset(mem_task_meta):
                new_grammar_words[word] = memory_dictionary[word]

        for text_id, story in all_grammar_texts.items():
            sentences = self.extract_sentences_from_story(story)
            for sentence in sentences:
                words = self.split_sentence_into_words(sentence)
                for word in words:
                    word = word.lower()
                    if word not in memory_dictionary:
                        new_grammar_words[word] = empty_memory_word(word)

        return new_grammar_words

    def update_memory_dictionary(self, new_grammar_words, memory_dictionary):
        memory_dictionary.update(new_grammar_words)
        memory_dictionary = dict(sorted(memory_dictionary.items()))
        return memory_dictionary

    def create_file_for_ambiguity_sentence_lookup(self, all_grammar_texts):
        sentence_lookup = {}
        for text_id, story in all_grammar_texts.items():
            sentences = self.extract_sentences_from_story(story)
            sentence_lookup[text_id] = {}

            for i, sentence in enumerate(sentences):
                words = self.split_sentence_into_words(sentence, lowercase=False)
                sentence_lookup[text_id][i] = {
                    "sentence": sentence,
                    "words": {j: word for j, word in enumerate(words)}
                }

        return sentence_lookup


    def replace_annotated_words(self, all_grammar_texts, memory_text_annotation):
        # Create a deep copy to avoid modifying the original
        result = copy.deepcopy(all_grammar_texts)

        # Helper function to preserve case
        def preserve_case(original, replacement):
            """Apply the case pattern of original to replacement"""
            if original.isupper():
                return replacement.upper()
            elif original[0].isupper():
                return replacement.capitalize()
            else:
                return replacement.lower()

        # Process each text
        for text_id, text_data in result.items():

            annotations = memory_text_annotation[text_id]

            # Extract sentences to build replacement map
            sentences = self.extract_sentences_from_story(text_data)

            # Build a map of replacements grouped by sentence: sentence_id -> [(word_id, {original, variant})]
            replacements_by_sentence = {}

            for sentence_id_str, sentence_annotations in annotations.items():
                sentence_id = int(sentence_id_str)

                if sentence_id >= len(sentences):
                    continue

                for word_id_str, word_data in sentence_annotations.items():
                    # Only process if annotated is True
                    if word_data.get('annotated', False):
                        word_id = int(word_id_str)
                        word_variant = word_data.get('wordVariant', '')
                        original_word = word_data.get('originalWord', '')

                        if word_variant and original_word:
                            if sentence_id not in replacements_by_sentence:
                                replacements_by_sentence[sentence_id] = []

                            replacements_by_sentence[sentence_id].append({
                                'word_id': word_id,
                                'original': original_word.lower(),
                                'variant': word_variant
                            })

            # Process each sentence that needs replacements
            for sentence_id, repl_list in replacements_by_sentence.items():

                sentence = sentences[sentence_id]
                words = self.split_sentence_into_words(sentence, lowercase=True)

                repl_list_sorted = sorted(repl_list, key=lambda x: x['word_id'], reverse=True)

                # Find which section and line contains this sentence
                found = False
                for section in ("start", "middle", "end"):
                    if found:
                        break
                    if section not in text_data.get("text", {}):
                        continue

                    for line_idx, line in enumerate(text_data["text"][section]):
                        if sentence in line:
                            # Apply all replacements for this sentence to this line
                            modified_line = line

                            for repl_data in repl_list_sorted:
                                word_id = repl_data['word_id']

                                # Find and replace the word, preserving case and punctuation
                                pattern = r'\b' + re.escape(repl_data['original']) + r'\b'

                                # Find all matches with case-insensitive matching
                                matches = list(re.finditer(pattern, modified_line, re.IGNORECASE))

                                if matches:
                                    # Replace the first match (since we're going reverse, this works correctly)
                                    match = matches[0]
                                    original_with_case = match.group()
                                    variant_with_case = preserve_case(original_with_case, repl_data['variant'])

                                    modified_line = (
                                            modified_line[:match.start()] +
                                            variant_with_case +
                                            modified_line[match.end():]
                                    )

                            # Update the line in result
                            result[text_id]["text"][section][line_idx] = modified_line
                            found = True
                            break

        return result

    def determine_words_suitable_for_tasks_and_task_patterns(self, memory_text_annotation, memory_dictionary):
        def get_words_used_in_all_grammar_texts(memory_text_annotation):
            collected = set()

            for level1 in memory_text_annotation.values():
                for level2 in level1.values():
                    for level3 in level2.values():
                        annotated = level3.get("annotated", False)
                        original_word = level3.get("originalWord")
                        word_variant = level3.get("wordVariant")

                        if annotated:
                            collected.add(word_variant)
                        else:
                            collected.add(original_word)

            return sorted(collected)

        def replace_patterns_with_ids(suitable_words):
            """Replace all pattern arrays in suitableTasks with pattern IDs"""
            result = {}
            pattern_dict = {}
            pattern_lookup = {}  # To track which patterns we've seen
            next_id_counter = 1

            for word, data in suitable_words.items():
                word_result = {}

                # Handle suitableTasks
                if 'suitableTasks' in data:
                    suitable_tasks_result = {}

                    for task_id, patterns in data['suitableTasks'].items():
                        # patterns is a list like [[0, 1, ['ą']], [2, 4, ['uo']]]
                        if isinstance(patterns, list) and len(patterns) > 0:
                            pattern_ids = []
                            for pattern in patterns:
                                # Each pattern is [start, end, [letters]]
                                if isinstance(pattern, list) and len(pattern) == 3:
                                    # Create pattern key for lookup
                                    pattern_key = f"{pattern[0]}-{pattern[1]}-{','.join(pattern[2])}"

                                    # Check if pattern already exists
                                    if pattern_key not in pattern_lookup:
                                        pattern_id = f'P{next_id_counter}'
                                        pattern_lookup[pattern_key] = pattern_id
                                        pattern_dict[pattern_id] = pattern
                                        next_id_counter += 1

                                    pattern_ids.append(pattern_lookup[pattern_key])

                            suitable_tasks_result[task_id] = pattern_ids
                        else:
                            suitable_tasks_result[task_id] = patterns

                    word_result['suitableTasks'] = suitable_tasks_result

                # Copy other fields (like morphInfo) as-is
                for key, value in data.items():
                    if key != 'suitableTasks':
                        word_result[key] = value

                result[word] = word_result

            return result, pattern_dict

        used_words = set(get_words_used_in_all_grammar_texts(memory_text_annotation))

        suitable_words = {
            word: {
                "suitableTasks": data.get("suitableTasks", {}),
                "morphInfo": data.get("morphInfo", [])
            }
            for word, data in memory_dictionary.items()
            if word in used_words and data.get("suitableTasks")
        }

        suitable_words_coded, pattern_dict = replace_patterns_with_ids(suitable_words)

        return suitable_words_coded, pattern_dict

    def generate_grammar_text_suitable_word_list_and_task_patterns(self, all_grammar_texts, memory_text_annotation, memory_dictionary):
        memory_text_annotation, memory_dictionary = self.annotate_new_words(all_grammar_texts, memory_text_annotation, memory_dictionary)

        all_grammar_texts_variant_coded = self.replace_annotated_words(all_grammar_texts, memory_text_annotation)

        suitable_words_coded, pattern_dict = self.determine_words_suitable_for_tasks_and_task_patterns(memory_text_annotation, memory_dictionary)

        return memory_dictionary, memory_text_annotation, all_grammar_texts_variant_coded, suitable_words_coded, pattern_dict


    def annotate_new_words(self, all_grammar_texts, memory_text_annotation, memory_dictionary):
        def word_needs_annotation(word_variants, word):
            morph_infos = {info for entry in word_variants.values() for info in entry.get("morphInfo", [])}
            if any(t in morph_infos for t in self.annotated_types):

                # ADDITIONAL RULES

                # ONLY CONSIDER PRV. WITH -AI and -IAI ENDINGS AS ONLY THESE ARE USED IN TASKS FOR ENDINGS
                annotated_in_word = morph_infos.intersection(self.annotated_types)
                if annotated_in_word == {"prv."}:  # only "prv." is present
                    if word.endswith("ai") or word.endswith("iai"):
                        return True
                    else:
                        return False

                # ONLY CONSIDER VKSM THAT DO NOT HAVE "būdn." or "tar. n."
                if annotated_in_word == {"vksm."}:
                    additional_tags = {"būdn.", "tar. n."}

                    vksm_variants = [entry for entry in word_variants.values() if "vksm." in entry]

                    all_vksm_have_extra = all(
                        any(tag in entry for tag in additional_tags)
                        for entry in vksm_variants
                    )

                    if all_vksm_have_extra:
                        return False

                # ONLY CONSIDER ENTRIES THAT DO NOT HAVE "įvardž."
                all_ivardz = all(
                    any(t in entry.get("morphInfo", []) for t in self.annotated_types) and
                    "įvardž." in entry.get("morphInfo", [])
                    for entry in word_variants.values()
                )
                if all_ivardz:
                    return False

                return True
            else:
                return False

        def can_resolve_ambiguity_automatically(ambiguity_context_lookup_dict, text_id, sentence_idx, word_idx, word_variants):
            morph_infos = {info for entry in word_variants.values() for info in entry.get("morphInfo", [])}
            if "dkt." in morph_infos and "tikr. dkt." in morph_infos:
                if len(word_variants) == 2:
                    original_word = ambiguity_context_lookup_dict[text_id][int(sentence_idx)]["words"][int(word_idx)]
                    keys = list(word_variants.keys())
                    for i in range(len(keys)):
                        for j in range(i + 1, len(keys)):
                            old_key, new_key = keys[i], keys[j]
                            old_morph = set(word_variants[old_key]['morphInfo'])
                            new_morph = set(word_variants[new_key]['morphInfo'])

                            diff = old_morph ^ new_morph
                            if diff <= {"dkt.", "tikr. dkt."}:
                                if original_word[0].islower():
                                    if "dkt." in word_variants[old_key]['morphInfo']:
                                        selected_variant = old_key
                                    else:
                                        selected_variant = new_key
                                    return True, selected_variant
                                else:
                                    if int(word_idx) > 0:
                                        if "tikr. dkt." in word_variants[old_key]['morphInfo']:
                                            selected_variant = old_key
                                        else:
                                            selected_variant = new_key
                                        return True, selected_variant
            return False, {}

        ambiguity_context_lookup_dict = self.create_file_for_ambiguity_sentence_lookup(all_grammar_texts)

        self.ambiguities_checker.clear_ambiguities_dicts()

        changes, memory_text_annotation = self.sync_text_annotation(all_grammar_texts, memory_text_annotation)

        for change in changes:
            new_word = change["word"]
            text_id = str(change["text_id"])
            sentence_idx = str(change["sentence_idx"])
            word_idx = str(change["word_idx"])

            word_match_variants = {k: v for k, v in memory_dictionary.items()
                                   if k == new_word or (k.startswith(new_word) and k[len(new_word):].isdigit())}

            if word_needs_annotation(word_match_variants, new_word):
                if len(word_match_variants) > 1:
                    can_resolve_automatically, resolved_variant = can_resolve_ambiguity_automatically(
                        ambiguity_context_lookup_dict, text_id, sentence_idx, word_idx, word_match_variants)

                    if can_resolve_automatically:
                        memory_text_annotation[text_id][sentence_idx][word_idx] = {
                            "originalWord": new_word,
                            "wordVariant": resolved_variant,
                            "annotated": True
                        }
                    else:
                        self.ambiguities_checker.add_to_word_ambiguity_dictionary(
                            [text_id, sentence_idx, word_idx], new_word, word_match_variants
                        )
                else:
                    single_variant_key = list(word_match_variants.keys())[0]
                    memory_text_annotation[text_id][sentence_idx][word_idx] = {
                        "originalWord": new_word,
                        "wordVariant": single_variant_key,
                        "annotated": True
                    }

            memory_text_annotation[text_id][sentence_idx][word_idx][
                "annotationMeta"] = self.annotated_types.copy()

        memory_text_annotation, memory_dictionary = self.ambiguities_checker.resolve_word_ambiguities(
            memory_text_annotation, memory_dictionary, ambiguity_context_lookup_dict
        )

        return memory_text_annotation, memory_dictionary

    def sync_text_annotation(self, all_grammar_texts, memory_text_annotation):
        changes = []

        # Process each text
        for text_id, story in all_grammar_texts.items():
            sentences = self.extract_sentences_from_story(story)
            old_text_data = memory_text_annotation.get(text_id, {})

            # Reconstruct what the old text looked like, preserving original keys
            old_sentences, old_index_to_key = self._reconstruct_sentences(old_text_data)

            # Align old and new sentences
            sentence_mapping = self._align_sentences(old_sentences, sentences)

            # Ensure text_id exists in memory
            if text_id not in memory_text_annotation:
                memory_text_annotation[text_id] = {}

            # Track which old sentence keys were used and build new structure
            new_text_annotation = {}

            # Process each new sentence
            for new_sent_idx, sentence in enumerate(sentences):
                new_sent_id = str(new_sent_idx)
                words = self.split_sentence_into_words(sentence)

                # Get mapping to old sentence (if any)
                old_sent_list_idx = sentence_mapping.get(new_sent_idx)

                # Convert old list index to actual key in memory
                old_sent_key = old_index_to_key.get(old_sent_list_idx) if old_sent_list_idx is not None else None

                if old_sent_key is not None and old_sent_key in old_text_data:
                    # Sentence matched - try to preserve word annotations
                    old_sentence_data = old_text_data[old_sent_key]
                    old_words = self._reconstruct_words(old_sentence_data)

                    # Align words within this sentence
                    word_mapping = self._align_words(old_words, words)

                    # Build new sentence data
                    new_text_annotation[new_sent_id] = {}

                    for new_word_idx, word in enumerate(words):
                        new_word_id = str(new_word_idx)
                        old_word_idx = word_mapping.get(new_word_idx)

                        if old_word_idx is not None:
                            # Word was mapped from old position
                            old_word_data = old_sentence_data.get(str(old_word_idx))
                            old_word = old_word_data.get("originalWord", "")

                            if old_word == word:
                                # Exact match - preserve annotation
                                old_meta = old_word_data.get("annotationMeta", [])
                                annotated_flag = old_word_data.get("annotated", False)

                                # Check if all types are present
                                missing_types = [atype for atype in self.annotated_types if atype not in old_meta]

                                if missing_types:
                                    if not annotated_flag:
                                        # Initialize new word data
                                        new_text_annotation[new_sent_id][new_word_id] = {
                                            "originalWord": word,
                                            "wordVariant": "",
                                            "annotated": False,
                                            "annotationMeta": []
                                        }
                                        # Add to changes with empty annotationMeta
                                        changes.append({
                                            "text_id": text_id,
                                            "sentence_idx": new_sent_id,
                                            "word_idx": new_word_id,
                                            "word": word,
                                        })
                                    else:
                                        # Preserve the data but update annotationMeta
                                        new_text_annotation[new_sent_id][new_word_id] = old_word_data.copy()
                                        new_text_annotation[new_sent_id][new_word_id][
                                            "annotationMeta"] = self.annotated_types.copy()
                                else:
                                    # All types present, keep as is
                                    new_text_annotation[new_sent_id][new_word_id] = old_word_data.copy()
                            else:
                                # Word was edited directly (not just shifted)
                                new_text_annotation[new_sent_id][new_word_id] = {
                                    "originalWord": word,
                                    "wordVariant": "",
                                    "annotated": False,
                                    "annotationMeta": []
                                }
                                changes.append({
                                    'text_id': text_id,
                                    'sentence_idx': new_sent_id,
                                    'word_idx': new_word_id,
                                    'word': word
                                })
                        else:
                            # New word inserted
                            new_text_annotation[new_sent_id][new_word_id] = {
                                "originalWord": word,
                                "wordVariant": "",
                                "annotated": False,
                                "annotationMeta": []
                            }
                            changes.append({
                                'text_id': text_id,
                                'sentence_idx': new_sent_id,
                                'word_idx': new_word_id,
                                'word': word
                            })
                else:
                    # Brand new sentence OR mapped but old data doesn't exist
                    new_text_annotation[new_sent_id] = {}

                    for new_word_idx, word in enumerate(words):
                        new_word_id = str(new_word_idx)
                        new_text_annotation[new_sent_id][new_word_id] = {
                            "originalWord": word,
                            "wordVariant": "",
                            "annotated": False,
                            "annotationMeta": []
                        }
                        changes.append({
                            'text_id': text_id,
                            'sentence_idx': new_sent_id,
                            'word_idx': new_word_id,
                            'word': word
                        })

            # Replace the entire text annotation with the new structure
            memory_text_annotation[text_id] = new_text_annotation

            # Clean up empty text entries
            if not memory_text_annotation[text_id]:
                del memory_text_annotation[text_id]

        # Clean up deleted texts
        for text_id in list(memory_text_annotation.keys()):
            if text_id not in all_grammar_texts:
                del memory_text_annotation[text_id]

        return changes, memory_text_annotation

    def _reconstruct_sentences(self, text_data: Dict) -> tuple[List[str], Dict[int, str]]:
        """
        Reconstruct sentence strings from memory structure.
        Returns: (sentences_list, index_to_key_map)
        """
        sentences = []
        index_to_key = {}  # Maps list index -> original key

        for idx, sentence_id in enumerate(sorted(text_data.keys(), key=lambda x: int(x))):
            words = self._reconstruct_words(text_data[sentence_id])
            sentences.append(" ".join(words))
            index_to_key[idx] = sentence_id  # Remember original key

        return sentences, index_to_key

    def _reconstruct_words(self, sentence_data: Dict) -> List[str]:
        """Reconstruct word list from memory structure"""
        words = []
        for word_id in sorted(sentence_data.keys(), key=lambda x: int(x)):
            words.append(sentence_data[word_id].get("originalWord", ""))
        return words

    def _compute_content_hash(self, text: str) -> str:
        """Create stable hash of text content (normalized)"""
        normalized = ' '.join(text.lower().split())
        return hashlib.sha256(normalized.encode()).hexdigest()[:16]

    def _align_sentences(self, old_sentences: List[str], new_sentences: List[str]) -> Dict[int, int]:
        mapping = {}
        used_old_indices = set()

        # PHASE 1: Exact hash matching with position preference
        old_hashes = {}  # hash -> list of indices
        for idx, s in enumerate(old_sentences):
            h = self._compute_content_hash(s)
            if h not in old_hashes:
                old_hashes[h] = []
            old_hashes[h].append(idx)

        for new_idx, new_sent in enumerate(new_sentences):
            new_hash = self._compute_content_hash(new_sent)
            if new_hash in old_hashes:
                # If multiple old sentences have same hash, pick closest by position
                candidates = [idx for idx in old_hashes[new_hash] if idx not in used_old_indices]
                if candidates:
                    # Choose the one closest in position to new_idx
                    best_old_idx = min(candidates, key=lambda x: abs(x - new_idx))
                    mapping[new_idx] = best_old_idx
                    used_old_indices.add(best_old_idx)

        # PHASE 2: Fuzzy matching for remaining sentences
        if len(mapping) < len(new_sentences):
            unmapped_old = [i for i in range(len(old_sentences)) if i not in used_old_indices]
            unmapped_new = [i for i in range(len(new_sentences)) if i not in mapping]

            for new_idx in unmapped_new:
                best_old = None
                best_score = 0.0

                for old_idx in unmapped_old:
                    score = self._similarity(
                        old_sentences[old_idx],
                        new_sentences[new_idx]
                    )
                    # Add small position bonus to prefer nearby matches
                    position_bonus = 0.1 * (1.0 - abs(old_idx - new_idx) / max(len(old_sentences), len(new_sentences)))
                    adjusted_score = score + position_bonus

                    if adjusted_score > best_score:
                        best_score = adjusted_score
                        best_old = old_idx

                if best_old is not None and best_score > 0.6:
                    mapping[new_idx] = best_old
                    used_old_indices.add(best_old)
                    unmapped_old.remove(best_old)

        return mapping

    def _align_words(self, old_words: List[str], new_words: List[str]) -> Dict[int, int]:
        """
        Align old and new words with exact matching + position-aware fuzzy fallback.
        Returns: {new_index: old_index or None}
        """
        mapping = {}
        used_old_indices = set()

        # PHASE 1: Exact string matching in nearby positions (handles simple shifts)
        for new_idx, new_word in enumerate(new_words):
            # Look in a window around the expected position
            search_start = max(0, new_idx - 3)
            search_end = min(len(old_words), new_idx + 4)

            for old_idx in range(search_start, search_end):
                if old_idx not in used_old_indices and old_words[old_idx] == new_word:
                    mapping[new_idx] = old_idx
                    used_old_indices.add(old_idx)
                    break

        # PHASE 2: Use sequence matcher for remaining words
        if len(mapping) < len(new_words):
            unmapped_old = [idx for idx in range(len(old_words)) if idx not in used_old_indices]
            unmapped_new = [idx for idx in range(len(new_words)) if idx not in mapping]

            if unmapped_old and unmapped_new:
                matcher = SequenceMatcher(None,
                                          [old_words[i] for i in unmapped_old],
                                          [new_words[i] for i in unmapped_new])

                for tag, i1, i2, j1, j2 in matcher.get_opcodes():
                    if tag == 'equal':
                        for offset in range(i2 - i1):
                            old_idx = unmapped_old[i1 + offset]
                            new_idx = unmapped_new[j1 + offset]
                            mapping[new_idx] = old_idx
                    elif tag == 'replace':
                        # Only map replacements if very similar (likely typo fixes)
                        for offset in range(min(i2 - i1, j2 - j1)):
                            old_idx_in_unmapped = i1 + offset
                            new_idx_in_unmapped = j1 + offset

                            if old_idx_in_unmapped < len(unmapped_old) and new_idx_in_unmapped < len(unmapped_new):
                                old_idx = unmapped_old[old_idx_in_unmapped]
                                new_idx = unmapped_new[new_idx_in_unmapped]

                                # High threshold for word-level matching (0.8 = 80% similar)
                                similarity = self._similarity(old_words[old_idx], new_words[new_idx])
                                if similarity > 0.8:
                                    mapping[new_idx] = old_idx

        return mapping

    def _similarity(self, str1: str, str2: str) -> float:
        """Calculate similarity ratio between two strings"""
        return SequenceMatcher(None, str1, str2).ratio()
