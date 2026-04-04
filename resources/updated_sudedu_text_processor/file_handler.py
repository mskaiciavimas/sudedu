import os
import json
from typing import Dict, List, Any
from datetime import datetime

class FileHandler():
    def __init__(self):
        self.all_texts = {}

    def load_json(self, path, default: Any):
        if not os.path.exists(path):
            return default
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def save_json(self, path, data, compress: True):
        with open(path, "w", encoding="utf-8") as f:
            if compress:
                # Fully compact - no spaces, no newlines
                json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
            else:
                # With indentation but no extra spaces
                json.dump(data, f, ensure_ascii=False, indent=2, separators=(',', ':'))

    def load_text_database(self, text_database_file_path):
        print("* Loading text database...")
        self.all_texts = self.load_json(text_database_file_path, {})
        if len(self.all_texts) == 0:
            raise FileNotFoundError("Text database file not found.")
        else:
            return self.all_texts

    def save_text_comp_filtered_texts(self, all_texts_filtered, json_compression):
        for grade, categories in all_texts_filtered.items():
            texts = categories["teksto_suvokimas"]
            filename = f"output/{grade}_klase_teksto_suvokimas_tekstai.json"
            self.save_json(filename, texts, json_compression)
            print(f"✓ {filename} ({len(texts)} texts)")

    def save_grammar_filtered_texts(self, all_texts_filtered, json_compression):
        for grade, categories in all_texts_filtered.items():
            texts = categories["gramatika"]
            filename = f"output/{grade}_klase_gramatika_tekstai.json"
            self.save_json(filename, texts, json_compression)
            print(f"✓ {filename} ({len(texts)} texts)")

    def save_suitable_words_and_patterns(self, suitable_words_coded, pattern_dict, json_compression):
        self.save_json("output/rasyba_suitable_words.json", suitable_words_coded, json_compression)
        self.save_json("output/rasyba_suitable_words_patterns.json", pattern_dict, json_compression)

    def load_memory_files(self, meta_to_rerun):
        print("* Loading memory files...")

        # Load the JSON files
        memory_dict = self.load_json("memory_files/memory_dictionary.json", {})
        memory_text_annotation = self.load_json("memory_files/memory_text_annotation.json", {})

        # Remove specified metadata keys from each word in memory_dict
        for word_data in memory_dict.values():
            if "metadata" in word_data:
                word_data["metadata"] = [
                    meta for meta in word_data["metadata"] if meta not in meta_to_rerun
                ]

        return memory_dict, memory_text_annotation

    def save_memory_files(self, memory_dictionary, memory_text_annotation, json_compression):
        print("* Saving memory files...")

        # Main paths
        main_dir = "memory_files"
        backup_dir = os.path.join(main_dir, "back_ups")

        # Ensure backup directory exists
        os.makedirs(backup_dir, exist_ok=True)

        # Save main files
        self.save_json(f"{main_dir}/memory_dictionary.json",
                       memory_dictionary, json_compression)
        self.save_json(f"{main_dir}/memory_text_annotation.json",
                       memory_text_annotation, json_compression)

        # Timestamp for backups
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Save backups
        self.save_json(f"{backup_dir}/memory_dictionary_{timestamp}.json",
                       memory_dictionary, json_compression)
        self.save_json(f"{backup_dir}/memory_text_annotation_{timestamp}.json",
                       memory_text_annotation, json_compression)
