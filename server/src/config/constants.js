/**
 * VedRiti Sanctum - Business & Sacred Ritual Constants
 * Pure JavaScript Module
 */
export const VEDIC_CONSTANTS = {
  // Authentication & Static OTP
  STATIC_SACRED_OTP: '1080',
  STATIC_TEST_OTP_FALLBACK: '1234',
  OTP_EXPIRY_MINUTES: 10,
  WELCOME_PUNYA_POINTS: 1080,

  // Dakshina & Loyalty Redemption
  PUNYA_POINTS_REDEMPTION_THRESHOLD: 1080,
  PUNYA_POINTS_DISCOUNT_AMOUNT: 200, // ₹200 savings for 1080 points

  // Auspicious Coupons
  ACTIVE_COUPONS: {
    VEDA10: { code: 'VEDA10', discountPercent: 10, description: '10% Auspicious Vedic discount' },
    SHIVOHAM: { code: 'SHIVOHAM', discountPercent: 10, description: '10% Mahadev Anushthan blessings' },
    KASHI20: { code: 'KASHI20', discountPercent: 20, description: '20% Special Moksha Kshetra concession' },
  },

  // Booking & Reference Prefixes
  PREFIX_SANKALP: 'VR-SANKALP-',
  PREFIX_STORE_ORDER: 'VR-ORD-',
  PREFIX_KUNDLI: 'VR-KUNDLI-',

  // WhatsApp Business Concierge
  OFFICIAL_WHATSAPP: '+919876543210',
  ACHARYA_HELPLINE: '+91 98765 43210',

  // Consecrated Sacred Kshetras
  SACRED_KSHETRAS: [
    'Kashi Vishwanath (Varanasi)',
    'Shri Ram Janmabhoomi (Ayodhya)',
    'Har Ki Pauri & Ganga Tirtha (Haridwar)',
    'Mahakaleshwar Jyotirlinga (Ujjain)',
    'Sri Venkateswara Temple (Tirumala/Tirupati)',
    'Delhi-NCR Vedic Kendra (Noida)',
  ],
};
