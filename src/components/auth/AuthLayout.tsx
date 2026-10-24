import React from 'react';
import { BrandingPanel } from './BrandingPanel';

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAF7] text-[#1F2937]">
      {/* Left Column: Brand & Agricultural Illustration (Desktop & Tablet Landscape ~55% width) */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[55%] min-h-screen sticky top-0 h-screen overflow-y-auto">
        <BrandingPanel />
      </div>

      {/* Right Column: Authentication Form Container (~45% width on desktop, 100% on mobile/tablet portrait) */}
      <div className="w-full lg:w-[45%] xl:w-[45%] min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:px-8 sm:py-12 bg-[#F8FAF7] overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
