import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, AppError } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';

/**
 * Creates and configures the Express application
 * @returns {import('express').Application}
 */
export const createApp = () => {
  const app = express();

  // 1. Security HTTP Headers
  app.use(helmet());

  // 2. CORS configuration for Expo mobile app & Admin portal
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow mobile apps, curl, or origins in whitelist
        if (!origin || config.clientOrigins.includes(origin) || config.nodeEnv !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS policy of VedRiti Sanctum'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Request Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  // 5. General Rate Limiter
  app.use(generalLimiter);

  // 6. Base Welcome Route
  app.get('/', (req, res) => {
    res.status(200).json({
      platform: 'VedRiti (वेदरीति) Vedic Sanctum & Puja Booking Platform',
      version: '1.0.0',
      mantra: 'श्रद्धा • संकल्प • सिद्धि',
      documentation: `${config.apiPrefix}/health`,
    });
  });

  // 7. Mount Core API Routes
  app.use(config.apiPrefix, apiRouter);

  // 8. 404 Handler
  app.use((req, res, next) => {
    next(new AppError(`मार्ग उपलब्ध नहीं है: ${req.originalUrl} (Endpoint not found)`, 404));
  });

  // 9. Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
