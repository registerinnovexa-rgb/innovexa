import json

with open("atlas.html") as f:
    html = f.read()

start = html.find("const resources = [")
end = html.find("];", start) + 2
js_code = html[start:end]

# Evaluate the JS to python list
import ast
import re

# We can't simply ast.literal_eval because it's JS (no quotes on keys, etc).
# Let's just regex search for single quotes inside double quotes!
print("Finding single quotes in double quoted strings...")
for line in js_code.split('\n'):
    if "'title':" in line or '"title":' in line:
        # check if the value contains a single quote
        val = line.split(':', 1)[1]
        if "'" in val:
            print("FOUND SINGLE QUOTE in value:", val)

