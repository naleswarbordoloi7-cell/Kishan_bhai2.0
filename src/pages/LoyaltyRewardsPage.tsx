import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useApp } from '../context/AppContext';
import {
  Award,
  Gift,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Info,
  Clock,
  Settings,
  ChevronRight,
  CheckCircle,
  ExternalLink,
  Lock,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import {
  LoyaltyAccount,
  LoyaltyLedgerEntry,
  LoyaltyRewardItem,
  LoyaltyRewardRedemption,
  LoyaltyAdminConfig,
  LoyaltyTier,
} from '../../shared/types';
import { loyaltyService } from '../services/loyaltyService';

export const LoyaltyRewardsPage: React.FC = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const { setCurrentView, addToast } = useApp();

  const [activeRoleView, setActiveRoleView] = useState<'FARMER' | 'BUYER'>(
    currentUser?.role === 'BUYER' ? 'BUYER' : 'FARMER'
  );
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [ledger, setLedger] = useState<LoyaltyLedgerEntry[]>([]);
  const [rewards, setRewards] = useState<LoyaltyRewardItem[]>([]);
  const [redemptions, setRedemptions] = useState<LoyaltyRewardRedemption[]>([]);
  const [adminConfig, setAdminConfig] = useState<LoyaltyAdminConfig | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAdminDrawer, setShowAdminDrawer] = useState<boolean>(false);

  // Editable admin states
  const [editBuyerPurchase, setEditBuyerPurchase] = useState<number>(100);
  const [editFarmerSale, setEditFarmerSale] = useState<number>(100);
  const [editRepeatBonus, setEditRepeatBonus] = useState<number>(50);

  const effectiveUserId =
    activeRoleView === 'BUYER'
      ? currentUser?.role === 'BUYER'
        ? currentUser.id
        : 'usr_buyer_1'
      : currentUser?.role === 'FARMER'
      ? currentUser.id
      : 'usr_farmer_ramesh';

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const [acc, led, rew, red, cfg] = await Promise.all([
        loyaltyService.getAccount(effectiveUserId, activeRoleView),
        loyaltyService.getLedger(effectiveUserId, 50),
        loyaltyService.getRewards(activeRoleView),
        loyaltyService.getRedemptions(effectiveUserId),
        loyaltyService.getAdminConfig(),
      ]);

      setAccount(acc);
      setLedger(led);
      setRewards(rew);
      setRedemptions(red);
      setAdminConfig(cfg);

      if (cfg) {
        setEditBuyerPurchase(cfg.pointsRules.buyerPurchaseCompleted);
        setEditFarmerSale(cfg.pointsRules.farmerSaleCompleted);
        setEditRepeatBonus(cfg.pointsRules.repeatTransactionBonus);
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to load loyalty details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, [activeRoleView, effectiveUserId]);

  const handleRedeem = async (reward: LoyaltyRewardItem) => {
    if (!account) return;
    try {
      setRedeemingId(reward.id);
      const res = await loyaltyService.redeemReward(account.userId, reward.id);
      setAccount(res.account);
      setRedemptions((prev) => [res.redemption, ...prev]);
      // Refetch ledger to show deduction
      const updatedLedger = await loyaltyService.getLedger(account.userId);
      setLedger(updatedLedger);
      addToast('Reward Redeemed', `Voucher Code: ${res.redemption.voucherCode}`, 'success');
    } catch (err: any) {
      addToast('Redemption Failed', err.message, 'error');
    } finally {
      setRedeemingId(null);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSaveAdminConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await loyaltyService.updateAdminConfig({
        pointsRules: {
          ...adminConfig?.pointsRules!,
          buyerPurchaseCompleted: Number(editBuyerPurchase),
          farmerSaleCompleted: Number(editFarmerSale),
          repeatTransactionBonus: Number(editRepeatBonus),
        },
      });
      setAdminConfig(updated);
      setShowAdminDrawer(false);
      addToast('Config Updated', 'Admin loyalty rules updated successfully on server.', 'success');
      fetchLoyaltyData();
    } catch (err: any) {
      addToast('Update Failed', err.message, 'error');
    }
  };

  const tierRanks: Record<string, number> = { SILVER: 0, GOLD: 1, PLATINUM: 2, DIAMOND: 3 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Role Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-400/30">
              AUDITABLE TWO-SIDED REWARDS
            </span>
            <span className="text-xs text-stone-300">|</span>
            <span className="text-xs text-emerald-300 font-mono">Server-Authoritative Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-white">
            Farmer & Buyer Loyalty Rewards Network
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Every transaction, verified quality check, on-time delivery, and repeat partnership is permanently recorded in our auditable ledger, unlocking tangible fee discounts and priority services.
          </p>
        </div>

        {/* Action Controls & Role Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full sm:w-auto">
          {/* Role Toggle */}
          <div className="bg-stone-800/90 p-1 rounded-2xl border border-white/10 flex text-xs font-semibold">
            <button
              onClick={() => setActiveRoleView('FARMER')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeRoleView === 'FARMER'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Farmer View
            </button>
            <button
              onClick={() => setActiveRoleView('BUYER')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeRoleView === 'BUYER'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Buyer View
            </button>
          </div>

          {/* Admin Policy Trigger */}
          <button
            onClick={() => setShowAdminDrawer(true)}
            className="bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-medium px-3.5 py-2 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-amber-300" />
            <span>Admin Policy</span>
          </button>
        </div>
      </div>

      {/* Account Overview Cards */}
      {account && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tier Progress Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-emerald-900/10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-5">
              <div>
                <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">
                  Active {account.userRole} Profile
                </span>
                <h3 className="text-2xl font-bold font-serif-display text-stone-900 mt-0.5">
                  {account.userName}
                </h3>
                <p className="text-xs text-stone-500">ID: {account.userId}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-4 py-1.5 rounded-2xl text-xs font-bold uppercase tracking-wider border shadow-xs ${
                  account.tier === 'DIAMOND'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-cyan-400'
                    : account.tier === 'PLATINUM'
                    ? 'bg-gradient-to-r from-slate-700 to-zinc-900 text-white border-slate-400'
                    : account.tier === 'GOLD'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-700 text-white border-amber-300'
                    : 'bg-stone-600 text-white border-stone-400'
                }`}>
                  {account.tier} TIER
                </div>

                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-amber-700 leading-none">
                    {account.points.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">Available Points</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  {account.nextTier ? `Progress to ${account.nextTier} Level` : 'Highest Diamond Tier'}
                </span>
                <span className="font-mono text-stone-600">
                  {account.nextTier ? (
                    <>
                      <strong className="text-amber-800">{account.pointsToNextTier}</strong> points needed
                    </>
                  ) : (
                    'Maximum Perks Unlocked'
                  )}
                </span>
              </div>

              <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-600 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(5, account.progressPercent)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-stone-400 pt-1">
                <span>Silver (0)</span>
                <span>Gold (500)</span>
                <span>Platinum (1,500)</span>
                <span>Diamond (3,500+)</span>
              </div>
            </div>

            {/* Unlocked Privileges */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Unlocked Level Privileges</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {account.unlockedBenefits.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-stone-800"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics & Fairness Note */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-stone-900">Milestone Statistics</h4>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 uppercase font-medium">Completed Trades</span>
                  <div className="text-xl font-bold font-mono text-stone-900 mt-0.5">
                    {account.completedTransactionsCount}
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/70">
                  <span className="text-[10px] text-amber-800 uppercase font-medium">Repeat Orders</span>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
                    {account.repeatTransactionCount}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/70">
                  <span className="text-[10px] text-emerald-800 uppercase font-medium">Trust Score</span>
                  <div className="text-xl font-bold font-mono text-emerald-800 mt-0.5">
                    {account.averageRatingScore.toFixed(1)} ★
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 uppercase font-medium">Lifetime Earned</span>
                  <div className="text-xl font-bold font-mono text-stone-900 mt-0.5">
                    {account.lifetimePointsEarned}
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setCurrentView(activeRoleView === 'FARMER' ? 'marketplace' : 'marketplace')}
                  className="w-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{activeRoleView === 'FARMER' ? 'Explore Buyer Offers' : 'Find Clustered Farmers'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('rewards-catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>Browse Redeemable Rewards</span>
                </button>
              </div>
            </div>

            {/* Non-discrimination Fairness Pledge */}
            <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200/80 space-y-2 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Fairness & Transparency Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900/90">
                Kishan Bhai guarantees that higher loyalty levels unlock discounts on platform machinery, escrow fees, and logistics. <strong>A higher level never guarantees a higher crop selling price or discriminates against lower-tier farmers in standard mandi pricing discovery.</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4-Tier Matrix Comparison */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold font-serif-display text-lg text-stone-900">
            {activeRoleView === 'FARMER' ? 'Farmer Loyalty Tiers & Benefits' : 'Buyer Loyalty Tiers & Benefits'}
          </h3>
          <p className="text-xs text-stone-500">
            Four milestone levels advancing transparently based on verified agricultural activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              tier: 'SILVER',
              range: '0–499 pts',
              color: 'border-stone-300 bg-stone-50',
              badge: 'bg-stone-200 text-stone-800',
              farmerPerks: [
                'Standard verified buyer offers',
                'Live APMC mandi price discovery',
                'Transparent escrow protection',
                'Cluster pooling participation',
              ],
              buyerPerks: [
                'Discover verified farmers & clusters',
                'View standard crop listings',
                'Submit purchase proposals',
                'Basic delivery tracking',
              ],
            },
            {
              tier: 'GOLD',
              range: '500–1,499 pts',
              color: 'border-amber-300 bg-amber-50/40',
              badge: 'bg-amber-200 text-amber-900',
              farmerPerks: [
                'All Silver benefits',
                'Additional eligible buyer opportunities',
                'Bulk-selling priority allocation',
                'Machinery rental rebate eligibility',
              ],
              buyerPerks: [
                'All Silver benefits',
                'Eligible bulk procurement opportunities',
                '1-click repeat order tool',
                'Loyalty fee waivers on orders',
              ],
            },
            {
              tier: 'PLATINUM',
              range: '1,500–3,499 pts',
              color: 'border-slate-300 bg-slate-50/60',
              badge: 'bg-slate-200 text-slate-800',
              farmerPerks: [
                'All Gold benefits',
                'Premium institutional buyer matching',
                'Priority transport freight subsidy',
                'Direct ICAR agronomist consultation',
              ],
              buyerPerks: [
                'All Gold benefits',
                'Advanced multi-attribute filtering',
                'Priority dispute & delivery support',
                'Repeat purchase point multiplier',
              ],
            },
            {
              tier: 'DIAMOND',
              range: '3,500+ pts',
              color: 'border-cyan-300 bg-cyan-50/40',
              badge: 'bg-cyan-100 text-cyan-900',
              farmerPerks: [
                'All Platinum benefits',
                'Priority consideration for high-volume bids',
                '0.0% platform fee on cluster escrow',
                'Annual Agri-Leadership badge & summit',
              ],
              buyerPerks: [
                'All Platinum benefits',
                'Forward contract sourcing desk',
                'Dedicated procurement concierge',
                'Direct farm gate cluster audits',
              ],
            },
          ].map((col) => {
            const isCurrent = account?.tier === col.tier;
            const perks = activeRoleView === 'FARMER' ? col.farmerPerks : col.buyerPerks;

            return (
              <div
                key={col.tier}
                className={`p-5 rounded-2xl border-2 transition-all relative ${col.color} ${
                  isCurrent ? 'ring-2 ring-emerald-600 shadow-md' : 'shadow-2xs'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 right-4 bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase">
                    Your Tier
                  </span>
                )}

                <div className="flex justify-between items-baseline mb-3">
                  <h4 className="font-bold text-base text-stone-900">{col.tier}</h4>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${col.badge}`}>
                    {col.range}
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-stone-700">
                  {perks.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="leading-tight">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Point-Earning Guide */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-5">
        <div>
          <h3 className="font-bold font-serif-display text-lg text-stone-900">
            How Points Are Earned (Verified Platform Activities)
          </h3>
          <p className="text-xs text-stone-500">
            Points are never awarded for created requests alone. Points require verified milestones (KYC, escrow settlement, delivery sign-off, genuine feedback).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
              <tr>
                <th className="p-3">Verified Activity</th>
                <th className="p-3">Eligible Role</th>
                <th className="p-3">Verification Rule & Requirement</th>
                <th className="p-3 text-right">Points Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              <tr className="hover:bg-stone-50">
                <td className="p-3 font-semibold text-stone-900">Identity & Profile Verification</td>
                <td className="p-3 text-stone-600">Farmer & Buyer</td>
                <td className="p-3 text-stone-500">Aadhaar / Land record check or Buyer GSTIN audit by Sarpanch</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-700">+50 to +100</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="p-3 font-semibold text-stone-900">Completed Eligible Crop Trade</td>
                <td className="p-3 text-stone-600">Farmer & Buyer</td>
                <td className="p-3 text-stone-500">Escrow funds locked and fully settled via Algorand smart contracts</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-700">+100</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="p-3 font-semibold text-stone-900">Confirmed Successful Delivery</td>
                <td className="p-3 text-stone-600">Farmer & Buyer</td>
                <td className="p-3 text-stone-500">Weighbridge receipt and warehouse sign-off verified</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-700">+50</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="p-3 font-semibold text-stone-900">Maintain Verified Quality Standard</td>
                <td className="p-3 text-stone-600">Farmer</td>
                <td className="p-3 text-stone-500">Moisture & purity assay test passed Grade A standard</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-700">+50</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="p-3 font-semibold text-stone-900">Genuine Rating & Review</td>
                <td className="p-3 text-stone-600">Farmer & Buyer</td>
                <td className="p-3 text-stone-500">Submitted after completed trade; points awarded to both parties</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-700">+20</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="p-3 font-semibold text-stone-900">Eligible Repeat Sourcing Bonus</td>
                <td className="p-3 text-stone-600">Farmer & Buyer</td>
                <td className="p-3 text-stone-500">Consecutive trade completed between the same grower cluster and buyer</td>
                <td className="p-3 text-right font-mono font-bold text-amber-700">+50</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rewards Catalog Section */}
      <div id="rewards-catalog-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold font-serif-display text-lg text-stone-900">
              Redeemable Rewards & Fulfillable Vouchers
            </h3>
            <p className="text-xs text-stone-500">
              Convert your earned points into real discounts fulfilled by Kishan Bhai partner hubs.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'FEE_WAIVER', 'MACHINERY', 'LOGISTICS', 'QUALITY_TESTING', 'PRIORITY_SUPPORT'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-[11px] font-medium px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-emerald-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards
            .filter((r) => categoryFilter === 'ALL' || r.category === categoryFilter)
            .map((reward) => {
              const hasPoints = account ? account.points >= reward.pointsCost : false;
              const meetsTier = account ? tierRanks[account.tier] >= tierRanks[reward.minTier] : false;
              const canRedeem = hasPoints && meetsTier && reward.isAvailable;

              return (
                <div
                  key={reward.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    canRedeem
                      ? 'bg-white border-stone-200 hover:border-emerald-600 shadow-xs'
                      : 'bg-stone-50 border-stone-200/70 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                        {reward.discountValueText}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">
                        Tier: {reward.minTier}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900">{reward.title}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{reward.description}</p>
                    <p className="text-[11px] text-stone-400">
                      <strong>Fulfilled by:</strong> {reward.fulfilledByService}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center">
                    <div>
                      <span className="text-base font-bold font-mono text-emerald-800">
                        {reward.pointsCost}
                      </span>
                      <span className="text-xs text-stone-500 ml-1">pts</span>
                    </div>

                    <button
                      disabled={!canRedeem || redeemingId === reward.id}
                      onClick={() => handleRedeem(reward)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        canRedeem
                          ? 'bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {redeemingId === reward.id
                        ? 'Redeeming...'
                        : !meetsTier
                        ? `Req. ${reward.minTier}`
                        : !hasPoints
                        ? 'Need more pts'
                        : 'Redeem'}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Active Vouchers Wallet */}
      {redemptions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold font-serif-display text-lg text-stone-900">
                My Active Vouchers & Coupons
              </h3>
              <p className="text-xs text-stone-500">
                Apply these codes during checkout, machinery reservation, or freight dispatch.
              </p>
            </div>
            <span className="font-mono text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
              {redemptions.length} Vouchers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {redemptions.map((red) => (
              <div
                key={red.id}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      {red.status}
                    </span>
                    <h5 className="font-bold text-xs text-stone-900 mt-1">{red.rewardTitle}</h5>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">
                    Exp: {red.expiresAt.split('T')[0]}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="font-mono font-bold text-xs text-stone-900">
                    {red.voucherCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(red.voucherCode)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === red.voucherCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auditable Loyalty Ledger Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold font-serif-display text-lg text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-800" />
              <span>Auditable Loyalty Transaction Ledger</span>
            </h3>
            <p className="text-xs text-stone-500">
              Immutable log of every point award, deduction, and reversal for this account.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-400">
            Total entries: {ledger.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Activity & Details</th>
                <th className="p-3">Reference ID</th>
                <th className="p-3 text-center">Change</th>
                <th className="p-3 text-right">Resulting Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-stone-50">
                  <td className="p-3 font-mono text-stone-500 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-stone-900 block">{entry.title}</span>
                    {entry.notes && (
                      <span className="text-[11px] text-stone-500 block mt-0.5">{entry.notes}</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-stone-400 text-[11px]">
                    {entry.referenceId || '—'}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                        entry.pointsDelta > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {entry.pointsDelta > 0 ? `+${entry.pointsDelta}` : entry.pointsDelta}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-stone-900">
                    {entry.resultingBalance} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Policy Configuration Drawer / Modal */}
      {showAdminDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-emerald-900/10 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold font-serif-display text-lg text-stone-900">
                  Admin Loyalty Policy Rules
                </h3>
                <p className="text-xs text-stone-500">Configure point values for verified platform events</p>
              </div>
              <button onClick={() => setShowAdminDrawer(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdminConfig} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Buyer Completed Purchase (Points):
                </label>
                <input
                  type="number"
                  required
                  value={editBuyerPurchase}
                  onChange={(e) => setEditBuyerPurchase(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Farmer Completed Sale (Points):
                </label>
                <input
                  type="number"
                  required
                  value={editFarmerSale}
                  onChange={(e) => setEditFarmerSale(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Repeat Transaction Bonus (Points):
                </label>
                <input
                  type="number"
                  required
                  value={editRepeatBonus}
                  onChange={(e) => setEditRepeatBonus(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-[11px] space-y-1">
                <div><strong>Gold Threshold:</strong> {adminConfig?.tierThresholds.gold} pts</div>
                <div><strong>Platinum Threshold:</strong> {adminConfig?.tierThresholds.platinum} pts</div>
                <div><strong>Diamond Threshold:</strong> {adminConfig?.tierThresholds.diamond} pts</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminDrawer(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  Save Policy Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
