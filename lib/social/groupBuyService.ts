// Group Buy & Wholesale Co-op Service
// Pool capital for case/lot purchases at wholesale pricing with proportional ownership splits.
// Unlike breaks where hits are split randomly, each member owns their proportional share of sealed product.

// ---- Types ----

export type BuyStatus = 'forming' | 'funding' | 'funded' | 'ordered' | 'received' | 'distributed' | 'completed';
export type ProductType = 'case' | 'half-case' | 'lot' | 'collection' | 'pallet';
export type SplitMethod = 'equal' | 'proportional' | 'tiered';

export interface BuyParticipant {
  userId: string;
  handle: string;
  shares: number;
  amountPledged: number;
  amountPaid: number;
  productAllocation: string;
  status: 'pledged' | 'paid' | 'received';
  joinedDate: string;
}

export interface GroupBuy {
  id: string;
  name: string;
  product: string;
  productType: ProductType;
  supplier: string;
  retailPrice: number;
  wholesalePrice: number;
  savingsPercent: number;
  status: BuyStatus;
  organizerHandle: string;
  totalShares: number;
  claimedShares: number;
  splitMethod: SplitMethod;
  participants: BuyParticipant[];
  minimumBuy: number;
  deadline: string;
  estimatedDelivery: string;
  shippingCost: number;
  totalSavings: number;
  productDescription: string;
}

export interface BuyHistory {
  buyId: string;
  product: string;
  completedDate: string;
  yourShares: number;
  totalShares: number;
  yourCost: number;
  retailEquivalent: number;
  savings: number;
  productReceived: boolean;
}

export interface GroupBuyStats {
  totalBuysJoined: number;
  totalSaved: number;
  avgSavingsPercent: number;
  activeBuys: number;
  totalSpent: number;
  bestDealSavings: number;
  avgGroupSize: number;
  productsReceived: number;
}

// ---- Helper ----

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export { formatCurrency };

// ---- Data Functions ----

