import re

with open('register.html', 'r') as f:
    html = f.read()

# Add check for terms checkbox in the submit handler
old_js = """  document.getElementById('submit-btn').addEventListener('click', async () => {
    if (isSubmitting) return;
    const utr = document.getElementById('utr').value.trim();"""

new_js = """  document.getElementById('submit-btn').addEventListener('click', async () => {
    if (isSubmitting) return;
    
    // Enforce Terms & Conditions
    if(!document.getElementById('termsCheckbox').checked) {
      alert("⚠️ You must read and agree to the Innovexa Hub Terms of Service before initializing your membership.");
      return;
    }

    const utr = document.getElementById('utr').value.trim();"""

html = html.replace(old_js, new_js)

with open('register.html', 'w') as f:
    f.write(html)
