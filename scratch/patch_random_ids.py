import re

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    code = f.read()

# 1. Replace the operativeId generation
old_id_gen = """      var nextNum     = sheet.getLastRow();
      var operativeId = 'INVX-' + String(nextNum).padStart(3, '0');"""

new_id_gen = """      // Generate a Random 5-character Alphanumeric ID
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var randomStr = '';
      for (var k = 0; k < 5; k++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      var operativeId = 'INVX-' + randomStr;"""

code = code.replace(old_id_gen, new_id_gen)

# 2. Add the Migration Script
migration_script = """

// ==========================================
// MIGRATION SCRIPT: Run this ONCE to randomize existing IDs
// ==========================================
function MIGRATION_UpdateAllIDsToRandom() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Registrations") || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  // Start from row 2 (index 1) to skip headers
  for (var i = 1; i < data.length; i++) {
    var currentId = data[i][12]; // Column M is index 12
    if (currentId && String(currentId).startsWith("INVX-")) {
      var randomStr = '';
      for (var k = 0; k < 5; k++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      var newId = 'INVX-' + randomStr;
      
      // Update Column M (which is column number 13)
      sheet.getRange(i + 1, 13).setValue(newId);
    }
  }
}
"""

if "MIGRATION_UpdateAllIDsToRandom" not in code:
    code += migration_script

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
    f.write(code)

print("Code.gs patched for Random IDs!")
