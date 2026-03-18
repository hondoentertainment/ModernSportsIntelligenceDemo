// ---------------------------------------------------------------------------
// Card Yield Farming Service
// Passive income strategies for sports card collections: lending, licensing,
// rental, staking, and insurance pooling.
// ---------------------------------------------------------------------------

/* ----------------------------- Core Types -------------------------------- */

export type PoolType =
  | 'lending'
  | 'licensing'
  | 'rental'
  | 'staking'
  | 'insurance-pool';

export type PoolStatus = 'active' | 'pending' | 'closed';

export type RiskLevel = 'low' | 'medium' | 'high';

export type PositionStatus = 'earning' | 'locked' | 'pending-withdrawal';

export type LendingPurpose =
  | 'exhibition'
  | 'media'
  | 'corporate-display'
  | 'museum'
  | 'event';

export type LendingStatus = 'offered' | 'active' | 'completed' | 'cancelled';

export type RewardType = 'interest' | 'dividend' | 'bonus' | 'appreciation-share';

export interface YieldPool {
  id: string;
  name: string;
  type: PoolType;
  status: PoolStatus;
  totalValueLocked: number;
  apy: number;
  participants: number;
  riskLevel: RiskLevel;
  minLockPeriod: number; // days
  description: string;
  requirements: string[];
}

export interface YieldPosition {
  id: string;
  poolId: string;
  cardId: string;
  cardName: string;
  player: string;
  depositedValue: number;
  currentYield: number;
  accruedRewards: number;
  lockExpiry: string; // ISO date
  status: PositionStatus;
}

export interface YieldStrategy {
  id: string;
  name: string;
  description: string;
  pools: string[]; // pool ids
  expectedAPY: number;
  risk: RiskLevel;
  diversificationScore: number; // 0-100
  autoCompound: boolean;
  projectedReturns: {
    months3: number;
    months6: number;
    months12: number;
  };
}

export interface RewardDistribution {
  positionId: string;
  amount: number;
  source: string;
  date: string; // ISO date
  type: RewardType;
}

export interface YieldFarmMetrics {
  totalValueLocked: number;
  totalRewardsDistributed: number;
  avgAPY: number;
  topPool: string;
  participantCount: number;
  tvlHistory: { date: string; tvl: number }[];
}

export interface LendingOffer {
  id: string;
  cardId: string;
  borrower: string;
  purpose: LendingPurpose;
  duration: number; // days
  fee: number;
  insurance: number;
  status: LendingStatus;
}

export interface StakingTier {
  tier: string;
  minValue: number;
  lockDays: number;
  multiplier: number;
  bonusRewards: string[];
}

/* ------------------------------ Mock Data -------------------------------- */

