// Live Auction Bidder Psychology Profiler Service

export interface BidderProfile {
  id: string;
  username: string;
  totalAuctions: number;
  winRate: number;
  avgBidsPerAuction: number;
  typicalDropoutAt: number;
  bidSpeed: 'fast' | 'measured' | 'slow';
  profileType: 'emotional' | 'strategic' | 'value hunter' | 'collector' | 'dealer';
  maxBidRatio: number;
  dangerLevel: 'low' | 'medium' | 'high';
  tell: string;
}

export interface BidEvent {
  bidderId: string;
  amount: number;
  timestamp: string;
  timeSinceLastBid: number;
}

export interface LiveAuctionBidStream {
  auctionId: string;
  cardName: string;
  platform: string;
  currentBid: number;
  fairMarketValue: number;
  bids: BidEvent[];
  activeBidders: number;
  timeRemaining: number;
}

export interface BidderIntelReport {
  bidderId: string;
  currentAuctionId: string;
  predictedMaxBid: number;
  dropoutProbability: number;
  emotionalSignals: string[];
  strategicSignals: string[];
  recommendation: string;
  confidence: number;
}

export interface AuctionPsychSummary {
  totalBiddersTracked: number;
  emotionalBiddersDetected: number;
  strategicBiddersDetected: number;
  avgWinningEdge: number;
  successfulPredictions: number;
}

export interface BidTiming {
  minutesBeforeEnd: number;
  avgBidFrequency: number;
  label: string;
}

// ---- Mock Data ----

const BIDDER_PROFILES: BidderProfile[] = [
  {
    id: 'b001',
    username: 'Bidder_7842',
    totalAuctions: 312,
    winRate: 0.31,
    avgBidsPerAuction: 14.2,
    typicalDropoutAt: 0.82,
    bidSpeed: 'fast',
    profileType: 'emotional',
    maxBidRatio: 1.08,
    dangerLevel: 'medium',
    tell: 'Rapid bids early then disappears around 82% of final price',
  },
  {
    id: 'b002',
    username: 'Bidder_2291',
    totalAuctions: 540,
    winRate: 0.61,
    avgBidsPerAuction: 4.1,
    typicalDropoutAt: 0.97,
    bidSpeed: 'slow',
    profileType: 'strategic',
    maxBidRatio: 1.02,
    dangerLevel: 'high',
    tell: 'Snipes in final 30 seconds with single decisive bid',
  },
  {
    id: 'b003',
    username: 'Bidder_5503',
    totalAuctions: 189,
    winRate: 0.44,
    avgBidsPerAuction: 7.8,
    typicalDropoutAt: 0.75,
    bidSpeed: 'measured',
    profileType: 'value hunter',
    maxBidRatio: 1.05,
    dangerLevel: 'low',
    tell: 'Always bids in round numbers, exits if price exceeds PSA pop report value',
  },
  {
    id: 'b004',
    username: 'Bidder_9117',
    totalAuctions: 876,
    winRate: 0.52,
    avgBidsPerAuction: 9.3,
    typicalDropoutAt: 0.93,
    bidSpeed: 'measured',
    profileType: 'dealer',
    maxBidRatio: 1.04,
    dangerLevel: 'high',
    tell: 'Systematic $5 increments until 90% of market then jumps $25 to intimidate',
  },
  {
    id: 'b005',
    username: 'Bidder_3374',
    totalAuctions: 67,
    winRate: 0.22,
    avgBidsPerAuction: 22.1,
    typicalDropoutAt: 0.68,
    bidSpeed: 'fast',
    profileType: 'emotional',
    maxBidRatio: 1.15,
    dangerLevel: 'low',
    tell: 'Floods early bids to seem dominant, consistently folds before 70% of final',
  },
  {
    id: 'b006',
    username: 'Bidder_6680',
    totalAuctions: 234,
    winRate: 0.48,
    avgBidsPerAuction: 5.5,
    typicalDropoutAt: 0.88,
    bidSpeed: 'slow',
    profileType: 'collector',
    maxBidRatio: 1.09,
    dangerLevel: 'medium',
    tell: 'Patient for 80% of auction then aggressively defends specific lot targets',
  },
  {
    id: 'b007',
    username: 'Bidder_1129',
    totalAuctions: 421,
    winRate: 0.57,
    avgBidsPerAuction: 3.8,
    typicalDropoutAt: 0.99,
    bidSpeed: 'slow',
    profileType: 'strategic',
    maxBidRatio: 1.01,
    dangerLevel: 'high',
    tell: 'Proxy bids only — never reveals presence until outbid, then counters once',
  },
  {
    id: 'b008',
    username: 'Bidder_4456',
    totalAuctions: 155,
    winRate: 0.38,
    avgBidsPerAuction: 11.4,
    typicalDropoutAt: 0.79,
    bidSpeed: 'fast',
    profileType: 'emotional',
    maxBidRatio: 1.12,
    dangerLevel: 'low',
    tell: 'Bids immediately after each counter — shows emotional engagement, burns out by 80%',
  },
  {
    id: 'b009',
    username: 'Bidder_8830',
    totalAuctions: 698,
    winRate: 0.55,
    avgBidsPerAuction: 6.2,
    typicalDropoutAt: 0.91,
    bidSpeed: 'measured',
    profileType: 'dealer',
    maxBidRatio: 1.03,
    dangerLevel: 'high',
    tell: 'Tracks comps in real-time — will never exceed recent 90-day PSA 10 average',
  },
  {
    id: 'b010',
    username: 'Bidder_2045',
    totalAuctions: 103,
    winRate: 0.29,
    avgBidsPerAuction: 18.7,
    typicalDropoutAt: 0.71,
    bidSpeed: 'fast',
    profileType: 'emotional',
    maxBidRatio: 1.18,
    dangerLevel: 'low',
    tell: 'Rapid-fire small increments in opening minutes, disappears after being countered twice',
  },
  {
    id: 'b011',
    username: 'Bidder_7701',
    totalAuctions: 290,
    winRate: 0.41,
    avgBidsPerAuction: 8.1,
    typicalDropoutAt: 0.85,
    bidSpeed: 'measured',
    profileType: 'collector',
    maxBidRatio: 1.07,
    dangerLevel: 'medium',
    tell: 'Targets specific player PC cards — will push 20% above market for key graded pieces',
  },
  {
    id: 'b012',
    username: 'Bidder_3962',
    totalAuctions: 472,
    winRate: 0.63,
    avgBidsPerAuction: 3.2,
    typicalDropoutAt: 0.98,
    bidSpeed: 'slow',
    profileType: 'strategic',
    maxBidRatio: 1.01,
    dangerLevel: 'high',
    tell: 'Never bids until final 2 minutes — uses auction extensions to his advantage',
  },
];

