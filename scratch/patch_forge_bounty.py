import re

with open('/Users/jaiakash/Documents/Inno-porta/forge.html', 'r') as f:
    content = f.read()

# 1. Add "History" to sidebar
sidebar_nav = r"""          <div class="nav-item" onclick="switchTab('missions')">
            <span class="nav-item-icon">🎯</span> Missions
          </div>"""
new_sidebar = sidebar_nav + """
          <div class="nav-item" onclick="switchTab('history')">
            <span class="nav-item-icon">📜</span> History
          </div>"""
content = content.replace(sidebar_nav, new_sidebar)

# 2. Add "History" section markup right after "Missions" section
missions_section = r"""        <div id="tab-missions" class="view-section">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:32px;">
            <div>
              <h2 class="section-title">Active Missions</h2>
              <p class="section-desc" style="margin-bottom:0;">Claim open bounties or complete tasks assigned to you.</p>
            </div>
            <button class="btn-dark" onclick="loadMissions()">↻ Refresh</button>
          </div>
          <div id="missionsLoading" class="empty-state" style="display:none;">Loading missions...</div>
          <div id="missionsContainer">
            <!-- Missions injected here -->
          </div>
        </div>"""

history_section = missions_section + """

        <!-- History Tab -->
        <div id="tab-history" class="view-section">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:32px;">
            <div>
              <h2 class="section-title">Bounty History</h2>
              <p class="section-desc" style="margin-bottom:0;">Track your submitted and completed missions.</p>
            </div>
            <button class="btn-dark" onclick="loadMissions()">↻ Refresh</button>
          </div>
          <div id="historyContainer">
            <!-- History injected here -->
          </div>
        </div>"""
content = content.replace(missions_section, history_section)


# 3. Update loadResources correctly
res_old = r"const res = await apiGetMain('resources');"
res_new = r"const res = await apiGetMain('forge_get_resources');"
content = content.replace(res_old, res_new)

map_old = r"""<div class="res-type">${escHtml(r.type || 'Document')}</div>
              <div class="res-title">${escHtml(r.title)}</div>
              <div class="res-desc">${escHtml(r.description || 'No description available.')}</div>
              <button class="btn-dark" style="width:100%; padding:10px;" onclick="window.open('${r.link}', '_blank')">Access Resource ↗</button>"""
map_new = r"""<div class="res-type">${escHtml(r.category || 'Document')}</div>
              <div class="res-title">${escHtml(r.title)}</div>
              <button class="btn-dark" style="width:100%; padding:10px; margin-top:20px;" onclick="window.open('${r.url}', '_blank')">Access Resource ↗</button>"""
content = content.replace(map_old, map_new)


# 4. Update loadMissions
old_load_missions = r"""    async function loadMissions() {
      const container = document.getElementById('missionsContainer');
      const loader = document.getElementById('missionsLoading');
      container.innerHTML = '';
      loader.style.display = 'block';

      try {
        const data = await gasGet('forge_get_my_tasks', { invxId: session.operativeId });
        loader.style.display = 'none';
        
        if (!data.success || !data.tasks || data.tasks.length === 0) {
          container.innerHTML = '<div class="empty-state">No active missions available.</div>';
          return;
        }

        data.tasks.forEach(t => {
          let actionHtml = '';
          if (t.status === 'Open' || t.status === 'In Progress') {
            actionHtml = `
              <div style="margin-top:16px;">
                <input type="text" id="submitLink_${t.taskId}" class="form-input" placeholder="Paste proof link (GitHub, Drive, etc.)" style="margin-bottom:8px;">
                <button class="btn-dark" onclick="submitMission('${t.taskId}')">Submit for Review</button>
              </div>
            `;
          } else {
            actionHtml = `<div style="margin-top:16px; font-weight:600; color:var(--accent2);">${t.status}</div>`;
            if (t.feedback) actionHtml += `<div style="margin-top:8px; font-size:13px; color:var(--text-3);">Admin Feedback: ${escHtml(t.feedback)}</div>`;
          }

          container.innerHTML += `
            <div class="glass-card" style="margin-bottom:16px; border-left:4px solid var(--accent2);">
              <div style="display:flex; justify-content:space-between;">
                <h3 style="font-family:var(--font-d); font-size:18px;">${escHtml(t.title)}</h3>
                <span class="prof-badge">${escHtml(t.difficulty)} | ${t.xp} XP</span>
              </div>
              <p style="color:var(--text-2); font-size:14px; margin-top:8px;">${parseMarkdown(t.description)}</p>
              ${actionHtml}
            </div>
          `;
        });
      } catch (e) {
        loader.style.display = 'none';
        container.innerHTML = '<div class="empty-state">Failed to load missions.</div>';
      }
    }"""

