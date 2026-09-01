import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Add redact text CSS and Script
css_to_add = """
<style>
/* CYBER EFFECTS */
.redact-text {
  background: #000;
  color: transparent;
  padding: 0 4px;
  border-radius: 2px;
  cursor: crosshair;
  transition: all 0.3s ease;
  user-select: none;
}
.redact-text:hover {
  background: rgba(0,0,0,0.05);
  color: #000;
  box-shadow: inset 0 -2px 0 #000;
}

/* Glitch Title */
.glitch-wrapper {
  position: relative;
  display: inline-block;
}
.glitch {
  position: relative;
}
.glitch::before, .glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}
.glitch::before {
  left: 2px;
  text-shadow: -1px 0 red;
  clip: rect(24px, 550px, 90px, 0);
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
}
.glitch::after {
  left: -2px;
  text-shadow: -1px 0 blue;
  clip: rect(85px, 550px, 140px, 0);
  animation: glitch-anim 2.5s infinite linear alternate-reverse;
}
@keyframes glitch-anim {
  0% { clip: rect(10px, 9999px, 31px, 0); }
  20% { clip: rect(65px, 9999px, 98px, 0); }
  40% { clip: rect(2px, 9999px, 12px, 0); }
  60% { clip: rect(89px, 9999px, 102px, 0); }
  80% { clip: rect(24px, 9999px, 55px, 0); }
  100% { clip: rect(72px, 9999px, 80px, 0); }
}
@keyframes glitch-anim-2 {
  0% { clip: rect(65px, 9999px, 100px, 0); }
  20% { clip: rect(3px, 9999px, 14px, 0); }
  40% { clip: rect(78px, 9999px, 88px, 0); }
  60% { clip: rect(12px, 9999px, 25px, 0); }
  80% { clip: rect(98px, 9999px, 108px, 0); }
  100% { clip: rect(34px, 9999px, 45px, 0); }
}
</style>
"""

html = html.replace('</head>', css_to_add + '\n</head>')

# 2. Add Redact classes to Mission text
mission_old = """Innovexa Hub was forged with a singular objective: to eradicate the gap between academic theory and elite industry execution. We are not a club. We are a collective of driven engineers, designers, and systems architects who believe in building the future by actually building it. We provide the capital, the network, and the environment. You provide the execution."""

mission_new = """Innovexa Hub was forged with a singular objective: to <span class="redact-text">eradicate the gap</span> between academic theory and elite industry execution. We are not a club. We are a <span class="redact-text">clandestine collective</span> of driven engineers, designers, and systems architects who believe in building the future by actually building it. We provide the capital, the network, and the environment. You provide the <span class="redact-text">execution</span>."""

html = html.replace(mission_old, mission_new)

# 3. Modify Hero Title to have glitch and typing
hero_old = """<h1 class="hero-headline fade-up delay-1">
      Engineering the <br>
      <span class="italic">next era</span> of builders.
    </h1>"""

hero_new = """<h1 class="hero-headline fade-up delay-1 glitch-wrapper" style="font-family: monospace;">
      <span class="glitch" data-text="Engineering the">Engineering the</span> <br>
      <span class="italic" style="color:#000;">next era</span> of builders.
    </h1>"""

html = html.replace(hero_old, hero_new)

# 4. Team Decrypt - add data-value attribute to arsenal-titles
def team_replacer(match):
    name = match.group(1)
    return f'<h3 class="arsenal-title decrypt-target" data-value="{name}" style="font-size:20px; font-family: monospace;">{name}</h3>'

html = re.sub(r'<h3 class="arsenal-title" style="font-size:20px;">(.*?)</h3>', team_replacer, html)

# 5. JS for decryption
js_to_add = """
  // Decrypt Effect for Team
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  document.querySelectorAll('.decrypt-target').forEach(el => {
    el.addEventListener('mouseover', event => {
      let iterations = 0;
      const originalText = event.target.dataset.value;
      
      clearInterval(event.target.interval);
      
      event.target.interval = setInterval(() => {
        event.target.innerText = originalText.split("")
          .map((letter, index) => {
            if(index < iterations) {
              return originalText[index];
            }
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("");
        
        if(iterations >= originalText.length){ 
          clearInterval(event.target.interval);
        }
        
        iterations += 1 / 3;
      }, 30);
    });
  });
"""

html = html.replace('// Randomize Core Team', js_to_add + '\n  // Randomize Core Team')

with open('index.html', 'w') as f:
    f.write(html)
print("Done")
