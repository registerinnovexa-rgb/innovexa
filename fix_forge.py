with open('css/main.css', 'r') as f:
    content = f.read()

forge_mobile = """
@media (max-width: 600px) {
  .login-card {
    padding: 24px !important;
  }
  
  /* Tables */
  .data-table th, .data-table td {
    padding: 12px 8px !important;
    font-size: 13px !important;
  }
}
"""

if '.login-card {' not in content or 'forge_mobile' not in content:
    content += "\n" + forge_mobile
    with open('css/main.css', 'w') as f:
        f.write(content)
    print("Fixed forge/admin mobile CSS")
