// ─── Phase 121: Fund & Syndicate Manager Service ────────────────────────────

// ─── Types ──────────────────────────────────────────────────────────────────

export type FundStatus = 'fundraising' | 'investing' | 'harvesting' | 'closed';
export type SyndicateStatus = 'open' | 'funded' | 'active' | 'exited';
export type DocumentType = 'ppm' | 'lpa' | 'subscription' | 'k1' | 'quarterly_report' | 'capital_call_notice' | 'distribution_notice';

export interface GPManager {
  id: string;
  name: string;
  firm: string;
  trackRecord: number; // years
  totalAUM: number;
  fundsManaged: number;
  carryPercentage: number;
  managementFee: number; // annual %
  bio: string;
}

export interface LPInvestor {
  id: string;
  name: string;
  type: 'individual' | 'family_office' | 'institution' | 'endowment' | 'fund_of_funds';
  commitment: number;
  calledCapital: number;
  distributions: number;
  netIRR: number;
  joinedDate: string;
  tier: 'anchor' | 'strategic' | 'standard';
}

export interface FundPosition {
  id: string;
  fundId: string;
  assetName: string;
  sport: string;
  player: string;
  acquisitionDate: string;
  acquisitionCost: number;
  currentValue: number;
  multiple: number;
  status: 'held' | 'partially_sold' | 'exited';
  percentOfFund: number;
}

export interface WaterfallDistribution {
  tier: string;
  description: string;
  amount: number;
  lpShare: number;
  gpShare: number;
  cumulativeDistributed: number;
  hurdleRate?: number;
  carryRate?: number;
}

export interface FundMetrics {
  fundId: string;
  nav: number;
  irr: number;
  moic: number;
  dpi: number;
  tvpi: number;
  rvpi: number;
  paidInCapital: number;
  totalCommitment: number;
  percentCalled: number;
  totalDistributions: number;
  unrealizedValue: number;
  managementFees: number;
  carry: number;
  netToLP: number;
  vintageYear: number;
  inceptionDate: string;
  asOfDate: string;
}

export interface CapitalCall {
  id: string;
  fundId: string;
  callNumber: number;
  callDate: string;
  dueDate: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'partial' | 'complete';
  percentOfCommitment: number;
  cumulativeCalled: number;
}

export interface Distribution {
  id: string;
  fundId: string;
  distributionNumber: number;
  distributionDate: string;
  amount: number;
  type: 'return_of_capital' | 'profit' | 'recallable';
  source: string;
  lpAmount: number;
  gpAmount: number;
}

export interface FundDocument {
  id: string;
  fundId: string;
  type: DocumentType;
  name: string;
  dateGenerated: string;
  status: 'draft' | 'final' | 'signed';
  size: string;
  description: string;
}

export interface Fund {
  id: string;
  name: string;
  strategy: string;
  targetSize: number;
  currentSize: number;
  status: FundStatus;
  gpManager: GPManager;
  lpCount: number;
  vintage: number;
  geographicFocus: string;
  sportFocus: string[];
  termYears: number;
  investmentPeriodYears: number;
  hurdleRate: number;
  carryPercentage: number;
  managementFee: number;
  description: string;
}

