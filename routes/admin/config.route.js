import express from 'express'
import AuctionConfig from '../../models/AuctionConfig.js'

const router = express.Router()

router.get('/', async function (req, res) {
  let config = await AuctionConfig.findOne()
  if (!config) {
    config = await AuctionConfig.create({
      autoExtendThresholdMinutes: 5,
      autoExtendDurationMinutes: 10,
      sellerDurationDays: 7,
      newProductHighlightMinutes: 30,
      minRatingPercentForBid: 80,
    })
  }
  res.render('vwAdmin/config/index', { config })
})

router.put('/', async function (req, res) {
  const {
    autoExtendThresholdMinutes,
    autoExtendDurationMinutes,
    sellerDurationDays,
    newProductHighlightMinutes,
    minRatingPercentForBid,
  } = req.body
  let config = await AuctionConfig.findOne()
  if (!config) {
    config = new AuctionConfig({
      autoExtendThresholdMinutes: parseInt(autoExtendThresholdMinutes),
      autoExtendDurationMinutes: parseInt(autoExtendDurationMinutes),
      sellerDurationDays: parseInt(sellerDurationDays),
      newProductHighlightMinutes: parseInt(newProductHighlightMinutes),
      minRatingPercentForBid: parseInt(minRatingPercentForBid),
    })
  } else {
    Object.assign(config, {
      autoExtendThresholdMinutes: parseInt(autoExtendThresholdMinutes),
      autoExtendDurationMinutes: parseInt(autoExtendDurationMinutes),
      sellerDurationDays: parseInt(sellerDurationDays),
      newProductHighlightMinutes: parseInt(newProductHighlightMinutes),
      minRatingPercentForBid: parseInt(minRatingPercentForBid),
    })
  }
  await config.save()
  res.redirect('/admin/config')
})

export default router
