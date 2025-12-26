import express from 'express'
import { canCreateProduct, isAuth } from '../../middlewares/auth.mdw.js'
import Product from '../../models/Product.js'
import Rating from '../../models/Rating.js'
import Transaction from '../../models/Transaction.js'
import User from '../../models/User.js'
import * as bidService from '../../services/bid.service.js'
import * as emailService from '../../utils/email.js'
import { processBids } from '../../utils/bids.js'

const router = express.Router()

router.use(isAuth)

router.get('/', async function (req, res) {
  const result = await Product.paginate(
    req,
    {
      sellerId: req.session.authUser._id,
      status: 'active',
    },
    { createdAt: -1 }
  )

  const items = await Promise.all(
    result.items.map(async (item) => {
      await item.populate('bids.bidderId')
      const bidsResult = processBids(item, { query: { page: 1, limit: 1 } })
      return {
        ...item.toObject(),
        currentPrice: item.currentPrice,
        bidCount: bidsResult.pagination.total,
        topBidder: bidsResult.topBidder?.bidderId || null,
      }
    })
  )

  res.render('vwSeller/products/index', {
    items,
    pagination: result.pagination,
  })
})

router.get('/ended', async function (req, res) {
  const result = await Product.paginate(
    req,
    {
      sellerId: req.session.authUser._id,
      status: 'ended',
    },
    { endTime: -1 }
  )

  const enrichedItems = await Promise.all(
    result.items.map(async (item) => {
      await item.populate('bids.bidderId')
      const bidsResult = processBids(item, { query: { page: 1, limit: 1 } })
      const topBid = bidsResult.topBidder
      let existingRating = null
      let transaction = null
      if (topBid) {
        existingRating = await Rating.findOne({
          productId: item._id,
          fromUserId: req.session.authUser._id,
          toUserId: topBid.bidderId._id,
        })
        transaction = await Transaction.findOne({ productId: item._id })
      }
      return {
        ...item.toObject(),
        currentPrice: item.currentPrice,
        bidCount: bidsResult.pagination.total,
        topBidder: bidsResult.topBidder?.bidderId || null,
        winner: topBid ? topBid.bidderId : null,
        existingRating: existingRating ? existingRating.toObject() : null,
        transaction: transaction ? transaction.toObject() : null,
      }
    })
  )

  res.render('vwSeller/products/ended', {
    items: enrichedItems,
    pagination: result.pagination,
  })
})

router.get('/create', function (req, res) {
  res.render('vwSeller/products/create')
})

router.post('/create', canCreateProduct, async function (req, res) {
  const {
    name,
    images,
    categoryId,
    startPrice,
    stepPrice,
    buyNowPrice,
    description,
    endTime,
    autoExtend,
    allowNonRatedBidders,
  } = req.body
  const imagesArray = Array.isArray(images)
    ? images
    : images.split(',').map((img) => img.trim())
  const endTimeDate = new Date(endTime)
  const startPriceNum = parseFloat(startPrice)
  const product = new Product({
    name,
    images: imagesArray,
    categoryId,
    sellerId: req.session.authUser._id,
    startPrice: startPriceNum,
    currentPrice: startPriceNum,
    stepPrice: parseFloat(stepPrice),
    buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
    description,
    endTime: endTimeDate,
    autoExtend: autoExtend === 'on',
    allowNonRatedBidders: allowNonRatedBidders === 'on',
  })
  await product.save()
  res.redirect('/seller/products')
})

router.post('/:id/append', async function (req, res) {
  const { description } = req.body
  const product = await Product.findById(req.params.id)
  product.appendedDescriptions.push({
    content: description,
    timestamp: new Date(),
  })
  await product.save()
  res.redirect(`/products/${req.params.id}`)
})

router.post('/:productId/block/:bidderId', async function (req, res) {
  const product = await Product.findById(req.params.productId)
  if (!product) {
    return res.error('Product not found')
  }

  const wasTopBidder =
    product.currentWinnerId?.toString() === req.params.bidderId

  await Product.findByIdAndUpdate(
    req.params.productId,
    { $addToSet: { blockedBidders: req.params.bidderId } },
    { new: true }
  )

  if (wasTopBidder) {
    await bidService.recomputeWinnerAfterBlock(req.params.productId)
  }

  const updatedProduct = await Product.findById(req.params.productId)
  const bidder = await User.findById(req.params.bidderId)
  emailService.sendBidderBlockedEmail(updatedProduct, bidder)
  req.session.success_messages = ['Bidder blocked successfully.']
  res.redirect(`/products/${req.params.productId}`)
})

router.post('/rate/:productId/:bidderId', async function (req, res) {
  const { rating, comment } = req.body
  const ratingValue = parseInt(rating)
  const existing = await Rating.findOne({
    productId: req.params.productId,
    fromUserId: req.session.authUser._id,
    toUserId: req.params.bidderId,
  })
  if (existing) {
    existing.rating = ratingValue
    existing.comment = comment || ''
    await existing.save()
  } else {
    const newRating = new Rating({
      productId: req.params.productId,
      fromUserId: req.session.authUser._id,
      toUserId: req.params.bidderId,
      rating: ratingValue,
      comment: comment || '',
      type: 'seller_to_bidder',
    })
    await newRating.save()
  }
  res.redirect('/seller/products/ended')
})

router.post('/cancel/:productId/:bidderId', async function (req, res) {
  const existing = await Rating.findOne({
    productId: req.params.productId,
    fromUserId: req.session.authUser._id,
    toUserId: req.params.bidderId,
  })
  if (existing) {
    existing.rating = -1
    existing.comment = 'Buyer did not complete payment'
    await existing.save()
  } else {
    const newRating = new Rating({
      productId: req.params.productId,
      fromUserId: req.session.authUser._id,
      toUserId: req.params.bidderId,
      rating: -1,
      comment: 'Buyer did not complete payment',
      type: 'seller_to_bidder',
    })
    await newRating.save()
  }
  res.redirect('/seller/products/ended')
})

export default router
