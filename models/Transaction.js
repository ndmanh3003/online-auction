import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'payment_confirmed',
        'shipped',
        'delivered',
        'completed',
        'cancelled',
      ],
      default: 'pending_payment',
      index: true,
    },
    paymentProof: {
      type: String,
      default: null,
    },
    shippingInfo: {
      address: {
        type: String,
        default: '',
      },
      trackingNumber: {
        type: String,
        default: '',
      },
      carrier: {
        type: String,
        default: '',
      },
    },
    deliveryConfirmedAt: {
      type: Date,
      default: null,
    },
    ratings: {
      sellerRated: {
        type: Boolean,
        default: false,
      },
      bidderRated: {
        type: Boolean,
        default: false,
      },
    },
    chat: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Transaction', transactionSchema);

