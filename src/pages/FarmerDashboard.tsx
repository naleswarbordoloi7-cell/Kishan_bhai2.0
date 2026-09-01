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
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Check,
  Activity,
  Layers,
  Thermometer,
  Wind,
  Compass,
  DollarSign,
  AlertCircle,
  Eye,
  PlusCircle,
  BookOpen,
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
    diaryEntries,
  } = useApp();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedMarketCrop, setSelectedMarketCrop] = useState<'Cotton' | 'Wheat' | 'Groundnut'>('Cotton');
  const [quickQuestionInput, setQuickQuestionInput] = useState('');
  const [activeAlertFilter, setActiveAlertFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [isPumpLoading, setIsPumpLoading] = useState(false);

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

  // 1. AI Recommendations (Personalized)
  const aiRecommendations = [
    {
      id: 'rec-rain-spray',
      type: 'WEATHER',
      icon: CloudSun,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      priority: 'CRITICAL',
      priorityColor: 'bg-rose-100 text-rose-800 border-rose-200',
      title: language === 'hi' ? '🌧️ वर्षा चेतावनी व छिड़काव रोक' : '🌧️ Rain Alert & Spray Precaution',
      reason:
        language === 'hi'
          ? 'कल 70% बारिश का अनुमान है। आज दानेदार खाद का छिड़काव न करें और कीटनाशक स्प्रे को टालें ताकि दवा न धुले।'
          : 'Rain expected tomorrow (70% probability). Delay foliar pesticide spraying and avoid broadcasting granular fertilizers to prevent chemical runoff.',
      actionLabel: language === 'hi' ? 'मौसम सलाह देखें' : 'View Weather Advice',
      actionView: 'weather',
    },
    {
      id: 'rec-irrigation',
      type: 'IRRIGATION',
      icon: Droplets,
      iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      priority: 'MEDIUM',
      priorityColor: 'bg-amber-100 text-amber-800 border-amber-200',
      title: language === 'hi' ? '💧 स्मार्ट ड्रिप सिंचाई चक्र' : '💧 Smart Drip Irrigation Schedule',
      reason:
        language === 'hi'
          ? `मृदा नमी ${moisturePct}% है। वाष्पीकरण से बचने हेतु शाम 5:30 बजे 45 मिनट का ड्रिप चक्र चलाएं।`
          : `Root-zone soil moisture is at ${moisturePct}%. Schedule an evening 45-min micro-drip cycle at 5:30 PM to optimize moisture retention.`,
      actionLabel: language === 'hi' ? 'सिंचाई नियंत्रित करें' : 'Manage Irrigation',
      actionView: 'smart-irrigation',
    },
    {
      id: 'rec-crop-care',
      type: 'CROP_CARE',
      icon: Sprout,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      priority: 'HIGH',
      priorityColor: 'bg-orange-100 text-orange-800 border-orange-200',
      title: language === 'hi' ? '🌱 फूल व कली पोषण (13:0:45)' : '🌱 Peak Flowering Nutrition (13:0:45)',
      reason:
        language === 'hi'
          ? 'कपास की फसल फूल व डोडे बनने की अवस्था में है। फूल झड़ने से रोकने हेतु 1% पोटैशियम नाइट्रेट (13:0:45) का पर्णीय छिड़काव करें।'
          : 'Cotton is entering peak flowering stage. Apply 1% Potassium Nitrate (13:0:45) foliar spray to prevent premature flower shedding and boost boll weight.',
      actionLabel: language === 'hi' ? 'फसल गाइड देखें' : 'View Crop Guide',
      actionView: 'my-crops',
    },
    {
      id: 'rec-disease',
      type: 'PEST_RISK',
      icon: Scan,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
      priority: 'HIGH',
      priorityColor: 'bg-orange-100 text-orange-800 border-orange-200',
      title: language === 'hi' ? '🔬 रस चूसक कीट सतर्कता' : '🔬 Sucking Pest Alert (Thrips/Aphids)',
      reason:
        language === 'hi'
          ? 'आनंदपुर क्लस्टर में अधिक आर्द्रता के कारण रस चूसक कीटों का जोखिम 14% बढ़ा है। पत्तियों की निचली सतह का निरीक्षण करें।'
          : 'High humidity in Anandpur cluster has elevated Sucking Pest risk (Thrips/Aphids) by 14%. Inspect leaf undersides with the scanner.',
      actionLabel: language === 'hi' ? 'पत्ती स्कैन करें' : 'Scan Leaves Now',
      actionView: 'disease-scanner',
    },
    {
      id: 'rec-market',
      type: 'MARKET',
      icon: TrendingUp,
      iconColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      priority: 'MEDIUM',
      priorityColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: language === 'hi' ? '📈 गोंडल APMC में भाव उछाल' : '📈 Mandi Price Surge (+₹220/Qtl)',
      reason:
        language === 'hi'
          ? 'गोंडल APMC में कपास का मॉडल भाव ₹7,620/क्विंटल पहुंचा (+₹220 उछाल)। स्टॉक किए माल की बिक्री का अनुकूल समय।'
          : 'Gondal APMC modal price jumped +₹220/Qtl to ₹7,620/Qtl today. Highly favorable price window to liquidate stored lots.',
      actionLabel: language === 'hi' ? 'मंडी भाव देखें' : 'Check Mandi Rates',
      actionView: 'market-prices',
    },
  ];

  // Crop Lifecycle Stages
  const cropStages = [
    { id: 'sowing', label: language === 'hi' ? 'बुवाई' : 'Sowing', day: 1, icon: '🌱' },
    { id: 'germination', label: language === 'hi' ? 'अंकुरण' : 'Germination', day: 8, icon: '🌿' },
    { id: 'vegetative', label: language === 'hi' ? 'वानस्पतिक' : 'Vegetative', day: 30, icon: '🌾' },
    { id: 'flowering', label: language === 'hi' ? 'फूल / डोडे' : 'Flowering', day: 65, icon: '🌼', current: true },
    { id: 'maturity', label: language === 'hi' ? 'परिपक्वता' : 'Maturity', day: 110, icon: '🌾' },
    { id: 'harvest', label: language === 'hi' ? 'कटाई' : 'Harvest', day: 150, icon: '🚜' },
  ];

  // Market snapshot data
  const marketDataMap = {
    Cotton: {
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

  // Quick Action items
  const quickActions = [
    {
      id: 'disease-scanner',
      title: language === 'hi' ? 'रोग स्कैनर' : 'Scan Disease',
      subtitle: language === 'hi' ? 'पत्ती फोटो स्कैन करें' : 'AI Leaf Diagnosis',
      icon: Scan,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-500 hover:bg-purple-100/60',
      badge: '96% Acc',
    },
    {
      id: 'crop-recommendation',
      title: language === 'hi' ? 'फसल चयन' : 'Recommend Crop',
      subtitle: language === 'hi' ? 'मृदा व मौसम अनुसार' : 'Soil & Profit Fit',
      icon: Sprout,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/60',
      badge: 'Kharif/Rabi',
    },
    {
      id: 'smart-irrigation',
      title: language === 'hi' ? 'सिंचाई जांचें' : 'Check Irrigation',
      subtitle: language === 'hi' ? 'नमी व पंप नियंत्रण' : 'Root Moisture & Pump',
      icon: Droplets,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:border-cyan-500 hover:bg-cyan-100/60',
      badge: isPumpRunning ? 'PUMP ACTIVE' : 'OPTIMAL',
    },
    {
      id: 'market-prices',
      title: language === 'hi' ? 'मंडी भाव' : 'Market Prices',
      subtitle: language === 'hi' ? 'लाइव APMC दरें' : 'Live Mandi Rates',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-500 hover:bg-amber-100/60',
      badge: 'Agmarknet',
    },
    {
      id: 'profit-calculator',
      title: language === 'hi' ? 'मुनाफा गणना' : 'Calculate Profit',
      subtitle: language === 'hi' ? 'लागत, उपज व ROI' : 'Cost & Net Margin',
      icon: Calculator,
      color: 'bg-stone-100 text-stone-800 border-stone-300 hover:border-stone-500 hover:bg-stone-200/60',
      badge: 'ROI Tool',
    },
    {
      id: 'ai-assistant',
      title: language === 'hi' ? 'किसान AI' : 'Ask AI',
      subtitle: language === 'hi' ? '24/7 कृषि विशेषज्ञ' : '24/7 Voice Agronomist',
      icon: Sparkles,
      color: 'bg-[#1B3B11] text-emerald-300 border-[#1B3B11] hover:bg-[#254d19] hover:border-emerald-600 shadow-md',
      badge: 'Gemini 3.7',
      isPrimary: true,
    },
  ];

  // Alerts center data
  const alertCenterItems = [
    {
      id: 'alt-rain',
      priority: 'CRITICAL',
      icon: AlertTriangle,
      title: language === 'hi' ? '⚠️ भारी बारिश व तेज हवा का अलर्ट' : '⚠️ Heavy Rain & High Winds Expected',
      time: language === 'hi' ? 'अगले 24 घंटे में' : 'Next 24 Hours',
      desc: language === 'hi' ? 'राजकोट क्षेत्र में 45-65 मिमी वर्षा संभावित। जल निकासी नालियों को तुरंत साफ रखें।' : '45-65 mm rainfall expected in Rajkot belt. Clear field drainage channels immediately.',
      actionView: 'weather',
    },
    {
      id: 'alt-pest',
      priority: 'HIGH',
      icon: Scan,
      title: language === 'hi' ? '🔬 गुलाबी सुंडी (Pink Bollworm) जोखिम' : '🔬 Disease & Pest Risk Increasing',
      time: language === 'hi' ? 'आनंदपुर परिधि (2 किमी)' : 'Anandpur Cluster (2 km)',
      desc: language === 'hi' ? 'निकटवर्ती खेतों में गुलाबी सुंडी के फेरोमोन ट्रैप में वृद्धि। नियमित गश्त करें।' : 'Pheromone trap count exceeded ETL threshold (8 moths/trap). Deploy neem bio-spray.',
      actionView: 'disease-scanner',
    },
    {
      id: 'alt-irrig',
      priority: 'MEDIUM',
      icon: Droplets,
      title: language === 'hi' ? '💧 शाम की सूक्ष्म सिंचाई अनुशंसित' : '💧 Irrigation Cycle Recommended',
      time: language === 'hi' ? 'आज शाम 5:30' : 'Today 5:30 PM',
      desc: language === 'hi' ? 'कपास की जड़ क्षेत्र नमी 42% पर है। 45 मिनट का ड्रिप चक्र पर्याप्त रहेगा।' : 'Cotton root moisture is at 42%. Run a 45-minute drip cycle before evening.',
      actionView: 'smart-irrigation',
    },
    {
      id: 'alt-mandi',
      priority: 'INFORMATIONAL',
      icon: TrendingUp,
      title: language === 'hi' ? '📈 गोंडल मंडी में कपास का रिकॉर्ड भाव' : '📈 Gondal Mandi Price Spike (+₹220)',
      time: language === 'hi' ? 'आज सुबह 11:00' : 'Today 11:00 AM',
      desc: language === 'hi' ? 'उच्च मांग के चलते भाव ₹7,620/क्विंटल पहुंचा। बिक्री के लिए संपर्क करें।' : 'High mill demand lifted model price to ₹7,620/Qtl. View nearby auction status.',
      actionView: 'market-prices',
    },
    {
      id: 'alt-temp',
      priority: 'HIGH',
      icon: Thermometer,
      title: language === 'hi' ? '🌡️ दोपहर में उच्च तापमान चेतावनी (36°C)' : '🌡️ High Afternoon Heat Expected (36°C)',
      time: language === 'hi' ? 'दोपहर 1:00 - 3:30' : '1:00 PM - 3:30 PM',
      desc: language === 'hi' ? 'फसल में वाष्पोत्सर्जन तनाव से बचने हेतु दोपहर में छिड़काव न करें।' : 'Avoid foliar sprays during peak afternoon sun to prevent leaf scorching.',
      actionView: 'weather',
    },
  ];

  const filteredAlerts = alertCenterItems.filter((alt) => {
    if (activeAlertFilter === 'ALL') return true;
    return alt.priority === activeAlertFilter;
  });

  // Recent Farm Activity timeline
  const recentActivities = [
    {
      id: 'act-1',
      time: language === 'hi' ? 'आज, सुबह 06:30' : 'Today, 06:30 AM',
      icon: Droplets,
      iconColor: 'bg-cyan-100 text-cyan-800',
      title: language === 'hi' ? 'सिंचाई पूर्ण' : 'Irrigation Completed',
      desc: language === 'hi' ? '4.5 एकड़ में 45 मिनट ड्रिप चक्र पूर्ण (1,250 लीटर बचत)' : '45 mins micro-drip cycle completed on 4.5 acres (1,250 L conserved)',
    },
    {
      id: 'act-2',
      time: language === 'hi' ? 'कल, शाम 04:15' : 'Yesterday, 04:15 PM',
      icon: Sprout,
      iconColor: 'bg-emerald-100 text-emerald-800',
      title: language === 'hi' ? 'पोषक तत्व छिड़काव' : 'Fertilizer Applied',
      desc: language === 'hi' ? '15 किग्रा बायो-पोटाश व सूक्ष्म पोषक तत्वों का पर्णीय छिड़काव' : '15 kg Bio-Potash foliar spray applied for boll development',
    },
    {
      id: 'act-3',
      time: language === 'hi' ? '3 दिन पहले' : '3 days ago',
      icon: Scan,
      iconColor: 'bg-purple-100 text-purple-800',
      title: language === 'hi' ? 'पत्ती रोग स्कैन' : 'Disease Scan Done',
      desc: language === 'hi' ? 'कपास पत्ती स्कैन — 98% स्वस्थ (कोई फंगल लक्षण नहीं)' : 'Cotton leaf scan — 98% Healthy (No fungal symptoms)',
    },
    {
      id: 'act-4',
      time: language === 'hi' ? '5 दिन पहले' : '5 days ago',
      icon: TrendingUp,
      iconColor: 'bg-amber-100 text-amber-800',
      title: language === 'hi' ? 'मंडी भाव जांच' : 'Market Price Checked',
      desc: language === 'hi' ? 'राजकोट APMC कपास भाव ₹7,260/क्विंटल दर्ज' : 'Rajkot APMC cotton modal price ₹7,260/Qtl reviewed',
    },
  ];

  // AI Quick Prompts
  const suggestedPrompts = [
    {
      label: language === 'hi' ? 'आज मुझे खेत में क्या करना चाहिए?' : 'What should I do today?',
      query: 'What are the top 3 priority farming actions for my 4.5 acre cotton crop in Anandpur today based on weather and soil?',
    },
    {
      label: language === 'hi' ? 'क्या कल बारिश होगी?' : 'Will it rain tomorrow?',
      query: 'Will it rain tomorrow in Anandpur Rajkot, and should I delay my pesticide spraying and irrigation?',
    },
    {
      label: language === 'hi' ? 'क्या मुझे आज सिंचाई करनी चाहिए?' : 'Should I irrigate today?',
      query: 'My soil moisture is at 42% and rain is expected tomorrow. Should I irrigate my cotton field today or wait?',
    },
    {
      label: language === 'hi' ? 'पत्तियां पीली क्यों पड़ रही हैं?' : 'Why are my leaves yellow?',
      query: 'Why are the bottom leaves of my cotton turning yellow during flowering stage, and what organic remedy fixes it?',
    },
    {
      label: language === 'hi' ? 'फसल कब बेचनी चाहिए?' : 'When should I sell my crop?',
      query: 'Given current APMC mandi trends in Gondal and Rajkot, is this the right time to sell my cotton harvest or wait?',
    },
  ];

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
      {/* 1. DASHBOARD HEADER                                        */}
      {/* ========================================================= */}
      <header
        id="dashboard-header"
        className="bg-gradient-to-r from-[#1B3B11] via-[#244b19] to-[#1B3B11] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-800/40 relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-emerald-200 text-xs sm:text-sm font-medium">
              <span className="inline-flex items-center gap-1 bg-emerald-900/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-emerald-700/50">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-900/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-emerald-700/50">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {farmerProfile.village}, {farmerProfile.district} ({farmerProfile.state})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Namaste, {farmerProfile.name || 'Ramesh Patel'} 👋
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base font-normal">
              {language === 'hi'
                ? 'आज आपके खेत में क्या हो रहा है, इसकी पूरी जानकारी यहाँ है।'
                : "Here’s what’s happening on your farm today."}
            </p>
          </div>

          {/* Right Header Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Language Selector */}
            <div className="inline-flex bg-emerald-950/80 p-1 rounded-xl border border-emerald-700/40">
              <button
                id="btn-lang-en"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'en' ? 'bg-emerald-500 text-stone-950 shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                id="btn-lang-hi"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'hi' ? 'bg-emerald-500 text-stone-950 shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Notification Bell */}
            <button
              id="header-notification-btn"
              onClick={() => setCurrentView('alerts')}
              aria-label="View Farm Notifications"
              className="relative p-2.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/40 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-[#1B3B11] animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              id="header-profile-avatar-btn"
              onClick={() => setCurrentView('settings')}
              aria-label="Farmer Profile Settings"
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-700/40 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-[#1B3B11] font-black flex items-center justify-center text-sm shadow-inner">
                {farmerProfile.name ? farmerProfile.name.charAt(0) : 'R'}
              </div>
              <div className="hidden sm:block text-xs">
                <p className="font-bold leading-tight text-white">{farmerProfile.name.split(' ')[0]}</p>
                <p className="text-[10px] text-emerald-300">4.5 Acres</p>
              </div>
            </button>

            {/* Prominent Ask Kisan Bhai Button */}
            <button
              id="header-ask-ai-btn"
              onClick={() => setCurrentView('ai-assistant')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-200 text-[#1B3B11] font-extrabold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all text-sm group"
            >
              <Sparkles className="w-4 h-4 text-[#1B3B11] group-hover:rotate-12 transition-transform" />
              <span>Ask Kisan Bhai 🤖</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. FARM OVERVIEW (4 Premium Summary Cards)                 */}
      {/* ========================================================= */}
      <section id="farm-overview-cards" aria-label="Farm Overview Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Crop */}
        <div
          id="card-current-crop"
          onClick={() => setCurrentView('my-crops')}
          className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              🌱 {language === 'hi' ? 'मुख्य फसल' : 'Current Crop'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
            {cropDisplayName}
          </h2>
          <p className="text-xs text-stone-500 font-medium mb-3">{cropVariety}</p>

          <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>{language === 'hi' ? 'अवस्था' : 'Growth Stage'}:</span>
              <span className="font-semibold text-stone-900">{cropStage}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{language === 'hi' ? 'बुवाई के दिन' : 'Days Since Sowing'}:</span>
              <span className="font-bold text-emerald-700">
                {language === 'hi' ? `दिन ${daysSinceSowing} / 150` : `Day ${daysSinceSowing} of 150`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Crop Health */}
        <div
          id="card-crop-health"
          onClick={() => setCurrentView('disease-scanner')}
          className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center border border-green-100 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-800 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
              🌿 {language === 'hi' ? 'फसल स्वास्थ्य' : 'Crop Health'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">{cropHealthScore}</span>
            <span className="text-xs font-bold text-stone-700">/ 100</span>
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Good
            </span>
          </div>

          <div className="mt-3">
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full"
                style={{ width: `${cropHealthScore}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
              <span>{language === 'hi' ? 'पत्ती कैनोपी' : 'Leaf Canopy'}: 94% Vigorous</span>
              <span className="text-emerald-700 font-semibold">{language === 'hi' ? 'सुरक्षित' : 'Protected'}</span>
            </p>
          </div>
        </div>

        {/* Card 3: Soil Moisture */}
        <div
          id="card-soil-moisture"
          onClick={() => setCurrentView('smart-irrigation')}
          className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              💧 {language === 'hi' ? 'मृदा नमी' : 'Soil Moisture'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">{moisturePct}%</span>
            <span className="text-xs text-stone-700 font-medium">({language === 'hi' ? 'अनुकूल 40-60%' : 'Optimal 40-60%'})</span>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs mt-3">
            <div className="flex justify-between items-center text-stone-600">
              <span>{language === 'hi' ? 'पंप स्थिति' : 'Irrigation Status'}:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  isPumpRunning ? 'bg-cyan-500 text-white animate-pulse' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {isPumpRunning ? '● RUNNING' : 'IDLE (Auto-Drip)'}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{language === 'hi' ? 'अंतिम सिंचाई' : 'Last Irrigation'}:</span>
              <span className="font-semibold text-stone-900">Yesterday, 6:00 PM</span>
            </div>
          </div>
        </div>

        {/* Card 4: Estimated Profit */}
        <div
          id="card-estimated-profit"
          onClick={() => setCurrentView('profit-calculator')}
          className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              💰 {language === 'hi' ? 'अनुमानित मुनाफा' : 'Estimated Profit'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-700">₹1,91,500</span>
            <span className="text-xs font-bold text-emerald-600 ml-auto bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +107% ROI
            </span>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs mt-3">
            <div className="flex justify-between text-stone-600">
              <span>{language === 'hi' ? 'अनुमानित आय' : 'Expected Revenue'}:</span>
              <span className="font-bold text-stone-900">₹2,84,000</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{language === 'hi' ? 'कुल लागत' : 'Estimated Expenses'}:</span>
              <span className="font-medium text-stone-500">₹92,500 (4.5 Ac)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. TODAY'S AI RECOMMENDATIONS (Personalized Action Items)  */}
      {/* ========================================================= */}
      <section id="ai-recommendations-section" className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Sparkles className="w-5 h-5 text-emerald-700" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                Kisan Bhai&apos;s Recommendations
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {language === 'hi'
                ? 'फसल, मौसम, मृदा व बाजार विश्लेषण पर आधारित आज के प्रमुख 5 कार्य'
                : 'Personalized agronomic insights dynamically generated from crop stage, weather forecast, soil moisture, and APMC trends.'}
            </p>
          </div>
          <button
            onClick={() => askAiWithPrompt('Analyze my entire farm status today and give me a step-by-step action plan.')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>{language === 'hi' ? 'विस्तृत AI सलाह लें' : 'Generate Full Farm Plan'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiRecommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.id}
                id={`rec-${rec.id}`}
                className="bg-stone-50/70 hover:bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl border ${rec.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${rec.priorityColor}`}>
                      {rec.priority} PRIORITY
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                    {rec.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-200/60 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-700">
                    {language === 'hi' ? 'अनुशंसित कदम:' : 'Action Required:'}
                  </span>
                  <button
                    onClick={() => setCurrentView(rec.actionView)}
                    className="text-xs font-bold text-[#1B3B11] bg-emerald-100/80 hover:bg-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-300/60 transition-colors flex items-center gap-1 group"
                  >
                    <span>{rec.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. WEATHER INTELLIGENCE & ACTIONABLE FARMING ADVICE       */}
      {/* ========================================================= */}
      <section id="weather-intelligence-section" className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <CloudSun className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                Weather Intelligence & Advisory
              </h2>
              <p className="text-xs text-stone-500">Live Microclimate Radar for Anandpur, Rajkot</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full self-start sm:self-auto">
            IMD Agro-Meteorological Feed
          </span>
        </div>

        {/* Actionable Advice Banner (Primary Focus) */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-2 border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-600 text-white uppercase tracking-wider">
                🌧️ Farming Advice
              </span>
              <span className="text-xs font-bold text-blue-950">
                {language === 'hi' ? 'कल 70% वर्षा की संभावना' : '70% chance of rain tomorrow.'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-blue-900">
              <strong className="text-blue-950">Recommended Action: </strong>
              {language === 'hi'
                ? 'आज सिंचाई रोक दें और कीटनाशक का छिड़काव न करें। जल भराव से बचाव के लिए खेत की नालियों को खुला रखें।'
                : 'Delay irrigation and avoid spraying pesticides today. Ensure clear drainage channels to prevent root-zone waterlogging.'}
            </p>
          </div>

          <button
            onClick={() => setCurrentView('smart-irrigation')}
            className="whitespace-nowrap px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सिंचाई अनुसूची समायोजित करें' : 'Adjust Irrigation Schedule'}</span>
          </button>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-stone-500 uppercase font-bold">{language === 'hi' ? 'तापमान' : 'Temperature'}</p>
              <p className="text-base font-extrabold text-stone-900">{currentTemp}°C</p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-stone-500 uppercase font-bold">{language === 'hi' ? 'आर्द्रता' : 'Humidity'}</p>
              <p className="text-base font-extrabold text-stone-900">{currentHumidity}%</p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-stone-500 uppercase font-bold">{language === 'hi' ? 'बारिश की संभावना' : 'Rain Probability'}</p>
              <p className="text-base font-extrabold text-blue-700">{currentRainProb}%</p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-stone-500 uppercase font-bold">{language === 'hi' ? 'हवा की गति' : 'Wind Speed'}</p>
              <p className="text-base font-extrabold text-stone-900">{currentWindSpeed} km/h</p>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast Ribbon */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">7-Day Farming Outlook</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {forecastItems.map((fc, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
                  i === 0 || i === 1
                    ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/20'
                    : 'bg-stone-50 border-stone-200/80 hover:bg-stone-100/70'
                }`}
              >
                <span className="text-xs font-bold text-stone-700">{fc.day}</span>
                <span className="text-lg my-1">
                  {fc.rainChance > 50 ? '🌧️' : fc.rainChance > 20 ? '⛅' : '☀️'}
                </span>
                <span className="text-xs font-extrabold text-stone-900">{fc.tempHigh}° / {fc.tempLow}°</span>
                <span className={`text-[10px] font-extrabold mt-1 px-1.5 py-0.5 rounded ${fc.rainChance > 50 ? 'text-blue-700 bg-blue-100' : 'text-stone-500 bg-stone-100'}`}>
                  {fc.rainChance}% Rain
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CROP GROWTH TIMELINE & 6. FARM HEALTH SCORE (2-COL)     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. Crop Growth Timeline (2 Cols) */}
        <div id="crop-growth-timeline-card" className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Sprout className="w-5 h-5 text-emerald-700" />
                </div>
                <h2 className="text-xl font-extrabold text-stone-900">
                  Crop Growth Lifecycle
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {cropDisplayName} ({cropVariety}) • Total Duration: 150 Days
              </p>
            </div>

            <button
              onClick={() => setCurrentView('my-crops')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{language === 'hi' ? 'पूरी फसल डायरी' : 'Manage All Crops'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeline Nodes */}
          <div className="relative py-4">
            {/* Background connecting bar */}
            <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-stone-200 -translate-y-1/2 rounded-full z-0" />
            <div className="absolute top-1/2 left-4 w-3/5 h-1.5 bg-emerald-600 -translate-y-1/2 rounded-full z-0 transition-all duration-500" />

            <div className="relative z-10 grid grid-cols-6 gap-1">
              {cropStages.map((stg) => {
                const isPassed = stg.day <= 68;
                const isCurrent = stg.current;

                return (
                  <div key={stg.id} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm sm:text-base border-2 transition-all ${
                        isCurrent
                          ? 'bg-[#1B3B11] text-white border-emerald-400 shadow-lg ring-4 ring-emerald-500/20 scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-stone-100 text-stone-400 border-stone-300'
                      }`}
                    >
                      <span>{stg.icon}</span>
                    </div>

                    <span
                      className={`text-[11px] sm:text-xs font-bold mt-2 leading-tight ${
                        isCurrent ? 'text-[#1B3B11] font-black' : isPassed ? 'text-stone-800' : 'text-stone-400'
                      }`}
                    >
                      {stg.label}
                    </span>
                    <span className="text-[10px] text-stone-500">Day {stg.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Intelligence Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs">
            <div>
              <p className="text-stone-500 font-medium">{language === 'hi' ? 'वर्तमान अवस्था' : 'Current Stage'}</p>
              <p className="text-sm font-extrabold text-[#1B3B11] mt-0.5">🌼 Flowering & Boll Formation</p>
              <p className="text-[11px] text-emerald-800">Day 68 of 150 (45% Completed)</p>
            </div>

            <div>
              <p className="text-stone-500 font-medium">{language === 'hi' ? 'अगली अवस्था' : 'Expected Next Stage'}</p>
              <p className="text-sm font-extrabold text-stone-900 mt-0.5">🌾 Boll Maturity & Opening</p>
              <p className="text-[11px] text-stone-600">Expected in ~22 days</p>
            </div>

            <div>
              <p className="text-stone-500 font-medium">{language === 'hi' ? 'कटाई का अनुमान' : 'Estimated Days to Harvest'}</p>
              <p className="text-sm font-extrabold text-emerald-700 mt-0.5">~58 Days Remaining</p>
              <p className="text-[11px] text-stone-600">Target Harvest: Late October</p>
            </div>
          </div>
        </div>

        {/* 6. Farm Health Score Gauge (1 Col) */}
        <div id="farm-health-score-card" className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Farm Health Score</h2>
              <p className="text-xs text-stone-500">Holistic AI Agronomic Index</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Tier A1
            </span>
          </div>

          {/* Circular Progress Display */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-stone-100"
                />
                {/* Progress circle (86%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${86 * 2.64} 264`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="text-emerald-600"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-stone-900 tracking-tight">86</span>
                <span className="text-[11px] font-bold text-emerald-700 uppercase">/ 100 Excellent</span>
              </div>
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="space-y-2 text-xs pt-2 border-t border-stone-100">
            <div className="flex justify-between items-center">
              <span className="text-stone-600 font-medium">🌿 Crop Health</span>
              <span className="font-extrabold text-stone-900">90%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600 font-medium">🌱 Soil Health (NPK/OC)</span>
              <span className="font-extrabold text-stone-900">82%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600 font-medium">💧 Water Management</span>
              <span className="font-extrabold text-stone-900">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600 font-medium">🔬 Disease Risk</span>
              <span className="font-extrabold text-emerald-700">Low (9%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600 font-medium">🌧️ Weather Risk</span>
              <span className="font-extrabold text-amber-700">Moderate (28%)</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('soil-health')}
            className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors"
          >
            {language === 'hi' ? 'मृदा स्वास्थ्य कार्ड देखें' : 'View Soil Health Card (SHC)'}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. MARKET SNAPSHOT & TODAY'S MANDI RATES                  */}
      {/* ========================================================= */}
      <section id="market-snapshot-section" className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                Today&apos;s Market Snapshot
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live Mandi Auctions across Saurashtra & Gujarat Hubs • Verified Agmarknet Sync (Demo Feed Labeled)
            </p>
          </div>

          {/* Crop Selector Tabs */}
          <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
            {(['Cotton', 'Wheat', 'Groundnut'] as const).map((crp) => (
              <button
                key={crp}
                onClick={() => setSelectedMarketCrop(crp)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedMarketCrop === crp
                    ? 'bg-[#1B3B11] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {crp}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Stats Cards for Selected Crop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <p className="text-xs text-stone-500 font-medium">{language === 'hi' ? 'औसत मंडी भाव' : 'Average Mandi Price'}</p>
            <p className="text-xl font-black text-stone-900 mt-1">₹{currentMarketStats.avgPrice} <span className="text-xs text-stone-500 font-normal">/ Qtl</span></p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1 bg-emerald-50 px-2 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3" /> {currentMarketStats.priceChange} ({currentMarketStats.changePercent})
            </span>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <p className="text-xs text-stone-500 font-medium">{language === 'hi' ? 'निकटवर्ती उच्चतम भाव' : 'Highest Nearby Price'}</p>
            <p className="text-xl font-black text-emerald-700 mt-1">₹{currentMarketStats.highestPrice} <span className="text-xs text-stone-500 font-normal">/ Qtl</span></p>
            <p className="text-[11px] text-stone-600 font-semibold truncate mt-1">{currentMarketStats.highestMandi}</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <p className="text-xs text-stone-500 font-medium">{language === 'hi' ? 'न्यूनतम मंडी भाव' : 'Lowest Nearby Price'}</p>
            <p className="text-xl font-black text-stone-800 mt-1">₹{currentMarketStats.lowestPrice} <span className="text-xs text-stone-500 font-normal">/ Qtl</span></p>
            <p className="text-[11px] text-stone-600 font-semibold truncate mt-1">{currentMarketStats.lowestMandi}</p>
          </div>

          {/* 7-Day Trend Visual Sparkline */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
            <p className="text-xs text-stone-500 font-medium">7-Day Price Trend</p>
            <div className="flex items-end gap-1 h-8 mt-1">
              {currentMarketStats.trend.map((val, idx) => {
                const min = Math.min(...currentMarketStats.trend);
                const max = Math.max(...currentMarketStats.trend);
                const heightPct = Math.max(20, Math.round(((val - min) / (max - min || 1)) * 100));
                return (
                  <div
                    key={idx}
                    title={`Day ${idx + 1}: ₹${val}/Qtl`}
                    className="flex-1 bg-emerald-600 rounded-t hover:bg-emerald-500 transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-stone-500 mt-1 flex justify-between">
              <span>7d Low</span>
              <span className="font-bold text-emerald-700">7d High (₹{currentMarketStats.highestPrice})</span>
            </p>
          </div>
        </div>

        {/* Best Selling Option Callout Card */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#1B3B11] text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                ⭐ {language === 'hi' ? 'सर्वोत्तम बिक्री विकल्प' : 'Best Selling Option'}
              </span>
              <span className="text-sm font-bold text-emerald-200">{currentMarketStats.highestMandi}</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white">
              {currentMarketStats.highestMandi.split('(')[0]} — ₹{currentMarketStats.highestPrice}/quintal
            </p>
            <p className="text-xs text-emerald-200/90 font-medium">
              💡 {currentMarketStats.bestSellingNote}
            </p>
          </div>

          <button
            onClick={() => setCurrentView('market-prices')}
            className="whitespace-nowrap px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#1B3B11] font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>{language === 'hi' ? 'सभी 12 मंडियां देखें' : 'View All 12 Mandis'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. QUICK ACTIONS (Grid of 6 Large Touch-Friendly Buttons)  */}
      {/* ========================================================= */}
      <section id="quick-actions-section" aria-label="Quick Actions" className="space-y-3">
        <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>{language === 'hi' ? 'त्वरित कार्य' : 'Quick Actions'}</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                id={`quick-action-${act.id}`}
                onClick={() => setCurrentView(act.id)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between min-h-[115px] transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95 group ${act.color}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-xl ${act.isPrimary ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white shadow-sm'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${act.isPrimary ? 'bg-emerald-400 text-stone-950 font-black' : 'bg-white/80 text-stone-600 border border-stone-200/50'}`}>
                    {act.badge}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className={`font-bold text-sm leading-tight ${act.isPrimary ? 'text-white' : 'text-stone-900'}`}>
                    {act.title}
                  </h3>
                  <p className={`text-[11px] mt-0.5 truncate ${act.isPrimary ? 'text-emerald-200/80' : 'text-stone-500'}`}>
                    {act.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. ALERTS CENTER (Priority Categorization)                */}
      {/* ========================================================= */}
      <section id="alerts-center-section" className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
              </div>
              <h2 className="text-xl font-extrabold text-stone-900">
                Farm Alerts & Advisory Center
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">Real-time alerts classified by urgency</p>
          </div>

          {/* Priority filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((flt) => (
              <button
                key={flt}
                onClick={() => setActiveAlertFilter(flt)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeAlertFilter === flt
                    ? flt === 'CRITICAL'
                      ? 'bg-rose-600 text-white'
                      : flt === 'HIGH'
                      ? 'bg-orange-600 text-white'
                      : flt === 'MEDIUM'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#1B3B11] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredAlerts.map((alt) => {
            const Icon = alt.icon;
            const isCritical = alt.priority === 'CRITICAL';
            const isHigh = alt.priority === 'HIGH';
            const isMedium = alt.priority === 'MEDIUM';

            return (
              <div
                key={alt.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isCritical
                    ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
                    : isHigh
                    ? 'bg-orange-50/60 border-orange-200 hover:bg-orange-50'
                    : isMedium
                    ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl border mt-0.5 ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : isHigh
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : isMedium
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : isHigh
                            ? 'bg-orange-600 text-white'
                            : isMedium
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {alt.priority}
                      </span>
                      <h3 className="text-sm font-bold text-stone-900">{alt.title}</h3>
                      <span className="text-xs text-stone-500 font-medium">• {alt.time}</span>
                    </div>
                    <p className="text-xs text-stone-600">{alt.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView(alt.actionView)}
                  className="self-end sm:self-center px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 shadow-sm transition-all whitespace-nowrap"
                >
                  {language === 'hi' ? 'विवरण देखें' : 'View Action'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. RECENT FARM ACTIVITY (Chronological Timeline)        */}
      {/* ========================================================= */}
      <section id="recent-farm-activity-section" className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-stone-100 text-stone-800">
              <Clock className="w-5 h-5 text-stone-700" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">
                Recent Farm Activity
              </h2>
              <p className="text-xs text-stone-500">Irrigation, spray, disease diagnosis & mandi logs</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('farm-diary')}
            className="text-xs font-bold text-[#1B3B11] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Farm Diary</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${act.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                      {act.time}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">{act.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{act.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. AI QUICK QUESTION (Large Bottom Interaction Center)  */}
      {/* ========================================================= */}
      <section
        id="ai-quick-question-card"
        className="bg-gradient-to-br from-[#1B3B11] via-[#224817] to-[#16300e] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-600/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kisan AI Assistant • Powered by Gemini 3.7 Flash</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Not sure what to do?
          </h2>
          <p className="text-emerald-100/90 text-sm sm:text-base font-normal max-w-xl mx-auto">
            {language === 'hi'
              ? 'अपनी भाषा में कोई भी कृषि प्रश्न पूछें — तुरंत आवाज व चैट द्वारा वैज्ञानिक सलाह पाएं।'
              : 'Ask any farming query via text or voice. Get instant agronomic guidance, disease solutions, and market forecasts.'}
          </p>

          {/* Input Box with Voice & Send */}
          <form onSubmit={handleQuickQuestionSubmit} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 sm:p-2 shadow-2xl border-2 border-emerald-400/60 focus-within:border-emerald-300">
              <input
                id="quick-ai-input"
                type="text"
                value={quickQuestionInput}
                onChange={(e) => setQuickQuestionInput(e.target.value)}
                placeholder={language === 'hi' ? 'किसान भाई से पूछें... (उदा: क्या आज सिंचाई करें?)' : 'Ask Kisan Bhai... (e.g. Should I irrigate today?)'}
                className="w-full pl-3 pr-28 py-2.5 text-stone-900 placeholder:text-stone-400 text-sm font-medium focus:outline-none bg-transparent"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                {/* Voice button */}
                <button
                  type="button"
                  onClick={() => askAiWithPrompt('What are the key agronomy steps I must perform on my farm today?')}
                  title="Voice query"
                  className="p-2 rounded-xl text-stone-600 hover:text-[#1B3B11] hover:bg-emerald-50 transition-colors"
                >
                  <Mic className="w-4 h-4 text-emerald-700" />
                </button>

                {/* Leaf Scan button */}
                <button
                  type="button"
                  onClick={() => setCurrentView('disease-scanner')}
                  title="Upload leaf photo"
                  className="p-2 rounded-xl text-stone-600 hover:text-[#1B3B11] hover:bg-emerald-50 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                </button>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!quickQuestionInput.trim()}
                  className="p-2.5 rounded-xl bg-[#1B3B11] hover:bg-[#254d19] text-white disabled:opacity-40 transition-all shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Suggested Prompt Chips */}
          <div className="pt-2 space-y-2">
            <p className="text-xs font-semibold text-emerald-200/80 uppercase tracking-wider">
              {language === 'hi' ? 'सुझाए गए प्रश्न:' : 'Suggested Quick Inquiries:'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {suggestedPrompts.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => askAiWithPrompt(sug.query)}
                  className="text-xs font-semibold text-emerald-100 hover:text-white bg-emerald-900/60 hover:bg-emerald-800/80 px-3 py-1.5 rounded-xl border border-emerald-700/50 hover:border-emerald-400 transition-all text-left"
                >
                  💬 {sug.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
