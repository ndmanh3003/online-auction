import express from 'express'
import * as sellerRequestService from '../../services/seller-request.service.js'
import * as userService from '../../services/user.service.js'

const router = express.Router()

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1
  const status = req.query.status || null
  const result = await sellerRequestService.findAll(page, 10, status)

  res.render('vwAdmin/seller-requests/index', {
    ...result,
    selectedStatus: status,
  })
})

router.post('/:id/approve', async function (req, res) {
  const request = await sellerRequestService.findById(req.params.id)
  const userId = request.userId._id ? request.userId._id : request.userId
  await sellerRequestService.updateStatus(
    req.params.id,
    'approved',
    req.session.authUser._id
  )
  await userService.updateRole(userId, 'seller')
  res.redirect('/admin/seller-requests')
})

router.post('/:id/deny', async function (req, res) {
  await sellerRequestService.updateStatus(
    req.params.id,
    'denied',
    req.session.authUser._id
  )
  res.redirect('/admin/seller-requests')
})

export default router
