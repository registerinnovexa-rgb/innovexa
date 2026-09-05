import re

with open("api/backend.js", "r") as f:
    content = f.read()

# ─── Template D Helper Function ────────────────────────────────────────────────
# We'll insert a shared buildEmail() function after the transporter setup

TEMPLATE_FUNC = '''
// ── Innovexa Brand Email Template Builder (Template D) ────────────────────────
function buildEmail({ title, subtitle = '', bodyHtml, accentColor = '#7c3aed', iconEmoji = '📧', footerNote = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <!-- Card -->
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- Hero Header -->
      <div style="background:linear-gradient(90deg,${accentColor} 0%,#000000 60%);padding:28px 32px;display:flex;align-items:center;gap:16px;">
        <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;">${iconEmoji}</div>
        <div>
          <div style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Innovexa Hub</div>
          <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:3px;">${title}</div>
          ${subtitle ? '<div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:2px;">' + subtitle + '</div>' : ''}
        </div>
      </div>
      <!-- Body -->
      <div style="padding:32px;">
        ${bodyHtml}
      </div>
      <!-- Footer -->
      <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
        <p style="margin:0;font-size:11px;color:#94a3b8;">© Innovexa Hub · Bangalore</p>
        <a href="https://innovexa-portal.vercel.app" style="font-size:11px;color:${accentColor};text-decoration:none;font-weight:600;">Visit Portal →</a>
      </div>
    </div>
    ${footerNote ? '<p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">' + footerNote + '</p>' : ''}
  </div>
</body>
</html>`;
}

function buildOtpBlock(otp, accentColor = '#7c3aed') {
  return `
    <div style="margin:0 0 24px;border-radius:12px;overflow:hidden;">
      <div style="background:${accentColor};padding:10px 24px;text-align:center;">
        <span style="font-size:11px;color:rgba(255,255,255,0.85);letter-spacing:3px;text-transform:uppercase;font-weight:600;">Your Access Code</span>
      </div>
      <div style="background:#faf5ff;border:2px solid ${accentColor};border-top:none;padding:24px;text-align:center;border-radius:0 0 12px 12px;">
        <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#000000;font-family:'Courier New',monospace;">${otp}</div>
        <div style="margin-top:8px;font-size:13px;color:${accentColor};font-weight:600;">⏱ Valid for 15 minutes</div>
      </div>
    </div>`;
}

'''

# Insert the helper right after the transporter interceptor block
INSERT_MARKER = "// ── Admin Notification Helper ────────────────────────────────────────────────"
if TEMPLATE_FUNC.strip() not in content and INSERT_MARKER in content:
    content = content.replace(INSERT_MARKER, TEMPLATE_FUNC + INSERT_MARKER)
    print("Inserted buildEmail helper function.")
else:
    print("Helper already inserted or marker not found.")

with open("api/backend.js", "w") as f:
    f.write(content)
print("Done.")
