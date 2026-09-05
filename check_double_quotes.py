import re
with open("atlas.html") as f:
    html = f.read()
start = html.find("const resources = [")
end = html.find("];", start) + 2
js_code = html[start:end]

for line in js_code.split('\n'):
    if 'title:' in line or '"title":' in line:
        val = line.split(':', 1)[1]
        if '"' in val:
            print("FOUND DOUBLE QUOTE IN TITLE:", line.strip())
