import React, { useState } from 'react';
import { Gift, X, Check, Copy, AlertCircle, Sparkles, Tag, Clock, ExternalLink } from 'lucide-react';
import { LoyaltyRewardItem, LoyaltyRewardRedemption, LoyaltyAccount } from '../../../shared/types';
import { loyaltyService } from '../../services/loyaltyService';

interface RewardRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: LoyaltyAccount | null;
  rewards: LoyaltyRewardItem[];
  redemptions: LoyaltyRewardRedemption[];
  onRewardRedeemed: (newRedemption: LoyaltyRewardRedemption, updatedAccount: LoyaltyAccount) => void;
}

export const RewardRedemptionModal: React.FC<RewardRedemptionModalProps> = ({
  isOpen,
  onClose,
  account,
  rewards,
  redemptions,
  onRewardRedeemed,
}) => {
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'MY_VOUCHERS'>('CATALOG');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !account) return null;

  const filteredRewards = rewards.filter((r) => {
    if (r.eligibleRole !== 'BOTH' && r.eligibleRole !== account.userRole) return false;
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    return true;
  });

  const handleRedeem = async (reward: LoyaltyRewardItem) => {
    try {
      setRedeemingId(reward.id);
      setErrorMessage(null);
      const res = await loyaltyService.redeemReward(account.userId, reward.id);
      onRewardRedeemed(res.redemption, res.account);
      setActiveTab('MY_VOUCHERS');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to redeem reward');
    } finally {
      setRedeemingId(null);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const tierRanks: Record<string, number> = { SILVER: 0, GOLD: 1, PLATINUM: 2, DIAMOND: 3 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-emerald-900/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white p-5 sm:p-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold font-serif-display text-lg text-white">
                Loyalty Rewards & Discount Center
              </h3>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              Redeem earned loyalty points for tangible discounts fulfilling real agricultural services.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Balance Header Sub-bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-stone-500 font-medium">Your Balance:</span>
            <span className="font-mono font-bold text-amber-800 text-sm bg-amber-100/70 border border-amber-300/60 px-2.5 py-0.5 rounded-full">
              {account.points.toLocaleString()} Points
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-600 font-medium">Tier: <strong className="text-emerald-900">{account.tier}</strong></span>
          </div>

          {/* Segmented View Tabs */}
          <div className="flex bg-stone-200/80 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('CATALOG')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'CATALOG' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Rewards Store ({filteredRewards.length})
            </button>
            <button
              onClick={() => setActiveTab('MY_VOUCHERS')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'MY_VOUCHERS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              My Vouchers ({redemptions.length})
            </button>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'CATALOG' ? (
            <>
              {/* Category Filters */}
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'FEE_WAIVER', 'MACHINERY', 'LOGISTICS', 'QUALITY_TESTING', 'PRIORITY_SUPPORT'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-[11px] font-medium px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-emerald-900 text-white font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Rewards List */}
              <div className="space-y-3">
                {filteredRewards.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-xs">
                    No reward vouchers found in this category for your account role.
                  </div>
                ) : (
                  filteredRewards.map((reward) => {
                    const hasPoints = account.points >= reward.pointsCost;
                    const meetsTier = tierRanks[account.tier] >= tierRanks[reward.minTier];
                    const canRedeem = hasPoints && meetsTier && reward.isAvailable;

                    return (
                      <div
                        key={reward.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          canRedeem
                            ? 'bg-white border-stone-200 hover:border-emerald-700/40 shadow-xs'
                            : 'bg-stone-50 border-stone-200/60 opacity-80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                                {reward.discountValueText}
                              </span>
                              <span className="text-[10px] font-mono text-stone-500 uppercase">
                                Min Tier: {reward.minTier}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-stone-900 mt-1">
                              {reward.title}
                            </h4>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="font-mono font-bold text-lg text-emerald-800 block">
                              {reward.pointsCost} <span className="text-xs font-normal text-stone-500">pts</span>
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-stone-600 mt-2">
                          {reward.description}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-stone-500">
                          <span>Terms: {reward.terms}</span>

                          <button
                            disabled={!canRedeem || redeemingId === reward.id}
                            onClick={() => handleRedeem(reward)}
                            className={`w-full sm:w-auto px-4 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                              canRedeem
                                ? 'bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            {redeemingId === reward.id ? (
                              'Redeeming...'
                            ) : !meetsTier ? (
                              `Requires ${reward.minTier}`
                            ) : !hasPoints ? (
                              `Need ${reward.pointsCost - account.points} more pts`
                            ) : (
                              'Redeem Voucher'
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* My Vouchers View */
            <div className="space-y-3">
              {redemptions.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  <Gift className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p>You have not redeemed any vouchers yet.</p>
                  <button
                    onClick={() => setActiveTab('CATALOG')}
                    className="mt-2 text-emerald-700 font-bold hover:underline"
                  >
                    Browse Rewards Store
                  </button>
                </div>
              ) : (
                redemptions.map((red) => (
                  <div
                    key={red.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      red.status === 'ACTIVE'
                        ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                        : 'bg-stone-50 border-stone-200 opacity-70'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          red.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}>
                          {red.status}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 mt-1">{red.rewardTitle}</h4>
                        <p className="text-xs text-emerald-800 font-semibold">{red.discountValueText}</p>
                      </div>

                      <span className="text-[11px] text-stone-500 font-mono">
                        Valid until: {red.expiresAt.split('T')[0]}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-stone-500">Voucher Code:</span>
                        <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-md border border-stone-300 text-stone-900 tracking-wider">
                          {red.voucherCode}
                        </span>
                      </div>

                      <button
                        onClick={() => copyToClipboard(red.voucherCode)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode === red.voucherCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 text-center">
          <p className="text-[11px] text-stone-500">
            All vouchers are fulfilled through Kishan Bhai platform smart contracts and verified rural fulfillment hubs.
          </p>
        </div>
      </div>
    </div>
  );
};
