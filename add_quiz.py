import re

with open('index.html', 'r') as f:
    content = f.read()

quiz_html = """
<!-- ══ LIVE SYSTEM CHALLENGE ══════════════════════════════════════════════════════ -->
<section class="fade-up" style="padding: 100px 24px 20px; background: #faf9f6; display: flex; flex-direction: column; align-items: center;">
  <div style="max-width: 800px; width: 100%;">
    <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 24px;">
      <h3 style="font-family: var(--font-d); font-size: 32px; letter-spacing: -0.02em; margin-bottom: 8px;">Operative Aptitude Protocol</h3>
      <p style="color: var(--text3); font-size: 15px;">Live tech challenges fetched from the global grid. Test your knowledge.</p>
    </div>
    
    <div style="width: 100%; background: #0a0a0a; border-radius: 8px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid #222; font-family: 'Courier New', monospace;">
      
      <!-- Terminal Output Window -->
      <div id="quiz-terminal" style="color: #10b981; font-size: 14px; line-height: 1.6; min-height: 200px; display: flex; flex-direction: column;">
        <div id="quiz-output" style="flex: 1;">
          > INITIALIZING APTITUDE PROTOCOL...<br>
          > ESTABLISHING CONNECTION TO GLOBAL GRID...<br>
        </div>
        
        <!-- Interactive Input Area (Hidden initially) -->
        <div id="quiz-input-area" style="display: none; align-items: center; gap: 10px; margin-top: 20px; border-top: 1px solid #333; padding-top: 16px;">
          <span style="color: #10b981; font-weight: bold;">> ENTER ANSWER (A/B/C/D):</span>
          <input type="text" id="quiz-input" maxlength="1" style="background: transparent; border: none; border-bottom: 1px solid #10b981; outline: none; color: #fff; font-family: 'Courier New', monospace; font-size: 16px; width: 30px; text-transform: uppercase; text-align: center;">
          <button id="quiz-submit-btn" style="background: transparent; border: 1px solid #333; color: #888; padding: 4px 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.style.borderColor='#10b981';" onmouseout="this.style.color='#888'; this.style.borderColor='#333';">[ SUBMIT ]</button>
        </div>
        
        <div id="quiz-next-area" style="display: none; margin-top: 20px; border-top: 1px solid #333; padding-top: 16px;">
          <button id="quiz-next-btn" style="background: transparent; border: 1px solid #10b981; color: #10b981; padding: 8px 16px; cursor: pointer; transition: all 0.2s; width: 100%;" onmouseover="this.style.background='#10b981'; this.style.color='#000';" onmouseout="this.style.background='transparent'; this.style.color='#10b981';">[ FETCH NEW CHALLENGE ]</button>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('quiz-output');
    const inputArea = document.getElementById('quiz-input-area');
    const input = document.getElementById('quiz-input');
    const submitBtn = document.getElementById('quiz-submit-btn');
    const nextArea = document.getElementById('quiz-next-area');
    const nextBtn = document.getElementById('quiz-next-btn');

    let currentCorrectAnswer = "";
    let currentOptions = [];
    let isFetching = false;

    function decodeHTML(html) {
      var txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    }

    async function fetchChallenge() {
      if (isFetching) return;
      isFetching = true;
      inputArea.style.display = 'none';
      nextArea.style.display = 'none';
      input.value = "";
      
      output.innerHTML = "> INITIALIZING APTITUDE PROTOCOL...<br>> ESTABLISHING CONNECTION TO GLOBAL GRID...<br><span style='color:#888;'>(Fetching live data...)</span>";
      
      try {
        const response = await fetch('https://opentdb.com/api.php?amount=1&category=18&type=multiple');
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const q = data.results[0];
          const questionText = decodeHTML(q.question);
          currentCorrectAnswer = decodeHTML(q.correct_answer);
          
          currentOptions = [...q.incorrect_answers.map(decodeHTML), currentCorrectAnswer];
          currentOptions.sort(() => Math.random() - 0.5);

          const difficultyColor = q.difficulty === 'hard' ? '#ef4444' : (q.difficulty === 'medium' ? '#f59e0b' : '#10b981');

          let html = `<span style="color: #888;">[ INCOMING TRANSMISSION ]</span><br><br>`;
          html += `<span style="color: ${difficultyColor};">[ DIFFICULTY: ${q.difficulty.toUpperCase()} ]</span><br>`;
          html += `<span style="color: #fff; font-weight: bold;">${questionText}</span><br><br>`;
          
          const letters = ['A', 'B', 'C', 'D'];
          currentOptions.forEach((opt, index) => {
            html += `<span style="color: #10b981;">[${letters[index]}]</span> <span style="color: #ccc;">${opt}</span><br>`;
          });

          output.innerHTML = html;
          inputArea.style.display = 'flex';
          input.focus();
        } else {
          throw new Error("No data");
        }
      } catch (err) {
        output.innerHTML = "> [ ERROR ] CONNECTION TO GRID FAILED.<br>> PLEASE CHECK YOUR NETWORK STATUS AND RETRY.";
        nextArea.style.display = 'block';
      }
      isFetching = false;
    }

    function submitAnswer() {
      const val = input.value.toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(val)) {
        alert("Please enter A, B, C, or D.");
        input.focus();
        return;
      }
      
      const letters = ['A', 'B', 'C', 'D'];
      const selectedIndex = letters.indexOf(val);
      const selectedAnswer = currentOptions[selectedIndex];
      
      inputArea.style.display = 'none';
      
      let html = output.innerHTML;
      html += `<br><br>> YOU SELECTED: [${val}] ${selectedAnswer}<br><br>`;
      
      if (selectedAnswer === currentCorrectAnswer) {
        html += `<span style="color: #10b981; font-weight: bold;">[ ACCESS GRANTED ] CORRECT. APTITUDE CONFIRMED.</span>`;
      } else {
        html += `<span style="color: #ef4444; font-weight: bold;">[ ACCESS DENIED ] INCORRECT.</span><br>`;
        html += `<span style="color: #f59e0b;">> THE CORRECT DIRECTIVE WAS: <br></span>`;
        html += `<span style="color: #fff;">${currentCorrectAnswer}</span>`;
      }
      
      output.innerHTML = html;
      nextArea.style.display = 'block';
    }

    submitBtn.addEventListener('click', submitAnswer);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitAnswer();
    });
    nextBtn.addEventListener('click', fetchChallenge);

    // Initial fetch using IntersectionObserver to only fetch when scrolled into view
    const observer = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
        fetchChallenge();
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    observer.observe(document.getElementById('quiz-terminal'));
  });
</script>

"""

target = "<!-- ══ ASCII BADGE GENERATOR ══════════════════════════════════════════════════════ -->"
content = content.replace(target, quiz_html + target)

# Also I need to reduce padding-top of ASCII section from 100px to 40px so it flows better
old_ascii = '<section class="fade-up" style="padding: 100px 24px; background: #faf9f6; display: flex; flex-direction: column; align-items: center;">'
new_ascii = '<section class="fade-up" style="padding: 40px 24px 100px; background: #faf9f6; display: flex; flex-direction: column; align-items: center;">'
content = content.replace(old_ascii, new_ascii)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
