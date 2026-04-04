from file_handler import FileHandler
from text_handler import TextHandler
from morphology_analyzer import MorphologyAnalyzer
from ambiguities_manual_checker import ModularAmbiguitiesChecker
from word_analysis_modules.syllables import Syllables
from word_analysis_modules.memorable_spelling import MemorableSpelling
from word_analysis_modules.prefix import Prefixes
from word_analysis_modules.endings import Endings
from word_analysis_modules.assimilation import Assimilation
from word_analysis_modules.similar_consonants import SimilarConsonants
from word_analysis_modules.standalone_vowels import StandaloneVowels
from word_analysis_modules.softness_sign import SoftnessSign
from word_analysis_modules.dvibalsiai import Dvibalsiai
from word_analysis_modules.m_dvigarsiai import MDvigarsiai
from word_analysis_modules.compound_words import CompoundWords
from word_analysis_modules.difficult_consonants import DifficultConsonants

"""
TASK_CODE_DICT = {
    "C66-C75", # MEMORABLE SPELLING 1-2 CLASSES
    "C66-C76", # MEMORABLE SPELLING 3-4 CLASSES
    "C71", # CONSONANT ASSIMILATION
    "C72", # MISRIEJI DVIGARSIAI
    "C69", # PREFIXES
    "prs-c": "C70",
    "C63", # ENDINGS FOR 3-4 CLASSES bdv.
    "C65", # ENDINGS FOR 3-4 CLASSES vks.
    "C62", # ENDINGS FOR 3-4 CLASSES dkt.
    "C64", # COMPOUND WORDS
    "C67", # SIMILAR CONSONANTS
    "C68", # DVIBALSIAI
    "j-c": "C61",
    "C85",  # DKT ENDINGS FOR 1-2 CLASSES vns. g.
    "C86",  # DKT ENDINGS FOR 1-2 dgs. k.
    "C87-1",  # DKT ENDINGS FOR 1-2 CLASSES vns. vt. for 1st class
    "C87-2",  # DKT ENDINGS FOR 1-2 CLASSES vns. vt. for 2nd class
    "C88-1",  # STANDALONE VOWELS FOR 1-2 CLASSES e
    "C88-2",  # STANDALONE VOWELS FOR 1-2 CLASSES ė
    "C89-1",  # STANDALONE VOWELS FOR 1-2 CLASSES i
    "C89-2",  # STANDALONE VOWELS FOR 1-2 CLASSES y
    "C90-1",  # STANDALONE VOWELS FOR 1-2 CLASSES u
    "C90-2",  # STANDALONE VOWELS FOR 1-2 CLASSES ū
    "C91-1", # SOFTNESS SIGN FOR 1-2 CLASSES ia
    "C91-2", # SOFTNESS SIGN FOR 1-2 CLASSES io
    "C91-3", # SOFTNESS SIGN FOR 1-2 CLASSES iu
    "C91-4", # SOFTNESS SIGN FOR 1-2 CLASSES iū
    "C91-5", # SOFTNESS SIGN FOR 1-2 CLASSES distraction - e
    "C91-6", # SOFTNESS SIGN FOR 1-2 CLASSES distraction - a, o, u, ū
    "C92", # ENDINGS FOR 3-4 CLASSES prv.
}
"""
# TURN COMPRESSION ON FOR FINAL FILES TO TAKE LESS SPACE
JSON_COMPRESSION = False

# LIST OF TASKS THAT TEXTS WILL BE PROCESSED FOR
CURRENT_TASK_META = set(["lemma", "syllables", "ending", "prefix", "mem-spelling", "assim", "sim-cons", "diff-cons", "vowels", "softness", "dvib", "m-dvig", "compound"])

META_TO_RERUN = ["ending"] # NEVER LEMMA!

# LOADING TEXTS FROM DATABASE
file_handler = FileHandler()
all_texts = file_handler.load_text_database("input/sudedu_duomenu_baze.json")

# SAVE ALL TEXT IN OUTPUT
file_handler.save_json("output/sudedu_duomenu_baze.json", all_texts, JSON_COMPRESSION)

# INITIALIZE AMBIGUITY CHECKER
ambiguities_checker = ModularAmbiguitiesChecker()

# FILTERING TEXTS
text_handler = TextHandler(ambiguities_checker)
filtered_texts = text_handler.filter_by_class_and_SF(all_texts)

# SAVE FILTERED TEXTS
file_handler.save_text_comp_filtered_texts(filtered_texts, JSON_COMPRESSION)

