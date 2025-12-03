import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['number', 'boolean', 'string'],
      default: 'string',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('SystemConfig', systemConfigSchema);

