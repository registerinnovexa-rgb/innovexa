import { connectToDatabase } from './db.js';
import { Member, ActionLog, Task, Sos, Session, Bounty, Resource, Attendance, Feedback, Asset, DocRequest, CertReq, PlatformSettings, EmailTemplate, Taxonomy, Dictionary, Announcement, RankConfig, RolePermissions, WebhookConfig, AccessControl, Faction, GamificationConfig, CertTemplate, CustomStyle, BroadcastMessage, AIConfig, ABTestConfig, AdminPresence, RegistrationOTP } from './models.js';
import nodemailer from 'nodemailer';

// ── Global Zoho Mail Transporter ─────────────────────────────────────────────
// Uses Zoho SMTP. Set EMAIL_USER=updates.innovexa@zohomail.in and EMAIL_PASS in env.
function createTransporter() {
  const user = process.env.EMAIL_USER || '';
  let host = 'smtp.zoho.in';
  if (user.includes('@gmail.com')) {
    host = 'smtp.gmail.com';
  } else if (user.includes('@zoho.com')) {
    host = 'smtp.zoho.com';
  }
  
  return nodemailer.createTransport({
    host: host,
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}
const transporter = createTransporter();

// Global interceptor to prevent emails from going to spam
const originalSendMail = transporter.sendMail.bind(transporter);
transporter.sendMail = async (options) => {
  if (!options.text && options.html) {
    // Generate a simple text fallback by stripping HTML tags
    options.text = options.html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }
  // Set reply-to to help with deliverability
  if (!options.replyTo) {
    options.replyTo = `"Innovexa Hub Support" <${process.env.EMAIL_USER}>`;
  }
  return originalSendMail(options);
};


// ── Innovexa Brand Email Template Builder (Template D) ────────────────────────
function buildEmail({ title, subtitle = '', bodyHtml, accentColor = '#7c3aed', iconEmoji = '📧', footerNote = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <!-- Card -->
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- Hero Header -->
      <div style="background:linear-gradient(90deg,${accentColor} 0%,#000000 60%);padding:28px 32px;display:flex;align-items:center;gap:16px;">
        <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;">${iconEmoji}</div>
        <div>
          <div style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Innovexa Hub</div>
          <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:3px;">${title}</div>
          ${subtitle ? '<div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:2px;">' + subtitle + '</div>' : ''}
        </div>
      </div>
      <!-- Body -->
      <div style="padding:32px;">
        ${bodyHtml}
      </div>
      <!-- Footer -->
      <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
        <p style="margin:0;font-size:11px;color:#94a3b8;">© Innovexa Hub · Bangalore</p>
        <a href="https://innovexa-portal.vercel.app" style="font-size:11px;color:${accentColor};text-decoration:none;font-weight:600;">Visit Portal →</a>
      </div>
    </div>
    ${footerNote ? '<p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">' + footerNote + '</p>' : ''}
  </div>
</body>
</html>`;
}

function buildOtpBlock(otp, accentColor = '#7c3aed') {
  return `
    <div style="margin:0 0 24px;border-radius:12px;overflow:hidden;">
      <div style="background:${accentColor};padding:10px 24px;text-align:center;">
        <span style="font-size:11px;color:rgba(255,255,255,0.85);letter-spacing:3px;text-transform:uppercase;font-weight:600;">Your Access Code</span>
      </div>
      <div style="background:#faf5ff;border:2px solid ${accentColor};border-top:none;padding:24px;text-align:center;border-radius:0 0 12px 12px;">
        <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#000000;font-family:'Courier New',monospace;">${otp}</div>
        <div style="margin-top:8px;font-size:13px;color:${accentColor};font-weight:600;">⏱ Valid for 15 minutes</div>
      </div>
    </div>`;
}

// ── Admin Notification Helper ────────────────────────────────────────────────
// Sends a quick email to admin for every tracked member action.
async function notifyAdmin({ type, operativeId, name, detail, urgent = false }) {
  // Always send to admin inbox — hardcoded fallback ensures delivery even if ADMIN_EMAIL env missing
  const adminEmail = process.env.ADMIN_EMAIL || 'updates.innovexa@zohomail.in';
  if (!process.env.EMAIL_USER) { console.warn('notifyAdmin: EMAIL_USER not set, skipping'); return; }
  const typeConfig = {
    LOGIN:            { icon: '🔐', color: '#6366f1', label: 'Member Login' },
    TASK_SUBMITTED:   { icon: '📤', color: '#f59e0b', label: 'Task Submitted' },
    TASK_RECALLED:    { icon: '↩️', color: '#64748b', label: 'Task Recalled' },
    TASK_COMPLETED:   { icon: '✅', color: '#10b981', label: 'Task Completed' },
    TASK_CREATED:     { icon: '🆕', color: '#000000', label: 'Task Created' },
    TASK_UPDATED:     { icon: '✏️', color: '#3b82f6', label: 'Task Updated' },
    TASK_DELETED:     { icon: '🗑️', color: '#ef4444', label: 'Task Deleted' },
    SOS_CREATED:      { icon: '🆘', color: '#ef4444', label: 'SOS Alert' },
    BOUNTY_CLAIMED:   { icon: '🎯', color: '#f59e0b', label: 'Bounty Claimed' },
    BOUNTY_COMPLETED: { icon: '🏆', color: '#10b981', label: 'Bounty Completed' },
    PROFILE_UPDATED:  { icon: '✏️', color: '#3b82f6', label: 'Profile Updated' },
    REGISTRATION:     { icon: '🆕', color: '#000000', label: 'New Registration' },
    STATUS_CHECK:     { icon: '🔍', color: '#06b6d4', label: 'Status Check' },
    STATUS_CHANGE:    { icon: '🔄', color: '#f59e0b', label: 'Status Changed' },
  };
  const cfg = typeConfig[type] || { icon: '📋', color: '#6b7280', label: type.replace(/_/g,' ') };
  const urgentBar = urgent ? `<div style="background:#ef4444;color:#fff;padding:10px 18px;border-radius:8px;font-weight:700;font-size:13px;margin-bottom:20px;letter-spacing:.5px;">🚨 URGENT — Immediate Action Required</div>` : '';
  try {
    await transporter.sendMail({
      from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `${cfg.icon} [${cfg.label}] ${name} · ${operativeId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

          <div style="text-align:center; padding:32px 0 16px;">
            <img src="https://innovexareg.vercel.app/assets/logo.png" alt="Innovexa Hub" style="height:56px; width:auto;">
          </div>
          <div style="max-width:520px;margin:0 auto 32px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,${cfg.color} 0%,${cfg.color}cc 100%);padding:28px 32px;">
              ${urgentBar}
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:52px;height:52px;background:rgba(255,255,255,.2);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">${cfg.icon}</div>
                <div>
                  <div style="font-size:11px;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:2px;font-weight:600;">${urgent ? '🚨 Urgent ' : ''}Admin Alert</div>
                  <div style="font-size:20px;font-weight:700;color:#fff;margin-top:2px;">${cfg.label}</div>
                </div>
              </div>
            </div>
            <!-- Body -->
            <div style="padding:28px 32px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:12px 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;width:36%;">Operative ID</td>
                  <td style="padding:12px 0;font-size:14px;font-weight:700;color:${cfg.color};font-family:monospace;">${operativeId}</td>
                </tr>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:12px 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Member Name</td>
                  <td style="padding:12px 0;font-size:14px;font-weight:600;color:#1e293b;">${name}</td>
                </tr>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:12px 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Date & Time</td>
                  <td style="padding:12px 0;font-size:13px;color:#64748b;">${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'})}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;vertical-align:top;">Detail</td>
                  <td style="padding:12px 0;font-size:14px;color:#334155;line-height:1.6;">${detail || 'No additional detail'}</td>
                </tr>
              </table>
            </div>
            <!-- CTA -->
            <div style="padding:0 32px 28px;">
              <a href="https://innovexareg.vercel.app/admin.html" style="display:block;text-align:center;padding:13px 24px;background:${cfg.color};color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:.3px;">Open Admin Console →</a>
            </div>
            <!-- Footer -->
            <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Innovexa Hub Auto-Alert System · All actions are logged</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  } catch(e) {
    console.error('notifyAdmin failed:', e.message);
  }
}

async function notifyUser(email, subject, htmlContent) {
  if (!email || !process.env.EMAIL_USER) return;
  try {
    await transporter.sendMail({
      from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

          <div style="text-align:center; padding:32px 0 16px;">
            <img src="https://innovexareg.vercel.app/assets/logo.png" alt="Innovexa Hub" style="height:56px; width:auto;">
          </div>
          <div style="max-width:520px;margin:0 auto 32px;background:#ffffff;border-radius:0px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
            <div style="background:var(--accent,#000000);padding:24px 32px;">
              <h2 style="margin:0;font-size:20px;color:#000;">${subject}</h2>
            </div>
            <div style="padding:32px;">
              ${htmlContent}
            </div>
            <div style="padding:16px 32px;background:#f8fafc;border-top:1px dashed #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Innovexa Hub - Do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  } catch (e) {
    console.error('notifyUser failed:', e.message);
  }
}

export default async function handler(req, res) {
  // Allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse payload
  let payload = {};
  if (req.method === 'POST') {
    payload = req.body.payload || req.body || {};
  } else if (req.method === 'GET') {
    payload = req.query || {};
    
    // Extract from proxy url format
    let targetUrl = req.query.url || req.query._gasUrl || '';
    if (targetUrl) {
      try {
        const urlObj = new URL(targetUrl);
        urlObj.searchParams.forEach((value, key) => {
          payload[key] = value;
        });
      } catch(e) {
        // Handle case where targetUrl is just a path or invalid URL
        try {
           const dummy = new URL('http://localhost' + (targetUrl.startsWith('/') ? '' : '/') + targetUrl);
           dummy.searchParams.forEach((value, key) => {
             payload[key] = value;
           });
        } catch(err) {}
      }
    }
  }

  const action = payload.action || payload.op || '';
  
  try {
    await connectToDatabase();
    
    // PUBLIC: Counter & Confirmed Ticker
    if (action === 'count') {
      const c = await Member.countDocuments({});
      return res.status(200).json({ success: true, data: { count: c }, count: c });
    }
    
    if (action === 'get_confirmed') {
      const confirmed = await Member.find({ status: { $in: ['Approved', 'Confirmed'] } }, 'name').lean();
      const names = confirmed.map(m => m.name);
      return res.status(200).json({ success: true, names: names });
    }

    // PUBLIC: Site Config — all admin-managed public settings in one call
    // Used by admin-features.js loaded on every public page
    if (action === 'get_site_config') {
      const [
        announcements,
        broadcasts,
        customStyle,
        abTest,
        rankCfg,
        gameCfg
      ] = await Promise.all([
        Announcement.find({ published: true }).sort({ pinned: -1, createdAt: -1 }).limit(10).lean(),
        BroadcastMessage.find({}).sort({ createdAt: -1 }).limit(5).lean(),
        CustomStyle.findOne({ key: 'forge' }).lean(),
        ABTestConfig.findOne({ key: 'register' }).lean(),
        RankConfig.findOne({ key: 'global' }).lean(),
        GamificationConfig.findOne({ key: 'global' }).lean()
      ]);
      return res.status(200).json({
        success: true,
        data: {
          announcements: announcements || [],
          broadcasts: broadcasts || [],
          customCss: customStyle ? customStyle.cssRules : '',
          abVariant: abTest ? (abTest.activeVariant || 'A') : 'A',
          ranks: rankCfg ? rankCfg.ranks : [],
          gamification: gameCfg ? { xpMultiplier: gameCfg.xpMultiplier, taskBaseXP: gameCfg.taskBaseXP, loginXP: gameCfg.loginXP } : {}
        }
      });
    }

    // PUBLIC: Status Check
    if (action === 'status_check') {
      const { email, utr, phone, id } = payload;
      let query = [];
      if (email) query.push({ email: email.trim().toLowerCase() });
      if (utr) query.push({ utr: utr.trim() });
      if (phone) query.push({ phone: phone.trim() });
      if (id) query.push({ operativeId: id.trim().toUpperCase() });
      
      if (query.length === 0) return res.status(200).json({ success: false, message: 'No search parameters provided.' });

      const member = await Member.findOne({ $or: query });
      if (member) {
        // Log status check
        const log = new ActionLog({
          timestamp: new Date(),
          type: 'STATUS_CHECK',
          content: `A member has checked their application status.`,
          operativeId: member.operativeId,
          name: member.name
        });
        await log.save();

        await notifyAdmin({
          type: 'STATUS_CHECK',
          operativeId: member.operativeId,
          name: member.name,
          detail: `${member.name} checked their application status.`
        });

        return res.status(200).json({
          success: true,
          found: true,
          data: {
            name: member.name,
            email: member.email,
            phone: member.phone,
            year: member.year,
            branch: member.branch,
            skillLevel: member.skillLevel,
            dob: member.dob,
            interests: member.interests,
            utr: member.utr,
            status: member.status,
            amount: member.amount,
            operativeId: member.operativeId,
            gender: member.gender,
            forgeRole: member.forgeRole,
            linkedMentor: member.linkedMentor,
            forgeAccess: member.forgeAccess,
            college: member.college
          }
        });
      }
      return res.status(200).json({ success: true, found: false, message: 'No record found.' });
    }
    
    // FORGE: Request Login OTP
    if (action === 'forge_request_otp') {
      const { invxId } = payload;
      if (!invxId) return res.status(200).json({ success: false, message: 'Missing Operative ID.' });
      
      const member = await Member.findOne({ operativeId: invxId.trim().toUpperCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Operative ID not found.' });
      if (member.forgeAccess !== 'Granted') return res.status(200).json({ success: false, message: 'Access Denied: You do not have Forge Access.' });
      if (!member.email) return res.status(200).json({ success: false, message: 'No email associated with this ID.' });

      // OTP Rate Limiting: check if a recent OTP was already sent
      const cfg = await PlatformSettings.findOne({ key: 'global' });
      const rateLimitSeconds = cfg ? cfg.otpRateLimitSeconds : 60;
      if (member.otpTime && (Date.now() - member.otpTime < rateLimitSeconds * 1000)) {
        const wait = Math.ceil((rateLimitSeconds * 1000 - (Date.now() - member.otpTime)) / 1000);
        return res.status(200).json({ success: false, message: `Please wait ${wait}s before requesting a new code.` });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      member.otp = otp;
      member.otpTime = Date.now();
      member.otpAttempts = 0; // reset attempts on new OTP
      await member.save();
      
      try {
        await transporter.sendMail({
          from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
          to: member.email,
          subject: `🔐 Your Innovexa Login Code: ${otp}`,
          html: buildEmail({
            title: 'Forge Login Code',
            subtitle: 'Innovexa Forge Dashboard',
            iconEmoji: '🔐',
            accentColor: '#7c3aed',
            bodyHtml: `
              <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
              <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.7;">
                Use the secure code below to log into your <strong style="color:#7c3aed;">Innovexa Forge</strong> dashboard.
              </p>
              ${buildOtpBlock(otp)}
              <div style="background:#f9fafb;border-radius:8px;padding:14px 18px;border-left:4px solid #7c3aed;">
                <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                  🔒 <strong style="color:#374151;">Security notice:</strong> Never share this code. Innovexa staff will never ask for your OTP.
                </p>
              </div>
            \`
          })
        });
        console.log(`OTP sent to ${member.email}`);
      } catch (err) {
        console.error('Failed to send OTP email:', err.message);
        // Still return success — OTP is saved in DB so admin can look it up
      }
      
      const maskedEmail = member.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + gp3.replace(/./g, '*'));
      return res.status(200).json({ success: true, message: 'Login code sent to ' + maskedEmail });
    }

    // FORGE: Verify OTP
    if (action === 'forge_verify_otp') {
      const { invxId, otp } = payload;
      if (!invxId || !otp) return res.status(200).json({ success: false, message: 'Missing parameters.' });
      
      const member = await Member.findOne({ operativeId: invxId.trim().toUpperCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Operative ID not found.' });

      // Max attempt lockout
      const cfg = await PlatformSettings.findOne({ key: 'global' });
      const maxAttempts = cfg ? cfg.otpMaxAttempts : 5;
      if ((member.otpAttempts || 0) >= maxAttempts) {
        return res.status(200).json({ success: false, message: `Too many failed attempts. Request a new code.` });
      }

      // Expiry check
      if (!member.otp || Date.now() - member.otpTime > 15 * 60 * 1000) {
        member.otp = '';
        await member.save();
        return res.status(200).json({ success: false, message: 'Login code expired. Please request a new one.' });
      }

      // Wrong OTP
      if (member.otp !== otp) {
        member.otpAttempts = (member.otpAttempts || 0) + 1;
        await member.save();
        const remaining = maxAttempts - member.otpAttempts;
        return res.status(200).json({ success: false, message: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` });
      }
      
      // Clear OTP and log login
      member.otp = '';
      member.otpAttempts = 0;
      member.loginCount = (member.loginCount || 0) + 1;
      member.lastLoginTime = new Date().toISOString();
      await member.save();

      // Save login activity log
      await new ActionLog({
        timestamp: new Date(),
        type: 'LOGIN',
        content: `Operative ${member.name} logged into Innovexa Forge.`,
        operativeId: member.operativeId,
        name: member.name
      }).save();

      // Notify admin of login
      await notifyAdmin({
        type: 'LOGIN',
        operativeId: member.operativeId,
        name: member.name,
        detail: `${member.name} logged into the Forge dashboard. Total logins: ${member.loginCount}.`
      });
      
      return res.status(200).json({
        success: true,
        data: {
          name: member.name,
          role: member.forgeRole,
          access: member.forgeAccess,
          college: member.college,
          xp: member.xp,
          rank: member.rank,
          squad: member.squad,
          operativeId: member.operativeId,
          linkedMentor: member.linkedMentor,
          skillLevel: member.skillLevel,
          email: member.email,
          phone: member.phone
        }
      });
    }
    
    // ADMIN: Edit Member Profile (Feature #1)
    if (action === 'admin_edit_member') {
      const { operativeId, name, email, phone, college, branch, year, xp, rank, squad, forgeRole, status, photoUrl, signature } = payload;
      if (!operativeId) return res.status(200).json({ success: false, message: 'Missing operativeId.' });
      const member = await Member.findOne({ operativeId: operativeId.trim().toUpperCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });
      const before = { name: member.name, email: member.email, phone: member.phone, college: member.college, branch: member.branch, year: member.year, xp: member.xp, rank: member.rank, squad: member.squad, forgeRole: member.forgeRole, status: member.status };
      if (name !== undefined) member.name = name.trim();
      if (email !== undefined) member.email = email.trim().toLowerCase();
      if (phone !== undefined) member.phone = phone.trim();
      if (college !== undefined) member.college = college.trim();
      if (branch !== undefined) member.branch = branch.trim();
      if (year !== undefined) member.year = year.trim();
      if (xp !== undefined) member.xp = parseInt(xp);
      if (rank !== undefined) member.rank = rank.trim();
      if (squad !== undefined) member.squad = squad.trim();
      if (forgeRole !== undefined) member.forgeRole = forgeRole.trim();
      if (status !== undefined) member.status = status.trim();
      if (photoUrl !== undefined) member.photoUrl = photoUrl;
      if (signature !== undefined) member.signature = signature;
      let notifications = [];
      let justApproved = false;
      if (status !== undefined && status !== before.status) {
        if (status === 'Confirmed' || status === 'Approved') {
          justApproved = true;
        } else {
          notifications.push(`Status changed to: <strong>${status}</strong>`);
        }
      }
      if (xp !== undefined && xp !== before.xp) notifications.push(`XP Balance updated: <strong>${xp} XP</strong>`);
      if (forgeRole !== undefined && forgeRole !== before.forgeRole) notifications.push(`Role assigned: <strong>${forgeRole}</strong>`);
      if (squad !== undefined && squad !== before.squad) notifications.push(`Squad assignment: <strong>${squad}</strong>`);

      await member.save();
      await new ActionLog({ timestamp: new Date(), type: 'PROFILE_UPDATED', content: `Admin edited profile. Changes: ${JSON.stringify(before)} → saved.`, operativeId: member.operativeId, name: member.name }).save();
      
      if (justApproved && member.email) {
        try {
          await transporter.sendMail({
            from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
            to: member.email,
            subject: `🎉 Congratulations! Your Innovexa Membership is Approved`,
            html: `
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
              <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
                <div style="text-align:center; padding:32px 0 16px;">
                  <img src="https://innovexareg.vercel.app/assets/logo.png" alt="Innovexa Hub" style="height:56px; width:auto;">
                </div>
                <div style="max-width:520px;margin:0 auto 32px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
                  <div style="background:#000000;padding:36px 32px;text-align:center;">
                    <div style="font-size:52px;margin-bottom:12px;">🎉</div>
                    <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">You're officially in!</h1>
                    <p style="margin:10px 0 0;color:rgba(255,255,255,.8);font-size:15px;">Welcome to Innovexa Hub, ${member.name}</p>
                  </div>
                  <div style="padding:32px;">
                    <p style="color:#475569;font-size:15px;margin:0 0 24px;text-align:center;">Your membership has been <strong style="color:#10b981;">approved</strong>. Here's your unique Operative ID:</p>
                    <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border:2px solid #c4b5fd;border-radius:14px;padding:28px;text-align:center;margin-bottom:24px;">
                      <div style="font-size:11px;font-weight:700;color:#000000;text-transform:uppercase;letter-spacing:3px;margin-bottom:10px;">Your Operative ID</div>
                      <div style="font-size:36px;font-weight:800;color:#5b21b6;font-family:'Courier New',monospace;letter-spacing:6px;">${member.operativeId}</div>
                      <div style="margin-top:12px;font-size:12px;color:#94a3b8;">Use this ID to log in to your Forge dashboard</div>
                    </div>
                    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">Access the <strong>Innovexa Forge</strong> — your personal dashboard for exclusive resources, task bounties, the leaderboard, and SOS support.</p>
                    <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:15px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">Access the Forge Dashboard →</a>
                  </div>
                  <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Innovexa Hub · If you have any issues, contact your admin.</p>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          console.log(`Approval email sent to ${member.email}`);
        } catch (emailErr) {
          console.error('Approval email failed:', emailErr.message);
        }
      }

      if (notifications.length > 0 && member.email) {
        await notifyUser(member.email, 'Innovexa Hub Profile Update', `
          <p style="font-size:14px;color:#334155;line-height:1.6;margin-top:0;">Your Operative profile was recently updated by an Administrator.</p>
          <ul style="margin:20px 0;padding-left:20px;color:#0f172a;font-size:14px;line-height:1.8;">
            ${notifications.map(n => `<li>${n}</li>`).join('')}
          </ul>
          <a href="https://innovexareg.vercel.app/forge.html" style="display:inline-block;padding:10px 20px;background:#000000;color:#fff;text-decoration:none;font-weight:700;font-size:13px;margin-top:10px;">VIEW DASHBOARD →</a>
        `);
      }
      
      return res.status(200).json({ success: true, message: 'Member profile updated.', data: member });
    }

    // ADMIN: Reset Member Operative ID (Feature #1 - Security Reset)
    if (action === 'admin_reset_member_id') {
      const { operativeId } = payload;
      if (!operativeId) return res.status(200).json({ success: false, message: 'Missing operativeId.' });
      const member = await Member.findOne({ operativeId: operativeId.trim().toUpperCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });
      let newId = '';
      let isUnique = false;
      while (!isUnique) {
        const rand = Math.floor(10000 + Math.random() * 90000).toString();
        newId = 'INVX-' + rand;
        const check = await Member.findOne({ operativeId: newId });
        if (!check) isUnique = true;
      }
      const oldId = member.operativeId;
      member.operativeId = newId;
      member.otp = '';
      member.otpAttempts = 0;
      await member.save();
      await new ActionLog({ timestamp: new Date(), type: 'PROFILE_UPDATED', content: `Admin reset Operative ID from ${oldId} to ${newId}.`, operativeId: newId, name: member.name }).save();
      return res.status(200).json({ success: true, message: `ID reset from ${oldId} to ${newId}.`, newId });
    }

    // ADMIN: Get Rank Config (Feature #2)
    if (action === 'admin_get_rank_config') {
      let cfg = await RankConfig.findOne({ key: 'global' });
      if (!cfg) {
        cfg = await RankConfig.create({ key: 'global', ranks: [
          { name: 'Apprentice', minXP: 0, maxXP: 199 },
          { name: 'Scout', minXP: 200, maxXP: 499 },
          { name: 'Operative', minXP: 500, maxXP: 999 },
          { name: 'Vanguard', minXP: 1000, maxXP: 2499 },
          { name: 'Commander', minXP: 2500, maxXP: 4999 },
          { name: 'Warlord', minXP: 5000, maxXP: 999999 }
        ]});
      }
      return res.status(200).json({ success: true, data: cfg });
    }

    if (action === 'admin_save_rank_config') {
      const { ranks } = payload;
      if (!ranks || !Array.isArray(ranks)) return res.status(200).json({ success: false, message: 'Invalid ranks array.' });
      const cfg = await RankConfig.findOneAndUpdate(
        { key: 'global' },
        { $set: { ranks, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: cfg, message: 'Rank config saved.' });
    }

    // ADMIN: Email Templates (Feature #5)
    if (action === 'admin_get_email_templates') {
      const templates = await EmailTemplate.find({}).lean();
      return res.status(200).json({ success: true, data: templates });
    }

    if (action === 'admin_save_email_template') {
      const { key, subject, html } = payload;
      if (!key) return res.status(200).json({ success: false, message: 'Missing template key.' });
      const tpl = await EmailTemplate.findOneAndUpdate(
        { key },
        { $set: { subject, html, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: tpl, message: 'Template saved.' });
    }

    // ADMIN: Taxonomies — colleges, branches, event categories (Feature #7)
    if (action === 'admin_get_taxonomies') {
      const { category } = payload;
      const query = category ? { category } : {};
      const items = await Taxonomy.find(query).sort({ order: 1, value: 1 }).lean();
      return res.status(200).json({ success: true, data: items });
    }

    if (action === 'admin_add_taxonomy') {
      const { category, value } = payload;
      if (!category || !value) return res.status(200).json({ success: false, message: 'Missing category or value.' });
      const existing = await Taxonomy.findOne({ category, value: value.trim() });
      if (existing) return res.status(200).json({ success: false, message: 'Value already exists.' });
      const item = await Taxonomy.create({ category, value: value.trim() });
      return res.status(200).json({ success: true, data: item, message: 'Taxonomy value added.' });
    }

    if (action === 'admin_delete_taxonomy') {
      const { id } = payload;
      if (!id) return res.status(200).json({ success: false, message: 'Missing id.' });
      await Taxonomy.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Taxonomy value deleted.' });
    }

    // ADMIN: Dictionary / String Overrides (Feature #12)
    if (action === 'admin_get_dictionary') {
      const items = await Dictionary.find({}).lean();
      return res.status(200).json({ success: true, data: items });
    }

    if (action === 'admin_save_dictionary') {
      const { entries } = payload; // array of { key, value }
      if (!entries || !Array.isArray(entries)) return res.status(200).json({ success: false, message: 'Invalid entries.' });
      for (const e of entries) {
        await Dictionary.findOneAndUpdate({ key: e.key }, { $set: { value: e.value } }, { upsert: true });
      }
      return res.status(200).json({ success: true, message: 'Dictionary saved.' });
    }

    // ADMIN: Custom Report Builder / Export (Feature #14)
    if (action === 'admin_export_report') {
      const { columns, statusFilter, dateFrom, dateTo } = payload;
      const query = {};
      if (statusFilter && statusFilter !== 'all') query.status = statusFilter;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }
      const allMembers = await Member.find(query).lean();
      const allowedCols = ['operativeId','name','email','phone','college','branch','year','status','xp','rank','squad','forgeRole','loginCount','lastLoginTime'];
      const cols = (columns && Array.isArray(columns)) ? columns.filter(c => allowedCols.includes(c)) : allowedCols;
      const rows = allMembers.map(m => cols.map(c => (m[c] !== undefined && m[c] !== null) ? String(m[c]).replace(/,/g, ';') : '').join(','));
      const csv = [cols.join(','), ...rows].join('\n');
      return res.status(200).json({ success: true, data: csv, count: allMembers.length });
    }

    // ADMIN: Announcements / CMS (Feature #15)
    if (action === 'admin_get_announcements') {
      const items = await Announcement.find({}).sort({ pinned: -1, createdAt: -1 }).lean();
      return res.status(200).json({ success: true, data: items });
    }

    if (action === 'admin_create_announcement') {
      const { title, body, published, pinned, author } = payload;
      if (!title) return res.status(200).json({ success: false, message: 'Title is required.' });
      const rand = Math.floor(10000 + Math.random() * 90000);
      const item = await Announcement.create({
        announcementId: 'ANN-' + rand,
        title, body: body || '', published: !!published, pinned: !!pinned, author: author || 'Admin',
        createdAt: new Date(), updatedAt: new Date()
      });
      return res.status(200).json({ success: true, data: item, message: 'Announcement created.' });
    }

    if (action === 'admin_update_announcement') {
      const { announcementId, title, body, published, pinned } = payload;
      if (!announcementId) return res.status(200).json({ success: false, message: 'Missing announcementId.' });
      const item = await Announcement.findOneAndUpdate(
        { announcementId },
        { $set: { title, body, published: !!published, pinned: !!pinned, updatedAt: new Date() } },
        { new: true }
      );
      return res.status(200).json({ success: true, data: item, message: 'Announcement updated.' });
    }

    if (action === 'admin_delete_announcement') {
      const { announcementId } = payload;
      await Announcement.findOneAndDelete({ announcementId });
      return res.status(200).json({ success: true, message: 'Announcement deleted.' });
    }

    // ADMIN: Role Permissions Engine (Feature #6)
    if (action === 'admin_get_role_permissions') {
      let cfg = await RolePermissions.findOne({ key: 'global' });
      if (!cfg) {
        cfg = await RolePermissions.create({
          key: 'global',
          permissions: {
            Vanguard:  { canReviewTasks: true,  canCreateBounties: true,  canManageEvents: false, canViewAuditLogs: false, canAccessForge: true  },
            Commander: { canReviewTasks: true,  canCreateBounties: true,  canManageEvents: true,  canViewAuditLogs: true,  canAccessForge: true  },
            Operative: { canReviewTasks: false, canCreateBounties: false, canManageEvents: false, canViewAuditLogs: false, canAccessForge: true  },
            Scout:     { canReviewTasks: false, canCreateBounties: false, canManageEvents: false, canViewAuditLogs: false, canAccessForge: true  },
            Apprentice:{ canReviewTasks: false, canCreateBounties: false, canManageEvents: false, canViewAuditLogs: false, canAccessForge: true  },
            Warlord:   { canReviewTasks: true,  canCreateBounties: true,  canManageEvents: true,  canViewAuditLogs: true,  canAccessForge: true  },
          }
        });
      }
      return res.status(200).json({ success: true, data: cfg });
    }

    if (action === 'admin_save_role_permissions') {
      const { permissions } = payload;
      const cfg = await RolePermissions.findOneAndUpdate(
        { key: 'global' },
        { $set: { permissions, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: cfg, message: 'Permissions saved.' });
    }

    // ADMIN: Webhook Manager (Feature #11)
    if (action === 'admin_get_webhooks') {
      const hooks = await WebhookConfig.find({}).lean();
      return res.status(200).json({ success: true, data: hooks });
    }

    if (action === 'admin_save_webhook') {
      const { event, url, enabled } = payload;
      if (!event) return res.status(200).json({ success: false, message: 'Missing event type.' });
      const hook = await WebhookConfig.findOneAndUpdate(
        { event },
        { $set: { url: url || '', enabled: enabled !== false, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: hook, message: 'Webhook saved.' });
    }

    if (action === 'admin_test_webhook') {
      const { event } = payload;
      const hook = await WebhookConfig.findOne({ event });
      if (!hook || !hook.url) return res.status(200).json({ success: false, message: 'No URL configured for this event.' });
      try {
        const { default: fetch } = await import('node-fetch');
        await fetch(hook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, test: true, timestamp: new Date().toISOString() }),
          signal: AbortSignal.timeout(5000)
        });
        return res.status(200).json({ success: true, message: 'Test payload sent.' });
      } catch(e) {
        return res.status(200).json({ success: false, message: 'Webhook delivery failed: ' + e.message });
      }
    }

    // ADMIN: Access Control (Feature #13)
    if (action === 'admin_get_access_control') {
      let cfg = await AccessControl.findOne({ key: 'global' });
      if (!cfg) {
        cfg = await AccessControl.create({ key: 'global', rules: [
          { path: 'sos', minRank: 'Apprentice', enabled: false },
          { path: 'bounty', minRank: 'Scout', enabled: false },
          { path: 'resources', minRank: 'Apprentice', enabled: false },
          { path: 'tasks', minRank: 'Apprentice', enabled: false },
          { path: 'leaderboard', minRank: 'Apprentice', enabled: false },
        ]});
      }
      return res.status(200).json({ success: true, data: cfg });
    }

    if (action === 'admin_save_access_control') {
      const { rules } = payload;
      const cfg = await AccessControl.findOneAndUpdate(
        { key: 'global' },
        { $set: { rules, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: cfg, message: 'Access rules saved.' });
    }

    // ADMIN: Audit Log Time-Machine (Feature #20) — store snapshot before edits and allow revert
    if (action === 'admin_get_member_snapshots') {
      const { operativeId } = payload;
      const logs = await ActionLog.find({ operativeId, type: 'PROFILE_UPDATED' }).sort({ timestamp: -1 }).limit(20).lean();
      return res.status(200).json({ success: true, data: logs });
    }

    // ADMIN: Factions (Feature #24)
    if (action === 'admin_get_factions') {
      const factions = await Faction.find({}).lean();
      return res.status(200).json({ success: true, data: factions });
    }

    if (action === 'admin_create_faction') {
      const { name, description, leaderId, leaderName, color } = payload;
      if (!name) return res.status(200).json({ success: false, message: 'Faction name required.' });
      const rand = Math.floor(10000 + Math.random() * 90000);
      const faction = await Faction.create({
        factionId: 'FCT-' + rand,
        name, description: description || '', leaderId: leaderId || '', leaderName: leaderName || '',
        memberIds: leaderId ? [leaderId] : [],
        color: color || '#000000',
        createdAt: new Date()
      });
      if (leaderId) await Member.findOneAndUpdate({ operativeId: leaderId }, { $set: { factionId: faction.factionId } });
      return res.status(200).json({ success: true, data: faction, message: 'Faction created.' });
    }

    if (action === 'admin_update_faction') {
      const { factionId, name, description, color, leaderId, leaderName } = payload;
      const update = { name, description, color, leaderId, leaderName };
      const faction = await Faction.findOneAndUpdate({ factionId }, { $set: update }, { new: true });
      return res.status(200).json({ success: true, data: faction, message: 'Faction updated.' });
    }

    if (action === 'admin_delete_faction') {
      const { factionId } = payload;
      await Faction.findOneAndDelete({ factionId });
      await Member.updateMany({ factionId }, { $unset: { factionId: '' } });
      return res.status(200).json({ success: true, message: 'Faction deleted.' });
    }

    if (action === 'admin_assign_faction_member') {
      const { factionId, operativeId, remove } = payload;
      if (remove) {
        await Faction.findOneAndUpdate({ factionId }, { $pull: { memberIds: operativeId } });
        await Member.findOneAndUpdate({ operativeId }, { $unset: { factionId: '' } });
      } else {
        await Faction.findOneAndUpdate({ factionId }, { $addToSet: { memberIds: operativeId } });
        await Member.findOneAndUpdate({ operativeId }, { $set: { factionId } });
      }
      return res.status(200).json({ success: true, message: remove ? 'Member removed from faction.' : 'Member assigned to faction.' });
    }

    // ADMIN: Advanced Session Customization (Feature #4) — add capacity + waitlist to sessions
    if (action === 'admin_set_session_advanced') {
      const { sessionId, capacity, waitlistEnabled, customQuestions } = payload;
      if (!sessionId) return res.status(200).json({ success: false, message: 'Missing sessionId.' });
      
      const evt = await Session.findOneAndUpdate(
        { sessionId },
        { $set: { capacity: parseInt(capacity) || 0, waitlistEnabled: !!waitlistEnabled, customQuestions: customQuestions || [] } },
        { new: true, upsert: true }
      ).lean();
      return res.status(200).json({ success: true, data: evt, message: 'Session settings updated.' });
    }

    // ADMIN: Real-Time Comms Broadcast (Feature #8)
    if (action === 'admin_send_broadcast') {
      const { content, priority, targetRanks } = payload;
      if (!content) return res.status(200).json({ success: false, message: 'Content required.' });
      const msg = await BroadcastMessage.create({
        messageId: 'BRD-' + Date.now(),
        content,
        priority: priority || 'normal',
        targetRanks: targetRanks || []
      });
      // In a real system, you would trigger WebSocket emissions here.
      // For now, it's stored and can be polled by Forge clients.
      return res.status(200).json({ success: true, data: msg, message: 'Broadcast deployed.' });
    }
    
    if (action === 'admin_get_broadcasts') {
      const msgs = await BroadcastMessage.find({}).sort({ createdAt: -1 }).limit(20).lean();
      return res.status(200).json({ success: true, data: msgs });
    }

    // ADMIN: Dynamic Gamification Engine (Feature #9)
    if (action === 'admin_get_gamification_config') {
      let cfg = await GamificationConfig.findOne({ key: 'global' });
      if (!cfg) {
        cfg = await GamificationConfig.create({ key: 'global', xpMultiplier: 1.0, taskBaseXP: 100, loginXP: 10 });
      }
      return res.status(200).json({ success: true, data: cfg });
    }

    if (action === 'admin_save_gamification_config') {
      const { xpMultiplier, taskBaseXP, loginXP } = payload;
      const cfg = await GamificationConfig.findOneAndUpdate(
        { key: 'global' },
        { $set: { xpMultiplier: parseFloat(xpMultiplier)||1, taskBaseXP: parseInt(taskBaseXP)||100, loginXP: parseInt(loginXP)||10, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: cfg, message: 'Gamification rules updated.' });
    }

    // ADMIN: Auto-Certificate Generator (Feature #18)
    if (action === 'admin_get_cert_templates') {
      const tpls = await CertTemplate.find({}).lean();
      return res.status(200).json({ success: true, data: tpls });
    }

    if (action === 'admin_save_cert_template') {
      const { templateId, name, backgroundUrl, fields } = payload;
      let tpl;
      if (templateId) {
        tpl = await CertTemplate.findOneAndUpdate({ templateId }, { $set: { name, backgroundUrl, fields, updatedAt: new Date() } }, { new: true });
      } else {
        tpl = await CertTemplate.create({ templateId: 'CERT-' + Date.now(), name, backgroundUrl, fields });
      }
      return res.status(200).json({ success: true, data: tpl, message: 'Template saved.' });
    }

    // ADMIN: Forge Custom CSS Editor (Feature #19)
    if (action === 'admin_get_custom_css') {
      let cfg = await CustomStyle.findOne({ key: 'forge' });
      if (!cfg) cfg = await CustomStyle.create({ key: 'forge', cssRules: '/* Add custom CSS here */' });
      return res.status(200).json({ success: true, data: cfg });
    }

    if (action === 'admin_save_custom_css') {
      const { cssRules } = payload;
      const cfg = await CustomStyle.findOneAndUpdate(
        { key: 'forge' },
        { $set: { cssRules, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: cfg, message: 'Custom CSS saved and deployed to Forge.' });
    }

    // ADMIN: Global Search (Feature #21)
    if (action === 'admin_global_search') {
      const { query } = payload;
      if (!query || query.length < 2) return res.status(200).json({ success: true, data: { members: [], tasks: [], bounties: [] } });
      const rx = new RegExp(query, 'i');
      const members = await Member.find({ $or: [{ name: rx }, { operativeId: rx }, { email: rx }] }).limit(10).lean();
      const tasks = await Task.find({ $or: [{ title: rx }, { description: rx }] }).limit(10).lean();
      const bounties = await Bounty.find({ $or: [{ title: rx }, { description: rx }] }).limit(10).lean();
      return res.status(200).json({ success: true, data: { members, tasks, bounties } });
    }

    // ADMIN: AI Integration (Feature #16)
    if (action === 'admin_get_ai_config') {
      let cfg = await AIConfig.findOne({ key: 'global' });
      if (!cfg) cfg = await AIConfig.create({ key: 'global' });
      return res.status(200).json({ success: true, data: cfg });
    }

    if (action === 'admin_save_ai_config') {
      const { geminiApiKey } = payload;
      const cfg = await AIConfig.findOneAndUpdate(
        { key: 'global' },
        { $set: { geminiApiKey, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: cfg, message: 'AI Config saved.' });
    }

    // ADMIN: A/B Testing Engine (Feature #17)
    if (action === 'admin_get_ab_test') {
      let cfg = await ABTestConfig.findOne({ key: 'register' });
      if (!cfg) cfg = await ABTestConfig.create({ key: 'register' });
      return res.status(200).json({ success: true, data: cfg });
    }

    if (action === 'admin_save_ab_test') {
      const { activeVariant } = payload;
      const cfg = await ABTestConfig.findOneAndUpdate(
        { key: 'register' },
        { $set: { activeVariant, updatedAt: new Date() } },
        { new: true }
      );
      return res.status(200).json({ success: true, data: cfg, message: 'A/B Variant saved.' });
    }

    // ADMIN: Visual Query & Cohort Builder (Feature #22)
    if (action === 'admin_query_cohort') {
      const { minXp, maxRank, status } = payload;
      const query = {};
      if (minXp) query.xp = { $gte: parseInt(minXp) };
      if (maxRank) query.rank = maxRank; // Simplified exact match for now
      if (status) query.status = status;
      const members = await Member.find(query).limit(50).lean();
      return res.status(200).json({ success: true, data: members });
    }

    // ADMIN: Skill Trees & Talent Mapping (Feature #23)
    if (action === 'admin_get_skill_trees') {
      // Aggregate tasks completed by category
      const skills = await Task.aggregate([
        { $match: { status: 'Approved' } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      return res.status(200).json({ success: true, data: skills });
    }

    // ADMIN: Multiplayer Admin Collaboration (Feature #25)
    if (action === 'admin_ping_presence') {
      const { adminId, name } = payload;
      await AdminPresence.findOneAndUpdate(
        { adminId },
        { $set: { name, lastPing: new Date() } },
        { upsert: true }
      );
      // Get all active admins (pinged in last 5 mins)
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeAdmins = await AdminPresence.find({ lastPing: { $gte: fiveMinsAgo } }).lean();
      return res.status(200).json({ success: true, data: activeAdmins });
    }

    // ADMIN: Get Platform Settings
    if (action === 'admin_get_settings') {
      let settings = await PlatformSettings.findOne({ key: 'global' });
      if (!settings) settings = await PlatformSettings.create({ key: 'global' });
      return res.status(200).json({ success: true, data: settings });
    }

    // ADMIN: Save Platform Settings
    if (action === 'admin_save_settings') {
      const { registrationOpen, maintenanceMode, adminEmail, otpRateLimitSeconds, otpMaxAttempts } = payload;
      const update = { updatedAt: new Date() };
      if (registrationOpen !== undefined) update.registrationOpen = registrationOpen === 'true' || registrationOpen === true;
      if (maintenanceMode !== undefined) update.maintenanceMode = maintenanceMode === 'true' || maintenanceMode === true;
      if (adminEmail) update.adminEmail = adminEmail.trim();
      if (otpRateLimitSeconds) update.otpRateLimitSeconds = parseInt(otpRateLimitSeconds);
      if (otpMaxAttempts) update.otpMaxAttempts = parseInt(otpMaxAttempts);
      const settings = await PlatformSettings.findOneAndUpdate(
        { key: 'global' },
        { $set: update },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: settings, message: 'Settings saved.' });
    }

    // PUBLIC: Registration
    
    // --- LIVE EMAIL CHECKER ---
    if (action === 'check_email') {
       const { email } = payload;
       if (!email) return res.status(200).json({ exists: false });
       const existing = await Member.findOne({ email: email.trim().toLowerCase() });
       return res.status(200).json({ exists: !!existing });
    }

    
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
          html: buildEmail({
            title: 'Email Verification Code',
            subtitle: 'Innovexa Registration',
            iconEmoji: '📧',
            accentColor: '#7c3aed',
            bodyHtml: `
              <p style="font-size:15px;color:#374151;margin:0 0 8px;">Almost there!</p>
              <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.7;">
                Use the code below to verify your email and complete your registration for <strong style="color:#7c3aed;">Innovexa Hub</strong>.
              </p>
              ${buildOtpBlock(otp)}
              <div style="background:#f9fafb;border-radius:8px;padding:14px 18px;border-left:4px solid #7c3aed;">
                <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                  ⏱ <strong style="color:#374151;">This code expires in 10 minutes.</strong> If you did not request this, please ignore this email.
                </p>
              </div>
            \`
          })
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

    if (action === 'register_member') {
        const { fullName, email, phone, college, dob, year, gender, branch, skillLevel, interests, utr, photo, signature } = payload;
        
        if (!email || !fullName) {
          return res.status(200).json({ success: false, message: 'Missing required fields (Email/Name).' });
        }

        // Basic check for existing
        const existing = await Member.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
          return res.status(200).json({ success: false, message: 'A registration with this email already exists.' });
        }
        
        // Generate unique Operative ID
        let genId = '';
        let isUnique = false;
        while (!isUnique) {
          const rand = Math.floor(10000 + Math.random() * 90000).toString();
          genId = 'INVX-' + rand;
          const check = await Member.findOne({ operativeId: genId });
          if (!check) isUnique = true;
        }

        const newMember = new Member({
          operativeId: genId,
          name: fullName,
          email: email.trim().toLowerCase(),
          phone: phone,
          college: college,
          dob: dob,
          year: year,
          gender: gender,
          branch: branch,
          skillLevel: skillLevel,
          interests: interests,
          utr: utr,
          photoUrl: photo,
          signature: signature,
          status: 'Pending',
          amount: '599',
          xp: 0,
          rank: 'Apprentice',
          squad: 'Unassigned',
          forgeRole: 'Apprentice',
          forgeAccess: 'Pending'
        });
        
        await newMember.save();

        // Notify admin about new registration via notifyAdmin
        await notifyAdmin({
          type: 'REGISTRATION',
          operativeId: genId,
          name: fullName,
          detail: `New member registered. Email: ${email} | College: ${college || 'N/A'} | Branch: ${branch || 'N/A'}, ${year || 'N/A'} Year | UTR: ${utr || 'Not provided'}`
        });

        // Notify member that their registration was received
        await notifyUser(
          email.trim().toLowerCase(),
          'Registration Received - Innovexa Hub',
          `<h2 style="color:#000;">Welcome, ${fullName}!</h2>
           <p style="color:#334155;font-size:15px;line-height:1.6;">We have successfully received your registration for Innovexa Hub.</p>
           <p style="color:#334155;font-size:15px;line-height:1.6;">Your application is currently <strong style="color:#f59e0b;">Pending Review</strong>. Once an admin approves your profile, you will receive another email containing your unique Operative ID and dashboard access instructions.</p>
           <p style="color:#334155;font-size:15px;line-height:1.6;">Thank you for your patience!</p>`
        );

        return res.status(200).json({ 
          success: true, 
          message: 'Registration successful.', 
          data: { operativeId: genId } 
        });
    }
    
    // ADMIN: Login
    if (action === 'admin_login') {
      const { invxId, email } = payload;
      if (!invxId) return res.status(200).json({ success: false, message: 'Username is required.' });
      
      let isValidAdmin = false;
      let memberData = null;

      // Master Override
      if (invxId.trim() === 'admin@innovexa') {
        const cfg = await PlatformSettings.findOne({ key: 'global' });
        let hasFace = false;
        if (cfg && cfg.adminMasterFaceDescriptor && cfg.adminMasterFaceDescriptor !== '[]') hasFace = true;

        if (hasFace || (email && email.trim() === 'adminpass')) {
          isValidAdmin = true;
          memberData = {
            name: 'Master Admin',
            operativeId: 'INVX-MASTER',
            role: 'president',
            hasFaceRegistered: hasFace, email: (typeof member !== 'undefined' && member ? member.email : process.env.ADMIN_EMAIL || 'innovexahub.bangalore@gmail.com')
          };
        }
      } else {
        const query = { operativeId: invxId.trim().toUpperCase() };
        if (email) query.email = email.trim().toLowerCase();
        
        const member = await Member.findOne(query);
        if (member) {
          let role = (member.forgeRole || '').trim().toLowerCase();
          let isPresident = (role === 'president' || ['INVX-01', 'INVX-09', 'INVX-7ZB7L'].includes(member.operativeId));
          let isAdmin = (role === 'admin' || isPresident || ['INVX-02', 'INVX-03'].includes(member.operativeId));
          
          if (isAdmin) {
            const hasFace = !!member.faceDescriptor;
            if (!email && !hasFace) {
               return res.status(200).json({ success: false, message: 'Password is required. Face ID not registered.' });
            }
            if (hasFace || email) {
                isValidAdmin = true;
                let finalRole = role || (isPresident ? 'president' : 'admin');
                memberData = {
                  name: member.name,
                  operativeId: member.operativeId,
                  role: finalRole,
                  hasFaceRegistered: hasFace, email: (typeof member !== 'undefined' && member ? member.email : process.env.ADMIN_EMAIL || 'innovexahub.bangalore@gmail.com')
                };
            }
          } else {
            return res.status(200).json({ success: false, message: 'Access Denied. You do not have Admin privileges.' });
          }
        }
      }

      if (!isValidAdmin) {
        return res.status(200).json({ success: false, message: 'Invalid Credentials.' });
      }

      // Face ID Bypass Check
      if (memberData && memberData.hasFaceRegistered) {
        // Generate a face auth token to secure the session
        const faceToken = Math.random().toString(36).substring(2, 15);
        await PlatformSettings.findOneAndUpdate(
          { key: 'global' },
          { $set: { adminFaceToken: faceToken, adminFaceTokenTime: Date.now(), adminFacePendingUser: invxId.toUpperCase() } },
          { upsert: true }
        );
        
        // Fetch descriptors
        let faceDescriptors = [];
        if (memberData.operativeId !== 'INVX-MASTER') {
          const m = await Member.findOne({ operativeId: memberData.operativeId });
          if (m && m.faceDescriptor) {
            try {
              faceDescriptors = JSON.parse(m.faceDescriptor);
              if (Array.isArray(faceDescriptors)) {
                faceDescriptors = faceDescriptors.filter(d => Array.isArray(d) && d.length > 0);
              } else {
                faceDescriptors = [];
              }
            } catch(e) {
              faceDescriptors = [];
            }
          }
        } else {
          const cfg = await PlatformSettings.findOne({ key: 'global' });
          if (cfg && cfg.adminMasterFaceDescriptor) {
            try {
              faceDescriptors = JSON.parse(cfg.adminMasterFaceDescriptor);
              if (Array.isArray(faceDescriptors)) {
                faceDescriptors = faceDescriptors.filter(d => Array.isArray(d) && d.length > 0);
              } else {
                faceDescriptors = [];
              }
            } catch(e) {
              faceDescriptors = [];
            }
          }
        }
        
        return res.status(200).json({ 
          success: true, 
          requireFace: true, 
          faceDescriptors: faceDescriptors,
          faceToken: faceToken,
          message: 'Face ID required.' 
        });
      }

      // Generate and send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await PlatformSettings.findOneAndUpdate(
        { key: 'global' },
        { $set: { adminOtp: otp, adminOtpTime: Date.now() } },
        { upsert: true }
      );

      try {
        await transporter.sendMail({
          from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
          to: memberData.email || 'innovexahub.bangalore@gmail.com',
          subject: `🚨 Admin Login OTP: ${otp}`,
          html: buildEmail({
            title: 'Admin Access Code',
            subtitle: '🚨 Admin Console Login',
            iconEmoji: '🛡️',
            accentColor: '#dc2626',
            bodyHtml: `
              <p style="font-size:14px;color:#374151;margin:0 0 20px;line-height:1.7;">
                An admin login attempt was made by <strong style="color:#000;">${memberData.name}</strong>
                <span style="font-family:monospace;background:#f3f4f6;padding:2px 8px;border-radius:4px;font-size:13px;">(${memberData.operativeId})</span>.
                Use the code below to authorize access.
              </p>
              ${buildOtpBlock(otp, '#dc2626')}
              <div style="background:#fef2f2;border-radius:8px;padding:14px 18px;border-left:4px solid #ef4444;">
                <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">
                  ⚠️ <strong>If you did not initiate this login,</strong> your admin credentials may be compromised. Change them immediately.
                </p>
              </div>
            \`
          })
        });
      } catch (e) {
        console.error('Failed to send Admin OTP email:', e);
        return res.status(200).json({ success: false, message: 'Failed to send OTP to admin email. Please check server logs.' });
      }

      return res.status(200).json({ success: true, requireOtp: true, message: 'OTP sent to admin email.' });
    }

    if (action === 'admin_init_face_login') {
      const faceToken = Math.random().toString(36).substring(2, 15);
      await PlatformSettings.findOneAndUpdate(
        { key: 'global' },
        { $set: { adminFaceToken: faceToken, adminFaceTokenTime: Date.now(), adminFacePendingUser: 'ANY' } },
        { upsert: true }
      );
      
      const allMembers = await Member.find({ faceDescriptor: { $exists: true, $ne: null } }, 'operativeId faceDescriptor');
      let allFaces = [];
      
      for (const m of allMembers) {
        try {
          let desc = JSON.parse(m.faceDescriptor);
          if (Array.isArray(desc)) {
            desc = desc.filter(d => Array.isArray(d) && d.length > 0);
            if (desc.length > 0) allFaces.push({ invxId: m.operativeId, descriptors: desc });
          }
        } catch(e) {}
      }
      
      const cfg = await PlatformSettings.findOne({ key: 'global' });
      if (cfg && cfg.adminMasterFaceDescriptor) {
        try {
          let desc = JSON.parse(cfg.adminMasterFaceDescriptor);
          if (Array.isArray(desc)) {
             desc = desc.filter(d => Array.isArray(d) && d.length > 0);
             if (desc.length > 0) allFaces.push({ invxId: 'admin@innovexa', descriptors: desc });
          }
        } catch(e) {}
      }
      
      return res.status(200).json({ success: true, faceToken, allFaces });
    }

    if (action === 'admin_verify_face') {
      const { invxId, faceToken } = payload;
      if (!invxId || !faceToken) return res.status(200).json({ success: false, message: 'Missing token or credentials.' });

      const cfg = await PlatformSettings.findOne({ key: 'global' });
      if (!cfg) {
        return res.status(200).json({ success: false, message: 'Invalid or expired face token (cfg missing).' });
      }
      if (cfg.adminFaceToken !== faceToken) {
        return res.status(200).json({ success: false, message: 'Invalid or expired face token (mismatch).' });
      }
      if (cfg.adminFacePendingUser !== 'ANY' && cfg.adminFacePendingUser !== invxId.toUpperCase()) {
        return res.status(200).json({ success: false, message: 'Invalid or expired face token (user mismatch).' });
      }
      if (Date.now() - (cfg.adminFaceTokenTime || 0) > 5 * 60 * 1000) {
        return res.status(200).json({ success: false, message: 'Face session expired.' });
      }

      // Valid Face verification token
      let memberData = null;
      if (invxId.trim() === 'admin@innovexa') {
        memberData = {
          name: 'Master Admin',
          operativeId: 'INVX-MASTER',
          role: 'president',
          hasFaceRegistered: false, email: (typeof member !== 'undefined' && member ? member.email : process.env.ADMIN_EMAIL || 'innovexahub.bangalore@gmail.com')
        };
      } else {
        const member = await Member.findOne({ operativeId: invxId.trim().toUpperCase() });
        if (member) {
          let role = (member.forgeRole || '').trim().toLowerCase();
          let isPresident = (role === 'president' || ['INVX-01', 'INVX-09', 'INVX-7ZB7L'].includes(member.operativeId));
          let finalRole = role || (isPresident ? 'president' : 'admin');
          memberData = {
            name: member.name,
            operativeId: member.operativeId,
            role: finalRole,
            hasFaceRegistered: !!member.faceDescriptor, email: (typeof member !== 'undefined' && member ? member.email : process.env.ADMIN_EMAIL || 'innovexahub.bangalore@gmail.com')
          };
        }
      }

      if (!memberData) return res.status(200).json({ success: false, message: 'Member not found.' });

      // Clear Token
      await PlatformSettings.findOneAndUpdate({ key: 'global' }, { $unset: { adminFaceToken: "", adminFaceTokenTime: "", adminFacePendingUser: "" } });

      await new ActionLog({
        timestamp: new Date(),
        type: 'LOGIN',
        content: `Admin logged into console via Face ID.`,
        operativeId: memberData.operativeId,
        name: memberData.name
      }).save();

      return res.status(200).json({ success: true, data: memberData, message: 'Face verification successful.' });
    }

    if (action === 'admin_register_face') {
      const { invxId, descriptor } = payload;
      if (!invxId || !descriptor) return res.status(200).json({ success: false, message: 'Missing parameters.' });
      
      if (invxId.toUpperCase() === 'INVX-MASTER') {
        const cfg = await PlatformSettings.findOne({ key: 'global' }) || new PlatformSettings({ key: 'global' });
        let existingFaces = [];
        try {
          if (cfg.adminMasterFaceDescriptor) {
            existingFaces = JSON.parse(cfg.adminMasterFaceDescriptor);
            if (!Array.isArray(existingFaces)) existingFaces = [];
            existingFaces = existingFaces.filter(d => Array.isArray(d) && d.length > 0);
          }
        } catch(e) {}
        existingFaces.push(descriptor);
        cfg.adminMasterFaceDescriptor = JSON.stringify(existingFaces);
        await cfg.save();
        return res.status(200).json({ success: true, message: 'Face added for Master Admin.', faceCount: existingFaces.length });
      }

      const member = await Member.findOne({ operativeId: invxId.toUpperCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });

      let currentDescriptors = [];
      if (member.faceDescriptor) {
        try {
          currentDescriptors = JSON.parse(member.faceDescriptor);
          if (!Array.isArray(currentDescriptors)) currentDescriptors = [];
        } catch(e) {
          currentDescriptors = [];
        }
      }
      
      // We expect descriptor to be a valid Array of numbers or object from face-api
      currentDescriptors.push(descriptor);
      
      member.faceDescriptor = JSON.stringify(currentDescriptors);
      await member.save();

      await new ActionLog({
        timestamp: new Date(),
        type: 'PROFILE_UPDATED',
        content: `Admin registered a new Face ID profile. Total faces: ${currentDescriptors.length}.`,
        operativeId: member.operativeId,
        name: member.name
      }).save();

      return res.status(200).json({ success: true, message: 'Face registered successfully.', faceCount: currentDescriptors.length });
    }

    if (action === 'admin_verify_otp') {
      const { invxId, email, otp } = payload;
      if (!invxId || !email || !otp) return res.status(200).json({ success: false, message: 'Missing credentials or OTP.' });

      const cfg = await PlatformSettings.findOne({ key: 'global' });
      if (!cfg || !cfg.adminOtp || Date.now() - (cfg.adminOtpTime || 0) > 15 * 60 * 1000) {
        return res.status(200).json({ success: false, message: 'OTP expired or not requested.' });
      }

      if (cfg.adminOtp !== otp.trim()) {
        return res.status(200).json({ success: false, message: 'Invalid OTP.' });
      }

      // Valid OTP. Now re-validate credentials to prevent hijacking
      let isValidAdmin = false;
      let memberData = null;

      if (invxId.trim() === 'admin@innovexa' && email.trim() === 'adminpass') {
        isValidAdmin = true;
        memberData = {
          name: 'Master Admin',
          operativeId: 'INVX-MASTER',
          role: 'president',
          hasFaceRegistered: false, email: (typeof member !== 'undefined' && member ? member.email : process.env.ADMIN_EMAIL || 'innovexahub.bangalore@gmail.com')
        };
      } else {
        const member = await Member.findOne({ 
          operativeId: invxId.trim().toUpperCase(),
          email: email.trim().toLowerCase()
        });
        if (member) {
          let role = (member.forgeRole || '').trim().toLowerCase();
          let isPresident = (role === 'president' || ['INVX-01', 'INVX-09', 'INVX-7ZB7L'].includes(member.operativeId));
          let isAdmin = (role === 'admin' || isPresident || ['INVX-02', 'INVX-03'].includes(member.operativeId));
          if (isAdmin) {
            isValidAdmin = true;
            let finalRole = role || (isPresident ? 'president' : 'admin');
            memberData = {
              name: member.name,
              operativeId: member.operativeId,
              role: finalRole,
              hasFaceRegistered: !!member.faceDescriptor, email: (typeof member !== 'undefined' && member ? member.email : process.env.ADMIN_EMAIL || 'innovexahub.bangalore@gmail.com')
            };
          }
        }
      }

      if (!isValidAdmin) return res.status(200).json({ success: false, message: 'Invalid Credentials.' });

      // Clear OTP
      await PlatformSettings.findOneAndUpdate({ key: 'global' }, { $unset: { adminOtp: "", adminOtpTime: "" } });

      await notifyAdmin({
        type: 'LOGIN',
        operativeId: memberData.operativeId,
        name: memberData.name,
        detail: `Admin login successful via OTP. Role: ${memberData.role}`
      });

      return res.status(200).json({
        success: true,
        data: memberData
      });
    }

    // FORGE: Get Mentors
    if (action === 'forge_get_mentors') {
      const mentors = await Member.find({ 
        forgeRole: 'Mentor', 
        status: { $in: ['Approved', 'Confirmed'] } 
      }, 'name operativeId').lean();
      
      return res.status(200).json({ success: true, data: mentors });
    }

    // FORGE: Get My Tasks / Admin Get Tasks
    if (action === 'forge_get_my_tasks' || action === 'admin_get_tasks') {
      const { invxId } = payload;
      let query = {};
      
      if (action === 'forge_get_my_tasks') {
        if (!invxId) return res.status(200).json({ success: false, message: 'Missing operative ID.' });
        // Match tasks assigned to this user OR open tasks
        query = { $or: [{ assignedTo: invxId.trim().toUpperCase() }, { assignedTo: 'Open' }] };
      }

      const tasks = await Task.find(query).sort({ timestamp: -1 }).lean();
      // Return both `tasks` (for admin) and `data` (for forge)
      return res.status(200).json({ success: true, tasks: tasks, data: tasks });
    }

    // FORGE: Submit Task
    if (action === 'forge_submit_task') {
      const { invxId, taskId } = payload;
      const link = payload.submitLink || payload.link;
      if (!invxId || !taskId || !link) return res.status(200).json({ success: false, message: 'Missing fields.' });
      
      const invxIdUpper = invxId.trim().toUpperCase();
      const task = await Task.findOne({ 
        taskId, 
        $or: [
          { assignedTo: invxIdUpper },
          { assignedTo: 'Open' },
          { assignedTo: 'OPEN' }
        ]
      });
      if (!task) return res.status(200).json({ success: false, message: 'Task not found or not assigned to you.' });
      if (task.status === 'Completed' || task.status === 'Submitted') {
        return res.status(200).json({ success: false, message: 'Task is already submitted/completed.' });
      }
      
      // Auto-claim the task if it was open
      if (task.assignedTo === 'Open' || task.assignedTo === 'OPEN') {
        task.assignedTo = invxIdUpper;
      }
      
      task.submitLink = link;
      task.status = 'Submitted';
      task.timestamp = new Date();
      await task.save();

      const member = await Member.findOne({ operativeId: invxId.trim().toUpperCase() });
      if (member) {
        const log = new ActionLog({
          timestamp: new Date(),
          type: 'TASK_SUBMITTED',
          content: `Operative ${member.name} submitted task: ${task.title}`,
          operativeId: member.operativeId,
          name: member.name
        });
        await log.save();

        // Notify admin immediately
        await notifyAdmin({
          type: 'TASK_SUBMITTED',
          operativeId: member.operativeId,
          name: member.name,
          detail: `"${task.title}" submitted for review. Proof: ${link}`
        });
      }
      
      return res.status(200).json({ success: true, message: 'Task submitted for review.' });
    }


    // FORGE: Leaderboard
    if (action === 'forge_get_leaderboard') {
      const members = await Member.find({ status: { $in: ['Approved', 'Confirmed'] }, forgeAccess: 'Granted' })
        .sort({ xp: -1 })
        .limit(50)
        .lean();
      
      const lb = members.map(m => ({
        name: m.name,
        operativeId: m.operativeId,
        xp: m.xp,
        rank: m.rank,
        role: m.forgeRole,
        squad: m.squad,
        forgeAccess: m.forgeAccess
      }));
      
      return res.status(200).json({ success: true, data: lb });
    }

    // FORGE: Get Feed
    if (action === 'forge_get_feed') {
      const feed = await ActionLog.find({})
        .sort({ timestamp: -1 })
        .limit(30)
        .lean();
      
      return res.status(200).json({ success: true, data: feed });
    }

    // ADMIN: Get Members
    if (action === 'adminMembers') {
      const members = await Member.find({}).sort({ rowIndex: 1 }).lean();
      return res.status(200).json({ success: true, members: members });
    }

    // ADMIN: Member Details
    if (action === 'admin_get_member_detail') {
      const { operativeId } = payload;
      if (!operativeId) return res.status(200).json({ success: false, message: 'Missing operativeId.' });
      
      const member = await Member.findOne({ operativeId: operativeId.trim().toUpperCase() }).lean();
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });

      const logs = await ActionLog.find({ operativeId: member.operativeId }).sort({ timestamp: -1 }).lean();
      const tasks = await Task.find({ assignedTo: member.operativeId }).sort({ timestamp: -1 }).lean();
      
      let activeTasksCount = 0;
      let completedTasksCount = 0;
      tasks.forEach(t => {
        if (t.status === 'Completed') completedTasksCount++;
        if (t.status === 'Open' || t.status === 'Submitted') activeTasksCount++;
      });

      return res.status(200).json({
        success: true,
        data: {
          member,
          logs,
          tasks,
          stats: {
            activeTasks: activeTasksCount,
            completedTasks: completedTasksCount,
            totalLogs: logs.filter(l => l.type === 'LOGIN' || l.action === 'login').length
          }
        }
      });
    }

    // ADMIN: Manage Member Status
    if (action === 'updateStatus') {
      const { email, status } = payload;
      if (!email || !status) return res.status(200).json({ success: false, message: 'Missing fields.' });
      
      const member = await Member.findOne({ email: email.trim().toLowerCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });
      
      member.status = status;
      await member.save();
      
      const log = new ActionLog({
        timestamp: new Date(), type: 'STATUS_UPDATED',
        content: `Application status updated to: ${status}`,
        operativeId: member.operativeId, name: member.name
      });
      await log.save();

      // Notify admin about status change
      await notifyAdmin({
        type: 'STATUS_CHANGE',
        operativeId: member.operativeId,
        name: member.name,
        detail: `Member status changed to: ${status}`,
        urgent: (status === 'Revoked' || status === 'Rejected')
      });

      // Send approval welcome email when status becomes Confirmed or Approved
      if ((status === 'Confirmed' || status === 'Approved') && member.email) {
        try {
          await transporter.sendMail({
            from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
            to: member.email,
            subject: `🎉 Congratulations! Your Innovexa Membership is Approved`,
            html: buildEmail({
              title: "You're officially in! 🎉",
              subtitle: 'Membership Approved',
              iconEmoji: '🎉',
              accentColor: '#10b981',
              bodyHtml: `
                <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
                <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.7;">
                  Your Innovexa Hub membership has been <strong style="color:#10b981;">approved</strong>! Welcome to the collective.
                </p>
                <div style="margin:0 0 24px;border-radius:12px;overflow:hidden;">
                  <div style="background:#10b981;padding:10px 24px;text-align:center;">
                    <span style="font-size:11px;color:rgba(255,255,255,0.85);letter-spacing:3px;text-transform:uppercase;font-weight:600;">Your Operative ID</span>
                  </div>
                  <div style="background:#f0fdf4;border:2px solid #10b981;border-top:none;padding:24px;text-align:center;border-radius:0 0 12px 12px;">
                    <div style="font-size:38px;font-weight:900;letter-spacing:8px;color:#000000;font-family:'Courier New',monospace;">${member.operativeId}</div>
                    <div style="margin-top:8px;font-size:13px;color:#10b981;font-weight:600;">Use this ID to log in to your Forge dashboard</div>
                  </div>
                </div>
                <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.7;">
                  Access the <strong style="color:#7c3aed;">Innovexa Forge</strong> — your personal dashboard for resources, task bounties, leaderboard, and SOS support.
                </p>
                <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:15px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.3px;">Access the Forge Dashboard →</a>
              \`,
              footerNote: 'Questions? Contact your admin.'
            })
          });
          console.log(`Approval email sent to ${member.email}`);
        } catch (emailErr) {
          console.error('Approval email failed:', emailErr.message);
        }
      }

      // Send revoke/reject notification email to member
      if ((status === 'Revoked' || status === 'Rejected') && member.email) {
        try {
          await transporter.sendMail({
            from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
            to: member.email,
            subject: `⚠️ Important: Your Innovexa Membership Status Update`,
            html: buildEmail({
              title: 'Membership Status Update',
              subtitle: `Status changed to: ${status}`,
              iconEmoji: '⚠️',
              accentColor: '#dc2626',
              bodyHtml: `
                <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
                <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.7;">
                  Your Innovexa Hub membership status has been updated to
                  <strong style="color:#dc2626;">${status}</strong>.
                </p>
                <div style="background:#fef2f2;border-radius:8px;padding:14px 18px;border-left:4px solid #ef4444;margin-bottom:24px;">
                  <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">
                    If you believe this is an error, please contact the Innovexa admin team directly to appeal.
                  </p>
                </div>
                <a href="https://innovexareg.vercel.app" style="display:block;text-align:center;padding:13px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Visit Innovexa Hub</a>
              \`
            })
          });
        } catch (emailErr) {
          console.error('Revoke email failed:', emailErr.message);
        }
      }

      return res.status(200).json({ success: true, message: 'Status updated to ' + status });
    }


    // ADMIN: Set Role
    if (action === 'admin_set_role') {
      // Accept both old (email/role) and new (targetId/newRole) field names
      const email = payload.email;
      const role = payload.role || payload.newRole;
      const targetId = payload.targetId;
      if ((!email && !targetId) || !role) return res.status(200).json({ success: false, message: 'Missing fields.' });
      
      let member;
      if (targetId) {
        member = await Member.findOne({ operativeId: targetId.trim().toUpperCase() });
      } else {
        member = await Member.findOne({ email: email.trim().toLowerCase() });
      }
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });
      
      member.forgeRole = role;
      await member.save();
      
      const log = new ActionLog({
        timestamp: new Date(), type: 'ROLE_UPDATED',
        content: `Role updated to: ${role}`,
        operativeId: member.operativeId, name: member.name
      });
      await log.save();
      
      await notifyUser(member.email, 'Innovexa Hub - Role Updated', `
        <p>Your role in the Innovexa Hub has been updated by an administrator.</p>
        <p>New Role: <strong>${role}</strong></p>
        <a href="https://innovexareg.vercel.app/forge.html" style="display:inline-block;padding:10px 20px;background:#000000;color:#fff;text-decoration:none;font-weight:700;font-size:13px;margin-top:10px;">VIEW DASHBOARD →</a>
      `);
      
      return res.status(200).json({ success: true, message: 'Role updated to ' + role });
    }

    // ADMIN: Grant Forge Access
    if (action === 'admin_grant_forge_access') {
      // Accept email/access (old) or operativeId/rowIndex + accessStatus (new)
      const email = payload.email;
      const operativeId = payload.operativeId || payload.rowIndex;
      const access = payload.access || payload.accessStatus;
      if ((!email && !operativeId) || !access) return res.status(200).json({ success: false, message: 'Missing fields.' });
      
      let member;
      if (operativeId && !email) {
        member = await Member.findOne({ operativeId: String(operativeId).trim().toUpperCase() });
        // rowIndex might be a numeric row — fall back to finding by position if not found by ID
        if (!member) member = await Member.findOne({ email: email });
      } else {
        member = await Member.findOne({ email: email.trim().toLowerCase() });
      }
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });
      
      member.forgeAccess = access;
      await member.save();
      
      const log = new ActionLog({
        timestamp: new Date(), type: 'ACCESS_UPDATED',
        content: `Forge Access updated to: ${access}`,
        operativeId: member.operativeId, name: member.name
      });
      await log.save();
      
      await notifyUser(member.email, 'Innovexa Hub - Access Updated', `
        <p>Your access level in the Innovexa Hub has been updated by an administrator.</p>
        <p>Forge Access: <strong>${access}</strong></p>
        <a href="https://innovexareg.vercel.app/forge.html" style="display:inline-block;padding:10px 20px;background:#000000;color:#fff;text-decoration:none;font-weight:700;font-size:13px;margin-top:10px;">VIEW DASHBOARD →</a>
      `);
      
      return res.status(200).json({ success: true, message: 'Access updated to ' + access });
    }

    // ADMIN: Update Profile
    if (action === 'admin_update_profile') {
      const { email, phone, college, skillLevel, interests, paymentProof, squad, rank, xp, forgeAccess } = payload;
      // Accept lookup by email OR by operativeId (rowIndex may be operativeId from UI)
      const lookupEmail = email ? email.trim().toLowerCase() : null;
      const lookupOpId = payload.operativeId || payload.rowIndex;
      if (!lookupEmail && !lookupOpId) return res.status(200).json({ success: false, message: 'Missing identifier (email or operativeId).' });
      
      let member;
      if (lookupEmail) {
        member = await Member.findOne({ email: lookupEmail });
      } else {
        member = await Member.findOne({ operativeId: String(lookupOpId).trim().toUpperCase() });
      }
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });
      let notifications = [];
      if (squad !== undefined && squad !== member.squad) notifications.push(`Squad assignment: <strong>${squad}</strong>`);
      if (rank !== undefined && rank !== member.rank) notifications.push(`Rank: <strong>${rank}</strong>`);
      if (xp !== undefined && parseInt(xp) !== member.xp) notifications.push(`XP Balance: <strong>${xp} XP</strong>`);
      if (forgeAccess !== undefined && forgeAccess !== member.forgeAccess) notifications.push(`Forge Access: <strong>${forgeAccess}</strong>`);
      
      if (phone) member.phone = phone;
      if (college) member.college = college;
      if (skillLevel) member.skillLevel = skillLevel;
      if (interests) member.interests = interests;
      if (paymentProof) member.paymentProofUrl = paymentProof;
      if (squad !== undefined) member.squad = squad;
      if (rank !== undefined) member.rank = rank;
      if (xp !== undefined) member.xp = parseInt(xp) || member.xp;
      if (forgeAccess !== undefined) member.forgeAccess = forgeAccess;
      await member.save();
      
      const log = new ActionLog({
        timestamp: new Date(), type: 'PROFILE_UPDATED',
        content: `Profile updated by Admin (squad/rank/xp/access)`,
        operativeId: member.operativeId, name: member.name
      });
      await log.save();
      
      if (notifications.length > 0) {
        await notifyUser(member.email, 'Innovexa Hub - Profile Updated', `
          <p>Your profile has been updated by an administrator with the following changes:</p>
          <ul style="margin:20px 0;padding-left:20px;color:#0f172a;font-size:14px;line-height:1.8;">
            ${notifications.map(n => `<li>${n}</li>`).join('')}
          </ul>
          <a href="https://innovexareg.vercel.app/forge.html" style="display:inline-block;padding:10px 20px;background:#000000;color:#fff;text-decoration:none;font-weight:700;font-size:13px;margin-top:10px;">VIEW DASHBOARD →</a>
        `);
      }
      
      return res.status(200).json({ success: true, message: 'Profile updated' });
    }

    // ADMIN: Audit Logs
    if (action === 'admin_get_audit_logs') {
      const logs = await ActionLog.find({}).sort({ timestamp: -1 }).limit(500).lean();
      return res.status(200).json({ success: true, logs: logs, data: logs });
    }

    // FORGE: Get Member Profile
    if (action === 'forge_get_member_profile') {
      const { operativeId } = payload;
      if (!operativeId) return res.status(200).json({ success: false, message: 'Missing operativeId.' });
      
      const profile = await Member.findOne({ operativeId: operativeId.trim().toUpperCase() }).lean();
      if (!profile) return res.status(200).json({ success: false, message: 'Profile not found.' });

      let linkedMentorName = '';
      if (profile.linkedMentor) {
        const mentor = await Member.findOne({ operativeId: profile.linkedMentor.trim().toUpperCase() }).lean();
        if (mentor) linkedMentorName = mentor.name;
      }

      return res.status(200).json({
        success: true,
        data: {
          name: profile.name,
          operativeId: profile.operativeId,
          forgeRole: profile.forgeRole,
          linkedMentor: profile.linkedMentor,
          linkedMentorName
        }
      });
    }

    // FORGE: Log Action
    if (action === 'forge_log_action') {
      const { operativeId, actionDesc } = payload;
      if (!operativeId || !actionDesc) return res.status(200).json({ success: false, message: 'Missing fields.' });
      
      const member = await Member.findOne({ operativeId: operativeId.trim().toUpperCase() }).lean();
      const opName = member ? member.name : 'Unknown';
      
      const log = new ActionLog({
        timestamp: new Date(),
        type: 'USER_ACTION',
        content: actionDesc,
        operativeId: operativeId.trim().toUpperCase(),
        name: opName
      });
      await log.save();
      
      return res.status(200).json({ success: true, message: 'Action logged.' });
    }

    // FORGE: Set Role
    if (action === 'forge_set_role') {
      const { invxId, adminId, role } = payload;
      if (!invxId || !adminId) return res.status(200).json({ success: false, message: 'Missing parameters.' });
      
      // Verify Admin
      let adminRole = 'Unknown';
      if (adminId.trim() === 'INVX-MASTER') {
        adminRole = 'president';
      } else {
        const admin = await Member.findOne({ operativeId: adminId.trim().toUpperCase() });
        if (admin) {
           let r = (admin.forgeRole || '').trim().toLowerCase();
           let isPres = (r === 'president' || ['INVX-01', 'INVX-09', 'INVX-7ZB7L'].includes(admin.operativeId));
           adminRole = r || (isPres ? 'president' : 'admin');
           if (!isPres && adminRole !== 'admin' && !['INVX-02', 'INVX-03'].includes(admin.operativeId)) {
             adminRole = 'unknown';
           }
        }
      }

      if (adminRole !== 'president' && adminRole !== 'admin') {
         return res.status(200).json({ success: false, message: 'Unauthorized. You must be an admin.' });
      }

      const member = await Member.findOne({ operativeId: invxId.trim().toUpperCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });

      member.forgeRole = role.trim();
      await member.save();

      const log = new ActionLog({
        timestamp: new Date(),
        type: 'ROLE_ASSIGNED',
        content: `Operative ${member.name} assigned role: ${role}`,
        operativeId: member.operativeId,
        name: member.name
      });
      await log.save();

      return res.status(200).json({ success: true, message: `Role updated to ${role}.` });
    }

    // FORGE: Link Mentor
    if (action === 'forge_link_mentor') {
      const { invxId, mentorId, adminId } = payload;
      if (!invxId || !adminId) return res.status(200).json({ success: false, message: 'Missing parameters.' });

      // Verify Admin
      let adminRole = 'Unknown';
      if (adminId.trim() === 'INVX-MASTER') {
        adminRole = 'president';
      } else {
        const admin = await Member.findOne({ operativeId: adminId.trim().toUpperCase() });
        if (admin) {
           let r = (admin.forgeRole || '').trim().toLowerCase();
           let isPres = (r === 'president' || ['INVX-01', 'INVX-09', 'INVX-7ZB7L'].includes(admin.operativeId));
           adminRole = r || (isPres ? 'president' : 'admin');
           if (!isPres && adminRole !== 'admin' && !['INVX-02', 'INVX-03'].includes(admin.operativeId)) {
             adminRole = 'unknown';
           }
        }
      }

      if (adminRole !== 'president' && adminRole !== 'admin') {
         return res.status(200).json({ success: false, message: 'Unauthorized. You must be an admin.' });
      }

      const member = await Member.findOne({ operativeId: invxId.trim().toUpperCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });

      let mentorName = '';
      if (mentorId) {
         const mentor = await Member.findOne({ operativeId: mentorId.trim().toUpperCase() });
         if (mentor) mentorName = mentor.name;
      }

      member.linkedMentor = mentorId || '';
      await member.save();

      const log = new ActionLog({
        timestamp: new Date(),
        type: 'MENTOR_LINKED',
        content: `Operative ${member.name} linked to Mentor ${mentorName}`,
        operativeId: member.operativeId,
        name: member.name
      });
      await log.save();

      return res.status(200).json({ success: true, message: `Linked to mentor successfully.` });
    }

    // FORGE: Get SOS
    if (action === 'forge_get_sos') {
      const sosList = await Sos.find({}).sort({ timestamp: -1 }).limit(30).lean();
      return res.status(200).json({ success: true, data: sosList });
    }

    // FORGE: Post SOS
    if (action === 'forge_post_sos') {
      const { invxId, title, desc } = payload;
      if (!invxId || !title || !desc) return res.status(200).json({ success: false, message: 'Missing fields.' });

      const member = await Member.findOne({ operativeId: invxId.trim().toUpperCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });

      const sos = new Sos({
        timestamp: new Date(),
        operativeId: member.operativeId,
        name: member.name,
        title: title,
        description: desc,
        status: 'open'
      });
      await sos.save();

      const log = new ActionLog({
        timestamp: new Date(),
        type: 'SOS_CREATED',
        content: `Operative ${member.name} broadcasted SOS: ${title}`,
        operativeId: member.operativeId,
        name: member.name
      });
      await log.save();

      // SOS = urgent admin notification
      await notifyAdmin({
        type: 'SOS_CREATED',
        operativeId: member.operativeId,
        name: member.name,
        detail: `SOS Title: "${title}". Description: ${desc}`,
        urgent: true
      });

      return res.status(200).json({ success: true, message: 'SOS Broadcasted.' });
    }

    // FORGE: Resolve SOS
    if (action === 'forge_resolve_sos') {
      const { sosId, helperId } = payload;
      // Note: we can use MongoDB _id as sosId if frontend sends it, but old GAS used row index or timestamp
      // Assuming frontend sends the timestamp or _id as sosId
      const sos = await Sos.findOne({ timestamp: new Date(sosId) }) || await Sos.findById(sosId);
      if (!sos) return res.status(200).json({ success: false, message: 'SOS not found.' });

      const helper = await Member.findOne({ operativeId: helperId.trim().toUpperCase() });
      
      sos.status = 'resolved';
      sos.helperOperativeId = helper ? helper.operativeId : 'Unknown';
      sos.helperName = helper ? helper.name : 'Unknown';
      await sos.save();

      const log = new ActionLog({
        timestamp: new Date(),
        type: 'SOS_RESOLVED',
        content: `SOS "${sos.title}" resolved by ${sos.helperName}`,
        operativeId: sos.operativeId,
        name: sos.name
      });
      await log.save();

      return res.status(200).json({ success: true, message: 'SOS marked as resolved.' });
    }

    // FORGE: Get Sessions (Private/Targeted logic)
    if (action === 'forge_get_sessions' || action === 'getSessions') {
      const { operativeId } = payload;
      let sessions = await Session.find({}).sort({ timestamp: -1 }).lean();
      if (operativeId) {
        sessions = sessions.filter(s => 
          !s.allowedOperatives || 
          s.allowedOperatives.length === 0 || 
          s.allowedOperatives.includes(operativeId.toUpperCase())
        );
      }
      return res.status(200).json({ success: true, data: sessions, sessions: sessions });
    }

    // FORGE: Get Resources
    if (action === 'forge_get_resources') {
      const resources = await Resource.find({}).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, resources: resources });
    }
    if (action === 'admin_add_resource') {
      const { title, category, url } = payload;
      if (!title || !url) return res.status(200).json({ success: false, message: 'Title and URL are required.' });
      const newResource = new Resource({
        resourceId: 'RES-' + Date.now(),
        timestamp: new Date(),
        title, category: category || 'General', url,
        addedBy: payload.adminId || 'admin'
      });
      await newResource.save();
      return res.status(200).json({ success: true, message: 'Resource added.' });
    }
    if (action === 'admin_delete_resource') {
      const { id } = payload;
      if (!id) return res.status(200).json({ success: false, message: 'Resource ID required.' });
      await Resource.deleteOne({ resourceId: id });
      return res.status(200).json({ success: true, message: 'Resource deleted.' });
    }

    // FORGE: Bounties
    if (action === 'forge_get_bounties') {
      const bounties = await Bounty.find({}).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, data: bounties });
    }
    if (action === 'forge_post_bounty') {
      const { operativeId, name, title, description, xp } = payload;
      const b = new Bounty({
        bountyId: 'BTY-' + Date.now(),
        timestamp: new Date(),
        title, description, xp, status: 'open', claimedBy: ''
      });
      await b.save();
      
      const log = new ActionLog({
        timestamp: new Date(),
        type: 'BOUNTY_POSTED',
        content: `Mentor ${name} posted bounty: ${title} (+${xp} XP)`,
        operativeId, name
      });
      await log.save();
      return res.status(200).json({ success: true, message: 'Bounty posted.' });
    }
    if (action === 'forge_claim_bounty') {
      const { rowIndex, operativeId, name } = payload;
      const bounty = await Bounty.findOne({ bountyId: rowIndex });
      if (bounty) {
        bounty.status = 'claimed';
        bounty.claimedBy = operativeId;
        await bounty.save();
        
        const log = new ActionLog({
          timestamp: new Date(),
          type: 'BOUNTY_CLAIMED',
          content: `Operative ${name} claimed bounty: ${bounty.title}`,
          operativeId, name
        });
        await log.save();

        await notifyAdmin({
          type: 'BOUNTY_CLAIMED',
          operativeId,
          name,
          detail: `"${bounty.title}" bounty claimed (+${bounty.xp || 0} XP)`
        });
      }
      return res.status(200).json({ success: true, message: 'Bounty claimed.' });
    }
    if (action === 'forge_complete_bounty') {
      const { rowIndex } = payload;
      const bounty = await Bounty.findOne({ bountyId: rowIndex });
      if (bounty) {
        bounty.status = 'completed';
        await bounty.save();
        
        const member = await Member.findOne({ operativeId: bounty.claimedBy });
        if (member) {
           const log = new ActionLog({
             timestamp: new Date(),
             type: 'BOUNTY_COMPLETED',
             content: `Bounty completed: ${bounty.title}`,
             operativeId: member.operativeId, name: member.name
           });
           await log.save();

           await notifyAdmin({
             type: 'BOUNTY_COMPLETED',
             operativeId: member.operativeId,
             name: member.name,
             detail: `"${bounty.title}" bounty completed and verified.`
           });
        }
      }
      return res.status(200).json({ success: true, message: 'Bounty completed.' });
    }

    // FORGE: Tasks (Edit/Recall)
    if (action === 'forge_edit_task') {
       const { taskId, title, description, xp, difficulty, feedback, status } = payload;
       const submitLink = payload.submitLink || payload.link;
       const t = await Task.findOne({ taskId });
       if (t) {
         if (title) t.title = title;
         if (description) t.description = description;
         if (xp) t.xp = xp;
         if (difficulty) t.difficulty = difficulty;
         if (feedback) t.feedback = feedback;
         if (status) t.status = status;
         if (submitLink) t.submitLink = submitLink;
         await t.save();
       }
       return res.status(200).json({ success: true, message: 'Task updated' });
    }
    if (action === 'forge_recall_task') {
       const { taskId, invxId } = payload;
       const t = await Task.findOne({ taskId });
       if (!t) return res.status(200).json({ success: false, message: 'Task not found.' });
       const prevStatus = t.status;
       t.status = 'Open';
       t.submitLink = '';
       await t.save();

       // Log the recall
       const operativeId = invxId ? invxId.trim().toUpperCase() : t.assignedTo;
       const recallerMember = operativeId ? await Member.findOne({ operativeId }).lean() : null;
       const recallerName = recallerMember ? recallerMember.name : operativeId || 'Unknown';
       await new ActionLog({
         timestamp: new Date(),
         type: 'TASK_RECALLED',
         content: `Task "${t.title}" recalled from ${prevStatus} → Open by ${recallerName}.`,
         operativeId: operativeId || 'SYSTEM',
         name: recallerName
       }).save();

       await notifyAdmin({
         type: 'TASK_RECALLED',
         operativeId: operativeId || 'SYSTEM',
         name: recallerName,
         detail: `"${t.title}" was recalled (was: ${prevStatus}). Moved back to Open pool.`
       });

       return res.status(200).json({ success: true, message: 'Task recalled. Moved back to Open.' });
    }

    // SESSIONS & ATTENDANCE
    // Also support bare 'sessions' action used in attendance section
    if (action === 'get_public_sessions' || action === 'admin_get_sessions' || action === 'sessions') {
      const sessions = await Session.find({}).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, data: sessions, sessions: sessions });
    }
    if (action === 'admin_get_attendance') {
      const { sessionId } = payload;
      const query = sessionId ? { sessionId } : {};
      const attendance = await Attendance.find(query).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, data: attendance, attendance: attendance });
    }

    // MISC missing features
    if (action === 'forge_get_apprentices') {
      const apps = await Member.find({ 
        $or: [{ forgeRole: 'Apprentice' }, { rank: 'Apprentice' }],
        status: { $in: ['Approved', 'Confirmed'] }
      }, 'name operativeId').lean();
      return res.status(200).json({ success: true, data: apps });
    }
    if (action === 'forge_get_all_roles') {
      const roles = await Member.find({}, 'name operativeId forgeRole').lean();
      return res.status(200).json({ success: true, data: roles });
    }
    if (action === 'admin_get_feedback') {
      const { eventId } = payload;
      const query = eventId ? { eventId } : {};
      const fb = await Feedback.find(query).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, data: fb, feedback: fb });
    }
    if (action === 'public_submit_feedback') {
      const { eventId, operativeId, rating, comments } = payload;
      if (!eventId || !operativeId || !rating) return res.status(400).json({ success: false, message: 'Missing fields' });
      
      const member = await Member.findOne({ operativeId: operativeId.toUpperCase() });
      const newFb = new Feedback({
        eventId,
        operativeId: operativeId.toUpperCase(),
        name: member ? member.name : 'Unknown',
        comment: comments,
        rating: Number(rating),
        timestamp: new Date()
      });
      await newFb.save();
      return res.status(200).json({ success: true });
    }
    
    // NEW ADMIN OPS (Tasks/Bounties from Admin Dashboard)
    // Admin creates tasks via 'admin_create_task' — stored in Task collection
    // These show up as bounties in the forge/bounties view
    if (action === 'admin_create_task') {
      const { title, description, xp, difficulty, assignedTo } = payload;
      const t = new Task({
        taskId: 'TSK-' + Date.now(),
        timestamp: new Date(),
        title, description,
        xp: parseInt(xp) || 0,
        difficulty: difficulty || 'Easy',
        status: 'Open',
        assignedTo: assignedTo || 'Open',
        submitLink: '', feedback: ''
      });
      await t.save();
      const log = new ActionLog({
        timestamp: new Date(), type: 'TASK_CREATED',
        content: `Admin created task: ${title} (+${xp} XP)`,
        operativeId: 'ADMIN', name: 'System Admin'
      });
      await log.save();
      
      await notifyAdmin({
        type: 'TASK_CREATED',
        operativeId: 'ADMIN',
        name: 'System Admin',
        detail: `New task deployed: "${title}" (+${xp} XP). Assigned to: ${assignedTo || 'Open'}`
      });

      return res.status(200).json({ success: true, message: 'Bounty deployed!' });
    }
    if (action === 'admin_edit_task') {
       const { taskId, title, description, xp, difficulty, assignedTo, status } = payload;
       const t = await Task.findOne({ taskId });
       if (!t) return res.status(200).json({ success: false, message: 'Task not found.' });
       if (title !== undefined) t.title = title;
       if (description !== undefined) t.description = description;
       if (xp !== undefined) t.xp = parseInt(xp) || 0;
       if (difficulty !== undefined) t.difficulty = difficulty;
       if (assignedTo !== undefined) t.assignedTo = assignedTo;
       if (status !== undefined) t.status = status;
       await t.save();
       
       await notifyAdmin({
         type: 'TASK_UPDATED',
         operativeId: 'ADMIN',
         name: 'System Admin',
         detail: `Task "${t.title}" was updated. Assigned to: ${t.assignedTo}, Status: ${t.status}`
       });
       
       return res.status(200).json({ success: true, message: 'Task updated' });
    }
    if (action === 'admin_delete_task') {
       const { taskId } = payload;
       const t = await Task.findOne({ taskId });
       if (t) {
         await notifyAdmin({
           type: 'TASK_DELETED',
           operativeId: 'ADMIN',
           name: 'System Admin',
           detail: `Task "${t.title}" was permanently deleted.`
         });
       }
       await Task.deleteOne({ taskId });
       return res.status(200).json({ success: true, message: 'Task deleted' });
    }
    if (action === 'admin_review_task') {
       const { taskId, status, feedback } = payload;
       const t = await Task.findOne({ taskId });
       if (!t) return res.status(200).json({ success: false, message: 'Task not found.' });

       t.status = status;
       t.feedback = feedback || '';
       await t.save();

       // Award XP if completed and assigned to a specific member
       if (status === 'Completed' && t.assignedTo && t.assignedTo !== 'Open') {
         const xpToAward = parseInt(t.xp) || 0;
         const member = await Member.findOneAndUpdate(
           { operativeId: t.assignedTo },
           { $inc: { xp: xpToAward } },
           { new: true }
         );
         if (member) {
           // Update rank based on XP
           let rank = 'Apprentice';
           if (member.xp >= 3000) rank = 'Grandmaster';
           else if (member.xp >= 1500) rank = 'Expert';
           else if (member.xp >= 800) rank = 'Advanced';
           else if (member.xp >= 400) rank = 'Skilled';
           else if (member.xp >= 150) rank = 'Operative';
           member.rank = rank;
           await member.save();

           const log = new ActionLog({
             timestamp: new Date(), type: 'TASK_COMPLETED',
             content: `Task approved: ${t.title} (+${xpToAward} XP)`,
             operativeId: member.operativeId, name: member.name
           });
           await log.save();

           // Email the member — task approved
           if (member.email && process.env.EMAIL_USER) {
             try {
               await transporter.sendMail({
                 from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
                 to: member.email,
                 subject: `✅ Task Approved: ${t.title} (+${xpToAward} XP)`,
                 html: buildEmail({
                   title: 'Task Approved! 🏆',
                   subtitle: `+${xpToAward} XP Earned`,
                   iconEmoji: '✅',
                   accentColor: '#10b981',
                   bodyHtml: `
                     <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
                     <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.7;">
                       Your task submission has been <strong style="color:#10b981;">approved</strong> by the admin. Great work!
                     </p>
                     <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:20px;">
                       <table style="width:100%;border-collapse:collapse;">
                         <tr style="border-bottom:1px solid #dcfce7;"><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Task</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#111827;">${t.title}</td></tr>
                         <tr style="border-bottom:1px solid #dcfce7;"><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">XP Earned</td><td style="padding:10px 0;font-size:20px;font-weight:800;color:#10b981;">+${xpToAward} XP</td></tr>
                         <tr style="border-bottom:1px solid #dcfce7;"><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">New Rank</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#7c3aed;">${rank}</td></tr>
                         ${feedback ? `<tr><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Feedback</td><td style="padding:10px 0;font-size:13px;color:#374151;line-height:1.6;">${feedback}</td></tr>` : ''}
                       </table>
                     </div>
                     <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:14px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">View Your Forge Dashboard →</a>
                   \`
                 })
               });
             } catch(e) { console.error('Member approval email failed:', e.message); }
           }
         }
       }

       // If rejected — notify member and log
       if ((status === 'Open' || status === 'In Progress') && t.assignedTo && t.assignedTo !== 'Open') {
         const member = await Member.findOne({ operativeId: t.assignedTo });
         if (member) {
           const log = new ActionLog({
             timestamp: new Date(), type: 'TASK_RECALLED',
             content: `Task rejected & reassigned: ${t.title}`,
             operativeId: member.operativeId, name: member.name
           });
           await log.save();

           // Email the member — task rejected
           if (member.email && process.env.EMAIL_USER) {
             try {
               await transporter.sendMail({
                 from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
                 to: member.email,
                 subject: `❌ Task Needs Revision: ${t.title}`,
                 html: buildEmail({
                   title: 'Revision Required 🔁',
                   subtitle: `Task: ${t.title}`,
                   iconEmoji: '🔁',
                   accentColor: '#f59e0b',
                   bodyHtml: `
                     <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi <strong style="color:#000;">${member.name}</strong>,</p>
                     <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.7;">
                       Your task submission needs some changes before it can be approved. Please review and resubmit.
                     </p>
                     <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:20px;margin-bottom:20px;">
                       <table style="width:100%;border-collapse:collapse;">
                         <tr style="border-bottom:1px solid #fef3c7;"><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Task</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#111827;">${t.title}</td></tr>
                         <tr ${feedback ? 'style="border-bottom:1px solid #fef3c7;"' : ''}><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Status</td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#dc2626;">Sent Back for Revision</td></tr>
                         ${feedback ? `<tr><td style="padding:10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Admin Feedback</td><td style="padding:10px 0;font-size:13px;color:#374151;line-height:1.6;">${feedback}</td></tr>` : ''}
                       </table>
                     </div>
                     <a href="https://innovexareg.vercel.app/forge.html" style="display:block;text-align:center;padding:14px 24px;background:#000000;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">Resubmit on Forge →</a>
                   \`
                 })
               });
             } catch(e) { console.error('Member rejection email failed:', e.message); }
           }
         }
       }

       return res.status(200).json({ success: true, message: 'Task reviewed' });
    }
    
    // Broadcast & Feed
    if (action === 'admin_post_feed') {
       // Accept both 'message' and 'content' field names
       const message = payload.message || payload.content;
       if (!message) return res.status(200).json({ success: false, message: 'Content is required.' });
       const log = new ActionLog({
         timestamp: new Date(), type: 'BROADCAST',
         content: message, operativeId: 'ADMIN', name: 'System Admin'
       });
       await log.save();
       return res.status(200).json({ success: true, message: 'Posted to feed' });
    }
    if (action === 'admin_send_broadcast') {
       const { subject, body, emails } = payload;
       if (!subject || !body || !emails || !emails.length) {
         return res.status(200).json({ success: false, message: 'Missing fields' });
       }
       
       const mailOptions = {
         from: process.env.EMAIL_USER,
         to: process.env.EMAIL_USER, // Send to self, BCC everyone else
         bcc: emails.join(','),
         subject: subject,
         text: body
       };
       await transporter.sendMail(mailOptions);
       return res.status(200).json({ success: true, message: `Sent email to ${emails.length} operatives` });
    }

    if (action === 'admin_test_email') {
       const adminEmail = process.env.ADMIN_EMAIL || 'updates.innovexa@zohomail.in';
       if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
         return res.status(200).json({ success: false, message: 'EMAIL_USER or EMAIL_PASS environment variable is missing on Vercel.' });
       }
       try {
         await transporter.sendMail({
           from: `"Innovexa Hub Admin" <${process.env.EMAIL_USER}>`,
           to: adminEmail,
           subject: '🧪 [TEST EMAIL] Innovexa Admin Notification System Check',
           html: `
             <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#0f0f0f;color:#fff;border-radius:12px;border:1px solid #27272a;">
               <div style="font-size:40px;text-align:center;margin-bottom:12px;">🧪</div>
               <h2 style="text-align:center;color:#000000;margin-bottom:4px;">Admin Email System Check</h2>
               <p style="text-align:center;color:#a1a1aa;font-size:13px;margin-bottom:20px;">This is a test notification confirming that the Innovexa Hub mail delivery system is functioning properly.</p>
               <div style="background:#18181b;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #3f3f46;">
                 <table style="width:100%;border-collapse:collapse;">
                   <tr><td style="padding:6px 0;color:#71717a;font-size:12px;width:35%;">Status</td><td style="color:#10b981;font-weight:700;">✅ Operational</td></tr>
                   <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Recipient</td><td style="color:#000000;font-weight:700;">${adminEmail}</td></tr>
                   <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Sender</td><td style="color:#e2e8f0;font-size:13px;">${process.env.EMAIL_USER}</td></tr>
                   <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Sent At</td><td style="color:#a1a1aa;font-size:12px;">${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</td></tr>
                 </table>
               </div>
               <a href="https://innovexareg.vercel.app/admin.html" style="display:block;text-align:center;padding:12px;background:#000000;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Open Admin Console →</a>
               <p style="color:#52525b;font-size:10px;text-align:center;margin-top:16px;">Innovexa Hub Auto-Notification Engine</p>
             </div>`
         });
         return res.status(200).json({ success: true, message: `Test email sent successfully to ${adminEmail}` });
       } catch (err) {
         console.error('Test email failed:', err);
         return res.status(200).json({ success: false, message: `Failed to send email: ${err.message}` });
       }
    }

    // FALLBACK
    
    // -------------------------------------------------------------
    // ASSETS
    // -------------------------------------------------------------
    if (action === 'assets') {
      const assets = await Asset.find({}).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, data: assets });
    }
    if (action === 'addAsset') {
      const { name, type, serial } = payload;
      const assetId = 'AST-' + Math.floor(1000 + Math.random() * 9000);
      const newAsset = new Asset({
        assetId, name, type, serial, status: 'Available', timestamp: new Date()
      });
      await newAsset.save();
      return res.status(200).json({ success: true, message: 'Asset added.' });
    }
    if (action === 'borrowAsset') {
      const { rowIndex, user } = payload;
      // Note: rowIndex here is passed from UI, but we can treat it as assetId if we fix the UI, 
      // or we just find by assetId. In admin.html, it passes rowIndex, which was the row number.
      // We will need to fix the UI to pass assetId instead of rowIndex.
      // Let's assume the UI will be updated to pass assetId.
      const { assetId } = payload;
      const asset = await Asset.findOne({ assetId: assetId || rowIndex });
      if (!asset) return res.status(200).json({ success: false, message: 'Asset not found.' });
      asset.status = 'Borrowed';
      asset.borrowedBy = user;
      asset.borrowDate = new Date();
      await asset.save();
      return res.status(200).json({ success: true, message: 'Asset borrowed.' });
    }
    if (action === 'returnAsset') {
      const { rowIndex, assetId } = payload;
      const asset = await Asset.findOne({ assetId: assetId || rowIndex });
      if (!asset) return res.status(200).json({ success: false, message: 'Asset not found.' });
      asset.status = 'Available';
      asset.borrowedBy = '';
      asset.borrowDate = null;
      await asset.save();
      return res.status(200).json({ success: true, message: 'Asset returned.' });
    }

    // -------------------------------------------------------------
    // DOCS & CERTS
    // -------------------------------------------------------------
    if (action === 'docrequests') {
      const docs = await DocRequest.find({}).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, data: docs });
    }
    if (action === 'docApprove') {
      const { requestId, status } = payload;
      const reqDoc = await DocRequest.findOne({ requestId });
      if (reqDoc) {
        reqDoc.status = status;
        await reqDoc.save();
      }
      return res.status(200).json({ success: true, message: 'Status updated.' });
    }
    if (action === 'certreqs') {
      const certs = await CertReq.find({}).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, data: certs });
    }
    if (action === 'certApprove') {
      const { requestId, status } = payload;
      const reqCert = await CertReq.findOne({ requestId });
      if (reqCert) {
        reqCert.status = status;
        await reqCert.save();
      }
      return res.status(200).json({ success: true, message: 'Status updated.' });
    }

    // -------------------------------------------------------------
    // SESSIONS (Creation & Management)
    // -------------------------------------------------------------
    if (action === 'admin_create_session' || action === 'addSession') {
      const { title, date, eventType, description, coverUrl, imageUrls, allowedOperatives } = payload;
      const sessionId = 'SES-' + Math.floor(1000 + Math.random() * 9000);
      const newSession = new Session({
        sessionId, title, date, location: eventType || 'HQ', description, timestamp: new Date(), coverUrl, imageUrls: imageUrls || [],
        allowedOperatives: allowedOperatives || []
      });
      await newSession.save();
      
      // Notify users if this is a targeted session
      if (allowedOperatives && allowedOperatives.length > 0) {
        const ops = await Member.find({ operativeId: { $in: allowedOperatives } }).lean();
        for (const op of ops) {
          await notifyUser(op.email, `You've been invited to a private session: ${title}`, `
            <h3>Private Session Invitation</h3>
            <p>You have been exclusively selected for: <strong>${title}</strong></p>
            <p>Date: ${date}</p>
            <p>${description}</p>
            <br>
            <p>Log in to your Dashboard to view details.</p>
          `);
        }
      }
      
      return res.status(200).json({ success: true, message: 'Session created.' });
    }
    if (action === 'admin_edit_session' || action === 'editSession') {
      const { sessionId, title, date, description, status, allowedOperatives, eventType, coverUrl, imageUrls } = payload;
      const ev = await Session.findOne({ sessionId });
      if (!ev) return res.status(200).json({ success: false, message: 'Session not found.' });
      if (title !== undefined) ev.title = title;
      if (date !== undefined) ev.date = date;
      if (description !== undefined) ev.description = description;
      if (status !== undefined) ev.status = status;
      if (allowedOperatives !== undefined) ev.allowedOperatives = allowedOperatives;
      if (eventType !== undefined) ev.eventType = eventType;
      if (coverUrl !== undefined) ev.coverUrl = coverUrl;
      if (imageUrls !== undefined) ev.imageUrls = imageUrls;
      await ev.save();
      return res.status(200).json({ success: true, message: 'Session updated.' });
    }
    if (action === 'admin_delete_session' || action === 'deleteSession') {
      const { sessionId } = payload;
      await Session.deleteOne({ sessionId });
      await Attendance.deleteMany({ sessionId });
      return res.status(200).json({ success: true, message: 'Session deleted.' });
    }
    if (action === 'admin_get_attendance' || action === 'getEventRegs') { // keeping getEventRegs alias for UI backward compatibility temporarily
      const { sessionId, eventId } = payload;
      const id = sessionId || eventId;
      const regs = await Attendance.find({ sessionId: id }).lean();
      return res.status(200).json({ success: true, regs });
    }
    if (action === 'admin_manual_attendance_verify') {
      const { sessionId, operativeId, otp } = payload;
      if (!sessionId || !operativeId || !otp) return res.status(400).json({ success: false, message: 'Missing parameters.' });
      
      const member = await Member.findOne({ operativeId: operativeId.toUpperCase() });
      if (!member) return res.status(200).json({ success: false, message: 'Member not found.' });
      
      if (!member.otp || member.otp !== otp || Date.now() - (member.otpTime || 0) > 15 * 60 * 1000) {
        return res.status(200).json({ success: false, message: 'Invalid or expired OTP.' });
      }
      
      // Clear OTP
      member.otp = '';
      await member.save();
      
      // Mark attendance
      const existing = await Attendance.findOne({ sessionId, operativeId: operativeId.toUpperCase() });
      if (existing) {
        existing.status = 'Attended';
        await existing.save();
      } else {
        await Attendance.create({ eventId: sessionId, sessionId, operativeId: operativeId.toUpperCase(), status: 'Attended', timestamp: new Date() });
      }
      
      return res.status(200).json({ success: true, message: 'Attendance marked via OTP verification.' });
    }
    if (action === 'admin_log_attendance' || action === 'markAttendance') {
      const operativeId = payload.operativeId;
      // Accept sessionId directly OR eventName/sessionName
      let sessionId = payload.sessionId || payload.eventId;
      const name = payload.sessionName || payload.eventName;
      if (!sessionId && name) {
        const ev = await Session.findOne({ title: name }).lean();
        if (ev) sessionId = ev.sessionId;
        else sessionId = name; 
      }
      if (!sessionId || !operativeId) return res.status(200).json({ success: false, message: 'Missing sessionId or operativeId.' });
      // Verify the operative exists
      const memberCheck = await Member.findOne({ operativeId: operativeId.trim().toUpperCase() }).lean();
      if (!memberCheck) return res.status(200).json({ success: false, message: `Operative ${operativeId} not found in system.` });
      const existing = await Attendance.findOne({ sessionId, operativeId: operativeId.trim().toUpperCase() });
      if (existing) {
        existing.status = 'Attended';
        await existing.save();
      } else {
        await Attendance.create({ eventId, operativeId: operativeId.trim().toUpperCase(), status: 'Attended', timestamp: new Date() });
      }
      return res.status(200).json({ success: true, message: `✅ ${memberCheck.name} marked as attended.` });
    }
    if (action === 'admin_remove_attendance' || action === 'updateRegStatus') {
      const { eventId, operativeId, status } = payload;
      const existing = await Attendance.findOne({ eventId, operativeId });
      if (existing) {
        existing.status = status;
        await existing.save();
      }
      return res.status(200).json({ success: true, message: 'Status updated.' });
    }

    if (action === 'admin_upload_event_image') {
      const { imageData, mimeType, fileName } = payload;
      if (!imageData || !mimeType) return res.status(200).json({ success: false, message: 'Missing image data' });
      // We store the image directly as a base64 string since MongoDB can handle up to 16MB
      const dataUrl = `data:${mimeType};base64,${imageData}`;
      return res.status(200).json({ success: true, url: dataUrl });
    }

    return res.status(200).json({ success: false, message: 'Unknown or unmigrated action: ' + action });
    
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
  }
}
