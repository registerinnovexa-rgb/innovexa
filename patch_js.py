import re

with open('register.html', 'r') as f:
    html = f.read()

js_addition = """
  // --- Photo & Signature Logic ---
  let compressedPhotoBase64 = null;
  const photoUpload = document.getElementById('photo-upload');
  const photoPreview = document.getElementById('photo-preview');

  photoUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        compressedPhotoBase64 = canvas.toDataURL('image/jpeg', 0.6);
        photoPreview.innerHTML = `<img src="${compressedPhotoBase64}" style="width:100%; height:100%; object-fit:cover;" />`;
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Signature Pad
  const sigCanvas = document.getElementById('signature-pad');
  const sigCtx = sigCanvas.getContext('2d');
  let isDrawing = false;
  let hasSignature = false;

  // Fix internal resolution vs CSS resolution
  function resizeCanvas() {
    const rect = sigCanvas.parentElement.getBoundingClientRect();
    sigCanvas.width = rect.width;
    sigCanvas.height = 150; // fixed height
    sigCtx.lineWidth = 2;
    sigCtx.lineCap = 'round';
    sigCtx.strokeStyle = '#111';
  }
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 100); // initialize

  function getPos(e) {
    const rect = sigCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    hasSignature = true;
    const pos = getPos(e);
    sigCtx.beginPath();
    sigCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if(!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    sigCtx.lineTo(pos.x, pos.y);
    sigCtx.stroke();
  }

  function endDraw(e) {
    e.preventDefault();
    isDrawing = false;
  }

  sigCanvas.addEventListener('mousedown', startDraw);
  sigCanvas.addEventListener('mousemove', draw);
  sigCanvas.addEventListener('mouseup', endDraw);
  sigCanvas.addEventListener('mouseout', endDraw);
  
  sigCanvas.addEventListener('touchstart', startDraw, {passive:false});
  sigCanvas.addEventListener('touchmove', draw, {passive:false});
  sigCanvas.addEventListener('touchend', endDraw, {passive:false});

  document.getElementById('clear-signature').addEventListener('click', () => {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    hasSignature = false;
  });
"""

# Insert before submission logic
html = html.replace('// Submission\n  let isSubmitting', js_addition + '\n  // Submission\n  let isSubmitting')

# Update submit handler to require and send them
validation_addition = """
    if(!compressedPhotoBase64) {
      alert("⚠️ You must upload a profile photo.");
      return;
    }
    if(!hasSignature) {
      alert("⚠️ You must provide a digital signature.");
      return;
    }
    const signatureBase64 = sigCanvas.toDataURL('image/png');
"""

html = html.replace("const utr = document.getElementById('utr').value.trim();", validation_addition + "\n    const utr = document.getElementById('utr').value.trim();")

# Update payload
html = html.replace(
    'dob: document.getElementById(\'dob\').value,',
    'dob: document.getElementById(\'dob\').value,\n          photo: compressedPhotoBase64,\n          signature: signatureBase64,'
)

with open('register.html', 'w') as f:
    f.write(html)
