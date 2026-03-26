import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receivers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Faculty',
      required: [true, 'At least one receiver is required'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Receivers array must not be empty',
      },
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['individual', 'group', 'broadcast'],
      required: [true, 'Message type is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster history queries
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receivers: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
