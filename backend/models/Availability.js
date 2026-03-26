import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty reference is required'],
    },
    date: {
      type: String, // e.g., 'YYYY-MM-DD'
      required: [true, 'Date is required'],
      trim: true,
    },
    timeSlot: {
      type: String, // e.g., '09:00-10:00'
      required: [true, 'Time slot is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same faculty on the same date and timeSlot
availabilitySchema.index({ facultyId: 1, date: 1, timeSlot: 1 }, { unique: true });

export default mongoose.model('Availability', availabilitySchema);
