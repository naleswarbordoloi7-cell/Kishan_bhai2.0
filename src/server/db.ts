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
  ClusterChatMessage,
  SharedClusterCart,
  SharedCartItem,
  SharedCartItemContributor,
  ChampionVerificationRequest,
  ChampionVerificationStatus,
  ChampionDesignation,
  LoyaltyTier,
  LoyaltyActivityType,
  LoyaltyLedgerEntry,
  LoyaltyAccount,
  LoyaltyRewardItem,
  LoyaltyRewardRedemption,
  OrderRating,
  LoyaltyAdminConfig,
} from '../../shared/types.js';
import {
  CROP_RECOMMENDATIONS_DATABASE,
  INITIAL_SOIL_HEALTH,
  INITIAL_SOIL_HISTORY,
} from '../data/agriData.js';

class InMemoryDB {
  users: Map<string, UserProfile> = new Map();
  championVerifications: Map<string, ChampionVerificationRequest> = new Map();
  clusters: Map<string, VirtualCluster> = new Map();
  clusterChatMessages: Map<string, ClusterChatMessage[]> = new Map();
  sharedCarts: Map<string, SharedClusterCart> = new Map();
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
  appointments: Map<string, any> = new Map();
  usedTxHashes: Set<string> = new Set();
  
  // Two-Sided Farmer + Buyer Loyalty Store
  loyaltyAccounts: Map<string, LoyaltyAccount> = new Map();
  loyaltyLedger: Map<string, LoyaltyLedgerEntry> = new Map();
  loyaltyRewards: Map<string, LoyaltyRewardItem> = new Map();
  loyaltyRedemptions: Map<string, LoyaltyRewardRedemption> = new Map();
  processedLoyaltyEvents: Set<string> = new Set();
  orderRatings: Map<string, OrderRating> = new Map();

