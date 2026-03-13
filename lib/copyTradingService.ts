// ---- Types ----

export type CollectorCategory = 'Modern Basketball' | 'Vintage Baseball' | 'Modern Football' | 'Pokemon' | 'Overall';
export type Timeframe = '30d' | '90d' | '1yr' | 'all';
export type SignalDelay = 'real-time' | '24h' | '7d';
export type TradeAction = 'buy' | 'sell';

export interface CollectorProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  joinedDate: string;
  verified: boolean;
  category: CollectorCategory;
  strategy: string;
  tradeCount: number;
  avgHoldPeriodDays: number;
  followerCount: number;
  followingCount: number;
  portfolioValue: number;
  bestPick: { card: string; returnPct: number };
  worstPick: { card: string; returnPct: number };
  isFollowing: boolean;
}

export interface PerformanceMetrics {
  userId: string;
  annualizedROI: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  hitRate: number;
  avgGainPct: number;
  avgLossPct: number;
  winCount: number;
  lossCount: number;
  totalTrades: number;
  profitFactor: number;
  calmarRatio: number;
  monthlyReturns: { month: string; returnPct: number }[];
}

export interface TradeSignal {
  id: string;
  collectorId: string;
  collectorName: string;
  collectorAvatar: string;
  action: TradeAction;
  cardName: string;
  cardCategory: CollectorCategory;
  price: number;
  quantity: number;
  reasoning: string;
  timestamp: string;
  confidence: number;
  delayedUntil?: string;
}

export interface FollowRelation {
  id: string;
  followerId: string;
  leaderId: string;
  leaderName: string;
  leaderAvatar: string;
  followedAt: string;
  signalDelay: SignalDelay;
  roiSinceFollowed: number;
  tradesSinceFollowed: number;
}

export interface LeaderboardEntry {
  rank: number;
  collector: CollectorProfile;
  metrics: PerformanceMetrics;
  alphaScore: number;
  trend: 'up' | 'down' | 'stable';
  previousRank: number;
}

