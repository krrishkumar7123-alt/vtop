const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Helper validators
const isValidEmail = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => !phone || /^[\d\s+\-()]{7,15}$/.test(phone);
const isValidPincode = (pincode) => !pincode || /^\d{5,8}$/.test(pincode);

// GET /me - Get current authenticated student's profile
router.get('/me', auth, (req, res) => {
  return res.json(req.student.toSafeObject());
});

// PUT /me/header - Update program, email, and school
router.put('/me/header', auth, async (req, res) => {
  try {
    const { program, email, school } = req.body;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    if (program !== undefined) req.student.program = program;
    if (email !== undefined) req.student.email = email;
    if (school !== undefined) req.student.school = school;

    await req.student.save();
    return res.json(req.student.toSafeObject());
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update student header', details: err.message });
  }
});

// PUT /me/:section - Update a specific section
const VALID_SECTIONS = ['personal', 'educational', 'family', 'proctor', 'hostel'];

router.put('/me/:section', auth, async (req, res) => {
  try {
    const { section } = req.params;

    if (!VALID_SECTIONS.includes(section)) {
      return res.status(400).json({
        error: `Invalid section: ${section}. Valid sections are: ${VALID_SECTIONS.join(', ')}`
      });
    }

    const updateData = { ...req.body };

    // Validation per section
    if (section === 'personal') {
      if (updateData.mobileNumber && !isValidPhone(updateData.mobileNumber)) {
        return res.status(400).json({ error: 'Invalid mobile number format' });
      }
      if (updateData.currentAddress) {
        if (updateData.currentAddress.email && !isValidEmail(updateData.currentAddress.email)) {
          return res.status(400).json({ error: 'Invalid current address email format' });
        }
        if (updateData.currentAddress.pincode && !isValidPincode(updateData.currentAddress.pincode)) {
          return res.status(400).json({ error: 'Invalid current address pincode' });
        }
      }
      if (updateData.permanentAddress) {
        if (updateData.permanentAddress.email && !isValidEmail(updateData.permanentAddress.email)) {
          return res.status(400).json({ error: 'Invalid permanent address email format' });
        }
        if (updateData.permanentAddress.pincode && !isValidPincode(updateData.permanentAddress.pincode)) {
          return res.status(400).json({ error: 'Invalid permanent address pincode' });
        }
      }
      if (updateData.governmentIdNumber !== undefined) {
        if (String(updateData.governmentIdNumber).includes('*')) {
          delete updateData.governmentIdNumber;
        }
      }
    } else if (section === 'educational') {
      if (updateData.schoolAddress && updateData.schoolAddress.pincode && !isValidPincode(updateData.schoolAddress.pincode)) {
        return res.status(400).json({ error: 'Invalid school pincode' });
      }
    } else if (section === 'family') {
      if (updateData.father) {
        if (updateData.father.email && !isValidEmail(updateData.father.email)) {
          return res.status(400).json({ error: 'Invalid father email format' });
        }
        if (updateData.father.mobile && !isValidPhone(updateData.father.mobile)) {
          return res.status(400).json({ error: 'Invalid father mobile format' });
        }
      }
      if (updateData.mother) {
        if (updateData.mother.email && !isValidEmail(updateData.mother.email)) {
          return res.status(400).json({ error: 'Invalid mother email format' });
        }
        if (updateData.mother.mobile && !isValidPhone(updateData.mother.mobile)) {
          return res.status(400).json({ error: 'Invalid mother mobile format' });
        }
      }
    } else if (section === 'proctor') {
      if (updateData.email && !isValidEmail(updateData.email)) {
        return res.status(400).json({ error: 'Invalid proctor email format' });
      }
      if (updateData.mobile && !isValidPhone(updateData.mobile)) {
        return res.status(400).json({ error: 'Invalid proctor mobile format' });
      }
    }

    if (!req.student[section]) {
      req.student[section] = {};
    }

    // Merge updates into section
    for (const [key, val] of Object.entries(updateData)) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        if (!req.student[section][key]) {
          req.student[section][key] = {};
        }
        Object.assign(req.student[section][key], val);
      } else {
        req.student[section][key] = val;
      }
    }

    req.student.markModified(section);
    await req.student.save();

    return res.json(req.student.toSafeObject());
  } catch (err) {
    console.error('Section update error:', err);
    return res.status(500).json({ error: 'Failed to update section', details: err.message });
  }
});

// POST /me/photo - Upload profile photo
router.post('/me/photo', auth, (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    req.student.photoUrl = `/uploads/${req.file.filename}`;
    await req.student.save();

    return res.json({ photoUrl: req.student.photoUrl });
  } catch (err) {
    console.error('Photo upload error:', err);
    return res.status(500).json({ error: 'Failed to update profile photo', details: err.message });
  }
});

module.exports = router;
