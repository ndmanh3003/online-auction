import express from 'express';
import authRouter from './auth.route.js';
import accountRouter from './account.route.js';
import adminRouter from './admin/index.js';
import homeRouter from './home.route.js';
import productRouter from './product.route.js';
import searchRouter from './search.route.js';
import { isAuth, isAdmin } from '../middlewares/auth.mdw.js';

const router = express.Router();

router.use('/', homeRouter);
router.use('/products', productRouter);
router.use('/search', searchRouter);
router.use('/auth', authRouter);
router.use('/account', isAuth, accountRouter);
router.use('/admin', isAuth, isAdmin, adminRouter);

export default router;
