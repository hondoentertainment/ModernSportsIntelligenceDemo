// ---------------------------------------------------------------------------
// Group Insurance & Risk Pool Service
// Shared insurance premiums for high-value collections with pooled coverage
// that drops per-card cost 40-60% compared to individual policies.
// ---------------------------------------------------------------------------

// ---- Types ----------------------------------------------------------------

export type PoolTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type CoverageType = 'theft' | 'fire' | 'water' | 'transit' | 'accidental' | 'comprehensive';
export type ClaimStatus = 'filed' | 'under-review' | 'approved' | 'denied' | 'paid';

// ---- Interfaces -----------------------------------------------------------

export interface PoolMember {
  userId: string;
  handle: string;
  insuredValue: number;
  premium: number;
  coverageTypes: CoverageType[];
  cardsInsured: number;
  claimsHistory: number;
  joinedDate: string;
  riskScore: number;
}

export interface InsuranceClaim {
  id: string;
  memberHandle: string;
  cardName: string;
  claimValue: number;
  cause: CoverageType;
  filedDate: string;
  status: ClaimStatus;
  resolvedDate: string | null;
  paidAmount: number | null;
  evidence: string[];
  adjusterNotes: string | null;
}

export interface InsurancePool {
  id: string;
  name: string;
  tier: PoolTier;
  memberCount: number;
  maxMembers: number;
  totalInsuredValue: number;
  poolPremium: number;
  individualEquivalent: number;
  savingsPercent: number;
  coverageTypes: CoverageType[];
  claims: InsuranceClaim[];
  claimRatio: number;
  deductible: number;
  maxPayout: number;
  renewalDate: string;
}

export interface GroupInsuranceStats {
  totalPools: number;
  totalMembers: number;
  totalInsuredValue: number;
  avgSavings: number;
  claimsProcessed: number;
  claimsPaid: number;
  avgClaimTime: number;
  poolHealth: number;
}

// ---- Mock Members ---------------------------------------------------------

const goldMembers: PoolMember[] = [
  {
    userId: 'u-001', handle: 'VintageKingpin', insuredValue: 87500, premium: 1312,
    coverageTypes: ['theft', 'fire', 'water', 'transit', 'accidental', 'comprehensive'],
    cardsInsured: 42, claimsHistory: 1, joinedDate: '2024-03-15', riskScore: 12,
  },
  {
    userId: 'u-002', handle: 'GradedGems99', insuredValue: 134200, premium: 2013,
    coverageTypes: ['theft', 'fire', 'water', 'transit', 'accidental', 'comprehensive'],
    cardsInsured: 67, claimsHistory: 0, joinedDate: '2024-01-08', riskScore: 8,
  },
  {
    userId: 'u-003', handle: 'RookieHunter', insuredValue: 61800, premium: 927,
    coverageTypes: ['theft', 'fire', 'comprehensive'],
    cardsInsured: 28, claimsHistory: 2, joinedDate: '2024-06-22', riskScore: 22,
  },
  {
    userId: 'u-004', handle: 'SlabStack', insuredValue: 98400, premium: 1476,
    coverageTypes: ['theft', 'fire', 'water', 'transit', 'accidental', 'comprehensive'],
    cardsInsured: 53, claimsHistory: 0, joinedDate: '2024-02-10', riskScore: 10,
  },
  {
    userId: 'u-005', handle: 'MintCondition', insuredValue: 45700, premium: 685,
    coverageTypes: ['theft', 'fire', 'water', 'comprehensive'],
    cardsInsured: 19, claimsHistory: 1, joinedDate: '2024-09-04', riskScore: 15,
  },
];

