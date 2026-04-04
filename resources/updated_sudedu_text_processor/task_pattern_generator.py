

class TaskPatternGenerator():
    def __init__(self):
        self.permitted_word_variations = {
            "suffix": {
                # "yt": "ai"
            },
            "ending": {
                "yje": "y",
                "y": "yje",
                "uje": "uj",
                "uj": "uje",
                "iuje": "iuj",
                "iuj": "iuje",
                "oje": "oj",
                "oj": "oje",
                "ioje": "ioj",
                "ioj": "ioje",
                "ėje": "ėj",
                "ėj": "ėje",
                "uose": "uos",
                "uos": "uose",
                "iuose": "iuos",
                "iuos": "iuose",
            }
        }

        self.permitted_word_variations_specific_words = {
            "ending": {
                "moteries": "s",
                "obelies": "s",
                "seseries": "s",
                "moters": "ies",
                "obels": "ies",
                "sesers": "ies"
            }
        }

    def generate_word_part_combinations_for_questions(self, original_word, substrings_to_look_for_in_the_word,
                                                      excluded_word_beginning=None, excluded_word_ending=None,
                                                      combination_type=None, only_first_instance=False):

        results = []

        for substring in substrings_to_look_for_in_the_word:
            # SOME SUBSTRINGS HAVE NUMBERS IN THEM THAT SPECIFY WHICH INSTANCE OF IT TO ACT ON
            # Split substring into potential number and sub-string part
            import re

            match = re.match(r"(\d*)([a-zA-Ząčęėįšųūž]+)", substring)
            number, processed_substring = match.groups()

            word_to_search = original_word

            # If excluded_word_beginning is provided, adjust word to only search in the part excluding the excluded_word_beginning
            if excluded_word_beginning:
                # Check if the word starts with the provided excluded_word_beginning
                if original_word.startswith(excluded_word_beginning):
                    word_to_search = word_to_search[len(excluded_word_beginning):]
                else:
                    print(f"Word start mismatch for {original_word} ({excluded_word_beginning})")
                    continue
            if excluded_word_ending:
                # Check if the word end with the provided excluded_word_ending
                if original_word.endswith(excluded_word_ending):
                    word_to_search = word_to_search[:-len(excluded_word_ending)]
                else:
                    print(f"Word end mismatch for {original_word} ({excluded_word_ending})")
                    continue

            # Find all instances of sub in the remaining part of the word
            indices = [m.start() for m in re.finditer(processed_substring, word_to_search)]

            if not indices:
                continue

            # Determine which indices to process based on number prefix and only_first_instance flag
            if number:
                # Use specific index from number prefix
                index = int(number) - 1
                if index >= len(indices):
                    continue
                indices_to_process = [indices[index]]
            elif only_first_instance:
                # Process only the first match
                indices_to_process = [indices[0]]
            else:
                # Process all matches
                indices_to_process = indices

            # Process each selected index
            for location in indices_to_process:
                # Adjust the location considering the excluded_word_beginning
                actual_location = len(excluded_word_beginning) + location if excluded_word_beginning else location

                # Extract excluded_word_beginning, located substring, and suffix
                excluded_word_beginning_part = [original_word[:actual_location]]
                located_substring = [original_word[actual_location:actual_location + len(processed_substring)]]

                # Add permitted variations if applicable
                if combination_type in self.permitted_word_variations:
                    if processed_substring in self.permitted_word_variations[combination_type]:
                        located_substring.append(self.permitted_word_variations[combination_type][processed_substring])

                # Add specific word variations if applicable
                if combination_type in self.permitted_word_variations_specific_words and original_word in self.permitted_word_variations_specific_words[combination_type]:
                    located_substring.append(self.permitted_word_variations_specific_words[combination_type][original_word])

                suffix_part = [original_word[actual_location + len(processed_substring):]]

                start_index = len(excluded_word_beginning_part[0])
                end_index = len(original_word) - len(suffix_part[0])
                result = [start_index, end_index, located_substring]

                results.append(result)

        return results