const yieldPools: YieldPool[] = [
  {
    id: 'pool-exhibition-circuit',
    name: 'Exhibition Circuit',
    type: 'lending',
    status: 'active',
    totalValueLocked: 2_847_500,
    apy: 4.2,
    participants: 312,
    riskLevel: 'low',
    minLockPeriod: 30,
    description:
      'Lend your graded cards to touring sports memorabilia exhibitions across major cities. Cards are fully insured and displayed in climate-controlled cases.',
    requirements: [
      'PSA/BGS 8 or higher',
      'Card value $500+',
      'Proof of authentication',
      'Insurance enrollment required',
    ],
  },
  {
    id: 'pool-exhibition-premium',
    name: 'Premium Exhibition Tour',
    type: 'lending',
    status: 'active',
    totalValueLocked: 5_120_000,
    apy: 5.1,
    participants: 89,
    riskLevel: 'medium',
    minLockPeriod: 90,
    description:
      'Exclusive international exhibition circuit for high-value cards. Displayed at premier venues in New York, London, Tokyo, and Dubai.',
    requirements: [
      'PSA/BGS 9 or higher',
      'Card value $5,000+',
      'Full provenance documentation',
      'Premium insurance tier',
      'KYC verification completed',
    ],
  },
  {
    id: 'pool-media-licensing',
    name: 'Media Licensing Pool',
    type: 'licensing',
    status: 'active',
    totalValueLocked: 1_563_200,
    apy: 3.1,
    participants: 478,
    riskLevel: 'low',
    minLockPeriod: 14,
    description:
      'License high-resolution scans of your cards for use in documentaries, sports broadcasts, articles, and social media content. Royalties distributed monthly.',
    requirements: [
      'High-res scan on file',
      'Licensing agreement signed',
      'Card value $100+',
    ],
  },
  {
    id: 'pool-media-exclusive',
    name: 'Exclusive Content Rights',
    type: 'licensing',
    status: 'active',
    totalValueLocked: 890_400,
    apy: 3.8,
    participants: 124,
    riskLevel: 'medium',
    minLockPeriod: 60,
    description:
      'Grant exclusive digital content rights for rare card imagery. Used by ESPN, Bleacher Report, and premium sports media outlets.',
    requirements: [
      'Card value $2,000+',
      'Exclusive rights agreement',
      'Professional photography on file',
      'No competing licenses active',
    ],
  },
  {
    id: 'pool-corporate-display',
    name: 'Corporate Display Network',
    type: 'rental',
    status: 'active',
    totalValueLocked: 3_214_800,
    apy: 5.8,
    participants: 201,
    riskLevel: 'medium',
    minLockPeriod: 60,
    description:
      'Rent your cards to upscale restaurants, corporate offices, sports bars, and private clubs for curated display installations.',
    requirements: [
      'PSA/BGS graded',
      'Card value $1,000+',
      'Insurance enrollment required',
      'Quarterly condition inspections',
    ],
  },
  {
    id: 'pool-diamond-staking',
    name: 'Diamond Staking Vault',
    type: 'staking',
    status: 'active',
    totalValueLocked: 8_456_000,
    apy: 12.4,
    participants: 156,
    riskLevel: 'high',
    minLockPeriod: 180,
    description:
      'Lock high-value cards in the Diamond Vault to earn premium platform rewards. Higher tiers unlock exclusive access to pre-release cards and VIP events.',
    requirements: [
      'Card value $2,500+',
      'Platform account 6+ months',
      'Tier verification',
      'Lock-up agreement signed',
    ],
  },
  {
    id: 'pool-platinum-staking',
    name: 'Platinum Staking Pool',
    type: 'staking',
    status: 'active',
    totalValueLocked: 4_230_000,
    apy: 9.6,
    participants: 284,
    riskLevel: 'medium',
    minLockPeriod: 90,
    description:
      'Mid-tier staking pool offering solid returns and platform governance tokens. Unlock voting rights on new pool launches and fee structures.',
    requirements: [
      'Card value $500+',
      'Platform account 3+ months',
      'Identity verification',
    ],
  },
  {
    id: 'pool-insurance-premium',
    name: 'Insurance Premium Pool',
    type: 'insurance-pool',
    status: 'active',
    totalValueLocked: 1_980_600,
    apy: 2.2,
    participants: 532,
    riskLevel: 'low',
    minLockPeriod: 30,
    description:
      'Contribute card value to the shared insurance pool. Earn premium-sharing income while securing collective coverage against damage, loss, and theft.',
    requirements: [
      'Card value $250+',
      'Insurance agreement signed',
      'Annual condition report',
    ],
  },
];

