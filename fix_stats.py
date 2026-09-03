import re

with open('admin.html', 'r') as f:
    js = f.read()

# Replace strict textContent assignments with optional chaining / safe sets
old_js = """    document.getElementById('statMembers').textContent = members.length;
    document.getElementById('statPending').textContent = pending;
    const forgeCount = members.filter(m => (m.forgeAccess||'').trim() === 'Granted').length;
    const confirmedCount = members.filter(m => (m.status||'').trim().toLowerCase().includes('confirmed')).length;
    document.getElementById('statSessions').textContent = forgeCount;
    document.getElementById('statResources').textContent = confirmedCount;
    
    // New stats
    document.getElementById('statBounties').textContent = membersData.activeBounties || '0';
    document.getElementById('statXP').textContent = membersData.totalXPAwarded || '0';"""

new_js = """    if(document.getElementById('statMembers')) document.getElementById('statMembers').textContent = members.length;
    if(document.getElementById('statPending')) document.getElementById('statPending').textContent = pending;
    const forgeCount = members.filter(m => (m.forgeAccess||'').trim() === 'Granted').length;
    const confirmedCount = members.filter(m => (m.status||'').trim().toLowerCase().includes('confirmed')).length;
    if(document.getElementById('statSessions')) document.getElementById('statSessions').textContent = forgeCount;
    if(document.getElementById('statResources')) document.getElementById('statResources').textContent = confirmedCount;
    
    // New stats
    if(document.getElementById('statBounties')) document.getElementById('statBounties').textContent = membersData.activeBounties || '0';
    if(document.getElementById('statXP')) document.getElementById('statXP').textContent = membersData.totalXPAwarded || '0';"""

js = js.replace(old_js, new_js)

with open('admin.html', 'w') as f:
    f.write(js)
