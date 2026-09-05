with open("atlas.html", "r") as f:
    content = f.read()

# Also make renderResources itself always force the grid visible after populating it
old_fn_end = """    grid.innerHTML = items.map((r, i) => {
      const isSaved = arsenal.some(saved => saved.title === r.title);
      return `
      <div class="resource-card">"""

new_fn_end = """    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
    grid.innerHTML = items.map((r, i) => {
      const isSaved = arsenal.some(saved => saved.title === r.title);
      return `
      <div class="resource-card">"""

if old_fn_end in content and new_fn_end not in content:
    content = content.replace(old_fn_end, new_fn_end, 1)
    with open("atlas.html", "w") as f:
        f.write(content)
    print("Patched renderResources function to force grid visible on every render.")
else:
    print("Already patched or target not found.")
