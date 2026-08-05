import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  rowIndex: { type: Number, index: true },
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  year: String,
  branch: String,
  skillLevel: String,
  dob: String,
  interests: String,
  utr: String,
  status: { type: String, default: 'Pending' },
  amount: String,
  operativeId: { type: String, unique: true },
  photoUrl: String,
  paymentProofUrl: String,
  gender: String,
  forgeRole: String,
  linkedMentor: String,
  forgeAccess: String,
  xp: { type: Number, default: 0 },
  rank: { type: String, default: 'Apprentice' },
  squad: { type: String, default: 'Unassigned' },
  college: String,
  feedback: String,
  otp: String,
  otpTime: Number,
  otpAttempts: { type: Number, default: 0 },
  loginCount: { type: Number, default: 0 },
  lastLoginTime: String,
  faceDescriptor: String,
});

export const Member = mongoose.models.Member || mongoose.model('Member', MemberSchema);

const ActionSchema = new mongoose.Schema({
  timestamp: Date,
  type: String,
  content: String,
  operativeId: String,
  name: String
});

export const ActionLog = mongoose.models.ActionLog || mongoose.model('ActionLog', ActionSchema);

const TaskSchema = new mongoose.Schema({
  taskId: { type: String, unique: true },
  timestamp: Date,
  title: String,
  description: String,
  xp: Number,
  difficulty: String,
  status: { type: String, default: 'Open' },
  assignedTo: String,
  submitLink: String,
  feedback: String
});

export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

const SosSchema = new mongoose.Schema({
  timestamp: Date,
  operativeId: String,
  name: String,
  title: String,
  description: String,
  status: { type: String, default: 'open' },
  helperOperativeId: String,
  helperName: String
});

export const Sos = mongoose.models.Sos || mongoose.model('Sos', SosSchema);

const SessionSchema = new mongoose.Schema({
  timestamp: Date,
  sessionId: { type: String, unique: true },
  title: String,
  description: String,
  date: String,
  link: String
});

export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);

const BountySchema = new mongoose.Schema({
  bountyId: { type: String, unique: true },
  timestamp: Date,
  title: String,
  description: String,
  xp: Number,
  status: { type: String, default: 'Open' },
  claimedBy: String,
  submitLink: String
});

export const Bounty = mongoose.models.Bounty || mongoose.model('Bounty', BountySchema);

const ResourceSchema = new mongoose.Schema({
  resourceId: { type: String, unique: true },
  timestamp: Date,
  title: String,
  category: String,
  url: String,
  addedBy: String
});

export const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);

const EventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true },
  timestamp: Date,
  title: String,
  date: String,
  location: String,
  description: String,
  status: { type: String, default: 'Upcoming' },
  coverUrl: String,
  imageUrls: [String]
});

export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

const AttendanceSchema = new mongoose.Schema({
  eventId: String,
  operativeId: String,
  status: { type: String, default: 'Registered' },
  timestamp: Date
});

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

const FeedbackSchema = new mongoose.Schema({
  operativeId: String,
  name: String,
  comment: String,
  rating: Number,
  timestamp: Date
});

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

const AssetSchema = new mongoose.Schema({
  assetId: { type: String, unique: true },
  name: String,
  type: String,
  serial: String,
  status: { type: String, default: 'Available' },
  borrowedBy: String,
  borrowDate: Date,
  timestamp: Date
});

export const Asset = mongoose.models.Asset || mongoose.model('Asset', AssetSchema);

const DocRequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  operativeId: String,
  name: String,
  docType: String,
  purpose: String,
  status: { type: String, default: 'Pending' },
  timestamp: Date
});

export const DocRequest = mongoose.models.DocRequest || mongoose.model('DocRequest', DocRequestSchema);

const CertReqSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  operativeId: String,
  name: String,
  eventType: String,
  status: { type: String, default: 'Pending' },
  timestamp: Date
});

export const CertReq = mongoose.models.CertReq || mongoose.model('CertReq', CertReqSchema);

const PlatformSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'global' },
  registrationOpen: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  adminEmail: { type: String, default: 'updates.innovexa@zohomail.in' },
  otpRateLimitSeconds: { type: Number, default: 60 },
  otpMaxAttempts: { type: Number, default: 5 },
  updatedAt: { type: Date, default: Date.now }
});

export const PlatformSettings = mongoose.models.PlatformSettings || mongoose.model('PlatformSettings', PlatformSettingsSchema);

// Email Templates
const EmailTemplateSchema = new mongoose.Schema({
  key: { type: String, unique: true }, // 'otp', 'welcome', 'approved'
  subject: String,
  html: String,
  updatedAt: { type: Date, default: Date.now }
});
export const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', EmailTemplateSchema);

// Taxonomy (editable dropdowns)
const TaxonomySchema = new mongoose.Schema({
  category: String, // 'college', 'branch', 'eventCategory'
  value: String,
  order: { type: Number, default: 0 }
});
export const Taxonomy = mongoose.models.Taxonomy || mongoose.model('Taxonomy', TaxonomySchema);

// Global Dictionary (string overrides)
const DictionarySchema = new mongoose.Schema({
  key: { type: String, unique: true }, // e.g. 'operative', 'forge'
  value: String // e.g. 'Student', 'Dashboard'
});
export const Dictionary = mongoose.models.Dictionary || mongoose.model('Dictionary', DictionarySchema);

// Announcements / CMS posts
const AnnouncementSchema = new mongoose.Schema({
  announcementId: { type: String, unique: true },
  title: String,
  body: String, // Markdown
  published: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false },
  author: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

// Rank Config
const RankConfigSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'global' },
  ranks: [{
    name: String,
    minXP: Number,
    maxXP: Number
  }],
  updatedAt: { type: Date, default: Date.now }
});
export const RankConfig = mongoose.models.RankConfig || mongoose.model('RankConfig', RankConfigSchema);

// Role Permissions Engine
const RolePermissionsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'global' },
  permissions: mongoose.Schema.Types.Mixed, // { Vanguard: { canReviewTasks: true, canCreateBounties: false, ... } }
  updatedAt: { type: Date, default: Date.now }
});
export const RolePermissions = mongoose.models.RolePermissions || mongoose.model('RolePermissions', RolePermissionsSchema);

// Webhook Config
const WebhookConfigSchema = new mongoose.Schema({
  event: { type: String, unique: true }, // 'NEW_MEMBER', 'LOGIN', 'TASK_COMPLETE', 'STATUS_CHANGE', 'SOS'
  url: String,
  enabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});
export const WebhookConfig = mongoose.models.WebhookConfig || mongoose.model('WebhookConfig', WebhookConfigSchema);

// Access Control (route guards)
const AccessControlSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'global' },
  rules: [{
    path: String,      // e.g. 'sos', 'bounty', 'resources'
    minRank: String,   // e.g. 'Vanguard'
    enabled: Boolean
  }],
  updatedAt: { type: Date, default: Date.now }
});
export const AccessControl = mongoose.models.AccessControl || mongoose.model('AccessControl', AccessControlSchema);

// Faction
const FactionSchema = new mongoose.Schema({
  factionId: { type: String, unique: true },
  name: String,
  description: String,
  leaderId: String,
  leaderName: String,
  memberIds: [String],
  color: { type: String, default: '#a78bfa' },
  createdAt: { type: Date, default: Date.now }
});
export const Faction = mongoose.models.Faction || mongoose.model('Faction', FactionSchema);
