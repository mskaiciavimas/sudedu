#!/usr/bin/env python3
"""
Script to review entries in memory_dictionary.json with tikrDktSuit: true
Groups entries by lemma and applies decision to all entries with the same lemma.
Allows user to confirm (Y), reject (N), or go back (B) for each lemma.
"""

import json
import sys
from pathlib import Path
from collections import defaultdict


def load_json(filepath):
    """Load JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{filepath}': {e}")
        sys.exit(1)


def save_json(data, filepath):
    """Save JSON file with proper formatting"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def display_lemma(lemma, entry_keys):
    """Display lemma information"""
    print("\n" + "=" * 60)
    print(f"Lemma: {lemma}")
    print(f"Number of entries with this lemma: {len(entry_keys)}")
    print("=" * 60)


def group_by_lemma(data, entries_to_review):
    """Group entries by their lemma"""
    lemma_groups = defaultdict(list)

    for key, entry in entries_to_review:
        lemma = entry.get('lemma', 'N/A')
        lemma_groups[lemma].append(key)

    return lemma_groups


def review_entries(data):
    """Review entries with tikrDktSuit: true, grouped by lemma"""
    # Find all entries with tikrDktSuit: true
    entries_to_review = [(key, entry) for key, entry in data.items()
                         if entry.get('tikrDktSuit') == True]

    if not entries_to_review:
        print("No entries found with tikrDktSuit: true")
        return data, 0

    print(f"\nFound {len(entries_to_review)} entries to review")

    # Group by lemma
    lemma_groups = group_by_lemma(data, entries_to_review)
    lemmas = list(lemma_groups.keys())

    print(f"Grouped into {len(lemmas)} unique lemmas")

    changes_made = 0
    index = 0

    while index < len(lemmas):
        lemma = lemmas[index]
        entry_keys = lemma_groups[lemma]

        display_lemma(lemma, entry_keys)
        print(f"\nProgress: {index + 1}/{len(lemmas)}")

        # Get user input
        while True:
            response = input("\nIs this lemma suitable? (Y/N/B for back): ").strip().upper()

            if response == 'Y':
                print(f"Keeping tikrDktSuit: true for all {len(entry_keys)} entries with lemma '{lemma}'")
                index += 1
                break
            elif response == 'N':
                # Change tikrDktSuit to false for all entries with this lemma
                for key in entry_keys:
                    data[key]['tikrDktSuit'] = False
                print(f"Changed tikrDktSuit to: false for all {len(entry_keys)} entries with lemma '{lemma}'")
                changes_made += len(entry_keys)
                index += 1
                break
            elif response == 'B':
                if index > 0:
                    index -= 1
                    print("Going back to previous lemma...")
                    break
                else:
                    print("Already at the first lemma!")
            else:
                print("Invalid input. Please enter Y, N, or B.")

    return data, changes_made


def main():
    # Get file path from command line or use default
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
    else:
        filepath = "memory_files/memory_dictionary.json"

    print(f"Loading {filepath}...")
    data = load_json(filepath)

    print(f"Total entries in dictionary: {len(data)}")

    # Review entries
    updated_data, changes = review_entries(data)

    # Save results
    if changes > 0:
        # Create backup filename
        path = Path(filepath)
        backup_path = path.parent / f"{path.stem}_corrected{path.suffix}"

        print(f"\n{changes} changes made.")
        print(f"Saving corrected version to: {backup_path}")
        save_json(updated_data, backup_path)
        print("Done!")
    else:
        print("\nNo changes made.")


if __name__ == "__main__":
    main()