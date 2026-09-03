import re

with open('admin.html', 'r') as f:
    c = f.read()

# Fix admin_delete_resource
# Frontend uses admin_delete_resource({ rowIndex }), backend expects id
c = re.sub(
    r"async function deleteResource\(rowIndex\)\s*\{\s*if\(!confirm\('Delete resource\?'\)\) return;\s*try\s*\{\s*const data = await apiWrite\('admin_delete_resource', \{ rowIndex \}\);",
    r"async function deleteResource(id) { if(!confirm('Delete resource?')) return; try { const data = await apiWrite('admin_delete_resource', { id });",
    c
)
# And the button rendering it:
c = re.sub(
    r"onclick=\"deleteResource\(\$\{r.rowIndex\}\)\"",
    r"onclick=\"deleteResource('${r.id || r.resourceId}')\"",
    c
)

# Fix certApprove
# Frontend uses certApprove({ rowIndex: rowIndex, status: status }), backend expects requestId
c = re.sub(
    r"async function updateCertReq\(rowIndex, status\)\s*\{\s*const data = await apiWrite\('certApprove', \{ rowIndex: rowIndex, status: status \}\);",
    r"async function updateCertReq(requestId, status) { const data = await apiWrite('certApprove', { requestId, status });",
    c
)
# And the buttons rendering it:
c = re.sub(
    r"onclick=\"updateCertReq\(\$\{c.rowIndex\}, 'Approved'\)\"",
    r"onclick=\"updateCertReq('${c.requestId}', 'Approved')\"",
    c
)
c = re.sub(
    r"onclick=\"updateCertReq\(\$\{c.rowIndex\}, 'Rejected'\)\"",
    r"onclick=\"updateCertReq('${c.requestId}', 'Rejected')\"",
    c
)

# Fix deleteSession
c = re.sub(
    r"async function deleteSession\(rowIndex\)\s*\{\s*if\s*\(!confirm\('Delete this event\?'\)\)\s*return;\s*try\s*\{\s*const data = await apiWrite\('deleteSession', \{ rowIndex \}\);",
    r"async function deleteSessionLegacy(sessionId) { if(!confirm('Delete this event?')) return; try { const data = await apiWrite('deleteSession', { sessionId });",
    c
)
c = re.sub(
    r"onclick=\"deleteSession\(\$\{ev.rowIndex\}\)\"",
    r"onclick=\"deleteSessionLegacy('${ev.sessionId}')\"",
    c
)


with open('admin.html', 'w') as f:
    f.write(c)

