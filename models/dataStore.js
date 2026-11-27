const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataFilePath = path.join(__dirname, '..', 'data', 'students.json');

// In-memory cache of students
let studentsCache = [];

function maskGovId(id) {
  if (!id) return '';
  const s = String(id);
  if (s.length > 4) {
    return '*'.repeat(s.length - 4) + s.slice(-4);
  }
  return s;
}

function wrapStudent(raw) {
  if (!raw) return null;
  
  // Clone to avoid accidental mutations
  const student = JSON.parse(JSON.stringify(raw));
  student._id = student._id || student.registerNumber;
  student.role = student.role || 'student';
  student.personal = student.personal || {};
  student.educational = student.educational || {};
  student.family = student.family || {};
  student.proctor = student.proctor || {};
  student.hostel = student.hostel || {};
  student.courses = student.courses || [];
  student.credits = student.credits || { required: 160, earned: 0 };
  student.cgpa = typeof student.cgpa === 'number' ? student.cgpa : 0;
  student.proctorMessage = student.proctorMessage || '';

  student.toSafeObject = function() {
    const obj = JSON.parse(JSON.stringify(this));
    delete obj.password;
    delete obj.passwordHash;
    if (obj.personal && obj.personal.governmentIdNumber) {
      obj.personal.governmentIdNumber = maskGovId(obj.personal.governmentIdNumber);
    }
    return obj;
  };

  student.markModified = function() {};

  student.save = async function() {
    return saveStudent(this);
  };

  return student;
}

function loadStudents() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf8');
      const list = JSON.parse(content);
      studentsCache = list.map(item => {
        item._id = item._id || item.registerNumber;
        // Hash password if plain text
        if (item.password && !item.passwordHash) {
          item.passwordHash = bcrypt.hashSync(item.password, 10);
        }
        return item;
      });
      console.log(`[dataStore] Loaded ${studentsCache.length} students from ${dataFilePath}`);
    } else {
      console.warn(`[dataStore] Data file not found at ${dataFilePath}`);
      studentsCache = [];
    }
  } catch (err) {
    console.error('[dataStore] Error loading students.json:', err);
  }
}

function persistToFile() {
  try {
    // Write formatted JSON
    fs.writeFileSync(dataFilePath, JSON.stringify(studentsCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[dataStore] Error writing to students.json:', err);
  }
}

async function saveStudent(studentObj) {
  const regNo = String(studentObj.registerNumber).trim().toUpperCase();
  const index = studentsCache.findIndex(s => String(s.registerNumber).toUpperCase() === regNo);
  
  const cleanData = JSON.parse(JSON.stringify(studentObj));
  // Keep password / passwordHash from cache if not updated
  if (index !== -1) {
    cleanData.passwordHash = cleanData.passwordHash || studentsCache[index].passwordHash;
    cleanData.password = cleanData.password || studentsCache[index].password;
    studentsCache[index] = cleanData;
  } else {
    studentsCache.push(cleanData);
  }
  
  persistToFile();
  return wrapStudent(cleanData);
}

function findByRegisterNumber(regNo) {
  if (!regNo) return null;
  const target = String(regNo).trim().toUpperCase();
  const raw = studentsCache.find(s => String(s.registerNumber).trim().toUpperCase() === target);
  return raw ? wrapStudent(raw) : null;
}

function findById(id) {
  if (!id) return null;
  const target = String(id).trim();
  const raw = studentsCache.find(s => 
    String(s._id) === target || 
    String(s.registerNumber).trim().toUpperCase() === target.toUpperCase()
  );
  return raw ? wrapStudent(raw) : null;
}

function getAllStudents() {
  return studentsCache.map(s => wrapStudent(s).toSafeObject());
}

async function createStudent(data) {
  const regNo = String(data.registerNumber).trim().toUpperCase();
  if (findByRegisterNumber(regNo)) {
    throw new Error(`Student with register number ${regNo} already exists`);
  }
  
  const student = { ...data };
  student.registerNumber = regNo;
  student._id = regNo;
  student.role = student.role || 'student';
  
  const rawPass = data.password || 'demo123';
  student.password = rawPass;
  student.passwordHash = bcrypt.hashSync(rawPass, 10);
  
  studentsCache.push(student);
  persistToFile();
  return wrapStudent(student);
}

function deleteStudent(regNoOrId) {
  const target = String(regNoOrId).trim().toUpperCase();
  const idx = studentsCache.findIndex(s => 
    String(s.registerNumber).trim().toUpperCase() === target ||
    String(s._id) === target
  );
  if (idx === -1) return false;
  studentsCache.splice(idx, 1);
  persistToFile();
  return true;
}

function importStudents(studentsArray) {
  if (!Array.isArray(studentsArray)) throw new Error('Expected an array of students');
  let count = 0;
  for (const s of studentsArray) {
    if (!s.registerNumber) continue;
    const regNo = String(s.registerNumber).trim().toUpperCase();
    const existingIdx = studentsCache.findIndex(item => String(item.registerNumber).toUpperCase() === regNo);
    
    const clone = { ...s, registerNumber: regNo, _id: s._id || regNo };
    if (clone.password && !clone.passwordHash) {
      clone.passwordHash = bcrypt.hashSync(clone.password, 10);
    }
    
    if (existingIdx !== -1) {
      clone.passwordHash = clone.passwordHash || studentsCache[existingIdx].passwordHash;
      studentsCache[existingIdx] = clone;
    } else {
      if (!clone.passwordHash) {
        clone.password = clone.password || 'demo123';
        clone.passwordHash = bcrypt.hashSync(clone.password, 10);
      }
      studentsCache.push(clone);
    }
    count++;
  }
  persistToFile();
  return count;
}

// Initial load
loadStudents();

module.exports = {
  loadStudents,
  findByRegisterNumber,
  findById,
  getAllStudents,
  createStudent,
  saveStudent,
  deleteStudent,
  importStudents,
  wrapStudent
};
