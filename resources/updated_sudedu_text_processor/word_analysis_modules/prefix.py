import torch
import torch.nn as nn
import torch.nn.functional as F
import json
from typing import List
import re
from task_pattern_generator import TaskPatternGenerator


class PrefixModel(nn.Module):
    """Matching-based model for prefix prediction - matches trained architecture."""

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


class Prefixes():
    def __init__(self, new_words_to_process):
        self.prefixes_of_interest = {
            r"^iš": ["i", "š"],
            r"^į": ["į"],
            r"^už": ["ž"],
            r"^at(?!o)": ["t"],
            r"^ap": ["p"]
        }
        self.task_pattern_generator = TaskPatternGenerator()
        self.new_words_to_process = new_words_to_process
        self.device = torch.device('cpu')
        self.model = None
        self.metadata = None
        self.char2idx = None
        self.idx2prefix = None
        self.prefix2idx = None
        self.max_word_len = None
        self.max_part_len = None
        self.vocab_size = None
        self.type2idx = None
        self.num_types = 0
        self.all_prefixes = None
        self.all_prefixes_encoded = None
        self.all_prefixes_tensor = None
        self.all_prefixes_vec = None

        self._load_prefix_model()

    def _load_prefix_model(self):
        """Load prefix prediction model and metadata during initialization"""
        try:
            with open('word_analysis_modules/ML_models/prefix_model_metadata.json', 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError("prefix_model_metadata.json not found!")

        # Load character vocabulary
        self.char2idx = self.metadata['char2idx']
        self.max_word_len = self.metadata['max_word_len']
        self.max_part_len = self.metadata['max_part_len']
        self.vocab_size = len(self.char2idx)

        # Load type information
        self.type2idx = self.metadata['type2idx']
        self.num_types = self.metadata['num_types']

        # Load part vocabularies - convert keys to proper types
        idx2prefix_raw = self.metadata['idx2part']
        self.idx2prefix = {int(k): v for k, v in idx2prefix_raw.items()}

        prefix2idx_raw = self.metadata['part2idx']
        self.prefix2idx = {k: v for k, v in prefix2idx_raw.items()}

        # Pre-encode all prefixes for inference
        self.all_prefixes = list(self.prefix2idx.keys())
        self.all_prefixes_encoded = []

        for prefix in self.all_prefixes:
            enc = [self.char2idx.get(c, 0) for c in prefix]
            enc = enc[:self.max_part_len]
            enc += [0] * (self.max_part_len - len(enc))
            self.all_prefixes_encoded.append(enc)

        # Convert to tensor
        self.all_prefixes_tensor = torch.tensor(
            self.all_prefixes_encoded,
            dtype=torch.long,
            device=self.device
        )

        # Load model
        try:
            self.model = PrefixModel(
                self.vocab_size,
                num_types=self.num_types
            )

            # Load state dict and handle _orig_mod prefix
            state_dict = torch.load(
                'word_analysis_modules/ML_models/prefix_model.pt',
                map_location=self.device
            )

            # Remove _orig_mod prefix if present (from torch.compile)
            if any(key.startswith('_orig_mod.') for key in state_dict.keys()):
                state_dict = {key.replace('_orig_mod.', ''): value
                              for key, value in state_dict.items()}

            self.model.load_state_dict(state_dict)
            self.model.to(self.device)
            self.model.eval()

            # Pre-encode all prefixes ONCE
            with torch.no_grad():
                self.all_prefixes_vec = self.model.encode_parts(self.all_prefixes_tensor)

        except FileNotFoundError:
            raise FileNotFoundError("prefix_model.pt not found!")

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

    def _validate_prefix(self, word: str, prefix: str) -> bool:
        """Check if prefix actually matches the word"""
        if prefix == "":  # Empty prefix is always valid
            return True
        return word.startswith(prefix)

    def predict_prefix(self, word: str, word_morph_info: list) -> str:
        """Predict single prefix for a word using matching model"""
        word_lower = word.lower()

        # Encode word
        word_tensor = self._word_to_tensor(word_lower).to(self.device)
        types_tensor = self._encode_types(word_morph_info).to(self.device)

        with torch.no_grad():
            # Encode word
            word_vec = self.model.encode_word(word_tensor, types_tensor)  # [1, H*2]

            # Score against all pre-encoded prefixes
            N = len(self.all_prefixes)
            word_vec_expanded = word_vec.unsqueeze(1).expand(-1, N, -1).reshape(N, -1)
            part_vec_expanded = self.all_prefixes_vec  # Already [N, H*2]

            # Compute scores for all prefixes
            scores = self.model.score(word_vec_expanded, part_vec_expanded)  # [N]

            # Get highest scoring prefix
            predicted_idx = torch.argmax(scores).item()

        # Get the predicted prefix
        predicted_prefix = self.all_prefixes[predicted_idx]

        # Validate that prefix actually matches the word
        if not self._validate_prefix(word_lower, predicted_prefix):
            # If predicted prefix doesn't match, return empty string
            return ""

        return predicted_prefix

    def prefix_suitable_for_task(self, original_word, prefix):
        matches = []
        final_tasks = []

        for relevant_prefix, difficult_letters in self.prefixes_of_interest.items():
            match = re.search(relevant_prefix, prefix)
            if match:
                matches.append((match, difficult_letters))

        if matches:
            for match, difficult_letters in matches:
                start, end = match.span()

                excluded_word_beginning = original_word[:start]
                tasks = self.task_pattern_generator.generate_word_part_combinations_for_questions(
                    original_word,
                    difficult_letters,
                    excluded_word_beginning=excluded_word_beginning,
                    only_first_instance=True
                )
                final_tasks.extend(tasks)

        if final_tasks:
            return [True, final_tasks]
        else:
            return [False, None]

    def predict_prefixes(self):
        print("\n* Determining prefixes...")
        total_words = len(self.new_words_to_process)
        processed = 0

        for key, word_info in self.new_words_to_process.items():
            word = word_info["word"]
            word_morph_info = word_info["morphInfo"]
            word_metadata = word_info["metadata"]

            # Clear prefix-related tasks at the start
            word_info["suitableTasks"].pop("C69", None)

            if "prefix" not in word_metadata:
                if word:
                    predicted_prefix = self.predict_prefix(word, word_morph_info)
                    word_info["prefix"] = predicted_prefix
                    prefix_suitable_for_task, task_combos = self.prefix_suitable_for_task(word, predicted_prefix)
                    if prefix_suitable_for_task:
                        word_info["suitableTasks"]["C69"] = task_combos
                    else:
                        word_info["suitableTasks"].pop("C69", None)

                word_info["metadata"].append("prefix")
                processed += 1
                if processed % 1000 == 0 or processed == total_words:
                    progress_percent = processed / total_words * 100
                    print(f"\rWord Prefix Determination Progress: {progress_percent:.1f}%", end="",
                          flush=True)

        return self.new_words_to_process