import express from 'express';
import * as productService from '../services/product.service.js';
import * as bidService from '../services/bid.service.js';
import * as questionService from '../services/question.service.js';
import * as watchlistService from '../services/watchlist.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const categoryId = req.query.categoryId || null;

  let result;
  if (categoryId) {
    result = await productService.findByCategory(categoryId, page, 10);
  } else {
    result = await productService.findAll(page, 10);
  }

  const enrichedItems = await Promise.all(
    result.items.map(async (item) => {
      const bidCount = await bidService.countByProductId(item._id);
      const topBid = await bidService.getTopBidder(item._id);
      return {
        ...item.toObject(),
        bidCount,
        topBidder: topBid ? topBid.bidderId : null,
      };
    })
  );

  res.render('vwProducts/list', {
    items: enrichedItems,
    pagination: result.pagination,
    categoryId,
  });
});

router.get('/:id', async function (req, res) {
  const product = await productService.findByIdWithDetails(req.params.id);
  if (!product) {
    return res.status(404).render('404');
  }

  const bidCount = await bidService.countByProductId(product._id);
  const topBid = await bidService.getTopBidder(product._id);
  const questions = await questionService.findByProductId(product._id);
  const relatedProducts = await productService.getRelatedProducts(
    product.categoryId._id,
    product._id,
    5
  );

  let isInWatchlist = false;
  if (req.session.isAuthenticated) {
    isInWatchlist = await watchlistService.isInWatchlist(req.session.authUser._id, product._id);
  }

  const now = new Date();
  const timeDiff = product.endTime - now;
  const threeDays = 3 * 24 * 60 * 60 * 1000;

  res.render('vwProducts/detail', {
    product,
    bidCount,
    topBidder: topBid ? topBid.bidderId : null,
    questions,
    relatedProducts,
    isInWatchlist,
    showRelativeTime: timeDiff < threeDays && timeDiff > 0,
  });
});

router.get('/:id/bids', async function (req, res) {
  const product = await productService.findById(req.params.id);
  if (!product) {
    return res.status(404).render('404');
  }

  const bids = await bidService.findByProductId(req.params.id);

  const maskedBids = bids.map((bid) => {
    const name = bid.bidderId.name;
    const maskedName = '****' + name.slice(-3);
    return {
      ...bid.toObject(),
      bidderId: { ...bid.bidderId.toObject(), name: maskedName },
    };
  });

  res.render('vwProducts/bid-history', {
    product,
    bids: maskedBids,
  });
});

export default router;

