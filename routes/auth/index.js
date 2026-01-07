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
  const isAjaxRequest = req.headers['x-requested-with'] === 'XMLHttpRequest'

  const { name, email, password, dob, address } = req.body || {}

  if (!email || email.trim() === '') {
    if (isAjaxRequest) {
      return res.status(400).json({ error: 'Email is required.' })
    }
    return res.error('Email is required.')
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    if (isAjaxRequest) {
      return res
        .status(400)
        .json({ error: 'Email already exists. Please use a different email.' })
    }
    return res.error('Email already exists. Please use a different email.')
  }

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
  req.session.registerData = {
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    dob: dob || null,
    address: address || '',
  }
  res.redirect('/auth/register')
})

router.post('/verify-email', async function (req, res) {
  const { code } = req.body
  const registerData = req.session.registerData
  if (!registerData || !registerData.email) {
    return res.error('Invalid session. Please try again.')
  }
  const otp = await OTP.findOne({
    email: registerData.email,
    code,
    type: 'email_verification',
    used: false,
    expiresAt: { $gt: new Date() },
  })
  if (!otp) {
    return res.error('Invalid or expired OTP code.')
  }
  await OTP.findByIdAndUpdate(otp._id, { used: true })
  const newUser = new User({
    ...registerData,
    role: 'bidder',
    isEmailVerified: true,
  })
  await newUser.save()
  delete req.session.registerData
  req.session.isAuthenticated = true
  req.session.authUser = newUser
  res.redirect('/account/profile')
})

router.post('/verify-password-reset', async function (req, res) {
  const { code } = req.body
  const { email } = req.session.forgotPasswordEmail || {}
  if (!email) {
    return res.error('Invalid session. Please try again.')
  }
  const otp = await OTP.findOne({
    email,
    code,
    type: 'password_reset',
    used: false,
    expiresAt: { $gt: new Date() },
  })
  if (!otp) {
    return res.error('Invalid or expired OTP code.')
  }
  await OTP.findByIdAndUpdate(otp._id, { used: true })
  req.session.resetPasswordEmail = { email, verified: true }
  delete req.session.forgotPasswordEmail
  res.redirect('/auth/reset-password')
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
  await new OTP({
    email,
    code: otpCode,
    type: 'password_reset',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  }).save()
  emailService.sendOTPEmail(email, otpCode, 'password_reset')
  req.session.forgotPasswordEmail = { email }
  res.redirect('/auth/forgot')
})

router.get('/reset-password', function (req, res) {
  const { verified } = req.session.resetPasswordEmail || {}
  if (!verified) {
    return res.redirect('/auth/forgot')
  }
  res.render('vwAuth/reset-password')
})

router.post('/reset-password', async function (req, res) {
  const { password } = req.body
  const resetPasswordEmail = req.session.resetPasswordEmail
  if (
    !resetPasswordEmail ||
    !resetPasswordEmail.email ||
    !resetPasswordEmail.verified
  ) {
    return res.error('Please verify OTP first.')
  }
  const user = await User.findOne({ email: resetPasswordEmail.email })
  await User.findByIdAndUpdate(
    user._id,
    { password: bcrypt.hashSync(password, 10) },
    { new: true }
  )
  delete req.session.resetPasswordEmail
  res.redirect('/auth/login')
})

export default router
