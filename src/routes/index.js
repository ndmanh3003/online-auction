import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);

export default router;
