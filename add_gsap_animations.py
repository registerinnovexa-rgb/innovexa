with open('index.html', 'r') as f:
    content = f.read()

gsap_script = """
<script>
  // Initialize GSAP MatchMedia for accessibility
  let mm = gsap.matchMedia();

  mm.add({
    reduceMotion: "(prefers-reduced-motion: reduce)",
    isDesktop: "(min-width: 768px)"
  }, (context) => {
    let { reduceMotion, isDesktop } = context.conditions;

    if (!reduceMotion) {
      // 1. Initial Load Sequence
      let tl = gsap.timeline();

      // Navbar drops in
      tl.from(".navbar", {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      })
      // Hero content fades and floats up
      .from(".hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
      }, "-=0.4");

      // 2. Animate Bento Cards if ScrollTrigger is available
      if (typeof ScrollTrigger !== "undefined") {
        gsap.from(".bento-card", {
          scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 80%",
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.2)"
        });

        // 3. Mission Section reveal
        gsap.from(".mission-title, .mission-text", {
          scrollTrigger: {
            trigger: ".mission-section",
            start: "top 75%"
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out"
        });
      }

      // 4. Subtle parallax on floating icons (Desktop only)
      if (isDesktop) {
        document.addEventListener("mousemove", (e) => {
          const mouseX = (e.clientX / window.innerWidth) - 0.5;
          const mouseY = (e.clientY / window.innerHeight) - 0.5;

          gsap.to(".float-icon", {
            x: mouseX * 40,
            y: mouseY * 40,
            duration: 1,
            ease: "power1.out",
            stagger: 0.05
          });
        });
      }
    } else {
      // Very basic fade for users who prefer reduced motion
      gsap.from(".hero-content > *", {
        opacity: 0,
        duration: 1,
        stagger: 0.2
      });
    }
  });
</script>
"""

if 'let mm = gsap.matchMedia();' not in content:
    content = content.replace('</body>', gsap_script + '\n</body>')
    with open('index.html', 'w') as f:
        f.write(content)
    print("Injected GSAP animations")
else:
    print("GSAP animations already present")
