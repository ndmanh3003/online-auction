import express from 'express'
import Category from '../../models/Category.js'
import Product from '../../models/Product.js'
import ProductQuestion from '../../models/ProductQuestion.js'
import Rating from '../../models/Rating.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const searchQuery = { status: 'active' }
  const hasTextSearch = req.query.q && req.query.q.trim() !== ''

  if (hasTextSearch) {
    const searchTerm = req.query.q.trim()
    searchQuery.$text = { $search: searchTerm }
  }

  // Filter by category (including parent and children)
  if (req.query.categoryId) {
    const selectedCategory = await Category.findById(req.query.categoryId)
    if (selectedCategory) {
      if (selectedCategory.parentId) {
        // If it's a subcategory, only show products from this subcategory
        searchQuery.categoryId = req.query.categoryId
      } else {
        // If it's a parent category, show products from parent and all children
        const childCategories = await Category.find({
          parentId: selectedCategory._id,
        })
        const categoryIds = [
          selectedCategory._id,
          ...childCategories.map((c) => c._id),
        ]
        searchQuery.categoryId = { $in: categoryIds }
      }
    }
  }

  let sortOptions = { createdAt: -1 }

  // When using text search, prioritize relevance score
  if (hasTextSearch) {
    sortOptions = { score: { $meta: 'textScore' } }
  } else if (req.query.sortBy === 'endTime_asc') {
    sortOptions = { endTime: 1 }
  } else if (req.query.sortBy === 'currentPrice_asc') {
    sortOptions = { currentPrice: 1 }
  } else if (req.query.sortBy === 'createdAt_desc') {
    sortOptions = { createdAt: -1 }
  }

  const result = await Product.paginate(req, searchQuery, sortOptions)

  res.render('vwProducts/list', result)
})

router.get('/users/:userId/ratings', async function (req, res) {
  try {
    const ratingsResult = await Rating.paginate(
      req,
      {
        toUserId: req.params.userId,
      },
      { createdAt: -1 }
    )
    res.json(ratingsResult)
  } catch (error) {
    console.error('Error fetching ratings:', error)
    res.status(500).json({ error: 'Failed to fetch ratings' })
  }
})

router.get('/:id', async function (req, res) {
  const product = await Product.findById(req.params.id).populate(
    'currentWinnerId'
  )
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
  const isEnded = product.status === 'ended' || product.endTime <= new Date()

  const sellerRatingStats = await product.sellerId.getRatingStats()

  let topBidderRatingStats = null
  if (product.currentWinnerId) {
    topBidderRatingStats = await product.currentWinnerId.getRatingStats()
  }

  // Find related products - include products from same parent category if applicable
  let relatedProductsQuery = {
    _id: { $ne: product._id },
    status: 'active',
  }

  // Check if product's category has a parent
  if (product.categoryId.parentId) {
    // If it's a subcategory, find products from same parent and its children
    const siblingCategories = await Category.find({
      parentId: product.categoryId.parentId._id,
    })
    const categoryIds = [
      product.categoryId.parentId._id,
      ...siblingCategories.map((c) => c._id),
    ]
    relatedProductsQuery.categoryId = { $in: categoryIds }
  } else {
    // If it's a parent category, find products from this parent and all its children
    const childCategories = await Category.find({
      parentId: product.categoryId._id,
    })
    const categoryIds = [
      product.categoryId._id,
      ...childCategories.map((c) => c._id),
    ]
    relatedProductsQuery.categoryId = { $in: categoryIds }
  }

  res.render('vwProducts/detail', {
    product: {
      ...product.toObject(),
      questions: await ProductQuestion.find({
        productId: product._id,
      }).sort({ createdAt: -1 }),
      relatedProducts: await Product.find(relatedProductsQuery)
        .sort({ createdAt: -1 })
        .limit(5),
    },
    bids: enrichedBids,
    isInWatchlist: req.session.isAuthenticated
      ? await product.isInWatchlist(req.session.authUser._id)
      : false,
    isSeller:
      req.session.isAuthenticated &&
      req.session.authUser._id.toString() === product.sellerId._id.toString(),
    minBidAmount:
      !product.currentPrice || product.currentPrice === 0
        ? product.startPrice
        : product.currentPrice + product.stepPrice,
    showRelativeTime: timeDiff < threeDays && timeDiff > 0,
    isEnded,
    userBid: req.session.isAuthenticated
      ? await product.getUserBid(req.session.authUser._id)
      : null,
    sellerRatingStats,
    topBidderRatingStats,
  })
})

export default router
