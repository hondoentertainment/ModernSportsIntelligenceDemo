// Collection Insurance Vault Service
// Comprehensive insurance management for high-value sports card collections

// ---- Types ----

export type CoverageType = 'basic' | 'premium' | 'collector';

export type ClaimType = 'damage' | 'theft' | 'loss';

export type ClaimStatus = 'filed' | 'reviewing' | 'approved' | 'denied';

export type Priority = 'high' | 'medium' | 'low';

export interface InsuredItem {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  grade: string;
  imageUrl: string;
  purchasePrice: number;
  currentMarketValue: number;
  insuredValue: number;
  coverageType: CoverageType;
  premium: number;
  deductible: number;
  lastAppraisal: string;
  nextAppraisalDue: string;
  riskScore: number;
  storageLocation: string;
  condition: string;
  photos: string[];
}

export interface CoverageGap {
  id: string;
  itemId: string;
  cardName: string;
  currentCoverage: number;
  recommendedCoverage: number;
  gap: number;
  priority: Priority;
}

export interface InsuranceReport {
  totalInsuredValue: number;
  totalPremiums: number;
  coverageRatio: number;
  avgRiskScore: number;
  gapCount: number;
  lastUpdated: string;
}

export interface ClaimHistory {
  id: string;
  itemId: string;
  cardName: string;
  claimType: ClaimType;
  status: ClaimStatus;
  amount: number;
  filedDate: string;
  resolvedDate: string | null;
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_insurance_vault';
const ITEMS_KEY = `${STORAGE_PREFIX}_items`;
const CLAIMS_KEY = `${STORAGE_PREFIX}_claims`;

// ---- Premium Calculation Rates ----

const PREMIUM_RATES: Record<CoverageType, number> = {
  basic: 0.012,
  premium: 0.022,
  collector: 0.035,
};

const DEDUCTIBLE_RATES: Record<CoverageType, number> = {
  basic: 0.10,
  premium: 0.05,
  collector: 0.02,
};

// ---- Mock Data ----

const MOCK_INSURED_ITEMS: InsuredItem[] = [
  {
    id: 'ins-001',
    cardName: '2003 Topps Chrome LeBron James RC #111',
    player: 'LeBron James',
    sport: 'Basketball',
    year: 2003,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    imageUrl: '/cards/lebron-topps-chrome.jpg',
    purchasePrice: 45000,
    currentMarketValue: 72000,
    insuredValue: 70000,
    coverageType: 'collector',
    premium: 2450,
    deductible: 1400,
    lastAppraisal: '2025-11-15',
    nextAppraisalDue: '2026-05-15',
    riskScore: 25,
    storageLocation: 'PWCC Vault',
    condition: 'Gem Mint',
    photos: ['/photos/lebron-front.jpg', '/photos/lebron-back.jpg'],
  },
  {
    id: 'ins-002',
    cardName: '1986 Fleer Michael Jordan RC #57',
    player: 'Michael Jordan',
    sport: 'Basketball',
    year: 1986,
    set: 'Fleer',
    grade: 'PSA 9',
    imageUrl: '/cards/jordan-fleer.jpg',
    purchasePrice: 28000,
    currentMarketValue: 42000,
    insuredValue: 40000,
    coverageType: 'collector',
    premium: 1400,
    deductible: 800,
    lastAppraisal: '2025-09-20',
    nextAppraisalDue: '2026-03-20',
    riskScore: 30,
    storageLocation: 'PSA Vault',
    condition: 'Mint',
    photos: ['/photos/jordan-front.jpg'],
  },
  {
    id: 'ins-003',
    cardName: '2018 Panini Prizm Luka Doncic RC Silver',
    player: 'Luka Doncic',
    sport: 'Basketball',
    year: 2018,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    imageUrl: '/cards/luka-prizm.jpg',
    purchasePrice: 5500,
    currentMarketValue: 8200,
    insuredValue: 8000,
    coverageType: 'premium',
    premium: 176,
    deductible: 400,
    lastAppraisal: '2025-12-01',
    nextAppraisalDue: '2026-06-01',
    riskScore: 35,
    storageLocation: 'Home Safe',
    condition: 'Gem Mint',
    photos: ['/photos/luka-front.jpg'],
  },
  {
    id: 'ins-004',
    cardName: '2011 Topps Update Mike Trout RC #US175',
    player: 'Mike Trout',
    sport: 'Baseball',
    year: 2011,
    set: 'Topps Update',
    grade: 'PSA 10',
    imageUrl: '/cards/trout-topps.jpg',
    purchasePrice: 32000,
    currentMarketValue: 55000,
    insuredValue: 52000,
    coverageType: 'collector',
    premium: 1820,
    deductible: 1040,
    lastAppraisal: '2025-10-10',
    nextAppraisalDue: '2026-04-10',
    riskScore: 22,
    storageLocation: 'PWCC Vault',
    condition: 'Gem Mint',
    photos: ['/photos/trout-front.jpg', '/photos/trout-back.jpg'],
  },
  {
    id: 'ins-005',
    cardName: '1952 Topps Mickey Mantle #311',
    player: 'Mickey Mantle',
    sport: 'Baseball',
    year: 1952,
    set: 'Topps',
    grade: 'SGC 3',
    imageUrl: '/cards/mantle-topps.jpg',
    purchasePrice: 120000,
    currentMarketValue: 185000,
    insuredValue: 180000,
    coverageType: 'collector',
    premium: 6300,
    deductible: 3600,
    lastAppraisal: '2025-08-05',
    nextAppraisalDue: '2026-02-05',
    riskScore: 45,
    storageLocation: 'Bank Vault',
    condition: 'Very Good',
    photos: ['/photos/mantle-front.jpg'],
  },
  {
    id: 'ins-006',
    cardName: '2020 Panini Prizm Justin Herbert RC Silver',
    player: 'Justin Herbert',
    sport: 'Football',
    year: 2020,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    imageUrl: '/cards/herbert-prizm.jpg',
    purchasePrice: 1200,
    currentMarketValue: 1800,
    insuredValue: 1500,
    coverageType: 'basic',
    premium: 18,
    deductible: 150,
    lastAppraisal: '2025-07-20',
    nextAppraisalDue: '2026-01-20',
    riskScore: 50,
    storageLocation: 'Home Safe',
    condition: 'Gem Mint',
    photos: ['/photos/herbert-front.jpg'],
  },
  {
    id: 'ins-007',
    cardName: '2001 SP Authentic Tiger Woods RC Auto #45',
    player: 'Tiger Woods',
    sport: 'Golf',
    year: 2001,
    set: 'SP Authentic',
    grade: 'BGS 9.5',
    imageUrl: '/cards/tiger-sp.jpg',
    purchasePrice: 15000,
    currentMarketValue: 22000,
    insuredValue: 20000,
    coverageType: 'premium',
    premium: 440,
    deductible: 1000,
    lastAppraisal: '2025-11-01',
    nextAppraisalDue: '2026-05-01',
    riskScore: 28,
    storageLocation: 'PSA Vault',
    condition: 'Gem Mint',
    photos: ['/photos/tiger-front.jpg', '/photos/tiger-back.jpg'],
  },
  {
    id: 'ins-008',
    cardName: '2018 Topps Chrome Shohei Ohtani RC Auto',
    player: 'Shohei Ohtani',
    sport: 'Baseball',
    year: 2018,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    imageUrl: '/cards/ohtani-chrome.jpg',
    purchasePrice: 8500,
    currentMarketValue: 14000,
    insuredValue: 13000,
    coverageType: 'premium',
    premium: 286,
    deductible: 650,
    lastAppraisal: '2025-12-15',
    nextAppraisalDue: '2026-06-15',
    riskScore: 32,
    storageLocation: 'PWCC Vault',
    condition: 'Gem Mint',
    photos: ['/photos/ohtani-front.jpg'],
  },
  {
    id: 'ins-009',
    cardName: '2000 Playoff Contenders Tom Brady RC Auto #144',
    player: 'Tom Brady',
    sport: 'Football',
    year: 2000,
    set: 'Playoff Contenders',
    grade: 'PSA 9',
    imageUrl: '/cards/brady-contenders.jpg',
    purchasePrice: 250000,
    currentMarketValue: 380000,
    insuredValue: 350000,
    coverageType: 'collector',
    premium: 12250,
    deductible: 7000,
    lastAppraisal: '2025-10-01',
    nextAppraisalDue: '2026-04-01',
    riskScore: 18,
    storageLocation: 'Bank Vault',
    condition: 'Mint',
    photos: ['/photos/brady-front.jpg', '/photos/brady-back.jpg'],
  },
  {
    id: 'ins-010',
    cardName: '2019 Panini Prizm Zion Williamson RC Silver',
    player: 'Zion Williamson',
    sport: 'Basketball',
    year: 2019,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    imageUrl: '/cards/zion-prizm.jpg',
    purchasePrice: 2200,
    currentMarketValue: 3100,
    insuredValue: 2800,
    coverageType: 'basic',
    premium: 34,
    deductible: 280,
    lastAppraisal: '2025-06-15',
    nextAppraisalDue: '2025-12-15',
    riskScore: 55,
    storageLocation: 'Home Display',
    condition: 'Gem Mint',
    photos: ['/photos/zion-front.jpg'],
  },
  {
    id: 'ins-011',
    cardName: '1993 SP Derek Jeter RC Foil #279',
    player: 'Derek Jeter',
    sport: 'Baseball',
    year: 1993,
    set: 'SP',
    grade: 'PSA 10',
    imageUrl: '/cards/jeter-sp.jpg',
    purchasePrice: 65000,
    currentMarketValue: 95000,
    insuredValue: 90000,
    coverageType: 'collector',
    premium: 3150,
    deductible: 1800,
    lastAppraisal: '2025-09-01',
    nextAppraisalDue: '2026-03-01',
    riskScore: 20,
    storageLocation: 'PSA Vault',
    condition: 'Gem Mint',
    photos: ['/photos/jeter-front.jpg', '/photos/jeter-back.jpg'],
  },
  {
    id: 'ins-012',
    cardName: '2020 Panini National Treasures Joe Burrow RPA',
    player: 'Joe Burrow',
    sport: 'Football',
    year: 2020,
    set: 'National Treasures',
    grade: 'BGS 9.5',
    imageUrl: '/cards/burrow-nt.jpg',
    purchasePrice: 18000,
    currentMarketValue: 25000,
    insuredValue: 22000,
    coverageType: 'premium',
    premium: 484,
    deductible: 1100,
    lastAppraisal: '2025-11-20',
    nextAppraisalDue: '2026-05-20',
    riskScore: 33,
    storageLocation: 'PWCC Vault',
    condition: 'Gem Mint',
    photos: ['/photos/burrow-front.jpg'],
  },
  {
    id: 'ins-013',
    cardName: '2003 Upper Deck Exquisite LeBron James Patch Auto',
    player: 'LeBron James',
    sport: 'Basketball',
    year: 2003,
    set: 'Upper Deck Exquisite',
    grade: 'BGS 9',
    imageUrl: '/cards/lebron-exquisite.jpg',
    purchasePrice: 500000,
    currentMarketValue: 750000,
    insuredValue: 700000,
    coverageType: 'collector',
    premium: 24500,
    deductible: 14000,
    lastAppraisal: '2025-12-20',
    nextAppraisalDue: '2026-06-20',
    riskScore: 15,
    storageLocation: 'Bank Vault',
    condition: 'Mint',
    photos: ['/photos/lebron-exquisite-front.jpg', '/photos/lebron-exquisite-back.jpg'],
  },
  {
    id: 'ins-014',
    cardName: '2017 Panini Prizm Patrick Mahomes RC Silver',
    player: 'Patrick Mahomes',
    sport: 'Football',
    year: 2017,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    imageUrl: '/cards/mahomes-prizm.jpg',
    purchasePrice: 12000,
    currentMarketValue: 18500,
    insuredValue: 17000,
    coverageType: 'premium',
    premium: 374,
    deductible: 850,
    lastAppraisal: '2025-10-15',
    nextAppraisalDue: '2026-04-15',
    riskScore: 27,
    storageLocation: 'PSA Vault',
    condition: 'Gem Mint',
    photos: ['/photos/mahomes-front.jpg'],
  },
  {
    id: 'ins-015',
    cardName: '2022 Topps Chrome Julio Rodriguez RC Auto',
    player: 'Julio Rodriguez',
    sport: 'Baseball',
    year: 2022,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    imageUrl: '/cards/julio-chrome.jpg',
    purchasePrice: 2800,
    currentMarketValue: 4200,
    insuredValue: 3500,
    coverageType: 'basic',
    premium: 42,
    deductible: 350,
    lastAppraisal: '2025-08-10',
    nextAppraisalDue: '2026-02-10',
    riskScore: 48,
    storageLocation: 'Home Safe',
    condition: 'Gem Mint',
    photos: ['/photos/julio-front.jpg'],
  },
  {
    id: 'ins-016',
    cardName: '2018 Panini National Treasures Saquon Barkley RPA',
    player: 'Saquon Barkley',
    sport: 'Football',
    year: 2018,
    set: 'National Treasures',
    grade: 'BGS 9',
    imageUrl: '/cards/barkley-nt.jpg',
    purchasePrice: 3500,
    currentMarketValue: 4800,
    insuredValue: 4000,
    coverageType: 'basic',
    premium: 48,
    deductible: 400,
    lastAppraisal: '2025-07-01',
    nextAppraisalDue: '2026-01-01',
    riskScore: 58,
    storageLocation: 'Home Display',
    condition: 'Mint',
    photos: ['/photos/barkley-front.jpg'],
  },
];

const MOCK_CLAIMS: ClaimHistory[] = [
  {
    id: 'clm-001',
    itemId: 'ins-006',
    cardName: '2020 Panini Prizm Justin Herbert RC Silver',
    claimType: 'damage',
    status: 'approved',
    amount: 450,
    filedDate: '2025-06-15',
    resolvedDate: '2025-07-20',
  },
  {
    id: 'clm-002',
    itemId: 'ins-010',
    cardName: '2019 Panini Prizm Zion Williamson RC Silver',
    claimType: 'damage',
    status: 'denied',
    amount: 800,
    filedDate: '2025-08-01',
    resolvedDate: '2025-09-10',
  },
  {
    id: 'clm-003',
    itemId: 'ins-003',
    cardName: '2018 Panini Prizm Luka Doncic RC Silver',
    claimType: 'theft',
    status: 'reviewing',
    amount: 8000,
    filedDate: '2026-01-20',
    resolvedDate: null,
  },
  {
    id: 'clm-004',
    itemId: 'ins-016',
    cardName: '2018 Panini National Treasures Saquon Barkley RPA',
    claimType: 'loss',
    status: 'filed',
    amount: 4000,
    filedDate: '2026-02-28',
    resolvedDate: null,
  },
];

// ---- Helper Functions ----

function loadItems(): InsuredItem[] {
  const raw = localStorage.getItem(ITEMS_KEY);
  if (raw) {
    return JSON.parse(raw) as InsuredItem[];
  }
  localStorage.setItem(ITEMS_KEY, JSON.stringify(MOCK_INSURED_ITEMS));
  return [...MOCK_INSURED_ITEMS];
}

function saveItems(items: InsuredItem[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

function loadClaims(): ClaimHistory[] {
  const raw = localStorage.getItem(CLAIMS_KEY);
  if (raw) {
    return JSON.parse(raw) as ClaimHistory[];
  }
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(MOCK_CLAIMS));
  return [...MOCK_CLAIMS];
}

function saveClaims(claims: ClaimHistory[]): void {
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
}

// ---- Exported Functions ----

/** Retrieve all insured items from the vault. */
export function getInsuredItems(): InsuredItem[] {
  return loadItems();
}

/** Add a new insured item to the vault. */
export function addInsuredItem(item: InsuredItem): InsuredItem[] {
  const items = loadItems();
  items.push(item);
  saveItems(items);
  return items;
}

/** Update coverage type for an item and recalculate premium/deductible. */
export function updateCoverage(id: string, type: CoverageType): InsuredItem | null {
  const items = loadItems();
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  item.coverageType = type;
  item.premium = calculatePremium(item.insuredValue, type);
  item.deductible = Math.round(item.insuredValue * DEDUCTIBLE_RATES[type]);
  saveItems(items);
  return item;
}

/** Identify coverage gaps across the collection. */
export function getCoverageGaps(): CoverageGap[] {
  const items = loadItems();
  const gaps: CoverageGap[] = [];

  for (const item of items) {
    const recommended = Math.round(item.currentMarketValue * 1.1);
    if (item.insuredValue < recommended) {
      const gapAmount = recommended - item.insuredValue;
      const ratio = gapAmount / recommended;
      let priority: Priority = 'low';
      if (ratio > 0.2) priority = 'high';
      else if (ratio > 0.1) priority = 'medium';

      gaps.push({
        id: `gap-${item.id}`,
        itemId: item.id,
        cardName: item.cardName,
        currentCoverage: item.insuredValue,
        recommendedCoverage: recommended,
        gap: gapAmount,
        priority,
      });
    }
  }

  return gaps.sort((a, b) => {
    const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

/** Generate a comprehensive insurance report for the collection. */
export function getInsuranceReport(): InsuranceReport {
  const items = loadItems();
  const totalInsuredValue = items.reduce((sum, i) => sum + i.insuredValue, 0);
  const totalMarketValue = items.reduce((sum, i) => sum + i.currentMarketValue, 0);
  const totalPremiums = items.reduce((sum, i) => sum + i.premium, 0);
  const avgRiskScore =
    items.length > 0
      ? Math.round(items.reduce((sum, i) => sum + i.riskScore, 0) / items.length)
      : 0;
  const gaps = getCoverageGaps();

  return {
    totalInsuredValue,
    totalPremiums,
    coverageRatio: totalMarketValue > 0 ? Math.round((totalInsuredValue / totalMarketValue) * 100) : 0,
    avgRiskScore,
    gapCount: gaps.length,
    lastUpdated: new Date().toISOString(),
  };
}

/** Retrieve claim history. */
export function getClaimHistory(): ClaimHistory[] {
  return loadClaims();
}

/** File a new insurance claim. */
export function fileClaim(claim: Omit<ClaimHistory, 'id' | 'status' | 'resolvedDate'>): ClaimHistory {
  const claims = loadClaims();
  const newClaim: ClaimHistory = {
    ...claim,
    id: `clm-${Date.now()}`,
    status: 'filed',
    resolvedDate: null,
  };
  claims.push(newClaim);
  saveClaims(claims);
  return newClaim;
}

/** Calculate annual premium based on insured value and coverage type. */
export function calculatePremium(value: number, type: CoverageType): number {
  return Math.round(value * PREMIUM_RATES[type]);
}

/** Calculate risk score for an item based on storage, condition, grade, and value. */
export function getRiskScore(item: Partial<InsuredItem>): number {
  let score = 50; // baseline

  // Storage adjustments
  const storageLower = (item.storageLocation || '').toLowerCase();
  if (storageLower.includes('bank vault')) score -= 25;
  else if (storageLower.includes('psa vault') || storageLower.includes('pwcc vault')) score -= 20;
  else if (storageLower.includes('safe')) score -= 10;
  else if (storageLower.includes('display')) score += 15;

  // Condition adjustments
  const condLower = (item.condition || '').toLowerCase();
  if (condLower.includes('gem mint')) score -= 5;
  else if (condLower.includes('mint')) score -= 3;
  else if (condLower.includes('good')) score += 5;
  else if (condLower.includes('poor') || condLower.includes('fair')) score += 10;

  // High-value items get lower risk (more care taken)
  const value = item.currentMarketValue || 0;
  if (value > 100000) score -= 10;
  else if (value > 50000) score -= 5;
  else if (value < 2000) score += 5;

  return Math.max(1, Math.min(100, score));
}

/** Get items with expiring policies (appraisal due within 30 days). */
export function getExpiringPolicies(): InsuredItem[] {
  const items = loadItems();
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  return items.filter((item) => {
    const dueDate = new Date(item.nextAppraisalDue);
    const diff = dueDate.getTime() - now.getTime();
    return diff <= thirtyDays;
  });
}

/** Format a number as USD currency string. */
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Get color class for coverage type badge. */
export function getCoverageColor(type: CoverageType): string {
  switch (type) {
    case 'collector':
      return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    case 'premium':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'basic':
      return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

/** Get color class based on risk score. */
export function getRiskColor(score: number): string {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
}

/** Get color class based on gap priority. */
export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'high':
      return 'text-red-400 bg-red-400/10';
    case 'medium':
      return 'text-yellow-400 bg-yellow-400/10';
    case 'low':
      return 'text-green-400 bg-green-400/10';
    default:
      return 'text-gray-400 bg-gray-400/10';
  }
}
