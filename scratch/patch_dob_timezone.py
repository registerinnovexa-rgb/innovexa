import re

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    code = f.read()

# 1. Update Date parsing
old_date = """        // Google Sheets sometimes formats dates weirdly, so we compare the first 10 characters (YYYY-MM-DD)
        // Or if it's an object, we convert to ISO string.
        var rowDobStr = "";
        if (rowDob) {
          if (rowDob instanceof Date) {
            rowDobStr = rowDob.toISOString().split('T')[0];
          } else {
            rowDobStr = rowDob.substring(0, 10);
          }
        }"""

new_date = """        // Google Sheets sometimes formats dates weirdly, so we compare the first 10 characters (YYYY-MM-DD)
        // Extract local timezone date instead of UTC toISOString() to avoid off-by-one errors
        var rowDobStr = "";
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
                var parts = ds.split(/[\-\/]/);
                rowDobStr = parts[2] + '-' + parts[1] + '-' + parts[0];
            } else {
                rowDobStr = ds.substring(0, 10);
            }
          }
        }"""

code = code.replace(old_date, new_date)

# 2. Update error message
old_err = "return respond({ success: false, message: 'Invalid INVX ID or Email.' });"
new_err = "return respond({ success: false, message: 'Invalid INVX ID or Date of Birth.' });"

code = code.replace(old_err, new_err)

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
    f.write(code)

print("Code.gs patched for date timezone bug!")
