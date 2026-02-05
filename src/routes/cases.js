import express from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/cases - Get all cases with people and aid types (protected)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, urgency, city } = req.query;

    let sql = `
      SELECT c.id, c.person_id, c.status, c.urgency, c.contact_method, c.description, 
             c.assigned_to, c.created_by, c.created_at, c.updated_at,
             p.full_name as person_name, p.phone, p.city,
             STRING_AGG(at.label, ', ') as aid_types
      FROM cases c
      JOIN people p ON c.person_id = p.id
      LEFT JOIN case_aid_types cat ON c.id = cat.case_id
      LEFT JOIN aid_types at ON cat.aid_type_id = at.id
    `;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('c.status = $' + (params.length + 1));
      params.push(status);
    }
    if (urgency) {
      conditions.push('c.urgency = $' + (params.length + 1));
      params.push(urgency);
    }
    if (city) {
      conditions.push('p.city ILIKE $' + (params.length + 1));
      params.push('%' + city + '%');
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY c.id, p.id ORDER BY c.created_at DESC';

    const result = await query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      cases: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id - Get single case with details
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.id, c.person_id, c.status, c.urgency, c.contact_method, c.notes,
              c.assigned_to, c.created_by, c.created_at, c.updated_at,
              p.full_name as person_name, p.phone, p.city, p.number_of_people,
              u.full_name as assigned_to_name, creator.full_name as created_by_name
       FROM cases c
       JOIN people p ON c.person_id = p.id
       LEFT JOIN users u ON c.assigned_to = u.id
       LEFT JOIN users creator ON c.created_by = creator.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseData = result.rows[0];

    // Get aid types for this case
    const aidTypesResult = await query(
      `SELECT cat.id, at.id as aid_type_id, at.label, at.description
       FROM case_aid_types cat
       JOIN aid_types at ON cat.aid_type_id = at.id
       WHERE cat.case_id = $1
       ORDER BY at.label`,
      [id]
    );

    res.json({
      success: true,
      case: {
        ...caseData,
        aid_types: aidTypesResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases - Create new case (protected)
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { person_id, urgency, contact_method, description, aid_type_ids } = req.body;
    const userId = req.user.id;

    if (!person_id) {
      return res.status(400).json({ error: 'person_id is required' });
    }

    // Verify person exists
    const personExists = await query(
      'SELECT id, full_name FROM people WHERE id = $1',
      [person_id]
    );

    if (personExists.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    const result = await query(
      `INSERT INTO cases (person_id, status, urgency, contact_method, description, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [person_id, 'new', urgency || 'normal', contact_method || 'call', description || '', userId]
    );

    const caseId = result.rows[0].id;

    // Link aid types if provided
    if (Array.isArray(aid_type_ids) && aid_type_ids.length > 0) {
      for (const aid_type_id of aid_type_ids) {
        await query(
          'INSERT INTO case_aid_types (case_id, aid_type_id) VALUES ($1, $2)',
          [caseId, aid_type_id]
        );
      }
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [userId, 'create_case', `Created case for person: ${personExists.rows[0].full_name}`]
    );

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      case: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Duplicate entry' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Foreign key constraint violation' });
    }
    next(error);
  }
});

// PUT /api/cases/:id - Update case (protected)
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, urgency, contact_method, description, assigned_to } = req.body;
    const userId = req.user.id;

    // Get current case to track status change for history
    const currentCase = await query(
      'SELECT status FROM cases WHERE id = $1',
      [id]
    );

    if (currentCase.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const oldStatus = currentCase.rows[0].status;

    const result = await query(
      `UPDATE cases SET 
        status = COALESCE($1, status), 
        urgency = COALESCE($2, urgency),
        contact_method = COALESCE($3, contact_method),
        description = COALESCE($4, description),
        assigned_to = COALESCE($5, assigned_to),
        updated_at = NOW()
       WHERE id = $6 
       RETURNING *`,
      [status, urgency, contact_method, description, assigned_to, id]
    );

    // If status changed, trigger history logging (also handled by DB trigger)
    if (status && status !== oldStatus) {
      await query(
        `INSERT INTO case_history (case_id, old_status, new_status, changed_by) 
         VALUES ($1, $2, $3, $4)`,
        [id, oldStatus, status, userId]
      );
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [userId, 'update_case', `Updated case ${id}`]
    );

    res.json({
      success: true,
      message: 'Case updated successfully',
      case: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cases/:id - Delete case (protected)
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM cases WHERE id = $1 RETURNING id, person_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [userId, 'delete_case', `Deleted case ${id}`]
    );

    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
