with open("atlas.html", "r") as f:
    content = f.read()

# Remove resources-grid from the fade-up observer by explicitly making it always visible
# after renderResources is called
old_render_call = "  renderResources(resources);"
new_render_call = """  renderResources(resources);
  // Ensure the grid is always visible regardless of IntersectionObserver timing
  if (grid) {
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }"""

if old_render_call in content and new_render_call not in content:
    content = content.replace(old_render_call, new_render_call, 1)
    with open("atlas.html", "w") as f:
        f.write(content)
    print("Patched renderResources call to force grid visible.")
else:
    print("Already patched or target not found.")
