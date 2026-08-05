import { connectToDatabase } from './db.js';
import { Member, ActionLog, Task, Sos, Session, Bounty, Resource, Event, Attendance, Feedback, Asset, DocRequest, CertReq } from './models.js';
import nodemailer from 'nodemailer';

// ── Global Zoho Mail Transporter ─────────────────────────────────────────────
// Uses Zoho SMTP. Set EMAIL_USER=updates.innovexa@zohomail.in and EMAIL_PASS in env.
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}
const transporter = createTransporter();

// ── Admin Notification Helper ────────────────────────────────────────────────
// Sends a quick email to admin for every tracked member action.
async function notifyAdmin({ type, operativeId, name, detail, urgent = false }) {
  // Always send to admin inbox — hardcoded fallback ensures delivery even if ADMIN_EMAIL env missing
  const adminEmail = process.env.ADMIN_EMAIL || 'updates.innovexa@zohomail.in';
  if (!process.env.EMAIL_USER) { console.warn('notifyAdmin: EMAIL_USER not set, skipping'); return; }
  const icons = {
    LOGIN: '🔓', TASK_SUBMITTED: '📤', TASK_RECALLED: '↩️', TASK_COMPLETED: '✅',
    SOS_CREATED: '🆘', BOUNTY_CLAIMED: '🎯', BOUNTY_COMPLETED: '🏆',
    PROFILE_UPDATED: '✏️', REGISTRATION: '🆕', STATUS_CHANGE: '🔄', DEFAULT: '📋'
  };
  const icon = icons[type] || icons.DEFAULT;
  const urgentBanner = urgent
    ? `<div style="background:#ef4444;color:#fff;padding:8px 16px;border-radius:6px;font-weight:700;margin-bottom:16px;">🚨 URGENT ACTION REQUIRED</div>`
    : '';
  try {
    await transporter.sendMail({
      from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `${icon} [${type}] ${name} (${operativeId})`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px;background:#0f0f0f;color:#fff;border-radius:10px;">
          ${urgentBanner}
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <span style="font-size:32px;">${icon}</span>
            <div>
              <div style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:2px;">Member Activity</div>
              <div style="font-size:18px;font-weight:700;color:#fff;">${type.replace(/_/g,' ')}</div>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#71717a;font-size:12px;width:40%;">Operative</td><td style="padding:6px 0;color:#a78bfa;font-weight:700;font-family:monospace;">${operativeId}</td></tr>
            <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Name</td><td style="padding:6px 0;color:#fff;">${name}</td></tr>
            <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Time</td><td style="padding:6px 0;color:#a1a1aa;font-size:12px;">${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</td></tr>
            <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Detail</td><td style="padding:6px 0;color:#e2e8f0;font-size:13px;">${detail || 'N/A'}</td></tr>
          </table>
          <a href="https://innovexa.vercel.app/admin.html" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Open Admin Dashboard →</a>
          <p style="color:#3f3f46;font-size:10px;margin-top:16px;">Innovexa Hub Auto-Alert</p>
        </div>
      `
    });
  } catch(e) {
    console.error('notifyAdmin failed:', e.message);
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
      if (!member.email) return res.status(200).json({ success: false, message: 'No email associated with this ID.' });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      member.otp = otp;
      member.otpTime = Date.now();
      await member.save();
      
      try {
        await transporter.sendMail({
          from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
          to: member.email,
          subject: 'Innovexa Hub — Dashboard Login Code',
          html: `
            <div style="font-family:sans-serif; max-width:480px; margin:0 auto; padding:24px; background:#0f0f0f; color:#fff; border-radius:12px;">
              <h2 style="color:#7c3aed; margin-bottom:8px;">🔐 Login Code</h2>
              <p style="color:#a1a1aa;">Your one-time login code for the Innovexa Forge dashboard is:</p>
              <div style="background:#1a1a2e; border:1px solid #7c3aed; border-radius:8px; padding:20px; text-align:center; margin:20px 0;">
                <span style="font-size:36px; font-weight:700; letter-spacing:8px; color:#a78bfa; font-family:monospace;">${otp}</span>
              </div>
              <p style="color:#71717a; font-size:13px;">⏱ Valid for 15 minutes. Do not share this with anyone.</p>
              <hr style="border-color:#27272a; margin:20px 0;">
              <p style="color:#52525b; font-size:11px;">— Innovexa Hub Core Team</p>
            </div>
          `
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
      
      if (!member.otp || member.otp !== otp) {
        return res.status(200).json({ success: false, message: 'Invalid or expired login code.' });
      }
      if (Date.now() - member.otpTime > 15 * 60 * 1000) {
        return res.status(200).json({ success: false, message: 'Login code expired.' });
      }
      
      // Clear OTP and log login
      member.otp = '';
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
      notifyAdmin({
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
    
    // PUBLIC: Registration
    if (action === 'register_member') {
        const { fullName, email, phone, college, dob, year, gender, branch, skillLevel, interests, utr } = payload;
        
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
          status: 'Pending',
          amount: '599',
          xp: 0,
          rank: 'Apprentice',
          squad: 'Unassigned',
          forgeRole: 'Apprentice',
          forgeAccess: 'Pending'
        });
        
        await newMember.save();

        // Notify admin about new registration
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        if (adminEmail) {
          try {
            await transporter.sendMail({
              from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
              to: adminEmail,
              subject: `🆕 New Registration: ${fullName}`,
              html: `
                <div style="font-family:sans-serif; max-width:520px; margin:0 auto; padding:24px; background:#0f0f0f; color:#fff; border-radius:12px;">
                  <h2 style="color:#7c3aed; margin-bottom:4px;">🆕 New Member Registration</h2>
                  <p style="color:#71717a; font-size:13px; margin-top:0;">A new operative just signed up for Innovexa Hub.</p>
                  <table style="width:100%; border-collapse:collapse; margin-top:16px;">
                    <tr><td style="padding:8px; color:#a1a1aa; font-size:13px;">Name</td><td style="padding:8px; color:#fff; font-weight:600;">${fullName}</td></tr>
                    <tr style="background:#1a1a2e;"><td style="padding:8px; color:#a1a1aa; font-size:13px;">Email</td><td style="padding:8px; color:#7c3aed;">${email}</td></tr>
                    <tr><td style="padding:8px; color:#a1a1aa; font-size:13px;">Phone</td><td style="padding:8px; color:#fff;">${phone || 'N/A'}</td></tr>
                    <tr style="background:#1a1a2e;"><td style="padding:8px; color:#a1a1aa; font-size:13px;">College</td><td style="padding:8px; color:#fff;">${college || 'N/A'}</td></tr>
                    <tr><td style="padding:8px; color:#a1a1aa; font-size:13px;">Branch / Year</td><td style="padding:8px; color:#fff;">${branch || 'N/A'} — ${year || 'N/A'}</td></tr>
                    <tr style="background:#1a1a2e;"><td style="padding:8px; color:#a1a1aa; font-size:13px;">UTR</td><td style="padding:8px; color:#10b981; font-family:monospace;">${utr || 'Not provided'}</td></tr>
                    <tr><td style="padding:8px; color:#a1a1aa; font-size:13px;">Operative ID</td><td style="padding:8px; color:#a78bfa; font-weight:700; font-family:monospace;">${genId}</td></tr>
                  </table>
                  <div style="margin-top:20px; padding:12px; background:#1a1a2e; border-radius:8px; border-left:4px solid #7c3aed;">
                    <p style="margin:0; font-size:12px; color:#71717a;">Review and approve this registration in your <a href="https://innovexa.vercel.app/admin.html" style="color:#7c3aed;">Admin Dashboard</a>.</p>
                  </div>
                  <hr style="border-color:#27272a; margin:20px 0;">
                  <p style="color:#52525b; font-size:11px;">— Innovexa Hub Auto-Notifier</p>
                </div>
              `
            });
            console.log(`Admin notified about new registration: ${fullName}`);
          } catch (emailErr) {
            console.error('Admin notification email failed:', emailErr.message);
          }
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Registration successful.', 
          data: { operativeId: genId } 
        });
    }
    
    // ADMIN: Login
    if (action === 'admin_login') {
      const { invxId, email } = payload;
      if (!invxId || !email) return res.status(200).json({ success: false, message: 'Missing credentials.' });
      
      // Master Override
      if (invxId.trim() === 'admin@innovexa' && email.trim() === 'adminpass') {
        return res.status(200).json({
          success: true,
          data: {
            name: 'Master Admin',
            operativeId: 'INVX-MASTER',
            role: 'president',
            hasFaceRegistered: false
          }
        });
      }
      
      const member = await Member.findOne({ 
        operativeId: invxId.trim().toUpperCase(),
        email: email.trim().toLowerCase()
      });
      
      if (member) {
        let role = (member.forgeRole || '').trim().toLowerCase();
        let isPresident = (role === 'president' || ['INVX-01', 'INVX-09', 'INVX-7ZB7L'].includes(member.operativeId));
        let isAdmin = (role === 'admin' || isPresident || ['INVX-02', 'INVX-03'].includes(member.operativeId));
        
        if (!isAdmin) {
          return res.status(200).json({ success: false, message: 'Access Denied. You do not have Admin privileges.' });
        }
        
        let finalRole = role || (isPresident ? 'president' : 'admin');
        
        return res.status(200).json({
          success: true,
          data: {
            name: member.name,
            operativeId: member.operativeId,
            role: finalRole,
            hasFaceRegistered: !!member.faceDescriptor
          }
        });
      }
      return res.status(200).json({ success: false, message: 'Invalid Credentials.' });
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
      
      const task = await Task.findOne({ taskId, assignedTo: invxId.trim().toUpperCase() });
      if (!task) return res.status(200).json({ success: false, message: 'Task not found or not assigned to you.' });
      if (task.status === 'Completed' || task.status === 'Submitted') {
        return res.status(200).json({ success: false, message: 'Task is already submitted/completed.' });
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
        notifyAdmin({
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
      const members = await Member.find({ status: { $in: ['Approved', 'Confirmed'] } })
        .sort({ xp: -1 })
        .limit(50)
        .lean();
      
      const lb = members.map(m => ({
        name: m.name,
        operativeId: m.operativeId,
        xp: m.xp,
        rank: m.rank,
        role: m.forgeRole,
        squad: m.squad
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
            totalLogs: logs.length
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

      // Send approval welcome email when status becomes Confirmed
      if ((status === 'Confirmed' || status === 'Approved') && member.email) {
        try {
          await transporter.sendMail({
            from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
            to: member.email,
            subject: `🎉 Welcome to Innovexa Hub, ${member.name}!`,
            html: `
              <div style="font-family:sans-serif; max-width:520px; margin:0 auto; padding:28px; background:#0f0f0f; color:#fff; border-radius:12px;">
                <h1 style="color:#7c3aed; font-size:24px; margin-bottom:4px;">🎉 You're In!</h1>
                <p style="color:#a1a1aa; margin-top:0;">Welcome to Innovexa Hub, ${member.name}. Your membership has been confirmed.</p>
                <div style="background:#1a1a2e; border:1px solid #7c3aed; border-radius:10px; padding:20px; margin:20px 0; text-align:center;">
                  <p style="margin:0; color:#71717a; font-size:12px; text-transform:uppercase; letter-spacing:2px;">Your Operative ID</p>
                  <p style="margin:8px 0 0; font-size:28px; font-weight:700; color:#a78bfa; font-family:monospace; letter-spacing:4px;">${member.operativeId}</p>
                </div>
                <p style="color:#a1a1aa; font-size:14px;">Use this ID to log into the <strong>Innovexa Forge</strong> dashboard — your mission control for exclusive resources, bounties, and the leaderboard.</p>
                <a href="https://innovexa.vercel.app/forge.html" style="display:inline-block; margin-top:12px; padding:12px 24px; background:#7c3aed; color:#fff; text-decoration:none; border-radius:8px; font-weight:600;">Access the Forge →</a>
                <hr style="border-color:#27272a; margin:24px 0;">
                <p style="color:#52525b; font-size:11px;">— Innovexa Hub Core Team</p>
              </div>
            `
          });
          console.log(`Approval email sent to ${member.email}`);
        } catch (emailErr) {
          console.error('Approval email failed:', emailErr.message);
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
      notifyAdmin({
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

    // FORGE: Get Sessions
    if (action === 'forge_get_sessions') {
      const sessions = await Session.find({}).lean();
      return res.status(200).json({ success: true, data: sessions, sessions: sessions });
    }

    // FORGE: Get Resources
    if (action === 'forge_get_resources') {
      const resources = await Resource.find({}).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, resources: resources });
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

        notifyAdmin({
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

           notifyAdmin({
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

       notifyAdmin({
         type: 'TASK_RECALLED',
         operativeId: operativeId || 'SYSTEM',
         name: recallerName,
         detail: `"${t.title}" was recalled (was: ${prevStatus}). Moved back to Open pool.`
       });

       return res.status(200).json({ success: true, message: 'Task recalled. Moved back to Open.' });
    }

    // EVENTS & ATTENDANCE
    // Also support bare 'events' action used in attendance section
    if (action === 'get_public_events' || action === 'admin_get_events' || action === 'events') {
      const events = await Event.find({}).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, data: events, events: events });
    }
    if (action === 'admin_get_attendance') {
      const { eventId } = payload;
      const query = eventId ? { eventId } : {};
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
       return res.status(200).json({ success: true, message: 'Task updated' });
    }
    if (action === 'admin_delete_task') {
       const { taskId } = payload;
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
                 html: `
                   <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f0f0f;color:#fff;border-radius:10px;">
                     <div style="font-size:36px;text-align:center;margin-bottom:12px;">🏆</div>
                     <h2 style="text-align:center;color:#10b981;margin-bottom:4px;">Task Approved!</h2>
                     <p style="text-align:center;color:#a1a1aa;font-size:13px;margin-bottom:20px;">Your submission has been reviewed by the admin.</p>
                     <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
                       <table style="width:100%;border-collapse:collapse;">
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Task</td><td style="color:#fff;font-weight:700;">${t.title}</td></tr>
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Status</td><td style="color:#10b981;font-weight:700;">✅ Approved</td></tr>
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">XP Earned</td><td style="color:#a78bfa;font-weight:800;font-size:16px;">+${xpToAward} XP</td></tr>
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">New Rank</td><td style="color:#fbbf24;font-weight:700;">${rank}</td></tr>
                         ${feedback ? `<tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Feedback</td><td style="color:#e2e8f0;font-size:13px;">${feedback}</td></tr>` : ''}
                       </table>
                     </div>
                     <a href="https://innovexa.vercel.app/forge.html" style="display:block;text-align:center;padding:12px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">View Your Forge →</a>
                     <p style="color:#3f3f46;font-size:10px;text-align:center;margin-top:16px;">Innovexa Hub</p>
                   </div>`
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
                 html: `
                   <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f0f0f;color:#fff;border-radius:10px;">
                     <div style="font-size:36px;text-align:center;margin-bottom:12px;">🔁</div>
                     <h2 style="text-align:center;color:#ef4444;margin-bottom:4px;">Revision Required</h2>
                     <p style="text-align:center;color:#a1a1aa;font-size:13px;margin-bottom:20px;">Your submission needs some changes before it can be approved.</p>
                     <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
                       <table style="width:100%;border-collapse:collapse;">
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Task</td><td style="color:#fff;font-weight:700;">${t.title}</td></tr>
                         <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Status</td><td style="color:#ef4444;font-weight:700;">❌ Sent Back</td></tr>
                         ${feedback ? `<tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Admin Feedback</td><td style="color:#fbbf24;font-size:13px;">${feedback}</td></tr>` : ''}
                       </table>
                     </div>
                     <a href="https://innovexa.vercel.app/forge.html" style="display:block;text-align:center;padding:12px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Resubmit on Forge →</a>
                     <p style="color:#3f3f46;font-size:10px;text-align:center;margin-top:16px;">Innovexa Hub</p>
                   </div>`
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
               <h2 style="text-align:center;color:#a78bfa;margin-bottom:4px;">Admin Email System Check</h2>
               <p style="text-align:center;color:#a1a1aa;font-size:13px;margin-bottom:20px;">This is a test notification confirming that the Innovexa Hub mail delivery system is functioning properly.</p>
               <div style="background:#18181b;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #3f3f46;">
                 <table style="width:100%;border-collapse:collapse;">
                   <tr><td style="padding:6px 0;color:#71717a;font-size:12px;width:35%;">Status</td><td style="color:#10b981;font-weight:700;">✅ Operational</td></tr>
                   <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Recipient</td><td style="color:#a78bfa;font-weight:700;">${adminEmail}</td></tr>
                   <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Sender</td><td style="color:#e2e8f0;font-size:13px;">${process.env.EMAIL_USER}</td></tr>
                   <tr><td style="padding:6px 0;color:#71717a;font-size:12px;">Sent At</td><td style="color:#a1a1aa;font-size:12px;">${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</td></tr>
                 </table>
               </div>
               <a href="https://innovexa.vercel.app/admin.html" style="display:block;text-align:center;padding:12px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Open Admin Console →</a>
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
    // EVENTS (Creation & Management)
    // -------------------------------------------------------------
    if (action === 'admin_create_event' || action === 'addEvent') {
      const { title, date, eventType, description, coverUrl, imageUrls } = payload;
      const eventId = 'EVT-' + Math.floor(1000 + Math.random() * 9000);
      const newEvent = new Event({
        eventId, title, date, location: eventType || 'HQ', description, timestamp: new Date(), coverUrl, imageUrls: imageUrls || []
      });
      await newEvent.save();
      return res.status(200).json({ success: true, message: 'Event created.' });
    }
    if (action === 'admin_edit_event' || action === 'editEvent') {
      const { eventId, title, date, description, status } = payload;
      const ev = await Event.findOne({ eventId });
      if (!ev) return res.status(200).json({ success: false, message: 'Event not found.' });
      if (title) ev.title = title;
      if (date) ev.date = date;
      if (description) ev.description = description;
      if (status) ev.status = status;
      await ev.save();
      return res.status(200).json({ success: true, message: 'Event updated.' });
    }
    if (action === 'admin_delete_event' || action === 'deleteEvent') {
      const { eventId } = payload;
      await Event.deleteOne({ eventId });
      await Attendance.deleteMany({ eventId });
      return res.status(200).json({ success: true, message: 'Event deleted.' });
    }
    if (action === 'admin_get_attendance' || action === 'getEventRegs') {
      const { eventId } = payload;
      const regs = await Attendance.find({ eventId }).lean();
      return res.status(200).json({ success: true, regs });
    }
    if (action === 'admin_log_attendance' || action === 'markAttendance') {
      const operativeId = payload.operativeId;
      // Accept eventId directly OR eventName (from QR scanner) — look up event by title
      let eventId = payload.eventId;
      if (!eventId && payload.eventName) {
        const ev = await Event.findOne({ title: payload.eventName }).lean();
        if (ev) eventId = ev.eventId;
        else eventId = payload.eventName; // fall back to using name as key
      }
      if (!eventId || !operativeId) return res.status(200).json({ success: false, message: 'Missing eventId or operativeId.' });
      // Verify the operative exists
      const memberCheck = await Member.findOne({ operativeId: operativeId.trim().toUpperCase() }).lean();
      if (!memberCheck) return res.status(200).json({ success: false, message: `Operative ${operativeId} not found in system.` });
      const existing = await Attendance.findOne({ eventId, operativeId: operativeId.trim().toUpperCase() });
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
