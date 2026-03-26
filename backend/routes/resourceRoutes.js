import express from 'express';
import { upload, uploadResource, getResources, deleteResource } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   POST /api/files/upload
router.post('/upload', upload.single('file'), uploadResource);

// @route   GET /api/files
router.get('/', getResources);

// @route   DELETE /api/files/:id
router.delete('/:id', deleteResource);

export default router;
