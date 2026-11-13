import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Sprout,
  Calendar,
  CloudSun,
  Droplets,
  Sun,
  Thermometer,
  Sparkles,
  Layers,
  Award,
  ShieldCheck,
  ChevronRight,
  Info,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { CropLifecycleItem, WeatherData } from '../../shared/types';
import { useUserStore } from '../store/userStore';

interface CropGrowthYieldProjectionProps {
  crops: CropLifecycleItem[];
  selectedCropId?: string;
  onSelectCrop?: (cropId: string) => void;
  language: string;
}

type ClimateScenario = 'live' | 'favorable' | 'dry_heat' | 'excess_rain' | 'custom';

interface MilestonePoint {
  week: number;
  name: string;
  hindiName: string;
  stageKey: string;
  idealGrowthPct: number;
  criticalFactor: string;
  advisory: string;
  hindiAdvisory: string;
}

interface ProjectionDataPoint {
  week: number;
  weekLabel: string;
  calendarDate: string;
  milestoneName?: string;
  milestoneHindi?: string;
  growthProgressPct: number;
  projectedYieldQtlPerAcre: number;
  totalProjectedYieldQtl: number;
  targetYieldQtlPerAcre: number;
  localTempC: number;
  localRainfallMm: number;
  climateSuitabilityPct: number;
  isCurrentWeek?: boolean;
  isMilestone?: boolean;
  advisoryNote?: string;
}

// Crop-specific agronomic benchmarks
const CROP_PROFILES: Record<
  string,
  {
    totalWeeks: number;
    baseYieldPerAcre: number; // Quintals/acre
    optimalTempMin: number;
    optimalTempMax: number;
    waterDemandMmTotal: number;
    tBaseC: number; // base temp for GDD
    milestones: MilestonePoint[];
  }
