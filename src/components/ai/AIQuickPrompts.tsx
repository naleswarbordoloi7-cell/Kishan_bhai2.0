import React, { useState } from 'react';
import {
  Droplets,
  Bug,
  TrendingUp,
  Tractor,
  Package,
  FileText,
  Sparkles,
  Sprout,
  HelpCircle,
  Coins,
  Camera,
} from 'lucide-react';

interface Props {
  onSelectPrompt: (prompt: string, sampleImage?: string) => void;
  language: string;
  disabled?: boolean;
}

function createSampleLeafPng(): string {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Dark soil/field background
    ctx.fillStyle = '#243028';
    ctx.fillRect(0, 0, 320, 220);

    // Leaf body
    ctx.fillStyle = '#48bb78';
    ctx.beginPath();
    ctx.moveTo(160, 22);
    ctx.bezierCurveTo(245, 42, 265, 148, 160, 190);
    ctx.bezierCurveTo(55, 148, 75, 42, 160, 22);
    ctx.fill();

    // Central vein
    ctx.strokeStyle = '#9ae6b4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(160, 28);
    ctx.lineTo(160, 186);
    ctx.stroke();

    // Yellowing chlorosis + brown necrotic leaf spots
    const spots = [
      { x: 122, y: 84, r: 15 },
      { x: 185, y: 112, r: 18 },
      { x: 138, y: 140, r: 11 },
    ];
    for (const s of spots) {
      ctx.fillStyle = '#ecc94b';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#744210';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText('Sample: Cotton Leaf Spot', 16, 208);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

export const AIQuickPrompts: React.FC<Props> = ({ onSelectPrompt, language, disabled = false }) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'IRRIGATION' | 'DISEASE' | 'MARKET' | 'COMMERCE'>('ALL');

  const prompts = [
    {
      id: 'irrigation_wheat',
      category: 'IRRIGATION',
      icon: Droplets,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      title: language === 'hi' ? 'क्या आज गेहूँ में पानी दें?' : 'Should I water my wheat today?',
      subtitle: language === 'hi' ? 'नमी सेंसर व वर्षा पूर्वानुमान' : 'Checks soil moisture & 70% rain forecast',
      query: 'Should I water my wheat today considering live soil moisture and rain forecast?',
    },
    {
      id: 'disease_scan',
      category: 'DISEASE',
      icon: Bug,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/80',
      title: language === 'hi' ? 'पत्तियों में पीलापन व धब्बे की जांच' : 'Check leaf disease & yellow spots',
      subtitle: language === 'hi' ? 'कंप्यूटर विजन रोग पहचान' : 'Fungal diagnosis & foliar spray remedies',
      query: 'Please analyze my crop for yellow leaf spots, pathogen infection, and provide immediate treatment plan.',
      useSampleLeaf: true,
    },
    {
      id: 'market_sell',
      category: 'MARKET',
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      title: language === 'hi' ? 'फसल कहाँ बेचें? (मंडी भाव)' : 'Where should I sell my crop?',
      subtitle: language === 'hi' ? 'गोंडल vs राजकोट APMC भाव तुलना' : 'Compares Gondal APMC vs regional rates',
      query: 'Where should I sell my Sharbati wheat and cotton harvest to maximize price realization?',
    },
    {
      id: 'what_to_grow',
      category: 'COMMERCE',
      icon: Sprout,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      title: language === 'hi' ? 'आगामी सीजन में क्या उगाएं?' : 'What should I grow next season?',
      subtitle: language === 'hi' ? 'काली मिट्टी व कम पानी की फसलें' : 'Optimal crops for Black Soil & low water',
      query: 'What crop should I grow in the upcoming season for maximum net profit on medium black soil?',
    },
    {
      id: 'fertilizer_pool',
      category: 'COMMERCE',
      icon: Package,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/80',
      title: language === 'hi' ? 'सामूहिक DAP खाद आर्डर बनाएं' : 'Create 250-Bag DAP Group Pool',
      subtitle: language === 'hi' ? '20% थोक छूट पर क्लस्टर डिमांड' : 'Autonomous state modification & wholesale discount',
      query: 'Create a collective bulk order requirement for 250 bags of IFFCO DAP fertilizer at 20% discount',
    },
    {
      id: 'government_schemes',
      category: 'COMMERCE',
      icon: FileText,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      title: language === 'hi' ? 'सरकारी योजनाएं व 90% सोलर सब्सिडी' : 'Find Government Schemes & Subsidies',
      subtitle: language === 'hi' ? 'PM-KUSUM व पीएम किसान' : 'PM-KUSUM 90% solar pump & PM-KISAN guidance',
      query: 'What government subsidies and agricultural schemes am I eligible for in Gujarat?',
    },
  ];

  const filteredPrompts = activeCategory === 'ALL'
    ? prompts
    : prompts.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-3">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800/60 pb-2 mb-2">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar max-w-full text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`pb-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeCategory === 'ALL'
                ? 'border-emerald-600 text-emerald-900 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {language === 'hi' ? 'सभी प्रश्न' : 'All Topics'}
          </button>

          <button
            onClick={() => setActiveCategory('IRRIGATION')}
            className={`pb-2 transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
              activeCategory === 'IRRIGATION'
                ? 'border-emerald-600 text-emerald-900 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>{language === 'hi' ? 'सिंचाई सलाह' : 'Irrigation'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('DISEASE')}
            className={`pb-2 transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
              activeCategory === 'DISEASE'
                ? 'border-emerald-600 text-emerald-900 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Bug className="w-3 h-3" />
            <span>{language === 'hi' ? 'रोग व कीट' : 'Disease & Pest'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('MARKET')}
            className={`pb-2 transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
              activeCategory === 'MARKET'
                ? 'border-emerald-600 text-emerald-900 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>{language === 'hi' ? 'मंडी भाव' : 'Mandi Rates'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('COMMERCE')}
            className={`pb-2 transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
              activeCategory === 'COMMERCE'
                ? 'border-emerald-600 text-emerald-900 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Package className="w-3 h-3" />
            <span>{language === 'hi' ? 'खाद व योजनाएं' : 'Inputs & Schemes'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredPrompts.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPrompt(p.query, p.useSampleLeaf ? createSampleLeafPng() : undefined)}
              className="text-left bg-white/80 hover:bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-xs transition-all hover:border-emerald-500/50 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-start gap-3 group"
            >
              <div className={`w-8 h-8 rounded-xl ${p.bgColor} ${p.iconColor} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-stone-900 group-hover:text-green-700 transition-colors truncate">
                  {p.title}
                </div>
                <div className="text-[11px] text-stone-500 truncate mt-0.5">
                  {p.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
