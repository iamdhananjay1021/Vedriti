import { z } from 'zod';
import mongoose from 'mongoose';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { Admin } from '../models/Admin.js';
import { User } from '../models/User.js';
import {
  BROADCAST_CHANNELS,
  BROADCAST_STATUSES,
  BROADCAST_TYPES,
  Broadcast,
  BroadcastDelivery,
  BroadcastTemplate,
  Notification,
} from '../models/Broadcast.js';
import {
  TEMPLATE_VARIABLES,
  audiencePreview,
  cancelBroadcast,
  deliveryStats,
  dispatchPendingSms,
  emailStatus,
  isMarketing,
  launchBroadcast,
  renderEmail,
  renderInApp,
  renderSms,
  retryFailed,
  sendTestEmail,
  smsStatus,
  verifyUnsubscribe,
} from '../services/broadcastService.js';

const ADMIN_ALIASES = { 'admin7084@gmail.com': 'adminved7084@gmail.com', 'adminved7084@gmail.com': 'admin7084@gmail.com' };

export const requireSuperAdmin = asyncHandler(async (req, res, next) => {
  const email = (req.adminEmail || '').toLowerCase();
  let admin = email ? await Admin.findOne({ email, isActive: true }).select('role email') : null;
  if (!admin && ADMIN_ALIASES[email]) admin = await Admin.findOne({ email: ADMIN_ALIASES[email], isActive: true }).select('role email');
  if (!admin || admin.role !== 'super_admin') throw new AppError('Only the super admin can manage broadcasts', 403);
  next();
});

const trimmed = (max) => z.string().trim().max(max);
const optionalUrl = z.union([z.literal(''), z.string().trim().url('Link must be a full URL starting with https://').max(400)]);

const TriState = z.enum(['any', 'yes', 'no']).default('any');

const AudienceSchema = z.object({
  mode: z.enum(['ALL', 'SEGMENT', 'CUSTOM']).default('ALL'),
  cities: z.array(trimmed(60)).max(50).default([]),
  states: z.array(trimmed(60)).max(40).default([]),
  gender: z.enum(['any', 'MALE', 'FEMALE', 'OTHER']).default('any'),
  profileCompleted: TriState,
  hasBooking: TriState,
  hasOrder: TriState,
  joinedWithinDays: z.coerce.number().int().min(0).max(3650).default(0),
  inactiveForDays: z.coerce.number().int().min(0).max(3650).default(0),
  emails: z.array(trimmed(120)).max(5000).default([]),
  phones: z.array(trimmed(20)).max(5000).default([]),
});

const ContentSchema = z.object({
  name: trimmed(120).min(2, 'Give the broadcast a name'),
  type: z.enum(BROADCAST_TYPES).default('ANNOUNCEMENT'),
  channels: z.array(z.enum(BROADCAST_CHANNELS)).min(1, 'Choose at least one channel').max(3),
  subject: trimmed(150).default(''),
  body: trimmed(5000).min(5, 'Write the message'),
  smsText: trimmed(320).default(''),
  ctaLabel: trimmed(40).default(''),
  ctaUrl: optionalUrl.default(''),
  audience: AudienceSchema.default({}),
});

const checkContent = (data, ctx) => {
  if (data.channels.includes('EMAIL') && !data.subject) ctx.addIssue({ code: 'custom', path: ['subject'], message: 'Email needs a subject' });
  if (data.ctaUrl && !data.ctaLabel) ctx.addIssue({ code: 'custom', path: ['ctaLabel'], message: 'Add a button label for the link' });
  if (data.audience.mode === 'CUSTOM' && !data.audience.emails.length && !data.audience.phones.length) {
    ctx.addIssue({ code: 'custom', path: ['audience'], message: 'Add at least one email or mobile number' });
  }
};

export const BroadcastInputSchema = ContentSchema.extend({
  schedule: z
    .object({ mode: z.enum(['draft', 'now', 'later']).default('draft'), at: z.string().optional() })
    .default({ mode: 'draft' }),
}).superRefine((data, ctx) => {
  checkContent(data, ctx);
  if (data.schedule.mode === 'later') {
    const at = new Date(data.schedule.at || '');
    if (Number.isNaN(at.getTime()) || at.getTime() < Date.now() + 60000) {
      ctx.addIssue({ code: 'custom', path: ['schedule'], message: 'Pick a time at least a minute from now' });
    }
  }
});

export const PreviewSchema = ContentSchema.partial({ name: true, channels: true }).extend({
  name: trimmed(120).default('Preview'),
  channels: z.array(z.enum(BROADCAST_CHANNELS)).default(['EMAIL']),
  body: trimmed(5000).default(''),
  audience: AudienceSchema.default({}),
});

export const AudiencePreviewSchema = z.object({ audience: AudienceSchema.default({}), type: z.enum(BROADCAST_TYPES).default('ANNOUNCEMENT') });

