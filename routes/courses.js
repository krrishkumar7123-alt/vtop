const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// GET /courses - Retrieve courses, credits, CGPA, and proctor message
router.get('/courses', auth, async (req, res) => {
  try {
    const student = req.student;
    return res.json({
      courses: student.courses || [],
      credits: student.credits || { required: 160, earned: 0 },
      cgpa: student.cgpa || 0,
      proctorMessage: student.proctorMessage || ''
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve courses', details: err.message });
  }
});

module.exports = router;
