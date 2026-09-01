import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  ShieldCheck,
  UserCheck,
  Building,
  BarChart3,
  ArrowRight,
  UserPlus,
  LogIn,
  Radio,
  Phone,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wheat,
  Layers,
  Coins,
  Cpu,
  Fingerprint,
  ScanFace,
  KeyRound,
  Smartphone,
} from 'lucide-react';
import { UserRole, UserProfile } from '../../shared/types';
import { AnimatedKishanLogo } from '../components/AnimatedKishanLogo';
import {
  checkBiometricCapability,
  authenticateWithBiometrics,
  getLocalPasskeys,
  BiometricDeviceCapability,
} from '../services/biometricAuth';

export const LoginPage: React.FC = () => {
  const {
    setCurrentUser,
    setUserRole,
    setCurrentView,
    addToast,
    language,
    setIsNfcModalOpen,
    setIsLogoSplashOpen,
    triggerBiometricPrompt,
    enrolledPasskeys,
  } = useApp();

  // Mode: 'login' | 'biometric' | 'register' | 'nfc' | 'roles'
  const [activeTab, setActiveTab] = useState<'login' | 'biometric' | 'register' | 'nfc' | 'roles'>('login');
  const [deviceCap, setDeviceCap] = useState<BiometricDeviceCapability | null>(null);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [bioScanType, setBioScanType] = useState<'fingerprint' | 'face'>('fingerprint');

  useEffect(() => {
    checkBiometricCapability().then((cap) => {
      setDeviceCap(cap);
      if (cap.deviceType === 'face_id') {
        setBioScanType('face');
      }
    });
  }, []);

  // Sign In Form States
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register Form States
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('FARMER');
  const [regVillage, setRegVillage] = useState('Anandpur');
  const [regState, setRegState] = useState('Gujarat');
  const [regFarmAcres, setRegFarmAcres] = useState('4.0');
  const [regCrops, setRegCrops] = useState('Cotton, Wheat, Groundnut');

  // NFC Mock tap state
  const [isNfcScanning, setIsNfcScanning] = useState(false);

  const navigateToRoleDashboard = (targetRole: UserRole) => {
    switch (targetRole) {
      case 'FARMER':
        setCurrentView('farmer-dashboard');
        break;
      case 'CHAMPION':
        setCurrentView('champion-dashboard');
        break;
      case 'BUYER':
        setCurrentView('buyer-dashboard');
        break;
      case 'ADMIN':
        setCurrentView('admin-dashboard');
        break;
      default:
        setCurrentView('farmer-dashboard');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setErrorMessage(
        loginMethod === 'phone'
          ? 'Please enter a valid 10-digit mobile number'
          : 'Please enter your registered email'
      );
      return;
    }
    setErrorMessage('');
    setIsOtpSent(true);
    setLoginOtp('4020'); // Demo instant OTP
    addToast(
      'OTP Sent Successfully',
      `Verification code sent to ${loginIdentifier}. (Use code: 4020 for instant test verification)`,
      'info'
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          otp: loginOtp,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        addToast('Login Successful', `Welcome back, ${data.user.fullName}!`, 'success');
        navigateToRoleDashboard(data.user.role);
      } else {
        // If user doesn't exist, provide a direct one-click auto-registration suggestion
        setErrorMessage(data.error || 'Account not found.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRegisterFromLogin = async () => {
    setIsSubmitting(true);
    const isEmail = loginIdentifier.includes('@');
    const autoUser = {
      email: isEmail ? loginIdentifier.trim() : `farmer_${Date.now()}@kishanbhai.in`,
      phone: !isEmail ? loginIdentifier.trim() : '+91 98765 43210',
      fullName: isEmail ? loginIdentifier.split('@')[0] : 'Farmer Member',
      role: 'FARMER' as UserRole,
      village: 'Anandpur',
      state: 'Gujarat',
      farmSizeAcres: 3.5,
      crops: ['Cotton', 'Wheat'],
      preferredLanguage: (language === 'hi' ? 'hi' : 'en') as 'en' | 'hi',
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoUser),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        addToast('Account Created & Signed In', `Welcome, ${data.user.fullName}!`, 'success');
        navigateToRoleDashboard(data.user.role);
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || (!regEmail.trim() && !regPhone.trim())) {
      setErrorMessage('Full name and at least an email or phone number are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          email: regEmail.trim() || `usr_${Date.now()}@kishanbhai.in`,
          phone: regPhone.trim() || '+91 98000 00000',
          role: regRole,
          village: regVillage.trim() || 'Anandpur',
          state: regState.trim() || 'Gujarat',
          farmSizeAcres: regRole === 'FARMER' ? Number(regFarmAcres) || 3.5 : undefined,
          crops: regRole === 'FARMER' ? regCrops.split(',').map((c) => c.trim()).filter(Boolean) : undefined,
          preferredLanguage: (language === 'hi' ? 'hi' : 'en') as 'en' | 'hi',
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        addToast('Registration Successful', `Welcome to Kishan Bhai, ${data.user.fullName}!`, 'success');
        navigateToRoleDashboard(data.user.role);
      } else {
        setErrorMessage(data.error || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantRoleInit = async (chosenRole: UserRole, defaultName: string) => {
    const freshUser: UserProfile = {
      id: `usr_${chosenRole.toLowerCase()}_${Date.now()}`,
      email: `${chosenRole.toLowerCase()}_${Date.now()}@kishanbhai.in`,
      fullName: defaultName,
      phone: '+91 98765 00000',
      role: chosenRole,
      village: 'Anandpur',
      state: 'Gujarat',
      verified: true,
      farmSizeAcres: chosenRole === 'FARMER' ? 4.5 : undefined,
      crops: chosenRole === 'FARMER' ? ['Cotton', 'Groundnut', 'Wheat'] : undefined,
      preferredLanguage: (language === 'hi' ? 'hi' : 'en') as 'en' | 'hi',
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(freshUser),
      });
    } catch {}

    setCurrentUser(freshUser);
    setUserRole(chosenRole);
    addToast('Profile Initialized', `Logged in as ${defaultName} (${chosenRole})`, 'success');
    navigateToRoleDashboard(chosenRole);
  };

  const handleBiometricAuth = async () => {
    setIsBiometricScanning(true);
    setErrorMessage('');

    try {
      const result = await authenticateWithBiometrics({
        identifier: loginIdentifier.trim() || undefined,
      });

      if (result.success && result.user) {
        setCurrentUser(result.user);
        setUserRole(result.user.role);
        addToast(
          'Biometric Verification Passed',
          `Authenticated via ${result.credential?.deviceName || 'Biometric Sensor'}. Welcome, ${result.user.fullName}!`,
          'success'
        );
        navigateToRoleDashboard(result.user.role);
      } else {
        setErrorMessage(result.error || 'Biometric authentication failed. Please try passwordless sign in or register.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Biometric verification error.');
    } finally {
      setIsBiometricScanning(false);
    }
  };

  const handleNfcCardScan = () => {
    setIsNfcScanning(true);
    setTimeout(async () => {
      setIsNfcScanning(false);
      const cardUser: UserProfile = {
        id: `usr_nfc_${Date.now()}`,
        email: `nfc.farmer_${Date.now()}@kishanbhai.in`,
        fullName: 'Smart Card Farmer',
        phone: '+91 98450 11223',
        role: 'FARMER',
        village: 'Anandpur Hub',
        state: 'Gujarat',
        verified: true,
        farmSizeAcres: 5.0,
        crops: ['Cotton', 'Wheat'],
        createdAt: new Date().toISOString(),
      };

      try {
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardUser),
        });
      } catch {}

      setCurrentUser(cardUser);
      setUserRole('FARMER');
      addToast('NFC Smart Card Verified', 'Authenticated via contactless Kishan Card.', 'success');
      navigateToRoleDashboard('FARMER');
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-6 sm:py-10 max-w-6xl mx-auto">
      <div className="w-full space-y-6">
        {/* Brand Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
          <div className="flex items-center gap-3">
            <AnimatedKishanLogo
              size="md"
              showText={true}
              interactive={true}
              withSound={true}
              subtitle={language === 'hi' ? 'किसान प्रमाणीकरण पोर्टल' : 'Official Stakeholder Portal'}
              onClick={() => setIsLogoSplashOpen(true)}
            />
          </div>

          {/* Action Buttons: Animatic Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLogoSplashOpen(true)}
              className="group flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 px-3.5 py-2 rounded-2xl border border-amber-500/30 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Play Animatic Brand Logo Intro"
            >
              <Sparkles className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
              <span>{language === 'hi' ? '✨ लोगो इंट्रो' : '✨ Animatic Logo'}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Column Platform Info + Right Column Login Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Agricultural Ecosystem Highlights */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/90 backdrop-blur-md rounded-[28px] p-6 border border-stone-200/80 shadow-sm space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-[#2D4F1E]/10 text-[#2D4F1E] text-xs px-3 py-1 rounded-full font-semibold border border-[#2D4F1E]/20">
                  <Sprout className="w-3.5 h-3.5 text-[#2D4F1E]" />
                  <span>{language === 'hi' ? 'स्मार्ट एग्री नेटवर्क' : 'Virtual Farm Cluster Network'}</span>
                </div>
                <h2 className="text-xl font-bold font-serif-display text-stone-900 tracking-tight">
                  {language === 'hi' ? 'छोटे किसान, एक शक्तिशाली नेटवर्क' : 'Empowering Smallholder Farmers'}
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'hi'
                    ? 'किसान भाई भारतीय छोटे किसानों को डिजिटल क्लस्टर्स में जोड़कर भारी छूट, सीधी मंडी पहुंच और स्वायत्त एआई परामर्श उपलब्ध कराता है।'
                    : 'Uniting local farming communities into scalable virtual clusters with bulk procurement discounts, collective grain pooling, and Algorand micropayments.'}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#2D4F1E] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Layers className="w-4 h-4 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900">Virtual Farm Clusters</h3>
                    <p className="text-[11px] text-stone-600">20–30% bulk savings on high-yield seeds and NPK fertilizers</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Coins className="w-4 h-4 text-amber-100" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900">x402 Micropayments</h3>
                    <p className="text-[11px] text-stone-600">Frictionless 0.001 ALGO sub-cent queries on Algorand Testnet</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Cpu className="w-4 h-4 text-blue-100" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900">Autonomous Agronomist AI</h3>
                    <p className="text-[11px] text-stone-600">Instant multi-lingual pest diagnostics and soil health insights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Login Personas Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>One-Click Instant Access</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-mono font-semibold">Testnet Ready</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleInstantRoleInit('FARMER', 'Ramesh Patel')}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-emerald-900 block truncate">Ramesh P.</span>
                  <span className="text-[10px] text-emerald-700 font-medium">Farmer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantRoleInit('CHAMPION', 'Anita Devi')}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-stone-900 block truncate">Anita Devi</span>
                  <span className="text-[10px] text-stone-600 font-medium">Champion</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantRoleInit('BUYER', 'Vikram Mehta')}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-stone-900 block truncate">Vikram M.</span>
                  <span className="text-[10px] text-stone-600 font-medium">Buyer</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sign In / Register / NFC Form */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Navigation Tabs */}
            <div className="bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 flex flex-wrap gap-1 shadow-2xs">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                }}
                className={`flex-1 min-w-[70px] py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-[#2D4F1E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('biometric');
                  setErrorMessage('');
                }}
                className={`flex-1 min-w-[75px] py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'biometric'
                    ? 'bg-[#2D4F1E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                <span>Biometrics</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
                className={`flex-1 min-w-[70px] py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-[#2D4F1E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('nfc');
                  setErrorMessage('');
                }}
                className={`flex-1 min-w-[70px] py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'nfc'
                    ? 'bg-[#2D4F1E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>NFC Card</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('roles');
                  setErrorMessage('');
                }}
                className={`flex-1 min-w-[70px] py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'roles'
                    ? 'bg-[#2D4F1E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>All Roles</span>
              </button>
            </div>

            {/* Main Card Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-5 sm:p-7 border border-white/90 shadow-xl space-y-5">
          {/* Error Message Display */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-900 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {activeTab === 'login' && (
                  <button
                    onClick={handleQuickRegisterFromLogin}
                    className="block text-emerald-800 font-bold underline mt-1 hover:text-emerald-950 cursor-pointer"
                  >
                    Click here to instantly create this account & sign in →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Method Switcher */}
              <div className="flex bg-stone-100/80 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone');
                    setLoginIdentifier('');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === 'phone' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile Phone Number</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setLoginIdentifier('');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === 'email' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Address</span>
                </button>
              </div>

              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 block">
                  {loginMethod === 'phone' ? 'Mobile Number (10 Digits)' : 'Registered Email Address'}
                </label>
                <div className="relative">
                  <input
                    type={loginMethod === 'phone' ? 'tel' : 'email'}
                    required
                    placeholder={loginMethod === 'phone' ? '+91 98765 43210' : 'farmer@example.com'}
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E] focus:ring-1 focus:ring-[#2D4F1E]"
                  />
                </div>
              </div>

              {/* OTP Input or Direct Button */}
              {isOtpSent ? (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-stone-700">Enter Verification Code (OTP)</label>
                    <span className="text-[10px] text-emerald-700 font-semibold">Demo OTP: 4020</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 4-digit code"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 tracking-widest text-center font-mono font-bold focus:outline-none focus:border-[#2D4F1E]"
                  />
                </div>
              ) : null}

              {/* Submit Buttons */}
              <div className="pt-2 space-y-2">
                {!isOtpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full bg-[#2D4F1E] hover:bg-[#223d16] text-white font-medium py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-white/20 active:scale-[0.99]"
                  >
                    <span>Get Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2D4F1E] hover:bg-[#223d16] text-white font-medium py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-white/20 active:scale-[0.99]"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Verify & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBiometricAuth}
                  disabled={isBiometricScanning}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 border border-emerald-300/80 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-700" />
                  <span>One-Touch Biometric Sign In (Passkey / Sensor)</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white/80 hover:bg-white text-stone-700 font-medium py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 border border-stone-200 shadow-2xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2D4F1E]" />
                  <span>Direct Passwordless Sign In</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-stone-500">Don't have a registered account yet? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs font-semibold text-[#2D4F1E] hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* TAB 1.5: BIOMETRIC / PASSKEY AUTH */}
          {activeTab === 'biometric' && (
            <div className="space-y-5 text-center py-2">
              {/* Header explanation */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Hardware-Backed Agricultural ID</span>
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {language === 'hi' ? 'बायोमेट्रिक से तुरंत लॉगिन करें' : 'One-Touch Biometric Sign In'}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {language === 'hi'
                    ? 'अपने फोन या कंप्यूटर के फिंगरप्रिंट / फेस अनलॉक से सुरक्षित और बिना पासवर्ड तुरंत प्रवेश करें।'
                    : 'Authenticate instantly using your device hardware biometric sensor (Touch ID, Face ID, Android Biometrics, or Windows Hello).'}
                </p>
              </div>

              {/* Mode switch between Fingerprint & Face ID */}
              <div className="flex bg-stone-100 p-1 rounded-xl max-w-xs mx-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBioScanType('fingerprint')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bioScanType === 'fingerprint'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Fingerprint Sensor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBioScanType('face')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bioScanType === 'face'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ScanFace className="w-3.5 h-3.5 text-blue-600" />
                  <span>Face Unlock</span>
                </button>
              </div>

              {/* Sensor Touch Target */}
              <div className="py-2">
                <div
                  onClick={!isBiometricScanning ? handleBiometricAuth : undefined}
                  className={`relative mx-auto w-36 h-36 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-2 select-none ${
                    isBiometricScanning
                      ? 'bg-emerald-500/10 border-emerald-500 ring-8 ring-emerald-500/10 scale-105'
                      : 'bg-stone-50 hover:bg-stone-100/90 border-stone-300 hover:border-emerald-600 hover:shadow-lg'
                  }`}
                >
                  {isBiometricScanning && (
                    <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse rounded-full" />
                  )}

                  {bioScanType === 'fingerprint' ? (
                    <div className="space-y-2 text-center">
                      <Fingerprint
                        className={`w-16 h-16 mx-auto transition-all ${
                          isBiometricScanning ? 'text-emerald-700 animate-pulse' : 'text-stone-700'
                        }`}
                      />
                      <span className="text-[11px] font-bold text-stone-700 block">
                        {isBiometricScanning ? 'Verifying Sensor...' : 'Touch to Authenticate'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center">
                      <ScanFace
                        className={`w-16 h-16 mx-auto transition-all ${
                          isBiometricScanning ? 'text-blue-600 animate-pulse' : 'text-stone-700'
                        }`}
                      />
                      <span className="text-[11px] font-bold text-stone-700 block">
                        {isBiometricScanning ? 'Aligning Biometrics...' : 'Look at Sensor'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Detected Hardware Info */}
              <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 text-left space-y-1.5 max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-stone-600" />
                    <span>Active Hardware:</span>
                  </span>
                  <span className="font-semibold text-stone-800 font-mono text-[11px]">
                    {deviceCap?.deviceName || 'Platform Biometrics'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-stone-600" />
                    <span>Passkey Security:</span>
                  </span>
                  <span className="font-semibold text-emerald-700 text-[11px]">
                    FIDO2 / WebAuthn Level 3
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 max-w-sm mx-auto pt-1">
                <button
                  type="button"
                  disabled={isBiometricScanning}
                  onClick={handleBiometricAuth}
                  className="w-full bg-[#2D4F1E] hover:bg-[#223d16] text-white font-semibold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 active:scale-[0.99] disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isBiometricScanning ? 'Reading Biometric Sensor...' : 'Scan Biometrics to Sign In'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Use Mobile Number & OTP Instead
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-700">Account Role *</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                  >
                    <option value="FARMER">Smallholder Farmer</option>
                    <option value="CHAMPION">Village Champion (Hub Lead)</option>
                    <option value="BUYER">Institutional Buyer</option>
                    <option value="ADMIN">Platform Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-700">Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-700">Village / Hub</label>
                  <input
                    type="text"
                    placeholder="e.g. Anandpur"
                    value={regVillage}
                    onChange={(e) => setRegVillage(e.target.value)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-700">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Gujarat"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                  />
                </div>
              </div>

              {regRole === 'FARMER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-700">Farm Holding (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="4.0"
                      value={regFarmAcres}
                      onChange={(e) => setRegFarmAcres(e.target.value)}
                      className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-700">Cultivated Crops</label>
                    <input
                      type="text"
                      placeholder="Cotton, Wheat, Mustard"
                      value={regCrops}
                      onChange={(e) => setRegCrops(e.target.value)}
                      className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2D4F1E] hover:bg-[#223d16] text-white font-medium py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-white/20 active:scale-[0.99] mt-2"
              >
                <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration & Enter Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: NFC SMART CARD */}
          {activeTab === 'nfc' && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 text-[#2D4F1E] border border-emerald-600/20 flex items-center justify-center mx-auto shadow-inner">
                <Radio className={`w-10 h-10 ${isNfcScanning ? 'animate-ping' : ''}`} />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-bold font-display text-lg text-stone-900">
                  {isNfcScanning ? 'Scanning Card Signal...' : 'Hold Smart ID Card to Device'}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Village Champions issue contactless smart cards to farmers. Tap below to simulate instant hardware card recognition.
                </p>
              </div>

              <button
                type="button"
                disabled={isNfcScanning}
                onClick={handleNfcCardScan}
                className="bg-[#2D4F1E] hover:bg-[#223d16] text-white font-semibold px-6 py-3.5 rounded-2xl text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer border border-white/20 active:scale-[0.99]"
              >
                <Radio className="w-4 h-4 text-emerald-300" />
                <span>{isNfcScanning ? 'Reading Smart Card Chip...' : 'Simulate NFC Tap & Sign In'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: QUICK STAKEHOLDER ROLES */}
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-500 mb-2">
                Instantly initialize a fresh persona to evaluate role-specific dashboards:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    role: 'FARMER' as UserRole,
                    name: 'Smallholder Farmer',
                    icon: Sprout,
                    desc: 'Acreage aggregation, input demands & x402 AI.',
                  },
                  {
                    role: 'CHAMPION' as UserRole,
                    name: 'Village Champion',
                    icon: UserCheck,
                    desc: 'Cluster management, bulk pooling & rosters.',
                  },
                  {
                    role: 'BUYER' as UserRole,
                    name: 'Institutional Buyer',
                    icon: Building,
                    desc: 'Catalog procurement & escrow bidding.',
                  },
                  {
                    role: 'ADMIN' as UserRole,
                    name: 'System Admin',
                    icon: BarChart3,
                    desc: 'Algorand Testnet & x402 telemetry.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.role}
                      onClick={() => handleInstantRoleInit(item.role, item.name)}
                      className="bg-white/80 hover:bg-white p-3.5 rounded-2xl border border-stone-200/80 hover:border-[#2D4F1E] transition-all cursor-pointer group shadow-2xs flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-[#2D4F1E] group-hover:bg-[#2D4F1E] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900 group-hover:text-[#2D4F1E]">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-stone-500 leading-tight mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end text-[10px] font-semibold text-[#2D4F1E]">
                        <span>Enter →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
            </div>
          </div>
        </div>

        {/* Security / Algorand Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Secured with Algorand Testnet Cryptographic Signatures & x402 Protocol</span>
        </div>
      </div>
    </div>
  );
};
