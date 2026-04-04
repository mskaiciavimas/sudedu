import re
from task_pattern_generator import TaskPatternGenerator

class StandaloneVowels:
    def __init__(self):
        # All Lithuanian vowel pairs
        self.dvibalsiai_and_softness_sign_vowel_combinations = [
            'ai', 'au', 'ei', 'ie', 'ui', 'uo', 'iu', "iū",
            "ių", 'ia', 'ią', 'io', 'iui', 'iau', 'iuo', "iai"
        ]

        # Standalone vowels with associated task IDs and syllable ranges
        self.standalone_vowels_and_task_codes = {
            "e": {"taskId": "C88-1", "syllRange": [0, 100]},
            "ė": {"taskId": "C88-2", "syllRange": [0, 100]},
            "i": {"taskId": "C89-1", "syllRange": [2, 3]},
            "y": {"taskId": "C89-2", "syllRange": [2, 3]},
            "u": {"taskId": "C90-1", "syllRange": [2, 3]},
            "ū": {"taskId": "C90-2", "syllRange": [2, 3]}
        }
        self.task_pattern_generator = TaskPatternGenerator()
        self.excluded_word_types = ["tikr. dkt.", "dll.", "jst.", "išt."]

    def find_dvibalsiai_in_word(self, word, syllables):
        letter_identity_track = {idx: False for idx in range(len(word))}

        # Convert syllables keys to integers for faster access
        syllables_int = {int(k): v for k, v in syllables.items()}

        # Check each dvigarsis pattern individually
        for dvigarsis in self.dvibalsiai_and_softness_sign_vowel_combinations:
            # Find all occurrences of this dvigarsis
            for match in re.finditer(re.escape(dvigarsis), word):
                start_idx = match.start()
                end_idx = match.end() - 1

                # Only mark if all letters belong to the same syllable
                if syllables_int[start_idx]["syllable"] == syllables_int[end_idx]["syllable"]:
                    for i in range(start_idx, end_idx + 1):
                        letter_identity_track[i] = True

        return letter_identity_track

    def find_standalone_vowel(self, original_word, word, syllables, syll_range, letter):
        task_combinations = []

        # Convert syllables keys to integers
        syllables_int = {int(k): v for k, v in syllables.items()}

        # Check if word falls in the allowed syllable range
        last_syllable = syllables_int[len(original_word) - 1]["syllable"] + 1
        if not (syll_range[0] <= last_syllable <= syll_range[1]):
            return task_combinations

        # Find all positions of this letter in the word
        matches = [m.start() for m in re.finditer(re.escape(letter), word)]

        if not matches:
            return task_combinations

        dvibalsiai_positions = self.find_dvibalsiai_in_word(word, syllables)

        final_matches = [
            str(instance + 1) + word[idx]
            for instance, idx in enumerate(matches)
            if not dvibalsiai_positions[idx]
        ]

        if final_matches:
            task_combinations = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                original_word=original_word,
                substrings_to_look_for_in_the_word=final_matches
            )

        return task_combinations

    def determine_standalone_vowels(self, new_grammar_words):
        print("\n* Determining standalone vowels...")
        for _, word_info in new_grammar_words.items():
            if "vowels" not in word_info["metadata"]:
                word_morph_info = word_info["morphInfo"]

                # Clear all standalone-vowel-related tasks at the start
                tasks_to_clear = ["C88-1", "C88-2", "C89-1", "C89-2", "C90-1", "C90-2"]
                for task in tasks_to_clear:
                    word_info["suitableTasks"].pop(task, None)

                if word_morph_info and not any(type in word_morph_info for type in self.excluded_word_types):
                    word = word_info["word"]
                    original_word = word
                    ending = word_info["ending"]
                    word = word[:-len(ending)] if ending else word
                    syllables = word_info["syllables"]

                    for letter, conditions in self.standalone_vowels_and_task_codes.items():
                        task_id = conditions["taskId"]
                        syll_range = conditions["syllRange"]

                        task_combinations = self.find_standalone_vowel(
                            original_word, word, syllables, syll_range, letter
                        )

                        if task_combinations:
                            word_info["suitableTasks"][task_id] = task_combinations

                word_info["metadata"].append("vowels")

        return new_grammar_words
