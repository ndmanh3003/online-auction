import express from 'express';
import * as transactionService from '../services/transaction.service.js';
import * as productService from '../services/product.service.js';
import * as bidService from '../services/bid.service.js';
import * as ratingService from '../services/rating.service.js';
import { isAuth } from '../middlewares/auth.mdw.js';

const router = express.Router();

router.use(isAuth);

router.get('/:productId', async function (req, res) {
  const product = await productService.findByIdWithDetails(req.params.productId);

  if (!product) {
    return res.status(404).render('404');
  }

  const topBid = await bidService.getTopBidder(product._id);
  if (!topBid) {
    return res.error('No bids found for this product.');
  }

  const userId = req.session.authUser._id.toString();
  const sellerId = product.sellerId._id.toString();
  const winnerId = topBid.bidderId._id.toString();

  if (userId !== sellerId && userId !== winnerId) {
    return res.render('403');
  }

  let transaction = await transactionService.findByProductId(product._id);

  if (!transaction) {
    transaction = await transactionService.create({
      productId: product._id,
      sellerId: product.sellerId._id,
      winnerId: topBid.bidderId._id,
    });
  }

  const isSeller = userId === sellerId;
  const isWinner = userId === winnerId;

  res.render('vwCheckout/index', {
    product,
    transaction,
    topBid,
    isSeller,
    isWinner,
  });
});

router.post('/:productId/payment', async function (req, res) {
  const { paymentProof, shippingAddress } = req.body;
  const transaction = await transactionService.findByProductId(req.params.productId);

  if (!transaction) {
    return res.error('Transaction not found.');
  }

  if (transaction.winnerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  await transactionService.submitPayment(transaction._id, paymentProof, shippingAddress);

  res.redirect(`/checkout/${req.params.productId}`);
});

router.post('/:productId/confirm-payment', async function (req, res) {
  const { trackingNumber, carrier } = req.body;
  const transaction = await transactionService.findByProductId(req.params.productId);

  if (!transaction) {
    return res.error('Transaction not found.');
  }

  if (transaction.sellerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  await transactionService.confirmPayment(transaction._id, trackingNumber, carrier);

  res.redirect(`/checkout/${req.params.productId}`);
});

router.post('/:productId/confirm-delivery', async function (req, res) {
  const transaction = await transactionService.findByProductId(req.params.productId);

  if (!transaction) {
    return res.error('Transaction not found.');
  }

  if (transaction.winnerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  await transactionService.confirmDelivery(transaction._id);

  res.redirect(`/checkout/${req.params.productId}`);
});

router.post('/:productId/rate', async function (req, res) {
  const { rating, comment } = req.body;
  const transaction = await transactionService.findByProductId(req.params.productId);
  const product = await productService.findById(req.params.productId);

  if (!transaction) {
    return res.error('Transaction not found.');
  }

  const userId = req.session.authUser._id.toString();
  const isSeller = transaction.sellerId.toString() === userId;
  const isWinner = transaction.winnerId.toString() === userId;

  if (!isSeller && !isWinner) {
    return res.render('403');
  }

  const ratingValue = parseInt(rating);
  if (ratingValue !== 1 && ratingValue !== -1) {
    return res.error('Invalid rating value.');
  }

  if (isSeller) {
    await ratingService.createOrUpdate(
      req.params.productId,
      userId,
      transaction.winnerId,
      ratingValue,
      comment || '',
      'seller_to_bidder'
    );
    await transactionService.updateRatingStatus(transaction._id, true);
  } else {
    await ratingService.createOrUpdate(
      req.params.productId,
      userId,
      transaction.sellerId,
      ratingValue,
      comment || '',
      'bidder_to_seller'
    );
    await transactionService.updateRatingStatus(transaction._id, false);
  }

  res.redirect(`/checkout/${req.params.productId}`);
});

router.post('/:productId/chat', async function (req, res) {
  const { message } = req.body;
  const transaction = await transactionService.findByProductId(req.params.productId);

  if (!transaction) {
    return res.error('Transaction not found.');
  }

  await transactionService.addChatMessage(transaction._id, req.session.authUser._id, message);

  res.redirect(`/checkout/${req.params.productId}`);
});

router.post('/:productId/cancel', async function (req, res) {
  const transaction = await transactionService.findByProductId(req.params.productId);

  if (!transaction) {
    return res.error('Transaction not found.');
  }

  if (transaction.sellerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  await transactionService.cancel(transaction._id);
  await ratingService.createOrUpdate(
    req.params.productId,
    transaction.sellerId,
    transaction.winnerId,
    -1,
    'Buyer did not complete payment',
    'seller_to_bidder'
  );

  res.redirect('/seller/products/ended');
});

export default router;

