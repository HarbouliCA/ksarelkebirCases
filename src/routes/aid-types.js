import express from 'express';
import { query } from '../db/db.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/aid-types - List all aid types (public)
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, label, description FROM aid_types ORDER BY id'
    );

    res.json({
      success: true,
      count: result.rows.length,
      aid_types: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/aid-types/:id - Get single aid type
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, label, description FROM aid_types WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aid type not found' });
    }

    res.json({
      success: true,
      aid_type: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/aid-types - Create aid type (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { label, description } = req.body;

    if (!label) {
      return res.status(400).json({ error: 'Label is required' });
    }

    const result = await query(
      'INSERT INTO aid_types (label, description) VALUES ($1, $2) RETURNING *',
      [label, description || null]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'create_aid_type', `Added aid type: ${label}`]
    );

    res.status(201).json({
      success: true,
      message: 'Aid type created successfully',
      aid_type: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Aid type already exists' });
    }
    next(error);
  }
});

// PUT /api/aid-types/:id - Update aid type (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, description } = req.body;

    const result = await query(
      'UPDATE aid_types SET label = COALESCE($1, label), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [label, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aid type not found' });
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'update_aid_type', `Updated aid type: ${label || 'Unknown'}`]
    );

    res.json({
      success: true,
      message: 'Aid type updated successfully',
      aid_type: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router;
