// Ultra-Premium Animations

// 1. Matrix Text Decoding
export function initMatrixText() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
  const element = document.querySelector(".hero h1 .accent-text");
  
  if (!element) return;
  
  const originalText = element.innerText; // Should be "together." or "Innovate." based on current text
  element.dataset.value = originalText;
  
  let iterations = 0;
  
  const interval = setInterval(() => {
    element.innerText = element.innerText
      .split("")
      .map((letter, index) => {
        if(index < iterations) {
          return element.dataset.value[index];
        }
        return letters[Math.floor(Math.random() * letters.length)]
      })
      .join("");
    
    if(iterations >= element.dataset.value.length){ 
      clearInterval(interval);
    }
    
    iterations += 1 / 3;
  }, 30);
}

// 2. Spotlight Hover Effect
export function initSpotlightCards() {
  const cards = document.querySelectorAll(".forge-detail-card, .feat-card, .uni-card");
  
  cards.forEach(card => {
    card.onmousemove = e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }
  });
}

// 3. Custom Trailing Cursor & Magnetic Buttons
export function initCustomCursor() {
  // Only init on non-touch devices
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const dot = document.createElement("div");
  dot.id = "cursor-dot";
  const ring = document.createElement("div");
  ring.id = "cursor-ring";
  
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });
  
  // Smooth follow for the ring
  const render = () => {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
  
  // Magnetic Buttons
  const buttons = document.querySelectorAll(".btn-primary, .forge-cta-btn");
  buttons.forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Move the button slightly towards the cursor (Disabled to prevent click issues)
      // btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      
      // Make cursor ring snap to button
      ring.classList.add("cursor-hover-btn");
    });
    
    btn.addEventListener("mouseleave", () => {
      // btn.style.transform = `translate(0px, 0px)`;
      ring.classList.remove("cursor-hover-btn");
    });
  });
}

// 4. Scroll-Linked Assembly (Simple Intersection Observer with delay classes)
export function initScrollAssembly() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('assembled');
        // Don't unobserve if we want them to re-assemble on scroll up, 
        // but typically we unobserve for performance.
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const elements = document.querySelectorAll('.feat-card, .forge-detail-card');
  elements.forEach((el, index) => {
    el.style.setProperty('--delay', `${(index % 4) * 0.1}s`);
    el.classList.add('assemble-item');
    observer.observe(el);
  });
}

export function initHyperspaceTransition() {
  const overlay = document.getElementById("hyperspace");
  const links = document.querySelectorAll('a[href="register.html"]');
  
  if(!overlay) return;
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      // Allow middle-click or cmd-click to work normally
      if (e.ctrlKey || e.metaKey || e.button !== 0) return;
      
      e.preventDefault();
      overlay.classList.add("active");
      
      setTimeout(() => {
        window.location.href = link.href;
      }, 700);
    });
  });
}

export function initParallaxObjects() {
  const objects = document.querySelectorAll('.floating-3d-obj');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    objects.forEach(obj => {
      const speed = parseFloat(obj.getAttribute('data-speed')) || 0.2;
      obj.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });
}

export function initAllAnimations() {
  initMatrixText();
  initSpotlightCards();
  initCustomCursor();
  initScrollAssembly();
  initHyperspaceTransition();
  initParallaxObjects();
}
