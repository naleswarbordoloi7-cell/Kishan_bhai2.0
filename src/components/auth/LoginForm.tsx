import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, ArrowRight, RefreshCw, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { KishanBhaiLogo } from './KishanBhaiLogo';
import { FormInput } from './FormInput';
import { PasswordInput } from './PasswordInput';
import { UserProfile, UserRole } from '../../../shared/types';
import { signInWithFirebaseGoogle, formatAuthErrorMessage } from '../../services/firebaseAuthService';
import { recordUserLogin } from '../../services/supabaseClient';

export interface LoginFormProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToChampionRegister?: () => void;
  addToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onNavigateToChampionRegister,
  addToast,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Field-specific validation errors
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Restore rememberMe state from local storage on mount
  useEffect(() => {
    try {
      const savedIdentifier = localStorage.getItem('kb_saved_identifier');
      if (savedIdentifier) {
        setIdentifier(savedIdentifier);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  const validateIdentifier = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Please enter your email or mobile number.';
    }

    if (trimmed.includes('@')) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return 'Please enter a valid email address.';
      }
    } else {
      // Validate mobile number format (digits, minimum 10 digits for Indian mobile)
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        return 'Please enter a valid mobile number (at least 10 digits).';
      }
    }

    return null;
  };

  const validatePassword = (value: string): string | null => {
    if (!value) {
      return 'Please enter your password.';
    }
    return null;
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIdentifier(val);
    if (identifierError) {
      setIdentifierError(null);
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError) {
      setPasswordError(null);
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate inputs
    const idErr = validateIdentifier(identifier);
    const pwdErr = validatePassword(password);

    if (idErr || pwdErr) {
      setIdentifierError(idErr);
      setPasswordError(pwdErr);
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const trimmedId = identifier.trim();
      const isEmail = trimmedId.includes('@');
      const digitsOnly = trimmedId.replace(/\D/g, '');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: trimmedId,
          email: isEmail ? trimmedId : undefined,
          phone: !isEmail ? (digitsOnly.length === 10 ? `+91 ${digitsOnly}` : `+${digitsOnly}`) : undefined,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success || !data?.user) {
        throw new Error(data?.error || 'Login failed. Please check your details and try again.');
      }

      // Handle remember me preference
      try {
        if (rememberMe) {
          localStorage.setItem('kb_saved_identifier', trimmedId);
        } else {
          localStorage.removeItem('kb_saved_identifier');
        }
      } catch {}

      // Record login telemetry event
      try {
        recordUserLogin({
          user_id: data.user.id,
          user_name: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
          village: data.user.village,
          state: data.user.state,
          login_method: isEmail ? 'email' : 'phone',
        });
      } catch {}

      addToast(
        'Login Successful',
        `Welcome back, ${data.user.fullName}!`,
        'success'
      );

      onLoginSuccess(data.user);
    } catch (err: any) {
      console.warn('Authentication error:', err);
      if (!navigator.onLine) {
        setGeneralError('Unable to connect. Please check your internet connection and try again.');
      } else {
        setGeneralError(err.message || 'Login failed. Please check your details and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleSubmitting) return;
    setIsGoogleSubmitting(true);
    setGeneralError(null);

    try {
      const user = await signInWithFirebaseGoogle('FARMER');
      
      // Record telemetry
      try {
        recordUserLogin({
          user_id: user.id,
          user_name: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          village: user.village,
          state: user.state,
          login_method: 'google',
        });
      } catch {}

      addToast(
        'Google Sign-In Successful',
        `Welcome, ${user.fullName}!`,
        'success'
      );

      onLoginSuccess(user);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      const friendly = formatAuthErrorMessage(err);
      setGeneralError(friendly);
      addToast('Google Sign-In', friendly, 'error');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Quick Account Autofill Helper for Evaluators and Developers
  const fillCredentials = (role: 'farmer' | 'buyer' | 'champion') => {
    if (role === 'farmer') {
      setIdentifier('ramesh.patel@kishanbhai.in');
      setPassword('kisan@2026');
    } else if (role === 'buyer') {
      setIdentifier('arunav.sengupta@itc.in');
      setPassword('itc@procure2026');
    } else {
      setIdentifier('vikram.jadeja@kishanbhai.in');
      setPassword('sarpanch@anandpur');
    }
    setIdentifierError(null);
    setPasswordError(null);
    setGeneralError(null);
  };

  const isEmailInput = identifier.includes('@');

  return (
    <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#E5E7EB] shadow-xl shadow-stone-200/50 w-full max-w-md mx-auto space-y-6">
      {/* Mobile-only / Card Top Brand Logo */}
      <div className="text-center sm:text-left flex flex-col items-center sm:items-start space-y-2">
        <KishanBhaiLogo size="sm" showTagline={false} />

        <div className="pt-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-[#1F2937] tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1 font-medium">
            Log in to continue your farming journey.
          </p>
        </div>
      </div>

      {/* General Authentication Error Banner */}
      {generalError && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-[#DC2626] font-medium flex items-start gap-2.5 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{generalError}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Field 1: Email or Mobile Number */}
        <FormInput
          label="Email or Mobile Number"
          name="identifier"
          required
          autoComplete="username"
          placeholder="Enter your email or mobile number"
          value={identifier}
          onChange={handleIdentifierChange}
          error={identifierError || undefined}
          leftIcon={
            isEmailInput ? (
              <Mail className="w-4 h-4" />
            ) : (
              <Phone className="w-4 h-4" />
            )
          }
          disabled={isSubmitting || isGoogleSubmitting}
        />

        {/* Field 2: Password */}
        <PasswordInput
          label="Password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          error={passwordError || undefined}
          disabled={isSubmitting || isGoogleSubmitting}
        />

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#1F2937] font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-4 h-4 rounded text-[#16803C] border-stone-300 focus:ring-[#16803C] focus:ring-offset-0 cursor-pointer"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={onNavigateToForgotPassword}
            disabled={isSubmitting || isGoogleSubmitting}
            className="font-semibold text-[#16803C] hover:text-[#105C2B] hover:underline transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {/* Primary Login Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full min-h-[50px] bg-[#16803C] hover:bg-[#105C2B] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#16803C]/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#16803C] focus:ring-offset-2 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login to Kishan Bhai</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Social Login Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E5E7EB]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 font-semibold text-[#6B7280] uppercase tracking-wider">
            OR
          </span>
        </div>
      </div>

      {/* Continue with Google Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleSubmitting}
          className="w-full min-h-[48px] bg-white hover:bg-stone-50 border border-[#E5E7EB] text-[#1F2937] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:border-stone-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-stone-500" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>

      {/* Registration Link */}
      <div className="text-center pt-2 border-t border-[#E5E7EB] space-y-1.5 text-xs text-[#6B7280]">
        <div>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="font-bold text-[#16803C] hover:text-[#105C2B] hover:underline transition-colors cursor-pointer"
          >
            Create an account
          </button>
        </div>
        {onNavigateToChampionRegister && (
          <div>
            <button
              type="button"
              onClick={onNavigateToChampionRegister}
              className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 hover:underline cursor-pointer"
            >
              🏛️ Register as Village Champion (Sarpanch / Lead)
            </button>
          </div>
        )}
      </div>

      {/* Quick Demo Access Bar */}
      <div className="pt-2 bg-[#EAF7EC]/60 rounded-2xl p-3 border border-[#16803C]/15 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#105C2B]">
          <Sparkles className="w-3.5 h-3.5 text-[#F5C542]" />
          <span>Quick Demo Roles (1-Click Fill)</span>
        </div>
        <div className="flex justify-center gap-1.5 text-[10px]">
          <button
            type="button"
            onClick={() => fillCredentials('farmer')}
            className="px-2.5 py-1 bg-white hover:bg-[#16803C] hover:text-white rounded-lg border border-[#16803C]/30 font-semibold text-[#16803C] transition-colors cursor-pointer"
          >
            🌾 Farmer
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('buyer')}
            className="px-2.5 py-1 bg-white hover:bg-amber-700 hover:text-white rounded-lg border border-amber-600/30 font-semibold text-amber-800 transition-colors cursor-pointer"
          >
            🏢 Buyer
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('champion')}
            className="px-2.5 py-1 bg-white hover:bg-emerald-800 hover:text-white rounded-lg border border-emerald-700/30 font-semibold text-emerald-800 transition-colors cursor-pointer"
          >
            ⭐ Champion
          </button>
        </div>
      </div>
    </div>
  );
};
