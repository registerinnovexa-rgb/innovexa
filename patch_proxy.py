import re

with open('api/proxy.js', 'r') as f:
    content = f.read()

old_code = """      let notifications = [];
      if (status !== undefined && status !== before.status) notifications.push(`Status changed to: <strong>${status}</strong>`);
      if (xp !== undefined && xp !== before.xp) notifications.push(`XP Balance updated: <strong>${xp} XP</strong>`);
      if (forgeRole !== undefined && forgeRole !== before.forgeRole) notifications.push(`Role assigned: <strong>${forgeRole}</strong>`);
      if (squad !== undefined && squad !== before.squad) notifications.push(`Squad assignment: <strong>${squad}</strong>`);

      await member.save();
      await new ActionLog({ timestamp: new Date(), type: 'PROFILE_UPDATED', content: `Admin edited profile. Changes: ${JSON.stringify(before)} → saved.`, operativeId: member.operativeId, name: member.name }).save();
      
      if (notifications.length > 0 && member.email) {"""

new_code = """      let notifications = [];
      let justApproved = false;
      if (status !== undefined && status !== before.status) {
        if (status === 'Confirmed' || status === 'Approved') {
          justApproved = true;
        } else {
          notifications.push(`Status changed to: <strong>${status}</strong>`);
        }
      }
      if (xp !== undefined && xp !== before.xp) notifications.push(`XP Balance updated: <strong>${xp} XP</strong>`);
      if (forgeRole !== undefined && forgeRole !== before.forgeRole) notifications.push(`Role assigned: <strong>${forgeRole}</strong>`);
      if (squad !== undefined && squad !== before.squad) notifications.push(`Squad assignment: <strong>${squad}</strong>`);

      await member.save();
      await new ActionLog({ timestamp: new Date(), type: 'PROFILE_UPDATED', content: `Admin edited profile. Changes: ${JSON.stringify(before)} → saved.`, operativeId: member.operativeId, name: member.name }).save();
      
      if (justApproved && member.email) {
        try {
          await transporter.sendMail({
            from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
            to: member.email,
            subject: `🎉 Congratulations! Your Innovexa Membership is Approved`,
            html: `
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
              <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
                <div style="text-align:center; padding:32px 0 16px;">
                  <img src="https://innovexareg.vercel.app/assets/logo.png" alt="Innovexa Hub" style="height:56px; width:auto;">
                </div>
                <div style="max-width:520px;margin:0 auto 32px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
                  <div style="background:#000000;padding:36px 32px;text-align:center;">
                    <div style="font-size:52px;margin-bottom:12px;">🎉</div>
                    <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">You're officially in!</h1>
                    <p style="margin:10px 0 0;color:rgba(255,255,255,.8);font-size:15px;">Welcome to Innovexa Hub, ${member.name}</p>
                  </div>
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
                  <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Innovexa Hub · If you have any issues, contact your admin.</p>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          console.log(`Approval email sent to ${member.email}`);
        } catch (emailErr) {
          console.error('Approval email failed:', emailErr.message);
        }
      }

      if (notifications.length > 0 && member.email) {"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('api/proxy.js', 'w') as f:
        f.write(content)
    print("Patch applied successfully.")
else:
    print("Old code block not found.")
