import express from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/volunteers - Get all volunteers
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM volunteers ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      count: result.rows.length,
      volunteers: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/volunteers - Create new volunteer
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { first_name, last_name, phone, job } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and Last name are required' });
    }

    const result = await query(
      `INSERT INTO volunteers (first_name, last_name, phone, job) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [first_name, last_name, phone || null, job || null]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'create_volunteer', `Created volunteer: ${first_name} ${last_name}`]
    );

    res.status(201).json({
      success: true,
      message: 'Volunteer created successfully',
      volunteer: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/volunteers/:id - Delete volunteer
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM volunteers WHERE id = $1 RETURNING id, first_name, last_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'delete_volunteer', `Deleted volunteer: ${result.rows[0].first_name} ${result.rows[0].last_name}`]
    );

    res.json({
      success: true,
      message: 'Volunteer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
