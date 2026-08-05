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
