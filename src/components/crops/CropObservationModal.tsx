import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  X,
  Save,
  Clock,
  MessageSquare,
  AlertTriangle,
  Droplets,
  Zap,
  TrendingUp,
  History
} from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { CropLifecycleItem } from '../../../shared/types';
import { INDIAN_SPEECH_LANGUAGES } from '../../services/webSpeechService';

interface CropObservationModalProps {
  crop: CropLifecycleItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, category: string) => void;
  language: string;
}

export const CropObservationModal: React.FC<CropObservationModalProps> = ({
  crop,
  isOpen,
  onClose,
  onSave,
  language
}) => {
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('General');
  
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    lang: language === 'hi' ? 'hi-IN' : 'en-IN',
    continuous: true,
    interimResults: true,
    onResult: (text) => {
      setNote(text);
    }
  });

  useEffect(() => {
    if (isOpen) {
      setNote('');
      setCategory('General');
      resetTranscript();
    }
  }, [isOpen, resetTranscript]);

  if (!isOpen) return null;

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSave = () => {
    if (note.trim()) {
      onSave(note, category);
      onClose();
    }
  };

  const categories = [
    { id: 'General', icon: MessageSquare, label: language === 'hi' ? 'सामान्य' : 'General' },
    { id: 'Pest/Disease', icon: AlertTriangle, label: language === 'hi' ? 'कीट/बीमारी' : 'Pest/Disease' },
    { id: 'Irrigation', icon: Droplets, label: language === 'hi' ? 'सिंचाई' : 'Irrigation' },
    { id: 'Fertilizer', icon: Zap, label: language === 'hi' ? 'खाद/उर्वरक' : 'Fertilizer' },
    { id: 'Growth', icon: TrendingUp, label: language === 'hi' ? 'वृद्धि' : 'Growth' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B3B11] to-green-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl backdrop-blur-md">
              <Mic className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {language === 'hi' ? 'दैनिक निरीक्षण दर्ज करें' : 'Record Daily Observation'}
              </h2>
              <p className="text-emerald-100/70 text-sm">
                {crop.cropName} • {crop.variety}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              {language === 'hi' ? 'निरीक्षण श्रेणी' : 'Observation Category'}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    category === cat.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <cat.icon className={`w-4 h-4 ${category === cat.id ? 'text-emerald-100' : 'text-stone-400'}`} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input Area */}
          <div className="relative">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                {language === 'hi' ? 'आपका नोट' : 'Your Note'}
              </label>
              {isListening && (
                <div className="flex items-center gap-2 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black border border-rose-100">
                  <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                  REC
                </div>
              )}
            </div>
            
            <div className={`w-full min-h-[160px] p-5 rounded-2xl border-2 transition-all bg-stone-50 shadow-inner ${
              isListening ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/5' : 'border-stone-200 focus-within:border-emerald-500'
            }`}>
              <textarea
                value={note || transcript || interimTranscript}
                onChange={(e) => setNote(e.target.value)}
                placeholder={language === 'hi' ? 'माइक दबाएं और बोलना शुरू करें...' : 'Tap Mic and start speaking...'}
                className="w-full h-full bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 resize-none font-medium text-sm sm:text-base leading-relaxed"
              />
              
              {!note && !transcript && !interimTranscript && !isListening && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="flex flex-col items-center gap-2">
                    <Mic className="w-8 h-8 text-stone-300" />
                    <p className="text-xs font-bold text-stone-400">Speak observation details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 pt-2">
            <button
              onClick={handleToggleMic}
              className={`w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-200 animate-pulse'
                  : 'bg-emerald-700 text-white shadow-emerald-200 hover:bg-emerald-800'
              }`}
            >
              {isListening ? (
                <>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map(i => <div key={i} className={`w-1 bg-white rounded-full animate-bounce`} style={{ height: `${Math.random() * 1.5 + 0.5}rem`, animationDelay: `${i * 0.1}s` }} />)}
                  </div>
                  <span>{language === 'hi' ? 'बोलना बंद करें' : 'Stop & Transcribe'}</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>{language === 'hi' ? 'बोलकर नोट लिखें' : 'Record with Voice'}</span>
                </>
              )}
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 text-stone-600 font-bold text-sm hover:bg-stone-100 rounded-2xl transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={!note && !transcript}
                className="flex-1 py-3 bg-stone-900 text-white rounded-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'hi' ? 'नोट सहेजें' : 'Save Note'}</span>
              </button>
            </div>
          </div>

          {!isSupported && (
            <p className="text-center text-rose-600 text-xs font-medium">
              Voice recognition is not supported in this browser.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
