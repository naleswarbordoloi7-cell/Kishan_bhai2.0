/**
 * Shared Type Definitions for Kishan Bhai Platform
 */

export type UserRole = 'FARMER' | 'CHAMPION' | 'BUYER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  village: string;
  state: string;
  verified: boolean;
  farmSizeAcres?: number;
  crops?: string[];
  preferredLanguage?: 'en' | 'hi';
  walletAddress?: string;
  createdAt: string;
}

export interface VirtualCluster {
  id: string;
  name: string;
  village: string;
  state: string;
  championId: string;
  championName: string;
  description: string;
  totalAcres: number;
  memberCount: number;
  primaryCrops: string[];
  collectiveHarvestKg: number;
  bulkSavingsPercent: number;
  members: {
    id: string;
    farmerName: string;
    acres: number;
    crops: string[];
    village: string;
    joinedAt: string;
  }[];
  createdAt: string;
}

export interface BulkOrderRequirement {
  id: string;
  clusterId: string;
  clusterName: string;
  category: 'Fertilizer' | 'Seeds' | 'Pesticide' | 'Bio-Nutrients' | 'Mulch Sheets';
  itemName: string;
  targetQuantity: number;
  currentQuantity: number;
  unit: 'Bags (50kg)' | 'Quintals' | 'Kilograms' | 'Litres' | 'Rolls';
  standardRetailPrice: number; // in INR
  negotiatedBulkPrice: number; // in INR
  savingsPercentage: number;
  deadlineDate: string;
  status: 'AGGREGATING' | 'ORDER_PLACED' | 'SHIPPED' | 'DISTRIBUTED';
  farmerPledges: {
    farmerId: string;
    farmerName: string;
    quantity: number;
    pledgedAt: string;
  }[];
}

