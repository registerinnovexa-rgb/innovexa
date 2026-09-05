require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Member = mongoose.model('Member', new mongoose.Schema({}, { strict: false }));
    const members = await Member.find({}, 'name operativeId email');
    console.log(members);
    process.exit(0);
}
run();
