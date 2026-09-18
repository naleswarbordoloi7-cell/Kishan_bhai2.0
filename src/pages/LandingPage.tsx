import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Sprout,
  ShoppingBag,
  Truck,
  ChevronRight,
  Sparkles,
  Store,
  LayoutDashboard
} from 'lucide-react';
import { AnimatedKishanLogo } from '../components/AnimatedKishanLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PWAInstallButton } from '../components/PWAInstallButton';

export const LandingPage: React.FC = () => {
  const setUserRole = useUserStore(state => state.setUserRole);
  const { setCurrentView, setIsLogoSplashOpen } = useApp();

  const [step, setStep] = useState(0); 
  
  const onboardingContent = [
    {
      title: "Grow Smarter",
      subtitle: "Get useful farming information, crop guidance and tools in one place.",
      icon: <Sprout className="w-16 h-16 text-green-600 mb-6" />,
      image: "bg-green-50"
    },
    {
      title: "Sell Better",
      subtitle: "Connect with customers and find better opportunities for your produce.",
      icon: <Store className="w-16 h-16 text-orange-500 mb-6" />,
      image: "bg-orange-50"
    },
    {
      title: "Your Farming Partner",
      subtitle: "Kishan Bhai is here to help you from farming to selling.",
      icon: <Sparkles className="w-16 h-16 text-yellow-500 mb-6" />,
      image: "bg-yellow-50"
    }
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const skipOnboarding = () => {
    setStep(3);
  };

  const handleRoleSelect = (role: 'FARMER' | 'BUYER' | 'ADMIN' | 'CHAMPION') => {
    setUserRole(role);
    setCurrentView('login');
  };

  if (step < 3) {
    const current = onboardingContent[step];
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-white max-w-md mx-auto h-full relative">
        {/* Top bar */}
        <div className="absolute top-4 right-4 left-4 z-10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <PWAInstallButton />
          </div>
          <button 
            onClick={skipOnboarding}
            className="text-sm font-medium text-stone-500 hover:text-stone-800 cursor-pointer bg-white/50 px-3 py-1.5 rounded-full"
          >
            Skip
          </button>
        </div>

        {/* Image/Visual Area */}
        <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-colors duration-500 ${current.image}`}>
          <div className="bg-white p-6 rounded-full shadow-sm mb-4 animate-in zoom-in duration-500">
            {current.icon}
          </div>
          <div className="transform scale-75">
             <AnimatedKishanLogo
              size="md"
              showText={true}
              interactive={false}
              withSound={false}
              
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 pb-12 text-center bg-white rounded-t-[32px] -mt-8 relative z-10 flex flex-col h-[320px]">
          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-green-600' : 'w-2 bg-green-100'}`}
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold font-display text-stone-900 mb-4">{current.title}</h2>
          <p className="text-stone-600 text-sm mb-auto px-4 leading-relaxed">
            {current.subtitle}
          </p>

          <button 
            onClick={handleNext}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] mt-8 cursor-pointer"
          >
            {step === 2 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // ROLE SELECTION SCREEN
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-stone-50 max-w-md mx-auto pb-12 pt-4 relative">
      <div className="absolute top-2 right-4 left-4 z-10 flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <LanguageSwitcher />
        </div>
      </div>
      <div className="bg-white pt-8 pb-6 px-6 rounded-2xl shadow-sm mb-6 text-center mx-4 border border-stone-200/50 mt-8">
        <div className="transform scale-75 inline-block mb-4">
           <AnimatedKishanLogo
            size="sm"
            showText={true}
            interactive={true}
            withSound={true}
            onClick={() => setIsLogoSplashOpen(true)}
          />
        </div>
        <h1 className="text-2xl font-bold font-display text-stone-900 tracking-tight">
          How will you use Kishan Bhai?
        </h1>
        <p className="text-stone-500 text-sm mt-2">
          Select your role to continue
        </p>
      </div>

      <div className="px-5 space-y-4 flex-1">
        
        {/* FARMER CARD */}
        <div 
          onClick={() => handleRoleSelect('FARMER')}
          className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm hover:border-green-600 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4 active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-600 transition-colors">
            <Sprout className="w-6 h-6 text-green-700 group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold font-display text-stone-900 mb-1 group-hover:text-green-700">Farmer</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Sell produce, manage your farm and grow your business.
            </p>
          </div>
          <div className="self-center">
            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-green-600" />
          </div>
        </div>

        {/* CUSTOMER CARD */}
        <div 
          onClick={() => handleRoleSelect('BUYER')}
          className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4 active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-500 transition-colors">
            <ShoppingBag className="w-6 h-6 text-orange-600 group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold font-display text-stone-900 mb-1 group-hover:text-orange-600">Customer</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Buy fresh products directly from farmers and rural markets.
            </p>
          </div>
          <div className="self-center">
            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-orange-500" />
          </div>
        </div>

        {/* DELIVERY PARTNER CARD */}
        <div 
          onClick={() => handleRoleSelect('CHAMPION')}
          className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4 active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors">
            <Truck className="w-6 h-6 text-blue-600 group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold font-display text-stone-900 mb-1 group-hover:text-blue-600">Delivery Partner</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Manage deliveries, connect farms to homes, and earn.
            </p>
          </div>
          <div className="self-center">
            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-blue-500" />
          </div>
        </div>

        {/* ADMIN CARD (Hidden / Internal logic) */}
        <div className="pt-6">
          <button
            onClick={() => handleRoleSelect('ADMIN')}
            className="w-full text-center text-xs font-semibold text-stone-400 hover:text-stone-600 flex items-center justify-center gap-1 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Internal Dashboard Access</span>
          </button>
        </div>

      </div>
    </div>
  );
};
