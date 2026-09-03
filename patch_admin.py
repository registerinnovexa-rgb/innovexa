import re

with open('admin.html', 'r') as f:
    html = f.read()

profile_html = """
          <!-- Profile Info (Injected) -->
          <div style="display:flex; gap:20px; margin-bottom:20px; align-items:flex-start; flex-wrap:wrap;">
            
            <!-- Photo & Signature Box -->
            <div style="background:var(--bg3); padding:16px; border-radius:12px; border:1px solid var(--border); width:200px; display:flex; flex-direction:column; align-items:center; gap:12px;">
              <div style="width:120px; height:120px; border-radius:12px; background:var(--bg1); border:1px solid var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center;">
                <img id="detailPhoto" src="" style="width:100%; height:100%; object-fit:cover; display:none;" />
                <span id="detailPhotoPlaceholder" style="font-size:32px; color:var(--text3);">👤</span>
              </div>
              <div style="width:100%; border-top:1px dashed var(--border); padding-top:12px; text-align:center;">
                <div style="font-size:10px; color:var(--text3); font-weight:700; letter-spacing:1px; margin-bottom:6px; text-transform:uppercase;">Digital Signature</div>
                <div style="background:#fff; border-radius:6px; padding:4px; height:60px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                  <img id="detailSignature" src="" style="max-width:100%; max-height:100%; display:none;" />
                  <span id="detailSigPlaceholder" style="font-size:12px; color:#aaa;">No Signature</span>
                </div>
              </div>
            </div>

            <!-- Profile Details Grid -->
            <div style="flex:1; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; background:var(--bg1); padding:20px; border-radius:12px; border:1px solid var(--border);">
              <div><div style="font-size:11px; color:var(--text3); text-transform:uppercase;">Email</div><div id="detailEmail" style="font-weight:600;">—</div></div>
              <div><div style="font-size:11px; color:var(--text3); text-transform:uppercase;">Phone</div><div id="detailPhone" style="font-weight:600;">—</div></div>
              <div><div style="font-size:11px; color:var(--text3); text-transform:uppercase;">College</div><div id="detailCollege" style="font-weight:600;">—</div></div>
              <div><div style="font-size:11px; color:var(--text3); text-transform:uppercase;">Branch</div><div id="detailBranch" style="font-weight:600;">—</div></div>
              <div><div style="font-size:11px; color:var(--text3); text-transform:uppercase;">Year</div><div id="detailYear" style="font-weight:600;">—</div></div>
              <div><div style="font-size:11px; color:var(--text3); text-transform:uppercase;">Operative ID</div><div id="detailOpId" style="font-weight:600; font-family:monospace; color:var(--accent);">—</div></div>
            </div>
          </div>
"""

# Insert the profile HTML right above the Summary Stats in the detailContent div
html = html.replace(
    '<!-- Summary Stats -->',
    profile_html + '\n          <!-- Summary Stats -->'
)

# Update the JS to actually populate the photo and signature
js_patch = """
      setEl('detailRole',    prof.forgeRole);
      setEl('detailOpId',    prof.operativeId);
      
      // Handle Photo & Signature
      const photoImg = document.getElementById('detailPhoto');
      const photoPlace = document.getElementById('detailPhotoPlaceholder');
      if (prof.photoUrl) {
        photoImg.src = prof.photoUrl;
        photoImg.style.display = 'block';
        photoPlace.style.display = 'none';
      } else {
        photoImg.style.display = 'none';
        photoPlace.style.display = 'block';
      }

      const sigImg = document.getElementById('detailSignature');
      const sigPlace = document.getElementById('detailSigPlaceholder');
      if (prof.signature) {
        sigImg.src = prof.signature;
        sigImg.style.display = 'block';
        sigPlace.style.display = 'none';
      } else {
        sigImg.style.display = 'none';
        sigPlace.style.display = 'block';
      }
"""

html = html.replace(
    "setEl('detailRole',    prof.forgeRole);\n      setEl('detailOpId',    prof.operativeId);",
    js_patch
)

with open('admin.html', 'w') as f:
    f.write(html)
