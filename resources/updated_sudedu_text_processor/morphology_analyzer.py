import time
import urllib.parse
import urllib.request
import html

MIN_LENGTH_OF_WORD_TO_BE_CONSIDERED = 2

class MorphologyAnalyzer():
    def __init__(self, ambiguities_checker):
        self.ambiguities_checker = ambiguities_checker
        self.dkt_ivardz_lemas = [
            "artimasis", "bagotoji", "baltasis", "baltieji", "baltosios", "dirbantysis",
            "dirbančioji", "dykoji", "greitoji", "grynieji", "gulsčioji",
            "jaunasis", "jaunoji", "juodieji", "kaltinamasis", "kaltinamoji", "karčioji",
            "kertamoji", "kiauroji", "kreivoji", "kruvinoji", "kuliamoji", "laukiamasis",
            "lygiosios", "manoji", "meldžiamasis", "meldžiamoji",
            "miegamasis", "mielasis", "mieloji", "migdomieji", "mirtingasis", "mirtingoji",
            "mirtinoji", "mokamasis", "mylimasis", "mylimoji", "mūsoji", "negeroji",
            "nelabasis", "nežinomasis", "pakeliamoji", "palaimintasis", "palaimintoji",
            "pasigautoji", "paskutinioji", "pasviroji", "perkamieji", "piktasis", "piktoji",
            "pjaunamoji", "praeitoji", "priimamasis", "pėstysis", "raguotasis", "raguotoji",
            "raudonasis", "rašomasis", "rūkomasis", "skaidrioji", "sprogstamoji", "sprogtinoji",
            "sėjamoji", "taupomasis", "tavoji", "teisiamasis", "tiesioji", "valgomasis",
            "vedamasis", "vyresnioji", "vyresnysis", "šaltoji", "šventasis", "šventoji",
            "žadėtoji"
        ]

    def get_lemuoklis_data(self, words_to_process):
        """
        Process words in chunks and return dictionary mapping words to their lemuoklis results.
        Each word maps to a list of results (since lemuoklis can return multiple variants).
        """

        def chunk_words(words_list, chunk_size=300):
            """Split words into chunks for processing"""
            return [
                words_list[i:i + chunk_size]
                for i in range(0, len(words_list), chunk_size)
            ]

        def parse_lemuoklis_output(decoded_lemuoklis_output):
            """
            Parse lemuoklis XML output and create separate entries for each word variant.
            Returns dict: {word: [{lemma: str, types: list}, ...]}
            """
            word_results = {}

            for word in decoded_lemuoklis_output.split('<word='):
                if 'status' in word:
                    continue
                if 'lemma' in word and 'type' in word:
                    lemma = word.split('lemma="')[1].split('"')[0]
                    word_text = word.split('"')[1].lower()
                    types = word.split('type="')[1].split('"')[0].split(', ')

                    if types[0] == 'nežinomas':
                        continue

                    # Initialize list for this word if not exists
                    if word_text not in word_results:
                        word_results[word_text] = []

                    # Append this variant
                    word_results[word_text].append({
                        'lemma': lemma,
                        'types': types
                    })

            return word_results

        # Collect all words that need processing
        words_list = list(words_to_process)
        word_chunks = chunk_words(words_list)

        all_results = {}
        counter = 0
        total_chunks = len(word_chunks)

        for chunk in word_chunks:
            counter += 1
            print(f"Lemuoklis Data Retrieval Progress: {round(counter / total_chunks * 100)}%")

            for attempt in range(3):
                try:
                    url = 'https://sitti.vdu.lt/svetaine/programos/tageris/tageris.php'
                    # Capitalize first letter of each word for lemuoklis
                    word_string = ' '.join([word.capitalize() for word in chunk])

                    values = {
                        'tekstas': word_string,
                        'tipas': 'lemuoti',
                        'pateikti': 'LM',
                        'veiksmas': 'Rezultatas puslapyje'
                    }
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                    data = urllib.parse.urlencode(values).encode('utf-8')
                    req = urllib.request.Request(url, data, headers)
                    response = urllib.request.urlopen(req)
                    lemrez = response.read()
                    lemrez_str = str(lemrez, encoding='UTF-8')
                    decoded_lemuoklis_output = html.unescape(lemrez_str)

                    if decoded_lemuoklis_output:
                        if 'Per didelis tekstas' in decoded_lemuoklis_output or 'nėra teksto' in decoded_lemuoklis_output:
                            raise ValueError("Input text is too large or missing.")

                        chunk_results = parse_lemuoklis_output(decoded_lemuoklis_output)

                        # Merge results
                        for word, variants in chunk_results.items():
                            if len(word) < MIN_LENGTH_OF_WORD_TO_BE_CONSIDERED:
                                continue
                            if word not in all_results:
                                all_results[word] = []
                            all_results[word].extend(variants)

                        break  # Success, exit retry loop

                except Exception as e:
                    print(f"Error while interacting with the website: {e}")
                    if attempt < 2:
                        time.sleep(5)
                    else:
                        print(f"Failed after 3 attempts for chunk {counter}")

        return all_results

    def should_merge_variants(self, variants):
        if len(variants) < 2:
            return False

        morph_infos = [set(v.get("types", [])) for v in variants]

        # IF ANY TWO VARIANTS ARE DIFFERENT WITHIN ANY OF THESE GROUPS - CREATE SEPARATE ENTRIES
        type_groups = {
            "pos": {"prv.", "bdv.", "vksm.", "dlv.", "pusd.", "bendr.", "dkt.", "įv.", "sktv.", "būdn.", "tikr. dkt."},
            "case": {"G.", "K.", "N.", "V.", "Vt.", "Įn.", "Š."},
            "definiteness": {"neįvardž.", "įvardž."},
            "number": {"vns.", "dgs."},
            "gender": {"bendr. g.", "bev. g.", "mot. g.", "vyr. g."},
            "reflexive": {"nesngr.", "sngr."}
        }

        # Collect which grammatical groups differ
        differing_groups = set()

        for i in range(len(morph_infos)):
            for j in range(i + 1, len(morph_infos)):
                for group_name, group in type_groups.items():
                    a = morph_infos[i] & group
                    b = morph_infos[j] & group
                    if a != b:
                        differing_groups.add(group_name)

        if len(differing_groups) > 0:
            # EXCEPTIONS: CREATE MERGED ENTRIES
            # Exception 1: 3 asm. + number-only difference
            if differing_groups == {"number"}:
                for info in morph_infos:
                    if "3 asm." not in info:
                        return False
                return True
        else:
            return True

        return False

    def is_potential_ivardz_dkt(self, lemma, types):
        valid_endings = [
            "iasis", "usis", "ioji", "iojo", "iosios", "iajam", "iajai", "iąjį", "ųjį",
            "iąją", "iuoju", "iąja", "iajame", "iojoje", "ieji", "iųjų", "iesiems",
            "iosioms", "iuosius", "iąsias", "iaisiais", "iosiomis", "iuosiuose",
            "iosiose", "asis", "oji", "ojo", "osios", "ajam", "ajai", "ąjį", "ąją",
            "uoju", "ąja", "ajame", "ojoje", "ųjų", "osioms", "uosius", "ąsias",
            "aisiais", "osiomis", "uosiuose", "osiose", "ysis", "įjį"
        ]

        required_types = {"dkt.", "tikr. dkt."}
        forbidden_types = {"neįvardž.", "įvardž."}

        # Convert list to set for comparison
        types_set = set(types) if isinstance(types, list) else types

        # must contain required type
        if not (types_set & required_types):
            return False

        # must NOT contain forbidden types
        if types_set & forbidden_types:
            return False

        # lemma ending check
        if any(lemma.endswith(ending) for ending in valid_endings):
            if lemma.endswith("sis") and "sngr." in types_set:
                return False
            return True

        return False


    def retrieve_word_morphological_data(self, new_grammar_words):
        print("\n* Retrieving morphological data...")

        self.ambiguities_checker.clear_ambiguities_dicts()

        # Step 1: Filter words that need processing
        words_to_process = []
        for word, word_data in new_grammar_words.items():
            task_meta = word_data.get("metadata", [])
            if "lemma" not in task_meta:
                words_to_process.append(word)

        if not words_to_process:
            return new_grammar_words

        # Step 2: Get lemuoklis data for all words
        lemuoklis_results = self.get_lemuoklis_data(words_to_process)

        # Step 3: Update dictionary with results, creating duplicates as needed
        for original_word in words_to_process:
            word_lower = original_word.lower()

            if word_lower not in lemuoklis_results:
                self.ambiguities_checker.add_to_unfound_words_dictionary(
                    word_lower,
                    new_grammar_words[word_lower]
                )
                continue

            variants = lemuoklis_results[word_lower]

            if self.should_merge_variants(variants):
                # Merge all types (remove duplicates)
                merged_types = set()
                for v in variants:
                    merged_types.update(v["types"])

                new_grammar_words[word_lower]["lemma"] = variants[0]["lemma"]
                new_grammar_words[word_lower]["morphInfo"] = list(merged_types)

                potential_dkt_ivardz = self.is_potential_ivardz_dkt(new_grammar_words[word_lower]["lemma"], new_grammar_words[word_lower]["morphInfo"])

                if potential_dkt_ivardz:
                    if new_grammar_words[word_lower]["lemma"] in self.dkt_ivardz_lemas:
                        if "įvardž." not in new_grammar_words[word_lower]["morphInfo"]:
                            new_grammar_words[word_lower]["morphInfo"].append("įvardž.")
                    else:
                        self.ambiguities_checker.add_dkt_to_potential_ivardz_dictionary(new_grammar_words[word_lower]["lemma"])


                if "lemma" not in new_grammar_words[word_lower]["metadata"]:
                    new_grammar_words[word_lower]["metadata"].append("lemma")

            else:
                # Original behavior (unchanged)
                if len(variants) > 0:
                    new_grammar_words[word_lower]["lemma"] = variants[0]["lemma"]
                    new_grammar_words[word_lower]["morphInfo"] = variants[0]["types"]

                    potential_dkt_ivardz = self.is_potential_ivardz_dkt(new_grammar_words[word_lower]["lemma"],
                                                                        new_grammar_words[word_lower]["morphInfo"])

                    if potential_dkt_ivardz:
                        if new_grammar_words[word_lower]["lemma"] in self.dkt_ivardz_lemas:
                            if "įvardž." not in new_grammar_words[word_lower]["morphInfo"]:
                                new_grammar_words[word_lower]["morphInfo"].append("įvardž.")
                        else:
                            self.ambiguities_checker.add_dkt_to_potential_ivardz_dictionary(
                                new_grammar_words[word_lower]["lemma"])

                    if "lemma" not in new_grammar_words[word_lower]["metadata"]:
                        new_grammar_words[word_lower]["metadata"].append("lemma")

                for i, variant in enumerate(variants[1:], start=1):
                    new_word_key = f"{word_lower}{i}"

                    new_grammar_words[new_word_key] = {
                        "word": word_lower,
                        "lemma": variant["lemma"],
                        "suitableTasks": new_grammar_words[word_lower]["suitableTasks"].copy(),
                        "morphInfo": variant["types"],
                        "syllables": new_grammar_words[word_lower]["syllables"].copy(),
                        "ending": new_grammar_words[word_lower]["ending"],
                        "prefix": new_grammar_words[word_lower]["prefix"],
                        "suffix": new_grammar_words[word_lower]["suffix"],
                        "metadata": new_grammar_words[word_lower]["metadata"].copy()
                    }

                    if "lemma" not in new_grammar_words[new_word_key]["metadata"]:
                        new_grammar_words[new_word_key]["metadata"].append("lemma")

        new_grammar_words = self.ambiguities_checker.resolve_potential_dkt_ivardz_ambiguities(new_grammar_words)

        new_grammar_words = self.ambiguities_checker.resolve_unfound_words(new_grammar_words)

        return new_grammar_words