export interface CopyPortfolio {
  leaderId: string;
  leaderName: string;
  budget: number;
  allocations: {
    cardName: string;
    category: CollectorCategory;
    leaderWeightPct: number;
    targetAmount: number;
    estimatedShares: number;
    currentPrice: number;
  }[];
  totalAllocated: number;
  remainingCash: number;
  expectedROI: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

export interface TradeHistory {
  id: string;
  userId: string;
  action: TradeAction;
  cardName: string;
  category: CollectorCategory;
  price: number;
  quantity: number;
  timestamp: string;
  pnl?: number;
  pnlPct?: number;
}

export interface AlphaScore {
  userId: string;
  overall: number;
  consistency: number;
  riskManagement: number;
  timing: number;
  diversification: number;
  communityTrust: number;
}

export interface MirrorStrategy {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  budget: number;
  allocationMode: 'proportional' | 'equal_weight' | 'risk_parity';
  autoRebalance: boolean;
  maxPositionPct: number;
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
  performance: number;
}

export interface CommunityBenchmark {
  userROI: number;
  percentile: number;
  rank: number;
  totalCollectors: number;
  medianROI: number;
  topQuartileROI: number;
  bottomQuartileROI: number;
  categoryRanks: { category: CollectorCategory; rank: number; total: number }[];
}

// ---- Mock Data ----

const AVATARS = [
  '🏀', '⚾', '🏈', '🎴', '💎', '🔥', '⚡', '🌟', '🎯', '🏆',
  '🦅', '🐻', '🦁', '🐯', '🎲', '💰', '📈', '🛡️', '🎪', '🗡️',
  '🌊', '🏔️', '🎸', '🚀', '⭐', '🔮', '🧊', '🎭', '🦊', '🐺',
];

const STRATEGIES = [
  'Momentum-based modern card flipping',
  'Long-term vintage hold strategy',
  'Rookie card specialist',
  'Grade arbitrage hunter',
  'PSA 10 pop report tracker',
  'Contrarian value investor',
  'High-frequency break flipper',
  'Set completion specialist',
  'Star power concentration',
  'Diversified index approach',
  'Pokemon sealed product focus',
  'Prospect pipeline builder',
  'Injury discount buyer',
  'Award season momentum trader',
  'Vintage tobacco card accumulator',
];

const CARD_NAMES = [
  '2018 Prizm Luka Doncic Silver PSA 10',
  '2020 Prizm Justin Herbert Base PSA 10',
  '1986 Fleer Michael Jordan #57 PSA 8',
  '1952 Topps Mickey Mantle #311 PSA 4',
  '2019 Prizm Ja Morant Silver PSA 10',
  '2003 Topps Chrome LeBron James #111 PSA 9',
  'Base Set Charizard Holo PSA 9',
  '2020 Optic Joe Burrow Rated Rookie PSA 10',
  '2018 National Treasures Saquon Barkley /99 BGS 9.5',
  '1st Edition Shadowless Blastoise PSA 8',
  '2021 Prizm Trevor Lawrence Silver PSA 10',
  '1993 SP Derek Jeter #279 PSA 10',
  '2019 Optic Zion Williamson Rated Rookie PSA 10',
  '2022 Prizm Paolo Banchero Silver PSA 10',
  '2017 Prizm Patrick Mahomes Silver PSA 10',
  '1969 Topps Reggie Jackson #260 PSA 7',
  'Illustrator Pikachu CGC 7',
  '2020 Select Justin Jefferson Concourse PSA 10',
  '2021 Bowman Chrome Marcelo Mayer Auto /499',
  '1956 Topps Roberto Clemente #33 PSA 6',
];

function generateMockCollectors(): CollectorProfile[] {
  const collectors: CollectorProfile[] = [
    {
      id: 'col_001', username: 'hoops_alpha', displayName: 'HoopsAlpha',
      avatarUrl: AVATARS[0], bio: 'NBA card specialist. 8+ years experience. Focus on emerging stars and grade arbitrage.',
      joinedDate: '2018-03-15', verified: true, category: 'Modern Basketball',
      strategy: 'Momentum-based modern card flipping',
      tradeCount: 1247, avgHoldPeriodDays: 42, followerCount: 3482, followingCount: 12,
      portfolioValue: 287500, bestPick: { card: '2018 Prizm Luka Doncic Silver PSA 10', returnPct: 342 },
      worstPick: { card: '2021 Prizm Trevor Lawrence Silver PSA 10', returnPct: -38 }, isFollowing: false,
    },
    {
      id: 'col_002', username: 'vintage_vault', displayName: 'VintageVault',
      avatarUrl: AVATARS[1], bio: 'Pre-war and vintage baseball is all I collect. Patience wins.',
      joinedDate: '2016-07-22', verified: true, category: 'Vintage Baseball',
      strategy: 'Long-term vintage hold strategy',
      tradeCount: 312, avgHoldPeriodDays: 730, followerCount: 5120, followingCount: 5,
      portfolioValue: 892000, bestPick: { card: '1952 Topps Mickey Mantle #311 PSA 4', returnPct: 185 },
      worstPick: { card: '1969 Topps Reggie Jackson #260 PSA 7', returnPct: -12 }, isFollowing: true,
    },
    {
      id: 'col_003', username: 'gridiron_gains', displayName: 'GridironGains',
      avatarUrl: AVATARS[2], bio: 'NFL rookie cards and QB play. Aggressive short-term strategy.',
      joinedDate: '2019-09-01', verified: true, category: 'Modern Football',
      strategy: 'Rookie card specialist',
      tradeCount: 2103, avgHoldPeriodDays: 28, followerCount: 2910, followingCount: 18,
      portfolioValue: 156800, bestPick: { card: '2020 Prizm Justin Herbert Base PSA 10', returnPct: 215 },
      worstPick: { card: '2021 Prizm Trevor Lawrence Silver PSA 10', returnPct: -52 }, isFollowing: false,
    },
    {
      id: 'col_004', username: 'poke_master_99', displayName: 'PokeMaster99',
      avatarUrl: AVATARS[3], bio: 'Pokemon sealed & graded specialist. WOTC era is king.',
      joinedDate: '2020-01-10', verified: true, category: 'Pokemon',
      strategy: 'Pokemon sealed product focus',
      tradeCount: 891, avgHoldPeriodDays: 180, followerCount: 7230, followingCount: 8,
      portfolioValue: 534000, bestPick: { card: 'Base Set Charizard Holo PSA 9', returnPct: 420 },
      worstPick: { card: '1st Edition Shadowless Blastoise PSA 8', returnPct: -18 }, isFollowing: false,
    },
    {
      id: 'col_005', username: 'sharp_shooter', displayName: 'SharpShooter',
      avatarUrl: AVATARS[4], bio: 'Data-driven collector. Statistical edge over gut feeling.',
      joinedDate: '2019-05-20', verified: true, category: 'Overall',
      strategy: 'Diversified index approach',
      tradeCount: 1560, avgHoldPeriodDays: 90, followerCount: 4100, followingCount: 15,
      portfolioValue: 412000, bestPick: { card: '2019 Prizm Ja Morant Silver PSA 10', returnPct: 267 },
      worstPick: { card: '2022 Prizm Paolo Banchero Silver PSA 10', returnPct: -29 }, isFollowing: true,
    },
    {
      id: 'col_006', username: 'flip_king', displayName: 'FlipKing',
      avatarUrl: AVATARS[5], bio: 'Break flipper and quick-turn artist. Volume is my edge.',
      joinedDate: '2020-06-14', verified: false, category: 'Modern Basketball',
      strategy: 'High-frequency break flipper',
      tradeCount: 4521, avgHoldPeriodDays: 7, followerCount: 1890, followingCount: 22,
      portfolioValue: 89400, bestPick: { card: '2019 Optic Zion Williamson Rated Rookie PSA 10', returnPct: 180 },
      worstPick: { card: '2022 Prizm Paolo Banchero Silver PSA 10', returnPct: -44 }, isFollowing: false,
    },
    {
      id: 'col_007', username: 'diamond_hands_dc', displayName: 'DiamondHandsDC',
      avatarUrl: AVATARS[6], bio: 'I buy and never sell. True collector mentality.',
      joinedDate: '2015-11-03', verified: true, category: 'Vintage Baseball',
      strategy: 'Long-term vintage hold strategy',
      tradeCount: 98, avgHoldPeriodDays: 1460, followerCount: 2340, followingCount: 3,
      portfolioValue: 1250000, bestPick: { card: '1952 Topps Mickey Mantle #311 PSA 4', returnPct: 310 },
      worstPick: { card: '1993 SP Derek Jeter #279 PSA 10', returnPct: -8 }, isFollowing: false,
    },
    {
      id: 'col_008', username: 'prospect_hunter', displayName: 'ProspectHunter',
      avatarUrl: AVATARS[7], bio: 'Bowman Chrome autos and international prospects before they break out.',
      joinedDate: '2020-03-28', verified: false, category: 'Modern Basketball',
      strategy: 'Prospect pipeline builder',
      tradeCount: 876, avgHoldPeriodDays: 120, followerCount: 1560, followingCount: 25,
      portfolioValue: 67300, bestPick: { card: '2021 Bowman Chrome Marcelo Mayer Auto /499', returnPct: 195 },
      worstPick: { card: '2020 Select Justin Jefferson Concourse PSA 10', returnPct: -35 }, isFollowing: false,
    },
    {
      id: 'col_009', username: 'grade_arb', displayName: 'GradeArb',
      avatarUrl: AVATARS[8], bio: 'Buy raw, grade, sell high. Simple but effective.',
      joinedDate: '2019-08-12', verified: true, category: 'Overall',
      strategy: 'Grade arbitrage hunter',
      tradeCount: 2890, avgHoldPeriodDays: 60, followerCount: 3780, followingCount: 10,
      portfolioValue: 198500, bestPick: { card: '2003 Topps Chrome LeBron James #111 PSA 9', returnPct: 290 },
      worstPick: { card: '2020 Optic Joe Burrow Rated Rookie PSA 10', returnPct: -22 }, isFollowing: false,
    },
    {
      id: 'col_010', username: 'set_builder_sam', displayName: 'SetBuilderSam',
      avatarUrl: AVATARS[9], bio: 'Complete sets are my passion. Registry sets and master sets.',
      joinedDate: '2017-04-05', verified: false, category: 'Vintage Baseball',
      strategy: 'Set completion specialist',
      tradeCount: 1430, avgHoldPeriodDays: 365, followerCount: 890, followingCount: 14,
      portfolioValue: 345000, bestPick: { card: '1956 Topps Roberto Clemente #33 PSA 6', returnPct: 142 },
      worstPick: { card: '1969 Topps Reggie Jackson #260 PSA 7', returnPct: -15 }, isFollowing: false,
    },
    {
      id: 'col_011', username: 'mahomes_mafia', displayName: 'MahomesMafia',
      avatarUrl: AVATARS[10], bio: 'All-in on Mahomes and KC. Player-focused collector.',
      joinedDate: '2020-02-02', verified: false, category: 'Modern Football',
      strategy: 'Star power concentration',
      tradeCount: 342, avgHoldPeriodDays: 200, followerCount: 1240, followingCount: 9,
      portfolioValue: 124500, bestPick: { card: '2017 Prizm Patrick Mahomes Silver PSA 10', returnPct: 520 },
      worstPick: { card: '2020 Select Justin Jefferson Concourse PSA 10', returnPct: -28 }, isFollowing: false,
    },
    {
      id: 'col_012', username: 'contrarian_chris', displayName: 'ContrarianChris',
      avatarUrl: AVATARS[11], bio: 'Buy when others panic. Sell when they FOMO. Contrarian to the core.',
      joinedDate: '2018-11-20', verified: true, category: 'Overall',
      strategy: 'Contrarian value investor',
      tradeCount: 678, avgHoldPeriodDays: 150, followerCount: 4560, followingCount: 6,
      portfolioValue: 378000, bestPick: { card: '2018 Prizm Luka Doncic Silver PSA 10', returnPct: 380 },
      worstPick: { card: '2021 Prizm Trevor Lawrence Silver PSA 10', returnPct: -41 }, isFollowing: true,
    },
    {
      id: 'col_013', username: 'injury_discount', displayName: 'InjuryDiscount',
      avatarUrl: AVATARS[12], bio: 'Buy the dip on injured stars. Patience pays when they return.',
      joinedDate: '2019-12-01', verified: false, category: 'Modern Basketball',
      strategy: 'Injury discount buyer',
      tradeCount: 534, avgHoldPeriodDays: 95, followerCount: 2120, followingCount: 11,
      portfolioValue: 142000, bestPick: { card: '2019 Prizm Ja Morant Silver PSA 10', returnPct: 198 },
      worstPick: { card: '2022 Prizm Paolo Banchero Silver PSA 10', returnPct: -33 }, isFollowing: false,
    },
    {
      id: 'col_014', username: 'mvp_season', displayName: 'MVPSeason',
      avatarUrl: AVATARS[13], bio: 'Riding award season momentum. Buy before, sell after.',
      joinedDate: '2020-04-15', verified: true, category: 'Modern Basketball',
      strategy: 'Award season momentum trader',
      tradeCount: 1123, avgHoldPeriodDays: 55, followerCount: 3210, followingCount: 16,
      portfolioValue: 223000, bestPick: { card: '2019 Optic Zion Williamson Rated Rookie PSA 10', returnPct: 245 },
      worstPick: { card: '2020 Optic Joe Burrow Rated Rookie PSA 10', returnPct: -27 }, isFollowing: false,
    },
    {
      id: 'col_015', username: 'psa_pop_tracker', displayName: 'PSAPopTracker',
      avatarUrl: AVATARS[14], bio: 'I track PSA population reports obsessively. Low pop = high alpha.',
      joinedDate: '2019-01-08', verified: true, category: 'Overall',
      strategy: 'PSA 10 pop report tracker',
      tradeCount: 1890, avgHoldPeriodDays: 75, followerCount: 5670, followingCount: 7,
      portfolioValue: 456000, bestPick: { card: '2003 Topps Chrome LeBron James #111 PSA 9', returnPct: 315 },
      worstPick: { card: '2021 Prizm Trevor Lawrence Silver PSA 10', returnPct: -19 }, isFollowing: false,
    },
    {
      id: 'col_016', username: 'tobacco_roads', displayName: 'TobaccoRoads',
      avatarUrl: AVATARS[15], bio: 'Pre-war tobacco cards and T206 specialist. History is my portfolio.',
      joinedDate: '2014-06-30', verified: true, category: 'Vintage Baseball',
      strategy: 'Vintage tobacco card accumulator',
      tradeCount: 156, avgHoldPeriodDays: 1825, followerCount: 1890, followingCount: 4,
      portfolioValue: 2100000, bestPick: { card: '1952 Topps Mickey Mantle #311 PSA 4', returnPct: 275 },
      worstPick: { card: '1956 Topps Roberto Clemente #33 PSA 6', returnPct: -5 }, isFollowing: false,
    },
    {
      id: 'col_017', username: 'burrow_believer', displayName: 'BurrowBeliever',
      avatarUrl: AVATARS[16], bio: 'Cincinnati sports card collector. Heavy on Bengals.',
      joinedDate: '2020-08-22', verified: false, category: 'Modern Football',
      strategy: 'Star power concentration',
      tradeCount: 467, avgHoldPeriodDays: 110, followerCount: 780, followingCount: 20,
      portfolioValue: 78900, bestPick: { card: '2020 Optic Joe Burrow Rated Rookie PSA 10', returnPct: 165 },
      worstPick: { card: '2021 Prizm Trevor Lawrence Silver PSA 10', returnPct: -48 }, isFollowing: false,
    },
    {
      id: 'col_018', username: 'sealed_wax_god', displayName: 'SealedWaxGod',
      avatarUrl: AVATARS[17], bio: 'Sealed wax is the only play. Boxes and cases only.',
      joinedDate: '2019-03-14', verified: true, category: 'Pokemon',
      strategy: 'Pokemon sealed product focus',
      tradeCount: 234, avgHoldPeriodDays: 365, followerCount: 4320, followingCount: 6,
      portfolioValue: 780000, bestPick: { card: 'Illustrator Pikachu CGC 7', returnPct: 890 },
      worstPick: { card: '1st Edition Shadowless Blastoise PSA 8', returnPct: -10 }, isFollowing: false,
    },
    {
      id: 'col_019', username: 'the_analyst', displayName: 'TheAnalyst',
      avatarUrl: AVATARS[18], bio: 'Former Wall Street quant. Applying financial models to cards.',
      joinedDate: '2021-01-05', verified: true, category: 'Overall',
      strategy: 'Diversified index approach',
      tradeCount: 1340, avgHoldPeriodDays: 65, followerCount: 6890, followingCount: 4,
      portfolioValue: 567000, bestPick: { card: '2018 Prizm Luka Doncic Silver PSA 10', returnPct: 298 },
      worstPick: { card: '2022 Prizm Paolo Banchero Silver PSA 10', returnPct: -15 }, isFollowing: false,
    },
    {
      id: 'col_020', username: 'break_room_betty', displayName: 'BreakRoomBetty',
      avatarUrl: AVATARS[19], bio: 'Live break enthusiast. Content creator and card educator.',
      joinedDate: '2020-10-18', verified: false, category: 'Modern Basketball',
      strategy: 'High-frequency break flipper',
      tradeCount: 3210, avgHoldPeriodDays: 14, followerCount: 2450, followingCount: 30,
      portfolioValue: 112000, bestPick: { card: '2019 Prizm Ja Morant Silver PSA 10', returnPct: 175 },
      worstPick: { card: '2022 Prizm Paolo Banchero Silver PSA 10', returnPct: -40 }, isFollowing: false,
    },
    {
      id: 'col_021', username: 'silent_sniper', displayName: 'SilentSniper',
      avatarUrl: AVATARS[20], bio: 'Auction sniper. I wait, I watch, I strike.',
      joinedDate: '2018-07-09', verified: true, category: 'Modern Football',
      strategy: 'Momentum-based modern card flipping',
      tradeCount: 1678, avgHoldPeriodDays: 35, followerCount: 2890, followingCount: 8,
      portfolioValue: 234000, bestPick: { card: '2020 Prizm Justin Herbert Base PSA 10', returnPct: 278 },
      worstPick: { card: '2020 Select Justin Jefferson Concourse PSA 10', returnPct: -31 }, isFollowing: false,
    },
    {
      id: 'col_022', username: 'gem_mint_gary', displayName: 'GemMintGary',
      avatarUrl: AVATARS[21], bio: 'Only PSA 10 and BGS 9.5. Gem mint or nothing.',
      joinedDate: '2017-12-01', verified: true, category: 'Overall',
      strategy: 'PSA 10 pop report tracker',
      tradeCount: 980, avgHoldPeriodDays: 120, followerCount: 3450, followingCount: 9,
      portfolioValue: 520000, bestPick: { card: '2003 Topps Chrome LeBron James #111 PSA 9', returnPct: 350 },
      worstPick: { card: '2021 Bowman Chrome Marcelo Mayer Auto /499', returnPct: -24 }, isFollowing: false,
    },
    {
      id: 'col_023', username: 'poke_sealed_pro', displayName: 'PokeSealedPro',
      avatarUrl: AVATARS[22], bio: 'Japanese exclusive and sealed product specialist.',
      joinedDate: '2019-11-11', verified: false, category: 'Pokemon',
      strategy: 'Pokemon sealed product focus',
      tradeCount: 567, avgHoldPeriodDays: 240, followerCount: 3120, followingCount: 12,
      portfolioValue: 345000, bestPick: { card: 'Base Set Charizard Holo PSA 9', returnPct: 310 },
      worstPick: { card: '1st Edition Shadowless Blastoise PSA 8', returnPct: -22 }, isFollowing: false,
    },
    {
      id: 'col_024', username: 'value_vulture', displayName: 'ValueVulture',
      avatarUrl: AVATARS[23], bio: 'Deep value plays on underappreciated cards. Patience is alpha.',
      joinedDate: '2018-02-14', verified: true, category: 'Vintage Baseball',
      strategy: 'Contrarian value investor',
      tradeCount: 445, avgHoldPeriodDays: 280, followerCount: 2670, followingCount: 7,
      portfolioValue: 412000, bestPick: { card: '1993 SP Derek Jeter #279 PSA 10', returnPct: 225 },
      worstPick: { card: '1969 Topps Reggie Jackson #260 PSA 7', returnPct: -18 }, isFollowing: false,
    },
    {
      id: 'col_025', username: 'qb_factory', displayName: 'QBFactory',
      avatarUrl: AVATARS[24], bio: 'Only quarterback rookies. Draft night is my Super Bowl.',
      joinedDate: '2019-04-25', verified: false, category: 'Modern Football',
      strategy: 'Rookie card specialist',
      tradeCount: 1560, avgHoldPeriodDays: 45, followerCount: 1980, followingCount: 15,
      portfolioValue: 167000, bestPick: { card: '2017 Prizm Patrick Mahomes Silver PSA 10', returnPct: 480 },
      worstPick: { card: '2021 Prizm Trevor Lawrence Silver PSA 10', returnPct: -55 }, isFollowing: false,
    },
  ];
  return collectors;
}

const MOCK_COLLECTORS = generateMockCollectors();

function generateMetrics(collector: CollectorProfile): PerformanceMetrics {
  const seed = collector.id.charCodeAt(collector.id.length - 1) + collector.tradeCount;
  const pseudoRandom = (n: number) => ((seed * (n + 1) * 9301 + 49297) % 233280) / 233280;

  const annualizedROI = 8 + pseudoRandom(1) * 85;
  const hitRate = 0.45 + pseudoRandom(2) * 0.3;
  const avgGainPct = 15 + pseudoRandom(3) * 60;
  const avgLossPct = -(5 + pseudoRandom(4) * 30);
  const maxDrawdown = -(5 + pseudoRandom(5) * 35);
  const volatility = 8 + pseudoRandom(6) * 25;
  const sharpeRatio = annualizedROI / volatility;
  const downVol = Math.abs(maxDrawdown) * 0.4;
  const sortinoRatio = annualizedROI / (downVol || 1);
  const winCount = Math.round(collector.tradeCount * hitRate);
  const lossCount = collector.tradeCount - winCount;
  const profitFactor = (winCount * avgGainPct) / Math.max(lossCount * Math.abs(avgLossPct), 1);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyReturns = months.map((month, i) => ({
    month,
    returnPct: parseFloat((-8 + pseudoRandom(10 + i) * 25).toFixed(1)),
  }));

  return {
    userId: collector.id,
    annualizedROI: parseFloat(annualizedROI.toFixed(1)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    sortinoRatio: parseFloat(sortinoRatio.toFixed(2)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(1)),
    hitRate: parseFloat(hitRate.toFixed(2)),
    avgGainPct: parseFloat(avgGainPct.toFixed(1)),
    avgLossPct: parseFloat(avgLossPct.toFixed(1)),
    winCount,
    lossCount,
    totalTrades: collector.tradeCount,
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    calmarRatio: parseFloat((annualizedROI / Math.abs(maxDrawdown)).toFixed(2)),
    monthlyReturns,
  };
}

function computeAlphaScore(metrics: PerformanceMetrics, collector: CollectorProfile): AlphaScore {
  const consistency = Math.min(100, metrics.sharpeRatio * 30);
  const riskManagement = Math.min(100, 100 - Math.abs(metrics.maxDrawdown) * 2);
  const timing = Math.min(100, metrics.hitRate * 130);
  const diversification = collector.category === 'Overall' ? 80 : 50 + (collector.tradeCount / 50);
  const communityTrust = Math.min(100, (collector.followerCount / 80) + (collector.verified ? 20 : 0));
  const overall = (consistency * 0.25 + riskManagement * 0.2 + timing * 0.25 + diversification * 0.15 + communityTrust * 0.15);

  return {
    userId: collector.id,
    overall: parseFloat(Math.min(99, overall).toFixed(0)),
    consistency: parseFloat(Math.min(99, consistency).toFixed(0)),
    riskManagement: parseFloat(Math.min(99, riskManagement).toFixed(0)),
    timing: parseFloat(Math.min(99, timing).toFixed(0)),
    diversification: parseFloat(Math.min(99, diversification).toFixed(0)),
    communityTrust: parseFloat(Math.min(99, communityTrust).toFixed(0)),
  };
}

// ---- Service Functions ----

export function getLeaderboard(category?: CollectorCategory, timeframe?: Timeframe): LeaderboardEntry[] {
  let filtered = [...MOCK_COLLECTORS];
  if (category && category !== 'Overall') {
    filtered = filtered.filter(c => c.category === category);
  }

  const entries: LeaderboardEntry[] = filtered.map(collector => {
    const metrics = generateMetrics(collector);
    const alpha = computeAlphaScore(metrics, collector);
    return {
      rank: 0,
      collector,
      metrics,
      alphaScore: alpha.overall,
      trend: metrics.annualizedROI > 30 ? 'up' as const : metrics.annualizedROI > 15 ? 'stable' as const : 'down' as const,
      previousRank: 0,
    };
  });

  // Sort by risk-adjusted returns (Sharpe ratio weighted with ROI)
  entries.sort((a, b) => {
    const scoreA = a.metrics.sharpeRatio * 40 + a.metrics.annualizedROI * 0.3 + a.metrics.hitRate * 20 - Math.abs(a.metrics.maxDrawdown) * 0.5;
    const scoreB = b.metrics.sharpeRatio * 40 + b.metrics.annualizedROI * 0.3 + b.metrics.hitRate * 20 - Math.abs(b.metrics.maxDrawdown) * 0.5;
    return scoreB - scoreA;
  });

  // Apply timeframe-based adjustment (simulated)
  if (timeframe === '30d') {
    entries.forEach(e => {
      e.metrics.annualizedROI = parseFloat((e.metrics.annualizedROI * (0.7 + Math.random() * 0.6)).toFixed(1));
    });
  }

  entries.forEach((entry, i) => {
    entry.rank = i + 1;
    entry.previousRank = Math.max(1, i + 1 + Math.floor(Math.random() * 5 - 2));
  });

  return entries;
}

export function getCollectorProfile(userId: string): CollectorProfile | null {
  return MOCK_COLLECTORS.find(c => c.id === userId) ?? null;
}

export function getPerformanceMetrics(userId: string): PerformanceMetrics | null {
  const collector = MOCK_COLLECTORS.find(c => c.id === userId);
  if (!collector) return null;
  return generateMetrics(collector);
}

export function getTradeSignals(userId: string): TradeSignal[] {
  const following = getMyFollowing();
  const relevantCollectors = userId ? following.map(f => MOCK_COLLECTORS.find(c => c.id === f.leaderId)).filter(Boolean) : MOCK_COLLECTORS.slice(0, 5);

  const signals: TradeSignal[] = [];
  const now = Date.now();
  const REASONS_BUY = [
    'PSA pop report shows low supply at this grade — scarcity play',
    'Player trending up after recent performance, momentum entry',
    'Price dipped 15% below 90-day average — value buy',
    'Award season approaching, historically bullish for this card',
    'Undervalued relative to comparable players in the set',
    'Grading arbitrage opportunity — raw card likely PSA 9+',
    'Market correction created a discount entry point',
    'Sealed product approaching critical supply shortage',
  ];
  const REASONS_SELL = [
    'Taking profits at 2x entry — risk management discipline',
    'PSA pop report increased 30% — dilution concern',
    'Player injury risk elevated — reducing exposure',
    'Market top signals flashing — rotating to cash',
    'Rebalancing portfolio — trimming overweight position',
    'Better opportunity cost identified elsewhere',
  ];

  (relevantCollectors as CollectorProfile[]).forEach((collector, ci) => {
    const numSignals = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numSignals; i++) {
      const isBuy = Math.random() > 0.35;
      const card = CARD_NAMES[Math.floor(Math.random() * CARD_NAMES.length)];
      signals.push({
        id: `sig_${collector.id}_${i}`,
        collectorId: collector.id,
        collectorName: collector.displayName,
        collectorAvatar: collector.avatarUrl,
        action: isBuy ? 'buy' : 'sell',
        cardName: card,
        cardCategory: collector.category,
        price: parseFloat((50 + Math.random() * 2000).toFixed(2)),
        quantity: Math.ceil(Math.random() * 3),
        reasoning: isBuy
          ? REASONS_BUY[Math.floor(Math.random() * REASONS_BUY.length)]
          : REASONS_SELL[Math.floor(Math.random() * REASONS_SELL.length)],
        timestamp: new Date(now - (ci * 3 + i) * 3600000 * (1 + Math.random() * 5)).toISOString(),
        confidence: parseFloat((0.6 + Math.random() * 0.35).toFixed(2)),
      });
    }
  });

  signals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return signals;
}

export function followCollector(userId: string): FollowRelation {
  const collector = MOCK_COLLECTORS.find(c => c.id === userId);
  return {
    id: `follow_${Date.now()}`,
    followerId: 'current_user',
    leaderId: userId,
    leaderName: collector?.displayName ?? 'Unknown',
    leaderAvatar: collector?.avatarUrl ?? '👤',
    followedAt: new Date().toISOString(),
    signalDelay: 'real-time',
    roiSinceFollowed: 0,
    tradesSinceFollowed: 0,
  };
}

export function getMirrorPortfolio(leaderId: string, budget: number): CopyPortfolio {
  const collector = MOCK_COLLECTORS.find(c => c.id === leaderId);
  if (!collector) {
    return {
      leaderId, leaderName: 'Unknown', budget, allocations: [],
      totalAllocated: 0, remainingCash: budget, expectedROI: 0, riskLevel: 'moderate',
    };
  }

  const metrics = generateMetrics(collector);
  const numPositions = 5 + Math.floor(Math.random() * 4);
  const weights: number[] = [];
  let totalWeight = 0;
  for (let i = 0; i < numPositions; i++) {
    const w = 5 + Math.random() * 25;
    weights.push(w);
    totalWeight += w;
  }

  const allocations = weights.map((w, i) => {
    const weightPct = (w / totalWeight) * 100;
    const targetAmount = parseFloat(((budget * weightPct) / 100).toFixed(2));
    const currentPrice = parseFloat((20 + Math.random() * 500).toFixed(2));
    return {
      cardName: CARD_NAMES[i % CARD_NAMES.length],
      category: collector.category,
      leaderWeightPct: parseFloat(weightPct.toFixed(1)),
      targetAmount,
      estimatedShares: Math.max(1, Math.floor(targetAmount / currentPrice)),
      currentPrice,
    };
  });

  const totalAllocated = allocations.reduce((sum, a) => sum + a.targetAmount, 0);

  return {
    leaderId,
    leaderName: collector.displayName,
    budget,
    allocations,
    totalAllocated: parseFloat(totalAllocated.toFixed(2)),
    remainingCash: parseFloat((budget - totalAllocated).toFixed(2)),
    expectedROI: parseFloat((metrics.annualizedROI * 0.8).toFixed(1)),
    riskLevel: Math.abs(metrics.maxDrawdown) > 25 ? 'aggressive' : Math.abs(metrics.maxDrawdown) > 15 ? 'moderate' : 'conservative',
  };
}

export function getMyFollowing(): FollowRelation[] {
  const followedCollectors = MOCK_COLLECTORS.filter(c => c.isFollowing);
  return followedCollectors.map((collector, i) => ({
    id: `follow_${i}`,
    followerId: 'current_user',
    leaderId: collector.id,
    leaderName: collector.displayName,
    leaderAvatar: collector.avatarUrl,
    followedAt: new Date(Date.now() - (30 + i * 15) * 86400000).toISOString(),
    signalDelay: 'real-time' as SignalDelay,
    roiSinceFollowed: parseFloat((5 + Math.random() * 30).toFixed(1)),
    tradesSinceFollowed: 10 + Math.floor(Math.random() * 50),
  }));
}

export function getMyFollowers(): FollowRelation[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `follower_${i}`,
    followerId: `user_${100 + i}`,
    leaderId: 'current_user',
    leaderName: `Follower${i + 1}`,
    leaderAvatar: AVATARS[(i + 10) % AVATARS.length],
    followedAt: new Date(Date.now() - (10 + i * 7) * 86400000).toISOString(),
    signalDelay: (['real-time', '24h', '7d'] as SignalDelay[])[i % 3],
    roiSinceFollowed: parseFloat((-5 + Math.random() * 35).toFixed(1)),
    tradesSinceFollowed: 5 + Math.floor(Math.random() * 30),
  }));
}

