import re

with open('register.html', 'r') as f:
    html = f.read()

# Fix Modal Container Background
html = html.replace(
    'background:var(--bg-1); border:1px solid var(--border); border-radius:16px; width:90%; max-width:700px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,0.3); transform: translateY(0); animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);',
    'background:#ffffff; border:1px solid var(--border); border-radius:16px; width:90%; max-width:700px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,0.3); transform: translateY(0); animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);'
)

# Fix Modal Header Background
html = html.replace(
    'padding:24px 32px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:var(--bg-2); border-radius:16px 16px 0 0;',
    'padding:24px 32px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border-radius:16px 16px 0 0;'
)

# Fix Modal Body Background
html = html.replace(
    'padding:32px; overflow-y:auto; color:var(--text-2); font-size:14.5px; line-height:1.7; background:var(--bg-1);',
    'padding:32px; overflow-y:auto; color:var(--text-2); font-size:14.5px; line-height:1.7; background:#ffffff;'
)

# Fix Modal Footer Background
html = html.replace(
    'padding:20px 32px; border-top:1px solid var(--border); background:var(--bg-2); border-radius:0 0 16px 16px; display:flex; justify-content:space-between; align-items:center;',
    'padding:20px 32px; border-top:1px solid var(--border); background:#f8fafc; border-radius:0 0 16px 16px; display:flex; justify-content:space-between; align-items:center;'
)

with open('register.html', 'w') as f:
    f.write(html)
