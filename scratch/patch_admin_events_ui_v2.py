import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# 1. Add Sidebar Button
sidebar_btn = """    <button class="sidebar-btn" onclick="switchAdminTab('forgeOps')" id="navForgeOps">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      Forge Ops
    </button>
    <button class="sidebar-btn" onclick="switchAdminTab('events')" id="navEvents">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      Events & Ops
    </button>"""

content = content.replace("""    <button class="sidebar-btn" onclick="switchAdminTab('forgeOps')" id="navForgeOps">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      Forge Ops
    </button>""", sidebar_btn)


# 2. Add Tab Content
tab_events = """
    <!-- ── EVENTS TAB ── -->
    <div class="tab-content" id="tabEvents">
      <div class="section-header">
        <h2 style="font-size:24px;font-weight:800">Events & Operations</h2>
        <button class="btn-add" onclick="openCreateEventModal()">+ Create Event</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="eventsListTbody">
            <tr><td colspan="4" style="text-align:center;padding:40px;">Loading events...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
"""

# Insert before <!-- ════════ MODAL ════════ -->
content = content.replace("<!-- ════════ MODAL ════════ -->", tab_events + "\n<!-- ════════ MODAL ════════ -->")


# 3. Add Modals (Create Event, Event Dashboard, Scanner)
modals = """
  <!-- Event Create Modal -->
  <div class="modal-overlay" id="modalCreateEvent">
    <div class="modal-box">
      <h2 style="color:var(--accent2)">Schedule Event</h2>
      <div class="form-group" style="margin-bottom:16px;">
        <label style="font-size:12px;color:var(--text3);margin-bottom:6px;display:block;">Event Title</label>
        <input type="text" id="evTitle" style="width:100%;padding:10px;background:var(--bg2);border:1px solid var(--border);color:#fff;border-radius:6px;">
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label style="font-size:12px;color:var(--text3);margin-bottom:6px;display:block;">Date</label>
        <input type="date" id="evDate" style="width:100%;padding:10px;background:var(--bg2);border:1px solid var(--border);color:#fff;border-radius:6px;">
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label style="font-size:12px;color:var(--text3);margin-bottom:6px;display:block;">Description</label>
        <textarea id="evDesc" rows="3" style="width:100%;padding:10px;background:var(--bg2);border:1px solid var(--border);color:#fff;border-radius:6px;"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" onclick="closeEventModal()">Cancel</button>
        <button class="btn-save" onclick="submitCreateEvent(this)">Initialize Event</button>
      </div>
    </div>
  </div>

  <!-- Event Dashboard Modal -->
  <div class="modal-overlay" id="modalEventDash">
    <div class="modal-box" style="max-width:700px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h2 id="dashEvTitle" style="color:var(--accent); margin-bottom:4px;">Event Title</h2>
          <p id="dashEvDate" style="font-size:14px; color:var(--text3); margin-bottom:16px;">Date</p>
        </div>
        <button class="btn-cancel" onclick="closeEventModal()">✕ Close</button>
      </div>
      
      <div style="display:flex; gap:12px; margin-bottom:24px;">
        <button class="btn-save" id="btnLaunchScanner" style="background:#25D366; flex:1; display:flex; justify-content:center; gap:8px;" onclick="startScanner()">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
          Launch ID Scanner
        </button>
        <button class="btn-save" id="btnGenCerts" style="background:var(--accent); flex:1; display:flex; justify-content:center; gap:8px;" onclick="generateCertificates()">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Generate PDF Certificates
        </button>
      </div>

      <!-- Scanner Area -->
      <div id="scannerWrapper" style="display:none; margin-bottom:20px; background:#000; border:2px solid var(--accent); border-radius:12px; overflow:hidden;">
        <div id="reader" style="width:100%;"></div>
        <div style="padding:10px; text-align:center; background:rgba(0,0,0,0.8);">
           <button class="btn-cancel" onclick="stopScanner()">Stop Scanner</button>
        </div>
      </div>

      <h3 style="font-size:16px; margin-bottom:12px; font-family:var(--font-b); color:var(--text2);">Live Attendance Roster</h3>
      <div class="table-wrap" style="max-height:300px;">
        <table class="data-table">
          <thead>
            <tr><th>Operative ID</th><th>Name</th><th>Time Logged</th></tr>
          </thead>
          <tbody id="attendanceTbody">
            <tr><td colspan="3" style="text-align:center;padding:20px;">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
"""

