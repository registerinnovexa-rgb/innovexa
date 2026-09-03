import re

with open('api/backend.js', 'r') as f:
    code = f.read()

# Update register_member to destructure and save photo/signature
code = code.replace(
    'const { name, email, phone, year, branch, skillLevel, interests, dob, gender, utr } = payload;',
    'const { name, email, phone, year, branch, skillLevel, interests, dob, gender, utr, photo, signature } = payload;'
)

# Pass them into Member creation
code = code.replace(
    'const newMember = new Member({ name, email, phone, year, branch, skillLevel, interests, dob, gender, utr, operativeId: newId });',
    'const newMember = new Member({ name, email, phone, year, branch, skillLevel, interests, dob, gender, utr, photoUrl: photo, signature: signature, operativeId: newId });'
)

with open('api/backend.js', 'w') as f:
    f.write(code)
