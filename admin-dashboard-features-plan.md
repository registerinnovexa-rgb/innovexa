# Admin Dashboard Feature Expansion Plan

## Overview

**Project:** Innovexa Hub — Yenepoya University Student Tech Collective Portal  
**Goal:** Expand the existing admin dashboard (`admin.html`) with new features across four pillars: Analytics & Insights, Member Operations, Event & Forge Operations, and System Health & Governance.  
**Approach:** Add new tabs, panels, and API endpoints incrementally. Each sub-task is self-contained and independently deployable. All new backend endpoints follow the existing `api/backend.js` pattern. Frontend follows the existing Vanilla JS + Vite multi-page architecture.

---

## Architecture Reference

- **Frontend:** `src/admin.html`, `src/admin.js` (or equivalent JS entry) — Vanilla JS, Tab-based layout
- **Backend:** `api/backend.js` — Express-style handler, MongoDB/Mongoose
- **Models:** `api/models/` — Member, Task, Session, Attendance, Feedback, ActionLog, etc.
- **Color system:** Blue `#2563eb`, Cyan `#06b6d4`, Green `#10b981`, Orange `#d97706`, Red `#dc2626`
- **Patterns:** Toast notifications, Modal system, Stale-While-Revalidate cache (8s TTL), Admin Key validation, Audit logging on all write ops

---

## Sub-Tasks

---

### Sub-Task 1 — Analytics & Insights Dashboard (Overview Tab Enhancement)

**Status:** `[x] done`

**Intent**  
Transform the existing Overview tab from a simple stats bar into a rich analytics dashboard. Admins need visual trends to make data-driven decisions about member engagement, event effectiveness, and XP economy health.

**Expected Outcomes**
- Member growth chart (registrations over time — weekly/monthly toggle)
- XP distribution chart (bar chart by rank tier)
- Task completion funnel (created → assigned → submitted → approved)
- Event attendance trend (line chart per session)
- Top 10 members leaderboard widget
- Pending action counters (approvals, doc requests, cert requests)
- All charts powered by Chart.js (already in the project)

**Todo List**
1. Add new backend endpoint `admin_analytics` that aggregates:
   - Member registration counts grouped by week/month
   - XP sum per rank bucket
   - Task status counts (pipeline funnel)
   - Per-session attendance totals
   - Top 10 members by XP
2. Add frontend analytics section to the Overview tab in `admin.html`
3. Render four Chart.js charts (growth line, XP bar, funnel bar, attendance line)
4. Add a "Top Operatives" ranked list widget
5. Add "Pending Actions" badge panel (approvals + doc requests + cert requests)
6. Add a date-range filter (last 30 days / last 90 days / all-time) that re-fetches the analytics endpoint

**Relevant Context**
- Chart.js is already listed as a dependency
- `ActionLog` model has timestamps usable for trend data
- `Member`, `Task`, `Session`, `Attendance` models hold all necessary source data
- Existing stat cards in Overview tab are the anchor point for expansion

---

### Sub-Task 2 — Advanced Member Management

**Status:** `[x] done`

**Intent**  
Give admins deeper control over member lifecycle: advanced filtering/search, batch operations, a timeline view per member, and a quick-edit side panel — reducing the number of clicks needed for common workflows.

**Expected Outcomes**
- Multi-column filter bar (by status, rank, batch/year, forge access, role)
- Full-text search across name, email, and operative ID
- Member profile side-panel (slides in from right) showing: activity log, XP history, tasks, attendance record
- Bulk actions: approve selected, revoke forge access, export selected, send email to selected
- Inline status badge edit (click status to cycle: Pending → Confirmed → Suspended)
- Member notes/comments field (admin-only internal note per member)
- "Danger zone" per member: reset OTP, revoke all sessions, delete member (with confirmation modal)

