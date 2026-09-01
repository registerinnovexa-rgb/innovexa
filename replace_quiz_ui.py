import re

with open('index.html', 'r') as f:
    content = f.read()

quiz_pattern = r'<!-- ══ LIVE SYSTEM CHALLENGE ══════════════════════════════════════════════════════ -->.*?</script>'
quiz_match = re.search(quiz_pattern, content, re.DOTALL)

if not quiz_match:
    print("Quiz section not found!")
    exit(1)

new_quiz_html = """<!-- ══ LIVE SYSTEM CHALLENGE ══════════════════════════════════════════════════════ -->
<section class="fade-up" style="padding: 100px 24px 20px; background: #faf9f6; display: flex; flex-direction: column; align-items: center;">
  <div style="max-width: 800px; width: 100%;">
    <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 32px;">
      <h3 style="font-family: var(--font-d); font-size: 32px; letter-spacing: -0.02em; margin-bottom: 8px;">Operative Aptitude Protocol</h3>
      <p style="color: var(--text3); font-size: 16px;">Live tech challenges fetched from the global grid. Test your knowledge.</p>
    </div>
    
    <div style="width: 100%; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.06);">
      
      <!-- Quiz Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 16px;">
        <span id="quiz-difficulty" style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; background: #f3f4f6; padding: 6px 12px; border-radius: 20px;">Fetching...</span>
        <span id="quiz-category" style="font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">TECH TRIVIA</span>
      </div>

      <!-- Question -->
      <h4 id="quiz-question" style="font-family: var(--font-d); font-size: 22px; color: #111827; line-height: 1.5; margin-bottom: 32px; font-weight: 500;">
        Connecting to mainframe...
      </h4>

      <!-- Options Container -->
      <div id="quiz-options" style="display: flex; flex-direction: column; gap: 12px;">
        <!-- Options injected via JS -->
      </div>

      <!-- Feedback & Next Action -->
      <div id="quiz-feedback" style="margin-top: 24px; font-size: 15px; font-weight: 500; display: none; padding: 16px; border-radius: 8px;"></div>
      
      <button id="quiz-next-btn" style="margin-top: 16px; width: 100%; padding: 16px; background: #111827; color: #fff; font-weight: 600; font-size: 14px; letter-spacing: 1px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: none;" onmouseover="this.style.background='#000';" onmouseout="this.style.background='#111827';">
        LOAD NEXT CHALLENGE →
      </button>

    </div>
  </div>
</section>

<style>
  .quiz-opt-btn {
    width: 100%;
    text-align: left;
    padding: 18px 24px;
    background: #faf9f6;
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 12px;
    font-size: 16px;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .quiz-opt-btn:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: rgba(0,0,0,0.15);
    transform: translateY(-1px);
  }
  .quiz-opt-btn:disabled {
    cursor: default;
  }
  .quiz-opt-btn.correct {
    background: #ecfdf5 !important;
    border-color: #10b981 !important;
    color: #065f46 !important;
    box-shadow: 0 4px 12px rgba(16,185,129,0.1);
  }
  .quiz-opt-btn.incorrect {
    background: #fef2f2 !important;
    border-color: #ef4444 !important;
    color: #991b1b !important;
  }
  .quiz-opt-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #6b7280;
  }
  .quiz-opt-btn.correct .quiz-opt-letter {
    background: #10b981;
    border-color: #10b981;
    color: #fff;
  }
  .quiz-opt-btn.incorrect .quiz-opt-letter {
    background: #ef4444;
    border-color: #ef4444;
    color: #fff;
  }
</style>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    const questionEl = document.getElementById('quiz-question');
    const optionsContainer = document.getElementById('quiz-options');
    const difficultyBadge = document.getElementById('quiz-difficulty');
    const feedbackEl = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next-btn');

    let currentCorrectAnswer = "";
    let isFetching = false;

    function decodeHTML(html) {
      var txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    }

    async function fetchChallenge() {
      if (isFetching) return;
      isFetching = true;
      
      // Reset UI
      feedbackEl.style.display = 'none';
      nextBtn.style.display = 'none';
      optionsContainer.innerHTML = '';
      difficultyBadge.innerText = 'FETCHING...';
      difficultyBadge.style.color = '#888';
      difficultyBadge.style.background = '#f3f4f6';
      questionEl.innerText = 'Connecting to global grid...';
      
      try {
        const response = await fetch('https://opentdb.com/api.php?amount=1&category=18&type=multiple');
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const q = data.results[0];
          questionEl.innerText = decodeHTML(q.question);
          currentCorrectAnswer = decodeHTML(q.correct_answer);
          
          // Difficulty Badge Styling
          difficultyBadge.innerText = `LEVEL: ${q.difficulty.toUpperCase()}`;
          if (q.difficulty === 'hard') {
            difficultyBadge.style.color = '#dc2626';
            difficultyBadge.style.background = '#fef2f2';
          } else if (q.difficulty === 'medium') {
            difficultyBadge.style.color = '#d97706';
            difficultyBadge.style.background = '#fffbeb';
          } else {
            difficultyBadge.style.color = '#059669';
            difficultyBadge.style.background = '#ecfdf5';
          }

          let options = [...q.incorrect_answers.map(decodeHTML), currentCorrectAnswer];
          options.sort(() => Math.random() - 0.5);

          const letters = ['A', 'B', 'C', 'D'];
          options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.innerHTML = `<span class="quiz-opt-letter">${letters[index]}</span> <span>${opt}</span>`;
            btn.dataset.answer = opt;
            btn.addEventListener('click', () => handleAnswer(opt, btn));
            optionsContainer.appendChild(btn);
          });

        } else {
          throw new Error("No data");
        }
      } catch (err) {
        questionEl.innerText = "Connection failed. Please check network.";
        nextBtn.style.display = 'block';
      }
      isFetching = false;
    }

    function handleAnswer(selectedAnswer, clickedBtn) {
      // Disable all buttons
      const allBtns = optionsContainer.querySelectorAll('.quiz-opt-btn');
      allBtns.forEach(b => b.disabled = true);
      
      feedbackEl.style.display = 'block';
      nextBtn.style.display = 'block';

      if (selectedAnswer === currentCorrectAnswer) {
        clickedBtn.classList.add('correct');
        feedbackEl.innerHTML = '🎯 <strong>Correct!</strong> Your aptitude has been verified.';
        feedbackEl.style.background = '#ecfdf5';
        feedbackEl.style.color = '#065f46';
        feedbackEl.style.border = '1px solid #10b981';
      } else {
        clickedBtn.classList.add('incorrect');
        // Highlight the correct one
        allBtns.forEach(b => {
          if (b.dataset.answer === currentCorrectAnswer) {
            b.classList.add('correct');
          }
        });
        feedbackEl.innerHTML = '❌ <strong>Incorrect.</strong> The correct answer has been highlighted.';
        feedbackEl.style.background = '#fef2f2';
        feedbackEl.style.color = '#991b1b';
        feedbackEl.style.border = '1px solid #ef4444';
      }
    }

    nextBtn.addEventListener('click', fetchChallenge);

    // Initial fetch using IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
        fetchChallenge();
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    observer.observe(document.getElementById('quiz-question'));
  });
</script>"""

content = content.replace(quiz_match.group(0), new_quiz_html)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