# GET ALL GRAMMAR TEXTS
all_grammar_texts = {}

for grade in ("1_2", "3_4"):
    grammar_texts = filtered_texts.get(grade, {}).get("gramatika", {})

    for text_id, entry in grammar_texts.items():
        all_grammar_texts[text_id] = entry

# LOADING MEMORY FILE
memory_dictionary, memory_text_annotation = file_handler.load_memory_files(META_TO_RERUN)

# GET WORDS THAT NEED TO BE PROCESSED IN THIS RUN
new_grammar_words = text_handler.find_new_grammar_words(all_grammar_texts, memory_dictionary, CURRENT_TASK_META)

sentence_lookup_file_for_ambiguity_checking = text_handler.create_file_for_ambiguity_sentence_lookup(all_grammar_texts)

# GET MORPHOLOGICAL INFORMATION OF NEW WORDS
morphology_analyzer = MorphologyAnalyzer(ambiguities_checker)
new_grammar_words = morphology_analyzer.retrieve_word_morphological_data(new_grammar_words)

ambiguities_checker.confirm_tikr_dkt_suitability(new_grammar_words, memory_dictionary)

# GET WORD SYLLABLES
syllables_determination = Syllables(ambiguities_checker)
new_grammar_words = syllables_determination.determine_syllables(new_grammar_words)

# UPDATE MEMORY DICTIONARY
memory_dictionary = text_handler.update_memory_dictionary(new_grammar_words, memory_dictionary)

# GET WORD PREFIXES
prefix_determination = Prefixes(new_grammar_words)
new_grammar_words = prefix_determination.predict_prefixes()

# GET WORD ENDINGS
endings_determination = Endings(new_grammar_words)
new_grammar_words = endings_determination.determine_endings()

# CHECK FOR MEMORABLE SPELLING
memorable_spelling_determination = MemorableSpelling()
new_grammar_words = memorable_spelling_determination.determine_memorable_spelling(new_grammar_words)

# CHECK FOR CONSONANT ASSIMILATION
assimilation_determination = Assimilation()
new_grammar_words = assimilation_determination.determine_assimilation(new_grammar_words)

# CHECK FOR SIMILAR CONSONANTS
similar_consonant_determination = SimilarConsonants()
new_grammar_words = similar_consonant_determination.determine_similar_consonants(new_grammar_words)

# CHECK FOR DIFFICULT CONSONANTS
difficult_consonants_determination = DifficultConsonants()
new_grammar_words = difficult_consonants_determination.determine_difficult_consonants(new_grammar_words)

# CHECK FOR STANDALONE VOWELS
standalone_vowel_determination = StandaloneVowels()
new_grammar_words = standalone_vowel_determination.determine_standalone_vowels(new_grammar_words)

# CHECK FOR SOFTNESS SIGN FOR 1-2 CLASSES
softness_sign_determination = SoftnessSign()
new_grammar_words = softness_sign_determination.determine_softness_signs(new_grammar_words)

# CHECK FOR DVIBALSIAI
dvibalsiai_determination = Dvibalsiai()
new_grammar_words = dvibalsiai_determination.determine_dvibalsiai(new_grammar_words)

# CHECK FOR MISRIEJI DVIGASRSIAI
m_dvigarsiai_determination = MDvigarsiai()
new_grammar_words = m_dvigarsiai_determination.determine_m_dvigarsiai(new_grammar_words)

# CHECK FOR COMPOUND WORDS
compound_word_determination = CompoundWords()
new_grammar_words = compound_word_determination.determine_compound_words(new_grammar_words)

# GENERATE PROCESSED TEXTS AND MEMORY FILES
memory_dictionary, memory_text_annotation, all_grammar_texts_variant_coded, suitable_words_coded, pattern_dict = text_handler.generate_grammar_text_suitable_word_list_and_task_patterns(all_grammar_texts, memory_text_annotation, memory_dictionary)

# FILTER AND SAVE CODED GRAMMAR TEXTS
filtered_texts = text_handler.filter_by_class_and_SF(all_grammar_texts_variant_coded)
file_handler.save_grammar_filtered_texts(filtered_texts, JSON_COMPRESSION)

# SAVE SUITABLE WORDS AND PATTERN DICTIONARY files
file_handler.save_suitable_words_and_patterns(suitable_words_coded, pattern_dict, JSON_COMPRESSION)

# SAVE MEMORY FILES
file_handler.save_memory_files(memory_dictionary, memory_text_annotation, JSON_COMPRESSION)

