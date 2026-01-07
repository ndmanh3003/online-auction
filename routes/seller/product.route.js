import express from 'express'
import { canCreateProduct } from '../../middlewares/auth.mdw.js'
import { uploadProductImages } from '../../middlewares/upload.mdw.js'
import Product from '../../models/Product.js'
import Rating from '../../models/Rating.js'
import Transaction from '../../models/Transaction.js'
import User from '../../models/User.js'
import * as bidService from '../../services/bid.service.js'
import * as emailService from '../../utils/email.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const status = req.query.status || 'active'
  const tab = req.query.tab

  let filter = {
    sellerId: req.session.authUser._id,
  }

  if (tab === 'sold') {
    filter.status = 'ended'
    filter.currentWinnerId = { $exists: true, $ne: null }
  } else {
    filter.status = status
  }

  const sortOptions = status === 'active' ? { createdAt: -1 } : { endTime: -1 }

  const result = await Product.paginate(req, filter, sortOptions)

  if (status === 'ended' || tab === 'sold') {
    const items = await Promise.all(
      result.items.map(async (product) => {
        const productObj = product.toObject()
        if (product.currentWinnerId) {
          productObj.winner = {
            _id: product.currentWinnerId._id,
            name: product.currentWinnerId.name,
            email: product.currentWinnerId.email,
          }
          productObj.existingRating = await Rating.findOne({
            productId: product._id,
            fromUserId: req.session.authUser._id,
            toUserId: product.currentWinnerId._id,
          })
          productObj.transaction = await Transaction.findOne({
            productId: product._id,
          })
        }
        return productObj
      })
    )
    res.render('vwSeller/products/ended', {
      ...result,
      items,
    })
  } else {
    res.render('vwSeller/products/index', result)
  }
})

router.get('/create', canCreateProduct, function (req, res) {
  res.render('vwSeller/products/create')
})

router.get('/:id/edit', async function (req, res) {
  const product = await Product.findById(req.params.id)
  
  if (!product) {
    return res.render('404')
  }
  
  // Check if user is the seller
  const sellerIdStr = product.sellerId._id ? product.sellerId._id.toString() : product.sellerId.toString()
  if (sellerIdStr !== req.session.authUser._id.toString()) {
    return res.render('403')
  }
  
  // Check if there are no bids
  if (product.bids && product.bids.length > 0) {
    req.session.error_messages = ['Cannot edit product with existing bids']
    return res.redirect(`/products/${req.params.id}`)
  }
  
  const productObj = product.toObject()
  // Convert categoryId to string if it's an ObjectId
  if (productObj.categoryId && productObj.categoryId._id) {
    productObj.categoryId = productObj.categoryId._id.toString()
  } else if (productObj.categoryId) {
    productObj.categoryId = productObj.categoryId.toString()
  }
  
  res.render('vwSeller/products/edit', { product: productObj })
})

router.post('/:id/edit', async function (req, res) {
  const product = await Product.findById(req.params.id)
  
  if (!product) {
    return res.render('404')
  }
  
  // Check if user is the seller
  const sellerIdStr = product.sellerId._id ? product.sellerId._id.toString() : product.sellerId.toString()
  if (sellerIdStr !== req.session.authUser._id.toString()) {
    return res.render('403')
  }
  
  // Check if there are no bids
  if (product.bids && product.bids.length > 0) {
    req.session.error_messages = ['Cannot edit product with existing bids']
    return res.redirect(`/products/${req.params.id}`)
  }
  
  const startPriceNum = Math.round(parseFloat(req.body.startPrice))
  
  product.name = req.body.name
  product.categoryId = req.body.categoryId
  product.images = JSON.parse(req.body.images)
  product.startPrice = startPriceNum
  product.stepPrice = Math.round(parseFloat(req.body.stepPrice))
  product.buyNowPrice = req.body.buyNowPrice
    ? Math.round(parseFloat(req.body.buyNowPrice))
    : null
  product.endTime = new Date(req.body.endTime)
  product.description = req.body.description
  product.autoExtend = !!req.body.autoExtend
  product.allowNonRatedBidders = !!req.body.allowNonRatedBidders
  
  await product.save()
  
  req.session.success_messages = ['Product updated successfully']
  res.redirect(`/products/${req.params.id}`)
})

router.post(
  '/upload-image',
  canCreateProduct,
  uploadProductImages.single('image'),
  async function (req, res) {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }
    const imageUrl = '/static/uploads/products/' + req.file.filename
    res.json({ url: imageUrl })
  }
)

router.post('/create', canCreateProduct, async function (req, res) {
  const startPriceNum = Math.round(parseFloat(req.body.startPrice))
  await new Product({
    ...req.body,
    images: JSON.parse(req.body.images),
    sellerId: req.session.authUser._id,
    startPrice: startPriceNum,
    currentPrice: 0,
    stepPrice: Math.round(parseFloat(req.body.stepPrice)),
    buyNowPrice: req.body.buyNowPrice
      ? Math.round(parseFloat(req.body.buyNowPrice))
      : null,
    endTime: new Date(req.body.endTime),
    autoExtend: !!req.body.autoExtend,
    allowNonRatedBidders: !!req.body.allowNonRatedBidders,
  }).save()
  res.redirect('/seller/products')
})

router.post('/:id/append', async function (req, res) {
  const product = await Product.findById(req.params.id).populate(
    'currentWinnerId'
  )
  product.appendedDescriptions.push({
    content: req.body.description,
    timestamp: new Date(),
  })
  await product.save()

  if (product.currentWinnerId && product.currentWinnerId.email) {
    emailService.sendDescriptionUpdatedEmail(product, product.currentWinnerId)
  }

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
