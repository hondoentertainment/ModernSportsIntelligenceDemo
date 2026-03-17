// ---------------------------------------------------------------------------
// Group Vault & Shared Storage Service
// Co-located physical storage vaults with fractional access control,
// shared security costs, climate monitoring, and insurance.
// ---------------------------------------------------------------------------

export type VaultTier = 'standard' | 'premium' | 'ultra-secure';
export type AccessLevel = 'view-only' | 'deposit' | 'withdraw' | 'full';
export type StorageCondition = 'optimal' | 'acceptable' | 'warning' | 'critical';

export interface VaultMember {
  userId: string;
  handle: string;
  accessLevel: AccessLevel;
  itemsStored: number;
  valueStored: number;
  monthlyShare: number;
  joinedDate: string;
  lastAccess: string;
  depositCount: number;
  withdrawCount: number;
}

export interface StoredItem {
  id: string;
  ownerHandle: string;
  cardName: string;
  grade: string | null;
  estimatedValue: number;
  depositDate: string;
  location: string;
  condition: StorageCondition;
  insured: boolean;
  lastInspection: string;
}

export interface VaultEnvironment {
  temperature: number;
  humidity: number;
  uvIndex: number;
  lastUpdated: string;
  status: StorageCondition;
  alerts: string[];
}

export interface GroupVault {
  id: string;
  name: string;
  tier: VaultTier;
  facility: string;
  city: string;
  state: string;
  memberCount: number;
  maxMembers: number;
  totalItems: number;
  totalValue: number;
  monthlyBaseCost: number;
  costPerMember: number;
  individualEquivalent: number;
  savingsPercent: number;
  members: VaultMember[];
  recentItems: StoredItem[];
  environment: VaultEnvironment;
  securityFeatures: string[];
  insurance: boolean;
  lastAudit: string;
}

