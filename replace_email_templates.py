import re

with open("api/backend.js", "r") as f:
    content = f.read()

# ─── 1. Member OTP Email ────────────────────────────────────────────────────
OLD_MEMBER_OTP = """          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

          <div style="text-align:center; padding:32px 0 16px;">
            <img src="https://innovexareg.vercel.app/assets/logo.png" alt="Innovexa Hub" style="height:56px; width:auto;">
          </div>
          <div style="max-width:480px;margin:0 auto 32px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
                <!-- Header -->
                <div style="background:#000000;padding:32px;text-align:center;">
                  <div style="width:64px;height:64px;background:rgba(255,255,255,.15);border-radius:20px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:32px;">🔐</div>
                  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Secure Login Code</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,.75);font-size:14px;">Innovexa Forge Dashboard</p>
                </div>
                <!-- OTP Block -->
                <div style="padding:32px;text-align:center;">
                  <p style="color:#64748b;font-size:15px;margin:0 0 24px;">Hi <strong style="color:#1e293b;">${member.name}</strong>, use the code below to access your Forge dashboard.</p>
                  <div style="background:#f8fafc;border:2px dashed #c4b5fd;border-radius:14px;padding:28px 24px;margin-bottom:20px;">
                    <div style="font-size:44px;font-weight:800;letter-spacing:12px;color:#000000;font-family:'Courier New',monospace;">${otp}</div>
                    <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Copy the code above and paste it into the login screen</p>
                  </div>
                  <div style="display:inline-block;background:#ede9fe;color:#000000;padding:8px 20px;border-radius:100px;font-size:13px;font-weight:600;">⏱ Expires in 15 minutes</div>
                </div>
                <!-- Details -->
                <div style="padding:0 32px 24px;">
                  <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#92400e;">⚠️ <strong>Do not share this code</strong> with anyone. Innovexa team will never ask for this.</p>
                  </div>
                </div>
                <!-- Footer -->
                <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Innovexa Hub · If you didn't request this, ignore this email.</p>
                </div>
              </div>
            </body>
            </html>
          `"""

NEW_MEMBER_OTP = """          html: buildEmail({
            title: 'Forge Login Code',
            subtitle: 'Innovexa Forge Dashboard',
            iconEmoji: '🔐',
            accentColor: '#7c3aed',
            bodyHtml: `
              <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
              <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.7;">
                Use the secure code below to log into your <strong style="color:#7c3aed;">Innovexa Forge</strong> dashboard.
              </p>
              ${buildOtpBlock(otp)}
              <div style="background:#f9fafb;border-radius:8px;padding:14px 18px;border-left:4px solid #7c3aed;">
                <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                  🔒 <strong style="color:#374151;">Security notice:</strong> Never share this code. Innovexa staff will never ask for your OTP.
                </p>
              </div>
            \`
          })"""

if OLD_MEMBER_OTP in content:
    content = content.replace(OLD_MEMBER_OTP, NEW_MEMBER_OTP)
    print("✅ Replaced member OTP email")
else:
    print("❌ Could not find member OTP email template")

# ─── 2. Admin Login OTP Email ────────────────────────────────────────────────
OLD_ADMIN_OTP = '''          html: `
            <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px;">
              <h2 style="color:#0f172a;margin-bottom:16px;">Admin Access Code</h2>
              <p style="color:#334155;margin-bottom:24px;">An attempt to access the Admin Console was made by <strong>${memberData.name} (${memberData.operativeId})</strong>.</p>
              <div style="background:#fff;padding:24px;border:1px dashed #cbd5e1;border-radius:8px;text-align:center;">
                <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#000000;">${otp}</div>
              </div>
              <p style="color:#94a3b8;font-size:12px;margin-top:16px;">This code expires in 15 minutes.</p>
            </div>
          `'''

NEW_ADMIN_OTP = '''          html: buildEmail({
            title: 'Admin Access Code',
            subtitle: '🚨 Admin Console Login',
            iconEmoji: '🛡️',
            accentColor: '#dc2626',
            bodyHtml: `
              <p style="font-size:14px;color:#374151;margin:0 0 20px;line-height:1.7;">
                An admin login attempt was made by <strong style="color:#000;">${memberData.name}</strong>
                <span style="font-family:monospace;background:#f3f4f6;padding:2px 8px;border-radius:4px;font-size:13px;">(${memberData.operativeId})</span>.
                Use the code below to authorize access.
              </p>
              ${buildOtpBlock(otp, '#dc2626')}
              <div style="background:#fef2f2;border-radius:8px;padding:14px 18px;border-left:4px solid #ef4444;">
                <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">
                  ⚠️ <strong>If you did not initiate this login,</strong> your admin credentials may be compromised. Change them immediately.
                </p>
              </div>
            \`
          })'''

if OLD_ADMIN_OTP in content:
    content = content.replace(OLD_ADMIN_OTP, NEW_ADMIN_OTP)
    print("✅ Replaced admin OTP email")
else:
    print("❌ Could not find admin OTP email template")

with open("api/backend.js", "w") as f:
    f.write(content)

print("Phase 1 done.")
