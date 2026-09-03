import re

with open('admin.html', 'r') as f:
    html = f.read()

# 1. Unify the Members Tab Header
members_header_old = r"""    <div class="section-header">
      <h2>Members</h2>
      <div class="tab-filters" style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">"""

members_header_new = """    <!-- Unified Tab Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:16px;">
      <div>
        <h2 style="font-size:24px; font-weight:800; color:var(--text); margin:0;">Members Directory</h2>
        <div style="font-size:13px; color:var(--text3); margin-top:4px;">Manage all registered operatives and their clearance levels.</div>
      </div>
      <div class="tab-filters" style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">"""
html = re.sub(members_header_old, members_header_new, html)

# Fix filters UI for Members
filters_old = r"""        <select id="userFilter" onchange="applyFilters()">
          <option value="all">Select user</option>
          <option value="today">Registered Today</option>
        </select>
        <select id="statusFilter" onchange="applyFilters()">
          <option value="all">All Members</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>
        <input type="text" id="memberSearch" placeholder="Search by name or email..." oninput="applyFilters()">
        <button class="btn-export" onclick="exportCSV()">⬇ Export CSV</button>
        <button class="btn-add" onclick="showBroadcastModal()" style="background:var(--blue);"><span style="margin-right:6px">✉</span>Broadcast</button>"""

filters_new = """        <div style="display:flex; background:var(--bg2); border:1px solid var(--border); border-radius:8px; overflow:hidden; box-shadow:var(--shadow-sm);">
          <select id="userFilter" onchange="applyFilters()" style="border:none; padding:10px 14px; border-right:1px solid var(--border); background:transparent; font-size:13px; font-weight:500; outline:none;">
            <option value="all">All Time</option>
            <option value="today">Registered Today</option>
          </select>
          <select id="statusFilter" onchange="applyFilters()" style="border:none; padding:10px 14px; border-right:1px solid var(--border); background:transparent; font-size:13px; font-weight:500; outline:none;">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
          <input type="text" id="memberSearch" placeholder="Search operatives..." oninput="applyFilters()" style="border:none; padding:10px 14px; width:220px; font-size:13px; outline:none; background:transparent;">
        </div>
        <button class="btn-export" onclick="exportCSV()" style="padding:10px 16px; background:var(--bg2); border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow-sm); font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">⬇ Export CSV</button>
        <button class="btn-add" onclick="showBroadcastModal()" style="padding:10px 16px; background:var(--accent); color:#fff; border:none; border-radius:8px; box-shadow:var(--shadow-sm); font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">✉ Broadcast</button>"""
html = html.replace(filters_old, filters_new)


# 2. Unify the Forge Ops Tab Header
forge_ops_old = r"""    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h2 style="font-size:24px;font-weight:800;">Forge Operations</h2>
        <p style="color:var(--text3);font-size:14px;margin-top:4px;">Manage access, missions, and operative progression.</p>
      </div>
      <div class="tab-filters">
        <button class="btn-sm active" id="fNavAccess" onclick="switchForgeSubTab('access')">Access & Ranks</button>
        <button class="btn-sm" id="fNavBounties" onclick="switchForgeSubTab('bounties')">Bounty Board</button>
        <button class="btn-sm" id="fNavReviews" onclick="switchForgeSubTab('reviews')">Submissions Queue</button>
        <button class="btn-sm" id="fNavResources" onclick="switchForgeSubTab('resources')">Resources</button>
      </div>
    </div>"""

forge_ops_new = """    <!-- Unified Tab Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:16px;">
      <div>
        <h2 style="font-size:24px; font-weight:800; color:var(--text); margin:0;">Forge Operations</h2>
        <div style="font-size:13px; color:var(--text3); margin-top:4px;">Manage operative clearance, bounties, and progression frameworks.</div>
      </div>
    </div>
    
    <!-- Segmented Control Bar for Sub-Tabs -->
    <div style="display:flex; gap:4px; padding:4px; background:var(--bg3); border-radius:10px; width:fit-content; margin-bottom:24px; border:1px solid var(--border);">
      <button class="btn-sm active" id="fNavAccess" onclick="switchForgeSubTab('access')" style="border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;">Access & Clearance</button>
      <button class="btn-sm" id="fNavBounties" onclick="switchForgeSubTab('bounties')" style="border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;">Bounty Board</button>
      <button class="btn-sm" id="fNavReviews" onclick="switchForgeSubTab('reviews')" style="border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;">Submissions</button>
      <button class="btn-sm" id="fNavResources" onclick="switchForgeSubTab('resources')" style="border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;">Resources</button>
    </div>"""
html = html.replace(forge_ops_old, forge_ops_new)

# Sub-tab active CSS fix for segmented control
css_fix = """
    .btn-sm { background:transparent; color:var(--text3); transition:all 0.2s; }
    .btn-sm:hover { color:var(--text); }
    .btn-sm.active { background:var(--bg2) !important; color:var(--text) !important; box-shadow:var(--shadow-sm); }
"""
html = html.replace("</style>", css_fix + "\n</style>")


# 3. Unify the Sessions & Ops Tab Header
sessions_old = r"""    <div class="section-header">
      <h2>Events & Operations</h2>
      <button class="btn-add" onclick="openSessionModal()">+ Create Session</button>
    </div>"""

sessions_new = """    <!-- Unified Tab Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:16px;">
      <div>
        <h2 style="font-size:24px; font-weight:800; color:var(--text); margin:0;">Events & Operations</h2>
        <div style="font-size:13px; color:var(--text3); margin-top:4px;">Deploy new events, track attendance, and manage deployments.</div>
      </div>
      <button class="btn-add" onclick="openSessionModal()" style="padding:10px 16px; background:var(--accent); color:#fff; border:none; border-radius:8px; box-shadow:var(--shadow-sm); font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">+ Deploy Operation</button>
    </div>"""
html = html.replace(sessions_old, sessions_new)


# 4. Unify the Settings Tab Header
settings_old = r"""    <div class="section-header">
      <h2>System Settings</h2>
    </div>"""
settings_new = """    <!-- Unified Tab Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:16px;">
      <div>
        <h2 style="font-size:24px; font-weight:800; color:var(--text); margin:0;">System Configuration</h2>
        <div style="font-size:13px; color:var(--text3); margin-top:4px;">Master platform controls, webhook management, and AI settings.</div>
      </div>
    </div>"""
html = html.replace(settings_old, settings_new)


with open('admin.html', 'w') as f:
    f.write(html)
