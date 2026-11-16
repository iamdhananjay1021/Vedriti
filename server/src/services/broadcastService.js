import crypto from 'crypto';
import mongoose from 'mongoose';
import { config, isResendConfigured } from '../config/env.js';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { Order } from '../models/Order.js';
import { Broadcast, BroadcastDelivery, BroadcastTemplate, MARKETING_TYPES, Notification } from '../models/Broadcast.js';
import { isSmsEnabled } from './smsService.js';
import { normalizePhone } from '../utils/ids.js';

const EMAIL_BATCH_SIZE = 50;
const BATCH_DELAY_MS = 700;
const SMS_BATCH_SIZE = 100;
const MAX_RECIPIENTS = 50000;
const TICK_MS = Number(process.env.BROADCAST_TICK_MS) || 30000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isMarketing = (type) => MARKETING_TYPES.includes(type);

export const emailDailyLimit = () => Number(process.env.BROADCAST_EMAIL_DAILY_LIMIT || 0);

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const TEMPLATE_VARIABLES = ['name', 'firstName', 'email', 'phone', 'city'];

const varsFor = (recipient) => {
  const name = (recipient?.name || '').trim();
  return {
    name: name || 'Devotee',
    firstName: name ? name.split(/\s+/)[0] : 'Devotee',
    email: recipient?.email || '',
    phone: recipient?.phone || '',
    city: recipient?.city || '',
  };
};

const fillVars = (text, vars, escape) =>
  String(text || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => (key in vars ? (escape ? escapeHtml(vars[key]) : vars[key]) : match));

const signUnsubscribe = (userId) => crypto.createHmac('sha256', config.jwtSecret).update(`unsub:${userId}`).digest('hex').slice(0, 32);

