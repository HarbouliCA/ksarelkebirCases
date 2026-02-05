import express from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/cases/:caseId/aid-types - Get aid types for a case
router.get('/cases/:caseId/aid-types', authMiddleware, async (req, res, next) => {
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
      `SELECT cat.id, cat.case_id, cat.aid_type_id, at.label, at.description
       FROM case_aid_types cat
       JOIN aid_types at ON cat.aid_type_id = at.id
       WHERE cat.case_id = $1
       ORDER BY at.label`,
      [caseId]
    );

    res.json({
      success: true,
      case_id: caseId,
      count: result.rows.length,
      aid_types: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:caseId/aid-types - Add aid type to case
router.post('/cases/:caseId/aid-types', authMiddleware, async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { aid_type_id } = req.body;

    if (!aid_type_id) {
      return res.status(400).json({ error: 'aid_type_id is required' });
    }

    // Verify case exists
    const caseExists = await query(
      'SELECT id FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseExists.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Verify aid type exists
    const aidTypeExists = await query(
      'SELECT id FROM aid_types WHERE id = $1',
      [aid_type_id]
    );

    if (aidTypeExists.rows.length === 0) {
      return res.status(404).json({ error: 'Aid type not found' });
    }

    // Check if already linked
    const existing = await query(
      'SELECT id FROM case_aid_types WHERE case_id = $1 AND aid_type_id = $2',
      [caseId, aid_type_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Aid type already linked to this case' });
    }

    const result = await query(
      `INSERT INTO case_aid_types (case_id, aid_type_id) 
       VALUES ($1, $2) 
       RETURNING id, case_id, aid_type_id`,
      [caseId, aid_type_id]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'link_aid_type', `Linked aid type ${aid_type_id} to case ${caseId}`]
    );

    res.status(201).json({
      success: true,
      message: 'Aid type linked to case successfully',
      case_aid_type: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cases/:caseId/aid-types/:aid_type_id - Remove aid type from case
router.delete('/cases/:caseId/aid-types/:aid_type_id', authMiddleware, async (req, res, next) => {
  try {
    const { caseId, aid_type_id } = req.params;

    // Verify case exists
    const caseExists = await query(
      'SELECT id FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseExists.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const result = await query(
      'DELETE FROM case_aid_types WHERE case_id = $1 AND aid_type_id = $2 RETURNING id',
      [caseId, aid_type_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aid type not linked to this case' });
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'unlink_aid_type', `Removed aid type ${aid_type_id} from case ${caseId}`]
    );

    res.json({
      success: true,
      message: 'Aid type removed from case successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:caseId/aid-types/batch - Link multiple aid types to case
router.post('/cases/:caseId/aid-types/batch', authMiddleware, async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { aid_type_ids } = req.body;

    if (!Array.isArray(aid_type_ids) || aid_type_ids.length === 0) {
      return res.status(400).json({ error: 'aid_type_ids must be a non-empty array' });
    }

    // Verify case exists
    const caseExists = await query(
      'SELECT id FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseExists.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Verify all aid types exist
    const aidTypesResult = await query(
      `SELECT id FROM aid_types WHERE id = ANY($1)`,
      [aid_type_ids]
    );

    if (aidTypesResult.rows.length !== aid_type_ids.length) {
      return res.status(404).json({ error: 'One or more aid types not found' });
    }

    // Insert all at once
    const results = [];
    for (const aid_type_id of aid_type_ids) {
      const existing = await query(
        'SELECT id FROM case_aid_types WHERE case_id = $1 AND aid_type_id = $2',
        [caseId, aid_type_id]
      );

      if (existing.rows.length === 0) {
        const result = await query(
          `INSERT INTO case_aid_types (case_id, aid_type_id) 
           VALUES ($1, $2) 
           RETURNING id, case_id, aid_type_id`,
          [caseId, aid_type_id]
        );
        results.push(result.rows[0]);
      }
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'link_aid_types', `Linked ${results.length} aid types to case ${caseId}`]
    );

    res.status(201).json({
      success: true,
      message: `${results.length} aid types linked to case successfully`,
      linked_count: results.length,
      case_aid_types: results
    });
  } catch (error) {
    next(error);
  }
});

export default router;
