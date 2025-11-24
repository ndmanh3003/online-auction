import express from "express";
import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: req.userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    res.json({ user });
  }),
);

router.put(
  "/me",
  requireAuth,
  [
    body("name").trim().notEmpty(),
    body("address").trim().notEmpty(),
    body("dateOfBirth").optional().isISO8601(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error("Invalid data");
    }

    const { name, address, dateOfBirth } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: req.userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    user.name = name;
    user.address = address;
    user.date_of_birth = dateOfBirth || null;
    await userRepository.save(user);

    res.json({ user });
  }),
);

export default router;
