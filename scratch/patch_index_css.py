import re

with open('/Users/jaiakash/Documents/Inno-porta/index.html', 'r') as f:
    content = f.read()

# 1. Extract CSS
style_match = re.search(r'  <style>\n(.*?)  </style>\n', content, re.DOTALL)
if style_match:
    css_content = style_match.group(1)
    with open('/Users/jaiakash/Documents/Inno-porta/css/index.css', 'w') as f:
        f.write(css_content)
    
    # Replace <style> block with link
    content = content.replace(style_match.group(0), '  <link rel="stylesheet" href="css/index.css" />\n')

# 2. Add OG Image
if 'og:image' not in content:
    og_image_tag = '  <meta property="og:image" content="https://innovexa-portal-hgbqn4t2i-innovexahubbangalore-8824s-projects.vercel.app/assets/logo.png" />\n'
    content = content.replace('<meta property="og:type" content="website" />', '<meta property="og:type" content="website" />\n' + og_image_tag)

# 3. Add loading="lazy" to partner logos
content = content.replace('src="assets/yenepoya-logo.svg" alt="Yenepoya University"', 'src="assets/yenepoya-logo.svg" alt="Yenepoya University" loading="lazy"')
content = content.replace('src="assets/kalvium-logo.png" alt="Kalvium"', 'src="assets/kalvium-logo.png" alt="Kalvium" loading="lazy"')

with open('/Users/jaiakash/Documents/Inno-porta/index.html', 'w') as f:
    f.write(content)

print("index.html patched!")
