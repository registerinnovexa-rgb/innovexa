import os
import glob
import re

html_files = glob.glob('*.html') + glob.glob('public/*.html')

for filepath in html_files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove the nav-logo-text
    content = re.sub(r'<div class="nav-logo-text">.*?</div>', '', content, flags=re.IGNORECASE)
    
    # Fix the login-logo inline styles
    content = re.sub(r'<img src="assets/logo.png" class="login-logo" style="filter:invert\(1\); background:#111; padding:10px;" alt="Logo" />', '<img src="assets/logo.png" class="login-logo" alt="Logo" />', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

print("HTML files updated.")
