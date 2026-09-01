import re

with open('index.html', 'r') as f:
    content = f.read()

# We need to replace the script block of the quiz.
old_script_pattern = r'<script>\s*window\.addEventListener\(\'DOMContentLoaded\', \(\) => {\s*const questionEl = document\.getElementById\(\'quiz-question\'\);.*?observer\.observe\(document\.getElementById\(\'quiz-question\'\)\);\s*}\);\s*</script>'

new_script = """<script>
  window.addEventListener('DOMContentLoaded', () => {
    const questionEl = document.getElementById('quiz-question');
    const optionsContainer = document.getElementById('quiz-options');
    const difficultyBadge = document.getElementById('quiz-difficulty');
    const feedbackEl = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next-btn');

    let currentCorrectAnswer = "";
    let questionBuffer = [];
    let isFetchingBatch = false;

    function decodeHTML(html) {
      var txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    }

    async function fillBuffer() {
      if (isFetchingBatch) return;
      isFetchingBatch = true;
      try {
        // Fetch 15 questions at once
        const response = await fetch('https://opentdb.com/api.php?amount=15&category=18&type=multiple');
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          questionBuffer.push(...data.results);
        }
      } catch (err) {
        console.error("Grid fetch error", err);
      }
      isFetchingBatch = false;
    }

    async function loadNextQuestion() {
      // Hide next button and feedback instantly
      feedbackEl.style.display = 'none';
      nextBtn.style.display = 'none';
      optionsContainer.innerHTML = '';
      
      // If buffer is empty (e.g. on very first load or if they answered 15 very fast)
      if (questionBuffer.length === 0) {
        difficultyBadge.innerText = 'FETCHING...';
        difficultyBadge.style.color = '#888';
        difficultyBadge.style.background = '#f3f4f6';
        questionEl.innerText = 'Connecting to global grid...';
        
        await fillBuffer();
        
        if (questionBuffer.length === 0) {
           questionEl.innerText = "Connection failed. Please check network.";
           nextBtn.style.display = 'block';
           return;
        }
      }

      // Pop question instantly from buffer
      const q = questionBuffer.shift();
      
      // Render
      questionEl.innerText = decodeHTML(q.question);
      currentCorrectAnswer = decodeHTML(q.correct_answer);
      
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

      // Refill buffer silently in background if running low
      if (questionBuffer.length < 3) {
        fillBuffer();
      }
    }

    function handleAnswer(selectedAnswer, clickedBtn) {
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

    nextBtn.addEventListener('click', loadNextQuestion);

    // Fetch batch immediately when in view
    const observer = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
        loadNextQuestion();
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    observer.observe(document.getElementById('quiz-question'));
  });
</script>"""

content = re.sub(old_script_pattern, new_script, content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
