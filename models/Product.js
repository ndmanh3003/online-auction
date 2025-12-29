import mongoose from 'mongoose'
import { paginationPlugin } from '../utils/mongoose-plugins.js'
import AutoBid from './AutoBid.js'
import Watchlist from './Watchlist.js'

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
    appendedDescriptions: [
      {
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length >= 4
        },
        message: 'At least 4 images are required',
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
    currentPrice: {
      type: Number,
      default: null,
    },
    currentWinnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bids: [
      {
        bidderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        bidAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

productSchema.index({ name: 'text', description: 'text' })

productSchema.pre('find', function () {
  this.populate('categoryId')
    .populate('sellerId')
    .populate('currentWinnerId')
    .populate('bids.bidderId')
})
productSchema.pre('findOne', function () {
  this.populate('categoryId')
    .populate('sellerId')
    .populate('currentWinnerId')
    .populate('bids.bidderId')
})
productSchema.pre('findOneAndUpdate', function () {
  this.populate('categoryId')
    .populate('sellerId')
    .populate('currentWinnerId')
    .populate('bids.bidderId')
})

productSchema.methods.isInWatchlist = async function (userId) {
  const item = await Watchlist.findOne({ userId, productId: this._id })
  return item !== null
}

productSchema.methods.getUserBid = async function (userId) {
  const autoBid = await AutoBid.findOne({
    productId: this._id,
    bidderId: userId,
  })
  if (!autoBid) return null
  return {
    maxBidAmount: autoBid.maxBidAmount,
    createdAt: autoBid.createdAt,
  }
}

productSchema.plugin(paginationPlugin)

export default mongoose.model('Product', productSchema)
