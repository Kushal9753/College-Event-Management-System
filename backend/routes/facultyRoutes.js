import express from 'express';
import {
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  toggleFacultyStatus,
  facultyLogin,
} from '../controllers/facultyController.js';
// import { protect, authorize } from '../middleware/authMiddleware.js'; // Uncomment to protect

const router = express.Router();

router.post('/login', facultyLogin);

router.route('/').get(getAllFaculty).post(createFaculty);
router.route('/:id').put(updateFaculty).delete(deleteFaculty);
router.patch('/:id/status', toggleFacultyStatus);

export default router;
