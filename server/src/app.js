import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.clientOrigins.includes(origin) || !config.isProduction) return callback(null, true);
        callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, res, buf) => {
        if (req.originalUrl.includes('/payments/webhook')) req.rawBody = buf.toString('utf8');
      },
    })
  );
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  if (config.nodeEnv !== 'test') {
    app.use(morgan(config.isProduction ? 'combined' : 'dev'));
  }

  app.use(config.apiPrefix, generalLimiter);

  app.get('/', (req, res) => {
    res.json({ platform: 'VedRit API', health: `${config.apiPrefix}/health` });
  });

  app.use(config.apiPrefix, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
