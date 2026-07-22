import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# Extract script blocks
scripts = re.findall(r'<script.*?>([\s\S]*?)</script>', content)
with open('temp.js', 'w') as f:
    for s in scripts:
        f.write(s + '\n')
