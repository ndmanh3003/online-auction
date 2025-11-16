import express from 'express';
import { getHome, getRegister, getLogin, getProfile } from '../controllers/homeController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', getHome);
router.get('/dang-ky', getRegister);
router.get('/dang-nhap', getLogin);
router.get('/thong-tin', requireAuth, getProfile);

export default router;
