import express from 'express';
import * as productService from '../../services/product.service.js';
import * as categoryService from '../../services/category.service.js';
import * as bidService from '../../services/bid.service.js';
import * as ratingService from '../../services/rating.service.js';
import { isSeller } from '../../middlewares/auth.mdw.js';

const router = express.Router();

router.use(isSeller);

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const result = await productService.findBySellerId(req.session.authUser._id, page, 10);

  res.render('vwSeller/products/index', {
    ...result,
  });
});

router.get('/ended', async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const result = await productService.findEndedBySellerId(req.session.authUser._id, page, 10);

  const enrichedItems = await Promise.all(
    result.items.map(async (item) => {
      const topBid = await bidService.getTopBidder(item._id);
      return {
        ...item.toObject(),
        winner: topBid ? topBid.bidderId : null,
      };
    })
  );

  res.render('vwSeller/products/ended', {
    items: enrichedItems,
    pagination: result.pagination,
  });
});

router.get('/create', async function (req, res) {
  const categories = await categoryService.findAllWithSubcategories();

  res.render('vwSeller/products/create', {
    categories,
  });
});

router.post('/create', async function (req, res) {
  const { name, images, categoryId, startPrice, stepPrice, buyNowPrice, description, duration, autoExtend, allowNonRatedBidders } = req.body;

  const imagesArray = Array.isArray(images) ? images : images.split(',').map(img => img.trim());

  if (imagesArray.length < 3) {
    return res.error('At least 3 images are required.');
  }

  await productService.create({
    name: name.trim(),
    images: imagesArray,
    categoryId,
    sellerId: req.session.authUser._id,
    startPrice: parseFloat(startPrice),
    stepPrice: parseFloat(stepPrice),
    buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
    description: description.trim(),
    duration: parseInt(duration),
    autoExtend: autoExtend === 'on',
    allowNonRatedBidders: allowNonRatedBidders === 'on',
  });

  res.redirect('/seller/products');
});

router.get('/:id/append', async function (req, res) {
  const product = await productService.findById(req.params.id);

  if (!product) {
    return res.status(404).render('404');
  }

  if (product.sellerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  res.render('vwSeller/products/append-description', {
    product,
  });
});

router.post('/:id/append', async function (req, res) {
  const { description } = req.body;
  const product = await productService.findById(req.params.id);

  if (!product) {
    return res.error('Product not found.');
  }

  if (product.sellerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  await productService.appendDescription(req.params.id, description.trim());

  res.redirect(`/products/${req.params.id}`);
});

router.post('/:productId/block/:bidderId', async function (req, res) {
  const product = await productService.findById(req.params.productId);

  if (!product) {
    return res.error('Product not found.');
  }

  if (product.sellerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  await bidService.blockBidder(req.params.productId, req.params.bidderId);

  res.redirect(`/products/${req.params.productId}`);
});

router.post('/rate/:productId/:bidderId', async function (req, res) {
  const { rating, comment } = req.body;
  const product = await productService.findById(req.params.productId);

  if (!product) {
    return res.error('Product not found.');
  }

  if (product.sellerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  const ratingValue = parseInt(rating);
  if (ratingValue !== 1 && ratingValue !== -1) {
    return res.error('Invalid rating value.');
  }

  await ratingService.createOrUpdate(
    req.params.productId,
    req.session.authUser._id,
    req.params.bidderId,
    ratingValue,
    comment || '',
    'seller_to_bidder'
  );

  res.redirect('/seller/products/ended');
});

router.post('/cancel/:productId/:bidderId', async function (req, res) {
  const product = await productService.findById(req.params.productId);

  if (!product) {
    return res.error('Product not found.');
  }

  if (product.sellerId.toString() !== req.session.authUser._id.toString()) {
    return res.render('403');
  }

  await ratingService.createOrUpdate(
    req.params.productId,
    req.session.authUser._id,
    req.params.bidderId,
    -1,
    'Buyer did not complete payment',
    'seller_to_bidder'
  );

  res.redirect('/seller/products/ended');
});

export default router;

