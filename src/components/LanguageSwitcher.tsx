import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'pa', label: 'Punjabi' },
    { code: 'bn', label: 'Bengali' },
    { code: 'mr', label: 'Marathi' },
    { code: 'gu', label: 'Gujarati' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'kn', label: 'Kannada' },
    { code: 'as', label: 'Assamese' },
  ];

  const currentLangLabel = languages.find(l => l.code === language)?.label || 'English';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 text-stone-700 rounded-full text-xs font-medium hover:bg-stone-50 transition-colors shadow-sm cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-green-600" />
        <span>{currentLangLabel}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 bg-white border border-stone-100 rounded-2xl shadow-lg z-50 overflow-hidden py-1">
            <div className="max-h-60 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    if (setLanguage) {
                        setLanguage(lang.code as any);
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                    language === lang.code 
                      ? 'bg-green-50 text-green-700 font-medium' 
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
