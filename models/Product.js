import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length >= 3;
        },
        message: 'At least 3 images are required',
      },
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stepPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    buyNowPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    autoExtend: {
      type: Boolean,
      default: false,
    },
    allowNonRatedBidders: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'ended', 'cancelled'],
      default: 'active',
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    blockedBidders: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);

