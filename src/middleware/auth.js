import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    return res.redirect('/dang-nhap');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    return res.redirect('/dang-nhap');
  }

  req.userId = decoded.userId;
  next();
};

export const optionalAuth = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const user = await User.findById(decoded.userId);
        if (user) {
          res.locals.user = {
            id: user._id,
            name: user.name,
            email: user.email,
          };
          req.userId = decoded.userId;
        }
      } catch (error) {
        console.error('Optional auth error:', error);
      }
    }
  }
  
  next();
};
