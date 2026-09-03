import re

with open('register.html', 'r') as f:
    html = f.read()

# 1. Inject the Terms checkbox before the Back/Submit buttons
checkbox_html = """
      <!-- Terms and Conditions Agreement -->
      <div class="form-group" style="display:flex; align-items:flex-start; gap:12px; margin: 32px 0; background:rgba(6, 182, 212, 0.05); border:1px solid rgba(6, 182, 212, 0.2); padding:16px; border-radius:12px;">
        <input type="checkbox" id="termsCheckbox" style="margin-top:2px; width:18px; height:18px; accent-color:var(--accent); cursor:pointer;">
        <label for="termsCheckbox" style="font-size:13px; color:var(--text-2); line-height:1.5; cursor:pointer;">
          I have read and agree to the <a href="#" onclick="showTermsModal(event)" style="color:var(--accent); font-weight:600; text-decoration:none;">Terms of Service & Rules</a>. I understand that failing to respond to administrative communications or remaining inactive will result in immediate termination to make room for verified members.
        </label>
      </div>
"""
# Insert before `<div style="display:flex; justify-content:space-between; margin-top:32px;">` which likely holds the back/submit buttons, or just before btn-outline.
html = re.sub(
    r'(<div[^>]*>\s*<button class="btn-outline" id="btn-back">)',
    checkbox_html + r'\n      \1',
    html
)

# 2. Inject the Terms Modal HTML at the end of the body
modal_html = """
<!-- Terms & Conditions Modal -->
<div id="termsModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); z-index:9999; justify-content:center; align-items:center;">
  <div style="background:var(--bg-2); border:1px solid rgba(6, 182, 212, 0.3); border-radius:16px; width:90%; max-width:650px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 10px 40px rgba(0,0,0,0.5);">
    <div style="padding:24px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
      <h2 style="font-size:20px; font-weight:700; color:#fff; margin:0; letter-spacing:0.5px;">INNOVEXA HUB: TERMS OF SERVICE</h2>
      <button onclick="document.getElementById('termsModal').style.display='none'" style="background:none; border:none; color:var(--text-3); font-size:24px; cursor:pointer;">&times;</button>
    </div>
    <div style="padding:24px; overflow-y:auto; color:var(--text-2); font-size:14px; line-height:1.6;">
      <p style="margin-bottom:16px;"><strong>1. Acceptance of Terms</strong><br>By registering an account and accessing the Innovexa Hub infrastructure, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
      
      <p style="margin-bottom:16px;"><strong>2. Confidentiality and Non-Disclosure</strong><br>During your tenure, you may gain access to proprietary project repositories and internal communications. You agree to maintain strict confidentiality regarding all internal operations. Sharing private data with unauthorized external entities is strictly prohibited.</p>
      
      <p style="margin-bottom:16px;"><strong>3. Intellectual Property and Contributions</strong><br>All original code, designs, and resources developed collaboratively within the Forge remain the intellectual property of their respective creators and the Innovexa organization.</p>
      
      <p style="margin-bottom:16px;"><strong>4. Professional Conduct and Acceptable Use</strong><br>Members are required to maintain a professional, inclusive, and collaborative environment. Unauthorized penetration testing, data scraping, malware distribution, or intentional disruption of the Mainframe services is a direct violation.</p>
      
      <p style="margin-bottom:16px; color:#fff; font-weight:600; padding:12px; background:rgba(239, 68, 68, 0.1); border-left:3px solid #ef4444; border-radius:4px;">
        5. Communication and Inactivity (Strict Policy)<br>
        <span style="font-weight:400; color:var(--text-2);">Membership privileges are contingent upon active participation. If a member becomes inactive or fails to reply to Innovexa administration messages, requests, or tasks, the member will be immediately kicked out of the club. This ensures we maintain an active roster and make room exclusively for verified, contributing members.</span>
      </p>
      
      <p style="margin-bottom:16px;"><strong>6. Limitation of Liability</strong><br>All resources provided by Innovexa are offered on an "as-is" basis. The organization assumes no liability for data loss or project downtime.</p>
      
      <p style="margin-bottom:0;"><strong>7. Termination of Access</strong><br>The Innovexa Administration reserves the absolute right to suspend, demote, or permanently terminate your account and revoke your clearance at any time for any conduct that violates these Terms.</p>
    </div>
    <div style="padding:20px 24px; border-top:1px solid rgba(255,255,255,0.05); text-align:right;">
      <button onclick="acceptTerms()" class="btn-magnetic" style="padding:10px 20px; font-size:14px;">I Agree</button>
    </div>
  </div>
</div>
<script>
function showTermsModal(e) {
  e.preventDefault();
  document.getElementById('termsModal').style.display = 'flex';
}
function acceptTerms() {
  document.getElementById('termsModal').style.display = 'none';
  document.getElementById('termsCheckbox').checked = true;
}
</script>
"""

# Insert modal right before </body>
html = html.replace("</body>", modal_html + "\n</body>")

with open('register.html', 'w') as f:
    f.write(html)
