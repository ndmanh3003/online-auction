import express from 'express'
import AuctionConfig from '../../models/AuctionConfig.js'
import AutoBid from '../../models/AutoBid.js'
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

  let previousWinnerIdValue = product.currentWinnerId
  if (
    previousWinnerIdValue &&
    typeof previousWinnerIdValue === 'object' &&
    previousWinnerIdValue._id
  ) {
    previousWinnerIdValue = previousWinnerIdValue._id
  }
  const previousWinnerId = previousWinnerIdValue?.toString()

  let currentWinnerIdForCheck = product.currentWinnerId
  if (
    currentWinnerIdForCheck &&
    typeof currentWinnerIdForCheck === 'object' &&
    currentWinnerIdForCheck._id
  ) {
    currentWinnerIdForCheck = currentWinnerIdForCheck._id
  }

  const isCurrentWinner =
    currentWinnerIdForCheck &&
    currentWinnerIdForCheck.toString() === bidderId.toString()

  try {
    let result
    if (isCurrentWinner) {
      await AutoBid.findOneAndUpdate(
        { productId, bidderId },
        { $set: { maxBidAmount: parseFloat(maxBidAmount) } },
        { upsert: true, setDefaultsOnInsert: true }
      )
      result = {
        success: true,
        message: 'Max bid updated',
        currentPrice: product.currentPrice,
        currentWinnerId: currentWinnerIdForCheck,
        endTime: product.endTime,
      }
    } else {
      result = await bidService.placeBid(
        productId,
        bidderId,
        parseFloat(maxBidAmount)
      )
    }

    if (result.message === 'Max bid updated') {
      req.session.success_messages = [
        'Maximum bid amount updated successfully.',
      ]
      return res.redirect(`/products/${productId}`)
    }

    const updatedProduct = await Product.findById(productId)
    const latestBid = updatedProduct.bids.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0]

    if (latestBid && latestBid.bidderId) {
      emailService.sendBidPlacedEmail(
        updatedProduct,
        latestBid,
        latestBid,
        req.session.authUser
      )
    }

    let currentWinnerIdValue = updatedProduct.currentWinnerId
    if (
      currentWinnerIdValue &&
      typeof currentWinnerIdValue === 'object' &&
      currentWinnerIdValue._id
    ) {
      currentWinnerIdValue = currentWinnerIdValue._id
    }
    const currentWinnerId = currentWinnerIdValue?.toString()

    if (
      previousWinnerId &&
      currentWinnerId !== previousWinnerId &&
      previousWinnerId !== req.session.authUser._id.toString()
    ) {
      const previousWinner = await User.findById(previousWinnerId)
      if (previousWinner) {
      emailService.sendOutbidEmail(
        updatedProduct,
        previousWinner,
        updatedProduct.currentPrice
      )
      }
    }

    // Check if current user is the top bidder
    const isTopBidder = currentWinnerId === req.session.authUser._id.toString()
    const successMsg = isTopBidder 
      ? 'Bid placed successfully.' 
      : 'Bid placed successfully. You are not the top bidder.'
    
    req.session.success_messages = [successMsg]
    res.redirect(`/products/${productId}`)
  } catch (error) {
    return res.error(error.message)
  }
})

export default router
