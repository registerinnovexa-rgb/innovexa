import re

with open('index.html', 'r') as f:
    html = f.read()

new_section = """
<!-- ══ DATA PACKET CHALLENGE MINI-GAME BANNER ═════════════════════════════════════════════ -->
<section class="fade-up" style="margin: 80px auto; max-width: 1200px; padding: 0 24px;">
  <div style="background: linear-gradient(145deg, #0f172a, #020617); border-radius: 24px; border: 1px solid rgba(59,130,246,0.3); padding: 56px 40px; position: relative; overflow: hidden; display: flex; flex-direction: row; align-items: center; justify-content: space-between; box-shadow: 0 20px 50px rgba(0,0,0,0.5); gap: 40px; flex-wrap: wrap;">
    
    <!-- Grid Overlay -->
    <div style="position: absolute; top:0; left:0; width:100%; height:100%; background-image: radial-gradient(rgba(59,130,246,0.2) 1px, transparent 1px); background-size: 24px 24px; opacity: 0.5; pointer-events: none;"></div>

    <div style="z-index: 2; position: relative; max-width: 500px;">
      <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.4); padding:6px 12px; border-radius:20px; color:#60a5fa; font-family:var(--font-m); font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:24px;">
        <span style="width:8px; height:8px; background:#60a5fa; border-radius:50%; box-shadow:0 0 10px #60a5fa; animation: pulse 2s infinite;"></span> Interactive Protocol
      </div>
      
      <h2 style="font-size: 42px; font-family: var(--font-d); color: #fff; line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.03em;">Route the <br/><span style="color:#60a5fa; font-style:italic; font-family:'Times New Roman',serif; font-weight:400;">Data Packet.</span></h2>
      
      <p style="font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 32px; font-family: var(--font-m);">
        Test your algorithmic thinking. Construct a logical sequence to bypass the firewalls and deliver the payload to the mainframe in our exclusive Operative mini-game.
      </p>

      <a href="packet-route" style="display:inline-flex; align-items:center; gap:12px; background:#3b82f6; color:#fff; padding:16px 32px; border-radius:12px; font-weight:600; text-decoration:none; transition:all 0.3s ease; box-shadow:0 10px 20px rgba(59,130,246,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px rgba(59,130,246,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px rgba(59,130,246,0.3)';">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Execute Sequence
      </a>
    </div>

    <!-- Mini-game visual element -->
    <div style="z-index: 2; position: relative; flex: 1; min-width: 300px; display: flex; justify-content: center; align-items: center;">
      <div style="width: 100%; max-width: 320px; aspect-ratio: 1; background: rgba(15,23,42,0.8); border: 1px solid rgba(59,130,246,0.4); border-radius: 16px; position: relative; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); overflow: hidden; display:grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); gap: 4px; padding: 16px;">
        <!-- Generating a 5x5 grid with some active cells -->
"""

# Grid generation for the visual element
for i in range(25):
    if i == 2:
        new_section += '        <div style="background:#3b82f6; border-radius:4px; box-shadow:0 0 10px #3b82f6;"></div>\n'
    elif i in [7, 12, 13, 14, 19, 24]:
        new_section += '        <div style="background:rgba(59,130,246,0.4); border-radius:4px;"></div>\n'
    elif i in [6, 11, 16, 17, 8, 9, 3]:
        new_section += '        <div style="background:rgba(239,68,68,0.2); border-radius:4px; border:1px solid rgba(239,68,68,0.4);"></div>\n'
    else:
        new_section += '        <div style="background:rgba(255,255,255,0.02); border-radius:4px;"></div>\n'

new_section += """      </div>
      
      <!-- Floating code block -->
      <div style="position: absolute; bottom: -20px; left: -20px; background: #020617; border: 1px solid #333; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #a8b2d1; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transform: rotate(-5deg);">
        <span style="color:#c678dd;">function</span> <span style="color:#61afef;">routePacket</span>() {<br/>
        &nbsp;&nbsp;<span style="color:#56b6c2;">move</span>(<span style="color:#98c379;">'down'</span>, <span style="color:#d19a66;">2</span>);<br/>
        &nbsp;&nbsp;<span style="color:#56b6c2;">move</span>(<span style="color:#98c379;">'right'</span>, <span style="color:#d19a66;">3</span>);<br/>
        }
      </div>
    </div>

    <!-- Decorative Elements -->
    <svg style="position:absolute; right:-50px; bottom:-50px; opacity:0.1; width:300px; height:300px; pointer-events:none;" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  </div>
</section>
"""

html = html.replace('</section>\n\n\n<!-- ══ ROADMAP (FILE SYSTEM IDE) ══════════════════════════════════════════════════ -->', f'</section>\n\n{new_section}\n<!-- ══ ROADMAP (FILE SYSTEM IDE) ══════════════════════════════════════════════════ -->')

with open('index.html', 'w') as f:
    f.write(html)

print("✅ Added mini-game section")
