import express from 'express'
import { canCreateProduct } from '../../middlewares/auth.mdw.js'
import Product from '../../models/Product.js'
import Rating from '../../models/Rating.js'
import User from '../../models/User.js'
import * as bidService from '../../services/bid.service.js'
import * as emailService from '../../utils/email.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const status = req.query.status || 'active'
  res.render(
    'vwSeller/products/index',
    await Product.paginate(
      req,
      {
        sellerId: req.session.authUser._id,
        status,
      },
      status === 'active' ? { createdAt: -1 } : { endTime: -1 }
    )
  )
})

router.get('/create', canCreateProduct, function (req, res) {
  res.render('vwSeller/products/create')
})

router.post('/create', canCreateProduct, async function (req, res) {
  const startPriceNum = parseFloat(req.body.startPrice)
  await new Product({
    ...req.body,
    images: Array.isArray(req.body.images)
      ? req.body.images
      : req.body.images.split(',').map((img) => img.trim()),
    sellerId: req.session.authUser._id,
    startPrice: startPriceNum,
    currentPrice: startPriceNum,
    stepPrice: parseFloat(req.body.stepPrice),
    buyNowPrice: req.body.buyNowPrice ? parseFloat(req.body.buyNowPrice) : null,
    endTime: new Date(req.body.endTime),
    autoExtend: !!req.body.autoExtend,
    allowNonRatedBidders: !!req.body.allowNonRatedBidders,
  }).save()
  res.redirect('/seller/products')
})

router.post('/:id/append', async function (req, res) {
  const product = await Product.findById(req.params.id)
  product.appendedDescriptions.push({
    content: req.body.description,
    timestamp: new Date(),
  })
  await product.save()
  res.redirect(`/products/${req.params.id}`)
})

router.post('/:productId/block/:bidderId', async function (req, res) {
  await Product.findByIdAndUpdate(
    req.params.productId,
    { $addToSet: { blockedBidders: req.params.bidderId } },
    { new: true }
  )
  await bidService.autoCalculate(req.params.productId)
  emailService.sendBidderBlockedEmail(
    await Product.findById(req.params.productId),
    await User.findById(req.params.bidderId)
  )
  req.session.success_messages = ['Bidder blocked successfully.']
  res.redirect(`/products/${req.params.productId}`)
})

router.post('/rate/:productId/:bidderId', async function (req, res) {
  await Rating.findOneAndUpdate(
    {
      productId: req.params.productId,
      fromUserId: req.session.authUser._id,
      toUserId: req.params.bidderId,
    },
    {
      rating: parseInt(req.body.rating),
      comment: req.body.comment || '',
      type: 'seller_to_bidder',
    },
    { upsert: true, new: true }
  )
  res.redirect('/seller/products?status=ended')
})

router.post('/cancel/:productId/:bidderId', async function (req, res) {
  await Rating.findOneAndUpdate(
    {
      productId: req.params.productId,
      fromUserId: req.session.authUser._id,
      toUserId: req.params.bidderId,
    },
    {
      rating: -1,
      comment: 'Buyer did not complete payment',
      type: 'seller_to_bidder',
    },
    { upsert: true, new: true }
  )
  res.redirect('/seller/products?status=ended')
})

export default router
