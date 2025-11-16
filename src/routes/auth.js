import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../config/email.js';
import { generateOTP, isOTPExpired } from '../utils/otp.js';
import { verifyRecaptcha } from '../utils/recaptcha.js';
import { generateToken } from '../utils/jwt.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/send-otp',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
      }

      const { email } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }

      const otp = generateOTP();
      const emailSent = await sendOTPEmail(email, otp);
      
      if (!emailSent) {
        return res.status(500).json({ message: 'Không thể gửi email' });
      }

      await OTP.create({ email, otp });

      res.json({ message: 'OTP đã được gửi đến email của bạn' });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
);

router.post('/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Tên là bắt buộc'),
    body('address').trim().notEmpty().withMessage('Địa chỉ là bắt buộc'),
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('otp').notEmpty().withMessage('OTP là bắt buộc'),
    body('recaptchaToken').notEmpty().withMessage('reCaptcha là bắt buộc'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
      }

      const { name, address, email, password, otp, recaptchaToken } = req.body;

      const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
      if (!isValidRecaptcha) {
        return res.status(400).json({ message: 'reCaptcha không hợp lệ' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }

      const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
      if (!otpRecord || otpRecord.verified) {
        return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã được sử dụng' });
      }

      if (isOTPExpired(otpRecord.createdAt)) {
        return res.status(400).json({ message: 'OTP đã hết hạn' });
      }

      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: 'OTP không đúng' });
      }

      const user = await User.create({
        name,
        address,
        email,
        password,
        emailVerified: true,
      });

      await OTP.updateOne({ _id: otpRecord._id }, { verified: true });

      const token = generateToken(user._id);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ 
        message: 'Đăng ký thành công',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
);

router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      const token = generateToken(user._id);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: 'Đăng nhập thành công',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
);

router.post('/logout', async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
