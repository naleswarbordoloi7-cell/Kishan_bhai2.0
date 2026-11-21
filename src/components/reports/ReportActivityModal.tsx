import React, { useState, useEffect } from 'react';
import { X, Sprout, CheckCircle2 } from 'lucide-react';
import { CropLifecycleItem, DigitalCropReportCard } from '../../../shared/types';
import { CropReportOverrides } from '../../services/cropReportService';

export interface ReportActivityPayload {
  activityType: 'Fertilizer' | 'Irrigation' | 'Micronutrient' | 'Pesticide' | 'Observation' | 'HarvestUpdate';
  date: string;
  title: string;
  quantityOrDose: string;
  expenseAmountInr: number;
  notes: string;
  harvestQuantityQuintals?: number;
  cropQualityGrade?: DigitalCropReportCard['harvestAndQuality']['cropQualityGrade'];
  growthProgressPct?: number;
  growthStage?: CropLifecycleItem['stage'];
}

interface ReportActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop: CropLifecycleItem;
  currentReport: DigitalCropReportCard;
  language: string;
  onSubmit: (payload: ReportActivityPayload, overridePatch?: CropReportOverrides) => Promise<void> | void;
}

const STAGES: CropLifecycleItem['stage'][] = [
  'Sowing / Seedling',
  'Vegetative',
  'Flowering & Pod Initiation',
  'Grain Filling / Boll Dev',
  'Maturity & Harvesting',
];

const QUALITY_GRADES: DigitalCropReportCard['harvestAndQuality']['cropQualityGrade'][] = [
  'A+ Export',
  'Grade A Premium',
  'Grade B Standard',
  'Grade C Fair',
];

