import re

design_path = 'css/design.css'
with open(design_path, 'r') as f:
    content = f.read()

content = re.sub(r'\.nav-logo img\s*\{[^}]*\}', '.nav-logo img {\n  width: auto; height: 32px; object-fit: contain;\n}', content)
content = re.sub(r'\.nav-logo-text\s*\{[^}]*\}', '.nav-logo-text {\n  display: none;\n}', content)
with open(design_path, 'w') as f:
    f.write(content)

main_path = 'css/main.css'
with open(main_path, 'r') as f:
    content = f.read()

content = re.sub(r'\.login-logo\s*\{[^}]*\}', '.login-logo {\n  width: auto; height: 64px; max-width: 100%; object-fit: contain; margin: 0 auto 24px; display: block;\n}', content)
with open(main_path, 'w') as f:
    f.write(content)

print("CSS updated")
