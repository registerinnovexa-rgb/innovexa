import re

with open('pathfinder.html', 'r') as f:
    content = f.read()


# 1. Add Chart.js to head
if "chart.js" not in content:
    content = content.replace('</head>', '  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n</head>')


# 2. Features to inject BEFORE Bootcamp 1
features_html = """
<!-- ══ VISUALIZATIONS SECTION ══════════════════════════════════════════════════════ -->
<section class="fade-up" style="padding: 0 24px 80px; display: flex; flex-direction: column; align-items: center;">
  <div style="width: 100%; max-width: 900px;">
    
    <div style="text-align: center; margin-bottom: 40px;">
      <h2 style="font-family: var(--font-d); font-size: 36px; line-height: 1.2;">Stop watching tutorials.<br>Start <span style="color: #0070f3; font-style: italic;">building</span>.</h2>
      <p style="color: var(--text2); font-size: 16px; margin-top: 12px; max-width: 600px; margin-left: auto; margin-right: auto;">Our methodology is strictly execution-based. Here is what happens when you join Pathfinder.</p>
    </div>

    <!-- The Skill Radar -->
    <div style="background: #ffffff; border-radius: 16px; padding: 40px; margin-bottom: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; align-items: center;">
      <h3 style="font-family: var(--font-d); font-size: 24px; margin-bottom: 8px;">Competence Trajectory</h3>
      <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Watch your operative profile expand over the 12-week intensive.</p>
      
      <div style="width: 100%; max-width: 400px; position: relative;">
        <canvas id="skillRadar"></canvas>
      </div>
      
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button class="radar-btn" onclick="updateRadar(0)" style="padding: 8px 16px; border: 1px solid #0070f3; background: #0070f3; color: #fff; border-radius: 20px; font-size: 13px; cursor: pointer;">Week 1</button>
        <button class="radar-btn" onclick="updateRadar(1)" style="padding: 8px 16px; border: 1px solid #0070f3; background: transparent; color: #0070f3; border-radius: 20px; font-size: 13px; cursor: pointer;">Week 6</button>
        <button class="radar-btn" onclick="updateRadar(2)" style="padding: 8px 16px; border: 1px solid #0070f3; background: transparent; color: #0070f3; border-radius: 20px; font-size: 13px; cursor: pointer;">Week 12</button>
      </div>
    </div>

    <!-- Live Code Sandbox -->
    <div style="background: #111; border-radius: 16px; padding: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); margin-bottom: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-family: 'Courier New', monospace; font-size: 16px; color: #10b981;">> Live Sandbox Protocol</h3>
        <button onclick="executeSandbox()" style="background: #10b981; color: #000; border: none; padding: 6px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">[ COMPILE ]</button>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: #000; border: 1px solid #333; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="background: #222; padding: 4px 12px; font-size: 10px; color: #888; font-family: monospace;">index.html</div>
          <textarea id="sandbox-code" style="width: 100%; flex: 1; background: transparent; color: #e5e7eb; border: none; outline: none; padding: 16px; font-family: 'Courier New', monospace; font-size: 13px; resize: none;" spellcheck="false">
<style>
  .btn {
    background: #0070f3;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0,112,243,0.4);
    transition: transform 0.2s;
  }
  .btn:hover { transform: scale(1.05); }
  body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #faf9f6; }
</style>

<button class="btn" onclick="alert('Access Granted.')">
  Deploy App
</button>
          </textarea>
        </div>
        <div style="background: #fff; border: 1px solid #333; border-radius: 8px; overflow: hidden; position: relative;">
          <div style="position: absolute; top: 0; left: 0; right: 0; background: #f3f4f6; padding: 4px 12px; font-size: 10px; color: #888; font-family: monospace; border-bottom: 1px solid #e5e7eb; z-index: 10;">Output</div>
          <iframe id="sandbox-output" style="width: 100%; height: 100%; min-height: 250px; border: none; padding-top: 24px;"></iframe>
        </div>
      </div>
    </div>

  </div>
</section>

<script>
  let radarChart;
  
  const radarData = [
    [20, 10, 10, 20, 5, 10],   // Week 1
    [60, 40, 50, 70, 30, 40],  // Week 6
    [90, 85, 95, 90, 80, 85]   // Week 12
  ];

  document.addEventListener("DOMContentLoaded", () => {
    // Init Sandbox
    executeSandbox();

    // Init Radar
    const ctx = document.getElementById('skillRadar').getContext('2d');
    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['UI/UX Design', 'DOM Logic', 'State Management', 'CSS Architecture', 'API Integration', 'Deployment'],
        datasets: [{
          label: 'Competence Level',
          data: radarData[0],
          backgroundColor: 'rgba(0, 112, 243, 0.2)',
          borderColor: 'rgba(0, 112, 243, 1)',
          pointBackgroundColor: 'rgba(0, 112, 243, 1)',
          borderWidth: 2
        }]
      },
      options: {
        scales: { r: { min: 0, max: 100, ticks: { display: false } } },
        plugins: { legend: { display: false } }
      }
    });
  });

  function executeSandbox() {
    const code = document.getElementById('sandbox-code').value;
    const iframe = document.getElementById('sandbox-output');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
  }

  function updateRadar(weekIndex) {
    // Update chart
    radarChart.data.datasets[0].data = radarData[weekIndex];
    radarChart.update();
    
    // Update buttons
    const btns = document.querySelectorAll('.radar-btn');
    btns.forEach((b, i) => {
      if (i === weekIndex) {
        b.style.background = '#0070f3';
        b.style.color = '#fff';
      } else {
        b.style.background = 'transparent';
        b.style.color = '#0070f3';
      }
    });
  }
</script>
"""