const LIVE_AUCTION_BID_STREAMS: LiveAuctionBidStream[] = [
  {
    auctionId: 'a001',
    cardName: '2021 Topps Chrome Julio Rodriguez PSA 10',
    platform: 'eBay',
    currentBid: 312,
    fairMarketValue: 385,
    activeBidders: 5,
    timeRemaining: 847,
    bids: [
      { bidderId: 'b001', amount: 200, timestamp: '14:02:11', timeSinceLastBid: 0 },
      { bidderId: 'b005', amount: 210, timestamp: '14:02:14', timeSinceLastBid: 3 },
      { bidderId: 'b001', amount: 225, timestamp: '14:02:17', timeSinceLastBid: 3 },
      { bidderId: 'b003', amount: 250, timestamp: '14:04:32', timeSinceLastBid: 135 },
      { bidderId: 'b005', amount: 255, timestamp: '14:04:35', timeSinceLastBid: 3 },
      { bidderId: 'b001', amount: 270, timestamp: '14:04:38', timeSinceLastBid: 3 },
      { bidderId: 'b011', amount: 285, timestamp: '14:08:55', timeSinceLastBid: 257 },
      { bidderId: 'b003', amount: 295, timestamp: '14:09:40', timeSinceLastBid: 45 },
      { bidderId: 'b001', amount: 305, timestamp: '14:09:44', timeSinceLastBid: 4 },
      { bidderId: 'b011', amount: 312, timestamp: '14:12:18', timeSinceLastBid: 154 },
    ],
  },
  {
    auctionId: 'a002',
    cardName: '2018 Panini Prizm Luka Doncic RC BGS 9.5',
    platform: 'Goldin',
    currentBid: 1450,
    fairMarketValue: 1600,
    activeBidders: 4,
    timeRemaining: 1920,
    bids: [
      { bidderId: 'b002', amount: 900, timestamp: '13:30:00', timeSinceLastBid: 0 },
      { bidderId: 'b004', amount: 950, timestamp: '13:31:12', timeSinceLastBid: 72 },
      { bidderId: 'b009', amount: 1000, timestamp: '13:31:55', timeSinceLastBid: 43 },
      { bidderId: 'b004', amount: 1050, timestamp: '13:32:00', timeSinceLastBid: 5 },
      { bidderId: 'b009', amount: 1100, timestamp: '13:32:12', timeSinceLastBid: 12 },
      { bidderId: 'b004', amount: 1150, timestamp: '13:33:45', timeSinceLastBid: 93 },
      { bidderId: 'b007', amount: 1200, timestamp: '13:40:22', timeSinceLastBid: 397 },
      { bidderId: 'b004', amount: 1250, timestamp: '13:40:27', timeSinceLastBid: 5 },
      { bidderId: 'b009', amount: 1350, timestamp: '13:41:10', timeSinceLastBid: 43 },
      { bidderId: 'b004', amount: 1400, timestamp: '13:41:15', timeSinceLastBid: 5 },
      { bidderId: 'b007', amount: 1450, timestamp: '13:55:30', timeSinceLastBid: 855 },
    ],
  },
  {
    auctionId: 'a003',
    cardName: '1986 Fleer Michael Jordan Rookie PSA 8',
    platform: 'Heritage',
    currentBid: 4200,
    fairMarketValue: 4800,
    activeBidders: 6,
    timeRemaining: 3600,
    bids: [
      { bidderId: 'b006', amount: 3000, timestamp: '10:00:00', timeSinceLastBid: 0 },
      { bidderId: 'b008', amount: 3100, timestamp: '10:00:04', timeSinceLastBid: 4 },
      { bidderId: 'b010', amount: 3200, timestamp: '10:00:07', timeSinceLastBid: 3 },
      { bidderId: 'b008', amount: 3300, timestamp: '10:00:09', timeSinceLastBid: 2 },
      { bidderId: 'b010', amount: 3400, timestamp: '10:00:11', timeSinceLastBid: 2 },
      { bidderId: 'b006', amount: 3500, timestamp: '10:05:30', timeSinceLastBid: 319 },
      { bidderId: 'b012', amount: 3600, timestamp: '10:18:45', timeSinceLastBid: 795 },
      { bidderId: 'b008', amount: 3700, timestamp: '10:18:47', timeSinceLastBid: 2 },
      { bidderId: 'b011', amount: 3800, timestamp: '10:22:10', timeSinceLastBid: 203 },
      { bidderId: 'b006', amount: 3900, timestamp: '10:30:00', timeSinceLastBid: 470 },
      { bidderId: 'b012', amount: 4000, timestamp: '10:55:20', timeSinceLastBid: 1520 },
      { bidderId: 'b009', amount: 4100, timestamp: '10:56:00', timeSinceLastBid: 40 },
      { bidderId: 'b006', amount: 4200, timestamp: '10:58:30', timeSinceLastBid: 150 },
    ],
  },
];

