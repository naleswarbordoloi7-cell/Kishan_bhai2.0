import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { FormInput } from './FormInput';
import { resetFirebasePassword, formatAuthErrorMessage } from '../../services/firebaseAuthService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdentifier?: string;
  onSuccessReturnToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialIdentifier = '',
  onSuccessReturnToLogin,
}) => {
  const [email, setEmail] = useState(
    initialIdentifier.includes('@') ? initialIdentifier : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetFirebasePassword(trimmed);
      setIsSuccess(true);
    } catch (err: any) {
      console.warn('Password recovery error:', err);
      setError(formatAuthErrorMessage(err) || 'Unable to process recovery request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E5E7EB] shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6B7280] hover:text-[#1F2937] p-1.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center space-y-4 py-3">
            <div className="w-14 h-14 rounded-full bg-[#EAF7EC] text-[#15803D] mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3
              id="forgot-password-title"
              className="text-xl font-bold font-serif-display text-[#1F2937]"
            >
              Password Reset Link Sent!
            </h3>

            <p className="text-xs text-[#6B7280] leading-relaxed">
              We have dispatched a secure password reset link to <strong className="text-[#1F2937]">{email}</strong>. Please check your inbox (and spam folder) and follow the instructions to set a new password.
            </p>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSuccessReturnToLogin();
                }}
                className="w-full min-h-[48px] bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Login</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7EC] text-[#16803C] flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3
                id="forgot-password-title"
                className="text-xl font-bold font-serif-display text-[#1F2937]"
              >
                Reset Your Password
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Enter the email address registered with your Kishan Bhai farmer or buyer profile. We will send you an official reset link.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Registered Email Address"
                required
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                autoFocus
              />

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] bg-[#16803C] hover:bg-[#105C2B] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-semibold text-[#6B7280] hover:text-[#1F2937] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
