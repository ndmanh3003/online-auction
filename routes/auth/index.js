import bcrypt from 'bcryptjs'
import express from 'express'
import { isAuth } from '../../middlewares/auth.mdw.js'
import OTP from '../../models/OTP.js'
import User from '../../models/User.js'
import * as emailService from '../../utils/email.js'
import { generateOTP } from '../../utils/otp.js'

const router = express.Router()

router.get('/register', function (req, res) {
  res.render('vwAuth/register')
})

router.post('/register', async function (req, res) {
  const { name, email, password, dob, address } = req.body
  const otpCode = generateOTP()
  await OTP.updateMany(
    {
      email,
      type: 'email_verification',
      used: false,
    },
    { used: true }
  )
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10)
  const otp = new OTP({
    email,
    code: otpCode,
    type: 'email_verification',
    expiresAt,
  })
  await otp.save()
  emailService.sendOTPEmail(email, otpCode, 'email_verification')
  req.session.registerData = {
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    dob: dob || null,
    address: address || '',
  }
  req.session.showOtpModal = true
  req.session.otpModalType = 'email_verification'
  req.session.otpModalTitle = 'Email Verification'
  req.session.otpModalMessage = 'Please enter the OTP code sent to your email.'
  req.session.otpModalAction = '/auth/verify-otp'
  res.redirect('/auth/register')
})

router.get('/verify-otp', function (req, res) {
  const type = req.query.type || 'email_verification'
  res.render('vwAuth/verify-otp', { type })
})

router.post('/verify-otp', async function (req, res) {
  const { code, type } = req.body
  if (type === 'email_verification') {
    const { email } = req.session.registerData
    const otp = await OTP.findOne({
      email,
      code,
      type: 'email_verification',
      used: false,
      expiresAt: { $gt: new Date() },
    })
    await OTP.findByIdAndUpdate(otp._id, { used: true })
    const newUser = new User({
      ...req.session.registerData,
      role: 'bidder',
      isEmailVerified: true,
    })
    await newUser.save()
    delete req.session.registerData
    req.session.isAuthenticated = true
    req.session.authUser = newUser
    res.redirect('/account/profile')
  } else if (type === 'password_reset') {
    const { email } = req.session.forgotPasswordEmail
    const otp = await OTP.findOne({
      email,
      code,
      type: 'password_reset',
      used: false,
      expiresAt: { $gt: new Date() },
    })
    await OTP.findByIdAndUpdate(otp._id, { used: true })
    req.session.resetPasswordEmail = email
    delete req.session.forgotPasswordEmail
    res.redirect('/auth/reset-password')
  }
})

router.get('/login', function (req, res) {
  res.render('vwAuth/login')
})

router.post('/login', async function (req, res) {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.error('Invalid email or password.')
  }

  req.session.isAuthenticated = true
  req.session.authUser = user
  const retUrl = req.session.retUrl || '/'
  delete req.session.retUrl
  res.redirect(retUrl)
})

router.post('/logout', isAuth, function (req, res) {
  req.session.isAuthenticated = false
  delete req.session.authUser

  res.redirect('/')
})

router.get('/forgot', function (req, res) {
  res.render('vwAuth/forgot')
})

router.post('/forgot', async function (req, res) {
  const { email } = req.body
  const otpCode = generateOTP()
  await OTP.updateMany(
    { email, type: 'password_reset', used: false },
    { used: true }
  )
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10)
  const otp = new OTP({
    email,
    code: otpCode,
    type: 'password_reset',
    expiresAt,
  })
  await otp.save()
  emailService.sendOTPEmail(email, otpCode, 'password_reset')
  req.session.forgotPasswordEmail = { email }
  req.session.showOtpModal = true
  req.session.otpModalType = 'password_reset'
  req.session.otpModalTitle = 'Password Reset Verification'
  req.session.otpModalMessage = 'Please enter the OTP code sent to your email.'
  req.session.otpModalAction = '/auth/verify-otp'
  res.redirect('/auth/forgot')
})

router.get('/reset-password', function (req, res) {
  res.render('vwAuth/reset-password')
})

router.post('/reset-password', async function (req, res) {
  const { password } = req.body
  const { email } = req.session.resetPasswordEmail
  const user = await User.findOne({ email })
  const hashedPassword = bcrypt.hashSync(password, 10)
  await User.findByIdAndUpdate(
    user._id,
    { password: hashedPassword },
    { new: true }
  )
  delete req.session.resetPasswordEmail
  res.redirect('/auth/login')
})

export default router
