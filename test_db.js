import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Member } from './api/models.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
  
  const email = "akash528tmy@gmail.com";
  const member = await Member.findOne({ email: email.trim().toLowerCase() });
  console.log("Found member:", member ? member.name : "null");
  
  const all = await Member.find({});
  console.log("Total members in DB:", all.length);
  const m1 = all[0];
  console.log("First member email:", m1.email);
  console.log("Does it match?", m1.email === email);
  
  process.exit(0);
}
run();
