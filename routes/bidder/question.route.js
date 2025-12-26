import express from 'express'
import Product from '../../models/Product.js'
import ProductQuestion from '../../models/ProductQuestion.js'
import * as emailService from '../../utils/email.js'

const router = express.Router()

router.post('/:productId', async function (req, res) {
  const { question } = req.body
  const product = await Product.findById(req.params.productId)
  const newQuestion = new ProductQuestion({
    productId: req.params.productId,
    askerId: req.session.authUser._id,
    question,
  })
  await newQuestion.save()
  emailService.sendQuestionPostedEmail(
    product,
    newQuestion,
    req.session.authUser
  )
  res.redirect(`/products/${req.params.productId}`)
})

export default router
