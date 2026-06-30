/**
 * INNOVEXA LABS — Universal API Backend (Code1.gs)
 * Handles Event WRITES (with registration fields) and Event Registration Submissions.
 */
const MAIN_SHEET_ID = '1duYgV0rXOuN4n61HLCQIIcx2fhpL8GYiRxIBrOTbr1A';
const EVENT_REG_SHEET_ID = '1ZqpD55diHHyT0gFiMXHGLzFBvsYE1-td8AXgoUoNQbU';
const ADMIN_KEY = 'innovexa2025admin';

function createJsonResponse(success, message, extra) {
  const payload = { success: success, message: message };
  if (extra) for (const key in extra) payload[key] = extra[key];
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (!e || !e.parameter) return createJsonResponse(true, 'Code1 API is running.');
  const action = e.parameter.action;

  if (action === 'events') {
    const ss = SpreadsheetApp.openById(MAIN_SHEET_ID);
    const sheet = ss.getSheetByName('Sheet2');
    if (!sheet) return createJsonResponse(false, 'Sheet2 not found');
    const data = sheet.getDataRange().getValues().slice(1);
    const events = data.map(function(r) {
      return { date: r[0], name: r[1], type: r[2], mode: r[3], description: r[4], status: r[5], photos: r[6], report: r[7], requiresReg: r[8] || '', regFee: r[9] || '' };
    });
    return createJsonResponse(true, 'Events fetched', { events: events });
  }

  if (action === 'adminWrite') {
    const data = JSON.parse(e.parameter.data);
    if (data.adminKey !== ADMIN_KEY) return createJsonResponse(false, 'Unauthorized');
    const ss = SpreadsheetApp.openById(MAIN_SHEET_ID);

    if (data.op === 'addEvent') {
      const sheet = ss.getSheetByName('Sheet2');
      sheet.appendRow([data.date, data.name, data.type, data.mode, data.description, data.eventStatus, data.photos, data.report, data.requiresReg || '', data.regFee || '']);
      return createJsonResponse(true, 'Event added');
    }
    if (data.op === 'editEvent') {
      const sheet = ss.getSheetByName('Sheet2');
      sheet.getRange(parseInt(data.rowIndex), 1, 1, 10).setValues([[data.date, data.name, data.type, data.mode, data.description, data.eventStatus, data.photos, data.report, data.requiresReg || '', data.regFee || '']]);
      return createJsonResponse(true, 'Event updated');
    }
    if (data.op === 'deleteEvent') {
      const sheet = ss.getSheetByName('Sheet2');
      sheet.deleteRow(parseInt(data.rowIndex));
      return createJsonResponse(true, 'Event deleted');
    }

    // Get registrations for an event
    if (data.op === 'getEventRegs') {
      var regSS = SpreadsheetApp.openById(EVENT_REG_SHEET_ID);
      var tab = regSS.getSheetByName((data.eventName || '').substring(0, 50));
      if (!tab) return createJsonResponse(true, 'No registrations yet.', { registrations: [] });
      var rows = tab.getDataRange().getValues();
      var regs = [];
      for (var i = 1; i < rows.length; i++) {
        regs.push({ rowIndex: i + 1, timestamp: rows[i][0], name: rows[i][1], email: rows[i][2], phone: rows[i][3], roleYear: rows[i][4], department: rows[i][5], fee: rows[i][6], utr: rows[i][7], status: rows[i][8] });
      }
      return createJsonResponse(true, 'Fetched', { registrations: regs });
    }

    // Update registration status + send email
    if (data.op === 'updateRegStatus') {
      var regSS = SpreadsheetApp.openById(EVENT_REG_SHEET_ID);
      var tab = regSS.getSheetByName((data.eventName || '').substring(0, 50));
      if (!tab) return createJsonResponse(false, 'Event tab not found.');
      var ri = parseInt(data.rowIndex);
      tab.getRange(ri, 9).setValue(data.status || 'Pending');

      // Send email on Confirmed
      if ((data.status || '').toLowerCase() === 'confirmed' && data.email) {
        try {
          var subject = '🎉 Registration Confirmed — ' + data.eventName + ' | Innovexa Labs';
          var body = 'Hi ' + (data.registrantName || 'there') + ',\n\n' +
            'Great news! Your registration for "' + data.eventName + '" has been CONFIRMED! ✅\n\n' +
            'We look forward to seeing you at the event.\n\n' +
            'Best regards,\n' +
            'Innovexa Labs Team 🚀';
          MailApp.sendEmail({ to: data.email, subject: subject, body: body });
        } catch (mailErr) {
          Logger.log('Confirm email failed: ' + mailErr.message);
        }
      }
      return createJsonResponse(true, 'Status updated to ' + data.status);
    }

    // Mark Attendance via QR Scan — no event registration required
    if (data.op === 'markAttendance') {
      var operativeId = (data.operativeId || '').trim().toUpperCase();
      var eventName = (data.eventName || '').trim();
      if (!operativeId || !eventName) return createJsonResponse(false, 'Missing operative ID or event name.');

      // 1. Validate member exists in MAIN members sheet
      var mainSS = SpreadsheetApp.openById(MAIN_SHEET_ID);
      var mainSheet = mainSS.getSheets()[0];
      var allMembers = mainSheet.getDataRange().getValues();
      
      var memberName = '';
      var memberEmail = '';
      var foundRow = -1;
      
      for (var i = 1; i < allMembers.length; i++) {
        var rowOpId = (allMembers[i][12] || '').toString().trim().toUpperCase();
        // Also auto-generate ID from row number (same logic as Code.gs)
        var autoId = 'INVX-' + String(i).padStart(2, '0');
        
        if ((rowOpId && rowOpId === operativeId) || autoId === operativeId) {
          memberName = (allMembers[i][1] || '').toString().trim();
          memberEmail = (allMembers[i][2] || '').toString().trim();
          foundRow = i;
          break;
        }
      }
      
      if (foundRow === -1) return createJsonResponse(false, 'Member not found: ' + operativeId);

      // 2. Log attendance in event-specific tab (auto-create if needed)
      var regSS = SpreadsheetApp.openById(EVENT_REG_SHEET_ID);
      var tabName = ('ATT_' + eventName).substring(0, 50);
      var attTab = regSS.getSheetByName(tabName);
      
      if (!attTab) {
        attTab = regSS.insertSheet(tabName);
        attTab.appendRow(['Timestamp', 'Operative ID', 'Name', 'Email', 'Status']);
      }
      
      // 3. Check if already marked present
      var attData = attTab.getDataRange().getValues();
      for (var k = 1; k < attData.length; k++) {
        if (String(attData[k][1]).trim().toUpperCase() === operativeId) {
          return createJsonResponse(false, memberName + ' is already marked present.');
        }
      }
      
      // 4. Mark present
      attTab.appendRow([new Date(), operativeId, memberName, memberEmail, 'Present']);
      return createJsonResponse(true, '✅ ' + memberName + ' marked present!');
    }

    return createJsonResponse(false, 'Unknown op: ' + data.op);
  }

  return createJsonResponse(true, 'Code1 API is running.');
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'eventRegister') {
      if (!data.eventName) return createJsonResponse(false, 'Event name is required.');
      if (!data.name || !data.email || !data.phone) return createJsonResponse(false, 'Name, email, and phone are required.');
      const regSS = SpreadsheetApp.openById(EVENT_REG_SHEET_ID);
      const tabName = (data.eventName).substring(0, 50);
      let tab = regSS.getSheetByName(tabName);
      if (!tab) {
        tab = regSS.insertSheet(tabName);
        tab.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Role/Year', 'Department', 'Fee', 'UTR', 'Status']);
        tab.getRange(1,1,1,9).setFontWeight('bold');
      }
      // Check duplicate email
      const existing = tab.getDataRange().getValues();
      for (var i = 1; i < existing.length; i++) {
        if (existing[i][2] && existing[i][2].toString().toLowerCase() === data.email.toLowerCase()) {
          return createJsonResponse(false, 'You are already registered for this event.');
        }
      }
      tab.appendRow([new Date().toLocaleString('en-IN'), data.name, data.email, data.phone, data.roleYear, data.dept, data.fee, data.utr, 'Pending']);

      // Send confirmation email
      try {
        var fee = parseFloat(data.fee || '0');
        var subject = '✅ Registration Received — ' + data.eventName + ' | Innovexa Labs';
        var body = 'Hi ' + data.name + ',\n\n' +
          'Thank you for registering for "' + data.eventName + '"!\n\n' +
          '📋 Registration Details:\n' +
          '━━━━━━━━━━━━━━━━━━━━━━\n' +
          '• Name: ' + data.name + '\n' +
          '• Email: ' + data.email + '\n' +
          '• Phone: ' + data.phone + '\n' +
          '• Role/Year: ' + (data.roleYear || 'N/A') + '\n' +
          '• Department: ' + (data.dept || 'N/A') + '\n' +
          (fee > 0 ? '• Fee: ₹' + fee + '\n• UTR: ' + (data.utr || 'N/A') + '\n' : '• Fee: Free\n') +
          '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          '📌 Status: PENDING\n\n' +
          (fee > 0 ? 'Your payment is being verified. You will receive another email once confirmed.\n\n' : 'Your registration is being reviewed. You will receive a confirmation email shortly.\n\n') +
          'If you have any questions, feel free to reach out.\n\n' +
          'Best regards,\n' +
          'Innovexa Labs Team 🚀';
        MailApp.sendEmail({ to: data.email, subject: subject, body: body });
      } catch (mailErr) {
        Logger.log('Email failed: ' + mailErr.message);
      }

      return createJsonResponse(true, 'Registered successfully!');
    }
    return createJsonResponse(false, 'Unknown action');
  } catch (err) { return createJsonResponse(false, 'Error: ' + err.message); }
}
