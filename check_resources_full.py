with open("atlas.html") as f:
    html = f.read()
start = html.find("const resources = [")
end = html.find("];", start) + 2
js_code = html[start:end]
with open("resources_temp.js", "w") as out:
    out.write(js_code)
