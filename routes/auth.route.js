import bcrypt from 'bcryptjs'
import express from 'express'
import { isAuth } from '../middlewares/auth.mdw.js'
import * as otpService from '../services/otp.service.js'
import * as userService from '../services/user.service.js'
import * as emailService from '../utils/email.js'
import { generateOTP } from '../utils/otp.js'
import { verifyRecaptcha } from '../utils/recaptcha.js'

const router = express.Router()

router.get('/register', function (req, res) {
  res.render('vwAuth/register')
})

router.post('/register', async function (req, res) {
  const {
    name,
    email,
    password,
    dob,
    address,
    'g-recaptcha-response': recaptchaToken,
  } = req.body
  await verifyRecaptcha(recaptchaToken)
  const otpCode = generateOTP()
  await otpService.invalidateOTPsByEmail(email, 'email_verification')
  await otpService.createOTP(email, otpCode, 'email_verification')
  await emailService.sendOTPEmail(email, otpCode, 'email_verification')
  req.session.registerData = {
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    dob: dob || null,
    address: address || '',
  }
  res.redirect('/auth/verify-otp?type=email_verification')
})

router.get('/verify-otp', function (req, res) {
  const type = req.query.type || 'email_verification'
  res.render('vwAuth/verify-otp', { type })
})

router.post('/verify-otp', async function (req, res) {
  const { code, type } = req.body
  if (type === 'email_verification') {
    const { email } = req.session.registerData
    const otp = await otpService.findValidOTP(email, code, 'email_verification')
    await otpService.markOTPAsUsed(otp._id)
    const newUser = await userService.add({
      ...req.session.registerData,
      role: 'bidder',
      isEmailVerified: true,
    })
    delete req.session.registerData
    req.session.isAuthenticated = true
    req.session.authUser = newUser
    res.redirect('/account/profile')
  } else if (type === 'password_reset') {
    const { email } = req.session.forgotPasswordEmail
    const otp = await otpService.findValidOTP(email, code, 'password_reset')
    await otpService.markOTPAsUsed(otp._id)
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
  const user = await userService.findByEmail(email)
  req.session.isAuthenticated = true
  req.session.authUser = user
  if (user.role === 'admin') {
    delete req.session.retUrl
    return res.redirect('/admin')
  }
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
  await otpService.invalidateOTPsByEmail(email, 'password_reset')
  await otpService.createOTP(email, otpCode, 'password_reset')
  await emailService.sendOTPEmail(email, otpCode, 'password_reset')
  req.session.forgotPasswordEmail = { email }
  res.redirect('/auth/verify-otp?type=password_reset')
})

router.get('/reset-password', function (req, res) {
  res.render('vwAuth/reset-password')
})

router.post('/reset-password', async function (req, res) {
  const { password } = req.body
  const { email } = req.session.resetPasswordEmail
  const user = await userService.findByEmail(email)
  const hashedPassword = bcrypt.hashSync(password, 10)
  await userService.updatePassword(user._id, hashedPassword)
  delete req.session.resetPasswordEmail
  res.redirect('/auth/login')
})

export default router
