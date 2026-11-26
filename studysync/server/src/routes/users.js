const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { calculateCompatibility, parseJsonArray } = require('../utils/matchmaking');

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

// GET /api/users/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    return res.json({ user: formatUser(req.user) });
  } catch (err) {
    console.error('Get current user error:', err);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/me
router.put('/me', authenticateToken, (req, res) => {
  try {
    const {
      full_name,
      bio,
      college,
      course,
      academic_year,
      subjects,
      interests,
      goals,
      availability,
      avatar_url
    } = req.body;

    const current = req.user;

    const nextFullName = full_name !== undefined ? String(full_name).trim() : current.full_name;
    if (!nextFullName) {
      return res.status(400).json({ error: 'Full name cannot be empty' });
    }

    const nextBio = bio !== undefined ? bio : current.bio;
    const nextCollege = college !== undefined ? college : current.college;
    const nextCourse = course !== undefined ? course : current.course;
    const nextYear = academic_year !== undefined ? (academic_year === null || academic_year === '' ? null : Number(academic_year)) : current.academic_year;
    const nextAvatar = avatar_url !== undefined ? avatar_url : current.avatar_url;

    const nextSubjects = subjects !== undefined ? parseJsonArray(subjects) : parseJsonArray(current.subjects);
    const nextInterests = interests !== undefined ? parseJsonArray(interests) : parseJsonArray(current.interests);
    const nextGoals = goals !== undefined ? parseJsonArray(goals) : parseJsonArray(current.goals);
    const nextAvailability = availability !== undefined ? parseJsonArray(availability) : parseJsonArray(current.availability);

    const isCompleted =
      Boolean(nextFullName) &&
      Boolean(nextCollege && String(nextCollege).trim()) &&
      Boolean(nextCourse && String(nextCourse).trim()) &&
      Boolean(nextYear) &&
      nextSubjects.length > 0 &&
      nextInterests.length > 0 &&
      nextGoals.length > 0 &&
      nextAvailability.length > 0
        ? 1
        : current.profile_completed;

    db.prepare(`
      UPDATE users
      SET full_name = ?,
          bio = ?,
          college = ?,
          course = ?,
          academic_year = ?,
          subjects = ?,
          interests = ?,
          goals = ?,
          availability = ?,
          avatar_url = ?,
          profile_completed = ?
      WHERE id = ?
    `).run(
      nextFullName,
      nextBio,
      nextCollege,
      nextCourse,
      nextYear,
      JSON.stringify(nextSubjects),
      JSON.stringify(nextInterests),
      JSON.stringify(nextGoals),
      JSON.stringify(nextAvailability),
      nextAvatar,
      isCompleted,
      current.id
    );

    const updated = db.prepare('SELECT id, email, full_name, avatar_url, bio, college, course, academic_year, subjects, interests, goals, availability, profile_completed, created_at FROM users WHERE id = ?').get(current.id);
    return res.json({ user: formatUser(updated) });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users (discover students)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { subject, course, year, availability, search } = req.query;

    let query = `
      SELECT id, email, full_name, avatar_url, bio, college, course, academic_year,
             subjects, interests, goals, availability, profile_completed, created_at
      FROM users
      WHERE id != ?
    `;
    const params = [req.user.id];

    if (course) {
      query += ' AND LOWER(course) = LOWER(?)';
      params.push(course.trim());
    }

    if (year) {
      query += ' AND academic_year = ?';
      params.push(Number(year));
    }

    if (search) {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(full_name) LIKE ? OR LOWER(bio) LIKE ? OR LOWER(college) LIKE ? OR LOWER(course) LIKE ? OR LOWER(subjects) LIKE ?)';
      params.push(term, term, term, term, term);
    }

    let users = db.prepare(query).all(...params).map(formatUser);

    if (subject) {
      const targetSubject = subject.trim().toLowerCase();
      users = users.filter((u) =>
        u.subjects.some((s) => s.toLowerCase() === targetSubject || s.toLowerCase().includes(targetSubject))
      );
    }

    if (availability) {
      const targetAvail = availability.trim().toLowerCase();
      users = users.filter((u) =>
        u.availability.some((a) => a.toLowerCase() === targetAvail || a.toLowerCase().includes(targetAvail))
      );
    }

    const enriched = users.map((u) => {
      const compat = calculateCompatibility(req.user, u);
      return {
        ...u,
        compatibility_score: compat.score,
        compatibility_reasons: compat.reasons
      };
    });

    enriched.sort((a, b) => b.compatibility_score - a.compatibility_score);

    return res.json({ users: enriched });
  } catch (err) {
    console.error('Discover users error:', err);
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/users/:id/compatibility
router.get('/:id/compatibility', authenticateToken, (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const target = db.prepare('SELECT id, email, full_name, avatar_url, bio, college, course, academic_year, subjects, interests, goals, availability, profile_completed, created_at FROM users WHERE id = ?').get(targetId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    const compat = calculateCompatibility(req.user, target);
    return res.json({
      score: compat.score,
      reasons: compat.reasons,
      breakdown: compat.breakdown,
      user: formatUser(target)
    });
  } catch (err) {
    console.error('Compatibility error:', err);
    return res.status(500).json({ error: 'Failed to calculate compatibility' });
  }
});

// GET /api/users/:id (MUST come AFTER /me)
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const target = db.prepare('SELECT id, email, full_name, avatar_url, bio, college, course, academic_year, subjects, interests, goals, availability, profile_completed, created_at FROM users WHERE id = ?').get(targetId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    const compat = calculateCompatibility(req.user, target);
    return res.json({
      user: {
        ...formatUser(target),
        compatibility_score: compat.score,
        compatibility_reasons: compat.reasons
      }
    });
  } catch (err) {
    console.error('Get user by ID error:', err);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
