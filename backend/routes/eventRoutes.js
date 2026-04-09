import express from 'express';
import {
  createEvent,
  getEventById,
  getAllEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getMyEvents,
  registerForEvent,
  cancelEventRegistration,
  getAssignedEvents,
  assignFaculty,
  getEventParticipants,
  getEventRegistrationCount,
  markEventCompleted,
  addWinners,
  approveResults,
  rejectResults,
  archiveEvent,
  exportEventData,
  markAttendance,
  getMyRegistrations
} from '../controllers/eventController.js';
import { getEventLogs } from '../controllers/logController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ====== STATIC routes MUST be declared before parametric /:id routes ======
router.get('/', protect, getAllEvents);
router.get('/my-events', protect, getMyEvents);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/assigned', protect, getAssignedEvents);
router.get('/pending', protect, authorize('admin'), getPendingEvents);
router.post('/create', protect, createEvent);

// Parametric routes (/:id) — declared AFTER all static routes
router.get('/:id', protect, getEventById);

// Student registration routes
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelEventRegistration);

// Participant info routes (Admin + Faculty)
router.get('/:id/participants', protect, getEventParticipants);
router.get('/:id/registration-count', protect, getEventRegistrationCount);

// Admin-only routes
router.patch('/:id/approve', protect, authorize('admin'), approveEvent);
router.patch('/:id/reject', protect, authorize('admin'), rejectEvent);
router.patch('/:id/assign-faculty', protect, authorize('admin'), assignFaculty);
router.patch('/:id/results/approve', protect, authorize('admin'), approveResults);
router.patch('/:id/results/reject', protect, authorize('admin'), rejectResults);

// Faculty & Admin routes for status update and winners
router.patch('/:id/complete', protect, authorize('admin', 'faculty'), markEventCompleted);
router.post('/:id/winners', protect, authorize('admin', 'faculty'), addWinners);
router.patch('/:id/attendance', protect, authorize('admin', 'faculty'), markAttendance);

// Advanced analytics and actions
router.get('/:id/logs', protect, authorize('admin', 'faculty'), getEventLogs);
router.get('/:id/export', protect, authorize('admin', 'faculty'), exportEventData);
router.patch('/:id/archive', protect, authorize('admin', 'faculty'), archiveEvent);

export default router;
