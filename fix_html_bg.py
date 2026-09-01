import glob

for file in glob.glob('*.html'):
    with open(file, 'r') as f:
        content = f.read()

    # Make page-level section backgrounds transparent so gradient shows
    content = content.replace('background: #faf9f6;', 'background: transparent;')
    content = content.replace('background: #f4f3ef;', 'background: transparent;')
    content = content.replace('background: #edeae4;', 'background: transparent;')

    with open(file, 'w') as f:
        f.write(content)

print("Fixed HTML inline backgrounds")