const yieldPositions: YieldPosition[] = [
  {
    id: 'pos-001',
    poolId: 'pool-exhibition-circuit',
    cardId: 'card-jeter-rc',
    cardName: '1993 SP Foil Derek Jeter RC #279 PSA 10',
    player: 'Derek Jeter',
    depositedValue: 42_500,
    currentYield: 4.2,
    accruedRewards: 1_485,
    lockExpiry: '2026-05-15',
    status: 'earning',
  },
  {
    id: 'pos-002',
    poolId: 'pool-diamond-staking',
    cardId: 'card-jordan-fleer',
    cardName: '1986 Fleer Michael Jordan #57 BGS 9.5',
    player: 'Michael Jordan',
    depositedValue: 185_000,
    currentYield: 12.4,
    accruedRewards: 11_470,
    lockExpiry: '2026-09-01',
    status: 'locked',
  },
  {
    id: 'pos-003',
    poolId: 'pool-media-licensing',
    cardId: 'card-trout-update',
    cardName: '2011 Topps Update Mike Trout RC #US175 PSA 10',
    player: 'Mike Trout',
    depositedValue: 38_000,
    currentYield: 3.1,
    accruedRewards: 588,
    lockExpiry: '2026-04-01',
    status: 'earning',
  },
  {
    id: 'pos-004',
    poolId: 'pool-corporate-display',
    cardId: 'card-brady-contenders',
    cardName: '2000 Playoff Contenders Tom Brady Auto #144 PSA 9',
    player: 'Tom Brady',
    depositedValue: 295_000,
    currentYield: 5.8,
    accruedRewards: 8_555,
    lockExpiry: '2026-06-20',
    status: 'earning',
  },
  {
    id: 'pos-005',
    poolId: 'pool-platinum-staking',
    cardId: 'card-ohtani-bowman',
    cardName: '2018 Bowman Chrome Shohei Ohtani Auto PSA 10',
    player: 'Shohei Ohtani',
    depositedValue: 12_400,
    currentYield: 9.6,
    accruedRewards: 595,
    lockExpiry: '2026-06-15',
    status: 'locked',
  },
  {
    id: 'pos-006',
    poolId: 'pool-insurance-premium',
    cardId: 'card-mantle-52',
    cardName: '1952 Topps Mickey Mantle #311 PSA 5',
    player: 'Mickey Mantle',
    depositedValue: 425_000,
    currentYield: 2.2,
    accruedRewards: 4_675,
    lockExpiry: '2026-04-15',
    status: 'earning',
  },
  {
    id: 'pos-007',
    poolId: 'pool-exhibition-premium',
    cardId: 'card-lebron-topps',
    cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10',
    player: 'LeBron James',
    depositedValue: 72_000,
    currentYield: 5.1,
    accruedRewards: 3_060,
    lockExpiry: '2026-07-10',
    status: 'earning',
  },
  {
    id: 'pos-008',
    poolId: 'pool-diamond-staking',
    cardId: 'card-gretzky-opc',
    cardName: '1979 O-Pee-Chee Wayne Gretzky RC #18 PSA 8',
    player: 'Wayne Gretzky',
    depositedValue: 210_000,
    currentYield: 12.4,
    accruedRewards: 13_020,
    lockExpiry: '2026-10-01',
    status: 'locked',
  },
  {
    id: 'pos-009',
    poolId: 'pool-media-exclusive',
    cardId: 'card-mahomes-prizm',
    cardName: '2017 Prizm Patrick Mahomes RC #269 PSA 10',
    player: 'Patrick Mahomes',
    depositedValue: 28_500,
    currentYield: 3.8,
    accruedRewards: 722,
    lockExpiry: '2026-05-20',
    status: 'earning',
  },
  {
    id: 'pos-010',
    poolId: 'pool-corporate-display',
    cardId: 'card-ruth-goudey',
    cardName: '1933 Goudey Babe Ruth #53 PSA 4',
    player: 'Babe Ruth',
    depositedValue: 380_000,
    currentYield: 5.8,
    accruedRewards: 11_020,
    lockExpiry: '2026-08-01',
    status: 'earning',
  },
  {
    id: 'pos-011',
    poolId: 'pool-exhibition-circuit',
    cardId: 'card-griffey-upper',
    cardName: '1989 Upper Deck Ken Griffey Jr. RC #1 PSA 10',
    player: 'Ken Griffey Jr.',
    depositedValue: 8_200,
    currentYield: 4.2,
    accruedRewards: 287,
    lockExpiry: '2026-04-18',
    status: 'earning',
  },
  {
    id: 'pos-012',
    poolId: 'pool-platinum-staking',
    cardId: 'card-wemby-prizm',
    cardName: '2023 Prizm Victor Wembanyama RC #249 PSA 10',
    player: 'Victor Wembanyama',
    depositedValue: 4_800,
    currentYield: 9.6,
    accruedRewards: 192,
    lockExpiry: '2026-06-30',
    status: 'locked',
  },
  {
    id: 'pos-013',
    poolId: 'pool-insurance-premium',
    cardId: 'card-mays-topps',
    cardName: '1952 Topps Willie Mays #261 PSA 6',
    player: 'Willie Mays',
    depositedValue: 165_000,
    currentYield: 2.2,
    accruedRewards: 1_815,
    lockExpiry: '2026-04-22',
    status: 'earning',
  },
  {
    id: 'pos-014',
    poolId: 'pool-media-licensing',
    cardId: 'card-acuna-update',
    cardName: '2018 Topps Update Ronald Acuña Jr. RC #US250 PSA 10',
    player: 'Ronald Acuña Jr.',
    depositedValue: 3_200,
    currentYield: 3.1,
    accruedRewards: 66,
    lockExpiry: '2026-04-05',
    status: 'earning',
  },
  {
    id: 'pos-015',
    poolId: 'pool-diamond-staking',
    cardId: 'card-luka-prizm',
    cardName: '2018 Prizm Luka Dončić RC #280 PSA 10',
    player: 'Luka Dončić',
    depositedValue: 7_500,
    currentYield: 12.4,
    accruedRewards: 465,
    lockExpiry: '2026-09-15',
    status: 'locked',
  },
  {
    id: 'pos-016',
    poolId: 'pool-corporate-display',
    cardId: 'card-messi-topps',
    cardName: '2004 Panini Mega Cracks Lionel Messi RC #71 BGS 9',
    player: 'Lionel Messi',
    depositedValue: 52_000,
    currentYield: 5.8,
    accruedRewards: 1_508,
    lockExpiry: '2026-06-01',
    status: 'earning',
  },
  {
    id: 'pos-017',
    poolId: 'pool-exhibition-circuit',
    cardId: 'card-aaron-topps',
    cardName: '1954 Topps Hank Aaron RC #128 PSA 7',
    player: 'Hank Aaron',
    depositedValue: 68_000,
    currentYield: 4.2,
    accruedRewards: 2_380,
    lockExpiry: '2026-05-01',
    status: 'earning',
  },
  {
    id: 'pos-018',
    poolId: 'pool-media-exclusive',
    cardId: 'card-caitlin-prizm',
    cardName: '2024 Prizm Caitlin Clark RC #301 PSA 10',
    player: 'Caitlin Clark',
    depositedValue: 1_850,
    currentYield: 3.8,
    accruedRewards: 35,
    lockExpiry: '2026-05-25',
    status: 'earning',
  },
  {
    id: 'pos-019',
    poolId: 'pool-platinum-staking',
    cardId: 'card-judge-bowman',
    cardName: '2013 Bowman Chrome Aaron Judge RC Auto PSA 10',
    player: 'Aaron Judge',
    depositedValue: 15_600,
    currentYield: 9.6,
    accruedRewards: 624,
    lockExpiry: '2026-06-10',
    status: 'locked',
  },
  {
    id: 'pos-020',
    poolId: 'pool-insurance-premium',
    cardId: 'card-wagner-t206',
    cardName: 'T206 Honus Wagner SGC 1',
    player: 'Honus Wagner',
    depositedValue: 3_200_000,
    currentYield: 2.2,
    accruedRewards: 35_200,
    lockExpiry: '2026-04-30',
    status: 'earning',
  },
  {
    id: 'pos-021',
    poolId: 'pool-exhibition-premium',
    cardId: 'card-kobe-topps',
    cardName: '1996 Topps Chrome Kobe Bryant RC #138 PSA 10',
    player: 'Kobe Bryant',
    depositedValue: 95_000,
    currentYield: 5.1,
    accruedRewards: 4_035,
    lockExpiry: '2026-08-15',
    status: 'earning',
  },
  {
    id: 'pos-022',
    poolId: 'pool-corporate-display',
    cardId: 'card-curry-prizm',
    cardName: '2009 Panini Prizm Stephen Curry RC #1 PSA 10',
    player: 'Stephen Curry',
    depositedValue: 18_200,
    currentYield: 5.8,
    accruedRewards: 528,
    lockExpiry: '2026-07-01',
    status: 'earning',
  },
];

