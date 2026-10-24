import React, { useState, InputHTMLAttributes } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { FormInput } from './FormInput';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = 'Password',
  error,
  placeholder = 'Enter your password',
  containerClassName = '',
  required = true,
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <FormInput
      label={label}
      error={error}
      required={required}
      disabled={disabled}
      type={showPassword ? 'text' : 'password'}
      placeholder={placeholder}
      containerClassName={containerClassName}
      leftIcon={<Lock className="w-4 h-4" strokeWidth={2} />}
      rightElement={
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          tabIndex={0}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1F2937] hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#16803C]/30 transition-colors cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      }
      {...props}
    />
  );
};
