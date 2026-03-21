import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['admin', 'faculty', 'student'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
