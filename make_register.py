html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Innovexa Hub | Clearance Protocol</title>
  <link rel="stylesheet" href="/assets/design.css" />
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <style>
    body { background: #050505; color: #a1a1aa; font-family: monospace; overflow: hidden; height: 100vh; margin: 0; display: flex; flex-direction: column; }
    
    /* Header */
    .header { padding: 20px; border-bottom: 1px solid rgba(16, 185, 129, 0.2); display: flex; justify-content: space-between; align-items: center; background: #0a0a0a; flex-shrink: 0; z-index: 10; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    .header-title { font-size: 16px; font-weight: 700; color: #10b981; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; gap: 10px; }
    .blinking-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0; } }

    /* Chat Area */
    .chat-container { flex: 1; overflow-y: auto; padding: 30px 20px; display: flex; flex-direction: column; gap: 20px; scroll-behavior: smooth; }
    
    .msg { max-width: 85%; display: flex; flex-direction: column; opacity: 0; animation: fadeUp 0.4s forwards; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .msg.ai { align-self: flex-start; }
    .msg.ai .bubble { background: #111; border: 1px solid rgba(16, 185, 129, 0.3); border-left: 3px solid #10b981; color: #e4e4e7; border-radius: 4px 12px 12px 12px; }
    .msg.ai .sender { color: #10b981; font-size: 10px; margin-bottom: 4px; letter-spacing: 1px; }

    .msg.user { align-self: flex-end; align-items: flex-end; }
    .msg.user .bubble { background: #10b981; color: #000; font-weight: 600; border-radius: 12px 4px 12px 12px; }
    .msg.user .sender { color: #a1a1aa; font-size: 10px; margin-bottom: 4px; letter-spacing: 1px; }
    
    .bubble { padding: 12px 16px; font-size: 14px; line-height: 1.5; font-family: sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }

    /* Input Area */
    .input-area { padding: 20px; background: #0a0a0a; border-top: 1px solid rgba(255, 255, 255, 0.1); flex-shrink: 0; min-height: 80px; display: flex; align-items: center; justify-content: center; }
    
    .field-group { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 15px; animation: fadeIn 0.3s forwards; }
    
    .text-input-wrap { display: flex; gap: 10px; }
    .text-input-wrap input, .text-input-wrap select { flex: 1; background: #111; border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; padding: 12px 16px; font-size: 16px; border-radius: 8px; outline: none; transition: border 0.2s; font-family: monospace; }
    .text-input-wrap input:focus, .text-input-wrap select:focus { border-color: #10b981; }
    
    .btn-send { background: #10b981; color: #000; border: none; padding: 0 24px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: transform 0.1s, background 0.2s; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .btn-send:hover { background: #0ea5e9; }
    .btn-send:active { transform: scale(0.95); }

    /* Grid Form for Multi-fields */
    .grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 600px) { .grid-form { grid-template-columns: 1fr; } }

    /* Chip Selection */
    .chip-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { padding: 8px 16px; background: #111; border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; font-size: 12px; cursor: pointer; color: #a1a1aa; transition: all 0.2s; font-family: sans-serif; font-weight: 600; }
    .chip.active { background: #10b981; color: #000; border-color: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }

    /* Camera UI */
    .camera-ui { background: #111; padding: 15px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3); display: flex; flex-direction: column; align-items: center; gap: 15px; }
    #webcam-video { width: 100%; max-width: 320px; border-radius: 8px; background: #000; transform: scaleX(-1); }
    #photo-preview-img { width: 100%; max-width: 320px; border-radius: 8px; display: none; }

    /* Signature UI */
    .sig-ui { background: #fff; border-radius: 8px; overflow: hidden; border: 2px solid #10b981; }
    #sig-canvas { width: 100%; height: 150px; display: block; touch-action: none; }
    
    /* Payment UI */
    .pay-ui { background: #111; padding: 20px; border-radius: 12px; border: 1px solid #10b981; text-align: center; }
    .qr-box { background: #fff; padding: 10px; border-radius: 8px; display: inline-block; margin: 15px 0; }
    
    /* Loader */
    .typing-indicator { display: flex; gap: 4px; padding: 8px 0; }
    .typing-indicator span { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: type 1s infinite; }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes type { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-4px); opacity: 1; } }

    /* Success Screen */
    .success-overlay { position: fixed; inset: 0; background: #050505; z-index: 100; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; opacity: 0; pointer-events: none; transition: opacity 0.5s; }
    .success-overlay.show { opacity: 1; pointer-events: all; }
    .id-card { background: linear-gradient(135deg, #10b981, #0ea5e9); padding: 3px; border-radius: 16px; margin-top: 30px; box-shadow: 0 20px 50px rgba(16, 185, 129, 0.3); animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .id-card-inner { background: #000; padding: 30px; border-radius: 14px; text-align: center; color: #fff; font-family: sans-serif; }
    .id-op { font-family: monospace; font-size: 32px; font-weight: 800; color: #10b981; margin: 20px 0; letter-spacing: 2px; }

  </style>
</head>
<body>

  <div class="header">
    <div class="header-title">
      <div class="blinking-dot"></div>
      INNOVEXA CLEARANCE PROTOCOL
    </div>
  </div>

  <div class="chat-container" id="chat">
    <!-- Messages injected here -->
  </div>

  <div class="input-area" id="input-area">
    <!-- Input injected here -->
  </div>

  <div class="success-overlay" id="success">
    <div style="font-size: 64px; margin-bottom: 20px;">🎖️</div>
    <h1 style="color: #fff; margin: 0 0 10px 0; font-family: sans-serif;">CLEARANCE GRANTED</h1>
    <p style="color: #a1a1aa; max-width: 400px; line-height: 1.6;">Your dossier has been submitted. The administration will review your application. Retain your Operative ID.</p>
    
    <div class="id-card">
      <div class="id-card-inner">
        <div style="font-size: 10px; letter-spacing: 2px; color: #a1a1aa;">TEMPORARY OPERATIVE ID</div>
        <div class="id-op" id="gen-id">INVX-XXXX</div>
        <button class="btn-send" style="padding: 12px 30px; width: 100%;" onclick="window.location.href='/'">RETURN TO TERMINAL</button>
      </div>
    </div>
  </div>

<script>
// --- State & Data ---
let currentState = 0;
const data = {
  email: '', otp: '', fullName: '', phone: '', dob: '', 
  college: '', branch: '', year: '', gender: '', 
  skillLevel: '', interests: [], 
  photo: '', signature: '', utr: ''
};

const chat = document.getElementById('chat');
const inputArea = document.getElementById('input-area');

// --- Helper Functions ---
async function apiPost(action, payload) {
  try {
    const res = await fetch('/api/backend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: { action, ...payload } })
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function scrollToBottom() {
  setTimeout(() => { chat.scrollTop = chat.scrollHeight; }, 50);
}

function addMsg(text, isAi=true, isHtml=false) {
  const div = document.createElement('div');
  div.className = `msg ${isAi ? 'ai' : 'user'}`;
  const sender = isAi ? 'CORE AI' : 'CANDIDATE';
  
  let content = text;
  if (!isHtml) {
    content = text.replace(/\\n/g, '<br>');
  }

  div.innerHTML = `
    <div class="sender">${sender}</div>
    <div class="bubble">${content}</div>
  `;
  chat.appendChild(div);
  scrollToBottom();
}

async function typeAi(text, delay=1000) {
  return new Promise(resolve => {
    // Show typing
    const div = document.createElement('div');
    div.className = 'msg ai typing-msg';
    div.innerHTML = `<div class="sender">CORE AI</div><div class="bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    chat.appendChild(div);
    scrollToBottom();
    
    setTimeout(() => {
      div.remove();
      addMsg(text);
      resolve();
    }, delay);
  });
}

function renderInput(html) {
  inputArea.innerHTML = `<div class="field-group">${html}</div>`;
  const firstInput = inputArea.querySelector('input');
  if (firstInput && firstInput.type !== 'file') firstInput.focus();
}

function clearInput() {
  inputArea.innerHTML = '';
}

// --- Image Compression ---
function compressImage(file, maxW=800, maxH=800) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement('canvas');
        let w = img.width, h = img.height;
        if(w > h) { if(w > maxW) { h *= maxW/w; w = maxW; } } 
        else      { if(h > maxH) { w *= maxH/h; h = maxH; } }
        cvs.width = w; cvs.height = h;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(cvs.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// --- Flow Logic ---
async function startFlow() {
  await typeAi("Welcome to the Innovexa Clearance Protocol.\\nTo begin, please provide your email address for verification.");
  renderState0();
}

function renderState0() {
  renderInput(`
    <div class="text-input-wrap">
      <input type="email" id="f_email" placeholder="agent@example.com" />
      <button class="btn-send" onclick="submitState0()">Verify</button>
    </div>
  `);
  document.getElementById('f_email').addEventListener('keypress', e => e.key === 'Enter' && submitState0());
}

async function submitState0() {
  const val = document.getElementById('f_email').value.trim();
  if(!val || !val.includes('@')) return alert('Valid email required.');
  
  data.email = val;
  addMsg(val, false);
  clearInput();
  
  await typeAi("Checking clearance...", 500);
  
  const res = await apiPost('register_request_otp', { email: val });
  if(!res.success) {
    await typeAi(`Error: ${res.message}\\nPlease try a different email.`);
    renderState0();
    return;
  }
  
  await typeAi(`An authorization code has been dispatched to ${val}.\\nEnter the 6-digit code below.`);
  renderState1();
}

function renderState1() {
  renderInput(`
    <div class="text-input-wrap">
      <input type="text" id="f_otp" placeholder="123456" maxlength="6" style="letter-spacing: 4px; text-align: center; font-size:24px; font-weight:bold;" />
      <button class="btn-send" onclick="submitState1()">Unlock</button>
    </div>
  `);
  document.getElementById('f_otp').addEventListener('keypress', e => e.key === 'Enter' && submitState1());
}

async function submitState1() {
  const val = document.getElementById('f_otp').value.trim();
  if(val.length !== 6) return alert('Enter 6-digit OTP.');
  
  addMsg("OTP: " + val, false);
  clearInput();
  
  const res = await apiPost('register_verify_otp', { email: data.email, otp: val });
  if(!res.success) {
    await typeAi(`Error: ${res.message}\\nTry again.`);
    renderState1();
    return;
  }
  
  await typeAi("Access Granted.\\nPlease state your full legal name.");
  renderState2();
}

function renderState2() {
  renderInput(`
    <div class="text-input-wrap">
      <input type="text" id="f_name" placeholder="John Doe" />
      <button class="btn-send" onclick="submitState2()">Submit</button>
    </div>
  `);
  document.getElementById('f_name').addEventListener('keypress', e => e.key === 'Enter' && submitState2());
}

async function submitState2() {
  const val = document.getElementById('f_name').value.trim();
  if(!val || val.split(' ').length < 2) return alert('Please enter your FULL name.');
  data.fullName = val;
  addMsg(val, false);
  clearInput();
  
  await typeAi("Identity noted.\\nProvide your contact number and Date of Birth.");
  renderState3();
}

function renderState3() {
  renderInput(`
    <div class="grid-form">
      <input type="tel" id="f_phone" placeholder="Phone (10 digits)" />
      <input type="date" id="f_dob" />
    </div>
    <button class="btn-send" onclick="submitState3()" style="width:100%; padding:14px;">Next</button>
  `);
}

async function submitState3() {
  const phone = document.getElementById('f_phone').value.trim();
  const dob = document.getElementById('f_dob').value;
  if(phone.length < 10) return alert('Invalid phone.');
  if(!dob) return alert('DOB required.');
  
  data.phone = phone; data.dob = dob;
  addMsg(`Phone: ${phone}\\nDOB: ${dob}`, false);
  clearInput();
  
  await typeAi("Provide your academic assignment:\\nCollege, Branch, Year, and Gender.");
  renderState4();
}

function renderState4() {
  renderInput(`
    <div class="grid-form">
      <input type="text" id="f_coll" placeholder="College Name" value="Yenepoya" />
      <select id="f_branch">
        <option value="" disabled selected>Select Branch</option>
        <option>Computer Science</option><option>Information Technology</option>
        <option>Electronics</option><option>Other</option>
      </select>
      <select id="f_year">
        <option value="" disabled selected>Year</option>
        <option>1st Year</option><option>2nd Year</option>
        <option>3rd Year</option><option>4th Year</option>
      </select>
      <select id="f_gender">
        <option value="" disabled selected>Gender</option>
        <option>Male</option><option>Female</option><option>Other</option>
      </select>
    </div>
    <button class="btn-send" onclick="submitState4()" style="width:100%; padding:14px;">Next</button>
  `);
}

async function submitState4() {
  const coll = document.getElementById('f_coll').value.trim();
  const br = document.getElementById('f_branch').value;
  const yr = document.getElementById('f_year').value;
  const gen = document.getElementById('f_gender').value;
  if(!coll || !br || !yr || !gen) return alert('All fields required.');
  
  data.college = coll; data.branch = br; data.year = yr; data.gender = gen;
  addMsg(`Academic profile logged.`, false);
  clearInput();
  
  await typeAi("Configure your Neural Loadout.\\nSelect your skill level and primary domains of interest.");
  renderState5();
}

function renderState5() {
  renderInput(`
    <div style="color:#fff; font-size:12px; margin-bottom:5px;">Skill Level:</div>
    <div class="chip-wrap" id="skill-wrap">
      <div class="chip active" onclick="setSkill(this)">Beginner</div>
      <div class="chip" onclick="setSkill(this)">Intermediate</div>
      <div class="chip" onclick="setSkill(this)">Advanced</div>
    </div>
    <div style="color:#fff; font-size:12px; margin-bottom:5px; margin-top:15px;">Domains (Select Multiple):</div>
    <div class="chip-wrap" id="int-wrap">
      <div class="chip" onclick="toggleInt(this)">Web Dev</div>
      <div class="chip" onclick="toggleInt(this)">AI/ML</div>
      <div class="chip" onclick="toggleInt(this)">Cybersecurity</div>
      <div class="chip" onclick="toggleInt(this)">App Dev</div>
      <div class="chip" onclick="toggleInt(this)">UI/UX</div>
      <div class="chip" onclick="toggleInt(this)">Cloud</div>
    </div>
    <button class="btn-send" onclick="submitState5()" style="width:100%; padding:14px; margin-top:15px;">Save Loadout</button>
  `);
  data.skillLevel = 'Beginner';
}

function setSkill(el) {
  document.querySelectorAll('#skill-wrap .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  data.skillLevel = el.innerText;
}
function toggleInt(el) { el.classList.toggle('active'); }

async function submitState5() {
  const ints = Array.from(document.querySelectorAll('#int-wrap .active')).map(c => c.innerText);
  if(ints.length === 0) return alert('Select at least one domain.');
  data.interests = ints;
  
  addMsg(`Level: ${data.skillLevel}\\nDomains: ${ints.join(', ')}`, false);
  clearInput();
  
  await typeAi("Biometric capture required.\\nPlease provide a clear photo of your face.");
  renderState6();
}

let stream = null;
function renderState6() {
  renderInput(`
    <div class="camera-ui">
      <video id="webcam-video" autoplay playsinline></video>
      <img id="photo-preview-img" />
      <div style="display:flex; gap:10px; width:100%;">
        <button class="btn-send" id="btn-cam" onclick="takePhoto()" style="flex:1;">📸 Capture</button>
        <button class="btn-send" id="btn-cam-done" onclick="submitState6()" style="flex:1; background:#333; display:none;">Proceed</button>
      </div>
      <div style="font-size:11px; text-decoration:underline; cursor:pointer;" onclick="document.getElementById('upload-photo').click()">Or upload file instead</div>
      <input type="file" id="upload-photo" accept="image/*" style="display:none;" onchange="handlePhotoUpload(this)" />
    </div>
  `);
  initCam();
}

async function initCam() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    document.getElementById('webcam-video').srcObject = stream;
  } catch(e) {
    alert('Camera access denied. Please use the upload option.');
  }
}

function stopCam() {
  if(stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
}

async function takePhoto() {
  const vid = document.getElementById('webcam-video');
  const cvs = document.createElement('canvas');
  cvs.width = vid.videoWidth; cvs.height = vid.videoHeight;
  const ctx = cvs.getContext('2d');
  // Handle flip
  ctx.translate(cvs.width, 0); ctx.scale(-1, 1);
  ctx.drawImage(vid, 0, 0, cvs.width, cvs.height);
  
  const b64 = cvs.toDataURL('image/jpeg', 0.8);
  setPhotoAndPreview(b64);
}

async function handlePhotoUpload(input) {
  if(!input.files[0]) return;
  const b64 = await compressImage(input.files[0]);
  setPhotoAndPreview(b64);
}

function setPhotoAndPreview(b64) {
  data.photo = b64;
  stopCam();
  document.getElementById('webcam-video').style.display = 'none';
  const img = document.getElementById('photo-preview-img');
  img.src = b64;
  img.style.display = 'block';
  document.getElementById('btn-cam').style.display = 'none';
  document.getElementById('btn-cam-done').style.display = 'block';
  document.getElementById('btn-cam-done').style.background = '#10b981';
}

async function submitState6() {
  if(!data.photo) return alert('Photo required.');
  addMsg("Biometric photo provided.", false);
  clearInput();
  
  await typeAi("Provide your digital signature in the pad below to authorize your application.");
  renderState7();
}

let sigPadCtx, isDrawing = false;
function renderState7() {
  renderInput(`
    <div style="width:100%; max-width:400px; display:flex; flex-direction:column; gap:10px;">
      <div class="sig-ui">
        <canvas id="sig-canvas"></canvas>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="font-size:11px; cursor:pointer; text-decoration:underline;" onclick="clearSig()">Clear Signature</span>
        <button class="btn-send" onclick="submitState7()">Sign & Proceed</button>
      </div>
    </div>
  `);
  
  const cvs = document.getElementById('sig-canvas');
  cvs.width = cvs.offsetWidth; cvs.height = 150;
  sigPadCtx = cvs.getContext('2d');
  sigPadCtx.lineWidth = 2; sigPadCtx.strokeStyle = '#000';
  
  function getPos(e) {
    const r = cvs.getBoundingClientRect();
    const evt = e.touches ? e.touches[0] : e;
    return { x: evt.clientX - r.left, y: evt.clientY - r.top };
  }
  cvs.onmousedown = cvs.ontouchstart = (e) => { e.preventDefault(); isDrawing = true; const p = getPos(e); sigPadCtx.beginPath(); sigPadCtx.moveTo(p.x, p.y); };
  cvs.onmousemove = cvs.ontouchmove = (e) => { if(!isDrawing) return; e.preventDefault(); const p = getPos(e); sigPadCtx.lineTo(p.x, p.y); sigPadCtx.stroke(); };
  cvs.onmouseup = cvs.onmouseout = cvs.ontouchend = () => isDrawing = false;
}

function clearSig() {
  const cvs = document.getElementById('sig-canvas');
  sigPadCtx.clearRect(0, 0, cvs.width, cvs.height);
}

async function submitState7() {
  const cvs = document.getElementById('sig-canvas');
  // Check if blank (rough check)
  const px = sigPadCtx.getImageData(0,0,cvs.width,cvs.height).data;
  let hasPixel = false;
  for(let i=3; i<px.length; i+=4) { if(px[i]>0) { hasPixel = true; break; } }
  if(!hasPixel) return alert('Signature is blank.');
  
  data.signature = cvs.toDataURL('image/png');
  addMsg("Signature applied.", false);
  clearInput();
  
  await typeAi("Final Step: Clearance Fee.\\nBased on your profile, the initialization fee is ₹599.\\nScan the QR code, pay, and enter the UTR below.");
  renderState8();
}

function renderState8() {
  renderInput(`
    <div class="pay-ui">
      <div style="font-size:12px; letter-spacing:1px; color:#a1a1aa;">AMOUNT TO PAY</div>
      <div style="font-size:24px; font-weight:800; color:#10b981;">₹ 599</div>
      <div class="qr-box">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi%3A%2F%2Fpay%3Fpa%3Dgpay-12200845070%40okbizaxis%26pn%3DInnovexa%2520Hub%26am%3D599.00%26cu%3DINR" style="width:150px; display:block;" />
      </div>
      <div style="font-size:11px; margin-bottom:15px; color:#a1a1aa;">UPI: gpay-12200845070@okbizaxis</div>
      
      <div class="text-input-wrap">
        <input type="text" id="f_utr" placeholder="Enter 12-digit UTR" maxlength="15" />
        <button class="btn-send" id="btn-final" onclick="submitFinal()">Finalize</button>
      </div>
    </div>
  `);
}

async function submitFinal() {
  const utr = document.getElementById('f_utr').value.trim();
  if(!utr || utr.length < 10) return alert('Valid UTR required.');
  
  data.utr = utr;
  
  const btn = document.getElementById('btn-final');
  btn.disabled = true; btn.innerText = 'Encrypting...';
  
  const payload = {
    action: 'register_member',
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    college: data.college,
    dob: data.dob,
    year: data.year,
    gender: data.gender,
    branch: data.branch,
    skillLevel: data.skillLevel,
    interests: data.interests.join(', '),
    amount: '599',
    utr: data.utr,
    photo: data.photo,
    signature: data.signature
  };
  
  const res = await apiPost('register_member', payload);
  if(!res.success) {
    alert(res.message);
    btn.disabled = false; btn.innerText = 'Finalize';
    return;
  }
  
  clearInput();
  addMsg(`UTR Submitted: ${utr}`, false);
  await typeAi("Dossier compiled successfully.\\nUploading to Mainframe...");
  
  setTimeout(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    document.getElementById('gen-id').innerText = (res.data && res.data.operativeId) ? res.data.operativeId : 'INVX-WAIT';
    document.getElementById('success').classList.add('show');
  }, 1000);
}

// Start sequence
window.onload = startFlow;
</script>

</body>
</html>
