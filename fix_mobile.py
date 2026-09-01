with open('css/index.css', 'r') as f:
    content = f.read()

# Append mobile fixes for the IDE layout and other sections
mobile_css = """
@media (max-width: 768px) {
  /* IDE Layout fixes */
  .ide-body {
    flex-direction: column !important;
  }
  .ide-body > div[style*="width: 250px"] {
    width: 100% !important;
    border-right: none !important;
    border-bottom: 1px solid #333 !important;
    max-height: 200px !important;
  }
  .ide-body > div[style*="min-width: 300px"] {
    min-width: 100% !important;
  }

  /* Partner Logos */
  .partner-logos {
    flex-direction: column !important;
    gap: 24px !important;
  }
  .partner-logos > div[style*="width: 1px"] {
    width: 100% !important;
    height: 1px !important;
  }

  /* Mission Section padding */
  .mission-section {
    padding: 60px 16px !important;
  }

  /* Fix padding and width on absolute positioned shapes */
  .shape-1, .shape-2 {
    width: 200px !important;
    height: 200px !important;
    filter: blur(50px) !important;
  }
  
  /* Make sure large buttons don't break width */
  a[style*="min-width: 320px"] {
    min-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
}
"""

if '/* IDE Layout fixes */' not in content:
    content += "\n" + mobile_css
    with open('css/index.css', 'w') as f:
        f.write(content)
    print("Added mobile fixes to index.css")
