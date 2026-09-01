import re

with open('atlas.html', 'r') as f:
    html = f.read()

# I want to remove the old search logic entirely since my new terminal librarian handles it.
old_search_logic = """  // Search — preserves active category
  document.getElementById('search-input').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    let filtered = activeCategory === 'all' ? resources : resources.filter(r => r.cat === activeCategory);
    if (q) filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q)
    );
    renderResources(filtered);
  });"""

html = html.replace(old_search_logic, "")

with open('atlas.html', 'w') as f:
    f.write(html)

print("Fixed")
