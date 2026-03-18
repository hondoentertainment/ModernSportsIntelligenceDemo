// Carbon Footprint Tracker Service

// ---- Types ----

export interface CarbonTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'grading_submission' | 'show_attendance';
  cardName?: string;
  distance: number; // miles
  co2Kg: number;
  date: string;
  offsetPurchased: boolean;
  vendor?: string;
}

export interface CarbonCategory {
  category: string;
  co2Kg: number;
  percentage: number;
  transactions: number;
  trend: 'up' | 'down' | 'stable';
}

export interface EcoScore {
  overall: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  comparedToAvgCollector: number; // e.g. -23 = 23% better
  breakdown: {
    shipping: number;
    grading: number;
    packaging: number;
    travel: number;
  };
}

export interface CarbonOffset {
  id: string;
  provider: string;
  project: string;
  costPerTon: number;
  available: boolean;
  description: string;
}

export interface EcoBadge {
  id: string;
  name: string;
  earned: boolean;
  earnedDate?: string;
  description: string;
  co2Required?: number;
}

export interface MonthlyFootprint {
  month: string;
  co2Kg: number;
  offsetKg: number;
  netKg: number;
  transactions: number;
}

// ---- Mock Data ----

const MONTHLY_FOOTPRINT: MonthlyFootprint[] = [
  { month: 'Apr 2025', co2Kg: 38.2, offsetKg: 10.0, netKg: 28.2, transactions: 9 },
  { month: 'May 2025', co2Kg: 44.7, offsetKg: 12.0, netKg: 32.7, transactions: 11 },
  { month: 'Jun 2025', co2Kg: 29.1, offsetKg: 15.0, netKg: 14.1, transactions: 7 },
  { month: 'Jul 2025', co2Kg: 52.3, offsetKg: 10.0, netKg: 42.3, transactions: 14 },
  { month: 'Aug 2025', co2Kg: 47.8, offsetKg: 20.0, netKg: 27.8, transactions: 12 },
  { month: 'Sep 2025', co2Kg: 33.5, offsetKg: 20.0, netKg: 13.5, transactions: 8 },
  { month: 'Oct 2025', co2Kg: 61.4, offsetKg: 15.0, netKg: 46.4, transactions: 16 },
  { month: 'Nov 2025', co2Kg: 55.9, offsetKg: 25.0, netKg: 30.9, transactions: 14 },
  { month: 'Dec 2025', co2Kg: 78.2, offsetKg: 30.0, netKg: 48.2, transactions: 21 },
  { month: 'Jan 2026', co2Kg: 41.3, offsetKg: 20.0, netKg: 21.3, transactions: 10 },
  { month: 'Feb 2026', co2Kg: 36.7, offsetKg: 25.0, netKg: 11.7, transactions: 9 },
  { month: 'Mar 2026', co2Kg: 29.4, offsetKg: 15.0, netKg: 14.4, transactions: 8 },
];

const CARBON_CATEGORIES: CarbonCategory[] = [
  { category: 'Shipping (Received)', co2Kg: 142.8, percentage: 34.2, transactions: 58, trend: 'down' },
  { category: 'Shipping (Sent)', co2Kg: 98.4, percentage: 23.6, transactions: 42, trend: 'stable' },
  { category: 'Grading Submissions', co2Kg: 87.3, percentage: 20.9, transactions: 14, trend: 'up' },
  { category: 'Card Show Travel', co2Kg: 61.5, percentage: 14.7, transactions: 6, trend: 'down' },
  { category: 'Packaging Materials', co2Kg: 22.6, percentage: 5.4, transactions: 100, trend: 'stable' },
  { category: 'Digital Infrastructure', co2Kg: 4.9, percentage: 1.2, transactions: 365, trend: 'stable' },
];

