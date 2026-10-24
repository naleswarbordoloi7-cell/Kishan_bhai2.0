import React, { ReactNode } from 'react';

interface FeatureHighlightProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  icon,
  title,
  description,
  className = '',
}) => {
  return (
    <div
      className={`flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 hover:bg-white/15 transition-all shadow-xs ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-[#EAF7EC] text-[#16803C] flex items-center justify-center shrink-0 shadow-xs">
        {icon}
      </div>
      <div className="space-y-0.5 min-w-0">
        <h4 className="text-xs font-bold text-white tracking-wide">
          {title}
        </h4>
        <p className="text-[11px] text-[#EAF7EC]/85 leading-snug">
          {description}
        </p>
      </div>
    </div>
  );
};
