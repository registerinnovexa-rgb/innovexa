// ============================================================
// INNOVEXA HUB — Google Apps Script Backend (Code.gs)
// ============================================================
// SETUP:
// 1. Google Sheet → Extensions → Apps Script → paste this file
// 2. Run setupSheets() ONCE manually to create all 7 tabs
// 3. Deploy → New deployment → Web app
//    Execute as: Me | Who has access: Anyone
// 4. Copy Web App URL → paste in website config
// ============================================================

// ── HARDCODED ADMIN EMAIL ──────────────────────────────────
// Change this to your actual Gmail address that runs this script
const ADMIN_EMAIL = 'register.innovexa@gmail.com';
const CLUB_NAME   = 'Innovexa Hub';
const REG_FEE     = '599';
const PORTAL_URL  = '';  // Optional: your deployed site URL e.g. https://innovexa.netlify.app

const SHEETS = {
  MEMBERS: 'Members', EVENTS: 'Events', RESOURCES: 'Resources',
  ANNOUNCEMENTS: 'Announcements', PROJECTS: 'Projects',
  ATTENDANCE: 'Attendance', PAYMENTS: 'Payments'
};

const HDRS = {
  Members:       ['ID','FullName','Email','Phone','Branch','Year','Role','Status','Skills','Points','PaymentStatus','UTR','CreatedAt'],
  Events:        ['ID','Title','Date','Description','Type','Location','Registered','Attended','CreatedAt'],
  Resources:     ['ID','Title','Link','Category','CreatedAt'],
  Announcements: ['ID','Title','Content','Date','Priority','CreatedBy'],
  Projects:      ['ID','Title','Description','Lead','Members','Status','TechStack','CreatedAt'],
  Attendance:    ['ID','EventID','EventTitle','MemberID','MemberName','Email','RegisteredAt','Attended','AttendedAt'],
  Payments:      ['ID','MemberID','Name','Email','Phone','Branch','Year','Skills','UTR','Amount','Screenshot','PaymentStatus','SubmittedAt','VerifiedAt','RejectedAt','RejectReason','VerifiedBy']
};

// ── EMAIL HELPER ───────────────────────────────────────────
// Uses GmailApp (more reliable than MailApp for HTML emails)
// Falls back to MailApp if GmailApp quota exceeded
function sendMail(to, subject, htmlBody) {
  if (!to || !to.includes('@')) {
    Logger.log('sendMail skipped — invalid address: ' + to);
    return false;
  }
  try {
    GmailApp.sendEmail(to, subject, '', { htmlBody: htmlBody, name: CLUB_NAME });
    Logger.log('Email sent via GmailApp to: ' + to);
    return true;
  } catch (e1) {
    Logger.log('GmailApp failed: ' + e1.message + ' — trying MailApp');
    try {
      MailApp.sendEmail({ to: to, subject: subject, htmlBody: htmlBody, name: CLUB_NAME });
      Logger.log('Email sent via MailApp to: ' + to);
      return true;
    } catch (e2) {
      Logger.log('MailApp also failed: ' + e2.message);
      return false;
    }
  }
}

// Email wrapper styles
function emailWrap(content) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f4f2ff;font-family:'Helvetica Neue',Arial,sans-serif">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2d9f3">
  <div style="background:linear-gradient(135deg,#2d1b69,#5b21b6);padding:24px;text-align:center">
    <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px">${CLUB_NAME}</div>
    <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:3px">University Technology & Innovation Club</div>
  </div>
  <div style="padding:28px 28px 20px">
    ${content}
  </div>
  <div style="background:#f9f8ff;padding:16px 28px;border-top:1px solid #e2d9f3;text-align:center;font-size:11px;color:#9ca3af">
    ${CLUB_NAME} · University Tech Club · This email was sent automatically.
  </div>
