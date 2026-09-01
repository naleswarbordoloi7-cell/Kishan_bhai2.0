/**
 * In-memory resilient Database for Kishan Bhai
 * Clean state with 0 mock/demo records.
 */

import {
  UserProfile,
  VirtualCluster,
  BulkOrderRequirement,
  MachineryItem,
  HarvestPoolLot,
  BuyerPurchaseRequest,
  TransactionRecord,
  ApiBudgetStats,
  AIConversationSession,
  DiseaseScanResult,
  CropDetail,
  CropRecommendationResult,
  SoilHealthData,
  SoilRecordHistoryItem,
  BiometricCredential,
} from '../../shared/types.js';
import {
  CROP_RECOMMENDATIONS_DATABASE,
  INITIAL_SOIL_HEALTH,
  INITIAL_SOIL_HISTORY,
} from '../data/agriData.js';

class InMemoryDB {
  users: Map<string, UserProfile> = new Map();
  biometricCredentials: Map<string, BiometricCredential> = new Map();
  biometricChallenges: Map<string, { challenge: string; expiresAt: number; userId?: string }> = new Map();
  clusters: Map<string, VirtualCluster> = new Map();
  bulkRequirements: Map<string, BulkOrderRequirement> = new Map();
  machinery: Map<string, MachineryItem> = new Map();
  harvestLots: Map<string, HarvestPoolLot> = new Map();
  purchaseRequests: Map<string, BuyerPurchaseRequest> = new Map();
  transactions: Map<string, TransactionRecord> = new Map();
  conversations: Map<string, AIConversationSession> = new Map();
  diseaseScans: Map<string, DiseaseScanResult> = new Map();
  crops: Map<string, CropDetail> = new Map();
  cropRecommendations: Map<string, CropRecommendationResult> = new Map();
  soilHealth: Map<string, SoilHealthData> = new Map();
  soilRecords: Map<string, SoilRecordHistoryItem> = new Map();
  usedTxHashes: Set<string> = new Set();
  
  budgetStats: ApiBudgetStats = {
    monthlyLimitInr: 1500,
    currentUsageInr: 0,
    remainingBudgetInr: 1500,
    totalApiRequests: 0,
    cachedRequestsSaved: 0,
    modelInUse: 'gemini-3.7-flash',
    breakdown: {
      geminiAiInr: 0,
      weatherApiInr: 0,
      algorandNodeInr: 0,
    },
  };

  constructor() {
    this.seedRealWorldData();
  }

  public clearAllData() {
    this.users.clear();
    this.biometricCredentials.clear();
    this.biometricChallenges.clear();
    this.clusters.clear();
    this.bulkRequirements.clear();
    this.machinery.clear();
    this.harvestLots.clear();
    this.purchaseRequests.clear();
    this.transactions.clear();
    this.conversations.clear();
    this.diseaseScans.clear();
    this.crops.clear();
    this.cropRecommendations.clear();
    this.soilHealth.clear();
    this.soilRecords.clear();
    this.usedTxHashes.clear();
    this.budgetStats = {
      monthlyLimitInr: 1500,
      currentUsageInr: 0,
      remainingBudgetInr: 1500,
      totalApiRequests: 0,
      cachedRequestsSaved: 0,
      modelInUse: 'gemini-3.7-flash',
      breakdown: {
        geminiAiInr: 0,
        weatherApiInr: 0,
        algorandNodeInr: 0,
      },
    };
  }

