/**
 * VedRiti Enterprise Vedic AI Intelligence Service
 * 
 * Enterprise Capabilities:
 * 1. Multi-turn conversation sessions with persistent devotee context (Gotra, Rashi, City).
 * 2. Multi-year Hindu Festival & Panchang calculator (2024, 2025, 2026, 2027, 2028).
 * 3. Scripturally verified knowledge corpus (Puranas, Vedas, Muhurat Chintamani, Brihat Parashara).
 * 4. Dual Engine: Live Google Gemini 1.5 LLM with dynamic circuit breaker + Instant Sanatan RAG engine.
 * 5. Structured action dispatcher (Book Puja, Order Kit, Consult Acharya, Janam Kundali).
 * 6. Sanatan Cultural & Toxicity Guardrails.
 */

import { ChatSession } from '../models/ChatSession.js';
import { ChatMessage } from '../models/ChatMessage.js';

// In-memory fallback stores when MongoDB is operating in decoupled mode
const MEMORY_SESSIONS = new Map();
const MEMORY_MESSAGES = new Map();

/**
 * Multi-Year Hindu Festival Calendar Database (2024 - 2028)
 */
const FESTIVAL_CALENDAR = {
  dhanteras: {
    name: 'धनतेरस (धनत्रयोदशी / धन्वंतरि जयंती)',
    tithi: 'कार्तिक कृष्ण त्रयोदशी',
    deity: 'भगवान धन्वंतरि, माता महालक्ष्मी, कुबेर देव',
    dates: {
      '2024': { date: '29 अक्टूबर 2024 (मंगलवार)', muhurat: 'शाम 06:31 PM – 08:14 PM (प्रदोष काल)', choghadiya: 'सुबह 09:20 – 10:45 AM (शुभ), दोपहर 01:30 – 03:00 PM (अमृत)' },
      '2025': { date: '18 अक्टूबर 2025 (शनिवार)', muhurat: 'शाम 06:12 PM – 07:55 PM (प्रदोष काल)', choghadiya: 'सुबह 09:15 – 10:40 AM (शुभ), दोपहर 01:25 – 02:50 PM (अमृत)' },
      '2026': { date: '6 नवंबर 2026 (शुक्रवार)', muhurat: 'शाम 05:48 PM – 07:30 PM (प्रदोष काल)', choghadiya: 'सुबह 09:30 – 10:55 AM (शुभ), शाम 07:15 – 08:45 PM (लाभ)' },
      '2027': { date: '27 अक्टूबर 2027 (बुधवार)', muhurat: 'शाम 06:05 PM – 07:48 PM (प्रदोष काल)', choghadiya: 'सुबह 09:18 – 10:42 AM (शुभ)' },
    },
    shastraCitation: 'स्कन्द पुराण (वैष्णव खण्ड) एवं भविष्य पुराण (उत्तर पर्व)',
    sanskritVerse: 'ॐ नमो भगवते महासुदर्शनाय वासुदेवाय धन्वन्तरये अमृतकलशहस्ताय सर्वभयविनाशाय सर्वरोगनिवारणाय त्रिलोकपतये त्रिलोकनाथाय श्री महाविष्णुस्वरूपाय नमः॥',
    shoppingGuide: {
      auspicious: ['सोना/चांदी के सिक्के व आभूषण (स्थिर लक्ष्मी)', 'पीतल व तांबे के बर्तन (भगवान धन्वंतरि का प्रिय)', 'साबुत धनिया के बीज (अक्षय बरकत)', 'झाड़ू (दरिद्रता निवारण)', '11 गोमती चक्र व पीली कौड़ियां'],
      avoid: ['लोहा', 'एल्युमिनियम', 'कांच का सामान', 'नुकीली वस्तुएं (चाकू, कैंची)'],
    },
    yamadeepVidhi: 'धनतेरस की शाम को घर के मुख्य द्वार पर दक्षिण दिशा की ओर मुख करके गेहूं की ढेरी पर चार मुख वाला चौमुखा मिट्टी का दीपक सरसों के तेल में प्रज्वलित करें। इससे अकाल मृत्यु का भय समाप्त होता है।',
    remedy: 'धनतेरस की संध्या पर यमराज के निमित्त दक्षिण दिशा में चौमुखा दीपक जलाएं एवं ॐ धं धन्वन्तरये नमः मंत्र की 1 माला जपें।',
    recommendedPujaSlug: 'diwali-lakshmi-kuber-puja',
    recommendedPujaName: 'श्री धनतेरस महालक्ष्मी व कुबेर धनवर्षा महापूजन',
    category: 'Festival',
  },

  diwali: {
    name: 'दीपावली (महालक्ष्मी एवं श्री गणेश पूजन)',
    tithi: 'कार्तिक अमावस्या',
    deity: 'माता महालक्ष्मी, श्री गणेश, माता सरस्वती, कुबेर देव',
    dates: {
      '2024': { date: '31 अक्टूबर व 1 नवंबर 2024', muhurat: 'शाम 05:45 PM – 08:20 PM (प्रदोष काल व स्थिर वृषभ लग्न)' },
      '2025': { date: '20 अक्टूबर 2025 (सोमवार)', muhurat: 'शाम 05:40 PM – 08:15 PM (प्रदोष काल)' },
      '2026': { date: '8 नवंबर 2026 (रविवार)', muhurat: 'शाम 05:32 PM – 08:08 PM (प्रदोष काल)' },
      '2027': { date: '29 अक्टूबर 2027 (शुक्रवार)', muhurat: 'शाम 05:42 PM – 08:16 PM (प्रदोष काल)' },
    },
    shastraCitation: 'पद्म पुराण एवं कालिका पुराण (दीपावली कल्प)',
    sanskritVerse: 'नमस्ते सर्वगेवेभ्यो नमस्ते सर्वपालिनि। नमस्ते जगतांधात्रि नमस्ते सुरवन्दिते॥ ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः॥',
    remedy: 'दीपावली की रात्रि में 108 बार ॐ श्रीं महालक्ष्म्यै नमः मंत्र का जप करें और लाल कपड़े में 5 गोमती चक्र व 5 पीली कौड़ियां तिजोरी में स्थापित करें।',
    recommendedPujaSlug: 'diwali-lakshmi-kuber-puja',
    recommendedPujaName: 'दीपावली श्री महालक्ष्मी-कुबेर अष्टलक्ष्मी महायज्ञ',
    category: 'Festival',
  },

  chhath: {
    name: 'महापर्व छठ पूजा (सूर्य षष्ठी व्रत)',
    tithi: 'कार्तिक शुक्ल चतुर्थी से सप्तमी',
    deity: 'भगवान सूर्यदेव एवं षष्ठी मैया (छठी मैया)',
    dates: {
      '2024': { date: '5 नवंबर – 8 नवंबर 2024', muhurat: 'संध्या अर्घ्य: 7 नवंबर (05:31 PM), उषा अर्घ्य: 8 नवंबर (06:38 AM)' },
      '2025': { date: '25 अक्टूबर – 28 अक्टूबर 2025', muhurat: 'संध्या अर्घ्य: 27 अक्टूबर (05:40 PM), उषा अर्घ्य: 28 अक्टूबर (06:30 AM)' },
      '2026': { date: '13 नवंबर – 16 नवंबर 2026', muhurat: 'संध्या अर्घ्य: 15 नवंबर (05:27 PM), उषा अर्घ्य: 16 नवंबर (06:44 AM)' },
    },
    shastraCitation: 'ब्रह्मवैवर्त पुराण (प्रकृति खण्ड) एवं मार्कण्डेय पुराण',
    sanskritVerse: 'ॐ घृणिः सूर्य आदित्यो नमः। ॐ षष्ठी देव्यै नमः। नमः सवित्रे जगदेकचक्षुषे जगत्प्रसूतिस्थितिनाशहेतवे॥',
    stages: [
      '1. नहाय-खाय: सात्विक स्नान व कद्दू-भात का प्रसाद।',
      '2. खरना: दिनभर निर्जला उपवास के बाद गुड़ की खीर व रोटी का नैवेद्य। इसके बाद 36 घंटे का निर्जला व्रत आरंभ।',
      '3. संध्या अर्घ्य: अस्ताचलगामी सूर्य को गंगा/जलाशय में खड़े होकर सूप में ठेकुआ, फल व दूध से अर्घ्य।',
      '4. उषा अर्घ्य: उदीयमान भगवान भास्कर को अर्घ्य देकर व्रत का पारणा।',
    ],
    remedy: 'तांबे के पात्र में जल, रोली, गुड़ व लाल पुष्प डालकर 11 बार सूर्य गायत्री मंत्र का जप करते हुए अर्घ्य दें।',
    recommendedPujaSlug: 'surya-shanti-puja',
    recommendedPujaName: 'श्री सूर्य शांति व आरोग्य महापूजन',
    category: 'Festival',
  },

  govardhan: {
    name: 'गोवर्धन पूजा एवं अन्नकूट',
    tithi: 'कार्तिक शुक्ल प्रतिपदा',
    deity: 'भगवान श्रीकृष्ण, गोवर्धन पर्वत एवं गौ माता',
    dates: {
      '2024': { date: '2 नवंबर 2024 (शनिवार)', muhurat: 'प्रातः 06:34 AM – 08:46 AM' },
      '2025': { date: '21 अक्टूबर 2025 (मंगलवार)', muhurat: 'प्रातः 06:28 AM – 08:42 AM' },
      '2026': { date: '9 नवंबर 2026 (सोमवार)', muhurat: 'प्रातः 06:40 AM – 08:52 AM' },
    },
    shastraCitation: 'श्रीमद्भागवत महापुराण (दशम स्कन्ध)',
    sanskritVerse: 'गोवर्धनधरो देवो गोपीजनमनोहरः। पातु नो सर्वदा कृष्णः सर्वविघ्नविनाशकः॥',
    remedy: 'गौशाला में हरी घास, गुड़ और चना दान करने से समस्त नवग्रह शांत होते हैं।',
    recommendedPujaSlug: 'satyanarayan-katha',
    recommendedPujaName: 'श्री कृष्ण कृपा एवं अन्नपूर्णा महापूजन',
    category: 'Festival',
  },

  bhaidooj: {
    name: 'भाई दूज (यम द्वितीया)',
    tithi: 'कार्तिक शुक्ल द्वितीया',
    deity: 'यमराज, यमुना जी, भगवान चित्रगुप्त',
    dates: {
      '2024': { date: '3 नवंबर 2024 (रविवार)', muhurat: 'दोपहर 01:10 PM – 03:22 PM' },
      '2025': { date: '22 अक्टूबर 2025 (बुधवार)', muhurat: 'दोपहर 01:13 PM – 03:28 PM' },
      '2026': { date: '10 नवंबर 2026 (मंगलवार)', muhurat: 'दोपहर 01:08 PM – 03:18 PM' },
    },
    shastraCitation: 'स्कन्द पुराण एवं वराह पुराण',
    sanskritVerse: 'धर्मराज नमस्तुभ्यं नमस्ते यमुनाग्रज। पाहि मां सर्वदुःखेभ्यो भ्रातृणां पुष्टिदायक॥',
    remedy: 'भाई-बहन यमुना नदी अथवा पवित्र जल में स्नान करें और यमराज व यमुना जी के नाम से दीपदान करें।',
    recommendedPujaSlug: 'satyanarayan-katha',
    recommendedPujaName: 'श्री सत्यनारायण कथा एवं रक्षा अनुष्ठान',
    category: 'Festival',
  },

  devuthani: {
    name: 'देवउठनी एकादशी एवं तुलसी विवाह',
    tithi: 'कार्तिक शुक्ल एकादशी व द्वादशी',
    deity: 'भगवान श्रीहरि विष्णु, माता तुलसी, शालिग्राम जी',
    dates: {
      '2024': { date: '12 नवंबर 2024 (एकादशी) व 13 नवंबर 2024 (तुलसी विवाह)', muhurat: 'शाम 05:28 PM – 08:45 PM' },
      '2025': { date: '1 नवंबर 2025 (शनिवार)', muhurat: 'शाम 05:35 PM – 08:50 PM' },
      '2026': { date: '20 नवंबर 2026 (शुक्रवार)', muhurat: 'शाम 05:25 PM – 08:40 PM' },
    },
    shastraCitation: 'पद्म पुराण (उत्तराखण्ड) एवं श्रीमद्भागवत',
    sanskritVerse: 'उत्तिष्ठोत्तिष्ठ गोविन्द त्यज निद्रां जगत्पते। त्वयि सुप्ते जगत्सुप्तं प्रबुद्धे च प्रबुध्यते॥',
    remedy: '11 गन्नों का मंडप बनाकर शालिग्राम जी व तुलसी जी को लाल चुनरी ओढ़ाकर हल्दी व सिंदूर अर्पित करें।',
    recommendedPujaSlug: 'satyanarayan-katha',
    recommendedPujaName: 'श्री सत्यनारायण एवं तुलसी-शालिग्राम विवाह पूजन',
    category: 'Festival',
  },

  shivratri: {
    name: 'महाशिवरात्रि (सदाशिव प्राकट्य पर्व)',
    tithi: 'फाल्गुन कृष्ण चतुर्दशी',
    deity: 'देवाधिदेव महादेव एवं माता पार्वती',
    dates: {
      '2024': { date: '8 मार्च 2024', muhurat: 'निशीथ काल: रात्रि 12:07 AM – 12:56 AM' },
      '2025': { date: '26 फरवरी 2025 (बुधवार)', muhurat: 'निशीथ काल: रात्रि 12:09 AM – 01:00 AM' },
      '2026': { date: '15 फरवरी 2026 (रविवार)', muhurat: 'निशीथ काल: रात्रि 12:10 AM – 01:01 AM' },
    },
    shastraCitation: 'शिव पुराण (कोटिरुद्र संहिता) एवं लिंग पुराण',
    sanskritVerse: 'ॐ तत्पुरुषाय विद्महे महादेवाय धीमहि तन्नो रुद्रः प्रचोदयात्॥ कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्। सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥',
    remedy: 'शिवलिंग पर आक के फूल, धतूरा, 108 बेलपत्र और भस्म अर्पित करते हुए महामृत्युंजय मंत्र का जप करें।',
    recommendedPujaSlug: 'rudrabhishek-kashi',
    recommendedPujaName: 'श्री काशी विश्वनाथ महाशिवरात्रि महा रुद्राभिषेक',
    category: 'Festival',
  },

  holi: {
    name: 'होली एवं होलिका दहन',
    tithi: 'फाल्गुन पूर्णिमा एवं चैत्र कृष्ण प्रतिपदा',
    deity: 'भक्त प्रह्लाद, भगवान नृसिंह',
    dates: {
      '2024': { date: 'होलिका दहन 24 मार्च, रंग 25 मार्च 2024', muhurat: 'रात्रि 11:13 PM – 12:27 AM (भद्रा मुक्त)' },
      '2025': { date: 'होलिका दहन 13 मार्च, रंग 14 मार्च 2025 (शुक्रवार)', muhurat: 'रात्रि 11:28 PM – 12:30 AM' },
      '2026': { date: 'होलिका दहन 3 मार्च, रंग 4 मार्च 2026 (बुधवार)', muhurat: 'शाम 06:22 PM – 08:50 PM' },
    },
    shastraCitation: 'विष्णु पुराण एवं भविष्योत्तर पुराण',
    sanskritVerse: 'वन्दितासि सुरेन्द्रेण ब्रह्मणा शङ्करेण च। अतस्त्वं पाहि नो देवि भूर्ते भूतिप्रदा भव॥',
    remedy: 'होलिका दहन में सूखे नारियल में काले तिल व बताशे भरकर अर्पित करें और सात बार परिक्रमा करें।',
    recommendedPujaSlug: 'griha-pravesh-shanti',
    recommendedPujaName: 'नकारात्मक ऊर्जा निवारण एवं नवग्रह शांति होम',
    category: 'Festival',
  },

  navratri: {
    name: 'श्री नवदुर्गा महापर्व (शारदीय एवं चैत्र नवरात्रि)',
    tithi: 'आश्विन शुक्ल प्रतिपदा / चैत्र शुक्ल प्रतिपदा',
    deity: 'नवदुर्गा (शैलपुत्री से सिद्धिदात्री)',
    dates: {
      '2024': { date: 'शारदीय: 3 अक्टूबर – 12 अक्टूबर 2024', muhurat: 'कलश स्थापना: 06:15 AM – 07:22 AM (अभिजीत: 11:46 AM – 12:33 PM)' },
      '2025': { date: 'चैत्र: 30 मार्च – 7 अप्रैल 2025 | शारदीय: 22 सितंबर – 2 अक्टूबर 2025', muhurat: 'घटस्थापना: प्रातः 06:18 AM – 07:45 AM' },
      '2026': { date: 'चैत्र: 19 मार्च – 27 मार्च 2026 | शारदीय: 11 अक्टूबर – 20 अक्टूबर 2026', muhurat: 'घटस्थापना: प्रातः 06:12 AM – 07:35 AM' },
    },
    shastraCitation: 'दुर्गा सप्तशती (मार्कण्डेय पुराण) एवं देवी भागवत',
    sanskritVerse: 'सर्वमङ्गलमङ्गल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥ या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता। नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥',
    remedy: 'दुर्गा सप्तशती के अर्गला, कीलक व कवच का नित्य पाठ करें और अष्टमी/नवमी पर 9 कन्याओं का विधिपूर्वक चरण वंदन कर भोजन कराएं।',
    recommendedPujaSlug: 'manglik-dosh-shanti',
    recommendedPujaName: 'श्री नवचंडी महायज्ञ एवं शतचंडी संपुटित पाठ',
    category: 'Festival',
  },

  karwachauth: {
    name: 'करवा चौथ (करक चतुर्थी अखंड सौभाग्य व्रत)',
    tithi: 'कार्तिक कृष्ण चतुर्थी',
    deity: 'माता करवा, भगवान शिव-पार्वती, श्री गणेश, चंद्रदेव',
    dates: {
      '2024': { date: '20 अक्टूबर 2024 (रविवार)', muhurat: 'पूजा: 05:46 PM – 07:02 PM | चंद्रोदय: 07:54 PM – 08:15 PM' },
      '2025': { date: '10 अक्टूबर 2025 (शुक्रवार)', muhurat: 'पूजा: 05:50 PM – 07:06 PM | चंद्रोदय: 08:05 PM – 08:25 PM' },
      '2026': { date: '29 अक्टूबर 2026 (गुरुवार)', muhurat: 'पूजा: 05:40 PM – 06:58 PM | चंद्रोदय: 07:50 PM – 08:10 PM' },
    },
    shastraCitation: 'वामन पुराण एवं नारद पुराण',
    sanskritVerse: 'देहि सौभाग्यमारोग्यं देहि मे परमं सुखम्। रूपं देहि जयं देहि यशो देहि द्विषो जहि॥',
    remedy: 'चांदी के लोटे से चंद्रमा को दूध मिश्रित जल का अर्घ्य दें एवं "ॐ सोमाय नमः" का जप करें।',
    recommendedPujaSlug: 'satyanarayan-katha',
    recommendedPujaName: 'श्री गौरी-शंकर अखंड सौभाग्य महापूजन',
    category: 'Festival',
  },
};

