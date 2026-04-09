import mongoose from 'mongoose';

const bankDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    upiId: {
      type: String,
      trim: true,
    },
    qrCodeImage: {
      type: String, // URL/Path to the static QR image
    },
  },
  { timestamps: true }
);

export default mongoose.model('BankDetails', bankDetailsSchema);
