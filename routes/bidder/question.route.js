import express from 'express';
import * as questionService from '../../services/question.service.js';
import * as productService from '../../services/product.service.js';
import * as emailService from '../../utils/email.js';

const router = express.Router();

router.post('/:productId', async function (req, res) {
  const { question } = req.body;
  const product = await productService.findById(req.params.productId, false);

  if (!product) {
    return res.error('Product not found.');
  }

  const newQuestion = await questionService.create({
    productId: req.params.productId,
    askerId: req.session.authUser._id,
    question,
  });

  await emailService.sendQuestionPostedEmail(product, newQuestion, req.session.authUser);

  res.redirect(`/products/${req.params.productId}`);
});

export default router;

