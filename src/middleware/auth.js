import { verifyToken } from '../utils/jwt.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }

  req.userId = decoded.userId;
  next();
};
