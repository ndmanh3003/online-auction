import express from 'express'
import Product from '../models/Product.js'
import { processBids } from '../utils/bids.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const now = new Date()
  const endingSoonResult = await Product.paginate(
    { query: { page: 1, limit: 5 } },
    {
      status: 'active',
      endTime: { $gt: now },
    },
    { endTime: 1 }
  )

  const allActiveResult = await Product.paginate(
    { query: { page: 1, limit: 100 } },
    { status: 'active' },
    { createdAt: -1 }
  )

  const endingSoon = await Promise.all(
    endingSoonResult.items.map(async (item) => {
      await item.populate('bids.bidderId')
      const bidsResult = processBids(item, { query: { page: 1, limit: 1 } })
      return {
        ...item.toObject(),
        currentPrice: item.currentPrice,
        bidCount: bidsResult.pagination.total,
        topBidder: bidsResult.topBidder?.bidderId || null,
      }
    })
  )

  const allActive = await Promise.all(
    allActiveResult.items.map(async (item) => {
      await item.populate('bids.bidderId')
      const bidsResult = processBids(item, { query: { page: 1, limit: 1 } })
      return {
        ...item.toObject(),
        currentPrice: item.currentPrice,
        bidCount: bidsResult.pagination.total,
        topBidder: bidsResult.topBidder?.bidderId || null,
      }
    })
  )

  const mostBids = allActive.sort((a, b) => b.bidCount - a.bidCount).slice(0, 5)
  const highestPrice = allActive
    .sort((a, b) => b.currentPrice - a.currentPrice)
    .slice(0, 5)

  res.render('home', {
    endingSoon,
    mostBids,
    highestPrice,
  })
})

export default router
