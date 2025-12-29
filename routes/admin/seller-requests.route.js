import express from 'express'
import AuctionConfig from '../../models/AuctionConfig.js'
import SellerRequest from '../../models/SellerRequest.js'
import User from '../../models/User.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const result = await SellerRequest.paginate(
    req,
    req.query.status ? { status: req.query.status } : {}
  )

  res.render('vwAdmin/seller-requests/index', result)
})

router.post('/:id/approve', async function (req, res) {
  const request = await SellerRequest.findById(req.params.id)
  const userId = request.userId._id ? request.userId._id : request.userId
  let config = await AuctionConfig.findOne()
  if (!config) {
    config = await AuctionConfig.create({
      autoExtendThresholdMinutes: 5,
      autoExtendDurationMinutes: 10,
      sellerDurationDays: 7,
      newProductHighlightMinutes: 30,
      minRatingPercentForBid: 80,
    })
  }
  const now = new Date()

  await SellerRequest.findByIdAndUpdate(
    req.params.id,
    {
      status: 'approved',
      reviewedAt: now,
      reviewedBy: req.session.authUser._id,
      approvedAt: now,
    },
    { new: true }
  )
  await User.findByIdAndUpdate(
    userId,
    {
      sellerActivatedAt: now,
      sellerExpiresAt: new Date(
        now.getTime() + config.sellerDurationDays * 24 * 60 * 60 * 1000
      ),
    },
    { new: true }
  )
  res.redirect('/admin/seller-requests')
})

router.post('/:id/deny', async function (req, res) {
  await SellerRequest.findByIdAndUpdate(
    req.params.id,
    {
      status: 'denied',
      reviewedAt: new Date(),
      reviewedBy: req.session.authUser._id,
    },
    { new: true }
  )
  res.redirect('/admin/seller-requests')
})

export default router
