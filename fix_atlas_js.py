import re

with open('atlas.html', 'r') as f:
    content = f.read()

# Remove arsenal initialization from its current spot
old_arsenal_decl = "  // --- ARSENAL LOGIC ---\n  let arsenal = JSON.parse(localStorage.getItem('atlas_arsenal')) || [];"
content = content.replace(old_arsenal_decl, "  // --- ARSENAL LOGIC ---")

# Put it right after grid = document.getElementById('resources-grid');
target = "  const grid = document.getElementById('resources-grid');"
new_target = "  const grid = document.getElementById('resources-grid');\n  let arsenal = JSON.parse(localStorage.getItem('atlas_arsenal')) || [];"

content = content.replace(target, new_target)

with open('atlas.html', 'w') as f:
    f.write(content)

print("Fixed JS ReferenceError")
