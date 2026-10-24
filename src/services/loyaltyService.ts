import {
  LoyaltyAccount,
  LoyaltyLedgerEntry,
  LoyaltyRewardItem,
  LoyaltyRewardRedemption,
  OrderRating,
  LoyaltyAdminConfig,
} from '../../shared/types';

export const loyaltyService = {
  async getAccount(userId?: string, role?: 'FARMER' | 'BUYER'): Promise<LoyaltyAccount> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (role) params.set('role', role);

    const res = await fetch(`/api/loyalty/account?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch loyalty account');
    const data = await res.json();
    return data.account;
  },

  async getLedger(userId?: string, limit = 50): Promise<LoyaltyLedgerEntry[]> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    params.set('limit', limit.toString());

    const res = await fetch(`/api/loyalty/ledger?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch loyalty ledger');
    const data = await res.json();
    return data.ledger || [];
  },

  async getRewards(role: 'FARMER' | 'BUYER' | 'ALL' = 'ALL'): Promise<LoyaltyRewardItem[]> {
    const res = await fetch(`/api/loyalty/rewards?role=${role}`);
    if (!res.ok) throw new Error('Failed to fetch rewards catalog');
    const data = await res.json();
    return data.rewards || [];
  },

  async getRedemptions(userId?: string): Promise<LoyaltyRewardRedemption[]> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);

    const res = await fetch(`/api/loyalty/redemptions?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch user redemptions');
    const data = await res.json();
    return data.redemptions || [];
  },

  async redeemReward(userId: string, rewardId: string): Promise<{ redemption: LoyaltyRewardRedemption; account: LoyaltyAccount }> {
    const res = await fetch('/api/loyalty/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rewardId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to redeem reward');
    return { redemption: data.redemption, account: data.account };
  },

  async confirmDelivery(orderId: string, userId: string, isBuyer = true): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/loyalty/confirm-delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, userId, isBuyer }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to confirm delivery');
    return data;
  },

  async rateOrder(params: {
    orderId: string;
    farmerId: string;
    buyerId: string;
    buyerName: string;
    ratingScore: number;
    qualityFeedback: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'SUBPAR';
    deliveryOnTime: boolean;
    comments: string;
  }): Promise<{ rating: OrderRating; farmerAccount: LoyaltyAccount; buyerAccount: LoyaltyAccount }> {
    const res = await fetch('/api/loyalty/rate-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit rating');
    return data;
  },

  async repeatOrder(orderId: string, buyerId?: string): Promise<any> {
    const res = await fetch('/api/loyalty/repeat-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, buyerId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to repeat order');
    return data.request;
  },

  async updateOrderStatus(requestId: string, status: 'ACCEPTED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED'): Promise<any> {
    const res = await fetch('/api/marketplace/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data.request;
  },

  async getAdminConfig(): Promise<LoyaltyAdminConfig> {
    const res = await fetch('/api/loyalty/admin/config');
    if (!res.ok) throw new Error('Failed to fetch admin config');
    const data = await res.json();
    return data.config;
  },

  async updateAdminConfig(config: Partial<LoyaltyAdminConfig>): Promise<LoyaltyAdminConfig> {
    const res = await fetch('/api/loyalty/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update admin config');
    return data.config;
  },
};