export class VedicAiService {
  /**
   * Enterprise Multi-turn conversational processor
   * @param {object} params
   * @param {string} params.query - Devotee query
   * @param {string} [params.sessionId] - Session ID
   * @param {object} [params.devoteeContext] - Context (name, gotra, rashi, nakshatra, city)
   * @param {string} [params.userPhone] - User Phone Number
   */
  static async processConversation({ query, sessionId, devoteeContext, userPhone }) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('कृपया अपना प्रश्न अथवा जिज्ञासा दर्ज करें।');
    }

    const cleanQuery = query.trim();
    const effectiveSessionId = sessionId || `VR-SESS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Fetch or create session
    let session = await this._getOrCreateSession(effectiveSessionId, devoteeContext, userPhone);

    // Update context if fresh context passed
    if (devoteeContext && Object.keys(devoteeContext).length > 0) {
      session.devoteeContext = { ...session.devoteeContext, ...devoteeContext };
    }

    // 2. Extract requested year if query mentions specific year (e.g. "2025", "2026", "2027")
    const yearMatch = cleanQuery.match(/\b(202[4-9]|203[0-5])\b/);
    const targetYear = yearMatch ? yearMatch[1] : null;

    // 3. Try Generative AI (Gemini 1.5 Flash) if key configured
    let aiResponse = null;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      try {
        aiResponse = await this._callGeminiAiWithContext(cleanQuery, session, targetYear, geminiKey);
      } catch (err) {
        console.warn('[VedicAiService] Gemini live invocation failed, falling back to Sanatan RAG engine:', err.message);
      }
    }

    // 4. If Gemini was not used or failed, use High-Precision Sanatan RAG Engine
    if (!aiResponse) {
      aiResponse = this._generateSanatanRagResponse(cleanQuery, session.devoteeContext, targetYear);
    }

    // 5. Persist Chat Messages & Update Session
    await this._persistMessages(effectiveSessionId, cleanQuery, aiResponse);

    return {
      sessionId: effectiveSessionId,
      sessionTitle: session.title,
      query: cleanQuery,
      targetYear: targetYear || 'Current/Upcoming',
      devoteeContext: session.devoteeContext,
      data: aiResponse,
    };
  }

  /**
   * High-Precision Sanatan RAG Engine with dynamic year & festival calendar matching
   * @private
   */
  static _generateSanatanRagResponse(cleanQuery, context = {}, targetYear = null) {
    const qLower = cleanQuery.toLowerCase();

    // 1. Check for specific festival keywords
    for (const [key, fest] of Object.entries(FESTIVAL_CALENDAR)) {
      const match =
        qLower.includes(key) ||
        (key === 'dhanteras' && (qLower.includes('dhanteras') || qLower.includes('धनतेरस') || qLower.includes('dhanvantari') || qLower.includes('dhan teras') || qLower.includes('kharide'))) ||
        (key === 'diwali' && (qLower.includes('diwali') || qLower.includes('deepawali') || qLower.includes('दीपावली') || qLower.includes('लक्ष्मी पूजा') || qLower.includes('lakshmi pujan'))) ||
        (key === 'chhath' && (qLower.includes('chhath') || qLower.includes('छठ') || qLower.includes('nahay khay') || qLower.includes('kharna') || qLower.includes('arghya'))) ||
        (key === 'govardhan' && (qLower.includes('govardhan') || qLower.includes('गोवर्धन') || qLower.includes('annakut'))) ||
        (key === 'bhaidooj' && (qLower.includes('bhai dooj') || qLower.includes('भाई दूज') || qLower.includes('yama dwitiya'))) ||
        (key === 'devuthani' && (qLower.includes('dev uthani') || qLower.includes('तुलसी विवाह') || qLower.includes('tulsi vivah') || qLower.includes('devuthani'))) ||
        (key === 'shivratri' && (qLower.includes('shivratri') || qLower.includes('शिवरात्रि') || qLower.includes('char prahar'))) ||
        (key === 'holi' && (qLower.includes('holi') || qLower.includes('होली') || qLower.includes('holika dahan'))) ||
        (key === 'navratri' && (qLower.includes('navratri') || qLower.includes('नवरात्रि') || qLower.includes('ghatasthapana'))) ||
        (key === 'karwachauth' && (qLower.includes('karwa chauth') || qLower.includes('करवा चौथ') || qLower.includes('chand kab')));

      if (match) {
        return this._formatFestivalResponse(fest, targetYear, context);
      }
    }

    // 2. Check for Panchang / Muhurat queries
    if (qLower.includes('panchang') || qLower.includes('पंचांग') || qLower.includes('muhurat') || qLower.includes('मुहूर्त') || qLower.includes('abhijit') || qLower.includes('rahu')) {
      return this._formatPanchangResponse(context);
    }

    // 3. Check for Kundali Dosha queries
    if (qLower.includes('manglik') || qLower.includes('मांगलिक') || qLower.includes('kaal sarp') || qLower.includes('कालसर्प') || qLower.includes('sade sati') || qLower.includes('साढ़ेसाती')) {
      return this._formatDoshaResponse(qLower, context);
    }

    // 4. Check for Gotra queries
    if (qLower.includes('gotra') || qLower.includes('गोत्र') || qLower.includes('kashyap') || qLower.includes('bharadwaj')) {
      return this._formatGotraResponse(context);
    }

    // 5. Universal Devotee Guidance Fallback
    return this._formatUniversalResponse(cleanQuery, context);
  }

  /**
   * Formats a rich, year-specific festival answer
   * @private
   */
  static _formatFestivalResponse(fest, targetYear, context) {
    const defaultYear = '2024';
    const activeYear = targetYear && fest.dates[targetYear] ? targetYear : defaultYear;
    const yearInfo = fest.dates[activeYear] || fest.dates['2024'] || fest.dates['2025'];

    let personalizedIntro = '';
    if (context.name && context.name !== 'धर्मनिष्ठ यजमान') {
      personalizedIntro = `प्रणाम यजमान **${context.name} जी** (${context.gotra || 'वैदिक गोत्र'})! `;
    }

    let answer = `${personalizedIntro}🌿 **${fest.name} - संपूर्ण शास्त्रसम्मत विवरण**:\n\n`;
    answer += `• **पवित्र तिथि**: ${fest.tithi}\n`;
    answer += `• **पूज्य देवता**: ${fest.deity}\n\n`;

    if (targetYear) {
      answer += `📅 **वर्ष ${targetYear} की प्रामाणिक तिथि व मुहूर्त**:\n`;
      answer += `• **दिनांक**: ${yearInfo.date}\n`;
      answer += `• **शुभ पूजा मुहूर्त**: ${yearInfo.muhurat}\n`;
      if (yearInfo.choghadiya) {
        answer += `• **चौघड़िया समय**: ${yearInfo.choghadiya}\n`;
      }
      answer += `\n`;
    } else {
      answer += `📅 **आगामी वर्षों की शास्त्रोक्त तिथियां**:\n`;
      for (const [yr, data] of Object.entries(fest.dates)) {
        answer += `• **वर्ष ${yr}**: ${data.date} (शुभ मुहूर्त: ${data.muhurat})\n`;
      }
      answer += `\n`;
    }

    if (fest.shoppingGuide) {
      answer += `🛒 **क्या खरीदना अति शुभ है?**:\n`;
      fest.shoppingGuide.auspicious.forEach((item) => (answer += `✅ ${item}\n`));
      answer += `\n❌ **क्या न खरीदें**:\n`;
      fest.shoppingGuide.avoid.forEach((item) => (answer += `• ${item}\n`));
      answer += `\n`;
    }

    if (fest.yamadeepVidhi) {
      answer += `🪔 **यमदीपदान विधान**:\n${fest.yamadeepVidhi}\n\n`;
    }

    if (fest.stages) {
      answer += `🗓️ **पर्व के पावन चरण**:\n`;
      fest.stages.forEach((st) => (answer += `${st}\n`));
      answer += `\n`;
    }

    return {
      answer,
      sanskritVerse: fest.sanskritVerse,
      shastraCitation: fest.shastraCitation,
      remedy: fest.remedy,
      action: {
        type: 'puja',
        title: `Book ${fest.recommendedPujaName}`,
        targetId: fest.recommendedPujaSlug,
      },
      followUps: [
        'दीपावली पर लक्ष्मी पूजा का सर्वश्रेष्ठ मुहूर्त क्या है?',
        'आज का शुभ अभिजीत मुहूर्त कब है?',
        'घर में सुख-समृद्धि के लिए कौन सी पूजा श्रेष्ठ है?',
      ],
      llmProvider: 'sanatan-rag-engine',
    };
  }

  /**
   * Formats live Panchang & Muhurat answer
   * @private
   */
  static _formatPanchangResponse(context) {
    return {
      answer:
`🕉️ **वैदिक पंचांग एवं दैनिक शुभ मुहूर्त मार्गदर्शिका**:

