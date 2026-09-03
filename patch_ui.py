import re

with open('register.html', 'r') as f:
    html = f.read()

ui_addition = """
      <!-- Photo Upload -->
      <div class="form-group" style="margin-bottom:24px;">
        <label class="form-label">Profile Photo (ID / Face) <span style="color:red;">*</span></label>
        <div style="display:flex; align-items:center; gap:16px;">
          <div id="photo-preview" style="width:80px; height:80px; border-radius:12px; border:2px dashed var(--border); background:var(--bg-2); display:flex; align-items:center; justify-content:center; overflow:hidden;">
            <span style="font-size:24px; color:var(--text-3);">👤</span>
          </div>
          <div style="flex:1;">
            <input type="file" id="photo-upload" accept="image/*" capture="user" style="display:none;" />
            <button type="button" class="btn-outline" onclick="document.getElementById('photo-upload').click()" style="padding:10px 16px; font-size:13px; width:100%; justify-content:center;">Capture / Upload Photo</button>
            <div style="font-size:11px; color:var(--text-3); margin-top:6px;">Must be a clear photo of your face. Max 4MB.</div>
          </div>
        </div>
      </div>

      <!-- Signature Pad -->
      <div class="form-group" style="margin-bottom:32px;">
        <label class="form-label" style="display:flex; justify-content:space-between;">Digital Signature <span style="color:red;">*</span> <button type="button" id="clear-signature" style="background:none; border:none; color:var(--text-3); font-size:11px; text-decoration:underline; cursor:pointer;">Clear</button></label>
        <div style="border:1px solid var(--border); border-radius:12px; overflow:hidden; background:#fff; touch-action:none;">
          <canvas id="signature-pad" width="400" height="150" style="width:100%; display:block; touch-action:none;"></canvas>
        </div>
        <div style="font-size:11px; color:var(--text-3); margin-top:6px;">Sign securely using your mouse or touchscreen.</div>
      </div>
"""

html = html.replace(
    '<div class="payment-box">',
    ui_addition + '\n      <div class="payment-box">'
)

with open('register.html', 'w') as f:
    f.write(html)
