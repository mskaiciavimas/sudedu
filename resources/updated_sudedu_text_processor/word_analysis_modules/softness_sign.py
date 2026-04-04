import re
from task_pattern_generator import TaskPatternGenerator

class SoftnessSign:
    def __init__(self):
        self.dvibalsiai = [
            'ai', 'au', 'ei', 'ie', 'ui', 'uo',
            'iui', 'iau', 'iuo', "iai"
        ]
        self.vowels = ["a", "ą", "e", "ę", "ė", "i", "į", "y", "o", "u", "ų", "ū"]
        self.softness_sign_circumstances_and_task_codes = {
            1: {
                "substrings": ["ia"],
                "type": "real",
                "taskId": "C91-1"
            },
            2: {
                "substrings": ["io"],
                "type": "real",
                "taskId": "C91-2"
            },
            3: {
                "substrings": ["iu"],
                "type": "real",
                "taskId": "C91-3"
            },
            4: {
                "substrings": ["iū"],
                "type": "real",
                "taskId": "C91-4"
            },
            5: {
                "substrings": ["e"],
                "type": "mock",
                "taskId": "C91-5"
            },
            6: {
                "substrings": [
                    "suk", "kan", "ram", "nuk", "rav", "jo", "ju", "jū", "ja", "sav", "ruk", "tuk", "muk",
                    "rūs", "rūk", "tūr", "kūr", "šok", "lo", "lu", "lū", "la"
                ],
                "type": "mock",
                "taskId": "C91-6"
            }

        }
        self.task_pattern_generator = TaskPatternGenerator()
        self.excluded_word_types = ["tikr. dkt.", "dll.", "jst.", "išt."]
    
    def find_dvibalsiai_in_word(self, word, syllables):
        letter_identity_track = {idx: False for idx in range(len(word))}

        # Convert syllables keys to integers for faster access
        syllables_int = {int(k): v for k, v in syllables.items()}

        # Check each dvibalsis pattern individually
        for dvibalsis in self.dvibalsiai:
            # Find all occurrences of this dvibalsis
            for match in re.finditer(re.escape(dvibalsis), word):
                start_idx = match.start()
                end_idx = match.end() - 1

                # Only mark if all letters belong to the same syllable
                if syllables_int[start_idx]["syllable"] == syllables_int[end_idx]["syllable"]:
                    for i in range(start_idx, end_idx + 1):
                        letter_identity_track[i] = True

        return letter_identity_track

    def find_softness_sign_in_front_single_vowel(self, original_word, word, syllables, substrings, task_type):
        matches = []
        final_matches = []
        task_combinations = []

        if task_type == "real":
            matches = [m.start() for m in re.finditer(re.escape(substrings[0]), word)]

            if not matches:
                return task_combinations

            dvibalsiai_positions = self.find_dvibalsiai_in_word(word, syllables)

            for instance, idx in enumerate(matches):
                # ONLY IF VOWEL AND SOFTNESS SIGN ARE NOT IN DVIGARSIS
                if not dvibalsiai_positions[idx] and not dvibalsiai_positions[idx + 1]:
                    syllables_int = {int(k): v for k, v in syllables.items()}
                    # ONLY IF VOWEL AND SOFTNESS SIGN ARE IN SAME SYLLABLE
                    if syllables_int[idx]["syllable"] == syllables_int[idx + 1]["syllable"]:
                        final_matches.append(str(instance + 1) + word[idx:idx + 2])

        if task_type == "mock":
            for substring in substrings:
                start_index = word.find(substring)
                if start_index != -1:
                    end_index = start_index + len(substring)

                    substring_vowel_idx = next(
                        (start_index + i for i, c in enumerate(word[start_index:end_index]) if c in self.vowels),
                        None
                    )

                    if substring_vowel_idx is not None:
                        matches.append(substring_vowel_idx)

            if not matches:
                return task_combinations

            dvibalsiai_positions = self.find_dvibalsiai_in_word(word, syllables)

            for instance, idx in enumerate(matches):
                # ONLY IF VOWEL IS NOT AT THE START OF THE WORD AND IF IT IS NOT IN DVIGARSIS
                if not idx == 0 and not dvibalsiai_positions[idx]:
                    # ONLY IF THERE IS NO I IN FRONT OF THE VOWEL
                    if word[idx - 1] != "i":
                        final_matches.append(str(instance + 1) + word[idx])

        if final_matches:
            task_combinations = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                original_word=original_word,
                substrings_to_look_for_in_the_word=final_matches
            )

        return task_combinations

    def determine_softness_signs(self, new_grammar_words):
        print("\n* Determining softness sign for 1-2 classes...")
        for _, word_info in new_grammar_words.items():
            if "softness" not in word_info["metadata"]:
                word_morph_info = word_info["morphInfo"]

                # Clear all softness-sign-related tasks at the start
                tasks_to_clear = ["C91-1", "C91-2", "C91-3", "C91-4", "C91-5", "C91-6"]
                for task in tasks_to_clear:
                    word_info["suitableTasks"].pop(task, None)

                if word_morph_info and not any(type in word_morph_info for type in self.excluded_word_types):
                    word = word_info["word"]
                    original_word = word
                    ending = word_info["ending"]
                    word = word[:-len(ending)] if ending else word
                    syllables = word_info["syllables"]

                    for circumstance, conditions in self.softness_sign_circumstances_and_task_codes.items():
                        substrings = conditions["substrings"]
                        task_id = conditions["taskId"]
                        task_type = conditions["type"]

                        task_combinations = self.find_softness_sign_in_front_single_vowel(
                            original_word, word, syllables, substrings, task_type
                        )

                        if task_combinations:
                            word_info["suitableTasks"][task_id] = task_combinations

                word_info["metadata"].append("softness")

        return new_grammar_words