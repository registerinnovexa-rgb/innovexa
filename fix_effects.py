import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Revert Hero Glitch
hero_glitch = """<h1 class="hero-headline fade-up delay-1 glitch-wrapper" style="font-family: monospace;">
      <span class="glitch" data-text="Engineering the">Engineering the</span> <br>
      <span class="italic" style="color:#000;">next era</span> of builders.
    </h1>"""

hero_normal = """<h1 class="hero-headline fade-up delay-1">
      Engineering the <br>
      <span class="italic">next era</span> of builders.
    </h1>"""

html = html.replace(hero_glitch, hero_normal)

# Remove glitch CSS
glitch_css_pattern = r'/\* Glitch Title \*/.*?} \n}'
html = re.sub(r'/\* Glitch Title \*/.*?@keyframes glitch-anim-2 \{.*?\}\n\}', '', html, flags=re.DOTALL)
html = re.sub(r'/\* Glitch Title \*/.*?(?=</style>)', '', html, flags=re.DOTALL)

# 2. Fix decrypt JS
bad_js = """  // Decrypt Effect for Team
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
  });"""

good_js = """  // Decrypt Effect for Team
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  document.querySelectorAll('.arsenal-card').forEach(card => {
    const target = card.querySelector('.decrypt-target');
    if(!target) return;
    
    card.addEventListener('mouseenter', () => {
      let iterations = 0;
      const originalText = target.dataset.value;
      
      clearInterval(target.interval);
      
      target.interval = setInterval(() => {
        target.innerText = originalText.split("")
          .map((letter, index) => {
            if(index < iterations) {
              return originalText[index];
            }
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("");
        
        if(iterations >= originalText.length){ 
          clearInterval(target.interval);
        }
        
        iterations += 1 / 3;
      }, 30);
    });
  });"""

html = html.replace(bad_js, good_js)

with open('index.html', 'w') as f:
    f.write(html)
print("Done")
