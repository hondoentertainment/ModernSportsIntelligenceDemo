/**
 * Phase 71: Fractional Vault & Social Copy-Trading
 * Fractional ownership of high-value cards + copy top collectors' portfolio moves.
 * NO competitor combines fractional ownership with copy-trading in a single platform.
 */

export interface FractionalListing {
  id: string;
  cardId: string;
  playerName: string;
  cardDescription: string;
  year: number;
  manufacturer: string;
  grade: string;
  gradingCompany: string;
  image: string;
  totalValue: number;
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
  minimumShares: number;
  holders: number;
  dailyChange: number;
  weeklyChange: number;
  volumeToday: number;
  listingDate: string;
  vaultLocation: string;
  insuranceStatus: 'insured' | 'pending';
  category: 'vintage' | 'modern' | 'prospect' | 'memorabilia';
  sport: string;
  dividendYield?: number; // from exhibition/display income
  priceHistory: { date: string; price: number }[];
}

export interface SharePosition {
  id: string;
  listingId: string;
  cardDescription: string;
  playerName: string;
  sharesOwned: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  purchaseDate: string;
}

export interface ShareOrder {
  id: string;
  listingId: string;
  type: 'buy' | 'sell';
  shares: number;
  pricePerShare: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: string;
  filledAt?: string;
}

export interface TopCollector {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  alphaScore: number;
  totalReturn: number; // lifetime %
  winRate: number; // % of profitable trades
  sharpeRatio: number;
  followersCount: number;
  isFollowed: boolean;
  strategy: string;
  specialization: string[];
  recentMoves: CollectorMove[];
  portfolioAllocation: { category: string; percentage: number }[];
  performance30d: number;
  performance90d: number;
  performance1y: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  badges: string[];
}

export interface CollectorMove {
  id: string;
  type: 'buy' | 'sell' | 'grade' | 'fractional_buy';
  playerName: string;
  cardDescription: string;
  timestamp: string;
  priceAction?: number;
  reasoning?: string;
  resultPL?: number;
}

export interface CopyTradeSetting {
  id: string;
  collectorId: string;
  collectorName: string;
  isActive: boolean;
  maxInvestmentPerTrade: number;
  maxTotalInvestment: number;
  copyPercentage: number; // 10-100%
  excludeSports: string[];
  excludeCategories: string[];
  autoApprove: boolean;
  createdAt: string;
}

export interface CopyTradeSignal {
  id: string;
  collectorId: string;
  collectorName: string;
  move: CollectorMove;
  suggestedAction: string;
  suggestedAmount: number;
  status: 'pending' | 'executed' | 'skipped';
  timestamp: string;
}

// Simulated fractional listings
const FRACTIONAL_LISTINGS: FractionalListing[] = [
  {
    id: 'frac-1',
    cardId: 'card-trout-1',
    playerName: 'Mike Trout',
    cardDescription: '2011 Topps Update #US175 RC',
    year: 2011,
    manufacturer: 'Topps',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    image: 'https://images.unsplash.com/photo-1578432156326-d23f7091f90c?auto=format&fit=crop&q=80&w=300',
    totalValue: 425000,
    totalShares: 10000,
    availableShares: 2340,
    pricePerShare: 42.50,
    minimumShares: 1,
    holders: 847,
    dailyChange: 1.2,
    weeklyChange: 3.8,
    volumeToday: 456,
    listingDate: '2025-06-15',
    vaultLocation: 'PWCC Vault, Portland OR',
    insuranceStatus: 'insured',
    category: 'modern',
    sport: 'Baseball',
    dividendYield: 0.5,
    priceHistory: generatePriceHistory(42.50, 90),
  },
  {
    id: 'frac-2',
    cardId: 'card-jordan-1',
    playerName: 'Michael Jordan',
    cardDescription: '1986 Fleer #57 RC',
    year: 1986,
    manufacturer: 'Fleer',
    grade: 'BGS 9.5',
    gradingCompany: 'BGS',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=300',
    totalValue: 750000,
    totalShares: 15000,
    availableShares: 1200,
    pricePerShare: 50.00,
    minimumShares: 1,
    holders: 2341,
    dailyChange: -0.3,
    weeklyChange: 1.5,
    volumeToday: 892,
    listingDate: '2025-03-01',
    vaultLocation: 'Goldin Vault, Runnemede NJ',
    insuranceStatus: 'insured',
    category: 'vintage',
    sport: 'Basketball',
    dividendYield: 0.8,
    priceHistory: generatePriceHistory(50.00, 90),
  },
  {
    id: 'frac-3',
    cardId: 'card-mahomes-1',
    playerName: 'Patrick Mahomes',
    cardDescription: '2017 Panini Prizm #269 RC Silver',
    year: 2017,
    manufacturer: 'Panini',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=300',
    totalValue: 185000,
    totalShares: 5000,
    availableShares: 890,
    pricePerShare: 37.00,
    minimumShares: 1,
    holders: 1456,
    dailyChange: 2.8,
    weeklyChange: 8.2,
    volumeToday: 1203,
    listingDate: '2025-09-01',
    vaultLocation: 'PWCC Vault, Portland OR',
    insuranceStatus: 'insured',
    category: 'modern',
    sport: 'Football',
    dividendYield: 0.3,
    priceHistory: generatePriceHistory(37.00, 90),
  },
  {
    id: 'frac-4',
    cardId: 'card-wemby-1',
    playerName: 'Victor Wembanyama',
    cardDescription: '2023 Panini Prizm #275 RC Silver',
    year: 2023,
    manufacturer: 'Panini',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&q=80&w=300',
    totalValue: 95000,
    totalShares: 5000,
    availableShares: 3200,
    pricePerShare: 19.00,
    minimumShares: 5,
    holders: 623,
    dailyChange: 5.1,
    weeklyChange: 12.4,
    volumeToday: 2890,
    listingDate: '2026-01-15',
    vaultLocation: 'MSI Vault, Austin TX',
    insuranceStatus: 'insured',
    category: 'prospect',
    sport: 'Basketball',
    priceHistory: generatePriceHistory(19.00, 60),
  },
  {
    id: 'frac-5',
    cardId: 'card-mantle-1',
    playerName: 'Mickey Mantle',
    cardDescription: '1952 Topps #311',
    year: 1952,
    manufacturer: 'Topps',
    grade: 'PSA 7',
    gradingCompany: 'PSA',
    image: 'https://images.unsplash.com/photo-1578432156326-d23f7091f90c?auto=format&fit=crop&q=80&w=300',
    totalValue: 2100000,
    totalShares: 50000,
    availableShares: 5600,
    pricePerShare: 42.00,
    minimumShares: 1,
    holders: 8934,
    dailyChange: 0.1,
    weeklyChange: 0.4,
    volumeToday: 345,
    listingDate: '2025-01-01',
    vaultLocation: 'Heritage Auctions Vault, Dallas TX',
    insuranceStatus: 'insured',
    category: 'vintage',
    sport: 'Baseball',
    dividendYield: 1.2,
    priceHistory: generatePriceHistory(42.00, 90),
  },
];

