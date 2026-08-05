import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { connectToDatabase } from './api/db.js';
import { Member } from './api/models.js';

dotenv.config();

const GAS_URL = 'https://script.google.com/macros/s/AKfycbz4Hlin3j3YGZxIwOqyK4TBkqpcvkuvlQQ588d01OJGysIAUc--L2yknL9i58Qx4g4LyQ/exec';

async function migrate() {
  console.log('Connecting to MongoDB Atlas...');
  await connectToDatabase();
  console.log('Connected!');

  console.log('Fetching old members from Google Apps Script...');
  const resp = await fetch(`${GAS_URL}?action=adminMembers`);
  const data = await resp.json();

  if (!data.success || !data.members) {
    console.error('Failed to fetch members:', data.message);
    process.exit(1);
  }

  const members = data.members;
  console.log(`Found ${members.length} old members to migrate.`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const m of members) {
    try {
      if (!m.email) { skipped++; continue; }

      const existing = await Member.findOne({
        $or: [
          { email: m.email.trim().toLowerCase() },
          ...(m.operativeId ? [{ operativeId: m.operativeId.trim().toUpperCase() }] : [])
        ]
      });

      if (existing) {
        console.log(`  SKIP: ${m.name} (${m.email}) already in DB`);
        skipped++;
        continue;
      }

      let opId = m.operativeId ? m.operativeId.trim().toUpperCase() : null;
      if (!opId) {
        let isUnique = false;
        while (!isUnique) {
          const rand = Math.floor(10000 + Math.random() * 90000).toString();
          opId = 'INVX-' + rand;
          const check = await Member.findOne({ operativeId: opId });
          if (!check) isUnique = true;
        }
      }

      await Member.create({
        operativeId: opId,
        name: m.name || '',
        email: m.email.trim().toLowerCase(),
        phone: m.phone || '',
        college: m.college || '',
        dob: m.dob || '',
        year: m.year || '',
        gender: m.gender || '',
        branch: m.branch || '',
        skillLevel: m.skillLevel || '',
        interests: m.interests || '',
        utr: m.utr || '',
        status: m.status || 'Pending',
        amount: m.amount || '599',
        photoUrl: m.photoUrl || '',
        paymentProofUrl: m.paymentProofUrl || '',
        forgeRole: m.forgeRole || m.role || '',
        linkedMentor: m.linkedMentor || '',
        forgeAccess: m.forgeAccess || '',
        xp: parseInt(m.xp) || 0,
        rank: m.rank || 'Apprentice',
        squad: m.squad || 'Unassigned',
      });

      console.log(`  OK IMPORTED: ${m.name} (${opId})`);
      imported++;
    } catch (err) {
      console.error(`  ERROR importing ${m.name}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`Imported: ${imported}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
