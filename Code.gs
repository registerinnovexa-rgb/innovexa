// Innovexa Hub — Google Apps Script Backend
// Sheet columns: A:Timestamp B:Name C:Email D:Phone E:Year F:Branch G:SkillLevel H:DOB I:Interests J:UTR K:Status L:Amount M:Operative_id N:PhotoURL O:PaymentProofURL P:Gender Q:ForgeRole R:LinkedMentor

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

function doGet(e) {
  try {
    var ss     = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var sheet  = ss.getSheetByName('Members') || ss.getSheetByName('Sheet1') || sheets[0];
    var p      = e.parameter || {};
    var action = p.action;

    // Debug — list all sheet names
    if (action === 'debug') {
      var names = sheets.map(function(s) { return s.getName(); });
      return respond({ success: true, sheets: names, total: sheets.length });
    }

    // Debug — see first 5 emails
    if (action === 'debugemails') {
      var rows = sheet.getDataRange().getValues();
      var emails = [];
      for (var j = 1; j < Math.min(6, rows.length); j++) {
        emails.push({ row: j+1, colC: rows[j][2], colJ: rows[j][9] });
      }
      return respond({ success: true, samples: emails });
    }

    // Count members
    if (action === 'count' || (!p.email && !p.utr && !action)) {
      var rows = sheet.getDataRange().getValues();
      return respond({ success: true, data: { count: Math.max(0, rows.length - 1) } });
    }

    // Existing: Search by email or UTR
    if (p.email || p.utr) {
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row        = rows[i];
        var rowEmail   = String(row[2] || '').trim().toLowerCase();
        var rowUtr     = String(row[9] || '').trim();
        var matchEmail = p.email && rowEmail === String(p.email).trim().toLowerCase();
        var matchUtr   = p.utr   && rowUtr   === String(p.utr).trim();

        if (matchEmail || matchUtr) {
          return respond({
            success: true,
            found:   true,
            data: {
              name:           String(row[1]  || ''),
              email:          String(row[2]  || ''),
              phone:          String(row[3]  || ''),
              year:           String(row[4]  || ''),
              branch:         String(row[5]  || ''),
              skillLevel:     String(row[6]  || ''),
              dob:            String(row[7]  || ''),
              interests:      String(row[8]  || ''),
              utr:            String(row[9]  || ''),
              status:         String(row[10] || 'Pending'),
              amount:         String(row[11] || ''),
              operativeId:    String(row[12] || ''),
              photoUrl:       String(row[13] || ''),
              paymentProofUrl:String(row[14] || ''),
              gender:         String(row[15] || ''),
              forgeRole:      String(row[16] || ''),
              linkedMentor:   String(row[17] || '')
            }
          });
        }
      }
      if (!action) return respond({ success: false, found: false, message: 'No member found.' });
    }

    // FORGE: Login
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

        if (rowOpId === reqOpId && rowEmail === reqEmail) {
          if (status !== 'Approved' && status !== 'Confirmed') {
            return respond({ success: false, message: 'Access Denied. Your application may not be approved yet.' });
          }
          return respond({
            success: true,
            data: {
              name: String(row[1] || ''),
              operativeId: rowOpId,
              forgeRole: String(row[16] || ''),
              linkedMentor: String(row[17] || '')
            }
          });
        }
      }
      return respond({ success: false, message: 'Invalid INVX ID or Email.' });
    }

    // FORGE: Get Mentors
    if (action === 'forge_get_mentors') {
      var rows = sheet.getDataRange().getValues();
      var mentors = [];
      for (var i = 1; i < rows.length; i++) {
        var role = String(rows[i][16] || '').trim();
        var status = String(rows[i][10] || '').trim();
        if (role === 'Mentor' && (status === 'Approved' || status === 'Confirmed')) {
          mentors.push({
            name: String(rows[i][1] || ''),
            operativeId: String(rows[i][12] || '')
          });
        }
      }
      return respond({ success: true, data: mentors });
    }

    // FORGE: Get Member Profile
    if (action === 'forge_get_member_profile') {
      if (!p.operativeId) return respond({ success: false, message: 'Missing operativeId.' });
      var rows = sheet.getDataRange().getValues();
      var profile = null;
      var linkedMentorName = '';
      
      for (var i = 1; i < rows.length; i++) {
        var rowOpId = String(rows[i][12] || '').trim().toUpperCase();
        if (rowOpId === String(p.operativeId).trim().toUpperCase()) {
          profile = {
            name: String(rows[i][1] || ''),
            operativeId: rowOpId,
            forgeRole: String(rows[i][16] || ''),
            linkedMentor: String(rows[i][17] || '')
          };
          break;
        }
      }
      
      if (profile && profile.linkedMentor) {
        for (var j = 1; j < rows.length; j++) {
          if (String(rows[j][12] || '').trim().toUpperCase() === profile.linkedMentor.toUpperCase()) {
            profile.linkedMentorName = String(rows[j][1] || '');
            break;
          }
        }
      }
      
      if (profile) return respond({ success: true, data: profile });
      return respond({ success: false, message: 'Profile not found.' });
    }

    // FORGE: Get Feed
    if (action === 'forge_get_feed') {
      var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Message', 'OperativeId', 'Name']);
      var rows = feedSheet.getDataRange().getValues();
      var feed = [];
      var start = Math.max(1, rows.length - 30);
      for (var i = rows.length - 1; i >= start; i--) {
        feed.push({
          timestamp: String(rows[i][0] || ''),
          type: String(rows[i][1] || ''),
          message: String(rows[i][2] || ''),
          operativeId: String(rows[i][3] || ''),
          name: String(rows[i][4] || '')
        });
      }
      return respond({ success: true, data: feed });
    }

    // FORGE: Get SOS
    if (action === 'forge_get_sos') {
      var sosSheet = getOrCreateSheet(ss, 'Forge_SOS', ['Timestamp', 'OperativeId', 'Name', 'Title', 'Description', 'Status', 'HelperOperativeId', 'HelperName']);
      var rows = sosSheet.getDataRange().getValues();
      var sosList = [];
      for (var i = rows.length - 1; i >= 1; i--) {
        var status = String(rows[i][5] || '').toLowerCase();
        if (status === 'open') {
          sosList.push({
            rowIndex: i + 1,
            timestamp: String(rows[i][0] || ''),
            operativeId: String(rows[i][1] || ''),
            name: String(rows[i][2] || ''),
            title: String(rows[i][3] || ''),
            description: String(rows[i][4] || ''),
            status: status
          });
        }
      }
      return respond({ success: true, data: sosList });
    }

    // FORGE: Get Bounties
    if (action === 'forge_get_bounties') {
      var bountySheet = getOrCreateSheet(ss, 'Forge_Bounties', ['Timestamp', 'PostedBy', 'PostedByName', 'Title', 'Description', 'XP', 'Status', 'ClaimedBy', 'ClaimedByName']);
      var rows = bountySheet.getDataRange().getValues();
      var bounties = [];
      for (var i = rows.length - 1; i >= 1; i--) {
        var status = String(rows[i][6] || '').toLowerCase();
        if (status === 'open' || status === 'claimed') {
          bounties.push({
            rowIndex: i + 1,
            timestamp: String(rows[i][0] || ''),
            postedBy: String(rows[i][1] || ''),
            postedByName: String(rows[i][2] || ''),
            title: String(rows[i][3] || ''),
            description: String(rows[i][4] || ''),
            xp: String(rows[i][5] || ''),
            status: status,
            claimedBy: String(rows[i][7] || ''),
            claimedByName: String(rows[i][8] || '')
          });
        }
      }
      return respond({ success: true, data: bounties });
    }

    // FORGE: Get Apprentices
    if (action === 'forge_get_apprentices') {
      if (!p.mentorOperativeId) return respond({ success: false, message: 'Missing mentorOperativeId.' });
      var rows = sheet.getDataRange().getValues();
      var apprentices = [];
      for (var i = 1; i < rows.length; i++) {
        var linked = String(rows[i][17] || '').trim().toUpperCase();
        if (linked === String(p.mentorOperativeId).trim().toUpperCase()) {
          apprentices.push({
            name: String(rows[i][1] || ''),
            operativeId: String(rows[i][12] || '')
          });
        }
      }
      return respond({ success: true, data: apprentices });
    }

    // FORGE: Get all roles for Admin Panel
    if (action === 'forge_get_all_roles') {
      var rows = sheet.getDataRange().getValues();
      var rolesMap = {};
      for (var i = 1; i < rows.length; i++) {
        var opId = String(rows[i][12] || '').trim();
        if (opId) {
          rolesMap[opId] = {
            forgeRole: String(rows[i][16] || '').trim(),
            linkedMentor: String(rows[i][17] || '').trim()
          };
        }
      }
      return respond({ success: true, data: rolesMap });
    }

    return respond({ success: false, message: 'Unknown action.' });

  } catch (err) {
    return respond({ success: false, message: 'Error: ' + err.toString() });
  }
}

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Members') || ss.getSheetByName('Sheet1') || ss.getSheets()[0];
    var data  = JSON.parse(e.postData.contents || '{}');
    var payload = data.payload || data;
    var action = payload.action || data.action || '';
    var timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // FORGE: Set Role
    if (action === 'forge_set_role') {
      var rows = sheet.getDataRange().getValues();
      var found = false;
      var name = '';
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][12] || '').trim().toUpperCase() === String(payload.operativeId).trim().toUpperCase()) {
          sheet.getRange(i + 1, 17).setValue(payload.forgeRole); // Col Q
          name = String(rows[i][1] || '');
          found = true;
          break;
        }
      }
      if (found) {
        var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Message', 'OperativeId', 'Name']);
        feedSheet.appendRow([timestamp, 'ROLE_ASSIGNED', 'Operative ' + name + ' assigned role: ' + payload.forgeRole, payload.operativeId, name]);
        return respond({ success: true, message: 'Role updated.' });
      }
      return respond({ success: false, message: 'Operative not found.' });
    }

    // FORGE: Link Mentor
    if (action === 'forge_link_mentor') {
      var rows = sheet.getDataRange().getValues();
      var found = false;
      var memberName = '';
      var mentorName = '';
      
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][12] || '').trim().toUpperCase() === String(payload.mentorOperativeId).trim().toUpperCase()) {
          mentorName = String(rows[i][1] || '');
        }
      }
      
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][12] || '').trim().toUpperCase() === String(payload.memberOperativeId).trim().toUpperCase()) {
          sheet.getRange(i + 1, 18).setValue(payload.mentorOperativeId); // Col R
          memberName = String(rows[i][1] || '');
          found = true;
          break;
        }
      }
      
      if (found) {
        var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Message', 'OperativeId', 'Name']);
        feedSheet.appendRow([timestamp, 'MENTOR_LINKED', 'Operative ' + memberName + ' linked to Mentor ' + mentorName, payload.memberOperativeId, memberName]);
        return respond({ success: true, message: 'Mentor linked.' });
      }
      return respond({ success: false, message: 'Operative not found.' });
    }

    // FORGE: Post SOS
    if (action === 'forge_post_sos') {
      var sosSheet = getOrCreateSheet(ss, 'Forge_SOS', ['Timestamp', 'OperativeId', 'Name', 'Title', 'Description', 'Status', 'HelperOperativeId', 'HelperName']);
      sosSheet.appendRow([timestamp, payload.operativeId, payload.name, payload.title, payload.description, 'open', '', '']);
      var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Message', 'OperativeId', 'Name']);
      feedSheet.appendRow([timestamp, 'SOS', payload.name + ' fired an SOS Flare: ' + payload.title, payload.operativeId, payload.name]);
      return respond({ success: true, message: 'SOS posted.' });
    }

    // FORGE: Resolve SOS
    if (action === 'forge_resolve_sos') {
      var sosSheet = getOrCreateSheet(ss, 'Forge_SOS', ['Timestamp', 'OperativeId', 'Name', 'Title', 'Description', 'Status', 'HelperOperativeId', 'HelperName']);
      sosSheet.getRange(payload.rowIndex, 6).setValue('resolved');
      sosSheet.getRange(payload.rowIndex, 7).setValue(payload.helperOperativeId);
      sosSheet.getRange(payload.rowIndex, 8).setValue(payload.helperName);
      
      var sosRow = sosSheet.getRange(payload.rowIndex, 1, 1, 8).getValues()[0];
      var requesterName = sosRow[2];
      
      var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Message', 'OperativeId', 'Name']);
      feedSheet.appendRow([timestamp, 'SOS_RESOLVED', payload.helperName + ' resolved ' + requesterName + "'s SOS Flare", payload.helperOperativeId, payload.helperName]);
      return respond({ success: true, message: 'SOS resolved.' });
    }

    // FORGE: Post Bounty
    if (action === 'forge_post_bounty') {
      var bountySheet = getOrCreateSheet(ss, 'Forge_Bounties', ['Timestamp', 'PostedBy', 'PostedByName', 'Title', 'Description', 'XP', 'Status', 'ClaimedBy', 'ClaimedByName']);
      bountySheet.appendRow([timestamp, payload.operativeId, payload.name, payload.title, payload.description, payload.xp, 'open', '', '']);
      var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Message', 'OperativeId', 'Name']);
      feedSheet.appendRow([timestamp, 'BOUNTY_POSTED', 'Mentor ' + payload.name + ' posted bounty: ' + payload.title + ' (+' + payload.xp + ' XP)', payload.operativeId, payload.name]);
      return respond({ success: true, message: 'Bounty posted.' });
    }

    // FORGE: Claim Bounty
    if (action === 'forge_claim_bounty') {
      var bountySheet = getOrCreateSheet(ss, 'Forge_Bounties', ['Timestamp', 'PostedBy', 'PostedByName', 'Title', 'Description', 'XP', 'Status', 'ClaimedBy', 'ClaimedByName']);
      bountySheet.getRange(payload.rowIndex, 7).setValue('claimed');
      bountySheet.getRange(payload.rowIndex, 8).setValue(payload.operativeId);
      bountySheet.getRange(payload.rowIndex, 9).setValue(payload.name);
      
      var title = bountySheet.getRange(payload.rowIndex, 4).getValue();
      
      var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Message', 'OperativeId', 'Name']);
      feedSheet.appendRow([timestamp, 'BOUNTY_CLAIMED', 'Operative ' + payload.name + ' claimed bounty: ' + title, payload.operativeId, payload.name]);
      return respond({ success: true, message: 'Bounty claimed.' });
    }

    // FORGE: Complete Bounty
    if (action === 'forge_complete_bounty') {
      var bountySheet = getOrCreateSheet(ss, 'Forge_Bounties', ['Timestamp', 'PostedBy', 'PostedByName', 'Title', 'Description', 'XP', 'Status', 'ClaimedBy', 'ClaimedByName']);
      bountySheet.getRange(payload.rowIndex, 7).setValue('completed');
      var title = bountySheet.getRange(payload.rowIndex, 4).getValue();
      
      var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Message', 'OperativeId', 'Name']);
      feedSheet.appendRow([timestamp, 'BOUNTY_COMPLETED', 'Bounty completed: ' + title, '', '']);
      return respond({ success: true, message: 'Bounty completed.' });
    }

    // ORIGINAL: Registration logic
    if (!action) {
      // Duplicate email / UTR check
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][2]).toLowerCase() === String(payload.email || '').toLowerCase()) {
          return respond({ success: false, message: 'Email already registered.' });
        }
        if (payload.utr && String(rows[i][9]).trim() === String(payload.utr).trim()) {
          return respond({ success: false, message: 'UTR already submitted.' });
        }
      }

      var nextNum     = sheet.getLastRow();
      var operativeId = 'INVX-' + String(nextNum).padStart(3, '0');

      sheet.appendRow([
        timestamp,
        payload.fullName    || '',
        payload.email       || '',
        payload.phone       || '',
        payload.year        || '',
        payload.branch      || '',
        payload.skillLevel  || '',
        payload.dob         || '',
        payload.interests   || '',
        payload.utr         || '',
        'Pending',
        payload.amount      || '599',
        operativeId,
        payload.photoUrl    || '',
        payload.paymentUrl  || '',
        payload.gender      || ''
      ]);

      try {
        MailApp.sendEmail({
          to:      payload.email,
          subject: 'Innovexa Hub — Registration Received! ID: ' + operativeId,
          body:    'Hi ' + (payload.fullName || '') + ',\n\nYour Operative ID: ' + operativeId + '\n\nCheck status: https://innovexareg.vercel.app/status.html\n\n— Innovexa Hub'
        });
      } catch (_) {}

      return respond({ success: true, message: 'Registered!', data: { operativeId: operativeId } });
    }
    
    return respond({ success: false, message: 'Unknown POST action.' });

  } catch (err) {
    return respond({ success: false, message: 'Error: ' + err.toString() });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
