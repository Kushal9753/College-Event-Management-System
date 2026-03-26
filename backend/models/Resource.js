import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    sharedWith: {
      type: String,
      enum: ['faculty', 'department', 'all'],
      default: 'all',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
