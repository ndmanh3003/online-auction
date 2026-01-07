import express from 'express'
import AutoBid from '../../models/AutoBid.js'
import Product from '../../models/Product.js'
import Rating from '../../models/Rating.js'
import Transaction from '../../models/Transaction.js'

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
            { path: 'sellerId' },
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
        const isCurrentWinner =
          product.currentWinnerId &&
          product.currentWinnerId._id.toString() === userId.toString()
        const productObj = product.toObject()
        if (
          productObj.currentWinnerId &&
          typeof productObj.currentWinnerId === 'object'
        ) {
          if (productObj.currentWinnerId._id) {
            productObj.currentWinnerId = {
              _id: productObj.currentWinnerId._id,
              name: productObj.currentWinnerId.name || 'Unknown',
            }
          }
        }
        const item = {
          bidAmount: latestBid?.bidAmount || product.currentPrice,
          createdAt: latestBid?.createdAt || autoBid.createdAt,
          productId: productObj,
          isCurrentWinner,
        }
        if (tab === 'won' && product.status === 'ended' && product.sellerId) {
          item.existingRating = await Rating.findOne({
            productId: product._id,
            fromUserId: userId,
            toUserId: product.sellerId._id,
          })
          item.transaction = await Transaction.findOne({
            productId: product._id,
          })
        }
        return item
      })
    ).then((items) => items.filter((item) => item !== null)),
    pagination: result.pagination,
    activeTab: tab,
  })
})

export default router