const silverMembers: PoolMember[] = [
  {
    userId: 'u-010', handle: 'TransitTrader', insuredValue: 32400, premium: 486,
    coverageTypes: ['transit', 'theft', 'accidental'],
    cardsInsured: 85, claimsHistory: 3, joinedDate: '2024-04-12', riskScore: 28,
  },
  {
    userId: 'u-011', handle: 'ShipSafe', insuredValue: 28600, premium: 429,
    coverageTypes: ['transit', 'theft'],
    cardsInsured: 112, claimsHistory: 1, joinedDate: '2024-05-20', riskScore: 18,
  },
  {
    userId: 'u-012', handle: 'FlipKingPro', insuredValue: 19800, premium: 297,
    coverageTypes: ['transit', 'accidental'],
    cardsInsured: 64, claimsHistory: 0, joinedDate: '2024-07-01', riskScore: 14,
  },
  {
    userId: 'u-013', handle: 'CardMover', insuredValue: 41200, premium: 618,
    coverageTypes: ['transit', 'theft', 'accidental'],
    cardsInsured: 93, claimsHistory: 2, joinedDate: '2024-03-28', riskScore: 24,
  },
];

const platinumMembers: PoolMember[] = [
  {
    userId: 'u-020', handle: 'WhaleCollector', insuredValue: 412000, premium: 4944,
    coverageTypes: ['theft', 'fire', 'water', 'transit', 'accidental', 'comprehensive'],
    cardsInsured: 18, claimsHistory: 0, joinedDate: '2023-11-15', riskScore: 6,
  },
  {
    userId: 'u-021', handle: 'HallOfFameVault', insuredValue: 287500, premium: 3450,
    coverageTypes: ['theft', 'fire', 'water', 'transit', 'accidental', 'comprehensive'],
    cardsInsured: 12, claimsHistory: 1, joinedDate: '2023-12-01', riskScore: 9,
  },
  {
    userId: 'u-022', handle: 'PSA10King', insuredValue: 198300, premium: 2379,
    coverageTypes: ['theft', 'fire', 'water', 'transit', 'comprehensive'],
    cardsInsured: 8, claimsHistory: 0, joinedDate: '2024-01-20', riskScore: 7,
  },
  {
    userId: 'u-023', handle: 'LegacyInvestor', insuredValue: 523000, premium: 6276,
    coverageTypes: ['theft', 'fire', 'water', 'transit', 'accidental', 'comprehensive'],
    cardsInsured: 24, claimsHistory: 0, joinedDate: '2023-10-08', riskScore: 5,
  },
  {
    userId: 'u-024', handle: 'GrailHunterX', insuredValue: 165400, premium: 1984,
    coverageTypes: ['theft', 'fire', 'comprehensive'],
    cardsInsured: 6, claimsHistory: 1, joinedDate: '2024-04-14', riskScore: 11,
  },
];

// ---- Mock Claims ----------------------------------------------------------

const goldClaims: InsuranceClaim[] = [
  {
    id: 'clm-001', memberHandle: 'VintageKingpin', cardName: '1986 Fleer Michael Jordan #57 PSA 9',
    claimValue: 12500, cause: 'water', filedDate: '2025-08-14', status: 'paid',
    resolvedDate: '2025-09-02', paidAmount: 11875, evidence: ['photo_damage_front.jpg', 'photo_damage_back.jpg', 'humidity_log.pdf'],
    adjusterNotes: 'Water damage confirmed from basement flooding. Deductible applied.',
  },
  {
    id: 'clm-002', memberHandle: 'RookieHunter', cardName: '2018 Panini Prizm Luka Doncic #280 BGS 9.5',
    claimValue: 4200, cause: 'accidental', filedDate: '2025-11-03', status: 'under-review',
    resolvedDate: null, paidAmount: null, evidence: ['photo_crease.jpg', 'incident_report.pdf'],
    adjusterNotes: 'Awaiting independent grading verification of pre-existing condition.',
  },
  {
    id: 'clm-003', memberHandle: 'MintCondition', cardName: '2020 Panini Select Justin Herbert #44 PSA 10',
    claimValue: 1850, cause: 'transit', filedDate: '2025-12-18', status: 'approved',
    resolvedDate: '2026-01-10', paidAmount: 1662, evidence: ['usps_tracking.pdf', 'photo_package_damage.jpg', 'photo_card_bent.jpg'],
    adjusterNotes: 'Transit damage confirmed via carrier documentation. Payment processing.',
  },
];

