import express from 'express';
import {
  createEvent,
  getAllEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getMyEvents
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to view approved events
router.get('/', getAllEvents);

// Protected routes (requires login)
router.get('/my-events', protect, getMyEvents);
router.post('/create', protect, createEvent);

// Admin-only routes
router.get('/pending', protect, authorize('admin'), getPendingEvents);
router.put('/:id/approve', protect, authorize('admin'), approveEvent);
router.put('/:id/reject', protect, authorize('admin'), rejectEvent);

export default router;
