import re

with open('index.html', 'r') as f:
    content = f.read()

new_boot = """
<!-- ══ SYSTEM BOOT SEQUENCE ══════════════════════════════════════════════════ -->
<div id="boot-screen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #faf9f6; z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center; transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.8s;">
  
  <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
    <!-- Larger Logo with Cinematic Blur-to-Focus -->
    <img src="assets/innovexa-logo-new.png" alt="Innovexa Hub" style="height: 110px; opacity: 0; animation: logoFocus 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;" />
    
    <!-- Bold, Long Super Laser Line -->
    <div style="margin-top: 56px; width: 400px; height: 4px; background: rgba(0,0,0,0.06); overflow: hidden; position: relative; opacity: 0; animation: fadeUp 1s forwards 0.8s; border-radius: 4px;">
      
      <!-- Base black loading fill -->
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #111; transform-origin: left; transform: scaleX(0); animation: loadExpand 3s cubic-bezier(0.8, 0, 0.2, 1) forwards 1s;"></div>
      
      <!-- Glowing green laser head that shoots across -->
      <div style="position: absolute; top: 0; left: 0; width: 120px; height: 100%; background: linear-gradient(90deg, transparent, #10b981, #fff); box-shadow: 0 0 15px 3px rgba(16, 185, 129, 0.9); transform: translateX(-120px); animation: laserScan 3s cubic-bezier(0.8, 0, 0.2, 1) forwards 1s;"></div>
      
    </div>

    <!-- Partner Logos -->
    <div style="margin-top: 48px; display: flex; align-items: center; justify-content: center; gap: 40px; opacity: 0; animation: fadeUp 1s forwards 1.4s;">
      
      <!-- Yenepoya -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <span style="font-family: 'Courier New', monospace; font-size: 10px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 2px;">At</span>
        <img src="assets/yenepoya-logo.svg" alt="Yenepoya University" style="height: 48px; filter: grayscale(100%); opacity: 0.8;">
        <span style="font-family: 'Courier New', monospace; font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Bangalore</span>
      </div>

      <div style="width: 1px; height: 50px; background: rgba(0,0,0,0.1);"></div>

      <!-- Kalvium -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <span style="font-family: 'Courier New', monospace; font-size: 10px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 2px;">Industrial Partner</span>
        <div style="height: 48px; display: flex; align-items: center;">
          <img src="assets/kalvium-logo.png" alt="Kalvium" style="height: 24px; filter: grayscale(100%); opacity: 0.8;">
        </div>
        <span style="font-family: 'Courier New', monospace; font-size: 9px; color: transparent; user-select: none;">Spacer</span> <!-- alignment spacer -->
      </div>
      
    </div>

  </div>
</div>

<style>
  @keyframes logoFocus {
    0% { opacity: 0; transform: scale(1.08); filter: blur(12px); }
    100% { opacity: 1; transform: scale(1); filter: blur(0); }
  }
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes loadExpand {
    0% { transform: scaleX(0); }
    40% { transform: scaleX(0.6); }
    100% { transform: scaleX(1); }
  }
  @keyframes laserScan {
    0% { transform: translateX(-120px); }
    40% { transform: translateX(180px); } 
    100% { transform: translateX(400px); }
  }
</style>

<script>
  document.body.style.overflow = 'hidden';
  window.addEventListener("DOMContentLoaded", () => {
    const bootScreen = document.getElementById('boot-screen');
    
    if (sessionStorage.getItem('innovexa_booted')) {
      bootScreen.style.display = 'none';
      document.body.style.overflow = '';
      return;
    }
    
    sessionStorage.setItem('innovexa_booted', 'true');

    setTimeout(() => {
      bootScreen.style.opacity = '0';
      bootScreen.style.visibility = 'hidden';
      document.body.style.overflow = '';
    }, 4500); 
  });
</script>
"""

old_boot_pattern = r'<!-- ══ SYSTEM BOOT SEQUENCE ══════════════════════════════════════════════════ -->.*?</script>\n'

content = re.sub(old_boot_pattern, new_boot, content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
