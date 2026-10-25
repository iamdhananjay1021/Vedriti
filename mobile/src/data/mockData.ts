import { THEME } from '../constants/theme';

export interface PujaPackage {
  id: 'pandit-only' | 'pandit-samagri';
  name: string;
  price: number;
  tagline: string;
  samagriIncluded: boolean;
  features: string[];
}

export interface Puja {
  id: string;
  name: string;
  subtitle: string;
  sanskritMantra?: string;
  startingPrice: number;
  duration: string;
  category: string;
  deity?: string;
  rating?: number;
  reviewsCount?: number;
  templeLocation?: string;
  suitableOccasions: string[];
  image: any;
  description: string;
  significance: string;
  items: string[];
  occasionTag?: string;
  whatIsIncluded: {
    panditServices: string;
    guidance: string;
    samagriDetails: string;
    instructions: string;
  };
  preparationSteps: string[];
  packages: {
    panditOnly: PujaPackage;
    panditWithSamagri: PujaPackage;
  };
}

export interface PujaKit {
  id: string;
  name: string;
  tagline: string;
  category?: 'Hawan Kits' | 'Rudraksha' | 'Yantras' | 'Gangajal & Dhoop';
  price: number;
  originalPrice: number;
  image: any;
  itemsCount: number;
  description: string;
  itemsIncluded: string[];
  inStock: boolean;
  certified?: boolean;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
}

export interface Occasion {
  id: string;
  title: string;
  subtitle: string;
  filterTag: string;
  iconName: string;
}

export interface UserBooking {
  id: string;
  pujaName: string;
  date: string;
  timeSlot: string;
  status: 'Confirmed' | 'Completed' | 'Pending';
  amount: number;
  location: string;
  panditJi: string;
  packageType?: string;
  sankalpPatraAvailable?: boolean;
  prasadTrackingId?: string;
}

export interface KundliReport {
  id: string;
  devoteeName: string;
  dob: string;
  tob: string;
  pob: string;
  status: 'Ready' | 'Reviewing';
  query: string;
  date: string;
  rashi?: string;
  nakshatra?: string;
  mangalDosha?: 'Low' | 'Medium' | 'High' | 'None';
  recommendation?: string;
}

// Enterprise Vedic Features:
export interface PanchangData {
  tithi: string;
  tithiEnd: string;
  paksha: string;
  nakshatra: string;
  nakshatraEnd: string;
  yoga: string;
  karana: string;
  abhijitMuhurat: string;
  isAbhijitActive: boolean;
  rahuKaal: string;
  brahmaMuhurat: string;
  sunrise: string;
  sunset: string;
  auspiciousMessage: string;
}

export interface LiveTempleDarshan {
  id: string;
  templeName: string;
  deity: string;
  city: string;
  liveViewers: number;
  currentAarti: string;
  nextAarti: string;
  timing: string;
  tagline: string;
  bgGradient: readonly [string, string, string];
  availableOfferings: {
    id: string;
    name: string;
    price: number;
    icon: string;
  }[];
}

export interface VedicStotram {
  id: string;
  title: string;
  deity: string;
  sanskritLine: string;
  meaning: string;
  duration: string;
  recommendedCount: number;
}

export interface CertifiedAcharya {
  id: string;
  name: string;
  title: string;
  pedigree: string;
  experienceYears: number;
  vedicSpecialty: string;
  mantraDiksha: string;
  rating: number;
  totalPujas: number;
}

