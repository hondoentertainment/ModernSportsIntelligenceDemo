// @ts-nocheck
// ---- Types ----

export interface CardShowDeal {
  id: string;
  player: string;
  cardDescription: string;
  askingPrice: number;
  marketValue: number;
  dealScore: number; // 0-100
  vendor: string;
  notes: string;
  timestamp: string;
}

export interface CardShowWantItem {
  id: string;
  player: string;
  cardDescription: string;
  maxPrice: number;
  priority: 'high' | 'medium' | 'low';
  found: boolean;
}

export interface CardShowStats {
  totalDeals: number;
  avgDealScore: number;
  totalSpent: number;
  totalMarketValue: number;
  totalSaved: number;
  bestDeal: CardShowDeal | null;
  worstDeal: CardShowDeal | null;
}

export interface ShowSummary {
  stats: CardShowStats;
  wantListTotal: number;
  wantListFound: number;
  dealsByVendor: Record<string, number>;
  scoreDistribution: { range: string; count: number }[];
}

// ---- Mock Data ----

const MOCK_DEALS: CardShowDeal[] = [
  {
    id: 'csd-1',
    player: 'Shohei Ohtani',
    cardDescription: '2018 Topps Update #US1 PSA 10',
    askingPrice: 280,
    marketValue: 425,
    dealScore: 88,
    vendor: 'Table 14 - West Coast Cards',
    notes: 'Clean case, great centering. Vendor willing to negotiate.',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'csd-2',
    player: 'Luka Doncic',
    cardDescription: '2018 Prizm Silver #280 BGS 9.5',
    askingPrice: 650,
    marketValue: 580,
    dealScore: 28,
    vendor: 'Table 7 - Hoops Heaven',
    notes: 'Overpriced. Same card at Table 22 for less.',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 'csd-3',
    player: 'Jayson Tatum',
    cardDescription: '2017 Prizm #16 RC PSA 9',
    askingPrice: 190,
    marketValue: 240,
    dealScore: 72,
    vendor: 'Table 22 - Slam Dunk Sports',
    notes: 'Solid deal. Vendor has multiple Tatum rookies.',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'csd-4',
    player: 'Victor Wembanyama',
    cardDescription: '2023 Topps Chrome #1 PSA 10',
    askingPrice: 375,
    marketValue: 340,
    dealScore: 35,
    vendor: 'Table 3 - Rookie Rush',
    notes: 'Slightly above market. Hype tax at shows.',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'csd-5',
    player: 'Mike Trout',
    cardDescription: '2011 Topps Update #US175 PSA 8',
    askingPrice: 520,
    marketValue: 710,
    dealScore: 92,
    vendor: 'Table 14 - West Coast Cards',
    notes: 'Excellent price. Vendor clearing inventory before show ends.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'csd-6',
    player: 'Anthony Edwards',
    cardDescription: '2020 Prizm Silver #258 RC Raw',
    askingPrice: 110,
    marketValue: 135,
    dealScore: 68,
    vendor: 'Table 9 - Midwest Collectibles',
    notes: 'Decent deal on raw. Corners look sharp, could grade well.',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'csd-7',
    player: 'Patrick Mahomes',
    cardDescription: '2017 Prizm #269 RC SGC 9.5',
    askingPrice: 850,
    marketValue: 780,
    dealScore: 32,
    vendor: 'Table 1 - Gridiron Greats',
    notes: 'SGC holder, priced like a PSA 10. Pass.',
    timestamp: new Date(Date.now() - 150 * 60000).toISOString(),
  },
  {
    id: 'csd-8',
    player: 'Juan Soto',
    cardDescription: '2018 Topps Chrome Update #HMT55 PSA 10',
    askingPrice: 165,
    marketValue: 210,
    dealScore: 74,
    vendor: 'Table 18 - Diamond Kings',
    notes: 'Good pickup. Soto trending up with new contract.',
    timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
  },
];

