import express from 'express'
import { isAdmin, isAuth } from '../middlewares/auth.mdw.js'
import accountRouter from './account/index.js'
import adminRouter from './admin/index.js'
import authRouter from './auth/index.js'
import bidderBidRouter from './bidder/bid.route.js'
import bidderQuestionRouter from './bidder/question.route.js'
import bidderWatchlistRouter from './bidder/watchlist.route.js'
import bidsRouter from './bids/index.js'
import checkoutRouter from './checkout/index.js'
import homeRouter from './home.route.js'
import productRouter from './product/index.js'
import sellerRouter from './seller/index.js'

const router = express.Router()

router.use('/', homeRouter)
router.use('/products', productRouter)
router.use('/auth', authRouter)
router.use('/account', isAuth, accountRouter)
router.use('/bids', isAuth, bidsRouter)
router.use('/bidder/watchlist', isAuth, bidderWatchlistRouter)
router.use('/bidder/bid', isAuth, bidderBidRouter)
router.use('/bidder/question', isAuth, bidderQuestionRouter)
router.use('/seller', sellerRouter)
router.use('/checkout', isAuth, checkoutRouter)
router.use('/admin', isAuth, isAdmin, adminRouter)

export default router
