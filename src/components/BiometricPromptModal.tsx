import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertCircle,
  Smartphone,
  Key,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  checkBiometricCapability,
  authenticateWithBiometrics,
  BiometricDeviceCapability,
} from '../services/biometricAuth';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../../shared/types';

export interface BiometricPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user?: UserProfile) => void;
  title?: string;
  subtitle?: string;
  actionReason?: string;
  targetUserId?: string;
  mode?: 'verify' | 'login' | 'enroll';
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  subtitle,
  actionReason = 'Authenticate to protect sensitive agricultural records',
  targetUserId,
  mode = 'login',
}) => {
  const { language, addToast } = useApp();
  const [capability, setCapability] = useState<BiometricDeviceCapability | null>(null);
  const [scanType, setScanType] = useState<'fingerprint' | 'face'>('fingerprint');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScanState('idle');
      setErrorMessage('');
      setAuthenticatedUser(null);

      checkBiometricCapability().then((cap) => {
        setCapability(cap);
        if (cap.deviceType === 'face_id') {
          setScanType('face');
        } else {
          setScanType('fingerprint');
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartScan = async () => {
    setScanState('scanning');
    setErrorMessage('');

    // Play subtle audio cue or haptic simulation
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 30, 40]);
      }
    } catch {}

    // Simulated scanning delay for authentic sensor tactile feedback
    setTimeout(async () => {
      const result = await authenticateWithBiometrics({
        userId: targetUserId,
      });

      if (result.success) {
        setScanState('success');
        setAuthenticatedUser(result.user || null);

        try {
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(80);
          }
        } catch {}

        setTimeout(() => {
          onSuccess(result.user);
          onClose();
        }, 1100);
      } else {
        setScanState('failed');
        setErrorMessage(result.error || 'Biometric verification did not pass. Please retry.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {title || (language === 'hi' ? 'बायोमेट्रिक प्रमाणीकरण' : 'Biometric Security Check')}
              </h3>
              <p className="text-[11px] text-emerald-300/90 font-mono">
                {capability?.deviceName || 'WebAuthn / Passkey Device'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-center">
          {/* Subtitle / Reason */}
          <div className="space-y-1">
            <p className="text-xs text-stone-600 font-medium">
              {subtitle || actionReason}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
              <Lock className="w-3 h-3" />
              <span>Hardware-Encrypted Farmer Protection</span>
            </span>
          </div>

          {/* Mode Switcher: Fingerprint vs Face ID */}
          <div className="flex bg-stone-100 p-1 rounded-xl max-w-xs mx-auto text-xs font-semibold">
            <button
              onClick={() => {
                setScanType('fingerprint');
                setScanState('idle');
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                scanType === 'fingerprint'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-700" />
              <span>Fingerprint</span>
            </button>
            <button
              onClick={() => {
                setScanType('face');
                setScanState('idle');
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                scanType === 'face'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <ScanFace className="w-3.5 h-3.5 text-blue-600" />
              <span>Face Unlock</span>
            </button>
          </div>

          {/* Main Visual Sensor Area */}
          <div className="py-2">
            <div
              onClick={scanState !== 'scanning' && scanState !== 'success' ? handleStartScan : undefined}
              className={`relative mx-auto w-32 h-32 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-2 select-none ${
                scanState === 'scanning'
                  ? 'bg-emerald-500/10 border-emerald-500 ring-8 ring-emerald-500/10 scale-105'
                  : scanState === 'success'
                  ? 'bg-emerald-50 border-emerald-600 ring-8 ring-emerald-500/20'
                  : scanState === 'failed'
                  ? 'bg-rose-50 border-rose-500 ring-8 ring-rose-500/10'
                  : 'bg-stone-50 hover:bg-stone-100/80 border-stone-300 hover:border-emerald-600'
              }`}
            >
              {/* Laser sweep animation when scanning */}
              {scanState === 'scanning' && (
                <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse rounded-full" />
              )}

              {scanState === 'success' ? (
                <div className="space-y-1 animate-in zoom-in-50 duration-300">
                  <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
                  <span className="text-[11px] font-bold text-emerald-800 block">Verified!</span>
                </div>
              ) : scanType === 'fingerprint' ? (
                <div className="space-y-1.5">
                  <Fingerprint
                    className={`w-14 h-14 mx-auto transition-all ${
                      scanState === 'scanning'
                        ? 'text-emerald-700 animate-pulse'
                        : scanState === 'failed'
                        ? 'text-rose-600'
                        : 'text-stone-700'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 font-medium block">
                    {scanState === 'scanning' ? 'Scanning sensor...' : 'Tap sensor'}
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <ScanFace
                    className={`w-14 h-14 mx-auto transition-all ${
                      scanState === 'scanning'
                        ? 'text-blue-600 animate-pulse'
                        : scanState === 'failed'
                        ? 'text-rose-600'
                        : 'text-stone-700'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 font-medium block">
                    {scanState === 'scanning' ? 'Aligning face...' : 'Look at camera'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Message / Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 text-rose-900 border border-rose-200 p-3 rounded-2xl text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {scanState === 'idle' && (
            <p className="text-xs text-stone-500">
              Touch the sensor or tap the button below to verify with your registered device biometric passkey.
            </p>
          )}

          {scanState === 'scanning' && (
            <p className="text-xs text-emerald-800 font-semibold animate-pulse">
              Communicating with biometric hardware...
            </p>
          )}

          {scanState === 'success' && authenticatedUser && (
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium">
              Authenticated as <strong>{authenticatedUser.fullName}</strong> ({authenticatedUser.role})
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {scanState !== 'success' && (
              <button
                type="button"
                onClick={handleStartScan}
                disabled={scanState === 'scanning'}
                className="w-full bg-[#2D4F1E] hover:bg-[#223d16] text-white font-semibold py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {scanType === 'fingerprint' ? (
                  <Fingerprint className="w-4 h-4 text-emerald-300" />
                ) : (
                  <ScanFace className="w-4 h-4 text-blue-300" />
                )}
                <span>
                  {scanState === 'scanning'
                    ? 'Verifying Biometrics...'
                    : scanType === 'fingerprint'
                    ? 'Scan Fingerprint to Confirm'
                    : 'Scan Face to Confirm'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel & Use PIN / OTP
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>FIDO2 / WebAuthn Certified</span>
          </span>
          <span>Zero-Knowledge Passkey</span>
        </div>
      </div>
    </div>
  );
};