export const TemplateSchema = z.object({
  name: trimmed(80).min(2, 'Give the template a name'),
  type: z.enum(BROADCAST_TYPES).default('ANNOUNCEMENT'),
  subject: trimmed(150).default(''),
  body: trimmed(5000).min(5, 'Write the message'),
  smsText: trimmed(320).default(''),
  ctaLabel: trimmed(40).default(''),
  ctaUrl: optionalUrl.default(''),
});

const requireId = (id, label = 'Broadcast') => {
  if (!mongoose.isValidObjectId(id)) throw new AppError(`${label} not found`, 404);
};

const withStats = async (items) => {
  const stats = await deliveryStats(items.map((b) => b._id));
  return items.map((b) => ({ ...b.toObject(), id: String(b._id), stats: stats.get(String(b._id)) || {} }));
};

export const getStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { email: emailStatus(), sms: smsStatus(), variables: TEMPLATE_VARIABLES, types: BROADCAST_TYPES, statuses: BROADCAST_STATUSES } });
});

export const listBroadcasts = asyncHandler(async (req, res) => {
  const filter = {};
  if (BROADCAST_STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (BROADCAST_TYPES.includes(req.query.type)) filter.type = req.query.type;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 20;
  const [items, total] = await Promise.all([
    Broadcast.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Broadcast.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items: await withStats(items), total, page, pages: Math.max(1, Math.ceil(total / limit)) } });
});

export const getBroadcast = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  const broadcast = await Broadcast.findById(req.params.id);
  if (!broadcast) throw new AppError('Broadcast not found', 404);
  const [[item], problems] = await Promise.all([
    withStats([broadcast]),
    BroadcastDelivery.find({ broadcast: broadcast._id, status: { $in: ['FAILED', 'SKIPPED'] } })
      .sort({ updatedAt: -1 })
      .limit(60)
      .select('channel to name status error')
      .lean(),
  ]);
  res.json({
    success: true,
    data: { ...item, problems: problems.map((p) => ({ channel: p.channel, to: p.to.startsWith('none:') ? '' : p.to, name: p.name, status: p.status, error: p.error })) },
  });
});

const buildDoc = (data, adminEmail) => ({
  name: data.name,
  type: data.type,
  channels: [...new Set(data.channels)],
  subject: data.subject,
  body: data.body,
  smsText: data.smsText,
  ctaLabel: data.ctaLabel,
  ctaUrl: data.ctaUrl,
  audience: data.audience,
  createdBy: adminEmail,
});

export const createBroadcast = asyncHandler(async (req, res) => {
  const data = req.body;
  const doc = buildDoc(data, req.adminEmail || '');
  if (data.schedule.mode === 'later') {
    doc.status = 'SCHEDULED';
    doc.scheduledAt = new Date(data.schedule.at);
  }
  const broadcast = await Broadcast.create(doc);
  if (data.schedule.mode === 'now') {
    launchBroadcast(broadcast._id).catch((error) => console.error('[Broadcast launch]', error));
  }
  const fresh = await Broadcast.findById(broadcast._id);
  const [item] = await withStats([fresh]);
  res.status(201).json({ success: true, data: item });
});

export const updateBroadcast = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  const broadcast = await Broadcast.findById(req.params.id);
  if (!broadcast) throw new AppError('Broadcast not found', 404);
  if (!['DRAFT', 'SCHEDULED'].includes(broadcast.status)) throw new AppError('Only drafts and scheduled broadcasts can be edited', 409);
  const data = req.body;
  broadcast.set(buildDoc(data, broadcast.createdBy));
  if (data.schedule.mode === 'later') {
    broadcast.status = 'SCHEDULED';
    broadcast.scheduledAt = new Date(data.schedule.at);
  } else {
    broadcast.status = 'DRAFT';
    broadcast.scheduledAt = null;
  }
  await broadcast.save();
  if (data.schedule.mode === 'now') launchBroadcast(broadcast._id).catch((error) => console.error('[Broadcast launch]', error));
  const [item] = await withStats([await Broadcast.findById(broadcast._id)]);
  res.json({ success: true, data: item });
});

export const sendNow = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  const broadcast = await Broadcast.findById(req.params.id);
  if (!broadcast) throw new AppError('Broadcast not found', 404);
  if (!['DRAFT', 'SCHEDULED'].includes(broadcast.status)) throw new AppError('This broadcast has already been sent or cancelled', 409);
  launchBroadcast(broadcast._id).catch((error) => console.error('[Broadcast launch]', error));
  res.json({ success: true, message: 'Sending started' });
});

export const cancel = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  const broadcast = await cancelBroadcast(req.params.id);
  if (!broadcast) throw new AppError('Broadcast not found', 404);
  res.json({ success: true, data: { id: String(broadcast._id), status: broadcast.status } });
});

export const retry = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  const broadcast = await retryFailed(req.params.id);
  if (!broadcast) throw new AppError('Broadcast not found', 404);
  res.json({ success: true, message: 'Retrying failed messages' });
});

