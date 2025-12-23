import express from 'express'
import * as bidService from '../../services/bid.service.js'
import * as productService from '../../services/product.service.js'
import * as emailService from '../../utils/email.js'

const router = express.Router()

router.get('/:productId', async function (req, res) {
  const product = await productService.findById(req.params.productId, false)
  const topBid = await bidService.getTopBidder(product._id)
  const minBidAmount = product.currentPrice + product.stepPrice
  res.render('vwBidder/bid', {
    product,
    topBid,
    minBidAmount,
  })
})

router.post('/:productId', async function (req, res) {
  const { bidAmount, maxBidAmount } = req.body
  const result = await bidService.placeBid(
    req.params.productId,
    req.session.authUser._id,
    parseFloat(bidAmount),
    maxBidAmount ? parseFloat(maxBidAmount) : null
  )
  const updatedProduct = await productService.findById(
    req.params.productId,
    false
  )
  const topBid = await bidService.getTopBidder(req.params.productId)
  await emailService.sendBidPlacedEmail(
    updatedProduct,
    result.bid,
    topBid,
    req.session.authUser
  )
  res.redirect(`/products/${req.params.productId}`)
})

export default router
