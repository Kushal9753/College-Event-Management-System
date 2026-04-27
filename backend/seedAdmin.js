import 'dotenv/config';
import User from './models/User.js';
import connectDB from './config/db.js';

const seedAdmin = async () => {
  try {
    await connectDB();

    console.log('Connected to DB. Checking for admin...');

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin already exists! Skipping.');
      process.exit();
    }

    // Create an Admin User
    await User.create({
      name: 'System Admin',
      email: 'admin@college.com',
      phone: '9999999999',
      collegeName: 'CDGI',
      enrollmentNumber: 'ADMIN001',
      password: 'Admin@123',
      role: 'admin'
    });

    console.log('✅ Admin User Successfully Created!');
    console.log('------------------------------------');
    console.log('Email: admin@college.com');
    console.log('Password: Admin@123');
    console.log('------------------------------------');
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error importing admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
