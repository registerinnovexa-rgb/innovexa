/**
 * ═══════════════════════════════════════════════════════════════════
 *  INNOVEXA HUB — Google Apps Script Backend (Code.gs)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  This script handles two types of requests:
 *
 *  1. doPost(e) — Receives registration data from the frontend
 *     and appends it as a new row in the Google Sheet.
 *
 *  2. doGet(e) — Accepts an email or UTR query parameter,
 *     searches the sheet, and returns the registration status.
 *
 * ─── SETUP INSTRUCTIONS ────────────────────────────────────────────
 *
 *  Step 1: Create the Google Sheet
 *  ───────────────────────────────
 *  1. Go to https://sheets.google.com → Create a new spreadsheet
 *  2. Name it "Innovexa Hub - Registrations"
 *  3. In Row 1, add these column headers:
 *     A1: Timestamp
 *     B1: Name
 *     C1: Email
 *     D1: Phone
 *     E1: Year
 *     F1: Branch
 *     G1: Skill Level
 *     H1: DOB
 *     I1: Interests
 *     J1: UTR
 *     K1: Status
 *     L1: Amount
 *     M1: Operative ID
 *     N1: LinkedIn
 *     O1: GitHub
 *     P1: Bio
 *     Q1: Avatar
 *     R1: Skills
 *
 *  Step 2: Create Additional Sheets
 *  ─────────────────────────────────
 *  - Sheet2: (Reserved)
 *  - Sheet3: Resources — Headers: Title | Description | Link | Category | Stack
 *  - Sheet4: Team      — Headers: Name | Role | LinkedIn | GitHub | Bio | Avatar
 *  - Sheet5: DocRequests — Headers: Timestamp | Name | Email | OpID | Event | Dates | Reason | Status | AdminNote
 *  - Sheet6: Events      — Headers: EventName | EventDate | Description | Status | CreatedAt
 *  - Sheet7: CertRequests — Headers: Timestamp | MemberName | MemberEmail | OperativeID | EventName | EventDate | Status | AdminNote
 *
 *  Step 3: Add This Script
 *  ───────────────────────
 *  4. Go to Extensions → Apps Script
 *  5. Delete everything in Code.gs and paste this entire file
 *  6. Save the project (Ctrl+S)
 *
 *  Step 4: Deploy as Web App
 *  ─────────────────────────
 *  7. Click Deploy → New Deployment
 *  8. Click the gear icon → Select type: "Web app"
 *  9. Set "Description": "Innovexa Hub Registration API"
 * 10. Set "Execute as": Me (your Google account)
 * 11. Set "Who has access": Anyone
 * 12. Click Deploy
 * 13. Authorize the app when prompted
 * 14. Copy the Web App URL (looks like:
 *     https://script.google.com/macros/s/AKfycb.../exec)
 * 15. Paste that URL into your index.html where it says:
 *     SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
 *
 * ═══════════════════════════════════════════════════════════════════
 */

// ─── Configuration ──────────────────────────────────────────────
const SHEET_NAME = 'Sheet1';
const UPLOADS_FOLDER_NAME = 'Innovexa Hub - Operative Assets';

