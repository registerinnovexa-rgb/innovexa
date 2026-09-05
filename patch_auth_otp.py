import re

with open('register.html', 'r') as f:
    html = f.read()

pattern_auth = r'<div class="auth-section".*?<div class="g_id_signin".*?</div>\s*</div>'

new_auth = """<div class="auth-section" id="otpAuthBox" style="background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 32px 24px; margin-bottom: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 2px 10px rgba(0,0,0,0.02); transition: all 0.4s ease;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16V12" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8H12.01" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div style="font-family: var(--font-b); font-size: 16px; font-weight: 500; color: var(--text-1); margin-bottom: 8px;">
          Authenticate to Continue
        </div>
        <div style="font-size: 13px; color: var(--text-2); margin-bottom: 24px; max-width: 300px; line-height: 1.5;">
          Secure your identity using an Email OTP to proceed with the initialization protocol.
        </div>
        
        <div id="otp-step-1" style="width: 100%; max-width: 300px;">
          <input class="form-control" id="authEmail" type="email" placeholder="Enter your email address" style="margin-bottom: 12px; text-align:center;" />
          <button type="button" class="btn-magnetic" id="btnRequestOtp" style="padding: 12px 24px; width: 100%;">Request OTP</button>
        </div>
        
        <div id="otp-step-2" style="display:none; width: 100%; max-width: 300px;">
          <input class="form-control" id="authOtp" type="text" placeholder="123456" maxlength="6" style="margin-bottom: 12px; text-align:center; font-size:20px; letter-spacing:4px; font-weight:bold;" />
          <button type="button" class="btn-magnetic" id="btnVerifyOtp" style="padding: 12px 24px; width: 100%;">Verify & Unlock</button>
        </div>
      </div>"""

html = re.sub(pattern_auth, new_auth, html, flags=re.DOTALL)

# Replace the script
old_script = r'function handleCredentialResponse\(response\) \{.*?\}, 400\);\s*\}'

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
    
    setTimeout(() => {
      authBox.style.display = 'none';
      // Enable fields
      document.getElementById('email').removeAttribute('readonly');
      document.getElementById('email').style.opacity = '1';
      document.getElementById('email').style.cursor = 'text';
    }, 400);
  });"""

html = re.sub(old_script, new_script, html, flags=re.DOTALL)

# Remove google script tag
html = html.replace('<script src="https://accounts.google.com/gsi/client" async defer></script>', '')

# Fix the label for email
html = html.replace('<label class="form-label">Email Address (via Google)</label>', '<label class="form-label">Email Address (Verified)</label>')
html = html.replace('placeholder="Waiting for Google Auth..."', 'placeholder="Waiting for OTP Auth..."')

with open('register.html', 'w') as f:
    f.write(html)
