import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from './errorHandler.js';
import { isDatabaseConnected } from '../config/db.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

/**
 * Require valid JWT authentication
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('प्रवेश हेतु प्रमाणीकरण आवश्यक है (Authentication token required)', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    let user = null;
    if (isDatabaseConnected()) {
      user = await User.findById(decoded.userId);
    } else {
      for (const u of inMemoryStore.users.values()) {
        if (u._id === decoded.userId) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new AppError('भक्त प्रोफ़ाइल प्राप्त नहीं हुई (Devotee record not found)', 401);
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - allows guests but attaches devotee if token is valid
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        let user = null;
        if (isDatabaseConnected()) {
          user = await User.findById(decoded.userId);
        } else {
          for (const u of inMemoryStore.users.values()) {
            if (u._id === decoded.userId) {
              user = u;
              break;
            }
          }
        }
        if (user) {
          req.user = user;
          req.userId = user._id.toString();
        }
      } catch (err) {
        // Token is invalid/expired - proceed as guest
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
