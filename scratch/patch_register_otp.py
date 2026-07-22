import re

with open('/Users/jaiakash/Documents/Inno-porta/register.html', 'r') as f:
    content = f.read()

# 1. Update the HTML for the phone field
old_phone_html = r"""        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input class="form-control" id="phone" type="tel" placeholder="10-digit mobile number" maxlength="10" />
        </div>"""

new_phone_html = r"""        <div class="form-group">
          <label class="form-label">Phone Number (WhatsApp Verification)</label>
          <div style="display:flex; gap:8px;">
            <input class="form-control" id="phone" type="tel" placeholder="10-digit mobile number" maxlength="10" />
            <button type="button" class="btn-dark" id="btn-send-otp" style="padding:0 16px;">Verify</button>
          </div>
          <div id="otp-section" style="display:none; margin-top:12px; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; gap:8px;">
              <input class="form-control" id="otp-input" type="text" placeholder="Enter OTP" maxlength="6" />
              <button type="button" class="btn-magnetic" id="btn-verify-otp" style="padding:0 16px; min-width:80px;">Confirm</button>
            </div>
            <p id="otp-msg" style="font-size:12px; margin-top:6px; color:var(--text-3);"></p>
          </div>
        </div>"""
content = content.replace(old_phone_html, new_phone_html)

# 2. Add the JS for OTP generation and validation
old_js_nav = r"""  // Navigation
  function showError(id, msg) {"""

new_js_otp = r"""  // OTP Verification
  let generatedOTP = null;
  let isPhoneVerified = false;

  document.getElementById('btn-send-otp').addEventListener('click', async () => {
    const phone = document.getElementById('phone').value.trim();
    if (phone.length !== 10 || isNaN(phone)) {
        showError('phone', 'Enter a valid 10-digit number');
        return;
    }
    
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const btn = document.getElementById('btn-send-otp');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    
    try {
        await fetch('https://webhook.botpress.cloud/0acd28af-d120-4783-8f54-52a37c508b49', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: "91" + phone,
                otp: generatedOTP,
                type: "whatsapp_otp"
            })
        });
        document.getElementById('otp-section').style.display = 'block';
        document.getElementById('otp-msg').textContent = 'OTP sent to your WhatsApp via Botpress.';
        document.getElementById('otp-msg').style.color = 'var(--accent2)';
        btn.textContent = 'Sent';
    } catch(e) {
        showError('phone', 'Failed to send OTP. Try again.');
        btn.textContent = 'Verify';
        btn.disabled = false;
    }
  });

  document.getElementById('btn-verify-otp').addEventListener('click', () => {
    const input = document.getElementById('otp-input').value.trim();
    if (input === generatedOTP) {
        isPhoneVerified = true;
        document.getElementById('phone').disabled = true;
        document.getElementById('btn-send-otp').style.display = 'none';
        document.getElementById('otp-section').innerHTML = '<span style="color:var(--accent2); font-weight:600;">✓ Phone Verified via WhatsApp</span>';
    } else {
        document.getElementById('otp-msg').textContent = 'Invalid OTP. Please try again.';
        document.getElementById('otp-msg').style.color = '#ef4444';
    }
  });

  // Navigation
  function showError(id, msg) {"""
content = content.replace(old_js_nav, new_js_otp)

# 3. Add validation to block step 2 if not verified
old_validation = r"""    if (valid) {
      document.getElementById('step-1').classList.add('hidden');"""

new_validation = r"""    if (!isPhoneVerified) {
      showError('phone', 'Please verify your phone number via WhatsApp to continue.');
      valid = false;
    }

    if (valid) {
      document.getElementById('step-1').classList.add('hidden');"""
content = content.replace(old_validation, new_validation)

with open('/Users/jaiakash/Documents/Inno-porta/register.html', 'w') as f:
    f.write(content)

print("Patched register.html successfully!")
