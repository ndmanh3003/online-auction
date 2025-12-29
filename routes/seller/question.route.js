import express from 'express'
import ProductQuestion from '../../models/ProductQuestion.js'
import * as emailService from '../../utils/email.js'

const router = express.Router()

router.post('/:questionId/answer', async function (req, res) {
  const question = await ProductQuestion.findByIdAndUpdate(
    req.params.questionId,
    {
      answer: req.body.answer,
      answeredAt: new Date(),
    },
    { new: true }
  )
  emailService.sendQuestionAnsweredEmail(question)
  res.redirect(`/products/${question.productId._id}`)
})

export default router
