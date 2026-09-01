import re

with open('pathfinder.html', 'r') as f:
    content = f.read()

alignment_html = """
<!-- ══ ALIGNMENT PROTOCOL ══════════════════════════════════════════════════════ -->
<section class="fade-up delay-4" style="padding: 0 24px 80px; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 20; margin-top: -60px;">
  
  <div id="alignment-card" style="width: 100%; max-width: 900px; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 30px 60px rgba(0, 112, 243, 0.1); border: 1px solid rgba(0,0,0,0.06); transition: all 0.3s ease;">
    
    <!-- Header / Progress -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0070f3; background: rgba(0,112,243,0.1); padding: 6px 12px; border-radius: 20px;">Alignment Protocol</span>
      </div>
      <span id="alignment-progress" style="font-size: 12px; color: #888; font-weight: 600; font-family: var(--font-m);">QUESTION 1 / 4</span>
    </div>

    <!-- Question Container -->
    <div id="alignment-question-container">
      <h4 id="alignment-question" style="font-family: var(--font-d); font-size: 24px; color: #111; line-height: 1.4; margin-bottom: 32px; font-weight: 500;">
        How do you prefer to solve problems?
      </h4>

      <div id="alignment-options" style="display: grid; grid-template-columns: 1fr; gap: 12px;">
        <!-- Injected via JS -->
      </div>
    </div>

    <!-- Result Container (Hidden) -->
    <div id="alignment-result" style="display: none; text-align: center; padding: 20px 0;">
      <div style="width: 60px; height: 60px; background: rgba(16,185,129,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h4 style="font-family: var(--font-d); font-size: 28px; color: #111; margin-bottom: 16px;">Profile Analyzed</h4>
      <p style="color: #666; font-size: 16px; margin-bottom: 32px; line-height: 1.6;">Based on your psychological and technical preferences, your optimal operational path is:</p>
      
      <div id="alignment-recommendation" style="background: #faf9f6; border: 1px solid rgba(0,0,0,0.05); padding: 24px; border-radius: 12px; margin-bottom: 32px; display: inline-block; text-align: left;">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0070f3; margin-bottom: 8px; letter-spacing: 1px;">Recommended Bootcamp</div>
        <div id="alignment-bootcamp-name" style="font-family: var(--font-d); font-size: 24px; font-weight: 600; color: #111;">Frontend Engineering</div>
      </div>
      
      <div>
        <button onclick="document.getElementById('bootcamp-1').scrollIntoView({behavior: 'smooth'})" style="background: #0070f3; color: white; border: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; box-shadow: 0 10px 20px rgba(0,112,243,0.3);" onmouseover="this.style.background='#0051a8';" onmouseout="this.style.background='#0070f3';">View Recommended Path ↓</button>
        <button onclick="resetAlignment()" style="background: transparent; color: #888; border: none; padding: 14px 32px; font-size: 14px; font-weight: 500; cursor: pointer; margin-left: 8px;">Retake Quiz</button>
      </div>
    </div>

  </div>
</section>

<style>
  .align-opt-btn {
    width: 100%;
    text-align: left;
    padding: 20px 24px;
    background: #faf9f6;
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 12px;
    font-size: 16px;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 500;
  }
  .align-opt-btn:hover {
    background: #f3f4f6;
    border-color: rgba(0,112,243,0.3);
    color: #0070f3;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.03);
  }
</style>

<script>
  const alignmentQuestions = [
    {
      q: "When building a product, what excites you the most?",
      opts: [
        { text: "Designing how it looks and feels to the user.", score: { front: 2, back: 0 } },
        { text: "Architecting the logic and data behind the scenes.", score: { front: 0, back: 2 } },
        { text: "A little bit of both, I want to build the whole thing.", score: { front: 1, back: 1 } }
      ]
    },
    {
      q: "If your app breaks, where would you rather fix a bug?",
      opts: [
        { text: "A button is the wrong color and out of alignment.", score: { front: 2, back: 0 } },
        { text: "The database is returning the wrong user information.", score: { front: 0, back: 2 } }
      ]
    },
    {
      q: "Which tool sounds more interesting to master?",
      opts: [
        { text: "Figma (UI/UX Design) and React (Interactions).", score: { front: 2, back: 0 } },
        { text: "Node.js (Servers) and PostgreSQL (Databases).", score: { front: 0, back: 2 } }
      ]
    },
    {
      q: "What is your ultimate goal?",
      opts: [
        { text: "To create beautiful experiences that millions of people see.", score: { front: 2, back: 0 } },
        { text: "To build powerful systems that process massive amounts of data.", score: { front: 0, back: 2 } },
        { text: "To be a solo-founder and build an entire startup myself.", score: { front: 2, back: 2 } }
      ]
    }
  ];

  let alignCurrentIndex = 0;
  let scores = { front: 0, back: 0 };

  const qContainer = document.getElementById('alignment-question-container');
  const resContainer = document.getElementById('alignment-result');
  const qTitle = document.getElementById('alignment-question');
  const optsContainer = document.getElementById('alignment-options');
  const progressText = document.getElementById('alignment-progress');
  const bootcampName = document.getElementById('alignment-bootcamp-name');

  function renderAlignQuestion() {
    qContainer.style.display = 'block';
    resContainer.style.display = 'none';
    
    progressText.innerText = `QUESTION ${alignCurrentIndex + 1} / ${alignmentQuestions.length}`;
    
    const currentQ = alignmentQuestions[alignCurrentIndex];
    qTitle.innerText = currentQ.q;
    optsContainer.innerHTML = '';

    currentQ.opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'align-opt-btn';
      btn.innerText = opt.text;
      btn.onclick = () => {
        scores.front += opt.score.front;
        scores.back += opt.score.back;
        nextAlignQuestion();
      };
      optsContainer.appendChild(btn);
    });
  }

  function nextAlignQuestion() {
    alignCurrentIndex++;
    if (alignCurrentIndex < alignmentQuestions.length) {
      renderAlignQuestion();
    } else {
      showAlignResult();
    }
  }

  function showAlignResult() {
    qContainer.style.display = 'none';
    resContainer.style.display = 'block';
    progressText.innerText = `ANALYSIS COMPLETE`;

    let recommendation = "";
    if (scores.front > scores.back + 2) {
      recommendation = "Frontend Systems & UI/UX";
    } else if (scores.back > scores.front + 2) {
      recommendation = "Backend & Database Engineering";
    } else {
      recommendation = "Full-Stack Web Foundations";
    }
    
    bootcampName.innerText = recommendation;
  }

  function resetAlignment() {
    alignCurrentIndex = 0;
    scores = { front: 0, back: 0 };
    renderAlignQuestion();
  }

  document.addEventListener("DOMContentLoaded", renderAlignQuestion);
</script>
"""

# Insert right before BOOTCAMP 1 SECTION
target_pattern = r'<!-- BOOTCAMP 1 SECTION -->'
content = re.sub(target_pattern, alignment_html + '\n\n' + target_pattern, content)

# Adjust margin of Bootcamp 1 section so they don't overlap weirdly
content = content.replace('<section class="bento-section container" style="margin-top: -60px; position: relative; z-index: 10; padding-bottom: 120px;">', 
                          '<section id="bootcamp-1" class="bento-section container" style="margin-top: 40px; position: relative; z-index: 10; padding-bottom: 120px;">')

with open('pathfinder.html', 'w') as f:
    f.write(content)

print("Done")
