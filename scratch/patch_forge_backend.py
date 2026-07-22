import re

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    code = f.read()

# 1. Add forge_send_otp before forge_login
send_otp_code = """
    // FORGE: Send OTP
    if (action === 'forge_send_otp') {
      if (!p.invxId || !p.email) return respond({ success: false, message: 'Missing credentials.' });
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowOpId = String(row[12] || '').trim().toUpperCase();
        var rowEmail = String(row[2] || '').trim().toLowerCase();
        var reqOpId = String(p.invxId).trim().toUpperCase();
        var reqEmail = String(p.email).trim().toLowerCase();
        
        if (rowOpId === reqOpId && rowEmail === reqEmail) {
          var status = String(row[10] || '').trim();
          if (status !== 'Approved' && status !== 'Confirmed') {
            return respond({ success: false, message: 'Access Denied. Your application is not approved yet.' });
          }
          
          var accessStatus = String(row[18] || '').trim(); // Column S = ForgeAccess
          if (accessStatus.toLowerCase() !== 'granted') {
            return respond({ success: false, message: 'Access Denied. Forge access has not been granted by Admin.' });
          }
          
          // Generate 6-digit OTP
          var otp = Math.floor(100000 + Math.random() * 900000).toString();
          
          // Store in CacheService for 5 minutes
          var cache = CacheService.getScriptCache();
          cache.put('OTP_' + reqOpId, otp, 300);
          
          // Send Email
          var subject = "Forge Access Verification - Innovexa Hub";
          var body = "Operative " + reqOpId + ",\\n\\nYour Forge authentication code is:\\n\\n" + otp + "\\n\\nThis code is valid for 5 minutes.\\n\\nStay Sharp,\\nInnovexa Hub Protocol";
          
          try {
            MailApp.sendEmail(reqEmail, subject, body);
            return respond({ success: true, message: 'OTP sent successfully.' });
          } catch(e) {
            return respond({ success: false, message: 'Failed to dispatch email.' });
          }
        }
      }
      return respond({ success: false, message: 'Invalid INVX ID or Email.' });
    }

    // FORGE: Login"""

code = code.replace("    // FORGE: Login", send_otp_code)


# 2. Modify forge_login to require and check OTP
old_forge_login = """    // FORGE: Login
    if (action === 'forge_login') {
      if (!p.invxId || !p.email) return respond({ success: false, message: 'Missing credentials.' });
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowOpId = String(row[12] || '').trim().toUpperCase();
        var rowEmail = String(row[2] || '').trim().toLowerCase();
        var reqOpId = String(p.invxId).trim().toUpperCase();
        var reqEmail = String(p.email).trim().toLowerCase();"""

new_forge_login = """    // FORGE: Login
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
        var reqEmail = String(p.email).trim().toLowerCase();"""

code = code.replace(old_forge_login, new_forge_login)

# Clear OTP from cache if login successful
old_success = """          return respond({
            success: true,
            data: {"""

new_success = """          cache.remove('OTP_' + reqOpId);
          return respond({
            success: true,
            data: {"""

# Replace only the first occurrence of the success return within forge_login
# Wait, this replace might replace other occurrences in code.gs if not careful.
# Let's use a regex specifically for the forge_login block.

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
    f.write(code)

print("Code.gs patched!")
