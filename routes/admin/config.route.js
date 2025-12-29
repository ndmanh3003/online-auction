import express from 'express'
import AuctionConfig from '../../models/AuctionConfig.js'

const router = express.Router()

router.get('/', async function (req, res) {
  res.render('vwAdmin/config/index', {
    config: (await AuctionConfig.findOne()) || (await AuctionConfig.create({})),
  })
})

router.put('/', async function (req, res) {
  await AuctionConfig.findOneAndUpdate({}, req.body, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  })
  res.redirect('/admin/config')
})

export default router
