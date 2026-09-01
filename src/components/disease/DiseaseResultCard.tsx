import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Leaf,
  Info,
  BookOpen,
  ArrowRight,
  UserCheck,
  Bot,
  Percent,
  Check,
  Activity,
  HeartHandshake,
  Sprout,
  ShieldAlert,
} from 'lucide-react';
import { DiseaseScanResult } from '../../../shared/types';

interface DiseaseResultCardProps {
  result: DiseaseScanResult;
  onAskAi: (result: DiseaseScanResult) => void;
  onSaveToDiary: (result: DiseaseScanResult) => void;
  onConsultExpert: () => void;
  language?: string;
}

export const DiseaseResultCard: React.FC<DiseaseResultCardProps> = ({
  result,
  onAskAi,
  onSaveToDiary,
  onConsultExpert,
  language = 'en',
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const getSeverityStyle = (severity: string) => {
    const s = severity?.toUpperCase();
    switch (s) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-600',
          label: 'Critical',
          icon: '🔴',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500',
          badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-600',
          label: 'High',
          icon: '🟠',
        };
      case 'MODERATE':
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-600',
          label: 'Moderate',
          icon: '🟡',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-600',
          label: 'Low',
          icon: '🟢',
        };
    }
  };

  const severityInfo = getSeverityStyle(result.severity);

  const handleDiaryClick = () => {
    setIsSaved(true);
    onSaveToDiary(result);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
      {/* Result Header & Confidence Card */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-stone-100">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#2D4F1E] px-2.5 py-0.5 rounded-md">
              <Leaf className="w-3 h-3" />
              <span>{result.cropName}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${severityInfo.badgeBg}`}
            >
              <span>{severityInfo.icon}</span>
              <span>Severity: {severityInfo.label}</span>
            </span>

            {result.isDemo && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-600" />
                DEMO ANALYSIS
              </span>
            )}
          </div>

          <div className="text-xs text-stone-500 font-medium">Possible diagnosis:</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            {result.possibleDisease || result.pathogen.split('(')[0].trim()}
          </h2>
          {result.pathogen && (
            <p className="text-xs text-stone-600 font-mono italic">{result.pathogen}</p>
          )}
          {result.hindiName && (
            <p className="text-xs text-stone-500 font-medium">{result.hindiName}</p>
          )}
        </div>

        {/* Confidence Visualization Card */}
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl shrink-0 self-start sm:self-auto min-w-[160px] text-right">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Confidence
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              {result.confidenceScore}%
            </span>
          </div>

          {/* Visual Confidence Bar */}
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden my-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-500"
              style={{ width: `${result.confidenceScore}%` }}
            />
          </div>

          <p className="text-[11px] text-stone-600 text-left leading-tight mt-2">
            {result.confidenceExplanation ||
              (result.confidenceScore >= 80
                ? 'The AI is reasonably confident based on the visible symptoms, but this is not a laboratory diagnosis.'
                : 'The AI is uncertain. Please upload a clearer image or consult an agriculture expert.')}
          </p>
        </div>
      </div>

      {/* Severity Guidance Alert */}
      <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${severityInfo.dot} animate-pulse`} />
          <span className="text-xs font-bold text-stone-800">
            Severity: {severityInfo.label}
          </span>
        </div>
        <span className="text-xs text-stone-600 font-medium">
          Monitor the crop closely and take action early.
        </span>
      </div>

      {/* Symptoms Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
          <span>🔍</span>
          <span>
            {language === 'hi' ? 'किसान भाई ने क्या पहचाना' : 'What Kisan Bhai Detected'}
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {result.symptoms.map((symptom, idx) => (
            <div
              key={idx}
              className="text-xs text-stone-800 flex items-start gap-2.5 bg-stone-50/90 p-3 rounded-xl border border-stone-200/70"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{symptom}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Causes Section */}
      {result.causes && result.causes.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {language === 'hi' ? 'यह क्यों हो सकता है (संभावित कारण)' : 'Why it may be happening'}
            </span>
          </h3>
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <ul className="space-y-1.5">
              {result.causes.map((cause, idx) => (
                <li key={idx} className="text-xs text-amber-950 font-medium flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recommended Action: What You Can Do */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
          <Sprout className="w-3.5 h-3.5 text-emerald-700" />
          <span>
            {language === 'hi' ? '🌱 आप क्या कर सकते हैं (सुरक्षित कदम)' : '🌱 What You Can Do'}
          </span>
        </h3>
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5">
          <ol className="space-y-2">
            {(result.recommendedAction || [
              'Inspect nearby plants for similar symptoms.',
              'Remove severely affected plant material where appropriate.',
              'Improve field airflow/drainage if relevant.',
              'Avoid unnecessary irrigation.',
              'Consult a local agriculture expert before applying treatment.',
            ]).map((step, idx) => (
              <li key={idx} className="text-xs text-emerald-950 font-medium flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Prevention: How to Prevent It */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D4F1E]" />
          <span>
            {language === 'hi' ? '🛡 रोग की रोकथाम कैसे करें' : '🛡 How to Prevent It'}
          </span>
        </h3>
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
          <ul className="space-y-2">
            {result.preventionSteps.map((prev, idx) => (
              <li key={idx} className="text-xs text-stone-800 font-medium flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500 mt-1.5 shrink-0" />
                <span>{prev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Multiple Possibilities (Differential Diagnosis) */}
      {result.differentialPossibilities && result.differentialPossibilities.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {language === 'hi' ? 'अन्य संभावित समस्याएं (संभावनाएं)' : 'Possible Issues (Differential Analysis)'}
              </span>
            </h3>
            <span className="text-[11px] text-stone-500">Model Probability Distribution</span>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2.5">
            {result.differentialPossibilities.map((diff, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className={diff.isPrimary ? 'font-bold text-stone-900' : 'text-stone-700'}>
                    {idx + 1}. {diff.issue}
                  </span>
                  <span className="font-bold text-emerald-800 font-mono">{diff.probabilityPct}%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      diff.isPrimary ? 'bg-emerald-600' : 'bg-stone-400'
                    }`}
                    style={{ width: `${diff.probabilityPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Action Hub: Ask Kisan Bhai, Save to Diary & Expert Consultation */}
      <div className="space-y-4 pt-4 border-t border-stone-200/80">
        {/* Ask Kisan Bhai Card */}
        <div className="bg-emerald-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-bold text-emerald-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Want to know more?</span>
            </div>
            <p className="text-xs text-emerald-100/90 max-w-md">
              Ask Kisan Bhai AI copilot for customized organic sprays, regional weather impact, or step-by-step guidance.
            </p>
          </div>

          <button
            onClick={() => onAskAi(result)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Kisan Bhai 🤖</span>
          </button>
        </div>

        {/* Action Buttons: Save to Diary & Expert Connect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDiaryClick}
            disabled={isSaved}
            className={`flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-[#2D4F1E] hover:bg-[#223d16] text-white shadow-sm'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Saved to Farm Diary</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Save to Farm Diary</span>
              </>
            )}
          </button>

          <button
            onClick={onConsultExpert}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl border border-stone-200 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Talk to Agriculture Expert</span>
          </button>
        </div>

        {/* Advisory Disclaimer */}
        <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 flex items-start gap-2 border border-stone-200/60">
          <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <span>
            {result.advisoryDisclaimer ||
              'AI results are advisory. For serious or spreading crop problems, consult a qualified agriculture professional.'}
          </span>
        </div>
      </div>
    </div>
  );
};
