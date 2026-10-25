export type LanguageCode = 'hi' | 'en' | 'sa';

export interface LanguageStrings {
  homeTab: string;
  pujasTab: string;
  darshanTab: string;
  storeTab: string;
  kundliTab: string;
  accountTab: string;
  chatTab: string;
  bookPuja: string;
  todayPanchang: string;
  liveDarshan: string;
  sankalpPatra: string;
  prasadTrack: string;
  vedicStore: string;
  login: string;
  logout: string;
  switchSanctum: string;
}

export const TRANSLATIONS: Record<LanguageCode, LanguageStrings> = {
  hi: {
    homeTab: 'वेदधाम',
    pujasTab: 'यज्ञ व पूजा',
    darshanTab: 'लाइव दर्शन',
    storeTab: 'सामग्री व रत्न',
    kundliTab: 'ज्योतिष',
    accountTab: 'संकल्प वॉल्ट',
    chatTab: 'वेदऋषि AI',
    bookPuja: 'पूजा संकल्प लें',
    todayPanchang: 'दैनिक वैदिक पंचांग',
    liveDarshan: '24x7 मंदिर दर्शन',
    sankalpPatra: 'प्रशस्ति पत्रम्',
    prasadTrack: 'पवित्र प्रसाद ट्रैकिंग',
    vedicStore: 'वैदिक दिव्य स्टोर',
    login: 'प्रवेश करें',
    logout: 'लॉगआउट',
    switchSanctum: 'पवित्र क्षेत्र बदलें',
  },
  en: {
    homeTab: 'Home',
    pujasTab: 'Pujas',
    darshanTab: 'Live Darshan',
    storeTab: 'Store',
    kundliTab: 'Kundli',
    accountTab: 'Sankalp Vault',
    chatTab: 'Vedic AI',
    bookPuja: 'Book Sacred Puja',
    todayPanchang: 'Daily Vedic Panchang',
    liveDarshan: '24x7 Temple Darshan',
    sankalpPatra: 'Sankalp Certificate',
    prasadTrack: 'Holy Prasad Tracker',
    vedicStore: 'Vedic Store',
    login: 'Sign In',
    logout: 'Log Out',
    switchSanctum: 'Switch Sanctum',
  },
  sa: {
    homeTab: 'वेदधाम',
    pujasTab: 'यज्ञानुष्ठानम्',
    darshanTab: 'प्रत्यक्षदर्शनम्',
    storeTab: 'दिव्यसामग्री',
    kundliTab: 'फलितज्योतिषम्',
    accountTab: 'संकल्पकोशः',
    chatTab: 'वेदऋषि AI',
    bookPuja: 'संकल्पं कुरु',
    todayPanchang: 'दैनन्दिनपञ्चाङ्गम्',
    liveDarshan: 'प्रत्यक्षदेवदर्शनम्',
    sankalpPatra: 'प्रशस्तिपत्रम्',
    prasadTrack: 'प्रसादप्रेषणम्',
    vedicStore: 'देवसामग्री',
    login: 'प्रविशतु',
    logout: 'निर्गच्छतु',
    switchSanctum: 'तीर्थक्षेत्रम्',
  },
};
