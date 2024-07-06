import os
import json
import re
from translate import Translator
from tqdm import tqdm

locales_dir = '_locales'
translator_provider = 'mymemory' # mymemory, google, microsoft, yandex, deepl
reference_locale = 'en'
target_locales = ['fr', 'es', 'de', 'pt', 'it']  # Add more locales as needed
src_dir = 'src'
extensions = ['js', 'ts', 'vue']

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        return json.load(file)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

def extract_keys_from_files():
    keys = set()
    patterns = [
        re.compile(r"translate\(['\"]([\w.]+)['\"]\)"),
        re.compile(r"\$translate\(['\"]([\w.]+)['\"]\)"),
        re.compile(r"translate\(['\"]([\w.]+)['\"],\s*locale\)"),
        re.compile(r"\$translate\(['\"]([\w.]+)['\"],\s*locale\)")
    ]

    for root, _, files in os.walk(src_dir):
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    for pattern in patterns:
                        matches = pattern.findall(content)
                        keys.update(matches)
    return keys

def update_reference_file(reference_filepath, keys):
    reference_data = load_json(reference_filepath)

    # Add new keys with empty values
    for key in keys:
        if key not in reference_data:
            reference_data[key] = {"message": ""}

    # Remove keys not in src files
    keys_to_remove = [key for key in reference_data if key not in keys]
    for key in keys_to_remove:
        del reference_data[key]

    # Sort keys alphabetically
    sorted_reference_data = dict(sorted(reference_data.items()))
    save_json(reference_filepath, sorted_reference_data)

    return keys_to_remove

def translate_json_file(reference_filepath, target_filepath, target_language):
    reference_data = load_json(reference_filepath)
    target_data = load_json(target_filepath) if os.path.exists(target_filepath) else {}

    missing_keys = []
    translated_data = {}

    translator = Translator(provider=translator_provider, to_lang=target_language)

    keys = list(reference_data.keys())

    for key in tqdm(keys, desc=f"Translating to {target_language}", unit="key"):
        value = reference_data[key]
        if key not in target_data or target_data[key]['message'] == "":
            try:
                translated_message = translator.translate(value['message'])
                translated_data[key] = {"message": translated_message}
                missing_keys.append(key)
            except Exception as e:
                print(f"Error translating key '{key}': {e}")
                translated_data[key] = {"message": value['message']}
        else:
            translated_data[key] = target_data[key]

    # Clean up keys that are no longer in the reference file
    keys_to_remove = [key for key in target_data if key not in reference_data]
    for key in keys_to_remove:
        del target_data[key]

    # Merge translated data with existing target data
    target_data.update(translated_data)

    # Sort keys alphabetically
    sorted_target_data = dict(sorted(target_data.items()))

    save_json(target_filepath, sorted_target_data)
    return missing_keys, keys_to_remove

def main():
    reference_filepath = os.path.join(locales_dir, reference_locale, 'messages.json')

    # Step 1: Extract keys from src files
    src_keys = extract_keys_from_files()

    # Step 2: Update the reference file with new keys and clean up old keys
    keys_removed_from_reference = update_reference_file(reference_filepath, src_keys)
    if keys_removed_from_reference:
        print(f"Keys removed from reference: {keys_removed_from_reference}")

    for locale in target_locales:
        target_dir = os.path.join(locales_dir, locale)
        os.makedirs(target_dir, exist_ok=True)
        target_filepath = os.path.join(target_dir, 'messages.json')

        missing_keys, keys_to_remove = translate_json_file(reference_filepath, target_filepath, locale)

        if missing_keys:
            print(f"Keys missing in {locale}: {missing_keys}")
        if keys_to_remove:
            print(f"Keys removed in {locale}: {keys_to_remove}")

if __name__ == "__main__":
    main()
