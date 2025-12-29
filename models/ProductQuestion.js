import mongoose from 'mongoose'
import { paginationPlugin } from '../utils/mongoose-plugins.js'

const productQuestionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    askerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      default: null,
      trim: true,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

productQuestionSchema.pre('find', function () {
  this.populate('askerId').populate('productId')
})
productQuestionSchema.pre('findOne', function () {
  this.populate('askerId').populate('productId')
})
productQuestionSchema.pre('findOneAndUpdate', function () {
  this.populate('askerId').populate('productId')
})

productQuestionSchema.plugin(paginationPlugin)

export default mongoose.model('ProductQuestion', productQuestionSchema)
