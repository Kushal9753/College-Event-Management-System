import 'dotenv/config';
import User from './models/User.js';
import Role from './models/Role.js';
import connectDB from './config/db.js';

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Role.deleteMany();

    // Create Base Roles
    await Role.insertMany([
      { name: 'admin' },
      { name: 'faculty' },
      { name: 'student' }
    ]);

    // Create an Admin User
    await User.create({
      name: 'Admin User',
      enrollmentNumber: 'ADMIN123',
      password: 'password123',
      role: 'admin'
    });

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
