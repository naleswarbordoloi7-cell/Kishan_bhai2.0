import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Store,
  Package,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  X,
  Send,
} from 'lucide-react';
import { HarvestPoolLot } from '../../shared/types';

export const BuyerMarketplacePage: React.FC = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const { addToast, setCurrentView } = useApp();
  const [lots, setLots] = useState<HarvestPoolLot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  // Proposal Modal State
  const [selectedLot, setSelectedLot] = useState<HarvestPoolLot | null>(null);
  const [offeredPrice, setOfferedPrice] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Ahmedabad Processing Depot');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/marketplace')
      .then((res) => res.json())
      .then((data) => {
        if (data.lots) setLots(data.lots);
      })
      .catch(() => {});
  }, []);

  const crops = [
    'ALL',
    'Wheat',
    'Cotton',
    'Mustard',
    'Groundnut',
    'Soybean',
    'Cumin',
    'Basmati',
    'Chickpea',
  ];

  const filteredLots = lots.filter((lot) => {
    const matchSearch =
      lot.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.clusterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lot.variety && lot.variety.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCrop =
      selectedCrop === 'ALL' ||
      lot.crop.toLowerCase().includes(selectedCrop.toLowerCase());

    const matchGrade =
      selectedGrade === 'ALL' ||
      lot.qualityGrade.toLowerCase().includes(selectedGrade.toLowerCase());

    return matchSearch && matchCrop && matchGrade;
  });

  const handleOpenProposal = (lot: HarvestPoolLot) => {
    setSelectedLot(lot);
    setOfferedPrice(lot.minimumTargetPricePerKg.toString());
  };

  const handleCreatePurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    setIsSubmitting(true);
    try {
      const price = parseFloat(offeredPrice) || selectedLot.minimumTargetPricePerKg;
      const res = await fetch('/api/marketplace/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          harvestLotId: selectedLot.id,
          buyerId: currentUser?.id || 'usr_buyer_1',
          buyerName: currentUser?.fullName || 'Vikram Mehta',
          buyerCompany: 'AgroPure Organics & Textiles',
          offeredPricePerKg: price,
          deliveryLocation,
        }),
      });

      if (res.ok) {
        addToast(
          'Purchase Proposal Transmitted',
          `Offered ₹${price}/Kg for ${selectedLot.crop} (${(selectedLot.quantityKg / 1000).toFixed(1)} Tons).`,
          'success'
        );
        setSelectedLot(null);
        setOfferedPrice('');
      } else {
        throw new Error('Could not submit proposal');
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to submit proposal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 space-y-3 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xs font-mono tracking-tight uppercase">
                Produce Procurement Catalog
              </span>
              <span aria-hidden="true" className="text-stone-700">·</span>
              <span className="text-xs text-stone-300 font-medium">
                {lots.length} Standardized Smallholder Lots Listed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
              Available Farm-Gate Agricultural Produce
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl mt-1">
              Direct institutional procurement of lab quality-assayed harvest lots directly from smallholder clusters with 100% origin traceability and digital escrow settlement.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('buyer-dashboard')}
            className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <span>Track My Proposals & Orders</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by crop, variety, cluster name, or village..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-stone-500">Grade:</span>
            {['ALL', 'A+ Export', 'Grade A Premium'].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedGrade === grade
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Crop Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-semibold text-[11px] shrink-0 mr-1">Products:</span>
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                selectedCrop === crop
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {crop === 'ALL' ? 'All Crops' : crop}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      {filteredLots.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-lg text-stone-900">No Matching Produce Lots Found</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              There are currently no active pooled harvest lots matching your filter criteria. Try clearing search or selecting "All Crops".
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCrop('ALL');
              setSelectedGrade('ALL');
            }}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-600/40 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-bold tracking-tight ${
                        lot.qualityGrade === 'A+ Export'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {lot.qualityGrade}
                    </span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-[10px] font-mono text-stone-500">
                      Moisture: {lot.moisturePercentage || 8.5}%
                    </span>
                  </div>

                  <span className="text-[11px] text-stone-500 font-medium">
                    {lot.village}
                  </span>
                </div>

                {/* Product Name & Cluster */}
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900 group-hover:text-amber-800 transition-colors">
                    {lot.crop}
                  </h3>
                  {lot.variety && (
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                      {lot.variety}
                    </p>
                  )}
                  <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="truncate">{lot.clusterName}</span>
                  </p>
                </div>

                {/* Specs Box */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Available Volume:</span>
                    <span className="font-bold text-stone-900">
                      {(lot.quantityKg / 1000).toFixed(1)} Metric Tons
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Target Base Price:</span>
                    <span className="font-black text-emerald-700">
                      ₹{lot.minimumTargetPricePerKg} / Kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Est. Harvest / Dispatch:</span>
                    <span className="font-semibold text-stone-800">
                      {lot.expectedHarvestDate}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <p className="text-xs text-stone-600 line-clamp-2 bg-stone-50/50 p-2.5 rounded-xl border border-stone-100">
                  {lot.notes || 'Lab assayed standard smallholder cluster lot.'}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex justify-between items-center">
                <span className="text-[11px] text-stone-400 font-mono">
                  Lot #{lot.id.slice(-4)}
                </span>
                <button
                  onClick={() => handleOpenProposal(lot)}
                  className="bg-stone-900 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Submit Purchase Proposal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Proposal Modal */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold font-display text-lg text-stone-900">
                  Submit Purchase Proposal
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedLot.crop} • {(selectedLot.quantityKg / 1000).toFixed(1)} Tons
                </p>
              </div>
              <button
                onClick={() => setSelectedLot(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseRequest} className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Cluster Producer:</span>
                  <span className="font-semibold text-stone-900">{selectedLot.clusterName}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Quality Grade:</span>
                  <span className="font-bold text-amber-800">{selectedLot.qualityGrade}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Target Base Price:</span>
                  <span className="font-bold text-emerald-700">₹{selectedLot.minimumTargetPricePerKg}/Kg</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Your Offered Price (₹ per Kg):
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Designated Delivery Depot / Mill:
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex justify-between items-center">
                <span>Estimated Contract Value:</span>
                <span className="font-black text-sm">
                  ₹{((parseFloat(offeredPrice) || selectedLot.minimumTargetPricePerKg) * selectedLot.quantityKg).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLot(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Proposal to Cluster</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
