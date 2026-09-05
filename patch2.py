import re
with open('register.html', 'r') as f:
    html = f.read()

pattern = r'<div class="auth-box" id="googleAuthBox".*?class="g_id_signin".*?</div>\s*</div>'

new_auth_box = """<div class="auth-box" id="otpAuthBox" style="margin-bottom: 30px; text-align: center; border: 1px solid var(--border); padding: 30px; border-radius: 12px; background: rgba(0,0,0,0.02); transition: all 0.4s ease;">
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

html = re.sub(pattern, new_auth_box, html, flags=re.DOTALL)

with open('register.html', 'w') as f:
    f.write(html)
