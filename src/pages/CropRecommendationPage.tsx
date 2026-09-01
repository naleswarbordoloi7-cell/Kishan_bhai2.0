import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Sprout,
  Droplets,
  Calendar,
  Layers,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Filter,
  ArrowRight,
  Info,
  DollarSign,
  Upload,
  RefreshCw,
  Scale,
} from 'lucide-react';
import { CropRecommendationWizard } from '../components/cropRec/CropRecommendationWizard';
import { CropRecommendationCard } from '../components/cropRec/CropRecommendationCard';
import { CropComparisonModal } from '../components/cropRec/CropComparisonModal';
import { CropDetailModal } from '../components/cropRec/CropDetailModal';
import { SoilReportModal } from '../components/soil/SoilReportModal';
import { CropRecommendationInput, CropRecommendationResultItem } from '../../shared/types';

export const CropRecommendationPage: React.FC = () => {
  const {
    language,
    cropsCatalog,
    lastCropRecommendation,
    runCropRecommendation,
    selectedCropDetailId,
    setSelectedCropDetailId,
    addCrop,
    setCurrentView,
    addToast,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCropIdsForCompare, setSelectedCropIdsForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleCalculateRecommendations = async (input: CropRecommendationInput) => {
    setIsLoading(true);
    try {
      await runCropRecommendation(input);
      addToast(
        'AI Crop Analysis Complete',
        `Analyzed ${cropsCatalog.length} regional crops for ${input.district}, ${input.season} season.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Analysis Failed', 'Could not compute recommendations. Please retry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompare = (cropId: string) => {
    setSelectedCropIdsForCompare((prev) => {
      if (prev.includes(cropId)) {
        return prev.filter((id) => id !== cropId);
      } else {
        if (prev.length >= 3) {
          addToast('Compare Limit', 'You can compare up to 3 crops simultaneously.', 'info');
          return prev;
        }
        return [...prev, cropId];
      }
    });
  };

  const handleAddToCrops = (crop: CropRecommendationResultItem) => {
    addCrop({
      id: `crop_${Date.now()}`,
      cropName: crop.cropName,
      hindiName: crop.hindiName,
      variety: crop.variety,
      sowingDate: new Date().toISOString().split('T')[0],
      areaAcres: 2.0,
      stage: 'Sowing / Seedling',
      stageProgressPct: 5,
      healthScore: 98,
      expectedHarvestDate: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expectedYieldQuintals: 22,
      soilMoistureStatus: 'OPTIMAL',
      pestVulnerability: 'LOW',
      pestWatchlist: ['Aphids', 'Pod Borer'],
      recentAction: 'Planned sowing based on AI Suitability recommendation',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    });
    addToast('Crop Added to Cultivation', `${crop.cropName} added to your active fields roster.`, 'success');
    setCurrentView('my-crops');
  };

  const selectedCropForDetail = cropsCatalog.find((c) => c.id === selectedCropDetailId) || null;

  const compareCropsList = (lastCropRecommendation?.topRecommendations || [])
    .filter((c) => selectedCropIdsForCompare.includes(c.cropId));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1B3B11] via-[#244A17] to-[#2D4F1E] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-4 h-4" />
            <span>{language === 'hi' ? 'एआई फसल चयन व उपयुक्तता' : 'AI Crop Recommendation Engine'}</span>
            <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px]">
              ICAR + Mandi AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'hi' ? '🌱 क्या उगाएं? (फसल सिफारिश)' : '🌱 What Should I Grow?'}
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {language === 'hi'
              ? 'स्थान, मृदा स्वास्थ्य कार्ड, जल उपलब्धता, मौसमी चक्र और बाजार मांग के आधार पर सबसे अधिक लाभकारी फसलों की रैंकिंग।'
              : 'Find crops that best match your land, season, resources, and farming goals with verified agronomic and profit modeling.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-2xl backdrop-blur-md">
            <ShieldCheck className="w-7 h-7 text-emerald-300 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-white">ICAR Verified Models</div>
              <div className="text-emerald-200/80 text-[11px]">Real-time Mandi MSP & ROI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Step Wizard Input Form */}
      <CropRecommendationWizard
        onCalculate={handleCalculateRecommendations}
        isLoading={isLoading}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Results Section */}
      {lastCropRecommendation && (
        <div className="space-y-6">
          {/* AI Assessment Callout */}
          <div className="bg-gradient-to-r from-emerald-900 to-[#1B3B11] text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>AI Agronomist Synthesis</span>
              </div>
              <span className="text-xs text-emerald-200/80 font-mono">
                {lastCropRecommendation.season} Season • {lastCropRecommendation.district}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
              {lastCropRecommendation.aiExplanation || lastCropRecommendation.aiAdvice?.kisanBhaiAdvice || 'Optimal agronomic alignment based on current soil parameters and regional seasonal dynamics.'}
            </p>

            <div className="pt-2 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200">
              <div>
                <span className="font-bold text-white">Target Farming Goal:</span> {lastCropRecommendation.farmingGoal || lastCropRecommendation.inputSummary?.farmingGoal || 'Maximum Profit'}
              </div>
              <div>
                <span className="font-bold text-white">Analyzed Soil:</span> Vertisol (pH 7.4, OC 0.62%)
              </div>
            </div>
          </div>

          {/* Results List Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Top Recommended Crops ({(lastCropRecommendation.topRecommendations || []).length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Ranked by suitability score, anticipated yield, and net profit margins per acre.
              </p>
            </div>

            {selectedCropIdsForCompare.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Selected ({selectedCropIdsForCompare.length})</span>
              </button>
            )}
          </div>

          {/* Ranked Crop Cards Grid */}
          <div className="space-y-4">
            {(lastCropRecommendation.topRecommendations || []).map((crop, idx) => (
              <CropRecommendationCard
                key={crop.cropId}
                crop={crop}
                rank={idx + 1}
                isSelectedForCompare={selectedCropIdsForCompare.includes(crop.cropId)}
                onToggleCompare={handleToggleCompare}
                onViewGuide={(cropId) => setSelectedCropDetailId(cropId)}
                onAddToCrops={handleAddToCrops}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Compare Tray (Sticky on Mobile / Desktop) */}
      {selectedCropIdsForCompare.length >= 2 && (
        <div className="fixed bottom-6 right-6 z-40 bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-xs">
            <div className="font-bold">{selectedCropIdsForCompare.length} Crops Selected</div>
            <div className="text-stone-400 text-[11px]">Ready for side-by-side comparison</div>
          </div>

          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            Compare Now →
          </button>
        </div>
      )}

      {/* Side-by-Side Compare Modal */}
      <CropComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        crops={compareCropsList}
        onViewGuide={(cropId) => {
          setIsCompareModalOpen(false);
          setSelectedCropDetailId(cropId);
        }}
      />

      {/* Deep-Dive Crop Detail Modal */}
      <CropDetailModal
        isOpen={Boolean(selectedCropDetailId)}
        onClose={() => setSelectedCropDetailId(null)}
        crop={selectedCropForDetail}
      />

      {/* Soil Report Modal Shortcut */}
      <SoilReportModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
