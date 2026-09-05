import re

with open('api/backend.js', 'r') as f:
    backend = f.read()

# Add RegistrationOTP to imports
import_str = "import { Member, ActionLog, Task, Sos, Session, Bounty, Resource, Attendance, Feedback, Asset, DocRequest, CertReq, PlatformSettings, EmailTemplate, Taxonomy, Dictionary, Announcement, RankConfig, RolePermissions, WebhookConfig, AccessControl, Faction, GamificationConfig, CertTemplate, CustomStyle, BroadcastMessage, AIConfig, ABTestConfig, AdminPresence"
new_import_str = import_str + ", RegistrationOTP"
backend = backend.replace(import_str, new_import_str)

# Insert endpoints right before 'if (action === 'register_member') {'
otp_endpoints = """
    if (action === 'register_request_otp') {
      const { email } = payload;
      if (!email) return res.status(200).json({ success: false, message: 'Missing email.' });
      
      const cleanEmail = email.trim().toLowerCase();
      const existing = await Member.findOne({ email: cleanEmail });
      if (existing) return res.status(200).json({ success: false, message: 'Email is already registered.' });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await RegistrationOTP.findOneAndUpdate(
        { email: cleanEmail },
        { otp, timestamp: Date.now() },
        { upsert: true, new: true }
      );
      
      try {
        await transporter.sendMail({
          from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
          to: cleanEmail,
          subject: `Innovexa Clearance Protocol - OTP: ${otp}`,
          html: `<div style="font-family:monospace;background:#0f0f0f;color:#fff;padding:24px;border-radius:8px;">
                   <h2>Security Clearance</h2>
                   <p>Your one-time access code is: <strong style="color:#10b981;font-size:24px;">${otp}</strong></p>
                   <p style="color:#a1a1aa;">This code will expire in 10 minutes.</p>
                 </div>`
        });
        return res.status(200).json({ success: true, message: 'OTP sent successfully.' });
      } catch(e) {
        return res.status(200).json({ success: false, message: 'Failed to send OTP email.' });
      }
    }

    if (action === 'register_verify_otp') {
      const { email, otp } = payload;
      const cleanEmail = (email||'').trim().toLowerCase();
      const record = await RegistrationOTP.findOne({ email: cleanEmail });
      if (!record) return res.status(200).json({ success: false, message: 'No OTP requested for this email or it has expired.' });
      
      if (record.otp === otp.trim()) {
        await RegistrationOTP.deleteOne({ email: cleanEmail });
        return res.status(200).json({ success: true, message: 'OTP Verified. Access Granted.' });
      } else {
        return res.status(200).json({ success: false, message: 'Invalid OTP.' });
      }
    }

"""

backend = backend.replace("if (action === 'register_member') {", otp_endpoints + "    if (action === 'register_member') {")

with open('api/backend.js', 'w') as f:
    f.write(backend)
