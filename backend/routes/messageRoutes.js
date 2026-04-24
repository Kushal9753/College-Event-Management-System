import express from 'express';
import { sendMessage, getMessageHistory, getRecipients } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both routes are protected — user must be logged in
router.post('/send', protect, sendMessage);
router.get('/history', protect, getMessageHistory);
router.get('/recipients', protect, getRecipients);

export default router;
