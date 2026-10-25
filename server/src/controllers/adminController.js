import { inMemoryStore } from '../services/inMemoryStore.js';
import { isDatabaseConnected } from '../config/db.js';
import { Booking } from '../models/Booking.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

// Pre-seeded realistic acharya payouts
const acharyaPayouts = [
  {
    id: 'ach-1',
    acharyaName: 'पं. विद्याधर शास्त्री (काशी)',
    vedicSpecialty: 'ऋग्वेद संहिता एवं रुद्राभिषेक मर्मज्ञ',
    completedPujasCount: 28,
    pendingDakshina: 18500,
    paidDakshina: 84000,
    bankAccount: 'SBI •••• 4812 (Varanasi Main)',
    status: 'Ready for Settlement',
  },
  {
    id: 'ach-2',
    acharyaName: 'पं. ओंकार नाथ दीक्षित (काशी)',
    vedicSpecialty: 'वास्तु शांति एवं नवग्रह महायज्ञ',
    completedPujasCount: 19,
    pendingDakshina: 12400,
    paidDakshina: 57000,
    bankAccount: 'HDFC •••• 9014 (Assi Ghat Br.)',
    status: 'Ready for Settlement',
  },
  {
    id: 'ach-3',
    acharyaName: 'पं. रामेश्वर त्रिपाठी (उज्जैन)',
    vedicSpecialty: 'कालसर्प एवं मंगल दोष शांति',
    completedPujasCount: 34,
    pendingDakshina: 0,
    paidDakshina: 102000,
    bankAccount: 'PNB •••• 2210 (Mahakal Marg)',
    status: 'Processed',
  },
];

/**
 * GET /api/v1/admin/stats
 */
