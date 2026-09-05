with open('register.html', 'r') as f:
    lines = f.readlines()

out = []
in_auth_box = False
for line in lines:
    if 'id="googleAuthBox"' in line:
        in_auth_box = True
        
        out.append("""<div class="auth-box" id="otpAuthBox" style="margin-bottom: 30px; text-align: center; border: 1px solid var(--border); padding: 30px; border-radius: 12px; background: rgba(0,0,0,0.02); transition: all 0.4s ease;">
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
      </div>\n""")
        continue
        
    if in_auth_box:
        if '<div class="grid-2">' in line:
            in_auth_box = False
            out.append(line)
        continue
        
    out.append(line)

html = "".join(out)

# Replace the script
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
    
    setTimeout(() => {
      authBox.style.display = 'none';
      // Enable fields
      document.getElementById('email').removeAttribute('readonly');
      document.getElementById('email').style.opacity = '1';
      document.getElementById('email').style.cursor = 'text';
    }, 400);
  });"""

if old_script in html:
    html = html.replace(old_script, new_script)
else:
    print("Warning: old_script not found")
    # if it's not found, maybe I can just inject it before </script> at the bottom.
    html = html.replace("</script>\n</body>", new_script + "\n</script>\n</body>")

# Remove google script tag
html = html.replace('<script src="https://accounts.google.com/gsi/client" async defer></script>', '')

with open('register.html', 'w') as f:
    f.write(html)
