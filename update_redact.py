import re

with open('index.html', 'r') as f:
    content = f.read()

old_css = """.redact-text {
  background: #000;
  color: transparent;
  padding: 0 4px;
  border-radius: 2px;
  cursor: crosshair;
  transition: all 0.3s ease;
  user-select: none;
}
.redact-text:hover {
  background: rgba(0,0,0,0.05);
  color: #000;
  box-shadow: inset 0 -2px 0 #000;
}"""

new_css = """.redact-text {
  color: transparent;
  text-shadow: 0 0 8px rgba(0,0,0,0.6); /* Blurred text effect */
  background: transparent;
  cursor: crosshair;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}
.redact-text:hover {
  color: #000;
  text-shadow: 0 0 0 rgba(0,0,0,1);
}"""

content = content.replace(old_css, new_css)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
