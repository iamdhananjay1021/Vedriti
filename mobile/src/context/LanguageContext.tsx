import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export type Language = 'hi' | 'en';

export interface Translations {
  // Tabs
  tabHome: string;
  tabPujas: string;
  tabStore: string;
  tabKundli: string;
  tabAccount: string;

  // Header & Search
  searchPlaceholder: string;
  myBookings: string;
  yourProfile: string;

  // Quick Actions
  qaMandir: string;
  qaMandirSub: string;
  qaJapa: string;
  qaJapaSub: string;
  qaPuja: string;
  qaPujaSub: string;
  qaPandit: string;
  qaPanditSub: string;
  qaKundli: string;
  qaKundliSub: string;
  qaRashifal: string;
  qaRashifalSub: string;
  qaAarti: string;
  qaAartiSub: string;
  qaStore: string;
  qaStoreSub: string;

  // Panchang Card
  panchangTitle: string;
  abhijitMuhurat: string;
  rahuKaal: string;
  viewChoghadiya: string;
  hideChoghadiya: string;

  // Acharya Profile
  acharyaTitle: string;
  experienceYears: string;
  bookConsultation: string;
  whatsappInquiry: string;

  // Vrats & Festivals
  vratsTitle: string;
  vratsSub: string;
  daysRemaining: string;
  fastingVidhi: string;

  // Store & Popular Pujas
  popularPujasTitle: string;
  popularPujasSub: string;
  pujaKitsTitle: string;
  pujaKitsSub: string;
  seeAll: string;
  fromPrice: string;

  // Support & Testimonials
  testimonialsTitle: string;
  testimonialsSub: string;
  needHelpTitle: string;
  needHelpSub: string;
  callPanditJi: string;
  messageWhatsApp: string;

  // Kundli
  kundliHeaderTitle: string;
  kundliHeaderSub: string;
  chooseConsultation: string;
  birthDetails: string;
  yourQuestions: string;
  sendToPanditJi: string;
  autoFillProfile: string;

  // Common
  loading: string;
  retry: string;
  share: string;
  free: string;
}

