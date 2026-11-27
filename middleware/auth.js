const jwt = require('jsonwebtoken');
const dataStore = require('../models/dataStore');

module.exports = async function auth(req, res, next) {
  try {
    let token = req.cookies && req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const secret = process.env.JWT_SECRET || 'change_this_to_a_secure_random_string';
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Look up in dataStore (json-backed)
    const student = dataStore.findById(decoded.id);
    if (!student) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    req.student = student;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication required' });
  }
};
