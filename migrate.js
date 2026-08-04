import fs from 'fs';
import { connectToDatabase } from './api/db.js';
import { Member, ActionLog } from './api/models.js';

async function migrate() {
  await connectToDatabase();
  console.log("Connected to MongoDB for migration");

  const data = JSON.parse(fs.readFileSync('./members.json', 'utf8'));

  // Clear existing
  await Member.deleteMany({});
  await ActionLog.deleteMany({});

  if (data.members) {
    for (const m of data.members) {
      if (m.name === 'Name') continue; // skip header
      const member = new Member({
        rowIndex: m.rowIndex,
        name: m.name,
        email: m.email,
        phone: m.phone,
        year: m.year,
        branch: m.branch,
        skillLevel: m.skillLevel,
        dob: m.dob,
        interests: m.interests,
        utr: m.utr,
        status: m.status || 'Pending',
        amount: m.amount,
        operativeId: m.operativeId,
        gender: m.gender,
        forgeRole: m.forgeRole,
        linkedMentor: String(m.linkedMentor),
        forgeAccess: m.forgeAccess,
        xp: parseInt(m.xp) || 0,
        rank: m.rank,
        squad: m.squad,
        college: m.college,
        loginCount: m.loginCount || 0,
        lastLoginTime: m.lastLoginTime
      });
      await member.save();
    }
    console.log(`Migrated ${data.members.length} members.`);
  }

  if (data.recentActivity) {
    for (const a of data.recentActivity) {
      const log = new ActionLog({
        timestamp: new Date(a.timestamp),
        type: a.type,
        content: a.content,
        operativeId: a.operativeId,
        name: a.name
      });
      await log.save();
    }
    console.log(`Migrated ${data.recentActivity.length} action logs.`);
  }

  console.log("Migration complete.");
  process.exit(0);
}

migrate().catch(console.error);
