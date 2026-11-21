import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore, DEFAULT_BUYER_USER } from '../store/userStore';
import {
  User,
  Sprout,
  MapPin,
  ShieldCheck,
  Save,
  Radio,
  Coins,
  CheckCircle2,
  Layers,
  FileText,
  Building2,
  Warehouse,
  BadgeCheck,
  PackageCheck,
  Briefcase,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import {
  INDIAN_STATES_AND_DISTRICTS,
  getDistrictsForState,
} from '../data/indianStatesAndDistricts';
import { UserProfile } from '../../shared/types';
import { updateFirebaseUserProfile } from '../services/firebaseAuthService';

const BUSINESS_TYPES = [
  'Food Processor & Exporter',
  'Institutional Aggregator',
  'APMC Mandi Trader',
  'FMCG / Retail Chain',
  'Cold Storage & Warehousing',
  'Commodity Exporter',
  'FPO / Cooperative Buyer',
];

const PAYMENT_TERMS_OPTIONS = [
  'Escrow Instant',
  'Advance 50% + Delivery',
  'On Farm-Gate Weighbridge',
  'Net 7 Days RTGS',
  'Direct Bank / UPI Settlement',
];

const COMMON_COMMODITIES = [
  'Cotton',
  'Wheat',
  'Groundnut',
  'Yellow Mustard',
  'Soybean',
  'Cumin',
  'Basmati Rice',
  'Tur Dal',
  'Chana',
];

export const FarmProfilePage: React.FC = () => {
  const {
    currentUser,
    userRole,
    setCurrentUser,
    buyerProfile,
    updateBuyerProfile,
  } = useUserStore();
  const {
    addToast,
    setIsNfcModalOpen,
    setIsWalletModalOpen,
    wallet,
    language,
    setLanguage,
    setCurrentView,
  } = useApp();

  const isBuyer = userRole === 'BUYER' || currentUser?.role === 'BUYER';
  const isHi = language === 'hi';

  // Resolve active Buyer seed (keeps farmer default intact if persona switched in header)
  const resolvedBuyerUser: UserProfile =
    currentUser?.role === 'BUYER'
      ? currentUser
      : (() => {
          try {
            const cached = localStorage.getItem('kb_buyer_user');
            if (cached) return JSON.parse(cached);
          } catch {}
          return DEFAULT_BUYER_USER;
        })();

  // Farmer profile states
  const [fullName, setFullName] = useState(
    isBuyer ? (resolvedBuyerUser.fullName || buyerProfile.fullName) : (currentUser?.fullName || 'Ramesh Patel')
  );
  const [village, setVillage] = useState(
    isBuyer ? (resolvedBuyerUser.village || buyerProfile.village) : (currentUser?.village || 'Anandpur')
  );
  const [district, setDistrict] = useState(
    isBuyer ? (resolvedBuyerUser.district || buyerProfile.district || 'Ahmedabad') : (currentUser?.district || 'Rajkot')
  );
  const [state, setState] = useState(
    isBuyer ? (resolvedBuyerUser.state || buyerProfile.state) : (currentUser?.state || 'Gujarat')
  );
  const [farmSize, setFarmSize] = useState(currentUser?.farmSizeAcres?.toString() || '4.5');
  const [crops, setCrops] = useState(currentUser?.crops?.join(', ') || 'Cotton, Groundnut, Wheat');
  const [phone, setPhone] = useState(
    isBuyer ? (resolvedBuyerUser.phone || buyerProfile.phone) : (currentUser?.phone || '+91 98251 44320')
  );

  // Buyer-specific states
  const [companyName, setCompanyName] = useState(
    resolvedBuyerUser.companyName || buyerProfile.companyName || 'ITC Agri Sourcing'
  );
  const [businessType, setBusinessType] = useState(
    resolvedBuyerUser.businessType || buyerProfile.businessType || 'Food Processor & Exporter'
  );
  const [contactDesignation, setContactDesignation] = useState(
    resolvedBuyerUser.contactDesignation || buyerProfile.contactDesignation || 'Head of Direct Cluster Procurement'
  );
  const [gstin, setGstin] = useState(resolvedBuyerUser.gstin || buyerProfile.gstin || '');
  const [panNumber, setPanNumber] = useState(resolvedBuyerUser.panNumber || buyerProfile.panNumber || '');
  const [mandiLicenseNo, setMandiLicenseNo] = useState(
    resolvedBuyerUser.mandiLicenseNo || buyerProfile.mandiLicenseNo || ''
  );
  const [warehouseLocation, setWarehouseLocation] = useState(
    resolvedBuyerUser.warehouseLocation || buyerProfile.warehouseLocation || 'Ahmedabad Processing Depot'
  );
  const [preferredCropsText, setPreferredCropsText] = useState(
    (resolvedBuyerUser.preferredCrops || buyerProfile.preferredCrops || ['Cotton', 'Wheat']).join(', ')
  );
  const [sourcingStatesText, setSourcingStatesText] = useState(
    (resolvedBuyerUser.sourcingStates || buyerProfile.sourcingStates || ['Gujarat']).join(', ')
  );
  const [monthlyCapacity, setMonthlyCapacity] = useState(
    String(resolvedBuyerUser.monthlyProcurementTons ?? buyerProfile.monthlyProcurementTons ?? 250)
  );
  const [paymentTerms, setPaymentTerms] = useState(
    resolvedBuyerUser.paymentTerms || buyerProfile.paymentTerms || 'Escrow Instant'
  );
  const [upiOrBankRef, setUpiOrBankRef] = useState(
    resolvedBuyerUser.upiOrBankRef || buyerProfile.upiOrBankRef || ''
  );
  const [bio, setBio] = useState(resolvedBuyerUser.bio || buyerProfile.bio || '');

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Sync form inputs when active persona or currentUser changes
  useEffect(() => {
    if (isBuyer) {
      const src =
        currentUser?.role === 'BUYER'
          ? currentUser
          : (() => {
              try {
                const cached = localStorage.getItem('kb_buyer_user');
                if (cached) return JSON.parse(cached) as UserProfile;
              } catch {}
              return DEFAULT_BUYER_USER;
            })();
      setFullName(src.fullName || buyerProfile.fullName);
      setPhone(src.phone || buyerProfile.phone);
      setState(src.state || buyerProfile.state || 'Gujarat');
      setDistrict(src.district || buyerProfile.district || 'Ahmedabad');
      setVillage(src.village || buyerProfile.village || 'Ahmedabad APMC Hub');
      setCompanyName(src.companyName ?? buyerProfile.companyName);
      setBusinessType(src.businessType ?? buyerProfile.businessType);
      setContactDesignation(src.contactDesignation ?? buyerProfile.contactDesignation);
      setGstin(src.gstin ?? buyerProfile.gstin);
      setPanNumber(src.panNumber ?? buyerProfile.panNumber ?? '');
      setMandiLicenseNo(src.mandiLicenseNo ?? buyerProfile.mandiLicenseNo);
      setWarehouseLocation(src.warehouseLocation ?? buyerProfile.warehouseLocation);
      setPreferredCropsText((src.preferredCrops ?? buyerProfile.preferredCrops ?? []).join(', '));
      setSourcingStatesText((src.sourcingStates ?? buyerProfile.sourcingStates ?? []).join(', '));
      setMonthlyCapacity(String(src.monthlyProcurementTons ?? buyerProfile.monthlyProcurementTons ?? 250));
      setPaymentTerms(src.paymentTerms ?? buyerProfile.paymentTerms);
      setUpiOrBankRef(src.upiOrBankRef ?? buyerProfile.upiOrBankRef ?? '');
      setBio(src.bio ?? buyerProfile.bio ?? '');
    } else if (currentUser) {
      setFullName(currentUser.fullName || 'Ramesh Patel');
      setVillage(currentUser.village || 'Anandpur');
      setDistrict(currentUser.district || 'Rajkot');
      setState(currentUser.state || 'Gujarat');
      setFarmSize(currentUser.farmSizeAcres?.toString() || '4.5');
      setCrops(currentUser.crops?.join(', ') || 'Cotton, Groundnut, Wheat');
      setPhone(currentUser.phone || '+91 98251 44320');
    }
    setFormError(null);
  }, [isBuyer, currentUser?.id, currentUser?.role]);

  const togglePreferredCommodity = (commodity: string) => {
    const existing = preferredCropsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const exists = existing.some((c) => c.toLowerCase() === commodity.toLowerCase());
    const next = exists
      ? existing.filter((c) => c.toLowerCase() !== commodity.toLowerCase())
      : [...existing, commodity];
    setPreferredCropsText(next.join(', '));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError(isHi ? 'कृपया पूरा नाम दर्ज करें।' : 'Full name is required.');
      return;
    }

    if (isBuyer) {
      if (!companyName.trim()) {
        setFormError(isHi ? 'कृपया कंपनी या संस्था का नाम दर्ज करें।' : 'Company / organization name is required.');
        return;
      }
      if (!warehouseLocation.trim()) {
        setFormError(isHi ? 'कृपया डिलीवरी गोदाम / डिपो का पता दर्ज करें।' : 'Designated delivery depot / warehouse location is required.');
        return;
      }
      const normalizedGstin = gstin.trim().toUpperCase();
      if (normalizedGstin && !/^[0-9A-Z]{15}$/.test(normalizedGstin)) {
        setFormError(
          isHi
            ? 'GSTIN 15 अक्षरों/अंकों का होना चाहिए (या खाली छोड़ें)।'
            : 'GSTIN must be 15 alphanumeric characters (or leave blank if exempt).'
        );
        return;
      }

      setIsSaving(true);
      const parsedCrops = preferredCropsText
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      const parsedStates = sourcingStatesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const capacityNum = Math.max(0, parseFloat(monthlyCapacity) || 0);

      const baseBuyer = currentUser?.role === 'BUYER' ? currentUser : resolvedBuyerUser;
      const updatedBuyerUser: UserProfile = {
        ...baseBuyer,
        role: 'BUYER',
        fullName: fullName.trim(),
        phone: phone.trim(),
        state: state.trim(),
        district: district.trim(),
        village: village.trim(),
        companyName: companyName.trim(),
        businessType: businessType.trim(),
        contactDesignation: contactDesignation.trim(),
        gstin: normalizedGstin,
        panNumber: panNumber.trim().toUpperCase(),
        mandiLicenseNo: mandiLicenseNo.trim(),
        warehouseLocation: warehouseLocation.trim(),
        preferredCrops: parsedCrops,
        sourcingStates: parsedStates,
        monthlyProcurementTons: capacityNum,
        paymentTerms,
        upiOrBankRef: upiOrBankRef.trim(),
        bio: bio.trim(),
        preferredLanguage: language === 'hi' ? 'hi' : 'en',
        updatedAt: new Date().toISOString(),
      };

      updateBuyerProfile({
        fullName: updatedBuyerUser.fullName,
        email: updatedBuyerUser.email,
        phone: updatedBuyerUser.phone,
        state: updatedBuyerUser.state,
        district: updatedBuyerUser.district || '',
        village: updatedBuyerUser.village,
        companyName: updatedBuyerUser.companyName || '',
        businessType: updatedBuyerUser.businessType || '',
        contactDesignation: updatedBuyerUser.contactDesignation || '',
        gstin: updatedBuyerUser.gstin || '',
        panNumber: updatedBuyerUser.panNumber || '',
        mandiLicenseNo: updatedBuyerUser.mandiLicenseNo || '',
        warehouseLocation: updatedBuyerUser.warehouseLocation || '',
        preferredCrops: parsedCrops,
        sourcingStates: parsedStates,
        monthlyProcurementTons: capacityNum,
        paymentTerms,
        upiOrBankRef: updatedBuyerUser.upiOrBankRef || '',
        preferredLanguage: updatedBuyerUser.preferredLanguage || 'en',
        bio: updatedBuyerUser.bio || '',
      });
      setCurrentUser(updatedBuyerUser);

      try {
        const res = await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBuyerUser),
        });
        if (!res.ok) {
          throw new Error('Server sync failed');
        }
        const data = await res.json();
        if (data?.user) {
          setCurrentUser(data.user);
        }
        await updateFirebaseUserProfile(updatedBuyerUser);
        setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        addToast(
          isHi ? 'खरीदार प्रोफ़ाइल अपडेट हो गई' : 'Buyer Profile Updated',
          isHi
            ? `${companyName} का विवरण सफलतापूर्वक सुरक्षित किया गया।`
            : `${companyName} details saved and synced across Procurement & Proposals.`,
          'success'
        );
      } catch {
        setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        addToast(
          'Saved Locally',
          'Buyer profile updated for your active session.',
          'info'
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Farmer / Champion / Admin profile save
    if (!currentUser) return;
    setIsSaving(true);
    const updated: UserProfile = {
      ...currentUser,
      fullName: fullName.trim(),
      village: village.trim(),
      district: district.trim(),
      state: state.trim(),
      farmSizeAcres: parseFloat(farmSize) || 0,
      crops: crops.split(',').map((c) => c.trim()).filter(Boolean),
      phone: phone.trim(),
      preferredLanguage: language === 'hi' ? 'hi' : 'en',
      updatedAt: new Date().toISOString(),
    };

    setCurrentUser(updated);

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Server update failed');
      await updateFirebaseUserProfile(updated);
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      addToast('Profile Saved', 'Farm details updated successfully across Virtual Clusters.', 'success');
    } catch {
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      addToast('Profile Updated Locally', 'Changes saved to your device session.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  if (isBuyer) {
    const parsedPreferredCrops = preferredCropsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const stateDistricts = getDistrictsForState(state);

    return (
      <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 box-border">
        {/* Buyer Profile Header */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-800/40 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-400/30">
              INSTITUTIONAL BUYER IDENTITY
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHi ? 'सत्यापित खरीदार' : 'Verified Procurement Partner'}</span>
              </span>
              <button
                type="button"
                onClick={() => setCurrentView('buyer-dashboard')}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {isHi ? '← प्रोक्योरमेंट हब' : '← Back to Procurement Hub'}
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white break-words">
            {isHi ? 'खरीदार प्रोफ़ाइल और कंपनी विवरण' : 'Buyer Profile & Company Records'}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm">
            {isHi
              ? 'अपनी कंपनी का नाम, GSTIN, डिलीवरी गोदाम, पसंदीदा फसलें और एस्क्रो भुगतान सेटिंग अपडेट करें।'
              : 'Update company credentials, GSTIN, designated delivery depot, target commodities, and escrow settlement settings.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Buyer ID Card, Escrow Wallet & Procurement Preferences */}
          <div className="space-y-6 min-w-0">
            {/* Buyer Smart ID Card */}
            <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-amber-700/40 space-y-4">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold block">
                    Kishan Bhai Buyer ID
                  </span>
                  <h3 className="text-lg font-bold font-display mt-0.5 break-words">{companyName || 'Company Name'}</h3>
                  <p className="text-xs text-stone-200 font-medium break-words">
                    {fullName} {contactDesignation ? `• ${contactDesignation}` : ''}
                  </p>
                  <p className="text-xs text-emerald-200 flex items-center gap-1 mt-1 break-words">
                    <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>{village}, {district ? `${district}, ` : ''}{state}</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-amber-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                <div className="min-w-0">
                  <span className="text-stone-400 text-[10px] block">Business Type</span>
                  <span className="font-semibold text-amber-200 break-words block">{businessType}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-stone-400 text-[10px] block">Monthly Capacity</span>
                  <span className="font-semibold">{monthlyCapacity || 0} MT / mo</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-wrap justify-between items-center gap-2 text-[10px] font-mono">
                <span className="text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{gstin ? `GSTIN: ${gstin}` : 'KYC Verified Buyer'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsNfcModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Radio className="w-3 h-3 text-amber-300" />
                  <span>Buyer Pass</span>
                </button>
              </div>
            </div>

            {/* Connected Escrow Wallet Box */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3 text-xs">
              <div className="flex justify-between items-center gap-2">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Procurement Escrow Account</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer shrink-0"
                >
                  Switch
                </button>
              </div>
              <p className="font-mono text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 break-all">
                {wallet.address}
              </p>
              <div className="flex justify-between text-xs font-semibold pt-1 border-t border-stone-100">
                <span className="text-stone-600">Escrow Balance:</span>
                <span className="text-emerald-700 font-mono font-bold">{wallet.usdcBalance.toFixed(2)} USDC</span>
              </div>
            </div>

            {/* Active Commodity Mandate Preview */}
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/80 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <PackageCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Active Sourcing Mandate</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedPreferredCrops.length > 0 ? (
                  parsedPreferredCrops.map((crop) => (
                    <span
                      key={crop}
                      className="px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-200 text-[11px] font-semibold break-words"
                    >
                      {crop}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-500 text-[11px]">No crops specified yet</span>
                )}
              </div>
              <div className="pt-2 border-t border-amber-200/60 space-y-1 text-[11px]">
                <div className="flex justify-between gap-2">
                  <span className="text-stone-600">Primary Depot:</span>
                  <span className="font-semibold text-stone-900 text-right break-words">{warehouseLocation}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-600">Settlement:</span>
                  <span className="font-semibold text-emerald-800">{paymentTerms}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns: Editable Buyer Profile Form */}
          <div className="md:col-span-2 space-y-6 min-w-0">
            <form
              onSubmit={handleSave}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-5 text-xs box-border"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <h3 className="font-bold font-display text-base text-stone-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{isHi ? 'कंपनी एवं खरीदार प्रोफ़ाइल अपडेट' : 'Organization & Procurement Profile'}</span>
                </h3>
                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{lastSavedAt ? `Saved at ${lastSavedAt}` : 'Live Synchronized'}</span>
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Contact Person & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'प्रतिनिधि का पूरा नाम *' : 'Authorized Representative Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Arunav Sengupta"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'पद / डेज़िग्नेशन' : 'Designation / Role Title'}
                  </label>
                  <input
                    type="text"
                    value={contactDesignation}
                    onChange={(e) => setContactDesignation(e.target.value)}
                    placeholder="e.g. Procurement Manager"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Company Name & Business Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'कंपनी / संस्था का नाम *' : 'Company / Organization Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. ITC Agri Sourcing"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'व्यवसाय का प्रकार' : 'Business Category'}
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'व्यापार संपर्क नंबर *' : 'Business Contact Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'पंजीकृत ईमेल' : 'Registered Business Email'}
                  </label>
                  <input
                    type="email"
                    value={resolvedBuyerUser.email || buyerProfile.email}
                    readOnly
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Location: State, District, City/Hub */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'राज्य (State)' : 'Headquarters State'}
                  </label>
                  <select
                    value={state}
                    onChange={(e) => {
                      const nextState = e.target.value;
                      setState(nextState);
                      const dists = getDistrictsForState(nextState);
                      if (dists.length > 0 && !dists.includes(district)) {
                        setDistrict(dists[0]);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    {INDIAN_STATES_AND_DISTRICTS.map((s) => (
                      <option key={s.state} value={s.state}>
                        {s.state} ({s.hindiName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'जिला (District)' : 'District'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    {stateDistricts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                    {district && !stateDistricts.includes(district) && (
                      <option value={district}>{district}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'शहर / मंडी हब' : 'City / APMC Hub *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Warehouse / Delivery Depot */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                  <Warehouse className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isHi ? 'प्रमुख डिलीवरी गोदाम / डिपो पता *' : 'Designated Delivery Depot / Warehouse Address *'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  placeholder="e.g. Ahmedabad Processing Depot, Sanand GIDC"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Tax & Regulatory Compliance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">GSTIN (15-digit)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="24AAACI5950L1ZX"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="AAACI5950L"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">APMC / Mandi License No.</label>
                  <input
                    type="text"
                    value={mandiLicenseNo}
                    onChange={(e) => setMandiLicenseNo(e.target.value)}
                    placeholder="APMC-GJ-AMD-2026-441"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Preferred Procurement Crops + Quick Chips */}
              <div className="space-y-2">
                <label className="font-semibold text-stone-700 block">
                  {isHi ? 'खरीदी जाने वाली मुख्य फसलें (कॉमा से अलग)' : 'Preferred Procurement Commodities (comma separated)'}
                </label>
                <input
                  type="text"
                  value={preferredCropsText}
                  onChange={(e) => setPreferredCropsText(e.target.value)}
                  placeholder="Cotton, Wheat, Groundnut, Yellow Mustard"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_COMMODITIES.map((item) => {
                    const active = parsedPreferredCrops.some(
                      (c) => c.toLowerCase() === item.toLowerCase()
                    );
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => togglePreferredCommodity(item)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-emerald-400'
                        }`}
                      >
                        {active ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capacity, Payment Terms, Sourcing States */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'मासिक खरीद क्षमता (टन)' : 'Monthly Capacity (Metric Tons)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={monthlyCapacity}
                    onChange={(e) => setMonthlyCapacity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'भुगतान / एस्क्रो शर्तें' : 'Settlement & Payment Terms'}
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    {PAYMENT_TERMS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {isHi ? 'बैंक / UPI संदर्भ' : 'Escrow UPI / Bank Reference'}
                  </label>
                  <input
                    type="text"
                    value={upiOrBankRef}
                    onChange={(e) => setUpiOrBankRef(e.target.value)}
                    placeholder="company.escrow@icici"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  {isHi ? 'खरीद क्षेत्र / राज्य (कॉमा से अलग)' : 'Target Sourcing States (comma separated)'}
                </label>
                <input
                  type="text"
                  value={sourcingStatesText}
                  onChange={(e) => setSourcingStatesText(e.target.value)}
                  placeholder="Gujarat, Madhya Pradesh, Rajasthan"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  {isHi ? 'खरीद विवरण / गुणवत्ता आवश्यकता' : 'Procurement Bio & Quality Mandate'}
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe moisture tolerances, packaging standards, or FPO cluster partnership preferences..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Preferred Interface Language:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                    <input
                      type="radio"
                      name="buyer-lang"
                      checked={language === 'en'}
                      onChange={() => setLanguage('en')}
                    />
                    <span>English</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                    <input
                      type="radio"
                      name="buyer-lang"
                      checked={language === 'hi'}
                      onChange={() => setLanguage('hi')}
                    />
                    <span>हिंदी (Hindi)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-stone-500">
                  Changes sync directly to purchase proposals & farmer cluster verification cards.
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : (isHi ? 'खरीदार प्रोफ़ाइल सहेजें' : 'Save Buyer Profile')}</span>
                </button>
              </div>
            </form>

            {/* Buyer Compliance & Operational Summary */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4 text-xs">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-700" />
                <span>Institutional Procurement Credentials Summary</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1 min-w-0">
                  <span className="text-stone-500 text-[11px] block">Monthly Sourcing Cap</span>
                  <p className="font-bold text-stone-900 text-base">{monthlyCapacity || 0} Tons</p>
                  <span className="text-[10px] text-emerald-700 font-medium block break-words">{paymentTerms}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1 min-w-0">
                  <span className="text-stone-500 text-[11px] block">Active Commodities</span>
                  <p className="font-bold text-stone-900 text-base">{parsedPreferredCrops.length} Crops</p>
                  <span className="text-[10px] text-emerald-700 font-medium block break-words">
                    {sourcingStatesText || state}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1 min-w-0">
                  <span className="text-stone-500 text-[11px] block">Compliance & Depot</span>
                  <p className="font-bold text-stone-900 text-sm break-words">{mandiLicenseNo || 'APMC Verified'}</p>
                  <span className="text-[10px] text-amber-800 font-medium flex items-center gap-1 break-words">
                    <CreditCard className="w-3 h-3 shrink-0" />
                    <span>{gstin ? 'GSTIN Linked' : 'Standard Buyer KYC'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-emerald-800/40 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/30">
            SMALLHOLDER DIGITAL IDENTITY
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? 'सत्यापित किसान' : 'Verified Farmer'}</span>
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          {language === 'hi' ? 'किसान प्रोफाइल व खेत रिकॉर्ड' : 'Farm Profile & Land Records'}
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm">
          {language === 'hi'
            ? 'अपनी ज़मीन, फसल विवरण, संपर्क जानकारी और वेब3 वॉलेट प्रबंधित करें।'
            : 'Maintain land holding records, active crops, contact details, and connected Web3 wallet.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: ID Preview, Connected Wallet, and Badges */}
        <div className="space-y-6">
          {/* Kishan Bhai Smart ID Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-stone-900 text-white p-6 rounded-2xl shadow-md border border-emerald-700/50 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold block">
                  Kishan Bhai Smart ID
                </span>
                <h3 className="text-lg font-bold font-display mt-0.5">{fullName}</h3>
                <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  <span>{village}, {state}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-sm text-emerald-300">
                <Sprout className="w-5 h-5 text-emerald-300" />
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
                <span>Verified Agricultural ID</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNfcModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Radio className="w-3 h-3 text-emerald-300" />
                <span>NFC Card</span>
              </button>
            </div>
          </div>

          {/* Connected Wallet Box */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-700" />
                <span>Payout Escrow Account</span>
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
            <div className="flex justify-between text-xs font-semibold pt-1 border-t border-stone-100">
              <span className="text-stone-600">Balance:</span>
              <span className="text-emerald-700 font-mono font-bold">{wallet.usdcBalance.toFixed(2)} USDC</span>
            </div>
          </div>

          {/* Verification & Cooperative Hub Info */}
          <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Cooperative Mesh Status</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Your farm profile is active in the verified regional cluster network with pooled grain bargaining power and direct APMC buyer access.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-[11px]">
              <span className="text-stone-600">Cluster Standing:</span>
              <span className="font-semibold text-emerald-800">Tier 1 Gold Partner</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Personal Details Form & Farm Land Summary */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal & Farm Specifics Form */}
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-6 border border-stone-200 shadow-xs space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold font-display text-base text-stone-900 flex items-center gap-2">
                <User className="w-4 h-4 text-green-700" />
                <span>Personal & Farm Specifics</span>
              </h3>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{lastSavedAt ? `Saved at ${lastSavedAt}` : 'Live Synchronized'}</span>
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">State (राज्य - All India):</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  <optgroup label="States (28)">
                    {INDIAN_STATES_AND_DISTRICTS.filter((s) => s.type === 'state').map((s) => (
                      <option key={s.state} value={s.state}>
                        {s.state} ({s.hindiName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Union Territories (8)">
                    {INDIAN_STATES_AND_DISTRICTS.filter((s) => s.type === 'ut').map((s) => (
                      <option key={s.state} value={s.state}>
                        {s.state} ({s.hindiName})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Village / District / Town:</label>
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
                  min="0"
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
                disabled={isSaving}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>

          {/* Farm Records & Operational Overview */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4 text-xs">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-700" />
              <span>Registered Land & Crop Records Summary</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[11px] block">Total Cultivable Area</span>
                <p className="font-bold text-stone-900 text-base">{farmSize} Acres</p>
                <span className="text-[10px] text-emerald-700 font-medium">100% Khata Verified</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[11px] block">Monitored Crops</span>
                <p className="font-bold text-stone-900 text-base">
                  {crops.split(',').filter((c) => c.trim()).length} Varietals
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">Real-time Mandi linked</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[11px] block">Location Region</span>
                <p className="font-bold text-stone-900 text-base truncate">{state}</p>
                <span className="text-[10px] text-emerald-700 font-medium">{village} Circle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