export function getGroupBuys(): GroupBuy[] {
  return [
    {
      id: 'gb-001',
      name: '2024 Panini Prizm Football Case Split',
      product: '2024 Panini Prizm Football Hobby Case (12 boxes)',
      productType: 'case',
      supplier: 'GTS Distribution',
      retailPrice: 6600,
      wholesalePrice: 4980,
      savingsPercent: 24.5,
      status: 'forming',
      organizerHandle: 'CaseBreaker_Mike',
      totalShares: 12,
      claimedShares: 7,
      splitMethod: 'equal',
      participants: [
        { userId: 'u-101', handle: 'CaseBreaker_Mike', shares: 2, amountPledged: 830, amountPaid: 830, productAllocation: '2 Hobby Boxes', status: 'paid', joinedDate: '2026-03-01' },
        { userId: 'u-102', handle: 'PrizmHunter22', shares: 1, amountPledged: 415, amountPaid: 415, productAllocation: '1 Hobby Box', status: 'paid', joinedDate: '2026-03-02' },
        { userId: 'u-103', handle: 'GridironCards', shares: 2, amountPledged: 830, amountPaid: 0, productAllocation: '2 Hobby Boxes', status: 'pledged', joinedDate: '2026-03-04' },
        { userId: 'u-104', handle: 'NFLWaxKing', shares: 1, amountPledged: 415, amountPaid: 415, productAllocation: '1 Hobby Box', status: 'paid', joinedDate: '2026-03-05' },
        { userId: 'u-001', handle: 'CardKingMike', shares: 1, amountPledged: 415, amountPaid: 415, productAllocation: '1 Hobby Box', status: 'paid', joinedDate: '2026-03-06' },
      ],
      minimumBuy: 12,
      deadline: '2026-03-25',
      estimatedDelivery: '2026-04-10',
      shippingCost: 45,
      totalSavings: 1620,
      productDescription: 'Full sealed hobby case. Each box contains 12 packs with 4 Prizm cards per pack. Look for Silver Prizms, Gold Vinyl 1/1s, and rookie auto parallels.',
    },
    {
      id: 'gb-002',
      name: '2024 Topps Chrome Baseball Lot Buy',
      product: '2024 Topps Chrome Baseball Hobby Lot (24 boxes)',
      productType: 'lot',
      supplier: 'Southern Hobby Supply',
      retailPrice: 9600,
      wholesalePrice: 6720,
      savingsPercent: 30.0,
      status: 'ordered',
      organizerHandle: 'DiamondWax',
      totalShares: 24,
      claimedShares: 24,
      splitMethod: 'proportional',
      participants: [
        { userId: 'u-201', handle: 'DiamondWax', shares: 6, amountPledged: 1680, amountPaid: 1680, productAllocation: '6 Hobby Boxes', status: 'paid', joinedDate: '2026-02-10' },
        { userId: 'u-202', handle: 'BaseballCardPro', shares: 4, amountPledged: 1120, amountPaid: 1120, productAllocation: '4 Hobby Boxes', status: 'paid', joinedDate: '2026-02-11' },
        { userId: 'u-001', handle: 'CardKingMike', shares: 3, amountPledged: 840, amountPaid: 840, productAllocation: '3 Hobby Boxes', status: 'paid', joinedDate: '2026-02-12' },
        { userId: 'u-203', handle: 'RookieInvestor', shares: 4, amountPledged: 1120, amountPaid: 1120, productAllocation: '4 Hobby Boxes', status: 'paid', joinedDate: '2026-02-13' },
        { userId: 'u-204', handle: 'ChromeChaser', shares: 3, amountPledged: 840, amountPaid: 840, productAllocation: '3 Hobby Boxes', status: 'paid', joinedDate: '2026-02-14' },
        { userId: 'u-205', handle: 'WaxRipperJoe', shares: 4, amountPledged: 1120, amountPaid: 1120, productAllocation: '4 Hobby Boxes', status: 'paid', joinedDate: '2026-02-15' },
      ],
      minimumBuy: 24,
      deadline: '2026-02-28',
      estimatedDelivery: '2026-03-20',
      shippingCost: 60,
      totalSavings: 2880,
      productDescription: 'Wholesale lot of 24 Topps Chrome Hobby boxes. Each box has 24 packs / 4 cards per pack. Chase refractors, autographs, and numbered parallels.',
    },
    {
      id: 'gb-003',
      name: '2023-24 Panini Flawless Basketball Half-Case',
      product: '2023-24 Panini Flawless Basketball (5 boxes)',
      productType: 'half-case',
      supplier: 'Blowout Cards Wholesale',
      retailPrice: 15000,
      wholesalePrice: 11250,
      savingsPercent: 25.0,
      status: 'completed',
      organizerHandle: 'HoopsVault',
      totalShares: 5,
      claimedShares: 5,
      splitMethod: 'equal',
      participants: [
        { userId: 'u-301', handle: 'HoopsVault', shares: 1, amountPledged: 2250, amountPaid: 2250, productAllocation: '1 Flawless Box', status: 'received', joinedDate: '2026-01-05' },
        { userId: 'u-001', handle: 'CardKingMike', shares: 1, amountPledged: 2250, amountPaid: 2250, productAllocation: '1 Flawless Box', status: 'received', joinedDate: '2026-01-06' },
        { userId: 'u-302', handle: 'GemMintCollect', shares: 1, amountPledged: 2250, amountPaid: 2250, productAllocation: '1 Flawless Box', status: 'received', joinedDate: '2026-01-07' },
        { userId: 'u-303', handle: 'FlawlessFanatic', shares: 1, amountPledged: 2250, amountPaid: 2250, productAllocation: '1 Flawless Box', status: 'received', joinedDate: '2026-01-08' },
        { userId: 'u-304', handle: 'PatchAutoKing', shares: 1, amountPledged: 2250, amountPaid: 2250, productAllocation: '1 Flawless Box', status: 'received', joinedDate: '2026-01-09' },
      ],
      minimumBuy: 5,
      deadline: '2026-01-20',
      estimatedDelivery: '2026-02-05',
      shippingCost: 35,
      totalSavings: 3750,
      productDescription: 'Ultra-premium basketball product. Each box contains 10 cards, all on-card autographs with gem or metal elements. RPA, patch autos, and logoman potential.',
    },
  ];
}

