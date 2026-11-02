import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from './errorHandler.js';

const readToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (!token) throw new AppError('Please login to continue', 401);
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.role !== 'user') throw new AppError('Please login to continue', 401);
    const user = await User.findById(payload.sub);
    if (!user) throw new AppError('Your session has ended. Please login again.', 401);
    if (user.isBlocked) throw new AppError('This account has been blocked. Please contact support.', 403);
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireCompleteProfile = (req, res, next) => {
  if (!req.user?.profileCompleted) {
    return next(new AppError('Please complete your profile before booking', 428));
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  try {
    const token = readToken(req);
    if (!token) throw new AppError('Admin login required', 401);
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.role !== 'admin') throw new AppError('Admin access required', 403);
    req.adminEmail = payload.email || '';
    next();
  } catch (error) {
    next(error);
  }
};