const BIDDER_INTEL_REPORTS: BidderIntelReport[] = [
  {
    bidderId: 'b001',
    currentAuctionId: 'a001',
    predictedMaxBid: 340,
    dropoutProbability: 0.78,
    emotionalSignals: ['Bid 3 times in under 10 seconds', 'Immediate counter on every raise', 'Already bid 10 times in this session'],
    strategicSignals: [],
    recommendation: 'Bidder_7842 is emotional — expect them to drop at ~$340. Safe to bid up to $355.',
    confidence: 82,
  },
  {
    bidderId: 'b003',
    currentAuctionId: 'a001',
    predictedMaxBid: 356,
    dropoutProbability: 0.61,
    emotionalSignals: [],
    strategicSignals: ['Bids in round numbers only', 'Spacing bids 1–3 minutes apart', 'Dropped last auction at 74% of final'],
    recommendation: 'Bidder_5503 is a value hunter — they will cap near PSA pop value (~$360). Do not overpay chasing them.',
    confidence: 71,
  },
  {
    bidderId: 'b011',
    currentAuctionId: 'a001',
    predictedMaxBid: 395,
    dropoutProbability: 0.35,
    emotionalSignals: [],
    strategicSignals: ['Currently leading', 'Consistent measured pace', 'Won 3 of last 5 similar lots'],
    recommendation: 'Bidder_7701 is a dedicated collector — they may push to $395+ for this player. Proceed with caution above $375.',
    confidence: 68,
  },
  {
    bidderId: 'b002',
    currentAuctionId: 'a002',
    predictedMaxBid: 1680,
    dropoutProbability: 0.22,
    emotionalSignals: [],
    strategicSignals: ['Has not bid since opening — likely proxy set high', 'Sniper history on Goldin lots', 'Won 6 of 9 heritage-level auctions this year'],
    recommendation: 'Bidder_2291 is a dangerous sniper — assume they have a proxy near market value. Budget buffer to $1,680.',
    confidence: 87,
  },
  {
    bidderId: 'b004',
    currentAuctionId: 'a002',
    predictedMaxBid: 1520,
    dropoutProbability: 0.48,
    emotionalSignals: ['Rapid $50 counter-bids', 'Active since auction open'],
    strategicSignals: ['Systematic increment pattern', 'Dealer profile — tracks resale margin'],
    recommendation: 'Bidder_9117 is dealer-motivated — likely exits at 95% of recent comp average (~$1,520).',
    confidence: 74,
  },
  {
    bidderId: 'b007',
    currentAuctionId: 'a002',
    predictedMaxBid: 1610,
    dropoutProbability: 0.28,
    emotionalSignals: [],
    strategicSignals: ['Proxy bidder — only appears when outbid', 'Never bidded more than twice in an auction', 'High win rate on premier lots'],
    recommendation: 'Bidder_1129 uses a single high proxy — if they counter once, budget to $1,610 or stand down.',
    confidence: 79,
  },
];

