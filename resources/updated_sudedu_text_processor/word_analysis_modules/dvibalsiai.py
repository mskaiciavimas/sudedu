import re
from task_pattern_generator import TaskPatternGenerator

class Dvibalsiai:
    def __init__(self):
        self.dvibalsiai_without_softness_sign = [
            'ai', 'au', 'ei', 'ie', 'ui', 'uo'
        ]
        self.dvibalsiai_with_softness_sign = [
            'iai', 'iau', 'iui', 'iuo',
        ]
        self.task_pattern_generator = TaskPatternGenerator()
        self.excluded_word_types = ["tikr. dkt.", "dll.", "jst.", "išt."]

    def find_dvibalsiai_without_softness_sign_in_word(self, original_word, word, syllables):
        task_combinations = []
        # Convert syllables keys to integers for faster access
        syllables_int = {int(k): v for k, v in syllables.items()}

        final_matches = []
        # Check each dvigarsis pattern individually
        for dvibalsis in self.dvibalsiai_without_softness_sign:
            # Find all occurrences of this dvibalsis
            matches = [m.start() for m in re.finditer(re.escape(dvibalsis), word)]

            for instance, idx in enumerate(matches):
                start_idx = idx
                end_idx = idx + len(dvibalsis) - 1

                # Only mark if all letters belong to the same syllable
                if syllables_int[start_idx]["syllable"] == syllables_int[end_idx]["syllable"]:
                    syllable_of_the_match = syllables_int[start_idx]["syllable"]

                    # Skip if preceded by 'i' in the same syllable
                    if start_idx > 0 and word[start_idx - 1] == "i" and syllables_int[start_idx - 1][
                        "syllable"] == syllable_of_the_match:
                        continue

                    final_matches.append(str(instance + 1) + word[start_idx:end_idx + 1])

        if len(final_matches) > 0:
            task_combinations = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                original_word=original_word,
                substrings_to_look_for_in_the_word=final_matches
            )

        return task_combinations

    def find_dvibalsiai_with_softness_sign_in_word(self, original_word, word, syllables):
        task_combinations = []
        # Convert syllables keys to integers for faster access
        syllables_int = {int(k): v for k, v in syllables.items()}

        final_matches = []
        # Check each dvigarsis pattern individually
        for dvibalsis in self.dvibalsiai_with_softness_sign:
            # Find all occurrences of this dvibalsis
            matches = [m.start() for m in re.finditer(re.escape(dvibalsis), word)]

            for instance, idx in enumerate(matches):
                start_idx = idx
                end_idx = idx + len(dvibalsis) - 1

                # Only mark if all letters belong to the same syllable
                if syllables_int[start_idx]["syllable"] == syllables_int[end_idx]["syllable"]:
                    final_matches.append(str(instance + 1) + word[start_idx:end_idx + 1])

        if len(final_matches) > 0:
            task_combinations = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                original_word=original_word,
                substrings_to_look_for_in_the_word=final_matches
            )

        return task_combinations

    def determine_dvibalsiai(self, new_grammar_words):
        print("\n* Determining dvibalsiai...")
        for _, word_info in new_grammar_words.items():
            if "dvib" not in word_info["metadata"]:
                word_morph_info = word_info["morphInfo"]

                # Clear all dvibalsiai-related tasks at the start
                tasks_to_clear = ["C68-1", "C68-2"]
                for task in tasks_to_clear:
                    word_info["suitableTasks"].pop(task, None)

                if word_morph_info and not any(type in word_morph_info for type in self.excluded_word_types):
                    word = word_info["word"]
                    original_word = word
                    ending = word_info["ending"]
                    word = word[:-len(ending)] if ending else word
                    syllables = word_info["syllables"]

                    dvibalsiai_without_softness_sign = self.find_dvibalsiai_without_softness_sign_in_word(original_word, word, syllables)
                    if len(dvibalsiai_without_softness_sign) > 0:
                        word_info["suitableTasks"]["C68-1"] = dvibalsiai_without_softness_sign

                    dvibalsiai_with_softness_sign = self.find_dvibalsiai_with_softness_sign_in_word(original_word, word, syllables)
                    if len(dvibalsiai_with_softness_sign) > 0:
                        word_info["suitableTasks"]["C68-2"] = dvibalsiai_with_softness_sign

                word_info["metadata"].append("dvib")

        return new_grammar_words