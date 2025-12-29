import express from 'express'
import AutoBid from '../../models/AutoBid.js'
import Product from '../../models/Product.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const userId = req.session.authUser._id
  const tab = req.query.tab || 'all'

  let filter = { bidderId: userId }

  if (tab === 'active') {
    const activeProductIds = await Product.find({ status: 'active' }).distinct(
      '_id'
    )
    filter.productId = { $in: activeProductIds }
  } else if (tab === 'won') {
    const endedProducts = await Product.find({
      status: 'ended',
      currentWinnerId: userId,
    }).distinct('_id')
    filter.productId = { $in: endedProducts }
  }

  const result = await AutoBid.paginate(req, filter, { createdAt: -1 })

  res.render('vwBids/bids', {
    items: await Promise.all(
      result.items.map(async (autoBid) => {
        await autoBid.populate({
          path: 'productId',
          populate: [
            { path: 'categoryId' },
            { path: 'currentWinnerId' },
            { path: 'bids.bidderId' },
          ],
        })
        const product = autoBid.productId
        if (!product) return null
        const userBids = (product.bids || []).filter(
          (bid) => bid.bidderId?.toString() === userId.toString()
        )
        const latestBid = userBids.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0]
        return {
          bidAmount: latestBid?.bidAmount || product.currentPrice,
          createdAt: latestBid?.createdAt || autoBid.createdAt,
          productId: product.toObject(),
        }
      })
    ).then((items) => items.filter((item) => item !== null)),
    pagination: result.pagination,
    activeTab: tab,
  })
})

export default router
