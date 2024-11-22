import os
import re
from pathlib import Path

def to_kebab_case(name):
    # Remove file extension
    base_name = os.path.splitext(name)[0]
    extension = os.path.splitext(name)[1]
    
    # Convert camelCase/PascalCase to kebab-case
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', base_name)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1-\2', s1)
    
    # Convert to lowercase and handle multiple hyphens
    kebab = re.sub('[-\s]+', '-', s2.lower()).strip('-')
    
    return kebab + extension.lower()

def get_file_mapping(directory):
    """Creates a mapping of old file paths to new file paths"""
    file_mapping = {}
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.js', '.tsx', '.jsx')):
                old_path = os.path.join(root, file)
                new_name = to_kebab_case(file)
                new_path = os.path.join(root, new_name)
                # Store relative paths for import matching
                rel_old_path = os.path.relpath(old_path, directory)
                rel_new_path = os.path.relpath(new_path, directory)
                file_mapping[rel_old_path] = rel_new_path
    return file_mapping

def update_imports(file_path, file_mapping, base_dir):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update imports
    for old_path, new_path in file_mapping.items():
        # Remove extension for comparison
        old_base = os.path.splitext(old_path)[0]
        new_base = os.path.splitext(new_path)[0]
        
        # Handle different import patterns
        patterns = [
            # import { X } from './path/File'
            rf'from [\'"](.*/)?{old_base}[\'"]',
            # import { X } from './path/File.ts'
            rf'from [\'"](.*/)?{old_path}[\'"]',
            # require('./path/File')
            rf'require\([\'"](.*/)?{old_base}[\'"]\)',
            # require('./path/File.ts')
            rf'require\([\'"](.*/)?{old_path}[\'"]\)'
        ]
        
        for pattern in patterns:
            content = re.sub(
                pattern,
                lambda m: m.group(0).replace(old_base, new_base),
                content
            )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def rename_files_and_update_imports(directory):
    # First, create a mapping of all files that will be renamed
    file_mapping = get_file_mapping(directory)
    
    # Update imports in all files first
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.js', '.tsx', '.jsx')):
                file_path = os.path.join(root, file)
                try:
                    update_imports(file_path, file_mapping, directory)
                    print(f'Updated imports in: {file}')
                except Exception as e:
                    print(f'Error updating imports in {file}: {e}')

    # Then rename the files
    for old_rel_path, new_rel_path in file_mapping.items():
        old_path = os.path.join(directory, old_rel_path)
        new_path = os.path.join(directory, new_rel_path)
        try:
            os.rename(old_path, new_path)
            print(f'Renamed: {old_rel_path} -> {new_rel_path}')
        except OSError as e:
            print(f'Error renaming {old_rel_path}: {e}')

# Usage
directory = '.'  # Current directory, change this to your target directory
rename_files_and_update_imports(directory)