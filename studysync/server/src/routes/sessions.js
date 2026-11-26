const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/sessions
router.get('/', authenticateToken, (req, res) => {
  try {
    const { subject, date, upcoming, my } = req.query;

    let query = `
      SELECT s.*,
             u.full_name AS creator_name,
             g.name AS group_name,
             (SELECT COUNT(*) FROM session_participants sp WHERE sp.session_id = s.id AND sp.status = 'joined') AS participant_count,
             EXISTS(
               SELECT 1 FROM session_participants sp
               WHERE sp.session_id = s.id AND sp.user_id = ? AND sp.status = 'joined'
             ) AS is_joined
      FROM study_sessions s
      JOIN users u ON s.created_by = u.id
      LEFT JOIN groups g ON s.group_id = g.id
      WHERE 1=1
    `;
    const params = [req.user.id];

    if (subject) {
      query += ' AND LOWER(s.subject) LIKE LOWER(?)';
      params.push(`%${subject.trim()}%`);
    }

    if (date) {
      query += ' AND s.session_date = ?';
      params.push(date.trim());
    }

    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query += ' AND s.session_date >= ?';
      params.push(today);
    }

    if (my === 'true') {
      query += ` AND EXISTS (
        SELECT 1 FROM session_participants sp
        WHERE sp.session_id = s.id AND sp.user_id = ? AND sp.status = 'joined'
      )`;
      params.push(req.user.id);
    }

    query += ' ORDER BY s.session_date ASC, s.start_time ASC';

    const sessions = db.prepare(query).all(...params).map((s) => ({
      ...s,
      is_joined: Boolean(s.is_joined)
    }));

    return res.json({ sessions });
  } catch (err) {
    console.error('List sessions error:', err);
    return res.status(500).json({ error: 'Failed to fetch study sessions' });
  }
});

// POST /api/sessions
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      session_date,
      start_time,
      end_time,
      location,
      max_participants,
      group_id
    } = req.body;

    if (!title || !String(title).trim() || !session_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Title, session_date, start_time, and end_time are required' });
    }

    const parsedGroupId = group_id ? Number(group_id) : null;
    if (parsedGroupId) {
      const group = db.prepare('SELECT id FROM groups WHERE id = ?').get(parsedGroupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
    }

    const createSessionTx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO study_sessions (title, description, subject, session_date, start_time, end_time, location, max_participants, created_by, group_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        String(title).trim(),
        description || null,
        subject || null,
        session_date,
        start_time,
        end_time,
        location || 'Online',
        max_participants ? Number(max_participants) : 10,
        req.user.id,
        parsedGroupId
      );

      const sessionId = result.lastInsertRowid;

      db.prepare(`
        INSERT INTO session_participants (session_id, user_id, status)
        VALUES (?, ?, 'joined')
      `).run(sessionId, req.user.id);

      return sessionId;
    });

    const sessionId = createSessionTx();
    const session = db.prepare(`
      SELECT s.*, u.full_name AS creator_name, 1 AS participant_count, 1 AS is_joined
      FROM study_sessions s
      JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `).get(sessionId);

    return res.status(201).json({
      session: { ...session, is_joined: true }
    });
  } catch (err) {
    console.error('Create session error:', err);
    return res.status(500).json({ error: 'Failed to create study session' });
  }
});

