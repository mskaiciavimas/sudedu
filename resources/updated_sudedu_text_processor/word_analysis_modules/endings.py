import torch
import torch.nn as nn
import torch.nn.functional as F
import json
from typing import List
from task_pattern_generator import TaskPatternGenerator


class EndingModel(nn.Module):
    """Matching-based model for ending prediction - matches trained architecture."""

    def __init__(self, vocab_size, num_types, embedding_dim=128, hidden_dim=256):
        super().__init__()

        # Shared character embedding
        self.char_embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)

        # Type embedding
        self.type_projection = nn.Linear(num_types, 128)

        # LSTM for word
        self.word_lstm = nn.LSTM(
            embedding_dim + 128, hidden_dim,
            num_layers=1, batch_first=True,
            bidirectional=True, dropout=0.0
        )

        # LSTM for candidate part
        self.part_lstm = nn.LSTM(
            embedding_dim, hidden_dim,
            num_layers=1, batch_first=True,
            bidirectional=True, dropout=0.0
        )

        # Attention for word
        self.word_attention = nn.Linear(hidden_dim * 2, 1)

        # Attention for part
        self.part_attention = nn.Linear(hidden_dim * 2, 1)

        # Matching layers
        self.dropout = nn.Dropout(0.4)
        self.match_fc1 = nn.Linear(hidden_dim * 4, 256)
        self.match_fc2 = nn.Linear(256, 1)

    def encode_word(self, word_ids, types):
        """Encode word with type information."""
        word_emb = self.char_embedding(word_ids)
        type_emb = self.type_projection(types)
        type_emb = type_emb.unsqueeze(1).expand(-1, word_ids.size(1), -1)
        word_input = torch.cat([word_emb, type_emb], dim=-1)

        word_out, _ = self.word_lstm(word_input)
        attn = torch.softmax(self.word_attention(word_out), dim=1)
        word_vec = (attn * word_out).sum(dim=1)

        return word_vec

    def encode_parts(self, part_ids):
        """Encode candidate parts."""
        part_emb = self.char_embedding(part_ids)
        part_out, _ = self.part_lstm(part_emb)
        attn = torch.softmax(self.part_attention(part_out), dim=1)
        part_vec = (attn * part_out).sum(dim=1)

        return part_vec

    def score(self, word_vec, part_vec):
        """Compute matching score between word and part."""
        combined = torch.cat([word_vec, part_vec], dim=-1)
        combined = self.dropout(combined)
        x = F.relu(self.match_fc1(combined))
        x = self.dropout(x)
        return self.match_fc2(x).squeeze(-1)


