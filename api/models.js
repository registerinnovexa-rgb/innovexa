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
