require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const coursesRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const vtopProxy = require('./routes/vtopProxy');
const dataStore = require('./models/dataStore');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_portal';

// Attempt to connect to MongoDB in background; fall back to dataStore cleanly if unavailable
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('[MongoDB] Connected successfully');
  })
  .catch((err) => {
    console.warn('[MongoDB] Not running or unavailable, using JSON file data store (data/students.json)');
  });

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));

// CORS setup
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Parsing middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Directories
const uploadsPath = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
} catch (_) {
  // Ignore on read-only serverless filesystems (e.g., Vercel)
}

const publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

// Serve static assets
app.use(express.static(publicPath));
app.use('/uploads', express.static(uploadsPath));

// VTOP asset proxy — serves Bootstrap/jQuery/FontAwesome CDN redirects
// and empty placeholders for VTOP-specific CSS/JS/images
app.use('/vtop', vtopProxy);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', studentRoutes);
app.use('/api', coursesRoutes);

// Captcha image route for login.html inline captcha refresh
app.get('/vtop/get/new/captcha', (req, res) => {
  const { generateCaptcha } = require('./utils/captcha');
  const result = generateCaptcha();
  const html = `<img class="form-control img-fluid bg-light border-0" height="325" src="${result.captchaImage}" aria-describedby="button-addon2">
    <input type="hidden" id="captchaId" name="captchaId" value="${result.captchaId}">
    <button class="btn btn-success" type="button" onclick="loadCaptcha()" id="button-addon2"> <i class="fa fa-refresh" aria-hidden="true"></i></button>`;
  res.send(html);
});

// Handle login form POST (the HTML form posts to /vtop/login)
app.post('/vtop/login', async (req, res) => {
  try {
    const { username, password, captchaStr } = req.body;
    const { validateCaptcha } = require('./utils/captcha');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    // Get captchaId from the hidden input
    const captchaId = req.body.captchaId;

    // Validate captcha if captchaId is present
    if (captchaId) {
      const isValid = captchaStr ? validateCaptcha(captchaId, captchaStr) : false;
      if (!isValid) {
        return res.redirect('/login.html?error=Invalid+CAPTCHA.+Please+try+again.');
      }
    }

    if (!username || !password) {
      return res.redirect('/login.html?error=Please+enter+username+and+password.');
    }

    const student = dataStore.findByRegisterNumber(username);
    if (!student) {
      return res.redirect('/login.html?error=Invalid+credentials.');
    }

    let isMatch = false;
    if (student.passwordHash) {
      isMatch = await bcrypt.compare(password, student.passwordHash);
    }
    if (!isMatch && student.password) {
      isMatch = (password === student.password);
    }

    if (!isMatch) {
      return res.redirect('/login.html?error=Invalid+credentials.');
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

    // If role is admin, redirect to admin.html, otherwise dashboard.html
    if (student.role === 'admin') {
      return res.redirect('/admin.html');
    }
    return res.redirect('/dashboard.html');
  } catch (err) {
    console.error('Login error:', err);
    return res.redirect('/login.html?error=Internal+server+error.');
  }
});

// Handle VTOP logout form POST
app.post('/vtop/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  return res.redirect('/index.html');
});

// Handle VTOP prelogin/setup form POST (from index.html cards)
app.post('/vtop/prelogin/setup', (req, res) => {
  const flag = req.body.flag;
  if (flag === 'VTOP') {
    return res.redirect('/login.html');
  }
  return res.redirect('/index.html?msg=coming_soon');
});

// Session expired
app.get('/vtop/session/expired/out', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  return res.redirect('/login.html?error=Session+expired.');
});

// Forgot password / forgot userId
app.post('/vtop/resetPassword', (req, res) => {
  res.send('<div class="alert alert-info m-3">Password reset feature: Please contact admin.</div>');
});
app.post('/vtop/forgotUserID', (req, res) => {
  res.send('<div class="alert alert-info m-3">Forgot User ID feature: Please contact admin.</div>');
});

// VTOP redirects
app.get('/vtop/home', (req, res) => {
  res.redirect('/dashboard.html');
});

app.get('/vtop/open/page', (req, res) => {
  res.redirect('/index.html');
});

// Route handlers for clean URLs
app.get('/login', (req, res) => {
  res.sendFile(path.join(publicPath, 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(publicPath, 'dashboard.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(publicPath, 'profile.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicPath, 'admin.html'));
});

// Start server (skip listen on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
