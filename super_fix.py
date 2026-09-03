import re

with open('admin.html', 'r') as f:
    html = f.read()

# Fix sub-tab navigation segmented control
segmented_control_old = r"""    <!-- Segmented Control Bar for Sub-Tabs -->
    <div style="display:flex; gap:4px; padding:4px; background:var(--bg3); border-radius:10px; width:fit-content; margin-bottom:24px; border:1px solid var(--border);">
      <button class="btn-sm active" id="fNavAccess" onclick="switchForgeSubTab('access')" style="border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;">Access & Clearance</button>
      <button class="btn-sm" id="fNavBounties" onclick="switchForgeSubTab('bounties')" style="border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;">Bounty Board</button>
      <button class="btn-sm" id="fNavReviews" onclick="switchForgeSubTab('reviews')" style="border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;">Submissions</button>
      <button class="btn-sm" id="fNavResources" onclick="switchForgeSubTab('resources')" style="border:none; border-radius:6px; padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;">Resources</button>
    </div>"""

segmented_control_new = """    <!-- Segmented Control Bar for Sub-Tabs -->
    <div class="segmented-control" style="display:inline-flex; gap:4px; padding:4px; background:#f1f5f9; border-radius:10px; margin-bottom:24px; border:1px solid #e2e8f0; box-shadow:inset 0 1px 2px rgba(0,0,0,0.05);">
      <button class="seg-btn active" id="fNavAccess" onclick="switchForgeSubTab('access')">Access & Clearance</button>
      <button class="seg-btn" id="fNavBounties" onclick="switchForgeSubTab('bounties')">Bounty Board</button>
      <button class="seg-btn" id="fNavReviews" onclick="switchForgeSubTab('reviews')">Submissions</button>
      <button class="seg-btn" id="fNavResources" onclick="switchForgeSubTab('resources')">Resources</button>
    </div>"""

html = html.replace(segmented_control_old, segmented_control_new)

# Add CSS for .seg-btn and proper inputs
css_add = """
    .segmented-control { user-select: none; }
    .seg-btn {
      background: transparent; border: none; border-radius: 6px; padding: 8px 16px;
      font-size: 13px; font-weight: 600; color: var(--text3); cursor: pointer; transition: all 0.2s;
      outline: none; text-transform: none; font-family: var(--font-b); letter-spacing: 0;
    }
    .seg-btn:hover { color: var(--text); }
    .seg-btn.active {
      background: #ffffff; color: var(--accent); box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .form-input {
      padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; background: #fff;
      font-size: 13px; font-family: var(--font-b); color: var(--text); outline: none; transition: border 0.2s;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
    }
    .form-input:focus { border-color: var(--accent); }
    
    .btn-solid {
      padding: 10px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px;
      font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm);
    }
    .btn-solid:hover { opacity: 0.9; transform: translateY(-1px); }
"""
html = html.replace('</style>', css_add + '\n</style>')

# Fix raw inputs in Resources Tab
html = html.replace(
    '<input type="text" id="resTitle" placeholder="Title (e.g. Intro to React)" style="flex:2;">',
    '<input type="text" class="form-input" id="resTitle" placeholder="Title (e.g. Intro to React)" style="flex:2;">'
)
html = html.replace(
    '<input type="text" id="resCategory" placeholder="Category" style="flex:1;">',
    '<input type="text" class="form-input" id="resCategory" placeholder="Category" style="flex:1;">'
)
html = html.replace(
    '<input type="text" id="resLink" placeholder="URL" style="flex:2;">',
    '<input type="text" class="form-input" id="resLink" placeholder="URL" style="flex:2;">'
)
html = html.replace(
    '<button class="btn-sm btn-primary" onclick="adminAddResource()">Add Resource</button>',
    '<button class="btn-solid" onclick="adminAddResource()" style="white-space:nowrap;">+ Add Resource</button>'
)

# Fix raw inputs in Bounty Tab
html = html.replace(
    '<input type="text" id="bountyTitle" placeholder="Bounty Title" style="flex:2;">',
    '<input type="text" class="form-input" id="bountyTitle" placeholder="Bounty Title" style="flex:2;">'
)
html = html.replace(
    '<input type="number" id="bountyXP" placeholder="XP Reward" style="flex:1;">',
    '<input type="number" class="form-input" id="bountyXP" placeholder="XP Reward" style="flex:1;">'
)
html = html.replace(
    '<button class="btn-sm btn-primary" onclick="adminCreateTask()">Create Bounty</button>',
    '<button class="btn-solid" onclick="adminCreateTask()" style="white-space:nowrap;">+ Create Bounty</button>'
)

# Wrap tables in .table-container if they are naked
# Wait, let's just make ALL `.data-table` look nice regardless of wrapper by giving the table itself the borders
# But they need overflow-x for mobile.
# Actually, the user's issue with "Resources" table in the screenshot is that it has a grey background on the header but white on the rows, with no outer border on the table.
# Let's add border to `.data-table` directly if we don't have wrappers.
table_css_patch = """
    .data-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; white-space: nowrap; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: #fff; box-shadow: var(--shadow-sm); }
    .data-table th:first-child { border-top-left-radius: 8px; }
    .data-table th:last-child { border-top-right-radius: 8px; }
"""
html = html.replace('</style>', table_css_patch + '\n</style>')

with open('admin.html', 'w') as f:
    f.write(html)
