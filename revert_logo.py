import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # Revert image tags to use the full logo
    content = content.replace('src="assets/icon.png"', 'src="assets/logo.png"')
    # Keep favicon pointing to icon.png (which is correct)
    
    with open(file, 'w') as f:
        f.write(content)

print("Reverted images to use the full logo.")
