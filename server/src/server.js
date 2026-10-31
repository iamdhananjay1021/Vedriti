import http from 'http';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { startMaintenance } from './services/maintenanceService.js';

const start = async () => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('[MongoDB] Could not connect:', error.message);
    process.exit(1);
  }

  const server = http.createServer(createApp());
  server.listen(config.port, () => {
    console.log(`[VedRit API] Listening on port ${config.port} (${config.nodeEnv})`);
  });

  const maintenance = startMaintenance();

  const shutdown = (signal) => {
    console.log(`[VedRit API] ${signal} received, shutting down`);
    clearInterval(maintenance);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => console.error('[Unhandled Rejection]', reason));
};

start();
