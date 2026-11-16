import { config } from '../config/env.js';
import { AppError } from '../middlewares/errorHandler.js';

const TWOFACTOR = 'https://2factor.in/API/V1';

const local10 = (phone) => String(phone || '').replace(/\D/g, '').slice(-10);

const twoFactorJson = async (url, init) => {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
  const body = await res.json().catch(() => ({}));
  return { res, body, ok: res.ok && String(body.Status || '').toLowerCase() === 'success' };
};

const sendViaTwoFactor = async (phone, code) => {
  const template = config.twoFactorOtpTemplate ? `/${encodeURIComponent(config.twoFactorOtpTemplate)}` : '';
  const { res, body, ok } = await twoFactorJson(`${TWOFACTOR}/${config.twoFactorApiKey}/SMS/${local10(phone)}/${code}${template}`);
  if (!ok) {
    console.error('[SMS] 2Factor error', res.status, JSON.stringify(body).slice(0, 300));
    throw new AppError('Could not send the SMS right now. Please try again in a minute or use email.', 502);
  }
};

const sendViaFast2Sms = async (phone, code) => {
  const url = new URL('https://www.fast2sms.com/dev/bulkV2');
  url.searchParams.set('route', 'otp');
  url.searchParams.set('variables_values', code);
  url.searchParams.set('numbers', local10(phone));
  url.searchParams.set('flash', '0');
  const res = await fetch(url, { headers: { authorization: config.fast2smsApiKey } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.return === false) {
    console.error('[SMS] Fast2SMS error', res.status, body);
    throw new AppError('Could not send the SMS right now. Please try again in a minute or use email.', 502);
  }
};

export const smsProviderName = () => {
  if (config.twoFactorApiKey) return '2factor';
  if (config.smsProvider === 'fast2sms' && config.fast2smsApiKey) return 'fast2sms';
  return 'none';
};

export const isSmsEnabled = () => smsProviderName() !== 'none';

export const isBroadcastSmsEnabled = () => {
  const provider = smsProviderName();
  if (provider === '2factor') return Boolean(config.twoFactorSenderId);
  return provider === 'fast2sms';
};

export const sendOtpSms = async (phone, code) => {
  const provider = smsProviderName();
  if (provider === '2factor') return sendViaTwoFactor(phone, code);
  if (provider === 'fast2sms') return sendViaFast2Sms(phone, code);
  if (config.isProduction) throw new AppError('Mobile OTP is temporarily unavailable. Please use email.', 503);
  console.log(`[SMS disabled] OTP for ${phone}: ${code}`);
};

export const sendBroadcastSms = async (numbers, message) => {
  const list = numbers.map(local10);
  if (smsProviderName() === '2factor') {
    const { body, ok } = await twoFactorJson(`${TWOFACTOR}/${config.twoFactorApiKey}/ADDON_SERVICES/SEND/TSMS`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: config.twoFactorSenderId, To: list.join(','), Msg: message }).toString(),
    });
    return ok ? { ok: true, id: String(body.Details || '') } : { ok: false, error: String(body.Details || body.Status || 'SMS provider error') };
  }
  const url = new URL('https://www.fast2sms.com/dev/bulkV2');
  url.searchParams.set('route', 'q');
  url.searchParams.set('message', message);
  url.searchParams.set('numbers', list.join(','));
  url.searchParams.set('flash', '0');
  const res = await fetch(url, { headers: { authorization: config.fast2smsApiKey } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.return === false) return { ok: false, error: body?.message?.[0] || body?.message || `SMS provider error ${res.status}` };
  return { ok: true, id: body.request_id || '' };
};

export const smsBalance = async () => {
  if (smsProviderName() !== '2factor') return null;
  try {
    const { body, ok } = await twoFactorJson(`${TWOFACTOR}/${config.twoFactorApiKey}/BAL/SMS`);
    return ok ? { credits: Number(body.Details) || 0 } : { error: String(body.Details || 'Could not read balance') };
  } catch (error) {
    return { error: error.message };
  }
};
