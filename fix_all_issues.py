import re

# ───────────────────────────────────────────────────
# 1. Fix register.html footer .html links
# ───────────────────────────────────────────────────
with open('register.html', 'r') as f:
    html = f.read()
html = html.replace("href='pathfinder.html'", "href='pathfinder'")
html = html.replace("href='forge.html'", "href='forge'")
with open('register.html', 'w') as f:
    f.write(html)
print("✅ Fixed register.html footer links")

# ───────────────────────────────────────────────────
# 2. Fix feedback.html: index.html → /
# ───────────────────────────────────────────────────
with open('feedback.html', 'r') as f:
    html = f.read()
html = html.replace("window.location.href='index.html'", "window.location.href='/'")
with open('feedback.html', 'w') as f:
    f.write(html)
print("✅ Fixed feedback.html button link")

# ───────────────────────────────────────────────────
# 3. Fix forge.html: feedback.html → feedback
# ───────────────────────────────────────────────────
with open('forge.html', 'r') as f:
    html = f.read()
html = html.replace('href="feedback.html?session=', 'href="feedback?session=')
with open('forge.html', 'w') as f:
    f.write(html)
print("✅ Fixed forge.html feedback link")

# ───────────────────────────────────────────────────
# 4. Fix status.html: forge.html → forge
# ───────────────────────────────────────────────────
with open('status.html', 'r') as f:
    html = f.read()
html = html.replace('href="forge.html?id=', 'href="forge?id=')
with open('status.html', 'w') as f:
    f.write(html)
print("✅ Fixed status.html forge link")

# ───────────────────────────────────────────────────
# 5. Fix admin.html: empty src="" on images (causes broken img scan)
#    Add display:none already set, but also add onerror safety
# ───────────────────────────────────────────────────
with open('admin.html', 'r') as f:
    html = f.read()
# The two placeholder img tags for photo and signature already have display:none
# but the scanner picks them up. Add onerror handler to prevent browser errors.
html = html.replace(
    '<img id="detailPhoto" src="" style="width:100%; height:100%; object-fit:cover; display:none;" />',
    '<img id="detailPhoto" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width:100%; height:100%; object-fit:cover; display:none;" />'
)
html = html.replace(
    '<img id="detailSignature" src="" style="max-width:100%; max-height:100%; display:none;" />',
    '<img id="detailSignature" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="max-width:100%; max-height:100%; display:none;" />'
)
with open('admin.html', 'w') as f:
    f.write(html)
print("✅ Fixed admin.html empty src attributes")

# ───────────────────────────────────────────────────
# 6. Fix index.html gallery: hide section if no images exist
#    Add onerror to hide broken images gracefully
# ───────────────────────────────────────────────────
with open('index.html', 'r') as f:
    html = f.read()

# Make gallery images gracefully hide if 404
old_img_html = "const imgHTML = images.map(num => `<img class=\"marquee-item\" loading=\"lazy\" src=\"assets/gallery/${num}.jpg\">`).join('');"
new_img_html = "const imgHTML = images.map(num => `<img class=\"marquee-item\" loading=\"lazy\" src=\"assets/gallery/${num}.jpg\" onerror=\"this.style.display='none'\">`).join('');"
html = html.replace(old_img_html, new_img_html)

with open('index.html', 'w') as f:
    f.write(html)
print("✅ Fixed index.html gallery broken image handling")

print("\nAll fixes applied!")
