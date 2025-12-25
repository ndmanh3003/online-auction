import mongoose from 'mongoose'
import { paginationPlugin } from '../utils/mongoose-plugins.js'

const auctionConfigSchema = new mongoose.Schema(
  {
    autoExtendThresholdMinutes: {
      type: Number,
      default: 5,
      min: 1,
    },
    autoExtendDurationMinutes: {
      type: Number,
      default: 10,
      min: 1,
    },
    sellerDurationDays: {
      type: Number,
      default: 7,
      min: 1,
    },
    newProductHighlightMinutes: {
      type: Number,
      default: 30,
      min: 1,
    },
    minRatingPercentForBid: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
)

auctionConfigSchema.plugin(paginationPlugin)

export default mongoose.model('AuctionConfig', auctionConfigSchema)
