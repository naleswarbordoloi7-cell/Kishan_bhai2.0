import React, { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  helperText?: string;
  containerClassName?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  leftIcon,
  rightElement,
  helperText,
  id,
  required,
  className = '',
  containerClassName = '',
  disabled,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      <div className="flex justify-between items-baseline">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#1F2937]"
        >
          {label} {required && <span className="text-[#DC2626] font-bold">*</span>}
        </label>
        {helperText && !error && (
          <span id={helperId} className="text-[11px] text-[#6B7280]">
            {helperText}
          </span>
        )}
      </div>

      <div className="relative rounded-xl shadow-xs">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId || helperId}
          className={`block w-full min-h-[48px] rounded-xl text-sm text-[#1F2937] placeholder-[#6B7280]/60 bg-white border transition-all ${
            leftIcon ? 'pl-11' : 'pl-4'
          } ${rightElement ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20'
              : 'border-[#E5E7EB] hover:border-stone-300 focus:border-[#16803C] focus:ring-2 focus:ring-[#16803C]/20'
          } ${disabled ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : ''} ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-[#DC2626] font-medium pt-0.5 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
