import re

# Fix index.html
with open('index.html', 'r') as f:
    html = f.read()

html = html.replace(
    "const res = await gasGet('/api/backend?action=count');",
    "const res = await apiGet('count');"
)
html = html.replace(
    "const res = await gasGet('/api/backend?action=get_confirmed');",
    "const res = await apiGet('get_confirmed');"
)

with open('index.html', 'w') as f:
    f.write(html)

# Fix register.html
with open('register.html', 'r') as f:
    html = f.read()

html = html.replace(
    "const res = await gasGet('/api/backend?action=status_check&email=' + encodeURIComponent(email));",
    "const res = await apiGet('status_check', { email: email });"
)

with open('register.html', 'w') as f:
    f.write(html)
