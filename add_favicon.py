import os
import glob

html_files = glob.glob('*.html')
favicon_tag = '  <link rel="icon" type="image/png" href="assets/logo.png" />\n'

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Check if favicon already exists
    if '<link rel="icon"' not in content and '<link rel="shortcut icon"' not in content:
        # Insert before </head>
        content = content.replace('</head>', favicon_tag + '</head>')
        
        with open(file, 'w') as f:
            f.write(content)
        print(f"Added favicon to {file}")
    else:
        print(f"Favicon already exists in {file}")

print("Done")
