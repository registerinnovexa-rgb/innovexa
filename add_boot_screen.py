import re

with open('index.html', 'r') as f:
    content = f.read()

boot_html = """
<!-- ══ SYSTEM BOOT SEQUENCE ══════════════════════════════════════════════════ -->
<div id="boot-screen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0a0a0a; z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #10b981; font-family: 'Courier New', monospace; font-size: 14px; padding: 24px; transition: opacity 0.6s ease, visibility 0.6s ease;">
  <div id="boot-text" style="width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 8px;"></div>
</div>

<script>
  // Prevent scrolling during boot
  document.body.style.overflow = 'hidden';

  window.addEventListener("DOMContentLoaded", () => {
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.getElementById('boot-text');
    
    // Only play once per session so it doesn't annoy users when they refresh
    if (sessionStorage.getItem('innovexa_booted')) {
      bootScreen.style.display = 'none';
      document.body.style.overflow = '';
      return;
    }
    
    // Mark as booted for this session
    sessionStorage.setItem('innovexa_booted', 'true');

    const lines = [
      "> SYSTEM.INIT: INVX-CORE-v2.0",
      "> AUTHENTICATING OPERATIVE PROTOCOLS...",
      "> LOADING ATLAS REPOSITORY...",
      "> SYNCING BOUNTY MATRIX...",
      "> ALL SYSTEMS NOMINAL. ACCESS GRANTED."
    ];

    let currentLine = 0;
    
    function typeLine() {
      if (currentLine >= lines.length) {
        setTimeout(() => {
          bootScreen.style.opacity = '0';
          bootScreen.style.visibility = 'hidden';
          document.body.style.overflow = '';
        }, 800);
        return;
      }
      
      const div = document.createElement('div');
      if (currentLine === lines.length - 1) {
        div.style.color = '#3b82f6'; // Last line blue for success
        div.style.fontWeight = 'bold';
      }
      bootText.appendChild(div);
      
      let charIndex = 0;
      const interval = setInterval(() => {
        div.textContent += lines[currentLine][charIndex];
        charIndex++;
        if (charIndex >= lines[currentLine].length) {
          clearInterval(interval);
          currentLine++;
          setTimeout(typeLine, 200); // 200ms delay between lines
        }
      }, 15); // 15ms per character typing speed
    }

    setTimeout(typeLine, 300); // Wait 300ms before starting
  });
</script>
"""

content = content.replace('<body>', '<body>\n' + boot_html)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
