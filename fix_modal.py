import re

with open('register.html', 'r') as f:
    html = f.read()

# Fix Modal Title Color
html = html.replace(
    '<h2 style="font-size:20px; font-weight:700; color:#fff; margin:0; letter-spacing:0.5px;">INNOVEXA HUB: TERMS OF SERVICE</h2>',
    '<h2 style="font-size:20px; font-weight:700; color:var(--text-1); margin:0; letter-spacing:0.5px;">INNOVEXA HUB: TERMS OF SERVICE</h2>'
)

# Fix Warning Box Color
html = html.replace(
    '<p style="margin-bottom:16px; color:#fff; font-weight:600; padding:12px; background:rgba(239, 68, 68, 0.1); border-left:3px solid #ef4444; border-radius:4px;">',
    '<p style="margin-bottom:16px; color:#b91c1c; font-weight:600; padding:12px; background:rgba(239, 68, 68, 0.1); border-left:3px solid #ef4444; border-radius:4px;">'
)

# Fix Close Button (make it match text-1)
html = html.replace(
    '<button onclick="document.getElementById(\'termsModal\').style.display=\'none\'" style="background:none; border:none; color:var(--text-3); font-size:24px; cursor:pointer;">&times;</button>',
    '<button onclick="document.getElementById(\'termsModal\').style.display=\'none\'" style="background:none; border:none; color:var(--text-1); font-size:28px; cursor:pointer; line-height:1;">&times;</button>'
)

# Fix modal container borders so it looks crisp
html = html.replace(
    'border:1px solid rgba(6, 182, 212, 0.3); border-radius:16px;',
    'border:1px solid var(--border); border-radius:16px;'
)
html = html.replace(
    'border-bottom:1px solid rgba(255,255,255,0.05);',
    'border-bottom:1px solid var(--border);'
)
html = html.replace(
    'border-top:1px solid rgba(255,255,255,0.05);',
    'border-top:1px solid var(--border);'
)

with open('register.html', 'w') as f:
    f.write(html)