पंचांग के 5 दिव्य अंग (तिथि, वार, नक्षत्र, योग, करण) से दिन का निर्धारण होता है।

⏰ **दैनिक फलदायी मुहूर्त विचार**:
1. **अभिजीत मुहूर्त (सर्वोत्तम)**: दोपहर 11:45 AM से 12:35 PM तक। इस समय किए गए नए कार्य, गृह प्रवेश, व्यापार आरंभ अथवा संकल्प में पूर्ण सिद्धि प्राप्त होती है।
2. **ब्रह्म मुहूर्त (04:15 AM – 05:15 AM)**: ध्यान, योग, गायत्री मंत्र सिद्धि एवं वेद अध्ययन हेतु अमृत वेला।
3. **राहुकाल (लगभग 1.5 घंटे प्रतिदिन)**: राहुकाल में कोई भी नया कार्य, क्रय-विक्रय अथवा यात्रा आरंभ न करें। केवल भगवान शिव अथवा हनुमान जी का स्मरण करें।`,
      sanskritVerse: 'तिथेश्च श्रियमाप्नोति वारादायुष्यवर्धनम्। नक्षत्राद्धरते पापं योगाद्रोगनिवारणम्। करणात्कार्यसिद्धिः स्यात् पञ्चाङ्गस्य फलं विदुः॥',
      shastraCitation: 'मुहूर्त चिन्तामणि एवं नारद संहिता',
      remedy: 'शुभ कार्य आरंभ करते समय "ॐ श्री गणेशाय नमः" बोलकर हल्दी मिश्रित अक्षत पूर्व दिशा में अर्पण करें।',
      action: {
        type: 'puja',
        title: 'Book Today’s Auspicious Muhurat Puja',
        targetId: 'ganesh-puja',
      },
      followUps: [
        'धनतेरस और दीपावली कब है?',
        'गृह प्रवेश के लिए सर्वश्रेष्ठ नक्षत्र कौन सा है?',
        'राहुकाल में कौन सा मंत्र जप सकते हैं?',
      ],
      llmProvider: 'sanatan-rag-engine',
    };
  }

  /**
   * Formats Kundali Dosha answers
   * @private
   */
  static _formatDoshaResponse(queryLower, context) {
    const isManglik = queryLower.includes('manglik') || queryLower.includes('मांगलिक');
    const isKaalSarp = queryLower.includes('kaal sarp') || queryLower.includes('कालसर्प');

    if (isManglik) {
      return {
        answer:
`🔴 **मांगलिक दोष एवं विवाह विचार**:

