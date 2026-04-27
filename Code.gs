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

    // ── Handle Profile Update ────────────────────────────────
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

  return createJsonResponse(false, 'Unknown admin operation.');
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

      // Check if the email matches
      if (emailQuery && rowEmail === emailQuery) {
        return createJsonResponse(true, 'Status found.', {
          status: rowStatus,
          name: rowName,
          email: rowEmail,
          phone: rowPhone,
          dob: rowDob,
          id: rowOpId
        });
      }

      // Check if the UTR matches
      if (utrQuery && rowUTR === utrQuery) {
        return createJsonResponse(true, 'Status found.', {
          status: rowStatus,
          name: rowName,
          utr: rowUTR,
          id: rowOpId
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

    if (rowOpId === id && rowEmail === email && rowPhone === phone) {
      return createJsonResponse(true, 'Verification successful.', {
        name: rowName,
        operativeId: rowOpId,
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
