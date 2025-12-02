import OTP from '../models/OTP.js';

export async function createOTP(email, code, type) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  const otp = new OTP({
    email: email.toLowerCase().trim(),
    code,
    type,
    expiresAt,
  });

  return await otp.save();
}

export async function findValidOTP(email, code, type) {
  return await OTP.findOne({
    email: email.toLowerCase().trim(),
    code,
    type,
    used: false,
    expiresAt: { $gt: new Date() },
  });
}

export async function markOTPAsUsed(otpId) {
  return await OTP.findByIdAndUpdate(otpId, { used: true });
}

export async function invalidateOTPsByEmail(email, type) {
  return await OTP.updateMany(
    { email: email.toLowerCase().trim(), type, used: false },
    { used: true }
  );
}
