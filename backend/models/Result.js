import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: [true, 'Position is required'],
      enum: ['1st', '2nd', '3rd'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Winner name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    prize: {
      type: String,
      required: [true, 'Prize is required'],
      trim: true,
    },
    score: {
      type: String,
      trim: true,
    },
    certificateUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    winners: {
      type: [winnerSchema],
      validate: {
        validator: function (winners) {
          // Ensure no duplicate positions
          const positions = winners.map((w) => w.position);
          return positions.length === new Set(positions).size;
        },
        message: 'Duplicate positions are not allowed for the same event',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdByModel',
      required: [true, 'Creator ID is required'],
    },
    createdByModel: {
      type: String,
      enum: ['User', 'Faculty'],
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index: one result document per event
resultSchema.index({ eventId: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);
