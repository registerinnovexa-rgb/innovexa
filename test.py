with open('/Users/jaiakash/Documents/Inno-porta/index.html', 'r') as f:
    content = f.read()

start = content.find('id="mobile-menu"')
print(content[start-30:start+800])
