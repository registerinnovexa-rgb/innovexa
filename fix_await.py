import re

with open('api/backend.js', 'r') as f:
    content = f.read()

# Restore await transporter.sendMail
content = content.replace("transporter.sendMail(", "await transporter.sendMail(")
# Except if it's already there
content = content.replace("await await transporter.sendMail(", "await transporter.sendMail(")

# Restore await notifyAdmin
content = content.replace("notifyAdmin(", "await notifyAdmin(")
# Except if it's already there or in function definition
content = content.replace("await await notifyAdmin(", "await notifyAdmin(")
content = content.replace("async function await notifyAdmin(", "async function notifyAdmin(")

with open('api/backend.js', 'w') as f:
    f.write(content)
