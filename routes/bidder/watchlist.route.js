import express from 'express'
import * as watchlistService from '../../services/watchlist.service.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1
  const result = await watchlistService.findByUserId(
    req.session.authUser._id,
    page,
    10
  )

  res.render('vwBidder/watchlist', {
    ...result,
  })
})

router.post('/:productId', async function (req, res) {
  await watchlistService.add(req.session.authUser._id, req.params.productId)
  res.redirect(`/products/${req.params.productId}`)
})

router.delete('/:productId', async function (req, res) {
  await watchlistService.remove(req.session.authUser._id, req.params.productId)

  const referer = req.get('Referer')
  if (referer && referer.includes('/bidder/watchlist')) {
    return res.redirect('/bidder/watchlist')
  }

  res.redirect(`/products/${req.params.productId}`)
})

export default router
