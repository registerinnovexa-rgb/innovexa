import re

with open('index.html', 'r') as f:
    html = f.read()

# Pattern to find the section to replace
pattern = r'(<!-- ══ SKILL TREE VISUALIZER \(CONSOLE STORY\) ════════════════════════════════════════ -->.*?)</section>'

replacement = """<!-- ══ NEON STEPPER (THE PROGRESSION) ════════════════════════════════════════ -->
<section class="roadmap-section container fade-up" style="margin-top:80px; margin-bottom: 80px;">
  <div class="roadmap-header" style="text-align: center; margin-bottom: 60px;">
    <h2>The <span class="italic" style="font-family:'Times New Roman',serif; font-style:italic; font-weight:400; opacity:0.8;">Progression.</span></h2>
    <p style="color:var(--text3); font-size:16px; margin-top:16px; max-width: 600px; margin-left: auto; margin-right: auto;">How we forge operatives from zero to production-ready engineers.</p>
  </div>

  <div style="position: relative; max-width: 600px; margin: 0 auto; padding-left: 40px; min-height: 400px;">
    <!-- The glowing line track -->
    <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: rgba(0,0,0,0.1);"></div>
    <!-- The active glowing line -->
    <div id="neon-line" style="position: absolute; left: 0; top: 0; width: 2px; height: 0%; background: #111; transition: height 0.6s cubic-bezier(0.22, 1, 0.36, 1);"></div>

    <div class="stepper-item" data-step="1" style="position: relative; margin-bottom: 56px; opacity: 0.3; transform: translateX(-10px); transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);">
      <div class="stepper-dot" style="position: absolute; left: -45px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 2px solid #ccc; transition: all 0.4s;"></div>
      <h3 style="font-size: 20px; font-family: var(--font-d); margin-bottom: 8px;">Phase 01: INITIATE</h3>
      <p style="color: var(--text3); font-size: 15px; line-height: 1.6;">Establishing baseline. Mastering Git, HTML/CSS, Vanilla JS, and core web fundamentals. Securing the bedrock of your engineering skills.</p>
    </div>
    
    <div class="stepper-item" data-step="2" style="position: relative; margin-bottom: 56px; opacity: 0.3; transform: translateX(-10px); transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);">
      <div class="stepper-dot" style="position: absolute; left: -45px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 2px solid #ccc; transition: all 0.4s;"></div>
      <h3 style="font-size: 20px; font-family: var(--font-d); margin-bottom: 8px;">Phase 02: PATHFINDER</h3>
      <p style="color: var(--text3); font-size: 15px; line-height: 1.6;">Full-stack architecture compiled. Building dynamic applications using React.js, Node.js, REST APIs, and MongoDB.</p>
    </div>
    
    <div class="stepper-item" data-step="3" style="position: relative; margin-bottom: 56px; opacity: 0.3; transform: translateX(-10px); transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);">
      <div class="stepper-dot" style="position: absolute; left: -45px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 2px solid #ccc; transition: all 0.4s;"></div>
      <h3 style="font-size: 20px; font-family: var(--font-d); margin-bottom: 8px;">Phase 03: ARCHITECT</h3>
      <p style="color: var(--text3); font-size: 15px; line-height: 1.6;">Deploying scale systems. Mastering Docker, integrating Applied AI models, and utilizing Cloud infrastructure.</p>
    </div>

    <div class="stepper-item" data-step="4" style="position: relative; opacity: 0.3; transform: translateX(-10px); transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);">
      <div class="stepper-dot" style="position: absolute; left: -45px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 2px solid #ccc; transition: all 0.4s;"></div>
      <h3 id="final-status" style="font-size: 20px; font-family: var(--font-d); margin-bottom: 8px; transition: color 0.4s;">STATUS: PRODUCTION-READY</h3>
      <p style="color: var(--text3); font-size: 15px; line-height: 1.6;">System design parameters met. Operative is fully prepared to architect, deploy, and scale real-world applications.</p>
    </div>
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const neonLine = document.getElementById('neon-line');
      const stepperItems = document.querySelectorAll('.stepper-item');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const step = parseInt(entry.target.getAttribute('data-step'));
            
            // Activate the item
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
            
            // Activate the dot
            const dot = entry.target.querySelector('.stepper-dot');
            dot.style.background = '#111';
            dot.style.borderColor = '#111';
            
            // Special color for final step
            if(step === 4) {
               entry.target.querySelector('#final-status').style.color = '#0070f3';
               dot.style.background = '#0070f3';
               dot.style.borderColor = '#0070f3';
               dot.style.boxShadow = '0 0 12px rgba(0, 112, 243, 0.4)';
               neonLine.style.background = '#0070f3';
               neonLine.style.boxShadow = '0 0 12px rgba(0, 112, 243, 0.4)';
            }
            
            // Update line height
            const percentages = [0, 10, 45, 80, 100];
            const currentHeight = parseInt(neonLine.style.height || '0');
            if (percentages[step] > currentHeight) {
                neonLine.style.height = percentages[step] + '%';
            }
          }
        });
      }, { threshold: 0.7, rootMargin: '0px 0px -15% 0px' });
      
      stepperItems.forEach(item => observer.observe(item));
    });
  </script>
</section>"""

new_html = re.sub(pattern, replacement, html, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(new_html)

print("Replacement complete.")
