import express from 'express';
import { query } from '../db/db.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/profile - Get current user profile (protected)
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users - Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user by ID (admin only)
router.get('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, is_active } = req.body;

    const result = await query(
      'UPDATE users SET full_name = COALESCE($1, full_name), role = COALESCE($2, role), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING id, email, full_name, role, is_active',
      [name, role, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (id === currentUserId.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id, full_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
