import os
import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # Remove the span text
    content = re.sub(r'<span[^>]*>Innovexa<span[^>]*>Hub</span></span>', '', content)
    content = re.sub(r'Innovexa<span[^>]*>Hub</span>', '', content)

    # Only replace image dimensions for the logos!
    # Let's target the exact string: style="width:28px; height:28px; object-fit:contain;"
    # and style="width:32px; height:32px; object-fit:contain;"
    
    content = content.replace('style="width:28px; height:28px; object-fit:contain;"', 'style="height:32px; width:auto; object-fit:contain;"')
    content = content.replace('style="width:32px; height:32px; object-fit:contain;"', 'style="height:32px; width:auto; object-fit:contain;"')

    with open(file, 'w') as f:
        f.write(content)

print("Fixed logo perfectly")
