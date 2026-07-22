import re

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    code = f.read()

# 1. Insert GET endpoints (admin_get_events, admin_get_attendance)
get_endpoints = """
    // ADMIN: Get Events
    if (action === 'admin_get_events') {
      var eventsSheet = getOrCreateSheet(ss, 'ForgeEvents', ['EventID', 'Timestamp', 'Title', 'Date', 'Description', 'Status']);
      var rows = eventsSheet.getDataRange().getValues();
      var events = [];
      for (var i = 1; i < rows.length; i++) {
        events.push({
          eventId: String(rows[i][0]),
          timestamp: String(rows[i][1]),
          title: String(rows[i][2]),
          date: String(rows[i][3]),
          description: String(rows[i][4]),
          status: String(rows[i][5])
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
"""

if "admin_get_events" not in code:
    code = code.replace("    // ADMIN & FORGE: Get Tasks", get_endpoints + "\n    // ADMIN & FORGE: Get Tasks")


# 2. Insert POST endpoints (admin_create_event, admin_delete_event, admin_log_attendance)
post_endpoints = """
    // ADMIN: Create Event
    if (op === 'admin_create_event') {
      var eventsSheet = getOrCreateSheet(ss, 'ForgeEvents', ['EventID', 'Timestamp', 'Title', 'Date', 'Description', 'Status']);
      var eventId = 'EVT-' + Math.floor(10000 + Math.random() * 90000);
      eventsSheet.appendRow([
        eventId,
        new Date().toISOString(),
        payload.title || '',
        payload.date || '',
        payload.description || '',
        'Active'
      ]);
      return respond({ success: true, message: 'Event created.' });
    }

    // ADMIN: Delete Event
    if (op === 'admin_delete_event') {
      var eventsSheet = getOrCreateSheet(ss, 'ForgeEvents', ['EventID', 'Timestamp', 'Title', 'Date', 'Description', 'Status']);
      var rows = eventsSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(payload.eventId)) {
          eventsSheet.deleteRow(i + 1);
          return respond({ success: true, message: 'Event deleted.' });
        }
      }
      return respond({ success: false, message: 'Event not found.' });
    }

    // ADMIN: Log Attendance (QR Scanner)
    if (op === 'admin_log_attendance') {
      if (!payload.eventId || !payload.operativeId) return respond({ success: false, message: 'Missing Event ID or Operative ID.' });
      
      // 1. Verify Operative ID exists and get name
      var regSheet = getOrCreateSheet(ss, 'Registrations', []);
      var regRows = regSheet.getDataRange().getValues();
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
        if (String(attRows[j][0]) === String(payload.eventId) && String(attRows[j][1]).toUpperCase() === String(payload.operativeId).trim().toUpperCase()) {
          return respond({ success: false, message: 'Attendance already logged for this event.' });
        }
      }

      // 3. Log it
      attSheet.appendRow([
        payload.eventId,
        String(payload.operativeId).trim().toUpperCase(),
        new Date().toISOString(),
        opName
      ]);
      return respond({ success: true, message: 'Attendance logged successfully.', data: { name: opName } });
    }
"""

if "admin_create_event" not in code:
    code = code.replace("    // ORIGINAL: Registration logic", post_endpoints + "\n    // ORIGINAL: Registration logic")


with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
    f.write(code)

print("Code.gs patched for Events and Attendance!")
