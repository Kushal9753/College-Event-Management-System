import express from 'express';
import { getStats } from '../controllers/adminController.js';
import { getReportData, downloadReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only Admins can see global stats
router.get('/stats', protect, authorize('admin'), getStats);

// Report endpoints
router.get('/reports', protect, authorize('admin'), getReportData);
router.get('/reports/download', protect, authorize('admin'), downloadReport);

export default router;
