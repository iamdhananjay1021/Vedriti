import { config, isResendConfigured } from '../config/env.js';
import { AppError } from '../middlewares/errorHandler.js';

const SUBJECTS = {
  login: 'Your VedRit login code',
  reset: 'Reset your VedRit password',
};

const INTROS = {
  login: 'Use this code to sign in to VedRit.',
  reset: 'Use this code to reset your VedRit password.',
};

const otpHtml = (code, purpose) => `<!doctype html>
<html><body style="margin:0;background:#FAF6EE;font-family:Arial,Helvetica,sans-serif;color:#2A170F">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:16px;border:1px solid #EBDDCB">
<tr><td align="center" style="padding:28px 24px 8px">
<div style="width:64px;height:64px;line-height:64px;border-radius:32px;background:#C65D24;color:#FFF8E7;font-size:36px">ॐ</div>
<h1 style="font-size:22px;margin:16px 0 4px">VedRit</h1>
<p style="margin:0;color:#594D44;font-size:14px">${INTROS[purpose]}</p>
</td></tr>
<tr><td align="center" style="padding:20px 24px">
<div style="font-size:34px;letter-spacing:10px;font-weight:bold;color:#C65D24">${code}</div>
<p style="color:#877B70;font-size:13px;margin:12px 0 0">This code expires in ${config.otpExpiryMinutes} minutes. Do not share it with anyone.</p>
</td></tr>
<tr><td align="center" style="padding:0 24px 24px;color:#877B70;font-size:12px">If you did not request this, you can ignore this email.</td></tr>
</table></td></tr></table></body></html>`;

export const sendOtpEmail = async (email, code, purpose) => {
  if (!isResendConfigured()) {
    if (config.isProduction) throw new AppError('Email login is temporarily unavailable. Please use mobile OTP.', 503);
    console.log(`[Email disabled] ${purpose} OTP for ${email}: ${code}`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.emailFrom,
      to: [email],
      subject: SUBJECTS[purpose],
      html: otpHtml(code, purpose),
      text: `${INTROS[purpose]} Your code is ${code}. It expires in ${config.otpExpiryMinutes} minutes.`,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error('[Resend] send failed', res.status, body);
    throw new AppError('Could not send the email right now. Please try again in a minute.', 502);
  }
};