new_load_missions = r"""    async function loadMissions() {
      const container = document.getElementById('missionsContainer');
      const histContainer = document.getElementById('historyContainer');
      const loader = document.getElementById('missionsLoading');
      
      container.innerHTML = '';
      if(histContainer) histContainer.innerHTML = '';
      
      loader.style.display = 'block';

      try {
        const data = await gasGet('forge_get_my_tasks', { invxId: session.operativeId });
        loader.style.display = 'none';
        
        if (!data.success || !data.tasks || data.tasks.length === 0) {
          container.innerHTML = '<div class="empty-state">No active missions available.</div>';
          if(histContainer) histContainer.innerHTML = '<div class="empty-state">No mission history available.</div>';
          return;
        }

        let activeCount = 0;
        let histCount = 0;

        data.tasks.forEach(t => {
          let actionHtml = '';
          const isActive = (t.status === 'Open' || t.status === 'In Progress');
          
          if (isActive) {
            actionHtml = `
              <div style="margin-top:16px;">
                <input type="text" id="submitLink_${t.taskId}" class="form-input" placeholder="Paste proof link (GitHub, Drive, etc.)" style="margin-bottom:8px;">
                <button class="btn-dark" onclick="submitMission('${t.taskId}')">Submit for Review</button>
              </div>
            `;
          } else {
            actionHtml = `<div style="margin-top:16px; font-weight:600; color:var(--accent2);">${t.status}</div>`;
            if (t.feedback) actionHtml += `<div style="margin-top:8px; font-size:13px; color:var(--text-3);">Admin Feedback: ${escHtml(t.feedback)}</div>`;
            
            if (t.status === 'Under Review') {
                actionHtml += `
                <div style="margin-top:12px; padding:12px; background:rgba(0,0,0,0.03); border-radius:8px; border:1px solid var(--border);">
                  <label style="font-size:11px; color:var(--text-3); text-transform:uppercase; margin-bottom:4px; display:block;">Update Submission</label>
                  <input type="text" id="editLink_${t.taskId}" class="form-input" value="${escHtml(t.submitLink)}" style="margin-bottom:8px;">
                  <div style="display:flex; gap:8px;">
                      <button class="btn-dark" style="flex:1; padding:8px 12px; font-size:12px;" onclick="editMission('${t.taskId}')">Update Link</button>
                      <button class="btn-dark" style="flex:1; padding:8px 12px; font-size:12px; background:#ef4444;" onclick="recallMission('${t.taskId}')">Recall Submission</button>
                  </div>
                </div>
                `;
            } else if (t.status === 'Completed' || t.status === 'Approved') {
                actionHtml += `<div style="margin-top:8px; font-size:12px; color:var(--text-3);">Submitted Link: <a href="${escHtml(t.submitLink)}" target="_blank" style="color:var(--accent2); text-decoration:underline;">View ↗</a></div>`;
            }
          }

          const card = `
            <div class="glass-card" style="margin-bottom:16px; border-left:4px solid var(--accent2);">
              <div style="display:flex; justify-content:space-between;">
                <h3 style="font-family:var(--font-d); font-size:18px;">${escHtml(t.title)}</h3>
                <span class="prof-badge">${escHtml(t.difficulty)} | ${t.xp} XP</span>
              </div>
              <p style="color:var(--text-2); font-size:14px; margin-top:8px;">${parseMarkdown(t.description)}</p>
              ${actionHtml}
            </div>
          `;
          
          if (isActive) {
             container.innerHTML += card;
             activeCount++;
          } else {
             if(histContainer) histContainer.innerHTML += card;
             histCount++;
          }
        });
        
        if (activeCount === 0) container.innerHTML = '<div class="empty-state">No active missions available.</div>';
        if (histCount === 0 && histContainer) histContainer.innerHTML = '<div class="empty-state">No mission history available.</div>';

      } catch (e) {
        loader.style.display = 'none';
        container.innerHTML = '<div class="empty-state">Failed to load missions.</div>';
        if(histContainer) histContainer.innerHTML = '<div class="empty-state">Failed to load history.</div>';
      }
    }"""
content = content.replace(old_load_missions, new_load_missions)


# 5. Add editMission and recallMission functions
old_submit = r"""    async function submitMission(taskId) {
      const linkInput = document.getElementById('submitLink_' + taskId);"""
      
new_submit = r"""    async function editMission(taskId) {
      const linkInput = document.getElementById('editLink_' + taskId);
      const submitLink = linkInput.value.trim();
      if (!submitLink) return toast('Please provide a submission link', 'error');
      
      toast('Updating submission...');
      try {
        const r = await fetch('https://innovexareg.vercel.app/api/proxy', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUrl: MAIN_SCRIPT_URL, payload: { action: 'forge_edit_task', taskId, submitLink } })
        });
        const res = await r.json();
        if (res.success) { toast('Link updated successfully.', 'success'); loadMissions(); }
        else { toast(res.message || 'Error updating', 'error'); }
      } catch(e) { toast('Network error', 'error'); }
    }

    async function recallMission(taskId) {
      if(!confirm("Are you sure you want to recall this submission? It will be moved back to Active Missions.")) return;
      
      toast('Recalling submission...');
      try {
        const r = await fetch('https://innovexareg.vercel.app/api/proxy', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUrl: MAIN_SCRIPT_URL, payload: { action: 'forge_recall_task', taskId } })
        });
        const res = await r.json();
        if (res.success) { toast('Submission recalled.', 'success'); loadMissions(); }
        else { toast(res.message || 'Error recalling', 'error'); }
      } catch(e) { toast('Network error', 'error'); }
    }

    async function submitMission(taskId) {
      const linkInput = document.getElementById('submitLink_' + taskId);"""

content = content.replace(old_submit, new_submit)

with open('/Users/jaiakash/Documents/Inno-porta/forge.html', 'w') as f:
    f.write(content)

print("Patched forge.html successfully!")
