import express from 'express';
import { getRegister, getLogin, getProfile } from '../controllers/homeController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', (req, res) => {
  res.redirect('/login');
});

router.get('/register', getRegister);
router.get('/login', getLogin);
router.get('/profile', requireAuth, getProfile);

export default router;
