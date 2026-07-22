import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

new_js = """
// ══════════════════════════════════════════════════════════════
//  NEW UI JS & RESOURCES
// ══════════════════════════════════════════════════════════════
function autoCalcXP() {
  const diff = document.getElementById('tkDiff').value;
  const xpField = document.getElementById('tkXP');
  if (diff === 'Easy') xpField.value = 50;
  if (diff === 'Medium') xpField.value = 100;
  if (diff === 'Hard') xpField.value = 300;
}

function openBountyDrawer() {
  document.getElementById('drawerTitle').textContent = 'Create Bounty';
  document.getElementById('tkId').value = '';
  document.getElementById('tkTitle').value = '';
  document.getElementById('tkDesc').value = '';
  document.getElementById('tkDiff').value = 'Medium';
  document.getElementById('tkXP').value = 100;
  document.getElementById('tkAssign').value = 'Open';
  
  document.getElementById('bountyOverlay').style.display = 'block';
  setTimeout(() => { document.getElementById('bountyDrawer').classList.add('open'); }, 10);
}

function closeBountyDrawer() {
  document.getElementById('bountyDrawer').classList.remove('open');
  setTimeout(() => { document.getElementById('bountyOverlay').style.display = 'none'; }, 300);
}

function openEditDrawer(taskId) {
  const t = cachedTasks.find(x => x.id === taskId);
  if (!t) return;
  
  document.getElementById('drawerTitle').textContent = 'Edit Bounty';
  document.getElementById('tkId').value = t.id;
  document.getElementById('tkTitle').value = t.title;
  document.getElementById('tkDesc').value = t.desc;
  document.getElementById('tkDiff').value = t.difficulty || 'Medium';
  document.getElementById('tkXP').value = t.xp || 100;
  document.getElementById('tkAssign').value = t.assignedTo || 'Open';
  
  document.getElementById('bountyOverlay').style.display = 'block';
  setTimeout(() => { document.getElementById('bountyDrawer').classList.add('open'); }, 10);
}

async function adminSaveTask() {
  const id = document.getElementById('tkId').value;
  if (id) {
    // Edit existing
    const title = document.getElementById('tkTitle').value.trim();
    const desc = document.getElementById('tkDesc').value.trim();
    const xp = document.getElementById('tkXP').value;
    const difficulty = document.getElementById('tkDiff').value;
    const assignedTo = document.getElementById('tkAssign').value.trim();
    
    try {
      showToast('Saving...', 'info');
      await apiWrite('admin_edit_task', { taskId: id, title, desc, xp, difficulty, assignedTo });
      showToast('Bounty Updated!', 'success');
      closeBountyDrawer();
      await loadForgeTasks();
    } catch(e) {
      showToast('Failed to edit bounty', 'error');
    }
  } else {
    // Create new
    await adminCreateTask(); 
    closeBountyDrawer();
  }
}

// Ensure loadForgeResources exists
let cachedResources = [];
async function loadForgeResources() {
  try {
    const data = await apiGet('forge_get_resources');
    cachedResources = data.resources || [];
    renderForgeResourcesAdmin();
  } catch(e) {
    console.error('loadForgeResources error:', e);
  }
}

function renderForgeResourcesAdmin() {
  const tbody = document.getElementById('resourcesBody');
  if(!tbody) return;
  if (cachedResources.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No resources found.</td></tr>';
    return;
  }
  let html = '';
  cachedResources.forEach(r => {
    html += `<tr>
      <td>${escHtml(r.title)}</td>
      <td>${escHtml(r.category)}</td>
      <td><a href="${escHtml(r.link)}" target="_blank" style="color:var(--blue);">View Link</a></td>
      <td><button class="btn-sm btn-reject" onclick="adminDeleteResource('${r.id}')">Delete</button></td>
    </tr>`;
  });
  tbody.innerHTML = html;
}

async function adminAddResource() {
  const title = document.getElementById('resTitle').value.trim();
  const category = document.getElementById('resCategory').value.trim();
  const link = document.getElementById('resLink').value.trim();
  
  if(!title || !link) return showToast('Title and Link required', 'error');
  
  try {
    showToast('Adding Resource...', 'info');
    await apiWrite('admin_add_resource', { title, category, link });
    showToast('Resource Added!', 'success');
    document.getElementById('resTitle').value = '';
    document.getElementById('resCategory').value = '';
    document.getElementById('resLink').value = '';
    await loadForgeResources();
  } catch(e) {
    showToast('Failed to add resource', 'error');
  }
}

async function adminDeleteResource(id) {
  if(!confirm('Delete this resource?')) return;
  try {
    showToast('Deleting...', 'info');
    await apiWrite('admin_delete_resource', { id });
    showToast('Deleted', 'success');
    await loadForgeResources();
  } catch(e) {
    showToast('Failed to delete', 'error');
  }
}
"""

# Find the LAST </script> tag and inject BEFORE it.
parts = content.rsplit('</script>', 1)
content = parts[0] + new_js + '\n</script>' + parts[1]

# Make sure switchForgeSubTab loads resources when clicked
content = content.replace(
    '''if (subTab === 'bounties') loadForgeTasks();
  if (subTab === 'reviews') loadForgeTasks();''',
    '''if (subTab === 'bounties') loadForgeTasks();
  if (subTab === 'reviews') loadForgeTasks();
  if (subTab === 'resources') loadForgeResources();'''
)

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)
print("JavaScript added for Phase 2!")
