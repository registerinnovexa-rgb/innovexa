// Innovexa Hub — Google Apps Script Backend
// Sheet columns: A:Timestamp B:Name C:Email D:Phone E:Year F:Branch G:SkillLevel H:DOB I:Interests J:UTR K:Status L:Amount M:Operative_id N:PhotoURL O:PaymentProofURL P:Gender Q:ForgeRole R:LinkedMentor S:ForgeAccess T:XP U:Rank V:Squad

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

function logOperativeAction(operativeId, name, actionType, description) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = getOrCreateSheet(ss, 'Operative_Audit_Logs', ['Timestamp', 'OperativeID', 'Name', 'ActionType', 'Description']);
    var timestamp = new Date().toISOString();
    logSheet.appendRow([timestamp, operativeId, name, actionType, description]);
  } catch(e) {}
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
    if (action === 'count' || (!p.email && !p.utr && !p.phone && !p.id && !action)) {
      var rows = sheet.getDataRange().getValues();
      return respond({ success: true, data: { count: Math.max(0, rows.length - 1) } });
    }

    // Existing: Search by email or UTR or Phone or ID
    if (p.email || p.utr || p.phone || p.id) {
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row        = rows[i];
        var rowEmail   = String(row[2] || '').trim().toLowerCase();
        var rowPhone   = String(row[3] || '').trim();
        var rowUtr     = String(row[9] || '').trim();
        var rowId      = String(row[12] || '').trim().toUpperCase();
        
        var matchEmail = p.email && rowEmail === String(p.email).trim().toLowerCase();
        var matchPhone = p.phone && rowPhone === String(p.phone).trim();
        var matchUtr   = p.utr   && rowUtr   === String(p.utr).trim();
        var matchId    = p.id    && rowId    === String(p.id).trim().toUpperCase();

        if (matchEmail || matchUtr || matchPhone || matchId) {
          notifySuperAdmin(
            'Operative Status Checked: ' + String(row[1] || ''),
            'A member has checked their application status.\n\n' +
            'Name: ' + String(row[1] || '') + '\n' +
            'Email: ' + String(row[2] || '') + '\n' +
            'Phone: ' + String(row[3] || '') + '\n' +
            'Operative ID: ' + String(row[12] || '') + '\n' +
            'Status: ' + String(row[10] || 'Pending') + '\n' +
            'Forge Access: ' + String(row[18] || '') + '\n' +
            'Rank: ' + String(row[20] || '') + '\n' +
            'Squad: ' + String(row[21] || '')
          );
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
              linkedMentor:   String(row[17] || ''),
              forgeAccess:    String(row[18] || ''),
              college:        String(row[22] || '')
            }
          });
        }
      }
      if (!action) return respond({ success: false, found: false, message: 'No member found.' });
    }


    // FORGE: Request Login OTP
    if (action === 'forge_request_otp') {
      if (!p.invxId) return respond({ success: false, message: 'Missing Operative ID.' });
      var reqOpId = String(p.invxId).trim().toUpperCase();
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        if (String(row[12] || '').trim().toUpperCase() === reqOpId) {
          var userEmail = String(row[2] || '').trim();
          if (!userEmail) return respond({ success: false, message: 'No email associated with this ID.' });
          
          var existingOtp = String(row[24] || '').trim();
          var existingTime = row[25];
          var otp = '';
          
          if (existingOtp && existingTime && (new Date().getTime() - existingTime < 2 * 60 * 1000)) {
            otp = existingOtp; // Reuse recent OTP if requested within 2 mins
          } else {
            otp = Math.floor(100000 + Math.random() * 900000).toString();
            sheet.getRange(i + 1, 25).setValue(otp); // Col Y
            sheet.getRange(i + 1, 26).setValue(new Date().getTime()); // Col Z
          }
          
          try {
            MailApp.sendEmail({
              to: userEmail,
              subject: 'Innovexa Hub — Dashboard Login Code',
              body: 'Your dashboard login code is: ' + otp + '\n\nThis code is valid for 15 minutes.\n\n— Innovexa Hub\n(Sent via innovexahub.bangalore@gmail.com)'
            });
            var parts = userEmail.split('@');
            var maskedEmail = parts[0].substring(0, 2) + '***@' + parts[1];
            return respond({ success: true, message: 'Login code sent to ' + maskedEmail });
          } catch (e) {
            return respond({ success: false, message: 'Failed to send email. ' + e.toString() });
          }
        }
      }
      return respond({ success: false, message: 'Operative ID not found.' });
    }

    // FORGE: Verify Login OTP
    if (action === 'forge_verify_otp') {
      if (!p.invxId || !p.otp) return respond({ success: false, message: 'Missing fields.' });
      var reqOpId = String(p.invxId).trim().toUpperCase();
      var reqOtp = String(p.otp).trim();
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        if (String(row[12] || '').trim().toUpperCase() === reqOpId) {
          var storedOtp = String(row[24] || '').trim(); // Col Y
          var storedTime = row[25]; // Col Z
          
          if (!storedOtp || storedOtp !== reqOtp) {
            return respond({ success: false, message: 'Invalid login code.' });
          }
          if (new Date().getTime() - storedTime > 15 * 60 * 1000) {
            return respond({ success: false, message: 'Login code expired. Please request a new one.' });
          }
          
          var status = String(row[10] || '').trim();
          if (status !== 'Approved' && status !== 'Confirmed') {
            return respond({ success: false, message: 'Access Denied. Your application is not approved yet.' });
          }
          
          var accessStatus = String(row[18] || '').trim(); // Column S
          if (accessStatus.toLowerCase() !== 'granted') {
            return respond({ success: false, message: 'Access Denied. Forge access has not been granted by Admin.' });
          }
          
          sheet.getRange(i + 1, 25).setValue(''); // Clear OTP
          sheet.getRange(i + 1, 26).setValue(''); // Clear Time
          
          // Tracking: Update Login Count (Col AA - 27) and Last Login Time (Col AB - 28)
          var loginCount = parseInt(row[26]) || 0;
          sheet.getRange(i + 1, 27).setValue(loginCount + 1);
          sheet.getRange(i + 1, 28).setValue(new Date().toISOString());
          
          // Log movement
          logOperativeAction(reqOpId, String(row[1] || ''), 'SYSTEM', 'Operative authenticated and logged into the dashboard.');
          
          var deviceStr = p.ua ? String(p.ua) : 'Unknown Device';
          var screenStr = p.screen ? String(p.screen) : 'Unknown Screen';
          var themeStr = p.theme ? String(p.theme) : 'Unknown Mode';

          notifySuperAdmin(
            'Operative Dashboard Login: ' + String(row[1] || ''),
            'A member has successfully authenticated and logged into the Forge Dashboard.\n\n' +
            'Name: ' + String(row[1] || '') + '\n' +
            'Operative ID: ' + reqOpId + '\n' +
            'Email: ' + String(row[2] || '') + '\n\n' +
            '--- Session Telemetry ---\n' +
            'Device: ' + deviceStr + '\n' +
            'Resolution: ' + screenStr + '\n' +
            'UI Mode: ' + themeStr
          );
          
          return respond({
            success: true,
            message: 'Authentication successful.',
            data: {
              name: String(row[1] || ''),
              operativeId: reqOpId,
              forgeAccess: accessStatus,
              xp: String(row[19] || '0'),
              rank: String(row[20] || 'Apprentice'),
              squad: String(row[21] || 'Unassigned'),
              role: String(row[16] || '').trim(),
              email: String(row[2] || '').trim()
            }
          });
        }
      }
      return respond({ success: false, message: 'Operative ID not found.' });
    }

    // ADMIN: Login
    if (action === 'admin_login') {
      if (!p.invxId || !p.email) return respond({ success: false, message: 'Missing credentials.' });
      
      // Master Override
      if (String(p.invxId).trim() === 'admin@innovexa' && String(p.email).trim() === 'adminpass') {
        return respond({
          success: true,
          data: {
            name: 'Master Admin',
            operativeId: 'INVX-MASTER',
            role: 'president',
            hasFaceRegistered: false
          }
        });
      }
      
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowOpId = String(row[12] || '').trim().toUpperCase();
        var rowEmail = String(row[2] || '').trim().toLowerCase();
        var reqOpId = String(p.invxId).trim().toUpperCase();
        var reqEmail = String(p.email).trim().toLowerCase();
        
        if (rowOpId === reqOpId && rowEmail === reqEmail) {
          var role = String(row[16] || '').trim().toLowerCase(); // Column Q
          var isPresident = (role === 'president' || ['INVX-01', 'INVX-09', 'INVX-7ZB7L'].includes(rowOpId));
          var isAdmin = (role === 'admin' || isPresident || ['INVX-02', 'INVX-03'].includes(rowOpId));
          
          if (!isAdmin) {
            return respond({ success: false, message: 'Access Denied. You do not have Admin privileges.' });
          }
          
          // Force explicit roles if empty but part of hardcoded list
          var finalRole = role;
          if (!finalRole) {
            finalRole = isPresident ? 'president' : 'admin';
          }

          return respond({
            success: true,
            data: {
              name: String(row[1] || ''),
              operativeId: rowOpId,
              role: finalRole,
              hasFaceRegistered: !!row[17] // Column R
            }
          });
        }
      }
      return respond({ success: false, message: 'Invalid Credentials.' });
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

    // FORGE: Log Operative Action (Telemetry)
    if (action === 'forge_log_action') {
      if (!p.operativeId || !p.actionDesc) return respond({ success: false, message: 'Missing fields.' });
      var reqOpId = String(p.operativeId).trim().toUpperCase();
      
      // Get operative name
      var rows = sheet.getDataRange().getValues();
      var opName = 'Unknown';
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][12] || '').trim().toUpperCase() === reqOpId) {
          opName = String(rows[i][1] || '');
          break;
        }
      }
      
      logOperativeAction(reqOpId, opName, 'USER_ACTION', p.actionDesc);
      return respond({ success: true, message: 'Action logged.' });
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

    // FORGE: Debug Row
    if (action === 'adminMembers') {
      var rows = sheet.getDataRange().getValues();
      var members = [];
      for (var i = 1; i < rows.length; i++) {
        if (!rows[i][1] && !rows[i][2]) continue; // skip empty rows
        members.push({
          rowIndex: i + 1,
          name: String(rows[i][1] || ''),
          email: String(rows[i][2] || ''),
          phone: String(rows[i][3] || ''),
          year: String(rows[i][4] || ''),
          branch: String(rows[i][5] || ''),
          skillLevel: String(rows[i][6] || ''),
          dob: String(rows[i][7] || ''),
          interests: String(rows[i][8] || ''),
          utr: String(rows[i][9] || ''),
          status: String(rows[i][10] || 'Pending'),
          amount: String(rows[i][11] || '599'),
          operativeId: String(rows[i][12] || ''),
          gender: String(rows[i][15] || ''),
          forgeRole: String(rows[i][16] || ''),
          linkedMentor: String(rows[i][17] || ''),
          forgeAccess: String(rows[i][18] || '').trim(),
          xp: String(rows[i][19] || '0'),
          rank: String(rows[i][20] || 'Apprentice'),
          squad: String(rows[i][21] || 'Unassigned'),
          college: String(rows[i][22] || ''),
          paymentUrl: String(rows[i][14] || ''),
          loginCount: parseInt(rows[i][26]) || 0,
          lastLoginTime: String(rows[i][27] || '')
        });
      }
      
      // Calculate active bounties
      var activeBounties = 0;
      try {
        var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
        var tRows = tasksSheet.getDataRange().getValues();
        for (var t = 1; t < tRows.length; t++) {
          if (String(tRows[t][6] || '').trim() === 'Open') {
            activeBounties++;
          }
        }
      } catch(e) {}
      
      // Calculate total XP awarded
      var totalXPAwarded = 0;
      for (var j = 0; j < members.length; j++) {
        totalXPAwarded += parseInt(members[j].xp) || 0;
      }
      
      // Fetch recent activity feed (last 10 items)
      var recentActivity = [];
      try {
        var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Content', 'OperativeId', 'Name']);
        var fRows = feedSheet.getDataRange().getValues();
        // Start from bottom, get up to 10
        for (var f = fRows.length - 1; f >= 1 && recentActivity.length < 10; f--) {
          recentActivity.push({
            timestamp: fRows[f][0],
            type: fRows[f][1],
            content: fRows[f][2],
            operativeId: fRows[f][3],
            name: fRows[f][4]
          });
        }
      } catch(e) {}

      return respond({ 
        success: true, 
        members: members,
        activeBounties: activeBounties,
        totalXPAwarded: totalXPAwarded,
        recentActivity: recentActivity
      });
    }

    // ADMIN: Get Member Detail (Logs & Tasks)
    if (action === 'admin_get_member_detail') {
      var targetId = p.operativeId;
      if (!targetId) return respond({ success: false, message: 'No operative ID provided' });

      // 1. Fetch Logs for this member
      var logSheet = getOrCreateSheet(ss, 'Operative_Audit_Logs', ['Timestamp', 'OperativeID', 'Name', 'ActionType', 'Description']);
      var lRows = logSheet.getDataRange().getValues();
      var memberLogs = [];
      for (var l = lRows.length - 1; l >= 1; l--) {
        if (String(lRows[l][1]) === targetId) {
          memberLogs.push({
            timestamp: lRows[l][0],
            actionType: lRows[l][3],
            description: lRows[l][4]
          });
        }
      }

      // 2. Fetch Tasks for this member
      var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var tRows = tasksSheet.getDataRange().getValues();
      var memberTasks = [];
      var activeTasksCount = 0;
      var completedTasksCount = 0;

      for (var t = tRows.length - 1; t >= 1; t--) {
        var assignedTo = String(tRows[t][7] || '').trim();
        var taskStatus = String(tRows[t][6] || '').trim();
        
        // Match assigned to this operative OR match generic 'Open' status if we want to show available ones (usually just assigned/submitted makes sense for a specific user's detail view). We will check if their ID is in AssignedTo.
        if (assignedTo.indexOf(targetId) !== -1) {
          memberTasks.push({
            taskId: tRows[t][0],
            title: tRows[t][2],
            xp: tRows[t][4],
            difficulty: tRows[t][5],
            status: taskStatus,
            submitLink: tRows[t][8],
            feedback: tRows[t][9]
          });
          
          if (taskStatus === 'Completed') completedTasksCount++;
          if (taskStatus === 'Open' || taskStatus === 'Submitted') activeTasksCount++;
        }
      }

      return respond({
        success: true,
        logs: memberLogs,
        tasks: memberTasks,
        stats: {
          activeTasks: activeTasksCount,
          completedTasks: completedTasksCount,
          totalLogs: memberLogs.length
        }
      });
    }

    // ADMIN: Get Audit Logs
    if (action === 'admin_get_audit_logs') {
      var logSheet = getOrCreateSheet(ss, 'Operative_Audit_Logs', ['Timestamp', 'OperativeID', 'Name', 'ActionType', 'Description']);
      var rows = logSheet.getDataRange().getValues();
      var logs = [];
      // Start from bottom, get up to 500 logs
      for (var i = rows.length - 1; i >= 1 && logs.length < 500; i--) {
        logs.push({
          timestamp: rows[i][0],
          operativeId: rows[i][1],
          name: rows[i][2],
          actionType: rows[i][3],
          description: rows[i][4]
        });
      }
      return respond({ success: true, logs: logs });
    }


    // ADMIN: Get Events
    if (action === 'admin_get_events') {
      var eventsSheet = getOrCreateSheet(ss, 'ForgeEvents', ['EventID', 'Timestamp', 'Title', 'Date', 'Description', 'CoverUrl', 'Status', 'EventType']);
      var rows = eventsSheet.getDataRange().getValues();
      var events = [];
      for (var i = 1; i < rows.length; i++) {
        events.push({
          eventId: String(rows[i][0] || ''),
          timestamp: String(rows[i][1] || ''),
          title: String(rows[i][2] || ''),
          date: String(rows[i][3] || ''),
          description: String(rows[i][4] || ''),
          coverUrl: String(rows[i][5] || ''),
          status: String(rows[i][6] || ''),
          eventType: String(rows[i][7] || 'Event'),
          imageUrls: String(rows[i][8] || '[]')
        });
      }
      return respond({ success: true, events: events.reverse() });
    }

    // FORGE: Get Sessions
    if (action === 'forge_get_sessions') {
      var eventsSheet = getOrCreateSheet(ss, 'ForgeEvents', ['EventID', 'Timestamp', 'Title', 'Date', 'Description', 'CoverUrl', 'Status', 'EventType']);
      var rows = eventsSheet.getDataRange().getValues();
      var sessions = [];
      for (var i = 1; i < rows.length; i++) {
        var type = String(rows[i][7] || 'Event');
        if (type !== 'Session') continue;
        
        sessions.push({
          eventId: String(rows[i][0] || ''),
          title: String(rows[i][2] || ''),
          date: String(rows[i][3] || ''),
          description: String(rows[i][4] || ''),
          coverUrl: String(rows[i][5] || ''),
          status: String(rows[i][6] || ''),
          eventType: type
        });
      }
      return respond({ success: true, sessions: sessions.reverse() });
    }

    // PUBLIC: Get Events
    if (action === 'get_public_events') {
      var eventsSheet = getOrCreateSheet(ss, 'ForgeEvents', ['EventID', 'Timestamp', 'Title', 'Date', 'Description', 'CoverUrl', 'Status', 'EventType']);
      var rows = eventsSheet.getDataRange().getValues();
      var events = [];
      for (var i = 1; i < rows.length; i++) {
        var type = String(rows[i][7] || 'Event');
        if (type === 'Session') continue; // Hide sessions from public
        
        events.push({
          eventId: String(rows[i][0] || ''),
          title: String(rows[i][2] || ''),
          date: String(rows[i][3] || ''),
          description: String(rows[i][4] || ''),
          coverUrl: String(rows[i][5] || ''),
          status: String(rows[i][6] || ''),
          eventType: type
        });
      }
      return respond({ success: true, events: events.reverse() });
    }

    // ADMIN: Get Attendance
    if (action === 'admin_get_attendance') {
      if (!p.eventId) return respond({ success: false, message: 'Missing Event ID.' });
      var attSheet = getOrCreateSheet(ss, 'ForgeAttendance', ['EventID', 'OperativeID', 'Timestamp', 'OperativeName']);
      var rows = attSheet.getDataRange().getValues();
      var attendance = [];
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(p.eventId)) {
          attendance.push({
            operativeId: String(rows[i][1]),
            timestamp: String(rows[i][2]),
            operativeName: String(rows[i][3])
          });
        }
      }
      return respond({ success: true, attendance: attendance });
    }

    // ADMIN: Get Feedback
    if (action === 'admin_get_feedback') {
      if (!p.eventId) return respond({ success: false, message: 'Missing Event ID.' });
      var fbSheet = getOrCreateSheet(ss, 'ForgeFeedback', ['EventID', 'OperativeID', 'Rating', 'Comments', 'Timestamp']);
      var rows = fbSheet.getDataRange().getValues();
      var feedback = [];
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(p.eventId)) {
          feedback.push({
            operativeId: String(rows[i][1]),
            rating: String(rows[i][2]),
            comments: String(rows[i][3]),
            timestamp: String(rows[i][4])
          });
        }
      }
      return respond({ success: true, feedback: feedback });
    }

    // ADMIN & FORGE: Get Tasks
    if (action === 'admin_get_tasks' || action === 'forge_get_my_tasks') {
      var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var rows = tasksSheet.getDataRange().getValues();
      var tasks = [];
      for (var i = 1; i < rows.length; i++) {
        var assignedTo = String(rows[i][7] || '').trim();
        // If forge_get_my_tasks, only return 'Open' tasks or tasks assigned to this user
        if (action === 'forge_get_my_tasks' && p.invxId) {
           var assignedArr = assignedTo.split(',').map(function(s) { return s.trim().toUpperCase(); });
           if (assignedTo.toUpperCase() !== 'OPEN' && assignedArr.indexOf(String(p.invxId).trim().toUpperCase()) === -1) continue;
        }
        tasks.push({
          taskId: rows[i][0],
          timestamp: rows[i][1],
          title: rows[i][2],
          description: rows[i][3],
          xp: rows[i][4],
          difficulty: rows[i][5],
          status: rows[i][6],
          assignedTo: assignedTo,
          submitLink: rows[i][8],
          feedback: rows[i][9]
        });
      }
      return respond({ success: true, tasks: tasks });
    }

    // FORGE: Get Leaderboard
    
    // FORGE: Get Resources
    if (action === 'forge_get_resources') {
      var rSheet = getOrCreateSheet(ss, 'ForgeResources', ['ResourceID', 'Timestamp', 'Title', 'Category', 'URL', 'AddedBy']);
      var rRows = rSheet.getDataRange().getValues();
      var resources = [];
      for (var i = 1; i < rRows.length; i++) {
        resources.push({
          resourceId: rRows[i][0],
          timestamp: rRows[i][1],
          title: rRows[i][2],
          category: rRows[i][3],
          url: rRows[i][4],
          addedBy: rRows[i][5]
        });
      }
      return respond({ success: true, resources: resources.reverse() });
    }

    if (action === 'forge_get_leaderboard') {
      var rows = sheet.getDataRange().getValues();
      var leaderboard = [];
      for (var i = 1; i < rows.length; i++) {
        var forgeAccess = String(rows[i][18] || '').trim(); // Col S
        if (forgeAccess === 'Granted') {
          leaderboard.push({
            name: rows[i][1],
            operativeId: rows[i][12],
            xp: parseInt(rows[i][19]) || 0, // Col T
            rank: rows[i][20] || 'Apprentice' // Col U
          });
        }
      }
      leaderboard.sort(function(a, b) { return b.xp - a.xp; });
      return respond({ success: true, leaderboard: leaderboard });
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
    var op = payload.op || '';
    var p = payload;
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

    // FORGE: Submit Task
    if (action === 'forge_submit_task') {
      var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var rows = tasksSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === payload.taskId) {
          tasksSheet.getRange(i + 1, 7).setValue('Under Review');
          tasksSheet.getRange(i + 1, 9).setValue(payload.submitLink || '');
          if (rows[i][7] === 'Open') {
            tasksSheet.getRange(i + 1, 8).setValue(payload.invxId); // Assign to the user if it was open
          }
          return respond({ success: true, message: 'Task submitted for review.' });
        }
      }
      return respond({ success: false, message: 'Task not found.' });
    }


    // FORGE: Edit Task
    if (action === 'forge_edit_task') {
      var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var rows = tasksSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === payload.taskId) {
          tasksSheet.getRange(i + 1, 9).setValue(payload.submitLink || '');
          return respond({ success: true, message: 'Submission link updated.' });
        }
      }
      return respond({ success: false, message: 'Task not found.' });
    }

    // FORGE: Recall Task
    if (action === 'forge_recall_task') {
      var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var rows = tasksSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === payload.taskId) {
          // Change status back to In Progress
          tasksSheet.getRange(i + 1, 7).setValue('In Progress');
          return respond({ success: true, message: 'Task recalled.' });
        }
      }
      return respond({ success: false, message: 'Task not found.' });
    }

    // PUBLIC: RSVP to Event
    if (op === 'public_rsvp_event') {
      if (!payload.eventId || !payload.operativeId) return respond({ success: false, message: 'Missing Event ID or Operative ID.' });
      
      var regRows = sheet.getDataRange().getValues();
      var opName = '';
      var opFound = false;
      for (var i = 1; i < regRows.length; i++) {
        if (String(regRows[i][12]).trim().toUpperCase() === String(payload.operativeId).trim().toUpperCase()) {
          opName = String(regRows[i][1]);
          opFound = true;
          break;
        }
      }
      if (!opFound) return respond({ success: false, message: 'Invalid Operative ID.' });

      var rsvpSheet = getOrCreateSheet(ss, 'EventRSVPs', ['EventID', 'OperativeID', 'Timestamp', 'OperativeName']);
      var rsvpRows = rsvpSheet.getDataRange().getValues();
      for (var j = 1; j < rsvpRows.length; j++) {
        if (String(rsvpRows[j][0]) === String(payload.eventId) && String(rsvpRows[j][1]).toUpperCase() === String(payload.operativeId).toUpperCase()) {
          return respond({ success: true, message: 'You have already RSVPd to this event!' });
        }
      }

      rsvpSheet.appendRow([
        payload.eventId,
        payload.operativeId.toUpperCase(),
        new Date().toISOString(),
        opName
      ]);
      return respond({ success: true, message: 'RSVP Successful! See you there.' });
    }

    // PUBLIC: Submit Feedback
    if (op === 'public_submit_feedback') {
      if (!payload.eventId || !payload.operativeId || !payload.rating) {
        return respond({ success: false, message: 'Missing parameters.' });
      }
      var fbSheet = getOrCreateSheet(ss, 'ForgeFeedback', ['EventID', 'OperativeID', 'Rating', 'Comments', 'Timestamp']);
      fbSheet.appendRow([
        payload.eventId,
        payload.operativeId,
        payload.rating,
        payload.comments || '',
        new Date().toISOString()
      ]);
      return respond({ success: true, message: 'Feedback submitted.' });
    }

    // Verify Admin Key
    if (payload.adminKey !== 'INNOVEXA_SECURE_KEY_2025') {
      return respond({ success: false, message: 'Unauthorized POST request.' });
    }

    // ADMIN: Grant/Revoke Forge Access
    // ADMIN: Enroll Face
    if (op === 'admin_enroll_face') {
      if (!p.invxId || !p.descriptor) return respond({ success: false, message: 'Missing parameters.' });
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowOpId = String(row[12] || '').trim().toUpperCase();
        if (rowOpId === String(p.invxId).trim().toUpperCase()) {
          // Save to column R (18th column)
          sheet.getRange(i + 1, 18).setValue(p.descriptor);
          return respond({ success: true, message: 'Biometrics saved successfully.' });
        }
      }
      return respond({ success: false, message: 'Operative not found.' });
    }

    // ADMIN: Set Role
    if (op === 'admin_set_role') {
      if (!p.adminId || !p.targetId || !p.newRole) return respond({ success: false, message: 'Missing parameters.' });
      
      var rows = sheet.getDataRange().getValues();
      var isAdminAuth = false;
      
      // Verify caller is President
      for (var i = 1; i < rows.length; i++) {
        var rowOpId = String(rows[i][12] || '').trim().toUpperCase();
        if (rowOpId === String(p.adminId).trim().toUpperCase()) {
          var role = String(rows[i][16] || '').trim().toLowerCase();
          if (role === 'president' || ['INVX-01', 'INVX-09'].includes(rowOpId)) {
            isAdminAuth = true;
          }
          break;
        }
      }
      
      if (!isAdminAuth) return respond({ success: false, message: 'Permission Denied. Only Presidents can manage roles.' });
      
      // Find target and update role
      for (var i = 1; i < rows.length; i++) {
        var rowOpId = String(rows[i][12] || '').trim().toUpperCase();
        if (rowOpId === String(p.targetId).trim().toUpperCase()) {
          sheet.getRange(i + 1, 17).setValue(p.newRole.toLowerCase()); // Column Q
          return respond({ success: true, message: 'Role updated successfully to ' + p.newRole });
        }
      }
      return respond({ success: false, message: 'Target Operative not found.' });
    }

    if (op === 'admin_grant_forge_access') {
      sheet.getRange(payload.rowIndex, 19).setValue(payload.accessStatus); // Col S (19) = ForgeAccess
      if (!sheet.getRange(payload.rowIndex, 20).getValue()) {
        sheet.getRange(payload.rowIndex, 20).setValue('0');
      }
      if (!sheet.getRange(payload.rowIndex, 21).getValue()) {
        sheet.getRange(payload.rowIndex, 21).setValue('Apprentice');
      }
      return respond({ success: true, message: 'Forge access updated to: ' + payload.accessStatus });
    }

    // ADMIN: Update member status (Approve / Reject)
    if (op === 'updateStatus') {
      var rowIdx = parseInt(payload.rowIndex);
      if (!rowIdx || rowIdx < 2) return respond({ success: false, message: 'Invalid row index.' });
      var newStatus = String(payload.status || '').trim();
      sheet.getRange(rowIdx, 11).setValue(newStatus); // Col K = Status
      // Send approval email when confirming
      try {
        var memberRow = sheet.getRange(rowIdx, 1, 1, 22).getValues()[0];
        var memberEmail = String(memberRow[2] || '');
        var memberName = String(memberRow[1] || '');
        var memberId = String(memberRow[12] || '');
        if (newStatus.toLowerCase().includes('confirm') && memberEmail) {
          MailApp.sendEmail({
            to: memberEmail,
            subject: 'Innovexa Hub — You are Approved! ID: ' + memberId,
            body: 'Hi ' + memberName + ',\n\nCongratulations! Your Innovexa Hub membership has been approved.\n\nOperative ID: ' + memberId + '\n\nCheck your full status: https://innovexareg.vercel.app/status.html\n\n— Innovexa Hub Core Team'
          });
        }
        
        notifySuperAdmin(
          'Admin Action: Operative Status Updated',
          'An operative\'s registration status was updated.\n\n' +
          'Operative: ' + memberName + ' (' + memberId + ')\n' +
          'New Status: ' + newStatus
        );
      } catch(_) {}
      return respond({ success: true, message: 'Status updated to ' + newStatus });
    }

    // ADMIN: Update Profile (Squad, Rank, XP, Forge Access)
    if (op === 'admin_update_profile') {
      var rowIdx = parseInt(payload.rowIndex);
      if (!rowIdx || rowIdx < 2) return respond({ success: false, message: 'Invalid row index.' });
      
      // Update the values in the sheet
      if (payload.forgeAccess) sheet.getRange(rowIdx, 19).setValue(payload.forgeAccess); // Col S (18 0-indexed + 1)
      if (payload.xp !== undefined) sheet.getRange(rowIdx, 20).setValue(payload.xp); // Col T
      if (payload.rank) sheet.getRange(rowIdx, 21).setValue(payload.rank); // Col U
      if (payload.squad) sheet.getRange(rowIdx, 22).setValue(payload.squad); // Col V
      
      var memberRow = sheet.getRange(rowIdx, 1, 1, 22).getValues()[0];
      var memberName = String(memberRow[1] || '');
      var memberId = String(memberRow[12] || '');

      notifySuperAdmin(
        'Admin Action: Profile Updated manually',
        'An operative\'s profile was manually updated by the admin.\n\n' +
        'Operative: ' + memberName + ' (' + memberId + ')\n' +
        (payload.forgeAccess ? 'Forge Access: ' + payload.forgeAccess + '\n' : '') +
        (payload.xp !== undefined ? 'XP: ' + payload.xp + '\n' : '') +
        (payload.rank ? 'Rank: ' + payload.rank + '\n' : '') +
        (payload.squad ? 'Squad: ' + payload.squad + '\n' : '')
      );
      
      return respond({ success: true, message: 'Profile updated successfully.' });
    }

    // ADMIN: Create Task
    
    // ADMIN: Add Resource
    if (op === 'admin_add_resource') {
      var rSheet = getOrCreateSheet(ss, 'ForgeResources', ['ResourceID', 'Timestamp', 'Title', 'Category', 'URL', 'AddedBy']);
      var resourceId = 'RES-' + Date.now();
      rSheet.appendRow([
        resourceId,
        new Date().toISOString(),
        payload.title || 'Untitled',
        payload.category || 'General',
        payload.url || payload.link || '',
        'Admin'
      ]);
      SpreadsheetApp.flush();
      return respond({ success: true, message: 'Resource added.', resourceId: resourceId });
    }

    // ADMIN: Edit Resource
    if (op === 'admin_edit_resource') {
      var rSheet = getOrCreateSheet(ss, 'ForgeResources', ['ResourceID', 'Timestamp', 'Title', 'Category', 'URL', 'AddedBy']);
      if (!payload.rowIndex) return respond({ success: false, message: 'Row index required.' });
      if (payload.title) rSheet.getRange(payload.rowIndex, 3).setValue(payload.title);
      if (payload.category) rSheet.getRange(payload.rowIndex, 4).setValue(payload.category);
      if (payload.url || payload.link) rSheet.getRange(payload.rowIndex, 5).setValue(payload.url || payload.link);
      SpreadsheetApp.flush();
      return respond({ success: true, message: 'Resource updated.' });
    }

    // ADMIN: Delete Resource
    if (op === 'admin_delete_resource') {
      var rSheet = getOrCreateSheet(ss, 'ForgeResources', ['ResourceID', 'Timestamp', 'Title', 'Category', 'URL', 'AddedBy']);
      if (payload.rowIndex) {
        rSheet.deleteRow(payload.rowIndex);
        return respond({ success: true, message: 'Resource deleted by row.' });
      }
      var rRows = rSheet.getDataRange().getValues();
      for (var i = 1; i < rRows.length; i++) {
        if (rRows[i][0] === payload.resourceId) {
          rSheet.deleteRow(i + 1);
          return respond({ success: true, message: 'Resource deleted.' });
        }
      }
      return respond({ success: false, message: 'Resource not found.' });
    }

    if (op === 'admin_create_task') {
      var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var taskId = 'TSK-' + Date.now();
      tasksSheet.appendRow([taskId, timestamp, payload.title, payload.description, payload.xp, payload.difficulty, 'Open', payload.assignedTo || 'Open', '', '']);
      SpreadsheetApp.flush();
      
      notifySuperAdmin(
        'Admin Action: Task Created (' + payload.title + ')',
        'A new task was created by the admin.\n\n' +
        'Title: ' + payload.title + '\n' +
        'XP: ' + payload.xp + '\n' +
        'Difficulty: ' + payload.difficulty + '\n' +
        'Assigned To: ' + (payload.assignedTo || 'Open')
      );
      
      return respond({ success: true, message: 'Task created.' });
    }

    // ADMIN: Edit Task
    if (op === 'admin_edit_task') {
      var eSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var eRows = eSheet.getDataRange().getValues();
      for (var ei = 1; ei < eRows.length; ei++) {
        if (eRows[ei][0] === payload.taskId) {
          if (payload.title)       eSheet.getRange(ei + 1, 3).setValue(payload.title);
          if (payload.description) eSheet.getRange(ei + 1, 4).setValue(payload.description);
          if (payload.xp)          eSheet.getRange(ei + 1, 5).setValue(payload.xp);
          if (payload.difficulty)  eSheet.getRange(ei + 1, 6).setValue(payload.difficulty);
          if (payload.assignedTo)  eSheet.getRange(ei + 1, 8).setValue(payload.assignedTo);
          
          notifySuperAdmin(
            'Admin Action: Task Edited (' + payload.taskId + ')',
            'A task was updated by the admin.\n\nTask ID: ' + payload.taskId + '\n' +
            (payload.title ? 'New Title: ' + payload.title + '\n' : '') +
            (payload.xp ? 'New XP: ' + payload.xp + '\n' : '') +
            (payload.assignedTo ? 'Assigned To: ' + payload.assignedTo + '\n' : '')
          );

          return respond({ success: true, message: 'Task updated.' });
        }
      }
      return respond({ success: false, message: 'Task not found for edit.' });
    }

    // ADMIN: Delete Task
    if (op === 'admin_delete_task') {
      var dSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var dRows = dSheet.getDataRange().getValues();
      for (var di = 1; di < dRows.length; di++) {
        if (dRows[di][0] === payload.taskId) {
          dSheet.deleteRow(di + 1);
          
          notifySuperAdmin(
            'Admin Action: Task Deleted (' + payload.taskId + ')',
            'A task was deleted by the admin.\n\nTask ID: ' + payload.taskId
          );

          return respond({ success: true, message: 'Task deleted.' });
        }
      }
      return respond({ success: false, message: 'Task not found for delete.' });
    }

    // ADMIN: Review Task
    if (op === 'admin_review_task') {
      var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var rows = tasksSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === payload.taskId) {
          tasksSheet.getRange(i + 1, 7).setValue(payload.status); // Status (e.g. Completed or Rejected)
          tasksSheet.getRange(i + 1, 10).setValue(payload.feedback || ''); // Feedback

          // If approved, grant XP
          if (payload.status === 'Completed' && rows[i][7] !== 'Open') {
            var assignee = rows[i][7];
            var xpReward = parseInt(rows[i][4]) || 0;
            var memRows = sheet.getDataRange().getValues();
            for (var m = 1; m < memRows.length; m++) {
              if (String(memRows[m][12]).trim() === String(assignee).trim()) {
                var currentXp = parseInt(memRows[m][19]) || 0; // Col T = XP
                var newXp = currentXp + xpReward;
                sheet.getRange(m + 1, 20).setValue(newXp); // Col T (20)
                var rank = 'Apprentice';
                if (newXp >= 1000) rank = 'Elite';
                else if (newXp >= 300) rank = 'Specialist';
                sheet.getRange(m + 1, 21).setValue(rank); // Col U (21)
                break;
              }
            }
          }
          
          notifySuperAdmin(
            'Admin Action: Task Reviewed (' + payload.taskId + ')',
            'A task submission was reviewed by the admin.\n\n' +
            'Task ID: ' + payload.taskId + '\n' +
            'Status: ' + payload.status + '\n' +
            'Feedback: ' + (payload.feedback || 'None')
          );

          return respond({ success: true, message: 'Task reviewed.' });
        }
      }
      return respond({ success: false, message: 'Task not found.' });
    }


    // ADMIN: Create Event
    if (op === 'admin_upload_event_image') {
      try {
        // payload.imageData = base64 string, payload.mimeType = 'image/jpeg' etc, payload.fileName
        var imageData = payload.imageData || '';
        var mimeType = payload.mimeType || 'image/jpeg';
        var fileName = payload.fileName || ('event_img_' + Date.now() + '.jpg');
        
        // Decode base64
        var decoded = Utilities.base64Decode(imageData);
        var blob = Utilities.newBlob(decoded, mimeType, fileName);
        
        // Save to Drive folder named 'InnovexaEventImages'
        var folders = DriveApp.getFoldersByName('InnovexaEventImages');
        var folder;
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder('InnovexaEventImages');
        }
        
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        var fileId = file.getId();
        var publicUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
        
        return respond({ success: true, url: publicUrl, fileId: fileId });
      } catch(err) {
        return respond({ success: false, message: 'Upload failed: ' + err.message });
      }
    }

    if (op === 'admin_create_event') {
      var eventsSheet = getOrCreateSheet(ss, 'ForgeEvents', ['EventID', 'Timestamp', 'Title', 'Date', 'Description', 'CoverUrl', 'Status', 'EventType', 'ImageUrls']);
      var eventId = 'EVT-' + Math.floor(10000 + Math.random() * 90000);
      var imageUrls = payload.imageUrls || [];
      var coverUrl = payload.coverUrl || (imageUrls.length > 0 ? imageUrls[0] : '');
      eventsSheet.appendRow([
        eventId,
        new Date().toISOString(),
        payload.title || '',
        payload.date || '',
        payload.description || '',
        coverUrl,
        'Active',
        payload.eventType || 'Event',
        JSON.stringify(imageUrls)
      ]);
      return respond({ success: true, message: 'Event created.' });
    }

    // ADMIN: Delete Event
    if (op === 'admin_delete_event') {
      var eventsSheet = getOrCreateSheet(ss, 'ForgeEvents', ['EventID', 'Timestamp', 'Title', 'Date', 'Description', 'CoverUrl', 'Status', 'EventType']);
      var rows = eventsSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(payload.eventId)) {
          eventsSheet.deleteRow(i + 1);
          return respond({ success: true, message: 'Event deleted.' });
        }
      }
      return respond({ success: false, message: 'Event not found.' });
    }

    // ADMIN: Edit Event
    if (op === 'admin_edit_event') {
      var eventsSheet = getOrCreateSheet(ss, 'ForgeEvents', ['EventID', 'Timestamp', 'Title', 'Date', 'Description', 'CoverUrl', 'Status', 'EventType', 'ImageUrls']);
      var rows = eventsSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(payload.eventId)) {
          var imageUrls = payload.imageUrls || [];
          var coverUrl = payload.coverUrl || (imageUrls.length > 0 ? imageUrls[0] : (rows[i][5] || ''));
          eventsSheet.getRange(i + 1, 3).setValue(payload.title || rows[i][2]);
          eventsSheet.getRange(i + 1, 4).setValue(payload.date || rows[i][3]);
          eventsSheet.getRange(i + 1, 5).setValue(payload.description || rows[i][4]);
          eventsSheet.getRange(i + 1, 6).setValue(coverUrl);
          eventsSheet.getRange(i + 1, 8).setValue(payload.eventType || rows[i][7] || 'Event');
          eventsSheet.getRange(i + 1, 9).setValue(JSON.stringify(imageUrls));
          return respond({ success: true, message: 'Event updated.' });
        }
      }
      return respond({ success: false, message: 'Event not found.' });
    }

    // ADMIN: Log Attendance (QR Scanner)
    if (op === 'admin_log_attendance') {
      if (!payload.eventId || !payload.operativeId) return respond({ success: false, message: 'Missing Event ID or Operative ID.' });
      
      // 1. Verify Operative ID exists and get name
      var regRows = sheet.getDataRange().getValues();
      var opName = '';
      var opFound = false;
      for (var i = 1; i < regRows.length; i++) {
        if (String(regRows[i][12]).trim().toUpperCase() === String(payload.operativeId).trim().toUpperCase()) {
          opName = String(regRows[i][1]);
          opFound = true;
          break;
        }
      }
      if (!opFound) return respond({ success: false, message: 'Invalid Operative ID.' });

      // 2. Check if already logged
      var attSheet = getOrCreateSheet(ss, 'ForgeAttendance', ['EventID', 'OperativeID', 'Timestamp', 'OperativeName']);
      var attRows = attSheet.getDataRange().getValues();
      for (var j = 1; j < attRows.length; j++) {
        if (String(attRows[j][0]) === String(payload.eventId) && String(attRows[j][1]).toUpperCase() === String(payload.operativeId).toUpperCase()) {
          return respond({ success: false, message: 'Attendance already logged for this operative.' });
        }
      }

      // 3. Log it
      attSheet.appendRow([
        payload.eventId,
        payload.operativeId.toUpperCase(),
        new Date().toISOString(),
        opName
      ]);
      return respond({ success: true, message: 'Attendance logged successfully.', data: { name: opName } });
    }

    // ADMIN: Remove Attendance
    if (op === 'admin_remove_attendance') {
      if (!payload.eventId || !payload.operativeId) return respond({ success: false, message: 'Missing Event ID or Operative ID.' });
      var attSheet = getOrCreateSheet(ss, 'ForgeAttendance', ['EventID', 'OperativeID', 'Timestamp', 'OperativeName']);
      var attRows = attSheet.getDataRange().getValues();
      for (var j = 1; j < attRows.length; j++) {
        if (String(attRows[j][0]) === String(payload.eventId) && String(attRows[j][1]).toUpperCase() === String(payload.operativeId).toUpperCase()) {
          attSheet.deleteRow(j + 1);
          return respond({ success: true, message: 'Attendance removed.' });
        }
      }
      return respond({ success: false, message: 'Attendance record not found.' });
    }

    // ADMIN: Issue Certificates
    if (op === 'admin_issue_certificates') {
      if (!payload.eventId || !payload.templateId || !payload.operatives) return respond({ success: false, message: 'Missing parameters.' });
      
      var opsToIssue = payload.operatives;
      var sentCount = 0;
      
      // 1. Get Event Details
      var eventSheet = getOrCreateSheet(ss, 'ForgeEvents');
      var evRows = eventSheet.getDataRange().getValues();
      var eventName = "Event";
      for (var evt = 1; evt < evRows.length; evt++) {
        if (String(evRows[evt][0]) === String(payload.eventId)) {
          eventName = String(evRows[evt][2]);
          break;
        }
      }
      
      // 2. Loop through all registered operatives to get names & emails
      var regRows = sheet.getDataRange().getValues();
      for (var i = 1; i < regRows.length; i++) {
        var opId = String(regRows[i][12]).trim().toUpperCase();
        var email = String(regRows[i][2]).trim();
        var name = String(regRows[i][1]).trim();
        
        if (opsToIssue.indexOf(opId) !== -1 && email) {
          try {
            // Duplicate Template
            var file = DriveApp.getFileById(payload.templateId).makeCopy(name + " - Certificate");
            var presentation = SlidesApp.openById(file.getId());
            var slides = presentation.getSlides();
            
            // Replace tags
            for (var s = 0; s < slides.length; s++) {
              slides[s].replaceAllText("{{NAME}}", name.toUpperCase());
              slides[s].replaceAllText("{{EVENT}}", eventName.toUpperCase());
            }
            presentation.saveAndClose();
            
            // Get PDF Blob
            var pdfBlob = file.getAs(MimeType.PDF);
            
            // Send Email
            MailApp.sendEmail({
              to: email,
              subject: "Innovexa Hub - Your Certificate of Initialization",
              body: "Hello " + name + ",\n\nAttached is your certificate for successfully executing protocols at " + eventName + ".\n\nBest,\nInnovexa Core Command",
              attachments: [pdfBlob]
            });
            
            // Cleanup Temp File
            file.setTrashed(true);
            sentCount++;
          } catch(err) {
            // Skip on fail
          }
        }
      }
      
      return respond({ success: true, message: 'Dispatched ' + sentCount + ' certificates.' });
    }

    // ADMIN: Send Broadcast Email
    if (op === 'admin_send_broadcast') {
      if (!payload.subject || !payload.body || !payload.emails || !payload.emails.length) {
        return respond({ success: false, message: 'Missing subject, body, or recipient list.' });
      }
      
      var sentCount = 0;
      var emails = payload.emails;
      
      try {
        var chunkSize = 50; 
        for (var i = 0; i < emails.length; i += chunkSize) {
          var chunk = emails.slice(i, i + chunkSize);
          MailApp.sendEmail({
            to: "innovexahub.bangalore@gmail.com",
            bcc: chunk.join(","),
            subject: payload.subject,
            body: payload.body
          });
          sentCount += chunk.length;
        }
        
        notifySuperAdmin(
          'Admin Action: Global Broadcast Sent',
          'A global email broadcast was sent by the admin.\n\n' +
          'Recipients: ' + sentCount + ' operatives\n' +
          'Subject: ' + payload.subject + '\n' +
          'Body:\n' + payload.body
        );

        return respond({ success: true, message: 'Blasted email to ' + sentCount + ' operatives.' });
      } catch (err) {
        return respond({ success: false, message: 'Error sending broadcast: ' + err.toString() });
      }
    }
    // ADMIN: Post to Global Feed
    if (op === 'admin_post_feed') {
      var feedSheet = getOrCreateSheet(ss, 'Forge_Feed', ['Timestamp', 'Type', 'Content', 'OperativeId', 'Name']);
      if (!payload.content) return respond({ success: false, message: 'Missing content.' });
      
      feedSheet.appendRow([timestamp, 'BROADCAST', payload.content, 'ADMIN', 'Command Center']);
      SpreadsheetApp.flush();
      
      notifySuperAdmin(
        'Admin Action: Global Feed Broadcast',
        'A new message was posted to the Global Feed by the admin.\n\n' +
        'Content:\n' + payload.content
      );
      
      return respond({ success: true, message: 'Broadcast posted to Global Feed.' });
    }



    // ORIGINAL: Registration logic
    if (!action && !op) {
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

      // Generate a unique 4-character alphanumeric ID (no ambiguous chars: 0,O,1,I,L)
      var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
      var operativeId, isDuplicate;
      var existingIds = rows.map(function(r) { return String(r[12] || '').trim().toUpperCase(); });
      do {
        var randomStr = '';
        for (var k = 0; k < 4; k++) {
          randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        operativeId = 'INVX-' + randomStr;
        isDuplicate = existingIds.indexOf(operativeId) !== -1;
      } while (isDuplicate);



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
        payload.gender      || '',
        '', // 16 forgeRole
        '', // 17 linkedMentor
        '', // 18 forgeAccess
        '', // 19 xp
        '', // 20 rank
        '', // 21 squad
        payload.college     || '', // 22 college
        ''                         // 23 password (deprecated)
      ]);

      try {
        MailApp.sendEmail({
          to:      payload.email,
          subject: 'Innovexa Hub — Registration Received! ID: ' + operativeId,
          body:    'Hi ' + (payload.fullName || '') + ',\n\nYour Operative ID: ' + operativeId + '\n\nCheck status: https://innovexareg.vercel.app/status.html\n\n— Innovexa Hub'
        });
      } catch (_) {}

      var adminSubject = 'New Operative Registration - Verification Pending';
      var adminBody = 'A new operative has registered and is pending verification.\n\n' +
                      'Operative ID: ' + operativeId + '\n' +
                      'Name: ' + (payload.fullName || '') + '\n' +
                      'Email: ' + (payload.email || '') + '\n' +
                      'Phone: ' + (payload.phone || '') + '\n' +
                      'College: ' + (payload.college || '') + '\n' +
                      'Branch & Year: ' + (payload.branch || '') + ' - ' + (payload.year || '') + '\n' +
                      'UTR: ' + (payload.utr || '') + '\n' +
                      'Amount: ' + (payload.amount || '599') + '\n\n' +
                      'Review Registration: https://innovexareg.vercel.app/admin.html';
      notifySuperAdmin(adminSubject, adminBody);

      return respond({ success: true, message: 'Registered!', data: { operativeId: operativeId } });
    }
    


    return respond({ success: false, message: 'Unknown POST action.' });

  } catch (err) {
    return respond({ success: false, message: 'Error: ' + err.toString() });
  }
}


