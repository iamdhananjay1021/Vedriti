import { Linking, Alert } from 'react-native';
import { THEME } from '../constants/theme';

export interface WhatsAppBookingPayload {
  bookingId: string;
  pujaName: string;
  devoteeName: string;
  gotra: string;
  date: string;
  timeSlot: string;
  amount: number;
  paymentMethod: string;
  address?: string;
  familyMembers?: string[];
}

export interface WhatsAppOrderPayload {
  orderId: string;
  itemName: string;
  devoteeName: string;
  amount: number;
  address: string;
  phone: string;
}

/**
 * VedRiti WhatsApp Business Integration Service
 * Anchored to Pandit Ji / Acharya Parishad WhatsApp: +91 98765 43210
 */
class WhatsAppService {
  private businessPhone: string = THEME.brand.whatsapp;

  /**
   * Open WhatsApp with a pre-composed message
   */
  async openWhatsApp(message: string): Promise<boolean> {
    try {
      const encodedMsg = encodeURIComponent(message);
      const url = `whatsapp://send?phone=${this.businessPhone}&text=${encodedMsg}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        // Fallback to web WhatsApp if app is not installed
        const webUrl = `https://wa.me/${this.businessPhone}?text=${encodedMsg}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      Alert.alert(
        'WhatsApp Concierge',
        `Could not open WhatsApp. Please contact Acharya Ji directly at ${THEME.brand.phone}.`
      );
      return false;
    }
  }

  /**
   * Direct Acharya Live Chat on WhatsApp
   */
  async chatWithAcharya(topic: string = 'General Guidance'): Promise<boolean> {
    const text = 
`🙏 *प्रणाम आचार्य जी (VedRiti Vedic Sanctum)*

मुझे *${topic}* के संदर्भ में श्लोक, शुभ मुहूर्त एवं अनुष्ठान संकल्प की मार्गदर्शन सेवा चाहिए।

कृपया शुभ समय पर परामर्श प्रदान करें।
हर हर महादेव! ॐ`;

    return this.openWhatsApp(text);
  }

  /**
   * Send Puja Booking Confirmation & Sankalp Voucher via WhatsApp
   */
  async sendBookingConfirmation(payload: WhatsAppBookingPayload): Promise<boolean> {
    const familyLine = payload.familyMembers && payload.familyMembers.length > 0
      ? `\n👨‍👩‍👦 *संकल्प में सम्मिलित परिवार:* ${payload.familyMembers.join(', ')}`
      : '';

    const text = 
`🕉️ *वेदरीति - वैदिक संकल्प रसीद (VEDRITI SANCTUM)* 🕉️
━━━━━━━━━━━━━━━━━━━━
📜 *बुकिंग संदर्भ:* #${payload.bookingId}
🌺 *अनुष्ठान:* ${payload.pujaName}
👤 *यजमान:* ${payload.devoteeName}
🌿 *गोत्र:* ${payload.gotra}${familyLine}
📅 *शुभ तिथि:* ${payload.date}
⏰ *मुहूर्त समय:* ${payload.timeSlot}
📍 *स्थान:* ${payload.address || 'Devotee Altar / Residence'}
💳 *दक्षिणा राशि:* ₹${payload.amount.toLocaleString('en-IN')} (${payload.paymentMethod})
━━━━━━━━━━━━━━━━━━━━
✨ *आचार्य संकल्प:*
काशी विश्वनाथ विद्वत परिषद् द्वारा आपका संकल्प गर्भगृह में उच्चारित किया जाएगा। 

📦 *पवित्र प्रसाद ट्रैकिंग:* 
https://vedriti.com/track/${payload.bookingId}

_श्रद्धा • संकल्प • सिद्धि_
हरि ॐ तत्सत् 🙏`;

    return this.openWhatsApp(text);
  }

  /**
   * Send Consecrated Samagri Order Voucher via WhatsApp
   */
  async sendOrderConfirmation(payload: WhatsAppOrderPayload): Promise<boolean> {
    const text = 
`📦 *वेदरीति दिव्य सामग्री आदेश (VEDRITI STORE)*
━━━━━━━━━━━━━━━━━━━━
🛍️ *ऑर्डर संदर्भ:* #${payload.orderId}
📦 *सामग्री:* ${payload.itemName}
👤 *प्राप्तकर्ता:* ${payload.devoteeName}
📍 *वितरण पता:* ${payload.address}
💰 *कुल राशि:* ₹${payload.amount.toLocaleString('en-IN')}
🚚 *कुरियर पार्टनर:* Bluedart Express Air (100% Consecrated)
━━━━━━━━━━━━━━━━━━━━
गंगाजल, भस्म एवं कलावा से अभिमंत्रित करके आपका पार्सल शीघ्र प्रेषित किया जा रहा है।

_शुभम भवतु!_ 🙏`;

    return this.openWhatsApp(text);
  }

  /**
   * Send Kundli Consultation Details to Acharya WhatsApp
   */
  async sendKundliConsultation(
    name: string,
    dob: string,
    tob: string,
    pob: string,
    query: string
  ): Promise<boolean> {
    const text = 
`🌟 *वेदरीति ज्योतिष परामर्श अनुरोध (VEDIC JYOTISH)*
━━━━━━━━━━━━━━━━━━━━
👤 *नाम:* ${name}
📅 *जन्म तिथि:* ${dob}
⏰ *जन्म समय:* ${tob}
📍 *जन्म स्थान:* ${pob}
❓ *जिज्ञासा / प्रश्न:* ${query}
━━━━━━━━━━━━━━━━━━━━
आचार्य जी, कृपया गोचर ग्रह स्थिति एवं महादशा चक्र का विश्लेषण कर मार्गदर्शन प्रदान करें। 🙏`;

    return this.openWhatsApp(text);
  }
}

export const whatsappService = new WhatsAppService();
