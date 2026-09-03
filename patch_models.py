import re

with open('api/models.js', 'r') as f:
    code = f.read()

# Add signature to MemberSchema
code = code.replace(
    'photoUrl: String,',
    'photoUrl: String,\n  signature: String,'
)

with open('api/models.js', 'w') as f:
    f.write(code)
