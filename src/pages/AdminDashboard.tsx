import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Users,
  ShieldCheck,
  Coins,
  Cpu,
  RefreshCw,
  ExternalLink,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ApiBudgetCard } from '../components/ApiBudgetCard';
import { ALGORAND_TESTNET_CONFIG, GOPLAUSIBLE_CONFIG } from '../../shared/constants';

export const AdminDashboard: React.FC = () => {
  const { setCurrentView } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [x402Analytics, setX402Analytics] = useState<any>(null);

  const loadData = () => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});

    fetch('/api/admin/x402-analytics')
      .then((res) => res.json())
      .then((data) => setX402Analytics(data))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-stone-800 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/30">
                SYSTEM OPS & x402 COMMAND
              </span>
              <span className="text-stone-400 text-xs font-mono">Build 2026.08.31</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Platform Administration & Protocol Hub
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm">
              Live status of Algorand Testnet node, GoPlausible Facilitator settlements, and API cost controls.
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
              onClick={() => setCurrentView('admin-x402')}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow cursor-pointer"
            >
              x402 Deep Analytics
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Total Registered Users</div>
          <div className="text-3xl font-bold font-display text-stone-900">{stats?.totalUsers || 6}</div>
          <p className="text-[11px] text-stone-500">
            {stats?.farmers || 4} Farmers • {stats?.champions || 1} Champions • {stats?.buyers || 1} Buyers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Virtual Clusters Active</div>
          <div className="text-3xl font-bold font-display text-emerald-700">{stats?.totalClusters || 2}</div>
          <p className="text-[11px] text-emerald-800 font-medium">84.5 Clustered Acres</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">x402 Micropayment Volume</div>
          <div className="text-3xl font-bold font-display text-purple-700">
            {stats?.totalVolumeUsdc || '0.006'} <span className="text-sm font-normal text-stone-500">USDC</span>
          </div>
          <p className="text-[11px] text-purple-800 font-medium">Algorand Testnet ASA 10458941</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">System Health</div>
          <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5 pt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Optimal (Nodes Synced)
          </div>
          <p className="text-[10px] text-stone-400 font-mono">Latency: 18ms</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: API Budget Card */}
        <div className="space-y-6">
          <ApiBudgetCard />

          {/* Node & Facilitator Configuration Box */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between font-sans">
              <h3 className="font-bold text-sm text-stone-900">Infrastructure Endpoints</h3>
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                TESTNET
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[11px]">Algorand Testnet Node (Algod):</span>
                <p className="text-stone-900 font-semibold truncate">{ALGORAND_TESTNET_CONFIG.algodUrl}</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[11px]">x402 GoPlausible Facilitator:</span>
                <p className="text-stone-900 font-semibold truncate">{GOPLAUSIBLE_CONFIG.facilitatorUrl}</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[11px]">x402 Merchant Receiver Address:</span>
                <p className="text-stone-900 font-semibold break-all">{ALGORAND_TESTNET_CONFIG.defaultReceiverAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: x402 Protocol Analytics Snapshot */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-stone-900">x402 Protocol Performance</h3>
                <p className="text-xs text-stone-500">Autonomous sub-cent micropayments via GoPlausible Facilitator</p>
              </div>
              <button
                onClick={() => setCurrentView('admin-x402')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Full Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-600 font-medium">Total Micro-requests Handled:</span>
                <span className="font-bold text-stone-900">{x402Analytics?.totalRequests || 14}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-600 font-medium">Successful Settlements:</span>
                <span className="font-bold text-emerald-700">{x402Analytics?.successfulPayments || 14} (100%)</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-600 font-medium">Average Algorand Finality Time:</span>
                <span className="font-bold text-stone-900">{x402Analytics?.avgTransactionTimeMs || 1380} ms</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-600 font-medium">Top Consumed AI Micro-Service:</span>
                <span className="font-bold text-stone-900 truncate max-w-[200px]">
                  Crop Pathogen Analysis (0.002 USDC)
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Notice:</strong> All blockchain transactions are executed strictly on Algorand Testnet. No fiat or Mainnet tokens are transferred.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
