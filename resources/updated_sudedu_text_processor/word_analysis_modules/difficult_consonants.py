from task_pattern_generator import TaskPatternGenerator
import re

class DifficultConsonants:
    def __init__(self):
        self.difficult_consonants = {
            "h": r"(?<!c)h",
            "ch": r"ch",
            "f": r"f"
        }
        self.task_pattern_generator = TaskPatternGenerator()
        self.excluded_word_types = ["tikr. dkt.", "dll.", "jst.", "išt."]

    def determine_difficult_consonants(self, new_grammar_words):
        print("\n* Determining similar consonants...")
        for _, word_info in new_grammar_words.items():
            word_metadata = word_info["metadata"]
            if "diff-cons" not in word_metadata:
                word_morph_info = word_info["morphInfo"]

                # Clear similar-consonants-related tasks at the start
                word_info["suitableTasks"].pop("C61", None)

                if word_morph_info and not any(type in word_morph_info for type in self.excluded_word_types):
                    word = word_info["word"]
                    original_word = word
                    ending = word_info["ending"]
                    word = word[:-len(ending)] if ending else word

                    final_matches = []
                    for consonant, consonant_pattern in self.difficult_consonants.items():
                        if re.search(consonant_pattern, word):
                            # Find all occurrences of the consonant in the word using the regular expression
                            matches = [m.start() for m in re.finditer(consonant_pattern, word)]

                            for i, _ in enumerate(matches):
                                final_matches.append(str(i + 1) + consonant)

                    if len(final_matches) > 0:
                        assimilation_combination = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                            original_word=original_word,
                            substrings_to_look_for_in_the_word=final_matches,
                        )
                        word_info["suitableTasks"]["C61"] = assimilation_combination

                word_info["metadata"].append("diff-cons")

        return new_grammar_words