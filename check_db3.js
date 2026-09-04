import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MemberSchema = new mongoose.Schema({
  operativeId: String,
  photoUrl: String,
}, { strict: false });

const Member = mongoose.model('Member', MemberSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const mems = await Member.find({ photoUrl: { $exists: true, $ne: "" } }).lean();
  console.log("Found", mems.length, "members with photo.");
  if (mems.length > 0) {
    console.log("Lengths:", mems.map(m => m.photoUrl ? m.photoUrl.length : 0));
    console.log("First item charcodes:", mems[0].photoUrl.substring(0,10).split('').map(c => c.charCodeAt(0)));
  }
  mongoose.disconnect();
}
run();
