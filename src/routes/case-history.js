import express from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/cases/:caseId/history - Get case status change history (audit trail)
router.get('/cases/:caseId/history', authMiddleware, async (req, res, next) => {
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
      `SELECT ch.id, ch.case_id, ch.old_status, ch.new_status, ch.changed_by, ch.changed_at, u.full_name as user_full_name
       FROM case_history ch
       LEFT JOIN users u ON ch.changed_by = u.id
       WHERE ch.case_id = $1
       ORDER BY ch.changed_at DESC`,
      [caseId]
    );

    res.json({
      success: true,
      case_id: caseId,
      count: result.rows.length,
      history: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:caseId/history/summary - Get current status and timeline summary
router.get('/cases/:caseId/history/summary', authMiddleware, async (req, res, next) => {
  try {
    const { caseId } = req.params;

    // Get case with current status
    const caseResult = await query(
      `SELECT c.id, c.status, c.urgency, c.created_at, c.updated_at
       FROM cases c
       WHERE c.id = $1`,
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseData = caseResult.rows[0];

    // Get history
    const historyResult = await query(
      `SELECT ch.id, ch.old_status, ch.new_status, ch.changed_at, u.full_name as user_full_name
       FROM case_history ch
       LEFT JOIN users u ON ch.changed_by = u.id
       WHERE ch.case_id = $1
       ORDER BY ch.changed_at DESC`,
      [caseId]
    );

    res.json({
      success: true,
      case_id: caseId,
      current_status: caseData.status,
      urgency: caseData.urgency,
      case_created_at: caseData.created_at,
      last_updated: caseData.updated_at,
      status_changes_count: historyResult.rows.length,
      timeline: historyResult.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
