import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# Fix ADMIN_KEY
content = content.replace(
    "const ADMIN_KEY = 'innovexa2025admin';",
    "const ADMIN_KEY = 'INNOVEXA_SECURE_KEY_2025';"
)

# Fix apiWrite to use /api/proxy
api_write_new = """async function apiWrite(op, payload) {
  payload.op = op;
  payload.adminKey = ADMIN_KEY;
  payload.adminId = adminSession ? adminSession.id : '';
  const isEventOp = ['addEvent','editEvent','deleteEvent','getEventRegs','updateRegStatus','markAttendance'].includes(op);
  const targetScript = isEventOp ? EVENT_REG_SCRIPT_URL : SCRIPT_URL;
  
  try {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: targetScript, payload: payload })
    });
    return await res.json();
  } catch (e) {
    console.error('API Write Error:', e);
    throw e;
  }
}"""
content = re.sub(
    r'async function apiWrite\(op, payload\) \{[\s\S]*?\}',
    api_write_new,
    content,
    flags=re.MULTILINE
)

# Fix toggleForgeAccess to use apiWrite
toggle_new = """async function toggleForgeAccess(rowIndex, newStatus) {
  if (!confirm(`Are you sure you want to ${newStatus === 'Granted' ? 'Grant' : 'Revoke'} Forge access for this operative?`)) return;
  
  const btn = event && event.target;
  if (btn) { btn.disabled = true; btn.textContent = 'Updating…'; }

  try {
    showToast('Updating… please wait', 'info');
    await apiWrite('admin_grant_forge_access', { rowIndex: rowIndex, accessStatus: newStatus });
    
    const refreshed = await apiGet('adminMembers');
    cachedMembers = refreshed.members || [];
    renderForgeAccess();
    showToast('Forge access updated: ' + newStatus, 'success');

  } catch(e) {
    console.error('toggleForgeAccess error:', e);
    showToast('Network error. Please try again.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = newStatus === 'Granted' ? 'Grant Access' : 'Revoke'; }
  }
}"""
content = re.sub(
    r'async function toggleForgeAccess\(rowIndex, newStatus\) \{[\s\S]*?\}\n\n',
    toggle_new + '\n\n',
    content,
    flags=re.MULTILINE
)

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)
print("Patched admin POST requests!")