**Todo List**
1. Add backend endpoint `admin_get_member_activity` — returns XP events, task completions, session attendance for one member
2. Add `adminNote` field to `Member` model; add endpoint `admin_set_member_note`
3. Add `admin_suspend_member` and `admin_delete_member` endpoints with audit log entries
4. Add `admin_reset_member_otp` endpoint to clear stored OTP state
5. Build filter bar UI component in the Members tab with local JS filtering against cached member list
6. Build slide-in member detail panel with tabs: Profile | Activity | Tasks | Attendance
7. Wire bulk-action toolbar (select checkboxes → action dropdown → confirm)
8. Add inline status click-to-edit with optimistic UI update

**Relevant Context**
- `adminMembers` and `admin_get_member_detail` endpoints already exist — new endpoints extend these
- `ActionLog` model is the source for the activity timeline
- Existing modal system handles confirmation dialogs
- CSV export already works — extend it to respect current filter/selection

---

### Sub-Task 3 — Task & Bounty Operations Hub (Forge Ops Enhancement)

**Status:** `[x] done`

**Intent**  
Upgrade the Forge Ops tab into a full task lifecycle manager with a Kanban-style board view, submission review queue with inline feedback, and XP budget tracking — making it easier to run complex multi-stage missions.

**Expected Outcomes**
- Kanban board view (columns: Open | In Progress | Under Review | Completed | Archived)
- Drag-and-drop task reordering within columns (using HTML5 Drag API)
- Submission review queue with side-by-side submission + feedback textarea
- Batch approve/reject submissions
- XP budget panel: total XP in active tasks vs. XP already awarded
- Task duplicate button (clone task with new ID)
- Task expiry date field with auto-archive when expired
- Filter tasks by difficulty, assigned member, status

**Todo List**
1. Add `expiresAt` and `archivedAt` fields to `Task` model
2. Add backend endpoints: `admin_archive_task`, `admin_clone_task`, `admin_reorder_tasks`
3. Add backend endpoint `admin_get_xp_budget` — returns total XP in active tasks vs. total XP awarded
4. Build Kanban board layout in the Forge Ops tab: four status columns rendered from task list
5. Implement HTML5 drag-and-drop for card movement between columns (calls `admin_reorder_tasks`)
6. Build submission review queue panel: list of pending submissions, click to open review modal with member submission detail + feedback input
7. Add batch review action (select multiple → approve all / reject all with shared feedback)
8. Add XP budget summary card to the top of the Forge Ops tab
9. Add task filter bar (difficulty, assigned member, status)

**Relevant Context**
- `Task` model has `status`, `assignedTo`, `xp`, `difficulty` fields already
- `admin_review_task` endpoint exists — batch review is an extension
- XP budget is computed from aggregating `Task.xp` vs. `Member.xp` fields

---

### Sub-Task 4 — Sessions & Events Control Center

**Status:** `[x] done`

**Intent**  
Extend the Sessions tab with a calendar view, per-event analytics (attendance rate, feedback scores), a live attendance monitor, and streamlined certificate dispatch — making event management faster for recurring sessions.

**Expected Outcomes**
- Calendar grid view (monthly) showing all sessions — click a date to open the session
- List/calendar view toggle
- Per-session analytics panel: attendance %, feedback score average, participant breakdown by rank
- Live attendance monitor: real-time count of check-ins as QR codes are scanned
- Bulk certificate generation and dispatch via email (one button per session)
- Recurring session template (create once, repeat weekly/monthly)
- Session status badges: Upcoming | Live | Completed | Cancelled

**Todo List**
1. Add `status` and `recurrence` fields to `Session` model
2. Add backend endpoint `admin_get_session_analytics` — returns attendance rate, feedback avg, rank breakdown for one session
3. Add backend endpoint `admin_create_recurring_session` — creates N sessions from a template
4. Add backend endpoint `admin_bulk_send_certificates` — triggers certificate email for all attendees of a session
5. Build calendar grid UI in the Sessions tab; render session markers on correct date cells
6. Add list/calendar toggle button
7. Build per-session detail panel with analytics charts (attendance pie, feedback bar)
8. Add live attendance counter widget that polls `admin_get_session_analytics` every 10 seconds when a session is "Live"
9. Add "Mark as Live / Completed / Cancelled" status buttons per session
10. Add recurring session creation form with frequency selector

