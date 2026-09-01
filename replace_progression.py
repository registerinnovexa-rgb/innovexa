import re

with open('index.html', 'r') as f:
    content = f.read()

progression_html = """
<!-- ══ SKILL TREE VISUALIZER (CONSOLE STORY) ════════════════════════════════════════ -->
<section class="roadmap-section container fade-up" style="margin-top:80px; margin-bottom: 80px;">
  <div class="roadmap-header" style="text-align: center; margin-bottom: 40px;">
    <h2>The <span class="italic" style="font-family:'Times New Roman',serif; font-style:italic; font-weight:400; opacity:0.8;">Progression.</span></h2>
    <p style="color:var(--text3); font-size:16px; margin-top:16px; max-width: 600px; margin-left: auto; margin-right: auto;">How we forge operatives from zero to production-ready engineers.</p>
  </div>

  <div style="background: #0a0a0a; border-radius: 12px; border: 1px solid #222; max-width: 800px; margin: 0 auto; padding: 40px; font-family: 'Courier New', monospace; font-size: 15px; line-height: 1.8; color: #a3a3a3; box-shadow: 0 20px 40px rgba(0,0,0,0.5); position: relative; text-align: left;">
    
    <div id="console-story" style="min-height: 380px;">
       <!-- JavaScript will type this out -->
    </div>
    
  </div>
  
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const scriptLines = [
        { text: "> init_operative_training()", color: "#10b981", delay: 400 },
        { text: "  [SYS] Establishing baseline...", color: "#6b7280", delay: 300 },
        { text: "> Phase 01: INITIATE", color: "#f59e0b", delay: 400 },
        { text: "  Installing dependencies: [Git, HTML/CSS, Vanilla JS]...", color: "#d1d5db", delay: 500 },
        { text: "  [OK] Bedrock fundamentals secured.", color: "#10b981", delay: 300 },
        { text: " ", color: "transparent", delay: 100 },
        { text: "> Phase 02: PATHFINDER", color: "#f59e0b", delay: 400 },
        { text: "  Upgrading frameworks: [React.js, Node.js, REST APIs, MongoDB]...", color: "#d1d5db", delay: 500 },
        { text: "  [OK] Full-stack architecture compiled.", color: "#10b981", delay: 300 },
        { text: " ", color: "transparent", delay: 100 },
        { text: "> Phase 03: ARCHITECT", color: "#f59e0b", delay: 400 },
        { text: "  Deploying scale systems: [Docker, Applied AI, Cloud]...", color: "#d1d5db", delay: 500 },
        { text: "  [OK] System design parameters met.", color: "#10b981", delay: 500 },
        { text: " ", color: "transparent", delay: 100 },
        { text: "> STATUS: OPERATIVE PRODUCTION-READY", color: "#3b82f6", delay: 2000, bold: true }
      ];

      const consoleDiv = document.getElementById('console-story');
      let currentLine = 0;
      let isTyping = false;

      function typeLine() {
        if (currentLine >= scriptLines.length) {
          // Add blinking cursor at the end
          const cursor = document.createElement('div');
          cursor.innerHTML = `<span style="color:#fff; animation: blink 1s step-end infinite;">> _</span>`;
          consoleDiv.appendChild(cursor);
          return;
        }

        const line = scriptLines[currentLine];
        const div = document.createElement('div');
        div.style.color = line.color;
        if(line.bold) div.style.fontWeight = 'bold';
        consoleDiv.appendChild(div);
        
        let charIndex = 0;
        const typingInterval = setInterval(() => {
          div.textContent += line.text[charIndex] || " ";
          charIndex++;
          if (charIndex >= line.text.length) {
            clearInterval(typingInterval);
            currentLine++;
            setTimeout(typeLine, line.delay);
          }
        }, 15); // Fast typing speed
      }

      // Start when scrolled into view
      const observer = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting && !isTyping) {
          isTyping = true;
          typeLine();
        }
      }, { threshold: 0.5 });
      
      if(consoleDiv) observer.observe(consoleDiv);
    });
  </script>
</section>
"""

old_progression_pattern = r'<!-- ══ SKILL TREE VISUALIZER ════════════════════════════════════════ -->.*?</section>'
content = re.sub(old_progression_pattern, progression_html, content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
