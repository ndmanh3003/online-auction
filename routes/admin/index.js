import express from 'express';
import sellerRequestsRouter from './seller-requests.route.js';
import categoriesRouter from './categories.route.js';
import usersRouter from './users.route.js';
import productsRouter from './products.route.js';

const router = express.Router();

router.get('/', function (req, res) {
  res.redirect('/admin/seller-requests');
});

router.use('/seller-requests', sellerRequestsRouter);
router.use('/categories', categoriesRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);

export default router;
