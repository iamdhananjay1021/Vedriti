import { config } from '../config/env.js';

const isLocal = (url) => /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url);

export const startKeepAlive = () => {
  if (!config.isProduction || process.env.KEEP_ALIVE === 'off') return null;

  const base = (process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL || config.publicApiUrl || '').replace(/\/+$/, '');
  if (!base || isLocal(base)) return null;

  const url = `${base}${config.apiPrefix}/health`;
  const minutes = Math.min(14, Math.max(1, Number(process.env.KEEP_ALIVE_MINUTES) || 10));

  const ping = async () => {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'vedrit-keep-alive' }, signal: AbortSignal.timeout(20000) });
      if (!res.ok) console.warn(`[KeepAlive] ${url} answered ${res.status}`);
    } catch (error) {
      console.warn(`[KeepAlive] ping failed: ${error.message}`);
    }
  };

  setTimeout(ping, 60000).unref();
  const timer = setInterval(ping, minutes * 60000);
  console.log(`[KeepAlive] pinging ${url} every ${minutes} min`);
  return timer;
};
