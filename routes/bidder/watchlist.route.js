import express from 'express'
import Watchlist from '../../models/Watchlist.js'
import { processBids } from '../../utils/bids.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const result = await Watchlist.paginate(req, {
    userId: req.session.authUser._id,
  })

  res.render('vwBidder/watchlist', {
    items: await Promise.all(
      result.items.map(async (item) => {
        if (!item.productId) return item.toObject()
        const product = item.productId
        await product.populate('bids.bidderId')
        const bidsResult = processBids(product, { query: { page: 1, limit: 1 } })
        return {
          ...item.toObject(),
          productId: {
            ...product.toObject(),
            currentPrice: product.currentPrice,
            bidCount: bidsResult.pagination.total,
            topBidder: bidsResult.topBidder?.bidderId || null,
          },
        }
      })
    ),
    pagination: result.pagination,
  })
})

router.post('/:productId', async function (req, res) {
  const existing = await Watchlist.findOne({
    userId: req.session.authUser._id,
    productId: req.params.productId,
  })
  if (!existing) {
    const watchlist = new Watchlist({
      userId: req.session.authUser._id,
      productId: req.params.productId,
    })
    await watchlist.save()
  }
  res.redirect(`/products/${req.params.productId}`)
})

router.delete('/:productId', async function (req, res) {
  await Watchlist.findOneAndDelete({
    userId: req.session.authUser._id,
    productId: req.params.productId,
  })

  const referer = req.get('Referer')
  if (referer && referer.includes('/bidder/watchlist')) {
    return res.redirect('/bidder/watchlist')
  }

  res.redirect(`/products/${req.params.productId}`)
})

export default router
