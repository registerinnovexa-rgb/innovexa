with open("api/backend.js", "r") as f:
    content = f.read()

# ─── 5. Task Approved Email ──────────────────────────────────────────────────
OLD_TASK_APPROVED = """                 html: `
                   <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f0f0f;color:#fff;border-radius:10px;">
                     <div style="font-size:36px;text-align:center;margin-bottom:12px;">🏆</div>
                     <h2 style="text-align:center;color:#10b981;margin-bottom:4px;">Task Approved!</h2>
                     <p style="text-align:center;color:#a1a1aa;font-size:13px;margin-bottom:20px;">Your submission has been reviewed by the admin.</p>
                     <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
                       <table style="width:100%;border-collapse:collapse;">
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Task</td><td style="color:#fff;font-weight:700;">${t.title}</td></tr>
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Status</td><td style="color:#10b981;font-weight:700;">✅ Approved</td></tr>
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">XP Earned</td><td style="color:#000000;font-weight:800;font-size:16px;">+${xpToAward} XP</td></tr>
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">New Rank</td><td style="color:#fbbf24;font-weight:700;">${rank}</td></tr>
                         ${feedback ? `<tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Feedback</td><td style="color:#e2e8f0;font-size:13px;">${feedback}</td></tr>` : ''}
                       </table>
                     </div>
                     <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:12px;background:#000000;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">View Your Forge →</a>
                     <p style="color:#3f3f46;font-size:10px;text-align:center;margin-top:16px;">Innovexa Hub</p>
                   </div>`"""

NEW_TASK_APPROVED = """                 html: buildEmail({
                   title: 'Task Approved! 🏆',
                   subtitle: `+${xpToAward} XP Earned`,
                   iconEmoji: '✅',
                   accentColor: '#10b981',
                   bodyHtml: `
                     <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
                     <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.7;">
                       Your task submission has been <strong style="color:#10b981;">approved</strong> by the admin. Great work!
                     </p>
                     <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:20px;">
                       <table style="width:100%;border-collapse:collapse;">
                         <tr style="border-bottom:1px solid #dcfce7;"><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Task</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#111827;">${t.title}</td></tr>
                         <tr style="border-bottom:1px solid #dcfce7;"><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">XP Earned</td><td style="padding:10px 0;font-size:20px;font-weight:800;color:#10b981;">+${xpToAward} XP</td></tr>
                         <tr style="border-bottom:1px solid #dcfce7;"><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">New Rank</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#7c3aed;">${rank}</td></tr>
                         ${feedback ? `<tr><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Feedback</td><td style="padding:10px 0;font-size:13px;color:#374151;line-height:1.6;">${feedback}</td></tr>` : ''}
                       </table>
                     </div>
                     <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:14px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">View Your Forge Dashboard →</a>
                   \`
                 })"""

count = content.count(OLD_TASK_APPROVED)
if count > 0:
    content = content.replace(OLD_TASK_APPROVED, NEW_TASK_APPROVED)
    print(f"✅ Replaced {count} task approved email(s)")
else:
    print("❌ Could not find task approved email")

# ─── 6. Task Revision Email ──────────────────────────────────────────────────
OLD_TASK_REVISION = """                 html: `
                   <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f0f0f;color:#fff;border-radius:10px;">
                     <div style="font-size:36px;text-align:center;margin-bottom:12px;">🔁</div>
                     <h2 style="text-align:center;color:#ef4444;margin-bottom:4px;">Revision Required</h2>
                     <p style="text-align:center;color:#a1a1aa;font-size:13px;margin-bottom:20px;">Your submission needs some changes before it can be approved.</p>
                     <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
                       <table style="width:100%;border-collapse:collapse;">
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Task</td><td style="color:#fff;font-weight:700;">${t.title}</td></tr>
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Status</td><td style="color:#ef4444;font-weight:700;">❌ Sent Back</td></tr>
                         ${feedback ? `<tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Admin Feedback</td><td style="color:#fbbf24;font-size:13px;">${feedback}</td></tr>` : ''}
                       </table>
                     </div>
                     <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:12px;background:#000000;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Resubmit on Forge →</a>
                     <p style="color:#3f3f46;font-size:10px;text-align:center;margin-top:16px;">Innovexa Hub</p>
                   </div>`"""

NEW_TASK_REVISION = """                 html: buildEmail({
                   title: 'Revision Required 🔁',
                   subtitle: `Task: ${t.title}`,
                   iconEmoji: '🔁',
                   accentColor: '#f59e0b',
                   bodyHtml: `
                     <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
                     <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.7;">
                       Your task submission needs some changes before it can be approved. Please review and resubmit.
                     </p>
                     <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:20px;margin-bottom:20px;">
                       <table style="width:100%;border-collapse:collapse;">
                         <tr style="border-bottom:1px solid #fef3c7;"><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Task</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#111827;">${t.title}</td></tr>
                         <tr ${feedback ? 'style="border-bottom:1px solid #fef3c7;"' : ''}><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Status</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#dc2626;">Sent Back for Revision</td></tr>
                         ${feedback ? `<tr><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Admin Feedback</td><td style="padding:10px 0;font-size:13px;color:#374151;line-height:1.6;">${feedback}</td></tr>` : ''}
                       </table>
                     </div>
                     <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:14px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">Resubmit on Forge →</a>
                   \`
                 })"""

count2 = content.count(OLD_TASK_REVISION)
if count2 > 0:
    content = content.replace(OLD_TASK_REVISION, NEW_TASK_REVISION)
    print(f"✅ Replaced {count2} task revision email(s)")
else:
    print("❌ Could not find task revision email")

with open("api/backend.js", "w") as f:
    f.write(content)
print("Phase 3 done.")
