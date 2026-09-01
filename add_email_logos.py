import re

with open('api/proxy.js', 'r') as f:
    content = f.read()

pattern = r'(<body [^>]*>)\s*(<div [^>]*>)'

def replacer(match):
    body = match.group(1)
    container = match.group(2)
    container = container.replace('margin:32px auto;', 'margin:0 auto 32px;')
    
    logo_html = """
          <div style="text-align:center; padding:32px 0 16px;">
            <img src="https://innovexareg.vercel.app/assets/logo.png" alt="Innovexa Hub" style="height:56px; width:auto;">
          </div>
"""
    return f"{body}\n{logo_html}          {container}"

new_content = re.sub(pattern, replacer, content)

with open('api/proxy.js', 'w') as f:
    f.write(new_content)

print("Done")
