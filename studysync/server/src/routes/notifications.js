const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', authenticateToken, (req, res) => {
  try {
    const { unread } = req.query;

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [req.user.id];

    if (unread === 'true') {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC, id DESC';

    const notifications = db.prepare(query).all(...params);
    return res.json({ notifications });
  } catch (err) {
    console.error('List notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/count
router.get('/count', authenticateToken, (req, res) => {
  try {
    const row = db.prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id);
    return res.json({ count: row.count });
  } catch (err) {
    console.error('Notification count error:', err);
    return res.status(500).json({ error: 'Failed to fetch unread notification count' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(req.user.id);
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Read all notifications error:', err);
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    const notificationId = Number(req.params.id);
    if (!Number.isInteger(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?').get(notificationId, req.user.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(notificationId);
    const updated = db.prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId);
    return res.json({ notification: updated });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

module.exports = router;
