with open('css/design.css', 'r') as f:
    content = f.read()

# Replace body background
old_bg = "body {\n  background: var(--bg);"
new_bg = "body {\n  background: url('../assets/bg-gradient.jpg') center/cover fixed no-repeat;\n  /* background: var(--bg); */"

content = content.replace(old_bg, new_bg)

with open('css/design.css', 'w') as f:
    f.write(content)

print("Updated design.css")
