import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sprout, UserCheck, Building, BarChart3, ArrowRight, ShieldCheck, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { UserRole, UserProfile } from '../../shared/types';

export const AuthPage: React.FC = () => {
  const { setCurrentUser, setUserRole, setCurrentView, addToast } = useApp();
  const [tab, setTab] = useState<'register' | 'login' | 'roles'>('register');

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('FARMER');
  const [village, setVillage] = useState('');
  const [state, setState] = useState('Gujarat');
  const [farmSizeAcres, setFarmSizeAcres] = useState('3.5');
  const [crops, setCrops] = useState('Wheat, Mustard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) {
      addToast('Validation Error', 'Full Name and Email are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          phone: phone || '+91 98000 00000',
          role,
          village: village || 'Anandpur',
          state: state || 'Gujarat',
          farmSizeAcres: Number(farmSizeAcres) || 3.5,
          crops: crops.split(',').map((c) => c.trim()).filter(Boolean),
          preferredLanguage: 'hi',
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        addToast('Account Registered', `Welcome, ${data.user.fullName}!`, 'success');
        navigateToRoleDashboard(data.user.role);
      } else {
        addToast('Registration Failed', data.error || 'Could not register user', 'error');
      }
    } catch (err: any) {
      addToast('Network Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('Validation Error', 'Please enter your email.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        addToast('Welcome Back', `Logged in as ${data.user.fullName}`, 'success');
        navigateToRoleDashboard(data.user.role);
      } else {
        addToast('Login Failed', data.error || 'Account not found. Please register.', 'error');
      }
    } catch (err: any) {
      addToast('Network Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRoleSetup = (chosenRole: UserRole, defaultName: string) => {
    const user: UserProfile = {
      id: `usr_${chosenRole.toLowerCase()}_${Date.now()}`,
      email: `${chosenRole.toLowerCase()}_${Date.now()}@kishanbhai.in`,
      fullName: defaultName,
      phone: '+91 98000 00000',
      role: chosenRole,
      village: 'Anandpur',
      state: 'Gujarat',
      verified: true,
      farmSizeAcres: chosenRole === 'FARMER' ? 4.0 : undefined,
      crops: chosenRole === 'FARMER' ? ['Cotton', 'Wheat'] : undefined,
      createdAt: new Date().toISOString(),
    };

    // Save to backend
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }).catch(() => {});

    setCurrentUser(user);
    setUserRole(chosenRole);
    addToast('Profile Initialized', `Created fresh ${chosenRole} profile for ${defaultName}.`, 'success');
    navigateToRoleDashboard(chosenRole);
  };

  const navigateToRoleDashboard = (targetRole: UserRole) => {
    switch (targetRole) {
      case 'FARMER':
        setCurrentView('farmer-dashboard');
        break;
      case 'CHAMPION':
        setCurrentView('champion-dashboard');
        break;
      case 'BUYER':
        setCurrentView('buyer-dashboard');
        break;
      case 'ADMIN':
        setCurrentView('admin-dashboard');
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-[#2D4F1E] text-xs px-3.5 py-1 rounded-full font-mono border border-emerald-600/20 font-semibold backdrop-blur-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D4F1E]" />
          <span>Clean Authentication & Access</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-stone-900">
          Account Access & Stakeholder Portals
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Register your farm profile, sign in to your dashboard, or initialize a custom stakeholder role.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 flex gap-1 shadow-2xs">
          <button
            onClick={() => setTab('register')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === 'register' ? 'bg-[#2D4F1E] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Register Profile
            </span>
          </button>

          <button
            onClick={() => setTab('login')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === 'login' ? 'bg-[#2D4F1E] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </span>
          </button>

          <button
            onClick={() => setTab('roles')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === 'roles' ? 'bg-[#2D4F1E] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Role Setup
            </span>
          </button>
        </div>
      </div>

      {/* Register Tab */}
      {tab === 'register' && (
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xl max-w-xl mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-stone-900">Create New Account</h2>
            <p className="text-xs text-stone-500">Enter your genuine farmer, champion, or buyer information.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Stakeholder Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                >
                  <option value="FARMER">Smallholder Farmer</option>
                  <option value="CHAMPION">Village Champion (Hub Lead)</option>
                  <option value="BUYER">Institutional Buyer / Mandi Trader</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Village / Hub</label>
                <input
                  type="text"
                  placeholder="e.g. Anandpur"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">State</label>
                <input
                  type="text"
                  placeholder="e.g. Gujarat"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                />
              </div>
            </div>

            {role === 'FARMER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700">Farm Acreage (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="3.5"
                    value={farmSizeAcres}
                    onChange={(e) => setFarmSizeAcres(e.target.value)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700">Cultivated Crops</label>
                  <input
                    type="text"
                    placeholder="Cotton, Wheat, Mustard"
                    value={crops}
                    onChange={(e) => setCrops(e.target.value)}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2D4F1E] hover:bg-[#223d16] text-white font-medium py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-white/20 active:scale-[0.99] mt-2"
            >
              <span>{isSubmitting ? 'Registering...' : 'Complete Registration & Open Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Login Tab */}
      {tab === 'login' && (
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xl max-w-md mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-stone-900">Sign In</h2>
            <p className="text-xs text-stone-500">Access your existing registered account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700">Registered Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2D4F1E]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2D4F1E] hover:bg-[#223d16] text-white font-medium py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-white/20 active:scale-[0.99] mt-2"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Quick Roles Tab */}
      {tab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              role: 'FARMER' as UserRole,
              title: 'Smallholder Farmer',
              defaultName: 'Farmer Member',
              icon: Sprout,
              desc: 'Create a farmer account to aggregate acreage, pledge bulk input orders, and run AI diagnostics.',
            },
            {
              role: 'CHAMPION' as UserRole,
              title: 'Village Champion',
              defaultName: 'Village Champion',
              icon: UserCheck,
              desc: 'Create a village coordinator account to onboard farmers, form clusters, and oversee pool demands.',
            },
            {
              role: 'BUYER' as UserRole,
              title: 'Institutional Buyer',
              defaultName: 'Institutional Buyer',
              icon: Building,
              desc: 'Create an institutional buyer profile to review certified harvest lots and submit escrow bids.',
            },
            {
              role: 'ADMIN' as UserRole,
              title: 'Platform Administrator',
              defaultName: 'Platform Administrator',
              icon: BarChart3,
              desc: 'System operations monitor for Algorand Testnet telemetry, x402 GoPlausible settlement, and API budgets.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                onClick={() => handleQuickRoleSetup(item.role, item.defaultName)}
                className="bg-white/70 backdrop-blur-lg rounded-[28px] p-6 border border-white/90 shadow-xs hover:border-[#2D4F1E] hover:shadow-md transition-all cursor-pointer space-y-4 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-[#2D4F1E] group-hover:bg-[#2D4F1E] group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#2D4F1E]/10 text-[#2D4F1E] border border-[#2D4F1E]/20 px-2.5 py-0.5 rounded-full uppercase">
                      {item.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-stone-900 group-hover:text-[#2D4F1E]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between text-xs font-semibold text-[#2D4F1E]">
                  <span>Initialize Clean {item.title}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
