import express from 'express'
import { isAuth } from '../../middlewares/auth.mdw.js'
import Product from '../../models/Product.js'
import Rating from '../../models/Rating.js'
import Transaction from '../../models/Transaction.js'
import { processBids } from '../../utils/bids.js'

const router = express.Router()

router.use(isAuth)

router.get('/:productId', async function (req, res) {
  const productInstance = await Product.findById(req.params.productId)
  if (!productInstance) {
    return res.render('404')
  }
  await productInstance.populate('bids.bidderId')
  const bidsResult = processBids(productInstance, {
    query: { page: 1, limit: 1 },
  })
  const topBid = bidsResult.topBidder
  const userId = req.session.authUser._id.toString()
  const sellerId = productInstance.sellerId._id.toString()
  const winnerId = topBid.bidderId._id.toString()
  let transaction = await Transaction.findOne({
    productId: productInstance._id,
  })
  if (!transaction) {
    transaction = new Transaction({
      productId: productInstance._id,
      sellerId: productInstance.sellerId._id,
      winnerId: topBid.bidderId._id,
    })
    await transaction.save()
  }
  const isSeller = userId === sellerId
  const isWinner = userId === winnerId

  const product = {
    ...productInstance.toObject(),
    currentPrice: productInstance.currentPrice,
    bidCount: bidsResult.pagination.total,
    topBidder: bidsResult.topBidder?.bidderId || null,
  }

  res.render('vwCheckout/index', {
    product,
    transaction,
    topBid,
    isSeller,
    isWinner,
    existingRating: await Rating.findOne({
      productId: req.params.productId,
      fromUserId: userId,
      toUserId: isSeller ? winnerId : sellerId,
    }),
  })
})

router.post('/:productId/payment', async function (req, res) {
  const { paymentProof, shippingAddress } = req.body
  const transaction = await Transaction.findOne({
    productId: req.params.productId,
  })
  await Transaction.findByIdAndUpdate(
    transaction._id,
    {
      paymentProof,
      'shippingInfo.address': shippingAddress,
      status: 'payment_confirmed',
    },
    { new: true }
  )
  res.redirect(`/checkout/${req.params.productId}`)
})

router.post('/:productId/confirm-payment', async function (req, res) {
  const { trackingNumber, carrier } = req.body
  const transaction = await Transaction.findOne({
    productId: req.params.productId,
  })
  await Transaction.findByIdAndUpdate(
    transaction._id,
    {
      'shippingInfo.trackingNumber': trackingNumber,
      'shippingInfo.carrier': carrier,
      status: 'shipped',
    },
    { new: true }
  )
  res.redirect(`/checkout/${req.params.productId}`)
})

router.post('/:productId/confirm-delivery', async function (req, res) {
  const transaction = await Transaction.findOne({
    productId: req.params.productId,
  })
  await Transaction.findByIdAndUpdate(
    transaction._id,
    {
      deliveryConfirmedAt: new Date(),
      status: 'delivered',
    },
    { new: true }
  )
  res.redirect(`/checkout/${req.params.productId}`)
})

router.post('/:productId/rate', async function (req, res) {
  const { rating, comment } = req.body
  const transaction = await Transaction.findOne({
    productId: req.params.productId,
  })
  const userId = req.session.authUser._id.toString()
  const isSeller = transaction.sellerId.toString() === userId
  const ratingValue = parseInt(rating)
  if (isSeller) {
    const existing = await Rating.findOne({
      productId: req.params.productId,
      fromUserId: userId,
      toUserId: transaction.winnerId,
    })
    if (existing) {
      existing.rating = ratingValue
      existing.comment = comment || ''
      await existing.save()
    } else {
      await new Rating({
        productId: req.params.productId,
        fromUserId: userId,
        toUserId: transaction.winnerId,
        rating: ratingValue,
        comment: comment || '',
        type: 'seller_to_bidder',
      }).save()
    }
    await Transaction.findByIdAndUpdate(
      transaction._id,
      { 'ratings.sellerRated': true },
      { new: true }
    )
  } else {
    const existing = await Rating.findOne({
      productId: req.params.productId,
      fromUserId: userId,
      toUserId: transaction.sellerId,
    })
    if (existing) {
      existing.rating = ratingValue
      existing.comment = comment || ''
      await existing.save()
    } else {
      await new Rating({
        productId: req.params.productId,
        fromUserId: userId,
        toUserId: transaction.sellerId,
        rating: ratingValue,
        comment: comment || '',
        type: 'bidder_to_seller',
      }).save()
    }
    await Transaction.findByIdAndUpdate(
      transaction._id,
      { 'ratings.bidderRated': true },
      { new: true }
    )
  }
  res.redirect(`/checkout/${req.params.productId}`)
})

router.post('/:productId/chat', async function (req, res) {
  const { message } = req.body
  const transaction = await Transaction.findOne({
    productId: req.params.productId,
  })
  await Transaction.findByIdAndUpdate(
    transaction._id,
    {
      $push: {
        chat: {
          senderId: req.session.authUser._id,
          message,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  )
  res.redirect(`/checkout/${req.params.productId}`)
})

router.post('/:productId/cancel', async function (req, res) {
  const transaction = await Transaction.findOne({
    productId: req.params.productId,
  })
  await Transaction.findByIdAndUpdate(
    transaction._id,
    { status: 'cancelled' },
    { new: true }
  )
  const existing = await Rating.findOne({
    productId: req.params.productId,
    fromUserId: transaction.sellerId,
    toUserId: transaction.winnerId,
  })
  if (existing) {
    existing.rating = -1
    existing.comment = 'Buyer did not complete payment'
    await existing.save()
  } else {
    await new Rating({
      productId: req.params.productId,
      fromUserId: transaction.sellerId,
      toUserId: transaction.winnerId,
      rating: -1,
      comment: 'Buyer did not complete payment',
      type: 'seller_to_bidder',
    }).save()
  }
  res.redirect('/seller/products/ended')
})

export default router
