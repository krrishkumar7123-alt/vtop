const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataStore = require('../models/dataStore');
const { generateCaptcha, validateCaptcha } = require('../utils/captcha');
const loginLimiter = require('../middleware/rateLimiter');

// POST /captcha & GET /captcha - Generate new CAPTCHA
const handleCaptchaGeneration = (req, res) => {
  try {
    const result = generateCaptcha();
    return res.json({
      captchaId: result.captchaId,
      captchaImage: result.captchaImage
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate CAPTCHA', details: err.message });
  }
};

router.post('/captcha', handleCaptchaGeneration);
router.get('/captcha', handleCaptchaGeneration);

// POST /login - Authenticate student
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { registerNumber, password, captchaId, captchaAnswer } = req.body;

    // Validate captcha if provided
    if (captchaId && captchaAnswer) {
      const isCaptchaValid = validateCaptcha(captchaId, captchaAnswer);
      if (!isCaptchaValid) {
        return res.status(400).json({ error: 'Invalid CAPTCHA. Please try again.' });
      }
    }

    if (!registerNumber || !password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const student = dataStore.findByRegisterNumber(registerNumber);
    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with bcrypt or plain text
    let isMatch = false;
    if (student.passwordHash) {
      isMatch = await bcrypt.compare(password, student.passwordHash);
    }
    if (!isMatch && student.password) {
      isMatch = (password === student.password);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'change_this_to_a_secure_random_string';
    const timeoutMinutes = parseInt(process.env.SESSION_TIMEOUT_MINUTES, 10) || 30;

    const token = jwt.sign(
      { id: student._id || student.registerNumber, role: student.role || 'student' },
      secret,
      { expiresIn: `${timeoutMinutes}m` }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: timeoutMinutes * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    });

    return res.json({
      success: true,
      role: student.role || 'student',
      student: student.toSafeObject()
    });
  } catch (err) {
    console.error('API login error:', err);
    return res.status(500).json({ error: 'Internal login error', details: err.message });
  }
});

// POST /logout - Clear token cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict'
  });
  return res.json({ success: true });
});

module.exports = router;
