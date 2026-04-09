import express from 'express';
import { getBankDetails, upsertBankDetails } from '../controllers/bankController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fetching bank info (Any Authenticated user)
router.get('/', protect, getBankDetails);

// Creating/Updating info (Admin Only)
router.post('/', protect, authorize('admin'), upsertBankDetails);

export default router;
