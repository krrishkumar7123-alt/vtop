const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'students.json');
const students = JSON.parse(fs.readFileSync(file, 'utf8'));
const s = students.find(x => x.registerNumber === '25BCE10137');

if (!s) {
  console.error('Student 25BCE10137 not found');
  process.exit(1);
}

// Keep registerNumber ("25BCE10137") and passwordHash unchanged
s.name = 'KRRISH KUMAR';
s.email = 'krrish.25bsa10137@vitbhopal.ac.in';
s.program = 'BTECH - Computer Science and Engineering (Cloud Computing and Automation)';
s.school = 'School of Computing Science Engineering and Artificial Intelligence (SCAI)';

s.personal = {
  ...(s.personal || {}),
  applicationNumber: '2025022301',
  name: 'KRRISH KUMAR',
  dateOfBirth: '08-Apr-2006',
  gender: 'MALE',
  nativeLanguage: 'HINDI',
  nativeState: 'BIHAR',
  bloodGroup: 'O+',
  physicallyChallenged: 'NO',
  community: 'GENERAL',
  religion: 'HINDU',
  caste: 'AHIR',
  nationality: 'INDIAN',
  hosteller: 'HOSTELLER',
  governmentIdType: 'Aadhar',
  governmentIdNumber: '547187724177',
  mobileNumber: '8355990423',
  currentAddress: {
    street: 'SHASHAANK 6D. VARUNAPURI, TRISHUL HILL',
    area: 'DABOLIM AIRPORT',
    city: 'SOUTH GOA',
    state: 'GOA',
    country: 'INDIA',
    pincode: '403802',
    landline: '',
    email: 'krrishkumar7123@gmail.com'
  },
  permanentAddress: {
    ...(s.personal?.permanentAddress || {}),
    street: 'MADHUPALLY COLONY, DANAPUR',
    area: 'Bailey road , saguna more',
    city: 'PATNA',
    state: 'BIHAR',
    country: 'INDIA',
    pincode: '801503'
  }
};

s.educational = {
  ...(s.educational || {}),
  appliedDegree: 'UG',
  qualification: '12TH/INTERMEDIATE',
  branchGroupStudied: 'CSE(CLOUD COMPUTING AND AUTOMATION)',
  schoolName: 'NAVY CHILDREN SCHOOL',
  mediumOfStudy: 'ENGLISH',
  board: 'CENTRAL BOARD OF SECONDARY EDUCATION',
  registerRollNo: '15601633',
  classObtained: '12',
  yearOfPassing: '2024',
  monthOfPassing: 'MAY',
  breakInStudy: 'YES',
  breakReason: 'PREPARE BETTER FOR MY ACADEMIC GROWTH',
  schoolAddress: {
    area: 'DABOLIM',
    cityDistrict: 'SOUTH GOA',
    state: 'GOA',
    pincode: '403801',
    landline: ''
  }
};

s.proctor = {
  ...(s.proctor || {}),
  employeeId: '100079',
  proctorName: 'AKSHARA MAKRARIYA',
  designation: 'Associate Professor Grade 2',
  school: 'School of Applied Science and Language',
  cabinRoom: 'null',
  department: 'SASL-Department',
  email: 'akshara.makrariya@vitbhopal.ac.in',
  intercom: '',
  mobile: '7748836973'
};

s.hostel = {
  ...(s.hostel || {}),
  applicationNumber: '2025022301',
  registerNumber: '25BCE10137',
  blockName: 'MENS HOSTEL BLOCK-5 (BOYS HOSTEL - Block )',
  roomNo: 'B213',
  bedType: '4- BED -NACPF'
};

fs.writeFileSync(file, JSON.stringify(students, null, 2), 'utf8');
console.log('Updated profile data for', s.registerNumber, '->', s.name);
