import 'dotenv/config';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
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
      email: 'admin@example.com',
      phone: '1234567890',
      collegeName: 'CDGI',
      enrollmentNumber: 'ADMIN123',
      password: 'password123',
      role: 'admin'
    });

    // Create a Student User
    await User.create({
      name: 'Student User',
      email: 'student@example.com',
      phone: '0987654321',
      collegeName: 'CDGI',
      enrollmentNumber: 'STUDENT123',
      password: 'password123',
      role: 'student'
    });

    // Create a Faculty
    await Faculty.create({
      name: 'Test Faculty',
      email: 'testfaculty@example.com',
      department: 'Computer Science',
      password: 'mypassword123',
      status: 'active'
    });

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
