import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    qrCode: {
      type: String, // Data URI for the dynamic QR code
    },
  },
  { timestamps: true }
);

export default mongoose.model('Registration', registrationSchema);
