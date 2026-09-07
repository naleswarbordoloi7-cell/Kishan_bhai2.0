import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Wallet,
  Globe,
  Radio,
  UserCheck,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  Wifi,
  WifiOff,
  Sun,
  Moon,
} from 'lucide-react';
import { UserRole } from '../../shared/types';
import { NotificationCenter } from './NotificationCenter';
import { AnimatedKishanLogo } from './AnimatedKishanLogo';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    userRole,
    setUserRole,
    language,
    setLanguage,
    t,
    wallet,
    currentView,
    setCurrentView,
    setIsWalletModalOpen,
    setIsNfcModalOpen,
    setIsLogoSplashOpen,
    isOnline,
    setIsOfflineModalOpen,
    addToast,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'FARMER', label: 'Farmer (किसान भाई)', desc: 'Farm management, clusters & AI' },
    { role: 'CHAMPION', label: 'Village Champion (ग्राम प्रधान)', desc: 'Coordinate village clusters' },
    { role: 'BUYER', label: 'Institutional Buyer (क्रेता)', desc: 'Procure bulk cluster harvests' },
    { role: 'ADMIN', label: 'Admin & System Ops', desc: 'x402 protocol & API budget' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setIsRoleMenuOpen(false);
    if (role === 'FARMER') setCurrentView('farmer-dashboard');
    else if (role === 'CHAMPION') setCurrentView('champion-dashboard');
    else if (role === 'BUYER') setCurrentView('buyer-dashboard');
    else if (role === 'ADMIN') setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    addToast('Signed Out', 'You have been signed out of your account.', 'info');
    setCurrentView('login');
  };

  const navLinks = [
    { id: 'farmer-dashboard', label: t('dashboard', 'डैशबोर्ड') },
    { id: 'ai-assistant', label: t('voiceAssistant', 'किसान AI') },
    { id: 'disease-scanner', label: t('diseaseScanner', 'रोग पहचान') },
    { id: 'smart-irrigation', label: t('smartIrrigation', 'स्मार्ट सिंचाई') },
    { id: 'market-prices', label: t('marketPrices', 'मंडी भाव') },
    { id: 'government-schemes', label: t('schemes', 'सरकारी योजनाएं') },
    { id: 'clusters', label: t('virtualClusters', 'फार्म क्लस्टर') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121810]/95 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with Animatic Vector Engine */}
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center cursor-pointer"
          >
            <AnimatedKishanLogo
              size="sm"
              showText={true}
              interactive={true}
              withSound={true}
              subtitle={language === 'hi' ? 'स्मार्ट कृषि नेटवर्क' : 'Seed to Sale Platform'}
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.slice(0, 6).map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentView(link.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2D4F1E]/10 text-[#2D4F1E] font-semibold border border-[#2D4F1E]/15 backdrop-blur-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language, Role Selector, Notifications, Wallet */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Offline / Online Service Worker Indicator */}
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-2xs ${
                isOnline
                  ? 'bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-900 border-emerald-200/80'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border-amber-500/40 animate-pulse'
              }`}
              title={isOnline ? 'Service Worker Active • Online Mode' : 'Offline Mode Active • Running from Cache'}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden xl:inline font-mono text-[11px]">Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span className="font-mono text-[11px] text-amber-900 font-bold">Offline Active</span>
                </>
              )}
            </button>

            {/* Animatic Logo Reveal Button */}
            <button
              onClick={() => setIsLogoSplashOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 px-2.5 py-1.5 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-2xs group"
              title="Play Kisan Bhai Animatic Logo Intro"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform" />
              <span className="hidden xl:inline">{language === 'hi' ? 'लोगो इंट्रो' : 'Logo Intro'}</span>
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-xl bg-white/60 dark:bg-stone-800/60 hover:bg-white/90 border border-stone-200/80 dark:border-stone-700 transition-colors shadow-2xs cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsLangMenuOpen(!isLangMenuOpen);
                  setIsRoleMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/70 dark:bg-stone-800/70 hover:bg-white dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 px-3 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-700 backdrop-blur-md transition-all cursor-pointer shadow-2xs"
                title="Change Application Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{currentLangObj.flag} {currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#161c14] rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span>भाषा / Language</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-normal">12 Languages</span>
                  </div>
                  <div className="p-1 grid grid-cols-1 gap-0.5">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangMenuOpen(false);
                          addToast('Language Changed', `Switched to ${lang.nativeName} (${lang.name})`, 'info');
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          language === lang.code
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold border-l-2 border-emerald-600'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span className="font-semibold">{lang.nativeName}</span>
                        </span>
                        <span className="text-[11px] text-stone-400 font-normal">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 bg-white/60 hover:bg-white/90 text-stone-800 text-xs font-medium px-3 py-1.5 rounded-xl border border-stone-200/80 backdrop-blur-md transition-all cursor-pointer shadow-2xs"
              >
                <div className="w-2 h-2 rounded-full bg-[#2D4F1E]"></div>
                <span className="font-semibold">
                  {userRole === 'FARMER' && 'Farmer View'}
                  {userRole === 'CHAMPION' && 'Champion View'}
                  {userRole === 'BUYER' && 'Buyer View'}
                  {userRole === 'ADMIN' && 'Admin View'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-100/80">
                    Switch Active Persona
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSelect(r.role)}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-emerald-50/70 transition-colors ${
                        userRole === r.role ? 'bg-emerald-50/90 border-l-2 border-[#2D4F1E]' : ''
                      }`}
                    >
                      <span className="font-semibold text-stone-900">{r.label}</span>
                      <span className="text-[11px] text-stone-500">{r.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account / Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-white/70 hover:bg-white text-stone-900 text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-200/80 backdrop-blur-md transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-900 font-bold flex items-center justify-center text-[10px]">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{currentUser.fullName}</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2 border-b border-stone-100">
                      <div className="font-bold text-xs text-stone-900 truncate">{currentUser.fullName}</div>
                      <div className="text-[11px] text-stone-500 truncate">{currentUser.email || currentUser.phone}</div>
                      <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                        {currentUser.village} • {currentUser.role}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-emerald-50/70 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span>Farm Profile & ID</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('login');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-emerald-50/70 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-stone-500" />
                      <span>Switch / Link Account</span>
                    </button>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50/70 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="flex items-center gap-1.5 bg-[#2D4F1E] hover:bg-[#223d16] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer border border-white/20 active:scale-[0.99]"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-200" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Algorand Testnet Wallet Button */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 bg-[#2D4F1E] hover:bg-[#223d16] text-white text-xs font-medium px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer border border-white/20"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-200" />
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold">{wallet.usdcBalance.toFixed(2)} USDC</span>
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-md text-emerald-200 font-mono">
                  Testnet
                </span>
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-1.5">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-stone-700 dark:text-stone-300 bg-white/60 dark:bg-stone-800/60 backdrop-blur-md rounded-xl border border-stone-200/80 dark:border-stone-700"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center ${
                isOnline
                  ? 'bg-emerald-50/80 text-emerald-900 border-emerald-200'
                  : 'bg-amber-500/20 text-amber-950 border-amber-500 animate-pulse'
              }`}
              title="Offline Field Hub"
            >
              {isOnline ? <Wifi className="w-4 h-4 text-emerald-700" /> : <WifiOff className="w-4 h-4 text-amber-700" />}
            </button>
            <button
              onClick={() => setCurrentView('login')}
              className="p-2 text-stone-700 bg-white/60 backdrop-blur-md rounded-xl border border-stone-200/80 text-xs font-semibold flex items-center gap-1"
            >
              <LogIn className="w-4 h-4 text-[#2D4F1E]" />
            </button>
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="p-2 text-stone-700 bg-white/60 backdrop-blur-md rounded-xl border border-stone-200/80"
            >
              <Wallet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 bg-white/60 backdrop-blur-md rounded-xl border border-stone-200/80"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-2xl border-b border-stone-200/80 px-4 pt-2 pb-6 space-y-3">
          {/* User Status Bar in Mobile Drawer */}
          <div className="p-3 bg-white/80 rounded-2xl border border-stone-200/80 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#2D4F1E] text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{currentUser.fullName}</div>
                  <div className="text-[10px] text-stone-500">{currentUser.role}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-600 font-medium">Guest Visitor</div>
            )}

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="text-[11px] text-rose-700 font-semibold hover:underline"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentView('login');
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs bg-[#2D4F1E] text-white font-semibold px-3 py-1.5 rounded-xl"
              >
                Sign In
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-stone-200/80">
            <button
              onClick={() => {
                setIsLogoSplashOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="col-span-2 text-xs text-center py-2 bg-amber-50 text-amber-900 font-semibold rounded-xl border border-amber-300/60 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>{language === 'hi' ? '✨ एनिमेटेड लोगो इंट्रो देखें' : '✨ Play Animatic Logo Intro'}</span>
            </button>
            <div className="col-span-2 pt-1 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-1 mb-1.5">
                {t('settings', 'भाषा')} / Language
              </span>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200/60 dark:border-stone-800">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      addToast('Language Changed', `Switched to ${lang.nativeName}`, 'info');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      language === lang.code
                        ? 'bg-[#2D4F1E] text-white font-bold shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/50 dark:border-stone-700/50'
                    }`}
                  >
                    <span className="text-sm leading-tight">{lang.flag}</span>
                    <span className="text-[11px] font-medium leading-tight">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setIsNfcModalOpen(true)}
              className="col-span-2 text-xs text-center py-2 bg-white/70 rounded-xl font-medium flex items-center justify-center gap-1 border border-stone-200/60"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-700" />
              NFC ID
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-2">
              Navigation
            </span>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentView(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium ${
                  currentView === link.id ? 'bg-[#2D4F1E]/10 text-[#2D4F1E] font-semibold' : 'text-stone-700'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-2">
              Persona / Role
            </span>
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  handleRoleSelect(r.role);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium ${
                  userRole === r.role ? 'bg-[#2D4F1E] text-white' : 'text-stone-700 hover:bg-stone-100/70'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
