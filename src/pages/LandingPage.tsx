import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Coins,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  FileText,
  Building,
  UserCheck,
  LogIn,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setUserRole, language, setIsWalletModalOpen } = useApp();

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 md:p-16 border border-stone-200/80 bg-white shadow-xs">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Track badge */}
          <div className="inline-flex items-center gap-2 bg-[#182613] text-stone-100 text-xs px-4 py-1.5 rounded-full font-mono shadow-xs border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Agentic Solutions: Powered by x402 & Algorand</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif-display text-stone-900 tracking-tight leading-[1.12]">
            Small Farms. <br />
            <span className="text-[#2D4F1E] italic">One Powerful Network.</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto font-sans">
            Kishan Bhai combines the digital strength of smallholder farmers into{' '}
            <strong className="text-stone-900 font-semibold">Virtual Farm Clusters</strong>. 
            Get 20–30% bulk discounts on seeds & fertilizers, access collective buyer markets, and unlock autonomous agronomical AI powered by sub-cent{' '}
            <strong className="text-[#2D4F1E] font-semibold">x402 Algorand Testnet micropayments</strong>.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => {
                setCurrentView('login');
              }}
              className="bg-[#2D4F1E] hover:bg-[#223d16] text-white font-semibold px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-white/20 active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4 text-emerald-200" />
              <span>Sign In / Create Account</span>
            </button>

            <button
              onClick={() => {
                setUserRole('FARMER');
                setCurrentView('farmer-dashboard');
              }}
              className="bg-white/80 hover:bg-white text-stone-800 font-semibold px-6 py-3.5 rounded-2xl border border-white/90 shadow-xs hover:shadow-sm backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Explore Dashboards</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCurrentView('ai-assistant');
              }}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-[#2D4F1E] font-semibold px-6 py-3.5 rounded-2xl border border-[#2D4F1E]/20 shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-[#2D4F1E]" />
              <span>x402 Kishan AI</span>
            </button>
          </div>

          {/* Protocol summary strip */}
          <div className="pt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 bg-emerald-50/80 backdrop-blur-xs border border-emerald-200/60 px-3 py-1 rounded-full text-emerald-900 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Zero Land Consolidation</span>
            </div>
            <div className="flex items-center gap-1.5 bg-teal-50/80 backdrop-blur-xs border border-teal-200/60 px-3 py-1 rounded-full text-teal-900 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Real Algorand Testnet Settlements</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50/80 backdrop-blur-xs border border-amber-200/60 px-3 py-1 rounded-full text-amber-900 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              <span>GoPlausible Facilitator Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PHILOSOPHY & VIRTUAL CLUSTER VISUALIZER */}
      <section>
        <div className="bg-gradient-to-br from-[#182613] via-[#21351b] to-[#121c0e] text-white rounded-[32px] p-8 sm:p-12 shadow-xl border border-white/20 overflow-hidden relative">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-emerald-300 text-xs font-mono uppercase tracking-widest font-bold block bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full w-fit border border-white/15">
              The Kishan Bhai Paradigm
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-white">
              "We don't combine farmers' land. <br />
              <span className="text-emerald-300">We combine their digital strength.</span>"
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Traditional cooperatives attempt physical land pooling, which causes legal friction and farmer resistance. 
              Kishan Bhai creates <strong>Virtual Farm Clusters</strong>: individual farmers retain 100% land autonomy while aggregating input demand, pooling harvest supply, and sharing machinery logistics digitally.
            </p>
          </div>

          {/* Interactive Cluster Matrix Visualizer */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
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
              className="text-white hover:text-emerald-300 font-semibold flex items-center gap-1 underline cursor-pointer"
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
          <h2 className="text-3xl font-bold font-display text-stone-900">
            Built for India's 140 Million Smallholders
          </h2>
          <p className="text-sm text-stone-600">
            Solving the core pain points of Indian agriculture through digital coordination & sub-cent Web3 rails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white/60 backdrop-blur-lg rounded-[28px] p-6 border border-white/80 shadow-xs space-y-4 hover:shadow-md hover:bg-white/80 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#2D4F1E]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Bulk Buying Power</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Individually, small farmers pay peak retail margins. By pooling demand via clusters, inputs are purchased directly from manufacturers at wholesale rates.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/60 backdrop-blur-lg rounded-[28px] p-6 border border-white/80 shadow-xs space-y-4 hover:shadow-md hover:bg-white/80 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-800">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Harvest Pooling Lot</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Institutional buyers bypass middlemen by procuring standardized, lab-graded 20-ton lots assembled across clustered smallholder plots.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/60 backdrop-blur-lg rounded-[28px] p-6 border border-white/80 shadow-xs space-y-4 hover:shadow-md hover:bg-white/80 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">x402 Micropayments</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              No expensive monthly software subscriptions. Farmers pay ₹0.15 to ₹0.40 (0.002 USDC) strictly per deep AI crop diagnosis on Algorand Testnet.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white/60 backdrop-blur-lg rounded-[28px] p-6 border border-white/80 shadow-xs space-y-4 hover:shadow-md hover:bg-white/80 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-800">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Agentic Kishan AI</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Multi-modal Gemini 3.7 Flash agent capable of inspecting leaf blight photographs, calculating remediation plans, and triggering protected APIs.
            </p>
          </div>
        </div>
      </section>

      {/* x402 PROTOCOL DEEP DIVE SECTION */}
      <section>
        <div className="bg-[#182613] text-white rounded-[32px] p-8 sm:p-12 border border-white/20 space-y-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-emerald-300 font-mono text-xs uppercase tracking-wider block font-bold">
                COMPETITION SPECIFICATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                Real x402 Payment Flow Architecture
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-emerald-200 px-3.5 py-1.5 rounded-2xl border border-white/20 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GoPlausible Facilitator Verified</span>
            </div>
          </div>

          {/* 4 Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2.5">
              <div className="text-emerald-300 font-mono text-xs font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md w-fit">STEP 1</div>
              <h4 className="font-bold text-sm text-white">Client Requests Service</h4>
              <p className="text-stone-300 text-xs">
                Frontend calls protected API <code className="text-emerald-300">/api/paid/crop-analysis</code> without auth token.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2.5">
              <div className="text-amber-300 font-mono text-xs font-bold bg-amber-500/20 px-2 py-0.5 rounded-md w-fit">STEP 2</div>
              <h4 className="font-bold text-sm text-white">HTTP 402 Challenge</h4>
              <p className="text-stone-300 text-xs">
                Server intercepts with status <code className="text-amber-300">402 Payment Required</code> containing price (0.002 USDC) and Algorand receiver address.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2.5">
              <div className="text-teal-300 font-mono text-xs font-bold bg-teal-500/20 px-2 py-0.5 rounded-md w-fit">STEP 3</div>
              <h4 className="font-bold text-sm text-white">Algorand Settlement</h4>
              <p className="text-stone-300 text-xs">
                Wallet signs transaction to Algorand Testnet node. GoPlausible Facilitator pipeline verifies deterministic finality.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2.5">
              <div className="text-purple-300 font-mono text-xs font-bold bg-purple-500/20 px-2 py-0.5 rounded-md w-fit">STEP 4</div>
              <h4 className="font-bold text-sm text-white">Payload Delivery</h4>
              <p className="text-stone-300 text-xs">
                Client retries with <code className="text-purple-300">X-PAYMENT: txId</code>. Server verifies on testnet and serves Gemini agronomist diagnosis.
              </p>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-wrap justify-between items-center gap-4 text-xs font-mono">
            <span className="text-stone-300">
              Merchant Address: <span className="text-emerald-300">KBHAI4O4JYZ4K7V4Z2V3W5QZX3S6N6L2J7R8P9Q1S3T5U7V9W0Y2Z4A6B8</span>
            </span>
            <button
              onClick={() => setCurrentView('ai-assistant')}
              className="bg-[#2D4F1E] hover:bg-[#223d16] text-white px-4 py-2 rounded-xl font-sans font-medium transition-colors border border-white/20 cursor-pointer"
            >
              Try Live Diagnosis Now
            </button>
          </div>
        </div>
      </section>

      {/* 4 ROLES OVERVIEW */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl font-bold font-display text-stone-900">
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
            className="bg-white/60 backdrop-blur-lg p-6 rounded-[28px] border border-white/80 hover:border-[#2D4F1E]/50 transition-all cursor-pointer group shadow-xs hover:shadow-md hover:bg-white/80 space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-[#2D4F1E] flex items-center justify-center group-hover:bg-[#2D4F1E] group-hover:text-white transition-colors border border-emerald-500/20">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-base group-hover:text-[#2D4F1E]">1. Farmer</h3>
            <p className="text-xs text-stone-600">
              Manage acreage, pledge for bulk fertilizer orders, trigger AI crop diagnosis, and view real-time payments.
            </p>
            <span className="text-xs text-[#2D4F1E] font-semibold flex items-center gap-1">
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => {
              setUserRole('CHAMPION');
              setCurrentView('champion-dashboard');
            }}
            className="bg-white/60 backdrop-blur-lg p-6 rounded-[28px] border border-white/80 hover:border-teal-600/50 transition-all cursor-pointer group shadow-xs hover:shadow-md hover:bg-white/80 space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-800 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors border border-teal-500/20">
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
            className="bg-white/60 backdrop-blur-lg p-6 rounded-[28px] border border-white/80 hover:border-amber-600/50 transition-all cursor-pointer group shadow-xs hover:shadow-md hover:bg-white/80 space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center group-hover:bg-amber-700 group-hover:text-white transition-colors border border-amber-500/20">
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
            className="bg-white/60 backdrop-blur-lg p-6 rounded-[28px] border border-white/80 hover:border-purple-600/50 transition-all cursor-pointer group shadow-xs hover:shadow-md hover:bg-white/80 space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-800 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors border border-purple-500/20">
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
