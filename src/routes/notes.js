import express from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/cases/:caseId/notes - Add note to case
router.post('/cases/:caseId/notes', authMiddleware, async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    // Verify case exists
    const caseExists = await query(
      'SELECT id FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseExists.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const result = await query(
      `INSERT INTO notes (case_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING id, case_id, user_id, content, created_at`,
      [caseId, req.user.id, content.trim()]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'add_note', `Added note to case ${caseId}`]
    );

    const note = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      note: {
        ...note,
        user_full_name: req.user.full_name
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:caseId/notes - Get all notes for a case
router.get('/cases/:caseId/notes', authMiddleware, async (req, res, next) => {
  try {
    const { caseId } = req.params;

    // Verify case exists
    const caseExists = await query(
      'SELECT id FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseExists.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const result = await query(
      `SELECT n.id, n.case_id, n.user_id, n.content, n.created_at, u.full_name as user_full_name
       FROM notes n
       JOIN users u ON n.user_id = u.id
       WHERE n.case_id = $1
       ORDER BY n.created_at DESC`,
      [caseId]
    );

    res.json({
      success: true,
      case_id: caseId,
      count: result.rows.length,
      notes: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cases/:caseId/notes/:noteId - Delete note (user or admin only)
router.delete('/cases/:caseId/notes/:noteId', authMiddleware, async (req, res, next) => {
  try {
    const { caseId, noteId } = req.params;

    // Verify note exists and belongs to case
    const noteExists = await query(
      'SELECT id, user_id FROM notes WHERE id = $1 AND case_id = $2',
      [noteId, caseId]
    );

    if (noteExists.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = noteExists.rows[0];

    // Check authorization (only note author or admins can delete)
    if (note.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }

    await query('DELETE FROM notes WHERE id = $1', [noteId]);

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'delete_note', `Deleted note ${noteId} from case ${caseId}`]
    );

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
