import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    maxBidAmount: {
      type: Number,
      default: null,
      min: 0,
    },
    isAutoBid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

bidSchema.index({ productId: 1, bidAmount: -1 });

export default mongoose.model('Bid', bidSchema);

