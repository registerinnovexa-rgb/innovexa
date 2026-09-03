with open('admin.html', 'r') as f:
    content = f.read()

content = content.replace("toggleForgeAccess(${m.rowIndex}, 'Revoked')", "toggleForgeAccess('${m.operativeId}', 'Revoked')")
content = content.replace("toggleForgeAccess(${m.rowIndex}, 'Granted')", "toggleForgeAccess('${m.operativeId}', 'Granted')")
content = content.replace("async function toggleForgeAccess(rowIndex, newStatus)", "async function toggleForgeAccess(operativeId, newStatus)")
content = content.replace("await apiWrite('admin_grant_forge_access', { rowIndex: rowIndex, accessStatus: newStatus });", "await apiWrite('admin_grant_forge_access', { operativeId: operativeId, accessStatus: newStatus });")

with open('admin.html', 'w') as f:
    f.write(content)

