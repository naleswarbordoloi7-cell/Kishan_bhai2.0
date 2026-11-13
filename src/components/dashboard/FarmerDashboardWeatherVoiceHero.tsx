import React, { useState } from 'react';
import {
  CloudLightning,
  Droplets,
  Wind,
  AlertTriangle,
  X,
} from 'lucide-react';

export interface CropListingPayload {
  cropName: string;
  volumeQuintals: number;
  harvestDate: string;
  qualityGrade: string;
  rawVoiceTranscript: string;
}

export interface FarmerDashboardWeatherVoiceHeroProps {
  farmerName?: string;
  villageName?: string;
  districtName?: string;
  language?: string;
  onCropListed?: (crop: CropListingPayload) => void;
  onExploreClusters?: () => void;
}

export const FarmerDashboardWeatherVoiceHero: React.FC<FarmerDashboardWeatherVoiceHeroProps> = ({
  villageName = 'Anandpur',
  districtName = 'Rajkot',
  language = 'hi',
}) => {
  // Weather Advisory State
  const [weatherAlertDismissed, setWeatherAlertDismissed] = useState<boolean>(false);

  if (weatherAlertDismissed) {
    return null;
  }

  return (
    <div className="w-full text-[#2A1D13] antialiased">
      {/* 1. HIGH-CONTRAST ANIMETIC WEATHER ALERT CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-stone-950 p-5 sm:p-7 shadow-xl shadow-amber-950/20 border-2 border-amber-300/40 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
        {/* Animated decorative rain / thunder micro-gradient in background */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-amber-300/25 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Weather Icon & Core Alert Message */}
          <div className="flex items-start gap-4">
            <div className="relative flex items-center justify-center shrink-0 w-14 h-14 rounded-2xl bg-stone-950/15 border border-stone-950/20 shadow-inner backdrop-blur-sm">
              <CloudLightning className="w-8 h-8 text-amber-950 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-80" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600" />
              </span>
            </div>

            <div className="space-y-1.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-stone-950 text-amber-300 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-sm">
                  {language === 'hi' ? 'मौसम चेतावनी' : 'Severe Weather Alert'}
                </span>
                <span className="bg-white/40 text-stone-950 text-xs font-bold px-2 py-0.5 rounded-lg">
                  {villageName}, {districtName}
                </span>
                <span className="text-xs font-mono font-black text-amber-950">
                  70% Rain Expected Tomorrow
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-stone-950 leading-snug tracking-tight">
                {language === 'hi'
                  ? 'कल भारी बारिश की संभावना — आज सिंचाई रोकें और कटाई फसल ढकें!'
                  : 'Heavy Rain Forecasted Tomorrow — Hold Irrigation & Cover Harvested Lots!'}
              </h3>

              <p className="text-xs sm:text-sm font-semibold text-stone-900/90 leading-relaxed">
                {language === 'hi'
                  ? 'मिट्टी की नमी 42% पर अनुकूल है। बारिश के कारण अतिरिक्त पानी से जड़ गलन रोग का जोखिम है। हमने स्वचालित रूप से आपके स्मार्ट पंप को "स्टैंडबाय" पर सेट कर दिया है।'
                  : 'Soil moisture is optimal at 42%. Additional irrigation will create root rot risk. Kisan Bhai smart pump controller is held on standby.'}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Dismiss */}
          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setWeatherAlertDismissed(true)}
              className="h-12 min-h-[48px] px-4 rounded-2xl bg-stone-950/15 hover:bg-stone-950/25 active:scale-95 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all duration-300 ease-in-out cursor-pointer"
              title="Dismiss Alert"
            >
              <span>{language === 'hi' ? 'समझ गया' : 'Dismiss'}</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Weather Metrics Grid */}
        <div className="mt-4 pt-4 border-t border-stone-950/15 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-bold text-stone-950">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs p-2.5 rounded-xl">
            <Droplets className="w-4 h-4 text-amber-950" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-stone-900/70">Precipitation</div>
              <div>70% (Rainfall 38mm)</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs p-2.5 rounded-xl">
            <Droplets className="w-4 h-4 text-amber-950" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-stone-900/70">Soil Moisture</div>
              <div>42% (Optimal)</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs p-2.5 rounded-xl">
            <Wind className="w-4 h-4 text-amber-950" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-stone-900/70">Wind Speed</div>
              <div>18 km/h NW</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs p-2.5 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-950" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-stone-900/70">Pest Hazard</div>
              <div>Low (Prevent Spray)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