// GET /api/sessions/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = db.prepare(`
      SELECT s.*,
             u.full_name AS creator_name,
             g.name AS group_name,
             (SELECT COUNT(*) FROM session_participants sp WHERE sp.session_id = s.id AND sp.status = 'joined') AS participant_count,
             EXISTS(
               SELECT 1 FROM session_participants sp
               WHERE sp.session_id = s.id AND sp.user_id = ? AND sp.status = 'joined'
             ) AS is_joined
      FROM study_sessions s
      JOIN users u ON s.created_by = u.id
      LEFT JOIN groups g ON s.group_id = g.id
      WHERE s.id = ?
    `).get(req.user.id, sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    const participants = db.prepare(`
      SELECT sp.id AS participation_id, sp.user_id, sp.status, sp.joined_at,
             u.full_name, u.email, u.avatar_url, u.course, u.academic_year
      FROM session_participants sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.session_id = ? AND sp.status = 'joined'
      ORDER BY sp.joined_at ASC
    `).all(sessionId);

    return res.json({
      session: {
        ...session,
        is_joined: Boolean(session.is_joined),
        participants
      }
    });
  } catch (err) {
    console.error('Get session error:', err);
    return res.status(500).json({ error: 'Failed to fetch study session' });
  }
});

// PUT /api/sessions/:id
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    if (session.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the session creator can update this session' });
    }

    const {
      title,
      description,
      subject,
      session_date,
      start_time,
      end_time,
      location,
      max_participants
    } = req.body;

    const nextTitle = title !== undefined ? String(title).trim() : session.title;
    if (!nextTitle) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    db.prepare(`
      UPDATE study_sessions
      SET title = ?, description = ?, subject = ?, session_date = ?,
          start_time = ?, end_time = ?, location = ?, max_participants = ?
      WHERE id = ?
    `).run(
      nextTitle,
      description !== undefined ? description : session.description,
      subject !== undefined ? subject : session.subject,
      session_date !== undefined ? session_date : session.session_date,
      start_time !== undefined ? start_time : session.start_time,
      end_time !== undefined ? end_time : session.end_time,
      location !== undefined ? location : session.location,
      max_participants !== undefined ? Number(max_participants) : session.max_participants,
      sessionId
    );

    const updated = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(sessionId);
    return res.json({ session: updated });
  } catch (err) {
    console.error('Update session error:', err);
    return res.status(500).json({ error: 'Failed to update study session' });
  }
});

// DELETE /api/sessions/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    if (session.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the session creator can delete this session' });
    }

    db.prepare('DELETE FROM session_participants WHERE session_id = ?').run(sessionId);
    db.prepare('DELETE FROM study_sessions WHERE id = ?').run(sessionId);

    return res.json({ message: 'Study session deleted successfully' });
  } catch (err) {
    console.error('Delete session error:', err);
    return res.status(500).json({ error: 'Failed to delete study session' });
  }
});

// POST /api/sessions/:id/join
router.post('/:id/join', authenticateToken, (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    const existing = db.prepare('SELECT * FROM session_participants WHERE session_id = ? AND user_id = ?').get(sessionId, req.user.id);
    if (existing && existing.status === 'joined') {
      return res.status(400).json({ error: 'You have already joined this session' });
    }

    const joinedCount = db.prepare("SELECT COUNT(*) AS count FROM session_participants WHERE session_id = ? AND status = 'joined'").get(sessionId).count;
    if (joinedCount >= session.max_participants) {
      return res.status(400).json({ error: 'This session is already full' });
    }

    db.prepare(`
      INSERT INTO session_participants (session_id, user_id, status)
      VALUES (?, ?, 'joined')
      ON CONFLICT(session_id, user_id) DO UPDATE SET
        status = 'joined',
        joined_at = CURRENT_TIMESTAMP
    `).run(sessionId, req.user.id);

    if (session.created_by !== req.user.id) {
      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
        VALUES (?, 'session_reminder', ?, ?, ?, 'session')
      `).run(
        session.created_by,
        'New Session Participant',
        `${req.user.full_name} joined your study session "${session.title}"`,
        sessionId
      );
    }

    return res.json({ message: 'Joined study session successfully' });
  } catch (err) {
    console.error('Join session error:', err);
    return res.status(500).json({ error: 'Failed to join study session' });
  }
});

// POST /api/sessions/:id/leave
router.post('/:id/leave', authenticateToken, (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    if (session.created_by === req.user.id) {
      return res.status(400).json({ error: 'Session creator cannot leave the session' });
    }

    const result = db.prepare(`
      UPDATE session_participants
      SET status = 'left'
      WHERE session_id = ? AND user_id = ? AND status = 'joined'
    `).run(sessionId, req.user.id);

    if (result.changes === 0) {
      return res.status(400).json({ error: 'You are not currently in this session' });
    }

    return res.json({ message: 'Left study session successfully' });
  } catch (err) {
    console.error('Leave session error:', err);
    return res.status(500).json({ error: 'Failed to leave study session' });
  }
});

module.exports = router;
