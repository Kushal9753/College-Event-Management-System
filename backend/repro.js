import 'dotenv/config';
import mongoose from 'mongoose';
import BankDetails from './models/BankDetails.js';

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management');
  const details = await BankDetails.findOne();
  console.log("BANK DETAILS:", details);
  process.exit(0);
}
test();
