from task_pattern_generator import TaskPatternGenerator
import re

class MemorableSpelling():
    def __init__(self):
        self.memorable_spelling_index = {
            "ačiū": {"core": r"ačiū", "spelling_rules": ["1ū"], "classes": ["1", "2"]},
            "ąsotis": {"core": r"(?<!t)ąsot", "spelling_rules": ["1ą"],
                       "classes": ["1", "2", "3", "4"]},
            "aukštyn": {"core": r"aukštyn", "spelling_rules": ["1y"],
                        "classes": ["3", "4"]},
            "ąžuolas": {"core": r"(?<!r)ąžuol", "spelling_rules": ["1ą", "1uo"],
                        "classes": ["1", "2", "3", "4"]},
            "drąsa": {"core": r"(?<!žy)drąs", "spelling_rules": ["1ą"], "classes": ["4"]},
            "dviese": {"core": r"dviese", "spelling_rules": ["1ie", "2e"],
                       "classes": ["3", "4"]},
            "galbūt": {"core": r"galbūt", "spelling_rules": ["1ū"],
                       "classes": ["3", "4"]},
            "grįžti": {"core": r"grįž[žš]$", "spelling_rules": ["1į"], "classes": ["4"]},
            "įvairus": {"core": r"įvair(?!av|uo)", "spelling_rules": ["1į"], "classes": ["4"], "negative": ""},
            "kąsnis": {"core": r"kąsn", "spelling_rules": ["1ą"], "classes": ["4"]},
            "kažkas": {"core": r"kažk", "spelling_rules": ["1ž"],
                       "classes": ["3", "4"]},
            "keletas": {"core": r"(?<!s)kelet", "spelling_rules": ["2e"],
                        "classes": ["3", "4"]},
            "kęstutis": {"core": r"^kęstu(?!m|o|te|s)", "spelling_rules": ["1ę"],
                         "classes": ["1", "2", "3", "4",
                                    "penkta-klase"]},
            "keturiese": {"core": r"keturiese", "spelling_rules": ["1ie","3e"],
                          "classes": ["3", "4"]},
            "mane": {"core": r"mane", "spelling_rules": ["1e"],
                     "classes": ["1", "2", "3", "4"]},
            "manęs": {"core": r"manęs", "spelling_rules": ["1ę"], "classes": ["4"]},
            "mūsų": {"core": r"mūsų", "spelling_rules": ["1ū", "1ų"],
                     "classes": ["1", "2", "3", "4"]},
            "mąstyti": {"core": r"mąst", "spelling_rules": ["1ą"], "classes": ["4"]},
            "mįslė": {"core": r"mįsl", "spelling_rules": ["1į"],
                      "classes": ["1", "2", "3", "4"]},
            "rąstas": {"core": r"rąst", "spelling_rules": ["1ą"],
                       "classes": ["3", "4"]},
            "rytoj": {"core": r"rytoj", "spelling_rules": ["1y", "1j"],
                      "classes": ["1", "2", "3", "4"]},
            "save": {"core": r"save", "spelling_rules": ["1e"], "classes": ["3", "4"]},
            "savęs": {"core": r"savęs", "spelling_rules": ["1ę"], "classes": ["4"]},
            "šiandien": {"core": r"šiandien", "spelling_rules": ["1ia", "1ie"],
                         "classes": ["1", "2", "3", "4",
                                    "penkta-klase"]},
            "stebuklas": {"core": r"stebukl", "spelling_rules": ["1e", "1u"],
                          "classes": ["3", "4"]},
            "tave": {"core": r"tave", "spelling_rules": ["1e"],
                     "classes": ["1", "2", "3", "4"]},
            "tavęs": {"core": r"tavęs", "spelling_rules": ["1ę"], "classes": ["4"]},
            "jūsų": {"core": r"jūsų", "spelling_rules": ["1ū", "1ų"],
                     "classes": ["1", "2", "3", "4"]},
            "tęsinys": {"core": r"tęsin", "spelling_rules": ["1ę"], "classes": ["4"]},
            "trise": {"core": r"trise", "spelling_rules": ["1i", "1e"],
                      "classes": ["3", "4"]},
            "turbūt": {"core": r"turbūt", "spelling_rules": ["1u", "1ū"],
                       "classes": ["3", "4"]},
            "vėliava": {"core": r"vėliav", "spelling_rules": ["1ė", "1ia"], "classes": ["4"]},
            "žąsis": {"core": r"^žąs(?!l)", "spelling_rules": ["1ą"],
                      "classes": ["1", "2", "3", "4"]},
            "žemyn": {"core": r"žemyn", "spelling_rules": ["1y"],
                      "classes": ["3", "4"]}
        }

        self.task_pattern_generator = TaskPatternGenerator()

    def determine_memorable_spelling(self, new_grammar_words):
        print("\n* Determining memorable spelling...")
        for _, word_info in new_grammar_words.items():
            word_metadata = word_info["metadata"]
            if "mem-spelling" not in word_metadata:
                word = word_info["word"]

                # Clear all memorable-spelling-related tasks at the start
                tasks_to_clear = ["C66-C75", "C66-C76"]
                for task in tasks_to_clear:
                    word_info["suitableTasks"].pop(task, None)

                for key, value in self.memorable_spelling_index.items():
                    if re.search(re.escape(value["core"]), word):
                        before_core = word[:re.search(value["core"], word).start()]
                        memorable_spelling_combinations = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                            original_word=word,
                            substrings_to_look_for_in_the_word=self.memorable_spelling_index[key]["spelling_rules"],
                            excluded_word_beginning = before_core
                        )
                        if "1" in self.memorable_spelling_index[key]["classes"] or "2" in self.memorable_spelling_index[key]["classes"]:
                            word_info["suitableTasks"]["C66-C75"] = memorable_spelling_combinations
                        if "3" in self.memorable_spelling_index[key]["classes"] or "4" in self.memorable_spelling_index[key]["classes"]:
                            word_info["suitableTasks"]["C66-C76"] = memorable_spelling_combinations

                word_info["metadata"].append("mem-spelling")

        return new_grammar_words