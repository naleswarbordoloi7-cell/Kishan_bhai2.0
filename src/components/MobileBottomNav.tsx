import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Sparkles, Sprout, TrendingUp, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, language } = useApp();

  const navItems = [
    {
      id: 'farmer-dashboard',
      label: language === 'hi' ? 'होम' : 'Home',
      icon: Home,
    },
    {
      id: 'ai-assistant',
      label: language === 'hi' ? 'किसान AI' : 'AI Assistant',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'my-crops',
      label: language === 'hi' ? 'मेरी फसल' : 'Crops',
      icon: Sprout,
    },
    {
      id: 'market-prices',
      label: language === 'hi' ? 'मंडी भाव' : 'Market',
      icon: TrendingUp,
    },
    {
      id: 'settings',
      label: language === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-2xl px-2 py-1.5 flex items-center justify-around safe-area-pb"
    >
      {navItems.map((item) => {
        const isActive =
          currentView === item.id ||
          (item.id === 'farmer-dashboard' && currentView === 'landing') ||
          (item.id === 'settings' && currentView === 'profile');
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-[#1B3B11] font-bold scale-105'
                : 'text-stone-700 hover:text-stone-900 font-medium'
            }`}
          >
            {item.highlight ? (
              <div
                className={`p-1.5 rounded-full mb-0.5 ${
                  isActive
                    ? 'bg-[#1B3B11] text-emerald-300 shadow-md ring-2 ring-emerald-600/30'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            ) : (
              <div
                className={`p-1 rounded-lg mb-0.5 ${
                  isActive ? 'bg-emerald-50 text-[#1B3B11]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            )}
            <span className={`text-[11px] leading-tight tracking-tight ${isActive ? 'font-extrabold text-[#1B3B11]' : 'text-stone-700'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
