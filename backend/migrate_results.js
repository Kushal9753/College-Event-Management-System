import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Result from './models/Result.js';
import User from './models/User.js';

dotenv.config({ path: './.env' });

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const publishedEvents = await Event.find({ status: 'published' }).populate('winners.student', 'name email enrollmentNumber phone branch year');
    console.log(`Found ${publishedEvents.length} published events.`);

    let count = 0;
    for (const event of publishedEvents) {
      if (event.winners && event.winners.length > 0) {
        const formattedWinners = event.winners.map(w => {
          if (!w.student) return null;
          const posString = w.position === 1 ? '1st' : w.position === 2 ? '2nd' : '3rd';
          return {
            position: posString,
            studentId: w.student._id,
            name: w.student.name || 'Unknown',
            rollNumber: w.student.enrollmentNumber || 'N/A',
            branch: w.student.branch || 'N/A',
            year: w.student.year || 'N/A',
            email: w.student.email || 'N/A',
            phone: w.student.phone || 'N/A',
            prize: posString === '1st' ? '1st Prize' : posString === '2nd' ? '2nd Prize' : '3rd Prize',
            score: 'N/A'
          };
        }).filter(Boolean);

        if (formattedWinners.length > 0) {
          await Result.findOneAndUpdate(
            { eventId: event._id },
            {
              eventId: event._id,
              eventName: event.title,
              winners: formattedWinners,
              createdBy: event.createdBy,
              createdByModel: 'User'
            },
            { upsert: true, new: true }
          );
          count++;
        }
      }
    }
    console.log(`Migrated ${count} events to Results.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
