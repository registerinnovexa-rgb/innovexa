// Innovexa Hub — Minimal Status Check Script
// Paste this in Apps Script, save, then Deploy > New deployment > Web App > Anyone > Deploy

function doGet(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];
    var rows  = sheet.getDataRange().getValues();
    var p     = e.parameter || {};

    // ?action=count — return member count
    if (p.action === 'count' || (!p.email && !p.utr && !p.action)) {
      return respond({ success: true, data: { count: Math.max(0, rows.length - 1) } });
    }

    // Search by email (col C = index 2) or UTR (col J = index 9)
    for (var i = 1; i < rows.length; i++) {
      var row        = rows[i];
      var rowEmail   = String(row[2] || '').trim().toLowerCase();
      var rowUtr     = String(row[9] || '').trim();
      var matchEmail = p.email && rowEmail === String(p.email).trim().toLowerCase();
      var matchUtr   = p.utr   && rowUtr   === String(p.utr).trim();

      if (matchEmail || matchUtr) {
        return respond({
          success: true,
          found:   true,
          data: {
            name:           String(row[1]  || ''),
            email:          String(row[2]  || ''),
            phone:          String(row[3]  || ''),
            year:           String(row[4]  || ''),
            branch:         String(row[5]  || ''),
            skillLevel:     String(row[6]  || ''),
            dob:            String(row[7]  || ''),
            interests:      String(row[8]  || ''),
            utr:            String(row[9]  || ''),
            status:         String(row[10] || 'Pending'),
            amount:         String(row[11] || ''),
            operativeId:    String(row[12] || ''),
            photoUrl:       String(row[13] || ''),
            paymentProofUrl:String(row[14] || '')
          }
        });
      }
    }

    return respond({ success: false, found: false, message: 'No member found.' });

  } catch (err) {
    return respond({ success: false, message: 'Error: ' + err.toString() });
  }
}

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];
    var data  = JSON.parse(e.postData.contents || '{}');

    // Duplicate email check
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][2]).toLowerCase() === String(data.email || '').toLowerCase()) {
        return respond({ success: false, message: 'Email already registered.' });
      }
      if (String(rows[i][9]) === String(data.utr || '')) {
        return respond({ success: false, message: 'UTR already submitted.' });
      }
    }

    var nextNum     = sheet.getLastRow(); // row count including header
    var operativeId = 'INVX-' + String(nextNum).padStart(3, '0');
    var timestamp   = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    sheet.appendRow([
      timestamp,
      data.fullName    || '',
      data.email       || '',
      data.phone       || '',
      data.year        || '',
      data.branch      || '',
      data.skillLevel  || '',
      data.dob         || '',
      data.interests   || '',
      data.utr         || '',
      'Pending',
      data.amount      || '599',
      operativeId,
      data.photoUrl    || '',
      data.paymentUrl  || ''
    ]);

    try {
      MailApp.sendEmail({
        to:      data.email,
        subject: 'Innovexa Hub — Registration Received! ID: ' + operativeId,
        body:    'Hi ' + (data.fullName || '') + ',\n\nYour Operative ID: ' + operativeId + '\n\nCheck status: https://innovexareg.vercel.app/status.html\n\n— Innovexa Hub'
      });
    } catch (_) {}

    return respond({ success: true, message: 'Registered!', data: { operativeId: operativeId } });

  } catch (err) {
    return respond({ success: false, message: 'Error: ' + err.toString() });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