const silverClaims: InsuranceClaim[] = [
  {
    id: 'clm-010', memberHandle: 'TransitTrader', cardName: '2021 Topps Chrome Wander Franco #1 PSA 10',
    claimValue: 890, cause: 'transit', filedDate: '2025-10-22', status: 'paid',
    resolvedDate: '2025-11-08', paidAmount: 801, evidence: ['fedex_claim.pdf', 'photo_crushed_box.jpg'],
    adjusterNotes: 'Package crushed in transit. Carrier liability confirmed.',
  },
  {
    id: 'clm-011', memberHandle: 'CardMover', cardName: '2022 Topps Series 1 Julio Rodriguez #659 SGC 10',
    claimValue: 1250, cause: 'accidental', filedDate: '2026-01-05', status: 'denied',
    resolvedDate: '2026-01-28', paidAmount: null, evidence: ['photo_bent_corner.jpg'],
    adjusterNotes: 'Insufficient evidence of accidental damage. Pre-existing wear suspected.',
  },
];

const platinumClaims: InsuranceClaim[] = [
  {
    id: 'clm-020', memberHandle: 'HallOfFameVault', cardName: '1952 Topps Mickey Mantle #311 PSA 5',
    claimValue: 84000, cause: 'theft', filedDate: '2025-07-10', status: 'paid',
    resolvedDate: '2025-09-15', paidAmount: 79800,
    evidence: ['police_report.pdf', 'security_footage.mp4', 'inventory_log.pdf', 'appraisal_cert.pdf'],
    adjusterNotes: 'Theft confirmed via police investigation. Full payout minus deductible.',
  },
  {
    id: 'clm-021', memberHandle: 'GrailHunterX', cardName: '2003 Topps Chrome LeBron James #111 BGS 9.5',
    claimValue: 28500, cause: 'fire', filedDate: '2026-02-01', status: 'filed',
    resolvedDate: null, paidAmount: null, evidence: ['fire_dept_report.pdf', 'photo_damage.jpg'],
    adjusterNotes: null,
  },
];

// ---- Data Functions -------------------------------------------------------

export function getInsurancePools(): InsurancePool[] {
  return [
    {
      id: 'pool-gold',
      name: 'Gold Comprehensive Shield',
      tier: 'gold',
      memberCount: goldMembers.length,
      maxMembers: 25,
      totalInsuredValue: goldMembers.reduce((s, m) => s + m.insuredValue, 0),
      poolPremium: goldMembers.reduce((s, m) => s + m.premium, 0),
      individualEquivalent: goldMembers.reduce((s, m) => s + m.insuredValue, 0) * 0.038,
      savingsPercent: 53,
      coverageTypes: ['theft', 'fire', 'water', 'transit', 'accidental', 'comprehensive'],
      claims: goldClaims,
      claimRatio: 0.043,
      deductible: 500,
      maxPayout: 150000,
      renewalDate: '2026-06-15',
    },
    {
      id: 'pool-silver',
      name: 'Silver Transit Guard',
      tier: 'silver',
      memberCount: silverMembers.length,
      maxMembers: 40,
      totalInsuredValue: silverMembers.reduce((s, m) => s + m.insuredValue, 0),
      poolPremium: silverMembers.reduce((s, m) => s + m.premium, 0),
      individualEquivalent: silverMembers.reduce((s, m) => s + m.insuredValue, 0) * 0.028,
      savingsPercent: 46,
      coverageTypes: ['transit', 'theft', 'accidental'],
      claims: silverClaims,
      claimRatio: 0.061,
      deductible: 200,
      maxPayout: 50000,
      renewalDate: '2026-08-01',
    },
    {
      id: 'pool-platinum',
      name: 'Platinum High-Value Vault',
      tier: 'platinum',
      memberCount: platinumMembers.length,
      maxMembers: 15,
      totalInsuredValue: platinumMembers.reduce((s, m) => s + m.insuredValue, 0),
      poolPremium: platinumMembers.reduce((s, m) => s + m.premium, 0),
      individualEquivalent: platinumMembers.reduce((s, m) => s + m.insuredValue, 0) * 0.032,
      savingsPercent: 58,
      coverageTypes: ['theft', 'fire', 'water', 'transit', 'accidental', 'comprehensive'],
      claims: platinumClaims,
      claimRatio: 0.028,
      deductible: 2500,
      maxPayout: 750000,
      renewalDate: '2026-04-01',
    },
  ];
}

