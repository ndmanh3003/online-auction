import express from 'express';
import sellerRequestsRouter from './seller-requests.route.js';
import categoriesRouter from './categories.route.js';

const router = express.Router();

router.get('/', function (req, res) {
  res.redirect('/admin/seller-requests');
});

router.use('/seller-requests', sellerRequestsRouter);
router.use('/categories', categoriesRouter);

export default router;
