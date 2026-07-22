import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

old_grid = """    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Email</span><br><strong>${escHtml(m.email)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Phone</span><br><strong>${escHtml(m.phone)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Branch & Year</span><br><strong>${escHtml(m.branch)} - ${escHtml(m.year)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Skill Level</span><br><strong>${escHtml(m.skillLevel)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0; grid-column: span 2;"><span style="font-size:11px;color:var(--text3);">Interests</span><br><strong>${escHtml(m.interests)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Gender</span><br><strong>${escHtml(m.gender || 'N/A')}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Date of Birth</span><br><strong>${escHtml(m.dob)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">UTR Number</span><br><strong style="font-family:monospace; color:var(--green);">${escHtml(m.utr)}</strong></div>
    </div>"""

new_grid = """    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
      <div class="admin-card" style="padding:15px; margin:0; grid-column: span 2;"><span style="font-size:11px;color:var(--text3);">University / College</span><br><strong>${escHtml(m.college || 'N/A')}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Email</span><br><strong>${escHtml(m.email)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Phone</span><br><strong>${escHtml(m.phone)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Branch & Year</span><br><strong>${escHtml(m.branch)} - ${escHtml(m.year)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Skill Level</span><br><strong>${escHtml(m.skillLevel)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0; grid-column: span 2;"><span style="font-size:11px;color:var(--text3);">Interests</span><br><strong>${escHtml(m.interests)}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Gender</span><br><strong>${escHtml(m.gender || 'N/A')}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Date of Birth</span><br><strong>${escHtml(m.dob)}</strong></div>
      
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Squad</span><br><strong>${escHtml(m.squad || 'Unassigned')}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Rank & XP</span><br><strong>${escHtml(m.rank || 'Apprentice')} (${escHtml(m.xp || '0')} XP)</strong></div>
      
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Forge Access</span><br><strong>${escHtml(m.forgeAccess || 'Pending')}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Linked Mentor</span><br><strong>${escHtml(m.linkedMentor || 'None')}</strong></div>
      
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">Payment Amount</span><br><strong>₹${escHtml(m.amount || '599')}</strong></div>
      <div class="admin-card" style="padding:15px; margin:0;"><span style="font-size:11px;color:var(--text3);">UTR Number</span><br><strong style="font-family:monospace; color:var(--green);">${escHtml(m.utr)}</strong></div>
    </div>"""

content = content.replace(old_grid, new_grid)

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)

print("admin.html patched for full profile fields!")
