import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
import authService from './services/authService.js';

async function repro() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management');
    console.log('Connected to DB');

    const testEmail = 'debug_faculty@example.com';
    const testPassword = 'password123';

    // Cleanup
    await User.deleteMany({ email: testEmail });
    await Faculty.deleteMany({ email: testEmail });

    // Scenario 1: Faculty exists only in Faculty collection
    console.log('\n--- Scenario 1: Faculty exists ONLY in Faculty collection ---');
    await Faculty.create({
      name: 'Debug Faculty',
      email: testEmail,
      department: 'CS',
      password: testPassword,
      status: 'active'
    });
    
    try {
      const result = await authService.loginUser(testEmail, testPassword);
      console.log('Login Result:', result.role, result.email);
    } catch (err) {
      console.error('Login Failed:', err.message);
    }

    // Scenario 2: Faculty exists in both User (as student) and Faculty collections
    console.log('\n--- Scenario 2: Faculty exists in BOTH collections (User as student) ---');
    await User.create({
      name: 'Debug Student',
      email: testEmail,
      password: 'student_password',
      phone: '1234567890',
      collegeName: 'CDGI',
      enrollmentNumber: 'DEBUG123',
      role: 'student'
    });

    try {
      console.log('Attempting login with FACULTY password...');
      const result = await authService.loginUser(testEmail, testPassword);
      console.log('Login Result:', result.role, result.email);
    } catch (err) {
      console.error('Login Failed (expected if it picks User):', err.message);
    }

    try {
      console.log('Attempting login with STUDENT password...');
      const result = await authService.loginUser(testEmail, 'student_password');
      console.log('Login Result (picked User):', result.role, result.email);
    } catch (err) {
      console.error('Login Failed:', err.message);
    }

  } catch (error) {
    console.error('Repro Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from DB');
  }
}

repro();
