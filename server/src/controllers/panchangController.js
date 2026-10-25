/**
 * GET /api/v1/panchang/today
 */
export const getTodaysPanchang = async (req, res, next) => {
  try {
    const todayPanchang = {
      date: new Date().toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      vikramSamvat: '2083 (कालयुक्त)',
      shakaSamvat: '1948',
      month: 'कार्तिक मास (Kartika)',
      paksha: 'शुक्ल पक्ष (Shukla Paksha)',
      tithi: 'त्रयोदशी (Trayodashi)',
      nakshatra: 'रोहिणी (Rohini)',
      yoga: 'सिद्धि योग (Siddhi Yoga)',
      karana: 'तैतिल (Taitila)',
      abhijitMuhurat: '11:45 AM - 12:35 PM',
      isAbhijitActiveNow: true,
      rahuKaal: '04:15 PM - 05:40 PM',
      sunrise: '06:18 AM',
      sunset: '05:54 PM',
      moonrise: '04:42 PM',
      auspiciousMessage:
        'अद्य शिव-पार्वती एवं महालक्ष्मी आराधना हेतु अत्यंत शुभ सिद्धि योग व्याप्त है। इस काल में किया गया संकल्प अक्षय फल प्रदान करता है।',
    };

    res.status(200).json({
      success: true,
      data: todayPanchang,
    });
  } catch (error) {
    next(error);
  }
};
