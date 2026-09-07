import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Scan,
  Droplets,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CloudSun,
  ChevronRight,
  Calendar,
  MapPin,
  Send,
  Mic,
  Camera,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Tractor,
  ShoppingCart,
  Landmark,
  Power,
  RefreshCw,
  Volume2,
  VolumeX,
  CheckSquare,
  Square,
  CloudRain,
  HelpCircle,
  FileText,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { MandiTicker } from '../components/MandiTicker';
import { WeatherData } from '../../shared/types';
import {
  SUPPORTED_LANGUAGES,
  getLocalizedSpokenAdvisory,
  getTranslation,
} from '../i18n/translations';
import { speakText, stopSpeech, isSpeechSynthesisSupported } from '../services/webSpeechService';

export const FarmerDashboard: React.FC = () => {
  const {
    farmerProfile,
    crops,
    irrigationStatus,
    togglePump,
    soilHealth,
    mandiPrices,
    alerts,
    language,
    setLanguage,
    t,
    setCurrentView,
    askAiWithPrompt,
    addToast,
    isDarkMode,
  } = useApp();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isPumpLoading, setIsPumpLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quickQuestionInput, setQuickQuestionInput] = useState('');

  // Daily Farm Checklist with Local Storage persistence
  const [dailyTasks, setDailyTasks] = useState<{ id: string; textHi: string; textEn: string; textGu: string; done: boolean; tag: string }[]>(() => {
    try {
      const saved = localStorage.getItem('kb_daily_tasks_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 't1',
        textHi: '🌧️ कल बारिश से पहले खेत की जल निकासी नाली साफ करें',
        textEn: '🌧️ Clear field drainage trenches before tomorrow\'s rain',
        textGu: '🌧️ આવતીકાલના વરસાદ પહેલા ખેતરમાંથી પાણી નિકાલની નીકો સાફ કરો',
        done: false,
        tag: 'जरूरी (Urgent)',
      },
      {
        id: 't2',
        textHi: '🛑 आज कीटनाशक का छिड़काव न करें (दवा बारिश में धुल जाएगी)',
        textEn: '🛑 Avoid chemical spraying today (rain will wash it away)',
        textGu: '🛑 આજે દવાનો છંટકાવ ન કરવો (વરસાદમાં દવા ધોવાઈ જશે)',
        done: true,
        tag: 'सावधानी (Warning)',
      },
      {
        id: 't3',
        textHi: '📈 गोंडल मंडी में कपास ₹7,620 पहुंचा — अपनी उपज का भाव देखें',
        textEn: '📈 Gondal Mandi Cotton reached ₹7,620 — Check your crop rate',
        textGu: '📈 ગોંડલ માર્કેટ યાર્ડમાં કપાસ ₹7,620 પહોંચ્યો — ભાવ ચકાસો',
        done: false,
        tag: 'मंडी (Mandi)',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('kb_daily_tasks_v2', JSON.stringify(dailyTasks));
    } catch {}
  }, [dailyTasks]);

  useEffect(() => {
    fetch('/api/weather?location=Anandpur,%20Gujarat')
      .then((res) => res.json())
      .then((data) => setWeather(data))
      .catch(() => {});
  }, []);

  const isPumpRunning = irrigationStatus.pumpStatus === 'RUNNING';
  const moisturePct = irrigationStatus.soilMoisturePct || 42;

  // Active crop info
  const primaryCrop = crops && crops.length > 0 ? crops[0] : null;
  const cropDisplayName = primaryCrop?.cropName || 'Cotton (कपास)';
  const cropHealthScore = primaryCrop?.healthScore || 88;

  // Weather variables
  const currentTemp = weather?.temperatureC ?? 30;
  const currentRainProb = weather?.rainfallProbability ?? 70;

  // Handle task toggle
  const toggleTask = (id: string) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Speech synthesis for official advisory in chosen language
  const handlePlayAdvisoryAudio = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    const rainVal = weather?.rainfallProbability ?? 70;
    const tempVal = weather?.temperatureC ?? 30;
    const advisory = getLocalizedSpokenAdvisory(language, tempVal, rainVal, moisturePct);

    if (!isSpeechSynthesisSupported()) {
      addToast('Voice Advisory', advisory.text.slice(0, 100) + '...', 'info');
      return;
    }

    setIsPlayingAudio(true);
    speakText(advisory.text, {
      lang: advisory.langCode || language,
      rate: 0.92,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: (err) => {
        setIsPlayingAudio(false);
        console.warn('Voice playback notice:', err);
      },
    });
  };

  // Pump Toggle with feedback
  const handleTogglePump = async () => {
    setIsPumpLoading(true);
    try {
      await togglePump();
      addToast(
        isPumpRunning ? 'पंप बंद हुआ' : 'पंप चालू हुआ',
        isPumpRunning
          ? (language === 'hi' ? 'ड्रिप सिंचाई पंप सफलतापूर्वक बंद कर दिया गया।' : 'Irrigation pump stopped.')
          : (language === 'hi' ? 'ड्रिप सिंचाई पंप चालू हो गया है।' : 'Irrigation pump started.'),
        isPumpRunning ? 'info' : 'success'
      );
    } catch {
      addToast('त्रुटि', 'पंप नियंत्रक से संपर्क नहीं हो सका', 'error');
    } finally {
      setIsPumpLoading(false);
    }
  };

  // Quick Questions chips
  const quickQuestionChips = [
    { hi: '🌾 कपास में खाद कब डालें?', en: 'When to fertilize cotton?', gu: 'કપાસમાં ખાતર ક્યારે નાખવું?' },
    { hi: '🐛 पत्ती पीली पड़ रही है क्या करें?', en: 'Leaves turning yellow, what to do?', gu: 'પાંદડા પીળા પડે છે શું કરવું?' },
    { hi: '🌧️ कल बारिश कितने बजे होगी?', en: 'What time will it rain tomorrow?', gu: 'આવતીકાલે વરસાદ ક્યારે પડશે?' },
    { hi: '💰 गोंडल मंडी में कपास का आज का भाव?', en: 'Cotton price in Gondal Mandi today?', gu: 'ગોંડલ યાર્ડમાં કપાસનો ભાવ?' },
  ];

  // 6 Main Easy Services
  const easyServices = [
    {
      id: 'disease-scanner',
      titleHi: 'फसल रोग जांचें',
      titleEn: 'Scan Crop Disease',
      titleGu: 'રોગની તપાસ કરો',
      descHi: 'पत्ती का फोटो खींचें व तुरंत देसी व पक्का इलाज पाएं',
      descEn: 'Take a photo of diseased leaf for instant diagnosis',
      descGu: 'પાંદડાનો ફોટો પાડો અને સચોટ દવા-ઉપાય મેળવો',
      icon: Camera,
      badgeHi: 'फोटो जांच',
      badgeEn: 'Photo AI',
      colorBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      accent: 'border-emerald-600',
    },
    {
      id: 'ai-assistant',
      titleHi: 'किसान AI मित्र (बोलकर पूछें)',
      titleEn: 'Voice AI Doctor',
      titleGu: 'કૃષિ મિત્ર (બોલીને પૂછો)',
      descHi: 'अपनी भाषा में बोलें और खेती का तुरंत समाधान पाएं',
      descEn: 'Talk in your language, ask anything about farming',
      descGu: 'તમારી ભાષામાં બોલો અને તરત જ જવાબ મેળવો',
      icon: Mic,
      badgeHi: 'आवाज से 🎙️',
      badgeEn: '24/7 Voice',
      colorBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      accent: 'border-amber-500',
    },
    {
      id: 'market-prices',
      titleHi: 'लाइव मंडी भाव',
      titleEn: 'Live Mandi Rates',
      titleGu: 'લાઈવ માર્કેટ ભાવ',
      descHi: 'राजकोट, गोंडल व आसपास की मंडियों के ताजा दाम',
      descEn: 'Real-time APMC auction prices for your crops',
      descGu: 'ગોંડલ, રાજકોટ અને નજીકના યાર્ડના તાજા ભાવ',
      icon: TrendingUp,
      badgeHi: 'कपास ₹7,620',
      badgeEn: 'Cotton ₹7,620',
      colorBg: 'bg-teal-700 hover:bg-teal-800 text-white',
      accent: 'border-teal-600',
    },
    {
      id: 'smart-irrigation',
      titleHi: 'स्मार्ट सिंचाई व पंप',
      titleEn: 'Irrigation & Pump',
      titleGu: 'સિંચાઈ અને મોટર પંપ',
      descHi: 'खेत की नमी जांचें और मोबाइल से पंप चालू/बंद करें',
      descEn: 'Check root moisture & control water pump remotely',
      descGu: 'જમીનમાં ભેજ ચકાસો અને મોટર ચાલુ-બંધ કરો',
      icon: Droplets,
      badgeHi: isPumpRunning ? 'पंप चालू ⚡' : 'नमी 42%',
      badgeEn: isPumpRunning ? 'Pump ON ⚡' : 'Moisture 42%',
      colorBg: 'bg-sky-700 hover:bg-sky-800 text-white',
      accent: 'border-sky-600',
    },
    {
      id: 'machinery',
      titleHi: 'किराये पर ट्रैक्टर व ड्रोन',
      titleEn: 'Tractor & Drone Rental',
      titleGu: 'ટ્રેક્ટર અને ડ્રોન ભાડે',
      descHi: 'आसपास के ट्रैक्टर, रोटावेटर व स्प्रे ड्रोन बुक करें',
      descEn: 'Rent nearby tractors, cultivators & spray drones',
      descGu: 'નજીકના ટ્રેક્ટર, રોટાવેટર અને ડ્રોન બુક કરો',
      icon: Tractor,
      badgeHi: 'सस्ती दर',
      badgeEn: 'Best Rate',
      colorBg: 'bg-stone-800 hover:bg-stone-900 text-white',
      accent: 'border-stone-700',
    },
    {
      id: 'bulk-buying',
      titleHi: 'सस्ती खाद व बीज समूह',
      titleEn: 'Seeds & Fertilizer Group',
      titleGu: 'ખાતર અને બિયારણ ખરીદી',
      descHi: 'गांव के किसानों के साथ मिलकर 15-20% सस्ते में खरीदें',
      descEn: 'Buy certified seeds & fertilizers at bulk group discount',
      descGu: 'જૂથમાં ખરીદી કરીને ૧૫-૨૦% ની બચત કરો',
      icon: ShoppingCart,
      badgeHi: 'समूह बचत 🛒',
      badgeEn: 'Group Saver',
      colorBg: 'bg-emerald-800 hover:bg-emerald-900 text-white',
      accent: 'border-emerald-700',
    },
  ];

  // 5-Day Simple Forecast
  const simpleForecast = [
    { dayHi: 'सोमवार (आज)', dayEn: 'Mon (Today)', dayGu: 'સોમવાર (આજે)', icon: '⛅', temp: '30°C', rain: '20%', adviceHi: 'सामान्य धूप • सामान्य काम', adviceEn: 'Sunny • Routine farm work' },
    { dayHi: 'मंगलवार (कल)', dayEn: 'Tue (Tomorrow)', dayGu: 'મંગળવાર (કાલે)', icon: '🌧️', temp: '27°C', rain: '70%', adviceHi: '⚠️ भारी बारिश • स्प्रे रोकें', adviceEn: '⚠️ Heavy Rain • Hold Spray' },
    { dayHi: 'बुधवार', dayEn: 'Wed', dayGu: 'બુધવાર', icon: '🌧️', temp: '26°C', rain: '85%', adviceHi: 'पानी निकासी नाली देखें', adviceEn: 'Clear field drainage' },
    { dayHi: 'गुरुवार', dayEn: 'Thu', dayGu: 'ગુરુવાર', icon: '🌦️', temp: '28°C', rain: '40%', adviceHi: 'हल्की फुहार • कीट जांचें', adviceEn: 'Scout leaves for pests' },
    { dayHi: 'शुक्रवार', dayEn: 'Fri', dayGu: 'શુક્રવાર', icon: '☀️', temp: '31°C', rain: '10%', adviceHi: 'खिली धूप • दवा स्प्रे सुरक्षित', adviceEn: 'Sunny • Safe for spraying' },
  ];

  return (
    <div id="kisan-simple-home" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-5 pb-24 md:pb-12 text-stone-900 dark:text-stone-100">
      {/* Live APMC Mandi Ticker */}
      <MandiTicker />

      {/* ========================================================= */}
      {/* 1. TOP QUICK LANGUAGE & TOLL-FREE BAR                     */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#161c14] border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Language selector chips */}
        <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto justify-center lg:justify-start">
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 mr-1">
            🌐 भाषा:
          </span>
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                addToast('Language Updated', `Active: ${l.nativeName}`, 'info');
              }}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                language === l.code
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/40'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.nativeName}</span>
            </button>
          ))}
        </div>

        {/* Toll-Free Kisan Helpline 1800-180-1551 */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <a
            href="tel:18001801551"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            title="Call Kisan Call Centre Toll-Free"
          >
            <PhoneCall className="w-4 h-4 animate-pulse text-stone-950" />
            <span>1800-180-1551</span>
            <span className="bg-amber-400/80 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
              {language === 'hi' ? 'मुफ्त कॉल' : 'Free Help'}
            </span>
          </a>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SIMPLE FARMER BANNER WITH VOICE READ-ALOUD             */}
      {/* ========================================================= */}
      <section
        id="farmer-welcome-card"
        className="bg-gradient-to-r from-[#14380e] via-[#1a4413] to-[#14380e] text-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-emerald-800/60 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-900/90 text-emerald-200 border border-emerald-700/60 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {farmerProfile.village || 'आनंदपुर'}, {farmerProfile.district || 'राजकोट'} ({farmerProfile.state || 'गुजरात'})
              </span>
              <span className="bg-amber-400 text-stone-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                {language === 'hi' ? '4.5 एकड़ खेत' : '4.5 Acre Land'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {language === 'hi'
                ? `राम राम, ${farmerProfile.name || 'रमेश भाई'} 👋`
                : language === 'gu'
                ? `રામ રામ, ${farmerProfile.name || 'રમેશભાઈ'} 👋`
                : `Namaste, ${farmerProfile.name || 'Ramesh Patel'} 👋`}
            </h1>

            <p className="text-emerald-100 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
              {language === 'hi'
                ? '🌾 मुख्य फसल: कपास (Bt Cotton) • 🌦️ कल 70% बारिश का अनुमान है, आज कीटनाशक छिड़काव न करें।'
                : language === 'gu'
                ? '🌾 મુખ્ય પાક: કપાસ • 🌦️ આવતીકાલે ૭૦% વરસાદ છે, આજે દવાનો છંટકાવ ન કરવો.'
                : '🌾 Main Crop: Bt Cotton • 🌦️ 70% rain expected tomorrow. Please avoid foliar spraying today.'}
            </p>
          </div>

          {/* Big Voice Button: Tap to Listen Aloud */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              id="listen-advisory-btn"
              onClick={handlePlayAdvisoryAudio}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all shadow-md active:scale-95 cursor-pointer ${
                isPlayingAudio
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-5 h-5 text-stone-950" />
                  <span>{language === 'hi' ? 'आवाज रोकें' : 'Stop Audio'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-stone-950 animate-bounce" />
                  <span>{language === 'hi' ? 'सलाह बोलकर सुनें 🔊' : language === 'gu' ? 'સલાહ સાંભળો 🔊' : 'Listen Advice 🔊'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. THE "BIG 4" PRIMARY ACTION TILES (EASY FOR ANY FARMER) */}
      {/* ========================================================= */}
      <section id="big-4-action-tiles" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>
              {language === 'hi'
                ? 'सबसे जरूरी 4 काम (सीधा 1-टैप)'
                : language === 'gu'
                ? 'સૌથી મહત્વપૂર્ણ ૪ સુવિધાઓ'
                : 'Top 4 Immediate Actions'}
            </span>
          </h2>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
            {language === 'hi' ? 'आसान उपयोग' : 'One Tap'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TILE 1: CROP DOCTOR (SCAN LEAF) */}
          <div
            id="action-scan-leaf"
            onClick={() => setCurrentView('disease-scanner')}
            className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xs">
                  <Camera className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                </div>
                <span className="bg-white text-emerald-900 font-black text-xs px-2.5 py-1 rounded-full uppercase shadow-xs">
                  {language === 'hi' ? 'रोग पहचान' : 'Crop Doctor'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mt-4 leading-tight">
                {language === 'hi' ? 'पत्ती का फोटो लें' : language === 'gu' ? 'પાંદડાનો ફોટો લો' : 'Scan Leaf Photo'}
              </h3>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                {language === 'hi'
                  ? 'रोग पहचानें व तुरंत सही दवा और देसी इलाज पाएं'
                  : 'Identify crop disease and get certified spray dose'}
              </p>
            </div>

            <button className="mt-4 w-full py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm">
              <span>{language === 'hi' ? 'कैमरा खोलें 📸' : 'Open Camera 📸'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* TILE 2: VOICE KISAN AI (SPEAK QUESTIONS) */}
          <div
            id="action-voice-ai"
            onClick={() => setCurrentView('ai-assistant')}
            className="bg-gradient-to-br from-[#1b3d14] to-[#26531d] text-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-emerald-600 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 bg-amber-400 text-stone-950 rounded-2xl">
                  <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </div>
                <span className="bg-amber-400 text-stone-950 font-black text-xs px-2.5 py-1 rounded-full uppercase">
                  {language === 'hi' ? 'बोलकर पूछें' : 'Voice AI'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mt-4 leading-tight">
                {language === 'hi' ? 'खेती के सवाल पूछें' : language === 'gu' ? 'ખેતીના પ્રશ્નો પૂછો' : 'Ask Kisan AI'}
              </h3>
              <p className="text-emerald-200 text-xs sm:text-sm mt-1">
                {language === 'hi'
                  ? 'माइक दबाएं और अपनी भाषा में कोई भी सवाल बोलें'
                  : 'Speak questions in your language for 24/7 answers'}
              </p>
            </div>

            <button className="mt-4 w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm">
              <span>{language === 'hi' ? 'माइक चालू करें 🎙️' : 'Start Voice 🎙️'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* TILE 3: TODAY'S IRRIGATION VERDICT & PUMP */}
          <div
            id="action-smart-water"
            className="bg-white dark:bg-[#161c14] rounded-3xl p-5 sm:p-6 shadow-md border-2 border-sky-300 dark:border-sky-800 flex flex-col justify-between min-h-[200px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-2xl">
                  <Droplets className="w-7 h-7" />
                </div>
                <span
                  className={`font-black text-xs px-2.5 py-1 rounded-full uppercase ${
                    isPumpRunning ? 'bg-emerald-600 text-white animate-pulse' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {isPumpRunning ? '● पंप चालू' : '○ पंप बंद'}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 mt-4 leading-tight">
                {language === 'hi' ? 'सिंचाई: आज पानी न दें ❌' : 'Hold Water Today ❌'}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-1">
                {language === 'hi'
                  ? `नमी ${moisturePct}% (अनुकूल) • कल बारिश होगी`
                  : `Soil Moisture ${moisturePct}% • Rain tomorrow`}
              </p>
            </div>

            <button
              onClick={handleTogglePump}
              disabled={isPumpLoading}
              className={`mt-4 w-full py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer ${
                isPumpRunning
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-sky-700 hover:bg-sky-800 text-white'
              }`}
            >
              {isPumpLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              <span>
                {isPumpRunning
                  ? (language === 'hi' ? '⏹️ पंप बंद करें' : 'Stop Pump')
                  : (language === 'hi' ? '▶️ पंप चालू करें' : 'Start Pump')}
              </span>
            </button>
          </div>

          {/* TILE 4: LIVE MANDI RATE */}
          <div
            id="action-mandi-rate"
            onClick={() => setCurrentView('market-prices')}
            className="bg-white dark:bg-[#161c14] rounded-3xl p-5 sm:p-6 shadow-md border-2 border-amber-300 dark:border-amber-800 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[200px] group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-2xl">
                  <TrendingUp className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </div>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs px-2.5 py-1 rounded-full uppercase">
                  +₹220 उछाल 📈
                </span>
              </div>

              <div className="mt-4">
                <span className="text-xs font-bold text-stone-500 uppercase">
                  {language === 'hi' ? 'कपास (Bt Cotton)' : 'Cotton Rate'}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 mt-0.5">
                  ₹7,620 <span className="text-xs text-stone-500 font-normal">/क्विंटल</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                  ⭐ Gondal APMC (सर्वोच्च भाव)
                </p>
              </div>
            </div>

            <button className="mt-4 w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm">
              <span>{language === 'hi' ? 'सभी मंडियां देखें 📊' : 'View All Mandis 📊'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. TODAY'S 3 KEY FARM TASKS (SIMPLE INTERACTIVE CHECKLIST)*/}
      {/* ========================================================= */}
      <section
        id="daily-tasks-checklist"
        className="bg-white dark:bg-[#161c14] border-2 border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                {language === 'hi'
                  ? 'आज के 3 जरूरी काम (चेकलिस्ट)'
                  : language === 'gu'
                  ? 'આજના મહત્વપૂર્ણ કાર્યો'
                  : 'Today\'s 3 Key Farm Tasks'}
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {language === 'hi'
                ? 'पूरा होने पर टिक करें — आपकी फसल सुरक्षित रहेगी'
                : 'Check off tasks as completed to safeguard your crop'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full">
              {dailyTasks.filter((t) => t.done).length} / {dailyTasks.length} {language === 'hi' ? 'काम पूरे' : 'Done'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 transition-all cursor-pointer active:scale-[0.99] ${
                task.done
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                  : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-emerald-400'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-emerald-700 dark:text-emerald-400 shrink-0"
              >
                {task.done ? (
                  <CheckSquare className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Square className="w-6 h-6 text-stone-400" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`font-black text-sm sm:text-base leading-snug ${
                      task.done
                        ? 'line-through text-stone-500 dark:text-stone-400'
                        : 'text-stone-900 dark:text-stone-100'
                    }`}
                  >
                    {language === 'hi' ? task.textHi : language === 'gu' ? task.textGu : task.textEn}
                  </p>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    {task.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. 6 MAIN EASY FARM SERVICES GRID                         */}
      {/* ========================================================= */}
      <section id="easy-services-grid" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Tractor className="w-5 h-5 text-emerald-700" />
            <span>
              {language === 'hi'
                ? 'अन्य सभी उपयोगी सेवाएं'
                : language === 'gu'
                ? 'અન્ય ઉપયોગી સેવાઓ'
                : 'All Useful Farming Services'}
            </span>
          </h2>
          <span className="text-xs text-stone-500">
            {language === 'hi' ? 'किसी भी सेवा पर टैप करें' : 'Tap any service'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {easyServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                id={`srv-card-${srv.id}`}
                onClick={() => setCurrentView(srv.id)}
                className="bg-white dark:bg-[#161c14] border-2 border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-600 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[160px] group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${srv.colorBg}`}>
                      <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-700">
                      {language === 'hi' ? srv.badgeHi : srv.badgeEn}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 mt-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {language === 'hi' ? srv.titleHi : language === 'gu' ? srv.titleGu : srv.titleEn}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    {language === 'hi' ? srv.descHi : language === 'gu' ? srv.descGu : srv.descEn}
                  </p>
                </div>

                <div className="mt-4 flex items-center text-xs font-bold text-emerald-800 dark:text-emerald-400 group-hover:underline gap-1">
                  <span>{language === 'hi' ? 'खोलें' : 'Open'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. 5-DAY SIMPLE WEATHER (EASY WORDS, NO CONFUSION)        */}
      {/* ========================================================= */}
      <section
        id="simple-weather-forecast"
        className="bg-white dark:bg-[#161c14] border-2 border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-2xl">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">
                {language === 'hi'
                  ? 'मौसम का आसान अनुमान (अगले 5 दिन)'
                  : language === 'gu'
                  ? 'આગામી ૫ દિવસનું હવામાન'
                  : '5-Day Simple Weather Guide'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'hi' ? 'आनंदपुर, राजकोट • मौसम विभाग (IMD) द्वारा सत्यापित' : 'Anandpur, Rajkot • IMD Verified'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('weather')}
            className="text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            <span>{language === 'hi' ? 'पूरा मौसम देखें' : 'View Full Forecast'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {simpleForecast.map((fc, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border-2 text-center flex flex-col justify-between ${
                idx === 1
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700'
                  : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                  {language === 'hi' ? fc.dayHi : language === 'gu' ? fc.dayGu : fc.dayEn}
                </span>
                <div className="text-3xl my-2">{fc.icon}</div>
                <div className="text-lg font-black text-stone-900 dark:text-stone-100">{fc.temp}</div>
                <div className="text-xs font-bold text-blue-700 dark:text-blue-400">🌧️ {fc.rain} बारिश</div>
              </div>

              <div className="mt-2 pt-2 border-t border-stone-200/80 dark:border-stone-800 text-[11px] font-black text-stone-800 dark:text-stone-200">
                {language === 'hi' ? fc.adviceHi : fc.adviceEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. ASK KISAN AI - 1-TAP COMMON QUESTIONS                  */}
      {/* ========================================================= */}
      <section
        id="ask-ai-chips-section"
        className="bg-gradient-to-br from-[#183d12] via-[#214e1a] to-[#163610] text-white rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-emerald-700"
      >
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-600/50 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>24/7 AI कृषि वैज्ञानिक</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi'
              ? 'खेती से जुड़ा कोई भी सवाल पूछें'
              : 'Ask Any Farm Question'}
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm">
            {language === 'hi'
              ? 'नीचे दिए गए किसी भी सवाल पर क्लिक करें या अपना सवाल बोलें:'
              : 'Tap any common question below or type your query:'}
          </p>

          {/* Quick chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {quickQuestionChips.map((q, i) => (
              <button
                key={i}
                onClick={() => askAiWithPrompt(q.hi)}
                className="bg-white/15 hover:bg-white/25 active:scale-95 border border-emerald-400/40 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-2xl transition-all cursor-pointer"
              >
                {language === 'hi' ? q.hi : language === 'gu' ? q.gu : q.en}
              </button>
            ))}
          </div>

          {/* Input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!quickQuestionInput.trim()) return;
              askAiWithPrompt(quickQuestionInput.trim());
            }}
            className="pt-3 max-w-xl mx-auto"
          >
            <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-md">
              <input
                type="text"
                value={quickQuestionInput}
                onChange={(e) => setQuickQuestionInput(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'यहाँ अपना सवाल लिखें या बोलें...'
                    : 'Type your farming question here...'
                }
                className="w-full px-3 py-2 text-stone-900 placeholder:text-stone-400 text-sm font-medium focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setCurrentView('ai-assistant')}
                className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors shrink-0"
                title="Voice Query"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!quickQuestionInput.trim()}
                className="p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-colors disabled:opacity-40 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. SIMPLE FOOTER & HELPLINE NOTICE                        */}
      {/* ========================================================= */}
      <footer className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-xs text-stone-600 dark:text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌾</span>
          <span>
            {language === 'hi'
              ? 'किसान भाई • भारतीय किसानों के लिए सरल, सीधा और भरोसेमंद डिजिटल साथी'
              : 'Kishan Bhai • Simple, trusted digital agriculture platform for farmers'}
          </span>
        </div>

        <div className="flex items-center gap-3 font-bold">
          <a href="tel:18001801551" className="text-emerald-800 dark:text-emerald-400 hover:underline">
            हेल्पलाइन: 1800-180-1551
          </a>
          <span>•</span>
          <button
            onClick={() => setCurrentView('talk-to-expert')}
            className="text-stone-800 dark:text-stone-200 hover:underline"
          >
            विशेषज्ञ से बात करें
          </button>
        </div>
      </footer>
    </div>
  );
};
