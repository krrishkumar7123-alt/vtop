const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const file = path.join(__dirname, '..', 'data', 'students.json');
const students = JSON.parse(fs.readFileSync(file, 'utf8'));

const target = students.find(s => s.registerNumber === 'DEMO0001' || s.registerNumber === '25BCE10137');
if (!target) {
  console.error('Target student not found');
  process.exit(1);
}

target.registerNumber = '25BCE10137';
target.passwordHash = bcrypt.hashSync('@Fcb7123', 10);
if (target.hostel && target.hostel.registerNo) {
  target.hostel.registerNo = '25BCE10137';
}

fs.writeFileSync(file, JSON.stringify(students, null, 2), 'utf8');
console.log('Updated:', target.registerNumber, 'bcrypt match:', bcrypt.compareSync('@Fcb7123', target.passwordHash));
