import express from 'express';
import bcrypt from 'bcryptjs';
import * as userService from '../services/user.service.js';
import * as otpService from '../services/otp.service.js';
import * as emailService from '../utils/email.js';
import { generateOTP } from '../utils/otp.js';
import { verifyRecaptcha } from '../utils/recaptcha.js';
import { isAuth } from '../middlewares/auth.mdw.js';

const router = express.Router();

router.get('/register', function (req, res) {
  res.render('vwAuth/register');
});

router.post('/register', async function (req, res) {
  const { name, email, password, dob, address, 'g-recaptcha-response': recaptchaToken } = req.body;

  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  if (!isRecaptchaValid) {
    return res.error('reCAPTCHA verification failed. Please try again.');
  }

  const existingUser = await userService.findByEmail(email);
  if (existingUser) {
    return res.error('Email already exists.');
  }

  const otpCode = generateOTP();
  await otpService.invalidateOTPsByEmail(email, 'email_verification');
  await otpService.createOTP(email, otpCode, 'email_verification');

  const emailSent = await emailService.sendOTPEmail(email, otpCode, 'email_verification');
  if (!emailSent) {
    return res.error('Failed to send verification email. Please try again.');
  }

  req.session.registerData = {
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    dob: dob || null,
    address: address || '',
  };

  res.redirect('/auth/verify-otp?type=email_verification');
});

router.get('/verify-otp', function (req, res) {
  const type = req.query.type || 'email_verification';
  if (!req.session.registerData && type === 'email_verification') {
    return res.error('No registration data found.');
  }
  if (!req.session.forgotPasswordEmail && type === 'password_reset') {
    return res.error('No password reset request found.');
  }

  res.render('vwAuth/verify-otp', { type });
});

router.post('/verify-otp', async function (req, res) {
  const { code, type } = req.body;

  if (type === 'email_verification') {
    if (!req.session.registerData) {
      return res.error('No registration data found.');
    }

    const { email } = req.session.registerData;
    const otp = await otpService.findValidOTP(email, code, 'email_verification');

    if (!otp) {
      return res.error('Invalid or expired OTP code.');
    }

    await otpService.markOTPAsUsed(otp._id);

    const newUser = await userService.add({
      ...req.session.registerData,
      role: 'bidder',
      isEmailVerified: true,
    });

    delete req.session.registerData;

    req.session.isAuthenticated = true;
    req.session.authUser = newUser;

    res.redirect('/account/profile');
  } else if (type === 'password_reset') {
    if (!req.session.forgotPasswordEmail) {
      return res.error('No password reset request found.');
    }

    const { email } = req.session.forgotPasswordEmail;
    const otp = await otpService.findValidOTP(email, code, 'password_reset');

    if (!otp) {
      return res.error('Invalid or expired OTP code.');
    }

    await otpService.markOTPAsUsed(otp._id);
    req.session.resetPasswordEmail = email;
    delete req.session.forgotPasswordEmail;

    res.redirect('/auth/reset-password');
  }
});

router.get('/login', function (req, res) {
  res.render('vwAuth/login');
});

router.post('/login', async function (req, res) {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    return res.error('Invalid email or password.');
  }

  if (!user.isEmailVerified) {
    return res.error('Please verify your email first.');
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.error('Invalid email or password.');
  }

  req.session.isAuthenticated = true;
  req.session.authUser = user;

  if (user.role === 'admin') {
    delete req.session.retUrl;
    return res.redirect('/admin');
  }

  const retUrl = req.session.retUrl || '/';
  delete req.session.retUrl;

  res.redirect(retUrl);
});

router.post('/logout', isAuth, function (req, res) {
  req.session.isAuthenticated = false;
  delete req.session.authUser;
  
  res.redirect('/');
});

router.get('/forgot', function (req, res) {
  res.render('vwAuth/forgot');
});

router.post('/forgot', async function (req, res) {
  const { email } = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    return res.error('Email not found.');
  }

  const otpCode = generateOTP();
  await otpService.invalidateOTPsByEmail(email, 'password_reset');
  await otpService.createOTP(email, otpCode, 'password_reset');

  const emailSent = await emailService.sendOTPEmail(email, otpCode, 'password_reset');
  if (!emailSent) {
    return res.error('Failed to send reset email. Please try again.');
  }

  req.session.forgotPasswordEmail = { email };

  res.redirect('/auth/verify-otp?type=password_reset');
});

router.get('/reset-password', function (req, res) {
  if (!req.session.resetPasswordEmail) {
    return res.error('No password reset request found.');
  }

  res.render('vwAuth/reset-password');
});

router.post('/reset-password', async function (req, res) {
  const { password } = req.body;

  if (!req.session.resetPasswordEmail) {
    return res.error('No password reset request found.');
  }

  const { email } = req.session.resetPasswordEmail;
  const user = await userService.findByEmail(email);
  if (!user) {
    return res.error('User not found.');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  await userService.updatePassword(user._id, hashedPassword);

  delete req.session.resetPasswordEmail;

  res.redirect('/auth/login');
});

export default router;
