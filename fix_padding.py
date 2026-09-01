with open('css/index.css', 'r') as f:
    content = f.read()

padding_fixes = """
  /* Bento card padding on mobile */
  .bento-card {
    padding: 24px !important;
  }
  
  /* Text sizes */
  .hero-title, .cta-title {
    font-size: clamp(36px, 10vw, 48px) !important;
  }
  
  /* Pathfinder course titles */
  .course-title {
    font-size: 28px !important;
  }
"""

if '/* Bento card padding on mobile */' not in content:
    content = content.replace('/* IDE Layout fixes */', padding_fixes + '\n  /* IDE Layout fixes */')
    with open('css/index.css', 'w') as f:
        f.write(content)
    print("Added padding fixes to index.css")
