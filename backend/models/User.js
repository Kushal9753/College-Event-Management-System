import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    collegeName: {
      type: String,
      required: [true, 'Please add a college name'],
    },
    enrollmentNumber: {
      type: String,
      required: [true, 'Please add an enrollment number'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);

