const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

function detectFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return 'pdf';
  if (['.doc', '.docx', '.txt', '.md'].includes(ext)) return 'doc';
  if (['.ppt', '.pptx'].includes(ext)) return 'ppt';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'image';
  return 'other';
}

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}

// GET /api/resources
router.get('/', authenticateToken, (req, res) => {
  try {
    const { subject, type, group_id, search, my } = req.query;

    let query = `
      SELECT r.*, u.full_name AS uploader_name, g.name AS group_name
      FROM resources r
      JOIN users u ON r.uploaded_by = u.id
      LEFT JOIN groups g ON r.group_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (subject) {
      query += ' AND LOWER(r.subject) LIKE LOWER(?)';
      params.push(`%${subject.trim()}%`);
    }

    if (type) {
      query += ' AND LOWER(r.file_type) = LOWER(?)';
      params.push(type.trim());
    }

    if (group_id) {
      query += ' AND r.group_id = ?';
      params.push(Number(group_id));
    }

    if (my === 'true') {
      query += ' AND r.uploaded_by = ?';
      params.push(req.user.id);
    }

    if (search) {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(r.title) LIKE ? OR LOWER(r.description) LIKE ? OR LOWER(r.subject) LIKE ? OR LOWER(r.file_name) LIKE ?)';
      params.push(term, term, term, term);
    }

    query += ' ORDER BY r.created_at DESC, r.id DESC';

    const resources = db.prepare(query).all(...params);
    return res.json({ resources });
  } catch (err) {
    console.error('List resources error:', err);
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// POST /api/resources
router.post('/', authenticateToken, handleUpload, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const { title, description, subject, group_id } = req.body;
    if (!title || !String(title).trim()) {
      // Clean up uploaded file if validation fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Title is required' });
    }

    const parsedGroupId = group_id ? Number(group_id) : null;
    if (parsedGroupId) {
      const group = db.prepare('SELECT id FROM groups WHERE id = ?').get(parsedGroupId);
      if (!group) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ error: 'Target group not found' });
      }
    }

    const fileType = detectFileType(req.file.originalname);

    const result = db.prepare(`
      INSERT INTO resources (title, description, file_name, file_path, file_type, file_size, subject, uploaded_by, group_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      String(title).trim(),
      description || null,
      req.file.originalname,
      req.file.filename,
      fileType,
      req.file.size,
      subject || null,
      req.user.id,
      parsedGroupId
    );

    const resource = db.prepare(`
      SELECT r.*, u.full_name AS uploader_name, g.name AS group_name
      FROM resources r
      JOIN users u ON r.uploaded_by = u.id
      LEFT JOIN groups g ON r.group_id = g.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({ resource });
  } catch (err) {
    console.error('Upload resource error:', err);
    return res.status(500).json({ error: 'Failed to upload resource' });
  }
});

// GET /api/resources/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const resourceId = Number(req.params.id);
    if (!Number.isInteger(resourceId)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }

    const resource = db.prepare(`
      SELECT r.*, u.full_name AS uploader_name, g.name AS group_name
      FROM resources r
      JOIN users u ON r.uploaded_by = u.id
      LEFT JOIN groups g ON r.group_id = g.id
      WHERE r.id = ?
    `).get(resourceId);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    return res.json({ resource });
  } catch (err) {
    console.error('Get resource error:', err);
    return res.status(500).json({ error: 'Failed to fetch resource details' });
  }
});

// GET /api/resources/:id/download
router.get('/:id/download', authenticateToken, (req, res) => {
  try {
    const resourceId = Number(req.params.id);
    if (!Number.isInteger(resourceId)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }

    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const fullPath = path.join(uploadsDir, path.basename(resource.file_path));
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Resource file not found on server' });
    }

    db.prepare('UPDATE resources SET download_count = download_count + 1 WHERE id = ?').run(resourceId);

    return res.download(fullPath, resource.file_name);
  } catch (err) {
    console.error('Download resource error:', err);
    return res.status(500).json({ error: 'Failed to download resource' });
  }
});

// DELETE /api/resources/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const resourceId = Number(req.params.id);
    if (!Number.isInteger(resourceId)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }

    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the uploader can delete this resource' });
    }

    const fullPath = path.join(uploadsDir, path.basename(resource.file_path));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    db.prepare('DELETE FROM resources WHERE id = ?').run(resourceId);
    return res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    console.error('Delete resource error:', err);
    return res.status(500).json({ error: 'Failed to delete resource' });
  }
});

module.exports = router;