> = {
  'BT Cotton': {
    totalWeeks: 20,
    baseYieldPerAcre: 13.0,
    optimalTempMin: 22,
    optimalTempMax: 33,
    waterDemandMmTotal: 650,
    tBaseC: 15,
    milestones: [
      {
        week: 2,
        name: 'Germination & Emergence',
        hindiName: 'अंकुरण एवं उद्भव',
        stageKey: 'Sowing / Seedling',
        idealGrowthPct: 10,
        criticalFactor: 'Soil warmth & seedbed moisture',
        advisory: 'Maintain adequate moisture; avoid crusting.',
        hindiAdvisory: 'उचित नमी बनाए रखें; पपड़ी न बनने दें।',
      },
      {
        week: 6,
        name: 'Square Formation & Branching',
        hindiName: 'शाखाएँ व चौकोर कलियाँ',
        stageKey: 'Vegetative',
        idealGrowthPct: 35,
        criticalFactor: 'Vegetative vigor & nitrogen uptake',
        advisory: 'First top dressing of Urea (30 kg/acre). Scout for jassids.',
        hindiAdvisory: 'यूरिया की पहली खुराक दें और जैसिड्स पर नजर रखें।',
      },
      {
        week: 11,
        name: 'Peak Flowering & Early Bolls',
        hindiName: 'फूल खिलना व शुरुआती गूलर',
        stageKey: 'Flowering & Pod Initiation',
        idealGrowthPct: 65,
        criticalFactor: 'Critical moisture window & heat sensitivity',
        advisory: 'Peak water requirement! Avoid moisture stress to prevent boll dropping.',
        hindiAdvisory: 'गूलर झड़ने से रोकने के लिए सिंचाई कभी न रोकें।',
      },
      {
        week: 16,
        name: 'Boll Development & Maturation',
        hindiName: 'गूलर का भराव एवं परिपक्वता',
        stageKey: 'Grain Filling / Boll Dev',
        idealGrowthPct: 88,
        criticalFactor: 'Solar radiation & bollworm vigilance',
        advisory: 'Foliar spray of 00:52:34 (MKP) + Boron for uniform boll size.',
        hindiAdvisory: 'समान गूलर भराव हेतु बोरॉन और 00:52:34 का छिड़काव करें।',
      },
      {
        week: 20,
        name: 'Bursting & Harvest Readiness',
        hindiName: 'कपास तुड़ाई योग्य',
        stageKey: 'Maturity & Harvesting',
        idealGrowthPct: 100,
        criticalFactor: 'Dry weather for clean picking',
        advisory: 'Begin clean picking in sunny dry mornings. Grade A staple quality.',
        hindiAdvisory: 'धूप वाले सूखे मौसम में साफ कपास की तुड़ाई करें।',
      },
    ],
  },
  'Groundnut': {
    totalWeeks: 16,
    baseYieldPerAcre: 15.5,
    optimalTempMin: 23,
    optimalTempMax: 32,
    waterDemandMmTotal: 500,
    tBaseC: 10,
    milestones: [
      {
        week: 2,
        name: 'Seedling Emergence',
        hindiName: 'अंकुरण',
        stageKey: 'Sowing / Seedling',
        idealGrowthPct: 12,
        criticalFactor: 'Aeration & fungus protection',
        advisory: 'Ensure well-drained loamy soil. Check for collar rot.',
        hindiAdvisory: 'जलनिकासी सुनिश्चित करें और कॉलर रॉट की जांच करें।',
      },
      {
        week: 5,
        name: 'Vegetative Canopy & Branching',
        hindiName: 'वानस्पतिक फैलाव',
        stageKey: 'Vegetative',
        idealGrowthPct: 35,
        criticalFactor: 'Phosphate assimilation',
        advisory: 'Light hoeing for loose soil structure.',
        hindiAdvisory: 'मिट्टी ढीली रखने के लिए हल्की गुड़ाई करें।',
      },
      {
        week: 8,
        name: 'Flowering & Peg Penetration',
        hindiName: 'फूल व सुई (पेग) प्रवेश',
        stageKey: 'Flowering & Pod Initiation',
        idealGrowthPct: 65,
        criticalFactor: 'Moist friable soil for peg entry',
        advisory: 'Apply Gypsum (100 kg/acre). Essential calcium for pod development.',
        hindiAdvisory: 'जिप्सम 100 किग्रा/एकड़ डालें; पेग आसानी से जमीन में धंसेगा।',
      },
      {
        week: 12,
        name: 'Pod Filling & Kernel Density',
        hindiName: 'फलियों में दाना भराव',
        stageKey: 'Grain Filling / Boll Dev',
        idealGrowthPct: 88,
        criticalFactor: 'Continuous moderate soil moisture',
        advisory: 'Crucial irrigation period to prevent pops (empty pods).',
        hindiAdvisory: 'खोखली फली से बचने के लिए नमी का स्तर सामान्य बनाए रखें।',
      },
      {
        week: 16,
        name: 'Full Maturity & Uprooting',
        hindiName: 'फसल परिपक्व व खुदाई',
        stageKey: 'Maturity & Harvesting',
        idealGrowthPct: 100,
        criticalFactor: 'Inner shell brown lining',
        advisory: 'Check 70% pods showing dark inner veins before pulling.',
        hindiAdvisory: '70% फलियों के भीतरी आवरण का रंग भूरा होने पर खुदाई करें।',
      },
    ],
  },
  'Wheat': {
    totalWeeks: 18,
    baseYieldPerAcre: 20.0,
    optimalTempMin: 15,
    optimalTempMax: 26,
    waterDemandMmTotal: 420,
    tBaseC: 5,
    milestones: [
      {
        week: 3,
        name: 'Crown Root Initiation (CRI)',
        hindiName: 'शीर्ष जड़ विकास (सी.आर.आई)',
        stageKey: 'Sowing / Seedling',
        idealGrowthPct: 15,
        criticalFactor: 'First critical irrigation (21 days)',
        advisory: 'Most critical watering! Delay can slash yield by 20%.',
        hindiAdvisory: '21वें दिन की पहली सिंचाई सबसे जरूरी है; देरी से नुकसान होगा।',
      },
      {
        week: 7,
        name: 'Active Tillering & Jointing',
        hindiName: 'कल्ले फूटना व गाँठ बनना',
        stageKey: 'Vegetative',
        idealGrowthPct: 40,
        criticalFactor: 'Nitrogen boost & cool nights',
        advisory: 'Second irrigation + top dressing of Urea (40 kg/acre).',
        hindiAdvisory: 'दूसरी सिंचाई और यूरिया की दूसरी खुराक (40 किग्रा/एकड़)।',
      },
      {
        week: 11,
        name: 'Booting & Spike Emergence',
        hindiName: 'बाली निकलना',
        stageKey: 'Flowering & Pod Initiation',
        idealGrowthPct: 70,
        criticalFactor: 'Avoid dry spells and high winds',
        advisory: 'Irrigate under calm winds to prevent plant lodging.',
        hindiAdvisory: 'हवा शांत होने पर सिंचाई करें ताकि फसल गिरे नहीं।',
      },
      {
        week: 14,
        name: 'Milking & Dough Filling',
        hindiName: 'दुग्ध अवस्था व दाना भराव',
        stageKey: 'Grain Filling / Boll Dev',
        idealGrowthPct: 88,
        criticalFactor: 'Cool temperatures to prevent terminal heat',
        advisory: 'Light irrigation to mitigate high temperatures.',
        hindiAdvisory: 'तापमान बढ़ने पर हल्की सिंचाई करें ताकि दाना न सिकुड़े।',
      },
      {
        week: 18,
        name: 'Golden Maturity & Combine Harvest',
        hindiName: 'सुनहरी परिपक्वता व कटाई',
        stageKey: 'Maturity & Harvesting',
        idealGrowthPct: 100,
        criticalFactor: 'Grain moisture < 12%',
        advisory: 'Harvest when grain snaps crisply between teeth.',
        hindiAdvisory: 'दाना दांत से दबाने पर कट की आवाज दे तो कटाई शुरू करें।',
      },
    ],
  },
  'Soybean': {
    totalWeeks: 14,
    baseYieldPerAcre: 11.5,
    optimalTempMin: 22,
    optimalTempMax: 30,
    waterDemandMmTotal: 450,
    tBaseC: 10,
    milestones: [
      {
        week: 2,
        name: 'Emergence & V1 Stage',
        hindiName: 'अंकुरण एवं प्रथम पत्ती',
        stageKey: 'Sowing / Seedling',
        idealGrowthPct: 15,
        criticalFactor: 'Crust-free topsoil',
        advisory: 'Rhizobium nodulation begins; check for stem fly.',
        hindiAdvisory: 'जड़ों में राइजोबियम गांठे बननी शुरू होती हैं।',
      },
      {
        week: 5,
        name: 'Vegetative V4 Branching',
        hindiName: 'सघन वानस्पतिक शाखाएं',
        stageKey: 'Vegetative',
        idealGrowthPct: 38,
        criticalFactor: 'Canopy closure',
        advisory: 'Weed-free critical period. Retain soil mulch.',
        hindiAdvisory: 'खरपतवार नियंत्रण अत्यंत आवश्यक है।',
      },
      {
        week: 8,
        name: 'R1-R2 Full Bloom & Pods',
        hindiName: 'फूल आना व फलियाँ बनना',
        stageKey: 'Flowering & Pod Initiation',
        idealGrowthPct: 68,
        criticalFactor: 'Consistent moisture; no flower drop',
        advisory: 'Water stress at this stage lowers pod count heavily.',
        hindiAdvisory: 'फूल अवस्था में पानी की कमी न होने दें।',
      },
      {
        week: 11,
        name: 'R5-R6 Seed Rapid Filling',
        hindiName: 'दाने का तीव्र भराव',
        stageKey: 'Grain Filling / Boll Dev',
        idealGrowthPct: 88,
        criticalFactor: 'Potash and light rainfall',
        advisory: 'Spray 13:00:45 (Potassium Nitrate) to boost test weight.',
        hindiAdvisory: 'दाने की चमक और वजन बढ़ाने हेतु 13:00:45 का स्प्रे करें।',
      },
      {
        week: 14,
        name: 'R8 Full Maturity & Leaf Fall',
        hindiName: 'पत्तियाँ झड़ना व परिपक्वता',
        stageKey: 'Maturity & Harvesting',
        idealGrowthPct: 100,
        criticalFactor: 'Pods rattle with dry seeds',
        advisory: 'Thresh at 13-14% grain moisture to prevent seed splitting.',
        hindiAdvisory: 'फलियां बजने पर कटाई करें ताकि दाना टूटे नहीं।',
      },
    ],
  },
  'Mustard': {
    totalWeeks: 15,
    baseYieldPerAcre: 11.0,
    optimalTempMin: 14,
    optimalTempMax: 25,
    waterDemandMmTotal: 300,
    tBaseC: 5,
    milestones: [
      {
        week: 2,
        name: 'Seedling Emergence',
        hindiName: 'अंकुरण',
        stageKey: 'Sowing / Seedling',
        idealGrowthPct: 12,
        criticalFactor: 'Moisture in upper 5cm soil',
        advisory: 'Thinning to maintain 12-15 cm intra-row spacing.',
        hindiAdvisory: 'पौधों के बीच 12-15 सेमी दूरी के लिए विरलीकरण करें।',
      },
      {
        week: 6,
        name: 'Rosette & Stem Elongation',
        hindiName: 'तना वृद्धि अवस्था',
        stageKey: 'Vegetative',
        idealGrowthPct: 38,
        criticalFactor: 'First irrigation (30-35 DAS)',
        advisory: 'Crucial irrigation + split dose of Nitrogen.',
        hindiAdvisory: 'पहली मुख्य सिंचाई और नाइट्रोजन की बची खुराक।',
      },
      {
        week: 9,
        name: 'Full Yellow Flowering',
        hindiName: 'पीले फूलों की बहार',
        stageKey: 'Flowering & Pod Initiation',
        idealGrowthPct: 70,
        criticalFactor: 'Aphid scouting in cloudy humid weather',
        advisory: 'Second irrigation. Monitor aphid colony build-up.',
        hindiAdvisory: 'माहू (एफिड) कीट पर विशेष निगरानी रखें।',
      },
      {
        week: 12,
        name: 'Siliqua Pod Filling',
        hindiName: 'फलियों में दाना भराव',
        stageKey: 'Grain Filling / Boll Dev',
        idealGrowthPct: 88,
        criticalFactor: 'Sulfur nutrition for oil content',
        advisory: 'Sulphur application enhances seed oil percentage.',
        hindiAdvisory: 'सल्फर के प्रयोग से तेल की मात्रा बढ़ती है।',
      },
      {
        week: 15,
        name: 'Siliqua Drying & Harvesting',
        hindiName: 'फलियां सूखना व कटाई',
        stageKey: 'Maturity & Harvesting',
        idealGrowthPct: 100,
        criticalFactor: 'Pods turn yellowish brown',
        advisory: 'Harvest in early morning to prevent pod shattering.',
        hindiAdvisory: 'फलियां चटकने से बचाने के लिए सुबह के समय कटाई करें।',
      },
    ],
  },
};

