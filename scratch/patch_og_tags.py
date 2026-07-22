import os
import re

files = ['register.html', 'status.html', 'atlas.html', 'forge.html']
base_dir = '/Users/jaiakash/Documents/Inno-porta'

og_image_tag = '  <meta property="og:image" content="https://innovexa-portal-hgbqn4t2i-innovexahubbangalore-8824s-projects.vercel.app/assets/logo.png" />\n'

for filename in files:
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
            
        if 'og:image' not in content:
            # Usually we insert it before </head> or after og:type or <title>
            if '<meta property="og:type"' in content:
                content = content.replace('<meta property="og:type" content="website" />', '<meta property="og:type" content="website" />\n' + og_image_tag)
            elif '<title>' in content:
                content = content.replace('</title>', '</title>\n' + og_image_tag)
            
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Patched {filename}")
