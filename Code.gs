// Innovexa Hub — Google Apps Script Backend
// Sheet1 columns: A:Timestamp B:Name C:Email D:Phone E:Year F:Branch G:SkillLevel H:DOB I:Interests J:UTR K:Status L:Amount M:Operative_id N:PhotoURL O:PaymentProofURL

var ADMIN_KEY   = 'innovexa_admin_2025';
var SHEET_NAME  = 'Sheet1';

/* ═══════════════════════════════════════════════════════════
   CORS HELPERS
   ═══════════════════════════════════════════════════════════ */
function createJsonResponse(success, message, data) {
  var payload = { success: success, message: message };
  if (data !== undefined) payload.data = data;
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

/* ═══════════════════════════════════════════════════════════
   ROW → OBJECT
   ═══════════════════════════════════════════════════════════ */
function rowToMember(row) {
  return {
    timestamp:      row[0]  ? row[0].toString()  : '',
    name:           row[1]  ? row[1].toString().trim()  : '',
    email:          row[2]  ? row[2].toString().trim()  : '',
    phone:          row[3]  ? row[3].toString().trim()  : '',
    year:           row[4]  ? row[4].toString().trim()  : '',
    branch:         row[5]  ? row[5].toString().trim()  : '',
    skillLevel:     row[6]  ? row[6].toString().trim()  : '',
    dob:            row[7]  ? row[7].toString().trim()  : '',
    interests:      row[8]  ? row[8].toString().trim()  : '',
    utr:            row[9]  ? row[9].toString().trim()  : '',
    status:         row[10] ? row[10].toString().trim() : 'Pending',
    amount:         row[11] ? row[11].toString().trim() : '',
    operativeId:    row[12] ? row[12].toString().trim() : '',
    photoUrl:       row[13] ? row[13].toString().trim() : '',
    paymentProofUrl:row[14] ? row[14].toString().trim() : ''
  };
}

/* ═══════════════════════════════════════════════════════════
   doGet — Handle all GET requests
   ═══════════════════════════════════════════════════════════ */
function doGet(e) {
  try {
    var ss     = SpreadsheetApp.getActiveSpreadsheet();
    var sheet  = ss.getSheetByName(SHEET_NAME);
    var params = e ? (e.parameter || {}) : {};
    var action = (params.action || '').toString().trim().toLowerCase();

    // ── Member count ──────────────────────────────────────
    if (!action || action === 'count') {
      var lastRow = sheet.getLastRow();
      var count   = Math.max(0, lastRow - 1); // subtract header row
      return createJsonResponse(true, 'Count fetched.', { count: count });
    }

    // ── Status check by email ─────────────────────────────
    if (params.email) {
      var emailQuery = params.email.toString().trim().toLowerCase();
      var allData    = sheet.getDataRange().getValues();
      for (var i = 1; i < allData.length; i++) {
        if ((allData[i][2] || '').toString().trim().toLowerCase() === emailQuery) {
          return createJsonResponse(true, 'Member found.', rowToMember(allData[i]));
        }
      }
      return createJsonResponse(false, 'No member found with that email.', null);
    }

    // ── Status check by UTR ───────────────────────────────
    if (params.utr) {
      var utrQuery = params.utr.toString().trim();
      var allData2 = sheet.getDataRange().getValues();
      for (var j = 1; j < allData2.length; j++) {
        if ((allData2[j][9] || '').toString().trim() === utrQuery) {
          return createJsonResponse(true, 'Member found.', rowToMember(allData2[j]));
        }
      }
      return createJsonResponse(false, 'No member found with that UTR.', null);
    }

    // ── Profile by Operative ID ───────────────────────────
    if (action === 'profile') {
      var opId    = (params.id || '').toString().trim().toUpperCase();
      var allData3 = sheet.getDataRange().getValues();
      for (var k = 1; k < allData3.length; k++) {
        if ((allData3[k][12] || '').toString().trim().toUpperCase() === opId) {
          return createJsonResponse(true, 'Profile found.', rowToMember(allData3[k]));
        }
      }
      return createJsonResponse(false, 'Operative ID not found.', null);
    }

    // ── Admin: all members ────────────────────────────────
    if (action === 'adminmembers') {
      if ((params.key || '') !== ADMIN_KEY) return createJsonResponse(false, 'Unauthorized.', null);
      var allData4 = sheet.getDataRange().getValues();
      var members  = [];
      for (var m = 1; m < allData4.length; m++) {
        var member = rowToMember(allData4[m]);
        member.rowIndex = m + 1;
        members.push(member);
      }
      return createJsonResponse(true, 'Members fetched.', { members: members, total: members.length });
    }

    // ── Events (Sheet2) ───────────────────────────────────
    if (action === 'events') {
      var sheet2  = ss.getSheetByName('Sheet2');
      if (!sheet2) return createJsonResponse(true, 'Events sheet not found.', { events: [] });
      var eData   = sheet2.getDataRange().getValues();
      var events  = [];
      for (var ev = 1; ev < eData.length; ev++) {
        events.push({ name: eData[ev][0], date: eData[ev][1], category: eData[ev][2], description: eData[ev][3], status: eData[ev][4] });
      }
      return createJsonResponse(true, 'Events fetched.', { events: events });
    }

    // ── Resources (Sheet3) ────────────────────────────────
    if (action === 'resources') {
      var sheet3 = ss.getSheetByName('Sheet3');
      if (!sheet3) return createJsonResponse(true, 'Resources sheet not found.', { resources: [] });
      var rData  = sheet3.getDataRange().getValues();
      var resources = [];
      for (var r = 1; r < rData.length; r++) {
        resources.push({ category: rData[r][0], title: rData[r][1], type: rData[r][2], link: rData[r][3], description: rData[r][4], level: rData[r][5] });
      }
      return createJsonResponse(true, 'Resources fetched.', { resources: resources });
    }

    // ── Team (Sheet4) ─────────────────────────────────────
    if (action === 'team') {
      var sheet4 = ss.getSheetByName('Sheet4');
      if (!sheet4) return createJsonResponse(true, 'Team sheet not found.', { team: [] });
      var tData  = sheet4.getDataRange().getValues();
      var team   = [];
      for (var t = 1; t < tData.length; t++) {
        team.push({ name: tData[t][0], role: tData[t][1], linkedin: tData[t][2], github: tData[t][3], bio: tData[t][4], avatar: tData[t][5] });
      }
      return createJsonResponse(true, 'Team fetched.', { team: team });
    }

    return createJsonResponse(false, 'Unknown action: ' + action, null);

  } catch (err) {
    Logger.log('doGet Error: ' + err.toString());
    return createJsonResponse(false, 'Server error: ' + err.toString(), null);
  }
}

/* ═══════════════════════════════════════════════════════════
   doPost — Handle all POST requests
   ═══════════════════════════════════════════════════════════ */
function doPost(e) {
  try {
    var body    = e.postData ? e.postData.contents : '{}';
    var data    = JSON.parse(body);
    var action  = (data.action || 'register').toString().trim().toLowerCase();
    var ss      = SpreadsheetApp.getActiveSpreadsheet();
    var sheet   = ss.getSheetByName(SHEET_NAME);

    // ── REGISTER ──────────────────────────────────────────
    if (action === 'register') {
      var fullName = (data.fullName || '').toString().trim();
      var email    = (data.email    || '').toString().trim();
      var phone    = (data.phone    || '').toString().trim();
      var utr      = (data.utr      || '').toString().trim();

      // Validate required fields
      if (!fullName) return createJsonResponse(false, 'Full name is required.', null);
      if (!email)    return createJsonResponse(false, 'Email is required.', null);
      if (!utr)      return createJsonResponse(false, 'UTR is required.', null);

      // Check duplicate email
      var allData = sheet.getDataRange().getValues();
      for (var i = 1; i < allData.length; i++) {
        if ((allData[i][2] || '').toString().trim().toLowerCase() === email.toLowerCase()) {
          return createJsonResponse(false, 'This email is already registered.', null);
        }
      }

      // Check duplicate UTR
      for (var j = 1; j < allData.length; j++) {
        if ((allData[j][9] || '').toString().trim() === utr) {
          return createJsonResponse(false, 'This UTR has already been submitted.', null);
        }
      }

      // Generate Operative ID
      var lastRow     = sheet.getLastRow();
      var nextNum     = lastRow; // header is row 1, first member is row 2 → nextNum = 1
      var operativeId = 'INVX-' + String(nextNum).padStart(3, '0');

      // Build timestamp (IST)
      var timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      // Append row — must match sheet columns A→O exactly
      sheet.appendRow([
        timestamp,                               // A: Timestamp
        fullName,                                // B: Name
        email,                                   // C: Email
        phone,                                   // D: Phone
        data.year        || '',                  // E: Year
        data.branch      || '',                  // F: Branch
        data.skillLevel  || '',                  // G: SkillLevel
        data.dob         || '',                  // H: DOB
        data.interests   || '',                  // I: Interests
        utr,                                     // J: UTR
        'Pending',                               // K: Status
        data.amount      || '599',               // L: Amount
        operativeId,                             // M: Operative_id
        data.photoUrl    || '',                  // N: PhotoURL
        data.paymentUrl  || data.paymentProofUrl || '' // O: PaymentProofURL
      ]);

      // Send confirmation email
      try { sendConfirmationEmail(email, fullName, operativeId); } catch (mailErr) { Logger.log('Mail error: ' + mailErr); }

      return createJsonResponse(true, 'Registration successful!', { operativeId: operativeId });
    }

    // ── ADMIN WRITE ───────────────────────────────────────
    if (action === 'adminwrite') {
      if ((data.key || '') !== ADMIN_KEY) return createJsonResponse(false, 'Unauthorized.', null);
      var subAction  = (data.subAction || '').toString().trim().toLowerCase();
      var opIdTarget = (data.operativeId || '').toString().trim().toUpperCase();

      var allRows = sheet.getDataRange().getValues();

      if (subAction === 'updatestatus') {
        var newStatus = (data.status || 'Pending').toString().trim();
        for (var r = 1; r < allRows.length; r++) {
          if ((allRows[r][12] || '').toString().trim().toUpperCase() === opIdTarget) {
            sheet.getRange(r + 1, 11).setValue(newStatus); // col K = index 10, col 11
            return createJsonResponse(true, 'Status updated to ' + newStatus, null);
          }
        }
        return createJsonResponse(false, 'Operative ID not found.', null);
      }

      if (subAction === 'deleterow') {
        for (var d = 1; d < allRows.length; d++) {
          if ((allRows[d][12] || '').toString().trim().toUpperCase() === opIdTarget) {
            sheet.deleteRow(d + 1);
            return createJsonResponse(true, 'Row deleted.', null);
          }
        }
        return createJsonResponse(false, 'Operative ID not found.', null);
      }

      return createJsonResponse(false, 'Unknown subAction: ' + subAction, null);
    }

    // ── CREATE EVENT (Sheet2) ─────────────────────────────
    if (action === 'createevent') {
      if ((data.key || '') !== ADMIN_KEY) return createJsonResponse(false, 'Unauthorized.', null);
      var sheet2ev = ss.getSheetByName('Sheet2');
      if (!sheet2ev) return createJsonResponse(false, 'Sheet2 not found.', null);
      sheet2ev.appendRow([data.name || '', data.date || '', data.category || '', data.description || '', data.status || 'Upcoming']);
      return createJsonResponse(true, 'Event created.', null);
    }

    // ── CERT REQUEST (Sheet6) ─────────────────────────────
    if (action === 'certrequest') {
      var sheet6 = ss.getSheetByName('Sheet6');
      if (!sheet6) return createJsonResponse(false, 'Sheet6 not found.', null);
      sheet6.appendRow([new Date(), data.operativeId || '', data.eventName || '', data.email || '', 'Pending']);
      return createJsonResponse(true, 'Certificate request submitted.', null);
    }

    // ── DOC REQUEST (Sheet5) ──────────────────────────────
    if (action === 'docrequest') {
      var sheet5 = ss.getSheetByName('Sheet5');
      if (!sheet5) return createJsonResponse(false, 'Sheet5 not found.', null);
      sheet5.appendRow([new Date(), data.operativeId || '', data.docType || '', data.email || '', 'Pending']);
      return createJsonResponse(true, 'Document request submitted.', null);
    }

    return createJsonResponse(false, 'Unknown action: ' + action, null);

  } catch (err) {
    Logger.log('doPost Error: ' + err.toString());
    return createJsonResponse(false, 'Server error: ' + err.toString(), null);
  }
}

/* ═══════════════════════════════════════════════════════════
   EMAIL
   ═══════════════════════════════════════════════════════════ */
function sendConfirmationEmail(email, name, operativeId) {
  var subject = '🎉 Innovexa Hub — Registration Received! Your ID: ' + operativeId;
  var body =
    'Hi ' + name + ',\n\n' +
    'Thank you for registering with Innovexa Hub!\n\n' +
    'Your Operative ID: ' + operativeId + '\n\n' +
    'Your application is currently under review. The admin team will approve it within 24–48 hours.\n\n' +
    'Check your status at: https://innovexareg.vercel.app/status.html\n\n' +
    'Once approved, you\'ll get access to the WhatsApp & Telegram community groups.\n\n' +
    '— The Innovexa Hub Team';

  MailApp.sendEmail({ to: email, subject: subject, body: body });
}
