import express from 'express'
import categoriesRouter from './categories.route.js'
import configRouter from './config.route.js'
import productsRouter from './products.route.js'
import sellerRequestsRouter from './seller-requests.route.js'
import usersRouter from './users.route.js'

const router = express.Router()

router.get('/', function (req, res) {
  res.redirect('/admin/seller-requests')
})

router.use('/seller-requests', sellerRequestsRouter)
router.use('/categories', categoriesRouter)
router.use('/users', usersRouter)
router.use('/products', productsRouter)
router.use('/config', configRouter)

export default router
