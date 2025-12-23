import express from 'express'
import { isSeller } from '../../middlewares/auth.mdw.js'
import * as bidService from '../../services/bid.service.js'
import * as productService from '../../services/product.service.js'
import * as ratingService from '../../services/rating.service.js'

const router = express.Router()

router.use(isSeller)

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1
  const result = await productService.findBySellerId(
    req.session.authUser._id,
    page,
    10
  )

  res.render('vwSeller/products/index', {
    ...result,
  })
})

router.get('/ended', async function (req, res) {
  const page = parseInt(req.query.page) || 1
  const result = await productService.findEndedBySellerId(
    req.session.authUser._id,
    page,
    10
  )

  const enrichedItems = await Promise.all(
    result.items.map(async (item) => {
      const topBid = await bidService.getTopBidder(item._id)
      let rated = false
      if (topBid) {
        const existingRating = await ratingService.findByProductAndUsers(
          item._id,
          req.session.authUser._id,
          topBid.bidderId._id
        )
        rated = !!existingRating
      }
      return {
        ...item.toObject(),
        winner: topBid ? topBid.bidderId : null,
        rated,
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

router.post('/create', async function (req, res) {
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
  await productService.create({
    name: name.trim(),
    images: imagesArray,
    categoryId,
    sellerId: req.session.authUser._id,
    startPrice: parseFloat(startPrice),
    stepPrice: parseFloat(stepPrice),
    buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
    description: description.trim(),
    endTime: endTimeDate,
    autoExtend: autoExtend === 'on',
    allowNonRatedBidders: allowNonRatedBidders === 'on',
  })
  res.redirect('/seller/products')
})

router.get('/:id/append', async function (req, res) {
  const product = await productService.findById(req.params.id)
  res.render('vwSeller/products/append-description', {
    product,
  })
})

router.post('/:id/append', async function (req, res) {
  const { description } = req.body
  await productService.appendDescription(req.params.id, description.trim())
  res.redirect(`/products/${req.params.id}`)
})

router.post('/:productId/block/:bidderId', async function (req, res) {
  await bidService.blockBidder(req.params.productId, req.params.bidderId)
  res.redirect(`/products/${req.params.productId}`)
})

router.post('/rate/:productId/:bidderId', async function (req, res) {
  const { rating, comment } = req.body
  const ratingValue = parseInt(rating)
  await ratingService.createOrUpdate(
    req.params.productId,
    req.session.authUser._id,
    req.params.bidderId,
    ratingValue,
    comment || '',
    'seller_to_bidder'
  )
  res.redirect('/seller/products/ended')
})

router.post('/cancel/:productId/:bidderId', async function (req, res) {
  await ratingService.createOrUpdate(
    req.params.productId,
    req.session.authUser._id,
    req.params.bidderId,
    -1,
    'Buyer did not complete payment',
    'seller_to_bidder'
  )
  res.redirect('/seller/products/ended')
})

export default router
