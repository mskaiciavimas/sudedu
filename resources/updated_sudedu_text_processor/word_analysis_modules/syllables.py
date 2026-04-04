import torch
import torch.nn as nn
import json
import re

class Syllables:
    def __init__(self, ambiguities_checker):
        # Load metadata
        try:
            with open('word_analysis_modules/ML_models/syllabification_model_metadata.json', 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError("syllabification_model_metadata.json not found!")
        self.char2idx = self.metadata['char2idx']
        self.max_len = self.metadata['max_len']
        vocab_size = max(self.char2idx.values()) + 1

        # Device
        self.device = torch.device("cpu")

        # Initialize model
        try:
            self.model = self.SyllableModel(vocab_size).to(self.device)
            self.model.load_state_dict(torch.load('word_analysis_modules/ML_models/syllabification_model.pt', map_location=self.device))
            self.model.eval()
        except FileNotFoundError:
            raise FileNotFoundError("syllabification_model.pt not found!")

        self.ambiguities_checker = ambiguities_checker

    class SyllableModel(nn.Module):
        def __init__(self, vocab_size, embedding_dim=256, hidden_dim1=256, hidden_dim2=128):
            super().__init__()
            self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
            self.lstm1 = nn.LSTM(embedding_dim, hidden_dim1, batch_first=True, bidirectional=True)
            self.lstm2 = nn.LSTM(hidden_dim1 * 2, hidden_dim2, batch_first=True, bidirectional=True)
            self.fc = nn.Linear(hidden_dim2 * 2, 2)

        def forward(self, x):
            x = self.embedding(x)
            x, _ = self.lstm1(x)
            x, _ = self.lstm2(x)
            x = self.fc(x)
            return x  # raw logits

    def decode_syllable_output(self, output):
        def syllable_decoder(output_group):
            decoded_syllables = {}
            syllables = output_group.split("-")
            decoded_syllable_no_tracker = 0
            decoded_syllable_letter_no_tracker = 0

            for syllable in syllables:
                for letter in syllable:
                    decoded_syllables[decoded_syllable_letter_no_tracker] = {
                        "letter": letter,
                        "syllable": decoded_syllable_no_tracker
                    }
                    decoded_syllable_letter_no_tracker += 1
                decoded_syllable_no_tracker += 1

            return decoded_syllables

        syllable_group_1 = re.sub(r'[+]', '', output)
        syllable_group_2 = re.sub(r'[-]', '', output)
        syllable_group_2 = syllable_group_2.replace('+', '-')

        decoded_syllable_group_1 = syllable_decoder(syllable_group_1)
        decoded_syllable_group_2 = syllable_decoder(syllable_group_2)

        all_syllable_versions = [decoded_syllable_group_1, decoded_syllable_group_2]

        # Remove duplicates
        unique_syllable_options = []
        seen = set()
        for d in all_syllable_versions:
            serialized = json.dumps(d, sort_keys=True, ensure_ascii=False)
            if serialized not in seen:
                seen.add(serialized)
                unique_syllable_options.append(d)

        final_result = []
        for syllable_option in unique_syllable_options:
            formatted_output = ''
            current_syllable = 0
            for index in syllable_option:
                if syllable_option[index]["syllable"] != current_syllable:
                    formatted_output += '-'
                    current_syllable = syllable_option[index]["syllable"]
                formatted_output += syllable_option[index]["letter"]
            final_result.append([syllable_option, formatted_output])

        return final_result

    def word_to_tensor(self, word):
        indices = [self.char2idx.get(c, 0) for c in word]
        if len(indices) < self.max_len:
            indices += [0] * (self.max_len - len(indices))
        else:
            indices = indices[:self.max_len]
        return torch.tensor(indices, dtype=torch.long).unsqueeze(0)

    def predict_syllables(self, word, threshold=0.5):
        x = self.word_to_tensor(word.lower()).to(self.device)
        with torch.no_grad():
            logits = self.model(x)
            logits = logits[:, :len(word), :]
            probs = torch.sigmoid(logits).squeeze(0).cpu().numpy()

        result = []
        for i, c in enumerate(word):
            result.append(c)
            if i < len(probs):
                plus_prob, minus_prob = probs[i]
                if minus_prob >= threshold:
                    result.append('-')
                if plus_prob >= threshold:
                    result.append('+')
        return ''.join(result)

    def determine_syllables(self, new_grammar_words, threshold=0.5):
        print("\n* Determining syllables...")
        self.ambiguities_checker.clear_ambiguities_dicts()

        # Count total words to process
        total_words = len(new_grammar_words)
        processed = 0

        for key, word_info in new_grammar_words.items():
            word = word_info["word"]
            if not word:  # skip empty strings
                continue

            word_metadata = word_info["metadata"]

            if 'syllables' not in word_metadata:
                word_lemma = word_info["lemma"]
                word_morph_info = word_info["morphInfo"]
                # --- Predict syllables ---
                syllable_string = self.predict_syllables(word.lower(), threshold)
                syllabified = self.decode_syllable_output(syllable_string)

                # --- Track ambiguities ---
                if len(syllabified) > 1:
                    self.ambiguities_checker.add_to_morph_parts_ambiguity_dictionary(
                        key, word, word_lemma, word_morph_info, syllabified
                    )
                else:
                    word_info["syllables"] = syllabified[0][0]

                word_info["metadata"].append("syllables")

                # --- Update progress every `update_interval` words ---
                processed += 1
                if processed % 1000 == 0 or processed == total_words:
                    progress_percent = processed / total_words * 100
                    print(f"\rWord Syllabification Progress: {progress_percent:.1f}%\n", end="", flush=True)

        new_grammar_words = self.ambiguities_checker.resolve_morph_parts_ambiguities(new_grammar_words, "syllables")

        return new_grammar_words

