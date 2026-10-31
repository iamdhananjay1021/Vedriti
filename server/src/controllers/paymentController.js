import { z } from 'zod';
import { config } from '../config/env.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import {
  REFERENCE_MODELS,
  attachPaymentLink,
  markPaid,
  refreshFromGateway,
  verifyCallbackSignature,
  verifyWebhookSignature,
} from '../services/paymentService.js';

export const PayNowSchema = z.object({
  type: z.enum(['booking', 'order', 'kundli']),
  reference: z.string().trim().min(4).max(40),
});

const APP_RETURN_URL = 'vedrit://payment';

const resultPage = (title, message, status) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#FAF6EE;color:#2A170F;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px}
.c{max-width:360px}.om{font-size:56px;color:#C65D24}h1{font-size:22px;margin:12px 0}p{color:#594D44}
a,button{display:inline-block;margin-top:16px;background:#C65D24;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;border:0;font-size:15px}
.s{background:#fff;color:#C65D24;border:1px solid #C65D24}</style></head>
<body><div class="c"><div class="om">ॐ</div><h1>${title}</h1><p>${message}</p>
<a href="${APP_RETURN_URL}?status=${status}">Return to VedRit app</a></div>
<script>setTimeout(function(){location.href='${APP_RETURN_URL}?status=${status}'},1500)</script></body></html>`;

const findOwned = async (type, reference, userId) => {
  const { model, idField } = REFERENCE_MODELS[type];
  const doc = await model.findOne({ [idField]: reference, user: userId });
  if (!doc) throw new AppError('Record not found', 404);
  return doc;
};

export const payNow = asyncHandler(async (req, res) => {
  const { type, reference } = req.body;
  let doc = await findOwned(type, reference, req.userId);
  doc = await refreshFromGateway(doc);
  if (doc.paymentStatus === 'PAID') throw new AppError('Payment is already completed', 400);
  if (doc.paymentStatus === 'REFUNDED') throw new AppError('This payment was refunded', 400);
  if (['CANCELLED', 'CLOSED', 'COMPLETED'].includes(doc.status)) throw new AppError('This request is no longer active', 400);
  const amount = type === 'order' ? doc.totalAmount : doc.amount;
  const link = await attachPaymentLink(type, doc, {
    amount,
    customer: { name: doc.devoteeName || doc.name || req.user.name, phone: doc.phone || doc.contactPhone, email: req.user.email },
    description: `VedRit ${type} ${reference}`,
  });
  res.json({ success: true, data: { paymentUrl: link.url } });
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { type, reference } = PayNowSchema.parse(req.params);
  const doc = await refreshFromGateway(await findOwned(type, reference, req.userId));
  res.json({ success: true, data: { paymentStatus: doc.paymentStatus, status: doc.status } });
});

export const paymentCallback = asyncHandler(async (req, res) => {
  const q = req.query;
  const params = {
    linkId: String(q.razorpay_payment_link_id || ''),
    referenceId: String(q.razorpay_payment_link_reference_id || ''),
    status: String(q.razorpay_payment_link_status || ''),
    paymentId: String(q.razorpay_payment_id || ''),
    signature: String(q.razorpay_signature || ''),
  };
  if (params.status === 'paid' && verifyCallbackSignature(params)) {
    await markPaid(params.linkId, params.paymentId);
    return res.send(resultPage('Payment successful', 'Thank you! Your payment is confirmed. Pandit Ji has received your request.', 'paid'));
  }
  res.send(resultPage('Payment not completed', 'Your payment was not completed. You can retry from the app.', 'failed'));
});

export const paymentWebhook = asyncHandler(async (req, res) => {
  if (!verifyWebhookSignature(req.rawBody, req.headers['x-razorpay-signature'])) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }
  const event = req.body?.event;
  if (event === 'payment_link.paid') {
    const link = req.body.payload?.payment_link?.entity;
    const payment = req.body.payload?.payment?.entity;
    if (link?.id) await markPaid(link.id, payment?.id);
  }
  res.json({ success: true });
});

export const mockPaymentPage = asyncHandler(async (req, res) => {
  if (config.isProduction) throw new AppError('Not found', 404);
  const linkId = req.params.linkId;
  res.send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Test Payment</title>
<style>body{font-family:system-ui;background:#FAF6EE;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center}
button{background:#C65D24;color:#fff;border:0;padding:14px 28px;border-radius:999px;font-size:16px;margin:8px}.s{background:#999}</style></head>
<body><div><h2>Test payment (development)</h2><p>No real money is charged.</p>
<form method="post" action="${linkId}/pay"><button>Pay successfully</button></form>
<a href="${APP_RETURN_URL}?status=failed"><button class="s">Cancel</button></a></div></body></html>`);
});

export const mockPaymentPay = asyncHandler(async (req, res) => {
  if (config.isProduction) throw new AppError('Not found', 404);
  const result = await markPaid(req.params.linkId, `pay_mock_${Date.now()}`);
  if (!result) throw new AppError('Payment link not found', 404);
  res.send(resultPage('Payment successful', 'Test payment completed.', 'paid'));
});