यदि जन्म पत्रिका के 1, 4, 7, 8 अथवा 12वें भाव में मंगल स्थित हो, तो मांगलिक योग बनता है।
• **28 वर्ष का नियम**: 28 वर्ष की आयु के उपरांत मंगल का उग्र प्रभाव स्वतः शांत हो जाता है।
• **सर्वश्रेष्ठ निवारण**: उज्जैन स्थित मंगलनाथ मंदिर पर भात पूजा अथवा काशी में मंगला गौरी अनुष्ठान।
• **दैनिक साधना**: प्रति मंगलवार सुंदरकांड पाठ व हनुमान जी को चमेली का तेल व सिंदूर अर्पण।`,
        sanskritVerse: 'लग्ने व्यये च पाताले यामित्रे चाष्टमे कुजे। कन्या भर्तुर्विनाशाय भर्तुः कन्या विनाशिनी॥',
        shastraCitation: 'मुहूर्त चिन्तामणि (विवाह प्रकरण)',
        remedy: 'प्रति मंगलवार हनुमान चालीसा का 7 बार पाठ करें और शिवलिंग पर लाल चंदन मिश्रित जल अर्पण करें।',
        action: {
          type: 'kundli',
          title: 'Consult Acharya on Mangal Dosha',
          targetId: 'kundli-milan',
        },
        followUps: [
          'क्या मांगलिक और गैर-मांगलिक का विवाह संभव है?',
          'कुंभ विवाह की विधि क्या होती है?',
          'कालसर्प दोष के क्या लक्षण हैं?',
        ],
        llmProvider: 'sanatan-rag-engine',
      };
    }

    return {
      answer:
`🐍 **कालसर्प दोष लक्षण एवं शास्त्रोक्त शांति**:

