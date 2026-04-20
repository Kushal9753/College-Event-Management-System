import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

await connectDB();

const adminData = {
  name: 'Admin User',
  email: 'admin@college.com',
  phone: '9999999999',
  collegeName: 'CDGI',
  enrollmentNumber: 'ADMIN001',
  password: 'Admin@123',
  role: 'admin'
};

try {
  const admin = await User.create(adminData);
  console.log('✅ Admin account created successfully!');
  console.log('Email:', admin.email);
  console.log('Password: Admin@123');
  process.exit(0);
} catch (error) {
  console.error('❌ Error creating admin:', error.message);
  process.exit(1);
}
