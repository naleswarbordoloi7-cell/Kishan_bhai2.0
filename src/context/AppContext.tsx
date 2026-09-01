import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  X402PaymentRequirement,
  TransactionRecord,
  CropLifecycleItem,
  DiseaseScanResult,
  SmartIrrigationStatus,
  SoilHealthData,
  SoilRecordHistoryItem,
  SoilImprovementPlanItem,
  SoilCropSuitabilityInsight,
  CropDetail,
  CropRecommendationInput,
  CropRecommendationResult,
  MandiPriceRecord,
  FarmDiaryEntry,
  CommunityPost,
  FarmAlert,
  BiometricCredential,
  BiometricSecuritySettings,
  CropPatch,
  PatchTimelineEvent,
} from '../../shared/types.js';
import {
  INITIAL_CROPS,
  DISEASE_KNOWLEDGE_BASE,
  INITIAL_CROP_PATCHES,
  INITIAL_IRRIGATION_STATUS,
  INITIAL_SOIL_HEALTH,
  INITIAL_SOIL_HISTORY,
  SOIL_IMPROVEMENT_PLANS,
  SOIL_CROP_SUITABILITY,
  CROP_RECOMMENDATIONS_DATABASE,
  INITIAL_MANDI_PRICES,
  INITIAL_DIARY_ENTRIES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_FARM_ALERTS,
} from '../data/agriData';
import {
  CacheStats,
  OfflineSyncQueueItem,
  getCacheStatistics,
  syncCriticalFarmDataToCache,
  getOfflineQueue,
  enqueueOfflineAction,
  clearOfflineQueue,
  clearAllCaches,
} from '../services/serviceWorkerRegistration';
import {
  checkBiometricCapability,
  getLocalBiometricSettings,
  saveLocalBiometricSettings,
  getLocalPasskeys,
  saveLocalPasskey,
  registerBiometricPasskey,
  deleteBiometricCredential,
  fetchUserBiometricCredentials,
  BiometricDeviceCapability,
} from '../services/biometricAuth';

interface WalletState {
  address: string;
  mnemonic?: string;
  algos: number;
  balanceAlgo: number;
  usdcBalance: number;
  isConnected: boolean;
  network: 'testnet';
}

