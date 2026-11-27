require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_portal';

async function seed() {
  const dataPath = path.join(__dirname, 'data', 'students.json');
  if (!fs.existsSync(dataPath)) {
    console.error('data/students.json not found!');
    process.exit(1);
  }

  const studentsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Found ${studentsData.length} students in data/students.json`);

  const saltRounds = 10;
  for (const item of studentsData) {
    if (item.password && !item.passwordHash) {
      item.passwordHash = await bcrypt.hash(item.password, saltRounds);
    }
  }

  // Save back to students.json
  fs.writeFileSync(dataPath, JSON.stringify(studentsData, null, 2), 'utf8');
  console.log('Synchronized and hashed passwords in data/students.json');

  // Try MongoDB if available
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB connected for seeding.');

    for (const studentData of studentsData) {
      const { password, ...rest } = studentData;
      await Student.findOneAndUpdate(
        { registerNumber: rest.registerNumber },
        rest,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`  Upserted into Mongo: ${rest.registerNumber} (${rest.name}) [${rest.role}]`);
    }

    await mongoose.disconnect();
    console.log('MongoDB disconnected cleanly.');
  } catch (err) {
    console.log('Note: MongoDB not running; JSON data file is ready and will be used directly.');
  }

  console.log('\nSeeding completed successfully!');
  console.log('Demo logins:');
  console.log('  Student: DEMO0001 / demo123');
  console.log('  Student: DEMO0002 / demo123');
  console.log('  Student: DEMO0003 / demo123');
  console.log('  Admin:   ADMIN / admin123');
  process.exit(0);
}

seed();