export interface MachineryItem {
  id: string;
  name: string;
  type: 'Tractor' | 'Harvester' | 'Rotavator' | 'Laser Leveler' | 'Solar Drone Sprayer' | 'Seeder';
  category?: string;
  village?: string;
  operatorIncluded?: boolean;
  modelYear: string;
  hpOrCapacity: string;
  hourlyRateInr: number;
  available: boolean;
  currentLocationVillage: string;
  ownerContact: string;
  description: string;
  isDemoPrototype: boolean;
  upcomingBookings: {
    bookingId: string;
    farmerName: string;
    village: string;
    date: string;
    hours: number;
    status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
}

export interface HarvestPoolLot {
  id: string;
  clusterId: string;
  clusterName: string;
  farmerId: string;
  farmerName: string;
  village: string;
  crop: string;
  variety: string;
  quantityKg: number;
  qualityGrade: 'A+ Export' | 'Grade A Premium' | 'Grade B Standard' | 'Organic Certified';
  expectedHarvestDate: string;
  minimumTargetPricePerKg: number; // in INR
  status: 'AVAILABLE' | 'COMMITTED_TO_BUYER' | 'HARVESTED_SOLD';
  moisturePercentage?: number;
  notes?: string;
}

export interface BuyerPurchaseRequest {
  id: string;
  harvestLotId: string;
  crop: string;
  quantityKg: number;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  offeredPricePerKg: number;
  totalOfferedInr: number;
  deliveryLocation: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  requestedAt: string;
  clusterName: string;
  farmerName: string;
}

export interface X402PaymentRequirement {
  status: 402;
  message: string;
  x402Version: number;
  serviceId: 'crop-analysis' | 'farm-intelligence' | 'weather-intelligence';
  serviceName: string;
  priceUsdc: number;
  priceMicroUsdc: number;
  assetId: number; // 0 for Algo or 10458941 for Testnet USDC
  network: 'algorand:testnet' | 'algorand-testnet';
  receiverAddress: string;
  facilitatorUrl: string;
  facilitatorName: 'GoPlausible';
  currency: 'USDC';
  description: string;
  expiresAt: number;
}

export interface X402PaymentProof {
  txId: string;
  senderAddress: string;
  receiverAddress: string;
  amountUsdc: number;
  assetId: number;
  network: string;
  timestamp: number;
  signature?: string;
  facilitatorVerified?: boolean;
}

export interface TransactionRecord {
  id: string;
  serviceId: string;
  serviceName: string;
  amountUsdc: number;
  asset: 'USDC' | 'ALGO';
  network: 'Algorand Testnet';
  status: 'PENDING' | 'VERIFIED' | 'SETTLED' | 'FAILED';
  txId: string;
  senderAddress: string;
  receiverAddress: string;
  timestamp: string;
  facilitator: string;
  explorerUrl: string;
  executionTimeMs?: number;
  isRealBlockchainTx: boolean;
}

export interface WeatherRiskBreakdown {
  rainRisk: number; // 0-100
  heatRisk: number; // 0-100
  windRisk: number; // 0-100
  diseaseRisk: number; // 0-100
  overallScore: number; // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  summary: string;
}

export interface WeatherFarmingAction {
  id: string;
  type: 'RAIN' | 'HEAT' | 'WIND' | 'HUMIDITY' | 'TEMPERATURE' | 'GENERAL';
  title: string;
  conditionDescription: string;
  recommendedAction: string;
  actionCategory: 'IRRIGATION' | 'PEST_DISEASE' | 'SPRAY' | 'FIELD_OPS' | 'GENERAL';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string;
}

export interface WeatherAlertItem {
  id: string;
  type: 'HEAVY_RAIN' | 'HEAT_WAVE' | 'STRONG_WIND' | 'HIGH_HUMIDITY' | 'COLD_WAVE';
  icon: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  whatIsHappening: string;
  whenItMayHappen: string;
  whatFarmerShouldDo: string;
  issuedAt: string;
}

export interface DailyForecastItem {
  day: string;
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  rainChance: number;
  humidity: number;
  windKmh: number;
  advisory: string;
  icon: string;
}

export interface WeatherData {
  location: string;
  temperatureC: number;
  feelsLikeC?: number;
  condition: string;
  humidity: number;
  windSpeedKmh: number;
  windDirection?: string;
  rainfallProbability: number;
  cloudConditions?: string;
  sunrise?: string;
  sunset?: string;
  uvIndex?: number;
  pressureHpa?: number;
  forecast: DailyForecastItem[];
  farmingAdvisory: string;
  farmingActions?: WeatherFarmingAction[];
  riskScore?: WeatherRiskBreakdown;
  alerts?: WeatherAlertItem[];
  cached: boolean;
  isDemo?: boolean;
  lastUpdated: string;
}

export interface ApiBudgetStats {
  monthlyLimitInr: number;
  currentUsageInr: number;
  remainingBudgetInr: number;
  totalApiRequests: number;
  cachedRequestsSaved: number;
  modelInUse: string;
  breakdown: {
    geminiAiInr: number;
    weatherApiInr: number;
    algorandNodeInr: number;
  };
}

export interface FarmingActionCard {
  title: string;
  crop: string;
  currentMoisture?: number;
  recommendedTime?: string;
  reason: string;
  actionType: 'IRRIGATION' | 'DISEASE_SPRAY' | 'FERTILIZER' | 'MARKET_SELL' | 'GENERAL';
  badge?: string;
  actionLabel?: string;
  actionView?: string;
}

export interface DiseaseAnalysisResult {
  possibleDisease: string;
  cropName: string;
  confidence: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  symptoms: string;
  recommendedAction: string;
  prevention: string;
  disclaimer: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  imageUrl?: string;
  imageBase64?: string;
  modelUsed?: string;
  language?: string;
  detectedLanguage?: string;
  farmingActionCard?: FarmingActionCard;
  actionCard?: FarmingActionCard;
  diseaseAnalysis?: DiseaseAnalysisResult;
  sources?: string[];
  feedback?: 'like' | 'dislike';
  isStreaming?: boolean;
  executedAction?: {
    actionType: string;
    actionTitle: string;
    summary: string;
    modifiedData: any;
    targetView?: string;
  };
  toolCall?: {
    toolName: 'crop_analysis' | 'farm_intelligence' | 'weather_intelligence' | 'general_guidance' | 'app_modifier';
    status: 'needs_payment' | 'paying' | 'paid' | 'executed';
    paymentRequirement?: X402PaymentRequirement;
    resultData?: any;
    txId?: string;
  };
}

export interface AIConversationSession {
  id: string;
  title: string;
  preview?: string;
  lastUpdated?: string;
  updatedAt?: string;
  createdAt?: string;
  farmerId?: string;
  crop?: string;
  cropContext?: string;
  language?: string;
  messagesCount?: number;
  messages: AIChatMessage[];
}

// 1. My Crops Module
export interface CropLifecycleItem {
  id: string;
  cropName: string;
  hindiName: string;
  variety: string;
  sowingDate: string;
  areaAcres: number;
  stage: 'Sowing / Seedling' | 'Vegetative' | 'Flowering & Pod Initiation' | 'Grain Filling / Boll Dev' | 'Maturity & Harvesting';
  stageProgressPct: number;
  healthScore: number; // 0-100
  expectedHarvestDate: string;
  expectedYieldQuintals: number;
  soilMoistureStatus: 'OPTIMAL' | 'MODERATE' | 'DEFICIENT' | 'EXCESS';
  pestVulnerability: 'LOW' | 'MEDIUM' | 'HIGH';
  pestWatchlist: string[];
  recentAction: string;
  imageUrl: string;
}

// 2. Disease Scanner Module
export interface DiseaseScanImageQuality {
  clarity: 'GOOD' | 'POOR' | 'EXCELLENT';
  lighting: 'GOOD' | 'POOR' | 'OPTIMAL';
  cropVisibility: 'CLEAR' | 'OBSCURED';
  leafVisibility: 'CLEAR' | 'OBSCURED';
  resolution: string;
  passed: boolean;
  issues?: string[];
  suggestions?: string[];
}

export interface DiseaseDifferentialPossibility {
  issue: string;
  probabilityPct: number;
  isPrimary?: boolean;
  category?: 'Fungal' | 'Bacterial' | 'Viral' | 'Nutrient' | 'Pest' | 'Abiotic';
}

export interface DiseaseScanResult {
  id: string;
  cropName: string;
  detectedCrop?: string;
  pathogen: string;
  possibleDisease?: string;
  hindiName?: string;
  confidenceScore: number;
  confidenceExplanation?: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'MEDIUM';
  symptoms: string[];
  causes?: string[];
  recommendedAction?: string[];
  recommendedChemical?: string[];
  recommendedOrganic?: string[];
  preventionSteps: string[];
  differentialPossibilities?: DiseaseDifferentialPossibility[];
  imageQuality?: DiseaseScanImageQuality;
  clusterAdvisory?: string;
  advisoryDisclaimer?: string;
  scannedAt: string;
  sampleImageUrl?: string;
  isDemo?: boolean;
  farmerId?: string;
}

// 3. Smart Irrigation & IoT Sensors
export interface IoTSensor {
  id: string;
  name: string;
  type: 'SOIL_MOISTURE' | 'SOIL_TEMPERATURE' | 'CANOPY_HUMIDITY' | 'SOIL_EC' | 'SOIL_PH';
  label: string;
  value: number;
  unit: string;
  status: 'ONLINE' | 'DELAYED' | 'OFFLINE';
  lastReadingTime: string;
  batteryPct: number;
  depthCm?: number;
  location: string;
  isDemo: boolean;
  optimalRange: string;
  interpretation: string;
  statusColor: 'green' | 'amber' | 'rose';
}

export interface IrrigationRecord {
  id: string;
  date: string;
  dateLabel: string;
  durationMinutes: number;
  waterVolumeLitres: number;
  crop: string;
  fieldName: string;
  method: string;
  pumpType: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'SKIPPED_RAIN';
  loggedBy: 'AUTO_AI' | 'MANUAL';
  notes: string;
  savedToDiary?: boolean;
}

export interface WaterAnalytics {
  dailyUsage: { day: string; date: string; usedLitres: number; baselineLitres: number; savedLitres: number }[];
  weeklyUsage: { week: string; usedLitres: number; savedLitres: number }[];
  totalUsedWeekLitres: number;
  totalSavedWeekLitres: number;
  estimatedCostSavedInr: number;
  pumpRunHoursThisWeek: number;
}

export interface SmartIrrigationStatus {
  soilMoisturePct: number;
  rootZoneCondition: 'Moist / Adequate' | 'Moderate Depletion' | 'Critical Stress' | 'Saturated';
  cropGrowthStage: string;
  activeCropName?: string;
  temperatureC?: number;
  rainForecast48hPct: number;
  irrigationRequired: boolean;
  decisionTitle?: string;
  recommendedDurationMinutes: number;
  decisionReason: string;
  bestIrrigationTime: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  pumpStatus: 'IDLE' | 'RUNNING' | 'SCHEDULED';
  waterSavedThisMonthLitres: number;
  waterStatusScore?: number;
  scoreBreakdown?: {
    soilMoisture: 'Good' | 'Moderate' | 'Low' | 'Critical';
    rainForecast: 'Good' | 'Moderate' | 'High' | 'Delay Active';
    cropDemand: 'Low' | 'Moderate' | 'High';
    temperature: 'Normal' | 'Moderate' | 'High';
  };
  estimatedWaterRequirementLitresPerAcre?: number;
  lastIrrigationText?: string;
  hourlyMoistureCurve: { time: string; moisturePct: number; thresholdPct: number }[];
  sensors?: IoTSensor[];
  history?: IrrigationRecord[];
  analytics?: WaterAnalytics;
  isDemoSensorMode?: boolean;
}

// 4. Soil Health Module
export interface NutrientMetric {
  name: string;
  hindiName: string;
  symbol: string;
  currentValue: number;
  unit: string;
  idealRange: string;
  status: 'Good' | 'Moderate' | 'Needs Attention';
  statusColor: 'green' | 'amber' | 'rose';
  recommendation: string;
  soilContextNote?: string;
}

export interface SoilHealthData {
  farmerName: string;
  village: string;
  district?: string;
  state?: string;
  sampleId: string;
  testDate: string;
  soilHealthScore: number; // 0-100
  scoreClassification?: 'Optimal Fertility' | 'Good Fertility Index' | 'Moderate Soil Stress' | 'Degraded';
  soilType: string;
  soilPh: number;
  phStatus: 'Acidic' | 'Neutral' | 'Slightly Alkaline' | 'Alkaline';
  phIdealRange?: string;
  organicCarbonPct: number;
  organicCarbonStatus: 'Low' | 'Medium' | 'High';
  organicCarbonIdealRange?: string;
  nitrogenKgHa: number;
  nitrogenStatus: 'Low' | 'Medium' | 'High';
  nitrogenIdealRange?: string;
  phosphorusKgHa: number;
  phosphorusStatus: 'Low' | 'Medium' | 'High';
  phosphorusIdealRange?: string;
  potassiumKgHa: number;
  potassiumStatus: 'Low' | 'Medium' | 'High';
  potassiumIdealRange?: string;
  electricalConductivityDsM: number;
  micronutrients: { name: string; value: string; status: 'Adequate' | 'Deficient'; ideal?: string }[];
  organicRejuvenationPlan: string[];
  chemicalFertilizerRecommendations: string[];
  lastUpdated?: string;
  isVerified?: boolean;
}

export interface SoilRecordHistoryItem {
  id: string;
  year: number;
  testDate: string;
  sampleId: string;
  labName: string;
  overallScore: number;
  soilHealthScore?: number;
  testedBy?: string;
  ph?: number;
  soilType: string;
  soilPh: number;
  organicCarbonPct: number;
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
  electricalConductivityDsM: number;
  status: 'Verified' | 'Self-Reported' | 'OCR-Extracted';
  notes?: string;
}

export interface SoilImprovementPlanItem {
  id: string;
  category: 'Organic Matter' | 'Crop Rotation' | 'Nutrient Balance' | 'Nutrient Management' | 'Irrigation & Drainage' | 'Fertilizer Reduction' | 'Soil Testing' | string;
  title: string;
  description: string;
  actionSteps?: string[];
  timeline?: string;
  timeframe?: string;
  impactLevel?: 'High' | 'Medium' | 'Essential' | string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dosageOrMethod?: string;
  expectedOutcome?: string;
  estimatedCostInr?: number;
  recommendedInputs?: string[];
}

export interface SoilCropSuitabilityInsight {
  suitableCrops: {
    cropName: string;
    hindiName: string;
    matchScore?: number;
    suitabilityScore?: number;
    reason: string;
  }[];
  highlySuitableCrops?: {
    cropName: string;
    hindiName: string;
    suitabilityScore: number;
    reason: string;
  }[];
  lessSuitableCrops: {
    cropName: string;
    hindiName: string;
    concern?: string;
    constraint?: string;
    remedyIfGrown?: string;
    requiredModification?: string;
  }[];
  soilTexture?: string;
  waterRetentionCapacity?: string;
  infiltrationRate?: string;
  irrigationRecommendation?: string;
}

// 5. Market Prices Module
export interface MandiPriceRecord {
  id: string;
  crop: string;
  variety: string;
  mandi: string;
  district: string;
  state: string;
  minPricePerQuintal: number;
  maxPricePerQuintal: number;
  modalPricePerQuintal: number;
  priceChangeDailyPct: number;
  dailyArrivalQuintals: number;
  distanceKm: number;
  date: string;
  isBestMandi?: boolean;
  priceTrend: { date: string; price: number }[];
}

// 6. Profit Calculator Module
export interface ProfitCalculationInput {
  cropName: string;
  farmSizeAcres: number;
  seedCostPerAcre: number;
  fertilizerCostPerAcre: number;
  pesticideCostPerAcre: number;
  labourCostPerAcre: number;
  irrigationPowerCostPerAcre: number;
  machineryRentalCostPerAcre: number;
  otherMiscCostPerAcre: number;
  expectedYieldQuintalsPerAcre: number;
  expectedSellingPricePerQuintal: number;
}

export interface ProfitCalculationResult {
  totalInvestment: number;
  totalCostPerAcre: number;
  expectedGrossRevenue: number;
  netProfit: number;
  netProfitPerAcre: number;
  returnOnInvestmentPct: number;
  breakEvenYieldQuintalsPerAcre: number;
  breakEvenPricePerQuintal: number;
  costBreakdown: { category: string; amount: number; percentage: number }[];
}

// 7. Crop Recommendation Engine
export interface CropLifecycleStageAction {
  stage: string;
  hindiStage?: string;
  daysRange: string;
  title: string;
  description: string;
  recommendedActions: string[];
  waterAdvice: string;
  nutritionAdvice: string;
  pestVigilance: string;
  iconName?: string;
}

export interface CropDiseaseGuide {
  name: string;
  hindiName?: string;
  symptoms: string;
  organicRemedy: string;
  chemicalSpray: string;
  prevention: string;
}

export interface CropPestGuide {
  name: string;
  hindiName?: string;
  symptoms: string;
  ipmControl: string;
  thresholdAction: string;
}

export interface CropDetail {
  id: string;
  cropName: string;
  hindiName: string;
  scientificName?: string;
  variety: string;
  suitabilityScore: number; // 0-100%
  expectedYieldPerAcre: string; // e.g. "18 - 22 Quintals"
  expectedYieldQuintals: number;
  estimatedCostPerAcre: number;
  potentialRevenuePerAcre: number;
  estimatedProfitPerAcre: number;
  waterRequirement: 'Low' | 'Medium' | 'High' | 'Low (Rainfed / Drip)' | 'High (Canal / Flood)';
  waterRequirementDetail: string;
  durationDays: number;
  marketRisk: 'Low' | 'Medium' | 'Moderate' | 'High';
  bestSeason: 'Kharif' | 'Rabi' | 'Zaid' | 'Multi-Season';
  suitableSoils: string[];
  suitableClimate: string;
  sowingPeriod: string;
  whyThisCrop: string;
  overview: string;
  growthStages: CropLifecycleStageAction[];
  nutrientRequirements: {
    basal: string;
    topDressing: string;
    micronutrients: string;
  };
  commonDiseases: CropDiseaseGuide[];
  commonPests: CropPestGuide[];
  harvestIndicators: string[];
  storageConsiderations: string[];
  marketInformation: {
    currentMandiPricePerQuintal: number;
    mspPricePerQuintal?: number;
    demandTrend: 'Strong Bullish' | 'High & Stable' | 'Moderate' | 'Volatile';
    topBuyers: string;
    exportDemand: string;
  };
  keySuccessTips: string[];
  governmentSubsidiesAvailable: string[];
  imageUrl: string;
}

export type CropRecommendationItem = CropDetail;

export type MicronutrientMetric = { name: string; value: string; status: 'Adequate' | 'Deficient'; ideal?: string };

export type FarmingGoalType = 'Maximum Profit' | 'Low Water Requirement' | 'Low Risk' | 'Short Duration' | 'High Yield' | 'Sustainable Farming' | string;
export type AvailableWaterLevel = 'Low' | 'Moderate' | 'Abundant' | string;
export type IrrigationMethodType = 'Drip' | 'Sprinkler' | 'Flood' | 'Rainfed' | string;
export type CropSeasonType = 'Kharif' | 'Rabi' | 'Zaid' | 'All' | 'Auto-Detected' | string;

export interface CropCatalogItem {
  id: string;
  cropName: string;
  hindiName: string;
  scientificName: string;
  variety: string;
  season: string;
  durationDays: number;
  averageYieldQuintalsPerAcre: number;
  estimatedCostPerAcreInr: number;
  estimatedRevenuePerAcreInr: number;
  estimatedNetProfitPerAcreInr: number;
  waterRequirement: string;
  soilPhRange: string;
  suitableSoilTypes: string[];
  description: string;
  imageUrl: string;
  stages: {
    stageName: string;
    startDay: number;
    endDay: number;
    description: string;
    waterAdvice: string;
    nutritionAdvice: string;
  }[];
  fertilizerPlan: {
    nitrogenKgAcre: number;
    phosphorusKgAcre: number;
    potassiumKgAcre: number;
    basalDose: string;
    topDressing: string;
    micronutrients: string;
  };
  diseases: {
    name: string;
    symptoms: string;
    organicControl: string;
    chemicalControl: string;
  }[];
  pests: {
    name: string;
    symptoms: string;
    ipmControl: string;
    chemicalSpray: string;
  }[];
  harvestIndicators: string[];
  postHarvestStorage: string;
  mandiPriceReference: string;
  mspSupport: boolean;
  mspPriceInr?: number;
  marketHubs: string[];
}

export interface CropRecommendationResultItem {
  cropId: string;
  cropName: string;
  hindiName: string;
  variety: string;
  season: string;
  suitabilityScore: number;
  expectedYieldRange: string;
  estimatedCostPerAcreInr: number;
  estimatedRevenuePerAcreInr: number;
  estimatedNetProfitPerAcreInr: number;
  durationDays: string;
  waterRequirement: string;
  marketRisk: string;
  soilCompatibility: string;
  sowingWindow: string;
  reasons: string[];
  mandiPriceReference?: string;
}

export interface CropRecommendationInput {
  state: string;
  district: string;
  village: string;
  gpsCoordinates?: { lat: number; lng: number };
  farmSizeAcres: number;
  availableWater: 'Low' | 'Moderate' | 'Abundant' | string;
  irrigationType: 'Drip' | 'Sprinkler' | 'Flood' | 'Rainfed' | string;
  farmingExperience: 'Beginner (<3 yrs)' | 'Intermediate (3-10 yrs)' | 'Expert (>10 yrs)' | string;
  budgetPerAcre: number;
  soilType: string;
  soilPh?: number;
  nitrogen?: number | string;
  nitrogenKgHa?: number;
  phosphorus?: number | string;
  phosphorusKgHa?: number;
  potassium?: number | string;
  potassiumKgHa?: number;
  organicCarbon?: number | string;
  organicCarbonPct?: number;
  unknownSoilDetails?: boolean;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'All' | 'Auto-Detected' | string;
  farmingGoal: 'Maximum Profit' | 'Low Water Requirement' | 'Low Risk' | 'Short Duration' | 'High Yield' | 'Sustainable Farming' | string;
}

export interface CropRecommendationResult {
  topCrops: CropDetail[];
  topRecommendations?: CropRecommendationResultItem[];
  aiAdvice: {
    kisanBhaiAdvice: string;
    whyReasons: string[];
    topPickName: string;
    seasonalNote: string;
    resourceAlignment: string;
  };
  aiExplanation?: string;
  district?: string;
  season?: string;
  farmingGoal?: string;
  inputSummary: CropRecommendationInput;
  timestamp: string;
  isDemo?: boolean;
}

export interface CropComparisonItem {
  crop: CropDetail;
  metrics: {
    suitabilityScore: number;
    estimatedCostPerAcre: number;
    expectedYieldPerAcre: string;
    potentialRevenuePerAcre: number;
    estimatedProfitPerAcre: number;
    waterRequirement: string;
    durationDays: number;
    marketRisk: string;
  };
}

// 8. Government Schemes
export interface GovernmentScheme {
  id: string;
  name: string;
  hindiName: string;
  ministry: string;
  category: 'Direct Income Support' | 'Crop Insurance' | 'Credit & Loan' | 'Irrigation Subsidy' | 'Organic & Soil' | 'Farm Mechanization';
  benefitSummary: string;
  financialAssistance: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  officialPortalUrl: string;
  isVerifiedOfficial: boolean;
  stateAvailability: string; // 'All India' or specific state
}

// 9. Farm Diary
export interface FarmDiaryEntry {
  id: string;
  date: string;
  category: 'Sowing' | 'Irrigation' | 'Fertilizer' | 'Pesticide' | 'Disease & Pest' | 'Expense' | 'Harvest' | 'Sales' | string;
  crop: string;
  title: string;
  quantityOrDose?: string;
  expenseAmountInr?: number;
  incomeAmountInr?: number;
  revenueAmountInr?: number;
  notes: string;
  imageUrl?: string;
  syncedWithCloud: boolean;
}
export type FarmDiaryRecord = FarmDiaryEntry;

// 10. Community Module
export interface CommunityComment {
  id: string;
  authorName: string;
  authorRole: string;
  village: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorVillage: string;
  authorDistrict?: string;
  authorState: string;
  authorRole: 'Farmer' | 'Village Champion' | 'KVK Agronomist' | string;
  authorAvatar?: string;
  authorBadge?: string;
  title: string;
  content: string;
  category: 'Crop Advice' | 'Pest Outbreak' | 'Machinery Sharing' | 'Market Trends' | 'Success Story' | string;
  cropTag?: string;
  tags?: string[];
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  repliesCount?: number;
  comments: CommunityComment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
}
export type CommunityPostItem = CommunityPost;

// 11. Talk to Expert (KVK / ICAR)
export interface ExpertProfile {
  id: string;
  name: string;
  designation: string;
  organization: string;
  institution?: string;
  specialty: string;
  specialization?: string;
  experienceYears: number;
  rating: number;
  totalConsultations: number;
  languages: string[];
  isOnline: boolean;
  isAvailableNow?: boolean;
  availableSlot: string;
  phone: string;
  avatarUrl?: string;
}
export type ExpertConsultant = ExpertProfile;

// 12. Farm Alerts
export interface FarmAlert {
  id: string;
  title: string;
  hindiTitle?: string;
  category: 'WEATHER_ALERT' | 'PEST_OUTBREAK' | 'IRRIGATION_REMINDER' | 'MANDI_SPIKE' | 'SCHEME_DEADLINE' | 'WEATHER' | 'PEST' | 'MARKET' | 'IRRIGATION' | 'GOVERNMENT' | string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  description: string;
  actionTitle?: string;
  actionLabel?: string;
  targetView?: string;
  actionUrl?: string;
  isRead: boolean;
}
export type FarmAlertItem = FarmAlert;

