import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Convert __dirname to work in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Auth/Model routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', resourceRoutes); // Resource Sharing API
app.use('/api/availability', availabilityRoutes); // Scheduling API

// Serve 'uploads' directory statically for file access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Event routes
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Event App Backend is Running...');
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});