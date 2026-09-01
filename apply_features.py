import re

with open('index.html', 'r') as f:
    content = f.read()

# 1. Add Custom Scrollbar Styles
scrollbar_css = """
<style>
  /* 1. Custom System Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #faf9f6;
  }
  ::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #10b981;
  }
</style>
</head>"""
content = content.replace('</head>', scrollbar_css)

# 2. Add Glassmorphism Sticky Navbar
old_nav = '<nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">'
new_nav = '<nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation" style="position: sticky; top: 0; z-index: 1000; background: rgba(250, 249, 246, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.05);">'
content = content.replace(old_nav, new_nav)

# 5. Add Web Audio API UI Click Sound
audio_script = """
<!-- 5. UI Hover Sounds -->
<script>
  window.addEventListener("DOMContentLoaded", () => {
    let audioCtx = null;
    
    function playHoverSound() {
      // Initialize on first interaction to bypass browser autoplay blocks
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Futuristic subtle "tick" sound profile
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);
      
      // Keep it very quiet (0.015) so it's not annoying
      gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    }

    // Attach to important interactive elements
    const interactiveElements = document.querySelectorAll('nav a, .btn-magnetic, .ide-file, .ide-folder, .comm-btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', playHoverSound);
    });
  });
</script>
</body>"""
content = content.replace('</body>', audio_script)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
