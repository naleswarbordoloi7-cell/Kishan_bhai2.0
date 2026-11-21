import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import {
  CropLifecycleItem,
  CropReportActivityItem,
  CropReportExpenseItem,
  CropReportPerformanceSubject,
  DataVerificationTag,
  DigitalCropReportCard,
  DiseaseScanResult,
  FarmDiaryEntry,
  FarmerProfileData,
  MandiPriceRecord,
  SmartIrrigationStatus,
  SoilHealthData,
  UserProfile,
} from '../../shared/types';
import { FARMER_DEFAULT_PORTRAIT, resolveCropPhoto } from '../utils/cropImages';

export interface CropReportOverrides {
  farmerApprovedForBuyers?: boolean;
  approvedAt?: string;
  approvedNote?: string;
  harvestQuantityQuintals?: number;
  harvestVerified?: boolean;
  cropQualityGrade?: 'A+ Export' | 'Grade A Premium' | 'Grade B Standard' | 'Grade C Fair';
  gradeVerified?: boolean;
  aiHealthAnalysis?: DigitalCropReportCard['aiHealthAnalysis'];
}

const REPORT_OVERRIDES_KEY = 'kb_crop_report_overrides_v1';

export function loadReportOverridesMap(): Record<string, CropReportOverrides> {
  try {
    const raw = localStorage.getItem(REPORT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCropReportOverride(cropId: string, patch: CropReportOverrides): Record<string, CropReportOverrides> {
  const current = loadReportOverridesMap();
  const next = {
    ...current,
    [cropId]: {
      ...(current[cropId] || {}),
      ...patch,
    },
  };
  try {
    localStorage.setItem(REPORT_OVERRIDES_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

function toSafeId(raw: string): string {
  return (raw || 'report').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

function getLetterGrade(scorePct: number): 'A+' | 'A' | 'B+' | 'B' | 'C' {
  if (scorePct >= 90) return 'A+';
  if (scorePct >= 82) return 'A';
  if (scorePct >= 74) return 'B+';
  if (scorePct >= 62) return 'B';
  return 'C';
}

function getRatingText(scorePct: number): string {
  if (scorePct >= 90) return 'Exemplary';
  if (scorePct >= 82) return 'Strong';
  if (scorePct >= 74) return 'Good';
  if (scorePct >= 62) return 'Satisfactory';
  return 'Needs Attention';
}

function cropKeyword(cropName: string): string {
  const lower = (cropName || '').toLowerCase();
  if (lower.includes('cotton')) return 'cotton';
  if (lower.includes('groundnut')) return 'groundnut';
  if (lower.includes('soybean')) return 'soybean';
  if (lower.includes('mustard')) return 'mustard';
  if (lower.includes('wheat')) return 'wheat';
  if (lower.includes('cumin') || lower.includes('jeera')) return 'cumin';
  if (lower.includes('chana') || lower.includes('chickpea')) return 'chana';
  if (lower.includes('tomato')) return 'tomato';
  if (lower.includes('rice') || lower.includes('paddy')) return 'paddy';
  return lower.split(' ')[0] || 'crop';
}

function getDefaultMandiPricePerQuintal(cropName: string, mandiPrices: MandiPriceRecord[]): {
  pricePerQuintal: number;
  source: string;
  verification: DataVerificationTag;
} {
  const kw = cropKeyword(cropName);
  const match = mandiPrices.find((m) => m.crop.toLowerCase().includes(kw));
  if (match) {
    return {
      pricePerQuintal: match.modalPricePerQuintal,
      source: `${match.mandi}, ${match.state} (Live APMC)`,
      verification: 'VERIFIED',
    };
  }
  const fallbackRates: Record<string, number> = {
    cotton: 7450,
    groundnut: 6420,
    soybean: 4780,
    mustard: 5850,
    wheat: 2680,
    cumin: 24500,
    chana: 5900,
    tomato: 2400,
    paddy: 3150,
  };
  return {
    pricePerQuintal: fallbackRates[kw] || 4200,
    source: 'Regional Benchmark Estimate',
    verification: 'ESTIMATED',
  };
}

function getBaselineExpensePerAcre(cropName: string): number {
  const kw = cropKeyword(cropName);
  const perAcre: Record<string, number> = {
    cotton: 21500,
    groundnut: 18500,
    soybean: 14500,
    mustard: 13200,
    wheat: 16200,
    cumin: 24000,
    chana: 14000,
    tomato: 32000,
  };
  return perAcre[kw] || 16500;
}

export function computeUniqueCropId(crop: CropLifecycleItem, state: string): string {
  const stateCode = (state || 'IN').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'IN';
  const cropCode = cropKeyword(crop.cropName).slice(0, 3).toUpperCase() || 'CRP';
  const suffix = crop.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '0001';
  return `KB-${stateCode}-${cropCode}-${suffix}`;
}

export function computeVerificationCode(reportId: string, uniqueCropId: string): string {
  const seed = `${reportId}:${uniqueCropId}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `KBV-${hash.toString(16).toUpperCase().padStart(6, '0').slice(0, 6)}`;
}

export function buildDigitalCropReportCard(params: {
  crop: CropLifecycleItem;
  currentUser: UserProfile | null;
  farmerProfile: FarmerProfileData;
  soilHealth: SoilHealthData;
  diseaseScans: DiseaseScanResult[];
  diaryEntries: FarmDiaryEntry[];
  irrigationStatus: SmartIrrigationStatus;
  mandiPrices: MandiPriceRecord[];
  override?: CropReportOverrides;
}): DigitalCropReportCard {
  const {
    crop,
    currentUser,
    farmerProfile,
    soilHealth,
    diseaseScans,
    diaryEntries,
    irrigationStatus,
    mandiPrices,
    override,
  } = params;

  const farmerName = currentUser?.fullName || farmerProfile.name || soilHealth.farmerName || 'Ramesh Patel';
  const farmerId = toSafeId(currentUser?.id || 'usr_farmer_ramesh');
  const village = currentUser?.village || farmerProfile.village || soilHealth.village || 'Anandpur';
  const district = currentUser?.district || farmerProfile.district || soilHealth.district || 'Rajkot';
  const state = currentUser?.state || farmerProfile.state || soilHealth.state || 'Gujarat';
  const phone = currentUser?.phone || farmerProfile.mobile;

  const uniqueCropId = computeUniqueCropId(crop, state);
  const reportId = toSafeId(`KB_CRC_${farmerId.slice(-6)}_${crop.id}`);
  const verificationCode = computeVerificationCode(reportId, uniqueCropId);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kishanbhai.app';
  const verificationUrl = `${origin}/?view=crop-report-card&report=${encodeURIComponent(reportId)}&verify=${encodeURIComponent(verificationCode)}`;

  // Dates calculation
  const sowDate = new Date(crop.sowingDate);
  const harvDate = new Date(crop.expectedHarvestDate);
  const nowDate = new Date();
  const totalCycleDays =
    !isNaN(sowDate.getTime()) && !isNaN(harvDate.getTime())
      ? Math.max(30, Math.round((harvDate.getTime() - sowDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 120;
  const daysElapsed = !isNaN(sowDate.getTime())
    ? Math.max(1, Math.min(totalCycleDays, Math.round((nowDate.getTime() - sowDate.getTime()) / (1000 * 60 * 60 * 24))))
    : Math.round((crop.stageProgressPct / 100) * totalCycleDays);

  // Match disease scans
  const kw = cropKeyword(crop.cropName);
  const matchingScans = diseaseScans.filter((d) => d.cropName.toLowerCase().includes(kw));
  const latestScan = matchingScans[0];

  const diseaseSeverity: DigitalCropReportCard['diseaseReport']['severity'] = latestScan
    ? latestScan.severity === 'CRITICAL'
      ? 'HIGH'
      : latestScan.severity === 'MODERATE'
      ? 'MEDIUM'
      : latestScan.severity
    : crop.pestVulnerability === 'HIGH'
    ? 'HIGH'
    : crop.pestVulnerability === 'MEDIUM'
    ? 'MEDIUM'
    : 'LOW';

  const diseaseVerification: DataVerificationTag = latestScan ? 'VERIFIED' : 'ESTIMATED';

  // Match Diary Entries + Crop Observations for Fertilizer & Irrigation History
  const matchingDiary = diaryEntries.filter(
    (entry) =>
      entry.crop.toLowerCase().includes(kw) ||
      entry.crop.toLowerCase().includes('general') ||
      entry.title.toLowerCase().includes(kw)
  );

  const activityHistory: CropReportActivityItem[] = [
    ...matchingDiary.map((entry) => ({
      id: entry.id,
      date: entry.date,
      category: (entry.category === 'Labor' || entry.category === 'Infrastructure' ? 'Observation' : entry.category) as CropReportActivityItem['category'],
      title: entry.title,
      quantityOrDose: entry.quantityOrDose,
      expenseAmountInr: entry.expenseAmountInr || 0,
      notes: entry.notes,
      verification: 'VERIFIED' as DataVerificationTag,
    })),
    ...(crop.observations || []).map((obs) => ({
      id: obs.id,
      date: obs.date,
      category: (obs.category?.toLowerCase().includes('irrigation')
        ? 'Irrigation'
        : obs.category?.toLowerCase().includes('fertilizer')
        ? 'Fertilizer'
        : obs.category?.toLowerCase().includes('harvest')
        ? 'Harvest'
        : 'Observation') as CropReportActivityItem['category'],
      title: `${obs.category || 'Field'} Log`,
      quantityOrDose: obs.text,
      expenseAmountInr: 0,
      notes: obs.text,
      verification: 'VERIFIED' as DataVerificationTag,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (crop.recentAction && !activityHistory.some((h) => h.title === crop.recentAction)) {
    activityHistory.push({
      id: `act_recent_${crop.id}`,
      date: crop.sowingDate,
      category: 'Fertilizer',
      title: crop.recentAction,
      quantityOrDose: 'Field Stage Record',
      expenseAmountInr: 0,
      verification: 'VERIFIED',
    });
  }

  const irrigationEventsCount = Math.max(
    1,
    activityHistory.filter((h) => h.category === 'Irrigation').length + (irrigationStatus.pumpStatus === 'RUNNING' ? 1 : 0)
  );
  const fertilizerApplicationsCount = Math.max(
    1,
    activityHistory.filter((h) => h.category === 'Fertilizer' || h.category === 'Micronutrient').length
  );

  // Market Price & Financials
  const mandiMatch = getDefaultMandiPricePerQuintal(crop.cropName, mandiPrices);
  const harvestQuantityQuintals =
    override?.harvestQuantityQuintals !== undefined
      ? override.harvestQuantityQuintals
      : crop.expectedYieldQuintals;
  const harvestVerification: DataVerificationTag =
    override?.harvestVerified || crop.stageProgressPct >= 95 ? 'VERIFIED' : 'ESTIMATED';

  // Expenses: sum verified logged diary expenses specifically tied to this crop + proportional baseline costs
  const cropSpecificDiaryExpenses = diaryEntries
    .filter((e) => e.crop.toLowerCase().includes(kw))
    .reduce((sum, e) => sum + (Number(e.expenseAmountInr) || 0), 0);

  const stageWeight = Math.max(0.35, Math.min(1, crop.stageProgressPct / 100));
  const baselineTotal = Math.round(getBaselineExpensePerAcre(crop.cropName) * crop.areaAcres * stageWeight);
  const estimatedBaselineExpensesInr = Math.max(0, baselineTotal - cropSpecificDiaryExpenses);
  const totalCultivationExpensesInr = cropSpecificDiaryExpenses + estimatedBaselineExpensesInr;

  const expenseBreakdown: CropReportExpenseItem[] = [
    ...(cropSpecificDiaryExpenses > 0
      ? [
          {
            label: 'Logged Farm Diary Inputs & Field Operations',
            amountInr: cropSpecificDiaryExpenses,
            source: 'VERIFIED' as DataVerificationTag,
          },
        ]
      : []),
    {
      label: 'Seeds, Land Preparation & Stage Baseline Operations',
      amountInr: estimatedBaselineExpensesInr,
      source: 'ESTIMATED' as DataVerificationTag,
    },
  ];

  const expectedRevenueInr = Math.round(harvestQuantityQuintals * mandiMatch.pricePerQuintal);
  const estimatedProfitInr = expectedRevenueInr - totalCultivationExpensesInr;
  const profitPerAcreInr = Math.round(estimatedProfitInr / Math.max(0.5, crop.areaAcres));
  const roiPct = totalCultivationExpensesInr > 0 ? Math.round((estimatedProfitInr / totalCultivationExpensesInr) * 100) : 0;

  // Quality Grade
  const computedGrade: DigitalCropReportCard['harvestAndQuality']['cropQualityGrade'] =
    override?.cropQualityGrade ||
    (crop.healthScore >= 92 && soilHealth.soilHealthScore >= 80
      ? 'A+ Export'
      : crop.healthScore >= 84
      ? 'Grade A Premium'
      : crop.healthScore >= 72
      ? 'Grade B Standard'
      : 'Grade C Fair');

  // Performance Scorecard Subjects
  const diseaseScore =
    diseaseSeverity === 'LOW' ? 92 : diseaseSeverity === 'MEDIUM' ? 78 : 58;
  const waterScore =
    irrigationStatus.soilMoisturePct >= 38 && irrigationStatus.soilMoisturePct <= 60 ? 90 : 76;
  const yieldScore = Math.min(96, Math.max(70, Math.round((crop.healthScore * 0.6) + (crop.stageProgressPct * 0.35))));

  const subjects: CropReportPerformanceSubject[] = [
    {
      id: 'soil',
      subject: 'Soil Fertility & Nutrient Balance',
      subjectHi: 'मिट्टी उर्वरता एवं पोषण संतुलन',
      scorePct: soilHealth.soilHealthScore,
      grade: getLetterGrade(soilHealth.soilHealthScore),
      ratingText: getRatingText(soilHealth.soilHealthScore),
      verification: soilHealth.isVerified ? 'VERIFIED' : 'ESTIMATED',
      detailNote: `pH ${soilHealth.soilPh} (${soilHealth.phStatus}) · OC ${soilHealth.organicCarbonPct}%`,
    },
    {
      id: 'vigor',
      subject: 'Vegetative Vigor & Canopy Health',
      subjectHi: 'फसल विकास एवं हरियाली स्कोर',
      scorePct: crop.healthScore,
      grade: getLetterGrade(crop.healthScore),
      ratingText: getRatingText(crop.healthScore),
      verification: 'ESTIMATED',
      detailNote: `${crop.stage} (${crop.stageProgressPct}% cycle complete)`,
    },
    {
      id: 'disease',
      subject: 'Disease & Pest Resistance',
      subjectHi: 'रोग एवं कीट सुरक्षा स्तर',
      scorePct: diseaseScore,
      grade: getLetterGrade(diseaseScore),
      ratingText: getRatingText(diseaseScore),
      verification: diseaseVerification,
      detailNote: latestScan
        ? `${latestScan.pathogen.split('(')[0].trim()} (${latestScan.severity})`
        : `${crop.pestVulnerability} pest vulnerability`,
    },
    {
      id: 'water',
      subject: 'Water & Nutrient Management',
      subjectHi: 'सिंचाई एवं खाद प्रबंधन',
      scorePct: waterScore,
      grade: getLetterGrade(waterScore),
      ratingText: getRatingText(waterScore),
      verification: activityHistory.length > 0 ? 'VERIFIED' : 'ESTIMATED',
      detailNote: `${fertilizerApplicationsCount} nutrient logs · ${irrigationStatus.soilMoisturePct}% root moisture`,
    },
    {
      id: 'yield',
      subject: 'Yield & Market Readiness',
      subjectHi: 'उपज एवं बाजार गुणवत्ता तैयारी',
      scorePct: yieldScore,
      grade: getLetterGrade(yieldScore),
      ratingText: getRatingText(yieldScore),
      verification: harvestVerification,
      detailNote: `${harvestQuantityQuintals} Qtl · ${computedGrade}`,
    },
  ];

  const overallScorePct = Math.round(subjects.reduce((acc, s) => acc + s.scorePct, 0) / subjects.length);
  const overallGrade = getLetterGrade(overallScorePct);
  const overallRatingOutOf5 = Math.round(((overallScorePct / 100) * 5) * 10) / 10;

  // AI Health Analysis (use override if generated via Gemini, else deterministic agronomic synthesis)
  const defaultAiAnalysis: DigitalCropReportCard['aiHealthAnalysis'] = {
    healthScore: crop.healthScore,
    summary: `${crop.cropName} (${crop.variety}) across ${crop.areaAcres} acres is currently in ${crop.stage} at ${crop.stageProgressPct}% maturity with an overall ${overallGrade} performance rating. Soil pH (${soilHealth.soilPh}) and root-zone moisture (${irrigationStatus.soilMoisturePct}%) support healthy yield realization of ~${harvestQuantityQuintals} quintals.`,
    strengths: [
      `Soil fertility index is ${soilHealth.soilHealthScore}/100 with ${soilHealth.potassiumStatus.toLowerCase()} potassium reserves.`,
      `${activityHistory.length} field operations logged for clear traceability.`,
      `Projected ROI of ${roiPct}% at current mandi rate of ₹${mandiMatch.pricePerQuintal.toLocaleString()}/qtl.`,
    ],
    recommendations: [
      soilHealth.micronutrients.some((m) => m.status === 'Deficient')
        ? `Address Boron micronutrient deficiency via foliar spray before next reproductive phase.`
        : `Maintain balanced NPK split schedule aligned with crop stage.`,
      `Monitor ${crop.pestWatchlist.slice(0, 2).join(' & ')} during morning field checks.`,
      `Target ${computedGrade} moisture threshold (<10–12%) prior to harvest pooling.`,
    ],
    analyzedAt: new Date().toISOString(),
    verification: 'ESTIMATED',
  };

  const aiHealthAnalysis = override?.aiHealthAnalysis || defaultAiAnalysis;

  const verificationItems: DataVerificationTag[] = [
    soilHealth.isVerified ? 'VERIFIED' : 'ESTIMATED',
    diseaseVerification,
    activityHistory.length > 0 ? 'VERIFIED' : 'ESTIMATED',
    harvestVerification,
    mandiMatch.verification,
    cropSpecificDiaryExpenses > 0 ? 'VERIFIED' : 'ESTIMATED',
  ];
  const verifiedRecordsCount = verificationItems.filter((v) => v === 'VERIFIED').length;
  const estimatedRecordsCount = verificationItems.filter((v) => v === 'ESTIMATED').length;

  return {
    reportId,
    uniqueCropId,
    seasonLabel: '2026–27 Crop Cycle',
    generatedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    farmerInfo: {
      farmerId,
      fullName: farmerName,
      village,
      district,
      state,
      phone,
      photoUrl: FARMER_DEFAULT_PORTRAIT,
      kycVerified: currentUser?.verified ?? true,
    },
    cropInfo: {
      cropId: crop.id,
      cropName: crop.cropName,
      hindiName: crop.hindiName,
      variety: crop.variety,
      landAreaAcres: crop.areaAcres,
      landAreaHectares: Math.round(crop.areaAcres * 0.404686 * 100) / 100,
      sowingDate: crop.sowingDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      daysElapsed,
      totalCycleDays,
      growthStage: crop.stage,
      growthProgressPct: crop.stageProgressPct,
      cropPhotoUrl: resolveCropPhoto(crop.cropName, crop.imageUrl),
    },
    soilHealthReport: {
      sampleId: soilHealth.sampleId,
      testDate: soilHealth.testDate,
      soilType: soilHealth.soilType,
      ph: soilHealth.soilPh,
      phStatus: soilHealth.phStatus,
      organicCarbonPct: soilHealth.organicCarbonPct,
      nitrogenKgHa: soilHealth.nitrogenKgHa,
      phosphorusKgHa: soilHealth.phosphorusKgHa,
      potassiumKgHa: soilHealth.potassiumKgHa,
      soilHealthScore: soilHealth.soilHealthScore,
      classification: soilHealth.scoreClassification,
      verification: soilHealth.isVerified ? 'VERIFIED' : 'ESTIMATED',
    },
    diseaseReport: {
      latestScanDate: latestScan ? latestScan.scannedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      pathogenDetected: latestScan ? latestScan.pathogen : 'No Active Outbreak Reported',
      severity: diseaseSeverity,
      confidencePct: latestScan ? latestScan.confidenceScore : 90,
      activeRiskLevel: crop.pestVulnerability,
      treatmentStatus: latestScan ? 'Preventive Advisory Issued' : 'Routine Field Monitoring',
      pestWatchlist: crop.pestWatchlist,
      recentScansCount: matchingScans.length,
      verification: diseaseVerification,
    },
    fertilizerAndIrrigation: {
      irrigationEventsCount,
      fertilizerApplicationsCount,
      soilMoisturePct: irrigationStatus.soilMoisturePct,
      waterSavedLitres: irrigationStatus.waterSavedThisMonthLitres,
      pumpStatus: irrigationStatus.pumpStatus,
      history: activityHistory,
      verification: activityHistory.length > 0 ? 'VERIFIED' : 'ESTIMATED',
    },
    aiHealthAnalysis,
    harvestAndQuality: {
      harvestQuantityQuintals,
      harvestQuantityKg: Math.round(harvestQuantityQuintals * 100),
      harvestVerification,
      cropQualityGrade: computedGrade,
      moisturePct: crop.cropName.toLowerCase().includes('cotton') ? 8.5 : 10.2,
      purityScorePct: Math.min(99.5, Math.max(94, crop.healthScore + 5)),
      gradeVerification: override?.gradeVerified ? 'VERIFIED' : 'ESTIMATED',
    },
    financials: {
      marketPricePerQuintalInr: mandiMatch.pricePerQuintal,
      marketPricePerKgInr: Math.round((mandiMatch.pricePerQuintal / 100) * 100) / 100,
      marketSource: mandiMatch.source,
      priceVerification: mandiMatch.verification,
      totalCultivationExpensesInr,
      loggedExpensesInr: cropSpecificDiaryExpenses,
      estimatedBaselineExpensesInr,
      expenseBreakdown,
      expenseVerification: cropSpecificDiaryExpenses > 0 ? 'VERIFIED' : 'ESTIMATED',
      expectedRevenueInr,
      estimatedProfitInr,
      profitPerAcreInr,
      roiPct,
      revenueVerification: 'ESTIMATED',
    },
    performance: {
      overallGrade,
      overallScorePct,
      overallRatingOutOf5,
      remarks:
        overallScorePct >= 88
          ? 'Outstanding agronomic stewardship with strong soil balance and reliable buyer readiness.'
          : overallScorePct >= 78
          ? 'Consistent crop progression with sound moisture and nutrient discipline.'
          : 'Moderate crop standing; timely pest scouting and micronutrient support advised.',
      subjects,
    },
    verification: {
      status: verifiedRecordsCount >= 3 ? 'VERIFIED' : 'PROVISIONAL',
      verifiedRecordsCount,
      estimatedRecordsCount,
      verificationCode,
      verificationUrl,
      farmerApprovedForBuyers: override?.farmerApprovedForBuyers ?? true,
      approvedAt: override?.approvedAt || new Date().toISOString(),
      approvedNote: override?.approvedNote || 'Approved by farmer for verified buyer inspection',
    },
  };
}

export async function generateQrCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 240,
    margin: 1,
    color: {
      dark: '#14532D',
      light: '#FFFFFF',
    },
  });
}

export async function syncReportToCloudAndApi(report: DigitalCropReportCard): Promise<{ syncedApi: boolean; syncedFirestore: boolean }> {
  let syncedApi = false;
  let syncedFirestore = false;

  // Strip farmer phone/email before publishing shareable snapshot (PII isolation)
  const sanitizedReport: DigitalCropReportCard = {
    ...report,
    farmerInfo: {
      ...report.farmerInfo,
      phone: undefined,
    },
  };

  try {
    const res = await fetch('/api/crop-reports/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedReport),
    });
    syncedApi = res.ok;
  } catch (err) {
    console.warn('[CropReport] API publish note:', err);
  }

  // Sync to Firestore if signed in with Firebase Auth
  if (auth.currentUser) {
    const reportPath = `cropReports/${report.reportId}`;
    try {
      const firestorePayload = {
        id: report.reportId,
        farmerId: auth.currentUser.uid,
        farmerName: report.farmerInfo.fullName.slice(0, 120),
        village: report.farmerInfo.village.slice(0, 100),
        district: report.farmerInfo.district.slice(0, 100),
        state: report.farmerInfo.state.slice(0, 80),
        uniqueCropId: report.uniqueCropId.slice(0, 64),
        cropName: report.cropInfo.cropName.slice(0, 100),
        variety: report.cropInfo.variety.slice(0, 100),
        landAreaAcres: report.cropInfo.landAreaAcres,
        sowingDate: report.cropInfo.sowingDate.slice(0, 64),
        expectedHarvestDate: report.cropInfo.expectedHarvestDate.slice(0, 64),
        growthProgressPct: report.cropInfo.growthProgressPct,
        soilHealthScore: report.soilHealthReport.soilHealthScore,
        diseaseStatus: `${report.diseaseReport.pathogenDetected} (${report.diseaseReport.severity})`.slice(0, 200),
        aiSummary: report.aiHealthAnalysis.summary.slice(0, 1200),
        harvestQuantityQuintals: report.harvestAndQuality.harvestQuantityQuintals,
        qualityGrade: report.harvestAndQuality.cropQualityGrade.slice(0, 64),
        estimatedMarketPriceInr: report.financials.marketPricePerQuintalInr,
        totalExpensesInr: report.financials.totalCultivationExpensesInr,
        expectedRevenueInr: report.financials.expectedRevenueInr,
        estimatedProfitInr: report.financials.estimatedProfitInr,
        overallGrade: report.performance.overallGrade,
        overallRating: report.performance.overallRatingOutOf5,
        verificationCode: report.verification.verificationCode.slice(0, 40),
        farmerApprovedForBuyers: report.verification.farmerApprovedForBuyers,
        approvedAt: report.verification.approvedAt || new Date().toISOString(),
        reportSnapshot: JSON.parse(JSON.stringify(sanitizedReport)),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'cropReports', report.reportId), firestorePayload, { merge: true });
      syncedFirestore = true;
    } catch (err: any) {
      if (err?.message?.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.WRITE, reportPath);
      }
      console.warn('[CropReport] Firestore sync note:', err?.message || err);
    }
  }

  return { syncedApi, syncedFirestore };
}

export async function fetchApprovedReportsForBuyers(): Promise<DigitalCropReportCard[]> {
  const byId = new Map<string, DigitalCropReportCard>();

  try {
    const res = await fetch('/api/crop-reports?approvedOnly=true');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.reports)) {
        data.reports.forEach((r: DigitalCropReportCard) => {
          if (r.verification?.farmerApprovedForBuyers) {
            byId.set(r.reportId, r);
          }
        });
      }
    }
  } catch (err) {
    console.warn('[CropReport] API list fetch note:', err);
  }

  if (auth.currentUser) {
    const path = 'cropReports';
    try {
      const q = query(collection(db, path), where('farmerApprovedForBuyers', '==', true));
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data?.reportSnapshot) {
          byId.set(docSnap.id, data.reportSnapshot as DigitalCropReportCard);
        }
      });
    } catch (err: any) {
      if (err?.message?.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
      console.warn('[CropReport] Firestore buyer list note:', err?.message || err);
    }
  }

  return Array.from(byId.values());
}

export async function fetchSharedReportById(reportId: string): Promise<DigitalCropReportCard | null> {
  try {
    const res = await fetch(`/api/crop-reports/${encodeURIComponent(reportId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.report) return data.report as DigitalCropReportCard;
    }
  } catch {}

  const path = `cropReports/${reportId}`;
  try {
    const snap = await getDoc(doc(db, 'cropReports', reportId));
    if (snap.exists()) {
      const data = snap.data();
      if (data?.reportSnapshot) return data.reportSnapshot as DigitalCropReportCard;
    }
  } catch (err: any) {
    if (err?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }
  return null;
}

export async function requestAiCropHealthAnalysis(
  report: DigitalCropReportCard
): Promise<DigitalCropReportCard['aiHealthAnalysis']> {
  const res = await fetch('/api/crop-reports/ai-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cropName: report.cropInfo.cropName,
      variety: report.cropInfo.variety,
      areaAcres: report.cropInfo.landAreaAcres,
      stage: report.cropInfo.growthStage,
      progressPct: report.cropInfo.growthProgressPct,
      soilHealth: report.soilHealthReport,
      disease: report.diseaseReport,
      moisturePct: report.fertilizerAndIrrigation.soilMoisturePct,
      expectedYieldQuintals: report.harvestAndQuality.harvestQuantityQuintals,
    }),
  });
  if (!res.ok) {
    throw new Error('Could not generate AI crop health analysis.');
  }
  const data = await res.json();
  return data.analysis as DigitalCropReportCard['aiHealthAnalysis'];
}

export async function downloadCropReportPdf(report: DigitalCropReportCard, qrDataUrl?: string): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const checkPageBreak = (neededMm: number) => {
    if (y + neededMm > pageHeight - 16) {
      pdf.addPage();
      y = 14;
    }
  };

  // Header Banner (Forest Green)
  pdf.setFillColor(20, 83, 45);
  pdf.rect(margin, y, contentWidth, 28, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('KISHAN BHAI - DIGITAL CROP REPORT CARD', margin + 5, y + 10);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(209, 250, 229);
  pdf.text('"Every Crop Has a Journey. Every Farmer Has a Record."', margin + 5, y + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(
    `Report ID: ${report.reportId}  |  Crop ID: ${report.uniqueCropId}  |  Status: ${report.verification.status}`,
    margin + 5,
    y + 23
  );

  // QR Code inside header/right area
  const qr = qrDataUrl || (await generateQrCodeDataUrl(report.verification.verificationUrl));
  if (qr) {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(pageWidth - margin - 26, y + 2, 24, 24, 'F');
    pdf.addImage(qr, 'PNG', pageWidth - margin - 25, y + 3, 22, 22);
  }

  y += 33;

  // Section 1: Farmer & Crop Identity Box
  pdf.setDrawColor(20, 83, 45);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, y, contentWidth, 34);

  pdf.setTextColor(20, 83, 45);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('I. FARMER & CROP RECORD', margin + 4, y + 6);

  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  const col2X = margin + contentWidth / 2 + 2;

  pdf.text(`Farmer Name: ${report.farmerInfo.fullName} (${report.farmerInfo.kycVerified ? 'Verified' : 'Standard'})`, margin + 4, y + 13);
  pdf.text(`Location: ${report.farmerInfo.village}, ${report.farmerInfo.district}, ${report.farmerInfo.state}`, margin + 4, y + 19);
  pdf.text(`Unique Crop ID: ${report.uniqueCropId}`, margin + 4, y + 25);
  pdf.text(`Sowing Date: ${report.cropInfo.sowingDate}  |  Harvest: ${report.cropInfo.expectedHarvestDate}`, margin + 4, y + 31);

  pdf.text(`Crop & Variety: ${report.cropInfo.cropName} (${report.cropInfo.variety})`, col2X, y + 13);
  pdf.text(`Land Area: ${report.cropInfo.landAreaAcres} Acres (${report.cropInfo.landAreaHectares} Ha)`, col2X, y + 19);
  pdf.text(`Growth Stage: ${report.cropInfo.growthStage} (${report.cropInfo.growthProgressPct}%)`, col2X, y + 25);
  pdf.text(`Buyer Access: ${report.verification.farmerApprovedForBuyers ? 'Approved by Farmer' : 'Private'}`, col2X, y + 31);

  y += 40;

  // Section 2: Academic Performance Scorecard
  checkPageBreak(52);
  pdf.setTextColor(20, 83, 45);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(
    `II. PERFORMANCE REPORT CARD  —  Overall Grade: ${report.performance.overallGrade} (${report.performance.overallRatingOutOf5}/5.0 · ${report.performance.overallScorePct}%)`,
    margin,
    y + 4
  );
  y += 8;

  report.performance.subjects.forEach((subj) => {
    pdf.setFillColor(248, 250, 248);
    pdf.rect(margin, y, contentWidth, 9, 'F');
    pdf.setTextColor(28, 25, 23);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text(subj.subject, margin + 3, y + 5.8);

    // Progress bar
    const barX = margin + 78;
    const barW = 50;
    pdf.setFillColor(226, 232, 240);
    pdf.rect(barX, y + 3.2, barW, 3, 'F');
    pdf.setFillColor(22, 101, 52);
    pdf.rect(barX, y + 3.2, (barW * subj.scorePct) / 100, 3, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.text(`${subj.scorePct}/100  (${subj.grade})  [${subj.verification}]`, barX + barW + 4, y + 5.8);
    y += 10;
  });

  y += 4;

  // Section 3: Soil Health & Disease Report
  checkPageBreak(36);
  pdf.setDrawColor(203, 213, 225);
  const halfW = (contentWidth - 4) / 2;
  pdf.rect(margin, y, halfW, 32);
  pdf.rect(margin + halfW + 4, y, halfW, 32);

  pdf.setTextColor(20, 83, 45);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text(`III. SOIL HEALTH [${report.soilHealthReport.verification}]`, margin + 3, y + 6);
  pdf.text(`IV. DISEASE REPORT [${report.diseaseReport.verification}]`, margin + halfW + 7, y + 6);

  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Sample ID: ${report.soilHealthReport.sampleId}`, margin + 3, y + 12);
  pdf.text(`Score: ${report.soilHealthReport.soilHealthScore}/100 (${report.soilHealthReport.classification})`, margin + 3, y + 17);
  pdf.text(`pH: ${report.soilHealthReport.ph} (${report.soilHealthReport.phStatus})  |  OC: ${report.soilHealthReport.organicCarbonPct}%`, margin + 3, y + 22);
  pdf.text(`N-P-K: ${report.soilHealthReport.nitrogenKgHa} / ${report.soilHealthReport.phosphorusKgHa} / ${report.soilHealthReport.potassiumKgHa} kg/ha`, margin + 3, y + 27);

  pdf.text(`Condition: ${report.diseaseReport.pathogenDetected.slice(0, 42)}`, margin + halfW + 7, y + 12);
  pdf.text(`Severity: ${report.diseaseReport.severity} (${report.diseaseReport.confidencePct}% confidence)`, margin + halfW + 7, y + 17);
  pdf.text(`Risk Level: ${report.diseaseReport.activeRiskLevel}  |  Scans: ${report.diseaseReport.recentScansCount}`, margin + halfW + 7, y + 22);
  pdf.text(`Status: ${report.diseaseReport.treatmentStatus}`, margin + halfW + 7, y + 27);

  y += 38;

  // Section 4: AI Crop Health Analysis
  checkPageBreak(28);
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(187, 247, 208);
  pdf.rect(margin, y, contentWidth, 24, 'FD');
  pdf.setTextColor(20, 83, 45);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text(`V. AI CROP HEALTH ANALYSIS (Score: ${report.aiHealthAnalysis.healthScore}/100) [${report.aiHealthAnalysis.verification}]`, margin + 3, y + 6);
  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  const summaryLines = pdf.splitTextToSize(report.aiHealthAnalysis.summary, contentWidth - 8);
  pdf.text(summaryLines.slice(0, 3), margin + 3, y + 12);
  y += 29;

  // Section 5: Harvest, Quality & Financial Statement
  checkPageBreak(42);
  pdf.setDrawColor(20, 83, 45);
  pdf.rect(margin, y, contentWidth, 36);
  pdf.setTextColor(20, 83, 45);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text('VI. HARVEST, QUALITY GRADE & FINANCIAL STATEMENT', margin + 4, y + 6);

  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text(`Harvest Quantity: ${report.harvestAndQuality.harvestQuantityQuintals} Quintals [${report.harvestAndQuality.harvestVerification}]`, margin + 4, y + 13);
  pdf.text(`Quality Grade: ${report.harvestAndQuality.cropQualityGrade} [${report.harvestAndQuality.gradeVerification}]`, margin + 4, y + 19);
  pdf.text(`Market Price Est.: Rs. ${report.financials.marketPricePerQuintalInr.toLocaleString()}/Qtl [${report.financials.priceVerification}]`, margin + 4, y + 25);
  pdf.text(`Fertilizer & Irrigation Logs: ${report.fertilizerAndIrrigation.history.length} activities (${report.fertilizerAndIrrigation.soilMoisturePct}% moisture)`, margin + 4, y + 31);

  pdf.text(`Cultivation Expenses: Rs. ${report.financials.totalCultivationExpensesInr.toLocaleString()} [${report.financials.expenseVerification}]`, col2X, y + 13);
  pdf.text(`Expected Revenue: Rs. ${report.financials.expectedRevenueInr.toLocaleString()} [${report.financials.revenueVerification}]`, col2X, y + 19);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 83, 45);
  pdf.text(`Estimated Profit: Rs. ${report.financials.estimatedProfitInr.toLocaleString()} (${report.financials.roiPct}% ROI)`, col2X, y + 25);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Profit / Acre: Rs. ${report.financials.profitPerAcreInr.toLocaleString()}`, col2X, y + 31);

  y += 42;

  // Section 6: Recent Fertilizer & Irrigation History
  checkPageBreak(36);
  pdf.setTextColor(20, 83, 45);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text('VII. RECENT FERTILIZER & IRRIGATION LOGS', margin, y + 4);
  y += 7;

  report.fertilizerAndIrrigation.history.slice(0, 5).forEach((item) => {
    checkPageBreak(8);
    pdf.setTextColor(51, 65, 85);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const line = `${item.date}  |  [${item.category}]  ${item.title.slice(0, 58)}  —  Rs. ${item.expenseAmountInr}`;
    pdf.text(line, margin + 2, y + 4);
    y += 6;
  });

  // Verification Footer
  pdf.setDrawColor(203, 213, 225);
  pdf.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    `Verification Code: ${report.verification.verificationCode}  |  Generated: ${new Date(report.generatedAt).toLocaleDateString()}  |  Kishan Bhai Official Agricultural Record`,
    margin,
    pageHeight - 10
  );

  pdf.save(`KishanBhai-Crop-Report-${report.uniqueCropId}.pdf`);
}
