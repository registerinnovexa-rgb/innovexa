import re

with open('register.html', 'r') as f:
    html = f.read()

# 1. Update the UI for the Photo section
old_ui = """      <!-- Photo Upload -->
      <div class="form-group" style="margin-bottom:24px;">
        <label class="form-label">Profile Photo (ID / Face) <span style="color:red;">*</span></label>
        <div style="display:flex; align-items:center; gap:16px;">
          <div id="photo-preview" style="width:80px; height:80px; border-radius:12px; border:2px dashed var(--border); background:var(--bg-2); display:flex; align-items:center; justify-content:center; overflow:hidden;">
            <span style="font-size:24px; color:var(--text-3);">👤</span>
          </div>
          <div style="flex:1;">
            <input type="file" id="photo-upload" accept="image/*" capture="user" style="display:none;" />
            <button type="button" class="btn-outline" onclick="document.getElementById('photo-upload').click()" style="padding:10px 16px; font-size:13px; width:100%; justify-content:center;">Capture / Upload Photo</button>
            <div style="font-size:11px; color:var(--text-3); margin-top:6px;">Must be a clear photo of your face. Max 4MB.</div>
          </div>
        </div>
      </div>"""

new_ui = """      <!-- Photo Upload -->
      <div class="form-group" style="margin-bottom:24px;">
        <label class="form-label">Profile Photo (ID / Face) <span style="color:red;">*</span></label>
        
        <div style="display:flex; flex-direction:column; gap:12px; background:var(--bg-2); border:1px solid var(--border); border-radius:12px; padding:16px;">
          
          <div style="display:flex; align-items:center; gap:16px;">
            <div id="photo-preview" style="width:80px; height:80px; border-radius:12px; border:2px dashed var(--border); background:var(--bg-1); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">
              <span style="font-size:24px; color:var(--text-3);">👤</span>
            </div>
            <div style="flex:1; display:flex; gap:10px; flex-wrap:wrap;">
              <input type="file" id="photo-upload" accept="image/*" style="display:none;" />
              <button type="button" class="btn-outline" onclick="document.getElementById('photo-upload').click()" style="flex:1; padding:10px; font-size:13px; justify-content:center;">📂 Upload File</button>
              <button type="button" class="btn-magnetic" id="btn-start-camera" style="flex:1; padding:10px; font-size:13px; justify-content:center;">📷 Use Camera</button>
            </div>
          </div>
          
          <!-- Live Camera View (Hidden by default) -->
          <div id="camera-container" style="display:none; flex-direction:column; gap:10px; margin-top:8px; border-top:1px dashed var(--border); padding-top:16px;">
            <video id="webcam-video" autoplay playsinline style="width:100%; border-radius:8px; background:#000; transform: scaleX(-1);"></video>
            <div style="display:flex; gap:10px;">
              <button type="button" class="btn-outline" id="btn-stop-camera" style="flex:1; font-size:12px;">Cancel</button>
              <button type="button" class="btn-magnetic" id="btn-snap-photo" style="flex:2; font-size:13px; background:#10b981; color:#fff;">📸 Snap Photo</button>
            </div>
          </div>
          
        </div>
        <div style="font-size:11px; color:var(--text-3); margin-top:8px;">Must be a clear photo of your face. Max 4MB.</div>
      </div>"""

html = html.replace(old_ui, new_ui)

# 2. Update JS Logic
old_js = """  photoUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];"""

new_js = """
  // --- Webcam Logic ---
  const btnStartCam = document.getElementById('btn-start-camera');
  const btnStopCam = document.getElementById('btn-stop-camera');
  const btnSnap = document.getElementById('btn-snap-photo');
  const camContainer = document.getElementById('camera-container');
  const video = document.getElementById('webcam-video');
  let stream = null;

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      video.srcObject = stream;
      camContainer.style.display = 'flex';
      btnStartCam.style.display = 'none';
    } catch (err) {
      alert("Camera permission denied or not available. Please upload a file instead.");
      console.error(err);
    }
  }

  function stopCamera() {
    if(stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    video.srcObject = null;
    camContainer.style.display = 'none';
    btnStartCam.style.display = 'flex';
  }

  btnStartCam.addEventListener('click', startCamera);
  btnStopCam.addEventListener('click', stopCamera);

  btnSnap.addEventListener('click', () => {
    if(!stream) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Flip context horizontally because video is mirrored (scaleX(-1))
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    compressedPhotoBase64 = canvas.toDataURL('image/jpeg', 0.6);
    photoPreview.innerHTML = `<img src="${compressedPhotoBase64}" style="width:100%; height:100%; object-fit:cover;" />`;
    
    stopCamera();
  });

  photoUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];"""

html = html.replace(old_js, new_js)

with open('register.html', 'w') as f:
    f.write(html)
