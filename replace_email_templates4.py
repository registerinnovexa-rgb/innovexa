with open("api/backend.js", "r") as f:
    content = f.read()

# ─── 7. Registration OTP Email ────────────────────────────────────────────────
OLD_REG_OTP = """          html: `<div style="font-family:monospace;background:#0f0f0f;color:#fff;padding:24px;border-radius:8px;">
                   <h2>Security Clearance</h2>
                   <p>Your one-time access code is: <strong style="color:#10b981;font-size:24px;">${otp}</strong></p>
                   <p style="color:#a1a1aa;">This code will expire in 10 minutes.</p>
                 </div>`"""

NEW_REG_OTP = """          html: buildEmail({
            title: 'Email Verification Code',
            subtitle: 'Innovexa Registration',
            iconEmoji: '📧',
            accentColor: '#7c3aed',
            bodyHtml: `
              <p style="font-size:15px;color:#374151;margin:0 0 8px;">Almost there!</p>
              <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.7;">
                Use the code below to verify your email and complete your registration for <strong style="color:#7c3aed;">Innovexa Hub</strong>.
              </p>
              ${buildOtpBlock(otp)}
              <div style="background:#f9fafb;border-radius:8px;padding:14px 18px;border-left:4px solid #7c3aed;">
                <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                  ⏱ <strong style="color:#374151;">This code expires in 10 minutes.</strong> If you did not request this, please ignore this email.
                </p>
              </div>
            \`
          })"""

count = content.count(OLD_REG_OTP)
if count > 0:
    content = content.replace(OLD_REG_OTP, NEW_REG_OTP)
    print(f"✅ Replaced {count} registration OTP email(s)")
else:
    print("❌ Could not find registration OTP email")

with open("api/backend.js", "w") as f:
    f.write(content)
print("Phase 4 done.")
