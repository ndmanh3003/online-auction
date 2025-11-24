import express from "express";
import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";
import { OTP } from "../entities/OTP.js";
import { sendOTPEmail } from "../config/email.js";
import { generateOTP, isOTPExpired } from "../utils/otp.js";
import { verifyRecaptcha } from "../utils/recaptcha.js";
import { generateToken } from "../utils/jwt.js";

const router = express.Router();

router.post(
  "/send-otp",
  [body("email").isEmail().normalizeEmail()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error("Invalid data");
    }

    const { email } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const otpRepository = AppDataSource.getRepository(OTP);

    const existingUser = await userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    const otp = generateOTP();
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      throw new Error("Failed to send email");
    }

    const otpEntity = otpRepository.create({
      email: email.toLowerCase().trim(),
      otp,
    });
    await otpRepository.save(otpEntity);

    res.json({});
  }),
);

router.post(
  "/register",
  [
    body("name").trim().notEmpty(),
    body("address").trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("otp").notEmpty(),
    body("recaptchaToken").notEmpty(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error("Invalid data");
    }

    const { name, address, email, password, otp, recaptchaToken } = req.body;

    const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidRecaptcha) {
      throw new Error("Invalid reCaptcha");
    }

    const userRepository = AppDataSource.getRepository(User);
    const otpRepository = AppDataSource.getRepository(OTP);

    const existingUser = await userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    const otpRecord = await otpRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      order: { created_at: "DESC" },
    });
    if (!otpRecord || otpRecord.verified) {
      throw new Error("Invalid or already used OTP");
    }

    if (isOTPExpired(otpRecord.created_at)) {
      throw new Error("OTP expired");
    }

    if (otpRecord.otp !== otp) {
      throw new Error("Invalid OTP");
    }

    const user = userRepository.create({
      name,
      address,
      email: email.toLowerCase().trim(),
      password,
      email_verified: true,
    });
    await user.hashPassword();
    await userRepository.save(user);

    otpRecord.verified = true;
    await otpRepository.save(otpRecord);

    const token = generateToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }),
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error("Invalid data");
    }

    const { email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      select: [
        "id",
        "name",
        "email",
        "password",
        "address",
        "date_of_birth",
        "email_verified",
        "created_at",
        "updated_at",
      ],
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });

    res.json({});
  }),
);

export default router;
