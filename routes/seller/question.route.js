import express from 'express'
import { isAuth } from '../../middlewares/auth.mdw.js'
import Product from '../../models/Product.js'
import ProductQuestion from '../../models/ProductQuestion.js'
import * as emailService from '../../utils/email.js'
import { processBids } from '../../utils/bids.js'

const router = express.Router()

router.use(isAuth)

router.post('/:questionId/answer', async function (req, res) {
  const { answer } = req.body
  const question = await ProductQuestion.findById(req.params.questionId)
  const product = await Product.findById(question.productId._id)
  await ProductQuestion.findByIdAndUpdate(
    req.params.questionId,
    {
      answer,
      answeredAt: new Date(),
    },
    { new: true }
  )
  await product.populate('bids.bidderId')
  const bidsResult = processBids(product, { query: {} })
  emailService.sendQuestionAnsweredEmail(product, question, bidsResult.items)
  res.redirect(`/products/${product._id}`)
})

export default router
