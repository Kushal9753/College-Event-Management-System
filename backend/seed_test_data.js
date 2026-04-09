import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import Payment from './models/Payment.js';
import bcrypt from 'bcryptjs';

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management');
    console.log('Connected to DB');

    // Create Admin
    await User.deleteOne({ email: 'admin@test.com' });
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'password123', // Will be hashed by pre-save
      phone: '1111111111',
      collegeName: 'Test College',
      enrollmentNumber: 'ADMIN001',
      role: 'admin'
    });

    // Create Faculty
    await Faculty.deleteOne({ email: 'faculty@test.com' });
    const faculty = await Faculty.create({
      name: 'Faculty Test',
      email: 'faculty@test.com',
      department: 'CS',
      password: 'password123',
      status: 'active'
    });

    // Create Student
    await User.deleteOne({ email: 'student@test.com' });
    const student = await User.create({
      name: 'Student Test',
      email: 'student@test.com',
      password: 'password123',
      phone: '2222222222',
      collegeName: 'Test College',
      enrollmentNumber: 'STUDENT001',
      role: 'student'
    });

    // Create Event
    await Event.deleteOne({ title: 'Test Payment Event' });
    const event = await Event.create({
      title: 'Test Payment Event',
      venue: 'Auditorium',
      date: new Date('2026-05-01'),
      time: '10:00 AM',
      duration: '2 hours',
      category: 'hackathon',
      description: 'Test event for payments',
      registrationFees: 500,
      prize: '10000',
      createdBy: admin._id,
      role: 'admin',
      assignedFaculty: [faculty._id],
      status: 'approved',
      registrations: [student._id]
    });

    // Create Registration
    await Registration.deleteMany({ eventId: event._id });
    const registration = await Registration.create({
      studentName: student.name,
      email: student.email,
      phone: student.phone,
      studentId: student._id,
      eventId: event._id,
      paymentStatus: 'paid',
      transactionId: 'TXN123456789',
      paymentMethod: 'UPI',
      amount: event.registrationFees,
    });

    // Create Payment
    await Payment.deleteMany({ eventId: event._id });
    const payment = await Payment.create({
      studentName: student.name,
      email: student.email,
      phone: student.phone,
      studentId: student._id,
      eventId: event._id,
      amount: event.registrationFees,
      paymentStatus: 'paid',
      transactionId: 'TXN123456789',
      paymentMethod: 'UPI',
      verifiedBy: admin._id,
    });

    console.log('Seeding completed successfully!');
    console.log('Admin: admin@test.com / password123');
    console.log('Faculty: faculty@test.com / password123');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    process.exit(0);
  }
}

seedData();
