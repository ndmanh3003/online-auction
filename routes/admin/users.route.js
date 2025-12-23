import express from 'express';
import * as userService from '../../services/user.service.js';
import * as productService from '../../services/product.service.js';
import * as bidService from '../../services/bid.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const result = await userService.findAll(page, 10);

  res.render('vwAdmin/users/index', {
    ...result,
  });
});

router.get('/:id', async function (req, res) {
  const user = await userService.findById(req.params.id);
  if (!user) {
    return res.status(404).render('404');
  }

  res.render('vwAdmin/users/detail', {
    user,
  });
});

router.get('/:id/edit', async function (req, res) {
  const user = await userService.findById(req.params.id);
  if (!user) {
    return res.status(404).render('404');
  }

  res.render('vwAdmin/users/edit', {
    user,
  });
});

router.put('/:id', async function (req, res) {
  const { name, email, role } = req.body;
  const user = await userService.findById(req.params.id);

  if (!user) {
    return res.status(404).render('404');
  }

  await userService.update(req.params.id, {
    name: name.trim(),
    email: email.trim(),
    role,
  });

  res.redirect('/admin/users');
});

router.delete('/:id', async function (req, res) {
  const user = await userService.findById(req.params.id);

  if (!user) {
    return res.error('User not found.');
  }

  const productCount = await productService.countBySellerId(req.params.id);
  if (productCount > 0) {
    return res.error('Cannot delete user with active products.');
  }

  const bidCount = await bidService.countByBidderId(req.params.id);
  if (bidCount > 0) {
    return res.error('Cannot delete user with active bids.');
  }

  await userService.remove(req.params.id);

  res.redirect('/admin/users');
});

export default router;

