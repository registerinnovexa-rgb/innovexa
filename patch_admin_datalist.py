import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# 1. Add datalist to the HTML right before the editBountyModal
if '<datalist id="operativeList"></datalist>' not in content:
    content = content.replace(
        '<!-- Edit Bounty Modal -->',
        '<datalist id="operativeList"></datalist>\n    <!-- Edit Bounty Modal -->'
    )

# 2. Update the input fields to use the datalist
content = content.replace(
    'id="tkAssign" value="Open" placeholder="e.g., INVX-09 or Open"',
    'id="tkAssign" value="Open" placeholder="e.g., INVX-09 or Open" list="operativeList"'
)
content = content.replace(
    'id="editTkAssign"',
    'id="editTkAssign" list="operativeList"'
)

# 3. Add a function to populate the datalist when members are loaded
populate_func = """
function populateOperativeDatalist() {
  const datalist = document.getElementById('operativeList');
  if (!datalist) return;
  datalist.innerHTML = '<option value="Open">Open (Anyone)</option>';
  
  if (cachedMembers && cachedMembers.length > 0) {
    const approved = cachedMembers.filter(m => m.status === 'Approved' || m.status === 'Confirmed');
    approved.forEach(m => {
      if (m.operativeId) {
        const option = document.createElement('option');
        option.value = m.operativeId;
        option.textContent = `${m.name} (${m.operativeId})`;
        datalist.appendChild(option);
      }
    });
  }
}
"""
if 'function populateOperativeDatalist' not in content:
    # Inject it before renderMembers function
    content = content.replace(
        'function renderMembers(data)',
        populate_func + '\nfunction renderMembers(data)'
    )

# 4. Call the function in loadMembers and switchForgeSubTab
if 'populateOperativeDatalist();' not in content:
    content = content.replace(
        'renderMembers(cachedMembers);',
        'renderMembers(cachedMembers);\n    populateOperativeDatalist();'
    )
    content = content.replace(
        'cachedMembers = data.members || [];',
        'cachedMembers = data.members || [];\n      populateOperativeDatalist();'
    )

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)
print("Admin HTML patched with datalist!")
