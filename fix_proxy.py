import os, glob

for file in glob.glob('*.html') + glob.glob('js/*.js'):
    with open(file, 'r') as f:
        content = f.read()
    
    content = content.replace('/api/proxy', '/api/backend')
    
    with open(file, 'w') as f:
        f.write(content)
