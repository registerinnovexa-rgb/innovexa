/**
 * ═══════════════════════════════════════════════════════════════════
 *  INNOVEXA LABS — Google Apps Script Backend (Code.gs)
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
 *  2. Name it "Innovexa Labs - Registrations"
 *  3. In Row 1, add these 8 column headers:
 *     A1: Timestamp
 *     B1: Name
 *     C1: Email
 *     D1: Phone
 *     E1: Year
 *     F1: Interests
 *     G1: UTR
 *     H1: Status
 *
 *  Step 2: Add This Script
 *  ───────────────────────
 *  4. Go to Extensions → Apps Script
 *  5. Delete everything in Code.gs and paste this entire file
 *  6. Save the project (Ctrl+S)
 *
 *  Step 3: Deploy as Web App
 *  ─────────────────────────
 *  7. Click Deploy → New Deployment
 *  8. Click the gear icon → Select type: "Web app"
 *  9. Set "Description": "Innovexa Labs Registration API"
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
// The script auto-detects the active spreadsheet.
// If you want to target a specific sheet tab, change the name below.
const SHEET_NAME = 'Sheet1';


/**
 * ═══════════════════════════════════════════════════════════════
 *  doPost(e) — Handle Registration Submissions
 * ═══════════════════════════════════════════════════════════════
 *
 *  Receives a POST request with JSON body containing:
 *  { fullName, email, phone, year, interests, utr }
 *
 *  Appends a new row to the sheet with columns:
 *  [Timestamp, Name, Email, Phone, Year, Interests, UTR, Status]
 *
 *  The Status column is hardcoded to "Pending" on every new entry.
 *  The admin manually updates this to "Confirmed" in the sheet
 *  after verifying the payment.
 */
function doPost(e) {
  try {
    // Parse the incoming JSON payload from the frontend
    const data = JSON.parse(e.postData.contents);

    // Get the spreadsheet and target sheet
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    // Verify the sheet exists
    if (!sheet) {
      return createJsonResponse(false, 'Sheet not found: ' + SHEET_NAME);
    }

    // ── Duplicate UTR Check ──────────────────────────────────
    // Prevent the same transaction ID from being submitted twice.
    // Column J (index 9) holds UTR values.
    const allData = sheet.getDataRange().getValues();
    for (let i = 1; i < allData.length; i++) {  // Start at 1 to skip header row
      if (allData[i][9] === data.utr) {          // Column J = index 9
        return createJsonResponse(false, 'This UTR has already been submitted: ' + data.utr);
      }
    }

    // ── Append New Row ───────────────────────────────────────
    // Columns: [Timestamp, Name, Email, Phone, Year, Branch, SkillLevel, DOB, Interests, UTR, Status, Amount]
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
      data.amount     || ''                                               // L: Amount
    ]);

    // Return success response
    return createJsonResponse(true, 'Registration saved successfully!');

  } catch (error) {
    // Log the error for debugging in Apps Script logs
    Logger.log('doPost Error: ' + error.toString());
    return createJsonResponse(false, 'Server error: ' + error.toString());
  }
}


/**
 * ═══════════════════════════════════════════════════════════════
 *  doGet(e) — Handle Status Check Queries
 * ═══════════════════════════════════════════════════════════════
 *
 *  Accepts a GET request with one query parameter:
 *  - ?email=user@example.com  — searches by email (Column C)
 *  - ?utr=412345678901        — searches by UTR   (Column G)
 *
 *  If found, returns the Status column value for that row.
 *  If not found, returns an error message.
 *
 *  The frontend uses this to display:
 *  - Yellow "Pending Verification" status
 *  - Green "Registration Confirmed" status
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
      return createJsonResponse(true, 'Innovexa Labs Registration API is running. Use ?email= or ?utr= or ?action=count to query.');
    }

    // Handle Member Count Request
    if (e.parameter.action === 'count') {
      const lastRow = sheet.getLastRow();
      const count = lastRow > 1 ? lastRow - 1 : 0; // Subtract header row
      return createJsonResponse(true, 'Member count fetched.', { count: count });
    }

    const emailQuery = (e.parameter.email || '').trim().toLowerCase();
    const utrQuery   = (e.parameter.utr   || '').trim();

    // Validate that at least one query parameter is provided
    if (!emailQuery && !utrQuery) {
      return createJsonResponse(false, 'Please provide an email, UTR, or action parameter.');
    }

    // ── Search the Sheet ─────────────────────────────────────
    // Get all data (including headers)
    const allData = sheet.getDataRange().getValues();

    // Iterate through rows (skip header at index 0)
    for (let i = 1; i < allData.length; i++) {
      const rowEmail  = (allData[i][2]  || '').toString().trim().toLowerCase();  // Column C = Email
      const rowUTR   = (allData[i][9]  || '').toString().trim();                // Column J = UTR
      const rowName  = (allData[i][1]  || '').toString().trim();                // Column B = Name
      const rowStatus = (allData[i][10] || '').toString().trim();               // Column K = Status

      // Check if the email matches
      if (emailQuery && rowEmail === emailQuery) {
        return createJsonResponse(true, 'Status found.', {
          status: rowStatus,
          name: rowName,
          email: rowEmail
        });
      }

      // Check if the UTR matches
      if (utrQuery && rowUTR === utrQuery) {
        return createJsonResponse(true, 'Status found.', {
          status: rowStatus,
          name: rowName,
          utr: rowUTR
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
