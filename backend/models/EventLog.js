import mongoose from 'mongoose';

const eventLogSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created',
        'approved',
        'rejected',
        'registered',
        'registration_cancelled',
        'archived',
        'updated',
        'assigned',
        'attendance_marked',
        'winners_added'
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    details: {
      type: String, // E.g., 'Student John Doe registered', 'Event archived by admin'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Optional structured metadata snapshot
    }
  },
  { timestamps: true }
);

export default mongoose.model('EventLog', eventLogSchema);
