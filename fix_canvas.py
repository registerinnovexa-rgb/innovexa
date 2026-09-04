import re

with open('register.html', 'r') as f:
    html = f.read()

# Make resizeCanvas only resize if it's currently 0 or if called explicitly, to avoid erasing on mobile scroll
# Actually, just calling it when btnNext2 is clicked is enough.
new_btn2 = """  if (btnNext2) btnNext2.addEventListener('click', () => {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    updateProgress(3);
    window.scrollTo({top:0, behavior:'smooth'});
    setTimeout(resizeCanvas, 50); // Ensure the DOM has updated width before resizing
  });"""

html = html.replace(
    """  if (btnNext2) btnNext2.addEventListener('click', () => {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    updateProgress(3);
    window.scrollTo({top:0, behavior:'smooth'});
  });""",
    new_btn2
)

# And fix resizeCanvas so it doesn't run repeatedly on window resize which erases drawing.
old_resize = """  function resizeCanvas() {
    const rect = sigCanvas.parentElement.getBoundingClientRect();
    sigCanvas.width = rect.width;
    sigCanvas.height = 150; // fixed height
    sigCtx.lineWidth = 2;
    sigCtx.lineCap = 'round';
    sigCtx.strokeStyle = '#111';
  }
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 100); // initialize"""

new_resize = """  function resizeCanvas() {
    const rect = sigCanvas.parentElement.getBoundingClientRect();
    if (rect.width === 0) return; // Hidden
    
    // Create a temporary canvas to save the current drawing if any
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sigCanvas.width;
    tempCanvas.height = sigCanvas.height;
    tempCanvas.getContext('2d').drawImage(sigCanvas, 0, 0);

    sigCanvas.width = rect.width;
    sigCanvas.height = 150; // fixed height
    sigCtx.lineWidth = 2;
    sigCtx.lineCap = 'round';
    sigCtx.strokeStyle = '#111';
    
    // Restore drawing
    sigCtx.drawImage(tempCanvas, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 100); // initialize"""

html = html.replace(old_resize, new_resize)

# Also fix the touch scrolling issue (prevent default on touchstart)
# We already did `sigCanvas.addEventListener('touchstart', startDraw, {passive:false});`
# But drawing logic needs to make sure we don't accidentally draw dots everywhere

with open('register.html', 'w') as f:
    f.write(html)
