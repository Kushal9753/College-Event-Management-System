import express from 'express';
import {
  createAvailability,
  getAvailability,
  checkConflict,
} from '../controllers/availabilityController.js';

const router = express.Router();

router.route('/').post(createAvailability).get(getAvailability);
router.post('/check-conflict', checkConflict);

export default router;
