import re

with open('pathfinder.html', 'r') as f:
    content = f.read()

# We need to replace the entire <script> block for the alignment quiz.
old_script_pattern = r'<script>\s*const alignmentQuestions = \[.*?document\.addEventListener\("DOMContentLoaded", renderAlignQuestion\);\s*</script>'

new_script = """<script>
  const allAlignmentQuestions = [
    {
      q: "If an application is running slowly, what is your first instinct?",
      opts: [
        { text: "Analyze the database queries and optimize backend algorithms.", score: { front: 0, back: 3 } },
        { text: "Check if high-resolution images or complex CSS animations are lagging the browser.", score: { front: 3, back: 0 } },
        { text: "Look at the network tab to see if the API and frontend are communicating inefficiently.", score: { front: 1, back: 1 } }
      ]
    },
    {
      q: "When you look at a highly successful tech product (like Spotify or Notion), what impresses you more?",
      opts: [
        { text: "The flawlessly smooth, intuitive, and beautiful user interface.", score: { front: 3, back: 0 } },
        { text: "The sheer volume of data they process seamlessly in real-time.", score: { front: 0, back: 3 } }
      ]
    },
    {
      q: "How do you prefer to handle structure and rules?",
      opts: [
        { text: "I like strict, uncompromising logic where things are objectively right or wrong.", score: { front: 0, back: 3 } },
        { text: "I prefer creative flexibility where I can visually tweak things until they feel perfect.", score: { front: 3, back: 0 } }
      ]
    },
    {
      q: "You have to build a complex feature from scratch. Which part do you build first?",
      opts: [
        { text: "The database schema and API endpoints.", score: { front: 0, back: 3 } },
        { text: "The wireframes, buttons, and user flow.", score: { front: 3, back: 0 } },
        { text: "I map out the entire architecture from database to UI before writing code.", score: { front: 2, back: 2 } }
      ]
    },
    {
      q: "Which error message sounds more frustrating to deal with?",
      opts: [
        { text: "'Error: Cannot read properties of undefined (reading style)' - A visual component crashed.", score: { front: 0, back: 2 } },
        { text: "'Error: Connection timeout. Maximum pool size reached' - The database crashed.", score: { front: 2, back: 0 } }
      ]
    },
    {
      q: "What role do you usually take in team projects?",
      opts: [
        { text: "The Presenter - making sure everything looks polished, cohesive, and user-friendly.", score: { front: 3, back: 0 } },
        { text: "The Architect - making sure the foundation is secure, scalable, and bug-free.", score: { front: 0, back: 3 } },
        { text: "The Integrator - connecting different people's work together.", score: { front: 2, back: 2 } }
      ]
    },
    {
      q: "Which concept sounds more fascinating to learn about?",
      opts: [
        { text: "Microservices architecture and server load balancing.", score: { front: 0, back: 3 } },
        { text: "Advanced CSS Grid, WebGL, and complex DOM animations.", score: { front: 3, back: 0 } }
      ]
    },
    {
      q: "You are given a messy codebase. What is your priority?",
      opts: [
        { text: "Refactoring the logic to be mathematically elegant and memory-efficient.", score: { front: 0, back: 3 } },
        { text: "Refactoring the UI code so the application looks pixel-perfect across all devices.", score: { front: 3, back: 0 } }
      ]
    },
    {
      q: "When a user clicks a button, what part of the process do you care about most?",
      opts: [
        { text: "The micro-interaction (the ripple effect, the satisfying click sound, the smooth transition).", score: { front: 3, back: 0 } },
        { text: "The secure data transmission and efficient processing happening on the server.", score: { front: 0, back: 3 } }
      ]
    },
    {
      q: "What is your ultimate career goal in tech?",
      opts: [
        { text: "To create beautiful, immersive experiences that millions of people interact with daily.", score: { front: 3, back: 0 } },
        { text: "To build incredibly powerful, invisible systems that run the modern world.", score: { front: 0, back: 3 } },
        { text: "To be a versatile technical founder who can build an entire product solo.", score: { front: 2, back: 2 } }
      ]
    }
  ];

  let activeQuestions = [];
  let alignCurrentIndex = 0;
  let scores = { front: 0, back: 0 };

  const qContainer = document.getElementById('alignment-question-container');
  const resContainer = document.getElementById('alignment-result');
  const qTitle = document.getElementById('alignment-question');
  const optsContainer = document.getElementById('alignment-options');
  const progressText = document.getElementById('alignment-progress');
  const bootcampName = document.getElementById('alignment-bootcamp-name');

  // Shuffle array and pick N questions
  function shuffleAndPick(array, num) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  }

  function startQuiz() {
    // Pick 7 random questions so it never repeats the same flow
    activeQuestions = shuffleAndPick(allAlignmentQuestions, 7);
    alignCurrentIndex = 0;
    scores = { front: 0, back: 0 };
    renderAlignQuestion();
  }

  function renderAlignQuestion() {
    qContainer.style.display = 'block';
    resContainer.style.display = 'none';
    
    progressText.innerText = `QUESTION ${alignCurrentIndex + 1} / ${activeQuestions.length}`;
    
    const currentQ = activeQuestions[alignCurrentIndex];
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
    if (alignCurrentIndex < activeQuestions.length) {
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
    if (scores.front > scores.back + 4) {
      recommendation = "Frontend Systems & UI/UX";
    } else if (scores.back > scores.front + 4) {
      recommendation = "Backend & Database Engineering";
    } else {
      recommendation = "Full-Stack Web Foundations";
    }
    
    bootcampName.innerText = recommendation;
  }

  document.addEventListener("DOMContentLoaded", startQuiz);
  
  // Expose reset to global scope so the Retake button works
  window.resetAlignment = startQuiz;
</script>"""

content = re.sub(old_script_pattern, new_script, content, flags=re.DOTALL)

with open('pathfinder.html', 'w') as f:
    f.write(content)

print("Done")
