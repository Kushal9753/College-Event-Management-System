import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401);
        return next(new Error('User not found'));
      }

      req.user = user;

      return next(); // 🔥 important (stop further execution)
    } catch (error) {
      console.error(error);
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  }

  res.status(401);
  return next(new Error('Not authorized, no token'));
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`User role ${req.user.role} is not authorized to access this route`)
      );
    }
    next();
  };
};