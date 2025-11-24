import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';

export const getRegister = (req, res) => {
  res.render('register', {
    title: 'Register - Auction',
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
    viewName: 'register',
  });
};

export const getLogin = (req, res) => {
  res.render('login', {
    title: 'Login - Auction',
    viewName: 'login',
  });
};

export const getProfile = asyncHandler(async (req, res) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id: req.userId },
  });
  if (!user) {
    throw new Error('User not found');
  }

  res.render('profile', {
    title: 'Profile - Auction',
    viewName: 'profile',
    user,
  });
});
