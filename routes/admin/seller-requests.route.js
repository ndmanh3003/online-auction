import express from 'express';
import * as sellerRequestService from '../../services/seller-request.service.js';
import * as userService from '../../services/user.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const result = await sellerRequestService.findAllPending(page, 10);

  res.render('vwAdmin/seller-requests/index', {
    ...result,
  });
});

router.post('/:id/approve', async function (req, res) {
  const requestId = req.params.id;
  const request = await sellerRequestService.findById(requestId);

  if (!request || request.status !== 'pending') {
    return res.error('Request not found or already processed.');
  }

  const userId = request.userId._id ? request.userId._id : request.userId;
  await sellerRequestService.updateStatus(requestId, 'approved', req.session.authUser._id);
  await userService.updateRole(userId, 'seller');

  res.redirect('/admin/seller-requests');
});

router.post('/:id/deny', async function (req, res) {
  const requestId = req.params.id;
  const request = await sellerRequestService.findById(requestId);

  if (!request || request.status !== 'pending') {
    return res.error('Request not found or already processed.');
  }

  await sellerRequestService.updateStatus(requestId, 'denied', req.session.authUser._id);

  res.redirect('/admin/seller-requests');
});

export default router;
