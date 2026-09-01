import re

with open('atlas.html', 'r') as f:
    html = f.read()

# 1. Add "My Arsenal" to Navbar
html = html.replace('<a href="atlas.html" class="nav-link active" style="font-size:14px; font-weight:500;">Atlas</a>',
                    '<a href="atlas.html" class="nav-link active" style="font-size:14px; font-weight:500;">Atlas</a>\n      <a href="#" onclick="toggleArsenal()" class="nav-link" style="font-size:14px; font-weight:600; color:#0070f3;">[ My Arsenal: <span id="arsenal-count">0</span> ]</a>')

# 2. Modify Header Search into Terminal Librarian
new_header = """<!-- HEADER (Terminal Librarian) -->
<header class="page-header" style="position: relative; z-index: 10;">
  <div class="header-bg">
    <div class="shape-1"></div>
    <div class="shape-2"></div>
  </div>
  <div class="container fade-up" style="max-width: 800px; margin: 0 auto; text-align: left;">
    <div class="badge-top">
      <span style="width:4px;height:4px;border-radius:50%;background:#111;"></span> The Atlas Librarian
    </div>
    <h1 class="page-title" style="font-size: 40px; margin-bottom: 16px;">What do you want to <span class="italic" style="color: #0070f3;">build?</span></h1>
    
    <div style="background: #111; border-radius: 12px; padding: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); border: 1px solid #333; margin-top: 24px; position: relative;">
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="color: #10b981; font-family: 'Courier New', monospace; font-size: 16px;">root@atlas:~$</span>
        <input type="text" id="search-input" placeholder="Type 'lookup react' or 'I want to build an iOS app'..." style="width: 100%; background: transparent; border: none; outline: none; color: #fff; font-family: 'Courier New', monospace; font-size: 15px;" autocomplete="off" spellcheck="false" />
      </div>
      <div id="terminal-output" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #333; color: #a1a1aa; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6;">
        <!-- Terminal / Librarian Output -->
      </div>
    </div>
  </div>
</header>
"""
html = re.sub(r'<!-- HEADER -->.*?<!-- RESOURCES -->', new_header + '\n<!-- RESOURCES -->', html, flags=re.DOTALL)

# 3. Add Personal Arsenal Modal/Drawer (Hidden by default)
arsenal_modal = """
<!-- ARSENAL MODAL -->
<div id="arsenal-modal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 9999; display: none; justify-content: flex-end;">
  <div style="width: 100%; max-width: 400px; background: #fff; height: 100%; box-shadow: -10px 0 30px rgba(0,0,0,0.1); padding: 32px; display: flex; flex-direction: column; animation: slideIn 0.3s forwards;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #eaeaea; padding-bottom: 16px;">
      <h2 style="font-family: var(--font-d); font-size: 24px;">My Arsenal</h2>
      <button onclick="toggleArsenal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">✕</button>
    </div>
    <div id="arsenal-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;">
      <!-- Saved resources injected here -->
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eaeaea;">
      <button onclick="clearArsenal()" style="width: 100%; padding: 12px; background: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; border-radius: 8px; font-weight: 600; cursor: pointer;">Clear Arsenal</button>
    </div>
  </div>
</div>
<style>
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .save-btn { font-size: 11px; padding: 4px 8px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; cursor: pointer; color: #374151; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s; }
  .save-btn:hover { background: #0070f3; color: white; border-color: #0070f3; }
  .saved { background: #10b981 !important; color: white !important; border-color: #10b981 !important; }
  
  .tech-tree-node { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; cursor: pointer; padding: 12px; border-radius: 8px; transition: background 0.2s; }
  .tech-tree-node:hover { background: rgba(0,0,0,0.02); }
  .tree-checkbox { width: 24px; height: 24px; border: 2px solid #d1d5db; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .tree-node-active .tree-checkbox { background: #0070f3; border-color: #0070f3; }
  .tree-node-active .tree-checkbox::after { content: '✓'; color: white; font-weight: bold; font-size: 14px; }
  .tree-node-active .milestone-title { color: #0070f3; }
</style>
"""
html = html.replace('<body>', '<body>\n' + arsenal_modal)

