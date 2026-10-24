import React, { useState } from 'react';
import { Sparkles, Users, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { KishanBhaiLogo } from './KishanBhaiLogo';
import { FeatureHighlight } from './FeatureHighlight';
import farmerHeroImg from '../../assets/images/indian_farmer_login_1792742655300.jpg';

export const BrandingPanel: React.FC = () => {
  const [imageFailed, setImageFailed] = useState(false);

  // Fallback high-contrast agricultural photo if primary asset ever fails to load
  const fallbackImg =
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=80';

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-[#105C2B] via-[#146631] to-[#16803C] text-white p-8 lg:p-12 flex flex-col justify-between overflow-hidden select-none">
      {/* Subtle organic background ambient circles inspired by crop canopies */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#EAF7EC]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-28 w-80 h-80 bg-[#F5C542]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-88 h-88 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Zone: Brand Logo */}
      <div className="relative z-10">
        <KishanBhaiLogo size="lg" lightMode={true} showTagline={true} />
      </div>

      {/* Center Zone: Headline, Value Proposition & Indian Farmer Photo Showcase */}
      <div className="relative z-10 my-8 space-y-6 max-w-xl">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7EC]/15 border border-[#EAF7EC]/25 text-[#EAF7EC] text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C542]" />
            <span>AI-Powered Indian AgriTech Operating System</span>
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold font-serif-display text-white tracking-tight leading-tight">
            Welcome Back, Farmer!
          </h1>

          <p className="text-base lg:text-lg font-medium text-[#F5C542]">
            Your farm, your community, your growth.
          </p>

          <p className="text-xs lg:text-sm text-[#EAF7EC]/90 leading-relaxed max-w-lg">
            Kishan Bhai brings smart farming guidance, trusted buyers, agricultural resources, and better selling opportunities together in one place.
          </p>
        </div>

        {/* High-Quality Indian Farmer Photograph Card */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#105C2B]/80 max-w-md group">
          <img
            src={imageFailed ? fallbackImg : farmerHeroImg}
            alt="Indian farmer in a lush green agricultural field using smartphone"
            onError={() => setImageFailed(true)}
            className="w-full h-64 sm:h-72 object-cover object-top transition-transform duration-700 group-hover:scale-105"
            loading="eager"
          />

          {/* Floating Trust Verification Overlay Badge */}
          <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#16803C] flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-[11px] leading-tight">
                  Verified Farmer & Buyer Network
                </div>
                <div className="text-[10px] text-[#EAF7EC]/80">
                  Instant APMC Mandi, Escrow & Soil AI
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#F5C542] text-[#105C2B] px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </div>
        </div>

        {/* 3 Compact Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <FeatureHighlight
            icon={<Sparkles className="w-5 h-5 text-[#16803C]" />}
            title="Kishan AI"
            description="Get intelligent farming guidance whenever you need it."
          />
          <FeatureHighlight
            icon={<Users className="w-5 h-5 text-[#16803C]" />}
            title="Virtual Farm Clusters"
            description="Connect with other farmers and grow stronger together."
          />
          <FeatureHighlight
            icon={<Store className="w-5 h-5 text-[#16803C]" />}
            title="Smart Marketplace"
            description="Discover crop buyers and compare available offers."
          />
        </div>
      </div>

      {/* Footer Zone: Non-intrusive Trust Footnote */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-[#EAF7EC]/70">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#F5C542]" />
          <span>Empowering 50,000+ Indian growers across 14 states</span>
        </div>
        <span>ISO 27001 & DPDP Act Data Privacy Compliant</span>
      </div>
    </div>
  );
};
