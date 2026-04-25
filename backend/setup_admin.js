import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
import bcrypt from 'bcryptjs';

async function setupAccounts() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Passwords
    const adminPassword = 'adminpassword123';
    const facultyPassword = 'facultypassword123';

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'College Admin',
        email: 'admin@college.edu',
        phone: '1000000000',
        collegeName: 'My College',
        enrollmentNumber: 'ADMIN001',
        password: adminPassword,
        role: 'admin'
      });
      console.log('✅ Admin Account Created:');
      console.log('   Email: admin@college.edu');
      console.log('   Password: adminpassword123');
    } else {
      console.log('ℹ️ Admin account already exists in the database.');
    }

    // Check if faculty already exists
    const facultyExists = await Faculty.findOne({ email: 'faculty@college.edu' });
    if (!facultyExists) {
      await Faculty.create({
        name: 'Dr. Smith',
        email: 'faculty@college.edu',
        department: 'Computer Science',
        password: facultyPassword,
        status: 'active',
        phone: '2000000000',
        designation: 'Professor',
        collegeName: 'My College',
        expertise: ['Software Engineering']
      });
      console.log('✅ Faculty Account Created:');
      console.log('   Email: faculty@college.edu');
      console.log('   Password: facultypassword123');
    } else {
      console.log('ℹ️ Faculty account already exists in the database.');
    }

    console.log('\nAccount setup complete! You can now log into your system.');
  } catch (err) {
    console.error('❌ Error setting up accounts:', err);
  } finally {
    process.exit(0);
  }
}

setupAccounts();
