const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function isGroupAdmin(groupId, userId, groupCreatedBy) {
  if (groupCreatedBy === userId) return true;
  const member = db.prepare(`
    SELECT role, status FROM group_members
    WHERE group_id = ? AND user_id = ? AND status = 'approved'
  `).get(groupId, userId);
  return Boolean(member && member.role === 'admin');
}

// GET /api/groups
router.get('/', authenticateToken, (req, res) => {
  try {
    const { subject, category, search, my } = req.query;

    let query = `
      SELECT g.*,
             u.full_name AS creator_name,
             (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id AND gm.status = 'approved') AS member_count,
             (SELECT gm.status FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = ?) AS membership_status,
             (SELECT gm.role FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = ?) AS membership_role
      FROM groups g
      JOIN users u ON g.created_by = u.id
      WHERE 1=1
    `;
    const params = [req.user.id, req.user.id];

    if (subject) {
      query += ' AND LOWER(g.subject) LIKE LOWER(?)';
      params.push(`%${subject.trim()}%`);
    }

    if (category) {
      query += ' AND LOWER(g.category) = LOWER(?)';
      params.push(category.trim());
    }

    if (search) {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(g.name) LIKE ? OR LOWER(g.description) LIKE ? OR LOWER(g.subject) LIKE ?)';
      params.push(term, term, term);
    }

    if (my === 'true') {
      query += ` AND EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = g.id AND gm.user_id = ? AND gm.status = 'approved'
      )`;
      params.push(req.user.id);
    }

    query += ' ORDER BY g.created_at DESC, g.id DESC';

    const groups = db.prepare(query).all(...params);
    return res.json({ groups });
  } catch (err) {
    console.error('List groups error:', err);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// POST /api/groups
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, description, subject, category, is_private, max_members } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const createGroupTx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO groups (name, description, subject, category, is_private, max_members, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        String(name).trim(),
        description || null,
        subject || null,
        category || 'study',
        is_private ? 1 : 0,
        max_members ? Number(max_members) : 20,
        req.user.id
      );

      const groupId = result.lastInsertRowid;

      db.prepare(`
        INSERT INTO group_members (group_id, user_id, role, status)
        VALUES (?, ?, 'admin', 'approved')
      `).run(groupId, req.user.id);

      return groupId;
    });

    const groupId = createGroupTx();
    const group = db.prepare(`
      SELECT g.*, u.full_name AS creator_name,
             1 AS member_count, 'approved' AS membership_status, 'admin' AS membership_role
      FROM groups g
      JOIN users u ON g.created_by = u.id
      WHERE g.id = ?
    `).get(groupId);

    return res.status(201).json({ group });
  } catch (err) {
    console.error('Create group error:', err);
    return res.status(500).json({ error: 'Failed to create group' });
  }
});

// GET /api/groups/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const groupId = Number(req.params.id);
    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = db.prepare(`
      SELECT g.*,
             u.full_name AS creator_name,
             (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id AND gm.status = 'approved') AS member_count,
             (SELECT gm.status FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = ?) AS membership_status,
             (SELECT gm.role FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = ?) AS membership_role
      FROM groups g
      JOIN users u ON g.created_by = u.id
      WHERE g.id = ?
    `).get(req.user.id, req.user.id, groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const members = db.prepare(`
      SELECT gm.id AS membership_id, gm.user_id, gm.role, gm.status, gm.joined_at,
             u.full_name, u.email, u.avatar_url, u.course, u.academic_year
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY CASE WHEN gm.role = 'admin' THEN 0 ELSE 1 END, gm.joined_at ASC
    `).all(groupId);

    return res.json({ group: { ...group, members } });
  } catch (err) {
    console.error('Get group error:', err);
    return res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// PUT /api/groups/:id
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const groupId = Number(req.params.id);
    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!isGroupAdmin(groupId, req.user.id, group.created_by)) {
      return res.status(403).json({ error: 'Only group admins can update this group' });
    }

    const { name, description, subject, category, is_private, max_members } = req.body;
    const nextName = name !== undefined ? String(name).trim() : group.name;
    if (!nextName) {
      return res.status(400).json({ error: 'Group name cannot be empty' });
    }

    db.prepare(`
      UPDATE groups
      SET name = ?, description = ?, subject = ?, category = ?, is_private = ?, max_members = ?
      WHERE id = ?
    `).run(
      nextName,
      description !== undefined ? description : group.description,
      subject !== undefined ? subject : group.subject,
      category !== undefined ? category : group.category,
      is_private !== undefined ? (is_private ? 1 : 0) : group.is_private,
      max_members !== undefined ? Number(max_members) : group.max_members,
      groupId
    );

    const updated = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    return res.json({ group: updated });
  } catch (err) {
    console.error('Update group error:', err);
    return res.status(500).json({ error: 'Failed to update group' });
  }
});