function hashPassword(password) {
  if (!password) return '';
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password));
  var txtHash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function notifySuperAdmin(subject, body) {
  // Send Email
  try {
    MailApp.sendEmail({
      to: 'updates.innovexa@zohomail.in',
      subject: subject,
      body: body
    });
  } catch (err) {
    // Ignore error if email fails
  }

  // Send WhatsApp (Meta Cloud API)
  try {
    // ⚠️ Configure your Meta WhatsApp credentials here ⚠️
    var metaAccessToken = 'EAAWH8EHKNCsBSIxHG8NtGMy6bcZC7SHifwbyscQp0qk4Sz0E2F2huO9mdSZBNRyovSOIIZCae7EMgbw1T1QxZCzcmMNmCZCm1S9VjAJyFkCkGn4af4Fqly7YCQrPg3dSzQ0m2HkxUmZBzUITu9IQFc4T7vxilh15ukwSpKWBDeHGGVeftMxfun7rP2fgyKRWyw7AZDZD'; 
    var metaPhoneNumberId = '1158555334018409'; // Phone Number ID
    var adminWhatsApp = '919445253099'; 

    if (metaAccessToken !== 'YOUR_ACCESS_TOKEN' && metaPhoneNumberId !== 'YOUR_PHONE_NUMBER_ID') {
      var msg = '🔔 *' + subject + '*\n\n' + body;
      var url = 'https://graph.facebook.com/v20.0/' + metaPhoneNumberId + '/messages';
      
      var payload = {
        "messaging_product": "whatsapp",
        "to": adminWhatsApp,
        "type": "text",
        "text": {
          "body": msg
        }
      };

      var options = {
        "method": "post",
        "contentType": "application/json",
        "headers": {
          "Authorization": "Bearer " + metaAccessToken
        },
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      };

      UrlFetchApp.fetch(url, options);
    }
  } catch (err) {
    // Ignore error if whatsapp fails
  }
}



