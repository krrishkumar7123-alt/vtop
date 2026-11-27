const express = require('express');
const router = express.Router();

// Serve Bootstrap 5 CSS
router.get('/get/bs/css/1', (req, res) => {
  res.redirect('/vtop/webjars/bootstrap/5.1.3/css/bootstrap.min.css');
});

router.get('/get/bs/css/2', (req, res) => {
  res.redirect('/vtop/webjars/bootstrapvalidator/0.5.3/css/bootstrapValidator.css');
});

// Serve Bootstrap Icons & Font Awesome 4.7.0
router.get('/get/ic/css/1', (req, res) => {
  res.redirect('/vtop/webjars/bootstrap-icons/1.10.5/font/bootstrap-icons.css');
});

router.get('/get/ic/css/2', (req, res) => {
  res.redirect('/vtop/webjars/font-awesome/4.7.0/css/font-awesome.css');
});

// Serve Bootstrap Icons (alias)
router.get('/get/bs/css/3', (req, res) => {
  res.redirect('/vtop/webjars/bootstrap-icons/1.10.5/font/bootstrap-icons.css');
});

// jQuery
router.get('/get/jq/js/1', (req, res) => {
  res.redirect('/vtop/webjars/jquery/3.6.4/jquery.js');
});

// Moment.js
router.get('/get/ms/js/1', (req, res) => {
  res.redirect('/vtop/webjars/momentjs/2.29.4/moment.js');
});

// jQuery Hotkeys
router.get('/get/jq/js/2', (req, res) => {
  res.redirect('/vtop/webjars/jQuery.Hotkeys/0.2.0/jquery.hotkeys.js');
});

// jQuery blockUI
router.get('/get/jq/js/3', (req, res) => {
  res.redirect('/vtop/webjars/jquery-blockui/2.70/jquery.blockUI.js');
});

// jQuery UI CSS
router.get('/get/jq/css/1', (req, res) => {
  res.redirect('/vtop/webjars/jquery-ui/1.13.2/jquery-ui.css');
});

// jQuery UI JS
router.get('/get/jq/js/4', (req, res) => {
  res.redirect('/vtop/webjars/jquery-ui/1.13.2/jquery-ui.js');
});

// Bootstrap 5 JS bundle & bootstrapValidator
router.get('/get/bs/js/3', (req, res) => {
  res.redirect('/vtop/webjars/bootstrap/5.1.3/js/bootstrap.bundle.min.js');
});

router.get('/get/bs/js/1', (req, res) => {
  res.redirect('/vtop/webjars/bootstrapvalidator/0.5.3/js/bootstrapValidator.js');
});

// Serve empty CSS for VTOP-specific stylesheets that don't exist locally
const emptyCSS = [
  '/assets/css/PreLogin.css',
  '/assets/css/bootstrap3-iso.css',
  '/assets/css/menu.css',
  '/assets/css/scrollableTable.css',
  '/assets/css/VTop.css',
  '/assets/css/CustomDatePicker.css',
  '/assets/css/CustomDateTimePicker.css',
  '/assets/css/CustomTimePicker.css',
  '/assets/css/CustomMonthYearPicker.css',
  '/assets/css/AdminLteCompatibility.css'
];

emptyCSS.forEach(cssPath => {
  router.get(cssPath, (req, res) => {
    res.type('text/css').send('/* VTOP CSS placeholder */');
  });
});

// Empty JS placeholders for VTOP-specific scripts
const emptyJS = [
  '/assets/js/Async.js',
  '/assets/js/vtopheader.js',
  '/assets/js/favourite.js'
];

emptyJS.forEach(jsPath => {
  router.get(jsPath, (req, res) => {
    res.type('application/javascript').send('// VTOP JS placeholder');
  });
});

// Placeholder for user images
router.get('/users/image/', (req, res) => {
  // Return a simple SVG avatar placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="20" fill="#1a237e"/>
    <text x="20" y="25" text-anchor="middle" fill="white" font-size="16" font-family="sans-serif">U</text>
  </svg>`;
  res.type('image/svg+xml').send(svg);
});

// Favicon placeholder
router.get('/assets/img/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Image placeholders for portal cards
const imageNames = ['students.png', 'employee.png', 'parent.png', 'alumni.png', 'google-play-badge.png'];
imageNames.forEach(img => {
  router.get(`/assets/img/${img}`, (req, res) => {
    const label = img.replace('.png', '').replace('google-play-badge', 'App');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="8" fill="#e3f2fd"/>
      <text x="40" y="48" text-anchor="middle" fill="#1565c0" font-size="12" font-family="sans-serif">${label}</text>
    </svg>`;
    res.type('image/svg+xml').send(svg);
  });
});

// GIF placeholder
router.get('/assets/gif/ajax-loader_bert.gif', (req, res) => {
  res.status(204).end();
});

module.exports = router;