export const getAdminStats = async (req, res, next) => {
  try {
    let bookingsCount = 0;
    let ordersCount = 0;
    let pendingBookings = 0;
    let totalRevenue = 482500;
    let totalStoreSales = 218900;

    if (isDatabaseConnected()) {
      bookingsCount = await Booking.countDocuments();
      ordersCount = await Order.countDocuments();
      pendingBookings = await Booking.countDocuments({ status: 'PENDING_SANKALP' });
    } else {
      bookingsCount = inMemoryStore.bookings.size + 4;
      ordersCount = inMemoryStore.orders.size + 3;
      pendingBookings = 2;
    }

    res.status(200).json({
      success: true,
      data: {
        totalDakshinaRevenue: totalRevenue,
        vedicStoreSales: totalStoreSales,
        totalBookings: bookingsCount,
        pendingBookingsCount: pendingBookings,
        activeAcharyasCount: 18,
        festiveSurgeActive: true,
        panchangSummary: 'कार्तिक कृष्ण त्रयोदशी • काशी संवत् २०८३',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/bookings
 */
export const getAdminBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const mockBookingsList = [
      {
        id: 'b-101',
        referenceNo: 'VR-SANKALP-9841',
        pujaTitle: 'श्री काशी विश्वनाथ महा रुद्राभिषेक',
        deity: 'Lord Shiva (Mahadev)',
        devoteeName: 'राहुल शर्मा',
        devoteePhone: '+91 98765 43210',
        gotra: 'कश्यप गोत्र',
        kuldevi: 'माता शाकंभरी देवी',
        city: 'वाराणसी (Varanasi)',
        bookingDate: '2026-11-01',
        muhuratTime: '06:30 AM (Brahma Muhurat)',
        packageType: 'Vedic Vidhi',
        dakshinaAmount: 2100,
        paymentStatus: 'Paid (UPI)',
        status: 'In Progress',
        assignedAcharya: 'पं. विद्याधर शास्त्री (काशी)',
        specialSankalp: 'स्वास्थ्य लाभ, गृह शांति एवं परिवार में सुख-समृद्धि हेतु विशेष संपुटित जप।',
        familyMembers: [
          { name: 'पूजा शर्मा', relation: 'धर्मपत्नी', gotra: 'कश्यप गोत्र', rashi: 'कर्क (Cancer)' },
          { name: 'आरव शर्मा', relation: 'पुत्र', gotra: 'कश्यप गोत्र', rashi: 'सिंह (Leo)' },
        ],
        sankalpPatraGenerated: true,
      },
      {
        id: 'b-102',
        referenceNo: 'VR-SANKALP-9842',
        pujaTitle: 'गृह प्रवेश एवं वास्तु शांति महायज्ञ',
        deity: 'वास्तु पुरुष एवं नवग्रह',
        devoteeName: 'आलोक बाजपेयी',
        devoteePhone: '+91 99887 76655',
        gotra: 'शांडिल्य गोत्र',
        kuldevi: 'माता विंध्यवासिनी देवी',
        city: 'कानपुर (Kanpur)',
        bookingDate: '2026-11-04',
        muhuratTime: '11:45 AM (Abhijit Muhurat)',
        packageType: 'Maha Anushthan',
        dakshinaAmount: 5100,
        paymentStatus: 'Paid (UPI)',
        status: 'Assigned',
        assignedAcharya: 'पं. ओंकार नाथ दीक्षित (काशी)',
        specialSankalp: 'नूतन भवन में स्थिर लक्ष्मी का वास एवं नकारात्मक ऊर्जा निवारण।',
        familyMembers: [
          { name: 'सुधा बाजपेयी', relation: 'धर्मपत्नी', gotra: 'शांडिल्य गोत्र', rashi: 'तुला (Libra)' },
        ],
        sankalpPatraGenerated: false,
      },
      {
        id: 'b-103',
        referenceNo: 'VR-SANKALP-9843',
        pujaTitle: 'दीपावली श्री महालक्ष्मी-कुबेर अष्टलक्ष्मी महायज्ञ',
        deity: 'माता महालक्ष्मी व कुबेर देव',
        devoteeName: 'प्रमोद कुमार सिंघानिया',
        devoteePhone: '+91 98234 56789',
        gotra: 'भारद्वाज गोत्र',
        kuldevi: 'माता महालक्ष्मी',
        city: 'मुम्बई (Mumbai)',
        bookingDate: '2026-10-31',
        muhuratTime: '06:15 PM (Pradosh Kaal)',
        packageType: 'Maha Anushthan',
        dakshinaAmount: 5100,
        paymentStatus: 'Paid (Card)',
        status: 'Pending Sankalp',
        specialSankalp: 'व्यापार वृद्धि एवं धनतेरस-दीपावली समृद्धि संकल्प।',
        familyMembers: [{ name: 'अनिता सिंघानिया', relation: 'धर्मपत्नी', gotra: 'भारद्वाज गोत्र' }],
        sankalpPatraGenerated: false,
      },
    ];

    let result = [...mockBookingsList];

    if (status && status !== 'All') {
      result = result.filter((b) => b.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.devoteeName.toLowerCase().includes(q) ||
          b.gotra.toLowerCase().includes(q) ||
          b.referenceNo.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/bookings/:id
 */
export const updateAdminBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedAcharya, status, sankalpPatraGenerated } = req.body;

    res.status(200).json({
      success: true,
      message: 'पूजा संकल्प अद्यतन संपन्न हुआ!',
      data: {
        id,
        assignedAcharya,
        status,
        sankalpPatraGenerated,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/orders
 */
export const getAdminOrders = async (req, res, next) => {
  try {
    const mockOrders = [
      {
        id: 'ord-501',
        orderNumber: 'VR-ORD-7721',
        devoteeName: 'राहुल शर्मा',
        devoteePhone: '+91 98765 43210',
        shippingAddress: 'House 108, Kashi Sanctum Marg, Varanasi, UP (221001)',
        items: [
          { name: 'नेपाली 5-मुखी सिद्ध रुद्राक्ष माला (108+1 मनके)', quantity: 1, price: 1499 },
          { name: '24K स्वर्ण पत्रित सिद्ध श्री यंत्र (6x6 inch)', quantity: 1, price: 1950 },
        ],
        totalAmount: 3449,
        paymentMethod: 'UPI (Instant)',
        status: 'Shipped',
        orderDate: '2026-10-23',
        awbNumber: 'BD-VR-90812341',
        courier: 'BlueDart Express Consecrated Courier',
      },
      {
        id: 'ord-502',
        orderNumber: 'VR-ORD-7722',
        devoteeName: 'आलोक बाजपेयी',
        devoteePhone: '+91 99887 76655',
        shippingAddress: 'Flat 402, Shivam Residency, Kanpur, UP (208001)',
        items: [
          { name: 'सम्पूर्ण गृह प्रवेश महायज्ञ किट (51 सामग्री)', quantity: 1, price: 1850 },
          { name: 'शुद्ध काशी विश्वनाथ गंगाजल कलश (500ml)', quantity: 2, price: 500 },
        ],
        totalAmount: 2350,
        paymentMethod: 'UPI (Instant)',
        status: 'Consecrated',
        orderDate: '2026-10-24',
        courier: 'BlueDart Air Sanctum Track',
      },
    ];

    res.status(200).json({
      success: true,
      count: mockOrders.length,
      data: mockOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/orders/:id
 */
export const updateAdminOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, awbNumber, courier } = req.body;

    res.status(200).json({
      success: true,
      message: 'ऑर्डर प्रेषण स्थिति अद्यतन हुई!',
      data: {
        id,
        status,
        awbNumber: awbNumber || `BD-VR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        courier: courier || 'BlueDart Holy Air Express',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/payouts
 */
export const getAdminPayouts = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      count: acharyaPayouts.length,
      data: acharyaPayouts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/payouts/:id/settle
 */
export const settleAdminPayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payout = acharyaPayouts.find((p) => p.id === id);
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Acharya payout record not found' });
    }

    payout.paidDakshina += payout.pendingDakshina;
    payout.pendingDakshina = 0;
    payout.status = 'Processed';

    res.status(200).json({
      success: true,
      message: 'आचार्य दक्षिणा सफलतापूर्वक Direct UPI / Bank Settlement द्वारा प्रेषित की गई!',
      data: payout,
    });
  } catch (error) {
    next(error);
  }
};