  loyaltyConfig: LoyaltyAdminConfig = {
    pointsRules: {
      buyerVerification: 50,
      buyerPurchaseCompleted: 100,
      buyerDeliveryConfirmed: 50,
      buyerRatingSubmitted: 20,
      buyerRepeatPurchase: 50,
      farmerVerification: 100,
      farmerSaleCompleted: 100,
      farmerDeliveryConfirmed: 50,
      farmerQualityMaintained: 50,
      farmerRatingReceived: 20,
      repeatTransactionBonus: 50,
    },
    tierThresholds: {
      gold: 500,
      platinum: 1500,
      diamond: 3500,
    },
    fairnessGuarantees: {
      higherTierNeverInflatesCropPrice: true,
      lowerTierFarmersHaveEqualMandiAccess: true,
      serverAuthoritativeLedger: true,
    },
  };
  
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
    this.championVerifications.clear();
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
    this.loyaltyAccounts.clear();
    this.loyaltyLedger.clear();
    this.loyaltyRewards.clear();
    this.loyaltyRedemptions.clear();
    this.processedLoyaltyEvents.clear();
    this.orderRatings.clear();
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
      createdAt: '2026-05-20T14:15:00Z',
    };

    // Candidate Village Champion: Anita Devi (Awaiting final approval / under review)
    const u4: UserProfile = {
      id: 'usr_champ_anita',
      fullName: 'Anita Devi',
      email: 'anita.devi@kishanbhai.in',
      phone: '+91 98123 45678',
      role: 'CHAMPION',
      village: 'Anandpur',
      district: 'Rajkot',
      state: 'Gujarat',
      verified: false, // Locked until verification approved!
      farmSizeAcres: 6.0,
      crops: ['Cotton', 'Groundnut'],
      preferredLanguage: 'hi',
      createdAt: '2026-08-01T10:00:00Z',
    };

    this.users.set(u1.id, u1);
    this.users.set(u2.id, u2);
    this.users.set(u3.id, u3);
    this.users.set(u4.id, u4);

    // Seed Champion Verification Requests
    // 1) Vikramsinh Jadeja - Approved
    const reqVikram: ChampionVerificationRequest = {
      id: 'cv_req_vikram_01',
      userId: u2.id,
      createdAt: '2026-05-10T11:00:00Z',
      updatedAt: '2026-05-12T14:30:00Z',
      status: 'APPROVED',
      currentStep: 7,
      registrationData: {
        userId: u2.id,
        legalFullName: 'Vikramsinh Danubha Jadeja',
        mobile: '+91 97240 88192',
        email: 'vikram.jadeja@kishanbhai.in',
        state: 'Gujarat',
        district: 'Rajkot',
        block: 'Kotda Sangani',
        villageName: 'Anandpur Hub',
        gramPanchayatName: 'Anandpur Gram Panchayat',
        designation: 'SARPANCH',
        gramPanchayatIdNumber: 'GP-GUJ-RJK-2021-042',
        panchayatOfficeAddress: 'Gram Panchayat Bhavan, Station Road, Anandpur',
        agreedToTerms: true,
        termsAgreedAt: '2026-05-10T11:05:00Z',
      },
      identityCheck: {
        provider: 'AUTHORIZED_AADHAAR_GATEWAY',
        idType: 'AADHAAR_MASKED',
        maskedId: 'XXXX-XXXX-8819',
        providerTxnRef: 'UIDAI-SANDBOX-AUTH-8829103',
        consentObtained: true,
        consentTimestamp: '2026-05-10T11:08:00Z',
        verifiedAt: '2026-05-10T11:09:12Z',
        status: 'VERIFIED',
        remarks: 'Consent-verified masked Aadhaar via UIDAI Authorized Gateway',
      },
      documents: [
        {
          id: 'doc_vikram_01',
          docType: 'ELECTION_CERTIFICATE',
          fileName: 'State_Election_Commission_Sarpanch_Certificate_2021.pdf',
          fileSize: 1420500,
          uploadedAt: '2026-05-10T11:15:00Z',
          secureViewToken: 'sec_tok_vikram_cert_8829',
          status: 'VALID',
          remarks: 'Official seal and returning officer signature verified',
        },
      ],
      faceVerification: {
        provider: 'LIVENESS_FACE_MATCH_AI',
        livenessPassed: true,
        livenessConfidence: 0.98,
        faceMatchScore: 0.96,
        spoofDetected: false,
        selfieCaptureTimestamp: '2026-05-10T11:20:00Z',
        verifiedAt: '2026-05-10T11:20:30Z',
        status: 'VERIFIED',
        remarks: 'Live selfie matched against authorized identity photo with 96% match',
      },
      designationCheck: {
        officialSourceChecked: 'E_GRAM_SWARAJ',
        crossReferenceMatched: true,
        gramPanchayatConfirmed: 'Anandpur Gram Panchayat (LGD: 162940)',
        tenurePeriod: '2021 - 2026',
        status: 'VERIFIED',
        verifiedAt: '2026-05-10T11:25:00Z',
        remarks: 'e-GramSwaraj directory confirmed incumbent Sarpanch',
      },
      adminDecision: {
        decidedBy: 'District Nodal Officer (Govt Admin)',
        decidedAt: '2026-05-12T14:30:00Z',
        decision: 'APPROVED',
        reason: 'All 6 verification checks passed. Official election certificate validated against e-GramSwaraj.',
        adminNotes: 'Full Village Champion privileges granted.',
      },
      auditLogs: [
        {
          id: 'log_vikram_01',
          timestamp: '2026-05-10T11:00:00Z',
          actorId: u2.id,
          actorName: 'Vikramsinh Danubha Jadeja',
          actorRole: 'APPLICANT',
          action: 'REGISTER_CHAMPION_APPLICATION',
          previousStatus: 'REGISTERED',
          newStatus: 'IDENTITY_PENDING',
        },
        {
          id: 'log_vikram_02',
          timestamp: '2026-05-10T11:09:12Z',
          actorId: u2.id,
          actorName: 'Vikramsinh Danubha Jadeja',
          actorRole: 'APPLICANT',
          action: 'IDENTITY_VERIFIED',
          previousStatus: 'IDENTITY_PENDING',
          newStatus: 'DOCUMENTS_PENDING',
        },
        {
          id: 'log_vikram_03',
          timestamp: '2026-05-10T11:25:00Z',
          actorId: u2.id,
          actorName: 'Vikramsinh Danubha Jadeja',
          actorRole: 'APPLICANT',
          action: 'SUBMITTED_FOR_REVIEW',
          previousStatus: 'DOCUMENTS_PENDING',
          newStatus: 'UNDER_REVIEW',
        },
        {
          id: 'log_vikram_04',
          timestamp: '2026-05-12T14:30:00Z',
          actorId: 'admin_sys_01',
          actorName: 'District Nodal Officer',
          actorRole: 'ADMIN',
          action: 'ADMIN_APPROVE_APPLICATION',
          previousStatus: 'UNDER_REVIEW',
          newStatus: 'APPROVED',
          notes: 'Sarpanch credentials and liveness verified successfully.',
        },
      ],
    };

    // 2) Anita Devi - Under Review
    const reqAnita: ChampionVerificationRequest = {
      id: 'cv_req_anita_02',
      userId: u4.id,
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:45:00Z',
      status: 'UNDER_REVIEW',
      currentStep: 6, // Step 6: Admin Review
      registrationData: {
        userId: u4.id,
        legalFullName: 'Anita Devi Parmar',
        mobile: '+91 98123 45678',
        email: 'anita.devi@kishanbhai.in',
        state: 'Gujarat',
        district: 'Rajkot',
        block: 'Gondal',
        villageName: 'Anandpur',
        gramPanchayatName: 'Anandpur Gram Panchayat',
        designation: 'SARPANCH',
        gramPanchayatIdNumber: 'GP-GUJ-RJK-2022-108',
        panchayatOfficeAddress: 'Gram Panchayat Office, Near Main Chowk, Anandpur',
        agreedToTerms: true,
        termsAgreedAt: '2026-08-01T10:05:00Z',
      },
      identityCheck: {
        provider: 'AUTHORIZED_AADHAAR_GATEWAY',
        idType: 'AADHAAR_MASKED',
        maskedId: 'XXXX-XXXX-4567',
        providerTxnRef: 'UIDAI-SANDBOX-AUTH-9014522',
        consentObtained: true,
        consentTimestamp: '2026-08-01T10:10:00Z',
        verifiedAt: '2026-08-01T10:11:30Z',
        status: 'VERIFIED',
        remarks: 'Consent obtained; masked identifier verified.',
      },
      documents: [
        {
          id: 'doc_anita_01',
          docType: 'ELECTION_CERTIFICATE',
          fileName: 'Panchayat_Election_Notification_Sarpanch_AnitaDevi.pdf',
          fileSize: 2104500,
          uploadedAt: '2026-08-01T10:20:00Z',
          secureViewToken: 'sec_tok_anita_cert_9104',
          status: 'PENDING',
          remarks: 'Submitted for verification officer review.',
        },
        {
          id: 'doc_anita_02',
          docType: 'GOV_AUTHORIZATION_LETTER',
          fileName: 'Block_Development_Officer_Authorization_Letter.pdf',
          fileSize: 984000,
          uploadedAt: '2026-08-01T10:22:00Z',
          secureViewToken: 'sec_tok_anita_auth_9105',
          status: 'PENDING',
        },
      ],
      faceVerification: {
        provider: 'LIVENESS_FACE_MATCH_AI',
        livenessPassed: true,
        livenessConfidence: 0.99,
        faceMatchScore: 0.94,
        spoofDetected: false,
        selfieCaptureTimestamp: '2026-08-01T10:30:00Z',
        verifiedAt: '2026-08-01T10:30:45Z',
        status: 'VERIFIED',
        remarks: 'Passive liveness detection passed (blink and micro-movement verified). Match score: 94%.',
      },
      designationCheck: {
        officialSourceChecked: 'E_GRAM_SWARAJ',
        crossReferenceMatched: true,
        gramPanchayatConfirmed: 'Anandpur Gram Panchayat (LGD: 162940)',
        tenurePeriod: '2022 - 2027',
        status: 'VERIFIED',
        verifiedAt: '2026-08-01T10:38:00Z',
        remarks: 'Panchayati Raj registry matched Anita Devi as Sarpanch for Anandpur GP.',
      },
      auditLogs: [
        {
          id: 'log_anita_01',
          timestamp: '2026-08-01T10:00:00Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'REGISTER_CHAMPION_APPLICATION',
          previousStatus: 'REGISTERED',
          newStatus: 'IDENTITY_PENDING',
        },
        {
          id: 'log_anita_02',
          timestamp: '2026-08-01T10:11:30Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'IDENTITY_VERIFIED',
          previousStatus: 'IDENTITY_PENDING',
          newStatus: 'DOCUMENTS_PENDING',
        },
        {
          id: 'log_anita_03',
          timestamp: '2026-08-01T10:25:00Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'DOCUMENTS_UPLOADED',
          previousStatus: 'DOCUMENTS_PENDING',
          newStatus: 'FACE_VERIFICATION_PENDING',
        },
        {
          id: 'log_anita_04',
          timestamp: '2026-08-01T10:30:45Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'FACE_VERIFICATION_PASSED',
          previousStatus: 'FACE_VERIFICATION_PENDING',
          newStatus: 'DESIGNATION_VERIFICATION_PENDING',
        },
        {
          id: 'log_anita_05',
          timestamp: '2026-08-01T10:45:00Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'SUBMITTED_FOR_ADMIN_REVIEW',
          previousStatus: 'DESIGNATION_VERIFICATION_PENDING',
          newStatus: 'UNDER_REVIEW',
          notes: 'Applicant completed all steps; waiting for admin approval decision.',
        },
      ],
    };

    this.championVerifications.set(reqVikram.id, reqVikram);
    this.championVerifications.set(reqAnita.id, reqAnita);

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

    // Seed Cluster Buying Chat Messages (Real-time cluster discussion for buying needs)
    this.clusterChatMessages.set('cluster_anandpur_01', [
      {
        id: 'cmsg_1',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_champ_vikram',
        senderName: 'Vikramsinh Jadeja',
        senderVillage: 'Anandpur Hub',
        senderRole: 'CHAMPION',
        text: 'राम राम किसान भाइयों! खरीफ सीजन के लिए खाद और सोलर पंप की सामूहिक मांग तैयार हो रही है। अगर किसी को बीज या ड्रिप पाइप की ज़रूरत हो तो यहां शेयर करें।',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'cmsg_2',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_farmer_ramesh',
        senderName: 'Ramesh Patel',
        senderVillage: 'Anandpur',
        senderRole: 'FARMER',
        text: 'मुझे अपने 4.5 एकड़ खेत के लिए 25 बोरी डीएपी और 15 बोरी यूरिया की आवश्यकता है। क्या कोई और किसान भाई साथ में ऑर्डर करेगा ताकि 24% थोक छूट मिल सके?',
        buyingNeed: {
          item: 'Coromandel Gromor DAP + IFFCO Neem Urea',
          category: 'Fertilizer',
          quantityNeeded: 40,
          unit: 'Bags (50kg)',
          targetPriceInr: 1120,
          pledgedCount: 1,
          status: 'OPEN',
        },
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'cmsg_3',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_farmer_suresh',
        senderName: 'Suresh Bhai Ahir',
        senderVillage: 'Anandpur',
        senderRole: 'FARMER',
        text: 'रमेश भाई, मैं भी 20 बोरी डीएपी में शामिल होता हूँ! साथ में लेने से ट्रांसपोर्ट का खर्चा भी बच जाएगा।',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'cmsg_4',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_farmer_kanti',
        senderName: 'Kantibhai Makwana',
        senderVillage: 'Dharampuri',
        senderRole: 'FARMER',
        text: 'क्या क्लस्टर में कोई 5HP सोलर सबमर्सिबल पंप लेने की योजना बना रहा है? अगर हम 5 लोग मिलकर OEM कंपनी से बात करें तो ₹50,000 की बचत हो सकती है।',
        buyingNeed: {
          item: 'Shakti 5HP DC Solar Submersible Pump & Controller',
          category: 'Solar & Irrigation',
          quantityNeeded: 5,
          unit: 'Sets',
          targetPriceInr: 118000,
          pledgedCount: 2,
          status: 'OPEN',
        },
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'cmsg_5',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_champ_vikram',
        senderName: 'Vikramsinh Jadeja',
        senderVillage: 'Anandpur Hub',
        senderRole: 'CHAMPION',
        text: 'कांतिभाई, शक्ति सोलर के जोनल मैनेजर से बात हो गई है। जैसे ही हमारे क्लस्टर में 5 पंप का प्लेज पूरा होगा, कंपनी इंजीनियर आकर खेत पर फ्री इंस्टॉलेशन करेगा।',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ]);

    this.clusterChatMessages.set('cluster_malwa_02', [
      {
        id: 'mmsg_1',
        clusterId: 'cluster_malwa_02',
        senderId: 'usr_champ_rajendra',
        senderName: 'Rajendra Singh Tomar',
        senderVillage: 'Dharampuri',
        senderRole: 'CHAMPION',
        text: 'मालवा क्लस्टर के सभी गेहूं उत्पादक साथी ध्यान दें: शरबती गेहूं बीज (C-306) का प्रमाणित लॉट आ रहा है। अपनी ज़रूरत दर्ज करें।',
        buyingNeed: {
          item: 'Certified Sharbati Wheat Seeds (C-306 Grade-A)',
          category: 'Seeds',
          quantityNeeded: 100,
          unit: 'Quintals',
          targetPriceInr: 3400,
          pledgedCount: 8,
          status: 'OPEN',
        },
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ]);

    this.clusterChatMessages.set('cluster_vidarbha_03', [
      {
        id: 'vmsg_1',
        clusterId: 'cluster_vidarbha_03',
        senderId: 'usr_champ_anil',
        senderName: 'Anil Rao Deshmukh',
        senderVillage: 'Wardha Rural',
        senderRole: 'CHAMPION',
        text: 'कपास बुवाई के लिए महिको बोलगार्ड-2 बीज का संयुक्त ऑर्डर आज शाम 6 बजे फाइनल हो रहा है। जिन्हें भी चाहिए तुरंत बताएं।',
        buyingNeed: {
          item: 'Mahyco Bollgard-II Hybrid Cotton Seeds',
          category: 'Seeds',
          quantityNeeded: 80,
          unit: 'Packets',
          targetPriceInr: 735,
          pledgedCount: 12,
          status: 'OPEN',
        },
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ]);

    // 2.1 Shared Cluster Shopping Carts
    const cartAnandpur: SharedClusterCart = {
      id: 'cart_anandpur_01',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      village: 'Anandpur, Rajkot',
      title: 'Rabi 2026 Cooperative Bulk Supplies Cart',
      status: 'OPEN',
      deliveryAddress: 'Anandpur Primary Kisan Sahakari Godown, Rajkot Highway, Gujarat 360005',
      coordinatorName: 'Vikramsinh Jadeja',
      coordinatorPhone: '+91 97240 88219',
      items: [
        {
          id: 'item_dap_01',
          title: 'Coromandel Gromor 28-28-0 Complex Fertilizer',
          category: 'Fertilizer',
          unit: 'Bags (50kg)',
          retailPrice: 1850,
          wholesalePrice: 1480,
          targetTierQty: 50,
          totalQuantity: 45,
          supplierName: 'Coromandel International Cooperative Hub',
          imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69103851?w=300&auto=format&fit=crop&q=80',
          contributors: [
            {
              userId: 'usr_farmer_ramesh',
              userName: 'Ramesh Patel',
              userVillage: 'Anandpur',
              quantity: 15,
              notes: 'Needed for block A & B cotton fields',
              addedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
            },
            {
              userId: 'usr_champ_vikram',
              userName: 'Vikramsinh Jadeja',
              userVillage: 'Anandpur Hub',
              quantity: 20,
              notes: 'Groundnut sowing requirement',
              addedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
            {
              userId: 'usr_farmer_suresh',
              userName: 'Suresh Bhai Ahir',
              userVillage: 'Anandpur',
              quantity: 10,
              notes: 'Deliver to north borewell point',
              addedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            },
          ],
        },
        {
          id: 'item_urea_02',
          title: 'IFFCO Neem Coated Certified Urea',
          category: 'Fertilizer',
          unit: 'Bags (45kg)',
          retailPrice: 266.5,
          wholesalePrice: 242.0,
          targetTierQty: 50,
          totalQuantity: 35,
          supplierName: 'IFFCO State Regional Distribution Hub',
          imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=300&auto=format&fit=crop&q=80',
          contributors: [
            {
              userId: 'usr_farmer_ramesh',
              userName: 'Ramesh Patel',
              userVillage: 'Anandpur',
              quantity: 10,
              addedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            },
            {
              userId: 'usr_farmer_kanti',
              userName: 'Kantibhai Makwana',
              userVillage: 'Dharampuri',
              quantity: 25,
              addedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
          ],
        },
        {
          id: 'item_drip_03',
          title: 'Jain Irrigation Drip Lateral Pipe (16mm, 400m bundle)',
          category: 'Solar & Irrigation',
          unit: 'Rolls',
          retailPrice: 3600,
          wholesalePrice: 2850,
          targetTierQty: 10,
          totalQuantity: 6,
          supplierName: 'Jain Irrigation Systems Ltd Authorized Hub',
          imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=300&auto=format&fit=crop&q=80',
          contributors: [
            {
              userId: 'usr_farmer_ramesh',
              userName: 'Ramesh Patel',
              userVillage: 'Anandpur',
              quantity: 2,
              notes: 'For cumin intercropping rows',
              addedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
              userId: 'usr_farmer_suresh',
              userName: 'Suresh Bhai Ahir',
              userVillage: 'Anandpur',
              quantity: 4,
              addedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            },
          ],
        },
      ],
      totalRetailAmount: 45 * 1850 + 35 * 266.5 + 6 * 3600,
      totalWholesaleAmount: 45 * 1480 + 35 * 242.0 + 6 * 2850,
      totalSavings: (45 * 1850 + 35 * 266.5 + 6 * 3600) - (45 * 1480 + 35 * 242.0 + 6 * 2850),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cartMalwa: SharedClusterCart = {
      id: 'cart_malwa_02',
      clusterId: 'cluster_malwa_02',
      clusterName: 'Malwa Organic Wheat Federation',
      village: 'Dharampuri, Dhar',
      title: 'Malwa Organic Inputs & Sharbati Wheat Seed Pooling',
      status: 'OPEN',
      deliveryAddress: 'Dharampuri Cooperative Collection Mandi, Dhar, MP',
      coordinatorName: 'Kailash Mandloi',
      coordinatorPhone: '+91 94250 11928',
      items: [
        {
          id: 'item_sharbati_seed_01',
          title: 'Certified Sharbati Wheat Foundation Seeds (C-306)',
          category: 'Seeds',
          unit: 'Quintals',
          retailPrice: 4200,
          wholesalePrice: 3450,
          targetTierQty: 20,
          totalQuantity: 14,
          supplierName: 'MP Rajya Beej Nigam Certified Depot',
          imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=80',
          contributors: [
            {
              userId: 'usr_farmer_ramesh',
              userName: 'Ramesh Patel',
              userVillage: 'Anandpur',
              quantity: 4,
              addedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            },
            {
              userId: 'usr_champ_kailash',
              userName: 'Kailash Mandloi',
              userVillage: 'Dharampuri',
              quantity: 10,
              addedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
            },
          ],
        },
      ],
      totalRetailAmount: 14 * 4200,
      totalWholesaleAmount: 14 * 3450,
      totalSavings: 14 * (4200 - 3450),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sharedCarts.set('cluster_anandpur_01', cartAnandpur);
    this.sharedCarts.set('cluster_malwa_02', cartMalwa);

    // 3. Active Bulk Buying & Group Purchasing Demands
    const b1: BulkOrderRequirement = {
      id: 'req_urea_anandpur_01',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Anandpur Sahakari Fertilizer Circle',
      category: 'Fertilizer',
      itemName: 'IFFCO Neem-Coated Technical Urea (45kg)',
      itemDescription: 'Government-approved neem-coated technical grade slow-release urea for kharif crop top-dressing.',
      targetQuantity: 500,
      currentQuantity: 425,
      unit: 'Bags (50kg)',
      standardRetailPrice: 350,
      negotiatedBulkPrice: 266.5,
      tierDiscounts: [
        { minQty: 100, discountPct: 12, priceInr: 308, label: 'Tier 1 (100 bags)' },
        { minQty: 250, discountPct: 18, priceInr: 287, label: 'Tier 2 (250 bags)' },
        { minQty: 500, discountPct: 24, priceInr: 266.5, label: 'Tier 3 (500 bags - Factory Bulk)' },
      ],
      savingsPercentage: 24,
      deadlineDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Anandpur APMC Hub, Gujarat',
      creatorName: 'Vikramsinh Jadeja',
      creatorId: 'usr_champ_vikram',
      connectedMembersCount: 28,
      farmerPledges: [
        {
          id: 'pld_1',
          farmerId: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          village: 'Anandpur',
          quantity: 20,
          pledgedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          notes: 'Required for Plot 2 cotton field',
        },
        {
          id: 'pld_2',
          farmerId: 'usr_farmer_suresh',
          farmerName: 'Suresh Bhai Ahir',
          village: 'Anandpur',
          quantity: 35,
          pledgedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
          notes: 'Need delivery by Saturday',
        },
        {
          id: 'pld_3',
          farmerId: 'usr_farmer_bhupat',
          farmerName: 'Bhupatbhai Solanki',
          village: 'Navagam',
          quantity: 50,
          pledgedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        },
      ],
      chatMessages: [
        {
          id: 'msg_1',
          senderId: 'usr_champ_vikram',
          senderName: 'Vikramsinh Jadeja',
          senderRole: 'Village Champion',
          text: 'IFFCO regional warehouse confirmed delivery directly to Anandpur warehouse as soon as we hit 500 bags! Only 75 bags left.',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: 'msg_2',
          senderId: 'usr_farmer_ramesh',
          senderName: 'Ramesh Patel',
          senderRole: 'Farmer',
          text: 'Just pledged 20 bags. Will the bags be unloaded at the panchayat warehouse?',
          timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
        },
        {
          id: 'msg_3',
          senderId: 'usr_champ_vikram',
          senderName: 'Vikramsinh Jadeja',
          senderRole: 'Village Champion',
          text: 'Yes Ramesh bhai, free unloading at Panchayat depot. We will distribute with tractor trolleys.',
          timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        },
      ],
    };

    const b2: BulkOrderRequirement = {
      id: 'req_solar_pump_02',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Saurashtra Solar Irrigation Pool',
      category: 'Solar & Irrigation',
      itemName: 'Shakti 5HP Solar Submersible Pump & Smart Dual-Axis Controller',
      itemDescription: 'MNRE approved 5HP BLDC stainless steel submersible borewell pump with MPPT solar tracking inverter and 5-year on-site warranty.',
      targetQuantity: 15,
      currentQuantity: 11,
      unit: 'Sets',
      standardRetailPrice: 168000,
      negotiatedBulkPrice: 118000,
      tierDiscounts: [
        { minQty: 5, discountPct: 15, priceInr: 142800, label: 'Tier 1 (5 sets)' },
        { minQty: 10, discountPct: 25, priceInr: 126000, label: 'Tier 2 (10 sets)' },
        { minQty: 15, discountPct: 30, priceInr: 118000, label: 'Tier 3 (15 sets - Direct OEM)' },
      ],
      savingsPercentage: 30,
      deadlineDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Rajkot Regional Sub-Depot',
      creatorName: 'Vikramsinh Jadeja',
      creatorId: 'usr_champ_vikram',
      connectedMembersCount: 16,
      farmerPledges: [
        {
          id: 'pld_s1',
          farmerId: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          village: 'Anandpur',
          quantity: 1,
          pledgedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          notes: 'For North plot 180ft borewell',
        },
        {
          id: 'pld_s2',
          farmerId: 'usr_farmer_kanti',
          farmerName: 'Kantibhai Makwana',
          village: 'Dharampuri',
          quantity: 2,
          pledgedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        },
      ],
      chatMessages: [
        {
          id: 'msg_s1',
          senderId: 'usr_champ_vikram',
          senderName: 'Vikramsinh Jadeja',
          senderRole: 'Champion',
          text: 'Factory technician will come to do installation for all 15 farmers in 3 days batch.',
          timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        },
      ],
    };

    const b3: BulkOrderRequirement = {
      id: 'req_seed_btcotton_03',
      clusterId: 'cluster_vidarbha_03',
      clusterName: 'Vidarbha High-Yield Pulse & Cotton Mesh',
      groupName: 'Vidarbha Seed Growers Circle',
      category: 'Seeds',
      itemName: 'Mahyco Bollgard-II Hybrid Cotton Seeds (475g Pack)',
      itemDescription: 'Certified high-germination Bollgard-II hybrid cotton with sucking pest tolerance and long staple yield.',
      targetQuantity: 200,
      currentQuantity: 185,
      unit: 'Packets',
      standardRetailPrice: 920,
      negotiatedBulkPrice: 735,
      tierDiscounts: [
        { minQty: 50, discountPct: 10, priceInr: 828, label: 'Tier 1 (50 pkts)' },
        { minQty: 100, discountPct: 15, priceInr: 782, label: 'Tier 2 (100 pkts)' },
        { minQty: 200, discountPct: 20, priceInr: 735, label: 'Tier 3 (200 pkts - Wholesale)' },
      ],
      savingsPercentage: 20,
      deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Wardha APMC Yard, Maharashtra',
      creatorName: 'Anil Rao Deshmukh',
      creatorId: 'usr_champ_anil',
      connectedMembersCount: 22,
      farmerPledges: [
        {
          id: 'pld_c1',
          farmerId: 'usr_farmer_anil',
          farmerName: 'Prakash Rao',
          village: 'Wardha Rural',
          quantity: 25,
          pledgedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ],
      chatMessages: [
        {
          id: 'msg_c1',
          senderId: 'usr_farmer_anil',
          senderName: 'Prakash Rao',
          senderRole: 'Farmer',
          text: 'Does this batch have the QR code seal for certified purity testing?',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'msg_c2',
          senderId: 'usr_champ_anil',
          senderName: 'Anil Rao Deshmukh',
          senderRole: 'Champion',
          text: 'Yes, 100% genuine Mahyco hologram sealed with batch test report included.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    };

    const b4: BulkOrderRequirement = {
      id: 'req_drip_anandpur_04',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Anandpur Micro-Irrigation Collective',
      category: 'Solar & Irrigation',
      itemName: 'Jain Drip Inline 16mm Lateral Coil (400m Roll)',
      itemDescription: 'Virgin HDPE cylindrical inline drippers spaced at 40cm, 2.4 LPH flow rate with anti-clog labyrinth design.',
      targetQuantity: 120,
      currentQuantity: 96,
      unit: 'Rolls',
      standardRetailPrice: 3800,
      negotiatedBulkPrice: 2850,
      tierDiscounts: [
        { minQty: 30, discountPct: 15, priceInr: 3230, label: 'Tier 1 (30 rolls)' },
        { minQty: 60, discountPct: 20, priceInr: 3040, label: 'Tier 2 (60 rolls)' },
        { minQty: 120, discountPct: 25, priceInr: 2850, label: 'Tier 3 (120 rolls)' },
      ],
      savingsPercentage: 25,
      deadlineDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Anandpur Cluster Hub',
      creatorName: 'Vikramsinh Jadeja',
      creatorId: 'usr_champ_vikram',
      connectedMembersCount: 19,
      farmerPledges: [
        {
          id: 'pld_d1',
          farmerId: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          village: 'Anandpur',
          quantity: 8,
          pledgedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
      ],
      chatMessages: [],
    };

    const b5: BulkOrderRequirement = {
      id: 'req_weeder_anandpur_05',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Kisan Small Equipment Club',
      category: 'Machinery & Tools',
      itemName: 'Honda GX-200 4-Stroke 7HP Multipurpose Power Weeder',
      itemDescription: 'High-torque petrol power weeder with 32-blade rotary tiller attachment, adjustable furrower, and transport wheels.',
      targetQuantity: 20,
      currentQuantity: 17,
      unit: 'Units',
      standardRetailPrice: 42000,
      negotiatedBulkPrice: 31500,
      tierDiscounts: [
        { minQty: 5, discountPct: 12, priceInr: 36960, label: 'Tier 1 (5 units)' },
        { minQty: 10, discountPct: 20, priceInr: 33600, label: 'Tier 2 (10 units)' },
        { minQty: 20, discountPct: 25, priceInr: 31500, label: 'Tier 3 (20 units)' },
      ],
      savingsPercentage: 25,
      deadlineDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Central Machinery Hub, Anandpur',
      creatorName: 'Vikramsinh Jadeja',
      creatorId: 'usr_champ_vikram',
      connectedMembersCount: 24,
      farmerPledges: [],
      chatMessages: [],
    };

    const b6: BulkOrderRequirement = {
      id: 'req_cattle_feed_06',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Anandpur Dairy & Livestock Group',
      category: 'Cattle Feed',
      itemName: 'Amul Dan Balanced Compound Cattle Feed (50kg Bag)',
      itemDescription: 'Fortified with 20% crude protein, minerals and bypass fat for improved milk fat percentage and dairy cow health.',
      targetQuantity: 250,
      currentQuantity: 210,
      unit: 'Bags (50kg)',
      standardRetailPrice: 1250,
      negotiatedBulkPrice: 960,
      tierDiscounts: [
        { minQty: 50, discountPct: 10, priceInr: 1125, label: 'Tier 1 (50 bags)' },
        { minQty: 100, discountPct: 16, priceInr: 1050, label: 'Tier 2 (100 bags)' },
        { minQty: 250, discountPct: 23, priceInr: 960, label: 'Tier 3 (250 bags)' },
      ],
      savingsPercentage: 23,
      deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Village Dairy Milk Chilling Centre',
      creatorName: 'Suresh Bhai Ahir',
      creatorId: 'usr_farmer_suresh',
      connectedMembersCount: 31,
      farmerPledges: [],
      chatMessages: [],
    };

    this.bulkRequirements.set(b1.id, b1);
    this.bulkRequirements.set(b2.id, b2);
    this.bulkRequirements.set(b3.id, b3);
    this.bulkRequirements.set(b4.id, b4);
    this.bulkRequirements.set(b5.id, b5);
    this.bulkRequirements.set(b6.id, b6);

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

    // 6. Recent Real Blockchain Transactions (Cluster Collective Input Purchasing & Harvest Escrows)
    const tx1: TransactionRecord = {
      id: 'tx_alg_8819241',
      serviceName: 'Cluster Bio-NPK Wholesale Purchase Settlement',
      serviceId: 'bulk-fertilizer-pool',
      amountUsdc: 142.50,
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
      serviceName: 'Pooled Sharbati Wheat Institutional Buyer Escrow',
      serviceId: 'harvest-lot-escrow',
      amountUsdc: 285.00,
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

    // Initialize two-sided loyalty rewards system
    this.seedLoyaltyData();
  }

  // ==========================================
  // LOYALTY REWARDS METHODS & CALCULATIONS
  // ==========================================

  public calculateTier(points: number): {
    tier: LoyaltyTier;
    pointsToNextTier: number;
    nextTier: LoyaltyTier | null;
    progressPercent: number;
  } {
    const thresholds = this.loyaltyConfig.tierThresholds;
    if (points >= thresholds.diamond) {
      return {
        tier: 'DIAMOND',
        pointsToNextTier: 0,
        nextTier: null,
        progressPercent: 100,
      };
    } else if (points >= thresholds.platinum) {
      const range = thresholds.diamond - thresholds.platinum;
      const currentProgress = points - thresholds.platinum;
      return {
        tier: 'PLATINUM',
        pointsToNextTier: thresholds.diamond - points,
        nextTier: 'DIAMOND',
        progressPercent: Math.min(100, Math.round((currentProgress / range) * 100)),
      };
    } else if (points >= thresholds.gold) {
      const range = thresholds.platinum - thresholds.gold;
      const currentProgress = points - thresholds.gold;
      return {
        tier: 'GOLD',
        pointsToNextTier: thresholds.platinum - points,
        nextTier: 'PLATINUM',
        progressPercent: Math.min(100, Math.round((currentProgress / range) * 100)),
      };
    } else {
      const range = thresholds.gold;
      return {
        tier: 'SILVER',
        pointsToNextTier: thresholds.gold - points,
        nextTier: 'GOLD',
        progressPercent: Math.min(100, Math.round((points / range) * 100)),
      };
    }
  }

  public getUnlockedBenefits(role: 'FARMER' | 'BUYER', tier: LoyaltyTier): string[] {
    if (role === 'FARMER') {
      const silver = [
        'Standard verified buyer offers & mandi price info',
        'Transparent digital escrow settlement',
        'Cluster pooling access',
      ];
      const gold = [
        ...silver,
        'Additional eligible buyer opportunities',
        'Bulk-selling priority allocation',
        'Machinery hire rebate eligibility',
      ];
      const platinum = [
        ...gold,
        'Additional premium institutional buyer matches',
        'Priority transport & logistics dispatching',
        'Dedicated ICAR advisory concierge',
      ];
      const diamond = [
        ...platinum,
        'Priority consideration for high-volume procurement',
        'Zero platform fees on cluster escrow',
        'Annual Agri-Leadership badge',
      ];

      switch (tier) {
        case 'DIAMOND':
          return diamond;
        case 'PLATINUM':
          return platinum;
        case 'GOLD':
          return gold;
        case 'SILVER':
        default:
          return silver;
      }
    } else {
      const silver = [
        'Discover verified farmers & clusters',
        'View eligible crop listings with moisture specs',
        'Submit purchase requests',
        'Track orders & verified deliveries',
        'Earn points from verified completed purchases',
      ];
      const gold = [
        ...silver,
        'Access additional eligible procurement opportunities',
        'One-click repeat order tools',
        'Loyalty benefits & fee waivers on eligible orders',
        'Purchase history & spending analytics',
      ];
      const platinum = [
        ...gold,
        'Access eligible bulk-purchase volume opportunities',
        'Advanced multi-attribute crop & supplier filtering',
        'Priority dispute & delivery support',
        'Repeat purchase multiplier bonuses',
      ];
      const diamond = [
        ...platinum,
        'Access high-volume forward contract sourcing',
        'Dedicated procurement manager & escrow desk',
        'Custom API access for ERP procurement',
        'VIP supplier summits & direct farm gate visits',
      ];

      switch (tier) {
        case 'DIAMOND':
          return diamond;
        case 'PLATINUM':
          return platinum;
        case 'GOLD':
          return gold;
        case 'SILVER':
        default:
          return silver;
      }
    }
  }

  public getOrCreateLoyaltyAccount(userId: string, role?: 'FARMER' | 'BUYER', userName?: string): LoyaltyAccount {
    let account = this.loyaltyAccounts.get(userId);
    if (!account) {
      const user = this.users.get(userId);
      const effectiveRole: 'FARMER' | 'BUYER' = role || (user?.role === 'BUYER' ? 'BUYER' : 'FARMER');
      const effectiveName = userName || user?.fullName || (effectiveRole === 'BUYER' ? 'Verified Buyer' : 'Verified Farmer');
      const now = new Date().toISOString();

      const tierCalc = this.calculateTier(0);
      account = {
        userId,
        userName: effectiveName,
        userRole: effectiveRole,
        tier: 'SILVER',
        points: 0,
        lifetimePointsEarned: 0,
        pointsToNextTier: tierCalc.pointsToNextTier,
        nextTier: tierCalc.nextTier,
        progressPercent: 0,
        tierThresholds: {
          silver: 0,
          gold: this.loyaltyConfig.tierThresholds.gold,
          platinum: this.loyaltyConfig.tierThresholds.platinum,
          diamond: this.loyaltyConfig.tierThresholds.diamond,
        },
        unlockedBenefits: this.getUnlockedBenefits(effectiveRole, 'SILVER'),
        eligibleBulkOpportunities: false,
        eligiblePremiumMatches: false,
        prioritySupportUnlocked: false,
        repeatTransactionCount: 0,
        completedTransactionsCount: 0,
        ratingsCount: 0,
        averageRatingScore: 5.0,
        createdAt: now,
        updatedAt: now,
      };

      this.loyaltyAccounts.set(userId, account);

      // Auto-award initial verification points if user is verified
      if (user?.verified) {
        const verifPoints =
          effectiveRole === 'BUYER'
            ? this.loyaltyConfig.pointsRules.buyerVerification
            : this.loyaltyConfig.pointsRules.farmerVerification;
        this.awardLoyaltyPoints({
          userId,
          role: effectiveRole,
          userName: effectiveName,
          activityType: 'PROFILE_VERIFICATION',
          title: `${effectiveRole === 'BUYER' ? 'Buyer' : 'Farmer'} Verification Complete`,
          points: verifPoints,
          referenceId: `verif_${userId}`,
          notes: 'Awarded for completing digital identity and credential verification.',
          idempotencyKey: `verif_${userId}`,
        });
      }
    }
    return this.loyaltyAccounts.get(userId)!;
  }

  public awardLoyaltyPoints(params: {
    userId: string;
    role?: 'FARMER' | 'BUYER';
    userName?: string;
    activityType: LoyaltyActivityType;
    title: string;
    points: number;
    referenceId?: string;
    notes?: string;
    idempotencyKey?: string;
  }): { success: boolean; account: LoyaltyAccount; ledgerEntry?: LoyaltyLedgerEntry; message: string } {
    if (params.idempotencyKey && this.processedLoyaltyEvents.has(params.idempotencyKey)) {
      const existingAccount = this.getOrCreateLoyaltyAccount(params.userId, params.role, params.userName);
      return {
        success: true,
        account: existingAccount,
        message: 'Event was already rewarded previously (idempotent duplicate avoided).',
      };
    }

    const account = this.getOrCreateLoyaltyAccount(params.userId, params.role, params.userName);
    const now = new Date().toISOString();

    account.points += params.points;
    if (params.points > 0) {
      account.lifetimePointsEarned += params.points;
    }

    // Recalculate Tier
    const tierInfo = this.calculateTier(account.points);
    account.tier = tierInfo.tier;
    account.pointsToNextTier = tierInfo.pointsToNextTier;
    account.nextTier = tierInfo.nextTier;
    account.progressPercent = tierInfo.progressPercent;
    account.unlockedBenefits = this.getUnlockedBenefits(account.userRole, account.tier);
    account.eligibleBulkOpportunities = account.tier === 'GOLD' || account.tier === 'PLATINUM' || account.tier === 'DIAMOND';
    account.eligiblePremiumMatches = account.tier === 'PLATINUM' || account.tier === 'DIAMOND';
    account.prioritySupportUnlocked = account.tier === 'PLATINUM' || account.tier === 'DIAMOND';
    account.updatedAt = now;

    if (params.activityType === 'CROP_SALE_COMPLETED' || params.activityType === 'PURCHASE_COMPLETED') {
      account.completedTransactionsCount += 1;
    } else if (params.activityType === 'REPEAT_TRANSACTION_BONUS') {
      account.repeatTransactionCount += 1;
    }

    const ledgerEntry: LoyaltyLedgerEntry = {
      id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: account.userId,
      userRole: account.userRole,
      activityType: params.activityType,
      title: params.title,
      pointsDelta: params.points,
      resultingBalance: account.points,
      timestamp: now,
      referenceId: params.referenceId,
      notes: params.notes,
      isReversed: false,
    };

    this.loyaltyLedger.set(ledgerEntry.id, ledgerEntry);
    if (params.idempotencyKey) {
      this.processedLoyaltyEvents.add(params.idempotencyKey);
    }

    return {
      success: true,
      account,
      ledgerEntry,
      message: `Successfully awarded ${params.points} points for ${params.title}. New balance: ${account.points} pts.`,
    };
  }

  public reverseLoyaltyPoints(params: {
    userId: string;
    referenceId: string;
    reason: string;
  }): { success: boolean; account?: LoyaltyAccount; ledgerEntry?: LoyaltyLedgerEntry; message: string } {
    const account = this.loyaltyAccounts.get(params.userId);
    if (!account) {
      return { success: false, message: 'Loyalty account not found' };
    }

    // Find all entries associated with this referenceId that have not been reversed
    const matchingEntries = Array.from(this.loyaltyLedger.values()).filter(
      (e) => e.userId === params.userId && e.referenceId === params.referenceId && !e.isReversed && e.pointsDelta > 0
    );

    if (matchingEntries.length === 0) {
      return { success: false, message: 'No un-reversed reward points found for this reference ID.' };
    }

    const totalToDeduct = matchingEntries.reduce((sum, e) => sum + e.pointsDelta, 0);
    matchingEntries.forEach((e) => {
      e.isReversed = true;
    });

    account.points = Math.max(0, account.points - totalToDeduct);
    const tierInfo = this.calculateTier(account.points);
    account.tier = tierInfo.tier;
    account.pointsToNextTier = tierInfo.pointsToNextTier;
    account.nextTier = tierInfo.nextTier;
    account.progressPercent = tierInfo.progressPercent;
    account.unlockedBenefits = this.getUnlockedBenefits(account.userRole, account.tier);
    account.updatedAt = new Date().toISOString();

    const reversalEntry: LoyaltyLedgerEntry = {
      id: `led_rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: account.userId,
      userRole: account.userRole,
      activityType: 'POINTS_REVERSAL_CANCELLATION',
      title: `Points Reversal: ${params.reason}`,
      pointsDelta: -totalToDeduct,
      resultingBalance: account.points,
      timestamp: new Date().toISOString(),
      referenceId: params.referenceId,
      notes: `Reversal policy enforced. Invalidation reason: ${params.reason}`,
      isReversed: false,
    };

    this.loyaltyLedger.set(reversalEntry.id, reversalEntry);

    return {
      success: true,
      account,
      ledgerEntry: reversalEntry,
      message: `Reversed ${totalToDeduct} loyalty points. Current balance: ${account.points} pts.`,
    };
  }

  public redeemReward(params: {
    userId: string;
    rewardId: string;
  }): { success: boolean; redemption?: LoyaltyRewardRedemption; account?: LoyaltyAccount; error?: string } {
    const reward = this.loyaltyRewards.get(params.rewardId);
    if (!reward) {
      return { success: false, error: 'Reward item not found' };
    }
    if (!reward.isAvailable) {
      return { success: false, error: 'This reward is currently unavailable' };
    }

    let account = this.loyaltyAccounts.get(params.userId);
    if (!account) {
      account = this.getOrCreateLoyaltyAccount(params.userId);
    }

    if (reward.eligibleRole !== 'BOTH' && reward.eligibleRole !== account.userRole) {
      return { success: false, error: `This reward is exclusively for ${reward.eligibleRole.toLowerCase()} accounts.` };
    }

    // Check tier eligibility
    const tierRanks: Record<LoyaltyTier, number> = { SILVER: 0, GOLD: 1, PLATINUM: 2, DIAMOND: 3 };
    if (tierRanks[account.tier] < tierRanks[reward.minTier]) {
      return { success: false, error: `Requires ${reward.minTier} tier or higher (Current: ${account.tier})` };
    }

    if (account.points < reward.pointsCost) {
      return { success: false, error: `Insufficient loyalty points. Have: ${account.points}, Required: ${reward.pointsCost}` };
    }

    // Deduct points
    account.points -= reward.pointsCost;
    const tierInfo = this.calculateTier(account.points);
    account.tier = tierInfo.tier;
    account.pointsToNextTier = tierInfo.pointsToNextTier;
    account.nextTier = tierInfo.nextTier;
    account.progressPercent = tierInfo.progressPercent;
    account.unlockedBenefits = this.getUnlockedBenefits(account.userRole, account.tier);
    account.updatedAt = new Date().toISOString();

    const voucherCode = `KB-${reward.category.substring(0, 3)}-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + reward.expiryDays * 24 * 60 * 60 * 1000).toISOString();

    const redemption: LoyaltyRewardRedemption = {
      id: `red_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rewardId: reward.id,
      userId: account.userId,
      userRole: account.userRole,
      pointsDeducted: reward.pointsCost,
      voucherCode,
      rewardTitle: reward.title,
      discountValueText: reward.discountValueText,
      status: 'ACTIVE',
      redeemedAt: new Date().toISOString(),
      expiresAt,
    };

    this.loyaltyRedemptions.set(redemption.id, redemption);

    const ledgerEntry: LoyaltyLedgerEntry = {
      id: `led_red_${Date.now()}`,
      userId: account.userId,
      userRole: account.userRole,
      activityType: 'REWARD_REDEMPTION',
      title: `Redeemed: ${reward.title}`,
      pointsDelta: -reward.pointsCost,
      resultingBalance: account.points,
      timestamp: new Date().toISOString(),
      referenceId: redemption.id,
      notes: `Voucher Code: ${voucherCode}. Valid until ${expiresAt.split('T')[0]}.`,
    };
    this.loyaltyLedger.set(ledgerEntry.id, ledgerEntry);

    return {
      success: true,
      redemption,
      account,
    };
  }

  public confirmDelivery(orderId: string, userId: string, isBuyer: boolean): { success: boolean; message: string; req?: BuyerPurchaseRequest } {
    const req = this.purchaseRequests.get(orderId);
    if (!req) {
      return { success: false, message: 'Order / purchase request not found' };
    }

    req.status = 'COMPLETED';
    this.purchaseRequests.set(orderId, req);

    const buyerPoints = this.loyaltyConfig.pointsRules.buyerDeliveryConfirmed;
    const farmerPoints = this.loyaltyConfig.pointsRules.farmerDeliveryConfirmed;

    const buyerId = req.buyerId;
    const lot = this.harvestLots.get(req.harvestLotId);
    const farmerId = lot?.farmerId || 'usr_farmer_ramesh';

    // Buyer delivery confirmation
    this.awardLoyaltyPoints({
      userId: buyerId,
      role: 'BUYER',
      userName: req.buyerName,
      activityType: 'DELIVERY_CONFIRMED',
      title: `Delivery Confirmation: ${req.crop} (${(req.quantityKg / 1000).toFixed(1)} Tons)`,
      points: buyerPoints,
      referenceId: req.id,
      notes: `Verified receipt of harvest goods at ${req.deliveryLocation}.`,
      idempotencyKey: `delivery_buyer_${req.id}`,
    });

    // Farmer delivery confirmation
    this.awardLoyaltyPoints({
      userId: farmerId,
      role: 'FARMER',
      userName: req.farmerName || 'Ramesh Patel',
      activityType: 'DELIVERY_CONFIRMED',
      title: `Successful Delivery Confirmed: ${req.crop}`,
      points: farmerPoints,
      referenceId: req.id,
      notes: `Buyer certified arrival of ${req.crop} lot.`,
      idempotencyKey: `delivery_farmer_${req.id}`,
    });

    return { success: true, message: 'Delivery confirmed. Loyalty points credited to both accounts.', req };
  }

  public submitRating(params: {
    orderId: string;
    farmerId: string;
    buyerId: string;
    buyerName: string;
    ratingScore: number;
    qualityFeedback: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'SUBPAR';
    deliveryOnTime: boolean;
    comments: string;
  }): { success: boolean; rating: OrderRating; farmerAccount: LoyaltyAccount; buyerAccount: LoyaltyAccount } {
    const rating: OrderRating = {
      id: `rat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: params.orderId,
      farmerId: params.farmerId,
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      ratingScore: params.ratingScore,
      qualityFeedback: params.qualityFeedback,
      deliveryOnTime: params.deliveryOnTime,
      comments: params.comments,
      submittedAt: new Date().toISOString(),
    };

    this.orderRatings.set(rating.id, rating);

    // Award Buyer points for submitting genuine review
    const buyerResult = this.awardLoyaltyPoints({
      userId: params.buyerId,
      role: 'BUYER',
      userName: params.buyerName,
      activityType: 'GENUINE_RATING_SUBMITTED',
      title: `Submitted Genuine Farmer Rating (${params.ratingScore}★)`,
      points: this.loyaltyConfig.pointsRules.buyerRatingSubmitted,
      referenceId: rating.id,
      notes: params.comments || 'Helpful feedback contributes to fair marketplace pricing and trust.',
      idempotencyKey: `rating_buyer_${params.orderId}`,
    });

    // Award Farmer points for receiving review
    const farmerAccount = this.getOrCreateLoyaltyAccount(params.farmerId, 'FARMER');
    farmerAccount.ratingsCount += 1;
    const existingRatings = Array.from(this.orderRatings.values()).filter((r) => r.farmerId === params.farmerId);
    const sumRatings = existingRatings.reduce((sum, r) => sum + r.ratingScore, 0);
    farmerAccount.averageRatingScore = Math.round((sumRatings / existingRatings.length) * 10) / 10;

    const farmerResult = this.awardLoyaltyPoints({
      userId: params.farmerId,
      role: 'FARMER',
      activityType: 'GENUINE_RATING_RECEIVED',
      title: `Received Genuine Rating (${params.ratingScore}★) from ${params.buyerName}`,
      points: this.loyaltyConfig.pointsRules.farmerRatingReceived,
      referenceId: rating.id,
      notes: `Crop quality: ${params.qualityFeedback}. Feedback: "${params.comments || 'No comments'}"`,
      idempotencyKey: `rating_farmer_${params.orderId}`,
    });

    return {
      success: true,
      rating,
      farmerAccount: farmerResult.account,
      buyerAccount: buyerResult.account,
    };
  }

  public repeatOrder(orderId: string, buyerId: string): { success: boolean; newRequest?: BuyerPurchaseRequest; error?: string } {
    const originalReq = this.purchaseRequests.get(orderId);
    if (!originalReq) {
      return { success: false, error: 'Original order not found' };
    }

    const newRequest: BuyerPurchaseRequest = {
      id: `req_rep_${Date.now()}`,
      harvestLotId: originalReq.harvestLotId,
      crop: originalReq.crop,
      quantityKg: originalReq.quantityKg,
      buyerId: buyerId || originalReq.buyerId,
      buyerName: originalReq.buyerName,
      buyerCompany: originalReq.buyerCompany,
      offeredPricePerKg: originalReq.offeredPricePerKg,
      totalOfferedInr: originalReq.totalOfferedInr,
      deliveryLocation: originalReq.deliveryLocation,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      clusterName: originalReq.clusterName,
      farmerName: originalReq.farmerName,
    };

    this.purchaseRequests.set(newRequest.id, newRequest);

    return {
      success: true,
      newRequest,
    };
  }

  private seedLoyaltyData() {
    // 1. Seed Real Fulfillable Rewards
    const rewardsList: LoyaltyRewardItem[] = [
      {
        id: 'rew_fee_waiver_50',
        title: '50% Platform Escrow Fee Waiver',
        description: 'Waive half of the standard 1.5% digital escrow settlement fee on your next completed marketplace trade.',
        category: 'FEE_WAIVER',
        eligibleRole: 'BOTH',
        minTier: 'SILVER',
        pointsCost: 250,
        discountValueText: '50% Escrow Fee Off',
        terms: 'Valid on 1 transaction within 45 days. Applied automatically at escrow lock stage.',
        expiryDays: 45,
        isAvailable: true,
        maxRedemptionsPerUser: 5,
        fulfilledByService: 'Escrow Settlement Smart Contract',
      },
      {
        id: 'rew_fee_waiver_100',
        title: '100% Zero-Fee Escrow Trade Voucher',
        description: 'Complete one verified harvest trade with 0.0% platform fee. Maximum fee subsidy of ₹3,000.',
        category: 'FEE_WAIVER',
        eligibleRole: 'BOTH',
        minTier: 'GOLD',
        pointsCost: 600,
        discountValueText: '100% Free Escrow Settlement',
        terms: 'Applicable on lots up to 10 Tons. Cannot be combined with other promotional codes.',
        expiryDays: 60,
        isAvailable: true,
        maxRedemptionsPerUser: 3,
        fulfilledByService: 'Escrow Settlement Smart Contract',
      },
      {
        id: 'rew_machinery_500',
        title: '₹500 Modern Equipment Rental Credit',
        description: 'Instant ₹500 discount on booking combine harvesters, laser levelers, or drone spraying via cluster machinery.',
        category: 'MACHINERY',
        eligibleRole: 'FARMER',
        minTier: 'SILVER',
        pointsCost: 400,
        discountValueText: '₹500 Equipment Credit',
        terms: 'Valid for all custom hiring centers listed in your district cluster. Minimum booking ₹1,500.',
        expiryDays: 90,
        isAvailable: true,
        maxRedemptionsPerUser: 4,
        fulfilledByService: 'Virtual Cluster Machinery Hub',
      },
      {
        id: 'rew_machinery_1200',
        title: '₹1,200 Priority Harvester Rental Voucher',
        description: 'Premium peak-season harvester reservation guarantee with ₹1,200 direct subsidy.',
        category: 'MACHINERY',
        eligibleRole: 'FARMER',
        minTier: 'GOLD',
        pointsCost: 950,
        discountValueText: '₹1,200 Machinery Subsidy',
        terms: 'Guaranteed 24-hr machine dispatch during harvesting window. Verified village champions assist operator.',
        expiryDays: 90,
        isAvailable: true,
        maxRedemptionsPerUser: 2,
        fulfilledByService: 'Virtual Cluster Machinery Hub',
      },
      {
        id: 'rew_logistics_750',
        title: '₹750 Freight & Fuel Mandi Transport Subsidy',
        description: 'Direct freight subsidy credited toward tractor trolley or tempo hauling from farm gate to central APMC depot.',
        category: 'LOGISTICS',
        eligibleRole: 'BOTH',
        minTier: 'SILVER',
        pointsCost: 500,
        discountValueText: '₹750 Logistics Rebate',
        terms: 'Must be routed through Kishan Bhai pooled transit logistics partner.',
        expiryDays: 60,
        isAvailable: true,
        maxRedemptionsPerUser: 4,
        fulfilledByService: 'Integrated Village Transport Dispatch',
      },
      {
        id: 'rew_quality_lab',
        title: 'Comprehensive Lab NIR Spectroscopy Moisture & Grade Test',
        description: 'Complimentary certified digital lab assay report for grain protein, oil content, and moisture percentage.',
        category: 'QUALITY_TESTING',
        eligibleRole: 'BOTH',
        minTier: 'SILVER',
        pointsCost: 350,
        discountValueText: 'Free Official Assay Report (₹600 Value)',
        terms: 'Conducted at district authorized NABL partner laboratory or village champion testing kiosk.',
        expiryDays: 120,
        isAvailable: true,
        maxRedemptionsPerUser: 6,
        fulfilledByService: 'Quality Assurance & Certification Desk',
      },
      {
        id: 'rew_priority_desk',
        title: '30-Day ICAR Agronomist & Trade Concierge Pass',
        description: 'Direct one-on-one phone and video consultation pass with certified ICAR senior agronomists and trade brokers.',
        category: 'PRIORITY_SUPPORT',
        eligibleRole: 'BOTH',
        minTier: 'PLATINUM',
        pointsCost: 1200,
        discountValueText: 'VIP Concierge Hotline Pass',
        terms: 'Priority queue with under 15-minute response SLA from 07:00 to 20:00 daily.',
        expiryDays: 30,
        isAvailable: true,
        maxRedemptionsPerUser: 1,
        fulfilledByService: 'ICAR Kisan Call Concierge',
      },
      {
        id: 'rew_procurement_bulk_disc',
        title: '₹2,500 Institutional Sourcing Fee Rebate',
        description: 'Procurement processing fee deduction for verified institutional purchases exceeding 5 Metric Tons.',
        category: 'FEE_WAIVER',
        eligibleRole: 'BUYER',
        minTier: 'PLATINUM',
        pointsCost: 1500,
        discountValueText: '₹2,500 Institutional Credit',
        terms: 'Single use per bulk PO. Automatically applied on settlement invoice.',
        expiryDays: 90,
        isAvailable: true,
        maxRedemptionsPerUser: 2,
        fulfilledByService: 'Institutional Buyer Mandi Desk',
      },
    ];

    rewardsList.forEach((r) => this.loyaltyRewards.set(r.id, r));

    // 2. Seed Realistic Farmer Loyalty Account (Ramesh Patel: Gold Tier with 750 points)
    const farmerId = 'usr_farmer_ramesh';
    const farmerAccount: LoyaltyAccount = {
      userId: farmerId,
      userName: 'Ramesh Patel',
      userRole: 'FARMER',
      tier: 'GOLD',
      points: 750,
      lifetimePointsEarned: 1150,
      pointsToNextTier: 750, // 1500 - 750
      nextTier: 'PLATINUM',
      progressPercent: 25, // (750-500)/1000 = 25%
      tierThresholds: { silver: 0, gold: 500, platinum: 1500, diamond: 3500 },
      unlockedBenefits: this.getUnlockedBenefits('FARMER', 'GOLD'),
      eligibleBulkOpportunities: true,
      eligiblePremiumMatches: false,
      prioritySupportUnlocked: false,
      repeatTransactionCount: 2,
      completedTransactionsCount: 4,
      ratingsCount: 3,
      averageRatingScore: 4.9,
      createdAt: '2026-06-15T09:00:00Z',
      updatedAt: '2026-09-17T09:00:00Z',
    };
    this.loyaltyAccounts.set(farmerId, farmerAccount);

    const farmerLedgerItems: LoyaltyLedgerEntry[] = [
      {
        id: 'led_f_01',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'PROFILE_VERIFICATION',
        title: 'Farmer Identity & Landholding Verification',
        pointsDelta: 100,
        resultingBalance: 100,
        timestamp: '2026-06-15T09:30:00Z',
        referenceId: 'verif_doc_7821',
        notes: 'Aadhaar + 7/12 Land Record verified by Sarpanch Vikram Jadeja.',
      },
      {
        id: 'led_f_02',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'QUALITY_STANDARDS_VERIFIED',
        title: 'Assay Lab Grade A Certification - Bt Cotton',
        pointsDelta: 50,
        resultingBalance: 150,
        timestamp: '2026-07-10T11:00:00Z',
        referenceId: 'lot_01',
        notes: 'Moisture 8.2% and fiber strength certified.',
      },
      {
        id: 'led_f_03',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'CROP_SALE_COMPLETED',
        title: 'Completed Crop Sale: Bt Cotton (4.5 Tons)',
        pointsDelta: 100,
        resultingBalance: 250,
        timestamp: '2026-07-20T14:00:00Z',
        referenceId: 'req_init_cotton',
        notes: 'Trade settled via secure Algorand Escrow with AgroPure Organics.',
      },
      {
        id: 'led_f_04',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'DELIVERY_CONFIRMED',
        title: 'Delivery Confirmed at Central Processing Depot',
        pointsDelta: 50,
        resultingBalance: 300,
        timestamp: '2026-07-22T10:30:00Z',
        referenceId: 'req_init_cotton',
        notes: 'Verified receipt by buyer receiver.',
      },
      {
        id: 'led_f_05',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'GENUINE_RATING_RECEIVED',
        title: 'Received 5-Star Rating from AgroPure Organics',
        pointsDelta: 20,
        resultingBalance: 320,
        timestamp: '2026-07-23T16:00:00Z',
        referenceId: 'rat_init_01',
        notes: 'Feedback: "Excellent staple length, clean packing, on-time haulage."',
      },
      {
        id: 'led_f_06',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'CROP_SALE_COMPLETED',
        title: 'Completed Crop Sale: Groundnut TG-37A (3.0 Tons)',
        pointsDelta: 100,
        resultingBalance: 420,
        timestamp: '2026-08-14T12:00:00Z',
        referenceId: 'req_init_groundnut',
        notes: 'Sold to regional oil processing federation.',
      },
      {
        id: 'led_f_07',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'DELIVERY_CONFIRMED',
        title: 'Delivery Confirmed: Groundnut Lot',
        pointsDelta: 50,
        resultingBalance: 470,
        timestamp: '2026-08-16T15:00:00Z',
        referenceId: 'req_init_groundnut',
        notes: 'Unloaded and weighed at Gondal yard.',
      },
      {
        id: 'led_f_08',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'REPEAT_TRANSACTION_BONUS',
        title: 'Repeat Transaction Loyalty Bonus',
        pointsDelta: 50,
        resultingBalance: 520,
        timestamp: '2026-08-20T10:00:00Z',
        referenceId: 'req_repeat_cotton_02',
        notes: 'Rewarded for completing 2nd consecutive direct trade with certified buyer.',
      },
      {
        id: 'led_f_09',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'CROP_SALE_COMPLETED',
        title: 'Completed Crop Sale: Sharbati Wheat (6.0 Tons)',
        pointsDelta: 100,
        resultingBalance: 620,
        timestamp: '2026-09-02T11:00:00Z',
        referenceId: 'req_init_wheat',
        notes: 'Clustered lot sale completed.',
      },
      {
        id: 'led_f_10',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'DELIVERY_CONFIRMED',
        title: 'Delivery Confirmed: Sharbati Wheat',
        pointsDelta: 50,
        resultingBalance: 670,
        timestamp: '2026-09-04T17:00:00Z',
        referenceId: 'req_init_wheat',
        notes: 'Dispatched and certified by warehouse inspector.',
      },
      {
        id: 'led_f_11',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'GENUINE_RATING_RECEIVED',
        title: 'Received 5-Star Rating from ITC Sourcing',
        pointsDelta: 20,
        resultingBalance: 690,
        timestamp: '2026-09-05T09:00:00Z',
        referenceId: 'rat_wheat_01',
        notes: 'Feedback: "Exceptional grain luster and zero moisture defect."',
      },
      {
        id: 'led_f_12',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'REWARD_REDEMPTION',
        title: 'Redeemed: ₹500 Modern Equipment Rental Credit',
        pointsDelta: -400,
        resultingBalance: 290,
        timestamp: '2026-09-12T15:00:00Z',
        referenceId: 'red_ramesh_01',
        notes: 'Voucher KB-MAC-SEPT26 used for laser leveler booking.',
      },
      {
        id: 'led_f_13',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'CROP_SALE_COMPLETED',
        title: 'Completed Crop Sale: Bt Cotton Bales (2.5 Tons)',
        pointsDelta: 100,
        resultingBalance: 390,
        timestamp: '2026-09-15T16:00:00Z',
        referenceId: 'req_cotton_bales_03',
        notes: 'Final pool harvest batch released.',
      },
      {
        id: 'led_f_14',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'DELIVERY_CONFIRMED',
        title: 'Delivery Confirmed: Final Cotton Batch',
        pointsDelta: 50,
        resultingBalance: 440,
        timestamp: '2026-09-16T12:00:00Z',
        referenceId: 'req_cotton_bales_03',
        notes: 'Final delivery recorded in escrow.',
      },
      {
        id: 'led_f_15',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'REPEAT_TRANSACTION_BONUS',
        title: 'Eligible Repeat Sourcing Bonus',
        pointsDelta: 50,
        resultingBalance: 490,
        timestamp: '2026-09-16T15:00:00Z',
        referenceId: 'req_cotton_bales_03',
        notes: 'Consecutive fulfillment reward.',
      },
      {
        id: 'led_f_16',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'QUALITY_STANDARDS_VERIFIED',
        title: 'Certified Organic Soil Carbon Standard',
        pointsDelta: 50,
        resultingBalance: 540,
        timestamp: '2026-09-16T17:00:00Z',
        referenceId: 'soil_cert_2026',
        notes: 'Soil organic carbon above 0.6% standard.',
      },
      {
        id: 'led_f_17',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'CROP_SALE_COMPLETED',
        title: 'Completed Crop Sale: Premium Cumin (1.2 Tons)',
        pointsDelta: 100,
        resultingBalance: 640,
        timestamp: '2026-09-17T08:00:00Z',
        referenceId: 'req_cumin_01',
        notes: 'High-grade cumin lot settled.',
      },
      {
        id: 'led_f_18',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'DELIVERY_CONFIRMED',
        title: 'Delivery Confirmed: Cumin Lot',
        pointsDelta: 50,
        resultingBalance: 690,
        timestamp: '2026-09-17T08:30:00Z',
        referenceId: 'req_cumin_01',
        notes: 'Delivered at regional collection center.',
      },
      {
        id: 'led_f_19',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'GENUINE_RATING_RECEIVED',
        title: 'Received 5-Star Rating from Buyer Desk',
        pointsDelta: 20,
        resultingBalance: 710,
        timestamp: '2026-09-17T08:45:00Z',
        referenceId: 'rat_cumin_01',
        notes: 'Buyer verified high purity.',
      },
      {
        id: 'led_f_20',
        userId: farmerId,
        userRole: 'FARMER',
        activityType: 'GENUINE_RATING_RECEIVED',
        title: 'Marketplace Commendation Rating',
        pointsDelta: 40,
        resultingBalance: 750,
        timestamp: '2026-09-17T09:00:00Z',
        referenceId: 'rat_comm_01',
        notes: 'Top performing grower in Anandpur Cluster.',
      },
    ];

    farmerLedgerItems.forEach((entry) => {
      this.loyaltyLedger.set(entry.id, entry);
      if (entry.referenceId) {
        this.processedLoyaltyEvents.add(`${entry.activityType}_${entry.referenceId}`);
      }
    });

    // Active voucher for Ramesh Patel
    const farmerVoucher: LoyaltyRewardRedemption = {
      id: 'red_ramesh_01',
      rewardId: 'rew_machinery_500',
      userId: farmerId,
      userRole: 'FARMER',
      pointsDeducted: 400,
      voucherCode: 'KB-MAC-SEPT26',
      rewardTitle: '₹500 Modern Equipment Rental Credit',
      discountValueText: '₹500 Equipment Credit',
      status: 'USED',
      redeemedAt: '2026-09-12T15:00:00Z',
      expiresAt: '2026-12-12T15:00:00Z',
      usedAt: '2026-09-13T10:00:00Z',
      usedOrderReferenceId: 'book_mach_laser_01',
    };
    this.loyaltyRedemptions.set(farmerVoucher.id, farmerVoucher);

    // 3. Seed Realistic Buyer Loyalty Accounts
    const buyerIds = ['usr_buyer_1', 'usr_buyer_itc'];
    buyerIds.forEach((bId) => {
      const buyerName = bId === 'usr_buyer_itc' ? 'Arunav Sengupta (ITC Sourcing)' : 'Vikram Mehta (AgroPure Organics)';
      const buyerAccount: LoyaltyAccount = {
        userId: bId,
        userName: buyerName,
        userRole: 'BUYER',
        tier: 'GOLD',
        points: 580,
        lifetimePointsEarned: 830,
        pointsToNextTier: 920, // 1500 - 580
        nextTier: 'PLATINUM',
        progressPercent: 8,
        tierThresholds: { silver: 0, gold: 500, platinum: 1500, diamond: 3500 },
        unlockedBenefits: this.getUnlockedBenefits('BUYER', 'GOLD'),
        eligibleBulkOpportunities: true,
        eligiblePremiumMatches: false,
        prioritySupportUnlocked: false,
        repeatTransactionCount: 2,
        completedTransactionsCount: 3,
        ratingsCount: 3,
        averageRatingScore: 5.0,
        createdAt: '2026-05-20T10:00:00Z',
        updatedAt: '2026-09-15T18:00:00Z',
      };
      this.loyaltyAccounts.set(bId, buyerAccount);

      const buyerLedger: LoyaltyLedgerEntry[] = [
        {
          id: `led_b_${bId}_01`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'PROFILE_VERIFICATION',
          title: 'Buyer Institutional Profile & GSTIN Verification',
          pointsDelta: 50,
          resultingBalance: 50,
          timestamp: '2026-05-20T10:30:00Z',
          referenceId: `buyer_gst_${bId}`,
          notes: 'Corporate KYC and mandi trading license verified.',
        },
        {
          id: `led_b_${bId}_02`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'PURCHASE_COMPLETED',
          title: 'Completed Purchase: Bt Cotton (4.5 Tons)',
          pointsDelta: 100,
          resultingBalance: 150,
          timestamp: '2026-07-20T14:30:00Z',
          referenceId: 'req_init_cotton',
          notes: 'Settled ₹3,15,000 to Anandpur Cluster escrow.',
        },
        {
          id: `led_b_${bId}_03`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'DELIVERY_CONFIRMED',
          title: 'Confirmed Successful Delivery of Cotton Lot',
          pointsDelta: 50,
          resultingBalance: 200,
          timestamp: '2026-07-22T11:00:00Z',
          referenceId: 'req_init_cotton',
          notes: 'Digital sign-off at Ahmedabad central warehouse.',
        },
        {
          id: `led_b_${bId}_04`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'GENUINE_RATING_SUBMITTED',
          title: 'Submitted Rating for Farmer Ramesh Patel',
          pointsDelta: 20,
          resultingBalance: 220,
          timestamp: '2026-07-23T16:00:00Z',
          referenceId: 'rat_init_01',
          notes: 'Awarded 5 stars for high quality and packaging.',
        },
        {
          id: `led_b_${bId}_05`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'PURCHASE_COMPLETED',
          title: 'Completed Purchase: Groundnut TG-37A (3.0 Tons)',
          pointsDelta: 100,
          resultingBalance: 320,
          timestamp: '2026-08-14T13:00:00Z',
          referenceId: 'req_init_groundnut',
          notes: 'Direct farm lot purchase settled.',
        },
        {
          id: `led_b_${bId}_06`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'DELIVERY_CONFIRMED',
          title: 'Confirmed Delivery of Groundnut Lot',
          pointsDelta: 50,
          resultingBalance: 370,
          timestamp: '2026-08-16T15:30:00Z',
          referenceId: 'req_init_groundnut',
          notes: 'Weighbridge slip certified.',
        },
        {
          id: `led_b_${bId}_07`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'GENUINE_RATING_SUBMITTED',
          title: 'Submitted Rating for Groundnut Lot',
          pointsDelta: 20,
          resultingBalance: 390,
          timestamp: '2026-08-17T09:00:00Z',
          referenceId: 'rat_init_groundnut',
          notes: 'Verified transaction feedback logged.',
        },
        {
          id: `led_b_${bId}_08`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'REPEAT_TRANSACTION_BONUS',
          title: 'Eligible Repeat Purchase Bonus',
          pointsDelta: 50,
          resultingBalance: 440,
          timestamp: '2026-08-20T10:30:00Z',
          referenceId: 'req_repeat_cotton_02',
          notes: 'Bonus credited for second repeat order with Anandpur cluster.',
        },
        {
          id: `led_b_${bId}_09`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'PURCHASE_COMPLETED',
          title: 'Completed Purchase: Sharbati Wheat (6.0 Tons)',
          pointsDelta: 100,
          resultingBalance: 540,
          timestamp: '2026-09-02T11:30:00Z',
          referenceId: 'req_init_wheat',
          notes: 'Large volume procurement completed.',
        },
        {
          id: `led_b_${bId}_10`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'DELIVERY_CONFIRMED',
          title: 'Confirmed Delivery of Wheat Lot',
          pointsDelta: 50,
          resultingBalance: 590,
          timestamp: '2026-09-04T17:30:00Z',
          referenceId: 'req_init_wheat',
          notes: 'Stored in climate-controlled grain silos.',
        },
        {
          id: `led_b_${bId}_11`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'GENUINE_RATING_SUBMITTED',
          title: 'Submitted Rating for Wheat Lot',
          pointsDelta: 20,
          resultingBalance: 610,
          timestamp: '2026-09-05T09:30:00Z',
          referenceId: 'rat_wheat_01',
          notes: 'Commended low moisture content.',
        },
        {
          id: `led_b_${bId}_12`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'REPEAT_TRANSACTION_BONUS',
          title: 'Eligible Repeat Sourcing Bonus',
          pointsDelta: 50,
          resultingBalance: 660,
          timestamp: '2026-09-12T12:30:00Z',
          referenceId: 'req_repeat_wheat_02',
          notes: 'Multi-order partnership milestone.',
        },
        {
          id: `led_b_${bId}_13`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'REWARD_REDEMPTION',
          title: 'Redeemed: 50% Platform Escrow Fee Waiver',
          pointsDelta: -250,
          resultingBalance: 410,
          timestamp: '2026-09-13T14:00:00Z',
          referenceId: `red_buyer_${bId}_01`,
          notes: 'Voucher KB-FEE-BUYER50 generated.',
        },
        {
          id: `led_b_${bId}_14`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'PURCHASE_COMPLETED',
          title: 'Completed Purchase: Cumin Lot (1.2 Tons)',
          pointsDelta: 100,
          resultingBalance: 510,
          timestamp: '2026-09-14T12:00:00Z',
          referenceId: 'req_cumin_01',
          notes: 'Direct grower purchase.',
        },
        {
          id: `led_b_${bId}_15`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'DELIVERY_CONFIRMED',
          title: 'Confirmed Delivery of Cumin Lot',
          pointsDelta: 50,
          resultingBalance: 560,
          timestamp: '2026-09-14T16:00:00Z',
          referenceId: 'req_cumin_01',
          notes: 'Inspected and stamped.',
        },
        {
          id: `led_b_${bId}_16`,
          userId: bId,
          userRole: 'BUYER',
          activityType: 'GENUINE_RATING_SUBMITTED',
          title: 'Submitted Rating for Cumin Sourcing',
          pointsDelta: 20,
          resultingBalance: 580,
          timestamp: '2026-09-15T18:00:00Z',
          referenceId: 'rat_cumin_01',
          notes: '5 stars for aroma and purity.',
        },
      ];

      buyerLedger.forEach((entry) => {
        this.loyaltyLedger.set(entry.id, entry);
        if (entry.referenceId) {
          this.processedLoyaltyEvents.add(`${entry.activityType}_${entry.referenceId}`);
        }
      });

      // Active voucher for buyer
      const buyerVoucher: LoyaltyRewardRedemption = {
        id: `red_buyer_${bId}_01`,
        rewardId: 'rew_fee_waiver_50',
        userId: bId,
        userRole: 'BUYER',
        pointsDeducted: 250,
        voucherCode: `KB-FEE-${bId === 'usr_buyer_1' ? 'AGRO50' : 'ITC50'}`,
        rewardTitle: '50% Platform Escrow Fee Waiver',
        discountValueText: '50% Escrow Fee Off',
        status: 'ACTIVE',
        redeemedAt: '2026-09-13T14:00:00Z',
        expiresAt: '2026-10-28T14:00:00Z',
      };
      this.loyaltyRedemptions.set(buyerVoucher.id, buyerVoucher);
    });

    // Seed order rating
    const rating1: OrderRating = {
      id: 'rat_init_01',
      orderId: 'req_init_cotton',
      farmerId: 'usr_farmer_ramesh',
      buyerId: 'usr_buyer_1',
      buyerName: 'Vikram Mehta (AgroPure Organics)',
      ratingScore: 5,
      qualityFeedback: 'EXCELLENT',
      deliveryOnTime: true,
      comments: 'Impeccable staple length and zero seed contamination. Delivered smoothly to Ahmedabad depot.',
      submittedAt: '2026-07-23T16:00:00Z',
    };
    this.orderRatings.set(rating1.id, rating1);
  }
}

export const db = new InMemoryDB();
