const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataStore = require('../models/dataStore');
const bcrypt = require('bcryptjs');

// Admin role check middleware
function requireAdmin(req, res, next) {
  if (!req.student || req.student.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin role required' });
  }
  next();
}

// Apply auth and requireAdmin to all /api/admin routes
router.use(auth, requireAdmin);

// GET /api/admin/students - List all students
router.get('/students', (req, res) => {
  try {
    const students = dataStore.getAllStudents();
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch students', details: err.message });
  }
});

// GET /api/admin/students/:id - Get specific student details
router.get('/students/:id', (req, res) => {
  try {
    const student = dataStore.findById(req.params.id) || dataStore.findByRegisterNumber(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json(student.toSafeObject());
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch student', details: err.message });
  }
});

// POST /api/admin/students - Create a new student
router.post('/students', async (req, res) => {
  try {
    const { registerNumber, name, program, email, school, password, role } = req.body;
    if (!registerNumber || !name) {
      return res.status(400).json({ error: 'Register number and name are required' });
    }
    
    const newStudent = await dataStore.createStudent({
      registerNumber,
      name,
      program: program || '',
      email: email || '',
      school: school || '',
      password: password || 'demo123',
      role: role || 'student',
      ...req.body
    });
    
    return res.status(201).json(newStudent.toSafeObject());
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/students/:id - Update student details
router.put('/students/:id', async (req, res) => {
  try {
    const student = dataStore.findById(req.params.id) || dataStore.findByRegisterNumber(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updates = req.body;
    for (const [key, val] of Object.entries(updates)) {
      if (key === 'password' && val) {
        student.password = val;
        student.passwordHash = bcrypt.hashSync(val, 10);
      } else if (key !== '_id') {
        student[key] = val;
      }
    }

    await student.save();
    return res.json(student.toSafeObject());
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update student', details: err.message });
  }
});

// DELETE /api/admin/students/:id - Delete a student
router.delete('/students/:id', (req, res) => {
  try {
    const success = dataStore.deleteStudent(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete student', details: err.message });
  }
});

// POST /api/admin/students/:id/reset-password - Reset a student's password
router.post('/students/:id/reset-password', async (req, res) => {
  try {
    const student = dataStore.findById(req.params.id) || dataStore.findByRegisterNumber(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const newPass = req.body.password || 'demo123';
    student.password = newPass;
    student.passwordHash = bcrypt.hashSync(newPass, 10);
    await student.save();
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset password', details: err.message });
  }
});

// GET /api/admin/export - Export all students as JSON
router.get('/export', (req, res) => {
  try {
    const all = dataStore.getAllStudents();
    res.setHeader('Content-Disposition', 'attachment; filename=students.json');
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(all, null, 2));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to export students', details: err.message });
  }
});

// POST /api/admin/import - Import students from JSON array
router.post('/import', (req, res) => {
  try {
    const studentsArray = req.body;
    if (!Array.isArray(studentsArray)) {
      return res.status(400).json({ error: 'Expected an array of students' });
    }
    const importedCount = dataStore.importStudents(studentsArray);
    return res.json({ success: true, count: importedCount, message: `Successfully imported ${importedCount} students` });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to import students', details: err.message });
  }
});

module.exports = router;
