// ─────────────────────────────────────────────────────────────
// Auction Game Theory Equilibrium Engine – Service Layer
// Applies formal Bayesian game theory to auction bidding
// ─────────────────────────────────────────────────────────────

export type AuctionType = 'english' | 'sealed-bid' | 'dutch' | 'flash-sale';

export type BidderArchetype = 'rational' | 'fomo-driven' | 'sniper' | 'whale' | 'value-hunter';

export interface AuctionAnalysis {
  id: string;
  auctionTitle: string;
  cardName: string;
  platform: 'goldin' | 'heritage' | 'whatnot' | 'ebay' | 'pwcc';
  auctionType: AuctionType;
  currentBid: number;
  estimatedFairValue: number;
  nashEquilibriumBid: number;
  optimalEntryPoint: number;
  bidCeiling: number;
  optimalBidTime: string;
  estimatedBidders: number;
  hiddenBidders: number;
  exploitabilityScore: number; // 0-100, higher = more exploitable
  competitionIntensity: 'low' | 'medium' | 'high' | 'extreme';
  expectedSavings: number;
  winProbability: number; // 0-100
  timeRemaining: string;
  recommendedStrategy: string;
}

export interface BidderProfile {
  id: string;
  archetype: BidderArchetype;
  estimatedValuation: number;
  bidAggressiveness: number; // 0-100
  historicalWinRate: number;
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface UserBidHistory {
  totalAuctions: number;
  wins: number;
  losses: number;
  avgSavingsVsMarket: number;
  winRate: number;
  improvedWinRateWithEngine: number;
  totalSaved: number;
}

export interface EquilibriumStats {
  activeAuctions: number;
  exploitableAuctions: number;
  avgSavings: number;
  totalAnalyzed: number;
  bestOpportunity: string;
}

// ── Mock Auction Analyses (10 items) ──────────────────────────

const MOCK_AUCTION_ANALYSES: AuctionAnalysis[] = [
  {
    id: 'aa-001',
    auctionTitle: '2023 Victor Wembanyama Prizm Silver PSA 10',
    cardName: '2023 Wembanyama Prizm Silver PSA 10',
    platform: 'goldin',
    auctionType: 'english',
    currentBid: 3850,
    estimatedFairValue: 4600,
    nashEquilibriumBid: 4150,
    optimalEntryPoint: 3900,
    bidCeiling: 4350,
    optimalBidTime: 'Last 12 seconds — snipe window',
    estimatedBidders: 14,
    hiddenBidders: 5,
    exploitabilityScore: 72,
    competitionIntensity: 'high',
    expectedSavings: 450,
    winProbability: 64,
    timeRemaining: '2h 14m',
    recommendedStrategy: 'Wait for final 15 seconds. Two whale bidders are likely to exhaust each other before your snipe entry. Set hard ceiling at $4,350.',
  },
  {
    id: 'aa-002',
    auctionTitle: '2018 Luka Doncic Prizm Base PSA 10',
    cardName: '2018 Luka Doncic Prizm Base PSA 10',
    platform: 'heritage',
    auctionType: 'english',
    currentBid: 7200,
    estimatedFairValue: 8800,
    nashEquilibriumBid: 8100,
    optimalEntryPoint: 7400,
    bidCeiling: 8400,
    optimalBidTime: 'Place proxy bid now — extended bidding format',
    estimatedBidders: 22,
    hiddenBidders: 8,
    exploitabilityScore: 38,
    competitionIntensity: 'extreme',
    expectedSavings: 700,
    winProbability: 31,
    timeRemaining: '4d 6h',
    recommendedStrategy: 'High competition — Heritage extended bidding neutralizes sniping. Set proxy at $8,100 and walk away. Do not engage in emotional bidding war.',
  },
  {
    id: 'aa-003',
    auctionTitle: '2020 Justin Herbert Optic Holo PSA 10',
    cardName: '2020 Justin Herbert Optic Holo PSA 10',
    platform: 'ebay',
    auctionType: 'english',
    currentBid: 1450,
    estimatedFairValue: 2100,
    nashEquilibriumBid: 1850,
    optimalEntryPoint: 1500,
    bidCeiling: 1950,
    optimalBidTime: 'Sunday 10:47 PM EST — low competition window',
    estimatedBidders: 6,
    hiddenBidders: 2,
    exploitabilityScore: 85,
    competitionIntensity: 'low',
    expectedSavings: 650,
    winProbability: 78,
    timeRemaining: '18h 32m',
    recommendedStrategy: 'Highly exploitable. Only 2 serious bidders detected. Snipe at $1,850 in final 7 seconds. Sunday late-night ending favors patient bidders.',
  },
  {
    id: 'aa-004',
    auctionTitle: '2024 Caleb Williams Prizm Gold /10 Raw',
    cardName: '2024 Caleb Williams Prizm Gold /10 Raw',
    platform: 'whatnot',
    auctionType: 'flash-sale',
    currentBid: 890,
    estimatedFairValue: 1400,
    nashEquilibriumBid: 1100,
    optimalEntryPoint: 920,
    bidCeiling: 1200,
    optimalBidTime: 'Immediately — flash sale ends in 3m',
    estimatedBidders: 38,
    hiddenBidders: 0,
    exploitabilityScore: 55,
    competitionIntensity: 'high',
    expectedSavings: 300,
    winProbability: 42,
    timeRemaining: '2m 48s',
    recommendedStrategy: 'Flash sale psychology creates impulsive overbids. Enter at $920, let FOMO bidders exhaust. Drop out firmly at $1,200 — do not chase.',
  },
  {
    id: 'aa-005',
    auctionTitle: '1986 Michael Jordan Fleer #57 PSA 8',
    cardName: '1986 Michael Jordan Fleer #57 PSA 8',
    platform: 'pwcc',
    auctionType: 'sealed-bid',
    currentBid: 0,
    estimatedFairValue: 32000,
    nashEquilibriumBid: 28500,
    optimalEntryPoint: 27000,
    bidCeiling: 30000,
    optimalBidTime: 'Submit bid before deadline — sealed format',
    estimatedBidders: 9,
    hiddenBidders: 9,
    exploitabilityScore: 62,
    competitionIntensity: 'medium',
    expectedSavings: 3500,
    winProbability: 52,
    timeRemaining: '1d 8h',
    recommendedStrategy: 'Sealed-bid favors Bayesian modeling. Historical PWCC data suggests winning bids cluster at 88-92% of fair value. Bid $28,500 for optimal expected value.',
  },
  {
    id: 'aa-006',
    auctionTitle: '2022 Paolo Banchero Mosaic Hobby Box Break Spot',
    cardName: '2022 Paolo Banchero Mosaic Hobby',
    platform: 'whatnot',
    auctionType: 'english',
    currentBid: 125,
    estimatedFairValue: 180,
    nashEquilibriumBid: 155,
    optimalEntryPoint: 130,
    bidCeiling: 165,
    optimalBidTime: 'Now — auction closing in 45 seconds',
    estimatedBidders: 11,
    hiddenBidders: 1,
    exploitabilityScore: 48,
    competitionIntensity: 'medium',
    expectedSavings: 25,
    winProbability: 55,
    timeRemaining: '45s',
    recommendedStrategy: 'Break spot value highly variant. Enter at $130 and hold firm at $165 ceiling. Expected value is marginal — only pursue if specific card assignment is favorable.',
  },
  {
    id: 'aa-007',
    auctionTitle: '2024 Cooper Flagg Bowman University 1st Chrome Auto',
    cardName: '2024 Cooper Flagg Bowman U 1st Chrome Auto',
    platform: 'goldin',
    auctionType: 'english',
    currentBid: 5200,
    estimatedFairValue: 6800,
    nashEquilibriumBid: 6100,
    optimalEntryPoint: 5400,
    bidCeiling: 6400,
    optimalBidTime: 'Final 20 seconds — Goldin soft close adds 5m',
    estimatedBidders: 19,
    hiddenBidders: 6,
    exploitabilityScore: 44,
    competitionIntensity: 'high',
    expectedSavings: 700,
    winProbability: 38,
    timeRemaining: '6h 22m',
    recommendedStrategy: 'Goldin soft close prevents pure sniping. Place initial bid at $5,400 to signal seriousness, then proxy up to $6,400. Watch for whale entry patterns.',
  },
  {
    id: 'aa-008',
    auctionTitle: '2001 Tom Brady Topps Chrome Refractor PSA 9',
    cardName: '2001 Tom Brady Topps Chrome Refractor PSA 9',
    platform: 'heritage',
    auctionType: 'english',
    currentBid: 18500,
    estimatedFairValue: 24000,
    nashEquilibriumBid: 21500,
    optimalEntryPoint: 19000,
    bidCeiling: 22500,
    optimalBidTime: 'Place proxy bid 24h before close',
    estimatedBidders: 16,
    hiddenBidders: 7,
    exploitabilityScore: 35,
    competitionIntensity: 'extreme',
    expectedSavings: 2500,
    winProbability: 28,
    timeRemaining: '3d 14h',
    recommendedStrategy: 'Blue-chip card with deep-pocketed competitors. Low exploitability — set proxy at $21,500 and accept the outcome. Do not exceed ceiling.',
  },
  {
    id: 'aa-009',
    auctionTitle: '2023 Caitlin Clark Prizm Silver PSA 10',
    cardName: '2023 Caitlin Clark Prizm Silver PSA 10',
    platform: 'ebay',
    auctionType: 'english',
    currentBid: 680,
    estimatedFairValue: 950,
    nashEquilibriumBid: 820,
    optimalEntryPoint: 700,
    bidCeiling: 880,
    optimalBidTime: 'Tuesday 2:15 PM EST — midday lull',
    estimatedBidders: 8,
    hiddenBidders: 3,
    exploitabilityScore: 78,
    competitionIntensity: 'medium',
    expectedSavings: 130,
    winProbability: 71,
    timeRemaining: '12h 5m',
    recommendedStrategy: 'WNBA market less efficient — casual bidders dominate. Snipe at $820 in final 5 seconds. Midday ending reduces competition by ~30%.',
  },
  {
    id: 'aa-010',
    auctionTitle: '2019 Zion Williamson National Treasures RPA /99 BGS 9',
    cardName: '2019 Zion NT RPA /99 BGS 9',
    platform: 'pwcc',
    auctionType: 'sealed-bid',
    currentBid: 0,
    estimatedFairValue: 14000,
    nashEquilibriumBid: 12200,
    optimalEntryPoint: 11500,
    bidCeiling: 13000,
    optimalBidTime: 'Submit 2h before deadline for strategic uncertainty',
    estimatedBidders: 7,
    hiddenBidders: 7,
    exploitabilityScore: 58,
    competitionIntensity: 'medium',
    expectedSavings: 1800,
    winProbability: 48,
    timeRemaining: '2d 3h',
    recommendedStrategy: 'Zion sentiment is depressed — fewer whales in the pool. Sealed bid at $12,200 targets the gap between emotional sellers and rational accumulators.',
  },
];

// ── Mock Bidder Profiles (6 profiles) ──────────────────────────

const MOCK_BIDDER_PROFILES: BidderProfile[] = [
  {
    id: 'bp-001',
    archetype: 'whale',
    estimatedValuation: 45000,
    bidAggressiveness: 88,
    historicalWinRate: 72,
    riskTolerance: 'high',
  },
  {
    id: 'bp-002',
    archetype: 'sniper',
    estimatedValuation: 8500,
    bidAggressiveness: 25,
    historicalWinRate: 58,
    riskTolerance: 'low',
  },
  {
    id: 'bp-003',
    archetype: 'fomo-driven',
    estimatedValuation: 3200,
    bidAggressiveness: 92,
    historicalWinRate: 34,
    riskTolerance: 'high',
  },
  {
    id: 'bp-004',
    archetype: 'rational',
    estimatedValuation: 12000,
    bidAggressiveness: 45,
    historicalWinRate: 51,
    riskTolerance: 'medium',
  },
  {
    id: 'bp-005',
    archetype: 'value-hunter',
    estimatedValuation: 6800,
    bidAggressiveness: 35,
    historicalWinRate: 44,
    riskTolerance: 'low',
  },
  {
    id: 'bp-006',
    archetype: 'fomo-driven',
    estimatedValuation: 1800,
    bidAggressiveness: 95,
    historicalWinRate: 22,
    riskTolerance: 'high',
  },
];

// ── Mock User Bid History ──────────────────────────────────────

const MOCK_USER_BID_HISTORY: UserBidHistory = {
  totalAuctions: 142,
  wins: 68,
  losses: 74,
  avgSavingsVsMarket: 8.4,
  winRate: 47.9,
  improvedWinRateWithEngine: 63.2,
  totalSaved: 12840,
};

// ── Public API Functions ──────────────────────────────────────

export function getAuctionAnalyses(): AuctionAnalysis[] {
  return MOCK_AUCTION_ANALYSES;
}

export function getBidderProfiles(): BidderProfile[] {
  return MOCK_BIDDER_PROFILES;
}

export function getUserBidHistory(): UserBidHistory {
  return { ...MOCK_USER_BID_HISTORY };
}

export function getEquilibriumStats(): EquilibriumStats {
  const analyses = MOCK_AUCTION_ANALYSES;
  const exploitable = analyses.filter(a => a.exploitabilityScore >= 60);
  const avgSavings = analyses.reduce((sum, a) => sum + a.expectedSavings, 0) / analyses.length;
  const best = [...analyses].sort((a, b) => b.exploitabilityScore - a.exploitabilityScore)[0];

  return {
    activeAuctions: analyses.length,
    exploitableAuctions: exploitable.length,
    avgSavings: Math.round(avgSavings),
    totalAnalyzed: 847,
    bestOpportunity: best.cardName,
  };
}

export function getExploitabilityLabel(score: number): { text: string; color: string } {
  if (score >= 75) return { text: 'Highly Exploitable', color: 'text-green-400' };
  if (score >= 50) return { text: 'Moderately Exploitable', color: 'text-amber-400' };
  if (score >= 25) return { text: 'Low Exploitability', color: 'text-orange-400' };
  return { text: 'Efficient Market', color: 'text-red-400' };
}

export function getCompetitionColor(intensity: 'low' | 'medium' | 'high' | 'extreme'): string {
  const colors: Record<typeof intensity, string> = {
    low: 'text-green-400',
    medium: 'text-amber-400',
    high: 'text-orange-400',
    extreme: 'text-red-400',
  };
  return colors[intensity];
}