**Relevant Context**
- `Session`, `Attendance`, `Feedback` models contain all needed data
- Certificate generation logic already exists — bulk dispatch wraps it in a loop
- QR attendance scanning is already in the tab — live counter extends this flow

---

### Sub-Task 5 — Document & Certificate Request Workflow

**Status:** `[x] done`

**Intent**  
Build a dedicated Requests tab to centralize `DocRequest` and `CertReq` management — currently these lack a dedicated UI. Admins need a queue-style interface to review, approve, generate, and dispatch documents in bulk.

**Expected Outcomes**
- New "Requests" tab in the admin sidebar
- Unified queue showing DocRequests and CertReqs, filterable by type and status
- Approve → generate → email dispatch workflow in one click per request
- Bulk approve for multiple pending requests of the same type
- Request detail modal with member info, purpose/reason, and admin notes
- Status badges: Pending | Approved | Dispatched | Rejected

**Todo List**
1. Add backend endpoint `admin_get_requests` — returns merged list of DocRequest and CertReq with member details
2. Add backend endpoint `admin_approve_request` — updates status and triggers document generation
3. Add backend endpoint `admin_reject_request` — updates status with rejection reason
4. Add backend endpoint `admin_bulk_approve_requests` — batch approval
5. Create new "Requests" tab HTML section in `admin.html`
6. Build request queue table with type/status filters and sortable columns
7. Build request detail side-panel (member info, request type, purpose, admin notes)
8. Add approve/reject action buttons with reason input for rejection
9. Add bulk-select toolbar for batch operations

**Relevant Context**
- `DocRequest` and `CertReq` models already exist in the database
- Certificate generation is already implemented for sessions — reuse that logic for CertReq dispatch
- Follows the same side-panel pattern established in Sub-Task 2

---

### Sub-Task 6 — Audit Log & Activity Monitor

**Status:** `[x] done`

**Intent**  
Surface the existing `ActionLog` data as a searchable, filterable audit trail in the admin dashboard — giving admins full visibility into who changed what and when. Also add a real-time admin activity feed.

**Expected Outcomes**
- New "Audit Log" section within the System Settings tab (or its own tab)
- Searchable, paginated log table (search by operative ID, action type, date range)
- Log entry detail modal (full payload of the action)
- Export audit log to CSV for a date range
- "Admin Presence" indicator showing which admins are currently online (already in model)
- Color-coded log entries by severity (info, warning, critical)

**Todo List**
1. Add backend endpoint `admin_get_audit_logs_paginated` — supports page, limit, search, type filter, date range params
2. Add backend endpoint `admin_export_audit_csv` — streams CSV of filtered logs
3. Build audit log UI panel with search bar, type filter dropdown, and date range picker
4. Build paginated table with "Load More" pagination
5. Add log entry click-to-expand detail modal showing full JSON payload
6. Add CSV export button that calls the export endpoint
7. Add "Online Admins" presence widget in the Overview tab using `AdminPresence` model data

**Relevant Context**
- `ActionLog` model has `timestamp`, `type`, `operativeId`, `content` fields
- `AdminPresence` model already exists — presence widget reads from it
- `admin_get_audit_logs` endpoint exists but likely lacks pagination and filtering — extend it

---

### Sub-Task 7 — System Health & Platform Settings Upgrade

**Status:** `[x] done`

**Intent**  
Upgrade the System Settings tab with a health dashboard (DB status, API latency, error rates), better email template preview, a rank configuration UI, and a webhook test tool — giving admins full operational control without touching code.

**Expected Outcomes**
- System health panel: DB connection status, last-5-errors from logs, API response time indicator
- Email template editor with live HTML preview pane (side-by-side edit + preview)
- Rank configuration UI: visual rank ladder with drag-to-reorder tiers and XP threshold inputs
- Webhook test tool: enter URL, select event type, fire a test payload, see response
- Maintenance mode toggle with scheduled activation (set a time to auto-enable)
- A/B test configuration panel with variant editor and traffic split slider
- Custom CSS live preview (apply CSS rule and see it reflected in an iframe)

