import bcrypt from 'bcryptjs'
import express from 'express'
import AutoBid from '../../models/AutoBid.js'
import OTP from '../../models/OTP.js'
import Product from '../../models/Product.js'
import Rating from '../../models/Rating.js'
import SellerRequest from '../../models/SellerRequest.js'
import User from '../../models/User.js'
import { processBids } from '../../utils/bids.js'
import * as emailService from '../../utils/email.js'
import { generateOTP } from '../../utils/otp.js'

const router = express.Router()

router.get('/profile', async function (req, res) {
  const user = await User.findById(req.session.authUser._id)

  res.render('vwAccount/profile', {
    sellerRequest: await user.getSellerRequest(),
    ratingStats: await user.getRatingStats(),
    ratings: await Rating.paginate(req, {
      toUserId: req.session.authUser._id,
    }).items,
  })
})

router.post('/edit', async function (req, res) {
  const { name, email, dob, address } = req.body
  const userId = req.session.authUser._id
  const user = await User.findById(userId)
  if (email !== user.email) {
    const otpCode = generateOTP()
    await OTP.updateMany(
      {
        email,
        type: 'email_verification',
        used: false,
      },
      { used: true }
    )
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)
    const otp = new OTP({
      email,
      code: otpCode,
      type: 'email_verification',
      expiresAt,
    })
    await otp.save()
    emailService.sendOTPEmail(email, otpCode, 'email_verification')
    req.session.emailChangeData = {
      userId,
      newEmail: email,
    }
    req.session.showOtpModal = true
    req.session.otpModalType = 'email_verification'
    req.session.otpModalTitle = 'Verify Email Change'
    req.session.otpModalMessage =
      'Please enter the OTP code sent to your new email address.'
    req.session.otpModalAction = '/account/verify-email-change'
    res.redirect('/account/profile')
    return
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      name,
      dob: dob || null,
      address: address || '',
    },
    { new: true }
  )
  req.session.authUser = updatedUser
  res.redirect('/account/profile')
})

router.get('/verify-email-change', function (req, res) {
  res.render('vwAccount/verify-email-change')
})

router.post('/verify-email-change', async function (req, res) {
  const { code } = req.body
  const { userId, newEmail } = req.session.emailChangeData
  const otp = await OTP.findOne({
    email: newEmail,
    code,
    type: 'email_verification',
    used: false,
    expiresAt: { $gt: new Date() },
  })
  await OTP.findByIdAndUpdate(otp._id, { used: true })
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { email: newEmail },
    { new: true }
  )
  req.session.authUser = updatedUser
  delete req.session.emailChangeData
  res.redirect('/account/profile')
})

router.post('/change-password', async function (req, res) {
  const { oldPassword, password } = req.body
  const userId = req.session.authUser._id
  const user = await User.findById(userId)

  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.error('Current password is incorrect.')
  }

  await User.findByIdAndUpdate(
    userId,
    { password: bcrypt.hashSync(password, 10) },
    { new: true }
  )
  req.session.err_messages = ['Password changed successfully.']
  res.redirect('/account/change-password')
})

router.post('/request-seller', async function (req, res) {
  const user = req.session.authUser
  if (user.sellerExpiresAt && new Date() < new Date(user.sellerExpiresAt)) {
    return res.error('You already have an active seller permission.')
  }
  const sellerRequest = new SellerRequest({ userId: req.session.authUser._id })
  await sellerRequest.save()
  res.redirect('/account/profile')
})

router.get('/bids', async function (req, res) {
  const userId = req.session.authUser._id
  const tab = req.query.tab || 'all'

  let filter = { bidderId: userId }

  if (tab === 'active') {
    const activeProductIds = await Product.find({ status: 'active' }).distinct(
      '_id'
    )
    filter.productId = { $in: activeProductIds }
  } else if (tab === 'won') {
    const endedProducts = await Product.find({
      status: 'ended',
      currentWinnerId: userId,
    }).distinct('_id')
    filter.productId = { $in: endedProducts }
  }

  const result = await AutoBid.paginate(req, filter, { createdAt: -1 })

  res.render('vwAccount/bids', {
    items: await Promise.all(
      result.items.map(async (autoBid) => {
        const product = await Product.findById(autoBid.productId).populate(
          'categoryId'
        )
        if (!product) return null
        await product.populate('bids.bidderId')
        const bidsResult = processBids(product, {
          query: { page: 1, limit: 1 },
        })
        const userBids = (product.bids || []).filter(
          (bid) => bid.bidderId?.toString() === userId.toString()
        )
        const latestBid = userBids.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0]
        return {
          bidAmount: latestBid?.bidAmount || product.currentPrice,
          createdAt: latestBid?.createdAt || autoBid.createdAt,
          productId: {
            ...product.toObject(),
            currentPrice: product.currentPrice,
            bidCount: bidsResult.pagination.total,
            topBidder: bidsResult.topBidder?.bidderId || null,
          },
        }
      })
    ).then((items) => items.filter((item) => item !== null)),
    pagination: result.pagination,
    activeTab: tab,
  })
})

router.get('/won', async function (req, res) {
  const endedProducts = await Product.find({ status: 'ended' })
    .populate('categoryId')
    .select('_id categoryId')

  const userId = req.session.authUser._id.toString()
  const wonProducts = []
  const seenProducts = new Set()

  for (const product of endedProducts) {
    if (!product.bids || product.bids.length === 0) continue

    const sortedBids = [...product.bids].sort((a, b) => {
      if (b.bidAmount !== a.bidAmount) return b.bidAmount - a.bidAmount
      return new Date(a.createdAt) - new Date(b.createdAt)
    })

    const topBid = sortedBids[0]
    if (
      topBid &&
      topBid.bidderId?.toString() === userId &&
      !seenProducts.has(product._id.toString())
    ) {
      seenProducts.add(product._id.toString())
      wonProducts.push({
        productId: product,
        bidAmount: topBid.bidAmount,
        createdAt: topBid.createdAt,
      })
    }
  }

  wonProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const total = wonProducts.length
  const skip = (page - 1) * limit
  const paginatedWonProducts = wonProducts.slice(skip, skip + limit)

  res.render('vwAccount/won', {
    items: await Promise.all(
      paginatedWonProducts.map(async (item) => {
        const product = item.productId
        await product.populate('bids.bidderId')
        const bidsResult = processBids(product, {
          query: { page: 1, limit: 1 },
        })
        return {
          bidAmount: item.bidAmount,
          createdAt: item.createdAt,
          productId: {
            ...product.toObject(),
            currentPrice: product.currentPrice,
            bidCount: bidsResult.pagination.total,
            topBidder: bidsResult.topBidder?.bidderId || null,
          },
        }
      })
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

router.post('/rate/:productId', async function (req, res) {
  const { rating, comment } = req.body
  const product = await Product.findById(req.params.productId)
  const ratingValue = parseInt(rating)
  const existing = await Rating.findOne({
    productId: req.params.productId,
    fromUserId: req.session.authUser._id,
    toUserId: product.sellerId,
  })
  if (existing) {
    existing.rating = ratingValue
    existing.comment = comment || ''
    await existing.save()
  } else {
    const newRating = new Rating({
      productId: req.params.productId,
      fromUserId: req.session.authUser._id,
      toUserId: product.sellerId,
      rating: ratingValue,
      comment: comment || '',
      type: 'bidder_to_seller',
    })
    await newRating.save()
  }
  res.redirect('/account/won')
})

export default router
