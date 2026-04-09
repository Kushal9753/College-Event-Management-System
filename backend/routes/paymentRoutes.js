import express from 'express';
import { verifyPayment, getAllPayments, getFacultyPayments, getEventPayments } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Verify payment (Admin or Faculty only)
router.post('/verify/:registrationId', protect, authorize('admin', 'faculty'), verifyPayment);

// Admin API: Get all event payments
router.get('/all', protect, authorize('admin'), getAllPayments);

// Faculty API: Get assigned event payments
router.get('/faculty', protect, authorize('faculty'), getFacultyPayments);

// Event-wise payment: Get payments for a specific event
router.get('/event/:eventId', protect, authorize('admin', 'faculty'), getEventPayments);

export default router;
