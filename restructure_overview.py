import re

with open('admin.html', 'r') as f:
    html = f.read()

new_overview = """
    <div class="tab-content active" id="tabOverview">
      <!-- Top Header -->
      <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:20px;">
        <div>
          <h1 style="font-size:28px; font-weight:800; letter-spacing:-0.03em; margin:0; color:var(--text);" id="pageTitle">Overview</h1>
          <div style="font-size:13px; color:var(--text3); margin-top:6px; font-weight:500;">Mainframe System Dashboard</div>
        </div>
        
        <!-- Global Search -->
        <div style="flex:1; min-width:280px; max-width:480px; position:relative;">
          <input type="text" id="globalSearchInput" placeholder="Search operatives, emails, tasks..." 
            style="width:100%; padding:12px 16px 12px 40px; border-radius:8px; border:1px solid var(--border); background:var(--bg2); color:var(--text); font-size:14px; box-shadow:var(--shadow-sm); transition:all 0.2s;"
            onkeyup="if(event.key==='Enter') executeGlobalSearch()">
          <span style="position:absolute; left:14px; top:12px; color:var(--text3); font-size:16px;">🔍</span>
        </div>

        <div style="display:flex; align-items:center; gap:16px;">
          <!-- Admin Presence Indicator -->
          <div id="adminPresenceContainer" style="display:flex; align-items:center; gap:10px; font-size:13px; font-weight:600; color:var(--text2); border:1px solid var(--border); padding:8px 16px; border-radius:30px; background:var(--bg2); box-shadow:var(--shadow-sm);">
            <div style="width:8px; height:8px; border-radius:50%; background:var(--green); box-shadow: 0 0 8px var(--green);"></div>
            <span id="activeAdminsCount">1 Admin Online</span>
          </div>
        </div>
      </header>

      <!-- Top Stats Row (4 Columns) -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:30px;">
        <div class="stat-card" style="padding:24px; display:flex; flex-direction:column; gap:8px;">
          <div class="stat-label" style="color:var(--text3); font-size:12px; font-weight:700;">TOTAL OPERATIVES</div>
          <div class="stat-value" id="statMembers" style="color:var(--text); font-size:36px; font-weight:800;">—</div>
        </div>
        <div class="stat-card" style="padding:24px; display:flex; flex-direction:column; gap:8px;">
          <div class="stat-label" style="color:var(--text3); font-size:12px; font-weight:700;">PENDING APPROVALS</div>
          <div class="stat-value" id="statPending" style="color:var(--yellow); font-size:36px; font-weight:800;">—</div>
        </div>
        <div class="stat-card" style="padding:24px; display:flex; flex-direction:column; gap:8px;">
          <div class="stat-label" style="color:var(--text3); font-size:12px; font-weight:700;">FORGE OPERATIVES</div>
          <div class="stat-value" id="statSessions" style="color:var(--green); font-size:36px; font-weight:800;">—</div>
        </div>
        <div class="stat-card" style="padding:24px; display:flex; flex-direction:column; gap:8px;">
          <div class="stat-label" style="color:var(--text3); font-size:12px; font-weight:700;">TOTAL XP AWARDED</div>
          <div class="stat-value" id="statXP" style="color:var(--accent); font-size:36px; font-weight:800;">—</div>
        </div>
      </div>

      <!-- Main Two-Column Structure -->
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; align-items:start;">
        
        <!-- Left Column (Charts & Quick Actions) -->
        <div style="display:flex; flex-direction:column; gap:24px;">
          
          <!-- Charts Section -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
            <div class="admin-card" style="background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
              <h3 style="font-size:16px; font-weight:700; margin-bottom:16px; color:var(--text);">Members by Year</h3>
              <div style="position:relative; height:220px; width:100%; display:flex; justify-content:center; align-items:center;">
                <canvas id="yearChart"></canvas>
              </div>
            </div>
            <div class="admin-card" style="background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
              <h3 style="font-size:16px; font-weight:700; margin-bottom:16px; color:var(--text);">Members by Branch</h3>
              <div style="position:relative; height:220px; width:100%; display:flex; justify-content:center; align-items:center;">
                <canvas id="branchChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Quick Actions Grid -->
          <div class="admin-card" style="background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
            <h3 style="font-size:16px; font-weight:700; margin-bottom:16px; color:var(--text);">Quick Actions</h3>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px;">
              <button onclick="switchAdminTab('members')" style="padding:16px; background:var(--bg3); border:1px solid var(--border); border-radius:8px; text-align:left; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; gap:8px;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
                <span style="font-size:20px;">👥</span>
                <span style="font-size:14px; font-weight:600; color:var(--text);">Manage Members</span>
                <span style="font-size:12px; color:var(--text3);">Review and approve profiles</span>
              </button>
              <button onclick="switchAdminTab('forgeOps')" style="padding:16px; background:var(--bg3); border:1px solid var(--border); border-radius:8px; text-align:left; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; gap:8px;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
                <span style="font-size:20px;">⚔️</span>
                <span style="font-size:14px; font-weight:600; color:var(--text);">Forge Ops</span>
                <span style="font-size:12px; color:var(--text3);">Manage bounties & ranks</span>
              </button>
              <button onclick="switchAdminTab('comms')" style="padding:16px; background:var(--bg3); border:1px solid var(--border); border-radius:8px; text-align:left; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; gap:8px;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
                <span style="font-size:20px;">📡</span>
                <span style="font-size:14px; font-weight:600; color:var(--text);">Comms & Alerts</span>
                <span style="font-size:12px; color:var(--text3);">Broadcast messages</span>
              </button>
            </div>
          </div>
          
        </div>

        <!-- Right Column (Activity Feed) -->
        <div class="admin-card" style="background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm); height:100%; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="font-size:16px; font-weight:700; color:var(--text); margin:0;">Live Feed</h3>
            <span style="font-size:11px; font-weight:600; padding:4px 8px; background:var(--green-bg); color:var(--green); border-radius:4px;">SYNCED</span>
          </div>
          <div id="recentActivityList" style="flex:1; display:flex; flex-direction:column; gap:12px; max-height:550px; overflow-y:auto; padding-right:8px;">
            <p style="color:var(--text3); font-size:14px; text-align:center; margin-top:20px;">Loading live activity...</p>
          </div>
        </div>

      </div>
    </div>
"""

# Find start and end of tabOverview
start_idx = html.find('<div class="tab-content active" id="tabOverview">')
end_idx = html.find('<!-- ── ROLE MANAGEMENT TAB ── -->')

if start_idx != -1 and end_idx != -1:
    new_html = html[:start_idx] + new_overview + "\n  " + html[end_idx:]
    with open('admin.html', 'w') as f:
        f.write(new_html)
    print("Replaced tabOverview structure successfully.")
else:
    print("Could not find tabOverview boundaries.")

