with open("atlas.html", "r") as f:
    content = f.read()

old_code = """    if (!Array.isArray(arsenal)) arsenal = [];
  } catch(e) {"""

new_code = """    if (!Array.isArray(arsenal)) arsenal = [];
    arsenal = arsenal.filter(item => item && typeof item === 'object' && item.title);
  } catch(e) {"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open("atlas.html", "w") as f:
        f.write(content)
    print("Patched atlas.html successfully.")
else:
    print("Could not find target code in atlas.html")
