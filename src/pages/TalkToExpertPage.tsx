import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PhoneCall,
  Video,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
  Award,
  X,
} from 'lucide-react';
import { EXPERTS_DIRECTORY } from '../data/agriData';
import { ExpertConsultant } from '../../shared/types';

export const TalkToExpertPage: React.FC = () => {
  const { language, addToast } = useApp();

  const [selectedExpert, setSelectedExpert] = useState<ExpertConsultant | null>(null);
  const [consultType, setConsultType] = useState<'VOICE' | 'VIDEO'>('VOICE');
  const [problemDescription, setProblemDescription] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Today, 04:00 PM - 05:00 PM');

  const handleBookConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(
      'Consultation Scheduled',
      `Your ${consultType} consultation with ${selectedExpert?.name} has been confirmed. You will receive a direct callback on your mobile.`,
      'success'
    );
    setSelectedExpert(null);
    setProblemDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-[#2D4F1E] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>{language === 'hi' ? 'कृषि वैज्ञानिक व विशेषज्ञ परामर्श' : 'Verified Agronomist & Scientist Advisory'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'विशेषज्ञ से बात करें' : 'Talk to Agri-Expert & KVK Scientist'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'आईसीएआर और कृषि विज्ञान केंद्र (KVK) के मान्यता प्राप्त विशेषज्ञों से सीधे फोन या वीडियो कॉल पर परामर्श लें।'
              : 'Direct 1-on-1 consultations with verified entomologists, soil scientists, and horticulture agronomists in your regional language.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 p-3 rounded-2xl backdrop-blur-md self-start md:self-auto">
          <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-white">ICAR & KVK Certified</div>
            <div className="text-emerald-200/80 text-[11px]">Free Government Subsidized</div>
          </div>
        </div>
      </div>

      {/* Experts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXPERTS_DIRECTORY.map((expert) => (
          <div
            key={expert.id}
            className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top Profile */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={expert.avatarUrl}
                    alt={expert.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600/30"
                    referrerPolicy="no-referrer"
                  />
                  {expert.isAvailableNow && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{expert.rating}</span>
                    <span className="text-stone-400 font-normal">({expert.totalConsultations} calls)</span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base leading-tight mt-0.5">{expert.name}</h3>
                  <p className="text-xs text-stone-500 font-medium">{expert.specialization}</p>
                </div>
              </div>

              {/* Institution */}
              <div className="mt-3 p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-700 font-medium">
                🏛️ {expert.institution}
              </div>

              {/* Languages */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {expert.languages.map((lang, idx) => (
                  <span key={idx} className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {lang}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-stone-600">
                <span className="text-[11px] font-semibold text-stone-500">{expert.experienceYears} Years Experience</span>
                <span className={`text-[11px] font-bold ${expert.isAvailableNow ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {expert.isAvailableNow ? '🟢 Available Now' : '🟡 Next: 2 hrs'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => {
                  setSelectedExpert(expert);
                  setConsultType('VOICE');
                }}
                className="flex-1 py-2.5 bg-[#2D4F1E] hover:bg-[#223d16] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Specialist</span>
              </button>

              <button
                onClick={() => {
                  setSelectedExpert(expert);
                  setConsultType('VIDEO');
                }}
                className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Book Video Consultation"
              >
                <Video className="w-4 h-4 text-emerald-700" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedExpert.avatarUrl}
                  alt={selectedExpert.name}
                  className="w-12 h-12 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{selectedExpert.name}</h3>
                  <p className="text-xs text-stone-500">{selectedExpert.specialization}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedExpert(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookConsultation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultType('VOICE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                      consultType === 'VOICE'
                        ? 'bg-[#2D4F1E] text-white border-[#2D4F1E]'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Direct Phone Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('VIDEO')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                      consultType === 'VIDEO'
                        ? 'bg-[#2D4F1E] text-white border-[#2D4F1E]'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Diagnostic</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Time Window</label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden font-semibold"
                >
                  <option value="Today, 04:00 PM - 05:00 PM">Today, 04:00 PM - 05:00 PM</option>
                  <option value="Today, 06:00 PM - 07:00 PM">Today, 06:00 PM - 07:00 PM</option>
                  <option value="Tomorrow, 09:00 AM - 10:00 AM">Tomorrow, 09:00 AM - 10:00 AM</option>
                  <option value="Tomorrow, 02:00 PM - 03:00 PM">Tomorrow, 02:00 PM - 03:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Crop Problem / Query Details</label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  placeholder="e.g. Yellow patches on cotton leaf margins after heavy irrigation..."
                  required
                ></textarea>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>100% Free Government Agronomy Support (₹0 Fee)</span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedExpert(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2D4F1E] hover:bg-[#223d16] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Confirm Callback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