const TRANSACTIONS: CarbonTransaction[] = [
  {
    id: 'ct-001',
    type: 'purchase',
    cardName: '2003-04 UD Exquisite LeBron James RPA',
    distance: 1842,
    co2Kg: 3.2,
    date: '2026-03-15',
    offsetPurchased: true,
    vendor: 'eBay',
  },
  {
    id: 'ct-002',
    type: 'grading_submission',
    cardName: 'Batch #14 — 12 cards to PSA',
    distance: 2340,
    co2Kg: 8.7,
    date: '2026-03-10',
    offsetPurchased: false,
    vendor: 'PSA',
  },
  {
    id: 'ct-003',
    type: 'sale',
    cardName: '1986-87 Fleer Michael Jordan RC PSA 8',
    distance: 893,
    co2Kg: 1.6,
    date: '2026-03-08',
    offsetPurchased: true,
    vendor: 'PWCC',
  },
  {
    id: 'ct-004',
    type: 'purchase',
    cardName: '2018-19 Prizm Luka Doncic Silver RC',
    distance: 612,
    co2Kg: 1.1,
    date: '2026-03-05',
    offsetPurchased: false,
    vendor: 'Goldin',
  },
  {
    id: 'ct-005',
    type: 'show_attendance',
    cardName: undefined,
    distance: 340,
    co2Kg: 7.4,
    date: '2026-02-28',
    offsetPurchased: false,
    vendor: 'National Card Show — Chicago',
  },
  {
    id: 'ct-006',
    type: 'purchase',
    cardName: '2011 Topps Update Mike Trout RC PSA 10',
    distance: 2100,
    co2Kg: 3.7,
    date: '2026-02-22',
    offsetPurchased: true,
    vendor: 'Heritage Auctions',
  },
  {
    id: 'ct-007',
    type: 'sale',
    cardName: '2020 Prizm Patrick Mahomes Silver PSA 10',
    distance: 1440,
    co2Kg: 2.5,
    date: '2026-02-18',
    offsetPurchased: false,
    vendor: 'eBay',
  },
  {
    id: 'ct-008',
    type: 'purchase',
    cardName: '1952 Topps Mickey Mantle #311 PSA 4',
    distance: 78,
    co2Kg: 0.4,
    date: '2026-02-14',
    offsetPurchased: true,
    vendor: 'Local Show',
  },
  {
    id: 'ct-009',
    type: 'grading_submission',
    cardName: 'Batch #15 — 8 cards to BGS',
    distance: 1920,
    co2Kg: 5.9,
    date: '2026-02-10',
    offsetPurchased: false,
    vendor: 'BGS',
  },
  {
    id: 'ct-010',
    type: 'purchase',
    cardName: '2009-10 NT Stephen Curry RPA #/99 BGS 8.5',
    distance: 3100,
    co2Kg: 5.4,
    date: '2026-01-28',
    offsetPurchased: true,
    vendor: 'PWCC',
  },
];

const ECO_SCORE: EcoScore = {
  overall: 68,
  grade: 'B',
  comparedToAvgCollector: -19,
  breakdown: {
    shipping: 72,
    grading: 54,
    packaging: 81,
    travel: 63,
  },
};

const CARBON_OFFSETS: CarbonOffset[] = [
  {
    id: 'off-001',
    provider: 'Cool Effect',
    project: 'Boden Biogas — Sweden',
    costPerTon: 14.5,
    available: true,
    description: 'Converts organic waste to renewable energy, displacing fossil fuel use in northern Sweden.',
  },
  {
    id: 'off-002',
    provider: 'Gold Standard',
    project: 'Kenya Cookstoves Initiative',
    costPerTon: 18.0,
    available: true,
    description: 'Distributes efficient cookstoves to rural Kenyan households, reducing wood burning and indoor air pollution.',
  },
  {
    id: 'off-003',
    provider: 'Terrapass',
    project: 'Landfill Gas Capture — Texas',
    costPerTon: 11.0,
    available: true,
    description: 'Captures methane from Texas landfills and converts it to electricity, preventing potent GHG release.',
  },
  {
    id: 'off-004',
    provider: 'South Pole',
    project: 'Amazon Forest Protection — Brazil',
    costPerTon: 22.0,
    available: false,
    description: 'REDD+ project protecting 1.2M acres of Amazon rainforest from deforestation pressures.',
  },
];