</div>
</body></html>`;
}

// ── CORS / JSON ────────────────────────────────────────────
function cors(output) {
  return output.setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function json(obj) {
  return cors(ContentService.createTextOutput(JSON.stringify(obj)));
}

// ── GET ────────────────────────────────────────────────────
function doGet(e) {
  try {
    const p = e.parameter, a = p.action;
    if (a === 'getStats')           return json(getStats());
    if (a === 'getMembers')         return json(getMembers('active'));
    if (a === 'getAllMembers')       return json(getMembers('all'));
    if (a === 'getEvents')          return json({ events: rows(SHEETS.EVENTS) });
    if (a === 'getLeaderboard')     return json(getLeaderboard(p.email));
    if (a === 'getAnnouncements')   return json(getAnnouncements());
    if (a === 'getResources')       return json({ resources: rows(SHEETS.RESOURCES) });
    if (a === 'getProjects')        return json({ projects: rows(SHEETS.PROJECTS) });
    if (a === 'getEventAttendance') return json({ attendance: rows(SHEETS.ATTENDANCE).filter(r => String(r.EventID) === String(p.eventId)) });
    if (a === 'getMyAttendance')    return json({ attendance: rows(SHEETS.ATTENDANCE).filter(r => r.Email === p.email) });
    if (a === 'signin')             return json(signin(p.email, p.mode));
    if (a === 'getPayments')        return json(getPayments(p.status));
    if (a === 'getPaymentConfig')   return json(getPayConfig());
    return json({ error: 'Unknown action: ' + a });
  } catch (err) {
    Logger.log('doGet error: ' + err.message);
    return json({ error: err.message });
  }
}

// ── POST ───────────────────────────────────────────────────
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents), a = d.action;
    if (a === 'registerWithPayment') return json(registerWithPayment(d));
    if (a === 'approvePayment')      return json(approvePayment(d));
    if (a === 'rejectPayment')       return json(rejectPayment(d));
    if (a === 'savePaymentConfig')   return json(savePayConfig(d));
    if (a === 'register')            return json(registerMember(d));
    if (a === 'addMember')           return json(addMember(d));
    if (a === 'updateMemberStatus')  return json(updateStatus(d.id, d.status));
    if (a === 'updateMemberRole')    return json(updateRole(d.id, d.role));
    if (a === 'addEvent')            return json(addEvent(d));
    if (a === 'updateEvent')         return json(updateEvent(d));
    if (a === 'deleteEvent')         return json(delRow(SHEETS.EVENTS, d.id));
    if (a === 'registerEvent')       return json(regEvent(d));
    if (a === 'markAttendance')      return json(markAtt(d));
    if (a === 'addAnnouncement')     return json(addAnn(d));
    if (a === 'updateAnnouncement')  return json(updAnn(d));
    if (a === 'deleteAnnouncement')  return json(delRow(SHEETS.ANNOUNCEMENTS, d.id));
    if (a === 'addResource')         return json(addRes(d));
    if (a === 'updateResource')      return json(updRes(d));
    if (a === 'deleteResource')      return json(delRow(SHEETS.RESOURCES, d.id));
    if (a === 'addProject')          return json(addProj(d));
    if (a === 'updateProject')       return json(updProj(d));
    if (a === 'deleteProject')       return json(delRow(SHEETS.PROJECTS, d.id));
    return json({ error: 'Unknown action: ' + a });
  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return json({ error: err.message });
  }
}

// ── SHEET HELPERS ──────────────────────────────────────────
function sh(n) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(n);
  if (!s) {
    s = ss.insertSheet(n);
    if (HDRS[n]) {
      s.getRange(1, 1, 1, HDRS[n].length)
        .setValues([HDRS[n]])
        .setFontWeight('bold')
        .setBackground('#ede9fe');
      s.setFrozenRows(1);
    }
  }
  return s;
}
function rows(n) {
  const d = sh(n).getDataRange().getValues();
  if (d.length < 2) return [];
  const h = d[0];
  return d.slice(1).map(r => {
    const o = {};
    h.forEach((k, i) => o[k] = r[i] !== undefined ? r[i] : '');
    return o;
  });
}
function uid(p) { return p + '-' + Date.now().toString(36).toUpperCase(); }
function rowOf(s, id) {
  const d = s.getDataRange().getValues();
  for (let i = 1; i < d.length; i++) if (String(d[i][0]) === String(id)) return i + 1;
  return -1;
}
function delRow(n, id) {
  const s = sh(n), r = rowOf(s, id);
  if (r > 0) s.deleteRow(r);
  return { success: true };
}

// ── PAYMENT CONFIG ─────────────────────────────────────────
function savePayConfig(d) {
  PropertiesService.getScriptProperties().setProperties({
    pay_upi: d.upiId || '', pay_name: d.name || CLUB_NAME, pay_fee: String(d.fee || REG_FEE)
  });
  return { success: true };
}
function getPayConfig() {
  const p = PropertiesService.getScriptProperties();
  return {
    upiId: p.getProperty('pay_upi') || '9445253099@okbizaxis',
    name:  p.getProperty('pay_name') || CLUB_NAME,
    fee:   p.getProperty('pay_fee')  || REG_FEE
  };
}

// ── REGISTER WITH PAYMENT ──────────────────────────────────
function registerWithPayment(d) {
  const s = sh(SHEETS.PAYMENTS);
  const existing = rows(SHEETS.PAYMENTS);
  const fee = getPayConfig().fee || REG_FEE;

  // Duplicate email check
  if (existing.find(r =>
    r.Email.toLowerCase() === (d.email || '').toLowerCase() &&
    r.PaymentStatus !== 'rejected'
  )) {
    return { success: false, message: 'An application with this email already exists.' };
  }

  // Duplicate UTR check
  if (d.utr && existing.find(r =>
    r.UTR === d.utr && r.PaymentStatus !== 'rejected'
  )) {
    return { success: false, message: 'This UTR has already been submitted. Contact admin if this is an error.' };
  }

  const payId = uid('PAY');
  // Store screenshot — truncated to avoid sheet cell limit
  const ss = (d.screenshot || '').substring(0, 4000);
  s.appendRow([
    payId, '', d.name || '', d.email || '', d.phone || '', d.branch || '',
    d.year || '', d.skills || '', d.utr || '', fee, ss,
    'pending_verification', new Date().toISOString(), '', '', '', ''
  ]);

  // ── Email to ADMIN ────────────────────────────────────────
  const adminBody = emailWrap(`
    <h2 style="font-size:20px;color:#1a1a2e;margin:0 0 8px">💰 New Payment Application</h2>
    <p style="font-size:13px;color:#6b6682;margin:0 0 20px">A student has submitted a annual membership payment for verification.</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#f4f2ff"><td style="padding:10px 14px;color:#6b6682;width:40%;font-weight:600">Name</td><td style="padding:10px 14px;font-weight:500">${d.name}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b6682;font-weight:600">Email</td><td style="padding:10px 14px">${d.email}</td></tr>
      <tr style="background:#f4f2ff"><td style="padding:10px 14px;color:#6b6682;font-weight:600">Phone</td><td style="padding:10px 14px">${d.phone || '—'}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b6682;font-weight:600">Branch</td><td style="padding:10px 14px">${d.branch} · ${d.year}</td></tr>
      <tr style="background:#f4f2ff"><td style="padding:10px 14px;color:#6b6682;font-weight:600">UTR Number</td><td style="padding:10px 14px;font-family:monospace;font-size:14px;color:#5b21b6;font-weight:700">${d.utr}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b6682;font-weight:600">Amount</td><td style="padding:10px 14px;font-weight:700;color:#059669;font-size:15px">₹${fee}</td></tr>
      <tr style="background:#f4f2ff"><td style="padding:10px 14px;color:#6b6682;font-weight:600">Screenshot</td><td style="padding:10px 14px">${d.screenshot ? '✅ Uploaded' : '❌ Not uploaded'}</td></tr>
      <tr><td style="padding:10px 14px;color:#6b6682;font-weight:600">Payment ID</td><td style="padding:10px 14px;font-family:monospace;font-size:11px;color:#9ca3af">${payId}</td></tr>
    </table>
    <div style="margin-top:20px;padding:14px;background:#fef3c7;border-radius:9px;border:1px solid #fde68a">
      <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:4px">⚠️ Action required</div>
      <div style="font-size:12px;color:#78350f">Verify the UTR <strong>${d.utr}</strong> in your UPI app, then open the admin panel → Payments to approve or reject.</div>
    </div>
  `);
  const adminSent = sendMail(ADMIN_EMAIL, `💰 New payment application: ${d.name} — ₹${fee}`, adminBody);
  Logger.log('Admin notification sent: ' + adminSent);

  // ── Acknowledgement email to STUDENT ─────────────────────
  const studentBody = emailWrap(`
    <h2 style="font-size:20px;color:#1a1a2e;margin:0 0 8px">Application Received! 🎉</h2>
    <p style="font-size:14px;color:#1a1a2e;margin:0 0 6px">Hi <strong>${d.name}</strong>,</p>
    <p style="font-size:13px;color:#6b6682;line-height:1.7;margin:0 0 20px">
      We've received your <strong>annual membership</strong> application for <strong>${CLUB_NAME}</strong>. Our admin will verify your payment and get back to you within <strong>24–48 hours</strong>.
    </p>
    <div style="background:#f4f2ff;border-radius:10px;padding:18px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;color:#6b6682;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">Your Application Summary</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#6b6682;width:40%">Application ID</td><td style="font-family:monospace;color:#5b21b6;font-weight:700">${payId}</td></tr>
        <tr><td style="padding:6px 0;color:#6b6682">Branch</td><td>${d.branch} · ${d.year}</td></tr>
        <tr><td style="padding:6px 0;color:#6b6682">UTR Submitted</td><td style="font-family:monospace;font-weight:600;color:#5b21b6">${d.utr}</td></tr>
        <tr><td style="padding:6px 0;color:#6b6682">Amount</td><td style="font-weight:700;color:#059669">₹${fee}</td></tr>
        <tr><td style="padding:6px 0;color:#6b6682">Status</td><td><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">Pending Verification</span></td></tr>
      </table>
    </div>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:9px;padding:14px;margin-bottom:20px">
      <div style="font-size:12px;color:#14532d;line-height:1.65">
        <strong>What happens next?</strong><br>
        1. Our admin verifies your UTR in the UPI app<br>
        2. You receive an approval email with your Member ID<br>
        3. Sign in to the portal to access your digital ID card
      </div>
    </div>
    <p style="font-size:12px;color:#9ca3af;">If you have any questions, reply to this email.</p>
  `);
  const studentSent = sendMail(d.email, `Application received — ${CLUB_NAME}`, studentBody);
  Logger.log('Student acknowledgement sent to ' + d.email + ': ' + studentSent);

  return { success: true, paymentId: payId, emailSent: studentSent };
}

// ── GET PAYMENTS ───────────────────────────────────────────
function getPayments(status) {
  let data = rows(SHEETS.PAYMENTS);
  if (status && status !== 'all') data = data.filter(p => p.PaymentStatus === status);
  return {
    payments: data.map(p => ({
      id: p.ID, name: p.Name, email: p.Email, phone: p.Phone,
      branch: p.Branch, year: p.Year, skills: p.Skills,
      utr: p.UTR, amount: p.Amount, screenshot: p.Screenshot,
      paymentStatus: p.PaymentStatus, submittedAt: p.SubmittedAt,
      verifiedAt: p.VerifiedAt, rejectedAt: p.RejectedAt,
      rejectReason: p.RejectReason
    })).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
  };
}

// ── APPROVE PAYMENT ────────────────────────────────────────
function approvePayment(d) {
  const paySheet = sh(SHEETS.PAYMENTS);
  const payRow = rowOf(paySheet, d.paymentId);
  if (payRow < 0) return { success: false, message: 'Payment record not found' };

  const colMap = {};
  HDRS.Payments.forEach((h, i) => colMap[h] = i + 1);
  const now = new Date().toISOString();

  // Update payment status
  paySheet.getRange(payRow, colMap['PaymentStatus']).setValue('verified');
  paySheet.getRange(payRow, colMap['VerifiedAt']).setValue(now);
  paySheet.getRange(payRow, colMap['VerifiedBy']).setValue(d.verifiedBy || 'Admin');

  // Get payment data for email
  const rowVals = paySheet.getRange(payRow, 1, 1, HDRS.Payments.length).getValues()[0];
  const pName   = rowVals[colMap['Name'] - 1];
  const pEmail  = rowVals[colMap['Email'] - 1];
  const pBranch = rowVals[colMap['Branch'] - 1];
  const pYear   = rowVals[colMap['Year'] - 1];
  const pPhone  = rowVals[colMap['Phone'] - 1];
  const pSkills = rowVals[colMap['Skills'] - 1];
  const pUTR    = rowVals[colMap['UTR'] - 1];
  const pAmount = rowVals[colMap['Amount'] - 1];

  // Create or update member record
  const memSheet = sh(SHEETS.MEMBERS);
  const members  = rows(SHEETS.MEMBERS);
  const existing = members.find(m => m.Email.toLowerCase() === (pEmail || '').toLowerCase());
  let memberId;

  if (existing) {
    const mr = rowOf(memSheet, existing.ID);
    memSheet.getRange(mr, 8).setValue('active');
    memSheet.getRange(mr, 11).setValue('paid');
    memSheet.getRange(mr, 12).setValue(pUTR || '');
    memberId = existing.ID;
  } else {
    memberId = 'IH-' + String(members.length + 1).padStart(4, '0');
    memSheet.appendRow([memberId, pName, pEmail, pPhone || '', pBranch, pYear, 'member', 'active', pSkills || '', 10, 'paid', pUTR || '', now]);
  }
  paySheet.getRange(payRow, colMap['MemberID']).setValue(memberId);

  // ── Approval email to STUDENT ──────────────────────────
  const approvalBody = emailWrap(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:64px;height:64px;background:#d1fae5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px">✅</div>
      <h1 style="font-size:22px;font-weight:800;color:#1a1a2e;margin:0 0 6px;letter-spacing:-0.5px">Welcome to ${CLUB_NAME}!</h1>
      <p style="font-size:13px;color:#6b6682;margin:0">Your membership is now active</p>
    </div>
    <p style="font-size:14px;color:#1a1a2e;margin:0 0 8px">Hi <strong>${pName}</strong>,</p>
    <p style="font-size:13px;color:#6b6682;line-height:1.7;margin:0 0 20px">
      Great news! Your payment of <strong style="color:#059669">₹${pAmount || REG_FEE}</strong>
      (UTR: <code style="background:#f4f2ff;padding:2px 7px;border-radius:4px;color:#5b21b6;font-size:12px">${pUTR}</code>)
      has been successfully verified. Your annual membership is now <strong>active</strong> until <strong>May 2026</strong>!
    </p>
    <div style="background:#f4f2ff;border-radius:12px;padding:20px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;color:#6b6682;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:14px">Your Member Details</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        <tr><td style="padding:7px 0;color:#6b6682;width:40%">Member ID</td><td style="font-weight:800;color:#5b21b6;font-size:15px">${memberId}</td></tr>
        <tr><td style="padding:7px 0;color:#6b6682">Full Name</td><td style="font-weight:500">${pName}</td></tr>
        <tr><td style="padding:7px 0;color:#6b6682">Branch</td><td>${pBranch} · ${pYear}</td></tr>
        <tr><td style="padding:7px 0;color:#6b6682">Payment</td><td style="color:#059669;font-weight:600">₹${pAmount || REG_FEE} · Verified</td></tr>
      </table>
    </div>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;color:#14532d;margin-bottom:8px">🎯 What you can do now</div>
      <div style="font-size:12px;color:#166534;line-height:1.75">
        ✅ Download your digital ID card<br>
        ✅ Register for club events<br>
        ✅ Generate membership certificates<br>
        ✅ Create permission letters<br>
        ✅ Earn points & climb the leaderboard
      </div>
    </div>
    ${PORTAL_URL ? `<div style="text-align:center;margin-top:8px"><a href="${PORTAL_URL}/portal.html" style="background:#5b21b6;color:white;padding:12px 28px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">Access Member Portal →</a></div>` : '<p style="font-size:13px;color:#6b6682;text-align:center">Sign in to the Member Portal with your email to get started.</p>'}
  `);
  const approvalSent = sendMail(pEmail, `🎉 Welcome to ${CLUB_NAME}! Membership Activated — ID: ${memberId}`, approvalBody);
  Logger.log('Approval email sent to ' + pEmail + ': ' + approvalSent);

  return { success: true, memberId, emailSent: approvalSent };
}

