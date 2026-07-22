import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# Fix renderMembers
content = re.sub(
    r'tbody\.innerHTML \+= `([\s\S]*?)`;',
    r'html += `\1`;',
    content
)
content = content.replace(
    'data.forEach(m => {',
    'let html = "";\n  data.forEach(m => {'
)
content = content.replace(
    '        </tr>\n    `;\n  });',
    '        </tr>\n    `;\n  });\n  tbody.innerHTML = html;'
)
# Make sure we don't duplicate `let html` if already patched
content = content.replace('let html = "";\n  let html = "";', 'let html = "";')

# Fix loadForgeTasks (actually renderForgeTasks or similar)
content = content.replace(
    'tasks.forEach(t => {',
    'let tasksHtml = "";\n    tasks.forEach(t => {'
)
content = re.sub(
    r'tbody\.innerHTML \+= `([\s\S]*?)`;',
    r'tasksHtml += `\1`;',
    content
)
content = content.replace(
    '        </tr>\n      `;\n    });',
    '        </tr>\n      `;\n    });\n    tbody.innerHTML = tasksHtml;'
)

# Same for ForgeReviews
content = content.replace(
    'pendingTasks.forEach(t => {',
    'let reviewsHtml = "";\n    pendingTasks.forEach(t => {'
)
content = re.sub(
    r'container\.innerHTML \+= `([\s\S]*?)`;',
    r'reviewsHtml += `\1`;',
    content
)
content = content.replace(
    '        </div>\n      `;\n    });',
    '        </div>\n      `;\n    });\n    container.innerHTML = reviewsHtml;'
)

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)
print("Loops patched!")
