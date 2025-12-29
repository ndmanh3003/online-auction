import express from 'express'
import Product from '../models/Product.js'

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

  const endingSoon = endingSoonResult.items.map((item) => ({
    ...item.toObject(),
    bidCount: item.bids.length,
  }))

  const allActive = allActiveResult.items.map((item) => ({
    ...item.toObject(),
    bidCount: item.bids.length,
  }))

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
