import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { requireAuth } from '../middleware/auth.js';
import { sendChangeEmailOTP } from '../config/email.js';
import { generateOTP, isOTPExpired } from '../utils/otp.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/me', requireAuth, [
  body('name').trim().notEmpty().withMessage('Tên là bắt buộc'),
  body('address').trim().notEmpty().withMessage('Địa chỉ là bắt buộc'),
  body('dateOfBirth').optional().isISO8601().withMessage('Ngày sinh không hợp lệ'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
    }

    const { name, address, dateOfBirth } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.name = name;
    user.address = address;
    if (dateOfBirth) {
      user.dateOfBirth = new Date(dateOfBirth);
    }

    await user.save();

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.post('/change-password', requireAuth, authLimiter, [
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.post('/change-email/send-otp', requireAuth, authLimiter, [
  body('newEmail').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
    }

    const { newEmail } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.email === newEmail) {
      return res.status(400).json({ message: 'Email mới phải khác email hiện tại' });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const otp = generateOTP();
    const emailSent = await sendChangeEmailOTP(newEmail, otp);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Không thể gửi email' });
    }

    await OTP.create({ email: newEmail, otp });

    res.json({ message: 'OTP đã được gửi đến email mới của bạn' });
  } catch (error) {
    console.error('Send OTP for change email error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.post('/change-email/verify', requireAuth, authLimiter, [
  body('newEmail').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
  body('otp').notEmpty().withMessage('OTP là bắt buộc'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
    }

    const { newEmail, otp } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.email === newEmail) {
      return res.status(400).json({ message: 'Email mới phải khác email hiện tại' });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const otpRecord = await OTP.findOne({ email: newEmail }).sort({ createdAt: -1 });
    if (!otpRecord || otpRecord.verified) {
      return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã được sử dụng' });
    }

    if (isOTPExpired(otpRecord.createdAt)) {
      return res.status(400).json({ message: 'OTP đã hết hạn' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'OTP không đúng' });
    }

    user.email = newEmail;
    user.emailVerified = true;
    await user.save();

    await OTP.updateOne({ _id: otpRecord._id }, { verified: true });

    res.json({
      message: 'Đổi email thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Change email error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;

