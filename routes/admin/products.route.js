import express from 'express'
import Product from '../../models/Product.js'
import ProductQuestion from '../../models/ProductQuestion.js'
import Rating from '../../models/Rating.js'
import { processBids } from '../../utils/bids.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const status = req.query.status || null
  const query = status ? { status } : {}
  const result = await Product.paginate(req, query)

  const items = await Promise.all(
    result.items.map(async (product) => {
      await product.populate('bids.bidderId')
      const bidsResult = processBids(product, { query: {} })
      const questions = await ProductQuestion.find({
        productId: product._id,
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

      return {
        ...product.toObject(),
        bidCount: bidsResult.pagination.total,
        topBidder: bidsResult.topBidder?.bidderId || null,
        questions,
        bids: enrichedBids,
      }
    })
  )

  res.render('vwAdmin/products/index', {
    items,
    pagination: result.pagination,
    selectedStatus: status,
  })
})

router.delete('/:id', async function (req, res) {
  await Product.findByIdAndDelete(req.params.id)
  res.redirect('/admin/products')
})

export default router
