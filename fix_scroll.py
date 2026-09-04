import re

with open('register.html', 'r') as f:
    html = f.read()

# Fix the scroll: scroll to the top of the page, not the form-wrapper
old_scroll = "window.scrollTo({ top: document.querySelector('.form-wrapper').offsetTop - 100, behavior: 'smooth' });"
new_scroll = "document.getElementById('success-screen').scrollIntoView({ behavior: 'smooth', block: 'start' });"

html = html.replace(old_scroll, new_scroll)

with open('register.html', 'w') as f:
    f.write(html)
