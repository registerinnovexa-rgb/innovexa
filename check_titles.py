import re
with open("atlas.html") as f:
    html = f.read()
start = html.find("const resources = [")
end = html.find("];", start) + 2
js_code = html[start:end]

# Every object in the array should have a title.
# Let's count objects and count titles.
objs = js_code.count('{')
titles = js_code.count('title:') + js_code.count('"title":')
print(f"Objects: {objs}, Titles: {titles}")
