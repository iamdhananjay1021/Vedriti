import crypto from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateReference = (prefix) => {
  const bytes = crypto.randomBytes(6);
  let suffix = '';
  for (const byte of bytes) suffix += ALPHABET[byte % ALPHABET.length];
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `${prefix}${stamp}${suffix}`;
};

export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const normalizePhone = (input) => {
  const digits = String(input || '').replace(/\D/g, '');
  const local = digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return `+91${local}`;
};

export const sanitizeSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
