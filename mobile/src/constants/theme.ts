import { Platform } from 'react-native';

export const THEME = {
  colors: {
    // Rich Royal Vedic Foundation
    primaryBg: '#FAF6EE',
    parchment: '#FFFDF9',
    cardBg: '#FFFFFF',
    cardTranslucent: 'rgba(255, 255, 255, 0.94)',
    cardTranslucentDark: 'rgba(28, 18, 12, 0.92)',
    
    // Imperial Vedic Gold & Amber Palette
    gold: '#D4AF37',
    goldLight: '#F7E7B4',
    goldDark: '#996515',
    goldFoil: '#C59A3F',
    goldGlow: 'rgba(212, 175, 55, 0.25)',
    goldBorder: '#E6D2B2',
    goldBorderSoft: '#EFE3D0',
    
    // Royal Vermilion, Saffron & Crimson
    primarySaffron: '#C65D24',
    saffronBright: '#E36414',
    deepTerracotta: '#A7471B',
    royalVermilion: '#9E2A1A',
    royalCrimson: '#7E190D',
    softSaffronBg: '#FDF3E7',
    softPeach: '#FDF6EE',
    softAccentBg: '#F8E8D6',
    
    // Sanctum Dark & Text Palette
    heading: '#2A170F',
    headingDeep: '#1C0F0A',
    bodyText: '#594D44',
    mutedText: '#877B70',
    border: '#EBDDCB',
    borderLight: '#F3E9DD',
    overlayIvory: 'rgba(250, 246, 238, 0.45)',
    
    // Auspicious Green & Accents
    bilvaGreen: '#15803D',
    bilvaGreenLight: '#DCFCE7',
    bilvaGreenBorder: '#86EFAC',
    activeTab: '#C65D24',
    inactiveTab: '#877B70',
    
    // Royal Obsidian & Gradients Base
    obsidian: '#1A1009',
    sanctumMaroon: '#2B120C',
  },
  gradients: {
    royalGold: ['#F7E7B4', '#D4AF37', '#A0701D'] as const,
    goldSheen: ['#FFF8E7', '#F3D99E', '#E6BE6B'] as const,
    vermilionSunset: ['#D66628', '#A32F1A', '#6B1408'] as const,
    divineSanctum: ['#2E180E', '#1C0F0A', '#100704'] as const,
    softIvoryCard: ['#FFFFFF', '#FDFBF7', '#F7EFE3'] as const,
    emeraldAura: ['#16A34A', '#15803D', '#0F5128'] as const,
    sandalwoodWarm: ['#FAF4EB', '#F2E4D2', '#E8D2BB'] as const,
  },
  shadows: {
    royal: {
      shadowColor: '#382016',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    goldGlow: {
      shadowColor: '#D4AF37',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 5,
    },
    subtle: {
      shadowColor: '#382016',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 2,
    },
  },
  typography: {
    serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
    sansMedium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
    sansLight: Platform.select({ ios: 'System', android: 'sans-serif-light', default: 'System' }),
    letterSpacing: {
      tight: -0.3,
      normal: 0.1,
      wide: 0.5,
      royal: 0.8,
    },
  },
  brand: {
    name: 'VedRiti',
    tagline: 'Sanatan Sanskar & Divine Seva',
    subTagline: 'श्रद्धा • संकल्प • सिद्धि',
    location: 'Kashi Vishwanath Sanctum',
    experience: '25+ Years Certified Vedic Acharya Parishad',
    singlePanditTitle: 'आचार्य पं. विद्याधर शास्त्री (काशी पीठाधीश्वर)',
    phone: '+91 98765 43210',
    whatsapp: '9876543210',
    email: 'acharyaji@vedriti.com',
  },
  assets: {
    background: require('../../assets/images/app-background.png'),
    logoLotus: require('../../assets/images/logo-lotus.png'),
    heroKalash: require('../../assets/images/hero-kalash.png'),
    pujaGanesh: require('../../assets/images/puja-ganesh.png'),
    pujaGriha: require('../../assets/images/puja-griha.png'),
    pujaSatyanarayan: require('../../assets/images/puja-satyanarayan.png'),
    pujaRudra: require('../../assets/images/puja-rudra.png'),
    bannerKit: require('../../assets/images/banner-kit.png'),
    bannerKundli: require('../../assets/images/banner-kundli.png'),
  },
};
