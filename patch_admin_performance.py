import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# Fix innerHTML += in renderForgeAccess
content = re.sub(
    r'tbody\.innerHTML \+= `([\s\S]*?)`;',
    r'html += `\1`;',
    content
)
content = content.replace(
    'approvedMembers.forEach(m => {',
    'let html = "";\n  approvedMembers.forEach(m => {'
)
content = content.replace(
    '          </tr>\n      `;\n  });',
    '          </tr>\n      `;\n  });\n  tbody.innerHTML = html;'
)

# Apply similar fix for other potential innerHTML += loops in admin.html if they exist.
# Let's check if there are others.
content = content.replace('let html = "";\n  let html = "";', 'let html = "";') # deduplicate if applied twice

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)
print("Performance patched!")
