import os
import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # Pattern for navbar text
    # <span style="letter-spacing:-0.02em;">Innovexa<span style="opacity:0.5;">Hub</span></span>
    # and footer text
    # Innovexa<span style="opacity:0.4;">Hub</span>
    # or similar
    
    # Let's use regex to remove anything containing "Innovexa<span"
    content = re.sub(r'<span[^>]*>Innovexa<span[^>]*>Hub</span></span>', '', content)
    content = re.sub(r'Innovexa<span[^>]*>Hub</span>', '', content)

    # Let's also adjust the img width/height if it's currently hardcoded to 28x28
    # Because if the logo now includes text, 28px width will be too small and squished!
    # Wait, the uploaded image is wide. If they are replacing the logo with a wide logo, 28px width will squish it.
    # So I will change width:28px; height:28px to something like height:28px; width:auto;
    
    content = re.sub(r'width:28px;\s*height:28px;', 'height:32px; width:auto;', content)
    content = re.sub(r'width:32px;\s*height:32px;', 'height:32px; width:auto;', content)
    content = re.sub(r'width: 28px;\s*height: 28px;', 'height: 32px; width: auto;', content)

    with open(file, 'w') as f:
        f.write(content)

print("Done removing text and updating dimensions")
