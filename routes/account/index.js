import bcrypt from 'bcryptjs'
import express from 'express'
import OTP from '../../models/OTP.js'
import Rating from '../../models/Rating.js'
import SellerRequest from '../../models/SellerRequest.js'
import User from '../../models/User.js'
import * as emailService from '../../utils/email.js'
import { generateOTP } from '../../utils/otp.js'

const router = express.Router()

router.get('/profile', async function (req, res) {
  const user = await User.findById(req.session.authUser._id)

  res.render('vwAccount/profile', {
    sellerRequest: await user.getSellerRequest(),
    ratingStats: await user.getRatingStats(),
    ratings: await Rating.paginate(req, {
      toUserId: req.session.authUser._id,
    }).items,
  })
})

router.post('/edit', async function (req, res) {
  const { name, dob, address } = req.body
  req.session.authUser = await User.findByIdAndUpdate(
    req.session.authUser._id,
    {
      name,
      dob: dob || null,
      address: address || '',
    },
    { new: true }
  )
  res.redirect('/account/profile')
})

router.post('/change-email', async function (req, res) {
  const { email } = req.body

  const otpCode = generateOTP()
  await OTP.updateMany(
    {
      email,
      type: 'email_verification',
      used: false,
    },
    { used: true }
  )
  await new OTP({
    email,
    code: otpCode,
    type: 'email_verification',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  }).save()
  emailService.sendOTPEmail(email, otpCode, 'email_verification')
  req.session.emailChangeData = {
    userId: req.session.authUser._id,
    newEmail: email,
  }
  res.redirect('/account/profile')
})

router.post('/verify-email-change', async function (req, res) {
  const { code } = req.body
  const { userId, newEmail } = req.session.emailChangeData || {}
  if (!userId || !newEmail) {
    return res.error('Invalid session. Please try again.')
  }
  const otp = await OTP.findOne({
    email: newEmail,
    code,
    type: 'email_verification',
    used: false,
    expiresAt: { $gt: new Date() },
  })
  if (!otp) {
    return res.error('Invalid or expired OTP code.')
  }
  await OTP.findByIdAndUpdate(otp._id, { used: true })
  req.session.authUser = await User.findByIdAndUpdate(
    userId,
    { email: newEmail },
    { new: true }
  )
  delete req.session.emailChangeData
  res.redirect('/account/profile')
})

router.post('/change-password', async function (req, res) {
  const { oldPassword, password } = req.body
  const userId = req.session.authUser._id
  const user = await User.findById(userId)
  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.error('Current password is incorrect.')
  }
  await User.findByIdAndUpdate(
    userId,
    { password: bcrypt.hashSync(password, 10) },
    { new: true }
  )
  req.session.success_messages = ['Password changed successfully.']
  res.redirect('/account/profile')
})

router.post('/request-seller', async function (req, res) {
  await new SellerRequest({ userId: req.session.authUser._id }).save()
  res.redirect('/account/profile')
})

export default router
