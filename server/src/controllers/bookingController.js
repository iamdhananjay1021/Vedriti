import { z } from 'zod';
import { Booking } from '../models/Booking.js';
import { Puja } from '../models/Puja.js';
import { VEDIC_CONSTANTS } from '../config/constants.js';
import { AppError } from '../middlewares/errorHandler.js';
import { SankalpGeneratorService } from '../services/sankalpGeneratorService.js';
import { WhatsAppNotificationService } from '../services/whatsappService.js';
import { isDatabaseConnected } from '../config/db.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

export const CreateBookingSchema = z.object({
  pujaId: z.string().optional(),
  pujaSlug: z.string().optional(),
  packageId: z.string().optional(),
  devoteeName: z.string().min(2, 'यजमान का नाम आवश्यक है'),
  gotra: z.string().min(2, 'गोत्र आवश्यक है'),
  phone: z.string().min(10, 'मान्य मोबाइल नंबर आवश्यक है'),
  familyMembers: z.array(z.string()).optional().default([]),
  date: z.string().min(4, 'शुभ तिथि आवश्यक है'),
  timeSlot: z.string().min(2, 'मुहूर्त समय आवश्यक है'),
  address: z.string().min(5, 'वितरण / संकल्प स्थान पता आवश्यक है'),
  pinCode: z.string().min(6, '6-अंकीय पिन कोड आवश्यक है'),
  usePunyaPoints: z.boolean().optional().default(false),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['UPI', 'CARD', 'NETBANKING', 'COD']).default('UPI'),
});

/**
 * POST /api/v1/bookings
 * Create new Vedic Puja Sankalp Booking
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      pujaId,
      pujaSlug,
      packageId,
      devoteeName,
      gotra,
      phone,
      familyMembers,
      date,
      timeSlot,
      address,
      pinCode,
      usePunyaPoints,
      couponCode,
      paymentMethod,
    } = req.body;

    // Look up puja
    let puja = null;
    if (isDatabaseConnected()) {
      if (pujaId) {
        puja = await Puja.findById(pujaId);
      } else if (pujaSlug) {
        puja = await Puja.findOne({ slug: pujaSlug });
      }
    } else {
      puja = inMemoryStore.pujas.find((p) => p._id === pujaId || p.slug === pujaSlug) || inMemoryStore.pujas[0];
    }

    const pujaName = puja ? puja.name : 'वैदिक महा अनुष्ठान (Vedic Sacred Ritual)';
    let basePrice = puja ? puja.startingPrice : 2100;
    let packageName = 'वैदिक विधि संपुटित (Standard Vedic Package)';

    // Package resolution
    if (puja && packageId && puja.packages) {
      const selectedPkg = puja.packages.find((p) => p.id === packageId);
      if (selectedPkg) {
        basePrice = selectedPkg.price;
        packageName = selectedPkg.name;
      }
    }

    // Punya Points deduction
    let punyaDiscount = 0;
    if (usePunyaPoints) {
      if (req.user && req.user.punyaPoints >= VEDIC_CONSTANTS.PUNYA_POINTS_REDEMPTION_THRESHOLD) {
        punyaDiscount = VEDIC_CONSTANTS.PUNYA_POINTS_DISCOUNT_AMOUNT;
        if (typeof req.user.save === 'function') {
          await req.user.save();
        }
      } else if (!req.user) {
        // Promotional deduction for first booking
        punyaDiscount = VEDIC_CONSTANTS.PUNYA_POINTS_DISCOUNT_AMOUNT;
      }
    }

    // Coupon code deduction
    let couponDiscount = 0;
    if (couponCode) {
      const cleanCode = couponCode.toUpperCase().trim();
      const validCoupon = VEDIC_CONSTANTS.ACTIVE_COUPONS[cleanCode];
      if (validCoupon) {
        couponDiscount = Math.round((basePrice * validCoupon.discountPercent) / 100);
      }
    }

    const finalDakshina = Math.max(0, basePrice - punyaDiscount - couponDiscount);
    const bookingId = `${VEDIC_CONSTANTS.PREFIX_SANKALP}${Math.floor(1000 + Math.random() * 9000)}`;

    const initialTimeline = [
      {
        stage: 'SANCTUM_CONSECRATION',
        title: 'गर्भगृह संकल्प पंजीकरण (Sankalp Registered)',
        description: 'काशी विश्वनाथ विद्वत परिषद् द्वारा आपका संकल्प गर्भगृह पंजिका में अंकित किया गया।',
        location: 'Kashi Vishwanath Sanctum, Varanasi',
        timestamp: new Date(),
        isCompleted: true,
      },
    ];

    const booking = new Booking({
      bookingId,
      user: req.userId ? req.userId : undefined,
      pujaId: puja ? puja._id : undefined,
      pujaName,
      packageName,
      devoteeName,
      gotra,
      phone,
      familyMembers,
      date,
      timeSlot,
      address,
      pinCode,
      basePrice,
      punyaDiscount,
      couponDiscount,
      couponCode,
      finalDakshina,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'POST_SANKALP_COD' : 'PENDING',
      sankalpStatus: 'REGISTERED',
      prasadTracking: {
        currentStage: 'SANCTUM_CONSECRATION',
        courierPartner: 'BlueDart Holy Express',
        awbNumber: `BD-VR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        estimatedDelivery: '3-4 Business Days',
        timeline: initialTimeline,
      },
    });

    if (isDatabaseConnected()) {
      await booking.save();
    } else {
      inMemoryStore.bookings.set(booking.bookingId, booking);
    }

    // Generate Consecrated Digital Sankalp Patra
    const patra = await SankalpGeneratorService.generateForBooking(booking);

    // Send WhatsApp notification
    await WhatsAppNotificationService.sendBookingVoucher(booking);

    res.status(201).json({
      success: true,
      message: 'वैदिक संकल्प सफलतापूर्वक पंजीकृत किया गया! ॐ',
      data: {
        bookingId: booking.bookingId,
        pujaName: booking.pujaName,
        packageName: booking.packageName,
        devoteeName: booking.devoteeName,
        gotra: booking.gotra,
        familyMembers: booking.familyMembers,
        date: booking.date,
        timeSlot: booking.timeSlot,
        finalDakshina: booking.finalDakshina,
        paymentStatus: booking.paymentStatus,
        patraId: patra.patraId,
        awbNumber: booking.prasadTracking.awbNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/:bookingId
 */
