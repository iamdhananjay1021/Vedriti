import { config } from '../config/env.js';

export const detectImageType = (buf) => {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 12 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
};

export const mediaUrl = (id) => `${config.publicApiUrl}${config.apiPrefix}/media/${id}`;

export const mediaIdFromUrl = (url) => {
  const match = /\/media\/([a-f0-9]{24})$/i.exec(String(url || ''));
  return match ? match[1] : null;
};
