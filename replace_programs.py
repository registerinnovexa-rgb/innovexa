import re

with open('index.html', 'r') as f:
    content = f.read()

forge_html = """
<!-- ══ INNOVEXA FORGE ═══════════════════════════════════════ -->
<section class="programs-section container fade-up" style="margin: 80px auto;">
  <div style="text-align: center; margin-bottom: 60px;">
    <h2 style="font-size: 36px; font-family: var(--font-d); letter-spacing: -0.03em;">The <span class="italic" style="font-family:'Times New Roman',serif; font-style:italic; font-weight:400; opacity:0.8;">Innovexa Forge.</span></h2>
    <p style="color: var(--text-muted); font-size: 16px; max-width: 650px; margin: 16px auto 0; line-height: 1.6;">Our custom-built, proprietary command center. The Forge is the digital infrastructure that powers the collective, strictly accessible only to verified operatives.</p>
  </div>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
    
    <!-- Feature 1 -->
    <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 24px rgba(0,0,0,0.03)';">
      <div style="font-size: 32px; margin-bottom: 24px;">🔐</div>
      <h3 style="font-size: 20px; margin: 0 0 12px; font-family: var(--font-m); font-weight: 600; letter-spacing:-0.02em;">Secure Initialization</h3>
      <p style="color: var(--text-muted); font-size: 14px; line-height: 1.7; margin: 0;">Access is locked behind your unique Operative ID and an encrypted, time-sensitive OTP protocol, ensuring absolute exclusivity.</p>
    </div>

    <!-- Feature 2 -->
    <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 24px rgba(0,0,0,0.03)';">
      <div style="font-size: 32px; margin-bottom: 24px;">🎯</div>
      <h3 style="font-size: 20px; margin: 0 0 12px; font-family: var(--font-m); font-weight: 600; letter-spacing:-0.02em;">Bounty Matrix</h3>
      <p style="color: var(--text-muted); font-size: 14px; line-height: 1.7; margin: 0;">Operatives claim and execute open technical bounties. Successfully deployed tasks yield XP, actively altering your rank in the collective.</p>
    </div>

    <!-- Feature 3 -->
    <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 24px rgba(0,0,0,0.03)';">
      <div style="font-size: 32px; margin-bottom: 24px;">🗄️</div>
      <h3 style="font-size: 20px; margin: 0 0 12px; font-family: var(--font-m); font-weight: 600; letter-spacing:-0.02em;">Atlas Repository</h3>
      <p style="color: var(--text-muted); font-size: 14px; line-height: 1.7; margin: 0;">Direct access to a centralized, high-signal knowledge graph containing architecture diagrams, tech stacks, and premium internal resources.</p>
    </div>

    <!-- Feature 4 -->
    <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 24px rgba(0,0,0,0.03)';">
      <div style="font-size: 32px; margin-bottom: 24px;">📊</div>
      <h3 style="font-size: 20px; margin: 0 0 12px; font-family: var(--font-m); font-weight: 600; letter-spacing:-0.02em;">Live Telemetry</h3>
      <p style="color: var(--text-muted); font-size: 14px; line-height: 1.7; margin: 0;">Real-time leaderboards, automated certificate generation, and an active SOS protocol for rapid operational support.</p>
    </div>

  </div>
  
  <div style="text-align: center; margin-top: 40px;">
    <a href="forge.html" class="btn-outline" style="border-radius: 100px; font-size: 13px;">Access the Forge</a>
  </div>
</section>
"""

# Find the section we just added and replace it
pattern = r'<!-- ══ UPCOMING PROGRAMS ═══════════════════════════════════════ -->.*?<!-- ══ GALLERY'
new_content = re.sub(pattern, forge_html + "\n<!-- ══ GALLERY", content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(new_content)

print("Done")
