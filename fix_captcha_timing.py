import re

with open('register.html', 'r') as f:
    html = f.read()

# When btnNext2 is clicked and step-3 becomes visible, re-init the captcha
old_btn2 = """  if (btnNext2) btnNext2.addEventListener('click', () => {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    updateProgress(3);
    window.scrollTo({top:0, behavior:'smooth'});
    setTimeout(resizeCanvas, 50); // Ensure the DOM has updated width before resizing
  });"""

new_btn2 = """  if (btnNext2) btnNext2.addEventListener('click', () => {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    updateProgress(3);
    window.scrollTo({top:0, behavior:'smooth'});
    setTimeout(resizeCanvas, 50); // Ensure the DOM has updated width before resizing
    setTimeout(initCaptcha, 80);  // Re-init captcha now that the canvas is visible
  });"""

html = html.replace(old_btn2, new_btn2)

with open('register.html', 'w') as f:
    f.write(html)