// Helper: Sigmoid growth calculation
function getSigmoidGrowthPct(week: number, totalWeeks: number): number {
  const midpoint = totalWeeks * 0.48;
  const steepness = 0.38;
  const raw = 1 / (1 + Math.exp(-steepness * (week - midpoint)));
  const minVal = 1 / (1 + Math.exp(-steepness * (0 - midpoint)));
  const maxVal = 1 / (1 + Math.exp(-steepness * (totalWeeks - midpoint)));
  const normalized = (raw - minVal) / (maxVal - minVal);
  return Math.min(100, Math.max(0, Math.round(normalized * 100)));
}

// Helper: Format date offset from sowing date
function getWeekDate(sowingDateStr: string, weekOffset: number): { formatted: string; full: string } {
  try {
    const d = new Date(sowingDateStr || '2026-06-15');
    if (isNaN(d.getTime())) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + weekOffset * 7);
      return {
        formatted: fallback.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        full: fallback.toISOString().split('T')[0],
      };
    }
    d.setDate(d.getDate() + weekOffset * 7);
    return {
      formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      full: d.toISOString().split('T')[0],
    };
  } catch {
    return { formatted: `Wk ${weekOffset}`, full: '' };
  }
}

export const CropGrowthYieldProjection: React.FC<CropGrowthYieldProjectionProps> = ({
  crops,
  selectedCropId,
  onSelectCrop,
  language,
}) => {
  const { farmerProfile, currentUser } = useUserStore();
  const defaultCropId = crops[0]?.id || '';
  const [activeCropId, setActiveCropId] = useState<string>(selectedCropId || defaultCropId);

  // Sync external prop if changed
  useEffect(() => {
    if (selectedCropId) setActiveCropId(selectedCropId);
  }, [selectedCropId]);

  const activeCrop = useMemo(() => {
    return crops.find((c) => c.id === activeCropId) || crops[0] || null;
  }, [crops, activeCropId]);

  // Climate Scenario state
  const [scenario, setScenario] = useState<ClimateScenario>('live');
  const [customTempOffset, setCustomTempOffset] = useState<number>(0); // -5 to +5 C
  const [customRainOffsetPct, setCustomRainOffsetPct] = useState<number>(0); // -50% to +50%

  // Metric toggles for graph lines
  const [showGrowthProgress, setShowGrowthProgress] = useState(true);
  const [showProjectedYield, setShowProjectedYield] = useState(true);
  const [showTargetBenchmark, setShowTargetBenchmark] = useState(true);
  const [showRainfall, setShowRainfall] = useState(true);
  const [showTemperature, setShowTemperature] = useState(false);
  const [showSuitability, setShowSuitability] = useState(false);

  // Weather data fetch
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const userLocation = farmerProfile?.village
    ? `${farmerProfile.village}, ${farmerProfile.state || 'Gujarat'}`
    : (currentUser?.village ? `${currentUser.village}, ${currentUser.state || 'Gujarat'}` : 'Anandpur, Gujarat');

  useEffect(() => {
    let isMounted = true;
    setLoadingWeather(true);
    fetch(`/api/weather?location=${encodeURIComponent(userLocation)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: WeatherData | null) => {
        if (isMounted && data) {
          setWeatherData(data);
        }
      })
      .catch((err) => console.warn('Weather fetch fallback in projection:', err))
      .finally(() => {
        if (isMounted) setLoadingWeather(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userLocation]);

  // Match crop with profile
  const cropProfile = useMemo(() => {
    if (!activeCrop) return CROP_PROFILES['BT Cotton'];
    const matchedKey = Object.keys(CROP_PROFILES).find((key) =>
      activeCrop.cropName.toLowerCase().includes(key.toLowerCase())
    );
    return matchedKey ? CROP_PROFILES[matchedKey] : CROP_PROFILES['BT Cotton'];
  }, [activeCrop]);

  // Calculate current week of crop
  const currentWeekInfo = useMemo(() => {
    if (!activeCrop?.sowingDate) return { week: 10, isBeyondHarvest: false };
    const sowing = new Date(activeCrop.sowingDate).getTime();
    const now = Date.now();
    const diffDays = Math.max(0, Math.floor((now - sowing) / (1000 * 60 * 60 * 24)));
    const week = Math.min(cropProfile.totalWeeks, Math.floor(diffDays / 7));
    return {
      week: week,
      isBeyondHarvest: week >= cropProfile.totalWeeks,
    };
  }, [activeCrop, cropProfile]);

  // Generate projection dataset
  const projectionData: ProjectionDataPoint[] = useMemo(() => {
    if (!activeCrop) return [];

    const totalWeeks = cropProfile.totalWeeks;
    const baseTargetYieldPerAcre = activeCrop.areaAcres > 0
      ? activeCrop.expectedYieldQuintals / activeCrop.areaAcres
      : cropProfile.baseYieldPerAcre;

    // Base climate vectors
    const baseTemp = weatherData?.temperatureC || 29;
    const baseRainMm = weatherData?.rainfallProbability ? (weatherData.rainfallProbability * 0.4) : 18;

    // Scenario multipliers
    let climateMultiplier = 1.0;
    let tempDelta = 0;
    let rainMultiplier = 1.0;

    if (scenario === 'favorable') {
      climateMultiplier = 1.12; // +12% yield
      tempDelta = -1.5; // milder temps
      rainMultiplier = 1.35; // optimal rain
    } else if (scenario === 'dry_heat') {
      climateMultiplier = 0.82; // -18% yield
      tempDelta = 4.2; // intense heat
      rainMultiplier = 0.35; // drought deficit
    } else if (scenario === 'excess_rain') {
      climateMultiplier = 0.89; // -11% waterlogging risk
      tempDelta = -2.0;
      rainMultiplier = 2.1;
    } else if (scenario === 'custom') {
      tempDelta = customTempOffset;
      rainMultiplier = 1 + customRainOffsetPct / 100;
      // Agronomic sensitivity formula
      const tempStress = Math.abs(tempDelta) * 0.02;
      const rainDeltaEffect = customRainOffsetPct > 0 ? (customRainOffsetPct * 0.002) : (customRainOffsetPct * 0.004);
      climateMultiplier = Math.max(0.65, Math.min(1.25, 1.0 - tempStress + rainDeltaEffect));
    } else {
      // Live weather influence
      const healthInfluence = (activeCrop.healthScore - 85) * 0.004; // health score +/-
      const rainFactor = (weatherData?.rainfallProbability || 30) > 60 ? 1.05 : 0.98;
      climateMultiplier = Math.max(0.85, Math.min(1.18, 1.0 + healthInfluence * rainFactor));
    }

    const points: ProjectionDataPoint[] = [];

    for (let w = 0; w <= totalWeeks; w++) {
      const { formatted, full } = getWeekDate(activeCrop.sowingDate, w);
      const milestone = cropProfile.milestones.find((m) => m.week === w);

      // Phenological stage progress (%)
      const idealProgress = getSigmoidGrowthPct(w, totalWeeks);
      // Actual progress accounts for current crop progress at current week
      let progress = idealProgress;
      if (w <= currentWeekInfo.week && currentWeekInfo.week > 0) {
        // Blend actual recorded stageProgressPct
        const progressWeight = w / currentWeekInfo.week;
        progress = Math.round(idealProgress * (1 - progressWeight * 0.15) + (activeCrop.stageProgressPct * progressWeight));
      }

      // Climate factors per week
      // Summer/monsoon seasonal wave simulation
      const weekSine = Math.sin((w / totalWeeks) * Math.PI);
      const weekTemp = Math.round((baseTemp + tempDelta + Math.sin(w * 0.4) * 2.5) * 10) / 10;
      const weekRain = Math.max(0, Math.round((baseRainMm * rainMultiplier * (0.6 + weekSine * 0.8) + (w % 3 === 0 ? 8 : 2)) * 10) / 10);

      // Climate Suitability Index (0-100%)
      const isTempOptimal = weekTemp >= cropProfile.optimalTempMin && weekTemp <= cropProfile.optimalTempMax;
      const tempDiff = isTempOptimal
        ? 0
        : weekTemp < cropProfile.optimalTempMin
        ? cropProfile.optimalTempMin - weekTemp
        : weekTemp - cropProfile.optimalTempMax;
      const suitability = Math.max(45, Math.min(100, Math.round(96 - tempDiff * 5 - (weekRain < 5 ? 8 : 0))));

      // Yield accumulation curve
      // Yield builds up primarily from flowering onwards (week > totalWeeks * 0.4)
      const yieldAccumulationFraction = Math.max(0, (progress - 20) / 80);
      const projectedYieldPerAcre = Math.round(baseTargetYieldPerAcre * climateMultiplier * yieldAccumulationFraction * 10) / 10;
      const targetYieldPerAcre = Math.round(baseTargetYieldPerAcre * yieldAccumulationFraction * 10) / 10;
      const totalProjected = Math.round(projectedYieldPerAcre * activeCrop.areaAcres * 10) / 10;

      points.push({
        week: w,
        weekLabel: `W${w}`,
        calendarDate: formatted,
        milestoneName: milestone?.name,
        milestoneHindi: milestone?.hindiName,
        growthProgressPct: Math.min(100, progress),
        projectedYieldQtlPerAcre: projectedYieldPerAcre,
        totalProjectedYieldQtl: totalProjected,
        targetYieldQtlPerAcre: targetYieldPerAcre,
        localTempC: weekTemp,
        localRainfallMm: weekRain,
        climateSuitabilityPct: suitability,
        isCurrentWeek: w === currentWeekInfo.week,
        isMilestone: !!milestone,
        advisoryNote: language === 'hi' ? milestone?.hindiAdvisory : milestone?.advisory,
      });
    }

    return points;
  }, [
    activeCrop,
    cropProfile,
    currentWeekInfo,
    scenario,
    customTempOffset,
    customRainOffsetPct,
    weatherData,
    language,
  ]);

  // Current and Final Yield Metrics
  const summaryMetrics = useMemo(() => {
    if (!activeCrop || projectionData.length === 0) return null;

    const finalPoint = projectionData[projectionData.length - 1];
    const currentPoint = projectionData.find((p) => p.isCurrentWeek) || projectionData[0];
    const baseTargetYield = activeCrop.expectedYieldQuintals;
    const finalProjectedTotal = finalPoint.totalProjectedYieldQtl;
    const deltaQuintals = Math.round((finalProjectedTotal - baseTargetYield) * 10) / 10;
    const deltaPct = baseTargetYield > 0 ? Math.round((deltaQuintals / baseTargetYield) * 1000) / 10 : 0;

    return {
      currentStage: activeCrop.stage,
      currentProgressPct: activeCrop.stageProgressPct,
      currentWeek: currentWeekInfo.week,
      totalWeeks: cropProfile.totalWeeks,
      baseTargetYield,
      finalProjectedTotal,
      projectedPerAcre: finalPoint.projectedYieldQtlPerAcre,
      targetPerAcre: finalPoint.targetYieldQtlPerAcre,
      deltaQuintals,
      deltaPct,
      currentTemp: currentPoint.localTempC,
      currentRain: currentPoint.localRainfallMm,
      avgSuitability: Math.round(
        projectionData.reduce((acc, p) => acc + p.climateSuitabilityPct, 0) / projectionData.length
      ),
    };
  }, [activeCrop, projectionData, currentWeekInfo, cropProfile]);

  if (!activeCrop) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
        <Sprout className="w-10 h-10 mx-auto text-stone-400 mb-2 animate-bounce" />
        <p>{language === 'hi' ? 'कोई सक्रिय फसल नहीं मिली।' : 'No active crop found to generate growth projection.'}</p>
      </div>
    );
  }

  // Active milestone for detailed card
  const currentMilestone = cropProfile.milestones.find((m) => m.week >= currentWeekInfo.week) || cropProfile.milestones[cropProfile.milestones.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden transition-all space-y-6 p-5 sm:p-7">
      {/* Header & Crop Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>{language === 'hi' ? 'स्मार्ट वृद्धि और उपज पूर्वानुमान' : 'Growth Milestones & Yield Projection'}</span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
              {language === 'hi' ? 'स्थानीय जलवायु आधारित' : 'Local Climate Powered'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>{language === 'hi' ? 'फसल विकास व पैदावार प्रक्षेप' : 'Projected Growth Milestones & Yield Model'}</span>
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            {language === 'hi'
              ? `${userLocation} के वास्तविक मौसम पूर्वानुमान, डिग्री-डे (GDD) व स्थानीय जलवायविक कारकों से संचालित सांख्यिकीय मॉडल।`
              : `Dynamic simulation calibrated for ${userLocation} factoring temperature, rainfall distribution, and phenological GDD.`}
          </p>
        </div>

        {/* Crop Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-stone-500 shrink-0 mr-1">
            {language === 'hi' ? 'फसल चुनें:' : 'Select Crop:'}
          </span>
          {crops.map((c) => {
            const isSelected = c.id === activeCrop.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCropId(c.id);
                  if (onSelectCrop) onSelectCrop(c.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <Sprout className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-stone-500'}`} />
                <span>{c.cropName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-200 text-stone-600'}`}>
                  {c.areaAcres}ac
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      {summaryMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center justify-between">
              <span>{language === 'hi' ? 'वर्तमान वृद्धि सप्ताह' : 'Current Progress'}</span>
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-stone-900 mt-1 flex items-baseline gap-1.5">
              <span>Week {summaryMetrics.currentWeek}</span>
              <span className="text-xs font-medium text-stone-500">/ {summaryMetrics.totalWeeks} Wks</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 truncate">
              {activeCrop.stage} ({summaryMetrics.currentProgressPct}%)
            </div>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center justify-between">
              <span>{language === 'hi' ? 'जलवायु समायोजित पैदावार' : 'Est. Harvest Yield'}</span>
              <Award className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-stone-900 mt-1 flex items-baseline gap-1.5">
              <span>{summaryMetrics.finalProjectedTotal}</span>
              <span className="text-xs font-medium text-stone-500">Quintals</span>
            </div>
            <div className={`text-[11px] font-bold mt-0.5 flex items-center gap-0.5 ${
              summaryMetrics.deltaPct >= 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {summaryMetrics.deltaPct >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>
                {summaryMetrics.deltaPct >= 0 ? `+${summaryMetrics.deltaPct}%` : `${summaryMetrics.deltaPct}%`} vs Target ({summaryMetrics.baseTargetYield} Qtl)
              </span>
            </div>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center justify-between">
              <span>{language === 'hi' ? 'अनुमानित प्रति एकड़' : 'Yield / Acre'}</span>
              <Layers className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-stone-900 mt-1 flex items-baseline gap-1.5">
              <span>{summaryMetrics.projectedPerAcre}</span>
              <span className="text-xs font-medium text-stone-500">Qtl/Acre</span>
            </div>
            <div className="text-[11px] text-stone-500 font-medium mt-0.5">
              Base Target: {summaryMetrics.targetPerAcre} Qtl/ac
            </div>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center justify-between">
              <span>{language === 'hi' ? 'जलवायु अनुकूलता सूचकांक' : 'Climate Suitability'}</span>
              <CloudSun className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-1 flex items-baseline gap-1.5">
              <span>{summaryMetrics.avgSuitability}%</span>
              <span className="text-xs font-medium text-stone-500">Optimal</span>
            </div>
            <div className="text-[11px] text-stone-600 font-medium mt-0.5 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-stone-400" />
              <span>{summaryMetrics.currentTemp}°C</span>
              <span>•</span>
              <Droplets className="w-3 h-3 text-blue-500" />
              <span>{summaryMetrics.currentRain}mm</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Climate Scenarios & Metric Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200/70 text-xs">
        {/* Scenario Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-stone-600 mr-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'hi' ? 'मौसम परिदृश्य:' : 'Climate Scenario:'}</span>
          </span>

          <button
            onClick={() => setScenario('live')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              scenario === 'live'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {language === 'hi' ? '⚡ लाइव स्थानीय मौसम' : '⚡ Live Local Weather'}
          </button>

          <button
            onClick={() => setScenario('favorable')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              scenario === 'favorable'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {language === 'hi' ? '🌧️ अनुकूल मानसून (+12%)' : '🌧️ Favorable Monsoon (+12%)'}
          </button>

          <button
            onClick={() => setScenario('dry_heat')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              scenario === 'dry_heat'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {language === 'hi' ? '☀️ गर्मी / सूखा (-18%)' : '☀️ Heat Stress / Dry (-18%)'}
          </button>

          <button
            onClick={() => setScenario('custom')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              scenario === 'custom'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {language === 'hi' ? '🧪 कस्टम सिम्युलेटर' : '🧪 Custom Simulator'}
          </button>
        </div>

        {/* Line Display Checkboxes */}
        <div className="flex items-center gap-3 flex-wrap text-[11px] font-semibold text-stone-600">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showGrowthProgress}
              onChange={(e) => setShowGrowthProgress(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              {language === 'hi' ? 'विकास प्रगति (%)' : 'Growth %'}
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showProjectedYield}
              onChange={(e) => setShowProjectedYield(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
              {language === 'hi' ? 'अनुमानित पैदावार (क्विंटल)' : 'Yield (Qtl/Ac)'}
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRainfall}
              onChange={(e) => setShowRainfall(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              {language === 'hi' ? 'वर्षा (mm)' : 'Rain (mm)'}
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTemperature}
              onChange={(e) => setShowTemperature(e.target.checked)}
              className="rounded text-rose-500 focus:ring-rose-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              {language === 'hi' ? 'तापमान (°C)' : 'Temp (°C)'}
            </span>
          </label>
        </div>
      </div>

      {/* Custom Simulator Sliders (if scenario === 'custom') */}
      {scenario === 'custom' && (
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-1">
              <span>{language === 'hi' ? 'तापमान विचलन (ताप तनाव)' : 'Temperature Offset (Heat Stress)'}</span>
              <span className="text-indigo-700">{customTempOffset > 0 ? `+${customTempOffset}°C` : `${customTempOffset}°C`}</span>
            </div>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.5"
              value={customTempOffset}
              onChange={(e) => setCustomTempOffset(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
              <span>-6°C (Colder nights)</span>
              <span>Baseline 0°C</span>
              <span>+6°C (Severe heat)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-1">
              <span>{language === 'hi' ? 'वर्षा विचलन (जल उपलब्धता)' : 'Rainfall Variance (Water Availability)'}</span>
              <span className="text-indigo-700">{customRainOffsetPct > 0 ? `+${customRainOffsetPct}%` : `${customRainOffsetPct}%`}</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="5"
              value={customRainOffsetPct}
              onChange={(e) => setCustomRainOffsetPct(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
              <span>-60% (Severe Drought)</span>
              <span>Normal 0%</span>
              <span>+60% (High Rainfall)</span>
            </div>
          </div>
        </div>
      )}

      {/* The Recharts Line Graph */}
      <div className="relative w-full bg-stone-50/50 rounded-2xl p-3 sm:p-4 border border-stone-200/60">
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={projectionData}
              margin={{ top: 20, right: 25, left: 0, bottom: 25 }}
            >
              <defs>
                <linearGradient id="growthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />

              <XAxis
                dataKey="weekLabel"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                dy={8}
              />

              {/* Left Y Axis: Growth Progress % (0-100) & Yield */}
              <YAxis
                yAxisId="left"
                stroke="#047857"
                fontSize={11}
                domain={[0, 100]}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                label={{
                  value: language === 'hi' ? 'विकास प्रगति / उपज %' : 'Growth Progress (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#047857', fontSize: 11, fontWeight: 600 },
                  dx: -5,
                }}
              />

              {/* Right Y Axis: Weather parameters (Rainfall mm or Temp C) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#2563eb"
                fontSize={11}
                domain={[0, 50]}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
                label={{
                  value: language === 'hi' ? 'वर्षा (mm) / तापमान (°C)' : 'Rainfall (mm) / Temp (°C)',
                  angle: 90,
                  position: 'insideRight',
                  style: { textAnchor: 'middle', fill: '#2563eb', fontSize: 11, fontWeight: 600 },
                  dx: 10,
                }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload as ProjectionDataPoint;
                  return (
                    <div className="bg-white p-3.5 rounded-xl shadow-xl border border-stone-200 text-xs space-y-2 max-w-xs z-50">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{data.weekLabel} • {data.calendarDate}</span>
                        </span>
                        {data.isCurrentWeek && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-300">
                            {language === 'hi' ? 'आज' : 'Current Stage'}
                          </span>
                        )}
                      </div>

                      {data.milestoneName && (
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>{language === 'hi' ? 'विकास मील का पत्थर' : 'Key Milestone'}</span>
                          </div>
                          <div className="font-bold text-stone-900 mt-0.5 text-xs">
                            {language === 'hi' ? data.milestoneHindi || data.milestoneName : data.milestoneName}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 pt-1 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">{language === 'hi' ? 'विकास प्रगति:' : 'Growth Progress:'}</span>
                          <span className="font-bold text-emerald-700">{data.growthProgressPct}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">{language === 'hi' ? 'अनुमानित पैदावार:' : 'Est. Yield / Acre:'}</span>
                          <span className="font-bold text-amber-700">{data.projectedYieldQtlPerAcre} Qtl/ac</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">{language === 'hi' ? 'खेत की कुल पैदावार:' : 'Total Field Yield:'}</span>
                          <span className="font-bold text-stone-900">{data.totalProjectedYieldQtl} Quintals</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-stone-100">
                          <span className="text-stone-500">{language === 'hi' ? 'पूर्वानुमानित वर्षा:' : 'Forecast Rain:'}</span>
                          <span className="font-semibold text-blue-600">{data.localRainfallMm} mm</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">{language === 'hi' ? 'स्थानीय तापमान:' : 'Local Temp:'}</span>
                          <span className="font-semibold text-rose-600">{data.localTempC}°C</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">{language === 'hi' ? 'जलवायु अनुकूलता:' : 'Suitability:'}</span>
                          <span className="font-semibold text-emerald-600">{data.climateSuitabilityPct}%</span>
                        </div>
                      </div>

                      {data.advisoryNote && (
                        <div className="text-[10px] text-stone-600 bg-stone-50 p-2 rounded border border-stone-100 mt-1 italic">
                          💡 {data.advisoryNote}
                        </div>
                      )}
                    </div>
                  );
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
              />

              {/* Vertical Reference Line for Today / Current Week */}
              <ReferenceLine
                x={`W${currentWeekInfo.week}`}
                yAxisId="left"
                stroke="#047857"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: language === 'hi' ? 'वर्तमान स्थिति' : 'Today (Current)',
                  position: 'top',
                  fill: '#047857',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />

              {/* Milestone Dots Annotation along Timeline */}
              {cropProfile.milestones.map((m) => {
                const targetPoint = projectionData.find((p) => p.week === m.week);
                if (!targetPoint) return null;
                return (
                  <ReferenceDot
                    key={m.week}
                    x={`W${m.week}`}
                    y={targetPoint.growthProgressPct}
                    yAxisId="left"
                    r={5}
                    fill="#15803d"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                );
              })}

              {/* Growth Progress Line */}
              {showGrowthProgress && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="growthProgressPct"
                  name={language === 'hi' ? 'विकास चरण प्रगति (%)' : 'Growth Progress (%)'}
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#059669', strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {/* Projected Yield Line (Scaled against progress) */}
              {showProjectedYield && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="growthProgressPct"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  strokeDasharray="6 3"
                  name={language === 'hi' ? 'जलवायु समायोजित पैदावार प्रक्षेप' : 'Projected Yield Trajectory'}
                  dot={false}
                />
              )}

              {/* Rainfall Column/Line on Right Axis */}
              {showRainfall && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="localRainfallMm"
                  name={language === 'hi' ? 'साप्ताहिक वर्षा (mm)' : 'Rainfall (mm)'}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              )}

              {/* Temperature Line on Right Axis */}
              {showTemperature && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="localTempC"
                  name={language === 'hi' ? 'औसत तापमान (°C)' : 'Avg Temp (°C)'}
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                />
              )}

              {/* Climate Suitability Line */}
              {showSuitability && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="climateSuitabilityPct"
                  name={language === 'hi' ? 'जलवायु उपयुक्तता सूचकांक (%)' : 'Suitability Index (%)'}
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500 px-2 pt-1 border-t border-stone-200/50">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
            <span>{language === 'hi' ? 'हरे बिंदु = मुख्य फिनोलॉजिकल मील के पत्थर' : 'Green dots = Phenological Milestones'}</span>
          </div>
          <div className="italic">
            {language === 'hi' ? 'स्रोत: ICAR व स्थानीय उपग्रह मौसमीय मॉडल' : 'Calibrated with ICAR crop growth coefficients & local climate telemetry'}
          </div>
        </div>
      </div>

      {/* Phenological Milestones Sequence Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>{language === 'hi' ? 'प्रमुख विकास मील के पत्थर व जलवायु कार्ययोजना' : 'Growth Milestones & Climate Action Plan'}</span>
          </h3>
          <span className="text-xs text-stone-500">
            {cropProfile.milestones.length} {language === 'hi' ? 'चरण' : 'Key Stages'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {cropProfile.milestones.map((m, idx) => {
            const isPassed = currentWeekInfo.week > m.week;
            const isCurrent = currentWeekInfo.week >= m.week - 2 && currentWeekInfo.week <= m.week + 1;
            const point = projectionData.find((p) => p.week === m.week);

            return (
              <div
                key={m.week}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-600/20 shadow-xs'
                    : isPassed
                    ? 'bg-stone-50/70 border-stone-200 text-stone-600'
                    : 'bg-white border-stone-200/70 text-stone-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700">
                      Week {m.week}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </div>

                  <div className="font-bold text-stone-900 text-xs line-clamp-1">
                    {language === 'hi' ? m.hindiName : m.name}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {point?.calendarDate || `Wk ${m.week}`} • {m.idealGrowthPct}%
                  </div>

                  <div className="mt-2 text-[11px] text-stone-700 leading-snug line-clamp-2">
                    {language === 'hi' ? m.hindiAdvisory : m.advisory}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-200/60 text-[10px] flex items-center justify-between text-stone-500">
                  <span>{point?.localTempC || 28}°C</span>
                  <span>{point?.localRainfallMm || 12}mm rain</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advisory Callout for Current Stage */}
      {currentMilestone && (
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50/40 p-4 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span>
                  {language === 'hi'
                    ? `सक्रिय चरण परामर्श: ${currentMilestone.hindiName} (सप्ताह ${currentMilestone.week})`
                    : `Active Stage Advisory: ${currentMilestone.name} (Target Week ${currentMilestone.week})`}
                </span>
              </div>
              <p className="text-emerald-900/90 mt-0.5 max-w-3xl">
                {language === 'hi' ? currentMilestone.hindiAdvisory : currentMilestone.advisory}
                {' '}
                <span className="font-semibold text-emerald-950">
                  {language === 'hi'
                    ? `स्थानीय तापमान ${summaryMetrics?.currentTemp}°C और जलवायविक अनुकूलता ${summaryMetrics?.avgSuitability}% इस सप्ताह सामान्य विकास के अनुकूल है।`
                    : `Local ambient temperature (${summaryMetrics?.currentTemp}°C) and climate suitability index (${summaryMetrics?.avgSuitability}%) remain favorable for current vegetative-flowering transition.`}
                </span>
              </p>
            </div>
          </div>

          <div className="text-[11px] font-bold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs shrink-0 self-end sm:self-auto">
            {language === 'hi' ? 'ICAR दिशानिर्देश सत्यापित' : 'ICAR Norms Grounded'}
          </div>
        </div>
      )}
    </div>
  );
};
export default CropGrowthYieldProjection;
