import crypto from 'crypto';
import { SankalpPatra } from '../models/SankalpPatra.js';
import { AppError } from '../middlewares/errorHandler.js';
import { isDatabaseConnected } from '../config/db.js';
import { inMemoryStore } from './inMemoryStore.js';

export class SankalpGeneratorService {
  /**
   * Generate an authentic Consecrated Vedic Sankalp Patra
   * @param {any} booking
   */
  static async generateForBooking(booking) {
    if (isDatabaseConnected()) {
      const existing = await SankalpPatra.findOne({ bookingId: booking.bookingId });
      if (existing) {
        return existing;
      }
    } else {
      const existing = inMemoryStore.sankalpPatras.get(booking.bookingId);
      if (existing) {
        return existing;
      }
    }

    const patraId = `VR-PATRA-${Math.floor(100000 + Math.random() * 900000)}`;

    // Cryptographic tamper-proof hash for QR verification
    const hashData = `${patraId}|${booking.bookingId}|${booking.devoteeName}|${booking.gotra}|${booking.date}`;
    const qrHash = crypto.createHash('sha256').update(hashData).digest('hex').substring(0, 32);

    const sanskritMantra =
      `ॐ अद्य ब्रह्मणोऽह्नि द्वितीयपरार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे युगे कलियुगे कलिप्रथमचरणे ` +
      `जम्बूद्वीपे भारतवर्षे आर्यावर्तैकदेशे पुण्यक्षेत्रे ` +
      `${booking.gotra} गोत्रोत्पन्नस्य ${booking.devoteeName} नामधेयस्य यजमानस्य ` +
      (booking.familyMembers && booking.familyMembers.length > 0
        ? `सपरिवारस्य (${booking.familyMembers.join(', ')}) `
        : '') +
      `सर्वाभीष्ट सिद्धये, श्री ${booking.pujaName} अनुष्ठान संकल्पः सम्पूर्णः भवतु ॥`;

    const patraData = {
      patraId,
      bookingId: booking.bookingId,
      devoteeName: booking.devoteeName,
      gotra: booking.gotra,
      familyMembers: booking.familyMembers,
      pujaName: booking.pujaName,
      sanskritSankalpMantra: sanskritMantra,
      acharyaName: 'Pt. Vidyadhar Shastri',
      acharyaTitle: 'वरिष्ठ वेदपाठी ज्योतिषाचार्य (Senior Vedacharya)',
      acharyaVidyapeeth: 'संपूर्णानंद संस्कृत विश्वविद्यालय (Sampurnanand Sanskrit Vishwavidyalaya, Kashi)',
      consecrationDate: booking.date,
      kshetra: 'Kashi Vishwanath Jyotirlinga Sanctum, Varanasi',
      qrHash,
      isVerified: true,
    };

    if (isDatabaseConnected()) {
      const patra = new SankalpPatra(patraData);
      await patra.save();
      booking.sankalpPatraId = patraId;
      if (typeof booking.save === 'function') {
        await booking.save();
      }
      return patra;
    } else {
      inMemoryStore.sankalpPatras.set(booking.bookingId, patraData);
      booking.sankalpPatraId = patraId;
      return patraData;
    }
  }

  /**
   * Verify authenticity of a digital Sankalp Patra via its QR Hash
   * @param {string} qrHash
   */
  static async verifyQrHash(qrHash) {
    if (isDatabaseConnected()) {
      const patra = await SankalpPatra.findOne({ qrHash });
      if (!patra) {
        throw new AppError('अमान्य संकल्प पत्र! यह प्रमाण पत्र काशी गर्भगृह रिकॉर्ड में नहीं पाया गया।', 404);
      }
      return patra;
    } else {
      for (const p of inMemoryStore.sankalpPatras.values()) {
        if (p.qrHash === qrHash) return p;
      }
      throw new AppError('अमान्य संकल्प पत्र! यह प्रमाण पत्र काशी गर्भगृह रिकॉर्ड में नहीं पाया गया।', 404);
    }
  }
}
