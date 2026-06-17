document.addEventListener('DOMContentLoaded', () => {
  // Inject the Background Orbs
  const orbsContainer = document.createElement('div');
  orbsContainer.className = 'bg-orbs-container';
  orbsContainer.innerHTML = `
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>
  `;
  document.body.prepend(orbsContainer);

  // Custom Cursor
  if (window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    const follower = document.createElement('div');
    follower.id = 'custom-cursor-follower';
    
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    // Smooth follower loop
    function animateFollower() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover effects for clickable elements
    const clickables = document.querySelectorAll('a, button, input, select, textarea, .tab-btn, .interest-chip, .card, label');
    clickables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        follower.classList.add('follower-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        follower.classList.remove('follower-hover');
      });
    });
  }

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});
