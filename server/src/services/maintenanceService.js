import { Booking } from '../models/Booking.js';
import { Order } from '../models/Order.js';
import { releaseSlot } from './slotService.js';
import { refreshFromGateway } from './paymentService.js';
import { restock } from '../controllers/orderController.js';
import { nowInIst } from '../utils/time.js';
import { SlotHold } from '../models/SlotHold.js';

const expireUnpaidBookings = async () => {
  const expired = await Booking.find({
    paymentMethod: 'ONLINE',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    paymentExpiresAt: { $lt: new Date() },
  }).limit(200);
  for (const stale of expired) {
    const booking = await refreshFromGateway(stale);
    if (booking.paymentStatus === 'PAID') continue;
    booking.status = 'CANCELLED';
    booking.cancelledBy = 'SYSTEM';
    booking.cancelReason = 'Payment was not completed in time';
    await booking.save();
    await releaseSlot(booking._id);
  }
};

const expireUnpaidOrders = async () => {
  const expired = await Order.find({
    paymentMethod: 'ONLINE',
    paymentStatus: 'PENDING',
    status: 'PLACED',
    paymentExpiresAt: { $lt: new Date() },
  }).limit(200);
  for (const stale of expired) {
    const order = await refreshFromGateway(stale);
    if (order.paymentStatus === 'PAID') continue;
    order.status = 'CANCELLED';
    order.cancelReason = 'Payment was not completed in time';
    await order.save();
    await restock(order);
  }
};

const releasePastHolds = async () => {
  const { date } = nowInIst();
  await SlotHold.deleteMany({ date: { $lt: date } });
};

export const runMaintenance = async () => {
  try {
    await expireUnpaidBookings();
    await expireUnpaidOrders();
    await releasePastHolds();
  } catch (error) {
    console.error('[Maintenance] failed', error);
  }
};

export const startMaintenance = () => {
  runMaintenance();
  return setInterval(runMaintenance, 5 * 60 * 1000);
};