// DELETE /api/groups/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const groupId = Number(req.params.id);
    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the group creator can delete this group' });
    }

    db.prepare('DELETE FROM group_members WHERE group_id = ?').run(groupId);
    db.prepare('DELETE FROM groups WHERE id = ?').run(groupId);

    return res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('Delete group error:', err);
    return res.status(500).json({ error: 'Failed to delete group' });
  }
});

// POST /api/groups/:id/join
router.post('/:id/join', authenticateToken, (req, res) => {
  try {
    const groupId = Number(req.params.id);
    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const existing = db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?').get(groupId, req.user.id);
    if (existing) {
      if (existing.status === 'approved') {
        return res.status(400).json({ error: 'You are already a member of this group' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Your join request is already pending' });
      }
    }

    const approvedCount = db.prepare("SELECT COUNT(*) AS count FROM group_members WHERE group_id = ? AND status = 'approved'").get(groupId).count;
    if (approvedCount >= group.max_members) {
      return res.status(400).json({ error: 'This group has reached its maximum member limit' });
    }

    const nextStatus = group.is_private ? 'pending' : 'approved';

    db.prepare(`
      INSERT INTO group_members (group_id, user_id, role, status)
      VALUES (?, ?, 'member', ?)
      ON CONFLICT(group_id, user_id) DO UPDATE SET
        status = excluded.status,
        joined_at = CURRENT_TIMESTAMP
    `).run(groupId, req.user.id, nextStatus);

    // Notify group creator
    if (group.created_by !== req.user.id) {
      const notifTitle = group.is_private ? 'New Group Join Request' : 'New Group Member';
      const notifMsg = group.is_private
        ? `${req.user.full_name} requested to join ${group.name}`
        : `${req.user.full_name} joined ${group.name}`;

      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
        VALUES (?, 'group_join_request', ?, ?, ?, 'group')
      `).run(group.created_by, notifTitle, notifMsg, groupId);
    }

    return res.json({
      status: nextStatus,
      message: nextStatus === 'approved' ? 'Joined group successfully' : 'Join request sent for approval'
    });
  } catch (err) {
    console.error('Join group error:', err);
    return res.status(500).json({ error: 'Failed to join group' });
  }
});

// POST /api/groups/:id/leave
router.post('/:id/leave', authenticateToken, (req, res) => {
  try {
    const groupId = Number(req.params.id);
    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.created_by === req.user.id) {
      return res.status(400).json({ error: 'Group creator cannot leave the group. Delete the group instead.' });
    }

    const result = db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?').run(groupId, req.user.id);
    if (result.changes === 0) {
      return res.status(400).json({ error: 'You are not a member of this group' });
    }

    return res.json({ message: 'Left group successfully' });
  } catch (err) {
    console.error('Leave group error:', err);
    return res.status(500).json({ error: 'Failed to leave group' });
  }
});

// PUT /api/groups/:id/members/:userId
router.put('/:id/members/:userId', authenticateToken, (req, res) => {
  try {
    const groupId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);
    const { status } = req.body;

    if (!Number.isInteger(groupId) || !Number.isInteger(targetUserId)) {
      return res.status(400).json({ error: 'Invalid group or user ID' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!isGroupAdmin(groupId, req.user.id, group.created_by)) {
      return res.status(403).json({ error: 'Only group admins can manage members' });
    }

    const membership = db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?').get(groupId, targetUserId);
    if (!membership) {
      return res.status(404).json({ error: 'Membership request not found' });
    }

    if (status === 'approved') {
      const approvedCount = db.prepare("SELECT COUNT(*) AS count FROM group_members WHERE group_id = ? AND status = 'approved'").get(groupId).count;
      if (membership.status !== 'approved' && approvedCount >= group.max_members) {
        return res.status(400).json({ error: 'Group is already at maximum capacity' });
      }
    }

    db.prepare('UPDATE group_members SET status = ? WHERE group_id = ? AND user_id = ?').run(status, groupId, targetUserId);

    if (status === 'approved') {
      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
        VALUES (?, 'group_join_approved', ?, ?, ?, 'group')
      `).run(targetUserId, 'Group Request Approved', `Your request to join ${group.name} was approved!`, groupId);
    }

    return res.json({ message: `Member ${status}`, status });
  } catch (err) {
    console.error('Manage member error:', err);
    return res.status(500).json({ error: 'Failed to update member status' });
  }
});

// DELETE /api/groups/:id/members/:userId
router.delete('/:id/members/:userId', authenticateToken, (req, res) => {
  try {
    const groupId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);

    if (!Number.isInteger(groupId) || !Number.isInteger(targetUserId)) {
      return res.status(400).json({ error: 'Invalid group or user ID' });
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!isGroupAdmin(groupId, req.user.id, group.created_by)) {
      return res.status(403).json({ error: 'Only group admins can remove members' });
    }

    if (targetUserId === group.created_by) {
      return res.status(400).json({ error: 'Cannot remove the group creator' });
    }

    const result = db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?').run(groupId, targetUserId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    return res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove member error:', err);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
