import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Faculty from './models/Faculty.js';

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management');
    console.log('Connected to DB');

    const users = await User.find({}, 'email role enrollmentNumber');
    const faculty = await Faculty.find({}, 'email name password status');

    console.log('\n--- Users in User Collection ---');
    users.forEach(u => console.log(`Email: ${u.email}, Role: ${u.role}, Enrollment: ${u.enrollmentNumber}`));

    console.log('\n--- Faculty in Faculty Collection ---');
    faculty.forEach(f => console.log(`Email: ${f.email}, Name: ${f.name}, HasPassword: ${!!f.password}, Status: ${f.status}`));

    // Check for overlap
    const userEmails = new Set(users.map(u => u.email));
    const facultyEmails = faculty.map(f => f.email);
    const overlap = facultyEmails.filter(e => userEmails.has(e));

    if (overlap.length > 0) {
      console.log('\n!!! OVERLAP FOUND !!!');
      overlap.forEach(e => console.log(`Email exists in both collections: ${e}`));
    } else {
      console.log('\nNo email overlap found between User and Faculty collections.');
    }

  } catch (error) {
    console.error('DB Check Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from DB');
  }
}

checkDB();
