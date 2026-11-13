import React, { useState } from 'react';
import { Sprout, Droplets, CloudRain, TrendingUp, MapPin, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../../../shared/types';

interface Props {
  currentUser?: UserProfile | null;
  language: string;
}

export const AIFarmContextBadge: React.FC<Props> = ({ currentUser, language }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const farmerName = currentUser?.fullName || 'Ramesh Patel';
  const village = currentUser?.village || 'Anandpur';
  const state = currentUser?.state || 'Gujarat';
  const landholding = currentUser?.farmSizeAcres || 4.5;
  const primaryCrop = currentUser?.crops?.[0] || 'Sharbati Wheat';

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden transition-all">
      {/* Summary Header Strip */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-stone-900 uppercase tracking-tight">
                {language === 'hi' ? 'खेत का लाइव डेटा' : 'Live Farm Context'}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium border-l border-stone-200 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {village}, {state}
              </div>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {language === 'hi'
                ? `${primaryCrop} (${landholding} एकड़) • नमी: 42%`
                : `${primaryCrop} (${landholding} Acres) • Soil Moisture: 42%`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Quick Tags */}
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span>Moisture: 42%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CloudRain className="w-3 h-3 text-sky-500" />
              <span>Rain: 70%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>Mandi: ₹2,680</span>
            </span>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            title="Toggle details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Live Telemetry Drawer */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-stone-50/30">
          <div className="py-2">
            <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <Sprout className="w-3 h-3" />
              <span>Crop Stage</span>
            </div>
            <div className="font-bold text-stone-900">{primaryCrop}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Day 68 • CRI / Tillering</div>
          </div>

          <div className="py-2">
            <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <Droplets className="w-3 h-3" />
              <span>Soil IoT</span>
            </div>
            <div className="font-bold text-stone-900">42% (Optimal)</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Medium Black Loamy</div>
          </div>

          <div className="py-2">
            <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <CloudRain className="w-3 h-3" />
              <span>Weather</span>
            </div>
            <div className="font-bold text-stone-900">29.5°C • 70% Rain</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Heavy Showers (14mm)</div>
          </div>

          <div className="py-2">
            <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <TrendingUp className="w-3 h-3" />
              <span>APMC Mandi</span>
            </div>
            <div className="font-bold text-stone-900">Gondal @ ₹2,680</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">+₹140 Above MSP</div>
          </div>
        </div>
      )}
    </div>
  );
};

