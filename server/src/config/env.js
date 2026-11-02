import dotenv from 'dotenv';

dotenv.config();

const read = (key) => {
  const value = (process.env[key] || '').trim();
  if (!value || /^<.*>$/.test(value)) return '';
  return value;
};

const nodeEnv = read('NODE_ENV') || 'development';
const isProduction = nodeEnv === 'production';

const parseList = (raw) => raw.split(',').map((v) => v.trim()).filter(Boolean);

const parseOrigins = (rawOrigins) => {
  if (!rawOrigins) return ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081', 'http://localhost:19006'];
  return parseList(rawOrigins);
};

const missing = [];
const required = (key, devFallback) => {
  const value = read(key);
  if (value) return value;
  if (isProduction) missing.push(key);
  return devFallback;
};

const localPhone = (p) => p.replace(/\D/g, '').slice(-10);

const devUserPhone = localPhone(read('DEV_USER_PHONE') || '9999999999');
const devUserEmail = (read('DEV_USER_EMAIL') || 'dev@vedrit.in').toLowerCase();

export const config = {
  port: parseInt(read('PORT') || '5001', 10),
  nodeEnv,
  isProduction,
  apiPrefix: read('API_PREFIX') || '/api/v1',
  publicApiUrl: (read('PUBLIC_API_URL') || 'http://localhost:5001').replace(/\/+$/, ''),
  clientOrigins: parseOrigins(read('CLIENT_ORIGIN')),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/vedrit'),
  jwtSecret: required('JWT_SECRET', 'vedrit_local_development_secret_change_me'),
  jwtExpiresIn: read('JWT_EXPIRES_IN') || '30d',
  adminEmail: (read('ADMIN_EMAIL') || (isProduction ? '' : 'admin@vedrit.in')).toLowerCase(),
  adminPassword: read('ADMIN_PASSWORD') || (isProduction ? '' : 'vedrit-admin'),
  otpLength: 6,
  otpExpiryMinutes: parseInt(read('OTP_EXPIRY_MINUTES') || '10', 10),
  otpMaxAttempts: 5,
  otpResendSeconds: 30,
  smsProvider: (read('SMS_PROVIDER') || 'none').toLowerCase(),
  fast2smsApiKey: read('FAST2SMS_API_KEY'),
  resendApiKey: read('RESEND_API_KEY'),
  emailFrom: read('EMAIL_FROM') || 'VedRit <no-reply@vedrit.in>',
  staticOtp: /^\d{4,6}$/.test(read('STATIC_OTP')) ? read('STATIC_OTP') : '',
  reviewerPhones: [...new Set([...parseList(read('REVIEWER_PHONES')).map(localPhone), devUserPhone])].filter((p) => p.length === 10),
  reviewerEmails: [...new Set([...parseList(read('REVIEWER_EMAILS')).map((e) => e.toLowerCase()), devUserEmail])],
  devUser: {
    name: read('DEV_USER_NAME') || 'VedRit Developer',
    phone: devUserPhone,
    email: devUserEmail,
    password: read('DEV_USER_PASSWORD') || 'VedritDev@2026',
  },
  geminiApiKey: read('GEMINI_API_KEY') || read('GOOGLE_API_KEY'),
  razorpayKeyId: read('RAZORPAY_KEY_ID'),
  razorpayKeySecret: read('RAZORPAY_KEY_SECRET'),
  razorpayWebhookSecret: read('RAZORPAY_WEBHOOK_SECRET'),
  timezone: 'Asia/Kolkata',
  rateLimitWindowMs: parseInt(read('RATE_LIMIT_WINDOW_MS') || '900000', 10),
  rateLimitMaxRequests: parseInt(read('RATE_LIMIT_MAX_REQUESTS') || '300', 10),
};

if (missing.length) {
  throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
}

export const isRazorpayConfigured = () => Boolean(config.razorpayKeyId && config.razorpayKeySecret);
export const isResendConfigured = () => Boolean(config.resendApiKey);