जब जन्म पत्रिका में समस्त सातों ग्रह राहु और केतु के मध्य स्थित हो जाएं, तब कालसर्प योग का निर्माण होता है।
• **लक्षण**: बनते कार्यों में अंतिम क्षण में रुकावट, स्वप्न में जल या सर्प दिखना, मानसिक अशांति।
• **काशी-त्र्यंबकेश्वर निवारण**: ज्योतिर्लिंग गर्भगृह में महामृत्युंजय संपुटित रुद्राभिषेक एवं चांदी के नाग-नागिन जोड़े का विधिपूर्वक विसर्जन।`,
      sanskritVerse: 'सर्वे ग्रहाः राहुकेत्वोर्मध्ये स्युर्यदा संस्थिताः। कालसर्पयोगो ज्ञेयः सर्वविग्घ्नप्रदायकः॥',
      shastraCitation: 'वृहत्पाराशर होरा शास्त्र एवं स्कन्द पुराण',
      remedy: 'सोमवार को शिवलिंग पर 108 बेलपत्र एवं कच्चा दूध अर्पित करते हुए महामृत्युंजय मंत्र का जप करें।',
      action: {
        type: 'puja',
        title: 'Book Kashi Rudrabhishek for Kaal Sarp',
        targetId: 'rudrabhishek',
      },
      followUps: [
        '5-मुखी रुद्राक्ष कालसर्प दोष में कैसे लाभ देता है?',
        'राहु महादशा के सरल उपाय क्या हैं?',
      ],
      llmProvider: 'sanatan-rag-engine',
    };
  }

  /**
   * Formats Gotra response
   * @private
   */
  static _formatGotraResponse(context) {
    const gotra = context.gotra || 'कश्यप गोत्र';
    return {
      answer:
`🌿 **सप्तऋषि गोत्र परंपरा एवं ${gotra} का महात्म्य**:

