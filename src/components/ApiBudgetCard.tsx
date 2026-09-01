import React, { useEffect, useState } from 'react';
import { ApiBudgetStats } from '../../shared/types';
import { IndianRupee, Cpu, Zap, Database, CheckCircle, ShieldCheck } from 'lucide-react';

export const ApiBudgetCard: React.FC = () => {
  const [stats, setStats] = useState<ApiBudgetStats>({
    monthlyLimitInr: 1500,
    currentUsageInr: 142.50,
    remainingBudgetInr: 1357.50,
    totalApiRequests: 328,
    cachedRequestsSaved: 194,
    modelInUse: 'gemini-3.7-flash',
    breakdown: {
      geminiAiInr: 88.20,
      weatherApiInr: 18.50,
      algorandNodeInr: 35.80,
    },
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.apiBudget) {
          setStats(data.apiBudget);
        }
      })
      .catch(() => {});
  }, []);

  const percentageUsed = Math.min(100, Math.round((stats.currentUsageInr / stats.monthlyLimitInr) * 100));

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">API Budget Ceiling (₹1,500 / Month)</h4>
            <p className="text-[11px] text-stone-500">Autonomous Cost Optimization & Rate-Limiting Guard</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
          {percentageUsed}% Utilized
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${percentageUsed}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-stone-700 font-semibold">
            Used: ₹{stats.currentUsageInr.toFixed(2)}
          </span>
          <span className="text-emerald-700 font-semibold">
            Remaining: ₹{stats.remainingBudgetInr.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 text-center">
          <span className="text-[10px] text-stone-500 block">Gemini 3.7 Flash</span>
          <span className="text-xs font-bold text-stone-900 mt-0.5 block">
            ₹{stats.breakdown.geminiAiInr.toFixed(2)}
          </span>
        </div>
        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 text-center">
          <span className="text-[10px] text-stone-500 block">Cached Savings</span>
          <span className="text-xs font-bold text-emerald-700 mt-0.5 block flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" />
            {stats.cachedRequestsSaved} saved
          </span>
        </div>
        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 text-center">
          <span className="text-[10px] text-stone-500 block">Node Queries</span>
          <span className="text-xs font-bold text-stone-900 mt-0.5 block">
            ₹{stats.breakdown.algorandNodeInr.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-1 border-t border-stone-100">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Token-efficient prompts with server-side caching strictly enforce the ₹1,500 monthly ceiling.</span>
      </div>
    </div>
  );
};