export interface FarmerProfileData {
  name: string;
  mobile: string;
  state: string;
  district: string;
  village: string;
  farmSizeAcres: number;
  soilType: string;
  mainCrop: string;
  preferredLanguage: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  farmerProfile: FarmerProfileData;
  updateProfile: (profile: Partial<FarmerProfileData>) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  language: string;
  setLanguage: (lang: string) => void;
  wallet: WalletState;
  setWallet: React.Dispatch<React.SetStateAction<WalletState>>;
  connectDemoWallet: () => Promise<void>;
  createFreshTestnetWallet: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>;
  currentView: string;
  setCurrentView: (view: string) => void;
  pendingPaymentReq: X402PaymentRequirement | null;
  setPendingPaymentReq: (req: X402PaymentRequirement | null) => void;
  paymentCallback: ((proof: { txId: string; sender: string }) => void) | null;
  setPaymentCallback: (cb: any) => void;
  triggerPaymentModal: (req: X402PaymentRequirement, onSettled: (proof: { txId: string; sender: string }) => void) => void;
  toasts: { id: string; title: string; message: string; type: 'success' | 'info' | 'error' }[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  isNfcModalOpen: boolean;
  setIsNfcModalOpen: (open: boolean) => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  isLogoSplashOpen: boolean;
  setIsLogoSplashOpen: (open: boolean) => void;

  // Theme & Low-Light Field Display
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Offline & Service Worker Cache
  isOnline: boolean;
  isOfflineModalOpen: boolean;
  setIsOfflineModalOpen: (open: boolean) => void;
  cacheStats: CacheStats;
  refreshCacheStats: () => Promise<void>;
  syncOfflineData: () => Promise<{ success: boolean; count: number }>;
  clearCacheAndReset: () => Promise<void>;
  offlineQueue: OfflineSyncQueueItem[];
  queueOfflineAction: (type: OfflineSyncQueueItem['type'], payload: any) => void;

  // Biometric Authentication & Passkey State
  isBiometricSupported: boolean;
  biometricCapability: BiometricDeviceCapability | null;
  biometricSettings: BiometricSecuritySettings;
  updateBiometricSettings: (settings: Partial<BiometricSecuritySettings>) => Promise<void>;
  enrolledPasskeys: BiometricCredential[];
  refreshEnrolledPasskeys: () => Promise<void>;
  registerNewPasskey: (deviceName?: string) => Promise<{ success: boolean; credential?: BiometricCredential; error?: string }>;
  deletePasskey: (credentialId: string) => Promise<void>;
  isBiometricModalOpen: boolean;
  setIsBiometricModalOpen: (open: boolean) => void;
  biometricPromptOptions: {
    title?: string;
    subtitle?: string;
    actionReason?: string;
    targetUserId?: string;
    onSuccess?: (user?: UserProfile) => void;
  };
  triggerBiometricPrompt: (options: {
    title?: string;
    subtitle?: string;
    actionReason?: string;
    targetUserId?: string;
    onSuccess: (user?: UserProfile) => void;
  }) => void;

  // Agricultural Modules State
  crops: CropLifecycleItem[];
  addCrop: (crop: CropLifecycleItem) => void;
  updateCrop: (id: string, updates: Partial<CropLifecycleItem>) => void;
  removeCrop: (id: string) => void;

  diseaseScans: DiseaseScanResult[];
  addDiseaseScan: (scan: DiseaseScanResult) => void;

  // Crop Patch Health & Treatment Progress Timeline
  cropPatches: CropPatch[];
  addCropPatch: (patch: Omit<CropPatch, 'id'>) => void;
  updateCropPatch: (patchId: string, updates: Partial<CropPatch>) => void;
  deleteCropPatch: (patchId: string) => void;
  addPatchTimelineEvent: (patchId: string, event: Omit<PatchTimelineEvent, 'id' | 'patchId'>) => void;
  deletePatchTimelineEvent: (patchId: string, eventId: string) => void;
  resetCropPatchesToInitial: () => void;

  irrigationStatus: SmartIrrigationStatus;
  setIrrigationStatus: React.Dispatch<React.SetStateAction<SmartIrrigationStatus>>;
  togglePump: () => void;

  // Soil Health Intelligence
  soilHealth: SoilHealthData;
  setSoilHealth: React.Dispatch<React.SetStateAction<SoilHealthData>>;
  soilHistory: SoilRecordHistoryItem[];
  soilImprovementPlans: SoilImprovementPlanItem[];
  soilCropSuitability: SoilCropSuitabilityInsight;
  saveSoilRecord: (data: Partial<SoilHealthData>) => Promise<void>;
  uploadSoilReport: (base64: string, mimeType?: string) => Promise<Partial<SoilHealthData>>;
  resetSoilToInitial: () => void;

  // Crop Recommendation Intelligence
  cropsCatalog: CropDetail[];
  lastCropRecommendation: CropRecommendationResult | null;
  selectedCropDetailId: string | null;
  setSelectedCropDetailId: (id: string | null) => void;
  runCropRecommendation: (input: CropRecommendationInput) => Promise<CropRecommendationResult>;
  compareCrops: (cropIds: string[]) => Promise<CropDetail[]>;

  mandiPrices: MandiPriceRecord[];
  
  diaryEntries: FarmDiaryEntry[];
  farmDiary: FarmDiaryEntry[];
  addDiaryEntry: (entry: Omit<FarmDiaryEntry, 'id' | 'syncedWithCloud'>) => void;
  deleteDiaryEntry: (id: string) => void;

  communityPosts: CommunityPost[];
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'likesCount' | 'commentsCount' | 'comments' | 'createdAt'>) => void;
  likeCommunityPost: (id: string) => void;
  addCommunityComment: (postId: string, content: string) => void;

  alerts: FarmAlert[];
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;

