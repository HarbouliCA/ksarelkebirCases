import express from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/people - List all people
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { city, search } = req.query;
    let queryStr = 'SELECT id, full_name, phone, city, number_of_people, created_at FROM people';
    const params = [];
    const conditions = [];

    if (city) {
      conditions.push('city = $' + (params.length + 1));
      params.push(city);
    }

    if (search) {
      conditions.push('full_name ILIKE $' + (params.length + 1));
      params.push('%' + search + '%');
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' ORDER BY created_at DESC';

    const result = await query(queryStr, params);

    res.json({
      success: true,
      count: result.rows.length,
      people: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/people/:id - Get single person
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, full_name, phone, city, number_of_people, notes, created_at, updated_at FROM people WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json({
      success: true,
      person: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/people - Create new person
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { full_name, phone, city, number_of_people, notes } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const result = await query(
      'INSERT INTO people (full_name, phone, city, number_of_people, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [full_name, phone || null, city || null, number_of_people || 1, notes || null]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'create_person', `Added person: ${full_name}`]
    );

    res.status(201).json({
      success: true,
      message: 'Person created successfully',
      person: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/people/:id - Update person
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone, city, number_of_people, notes } = req.body;

    const result = await query(
      'UPDATE people SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), city = COALESCE($3, city), number_of_people = COALESCE($4, number_of_people), notes = COALESCE($5, notes) WHERE id = $6 RETURNING *',
      [full_name, phone, city, number_of_people, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'update_person', `Updated person: ${full_name || 'Unknown'}`]
    );

    res.json({
      success: true,
      message: 'Person updated successfully',
      person: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/people/:id - Delete person
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM people WHERE id = $1 RETURNING full_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)',
      [req.user.id, 'delete_person', `Deleted person: ${result.rows[0].full_name}`]
    );

    res.json({
      success: true,
      message: 'Person deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