export function getBuyHistory(): BuyHistory[] {
  return [
    {
      buyId: 'gb-003',
      product: '2023-24 Panini Flawless Basketball (5 boxes)',
      completedDate: '2026-02-08',
      yourShares: 1,
      totalShares: 5,
      yourCost: 2250,
      retailEquivalent: 3000,
      savings: 750,
      productReceived: true,
    },
    {
      buyId: 'gb-010',
      product: '2024 Bowman Chrome Baseball Hobby Case (12 boxes)',
      completedDate: '2026-01-15',
      yourShares: 2,
      totalShares: 12,
      yourCost: 720,
      retailEquivalent: 960,
      savings: 240,
      productReceived: true,
    },
    {
      buyId: 'gb-011',
      product: '2024 Panini National Treasures Football (4 boxes)',
      completedDate: '2025-12-20',
      yourShares: 1,
      totalShares: 4,
      yourCost: 1750,
      retailEquivalent: 2400,
      savings: 650,
      productReceived: true,
    },
    {
      buyId: 'gb-012',
      product: '2024 Topps Series 2 Baseball Hobby Lot (20 boxes)',
      completedDate: '2025-11-28',
      yourShares: 3,
      totalShares: 20,
      yourCost: 450,
      retailEquivalent: 600,
      savings: 150,
      productReceived: true,
    },
    {
      buyId: 'gb-013',
      product: '2024 Panini Select Basketball Hobby Case (12 boxes)',
      completedDate: '2025-11-05',
      yourShares: 2,
      totalShares: 12,
      yourCost: 880,
      retailEquivalent: 1200,
      savings: 320,
      productReceived: true,
    },
  ];
}

export function getGroupBuyStats(): GroupBuyStats {
  return {
    totalBuysJoined: 14,
    totalSaved: 3842,
    avgSavingsPercent: 26.3,
    activeBuys: 2,
    totalSpent: 12450,
    bestDealSavings: 750,
    avgGroupSize: 7.4,
    productsReceived: 12,
  };
}

export function getBuyStatusColor(status: BuyStatus): string {
  switch (status) {
    case 'forming':
      return 'text-yellow-400';
    case 'funding':
      return 'text-amber-400';
    case 'funded':
      return 'text-blue-400';
    case 'ordered':
      return 'text-indigo-400';
    case 'received':
      return 'text-purple-400';
    case 'distributed':
      return 'text-teal-400';
    case 'completed':
      return 'text-green-400';
    default:
      return 'text-slate-400';
  }
}

export function getBuyStatusBgColor(status: BuyStatus): string {
  switch (status) {
    case 'forming':
      return 'bg-yellow-400/10 border-yellow-400/30';
    case 'funding':
      return 'bg-amber-400/10 border-amber-400/30';
    case 'funded':
      return 'bg-blue-400/10 border-blue-400/30';
    case 'ordered':
      return 'bg-indigo-400/10 border-indigo-400/30';
    case 'received':
      return 'bg-purple-400/10 border-purple-400/30';
    case 'distributed':
      return 'bg-teal-400/10 border-teal-400/30';
    case 'completed':
      return 'bg-green-400/10 border-green-400/30';
    default:
      return 'bg-slate-400/10 border-slate-400/30';
  }
}

export function getProductTypeLabel(type: ProductType): string {
  switch (type) {
    case 'case':
      return 'Full Case';
    case 'half-case':
      return 'Half Case';
    case 'lot':
      return 'Wholesale Lot';
    case 'collection':
      return 'Collection';
    case 'pallet':
      return 'Pallet';
    default:
      return type;
  }
}
