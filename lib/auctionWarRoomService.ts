// Phase 118: Live Auction War Room
// Multi-platform auction dashboard with bid tracking, strategy optimization, and post-auction analytics

// ---- Types ----

export type AuctionPlatform = 'heritage' | 'goldin' | 'pwcc' | 'ebay' | 'lelands' | 'huggins_scott';
export type BidStrategy = 'snipe' | 'proxy' | 'incremental' | 'watch_only';
export type AuctionStatus = 'live' | 'upcoming' | 'ended' | 'suspended';
export type LotCategory = 'vintage' | 'modern' | 'ultra_modern' | 'memorabilia' | 'sealed_wax';

export interface LiveAuction {
  id: string;
  platform: AuctionPlatform;
  lotNumber: string;
  title: string;
  description: string;
  category: LotCategory;
  imageUrl?: string;
  currentBid: number;
  startingBid: number;
  estimateLow: number;
  estimateHigh: number;
  bidCount: number;
  timeRemaining: string;
  endsAt: string;
  status: AuctionStatus;
  isWatched: boolean;
  myMaxBid?: number;
  strategy?: BidStrategy;
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderLabel: string;
  amount: number;
  timestamp: string;
  isMyBid: boolean;
  isWinning: boolean;
}

export interface AuctionResult {
  auctionId: string;
  title: string;
  platform: AuctionPlatform;
  hammerPrice: number;
  estimateLow: number;
  estimateHigh: number;
  totalBids: number;
  won: boolean;
  myHighestBid: number;
  overpayPercent: number;
  endedAt: string;
}

export interface AuctionAnalytics {
  totalAuctionsParticipated: number;
  totalWins: number;
  winRate: number;
  totalSpent: number;
  avgOverpayPercent: number;
  avgSavingsPercent: number;
  bestDeal: { title: string; savedPercent: number };
  worstOverpay: { title: string; overpayPercent: number };
  platformBreakdown: { platform: AuctionPlatform; wins: number; losses: number; spent: number }[];
  timingPatterns: { hour: number; winRate: number; avgSavings: number }[];
  strategyPerformance: { strategy: BidStrategy; uses: number; winRate: number; avgCost: number }[];
  monthlySpend: { month: string; spent: number; won: number; lost: number }[];
}

export interface WatchedLot {
  id: string;
  auctionId: string;
  title: string;
  platform: AuctionPlatform;
  currentBid: number;
  maxAutoBid: number;
  alertThreshold: number;
  strategy: BidStrategy;
  status: AuctionStatus;
  timeRemaining: string;
  endsAt: string;
  notes: string;
  priceAlertTriggered: boolean;
}