const MOCK_WANT_LIST: CardShowWantItem[] = [
  {
    id: 'csw-1',
    player: 'Shohei Ohtani',
    cardDescription: '2018 Topps Update #US1 PSA 10',
    maxPrice: 400,
    priority: 'high',
    found: true,
  },
  {
    id: 'csw-2',
    player: 'Mike Trout',
    cardDescription: '2011 Topps Update #US175 PSA 8+',
    maxPrice: 600,
    priority: 'high',
    found: true,
  },
  {
    id: 'csw-3',
    player: 'Juan Soto',
    cardDescription: '2018 Topps Chrome Update PSA 10',
    maxPrice: 200,
    priority: 'medium',
    found: true,
  },
  {
    id: 'csw-4',
    player: 'Caitlin Clark',
    cardDescription: '2024 Prizm Base RC PSA 10',
    maxPrice: 150,
    priority: 'high',
    found: false,
  },
  {
    id: 'csw-5',
    player: 'Connor Bedard',
    cardDescription: '2023 Upper Deck Young Guns PSA 10',
    maxPrice: 250,
    priority: 'medium',
    found: false,
  },
  {
    id: 'csw-6',
    player: 'Caleb Williams',
    cardDescription: '2024 Prizm Silver RC',
    maxPrice: 180,
    priority: 'medium',
    found: false,
  },
  {
    id: 'csw-7',
    player: 'Jayson Tatum',
    cardDescription: '2017 Prizm Silver RC PSA 9+',
    maxPrice: 350,
    priority: 'low',
    found: false,
  },
  {
    id: 'csw-8',
    player: 'Elly De La Cruz',
    cardDescription: '2023 Bowman Chrome 1st Auto',
    maxPrice: 500,
    priority: 'high',
    found: false,
  },
  {
    id: 'csw-9',
    player: 'Tyrese Maxey',
    cardDescription: '2020 Prizm Silver RC PSA 9',
    maxPrice: 120,
    priority: 'low',
    found: false,
  },
  {
    id: 'csw-10',
    player: 'Bryce Harper',
    cardDescription: '2012 Topps Chrome #196 RC PSA 10',
    maxPrice: 300,
    priority: 'medium',
    found: false,
  },
];

// ---- Service Functions ----

export function getActiveDeals(): CardShowDeal[] {
  return [...MOCK_DEALS].sort((a, b) => b.dealScore - a.dealScore);
}

export function getWantList(): CardShowWantItem[] {
  return [...MOCK_WANT_LIST].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.found !== b.found) return a.found ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function addDeal(deal: Omit<CardShowDeal, 'id' | 'timestamp' | 'dealScore'>): CardShowDeal {
  const savings = deal.marketValue - deal.askingPrice;
  const savingsPercent = (savings / deal.marketValue) * 100;
  let dealScore: number;
  if (savingsPercent >= 30) dealScore = 90 + Math.min(10, savingsPercent - 30);
  else if (savingsPercent >= 15) dealScore = 70 + (savingsPercent - 15);
  else if (savingsPercent >= 5) dealScore = 50 + (savingsPercent - 5) * 2;
  else if (savingsPercent >= 0) dealScore = 40 + savingsPercent * 2;
  else dealScore = Math.max(0, 40 + savingsPercent * 2);

  const newDeal: CardShowDeal = {
    ...deal,
    id: `csd-${Date.now()}`,
    dealScore: Math.round(Math.min(100, Math.max(0, dealScore))),
    timestamp: new Date().toISOString(),
  };

  MOCK_DEALS.push(newDeal);
  return newDeal;
}

export function getDealStats(): CardShowStats {
  const deals = getActiveDeals();
  if (deals.length === 0) {
    return {
      totalDeals: 0,
      avgDealScore: 0,
      totalSpent: 0,
      totalMarketValue: 0,
      totalSaved: 0,
      bestDeal: null,
      worstDeal: null,
    };
  }

  const totalSpent = deals.reduce((sum, d) => sum + d.askingPrice, 0);
  const totalMarketValue = deals.reduce((sum, d) => sum + d.marketValue, 0);
  const avgScore = deals.reduce((sum, d) => sum + d.dealScore, 0) / deals.length;
  const sorted = [...deals].sort((a, b) => b.dealScore - a.dealScore);

  return {
    totalDeals: deals.length,
    avgDealScore: Math.round(avgScore),
    totalSpent,
    totalMarketValue,
    totalSaved: totalMarketValue - totalSpent,
    bestDeal: sorted[0],
    worstDeal: sorted[sorted.length - 1],
  };
}

export function getShowSummary(): ShowSummary {
  const stats = getDealStats();
  const deals = getActiveDeals();
  const wantList = getWantList();

  const dealsByVendor: Record<string, number> = {};
  deals.forEach((d) => {
    dealsByVendor[d.vendor] = (dealsByVendor[d.vendor] || 0) + 1;
  });

  const scoreDistribution = [
    { range: '0-25', count: deals.filter((d) => d.dealScore <= 25).length },
    { range: '26-50', count: deals.filter((d) => d.dealScore > 25 && d.dealScore <= 50).length },
    { range: '51-75', count: deals.filter((d) => d.dealScore > 50 && d.dealScore <= 75).length },
    { range: '76-100', count: deals.filter((d) => d.dealScore > 75).length },
  ];

  return {
    stats,
    wantListTotal: wantList.length,
    wantListFound: wantList.filter((w) => w.found).length,
    dealsByVendor,
    scoreDistribution,
  };
}

export default {
  getActiveDeals,
  getWantList,
  addDeal,
  getDealStats,
  getShowSummary,
};
