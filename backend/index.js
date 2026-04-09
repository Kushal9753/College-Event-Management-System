import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { init as initSocket } from './socket.js';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import bankRoutes from './routes/bankRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import resultRoutes from './routes/resultRoutes.js';

// Convert __dirname to work in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

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
app.use('/api/notifications', notificationRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/results', resultRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Event App Backend is Running...');
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});