function generatePriceHistory(currentPrice: number, days: number): { date: string; price: number }[] {
  const history: { date: string; price: number }[] = [];
  let price = currentPrice * (0.85 + Math.random() * 0.1);
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    price = price * (1 + (Math.random() - 0.48) * 0.03);
    history.push({ date: date.toISOString().split('T')[0], price: Math.round(price * 100) / 100 });
  }
  history[history.length - 1].price = currentPrice;
  return history;
}

// Top collectors for copy-trading
const TOP_COLLECTORS: TopCollector[] = [
  {
    id: 'tc-1',
    username: 'alpha_grail_hunter',
    displayName: 'Alpha Grail Hunter',
    avatarUrl: '',
    alphaScore: 97,
    totalReturn: 342,
    winRate: 78,
    sharpeRatio: 2.4,
    followersCount: 12450,
    isFollowed: false,
    strategy: 'Vintage high-grade accumulation with strategic profit-taking on market spikes',
    specialization: ['Vintage', 'PSA 10', 'Baseball'],
    recentMoves: [
      { id: 'mv-1', type: 'buy', playerName: 'Ken Griffey Jr.', cardDescription: '1989 Upper Deck #1 PSA 10', timestamp: new Date(Date.now() - 86400000).toISOString(), priceAction: 2800, reasoning: 'Approaching HOF anniversary — historically drives 20-30% premium' },
      { id: 'mv-2', type: 'sell', playerName: 'Derek Jeter', cardDescription: '1993 SP #279 PSA 10', timestamp: new Date(Date.now() - 172800000).toISOString(), priceAction: 4200, resultPL: 1800, reasoning: 'Taking profits at 75% gain, re-deploying into undervalued prospects' },
    ],
    portfolioAllocation: [{ category: 'Vintage Baseball', percentage: 45 }, { category: 'Modern Basketball', percentage: 25 }, { category: 'Football Prospects', percentage: 20 }, { category: 'Cash', percentage: 10 }],
    performance30d: 8.2,
    performance90d: 22.5,
    performance1y: 67.3,
    riskLevel: 'moderate',
    badges: ['Top 1% Alpha', '100+ Wins', 'Vintage Master'],
  },
  {
    id: 'tc-2',
    username: 'prospect_sniper',
    displayName: 'Prospect Sniper',
    avatarUrl: '',
    alphaScore: 94,
    totalReturn: 580,
    winRate: 65,
    sharpeRatio: 1.8,
    followersCount: 8920,
    isFollowed: false,
    strategy: 'Early MiLB prospect accumulation, sell into MLB debut hype',
    specialization: ['Prospects', 'MiLB', 'High Risk/Reward'],
    recentMoves: [
      { id: 'mv-3', type: 'buy', playerName: 'Ethan Salas', cardDescription: '2024 Bowman Chrome 1st Auto', timestamp: new Date(Date.now() - 43200000).toISOString(), priceAction: 450, reasoning: 'AA promotion imminent, price hasn\'t moved yet — classic buy-the-rumor play' },
      { id: 'mv-4', type: 'fractional_buy', playerName: 'Victor Wembanyama', cardDescription: '2023 Prizm Silver PSA 10 (50 shares)', timestamp: new Date(Date.now() - 259200000).toISOString(), priceAction: 950, reasoning: 'Fractional exposure to blue-chip at lower capital risk' },
    ],
    portfolioAllocation: [{ category: 'MiLB Prospects', percentage: 55 }, { category: 'NBA Rookies', percentage: 25 }, { category: 'Fractional Blue Chips', percentage: 15 }, { category: 'Cash', percentage: 5 }],
    performance30d: 15.7,
    performance90d: -3.2,
    performance1y: 112.8,
    riskLevel: 'aggressive',
    badges: ['Prospect Whisperer', 'High Roller', '500%+ Return'],
  },
  {
    id: 'tc-3',
    username: 'steady_eddie',
    displayName: 'Steady Eddie',
    avatarUrl: '',
    alphaScore: 91,
    totalReturn: 156,
    winRate: 88,
    sharpeRatio: 3.1,
    followersCount: 15600,
    isFollowed: true,
    strategy: 'Low-risk diversified approach — blue-chip cards with proven price floors',
    specialization: ['Blue Chip', 'Diversified', 'Low Volatility'],
    recentMoves: [
      { id: 'mv-5', type: 'buy', playerName: 'LeBron James', cardDescription: '2003 Topps Chrome #111 BGS 9.5', timestamp: new Date(Date.now() - 604800000).toISOString(), priceAction: 18500, reasoning: 'Approaching retirement — final season cards historically appreciate 40%+' },
    ],
    portfolioAllocation: [{ category: 'Blue Chip HOF', percentage: 50 }, { category: 'Graded Vintage', percentage: 30 }, { category: 'Bonds/Cash', percentage: 20 }],
    performance30d: 3.1,
    performance90d: 9.8,
    performance1y: 28.4,
    riskLevel: 'conservative',
    badges: ['Highest Sharpe', '88% Win Rate', 'Steady Returns'],
  },
];

