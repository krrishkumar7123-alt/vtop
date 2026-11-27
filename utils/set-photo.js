const fs = require('fs');
const path = require('path');

const harPath = 'C:/Users/Ksqua/.gemini/antigravity/brain/cb1b6d50-5700-47e9-be02-0b3678815a53/.user_uploaded/media_1795787318391_38273985.har';
const har = JSON.parse(fs.readFileSync(harPath, 'utf8'));
const imgEntry = har.log.entries.find(e => e.request.url.includes('/vtop/users/image/') && e.response.status === 200);

if (!imgEntry || !imgEntry.response.content || !imgEntry.response.content.text) {
  console.error('Image entry not found in HAR');
  process.exit(1);
}

const outImg = path.join(__dirname, '..', 'uploads', '25BCE10137.png');
const buf = Buffer.from(imgEntry.response.content.text, imgEntry.response.content.encoding === 'base64' ? 'base64' : 'utf8');
fs.writeFileSync(outImg, buf);
console.log('Saved photo:', outImg, buf.length, 'bytes');

const studentsPath = path.join(__dirname, '..', 'data', 'students.json');
const students = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
const target = students.find(s => s.registerNumber === '25BCE10137');
if (target) {
  target.photoUrl = '/uploads/25BCE10137.png';
  fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2), 'utf8');
  console.log('Updated 25BCE10137 photoUrl ->', target.photoUrl);
}