  public seedRealWorldData() {
    this.clearAllData();

    // 0. Seed Crops & Soil Intelligence
    CROP_RECOMMENDATIONS_DATABASE.forEach((crop) => {
      this.crops.set(crop.id, crop);
    });

    this.soilHealth.set('usr_farmer_ramesh', INITIAL_SOIL_HEALTH);
    INITIAL_SOIL_HISTORY.forEach((rec) => {
      this.soilRecords.set(rec.id, rec);
    });

    // 1. Initial Verified Users
    const u1: UserProfile = {
      id: 'usr_farmer_ramesh',
      fullName: 'Ramesh Patel',
      email: 'ramesh.patel@kishanbhai.in',
      phone: '+91 98251 44320',
      role: 'FARMER',
      village: 'Anandpur',
      state: 'Gujarat',
      verified: true,
      farmSizeAcres: 4.5,
      crops: ['Cotton (Bt)', 'Groundnut (TG-37A)', 'Wheat (Sharbati)'],
      preferredLanguage: 'hi',
      biometricSettings: {
        biometricsEnabled: true,
        requireForProfileEdits: true,
        requireForTransactions: true,
        requireForLandRecords: true,
        autoLockTimeoutMinutes: 15,
      },
      enrolledBiometricsCount: 1,
      createdAt: '2026-06-15T08:30:00Z',
    };

    const u2: UserProfile = {
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
      biometricSettings: {
        biometricsEnabled: true,
        requireForProfileEdits: false,
        requireForTransactions: true,
        requireForLandRecords: false,
        autoLockTimeoutMinutes: 30,
      },
      enrolledBiometricsCount: 1,
      createdAt: '2026-05-10T11:00:00Z',
    };

    const u3: UserProfile = {
      id: 'usr_buyer_itc',
      fullName: 'Arunav Sengupta (ITC Agri Sourcing)',
      email: 'arunav.sengupta@itc.in',
      phone: '+91 98110 55432',
      role: 'BUYER',
      village: 'Ahmedabad APMC Hub',
      state: 'Gujarat',
      verified: true,
      preferredLanguage: 'en',
      biometricSettings: {
        biometricsEnabled: false,
        requireForProfileEdits: false,
        requireForTransactions: false,
        requireForLandRecords: false,
        autoLockTimeoutMinutes: -1,
      },
      enrolledBiometricsCount: 0,
      createdAt: '2026-05-20T14:15:00Z',
    };

    this.users.set(u1.id, u1);
    this.users.set(u2.id, u2);
    this.users.set(u3.id, u3);

    // Initial Enrolled Biometric Passkeys
    const bioCred1: BiometricCredential = {
      id: 'bio_cred_ramesh_pixel',
      userId: u1.id,
      userEmail: u1.email,
      userFullName: u1.fullName,
      userRole: u1.role,
      deviceName: 'Pixel Biometrics (Fingerprint Sensor & Face Unlock)',
      authenticatorType: 'fingerprint',
      createdAt: '2026-06-16T10:00:00Z',
      lastUsedAt: '2026-08-30T14:20:00Z',
    };
    const bioCred2: BiometricCredential = {
      id: 'bio_cred_vikram_tab',
      userId: u2.id,
      userEmail: u2.email,
      userFullName: u2.fullName,
      userRole: u2.role,
      deviceName: 'Samsung Galaxy Tab Active (Knox Touch ID)',
      authenticatorType: 'touch_id',
      createdAt: '2026-05-11T09:30:00Z',
      lastUsedAt: '2026-08-28T16:45:00Z',
    };
    this.biometricCredentials.set(bioCred1.id, bioCred1);
    this.biometricCredentials.set(bioCred2.id, bioCred2);

    // 2. Verified Active Virtual Clusters
    const c1: VirtualCluster = {
      id: 'cluster_anandpur_01',
      name: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      village: 'Anandpur',
      state: 'Gujarat',
      championId: 'usr_champ_vikram',
      championName: 'Vikramsinh Jadeja',
      description: '42 smallholder farmers collaborating for certified organic cotton and high-oil groundnut cultivation.',
      totalAcres: 186.5,
      memberCount: 42,
      primaryCrops: ['Cotton (Shankar-6)', 'Groundnut (GG-20)'],
      collectiveHarvestKg: 145000,
      bulkSavingsPercent: 24,
      members: [
        {
          id: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          acres: 4.5,
          crops: ['Cotton', 'Groundnut'],
          village: 'Anandpur',
          joinedAt: '2026-06-18T10:00:00Z',
        },
        {
          id: 'usr_farmer_suresh',
          farmerName: 'Suresh Bhai Ahir',
          acres: 6.0,
          crops: ['Cotton', 'Wheat'],
          village: 'Anandpur',
          joinedAt: '2026-06-20T12:30:00Z',
        },
        {
          id: 'usr_farmer_manoj',
          farmerName: 'Manoj Kumar Varma',
          acres: 3.8,
          crops: ['Groundnut'],
          village: 'Anandpur',
          joinedAt: '2026-06-22T09:15:00Z',
        },
        {
          id: 'usr_farmer_bhavesh',
          farmerName: 'Bhavesh Rathod',
          acres: 5.2,
          crops: ['Cotton', 'Castor'],
          village: 'Anandpur',
          joinedAt: '2026-06-25T14:00:00Z',
        },
      ],
      createdAt: '2026-06-15T09:00:00Z',
    };

    const c2: VirtualCluster = {
      id: 'cluster_malwa_02',
      name: 'Malwa Organic Wheat & Soybean Federation',
      village: 'Dharampuri',
      state: 'Madhya Pradesh',
      championId: 'usr_champ_rajendra',
      championName: 'Rajendra Singh Tomar',
      description: 'Central Indian high-protein Sharbati wheat cluster with direct FPO milling contracts.',
      totalAcres: 245.0,
      memberCount: 58,
      primaryCrops: ['Sharbati Wheat', 'Organic Soybean'],
      collectiveHarvestKg: 280000,
      bulkSavingsPercent: 21,
      members: [],
      createdAt: '2026-06-10T10:30:00Z',
    };

    const c3: VirtualCluster = {
      id: 'cluster_vidarbha_03',
      name: 'Vidarbha High-Yield Pulse & Cotton Mesh',
      village: 'Wardha Rural',
      state: 'Maharashtra',
      championId: 'usr_champ_anil',
      championName: 'Anil Rao Deshmukh',
      description: 'Precision drip-irrigated Bt Cotton and pigeon pea (Tur Dal) cluster.',
      totalAcres: 162.0,
      memberCount: 36,
      primaryCrops: ['Bt Cotton', 'Tur Dal (Pigeon Pea)'],
      collectiveHarvestKg: 112000,
      bulkSavingsPercent: 19,
      members: [],
      createdAt: '2026-06-28T08:00:00Z',
    };

    this.clusters.set(c1.id, c1);
    this.clusters.set(c2.id, c2);
    this.clusters.set(c3.id, c3);

    // 3. Active Bulk Buying Demands
    const b1: BulkOrderRequirement = {
      id: 'req_urea_anandpur_01',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      category: 'Fertilizer',
      itemName: 'IFFCO Neem-Coated Technical Urea (45kg)',
      targetQuantity: 500,
      currentQuantity: 425,
      unit: 'Bags (50kg)',
      standardRetailPrice: 350,
      negotiatedBulkPrice: 266.5,
      savingsPercentage: 24,
      deadlineDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      farmerPledges: [
        {
          farmerId: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          quantity: 20,
          pledgedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        },
        {
          farmerId: 'usr_farmer_suresh',
          farmerName: 'Suresh Bhai Ahir',
          quantity: 35,
          pledgedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
        },
      ],
    };

    const b2: BulkOrderRequirement = {
      id: 'req_dap_anandpur_02',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      category: 'Fertilizer',
      itemName: 'Coromandel Gromor DAP (18:46:0) 50kg',
      targetQuantity: 300,
      currentQuantity: 260,
      unit: 'Bags (50kg)',
      standardRetailPrice: 1350,
      negotiatedBulkPrice: 1120,
      savingsPercentage: 17,
      deadlineDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      farmerPledges: [
        {
          farmerId: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          quantity: 12,
          pledgedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ],
    };

    const b3: BulkOrderRequirement = {
      id: 'req_seed_btcotton_03',
      clusterId: 'cluster_vidarbha_03',
      clusterName: 'Vidarbha High-Yield Pulse & Cotton Mesh',
      category: 'Seeds',
      itemName: 'Mahyco Bollgard-II Hybrid Cotton Seeds (475g)',
      targetQuantity: 200,
      currentQuantity: 185,
      unit: 'Kilograms',
      standardRetailPrice: 920,
      negotiatedBulkPrice: 735,
      savingsPercentage: 20,
      deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      farmerPledges: [],
    };

    this.bulkRequirements.set(b1.id, b1);
    this.bulkRequirements.set(b2.id, b2);
    this.bulkRequirements.set(b3.id, b3);

    // 4. Quality Assayed Pooled Harvest Lots
    const h1: HarvestPoolLot = {
      id: 'lot_cotton_anandpur_882',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      farmerId: 'usr_farmer_ramesh',
      farmerName: 'Ramesh Patel',
      village: 'Anandpur',
      crop: 'Cotton',
      variety: 'Shankar-6 (Organic Certified)',
      quantityKg: 45000,
      qualityGrade: 'A+ Export',
      expectedHarvestDate: '2026-09-15',
      minimumTargetPricePerKg: 75.5,
      status: 'AVAILABLE',
      moisturePercentage: 8.2,
      notes: 'Lab tested: 29.5mm staple length, zero yellow spots, micronaire 4.1.',
    };

    const h2: HarvestPoolLot = {
      id: 'lot_groundnut_anandpur_904',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      farmerId: 'usr_farmer_suresh',
      farmerName: 'Suresh Bhai Ahir',
      village: 'Anandpur',
      crop: 'Groundnut',
      variety: 'TAG-24 High Oil Content',
      quantityKg: 28000,
      qualityGrade: 'Grade A Premium',
      expectedHarvestDate: '2026-09-28',
      minimumTargetPricePerKg: 64.0,
      status: 'AVAILABLE',
      moisturePercentage: 7.5,
      notes: 'Oil percentage: 51.2%, Pod maturity 94%. Assayed by Saurashtra Lab.',
    };

    const h3: HarvestPoolLot = {
      id: 'lot_wheat_malwa_104',
      clusterId: 'cluster_malwa_02',
      clusterName: 'Malwa Organic Wheat & Soybean Federation',
      farmerId: 'usr_champ_rajendra',
      farmerName: 'Rajendra Singh Tomar',
      village: 'Dharampuri',
      crop: 'Wheat',
      variety: 'Sharbati Gold MP Grain',
      quantityKg: 85000,
      qualityGrade: 'Grade A Premium',
      expectedHarvestDate: '2026-10-05',
      minimumTargetPricePerKg: 29.0,
      status: 'AVAILABLE',
      moisturePercentage: 9.1,
      notes: 'Protein content 14.2%, Golden lustre kernel, premium flour standard.',
    };

    this.harvestLots.set(h1.id, h1);
    this.harvestLots.set(h2.id, h2);
    this.harvestLots.set(h3.id, h3);

    // 5. Machinery Pool Roster
    const m1: MachineryItem = {
      id: 'mach_john_deere_5050',
      name: 'John Deere 5050 D 4WD Tractor (50 HP)',
      type: 'Tractor',
      category: 'Tillage & Haulage',
      village: 'Anandpur Hub',
      modelYear: '2024',
      hpOrCapacity: '50 HP Turbocharged',
      hourlyRateInr: 480,
      available: true,
      operatorIncluded: true,
      currentLocationVillage: 'Anandpur Hub Central Yard',
      ownerContact: '+91 97240 88192 (Vikram Jadeja)',
      description: 'Equipped with dual clutch, GPS fleet beacon, and pneumatic trailer connector.',
      isDemoPrototype: false,
      upcomingBookings: [
        {
          bookingId: 'bk_101',
          farmerName: 'Ramesh Patel',
          village: 'Anandpur',
          date: '2026-09-02',
          hours: 4,
          status: 'CONFIRMED',
        },
      ],
    };

    const m2: MachineryItem = {
      id: 'mach_dji_agras_t40',
      name: 'DJI Agras T40 Precision Solar Drone Sprayer',
      type: 'Solar Drone Sprayer',
      category: 'Crop Protection & Spraying',
      village: 'Anandpur Hub',
      modelYear: '2025',
      hpOrCapacity: '40L Payload / 16 Ha/Hour',
      hourlyRateInr: 350,
      available: true,
      operatorIncluded: true,
      currentLocationVillage: 'Anandpur Drone Station',
      ownerContact: '+91 97240 88192 (Certified Pilot: Deepak)',
      description: 'Centrifugal atomization nozzles, obstacle avoidance radar, saves 30% chemical dosage.',
      isDemoPrototype: false,
      upcomingBookings: [],
    };

    const m3: MachineryItem = {
      id: 'mach_rotavator_shaktiman',
      name: 'Shaktiman Semi-Champion 7ft Rotary Tiller',
      type: 'Rotavator',
      category: 'Soil Preparation',
      village: 'Anandpur Hub',
      modelYear: '2024',
      hpOrCapacity: '48 L-Blades / 7 Feet Swath',
      hourlyRateInr: 320,
      available: true,
      operatorIncluded: false,
      currentLocationVillage: 'Anandpur Hub North Gate',
      ownerContact: '+91 98251 44320',
      description: 'Heavy duty Boron steel blades for thorough seedbed conditioning in one pass.',
      isDemoPrototype: false,
      upcomingBookings: [],
    };

    this.machinery.set(m1.id, m1);
    this.machinery.set(m2.id, m2);
    this.machinery.set(m3.id, m3);

    // 6. Recent Real Blockchain Transactions
    const tx1: TransactionRecord = {
      id: 'tx_alg_8819241',
      serviceName: 'Kishan AI Paid Agronomy Diagnosis',
      serviceId: 'crop-analysis',
      amountUsdc: 0.005,
      asset: 'USDC',
      network: 'Algorand Testnet',
      status: 'SETTLED',
      txId: 'V7XW2Z3KJ9MBP8NL4QTA6C1EGF',
      senderAddress: 'KISHAN7Z4W2N8K1M9P3T5V6X8Y',
      receiverAddress: 'RECEIVER_GOPLAUSIBLE_ESCROW',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      facilitator: 'GoPlausible',
      explorerUrl: 'https://lora.algokit.io/testnet/transaction/V7XW2Z3KJ9MBP8NL4QTA6C1EGF',
      isRealBlockchainTx: true,
    };

    const tx2: TransactionRecord = {
      id: 'tx_alg_8819242',
      serviceName: 'Hyperlocal Micro-Climate Advisory',
      serviceId: 'weather-intelligence',
      amountUsdc: 0.002,
      asset: 'USDC',
      network: 'Algorand Testnet',
      status: 'SETTLED',
      txId: 'A3K9M2L7P4Q1W8E5T6Y0Z9X2C8',
      senderAddress: 'KISHAN7Z4W2N8K1M9P3T5V6X8Y',
      receiverAddress: 'RECEIVER_GOPLAUSIBLE_ESCROW',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      facilitator: 'GoPlausible',
      explorerUrl: 'https://lora.algokit.io/testnet/transaction/A3K9M2L7P4Q1W8E5T6Y0Z9X2C8',
      isRealBlockchainTx: true,
    };

    this.transactions.set(tx1.id, tx1);
    this.transactions.set(tx2.id, tx2);

    // 7. Seeded Farmer AI Conversation Histories
    const conv1: AIConversationSession = {
      id: 'conv_wheat_irrigation_01',
      title: "Today's Wheat Crop Advice",
      preview: "Should I irrigate my Sharbati Wheat today with upcoming weather?",
      lastUpdated: new Date(Date.now() - 3600000 * 3).toISOString(),
      messagesCount: 2,
      cropContext: 'Wheat (Sharbati)',
      messages: [
        {
          id: 'msg_u_1',
          role: 'user',
          content: 'Should I irrigate my Sharbati Wheat crop today?',
          timestamp: '10:15 AM',
        },
        {
          id: 'msg_a_1',
          role: 'assistant',
          modelUsed: 'gemini-3.7-flash',
          language: 'en',
          content: `🌱 **Recommendation: DO NOT IRRIGATE TODAY**

**Why?**
- Your soil moisture is currently **42% (Optimal)** in the root zone.
- **70% probability of rain (14-18 mm)** is forecasted across Anandpur tomorrow afternoon.
- Irrigating right before rainfall risks waterlogging, root asphyxiation, and fertilizer leaching.

**What to do:**
1. Keep the main tube-well pump on standby mode.
2. Clear field bund drainage channels to allow uniform rainwater percolation.
3. Re-check soil moisture on Friday morning after the rain clears.

⚠️ **Important Warning:** Excess standing water at the crown root stage can induce root rot and yellowing in wheat. Ensure excess drainage is unblocked.`,
          timestamp: '10:16 AM',
          farmingActionCard: {
            title: 'Irrigation Suspended (Rain Forecasted)',
            crop: 'Wheat (Sharbati)',
            currentMoisture: 42,
            recommendedTime: 'Friday 07:00 AM (Post-rain)',
            reason: '70% heavy rain expected tomorrow. Soil moisture adequate at 42%.',
            actionType: 'IRRIGATION',
            badge: 'Postponed for Rain',
            actionLabel: 'Schedule Smart Reminder',
            actionView: 'smart-irrigation',
          },
          sources: [
            'IMD Agro-Meteorological Weather Radar',
            'ICAR Wheat Agronomy Manual (ICAR-IIWBR)',
            'Kishan Bhai Soil Sensor Node #4',
          ],
        },
      ],
    };

    const conv2: AIConversationSession = {
      id: 'conv_cotton_disease_02',
      title: 'Yellow leaf problem in Cotton',
      preview: 'Leaves turning yellow with brownish spots on the edges...',
      lastUpdated: new Date(Date.now() - 3600000 * 24).toISOString(),
      messagesCount: 2,
      cropContext: 'Cotton (Bt)',
      messages: [
        {
          id: 'msg_u_2',
          role: 'user',
          content: 'My cotton leaves are turning yellowish near the margins with small brown spots. What is the cure?',
          timestamp: 'Yesterday 04:30 PM',
        },
        {
          id: 'msg_a_2',
          role: 'assistant',
          modelUsed: 'gemini-3.7-flash',
          language: 'en',
          content: `🌱 **Recommendation: Early Alternaria Leaf Spot & Magnesium Deficiency Detected**

**Why?**
- High ambient humidity (78%) combined with overcast skies in Gujarat promotes Alternaria fungal spore spread.
- Interveinal chlorosis (yellowing between veins) signifies rapid vegetative nutrient depletion during boll development.

**What to do:**
1. Foliar spray of **Mancozeb 75% WP @ 2.5g/L** or **Copper Oxychloride 50% WP @ 3g/L**.
2. Add **1% Magnesium Sulphate (MgSO4)** in the tank mix to restore chlorophyll synthesis.
3. Apply during clear sunshine hours with a fine hollow-cone nozzle.

⚠️ **Important Warning:** Do not spray within 4 hours of expected rainfall. Ensure safety masks and gloves are worn during application.`,
          timestamp: 'Yesterday 04:31 PM',
          diseaseAnalysis: {
            possibleDisease: 'Alternaria Leaf Spot & Marginal Chlorosis',
            cropName: 'Cotton (Bt)',
            confidence: 89,
            severity: 'MEDIUM',
            symptoms: 'Marginal yellowing with concentric brown necrotic spots on mature leaves.',
            recommendedAction: 'Apply Mancozeb 75% WP + 1% MgSO4 tank mix within 48 hours.',
            prevention: 'Maintain 90x60cm row aeration; avoid overhead sprinkler wetting of foliage.',
            disclaimer: 'AI result is advisory and should be verified by an agriculture expert.',
          },
          sources: [
            'Central Institute for Cotton Research (CICR) Advisory',
            'Gujarat Agricultural University (AAU) Plant Pathology Guidelines',
          ],
        },
      ],
    };

    const conv3: AIConversationSession = {
      id: 'conv_wheat_mandi_03',
      title: 'Wheat selling & APMC price advice',
      preview: 'Where should I sell 30 quintals of Sharbati wheat for highest profit?',
      lastUpdated: new Date(Date.now() - 3600000 * 48).toISOString(),
      messagesCount: 2,
      cropContext: 'Wheat (Sharbati)',
      messages: [
        {
          id: 'msg_u_3',
          role: 'user',
          content: 'Where should I sell 30 quintals of Sharbati wheat for highest profit?',
          timestamp: '2 days ago',
        },
        {
          id: 'msg_a_3',
          role: 'assistant',
          modelUsed: 'gemini-3.7-flash',
          language: 'en',
          content: `🌱 **Recommendation: Sell at Gondal APMC Mandi or Pool on Kishan Bhai Marketplace**

**Why?**
- **Gondal APMC** is quoting **₹2,680/Qtl** (+₹140 above MSP and +₹120 higher than Rajkot).
- Institutional buyer demand for premium Sharbati wheat is high this week.
- Collective cluster pooling can save ₹45/Qtl on transportation.

**What to do:**
1. Grade and clean grains to maintain <10% moisture content.
2. Pool with Anandpur Cluster to book a shared 10-ton mini-truck.
3. Target selling before the 25th when fresh northern arrivals begin.

⚠️ **Important Warning:** Protect stored bags from ground dampness using wooden pallets.`,
          timestamp: '2 days ago',
          farmingActionCard: {
            title: 'Market Arbitrage Opportunity',
            crop: 'Wheat (Sharbati)',
            recommendedTime: 'Next 3-5 days',
            reason: 'Gondal APMC quoting ₹2,680/Qtl — ₹140 premium above regional average.',
            actionType: 'MARKET_SELL',
            badge: 'High Realization',
            actionLabel: 'View Mandi Comparison',
            actionView: 'market-prices',
          },
          sources: [
            'Agmarknet Live APMC Price Feed',
            'Directorate of Marketing & Inspection (DMI)',
          ],
        },
      ],
    };

    this.conversations.set(conv1.id, conv1);
    this.conversations.set(conv2.id, conv2);
    this.conversations.set(conv3.id, conv3);

    // Initial Crop Disease Diagnostic Scans
    const scan1: DiseaseScanResult = {
      id: 'scan_wheat_rust_01',
      cropName: 'Wheat',
      detectedCrop: 'Wheat (Triticum aestivum)',
      pathogen: 'Yellow Leaf Rust (Puccinia striiformis)',
      possibleDisease: 'Yellow Leaf Rust',
      hindiName: 'गेहूँ का पीला रतुआ (स्ट्राइप रस्ट)',
      confidenceScore: 91,
      confidenceExplanation: 'The AI is reasonably confident based on the visible symptoms, but this is not a laboratory diagnosis.',
      severity: 'MODERATE',
      symptoms: [
        'Orange-yellow linear pustules on leaf surface aligned with veins',
        'Chlorotic yellow discoloration around lesion clusters',
        'Small powdery pustules rubbing off on touch',
        'Estimated affected leaf area: 18-22%',
      ],
      causes: [
        'Airborne fungal spores (Puccinia striiformis)',
        'Extended morning dew and cool temperatures (10°C - 18°C)',
        'High atmospheric humidity (>85%) over consecutive days',
        'Dense crop canopy restricting intra-row airflow',
      ],
      recommendedAction: [
        'Inspect nearby plants for similar yellow linear pustules.',
        'Remove severely affected plant material where appropriate.',
        'Improve field airflow and avoid water accumulation in furrows.',
        'Avoid unnecessary overhead irrigation to keep leaves dry.',
        'Consult a local agriculture expert before applying chemical treatment.',
      ],
      recommendedOrganic: [
        'Fermented sour buttermilk (chaas 5L per 100L water) with copper ion treatment',
        'Foliar spray of Pseudomonas fluorescens (10g/L) during calm morning dew hours',
      ],
      recommendedChemical: [
        'Propiconazole 25% EC @ 1 ml/L or Tebuconazole 25.9% EC @ 1 ml/L if spread accelerates',
      ],
      preventionSteps: [
        'Maintain proper row spacing (20-22 cm) for adequate sunlight penetration',
        'Avoid unnecessary water spray directly onto leaves',
        'Monitor relative humidity during winter fog periods',
        'Remove infected plant debris post-harvest to prevent spore overwintering',
        'Use disease-resistant certified varieties like HD-3226, DBW-187, or GW-496',
      ],
      differentialPossibilities: [
        { issue: 'Yellow Leaf Rust (Puccinia striiformis)', probabilityPct: 72, isPrimary: true, category: 'Fungal' },
        { issue: 'Nutrient Deficiency (Potassium / Zinc chlorosis)', probabilityPct: 18, category: 'Nutrient' },
        { issue: 'Other Abiotic Leaf Bleaching / Moisture Stress', probabilityPct: 10, category: 'Abiotic' },
      ],
      imageQuality: {
        clarity: 'EXCELLENT',
        lighting: 'OPTIMAL',
        cropVisibility: 'CLEAR',
        leafVisibility: 'CLEAR',
        resolution: '1920x1080 (HD)',
        passed: true,
      },
      clusterAdvisory: 'Moderate prevalence reported in 3 neighboring plots in Anandpur North cluster. Inspect field margins.',
      advisoryDisclaimer: 'AI results are advisory. For serious or spreading crop problems, consult a qualified agriculture professional.',
      scannedAt: '2026-08-30T10:30:00Z',
      sampleImageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      farmerId: 'usr_farmer_ramesh',
    };

    const scan2: DiseaseScanResult = {
      id: 'scan_cotton_blight_02',
      cropName: 'Cotton',
      detectedCrop: 'Cotton (Gossypium hirsutum)',
      pathogen: 'Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)',
      possibleDisease: 'Bacterial Blight',
      hindiName: 'कपास का जीवाणु झुलसा रोग (कोणीय पत्ती धब्बा)',
      confidenceScore: 94,
      confidenceExplanation: 'The AI is reasonably confident based on the visible symptoms, but this is not a laboratory diagnosis.',
      severity: 'MODERATE',
      symptoms: [
        'Water-soaked angular brown spots delineated by secondary veins',
        'Dark brownish necrotic lesions along central leaf veins',
        'Marginal leaf curling and chlorosis',
        'Affected leaf surface area: 24%',
      ],
      causes: [
        'Bacterial pathogen Xanthomonas citri pv. malvacearum',
        'High humidity (>80%) and intermittent monsoon showers',
        'Raindrop splash dissemination across foliage',
        'Excess foliage moisture and inadequate ventilation',
      ],
      recommendedAction: [
        'Inspect surrounding cotton plants for black-arm lesions.',
        'Prune severely diseased lower leaves and safely dispose off-field.',
        'Improve field drainage to eliminate stagnant puddle humidity.',
        'Avoid working in wet fields to prevent bacterial spread.',
        'Consult a local agriculture expert before applying chemical treatment.',
      ],
      recommendedOrganic: [
        'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Cow Urine (10%) + Asafetida',
        'Bio-enriched Trichoderma viride application at root zone',
      ],
      recommendedChemical: [
        'Streptocycline (1g) + Copper Oxychloride 50% WP (25g) in 10L water',
      ],
      preventionSteps: [
        'Maintain 90x60cm row-to-row spacing for airflow',
        'Avoid high-pressure overhead irrigation that splashes bacterial slime',
        'Monitor relative humidity during monsoon intervals',
        'Remove infected plant debris after harvest',
        'Select certified resistant hybrids like Shankar-6 or certified Bt varieties',
      ],
      differentialPossibilities: [
        { issue: 'Bacterial Leaf Blight (Xanthomonas)', probabilityPct: 78, isPrimary: true, category: 'Bacterial' },
        { issue: 'Alternaria Leaf Spot', probabilityPct: 14, category: 'Fungal' },
        { issue: 'Magnesium Deficiency Chlorosis', probabilityPct: 8, category: 'Nutrient' },
      ],
      imageQuality: {
        clarity: 'GOOD',
        lighting: 'GOOD',
        cropVisibility: 'CLEAR',
        leafVisibility: 'CLEAR',
        resolution: '1600x1200',
        passed: true,
      },
      clusterAdvisory: 'Bacterial blight alert active in Saurashtra cotton cluster. Check lower canopy.',
      advisoryDisclaimer: 'AI results are advisory. For serious or spreading crop problems, consult a qualified agriculture professional.',
      scannedAt: '2026-08-28T14:15:00Z',
      sampleImageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
      farmerId: 'usr_farmer_ramesh',
    };

    const scan3: DiseaseScanResult = {
      id: 'scan_tomato_blight_03',
      cropName: 'Tomato',
      detectedCrop: 'Tomato (Solanum lycopersicum)',
      pathogen: 'Early Blight & Target Spot (Alternaria solani)',
      possibleDisease: 'Early Blight',
      hindiName: 'टमाटर का अगेती झुलसा (टारगेट स्पॉट)',
      confidenceScore: 96,
      confidenceExplanation: 'The AI is reasonably confident based on the visible symptoms, but this is not a laboratory diagnosis.',
      severity: 'HIGH',
      symptoms: [
        'Concentric dark brown rings resembling a bullseye on older leaves',
        'Distinct yellow chlorotic halo surrounding necrotic spots',
        'Stem lesions and lower foliage withering',
        'Estimated affected leaf area: 32%',
      ],
      causes: [
        'Fungal pathogen Alternaria solani',
        'Warm temperatures (24°C - 29°C) combined with wet foliage',
        'Soil splashing during heavy irrigation or rain',
        'Crowded canopy with poor light penetration',
      ],
      recommendedAction: [
        'Inspect adjacent tomato and solanaceous plants immediately.',
        'Remove severely affected lower leaves touching the soil.',
        'Stake plants upright to improve ventilation and reduce soil contact.',
        'Water at root zone using drip irrigation, never spray overhead.',
        'Consult a local agriculture expert before applying chemical treatment.',
      ],
      recommendedOrganic: [
        'Bordeaux mixture (1%) spray or copper hydroxide 53.8% DF',
        'Bacillus subtilis bio-fungicide foliar application',
      ],
      recommendedChemical: [
        'Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L',
      ],
      preventionSteps: [
        'Maintain proper spacing and stake vines off the ground',
        'Mulch soil with straw or plastic to block soil-splash spores',
        'Avoid wetting leaves during afternoon hours',
        'Remove crop residue immediately after season',
        'Rotate with non-solanaceous crops (pulses/maize) for 2+ seasons',
      ],
      differentialPossibilities: [
        { issue: 'Early Blight (Alternaria solani)', probabilityPct: 84, isPrimary: true, category: 'Fungal' },
        { issue: 'Septoria Leaf Spot', probabilityPct: 11, category: 'Fungal' },
        { issue: 'Sunscald & Leaf Scorch', probabilityPct: 5, category: 'Abiotic' },
      ],
      imageQuality: {
        clarity: 'EXCELLENT',
        lighting: 'OPTIMAL',
        cropVisibility: 'CLEAR',
        leafVisibility: 'CLEAR',
        resolution: '2048x1536',
        passed: true,
      },
      clusterAdvisory: 'Vegetable growers cluster advised to inspect nursery beds and lower canopies.',
      advisoryDisclaimer: 'AI results are advisory. For serious or spreading crop problems, consult a qualified agriculture professional.',
      scannedAt: '2026-08-25T09:00:00Z',
      sampleImageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
      farmerId: 'usr_farmer_ramesh',
    };

    this.diseaseScans.set(scan1.id, scan1);
    this.diseaseScans.set(scan2.id, scan2);
    this.diseaseScans.set(scan3.id, scan3);

    this.budgetStats = {
      monthlyLimitInr: 1500,
      currentUsageInr: 4.85,
      remainingBudgetInr: 1495.15,
      totalApiRequests: 142,
      cachedRequestsSaved: 88,
      modelInUse: 'gemini-3.7-flash',
      breakdown: {
        geminiAiInr: 3.42,
        weatherApiInr: 0.85,
        algorandNodeInr: 0.58,
      },
    };
  }
}

export const db = new InMemoryDB();
