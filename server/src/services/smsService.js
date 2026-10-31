import { config } from '../config/env.js';
import { AppError } from '../middlewares/errorHandler.js';

const sendViaFast2Sms = async (phone, code) => {
  const url = new URL('https://www.fast2sms.com/dev/bulkV2');
  url.searchParams.set('route', 'otp');
  url.searchParams.set('variables_values', code);
  url.searchParams.set('numbers', phone.slice(-10));
  url.searchParams.set('flash', '0');
  const res = await fetch(url, { headers: { authorization: config.fast2smsApiKey } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.return === false) {
    console.error('[SMS] Fast2SMS error', res.status, body);
    throw new AppError('Could not send OTP right now. Please try again in a minute.', 502);
  }
};

export const isSmsEnabled = () => config.smsProvider === 'fast2sms' && Boolean(config.fast2smsApiKey);

export const sendOtpSms = async (phone, code) => {
  if (isSmsEnabled()) return sendViaFast2Sms(phone, code);
  if (config.isProduction) throw new AppError('OTP login is temporarily unavailable. Please use email login.', 503);
  console.log(`[SMS disabled] OTP for ${phone}: ${code}`);
};
