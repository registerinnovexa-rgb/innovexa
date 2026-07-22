import re
import os

files = ['register.html', 'status.html', 'atlas.html', 'forge.html']
base_dir = '/Users/jaiakash/Documents/Inno-porta'
main_css_path = os.path.join(base_dir, 'css', 'main.css')

all_css = []

for filename in files:
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
            
        style_match = re.search(r'  <style>\n(.*?)  </style>\n', content, re.DOTALL)
        if style_match:
            css_content = style_match.group(1)
            # Add a comment to mark source
            all_css.append(f"/* === Extracted from {filename} === */\n" + css_content)
            
            # Replace style block with link
            new_link = '  <link rel="stylesheet" href="css/main.css" />\n'
            content = content.replace(style_match.group(0), new_link)
            
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Patched {filename}")

# Write combined CSS to main.css
with open(main_css_path, 'w') as f:
    f.write("\n\n".join(all_css))
print(f"Created main.css with {len(all_css)} sections.")
