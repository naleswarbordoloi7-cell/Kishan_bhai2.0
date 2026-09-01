import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Sprout,
  MapPin,
  Smartphone,
  ShieldCheck,
  Save,
  Radio,
  Coins,
  Globe,
} from 'lucide-react';

export const FarmProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, addToast, setIsNfcModalOpen, setIsWalletModalOpen, wallet, language, setLanguage } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || 'Ramesh Patel');
  const [village, setVillage] = useState(currentUser?.village || 'Anandpur');
  const [farmSize, setFarmSize] = useState(currentUser?.farmSizeAcres?.toString() || '4.5');
  const [crops, setCrops] = useState(currentUser?.crops?.join(', ') || 'Cotton, Groundnut, Wheat');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated = {
      ...currentUser,
      fullName,
      village,
      farmSizeAcres: parseFloat(farmSize) || 4.5,
      crops: crops.split(',').map((c) => c.trim()),
      phone,
    };

    setCurrentUser(updated);
    addToast('Profile Saved', 'Farm details updated successfully across Virtual Clusters.', 'success');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-800/40 space-y-2">
        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/30">
          SMALLHOLDER DIGITAL IDENTITY
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          Farm Profile & Settings
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm">
          Maintain land holding records, connected Web3 wallet, and preferred communication language.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left ID Preview Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-800 to-stone-900 text-white p-6 rounded-3xl shadow-md border border-emerald-700/50 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold block">
                  Kishan Bhai Smart ID
                </span>
                <h3 className="text-lg font-bold font-display mt-0.5">{fullName}</h3>
                <p className="text-xs text-emerald-100">{village}, Gujarat</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-xs">
                🌾
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
              <div>
                <span className="text-stone-400 text-[10px] block">Role</span>
                <span className="font-semibold text-emerald-200">{currentUser?.role || 'FARMER'}</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] block">Farm Holding</span>
                <span className="font-semibold">{farmSize} Acres</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] font-mono">
              <span className="text-emerald-300">NFC & Testnet Verified</span>
              <button
                onClick={() => setIsNfcModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1"
              >
                <Radio className="w-3 h-3 text-emerald-300" />
                <span>NFC Card</span>
              </button>
            </div>
          </div>

          {/* Connected Wallet Box */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-700" />
                <span>Algorand Testnet Wallet</span>
              </h4>
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="text-xs text-emerald-700 font-semibold hover:underline"
              >
                Switch
              </button>
            </div>
            <p className="font-mono text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 break-all">
              {wallet.address}
            </p>
            <div className="flex justify-between text-xs font-semibold pt-1">
              <span className="text-stone-600">Balance:</span>
              <span className="text-emerald-700">{wallet.usdcBalance.toFixed(2)} USDC</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5 text-xs">
            <h3 className="font-bold font-display text-base text-stone-900 border-b border-stone-100 pb-3">
              Personal & Farm Specifics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Full Legal Name:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Contact Phone:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Village / Gram Panchayat:</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Farm Land Holding (Acres):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Active Crops (comma separated):</label>
              <input
                type="text"
                required
                value={crops}
                onChange={(e) => setCrops(e.target.value)}
                placeholder="Cotton, Wheat, Groundnut"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Preferred Interface Language:</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                  />
                  <span>English</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    checked={language === 'hi'}
                    onChange={() => setLanguage('hi')}
                  />
                  <span>हिंदी (Hindi)</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
