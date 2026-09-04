import re

with open('register.html', 'r') as f:
    html = f.read()

old_resize = """  function resizeCanvas() {
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
  }"""

new_resize = """  function resizeCanvas() {
    const rect = sigCanvas.parentElement.getBoundingClientRect();
    if (rect.width === 0) return; // Hidden
    if (sigCanvas.width === Math.floor(rect.width)) return; // No change needed, prevent erase glitch
    
    // Create a temporary canvas to save the current drawing if any
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sigCanvas.width;
    tempCanvas.height = sigCanvas.height;
    tempCanvas.getContext('2d').drawImage(sigCanvas, 0, 0);

    sigCanvas.width = Math.floor(rect.width);
    sigCanvas.height = 150; // fixed height
    sigCtx.lineWidth = 2;
    sigCtx.lineCap = 'round';
    sigCtx.strokeStyle = '#111';
    
    // Restore drawing
    sigCtx.drawImage(tempCanvas, 0, 0);
  }"""

html = html.replace(old_resize, new_resize)

with open('register.html', 'w') as f:
    f.write(html)
