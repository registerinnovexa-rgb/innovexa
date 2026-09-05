with open('admin.html', 'r') as f:
    html = f.read()

# 1. Update the HTML inside enableDossierEdit
old_html = """      <div class="form-group" style="margin-bottom:0;"><label>Forge Role</label><input id="dedit_forgeRole" value="${escHtml(prof.forgeRole||'')}"></div>
    </div>"""

new_html = """      <div class="form-group" style="margin-bottom:0;"><label>Forge Role</label><input id="dedit_forgeRole" value="${escHtml(prof.forgeRole||'')}"></div>
      <div class="form-group" style="margin-bottom:0;">
        <label>New Photo</label>
        <input type="file" id="dedit_photo" accept="image/*" style="width:100%;padding:6px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:12px;border-radius:6px;">
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label>New Signature</label>
        <input type="file" id="dedit_sign" accept="image/*" style="width:100%;padding:6px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:12px;border-radius:6px;">
      </div>
    </div>"""

html = html.replace(old_html, new_html)

# 2. Update saveDossierEdit
old_save = """    const res = await apiPost('admin_edit_member', {
      operativeId: _dossierOpId,
      name: document.getElementById('dedit_name').value,
      email: document.getElementById('dedit_email').value,
      phone: document.getElementById('dedit_phone').value,
      college: document.getElementById('dedit_college').value,
      branch: document.getElementById('dedit_branch').value,
      year: document.getElementById('dedit_year').value,
      xp: document.getElementById('dedit_xp').value,
      rank: document.getElementById('dedit_rank').value,
      status: document.getElementById('dedit_status').value,
      squad: document.getElementById('dedit_squad').value,
      forgeRole: document.getElementById('dedit_forgeRole').value,
    });"""

new_save = """    const payload = {
      operativeId: _dossierOpId,
      name: document.getElementById('dedit_name').value,
      email: document.getElementById('dedit_email').value,
      phone: document.getElementById('dedit_phone').value,
      college: document.getElementById('dedit_college').value,
      branch: document.getElementById('dedit_branch').value,
      year: document.getElementById('dedit_year').value,
      xp: document.getElementById('dedit_xp').value,
      rank: document.getElementById('dedit_rank').value,
      status: document.getElementById('dedit_status').value,
      squad: document.getElementById('dedit_squad').value,
      forgeRole: document.getElementById('dedit_forgeRole').value,
    };
    
    const photoFile = document.getElementById('dedit_photo').files[0];
    const signFile = document.getElementById('dedit_sign').files[0];
    if (photoFile) payload.photoUrl = await fileToBase64(photoFile);
    if (signFile) payload.signature = await fileToBase64(signFile);

    const res = await apiPost('admin_edit_member', payload);"""

html = html.replace(old_save, new_save)

with open('admin.html', 'w') as f:
    f.write(html)