**Todo List**
1. Add backend endpoint `admin_system_health` — returns DB ping status, recent error log entries, uptime
2. Add backend endpoint `admin_test_webhook` — sends a test POST to a given URL and returns the response status
3. Add backend endpoint `admin_schedule_maintenance` — stores scheduled maintenance time in `PlatformSettings`
4. Build system health panel with status indicators (green/red for DB, API)
5. Upgrade email template editor: add a side-by-side split-view with an iframe preview that re-renders on input
6. Build rank configuration UI: ordered list of rank tiers, each with name, XP threshold, color/icon inputs, drag-to-reorder
7. Build webhook test tool: URL input + event type selector + "Fire Test" button + response display
8. Add maintenance schedule UI (datetime picker + enable/disable)
9. Build A/B test panel with variant list, description, and traffic split percentage inputs
10. Wire custom CSS textarea to update a scoped `<style>` tag in a live preview iframe

**Relevant Context**
- `PlatformSettings` model has `registrationOpen`, `maintenanceMode`, `otpSettings`, webhook and A/B config fields
- Email template model (`EmailTemplate`) already exists — the editor already partially exists, needs preview pane
- `RankConfig` model exists — UI just needs to be built
- Custom CSS feature is referenced in existing settings code

---

### Sub-Task 8 — Notification Center & Communication Hub

**Status:** `[x] done`

**Intent**  
Create a centralized communication panel for admins to send targeted messages (email, in-app announcements, WhatsApp text generation) with audience segmentation, message scheduling, and delivery tracking.

**Expected Outcomes**
- New "Communications" tab in admin sidebar
- Email composer with audience picker (all members / confirmed only / by rank / custom list)
- Message template selector (reuse existing EmailTemplate entries)
- Scheduled send: pick date/time to queue an email blast
- In-app announcement composer with pinning and expiry date
- WhatsApp message generator (existing feature, promoted to its own panel)
- Delivery report: shows sent count, failed count per broadcast
- Message history log: all past broadcasts with timestamp, audience, subject

**Todo List**
1. Add `scheduledAt`, `sentAt`, `deliveryReport` fields to a new `Broadcast` model (or extend existing log)
2. Add backend endpoint `admin_schedule_broadcast` — queues an email for future delivery
3. Add backend endpoint `admin_get_broadcast_history` — returns list of past broadcasts with delivery stats
4. Add backend endpoint `admin_send_announcement` — creates and optionally pins an announcement
5. Create "Communications" tab HTML section in `admin.html`
6. Build email composer form: subject, body (rich text or HTML), audience picker, schedule toggle
7. Build template selector dropdown that populates composer from `EmailTemplate` records
8. Build announcement composer form: title, body, pinned toggle, expiry date
9. Build WhatsApp text generator panel (format member lists into WA-ready invite text)
10. Build message history table with delivery stats columns
11. Build delivery report detail modal per broadcast

**Relevant Context**
- Email broadcast to member groups already partially exists in Members tab — this consolidates and upgrades it
- `EmailTemplate` model is the source for template selector
- `Announcement` model already exists — the composer creates records in it
- Nodemailer (Zoho SMTP) is configured — scheduling can use a cron-style check or Vercel cron jobs

---

## Implementation Order

The sub-tasks are ordered to build on each other:

```
Sub-Task 1 (Analytics)  →  provides insight context for all other tabs
Sub-Task 2 (Members)    →  most-used admin workflow, high value
Sub-Task 3 (Forge Ops)  →  task lifecycle, depends on member data
Sub-Task 4 (Sessions)   →  event management, parallel to Forge Ops
Sub-Task 5 (Requests)   →  document/cert queue, depends on Member + Session
Sub-Task 6 (Audit Log)  →  visibility layer, low risk
Sub-Task 7 (System)     →  ops/health controls, independent
Sub-Task 8 (Comms)      →  communication hub, builds on Member + Announcement data
```

---

## Non-Goals

- Mobile admin app (admin panel is desktop-only)
- Third-party integrations beyond existing Nodemailer/Supabase
- Real-time websocket infrastructure (polling is sufficient for live counters)
- Rewrite of existing working features