// ==========================================
// MIGRATION SCRIPT: Run this ONCE to upgrade all existing IDs
// to the new 4-char unambiguous alphanumeric format (INVX-XXXX)
// HOW TO RUN: Open Apps Script editor → select "MIGRATION_UpgradeAllIDsToNew4Char" → click Run
// ==========================================
function MIGRATION_UpgradeAllIDsToNew4Char() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Members') || ss.getSheetByName('Registrations') || ss.getSheets()[0];
  var data  = sheet.getDataRange().getValues();

  var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambiguous: 0,O,1,I,L

  // Build a mapping: oldId → newId
  var idMap = {};
  var usedIds = [];

  // First pass: generate new IDs for every member
  for (var i = 1; i < data.length; i++) {
    var oldId = String(data[i][12] || '').trim().toUpperCase();
    if (!oldId || !oldId.startsWith('INVX-')) continue;

    // Generate unique 4-char ID
    var newId;
    do {
      var randomStr = '';
      for (var k = 0; k < 4; k++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      newId = 'INVX-' + randomStr;
    } while (usedIds.indexOf(newId) !== -1);

    usedIds.push(newId);
    idMap[oldId] = newId;

    // Update Column M (13) in Members sheet
    sheet.getRange(i + 1, 13).setValue(newId);
    Logger.log('Remapped: ' + oldId + ' → ' + newId);
  }

  // Second pass: update Operative_Audit_Logs (col B = OperativeID)
  try {
    var logSheet = ss.getSheetByName('Operative_Audit_Logs');
    if (logSheet) {
      var logData = logSheet.getDataRange().getValues();
      for (var j = 1; j < logData.length; j++) {
        var logId = String(logData[j][1] || '').trim().toUpperCase();
        if (idMap[logId]) {
          logSheet.getRange(j + 1, 2).setValue(idMap[logId]);
        }
      }
    }
  } catch(e) { Logger.log('Log sheet update error: ' + e); }

  // Third pass: update Forge_Tasks if exists (col 3 = OperativeId)
  try {
    var taskSheet = ss.getSheetByName('Forge_Tasks');
    if (taskSheet) {
      var taskData = taskSheet.getDataRange().getValues();
      for (var t = 1; t < taskData.length; t++) {
        var taskId = String(taskData[t][3] || '').trim().toUpperCase();
        if (idMap[taskId]) {
          taskSheet.getRange(t + 1, 4).setValue(idMap[taskId]);
        }
      }
    }
  } catch(e) { Logger.log('Task sheet update error: ' + e); }

  SpreadsheetApp.flush();
  Logger.log('✅ Migration complete. ' + Object.keys(idMap).length + ' IDs updated.');
  SpreadsheetApp.getUi().alert('✅ Migration complete!\n\n' + Object.keys(idMap).length + ' member IDs upgraded to new 4-char format.\n\nCheck the Apps Script logs for the full mapping.');
}