  pendingAiQuery: string | null;
  setPendingAiQuery: (query: string | null) => void;
  askAiWithPrompt: (prompt: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('kb_user');
      if (saved) return JSON.parse(saved);
      // Default verified farmer profile for instant live demonstration
      return {
        id: 'usr_farmer_ramesh',
        fullName: 'Ramesh Patel',
        email: 'ramesh.patel@kishanbhai.in',
        phone: '+91 98251 44320',
        role: 'FARMER',
        village: 'Anandpur',
        state: 'Gujarat',
        verified: true,
        farmSizeAcres: 4.5,
        crops: ['Cotton (Bt)', 'Groundnut (GG-20)', 'Wheat (Sharbati)'],
        preferredLanguage: 'hi',
        walletAddress: 'ALGO_TESTNET_DEMO_WALLET_7X9A',
        createdAt: '2026-06-15T08:30:00Z',
      };
    } catch {
      return null;
    }
  });

  const [userRole, setUserRole] = useState<UserRole>('FARMER');
  const [language, setLanguage] = useState<string>('hi');
  const [currentView, setCurrentView] = useState<string>('farmer-dashboard');
  const [pendingPaymentReq, setPendingPaymentReq] = useState<X402PaymentRequirement | null>(null);
  const [paymentCallback, setPaymentCallback] = useState<((proof: { txId: string; sender: string }) => void) | null>(null);
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isLogoSplashOpen, setIsLogoSplashOpen] = useState(() => {
    try {
      return sessionStorage.getItem('kb_logo_splash_seen') !== 'true';
    } catch {
      return true;
    }
  });

  // Theme & Low-Light Field Display State
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('kb_theme_mode');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
      return 'system';
    } catch {
      return 'system';
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedMode = localStorage.getItem('kb_theme_mode');
      if (savedMode === 'dark') return true;
      if (savedMode === 'light') return false;
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const updateTheme = () => {
      let activeDark = false;
      if (themeMode === 'dark') {
        activeDark = true;
      } else if (themeMode === 'light') {
        activeDark = false;
      } else {
        activeDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDarkMode(activeDark);

      if (activeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Update mobile status bar theme-color
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', activeDark ? '#0d120c' : '#1B3B1B');
      }
    };

    updateTheme();
    try {
      localStorage.setItem('kb_theme_mode', themeMode);
    } catch (e) {
      console.warn('Could not persist theme mode:', e);
    }

    if (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const setThemeMode = useCallback((mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setThemeModeState((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'dark';
      // If currently system, toggle opposite of current calculated dark state
      return isDarkMode ? 'light' : 'dark';
    });
  }, [isDarkMode]);

  // Offline Connectivity & Service Worker Cache State
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    coreAssets: 0,
    dataEndpoints: 0,
    fontAssets: 0,
    version: '2.0.0',
    isReady: false,
  });
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncQueueItem[]>(() => getOfflineQueue());

  const refreshCacheStats = useCallback(async () => {
    try {
      const stats = await getCacheStatistics();
      setCacheStats(stats);
    } catch (e) {
      console.warn('Failed to get cache statistics:', e);
    }
  }, []);

  const syncOfflineData = useCallback(async () => {
    try {
      const res = await syncCriticalFarmDataToCache();
      await refreshCacheStats();
      if (res.success) {
        addToast(
          'Offline Farm Pack Synced',
          `Cached ${res.count} critical agricultural datasets for full offline field operations.`,
          'success'
        );
      }
      return res;
    } catch (e) {
      addToast('Offline Sync Failed', 'Could not cache agricultural pack. Retrying on next connection.', 'error');
      return { success: false, count: 0 };
    }
  }, [refreshCacheStats]);

  const clearCacheAndReset = useCallback(async () => {
    await clearAllCaches();
    clearOfflineQueue();
    setOfflineQueue([]);
    await refreshCacheStats();
    addToast('Cache Cleared', 'All offline cache assets reset.', 'info');
  }, [refreshCacheStats]);

  const queueOfflineAction = useCallback((type: OfflineSyncQueueItem['type'], payload: any) => {
    const item = enqueueOfflineAction(type, payload);
    setOfflineQueue((prev) => [...prev, item]);
    addToast(
      'Saved in Offline Mode',
      'Your entry was saved locally and will automatically synchronize when network is restored.',
      'info'
    );
  }, []);

  // Online / Offline Network Listeners
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      addToast('Online Connection Restored', 'Syncing your farm records with cloud network...', 'success');
      
      // Auto-sync cached datasets
      await syncCriticalFarmDataToCache();
      await refreshCacheStats();

      // Process any pending offline items
      const pendingItems = getOfflineQueue();
      if (pendingItems.length > 0) {
        addToast('Offline Actions Synced', `Successfully pushed ${pendingItems.length} offline farm records.`, 'success');
        clearOfflineQueue();
        setOfflineQueue([]);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast(
        'Offline Mode Active',
        'Running on Service Worker Cache. Mandi prices, soil guide & crop diagnostics available offline.',
        'info'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of cache statistics
    refreshCacheStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshCacheStats]);

  const handleSetIsLogoSplashOpen = (open: boolean) => {
    setIsLogoSplashOpen(open);
    if (!open) {
      try {
        sessionStorage.setItem('kb_logo_splash_seen', 'true');
      } catch {}
    }
  };

  // Biometric Authentication & Passkey State
  const [biometricCapability, setBiometricCapability] = useState<BiometricDeviceCapability | null>(null);
  const [biometricSettings, setBiometricSettings] = useState<BiometricSecuritySettings>(() => getLocalBiometricSettings());
  const [enrolledPasskeys, setEnrolledPasskeys] = useState<BiometricCredential[]>(() => getLocalPasskeys());
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [biometricPromptOptions, setBiometricPromptOptions] = useState<{
    title?: string;
    subtitle?: string;
    actionReason?: string;
    targetUserId?: string;
    onSuccess?: (user?: UserProfile) => void;
  }>({});

  useEffect(() => {
    checkBiometricCapability().then((cap) => {
      setBiometricCapability(cap);
    });
  }, []);

  const refreshEnrolledPasskeys = useCallback(async () => {
    if (currentUser?.id) {
      const creds = await fetchUserBiometricCredentials(currentUser.id);
      setEnrolledPasskeys(creds);
    } else {
      setEnrolledPasskeys(getLocalPasskeys());
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refreshEnrolledPasskeys();
  }, [refreshEnrolledPasskeys]);

  const updateBiometricSettings = useCallback(
    async (newSettings: Partial<BiometricSecuritySettings>) => {
      const merged = { ...biometricSettings, ...newSettings };
      setBiometricSettings(merged);
      saveLocalBiometricSettings(merged);

      if (currentUser?.id) {
        try {
          await fetch('/api/auth/biometric/update-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, settings: merged }),
          });
        } catch {}
      }

      addToast(
        'Biometric Security Updated',
        'Your biometric verification preferences have been saved.',
        'success'
      );
    },
    [biometricSettings, currentUser?.id, addToast]
  );

  const registerNewPasskey = useCallback(
    async (customDeviceName?: string) => {
      const targetUser = currentUser || {
        id: 'usr_farmer_ramesh',
        fullName: 'Ramesh Patel',
        email: 'ramesh.patel@kishanbhai.in',
        role: 'FARMER',
      };

      const result = await registerBiometricPasskey({
        id: targetUser.id,
        email: targetUser.email,
        fullName: targetUser.fullName,
        role: targetUser.role,
      });

      if (result.success && result.credential) {
        await refreshEnrolledPasskeys();
        addToast(
          'Biometric Passkey Enrolled',
          `Successfully registered ${result.credential.deviceName} with hardware protection.`,
          'success'
        );
      } else {
        addToast('Enrollment Failed', result.error || 'Could not enroll biometric passkey.', 'error');
      }

      return result;
    },
    [currentUser, refreshEnrolledPasskeys, addToast]
  );

  const deletePasskey = useCallback(
    async (credentialId: string) => {
      await deleteBiometricCredential(credentialId, currentUser?.id);
      await refreshEnrolledPasskeys();
      addToast('Passkey Revoked', 'Biometric credential removed from this account.', 'info');
    },
    [currentUser?.id, refreshEnrolledPasskeys, addToast]
  );

  const triggerBiometricPrompt = useCallback(
    (options: {
      title?: string;
      subtitle?: string;
      actionReason?: string;
      targetUserId?: string;
      onSuccess: (user?: UserProfile) => void;
    }) => {
      setBiometricPromptOptions(options);
      setIsBiometricModalOpen(true);
    },
    []
  );

  // Agricultural module states with local persistence
  const [crops, setCrops] = useState<CropLifecycleItem[]>(() => {
    try {
      const saved = localStorage.getItem('kb_crops');
      return saved ? JSON.parse(saved) : INITIAL_CROPS;
    } catch {
      return INITIAL_CROPS;
    }
  });

  const [diseaseScans, setDiseaseScans] = useState<DiseaseScanResult[]>(() => {
    try {
      const saved = localStorage.getItem('kb_scans');
      return saved ? JSON.parse(saved) : DISEASE_KNOWLEDGE_BASE;
    } catch {
      return DISEASE_KNOWLEDGE_BASE;
    }
  });

  const [cropPatches, setCropPatches] = useState<CropPatch[]>(() => {
    try {
      const saved = localStorage.getItem('kb_crop_patches');
      return saved ? JSON.parse(saved) : INITIAL_CROP_PATCHES;
    } catch {
      return INITIAL_CROP_PATCHES;
    }
  });

  const [irrigationStatus, setIrrigationStatus] = useState<SmartIrrigationStatus>(INITIAL_IRRIGATION_STATUS);
  const [soilHealth, setSoilHealth] = useState<SoilHealthData>(() => {
    try {
      const saved = localStorage.getItem('kb_soil_health');
      return saved ? JSON.parse(saved) : INITIAL_SOIL_HEALTH;
    } catch {
      return INITIAL_SOIL_HEALTH;
    }
  });

  const [soilHistory, setSoilHistory] = useState<SoilRecordHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kb_soil_history');
      return saved ? JSON.parse(saved) : INITIAL_SOIL_HISTORY;
    } catch {
      return INITIAL_SOIL_HISTORY;
    }
  });

  const [soilImprovementPlans] = useState<SoilImprovementPlanItem[]>(SOIL_IMPROVEMENT_PLANS);
  const [soilCropSuitability] = useState<SoilCropSuitabilityInsight>(SOIL_CROP_SUITABILITY);
  const [cropsCatalog] = useState<CropDetail[]>(CROP_RECOMMENDATIONS_DATABASE);
  const [lastCropRecommendation, setLastCropRecommendation] = useState<CropRecommendationResult | null>(() => {
    try {
      const saved = localStorage.getItem('kb_last_crop_rec');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedCropDetailId, setSelectedCropDetailId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('kb_soil_health', JSON.stringify(soilHealth));
  }, [soilHealth]);

  useEffect(() => {
    localStorage.setItem('kb_soil_history', JSON.stringify(soilHistory));
  }, [soilHistory]);

  useEffect(() => {
    if (lastCropRecommendation) {
      localStorage.setItem('kb_last_crop_rec', JSON.stringify(lastCropRecommendation));
    }
  }, [lastCropRecommendation]);

  const saveSoilRecord = async (data: Partial<SoilHealthData>) => {
    try {
      const res = await fetch('/api/soil/save-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.soilHealth) {
          setSoilHealth(resData.soilHealth);
        }
        if (resData.historyRecord) {
          setSoilHistory((prev) => [resData.historyRecord, ...prev]);
        }
        addToast('Soil Record Saved', `Soil Health Score: ${resData.soilHealth?.soilHealthScore || 80}/100 updated.`, 'success');
        return;
      }
    } catch (e) {
      console.warn('Backend save record failed, applying locally:', e);
    }

    // Local fallback
    setSoilHealth((prev) => ({
      ...prev,
      ...data,
      lastUpdated: new Date().toISOString().split('T')[0],
    }));
    addToast('Soil Record Updated', 'Your soil profile metrics have been updated.', 'success');
  };

  const uploadSoilReport = async (base64: string, mimeType: string = 'image/jpeg'): Promise<Partial<SoilHealthData>> => {
    try {
      const res = await fetch('/api/soil/upload-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data: base64, mimeType }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.extractedData) {
          addToast('Soil Report Parsed', 'Nutrients and pH successfully extracted from document.', 'success');
          return resData.extractedData;
        }
      }
    } catch (e) {
      console.warn('Soil upload API error, fallback to parsed values:', e);
    }

    // High quality offline fallback
    addToast('Soil Report Loaded', 'Sample Soil Health Card parameters loaded.', 'info');
    return {
      soilPh: 7.4,
      organicCarbonPct: 0.64,
      nitrogenKgHa: 172,
      phosphorusKgHa: 26,
      potassiumKgHa: 345,
      electricalConductivityDsM: 0.44,
      soilType: 'Medium Black Cotton (Vertisols)',
    };
  };

  const resetSoilToInitial = () => {
    setSoilHealth(INITIAL_SOIL_HEALTH);
    setSoilHistory(INITIAL_SOIL_HISTORY);
    localStorage.removeItem('kb_soil_health');
    localStorage.removeItem('kb_soil_history');
    addToast('Soil Reset', 'Reset to baseline Soil Health Card.', 'info');
  };

  const runCropRecommendation = async (input: CropRecommendationInput): Promise<CropRecommendationResult> => {
    try {
      const res = await fetch('/api/crops/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setLastCropRecommendation(data.result);
          addToast('Crop Analysis Complete', `Top recommendation: ${data.result.topCrops[0]?.cropName}`, 'success');
          return data.result;
        }
      }
    } catch (e) {
      console.warn('Crop recommend API error, computing locally:', e);
    }

    // Fast client-side fallback
    const ranked = [...CROP_RECOMMENDATIONS_DATABASE].sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    const fallbackResult: CropRecommendationResult = {
      topCrops: ranked,
      aiAdvice: {
        kisanBhaiAdvice: `Based on your farm in ${input.district || 'Rajkot'}, ${input.state || 'Gujarat'} with ${input.soilType || 'Black'} soil and ${input.availableWater || 'Moderate'} water supply, ${ranked[0].cropName} (${ranked[0].hindiName}) is your top recommended crop.`,
        whyReasons: [
          `${ranked[0].cropName} yields estimated ₹${ranked[0].estimatedProfitPerAcre.toLocaleString('en-IN')}/acre with low risk profile.`,
          `Optimal match for your ${input.soilType || 'Vertisol'} soil texture and current season.`,
          `Strong local APMC Mandi demand with government procurement security.`,
        ],
        topPickName: ranked[0].cropName,
        seasonalNote: `Sowing window is optimal during ${ranked[0].sowingPeriod}.`,
        resourceAlignment: `Budget requirement of ₹${ranked[0].estimatedCostPerAcre.toLocaleString('en-IN')}/acre fits within your parameters.`,
      },
      inputSummary: input,
      timestamp: new Date().toISOString(),
      isDemo: false,
    };
    setLastCropRecommendation(fallbackResult);
    addToast('Crop Recommendation Ready', `Top match: ${ranked[0].cropName}`, 'success');
    return fallbackResult;
  };

  const compareCrops = async (cropIds: string[]): Promise<CropDetail[]> => {
    return CROP_RECOMMENDATIONS_DATABASE.filter((c) => cropIds.includes(c.id));
  };
  const [mandiPrices, setMandiPrices] = useState<MandiPriceRecord[]>(INITIAL_MANDI_PRICES);

  const [diaryEntries, setDiaryEntries] = useState<FarmDiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('kb_diary');
      return saved ? JSON.parse(saved) : INITIAL_DIARY_ENTRIES;
    } catch {
      return INITIAL_DIARY_ENTRIES;
    }
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem('kb_posts');
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
    } catch {
      return INITIAL_COMMUNITY_POSTS;
    }
  });

  const [alerts, setAlerts] = useState<FarmAlert[]>(() => {
    try {
      const saved = localStorage.getItem('kb_alerts');
      return saved ? JSON.parse(saved) : INITIAL_FARM_ALERTS;
    } catch {
      return INITIAL_FARM_ALERTS;
    }
  });

  // Clean Algorand Testnet Wallet State
  const [wallet, setWallet] = useState<WalletState>(() => {
    try {
      const saved = localStorage.getItem('kb_wallet');
      return saved ? JSON.parse(saved) : {
        address: 'ALGO_RAMESH_PATEL_SAURASHTRA_NODE_982',
        mnemonic: '',
        algos: 4.85,
        balanceAlgo: 4.85,
        usdcBalance: 12.50,
        isConnected: true,
        network: 'testnet',
      };
    } catch {
      return {
        address: '',
        mnemonic: '',
        algos: 0,
        balanceAlgo: 0,
        usdcBalance: 0,
        isConnected: false,
        network: 'testnet',
      };
    }
  });

  const [farmerProfile, setFarmerProfile] = useState<FarmerProfileData>(() => {
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
  });

  const updateProfile = (profile: Partial<FarmerProfileData>) => {
    setFarmerProfile((prev) => {
      const updated = { ...prev, ...profile };
      localStorage.setItem('kb_farmer_profile', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kb_user', JSON.stringify(currentUser));
      setUserRole(currentUser.role);
    } else {
      localStorage.removeItem('kb_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kb_crops', JSON.stringify(crops));
  }, [crops]);

  useEffect(() => {
    localStorage.setItem('kb_scans', JSON.stringify(diseaseScans));
  }, [diseaseScans]);

  useEffect(() => {
    localStorage.setItem('kb_crop_patches', JSON.stringify(cropPatches));
  }, [cropPatches]);

  useEffect(() => {
    localStorage.setItem('kb_diary', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem('kb_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    localStorage.setItem('kb_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const triggerPaymentModal = (req: X402PaymentRequirement, onSettled: (proof: { txId: string; sender: string }) => void) => {
    setPendingPaymentReq(req);
    setPaymentCallback(() => onSettled);
  };

  const addCrop = (crop: CropLifecycleItem) => {
    setCrops((prev) => [crop, ...prev]);
    addToast('Crop Registered', `${crop.cropName} added to your active cultivation roster.`, 'success');
  };

  const updateCrop = (id: string, updates: Partial<CropLifecycleItem>) => {
    setCrops((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addToast('Crop Updated', 'Crop progress and agronomical status updated.', 'info');
  };

  const removeCrop = (id: string) => {
    setCrops((prev) => prev.filter((c) => c.id !== id));
    addToast('Crop Removed', 'Crop removed from your roster.', 'info');
  };

  const addDiseaseScan = (scan: DiseaseScanResult) => {
    setDiseaseScans((prev) => [scan, ...prev]);
    addToast('Diagnosis Recorded', `${scan.pathogen.split('(')[0]} recorded in health logs.`, 'success');
  };

  // Crop Patch Health & Treatment Progress Timeline Management
  const addCropPatch = (patchData: Omit<CropPatch, 'id'>) => {
    const newPatch: CropPatch = {
      ...patchData,
      id: `patch_${Date.now()}`,
    };
    setCropPatches((prev) => [newPatch, ...prev]);
    addToast('Patch Registered', `${newPatch.name} added to your field tracking roster.`, 'success');
  };

  const updateCropPatch = (patchId: string, updates: Partial<CropPatch>) => {
    setCropPatches((prev) =>
      prev.map((patch) => (patch.id === patchId ? { ...patch, ...updates } : patch))
    );
    addToast('Patch Updated', 'Crop patch health status has been updated.', 'info');
  };

  const deleteCropPatch = (patchId: string) => {
    setCropPatches((prev) => prev.filter((patch) => patch.id !== patchId));
    addToast('Patch Removed', 'Crop patch removed from health tracking.', 'info');
  };

  const addPatchTimelineEvent = (
    patchId: string,
    eventData: Omit<PatchTimelineEvent, 'id' | 'patchId'>
  ) => {
    const newEvent: PatchTimelineEvent = {
      ...eventData,
      id: `evt_${Date.now()}`,
      patchId,
    };

    setCropPatches((prev) =>
      prev.map((patch) => {
        if (patch.id === patchId) {
          const updatedEvents = [newEvent, ...patch.timelineEvents].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Recalculate patch current status and health score based on latest event
          const latestEvent = updatedEvents[updatedEvents.length - 1];
          const newHealthScore = latestEvent.healthScore ?? patch.currentHealthScore;
          const newRecoveryRate = latestEvent.recoveryRatePct ?? patch.overallRecoveryPct;
          const newSeverity = latestEvent.severity;

          let newStatus = patch.currentStatus;
          if (newSeverity === 'HEALTHY' || newRecoveryRate >= 90) {
            newStatus = 'HEALTHY';
          } else if (newEvent.type === 'TREATMENT_SPRAY' || newEvent.type === 'SOIL_APPLICATION') {
            newStatus = 'TREATMENT_ACTIVE';
          } else if (newRecoveryRate > 40) {
            newStatus = 'RECOVERING';
          }

          return {
            ...patch,
            currentHealthScore: newHealthScore,
            overallRecoveryPct: newRecoveryRate,
            currentSeverity: newSeverity,
            currentStatus: newStatus,
            latestImageUrl: newEvent.imageUrl || patch.latestImageUrl,
            timelineEvents: updatedEvents,
          };
        }
        return patch;
      })
    );

    addToast(
      'Timeline Event Logged',
      `${newEvent.title} added to crop patch history.`,
      'success'
    );
  };

  const deletePatchTimelineEvent = (patchId: string, eventId: string) => {
    setCropPatches((prev) =>
      prev.map((patch) => {
        if (patch.id === patchId) {
          return {
            ...patch,
            timelineEvents: patch.timelineEvents.filter((e) => e.id !== eventId),
          };
        }
        return patch;
      })
    );
    addToast('Event Removed', 'Timeline checkpoint removed.', 'info');
  };

  const resetCropPatchesToInitial = () => {
    setCropPatches(INITIAL_CROP_PATCHES);
    localStorage.setItem('kb_crop_patches', JSON.stringify(INITIAL_CROP_PATCHES));
    addToast('Timelines Reset', 'Reset crop patch timelines to demo milestones.', 'info');
  };

  const togglePump = () => {
    setIrrigationStatus((prev) => {
      const nextStatus = prev.pumpStatus === 'RUNNING' ? 'IDLE' : 'RUNNING';
      const isRunning = nextStatus === 'RUNNING';
      addToast(
        isRunning ? 'Solar Smart Pump Started' : 'Pump Stopped',
        isRunning ? 'Irrigation started. Soil moisture will increase gradually.' : 'Pump switched off. Water saved logged.',
        isRunning ? 'success' : 'info'
      );
      return {
        ...prev,
        pumpStatus: nextStatus,
        soilMoisturePct: isRunning ? Math.min(75, prev.soilMoisturePct + 12) : prev.soilMoisturePct,
        irrigationRequired: !isRunning,
      };
    });
  };

  const addDiaryEntry = (entryData: Omit<FarmDiaryEntry, 'id' | 'syncedWithCloud'>) => {
    const newEntry: FarmDiaryEntry = {
      ...entryData,
      id: `diary_${Date.now()}`,
      syncedWithCloud: true,
    };
    setDiaryEntries((prev) => [newEntry, ...prev]);
    addToast('Diary Log Added', `${newEntry.title} saved to your seasonal farm log.`, 'success');
  };

  const deleteDiaryEntry = (id: string) => {
    setDiaryEntries((prev) => prev.filter((e) => e.id !== id));
    addToast('Log Deleted', 'Diary entry removed.', 'info');
  };

  const addCommunityPost = (postData: Omit<CommunityPost, 'id' | 'likesCount' | 'commentsCount' | 'comments' | 'createdAt'>) => {
    const newPost: CommunityPost = {
      ...postData,
      id: `post_${Date.now()}`,
      likesCount: 1,
      commentsCount: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      isLiked: true,
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
    addToast('Post Published', 'Your question/story is now visible to regional farmers.', 'success');
  };

  const likeCommunityPost = (id: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );
  };

  const addCommunityComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: currentUser?.fullName || 'Ramesh Patel',
      authorRole: currentUser?.role === 'CHAMPION' ? 'Village Champion' : 'Farmer',
      village: currentUser?.village || 'Anandpur',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );
    addToast('Comment Posted', 'Your reply has been added.', 'success');
  };

  const markAlertAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const markAllAlertsAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    addToast('Alerts Cleared', 'All notifications marked as read.', 'info');
  };

  const refreshWalletBalance = async () => {
    if (!wallet.address) return;
    try {
      const res = await fetch(`/api/wallet/account-info?address=${wallet.address}`);
      if (res.ok) {
        const info = await res.json();
        setWallet((prev) => ({
          ...prev,
          algos: info.algos !== undefined ? info.algos : prev.algos,
          usdcBalance: info.usdcBalance !== undefined ? info.usdcBalance : prev.usdcBalance,
        }));
      }
    } catch (e) {
      console.warn('Balance refresh failed:', e);
    }
  };

  const createFreshTestnetWallet = async () => {
    try {
      const res = await fetch('/api/wallet/generate-account', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const newWallet: WalletState = {
          address: data.addr,
          mnemonic: data.mnemonic,
          algos: 0,
          balanceAlgo: 0,
          usdcBalance: 0,
          isConnected: true,
          network: 'testnet',
        };
        setWallet(newWallet);
        addToast('New Testnet Account Created', `Address: ${data.addr.slice(0, 8)}...${data.addr.slice(-6)}. Fund with Testnet ALGO/USDC.`, 'success');
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  const connectDemoWallet = async () => {
    await createFreshTestnetWallet();
  };

  const [pendingAiQuery, setPendingAiQuery] = useState<string | null>(null);

  const askAiWithPrompt = (prompt: string) => {
    setPendingAiQuery(prompt);
    setCurrentView('ai-assistant');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        farmerProfile,
        updateProfile,
        userRole,
        setUserRole,
        language,
        setLanguage,
        wallet,
        setWallet,
        connectDemoWallet,
        createFreshTestnetWallet,
        refreshWalletBalance,
        currentView,
        setCurrentView,
        pendingPaymentReq,
        setPendingPaymentReq,
        paymentCallback,
        setPaymentCallback,
        triggerPaymentModal,
        toasts,
        addToast,
        removeToast,
        isNfcModalOpen,
        setIsNfcModalOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isLogoSplashOpen,
        setIsLogoSplashOpen: handleSetIsLogoSplashOpen,
        isOnline,
        isOfflineModalOpen,
        setIsOfflineModalOpen,
        cacheStats,
        refreshCacheStats,
        syncOfflineData,
        clearCacheAndReset,
        offlineQueue,
        queueOfflineAction,
        isBiometricSupported: Boolean(biometricCapability?.supported),
        biometricCapability,
        biometricSettings,
        updateBiometricSettings,
        enrolledPasskeys,
        refreshEnrolledPasskeys,
        registerNewPasskey,
        deletePasskey,
        isBiometricModalOpen,
        setIsBiometricModalOpen,
        biometricPromptOptions,
        triggerBiometricPrompt,
        themeMode,
        setThemeMode,
        isDarkMode,
        toggleDarkMode,
        crops,
        addCrop,
        updateCrop,
        removeCrop,
        diseaseScans,
        addDiseaseScan,
        cropPatches,
        addCropPatch,
        updateCropPatch,
        deleteCropPatch,
        addPatchTimelineEvent,
        deletePatchTimelineEvent,
        resetCropPatchesToInitial,
        irrigationStatus,
        setIrrigationStatus,
        togglePump,
        soilHealth,
        setSoilHealth,
        soilHistory,
        soilImprovementPlans,
        soilCropSuitability,
        saveSoilRecord,
        uploadSoilReport,
        resetSoilToInitial,
        cropsCatalog,
        lastCropRecommendation,
        selectedCropDetailId,
        setSelectedCropDetailId,
        runCropRecommendation,
        compareCrops,
        mandiPrices,
        diaryEntries,
        farmDiary: diaryEntries,
        addDiaryEntry,
        deleteDiaryEntry,
        communityPosts,
        addCommunityPost,
        likeCommunityPost,
        addCommunityComment,
        alerts,
        markAlertAsRead,
        markAllAlertsAsRead,
        pendingAiQuery,
        setPendingAiQuery,
        askAiWithPrompt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

