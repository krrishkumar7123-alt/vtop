const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public');
const files = {
  'index.html': '/js/index-bridge.js',
  'login.html': '/js/login-bridge.js',
  'dashboard.html': '/js/dashboard-bridge.js',
  'profile.html': '/js/profile-bridge.js'
};

for (const [f, js] of Object.entries(files)) {
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/<base\s+href=["']https:\/\/vtop\.vitbhopal\.ac\.in\/vtop\/["']\s*\/?>/gi, '');
  // Point directly to local webjars CSS so cached 302 redirects never break icons
  s = s.replace(/\/vtop\/get\/ic\/css\/1/g, '/vtop/webjars/bootstrap-icons/1.10.5/font/bootstrap-icons.css');
  s = s.replace(/\/vtop\/get\/ic\/css\/2/g, '/vtop/webjars/font-awesome/4.7.0/css/font-awesome.css');
  s = s.replace(/\/vtop\/get\/bs\/css\/1/g, '/vtop/webjars/bootstrap/5.1.3/css/bootstrap.min.css');
  if (!s.includes(js)) {
    s = s.replace(/<\/body>/i, `    <script src="${js}"></script>\n</body>`);
  }
  fs.writeFileSync(p, s, 'utf8');
  console.log('Updated', f, '-> bridge:', s.includes(js), 'hasBase:', s.includes('<base '));
}