const BID_TIMING_DATA: BidTiming[] = [
  { minutesBeforeEnd: 60, avgBidFrequency: 0.4, label: '60 min' },
  { minutesBeforeEnd: 45, avgBidFrequency: 0.6, label: '45 min' },
  { minutesBeforeEnd: 30, avgBidFrequency: 0.9, label: '30 min' },
  { minutesBeforeEnd: 20, avgBidFrequency: 1.3, label: '20 min' },
  { minutesBeforeEnd: 15, avgBidFrequency: 1.8, label: '15 min' },
  { minutesBeforeEnd: 10, avgBidFrequency: 2.7, label: '10 min' },
  { minutesBeforeEnd: 5, avgBidFrequency: 4.2, label: '5 min' },
  { minutesBeforeEnd: 3, avgBidFrequency: 6.8, label: '3 min' },
  { minutesBeforeEnd: 2, avgBidFrequency: 11.4, label: '2 min' },
  { minutesBeforeEnd: 1, avgBidFrequency: 18.9, label: '1 min' },
  { minutesBeforeEnd: 0.5, avgBidFrequency: 31.2, label: '30 sec' },
];

const PSYCH_SUMMARY: AuctionPsychSummary = {
  totalBiddersTracked: 12,
  emotionalBiddersDetected: 4,
  strategicBiddersDetected: 5,
  avgWinningEdge: 7.4,
  successfulPredictions: 847,
};

// ---- Exported Functions ----

export function getBidderProfiles(): BidderProfile[] {
  return BIDDER_PROFILES;
}

export function getBidderProfile(id: string): BidderProfile | undefined {
  return BIDDER_PROFILES.find(p => p.id === id);
}

export function getLiveAuctionBidStreams(): LiveAuctionBidStream[] {
  return LIVE_AUCTION_BID_STREAMS;
}

export function getLiveAuctionBidStream(auctionId: string): LiveAuctionBidStream | undefined {
  return LIVE_AUCTION_BID_STREAMS.find(a => a.auctionId === auctionId);
}

export function getBidderIntelReports(auctionId: string): BidderIntelReport[] {
  return BIDDER_INTEL_REPORTS.filter(r => r.currentAuctionId === auctionId);
}

export function getBidTimingData(): BidTiming[] {
  return BID_TIMING_DATA;
}

export function getAuctionPsychSummary(): AuctionPsychSummary {
  return PSYCH_SUMMARY;
}

export function getActiveBidderIds(auctionId: string): string[] {
  const stream = getLiveAuctionBidStream(auctionId);
  if (!stream) return [];
  const seen = new Set<string>();
  stream.bids.forEach(b => seen.add(b.bidderId));
  return Array.from(seen);
}

export function getBidderRadarData(bidderId: string): Array<{ subject: string; value: number }> {
  const profile = getBidderProfile(bidderId);
  if (!profile) return [];
  const speedScore = profile.bidSpeed === 'fast' ? 90 : profile.bidSpeed === 'measured' ? 55 : 25;
  const aggressionScore = Math.round((1 - profile.typicalDropoutAt) * 100 + profile.avgBidsPerAuction * 2);
  const valueFocusScore = profile.profileType === 'value hunter' ? 90 : profile.profileType === 'dealer' ? 80 : profile.profileType === 'strategic' ? 65 : 40;
  const strategyScore = profile.profileType === 'strategic' ? 92 : profile.profileType === 'dealer' ? 75 : profile.profileType === 'collector' ? 60 : 30;
  const consistencyScore = Math.round(profile.winRate * 100 * 1.3);
  return [
    { subject: 'Speed', value: Math.min(speedScore, 100) },
    { subject: 'Aggression', value: Math.min(aggressionScore, 100) },
    { subject: 'Value Focus', value: Math.min(valueFocusScore, 100) },
    { subject: 'Strategy', value: Math.min(strategyScore, 100) },
    { subject: 'Consistency', value: Math.min(consistencyScore, 100) },
  ];
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}