export function getCommunityBenchmark(inventoryReturnPct?: number): CommunityBenchmark {
  const userROI = inventoryReturnPct ?? 18.4;
  const allROIs = MOCK_COLLECTORS.map(c => generateMetrics(c).annualizedROI).sort((a, b) => b - a);
  const rank = allROIs.filter(r => r > userROI).length + 1;
  const total = allROIs.length + 1;

  return {
    userROI,
    percentile: parseFloat((((total - rank) / total) * 100).toFixed(0)),
    rank,
    totalCollectors: total,
    medianROI: parseFloat(allROIs[Math.floor(allROIs.length / 2)].toFixed(1)),
    topQuartileROI: parseFloat(allROIs[Math.floor(allROIs.length * 0.25)].toFixed(1)),
    bottomQuartileROI: parseFloat(allROIs[Math.floor(allROIs.length * 0.75)].toFixed(1)),
    categoryRanks: (['Modern Basketball', 'Vintage Baseball', 'Modern Football', 'Pokemon', 'Overall'] as CollectorCategory[]).map(cat => {
      const catCollectors = MOCK_COLLECTORS.filter(c => c.category === cat);
      const catRank = Math.floor(Math.random() * catCollectors.length) + 1;
      return { category: cat, rank: catRank, total: catCollectors.length + 1 };
    }),
  };
}

