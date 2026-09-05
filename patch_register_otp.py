with open('register.html', 'r') as f:
    html = f.read()

# Replace Google Auth Box with OTP Box
old_auth_box = """<div class="auth-box" id="googleAuthBox" style="margin-bottom: 30px; text-align: center; border: 1px solid var(--border); padding: 30px; border-radius: 12px; background: rgba(0,0,0,0.02);">
        <div style="margin-bottom: 16px;">
          <!-- Fingerprint or auth icon -->
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 12v.01"></path>
            <path d="M18.8 9.3a8.97 8.97 0 0 0-13.6 0"></path>
            <path d="M21 15.3a12.98 12.98 0 0 0-18 0"></path>
            <path d="M12 3a9 9 0 0 0-9 9"></path>
            <path d="M3 12a9 9 0 0 0 9 9"></path>
          </svg>
        </div>
        <div style="font-family: var(--font-b); font-size: 16px; font-weight: 500; color: var(--text-1); margin-bottom: 8px;">
          Authenticate to Continue
        </div>
        <div style="font-size: 13px; color: var(--text-2); margin-bottom: 24px; max-width: 300px; line-height: 1.5;">
          Secure your identity using your Google account to proceed with the initialization protocol.
        </div>
        <div id="g_id_onload"
             data-client_id="716046248385-t0sm55a2lsistn37a51cbbn8pbr2no9d.apps.googleusercontent.com"
             data-context="signup"
             data-ux_mode="popup"
             data-callback="handleCredentialResponse"
             data-auto_prompt="false">
        </div>
        <div class="g_id_signin"
             data-type="standard"
             data-shape="pill"
             data-theme="filled_black"
             data-text="continue_with"
             data-size="large"
             data-logo_alignment="left"
             style="display: flex; justify-content: center; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));">
        </div>
      </div>"""

new_auth_box = """<div class="auth-box" id="otpAuthBox" style="margin-bottom: 30px; text-align: center; border: 1px solid var(--border); padding: 30px; border-radius: 12px; background: rgba(0,0,0,0.02);">
        <div style="margin-bottom: 16px;">
          <!-- Auth icon -->
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 12v.01"></path>
            <path d="M18.8 9.3a8.97 8.97 0 0 0-13.6 0"></path>
            <path d="M21 15.3a12.98 12.98 0 0 0-18 0"></path>
            <path d="M12 3a9 9 0 0 0-9 9"></path>
            <path d="M3 12a9 9 0 0 0 9 9"></path>
          </svg>
        </div>
        <div style="font-family: var(--font-b); font-size: 16px; font-weight: 500; color: var(--text-1); margin-bottom: 8px;">
          Authenticate to Continue
        </div>
        <div style="font-size: 13px; color: var(--text-2); margin-bottom: 24px; line-height: 1.5;">
          Secure your identity using an Email OTP to proceed with the initialization protocol.
        </div>
        
        <div id="otp-step-1">
          <input class="form-control" id="authEmail" type="email" placeholder="Enter your email address" style="max-width:300px; margin: 0 auto 12px auto; text-align:center;" />
          <button type="button" class="btn-magnetic" id="btnRequestOtp" style="padding: 10px 24px;">Request OTP</button>
        </div>
        
        <div id="otp-step-2" style="display:none;">
          <input class="form-control" id="authOtp" type="text" placeholder="123456" maxlength="6" style="max-width:200px; margin: 0 auto 12px auto; text-align:center; font-size:20px; letter-spacing:4px; font-weight:bold;" />
          <button type="button" class="btn-magnetic" id="btnVerifyOtp" style="padding: 10px 24px;">Verify & Unlock</button>
        </div>
      </div>"""

if old_auth_box in html:
    html = html.replace(old_auth_box, new_auth_box)
else:
    print("Warning: old_auth_box not found precisely, attempting regex replacement.")
    import re
    html = re.sub(r'<div class="auth-box" id="googleAuthBox".*?</div>\s*</div>', new_auth_box, html, flags=re.DOTALL)

# Replace the Google Auth script with OTP logic script
old_script = """function handleCredentialResponse(response) {
    const data = jwt_decode(response.credential);
    
    // Auto-fill form fields
    document.getElementById('email').value = data.email;
    document.getElementById('fullName').value = data.name;
    
    // Hide auth box with animation
    const authBox = document.getElementById('googleAuthBox');
    authBox.style.opacity = '0';
    authBox.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      authBox.style.display = 'none';
      // Enable fields
      document.getElementById('email').removeAttribute('readonly');
      document.getElementById('email').style.opacity = '1';
      document.getElementById('email').style.cursor = 'text';
    }, 400);
  }"""

new_script = """async function apiPost(action, payload) {
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

  document.getElementById('btnRequestOtp').addEventListener('click', async () => {
    const email = document.getElementById('authEmail').value.trim();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    const btn = document.getElementById('btnRequestOtp');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    
    const res = await apiPost('register_request_otp', { email });
    if (!res.success) {
      alert(res.message);
      btn.textContent = 'Request OTP';
      btn.disabled = false;
      return;
    }
    
    document.getElementById('otp-step-1').style.display = 'none';
    document.getElementById('otp-step-2').style.display = 'block';
  });

  document.getElementById('btnVerifyOtp').addEventListener('click', async () => {
    const email = document.getElementById('authEmail').value.trim();
    const otp = document.getElementById('authOtp').value.trim();
    if (otp.length !== 6) {
      alert('Enter 6-digit OTP.');
      return;
    }
    
    const btn = document.getElementById('btnVerifyOtp');
    btn.textContent = 'Verifying...';
    btn.disabled = true;
    
    const res = await apiPost('register_verify_otp', { email, otp });
    if (!res.success) {
      alert(res.message);
      btn.textContent = 'Verify & Unlock';
      btn.disabled = false;
      return;
    }
    
    // Auto-fill form fields
    document.getElementById('email').value = email;
    
    // Hide auth box with animation
    const authBox = document.getElementById('otpAuthBox');
    authBox.style.opacity = '0';
    authBox.style.transform = 'translateY(-10px)';
    authBox.style.transition = 'all 0.4s ease';
    
    setTimeout(() => {
      authBox.style.display = 'none';
      // Enable fields
      document.getElementById('email').removeAttribute('readonly');
      document.getElementById('email').style.opacity = '1';
      document.getElementById('email').style.cursor = 'text';
    }, 400);
  });"""

html = html.replace(old_script, new_script)

with open('register.html', 'w') as f:
    f.write(html)
