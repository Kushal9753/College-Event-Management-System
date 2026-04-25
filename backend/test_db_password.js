import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Faculty from './models/Faculty.js';

async function testLogin() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Test Admin
    const admin = await User.findOne({ email: 'admin@college.edu' }).select('+password');
    if (admin) {
      const match = await admin.matchPassword('adminpassword123');
      console.log('Admin password match:', match);
    } else {
      console.log('Admin not found!');
    }

    // Test Faculty
    const faculty = await Faculty.findOne({ email: 'faculty@college.edu' }).select('+password');
    if (faculty) {
      const match = await faculty.matchPassword('facultypassword123');
      console.log('Faculty password match:', match);
    } else {
      console.log('Faculty not found!');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

testLogin();
