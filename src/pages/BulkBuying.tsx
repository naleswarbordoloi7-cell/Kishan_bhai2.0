import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  TrendingDown,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Calculator,
} from 'lucide-react';
import { BulkOrderRequirement } from '../../shared/types';

export const BulkBuyingPage: React.FC = () => {
  const { currentUser, userRole, addToast } = useApp();
  const [requirements, setRequirements] = useState<BulkOrderRequirement[]>([]);
  const [selectedReq, setSelectedReq] = useState<BulkOrderRequirement | null>(null);
  const [pledgeQty, setPledgeQty] = useState('15');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New demand form
  const [category, setCategory] = useState<'Fertilizer' | 'Seeds' | 'Pesticide' | 'Bio-Nutrients'>('Fertilizer');
  const [itemName, setItemName] = useState('');
  const [targetQty, setTargetQty] = useState('150');
  const [unit, setUnit] = useState<'Bags (50kg)' | 'Quintals' | 'Kilograms' | 'Litres'>('Bags (50kg)');
  const [retailPrice, setRetailPrice] = useState('1400');
  const [bulkPrice, setBulkPrice] = useState('1080');

  const fetchRequirements = () => {
    fetch('/api/bulk-buying')
      .then((res) => res.json())
      .then((data) => {
        if (data.requirements) setRequirements(data.requirements);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handlePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      const qty = parseInt(pledgeQty) || 10;
      const res = await fetch('/api/bulk-buying/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId: selectedReq.id,
          farmerId: currentUser?.id || 'usr_farmer_1',
          farmerName: currentUser?.fullName || 'Ramesh Patel',
          quantity: qty,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequirements((prev) => prev.map((r) => (r.id === data.requirement.id ? data.requirement : r)));
        setSelectedReq(null);
        addToast('Pledge Recorded', `Pledged ${qty} ${selectedReq.unit} of ${selectedReq.itemName}.`, 'success');
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    try {
      const res = await fetch('/api/bulk-buying/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          itemName,
          targetQuantity: parseInt(targetQty) || 100,
          unit,
          standardRetailPrice: parseFloat(retailPrice) || 1400,
          negotiatedBulkPrice: parseFloat(bulkPrice) || 1080,
          deadlineDate: '2026-09-25',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequirements((prev) => [data.requirement, ...prev]);
        setShowCreateModal(false);
        setItemName('');
        addToast('Demand Created', `Bulk requirement for "${data.requirement.itemName}" opened for pledges.`, 'success');
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-800/40 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/30">
              COLLECTIVE PURCHASING POWER
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Bulk Buying Demands
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl">
              Pool fertilizer, certified seed, and bio-input demands across Virtual Clusters to negotiate 20–30% manufacturer wholesale discounts.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Bulk Demand</span>
          </button>
        </div>
      </div>

      {/* Grid of Bulk Demands */}
      {requirements.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-lg rounded-[28px] p-8 border border-white/80 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-[#2D4F1E] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-stone-900">No Bulk Input Demands Open</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Initiate a bulk order for NPK fertilizer, certified seeds, or bio-inputs to start aggregating smallholder purchase pledges.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#2D4F1E] hover:bg-[#223d16] text-white text-xs font-semibold px-5 py-2.5 rounded-2xl shadow transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.99] border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Bulk Demand</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requirements.map((item) => {
          const percent = Math.min(100, Math.round((item.currentQuantity / item.targetQuantity) * 100));
          const hasPledged = item.farmerPledges.some((p) => p.farmerId === currentUser?.id);

          return (
            <div key={item.id} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-xs text-stone-500">{item.clusterName}</span>
                  </div>
                  <h3 className="font-bold text-base text-stone-900 mt-1.5">{item.itemName}</h3>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  {item.savingsPercentage}% Cheaper
                </span>
              </div>

              {/* Price comparison */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
                <div>
                  <span className="text-stone-400 text-[10px] block">Standard Retail Rate</span>
                  <span className="font-bold text-stone-500 line-through text-sm">₹{item.standardRetailPrice}</span>
                  <span className="text-[10px] text-stone-400"> / {item.unit}</span>
                </div>
                <div>
                  <span className="text-emerald-700 text-[10px] block font-semibold">Cluster Bulk Price</span>
                  <span className="font-bold text-emerald-700 text-base">₹{item.negotiatedBulkPrice}</span>
                  <span className="text-[10px] text-emerald-700"> / {item.unit}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>
                    Aggregate Pledged: <strong>{item.currentQuantity}</strong> / {item.targetQuantity} {item.unit}
                  </span>
                  <span className="font-bold text-stone-900">{percent}% Fulfilled</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-emerald-600' : 'bg-teal-600'}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>

              {/* Farmer pledges strip */}
              <div className="flex justify-between items-center text-xs text-stone-500 pt-1">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>{item.farmerPledges.length} Farmers in Group</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Deadline: {item.deadlineDate}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-stone-100">
                {hasPledged ? (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Pledged by you
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400">Pledge to secure group rate</span>
                )}

                <button
                  onClick={() => setSelectedReq(item)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Pledge Your Quantity
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Pledge Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold font-display text-lg text-stone-900">Pledge Quantity</h3>
                <p className="text-xs text-stone-500">{selectedReq.itemName}</p>
              </div>
              <button onClick={() => setSelectedReq(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handlePledge} className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>Wholesale Negotiated Price:</span>
                  <span className="font-bold text-emerald-700">₹{selectedReq.negotiatedBulkPrice} / {selectedReq.unit}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Standard Retail:</span>
                  <span className="line-through text-stone-400">₹{selectedReq.standardRetailPrice}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Savings Per {selectedReq.unit}:</span>
                  <span className="font-semibold text-emerald-700">
                    ₹{selectedReq.standardRetailPrice - selectedReq.negotiatedBulkPrice} ({selectedReq.savingsPercentage}%)
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  How many {selectedReq.unit} do you need for your farm?
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={pledgeQty}
                  onChange={(e) => setPledgeQty(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-sm font-bold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
                <div className="flex justify-between font-bold">
                  <span>Your Total Estimated Cost:</span>
                  <span>₹{((parseInt(pledgeQty) || 0) * selectedReq.negotiatedBulkPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 mt-1">
                  <span>Estimated Total Savings:</span>
                  <span>₹{((parseInt(pledgeQty) || 0) * (selectedReq.standardRetailPrice - selectedReq.negotiatedBulkPrice)).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Confirm Group Pledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Requirement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold font-display text-lg text-stone-900">Open New Bulk Demand</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                >
                  <option value="Fertilizer">Fertilizer (NPK, Urea, Potash)</option>
                  <option value="Seeds">Certified Seeds (Wheat, Cotton, Mustard)</option>
                  <option value="Bio-Nutrients">Bio-Nutrients & Organic Compost</option>
                  <option value="Pesticide">Neem & Bio-Pesticides</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Item Specifics & Brand:</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. IFFCO Water Soluble NPK 19-19-19"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Target Quantity:</label>
                  <input
                    type="number"
                    value={targetQty}
                    onChange={(e) => setTargetQty(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Unit:</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                  >
                    <option value="Bags (50kg)">Bags (50kg)</option>
                    <option value="Quintals">Quintals</option>
                    <option value="Kilograms">Kilograms</option>
                    <option value="Litres">Litres</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Retail Price (₹):</label>
                  <input
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Negotiated Bulk (₹):</label>
                  <input
                    type="number"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Publish Demand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