const DICTIONARY: Record<Language, Translations> = {
  hi: {
    tabHome: 'होम',
    tabPujas: 'पूजाएं',
    tabStore: 'स्टोर',
    tabKundli: 'कुंडली',
    tabAccount: 'प्रोफ़ाइल',

    searchPlaceholder: 'पूजा, देवता या सामग्री खोजें...',
    myBookings: 'मेरी बुकिंग्स',
    yourProfile: 'आपकी प्रोफ़ाइल',

    qaMandir: 'दैनिक मंदिर',
    qaMandirSub: 'दीप प्रज्ज्वलन',
    qaJapa: 'रुद्राक्ष माला',
    qaJapaSub: '108 मन्त्र जप',
    qaPuja: 'पूजा बुकिंग',
    qaPujaSub: 'ऑनलाइन / घर पर',
    qaPandit: 'पंडित परामर्श',
    qaPanditSub: 'फोन / वीडियो कॉल',
    qaKundli: 'जन्म कुंडली',
    qaKundliSub: 'दोष व उपाय',
    qaRashifal: 'दैनिक राशिफल',
    qaRashifalSub: '12 राशियां',
    qaAarti: 'आरती संग्रह',
    qaAartiSub: 'चालीसा व स्तुति',
    qaStore: 'पूजा सामग्री',
    qaStoreSub: 'शुद्ध किट व हवन',

    panchangTitle: 'दैनिक वैदिक पंचांग',
    abhijitMuhurat: 'अभिजीत मुहूर्त (शुभ)',
    rahuKaal: 'राहुकाल (त्याज्य)',
    viewChoghadiya: 'चौघड़िया व विस्तृत मुहूर्त देखें',
    hideChoghadiya: 'संक्षिप्त विवरण',

    acharyaTitle: 'वैदिक आचार्य • ज्योतिष',
    experienceYears: '20+ वर्ष का वैदिक अनुभव',
    bookConsultation: 'परामर्श बुक करें',
    whatsappInquiry: 'व्हाट्सएप पर पूछें',

    vratsTitle: 'आगामी पावन व्रत व त्योहार',
    vratsSub: 'शुभ तिथियां, व्रत विधि व पुण्य फल',
    daysRemaining: 'दिन शेष',
    fastingVidhi: 'व्रत विधि',

    popularPujasTitle: 'मुख्य वैदिक पूजाएं',
    popularPujasSub: 'विद्वान आचार्यों द्वारा विधि-विधान से',
    pujaKitsTitle: 'पूजन सामग्री एवं प्रामाणिक किट',
    pujaKitsSub: 'शुद्ध सामग्री सीधे आपके द्वार',
    seeAll: 'सभी देखें',
    fromPrice: 'प्रारंभिक',

    testimonialsTitle: 'यजमान अनुभव व विश्वास',
    testimonialsSub: 'प्रमाणित वैदिक पूजा व संकल्प की संतुष्टि',
    needHelpTitle: 'पूजा चयन में सहायता चाहिए?',
    needHelpSub: 'शुभ मुहूर्त, संकल्प व सामग्री के लिए आचार्य जी से पूछें।',
    callPanditJi: 'कॉल करें',
    messageWhatsApp: 'व्हाट्सएप',

    kundliHeaderTitle: 'कुंडली एवं ज्योतिष',
    kundliHeaderSub: 'आचार्य जी द्वारा जन्मपत्री परामर्श',
    chooseConsultation: 'परामर्श का प्रकार चुनें',
    birthDetails: 'जन्म विवरण',
    yourQuestions: 'आपका प्रश्न एवं संपर्क',
    sendToPanditJi: 'आचार्य जी को विवरण भेजें',
    autoFillProfile: 'मेरी प्रोफ़ाइल का जन्म विवरण स्वतः भरें',

    loading: 'लोड हो रहा है...',
    retry: 'पुनः प्रयास करें',
    share: 'शेयर',
    free: 'निःशुल्क',
  },
  en: {
    tabHome: 'Home',
    tabPujas: 'Pujas',
    tabStore: 'Store',
    tabKundli: 'Kundli',
    tabAccount: 'Profile',

    searchPlaceholder: 'Search pujas, deities or kits...',
    myBookings: 'My Bookings',
    yourProfile: 'Your Profile',

    qaMandir: 'Daily Mandir',
    qaMandirSub: 'Diya & Darshan',
    qaJapa: 'Rudraksha Mala',
    qaJapaSub: '108 Japa Sadhana',
    qaPuja: 'Book Puja',
    qaPujaSub: 'Online / At Home',
    qaPandit: 'Talk to Pandit',
    qaPanditSub: 'Phone / Video Call',
    qaKundli: 'Janam Kundli',
    qaKundliSub: 'Dosha & Remedies',
    qaRashifal: 'Daily Horoscope',
    qaRashifalSub: '12 Rashis',
    qaAarti: 'Aarti Sangrah',
    qaAartiSub: 'Chalisa & Stuti',
    qaStore: 'Puja Store',
    qaStoreSub: 'Pure Kits & Samagri',

    panchangTitle: 'Daily Vedic Panchang',
    abhijitMuhurat: 'Abhijit Muhurat (Shubh)',
    rahuKaal: 'Rahu Kaal (Avoid)',
    viewChoghadiya: 'View Day Choghadiya & Details',
    hideChoghadiya: 'Brief View',

    acharyaTitle: 'Vedic Acharya • Jyotish',
    experienceYears: '20+ Years Vedic Experience',
    bookConsultation: 'Book Consultation',
    whatsappInquiry: 'WhatsApp Inquiry',

    vratsTitle: 'Upcoming Sacred Fasts & Festivals',
    vratsSub: 'Auspicious dates, fasting rituals & blessings',
    daysRemaining: 'days left',
    fastingVidhi: 'Fasting Ritual',

    popularPujasTitle: 'Core Vedic Pujas',
    popularPujasSub: 'Performed strictly with Vedic rituals',
    pujaKitsTitle: 'Puja Kits & Samagri',
    pujaKitsSub: 'Pure spiritual essentials delivered home',
    seeAll: 'See all',
    fromPrice: 'From',

    testimonialsTitle: 'Devotee Experiences & Trust',
    testimonialsSub: 'Verified ritual proofs and devotee satisfaction',
    needHelpTitle: 'Need guidance choosing a puja?',
    needHelpSub: 'Ask Pandit Ji about muhurat, sankalpa or samagri.',
    callPanditJi: 'Call Pandit Ji',
    messageWhatsApp: 'WhatsApp',

    kundliHeaderTitle: 'Kundli & Astrology',
    kundliHeaderSub: 'Personal birth chart review by Acharya Ji',
    chooseConsultation: 'Choose Consultation',
    birthDetails: 'Birth Details',
    yourQuestions: 'Your Question & Contact',
    sendToPanditJi: 'Send Details to Acharya Ji',
    autoFillProfile: 'Auto-fill from saved profile details',

    loading: 'Loading...',
    retry: 'Retry',
    share: 'Share',
    free: 'Free',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'hi',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: DICTIONARY.hi,
});

const STORAGE_KEY = 'vedrit_app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('hi');

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'hi' || saved === 'en') {
          setLanguageState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    SecureStore.setItemAsync(STORAGE_KEY, lang).catch(() => {});
  };

  const toggleLanguage = () => {
    const next = language === 'hi' ? 'en' : 'hi';
    setLanguage(next);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: DICTIONARY[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

