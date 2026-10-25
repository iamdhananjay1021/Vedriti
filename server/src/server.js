import http from 'http';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/db.js';

const startServer = async () => {
  try {
    console.log('🕉️ [VedRiti Sanctum] Initializing backend service (Pure JavaScript ES Modules)...');

    // Connect to MongoDB (or auto-switch to resilient in-memory mode)
    await connectDatabase();

    const app = createApp();
    const server = http.createServer(app);

    const startListening = (port) => {
      server.listen(port, () => {
        console.log(`✨ [VedRiti Server] Active and listening on port ${port} (${config.nodeEnv})`);
        console.log(`📜 [API Endpoints] Available at http://localhost:${port}${config.apiPrefix}`);
        console.log(`🌿 [Sanctum Health] http://localhost:${port}${config.apiPrefix}/health`);
      });

      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`⚠️ [Port ${port} in use]. Attempting fallback to port ${port + 1}...`);
          startListening(port + 1);
        } else {
          console.error('💥 [Server Listen Error]:', err);
        }
      });
    };

    startListening(config.port);

    // Graceful Shutdown Handlers
    const shutdown = (signal) => {
      console.log(`\n🛑 [Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('🔒 [Server] Closed HTTP server connections.');
        process.exit(0);
      });

      // Force close after 10s if connections refuse to close
      setTimeout(() => {
        console.error('⚠️ [Server] Forcefully shutting down.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason) => {
      console.error('💥 [Unhandled Rejection]:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('💥 [Uncaught Exception]:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('💥 [Fatal Error during Server Startup]:', error);
    process.exit(1);
  }
};

startServer();
