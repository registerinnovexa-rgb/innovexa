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
  const mem = await Member.findOne({ photoUrl: { $exists: true, $ne: null } }).lean();
  if (mem) {
    console.log("Found member with photo:", mem.operativeId);
    console.log("Photo starts with:", mem.photoUrl.substring(0, 50));
    console.log("Sig starts with:", mem.signature ? mem.signature.substring(0, 50) : 'null');
  } else {
    console.log("No members with photoUrl found.");
  }
  mongoose.disconnect();
}
run();
