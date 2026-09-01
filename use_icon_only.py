import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # Replace the long logo with the cropped square icon
    content = content.replace('src="assets/innovexa-logo-new.png"', 'src="assets/icon.png"')
    content = content.replace('src="assets/logo.png"', 'src="assets/icon.png"')
    
    # Also update the favicon link we changed earlier to point to icon.png
    content = content.replace('href="assets/favicon.png"', 'href="assets/icon.png"')
    content = content.replace('href="assets/logo.png"', 'href="assets/icon.png"')

    with open(file, 'w') as f:
        f.write(content)

print("Updated all HTML files to use only the icon.")
