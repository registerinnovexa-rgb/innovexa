import re

with open('pathfinder.html', 'r') as f:
    html = f.read()

# 1. Update the UI for the result to include Recommended Tech Stack
old_result_ui = """      <div id="alignment-recommendation" style="background: #faf9f6; border: 1px solid rgba(0,0,0,0.05); padding: 24px; border-radius: 12px; margin-bottom: 32px; display: inline-block; text-align: left;">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0070f3; margin-bottom: 8px; letter-spacing: 1px;">Recommended Bootcamp</div>
        <div id="alignment-bootcamp-name" style="font-family: var(--font-d); font-size: 24px; font-weight: 600; color: #111;">Frontend Engineering</div>
      </div>
      
      <div>
        <button onclick="document.getElementById('bootcamp-1').scrollIntoView({behavior: 'smooth'})" style="background: #0070f3; color: white; border: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; box-shadow: 0 10px 20px rgba(0,112,243,0.3);" onmouseover="this.style.background='#0051a8';" onmouseout="this.style.background='#0070f3';">View Recommended Path ↓</button>"""

new_result_ui = """      <div id="alignment-recommendation" style="background: #faf9f6; border: 1px solid rgba(0,0,0,0.05); padding: 24px; border-radius: 12px; margin-bottom: 32px; display: inline-block; text-align: left; width: 100%; max-width: 400px;">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0070f3; margin-bottom: 4px; letter-spacing: 1px;">Recommended Bootcamp</div>
        <div id="alignment-bootcamp-name" style="font-family: var(--font-d); font-size: 24px; font-weight: 600; color: #111; margin-bottom: 16px;">Frontend Engineering</div>
        
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #8b5cf6; margin-bottom: 4px; letter-spacing: 1px;">Tech Stack to Learn</div>
        <div id="alignment-tech-stack" style="font-family: var(--font-m); font-size: 15px; color: #444; line-height: 1.5;">HTML, CSS, React</div>
      </div>
      
      <div>
        <button id="btn-view-path" style="background: #0070f3; color: white; border: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; box-shadow: 0 10px 20px rgba(0,112,243,0.3);" onmouseover="this.style.background='#0051a8';" onmouseout="this.style.background='#0070f3';">View Recommended Path ↓</button>"""

html = html.replace(old_result_ui, new_result_ui)

# 2. Update the Javascript Logic
old_script_match = re.search(r'const allAlignmentQuestions = \[.*?\n  // Expose reset to global scope so the Retake button works', html, re.DOTALL)

if old_script_match:
    old_script = old_script_match.group(0)
else:
    print("Could not find script block")
    exit(1)

