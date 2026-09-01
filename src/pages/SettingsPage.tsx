import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  User,
  Globe,
  Bell,
  Shield,
  Smartphone,
  Save,
  CheckCircle2,
  Wallet,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/agriData';

export const SettingsPage: React.FC = () => {
  const { farmerProfile, updateProfile, language, setLanguage, wallet, addToast } = useApp();

  const [name, setName] = useState(farmerProfile.name);
  const [mobile, setMobile] = useState(farmerProfile.mobile);
  const [state, setState] = useState(farmerProfile.state);
  const [district, setDistrict] = useState(farmerProfile.district);
  const [village, setVillage] = useState(farmerProfile.village);
  const [farmSizeAcres, setFarmSizeAcres] = useState<number>(farmerProfile.farmSizeAcres);
  const [soilType, setSoilType] = useState(farmerProfile.soilType);
  const [mainCrop, setMainCrop] = useState(farmerProfile.mainCrop);

  // Notification toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [moistureAlerts, setMoistureAlerts] = useState(true);
  const [priceSpikeAlerts, setPriceSpikeAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      mobile,
      state,
      district,
      village,
      farmSizeAcres: Number(farmSizeAcres),
      soilType,
      mainCrop,
      preferredLanguage: language,
    });
    addToast('Profile Updated', 'Farmer profile and agricultural preferences have been saved.', 'success');
  };

  const handleClearCache = () => {
    if (window.confirm('Reset local demo cache? (This will restore default seed data)')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-[#2D4F1E] text-white p-6 sm:p-8 rounded-3xl shadow-md">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>{language === 'hi' ? 'सेटिंग्स और खाता' : 'Preferences & Farm Account'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {language === 'hi' ? 'प्रोफ़ाइल और प्राथमिक भाषा' : 'Farmer Profile & Settings'}
        </h1>
        <p className="text-emerald-100/80 text-sm mt-1">
          {language === 'hi'
            ? 'अपनी व्यक्तिगत जानकारी, भाषा, मृदा प्रकार और स्मार्ट सूचनाएं प्रबंधित करें।'
            : 'Manage farm identity, regional language preference, IoT pump triggers, and wallet keys.'}
        </p>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#2D4F1E]" />
          <span>{language === 'hi' ? 'भाषा का चयन (Preferred Language)' : 'Select Application Language'}</span>
        </h3>
        <p className="text-xs text-stone-500">
          Choose your native tongue for AI agronomist voice synthesis and advisory summaries.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as any);
                addToast('Language Changed', `Switched interface to ${lang.nativeName}`, 'info');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                language === lang.code
                  ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="text-base font-bold text-stone-900">{lang.nativeName}</div>
              <div className="text-xs text-stone-500 font-medium">{lang.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <User className="w-5 h-5 text-[#2D4F1E]" />
            <span>{language === 'hi' ? 'कृषक और खेत की जानकारी' : 'Farmer & Land Ownership Details'}</span>
          </h3>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Kisan ID: KB-98402
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Full Name (किसान का पूरा नाम)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Mobile Number (मोबाइल नंबर)</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">State (राज्य)</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="Gujarat">Gujarat (गुजरात)</option>
              <option value="Rajasthan">Rajasthan (राजस्थान)</option>
              <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
              <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
              <option value="Punjab">Punjab (पंजाब)</option>
              <option value="Haryana">Haryana (हरियाणा)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">District (जिला)</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Village (गांव)</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Total Farm Size (कुल रकबा एकड़)</label>
            <input
              type="number"
              step="0.1"
              value={farmSizeAcres}
              onChange={(e) => setFarmSizeAcres(parseFloat(e.target.value) || 1)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Primary Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="Medium Black Cotton">Medium Black Cotton (काली मिट्टी)</option>
              <option value="Alluvial Loam">Alluvial Loam (दोमट मिट्टी)</option>
              <option value="Sandy Loam">Sandy Loam (बलुई दोमट)</option>
              <option value="Red Soil">Red Soil (लाल मिट्टी)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Primary Cash Crop</label>
            <input
              type="text"
              value={mainCrop}
              onChange={(e) => setMainCrop(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#2D4F1E] hover:bg-[#223d16] text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'hi' ? 'विवरण सुरक्षित करें' : 'Save Farm Profile'}</span>
          </button>
        </div>
      </form>

      {/* Notifications & Alert Toggles */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#2D4F1E]" />
          <span>Automated Advisory & Notification Channels</span>
        </h3>

        <div className="space-y-3">
          {[
            {
              title: 'SMS Voice Broadcasts & Weather Warnings',
              desc: 'Receive urgent frost, hailstorm, and pest alerts via Indian Meteorological SMS gateway.',
              checked: smsAlerts,
              toggle: () => setSmsAlerts(!smsAlerts),
            },
            {
              title: 'WhatsApp Farm Advisory & Mandi Rates',
              desc: 'Daily 08:00 AM summary of your primary crop APMC modal rate directly on WhatsApp.',
              checked: whatsappAlerts,
              toggle: () => setWhatsappAlerts(!whatsappAlerts),
            },
            {
              title: 'IoT Sub-Surface Soil Moisture Triggers',
              desc: 'Get notified when soil moisture drops below 40% to initiate solar drip cycles.',
              checked: moistureAlerts,
              toggle: () => setMoistureAlerts(!moistureAlerts),
            },
            {
              title: 'Mandi Price Spike & Cluster Arbitrage Signals',
              desc: 'Alert when a neighbouring APMC mandi pays +₹200/Qtl more than local yard.',
              checked: priceSpikeAlerts,
              toggle: () => setPriceSpikeAlerts(!priceSpikeAlerts),
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.toggle}
              className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between cursor-pointer hover:bg-stone-100/70 transition-colors"
            >
              <div className="pr-4">
                <div className="text-xs font-bold text-stone-900">{item.title}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">{item.desc}</div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 shrink-0 ${
                  item.checked ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    item.checked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Algorand Wallet & System Diagnostics */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#2D4F1E]" />
          <span>Algorand x402 Micropayment Wallet & Diagnostics</span>
        </h3>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-stone-700">Algorand Testnet Address:</span>
            <span className="font-mono text-emerald-800 font-bold">{wallet.address.slice(0, 10)}...{wallet.address.slice(-6)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-stone-700">Available ALGO Balance:</span>
            <span className="font-mono text-stone-900 font-bold">{wallet.balanceAlgo.toFixed(2)} ALGO (~₹{(wallet.balanceAlgo * 24.5).toFixed(0)})</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-stone-700">App Build Version:</span>
            <span className="font-mono text-stone-500">v2.4.0-SIH-Production</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 p-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Cache to Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
