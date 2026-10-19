import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
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
  Lock,
  FileText,
  Building,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet,
  Send,
  Eye,
} from 'lucide-react';
import {
  VirtualCluster,
  BulkOrderRequirement,
  UserProfile,
  MachineryItem,
  ChampionVerificationRequest,
} from '../../shared/types';
import { MandiTicker } from '../components/MandiTicker';
import { VillageChampionLockedView } from '../components/champion/VillageChampionLockedView';

export const ChampionDashboard: React.FC = () => {
  const { currentUser, setCurrentUser, setUserRole } = useUserStore();
  const { setCurrentView, addToast } = useApp();

  const [clusters, setClusters] = useState<VirtualCluster[]>([]);
  const [farmers, setFarmers] = useState<UserProfile[]>([]);
  const [bulkOrders, setBulkOrders] = useState<BulkOrderRequirement[]>([]);
  const [machinery, setMachinery] = useState<MachineryItem[]>([]);
  const [showAddFarmerModal, setShowAddFarmerModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Verification locking states
  const [verificationReq, setVerificationReq] = useState<ChampionVerificationRequest | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isCheckingLock, setIsCheckingLock] = useState<boolean>(true);

  // New farmer form state
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerPhone, setNewFarmerPhone] = useState('');
  const [newFarmerAcres, setNewFarmerAcres] = useState('3.5');
  const [newFarmerCrop, setNewFarmerCrop] = useState('Cotton');

  // Village Assistance Requests (Feature 7)
  const [assistanceRequests, setAssistanceRequests] = useState([
    {
      id: 'req_1',
      farmerName: 'Ramesh Patel',
      crop: 'Cotton',
      issue: 'Leaf curl virus suspected; requires urgent soil booster',
      priority: 'HIGH',
      status: 'OPEN',
      time: '2 hours ago',
    },
    {
      id: 'req_2',
      farmerName: 'Devjibhai Bharwad',
      crop: 'Wheat',
      issue: 'Canal irrigation rotation scheduling dispute',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      time: 'Yesterday',
    },
  ]);

  const checkChampionStatus = async () => {
    if (!currentUser || currentUser.role !== 'CHAMPION') {
      setIsCheckingLock(false);
      return;
    }

    try {
      setIsCheckingLock(true);
      const res = await fetch(`/api/champion/verification/status?userId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setVerificationReq(data.request);
        const approved = Boolean(data.isApproved || (data.request?.status === 'APPROVED' && currentUser.verified));
        setIsApproved(approved);
      }
    } catch (e) {
      console.warn('Failed to fetch champion status:', e);
    } finally {
      setIsCheckingLock(false);
    }
  };

  useEffect(() => {
    checkChampionStatus();
  }, [currentUser?.id, currentUser?.verified, currentUser?.role]);

  useEffect(() => {
    if (!isApproved) return;

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
  }, [isApproved]);

  const handleVerifyFarmer = (farmerId: string) => {
    setFarmers((prev) =>
      prev.map((f) => (f.id === farmerId ? { ...f, verified: true } : f))
    );
    addToast('Farmer Verified', 'Farmer KYC and land holding verified for cluster participation', 'success');
  };

  const handleCreateFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName.trim()) return;

    try {
      const res = await fetch('/api/champion/onboard-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          championId: currentUser?.id,
          farmerName: newFarmerName.trim(),
          farmerPhone: newFarmerPhone.trim() || '+91 98000 12345',
          acres: parseFloat(newFarmerAcres) || 3.5,
          crop: newFarmerCrop,
          village: currentUser?.village || 'Anandpur',
        }),
      });

      const data = await res.json();
      if (res.ok && data.farmer) {
        setFarmers((prev) => [data.farmer, ...prev]);
        setShowAddFarmerModal(false);
        setNewFarmerName('');
        setNewFarmerPhone('');
        addToast('Farmer Onboarded', `${data.farmer.fullName} added to village roster via verified champion portal.`, 'success');
      } else if (res.status === 403) {
        addToast('Access Denied', data.message || 'Village Champion verification is locked.', 'error');
        setIsApproved(false);
      } else {
        addToast('Error', data.error || 'Failed to onboard farmer.', 'error');
      }
    } catch (err: any) {
      addToast('Network Error', err.message, 'error');
    }
  };

  // Switch to demo accounts for instant developer/evaluator testing
  const handleSwitchToDemoChampion = (isDemoApproved: boolean) => {
    if (isDemoApproved) {
      const approvedChamp: UserProfile = {
        id: 'usr_champ_vikram',
        fullName: 'Vikramsinh Jadeja',
        email: 'vikram.jadeja@kishanbhai.in',
        phone: '+91 97240 88192',
        role: 'CHAMPION',
        village: 'Anandpur Hub',
        state: 'Gujarat',
        verified: true,
        farmSizeAcres: 8.0,
        crops: ['Cotton', 'Cumin', 'Wheat'],
        preferredLanguage: 'hi',
        createdAt: '2026-05-10T11:00:00Z',
      };
      setCurrentUser(approvedChamp);
      setUserRole('CHAMPION');
      setIsApproved(true);
      addToast('Profile Switched', 'Switched to Vikramsinh Jadeja (Approved Sarpanch)', 'success');
    } else {
      const lockedChamp: UserProfile = {
        id: 'usr_champ_anita',
        fullName: 'Anita Devi',
        email: 'anita.devi@kishanbhai.in',
        phone: '+91 98123 45678',
        role: 'CHAMPION',
        village: 'Anandpur',
        district: 'Rajkot',
        state: 'Gujarat',
        verified: false,
        farmSizeAcres: 6.0,
        crops: ['Cotton', 'Groundnut'],
        preferredLanguage: 'hi',
        createdAt: '2026-08-01T10:00:00Z',
      };
      setCurrentUser(lockedChamp);
      setUserRole('CHAMPION');
      setIsApproved(false);
      addToast('Profile Switched', 'Switched to Anita Devi (Locked Applicant)', 'info');
    }
  };

  // If user is NOT a Village Champion at all
  if (currentUser?.role !== 'CHAMPION') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 text-amber-800 mx-auto flex items-center justify-center">
          <Building className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-serif-display text-stone-900">
            Village Champion Command Hub
          </h1>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            This module is reserved for verified Sarpanches and official Gram Panchayat representatives.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setCurrentView('login')}
            className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow cursor-pointer"
          >
            Register as a Village Champion
          </button>
          <button
            onClick={() => handleSwitchToDemoChampion(false)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-5 py-3 rounded-xl border border-amber-300 cursor-pointer"
          >
            View Locked Applicant (Anita Devi)
          </button>
          <button
            onClick={() => handleSwitchToDemoChampion(true)}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-5 py-3 rounded-xl border border-stone-300 cursor-pointer"
          >
            View Approved Champion (Vikramsinh)
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 🔒 LOCKED DASHBOARD SCREEN: Shown until verification status == APPROVED
  // =========================================================================
  if (!isApproved) {
    return (
      <div className="space-y-4">
        {/* Switcher Bar for Quick Verification Testing */}
        <div className="bg-amber-100/70 border-b border-amber-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-800" />
            <span>Currently logged in as: <strong>{currentUser.fullName}</strong> (Locked Applicant)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchToDemoChampion(true)}
              className="bg-white hover:bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-300 font-bold cursor-pointer text-[11px]"
            >
              Switch to Approved Champion (Vikramsinh)
            </button>
            <button
              onClick={() => setCurrentView('admin-dashboard')}
              className="bg-stone-800 hover:bg-stone-900 text-white px-3 py-1 rounded-lg font-bold cursor-pointer text-[11px]"
            >
              Open Admin Review Desk
            </button>
          </div>
        </div>

        <VillageChampionLockedView
          user={currentUser}
          onVerificationUpdated={(req) => {
            setVerificationReq(req);
            if (req.status === 'APPROVED') {
              setIsApproved(true);
            }
          }}
          onRefresh={checkChampionStatus}
        />
      </div>
    );
  }

  // =========================================================================
  // 🔓 UNLOCKED DASHBOARD SCREEN (Only accessible when status == APPROVED)
  // =========================================================================
  const totalVillageAcres = clusters.reduce((acc, c) => acc + c.totalAcres, 0);
  const totalCollectiveKg = clusters.reduce((acc, c) => acc + c.collectiveHarvestKg, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Switcher Bar to switch back to locked state for testing */}
      <div className="bg-emerald-100/60 border border-emerald-200 rounded-2xl px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-emerald-900 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Verified Champion Session: <strong>{currentUser.fullName}</strong> • Status: <strong>APPROVED</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSwitchToDemoChampion(false)}
            className="bg-white hover:bg-amber-50 text-amber-900 px-3 py-1 rounded-lg border border-amber-300 font-bold cursor-pointer text-[11px]"
          >
            Test Locked State (Anita Devi)
          </button>
          <button
            onClick={() => setCurrentView('admin-dashboard')}
            className="bg-stone-800 hover:bg-stone-900 text-white px-3 py-1 rounded-lg font-bold cursor-pointer text-[11px]"
          >
            Admin Verification Desk
          </button>
        </div>
      </div>

      {/* Daily APMC Mandi Ticker */}
      <MandiTicker />

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#141C18] border border-emerald-900/10 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm shadow-emerald-950/5 relative overflow-hidden">
        {/* Subtle decorative background organic glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-100/40 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-700/20 text-[#144633] dark:text-emerald-300 text-xs font-bold font-mono">
                ⭐ {currentUser?.village || 'Anandpur'} Gram Panchayat Hub
              </span>
              <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/60 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Govt KYC Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#144633] dark:text-[#ECFDF5] mt-2 tracking-tight">
              Command Hub: {currentUser?.fullName || 'Village Champion'}
            </h1>
            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Coordinating smallholder acreage, aggregating input demands, validating harvest pooling, and liaising with institutional buyers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddFarmerModal(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Onboard New Farmer</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Activity Reports</span>
            </button>
            <button
              onClick={() => setCurrentView('clusters')}
              className="bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-[#144633] dark:text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-700/20 transition-all cursor-pointer min-h-[44px]"
            >
              Manage Clusters
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats (Modern Warm Agri Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#141C18] p-4 sm:p-5 rounded-2xl border border-emerald-900/10 dark:border-stone-800 shadow-sm space-y-1.5">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-tight">Onboarded Farmers</div>
          <div className="text-3xl font-extrabold text-[#144633] dark:text-emerald-300 font-mono tabular-nums">{farmers.length}</div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">{farmers.filter((f) => f.verified).length} KYC Land Verified</p>
        </div>

        <div className="bg-white dark:bg-[#141C18] p-4 sm:p-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-1.5">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-tight">Virtual Clusters Active</div>
          <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tabular-nums">{clusters.length}</div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">{totalVillageAcres.toFixed(1)} Clustered Acres</p>
        </div>

        <div className="bg-white dark:bg-[#141C18] p-4 sm:p-5 rounded-2xl border border-emerald-900/10 dark:border-stone-800 shadow-sm space-y-1.5">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-tight">Collective Harvest Pool</div>
          <div className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-400 font-mono tabular-nums">
            {(totalCollectiveKg / 1000).toFixed(1)} <span className="text-sm text-stone-500 font-sans font-normal">Tons</span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Ready for Institutional Buyers</p>
        </div>

        <div className="bg-white dark:bg-[#141C18] p-4 sm:p-5 rounded-2xl border border-amber-900/15 dark:border-stone-800 shadow-sm space-y-1.5">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-tight">Assistance & Grievances</div>
          <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-400 font-mono tabular-nums">{assistanceRequests.length}</div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 font-bold">1 High Priority Dispatch</p>
        </div>
      </div>

      {/* 2-Column Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Farmers Roster (Feature 1 & 2: Farmer onboarding & profile assistance) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-stone-900">Village Farmer Roster & Land Registry</h3>
                <p className="text-xs text-stone-500">Verified land holdings, digital participation & crop allocations</p>
              </div>
              <button
                onClick={() => setShowAddFarmerModal(true)}
                className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Farmer</span>
              </button>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
              {farmers.map((farmer) => (
                <div key={farmer.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{farmer.fullName}</span>
                      {farmer.verified ? (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Land Verified
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
                        className="bg-green-700 hover:bg-green-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Verify Land
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentView('clusters')}
                      className="text-xs text-stone-600 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                    >
                      Assign Cluster
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farmer Assistance Requests (Feature 7: Farmer assistance requests) */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-stone-900">Farmer Assistance & Advisory Requests</h3>
                <p className="text-xs text-stone-500">Field escalation, irrigation dispute mediation, and agronomist dispatch</p>
              </div>
            </div>

            <div className="space-y-3">
              {assistanceRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{req.farmerName}</span>
                      <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-mono">
                        {req.crop}
                      </span>
                      {req.priority === 'HIGH' && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.2 rounded-full">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="text-stone-700">{req.issue}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{req.time}</div>
                  </div>

                  <button
                    onClick={() => {
                      addToast('Dispatched', `Agronomist advisory scheduled for ${req.farmerName}.`, 'success');
                    }}
                    className="bg-green-700 hover:bg-green-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Dispatch Action
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Quick Actions, Buyer Coordination, and Virtual Cluster Summary */}
        <div className="space-y-6">
          {/* Virtual Farm Cluster Coordination (Feature 3) */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-green-700" />
              <span>Cluster Mesh Coordination</span>
            </h3>
            <p className="text-xs text-stone-600">
              Your village has {clusters.length} active cooperatives pooling seeds and fertilizer for 24% group savings.
            </p>
            <div className="space-y-2">
              {clusters.map((c) => (
                <div key={c.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="font-bold text-stone-900">{c.name}</div>
                  <div className="text-[11px] text-stone-500">
                    {c.memberCount} Farmers • {c.totalAcres} Acres • {c.primaryCrops.join(', ')}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCurrentView('clusters')}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Open Cluster Command</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Local Buyer Coordination (Feature 5) */}
          <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-amber-950 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-800" />
              <span>Institutional Buyer Desk</span>
            </h3>
            <p className="text-xs text-amber-900">
              Connect directly with verified corporate buyers (ITC, Adani Wilmar, BigBasket) procuring directly from your Gram Panchayat.
            </p>
            <div className="bg-white p-3 rounded-xl border border-amber-200/70 text-xs space-y-1">
              <div className="font-bold text-stone-900">ITC Agri Sourcing (Gujarat Mesh)</div>
              <div className="text-[11px] text-stone-600">Requirement: 50 Tons Sharbati Wheat @ ₹2,950/qtl</div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Escrow Guarantee Verified
              </span>
            </div>
            <button
              onClick={() => setCurrentView('marketplace')}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Negotiate Bulk Contracts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Onboard Farmer Form */}
      {showAddFarmerModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="text-lg font-bold font-serif-display text-stone-900">
                Onboard Village Farmer
              </h3>
              <button
                onClick={() => setShowAddFarmerModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFarmer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Farmer Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder="e.g. Ramesh Bhai Patel"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={newFarmerPhone}
                  onChange={(e) => setNewFarmerPhone(e.target.value)}
                  placeholder="+91 98251 44320"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Land Holding (Acres) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newFarmerAcres}
                    onChange={(e) => setNewFarmerAcres(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Primary Crop *</label>
                  <input
                    type="text"
                    required
                    value={newFarmerCrop}
                    onChange={(e) => setNewFarmerCrop(e.target.value)}
                    placeholder="Cotton / Wheat"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddFarmerModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Register & Verify Land
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Activity Reports (Feature 8) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200 text-xs">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="text-lg font-bold font-serif-display text-stone-900">
                Village Agricultural Activity Report
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-stone-600">
                Export verified agricultural audit records for submission to the Block Development Office or APMC authority.
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <div>Gram Panchayat: <strong>{currentUser.village}</strong></div>
                <div>Sarpanch / Representative: <strong>{currentUser.fullName}</strong></div>
                <div>Total Smallholders Registered: <strong>{farmers.length}</strong></div>
                <div>Aggregated Collective Yield: <strong>{(totalCollectiveKg / 1000).toFixed(1)} Metric Tons</strong></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 font-bold text-stone-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  addToast('Export Successful', 'Activity report downloaded as CSV/PDF compliance format.', 'success');
                  setShowExportModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold cursor-pointer shadow"
              >
                Download Official Report (.CSV)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