/**
 * ═══════════════════════════════════════════════════════════════
 *  doPost(e) — Handle Registration Submissions & Profile Updates
 * ═══════════════════════════════════════════════════════════════
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) return createJsonResponse(false, 'Sheet not found: ' + SHEET_NAME);

    // ── Handle Create Event ─────────────────────────────────
    if (data.action === 'createEvent') {
      return handleCreateEvent(ss, data);
    }

    // ── Handle Delete Event ──────────────────────────────────
    if (data.action === 'deleteEvent') {
      return handleDeleteEvent(ss, data);
    }

    // ── Handle Certificate Request ───────────────────────────
    if (data.action === 'certRequest') {
      return handleCertRequest(ss, data);
    }

    // ── Handle Certificate Approve/Reject ────────────────────
    if (data.action === 'certApprove') {
      return handleCertApprove(ss, data);
    }

    // ── Handle Document Request ──────────────────────────────
    if (data.action === 'docRequest') {
      return handleDocRequest(ss, data);
    }

    if (data.action === 'docApprove') {
      return handleDocApprove(ss, data);
    }

    if (data.action === 'updateProfile') {
      return handleUpdateProfile(sheet, data);
    }

    // ── Handle Admin Write Operations ────────────────────────
    if (data.action === 'adminWrite') {
      return handleAdminWrite(ss, data);
    }

    // ── Duplicate UTR Check ──────────────────────────────────
    const allData = sheet.getDataRange().getValues();
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][9] === data.utr) {
        return createJsonResponse(false, 'This UTR has already been submitted: ' + data.utr);
      }
    }

    // ── Generate Operative ID ────────────────────────────────
    const lastRow = sheet.getLastRow();
    const nextId = lastRow;
    const operativeId = 'INVX-' + String(nextId).padStart(2, '0');

    // ── Handle File Uploads (Drive) ──────────────────────────
    let photoUrl = '';
    let paymentUrl = '';

    if (data.photoBase64) {
      photoUrl = handleFileUpload(data.photoBase64, operativeId + '_photo', data.photoType);
    }
    if (data.paymentBase64) {
      paymentUrl = handleFileUpload(data.paymentBase64, operativeId + '_payment', data.paymentType);
    }

    // ── Append New Row ───────────────────────────────────────
    // Columns: [Timestamp, Name, Email, Phone, Year, Branch, SkillLevel, DOB, Interests, UTR, Status, Amount, OperativeID, LinkedIn, GitHub, Bio, Avatar (Photo URL), Skills, Payment Proof URL]
    sheet.appendRow([
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),  // A: Timestamp
      data.fullName   || '',                                              // B: Name
      data.email      || '',                                              // C: Email
      data.phone      || '',                                              // D: Phone
      data.year       || '',                                              // E: Year
      data.branch     || '',                                              // F: Branch
      data.skillLevel || '',                                              // G: Skill Level
      data.dob        || '',                                              // H: DOB
      data.interests  || '',                                              // I: Interests
      data.utr        || '',                                              // J: UTR
      'Pending',                                                          // K: Status
      data.amount     || '',                                              // L: Amount
      operativeId,                                                        // M: Operative ID
      '',                                                                 // N: LinkedIn
      '',                                                                 // O: GitHub
      '',                                                                 // P: Bio
      photoUrl,                                                           // Q: Avatar (Photo URL)
      '',                                                                 // R: Skills
      paymentUrl                                                          // S: Payment Proof URL
    ]);

    // ── Send Google Calendar Invite ──────────────────────────
    sendCalendarInvite(data.email, data.fullName);

    return createJsonResponse(true, 'Registration saved successfully!', { operativeId: operativeId });

  } catch (error) {
    Logger.log('doPost Error: ' + error.toString());
    return createJsonResponse(false, 'Server error: ' + error.toString());
  }
}

/**
 * handleFileUpload() — Saves Base64 data to Google Drive
 */
function handleFileUpload(base64Data, fileName, mimeType) {
  try {
    const folder = getOrCreateFolder(UPLOADS_FOLDER_NAME);
    const decoded = Utilities.base64Decode(base64Data.split(',')[1]);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    Logger.log('Upload Error: ' + e.message);
    return 'Upload Failed';
  }
}

/**
 * getOrCreateFolder() — Helper to manage Drive folders
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

/**
 * sendCalendarInvite() — Sends a Google Calendar Invitation
 */
function sendCalendarInvite(email, name) {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const now = new Date();
    const eventStart = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Set for 24h from now as a "Welcome Sync"
    const eventEnd = new Date(eventStart.getTime() + (30 * 60 * 1000)); // 30 min duration

    calendar.createEvent('Welcome to Innovexa Hub: ' + name, eventStart, eventEnd, {
      description: 'Congratulations on joining Innovexa Hub! This is a placeholder for your induction.',
      guests: email,
      sendInvites: true
    });
  } catch (e) {
    Logger.log('Calendar Error: ' + e.message);
  }
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  handleUpdateProfile() — Update profile fields by Operative ID
 * ═══════════════════════════════════════════════════════════════
 *
 *  Expects: { action: 'updateProfile', operativeId: 'INVX-XX',
 *             linkedin, github, bio, avatar, skills }
 *
 *  Searches Column M for the operative ID and updates columns N-R.
 */
