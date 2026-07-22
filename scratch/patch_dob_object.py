import re

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    code = f.read()

old_dob_var = "var rowDob = String(row[7] || '').trim();"
new_dob_var = "var rowDob = row[7];"

code = code.replace(old_dob_var, new_dob_var)

# Let's also make sure the time parsing logic is bulletproof
old_date_logic = """        var rowDobStr = "";
        if (rowDob) {
          if (rowDob instanceof Date) {
            var y = rowDob.getFullYear();
            var m = String(rowDob.getMonth() + 1).padStart(2, '0');
            var d = String(rowDob.getDate()).padStart(2, '0');
            rowDobStr = y + '-' + m + '-' + d;
          } else {
            // Try to match DD-MM-YYYY or DD/MM/YYYY
            var ds = String(rowDob).trim();
            if (ds.length >= 10 && ds.charAt(2) === '-' || ds.charAt(2) === '/') {
                var parts = ds.split(/[\\-\\/]/);
                rowDobStr = parts[2] + '-' + parts[1] + '-' + parts[0];
            } else {
                rowDobStr = ds.substring(0, 10);
            }
          }
        }"""

new_date_logic = """        var rowDobStr = "";
        if (rowDob) {
          if (rowDob instanceof Date || Object.prototype.toString.call(rowDob) === '[object Date]') {
            var y = rowDob.getFullYear();
            var m = String(rowDob.getMonth() + 1).padStart(2, '0');
            var d = String(rowDob.getDate()).padStart(2, '0');
            rowDobStr = y + '-' + m + '-' + d;
          } else {
            var ds = String(rowDob).trim();
            // Handle if Google Sheets casted Date to String like "Sat May 15 2004"
            var parsed = new Date(ds);
            if (!isNaN(parsed.getTime())) {
                var y = parsed.getFullYear();
                var m = String(parsed.getMonth() + 1).padStart(2, '0');
                var d = String(parsed.getDate()).padStart(2, '0');
                rowDobStr = y + '-' + m + '-' + d;
            } else if (ds.length >= 10 && (ds.charAt(2) === '-' || ds.charAt(2) === '/')) {
                // DD-MM-YYYY format
                var parts = ds.split(/[\\-\\/]/);
                rowDobStr = parts[2] + '-' + parts[1] + '-' + parts[0];
            } else {
                rowDobStr = ds.substring(0, 10);
            }
          }
        }"""

code = code.replace(old_date_logic, new_date_logic)

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
    f.write(code)

print("Code.gs patched for robust DOB parsing!")
