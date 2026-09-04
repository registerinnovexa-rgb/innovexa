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
  console.log("Total members with photoUrl:", mems.length);
  
  let base64Count = 0;
  let httpCount = 0;
  let otherCount = 0;
  
  mems.forEach(m => {
    if (m.photoUrl.startsWith('data:image')) base64Count++;
    else if (m.photoUrl.startsWith('http')) httpCount++;
    else otherCount++;
  });
  
  console.log(`Base64: ${base64Count}, HTTP: ${httpCount}, Other: ${otherCount}`);
  if (httpCount > 0) {
    const httpExample = mems.find(m => m.photoUrl.startsWith('http'));
    console.log("Example HTTP photoUrl:", httpExample.photoUrl);
  }
  mongoose.disconnect();
}
run();