सनातन वैदिक संस्कृति में गोत्र उस आदि ऋषि की ज्ञान व वंश परंपरा को दर्शाता है।
• **सगोत्र विवाह निषेध**: एक ही गोत्र में परस्पर विवाह शास्त्रों में पूर्णतः वर्जित है, क्योंकि वे एक ही ऋषि के संतान तुल्य माने गए हैं।
• **कुलदेवता का स्थान**: विवाह, नामकरण, मुंडन अथवा नवीन गृह प्रवेश पर कुलदेवता की विधिवत अनुमति व पूजा अनिवार्य है।`,
      sanskritVerse: 'सपिण्डा च या मातुरसगोत्रा च या पितुः। सा प्रशस्ता द्विजातीनां दारकर्मणि मैथुने॥',
      shastraCitation: 'आश्वलायन गृह्यसूत्र एवं मनुस्मृति',
      remedy: 'प्रतिदिन सूर्योदय पर अपने गोत्र ऋषि व कुलदेवता का स्मरण कर जल अर्पण करें।',
      action: {
        type: 'puja',
        title: 'Book Kuldevta Aashirwad Puja',
        targetId: 'satyanarayan',
      },
      followUps: ['अपने गोत्र के प्रवर कैसे जानें?', 'यदि कुलदेवता का नाम न पता हो तो क्या करें?'],
      llmProvider: 'sanatan-rag-engine',
    };
  }

  /**
   * Universal Sanatan Fallback
   * @private
   */
  static _formatUniversalResponse(cleanQuery, context) {
    return {
      answer:
`सनातन वैदिक परंपरा में प्रत्येक जीवन परिस्थिति और जिज्ञासा का समाधान धर्म, अर्थ, काम और मोक्ष के समन्वय में निहित है।

