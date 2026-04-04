import time
import msvcrt
import winsound
import re

class ModularAmbiguitiesChecker:
    def __init__(self):
        self.morph_parts_ambiguities_dict = {}
        self.words_ambiguities_dict = {}
        self.potential_dkt_ivardz = {}
        self.unfound_words_dict = {}

    def clear_ambiguities_dicts(self):
        self.morph_parts_ambiguities_dict = {}
        self.words_ambiguities_dict = {}
        self.potential_dkt_ivardz = {}
        self.unfound_words_dict = {}

    def add_to_unfound_words_dictionary(self, word, word_data):
        """
        Add word that wasn't found by lemuoklis.
        """
        self.unfound_words_dict[word] = {
            "word_data": word_data
        }

    def resolve_unfound_words(self, new_grammar_words):
        unfound_keys = list(self.unfound_words_dict.keys())
        total = len(unfound_keys)
        index = 0

        if total > 0:
            winsound.Beep(1000, 300)

        while index < total:
            word = unfound_keys[index]
            info = self.unfound_words_dict[word]
            word_lower = word.lower()

            # Main menu for this word
            while True:
                print("\n" + "=" * 40)
                print(f"Word not found by lemuoklis [{index + 1} / {total}]")
                print(f"Word: {word}")

                user_input = input(
                    "\nEnter 'n' to next word (skip), 'a' to add manually, or 'b' to go back: ").strip().lower()

                # Go back to previous word
                if user_input == "b":
                    if index > 0:
                        index -= 1
                        break  # Exit inner loop to go to previous word
                    else:
                        print("Already at first entry.")
                        continue

                # Move to next word without adding - mark as processed
                elif user_input == "n":
                    # Add "lemma" to metadata so it won't be processed again
                    if word_lower in new_grammar_words:
                        if "lemma" not in new_grammar_words[word_lower].get("metadata", []):
                            new_grammar_words[word_lower]["metadata"].append("lemma")
                    print(f"Skipped '{word}' (marked as processed)")
                    index += 1
                    break  # Exit inner loop to go to next word

                # Add manually - can create multiple entries
                elif user_input == "a":
                    # Entry creation loop - can create multiple variants
                    while True:
                        print("\n" + "-" * 40)
                        print(f"Creating entry for: {word}")

                        # Get lemma
                        lemma_input = input("Enter lemma (or 'x' to exit): ").strip()
                        if lemma_input.lower() == 'x':
                            print("Exiting entry creation.")
                            break  # Exit entry creation loop, back to main menu

                        if not lemma_input:
                            print("Lemma cannot be empty. Try again.")
                            continue

                        # Get morphInfo
                        morph_input = input("Enter morphInfo (comma-separated, with or without quotes): ").strip()

                        # Parse morphInfo from various formats
                        morph_list = self._parse_morph_info(morph_input)

                        if morph_list is None:
                            print("Invalid morphInfo format. Try again.")
                            continue

                        # Confirm before adding
                        print("\nYou entered:")
                        print(f"  Lemma: {lemma_input}")
                        print(f"  MorphInfo: {morph_list}")
                        confirm = input("Confirm? (y/n): ").strip().lower()

                        if confirm == 'y':
                            # Determine the key for this entry
                            if word_lower not in new_grammar_words:
                                # Word doesn't exist at all - use base word
                                word_key = word_lower
                            elif "lemma" not in new_grammar_words[word_lower].get("metadata", []):
                                # Word exists but has no lemma (empty from lemuoklis failure)
                                # Overwrite the empty entry with first manual entry
                                word_key = word_lower
                            else:
                                # Word exists and has lemma - create numbered variant
                                variant_num = 1
                                while f"{word_lower}{variant_num}" in new_grammar_words:
                                    variant_num += 1
                                word_key = f"{word_lower}{variant_num}"

                            # Create entry
                            new_grammar_words[word_key] = {
                                "word": word_lower,
                                "lemma": lemma_input,
                                "suitableTasks": {},
                                "morphInfo": morph_list,
                                "syllables": {},
                                "ending": "",
                                "prefix": "",
                                "suffix": "",
                                "metadata": ["lemma"]
                            }

                            print(f"Added '{word_key}' to dictionary.")

                            # Ask if user wants to create another variant
                            another = input("\nCreate another entry for this word? (y/n): ").strip().lower()
                            if another != 'y':
                                # Done creating entries, move to next word
                                index += 1
                                break  # Exit entry creation loop
                        else:
                            print("Cancelled. Try again.")
                            continue

                    # After exiting entry creation loop, break to move to next word
                    break

                else:
                    print("Invalid input. Please enter 'n', 'a', or 'b'.")
                    continue

        return new_grammar_words

    def _parse_morph_info(self, morph_input):
        """
        Parse morphInfo from various input formats:
        - "prv.", "vns.", "V."
        - prv., vns., V.
        - ['prv.', 'vns.', 'V.']
        Returns list of strings or None if invalid.
        """
        import json

        if not morph_input:
            return []

        # Try parsing as JSON first (handles lists and quoted strings)
        try:
            parsed = json.loads(morph_input)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed]
            elif isinstance(parsed, str):
                return [parsed.strip()]
        except json.JSONDecodeError:
            pass

        # Clean up smart quotes
        morph_input = morph_input.replace("'", "'").replace("'", "'")
        morph_input = morph_input.replace(""", '"').replace(""", '"')

        # Remove outer brackets if present
        morph_input = morph_input.strip()
        if morph_input.startswith('[') and morph_input.endswith(']'):
            morph_input = morph_input[1:-1]

        # Split by comma
        items = [item.strip() for item in morph_input.split(',')]

        # Remove quotes from each item if present
        result = []
        for item in items:
            item = item.strip()
            if (item.startswith('"') and item.endswith('"')) or \
                    (item.startswith("'") and item.endswith("'")):
                item = item[1:-1]

            if item:
                result.append(item)

        return result if result else None

    def add_dkt_to_potential_ivardz_dictionary(self, lemma):
        self.potential_dkt_ivardz[lemma] = {"ivardz": False}

    def resolve_potential_dkt_ivardz_ambiguities(self, new_words_to_process):
        import winsound

        ambiguity_keys = list(self.potential_dkt_ivardz.keys())
        total = len(ambiguity_keys)
        index = 0

        if total > 0:
            # 🔔 Optional single beep to alert user
            winsound.Beep(1000, 300)

        while index < total:
            ambiguity_key = ambiguity_keys[index]
            info = self.potential_dkt_ivardz[ambiguity_key]

            # --- DISPLAY LOGIC ---
            print("\n" + "=" * 40)
            print("Is įvardžiuotinis?")
            print(f"Lemma: {ambiguity_key}")

            # ✅ Let user type freely
            user_input = input("\nEnter Y, N, or 'b' to go back: ").strip()

            # ⬅ Go back
            if user_input.lower() == "b":
                if index > 0:
                    index -= 1
                else:
                    print("Already at first entry.")
                continue

            elif user_input.lower() == "y":
                info["ivardz"] = True

            elif user_input.lower() == "n":
                info["ivardz"] = False

            else:
                print("Wrong input. Please enter Y, N, or b.")
                continue

            index += 1

        for key, word_info in new_words_to_process.items():
            lemma = word_info["lemma"]
            morph_info = word_info["morphInfo"]
            if lemma in self.potential_dkt_ivardz and self.potential_dkt_ivardz[lemma]["ivardz"]:
                if "įvardž." not in morph_info:
                    morph_info.append("įvardž.")

        return new_words_to_process

    def add_to_morph_parts_ambiguity_dictionary(self, key, word, word_lemma, word_morph_info, ambiguities):
        self.morph_parts_ambiguities_dict[key] = {"word": word, "lemma": word_lemma, "wordMorphInfo": word_morph_info, "ambiguities": ambiguities}

    def resolve_morph_parts_ambiguities(self, new_words_to_process, tag):
        import winsound

        ambiguity_keys = list(self.morph_parts_ambiguities_dict.keys())
        total = len(ambiguity_keys)
        index = 0

        if total > 0:
            winsound.Beep(1000, 300)

        while index < total:
            ambiguity_key = ambiguity_keys[index]
            info = self.morph_parts_ambiguities_dict[ambiguity_key]

            word = info["word"]
            lemma = info["lemma"]
            word_morph_info = info["wordMorphInfo"]
            options = info["ambiguities"]

            while True:  # keep prompting until valid number or 'b'
                # --- DISPLAY LOGIC ---
                print("\n" + "=" * 40)
                print(f"WORD: {word} ({tag}) [{index + 1} / {total}]")
                print(f"Lemma: {lemma}")
                print(f"MorphData: {word_morph_info}")

                for i, option in enumerate(options, 1):
                    display_value = option[1] if tag == "syllables" else option
                    print(f"{i}) {display_value}")

                user_input = input("\nEnter number or 'b' to go back: ").strip()

                # Go back
                if user_input.lower() == "b":
                    if index > 0:
                        index -= 1
                    else:
                        print("Already at first entry.")
                    break  # exit prompt loop, go to previous index

                # Must be a valid number
                if user_input.isdigit():
                    choice = int(user_input)
                    if 1 <= choice <= len(options):
                        resolved = options[choice - 1]
                        # write back and move to next entry
                        new_words_to_process[ambiguity_key][tag] = resolved[0] if isinstance(resolved, (list,
                                                                                                        tuple)) else resolved
                        index += 1
                        break  # exit prompt loop
                    else:
                        print("Invalid number. Please choose a number from the list.")
                else:
                    print("Invalid input. Please enter a number from the list or 'b' to go back.")

        return new_words_to_process

    def add_to_word_ambiguity_dictionary(self, word_coords, word, ambiguities):
        self.words_ambiguities_dict[f"{word_coords[0]}-{word_coords[1]}-{word_coords[2]}"] = {"word": word, "word_coords": word_coords, "ambiguities": ambiguities}

    def resolve_word_ambiguities(self, memory_text_annotation, memory_dictionary, ambiguity_context_lookup_dict):
        import winsound
        import json
        import re

        ambiguity_keys = list(self.words_ambiguities_dict.keys())
        total = len(ambiguity_keys)
        index = 0

        # Track new entries added during this session
        newly_added_entries = []

        winsound.Beep(1000, 300)

        while index < total:
            ambiguity_key = ambiguity_keys[index]
            info = self.words_ambiguities_dict[ambiguity_key]

            word = info["word"]
            text_id, sentence_id, word_id = info["word_coords"]
            options = info["ambiguities"]

            # Check if any newly added entries match this word
            for new_entry_key in newly_added_entries:
                new_entry = memory_dictionary[new_entry_key]
                # Strip numbers from both keys to compare base words
                base_new_word = re.sub(r'\d+$', '', new_entry_key)
                base_current_word = word.lower()

                if base_new_word == base_current_word and new_entry_key not in options:
                    # Add the new entry to this word's options
                    options[new_entry_key] = new_entry

            option_keys = list(options.keys())  # IMPORTANT

            print("\n" + "=" * 40)
            print(f"WORD: {word} [{index + 1} / {total}]\n")

            sentence = ambiguity_context_lookup_dict[text_id][int(sentence_id)]["sentence"]
            bolded_sentence = re.sub(
                rf"\b{re.escape(word)}\b",
                lambda m: f"<<{m.group(0)}>>",
                sentence,
                flags=re.IGNORECASE
            )

            print(f"SENTENCE: {bolded_sentence}\n")

            for i, key in enumerate(option_keys, 1):
                details = options[key]
                display_value = f"Lemma: {details['lemma']}\nMorphData: {details['morphInfo']}"
                print(f"{i}) {display_value}")

            while True:
                user_input = input(
                    "\nEnter number, 'b' to go back, 'n' to create new, or 'x' to skip: ").strip().lower()

                if user_input == "b":
                    if index > 0:
                        index -= 1
                    else:
                        print("Already at first entry.")
                    break

                if user_input == "x":
                    memory_text_annotation[text_id][sentence_id][word_id]["wordVariant"] = ""
                    memory_text_annotation[text_id][sentence_id][word_id]["annotated"] = False
                    index += 1
                    break

                if user_input == "n":
                    # Ask which entry to copy
                    while True:
                        copy_input = input("Which entry number to copy? ").strip()
                        if copy_input.isdigit():
                            copy_choice = int(copy_input)
                            if 1 <= copy_choice <= len(option_keys):
                                source_key = option_keys[copy_choice - 1]
                                break
                        print("Invalid entry number.")

                    # Copy entry from memory_dictionary
                    import copy
                    new_entry_data = copy.deepcopy(memory_dictionary[source_key])

                    # Edit loop
                    while True:
                        print("\n" + "-" * 40)
                        print("Current entry data:")
                        editable_keys = list(new_entry_data.keys())
                        for i, key in enumerate(editable_keys, 1):
                            print(f"{i}) {key}: {new_entry_data[key]}")

                        edit_input = input("\nEnter number to edit, or 's' to save: ").strip().lower()

                        if edit_input == 's':
                            break

                        if edit_input.isdigit():
                            edit_choice = int(edit_input)
                            if 1 <= edit_choice <= len(editable_keys):
                                key_to_edit = editable_keys[edit_choice - 1]
                                print(f"\nEditing '{key_to_edit}'")
                                print(f"Current value: {new_entry_data[key_to_edit]}")
                                new_value_input = input("Enter new value: ").strip()

                                # Replace smart quotes with regular quotes
                                new_value_input = new_value_input.replace("'", "'").replace("'", "'")
                                new_value_input = new_value_input.replace(""", '"').replace(""", '"')
                                new_value_input = new_value_input.replace("'", '"')

                                # Try to parse as JSON (for lists, dicts, etc.)
                                try:
                                    new_entry_data[key_to_edit] = json.loads(new_value_input)
                                except json.JSONDecodeError:
                                    # If not valid JSON, treat as string
                                    new_entry_data[key_to_edit] = new_value_input

                                print(f"Updated {key_to_edit} to: {new_entry_data[key_to_edit]}")
                            else:
                                print("Invalid number.")
                        else:
                            print("Invalid input.")

                    # Find highest number for this word in memory_dictionary
                    base_word = word.lower()
                    max_num = -1
                    for key in memory_dictionary.keys():
                        if key == base_word:
                            max_num = max(max_num, 0)
                        elif key.startswith(base_word) and key[len(base_word):].isdigit():
                            num = int(key[len(base_word):])
                            max_num = max(max_num, num)

                    # Create new entry key
                    new_entry_key = f"{base_word}{max_num + 1}"

                    # Save to memory_dictionary
                    memory_dictionary[new_entry_key] = new_entry_data

                    # Track this new entry
                    newly_added_entries.append(new_entry_key)

                    # Annotate the word
                    memory_text_annotation[text_id][sentence_id][word_id]["wordVariant"] = new_entry_key
                    memory_text_annotation[text_id][sentence_id][word_id]["annotated"] = True

                    print(f"\nCreated new entry: {new_entry_key}")
                    index += 1
                    break

                if user_input.isdigit():
                    choice = int(user_input)
                    if 1 <= choice <= len(option_keys):
                        resolved = option_keys[choice - 1]
                        memory_text_annotation[text_id][sentence_id][word_id]["wordVariant"] = resolved
                        memory_text_annotation[text_id][sentence_id][word_id]["annotated"] = True
                        index += 1
                        break

                print("Invalid input. Enter a valid number, 'b', 'n', or 'x'.")

        return memory_text_annotation, memory_dictionary

    def confirm_tikr_dkt_suitability(self, new_grammar_words, memory_dictionary):
        tikr_dkt_lemmas = {}

        # Step 1: Find lemmas with "tikr. dkt." in NEW words only
        for key, entry in new_grammar_words.items():
            morph_info = entry.get("morphInfo", [])
            if "tikr. dkt." in morph_info:
                lemma = entry.get("lemma", "")
                if lemma and lemma not in tikr_dkt_lemmas:
                    tikr_dkt_lemmas[lemma] = None  # Unconfirmed

        # Step 2: Check memory_dictionary for existing "tikrDktSuit" values
        for key, entry in memory_dictionary.items():
            morph_info = entry.get("morphInfo", [])
            lemma = entry.get("lemma", "")

            if "tikr. dkt." in morph_info and lemma in tikr_dkt_lemmas:
                if "tikrDktSuit" in entry:
                    tikr_dkt_lemmas[lemma] = entry["tikrDktSuit"]

        # Step 3: Display unconfirmed lemmas for user input
        unconfirmed_lemmas = {k: v for k, v in tikr_dkt_lemmas.items() if v is None}

        if unconfirmed_lemmas:
            ambiguity_keys = list(unconfirmed_lemmas.keys())
            total = len(ambiguity_keys)
            index = 0

            # Optional beep
            winsound.Beep(1000, 300)

            while index < total:
                lemma = ambiguity_keys[index]

                # Display with progress
                print("\n" + "=" * 40)
                print(f"Progress: {index + 1}/{total}")
                print("Is tikr. dkt. suitable for tasks?")
                print(f"Lemma: {lemma}")

                user_input = input("\nEnter Y, N, or 'b' to go back: ").strip()

                # Go back
                if user_input.lower() == "b":
                    if index > 0:
                        index -= 1
                    else:
                        print("Already at first entry.")
                    continue

                elif user_input.lower() == "y":
                    tikr_dkt_lemmas[lemma] = True

                elif user_input.lower() == "n":
                    tikr_dkt_lemmas[lemma] = False

                else:
                    print("Wrong input. Please enter Y, N, or b.")
                    continue

                index += 1

        # Step 4: Apply results to NEW words only
        for key, entry in new_grammar_words.items():
            morph_info = entry.get("morphInfo", [])
            lemma = entry.get("lemma", "")

            if "tikr. dkt." in morph_info and lemma in tikr_dkt_lemmas:
                if tikr_dkt_lemmas[lemma] is not None:
                    entry["tikrDktSuit"] = tikr_dkt_lemmas[lemma]

        return new_grammar_words