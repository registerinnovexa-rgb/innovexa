with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    content = f.read()

# Fix forge_login in Code.gs
old_forge_login = """    // FORGE: Login
    if (action === 'forge_login') {
      if (!p.invxId || !p.email) return respond({ success: false, message: 'Missing credentials.' });
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowOpId = String(row[12] || '').trim().toUpperCase();
        var rowEmail = String(row[2] || '').trim().toLowerCase();
        var reqOpId = String(p.invxId).trim().toUpperCase();
        var reqEmail = String(p.email).trim().toLowerCase();
        var status = String(row[10] || '').trim();
        var forgeAccess = String(row[16] || '').trim(); // Column Q

        if (rowOpId === reqOpId && rowEmail === reqEmail) {
          if (status !== 'Approved' && status !== 'Confirmed') {
            return respond({ success: false, message: 'Access Denied. Your application is not approved yet.' });
          }
          var forgeAccess = String(row[18] || '').trim(); // Column S = ForgeAccess
          if (forgeAccess !== 'Granted') {
            return respond({ success: false, message: 'Access Denied. Forge access has not been granted by Admin.' });
          }
          return respond({
            success: true,
            data: {
              name: String(row[1] || ''),
              operativeId: rowOpId,
              forgeAccess: forgeAccess,
              xp: String(row[19] || '0'),          // Column T = XP
              rank: String(row[20] || 'Apprentice'), // Column U = Rank
              squad: String(row[21] || 'Unassigned') // Column V = Squad
            }
          });
        }
      }
      return respond({ success: false, message: 'Invalid INVX ID or Email.' });
    }"""

new_forge_login = """    // FORGE: Login
    if (action === 'forge_login') {
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
          
          return respond({
            success: true,
            data: {
              name: String(row[1] || ''),
              operativeId: rowOpId,
              forgeAccess: accessStatus,
              xp: String(row[19] || '0'),
              rank: String(row[20] || 'Apprentice'),
              squad: String(row[21] || 'Unassigned'),
              role: String(row[16] || '').trim() // Column Q = ForgeRole
            }
          });
        }
      }
      return respond({ success: false, message: 'Invalid INVX ID or Email.' });
    }
    
    // ADMIN: Login
    if (action === 'admin_login') {
      if (!p.invxId || !p.email) return respond({ success: false, message: 'Missing credentials.' });
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowOpId = String(row[12] || '').trim().toUpperCase();
        var rowEmail = String(row[2] || '').trim().toLowerCase();
        var reqOpId = String(p.invxId).trim().toUpperCase();
        var reqEmail = String(p.email).trim().toLowerCase();
        
        if (rowOpId === reqOpId && rowEmail === reqEmail) {
          var role = String(row[16] || '').trim().toLowerCase(); // Column Q
          if (role !== 'admin' && rowOpId !== 'INVX-01') {
            return respond({ success: false, message: 'Access Denied. You do not have Admin privileges.' });
          }
          return respond({
            success: true,
            data: {
              name: String(row[1] || ''),
              operativeId: rowOpId
            }
          });
        }
      }
      return respond({ success: false, message: 'Invalid INVX ID or Email.' });
    }"""

if old_forge_login in content:
    content = content.replace(old_forge_login, new_forge_login)
    with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
        f.write(content)
    print("Patched Code.gs")
else:
    print("Could not find old_forge_login in Code.gs")