content = content.replace("<!-- ════════ MODAL ════════ -->", "<!-- ════════ MODAL ════════ -->\n" + modals)


# 4. Javascript logic
js_code = """
let currentEvents = [];
let activeEventId = null;
let activeEventTitle = '';
let currentAttendance = [];
let html5QrcodeScanner = null;

function closeEventModal() {
  document.getElementById('modalCreateEvent').classList.remove('open');
  document.getElementById('modalEventDash').classList.remove('open');
  stopScanner();
}

async function loadEvents() {
  const tbody = document.getElementById('eventsListTbody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;">Fetching operations...</td></tr>';
  
  try {
    const res = await gasGet(SCRIPT_URL + '?action=admin_get_events');
    if (!res.success) throw new Error(res.message);
    
    currentEvents = res.events || [];
    tbody.innerHTML = '';
    
    if (currentEvents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text3);">No events initialized.</td></tr>';
      return;
    }
    
    currentEvents.forEach(e => {
      tbody.innerHTML += `
        <tr>
          <td><strong style="color:var(--accent2)">${escHtml(e.title)}</strong></td>
          <td>${escHtml(e.date)}</td>
          <td><span class="status-badge status-confirmed">${escHtml(e.status)}</span></td>
          <td>
            <div class="btn-actions">
              <button class="btn-sm btn-edit" onclick="openEventDash('${e.eventId}')">Dashboard</button>
              <button class="btn-sm btn-reject" onclick="deleteEvent('${e.eventId}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    });
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--red);padding:20px;">${e.message}</td></tr>`;
  }
}

function openCreateEventModal() {
  document.getElementById('evTitle').value = '';
  document.getElementById('evDate').value = '';
  document.getElementById('evDesc').value = '';
  document.getElementById('modalCreateEvent').classList.add('open');
}

async function submitCreateEvent(btn) {
  const title = document.getElementById('evTitle').value;
  const date = document.getElementById('evDate').value;
  const desc = document.getElementById('evDesc').value;
  if(!title || !date) return showToast('Title and Date are required.', 'error');
  
  btn.disabled = true; btn.textContent = 'Initializing...';
  try {
    const res = await gasPost({ op: 'admin_create_event', title, date, description: desc });
    if(res.success) {
      showToast('Event Initialized.', 'success');
      closeEventModal();
      loadEvents();
    } else {
      showToast(res.message, 'error');
    }
  } catch(e) {
    showToast(e.message, 'error');
  }
  btn.disabled = false; btn.textContent = 'Initialize Event';
}

async function deleteEvent(id) {
  if(!confirm('Delete this event permanently?')) return;
  showToast('Deleting...');
  const res = await gasPost({ op: 'admin_delete_event', eventId: id });
  if(res.success) {
    showToast('Event deleted.', 'success');
    loadEvents();
  } else {
    showToast(res.message, 'error');
  }
}

async function openEventDash(id) {
  activeEventId = id;
  const ev = currentEvents.find(e => e.eventId === id);
  if(!ev) return;
  activeEventTitle = ev.title;
  
  document.getElementById('dashEvTitle').textContent = ev.title;
  document.getElementById('dashEvDate').textContent = ev.date;
  document.getElementById('modalEventDash').classList.add('open');
  
  loadAttendance();
}

async function loadAttendance() {
  const tbody = document.getElementById('attendanceTbody');
  tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;">Fetching roster...</td></tr>';
  
  try {
    const res = await gasGet(SCRIPT_URL + '?action=admin_get_attendance&eventId=' + activeEventId);
    if(res.success) {
      currentAttendance = res.attendance || [];
      if(currentAttendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text3);">No operatives logged yet.</td></tr>';
      } else {
        tbody.innerHTML = currentAttendance.map(a => `
          <tr>
            <td style="font-family:monospace;color:var(--accent);">${escHtml(a.operativeId)}</td>
            <td><strong>${escHtml(a.operativeName)}</strong></td>
            <td style="font-size:12px;color:var(--text3);">${new Date(a.timestamp).toLocaleTimeString()}</td>
          </tr>
        `).join('');
      }
    }
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--red);">${e.message}</td></tr>`;
  }
}

// ── Scanner Logic ──
let isScanning = false;
let lastScanned = 0;

function startScanner() {
  if (isScanning) return;
  document.getElementById('scannerWrapper').style.display = 'block';
  isScanning = true;
  
  html5QrcodeScanner = new Html5Qrcode("reader");
  html5QrcodeScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    onScanSuccess,
    onScanFailure
  ).catch(err => {
    showToast("Camera access denied or error.", "error");
    stopScanner();
  });
}

function stopScanner() {
  if(html5QrcodeScanner) {
    html5QrcodeScanner.stop().then(() => {
      html5QrcodeScanner.clear();
    }).catch(e => console.log(e));
  }
  document.getElementById('scannerWrapper').style.display = 'none';
  isScanning = false;
}

function onScanFailure(error) { }

async function onScanSuccess(decodedText, decodedResult) {
  // Prevent double scans within 3 seconds
  if (Date.now() - lastScanned < 3000) return;
  lastScanned = Date.now();
  
  // Format: InnovexaHub_Verified_INVX-XXXX
  if(!decodedText.includes('INVX-')) {
    showToast("Invalid QR Code.", "error");
    return;
  }
  
  const parts = decodedText.split('_');
  const opId = parts[parts.length - 1]; // e.g. INVX-XXXX
  
  // Flash scanner green
  document.getElementById('scannerWrapper').style.borderColor = '#25D366';
  setTimeout(() => document.getElementById('scannerWrapper').style.borderColor = 'var(--accent)', 1000);
  
  showToast(`Logging ${opId}...`);
  
  try {
    const res = await gasPost({ op: 'admin_log_attendance', eventId: activeEventId, operativeId: opId });
    if(res.success) {
      showToast(`ACCESS GRANTED: ${res.data.name}`, 'success');
      loadAttendance(); // refresh roster
    } else {
      showToast(res.message, 'error');
    }
  } catch(e) {
    showToast("Network Error", "error");
  }
}

// ── Certificate Engine ──
function generateCertificates() {
  if(!currentAttendance || currentAttendance.length === 0) {
    return showToast("No attendees to generate certificates for.", "error");
  }
  
  showToast("Generating PDF Engine...", "success");
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });
  
  currentAttendance.forEach((att, index) => {
    if(index > 0) doc.addPage();
    
    // Background: Dark Cyberpunk
    doc.setFillColor(10, 10, 12);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Border Glow (Purple)
    doc.setDrawColor(167, 139, 250);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 277, 190, 'D');
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 273, 186, 'D');
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text("INNOVEXA HUB", 148.5, 45, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(167, 139, 250); // accent
    doc.setFontSize(14);
    doc.text("CERTIFICATE OF INITIALIZATION", 148.5, 55, { align: "center" });
    
    // Body
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(16);
    doc.text("This confirms that Operative", 148.5, 90, { align: "center" });
    
    // Name
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.text(att.operativeName.toUpperCase(), 148.5, 110, { align: "center" });
    
    // Operative ID
    doc.setFont("courier", "bold");
    doc.setTextColor(37, 211, 102); // green tech
    doc.setFontSize(16);
    doc.text(att.operativeId, 148.5, 122, { align: "center" });
    
    // Footer Body
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(16);
    doc.text(`has successfully executed protocols and completed the operation:`, 148.5, 145, { align: "center" });
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(167, 139, 250);
    doc.setFontSize(20);
    doc.text(activeEventTitle.toUpperCase(), 148.5, 160, { align: "center" });
    
    // Signatures
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("AUTHORIZED BY CORE COMMAND", 50, 185, { align: "center" });
    doc.line(20, 180, 80, 180);
    
    const dStr = new Date(att.timestamp).toLocaleDateString();
    doc.text("TIMESTAMP: " + dStr, 247, 185, { align: "center" });
    doc.line(217, 180, 277, 180);
  });
  
  doc.save(`Innovexa_Certs_${activeEventTitle.replace(/\s+/g, '_')}.pdf`);
  showToast("Download Complete.", "success");
}
"""

content = content.replace("</script>\n</body>", js_code + "\n</script>\n</body>")

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)

print("admin.html patched for Events UI FOR REAL THIS TIME!")
