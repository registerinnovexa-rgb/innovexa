import re

with open('index.html', 'r') as f:
    content = f.read()

terminal_html = """
<!-- ══ INNOVEXA FORGE (TERMINAL) ═══════════════════════════════════════ -->
<section class="programs-section container fade-up" style="margin: 80px auto;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h2 style="font-size: 36px; font-family: var(--font-d); letter-spacing: -0.03em;">The <span class="italic" style="font-family:'Times New Roman',serif; font-style:italic; font-weight:400; opacity:0.8;">Innovexa Forge.</span></h2>
    <p style="color: var(--text-muted); font-size: 16px; max-width: 650px; margin: 16px auto 0; line-height: 1.6;">Our proprietary command center. The Forge is the digital infrastructure that powers the collective.</p>
  </div>
  
  <div style="max-width: 800px; margin: 0 auto; background: #0f111a; border-radius: 12px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.15); border: 1px solid #222; text-align: left;">
    <!-- Terminal Header -->
    <div style="background: #1a1d27; padding: 12px 20px; display: flex; align-items: center; border-bottom: 1px solid #2a2d3a;">
      <div style="display: flex; gap: 8px;">
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; border: 1px solid #e0443e;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; border: 1px solid #dea123;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; border: 1px solid #1aab29;"></div>
      </div>
      <div style="margin: 0 auto; color: #6b7280; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 1px;">innovexa@forge:~</div>
      <div style="width: 44px;"></div> <!-- Spacer to balance flex -->
    </div>
    
    <!-- Terminal Body -->
    <div style="padding: 40px; font-family: 'Courier New', monospace; color: #e5e7eb; font-size: 14px; line-height: 1.8;">
      <div style="margin-bottom: 24px;">
        <span style="color: #10b981;">innovexa@forge</span><span style="color: #fff;">:</span><span style="color: #3b82f6;">~</span>$ ./explain_forge.sh<br>
        <span style="color: #9ca3af;">[SYS.LOG] Extracting operational architecture...</span>
      </div>

      <div style="padding-left: 20px; border-left: 2px solid #374151; margin-bottom: 24px;">
        <div style="color: #f59e0b; font-weight: bold; margin-bottom: 4px;">[01] // SECURE_AUTH_PROTOCOL</div>
        <div style="color: #9ca3af; margin-bottom: 24px;">Access strictly locked behind Operative ID and an encrypted, time-sensitive OTP. Unauthorized access is impossible.</div>

        <div style="color: #f59e0b; font-weight: bold; margin-bottom: 4px;">[02] // THE_BOUNTY_MATRIX</div>
        <div style="color: #9ca3af; margin-bottom: 24px;">Operatives claim and execute open technical bounties. Deploy solutions, earn XP, and alter your rank within the collective in real-time.</div>

        <div style="color: #f59e0b; font-weight: bold; margin-bottom: 4px;">[03] // ATLAS_REPOSITORY</div>
        <div style="color: #9ca3af; margin-bottom: 24px;">Direct access to a centralized, high-signal knowledge graph containing architecture diagrams, tech stacks, and premium internal resources.</div>

        <div style="color: #f59e0b; font-weight: bold; margin-bottom: 4px;">[04] // LIVE_TELEMETRY</div>
        <div style="color: #9ca3af;">Real-time leaderboards, automated cryptographic certificate generation, and an active SOS protocol for rapid operational support.</div>
      </div>

      <div>
        <span style="color: #10b981;">innovexa@forge</span><span style="color: #fff;">:</span><span style="color: #3b82f6;">~</span>$ <span style="display:inline-block; width:8px; height:16px; background:#e5e7eb; vertical-align:middle; animation: blink 1s step-end infinite;"></span>
      </div>
    </div>
  </div>
  
  <style>
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  </style>

  <div style="text-align: center; margin-top: 40px;">
    <a href="forge.html" class="btn-outline" style="border-radius: 100px; font-size: 13px;">Execute Initialization (Open Forge)</a>
  </div>
</section>
"""

pattern = r'<!-- ══ INNOVEXA FORGE ═══════════════════════════════════════ -->.*?<!-- ══ GALLERY'
new_content = re.sub(pattern, terminal_html + "\n<!-- ══ GALLERY", content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(new_content)

print("Done")
