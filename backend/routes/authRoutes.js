import express from 'express';
import { login, register, getProfile } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', protect, getProfile);

// Example of a role-protected route (Admin only)
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ message: 'Welcome Admin' });
});

export default router;
