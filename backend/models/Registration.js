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
    paymentScreenshot: {
      type: String, // Path to the uploaded screenshot
    },
  },
  { timestamps: true }
);

// Performance indexes
registrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1 });
registrationSchema.index({ paymentStatus: 1 });

export default mongoose.model('Registration', registrationSchema);
