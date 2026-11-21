import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Building,
  Store,
  Package,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Coins,
  Star,
  RefreshCw,
  Gift,
  Zap,
  Sparkles,
  FileText,
  Building2,
} from 'lucide-react';
import { HarvestPoolLot, BuyerPurchaseRequest, LoyaltyAccount, LoyaltyRewardItem, LoyaltyRewardRedemption } from '../../shared/types';
import { LoyaltyCard } from '../components/loyalty/LoyaltyCard';
import { RewardRedemptionModal } from '../components/loyalty/RewardRedemptionModal';
import { OrderRatingModal } from '../components/loyalty/OrderRatingModal';
import { VirtualClusterAggregatorModal } from '../components/marketplace/VirtualClusterAggregatorModal';
import { loyaltyService } from '../services/loyaltyService';

export const BuyerDashboard: React.FC = () => {
  const currentUser = useUserStore(state => state.currentUser);
  const buyerProfile = useUserStore(state => state.buyerProfile);
  const { setCurrentView, addToast } = useApp();

  const isBuyerAccount = currentUser?.role === 'BUYER';
  const effectiveBuyerId = (isBuyerAccount && currentUser?.id) || 'usr_buyer_itc';
  const activeBuyerName = (isBuyerAccount && currentUser?.fullName) || buyerProfile.fullName || 'Arunav Sengupta';
  const activeBuyerCompany = (isBuyerAccount && currentUser?.companyName) || buyerProfile.companyName || 'ITC Agri Sourcing';
  const activeBuyerDepot = (isBuyerAccount && currentUser?.warehouseLocation) || buyerProfile.warehouseLocation || 'Ahmedabad Processing Depot';
  const activeBuyerGstin = (isBuyerAccount && currentUser?.gstin) || buyerProfile.gstin;
  const activeBuyerBusinessType = (isBuyerAccount && currentUser?.businessType) || buyerProfile.businessType;

  const [lots, setLots] = useState<HarvestPoolLot[]>([]);
  const [suggestedLots, setSuggestedLots] = useState<HarvestPoolLot[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<BuyerPurchaseRequest[]>([]);
  const [selectedLot, setSelectedLot] = useState<HarvestPoolLot | null>(null);
  const [offeredPrice, setOfferedPrice] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>(activeBuyerDepot);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Buyer Loyalty State
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyRewardItem[]>([]);
  const [loyaltyRedemptions, setLoyaltyRedemptions] = useState<LoyaltyRewardRedemption[]>([]);
  const [showRewardsModal, setShowRewardsModal] = useState<boolean>(false);
  const [showAggregatorModal, setShowAggregatorModal] = useState<boolean>(false);
  const [ratingOrder, setRatingOrder] = useState<BuyerPurchaseRequest | null>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState<boolean>(true);

  useEffect(() => {
    setDeliveryLocation(activeBuyerDepot);
  }, [activeBuyerDepot]);

  useEffect(() => {
    const headers = { 'x-user-id': effectiveBuyerId };
    
    fetch('/api/marketplace', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.lots) setLots(data.lots);
        if (data.suggestions) setSuggestedLots(data.suggestions);
        if (data.purchaseRequests) setPurchaseRequests(data.purchaseRequests);
      })
      .catch(() => {});

    loyaltyService
      .getAccount(effectiveBuyerId, 'BUYER')
      .then((acc) => setLoyaltyAccount(acc))
      .catch(() => {})
      .finally(() => setLoyaltyLoading(false));

    loyaltyService.getRewards('BUYER').then(setLoyaltyRewards).catch(() => {});
    loyaltyService.getRedemptions(effectiveBuyerId).then(setLoyaltyRedemptions).catch(() => {});
  }, [effectiveBuyerId]);

  const handleConfirmDelivery = async (req: BuyerPurchaseRequest) => {
    try {
      const res = await loyaltyService.confirmDelivery(req.id, effectiveBuyerId, true);
      addToast('Delivery Confirmed', res.message, 'success');
      // Refresh requests and account
      const [acc, mkt] = await Promise.all([
        loyaltyService.getAccount(effectiveBuyerId, 'BUYER'),
        fetch('/api/marketplace').then((r) => r.json()),
      ]);
      setLoyaltyAccount(acc);
      if (mkt.purchaseRequests) setPurchaseRequests(mkt.purchaseRequests);
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleRepeatOrder = async (orderId?: string) => {
    try {
      const targetId = orderId || purchaseRequests.find((r) => r.status === 'COMPLETED' || r.status === 'ACCEPTED')?.id;
      if (!targetId) {
        addToast('No Prior Orders', 'Submit a purchase proposal first to use the 1-click repeat tool.', 'info');
        return;
      }
      const newReq = await loyaltyService.repeatOrder(targetId, effectiveBuyerId);
      setPurchaseRequests((prev) => [newReq, ...prev]);
      addToast('Repeat Order Created', `Created repeat purchase proposal for ${newReq.crop}.`, 'success');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleCreatePurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    try {
      const price = parseFloat(offeredPrice) || selectedLot.minimumTargetPricePerKg;
      const res = await fetch('/api/marketplace/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          harvestLotId: selectedLot.id,
          buyerId: effectiveBuyerId,
          buyerName: activeBuyerName,
          buyerCompany: activeBuyerCompany,
          offeredPricePerKg: price,
          deliveryLocation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPurchaseRequests((prev) => [data.request, ...prev]);
        setSelectedLot(null);
        setOfferedPrice('');
        addToast('Purchase Request Submitted', `Offered ₹${price}/Kg for ${selectedLot.crop} lot.`, 'success');
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  const totalProcuredTons = purchaseRequests
    .filter((r) => r.status === 'ACCEPTED' || r.status === 'COMPLETED')
    .reduce((acc, r) => acc + r.quantityKg, 0) / 1000;

  const filteredLots = lots.filter((lot) => {
    const matchSearch =
      lot.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.clusterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lot.variety && lot.variety.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchCat = true;
    if (selectedCategory === 'Grains') {
      matchCat = lot.crop.toLowerCase().includes('wheat') || lot.crop.toLowerCase().includes('paddy') || lot.crop.toLowerCase().includes('rice');
    } else if (selectedCategory === 'Fibers') {
      matchCat = lot.crop.toLowerCase().includes('cotton');
    } else if (selectedCategory === 'Oilseeds') {
      matchCat = lot.crop.toLowerCase().includes('mustard') || lot.crop.toLowerCase().includes('groundnut') || lot.crop.toLowerCase().includes('soybean');
    } else if (selectedCategory === 'Pulses & Spices') {
      matchCat = lot.crop.toLowerCase().includes('cumin') || lot.crop.toLowerCase().includes('jeera') || lot.crop.toLowerCase().includes('chana');
    }
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-800/40 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="min-w-0">
            <span className="text-amber-400 text-xs font-mono tracking-tight uppercase">
              {activeBuyerBusinessType || 'Institutional Buyer Procurement'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-white mt-1 break-words">
              {activeBuyerName} ({activeBuyerCompany})
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 break-words">
              Depot: <strong className="text-white">{activeBuyerDepot}</strong>
              {activeBuyerGstin ? <> • GSTIN: <span className="font-mono text-amber-300">{activeBuyerGstin}</span></> : null}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAggregatorModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>AI Virtual Cluster Aggregator</span>
            </button>
            <button
              onClick={() => setCurrentView('crop-report-card')}
              className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-500/40 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Verified Crop Report Cards</span>
            </button>
            <button
              onClick={() => setCurrentView('marketplace')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Browse Product Catalog</span>
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className="bg-amber-700/80 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-amber-500/40 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Edit Buyer Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Buyer Loyalty Rewards Card */}
      <LoyaltyCard
        account={loyaltyAccount}
        loading={loyaltyLoading}
        onViewRewards={() => setShowRewardsModal(true)}
        onPrimaryAction={() => setCurrentView('marketplace')}
        onSecondaryAction={() => setCurrentView('loyalty')}
        onRepeatOrder={() => handleRepeatOrder()}
        primaryActionLabel="Find Farmers"
        secondaryActionLabel="All Loyalty Perks"
        repeatActionLabel="Repeat Purchase"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Available Clustered Lots</div>
          <div className="text-3xl font-bold font-display text-stone-900">{lots.length}</div>
          <p className="text-[11px] text-emerald-700 font-medium">Quality Graded & Verified</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Active Purchase Proposals</div>
          <div className="text-3xl font-bold font-display text-amber-700">{purchaseRequests.length}</div>
          <p className="text-[11px] text-stone-500 font-medium">
            {purchaseRequests.filter((p) => p.status === 'PENDING').length} Awaiting Cluster Approval
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Procured Volume</div>
          <div className="text-3xl font-bold font-display text-emerald-700">
            {totalProcuredTons.toFixed(1)} <span className="text-base text-stone-500 font-normal">Tons</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">Direct Mandi Disintermediation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Traceability Index</div>
          <div className="text-3xl font-bold font-display text-stone-900">100%</div>
          <p className="text-[11px] text-teal-700 font-medium">Full Cluster Farmer Lineage</p>
        </div>
      </div>

      {/* 1. Personalized Priority Matching & Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Zap className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Priority Matching For You</h2>
              <p className="text-xs text-stone-500">Based on your {loyaltyAccount?.tier || 'SILVER'} Tier status & procurement history</p>
            </div>
          </div>
          {loyaltyAccount && (
            <div className="hidden sm:flex items-center gap-2 text-stone-500">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-tight">{loyaltyAccount.tier} STATUS ACTIVE</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(suggestedLots.length > 0 ? suggestedLots : lots.slice(0, 3)).map((lot) => (
            <div 
              key={`suggested-${lot.id}`}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-emerald-600/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                    {lot.qualityGrade}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
                    {(lot.quantityKg / 1000).toFixed(1)} Tons
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {lot.crop}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{lot.clusterName} • {lot.village}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-stone-400">Target Rate</span>
                  <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                    ₹{lot.minimumTargetPricePerKg}<span className="text-xs font-normal text-stone-500">/Kg</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLot(lot);
                    setOfferedPrice(lot.minimumTargetPricePerKg.toString());
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  <span>Select Lot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Lots Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span>Available Agricultural Products & Harvest Lots</span>
                </h3>
                <p className="text-xs text-stone-500">Quality assayed produce aggregated directly by Virtual Farm Clusters</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-semibold bg-stone-100 px-2.5 py-1 rounded-lg">Showing: {filteredLots.length} of {lots.length} Lots</span>
              </div>
            </div>

            {/* Search & Category Filter Controls */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products by crop, variety, cluster, or village..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['ALL', 'Grains', 'Fibers', 'Oilseeds', 'Pulses & Spices'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Products' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredLots.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  No products found matching "{searchTerm}". Try clearing search or choosing another category.
                </div>
              ) : (
                filteredLots.map((lot) => (
                <div
                  key={lot.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-all space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold tracking-tight ${
                          lot.qualityGrade === 'A+ Export' ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {lot.qualityGrade}
                        </span>
                        <span className="text-xs font-mono text-stone-500">
                          Moisture: {lot.moisturePercentage || 8.5}%
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-stone-900 mt-1">{lot.crop}</h4>
                      <p className="text-xs text-stone-600">
                        {lot.clusterName} • Lead: {lot.farmerName} ({lot.village})
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xl font-bold font-display text-emerald-700 block">
                        {(lot.quantityKg / 1000).toFixed(1)} Tons
                      </span>
                      <span className="text-xs text-stone-600">
                        Min. Target: <strong>₹{lot.minimumTargetPricePerKg}/Kg</strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 bg-white p-3 rounded-xl border border-stone-200/80">
                    {lot.notes || 'Aggregated cluster harvest lot with standard quality check.'}
                  </p>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-stone-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Expected Harvest: <strong>{lot.expectedHarvestDate}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedLot(lot);
                        setOfferedPrice(lot.minimumTargetPricePerKg.toString());
                      }}
                      className="bg-stone-900 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Submit Proposal
                    </button>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
        </div>

        {/* Right: Purchase Proposals Track */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900">Submitted Proposals</h3>
            <p className="text-xs text-stone-500">Track responses from Village Champions</p>

            <div className="space-y-3">
              {purchaseRequests.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No proposals submitted yet.</p>
              ) : (
                purchaseRequests.map((req) => (
                  <div key={req.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-stone-900">{req.crop}</h5>
                        <p className="text-[11px] text-stone-500">{req.clusterName}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                          req.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] pt-1 border-t border-stone-200 text-stone-600">
                      <span>{(req.quantityKg / 1000).toFixed(1)} Tons @ ₹{req.offeredPricePerKg}/Kg</span>
                      <span className="font-bold text-stone-900">₹{req.totalOfferedInr.toLocaleString()}</span>
                    </div>

                    {/* Loyalty Milestone Order Actions */}
                    <div className="pt-1.5 flex flex-wrap gap-1.5 justify-end">
                      {(req.status === 'ACCEPTED' || req.status === 'PENDING') && (
                        <button
                          onClick={() => handleConfirmDelivery(req)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Confirm Delivery (+50 Pts)
                        </button>
                      )}
                      {req.status === 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => setRatingOrder(req)}
                            className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                            <span>Rate Farmer (+20 Pts)</span>
                          </button>
                          <button
                            onClick={() => handleRepeatOrder(req.id)}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-lg text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3 text-stone-300" />
                            <span>Repeat Order</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Proposal Modal */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold font-display text-lg text-stone-900">Submit Purchase Proposal</h3>
                <p className="text-xs text-stone-500">{selectedLot.crop} • {(selectedLot.quantityKg / 1000).toFixed(1)} Tons</p>
              </div>
              <button
                onClick={() => setSelectedLot(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseRequest} className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Cluster:</span>
                  <span className="font-semibold text-stone-900">{selectedLot.clusterName}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Minimum Target:</span>
                  <span className="font-bold text-emerald-700">₹{selectedLot.minimumTargetPricePerKg}/Kg</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Your Offered Price (₹ per Kg):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-sm font-bold focus:ring-1 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Designated Delivery Depot:</label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                Total Estimated Contract Value: <strong>₹{((parseFloat(offeredPrice) || selectedLot.minimumTargetPricePerKg) * selectedLot.quantityKg).toLocaleString()}</strong>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLot(null)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Send Proposal to Cluster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rewards Redemption Modal */}
      <RewardRedemptionModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        account={loyaltyAccount}
        rewards={loyaltyRewards}
        redemptions={loyaltyRedemptions}
        onRewardRedeemed={(newRed, updatedAcc) => {
          setLoyaltyAccount(updatedAcc);
          setLoyaltyRedemptions((prev) => [newRed, ...prev]);
        }}
      />

      {/* Order Rating Modal */}
      <OrderRatingModal
        isOpen={!!ratingOrder}
        onClose={() => setRatingOrder(null)}
        order={ratingOrder}
        buyerId={effectiveBuyerId}
        buyerName={activeBuyerName}
        onRatingSuccess={(updatedAcc) => {
          setLoyaltyAccount(updatedAcc);
          addToast('Rating Recorded', 'Earned +20 Buyer Loyalty Points for genuine review!', 'success');
        }}
      />

      {/* AI Virtual Cluster Aggregator Modal */}
      <VirtualClusterAggregatorModal
        isOpen={showAggregatorModal}
        onClose={() => setShowAggregatorModal(false)}
        availableLots={lots}
      />
    </div>
  );
};
