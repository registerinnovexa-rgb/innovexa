import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# 1. Add CSS for Glass cards, FAB, and toggle switches
new_css = """
    /* --- NEW UI OVERHAUL CSS --- */
    .glass-card {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .glass-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.1);
    }
    
    .bounty-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .diff-badge {
      display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;
    }
    .diff-easy { background: rgba(0,200,83,0.15); color: #00c853; }
    .diff-medium { background: rgba(255,145,0,0.15); color: #ff9100; }
    .diff-hard { background: rgba(213,0,0,0.15); color: #d50000; }
    .xp-orb {
      display: inline-flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--accent), #000);
      color: #fff; border-radius: 50px; padding: 4px 10px; font-size: 12px; font-weight: bold;
    }

    .fab-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--text);
      color: var(--bg2);
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      cursor: pointer;
      border: none;
      z-index: 1000;
      transition: transform 0.2s;
    }
    .fab-btn:hover { transform: scale(1.1); }

    /* iOS Toggle Switch */
    .switch {
      position: relative; display: inline-block; width: 40px; height: 22px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: #ccc; transition: .4s; border-radius: 22px;
    }
    .slider:before {
      position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px;
      background-color: white; transition: .4s; border-radius: 50%;
    }
    input:checked + .slider { background-color: #2196F3; }
    input:checked + .slider:before { transform: translateX(18px); }

    .drawer-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      z-index: 2000; display: none;
    }
    .side-drawer {
      position: fixed; top: 0; right: -400px; width: 400px; height: 100%;
      background: var(--bg2); box-shadow: -4px 0 15px rgba(0,0,0,0.1);
      z-index: 2001; transition: right 0.3s ease; padding: 24px;
      overflow-y: auto;
    }
    .side-drawer.open { right: 0; }
  </style>"""

content = content.replace('</style>', new_css)

# 2. Add Resources to Forge Ops SubTabs nav
nav_html = """<div class="tabs" style="margin-bottom:16px;">
        <button class="btn-sm active" id="fNavAccess" onclick="switchForgeSubTab('access')">Access Control</button>
        <button class="btn-sm" id="fNavBounties" onclick="switchForgeSubTab('bounties')">Bounty Board</button>
        <button class="btn-sm" id="fNavReviews" onclick="switchForgeSubTab('reviews')">Submissions Queue</button>
        <button class="btn-sm" id="fNavResources" onclick="switchForgeSubTab('resources')">Resources Manager</button>
      </div>"""

content = re.sub(
    r'<div class="tabs" style="margin-bottom:16px;">[\s\S]*?</div>',
    nav_html,
    content,
    count=1
)

# 3. Add Resources Tab HTML
res_html = """
    <!-- Sub-tab: Resources Manager -->
    <div id="fTabResources" class="forge-subtab" style="display:none;">
      <div class="admin-card">
        <h3>Resources Manager</h3>
        <p style="margin-bottom:12px; color:var(--text3);">Add learning materials and links for operatives.</p>
        
        <div style="display:flex; gap:10px; margin-bottom: 20px;">
          <input type="text" id="resTitle" placeholder="Title (e.g. Intro to React)" style="flex:2;">
          <input type="text" id="resCategory" placeholder="Category" style="flex:1;">
          <input type="text" id="resLink" placeholder="URL" style="flex:2;">
          <button class="btn-sm btn-primary" onclick="adminAddResource()">Add Resource</button>
        </div>

        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead><tr><th>Title</th><th>Category</th><th>Link</th><th>Action</th></tr></thead>
            <tbody id="resourcesBody"></tbody>
          </table>
        </div>
      </div>
    </div>
"""

content = content.replace('<!-- Sub-tab: Bounty Board -->', res_html + '\n    <!-- Sub-tab: Bounty Board -->')

