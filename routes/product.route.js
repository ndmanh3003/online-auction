import express from 'express';
import * as productService from '../services/product.service.js';
import * as bidService from '../services/bid.service.js';
import * as watchlistService from '../services/watchlist.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const categoryId = req.query.categoryId || null;

  let result;
  if (categoryId) {
    result = await productService.findByCategory(categoryId, page, 6);
  } else {
    result = await productService.findAll(page, 6);
  }

  res.render('vwProducts/list', {
    ...result,
    categoryId,
  });
});

router.get('/:id', async function (req, res) {
  const product = await productService.findById(req.params.id);
  if (!product) {
    return res.status(404).render('404');
  }

  let isInWatchlist = false;
  if (req.session.isAuthenticated) {
    isInWatchlist = await watchlistService.isInWatchlist(req.session.authUser._id, product._id);
  }

  const now = new Date();
  const timeDiff = product.endTime - now;
  const threeDays = 3 * 24 * 60 * 60 * 1000;

  res.render('vwProducts/detail', {
    product,
    isInWatchlist,
    showRelativeTime: timeDiff < threeDays && timeDiff > 0,
  });
});

router.get('/:id/bids', async function (req, res) {
  const product = await productService.findById(req.params.id, false);
  if (!product) {
    return res.status(404).render('404');
  }

  const bids = await bidService.findByProductId(req.params.id);

  const sellerId = product.sellerId._id ? product.sellerId._id.toString() : product.sellerId.toString();
  const isSeller = req.session.isAuthenticated && req.session.authUser._id.toString() === sellerId;

  const maskedBids = bids.map((bid) => {
    const name = bid.bidderId.name;
    const maskedName = isSeller ? name : '****' + name.slice(-3);
    return {
      ...bid.toObject(),
      bidderId: { ...bid.bidderId.toObject(), name: maskedName },
    };
  });

  res.render('vwProducts/bid-history', {
    product,
    bids: maskedBids,
    isSeller,
  });
});

export default router;

