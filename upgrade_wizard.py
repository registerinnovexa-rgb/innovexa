import re

with open('register.html', 'r') as f:
    html = f.read()

# 1. Add Wizard Progress Bar right before `<div id="step-1">`
progress_bar = """
    <div class="wizard-progress" style="display:flex; justify-content:space-between; margin-bottom:40px; position:relative;">
      <div style="position:absolute; top:50%; left:0; right:0; height:2px; background:rgba(0,0,0,0.05); z-index:1; transform:translateY(-50%);"></div>
      <div id="prog-1" style="position:relative; z-index:2; background:#fff; padding:0 10px; font-size:12px; font-weight:700; color:var(--accent); display:flex; align-items:center; gap:6px;"><div style="width:24px; height:24px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center;">1</div> Identity</div>
      <div id="prog-2" style="position:relative; z-index:2; background:#fff; padding:0 10px; font-size:12px; font-weight:600; color:var(--text-3); display:flex; align-items:center; gap:6px;"><div style="width:24px; height:24px; border-radius:50%; background:var(--bg-3); color:var(--text-3); display:flex; align-items:center; justify-content:center;">2</div> Loadout</div>
      <div id="prog-3" style="position:relative; z-index:2; background:#fff; padding:0 10px; font-size:12px; font-weight:600; color:var(--text-3); display:flex; align-items:center; gap:6px;"><div style="width:24px; height:24px; border-radius:50%; background:var(--bg-3); color:var(--text-3); display:flex; align-items:center; justify-content:center;">3</div> Clearance</div>
    </div>
"""
html = html.replace('<div id="step-1">', progress_bar + '\n    <div id="step-1">')

# 2. Split Step 1 into Step 1 and Step 2
split_html = """
      <div class="nav-btns" style="margin-top:30px; text-align:right;">
        <button class="btn-magnetic" id="btn-next-1" type="button" style="padding:12px 24px;">Next: Loadout &rarr;</button>
      </div>
    </div>

    <!-- STEP 2: Loadout (Skills & Interests) -->
    <div id="step-2" class="hidden">
      <div style="font-family:var(--font-b); font-size:20px; font-weight:700; margin-bottom:24px; color:var(--text-1);">Configure Loadout</div>
"""
# We split right before the Skill grid
html = html.replace('<div class="form-group">\n        <label class="form-label">Current Skill Level</label>', split_html + '\n      <div class="form-group">\n        <label class="form-label">Current Skill Level</label>')


# 3. Add Next/Back buttons to Step 2, and change original step-2 to step-3
# The original Step 1 ends with:
#       <div class="nav-btns">
#         <button class="btn-magnetic" id="btn-next">Proceed to Verification →</button>
#       </div>
#     </div>
#     <!-- STEP 2: Payment -->
#     <div id="step-2" class="hidden">

step2_end_html = """
      <div class="nav-btns" style="margin-top:40px; display:flex; justify-content:space-between;">
        <button class="btn-outline" id="btn-back-1" type="button">← Back</button>
        <button class="btn-magnetic" id="btn-next-2" type="button">Next: Clearance &rarr;</button>
      </div>
    </div>

    <!-- STEP 3: Clearance (Payment, Captcha, Terms) -->
    <div id="step-3" class="hidden">
      <div style="font-family:var(--font-b); font-size:20px; font-weight:700; margin-bottom:24px; color:var(--text-1);">Final Clearance</div>
"""
html = html.replace("""      <div class="nav-btns">
        <button class="btn-magnetic" id="btn-next">Proceed to Verification →</button>
      </div>
    </div>

    <!-- STEP 2: Payment -->
    <div id="step-2" class="hidden">""", step2_end_html)


# 4. Fix Step 3 Back Button (btn-back -> btn-back-2)
html = html.replace('<button class="btn-outline" id="btn-back">← Back</button>', '<button class="btn-outline" id="btn-back-2" type="button">← Back</button>')


# 5. Fix JS for Next/Back logic
# The original JS had:
# document.getElementById('btn-next').addEventListener('click', () => { ... validation ... document.getElementById('step-1').classList.add('hidden'); document.getElementById('step-2').classList.remove('hidden'); });
# document.getElementById('btn-back').addEventListener('click', () => { document.getElementById('step-2').classList.add('hidden'); document.getElementById('step-1').classList.remove('hidden'); });

js_fix_script = """
  // --- Wizard Logic ---
  function updateProgress(step) {
    for(let i=1; i<=3; i++) {
      const p = document.getElementById('prog-'+i);
      const circle = p.querySelector('div');
      if(i === step) {
        p.style.color = 'var(--accent)';
        p.style.fontWeight = '700';
        circle.style.background = 'var(--accent)';
        circle.style.color = '#fff';
      } else if (i < step) {
        p.style.color = 'var(--text-1)';
        p.style.fontWeight = '600';
        circle.style.background = 'var(--text-1)';
        circle.style.color = '#fff';
      } else {
        p.style.color = 'var(--text-3)';
        p.style.fontWeight = '600';
        circle.style.background = 'var(--bg-3)';
        circle.style.color = 'var(--text-3)';
      }
    }
  }

  const btnNext1 = document.getElementById('btn-next-1');
  const btnNext2 = document.getElementById('btn-next-2');
  const btnBack1 = document.getElementById('btn-back-1');
  const btnBack2 = document.getElementById('btn-back-2');
  
  if (btnNext1) btnNext1.addEventListener('click', () => {
    const fn = document.getElementById('fullName').value.trim();
    const em = document.getElementById('email').value.trim();
    const ph = document.getElementById('phone').value.trim();
    const db = document.getElementById('dob').value;
    const yr = document.getElementById('year').value;
    const gn = document.getElementById('gender').value;
    const br = document.getElementById('branch').value;
    
    if(!fn){ showError('fullName','Name required'); return;}
    if(!em){ showError('email','Google Auth required'); return;}
    if(!ph || ph.length<10){ showError('phone','Valid 10-digit phone required'); return;}
    if(!db){ showError('dob','DOB required'); return;}
    if(!yr){ showError('year','Year required'); return;}
    if(!gn){ showError('gender','Gender required'); return;}
    if(!br){ showError('branch','Branch required'); return;}

    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
    updateProgress(2);
    window.scrollTo({top:0, behavior:'smooth'});
  });

  if (btnNext2) btnNext2.addEventListener('click', () => {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    updateProgress(3);
    window.scrollTo({top:0, behavior:'smooth'});
  });

  if (btnBack1) btnBack1.addEventListener('click', () => {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-1').classList.remove('hidden');
    updateProgress(1);
    window.scrollTo({top:0, behavior:'smooth'});
  });

  if (btnBack2) btnBack2.addEventListener('click', () => {
    document.getElementById('step-3').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
    updateProgress(2);
    window.scrollTo({top:0, behavior:'smooth'});
  });
"""

# Replace the original JS block starting from btn-next to btn-back
old_js_block_regex = r"document\.getElementById\('btn-next'\)\.addEventListener\('click', \(\) => \{.*?document\.getElementById\('btn-back'\)\.addEventListener\('click', \(\) => \{.*?\n  \}\);"
html = re.sub(old_js_block_regex, js_fix_script, html, flags=re.DOTALL)

with open('register.html', 'w') as f:
    f.write(html)
