import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
    },
    duration: {
      type: String,
    },
    category: {
      type: String,
      enum: ['hackathon', 'seminar', 'workshop', 'cultural', 'sports', 'technical', 'other'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    registrationFees: {
      type: Number,
      required: [true, 'Registration fees are required'],
      default: 0,
    },
    prize: {
      type: String,
      required: [true, 'Prize is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event creator is required'],
    },
    role: {
      type: String,
      enum: ['admin', 'faculty'],
      required: [true, 'Creator role is required'],
    },
    assignedFaculty: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxParticipants: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    attended: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    winners: [
      {
        position: {
          type: Number,
          required: true,
          enum: [1, 2, 3],
        },
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'ongoing', 'completed', 'pending_approval', 'published', 'rejected', 'archived'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
