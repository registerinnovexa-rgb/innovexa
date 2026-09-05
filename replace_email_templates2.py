with open("api/backend.js", "r") as f:
    content = f.read()

# ─── 3. Member Approval Email (status = Confirmed/Approved) ──────────────────
OLD_APPROVAL = '''            html: `
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
              <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

          <div style="text-align:center; padding:32px 0 16px;">
            <img src="https://innovexareg.vercel.app/assets/logo.png" alt="Innovexa Hub" style="height:56px; width:auto;">
          </div>
          <div style="max-width:520px;margin:0 auto 32px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
                  <!-- Header -->
                  <div style="background:#000000;padding:36px 32px;text-align:center;">
                    <div style="font-size:52px;margin-bottom:12px;">🎉</div>
                    <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">You're officially in!</h1>
                    <p style="margin:10px 0 0;color:rgba(255,255,255,.8);font-size:15px;">Welcome to Innovexa Hub, ${member.name}</p>
                  </div>
                  <!-- Operative ID Card -->
                  <div style="padding:32px;">
                    <p style="color:#475569;font-size:15px;margin:0 0 24px;text-align:center;">Your membership has been <strong style="color:#10b981;">approved</strong>. Here's your unique Operative ID:</p>
                    <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border:2px solid #c4b5fd;border-radius:14px;padding:28px;text-align:center;margin-bottom:24px;">
                      <div style="font-size:11px;font-weight:700;color:#000000;text-transform:uppercase;letter-spacing:3px;margin-bottom:10px;">Your Operative ID</div>
                      <div style="font-size:36px;font-weight:800;color:#5b21b6;font-family:'Courier New',monospace;letter-spacing:6px;">${member.operativeId}</div>
                      <div style="margin-top:12px;font-size:12px;color:#94a3b8;">Use this ID to log in to your Forge dashboard</div>
                    </div>
                    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">Access the <strong>Innovexa Forge</strong> — your personal dashboard for exclusive resources, task bounties, the leaderboard, and SOS support.</p>
                    <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:15px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">Access the Forge Dashboard →</a>
                  </div>
                  <!-- Footer -->
                  <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Innovexa Hub · If you have any issues, contact your admin.</p>
                  </div>
                </div>
              </body>
              </html>
            `'''

NEW_APPROVAL = '''            html: buildEmail({
              title: "You're officially in! 🎉",
              subtitle: 'Membership Approved',
              iconEmoji: '🎉',
              accentColor: '#10b981',
              bodyHtml: `
                <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
                <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.7;">
                  Your Innovexa Hub membership has been <strong style="color:#10b981;">approved</strong>! Welcome to the collective.
                </p>
                <div style="margin:0 0 24px;border-radius:12px;overflow:hidden;">
                  <div style="background:#10b981;padding:10px 24px;text-align:center;">
                    <span style="font-size:11px;color:rgba(255,255,255,0.85);letter-spacing:3px;text-transform:uppercase;font-weight:600;">Your Operative ID</span>
                  </div>
                  <div style="background:#f0fdf4;border:2px solid #10b981;border-top:none;padding:24px;text-align:center;border-radius:0 0 12px 12px;">
                    <div style="font-size:38px;font-weight:900;letter-spacing:8px;color:#000000;font-family:'Courier New',monospace;">${member.operativeId}</div>
                    <div style="margin-top:8px;font-size:13px;color:#10b981;font-weight:600;">Use this ID to log in to your Forge dashboard</div>
                  </div>
                </div>
                <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.7;">
                  Access the <strong style="color:#7c3aed;">Innovexa Forge</strong> — your personal dashboard for resources, task bounties, leaderboard, and SOS support.
                </p>
                <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:15px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.3px;">Access the Forge Dashboard →</a>
              \`,
              footerNote: 'Questions? Contact your admin.'
            })'''

count_approval = content.count(OLD_APPROVAL)
if count_approval > 0:
    content = content.replace(OLD_APPROVAL, NEW_APPROVAL)
    print(f"✅ Replaced {count_approval} approval email(s)")
else:
    print("❌ Could not find approval email template")

# ─── 4. Member Revoke/Reject Email ─────────────────────────────────────────
OLD_REVOKE = '''            html: `
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
              <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

          <div style="text-align:center; padding:32px 0 16px;">
            <img src="https://innovexareg.vercel.app/assets/logo.png" alt="Innovexa Hub" style="height:56px; width:auto;">
          </div>
          <div style="max-width:520px;margin:0 auto 32px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
                  <!-- Header -->
                  <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:36px 32px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
                    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Membership Status Updated</h1>
                  </div>
                  <div style="padding:32px;">
                    <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">Hi <strong>${member.name}</strong>, your Innovexa Hub membership status has been updated to <strong style="color:#dc2626;">${status}</strong>.</p>
                    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;padding:14px 18px;margin-bottom:24px;">
                      <p style="margin:0;font-size:13px;color:#7f1d1d;">If you believe this is an error or would like to appeal, please contact the Innovexa admin team directly.</p>
                    </div>
                    <a href="https://innovexareg.vercel.app" style="display:block;text-align:center;padding:13px 24px;background:#64748b;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Visit Innovexa Hub</a>
                  </div>
                  <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Innovexa Hub · This is an automated notification.</p>
                  </div>
                </div>
              </body>
              </html>
            `'''

NEW_REVOKE = '''            html: buildEmail({
              title: 'Membership Status Update',
              subtitle: `Status changed to: ${status}`,
              iconEmoji: '⚠️',
              accentColor: '#dc2626',
              bodyHtml: `
                <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
                <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.7;">
                  Your Innovexa Hub membership status has been updated to
                  <strong style="color:#dc2626;">${status}</strong>.
                </p>
                <div style="background:#fef2f2;border-radius:8px;padding:14px 18px;border-left:4px solid #ef4444;margin-bottom:24px;">
                  <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">
                    If you believe this is an error, please contact the Innovexa admin team directly to appeal.
                  </p>
                </div>
                <a href="https://innovexareg.vercel.app" style="display:block;text-align:center;padding:13px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Visit Innovexa Hub</a>
              \`
            })'''

count_revoke = content.count(OLD_REVOKE)
if count_revoke > 0:
    content = content.replace(OLD_REVOKE, NEW_REVOKE)
    print(f"✅ Replaced {count_revoke} revoke email(s)")
else:
    print("❌ Could not find revoke email template")

with open("api/backend.js", "w") as f:
    f.write(content)

print("Phase 2 done.")
