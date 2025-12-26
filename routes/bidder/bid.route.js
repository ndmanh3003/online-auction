import express from 'express'
import Product from '../../models/Product.js'
import User from '../../models/User.js'
import * as bidService from '../../services/bid.service.js'
import { processBids } from '../../utils/bids.js'
import * as emailService from '../../utils/email.js'

const router = express.Router()

router.post('/:productId', async function (req, res) {
  const { maxBidAmount } = req.body

  if (!maxBidAmount || parseFloat(maxBidAmount) <= 0) {
    return res.error('Maximum bid amount is required')
  }

  const productInstance = await Product.findById(req.params.productId)
  if (!productInstance) {
    return res.error('Product not found')
  }

  const previousWinnerId = productInstance.currentWinnerId?.toString()
  const previousPrice = productInstance.currentPrice

  try {
    const result = await bidService.placeBid(
      req.params.productId,
      req.session.authUser._id,
      parseFloat(maxBidAmount)
    )

    if (result.message === 'Max bid updated') {
      req.session.success_messages = [
        'Maximum bid amount updated successfully.',
      ]
      return res.redirect(`/products/${req.params.productId}`)
    }

    const updatedProductInstance = await Product.findById(req.params.productId)
    await updatedProductInstance.populate('bids.bidderId')
    const bidsResult = processBids(updatedProductInstance, {
      query: { page: 1, limit: 1 },
    })
    const topBid = bidsResult.topBidder

    const updatedProduct = {
      ...updatedProductInstance.toObject(),
      currentPrice: updatedProductInstance.currentPrice,
      bidCount: bidsResult.pagination.total,
      topBidder: updatedProductInstance.currentWinnerId || null,
    }

    if (topBid) {
      emailService.sendBidPlacedEmail(
        updatedProduct,
        topBid,
        topBid,
        req.session.authUser
      )
    }

    const currentWinnerId = updatedProductInstance.currentWinnerId?.toString()
    if (
      previousWinnerId &&
      currentWinnerId !== previousWinnerId &&
      previousWinnerId !== req.session.authUser._id.toString()
    ) {
      const previousWinner = await User.findById(previousWinnerId)
      emailService.sendOutbidEmail(
        updatedProduct,
        previousWinner,
        updatedProductInstance.currentPrice
      )
    }

    req.session.success_messages = ['Bid placed successfully.']
    res.redirect(`/products/${req.params.productId}`)
  } catch (error) {
    return res.error(error.message)
  }
})

export default router
