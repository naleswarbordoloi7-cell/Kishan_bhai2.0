import { create } from 'zustand';
import { UserProfile, UserRole, FarmerProfileData, BuyerProfileData } from '../../shared/types';

export const DEFAULT_FARMER_USER: UserProfile = {
  id: 'usr_farmer_ramesh',
  fullName: 'Ramesh Patel',
  email: 'ramesh.patel@kishanbhai.in',
  phone: '+91 98251 44320',
  role: 'FARMER',
  village: 'Anandpur, Rajkot',
  state: 'Gujarat',
  verified: true,
  farmSizeAcres: 4.5,
  crops: ['Cotton (Bt)', 'Groundnut', 'Wheat'],
  preferredLanguage: 'hi',
  createdAt: '2025-01-15T00:00:00.000Z',
};

export const DEFAULT_BUYER_PROFILE: BuyerProfileData = {
  fullName: 'Arunav Sengupta',
  companyName: 'ITC Agri Sourcing',
  businessType: 'Food Processor & Exporter',
  contactDesignation: 'Head of Direct Cluster Procurement',
  email: 'arunav.sengupta@itc.in',
  phone: '+91 98110 55432',
  state: 'Gujarat',
  district: 'Ahmedabad',
  village: 'Ahmedabad APMC Hub',
  warehouseLocation: 'Ahmedabad Processing Depot, Sanand GIDC',
  gstin: '24AAACI5950L1ZX',
  panNumber: 'AAACI5950L',
  mandiLicenseNo: 'APMC-GJ-AMD-2026-441',
  preferredCrops: ['Cotton', 'Wheat', 'Groundnut', 'Yellow Mustard'],
  sourcingStates: ['Gujarat', 'Madhya Pradesh', 'Rajasthan'],
  monthlyProcurementTons: 250,
  paymentTerms: 'Escrow Instant',
  upiOrBankRef: 'itcagri.escrow@icici',
  preferredLanguage: 'en',
  bio: 'Direct farm-gate procurement desk sourcing lab-assayed cotton, oilseeds, and organic wheat from smallholder clusters.',
};

export const DEFAULT_BUYER_USER: UserProfile = {
  id: 'usr_buyer_itc',
  fullName: DEFAULT_BUYER_PROFILE.fullName,
  email: DEFAULT_BUYER_PROFILE.email,
  phone: DEFAULT_BUYER_PROFILE.phone,
  role: 'BUYER',
  village: DEFAULT_BUYER_PROFILE.village,
  district: DEFAULT_BUYER_PROFILE.district,
  state: DEFAULT_BUYER_PROFILE.state,
  verified: true,
  companyName: DEFAULT_BUYER_PROFILE.companyName,
  businessType: DEFAULT_BUYER_PROFILE.businessType,
  contactDesignation: DEFAULT_BUYER_PROFILE.contactDesignation,
  gstin: DEFAULT_BUYER_PROFILE.gstin,
  panNumber: DEFAULT_BUYER_PROFILE.panNumber,
  mandiLicenseNo: DEFAULT_BUYER_PROFILE.mandiLicenseNo,
  warehouseLocation: DEFAULT_BUYER_PROFILE.warehouseLocation,
  preferredCrops: DEFAULT_BUYER_PROFILE.preferredCrops,
  sourcingStates: DEFAULT_BUYER_PROFILE.sourcingStates,
  monthlyProcurementTons: DEFAULT_BUYER_PROFILE.monthlyProcurementTons,
  paymentTerms: DEFAULT_BUYER_PROFILE.paymentTerms,
  upiOrBankRef: DEFAULT_BUYER_PROFILE.upiOrBankRef,
  bio: DEFAULT_BUYER_PROFILE.bio,
  preferredLanguage: 'en',
  createdAt: '2026-05-20T14:15:00Z',
};

interface UserStore {
  currentUser: UserProfile | null;
  userRole: UserRole;
  farmerProfile: FarmerProfileData;
  buyerProfile: BuyerProfileData;
  setCurrentUser: (user: UserProfile | null) => void;
  setUserRole: (role: UserRole) => void;
  updateProfile: (profile: Partial<FarmerProfileData>) => void;
  updateBuyerProfile: (profile: Partial<BuyerProfileData>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: (() => {
    try {
      const saved = localStorage.getItem('kb_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed;
      }
      return DEFAULT_FARMER_USER;
    } catch {
      return DEFAULT_FARMER_USER;
    }
  })(),
  userRole: (() => {
    try {
      const savedUser = localStorage.getItem('kb_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role) return parsed.role as UserRole;
      }
    } catch {}
    return 'FARMER' as UserRole;
  })(),
  farmerProfile: (() => {
    try {
      const saved = localStorage.getItem('kb_farmer_profile');
      return saved ? JSON.parse(saved) : {
        name: 'Ramesh Patel',
        mobile: '+91 98251 44320',
        state: 'Gujarat',
        district: 'Rajkot',
        village: 'Anandpur',
        farmSizeAcres: 4.5,
        soilType: 'Medium Black Cotton',
        mainCrop: 'Cotton (Bt) & Groundnut',
        preferredLanguage: 'hi',
      };
    } catch {
      return {
        name: 'Ramesh Patel',
        mobile: '+91 98251 44320',
        state: 'Gujarat',
        district: 'Rajkot',
        village: 'Anandpur',
        farmSizeAcres: 4.5,
        soilType: 'Medium Black Cotton',
        mainCrop: 'Cotton (Bt) & Groundnut',
        preferredLanguage: 'hi',
      };
    }
  })(),
  buyerProfile: (() => {
    try {
      const saved = localStorage.getItem('kb_buyer_profile');
      return saved ? { ...DEFAULT_BUYER_PROFILE, ...JSON.parse(saved) } : DEFAULT_BUYER_PROFILE;
    } catch {
      return DEFAULT_BUYER_PROFILE;
    }
  })(),
  setCurrentUser: (user) => {
    if (user) {
      try {
        localStorage.setItem('kb_user', JSON.stringify(user));
        if (user.role === 'BUYER') {
          localStorage.setItem('kb_buyer_user', JSON.stringify(user));
        }
      } catch {}
    } else {
      localStorage.removeItem('kb_user');
    }
    set({ currentUser: user });
  },
  setUserRole: (role) => {
    set({ userRole: role });
  },
  updateProfile: (profile) => {
    set((state) => {
      const merged = { ...state.farmerProfile, ...profile };
      try {
        localStorage.setItem('kb_farmer_profile', JSON.stringify(merged));
      } catch {}
      return { farmerProfile: merged };
    });
  },
  updateBuyerProfile: (profile) => {
    set((state) => {
      const merged: BuyerProfileData = { ...state.buyerProfile, ...profile };
      try {
        localStorage.setItem('kb_buyer_profile', JSON.stringify(merged));
      } catch {}
      return { buyerProfile: merged };
    });
  },
}));
