import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã OTP đăng ký tài khoản',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Mã OTP đăng ký tài khoản</h2>
          <p>Xin chào,</p>
          <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #1890ff;">${otp}</strong></p>
          <p>Mã này có hiệu lực trong 10 phút.</p>
          <p>Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

export const sendChangeEmailOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã OTP đổi email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Mã OTP đổi email</h2>
          <p>Xin chào,</p>
          <p>Bạn đang yêu cầu đổi email cho tài khoản của mình.</p>
          <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #1890ff;">${otp}</strong></p>
          <p>Mã này có hiệu lực trong 10 phút.</p>
          <p>Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <p>Nếu bạn không yêu cầu đổi email, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

export default transporter;
