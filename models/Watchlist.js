import mongoose from 'mongoose'
import { paginationPlugin } from '../utils/mongoose-plugins.js'

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

watchlistSchema.index({ userId: 1, productId: 1 }, { unique: true })

watchlistSchema.pre('find', function () {
  this.populate('productId').populate('userId')
})
watchlistSchema.pre('findOne', function () {
  this.populate('productId').populate('userId')
})
watchlistSchema.pre('findOneAndUpdate', function () {
  this.populate('productId').populate('userId')
})

watchlistSchema.plugin(paginationPlugin)

export default mongoose.model('Watchlist', watchlistSchema)
