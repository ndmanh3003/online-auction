import express from 'express';
import { getHome, getRegister, getLogin, getProfile, getChangePassword, getChangeEmail } from '../controllers/homeController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', getHome);
router.get('/dang-ky', getRegister);
router.get('/dang-nhap', getLogin);
router.get('/thong-tin', requireAuth, getProfile);
router.get('/doi-mat-khau', requireAuth, getChangePassword);
router.get('/doi-email', requireAuth, getChangeEmail);

export default router;
