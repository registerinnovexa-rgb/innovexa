import re

with open('register.html', 'r') as f:
    html = f.read()

# Locate the current modal and replace it
current_modal_regex = r"<!-- Terms & Conditions Modal -->.*?</script>"

new_modal = """<!-- Terms & Conditions Modal -->
<div id="termsModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px); z-index:9999; justify-content:center; align-items:center; animation: fadeIn 0.3s ease;">
  <div style="background:var(--bg-1); border:1px solid var(--border); border-radius:16px; width:90%; max-width:700px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,0.3); transform: translateY(0); animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
    
    <!-- Modal Header -->
    <div style="padding:24px 32px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:var(--bg-2); border-radius:16px 16px 0 0;">
      <div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="background:var(--accent); color:#fff; width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-family:serif;">&sect;</span>
          <h2 style="font-size:20px; font-weight:800; color:var(--text-1); margin:0; letter-spacing:0.5px;">Terms of Service & Acceptable Use</h2>
        </div>
        <div style="font-size:12px; color:var(--text-3); margin-top:6px; font-family:monospace; letter-spacing:1px;">DOCUMENT ID: INVX-TOS-REV4 | CONFIDENTIAL</div>
      </div>
      <button onclick="document.getElementById('termsModal').style.display='none'" style="background:none; border:none; color:var(--text-3); font-size:28px; cursor:pointer; transition:color 0.2s;" onmouseover="this.style.color='var(--text-1)'" onmouseout="this.style.color='var(--text-3)'">&times;</button>
    </div>
    
    <!-- Modal Body (Scrollable) -->
    <div style="padding:32px; overflow-y:auto; color:var(--text-2); font-size:14.5px; line-height:1.7; background:var(--bg-1);">
      
      <p style="margin-bottom:24px; font-size:13px; color:var(--text-3); border-bottom:1px dashed var(--border); padding-bottom:16px;">
        By initializing your membership with Innovexa Hub, you enter into a binding agreement governed by the following strict protocols. Read carefully before accepting.
      </p>

      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px; font-weight:700; color:var(--text-1); margin:0 0 8px 0; display:flex; align-items:center; gap:8px;"><span style="color:var(--accent);">01.</span> Acceptance of Terms</h3>
        <p style="margin:0;">By registering an account and accessing the Innovexa Hub infrastructure, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
      </div>
      
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px; font-weight:700; color:var(--text-1); margin:0 0 8px 0; display:flex; align-items:center; gap:8px;"><span style="color:var(--accent);">02.</span> Confidentiality and Non-Disclosure</h3>
        <p style="margin:0;">During your tenure, you may gain access to proprietary project repositories and internal communications. You agree to maintain strict confidentiality regarding all internal operations. Sharing private data with unauthorized external entities is strictly prohibited.</p>
      </div>
      
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px; font-weight:700; color:var(--text-1); margin:0 0 8px 0; display:flex; align-items:center; gap:8px;"><span style="color:var(--accent);">03.</span> Intellectual Property</h3>
        <p style="margin:0;">All original code, designs, and resources developed collaboratively within the Forge remain the intellectual property of their respective creators and the Innovexa organization.</p>
      </div>
      
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px; font-weight:700; color:var(--text-1); margin:0 0 8px 0; display:flex; align-items:center; gap:8px;"><span style="color:var(--accent);">04.</span> Professional Conduct</h3>
        <p style="margin:0;">Members are required to maintain a professional, inclusive, and collaborative environment. Unauthorized penetration testing, data scraping, malware distribution, or intentional disruption of the Mainframe services is a direct violation.</p>
      </div>
      
      <!-- Critical Warning Box -->
      <div style="margin-bottom:24px; padding:20px; background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.2); border-left:4px solid #ef4444; border-radius:8px;">
        <h3 style="font-size:15px; font-weight:700; color:#b91c1c; margin:0 0 8px 0; display:flex; align-items:center; gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          05. Communication and Inactivity (Strict Policy)
        </h3>
        <p style="margin:0; color:var(--text-2);">Membership privileges are contingent upon active participation. If a member becomes inactive or fails to reply to Innovexa administration messages, requests, or tasks, the member will be <strong>immediately kicked out</strong> of the club. This ensures we maintain an active roster and make room exclusively for verified, contributing members.</p>
      </div>
      
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px; font-weight:700; color:var(--text-1); margin:0 0 8px 0; display:flex; align-items:center; gap:8px;"><span style="color:var(--accent);">06.</span> Limitation of Liability</h3>
        <p style="margin:0;">All resources provided by Innovexa are offered on an "as-is" basis. The organization assumes no liability for data loss or project downtime.</p>
      </div>
      
      <div style="margin-bottom:0;">
        <h3 style="font-size:15px; font-weight:700; color:var(--text-1); margin:0 0 8px 0; display:flex; align-items:center; gap:8px;"><span style="color:var(--accent);">07.</span> Termination of Access</h3>
        <p style="margin:0;">The Innovexa Administration reserves the absolute right to suspend, demote, or permanently terminate your account and revoke your clearance at any time for any conduct that violates these Terms.</p>
      </div>
      
    </div>
    
    <!-- Modal Footer -->
    <div style="padding:20px 32px; border-top:1px solid var(--border); background:var(--bg-2); border-radius:0 0 16px 16px; display:flex; justify-content:space-between; align-items:center;">
      <button onclick="document.getElementById('termsModal').style.display='none'" class="btn-outline" style="padding:10px 24px; font-size:14px; border:1px solid var(--border); background:transparent; color:var(--text-2); border-radius:8px; cursor:pointer;">Decline</button>
      <button onclick="acceptTerms()" class="btn-magnetic" style="padding:10px 32px; font-size:14px; font-weight:700; box-shadow:0 4px 12px rgba(6, 182, 212, 0.3);">I Agree &amp; Accept</button>
    </div>
  </div>
</div>

<style>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>

<script>
function showTermsModal(e) {
  if(e) e.preventDefault();
  document.getElementById('termsModal').style.display = 'flex';
}
function acceptTerms() {
  document.getElementById('termsModal').style.display = 'none';
  document.getElementById('termsCheckbox').checked = true;
}
</script>"""

html = re.sub(current_modal_regex, new_modal, html, flags=re.DOTALL)

with open('register.html', 'w') as f:
    f.write(html)
