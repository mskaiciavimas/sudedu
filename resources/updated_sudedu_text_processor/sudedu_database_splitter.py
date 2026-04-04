import json

def filter_json_by_range(input_file, output_file, min_key, max_key):
    # Load the JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Convert keys to integers for comparison
    keys = list(map(int, data.keys()))
    highest_key = max(keys)

    # If max_key is higher than the highest existing key, return the whole thing
    if max_key > highest_key:
        filtered_data = data
    else:
        filtered_data = {k: v for k, v in data.items() if min_key <= int(k) <= max_key}

    # Save the filtered data as JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(filtered_data, f, ensure_ascii=False, indent=4)

    print(f"Filtered data saved to {output_file}")


filter_json_by_range('all_texts.json', 'input/sudedu_duomenu_baze.json', 1, 550)