import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    transactionId: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Can be Admin or Faculty
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
