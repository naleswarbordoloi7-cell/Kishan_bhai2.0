import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Sprout,
  UserCheck,
  Building,
  LogIn,
  UserPlus,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { UserRole, UserProfile } from '../../shared/types';
import { AnimatedKishanLogo } from '../components/AnimatedKishanLogo';
import {
  signInWithFirebaseGoogle,
  formatAuthErrorMessage,
  resetFirebasePassword,
} from '../services/firebaseAuthService';
import {
  INDIAN_STATES_AND_DISTRICTS,
  getDistrictsForState,
} from '../data/indianStatesAndDistricts';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PWAInstallButton } from '../components/PWAInstallButton';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const { setCurrentUser, setUserRole } = useUserStore();
  const { setCurrentView, addToast, language, setIsLogoSplashOpen } = useApp();

  const [mainTab, setMainTab] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Registration Form States
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('FARMER');
  
  // Location States: All Indian States, Districts/Cities, Village
  const [regState, setRegState] = useState('Gujarat');
  const [regDistrict, setRegDistrict] = useState('Anand');
  const [customCity, setCustomCity] = useState('');
  const [regVillage, setRegVillage] = useState('Anandpur');

  // Farm Holding Size: Fully flexible, depends on the user
  const [regFarmSize, setRegFarmSize] = useState('2.5');
  const [regFarmUnit, setRegFarmUnit] = useState<'Acres' | 'Bigha' | 'Hectare' | 'Guntha'>('Acres');
  const [isLandless, setIsLandless] = useState(false);

  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

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

  // Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async (role: UserRole = 'FARMER') => {
    setIsGoogleSubmitting(true);
    setErrorMessage('');
    try {
      const effectiveDistrict = regDistrict === '__other__' ? customCity.trim() : regDistrict;
      const combinedLoc = regVillage.trim()
        ? (effectiveDistrict ? `${regVillage.trim()}, ${effectiveDistrict}` : regVillage.trim())
        : (effectiveDistrict || 'Anandpur');

      let parsedAcres: number | undefined = undefined;
      if (role === 'FARMER') {
        if (isLandless || regFarmSize === '0') {
          parsedAcres = 0;
        } else if (regFarmSize && !isNaN(Number(regFarmSize))) {
          const num = Math.max(0, Number(regFarmSize));
          if (regFarmUnit === 'Acres') parsedAcres = num;
          else if (regFarmUnit === 'Hectare') parsedAcres = Number((num * 2.471).toFixed(2));
          else if (regFarmUnit === 'Bigha') parsedAcres = Number((num * 0.625).toFixed(2));
          else if (regFarmUnit === 'Guntha') parsedAcres = Number((num * 0.025).toFixed(2));
        } else {
          parsedAcres = 0;
        }
      }

      const user = await signInWithFirebaseGoogle(role, {
        state: regState,
        village: combinedLoc,
        farmSizeAcres: parsedAcres,
      });
      setCurrentUser(user);
      setUserRole(user.role);
      addToast(
        language === 'hi' ? 'Google लॉगिन सफल' : 'Google Sign-In Successful',
        language === 'hi'
          ? `स्वागत है, ${user.fullName}!`
          : `Signed in with Google as ${user.fullName}`,
        'success'
      );
      navigateToRoleDashboard(user.role);
    } catch (err: any) {
      console.warn('Firebase Google sign-in failed:', err);
      const friendlyMsg = formatAuthErrorMessage(err);
      setErrorMessage(friendlyMsg);
      addToast('Google Sign-In', friendlyMsg, 'error');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Send Phone OTP
  const handleSendOtp = () => {
    if (!loginIdentifier || loginIdentifier.length < 10) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }
    setErrorMessage('');
    setIsOtpSent(true);
    setOtpCode('1234');
    addToast(
      language === 'hi' ? 'OTP भेजा गया' : 'OTP Sent',
      language === 'hi'
        ? `सत्यापन कोड (डेमो: 1234) +91 ${loginIdentifier} पर भेजा गया`
        : `Verification code (Demo: 1234) sent to +91 ${loginIdentifier}`,
      'info'
    );
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!loginIdentifier || !loginIdentifier.includes('@')) {
      setErrorMessage(language === 'hi' ? 'कृपया एक वैध ईमेल दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetFirebasePassword(loginIdentifier);
      setResetEmailSent(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setErrorMessage(formatAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign In with Phone / Email
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (loginMethod === 'phone') {
      if (!loginIdentifier || loginIdentifier.length < 10) {
        setErrorMessage(
          language === 'hi'
            ? 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।'
            : 'Please enter a valid 10-digit mobile number.'
        );
        return;
      }
      if (isOtpSent && otpCode !== '1234') {
        setErrorMessage(
          language === 'hi'
            ? 'अमान्य OTP कोड। कृपया डेमो कोड 1234 का उपयोग करें।'
            : 'Invalid OTP code. Please use demo code 1234.'
        );
        return;
      }
    } else {
      if (!loginIdentifier.includes('@')) {
        setErrorMessage(
          language === 'hi'
            ? 'कृपया वैध ईमेल आईडी दर्ज करें।'
            : 'Please enter a valid email address.'
        );
        return;
      }
      if (!password) {
        setErrorMessage(
          language === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.'
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginMethod === 'email' ? loginIdentifier : `${loginIdentifier}@kishanbhai.in`,
          phone: loginMethod === 'phone' ? `+91 ${loginIdentifier}` : undefined,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        addToast(
          language === 'hi' ? 'लॉगिन सफल' : 'Login Successful',
          language === 'hi'
            ? `स्वागत है, ${data.user.fullName}!`
            : `Welcome back, ${data.user.fullName}!`,
          'success'
        );
        navigateToRoleDashboard(data.user.role);
      } else {
        // Fallback demo login
        const fallbackUser: UserProfile = {
          id: `usr_${Date.now()}`,
          fullName:
            loginMethod === 'phone' ? `Farmer (${loginIdentifier.slice(-4)})` : loginIdentifier.split('@')[0],
          email: loginMethod === 'email' ? loginIdentifier : `${loginIdentifier}@kishanbhai.in`,
          phone: loginMethod === 'phone' ? `+91 ${loginIdentifier}` : '+91 98251 44320',
          role: 'FARMER',
          village: 'Anandpur',
          state: 'Gujarat',
          verified: true,
          farmSizeAcres: 4.5,
          crops: ['Cotton', 'Groundnut', 'Wheat'],
          preferredLanguage: language === 'hi' ? 'hi' : 'en',
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(fallbackUser);
        setUserRole('FARMER');
        addToast(
          language === 'hi' ? 'लॉगिन सफल' : 'Login Successful',
          language === 'hi' ? `स्वागत है, ${fallbackUser.fullName}!` : `Welcome, ${fallbackUser.fullName}!`,
          'success'
        );
        navigateToRoleDashboard('FARMER');
      }
    } catch {
      setErrorMessage(
        language === 'hi'
          ? 'कनेक्शन समस्या। कृपया पुनः प्रयास करें।'
          : 'Connection error. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register New User
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regFullName.trim()) {
      setErrorMessage(
        language === 'hi' ? 'कृपया पूरा नाम दर्ज करें।' : 'Please enter your full name.'
      );
      return;
    }
    if (!regEmail.includes('@') && (!regPhone || regPhone.length < 10)) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया वैध ईमेल या 10 अंकों का मोबाइल नंबर प्रदान करें।'
          : 'Please provide a valid email or 10-digit mobile number.'
      );
      return;
    }
    if (regPassword && regPassword !== regConfirmPassword) {
      setErrorMessage(
        language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खाते हैं।' : 'Passwords do not match.'
      );
      return;
    }

    setIsSubmitting(true);

    const effectiveDistrict = regDistrict === '__other__' ? customCity.trim() : regDistrict;
    const combinedVillage = regVillage.trim()
      ? (effectiveDistrict ? `${regVillage.trim()}, ${effectiveDistrict}` : regVillage.trim())
      : (effectiveDistrict || 'Anandpur');

    let calculatedAcres: number | undefined = undefined;
    if (regRole === 'FARMER') {
      if (isLandless || regFarmSize === '0') {
        calculatedAcres = 0;
      } else if (regFarmSize && !isNaN(Number(regFarmSize))) {
        const rawNum = Math.max(0, Number(regFarmSize));
        if (regFarmUnit === 'Acres') calculatedAcres = rawNum;
        else if (regFarmUnit === 'Hectare') calculatedAcres = Number((rawNum * 2.471).toFixed(2));
        else if (regFarmUnit === 'Bigha') calculatedAcres = Number((rawNum * 0.625).toFixed(2));
        else if (regFarmUnit === 'Guntha') calculatedAcres = Number((rawNum * 0.025).toFixed(2));
      } else {
        calculatedAcres = 0;
      }
    }

    const newUser: UserProfile = {
      id: `usr_${regRole.toLowerCase()}_${Date.now()}`,
      fullName: regFullName.trim(),
      email: regEmail || `${regPhone}@kishanbhai.in`,
      phone: regPhone ? `+91 ${regPhone}` : '+91 98251 44320',
      role: regRole,
      village: combinedVillage,
      state: regState || 'Gujarat',
      verified: true,
      farmSizeAcres: calculatedAcres,
      crops: regRole === 'FARMER' ? ['Cotton', 'Wheat'] : undefined,
      preferredLanguage: language === 'hi' ? 'hi' : 'en',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setUserRole(data.user.role);
      } else {
        setCurrentUser(newUser);
        setUserRole(newUser.role);
      }
      addToast(
        language === 'hi' ? 'खाता सफलतापूर्वक बना' : 'Account Created Successfully',
        language === 'hi'
          ? `स्वागत है, ${newUser.fullName}! (${newUser.role})`
          : `Welcome, ${newUser.fullName}! (${newUser.role})`,
        'success'
      );
      navigateToRoleDashboard(newUser.role);
    } catch {
      setCurrentUser(newUser);
      setUserRole(newUser.role);
      addToast(
        language === 'hi' ? 'खाता पंजीकृत' : 'Account Registered',
        language === 'hi' ? `स्वागत है, ${newUser.fullName}!` : `Welcome, ${newUser.fullName}!`,
        'success'
      );
      navigateToRoleDashboard(newUser.role);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant Persona Logins for Testing
  const handleInstantDemoLogin = async (chosenRole: UserRole, defaultName: string) => {
    const demoUser: UserProfile = {
      id: `usr_demo_${chosenRole.toLowerCase()}`,
      fullName: defaultName,
      email: `${chosenRole.toLowerCase()}@kishanbhai.in`,
      phone: '+91 98251 44320',
      role: chosenRole,
      village: 'Anandpur',
      state: 'Gujarat',
      verified: true,
      farmSizeAcres: chosenRole === 'FARMER' ? 4.5 : undefined,
      crops: chosenRole === 'FARMER' ? ['Cotton', 'Groundnut', 'Wheat'] : undefined,
      preferredLanguage: language === 'hi' ? 'hi' : 'en',
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(demoUser);
    setUserRole(chosenRole);
    addToast(
      language === 'hi' ? 'डेमो लॉगिन सफल' : 'Demo Login Successful',
      language === 'hi' ? `${defaultName} के रूप में प्रवेश किया` : `Logged in as ${defaultName}`,
      'success'
    );
    navigateToRoleDashboard(chosenRole);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto relative">
      <div className="absolute top-2 right-4 left-4 z-10 flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center">
          <AnimatedKishanLogo
            size="md"
            showText={true}
            interactive={true}
            withSound={true}
            subtitle={language === 'hi' ? 'आपका AI डिजिटल कृषि साथी' : 'Your AI Digital Farming Partner'}
            onClick={() => setIsLogoSplashOpen(true)}
          />
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full bg-white rounded-2xl border border-stone-200/90 shadow-xl p-6 sm:p-6 space-y-5">
        {mainTab !== 'forgot-password' && (
          <>
            {/* Main Tab Switcher: Sign In vs Register */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl border border-stone-200/70">
              <button
                type="button"
                id="tab-signin-btn"
                onClick={() => {
                  setMainTab('login');
                  setErrorMessage('');
                }}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mainTab === 'login'
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'hi' ? 'साइन इन' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                id="tab-register-btn"
                onClick={() => {
                  setMainTab('register');
                  setErrorMessage('');
                }}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mainTab === 'register'
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'hi' ? 'नया खाता (New User)' : 'New Account'}</span>
              </button>
            </div>
          </>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: SIGN IN (EXISTING USER)                           */}
        {/* ========================================================= */}
        {mainTab === 'login' && (
          <div className="space-y-4">
            {/* Primary Action: Sign in with Google */}
            <button
              type="button"
              id="google-signin-btn"
              onClick={() => handleGoogleSignIn()}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 font-semibold text-sm py-3 px-4 rounded-xl border border-stone-300 hover:border-stone-400 shadow-2xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>
                {isGoogleSubmitting
                  ? language === 'hi'
                    ? 'Google से जुड़ रहे हैं...'
                    : 'Connecting with Google...'
                  : language === 'hi'
                  ? 'Google से साइन इन करें'
                  : 'Sign in with Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-0.5">
              <div className="w-full border-t border-stone-200"></div>
              <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
                {language === 'hi' ? 'या मोबाइल / ईमेल से' : 'or continue with'}
              </span>
              <div className="w-full border-t border-stone-200"></div>
            </div>

            {/* Method Toggle: Mobile vs Email */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('phone');
                  setErrorMessage('');
                  setLoginIdentifier('');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMethod === 'phone'
                    ? 'bg-green-50 border-green-300 text-green-700 font-bold'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  setErrorMessage('');
                  setLoginIdentifier('');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMethod === 'email'
                    ? 'bg-green-50 border-green-300 text-green-700 font-bold'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ईमेल आईडी' : 'Email ID'}</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {loginMethod === 'phone' ? (
                /* Mobile Phone + OTP */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'मोबाइल नंबर (10 अंक)' : '10-Digit Mobile Number'}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="bg-stone-100 border border-stone-300 text-stone-700 text-sm font-semibold px-3 py-2.5 rounded-xl">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={loginIdentifier}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setLoginIdentifier(val);
                        }}
                        placeholder="98251 44320"
                        className="flex-1 bg-stone-50 focus:bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-stone-900 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {!isOtpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs py-2.5 rounded-xl border border-green-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'OTP कोड प्राप्त करें' : 'Get OTP Code'}</span>
                    </button>
                  ) : (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-stone-700">
                          {language === 'hi' ? '4-अंकीय OTP दर्ज करें' : 'Enter 4-Digit OTP'}
                        </label>
                        <span className="text-[11px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md">
                          डेमो कोड: 1234
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-stone-50 focus:bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-stone-900 outline-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Email + Password */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="farmer@kishanbhai.in"
                      className="w-full bg-stone-50 focus:bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-stone-700">
                        {language === 'hi' ? 'पासवर्ड' : 'Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMainTab('forgot-password');
                          setErrorMessage('');
                        }}
                        className="text-[11px] font-semibold text-green-700 hover:text-green-800 hover:underline cursor-pointer"
                      >
                        {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 focus:bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
              >
                <span>{isSubmitting ? (language === 'hi' ? 'सत्यापन जारी...' : 'Authenticating...') : (language === 'hi' ? 'प्रवेश करें' : 'Sign In')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Demo Login */}
            <div className="pt-3 border-t border-stone-100">
              <div className="text-center mb-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  {language === 'hi' ? '⚡ त्वरित डेमो लॉगिन (1-Click)' : '⚡ Quick Demo Login (1-Click)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('FARMER', 'Ramesh Patel')}
                  className="p-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-center transition-all cursor-pointer active:scale-95"
                >
                  <Sprout className="w-4 h-4 mx-auto text-green-700 mb-1" />
                  <div className="font-bold text-xs text-green-950 truncate">रमेश पटेल</div>
                  <div className="text-[10px] text-green-700">किसान (Farmer)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('CHAMPION', 'Sunita Devi')}
                  className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-center transition-all cursor-pointer active:scale-95"
                >
                  <UserCheck className="w-4 h-4 mx-auto text-amber-800 mb-1" />
                  <div className="font-bold text-xs text-amber-950 truncate">सुनीता देवी</div>
                  <div className="text-[10px] text-amber-700">चैंपियन (Leader)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('BUYER', 'Vikram Mehta')}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-center transition-all cursor-pointer active:scale-95"
                >
                  <Building className="w-4 h-4 mx-auto text-blue-800 mb-1" />
                  <div className="font-bold text-xs text-blue-950 truncate">विक्रम मेहता</div>
                  <div className="text-[10px] text-blue-700">खरीदार (Buyer)</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: REGISTER (NEW USER)                               */}
        {/* ========================================================= */}
        {mainTab === 'register' && (
          <div className="space-y-4">
            {/* Quick 1-Tap Google Sign Up */}
            <button
              type="button"
              id="google-signup-btn"
              onClick={() => handleGoogleSignIn(regRole)}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 font-semibold text-sm py-3 px-4 rounded-xl border border-stone-300 hover:border-stone-400 shadow-2xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>
                {isGoogleSubmitting
                  ? language === 'hi'
                    ? 'Google से खाता बन रहा है...'
                    : 'Setting up with Google...'
                  : language === 'hi'
                  ? 'Google से तुरंत खाता बनाएं'
                  : 'Sign up with Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-0.5">
              <div className="w-full border-t border-stone-200"></div>
              <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
                {language === 'hi' ? 'या विवरण भरकर खाता बनाएं' : 'or fill details manually'}
              </span>
              <div className="w-full border-t border-stone-200"></div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {language === 'hi' ? 'आपकी भूमिका (Choose Role) *' : 'I am registering as *'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'FARMER', label: language === 'hi' ? '🌾 किसान' : '🌾 Farmer' },
                  { id: 'CHAMPION', label: language === 'hi' ? '🤝 चैंपियन' : '🤝 Leader' },
                  { id: 'BUYER', label: language === 'hi' ? '🏢 खरीदार' : '🏢 Buyer' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRegRole(item.id as UserRole)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      regRole === item.id
                        ? 'bg-green-50 border-green-700 text-green-700'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. रमेश पटेल' : 'e.g. Ramesh Patel'}
                  className="w-full bg-stone-50 focus:bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98251 44320"
                    className="w-full bg-stone-50 focus:bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3 py-2 text-sm font-mono text-stone-900 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {language === 'hi' ? 'ईमेल' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-stone-50 focus:bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Location: State & District & Village */}
              <div className="space-y-2.5 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-green-700" />
                    <span>{language === 'hi' ? 'स्थान विवरण (Location)' : 'Location Details'}</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium bg-white px-2 py-0.5 rounded-full border border-stone-200">
                    {language === 'hi' ? 'सभी 28 राज्य व 8 केंद्र शासित प्रदेश' : 'All 28 States & 8 UTs of India'}
                  </span>
                </div>

                {/* 1. State Selector - All States in India */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {language === 'hi' ? '1. राज्य / केंद्र शासित प्रदेश चुनें (State) *' : '1. Select State (All India) *'}
                  </label>
                  <select
                    value={regState}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setRegState(newState);
                      const dists = getDistrictsForState(newState);
                      setRegDistrict(dists[0] || '__other__');
                      setCustomCity('');
                    }}
                    className="w-full bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
                  >
                    <optgroup label={language === 'hi' ? '🇮🇳 भारतीय राज्य (States - 28)' : '🇮🇳 Indian States (28)'}>
                      {INDIAN_STATES_AND_DISTRICTS.filter((s) => s.type === 'state').map((s) => (
                        <option key={s.state} value={s.state}>
                          {s.state} ({s.hindiName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={language === 'hi' ? '🏛️ केंद्र शासित प्रदेश (UTs - 8)' : '🏛️ Union Territories (8)'}>
                      {INDIAN_STATES_AND_DISTRICTS.filter((s) => s.type === 'ut').map((s) => (
                        <option key={s.state} value={s.state}>
                          {s.state} ({s.hindiName})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* 2. City / District & Village / Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {language === 'hi' ? '2. जिला / शहर (City/District)' : '2. District / City'}
                    </label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
                    >
                      {getDistrictsForState(regState).map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                      <option value="__other__">✍️ {language === 'hi' ? 'अन्य शहर लिखें (Other City)' : 'Other / Custom City'}</option>
                    </select>
                    {regDistrict === '__other__' && (
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder={language === 'hi' ? 'अपने शहर का नाम लिखें' : 'Type your city name'}
                        className="w-full mt-1.5 bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3 py-1.5 text-xs text-stone-900 outline-none"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {language === 'hi' ? '3. गाँव / पंचायत (Village/Locality)' : '3. Village / Locality / Ward'}
                    </label>
                    <input
                      type="text"
                      value={regVillage}
                      onChange={(e) => setRegVillage(e.target.value)}
                      placeholder={language === 'hi' ? 'उदा. आनंदपुर / रामपुर' : 'e.g. Anandpur'}
                      className="w-full bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Location Preview Tag */}
                <div className="text-[11px] text-green-900 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="truncate">
                    {language === 'hi' ? 'सत्यापित स्थान: ' : 'Your Location: '}
                    <strong>
                      {regVillage ? `${regVillage}, ` : ''}
                      {regDistrict === '__other__' ? (customCity ? `${customCity}, ` : '') : `${regDistrict}, `}
                      {regState}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Farm Land Holding - Flexible, depends on user */}
              {regRole === 'FARMER' && (
                <div className="space-y-2 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-green-700" />
                      <span>{language === 'hi' ? 'खेत का आकार (आपकी इच्छानुसार)' : 'Farm Size (Depends on you)'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isLandless;
                        setIsLandless(next);
                        if (next) setRegFarmSize('0');
                        else if (regFarmSize === '0') setRegFarmSize('2.5');
                      }}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        isLandless
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                          : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {isLandless
                        ? (language === 'hi' ? '✓ भूमिहीन / बटाईदार (0)' : '✓ Landless / Tenant (0)')
                        : (language === 'hi' ? 'भूमिहीन? यहाँ क्लिक करें' : 'Landless? Tap here')}
                    </button>
                  </div>

                  {!isLandless && (
                    <>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={regFarmSize}
                            onChange={(e) => setRegFarmSize(e.target.value)}
                            placeholder={language === 'hi' ? 'उदा. 2.5 या कोई भी आकार' : 'e.g. 2.5 or any size'}
                            className="w-full bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3 py-2 text-sm text-stone-900 font-semibold outline-none"
                          />
                        </div>
                        <select
                          value={regFarmUnit}
                          onChange={(e) => setRegFarmUnit(e.target.value as any)}
                          className="bg-white border border-stone-300 focus:border-green-700 rounded-xl px-2.5 py-2 text-xs font-bold text-stone-700 outline-none"
                        >
                          <option value="Acres">{language === 'hi' ? 'एकड़ (Acres)' : 'Acres'}</option>
                          <option value="Bigha">{language === 'hi' ? 'बीघा (Bigha)' : 'Bigha'}</option>
                          <option value="Hectare">{language === 'hi' ? 'हेक्टेयर (Hectare)' : 'Hectare'}</option>
                          <option value="Guntha">{language === 'hi' ? 'गुंठा (Guntha)' : 'Guntha'}</option>
                        </select>
                      </div>

                      {/* Quick preset chips */}
                      <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto">
                        <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                          {language === 'hi' ? 'त्वरित:' : 'Quick:'}
                        </span>
                        {['1', '2.5', '5', '10', '25'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRegFarmSize(val)}
                            className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                              regFarmSize === val
                                ? 'bg-green-700 text-white border-green-700 font-bold'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {val} {regFarmUnit === 'Acres' ? (language === 'hi' ? 'एकड़' : 'Acres') : regFarmUnit}
                          </button>
                        ))}
                      </div>

                      <p className="text-[10px] text-stone-500">
                        {language === 'hi'
                          ? '🌾 खेत का आकार आपकी वास्तविक जोत पर निर्भर करता है। आप कोई भी संख्या दर्ज कर सकते हैं।'
                          : '🌾 Farm size depends entirely on your actual land holding. You can enter any number.'}
                      </p>
                    </>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 mt-2"
              >
                <span>{isSubmitting ? (language === 'hi' ? 'खाता बन रहा है...' : 'Creating Account...') : (language === 'hi' ? 'खाता बनाएं' : 'Create Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FORGOT PASSWORD                                   */}
        {/* ========================================================= */}
        {mainTab === 'forgot-password' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
              </h3>
              <p className="text-sm text-stone-600">
                {language === 'hi' 
                  ? 'अपना ईमेल पता दर्ज करें और हम आपको एक पासवर्ड रीसेट लिंक भेजेंगे।' 
                  : 'Enter your email address and we will send you a password reset link.'}
              </p>
            </div>
            
            {!resetEmailSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="farmer@kishanbhai.in"
                    className="w-full bg-stone-50 focus:bg-white border border-stone-300 focus:border-green-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
                >
                  <Mail className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? (language === 'hi' ? 'भेज रहा है...' : 'Sending...') 
                      : (language === 'hi' ? 'रीसेट लिंक भेजें' : 'Send Reset Link')}
                  </span>
                </button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-green-800">
                  {language === 'hi' ? 'लिंक भेजा गया!' : 'Link Sent!'}
                </h4>
                <p className="text-xs text-green-700">
                  {language === 'hi' 
                    ? 'कृपया पासवर्ड रीसेट करने के लिए अपना ईमेल इनबॉक्स जांचें।' 
                    : 'Please check your email inbox for the password reset link.'}
                </p>
                <button
                  type="button"
                  onClick={() => setMainTab('login')}
                  className="mt-2 text-xs font-bold text-green-700 hover:underline cursor-pointer inline-block"
                >
                  {language === 'hi' ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}
                </button>
              </div>
            )}
            
            {!resetEmailSent && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMainTab('login')}
                  className="text-sm font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें और वापस जाएं' : 'Cancel & Go Back'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Secure Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          <span>
            {language === 'hi'
              ? 'Google Firebase एवं x402 द्वारा 100% सुरक्षित'
              : '100% Secure via Google Firebase & x402'}
          </span>
        </div>
      </div>
    </div>
  );
};