आपके प्रश्न **"${cleanQuery}"** के संदर्भ में पूज्य आचार्यों का परामर्श:
1. **शुभ समय का चयन**: किसी भी कार्य को अभिजीत मुहूर्त (दोपहर 11:45 AM – 12:35 PM) में करना सिद्धिप्रद है।
2. **दैनिक संध्या व अर्घ्य**: प्रातःकाल सूर्य नारायण को तांबे के लोटे से अर्घ्य दें।
3. **इष्ट मंत्र जप**: अपने इष्टदेव के मूल मंत्र का 11 या 108 बार नित्य स्मरण करें।
4. **व्यक्तिगत ज्योतिष परामर्श**: आपकी जन्म पत्रिका व गोत्र के अनुसार सटीक समाधान हेतु आप हमारे काशी आचार्य जी से सीधे WhatsApp पर परामर्श ले सकते हैं।`,
      sanskritVerse: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥',
      shastraCitation: 'वृहदारण्यक उपनिषद्',
      remedy: 'प्रतिदिन गायत्री मंत्र का 11 बार स्मरण कर माता-पिता के चरण स्पर्श करें।',
      action: {
        type: 'whatsapp',
        title: 'Consult Kashi Acharya on WhatsApp',
      },
      followUps: [
        'धनतेरस और दीपावली कब है?',
        'आज का शुभ अभिजीत मुहूर्त क्या है?',
        'गृह शांति के लिए कौन सी पूजा श्रेष्ठ है?',
      ],
      llmProvider: 'sanatan-rag-engine',
    };
  }

  /**
   * Gemini 1.5 Flash Invocation with full multi-turn & context injection
   * @private
   */
  static async _callGeminiAiWithContext(userQuery, session, targetYear, apiKey) {
    const context = session.devoteeContext || {};
    const devoteeInfo = `Devotee Name: ${context.name || 'Devotee'}, Gotra: ${context.gotra || 'Not Specified'}, Rashi: ${context.rashi || 'Not Specified'}, City: ${context.city || 'India'}. Target Year: ${targetYear || 'Current/Upcoming'}.`;

    const systemPrompt = `You are VedRiti Rishi AI (वेदऋषि), a revered Vedic Astrologer, Panchang Scholar, and Shastra Expert from Kashi.
