import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# Modify switchAdminTab to loadEvents
old_switch = """  if (tab === 'overview') loadOverview();
  if (tab === 'members') loadMembers();
  if (tab === 'forgeOps') switchForgeSubTab('access');"""

new_switch = """  if (tab === 'overview') loadOverview();
  if (tab === 'members') loadMembers();
  if (tab === 'forgeOps') switchForgeSubTab('access');
  if (tab === 'events') loadEvents();"""

content = content.replace(old_switch, new_switch)

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)

print("switchAdminTab patched!")