export interface PrasadTrackingStage {
  step: number;
  title: string;
  subtext: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface DevoteeSankalpRecord {
  bookingId: string;
  pujaName: string;
  devoteeName: string;
  gotra: string;
  kuldevi: string;
  birthNakshatra: string;
  acharyaName: string;
  vedicSealDate: string;
  templeGarbhagriha: string;
  courierPartner: string;
  awbNumber: string;
  estimatedDelivery: string;
  stages: PrasadTrackingStage[];
}

export const TODAYS_PANCHANG: PanchangData = {
  tithi: 'Shukla Trayodashi',
  tithiEnd: 'Ends at 03:42 PM',
  paksha: 'Shukla Paksha (Kartik)',
  nakshatra: 'Rohini Nakshatra',
  nakshatraEnd: 'Until 06:15 PM',
  yoga: 'Harshana Yoga',
  karana: 'Kaulava',
  abhijitMuhurat: '11:45 AM – 12:35 PM',
  isAbhijitActive: true,
  rahuKaal: '04:15 PM – 05:40 PM',
  brahmaMuhurat: '04:22 AM – 05:10 AM',
  sunrise: '06:21 AM',
  sunset: '05:54 PM',
  auspiciousMessage: 'Highly auspicious day for Rudrabhishek, Griha Pravesh & Mahalakshmi Yajan.',
};

export const LIVE_DARSHAN_TEMPLES: LiveTempleDarshan[] = [
  {
    id: 'kashi-vishwanath',
    templeName: 'Kashi Vishwanath Jyotirlinga',
    deity: 'Lord Shiva (Mahadev)',
    city: 'Varanasi (Kashi Dham)',
    liveViewers: 18450,
    currentAarti: 'Bhog & Shringar Darshan Live',
    nextAarti: 'Sapta Rishi Aarti at 07:00 PM',
    timing: 'Live 24x7 Direct Stream',
    tagline: 'Moksha Daayini Kashi Kshetra • Consecrated Live',
    bgGradient: ['#2E180E', '#7E190D', '#1C0F0A'],
    availableOfferings: [
      { id: 'gangajal', name: 'Ganga Jal Abhishek', price: 151, icon: 'Droplets' },
      { id: 'belpatra', name: '108 Belpatra Mala', price: 251, icon: 'Leaf' },
      { id: 'rudraksha-archan', name: 'Rudraksha Archana', price: 501, icon: 'Sparkles' },
    ],
  },
  {
    id: 'mahakaleshwar-ujjain',
    templeName: 'Shri Mahakaleshwar Jyotirlinga',
    deity: 'Lord Mahakal',
    city: 'Ujjain (Avantika Puri)',
    liveViewers: 24200,
    currentAarti: 'Sandhya Aarti Darshan Live',
    nextAarti: 'Shayan Aarti at 10:30 PM',
    timing: 'Dakshinabhimukhi Sacred Sanctum',
    tagline: 'Kaal Haro Maha Kaal • Instant Protection & Abhaya',
    bgGradient: ['#1C120C', '#4A1D0E', '#100704'],
    availableOfferings: [
      { id: 'bhasma', name: 'Bhasma Arpan Sankalp', price: 201, icon: 'Flame' },
      { id: 'dhatura', name: 'Dhatura & Bilva Offering', price: 251, icon: 'Sparkles' },
      { id: 'rudra-path', name: 'Laghurudra Path', price: 1100, icon: 'Landmark' },
    ],
  },
  {
    id: 'ayodhya-ram-mandir',
    templeName: 'Shri Ram Janmabhoomi Mandir',
    deity: 'Ram Lalla Virajman',
    city: 'Ayodhya Dham',
    liveViewers: 32900,
    currentAarti: 'Rajbhog Aarti Live',
    nextAarti: 'Sandhya Aarti at 06:30 PM',
    timing: 'Divya Mandir Darshan',
    tagline: 'Dharmik Punarutthan • Raghupati Raghav Raja Ram',
    bgGradient: ['#5E260A', '#9E2A1A', '#240D05'],
    availableOfferings: [
      { id: 'pushpa', name: 'Tulsi & Lotus Arpan', price: 151, icon: 'Heart' },
      { id: 'bhog', name: 'Makhan Mishri Bhog', price: 351, icon: 'Gift' },
      { id: 'chadhawa', name: 'Charnamrit & Pavitra Prasad Box', price: 551, icon: 'ShoppingBag' },
    ],
  },
  {
    id: 'tirupati-balaji',
    templeName: 'Tirupati Sri Venkateswara',
    deity: 'Lord Balaji (Govinda)',
    city: 'Tirumala Hills',
    liveViewers: 21600,
    currentAarti: 'Kalyanotsavam Darshan',
    nextAarti: 'Ekanta Seva at 09:45 PM',
    timing: 'Ananda Nilayam Divine Shrine',
    tagline: 'Kaliyuga Varada • Everlasting Prosperity & Wealth',
    bgGradient: ['#2A1D0D', '#8C6718', '#1A1208'],
    availableOfferings: [
      { id: 'laddu', name: 'Srivari Laddu Prasadam', price: 301, icon: 'Gift' },
      { id: 'kumkum', name: 'Ashtottara Kumkum Archana', price: 501, icon: 'Sparkles' },
    ],
  },
];

export const VEDIC_STOTRAMS: VedicStotram[] = [
  {
    id: 'mrityunjaya',
    title: 'Maha Mrityunjaya Mantra',
    deity: 'Bhagwan Shiva',
    sanskritLine: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
    meaning: 'We worship the Three-eyed Lord Shiva who is fragrant and nourishes all beings. May he liberate us from death and samsara.',
    duration: '3:45',
    recommendedCount: 108,
  },
  {
    id: 'gayatri',
    title: 'Gayatri Mahamantra',
    deity: 'Mata Savitri & Surya',
    sanskritLine: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    meaning: 'We meditate on the supreme transcendental radiance of the Divine Sun. May it illuminate and inspire our intellect.',
    duration: '2:50',
    recommendedCount: 108,
  },
  {
    id: 'shree-suktam',
    title: 'Rigvediya Shree Suktam',
    deity: 'Mata Maha Lakshmi',
    sanskritLine: 'ॐ हिरण्यवर्णां हरिणीं सुवर्णरजतस्रजाम्। चन्द्रां हिरण्मयीं लक्ष्मीं जातवेदो म आवह॥',
    meaning: 'O Agni, invoke for me the Golden-hued Goddess Lakshmi who brings eternal abundance, joy and auspicious fortune.',
    duration: '5:20',
    recommendedCount: 16,
  },
  {
    id: 'hanuman-chalisa',
    title: 'Shri Hanuman Chalisa',
    deity: 'Sankat Mochan Hanuman',
    sanskritLine: 'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि। बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥',
    meaning: 'Purifying the mirror of my mind with the dust of the Guru’s lotus feet, I sing the unblemished glory of Lord Rama.',
    duration: '4:15',
    recommendedCount: 7,
  },
];

export const CERTIFIED_ACHARYAS: CertifiedAcharya[] = [
  {
    id: 'acharya-vidyadhar',
    name: 'आचार्य पं. विद्याधर शास्त्री',
    title: 'काशी विश्वनाथ पीठाधीश्वर व वेद वेदांग मर्मज्ञ',
    pedigree: 'Sampurnanand Sanskrit University, Varanasi (Gold Medalist)',
    experienceYears: 28,
    vedicSpecialty: 'Shukla Yajurveda & Vastu Shanti Vidhi',
    mantraDiksha: 'Kashi Shankara Parampara',
    rating: 4.98,
    totalPujas: 4850,
  },
  {
    id: 'acharya-rameshwar',
    name: 'ज्योतिषाचार्य पं. रामेश्वर द्विवेदी',
    title: 'फलित ज्योतिष व नवग्रह शान्ति विशेषज्ञ',
    pedigree: 'Banaras Hindu University (BHU Jyotish Vibhag)',
    experienceYears: 22,
    vedicSpecialty: 'Kundli Milan, Kaal Sarp & Shani Shanti',
    mantraDiksha: 'Ujjain Mahakal Tirtha',
    rating: 4.95,
    totalPujas: 3620,
  },
  {
    id: 'acharya-devendra',
    name: 'वैदिक कर्मकांडी पं. देवेन्द्र पाण्डेय',
    title: 'महामृत्युंजय व शतचंडी महायज्ञ पुरोहित',
    pedigree: 'Gurukul Kangri Vishwavidyalaya, Haridwar',
    experienceYears: 25,
    vedicSpecialty: 'Atharvaveda Homa & Pitra Dosh Nivaran',
    mantraDiksha: 'Haridwar Ganga Sabha',
    rating: 4.97,
    totalPujas: 4190,
  },
];

export const DEVOTEE_SANKALP_RECORD: DevoteeSankalpRecord = {
  bookingId: 'VR-90821',
  pujaName: 'Griha Pravesh & Vastu Shanti Mahayajan',
  devoteeName: 'Anand Sharma & Family',
  gotra: 'Kashyap Gotra',
  kuldevi: 'Mata Shakambhari Devi',
  birthNakshatra: 'Rohini Nakshatra, Vrishabha Rashi',
  acharyaName: 'आचार्य पं. विद्याधर शास्त्री (काशी)',
  vedicSealDate: '15 Oct 2026',
  templeGarbhagriha: 'Kashi Vishwanath Mandir Sanctum',
  courierPartner: 'Bluedart Express Priority Air',
  awbNumber: 'VR-BLUEDART-894210',
  estimatedDelivery: 'Tomorrow by 02:00 PM',
  stages: [
    {
      step: 1,
      title: 'Vedic Sankalp Recitation',
      subtext: 'Pandit Ji invoked your Gotra, Nakshatra & family names at sacred altar.',
      timestamp: '15 Oct, 09:30 AM',
      isCompleted: true,
      isCurrent: false,
    },
    {
      step: 2,
      title: 'Maha Hawan & Purnahuti',
      subtext: '108 ahutis offered with pure desi cow ghee & sacred samidha.',
      timestamp: '15 Oct, 11:45 AM',
      isCompleted: true,
      isCurrent: false,
    },
    {
      step: 3,
      title: 'Temple Garbhagriha Consecration',
      subtext: 'Prasad touched to holy Shivalinga & sanctified with Vedic mantras.',
      timestamp: '15 Oct, 02:15 PM',
      isCompleted: true,
      isCurrent: false,
    },
    {
      step: 4,
      title: 'Sacred Tamper-Evident Packaging',
      subtext: 'Vacuum-sealed silver coin, Ganga Jal vial, dry fruits & vibhuti.',
      timestamp: '16 Oct, 10:00 AM',
      isCompleted: true,
      isCurrent: false,
    },
    {
      step: 5,
      title: 'Express Courier in Transit',
      subtext: 'Out for final delivery to your doorstep. Live GPS tracking active.',
      timestamp: 'In Transit',
      isCompleted: false,
      isCurrent: true,
    },
  ],
};

export const ALL_PUJAS: Puja[] = [
  {
    id: 'ganesh-puja',
    name: 'Shree Ganesh Puja & Vighnaharta Yajan',
    subtitle: 'For removing obstacles, intellect, business growth & auspicious beginnings',
    sanskritMantra: 'ॐ गं गणपतये नमः • वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ',
    startingPrice: 2100,
    duration: '1.5 – 2 Hours',
    category: 'Ganesh Puja',
    deity: 'Lord Ganesha',
    rating: 4.98,
    reviewsCount: 342,
    templeLocation: 'Siddhivinayak & Kashi Kshetra',
    suitableOccasions: ['New Office / Business', 'Vehicle Purchase', 'Birthday / Griha Shanti', 'Before Major Work'],
    image: THEME.assets.pujaGanesh,
    description: 'A deeply sacred Vedic ritual conducted with Shodashopachar vidhi to invoke Bhagwan Vighneshwara. Designed to clear planetary obstacles and grant wisdom and prosperity.',
    significance: 'Lord Vighnaharta dissolves karmic hurdles, bestows intellect (Buddhi), prosperity (Riddhi), and auspicious spiritual success (Siddhi).',
    items: ['Kalash Sthapana & Avahan', 'Ganesh Atharvashirsha Chanting', 'Durva Grass & Hibiscus Offering', 'Modak & Ladoo Bhog Arpan', 'Aarti & Pushpanjali'],
    occasionTag: 'Ganesh Puja',
    whatIsIncluded: {
      panditServices: 'Complete Vedic vidhi conducted personally by our revered Senior Acharya.',
      guidance: 'Auspicious muhurat timing selection and step-by-step family sankalp guidance.',
      samagriDetails: 'Package-based: 100% pure consecrated samagri brought by Acharya Ji.',
      instructions: 'Pre-puja clean altar setup instructions and mantra booklet provided.',
    },
    preparationSteps: [
      'Confirm the date and chosen Muhurat slot with Pandit Ji.',
      'Clean and purify the puja altar space with Gangajal or clean water.',
      'Keep fresh fruits, flowers, and sweets (laddus/modaks) ready before Pandit Ji arrives.',
      'Ensure a serene environment for family mantra chanting during the sankalp.',
    ],
    packages: {
      panditOnly: {
        id: 'pandit-only',
        name: 'Pandit Ji Only (Dakshina)',
        price: 2100,
        tagline: 'Devotee arranges the samagri. Complete checklist provided.',
        samagriIncluded: false,
        features: [
          'Vedic Vidhi by Senior Acharya (1.5-2 hrs)',
          'Exact Muhurat consultation included',
          'Detailed samagri checklist sent via WhatsApp/SMS',
          'Personalized family Sankalp for all members',
        ],
      },
      panditWithSamagri: {
        id: 'pandit-samagri',
        name: 'Acharya Ji + Rajopchar Samagri Hamper',
        price: 2850,
        tagline: '100% pure consecrated samagri, silver coin & bhog included.',
        samagriIncluded: true,
        features: [
          'All ritual items brought (Roli, Akshat, Dhoop, Kalash, Janeu)',
          'Pure cow ghee & natural Bhimseni camphor',
          'Consecrated Ganesha Raksha Yantra Card',
          'You only provide fresh flowers and seasonal fruits',
        ],
      },
    },
  },
  {
    id: 'griha-pravesh',
    name: 'Griha Pravesh & Vastu Shanti Mahayajan',
    subtitle: 'For cosmic balance, peace, positive energy and prosperity in your new home',
    sanskritMantra: 'ॐ वास्तोष्पते प्रतिजानीह्यस्मान् त्स्वावेशो अनमीवो भवा नः',
    startingPrice: 3500,
    duration: '3 – 3.5 Hours',
    category: 'Griha Pravesh',
    deity: 'Vastu Purusha & Navgraha',
    rating: 4.99,
    reviewsCount: 512,
    templeLocation: 'Conducted at Devotee Residence',
    suitableOccasions: ['New Home Possession', 'Rented Flat Shifting', 'Renovated House Entry'],
    image: THEME.assets.pujaGriha,
    description: 'Traditional Vedic housewarming ceremony including Vastu Shanti, Navgrah Homa, and threshold sanctification before residing in a new home.',
    significance: 'Purifies the residential space, balances the 5 cosmic elements (Pancha Bhoota), and welcomes Mahalakshmi into the household.',
    items: ['Vastu Shanti & Navgrah Sthapana', 'Boiling Milk Auspicious Vidhi', 'Pavitra Toran & Kalash Pravesh', 'Maha Purnahuti Hawan', 'Digbandhan Raksha Vidhi'],
    occasionTag: 'Griha Pravesh',
    whatIsIncluded: {
      panditServices: 'Comprehensive multi-step housewarming rituals conducted by senior Acharyas.',
      guidance: 'Exact door-entry muhurat calculated according to home owner’s birth star.',
      samagriDetails: 'All hawan herbs, copper kalash, and vastu yantra according to selected package.',
      instructions: 'Detailed entry guidelines, threshold preparation, and kalash parikrama rules.',
    },
    preparationSteps: [
      'Verify the exact entry lagna / muhurat with Pandit Ji.',
      'Ensure the main door toran (mango leaves/marigold) is ready before the muhurat.',
      'Keep raw milk and new earthen or brass vessel ready for boiling ritual.',
      'Keep the hawan kund space well-ventilated for the sacred agni.',
    ],
    packages: {
      panditOnly: {
        id: 'pandit-only',
        name: 'Pandit Ji Only (Dakshina)',
        price: 3500,
        tagline: 'Devotee prepares samagri. Full list of herbs & woods provided.',
        samagriIncluded: false,
        features: [
          'Full 3-hour ceremony by 2 Vedic Brahmins',
          'Kundli-based threshold entry muhurat selection',
          'Vastu, Navgrah & Hawan vidhi conducted',
          'Family protection sankalp',
        ],
      },
      panditWithSamagri: {
        id: 'pandit-samagri',
        name: 'Pandit Ji + Sampurna Vastu Samagri Kit',
        price: 4950,
        tagline: 'Complete 51-item hawan samagri, vastu yantra & copper kalash.',
        samagriIncluded: true,
        features: [
          '51 authentic samagri items brought by Pandit Ji',
          'Hawan wood, Cow dung cakes, Pure Cow Ghee (500g)',
          'Brass Kalash, Vastu Shanti Yantra & Toran included',
          'Hassle-free complete service',
        ],
      },
    },
  },
  {
    id: 'rudrabhishek',
    name: 'Maha Rudrabhishek & Shiva Aradhana',
    subtitle: 'For health, protection, inner peace, and burning past negative karmas',
    sanskritMantra: 'ॐ नमः शम्भवाय च मयोभवाय च नमः शङ्कराय च मयस्कराय च',
    startingPrice: 3100,
    duration: '2 – 2.5 Hours',
    category: 'Maha Rudrabhishek',
    deity: 'Lord Shiva (Mahadev)',
    rating: 4.97,
    reviewsCount: 428,
    templeLocation: 'Kashi Vishwanath / Home Mandir',
    suitableOccasions: ['Maha Shivratri', 'Mondays (Somwar)', 'Pradosh Vrat', 'Health & Graha Shanti'],
    image: THEME.assets.pujaRudra,
    description: 'Consecrated Vedic bathing of the Shiva Linga with the 11 recitations of Sri Rudram from the Krishna Yajurveda.',
    significance: 'Dispels malefic planetary influences (Rahu, Ketu, Shani), invokes healing energy, removes fears and protects the family.',
    items: ['Panchamrit Abhishek (Milk, Curd, Ghee, Honey, Sugar)', 'Ganga Jal & Bhasma Arpan', '11 Avartan Sri Rudram Chanting', 'Belpatra Archana (108)', 'Maha Mrityunjaya Japa'],
    occasionTag: 'Maha Rudrabhishek',
    whatIsIncluded: {
      panditServices: 'Chanting of Sri Rudram and Chamakam by Vedic scholar.',
      guidance: 'Identification of auspicious Pradosh / Shivratri muhurat.',
      samagriDetails: 'Complete abhishek liquids, belpatra, and sacred bhasma provided.',
      instructions: 'Pre-abhishek fasting and sankalp guidelines.',
    },
    preparationSteps: [
      'Devotee should observe clean sattvic diet on the puja day.',
      'Keep a clean brass, copper or silver thali for the Shiva Linga.',
      'Arrange fresh raw unboiled milk, curds, honey, and fresh belpatra.',
      'Keep pure Gangajal ready for final snanam.',
    ],
    packages: {
      panditOnly: {
        id: 'pandit-only',
        name: 'Pandit Ji Only',
        price: 3100,
        tagline: 'Devotee arranges Panchamrit & flowers.',
        samagriIncluded: false,
        features: [
          'Complete Sri Rudram recitation by Acharya',
          'Sankalp for health, longevity & peace',
          'Maha Mrityunjaya mantra chanting',
          'Detailed list of abhishek items sent',
        ],
      },
      panditWithSamagri: {
        id: 'pandit-samagri',
        name: 'Pandit Ji + Panchamrit & Samagri Kit',
        price: 4200,
        tagline: 'Pure Gangajal from Haridwar, Kashi Bhasma, Belpatra & Ghee included.',
        samagriIncluded: true,
        features: [
          'Haridwar Gangajal, Kashi Bhasma, Pure Ghee',
          'Fresh Belpatra (108 items) & Janeyu',
          'Vibhuti & Rudraksha blessed during puja',
          'You only provide fresh milk and curd',
        ],
      },
    },
  },
  {
    id: 'satyanarayan',
    name: 'Shree Satyanarayan Vrat Katha',
    subtitle: 'For family harmony, abundance, gratefulness and fulfillment of sankalp',
    sanskritMantra: 'ॐ श्री विष्णवे नमः • नारायणाय विद्महे वासुदेवाय धीमहि',
    startingPrice: 2100,
    duration: '2 Hours',
    category: 'Satyanarayan Katha',
    deity: 'Lord Vishnu (Satyanarayan)',
    rating: 4.96,
    reviewsCount: 389,
    templeLocation: 'Conducted at Devotee Residence',
    suitableOccasions: ['Purnima (Full Moon)', 'Monthly Vrat', 'Post Marriage/Childbirth', 'House Blessings'],
    image: THEME.assets.pujaSatyanarayan,
    description: 'A traditional narration of the five divine chapters of Satyanarayan Katha from the Skanda Purana, followed by panchamrit offering.',
    significance: 'Brings domestic happiness, dissolves misunderstandings among family members, and fosters contentment and dharma.',
    items: ['Navagraha & Lokpal Sthapana', '5 Chapters Katha Pathan with Meaning', 'Panchamrit & Panjiri Prasadam Distribution', 'Hawan & Aarti'],
    occasionTag: 'Satyanarayan Katha',
    whatIsIncluded: {
      panditServices: 'Full 5-chapter katha recitation and explanation by Pandit Ji.',
      guidance: 'Purnima muhurat selection and sankalp chanting.',
      samagriDetails: 'Complete katha samagri, dry fruits, and hawan woods.',
      instructions: 'Traditional Panjiri prasad recipe and preparation tips.',
    },
    preparationSteps: [
      'Prepare the sweet roasted wheat flour (Panjiri) and Panchamrit in advance.',
      'Decorate the wooden chauki with yellow cloth and banana leaves (if available).',
      'Keep fresh fruits (especially bananas) and basil leaves (Tulsi Dal) ready.',
      'Invite family and close friends for the evening katha.',
    ],
    packages: {
      panditOnly: {
        id: 'pandit-only',
        name: 'Pandit Ji Only',
        price: 2100,
        tagline: 'Devotee prepares samagri and prasad.',
        samagriIncluded: false,
        features: [
          'Complete Katha recitation in clear Hindi & Sanskrit',
          'Sankalp for entire family',
          'Small Homa / Aarti vidhi',
          'Checklist of items provided beforehand',
        ],
      },
      panditWithSamagri: {
        id: 'pandit-samagri',
        name: 'Pandit Ji + Katha Samagri Hamper',
        price: 2900,
        tagline: 'Includes hawan items, dry fruit mix, yellow cloth & janeu.',
        samagriIncluded: true,
        features: [
          'Hawan herbs, dhoop, kapur, navdhanya',
          'Yellow pavitra cloth, dry fruit mix for panchamrit',
          'Tulsi beads blessed during puja',
          'You only prepare the wheat flour panjiri',
        ],
      },
    },
  },
];

export const POPULAR_PUJAS: Puja[] = ALL_PUJAS;

export const PUJA_KITS: PujaKit[] = [
  {
    id: 'kit-complete-griha',
    name: 'Sampurna Griha Pravesh Mahayajan Kit',
    tagline: '51 consecrated ingredients packed in a premium royal keepsake box',
    category: 'Hawan Kits',
    price: 1850,
    originalPrice: 2400,
    image: THEME.assets.bannerKit,
    itemsCount: 51,
    certified: true,
    rating: 4.96,
    reviewsCount: 218,
    badge: 'Best Seller',
    description: 'Everything required for an auspicious Griha Pravesh hawan: pure cow ghee, copper kalash, red cloth, hawan samidha, supari, Gangajal, and organic dhoop.',
    itemsIncluded: ['Pure Kashi Gangajal (250ml)', 'Desi Cow A2 Ghee (500g)', 'Handcrafted Brass Diya', 'Copper Kalash & Coconut', 'Hawan Sacred Herbs (1kg)', 'Ashtagandha Chandan & Roli', 'Supari & Clove set', 'Pavitra Moli & Janeu'],
    inStock: true,
  },
  {
    id: 'rudraksha-5mukhi',
    name: 'Certified Nepal 5-Mukhi Rudraksha Mala',
    tagline: '108+1 consecrated beads with laboratory X-ray certificate',
    category: 'Rudraksha',
    price: 1499,
    originalPrice: 2200,
    image: THEME.assets.bannerKit,
    itemsCount: 109,
    certified: true,
    rating: 4.99,
    reviewsCount: 384,
    badge: 'Lab Certified',
    description: 'Authentic 5-Mukhi Nepali Rudraksha Mala consecrated with Mahamrityunjaya mantras in Kashi. Aids mental peace, blood pressure regulation, and spiritual focus.',
    itemsIncluded: ['108+1 Nepal Rudraksha Beads', 'ISO Gemological Lab Certificate', 'Ganga Jal Sanctification Vial', 'Pavitra Velvet Storage Pouch', 'Mantra Japa Instructions'],
    inStock: true,
  },
  {
    id: 'yantra-sri-sampurna',
    name: 'Ashtadhatu Sri Sampurna Mahalakshmi Yantra',
    tagline: 'Gold-plated 24K consecrated divine geometry for wealth & prosperity',
    category: 'Yantras',
    price: 1950,
    originalPrice: 2800,
    image: THEME.assets.bannerKit,
    itemsCount: 1,
    certified: true,
    rating: 4.97,
    reviewsCount: 172,
    badge: '24K Gold Plated',
    description: 'Energized with 1008 recitations of Shree Suktam. Designed to be placed in the home cash safe, office table or mandir to attract wealth and clear debts.',
    itemsIncluded: ['24K Gold Plated Ashtadhatu Yantra (6x6 inch)', 'Wooden Altar Stand', 'Pran-Pratishtha Certificate by Acharya', 'Pavitra Raksha Dhaga'],
    inStock: true,
  },
  {
    id: 'kit-daily-puja',
    name: 'Daily Nitya Puja Essentials Kit',
    tagline: 'Pure daily devotion items for home mandir',
    category: 'Gangajal & Dhoop',
    price: 650,
    originalPrice: 900,
    image: THEME.assets.bannerKit,
    itemsCount: 21,
    certified: true,
    rating: 4.93,
    reviewsCount: 142,
    badge: 'Eco Pure',
    description: 'Handpicked daily ritual kit: premium dhoop cones, pure brass bell, cotton wicks, kapur (camphor), and organic ashtagandha.',
    itemsIncluded: ['Bhimseni Pure Camphor', 'Natural Sandalwood Dhoop Cones', 'Cotton Phool Batti', 'Ashtagandha Paste', 'Ganga Jal bottle'],
    inStock: true,
  },
  {
    id: 'kit-satyanarayan',
    name: 'Satyanarayan Vrat Samagri Box',
    tagline: 'All required katha samagri neatly organized',
    category: 'Hawan Kits',
    price: 1250,
    originalPrice: 1600,
    image: THEME.assets.bannerKit,
    itemsCount: 35,
    certified: true,
    rating: 4.95,
    reviewsCount: 119,
    badge: 'Consecrated',
    description: 'Tailored for Satyanarayan puja: fresh janeyu, yellow cloth, dhoop, kapur, navdhanya, dry fruits mix, and pure roli.',
    itemsIncluded: ['Yellow Pavitra Cloth', 'Dry Fruit Panchamrit Mix', 'Janeu (Pair)', 'Moli & Rakshasutra', 'Akshat & Roli', 'Ganga Jal bottle'],
    inStock: true,
  },
];

export const UPCOMING_OCCASIONS: Occasion[] = [
  {
    id: 'occ-griha',
    title: 'Griha Pravesh',
    subtitle: 'Vastu Shanti & Housewarming',
    filterTag: 'Griha Pravesh',
    iconName: 'Home',
  },
  {
    id: 'occ-marriage',
    title: 'Marriage & Vivah',
    subtitle: 'Vivah Sanskar & Ashirwad',
    filterTag: 'Marriage',
    iconName: 'HeartHandshake',
  },
  {
    id: 'occ-rudra',
    title: 'Somwar Rudrabhishek',
    subtitle: 'Kashi Mahadev Snanam',
    filterTag: 'Maha Rudrabhishek',
    iconName: 'Sparkles',
  },
  {
    id: 'occ-baby',
    title: 'Baby Blessing',
    subtitle: 'Naamkaran & Longevity',
    filterTag: 'Other Rituals',
    iconName: 'Baby',
  },
];

export const MOCK_USER_BOOKINGS: UserBooking[] = [
  {
    id: 'VR-90821',
    pujaName: 'Griha Pravesh & Vastu Shanti Mahayajan',
    date: '15 Oct 2026',
    timeSlot: '09:00 AM - 12:30 PM (Abhijit)',
    status: 'Confirmed',
    amount: 4950,
    location: 'Sector 62, Noida (At Home)',
    panditJi: 'आचार्य पं. विद्याधर शास्त्री (काशी)',
    packageType: 'Pandit Ji + Sampurna Vastu Samagri Kit',
    sankalpPatraAvailable: true,
    prasadTrackingId: 'VR-BLUEDART-894210',
  },
  {
    id: 'VR-08412',
    pujaName: 'Shree Ganesh Puja & Vighnaharta Yajan',
    date: '28 Sep 2026',
    timeSlot: '10:00 AM - 11:30 AM',
    status: 'Completed',
    amount: 2850,
    location: 'Cyber City, Gurgaon (Office Inauguration)',
    panditJi: 'ज्योतिषाचार्य पं. रामेश्वर द्विवेदी',
    packageType: 'Acharya Ji + Rajopchar Samagri Hamper',
    sankalpPatraAvailable: true,
    prasadTrackingId: 'VR-DELIVERED-441209',
  },
];

export const MOCK_KUNDLI_REPORTS: KundliReport[] = [
  {
    id: 'KR-501',
    devoteeName: 'Anand Sharma',
    dob: '14 May 1994',
    tob: '06:45 AM',
    pob: 'Varanasi, Uttar Pradesh, India',
    status: 'Ready',
    query: 'Career progression, Business venture & Auspicious Griha Pravesh Muhurat',
    date: '02 Oct 2026',
    rashi: 'Vrishabha (Taurus)',
    nakshatra: 'Rohini Nakshatra (Pada 2)',
    mangalDosha: 'Low',
    recommendation: 'Perform Rudrabhishek on Shukla Trayodashi and wear 5-Mukhi Nepali Rudraksha in silver casing.',
  },
];