new_script = """const allAlignmentQuestions = [
    { q: "If an application is running slowly, what is your first instinct?", opts: [ { text: "Analyze the database queries and optimize backend algorithms.", score: { front: 0, back: 3, ai: 0 } }, { text: "Check if high-resolution images or complex CSS animations are lagging the browser.", score: { front: 3, back: 0, ai: 0 } }, { text: "Check if the predictive models are processing data too slowly.", score: { front: 0, back: 1, ai: 3 } } ] },
    { q: "When you look at a highly successful tech product, what impresses you more?", opts: [ { text: "The flawlessly smooth, intuitive, and beautiful user interface.", score: { front: 3, back: 0, ai: 0 } }, { text: "The sheer volume of data they process seamlessly in real-time.", score: { front: 0, back: 3, ai: 0 } }, { text: "The intelligent recommendations that seem to read my mind.", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "How do you prefer to handle structure and rules?", opts: [ { text: "I like strict, uncompromising logic where things are objectively right or wrong.", score: { front: 0, back: 3, ai: 1 } }, { text: "I prefer creative flexibility where I can visually tweak things until they feel perfect.", score: { front: 3, back: 0, ai: 0 } }, { text: "I like training systems to discover their own hidden patterns and rules.", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "You have to build a complex feature from scratch. Which part do you build first?", opts: [ { text: "The database schema and API endpoints.", score: { front: 0, back: 3, ai: 0 } }, { text: "The wireframes, buttons, and user flow.", score: { front: 3, back: 0, ai: 0 } }, { text: "The mathematical model and data pipeline.", score: { front: 0, back: 1, ai: 3 } } ] },
    { q: "Which error message sounds more frustrating to deal with?", opts: [ { text: "'Error: Cannot read properties of undefined (reading style)'", score: { front: 0, back: 2, ai: 0 } }, { text: "'Error: Connection timeout. Maximum pool size reached'", score: { front: 2, back: 0, ai: 0 } }, { text: "'Warning: Model overfitting detected during epoch 45'", score: { front: 0, back: 1, ai: 3 } } ] },
    { q: "What role do you usually take in team projects?", opts: [ { text: "The Presenter - making sure everything looks polished and user-friendly.", score: { front: 3, back: 0, ai: 0 } }, { text: "The Architect - making sure the foundation is secure, scalable, and bug-free.", score: { front: 0, back: 3, ai: 0 } }, { text: "The Analyst - finding insights from messy data to drive our strategy.", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "Which concept sounds more fascinating to learn about?", opts: [ { text: "Microservices architecture and server load balancing.", score: { front: 0, back: 3, ai: 0 } }, { text: "Advanced CSS Grid, WebGL, and complex DOM animations.", score: { front: 3, back: 0, ai: 0 } }, { text: "Neural networks, deep learning, and natural language processing.", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "You are given a messy codebase. What is your priority?", opts: [ { text: "Refactoring the logic to be mathematically elegant and memory-efficient.", score: { front: 0, back: 3, ai: 0 } }, { text: "Refactoring the UI code so the application looks pixel-perfect across all devices.", score: { front: 3, back: 0, ai: 0 } }, { text: "Cleaning the data inputs and fine-tuning the hyperparameters.", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "When a user clicks a button, what part of the process do you care about most?", opts: [ { text: "The micro-interaction (ripple effect, satisfying click sound, smooth transition).", score: { front: 3, back: 0, ai: 0 } }, { text: "The secure data transmission and efficient processing happening on the server.", score: { front: 0, back: 3, ai: 0 } }, { text: "How that click event is stored and used to train future predictive models.", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "What is your ultimate career goal in tech?", opts: [ { text: "To create beautiful, immersive experiences that millions of people interact with daily.", score: { front: 3, back: 0, ai: 0 } }, { text: "To build incredibly powerful, invisible systems that run the modern world.", score: { front: 0, back: 3, ai: 0 } }, { text: "To create intelligent systems that solve problems beyond human capacity.", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "If you were stranded on a desert island with a laptop, which book would you want?", opts: [ { text: "'The Art of Color and Typography'", score: { front: 3, back: 0, ai: 0 } }, { text: "'Advanced Distributed Systems Design'", score: { front: 0, back: 3, ai: 0 } }, { text: "'Statistical Learning and Pattern Recognition'", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "Which of these coding tasks sounds like fun?", opts: [ { text: "Building a complex 3D interactive product viewer.", score: { front: 3, back: 0, ai: 0 } }, { text: "Designing an ultra-fast caching system for millions of requests.", score: { front: 0, back: 3, ai: 0 } }, { text: "Training a model to generate realistic images from text prompts.", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "How do you prefer to debug?", opts: [ { text: "Visually inspecting elements in the browser and tweaking CSS/JS live.", score: { front: 3, back: 0, ai: 0 } }, { text: "Reading through server logs and tracing database queries.", score: { front: 0, back: 3, ai: 0 } }, { text: "Plotting confusion matrices and analyzing loss curves over time.", score: { front: 0, back: 0, ai: 3 } } ] },
    { q: "When someone says 'Python', what is your first thought?", opts: [ { text: "A great tool for building quick APIs and server-side scripts.", score: { front: 0, back: 3, ai: 0 } }, { text: "The undisputed king of Data Science, AI, and Machine Learning.", score: { front: 0, back: 0, ai: 3 } }, { text: "I prefer JavaScript/TypeScript for the web.", score: { front: 3, back: 0, ai: 0 } } ] },
    { q: "Which tool would you rather master?", opts: [ { text: "Figma & React", score: { front: 3, back: 0, ai: 0 } }, { text: "Docker & Kubernetes", score: { front: 0, back: 3, ai: 0 } }, { text: "PyTorch & TensorFlow", score: { front: 0, back: 0, ai: 3 } } ] }
  ];

  let activeQuestions = [];
  let alignCurrentIndex = 0;
  let scores = { front: 0, back: 0, ai: 0 };

  const qContainer = document.getElementById('alignment-question-container');
  const resContainer = document.getElementById('alignment-result');
  const progressText = document.getElementById('alignment-progress');
  const qTitle = document.getElementById('alignment-question');
  const optsContainer = document.getElementById('alignment-options');
  const bootcampName = document.getElementById('alignment-bootcamp-name');
  const techStackText = document.getElementById('alignment-tech-stack');
  const btnViewPath = document.getElementById('btn-view-path');

  // Shuffle array and pick N questions
  function shuffleAndPick(array, num) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  }

  function startQuiz() {
    activeQuestions = shuffleAndPick(allAlignmentQuestions, 7);
    alignCurrentIndex = 0;
    scores = { front: 0, back: 0, ai: 0 };
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
        scores.ai += opt.score.ai || 0;
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
    let techStack = "";
    let targetSectionId = "";

    if (scores.ai > scores.front && scores.ai > scores.back) {
      recommendation = "Applied Artificial Intelligence";
      techStack = "Python, PyTorch, TensorFlow, LLMs, RAG, Data Pipelines";
      targetSectionId = "bootcamp-3";
    } else if (scores.back > scores.front) {
      recommendation = "Backend Systems & Data Architectures";
      techStack = "Node.js, Express, MongoDB, PostgreSQL, Docker, AWS";
      targetSectionId = "bootcamp-2";
    } else {
      recommendation = "Web Foundations & Frontend Systems";
      techStack = "React, Next.js, Tailwind CSS, TypeScript, UI/UX Design";
      targetSectionId = "bootcamp-1";
    }
    
    bootcampName.innerText = recommendation;
    techStackText.innerText = techStack;

    // Only show the recommended bootcamp, hide others
    const b1 = document.getElementById('bootcamp-1');
    const b2 = document.getElementById('bootcamp-2');
    const b3 = document.getElementById('bootcamp-3');
    
    if (b1) b1.style.display = (targetSectionId === 'bootcamp-1') ? 'block' : 'none';
    if (b2) b2.style.display = (targetSectionId === 'bootcamp-2') ? 'block' : 'none';
    if (b3) b3.style.display = (targetSectionId === 'bootcamp-3') ? 'block' : 'none';

    btnViewPath.onclick = () => {
      document.getElementById(targetSectionId).scrollIntoView({behavior: 'smooth'});
    };
  }

  document.addEventListener("DOMContentLoaded", startQuiz);
  
  // Expose reset to global scope so the Retake button works"""

html = html.replace(old_script, new_script)

with open('pathfinder.html', 'w') as f:
    f.write(html)
