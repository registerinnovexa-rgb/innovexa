import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # Replace favicon links
    content = content.replace('href="assets/logo.png"', 'href="assets/favicon.png"')

    with open(file, 'w') as f:
        f.write(content)

print("Updated favicon links")
