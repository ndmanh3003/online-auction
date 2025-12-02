import express from 'express';
import bcrypt from 'bcryptjs';
import * as userService from '../services/user.service.js';
import * as otpService from '../services/otp.service.js';
import * as sellerRequestService from '../services/seller-request.service.js';
import * as emailService from '../utils/email.js';
import { generateOTP } from '../utils/otp.js';

const router = express.Router();

router.get('/profile', async function (req, res) {
  const sellerRequest = await sellerRequestService.findByUserId(req.session.authUser._id);

  res.render('vwAccount/profile', {
    sellerRequest,
  });
});

router.get('/edit', function (req, res) {
  res.render('vwAccount/edit');
});

router.post('/edit', async function (req, res) {
  const { name, email, dob, address } = req.body;
  const userId = req.session.authUser._id;

  const user = await userService.findById(userId);
  if (!user) {
    return res.error('User not found.');
  }

  if (email !== user.email) {
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.error('Email already exists.');
    }

    const otpCode = generateOTP();
    await otpService.invalidateOTPsByEmail(email, 'email_verification');
    await otpService.createOTP(email, otpCode, 'email_verification');

    const emailSent = await emailService.sendOTPEmail(email, otpCode, 'email_verification');
    if (!emailSent) {
      return res.error('Failed to send verification email.');
    }

    req.session.emailChangeData = {
      userId,
      newEmail: email,
    };

    res.redirect('/account/verify-email-change');
    return;
  }

  await userService.update(userId, { name, dob: dob || null, address: address || '' });

  const updatedUser = await userService.findById(userId);
  req.session.authUser = updatedUser;

  res.redirect('/account/profile');
});

router.get('/verify-email-change', function (req, res) {
  if (!req.session.emailChangeData) {
    return res.error('No email change request found.');
  }
  res.render('vwAccount/verify-email-change');
});

router.post('/verify-email-change', async function (req, res) {
  const { code } = req.body;

  if (!req.session.emailChangeData) {
    return res.error('No email change request found.');
  }

  const { userId, newEmail } = req.session.emailChangeData;
  const otp = await otpService.findValidOTP(newEmail, code, 'email_verification');

  if (!otp) {
    return res.error('Invalid or expired OTP code.');
  }

  await otpService.markOTPAsUsed(otp._id);
  await userService.update(userId, { email: newEmail });

  const updatedUser = await userService.findById(userId);
  req.session.authUser = updatedUser;
  delete req.session.emailChangeData;

  res.redirect('/account/profile');
});

router.get('/change-password', function (req, res) {
  res.render('vwAccount/change-password');
});

router.post('/change-password', async function (req, res) {
  const { oldPassword, password } = req.body;
  const userId = req.session.authUser._id;

  const user = await userService.findById(userId);
  if (!user) {
    return res.error('User not found.');
  }

  const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.password);
  if (!isOldPasswordValid) {
    return res.error('Old password is incorrect.');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  await userService.updatePassword(userId, hashedPassword);

  req.session.err_messages = ['Password changed successfully.'];
  
  res.redirect('/account/change-password');
});

router.post('/request-seller', async function (req, res) {
  const userId = req.session.authUser._id;

  if (req.session.authUser.role !== 'bidder') {
    return res.error('Only bidders can request seller status.');
  }

  const existingRequest = await sellerRequestService.findByUserId(userId);
  if (existingRequest && existingRequest.status === 'pending') {
    return res.error('You already have a pending request.');
  }

  await sellerRequestService.create(userId);

  res.redirect('/account/profile');
});

export default router;
