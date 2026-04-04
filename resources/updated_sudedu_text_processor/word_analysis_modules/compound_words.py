from task_pattern_generator import TaskPatternGenerator
import re

class CompoundWords(object):
    def __init__(self):
        self.compound_words_index = {
            "grėbliakotis": {"core": r"grėbliako", "spelling_rules": ["ia"]},
            "plačiašakis": {"core": r"plačiašak", "spelling_rules": ["ia"]},
            "poilsiavietė": {"core": r"poilsiaviet", "spelling_rules": ["ia"]},
            "rugiagėlė": {"core": r"rugiagėl", "spelling_rules": ["ia"]},
            "piliakalnis": {"core": r"piliakaln", "spelling_rules": ["ia"]},
            "angliakasys": {"core": r"angliakas", "spelling_rules": ["ia"]},
            "valgiaraštis": {"core": r"valgiaraš", "spelling_rules": ["ia"]},
            "žoliapjovė": {"core": r"žoliapjov", "spelling_rules": ["ia"]},
            "vėjarodis": {"core": r"vėjarod", "spelling_rules": ["a"]},
            "sulčiaspaudė": {"core": r"sulčiaspaud", "spelling_rules": ["ia"]},
            "lygiadienis": {"core": r"lygiadien", "spelling_rules": ["ia"]},
            "daugiaaukštis": {"core": r"daugiaaukš", "spelling_rules": ["ia"]},
            "keturiasdešimt": {"core": r"keturiasdešimt", "spelling_rules": ["ia"]},
            "penkiasdešimt": {"core": r"penkiasdešimt", "spelling_rules": ["ia"]},
            "šešiasdešimt": {"core": r"šešiasdešimt", "spelling_rules": ["ia"]},
            "septyniasdešimt": {"core": r"septyniasdešimt", "spelling_rules": ["ia"]},
            "aštuoniasdešimt": {"core": r"aštuoniasdešimt", "spelling_rules": ["ia"]},
            "devyniasdešimt": {"core": r"devyniasdešimt", "spelling_rules": ["ia"]},
            "saulėgrąža": {"core": r"saulėgrąž", "spelling_rules": ["ė"]},
            "kojūgalis": {"core": r"kojūgal", "spelling_rules": ["ū"]},
            "ryškiaspalvis": {"core": r"ryškiaspalv", "spelling_rules": ["ia"]},
            "saldžiarūgštis": {"core": r"saldžiarūgš", "spelling_rules": ["ia"]},
            "rugiapjūtė": {"core": r"rugiapj", "spelling_rules": ["ia"]},
            "įvairiaspalvis": {"core": r"įvairiaspalv", "spelling_rules": ["ia"]},
            "naujakuriai": {"core": r"naujakur", "spelling_rules": ["a"]},
            "vabzdžiaėdžiai": {"core": r"vabzdžiaėd", "spelling_rules": ["ia"]},
            "įvairialypiai": {"core": r"įvairialyp", "spelling_rules": ["ia"]},
            "įvairiapusiai": {"core": r"įvairiapus", "spelling_rules": ["ia"]}
        }
        self.task_pattern_generator = TaskPatternGenerator()

    def determine_compound_words(self, new_grammar_words):
        print("\n* Determining compound words...")
        for _, word_info in new_grammar_words.items():
            word_metadata = word_info["metadata"]
            if "compound" not in word_metadata:
                word = word_info["word"]

                # Clear all compound-words-related tasks at the start
                word_info["suitableTasks"].pop("C64", None)

                for key, value in self.compound_words_index.items():
                    if value["core"] in word:
                        before_core = word[:re.search(value["core"], word).start()]
                        memorable_spelling_combinations = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                            original_word=word,
                            substrings_to_look_for_in_the_word=self.compound_words_index[key]["spelling_rules"],
                            excluded_word_beginning=before_core
                        )

                        word_info["suitableTasks"]["C64"] = memorable_spelling_combinations

                word_info["metadata"].append("compound")

        return new_grammar_words