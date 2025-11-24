import { verifyToken } from '../utils/jwt.js';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.redirect('/login');
  }

  req.userId = decoded.userId;
  next();
};

export const optionalAuth = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
      });
      if (user) {
        res.locals.user = {
          id: user.id,
          name: user.name,
          email: user.email,
        };
        req.userId = decoded.userId;
      }
    }
  }

  next();
};
