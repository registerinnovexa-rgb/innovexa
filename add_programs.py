import re

with open('index.html', 'r') as f:
    content = f.read()

programs_html = """
<!-- ══ UPCOMING PROGRAMS ═══════════════════════════════════════ -->
<section class="programs-section container fade-up" style="margin: 80px auto;">
  <div style="text-align: center; margin-bottom: 50px;">
    <h2 style="font-size: 36px; font-family: var(--font-d); letter-spacing: -0.03em;">Upcoming <span class="italic" style="font-family:'Times New Roman',serif; font-style:italic; font-weight:400; opacity:0.8;">Operations.</span></h2>
    <p style="color: var(--text-muted); font-size: 16px; max-width: 600px; margin: 16px auto 0; line-height: 1.6;">The next phase of execution. Prepare for high-stakes technical engagements, rigorous bootcamps, and puzzle-based decrypt challenges.</p>
  </div>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
    
    <!-- Elite Tech Hunt -->
    <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 24px rgba(0,0,0,0.03)';">
      <div style="display:inline-block; padding:6px 14px; background:#f3f4f6; color:#111827; font-size:11px; font-weight:700; border-radius:100px; letter-spacing:1px; margin-bottom:24px;">EVENT / IN-PERSON</div>
      <h3 style="font-size: 24px; margin: 0 0 16px; font-family: var(--font-m); font-weight: 600; letter-spacing:-0.02em;">Elite Tech Hunt</h3>
      <p style="color: var(--text-muted); font-size: 15px; line-height: 1.7; margin: 0 0 32px;">An immersive, puzzle-based technical engagement designed to test logic, teamwork, and binary riddle decryption under high-pressure constraints.</p>
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 24px;">
        <div style="font-size: 13px; color: #111; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Status</div>
        <div style="font-size: 13px; color: #f59e0b; font-weight: 600; background: #fef3c7; padding: 4px 12px; border-radius: 100px;">Classified</div>
      </div>
    </div>

    <!-- Innovexa Unlock -->
    <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 24px rgba(0,0,0,0.03)';">
      <div style="display:inline-block; padding:6px 14px; background:#f3f4f6; color:#111827; font-size:11px; font-weight:700; border-radius:100px; letter-spacing:1px; margin-bottom:24px;">CHALLENGE / DIGITAL</div>
      <h3 style="font-size: 24px; margin: 0 0 16px; font-family: var(--font-m); font-weight: 600; letter-spacing:-0.02em;">Innovexa Unlock</h3>
      <p style="color: var(--text-muted); font-size: 15px; line-height: 1.7; margin: 0 0 32px;">A high-signal digital challenge requiring rapid problem-solving, algorithmic thinking, and precise execution to bypass advanced security layers.</p>
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 24px;">
        <div style="font-size: 13px; color: #111; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Status</div>
        <div style="font-size: 13px; color: #3b82f6; font-weight: 600; background: #dbeafe; padding: 4px 12px; border-radius: 100px;">Pending Deployment</div>
      </div>
    </div>

    <!-- Hackfusion -->
    <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 24px rgba(0,0,0,0.03)';">
      <div style="display:inline-block; padding:6px 14px; background:#f3f4f6; color:#111827; font-size:11px; font-weight:700; border-radius:100px; letter-spacing:1px; margin-bottom:24px;">HACKATHON / EXTERNAL</div>
      <h3 style="font-size: 24px; margin: 0 0 16px; font-family: var(--font-m); font-weight: 600; letter-spacing:-0.02em;">Hackfusion</h3>
      <p style="color: var(--text-muted); font-size: 15px; line-height: 1.7; margin: 0 0 32px;">A grueling cross-college technical hackathon and summit pushing the limits of systems architecture, web3, and applied AI execution.</p>
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 24px;">
        <div style="font-size: 13px; color: #111; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Status</div>
        <div style="font-size: 13px; color: #10b981; font-weight: 600; background: #d1fae5; padding: 4px 12px; border-radius: 100px;">In Preparation</div>
      </div>
    </div>

  </div>
</section>

"""

new_content = content.replace("<!-- ══ GALLERY", programs_html + "<!-- ══ GALLERY")

with open('index.html', 'w') as f:
    f.write(new_content)

print("Done")
