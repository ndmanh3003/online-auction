import bcrypt from 'bcryptjs'
import express from 'express'
import * as bidService from '../services/bid.service.js'
import * as otpService from '../services/otp.service.js'
import * as productService from '../services/product.service.js'
import * as ratingService from '../services/rating.service.js'
import * as sellerRequestService from '../services/seller-request.service.js'
import * as userService from '../services/user.service.js'
import * as emailService from '../utils/email.js'
import { generateOTP } from '../utils/otp.js'

const router = express.Router()

router.get('/profile', async function (req, res) {
  const sellerRequest = await sellerRequestService.findByUserId(
    req.session.authUser._id
  )

  res.render('vwAccount/profile', {
    sellerRequest,
  })
})

router.get('/edit', function (req, res) {
  res.render('vwAccount/edit')
})

router.post('/edit', async function (req, res) {
  const { name, email, dob, address } = req.body
  const userId = req.session.authUser._id
  const user = await userService.findById(userId)
  if (email !== user.email) {
    const otpCode = generateOTP()
    await otpService.invalidateOTPsByEmail(email, 'email_verification')
    await otpService.createOTP(email, otpCode, 'email_verification')
    await emailService.sendOTPEmail(email, otpCode, 'email_verification')
    req.session.emailChangeData = {
      userId,
      newEmail: email,
    }
    res.redirect('/account/verify-email-change')
    return
  }
  await userService.update(userId, {
    name,
    dob: dob || null,
    address: address || '',
  })
  const updatedUser = await userService.findById(userId)
  req.session.authUser = updatedUser
  res.redirect('/account/profile')
})

router.get('/verify-email-change', function (req, res) {
  res.render('vwAccount/verify-email-change')
})

router.post('/verify-email-change', async function (req, res) {
  const { code } = req.body
  const { userId, newEmail } = req.session.emailChangeData
  const otp = await otpService.findValidOTP(
    newEmail,
    code,
    'email_verification'
  )
  await otpService.markOTPAsUsed(otp._id)
  await userService.update(userId, { email: newEmail })
  const updatedUser = await userService.findById(userId)
  req.session.authUser = updatedUser
  delete req.session.emailChangeData
  res.redirect('/account/profile')
})

router.get('/change-password', function (req, res) {
  res.render('vwAccount/change-password')
})

router.post('/change-password', async function (req, res) {
  const { oldPassword, password } = req.body
  const userId = req.session.authUser._id
  const user = await userService.findById(userId)
  const hashedPassword = bcrypt.hashSync(password, 10)
  await userService.updatePassword(userId, hashedPassword)
  req.session.err_messages = ['Password changed successfully.']
  res.redirect('/account/change-password')
})

router.post('/request-seller', async function (req, res) {
  await sellerRequestService.create(req.session.authUser._id)
  res.redirect('/account/profile')
})

router.get('/bids', async function (req, res) {
  const page = parseInt(req.query.page) || 1
  const result = await bidService.findActiveBidsByUser(
    req.session.authUser._id,
    page,
    10
  )

  res.render('vwAccount/bids', {
    ...result,
  })
})

router.get('/won', async function (req, res) {
  const page = parseInt(req.query.page) || 1
  const result = await bidService.findWonByUser(
    req.session.authUser._id,
    page,
    10
  )

  res.render('vwAccount/won', {
    ...result,
  })
})

router.get('/ratings', async function (req, res) {
  const page = parseInt(req.query.page) || 1
  const result = await ratingService.findByUserId(
    req.session.authUser._id,
    page,
    10
  )
  const stats = await ratingService.calculateUserRating(
    req.session.authUser._id
  )

  res.render('vwAccount/ratings', {
    ...result,
    stats,
  })
})

router.post('/rate/:productId', async function (req, res) {
  const { rating, comment } = req.body
  const product = await productService.findById(req.params.productId)
  const ratingValue = parseInt(rating)
  await ratingService.createOrUpdate(
    req.params.productId,
    req.session.authUser._id,
    product.sellerId,
    ratingValue,
    comment || '',
    'bidder_to_seller'
  )
  res.redirect('/account/won')
})

export default router
