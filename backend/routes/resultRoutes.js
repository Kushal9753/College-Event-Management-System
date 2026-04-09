import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  addResult,
  getAllResults,
  getResultByEvent,
  deleteResult,
  downloadResult,
} from '../controllers/resultController.js';

const router = express.Router();

// Public / authenticated read routes
router.get('/', protect, getAllResults);
router.get('/:eventId', protect, getResultByEvent);
router.get('/:eventId/download', protect, authorize('admin', 'faculty'), downloadResult);

// Admin & Faculty only — write routes
router.post('/', protect, authorize('admin', 'faculty'), addResult);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteResult);

export default router;
