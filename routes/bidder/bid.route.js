import express from 'express';
import * as bidService from '../../services/bid.service.js';
import * as productService from '../../services/product.service.js';
import * as emailService from '../../utils/email.js';

const router = express.Router();

router.get('/:productId', async function (req, res) {
  const product = await productService.findById(req.params.productId, false);
  if (!product) {
    return res.status(404).render('404');
  }

  if (product.status !== 'active') {
    return res.error('This auction has ended.');
  }

  if (new Date() > product.endTime) {
    return res.error('This auction has ended.');
  }

  const topBid = await bidService.getTopBidder(product._id);
  const minBidAmount = product.currentPrice + product.stepPrice;

  res.render('vwBidder/bid', {
    product,
    topBid,
    minBidAmount,
  });
});

router.post('/:productId', async function (req, res) {
  const { bidAmount, maxBidAmount } = req.body;
  const product = await productService.findById(req.params.productId, false);

  if (!product) {
    return res.error('Product not found.');
  }

  if (product.status !== 'active') {
    return res.error('This auction has ended.');
  }

  if (product.sellerId._id.toString() === req.session.authUser._id.toString()) {
    return res.error('You cannot bid on your own product.');
  }

  const validation = await bidService.validateBidder(req.session.authUser._id, product);
  if (!validation.valid) {
    return res.error(validation.message);
  }

  try {
    const result = await bidService.placeBid(
      req.params.productId,
      req.session.authUser._id,
      parseFloat(bidAmount),
      maxBidAmount ? parseFloat(maxBidAmount) : null
    );

    if (!result.success) {
      return res.error(result.message);
    }

    const updatedProduct = await productService.findById(req.params.productId, false);
    const topBid = await bidService.getTopBidder(req.params.productId);

    await emailService.sendBidPlacedEmail(
      updatedProduct,
      result.bid,
      topBid,
      req.session.authUser
    );

    res.redirect(`/products/${req.params.productId}`);
  } catch (error) {
    return res.error(error.message);
  }
});

export default router;

