const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'studysync_jwt_secret_2024';

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, full_name, avatar_url, bio, college, course, academic_year, subjects, interests, goals, availability, profile_completed, created_at FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken, JWT_SECRET };
