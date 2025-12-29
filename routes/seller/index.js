import express from 'express'
import { isAuth } from '../../middlewares/auth.mdw.js'
import productRouter from './product.route.js'
import questionRouter from './question.route.js'

const router = express.Router()

router.use(isAuth)

router.use('/products', productRouter)
router.use('/question', questionRouter)

export default router

