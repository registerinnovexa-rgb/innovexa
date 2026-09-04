import re

with open('api/backend.js', 'r') as f:
    code = f.read()

code = code.replace(
    'utr: utr,\n          status: \'Pending\',',
    'utr: utr,\n          photoUrl: photo,\n          signature: signature,\n          status: \'Pending\','
)

with open('api/backend.js', 'w') as f:
    f.write(code)
