import React from 'react';
import { Sprout } from 'lucide-react';

interface KishanBhaiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  lightMode?: boolean; // true for white text on dark green, false for dark text on light bg
  className?: string;
}

export const KishanBhaiLogo: React.FC<KishanBhaiLogoProps> = ({
  size = 'md',
  showTagline = true,
  lightMode = false,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const iconBoxSize = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  const textTitleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const taglineSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Agricultural sprout icon in brand green */}
      <div
        className={`${iconBoxSize} rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105 ${
          lightMode
            ? 'bg-[#EAF7EC] text-[#16803C] border border-[#16803C]/20'
            : 'bg-[#16803C] text-white shadow-[#16803C]/25'
        }`}
      >
        <Sprout className={iconSize} strokeWidth={2.2} />
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif-display font-bold leading-tight tracking-tight ${textTitleSize} ${
            lightMode ? 'text-white' : 'text-[#1F2937]'
          }`}
        >
          Kishan Bhai
        </span>
        {showTagline && (
          <span
            className={`font-medium tracking-normal ${taglineSize} ${
              lightMode ? 'text-[#EAF7EC]/90' : 'text-[#6B7280]'
            }`}
          >
            Small Farms. One Powerful Network.
          </span>
        )}
      </div>
    </div>
  );
};
