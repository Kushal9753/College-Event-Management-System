import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Resource from '../models/Resource.js';

// 1. Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads/resources');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Store files in uploads/resources folder
  },
  filename: function (req, file, cb) {
    // Construct a unique filename: timestamp-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const upload = multer({ storage: storage });

// @desc    Upload a new resource file
// @route   POST /api/files/upload
// @access  Private (Admin/Faculty)
export const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { sharedWith } = req.body;
    
    // Construct public URL to access the file
    // Example: /uploads/resources/1690000000000-mylab.pdf
    const fileUrl = `/uploads/resources/${req.file.filename}`;

    const newResource = await Resource.create({
      fileName: req.file.originalname,
      fileUrl,
      sharedWith: sharedWith || 'all',
      uploadedBy: req.user._id, // Assumes protect middleware sets req.user
    });

    res.status(201).json(newResource);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during file upload', error: error.message });
  }
};

// @desc    Get all shared resources
// @route   GET /api/files
// @access  Private
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(resources);
  } catch (error) {
    console.error('Fetch resources error:', error);
    res.status(500).json({ message: 'Server error fetching resources', error: error.message });
  }
};

// @desc    Delete a resource file
// @route   DELETE /api/files/:id
// @access  Private (Admin/Uploader)
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Optional: Only allow the admin, or the specific user who uploaded it, to delete
    // if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: 'Not authorized to delete this resource' });
    // }

    // Physical file path
    const filePath = path.join(process.cwd(), resource.fileUrl);

    // Remove file from disk if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Resource removed successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error deleting resource', error: error.message });
  }
};
