const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const { parseJsonArray } = require('../utils/matchmaking');

const router = express.Router();

function formatUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return {
    ...rest,
    subjects: parseJsonArray(rest.subjects),
    interests: parseJsonArray(rest.interests),
    goals: parseJsonArray(rest.goals),
    availability: parseJsonArray(rest.availability)
  };
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full_name are required' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(full_name).trim();

    if (!trimmedName) {
      return res.status(400).json({ error: 'Full name cannot be empty' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
      INSERT INTO users (email, password, full_name)
      VALUES (?, ?, ?)
    `).run(normalizedEmail, hashedPassword, trimmedName);

    const createdUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: createdUser.id, email: createdUser.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: formatUser(createdUser)
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;
