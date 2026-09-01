import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Scan,
  Droplets,
  TrendingUp,
  Calculator,
  Sparkles,
  Bell,
  CheckCircle2,
  AlertTriangle,
  CloudSun,
  ChevronRight,
  Calendar,
  MapPin,
  Send,
  Mic,
  Image as ImageIcon,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Activity,
  Thermometer,
  Wind,
  DollarSign,
  BookOpen,
  Volume2,
  VolumeX,
  PhoneCall,
  Tractor,
  ShoppingCart,
  Landmark,
  Power,
  RefreshCw,
  Award,
} from 'lucide-react';
import { MandiTicker } from '../components/MandiTicker';
import { WeatherData } from '../../shared/types';

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
    setCurrentView,
    askAiWithPrompt,
    addToast,
    isDarkMode,
  } = useApp();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedMarketCrop, setSelectedMarketCrop] = useState<'Cotton' | 'Wheat' | 'Groundnut'>('Cotton');
  const [quickQuestionInput, setQuickQuestionInput] = useState('');
  const [activeAlertFilter, setActiveAlertFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [isPumpLoading, setIsPumpLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    fetch('/api/weather?location=Anandpur,%20Gujarat')
      .then((res) => res.json())
      .then((data) => setWeather(data))
      .catch(() => {});
  }, []);

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;
  const isPumpRunning = irrigationStatus.pumpStatus === 'RUNNING';

  // Primary active crop details
  const primaryCrop = crops && crops.length > 0 ? crops[0] : null;
  const cropDisplayName = primaryCrop?.cropName || 'Cotton (Bt)';
  const cropVariety = primaryCrop?.variety || 'RCH-659 BG II';
  const cropStage = primaryCrop?.stage || 'Flowering & Pod Initiation';
  const cropHealthScore = primaryCrop?.healthScore || 88;
  const daysSinceSowing = 68;

  // Soil moisture
  const moisturePct = irrigationStatus.soilMoisturePct || 42;

  // Weather data
  const currentTemp = weather?.temperatureC ?? 29.5;
  const currentHumidity = weather?.humidity ?? 78;
  const currentRainProb = weather?.rainfallProbability ?? 70;
  const currentWindSpeed = weather?.windSpeedKmh ?? 14;
  const forecastItems = weather?.forecast && weather.forecast.length > 0 ? weather.forecast : [
    { day: 'Mon', tempHigh: 30, tempLow: 24, rainChance: 70, condition: 'Heavy Rain', advisory: 'Delay foliar spraying' },
    { day: 'Tue', tempHigh: 28, tempLow: 23, rainChance: 85, condition: 'Showers', advisory: 'Drain excess water' },
    { day: 'Wed', tempHigh: 29, tempLow: 24, rainChance: 40, condition: 'Partly Cloudy', advisory: 'Inspect leaves for pests' },
    { day: 'Thu', tempHigh: 31, tempLow: 25, rainChance: 15, condition: 'Sunny', advisory: 'Safe for nutrition spray' },
    { day: 'Fri', tempHigh: 32, tempLow: 25, rainChance: 10, condition: 'Clear Sky', advisory: 'Optimal field condition' },
    { day: 'Sat', tempHigh: 33, tempLow: 26, rainChance: 5, condition: 'Sunny', advisory: 'Run standard irrigation' },
    { day: 'Sun', tempHigh: 32, tempLow: 25, rainChance: 10, condition: 'Clear', advisory: 'Favorable week ahead' },
  ];

  // Speech synthesis for official advisory
  const handlePlayAdvisoryAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      const text =
        language === 'hi'
          ? 'नमस्ते रमेश पटेल जी। आज की आधिकारिक कृषि सलाह: कल 70 प्रतिशत बारिश का अनुमान है। आज कीटनाशक का छिड़काव रोक दें और खेत की जल निकासी नालियों को खुला रखें। कपास की जड़ में नमी 42 प्रतिशत है, शाम को 45 मिनट सूक्ष्म ड्रिप चलाएं।'
          : 'Namaste Ramesh Patel ji. Today\'s official agricultural advisory: 70 percent rain is expected tomorrow in Anandpur Rajkot. Please delay pesticide spraying and keep field drainage clear. Current root zone moisture is 42 percent; run an evening 45 minute drip cycle.';

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      addToast(
        'Voice Advisory',
        language === 'hi' ? 'सलाह: कल 70% बारिश का अनुमान है, आज स्प्रे न करें।' : 'Advice: 70% rain expected tomorrow, delay pesticide spraying.',
        'info'
      );
    }
  };

  // Pump Toggle with Feedback
  const handleTogglePump = async () => {
    setIsPumpLoading(true);
    try {
      await togglePump();
      addToast(
        isPumpRunning ? 'Pump Stopped' : 'Pump Started',
        isPumpRunning
          ? (language === 'hi' ? 'सिंचाई पंप सफलतापूर्वक बंद कर दिया गया।' : 'Irrigation pump stopped successfully.')
          : (language === 'hi' ? 'सिंचाई पंप चालू हो गया है (ड्रिप चक्र सक्रिय)।' : 'Irrigation pump started (Drip cycle active).'),
        isPumpRunning ? 'info' : 'success'
      );
    } catch {
      addToast('Error', 'Unable to communicate with pump controller', 'error');
    } finally {
      setIsPumpLoading(false);
    }
  };

  // 8 Big Essential Services for Farmers
  const essentialServices = [
    {
      id: 'disease-scanner',
      titleEn: 'Crop Doctor',
      titleHi: 'फसल रोग डॉक्टर',
      descEn: 'Scan leaf for instant AI diagnosis & organic cure',
      descHi: 'पत्ती का फोटो खींचें व तुरंत बीमारी का इलाज पाएं',
      icon: Scan,
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      badge: 'AI Doctor 🔬',
    },
    {
      id: 'market-prices',
      titleEn: 'Live Mandi Rates',
      titleHi: 'लाइव मंडी भाव',
      descEn: 'Real-time APMC auction prices & best mandis',
      descHi: 'आज के नजदीकी APMC भाव व सर्वोत्तम मंडी',
      icon: TrendingUp,
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      badge: 'APMC Live 📈',
    },
    {
      id: 'smart-irrigation',
      titleEn: 'Smart Irrigation',
      titleHi: 'स्मार्ट सिंचाई व पंप',
      descEn: 'Root moisture monitor & smart pump scheduling',
      descHi: 'खेत में नमी जांचें व पंप ऑटो चालू/बंद करें',
      icon: Droplets,
      color: 'bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300 border-sky-300 dark:border-sky-800',
      badge: isPumpRunning ? 'PUMP ON ⚡' : 'OPTIMAL 💧',
    },
    {
      id: 'weather',
      titleEn: 'Weather & Rain Alert',
      titleHi: 'मौसम व वर्षा अलर्ट',
      descEn: '7-day microclimate forecast & spray guidance',
      descHi: 'अगले 7 दिनों का मौसम व बारिश का पूर्वानुमान',
      icon: CloudSun,
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      badge: '70% Rain 🌧️',
    },
    {
      id: 'ai-assistant',
      titleEn: 'Ask Kisan AI',
      titleHi: 'किसान AI मित्र',
      descEn: '24/7 Voice & Chat Agri-Scientist in your language',
      descHi: 'बोलकर या लिखकर खेती का तुरंत समाधान पाएं',
      icon: Sparkles,
      color: 'bg-[#1B3B11] text-emerald-200 border-[#1B3B11] dark:border-emerald-700 shadow-md',
      badge: '24/7 Voice 🎙️',
      isPrimary: true,
    },
    {
      id: 'government-schemes',
      titleEn: 'Govt Schemes & Subsidies',
      titleHi: 'सरकारी योजनाएं व सब्सिडी',
      descEn: 'PM-Kisan status, KCC loan, solar pump subsidies',
      descHi: 'PM-Kisan किस्त, KCC लोन व सोलर पंप सब्सिडी',
      icon: Landmark,
      color: 'bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border-orange-300 dark:border-orange-800',
      badge: 'PM-Kisan 🇮🇳',
    },
    {
      id: 'bulk-buying',
      titleEn: 'Seed & Fertilizer Buying',
      titleHi: 'खाद-बीज समूह खरीद',
      descEn: 'Order certified seeds & urea at group discount',
      descHi: 'सस्ती दर पर प्रामाणिक खाद, बीज व कीटनाशक',
      icon: ShoppingCart,
      color: 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300 border-teal-300 dark:border-teal-800',
      badge: 'Group Saver 🛒',
    },
    {
      id: 'machinery',
      titleEn: 'Tractor & Machinery Rental',
      titleHi: 'किराये पर कृषि यंत्र',
      descEn: 'Book tractors, rotavators & drone sprayers nearby',
      descHi: 'आसपास के ट्रैक्टर, कल्टीवेटर व ड्रोन बुक करें',
      icon: Tractor,
      color: 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-700',
      badge: 'Custom Hiring 🚜',
    },
  ];

  // Crop Lifecycle Stages
  const cropStages = [
    { id: 'sowing', labelHi: 'बुवाई', labelEn: 'Sowing', day: 1, icon: '🌱' },
    { id: 'germination', labelHi: 'अंकुरण', labelEn: 'Germination', day: 8, icon: '🌿' },
    { id: 'vegetative', labelHi: 'वानस्पतिक', labelEn: 'Vegetative', day: 30, icon: '🌾' },
    { id: 'flowering', labelHi: 'फूल / डोडे', labelEn: 'Flowering', day: 65, icon: '🌼', current: true },
    { id: 'maturity', labelHi: 'परिपक्वता', labelEn: 'Maturity', day: 110, icon: '🌾' },
    { id: 'harvest', labelHi: 'कटाई', labelEn: 'Harvest', day: 150, icon: '🚜' },
  ];

  // Market snapshot data
  const marketDataMap = {
    Cotton: {
      nameHi: 'कपास (Bt Cotton)',
      avgPrice: 7450,
      highestMandi: 'Gondal APMC (28 km)',
      highestPrice: 7620,
      lowestMandi: 'Jasdan APMC (44 km)',
      lowestPrice: 7280,
      priceChange: '+₹190',
      changePercent: '+2.6%',
      isPositive: true,
      bestSellingNote: 'Gondal APMC gives +₹140/Qtl net profit after ₹30 freight',
      trend: [7180, 7220, 7290, 7340, 7310, 7420, 7620],
    },
    Wheat: {
      nameHi: 'गेहूं (Sharbati Wheat)',
      avgPrice: 2420,
      highestMandi: 'Rajkot APMC (18 km)',
      highestPrice: 2540,
      lowestMandi: 'Morbi APMC (62 km)',
      lowestPrice: 2360,
      priceChange: '+₹45',
      changePercent: '+1.9%',
      isPositive: true,
      bestSellingNote: 'Rajkot APMC is paying ₹2,540/Qtl for Sharbati/Tukdi grade',
      trend: [2320, 2350, 2380, 2390, 2410, 2450, 2540],
    },
    Groundnut: {
      nameHi: 'मूंगफली (Groundnut GG-20)',
      avgPrice: 6180,
      highestMandi: 'Junagadh APMC (52 km)',
      highestPrice: 6350,
      lowestMandi: 'Rajkot APMC (18 km)',
      lowestPrice: 6050,
      priceChange: '-₹30',
      changePercent: '-0.5%',
      isPositive: false,
      bestSellingNote: 'Junagadh APMC offers premium for high oil content GG-20',
      trend: [6280, 6250, 6240, 6200, 6190, 6150, 6350],
    },
  };

  const currentMarketStats = marketDataMap[selectedMarketCrop];

  // Alerts center items
  const alertCenterItems = [
    {
      id: 'alt-rain',
      priority: 'CRITICAL',
      icon: AlertTriangle,
      titleHi: '⚠️ भारी बारिश व तेज हवा का अलर्ट',
      titleEn: '⚠️ Heavy Rain & High Winds Expected',
      timeHi: 'अगले 24 घंटे में',
      timeEn: 'Next 24 Hours',
      descHi: 'राजकोट क्षेत्र में 45-65 मिमी वर्षा संभावित। जल निकासी नालियों को तुरंत साफ रखें।',
      descEn: '45-65 mm rainfall expected in Rajkot belt. Clear field drainage channels immediately.',
      actionView: 'weather',
    },
    {
      id: 'alt-pest',
      priority: 'HIGH',
      icon: Scan,
      titleHi: '🔬 गुलाबी सुंडी (Pink Bollworm) सतर्कता',
      titleEn: '🔬 Disease & Pest Risk Increasing',
      timeHi: 'आनंदपुर परिधि (2 किमी)',
      timeEn: 'Anandpur Cluster (2 km)',
      descHi: 'निकटवर्ती खेतों में गुलाबी सुंडी के फेरोमोन ट्रैप में वृद्धि। नियमित गश्त करें।',
      descEn: 'Pheromone trap count exceeded ETL threshold. Inspect leaves and deploy neem spray.',
      actionView: 'disease-scanner',
    },
    {
      id: 'alt-irrig',
      priority: 'MEDIUM',
      icon: Droplets,
      titleHi: '💧 शाम की सूक्ष्म सिंचाई अनुशंसित',
      titleEn: '💧 Irrigation Cycle Recommended',
      timeHi: 'आज शाम 5:30',
      timeEn: 'Today 5:30 PM',
      descHi: 'कपास की जड़ क्षेत्र नमी 42% पर है। 45 मिनट का ड्रिप चक्र पर्याप्त रहेगा।',
      descEn: 'Cotton root moisture is at 42%. Run a 45-minute drip cycle before evening.',
      actionView: 'smart-irrigation',
    },
    {
      id: 'alt-mandi',
      priority: 'MEDIUM',
      icon: TrendingUp,
      titleHi: '📈 गोंडल मंडी में कपास का रिकॉर्ड भाव (+₹220)',
      titleEn: '📈 Gondal Mandi Price Spike (+₹220)',
      timeHi: 'आज सुबह 11:00',
      timeEn: 'Today 11:00 AM',
      descHi: 'उच्च मांग के चलते भाव ₹7,620/क्विंटल पहुंचा। बिक्री के लिए संपर्क करें।',
      descEn: 'High mill demand lifted modal price to ₹7,620/Qtl. View nearby auction status.',
      actionView: 'market-prices',
    },
  ];

  const filteredAlerts = alertCenterItems.filter((alt) => {
    if (activeAlertFilter === 'ALL') return true;
    return alt.priority === activeAlertFilter;
  });

  const handleQuickQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestionInput.trim()) return;
    askAiWithPrompt(quickQuestionInput.trim());
  };

  return (
    <div id="kisan-dashboard" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-24 md:pb-12">
      {/* Live Mandi Ribbon */}
      <MandiTicker />

      {/* ========================================================= */}
      {/* 1. OFFICIAL KRISHI NOTICE BOARD (Today's Official Advisory)*/}
      {/* ========================================================= */}
      <section
        id="official-krishi-advisory-board"
        className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/10 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-amber-950/30 border-2 border-amber-400/80 dark:border-amber-600/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-amber-500 text-stone-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                📢 {language === 'hi' ? 'आज की मुख्य कृषि सलाह' : 'Today\'s Official Krishi Advisory'}
              </span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                {language === 'hi' ? 'कृषि विज्ञान केंद्र (KVK राजकोट) द्वारा सत्यापित' : 'Verified by Krishi Vigyan Kendra (KVK)'}
              </span>
            </div>

            <p className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
              {language === 'hi'
                ? '🌧️ कल 70% वर्षा संभावित है — आज कीटनाशक छिड़काव व दानेदार खाद का उपयोग रोकें। जल निकासी नालियों को खुला रखें।'
                : '🌧️ 70% rain forecasted tomorrow — Avoid foliar pesticide spraying today and clear field drainage channels.'}
            </p>

            <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300 font-medium">
              <span>💧 {language === 'hi' ? 'मृदा नमी:' : 'Soil Moisture:'} <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{moisturePct}% (अनुकूल)</strong></span>
              <span>•</span>
              <span>🌡️ {language === 'hi' ? 'तापमान:' : 'Temp:'} <strong className="text-stone-900 dark:text-stone-100 font-bold">{currentTemp}°C</strong></span>
            </div>
          </div>

          {/* Action Buttons: Voice Player & 1-Tap Call */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={handlePlayAdvisoryAudio}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                isPlayingAudio
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-[#1B3B11] hover:bg-[#265318] text-white'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
              <span>{isPlayingAudio ? (language === 'hi' ? 'आवाज रोकें' : 'Stop Audio') : (language === 'hi' ? 'सलाह सुनें 🔊' : 'Listen Voice 🔊')}</span>
            </button>

            <a
              href="tel:18001801551"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-all"
              title="Call Kisan Call Centre Toll-Free"
            >
              <PhoneCall className="w-4 h-4" />
              <span>1800-180-1551</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. DASHBOARD GREETING & VOICE ASSISTANT BAR                */}
      {/* ========================================================= */}
      <header
        id="dashboard-header"
        className="bg-gradient-to-r from-[#1B3B11] via-[#244b19] to-[#1B3B11] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg border border-emerald-800/40 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-emerald-200 text-xs font-medium">
              <span className="inline-flex items-center gap-1 bg-emerald-900/70 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-900/70 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {farmerProfile.village}, {farmerProfile.district} ({farmerProfile.state})
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40 text-[10px]">
                🇮🇳 PM-Kisan ID: Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              {language === 'hi' ? `राम राम, ${farmerProfile.name.split(' ')[0]} जी` : `Namaste, ${farmerProfile.name || 'Ramesh Patel'}`} 👋
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm">
              {language === 'hi'
                ? '4.5 एकड़ खेत • मुख्य फसल: कपास (Bt Cotton) • सभी सेवाएं नीचे उपलब्ध हैं'
                : '4.5 Acre Farm • Main Crop: Bt Cotton • Tap any service below for instant access'}
            </p>
          </div>

          {/* Quick Voice Agronomist Button */}
          <div className="flex items-center gap-2">
            <button
              id="header-ask-ai-btn"
              onClick={() => setCurrentView('ai-assistant')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-200 text-[#1B3B11] font-black px-4 py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-xs sm:text-sm group"
            >
              <Mic className="w-4 h-4 text-[#1B3B11] group-hover:scale-110 transition-transform" />
              <span>{language === 'hi' ? 'बोलकर पूछें (किसान AI) 🎙️' : 'Voice Agronomist 🎙️'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. 8 BIG ESSENTIAL SERVICES GRID (Farmer-First 1-Tap UI)  */}
      {/* ========================================================= */}
      <section id="essential-farmer-services" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>{language === 'hi' ? 'किसान मुख्य सेवाएं (Essential Services)' : 'Essential Farm Services'}</span>
          </h2>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            {language === 'hi' ? '1-टैप आसान उपयोग' : '1-Tap Direct Access'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {essentialServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <button
                key={srv.id}
                id={`service-card-${srv.id}`}
                onClick={() => setCurrentView(srv.id)}
                className={`p-4 sm:p-5 rounded-2xl border text-left flex flex-col justify-between min-h-[140px] transition-all hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] group cursor-pointer ${srv.color}`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`p-3 rounded-2xl ${srv.isPrimary ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white dark:bg-stone-900 shadow-sm'}`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${srv.isPrimary ? 'bg-amber-400 text-stone-950' : 'bg-white/90 dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700'}`}>
                    {srv.badge}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className={`font-black text-sm sm:text-base leading-tight ${srv.isPrimary ? 'text-white' : 'text-stone-900 dark:text-stone-100'}`}>
                    {language === 'hi' ? srv.titleHi : srv.titleEn}
                  </h3>
                  <p className={`text-xs mt-1 line-clamp-2 ${srv.isPrimary ? 'text-emerald-200/90' : 'text-stone-600 dark:text-stone-300'}`}>
                    {language === 'hi' ? srv.descHi : srv.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. DIRECT 1-TAP PUMP CONTROLLER & FARM STATUS (2-COL)     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pump Controller Card (1 Col) */}
        <div className="bg-white dark:bg-[#161c14] rounded-2xl sm:rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base">
                  {language === 'hi' ? 'खेत पंप स्विच' : 'Irrigation Pump Switch'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {language === 'hi' ? '4.5 एकड़ ड्रिप लाइन' : '4.5 Acre Drip Network'}
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                isPumpRunning ? 'bg-cyan-500 text-white animate-pulse' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {isPumpRunning ? '● PUMP ON' : '○ IDLE (OFF)'}
            </span>
          </div>

          <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-stone-600 dark:text-stone-400">{language === 'hi' ? 'जड़ क्षेत्र नमी:' : 'Soil Moisture:'}</span>
              <span className="font-black text-base text-stone-900 dark:text-stone-100">{moisturePct}% ({language === 'hi' ? 'अनुकूल' : 'Optimal'})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600 dark:text-stone-400">{language === 'hi' ? 'अंतिम चक्र:' : 'Last Watered:'}</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">Yesterday, 6:00 PM (45m)</span>
            </div>
          </div>

          <button
            id="dashboard-toggle-pump-btn"
            onClick={handleTogglePump}
            disabled={isPumpLoading}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
              isPumpRunning
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isPumpLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            <span>
              {isPumpRunning
                ? (language === 'hi' ? '⏹️ पंप बंद करें (Turn Pump OFF)' : 'Stop Irrigation Pump')
                : (language === 'hi' ? '▶️ पंप चालू करें (Turn Pump ON)' : 'Start Irrigation Pump')}
            </span>
          </button>
        </div>

        {/* 4 Quick Farm Overview Metrics (2 Cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Current Crop */}
          <div
            onClick={() => setCurrentView('my-crops')}
            className="bg-white dark:bg-[#161c14] rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                🌱 {language === 'hi' ? 'मुख्य फसल' : 'Current Crop'}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">{cropDisplayName}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">{cropVariety} • Day {daysSinceSowing} of 150</p>
            <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between text-xs">
              <span className="text-stone-500">{language === 'hi' ? 'अवस्था:' : 'Stage:'}</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{cropStage}</span>
            </div>
          </div>

          {/* Card 2: Crop Health */}
          <div
            onClick={() => setCurrentView('disease-scanner')}
            className="bg-white dark:bg-[#161c14] rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-950 px-2.5 py-0.5 rounded-full">
                🌿 {language === 'hi' ? 'फसल स्वास्थ्य' : 'Crop Health'}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100">{cropHealthScore}</span>
              <span className="text-xs font-bold text-stone-500">/ 100</span>
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" /> Good
              </span>
            </div>
            <div className="mt-3 w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${cropHealthScore}%` }} />
            </div>
          </div>

          {/* Card 3: Mandi Rate Callout */}
          <div
            onClick={() => setCurrentView('market-prices')}
            className="bg-white dark:bg-[#161c14] rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">
                📈 {language === 'hi' ? 'आज का मंडी भाव' : 'Live Mandi Price'}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100">₹7,620</span>
              <span className="text-xs text-stone-500">/ क्विंटल</span>
              <span className="ml-auto text-xs font-bold text-emerald-700 dark:text-emerald-400">+₹220 उछाल</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-2 truncate">
              ⭐ Gondal APMC (सर्वोत्तम दर)
            </p>
          </div>

          {/* Card 4: Estimated Profit */}
          <div
            onClick={() => setCurrentView('profit-calculator')}
            className="bg-white dark:bg-[#161c14] rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                💰 {language === 'hi' ? 'अनुमानित मुनाफा' : 'Estimated Net ROI'}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹1,91,500</span>
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                +107% ROI
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
              कुल आय: ₹2,84,000 • लागत: ₹92,500
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. CROP LIFECYCLE PROGRESS & HARVEST COUNTDOWN             */}
      {/* ========================================================= */}
      <section className="bg-white dark:bg-[#161c14] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {language === 'hi' ? 'फसल विकास चक्र व कटाई समय' : 'Crop Growth Lifecycle & Harvest Timeline'}
              </h2>
              <p className="text-xs text-stone-500">{cropDisplayName} ({cropVariety}) • 150 Days Cycle</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('my-crops')}
            className="text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1"
          >
            <span>{language === 'hi' ? 'विस्तार देखें' : 'View Details'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline bar */}
        <div className="grid grid-cols-6 gap-2 pt-2">
          {cropStages.map((stg) => {
            const isPassed = stg.day <= 68;
            const isCurrent = stg.current;

            return (
              <div key={stg.id} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-base sm:text-lg border-2 transition-all ${
                    isCurrent
                      ? 'bg-[#1B3B11] text-white border-emerald-400 shadow-lg ring-4 ring-emerald-500/20 scale-105'
                      : isPassed
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  <span>{stg.icon}</span>
                </div>

                <span
                  className={`text-[11px] sm:text-xs font-bold mt-2 leading-tight ${
                    isCurrent ? 'text-[#1B3B11] dark:text-emerald-400 font-black' : isPassed ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400'
                  }`}
                >
                  {language === 'hi' ? stg.labelHi : stg.labelEn}
                </span>
                <span className="text-[10px] text-stone-500">Day {stg.day}</span>
              </div>
            );
          })}
        </div>

        {/* Status Callout Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs">
          <div>
            <p className="text-stone-500 dark:text-stone-400 font-medium">{language === 'hi' ? 'वर्तमान स्थिति' : 'Current Stage'}</p>
            <p className="text-sm font-extrabold text-[#1B3B11] dark:text-emerald-300 mt-0.5">🌼 Flowering & Boll Formation</p>
          </div>
          <div>
            <p className="text-stone-500 dark:text-stone-400 font-medium">{language === 'hi' ? 'अगला महत्वपूर्ण कदम' : 'Next Stage'}</p>
            <p className="text-sm font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">🌾 Boll Opening (~22 Days)</p>
          </div>
          <div>
            <p className="text-stone-500 dark:text-stone-400 font-medium">{language === 'hi' ? 'कटाई का अनुमान' : 'Harvest ETA'}</p>
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">~58 Days Remaining</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. PRIORITY ALERTS & ADVISORY LIST                         */}
      {/* ========================================================= */}
      <section className="bg-white dark:bg-[#161c14] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {language === 'hi' ? 'खेत अलर्ट व चेतावनियां' : 'Farm Alerts & Warnings'}
              </h2>
              <p className="text-xs text-stone-500">Real-time alerts for Anandpur Cluster</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((flt) => (
              <button
                key={flt}
                onClick={() => setActiveAlertFilter(flt)}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  activeAlertFilter === flt
                    ? 'bg-[#1B3B11] text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredAlerts.map((alt) => {
            const Icon = alt.icon;
            const isCritical = alt.priority === 'CRITICAL';
            return (
              <div
                key={alt.id}
                className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isCritical
                    ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                    : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl border mt-0.5 ${isCritical ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isCritical ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        {alt.priority}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {language === 'hi' ? alt.titleHi : alt.titleEn}
                      </h4>
                      <span className="text-xs text-stone-500">• {language === 'hi' ? alt.timeHi : alt.timeEn}</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                      {language === 'hi' ? alt.descHi : alt.descEn}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView(alt.actionView)}
                  className="self-end sm:self-center px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 shadow-xs whitespace-nowrap"
                >
                  {language === 'hi' ? 'विवरण देखें' : 'View Action'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. QUICK QUESTION INPUT (Large Accessible Interaction Box) */}
      {/* ========================================================= */}
      <section
        id="ai-quick-question-card"
        className="bg-gradient-to-br from-[#1B3B11] via-[#224817] to-[#16300e] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-emerald-800/40"
      >
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-600/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kisan AI Assistant • Gemini 3.7 Flash</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'खेती से जुड़ा कोई भी सवाल पूछें' : 'Ask Any Agricultural Question'}
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm max-w-xl mx-auto">
            {language === 'hi'
              ? 'आवाज या टाइप करके रोग, खाद, सिंचाई, मौसम या मंडी भाव का तुरंत समाधान पाएं।'
              : 'Ask questions via voice or text for instant agronomic advice, disease solutions, and market forecasts.'}
          </p>

          <form onSubmit={handleQuickQuestionSubmit} className="relative max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center bg-white dark:bg-stone-900 rounded-2xl p-1.5 shadow-xl border-2 border-emerald-400/60">
              <input
                id="quick-ai-input"
                type="text"
                value={quickQuestionInput}
                onChange={(e) => setQuickQuestionInput(e.target.value)}
                placeholder={language === 'hi' ? 'किसान भाई से पूछें... (उदा: क्या आज सिंचाई करें?)' : 'Ask Kisan Bhai... (e.g. Should I irrigate today?)'}
                className="w-full pl-3 pr-24 py-2.5 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm font-medium focus:outline-none bg-transparent"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => askAiWithPrompt('What are the key priority steps I must take for my cotton crop today?')}
                  title="Voice Query"
                  className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Mic className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                </button>

                <button
                  type="submit"
                  disabled={!quickQuestionInput.trim()}
                  className="p-2.5 rounded-xl bg-[#1B3B11] hover:bg-[#254d19] text-white disabled:opacity-40 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. OFFICIAL KISAN SUPPORT & EMERGENCY CONTACTS             */}
      {/* ========================================================= */}
      <footer className="bg-stone-100 dark:bg-stone-900/80 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="text-lg">🇮🇳</span>
          <span>
            {language === 'hi'
              ? 'डिजिटल कृषि मिशन • राष्ट्रीय कृषि ज्ञान नेटवर्क (ICAR संरेखित)'
              : 'Digital Krishi Mission • National Agri-Knowledge Network (ICAR Aligned)'}
          </span>
        </div>

        <div className="flex items-center gap-4 font-bold">
          <a href="tel:18001801551" className="text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>1800-180-1551 (टोल फ्री)</span>
          </a>
          <span>•</span>
          <button
            onClick={() => setCurrentView('talk-to-expert')}
            className="text-emerald-800 dark:text-emerald-300 hover:underline"
          >
            {language === 'hi' ? 'विशेषज्ञ से बात करें' : 'Talk to Expert'}
          </button>
        </div>
      </footer>
    </div>
  );
};
