import re

with open('admin.html', 'r') as f:
    html = f.read()

# Fix Members actions
html = html.replace(
    """<button class="btn-sm" style="color:var(--red);border:1px solid var(--red);background:transparent" onclick="revokeMember('${m.operativeId}')">↩ REVOKE</button>""",
    """<button onclick="revokeMember('${m.operativeId}')" style="padding:6px 12px; font-size:11px; font-weight:600; color:var(--red); background:var(--red-bg); border:none; border-radius:6px; cursor:pointer;">REVOKE</button>"""
)
html = html.replace(
    """<button class="btn-sm" style="color:var(--text);border:1px solid var(--border);background:var(--bg2)" onclick="viewMember('${m.operativeId}')">👤 VIEW</button>""",
    """<button onclick="viewMember('${m.operativeId}')" style="padding:6px 12px; font-size:11px; font-weight:600; color:var(--text2); background:var(--bg3); border:none; border-radius:6px; cursor:pointer;">VIEW</button>"""
)

# Wait, the code in the screenshot for members shows: ↩ REVOKE and 👤 VIEW.
# Let me just use regex to catch them regardless of exact formatting.
html = re.sub(
    r"<button class=\"btn-sm\"[^>]*onclick=\"revokeMember\('([^']+)'\)\"[^>]*>.*?REVOKE.*?</button>",
    r"<button onclick=\"revokeMember('\1')\" style=\"padding:6px 12px; font-size:11px; font-weight:600; color:var(--red); background:var(--red-bg); border:none; border-radius:6px; cursor:pointer;\">REVOKE</button>",
    html
)
html = re.sub(
    r"<button class=\"btn-sm\"[^>]*onclick=\"viewMember\('([^']+)'\)\"[^>]*>.*?VIEW.*?</button>",
    r"<button onclick=\"viewMember('\1')\" style=\"padding:6px 12px; font-size:11px; font-weight:600; color:var(--text2); background:var(--bg3); border:none; border-radius:6px; cursor:pointer;\">VIEW</button>",
    html
)

# Forge Ops actions
html = re.sub(
    r"<button class=\"btn-sm\" style=\"background:var\(--red\);color:#fff;\" onclick=\"toggleForgeAccess\('([^']+)'\)\">REVOKE</button>",
    r"<button onclick=\"toggleForgeAccess('\1')\" style=\"padding:6px 12px; font-size:11px; font-weight:600; color:var(--red); background:var(--red-bg); border:none; border-radius:6px; cursor:pointer;\">REVOKE</button>",
    html
)
html = re.sub(
    r"<button class=\"btn-sm\" style=\"background:var\(--green\);color:#fff;\" onclick=\"toggleForgeAccess\('([^']+)'\)\">GRANT ACCESS</button>",
    r"<button onclick=\"toggleForgeAccess('\1')\" style=\"padding:6px 12px; font-size:11px; font-weight:600; color:var(--green); background:var(--green-bg); border:none; border-radius:6px; cursor:pointer;\">GRANT</button>",
    html
)

# Forge Ops status badges (making them cleaner)
html = re.sub(
    r"<span class=\"badge-confirmed\">✅ GRANTED</span>",
    r"<span style=\"display:inline-flex; align-items:center; gap:4px; padding:4px 8px; font-size:11px; font-weight:600; color:var(--green); background:var(--green-bg); border-radius:6px;\"><span style=\"width:6px;height:6px;border-radius:50%;background:var(--green);\"></span> GRANTED</span>",
    html
)
html = re.sub(
    r"<span class=\"badge-rejected\">🔒 REVOKED/NONE</span>",
    r"<span style=\"display:inline-flex; align-items:center; gap:4px; padding:4px 8px; font-size:11px; font-weight:600; color:var(--text3); background:var(--bg3); border-radius:6px;\"><span style=\"width:6px;height:6px;border-radius:50%;background:var(--text3);\"></span> NO ACCESS</span>",
    html
)


# Add row striping properly to the CSS
html = html.replace('</style>', """
    .data-table tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s ease; }
    .data-table tbody tr:hover { background: var(--bg3) !important; }
    .data-table tbody tr:nth-child(even) { background: #fafafa; }
    .table-container { border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-sm); overflow: hidden; background: #fff; }
</style>""")

with open('admin.html', 'w') as f:
    f.write(html)
