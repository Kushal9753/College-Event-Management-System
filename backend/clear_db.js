import 'dotenv/config';
import mongoose from 'mongoose';
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

async function clearData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    console.log('Clearing all collections...');

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

    console.log('✅ All data, including users and events, has been successfully cleared!');
  } catch (err) {
    console.error('❌ Error clearing data:', err);
  } finally {
    process.exit(0);
  }
}

clearData();
