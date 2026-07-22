import re

with open('/Users/jaiakash/Documents/Inno-porta/forge.html', 'r') as f:
    content = f.read()

# 1. Update UI
old_ui = """      <div class="form-group">
        <label class="form-label">Registered Email</label>
        <input type="email" id="loginEmail" class="form-input" placeholder="operative@example.com" />
      </div>
      
      <div class="form-group" id="otpGroup" style="display:none; margin-top:16px;">
        <label class="form-label">Email OTP</label>
        <input type="text" id="loginOtp" class="form-input" placeholder="123456" maxlength="6" style="letter-spacing:4px; text-align:center; font-family:var(--font-m);" />
        <p style="font-size:12px; color:var(--text-3); margin-top:8px;">Check your inbox (and spam) for the 6-digit code.</p>
      </div>

      <button id="sendOtpBtn" class="btn-dark" style="width:100%; margin-top:12px; padding:14px;" onclick="handleSendOtp()">Send OTP</button>
      <button id="loginBtn" class="btn-dark" style="width:100%; margin-top:12px; padding:14px; display:none;" onclick="handleLogin()">Verify & Initialize Link</button>"""

new_ui = """      <div class="form-group">
        <label class="form-label">Date of Birth (Security Key)</label>
        <input type="date" id="loginDob" class="form-input" />
      </div>

      <button id="loginBtn" class="btn-dark" style="width:100%; margin-top:12px; padding:14px;" onclick="handleLogin()">Initialize Link</button>"""

content = content.replace(old_ui, new_ui)

# 2. Update JS
old_js = """    async function handleSendOtp() {
      const id = document.getElementById('loginId').value.trim();
      const email = document.getElementById('loginEmail').value.trim();
      const err = document.getElementById('loginError');
      const btn = document.getElementById('sendOtpBtn');

      if (!id || !email) {
        err.textContent = 'Enter Operative ID and Email.';
        return;
      }
      
      err.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Dispatching Email...';

      try {
        const res = await gasGet('forge_send_otp', { invxId: id, email });
        if (res.success) {
          toast('OTP Sent to ' + email, 'success');
          document.getElementById('otpGroup').style.display = 'block';
          document.getElementById('sendOtpBtn').style.display = 'none';
          document.getElementById('loginBtn').style.display = 'block';
          document.getElementById('loginId').disabled = true;
          document.getElementById('loginEmail').disabled = true;
          document.getElementById('loginOtp').focus();
        } else {
          err.textContent = res.message || 'Failed to dispatch OTP.';
        }
      } catch(e) {
        err.textContent = 'Network error. Check connection.';
      }

      btn.disabled = false;
      btn.textContent = 'Resend OTP';
    }

    async function handleLogin() {
      const id = document.getElementById('loginId').value.trim();
      const email = document.getElementById('loginEmail').value.trim();
      const otp = document.getElementById('loginOtp').value.trim();
      const err = document.getElementById('loginError');
      const btn = document.getElementById('loginBtn');

      if (!id || !email || !otp) {
        err.textContent = 'Enter Operative ID, Email, and OTP.';
        return;
      }
      
      err.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Decrypting Access...';

      try {
        const res = await gasGet('forge_login', { invxId: id, email, otp });"""

new_js = """    async function handleLogin() {
      const id = document.getElementById('loginId').value.trim();
      const dob = document.getElementById('loginDob').value.trim();
      const err = document.getElementById('loginError');
      const btn = document.getElementById('loginBtn');

      if (!id || !dob) {
        err.textContent = 'Enter Operative ID and Date of Birth.';
        return;
      }
      
      err.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Decrypting Access...';

      try {
        const res = await gasGet('forge_login', { invxId: id, dob: dob });"""

content = content.replace(old_js, new_js)

# Also update the session creation object (email is removed)
content = content.replace("            email: email,\n", "            dob: dob,\n")

with open('/Users/jaiakash/Documents/Inno-porta/forge.html', 'w') as f:
    f.write(content)

print("forge.html patched for DOB!")
