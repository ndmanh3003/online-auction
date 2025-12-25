import mongoose from 'mongoose'
import { paginationPlugin } from '../utils/mongoose-plugins.js'

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

categorySchema.pre('find', function () {
  this.populate('parentId')
})
categorySchema.pre('findOne', function () {
  this.populate('parentId')
})
categorySchema.pre('findOneAndUpdate', function () {
  this.populate('parentId')
})

categorySchema.plugin(paginationPlugin)

export default mongoose.model('Category', categorySchema)
