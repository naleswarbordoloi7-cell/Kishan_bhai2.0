/**
 * Comprehensive Indian Languages Translation Dictionary & Localizer
 * Kisan Bhai Platform
 * Supported: Hindi, English, Gujarati, Punjabi, Marathi, Bengali, Assamese, Telugu, Tamil, Kannada, Malayalam, Odia
 */

export type SupportedLanguage =
  | 'hi'
  | 'en'
  | 'gu'
  | 'pa'
  | 'mr'
  | 'bn'
  | 'as'
  | 'te'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'or';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🌿' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🌾' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🌱' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🌿' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🌾' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🌾' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🍃' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🌱' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🍃' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🌾' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  hi: {
    appTitle: 'किसान भाई',
    tagline: 'बीज से बाज़ार तक — आपका AI कृषि साथी',
    dashboard: 'डैशबोर्ड',
    myCrops: 'मेरी फसलें',
    cropRecommendation: 'फसल चयन सलाहकार',
    soilHealth: 'मृदा स्वास्थ्य कार्ड',
    diseaseScanner: 'फसल रोग जांच',
    smartIrrigation: 'स्मार्ट सिंचाई',
    marketPrices: 'मंडी भाव',
    farmDiary: 'कृषि डायरी व खर्च',
    virtualClusters: 'वर्चुअल फार्म क्लस्टर',
    bulkBuying: 'सामूहिक खरीद',
    harvestPooling: 'फसल एकत्रीकरण',
    machinerySharing: 'कृषि यंत्र किराया',
    schemes: 'सरकारी योजनाएं',
    expertConsultation: 'कृषि वैज्ञानिक सलाह',
    community: 'किसान चौपाल',
    profitCalculator: 'मुनाफा कैलकुलेटर',
    weather: 'मौसम पूर्वानुमान',
    adminDashboard: 'प्रशासन डैशबोर्ड',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    searchPlaceholder: 'फसल, मंडी, रोग या सलाह खोजें...',
    aiGreeting: 'राम राम किसान भाई! आज आपकी फसल के लिए क्या सहायता चाहिए?',
    sprayWindow: 'कीटनाशक / पोषण छिड़काव खिड़की',
    optimalConditions: 'मौसम अनुकूल है',
    saveChanges: 'बदलाव सहेजें',
    cancel: 'रद्द करें',
    submit: 'जमा करें',
    loading: 'कृपया प्रतीक्षा करें...',
    verifiedData: 'सत्यापित डेटा',
    liveApi: 'लाइव सैटेलाइट व मौसम डेटा',
    demoModeNotice: 'डेमो मोड सक्रिय — परीक्षण डेटा प्रदर्शित',
    voiceAssistant: 'AI वॉयस सहायक',
    quickScan: 'रोग जांच',
    callExpert: 'विशेषज्ञ से बात करें',
    helpline: 'किसान हेल्पलाइन',
    soilMoisture: 'मृदा नमी',
    temperature: 'तापमान',
    rainChance: 'वर्षा संभावना',
    mandiRates: 'ताज़ा मंडी भाव',
    advisory: 'कृषि सलाह',
    pumpStatus: 'सिंचाई मोटर',
    activeCrops: 'सक्रिय फसलें',
    healthScore: 'स्वास्थ्य स्कोर',
    alerts: 'खेत अलर्ट',
    filter: 'फ़िल्टर',
    all: 'सभी',
  },
  en: {
    appTitle: 'Kisan Bhai',
    tagline: 'From Seed to Sale — Your AI Farming Partner',
    dashboard: 'Dashboard',
    myCrops: 'My Active Crops',
    cropRecommendation: 'AI Crop Recommendation',
    soilHealth: 'Soil Health Card',
    diseaseScanner: 'Crop Disease Scanner',
    smartIrrigation: 'Smart Irrigation',
    marketPrices: 'Mandi Market Rates',
    farmDiary: 'Farm Diary & Expenses',
    virtualClusters: 'Virtual Farm Clusters',
    bulkBuying: 'Collective Bulk Buying',
    harvestPooling: 'Harvest Pooling',
    machinerySharing: 'Machinery Sharing',
    schemes: 'Government Schemes',
    expertConsultation: 'Talk to Expert',
    community: 'Farmer Community',
    profitCalculator: 'Profit Calculator',
    weather: 'Agro Weather',
    adminDashboard: 'Admin Dashboard',
    settings: 'Settings',
    logout: 'Sign Out',
    searchPlaceholder: 'Search crops, mandis, pests or advice...',
    aiGreeting: 'Greetings Farmer Brother! How can I assist your farm today?',
    sprayWindow: 'Pesticide & Spray Window',
    optimalConditions: 'Optimal Field Conditions',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading, please wait...',
    verifiedData: 'Verified Agricultural Data',
    liveApi: 'Live Weather & Satellite Feed',
    demoModeNotice: 'Demo Mode Active — Test Data Displayed',
    voiceAssistant: 'AI Voice Assistant',
    quickScan: 'Disease Scan',
    callExpert: 'Talk to Expert',
    helpline: 'Kisan Helpline',
    soilMoisture: 'Soil Moisture',
    temperature: 'Temperature',
    rainChance: 'Rain Probability',
    mandiRates: 'Live Mandi Rates',
    advisory: 'Agro Advisory',
    pumpStatus: 'Irrigation Pump',
    activeCrops: 'Active Crops',
    healthScore: 'Health Score',
    alerts: 'Farm Alerts',
    filter: 'Filter',
    all: 'All',
  },
  gu: {
    appTitle: 'કિસાન ભાઈ',
    tagline: 'બીજ થી બજાર સુધી — તમારો AI ખેતી સાથી',
    dashboard: 'ડેશબોર્ડ',
    myCrops: 'મારા પાક',
    cropRecommendation: 'પાક પસંદગી સલાહકાર',
    soilHealth: 'જમીન આરોગ્ય કાર્ડ',
    diseaseScanner: 'પાક રોગ તપાસ',
    smartIrrigation: 'સ્માર્ટ પિયત',
    marketPrices: 'માર્કેટ યાર્ડ ભાવ',
    farmDiary: 'ખેતી ડાયરી અને ખર્ચ',
    virtualClusters: 'વર્ચ્યુઅલ ફાર્મ ક્લસ્ટર',
    bulkBuying: 'જથ્થાબંધ ખરીદી',
    harvestPooling: 'પાક એકત્રીકરણ',
    machinerySharing: 'સાધન ભાડે',
    schemes: 'સરકારી યોજનાઓ',
    expertConsultation: 'કૃષિ વૈજ્ઞાનિક સલાહ',
    community: 'ખેડૂત સમુદાય',
    profitCalculator: 'નફો કેલ્ક્યુલેટર',
    weather: 'હવામાન માહિતી',
    adminDashboard: 'એડમિન ડેશબોર્ડ',
    settings: 'સેટિંગ્સ',
    logout: 'લૉગ આઉટ',
    searchPlaceholder: 'પાક, યાર્ડ, રોગ અથવા સલાહ શોધો...',
    aiGreeting: 'રામ રામ કિસાન ભાઈ! આજે તમારા ખેતર માટે શું સહાય જોઈએ?',
    sprayWindow: 'દવા છંટકાવનો શ્રેષ્ઠ સમય',
    optimalConditions: 'હવામાન અનુકૂળ છે',
    saveChanges: 'ફેરફારો સાચવો',
    cancel: 'રદ કરો',
    submit: 'સબમિટ કરો',
    loading: 'રાહ જુઓ...',
    verifiedData: 'ચકાસાયેલ માહિતી',
    liveApi: 'લાઈવ હવામાન ડેટા',
    demoModeNotice: 'ડેમો મોડ સક્રિય',
    voiceAssistant: 'AI અવાજ સહાયક',
    quickScan: 'રોગ તપાસ',
    callExpert: 'નિષ્ણાત સાથે વાત કરો',
    helpline: 'કિસાન હેલ્પલાઇન',
    soilMoisture: 'જમીનનો ભેજ',
    temperature: 'તાપમાન',
    rainChance: 'વરસાદની શક્યતા',
    mandiRates: 'યાર્ડ ભાવ',
    advisory: 'ખેતી સલાહ',
    pumpStatus: 'પિયત પંપ',
    activeCrops: 'ચાલુ પાક',
    healthScore: 'આરોગ્ય સ્કોર',
    alerts: 'ચેતવણીઓ',
    filter: 'ફિલ્ટર',
    all: 'બધા',
  },
  pa: {
    appTitle: 'ਕਿਸਾਨ ਭਰਾ',
    tagline: 'ਬੀਜ ਤੋਂ ਮੰਡੀ ਤੱਕ — ਤੁਹਾਡਾ AI ਖੇਤੀ ਸਾਥੀ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    myCrops: 'ਮੇਰੀਆਂ ਫਸਲਾਂ',
    cropRecommendation: 'ਫਸਲ ਸਲਾਹਕਾਰ',
    soilHealth: 'ਮਿੱਟੀ ਸਿਹਤ ਕਾਰਡ',
    diseaseScanner: 'ਫਸਲ ਰੋਗ ਜਾਂਚ',
    smartIrrigation: 'ਸਮਾਰਟ ਸਿੰਚਾਈ',
    marketPrices: 'ਮੰਡੀ ਭਾਅ',
    farmDiary: 'ਖੇਤੀ ਡਾਇਰੀ ਅਤੇ ਖਰਚੇ',
    virtualClusters: 'ਵਰਚੁਅਲ ਫਾਰਮ ਕਲੱਸਟਰ',
    bulkBuying: 'ਸਮੂਹਿਕ ਖਰੀਦ',
    harvestPooling: 'ਫਸਲ ਪੂਲਿੰਗ',
    machinerySharing: 'ਮਸ਼ੀਨਰੀ ਕਿਰਾਇਆ',
    schemes: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ',
    expertConsultation: 'ਮਾਹਿਰ ਸਲਾਹ',
    community: 'ਕਿਸਾਨ ਚੌਪਾਲ',
    profitCalculator: 'ਮੁਨਾਫਾ ਕੈਲਕੁਲੇਟਰ',
    weather: 'ਮੌਸਮ ਜਾਣਕਾਰੀ',
    adminDashboard: 'ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ',
    settings: 'ਸੈਟਿੰਗਾਂ',
    logout: 'ਲੌਗ ਆਉਟ',
    searchPlaceholder: 'ਫਸਲ, ਮੰਡੀ ਜਾਂ ਰੋਗ ਖੋਜੋ...',
    aiGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਅੱਜ ਤੁਹਾਡੀ ਕੀ ਸਹਾਇਤਾ ਕਰ ਸਕਦੇ ਹਾਂ?',
    sprayWindow: 'ਸਪਰੇਅ ਦਾ ਸਮਾਂ',
    optimalConditions: 'ਮੌਸਮ ਅਨੁਕੂਲ ਹੈ',
    saveChanges: 'ਸੰਭਾਲੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    loading: 'ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ...',
    verifiedData: 'ਤਸਦੀਕਸ਼ੁਦਾ ਡੇਟਾ',
    liveApi: 'ਲਾਈਵ ਮੌਸਮ ਜਾਣਕਾਰੀ',
    demoModeNotice: 'ਡੈਮੋ ਮੋਡ ਚਾਲੂ ਹੈ',
    voiceAssistant: 'AI ਆਵਾਜ਼ ਸਹਾਇਕ',
    quickScan: 'ਰੋਗ ਜਾਂਚ',
    callExpert: 'ਮਾਹਿਰ ਨਾਲ ਗੱਲ ਕਰੋ',
    helpline: 'ਕਿਸਾਨ ਹੈਲਪਲਾਈਨ',
    soilMoisture: 'ਮਿੱਟੀ ਦੀ ਨਮੀ',
    temperature: 'ਤਾਪਮਾਨ',
    rainChance: 'ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ',
    mandiRates: 'ਮੰਡੀ ਭਾਅ',
    advisory: 'ਖੇਤੀ ਸਲਾਹ',
    pumpStatus: 'ਸਿੰਚਾਈ ਪੰਪ',
    activeCrops: 'ਚੱਲ ਰਹੀਆਂ ਫਸਲਾਂ',
    healthScore: 'ਸਿਹਤ ਸਕੋਰ',
    alerts: 'ਸੁਚੇਤਨਾਵਾਂ',
    filter: 'ਫਿਲਟਰ',
    all: 'ਸਾਰੇ',
  },
  as: {
    appTitle: 'কৃষক ভাই',
    tagline: 'বীজৰ পৰা বজাৰলৈ — আপোনাৰ AI কৃষি সহচৰ',
    dashboard: 'ডেশ্ববৰ্ড',
    myCrops: 'মোৰ খেতি / শস্য',
    cropRecommendation: 'শস্য নিৰ্বাচন পৰামৰ্শ',
    soilHealth: 'মাটি স্বাস্থ্য পত্ৰিকা',
    diseaseScanner: 'শস্য ৰোগ পৰীক্ষা',
    smartIrrigation: 'স্মাৰ্ট জলসিঞ্চন',
    marketPrices: 'বজাৰ দৰ / মণ্ডি দৰ',
    farmDiary: 'কৃষি ডায়েৰী আৰু খৰচ',
    virtualClusters: 'ভাৰ্চুৱেল ফাৰ্ম ক্লাষ্টাৰ',
    bulkBuying: 'সামূহিক ক্ৰয়',
    harvestPooling: 'শস্য একত্ৰীকৰণ',
    machinerySharing: 'কৃষি যন্ত্ৰ ভাৰা',
    schemes: 'চৰকাৰী আঁচনি',
    expertConsultation: 'কৃষি বিজ্ঞানীৰ পৰামৰ্শ',
    community: 'কৃষক সভা',
    profitCalculator: 'লাভ-লোকচান গণক',
    weather: 'বতৰৰ আগজাননী',
    adminDashboard: 'প্ৰশাসন ডেশ্ববৰ্ড',
    settings: 'ছেটিংছ',
    logout: 'লগ আউট',
    searchPlaceholder: 'শস্য, বজাৰ, ৰোগ বা পৰামৰ্শ বিচাৰক...',
    aiGreeting: 'নমস্কাৰ কৃষক ভাই! আজি আপোনাৰ খেতিৰ বাবে কি সহায় কৰিব পাৰোঁ?',
    sprayWindow: 'ঔষধ ছটিওৱাৰ উপযুক্ত সময়',
    optimalConditions: 'বতৰ অনুকূল',
    saveChanges: 'পৰিৱৰ্তন সংৰক্ষণ কৰক',
    cancel: 'বাতিল কৰক',
    submit: 'দাখিল কৰক',
    loading: 'অনুগ্ৰহ কৰি অপেক্ষা কৰক...',
    verifiedData: 'প্ৰমাণিত তথ্য',
    liveApi: 'লাইভ উপগ্ৰহ আৰু বতৰৰ তথ্য',
    demoModeNotice: 'ডেমো ম’ড সক্ৰিয়',
    voiceAssistant: 'AI মাত সহায়ক',
    quickScan: 'ৰোগ স্কেন',
    callExpert: 'বিশেষজ্ঞৰ সৈতে কথা পাতক',
    helpline: 'কৃষক হেল্পলাইন',
    soilMoisture: 'মাটিৰ আৰ্দ্ৰতা',
    temperature: 'উত্তাপ',
    rainChance: 'বৰষুণৰ সম্ভাৱনা',
    mandiRates: 'বজাৰ দৰ',
    advisory: 'কৃষি পৰামৰ্শ',
    pumpStatus: 'জলসিঞ্চন পাম্প',
    activeCrops: 'বৰ্তমানৰ শস্য',
    healthScore: 'স্বাস্থ্য স্কোৰ',
    alerts: 'সতৰ্কবাৰ্তা',
    filter: 'ফিল্টাৰ',
    all: 'সকলো',
  },
  bn: {
    appTitle: 'কিষাণ ভাই',
    tagline: 'বীজ থেকে বাজার — আপনার এআই কৃষি সঙ্গী',
    dashboard: 'ড্যাশবোর্ড',
    myCrops: 'আমার ফসল',
    cropRecommendation: 'ফসল পরামর্শ',
    soilHealth: 'মাটি স্বাস্থ্য কার্ড',
    diseaseScanner: 'রোগ নির্ণয়',
    smartIrrigation: 'স্মার্ট সেচ',
    marketPrices: 'বাজার দর',
    farmDiary: 'কৃষি ডায়েরি ও খরচ',
    virtualClusters: 'ভার্চুয়াল ফার্ম ক্লাস্টার',
    bulkBuying: 'যৌথ ক্রয়',
    harvestPooling: 'ফসল একত্রীকরণ',
    machinerySharing: 'যন্ত্রপাতি ভাড়া',
    schemes: 'সরকারি প্রকল্প',
    expertConsultation: 'কৃষি বিশেষজ্ঞের পরামর্শ',
    community: 'কৃষক সম্প্রদায়',
    profitCalculator: 'মুনাফা ক্যালকুলেটর',
    weather: 'আবহাওয়ার পূর্বাভাস',
    adminDashboard: 'অ্যাডমিন',
    settings: 'সেটিংস',
    logout: 'লগআউট',
    searchPlaceholder: 'ফসল, বাজার বা রোগ অনুসন্ধান করুন...',
    aiGreeting: 'নমস্কার কৃষক ভাই! আজ কীভাবে সাহায্য করতে পারি?',
    sprayWindow: 'স্প্রে করার সময়',
    optimalConditions: 'অনুকূল আবহাওয়া',
    saveChanges: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    submit: 'জমা দিন',
    loading: 'অপেক্ষা করুন...',
    verifiedData: 'যাচাইকৃত তথ্য',
    liveApi: 'লাইভ আবহাওয়া তথ্য',
    demoModeNotice: 'ডেমো মোড চালু',
    voiceAssistant: 'AI ভয়েস সহকারী',
    quickScan: 'রোগ স্ক্যান',
    callExpert: 'বিশেষজ্ঞের সাথে কথা বলুন',
    helpline: 'কৃষক হেল্পলাইন',
    soilMoisture: 'মাটির আর্দ্রতা',
    temperature: 'তাপমাত্রা',
    rainChance: 'বৃষ্টির সম্ভাবনা',
    mandiRates: 'বাজার দর',
    advisory: 'কৃষি পরামর্শ',
    pumpStatus: 'সেচ পাম্প',
    activeCrops: 'বর্তমান ফসল',
    healthScore: 'স্বাস্থ্য স্কোর',
    alerts: 'সতর্কতা',
    filter: 'ফিল্টার',
    all: 'সমস্ত',
  },
  mr: {
    appTitle: 'किसान भाई',
    tagline: 'बियाण्यापासून बाजारापर्यंत — तुमचा AI शेती मित्र',
    dashboard: 'डॅशबोर्ड',
    myCrops: 'माझी पिके',
    cropRecommendation: 'पीक शिफारस',
    soilHealth: 'माती आरोग्य पत्रिका',
    diseaseScanner: 'पीक रोग निदान',
    smartIrrigation: 'स्मार्ट सिंचन',
    marketPrices: 'बाजार भाव',
    farmDiary: 'शेती रोजनिशी व खर्च',
    virtualClusters: 'व्हर्च्युअल फार्म क्लस्टर',
    bulkBuying: 'सामूहिक खरेदी',
    harvestPooling: 'माल एकत्रिकरण',
    machinerySharing: 'यंत्रसामग्री भाडेतत्त्व',
    schemes: 'शासकीय योजना',
    expertConsultation: 'कृषी तज्ज्ञ सल्ला',
    community: 'शेतकरी मंच',
    profitCalculator: 'नफा गणक',
    weather: 'हवामान अंदाज',
    adminDashboard: 'प्रशासन',
    settings: 'सेटिंग्ज',
    logout: 'बाहेर पडा',
    searchPlaceholder: 'पीक, बाजार किंवा रोग शोधा...',
    aiGreeting: 'राम राम शेतकरी मित्रा! आज काय मदत हवी आहे?',
    sprayWindow: 'फवारणीची योग्य वेळ',
    optimalConditions: 'हवामान अनुकूल आहे',
    saveChanges: 'बदल जतन करा',
    cancel: 'रद्द करा',
    submit: 'सबमिट करा',
    loading: 'कृपया प्रतीक्षा करा...',
    verifiedData: 'प्रमाणित माहिती',
    liveApi: 'थेट हवामान माहिती',
    demoModeNotice: 'डेमो मोड सक्रिय',
    voiceAssistant: 'AI व्हॉईस सहाय्यक',
    quickScan: 'रोग स्कॅन',
    callExpert: 'तज्ज्ञांशी बोला',
    helpline: 'शेतकरी हेल्पलाइन',
    soilMoisture: 'मातीतील ओलावा',
    temperature: 'तापमान',
    rainChance: 'पावसाची शक्यता',
    mandiRates: 'बाजार भाव',
    advisory: 'कृषी सल्ला',
    pumpStatus: 'सिंचन पंप',
    activeCrops: 'सक्रिय पिके',
    healthScore: 'आरोग्य गुण',
    alerts: 'इशारे',
    filter: 'फिल्टर',
    all: 'सर्व',
  },
  te: {
    appTitle: 'కిసాన్ భాయ్',
    tagline: 'విత్తనం నుండి విక్రయం వరకు — మీ AI వ్యవసాయ భాగస్వామి',
    dashboard: 'డ్యాష్‌బోర్డ్',
    myCrops: 'నా పంటలు',
    cropRecommendation: 'పంట ఎంపిక సలహా',
    soilHealth: 'నేల ఆరోగ్య పత్రం',
    diseaseScanner: 'తెగుళ్ల గుర్తింపు',
    smartIrrigation: 'స్మార్ట్ నీటిపారుదల',
    marketPrices: 'మార్కెట్ ధరలు',
    farmDiary: 'వ్యవసాయ డైరీ & ఖర్చులు',
    virtualClusters: 'వర్చువల్ ఫార్మ్ క్లస్టర్',
    bulkBuying: 'సామూహిక కొనుగోలు',
    harvestPooling: 'దిగుబడి పూలింగ్',
    machinerySharing: 'యంత్రాల అద్దె',
    schemes: 'ప్రభుత్వ పథకాలు',
    expertConsultation: 'వ్యవసాయ నిపుణుల సలహా',
    community: 'రైతు వేదిక',
    profitCalculator: 'లాభాల కాలిక్యులేటర్',
    weather: 'వాతావరణ వివరాలు',
    adminDashboard: 'అడ్మిన్ డ్యాష్‌బోర్డ్',
    settings: 'సెట్టింగ్‌లు',
    logout: 'లాగ్ అవుట్',
    searchPlaceholder: 'పంటలు, ధరలు లేదా వ్యాధులు వెతకండి...',
    aiGreeting: 'నమస్కారం రైతు సోదరా! ఈరోజు మీ పంటకు ఏం సహాయం కావాలి?',
    sprayWindow: 'మందులు పిచికారీ సమయం',
    optimalConditions: 'అనుకూల వాతావరణం',
    saveChanges: 'మార్పులు భద్రపరుచు',
    cancel: 'రద్దు చేయండి',
    submit: 'సమర్పించండి',
    loading: 'దయచేసి వేచి ఉండండి...',
    verifiedData: 'ధృవీకరించబడిన సమాచారం',
    liveApi: 'ప్రత్యక్ష వాతావరణ సమాచారం',
    demoModeNotice: 'డెమో మోడ్ యాక్టివ్',
    voiceAssistant: 'AI వాయిస్ అసిస్టెంట్',
    quickScan: 'తెగుళ్ల తనిఖీ',
    callExpert: 'నిపుణుడితో మాట్లాడండి',
    helpline: 'రైతు హెల్ప్‌లైన్',
    soilMoisture: 'నేల తేమ',
    temperature: 'ఉష్ణోగ్రత',
    rainChance: 'వర్ష సూచన',
    mandiRates: 'మార్కెట్ ధరలు',
    advisory: 'వ్యవసాయ సలహా',
    pumpStatus: 'మోటార్ పంప్',
    activeCrops: 'ప్రస్తుత పంటలు',
    healthScore: 'ఆరోగ్య స్కోర్',
    alerts: 'హెచ్చరికలు',
    filter: 'ఫిల్టర్',
    all: 'అన్నీ',
  },
  ta: {
    appTitle: 'கிசான் பாய்',
    tagline: 'விதையிலிருந்து சந்தை வரை — உங்கள் AI விவசாய தோழன்',
    dashboard: 'டாஷ்போர்டு',
    myCrops: 'என் பயிர்கள்',
    cropRecommendation: 'பயிர் பரிந்துரை',
    soilHealth: 'மண் வள அட்டை',
    diseaseScanner: 'பயிர் நோய் கண்டறிதல்',
    smartIrrigation: 'ஸ்மார்ட் பாசனம்',
    marketPrices: 'சந்தை விலை நிலவரம்',
    farmDiary: 'பண்ணை நாட்குறிப்பு & செலவுகள்',
    virtualClusters: 'விவசாய குழுமம்',
    bulkBuying: 'மொத்த கொள்முதல்',
    harvestPooling: 'விளைச்சல் திரட்டல்',
    machinerySharing: 'இயந்திர வாடகை',
    schemes: 'அரசு திட்டங்கள்',
    expertConsultation: 'நிபுணர் ஆலோசனை',
    community: 'விவசாயிகள் மன்றம்',
    profitCalculator: 'லாபக் கணிப்பான்',
    weather: 'வானிலை முன்னறிவிப்பு',
    adminDashboard: 'நிர்வாக டாஷ்போர்டு',
    settings: 'அமைப்புகள்',
    logout: 'வெளியேறு',
    searchPlaceholder: 'பயிர், சந்தை அல்லது நோய் தேடவும்...',
    aiGreeting: 'வணக்கம் விவசாய தோழரே! இன்று என்ன உதவி வேண்டும்?',
    sprayWindow: 'தெளிக்கும் உகந்த நேரம்',
    optimalConditions: 'வானிலை உகந்தது',
    saveChanges: 'சேமிக்கவும்',
    cancel: 'ரத்து செய்',
    submit: 'சமர்ப்பிக்கவும்',
    loading: 'காத்திருக்கவும்...',
    verifiedData: 'சரிபார்க்கப்பட்ட தகவல்',
    liveApi: 'நேரலை வானிலை தகவல்',
    demoModeNotice: 'டெமோ முறை இயக்கத்தில் உள்ளது',
    voiceAssistant: 'AI குரல் உதவியாளர்',
    quickScan: 'நோய் ஆய்வு',
    callExpert: 'நிபுணரிடம் பேசவும்',
    helpline: 'உழவர் உதவி எண்',
    soilMoisture: 'மண் ஈரம்',
    temperature: 'வெப்பநிலை',
    rainChance: 'மழை வாய்ப்பு',
    mandiRates: 'சந்தை விலை',
    advisory: 'விவசாய ஆலோசனை',
    pumpStatus: 'பாசன பம்பு',
    activeCrops: 'நடப்பு பயிர்கள்',
    healthScore: 'ஆரோக்கிய மதிப்பீடு',
    alerts: 'எச்சரிக்கைகள்',
    filter: 'வடிகட்டுதல்',
    all: 'அனைத்தும்',
  },
  kn: {
    appTitle: 'ಕಿಸಾನ್ ಭಾಯ್',
    tagline: 'ಬೀಜದಿಂದ ಮಾರುಕಟ್ಟೆಯವರೆಗೆ — ನಿಮ್ಮ AI ಕೃಷಿ ಸಂಗಾತಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    myCrops: 'ನನ್ನ ಬೆಳೆಗಳು',
    cropRecommendation: 'ಬೆಳೆ ಸಲಹೆಗಾರ',
    soilHealth: 'ಮಣ್ಣು ಆರೋಗ್ಯ ಪತ್ರಿಕೆ',
    diseaseScanner: 'ಬೆಳೆ ರೋಗ ಪರೀಕ್ಷೆ',
    smartIrrigation: 'ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ',
    marketPrices: 'ಮಾರುಕಟ್ಟೆ ದರಗಳು',
    farmDiary: 'ಕೃಷಿ ಡೈರಿ ಮತ್ತು ಖರ್ಚು',
    virtualClusters: 'ವರ್ಚುವಲ್ ಫಾರ್ಮ್ ಕ್ಲಸ್ಟರ್',
    bulkBuying: 'ಸಾಮೂಹಿಕ ಖರೀದಿ',
    harvestPooling: 'ಬೆಳೆ ಸಂಗ್ರಹ',
    machinerySharing: 'ಯಂತ್ರೋಪಕರಣ ಬಾಡಿಗೆ',
    schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    expertConsultation: 'ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ',
    community: 'ರೈತ ವೇದಿಕೆ',
    profitCalculator: 'ಲಾಭ ಲೆಕ್ಕಾಚಾರ',
    weather: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
    adminDashboard: 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    logout: 'ಲಾಗ್ ಔಟ್',
    searchPlaceholder: 'ಬೆಳೆಗಳು, ಮಾರುಕಟ್ಟೆ ಅಥವಾ ರೋಗಗಳನ್ನು ಹುಡುಕಿ...',
    aiGreeting: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ಇಂದು ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ಏನು ಸಹಾಯ ಬೇಕು?',
    sprayWindow: 'ಔಷಧಿ ಸಿಂಪಡಿಸುವ ಸೂಕ್ತ ಸಮಯ',
    optimalConditions: 'ಅನುಕೂಲಕರ ಹವಾಮಾನ',
    saveChanges: 'ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    submit: 'ಸಲ್ಲಿಸಿ',
    loading: 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...',
    verifiedData: 'ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿ',
    liveApi: 'ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿ',
    demoModeNotice: 'ಡೆಮೊ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    voiceAssistant: 'AI ಧ್ವನಿ ಸಹಾಯಕ',
    quickScan: 'ರೋಗ ಪರೀಕ್ಷೆ',
    callExpert: 'ತಜ್ಞರೊಂದಿಗೆ ಮಾತನಾಡಿ',
    helpline: 'ಕಿಸಾನ್ ಸಹಾಯವಾಣಿ',
    soilMoisture: 'ಮಣ್ಣಿನ ತೇವಾಂಶ',
    temperature: 'ತಾಪಮಾನ',
    rainChance: 'ಮಳೆಯ ಸಾಧ್ಯತೆ',
    mandiRates: 'ಮಾರುಕಟ್ಟೆ ದರ',
    advisory: 'ಕೃಷಿ ಸಲಹೆ',
    pumpStatus: 'ನೀರಾವರಿ ಪಂಪ್',
    activeCrops: 'ಪ್ರಸ್ತುತ ಬೆಳೆಗಳು',
    healthScore: 'ಆರೋಗ್ಯ ಸ್ಕೋರ್',
    alerts: 'ಎಚ್ಚರಿಕೆಗಳು',
    filter: 'ಫಿಲ್ಟರ್',
    all: 'ಎಲ್ಲವೂ',
  },
  ml: {
    appTitle: 'കിസാൻ ഭായ്',
    tagline: 'വിത്ത് മുതൽ വിപണി വരെ — നിങ്ങളുടെ AI കാർഷിക പങ്കാളി',
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    myCrops: 'എന്റെ വിളകൾ',
    cropRecommendation: 'വിള തിരഞ്ഞെടുക്കൽ ഉപദേശം',
    soilHealth: 'മണ്ണ് പരിശോധനാ കാർഡ്',
    diseaseScanner: 'വിള രോഗ നിർണയം',
    smartIrrigation: 'സ്മാർട്ട് ജലസേചനം',
    marketPrices: 'വിപണി വിലനിലവാരം',
    farmDiary: 'കൃഷി ഡയറിയും ചെലവും',
    virtualClusters: 'വെർച്വൽ ഫാം ക്ലസ്റ്റർ',
    bulkBuying: 'കൂട്ടായ വാങ്ങൽ',
    harvestPooling: 'വിള ശേഖരണം',
    machinerySharing: 'യന്ത്രങ്ങൾ വാടകയ്ക്ക്',
    schemes: 'സർക്കാർ പദ്ധതികൾ',
    expertConsultation: 'കാർഷിക ശാസ്ത്രജ്ഞരുടെ ഉപദേശം',
    community: 'കർഷക വേദി',
    profitCalculator: 'ലാഭ കണക്കുകൂട്ടൽ',
    weather: 'കാലാവസ്ഥ പ്രവചനം',
    adminDashboard: 'അഡ്മിൻ ഡാഷ്‌ബോർഡ്',
    settings: 'ക്രമീകരണങ്ങൾ',
    logout: 'ലോഗ് ഔട്ട്',
    searchPlaceholder: 'വിള, വിപണി, രോഗം എന്നിവ തിരയുക...',
    aiGreeting: 'നമസ്കാരം കർഷക സുഹൃത്തേ! ഇന്ന് നിങ്ങളുടെ കൃഷിക്ക് എന്ത് സഹായം വേണം?',
    sprayWindow: 'മരുന്ന് തളിക്കാൻ അനുയോജ്യമായ സമയം',
    optimalConditions: 'കാലാവസ്ഥ അനുകൂലമാണ്',
    saveChanges: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക',
    cancel: 'റദ്ദാക്കുക',
    submit: 'സമർപ്പിക്കുക',
    loading: 'ദയവായി കാത്തിരിക്കൂ...',
    verifiedData: 'സ്ഥിരീകരിച്ച വിവരങ്ങൾ',
    liveApi: 'തത്സമയ കാലാവസ്ഥ വിവരങ്ങൾ',
    demoModeNotice: 'ഡെമോ മോഡ് സജീവമാണ്',
    voiceAssistant: 'AI വോയ്‌സ് അസിസ്റ്റന്റ്',
    quickScan: 'രോഗ പരിശോധന',
    callExpert: 'വിദഗ്ധരുമായി സംസാരിക്കുക',
    helpline: 'കിസാൻ ഹെൽപ്പ്‌ലൈൻ',
    soilMoisture: 'മണ്ണിലെ ഈർപ്പം',
    temperature: 'താപനില',
    rainChance: 'മഴയ്ക്കുള്ള സാധ്യത',
    mandiRates: 'വിപണി വില',
    advisory: 'കാർഷിക ഉപദേശം',
    pumpStatus: 'ജലസേചന പമ്പ്',
    activeCrops: 'നിലവിലെ വിളകൾ',
    healthScore: 'ആരോഗ്യ സ്കോർ',
    alerts: 'മുന്നറിയിപ്പുകൾ',
    filter: 'ഫിൽട്ടർ',
    all: 'എല്ലാം',
  },
  or: {
    appTitle: 'କିଷାନ ଭାଇ',
    tagline: 'ବିହନରୁ ବଜାର ପର୍ଯ୍ୟନ୍ତ — ଆପଣଙ୍କ AI କୃଷି ସାଥୀ',
    dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
    myCrops: 'ମୋ ଫସଲ',
    cropRecommendation: 'ଫସଲ ପରାମର୍ଶ',
    soilHealth: 'ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ',
    diseaseScanner: 'ଫସଲ ରୋଗ ପରୀକ୍ଷା',
    smartIrrigation: 'ସ୍ମାର୍ଟ ଜଳସେଚନ',
    marketPrices: 'ମଣ୍ଡି ଦର',
    farmDiary: 'କୃଷି ଡାଏରୀ ଓ ଖର୍ଚ୍ଚ',
    virtualClusters: 'ଭର୍ଚୁଆଲ ଫାର୍ମ କ୍ଲଷ୍ଟର',
    bulkBuying: 'ସାମୂହିକ କ୍ରୟ',
    harvestPooling: 'ଫସଲ ଏକତ୍ରୀକରଣ',
    machinerySharing: 'ଯନ୍ତ୍ରପାତି ଭଡ଼ା',
    schemes: 'ସରକାରୀ ଯୋଜନା',
    expertConsultation: 'ବିଶେଷଜ୍ଞ ପରାମର୍ଶ',
    community: 'କୃଷକ ମଞ୍ଚ',
    profitCalculator: 'ଲାଭ କାଲକୁଲେଟର',
    weather: 'ପାଣିପାଗ ସୂଚନା',
    adminDashboard: 'ପ୍ରଶାସନ',
    settings: 'ସେଟିଙ୍ଗ୍ସ',
    logout: 'ଲଗ୍ ଆଉଟ୍',
    searchPlaceholder: 'ଫସଲ, ମଣ୍ଡି ବା ରୋଗ ଖୋଜନ୍ତୁ...',
    aiGreeting: 'ନମସ୍କାର କୃଷକ ଭାଇ! ଆଜି ଆପଣଙ୍କ କୃଷି ପାଇଁ କି ସାହାଯ୍ୟ ଦରକାର?',
    sprayWindow: 'ସ୍ପ୍ରେ କରିବାର ଉପଯୁକ୍ତ ସମୟ',
    optimalConditions: 'ଅନୁକୂଳ ପାଣିପାଗ',
    saveChanges: 'ସାଇତନ୍ତୁ',
    cancel: 'ବାତିଲ୍ କରନ୍ତୁ',
    submit: 'ଦାଖଲ କରନ୍ତୁ',
    loading: 'ଦୟାକରି ଅପେକ୍ଷା କରନ୍ତୁ...',
    verifiedData: 'ଯାଞ୍ଚ ହୋଇଥିବା ତଥ୍ୟ',
    liveApi: 'ଲାଇଭ୍ ପାଣିପାଗ ତଥ୍ୟ',
    demoModeNotice: 'ଡେମୋ ମୋଡ୍ ସକ୍ରିୟ ଅଛି',
    voiceAssistant: 'AI ଭଏସ୍ ସହାୟକ',
    quickScan: 'ରୋଗ ଯାଞ୍ଚ',
    callExpert: 'ବିଶେଷଜ୍ଞଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ',
    helpline: 'କିଷାନ ହେଲ୍ପଲାଇନ୍',
    soilMoisture: 'ମାଟିର ଆର୍ଦ୍ରତା',
    temperature: 'ତାପମାତ୍ରା',
    rainChance: 'ବର୍ଷା ସମ୍ଭାବନା',
    mandiRates: 'ମଣ୍ଡି ଦର',
    advisory: 'କୃଷି ପରାମର୍ଶ',
    pumpStatus: 'ଜଳସେଚନ ପମ୍ପ',
    activeCrops: 'ବର୍ତ୍ତମାନର ଫସଲ',
    healthScore: 'ସ୍ୱାସ୍ଥ୍ୟ ସ୍କୋର',
    alerts: 'ସତର୍କତା',
    filter: 'ଫିଲ୍ଟର୍',
    all: 'ସମସ୍ତ',
  },
};