class Endings():
    def __init__(self, new_words_to_process):
        self.new_words_to_process = new_words_to_process
        self.categories_used_for_tasks = ["dkt.", "tikr. dkt.", "bdv.", "vksm.", "prv."]  # !!! IF UPDATING THESE ALSO
        # UPDATE self.annotated_types IN text_handler.py
        self.categories_with_endings = ["dkt.", "tikr. dkt.", "bdv.", "vksm.", "prv.", "sktv.", "įv.", "dlv.", "bendr.", "būdn."]

        self.prohibited_words = ["būdn.", "reikiamyb. r.", "tar. n.", "liep. n.", "įvardž.", "bev. g.", "bendr. g."]

        self.difficult_endings = {
            "dkt.": [
                "ias", "is", "us", "ius", "ia", "iai", "ūs", "ios",
                "ys", "io", "aus", "iaus", "ies", "ės",
                "ų", "ių", "ui", "iui", "ei", "ams", "iams", "ums",
                "oms", "ioms", "ėms", "ims", "ą", "ią", "į", "ę",
                "es", "u", "iu", "umi", "iumi", "a", "e", "imi",
                "ais", "iais", "umis", "omis", "iomis", "ėmis", "imis",
                "yje", "uje", "iuje", "oje", "ioje", "ėje",
                "uose", "iuose", "ose", "iose", "ėse", "yse", "iau", "ie",
                "au", "ys", "uje", "ai", "y", "i"
            ],
            "bdv.": [
                "ą", "u", "ias", "io", "iam", "ią", "iu", "iame",
                "iui", "į", "aus", "ų", "a", "oje", "ia", "ios",
                "iai", "ioje", "ė", "ės", "ei", "ę", "ėje", "i", "iems",
                "uose", "ių", "iams", "ius", "iais", "iuose", "ūs", "omis", "ose",
                "es", "ėmis", "ėse", "ioms", "iose", "y", "uj", "iuj", "oj", "ioj", "ėj", "uos", "iuos"
            ],
            "vksm.": [
                "ei", "ame", "ome", "iu", "ate", "ote", "iau", "ai",
                "ėme", "ėte", "ime", "ite"
            ],
            "prv.": [
                "ai", "iai"
            ],
        }

        self.task_pattern_generator = TaskPatternGenerator()

        # Initialize ending prediction model
        self.device = torch.device('cpu')
        self.model = None
        self.metadata = None
        self.char2idx = None
        self.idx2ending = None
        self.ending2idx = None
        self.max_word_len = None
        self.max_part_len = None
        self.vocab_size = None
        self.type2idx = None
        self.num_types = 0
        self.all_endings = None
        self.all_endings_encoded = None
        self.all_endings_tensor = None
        self.all_endings_vec = None

        self._load_ending_model()

    def _load_ending_model(self):
        """Load ending prediction model and metadata during initialization"""
        try:
            with open('word_analysis_modules/ML_models/ending_model_metadata.json', 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError("ending_model_metadata.json not found!")

        # Load character vocabulary
        self.char2idx = self.metadata['char2idx']
        self.max_word_len = self.metadata['max_word_len']
        self.max_part_len = self.metadata['max_part_len']
        self.vocab_size = len(self.char2idx)

        # Load type information
        self.type2idx = self.metadata['type2idx']
        self.num_types = self.metadata['num_types']

        # Load part vocabularies - convert keys to proper types
        idx2ending_raw = self.metadata['idx2part']
        self.idx2ending = {int(k): v for k, v in idx2ending_raw.items()}

        ending2idx_raw = self.metadata['part2idx']
        self.ending2idx = {k: v for k, v in ending2idx_raw.items()}

        # Pre-encode all endings for inference
        self.all_endings = list(self.ending2idx.keys())
        self.all_endings_encoded = []

        for ending in self.all_endings:
            enc = [self.char2idx.get(c, 0) for c in ending]
            enc = enc[:self.max_part_len]
            enc += [0] * (self.max_part_len - len(enc))
            self.all_endings_encoded.append(enc)

        # Convert to tensor
        self.all_endings_tensor = torch.tensor(
            self.all_endings_encoded,
            dtype=torch.long,
            device=self.device
        )

        # Load model
        try:
            self.model = EndingModel(
                self.vocab_size,
                num_types=self.num_types
            )

            # Load state dict and handle _orig_mod prefix
            state_dict = torch.load(
                'word_analysis_modules/ML_models/ending_model.pt',
                map_location=self.device
            )

            # Remove _orig_mod prefix if present (from torch.compile)
            if any(key.startswith('_orig_mod.') for key in state_dict.keys()):
                state_dict = {key.replace('_orig_mod.', ''): value
                              for key, value in state_dict.items()}

            self.model.load_state_dict(state_dict)
            self.model.to(self.device)
            self.model.eval()

            # Pre-encode all endings ONCE
            with torch.no_grad():
                self.all_endings_vec = self.model.encode_parts(self.all_endings_tensor)

        except FileNotFoundError:
            raise FileNotFoundError("ending_model.pt not found!")

    def _word_to_tensor(self, word: str) -> torch.Tensor:
        """Convert word to tensor with padding"""
        indices = [self.char2idx.get(c, 0) for c in word.lower()]

        # Pad to max_word_len
        if len(indices) < self.max_word_len:
            indices += [0] * (self.max_word_len - len(indices))
        else:
            indices = indices[:self.max_word_len]

        return torch.tensor(indices, dtype=torch.long).unsqueeze(0)  # (1, max_word_len)

    def _encode_types(self, word_morph_info: List[str]) -> torch.Tensor:
        """Encode types as multi-hot vector"""
        types_vector = torch.zeros(1, self.num_types, dtype=torch.float)

        for type_str in word_morph_info:
            if type_str in self.type2idx:
                types_vector[0, self.type2idx[type_str]] = 1.0

        return types_vector

    def _validate_ending(self, word: str, ending: str) -> bool:
        """Check if ending actually matches the word"""
        if ending == "":  # Empty ending is always valid
            return True
        return word.endswith(ending)

    def predict_ending(self, word: str, word_morph_info: list) -> str:
        """Predict single ending for a word using matching model"""
        word_lower = word.lower()

        # Encode word
        word_tensor = self._word_to_tensor(word_lower).to(self.device)
        types_tensor = self._encode_types(word_morph_info).to(self.device)

        with torch.no_grad():
            # Encode word
            word_vec = self.model.encode_word(word_tensor, types_tensor)  # [1, H*2]

            # Score against all pre-encoded endings
            N = len(self.all_endings)
            word_vec_expanded = word_vec.unsqueeze(1).expand(-1, N, -1).reshape(N, -1)
            part_vec_expanded = self.all_endings_vec  # Already [N, H*2]

            # Compute scores for all endings
            scores = self.model.score(word_vec_expanded, part_vec_expanded)  # [N]

            # Get highest scoring ending
            predicted_idx = torch.argmax(scores).item()

        # Get the predicted ending
        predicted_ending = self.all_endings[predicted_idx]

        # Validate that ending actually matches the word
        if not self._validate_ending(word_lower, predicted_ending):
            # If predicted ending doesn't match, return empty string
            return ""

        return predicted_ending

    def predict_endings(self):
        total_words = len(self.new_words_to_process)
        processed = 0

        for key, word_info in self.new_words_to_process.items():
            word = word_info["word"]
            word_morph_info = word_info["morphInfo"]
            word_metadata = word_info["metadata"]

            if "ending" not in word_metadata:
                if word:
                    categories_with_endings = [cat for cat in self.categories_with_endings if cat in word_morph_info]

                    if categories_with_endings:
                        predicted_ending = self.predict_ending(word, word_morph_info)
                        word_info["ending"] = predicted_ending

                word_info["metadata"].append("ending")
                processed += 1
                if processed % 1000 == 0 or processed == total_words:
                    progress_percent = processed / total_words * 100
                    print(f"\rWord Ending Determination Progress: {progress_percent:.1f}%", end="",
                          flush=True)

    def evaluate_ending_suitability_for_tasks(self, word, word_prefix, word_ending, word_morph_info):
        if not word.endswith(word_ending):
            print(f"Ending missmatch for word: {word}, ending: {word_ending}")
            return False, ""

        categories_suitable_for_ending_tasks = [cat for cat in self.categories_used_for_tasks if cat in word_morph_info]

        if len(categories_suitable_for_ending_tasks) != 1:
            return False, ""
        else:
            word_category = categories_suitable_for_ending_tasks[0]
            has_prohibited_category = any(cat in word_morph_info for cat in self.prohibited_words)
            has_ending_si = (
                    ("dkt." in word_morph_info or
                     "vksm." in word_morph_info or
                     "dlv." in word_morph_info or
                     "pusd." in word_morph_info)
                    and "sngr." in word_morph_info
                    and "si" not in word_prefix
                    and (word.endswith("is") or
                         word.endswith("si") or
                         word.endswith("ės"))
            )

            if has_prohibited_category:
                return False, ""
            if has_ending_si:
                return False, ""
            else:
                if not word_category in self.difficult_endings or not word_ending in self.difficult_endings[word_category]:
                    return False, ""
                else:
                    return True, word_category

    def determine_endings(self):
        print("\n* Determining endings...")
        self.predict_endings()

        for key, word_info in self.new_words_to_process.items():
            word = word_info["word"]
            word_morph_info = word_info["morphInfo"]
            word_prefix = word_info["prefix"]
            word_ending = word_info["ending"]

            # Clear all ending-related tasks at the start
            tasks_to_clear = ["C85", "C87-1", "C87-2", "C86", "C63", "C65", "C62", "C92"]
            for task in tasks_to_clear:
                word_info["suitableTasks"].pop(task, None)

            ending_suitable, part_of_speech = self.evaluate_ending_suitability_for_tasks(
                word, word_prefix, word_ending, word_morph_info
            )

            if "tikr. dkt" in word_morph_info and not word_info.get("tikrDktSuit", False):
                ending_suitable = False

            if ending_suitable and word_ending:
                word_without_ending = word[:-len(word_ending)] if word_ending else word

                word_ending_combinations = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                    original_word=word,
                    substrings_to_look_for_in_the_word=[word_ending],
                    excluded_word_beginning=word_without_ending,
                    combination_type="ending"
                )

                is_dkt = "dkt." in word_morph_info
                has_vns = "vns." in word_morph_info
                has_dgs = "dgs." in word_morph_info
                has_G = "G." in word_morph_info
                has_Vt = "Vt." in word_morph_info
                has_K = "K." in word_morph_info

                if has_vns and not has_dgs and is_dkt:
                    if has_G:
                        word_info["suitableTasks"]["C85"] = word_ending_combinations
                    elif has_Vt:
                        word_info["suitableTasks"]["C87-2"] = word_ending_combinations
                        if (
                                len(word_ending_combinations) > 0
                                and word_ending_combinations[0][2][0].endswith("e")
                        ):
                            new_answer = "e"
                            coordinate_change = len(word_ending_combinations[0][2][0][:-1])
                            new_start_coord = word_ending_combinations[0][0] + coordinate_change
                            new_end_coord = min(
                                len(word),
                                word_ending_combinations[0][1] + coordinate_change
                            )

                            word_info["suitableTasks"]["C87-1"] = [
                                [new_start_coord, new_end_coord, [new_answer]]
                            ]

                elif has_dgs and not has_vns and is_dkt and has_K:
                    word_info["suitableTasks"]["C86"] = word_ending_combinations

                if part_of_speech in self.difficult_endings and word_ending in self.difficult_endings[part_of_speech]:
                    if part_of_speech == "bdv.":
                        word_info["suitableTasks"]["C63"] = word_ending_combinations
                    if part_of_speech == "vksm.":
                        word_info["suitableTasks"]["C65"] = word_ending_combinations
                    if part_of_speech == "dkt.":
                        word_info["suitableTasks"]["C62"] = word_ending_combinations
                    if part_of_speech == "prv.":
                        word_info["suitableTasks"]["C92"] = word_ending_combinations

        return self.new_words_to_process