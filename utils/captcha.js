const { v4: uuidv4 } = require('uuid');

// In-memory captcha store
const captchaStore = new Map();

// Auto-expire captchas after 5 minutes
const CAPTCHA_EXPIRY_MS = 5 * 60 * 1000;

// Characters to use (avoid confusing ones: 0/O, 1/I/l)
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function generateRandomText(length = 6) {
  let text = '';
  for (let i = 0; i < length; i++) {
    text += randomChar();
  }
  return text;
}

function randomColor() {
  const r = Math.floor(Math.random() * 100 + 50);
  const g = Math.floor(Math.random() * 100 + 50);
  const b = Math.floor(Math.random() * 100 + 50);
  return `rgb(${r},${g},${b})`;
}

function generateCaptchaSVG(text) {
  const width = 200;
  const height = 60;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  // Background
  svg += `<rect width="${width}" height="${height}" fill="#f0f0f0"/>`;

  // Noise lines
  for (let i = 0; i < 8; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const color = `rgb(${Math.floor(Math.random()*200+55)},${Math.floor(Math.random()*200+55)},${Math.floor(Math.random()*200+55)})`;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1" opacity="0.5"/>`;
  }

  // Noise dots
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = Math.random() * 2 + 0.5;
    const color = `rgb(${Math.floor(Math.random()*200+55)},${Math.floor(Math.random()*200+55)},${Math.floor(Math.random()*200+55)})`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.4"/>`;
  }

  // Draw each character
  const charWidth = width / (text.length + 1);
  for (let i = 0; i < text.length; i++) {
    const x = charWidth * (i + 0.5) + Math.random() * 10 - 5;
    const y = height / 2 + Math.random() * 10 + 5;
    const rotation = Math.random() * 30 - 15;
    const fontSize = 28 + Math.floor(Math.random() * 8);
    const color = randomColor();
    svg += `<text x="${x}" y="${y}" font-family="monospace, Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${color}" transform="rotate(${rotation}, ${x}, ${y})">${text[i]}</text>`;
  }

  // Wavy line through middle
  let path = `M 0 ${height/2}`;
  for (let x = 0; x <= width; x += 10) {
    const y = height/2 + Math.sin(x * 0.05) * 10 + Math.random() * 5 - 2.5;
    path += ` L ${x} ${y}`;
  }
  svg += `<path d="${path}" fill="none" stroke="${randomColor()}" stroke-width="1.5" opacity="0.6"/>`;

  svg += '</svg>';
  return svg;
}

function generateCaptcha() {
  const text = generateRandomText(6);
  const captchaId = uuidv4();
  const svgContent = generateCaptchaSVG(text);

  // Convert SVG to base64 data URI
  const base64 = Buffer.from(svgContent).toString('base64');
  const imageBase64 = `data:image/svg+xml;base64,${base64}`;

  // Store captcha with expiry
  captchaStore.set(captchaId, {
    text: text.toUpperCase(),
    createdAt: Date.now()
  });

  // Schedule cleanup
  setTimeout(() => {
    captchaStore.delete(captchaId);
  }, CAPTCHA_EXPIRY_MS);

  return { captchaId, captchaImage: imageBase64 };
}

function validateCaptcha(captchaId, userInput) {
  const entry = captchaStore.get(captchaId);
  if (!entry) return false;

  // Delete after validation (one-time use)
  captchaStore.delete(captchaId);

  // Check expiry
  if (Date.now() - entry.createdAt > CAPTCHA_EXPIRY_MS) {
    return false;
  }

  return entry.text === userInput.toUpperCase().trim();
}

module.exports = { generateCaptcha, validateCaptcha };
