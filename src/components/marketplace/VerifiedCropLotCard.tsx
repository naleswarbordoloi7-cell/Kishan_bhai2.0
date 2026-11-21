import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Layers,
  Scale,
  CheckCircle2,
  FileText,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Coins,
  ChevronRight,
  Fingerprint,
} from 'lucide-react';

export interface VerifiedCropLotProps {
  lotId?: string;
  cropName?: string;
  variety?: string;
  grade?: 'A' | 'B' | 'C';
  totalVolumeQuintals?: number;
  clusterCurrentVolumeQuintals?: number;
  clusterTargetVolumeQuintals?: number;
  pricePerQuintalInr?: number;
  clusterName?: string;
  farmerName?: string;
  farmerLocation?: string;
  moisturePercentage?: number;
  purityScore?: number;
  smartContractHash?: string;
  onAcceptSmartContract?: (lotId: string) => void;
}

export const VerifiedCropLotCard: React.FC<VerifiedCropLotProps> = ({
  lotId = 'LOT-PB-WHT-2026-904',
  cropName = 'Sharbati Durum Wheat',
  variety = 'HD-3086 Certified Seed Line',
  grade = 'A',
  totalVolumeQuintals = 40,
  clusterCurrentVolumeQuintals = 85,
  clusterTargetVolumeQuintals = 100,
  pricePerQuintalInr = 3100,
  clusterName = 'Malwa-Punjab Wheat Growers Federation',
  farmerName = 'Harpreet Singh',
  farmerLocation = 'Moga, Punjab (Zone 4)',
  moisturePercentage = 9.4,
  purityScore = 99.2,
  smartContractHash = '0x8f2a...c4b9',
  onAcceptSmartContract,
}) => {
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Calculate cluster fill rate
  const fillRatePercentage = Math.min(
    100,
    Math.round((clusterCurrentVolumeQuintals / clusterTargetVolumeQuintals) * 100)
  );

  // Gross escrow calculation
  const totalLotValueInr = totalVolumeQuintals * pricePerQuintalInr;
  const platformFeeInr = Math.round(totalLotValueInr * 0.015);
  const netFarmerPayoutInr = totalLotValueInr - platformFeeInr;

  // Grade color tokens
  const gradeStyles = {
    A: {
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      dotColor: 'bg-emerald-400',
      label: 'Grade A Export Premium',
    },
    B: {
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      dotColor: 'bg-amber-400',
      label: 'Grade B Commercial Standard',
    },
    C: {
      badgeBg: 'bg-zinc-900 text-zinc-300 border-zinc-700 ring-1 ring-zinc-700/40',
      dotColor: 'bg-zinc-400',
      label: 'Grade C Local Milling',
    },
  }[grade];

  const handleActionClick = () => {
    if (isAccepted || isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsAccepted(true);
      if (onAcceptSmartContract) {
        onAcceptSmartContract(lotId);
      }
    }, 900);
  };

  return (
    <div className="relative w-full max-w-md rounded-3xl bg-[#0C1210] text-stone-100 p-6 border border-emerald-900/40 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl overflow-hidden font-sans transition-all duration-300 hover:border-emerald-600/50 hover:shadow-[0_12px_40px_rgba(6,78,59,0.3)]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Lot Identifier & Glowing AI Verified Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800/80 relative z-10">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400">
            <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
            <span>Escrow Lot #{lotId}</span>
          </div>
          <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <span>{cropName}</span>
          </h3>
        </div>

        {/* SLEEK ANIMATED "AI VERIFIED" BADGE WITH SUBTLE GLOW */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-400/50 text-emerald-300 text-xs font-bold ring-2 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span className="tracking-wide">AI Verified</span>
        </div>
      </div>

      {/* Metadata & Origin */}
      <div className="py-4 space-y-3 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-400 font-medium">Producer Origin:</span>
          <span className="font-bold text-stone-200">
            {farmerName} · <span className="text-emerald-400">{farmerLocation}</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-400 font-medium">Assayed Quality Grade:</span>
          {/* CROP GRADE BADGE WITH DISTINCT COLOR CODING */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-black tracking-wider uppercase border ${gradeStyles.badgeBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${gradeStyles.dotColor}`} />
            <span>Grade {grade}</span>
          </span>
        </div>

        {/* Quality Lab Metrics Matrix */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-mono">Purity Assay</span>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {purityScore}% <span className="text-[10px] text-emerald-400 font-sans font-normal">Clean</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-mono">Moisture Index</span>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {moisturePercentage}% <span className="text-[10px] text-emerald-400 font-sans font-normal">&lt;10% Req</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIRTUAL CLUSTER FILL RATE PROGRESS BAR */}
      <div className="py-3 border-t border-stone-800/80 space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-stone-300">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Virtual Cluster Capacity</span>
          </div>
          <span className="font-mono text-emerald-400 font-black">
            {clusterCurrentVolumeQuintals} / {clusterTargetVolumeQuintals} Qtl ({fillRatePercentage}%)
          </span>
        </div>

        {/* Animated Progress Bar Track */}
        <div className="h-2.5 w-full bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)]"
            style={{ width: `${fillRatePercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-stone-500">
          <span>Target Contract: 100 Qtl</span>
          <span>{clusterTargetVolumeQuintals - clusterCurrentVolumeQuintals} Qtl Remaining to Seal</span>
        </div>
      </div>

      {/* Financial Escrow Breakdown */}
      <div className="py-3 border-t border-stone-800/80 flex items-center justify-between text-xs relative z-10">
        <div>
          <span className="text-[10px] font-mono uppercase text-stone-400">Total Lot Escrow Value</span>
          <div className="text-xl font-black text-white font-mono mt-0.5">
            ₹{totalLotValueInr.toLocaleString()}
          </div>
          <span className="text-[10px] text-stone-500 font-mono">
            @ ₹{pricePerQuintalInr}/Qtl · Net: ₹{netFarmerPayoutInr.toLocaleString()}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-stone-400">Escrow Trigger</span>
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-0.5">
            <Lock className="w-3 h-3" />
            <span>On Delivery Proof</span>
          </div>
          <span className="text-[10px] text-stone-500 font-mono">{smartContractHash}</span>
        </div>
      </div>

      {/* TACTILE "ACCEPT SMART CONTRACT" BUTTON */}
      <div className="pt-3 relative z-10">
        <button
          type="button"
          onClick={handleActionClick}
          disabled={isAccepted || isProcessing}
          className={`w-full h-12 min-h-[48px] rounded-2xl font-black text-sm tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            isAccepted
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-default'
              : 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-700 hover:from-emerald-500 hover:via-emerald-600 hover:to-amber-600 active:scale-95 text-white shadow-emerald-950/60 hover:shadow-emerald-500/25 border-t border-emerald-400/40'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2 text-xs normal-case font-bold">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Verifying Escrow Protection...</span>
            </span>
          ) : isAccepted ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Smart Contract Executed</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Accept Smart Contract</span>
              <ArrowUpRight className="w-4 h-4 text-stone-200" />
            </span>
          )}
        </button>
      </div>

      {/* Subtext info */}
      <div className="mt-2 text-center text-[10px] font-mono text-stone-500 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>Protected by verified milestone escrow settlement.</span>
      </div>
    </div>
  );
};
