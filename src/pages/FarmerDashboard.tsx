import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import { useMarketStore } from '../store/marketStore';
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
  ShoppingBag,
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
  Wallet,
} from 'lucide-react';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { HomeSearchBar } from '../components/HomeSearchBar';
import { MandiTicker } from '../components/MandiTicker';
import { LoyaltyCard } from '../components/loyalty/LoyaltyCard';
import { RewardRedemptionModal } from '../components/loyalty/RewardRedemptionModal';
import { loyaltyService } from '../services/loyaltyService';
import { WeatherData, LoyaltyAccount, LoyaltyRewardItem, LoyaltyRewardRedemption } from '../../shared/types';
import {
  SUPPORTED_LANGUAGES,
  getLocalizedSpokenAdvisory,
  getTranslation,
} from '../i18n/translations';
import { speakText, stopSpeech, isSpeechSynthesisSupported } from '../services/webSpeechService';

export const FarmerDashboard: React.FC = () => {
  const currentUser = useUserStore(state => state.currentUser);
  const farmerProfile = useUserStore(state => state.farmerProfile);
  const mandiPrices = useMarketStore(state => state.mandiPrices);
  const { crops, irrigationStatus, togglePump, soilHealth, alerts, language, setLanguage, t, setCurrentView, askAiWithPrompt, addToast, isDarkMode } = useApp();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isPumpLoading, setIsPumpLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quickQuestionInput, setQuickQuestionInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Loyalty Rewards State
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyRewardItem[]>([]);
  const [loyaltyRedemptions, setLoyaltyRedemptions] = useState<LoyaltyRewardRedemption[]>([]);
  const [showRewardsModal, setShowRewardsModal] = useState<boolean>(false);
  const [loyaltyLoading, setLoyaltyLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const effectiveFarmerId = currentUser?.id || 'usr_farmer_ramesh';
    loyaltyService
      .getAccount(effectiveFarmerId, 'FARMER')
      .then((acc) => setLoyaltyAccount(acc))
      .catch(() => {})
      .finally(() => setLoyaltyLoading(false));

    loyaltyService.getRewards('FARMER').then(setLoyaltyRewards).catch(() => {});
    loyaltyService.getRedemptions(effectiveFarmerId).then(setLoyaltyRedemptions).catch(() => {});
  }, [currentUser?.id]);

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

  // 5-Day Simple Forecast
  const simpleForecast = [
    { dayHi: 'सोमवार (आज)', dayEn: 'Mon (Today)', dayGu: 'સોમવાર (આજે)', icon: '⛅', temp: '30°C', rain: '20%', adviceHi: 'सामान्य धूप • सामान्य काम', adviceEn: 'Sunny • Routine farm work' },
    { dayHi: 'मंगलवार (कल)', dayEn: 'Tue (Tomorrow)', dayGu: 'મંગળવાર (કાલે)', icon: '🌧️', temp: '27°C', rain: '70%', adviceHi: '⚠️ भारी बारिश • स्प्रे रोकें', adviceEn: '⚠️ Heavy Rain • Hold Spray' },
    { dayHi: 'बुधवार', dayEn: 'Wed', dayGu: 'બુધવાર', icon: '🌧️', temp: '26°C', rain: '85%', adviceHi: 'पानी निकासी नाली देखें', adviceEn: 'Clear field drainage' },
    { dayHi: 'गुरुवार', dayEn: 'Thu', dayGu: 'ગુરુવાર', icon: '🌦️', temp: '28°C', rain: '40%', adviceHi: 'हल्की फुहार • कीट जांचें', adviceEn: 'Scout leaves for pests' },
    { dayHi: 'शुक्रवार', dayEn: 'Fri', dayGu: 'શુક્રવાર', icon: '☀️', temp: '31°C', rain: '10%', adviceHi: 'खिली धूप • दवा स्प्रे सुरक्षित', adviceEn: 'Sunny • Safe for spraying' },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div id="kisan-simple-home" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-5 pb-24 md:pb-12 text-stone-900 dark:text-stone-100">
      {/* Universal Agri Search & Voice Bar */}
      <HomeSearchBar />

      {/* ========================================================= */}
      {/* 1. MODERN WARM AGRI GREETING & DAYLIGHT FARM ANCHOR       */}
      {/* ========================================================= */}
      <section className="bg-white dark:bg-[#141C18] border border-emerald-900/10 dark:border-stone-800 rounded-3xl p-4 sm:p-6 shadow-sm shadow-emerald-950/5 relative overflow-hidden">
        {/* Subtle decorative background organic glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-100/40 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-100/40 dark:bg-amber-900/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-700/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <MapPin className="w-3 h-3 text-emerald-700" />
                <span>{farmerProfile?.village || 'आनंदपुर'}, {farmerProfile?.district || 'राजकोट'} ({farmerProfile?.state || 'गुजरात'})</span>
              </span>
              <span className="text-stone-400">·</span>
              <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                {weather?.condition || 'हल्की धूप व अनुकूल मौसम'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#144633] dark:text-[#ECFDF5] tracking-tight">
              {language === 'hi' 
                ? `राम-राम, ${farmerProfile?.name || 'रमेशभाई'} जी 🌾` 
                : language === 'gu'
                ? `રામ-રામ, ${farmerProfile?.name || 'રમેશભાઈ'} જી 🌾`
                : `Welcome, ${farmerProfile?.name || 'Ramesh Patel'} 🌾`}
            </h1>

            {/* Farm stage metadata with zero-pill discipline */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-stone-600 dark:text-stone-300">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                🌱 {cropDisplayName}
              </span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span>4.2 हेक्टेयर (10.5 बीघा)</span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span>फूल व डोडी अवस्था (Flowering)</span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                फसल स्वास्थ्य {cropHealthScore}%
              </span>
            </div>
          </div>

          {/* Daylight Action Quick Controls (Voice Playback & Fast Diagnosis) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={handlePlayAdvisoryAudio}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-amber-600 text-white animate-pulse' 
                  : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-[#144633] dark:text-emerald-200 border border-emerald-700/25'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>{language === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'hi' ? 'दैनिक सलाह सुनें 🎙️' : 'Play Farm Advisory 🎙️'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setCurrentView('disease-scanner')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>{language === 'hi' ? 'फसल जांचें' : 'Scan Leaf'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. REAL-TIME APMC MANDI TICKER (LIVE COMMODITY SCROLLER)  */}
      {/* ========================================================= */}
      <MandiTicker />

      {/* ========================================================= */}
      {/* 2.1 FARMER LOYALTY REWARDS SYSTEM CARD                    */}
      {/* ========================================================= */}
      <section className="space-y-2">
        <LoyaltyCard
          account={loyaltyAccount}
          loading={loyaltyLoading}
          onViewRewards={() => setShowRewardsModal(true)}
          onPrimaryAction={() => setCurrentView('marketplace')}
          onSecondaryAction={() => setCurrentView('loyalty')}
          onRepeatOrder={() => {
            addToast('Repeat Order Re-Listing', 'Browsing verified institutional purchase proposals for rapid re-commitment.', 'info');
            setCurrentView('marketplace');
          }}
          primaryActionLabel="Explore Buyer Offers"
          secondaryActionLabel="All Loyalty Perks"
          repeatActionLabel="Repeat Order"
        />
      </section>

      {/* ========================================================= */}
      {/* 3. THE "BIG 4" PRIMARY ACTION TILES (EASY FOR ANY FARMER) */}
      {/* ========================================================= */}
      <section id="big-4-action-tiles" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[#144633] dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {language === 'hi'
                ? 'त्वरित 4 कृषि क्रियाएं'
                : language === 'gu'
                ? 'સૌથી મહત્વપૂર્ણ ૪ સુવિધાઓ'
                : 'Top 4 Immediate Actions'}
            </span>
          </h2>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-700/20 px-2.5 py-0.5 rounded-full">
            {language === 'hi' ? '1-टैप डायरेक्ट' : 'Instant Direct'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* TILE 1: CROP DOCTOR (SCAN LEAF) */}
          <div
            id="action-scan-leaf"
            onClick={() => setCurrentView('disease-scanner')}
            className="bg-white dark:bg-[#141C18] rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-stone-800 hover:border-emerald-600/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  {language === 'hi' ? 'रोग डॉक्टर' : 'AI Doctor'}
                </span>
              </div>

              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-3 leading-tight group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                {language === 'hi' ? 'पत्ती का फोटो लें' : language === 'gu' ? 'પાંદડાનો ફોટો લો' : 'Scan Leaf Photo'}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-xs mt-1.5 leading-relaxed">
                {language === 'hi'
                  ? 'रोग पहचानें व तुरंत सही दवा और जैविक उपचार पाएं'
                  : 'Instant diagnosis with chemical doses and organic remedies'}
              </p>
            </div>

            <button className="mt-4 w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs group-hover:shadow-xs transition-all">
              <span>{language === 'hi' ? 'कैमरा खोलें' : 'Open Camera'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TILE 2: VOICE KISAN AI */}
          <div
            id="action-voice-ai"
            onClick={() => setCurrentView('ai-assistant')}
            className="bg-white dark:bg-[#141C18] rounded-2xl p-4 sm:p-5 border border-amber-900/15 dark:border-stone-800 hover:border-amber-600/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl group-hover:scale-105 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                  {language === 'hi' ? 'बोलकर पूछें' : 'Voice AI'}
                </span>
              </div>

              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-3 leading-tight group-hover:text-amber-800 dark:group-hover:text-amber-400">
                {language === 'hi' ? 'खेती के सवाल पूछें' : language === 'gu' ? 'ખેતીના પ્રશ્નો પૂછો' : 'Ask Kisan AI'}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-xs mt-1.5 leading-relaxed">
                {language === 'hi'
                  ? 'माइक दबाएं और अपनी भाषा में 24/7 विशेषज्ञ सलाह लें'
                  : 'Speak questions in your regional dialect for 24/7 expert answers'}
              </p>
            </div>

            <button className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all">
              <span>{language === 'hi' ? 'माइक चालू करें 🎙️' : 'Start Voice 🎙️'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TILE 3: TODAY'S IRRIGATION VERDICT & PUMP */}
          <div
            id="action-smart-water"
            className="bg-white dark:bg-[#141C18] rounded-2xl p-4 sm:p-5 border border-sky-900/15 dark:border-stone-800 hover:border-sky-600/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-xl">
                  <Droplets className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    isPumpRunning 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse' 
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {isPumpRunning ? '● पंप चालू' : '○ पंप बंद'}
                </span>
              </div>

              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-3 leading-tight">
                {language === 'hi' ? 'सिंचाई: आज पानी न दें' : 'Hold Water Today'}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-xs mt-1.5 leading-relaxed">
                {language === 'hi'
                  ? `मिट्टी नमी ${moisturePct}% (अनुकूल) · कल 70% बारिश संभव`
                  : `Soil Moisture ${moisturePct}% (Optimal) · Rain expected tomorrow`}
              </p>
            </div>

            <button
              onClick={handleTogglePump}
              disabled={isPumpLoading}
              className={`mt-4 w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98 cursor-pointer ${
                isPumpRunning
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-sky-700 hover:bg-sky-800 text-white'
              }`}
            >
              {isPumpLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Power className="w-3.5 h-3.5" />
              )}
              <span>
                {isPumpRunning
                  ? (language === 'hi' ? 'पंप बंद करें' : 'Stop Pump')
                  : (language === 'hi' ? 'पंप चालू करें' : 'Start Pump')}
              </span>
            </button>
          </div>

          {/* TILE 4: LIVE MANDI RATE */}
          <div
            id="action-mandi-rate"
            onClick={() => setCurrentView('market-prices')}
            className="bg-white dark:bg-[#141C18] rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 hover:border-emerald-600/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  +₹220 उछाल 📈
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-tight">
                  {language === 'hi' ? 'कपास (Bt Cotton)' : 'Cotton Rate'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-mono tabular-nums mt-0.5">
                  ₹7,620 <span className="text-xs text-stone-500 font-sans font-normal">/क्विंटल</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                  ⭐ गोंडल APMC (Gondal Yard)
                </p>
              </div>
            </div>

            <button className="mt-4 w-full py-2 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all">
              <span>{language === 'hi' ? 'सभी मंडियां देखें' : 'View Mandis'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ALL-IN-ONE COMPACT SUPER HUB (ALL TABS IN ONE PAGE)        */}
      {/* ========================================================= */}
      <section id="all-in-one-compact-hub" className="bg-stone-50 dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                {language === 'hi' ? '⚡ सभी टैब और सुविधाएँ एक नज़र में (Compact Super Hub)' : '⚡ All-in-One Super Hub (All Tabs in One View)'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'hi' ? 'बिना पेज बदले या भटके, सभी 14 कृषि मॉड्यूल यहाँ छोटे कार्ड में उपलब्ध हैं' : 'All 14 agriculture modules compactly accessible in one view'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full self-start sm:self-center">
            {language === 'hi' ? '1-क्लिक एक्सेस' : 'Instant Access'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { id: 'group-buying', labelHi: 'सामूहिक खरीद', labelEn: 'Group Buy', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700' },
            { id: 'crop-recommendation', labelHi: 'फसल सलाहकार', labelEn: 'Crop Advisor', icon: Sprout, color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
            { id: 'disease-scanner', labelHi: 'रोग डॉक्टर', labelEn: 'Disease Scanner', icon: Camera, color: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800' },
            { id: 'smart-irrigation', labelHi: 'स्मार्ट सिंचाई', labelEn: 'Smart Irrigation', icon: Droplets, color: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
            { id: 'market-prices', labelHi: 'मंडी भाव', labelEn: 'Mandi Rates', icon: TrendingUp, color: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800' },
            { id: 'soil-health', labelHi: 'मिट्टी जांच', labelEn: 'Soil Health', icon: ShieldCheck, color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
            { id: 'profit-calculator', labelHi: 'मुनाफा कैलकुलेटर', labelEn: 'Profit Calc', icon: Award, color: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' },
            { id: 'government-schemes', labelHi: 'सरकारी योजनाएं', labelEn: 'Govt Schemes', icon: Landmark, color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
            { id: 'talk-to-expert', labelHi: 'विशेषज्ञ से बात', labelEn: 'Talk to Expert', icon: PhoneCall, color: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' },
            { id: 'farm-diary', labelHi: 'फार्म डायरी', labelEn: 'Farm Diary', icon: Calendar, color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
            { id: 'my-crops', labelHi: 'फसलें व उपज', labelEn: 'My Products', icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
            { id: 'virtual-farm-clusters', labelHi: 'वर्चुअल क्लस्टर', labelEn: 'Farm Clusters', icon: MapPin, color: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' },
            { id: 'community', labelHi: 'किसान समुदाय', labelEn: 'Community', icon: FileText, color: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800' },
            { id: 'transactions', labelHi: 'खाता बही/लेनदेन', labelEn: 'Ledger', icon: Wallet, color: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700' },
            { id: 'weather', labelHi: 'विस्तृत मौसम', labelEn: 'Weather Hub', icon: CloudSun, color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
          ].map((mod) => {
            const ModIcon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => setCurrentView(mod.id)}
                className={`p-2.5 rounded-2xl border text-center transition-all hover:scale-105 active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 shadow-xs ${mod.color}`}
              >
                <ModIcon className="w-5 h-5" />
                <span className="text-[11px] font-black truncate w-full">
                  {language === 'hi' ? mod.labelHi : mod.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </section>





      {/* ========================================================= */}
      {/* 6. 5-DAY SIMPLE WEATHER (EASY WORDS, NO CONFUSION)        */}
      {/* ========================================================= */}
      <section
        id="simple-weather-forecast"
        className="bg-white dark:bg-[#161c14] border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4"
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
        className="bg-gradient-to-br from-[#183d12] via-[#214e1a] to-[#163610] text-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-emerald-700"
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

      {/* Rewards Redemption Modal */}
      <RewardRedemptionModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        account={loyaltyAccount}
        rewards={loyaltyRewards}
        redemptions={loyaltyRedemptions}
        onRewardRedeemed={(newRed, updatedAcc) => {
          setLoyaltyAccount(updatedAcc);
          setLoyaltyRedemptions((prev) => [newRed, ...prev]);
        }}
      />
    </div>
  );
};