const ECO_BADGES: EcoBadge[] = [
  {
    id: 'badge-001',
    name: 'Local Buyer',
    earned: true,
    earnedDate: '2026-01-15',
    description: 'Made 5+ purchases within 100 miles, drastically reducing shipping emissions.',
  },
  {
    id: 'badge-002',
    name: 'Zero-Waste Packager',
    earned: true,
    earnedDate: '2025-11-03',
    description: 'Used recycled or reused packaging materials for 10 consecutive outgoing shipments.',
  },
  {
    id: 'badge-003',
    name: 'Carbon Neutral Month',
    earned: true,
    earnedDate: '2026-02-28',
    description: 'Purchased enough offsets to fully neutralize your footprint for an entire month.',
  },
  {
    id: 'badge-004',
    name: 'Offset Champion',
    earned: true,
    earnedDate: '2025-09-12',
    description: 'Purchased carbon offsets on 20+ separate transactions.',
  },
  {
    id: 'badge-005',
    name: 'Green Shipper',
    earned: false,
    description: 'Use ground shipping exclusively for 3 consecutive months.',
    co2Required: 15,
  },
  {
    id: 'badge-006',
    name: 'Batch Master',
    earned: false,
    description: 'Consolidate all grading submissions into batches of 20+ cards to minimize per-card shipping footprint.',
    co2Required: 20,
  },
  {
    id: 'badge-007',
    name: 'Net Zero Year',
    earned: false,
    description: 'Achieve full carbon neutrality across all transactions for a rolling 12-month period.',
    co2Required: 100,
  },
  {
    id: 'badge-008',
    name: 'Digital Receipt Advocate',
    earned: false,
    description: 'Opt into paperless receipts and invoices for all platform transactions for 6 months.',
    co2Required: 5,
  },
];

const ECO_TIPS = [
  { icon: '📦', tip: 'Consolidate purchases to reduce the number of individual shipments.' },
  { icon: '🏠', tip: 'Buy from local sellers at card shows to eliminate long-distance shipping entirely.' },
  { icon: '♻️', tip: 'Reuse bubble mailers and top-loaders from incoming cards for your outgoing sales.' },
  { icon: '📱', tip: 'Use digital receipts and invoices to cut paper waste across all platforms.' },
  { icon: '🚂', tip: 'When attending shows, take public transit or carpool to significantly cut travel emissions.' },
  { icon: '📬', tip: 'Batch grading submissions (20+ cards) to minimize round-trip shipping per card.' },
];

// ---- Exported Functions ----

export function getMonthlyFootprint(): MonthlyFootprint[] {
  return MONTHLY_FOOTPRINT;
}

export function getCarbonCategories(): CarbonCategory[] {
  return CARBON_CATEGORIES;
}

export function getRecentTransactions(): CarbonTransaction[] {
  return TRANSACTIONS;
}

export function getEcoScore(): EcoScore {
  return ECO_SCORE;
}

export function getCarbonOffsets(): CarbonOffset[] {
  return CARBON_OFFSETS;
}

export function getEcoBadges(): EcoBadge[] {
  return ECO_BADGES;
}

export function getEcoTips(): { icon: string; tip: string }[] {
  return ECO_TIPS;
}

export function getTotalFootprint(): { totalCo2Kg: number; totalOffsetKg: number; netKg: number } {
  const totalCo2Kg = MONTHLY_FOOTPRINT.reduce((s, m) => s + m.co2Kg, 0);
  const totalOffsetKg = MONTHLY_FOOTPRINT.reduce((s, m) => s + m.offsetKg, 0);
  return {
    totalCo2Kg: parseFloat(totalCo2Kg.toFixed(1)),
    totalOffsetKg: parseFloat(totalOffsetKg.toFixed(1)),
    netKg: parseFloat((totalCo2Kg - totalOffsetKg).toFixed(1)),
  };
}

export function getOffsetNeededKg(): number {
  const { netKg } = getTotalFootprint();
  return Math.max(0, parseFloat(netKg.toFixed(1)));
}

export function formatCo2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} tCO₂`;
  return `${kg.toFixed(1)} kg CO₂`;
}
