/**
 * Supabase Service Provider for Kishan Bhai
 * Handles real-time client initialization, strongly typed database schemas,
 * real-time subscriptions, and persistent CRUD operations for users, farms, and transactions.
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export interface DatabaseSchema {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<UserRow>;
      };
      farms: {
        Row: FarmRow;
        Insert: Omit<FarmRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<FarmRow>;
      };
      transactions: {
        Row: TransactionRow;
        Insert: Omit<TransactionRow, 'created_at'> & { created_at?: string };
        Update: Partial<TransactionRow>;
      };
      clusters: {
        Row: ClusterRow;
        Insert: Omit<ClusterRow, 'created_at'> & { created_at?: string };
        Update: Partial<ClusterRow>;
      };
      harvest_lots: {
        Row: HarvestLotRow;
        Insert: Omit<HarvestLotRow, 'created_at'> & { created_at?: string };
        Update: Partial<HarvestLotRow>;
      };
      bulk_orders: {
        Row: BulkOrderRow;
        Insert: Omit<BulkOrderRow, 'created_at'> & { created_at?: string };
        Update: Partial<BulkOrderRow>;
      };
    };
  };
}

// 1. Database Table Row Types
export interface UserRow {
  id: string;
  full_name: string;
  phone: string;
  role: 'FARMER' | 'CHAMPION' | 'ADMIN' | 'INSTITUTIONAL_BUYER';
  village: string;
  state: string;
  cluster_id?: string | null;
  preferred_language: 'hi' | 'en' | 'gu' | 'mr';
  is_verified?: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmRow {
  id: string;
  user_id: string;
  farm_name: string;
  size_acres: number;
  soil_type: 'Black Cotton (Regur)' | 'Alluvial Silt' | 'Red Sandy Loam' | 'Clayey Loam';
  irrigation_type: 'Drip' | 'Sprinkler' | 'Canal Furrow' | 'Rainfed';
  crops: string[];
  village: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  soil_ph?: number | null;
  organic_carbon_pct?: number | null;
  nitrogen_kg_ha?: number | null;
  phosphorus_kg_ha?: number | null;
  potassium_kg_ha?: number | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  amount_usdc: number;
  amount_inr?: number;
  asset: string;
  network: string;
  status: 'INITIATED' | 'PENDING' | 'SETTLED' | 'FAILED';
  tx_id: string;
  sender_address: string;
  receiver_address: string;
  facilitator: string;
  explorer_url: string;
  is_real_blockchain_tx: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ClusterRow {
  id: string;
  name: string;
  village: string;
  state: string;
  champion_id: string;
  champion_name: string;
  total_acres: number;
  member_count: number;
  primary_crops: string[];
  collective_harvest_kg: number;
  bulk_savings_percent: number;
  description?: string;
  created_at: string;
}

export interface HarvestLotRow {
  id: string;
  cluster_id: string;
  farmer_id: string;
  farmer_name: string;
  crop: string;
  variety: string;
  quantity_kg: number;
  quality_grade: 'A+ Export' | 'Grade A Premium' | 'Grade B Standard' | 'Organic Certified';
  expected_harvest_date: string;
  min_price_per_kg: number;
  status: 'AVAILABLE' | 'BID_ACCEPTED' | 'SOLD' | 'DISPATCHED';
  moisture_pct: number;
  notes?: string;
  created_at: string;
}

export interface BulkOrderRow {
  id: string;
  cluster_id: string;
  category: 'Fertilizer' | 'Seeds' | 'Pesticides' | 'Equipment';
  item_name: string;
  target_quantity: number;
  current_quantity: number;
  unit: string;
  standard_price: number;
  bulk_price: number;
  savings_pct: number;
  status: 'AGGREGATING' | 'ORDERED' | 'DISPATCHED' | 'DELIVERED';
  deadline_date: string;
  created_at: string;
}

// 2. Client Initialization (Environment-safe & Lazy)
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient<DatabaseSchema> | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-supabase'));
};

export const getSupabase = (): SupabaseClient<DatabaseSchema> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient<DatabaseSchema>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return clientInstance;
};

// 3. PostgreSQL Database Schema Definition (SQL DDL script)
export const SUPABASE_SQL_SCHEMA = `
-- ============================================================================
-- Kishan Bhai - PostgreSQL Schema for Supabase
-- Tables: users, farms, transactions, clusters, harvest_lots, bulk_orders
-- Includes Row Level Security (RLS) & Realtime Publication
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('FARMER', 'CHAMPION', 'ADMIN', 'INSTITUTIONAL_BUYER')),
  village TEXT NOT NULL,
  state TEXT NOT NULL,
  cluster_id TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'hi' CHECK (preferred_language IN ('hi', 'en', 'gu', 'mr')),
  is_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. FARMS TABLE
CREATE TABLE IF NOT EXISTS public.farms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  size_acres NUMERIC(6, 2) NOT NULL,
  soil_type TEXT NOT NULL,
  irrigation_type TEXT NOT NULL,
  crops TEXT[] NOT NULL DEFAULT '{}',
  village TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  soil_ph NUMERIC(4, 2),
  organic_carbon_pct NUMERIC(4, 2),
  nitrogen_kg_ha NUMERIC(6, 2),
  phosphorus_kg_ha NUMERIC(6, 2),
  potassium_kg_ha NUMERIC(6, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TRANSACTIONS TABLE (x402 & Algorand Settlements)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  amount_usdc NUMERIC(10, 4) NOT NULL,
  amount_inr NUMERIC(10, 2),
  asset TEXT NOT NULL DEFAULT 'USDC',
  network TEXT NOT NULL DEFAULT 'Algorand Testnet',
  status TEXT NOT NULL CHECK (status IN ('INITIATED', 'PENDING', 'SETTLED', 'FAILED')),
  tx_id TEXT NOT NULL UNIQUE,
  sender_address TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  facilitator TEXT NOT NULL DEFAULT 'GoPlausible',
  explorer_url TEXT NOT NULL,
  is_real_blockchain_tx BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CLUSTERS TABLE
CREATE TABLE IF NOT EXISTS public.clusters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  village TEXT NOT NULL,
  state TEXT NOT NULL,
  champion_id TEXT NOT NULL,
  champion_name TEXT NOT NULL,
  total_acres NUMERIC(8, 2) NOT NULL DEFAULT 0,
  member_count INT NOT NULL DEFAULT 1,
  primary_crops TEXT[] NOT NULL DEFAULT '{}',
  collective_harvest_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  bulk_savings_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. HARVEST LOTS TABLE
CREATE TABLE IF NOT EXISTS public.harvest_lots (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
  farmer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  crop TEXT NOT NULL,
  variety TEXT NOT NULL,
  quantity_kg NUMERIC(10, 2) NOT NULL,
  quality_grade TEXT NOT NULL,
  expected_harvest_date DATE NOT NULL,
  min_price_per_kg NUMERIC(8, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BID_ACCEPTED', 'SOLD', 'DISPATCHED')),
  moisture_pct NUMERIC(4, 2) NOT NULL DEFAULT 8.0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. BULK ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.bulk_orders (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Fertilizer', 'Seeds', 'Pesticides', 'Equipment')),
  item_name TEXT NOT NULL,
  target_quantity NUMERIC(10, 2) NOT NULL,
  current_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  standard_price NUMERIC(10, 2) NOT NULL,
  bulk_price NUMERIC(10, 2) NOT NULL,
  savings_pct NUMERIC(5, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'AGGREGATING' CHECK (status IN ('AGGREGATING', 'ORDERED', 'DISPATCHED', 'DELIVERED')),
  deadline_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Realtime Publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.users, public.farms, public.transactions, public.harvest_lots, public.bulk_orders;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;

-- Public Access Policies (Allow read/write for demo and collaborative cluster operations)
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public write users" ON public.users FOR ALL USING (true);

CREATE POLICY "Public read farms" ON public.farms FOR SELECT USING (true);
CREATE POLICY "Public write farms" ON public.farms FOR ALL USING (true);

CREATE POLICY "Public read transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public write transactions" ON public.transactions FOR ALL USING (true);

CREATE POLICY "Public read clusters" ON public.clusters FOR SELECT USING (true);
CREATE POLICY "Public write clusters" ON public.clusters FOR ALL USING (true);

CREATE POLICY "Public read harvest_lots" ON public.harvest_lots FOR SELECT USING (true);
CREATE POLICY "Public write harvest_lots" ON public.harvest_lots FOR ALL USING (true);

CREATE POLICY "Public read bulk_orders" ON public.bulk_orders FOR SELECT USING (true);
CREATE POLICY "Public write bulk_orders" ON public.bulk_orders FOR ALL USING (true);
`;

// 4. Real-time Service Layer & CRUD Handlers

/**
 * Real-time Subscription to Transactions Table
 */
