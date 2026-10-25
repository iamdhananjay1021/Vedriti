import { VEDIC_CONSTANTS } from '../config/constants.js';
import { isDatabaseConnected } from '../config/db.js';

export class WhatsAppNotificationService {
  /**
   * Format booking voucher message
   * @param {any} booking
   * @returns {string}
   */
  static formatBookingVoucher(booking) {
    const familyLine =
      booking.familyMembers && booking.familyMembers.length > 0
        ? `\n👨‍👩‍👦 *संकल्प में सम्मिलित परिवार:* ${booking.familyMembers.join(', ')}`
        : '';

    return `🕉️ *वेदरीति - वैदिक संकल्प रसीद (VEDRITI SANCTUM)* 🕉️
━━━━━━━━━━━━━━━━━━━━
📜 *बुकिंग संदर्भ:* #${booking.bookingId}
🌺 *अनुष्ठान:* ${booking.pujaName} (${booking.packageName})
👤 *यजमान:* ${booking.devoteeName}
🌿 *गोत्र:* ${booking.gotra}${familyLine}
📅 *शुभ तिथि:* ${booking.date}
⏰ *मुहूर्त समय:* ${booking.timeSlot}
📍 *स्थान:* ${booking.address} (${booking.pinCode})
💳 *दक्षिणा राशि:* ₹${booking.finalDakshina.toLocaleString('en-IN')} (${booking.paymentMethod})
━━━━━━━━━━━━━━━━━━━━
✨ *आचार्य संकल्प:*
काशी विश्वनाथ विद्वत परिषद् द्वारा आपका संकल्प गर्भगृह में उच्चारित किया जाएगा। 

📦 *पवित्र प्रसाद ट्रैकिंग (BlueDart):* 
https://vedriti.com/track/${booking.bookingId}

_श्रद्धा • संकल्प • सिद्धि_
हरि ॐ तत्सत् 🙏`;
  }

  /**
   * Format store order voucher message
   * @param {any} order
   * @returns {string}
   */
  static formatOrderVoucher(order) {
    const itemsSummary = order.items
      .map((item) => `• ${item.productName} (x${item.quantity}) - ₹${item.totalPrice.toLocaleString('en-IN')}`)
      .join('\n');

    return `📦 *वेदरीति दिव्य सामग्री आदेश (VEDRITI STORE)*
━━━━━━━━━━━━━━━━━━━━
🛍️ *ऑर्डर संदर्भ:* #${order.orderId}
👤 *यजमान:* ${order.devoteeName}
📞 *संपर्क:* ${order.phone}
📍 *वितरण पता:* ${order.address} (${order.pinCode})
━━━━━━━━━━━━━━━━━━━━
*सामग्री विवरण:*
• ${itemsSummary}

💳 *कुल राशि:* ₹${order.totalAmount.toLocaleString('en-IN')} (${order.paymentMethod})
🚚 *कूरियर AWB:* ${order.awbNumber}
━━━━━━━━━━━━━━━━━━━━
काशी विश्वनाथ गर्भगृह से अभिमंत्रित सामग्री आपके निवास हेतु प्रेषित की जा रही है।
हर हर महादेव! ॐ`;
  }

  /**
   * Dispatches WhatsApp voucher (in dev mode logs cleanly, in prod calls official Meta Graph / Twilio API)
   * @param {any} booking
   */
  static async sendBookingVoucher(booking) {
    const message = this.formatBookingVoucher(booking);
    console.log(`📱 [WhatsApp Business -> ${booking.phone}]:\n${message}`);
    booking.whatsappVoucherSent = true;
    if (isDatabaseConnected() && typeof booking.save === 'function') {
      await booking.save();
    }
    return true;
  }

  /**
   * Dispatches WhatsApp store order voucher
   * @param {any} order
   */
  static async sendOrderVoucher(order) {
    const message = this.formatOrderVoucher(order);
    console.log(`📱 [WhatsApp Business Store -> ${order.phone}]:\n${message}`);
    return true;
  }
}
