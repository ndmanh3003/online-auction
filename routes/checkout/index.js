import express from 'express'
import { isAuth } from '../../middlewares/auth.mdw.js'
import Product from '../../models/Product.js'
import Rating from '../../models/Rating.js'
import Transaction from '../../models/Transaction.js'

const router = express.Router()

router.use(isAuth)

router.get('/:productId', async function (req, res) {
  const product = await Product.findById(req.params.productId)
  if (!product) {
    return res.render('404')
  }
  const userId = req.session.authUser._id.toString()
  const sellerId = product.sellerId._id.toString()
  const winnerId = product.currentWinnerId?._id.toString()
  if (!winnerId) {
    return res.render('404')
  }
  let transaction = await Transaction.findOne({
    productId: product._id,
  })
  if (!transaction) {
    transaction = new Transaction({
      productId: product._id,
      sellerId: product.sellerId._id,
      winnerId: product.currentWinnerId._id,
    })
    await transaction.save()
  }
  const isSeller = userId === sellerId
  const isWinner = userId === winnerId

  const topBid = product.bids.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )[0]

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

router.post('/:productId/confirm-payment-and-ship', async function (req, res) {
  const { trackingNumber, carrier } = req.body
  const transaction = await Transaction.findOne({
    productId: req.params.productId,
  })
  await Transaction.findByIdAndUpdate(
    transaction._id,
    {
      paymentConfirmedAt: new Date(),
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
  const sellerId =
    transaction.sellerId._id?.toString() || transaction.sellerId.toString()
  const winnerId =
    transaction.winnerId._id?.toString() || transaction.winnerId.toString()
  const isSeller = sellerId === userId
  const ratingValue = parseInt(rating)
  if (isSeller) {
    const existing = await Rating.findOne({
      productId: req.params.productId,
      fromUserId: userId,
      toUserId: winnerId,
    })
    if (existing) {
      existing.rating = ratingValue
      existing.comment = comment || ''
      await existing.save()
    } else {
      await new Rating({
        productId: req.params.productId,
        fromUserId: userId,
        toUserId: winnerId,
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
      toUserId: sellerId,
    })
    if (existing) {
      existing.rating = ratingValue
      existing.comment = comment || ''
      await existing.save()
    } else {
      await new Rating({
        productId: req.params.productId,
        fromUserId: userId,
        toUserId: sellerId,
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
  const updatedTransaction = await Transaction.findById(transaction._id)
  if (
    updatedTransaction.ratings.sellerRated &&
    updatedTransaction.ratings.bidderRated &&
    updatedTransaction.status !== 'completed'
  ) {
    await Transaction.findByIdAndUpdate(
      transaction._id,
      { status: 'completed' },
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
  const userId = req.session.authUser._id.toString()
  const sellerId =
    transaction.sellerId._id?.toString() || transaction.sellerId.toString()
  if (userId !== sellerId) {
    return res.error('Only seller can cancel transaction')
  }
  await Transaction.findByIdAndUpdate(
    transaction._id,
    { status: 'cancelled' },
    { new: true }
  )
  const winnerId =
    transaction.winnerId._id?.toString() || transaction.winnerId.toString()
  const existing = await Rating.findOne({
    productId: req.params.productId,
    fromUserId: sellerId,
    toUserId: winnerId,
  })
  if (existing) {
    existing.rating = -1
    existing.comment = 'Buyer did not complete payment'
    await existing.save()
  } else {
    await new Rating({
      productId: req.params.productId,
      fromUserId: sellerId,
      toUserId: winnerId,
      rating: -1,
      comment: 'Buyer did not complete payment',
      type: 'seller_to_bidder',
    }).save()
  }
  res.redirect(`/checkout/${req.params.productId}`)
})

export default router