function handleUpdateProfile(sheet, data) {
  const opId = (data.operativeId || '').trim().toUpperCase();
  if (!opId) {
    return createJsonResponse(false, 'Missing operativeId.');
  }

  const allData = sheet.getDataRange().getValues();

  for (let i = 1; i < allData.length; i++) {
    const rowOpId = (allData[i][12] || '').toString().trim().toUpperCase(); // Column M = index 12
    if (rowOpId === opId) {
      const rowNum = i + 1; // Sheet rows are 1-indexed

      // Update LinkedIn (Column N = 14)
      if (data.linkedin !== undefined) sheet.getRange(rowNum, 14).setValue(data.linkedin);
      // Update GitHub (Column O = 15)
      if (data.github !== undefined)   sheet.getRange(rowNum, 15).setValue(data.github);
      // Update Bio (Column P = 16)
      if (data.bio !== undefined)      sheet.getRange(rowNum, 16).setValue(data.bio);
      // Update Avatar (Column Q = 17)
      if (data.avatar !== undefined)   sheet.getRange(rowNum, 17).setValue(data.avatar);
      // Update Skills (Column R = 18)
      if (data.skills !== undefined)   sheet.getRange(rowNum, 18).setValue(data.skills);

      return createJsonResponse(true, 'Profile updated successfully!');
    }
  }

  return createJsonResponse(false, 'Operative ID not found: ' + opId);
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  handleAdminWrite() — Admin CRUD operations
 * ═══════════════════════════════════════════════════════════════
 */
function handleAdminWrite(ss, data) {
  const target = data.target || 'members';
  const operation = data.operation || 'update';

  if (target === 'members') {
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return createJsonResponse(false, 'Sheet not found.');

    if (operation === 'update' && data.rowIndex) {
      // Update status for a member
      if (data.status !== undefined) {
        sheet.getRange(data.rowIndex, 11).setValue(data.status); // Column K = Status
      }
      return createJsonResponse(true, 'Member updated.');
    }

    if (operation === 'delete' && data.rowIndex) {
      sheet.deleteRow(data.rowIndex);
      return createJsonResponse(true, 'Member deleted.');
    }
  }

  if (target === 'resources') {
    const sheet = ss.getSheetByName('Sheet3');
    if (!sheet) return createJsonResponse(false, 'Sheet3 (Resources) not found.');

    if (operation === 'add') {
      sheet.appendRow([
        data.title || '',
        data.description || '',
        data.link || '',
        data.category || '',
        data.stack || ''
      ]);
      return createJsonResponse(true, 'Resource added.');
    }

    if (operation === 'delete' && data.rowIndex) {
      sheet.deleteRow(data.rowIndex);
      return createJsonResponse(true, 'Resource deleted.');
    }
  }

  // ── Asset Operations ─────────────────────────────────────────
  if (target === 'assets') {
    var aSheet = getOrCreateAssetSheet(ss);

    if (operation === 'add') {
      aSheet.appendRow([data.name || '', data.type || '', data.serial || '', 'Available', '', '']);
      return createJsonResponse(true, 'Asset "' + data.name + '" added.');
    }

    if (operation === 'borrow') {
      var aRows = aSheet.getDataRange().getValues();
      for (var i = 1; i < aRows.length; i++) {
        if (aRows[i][0] === data.assetName) {
          if (aRows[i][3] === 'Borrowed') return createJsonResponse(false, '"' + data.assetName + '" is already borrowed by ' + aRows[i][4]);
          aSheet.getRange(i+1, 4).setValue('Borrowed');
          aSheet.getRange(i+1, 5).setValue(data.operativeId || '');
          aSheet.getRange(i+1, 6).setValue(new Date().toLocaleString('en-IN'));
          return createJsonResponse(true, '"' + data.assetName + '" issued to ' + data.operativeId);
        }
      }
      return createJsonResponse(false, 'Asset not found: ' + data.assetName);
    }

    if (operation === 'return') {
      var aRows2 = aSheet.getDataRange().getValues();
      for (var j = 1; j < aRows2.length; j++) {
        if (aRows2[j][0] === data.assetName) {
          aSheet.getRange(j+1, 4).setValue('Available');
          aSheet.getRange(j+1, 5).setValue('');
          aSheet.getRange(j+1, 6).setValue('');
          return createJsonResponse(true, '"' + data.assetName + '" returned successfully.');
        }
      }
      return createJsonResponse(false, 'Asset not found: ' + data.assetName);
    }
  }

  return createJsonResponse(false, 'Unknown admin operation.');
}

// ── Asset Helpers ────────────────────────────────────────────
function getOrCreateAssetSheet(ss) {
  var sheet = ss.getSheetByName('Assets');
  if (!sheet) {
    sheet = ss.insertSheet('Assets');
    sheet.appendRow(['Name', 'Type', 'Serial', 'Status', 'BorrowedBy', 'BorrowDate']);
    sheet.getRange(1,1,1,6).setFontWeight('bold');
  }
  return sheet;
}

function handleGetAssets(ss) {
  var sheet = getOrCreateAssetSheet(ss);
  var rows = sheet.getDataRange().getValues().slice(1);
  var assets = rows.map(function(r) {
    return { name: r[0], type: r[1], serial: r[2], status: r[3] || 'Available', borrowedBy: r[4] || '', borrowDate: r[5] || '' };
  });
  return createJsonResponse(true, 'Assets fetched', { assets: assets });
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  doGet(e) — Handle Status Checks, Profiles, Resources, Team
 * ═══════════════════════════════════════════════════════════════
 */
function doGet(e) {
  try {
    // Get the spreadsheet and target sheet
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    // Verify the sheet exists
    if (!sheet) {
      return createJsonResponse(false, 'Sheet not found: ' + SHEET_NAME);
    }

    // Check if we have query parameters
    if (!e || !e.parameter) {
      return createJsonResponse(true, 'Innovexa Hub Registration API is running. Use ?email= or ?utr= or ?action=count to query.');
    }

    const action = (e.parameter.action || '').trim().toLowerCase();

    // ── Handle Member Count ──────────────────────────────────
    if (action === 'count') {
      const lastRow = sheet.getLastRow();
      const count = lastRow > 1 ? lastRow - 1 : 0; // Subtract header row
      return createJsonResponse(true, 'Member count fetched.', { count: count });
    }

    // ── Handle Profile Request ───────────────────────────────
    if (action === 'profile') {
      return handleGetProfile(sheet, e.parameter);
    }

    // ── Handle Profile by Email ──────────────────────────────
    if (action === 'profilebyemail') {
      return handleGetProfileByEmail(sheet, e.parameter);
    }

    // ── Handle Events List ─────────────────────────────────
    if (action === 'events') {
      return handleGetEvents(ss);
    }

    // ── Handle Cert Requests (Admin) ────────────────────────
    if (action === 'certreqs') {
      return handleGetCertRequests(ss);
    }

    // ── Handle My Cert Status (Member) ──────────────────────
    if (action === 'mycertstatus') {
      return handleMyCertStatus(ss, e.parameter);
    }

    // ── Handle Resources Request ─────────────────────────────
    if (action === 'resources') {
      return handleGetResources(ss);
    }

    // ── Handle Team Request ──────────────────────────────────
    if (action === 'team') {
      return handleGetTeam(ss);
    }

    // ── Handle Chat Verification ─────────────────────────────
    if (action === 'verifychat') {
      return handleVerifyChat(sheet, e.parameter);
    }

    // ── Handle Admin Members List ────────────────────────────
    if (action === 'adminmembers') {
      return handleAdminMembers(sheet);
    }

    // ── Handle Assets List ───────────────────────────────────
    if (action === 'assets') {
      return handleGetAssets(ss);
    }

    // ── Handle Doc Request Status (member check) ────────────
    if (action === 'docstatus') {
      return handleDocStatus(ss, e.parameter);
    }

    // ── Handle Doc Requests List (admin) ────────────────────
    if (action === 'docrequests') {
      return handleDocRequests(ss);
    }

    // ── Handle Email / UTR Status Query ──────────────────────
    const emailQuery = (e.parameter.email || '').trim().toLowerCase();
    const utrQuery   = (e.parameter.utr   || '').trim();

    // Validate that at least one query parameter is provided
    if (!emailQuery && !utrQuery) {
      return createJsonResponse(false, 'Please provide an email, UTR, or action parameter.');
    }

    // ── Search the Sheet ─────────────────────────────────────
    const allData = sheet.getDataRange().getValues();

    for (let i = 1; i < allData.length; i++) {
      const rowEmail  = (allData[i][2]  || '').toString().trim().toLowerCase();  // Column C = Email
      const rowUTR    = (allData[i][9]  || '').toString().trim();                // Column J = UTR
      const rowName   = (allData[i][1]  || '').toString().trim();                // Column B = Name
      const rowStatus = (allData[i][10] || '').toString().trim();               // Column K = Status
      const rowPhone  = (allData[i][3]  || '').toString().trim();                // Column D = Phone
      const rowDob    = (allData[i][7]  || '').toString().trim();                // Column H = DOB
      const rowOpId   = (allData[i][12] || '').toString().trim();               // Column M = Operative ID

      // Auto-generate Operative ID if empty (INVX-01 for row 2, INVX-02 for row 3, etc.)
      const operativeId = rowOpId || ('INVX-' + String(i).padStart(2, '0'));

      // Check if the email matches
      if (emailQuery && rowEmail === emailQuery) {
        return createJsonResponse(true, 'Status found.', {
          status: rowStatus,
          name: rowName,
          email: rowEmail,
          phone: rowPhone,
          dob: rowDob,
          id: operativeId
        });
      }

      // Check if the UTR matches
      if (utrQuery && rowUTR === utrQuery) {
        return createJsonResponse(true, 'Status found.', {
          status: rowStatus,
          name: rowName,
          utr: rowUTR,
          id: operativeId
        });
      }
    }

    // ── Not Found ────────────────────────────────────────────
    return createJsonResponse(false, 'No registration found matching that email or UTR. Please double-check and try again.');

  } catch (error) {
    Logger.log('doGet Error: ' + error.toString());
    return createJsonResponse(false, 'Server error: ' + error.toString());
  }
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  handleGetProfile() — Return full profile by Operative ID
 * ═══════════════════════════════════════════════════════════════
 *
 *  Query: ?action=profile&id=INVX-01
 *
 *  Returns: name, email, interests, skills, linkedin, github,
 *           bio, avatar, status, operativeId
 */
function handleGetProfile(sheet, params) {
  const profileId = (params.id || '').trim().toUpperCase();
  if (!profileId) {
    return createJsonResponse(false, 'Missing profile ID parameter.');
  }

  const allData = sheet.getDataRange().getValues();

  for (let i = 1; i < allData.length; i++) {
    const rowOpId = (allData[i][12] || '').toString().trim().toUpperCase(); // Column M
    if (rowOpId === profileId) {
      return createJsonResponse(true, 'Profile found.', {
        name:        (allData[i][1]  || '').toString().trim(),  // B: Name
        email:       (allData[i][2]  || '').toString().trim(),  // C: Email
        phone:       (allData[i][3]  || '').toString().trim(),  // D: Phone
        year:        (allData[i][4]  || '').toString().trim(),  // E: Year
        branch:      (allData[i][5]  || '').toString().trim(),  // F: Branch
        interests:   (allData[i][8]  || '').toString().trim(),  // I: Interests
        status:      (allData[i][10] || '').toString().trim(),  // K: Status
        operativeId: rowOpId,                                    // M: Operative ID
        linkedin:    (allData[i][13] || '').toString().trim(),  // N: LinkedIn
        github:      (allData[i][14] || '').toString().trim(),  // O: GitHub
        bio:         (allData[i][15] || '').toString().trim(),  // P: Bio
        avatar:      (allData[i][16] || '').toString().trim(),  // Q: Avatar
        skills:      (allData[i][17] || '').toString().trim(),  // R: Skills
        dob:         (allData[i][7]  || '').toString().trim()   // H: DOB
      });
    }
  }

  return createJsonResponse(false, 'Profile not found for ID: ' + profileId);
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  handleGetResources() — Return all resources from Sheet3
 * ═══════════════════════════════════════════════════════════════
 *
 *  Sheet3 headers: Title | Description | Link | Category | Stack
 */
function handleGetResources(ss) {
  const sheet = ss.getSheetByName('Sheet3');
  if (!sheet) {
    return createJsonResponse(false, 'Sheet3 (Resources) not found.');
  }

  const allData = sheet.getDataRange().getValues();
  const resources = [];

  for (let i = 1; i < allData.length; i++) {
    const title = (allData[i][0] || '').toString().trim();
    if (!title) continue; // Skip empty rows

    resources.push({
      title:       title,
      description: (allData[i][1] || '').toString().trim(),
      link:        (allData[i][2] || '').toString().trim(),
      category:    (allData[i][3] || '').toString().trim(),
      stack:       (allData[i][4] || '').toString().trim()
    });
  }

  return createJsonResponse(true, 'Resources fetched.', { resources: resources });
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  handleGetTeam() — Return all team members from Sheet4
 * ═══════════════════════════════════════════════════════════════
 *
 *  Sheet4 headers: Name | Role | LinkedIn | GitHub | Bio | Avatar
 */
function handleGetTeam(ss) {
  const sheet = ss.getSheetByName('Sheet4');
  if (!sheet) {
    return createJsonResponse(false, 'Sheet4 (Team) not found.');
  }

  const allData = sheet.getDataRange().getValues();
  const team = [];

  for (let i = 1; i < allData.length; i++) {
    const name = (allData[i][0] || '').toString().trim();
    if (!name) continue; // Skip empty rows

    team.push({
      name:     name,
      role:     (allData[i][1] || '').toString().trim(),
      linkedin: (allData[i][2] || '').toString().trim(),
      github:   (allData[i][3] || '').toString().trim(),
      bio:      (allData[i][4] || '').toString().trim(),
      avatar:   (allData[i][5] || '').toString().trim()
    });
  }

  return createJsonResponse(true, 'Team fetched.', { team: team });
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  handleVerifyChat() — 3-factor verification for community chat
 * ═══════════════════════════════════════════════════════════════
 *
 *  Query: ?action=verifyChat&id=INVX-XX&email=x@x.com&phone=1234567890
 *
 *  Checks that all 3 fields match a single row in the sheet.
 */
function handleVerifyChat(sheet, params) {
  const id    = (params.id    || '').trim().toUpperCase();
  const email = (params.email || '').trim().toLowerCase();
  const phone = (params.phone || '').trim();

  if (!id || !email || !phone) {
    return createJsonResponse(false, 'All 3 fields (ID, Email, Phone) are required.');
  }

  const allData = sheet.getDataRange().getValues();

  for (let i = 1; i < allData.length; i++) {
    const rowOpId  = (allData[i][12] || '').toString().trim().toUpperCase();
    const rowEmail = (allData[i][2]  || '').toString().trim().toLowerCase();
    const rowPhone = (allData[i][3]  || '').toString().trim();
    const rowName  = (allData[i][1]  || '').toString().trim();
    const rowStatus = (allData[i][10] || '').toString().trim();

    // Match by Operative ID if it exists, OR by row position for INVX-01 (president = row 2 = index 1)
    const idMatch = (rowOpId && rowOpId === id) || (!rowOpId && id === 'INVX-01' && i === 1);
    const emailMatch = rowEmail === email;
    const phoneMatch = rowPhone === phone || rowPhone.endsWith(phone);

    if (idMatch && emailMatch && phoneMatch) {
      return createJsonResponse(true, 'Verification successful.', {
        name: rowName,
        operativeId: rowOpId || id,
        status: rowStatus
      });
    }
  }

  return createJsonResponse(false, 'Verification failed. Credentials do not match any record.');
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  handleAdminMembers() — Return all members for admin dashboard
 * ═══════════════════════════════════════════════════════════════
 *
 *  Returns all member rows with row indices for admin CRUD ops.
 */
function handleAdminMembers(sheet) {
  const allData = sheet.getDataRange().getValues();
  const members = [];

  for (let i = 1; i < allData.length; i++) {
    members.push({
      rowIndex:    i + 1,  // 1-indexed for sheet operations
      timestamp:   (allData[i][0]  || '').toString(),
      name:        (allData[i][1]  || '').toString().trim(),
      email:       (allData[i][2]  || '').toString().trim(),
      phone:       (allData[i][3]  || '').toString().trim(),
      year:        (allData[i][4]  || '').toString().trim(),
      branch:      (allData[i][5]  || '').toString().trim(),
      skillLevel:  (allData[i][6]  || '').toString().trim(),
      dob:         (allData[i][7]  || '').toString().trim(),
      interests:   (allData[i][8]  || '').toString().trim(),
      utr:         (allData[i][9]  || '').toString().trim(),
      status:      (allData[i][10] || '').toString().trim(),
      amount:      (allData[i][11] || '').toString().trim(),
      operativeId: (allData[i][12] || '').toString().trim()
    });
  }

  return createJsonResponse(true, 'Members fetched.', { members: members });
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  EVENT CERTIFICATE SYSTEM (Approval-Based)
 * ═══════════════════════════════════════════════════════════════
 *
 *  Sheet6 (Events):       EventName | EventDate | Description | Status | CreatedAt
 *  Sheet7 (CertRequests): Timestamp | MemberName | MemberEmail | OperativeID | EventName | EventDate | Status | AdminNote
 */

/** handleCreateEvent() — Admin creates a new event */
function handleCreateEvent(ss, data) {
  var sheet = ss.getSheetByName('Sheet6');
  if (!sheet) {
    sheet = ss.insertSheet('Sheet6');
    sheet.getRange(1, 1, 1, 5).setValues([['EventName', 'EventDate', 'Description', 'Status', 'CreatedAt']]);
  }
  var name = (data.eventName || '').trim();
  var date = (data.eventDate || '').trim();
  var desc = (data.description || '').trim();
  var status = (data.status || 'Upcoming').trim();
  if (!name) return createJsonResponse(false, 'Event name is required.');
  sheet.appendRow([name, date, desc, status, new Date().toLocaleString()]);
  return createJsonResponse(true, 'Event "' + name + '" created.');
}

/** handleDeleteEvent() — Admin deletes an event by row index */
function handleDeleteEvent(ss, data) {
  var sheet = ss.getSheetByName('Sheet6');
  if (!sheet) return createJsonResponse(false, 'Sheet6 (Events) not found.');
  var rowIndex = parseInt(data.rowIndex);
  if (!rowIndex || rowIndex < 2) return createJsonResponse(false, 'Invalid row index.');
  sheet.deleteRow(rowIndex);
  return createJsonResponse(true, 'Event deleted.');
}

/** handleGetEvents() — List all events (public) */
function handleGetEvents(ss) {
  var sheet = ss.getSheetByName('Sheet6');
  if (!sheet) return createJsonResponse(true, 'No events yet.', { events: [] });
  var allData = sheet.getDataRange().getValues();
  var events = [];
  for (var i = 1; i < allData.length; i++) {
    events.push({
      rowIndex:    i + 1,
      eventName:   (allData[i][0] || '').toString().trim(),
      eventDate:   (allData[i][1] || '').toString().trim(),
      description: (allData[i][2] || '').toString().trim(),
      status:      (allData[i][3] || '').toString().trim(),
      createdAt:   (allData[i][4] || '').toString().trim()
    });
  }
  return createJsonResponse(true, 'Events fetched.', { events: events });
}

/** handleCertRequest() — Member submits a certificate request */
function handleCertRequest(ss, data) {
  var sheet = ss.getSheetByName('Sheet7');
  if (!sheet) {
    sheet = ss.insertSheet('Sheet7');
    sheet.getRange(1, 1, 1, 8).setValues([['Timestamp', 'MemberName', 'MemberEmail', 'OperativeID', 'EventName', 'EventDate', 'Status', 'AdminNote']]);
  }
  var name = (data.memberName || '').trim();
  var email = (data.memberEmail || '').trim();
  var opId = (data.operativeId || '').trim();
  var eventName = (data.eventName || '').trim();
  var eventDate = (data.eventDate || '').trim();
  if (!email || !eventName) return createJsonResponse(false, 'Email and Event are required.');
  // Check for duplicate requests
  var allData = sheet.getDataRange().getValues();
  for (var i = 1; i < allData.length; i++) {
    var rEmail = (allData[i][2] || '').toString().trim().toLowerCase();
    var rEvent = (allData[i][4] || '').toString().trim().toLowerCase();
    if (rEmail === email.toLowerCase() && rEvent === eventName.toLowerCase()) {
      return createJsonResponse(false, 'You have already submitted a request for this event.');
    }
  }
  sheet.appendRow([new Date().toLocaleString(), name, email, opId, eventName, eventDate, 'Pending', '']);
  return createJsonResponse(true, 'Certificate request submitted. Awaiting admin approval.');
}

/** handleCertApprove() — Admin approves or rejects a cert request */
function handleCertApprove(ss, data) {
  var sheet = ss.getSheetByName('Sheet7');
  if (!sheet) return createJsonResponse(false, 'Sheet7 (CertRequests) not found.');
  var rowIndex = parseInt(data.rowIndex);
  var newStatus = (data.status || '').trim();
  var note = (data.note || '').trim();
  if (!rowIndex || rowIndex < 2) return createJsonResponse(false, 'Invalid row.');
  if (newStatus !== 'Approved' && newStatus !== 'Rejected') return createJsonResponse(false, 'Status must be Approved or Rejected.');
  sheet.getRange(rowIndex, 7).setValue(newStatus);
  if (note) sheet.getRange(rowIndex, 8).setValue(note);
  return createJsonResponse(true, 'Certificate request ' + newStatus.toLowerCase() + '.');
}

/** handleGetCertRequests() — List all cert requests (admin) */
function handleGetCertRequests(ss) {
  var sheet = ss.getSheetByName('Sheet7');
  if (!sheet) return createJsonResponse(true, 'No requests yet.', { requests: [] });
  var allData = sheet.getDataRange().getValues();
  var requests = [];
  for (var i = 1; i < allData.length; i++) {
    requests.push({
      rowIndex:    i + 1,
      timestamp:   (allData[i][0] || '').toString().trim(),
      memberName:  (allData[i][1] || '').toString().trim(),
      memberEmail: (allData[i][2] || '').toString().trim(),
      operativeId: (allData[i][3] || '').toString().trim(),
      eventName:   (allData[i][4] || '').toString().trim(),
      eventDate:   (allData[i][5] || '').toString().trim(),
      status:      (allData[i][6] || '').toString().trim(),
      adminNote:   (allData[i][7] || '').toString().trim()
    });
  }
  return createJsonResponse(true, 'Cert requests fetched.', { requests: requests });
}

/** handleMyCertStatus() — Member checks their cert request status */
function handleMyCertStatus(ss, params) {
  var email = (params.email || '').trim().toLowerCase();
  if (!email) return createJsonResponse(false, 'Email is required.');
  var sheet = ss.getSheetByName('Sheet7');
  if (!sheet) return createJsonResponse(true, 'No requests found.', { requests: [] });
  var allData = sheet.getDataRange().getValues();
  var results = [];
  for (var i = 1; i < allData.length; i++) {
    var rEmail = (allData[i][2] || '').toString().trim().toLowerCase();
    if (rEmail === email) {
      results.push({
        eventName:  (allData[i][4] || '').toString().trim(),
        eventDate:  (allData[i][5] || '').toString().trim(),
        status:     (allData[i][6] || '').toString().trim(),
        adminNote:  (allData[i][7] || '').toString().trim()
      });
    }
  }
  return createJsonResponse(true, 'Status fetched.', { requests: results });
}

/**
 * ═══════════════════════════════════════════════════════════════
 *  handleGetProfileByEmail() — Lookup member by email
 * ═══════════════════════════════════════════════════════════════
 */
function handleGetProfileByEmail(sheet, params) {
  var email = (params.email || '').trim().toLowerCase();
  if (!email) {
    return createJsonResponse(false, 'Missing email parameter.');
  }
  var allData = sheet.getDataRange().getValues();
  for (var i = 1; i < allData.length; i++) {
    var rowEmail = (allData[i][2] || '').toString().trim().toLowerCase();
    if (rowEmail === email) {
      return createJsonResponse(true, 'Profile found.', {
        name:        (allData[i][1]  || '').toString().trim(),
        email:       (allData[i][2]  || '').toString().trim(),
        phone:       (allData[i][3]  || '').toString().trim(),
        year:        (allData[i][4]  || '').toString().trim(),
        branch:      (allData[i][5]  || '').toString().trim(),
        operativeId: (allData[i][12] || '').toString().trim(),
        status:      (allData[i][10] || '').toString().trim()
      });
    }
  }
  return createJsonResponse(false, 'No member found with email: ' + email);
}

/**
 * ═══════════════════════════════════════════════════════════════
 *  DOCUMENT REQUEST SYSTEM (Sheet5: DocRequests)
 *  Headers: Timestamp | RequestID | Name | Email | Branch | Year | Role | Event | Dates | Status
 * ═══════════════════════════════════════════════════════════════
 */

function getOrCreateDocSheet(ss) {
  var sheet = ss.getSheetByName('Sheet5');
  if (!sheet) {
    sheet = ss.insertSheet('Sheet5');
    sheet.getRange(1, 1, 1, 10).setValues([['Timestamp', 'RequestID', 'Name', 'Email', 'Branch', 'Year', 'Role', 'Event', 'Dates', 'Status']]);
  }
  return sheet;
}

function handleDocRequest(ss, data) {
  var sheet = getOrCreateDocSheet(ss);
  var reqId = 'DOC-' + Date.now().toString(36).toUpperCase();
  var name = (data.name || '').trim();
  var email = (data.email || '').trim();
  var branch = (data.branch || '').trim();
  var year = (data.year || '').trim();
  var role = (data.role || 'Member').trim();
  var event_ = (data.event || '').trim();
  var dates = (data.dates || '').trim();
  if (!name || !email || !event_) {
    return createJsonResponse(false, 'Name, Email, and Event are required.');
  }
  sheet.appendRow([new Date().toISOString(), reqId, name, email, branch, year, role, event_, dates, 'Pending']);
  return createJsonResponse(true, 'Request submitted! Your Request ID: ' + reqId, { requestId: reqId });
}

function handleDocStatus(ss, params) {
  var sheet = getOrCreateDocSheet(ss);
  var email = (params.email || '').trim().toLowerCase();
  var reqId = (params.reqid || '').trim().toUpperCase();
  if (!email && !reqId) return createJsonResponse(false, 'Provide email or reqid parameter.');
  var data = sheet.getDataRange().getValues();
  var results = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowEmail = (row[3] || '').toString().trim().toLowerCase();
    var rowReqId = (row[1] || '').toString().trim().toUpperCase();
    if ((email && rowEmail === email) || (reqId && rowReqId === reqId)) {
      results.push({ requestId: row[1], name: row[2], email: row[3], branch: row[4], year: row[5], role: row[6], event: row[7], dates: row[8], status: row[9] || 'Pending', timestamp: row[0] });
    }
  }
  return createJsonResponse(true, 'Found ' + results.length + ' request(s).', { requests: results });
}

function handleDocRequests(ss) {
  var sheet = getOrCreateDocSheet(ss);
  var data = sheet.getDataRange().getValues();
  var results = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    results.push({ requestId: row[1], name: row[2], email: row[3], branch: row[4], year: row[5], role: row[6], event: row[7], dates: row[8], status: row[9] || 'Pending', timestamp: row[0] });
  }
  return createJsonResponse(true, 'Fetched ' + results.length + ' doc request(s).', { requests: results });
}

function handleDocApprove(ss, data) {
  var sheet = getOrCreateDocSheet(ss);
  var reqId = (data.requestId || '').trim().toUpperCase();
  var newStatus = (data.status || 'Approved').trim();
  if (!reqId) return createJsonResponse(false, 'requestId is required.');
  var allData = sheet.getDataRange().getValues();
  for (var i = 1; i < allData.length; i++) {
    if ((allData[i][1] || '').toString().trim().toUpperCase() === reqId) {
      sheet.getRange(i + 1, 10).setValue(newStatus);
      return createJsonResponse(true, 'Request ' + reqId + ' updated to: ' + newStatus);
    }
  }
  return createJsonResponse(false, 'Request ID not found: ' + reqId);
}

/**
 * ═══════════════════════════════════════════════════════════════
 *  createJsonResponse() — Helper to build CORS-ready JSON output
 * ═══════════════════════════════════════════════════════════════
 *
 *  Google Apps Script doesn't support custom CORS headers directly,
 *  but ContentService.createTextOutput with MIME type JSON works
 *  when the Web App is deployed with "Anyone" access.
 *
 *  For cross-origin GET requests, the frontend uses:
 *    fetch(url, { method: 'GET', redirect: 'follow' })
 *
 *  For cross-origin POST requests, the frontend uses:
 *    fetch(url, { method: 'POST', mode: 'no-cors', ... })
 *    (response is opaque but data IS written to the sheet)
 *
 *  @param {boolean} success  - Whether the operation succeeded
 *  @param {string}  message  - Human-readable message
 *  @param {object}  extras   - Additional key-value pairs to include
 *  @returns {TextOutput}     - JSON response object
 */
function createJsonResponse(success, message, extras) {
  // Build the response object
  const responseObj = {
    success: success,
    message: message
  };

  // Merge any extra fields (like status, name, email, etc.)
  if (extras && typeof extras === 'object') {
    Object.keys(extras).forEach(function(key) {
      responseObj[key] = extras[key];
    });
  }

  // Create the text output with JSON MIME type
  const output = ContentService.createTextOutput(
    JSON.stringify(responseObj)
  );
  output.setMimeType(ContentService.MimeType.JSON);

  return output;
}