# 4. Modify JavaScript for Resource Cards (to include Save button)
old_card_js = """grid.innerHTML = items.map(r => `
      <div class="resource-card">
        <div class="badge badge-primary">${r.cat}</div>
        <h3 class="resource-title">${r.title}</h3>
        <p class="resource-desc">${r.desc}</p>
        <a href="${r.link}" target="_blank" class="resource-link">Access Resource →</a>
      </div>
    `).join('');"""
    
new_card_js = """grid.innerHTML = items.map((r, i) => {
      const isSaved = arsenal.some(saved => saved.title === r.title);
      return `
      <div class="resource-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div class="badge badge-primary">${r.cat}</div>
          <button class="save-btn ${isSaved ? 'saved' : ''}" onclick="toggleSave('${r.title}', '${r.link}', this)">${isSaved ? '✓ Saved' : '+ Save'}</button>
        </div>
        <h3 class="resource-title" style="margin-top: 16px;">${r.title}</h3>
        <p class="resource-desc">${r.desc}</p>
        <a href="${r.link}" target="_blank" class="resource-link">Access Resource →</a>
      </div>
    `}).join('');"""
html = html.replace(old_card_js, new_card_js)

# 5. Add Custom Logic into the script block
custom_script = """
  // --- ARSENAL LOGIC ---
  let arsenal = JSON.parse(localStorage.getItem('atlas_arsenal')) || [];
  
  function updateArsenalCount() {
    document.getElementById('arsenal-count').innerText = arsenal.length;
  }
  
  function toggleSave(title, link, btnEl) {
    const existsIndex = arsenal.findIndex(r => r.title === title);
    if (existsIndex > -1) {
      arsenal.splice(existsIndex, 1);
      btnEl.classList.remove('saved');
      btnEl.innerText = '+ Save';
    } else {
      arsenal.push({ title, link });
      btnEl.classList.add('saved');
      btnEl.innerText = '✓ Saved';
    }
    localStorage.setItem('atlas_arsenal', JSON.stringify(arsenal));
    updateArsenalCount();
    renderArsenalList();
  }
  
  function toggleArsenal() {
    const modal = document.getElementById('arsenal-modal');
    if (modal.style.display === 'none' || modal.style.display === '') {
      modal.style.display = 'flex';
      renderArsenalList();
    } else {
      modal.style.display = 'none';
    }
  }
  
  function clearArsenal() {
    arsenal = [];
    localStorage.removeItem('atlas_arsenal');
    updateArsenalCount();
    renderArsenalList();
    renderResources(activeCategory === 'all' ? resources : resources.filter(r => r.cat === activeCategory));
  }
  
  function renderArsenalList() {
    const list = document.getElementById('arsenal-list');
    if (arsenal.length === 0) {
      list.innerHTML = '<div style="color:#888; font-size:14px; text-align:center; padding:40px 0;">Your arsenal is empty. Save resources to build your stack.</div>';
      return;
    }
    list.innerHTML = arsenal.map(r => `
      <div style="padding: 16px; background: #faf9f6; border: 1px solid #eaeaea; border-radius: 8px;">
        <div style="font-weight: 600; font-size: 15px; margin-bottom: 8px;">${r.title}</div>
        <a href="${r.link}" target="_blank" style="font-size: 13px; color: #0070f3; text-decoration: none; font-weight: 500;">Access →</a>
      </div>
    `).join('');
  }
  
  updateArsenalCount();


  // --- TERMINAL LIBRARIAN & CHEAT SHEETS ---
  const termInput = document.getElementById('search-input');
  const termOutput = document.getElementById('terminal-output');
  
  const cheatSheets = {
    'lookup react': `<span style="color:#60a5fa">React.js Quick Ref:</span><br>• useState: const [state, setState] = useState(initial)<br>• useEffect: useEffect(() => { /* run */ }, [deps])<br>• Props: Passed down from parent to child.<br><span style="color:#10b981">System Recommendation:</span> Focus on unidirectional data flow.`,
    'lookup flexbox': `<span style="color:#c084fc">CSS Flexbox Quick Ref:</span><br>• display: flex<br>• justify-content: center | space-between | flex-start<br>• align-items: center | stretch<br>• flex-direction: row | column<br><span style="color:#10b981">System Recommendation:</span> Always use flexbox for 1D layouts.`,
    'lookup git': `<span style="color:#fbbf24">Git Quick Ref:</span><br>• git status<br>• git add .<br>• git commit -m "msg"<br>• git push origin main<br><span style="color:#10b981">System Recommendation:</span> Commit often. Push working code.`
  };

  termInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    
    // Check if it's a cheat sheet command
    if (cheatSheets[q]) {
      termOutput.style.display = 'block';
      termOutput.innerHTML = cheatSheets[q];
      renderResources([]); // Hide resources to focus on terminal
      return;
    } 
    
    // Librarian AI NLP Simulation
    if (q.includes('want to build') || q.includes('how to build')) {
      termOutput.style.display = 'block';
      let recs = [];
      if (q.includes('ios') || q.includes('android') || q.includes('mobile') || q.includes('app')) {
        termOutput.innerHTML = `> Natural Language Protocol Engaged.<br>> Analysis: You wish to construct a mobile application.<br>> <span style="color:#10b981">LIBRARIAN RECOMMENDATION:</span> Proceed to 'Flutter Dev' or React Native documentation. Filtering grid now...`;
        recs = resources.filter(r => r.cat === 'Mobile');
      } else if (q.includes('ai') || q.includes('bot') || q.includes('machine learning')) {
        termOutput.innerHTML = `> Natural Language Protocol Engaged.<br>> Analysis: You wish to train neural networks.<br>> <span style="color:#10b981">LIBRARIAN RECOMMENDATION:</span> Study 'PyTorch Tutorials' and 'Hugging Face'. Filtering grid now...`;
        recs = resources.filter(r => r.cat === 'AI/ML');
      } else {
        termOutput.innerHTML = `> Natural Language Protocol Engaged.<br>> Analysis: Standard web application.<br>> <span style="color:#10b981">LIBRARIAN RECOMMENDATION:</span> Begin with MDN Web Docs and React. Filtering grid now...`;
        recs = resources.filter(r => r.cat === 'Web Dev');
      }
      renderResources(recs);
      return;
    }
    
    // Standard Search
    termOutput.style.display = 'none';
    let filtered = activeCategory === 'all' ? resources : resources.filter(r => r.cat === activeCategory);
    if (q) filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q)
    );
    renderResources(filtered);
  });


  // --- TECH TREE PROGRESSION ---
  function initTechTree() {
    const milestones = document.querySelectorAll('.milestone');
    milestones.forEach((m, idx) => {
      // Modify HTML to include a checkbox
      const originalTitle = m.querySelector('.milestone-title').innerText;
      const originalDesc = m.querySelector('.milestone-desc').innerText;
      
      const isSaved = localStorage.getItem('techtree_' + idx) === 'true';
      
      m.innerHTML = `
        <div class="tech-tree-node ${isSaved ? 'tree-node-active' : ''}" onclick="toggleTreeNode(this, ${idx})">
          <div class="tree-checkbox"></div>
          <div>
            <div class="milestone-title" style="font-weight: 600; font-size: 18px; margin-bottom: 4px;">${originalTitle}</div>
            <div class="milestone-desc" style="color: var(--text3); font-size: 14px;">${originalDesc}</div>
          </div>
        </div>
      `;
    });
  }
  
  function toggleTreeNode(el, idx) {
    const isActive = el.classList.toggle('tree-node-active');
    localStorage.setItem('techtree_' + idx, isActive ? 'true' : 'false');
  }

  // Call initTechTree on load
  initTechTree();
"""

html = html.replace('// Search — preserves active category', custom_script + '\n  // Search — preserves active category')

with open('atlas.html', 'w') as f:
    f.write(html)

print("Done")
