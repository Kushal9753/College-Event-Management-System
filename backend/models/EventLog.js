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
        'updated',
        'assigned',
        'attendance_marked',
        'winners_added',
        'payment_completed',
        'payment_proof_submitted'
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

// Performance index for event log queries
eventLogSchema.index({ event: 1, createdAt: -1 });

export default mongoose.model('EventLog', eventLogSchema);
