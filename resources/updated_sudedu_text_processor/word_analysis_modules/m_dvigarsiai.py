import re
from task_pattern_generator import TaskPatternGenerator

class MDvigarsiai:
    def __init__(self):
        self.m_dvigarsiai = ['el', 'em', 'en', 'er', 'il', 'im', 'in', 'ir', 'ul', 'um', 'un', 'ur']
        self.consonants = ['b', 'c', 'č', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 'š', 't', 'v', 'z', 'ž']
        self.task_pattern_generator = TaskPatternGenerator()
        self.excluded_word_types = ["tikr. dkt.", "dll.", "jst.", "išt."]

    def find_m_dvigarsiai_in_word(self, original_word, word, syllables):
        task_combinations = []
        final_matches = []
        syllables_int = {int(k): v for k, v in syllables.items()}

        for dvigarsis in self.m_dvigarsiai:
            matches = [m.start() for m in re.finditer(re.escape(dvigarsis), word)]

            for instance, idx in enumerate(matches):
                if idx + 2 < len(word) and word[idx + 2] in self.consonants:
                    if syllables_int[idx]["syllable"] == syllables_int[idx+1]["syllable"]:
                        syllable_of_the_match = syllables_int[idx]["syllable"]
                        if idx > 0 and word[idx - 1] == "i" and syllables_int[idx - 1][
                            "syllable"] == syllable_of_the_match:
                                if dvigarsis.startswith("u"):
                                    final_matches.append(str(instance + 1) + word[idx-1:idx + 2])
                                else:
                                    continue
                        else:
                            final_matches.append(str(instance + 1) + word[idx:idx + 2])

        if len(final_matches) > 0:
            task_combinations = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                original_word=original_word,
                substrings_to_look_for_in_the_word=final_matches
            )

        return task_combinations

    def determine_m_dvigarsiai(self, new_grammar_words):
        print("\n* Determining m. dvigarsiai...")
        for _, word_info in new_grammar_words.items():
            if "m-dvig" not in word_info["metadata"]:
                word_morph_info = word_info["morphInfo"]

                # Clear m-dvigarsiai-related tasks at the start
                word_info["suitableTasks"].pop("C72", None)

                if word_morph_info and not any(type in word_morph_info for type in self.excluded_word_types):
                    word = word_info["word"]
                    original_word = word
                    ending = word_info["ending"]
                    word = word[:-len(ending)] if ending else word
                    syllables = word_info["syllables"]

                    task_combinations = self.find_m_dvigarsiai_in_word(original_word, word, syllables)
                    if len(task_combinations) > 0:
                        word_info["suitableTasks"]["C72"] = task_combinations

                word_info["metadata"].append("m-dvig")

        return new_grammar_words