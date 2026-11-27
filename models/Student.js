const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  area: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: '' },
  pincode: { type: String, default: '' },
  landline: { type: String, default: '' },
  email: { type: String, default: '' }
}, { _id: false });

const parentInfoSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  qualification: { type: String, default: '' },
  occupation: { type: String, default: '' },
  organization: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  mobile: { type: String, default: '' },
  email: { type: String, default: '' },
  annualIncome: { type: String, default: '' },
  officialAddress: { type: String, default: '' },
  state: { type: String, default: '' },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
  landline: { type: String, default: '' },
  designation: { type: String, default: '' }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['Theory', 'Lab', 'Project', 'Embedded Theory', 'Embedded Lab'], default: 'Theory' },
  attendance: { type: Number, default: 0 }
}, { _id: false });

const personalSchema = new mongoose.Schema({
  applicationNumber: { type: String, default: '' },
  name: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  gender: { type: String, default: '' },
  nativeLanguage: { type: String, default: '' },
  nativeState: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  physicallyChallenged: { type: String, default: 'No' },
  community: { type: String, default: '' },
  religion: { type: String, default: '' },
  nationality: { type: String, default: '' },
  hosteller: { type: String, default: 'No' },
  governmentIdNumber: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  currentAddress: { type: addressSchema, default: () => ({}) },
  permanentAddress: {
    type: new mongoose.Schema({
      street: { type: String, default: '' },
      area: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      pincode: { type: String, default: '' },
      landline: { type: String, default: '' },
      email: { type: String, default: '' },
      friendMobileNumber: { type: String, default: '' }
    }, { _id: false }),
    default: () => ({})
  }
}, { _id: false });

const educationalSchema = new mongoose.Schema({
  appliedDegree: { type: String, default: '' },
  qualification: { type: String, default: '' },
  branchGroupStudied: { type: String, default: '' },
  schoolName: { type: String, default: '' },
  mediumOfStudy: { type: String, default: '' },
  board: { type: String, default: '' },
  registerRollNo: { type: String, default: '' },
  classObtained: { type: String, default: '' },
  yearOfPassing: { type: String, default: '' },
  monthOfPassing: { type: String, default: '' },
  schoolAddress: {
    type: new mongoose.Schema({
      area: { type: String, default: '' },
      cityDistrict: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      landline: { type: String, default: '' }
    }, { _id: false }),
    default: () => ({})
  },
  breakInStudy: { type: String, default: 'No' },
  breakReason: { type: String, default: '' }
}, { _id: false });

const familySchema = new mongoose.Schema({
  numberOfBrothers: { type: String, default: '0' },
  numberOfSisters: { type: String, default: '0' },
  siblingStudyingInUniversity: { type: String, default: 'No' },
  siblingStudyingDetails: { type: String, default: '' },
  siblingStudied: { type: String, default: 'No' },
  siblingStudiedDetails: { type: String, default: '' },
  father: { type: parentInfoSchema, default: () => ({}) },
  mother: { type: parentInfoSchema, default: () => ({}) },
  guardian: { type: parentInfoSchema, default: () => ({}) }
}, { _id: false });

const proctorSchema = new mongoose.Schema({
  proctorName: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  designation: { type: String, default: '' },
  school: { type: String, default: '' },
  cabinRoom: { type: String, default: '' },
  email: { type: String, default: '' },
  mobile: { type: String, default: '' }
}, { _id: false });

const hostelSchema = new mongoose.Schema({
  applicationNumber: { type: String, default: '' },
  registerNumber: { type: String, default: '' },
  blockName: { type: String, default: '' },
  roomNo: { type: String, default: '' },
  bedType: { type: String, default: '' },
  messInformation: { type: String, default: '' }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  registerNumber: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  photoUrl: { type: String, default: '' },
  program: { type: String, default: '' },
  email: { type: String, default: '' },
  school: { type: String, default: '' },
  personal: { type: personalSchema, default: () => ({}) },
  educational: { type: educationalSchema, default: () => ({}) },
  family: { type: familySchema, default: () => ({}) },
  proctor: { type: proctorSchema, default: () => ({}) },
  hostel: { type: hostelSchema, default: () => ({}) },
  courses: [courseSchema],
  credits: {
    required: { type: Number, default: 160 },
    earned: { type: Number, default: 0 }
  },
  cgpa: { type: Number, default: 0 },
  proctorMessage: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

// Never return passwordHash in queries by default
studentSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  // Mask government ID - show only last 4 chars
  if (obj.personal && obj.personal.governmentIdNumber) {
    const id = obj.personal.governmentIdNumber;
    if (id.length > 4) {
      obj.personal.governmentIdNumber = '*'.repeat(id.length - 4) + id.slice(-4);
    }
  }
  return obj;
};

module.exports = mongoose.model('Student', studentSchema);
