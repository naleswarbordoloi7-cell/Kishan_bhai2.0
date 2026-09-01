import React, { useState } from 'react';
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
} from 'lucide-react';
import { UserRole, UserProfile } from '../../shared/types';

export const LoginPage: React.FC = () => {
  const { setCurrentUser, setUserRole, setCurrentView, addToast, language, setIsNfcModalOpen } = useApp();

  // Mode: 'login' | 'register' | 'nfc' | 'roles'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'nfc' | 'roles'>('login');

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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand & Title Banner */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 bg-[#2D4F1E]/10 text-[#2D4F1E] text-xs px-3.5 py-1 rounded-full font-mono border border-[#2D4F1E]/20 font-semibold">
            <Sprout className="w-3.5 h-3.5 text-[#2D4F1E]" />
            <span>Kishan Bhai Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-stone-900 tracking-tight">
            {activeTab === 'login' && 'Sign in to Kishan Bhai'}
            {activeTab === 'register' && 'Create your farm account'}
            {activeTab === 'nfc' && 'Smart NFC card sign in'}
            {activeTab === 'roles' && 'Stakeholder demo access'}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            {activeTab === 'login' && 'Access your farm holdings, active clusters, and x402 AI advisory.'}
            {activeTab === 'register' && 'Join the digital network of smallholder farmers and verified buyers.'}
            {activeTab === 'nfc' && 'Tap your physical Kisan Smart Card to login without typing.'}
            {activeTab === 'roles' && 'Select an authentic persona to explore the complete stakeholder suite.'}
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex justify-center">
          <div className="bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80 flex flex-wrap justify-center gap-1 shadow-2xs">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
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
                setActiveTab('register');
                setErrorMessage('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'nfc'
                  ? 'bg-[#2D4F1E] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>NFC Tap</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('roles');
                setErrorMessage('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roles'
                  ? 'bg-[#2D4F1E] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Roles</span>
            </button>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xl space-y-6">
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

        {/* Security / Algorand Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Secured with Algorand Testnet Cryptographic Signatures & x402 Protocol</span>
        </div>
      </div>
    </div>
  );
};
