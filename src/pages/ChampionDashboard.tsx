import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserCheck,
  ShoppingBag,
  Package,
  Tractor,
  TrendingUp,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  MapPin,
} from 'lucide-react';
import { VirtualCluster, BulkOrderRequirement, UserProfile, MachineryItem } from '../../shared/types';
import { MandiTicker } from '../components/MandiTicker';

export const ChampionDashboard: React.FC = () => {
  const { currentUser, setCurrentView, addToast } = useApp();
  const [clusters, setClusters] = useState<VirtualCluster[]>([]);
  const [farmers, setFarmers] = useState<UserProfile[]>([]);
  const [bulkOrders, setBulkOrders] = useState<BulkOrderRequirement[]>([]);
  const [machinery, setMachinery] = useState<MachineryItem[]>([]);
  const [showAddFarmerModal, setShowAddFarmerModal] = useState(false);

  // New farmer form state
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerPhone, setNewFarmerPhone] = useState('');
  const [newFarmerAcres, setNewFarmerAcres] = useState('3.5');
  const [newFarmerCrop, setNewFarmerCrop] = useState('Cotton');

  useEffect(() => {
    fetch('/api/clusters')
      .then((res) => res.json())
      .then((data) => {
        if (data.clusters) setClusters(data.clusters);
      })
      .catch(() => {});

    fetch('/api/auth/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setFarmers(data.users.filter((u: UserProfile) => u.role === 'FARMER'));
      })
      .catch(() => {});

    fetch('/api/bulk-buying')
      .then((res) => res.json())
      .then((data) => {
        if (data.requirements) setBulkOrders(data.requirements);
      })
      .catch(() => {});

    fetch('/api/machinery')
      .then((res) => res.json())
      .then((data) => {
        if (data.machinery) setMachinery(data.machinery);
      })
      .catch(() => {});
  }, []);

  const handleVerifyFarmer = (farmerId: string) => {
    setFarmers((prev) =>
      prev.map((f) => (f.id === farmerId ? { ...f, verified: true } : f))
    );
    addToast('Farmer Verified', 'Farmer KYC and land holding verified for cluster participation', 'success');
  };

  const handleCreateFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName.trim()) return;

    const newFarmer: UserProfile = {
      id: `usr_${Date.now()}`,
      email: `${newFarmerName.toLowerCase().replace(/\s+/g, '')}@kishanbhai.in`,
      fullName: newFarmerName,
      phone: newFarmerPhone || '+91 98000 12345',
      role: 'FARMER',
      village: currentUser?.village || 'Anandpur',
      state: 'Gujarat',
      verified: true,
      farmSizeAcres: parseFloat(newFarmerAcres) || 3.5,
      crops: [newFarmerCrop],
      createdAt: new Date().toISOString(),
    };

    setFarmers((prev) => [newFarmer, ...prev]);
    setShowAddFarmerModal(false);
    setNewFarmerName('');
    setNewFarmerPhone('');
    addToast('Farmer Onboarded', `${newFarmer.fullName} added to village roster.`, 'success');
  };

  const totalVillageAcres = clusters.reduce((acc, c) => acc + c.totalAcres, 0);
  const totalCollectiveKg = clusters.reduce((acc, c) => acc + c.collectiveHarvestKg, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Daily APMC Mandi Ticker */}
      <MandiTicker />

      {/* Header Banner */}
      <div className="bg-[#2D4F1E] text-white rounded-[32px] p-6 sm:p-8 shadow-xl border border-white/20 space-y-3 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <span className="bg-white/15 text-emerald-200 text-xs px-3 py-1 rounded-full font-mono border border-white/20 backdrop-blur-xs">
              VILLAGE CHAMPION HUB • {currentUser?.village || 'Unassigned Village'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-white mt-2">
              Command Hub: {currentUser?.fullName || 'Village Champion'}
            </h1>
            <p className="text-stone-200 text-xs sm:text-sm mt-1">
              Coordinating smallholder acreage, aggregating input demands, and certifying harvest lots.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddFarmerModal(true)}
              className="bg-white hover:bg-emerald-50 text-[#2D4F1E] text-xs font-semibold px-4 py-2.5 rounded-2xl shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Farmer</span>
            </button>
            <button
              onClick={() => setCurrentView('clusters')}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl border border-white/20 transition-all backdrop-blur-xs active:scale-[0.99]"
            >
              Manage Clusters
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-lg p-5 rounded-[24px] border border-white/80 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Coordinated Farmers</div>
          <div className="text-3xl font-bold font-display text-stone-900">{farmers.length}</div>
          <p className="text-[11px] text-[#2D4F1E] font-medium">{farmers.filter((f) => f.verified).length} Verified</p>
        </div>

        <div className="bg-white/60 backdrop-blur-lg p-5 rounded-[24px] border border-white/80 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Active Village Clusters</div>
          <div className="text-3xl font-bold font-display text-stone-900">{clusters.length}</div>
          <p className="text-[11px] text-stone-500 font-medium">{totalVillageAcres.toFixed(1)} Total Acres</p>
        </div>

        <div className="bg-white/60 backdrop-blur-lg p-5 rounded-[24px] border border-white/80 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Collective Harvest Pool</div>
          <div className="text-3xl font-bold font-display text-[#2D4F1E]">
            {(totalCollectiveKg / 1000).toFixed(1)} <span className="text-base text-stone-500 font-normal">Tons</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">Ready for Institutional Buyers</p>
        </div>

        <div className="bg-white/60 backdrop-blur-lg p-5 rounded-[24px] border border-white/80 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Pending Bulk Demands</div>
          <div className="text-3xl font-bold font-display text-amber-700">{bulkOrders.length}</div>
          <p className="text-[11px] text-amber-800 font-medium">Avg. 22.5% Wholesale Margin</p>
        </div>
      </div>

      {/* 2-Column Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Farmers Roster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-stone-900">Village Farmer Roster</h3>
                <p className="text-xs text-stone-500">Verified land holdings & digital participation status</p>
              </div>
              <button
                onClick={() => setShowAddFarmerModal(true)}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Farmer</span>
              </button>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
              {farmers.map((farmer) => (
                <div key={farmer.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{farmer.fullName}</span>
                      {farmer.verified ? (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending KYC
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Holding: <strong>{farmer.farmSizeAcres || 3.5} Acres</strong></span>
                      <span>•</span>
                      <span>Crops: <strong>{farmer.crops?.join(', ') || 'Wheat'}</strong></span>
                      <span>•</span>
                      <span>{farmer.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!farmer.verified && (
                      <button
                        onClick={() => handleVerifyFarmer(farmer.id)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Verify Land
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentView('clusters')}
                      className="text-xs text-stone-600 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg font-medium"
                    >
                      Assign Cluster
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Bulk Procurement Orders in Village */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-stone-900">Cluster Input Requirements</h3>
                <p className="text-xs text-stone-500">Coordinate and submit final purchase orders to manufacturers</p>
              </div>
              <button
                onClick={() => setCurrentView('bulk-buying')}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Open Bulk Module
              </button>
            </div>

            <div className="space-y-3">
              {bulkOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded">
                        {order.clusterName}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 mt-1">{order.itemName}</h4>
                      <p className="text-xs text-stone-500">
                        {order.farmerPledges.length} Farmers Pledged • Deadline: {order.deadlineDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        ₹{order.negotiatedBulkPrice} / {order.unit}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-semibold block">
                        {order.savingsPercentage}% Bulk Savings
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>{order.currentQuantity} of {order.targetQuantity} {order.unit}</span>
                      <span>{Math.round((order.currentQuantity / order.targetQuantity) * 100)}% Fulfilled</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (order.currentQuantity / order.targetQuantity) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Machinery & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tractor className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-sm text-stone-900">Machinery Logistics</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Prototype
              </span>
            </div>

            <p className="text-xs text-stone-600">
              Review upcoming bookings and dispatch shared tractors, drone sprayers, and harvesters.
            </p>

            <div className="space-y-3">
              {machinery.map((mach) => (
                <div key={mach.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-900">{mach.name}</span>
                    <span className="font-mono text-stone-700">₹{mach.hourlyRateInr}/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-stone-500">
                    <span>{mach.hpOrCapacity}</span>
                    <span className="text-emerald-700 font-semibold">{mach.available ? '● Available' : '● Booked'}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentView('machinery')}
              className="w-full text-center text-xs font-semibold text-teal-700 hover:underline py-1"
            >
              Open Machinery Management →
            </button>
          </div>
        </div>
      </div>

      {/* Onboard Farmer Modal */}
      {showAddFarmerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold font-display text-lg text-stone-900">Onboard New Smallholder</h3>
              <button
                onClick={() => setShowAddFarmerModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFarmer} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Farmer Full Name:</label>
                <input
                  type="text"
                  required
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder="e.g. Ramesh Bhai Patel"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Phone Number:</label>
                <input
                  type="text"
                  value={newFarmerPhone}
                  onChange={(e) => setNewFarmerPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Farm Land (Acres):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFarmerAcres}
                    onChange={(e) => setNewFarmerAcres(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Primary Crop:</label>
                  <input
                    type="text"
                    value={newFarmerCrop}
                    onChange={(e) => setNewFarmerCrop(e.target.value)}
                    placeholder="Cotton / Wheat"
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFarmerModal(false)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Register & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