export const sendPendingSms = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  const result = await dispatchPendingSms(req.params.id);
  if (!result.enabled) throw new AppError('SMS provider is not configured yet. Messages stay pending until it is connected.', 409);
  res.json({ success: true, data: result });
});

export const removeBroadcast = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  const broadcast = await Broadcast.findById(req.params.id);
  if (!broadcast) throw new AppError('Broadcast not found', 404);
  if (broadcast.status === 'SENDING') throw new AppError('Cancel the broadcast before deleting it', 409);
  await Promise.all([
    BroadcastDelivery.deleteMany({ broadcast: broadcast._id }),
    Notification.deleteMany({ broadcast: broadcast._id }),
    broadcast.deleteOne(),
  ]);
  res.json({ success: true, message: 'Broadcast deleted' });
});

export const previewBroadcast = asyncHandler(async (req, res) => {
  const data = req.body;
  const sample = { name: 'Ramesh Sharma', email: 'ramesh@example.com', phone: '+919999999999', city: 'Varanasi' };
  const email = renderEmail({ ...data, subject: data.subject || data.name }, sample, isMarketing(data.type) ? '#' : '');
  res.json({ success: true, data: { email, sms: renderSms(data, sample), inApp: renderInApp({ ...data, subject: data.subject || data.name }, sample) } });
});

export const testBroadcast = asyncHandler(async (req, res) => {
  const to = (req.adminEmail || '').toLowerCase();
  if (!to) throw new AppError('Your admin account has no email to send a test to', 400);
  await sendTestEmail(to, { ...req.body, subject: req.body.subject || req.body.name });
  res.json({ success: true, message: `Test email sent to ${to}` });
});

export const previewAudience = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await audiencePreview(req.body.audience, req.body.type) });
});

export const listTemplates = asyncHandler(async (req, res) => {
  const items = await BroadcastTemplate.find().sort({ isSystem: -1, createdAt: 1 });
  res.json({ success: true, data: items.map((t) => ({ ...t.toObject(), id: String(t._id) })) });
});

export const createTemplate = asyncHandler(async (req, res) => {
  const t = await BroadcastTemplate.create(req.body);
  res.status(201).json({ success: true, data: { ...t.toObject(), id: String(t._id) } });
});

export const updateTemplate = asyncHandler(async (req, res) => {
  requireId(req.params.id, 'Template');
  const t = await BroadcastTemplate.findById(req.params.id);
  if (!t) throw new AppError('Template not found', 404);
  t.set(req.body);
  await t.save();
  res.json({ success: true, data: { ...t.toObject(), id: String(t._id) } });
});

export const removeTemplate = asyncHandler(async (req, res) => {
  requireId(req.params.id, 'Template');
  const t = await BroadcastTemplate.findById(req.params.id);
  if (!t) throw new AppError('Template not found', 404);
  await t.deleteOne();
  res.json({ success: true, message: 'Template deleted' });
});

export const listMyNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 30));
  const [items, unread] = await Promise.all([
    Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(limit).lean(),
    Notification.countDocuments({ user: req.userId, readAt: null }),
  ]);
  res.json({
    success: true,
    data: {
      unreadCount: unread,
      items: items.map((n) => ({
        id: String(n._id),
        type: n.type,
        title: n.title,
        body: n.body,
        ctaLabel: n.ctaLabel,
        ctaUrl: n.ctaUrl,
        read: Boolean(n.readAt),
        createdAt: n.createdAt,
      })),
    },
  });
});

export const markNotificationsRead = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((id) => mongoose.isValidObjectId(id)) : null;
  const filter = { user: req.userId, readAt: null, ...(ids ? { _id: { $in: ids } } : {}) };
  await Notification.updateMany(filter, { readAt: new Date() });
  res.json({ success: true });
});

const unsubscribePage = (title, message) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#FAF6EE;font-family:Arial,Helvetica,sans-serif;color:#2A170F;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px">
<div style="max-width:420px;background:#fff;border:1px solid #EBDDCB;border-radius:18px;padding:28px;text-align:center">
<div style="width:54px;height:54px;line-height:54px;border-radius:27px;background:#C65D24;color:#FFF4D2;font-size:30px;margin:0 auto 12px">ॐ</div>
<h1 style="font-size:20px;margin:0 0 10px">${title}</h1><p style="margin:0;color:#594D44;line-height:1.6">${message}</p></div></body></html>`;

export const unsubscribe = asyncHandler(async (req, res) => {
  const { u, t } = req.query;
  res.type('html');
  if (!verifyUnsubscribe(String(u || ''), String(t || ''))) {
    return res.status(400).send(unsubscribePage('Link not valid', 'This unsubscribe link is invalid or has expired.'));
  }
  await User.updateOne({ _id: u }, { marketingOptOut: true });
  res.send(unsubscribePage('You are unsubscribed', 'You will no longer receive announcements and offers from VedRit by email. Important account and booking updates may still be sent.'));
});

export const unsubscribePost = unsubscribe;