export function subscribeToTransactions(
  onInsert: (tx: TransactionRow) => void,
  onUpdate?: (tx: TransactionRow) => void
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel('realtime_transactions')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions' },
      (payload) => onInsert(payload.new as TransactionRow)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'transactions' },
      (payload) => onUpdate && onUpdate(payload.new as TransactionRow)
    )
    .subscribe();

  return channel;
}

/**
 * Real-time Subscription to Farms Table
 */
export function subscribeToFarms(
  onUpdate: (farm: FarmRow) => void
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel('realtime_farms')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'farms' },
      (payload) => onUpdate(payload.new as FarmRow)
    )
    .subscribe();

  return channel;
}

/**
 * Real-time Subscription to Users Table
 */
export function subscribeToUsers(
  onUpdate: (user: UserRow) => void
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel('realtime_users')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'users' },
      (payload) => onUpdate(payload.new as UserRow)
    )
    .subscribe();

  return channel;
}

// 5. Data Access Methods with Fallback Resilience

/**
 * Fetch all farms for a specific user
 */
export async function getFarmsByUserId(userId: string): Promise<FarmRow[]> {
  const supabase = getSupabase();
  if (!supabase) {
    // Local memory fallback
    return [
      {
        id: 'farm_01',
        user_id: userId,
        farm_name: 'Anandpur North Field',
        size_acres: 4.5,
        soil_type: 'Black Cotton (Regur)',
        irrigation_type: 'Drip',
        crops: ['Cotton (Bt)', 'Groundnut (GG-20)', 'Sharbati Wheat'],
        village: 'Anandpur',
        state: 'Gujarat',
        latitude: 22.3039,
        longitude: 70.8022,
        soil_ph: 7.2,
        organic_carbon_pct: 0.65,
        nitrogen_kg_ha: 145,
        phosphorus_kg_ha: 22,
        potassium_kg_ha: 310,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.warn('[Supabase] Failed to fetch farms, returning empty list:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Save or update farm details
 */
export async function upsertFarm(farm: Partial<FarmRow> & { id: string; user_id: string }): Promise<FarmRow | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return farm as FarmRow;
  }

  const payload: any = {
    ...farm,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('farms')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Upsert farm error:', error.message);
    return null;
  }
  return data;
}

/**
 * Record a settled blockchain / x402 transaction
 */
export async function recordTransaction(tx: Omit<TransactionRow, 'created_at'>): Promise<TransactionRow | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ...tx, created_at: new Date().toISOString() };
  }

  const { data, error } = await (supabase.from('transactions') as any)
    .insert([tx])
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Record transaction error:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch recent transactions for a user
 */
export async function getTransactionsByUserId(userId: string): Promise<TransactionRow[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.warn('[Supabase] Fetch transactions error:', error.message);
    return [];
  }
  return data || [];
}
