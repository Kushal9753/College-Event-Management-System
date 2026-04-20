/**
 * ============================================================
 * CDGI Event Management System — Demo Data Seeder
 * ============================================================
 * Run:  node seedDemoData.js
 *
 * This script creates realistic data without wiping existing
 * accounts. It will:
 *   1. Create 3 Faculty accounts
 *   2. Create 5 additional Student accounts
 *   3. Create 10 realistic events (past, ongoing, future)
 *   4. Create registrations & payments for events
 *   5. Create results for completed events
 *   6. Create notifications
 *   7. Create event logs
 *   8. Create bank details for payment config
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import Payment from './models/Payment.js';
import Result from './models/Result.js';
import Notification from './models/Notification.js';
import EventLog from './models/EventLog.js';
import BankDetails from './models/BankDetails.js';

// ─── Connect ─────────────────────────────────────────────
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ MongoDB Connected');

// ─── Helper ──────────────────────────────────────────────
const hash = async (pw) => bcrypt.hash(pw, 10);
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const txnId = () => 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

// Date helpers (relative to now: April 18, 2026)
const d = (daysOffset) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + daysOffset);
  return dt;
};

// ─── 1. Ensure Admin exists ────────────────────────────
let admin = await User.findOne({ email: 'admin@college.com' });
if (!admin) {
  admin = await User.create({
    name: 'Dr. Rajesh Kumar',
    email: 'admin@college.com',
    phone: '9876543210',
    collegeName: 'CDGI',
    enrollmentNumber: 'ADMIN001',
    password: 'Admin@123',
    role: 'admin',
  });
  console.log('👑 Admin created');
} else {
  console.log('👑 Admin already exists');
}

// ─── 2. Ensure existing student ────────────────────────
let student1 = await User.findOne({ email: 'kritagyajaiswal0@gmail.com' });
if (!student1) {
  student1 = await User.create({
    name: 'Kritagya Jaiswal',
    email: 'kritagyajaiswal0@gmail.com',
    phone: '9876543211',
    collegeName: 'CDGI',
    enrollmentNumber: '0827CS221120',
    password: 'Kritagya@123',
    role: 'student',
  });
  console.log('🎓 Student (Kritagya) created');
} else {
  console.log('🎓 Student (Kritagya) already exists');
}

// ─── 3. Create Faculty accounts ────────────────────────
const facultyData = [
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@cdgi.edu.in',
    department: 'Computer Science & Engineering',
    expertise: ['Machine Learning', 'Data Structures', 'Python'],
    phone: '9012345678',
    designation: 'Associate Professor',
    password: 'Faculty@123',
  },
  {
    name: 'Prof. Amit Verma',
    email: 'amit.verma@cdgi.edu.in',
    department: 'Electronics & Communication',
    expertise: ['IoT', 'Embedded Systems', 'Signal Processing'],
    phone: '9012345679',
    designation: 'Assistant Professor',
    password: 'Faculty@123',
  },
  {
    name: 'Dr. Neha Patel',
    email: 'neha.patel@cdgi.edu.in',
    department: 'Information Technology',
    expertise: ['Web Development', 'Cloud Computing', 'Cyber Security'],
    phone: '9012345680',
    designation: 'Professor',
    password: 'Faculty@123',
  },
];

const faculties = [];
for (const fd of facultyData) {
  let fac = await Faculty.findOne({ email: fd.email });
  if (!fac) {
    fac = await Faculty.create({ ...fd, collegeName: 'CDGI', status: 'active', role: 'faculty' });
    console.log(`👨‍🏫 Faculty created: ${fd.name}`);
  } else {
    console.log(`👨‍🏫 Faculty exists: ${fd.name}`);
  }
  faculties.push(fac);
}

// ─── 4. Create additional students ─────────────────────
const studentData = [
  { name: 'Rohit Mehra', email: 'rohit.mehra@cdgi.edu.in', phone: '9112233441', enrollmentNumber: '0827CS221102' },
  { name: 'Sneha Gupta', email: 'sneha.gupta@cdgi.edu.in', phone: '9112233442', enrollmentNumber: '0827CS221135' },
  { name: 'Arjun Singh Rajput', email: 'arjun.rajput@cdgi.edu.in', phone: '9112233443', enrollmentNumber: '0827CS221108' },
  { name: 'Pooja Yadav', email: 'pooja.yadav@cdgi.edu.in', phone: '9112233444', enrollmentNumber: '0827IT221015' },
  { name: 'Vikram Malhotra', email: 'vikram.malhotra@cdgi.edu.in', phone: '9112233445', enrollmentNumber: '0827EC221042' },
];

const students = [student1];
for (const sd of studentData) {
  let stu = await User.findOne({ email: sd.email });
  if (!stu) {
    stu = await User.create({
      ...sd,
      collegeName: 'CDGI',
      password: 'Student@123',
      role: 'student',
    });
    console.log(`🎓 Student created: ${sd.name}`);
  } else {
    console.log(`🎓 Student exists: ${sd.name}`);
  }
  students.push(stu);
}

// ─── 5. Create Events ──────────────────────────────────
// Delete existing events to avoid duplicates on re-run
await Event.deleteMany({});
await Registration.deleteMany({});
await Payment.deleteMany({});
await Result.deleteMany({});
await Notification.deleteMany({});
await EventLog.deleteMany({});
console.log('🧹 Cleared old events, registrations, payments, results, notifications, logs');

const eventsData = [
  // ── COMPLETED EVENTS (past) ──
  {
    title: 'CodeStorm 2026 — National Level Hackathon',
    venue: 'Auditorium Hall A, CDGI Main Campus',
    date: d(-30),
    time: '09:00 AM',
    duration: '24 Hours',
    category: 'hackathon',
    description: 'A 24-hour national-level hackathon where teams of 2-4 build innovative solutions to real-world problems. Themes include HealthTech, EdTech, and FinTech. Mentors from top tech companies will guide participants. Prizes worth ₹1,00,000.',
    registrationFees: 200,
    prize: '₹50,000 (1st) | ₹25,000 (2nd) | ₹15,000 (3rd)',
    createdBy: admin._id,
    role: 'admin',
    maxParticipants: 100,
    status: 'completed',
  },
  {
    title: 'AI/ML Workshop — Hands-on with TensorFlow',
    venue: 'Computer Lab 3, Block B',
    date: d(-20),
    time: '10:00 AM',
    duration: '6 Hours',
    category: 'workshop',
    description: 'An intensive workshop on building machine learning models using TensorFlow and Keras. Covers neural networks, image classification, and NLP basics. Laptops required. Pre-requisites: Python basics.',
    registrationFees: 100,
    prize: 'Participation Certificate + Top 3 get Udemy courses',
    createdBy: faculties[0]._id,
    role: 'faculty',
    assignedFaculty: [faculties[0]._id],
    maxParticipants: 60,
    status: 'completed',
  },
  {
    title: 'Techno-Cultural Fest — Rhythm & Code',
    venue: 'Open Air Theatre, CDGI Campus',
    date: d(-15),
    time: '04:00 PM',
    duration: '5 Hours',
    category: 'cultural',
    description: 'The annual techno-cultural extravaganza featuring coding battles, dance performances, band competition, and stand-up comedy. Food stalls and gaming zones available.',
    registrationFees: 50,
    prize: '₹10,000 (Best Performance) | ₹5,000 (Best Coder)',
    createdBy: admin._id,
    role: 'admin',
    maxParticipants: 300,
    status: 'completed',
  },

  // ── ONGOING / APPROVED EVENTS ──
  {
    title: 'Web Development Bootcamp — React & Node.js',
    venue: 'Seminar Hall 2, Block C',
    date: d(0),
    time: '10:00 AM',
    duration: '3 Days (Apr 18-20)',
    category: 'workshop',
    description: 'A 3-day intensive bootcamp covering full-stack web development with React.js, Node.js, Express, and MongoDB. Build a complete project from scratch. Open to all branches.',
    registrationFees: 150,
    prize: 'Certificate of Completion + GitHub portfolio project',
    createdBy: faculties[2]._id,
    role: 'faculty',
    assignedFaculty: [faculties[2]._id],
    maxParticipants: 50,
    status: 'approved',
  },
  {
    title: 'Inter-College Cricket Tournament 2026',
    venue: 'CDGI Sports Ground',
    date: d(1),
    time: '08:00 AM',
    duration: '3 Days',
    category: 'sports',
    description: 'Annual inter-college cricket tournament with 8 participating colleges. T20 format with group stages and knockout rounds. Registration per team (11 players + 3 substitutes).',
    registrationFees: 500,
    prize: '₹25,000 (Winner) | ₹10,000 (Runner-up) | Trophy',
    createdBy: admin._id,
    role: 'admin',
    maxParticipants: 112,
    status: 'approved',
  },

  // ── UPCOMING EVENTS ──
  {
    title: 'CyberShield — Capture the Flag Competition',
    venue: 'Cyber Security Lab, Block D',
    date: d(7),
    time: '11:00 AM',
    duration: '8 Hours',
    category: 'technical',
    description: 'A Capture the Flag (CTF) cybersecurity challenge covering web exploitation, cryptography, reverse engineering, and forensics. Individual participation. Top 10 qualify for state-level competition.',
    registrationFees: 0,
    prize: '₹15,000 (1st) | ₹8,000 (2nd) | ₹5,000 (3rd)',
    createdBy: faculties[2]._id,
    role: 'faculty',
    assignedFaculty: [faculties[2]._id],
    maxParticipants: 80,
    status: 'approved',
  },
  {
    title: 'Guest Lecture — Future of Quantum Computing',
    venue: 'Auditorium Hall B',
    date: d(12),
    time: '02:00 PM',
    duration: '2 Hours',
    category: 'seminar',
    description: 'Distinguished lecture by Dr. Anand Mishra (IIT Delhi) on quantum computing principles, qubits, quantum supremacy, and career opportunities in quantum research. Open to all students and faculty.',
    registrationFees: 0,
    prize: 'Attendance Certificate',
    createdBy: admin._id,
    role: 'admin',
    maxParticipants: 200,
    status: 'approved',
  },
  {
    title: 'RoboWars — Battle of Bots',
    venue: 'Mechanical Workshop, Block E',
    date: d(20),
    time: '10:00 AM',
    duration: '6 Hours',
    category: 'technical',
    description: 'Design and build fighting robots weighing up to 8 kg. Teams of 3-5 members compete in a knockout arena. Robots must be self-built. Components kit provided for registered teams. Safety gear mandatory.',
    registrationFees: 300,
    prize: '₹30,000 (1st) | ₹15,000 (2nd) | ₹8,000 (3rd)',
    createdBy: faculties[1]._id,
    role: 'faculty',
    assignedFaculty: [faculties[1]._id],
    maxParticipants: 40,
    status: 'approved',
  },
  {
    title: 'Photography Contest — Campus Through Your Lens',
    venue: 'Online Submission + Offline Exhibition (Library Hall)',
    date: d(25),
    time: '09:00 AM',
    duration: '1 Week (Submission Period)',
    category: 'cultural',
    description: 'Capture the beauty and spirit of CDGI campus life. Themes: Architecture, People, Nature, and Campus Life. Submit up to 3 entries. Best photos exhibited in the Library Hall and college magazine.',
    registrationFees: 0,
    prize: '₹5,000 (Best Photo) | ₹3,000 (Runner-up) | Featured in Magazine',
    createdBy: admin._id,
    role: 'admin',
    maxParticipants: 0,
    status: 'approved',
  },

  // ── PENDING APPROVAL (faculty submitted, needs admin ok) ──
  {
    title: 'IoT Innovation Challenge',
    venue: 'ECE Department Lab',
    date: d(35),
    time: '10:00 AM',
    duration: '2 Days',
    category: 'technical',
    description: 'Build IoT solutions using Arduino, Raspberry Pi, and ESP32. Focus areas: Smart Agriculture, Smart Home, and Environmental Monitoring. Components provided. Teams of 2-3.',
    registrationFees: 100,
    prize: '₹20,000 (Best Innovation) | ₹10,000 (Runner-up)',
    createdBy: faculties[1]._id,
    role: 'faculty',
    assignedFaculty: [faculties[1]._id],
    maxParticipants: 50,
    status: 'pending',
  },
];

const events = [];
for (const ed of eventsData) {
  const ev = await Event.create(ed);
  events.push(ev);
  console.log(`📅 Event created: ${ed.title} [${ed.status}]`);
}

// ─── 6. Registrations & Payments ────────────────────────
// Register students for completed and ongoing events
const completedEvents = events.filter(e => e.status === 'completed');
const ongoingEvents = events.filter(e => e.status === 'approved' && e.date <= new Date());
const upcomingEvents = events.filter(e => e.status === 'approved' && e.date > new Date());

// Register all students for completed events
for (const ev of completedEvents) {
  const registeredStudents = students.slice(0, Math.min(students.length, 4));
  for (const stu of registeredStudents) {
    const reg = await Registration.create({
      studentName: stu.name,
      email: stu.email,
      phone: stu.phone,
      studentId: stu._id,
      eventId: ev._id,
      paymentStatus: 'paid',
      transactionId: txnId(),
      paymentMethod: randomItem(['UPI', 'Card', 'Cash']),
      paymentDate: new Date(ev.date.getTime() - 2 * 86400000),
      amount: ev.registrationFees,
    });

    // Also add to event registrations array
    ev.registrations.push(stu._id);
    ev.attended.push(stu._id);

    // Create payment record
    await Payment.create({
      studentName: stu.name,
      email: stu.email,
      phone: stu.phone,
      studentId: stu._id,
      eventId: ev._id,
      amount: ev.registrationFees,
      paymentStatus: 'paid',
      transactionId: reg.transactionId,
      paymentMethod: reg.paymentMethod,
      paymentDate: reg.paymentDate,
      verifiedBy: admin._id,
    });
  }
  await ev.save();
  console.log(`📝 Registered ${registeredStudents.length} students for: ${ev.title}`);
}

// Register Kritagya + a couple others for ongoing events
for (const ev of ongoingEvents) {
  const registeredStudents = students.slice(0, 3);
  for (const stu of registeredStudents) {
    await Registration.create({
      studentName: stu.name,
      email: stu.email,
      phone: stu.phone,
      studentId: stu._id,
      eventId: ev._id,
      paymentStatus: 'paid',
      transactionId: txnId(),
      paymentMethod: 'UPI',
      paymentDate: d(-1),
      amount: ev.registrationFees,
    });
    ev.registrations.push(stu._id);

    await Payment.create({
      studentName: stu.name,
      email: stu.email,
      phone: stu.phone,
      studentId: stu._id,
      eventId: ev._id,
      amount: ev.registrationFees,
      paymentStatus: 'paid',
      transactionId: txnId(),
      paymentMethod: 'UPI',
      paymentDate: d(-1),
      verifiedBy: admin._id,
    });
  }
  await ev.save();
  console.log(`📝 Registered students for ongoing: ${ev.title}`);
}

// Register Kritagya for some upcoming events
for (const ev of upcomingEvents.slice(0, 3)) {
  const isPaid = ev.registrationFees > 0;
  await Registration.create({
    studentName: student1.name,
    email: student1.email,
    phone: student1.phone || '9876543211',
    studentId: student1._id,
    eventId: ev._id,
    paymentStatus: isPaid ? 'pending' : 'paid',
    transactionId: isPaid ? null : txnId(),
    paymentMethod: isPaid ? null : 'N/A',
    amount: ev.registrationFees,
  });
  ev.registrations.push(student1._id);
  await ev.save();
  console.log(`📝 Kritagya registered for upcoming: ${ev.title}`);
}

// ─── 7. Results for completed events ────────────────────
for (const ev of completedEvents) {
  const registeredStudents = students.slice(0, Math.min(students.length, 3));
  const winners = registeredStudents.map((stu, idx) => ({
    position: ['1st', '2nd', '3rd'][idx],
    studentId: stu._id,
    name: stu.name,
    rollNumber: stu.enrollmentNumber,
    branch: 'CSE',
    year: '3rd Year',
    email: stu.email,
    phone: stu.phone || '9876543211',
    prize: idx === 0 ? '₹50,000' : idx === 1 ? '₹25,000' : '₹15,000',
    score: String(100 - idx * 8),
  }));

  // Also set winners on the event
  ev.winners = winners.map((w, idx) => ({
    position: idx + 1,
    student: w.studentId,
  }));
  await ev.save();

  await Result.create({
    eventId: ev._id,
    eventName: ev.title,
    winners,
    createdBy: admin._id,
    createdByModel: 'User',
  });
  console.log(`🏆 Results published for: ${ev.title}`);
}

// ─── 8. Notifications ───────────────────────────────────
const notifData = [
  {
    recipient: student1._id,
    type: 'event_status_update',
    message: `🎉 You have been registered for "${events[3].title}". Don't forget to attend!`,
    relatedEvent: events[3]._id,
  },
  {
    recipient: student1._id,
    type: 'result_published',
    message: `🏆 Results for "${events[0].title}" have been published. Check your results!`,
    relatedEvent: events[0]._id,
  },
  {
    recipient: student1._id,
    type: 'general',
    message: '📢 New events have been added for April 2026. Browse available events to register!',
  },
  {
    recipient: student1._id,
    type: 'event_status_update',
    message: `⏰ Reminder: "${events[5].title}" registration is still open. Participate for free!`,
    relatedEvent: events[5]._id,
  },
  {
    recipient: students[1]._id,
    type: 'result_published',
    message: `🏆 Results for "${events[1].title}" are out! Check your ranking now.`,
    relatedEvent: events[1]._id,
  },
];

for (const n of notifData) {
  await Notification.create(n);
}
console.log(`🔔 ${notifData.length} notifications created`);

// ─── 9. Event Logs ──────────────────────────────────────
for (const ev of events) {
  await EventLog.create({
    event: ev._id,
    action: 'created',
    performedBy: ev.createdBy,
    details: `Event "${ev.title}" was created`,
  });

  if (ev.status === 'approved' || ev.status === 'completed') {
    await EventLog.create({
      event: ev._id,
      action: 'approved',
      performedBy: admin._id,
      details: `Event "${ev.title}" was approved by admin`,
    });
  }

  if (ev.status === 'completed') {
    await EventLog.create({
      event: ev._id,
      action: 'winners_added',
      performedBy: admin._id,
      details: `Winners announced for "${ev.title}"`,
    });
  }
}
console.log('📋 Event logs created');

// ─── 10. Bank Details ────────────────────────────────────
await BankDetails.deleteMany({});
await BankDetails.create({
  accountHolderName: 'CDGI Event Committee',
  accountNumber: '9876543210123456',
  ifscCode: 'SBIN0012345',
  bankName: 'State Bank of India',
  upiId: 'cdgi.events@sbi',
});
console.log('🏦 Bank details configured');

// ─── Done ────────────────────────────────────────────────
console.log('\n' + '═'.repeat(55));
console.log('  ✅ ALL DEMO DATA SEEDED SUCCESSFULLY!');
console.log('═'.repeat(55));
console.log('\n📌 Login Credentials:');
console.log('─'.repeat(55));
console.log('  🎓 STUDENT:');
console.log('     Email: kritagyajaiswal0@gmail.com');
console.log('     Pass:  Kritagya@123');
console.log('');
console.log('  👨‍🏫 FACULTY (use any one):');
console.log('     Email: priya.sharma@cdgi.edu.in');
console.log('     Email: amit.verma@cdgi.edu.in');
console.log('     Email: neha.patel@cdgi.edu.in');
console.log('     Pass:  Faculty@123  (same for all)');
console.log('');
console.log('  👑 ADMIN:');
console.log('     Email: admin@college.com');
console.log('     Pass:  Admin@123');
console.log('─'.repeat(55));
console.log(`\n📊 Created: ${events.length} events | ${students.length} students | ${faculties.length} faculty`);
console.log('');

await mongoose.connection.close();
process.exit(0);
