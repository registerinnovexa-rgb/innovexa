with open("atlas.html") as f:
    html = f.read()
start = html.find("const resources = [")
end = html.find("];", start) + 2
js_code = html[start:end]

objs = js_code.count('{')
titles = js_code.count('title:') + js_code.count('"title":')
descs = js_code.count('desc:') + js_code.count('"desc":')
cats = js_code.count('cat:') + js_code.count('"cat":')
links = js_code.count('link:') + js_code.count('"link":')

print(f"Objects: {objs}, Titles: {titles}, Descs: {descs}, Cats: {cats}, Links: {links}")
