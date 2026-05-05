# Innovexa Hub — Complete Setup Guide

## Files in this package

| File | Description |
|------|-------------|
| `index.html` | Public landing page with registration & sign in |
| `portal.html` | Member portal (dashboard, ID card, events, leaderboard, etc.) |
| `admin.html` | Admin dashboard (member management, events, attendance scanner) |
| `Code.gs` | Google Apps Script backend (paste into Apps Script editor) |

---

## Step 1 — Set up Google Sheets

1. Go to [sheets.google.com](https://sheets.google.com) and create a **new spreadsheet**
2. Name it `Innovexa Hub Database`
3. Open **Extensions → Apps Script**
4. Delete everything in the editor and paste the entire contents of `Code.gs`
5. Save the file (Ctrl+S)
6. In the Apps Script editor, run the `setupSheets` function once:
   - Click the function dropdown → select `setupSheets`
   - Click ▶ Run
   - Grant permissions when prompted
   - This creates all 6 sheet tabs with headers automatically

---

## Step 2 — Deploy the Web App

1. In the Apps Script editor, click **Deploy → New deployment**
2. Click the gear icon ⚙ → Select type: **Web app**
3. Set:
   - **Description**: Innovexa Hub API
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfycb.../exec`)

> ⚠️ Every time you edit Code.gs, create a **New deployment** (not update) to get a fresh URL.

---

## Step 3 — Connect to the Website

1. Open `index.html` in a browser
2. Click **"Add your Google Apps Script URL"** in the banner at the top
3. Paste your Web App URL
4. Click **Save & Connect**

The site will immediately start pulling data from your Google Sheet.

---

## Step 4 — Create your admin account

1. Open your Google Sheet → `Members` tab
2. Find the auto-created row with email `admin@club.edu`
3. Change the email to **your real email address**
4. The password field is not used — admins sign in by email through the Admin tab in the sign-in modal

---

## Google Sheets Schema

### Members
| Column | Description |
|--------|-------------|
| ID | Auto-generated (IH-0001) |
| FullName | Member's full name |
| Email | University email |
| Phone | Phone number |
| Branch | CSE / ECE / IT / MECH / EEE |
| Year | 1st Year – 4th Year |
| Role | `member` or `admin` |
| Status | `pending` / `active` / `rejected` |
| Skills | Comma-separated skills |
| Points | Auto-updated on event attendance |
| CreatedAt | Timestamp |

### Events
| Column | Description |
|--------|-------------|
| ID | Auto-generated (EV-xxx) |
| Title | Event name |
| Date | ISO date string |
| Description | Event description |
| Type | Workshop / Hackathon / Seminar / Meetup / Competition |
| Location | Venue |
| Registered | Count (auto-updated) |
| Attended | Count (auto-updated) |
| CreatedAt | Timestamp |

### Attendance
| Column | Description |
|--------|-------------|
| ID | Auto-generated |
| EventID | References Events.ID |
| EventTitle | Event name |
| MemberID | References Members.ID |
| MemberName | Member's full name |
| Email | Member email |
| RegisteredAt | When they registered |
| Attended | true / false |
| AttendedAt | When QR was scanned |

### Announcements
| Column | Description |
|--------|-------------|
| ID | Auto-generated |
| Title | Announcement title |
| Content | Full text |
| Date | ISO date |
| Priority | High / Medium / Low |
| CreatedBy | Admin name |

### Resources
| Column | Description |
|--------|-------------|
| ID | Auto-generated |
| Title | Resource name |
| Link | Full URL |
| Category | Tutorial / Documentation / Tool / Course / Article / General |
| CreatedAt | Timestamp |

### Projects
| Column | Description |
|--------|-------------|
| ID | Auto-generated |
| Title | Project name |
| Description | What it does |
| Lead | Lead developer |
| Members | Comma-separated names |
| Status | Active / Planning / Completed |
| TechStack | Comma-separated tech |
| CreatedAt | Timestamp |

---

## Features Overview

### Public Landing Page (`index.html`)
- Live stats pulled from Google Sheets
- Member registration form → creates `pending` row in Members sheet
- Sign in (passwordless email auth) → redirects to portal or admin
- Upcoming events preview
- Active members preview
- Leaderboard preview

### Member Portal (`portal.html`)
| Page | What it does |
|------|-------------|
| Dashboard | Welcome strip, stats, events, quick actions, announcements |
| Profile | Full member info display |
| ID Card | Visual 85.6×54mm card with QR code + PDF download |
| Documents | Generate membership certificate, event certificate, or permission letter |
| Events | Browse & register for events |
| Directory | Searchable member grid with skill tags, hover-reveal email |
| Leaderboard | Podium + full ranked list with points |
| Announcements | Priority-sorted feed |
| Resources | Curated learning materials |
| Projects | Showcase of club projects |

### Admin Dashboard (`admin.html`)
| Page | What it does |
|------|-------------|
| Dashboard | Stats, pending approvals, distribution bars, events, announcements |
| Members | Full CRUD + approve/reject/revoke/promote, bulk actions, CSV export |
| Events | Full CRUD with date, type, location, description |
| Attendance | Per-event scanner page with live QR + manual entry + CSV export |
| Announcements | Full CRUD with priority selector |
| Resources | Full CRUD with category |
| Projects | Full CRUD with status, tech stack |

---

## Points System
- **Base**: Every member starts with 10 points
- **+5 points** added each time attendance is marked at an event
- Points are auto-updated in the Members sheet when admin scans QR
- Leaderboard sorts by points descending

---

## Email Notifications (automatic)
These fire automatically when admin approves/rejects via the dashboard:

- ✅ **Approval**: "Welcome to Innovexa Hub!" sent to new member
- ❌ **Rejection**: Polite rejection email sent to applicant
- 📬 **New application**: Notification sent to admin email

> Note: Email sending uses Google's `MailApp` which has a daily limit of 100 emails for free accounts. For high volume, replace with Resend API.

---

## Offline / Fallback Mode
If the Google Apps Script URL is not configured, all pages show realistic sample data automatically. This lets you demo the full UI without any backend setup.

---

## Deploying the Website

### Option A — GitHub Pages (free)
1. Create a GitHub repo
2. Push `index.html`, `portal.html`, `admin.html`
3. Go to Settings → Pages → Branch: main
4. Your site is live at `https://yourusername.github.io/repo-name`

### Option B — Netlify (free, drag & drop)
1. Go to [netlify.com](https://netlify.com)
2. Drag the folder containing the 3 HTML files
3. Done — live in seconds

### Option C — Any static host
These are plain HTML files with no build step needed. Upload to any host.

---

## Customization

### Change club name
Search and replace `Innovexa Hub` across all HTML files.

### Change colors
In each file's `<style>` block, edit the `:root` CSS variables:
```css
:root {
  --v: #5b21b6;    /* primary violet */
  --v2: #7c3aed;   /* lighter violet */
  --c: #06b6d4;    /* cyan accent */
}
```

### Add new branches
In `index.html` and `portal.html`, find the `<select id="reg-branch">` element and add options.

### Add new event types
In `Code.gs`, the `Type` field is freeform. In the HTML files, add new type colors to the `EV_COLORS` and `EV_TC` objects.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "No script URL configured" | Add your Apps Script URL via the setup banner |
| CORS error in console | Redeploy the Apps Script as a new deployment |
| Email not sending | Check Apps Script execution logs; MailApp needs Gmail |
| Data not updating | Make sure you deployed a NEW deployment after editing Code.gs |
| Sign in fails | Ensure member row has Status=`active` in the sheet |
| QR code blank on ID card | The QRCode.js library loads from CDN; check internet connection |

---

## Tech Stack
- **Frontend**: Plain HTML + CSS + Vanilla JS (no framework, no build step)
- **Auth**: Email-based, JWT-free — user object stored in `localStorage`
- **Database**: Google Sheets (6 tabs)
- **API**: Google Apps Script Web App (acts as REST-like endpoint)
- **QR**: `qrcodejs` from cdnjs
- **Fonts**: Google Fonts (Syne, Instrument Serif, DM Sans)
- **PDF**: Browser `window.print()` with print-optimized CSS

---

*Built for Innovexa Hub · 2026*