/**
 * Robust translator function with language fallback
 */
export function getTranslation(lang: string, key: string, fallback?: string): string {
  const langKey = (lang || 'hi') as SupportedLanguage;
  if (TRANSLATIONS[langKey] && TRANSLATIONS[langKey][key]) {
    return TRANSLATIONS[langKey][key];
  }
  if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
    return TRANSLATIONS['en'][key];
  }
  if (TRANSLATIONS['hi'] && TRANSLATIONS['hi'][key]) {
    return TRANSLATIONS['hi'][key];
  }
  return fallback || key;
}

/**
 * Maps language code to browser speech synthesis / recognition language code
 */
export function getSpeechLanguageCode(lang: string): string {
  const map: Record<string, string> = {
    hi: 'hi-IN',
    en: 'en-IN',
    gu: 'gu-IN',
    pa: 'pa-IN',
    as: 'as-IN',
    bn: 'bn-IN',
    mr: 'mr-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    or: 'or-IN',
  };
  return map[lang] || 'hi-IN';
}

/**
 * Returns spoken farm advisory for dashboard in native language
 */
export function getLocalizedSpokenAdvisory(
  lang: string,
  tempVal: number,
  rainVal: number,
  moisturePct: number
): { text: string; langCode: string } {
  const langCode = getSpeechLanguageCode(lang);
  const isRainy = rainVal >= 50;

  switch (lang) {
    case 'hi':
      return {
        text: `राम राम किसान भाई। आज का तापमान ${tempVal} डिग्री सेल्सियस है और बारिश की संभावना ${rainVal} प्रतिशत है। खेत की मिट्टी में नमी ${moisturePct} प्रतिशत है। ${
          isRainy
            ? 'बारिश के अनुमान के कारण आज कीटनाशक या खाद का छिड़काव न करें और जल निकासी नालियां साफ रखें।'
            : 'मौसम सामान्य है, नियमित कृषि कार्य जारी रख सकते हैं।'
        }`,
        langCode: 'hi-IN',
      };
    case 'gu':
      return {
        text: `રામ રામ ખેડૂત મિત્ર. આજનું તાપમાન ${tempVal} ડિગ્રી અને વરસાદની શક્યતા ${rainVal} ટકા છે. જમીનમાં ભેજ ${moisturePct} ટકા છે. ${
          isRainy
            ? 'ભારે વરસાદની શક્યતાને લીધે દવાનો છંટકાવ મુલતવી રાખો અને પાણીના નિકાલની વ્યવસ્થા કરો.'
            : 'હવામાન અનુકૂળ છે, નિયમિત ખેતી કામ ચાલુ રાખો.'
        }`,
        langCode: 'gu-IN',
      };
    case 'pa':
      return {
        text: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ। ਅੱਜ ਦਾ ਤਾਪਮਾਨ ${tempVal} ਡਿਗਰੀ ਹੈ ਅਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${rainVal} ਫ਼ੀਸਦੀ ਹੈ। ਮਿੱਟੀ ਦੀ ਨਮੀ ${moisturePct} ਫ਼ੀਸਦੀ ਹੈ। ${
          isRainy
            ? 'ਮੀਂਹ ਦੇ ਅਨੁਮਾਨ ਕਰਕੇ ਅੱਜ ਸਪਰੇਅ ਨਾ ਕਰੋ ਅਤੇ ਪਾਣੀ ਨਿਕਾਸੀ ਦਾ ਧਿਆਨ ਰੱਖੋ।'
            : 'ਮੌਸਮ ਸਾਫ਼ ਹੈ, ਆਮ ਖੇਤੀ ਕੰਮ ਜਾਰੀ ਰੱਖ ਸਕਦੇ ਹੋ।'
        }`,
        langCode: 'pa-IN',
      };
    case 'as':
      return {
        text: `নমস্কাৰ কৃষক ভাই। আজিৰ উত্তাপ ${tempVal} ডিগ্ৰী চেলচিয়াছ আৰু বৰষুণৰ সম্ভাৱনা ${rainVal} শতাংশ। মাটিৰ আৰ্দ্ৰতা ${moisturePct} শতাংশ। ${
          isRainy
            ? 'বৰষুণৰ সম্ভাৱনা থকা বাবে আজি কীটনাশক ছটিওৱা বন্ধ ৰাখক আৰু পানী নিষ্কাশন নলা পৰিষ্কাৰ কৰক।'
            : 'বতৰ অনুকূল হৈ আছে, নিয়মীয়া কৃষি কাৰ্য চলাই থাকিব পাৰে।'
        }`,
        langCode: 'as-IN',
      };
    case 'bn':
      return {
        text: `নমস্কার কৃষক ভাই। আজকের তাপমাত্রা ${tempVal} ডিগ্রি এবং বৃষ্টির সম্ভাবনা ${rainVal} শতাংশ। মাটির আর্দ্রতা ${moisturePct} শতাংশ। ${
          isRainy
            ? 'বৃষ্টির অনুমানের কারণে আজ কীটনাশক স্প্রে করবেন না এবং নিকাশী নালা পরিষ্কার রাখুন।'
            : 'আবহাওয়া অনুকূল, নিয়মিত কৃষিকাজ চালিয়ে যেতে পারেন।'
        }`,
        langCode: 'bn-IN',
      };
    case 'mr':
      return {
        text: `राम राम शेतकरी मित्रा. आजचे तापमान ${tempVal} अंश सेल्सिअस असून पावसाची शक्यता ${rainVal} टक्के आहे. जमिनीत ओलावा ${moisturePct} टक्के आहे. ${
          isRainy
            ? 'पावसाच्या शक्यतेमुळे आज फवारणी टाळा आणि पाण्याचा निचरा व्यवस्थित ठेवा.'
            : 'हवामान अनुकूल आहे, नियमित कामे सुरू ठेवू शकता.'
        }`,
        langCode: 'mr-IN',
      };
    case 'te':
      return {
        text: `నమస్కారం రైతు సోదరా. ఈరోజు ఉష్ణోగ్రత ${tempVal} డిగ్రీలు మరియు వర్ష సూచన ${rainVal} శాతం. నేల తేమ ${moisturePct} శాతం. ${
          isRainy
            ? 'వర్షం వచ్చే అవకాశం ఉన్నందున నేడు మందులు పిచికారీ చేయవద్దు.'
            : 'వాతావరణం అనుకూలంగా ఉంది, సాధారణ పనులు చేసుకోవచ్చు.'
        }`,
        langCode: 'te-IN',
      };
    case 'ta':
      return {
        text: `வணக்கம் விவசாய தோழரே. இன்றைய வெப்பநிலை ${tempVal} டிகிரி மற்றும் மழை வாய்ப்பு ${rainVal} சதவீதம். மண் ஈரம் ${moisturePct} சதவீதம். ${
          isRainy
            ? 'மழை பெய்ய வாய்ப்புள்ளதால் இன்று பூச்சிக்கொல்லி தெளிப்பதை தவிர்க்கவும்.'
            : 'வானிலை சாதகமாக உள்ளது, வழக்கமான பணிகளை தொடரலாம்.'
        }`,
        langCode: 'ta-IN',
      };
    case 'kn':
      return {
        text: `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ. ಇಂದಿನ ತಾಪಮಾನ ${tempVal} ಡಿಗ್ರಿ ಮತ್ತು ಮಳೆಯ ಸಾಧ್ಯತೆ ${rainVal} ಪ್ರತಿಶತ. ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisturePct} ಪ್ರತಿಶತ. ${
          isRainy
            ? 'ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇರುವುದರಿಂದ ಇಂದು ಔಷಧ ಸಿಂಪಡಿಸಬೇಡಿ.'
            : 'ಹವಾಮಾನ ಅನುಕೂಲಕರವಾಗಿದೆ, ನಿಯಮಿತ ಕೆಲಸ ಮುಂದುವರಿಸಿ.'
        }`,
        langCode: 'kn-IN',
      };
    case 'ml':
      return {
        text: `നമസ്കാരം കർഷക സുഹൃത്തേ. ഇന്നത്തെ താപനില ${tempVal} ഡിഗ്രിയും മഴ സാധ്യത ${rainVal} ശതമാനവുമാണ്. മണ്ണിലെ ഈർപ്പം ${moisturePct} ശതമാനം. ${
          isRainy
            ? 'മഴ സാധ്യതയുള്ളതിനാൽ ഇന്ന് മരുന്ന് തളിക്കരുത്.'
            : 'കാലാവസ്ഥ അനുകൂലമാണ്, സാധാരണ കൃഷിപ്പണികൾ തുടരാം.'
        }`,
        langCode: 'ml-IN',
      };
    case 'or':
      return {
        text: `ନମସ୍କାର କୃଷକ ଭାଇ. ଆଜିର ତାପମାତ୍ରା ${tempVal} ଡିଗ୍ରୀ ଏବଂ ବର୍ଷା ସମ୍ଭାବନା ${rainVal} ପ୍ରତିଶତ. ମାଟିର ଆର୍ଦ୍ରତା ${moisturePct} ପ୍ରତିଶତ. ${
          isRainy
            ? 'ବର୍ଷାର ସମ୍ଭାବନା ଥିବାରୁ ଆଜି କୀଟନାଶକ ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ.'
            : 'ପାଣିପାଗ ଅନୁକୂଳ ଅଛି, ନିୟମିତ କୃଷି କାର୍ଯ୍ୟ ଜାରି ରଖିପାରିବେ.'
        }`,
        langCode: 'or-IN',
      };
    case 'en':
    default:
      return {
        text: `Namaste Farmer Brother. Today's temperature is ${tempVal} degrees Celsius with ${rainVal} percent rain probability. Soil moisture is at ${moisturePct} percent. ${
          isRainy
            ? 'Please postpone foliar spraying and inspect field drainage channels due to expected rain.'
            : 'Field conditions are stable for normal farming operations.'
        }`,
        langCode: 'en-IN',
      };
  }
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLocalizedNumber(num: number, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale).format(num);
}
