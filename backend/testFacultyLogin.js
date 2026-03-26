import 'dotenv/config';
import mongoose from 'mongoose';
import Faculty from './models/Faculty.js';

async function testFacultyAPI() {
  try {
    // 1. Connect to Mongo directly
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management');
    console.log('Connected to DB');

    // 2. Clear old test data
    await Faculty.deleteOne({ email: 'testfaculty@example.com' });

    // 3. Create a faculty with a password
    const faculty = new Faculty({
      name: 'Test Faculty',
      email: 'testfaculty@example.com',
      department: 'Computer Science',
      password: 'mypassword123',
      status: 'active'
    });
    // This will trigger the pre('save') hook and hash the password
    await faculty.save();
    console.log('Test Faculty saved');

    // 4. Hit the Login endpoint (assumes npm run dev is running on port 5000)
    console.log('Testing missing password...');
    const res1 = await fetch('http://localhost:5000/api/faculty/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testfaculty@example.com' })
    });
    const d1 = await res1.json();
    console.log('Res 1:', res1.status, d1.message || d1.success);

    console.log('Testing invalid password...');
    const res2 = await fetch('http://localhost:5000/api/faculty/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testfaculty@example.com', password: 'wrong' })
    });
    const d2 = await res2.json();
    console.log('Res 2:', res2.status, d2.message || d2.success);

    console.log('Testing valid login...');
    const res3 = await fetch('http://localhost:5000/api/faculty/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testfaculty@example.com', password: 'mypassword123' })
    });
    const d3 = await res3.json();
    console.log('Res 3:', res3.status, d3.message || d3.success);

  } catch (error) {
    console.error('Testing Error:', error);
  } finally {
    // Clean up
    await Faculty.deleteOne({ email: 'testfaculty@example.com' });
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

testFacultyAPI();
