import express from 'express'
import AuctionConfig from '../../models/AuctionConfig.js'
import Product from '../../models/Product.js'
import User from '../../models/User.js'
import * as bidService from '../../services/bid.service.js'
import * as emailService from '../../utils/email.js'

const router = express.Router()

router.post('/:productId', async function (req, res) {
  const { maxBidAmount } = req.body
  const productId = req.params.productId
  const bidderId = req.session.authUser._id

  if (!maxBidAmount || parseFloat(maxBidAmount) <= 0) {
    return res.error('Maximum bid amount is required')
  }

  const product = await Product.findById(productId)
  if (!product) {
    return res.error('Product not found')
  }

  if (product.status !== 'active' || new Date() > product.endTime) {
    return res.error('Auction has ended')
  }

  if (product.sellerId.toString() === bidderId.toString()) {
    return res.error('Seller cannot bid on their own product')
  }

  if (
    product.blockedBidders?.some((x) => x.toString() === bidderId.toString())
  ) {
    return res.error('You are blocked from bidding on this product')
  }

  const config = await AuctionConfig.findOne()
  const bidder = await User.findById(bidderId)
  const rating = await bidder.getRatingStats()
  const minPercent = config.minRatingPercentForBid

  if (rating.total === 0 && !product.allowNonRatedBidders) {
    return res.error('This auction does not allow non-rated bidders')
  }

  if (rating.total > 0 && rating.percent < minPercent) {
    return res.error(`Minimum ${minPercent}% positive rating required`)
  }

  const minAllowedMax = bidService.computeMinAllowedMax(product)
  if (parseFloat(maxBidAmount) < minAllowedMax) {
    return res.error(`Maximum bid amount must be at least ${minAllowedMax}`)
  }

  const previousWinnerId = product.currentWinnerId?.toString()
  const previousPrice = product.currentPrice

  try {
    const result = await bidService.placeBid(
      productId,
      bidderId,
      parseFloat(maxBidAmount)
    )

    if (result.message === 'Max bid updated') {
      req.session.success_messages = [
        'Maximum bid amount updated successfully.',
      ]
      return res.redirect(`/products/${productId}`)
    }

    const updatedProduct = await Product.findById(productId)
    const latestBid = updatedProduct.bids
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

    if (latestBid && latestBid.bidderId) {
      emailService.sendBidPlacedEmail(
        updatedProduct,
        latestBid,
        latestBid,
        req.session.authUser
      )
    }

    const currentWinnerId = updatedProduct.currentWinnerId?.toString()
    if (
      previousWinnerId &&
      currentWinnerId !== previousWinnerId &&
      previousWinnerId !== req.session.authUser._id.toString()
    ) {
      const previousWinner = await User.findById(previousWinnerId)
      emailService.sendOutbidEmail(
        updatedProduct,
        previousWinner,
        updatedProduct.currentPrice
      )
    }

    req.session.success_messages = ['Bid placed successfully.']
    res.redirect(`/products/${productId}`)
  } catch (error) {
    return res.error(error.message)
  }
})

export default router
