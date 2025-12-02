import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      enum: [1, -1],
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['bidder_to_seller', 'seller_to_bidder'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ratingSchema.index({ productId: 1, fromUserId: 1, toUserId: 1 });

export default mongoose.model('Rating', ratingSchema);

