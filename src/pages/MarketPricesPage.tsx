import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Truck,
  CheckCircle2,
  Package,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const MarketPricesPage: React.FC = () => {
  const { mandiPrices, language, setCurrentView } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Cotton (Kapas)');
  const [selectedState, setSelectedState] = useState('All');

  const filteredPrices = mandiPrices.filter((record) => {
    const matchSearch =
      record.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.mandi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchState = selectedState === 'All' || record.state === selectedState;
    return matchSearch && matchState;
  });

  const activeRecord = mandiPrices.find((m) => m.crop === selectedCrop) || mandiPrices[0];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-[#2D4F1E] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'hi' ? 'दैनिक मंडी भाव व बाजार विश्लेषण' : 'Real-time Mandi Rates & Market Intelligence'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'मंडी भाव और बाजार मूल्य' : 'Market Prices & Mandi Rates'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'प्रमुख कृषि उपज मंडी समितियों (APMC) के मॉडल भाव, आवक मात्रा और 7-दिवसीय मूल्य रुझान।'
              : 'Verified daily APMC modal prices, arrival volumes (Quintals), and predictive price trends across regional mandis.'}
          </p>
        </div>

        <button
          onClick={() => setCurrentView('harvest')}
          className="flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold px-5 py-3 rounded-2xl shadow-lg transition-all cursor-pointer text-sm shrink-0"
        >
          <Package className="w-5 h-5" />
          <span>{language === 'hi' ? 'फसल पूल में बेचें' : 'Sell via Harvest Pool'}</span>
        </button>
      </div>

      {/* Interactive Price Trend Chart for Selected Crop */}
      {activeRecord && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                  {activeRecord.crop}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {activeRecord.mandi} ({activeRecord.state})
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-stone-900 font-display">
                  ₹{activeRecord.modalPricePerQuintal.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-stone-500">/ Quintal</span>
                <span
                  className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                    activeRecord.priceChangeDailyPct >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {activeRecord.priceChangeDailyPct >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>{activeRecord.priceChangeDailyPct > 0 ? `+${activeRecord.priceChangeDailyPct}%` : `${activeRecord.priceChangeDailyPct}%`}</span>
                </span>
              </div>
            </div>

            {/* Quick Crop Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {['Cotton (Kapas)', 'Groundnut (Mungfali)', 'Wheat (Gehun)', 'Mustard (Sarson)', 'Soybean', 'Tomato'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCrop(c)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCrop === c
                      ? 'bg-[#2D4F1E] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {c.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeRecord.priceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="date" stroke="#a8a29e" fontSize={11} />
                <YAxis stroke="#a8a29e" fontSize={11} domain={['dataMin - 100', 'dataMax + 100']} unit="₹" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`₹${value}/Quintal`, 'Modal Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#2D4F1E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'फसल, मंडी या जिला खोजें...' : 'Search crop, mandi or district...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-hidden"
          >
            <option value="All">All States (सभी राज्य)</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
          </select>
        </div>
      </div>

      {/* Mandi Rates Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-sm">
            {language === 'hi' ? 'सक्रिय मंडी दर सूची' : 'Verified APMC Mandi Comparison Table'}
          </h3>
          <span className="text-xs text-stone-500 font-mono">UPDATED: TODAY, 09:00 AM</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Crop & Variety</th>
                <th className="py-3 px-4">APMC Mandi</th>
                <th className="py-3 px-4">Min Price</th>
                <th className="py-3 px-4">Max Price</th>
                <th className="py-3 px-4">Modal Price</th>
                <th className="py-3 px-4">Daily Arrival</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredPrices.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900">{item.crop}</div>
                    <div className="text-[11px] text-stone-500">{item.variety}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-800 flex items-center gap-1.5">
                      <span>{item.mandi}</span>
                      {item.isBestMandi && (
                        <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                          BEST RATE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500">{item.district}, {item.state}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-stone-600">₹{item.minPricePerQuintal}</td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">₹{item.maxPricePerQuintal}</td>

                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 text-sm">
                    ₹{item.modalPricePerQuintal}
                    <div className="text-[10px] font-sans font-semibold text-emerald-600">
                      {item.priceChangeDailyPct > 0 ? `+${item.priceChangeDailyPct}%` : `${item.priceChangeDailyPct}%`}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-stone-700">{item.dailyArrivalQuintals.toLocaleString()} Qtl</td>
                  <td className="py-3.5 px-4 text-stone-500">{item.distanceKm} km</td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedCrop(item.crop);
                      }}
                      className="px-3 py-1.5 bg-[#2D4F1E] hover:bg-[#223d16] text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                    >
                      View Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