# 4. Modify Bounty Board HTML for FAB and Slide Drawer
content = content.replace(
    '''<div id="fTabBounties" class="forge-subtab" style="display:none;">
      <button class="btn-add" style="margin-bottom:16px;" onclick="document.getElementById('taskFormCard').style.display='block'">+ Create New Bounty</button>
      
      <div class="admin-card" id="taskFormCard" style="display:none; background:var(--bg3); border:1px solid var(--border);">''',
    '''<div id="fTabBounties" class="forge-subtab" style="display:none;">
      <button class="fab-btn" onclick="openBountyDrawer()">+</button>
      
      <!-- Side Drawer for Creating/Editing Bounties -->
      <div class="drawer-overlay" id="bountyOverlay" onclick="closeBountyDrawer()"></div>
      <div class="side-drawer" id="bountyDrawer">
        <h3 style="margin-bottom:16px;" id="drawerTitle">Create Bounty</h3>
        <input type="hidden" id="tkId">'''
)

content = content.replace(
    '''<div class="form-group" style="flex:1;"><label>Difficulty</label><select id="tkDiff"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>''',
    '''<div class="form-group" style="flex:1;"><label>Difficulty</label><select id="tkDiff" onchange="autoCalcXP()"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>'''
)

content = content.replace(
    '''<button class="btn-primary" onclick="adminCreateTask()">Save Task</button>
        <button class="btn-sm" style="background:var(--bg);color:var(--text);" onclick="document.getElementById('taskFormCard').style.display='none'">Cancel</button>
      </div>''',
    '''<button class="btn-primary" onclick="adminSaveTask()" style="width:100%; margin-bottom:10px;">Save Task</button>
        <button class="btn-sm" style="background:var(--bg);color:var(--text);width:100%;" onclick="closeBountyDrawer()">Cancel</button>
      </div>'''
)

# 5. Modify renderForgeTasks to use Grid & Glass Cards
render_tasks = """function renderForgeTasks() {
  const container = document.getElementById('forgeTasksBody');
  if (!cachedTasks) return;
  const tasks = cachedTasks.filter(t => t.status === 'Open' || t.status === 'Assigned');
  
  if (tasks.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);width:100%;">No active bounties.</div>';
    return;
  }
  
  // Create grid container instead of table rows
  let html = '<div class="bounty-grid">';
  tasks.forEach(t => {
    let diffClass = 'diff-easy';
    if(t.difficulty === 'Medium') diffClass = 'diff-medium';
    if(t.difficulty === 'Hard') diffClass = 'diff-hard';
    
    html += `
      <div class="glass-card">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
          <h4 style="margin:0;">${escHtml(t.title)}</h4>
          <span class="xp-orb">${t.xp} XP</span>
        </div>
        <div style="margin-bottom:12px;">
          <span class="diff-badge ${diffClass}">${t.difficulty || 'Easy'}</span>
          <span style="font-size:12px; color:var(--text3); margin-left:8px;">Assignee: ${t.assignedTo === 'Open' ? 'Anyone' : escHtml(t.assignedTo)}</span>
        </div>
        <p style="font-size:13px; color:var(--text2); margin-bottom:16px;">${escHtml(t.desc)}</p>
        <div style="display:flex; gap:8px;">
          <button class="btn-sm" style="background:var(--bg3); color:var(--text); flex:1;" onclick="openEditDrawer('${t.id}')">✏ Edit</button>
          <button class="btn-sm btn-reject" style="flex:1;" onclick="adminDeleteTask('${t.id}')">🗑 Delete</button>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}"""

# Replace the old renderForgeTasks
content = re.sub(
    r'function renderForgeTasks\(\) \{[\s\S]*?\}\n\nfunction renderForgeReviews\(\)',
    render_tasks + '\n\nfunction renderForgeReviews()',
    content
)

# Replace table with div in fTabBounties for grid
content = content.replace(
    '''<div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>Title</th><th>XP</th><th>Diff</th><th>Assigned</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="forgeTasksBody"></tbody>
        </table>
      </div>''',
    '''<div id="forgeTasksBody"></div>'''
)

# 6. Replace actionBtn in renderForgeAccess with Toggle Switch
access_html = """const isGranted = (String(m.forgeAccess || '').trim() === 'Granted');
    const actionBtn = `
      <label class="switch">
        <input type="checkbox" ${isGranted ? 'checked' : ''} onchange="toggleForgeAccess(${m.rowIndex}, this.checked ? 'Granted' : 'Revoked')">
        <span class="slider"></span>
      </label>
    `;"""

content = re.sub(
    r"const isGranted.*?const actionBtn =[\s\S]*?;",
    access_html,
    content
)

# Write to file
with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)
print("UI Phase 2 setup complete!")
