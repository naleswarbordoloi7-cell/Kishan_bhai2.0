import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Landmark,
  Search,
  CheckCircle2,
  ExternalLink,
  FileText,
  ShieldCheck,
  Filter,
  Info,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { GOVERNMENT_SCHEMES_CATALOG } from '../data/agriData';
import { GovernmentScheme } from '../../shared/types';

export const GovernmentSchemesPage: React.FC = () => {
  const { language } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  const categories = [
    'All',
    'Direct Income Support',
    'Crop Insurance',
    'Credit & Loan',
    'Irrigation Subsidy',
    'Organic & Soil',
    'Farm Mechanization',
  ];

  const filteredSchemes = GOVERNMENT_SCHEMES_CATALOG.filter((scheme) => {
    const matchSearch =
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.hindiName.includes(searchTerm) ||
      scheme.benefitSummary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'All' || scheme.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-[#2D4F1E] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4" />
            <span>{language === 'hi' ? 'सरकारी योजनाएं और सब्सिडी' : 'Verified Central & State Government Schemes'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'सरकारी योजनाएं' : 'Government Schemes'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'पीएम-किसान, फसल बीमा, केसीसी ऋण और कृषि यंत्र सब्सिडी की आधिकारिक पात्रता, आवश्यक दस्तावेज व आवेदन प्रक्रिया।'
              : 'Direct verified guide to central agricultural subsidies, low-interest credit lines, and direct farmer assistance.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 p-3 rounded-2xl backdrop-blur-md self-start md:self-auto">
          <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-white">Direct Benefit Transfer (DBT)</div>
            <div className="text-emerald-200/80 text-[11px]">100% Official Links</div>
          </div>
        </div>
      </div>

      {/* Search and Category Chips */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'योजना का नाम, सब्सिडी या लाभ खोजें...' : 'Search scheme name, subsidy benefits, or documents...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2D4F1E] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  {scheme.category}
                </span>
                <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>VERIFIED DBT</span>
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 tracking-tight">{scheme.name}</h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">{scheme.hindiName}</p>

              <div className="my-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs">
                <span className="font-bold text-emerald-950">Financial Assistance: </span>
                <span className="text-emerald-900 font-medium">{scheme.financialAssistance}</span>
              </div>

              <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                {scheme.benefitSummary}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-stone-500">{scheme.ministry.split('&')[0]}</span>

              <button
                onClick={() => setSelectedScheme(scheme)}
                className="flex items-center gap-1 px-4 py-2 bg-[#2D4F1E] hover:bg-[#223d16] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <span>View Full Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 space-y-6 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                  {selectedScheme.category}
                </span>
                <h2 className="text-xl font-bold text-stone-900 mt-2">{selectedScheme.name}</h2>
                <p className="text-xs text-stone-500">{selectedScheme.hindiName} • {selectedScheme.ministry}</p>
              </div>

              <button
                onClick={() => setSelectedScheme(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assistance Card */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">Financial Benefit</div>
              <div className="text-base font-bold text-emerald-900 font-display">{selectedScheme.financialAssistance}</div>
              <p className="text-xs text-emerald-800/90 mt-1">{selectedScheme.benefitSummary}</p>
            </div>

            {/* Eligibility Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Eligibility Criteria</h4>
              <ul className="space-y-1.5">
                {selectedScheme.eligibilityCriteria.map((item, idx) => (
                  <li key={idx} className="text-xs text-stone-700 flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Required Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedScheme.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="text-xs text-stone-700 flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <FileText className="w-4 h-4 text-[#2D4F1E] shrink-0" />
                    <span className="font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Walkthrough */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Step-by-Step Application Process</h4>
              <ol className="space-y-2">
                {selectedScheme.applicationProcess.map((step, idx) => (
                  <li key={idx} className="text-xs text-stone-700 flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <span className="w-5 h-5 rounded-full bg-[#2D4F1E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Official Link Button */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
              <a
                href={selectedScheme.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#2D4F1E] hover:bg-[#223d16] text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Open Official Government Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setSelectedScheme(null)}
                className="py-3 px-6 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