content = content.replace('<!-- BOOTCAMP 1 SECTION -->', features_html + '\n<!-- BOOTCAMP 1 SECTION -->')


# 3. Add Bootcamp 2 & 3
bootcamp_2_3_html = """
<!-- BOOTCAMP 2 SECTION -->
<section id="bootcamp-2" class="bento-section container" style="margin-top: 40px; position: relative; z-index: 10; padding-bottom: 40px;">
  <div class="bento-grid" style="grid-template-columns: 1fr; grid-auto-rows: auto; max-width: 900px; margin: 0 auto;">
    
    <div class="bento-card fade-up" style="padding: 40px; border: 1px solid #8b5cf6; box-shadow: 0 0 40px rgba(139, 92, 246, 0.15); overflow: visible; height: auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="color:#8b5cf6; font-family:var(--font-m); font-weight:600; font-size:14px; letter-spacing: 2px; text-transform:uppercase; margin-bottom: 12px;">Bootcamp 02</div>
          <h2 class="course-title" style="font-family:var(--font-d); font-size: 36px; margin: 0; line-height: 1.2;">Backend Systems &amp; <br>Data Architectures</h2>
        </div>
        <div style="background: rgba(37, 211, 102, 0.1); border: 1px solid #25D366; color: #25D366; padding: 8px 16px; border-radius: 4px; font-family:var(--font-m); font-size: 13px; font-weight: 600; white-space: nowrap;">
          Registration Open
        </div>
      </div>

      <div class="course-meta" style="display:flex; gap: 40px; margin-bottom: 32px; flex-wrap: wrap; padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
        <div>
          <div style="color:var(--text3); font-size: 11px; text-transform:uppercase; letter-spacing:1px; margin-bottom: 6px;">Duration</div>
          <div style="font-weight: 600; font-size: 15px;">6 Weeks</div>
        </div>
        <div>
          <div style="color:var(--text3); font-size: 11px; text-transform:uppercase; letter-spacing:1px; margin-bottom: 6px;">Difficulty</div>
          <div style="font-weight: 600; font-size: 15px; display:flex; gap: 4px; align-items:center;">
            <div style="width:8px; height:8px; background:#8b5cf6; border-radius:50%;"></div>
            <div style="width:8px; height:8px; background:#8b5cf6; border-radius:50%;"></div>
            <div style="width:8px; height:8px; background:var(--bg3); border-radius:50%;"></div>
            <span style="margin-left: 8px;">Intermediate</span>
          </div>
        </div>
        <div>
          <div style="color:var(--text3); font-size: 11px; text-transform:uppercase; letter-spacing:1px; margin-bottom: 6px;">Outcome</div>
          <div style="font-weight: 600; font-size: 15px;">Build 2 Full APIs</div>
        </div>
      </div>

      <p style="color:var(--text2); font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
        Beautiful interfaces mean nothing without the invisible machinery powering them. Bootcamp 02 plunges you into the deep end of Node.js, Express, and Database design (SQL & NoSQL). You will learn how to build secure authentication, design scalable database schemas, and expose robust RESTful APIs.
      </p>

      <div style="margin-bottom: 40px;">
        <h3 style="font-size:18px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">The Syllabus</h3>
        
        <div class="syllabus-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
          <div style="background:var(--bg2); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-weight:600; margin-bottom:4px;">Week 1: Server Logic</div>
            <div style="color:var(--text3); font-size:13px;">Node.js architecture, Event loop, and building your first Express.js server.</div>
          </div>
          <div style="background:var(--bg2); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-weight:600; margin-bottom:4px;">Week 2: Databases</div>
            <div style="color:var(--text3); font-size:13px;">Relational vs Non-Relational. Implementing MongoDB and PostgreSQL schemas.</div>
          </div>
          <div style="background:var(--bg2); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-weight:600; margin-bottom:4px;">Week 3: Security & Auth</div>
            <div style="color:var(--text3); font-size:13px;">JWTs, Session management, Password hashing (Bcrypt), and Route protection.</div>
          </div>
          <div style="background:var(--bg2); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-weight:600; margin-bottom:4px;">Week 4-6: Advanced APIs</div>
            <div style="color:var(--text3); font-size:13px;">WebSockets, Cloudinary integration, and deploying containers to AWS/DigitalOcean.</div>
          </div>
        </div>
      </div>

      <div style="background:var(--bg2); border:1px solid var(--border); border-radius:12px; padding:24px; margin-top:8px;">
        <h3 style="font-size:16px; margin-bottom:16px;">Register for Bootcamp 02</h3>
        <div class="action-btns" style="display:flex; gap:16px; flex-wrap:wrap;">
          <a href="https://wa.me/919943509981?text=I%20want%20to%20register%20for%20Pathfinder%20Bootcamp%202" target="_blank" style="flex:1; min-width:220px; display:flex; align-items:center; gap:12px; padding:16px 20px; background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.3); border-radius:8px; text-decoration:none; color:inherit; transition:all 0.2s;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:12px; font-weight:600; color:#8b5cf6;">WHATSAPP OVERRIDE</span>
              <span style="font-size:14px; font-weight:500;">Direct Msg to Core</span>
            </div>
          </a>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- BOOTCAMP 3 SECTION -->
<section id="bootcamp-3" class="bento-section container" style="margin-top: 40px; position: relative; z-index: 10; padding-bottom: 120px;">
  <div class="bento-grid" style="grid-template-columns: 1fr; grid-auto-rows: auto; max-width: 900px; margin: 0 auto;">
    
    <div class="bento-card fade-up" style="padding: 40px; border: 1px solid #ef4444; box-shadow: 0 0 40px rgba(239, 68, 68, 0.15); overflow: visible; height: auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="color:#ef4444; font-family:var(--font-m); font-weight:600; font-size:14px; letter-spacing: 2px; text-transform:uppercase; margin-bottom: 12px;">Bootcamp 03</div>
          <h2 class="course-title" style="font-family:var(--font-d); font-size: 36px; margin: 0; line-height: 1.2;">Applied Artificial Intelligence</h2>
        </div>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 8px 16px; border-radius: 4px; font-family:var(--font-m); font-size: 13px; font-weight: 600; white-space: nowrap;">
          Coming Soon
        </div>
      </div>

      <div class="course-meta" style="display:flex; gap: 40px; margin-bottom: 32px; flex-wrap: wrap; padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
        <div>
          <div style="color:var(--text3); font-size: 11px; text-transform:uppercase; letter-spacing:1px; margin-bottom: 6px;">Duration</div>
          <div style="font-weight: 600; font-size: 15px;">8 Weeks</div>
        </div>
        <div>
          <div style="color:var(--text3); font-size: 11px; text-transform:uppercase; letter-spacing:1px; margin-bottom: 6px;">Difficulty</div>
          <div style="font-weight: 600; font-size: 15px; display:flex; gap: 4px; align-items:center;">
            <div style="width:8px; height:8px; background:#ef4444; border-radius:50%;"></div>
            <div style="width:8px; height:8px; background:#ef4444; border-radius:50%;"></div>
            <div style="width:8px; height:8px; background:#ef4444; border-radius:50%;"></div>
            <span style="margin-left: 8px;">Advanced</span>
          </div>
        </div>
        <div>
          <div style="color:var(--text3); font-size: 11px; text-transform:uppercase; letter-spacing:1px; margin-bottom: 6px;">Outcome</div>
          <div style="font-weight: 600; font-size: 15px;">Train Custom Models</div>
        </div>
      </div>

      <p style="color:var(--text2); font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
        The frontier of computing. Bootcamp 03 strips away the hype and focuses on the math, logic, and implementation of Machine Learning. You will move past prompt engineering and learn how to implement RAG, fine-tune open-source models, and deploy neural networks into production apps.
      </p>

    </div>
  </div>
</section>
"""

content = re.sub(r'</section>\s*<!-- ══ FOOTER', r'</section>\n' + bootcamp_2_3_html + '\n<!-- ══ FOOTER', content)

with open('pathfinder.html', 'w') as f:
    f.write(content)

print("Done")
