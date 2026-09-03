import re

with open('admin.html', 'r') as f:
    css = f.read()

# Replace :root variables with Light SaaS theme
css = re.sub(
    r":root \{.*?(?=\})\}",
    """:root {
      --bg: #f8fafc; 
      --bg2: #ffffff; 
      --bg3: #f1f5f9;
      --border: #e2e8f0; 
      --border2: #cbd5e1;
      --text: #0f172a; 
      --text2: #334155; 
      --text3: #64748b;
      --accent: #2563eb; 
      --accent2: #1d4ed8;
      --green: #059669; --green-bg: #dcfce7;
      --red: #dc2626; --red-bg: #fee2e2;
      --yellow: #d97706; --yellow-bg: #fef9c3;
      --blue: #2563eb; --blue-bg: #dbeafe;
      --radius: 12px; --radius-sm: 8px;
      --font-d: 'Inter', sans-serif;
      --font-b: 'Inter', sans-serif;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
    }""",
    css,
    flags=re.DOTALL
)

# Revert body background
css = re.sub(
    r"background: #020617; background-image: radial-gradient\(circle at 50% 0%, #0f172a 0%, #020617 70%\);",
    "background: var(--bg);",
    css
)

# Revert glassmorphism
css = re.sub(
    r"\.login-card \{ background: var\(--bg2\); backdrop-filter: blur\(16px\); -webkit-backdrop-filter: blur\(16px\); border: 1px solid var\(--border\); box-shadow: var\(--shadow-lg\);",
    ".login-card { background: var(--bg2); border: 1px solid var(--border); box-shadow: var(--shadow-lg);",
    css
)
css = re.sub(
    r"\.topbar \{ position:fixed; top:0; left:0; right:0; height:64px; background: rgba\(3, 7, 18, 0\.7\);",
    ".topbar { position:fixed; top:0; left:0; right:0; height:64px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid var(--border);",
    css
)

# Fix colors
css = re.sub(r"color:#e0f2fe;", "color:#0f172a;", css)
css = re.sub(r"color: var\(--accent\);", "color: #000;", css)

# Fix Sidebar active state
css = re.sub(
    r"\.sidebar-btn\.active \{ background: rgba\(6, 182, 212, 0\.1\); color:var\(--accent\); font-weight:600; box-shadow: inset 0 0 12px rgba\(6, 182, 212, 0\.2\); border:1px solid var\(--accent\); border-right: 4px solid var\(--accent\); \}",
    ".sidebar-btn.active { background: #ffffff; color:var(--accent); font-weight:600; box-shadow: var(--shadow-sm); border: 1px solid var(--border); border-right: none; }",
    css
)
# Revert primary buttons
css = re.sub(
    r"background: rgba\(6, 182, 212, 0\.2\); color: var\(--accent\); border: 1px solid var\(--accent\); box-shadow: 0 0 10px rgba\(6,182,212,0\.3\);",
    "background: #000000; color: #ffffff; border: none; box-shadow: var(--shadow);",
    css
)

# Revert Search box
css = re.sub(
    r"\.search-box \{ padding:10px 16px; background:rgba\(0,0,0,0\.4\);",
    ".search-box { padding:10px 16px; background:var(--bg2);",
    css
)

# Revert Tables & Modal
css = re.sub(
    r"\.table-container \{ background:var\(--bg2\); backdrop-filter: blur\(12px\); -webkit-backdrop-filter: blur\(12px\); border: 1px solid var\(--border\);",
    ".table-container { background:var(--bg2); border: 1px solid var(--border); box-shadow: var(--shadow-sm); border-radius: var(--radius); overflow: hidden;",
    css
)
css = re.sub(r"background:rgba\(30, 41, 59, 0\.8\);", "background:#f8fafc;", css) # Table header
css = re.sub(r"background:rgba\(15, 23, 42, 0\.4\);", "background:#ffffff;", css) # Table hover/stripe
css = re.sub(
    r"\.modal-content \{ background:#0f172a; border: 1px solid var\(--accent\); box-shadow: var\(--shadow-lg\);",
    ".modal-content { background:var(--bg2); border: 1px solid var(--border); box-shadow: var(--shadow-lg);",
    css
)

with open('admin.html', 'w') as f:
    f.write(css)
