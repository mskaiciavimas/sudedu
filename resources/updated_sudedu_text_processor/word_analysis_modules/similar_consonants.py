import re
from task_pattern_generator import TaskPatternGenerator

class SimilarConsonants:
    def __init__(self):
        self.similar_sounding_consonants = {
            "k": ["k"],
            "g": ["g"],
            "p": ["p"],
            "b": ["b"],
            "t": ["t"],
            "d": ["d"],
            "ž": ["ž"],
            "z": ["z"],
            "s": ["s"],
            "š": ["š"],
        }
        self.hard_consonants = ['b', 'd', 'g', 'z', 'ž']
        self.soft_consonants = ['p', 't', 'k', 's', 'š', 'c', 'č']
        self.task_pattern_generator = TaskPatternGenerator()
        self.excluded_word_types = ["tikr. dkt.", "dll.", "jst.", "išt."]

    def determine_similar_consonants(self, new_grammar_words):
        print("\n* Determining similar consonants...")
        for _, word_info in new_grammar_words.items():
            word_metadata = word_info["metadata"]
            if "sim-cons" not in word_metadata:
                word_morph_info = word_info["morphInfo"]

                # Clear similar-consonants-related tasks at the start
                word_info["suitableTasks"].pop("C67", None)

                if word_morph_info and not any(type in word_morph_info for type in self.excluded_word_types):
                    word = word_info["word"]
                    original_word = word
                    ending = word_info["ending"]
                    word = word[:-len(ending)] if ending else word

                    similarities = []
                    for consonant, similarity in self.similar_sounding_consonants.items():
                        # If the consonant is a hard consonant, ensure that the following character is not a soft consonant
                        if consonant in self.hard_consonants:
                            pattern = re.escape(consonant) + r"(?![" + "".join(self.soft_consonants) + r"])"
                        # If the consonant is a soft consonant, ensure that the following character is not a hard consonant
                        elif consonant in self.soft_consonants:
                            pattern = re.escape(consonant) + r"(?![" + "".join(self.hard_consonants) + r"])"
                        # For other consonants, no special condition
                        else:
                            pattern = re.escape(consonant)

                        # Find all occurrences of the consonant in the word using the regular expression
                        matches = [match.start() for match in re.finditer(pattern, word)]

                        for i, _ in enumerate(matches):
                            similarities.append(str(i+1) + similarity[0])

                    if len(similarities) > 0:
                        assimilation_combination = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                            original_word=original_word,
                            substrings_to_look_for_in_the_word=similarities,
                        )
                        word_info["suitableTasks"]["C67"] = assimilation_combination

                word_info["metadata"].append("sim-cons")

        return new_grammar_words
