import mongoose from 'mongoose'
import { paginationPlugin } from '../utils/mongoose-plugins.js'
import Rating from './Rating.js'
import SellerRequest from './SellerRequest.js'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'bidder'],
      default: null,
    },
    sellerActivatedAt: {
      type: Date,
      default: null,
    },
    sellerExpiresAt: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.methods.getRatingStats = async function () {
  const positive = await Rating.countDocuments({
    toUserId: this._id,
    rating: 1,
  })
  const negative = await Rating.countDocuments({
    toUserId: this._id,
    rating: -1,
  })
  const total = positive + negative
  const percent = total > 0 ? (positive / total) * 100 : 0
  return { positive, negative, total, percent }
}

userSchema.methods.getSellerRequest = async function () {
  return await SellerRequest.findOne({ userId: this._id }).sort({
    createdAt: -1,
  })
}

userSchema.plugin(paginationPlugin)

export default mongoose.model('User', userSchema)
