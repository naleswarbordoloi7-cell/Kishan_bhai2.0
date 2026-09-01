import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, RefreshCw, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface MandiRate {
  id: string;
  crop: string;
  cropHi: string;
  variety: string;
  mandi: string;
  state: string;
  modalPrice: number; // in ₹ per Quintal
  mspPrice: number;
  prevPrice: number;
  unit: string;
  arrivalTons: number;
}

const LIVE_MANDI_DATA: MandiRate[] = [
  {
    id: 'm1',
    crop: 'Cotton (Kapas)',
    cropHi: 'कपास (शंकर-6)',
    variety: 'Shankar-6 Medium Long',
    mandi: 'Rajkot APMC',
    state: 'Gujarat',
    modalPrice: 7420,
    mspPrice: 7020,
    prevPrice: 7310,
    unit: '₹/Quintal',
    arrivalTons: 1450,
  },
  {
    id: 'm2',
    crop: 'Wheat (Gehun)',
    cropHi: 'गेहूं (शरबती)',
    variety: 'Sharbati MP Gold',
    mandi: 'Indore APMC',
    state: 'Madhya Pradesh',
    modalPrice: 2840,
    mspPrice: 2275,
    prevPrice: 2805,
    unit: '₹/Quintal',
    arrivalTons: 3200,
  },
  {
    id: 'm3',
    crop: 'Groundnut (Mungfali)',
    cropHi: 'मूंगफली',
    variety: 'TAG-24 Bold',
    mandi: 'Gondal APMC',
    state: 'Gujarat',
    modalPrice: 6380,
    mspPrice: 6780,
    prevPrice: 6290,
    unit: '₹/Quintal',
    arrivalTons: 890,
  },
  {
    id: 'm4',
    crop: 'Mustard (Sarson)',
    cropHi: 'सरसों',
    variety: 'Yellow 42% Oil',
    mandi: 'Jaipur APMC',
    state: 'Rajasthan',
    modalPrice: 5720,
    mspPrice: 5650,
    prevPrice: 5680,
    unit: '₹/Quintal',
    arrivalTons: 1100,
  },
  {
    id: 'm5',
    crop: 'Soybean (Soya)',
    cropHi: 'सोयाबीन',
    variety: 'JS-335 Yellow',
    mandi: 'Latur APMC',
    state: 'Maharashtra',
    modalPrice: 4890,
    mspPrice: 4892,
    prevPrice: 4910,
    unit: '₹/Quintal',
    arrivalTons: 2150,
  },
  {
    id: 'm6',
    crop: 'Gram (Chana)',
    cropHi: 'चना (देशी)',
    variety: 'Desi Bold',
    mandi: 'Bikaner APMC',
    state: 'Rajasthan',
    modalPrice: 6150,
    mspPrice: 5440,
    prevPrice: 6090,
    unit: '₹/Quintal',
    arrivalTons: 640,
  },
];

export const MandiTicker: React.FC = () => {
  const { language, setCurrentView } = useApp();
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const filteredRates = selectedState === 'ALL'
    ? LIVE_MANDI_DATA
    : LIVE_MANDI_DATA.filter((r) => r.state.toUpperCase().includes(selectedState.toUpperCase()));

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-3 sm:p-4 shadow-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
            <span>{language === 'hi' ? 'दैनिक कृषि मंडी लाइव भाव (APMC Rates)' : 'Daily Agmarknet APMC Live Mandi Rates'}</span>
          </span>
          <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-mono font-medium">
            Live Feed
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* State Filter Buttons */}
          <div className="flex items-center gap-1 bg-stone-100/80 p-0.5 rounded-lg text-[11px] font-medium text-stone-600">
            {['ALL', 'Gujarat', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  selectedState === st ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                {st === 'ALL' ? 'All India' : st.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleManualRefresh}
            title="Refresh Mandi Ticker"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Commodity Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3">
        {filteredRates.map((rate) => {
          const diff = rate.modalPrice - rate.prevPrice;
          const isUp = diff >= 0;
          const mspDiff = rate.modalPrice - rate.mspPrice;

          return (
            <div
              key={rate.id}
              onClick={() => setCurrentView('harvest')}
              className="bg-stone-50/70 hover:bg-emerald-50/30 p-2.5 rounded-xl border border-stone-200/70 hover:border-emerald-600/40 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-xs text-stone-900 group-hover:text-emerald-900">
                    {language === 'hi' ? rate.cropHi : rate.crop.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate max-w-[110px] flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-stone-400" />
                    <span>{rate.mandi}</span>
                  </div>
                </div>

                <div className={`text-[10px] font-bold flex items-center gap-0.5 ${isUp ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isUp ? `+₹${diff}` : `-₹${Math.abs(diff)}`}</span>
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div className="font-mono font-bold text-sm text-stone-900">
                  ₹{rate.modalPrice.toLocaleString('en-IN')}
                </div>
                <div className="text-[9px] text-stone-400 font-mono">/qtl</div>
              </div>

              <div className="mt-1 flex items-center justify-between text-[9px] border-t border-stone-200/60 pt-1 text-stone-500">
                <span>MSP: ₹{rate.mspPrice}</span>
                <span className={mspDiff >= 0 ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                  {mspDiff >= 0 ? `+₹${mspDiff} > MSP` : `₹${Math.abs(mspDiff)} < MSP`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
