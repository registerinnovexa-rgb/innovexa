// ═══════════════════════════════════════════════════════════
//  INNOVEXA ATLAS — Google Apps Script
//  Handles interest form submissions → Google Sheet
//
//  SETUP:
//  1. Open Google Sheets → Extensions → Apps Script
//  2. Paste this entire file
//  3. Deploy → New deployment → Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  4. Copy the deployment URL → paste in atlas.html
// ═══════════════════════════════════════════════════════════

const SHEET_NAME = 'Atlas Interests';

// Column headers (in order)
const HEADERS = [
  'Timestamp',
  'First Name',
  'Last Name',
  'Full Name',
  'Email',
  'Phone Number',
  'Operative ID',
  'Current Year',
  'Role Track',
  'Commitment Level',
  'Why This Role',
  'Programme',
  'Status'
];

// ── Entry point for POST requests ──
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    saveToSheet(data);
    return jsonResp({ status: 'ok', message: 'Interest recorded.' });
  } catch (err) {
    return jsonResp({ status: 'error', message: err.message });
  }
}

// ── Entry point for GET requests (health check) ──
function doGet(e) {
  return jsonResp({ status: 'ok', service: 'Innovexa Atlas', time: new Date().toISOString() });
}

// ── Save a submission to the sheet ──
function saveToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet + headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);

    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#0C1220');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);

    // Set column widths
    sheet.setColumnWidth(1, 180);  // Timestamp
    sheet.setColumnWidth(2, 120);  // First Name
    sheet.setColumnWidth(3, 120);  // Last Name
    sheet.setColumnWidth(4, 160);  // Full Name
    sheet.setColumnWidth(5, 220);  // Email
    sheet.setColumnWidth(6, 140);  // Phone Number
    sheet.setColumnWidth(7, 120);  // Operative ID
    sheet.setColumnWidth(8, 100);  // Year
    sheet.setColumnWidth(9, 200);  // Role Track
    sheet.setColumnWidth(10, 120);  // Commitment
    sheet.setColumnWidth(11, 300);  // Why
    sheet.setColumnWidth(12, 120); // Programme
    sheet.setColumnWidth(13, 100); // Status
  }

  const timestamp = data.timestamp
    ? new Date(data.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const row = [
    timestamp,
    data.firstName   || '',
    data.lastName    || '',
    `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    data.email       || '',
    data.phone       || '',
    data.operativeId || '',
    data.year        ? `${data.year}${yearSuffix(data.year)} Year` : '',
    data.role        || '',
    capitalise(data.commitment || ''),
    data.why         || '',
    data.programme   || 'Innovexa Atlas',
    'New'  // default status
  ];

  sheet.appendRow(row);

  // Alternate row shading for readability
  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, HEADERS.length)
      .setBackground('#f7f5f0');
  }

  // Highlight "Serious" commitment in orange
  if ((data.commitment || '').toLowerCase() === 'serious') {
    sheet.getRange(lastRow, 8)
      .setFontColor('#C8490A')
      .setFontWeight('bold');
  }
}

// ── Helpers ──
function jsonResp(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function yearSuffix(year) {
  const n = parseInt(year);
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// ── Run this manually from the editor to update an existing sheet's headers ──
function updateHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (sheet) {
    // Overwrite the first row with the new HEADERS array
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setValues([HEADERS]);
    
    // Re-apply styles
    headerRange.setBackground('#0C1220');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    
    // Update widths for the new columns (Phone Number = 6, Operative ID = 7)
    sheet.setColumnWidth(6, 140);
    sheet.setColumnWidth(7, 120);
    
    Logger.log("Headers updated successfully!");
  } else {
    Logger.log("Sheet not found. It will be created automatically on the first submission.");
  }
}
