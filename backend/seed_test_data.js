import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import Payment from './models/Payment.js';
import Availability from './models/Availability.js';
import Resource from './models/Resource.js';
import Notification from './models/Notification.js';
import Message from './models/Message.js';
import Result from './models/Result.js';
import bcrypt from 'bcryptjs';

const SEED_PASSWORD = process.env.SEED_PASSWORD || 'password123';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'ME', 'CE', 'MBA'];
const EVENT_CATEGORIES = ['hackathon', 'seminar', 'workshop', 'cultural', 'sports', 'technical', 'other'];
const PAYMENT_METHODS = ['UPI', 'Card', 'NetBanking', 'Cash'];
const TIME_SLOTS = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '02:00-03:00', '03:00-04:00'];

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const makeEnrollment = (index) => `STU${new Date().getFullYear()}${String(index).padStart(4, '0')}`;

const dateToYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management');
    console.log('Connected to DB');

    // Clear existing demo data (keeps DB clean for UI)
    await Promise.all([
      Result.deleteMany({}),
      Notification.deleteMany({}),
      Message.deleteMany({}),
      Payment.deleteMany({}),
      Registration.deleteMany({}),
      Event.deleteMany({}),
      Resource.deleteMany({}),
      Availability.deleteMany({}),
      Faculty.deleteMany({}),
      User.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    // --- Users (Admin + FacultyUser + Students) ---
    const adminUser = {
      name: 'Admin Test',
      email: 'admin@test.com',
      password: hashedPassword,
      phone: '1111111111',
      collegeName: 'Test College',
      enrollmentNumber: 'ADMIN001',
      role: 'admin',
    };

    // Optional: a faculty user in User collection (for events created by faculty in Event.createdBy)
    const facultyUser = {
      name: 'Faculty User',
      email: 'faculty.user@test.com',
      password: hashedPassword,
      phone: '3333333333',
      collegeName: 'Test College',
      enrollmentNumber: 'FACULTY001',
      role: 'faculty',
    };

    const fixedStudent = {
      name: 'Student Test',
      email: 'student@test.com',
      password: hashedPassword,
      phone: '2222222222',
      collegeName: 'Test College',
      enrollmentNumber: 'STUDENT001',
      role: 'student',
    };

    const studentCount = Number(process.env.SEED_STUDENTS || 40);
    const facultyCount = Number(process.env.SEED_FACULTY || 12);
    const eventCount = Number(process.env.SEED_EVENTS || 45);
    const resourcesCount = Number(process.env.SEED_RESOURCES || 25);

    const studentsToCreate = Array.from({ length: studentCount }, (_, i) => {
      const idx = i + 2; // 1 reserved for fixedStudent
      const first = faker.person.firstName();
      const last = faker.person.lastName();
      return {
        name: `${first} ${last}`,
        email: `student${idx}@test.com`,
        password: hashedPassword,
        phone: faker.phone.number('9#########'),
        collegeName: 'Test College',
        enrollmentNumber: makeEnrollment(idx),
        role: 'student',
      };
    });

    const createdUsers = await User.insertMany([adminUser, facultyUser, fixedStudent, ...studentsToCreate]);
    const admin = createdUsers.find((u) => u.email === 'admin@test.com');
    const facultyUserDoc = createdUsers.find((u) => u.email === 'faculty.user@test.com');
    const student = createdUsers.find((u) => u.email === 'student@test.com');
    const allStudents = createdUsers.filter((u) => u.role === 'student');

    // --- Faculty collection (Faculty login uses this) ---
    const fixedFaculty = {
      name: 'Faculty Test',
      email: 'faculty@test.com',
      department: 'CSE',
      password: hashedPassword,
      status: 'active',
      phone: faker.phone.number('9#########'),
      designation: 'Assistant Professor',
      collegeName: 'Test College',
      expertise: ['Web Development', 'DBMS'],
    };

    const facultyToCreate = Array.from({ length: facultyCount }, (_, i) => {
      const idx = i + 1;
      const first = faker.person.firstName();
      const last = faker.person.lastName();
      const dept = sample(DEPARTMENTS);
      return {
        name: `${first} ${last}`,
        email: `faculty${idx}@test.com`,
        department: dept,
        password: hashedPassword,
        status: faker.helpers.weightedArrayElement([
          { weight: 9, value: 'active' },
          { weight: 1, value: 'inactive' },
        ]),
        phone: faker.phone.number('9#########'),
        designation: faker.helpers.arrayElement(['Assistant Professor', 'Associate Professor', 'Professor']),
        collegeName: 'Test College',
        expertise: faker.helpers.arrayElements(
          ['AI', 'ML', 'DSA', 'Networks', 'Cyber Security', 'Cloud', 'IoT', 'Web Development', 'DBMS'],
          { min: 1, max: 3 }
        ),
      };
    });

    const createdFaculty = await Faculty.insertMany([fixedFaculty, ...facultyToCreate]);

    // --- Availability for faculty ---
    const availabilityDocs = [];
    const startDate = new Date();
    for (const facultyMember of createdFaculty) {
      for (let dayOffset = 0; dayOffset < 21; dayOffset++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + dayOffset);
        const ymd = dateToYMD(d);
        const slots = faker.helpers.arrayElements(TIME_SLOTS, { min: 3, max: 5 });
        for (const slot of slots) {
          availabilityDocs.push({
            facultyId: facultyMember._id,
            date: ymd,
            timeSlot: slot,
            status: faker.helpers.weightedArrayElement([
              { weight: 8, value: 'available' },
              { weight: 2, value: 'booked' },
            ]),
          });
        }
      }
    }
    await Availability.insertMany(availabilityDocs, { ordered: false });

    // --- Events ---
    const venues = ['Auditorium', 'Seminar Hall', 'Main Ground', 'Lab 1', 'Lab 2', 'Conference Room', 'Open Air Theatre'];
    const statuses = ['approved', 'approved', 'approved', 'pending', 'ongoing', 'completed', 'published'];

    const eventsToCreate = Array.from({ length: eventCount }, (_, i) => {
      const isPaid = faker.number.int({ min: 0, max: 100 }) < 55;
      const fee = isPaid ? faker.helpers.arrayElement([99, 199, 299, 499, 799, 999]) : 0;
      const category = sample(EVENT_CATEGORIES);
      const status = sample(statuses);
      const creator = faker.number.int({ min: 0, max: 100 }) < 25 ? facultyUserDoc : admin;
      const creatorRole = creator.role;
      const assigned = faker.helpers.arrayElements(createdFaculty.map((f) => f._id), { min: 1, max: 3 });
      const eventDate = faker.date.between({
        from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        to: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      });

      return {
        title: `${faker.company.buzzNoun()} ${faker.helpers.arrayElement(['Fest', 'Summit', 'Challenge', 'Meet', 'Workshop', 'Seminar'])} #${i + 1}`,
        venue: sample(venues),
        date: eventDate,
        time: faker.helpers.arrayElement(['09:30 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']),
        duration: faker.helpers.arrayElement(['1 hour', '2 hours', '3 hours', 'Full day']),
        category,
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        registrationFees: fee,
        prize: fee > 0 ? `${faker.helpers.arrayElement(['5000', '10000', '15000', '20000'])}` : 'Certificate',
        createdBy: creator._id,
        role: creatorRole,
        assignedFaculty: assigned,
        status,
        maxParticipants: faker.helpers.arrayElement([0, 50, 100, 150, 200]),
        registrations: [],
        attended: [],
      };
    });

    // Add one explicit event for payments demo (keeps previous behavior)
    eventsToCreate.unshift({
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
      assignedFaculty: [createdFaculty[0]._id],
      status: 'approved',
      registrations: [],
      attended: [],
    });

    const createdEvents = await Event.insertMany(eventsToCreate);

    // --- Registrations + Payments ---
    const registrations = [];
    const payments = [];

    for (const ev of createdEvents) {
      const maxRegs = faker.number.int({ min: 8, max: 25 });
      const chosenStudents = shuffle(allStudents).slice(0, Math.min(maxRegs, allStudents.length));

      for (const s of chosenStudents) {
        const shouldPay = ev.registrationFees > 0;
        const paymentStatus = shouldPay
          ? faker.helpers.weightedArrayElement([
            { weight: 7, value: 'paid' },
            { weight: 2, value: 'pending' },
            { weight: 1, value: 'failed' },
          ])
          : 'paid';

        const txnId = paymentStatus === 'paid' ? `TXN${faker.string.numeric(10)}` : undefined;
        const method = shouldPay ? sample(PAYMENT_METHODS) : 'Free';

        registrations.push({
          studentName: s.name,
          email: s.email,
          phone: s.phone,
          studentId: s._id,
          eventId: ev._id,
          paymentStatus,
          transactionId: txnId,
          paymentMethod: method,
          amount: ev.registrationFees,
        });

        if (shouldPay) {
          payments.push({
            studentName: s.name,
            email: s.email,
            phone: s.phone,
            studentId: s._id,
            eventId: ev._id,
            amount: ev.registrationFees,
            paymentStatus,
            transactionId: txnId,
            paymentMethod: method,
            verifiedBy: admin._id,
          });
        }
      }

      // also store registrations list on event doc (for UI convenience)
      ev.registrations = chosenStudents.map((s) => s._id);
      if (['completed', 'published'].includes(ev.status)) {
        ev.attended = chosenStudents.slice(0, faker.number.int({ min: 3, max: 10 })).map((s) => s._id);
      }
    }

    await Registration.insertMany(registrations);
    if (payments.length > 0) {
      await Payment.insertMany(payments);
    }
    await Event.bulkWrite(
      createdEvents.map((ev) => ({
        updateOne: {
          filter: { _id: ev._id },
          update: { $set: { registrations: ev.registrations, attended: ev.attended } },
        },
      }))
    );

    // --- Resources (for Resource Sharing UI) ---
    const dummyFileUrl = '/uploads/resources/1774202825516-302682588-dummy.txt';
    const resources = Array.from({ length: resourcesCount }, (_, i) => ({
      fileName: `${faker.helpers.arrayElement(['Syllabus', 'Assignment', 'Notes', 'Template', 'Guidelines'])}_${i + 1}.txt`,
      fileUrl: dummyFileUrl,
      sharedWith: faker.helpers.arrayElement(['all', 'faculty', 'department']),
      uploadedBy: admin._id,
    }));
    await Resource.insertMany(resources);

    // --- Notifications ---
    const notifications = [];
    for (let i = 0; i < 80; i++) {
      const recipient = sample(createdUsers);
      const relatedEvent = faker.number.int({ min: 0, max: 100 }) < 70 ? sample(createdEvents) : null;
      notifications.push({
        recipient: recipient._id,
        type: faker.helpers.arrayElement(['general', 'event_status_update', 'result_published']),
        message: relatedEvent
          ? `Update: ${relatedEvent.title} status is ${relatedEvent.status}`
          : faker.lorem.sentence(),
        relatedEvent: relatedEvent ? relatedEvent._id : undefined,
        isRead: faker.datatype.boolean({ probability: 0.35 }),
      });
    }
    await Notification.insertMany(notifications);

    // --- Messages (Admin -> Faculty) ---
    const messages = [];
    const facultyIds = createdFaculty.map((f) => f._id);
    for (let i = 0; i < 40; i++) {
      const receivers = faker.helpers.arrayElements(facultyIds, { min: 1, max: 4 });
      messages.push({
        sender: admin._id,
        receivers,
        message: faker.lorem.sentence(),
        type: receivers.length === 1 ? 'individual' : 'group',
      });
    }
    await Message.insertMany(messages);

    // --- Results (for some completed/published events) ---
    const completedEvents = createdEvents.filter((e) => ['completed', 'published'].includes(e.status));
    const resultsToCreate = [];
    for (const ev of completedEvents.slice(0, 12)) {
      const eligible = shuffle(allStudents).slice(0, 50);
      const top3 = eligible.slice(0, 3);
      const positions = ['1st', '2nd', '3rd'];

      resultsToCreate.push({
        eventId: ev._id,
        eventName: ev.title,
        winners: top3.map((s, idx) => ({
          position: positions[idx],
          studentId: s._id,
          name: s.name,
          rollNumber: s.enrollmentNumber,
          branch: sample(DEPARTMENTS),
          year: faker.helpers.arrayElement(['1st', '2nd', '3rd', '4th']),
          email: s.email,
          phone: s.phone,
          prize: ev.prize,
          score: String(faker.number.int({ min: 60, max: 100 })),
          certificateUrl: faker.number.int({ min: 0, max: 100 }) < 40 ? dummyFileUrl : '',
        })),
        createdBy: admin._id,
        createdByModel: 'User',
      });

      // mirror into Event.winners (optional)
      ev.winners = top3.map((s, idx) => ({ position: idx + 1, student: s._id }));
    }
    if (resultsToCreate.length > 0) {
      await Result.insertMany(resultsToCreate, { ordered: false });
      await Event.bulkWrite(
        completedEvents.slice(0, 12).map((ev) => ({
          updateOne: { filter: { _id: ev._id }, update: { $set: { winners: ev.winners } } },
        }))
      );
    }

    console.log('Seeding completed successfully!');
    console.log(`Admin: admin@test.com / ${SEED_PASSWORD}`);
    console.log(`Faculty: faculty@test.com / ${SEED_PASSWORD}`);
    console.log(`Student: student@test.com / ${SEED_PASSWORD}`);
    console.log(`Created: ${createdUsers.length} users (students included), ${createdFaculty.length} faculty, ${createdEvents.length} events`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    process.exit(0);
  }
}

seedData();
