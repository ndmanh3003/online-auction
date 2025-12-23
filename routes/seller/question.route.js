import express from 'express';
import * as questionService from '../../services/question.service.js';
import * as productService from '../../services/product.service.js';
import * as bidService from '../../services/bid.service.js';
import * as emailService from '../../utils/email.js';
import { isSeller } from '../../middlewares/auth.mdw.js';

const router = express.Router();

router.use(isSeller);

router.post('/:questionId/answer', async function (req, res) {
  const { answer } = req.body;
  const question = await questionService.findById(req.params.questionId);

  if (!question) {
    return res.error('Question not found.');
  }

  const product = await productService.findById(question.productId._id);

  if (product.sellerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  await questionService.answer(req.params.questionId, answer.trim());

  const bids = await bidService.findByProductId(product._id);
  await emailService.sendQuestionAnsweredEmail(product, question, bids);

  res.redirect(`/products/${product._id}`);
});

export default router;

