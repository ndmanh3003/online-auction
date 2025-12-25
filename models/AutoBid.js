import mongoose from 'mongoose'
import { paginationPlugin } from '../utils/mongoose-plugins.js'

const autoBidSchema = new mongoose.Schema(
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
    maxBidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

autoBidSchema.index({ productId: 1, bidderId: 1 }, { unique: true })

autoBidSchema.plugin(paginationPlugin)

export default mongoose.model('AutoBid', autoBidSchema)
