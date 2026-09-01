import re

with open('index.html', 'r') as f:
    content = f.read()

cta_html = """
<!-- ══ CTA (CLASSIFIED TERMINAL) ══════════════════════════════════════════════════════ -->
<section class="fade-up" style="background: #0a0a0a; border-top: 1px solid #222; border-bottom: 1px solid #222; padding: 100px 24px; text-align: center; margin: 80px 0 0; position: relative; overflow: hidden;">
  <!-- Radar sweep background -->
  <div style="position: absolute; top: -100%; left: -50%; width: 200%; height: 300%; background: conic-gradient(from 0deg, transparent 70%, rgba(16, 185, 129, 0.04) 100%); animation: radar 4s linear infinite; pointer-events: none;"></div>
  
  <div class="cta-inner" style="position: relative; z-index: 10; max-width: 800px; margin: 0 auto;">
    <div style="font-family: 'Courier New', monospace; color: #f59e0b; font-size: 12px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 24px;">[ STATUS: RECRUITMENT OPEN ]</div>
    
    <h2 class="cta-title" style="color: #fff; font-size: clamp(40px, 6vw, 72px); font-family: var(--font-d); letter-spacing: -0.03em; margin-bottom: 24px;">
      Begin your <span class="italic" style="color: #9ca3af; font-weight: 300; font-style: italic; font-family:'Times New Roman',serif;">trajectory.</span>
    </h2>
    
    <p style="color: #6b7280; font-size: 17px; max-width: 600px; margin: 0 auto 48px; line-height: 1.6;">Join an elite cohort of builders shaping the digital frontier. Batch 2026 applications are closing soon.</p>
    
    <!-- Execution Command CTA -->
    <a href="register.html" style="display: inline-flex; align-items: center; justify-content: space-between; background: #111827; border: 1px solid #374151; padding: 18px 24px; border-radius: 8px; text-decoration: none; min-width: 320px; transition: all 0.3s ease; box-shadow: 0 10px 40px rgba(0,0,0,0.6);" onmouseover="this.style.background='#1f2937'; this.style.borderColor='#10b981'; this.querySelector('.cursor').style.opacity='1'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='#111827'; this.style.borderColor='#374151'; this.style.transform='translateY(0)';">
      <div style="display: flex; align-items: center; gap: 12px; font-family: 'Courier New', monospace; font-size: 15px;">
        <span style="color: #10b981;">root@hub:~#</span>
        <span style="color: #e5e7eb; font-weight: bold;">./init_membership.sh</span>
        <span class="cursor" style="display: inline-block; width: 8px; height: 16px; background: #10b981; animation: blink 1s step-end infinite; opacity: 0.5; transition: opacity 0.3s;"></span>
      </div>
      <div style="font-family: 'Courier New', monospace; font-size: 13px; color: #d1d5db; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px; font-weight: bold;">₹599</div>
    </a>
  </div>
  
  <style>
    @keyframes radar { 100% { transform: rotate(360deg); } }
  </style>
</section>
"""

old_cta_pattern = r'<!-- ══ CTA ══════════════════════════════════════════════════════ -->.*?</section>'
content = re.sub(old_cta_pattern, cta_html, content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
