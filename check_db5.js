import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MemberSchema = new mongoose.Schema({
  operativeId: String,
  photoUrl: String,
  signature: String,
}, { strict: false });

const Member = mongoose.model('Member', MemberSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const mems = await Member.find({ photoUrl: { $exists: true, $ne: "" } }).lean();
  if (mems.length > 0) {
    console.log("Member 0 signature:", mems[0].signature ? mems[0].signature.length : "null");
  }
  mongoose.disconnect();
}
run();
