import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedrit';

const SamuhikPujaSchema = new mongoose.Schema({}, { strict: false });
const SamuhikPuja = mongoose.models.SamuhikPuja || mongoose.model('SamuhikPuja', SamuhikPujaSchema, 'samuhikpujas');

const SAMUHIK_PUJAS = [
  {
    slug: 'mahashivratri-1008-belpatra-rudrabhishek',
    title: 'महाशिवरात्रि 1008 महामृत्युंजय व बेलपत्र महा-अनुष्ठान',
    subtitle: 'द्वादश ज्योतिर्लिंग काशी विश्वनाथ धाम सन्निधि में सपरिवार नाम-गोत्र संकल्प',
    deity: 'Lord Shiva',
    templeVenue: 'काशी विश्वनाथ मंदिर परिक्षेत्र, वाराणसी',
    eventDate: '2026-11-28',
    muhuratTime: 'शाम 05:30 PM - रात्रि 09:30 PM (प्रदोष काल)',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    description:
      'महाशिवरात्रि एवं पावन प्रदोष वेला पर 1008 ताजे त्रिनेत्र स्वरूप बेलपत्र, गाय के कच्चे दूध, गंगाजल, भस्म और पंचामृत से भगवान भोलेनाथ का महा-अभिषेक। यजमान व उनके परिजनों के नाम और गोत्र का व्यक्तिगत उच्चारण कर आहुति दी जाएगी।',
    benefits: [
      'अकाल मृत्यु भय व गंभीर रोग निवारण (महामृत्युंजय कृपा)',
      'कुंडली के कालसर्प, शनि साढ़ेसाती व पितृदोष शांति',
      'समस्त पारिवारिक कलह का शमन व अखण्ड सौभाग्य प्राप्ति',
      'व्यवसाय व नौकरी में आ रही समस्त अड़चनों का नाश',
    ],
    vidhiInclusions: [
      '1008 ताजे अखंडित बेलपत्र अर्पण',
      'शास्त्रोक्त पंचामृत (दूध, दही, घी, शहद, शर्करा) अभिषेक',
      'यजमान व समस्त परिवार के नाम-गोत्र से संकल्प आहुति',
      'पूजा उपरांत संकल्प वीडियो व रुद्राक्ष रक्षा-सूत्र प्रसाद',
    ],
    tiers: [
      {
        id: 'SINGLE',
        name: 'एकल यजमान संकल्प (Single Devotee)',
        dakshina: 101,
        maxFamilyMembers: 1,
        prasadIncluded: false,
        description: '1 व्यक्ति का नाम व गोत्र महा-अनुष्ठान में सम्मिलित',
      },
      {
        id: 'COUPLE',
        name: 'दम्पत्ति संकल्प (Husband & Wife)',
        dakshina: 251,
        maxFamilyMembers: 2,
        prasadIncluded: true,
        description: 'पति-पत्नी का संयुक्त नाम, गोत्र व मनोकामना संकल्प',
      },
      {
        id: 'FAMILY',
        name: 'सपरिवार कल्याण संकल्प (Entire Family)',
        dakshina: 501,
        maxFamilyMembers: 6,
        prasadIncluded: true,
        description: 'परिवार के 6 सदस्यों का नाम, गोत्र व कुलदेवी-देवता स्मरण',
      },
      {
        id: 'MUKHYA',
        name: 'विशेष मुख्य यजमान (Lead Devotee)',
        dakshina: 1100,
        maxFamilyMembers: 8,
        prasadIncluded: true,
        description: 'हवन में प्रधान आहुति, संकल्प वीडियो व अभिमंत्रित रुद्राक्ष प्रसाद',
      },
    ],
    maxDevotees: 500,
    enrolledCount: 384,
    status: 'ACTIVE',
    isFeatured: true,
  },
  {
    slug: 'sankashti-chaturthi-108-durva-modak-puja',
    title: 'संकष्टी चतुर्थी विघ्नहर्ता 108 मोदक व दूर्वा महापूजा',
    subtitle: 'समस्त कार्यों में आ रहे विघ्नों व संकटों के निवारण हेतु सिद्ध गणेश पीठ पर',
    deity: 'Lord Ganesha',
    templeVenue: 'सिद्धिविनायक परिक्षेत्र, प्राचीन गणेश मंदिर',
    eventDate: '2026-11-20',
    muhuratTime: 'प्रातः 08:00 AM - 11:30 AM (अभिजीत मुहूर्त)',
    imageUrl: 'https://images.unsplash.com/photo-1567591370504-209bf74112c2?auto=format&fit=crop&w=1200&q=80',
    description:
      'विघ्नराज भगवान श्री गणेश को अतिप्रिय 108 पवित्र दूर्वा अंकुर, 108 ताजे मोदक एवं सिन्दूर अर्पण के साथ अथर्वशीर्ष के 21 पाठ। नए कार्य, संतान की उन्नति और आर्थिक समृद्धि हेतु विशेष सामूहिक अनुष्ठान।',
    benefits: [
      'नए व्यापार, नौकरी व गृह निर्माण में आ रही रुकावटों का निवारण',
      'संतान की विद्या, बुद्धि व एकाग्रता में चमत्कारी वृद्धि',
      'ऋण (कर्ज) मुक्ति एवं निरंतर धन आगमन के द्वार खुलना',
    ],
    vidhiInclusions: [
      '108 दूर्वा दलों द्वारा गणपति सहस्रार्चन',
      '108 शुद्ध देसी घी के मोदक महाभोग',
      'गणपति अथर्वशीर्ष के 21 वैदिक आवर्तन',
      'नाम व गोत्र उच्चारण पूर्वक विशेष सिन्दूर अर्पण',
    ],
    tiers: [
      {
        id: 'SINGLE',
        name: 'एकल यजमान संकल्प',
        dakshina: 101,
        maxFamilyMembers: 1,
        prasadIncluded: false,
        description: '1 व्यक्ति का नाम व गोत्र गणेश चरणों में अर्पित',
      },
      {
        id: 'COUPLE',
        name: 'दम्पत्ति संकल्प',
        dakshina: 251,
        maxFamilyMembers: 2,
        prasadIncluded: true,
        description: 'दम्पत्ति के नाम से विघ्नहर्ता पूजन व मोदक भोग',
      },
      {
        id: 'FAMILY',
        name: 'सपरिवार रिद्धि-सिद्धि संकल्प',
        dakshina: 501,
        maxFamilyMembers: 6,
        prasadIncluded: true,
        description: 'समस्त परिवार की सुख-शांति व उन्नति हेतु',
      },
    ],
    maxDevotees: 300,
    enrolledCount: 218,
    status: 'ACTIVE',
    isFeatured: true,
  },
  {
    slug: 'bhaumvati-amavasya-hanuman-sindoor-chola',
    title: 'भौमवती अमावस्या / मंगलवार मारुति सिन्दूर चोला महापूजा',
    subtitle: 'ताड़िया हनुमान मंदिर में संकटमोचन हनुमान जी को चमेली तेल व सिन्दूर चोला',
    deity: 'Lord Hanuman',
    templeVenue: 'ताड़िया हनुमान मंदिर, लखनऊ',
    eventDate: '2026-11-24',
    muhuratTime: 'संध्या 06:30 PM - 09:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=1200&q=80',
    description:
      'पवनपुत्र संकटमोचन हनुमान जी को शुद्ध चमेली के तेल में घोले गए सिन्दूर का भव्य चोला अर्पण, 108 पान के बीड़े, बूंदी प्रसाद भोग और सुंदरकांड का संपूर्ण संगीतमय पाठ। शनि की साढ़ेसाती व भय निवारण हेतु सर्वोत्तम उपाय।',
    benefits: [
      'शत्रु बाधा, नजर दोष व अज्ञात भय से पूर्ण मुक्ति',
      'शनि, राहु व मंगल ग्रह के क्रूर दोषों का तत्काल शमन',
      'आत्मविश्वास, आरोग्य एवं कोर्ट-कचहरी मुकदमों में विजय',
    ],
    vidhiInclusions: [
      'चमेली तेल व सिन्दूर का भव्य चोला अर्पण',
      '108 पान के पत्तों की माला व बूंदी भोग',
      'सुंदरकांड व बजरंग बाण का सामूहिक पाठ',
      'हनुमान रक्षा कवच व भस्म प्रसाद प्रेषण',
    ],
    tiers: [
      {
        id: 'SINGLE',
        name: 'एकल यजमान संकल्प',
        dakshina: 101,
        maxFamilyMembers: 1,
        prasadIncluded: false,
        description: '1 भक्त का नाम व गोत्र सिन्दूर चोला संकल्प में सम्मिलित',
      },
      {
        id: 'COUPLE',
        name: 'दम्पत्ति रक्षा संकल्प',
        dakshina: 251,
        maxFamilyMembers: 2,
        prasadIncluded: true,
        description: 'पति-पत्नी की रक्षा व पारिवारिक कल्याण हेतु',
      },
      {
        id: 'FAMILY',
        name: 'सपरिवार संकटमोचन संकल्प',
        dakshina: 501,
        maxFamilyMembers: 6,
        prasadIncluded: true,
        description: 'संपूर्ण परिवार का नाम, गोत्र व रक्षा सूत्र बंधन',
      },
    ],
    maxDevotees: 500,
    enrolledCount: 412,
    status: 'ACTIVE',
    isFeatured: true,
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected! Seeding Samuhik Festival Pujas...');

    for (const item of SAMUHIK_PUJAS) {
      await SamuhikPuja.findOneAndUpdate({ slug: item.slug }, item, { upsert: true, new: true });
      console.log(`✓ Seeded: ${item.title} (${item.templeVenue})`);
    }

    console.log('All 3 Grand Samuhik Pujas seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();

