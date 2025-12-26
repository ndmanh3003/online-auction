import express from 'express'
import { isAdmin, isAuth } from '../middlewares/auth.mdw.js'
import accountRouter from './account/index.js'
import adminRouter from './admin/index.js'
import authRouter from './auth/index.js'
import bidderBidRouter from './bidder/bid.route.js'
import bidderQuestionRouter from './bidder/question.route.js'
import bidderWatchlistRouter from './bidder/watchlist.route.js'
import checkoutRouter from './checkout/index.js'
import homeRouter from './home.route.js'
import productRouter from './product/index.js'
import sellerProductRouter from './seller/product.route.js'
import sellerQuestionRouter from './seller/question.route.js'

const router = express.Router()

router.use('/', homeRouter)
router.use('/products', productRouter)
router.use('/auth', authRouter)
router.use('/account', isAuth, accountRouter)
router.use('/bidder/watchlist', isAuth, bidderWatchlistRouter)
router.use('/bidder/bid', isAuth, bidderBidRouter)
router.use('/bidder/question', isAuth, bidderQuestionRouter)
router.use('/seller/products', isAuth, sellerProductRouter)
router.use('/seller/question', isAuth, sellerQuestionRouter)
router.use('/checkout', isAuth, checkoutRouter)
router.use('/admin', isAuth, isAdmin, adminRouter)

export default router