export interface OptimalBidRecommendation {
  auctionId: string;
  title: string;
  recommendedStrategy: BidStrategy;
  recommendedMax: number;
  snipeWindow: string;
  proxyCeiling: number;
  confidence: number;
  reasoning: string;
  historicalAvg: number;
  competitorEstimate: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_auction_war_room';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

// ---- Data ----

const LIVE_AUCTIONS: LiveAuction[] = [
  {
    id: 'auc_001',
    platform: 'heritage',
    lotNumber: 'LOT 80145',
    title: '1952 Topps Mickey Mantle #311 PSA 6',
    description: 'The holy grail of post-war cards. Strong centering, vibrant color.',
    category: 'vintage',
    currentBid: 485000,
    startingBid: 250000,
    estimateLow: 400000,
    estimateHigh: 600000,
    bidCount: 34,
    timeRemaining: '2h 14m',
    endsAt: '2026-03-13T22:00:00Z',
    status: 'live',
    isWatched: true,
    myMaxBid: 525000,
    strategy: 'snipe',
  },
  {
    id: 'auc_002',
    platform: 'goldin',
    lotNumber: 'LOT 2287',
    title: '2003 Topps Chrome LeBron James RC #111 PSA 10',
    description: 'Gem mint rookie chrome. Population 1,245.',
    category: 'modern',
    currentBid: 38500,
    startingBid: 20000,
    estimateLow: 35000,
    estimateHigh: 55000,
    bidCount: 22,
    timeRemaining: '4h 38m',
    endsAt: '2026-03-14T00:30:00Z',
    status: 'live',
    isWatched: true,
    myMaxBid: 45000,
    strategy: 'proxy',
  },
  {
    id: 'auc_003',
    platform: 'pwcc',
    lotNumber: 'LOT 9012',
    title: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5',
    description: 'Gem mint with strong sub-grades. All 9s or higher.',
    category: 'vintage',
    currentBid: 72000,
    startingBid: 50000,
    estimateLow: 65000,
    estimateHigh: 90000,
    bidCount: 18,
    timeRemaining: '1h 02m',
    endsAt: '2026-03-13T20:45:00Z',
    status: 'live',
    isWatched: true,
    myMaxBid: 82000,
    strategy: 'snipe',
  },
  {
    id: 'auc_004',
    platform: 'ebay',
    lotNumber: 'ITEM 385721',
    title: '2018 Panini Prizm Luka Doncic Silver RC PSA 10',
    description: 'Silver prizm gem mint. Hot card in current market.',
    category: 'ultra_modern',
    currentBid: 4800,
    startingBid: 2500,
    estimateLow: 4000,
    estimateHigh: 6500,
    bidCount: 15,
    timeRemaining: '38m',
    endsAt: '2026-03-13T19:30:00Z',
    status: 'live',
    isWatched: false,
    strategy: 'watch_only',
  },
  {
    id: 'auc_005',
    platform: 'lelands',
    lotNumber: 'LOT 445',
    title: '1916 Sporting News Babe Ruth RC #151 SGC 3',
    description: 'Pre-war Babe Ruth rookie. Rare offering in any grade.',
    category: 'vintage',
    currentBid: 1250000,
    startingBid: 800000,
    estimateLow: 1000000,
    estimateHigh: 1800000,
    bidCount: 12,
    timeRemaining: '1d 6h',
    endsAt: '2026-03-15T02:00:00Z',
    status: 'live',
    isWatched: true,
    strategy: 'watch_only',
  },
  {
    id: 'auc_006',
    platform: 'huggins_scott',
    lotNumber: 'LOT 1188',
    title: '1969 Topps Complete Set (664 Cards) PSA Graded',
    description: 'Full set with all key RCs graded. Avg grade PSA 7.2.',
    category: 'vintage',
    currentBid: 28500,
    startingBid: 15000,
    estimateLow: 25000,
    estimateHigh: 40000,
    bidCount: 9,
    timeRemaining: '5h 22m',
    endsAt: '2026-03-14T01:15:00Z',
    status: 'live',
    isWatched: false,
    strategy: 'incremental',
  },
  {
    id: 'auc_007',
    platform: 'heritage',
    lotNumber: 'LOT 80301',
    title: '1993 SP Foil Derek Jeter RC #279 PSA 10',
    description: 'Iconic Jeter rookie. Population 355.',
    category: 'modern',
    currentBid: 115000,
    startingBid: 75000,
    estimateLow: 100000,
    estimateHigh: 150000,
    bidCount: 27,
    timeRemaining: '3h 45m',
    endsAt: '2026-03-13T23:30:00Z',
    status: 'live',
    isWatched: true,
    myMaxBid: 135000,
    strategy: 'proxy',
  },
  {
    id: 'auc_008',
    platform: 'goldin',
    lotNumber: 'LOT 2340',
    title: '2020 Panini National Treasures Justin Herbert RPA /99 BGS 9.5',
    description: 'Rookie Patch Auto. 4-color patch, clean auto.',
    category: 'ultra_modern',
    currentBid: 8200,
    startingBid: 5000,
    estimateLow: 7000,
    estimateHigh: 12000,
    bidCount: 11,
    timeRemaining: '6h 10m',
    endsAt: '2026-03-14T02:00:00Z',
    status: 'live',
    isWatched: false,
    strategy: 'watch_only',
  },
  {
    id: 'auc_009',
    platform: 'pwcc',
    lotNumber: 'LOT 9450',
    title: '2001 Upper Deck SP Authentic Tiger Woods RC Auto /900 BGS 9',
    description: 'Tiger rookie auto. Golf card market surging.',
    category: 'modern',
    currentBid: 22000,
    startingBid: 12000,
    estimateLow: 18000,
    estimateHigh: 30000,
    bidCount: 16,
    timeRemaining: '8h 55m',
    endsAt: '2026-03-14T04:45:00Z',
    status: 'upcoming',
    isWatched: true,
    myMaxBid: 26000,
    strategy: 'snipe',
  },
  {
    id: 'auc_010',
    platform: 'heritage',
    lotNumber: 'LOT 80520',
    title: '1979 O-Pee-Chee Wayne Gretzky RC #18 PSA 8',
    description: 'The Great One. OPC version commands premium over Topps.',
    category: 'vintage',
    currentBid: 165000,
    startingBid: 100000,
    estimateLow: 140000,
    estimateHigh: 200000,
    bidCount: 20,
    timeRemaining: '1d 2h',
    endsAt: '2026-03-14T22:00:00Z',
    status: 'upcoming',
    isWatched: true,
    myMaxBid: 185000,
    strategy: 'proxy',
  },
  {
    id: 'auc_011',
    platform: 'ebay',
    lotNumber: 'ITEM 402918',
    title: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10',
    description: 'J-Rod chrome auto rookie. Rising star.',
    category: 'ultra_modern',
    currentBid: 1850,
    startingBid: 999,
    estimateLow: 1500,
    estimateHigh: 2500,
    bidCount: 8,
    timeRemaining: '12m',
    endsAt: '2026-03-13T19:05:00Z',
    status: 'live',
    isWatched: false,
    strategy: 'watch_only',
  },
  {
    id: 'auc_012',
    platform: 'lelands',
    lotNumber: 'LOT 512',
    title: 'Game-Used Babe Ruth Yankees Jersey (1930s) MEARS A8',
    description: 'Authenticated game-worn flannel. Museum-quality piece.',
    category: 'memorabilia',
    currentBid: 3400000,
    startingBid: 2000000,
    estimateLow: 3000000,
    estimateHigh: 5000000,
    bidCount: 8,
    timeRemaining: '2d 4h',
    endsAt: '2026-03-16T00:00:00Z',
    status: 'upcoming',
    isWatched: false,
    strategy: 'watch_only',
  },
];

const BID_HISTORIES: Record<string, AuctionBid[]> = {
  auc_001: [
    { id: 'bid_001a', auctionId: 'auc_001', bidderId: 'usr_me', bidderLabel: 'You', amount: 350000, timestamp: '2026-03-12T14:22:00Z', isMyBid: true, isWinning: false },
    { id: 'bid_001b', auctionId: 'auc_001', bidderId: 'usr_77x', bidderLabel: 'Bidder **77x', amount: 375000, timestamp: '2026-03-12T16:05:00Z', isMyBid: false, isWinning: false },
    { id: 'bid_001c', auctionId: 'auc_001', bidderId: 'usr_me', bidderLabel: 'You', amount: 400000, timestamp: '2026-03-12T18:30:00Z', isMyBid: true, isWinning: false },
    { id: 'bid_001d', auctionId: 'auc_001', bidderId: 'usr_k3m', bidderLabel: 'Bidder **k3m', amount: 425000, timestamp: '2026-03-13T08:12:00Z', isMyBid: false, isWinning: false },
    { id: 'bid_001e', auctionId: 'auc_001', bidderId: 'usr_55r', bidderLabel: 'Bidder **55r', amount: 460000, timestamp: '2026-03-13T11:45:00Z', isMyBid: false, isWinning: false },
    { id: 'bid_001f', auctionId: 'auc_001', bidderId: 'usr_77x', bidderLabel: 'Bidder **77x', amount: 485000, timestamp: '2026-03-13T15:30:00Z', isMyBid: false, isWinning: true },
  ],
  auc_003: [
    { id: 'bid_003a', auctionId: 'auc_003', bidderId: 'usr_me', bidderLabel: 'You', amount: 55000, timestamp: '2026-03-12T10:00:00Z', isMyBid: true, isWinning: false },
    { id: 'bid_003b', auctionId: 'auc_003', bidderId: 'usr_a1b', bidderLabel: 'Bidder **a1b', amount: 60000, timestamp: '2026-03-12T14:20:00Z', isMyBid: false, isWinning: false },
    { id: 'bid_003c', auctionId: 'auc_003', bidderId: 'usr_me', bidderLabel: 'You', amount: 65000, timestamp: '2026-03-12T16:45:00Z', isMyBid: true, isWinning: false },
    { id: 'bid_003d', auctionId: 'auc_003', bidderId: 'usr_c9z', bidderLabel: 'Bidder **c9z', amount: 72000, timestamp: '2026-03-13T14:10:00Z', isMyBid: false, isWinning: true },
  ],
  auc_004: [
    { id: 'bid_004a', auctionId: 'auc_004', bidderId: 'usr_x2w', bidderLabel: 'Bidder **x2w', amount: 2500, timestamp: '2026-03-12T08:00:00Z', isMyBid: false, isWinning: false },
    { id: 'bid_004b', auctionId: 'auc_004', bidderId: 'usr_j8p', bidderLabel: 'Bidder **j8p', amount: 3200, timestamp: '2026-03-12T12:30:00Z', isMyBid: false, isWinning: false },
    { id: 'bid_004c', auctionId: 'auc_004', bidderId: 'usr_x2w', bidderLabel: 'Bidder **x2w', amount: 4000, timestamp: '2026-03-13T09:15:00Z', isMyBid: false, isWinning: false },
    { id: 'bid_004d', auctionId: 'auc_004', bidderId: 'usr_m5n', bidderLabel: 'Bidder **m5n', amount: 4800, timestamp: '2026-03-13T17:45:00Z', isMyBid: false, isWinning: true },
  ],
};

const WATCHED_LOTS: WatchedLot[] = [
  {
    id: 'wl_001',
    auctionId: 'auc_001',
    title: '1952 Topps Mickey Mantle #311 PSA 6',
    platform: 'heritage',
    currentBid: 485000,
    maxAutoBid: 525000,
    alertThreshold: 500000,
    strategy: 'snipe',
    status: 'live',
    timeRemaining: '2h 14m',
    endsAt: '2026-03-13T22:00:00Z',
    notes: 'Target snipe at final 30 seconds. Comparable sold for $540K in Jan.',
    priceAlertTriggered: false,
  },
  {
    id: 'wl_002',
    auctionId: 'auc_002',
    title: '2003 Topps Chrome LeBron James RC #111 PSA 10',
    platform: 'goldin',
    currentBid: 38500,
    maxAutoBid: 45000,
    alertThreshold: 42000,
    strategy: 'proxy',
    status: 'live',
    timeRemaining: '4h 38m',
    endsAt: '2026-03-14T00:30:00Z',
    notes: 'Proxy set at $45K. Market avg is $42K. Willing to slight overpay for gem mint.',
    priceAlertTriggered: false,
  },
  {
    id: 'wl_003',
    auctionId: 'auc_003',
    title: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5',
    platform: 'pwcc',
    currentBid: 72000,
    maxAutoBid: 82000,
    alertThreshold: 75000,
    strategy: 'snipe',
    status: 'live',
    timeRemaining: '1h 02m',
    endsAt: '2026-03-13T20:45:00Z',
    notes: 'Ending soon. Snipe window 15 seconds. Last 9.5 sold for $78K.',
    priceAlertTriggered: true,
  },
  {
    id: 'wl_004',
    auctionId: 'auc_007',
    title: '1993 SP Foil Derek Jeter RC #279 PSA 10',
    platform: 'heritage',
    currentBid: 115000,
    maxAutoBid: 135000,
    alertThreshold: 120000,
    strategy: 'proxy',
    status: 'live',
    timeRemaining: '3h 45m',
    endsAt: '2026-03-13T23:30:00Z',
    notes: 'Proxy ceiling set. Pop 355 trending upward. Heritage premium expected.',
    priceAlertTriggered: false,
  },
  {
    id: 'wl_005',
    auctionId: 'auc_005',
    title: '1916 Sporting News Babe Ruth RC #151 SGC 3',
    platform: 'lelands',
    currentBid: 1250000,
    maxAutoBid: 0,
    alertThreshold: 1500000,
    strategy: 'watch_only',
    status: 'live',
    timeRemaining: '1d 6h',
    endsAt: '2026-03-15T02:00:00Z',
    notes: 'Watch only. Tracking final hammer for market benchmarking.',
    priceAlertTriggered: false,
  },
  {
    id: 'wl_006',
    auctionId: 'auc_009',
    title: '2001 UD SP Authentic Tiger Woods RC Auto /900 BGS 9',
    platform: 'pwcc',
    currentBid: 22000,
    maxAutoBid: 26000,
    alertThreshold: 24000,
    strategy: 'snipe',
    status: 'upcoming',
    timeRemaining: '8h 55m',
    endsAt: '2026-03-14T04:45:00Z',
    notes: 'Golf market up 18% YoY. Snipe at final 20 seconds.',
    priceAlertTriggered: false,
  },
  {
    id: 'wl_007',
    auctionId: 'auc_010',
    title: '1979 O-Pee-Chee Wayne Gretzky RC #18 PSA 8',
    platform: 'heritage',
    currentBid: 165000,
    maxAutoBid: 185000,
    alertThreshold: 175000,
    strategy: 'proxy',
    status: 'upcoming',
    timeRemaining: '1d 2h',
    endsAt: '2026-03-14T22:00:00Z',
    notes: 'OPC version has 30% premium over Topps. Heritage buyer premium factored in.',
    priceAlertTriggered: false,
  },
];

const AUCTION_RESULTS: AuctionResult[] = [
  { auctionId: 'res_001', title: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', platform: 'goldin', hammerPrice: 3200, estimateLow: 2800, estimateHigh: 4000, totalBids: 18, won: true, myHighestBid: 3200, overpayPercent: -5.9, endedAt: '2026-03-10T22:00:00Z' },
  { auctionId: 'res_002', title: '1989 Upper Deck Ken Griffey Jr RC #1 PSA 10', platform: 'heritage', hammerPrice: 8500, estimateLow: 7000, estimateHigh: 10000, totalBids: 24, won: true, myHighestBid: 8500, overpayPercent: 0, endedAt: '2026-03-09T20:00:00Z' },
  { auctionId: 'res_003', title: '2018 Panini Prizm Trae Young Silver RC PSA 10', platform: 'ebay', hammerPrice: 1200, estimateLow: 800, estimateHigh: 1400, totalBids: 12, won: false, myHighestBid: 1100, overpayPercent: 0, endedAt: '2026-03-08T19:30:00Z' },
  { auctionId: 'res_004', title: '1956 Topps Mickey Mantle #135 PSA 5', platform: 'heritage', hammerPrice: 42000, estimateLow: 35000, estimateHigh: 50000, totalBids: 31, won: true, myHighestBid: 42000, overpayPercent: -1.2, endedAt: '2026-03-07T22:00:00Z' },
  { auctionId: 'res_005', title: '2019 Panini Mosaic Zion Williamson Silver RC PSA 10', platform: 'pwcc', hammerPrice: 950, estimateLow: 700, estimateHigh: 1100, totalBids: 9, won: true, myHighestBid: 950, overpayPercent: 5.6, endedAt: '2026-03-06T21:00:00Z' },
  { auctionId: 'res_006', title: '1971 Topps Roberto Clemente #630 PSA 8', platform: 'lelands', hammerPrice: 15500, estimateLow: 12000, estimateHigh: 18000, totalBids: 20, won: false, myHighestBid: 14000, overpayPercent: 0, endedAt: '2026-03-05T20:00:00Z' },
  { auctionId: 'res_007', title: '2021 Topps Chrome Wander Franco RC Auto PSA 10', platform: 'goldin', hammerPrice: 2400, estimateLow: 2000, estimateHigh: 3500, totalBids: 14, won: true, myHighestBid: 2400, overpayPercent: -12.7, endedAt: '2026-03-04T22:30:00Z' },
  { auctionId: 'res_008', title: '1986 Fleer Basketball Sealed Wax Box', platform: 'huggins_scott', hammerPrice: 185000, estimateLow: 150000, estimateHigh: 220000, totalBids: 28, won: true, myHighestBid: 185000, overpayPercent: 0, endedAt: '2026-03-03T20:00:00Z' },
  { auctionId: 'res_009', title: '2023 Bowman Chrome Victor Wembanyama RC Auto /99 BGS 9.5', platform: 'pwcc', hammerPrice: 28000, estimateLow: 22000, estimateHigh: 35000, totalBids: 33, won: false, myHighestBid: 25000, overpayPercent: 0, endedAt: '2026-03-02T21:00:00Z' },
  { auctionId: 'res_010', title: '1948 Leaf Jackie Robinson RC #79 SGC 4', platform: 'heritage', hammerPrice: 95000, estimateLow: 80000, estimateHigh: 120000, totalBids: 26, won: true, myHighestBid: 95000, overpayPercent: -5.0, endedAt: '2026-03-01T22:00:00Z' },
];

const OPTIMAL_STRATEGIES: OptimalBidRecommendation[] = [
  {
    auctionId: 'auc_001',
    title: '1952 Topps Mickey Mantle #311 PSA 6',
    recommendedStrategy: 'snipe',
    recommendedMax: 530000,
    snipeWindow: '30 seconds',
    proxyCeiling: 540000,
    confidence: 78,
    reasoning: 'Heritage Mantle auctions historically see 15-20% spike in final 2 minutes. Snipe strategy saves avg 8% vs proxy bidding. Last 3 comparable PSA 6 examples sold $510K-$560K.',
    historicalAvg: 535000,
    competitorEstimate: 515000,
  },
  {
    auctionId: 'auc_002',
    title: '2003 Topps Chrome LeBron James RC #111 PSA 10',
    recommendedStrategy: 'proxy',
    recommendedMax: 44000,
    snipeWindow: '15 seconds',
    proxyCeiling: 46000,
    confidence: 82,
    reasoning: 'Goldin LeBron chrome RCs have stable bidding patterns. Proxy at $44K captures 80% of similar lots. Population increasing but demand steady. Avoid overpay above $46K.',
    historicalAvg: 42500,
    competitorEstimate: 41000,
  },
  {
    auctionId: 'auc_003',
    title: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5',
    recommendedStrategy: 'snipe',
    recommendedMax: 80000,
    snipeWindow: '15 seconds',
    proxyCeiling: 85000,
    confidence: 85,
    reasoning: 'PWCC Jordan 9.5s ending soon see aggressive final bidding. Snipe at 15 seconds to avoid bidding war. Market for BGS 9.5 stable at $75K-$85K range. Current bid already in range.',
    historicalAvg: 78000,
    competitorEstimate: 76000,
  },
  {
    auctionId: 'auc_007',
    title: '1993 SP Foil Derek Jeter RC #279 PSA 10',
    recommendedStrategy: 'proxy',
    recommendedMax: 130000,
    snipeWindow: '45 seconds',
    proxyCeiling: 140000,
    confidence: 72,
    reasoning: 'Jeter SP foil has volatile auction history. Heritage buyer premium adds 5-8%. Proxy bidding recommended due to unpredictable late-stage competition. Pop 355 supports $120K-$145K.',
    historicalAvg: 128000,
    competitorEstimate: 125000,
  },
  {
    auctionId: 'auc_009',
    title: '2001 UD SP Authentic Tiger Woods RC Auto /900 BGS 9',
    recommendedStrategy: 'snipe',
    recommendedMax: 25000,
    snipeWindow: '20 seconds',
    proxyCeiling: 27000,
    confidence: 74,
    reasoning: 'Golf card market surging 18% YoY. Tiger autos have limited supply at BGS 9 or higher. PWCC buyers tend to bid conservatively. Snipe recommended to capture value below $26K.',
    historicalAvg: 24000,
    competitorEstimate: 23000,
  },
];

// ---- Public API ----

export function getLiveAuctions(): LiveAuction[] {
  const cached = loadData<LiveAuction[]>('live_auctions');
  if (cached && cached.length > 0) return cached;
  saveData('live_auctions', LIVE_AUCTIONS);
  return LIVE_AUCTIONS;
}

export function getWatchedLots(): WatchedLot[] {
  const cached = loadData<WatchedLot[]>('watched_lots');
  if (cached && cached.length > 0) return cached;
  saveData('watched_lots', WATCHED_LOTS);
  return WATCHED_LOTS;
}

export function placeBid(auctionId: string, amount: number): AuctionBid {
  const bid: AuctionBid = {
    id: `bid_${Date.now()}`,
    auctionId,
    bidderId: 'usr_me',
    bidderLabel: 'You',
    amount,
    timestamp: new Date().toISOString(),
    isMyBid: true,
    isWinning: true,
  };

  const history = getBidHistory(auctionId);
  history.forEach(b => (b.isWinning = false));
  history.push(bid);
  saveData(`bids_${auctionId}`, history);

  // Update auction current bid
  const auctions = getLiveAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (auction) {
    auction.currentBid = amount;
    auction.bidCount += 1;
    saveData('live_auctions', auctions);
  }

  return bid;
}

export function getBidHistory(auctionId: string): AuctionBid[] {
  const cached = loadData<AuctionBid[]>(`bids_${auctionId}`);
  if (cached && cached.length > 0) return cached;
  const defaults = BID_HISTORIES[auctionId] || [];
  if (defaults.length > 0) saveData(`bids_${auctionId}`, defaults);
  return [...defaults];
}

export function getAuctionAnalytics(): AuctionAnalytics {
  const results = getPostAuctionReport();
  const wins = results.filter(r => r.won);
  const losses = results.filter(r => !r.won);
  const totalSpent = wins.reduce((s, r) => s + r.hammerPrice, 0);
  const winRate = results.length > 0 ? (wins.length / results.length) * 100 : 0;

  const overpays = wins.filter(r => r.overpayPercent > 0);
  const savings = wins.filter(r => r.overpayPercent < 0);
  const avgOverpay = overpays.length > 0 ? overpays.reduce((s, r) => s + r.overpayPercent, 0) / overpays.length : 0;
  const avgSavings = savings.length > 0 ? Math.abs(savings.reduce((s, r) => s + r.overpayPercent, 0) / savings.length) : 0;

  const bestDeal = savings.length > 0
    ? { title: savings.sort((a, b) => a.overpayPercent - b.overpayPercent)[0].title, savedPercent: Math.abs(savings[0].overpayPercent) }
    : { title: 'N/A', savedPercent: 0 };
  const worstOverpay = overpays.length > 0
    ? { title: overpays.sort((a, b) => b.overpayPercent - a.overpayPercent)[0].title, overpayPercent: overpays[0].overpayPercent }
    : { title: 'N/A', overpayPercent: 0 };

  const platformMap: Record<string, { wins: number; losses: number; spent: number }> = {};
  results.forEach(r => {
    if (!platformMap[r.platform]) platformMap[r.platform] = { wins: 0, losses: 0, spent: 0 };
    if (r.won) {
      platformMap[r.platform].wins += 1;
      platformMap[r.platform].spent += r.hammerPrice;
    } else {
      platformMap[r.platform].losses += 1;
    }
  });

  return {
    totalAuctionsParticipated: results.length,
    totalWins: wins.length,
    winRate: Math.round(winRate),
    totalSpent,
    avgOverpayPercent: Math.round(avgOverpay * 10) / 10,
    avgSavingsPercent: Math.round(avgSavings * 10) / 10,
    bestDeal,
    worstOverpay,
    platformBreakdown: Object.entries(platformMap).map(([platform, data]) => ({
      platform: platform as AuctionPlatform,
      ...data,
    })),
    timingPatterns: [
      { hour: 18, winRate: 45, avgSavings: 2.1 },
      { hour: 19, winRate: 52, avgSavings: 3.4 },
      { hour: 20, winRate: 68, avgSavings: 5.8 },
      { hour: 21, winRate: 74, avgSavings: 7.2 },
      { hour: 22, winRate: 82, avgSavings: 8.9 },
      { hour: 23, winRate: 65, avgSavings: 4.5 },
    ],
    strategyPerformance: [
      { strategy: 'snipe', uses: 14, winRate: 78, avgCost: -6.2 },
      { strategy: 'proxy', uses: 22, winRate: 64, avgCost: 1.8 },
      { strategy: 'incremental', uses: 8, winRate: 50, avgCost: 4.5 },
      { strategy: 'watch_only', uses: 18, winRate: 0, avgCost: 0 },
    ],
    monthlySpend: [
      { month: 'Oct 2025', spent: 48000, won: 4, lost: 2 },
      { month: 'Nov 2025', spent: 62000, won: 5, lost: 3 },
      { month: 'Dec 2025', spent: 35000, won: 3, lost: 1 },
      { month: 'Jan 2026', spent: 95000, won: 6, lost: 2 },
      { month: 'Feb 2026', spent: 112000, won: 7, lost: 4 },
      { month: 'Mar 2026', spent: 337550, won: 7, lost: 3 },
    ],
  };
}

export function getOptimalBidStrategy(auctionId: string): OptimalBidRecommendation | null {
  return OPTIMAL_STRATEGIES.find(s => s.auctionId === auctionId) || null;
}

export function getPostAuctionReport(): AuctionResult[] {
  const cached = loadData<AuctionResult[]>('auction_results');
  if (cached && cached.length > 0) return cached;
  saveData('auction_results', AUCTION_RESULTS);
  return AUCTION_RESULTS;
}

export function getUpcomingAuctions(): LiveAuction[] {
  return getLiveAuctions().filter(a => a.status === 'upcoming');
}

// ---- Helpers ----

export function getPlatformConfig(platform: AuctionPlatform): { label: string; text: string; bg: string; border: string } {
  const map: Record<AuctionPlatform, { label: string; text: string; bg: string; border: string }> = {
    heritage: { label: 'Heritage', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    goldin: { label: 'Goldin', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    pwcc: { label: 'PWCC', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    ebay: { label: 'eBay', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    lelands: { label: 'Lelands', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    huggins_scott: { label: 'Huggins & Scott', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  };
  return map[platform];
}

export function getStrategyConfig(strategy: BidStrategy): { label: string; text: string; bg: string; border: string } {
  const map: Record<BidStrategy, { label: string; text: string; bg: string; border: string }> = {
    snipe: { label: 'SNIPE', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    proxy: { label: 'PROXY', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    incremental: { label: 'INCREMENTAL', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    watch_only: { label: 'WATCH', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  };
  return map[strategy];
}

export function getStatusConfig(status: AuctionStatus): { label: string; text: string; bg: string; border: string } {
  const map: Record<AuctionStatus, { label: string; text: string; bg: string; border: string }> = {
    live: { label: 'LIVE', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    upcoming: { label: 'UPCOMING', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    ended: { label: 'ENDED', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    suspended: { label: 'SUSPENDED', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  };
  return map[status];
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}
