import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper to ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage for payment screenshots
const paymentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/payments';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `payment-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter (images only)
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

export const uploadPayment = multer({ 
  storage: paymentStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
