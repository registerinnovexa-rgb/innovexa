import re

with open('api/backend.js', 'r') as f:
    js = f.read()

# 1. Add check_email action
check_email_code = """
    // --- LIVE EMAIL CHECKER ---
    if (action === 'check_email') {
       const { email } = payload;
       if (!email) return res.status(200).json({ exists: false });
       const existing = await Member.findOne({ email: email.trim().toLowerCase() });
       return res.status(200).json({ exists: !!existing });
    }
"""
js = re.sub(
    r"(if\s*\(action\s*===\s*'register_member'\)\s*\{)",
    check_email_code + r"\n    \1",
    js
)

# 2. Upgrade the Registration Email to "Mission Briefing"
old_email_html = r"""<div style="font-family:sans-serif; max-width:600px; margin:0 auto; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
            <div style="background:#0f172a; padding:20px; text-align:center;">
              <h2 style="color:#22d3ee; margin:0;">Registration Received</h2>
            </div>
            <div style="padding:24px; color:#334155; line-height:1.6;">
              <p>Hello <strong>\$\{name\}</strong>,</p>
              <p>Your registration for Innovexa Hub has been successfully submitted.</p>
              <p><strong>Your Operative ID:</strong> <span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-family:monospace;">\$\{newId\}</span></p>
              <p>Our admin team is currently reviewing your application. You will receive another email once your clearance is approved.</p>
              <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e5e7eb; font-size:12px; color:#94a3b8; text-align:center;">
                <p>Innovexa Hub Administration<br>Do not reply to this automated message.</p>
              </div>
            </div>
          </div>"""

mission_briefing_html = """<div style="font-family:'Courier New', monospace; max-width:600px; margin:0 auto; background:#020617; border:1px solid #06b6d4; border-radius:8px; overflow:hidden;">
            <div style="background:#0f172a; padding:20px; text-align:center; border-bottom:1px solid #06b6d4;">
              <h2 style="color:#22d3ee; margin:0; letter-spacing:2px; text-transform:uppercase;">Classification: Confidential</h2>
              <div style="color:#94a3b8; font-size:12px; margin-top:5px;">INNOVEXA HUB - MISSION BRIEFING</div>
            </div>
            <div style="padding:30px; color:#e2e8f0; line-height:1.6;">
              <p style="color:#22d3ee;">> DECRYPTING MESSAGE...</p>
              <p>Greetings, <strong>${name}</strong>.</p>
              <p>Your application to join the Innovexa Hub has been successfully received by the Mainframe. You have taken your first step into a larger network of elite developers and operatives.</p>
              
              <div style="background:rgba(6, 182, 212, 0.1); border-left:4px solid #06b6d4; padding:15px; margin:20px 0;">
                <p style="margin:0; font-size:12px; color:#94a3b8; text-transform:uppercase;">Assigned Operative ID:</p>
                <p style="margin:5px 0 0 0; font-size:24px; font-weight:bold; color:#fff;">${newId}</p>
              </div>

              <p style="color:#22d3ee;">> CURRENT DIRECTIVE:</p>
              <ul style="color:#94a3b8;">
                <li>Stand by for Administrative Clearance.</li>
                <li>Your profile and payment UTR are currently undergoing verification protocols.</li>
                <li>Upon successful verification, you will receive your final access clearance and Forge credentials.</li>
              </ul>
              
              <p style="margin-top:30px;">Maintain readiness.</p>
              <p style="color:#22d3ee;">> END OF TRANSMISSION</p>
            </div>
          </div>"""

js = js.replace(old_email_html, mission_briefing_html)

with open('api/backend.js', 'w') as f:
    f.write(js)