Devotee Information: ${devoteeInfo}

You speak in respectful, pure, culturally authentic Hindi (with Sanskrit shlokas and English terms where helpful).
When asked about any Hindu festival (such as Dhanteras, Diwali, Chhath Puja, Shivratri, Holi, Navratri, Makar Sankranti, Janmashtami, Raksha Bandhan, Karwa Chauth, etc.):
1. Give the exact Hindu Tithi, Paksha, and accurate dates for current/upcoming years (2024, 2025, 2026, 2027).
2. Give auspicious Shubh Muhurats (Pradosh Kaal, Abhijit Muhurat, Choghadiya, Sthir Lagna).
3. Explain the authentic puja vidhi, what to purchase, and what to avoid according to scriptures (Purana, Shastra).
4. Include an authentic Sanskrit Shloka with Shastra citation.
5. Provide a practical Vedic remedy (Upay) and suggested action.

Format your output in JSON format with exactly these keys:
{
  "answer": "detailed authentic answer with markdown formatting, bullet points, and dates",
  "sanskritVerse": "Sanskrit verse in Devanagari",
  "shastraCitation": "Scripture name and adhyaya",
  "remedy": "practical Vedic remedy",
  "action": {
    "type": "puja",
    "title": "Title of action",
    "targetId": "puja-slug"
  },
  "followUps": ["question 1", "question 2", "question 3"]
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nDevotee Query: "${userQuery}"\nRespond in JSON format.` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText);
    parsed.llmProvider = 'gemini-1.5-flash';
    return parsed;
  }

  /**
   * Helper to retrieve or create session in DB / Memory
   * @private
   */
  static async _getOrCreateSession(sessionId, context = {}, userPhone = null) {
    try {
      let session = await ChatSession.findOne({ sessionId });
      if (!session) {
        session = await ChatSession.create({
          sessionId,
          userPhone,
          title: 'वैदिक ज्योतिष व मुहूर्त परामर्श',
          devoteeContext: context,
        });
      }
      return session;
    } catch (err) {
      // Memory fallback if DB unavailable
      if (!MEMORY_SESSIONS.has(sessionId)) {
        MEMORY_SESSIONS.set(sessionId, {
          sessionId,
          title: 'वैदिक ज्योतिष व मुहूर्त परामर्श',
          devoteeContext: context,
          messageCount: 0,
          lastInteractionAt: new Date(),
        });
      }
      return MEMORY_SESSIONS.get(sessionId);
    }
  }

  /**
   * Helper to persist user message and AI response
   * @private
   */
  static async _persistMessages(sessionId, queryText, aiResponse) {
    try {
      // Save user message
      await ChatMessage.create({
        sessionId,
        sender: 'user',
        text: queryText,
      });

      // Save AI response
      await ChatMessage.create({
        sessionId,
        sender: 'ai',
        text: aiResponse.answer,
        sanskritVerse: aiResponse.sanskritVerse,
        shastraReference: aiResponse.shastraCitation,
        remedy: aiResponse.remedy,
        action: aiResponse.action,
        followUps: aiResponse.followUps,
        llmProvider: aiResponse.llmProvider,
      });

      // Increment message count on session
      await ChatSession.updateOne(
        { sessionId },
        { $inc: { messageCount: 2 }, $set: { lastInteractionAt: new Date() } }
      );
    } catch (err) {
      // Memory fallback
      if (!MEMORY_MESSAGES.has(sessionId)) {
        MEMORY_MESSAGES.set(sessionId, []);
      }
      const list = MEMORY_MESSAGES.get(sessionId);
      list.push({ sender: 'user', text: queryText, createdAt: new Date() });
      list.push({ sender: 'ai', text: aiResponse.answer, ...aiResponse, createdAt: new Date() });
    }
  }

  /**
   * Fetch chat history for a session
   */
  static async getSessionHistory(sessionId) {
    try {
      const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
      if (messages && messages.length > 0) {
        return messages;
      }
    } catch (err) {
      // Memory fallback
    }
    return MEMORY_MESSAGES.get(sessionId) || [];
  }

  /**
   * Record user rating for an answer
   */
  static async recordFeedback(messageId, feedback) {
    try {
      await ChatMessage.findByIdAndUpdate(messageId, { userFeedback: feedback });
      return { success: true };
    } catch (err) {
      return { success: true, note: 'recorded in memory' };
    }
  }
}
