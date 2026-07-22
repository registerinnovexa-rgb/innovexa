import glob
import re

html_files = glob.glob('*.html')

for f in html_files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Check if Forge is in the desktop nav by looking around status.html
    # Let's just do a direct replacement, but ensure we don't duplicate
    
    def replacer(match):
        original = match.group(1)
        # If Forge is already right after it, skip
        if '>Forge</a>' in content[match.end():match.end()+200]:
            return original
            
        if 'font-size:32px' in original or 'font-size: 32px' in original or 'closeMobileMenu' in original:
            # Mobile
            forge_link = '<a href="forge.html" class="nav-link" style="font-family:var(--font-d); font-size:32px; font-weight:500;" onclick="closeMobileMenu()">Forge</a>\n  '
        else:
            # Desktop
            forge_link = '<a href="forge.html" class="nav-link" style="font-size:14px; font-weight:500; color:var(--text-2);">Forge</a>\n      '
            
        m = re.search(r'class="([^"]+)"\s+style="([^"]+)"', original)
        if m:
            cls = m.group(1).replace(' active', '').replace('active ', '')
            style = m.group(2)
            if 'color:' not in style and 'closeMobileMenu' not in original:
                style += ' color:var(--text-2);'
            
            onclick = ' onclick="closeMobileMenu()"' if 'closeMobileMenu' in original else ''
            
            forge_link = f'<a href="forge.html" class="{cls}" style="{style}"{onclick}>Forge</a>'
            return original + forge_link + ('\n  ' if 'closeMobileMenu' in original else '\n      ')
        
        return original
        
    new_content = re.sub(r'(<a href="status\.html"[^>]*>Status</a>\s*)', replacer, content)
    
    if new_content != content:
        with open(f, 'w') as file:
            file.write(new_content)
        print(f"Updated {f}")
