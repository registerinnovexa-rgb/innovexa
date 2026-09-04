import re

with open('vite.config.js', 'r') as f:
    code = f.read()

code = code.replace("community: resolve(__dirname, 'community.html'),\n", "")

with open('vite.config.js', 'w') as f:
    f.write(code)
