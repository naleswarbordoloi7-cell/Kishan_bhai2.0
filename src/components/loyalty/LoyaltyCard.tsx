import React from 'react';
import { Award, Sparkles, TrendingUp, ShieldCheck, Gift, ArrowRight, RefreshCw, CheckCircle, ChevronRight, Info } from 'lucide-react';
import { LoyaltyAccount, LoyaltyTier } from '../../../shared/types';

interface LoyaltyCardProps {
  account: LoyaltyAccount | null;
  loading?: boolean;
  onViewRewards: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  onRepeatOrder?: () => void;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  repeatActionLabel?: string;
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  account,
  loading = false,
  onViewRewards,
  onPrimaryAction,
  onSecondaryAction,
  onRepeatOrder,
  primaryActionLabel,
  secondaryActionLabel,
  repeatActionLabel = 'Repeat Order',
}) => {
  if (loading || !account) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 shadow-xs animate-pulse space-y-4">
        <div className="h-6 bg-stone-200 rounded w-1/3"></div>
        <div className="h-10 bg-stone-200 rounded w-1/2"></div>
        <div className="h-4 bg-stone-200 rounded w-full"></div>
      </div>
    );
  }

  const getTierBadge = (tier: LoyaltyTier) => {
    switch (tier) {
      case 'DIAMOND':
        return {
          bg: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white border-cyan-400/40 shadow-cyan-200',
          ring: 'border-cyan-500',
          label: 'Diamond Member',
          iconColor: 'text-cyan-300',
        };
      case 'PLATINUM':
        return {
          bg: 'bg-gradient-to-r from-slate-700 via-zinc-800 to-slate-900 text-white border-slate-400/40 shadow-slate-200',
          ring: 'border-slate-500',
          label: 'Platinum Member',
          iconColor: 'text-slate-300',
        };
      case 'GOLD':
        return {
          bg: 'bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-800 text-white border-amber-400/50 shadow-amber-200',
          ring: 'border-amber-500',
          label: 'Gold Member',
          iconColor: 'text-amber-300',
        };
      case 'SILVER':
      default:
        return {
          bg: 'bg-gradient-to-r from-stone-600 to-zinc-700 text-white border-stone-400/40 shadow-stone-200',
          ring: 'border-stone-400',
          label: 'Silver Member',
          iconColor: 'text-stone-300',
        };
    }
  };

  const badge = getTierBadge(account.tier);
  const isFarmer = account.userRole === 'FARMER';

  return (
    <div className="bg-white rounded-2xl border border-emerald-900/10 shadow-xs overflow-hidden transition-all hover:shadow-md">
      {/* Top Banner with Tier Branding */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white p-5 sm:p-6 relative overflow-hidden">
        {/* Subtle background ornamentation */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${badge.bg}`}>
                <Award className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                <span>{badge.label}</span>
              </span>
              <span className="text-[11px] text-stone-300 bg-white/10 px-2 py-0.5 rounded-md font-mono">
                {isFarmer ? 'Farmer Rewards' : 'Institutional Buyer Rewards'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-display text-white">
              {account.userName}
            </h3>
            <p className="text-xs text-stone-300 mt-0.5">
              Two-sided auditable loyalty network • Verified transactions earn genuine perks
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-stone-300 uppercase tracking-wider font-medium">Available Balance</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">
                {account.points.toLocaleString()}
              </span>
              <span className="text-xs text-amber-200/80 font-semibold">Points</span>
            </div>
            <span className="text-[10px] text-emerald-300 font-mono">
              Lifetime: {account.lifetimePointsEarned.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-stone-300 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              {account.nextTier ? (
                <>
                  Progress to <strong className="text-amber-300">{account.nextTier}</strong>
                </>
              ) : (
                <strong className="text-cyan-300">Top Tier Achieved (Diamond)</strong>
              )}
            </span>
            <span className="text-stone-300 font-mono font-semibold">
              {account.nextTier ? (
                <>
                  <span className="text-amber-300 font-bold">{account.pointsToNextTier.toLocaleString()}</span> pts needed
                </>
              ) : (
                '3,500+ pts'
              )}
            </span>
          </div>
          
          <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(6, account.progressPercent)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1.5">
            <span>Silver (0)</span>
            <span>Gold (500)</span>
            <span>Platinum (1,500)</span>
            <span>Diamond (3,500+)</span>
          </div>
        </div>
      </div>

      {/* Benefits & Actions Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Unlocked Benefits Grid */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Unlocked Tier Benefits</span>
            </h4>
            <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {account.unlockedBenefits.length} Active Privileges
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {account.unlockedBenefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-stone-800"
              >
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="leading-snug">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Stats Counter */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-900/10 text-center">
          <div>
            <div className="text-[10px] text-stone-500 uppercase font-medium">Completed Trades</div>
            <div className="text-lg font-bold font-mono text-stone-900 mt-0.5">
              {account.completedTransactionsCount}
            </div>
          </div>
          <div className="border-x border-emerald-900/10">
            <div className="text-[10px] text-stone-500 uppercase font-medium">Repeat Orders</div>
            <div className="text-lg font-bold font-mono text-amber-700 mt-0.5">
              {account.repeatTransactionCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-stone-500 uppercase font-medium">Trust Rating</div>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
              {account.averageRatingScore.toFixed(1)} ★
            </div>
          </div>
        </div>

        {/* Fairness Guarantee Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="leading-tight">
            <strong>Fairness Guarantee:</strong> Higher loyalty levels unlock eligible procurement opportunities and fee discounts. Higher tiers <em>never</em> artificially alter or guarantee higher crop base prices.
          </p>
        </div>

        {/* Required Action Buttons */}
        <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-2.5">
          <button
            onClick={onPrimaryAction}
            className="flex-1 min-w-[140px] bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{primaryActionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onViewRewards}
            className="flex-1 min-w-[130px] bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>View Rewards</span>
          </button>

          {onRepeatOrder && (
            <button
              onClick={onRepeatOrder}
              className="min-w-[120px] bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
              <span>{repeatActionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="min-w-[130px] bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
