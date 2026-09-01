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
  Fingerprint,
  ScanFace,
  Plus,
  Trash2,
  KeyRound,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const FarmProfilePage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    addToast,
    setIsNfcModalOpen,
    setIsWalletModalOpen,
    wallet,
    language,
    setLanguage,
    biometricSettings,
    updateBiometricSettings,
    enrolledPasskeys,
    registerNewPasskey,
    deletePasskey,
    triggerBiometricPrompt,
    biometricCapability,
  } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || 'Ramesh Patel');
  const [village, setVillage] = useState(currentUser?.village || 'Anandpur');
  const [farmSize, setFarmSize] = useState(currentUser?.farmSizeAcres?.toString() || '4.5');
  const [crops, setCrops] = useState(currentUser?.crops?.join(', ') || 'Cotton, Groundnut, Wheat');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [isEnrollingPasskey, setIsEnrollingPasskey] = useState(false);

  const executeSaveProfile = () => {
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

    // Sync with backend API
    fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: updated.id,
        fullName: updated.fullName,
        village: updated.village,
        farmSizeAcres: updated.farmSizeAcres,
        crops: updated.crops,
        phone: updated.phone,
        preferredLanguage: language,
      }),
    }).catch(() => {});

    addToast('Profile Saved', 'Farm details updated successfully across Virtual Clusters.', 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // If biometric security is enabled for profile updates, require biometric passkey verification
    if (biometricSettings.biometricsEnabled && biometricSettings.requireForProfileEdits) {
      triggerBiometricPrompt({
        title: language === 'hi' ? 'खेत रिकॉर्ड सत्यापन' : 'Verify Biometrics to Update Records',
        subtitle: 'Scan your fingerprint or face to authorize farm profile modifications.',
        actionReason: 'Authorizing farm acreage & crop record updates',
        targetUserId: currentUser.id,
        onSuccess: () => {
          executeSaveProfile();
        },
      });
    } else {
      executeSaveProfile();
    }
  };

  const handleEnrollDevice = async () => {
    setIsEnrollingPasskey(true);
    try {
      await registerNewPasskey();
    } finally {
      setIsEnrollingPasskey(false);
    }
  };

  const handleTestSensor = () => {
    triggerBiometricPrompt({
      title: language === 'hi' ? 'बायोमेट्रिक सेंसर टेस्ट' : 'Test Biometric Sensor',
      subtitle: 'Testing hardware passkey and biometric recognition.',
      actionReason: 'Hardware verification check for Kishan Bhai',
      targetUserId: currentUser?.id,
      onSuccess: (u) => {
        addToast('Biometric Check Passed', `Sensor verified for ${u?.fullName || fullName}.`, 'success');
      },
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-800/40 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/30">
            SMALLHOLDER DIGITAL IDENTITY & BIOMETRICS
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {biometricSettings.biometricsEnabled ? 'Biometrics: Active' : 'Biometrics: Disabled'}
              </span>
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          {language === 'hi' ? 'किसान प्रोफाइल व बायोमेट्रिक सुरक्षा' : 'Farm Profile & Biometric Security'}
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm">
          {language === 'hi'
            ? 'अपनी ज़मीन, फसल विवरण, वेब3 वॉलेट और फिंगरप्रिंट/फेस बायोमेट्रिक सेटिंग्स प्रबंधित करें।'
            : 'Maintain land holding records, connected Web3 wallet, and hardware-encrypted biometric passkeys.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: ID Preview & Connected Wallet */}
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
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-sm text-emerald-300">
                <Fingerprint className="w-5 h-5" />
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
              <span className="text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>WebAuthn FIDO2</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNfcModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer"
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
                type="button"
                onClick={() => setIsWalletModalOpen(true)}
                className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
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

          {/* Quick Hardware Sensor Info Box */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>Detected Biometrics</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                {biometricCapability?.deviceType || 'passkey'}
              </span>
            </div>
            <p className="text-[11px] text-stone-600">
              {biometricCapability?.deviceName || 'Standard Device Biometrics'}
            </p>
            <button
              type="button"
              onClick={handleTestSensor}
              className="w-full mt-1 bg-white hover:bg-emerald-100 text-emerald-900 font-semibold py-1.5 px-3 rounded-xl border border-emerald-300 text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-700" />
              <span>Test Biometric Sensor Now</span>
            </button>
          </div>
        </div>

        {/* Right Columns: Personal Details Form + Biometric Management Center */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Personal & Farm Specifics Form */}
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold font-display text-base text-stone-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#2D4F1E]" />
                <span>Personal & Farm Specifics</span>
              </h3>
              {biometricSettings.requireForProfileEdits && (
                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Biometric Protected</span>
                </span>
              )}
            </div>

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
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="radio"
                    name="lang"
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                  />
                  <span>English</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
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
                className="bg-[#2D4F1E] hover:bg-[#223d16] text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>
                  {biometricSettings.requireForProfileEdits
                    ? 'Verify & Save Profile'
                    : 'Save Profile Changes'}
                </span>
              </button>
            </div>
          </form>

          {/* 2. Biometric Security & Passkey Management Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-base text-stone-900">
                    {language === 'hi' ? 'बायोमेट्रिक प्रमाणीकरण व पासकी' : 'Biometric Security & Passkeys'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Hardware fingerprint & face unlock security for sensitive farm records
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEnrollDevice}
                disabled={isEnrollingPasskey}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold px-3 py-2 rounded-xl border border-emerald-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isEnrollingPasskey ? 'Enrolling...' : 'Enroll Current Device'}</span>
              </button>
            </div>

            {/* Granular Biometric Protection Switches */}
            <div className="space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80">
              <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-stone-700" />
                <span>Security Policies & Verification Triggers</span>
              </h4>

              <div className="space-y-2.5 pt-1">
                {/* Policy 1: Master Biometrics Toggle */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80 cursor-pointer hover:border-emerald-500 transition-colors">
                  <div>
                    <span className="font-bold text-stone-900 block">Enable Biometric Passkeys</span>
                    <span className="text-[11px] text-stone-500">Allow fingerprint / Face ID sign-in without OTP</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricSettings.biometricsEnabled}
                    onChange={(e) => updateBiometricSettings({ biometricsEnabled: e.target.checked })}
                    className="w-4 h-4 text-[#2D4F1E] rounded accent-[#2D4F1E]"
                  />
                </label>

                {/* Policy 2: Land Records Protection */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80 cursor-pointer hover:border-emerald-500 transition-colors">
                  <div>
                    <span className="font-bold text-stone-900 block">Protect Farm Land & Acreage Records</span>
                    <span className="text-[11px] text-stone-500">Prompt biometrics before altering farm acreage or crops</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricSettings.requireForLandRecords}
                    disabled={!biometricSettings.biometricsEnabled}
                    onChange={(e) => updateBiometricSettings({ requireForLandRecords: e.target.checked })}
                    className="w-4 h-4 text-[#2D4F1E] rounded accent-[#2D4F1E]"
                  />
                </label>

                {/* Policy 3: High-Value Transactions */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80 cursor-pointer hover:border-emerald-500 transition-colors">
                  <div>
                    <span className="font-bold text-stone-900 block">Protect Grain Pooling & Bulk APMC Sales</span>
                    <span className="text-[11px] text-stone-500">Require biometric confirmation for x402 sales & payouts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricSettings.requireForTransactions}
                    disabled={!biometricSettings.biometricsEnabled}
                    onChange={(e) => updateBiometricSettings({ requireForTransactions: e.target.checked })}
                    className="w-4 h-4 text-[#2D4F1E] rounded accent-[#2D4F1E]"
                  />
                </label>

                {/* Policy 4: Profile Edits */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80 cursor-pointer hover:border-emerald-500 transition-colors">
                  <div>
                    <span className="font-bold text-stone-900 block">Require Biometrics to Save Profile Changes</span>
                    <span className="text-[11px] text-stone-500">Verify biometric sensor before saving legal farmer details</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricSettings.requireForProfileEdits}
                    disabled={!biometricSettings.biometricsEnabled}
                    onChange={(e) => updateBiometricSettings({ requireForProfileEdits: e.target.checked })}
                    className="w-4 h-4 text-[#2D4F1E] rounded accent-[#2D4F1E]"
                  />
                </label>
              </div>
            </div>

            {/* Enrolled Passkeys List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Enrolled Biometric Devices ({enrolledPasskeys.length})</span>
                </h4>
                <span className="text-[10px] text-stone-500 font-mono">FIDO2 WebAuthn</span>
              </div>

              {enrolledPasskeys.length === 0 ? (
                <div className="p-4 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center space-y-2">
                  <Fingerprint className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-600 font-medium">No biometric passkeys enrolled yet.</p>
                  <button
                    type="button"
                    onClick={handleEnrollDevice}
                    className="text-xs text-[#2D4F1E] font-bold hover:underline cursor-pointer"
                  >
                    Click here to enroll this device's Touch ID / Fingerprint sensor →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {enrolledPasskeys.map((cred) => (
                    <div
                      key={cred.id}
                      className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                          {cred.authenticatorType === 'face_id' ? (
                            <ScanFace className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Fingerprint className="w-4 h-4 text-emerald-700" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                            <span>{cred.deviceName}</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                              Verified
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500">
                            Enrolled: {new Date(cred.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {cred.lastUsedAt && (
                              <span> • Last Used: {new Date(cred.lastUsedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deletePasskey(cred.id)}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Revoke passkey"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

