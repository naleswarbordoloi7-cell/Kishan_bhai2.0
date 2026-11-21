import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  ShieldCheck,
  Coins,
  RefreshCw,
  ArrowRight,
  Award,
} from 'lucide-react';
import { AdminChampionVerifications } from '../components/admin/AdminChampionVerifications';
import { AdminLoyaltyManager } from '../components/admin/AdminLoyaltyManager';

export const AdminDashboard: React.FC = () => {
  const { setCurrentView } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'champion-verifications' | 'loyalty-rules'>('loyalty-rules');

  const loadData = () => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => { });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-stone-800 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                PLATFORM OPERATIONS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Platform Administration & Operations Hub
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm">
              Manage village champion approvals, cluster coordination, and farmer rewards.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-stone-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={() => setCurrentView('transactions')}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Audit Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Module Switcher */}
      <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveAdminTab('champion-verifications')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${activeAdminTab === 'champion-verifications'
              ? 'bg-green-700 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Village Champion KYC & Authorization Desk</span>
          <span className="bg-amber-300 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            Active Review
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${activeAdminTab === 'overview'
              ? 'bg-green-700 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Cluster Overview</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('loyalty-rules')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${activeAdminTab === 'loyalty-rules'
              ? 'bg-green-700 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
        >
          <Award className="w-4 h-4" />
          <span>Kishan Rewards Rules</span>
          <span className="bg-amber-300 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            Loyalty Engine
          </span>
        </button>
      </div>

      {activeAdminTab === 'loyalty-rules' ? (
        <AdminLoyaltyManager />
      ) : activeAdminTab === 'champion-verifications' ? (
        <AdminChampionVerifications />
      ) : (
        <>
          {/* KPI Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs text-stone-500 font-medium">Total Registered Users</div>
              <div className="text-3xl font-bold font-display text-stone-900">{stats?.totalUsers || 6}</div>
              <p className="text-[11px] text-stone-500">
                {stats?.farmers || 4} Farmers • {stats?.champions || 1} Champions • {stats?.buyers || 1} Buyers
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs text-stone-500 font-medium">Virtual Clusters Active</div>
              <div className="text-3xl font-bold font-display text-emerald-700">{stats?.totalClusters || 2}</div>
              <p className="text-[11px] text-emerald-800 font-medium">84.5 Clustered Acres</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs text-stone-500 font-medium">Cluster Procurements & Bids</div>
              <div className="text-3xl font-bold font-display text-emerald-700">
                ₹3.84 <span className="text-sm font-normal text-stone-500">Lakh</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">Verified Escrow Settlements</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs text-stone-500 font-medium">Cluster Coverage</div>
              <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5 pt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Active Across Regions
              </div>
              <p className="text-[11px] text-stone-500">Farmer, Champion & Buyer portals</p>
            </div>
          </div>

          {/* Clean Business Operations Summary */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-stone-900">Agricultural Network Operations</h3>
                <p className="text-xs text-stone-500">Cluster coordination, harvest pooling, and verified settlements</p>
              </div>
              <button
                onClick={() => setCurrentView('transactions')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">Farmer Advisory Coverage</span>
                <span className="font-bold text-stone-900 text-sm mt-1 block">Crop Health & Soil Care</span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">Supply Chain Pooling</span>
                <span className="font-bold text-emerald-700 text-sm mt-1 block">Active Harvest Contracts</span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">Buyer Settlements</span>
                <span className="font-bold text-stone-900 text-sm mt-1 block">Escrow Protected</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