export const verifyUnsubscribe = (userId, token) => {
  if (!mongoose.isValidObjectId(userId) || typeof token !== 'string') return false;
  const expected = Buffer.from(signUnsubscribe(userId));
  const actual = Buffer.from(token);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

export const unsubscribeUrl = (userId) => `${config.publicApiUrl}${config.apiPrefix}/unsubscribe?u=${userId}&t=${signUnsubscribe(userId)}`;

const safeUrl = (url) => (/^https?:\/\//i.test(url || '') ? url : '');

export const renderEmail = (broadcast, recipient, unsubUrl) => {
  const vars = varsFor(recipient);
  const subject = fillVars(broadcast.subject || broadcast.name, vars, false);
  const bodyText = fillVars(broadcast.body, vars, false);
  const paragraphs = fillVars(broadcast.body, vars, true)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;line-height:1.65;font-size:15px;color:#3F342C">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
  const cta = safeUrl(broadcast.ctaUrl);
  const ctaHtml =
    cta && broadcast.ctaLabel
      ? `<p style="margin:22px 0 4px"><a href="${escapeHtml(cta)}" style="background:#C65D24;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 26px;border-radius:999px;display:inline-block">${escapeHtml(broadcast.ctaLabel)}</a></p>`
      : '';
  const footer = unsubUrl
    ? `You are receiving this because you have a VedRit account. <a href="${escapeHtml(unsubUrl)}" style="color:#877B70">Unsubscribe</a> from announcements and offers.`
    : 'This is an important update about your VedRit account.';

  const html = `<!doctype html>
<html><body style="margin:0;background:#FAF6EE;font-family:Arial,Helvetica,sans-serif;color:#2A170F">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;border:1px solid #EBDDCB;overflow:hidden">
<tr><td align="center" style="background:linear-gradient(135deg,#E4702B,#8E2F12);padding:22px 20px">
<div style="width:52px;height:52px;line-height:52px;border-radius:26px;background:#FFFFFF22;border:2px solid #F3D27A;color:#FFF4D2;font-size:28px;display:inline-block">ॐ</div>
<div style="color:#FFFFFF;font-size:22px;font-weight:bold;margin-top:8px">VedRit</div>
</td></tr>
<tr><td style="padding:26px 26px 8px">
<h1 style="font-size:21px;margin:0 0 16px;color:#2A170F">${escapeHtml(subject)}</h1>
<p style="margin:0 0 14px;font-size:15px;color:#3F342C">Namaste ${escapeHtml(vars.firstName)},</p>
${paragraphs}${ctaHtml}
</td></tr>
<tr><td style="padding:18px 26px 24px;color:#877B70;font-size:12px;line-height:1.6;border-top:1px solid #F1E6D6">${footer}<br>VedRit • vedrit.in</td></tr>
</table></td></tr></table></body></html>`;

  const text = `Namaste ${vars.firstName},\n\n${bodyText}${cta && broadcast.ctaLabel ? `\n\n${broadcast.ctaLabel}: ${cta}` : ''}\n\n${unsubUrl ? `Unsubscribe: ${unsubUrl}` : 'VedRit'}`;
  return { subject, html, text };
};

export const renderSms = (broadcast, recipient) => {
  const base = broadcast.smsText?.trim() || `${broadcast.subject || broadcast.name}: ${broadcast.body}`;
  const text = fillVars(base, varsFor(recipient), false).replace(/\s+/g, ' ').trim();
  return text.length > 300 ? `${text.slice(0, 297)}...` : text;
};

export const renderInApp = (broadcast, recipient) => ({
  title: fillVars(broadcast.subject || broadcast.name, varsFor(recipient), false),
  body: fillVars(broadcast.body, varsFor(recipient), false),
});

const triState = (value) => (value === 'yes' ? true : value === 'no' ? false : null);

const userFilter = async (audience) => {
  const filter = { isBlocked: { $ne: true } };
  if (audience.mode === 'SEGMENT') {
    const cities = (audience.cities || []).map((c) => c.trim()).filter(Boolean);
    const states = (audience.states || []).map((s) => s.trim()).filter(Boolean);
    if (cities.length) filter.city = { $in: cities.map((c) => new RegExp(`^${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) };
    if (states.length) filter.state = { $in: states.map((s) => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) };
    if (audience.gender && audience.gender !== 'any') filter.gender = audience.gender;
    const profile = triState(audience.profileCompleted);
    if (profile !== null) filter.profileCompleted = profile;
    if (audience.joinedWithinDays > 0) filter.createdAt = { $gte: new Date(Date.now() - audience.joinedWithinDays * 86400000) };
    if (audience.inactiveForDays > 0) {
      const before = new Date(Date.now() - audience.inactiveForDays * 86400000);
      filter.$or = [{ lastLoginAt: { $lt: before } }, { lastLoginAt: { $exists: false } }, { lastLoginAt: null }];
    }
    const and = [];
    for (const [flag, Model] of [
      [triState(audience.hasBooking), Booking],
      [triState(audience.hasOrder), Order],
    ]) {
      if (flag === null) continue;
      const ids = await Model.distinct('user');
      and.push({ _id: flag ? { $in: ids } : { $nin: ids } });
    }
    if (and.length) filter.$and = and;
  }
  return filter;
};

const cleanList = (list) => [...new Set((list || []).map((v) => String(v).trim()).filter(Boolean))];

export const resolveRecipients = async (audience) => {
  const recipients = [];
  if (audience.mode === 'CUSTOM') {
    const emails = cleanList(audience.emails).map((e) => e.toLowerCase()).filter((e) => emailRegex.test(e));
    const phones = cleanList(audience.phones).map(normalizePhone).filter(Boolean);
    const phoneLocal = phones.map((p) => p.slice(-10));
    const users = await User.find({
      isBlocked: { $ne: true },
      $or: [{ email: { $in: emails } }, { phone: { $in: [...phones, ...phoneLocal] } }],
    })
      .select('name email phone city marketingOptOut')
      .lean();
    const seenEmails = new Set();
    const seenPhones = new Set();
    for (const u of users) {
      recipients.push({ user: u._id, name: u.name, email: u.email, phone: u.phone, city: u.city, optOut: Boolean(u.marketingOptOut) });
      if (u.email) seenEmails.add(u.email.toLowerCase());
      if (u.phone) seenPhones.add(u.phone.slice(-10));
    }
    for (const email of emails) if (!seenEmails.has(email)) recipients.push({ user: null, name: '', email, phone: '', city: '', optOut: false });
    for (const phone of phones) if (!seenPhones.has(phone.slice(-10))) recipients.push({ user: null, name: '', email: '', phone, city: '', optOut: false });
    return recipients;
  }

  const filter = await userFilter(audience);
  const cursor = User.find(filter).select('name email phone city marketingOptOut').limit(MAX_RECIPIENTS).lean().cursor();
  for await (const u of cursor) {
    recipients.push({ user: u._id, name: u.name, email: u.email, phone: u.phone, city: u.city, optOut: Boolean(u.marketingOptOut) });
  }
  return recipients;
};

export const audiencePreview = async (audience, type) => {
  const recipients = await resolveRecipients(audience);
  const marketing = isMarketing(type);
  const eligible = recipients.filter((r) => !(marketing && r.optOut));
  return {
    total: recipients.length,
    emailReachable: eligible.filter((r) => r.email && emailRegex.test(r.email)).length,
    smsReachable: eligible.filter((r) => normalizePhone(r.phone)).length,
    inAppReachable: eligible.filter((r) => r.user).length,
    optedOut: marketing ? recipients.length - eligible.length : 0,
    sample: recipients.slice(0, 5).map((r) => ({ name: r.name || '', email: r.email || '', phone: r.phone || '' })),
  };
};

const sendEmailBatch = async (items) => {
  if (!isResendConfigured()) {
    if (config.isProduction) throw Object.assign(new Error('Email provider (Resend) is not configured'), { fatal: true });
    for (const i of items) console.log(`[Broadcast email disabled] to ${i.to}: ${i.subject}`);
    return items.map(() => ({ ok: true, id: 'dev-log' }));
  }
  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
      'x-batch-validation': 'permissive',
    },
    body: JSON.stringify(
      items.map((i) => ({ from: config.emailFrom, to: [i.to], subject: i.subject, html: i.html, text: i.text, ...(i.headers ? { headers: i.headers } : {}) }))
    ),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 429) throw Object.assign(new Error('Resend rate limit reached'), { retry: true });
  if (!res.ok) {
    const message = body?.message || `Resend error ${res.status}`;
    if (res.status === 401 || res.status === 403) throw Object.assign(new Error(message), { fatal: true });
    return items.map(() => ({ ok: false, error: message }));
  }
  const failed = new Map((body.errors || []).map((e) => [e.index, e.message || 'Rejected by provider']));
  const ids = (body.data || []).map((d) => d.id);
  let next = 0;
  return items.map((_, index) => (failed.has(index) ? { ok: false, error: failed.get(index) } : { ok: true, id: ids[next++] || '' }));
};

export const sendTestEmail = async (to, broadcast) => {
  const sample = { name: 'Test Devotee', email: to, phone: '', city: '' };
  const { subject, html, text } = renderEmail(broadcast, sample, isMarketing(broadcast.type) ? '#' : '');
  const [result] = await sendEmailBatch([{ to, subject: `[Test] ${subject}`, html, text }]);
  if (!result.ok) throw new Error(result.error || 'Could not send test email');
};

const sendSmsBatch = async (numbers, message) => {
  const url = new URL('https://www.fast2sms.com/dev/bulkV2');
  url.searchParams.set('route', 'q');
  url.searchParams.set('message', message);
  url.searchParams.set('numbers', numbers.map((n) => n.slice(-10)).join(','));
  url.searchParams.set('flash', '0');
  const res = await fetch(url, { headers: { authorization: config.fast2smsApiKey } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.return === false) return { ok: false, error: body?.message?.[0] || body?.message || `SMS provider error ${res.status}` };
  return { ok: true, id: body.request_id || '' };
};

export const smsStatus = () => ({
  enabled: isSmsEnabled(),
  note: isSmsEnabled() ? 'SMS provider connected' : 'SMS provider not configured yet. SMS messages are queued as pending and sent once it is connected.',
});

export const emailStatus = () => ({
  enabled: isResendConfigured(),
  dailyLimit: emailDailyLimit(),
  note: isResendConfigured() ? 'Email provider (Resend) connected' : 'Email provider not configured',
});

const insertDeliveries = async (docs) => {
  for (let i = 0; i < docs.length; i += 1000) {
    try {
      await BroadcastDelivery.insertMany(docs.slice(i, i + 1000), { ordered: false });
    } catch (error) {
      if (error.code !== 11000 && !error.writeErrors) throw error;
    }
  }
};

export const launchBroadcast = async (id) => {
  const broadcast = await Broadcast.findById(id);
  if (!broadcast || !['DRAFT', 'SCHEDULED'].includes(broadcast.status)) return broadcast;

  broadcast.status = 'SENDING';
  broadcast.startedAt = new Date();
  broadcast.pausedReason = '';
  await broadcast.save();

  const recipients = await resolveRecipients(broadcast.audience);
  const marketing = isMarketing(broadcast.type);
  const docs = [];
  const inApp = [];

  for (const r of recipients) {
    const skipped = marketing && r.optOut ? 'Unsubscribed' : '';
    for (const channel of broadcast.channels) {
      let to = '';
      let reason = skipped;
      if (channel === 'EMAIL') {
        to = (r.email || '').toLowerCase();
        if (!reason && !emailRegex.test(to)) reason = 'No valid email';
      } else if (channel === 'SMS') {
        to = normalizePhone(r.phone) || '';
        if (!reason && !to) reason = 'No valid mobile number';
      } else {
        to = r.user ? String(r.user) : '';
        if (!reason && !to) reason = 'Not a registered user';
      }
      if (!to) to = `none:${channel}:${docs.length}`;
      const doc = { broadcast: broadcast._id, user: r.user || null, channel, to, name: r.name || '', status: reason ? 'SKIPPED' : 'PENDING', error: reason };
      if (channel === 'INAPP' && !reason) {
        const content = renderInApp(broadcast, r);
        inApp.push({
          user: r.user,
          broadcast: broadcast._id,
          type: broadcast.type,
          title: content.title,
          body: content.body,
          ctaLabel: broadcast.ctaLabel,
          ctaUrl: broadcast.ctaUrl,
        });
        doc.status = 'SENT';
        doc.sentAt = new Date();
      }
      docs.push(doc);
    }
  }

  await insertDeliveries(docs);
  for (let i = 0; i < inApp.length; i += 1000) {
    try {
      await Notification.insertMany(inApp.slice(i, i + 1000), { ordered: false });
    } catch (error) {
      if (error.code !== 11000 && !error.writeErrors) throw error;
    }
  }

  broadcast.recipientCount = recipients.length;
  await broadcast.save();
  await processBroadcast(broadcast._id);
  return Broadcast.findById(id);
};

const sentTodayCount = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return BroadcastDelivery.countDocuments({ channel: 'EMAIL', status: 'SENT', sentAt: { $gte: start } });
};

const processEmails = async (broadcast) => {
  const limit = emailDailyLimit();
  let remaining = limit > 0 ? Math.max(0, limit - (await sentTodayCount())) : Infinity;

  while (true) {
    const fresh = await Broadcast.findById(broadcast._id).select('status');
    if (!fresh || fresh.status !== 'SENDING') return 'stopped';
    if (remaining <= 0) return 'limit';

    const take = Math.min(EMAIL_BATCH_SIZE, remaining === Infinity ? EMAIL_BATCH_SIZE : remaining);
    const pending = await BroadcastDelivery.find({ broadcast: broadcast._id, channel: 'EMAIL', status: 'PENDING' }).limit(take).lean();
    if (!pending.length) return 'done';

    const marketing = isMarketing(broadcast.type);
    const items = pending.map((d) => {
      const url = marketing && d.user ? unsubscribeUrl(d.user) : '';
      const rendered = renderEmail(broadcast, { name: d.name, email: d.to }, url);
      return {
        ...rendered,
        to: d.to,
        headers: url ? { 'List-Unsubscribe': `<${url}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } : undefined,
      };
    });

    let results;
    try {
      results = await sendEmailBatch(items);
    } catch (error) {
      if (error.fatal || error.retry) {
        await Broadcast.updateOne({ _id: broadcast._id }, { pausedReason: error.message });
        return 'paused';
      }
      results = items.map(() => ({ ok: false, error: error.message }));
    }

    const now = new Date();
    await BroadcastDelivery.bulkWrite(
      pending.map((d, i) => ({
        updateOne: {
          filter: { _id: d._id },
          update: results[i].ok
            ? { $set: { status: 'SENT', sentAt: now, providerId: results[i].id || '', error: '' } }
            : { $set: { status: 'FAILED', error: String(results[i].error || 'Failed').slice(0, 300) } },
        },
      }))
    );
    if (remaining !== Infinity) remaining -= pending.length;
    await sleep(BATCH_DELAY_MS);
  }
};

export const dispatchPendingSms = async (broadcastId) => {
  if (!isSmsEnabled()) return { sent: 0, failed: 0, enabled: false };
  const filter = { channel: 'SMS', status: 'PENDING', ...(broadcastId ? { broadcast: broadcastId } : {}) };
  let sent = 0;
  let failed = 0;
  while (true) {
    const pending = await BroadcastDelivery.find(filter).limit(SMS_BATCH_SIZE).lean();
    if (!pending.length) break;
    const byBroadcast = new Map();
    for (const d of pending) {
      const key = String(d.broadcast);
      if (!byBroadcast.has(key)) byBroadcast.set(key, []);
      byBroadcast.get(key).push(d);
    }
    for (const [key, group] of byBroadcast) {
      const broadcast = await Broadcast.findById(key).lean();
      if (!broadcast || broadcast.status === 'CANCELLED') {
        await BroadcastDelivery.updateMany({ _id: { $in: group.map((g) => g._id) } }, { status: 'SKIPPED', error: 'Cancelled' });
        continue;
      }
      const message = renderSms(broadcast, { name: '' });
      const result = await sendSmsBatch(group.map((g) => g.to), message);
      await BroadcastDelivery.updateMany(
        { _id: { $in: group.map((g) => g._id) } },
        result.ok
          ? { status: 'SENT', sentAt: new Date(), providerId: result.id || '', error: '' }
          : { status: 'FAILED', error: String(result.error).slice(0, 300) }
      );
      if (result.ok) sent += group.length;
      else failed += group.length;
    }
    await sleep(BATCH_DELAY_MS);
  }
  return { sent, failed, enabled: true };
};

export const processBroadcast = async (id) => {
  const broadcast = await Broadcast.findById(id);
  if (!broadcast || broadcast.status !== 'SENDING') return;

  let outcome = 'done';
  if (broadcast.channels.includes('EMAIL')) outcome = await processEmails(broadcast);
  if (outcome === 'stopped') return;

  if (broadcast.channels.includes('SMS') && isSmsEnabled()) await dispatchPendingSms(broadcast._id);

  if (outcome === 'limit') {
    await Broadcast.updateOne({ _id: id }, { pausedReason: `Daily email limit reached (${emailDailyLimit()}). Remaining emails will go out tomorrow.` });
    return;
  }
  if (outcome === 'paused') return;

  const smsPending = await BroadcastDelivery.countDocuments({ broadcast: id, channel: 'SMS', status: 'PENDING' });
  await Broadcast.updateOne(
    { _id: id },
    {
      status: 'COMPLETED',
      completedAt: new Date(),
      pausedReason: smsPending ? `${smsPending} SMS pending until the SMS provider is connected.` : '',
    }
  );
};

export const cancelBroadcast = async (id) => {
  const broadcast = await Broadcast.findById(id);
  if (!broadcast || !['SCHEDULED', 'SENDING', 'DRAFT'].includes(broadcast.status)) return broadcast;
  await BroadcastDelivery.updateMany({ broadcast: id, status: 'PENDING' }, { status: 'SKIPPED', error: 'Cancelled' });
  broadcast.status = 'CANCELLED';
  broadcast.pausedReason = '';
  await broadcast.save();
  return broadcast;
};

export const retryFailed = async (id) => {
  const broadcast = await Broadcast.findById(id);
  if (!broadcast) return null;
  const reset = await BroadcastDelivery.updateMany({ broadcast: id, status: 'FAILED' }, { status: 'PENDING', error: '' });
  if (reset.modifiedCount > 0) {
    broadcast.status = 'SENDING';
    broadcast.completedAt = null;
    broadcast.pausedReason = '';
    await broadcast.save();
  }
  return broadcast;
};

export const deliveryStats = async (ids) => {
  const rows = await BroadcastDelivery.aggregate([
    { $match: { broadcast: { $in: ids.map((i) => new mongoose.Types.ObjectId(String(i))) } } },
    { $group: { _id: { broadcast: '$broadcast', channel: '$channel', status: '$status' }, count: { $sum: 1 } } },
  ]);
  const stats = new Map();
  for (const row of rows) {
    const key = String(row._id.broadcast);
    if (!stats.has(key)) stats.set(key, {});
    const entry = stats.get(key);
    const channel = row._id.channel;
    if (!entry[channel]) entry[channel] = { PENDING: 0, SENT: 0, FAILED: 0, SKIPPED: 0 };
    entry[channel][row._id.status] = row.count;
  }
  return stats;
};

const DEFAULT_TEMPLATES = [
  {
    name: 'Festival greeting',
    type: 'FESTIVAL',
    subject: 'Warm wishes from VedRit',
    body: 'On this auspicious day, may Pandit Ji\'s blessings bring peace, health and prosperity to you and your family.\n\nBook a puja or send your kundli details through the VedRit app.',
    smsText: 'VedRit wishes {{firstName}} and family a blessed festival. Book your puja in the VedRit app.',
    ctaLabel: 'Open VedRit',
    ctaUrl: 'https://vedrit.in',
  },
  {
    name: 'Puja booking reminder',
    type: 'REMINDER',
    subject: 'Your puja is coming up',
    body: 'This is a reminder about your upcoming puja with Pandit Ji. Please keep your phone reachable and keep the puja space clean and ready.\n\nYou can see the details in the Account section of the app.',
    smsText: 'VedRit reminder: your puja with Pandit Ji is coming up. Check the app for details.',
    ctaLabel: '',
    ctaUrl: '',
  },
  {
    name: 'Puja kit offer',
    type: 'OFFER',
    subject: 'Special offer on puja kits',
    body: 'Get complete, carefully packed puja kits delivered to your door at a special price for a limited time.',
    smsText: 'VedRit offer: special price on puja kits for a limited time. Open the app to order.',
    ctaLabel: 'Shop puja kits',
    ctaUrl: 'https://vedrit.in',
  },
  {
    name: 'Pandit Ji availability notice',
    type: 'NOTICE',
    subject: 'Important notice about Pandit Ji\'s availability',
    body: 'Pandit Ji will not be available on the date mentioned. Please choose another available slot in the app. We are sorry for the inconvenience.',
    smsText: 'VedRit notice: Pandit Ji will be unavailable on the announced date. Please pick another slot in the app.',
    ctaLabel: '',
    ctaUrl: '',
  },
  {
    name: 'New feature announcement',
    type: 'ANNOUNCEMENT',
    subject: 'New on VedRit',
    body: 'We have added something new to the VedRit app to make your puja and guidance experience easier.\n\nUpdate the app from Google Play to try it.',
    smsText: 'New on VedRit: update the app from Google Play to try our latest feature.',
    ctaLabel: 'Learn more',
    ctaUrl: 'https://vedrit.in',
  },
];

export const ensureDefaultTemplates = async () => {
  if (await BroadcastTemplate.estimatedDocumentCount()) return;
  await BroadcastTemplate.insertMany(DEFAULT_TEMPLATES.map((t) => ({ ...t, isSystem: true })));
};

let running = false;

const tick = async () => {
  if (running || mongoose.connection.readyState !== 1) return;
  running = true;
  try {
    const due = await Broadcast.find({ status: 'SCHEDULED', scheduledAt: { $lte: new Date() } }).select('_id').lean();
    for (const b of due) await launchBroadcast(b._id);

    const active = await Broadcast.find({ status: 'SENDING' }).select('_id').lean();
    for (const b of active) await processBroadcast(b._id);

    if (isSmsEnabled()) await dispatchPendingSms();
  } catch (error) {
    console.error('[Broadcast worker]', error);
  } finally {
    running = false;
  }
};

export const startBroadcastWorker = () => {
  ensureDefaultTemplates().catch((error) => console.error('[Broadcast templates]', error));
  return setInterval(tick, TICK_MS);
};
