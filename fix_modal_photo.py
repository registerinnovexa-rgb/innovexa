with open('admin.html', 'r') as f:
    html = f.read()

biometrics_html = """
      <!-- Biometrics -->
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3);margin-bottom:12px;margin-top:8px;">🆔 Biometrics & Signature</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;align-items:center;">
          ${sLabel('Member Photo')}
          ${(m.photoUrl || m.photo) ? `<img src="${m.photoUrl || m.photo}" style="width:120px;height:120px;border-radius:12px;object-fit:cover;border:1px solid var(--border);margin-top:8px;">` : `<div style="width:120px;height:120px;border-radius:12px;background:var(--bg3);border:1px dashed var(--border);display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:32px;margin-top:8px;">👤</div>`}
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;align-items:center;justify-content:center;">
          ${sLabel('Digital Signature')}
          ${m.signature ? `<img src="${m.signature}" style="max-width:100%;max-height:100px;margin-top:8px;background:#fff;border-radius:8px;padding:4px;">` : `<div style="color:var(--text3);font-size:12px;margin-top:12px;">No signature provided.</div>`}
        </div>
      </div>
"""

old_target = "      <!-- Forge Profile (editable) -->"
new_target = biometrics_html + "\n" + old_target

html = html.replace(old_target, new_target)

with open('admin.html', 'w') as f:
    f.write(html)
