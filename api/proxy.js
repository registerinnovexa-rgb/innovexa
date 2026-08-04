import { connectToDatabase } from './db.js';
import { Member, ActionLog, Task, Sos, Session } from './models.js';
import nodemailer from 'nodemailer';

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
    
    // PUBLIC: Status Check
    if (action === 'status_check') {
      const { email, utr, phone, id } = payload;
      let query = [];
      if (email) query.push({ email: email.trim().toLowerCase() });
      if (utr) query.push({ utr: utr.trim() });
      if (phone) query.push({ phone: phone.trim() });
      if (id) query.push({ operativeId: id.trim().toUpperCase() });
      
      if (query.length > 0) {
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
              photoUrl: member.photoUrl,
              paymentProofUrl: member.paymentProofUrl,
              gender: member.gender,
              forgeRole: member.forgeRole,
              linkedMentor: member.linkedMentor,
              forgeAccess: member.forgeAccess,
              college: member.college
            }
          });
        }
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
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"Innovexa Hub" <${process.env.EMAIL_USER}>`,
          to: member.email,
          subject: 'Innovexa Hub — Dashboard Login Code',
          text: `Your dashboard login code is: ${otp}\n\nThis code is valid for 15 minutes.\n\n— Innovexa Hub\n(Sent via ${process.env.EMAIL_USER})`
        });
        console.log(`Sent OTP to ${member.email}`);
      } catch (err) {
        console.error('Failed to send OTP email:', err);
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
        return res.status(200).json({ success: false, message: 'Registration migration pending.' });
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
        query.assignedTo = invxId.trim().toUpperCase();
      }

      const tasks = await Task.find(query).sort({ timestamp: -1 }).lean();
      return res.status(200).json({ success: true, data: tasks });
    }

    // FORGE: Submit Task
    if (action === 'forge_submit_task') {
      const { invxId, taskId, link } = payload;
      if (!invxId || !taskId || !link) return res.status(200).json({ success: false, message: 'Missing fields.' });
      
      const task = await Task.findOne({ taskId, assignedTo: invxId.trim().toUpperCase() });
      if (!task) return res.status(200).json({ success: false, message: 'Task not found.' });
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
          content: `Operative submitted task ${taskId}`,
          operativeId: member.operativeId,
          name: member.name
        });
        await log.save();
      }
      
      return res.status(200).json({ success: true, message: 'Task submitted successfully.' });
    }

    // FORGE: Get Leaderboard
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
      return res.status(200).json({ success: true, data: sessions });
    }

    return res.status(200).json({ success: false, message: 'Unknown or unmigrated action: ' + action });
    
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
  }
}
