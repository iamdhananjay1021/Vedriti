import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Parses comma-separated client origins into an array
 * @param {string} [rawOrigins]
 * @returns {string[]}
 */
const parseOrigins = (rawOrigins) => {
  if (!rawOrigins) return ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006'];
  return rawOrigins.split(',').map((origin) => origin.trim());
};

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedriti_sanctum',
  jwtSecret: process.env.JWT_SECRET || 'vedriti_sacred_secret_jwt_kashi_vishwanath_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  staticOtp: process.env.STATIC_OTP || '1080',
  enableSmsGateway: process.env.ENABLE_SMS_GATEWAY === 'true',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_VedicSanctum2026',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'vedic_secret_mock_live_sha256',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_vedriti_consecration_2026',
  whatsappPhone: process.env.WHATSAPP_PHONE || '+919876543210',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200', 10),
};
