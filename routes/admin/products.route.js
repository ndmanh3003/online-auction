import express from 'express';
import * as productService from '../../services/product.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const status = req.query.status || null;
  const result = await productService.findAllAdmin(page, 10, status);

  res.render('vwAdmin/products/index', {
    ...result,
    selectedStatus: status,
  });
});

router.delete('/:id', async function (req, res) {
  const product = await productService.findById(req.params.id);

  if (!product) {
    return res.error('Product not found.');
  }

  await productService.remove(req.params.id);

  res.redirect('/admin/products');
});

export default router;