export function getPoolMembers(poolId: string): PoolMember[] {
  switch (poolId) {
    case 'pool-gold': return goldMembers;
    case 'pool-silver': return silverMembers;
    case 'pool-platinum': return platinumMembers;
    default: return [];
  }
}

export function getGroupInsuranceStats(): GroupInsuranceStats {
  const pools = getInsurancePools();
  const totalMembers = pools.reduce((s, p) => s + p.memberCount, 0);
  const totalInsuredValue = pools.reduce((s, p) => s + p.totalInsuredValue, 0);
  const avgSavings = pools.reduce((s, p) => s + p.savingsPercent, 0) / pools.length;
  const allClaims = pools.flatMap((p) => p.claims);
  const paidClaims = allClaims.filter((c) => c.status === 'paid');
  return {
    totalPools: pools.length,
    totalMembers,
    totalInsuredValue,
    avgSavings: Math.round(avgSavings * 10) / 10,
    claimsProcessed: allClaims.length,
    claimsPaid: paidClaims.length,
    avgClaimTime: 18.4,
    poolHealth: 94.2,
  };
}

// ---- Utility Functions ----------------------------------------------------

export function getPoolTierColor(tier: PoolTier): string {
  switch (tier) {
    case 'bronze': return 'text-orange-400';
    case 'silver': return 'text-slate-300';
    case 'gold': return 'text-amber-400';
    case 'platinum': return 'text-cyan-300';
  }
}

export function getPoolTierBg(tier: PoolTier): string {
  switch (tier) {
    case 'bronze': return 'bg-orange-500/20';
    case 'silver': return 'bg-slate-400/20';
    case 'gold': return 'bg-amber-500/20';
    case 'platinum': return 'bg-cyan-500/20';
  }
}

export function getClaimStatusColor(status: ClaimStatus): string {
  switch (status) {
    case 'filed': return 'text-blue-400';
    case 'under-review': return 'text-amber-400';
    case 'approved': return 'text-emerald-400';
    case 'denied': return 'text-red-400';
    case 'paid': return 'text-green-300';
  }
}

export function getClaimStatusBg(status: ClaimStatus): string {
  switch (status) {
    case 'filed': return 'bg-blue-500/20';
    case 'under-review': return 'bg-amber-500/20';
    case 'approved': return 'bg-emerald-500/20';
    case 'denied': return 'bg-red-500/20';
    case 'paid': return 'bg-green-500/20';
  }
}

export function getCoverageLabel(type: CoverageType): string {
  switch (type) {
    case 'theft': return 'Theft Protection';
    case 'fire': return 'Fire Damage';
    case 'water': return 'Water / Flood';
    case 'transit': return 'Transit / Shipping';
    case 'accidental': return 'Accidental Damage';
    case 'comprehensive': return 'Comprehensive';
  }
}

export function getCoverageIcon(type: CoverageType): string {
  switch (type) {
    case 'theft': return '🔒';
    case 'fire': return '🔥';
    case 'water': return '💧';
    case 'transit': return '📦';
    case 'accidental': return '⚠️';
    case 'comprehensive': return '🛡️';
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
