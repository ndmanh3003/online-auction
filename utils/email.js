import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
});

export async function sendOTPEmail(email, code, type) {
  const subject = type === 'email_verification' ? 'Email Verification Code' : 'Password Reset Code';

  const text =
    type === 'email_verification'
      ? `Your email verification code is: ${code}. This code will expire in 10 minutes.`
      : `Your password reset code is: ${code}. This code will expire in 10 minutes.`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: email,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}
