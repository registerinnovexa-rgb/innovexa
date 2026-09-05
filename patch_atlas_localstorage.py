with open("atlas.html", "r") as f:
    content = f.read()

old_code = "let arsenal = JSON.parse(localStorage.getItem('atlas_arsenal')) || [];"
new_code = """let arsenal = [];
  try {
    const raw = localStorage.getItem('atlas_arsenal');
    if (raw && raw !== "undefined") {
      arsenal = JSON.parse(raw);
    }
    if (!Array.isArray(arsenal)) arsenal = [];
  } catch(e) {
    console.error("Failed to parse atlas_arsenal from localStorage:", e);
    arsenal = [];
  }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open("atlas.html", "w") as f:
        f.write(content)
    print("Patched atlas.html")
else:
    print("Could not find the target code in atlas.html")
