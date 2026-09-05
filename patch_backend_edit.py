with open('api/backend.js', 'r') as f:
    backend = f.read()

old_destruct = "const { operativeId, name, email, phone, college, branch, year, xp, rank, squad, forgeRole, status } = payload;"
new_destruct = "const { operativeId, name, email, phone, college, branch, year, xp, rank, squad, forgeRole, status, photoUrl, signature } = payload;"

old_assign = "if (status !== undefined) member.status = status.trim();"
new_assign = "if (status !== undefined) member.status = status.trim();\n      if (photoUrl !== undefined) member.photoUrl = photoUrl;\n      if (signature !== undefined) member.signature = signature;"

backend = backend.replace(old_destruct, new_destruct)
backend = backend.replace(old_assign, new_assign)

with open('api/backend.js', 'w') as f:
    f.write(backend)