export interface Syndicate {
  id: string;
  name: string;
  leadInvestor: string;
  targetRaise: number;
  currentRaise: number;
  memberCount: number;
  status: SyndicateStatus;
  targetAsset: string;
  sport: string;
  minInvestment: number;
  expectedReturn: number;
  exitTimeline: string;
  createdDate: string;
  description: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const GP_MANAGERS: GPManager[] = [
  {
    id: 'gp-1',
    name: 'Marcus Sterling',
    firm: 'Sterling Sports Capital',
    trackRecord: 14,
    totalAUM: 285_000_000,
    fundsManaged: 4,
    carryPercentage: 20,
    managementFee: 2.0,
    bio: 'Former Goldman Sachs VP turned sports collectibles fund manager. Pioneer of institutional-grade alt-asset fund structures for premium sports memorabilia.',
  },
  {
    id: 'gp-2',
    name: 'Victoria Chen',
    firm: 'Apex Collectibles Partners',
    trackRecord: 9,
    totalAUM: 142_000_000,
    fundsManaged: 2,
    carryPercentage: 20,
    managementFee: 1.75,
    bio: 'Data-driven portfolio manager specializing in modern-era graded card strategies with proprietary valuation models.',
  },
  {
    id: 'gp-3',
    name: 'David Thornton',
    firm: 'Heritage Capital Group',
    trackRecord: 22,
    totalAUM: 410_000_000,
    fundsManaged: 6,
    carryPercentage: 18,
    managementFee: 1.5,
    bio: 'Seasoned collectibles investor with deep auction house relationships and expertise in vintage and pre-war assets.',
  },
];

const LP_INVESTORS: LPInvestor[] = [
  { id: 'lp-1', name: 'Pinnacle Family Office', type: 'family_office', commitment: 25_000_000, calledCapital: 18_750_000, distributions: 8_200_000, netIRR: 18.4, joinedDate: '2022-03-15', tier: 'anchor' },
  { id: 'lp-2', name: 'Westfield Endowment', type: 'endowment', commitment: 15_000_000, calledCapital: 11_250_000, distributions: 4_100_000, netIRR: 16.2, joinedDate: '2022-04-01', tier: 'anchor' },
  { id: 'lp-3', name: 'Blue Harbor Ventures', type: 'fund_of_funds', commitment: 10_000_000, calledCapital: 7_500_000, distributions: 2_900_000, netIRR: 15.8, joinedDate: '2022-05-10', tier: 'strategic' },
  { id: 'lp-4', name: 'Robert J. Kessler', type: 'individual', commitment: 5_000_000, calledCapital: 3_750_000, distributions: 1_650_000, netIRR: 19.1, joinedDate: '2022-03-15', tier: 'strategic' },
  { id: 'lp-5', name: 'Atlas Institutional Partners', type: 'institution', commitment: 20_000_000, calledCapital: 15_000_000, distributions: 6_400_000, netIRR: 17.5, joinedDate: '2022-06-01', tier: 'anchor' },
  { id: 'lp-6', name: 'Meridian Capital Trust', type: 'family_office', commitment: 8_000_000, calledCapital: 6_000_000, distributions: 2_100_000, netIRR: 14.9, joinedDate: '2023-01-15', tier: 'standard' },
  { id: 'lp-7', name: 'Dr. Sarah Whitfield', type: 'individual', commitment: 2_500_000, calledCapital: 1_875_000, distributions: 780_000, netIRR: 16.7, joinedDate: '2023-02-20', tier: 'standard' },
  { id: 'lp-8', name: 'Pacific Rim Holdings', type: 'institution', commitment: 12_000_000, calledCapital: 9_000_000, distributions: 3_600_000, netIRR: 15.3, joinedDate: '2022-07-01', tier: 'strategic' },
  { id: 'lp-9', name: 'Northstar Foundation', type: 'endowment', commitment: 6_000_000, calledCapital: 4_500_000, distributions: 1_850_000, netIRR: 17.0, joinedDate: '2023-04-10', tier: 'standard' },
  { id: 'lp-10', name: 'Titan Wealth Advisors', type: 'fund_of_funds', commitment: 18_000_000, calledCapital: 13_500_000, distributions: 5_800_000, netIRR: 16.8, joinedDate: '2022-08-15', tier: 'anchor' },
];

const FUNDS: Fund[] = [
  {
    id: 'fund-1',
    name: 'Sterling Sports Alpha Fund I',
    strategy: 'Premium vintage cards (pre-1980) with grading arbitrage overlay',
    targetSize: 100_000_000,
    currentSize: 97_500_000,
    status: 'investing',
    gpManager: GP_MANAGERS[0],
    lpCount: 12,
    vintage: 2022,
    geographicFocus: 'North America',
    sportFocus: ['Baseball', 'Basketball', 'Football'],
    termYears: 8,
    investmentPeriodYears: 4,
    hurdleRate: 8,
    carryPercentage: 20,
    managementFee: 2.0,
    description: 'Flagship fund targeting high-grade vintage sports cards with strong provenance. Leverages proprietary grading analytics to identify undervalued assets.',
  },
  {
    id: 'fund-2',
    name: 'Apex Modern Icons Fund',
    strategy: 'Modern era (2015+) rookie cards of star athletes with upside potential',
    targetSize: 50_000_000,
    currentSize: 42_000_000,
    status: 'fundraising',
    gpManager: GP_MANAGERS[1],
    lpCount: 8,
    vintage: 2024,
    geographicFocus: 'Global',
    sportFocus: ['Basketball', 'Football', 'Soccer'],
    termYears: 6,
    investmentPeriodYears: 3,
    hurdleRate: 10,
    carryPercentage: 20,
    managementFee: 1.75,
    description: 'Growth-oriented fund focused on modern rookie cards of emerging superstars. Utilizes AI-driven player performance models to optimize entry points.',
  },
  {
    id: 'fund-3',
    name: 'Heritage Legacy Collection Fund III',
    strategy: 'Museum-quality pre-war and golden age cards with institutional-grade custody',
    targetSize: 200_000_000,
    currentSize: 195_000_000,
    status: 'harvesting',
    gpManager: GP_MANAGERS[2],
    lpCount: 18,
    vintage: 2020,
    geographicFocus: 'North America',
    sportFocus: ['Baseball', 'Boxing', 'Football'],
    termYears: 10,
    investmentPeriodYears: 5,
    hurdleRate: 7,
    carryPercentage: 18,
    managementFee: 1.5,
    description: 'Flagship heritage fund holding T206, Goudey, and other iconic pre-war issues. Approaching harvest phase with multiple record-breaking exit opportunities.',
  },
];

const SYNDICATES: Syndicate[] = [
  {
    id: 'syn-1',
    name: '1952 Topps Mantle PSA 9 Syndicate',
    leadInvestor: 'Marcus Sterling',
    targetRaise: 12_500_000,
    currentRaise: 11_200_000,
    memberCount: 6,
    status: 'funded',
    targetAsset: '1952 Topps #311 Mickey Mantle PSA 9',
    sport: 'Baseball',
    minInvestment: 500_000,
    expectedReturn: 35,
    exitTimeline: '3-5 years',
    createdDate: '2025-06-15',
    description: 'Syndicate targeting the acquisition of one of 3 known PSA 9 examples of the iconic 1952 Topps Mantle.',
  },
  {
    id: 'syn-2',
    name: 'Luka Doncic Rookie Portfolio',
    leadInvestor: 'Victoria Chen',
    targetRaise: 3_000_000,
    currentRaise: 2_400_000,
    memberCount: 10,
    status: 'active',
    targetAsset: 'Diversified Luka Doncic RC Portfolio (Prizm, National Treasures, Optic)',
    sport: 'Basketball',
    minInvestment: 100_000,
    expectedReturn: 22,
    exitTimeline: '2-4 years',
    createdDate: '2025-09-01',
    description: 'Concentrated portfolio of high-grade Luka Doncic rookies with championship upside catalyst.',
  },
  {
    id: 'syn-3',
    name: 'Pre-War Baseball Blue Chips',
    leadInvestor: 'David Thornton',
    targetRaise: 25_000_000,
    currentRaise: 8_500_000,
    memberCount: 4,
    status: 'open',
    targetAsset: 'Portfolio of T206, Play Ball, and Goudey high-grade examples',
    sport: 'Baseball',
    minInvestment: 1_000_000,
    expectedReturn: 18,
    exitTimeline: '5-7 years',
    createdDate: '2026-01-10',
    description: 'Institutional-grade syndicate assembling a museum-quality pre-war collection with 100+ year proven appreciation.',
  },
  {
    id: 'syn-4',
    name: 'Soccer Emerging Stars',
    leadInvestor: 'Victoria Chen',
    targetRaise: 5_000_000,
    currentRaise: 5_000_000,
    memberCount: 14,
    status: 'active',
    targetAsset: 'Top graded rookies: Bellingham, Yamal, Endrick',
    sport: 'Soccer',
    minInvestment: 50_000,
    expectedReturn: 28,
    exitTimeline: '2-3 years',
    createdDate: '2025-11-05',
    description: 'High-conviction bet on the next generation of soccer superstars with World Cup 2026 catalyst.',
  },
];

const FUND_POSITIONS: FundPosition[] = [
  { id: 'pos-1', fundId: 'fund-1', assetName: '1986 Fleer #57 Michael Jordan PSA 10', sport: 'Basketball', player: 'Michael Jordan', acquisitionDate: '2022-08-15', acquisitionCost: 450_000, currentValue: 680_000, multiple: 1.51, status: 'held', percentOfFund: 0.48 },
  { id: 'pos-2', fundId: 'fund-1', assetName: '1952 Topps #261 Willie Mays PSA 8', sport: 'Baseball', player: 'Willie Mays', acquisitionDate: '2022-10-01', acquisitionCost: 320_000, currentValue: 475_000, multiple: 1.48, status: 'held', percentOfFund: 0.34 },
  { id: 'pos-3', fundId: 'fund-1', assetName: '1979 O-Pee-Chee #18 Wayne Gretzky PSA 10', sport: 'Hockey', player: 'Wayne Gretzky', acquisitionDate: '2023-01-20', acquisitionCost: 1_200_000, currentValue: 1_850_000, multiple: 1.54, status: 'held', percentOfFund: 1.32 },
  { id: 'pos-4', fundId: 'fund-1', assetName: '1965 Topps #122 Joe Namath RC PSA 9', sport: 'Football', player: 'Joe Namath', acquisitionDate: '2023-03-10', acquisitionCost: 85_000, currentValue: 112_000, multiple: 1.32, status: 'held', percentOfFund: 0.08 },
  { id: 'pos-5', fundId: 'fund-3', assetName: '1909 T206 Honus Wagner SGC 3', sport: 'Baseball', player: 'Honus Wagner', acquisitionDate: '2020-09-15', acquisitionCost: 4_200_000, currentValue: 7_250_000, multiple: 1.73, status: 'held', percentOfFund: 2.85 },
  { id: 'pos-6', fundId: 'fund-3', assetName: '1933 Goudey #53 Babe Ruth PSA 7', sport: 'Baseball', player: 'Babe Ruth', acquisitionDate: '2020-11-01', acquisitionCost: 680_000, currentValue: 1_020_000, multiple: 1.50, status: 'held', percentOfFund: 0.40 },
  { id: 'pos-7', fundId: 'fund-3', assetName: '1939 Play Ball #92 Ted Williams RC PSA 8', sport: 'Baseball', player: 'Ted Williams', acquisitionDate: '2021-02-20', acquisitionCost: 520_000, currentValue: 810_000, multiple: 1.56, status: 'partially_sold', percentOfFund: 0.32 },
  { id: 'pos-8', fundId: 'fund-2', assetName: '2018 Panini Prizm #280 Luka Doncic RC PSA 10', sport: 'Basketball', player: 'Luka Doncic', acquisitionDate: '2024-06-01', acquisitionCost: 8_500, currentValue: 12_200, multiple: 1.44, status: 'held', percentOfFund: 0.02 },
  { id: 'pos-9', fundId: 'fund-2', assetName: '2020 Panini National Treasures #130 Justin Herbert /99 BGS 9.5', sport: 'Football', player: 'Justin Herbert', acquisitionDate: '2024-07-15', acquisitionCost: 14_000, currentValue: 18_500, multiple: 1.32, status: 'held', percentOfFund: 0.03 },
  { id: 'pos-10', fundId: 'fund-1', assetName: '1969 Topps #260 Reggie Jackson RC PSA 9', sport: 'Baseball', player: 'Reggie Jackson', acquisitionDate: '2023-06-01', acquisitionCost: 42_000, currentValue: 38_500, multiple: 0.92, status: 'exited', percentOfFund: 0.0 },
];

const FUND_METRICS: FundMetrics[] = [
  {
    fundId: 'fund-1',
    nav: 141_200_000,
    irr: 18.7,
    moic: 1.52,
    dpi: 0.35,
    tvpi: 1.52,
    rvpi: 1.17,
    paidInCapital: 73_125_000,
    totalCommitment: 97_500_000,
    percentCalled: 75,
    totalDistributions: 25_593_750,
    unrealizedValue: 85_659_000,
    managementFees: 3_900_000,
    carry: 4_280_000,
    netToLP: 107_013_750,
    vintageYear: 2022,
    inceptionDate: '2022-03-01',
    asOfDate: '2026-03-01',
  },
  {
    fundId: 'fund-2',
    nav: 48_300_000,
    irr: 12.4,
    moic: 1.21,
    dpi: 0.0,
    tvpi: 1.21,
    rvpi: 1.21,
    paidInCapital: 21_000_000,
    totalCommitment: 42_000_000,
    percentCalled: 50,
    totalDistributions: 0,
    unrealizedValue: 25_410_000,
    managementFees: 1_470_000,
    carry: 0,
    netToLP: 23_940_000,
    vintageYear: 2024,
    inceptionDate: '2024-04-01',
    asOfDate: '2026-03-01',
  },
  {
    fundId: 'fund-3',
    nav: 354_900_000,
    irr: 22.1,
    moic: 1.88,
    dpi: 0.62,
    tvpi: 1.88,
    rvpi: 1.26,
    paidInCapital: 175_500_000,
    totalCommitment: 195_000_000,
    percentCalled: 90,
    totalDistributions: 108_810_000,
    unrealizedValue: 220_578_000,
    managementFees: 8_775_000,
    carry: 16_737_000,
    netToLP: 303_651_000,
    vintageYear: 2020,
    inceptionDate: '2020-01-15',
    asOfDate: '2026-03-01',
  },
];

const CAPITAL_CALLS: CapitalCall[] = [
  { id: 'cc-1', fundId: 'fund-1', callNumber: 1, callDate: '2022-04-01', dueDate: '2022-04-15', amount: 24_375_000, purpose: 'Initial fund deployment - vintage baseball acquisitions', status: 'complete', percentOfCommitment: 25, cumulativeCalled: 25 },
  { id: 'cc-2', fundId: 'fund-1', callNumber: 2, callDate: '2022-09-15', dueDate: '2022-10-01', amount: 24_375_000, purpose: 'Second tranche - basketball and football positions', status: 'complete', percentOfCommitment: 25, cumulativeCalled: 50 },
  { id: 'cc-3', fundId: 'fund-1', callNumber: 3, callDate: '2023-06-01', dueDate: '2023-06-15', amount: 24_375_000, purpose: 'Third tranche - opportunistic acquisitions', status: 'complete', percentOfCommitment: 25, cumulativeCalled: 75 },
  { id: 'cc-4', fundId: 'fund-1', callNumber: 4, callDate: '2026-06-01', dueDate: '2026-06-15', amount: 24_375_000, purpose: 'Final tranche - reserve and follow-on investments', status: 'pending', percentOfCommitment: 25, cumulativeCalled: 100 },
  { id: 'cc-5', fundId: 'fund-2', callNumber: 1, callDate: '2024-05-01', dueDate: '2024-05-15', amount: 21_000_000, purpose: 'Initial deployment - modern rookies portfolio construction', status: 'complete', percentOfCommitment: 50, cumulativeCalled: 50 },
  { id: 'cc-6', fundId: 'fund-3', callNumber: 1, callDate: '2020-02-15', dueDate: '2020-03-01', amount: 58_500_000, purpose: 'Initial deployment - T206 and pre-war acquisitions', status: 'complete', percentOfCommitment: 30, cumulativeCalled: 30 },
  { id: 'cc-7', fundId: 'fund-3', callNumber: 2, callDate: '2020-08-01', dueDate: '2020-08-15', amount: 58_500_000, purpose: 'Second tranche - golden age expansion', status: 'complete', percentOfCommitment: 30, cumulativeCalled: 60 },
  { id: 'cc-8', fundId: 'fund-3', callNumber: 3, callDate: '2021-06-01', dueDate: '2021-06-15', amount: 58_500_000, purpose: 'Third tranche - Play Ball and Goudey acquisitions', status: 'complete', percentOfCommitment: 30, cumulativeCalled: 90 },
];

const DISTRIBUTIONS: Distribution[] = [
  { id: 'dist-1', fundId: 'fund-1', distributionNumber: 1, distributionDate: '2024-12-15', amount: 12_500_000, type: 'profit', source: 'Partial exit: 1958 Topps Jim Brown PSA 9 lot', lpAmount: 10_000_000, gpAmount: 2_500_000 },
  { id: 'dist-2', fundId: 'fund-1', distributionNumber: 2, distributionDate: '2025-06-30', amount: 13_093_750, type: 'profit', source: 'Exit: vintage football RC portfolio', lpAmount: 10_475_000, gpAmount: 2_618_750 },
  { id: 'dist-3', fundId: 'fund-3', distributionNumber: 1, distributionDate: '2023-03-15', amount: 35_000_000, type: 'profit', source: 'Exit: 1933 Goudey complete set SGC 6+ avg', lpAmount: 28_700_000, gpAmount: 6_300_000 },
  { id: 'dist-4', fundId: 'fund-3', distributionNumber: 2, distributionDate: '2024-06-30', amount: 42_000_000, type: 'profit', source: 'Partial exit: T206 portfolio (excl. Wagner)', lpAmount: 34_440_000, gpAmount: 7_560_000 },
  { id: 'dist-5', fundId: 'fund-3', distributionNumber: 3, distributionDate: '2025-09-15', amount: 31_810_000, type: 'return_of_capital', source: 'Capital return from Play Ball exits', lpAmount: 31_810_000, gpAmount: 0 },
];

const FUND_DOCUMENTS: FundDocument[] = [
  { id: 'doc-1', fundId: 'fund-1', type: 'ppm', name: 'Sterling Sports Alpha Fund I - Private Placement Memorandum', dateGenerated: '2022-01-15', status: 'signed', size: '4.2 MB', description: 'Fund offering document with risk disclosures and strategy overview' },
  { id: 'doc-2', fundId: 'fund-1', type: 'lpa', name: 'Limited Partnership Agreement - SSA Fund I', dateGenerated: '2022-02-01', status: 'signed', size: '2.8 MB', description: 'Governing agreement for LP/GP rights, obligations, and waterfall terms' },
  { id: 'doc-3', fundId: 'fund-1', type: 'quarterly_report', name: 'Q4 2025 Quarterly Report', dateGenerated: '2026-01-20', status: 'final', size: '1.5 MB', description: 'Performance update, NAV statement, and portfolio summary' },
  { id: 'doc-4', fundId: 'fund-1', type: 'capital_call_notice', name: 'Capital Call #4 Notice', dateGenerated: '2026-05-15', status: 'draft', size: '380 KB', description: 'Notice for final 25% tranche capital call' },
  { id: 'doc-5', fundId: 'fund-1', type: 'k1', name: '2025 Schedule K-1', dateGenerated: '2026-02-28', status: 'final', size: '220 KB', description: 'Tax reporting document for partnership income allocation' },
  { id: 'doc-6', fundId: 'fund-2', type: 'ppm', name: 'Apex Modern Icons Fund - Private Placement Memorandum', dateGenerated: '2024-02-01', status: 'signed', size: '3.8 MB', description: 'Fund offering document for modern era card strategy' },
  { id: 'doc-7', fundId: 'fund-2', type: 'subscription', name: 'Subscription Agreement Template', dateGenerated: '2024-03-01', status: 'final', size: '1.1 MB', description: 'LP subscription and accreditation documentation' },
  { id: 'doc-8', fundId: 'fund-3', type: 'quarterly_report', name: 'Q4 2025 Quarterly Report - Heritage Legacy III', dateGenerated: '2026-01-25', status: 'final', size: '2.1 MB', description: 'Performance review with harvest phase timeline and exit schedule' },
  { id: 'doc-9', fundId: 'fund-3', type: 'distribution_notice', name: 'Distribution #3 Notice', dateGenerated: '2025-08-30', status: 'signed', size: '290 KB', description: 'Return of capital distribution from Play Ball exits' },
  { id: 'doc-10', fundId: 'fund-3', type: 'lpa', name: 'Limited Partnership Agreement - Heritage Legacy III', dateGenerated: '2019-11-01', status: 'signed', size: '3.1 MB', description: 'Governing agreement with amended waterfall provisions' },
];

// ─── Waterfall Calculation ──────────────────────────────────────────────────

function computeWaterfall(
  totalDistributable: number,
  paidInCapital: number,
  hurdleRate: number,
  carryRate: number,
  _lpSplit: number
): WaterfallDistribution[] {
  const tiers: WaterfallDistribution[] = [];
  let remaining = totalDistributable;
  let cumulative = 0;

  // Tier 1: Return of Capital
  const rocAmount = Math.min(remaining, paidInCapital);
  cumulative += rocAmount;
  tiers.push({
    tier: 'Return of Capital',
    description: '100% to LPs until paid-in capital is returned',
    amount: rocAmount,
    lpShare: rocAmount,
    gpShare: 0,
    cumulativeDistributed: cumulative,
  });
  remaining -= rocAmount;

  // Tier 2: Preferred Return (Hurdle)
  const hurdleAmount = paidInCapital * (hurdleRate / 100);
  const prefReturn = Math.min(remaining, hurdleAmount);
  cumulative += prefReturn;
  tiers.push({
    tier: 'Preferred Return',
    description: `${hurdleRate}% preferred return to LPs (hurdle rate)`,
    amount: prefReturn,
    lpShare: prefReturn,
    gpShare: 0,
    cumulativeDistributed: cumulative,
    hurdleRate,
  });
  remaining -= prefReturn;

  // Tier 3: GP Catch-up
  const catchUpTarget = (cumulative * carryRate) / (100 - carryRate);
  const catchUpAmount = Math.min(remaining, catchUpTarget);
  cumulative += catchUpAmount;
  tiers.push({
    tier: 'GP Catch-Up',
    description: `100% to GP until GP has received ${carryRate}% of cumulative profits`,
    amount: catchUpAmount,
    lpShare: 0,
    gpShare: catchUpAmount,
    cumulativeDistributed: cumulative,
    carryRate,
  });
  remaining -= catchUpAmount;

  // Tier 4: Carried Interest Split
  if (remaining > 0) {
    const lpCarryShare = remaining * ((100 - carryRate) / 100);
    const gpCarryShare = remaining * (carryRate / 100);
    cumulative += remaining;
    tiers.push({
      tier: 'Residual Split',
      description: `${100 - carryRate}/${carryRate} LP/GP split on remaining profits`,
      amount: remaining,
      lpShare: lpCarryShare,
      gpShare: gpCarryShare,
      cumulativeDistributed: cumulative,
      carryRate,
    });
  }

  return tiers;
}

// ─── Service Functions ──────────────────────────────────────────────────────

export function getFunds(): Fund[] {
  return FUNDS;
}

export function createFund(name: string, strategy: string, targetSize: number, gpId: string): Fund {
  const gp = GP_MANAGERS.find(g => g.id === gpId) ?? GP_MANAGERS[0];
  const newFund: Fund = {
    id: `fund-${Date.now()}`,
    name,
    strategy,
    targetSize,
    currentSize: 0,
    status: 'fundraising',
    gpManager: gp,
    lpCount: 0,
    vintage: new Date().getFullYear(),
    geographicFocus: 'North America',
    sportFocus: ['Baseball', 'Basketball'],
    termYears: 7,
    investmentPeriodYears: 4,
    hurdleRate: 8,
    carryPercentage: gp.carryPercentage,
    managementFee: gp.managementFee,
    description: strategy,
  };
  FUNDS.push(newFund);
  return newFund;
}

export function getSyndicates(): Syndicate[] {
  return SYNDICATES;
}

export function getFundMetrics(fundId?: string): FundMetrics[] {
  if (fundId) return FUND_METRICS.filter(m => m.fundId === fundId);
  return FUND_METRICS;
}

export function getWaterfallDistribution(fundId: string): WaterfallDistribution[] {
  const fund = FUNDS.find(f => f.id === fundId);
  const metrics = FUND_METRICS.find(m => m.fundId === fundId);
  if (!fund || !metrics) return [];

  const totalDistributable = metrics.totalDistributions + metrics.unrealizedValue;
  return computeWaterfall(
    totalDistributable,
    metrics.paidInCapital,
    fund.hurdleRate,
    fund.carryPercentage,
    80
  );
}

export function getCapitalCalls(fundId?: string): CapitalCall[] {
  if (fundId) return CAPITAL_CALLS.filter(c => c.fundId === fundId);
  return CAPITAL_CALLS;
}

export function getDistributions(fundId?: string): Distribution[] {
  if (fundId) return DISTRIBUTIONS.filter(d => d.fundId === fundId);
  return DISTRIBUTIONS;
}

export function getLPPortfolio(): LPInvestor[] {
  return LP_INVESTORS;
}

export function getFundPositions(fundId?: string): FundPosition[] {
  if (fundId) return FUND_POSITIONS.filter(p => p.fundId === fundId);
  return FUND_POSITIONS;
}

export function getGPManagers(): GPManager[] {
  return GP_MANAGERS;
}

export function getFundDocuments(fundId?: string): FundDocument[] {
  if (fundId) return FUND_DOCUMENTS.filter(d => d.fundId === fundId);
  return FUND_DOCUMENTS;
}

export function getTotalAUM(): number {
  return FUND_METRICS.reduce((sum, m) => sum + m.nav, 0);
}

export function getActiveSyndicatesCount(): number {
  return SYNDICATES.filter(s => s.status === 'open' || s.status === 'active' || s.status === 'funded').length;
}

export function getTopFundIRR(): { fundName: string; irr: number } {
  let best = { fundName: '', irr: 0 };
  for (const m of FUND_METRICS) {
    if (m.irr > best.irr) {
      const fund = FUNDS.find(f => f.id === m.fundId);
      best = { fundName: fund?.name ?? 'Unknown', irr: m.irr };
    }
  }
  return best;
}
