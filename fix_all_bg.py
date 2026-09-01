import glob

# Remove body { background: ... } from other CSS files if they override
for file in glob.glob('css/*.css'):
    with open(file, 'r') as f:
        content = f.read()

    # In index.css, comment out the body background
    if 'index.css' in file:
        content = content.replace('background: #f4f3ef;', '/* background: #f4f3ef; (moved to global gradient) */')
    
    # In main.css (admin), check for body background
    if 'main.css' in file:
        content = content.replace('body { background: #f4f3ef; }', '/* body { background: #f4f3ef; } */')
    
    # In style.css (if any), check
    if 'style.css' in file:
        content = content.replace('background: var(--bg);', 'background: transparent; /* var(--bg); */')

    with open(file, 'w') as f:
        f.write(content)

print("Fixed CSS overrides")
