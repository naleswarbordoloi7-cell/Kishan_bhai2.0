import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Lock,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  UserCheck,
} from 'lucide-react';
import { DigitalCropReportCard, DataVerificationTag } from '../../shared/types';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import { useMarketStore } from '../store/marketStore';
import {
  buildDigitalCropReportCard,
  CropReportOverrides,
  downloadCropReportPdf,
  fetchApprovedReportsForBuyers,
  fetchSharedReportById,
  generateQrCodeDataUrl,
  loadReportOverridesMap,
  requestAiCropHealthAnalysis,
  saveCropReportOverride,
  syncReportToCloudAndApi,
} from '../services/cropReportService';
import { FARMER_DEFAULT_PORTRAIT, resolveCropPhoto } from '../utils/cropImages';
import { ReportActivityModal, ReportActivityPayload } from '../components/reports/ReportActivityModal';
import { ShareReportModal } from '../components/reports/ShareReportModal';

const SELECTED_REPORT_CROP_KEY = 'kb_selected_report_crop_id';

const VerificationStamp: React.FC<{ tag: DataVerificationTag; isHi?: boolean }> = ({ tag, isHi }) => {
  if (tag === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border border-[#166534]/40 bg-emerald-50 text-[#14532D] rounded-xs shrink-0">
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span>{isHi ? 'सत्यापित' : 'Verified'}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-700/35 bg-amber-50 text-amber-800 rounded-xs shrink-0">
      <Clock className="w-2.5 h-2.5" />
      <span>{isHi ? 'अनुमानित' : 'Estimated'}</span>
    </span>
  );
};

export const CropReportCardPage: React.FC = () => {
  const {
    crops,
    soilHealth,
    diseaseScans,
    diaryEntries,
    irrigationStatus,
    addDiaryEntry,
    updateCrop,
    addCropObservation,
    language,
    addToast,
    setCurrentView,
  } = useApp();

  const currentUser = useUserStore((s) => s.currentUser);
  const userRole = useUserStore((s) => s.userRole);
  const farmerProfile = useUserStore((s) => s.farmerProfile);
  const mandiPrices = useMarketStore((s) => s.mandiPrices);

  const isHi = language === 'hi';

  const urlParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);
  const sharedReportIdFromUrl = urlParams.get('report');

  const [viewMode, setViewMode] = useState<'farmer' | 'buyer'>(() => {
    if (sharedReportIdFromUrl) return 'buyer';
    return userRole === 'BUYER' ? 'buyer' : 'farmer';
  });

  const [selectedCropId, setSelectedCropId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_REPORT_CROP_KEY);
      if (saved && crops.some((c) => c.id === saved)) return saved;
    } catch {}
    return crops[0]?.id || '';
  });

  const [overridesMap, setOverridesMap] = useState<Record<string, CropReportOverrides>>(() =>
    loadReportOverridesMap()
  );

  // Buyer directory & shared verification link state
  const [approvedBuyerReports, setApprovedBuyerReports] = useState<DigitalCropReportCard[]>([]);
  const [selectedBuyerReportId, setSelectedBuyerReportId] = useState<string>(sharedReportIdFromUrl || '');
  const [sharedReportLookup, setSharedReportLookup] = useState<DigitalCropReportCard | null>(null);
  const [isLoadingBuyerReports, setIsLoadingBuyerReports] = useState<boolean>(false);

  // Modals & async statuses
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [farmerImgError, setFarmerImgError] = useState(false);
  const [cropImgError, setCropImgError] = useState(false);

  // Keep selectedCropId valid when crops change
  useEffect(() => {
    if (!selectedCropId && crops[0]?.id) {
      setSelectedCropId(crops[0].id);
    } else if (selectedCropId && !crops.some((c) => c.id === selectedCropId) && crops[0]?.id) {
      setSelectedCropId(crops[0].id);
    }
  }, [crops, selectedCropId]);

  const activeCrop = useMemo(
    () => crops.find((c) => c.id === selectedCropId) || crops[0] || null,
    [crops, selectedCropId]
  );

  // Build live farmer report card dynamically whenever crops, soilHealth, diseaseScans, diaryEntries, irrigationStatus, or overrides change
  const farmerReport: DigitalCropReportCard | null = useMemo(() => {
    if (!activeCrop) return null;
    return buildDigitalCropReportCard({
      crop: activeCrop,
      currentUser,
      farmerProfile,
      soilHealth,
      diseaseScans,
      diaryEntries,
      irrigationStatus,
      mandiPrices,
      override: overridesMap[activeCrop.id],
    });
  }, [
    activeCrop,
    currentUser,
    farmerProfile,
    soilHealth,
    diseaseScans,
    diaryEntries,
    irrigationStatus,
    mandiPrices,
    overridesMap,
  ]);

  // Load buyer-approved reports & specific shared QR link report
  useEffect(() => {
    let active = true;
    const loadBuyerView = async () => {
      setIsLoadingBuyerReports(true);
      try {
        const list = await fetchApprovedReportsForBuyers();
        if (!active) return;
        setApprovedBuyerReports(list);

        if (sharedReportIdFromUrl) {
          const foundInList = list.find(
            (r) => r.reportId === sharedReportIdFromUrl || r.uniqueCropId === sharedReportIdFromUrl
          );
          if (foundInList) {
            setSharedReportLookup(foundInList);
            setSelectedBuyerReportId(foundInList.reportId);
          } else {
            const direct = await fetchSharedReportById(sharedReportIdFromUrl);
            if (active && direct) {
              setSharedReportLookup(direct);
              setSelectedBuyerReportId(direct.reportId);
            }
          }
        } else if (!selectedBuyerReportId && list[0]) {
          setSelectedBuyerReportId(list[0].reportId);
        }
      } finally {
        if (active) setIsLoadingBuyerReports(false);
      }
    };

    loadBuyerView();
    return () => {
      active = false;
    };
  }, [viewMode, sharedReportIdFromUrl]);

  // Publish farmer's active crop report snapshot when auto-generated or updated (so buyers see fresh farmer-approved data)
  useEffect(() => {
    if (!farmerReport || viewMode !== 'farmer') return;
    const timer = setTimeout(() => {
      syncReportToCloudAndApi(farmerReport).catch(() => {});
    }, 450);
    return () => clearTimeout(timer);
  }, [
    farmerReport?.reportId,
    farmerReport?.lastUpdatedAt,
    farmerReport?.verification.farmerApprovedForBuyers,
    farmerReport?.fertilizerAndIrrigation.history.length,
    farmerReport?.harvestAndQuality.harvestQuantityQuintals,
    farmerReport?.harvestAndQuality.cropQualityGrade,
    farmerReport?.aiHealthAnalysis.analyzedAt,
    viewMode,
  ]);

  // Resolve active displayed report depending on Farmer vs Buyer view
  const activeBuyerReport: DigitalCropReportCard | null = useMemo(() => {
    if (sharedReportIdFromUrl && sharedReportLookup) return sharedReportLookup;
    return (
      approvedBuyerReports.find((r) => r.reportId === selectedBuyerReportId) ||
      approvedBuyerReports[0] ||
      null
    );
  }, [sharedReportIdFromUrl, sharedReportLookup, approvedBuyerReports, selectedBuyerReportId]);

  const displayedReport = viewMode === 'farmer' ? farmerReport : activeBuyerReport;

  // Generate QR code whenever displayed report URL changes
  useEffect(() => {
    if (!displayedReport) return;
    setFarmerImgError(false);
    setCropImgError(false);
    generateQrCodeDataUrl(displayedReport.verification.verificationUrl)
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [displayedReport?.reportId, displayedReport?.verification.verificationUrl]);

  const handleSelectCrop = (cropId: string) => {
    setSelectedCropId(cropId);
    try {
      localStorage.setItem(SELECTED_REPORT_CROP_KEY, cropId);
    } catch {}
  };

  const handleToggleBuyerApproval = async (approved: boolean) => {
    if (!activeCrop || !farmerReport) return;
    const nextOverrides = saveCropReportOverride(activeCrop.id, {
      farmerApprovedForBuyers: approved,
      approvedAt: new Date().toISOString(),
      approvedNote: approved
        ? 'Approved by farmer for verified buyer inspection'
        : 'Marked private by farmer',
    });
    setOverridesMap(nextOverrides);
    const updatedReport = buildDigitalCropReportCard({
      crop: activeCrop,
      currentUser,
      farmerProfile,
      soilHealth,
      diseaseScans,
      diaryEntries,
      irrigationStatus,
      mandiPrices,
      override: nextOverrides[activeCrop.id],
    });
    await syncReportToCloudAndApi(updatedReport);
    addToast(
      approved ? (isHi ? 'खरीदारों के लिए स्वीकृत' : 'Approved for Buyers') : (isHi ? 'रिपोर्ट निजी की गई' : 'Marked Private'),
      approved
        ? 'Verified buyers can now inspect this crop report card.'
        : 'Buyer access revoked for this crop report card.',
      'success'
    );
  };

  const handleRefreshAiAnalysis = async () => {
    if (!activeCrop || !farmerReport) return;
    setIsRefreshingAi(true);
    try {
      const aiResult = await requestAiCropHealthAnalysis(farmerReport);
      const nextOverrides = saveCropReportOverride(activeCrop.id, {
        aiHealthAnalysis: aiResult,
      });
      setOverridesMap(nextOverrides);
      addToast(
        isHi ? 'AI विश्लेषण अपडेट हुआ' : 'AI Crop Health Analysis Updated',
        `Score: ${aiResult.healthScore}/100 · Insights refreshed from live farm telemetry.`,
        'success'
      );
    } catch {
      addToast('AI Analysis Error', 'Unable to refresh AI analysis right now.', 'error');
    } finally {
      setIsRefreshingAi(false);
    }
  };

  const handleActivitySubmit = async (
    payload: ReportActivityPayload,
    overridePatch?: CropReportOverrides
  ) => {
    if (!activeCrop) return;

    const categoryMap: Record<ReportActivityPayload['activityType'], string> = {
      Fertilizer: 'Fertilizer',
      Irrigation: 'Irrigation',
      Micronutrient: 'Fertilizer',
      Pesticide: 'Pesticide',
      Observation: 'General',
      HarvestUpdate: 'Harvest',
    };

    if (payload.activityType === 'Observation') {
      addCropObservation(activeCrop.id, {
        text: `${payload.title}${payload.notes ? ` — ${payload.notes}` : ''}`,
        category: 'Field Observation',
      });
    } else {
      addDiaryEntry({
        date: payload.date,
        category: categoryMap[payload.activityType],
        crop: activeCrop.cropName,
        title: payload.title,
        quantityOrDose: payload.quantityOrDose,
        expenseAmountInr: payload.expenseAmountInr,
        notes: payload.notes || `Logged directly into Digital Crop Report Card (${farmerReport?.uniqueCropId || activeCrop.id})`,
      });
    }

    // Update crop lifecycle status and recent action
    const cropUpdates: Partial<typeof activeCrop> = {
      recentAction: `${payload.title} (${payload.date})`,
    };
    if (payload.growthProgressPct !== undefined) {
      cropUpdates.stageProgressPct = payload.growthProgressPct;
    }
    if (payload.growthStage) {
      cropUpdates.stage = payload.growthStage;
    }
    if (payload.harvestQuantityQuintals !== undefined) {
      cropUpdates.expectedYieldQuintals = payload.harvestQuantityQuintals;
    }
    updateCrop(activeCrop.id, cropUpdates);

    if (overridePatch) {
      const nextOverrides = saveCropReportOverride(activeCrop.id, overridePatch);
      setOverridesMap(nextOverrides);
    }

    addToast(
      isHi ? 'रिपोर्ट कार्ड स्वतः अपडेट हो गया' : 'Report Card Updated Automatically',
      'New farming activity synced with your Digital Crop Report Card.',
      'success'
    );
  };

  const handleDownloadPdf = async () => {
    if (!displayedReport) return;
    setIsExportingPdf(true);
    try {
      await downloadCropReportPdf(displayedReport, qrDataUrl);
      addToast(
        isHi ? 'PDF डाउनलोड पूर्ण' : 'Report Card PDF Downloaded',
        `Saved KishanBhai-Crop-Report-${displayedReport.uniqueCropId}.pdf`,
        'success'
      );
    } catch (err: any) {
      addToast('PDF Export Error', err?.message || 'Could not generate PDF.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const resolvedFarmerPhoto =
    displayedReport?.farmerInfo.photoUrl && !displayedReport.farmerInfo.photoUrl.startsWith('/crop-')
      ? displayedReport.farmerInfo.photoUrl
      : FARMER_DEFAULT_PORTRAIT;

  const resolvedCropPhoto = displayedReport
    ? resolveCropPhoto(displayedReport.cropInfo.cropName, displayedReport.cropInfo.cropPhotoUrl)
    : FARMER_DEFAULT_PORTRAIT;

  // Enforce farmer approval rule in Buyer mode
  const isBuyerBlocked =
    viewMode === 'buyer' &&
    displayedReport &&
    !displayedReport.verification.farmerApprovedForBuyers;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Control Toolbar — Hidden when printing */}
      <div className="print:hidden bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* View Mode Switcher (Farmer vs Buyer Directory) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('farmer')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'farmer'
                    ? 'bg-[#14532D] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isHi ? 'मेरे फसल रिपोर्ट कार्ड' : 'Farmer Report Cards'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('buyer')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'buyer'
                    ? 'bg-[#14532D] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isHi ? 'खरीदार-स्वीकृत रिपोर्ट' : 'Buyer Inspection View'}</span>
              </button>
            </div>

            {viewMode === 'farmer' && crops.length > 0 && (
              <select
                value={activeCrop?.id || ''}
                onChange={(e) => handleSelectCrop(e.target.value)}
                aria-label="Select Crop for Report Card"
                className="max-w-full min-w-0 box-border px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#14532D] cursor-pointer"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cropName} ({c.variety}) · {c.areaAcres} Acres
                  </option>
                ))}
              </select>
            )}

            {viewMode === 'buyer' && approvedBuyerReports.length > 0 && (
              <select
                value={activeBuyerReport?.reportId || ''}
                onChange={(e) => {
                  setSharedReportLookup(null);
                  setSelectedBuyerReportId(e.target.value);
                }}
                aria-label="Select Farmer-Approved Crop Report"
                className="max-w-full min-w-0 box-border px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#14532D] cursor-pointer"
              >
                {approvedBuyerReports.map((r) => (
                  <option key={r.reportId} value={r.reportId}>
                    {r.farmerInfo.fullName} — {r.cropInfo.cropName} ({r.uniqueCropId})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'farmer' && farmerReport && (
              <>
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#14532D] hover:bg-[#0F3F22] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isHi ? 'गतिविधि जोड़ें' : 'Record Activity'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefreshAiAnalysis}
                  disabled={isRefreshingAi}
                  className="px-3 py-2 rounded-lg border border-emerald-700/30 bg-emerald-50 hover:bg-emerald-100 text-[#14532D] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAi ? 'animate-spin' : ''}`} />
                  <span>{isHi ? 'AI विश्लेषण' : 'Refresh AI'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleToggleBuyerApproval(!farmerReport.verification.farmerApprovedForBuyers)
                  }
                  className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    farmerReport.verification.farmerApprovedForBuyers
                      ? 'border-emerald-700/40 bg-emerald-50 text-[#14532D]'
                      : 'border-stone-300 bg-stone-50 text-stone-700'
                  }`}
                >
                  {farmerReport.verification.farmerApprovedForBuyers ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {farmerReport.verification.farmerApprovedForBuyers
                      ? isHi
                        ? 'खरीदार स्वीकृत'
                        : 'Buyer Approved'
                      : isHi
                      ? 'निजी ड्राफ्ट'
                      : 'Private'}
                  </span>
                </button>
              </>
            )}

            {displayedReport && (
              <>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#14532D]" />
                  <span>{isHi ? 'शेयर व QR' : 'Share Report'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-[#14532D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Generating...' : isHi ? 'PDF डाउनलोड' : 'Download PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold hidden sm:flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Print Official Report Card"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isHi ? 'प्रिंट' : 'Print'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Empty or Loading State for Buyer View */}
      {viewMode === 'buyer' && isLoadingBuyerReports && !displayedReport && (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-[#14532D] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-700">
            Loading farmer-approved Digital Crop Report Cards...
          </p>
        </div>
      )}

      {viewMode === 'buyer' && !isLoadingBuyerReports && !displayedReport && (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-3">
          <Lock className="w-8 h-8 text-stone-400 mx-auto" />
          <h2 className="text-lg font-bold text-stone-900 font-display">
            No Farmer-Approved Reports Available
          </h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Farmers control report visibility. Approve a crop report card in Farmer View or scan a valid verification QR link.
          </p>
        </div>
      )}

      {/* Buyer Blocked State if Farmer Revoked Approval */}
      {isBuyerBlocked && displayedReport && (
        <div className="bg-white border-2 border-amber-700/40 rounded-xl p-10 text-center space-y-3">
          <Lock className="w-9 h-9 text-amber-700 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900 font-display">
            Farmer Approval Required for Buyer Viewing
          </h2>
          <p className="text-sm text-stone-600 max-w-lg mx-auto">
            Crop Record <strong className="font-mono">{displayedReport.uniqueCropId}</strong> is currently marked private by the farmer. Only farmer-approved crop report cards are visible to external buyers.
          </p>
        </div>
      )}

      {/* ===================================================================== */}
      {/* OFFICIAL DIGITAL CROP REPORT CARD SHEET (SCHOOL-GRADE ARCHIVAL LEDGER)*/}
      {/* ===================================================================== */}
      {displayedReport && !isBuyerBlocked && (
        <article
          id="official-digital-crop-report-card"
          className="bg-white text-stone-900 border-2 border-[#14532D] shadow-lg overflow-hidden print:shadow-none print:border-[#14532D]"
        >
          {/* OFFICIAL CERTIFICATE HEADER */}
          <header className="bg-[#14532D] text-white px-5 sm:px-8 py-6 border-b-4 border-emerald-300/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-emerald-200">
                  <span>Official Agricultural Performance Dossier</span>
                  <span aria-hidden="true">·</span>
                  <span>{displayedReport.seasonLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="px-1.5 py-0.5 bg-white/15 border border-emerald-200/30 text-white font-bold">
                    {displayedReport.verification.status === 'VERIFIED'
                      ? 'DIGITAL VERIFICATION: VERIFIED'
                      : 'DIGITAL VERIFICATION: PROVISIONAL'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight text-white font-display leading-tight">
                  KISHAN BHAI – DIGITAL CROP REPORT CARD
                </h1>

                <p className="text-sm italic text-emerald-100/95 font-display">
                  "Every Crop Has a Journey. Every Farmer Has a Record."
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-emerald-100/90 tabular-nums">
                  <span>Report No: {displayedReport.reportId}</span>
                  <span aria-hidden="true">·</span>
                  <span>Unique Crop ID: <strong className="text-white">{displayedReport.uniqueCropId}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Verify Code: <strong className="text-white">{displayedReport.verification.verificationCode}</strong></span>
                </div>
              </div>

              {/* QR Verification Card inside Header */}
              <div className="flex items-center gap-3.5 bg-white text-stone-900 p-2.5 rounded-lg border border-emerald-200 shrink-0 self-start md:self-auto">
                <div className="w-20 h-20 bg-white flex items-center justify-center shrink-0">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${displayedReport.uniqueCropId}`}
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    <QrCode className="w-12 h-12 text-[#14532D]" />
                  )}
                </div>
                <div className="text-[11px] leading-tight space-y-1 pr-1">
                  <div className="font-bold uppercase tracking-wider text-[#14532D] font-mono">
                    Scan to Verify
                  </div>
                  <div className="font-mono font-bold text-stone-900 tabular-nums">
                    {displayedReport.verification.verificationCode}
                  </div>
                  <div className="text-stone-600">
                    {displayedReport.verification.farmerApprovedForBuyers
                      ? 'Buyer Access: Approved'
                      : 'Buyer Access: Private'}
                  </div>
                  <div className="text-[10px] font-mono text-stone-500 tabular-nums">
                    {displayedReport.verification.verifiedRecordsCount} Verified ·{' '}
                    {displayedReport.verification.estimatedRecordsCount} Est.
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* SECTION I: FARMER & CROP REGISTRATION IDENTITY (Sections 1 to 6) */}
          <section className="p-5 sm:p-7 border-b border-stone-200 bg-emerald-50/25">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#14532D]/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#14532D] font-display">
                Section I — Farmer Identity, Crop Registration & Lifecycle Progress
              </h2>
              <span className="text-xs font-mono text-stone-600 tabular-nums">
                Updated: {new Date(displayedReport.lastUpdatedAt).toLocaleDateString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* 1. Farmer Information + Photograph */}
              <div className="lg:col-span-5 bg-white border border-stone-200 rounded-lg p-4 flex flex-col justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-24 rounded-md overflow-hidden border border-[#14532D]/30 bg-emerald-950/10 shrink-0 flex items-center justify-center">
                    {!farmerImgError ? (
                      <img
                        src={resolvedFarmerPhoto}
                        alt={displayedReport.farmerInfo.fullName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => setFarmerImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#14532D] to-emerald-700 text-white font-display font-bold text-xl flex items-center justify-center">
                        {displayedReport.farmerInfo.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                        1. Farmer Information
                      </span>
                      <VerificationStamp
                        tag={displayedReport.farmerInfo.kycVerified ? 'VERIFIED' : 'ESTIMATED'}
                        isHi={isHi}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 font-display truncate">
                      {displayedReport.farmerInfo.fullName}
                    </h3>
                    <p className="text-xs text-stone-700">
                      {displayedReport.farmerInfo.village}, {displayedReport.farmerInfo.district},{' '}
                      {displayedReport.farmerInfo.state}
                    </p>
                    <p className="text-xs font-mono text-stone-500">
                      ID: {displayedReport.farmerInfo.farmerId}
                    </p>
                  </div>
                </div>

                {/* 2. Unique Crop ID & Status Strip */}
                <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[11px] text-stone-500 font-medium">2. Unique Crop ID</div>
                    <div className="font-mono font-bold text-[#14532D] tabular-nums mt-0.5">
                      {displayedReport.uniqueCropId}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-500 font-medium">Digital Status</div>
                    <div className="font-semibold text-stone-900 mt-0.5 flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#14532D]" />
                      <span>
                        {displayedReport.verification.status === 'VERIFIED'
                          ? 'Digitally Verified'
                          : 'Provisional Record'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3, 4, 5, 6. Crop Name/Variety, Land Area, Dates, Growth Progress + Crop Photo */}
              <div className="lg:col-span-7 bg-white border border-stone-200 rounded-lg p-4 flex flex-col justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-full sm:w-32 h-24 rounded-md overflow-hidden border border-[#14532D]/30 bg-emerald-950/10 shrink-0 flex items-center justify-center">
                    {!cropImgError ? (
                      <img
                        src={resolvedCropPhoto}
                        alt={displayedReport.cropInfo.cropName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => setCropImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-emerald-600 text-white flex items-center justify-center">
                        <Sprout className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 text-xs">
                    <div className="col-span-2 sm:col-span-2">
                      <div className="text-[11px] text-stone-500 font-medium">
                        3. Crop Name & Variety
                      </div>
                      <div className="text-base font-bold text-stone-900 font-display">
                        {displayedReport.cropInfo.cropName}{' '}
                        <span className="text-xs font-sans font-semibold text-[#14532D]">
                          ({displayedReport.cropInfo.variety})
                        </span>
                      </div>
                      {displayedReport.cropInfo.hindiName && (
                        <div className="text-[11px] text-stone-500">
                          {displayedReport.cropInfo.hindiName}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] text-stone-500 font-medium">4. Land Area</div>
                      <div className="font-bold text-stone-900 tabular-nums mt-0.5">
                        {displayedReport.cropInfo.landAreaAcres} Acres
                      </div>
                      <div className="text-[11px] font-mono text-stone-500 tabular-nums">
                        ({displayedReport.cropInfo.landAreaHectares} Ha)
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-stone-500 font-medium">5. Sowing Date</div>
                      <div className="font-mono font-bold text-stone-900 tabular-nums mt-0.5">
                        {displayedReport.cropInfo.sowingDate}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-stone-500 font-medium">Harvest Date</div>
                      <div className="font-mono font-bold text-stone-900 tabular-nums mt-0.5">
                        {displayedReport.cropInfo.actualHarvestDate ||
                          displayedReport.cropInfo.expectedHarvestDate}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-stone-500 font-medium">Cycle Duration</div>
                      <div className="font-mono font-semibold text-stone-800 tabular-nums mt-0.5">
                        Day {displayedReport.cropInfo.daysElapsed} /{' '}
                        {displayedReport.cropInfo.totalCycleDays}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Crop Growth Progress Bar */}
                <div className="pt-3 border-t border-stone-100 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-stone-700">
                      6. Crop Growth Progress —{' '}
                      <strong className="text-[#14532D]">
                        {displayedReport.cropInfo.growthStage}
                      </strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#14532D] tabular-nums">
                        {displayedReport.cropInfo.growthProgressPct}% Complete
                      </span>
                      <VerificationStamp tag="VERIFIED" isHi={isHi} />
                    </div>
                  </div>
                  <div className="w-full h-3 bg-stone-100 border border-stone-200 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#14532D] to-emerald-600 transition-all duration-500"
                      style={{ width: `${displayedReport.cropInfo.growthProgressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION II: VISUAL PERFORMANCE & SCHOOL-STYLE ACADEMIC SCORECARD */}
          <section className="p-5 sm:p-7 border-b border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-5 border-b border-[#14532D]/20">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#14532D]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#14532D] font-display">
                  Section II — Agricultural Performance Evaluation & Grade Card
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-600">
                5-Point Agronomic Assessment Rubric
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Overall Grade Stamp Box */}
              <div className="lg:col-span-4 border-2 border-[#14532D] bg-emerald-50/40 rounded-lg p-5 flex flex-col justify-between text-center">
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#14532D] font-bold">
                  Overall Crop Performance Grade
                </div>

                <div className="my-4 space-y-1">
                  <div className="text-5xl font-black font-display text-[#14532D] tracking-tight tabular-nums">
                    {displayedReport.performance.overallGrade}
                  </div>
                  <div className="text-sm font-mono font-bold text-stone-800 tabular-nums">
                    Rating: {displayedReport.performance.overallRatingOutOf5} / 5.0 ·{' '}
                    {displayedReport.performance.overallScorePct}%
                  </div>
                </div>

                {/* Rating Scale Bar */}
                <div className="space-y-1.5 text-left">
                  <div className="w-full h-2.5 bg-white border border-[#14532D]/30 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-[#14532D] transition-all duration-500"
                      style={{ width: `${displayedReport.performance.overallScorePct}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed pt-1">
                    <strong>Evaluator Remarks:</strong> {displayedReport.performance.remarks}
                  </p>
                </div>
              </div>

              {/* Subject-by-Subject Progress Bars & Grades */}
              <div className="lg:col-span-8 border border-stone-200 rounded-lg overflow-hidden">
                <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 grid grid-cols-12 text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600">
                  <div className="col-span-5">Evaluation Subject</div>
                  <div className="col-span-4">Score Progress</div>
                  <div className="col-span-1 text-center">Grade</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                <div className="divide-y divide-stone-200">
                  {displayedReport.performance.subjects.map((subj) => (
                    <div
                      key={subj.id}
                      className="px-4 py-3 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center bg-white hover:bg-emerald-50/20 transition-colors"
                    >
                      <div className="sm:col-span-5">
                        <div className="text-xs font-bold text-stone-900">
                          {isHi ? subj.subjectHi : subj.subject}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{subj.detailNote}</div>
                      </div>

                      <div className="sm:col-span-4 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                          <span className="font-semibold text-[#14532D]">{subj.ratingText}</span>
                          <span className="font-bold text-stone-900">{subj.scorePct}/100</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-sm overflow-hidden border border-stone-200">
                          <div
                            className={`h-full transition-all duration-500 ${
                              subj.scorePct >= 85
                                ? 'bg-[#14532D]'
                                : subj.scorePct >= 72
                                ? 'bg-emerald-600'
                                : 'bg-amber-600'
                            }`}
                            style={{ width: `${subj.scorePct}%` }}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex sm:justify-center">
                        <span className="font-display font-bold text-base text-[#14532D] tabular-nums">
                          {subj.grade}
                        </span>
                      </div>

                      <div className="sm:col-span-2 flex sm:justify-end">
                        <VerificationStamp tag={subj.verification} isHi={isHi} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION III: 7. SOIL HEALTH REPORT & 8. CROP DISEASE REPORT */}
          <section className="p-5 sm:p-7 border-b border-stone-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7. Soil Health Report */}
            <div className="border border-stone-200 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-emerald-50/60 px-4 py-3 border-b border-stone-200 flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#14532D] font-display">
                  7. Soil Health Report
                </h3>
                <VerificationStamp tag={displayedReport.soilHealthReport.verification} isHi={isHi} />
              </div>
              <div className="p-4 space-y-3 text-xs flex-1">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <span className="text-stone-500">Lab Sample ID:</span>{' '}
                    <span className="font-mono font-bold text-stone-900">
                      {displayedReport.soilHealthReport.sampleId}
                    </span>
                  </div>
                  <div className="font-mono text-stone-600 tabular-nums">
                    Test: {displayedReport.soilHealthReport.testDate}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-stone-50 border border-stone-200/70 rounded">
                    <div className="text-[11px] text-stone-500">Soil Score</div>
                    <div className="text-base font-bold text-[#14532D] font-mono tabular-nums">
                      {displayedReport.soilHealthReport.soilHealthScore}/100
                    </div>
                    <div className="text-[10px] text-stone-600">
                      {displayedReport.soilHealthReport.classification}
                    </div>
                  </div>
                  <div className="p-2.5 bg-stone-50 border border-stone-200/70 rounded">
                    <div className="text-[11px] text-stone-500">Soil pH & OC</div>
                    <div className="text-base font-bold text-stone-900 font-mono tabular-nums">
                      {displayedReport.soilHealthReport.ph} · {displayedReport.soilHealthReport.organicCarbonPct}%
                    </div>
                    <div className="text-[10px] text-stone-600">
                      {displayedReport.soilHealthReport.phStatus}
                    </div>
                  </div>
                  <div className="p-2.5 bg-stone-50 border border-stone-200/70 rounded col-span-2 sm:col-span-1">
                    <div className="text-[11px] text-stone-500">Soil Texture</div>
                    <div className="text-xs font-bold text-stone-900 mt-0.5 leading-snug">
                      {displayedReport.soilHealthReport.soilType}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 border border-stone-200 rounded">
                    <div className="text-[10px] font-mono text-stone-500 uppercase">Nitrogen (N)</div>
                    <div className="font-mono font-bold text-stone-900 tabular-nums mt-0.5">
                      {displayedReport.soilHealthReport.nitrogenKgHa} kg/ha
                    </div>
                  </div>
                  <div className="p-2 border border-stone-200 rounded">
                    <div className="text-[10px] font-mono text-stone-500 uppercase">Phosphorus (P)</div>
                    <div className="font-mono font-bold text-stone-900 tabular-nums mt-0.5">
                      {displayedReport.soilHealthReport.phosphorusKgHa} kg/ha
                    </div>
                  </div>
                  <div className="p-2 border border-stone-200 rounded">
                    <div className="text-[10px] font-mono text-stone-500 uppercase">Potassium (K)</div>
                    <div className="font-mono font-bold text-stone-900 tabular-nums mt-0.5">
                      {displayedReport.soilHealthReport.potassiumKgHa} kg/ha
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Crop Disease Report */}
            <div className="border border-stone-200 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-emerald-50/60 px-4 py-3 border-b border-stone-200 flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#14532D] font-display">
                  8. Crop Disease & Pest Health Report
                </h3>
                <VerificationStamp tag={displayedReport.diseaseReport.verification} isHi={isHi} />
              </div>
              <div className="p-4 space-y-3 text-xs flex-1">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <span className="text-stone-500">Latest Scan:</span>{' '}
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      {displayedReport.diseaseReport.latestScanDate}
                    </span>
                  </div>
                  <div className="font-mono text-stone-600 tabular-nums">
                    Scans Logged: {displayedReport.diseaseReport.recentScansCount}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-stone-500">Pathogen / Condition Findings</div>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {displayedReport.diseaseReport.pathogenDetected}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-stone-50 border border-stone-200/70 rounded">
                    <div className="text-[10px] text-stone-500">Severity</div>
                    <div
                      className={`font-mono font-bold mt-0.5 ${
                        displayedReport.diseaseReport.severity === 'HIGH'
                          ? 'text-rose-700'
                          : displayedReport.diseaseReport.severity === 'MEDIUM'
                          ? 'text-amber-700'
                          : 'text-[#14532D]'
                      }`}
                    >
                      {displayedReport.diseaseReport.severity}
                    </div>
                  </div>
                  <div className="p-2 bg-stone-50 border border-stone-200/70 rounded">
                    <div className="text-[10px] text-stone-500">Confidence</div>
                    <div className="font-mono font-bold text-stone-900 tabular-nums mt-0.5">
                      {displayedReport.diseaseReport.confidencePct}%
                    </div>
                  </div>
                  <div className="p-2 bg-stone-50 border border-stone-200/70 rounded">
                    <div className="text-[10px] text-stone-500">Risk Level</div>
                    <div className="font-mono font-bold text-stone-900 mt-0.5">
                      {displayedReport.diseaseReport.activeRiskLevel}
                    </div>
                  </div>
                </div>

                <div className="pt-1 space-y-1 text-stone-700">
                  <div>
                    <strong>Treatment Protocol:</strong> {displayedReport.diseaseReport.treatmentStatus}
                  </div>
                  <div>
                    <strong>Pest Watchlist:</strong>{' '}
                    {displayedReport.diseaseReport.pestWatchlist.join(', ') || 'Routine Monitoring'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION IV: 9. FERTILIZER & IRRIGATION HISTORY + 10. AI CROP HEALTH ANALYSIS */}
          <section className="p-5 sm:p-7 border-b border-stone-200 space-y-6">
            {/* 9. Fertilizer & Irrigation History */}
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <div className="bg-emerald-50/60 px-4 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#14532D] font-display">
                    9. Fertilizer & Irrigation Activity History
                  </h3>
                  <div className="text-[11px] font-mono text-stone-600 mt-0.5 tabular-nums">
                    {displayedReport.fertilizerAndIrrigation.irrigationEventsCount} Irrigation Events ·{' '}
                    {displayedReport.fertilizerAndIrrigation.fertilizerApplicationsCount} Nutrient Applications ·{' '}
                    Soil Moisture: {displayedReport.fertilizerAndIrrigation.soilMoisturePct}% ·{' '}
                    Water Saved: {displayedReport.fertilizerAndIrrigation.waterSavedLitres.toLocaleString('en-IN')} L
                  </div>
                </div>
                <VerificationStamp tag={displayedReport.fertilizerAndIrrigation.verification} isHi={isHi} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-mono uppercase text-stone-600">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Operation & Dosage</th>
                      <th className="py-2.5 px-4 text-right">Expense (₹)</th>
                      <th className="py-2.5 px-4 text-right">Record Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {displayedReport.fertilizerAndIrrigation.history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-5 px-4 text-center text-stone-500">
                          No field operations recorded yet. Click "Record Activity" to log fertilizer or irrigation events.
                        </td>
                      </tr>
                    ) : (
                      displayedReport.fertilizerAndIrrigation.history.slice(0, 8).map((act) => (
                        <tr key={act.id} className="hover:bg-stone-50/70">
                          <td className="py-2.5 px-4 font-mono text-stone-700 tabular-nums whitespace-nowrap">
                            {act.date}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-[#14532D] whitespace-nowrap">
                            {act.category}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-stone-900">{act.title}</div>
                            {act.quantityOrDose && (
                              <div className="text-[11px] text-stone-500">{act.quantityOrDose}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900 tabular-nums whitespace-nowrap">
                            {act.expenseAmountInr > 0
                              ? `₹${act.expenseAmountInr.toLocaleString('en-IN')}`
                              : '—'}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <VerificationStamp tag={act.verification} isHi={isHi} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 10. AI Crop Health Analysis */}
            <div className="border border-[#14532D]/30 bg-emerald-50/35 rounded-lg p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#14532D]/15">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#14532D]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#14532D] font-display">
                    10. AI Crop Health Analysis
                  </h3>
                  <span className="text-xs font-mono font-bold text-stone-900 tabular-nums">
                    · Health Index: {displayedReport.aiHealthAnalysis.healthScore}/100
                  </span>
                </div>
                <VerificationStamp tag={displayedReport.aiHealthAnalysis.verification} isHi={isHi} />
              </div>

              <p className="text-sm text-stone-800 leading-relaxed">
                {displayedReport.aiHealthAnalysis.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
                <div className="bg-white border border-emerald-200/80 rounded p-3.5 space-y-1.5">
                  <div className="font-bold text-[#14532D] uppercase tracking-wider text-[11px]">
                    Observed Crop Strengths
                  </div>
                  <ul className="space-y-1 text-stone-700 list-disc list-inside">
                    {displayedReport.aiHealthAnalysis.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-stone-200 rounded p-3.5 space-y-1.5">
                  <div className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                    Agronomist Next-Step Recommendations
                  </div>
                  <ul className="space-y-1 text-stone-700 list-disc list-inside">
                    {displayedReport.aiHealthAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION V: 11-16 HARVEST QUANTITY, QUALITY GRADE & FINANCIAL STATEMENT */}
          <section className="p-5 sm:p-7 border-b border-stone-200 bg-stone-50/40">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#14532D]/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#14532D] font-display">
                Section V — Harvest Output, Quality Grading & Financial Ledger (Items 11–16)
              </h2>
              <span className="text-xs font-mono text-stone-600">
                Verified vs. Estimated Clearly Demarcated
              </span>
            </div>

            {/* 6 Structured Ledger Cards for 11..16 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 11. Harvest Quantity */}
              <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase text-stone-500 font-semibold">
                    11. Harvest Quantity
                  </span>
                  <VerificationStamp
                    tag={displayedReport.harvestAndQuality.harvestVerification}
                    isHi={isHi}
                  />
                </div>
                <div className="text-2xl font-bold text-stone-900 font-display tabular-nums">
                  {displayedReport.harvestAndQuality.harvestQuantityQuintals} Quintals
                </div>
                <div className="text-xs font-mono text-stone-600 tabular-nums">
                  {displayedReport.harvestAndQuality.harvestQuantityKg.toLocaleString('en-IN')} Kg Total Output
                </div>
              </div>

              {/* 12. Crop Quality Grade */}
              <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase text-stone-500 font-semibold">
                    12. Crop Quality Grade
                  </span>
                  <VerificationStamp
                    tag={displayedReport.harvestAndQuality.gradeVerification}
                    isHi={isHi}
                  />
                </div>
                <div className="text-2xl font-bold text-[#14532D] font-display">
                  {displayedReport.harvestAndQuality.cropQualityGrade}
                </div>
                <div className="text-xs font-mono text-stone-600 tabular-nums">
                  Purity: {displayedReport.harvestAndQuality.purityScorePct}% · Moisture:{' '}
                  {displayedReport.harvestAndQuality.moisturePct}%
                </div>
              </div>

              {/* 13. Market Price Estimation */}
              <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase text-stone-500 font-semibold">
                    13. Market Price Estimation
                  </span>
                  <VerificationStamp
                    tag={displayedReport.financials.priceVerification}
                    isHi={isHi}
                  />
                </div>
                <div className="text-2xl font-bold text-stone-900 font-display tabular-nums">
                  ₹{displayedReport.financials.marketPricePerQuintalInr.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-sans font-normal text-stone-500">/ Qtl</span>
                </div>
                <div className="text-xs text-stone-600 truncate" title={displayedReport.financials.marketSource}>
                  Source: {displayedReport.financials.marketSource}
                </div>
              </div>

              {/* 14. Total Cultivation Expenses */}
              <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase text-stone-500 font-semibold">
                    14. Total Cultivation Expenses
                  </span>
                  <VerificationStamp
                    tag={displayedReport.financials.expenseVerification}
                    isHi={isHi}
                  />
                </div>
                <div className="text-2xl font-bold text-stone-900 font-display tabular-nums">
                  ₹{displayedReport.financials.totalCultivationExpensesInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-stone-600 font-mono tabular-nums space-y-0.5">
                  <div>
                    Logged Inputs: ₹{displayedReport.financials.loggedExpensesInr.toLocaleString('en-IN')} (Verified)
                  </div>
                  <div>
                    Stage Baseline: ₹
                    {displayedReport.financials.estimatedBaselineExpensesInr.toLocaleString('en-IN')} (Est.)
                  </div>
                </div>
              </div>

              {/* 15. Expected Revenue */}
              <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase text-stone-500 font-semibold">
                    15. Expected Revenue
                  </span>
                  <VerificationStamp
                    tag={displayedReport.financials.revenueVerification}
                    isHi={isHi}
                  />
                </div>
                <div className="text-2xl font-bold text-stone-900 font-display tabular-nums">
                  ₹{displayedReport.financials.expectedRevenueInr.toLocaleString('en-IN')}
                </div>
                <div className="text-xs font-mono text-stone-600 tabular-nums">
                  {displayedReport.harvestAndQuality.harvestQuantityQuintals} Qtl × ₹
                  {displayedReport.financials.marketPricePerQuintalInr.toLocaleString('en-IN')}/Qtl
                </div>
              </div>

              {/* 16. Estimated Profit */}
              <div className="bg-emerald-50/70 border-2 border-[#14532D] rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase text-[#14532D] font-bold">
                    16. Estimated Net Profit
                  </span>
                  <VerificationStamp tag="ESTIMATED" isHi={isHi} />
                </div>
                <div className="text-2xl font-black text-[#14532D] font-display tabular-nums">
                  ₹{displayedReport.financials.estimatedProfitInr.toLocaleString('en-IN')}
                </div>
                <div className="text-xs font-mono font-semibold text-stone-800 tabular-nums">
                  Profit/Acre: ₹{displayedReport.financials.profitPerAcreInr.toLocaleString('en-IN')} · ROI:{' '}
                  {displayedReport.financials.roiPct}%
                </div>
              </div>
            </div>
          </section>

          {/* OFFICIAL REPORT CARD FOOTER & BUYER ACTION STRIP */}
          <footer className="px-5 sm:px-8 py-4 bg-stone-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-stone-600">
            <div className="space-y-1">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#14532D]" />
                <span>
                  Digital Verification Signature: <code className="font-mono">{displayedReport.verification.verificationCode}</code>
                </span>
              </div>
              <div className="text-[11px]">
                Data Integrity Legend: <strong className="text-[#14532D]">Verified</strong> = Logged farmer/lab/APMC record ·{' '}
                <strong className="text-amber-800">Estimated</strong> = AI projection / market yield estimate.
              </div>
            </div>

            {viewMode === 'buyer' && (
              <button
                type="button"
                onClick={() => setCurrentView('marketplace')}
                className="print:hidden px-4 py-2 rounded-lg bg-[#14532D] hover:bg-[#0F3F22] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <Store className="w-4 h-4" />
                <span>Make Purchase Offer in Marketplace</span>
              </button>
            )}
          </footer>
        </article>
      )}

      {/* Activity & Harvest Logging Modal */}
      {activeCrop && farmerReport && (
        <ReportActivityModal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          crop={activeCrop}
          currentReport={farmerReport}
          language={language}
          onSubmit={handleActivitySubmit}
        />
      )}

      {/* Share & QR Code Modal */}
      {displayedReport && (
        <ShareReportModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          report={displayedReport}
          qrDataUrl={qrDataUrl}
          language={language}
          onToggleBuyerApproval={handleToggleBuyerApproval}
          onDownloadPdf={handleDownloadPdf}
          onCopySuccess={() =>
            addToast(
              isHi ? 'लिंक कॉपी किया गया' : 'Verification Link Copied',
              'You can now paste and share this secure Crop Report Card link with buyers.',
              'success'
            )
          }
        />
      )}
    </div>
  );
};
