import mongoose from 'mongoose'
import { paginationPlugin } from '../utils/mongoose-plugins.js'

const sellerRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

sellerRequestSchema.pre('find', function () {
  this.populate('userId').populate('reviewedBy')
})
sellerRequestSchema.pre('findOne', function () {
  this.populate('userId').populate('reviewedBy')
})
sellerRequestSchema.pre('findOneAndUpdate', function () {
  this.populate('userId').populate('reviewedBy')
})

sellerRequestSchema.plugin(paginationPlugin)

export default mongoose.model('SellerRequest', sellerRequestSchema)