export const getBookingDetails = async (req, res, next) => {
  try {
    const bookingId = String(req.params.bookingId);
    let booking = null;

    if (isDatabaseConnected()) {
      booking = await Booking.findOne({ bookingId });
    } else {
      booking = inMemoryStore.bookings.get(bookingId);
    }

    if (!booking) {
      throw new AppError('बुकिंग संदर्भ नहीं मिला (Booking not found)', 404);
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/my-bookings
 */
export const getUserBookings = async (req, res, next) => {
  try {
    if (isDatabaseConnected()) {
      const filter = req.userId ? { user: req.userId } : { phone: req.user?.phone };
      const bookings = await Booking.find(filter).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } else {
      const bookings = Array.from(inMemoryStore.bookings.values());
      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/:bookingId/sankalp-patra
 */
export const getDigitalSankalpPatra = async (req, res, next) => {
  try {
    const bookingId = String(req.params.bookingId);
    let booking = null;
    if (isDatabaseConnected()) {
      booking = await Booking.findOne({ bookingId });
    } else {
      booking = inMemoryStore.bookings.get(bookingId);
    }

    if (!booking) {
      throw new AppError('बुकिंग संदर्भ नहीं मिला', 404);
    }

    const patra = await SankalpGeneratorService.generateForBooking(booking);

    res.status(200).json({
      success: true,
      data: patra,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/verify-patra/:qrHash
 * Public endpoint to verify Sankalp Patra via its QR Code hash
 */
export const verifySankalpQr = async (req, res, next) => {
  try {
    const qrHash = String(req.params.qrHash);
    const patra = await SankalpGeneratorService.verifyQrHash(qrHash);

    res.status(200).json({
      success: true,
      verified: true,
      message: 'सत्यापित वैदिक संकल्प पत्र (Official Consecrated Certificate Verified)',
      data: patra,
    });
  } catch (error) {
    next(error);
  }
};
