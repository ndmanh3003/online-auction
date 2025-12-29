import express from 'express'
import Product from '../../models/Product.js'
import ProductQuestion from '../../models/ProductQuestion.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const searchQuery = { status: 'active' }
  if (req.query.q && req.query.q.trim() !== '')
    searchQuery.$text = { $search: req.query.q }
  if (req.query.categoryId) searchQuery.categoryId = req.query.categoryId

  let sortOptions = { createdAt: -1 }
  if (req.query.sortBy === 'endTime_asc') sortOptions = { endTime: 1 }
  else if (req.query.sortBy === 'currentPrice_asc')
    sortOptions = { currentPrice: 1 }

  const result = await Product.paginate(req, searchQuery, sortOptions)

  res.render('vwProducts/list', result)
})

router.get('/:id', async function (req, res) {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.render('404')
  }

  const blockedBidders = (product.blockedBidders || []).map((id) =>
    id.toString()
  )

  const enrichedBids = await Promise.all(
    product.bids.map(async (bid) => {
      const ratingStats = await bid.bidderId.getRatingStats()
      return {
        ...bid.toObject(),
        isBlocked: blockedBidders.includes(bid.bidderId._id.toString()),
        bidderId: {
          ...bid.bidderId.toObject(),
          ratingStats,
        },
      }
    })
  )

  const timeDiff = product.endTime - new Date()
  const threeDays = 3 * 24 * 60 * 60 * 1000

  res.render('vwProducts/detail', {
    product: {
      ...product.toObject(),
      questions: await ProductQuestion.find({
        productId: product._id,
      }).sort({ createdAt: -1 }),
      relatedProducts: await Product.find({
        categoryId: product.categoryId._id,
        _id: { $ne: product._id },
        status: 'active',
      })
        .sort({ createdAt: -1 })
        .limit(5),
    },
    bids: enrichedBids,
    isInWatchlist: req.session.isAuthenticated
      ? await product.isInWatchlist(req.session.authUser._id)
      : false,
    isSeller:
      req.session.isAuthenticated &&
      req.session.authUser._id.toString() === product.sellerId.toString(),
    minBidAmount: product.currentPrice + product.stepPrice,
    showRelativeTime: timeDiff < threeDays && timeDiff > 0,
    userBid: req.session.isAuthenticated
      ? await product.getUserBid(req.session.authUser._id)
      : null,
  })
})

export default router