export function getTrendingCollectors(): LeaderboardEntry[] {
  const leaderboard = getLeaderboard();
  return leaderboard
    .filter(e => e.trend === 'up')
    .sort((a, b) => b.metrics.annualizedROI - a.metrics.annualizedROI)
    .slice(0, 10);
}

export function getCategoryLeaders(): { category: CollectorCategory; leader: LeaderboardEntry }[] {
  const categories: CollectorCategory[] = ['Modern Basketball', 'Vintage Baseball', 'Modern Football', 'Pokemon', 'Overall'];
  return categories.map(category => {
    const leaderboard = getLeaderboard(category);
    return { category, leader: leaderboard[0] };
  });
}

export function getTradeHistory(userId: string): TradeHistory[] {
  const collector = MOCK_COLLECTORS.find(c => c.id === userId);
  if (!collector) return [];

  const now = Date.now();
  return Array.from({ length: 15 }, (_, i) => {
    const isBuy = i % 3 !== 0;
    const price = parseFloat((30 + Math.random() * 1500).toFixed(2));
    const pnl = isBuy ? undefined : parseFloat((-200 + Math.random() * 800).toFixed(2));
    return {
      id: `trade_${userId}_${i}`,
      userId,
      action: isBuy ? 'buy' as const : 'sell' as const,
      cardName: CARD_NAMES[i % CARD_NAMES.length],
      category: collector.category,
      price,
      quantity: Math.ceil(Math.random() * 2),
      timestamp: new Date(now - i * 86400000 * (2 + Math.random() * 5)).toISOString(),
      pnl,
      pnlPct: pnl ? parseFloat(((pnl / price) * 100).toFixed(1)) : undefined,
    };
  });
}

export function getAlphaScore(userId: string): AlphaScore | null {
  const collector = MOCK_COLLECTORS.find(c => c.id === userId);
  if (!collector) return null;
  const metrics = generateMetrics(collector);
  return computeAlphaScore(metrics, collector);
}
