import express from 'express'
import Product from '../../models/Product.js'
import ProductQuestion from '../../models/ProductQuestion.js'
import Rating from '../../models/Rating.js'
import { processBids } from '../../utils/bids.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const query = req.query.q || ''
  const categoryId = req.query.categoryId || null
  const sortBy = req.query.sortBy || null

  const searchQuery = { status: 'active' }
  if (query && query.trim() !== '') searchQuery.$text = { $search: query }
  if (categoryId) searchQuery.categoryId = categoryId

  let sortOptions = { createdAt: -1 }
  if (sortBy === 'endTime_asc') sortOptions = { endTime: 1 }
  else if (sortBy === 'currentPrice_asc') sortOptions = { currentPrice: 1 }

  const result = await Product.paginate(req, searchQuery, sortOptions)

  res.render('vwProducts/list', {
    items: await Promise.all(
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
    ),
    pagination: result.pagination,
    query,
    categoryId,
    sortBy,
  })
})

router.get('/:id', async function (req, res) {
  const productInstance = await Product.findById(req.params.id)
  if (!productInstance) {
    return res.render('404')
  }

  await productInstance.populate('bids.bidderId')
  const bidsResult = processBids(productInstance, req)
  const questions = await ProductQuestion.find({
    productId: productInstance._id,
  }).sort({ createdAt: -1 })

  const enrichedBids = await Promise.all(
    bidsResult.items.map(async (bid) => {
      const positive = await Rating.countDocuments({
        toUserId: bid.bidderId._id,
        rating: 1,
      })
      const negative = await Rating.countDocuments({
        toUserId: bid.bidderId._id,
        rating: -1,
      })
      const total = positive + negative
      const percent = total > 0 ? (positive / total) * 100 : 0
      return {
        ...bid.toObject(),
        bidderId: {
          ...bid.bidderId.toObject(),
          ratingStats: { positive, negative, total, percent },
        },
      }
    })
  )

  const relatedResult = await Product.paginate(
    { query: { page: 1, limit: 5 } },
    {
      categoryId: productInstance.categoryId._id,
      _id: { $ne: productInstance._id },
      status: 'active',
    },
    { createdAt: -1 }
  )

  const relatedProducts = await Promise.all(
    relatedResult.items.map(async (item) => {
      await item.populate('bids.bidderId')
      const bidsResult = processBids(item, { query: { page: 1, limit: 1 } })
      return {
        ...item.toObject(),
        currentPrice: item.currentPrice ?? item.startPrice,
        bidCount: bidsResult.pagination.total,
        topBidder: bidsResult.topBidder?.bidderId || null,
      }
    })
  )

  const product = {
    ...productInstance.toObject(),
    currentPrice: productInstance.currentPrice,
    bidCount: bidsResult.pagination.total,
    topBidder: bidsResult.topBidder?.bidderId || null,
    questions,
    bids: enrichedBids,
    relatedProducts,
  }

  const sellerIdString = productInstance.sellerId.toString()
  const isSeller =
    req.session.isAuthenticated &&
    req.session.authUser._id.toString() === sellerIdString

  const now = new Date()
  const timeDiff = product.endTime - now
  const threeDays = 3 * 24 * 60 * 60 * 1000
  const userBid = req.session.isAuthenticated
    ? await productInstance.getUserBid(req.session.authUser._id)
    : null

  res.render('vwProducts/detail', {
    product,
    bids: enrichedBids,
    pagination: bidsResult.pagination,
    isInWatchlist: req.session.isAuthenticated
      ? await productInstance.isInWatchlist(req.session.authUser._id)
      : false,
    isSeller,
    minBidAmount: productInstance.currentPrice + product.stepPrice,
    showRelativeTime: timeDiff < threeDays && timeDiff > 0,
    userBid,
  })
})

export default router
