import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  ShoppingBag,
  Coins,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Building,
  UserCheck,
  LogIn,
  TrendingUp,
  Award,
} from 'lucide-react';
import { AnimatedKishanLogo } from '../components/AnimatedKishanLogo';
import { MandiTicker } from '../components/MandiTicker';

export const LandingPage: React.FC = () => {
  const {
    setCurrentView,
    setUserRole,
    language,
    setIsLogoSplashOpen,
  } = useApp();

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Live Mandi Ticker Ribbon */}
      <MandiTicker />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 md:p-16 border border-stone-200/90 bg-white shadow-xs">
        <div className="max-w-4xl mx-auto text-center space-y-6 flex flex-col items-center">
          {/* Animated Brand Emblem Hero */}
          <div className="pb-1">
            <AnimatedKishanLogo
              size="lg"
              showText={false}
              interactive={true}
              withSound={true}
              onClick={() => setIsLogoSplashOpen(true)}
            />
          </div>

          {/* Track badge */}
          <div className="inline-flex items-center gap-2 bg-[#1B3B1B] text-emerald-200 text-xs px-4 py-1.5 rounded-full font-mono shadow-xs border border-emerald-800/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Agentic Web3 Agriculture • Powered by x402 & Algorand</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif-display text-stone-900 tracking-tight leading-[1.12]">
            Small Farms. <br />
            <span className="text-[#2D5A27] italic">One Powerful Network.</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto font-sans">
            Kisan Bhai unites smallholder farmers into{' '}
            <strong className="text-stone-900 font-semibold">Virtual Farm Clusters</strong>. 
            Unlock 20–30% bulk discounts on certified inputs, access direct institutional buyer markets, and run autonomous agronomical AI on sub-cent{' '}
            <strong className="text-[#2D5A27] font-semibold">x402 Algorand Testnet micropayments</strong>.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setUserRole('FARMER');
                setCurrentView('farmer-dashboard');
              }}
              className="bg-[#2D5A27] hover:bg-[#1B3B1B] text-white font-extrabold text-base px-7 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer border border-white/20 active:scale-[0.98]"
            >
              <Sprout className="w-5 h-5 text-amber-300" />
              <span>{language === 'hi' ? '🌾 किसान होम पेज खोलें' : '🌾 Go to Farmer Home'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>

            <button
              onClick={() => {
                setCurrentView('disease-scanner');
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-[#1B3B1B] font-bold px-5 py-3.5 rounded-2xl border border-emerald-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>📸 {language === 'hi' ? 'फसल रोग जांचें' : 'Scan Crop Disease'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('ai-assistant');
              }}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-5 py-3.5 rounded-2xl border border-amber-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>🎙️ {language === 'hi' ? 'बोलकर पूछें (AI)' : 'Voice AI'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('login');
              }}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold px-4 py-3.5 rounded-2xl border border-stone-200 shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 text-stone-600" />
              <span>{language === 'hi' ? 'लॉगिन' : 'Sign In'}</span>
            </button>
          </div>

          {/* Protocol summary strip */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-emerald-900 font-medium whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Zero Land Consolidation</span>
            </div>
            <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-teal-900 font-medium whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Real Algorand Testnet Settlements</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-amber-900 font-medium whitespace-nowrap">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>GoPlausible Facilitator Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PHILOSOPHY & VIRTUAL CLUSTER VISUALIZER */}
      <section>
        <div className="bg-[#1B3B1B] text-white rounded-[32px] p-8 sm:p-12 shadow-xl border border-stone-800 overflow-hidden relative">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-emerald-300 text-xs font-mono uppercase tracking-widest font-bold block bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full w-fit border border-white/15">
              The Kisan Bhai Paradigm
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif-display text-white">
              "We don't combine farmers' land. <br />
              <span className="text-emerald-300 italic">We combine their digital strength.</span>"
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Traditional cooperatives attempt physical land pooling, which causes legal friction and farmer resistance. 
              Kisan Bhai creates <strong>Virtual Farm Clusters</strong>: individual farmers retain 100% land autonomy while aggregating input demand, pooling harvest supply, and sharing machinery logistics digitally.
            </p>
          </div>

          {/* Interactive Cluster Matrix Visualizer */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 space-y-3 hover:bg-white/15 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold font-mono">
                01
              </div>
              <h3 className="font-bold text-lg text-white">Individual Autonomy</h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                Farmers like Ramesh (4.5 acres) and Suresh (3.2 acres) manage their own soil, crops, and decisions independently.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 space-y-3 hover:bg-white/15 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold font-mono">
                02
              </div>
              <h3 className="font-bold text-lg text-white">Digital Cluster Pooling</h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                Village Champions aggregate fertilizer demands into a 300-bag group order, unlocking 22.5% bulk wholesale discounts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 space-y-3 hover:bg-white/15 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold font-mono">
                03
              </div>
              <h3 className="font-bold text-lg text-white">x402 AI & Collective Sale</h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                Farmers trigger instant 0.002 USDC multispectral crop diagnosis, pool 18,500 kg cotton lots, and sell directly to verified buyers.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-xs text-stone-300 relative z-10">
            <span className="font-mono text-emerald-300 bg-black/30 px-3 py-1.5 rounded-full border border-emerald-400/30">
              Active Demonstration Cluster: Anandpur Golden Cotton & Wheat Cluster (48.5 Acres)
            </span>
            <button
              onClick={() => setCurrentView('clusters')}
              className="text-white hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explore Virtual Clusters</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* THE 4 PILLARS / PROBLEM & SOLUTION */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl font-bold font-serif-display text-stone-900">
            Built for India&apos;s 140 Million Smallholders
          </h2>
          <p className="text-sm text-stone-600">
            Solving the core pain points of Indian agriculture through digital coordination & sub-cent Web3 rails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="surface-card-interactive rounded-[28px] p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#2D5A27]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Bulk Buying Power</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Individually, small farmers pay peak retail margins. By pooling demand via clusters, inputs are purchased directly from manufacturers at wholesale rates.
            </p>
          </div>

          {/* Card 2 */}
          <div className="surface-card-interactive rounded-[28px] p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Harvest Pooling Lot</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Institutional buyers bypass middlemen by procuring standardized, lab-graded 20-ton lots assembled across clustered smallholder plots.
            </p>
          </div>

          {/* Card 3 */}
          <div className="surface-card-interactive rounded-[28px] p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">x402 Micropayments</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              No expensive monthly software subscriptions. Farmers pay ₹0.15 to ₹0.40 (0.002 USDC) strictly per deep AI crop diagnosis on Algorand Testnet.
            </p>
          </div>

          {/* Card 4 */}
          <div className="surface-card-interactive rounded-[28px] p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-800">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Agentic Kisan AI</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Multi-modal Gemini 3.7 Flash agent capable of inspecting leaf blight photographs, calculating remediation plans, and triggering protected APIs.
            </p>
          </div>
        </div>
      </section>

      {/* 4 ROLES OVERVIEW */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl font-bold font-serif-display text-stone-900">
            Four Connected Stakeholder Roles
          </h2>
          <p className="text-sm text-stone-600">
            Experience the application through any of the four dedicated perspective dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => {
              setUserRole('FARMER');
              setCurrentView('farmer-dashboard');
            }}
            className="surface-card-interactive p-6 rounded-[28px] hover:border-[#2D5A27] transition-all cursor-pointer group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center group-hover:bg-[#2D5A27] group-hover:text-white transition-colors border border-emerald-100">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-base group-hover:text-[#2D5A27]">1. Farmer</h3>
            <p className="text-xs text-stone-600">
              Manage acreage, pledge for bulk fertilizer orders, trigger AI crop diagnosis, and view real-time payments.
            </p>
            <span className="text-xs text-[#2D5A27] font-semibold flex items-center gap-1">
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => {
              setUserRole('CHAMPION');
              setCurrentView('champion-dashboard');
            }}
            className="surface-card-interactive p-6 rounded-[28px] hover:border-teal-600 transition-all cursor-pointer group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors border border-teal-100">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-base group-hover:text-teal-800">2. Village Champion</h3>
            <p className="text-xs text-stone-600">
              Coordinate village smallholders, verify cluster onboarding, aggregate bulk purchase lots, and organize machinery.
            </p>
            <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => {
              setUserRole('BUYER');
              setCurrentView('buyer-dashboard');
            }}
            className="surface-card-interactive p-6 rounded-[28px] hover:border-amber-600 transition-all cursor-pointer group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-amber-700 group-hover:text-white transition-colors border border-amber-100">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-base group-hover:text-amber-800">3. Institutional Buyer</h3>
            <p className="text-xs text-stone-600">
              Procure certified 10–50 ton aggregated crop lots directly from clusters with transparent pricing and escrow.
            </p>
            <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => {
              setUserRole('ADMIN');
              setCurrentView('admin-dashboard');
            }}
            className="surface-card-interactive p-6 rounded-[28px] hover:border-purple-600 transition-all cursor-pointer group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors border border-purple-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-base group-hover:text-purple-800">4. Admin & Ops</h3>
            <p className="text-xs text-stone-600">
              Monitor x402 payment statistics, Algorand Testnet node status, and track the strict ₹1,500 monthly API budget limit.
            </p>
            <span className="text-xs text-purple-700 font-semibold flex items-center gap-1">
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