const rewardHistory: RewardDistribution[] = [
  { positionId: 'pos-001', amount: 148.75, source: 'Exhibition Circuit', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-001', amount: 148.75, source: 'Exhibition Circuit', date: '2026-02-01', type: 'interest' },
  { positionId: 'pos-001', amount: 212.50, source: 'Exhibition Circuit - Holiday Bonus', date: '2025-12-15', type: 'bonus' },
  { positionId: 'pos-002', amount: 1_912.50, source: 'Diamond Staking Vault', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-002', amount: 1_912.50, source: 'Diamond Staking Vault', date: '2026-02-01', type: 'interest' },
  { positionId: 'pos-002', amount: 925.00, source: 'Diamond Vault - Q4 Appreciation', date: '2025-12-31', type: 'appreciation-share' },
  { positionId: 'pos-003', amount: 98.17, source: 'Media Licensing Pool', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-003', amount: 98.17, source: 'Media Licensing Pool', date: '2026-02-01', type: 'interest' },
  { positionId: 'pos-004', amount: 1_425.83, source: 'Corporate Display Network', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-004', amount: 1_425.83, source: 'Corporate Display Network', date: '2026-02-01', type: 'interest' },
  { positionId: 'pos-004', amount: 590.00, source: 'Corporate Display - Super Bowl Event', date: '2026-02-08', type: 'bonus' },
  { positionId: 'pos-005', amount: 99.20, source: 'Platinum Staking Pool', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-006', amount: 779.17, source: 'Insurance Premium Pool', date: '2026-03-01', type: 'dividend' },
  { positionId: 'pos-006', amount: 779.17, source: 'Insurance Premium Pool', date: '2026-02-01', type: 'dividend' },
  { positionId: 'pos-007', amount: 306.00, source: 'Premium Exhibition Tour', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-008', amount: 2_170.00, source: 'Diamond Staking Vault', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-008', amount: 2_170.00, source: 'Diamond Staking Vault', date: '2026-02-01', type: 'interest' },
  { positionId: 'pos-009', amount: 90.25, source: 'Exclusive Content Rights', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-010', amount: 1_836.67, source: 'Corporate Display Network', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-010', amount: 1_836.67, source: 'Corporate Display Network', date: '2026-02-01', type: 'interest' },
  { positionId: 'pos-011', amount: 28.70, source: 'Exhibition Circuit', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-012', amount: 38.40, source: 'Platinum Staking Pool', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-013', amount: 302.50, source: 'Insurance Premium Pool', date: '2026-03-01', type: 'dividend' },
  { positionId: 'pos-014', amount: 8.27, source: 'Media Licensing Pool', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-015', amount: 77.50, source: 'Diamond Staking Vault', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-016', amount: 251.33, source: 'Corporate Display Network', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-017', amount: 238.00, source: 'Exhibition Circuit', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-018', amount: 5.86, source: 'Exclusive Content Rights', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-019', amount: 124.80, source: 'Platinum Staking Pool', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-020', amount: 5_866.67, source: 'Insurance Premium Pool', date: '2026-03-01', type: 'dividend' },
  { positionId: 'pos-020', amount: 5_866.67, source: 'Insurance Premium Pool', date: '2026-02-01', type: 'dividend' },
  { positionId: 'pos-020', amount: 3_200.00, source: 'Insurance Pool - Annual Surplus', date: '2025-12-31', type: 'bonus' },
  { positionId: 'pos-021', amount: 403.75, source: 'Premium Exhibition Tour', date: '2026-03-01', type: 'interest' },
  { positionId: 'pos-022', amount: 88.03, source: 'Corporate Display Network', date: '2026-03-01', type: 'interest' },
];

const lendingOffers: LendingOffer[] = [
  {
    id: 'lend-001',
    cardId: 'card-jeter-rc',
    borrower: 'National Baseball Hall of Fame',
    purpose: 'museum',
    duration: 180,
    fee: 3_400,
    insurance: 50_000,
    status: 'active',
  },
  {
    id: 'lend-002',
    cardId: 'card-lebron-topps',
    borrower: 'ESPN "Greatest Cards" Documentary',
    purpose: 'media',
    duration: 30,
    fee: 1_800,
    insurance: 80_000,
    status: 'offered',
  },
  {
    id: 'lend-003',
    cardId: 'card-brady-contenders',
    borrower: 'JP Morgan Chase - Executive Lounge',
    purpose: 'corporate-display',
    duration: 90,
    fee: 4_200,
    insurance: 300_000,
    status: 'active',
  },
  {
    id: 'lend-004',
    cardId: 'card-kobe-topps',
    borrower: 'National Sports Collectors Convention',
    purpose: 'exhibition',
    duration: 7,
    fee: 950,
    insurance: 100_000,
    status: 'offered',
  },
  {
    id: 'lend-005',
    cardId: 'card-mantle-52',
    borrower: 'Smithsonian American History Museum',
    purpose: 'museum',
    duration: 365,
    fee: 18_500,
    insurance: 500_000,
    status: 'active',
  },
];

const stakingTiers: StakingTier[] = [
  {
    tier: 'Bronze',
    minValue: 500,
    lockDays: 30,
    multiplier: 1.0,
    bonusRewards: ['Monthly platform credits', 'Basic analytics access'],
  },
  {
    tier: 'Silver',
    minValue: 2_500,
    lockDays: 90,
    multiplier: 1.5,
    bonusRewards: [
      'Priority marketplace listing',
      'Advanced analytics suite',
      'Early access to new pools',
    ],
  },
  {
    tier: 'Gold',
    minValue: 10_000,
    lockDays: 180,
    multiplier: 2.0,
    bonusRewards: [
      'VIP event invitations',
      'Governance voting rights',
      'Fee discounts (25%)',
      'Pre-release card access',
    ],
  },
  {
    tier: 'Diamond',
    minValue: 50_000,
    lockDays: 365,
    multiplier: 3.0,
    bonusRewards: [
      'Private concierge service',
      'Zero platform fees',
      'Exclusive card drops',
      'Annual collector summit invite',
      'Portfolio insurance discount (50%)',
    ],
  },
];

const tvlHistory: { date: string; tvl: number }[] = [
  { date: '2025-04-01', tvl: 8_200_000 },
  { date: '2025-05-01', tvl: 9_450_000 },
  { date: '2025-06-01', tvl: 11_300_000 },
  { date: '2025-07-01', tvl: 13_100_000 },
  { date: '2025-08-01', tvl: 14_800_000 },
  { date: '2025-09-01', tvl: 16_200_000 },
  { date: '2025-10-01', tvl: 18_600_000 },
  { date: '2025-11-01', tvl: 20_450_000 },
  { date: '2025-12-01', tvl: 22_100_000 },
  { date: '2026-01-01', tvl: 24_800_000 },
  { date: '2026-02-01', tvl: 26_500_000 },
  { date: '2026-03-01', tvl: 28_302_500 },
];

const yieldStrategies: YieldStrategy[] = [
  {
    id: 'strat-conservative',
    name: 'Conservative Yield',
    description:
      'Low-risk strategy focusing on insurance pools and media licensing for steady, predictable returns with minimal lock-up requirements.',
    pools: ['pool-insurance-premium', 'pool-media-licensing'],
    expectedAPY: 2.65,
    risk: 'low',
    diversificationScore: 72,
    autoCompound: true,
    projectedReturns: { months3: 0.66, months6: 1.33, months12: 2.65 },
  },
  {
    id: 'strat-balanced',
    name: 'Balanced Growth',
    description:
      'Diversified approach across lending, licensing, and rental pools to balance income with moderate growth potential.',
    pools: ['pool-exhibition-circuit', 'pool-media-licensing', 'pool-corporate-display', 'pool-insurance-premium'],
    expectedAPY: 4.08,
    risk: 'medium',
    diversificationScore: 91,
    autoCompound: true,
    projectedReturns: { months3: 1.02, months6: 2.04, months12: 4.08 },
  },
  {
    id: 'strat-aggressive',
    name: 'Maximum Yield',
    description:
      'High-return strategy concentrating on staking vaults and premium exhibitions. Requires longer lock periods but delivers the highest APY.',
    pools: ['pool-diamond-staking', 'pool-exhibition-premium', 'pool-corporate-display'],
    expectedAPY: 7.77,
    risk: 'high',
    diversificationScore: 58,
    autoCompound: false,
    projectedReturns: { months3: 1.94, months6: 3.89, months12: 7.77 },
  },
  {
    id: 'strat-staking-ladder',
    name: 'Staking Ladder',
    description:
      'Staged staking across Platinum and Diamond vaults with staggered lock-up dates for rolling liquidity access.',
    pools: ['pool-platinum-staking', 'pool-diamond-staking'],
    expectedAPY: 11.0,
    risk: 'high',
    diversificationScore: 35,
    autoCompound: true,
    projectedReturns: { months3: 2.75, months6: 5.50, months12: 11.0 },
  },
  {
    id: 'strat-income-focus',
    name: 'Passive Income',
    description:
      'Designed for collectors seeking regular monthly payouts through lending and rental pools with shorter lock periods.',
    pools: ['pool-exhibition-circuit', 'pool-corporate-display'],
    expectedAPY: 5.0,
    risk: 'medium',
    diversificationScore: 64,
    autoCompound: false,
    projectedReturns: { months3: 1.25, months6: 2.50, months12: 5.0 },
  },
];

/* ------------------------------ Helpers ---------------------------------- */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ----------------------------- Public API -------------------------------- */

export async function getYieldPools(): Promise<YieldPool[]> {
  await delay(320);
  return yieldPools;
}

export async function getPoolDetail(id: string): Promise<YieldPool | undefined> {
  await delay(180);
  return yieldPools.find((p) => p.id === id);
}

export async function getYieldPositions(_userId?: string): Promise<YieldPosition[]> {
  await delay(350);
  return yieldPositions;
}

export async function getYieldStrategies(): Promise<YieldStrategy[]> {
  await delay(280);
  return yieldStrategies;
}

export async function getRewardHistory(
  positionId?: string,
): Promise<RewardDistribution[]> {
  await delay(250);
  if (positionId) {
    return rewardHistory.filter((r) => r.positionId === positionId);
  }
  return rewardHistory;
}

export async function getFarmMetrics(): Promise<YieldFarmMetrics> {
  await delay(300);
  const totalValueLocked = yieldPools.reduce((s, p) => s + p.totalValueLocked, 0);
  const totalRewardsDistributed = rewardHistory.reduce((s, r) => s + r.amount, 0);
  const avgAPY =
    yieldPools.reduce((s, p) => s + p.apy, 0) / yieldPools.length;

  return {
    totalValueLocked,
    totalRewardsDistributed,
    avgAPY: Math.round(avgAPY * 100) / 100,
    topPool: 'Diamond Staking Vault',
    participantCount: new Set(yieldPools.flatMap((p) => Array(p.participants).fill(0))).size
      ? yieldPools.reduce((s, p) => s + p.participants, 0)
      : 0,
    tvlHistory,
  };
}

export async function getLendingOffers(
  cardId?: string,
): Promise<LendingOffer[]> {
  await delay(220);
  if (cardId) {
    return lendingOffers.filter((o) => o.cardId === cardId);
  }
  return lendingOffers;
}

export async function getStakingTiers(): Promise<StakingTier[]> {
  await delay(150);
  return stakingTiers;
}

export async function calculateProjectedYield(
  cardIds: string[],
  poolId: string,
  months: number,
): Promise<{
  totalDeposited: number;
  projectedReward: number;
  apy: number;
  monthlyBreakdown: { month: number; cumulative: number }[];
}> {
  await delay(400);

  const pool = yieldPools.find((p) => p.id === poolId);
  if (!pool) {
    return { totalDeposited: 0, projectedReward: 0, apy: 0, monthlyBreakdown: [] };
  }

  // Simulate deposited value from matching positions or a default
  const matchingPositions = yieldPositions.filter((p) =>
    cardIds.includes(p.cardId),
  );
  const totalDeposited =
    matchingPositions.length > 0
      ? matchingPositions.reduce((s, p) => s + p.depositedValue, 0)
      : cardIds.length * 5_000; // default estimate

  const monthlyRate = pool.apy / 100 / 12;
  const monthlyBreakdown: { month: number; cumulative: number }[] = [];
  let cumulative = 0;

  for (let m = 1; m <= months; m++) {
    cumulative += totalDeposited * monthlyRate;
    monthlyBreakdown.push({
      month: m,
      cumulative: Math.round(cumulative * 100) / 100,
    });
  }

  return {
    totalDeposited,
    projectedReward: Math.round(cumulative * 100) / 100,
    apy: pool.apy,
    monthlyBreakdown,
  };
}

export async function getOptimalYieldStrategy(
  cardIds: string[],
): Promise<{
  recommended: YieldStrategy;
  alternativeStrategies: YieldStrategy[];
  reasoning: string;
}> {
  await delay(500);

  const matchingPositions = yieldPositions.filter((p) =>
    cardIds.includes(p.cardId),
  );
  const totalValue = matchingPositions.reduce(
    (s, p) => s + p.depositedValue,
    0,
  );

  let recommended: YieldStrategy;
  let reasoning: string;

  if (totalValue > 100_000) {
    recommended = yieldStrategies.find((s) => s.id === 'strat-balanced')!;
    reasoning =
      'With a high-value portfolio, the Balanced Growth strategy provides optimal risk-adjusted returns across multiple pool types, ensuring diversification while capturing above-average yields.';
  } else if (totalValue > 25_000) {
    recommended = yieldStrategies.find((s) => s.id === 'strat-income-focus')!;
    reasoning =
      'Your mid-range portfolio is well-suited for the Passive Income strategy, generating regular monthly payouts through exhibition lending and corporate display rentals.';
  } else {
    recommended = yieldStrategies.find((s) => s.id === 'strat-conservative')!;
    reasoning =
      'For your portfolio size, the Conservative Yield strategy minimizes risk while building steady returns through insurance pools and media licensing.';
  }

  const alternativeStrategies = yieldStrategies.filter(
    (s) => s.id !== recommended.id,
  );

  return { recommended, alternativeStrategies, reasoning };
}
