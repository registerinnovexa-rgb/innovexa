import re

with open('admin.html', 'r') as f:
    css = f.read()

# Replace :root variables
css = re.sub(
    r":root \{.*?(?=\})\}",
    """:root {
      --bg: #030712; 
      --bg2: rgba(15, 23, 42, 0.5); 
      --bg3: rgba(30, 41, 59, 0.7);
      --border: rgba(6, 182, 212, 0.3); 
      --border2: rgba(6, 182, 212, 0.1);
      --text: #f8fafc; 
      --text2: #94a3b8; 
      --text3: #64748b;
      --accent: #22d3ee; 
      --accent2: #06b6d4;
      --green: #10b981; --green-bg: rgba(16, 185, 129, 0.15);
      --red: #ef4444; --red-bg: rgba(239, 68, 68, 0.15);
      --yellow: #f59e0b; --yellow-bg: rgba(245, 158, 11, 0.15);
      --blue: #3b82f6; --blue-bg: rgba(59, 130, 246, 0.15);
      --radius: 12px; --radius-sm: 6px;
      --font-d: 'Inter', sans-serif;
      --font-b: 'Inter', sans-serif;
      --shadow-sm: 0 0 10px rgba(6, 182, 212, 0.1);
      --shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.15);
      --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.25);
    }""",
    css,
    flags=re.DOTALL
)

# Fix body and table backgrounds
css = re.sub(r"background: var\(--bg\);", "background: #020617; background-image: radial-gradient(circle at 50% 0%, #0f172a 0%, #020617 70%);", css, 1)

# Add glassmorphism to cards and topbar
css = re.sub(
    r"\.login-card \{\s*background: var\(--bg2\);",
    ".login-card { background: var(--bg2); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--border); box-shadow: var(--shadow-lg);",
    css
)
css = re.sub(
    r"\.topbar \{\s*position:fixed; top:0; left:0; right:0; height:64px; background: rgba\(255, 255, 255, 0\.8\);",
    ".topbar { position:fixed; top:0; left:0; right:0; height:64px; background: rgba(3, 7, 18, 0.7);",
    css
)

css = re.sub(r"color:#0f172a;", "color:#e0f2fe;", css)
css = re.sub(r"color: #000;", "color: var(--accent);", css)

# Sidebar active state to glow
css = re.sub(
    r"\.sidebar-btn\.active \{\s*background: #ffffff; color:var\(--accent\); font-weight:600; box-shadow: var\(--shadow-sm\); border:1px solid var\(--border\); \}",
    ".sidebar-btn.active { background: rgba(6, 182, 212, 0.1); color:var(--accent); font-weight:600; box-shadow: inset 0 0 12px rgba(6, 182, 212, 0.2); border:1px solid var(--accent); border-right: 4px solid var(--accent); }",
    css
)
# Button colors
css = re.sub(r"background: #000000; color: #ffffff;", "background: rgba(6, 182, 212, 0.2); color: var(--accent); border: 1px solid var(--accent); box-shadow: 0 0 10px rgba(6,182,212,0.3);", css)

# Search box dark
css = re.sub(r"\.search-box \{\s*padding:10px 16px; background:var\(--bg2\);", ".search-box { padding:10px 16px; background:rgba(0,0,0,0.4);", css)

# Tables dark
css = re.sub(
    r"\.table-container \{\s*background:var\(--bg2\);",
    ".table-container { background:var(--bg2); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--border);",
    css
)
css = re.sub(r"background:#f1f5f9;", "background:rgba(30, 41, 59, 0.8);", css)
css = re.sub(r"border-bottom:1px solid #e2e8f0;", "border-bottom:1px solid var(--border2);", css)
css = re.sub(r"background:#f8fafc;", "background:rgba(15, 23, 42, 0.4);", css)

# Modal dark
css = re.sub(
    r"\.modal-content \{\s*background:var\(--bg2\);",
    ".modal-content { background:#0f172a; border: 1px solid var(--accent); box-shadow: var(--shadow-lg);",
    css
)

with open('admin.html', 'w') as f:
    f.write(css)

