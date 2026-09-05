with open("atlas.html") as f:
    html = f.read()
start = html.find("const resources = [")
end = html.find("];", start)
print(html[end-100:end+2])
