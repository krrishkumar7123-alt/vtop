const fs = require('fs');
const path = require('path');

const harPath = 'C:/Users/Ksqua/.gemini/antigravity/brain/cb1b6d50-5700-47e9-be02-0b3678815a53/.user_uploaded/media_1795787318391_38273985.har';
const outBase = path.join(__dirname, '..', 'public');

const har = JSON.parse(fs.readFileSync(harPath, 'utf8'));
let extracted = 0;

for (const entry of har.log.entries) {
  if (entry.response.status !== 200 || !entry.response.content || !entry.response.content.text) continue;
  const u = new URL(entry.request.url);
  const p = u.pathname;

  // 1. Extract dashboard HTML from /vtop/content
  if (p === '/vtop/content') {
    let html = entry.response.content.text;
    // Remove <base href="...">
    html = html.replace(/<base\s+href=["']https:\/\/vtop\.vitbhopal\.ac\.in\/vtop\/["']\s*>/gi, '');
    // Replace any hardcoded student ID/image placeholder so bridge fills it cleanly
    html = html.replace(/\/vtop\/users\/image\/\?id=[^"']+/g, '/vtop/users/image/');
    html = html.replace(/25BSA10137\s*\(STUDENT\)/g, 'Loading...');
    html = html.replace(/value="25BSA10137"/g, 'value=""');
    // Append dashboard-bridge.js
    if (!html.includes('/js/dashboard-bridge.js')) {
      html = html.replace(/<\/body>/i, '    <script src="/js/dashboard-bridge.js"></script>\n</body>');
    }
    const dashTarget = path.join(outBase, 'dashboard.html');
    fs.writeFileSync(dashTarget, html, 'utf8');
    console.log('Updated dashboard.html from /vtop/content (' + html.length + ' chars)');
    extracted++;
    continue;
  }

  // 2. Extract webjars & assets
  const shouldExtract =
    p.startsWith('/vtop/webjars/') ||
    p.startsWith('/vtop/assets/css/') ||
    p.startsWith('/vtop/assets/fonts/') ||
    p.startsWith('/vtop/assets/gif/') ||
    p === '/vtop/assets/img/favicon.ico' ||
    p === '/vtop/assets/js/menu.js';

  if (!shouldExtract) continue;

  const target = path.join(outBase, p.replace(/^\//, ''));
  fs.mkdirSync(path.dirname(target), { recursive: true });

  const { text, encoding } = entry.response.content;
  if (encoding === 'base64') {
    fs.writeFileSync(target, Buffer.from(text, 'base64'));
  } else {
    fs.writeFileSync(target, text, 'utf8');
  }
  console.log('Extracted:', p, `(${entry.response.content.size} bytes)`);
  extracted++;
}

console.log('Total extracted:', extracted);