export interface GroupVaultStats {
  totalVaults: number;
  totalMembers: number;
  totalItemsStored: number;
  totalValueProtected: number;
  avgSavingsPercent: number;
  avgConditionScore: number;
  securityIncidents: number;
  uptime: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

export function getGroupVaults(): GroupVault[] {
  return [
    {
      id: 'vault-nyc-ultra-01',
      name: 'Manhattan High-Value Vault',
      tier: 'ultra-secure',
      facility: 'Iron Mountain NYC - Vault Wing C',
      city: 'New York',
      state: 'NY',
      memberCount: 5,
      maxMembers: 8,
      totalItems: 23,
      totalValue: 487500,
      monthlyBaseCost: 1200,
      costPerMember: 240,
      individualEquivalent: 650,
      savingsPercent: 63,
      members: [
        {
          userId: 'u-001',
          handle: 'GrailHunterNYC',
          accessLevel: 'full',
          itemsStored: 7,
          valueStored: 185000,
          monthlyShare: 240,
          joinedDate: '2024-08-15',
          lastAccess: '2026-03-14',
          depositCount: 12,
          withdrawCount: 3,
        },
        {
          userId: 'u-002',
          handle: 'VintageKingpin',
          accessLevel: 'full',
          itemsStored: 6,
          valueStored: 142000,
          monthlyShare: 240,
          joinedDate: '2024-09-02',
          lastAccess: '2026-03-12',
          depositCount: 9,
          withdrawCount: 2,
        },
        {
          userId: 'u-003',
          handle: 'CardVaultPro',
          accessLevel: 'withdraw',
          itemsStored: 5,
          valueStored: 98500,
          monthlyShare: 240,
          joinedDate: '2024-11-20',
          lastAccess: '2026-03-10',
          depositCount: 7,
          withdrawCount: 1,
        },
        {
          userId: 'u-004',
          handle: 'SlabCollector88',
          accessLevel: 'deposit',
          itemsStored: 3,
          valueStored: 47000,
          monthlyShare: 240,
          joinedDate: '2025-02-10',
          lastAccess: '2026-03-08',
          depositCount: 4,
          withdrawCount: 0,
        },
        {
          userId: 'u-005',
          handle: 'InvestorMike',
          accessLevel: 'view-only',
          itemsStored: 2,
          valueStored: 15000,
          monthlyShare: 240,
          joinedDate: '2025-06-01',
          lastAccess: '2026-03-05',
          depositCount: 2,
          withdrawCount: 0,
        },
      ],
      recentItems: [
        {
          id: 'item-001',
          ownerHandle: 'GrailHunterNYC',
          cardName: '1986 Fleer Michael Jordan #57',
          grade: 'PSA 9',
          estimatedValue: 52000,
          depositDate: '2025-11-03',
          location: 'Drawer A-12',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-03-01',
        },
        {
          id: 'item-002',
          ownerHandle: 'VintageKingpin',
          cardName: '1952 Topps Mickey Mantle #311',
          grade: 'SGC 4',
          estimatedValue: 78000,
          depositDate: '2025-08-22',
          location: 'Drawer A-03',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-03-01',
        },
        {
          id: 'item-003',
          ownerHandle: 'CardVaultPro',
          cardName: '2003 Topps Chrome LeBron James #111',
          grade: 'BGS 9.5',
          estimatedValue: 38500,
          depositDate: '2025-12-15',
          location: 'Drawer B-07',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-03-01',
        },
        {
          id: 'item-004',
          ownerHandle: 'GrailHunterNYC',
          cardName: '1979 O-Pee-Chee Wayne Gretzky #18',
          grade: 'PSA 8',
          estimatedValue: 64000,
          depositDate: '2025-09-10',
          location: 'Drawer A-14',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-03-01',
        },
        {
          id: 'item-005',
          ownerHandle: 'SlabCollector88',
          cardName: '2018 Panini Prizm Luka Doncic #280',
          grade: 'PSA 10',
          estimatedValue: 27000,
          depositDate: '2026-01-05',
          location: 'Drawer B-11',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-03-01',
        },
        {
          id: 'item-006',
          ownerHandle: 'VintageKingpin',
          cardName: '1955 Topps Roberto Clemente #164',
          grade: 'PSA 6',
          estimatedValue: 41000,
          depositDate: '2025-10-18',
          location: 'Drawer A-06',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-03-01',
        },
      ],
      environment: {
        temperature: 68.2,
        humidity: 42.5,
        uvIndex: 0.0,
        lastUpdated: '2026-03-17T08:30:00Z',
        status: 'optimal',
        alerts: [],
      },
      securityFeatures: [
        'Biometric access control',
        '24/7 armed security',
        'Seismic-rated vault door',
        'Argon fire suppression',
        'Dual-person entry protocol',
        'Real-time CCTV with AI monitoring',
      ],
      insurance: true,
      lastAudit: '2026-02-28',
    },
    {
      id: 'vault-dal-prem-01',
      name: 'Dallas Sealed Wax Vault',
      tier: 'premium',
      facility: 'SecureVault Dallas - Climate Wing',
      city: 'Dallas',
      state: 'TX',
      memberCount: 4,
      maxMembers: 10,
      totalItems: 18,
      totalValue: 215800,
      monthlyBaseCost: 750,
      costPerMember: 187.5,
      individualEquivalent: 450,
      savingsPercent: 58,
      members: [
        {
          userId: 'u-010',
          handle: 'WaxBreaker_TX',
          accessLevel: 'full',
          itemsStored: 6,
          valueStored: 82000,
          monthlyShare: 187.5,
          joinedDate: '2025-01-12',
          lastAccess: '2026-03-15',
          depositCount: 10,
          withdrawCount: 4,
        },
        {
          userId: 'u-011',
          handle: 'SealedDealDave',
          accessLevel: 'full',
          itemsStored: 5,
          valueStored: 65000,
          monthlyShare: 187.5,
          joinedDate: '2025-03-08',
          lastAccess: '2026-03-13',
          depositCount: 8,
          withdrawCount: 2,
        },
        {
          userId: 'u-012',
          handle: 'LoneStarCards',
          accessLevel: 'withdraw',
          itemsStored: 4,
          valueStored: 44800,
          monthlyShare: 187.5,
          joinedDate: '2025-05-20',
          lastAccess: '2026-03-11',
          depositCount: 6,
          withdrawCount: 1,
        },
        {
          userId: 'u-013',
          handle: 'HobbyBoxKing',
          accessLevel: 'deposit',
          itemsStored: 3,
          valueStored: 24000,
          monthlyShare: 187.5,
          joinedDate: '2025-08-15',
          lastAccess: '2026-03-09',
          depositCount: 3,
          withdrawCount: 0,
        },
      ],
      recentItems: [
        {
          id: 'item-020',
          ownerHandle: 'WaxBreaker_TX',
          cardName: '2020 Panini Prizm Football Hobby Box (Sealed)',
          grade: null,
          estimatedValue: 18500,
          depositDate: '2025-11-20',
          location: 'Shelf C-02',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-02-28',
        },
        {
          id: 'item-021',
          ownerHandle: 'SealedDealDave',
          cardName: '2003 Topps Chrome Basketball Hobby Box (Sealed)',
          grade: null,
          estimatedValue: 32000,
          depositDate: '2025-09-14',
          location: 'Shelf C-05',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-02-28',
        },
        {
          id: 'item-022',
          ownerHandle: 'LoneStarCards',
          cardName: '1986 Fleer Basketball Wax Pack (Sealed)',
          grade: null,
          estimatedValue: 14500,
          depositDate: '2026-01-10',
          location: 'Shelf D-01',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-02-28',
        },
        {
          id: 'item-023',
          ownerHandle: 'WaxBreaker_TX',
          cardName: '2018 Panini National Treasures Football Hobby Box (Sealed)',
          grade: null,
          estimatedValue: 22000,
          depositDate: '2025-12-05',
          location: 'Shelf C-08',
          condition: 'acceptable',
          insured: true,
          lastInspection: '2026-02-28',
        },
        {
          id: 'item-024',
          ownerHandle: 'HobbyBoxKing',
          cardName: '2021 Topps Chrome Baseball Hobby Box (Sealed)',
          grade: null,
          estimatedValue: 8500,
          depositDate: '2026-02-18',
          location: 'Shelf D-04',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-02-28',
        },
      ],
      environment: {
        temperature: 69.8,
        humidity: 44.1,
        uvIndex: 0.1,
        lastUpdated: '2026-03-17T08:15:00Z',
        status: 'optimal',
        alerts: [],
      },
      securityFeatures: [
        'Keycard + PIN access control',
        '24/7 security monitoring',
        'Climate-controlled environment',
        'FM-200 fire suppression',
        'Motion-activated cameras',
      ],
      insurance: true,
      lastAudit: '2026-02-15',
    },
    {
      id: 'vault-chi-std-01',
      name: 'Chicago General Collection Vault',
      tier: 'standard',
      facility: 'Midwest Safe Storage - Unit 14',
      city: 'Chicago',
      state: 'IL',
      memberCount: 3,
      maxMembers: 12,
      totalItems: 42,
      totalValue: 86200,
      monthlyBaseCost: 400,
      costPerMember: 133.33,
      individualEquivalent: 275,
      savingsPercent: 52,
      members: [
        {
          userId: 'u-020',
          handle: 'WindyCityCards',
          accessLevel: 'full',
          itemsStored: 18,
          valueStored: 38500,
          monthlyShare: 133.33,
          joinedDate: '2025-04-01',
          lastAccess: '2026-03-16',
          depositCount: 22,
          withdrawCount: 6,
        },
        {
          userId: 'u-021',
          handle: 'MidwestFlips',
          accessLevel: 'withdraw',
          itemsStored: 14,
          valueStored: 29700,
          monthlyShare: 133.33,
          joinedDate: '2025-06-15',
          lastAccess: '2026-03-14',
          depositCount: 18,
          withdrawCount: 5,
        },
        {
          userId: 'u-022',
          handle: 'ChiTownCollector',
          accessLevel: 'deposit',
          itemsStored: 10,
          valueStored: 18000,
          monthlyShare: 133.33,
          joinedDate: '2025-09-30',
          lastAccess: '2026-03-07',
          depositCount: 11,
          withdrawCount: 0,
        },
      ],
      recentItems: [
        {
          id: 'item-040',
          ownerHandle: 'WindyCityCards',
          cardName: '2020 Panini Mosaic Justin Herbert #211',
          grade: 'PSA 10',
          estimatedValue: 4200,
          depositDate: '2026-02-01',
          location: 'Box F-03',
          condition: 'optimal',
          insured: true,
          lastInspection: '2026-03-10',
        },
        {
          id: 'item-041',
          ownerHandle: 'MidwestFlips',
          cardName: '2019 Panini Prizm Zion Williamson #248',
          grade: 'PSA 9',
          estimatedValue: 3800,
          depositDate: '2026-01-22',
          location: 'Box F-07',
          condition: 'optimal',
          insured: false,
          lastInspection: '2026-03-10',
        },
        {
          id: 'item-042',
          ownerHandle: 'ChiTownCollector',
          cardName: '2021 Topps Chrome Wander Franco #1',
          grade: 'BGS 9.5',
          estimatedValue: 2100,
          depositDate: '2026-02-14',
          location: 'Box G-01',
          condition: 'acceptable',
          insured: false,
          lastInspection: '2026-03-10',
        },
        {
          id: 'item-043',
          ownerHandle: 'WindyCityCards',
          cardName: '2022 Panini Prizm Paolo Banchero #233',
          grade: 'PSA 10',
          estimatedValue: 1850,
          depositDate: '2026-03-02',
          location: 'Box F-12',
          condition: 'optimal',
          insured: false,
          lastInspection: '2026-03-10',
        },
      ],
      environment: {
        temperature: 71.4,
        humidity: 48.3,
        uvIndex: 0.3,
        lastUpdated: '2026-03-17T07:45:00Z',
        status: 'acceptable',
        alerts: ['Humidity slightly above target range (45%). Dehumidifier check scheduled.'],
      },
      securityFeatures: [
        'Electronic keypad access',
        'Security camera recording',
        'Climate monitoring sensors',
        'Smoke detection system',
      ],
      insurance: true,
      lastAudit: '2026-01-31',
    },
  ];
}

export function getGroupVaultStats(): GroupVaultStats {
  const vaults = getGroupVaults();
  const totalMembers = vaults.reduce((s, v) => s + v.memberCount, 0);
  const totalItems = vaults.reduce((s, v) => s + v.totalItems, 0);
  const totalValue = vaults.reduce((s, v) => s + v.totalValue, 0);
  const avgSavings = vaults.reduce((s, v) => s + v.savingsPercent, 0) / vaults.length;
  const conditionScores: Record<StorageCondition, number> = {
    optimal: 100,
    acceptable: 80,
    warning: 50,
    critical: 20,
  };
  const avgCondition =
    vaults.reduce((s, v) => s + conditionScores[v.environment.status], 0) / vaults.length;

  return {
    totalVaults: vaults.length,
    totalMembers,
    totalItemsStored: totalItems,
    totalValueProtected: totalValue,
    avgSavingsPercent: Math.round(avgSavings),
    avgConditionScore: Math.round(avgCondition * 10) / 10,
    securityIncidents: 0,
    uptime: 99.97,
  };
}

export function getVaultTierColor(tier: VaultTier): string {
  switch (tier) {
    case 'ultra-secure':
      return 'text-purple-400';
    case 'premium':
      return 'text-amber-400';
    case 'standard':
      return 'text-blue-400';
  }
}

export function getConditionColor(condition: StorageCondition): string {
  switch (condition) {
    case 'optimal':
      return 'text-emerald-400';
    case 'acceptable':
      return 'text-yellow-400';
    case 'warning':
      return 'text-orange-400';
    case 'critical':
      return 'text-red-400';
  }
}

export function getAccessLevelColor(level: AccessLevel): string {
  switch (level) {
    case 'full':
      return 'text-emerald-400';
    case 'withdraw':
      return 'text-blue-400';
    case 'deposit':
      return 'text-amber-400';
    case 'view-only':
      return 'text-slate-400';
  }
}