export const ReportActivityModal: React.FC<ReportActivityModalProps> = ({
  isOpen,
  onClose,
  crop,
  currentReport,
  language,
  onSubmit,
}) => {
  const isHi = language === 'hi';
  const [activityType, setActivityType] = useState<ReportActivityPayload['activityType']>('Fertilizer');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState<string>('');
  const [quantityOrDose, setQuantityOrDose] = useState<string>('');
  const [expenseAmountInr, setExpenseAmountInr] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [harvestQty, setHarvestQty] = useState<string>(String(currentReport.harvestAndQuality.harvestQuantityQuintals));
  const [qualityGrade, setQualityGrade] = useState<DigitalCropReportCard['harvestAndQuality']['cropQualityGrade']>(
    currentReport.harvestAndQuality.cropQualityGrade
  );
  const [growthProgressPct, setGrowthProgressPct] = useState<number>(crop.stageProgressPct);
  const [growthStage, setGrowthStage] = useState<CropLifecycleItem['stage']>(crop.stage);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHarvestQty(String(currentReport.harvestAndQuality.harvestQuantityQuintals));
      setQualityGrade(currentReport.harvestAndQuality.cropQualityGrade);
      setGrowthProgressPct(crop.stageProgressPct);
      setGrowthStage(crop.stage);
      setTitle('');
      setQuantityOrDose('');
      setExpenseAmountInr('0');
      setNotes('');
    }
  }, [isOpen, crop.id, currentReport.reportId]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedExpense = Math.max(0, Number(expenseAmountInr) || 0);
      const parsedHarvest = Math.max(0.5, Number(harvestQty) || currentReport.harvestAndQuality.harvestQuantityQuintals);

      const defaultTitleMap: Record<ReportActivityPayload['activityType'], string> = {
        Fertilizer: `Fertilizer Application on ${crop.cropName}`,
        Irrigation: `Scheduled Irrigation Cycle — ${crop.cropName}`,
        Micronutrient: `Foliar Micronutrient Spray — ${crop.cropName}`,
        Pesticide: `Preventive Crop Protection — ${crop.cropName}`,
        Observation: `Field Health Observation — ${crop.cropName}`,
        HarvestUpdate: `Verified Harvest & Quality Inspection — ${crop.cropName}`,
      };

      const overridePatch: CropReportOverrides | undefined =
        activityType === 'HarvestUpdate'
          ? {
              harvestQuantityQuintals: parsedHarvest,
              harvestVerified: true,
              cropQualityGrade: qualityGrade,
              gradeVerified: true,
            }
          : undefined;

      await onSubmit(
        {
          activityType,
          date,
          title: title.trim() || defaultTitleMap[activityType],
          quantityOrDose: quantityOrDose.trim() || (activityType === 'HarvestUpdate' ? `${parsedHarvest} Qtl (${qualityGrade})` : 'Standard Field Dose'),
          expenseAmountInr: parsedExpense,
          notes: notes.trim(),
          harvestQuantityQuintals: activityType === 'HarvestUpdate' ? parsedHarvest : undefined,
          cropQualityGrade: activityType === 'HarvestUpdate' ? qualityGrade : undefined,
          growthProgressPct,
          growthStage,
        },
        overridePatch
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 print:hidden">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-[#14532D]/20 overflow-hidden">
        <div className="bg-[#14532D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sprout className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {isHi ? 'नई कृषि गतिविधि दर्ज करें' : 'Record Farming Activity & Update Report'}
              </h3>
              <p className="text-xs text-emerald-100/90">
                {crop.cropName} · {crop.variety} · {currentReport.uniqueCropId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                { id: 'Fertilizer', label: isHi ? 'खाद / उर्वरक' : 'Fertilizer' },
                { id: 'Irrigation', label: isHi ? 'सिंचाई' : 'Irrigation' },
                { id: 'Micronutrient', label: isHi ? 'सूक्ष्म पोषक' : 'Micronutrient' },
                { id: 'Pesticide', label: isHi ? 'रोग/कीट दवा' : 'Pest Care' },
                { id: 'Observation', label: isHi ? 'खेत निरीक्षण' : 'Observation' },
                { id: 'HarvestUpdate', label: isHi ? 'कटाई व ग्रेड' : 'Harvest & Grade' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActivityType(opt.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border text-left transition-colors cursor-pointer ${
                  activityType === opt.id
                    ? 'bg-[#14532D] text-white border-[#14532D]'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-[#14532D]/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isHi ? 'तिथि' : 'Activity Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isHi ? 'खर्च (₹ INR)' : 'Expense Incurred (₹ INR)'}
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={expenseAmountInr}
                onChange={(e) => setExpenseAmountInr(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isHi ? 'गतिविधि शीर्षक' : 'Activity Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activityType === 'HarvestUpdate'
                  ? 'e.g. First Picking & Moisture Weight Audit'
                  : 'e.g. Potash Top Dressing / 4-Hour Drip Cycle'
              }
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isHi ? 'मात्रा / खुराक' : 'Quantity / Dosage / Duration'}
            </label>
            <input
              type="text"
              value={quantityOrDose}
              onChange={(e) => setQuantityOrDose(e.target.value)}
              placeholder="e.g. 25 kg/acre Urea + 15 kg MOP or 3 hrs Drip"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            />
          </div>

          {activityType === 'HarvestUpdate' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-3">
              <div className="text-xs font-bold text-[#14532D] uppercase tracking-wider">
                {isHi ? 'सत्यापित उपज व गुणवत्ता अपडेट' : 'Verified Harvest & Quality Record'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHi ? 'कुल उपज (क्विंटल)' : 'Verified Harvest Quantity (Quintals)'}
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={harvestQty}
                    onChange={(e) => setHarvestQty(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm text-stone-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHi ? 'गुणवत्ता ग्रेड' : 'Verified Quality Grade'}
                  </label>
                  <select
                    value={qualityGrade}
                    onChange={(e) =>
                      setQualityGrade(e.target.value as DigitalCropReportCard['harvestAndQuality']['cropQualityGrade'])
                    }
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                  >
                    {QUALITY_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>{isHi ? 'फसल विकास चरण एवं प्रगति' : 'Update Crop Stage & Progress'}</span>
              <span className="font-mono font-bold text-[#14532D] tabular-nums">{growthProgressPct}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={growthProgressPct}
              onChange={(e) => setGrowthProgressPct(Number(e.target.value))}
              className="w-full accent-[#14532D] cursor-pointer"
            />
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value as CropLifecycleItem['stage'])}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            >
              {STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isHi ? 'टिप्पणी (वैकल्पिक)' : 'Field Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Weather, soil moisture, or buyer inspection observations..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50 cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-[#14532D] hover:bg-[#0F3F22] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? (isHi ? 'सहेज रहे हैं...' : 'Updating...') : (isHi ? 'रिपोर्ट कार्ड अपडेट करें' : 'Save & Update Report Card')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
