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
} from 'lucide-react';
import { UserRole } from '../../shared/types';
import { NotificationCenter } from './NotificationCenter';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    userRole,
    setUserRole,
    language,
    setLanguage,
    wallet,
    currentView,
    setCurrentView,
    setIsWalletModalOpen,
    setIsNfcModalOpen,
    addToast,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'FARMER', label: 'Farmer (किसान)', desc: 'Farm management, clusters & AI' },
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
    { id: 'farmer-dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड' },
    { id: 'ai-assistant', labelEn: 'Kisan AI', labelHi: 'किसान AI' },
    { id: 'disease-scanner', labelEn: 'Disease Scanner', labelHi: 'रोग स्कैनर' },
    { id: 'smart-irrigation', labelEn: 'Smart Irrigation', labelHi: 'स्मार्ट सिंचाई' },
    { id: 'market-prices', labelEn: 'Mandi Rates', labelHi: 'मंडी भाव' },
    { id: 'government-schemes', labelEn: 'Govt Schemes', labelHi: 'सरकारी योजनाएं' },
    { id: 'clusters', labelEn: 'Virtual Clusters', labelHi: 'फार्म क्लस्टर' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-stone-200/60 shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#2D4F1E] flex items-center justify-center text-white shadow-md group-hover:bg-[#223d16] transition-colors border border-white/20">
              <Sprout className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold font-display text-xl tracking-tight text-stone-900">
                  KISAN BHAI
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-[#2D4F1E] border border-emerald-600/20 px-2 py-0.5 rounded-full">
                  किसान भाई
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block -mt-0.5">
                Your AI Farming Partner — From Seed to Sale
              </p>
            </div>
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
                  {language === 'hi' ? link.labelHi : link.labelEn}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language, Role Selector, Notifications, Wallet */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Notification Center */}
            <NotificationCenter />

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 text-xs font-medium bg-white/60 hover:bg-white/90 text-stone-700 px-3 py-1.5 rounded-xl border border-stone-200/80 backdrop-blur-md transition-all cursor-pointer shadow-2xs"
              title="Toggle English / Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

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
          <div className="flex md:hidden items-center space-x-2">
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
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="text-xs text-center py-2 bg-white/70 rounded-xl font-medium border border-stone-200/60"
            >
              Language: {language === 'en' ? 'English' : 'हिन्दी'}
            </button>
            <button
              onClick={() => setIsNfcModalOpen(true)}
              className="text-xs text-center py-2 bg-white/70 rounded-xl font-medium flex items-center justify-center gap-1 border border-stone-200/60"
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
                {language === 'hi' ? link.labelHi : link.labelEn}
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
