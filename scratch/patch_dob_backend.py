import re

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    code = f.read()

# 1. Remove forge_send_otp
send_otp_pattern = re.compile(r"    // FORGE: Send OTP.*?    // FORGE: Login", re.DOTALL)
code = send_otp_pattern.sub("    // FORGE: Login", code)

# 2. Modify forge_login to use DOB instead of Email and OTP
old_forge_login = """    // FORGE: Login
    if (action === 'forge_login') {
      if (!p.invxId || !p.email || !p.otp) return respond({ success: false, message: 'Missing credentials or OTP.' });
      
      var reqOpId = String(p.invxId).trim().toUpperCase();
      var cache = CacheService.getScriptCache();
      var cachedOtp = cache.get('OTP_' + reqOpId);
      
      if (!cachedOtp || cachedOtp !== String(p.otp).trim()) {
        return respond({ success: false, message: 'Invalid or expired OTP.' });
      }

      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowOpId = String(row[12] || '').trim().toUpperCase();
        var rowEmail = String(row[2] || '').trim().toLowerCase();
        var reqEmail = String(p.email).trim().toLowerCase();
        
        if (rowOpId === reqOpId && rowEmail === reqEmail) {"""

new_forge_login = """    // FORGE: Login
    if (action === 'forge_login') {
      if (!p.invxId || !p.dob) return respond({ success: false, message: 'Missing Operative ID or Date of Birth.' });
      
      var reqOpId = String(p.invxId).trim().toUpperCase();
      var reqDob = String(p.dob).trim();

      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowOpId = String(row[12] || '').trim().toUpperCase();
        var rowDob = String(row[7] || '').trim();
        
        // Google Sheets sometimes formats dates weirdly, so we compare the first 10 characters (YYYY-MM-DD)
        // Or if it's an object, we convert to ISO string.
        var rowDobStr = "";
        if (rowDob) {
          if (rowDob instanceof Date) {
            rowDobStr = rowDob.toISOString().split('T')[0];
          } else {
            rowDobStr = rowDob.substring(0, 10);
          }
        }
        var reqDobStr = reqDob.substring(0, 10);
        
        if (rowOpId === reqOpId && rowDobStr === reqDobStr) {"""

code = code.replace(old_forge_login, new_forge_login)

# Also remove the cache.remove line in forge_login
code = code.replace("          cache.remove('OTP_' + reqOpId);\n", "")

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
    f.write(code)

print("Code.gs patched for DOB login!")
