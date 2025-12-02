import express from 'express';
import authRouter from './auth.route.js';
import accountRouter from './account.route.js';
import adminRouter from './admin/index.js';
import { isAuth, isAdmin } from '../middlewares/auth.mdw.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/account', isAuth, accountRouter);
router.use('/admin', isAuth, isAdmin, adminRouter);

export default router;
