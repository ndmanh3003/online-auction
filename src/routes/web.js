import express from 'express';
import { getHome, getRegister } from '../controllers/homeController.js';

const router = express.Router();

router.get('/', getHome);
router.get('/dang-ky', getRegister);

export default router;
