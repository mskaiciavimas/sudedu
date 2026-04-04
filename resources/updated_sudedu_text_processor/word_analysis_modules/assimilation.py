from collections import defaultdict
from task_pattern_generator import TaskPatternGenerator

class Assimilation:
    def __init__(self):
        self.hard_consonants = ['b', 'd', 'g', 'z', 'ž']
        self.soft_consonants = ['p', 't', 'k', 's', 'š', 'c', 'č']
        self.letter_tracking_dict = defaultdict(int)
        self.task_pattern_generator = TaskPatternGenerator()
        self.excluded_word_types = ["tikr. dkt.", "dll.", "jst.", "išt."]

    def determine_assimilation(self, new_grammar_words):
        print("\n* Determining consonant assimilation...")
        for _, word_info in new_grammar_words.items():
            self.letter_tracking_dict = defaultdict(int)
            word_metadata = word_info["metadata"]
            if "assim" not in word_metadata:

                # Clear assimilation-related tasks at the start
                word_info["suitableTasks"].pop("C71", None)

                word_morph_info = word_info["morphInfo"]
                if word_morph_info and not any(type in word_morph_info for type in self.excluded_word_types):
                    word = word_info["word"]
                    original_word = word
                    ending = word_info["ending"]
                    word = word[:-len(ending)] if ending else word

                    assimilations = []

                    for i in range(1, len(word) - 1):  # Skip the first and last letters of the word
                        curr = word[i]
                        self.letter_tracking_dict[curr] += 1
                        next_char = word[i + 1]

                        hard_soft = (curr in self.soft_consonants and
                                     next_char in self.hard_consonants)
                        soft_hard = (curr in self.hard_consonants and
                                     next_char in self.soft_consonants)

                        if hard_soft or soft_hard:
                            assimilations.append(str(self.letter_tracking_dict[curr]) + curr)

                    if len(assimilations) > 0:
                        assimilation_combination = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                            original_word=original_word,
                            substrings_to_look_for_in_the_word=assimilations,
                        )

                        word_info["suitableTasks"]["C71"] = assimilation_combination

                word_info["metadata"].append("assim")

        return new_grammar_words