export function getFractionalListings(filters?: { sport?: string; category?: string; sortBy?: string }): FractionalListing[] {
  let listings = [...FRACTIONAL_LISTINGS];
  if (filters?.sport) listings = listings.filter(l => l.sport === filters.sport);
  if (filters?.category) listings = listings.filter(l => l.category === filters.category);
  if (filters?.sortBy === 'volume') listings.sort((a, b) => b.volumeToday - a.volumeToday);
  else if (filters?.sortBy === 'change') listings.sort((a, b) => b.dailyChange - a.dailyChange);
  else if (filters?.sortBy === 'value') listings.sort((a, b) => b.totalValue - a.totalValue);
  return listings;
}

export function getTopCollectors(): TopCollector[] {
  return TOP_COLLECTORS.sort((a, b) => b.alphaScore - a.alphaScore);
}

export function getSharePositions(): SharePosition[] {
  return [
    {
      id: 'pos-1',
      listingId: 'frac-2',
      cardDescription: '1986 Fleer #57 Michael Jordan RC',
      playerName: 'Michael Jordan',
      sharesOwned: 25,
      averageCost: 45.20,
      currentPrice: 50.00,
      totalValue: 1250,
      unrealizedPL: 120,
      unrealizedPLPercent: 10.6,
      purchaseDate: '2025-08-15',
    },
    {
      id: 'pos-2',
      listingId: 'frac-4',
      cardDescription: '2023 Prizm Silver Victor Wembanyama RC',
      playerName: 'Victor Wembanyama',
      sharesOwned: 50,
      averageCost: 15.80,
      currentPrice: 19.00,
      totalValue: 950,
      unrealizedPL: 160,
      unrealizedPLPercent: 20.3,
      purchaseDate: '2026-01-20',
    },
  ];
}

export function getCopyTradeSignals(): CopyTradeSignal[] {
  const signals: CopyTradeSignal[] = [];
  for (const collector of TOP_COLLECTORS) {
    if (collector.isFollowed) {
      for (const move of collector.recentMoves) {
        signals.push({
          id: `signal-${move.id}`,
          collectorId: collector.id,
          collectorName: collector.displayName,
          move,
          suggestedAction: move.type === 'buy' ? `Buy ${move.cardDescription}` : `Sell ${move.cardDescription}`,
          suggestedAmount: (move.priceAction || 100) * 0.1,
          status: 'pending',
          timestamp: move.timestamp,
        });
      }
    }
  }
  return signals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getVaultStats(): { totalVaultValue: number; totalPositions: number; totalPL: number; totalPLPercent: number } {
  const positions = getSharePositions();
  const totalValue = positions.reduce((sum, p) => sum + p.totalValue, 0);
  const totalPL = positions.reduce((sum, p) => sum + p.unrealizedPL, 0);
  return {
    totalVaultValue: totalValue,
    totalPositions: positions.length,
    totalPL,
    totalPLPercent: totalValue > 0 ? (totalPL / (totalValue - totalPL)) * 100 : 0,
  };
}