// ── REJECT PAYMENT ─────────────────────────────────────────
function rejectPayment(d) {
  const paySheet = sh(SHEETS.PAYMENTS);
  const payRow   = rowOf(paySheet, d.paymentId);
  if (payRow < 0) return { success: false, message: 'Payment not found' };

  const colMap = {};
  HDRS.Payments.forEach((h, i) => colMap[h] = i + 1);
  const now = new Date().toISOString();

  paySheet.getRange(payRow, colMap['PaymentStatus']).setValue('rejected');
  paySheet.getRange(payRow, colMap['RejectedAt']).setValue(now);
  paySheet.getRange(payRow, colMap['RejectReason']).setValue(d.reason || 'Invalid UTR');

  // ── Rejection email to STUDENT ─────────────────────────
  const rejBody = emailWrap(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:64px;height:64px;background:#ffe4e6;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px">❌</div>
      <h1 style="font-size:20px;font-weight:800;color:#1a1a2e;margin:0 0 6px">Payment Not Verified</h1>
      <p style="font-size:13px;color:#6b6682;margin:0">Innovexa Hub Registration</p>
    </div>
    <p style="font-size:14px;color:#1a1a2e;margin:0 0 8px">Hi <strong>${d.name}</strong>,</p>
    <p style="font-size:13px;color:#6b6682;line-height:1.7;margin:0 0 18px">
      We were unable to verify your payment for ${CLUB_NAME} membership. Please review the reason below.
    </p>
    <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:18px">
      <div style="font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Reason for rejection</div>
      <div style="font-size:13px;color:#7f1d1d;font-weight:500">${d.reason || 'Invalid UTR number'}</div>
    </div>
    <div style="background:#f4f2ff;border-radius:10px;padding:16px;margin-bottom:18px">
      <div style="font-size:12px;font-weight:700;color:#3b0764;margin-bottom:8px">📋 What to do next</div>
      <div style="font-size:12px;color:#4c1d95;line-height:1.75">
        1. Check your UTR in GPay / PhonePe / bank SMS<br>
        2. Make sure you paid exactly <strong>₹${REG_FEE}</strong><br>
        3. Re-submit your application with the correct UTR<br>
        4. Contact us if you need help
      </div>
    </div>
    <p style="font-size:12px;color:#9ca3af;">Reply to this email if you believe this is an error or need assistance.</p>
  `);
  const rejSent = sendMail(d.email, `${CLUB_NAME} — Payment Verification Update`, rejBody);
  Logger.log('Rejection email sent to ' + d.email + ': ' + rejSent);

  return { success: true, emailSent: rejSent };
}

// ── AUTH ───────────────────────────────────────────────────
function signin(email, mode) {
  const m = rows(SHEETS.MEMBERS).find(r => r.Email.toLowerCase() === (email || '').toLowerCase());
  if (!m)                                   return { success: false, message: 'Email not registered. Apply to join first.' };
  if (m.Status === 'pending')               return { success: false, message: 'Your application is pending payment verification.' };
  if (m.Status === 'rejected')              return { success: false, message: 'Your application was rejected. Contact admin.' };
  if (mode === 'admin' && m.Role !== 'admin') return { success: false, message: 'No admin access for this account.' };
  return { success: true, member: m };
}

// ── STATS ──────────────────────────────────────────────────
function getStats() {
  const mems = rows(SHEETS.MEMBERS), evs = rows(SHEETS.EVENTS), pays = rows(SHEETS.PAYMENTS);
  return {
    members:         mems.filter(m => m.Status === 'active').length,
    total:           mems.length,
    events:          evs.length,
    upcomingEvents:  evs.filter(e => new Date(e.Date) >= new Date()).length,
    pendingPayments: pays.filter(p => p.PaymentStatus === 'pending_verification').length
  };
}

// ── MEMBERS ────────────────────────────────────────────────
function getMembers(f) {
  let m = rows(SHEETS.MEMBERS);
  if (f === 'active') m = m.filter(r => r.Status === 'active');
  return { members: m };
}
function registerMember(d) {
  const s = sh(SHEETS.MEMBERS), m = rows(SHEETS.MEMBERS);
  if (m.find(r => r.Email.toLowerCase() === (d.email || '').toLowerCase()))
    return { success: false, message: 'Email already registered.' };
  const id = 'IH-' + String(m.length + 1).padStart(4, '0');
  s.appendRow([id, d.name, d.email, d.phone || '', d.branch, d.year, 'member', 'pending', d.skills || '', 10, 'unpaid', '', new Date().toISOString()]);
  return { success: true };
}
function addMember(d) {
  const s = sh(SHEETS.MEMBERS), m = rows(SHEETS.MEMBERS);
  const id = d.id || ('IH-' + String(m.length + 1).padStart(4, '0'));
  s.appendRow([id, d.name, d.email, d.phone || '', d.branch, d.year, d.role || 'member', d.status || 'active', d.skills || '', 10, d.paymentStatus || 'paid', d.utr || '', new Date().toISOString()]);
  return { success: true, id };
}
function updateStatus(id, status) {
  const s = sh(SHEETS.MEMBERS), r = rowOf(s, id);
  if (r < 0) return { success: false };
  s.getRange(r, 8).setValue(status);
  if (status === 'active') {
    const row = s.getRange(r, 1, 1, 13).getValues()[0];
    sendMail(row[2], `Welcome to ${CLUB_NAME}! 🎉`,
      emailWrap(`<p style="font-size:14px;color:#1a1a2e">Hi <strong>${row[1]}</strong>,</p><p style="font-size:13px;color:#6b6682;line-height:1.7;">Your annual membership is now <strong>active</strong> until <strong>May 2026</strong>! Sign in to the portal with your email to access your digital ID card, events, and more.</p>`));
  }
  return { success: true };
}
function updateRole(id, role) {
  const s = sh(SHEETS.MEMBERS), r = rowOf(s, id);
  if (r < 0) return { success: false };
  s.getRange(r, 7).setValue(role);
  return { success: true };
}

// ── EVENTS ─────────────────────────────────────────────────
function addEvent(d) {
  const s = sh(SHEETS.EVENTS), id = d.id || uid('EV');
  s.appendRow([id, d.title, d.date, d.description || '', d.type || 'Workshop', d.location || '', 0, 0, new Date().toISOString()]);
  return { success: true, id };
}
function updateEvent(d) {
  const s = sh(SHEETS.EVENTS), r = rowOf(s, d.id);
  if (r < 0) return { success: false };
  s.getRange(r, 2, 1, 6).setValues([[d.title, d.date, d.description || '', d.type || 'Workshop', d.location || '', s.getRange(r, 7).getValue()]]);
  return { success: true };
}
function regEvent(d) {
  const s = sh(SHEETS.ATTENDANCE);
  if (rows(SHEETS.ATTENDANCE).find(r => r.EventID === d.eventId && r.MemberID === d.memberId))
    return { success: false, message: 'Already registered' };
  s.appendRow([uid('ATT'), d.eventId, d.eventTitle, d.memberId, d.memberName, d.memberEmail, new Date().toISOString(), false, '']);
  const es = sh(SHEETS.EVENTS), er = rowOf(es, d.eventId);
  if (er > 0) { const c = es.getRange(er, 7).getValue() || 0; es.getRange(er, 7).setValue(Number(c) + 1); }
  return { success: true };
}
function markAtt(d) {
  const s = sh(SHEETS.ATTENDANCE), rs = rows(SHEETS.ATTENDANCE);
  const idx = rs.findIndex(r => r.EventID === d.eventId && (r.MemberID === d.memberId || r.Email === d.memberEmail));
  if (idx >= 0) { s.getRange(idx + 2, 8).setValue(true); s.getRange(idx + 2, 9).setValue(new Date().toISOString()); }
  else s.appendRow([uid('ATT'), d.eventId, d.eventTitle, d.memberId, d.memberName, d.memberEmail, new Date().toISOString(), true, new Date().toISOString()]);
  const es = sh(SHEETS.EVENTS), er = rowOf(es, d.eventId);
  if (er > 0) { const c = es.getRange(er, 8).getValue() || 0; es.getRange(er, 8).setValue(Number(c) + 1); }
  addPts(d.memberEmail, 5);
  return { success: true };
}
function addPts(email, pts) {
  const s = sh(SHEETS.MEMBERS), d = s.getDataRange().getValues();
  for (let i = 1; i < d.length; i++) {
    if (d[i][2] === email) { s.getRange(i + 1, 10).setValue((Number(d[i][9]) || 10) + pts); break; }
  }
}

// ── LEADERBOARD ────────────────────────────────────────────
function getLeaderboard(email) {
  const m = rows(SHEETS.MEMBERS).filter(r => r.Status === 'active').sort((a, b) => (Number(b.Points) || 0) - (Number(a.Points) || 0));
  const lb = m.map(r => ({ MemberName: r.FullName, Branch: r.Branch, Points: Number(r.Points) || 10, Email: r.Email }));
  const idx = lb.findIndex(r => r.Email === email);
  return { leaderboard: lb, myPoints: idx >= 0 ? lb[idx].Points : 10, myRank: idx >= 0 ? idx + 1 : '—' };
}

// ── ANNOUNCEMENTS ──────────────────────────────────────────
function getAnnouncements() {
  const ps = { High: 3, Medium: 2, Low: 1 };
  return { announcements: rows(SHEETS.ANNOUNCEMENTS).sort((a, b) => (ps[b.Priority] || 1) - (ps[a.Priority] || 1)) };
}
function addAnn(d) { sh(SHEETS.ANNOUNCEMENTS).appendRow([d.id || uid('ANN'), d.title, d.content || '', d.date || new Date().toISOString(), d.priority || 'Medium', d.createdBy || 'Admin']); return { success: true }; }
function updAnn(d) { const s = sh(SHEETS.ANNOUNCEMENTS), r = rowOf(s, d.id); if (r < 0) return { success: false }; s.getRange(r, 2, 1, 4).setValues([[d.title, d.content || '', d.date || new Date().toISOString(), d.priority || 'Medium']]); return { success: true }; }

// ── RESOURCES ──────────────────────────────────────────────
function addRes(d) { sh(SHEETS.RESOURCES).appendRow([d.id || uid('RES'), d.title, d.link || '', d.category || 'General', new Date().toISOString()]); return { success: true }; }
function updRes(d) { const s = sh(SHEETS.RESOURCES), r = rowOf(s, d.id); if (r < 0) return { success: false }; s.getRange(r, 2, 1, 3).setValues([[d.title, d.link || '', d.category || 'General']]); return { success: true }; }

// ── PROJECTS ───────────────────────────────────────────────
function addProj(d) { sh(SHEETS.PROJECTS).appendRow([d.id || uid('PROJ'), d.title, d.description || '', d.lead || '', d.members || '', d.status || 'Active', d.techStack || '', new Date().toISOString()]); return { success: true }; }
function updProj(d) { const s = sh(SHEETS.PROJECTS), r = rowOf(s, d.id); if (r < 0) return { success: false }; s.getRange(r, 2, 1, 6).setValues([[d.title, d.description || '', d.lead || '', d.members || '', d.status || 'Active', d.techStack || '']]); return { success: true }; }

// ── TEST FUNCTION (run manually to verify email works) ──────
function testEmail() {
  const result = sendMail(
    ADMIN_EMAIL,
    '✅ Innovexa Hub — Email Test',
    emailWrap(`
      <h2 style="color:#059669;font-size:20px;margin:0 0 12px">Email is working! ✅</h2>
      <p style="font-size:13px;color:#6b6682;line-height:1.7;">
        This is a test email from your Innovexa Hub Google Apps Script.<br>
        If you're seeing this, emails will be sent correctly for:
      </p>
      <ul style="font-size:13px;color:#6b6682;line-height:1.9;margin:12px 0 0 18px">
        <li>New payment application notifications (to admin)</li>
        <li>Application received acknowledgements (to student)</li>
        <li>Approval emails with Member ID (to student)</li>
        <li>Rejection emails with reason (to student)</li>
      </ul>
    `)
  );
  Logger.log('Test email result: ' + result);
  SpreadsheetApp.getUi().alert(result ? '✅ Email sent successfully to ' + ADMIN_EMAIL : '❌ Email failed — check Execution log for details');
}

// ── SETUP (run once manually) ──────────────────────────────
function setupSheets() {
  Object.keys(HDRS).forEach(name => {
    const s = sh(name);
    s.getRange(1, 1, 1, HDRS[name].length)
      .setValues([HDRS[name]])
      .setFontWeight('bold')
      .setBackground('#ede9fe');
    s.setFrozenRows(1);
  });

  // Seed admin member
  if (rows(SHEETS.MEMBERS).length === 0) {
    sh(SHEETS.MEMBERS).appendRow([
      'IH-0001', 'Innovexa Admin', ADMIN_EMAIL, '', 'CSE', '4th Year',
      'admin', 'active', 'Leadership,Management', 100, 'paid', 'ADMIN001', new Date().toISOString()
    ]);
  }

  // Default pay config
  PropertiesService.getScriptProperties().setProperties({
    pay_upi: '9445253099@okbizaxis', pay_name: CLUB_NAME, pay_fee: REG_FEE
  });

  SpreadsheetApp.getUi().alert(
    '✅ Innovexa Hub setup complete!\n\n' +
    '7 sheets created:\n• Members\n• Events\n• Resources\n• Announcements\n• Projects\n• Attendance\n• Payments\n\n' +
    'Admin email set to: ' + ADMIN_EMAIL + '\n\n' +
    'Run testEmail() to verify emails are working.\n' +
    'Then deploy the web app to connect the website.'
  );
}
