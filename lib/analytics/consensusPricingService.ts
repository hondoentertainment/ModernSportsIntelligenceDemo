// Social Proof & Community Consensus Pricing Service
// Provides community-driven price consensus, expert leaderboards, sentiment polls, and trending analysis

import { store } from '../dal/syncStore';

// ---- Types ----

export type SentimentLevel = 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';

export type ExpertTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export type VoteType = 'fair_price' | 'overvalued' | 'undervalued';

export interface ConsensusPrice {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  grade: string;
  gradingCompany: string;
  imageUrl: string;
  communityPrice: number;
  algorithmicPrice: number;
  lastSalePrice: number;
  priceSpread: number;
  totalVotes: number;
  voteBreakdown: { fair: number; overvalued: number; undervalued: number };
  sentiment: SentimentLevel;
  sentimentScore: number;
  expertConsensus: number;
  communityConfidence: number;
  priceHistory: { date: string; communityPrice: number; marketPrice: number }[];
  lastUpdated: string;
}

export interface CommunityExpert {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  tier: ExpertTier;
  accuracy: number;
  totalPredictions: number;
  profitablePredictions: number;
  avgReturn: number;
  specialties: string[];
  followers: number;
  reputation: number;
  joinedAt: string;
  recentPicks: { cardName: string; prediction: string; outcome: 'correct' | 'incorrect' | 'pending' }[];
}

export interface SentimentPoll {
  id: string;
  question: string;
  cardName: string | null;
  player: string | null;
  options: { label: string; votes: number; percentage: number }[];
  totalVotes: number;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface PriceVote {
  id: string;
  cardId: string;
  userId: string;
  username: string;
  vote: VoteType;
  priceEstimate: number;
  reasoning: string;
  timestamp: string;
  upvotes: number;
  expertTier: ExpertTier | null;
}

export interface TrendingCard {
  cardName: string;
  player: string;
  mentions: number;
  sentimentChange: number;
  priceChange: number;
  communityBuzz: number;
  topReason: string;
}

export interface ConsensusSummary {
  totalCardsTracked: number;
  activeVoters: number;
  avgCommunityAccuracy: number;
  communityVsMarketDelta: number;
  topExpertAccuracy: number;
  totalVotesThisWeek: number;
  trendingSentiment: SentimentLevel;
  mostDebated: { cardName: string; voteSpread: number }[];
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_consensus';

// ---- Mock Data: Consensus Prices ----

const CONSENSUS_PRICES: ConsensusPrice[] = [
  {
    id: 'cp-001',
    cardName: '2018 Prizm Silver Luka Doncic RC #280',
    player: 'Luka Doncic',
    year: 2018,
    set: 'Panini Prizm Silver',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 4250,
    algorithmicPrice: 4100,
    lastSalePrice: 4180,
    priceSpread: 3.7,
    totalVotes: 1842,
    voteBreakdown: { fair: 921, overvalued: 368, undervalued: 553 },
    sentiment: 'bullish',
    sentimentScore: 72,
    expertConsensus: 4300,
    communityConfidence: 84,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 3800, marketPrice: 3750 },
      { date: '2025-11-01', communityPrice: 3950, marketPrice: 3900 },
      { date: '2025-12-01', communityPrice: 4100, marketPrice: 4000 },
      { date: '2026-01-01', communityPrice: 4200, marketPrice: 4080 },
      { date: '2026-02-01', communityPrice: 4250, marketPrice: 4150 },
      { date: '2026-03-01', communityPrice: 4250, marketPrice: 4180 },
    ],
    lastUpdated: '2026-03-14T18:30:00Z',
  },
  {
    id: 'cp-002',
    cardName: '2003 Topps Chrome LeBron James RC #111',
    player: 'LeBron James',
    year: 2003,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 52000,
    algorithmicPrice: 50500,
    lastSalePrice: 51200,
    priceSpread: 2.9,
    totalVotes: 3215,
    voteBreakdown: { fair: 1608, overvalued: 643, undervalued: 964 },
    sentiment: 'bullish',
    sentimentScore: 68,
    expertConsensus: 53000,
    communityConfidence: 91,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 48000, marketPrice: 47500 },
      { date: '2025-11-01', communityPrice: 49500, marketPrice: 48800 },
      { date: '2025-12-01', communityPrice: 50200, marketPrice: 49500 },
      { date: '2026-01-01', communityPrice: 51000, marketPrice: 50200 },
      { date: '2026-02-01', communityPrice: 51500, marketPrice: 50800 },
      { date: '2026-03-01', communityPrice: 52000, marketPrice: 51200 },
    ],
    lastUpdated: '2026-03-14T20:15:00Z',
  },
  {
    id: 'cp-003',
    cardName: '2020 Prizm Justin Herbert RC #325',
    player: 'Justin Herbert',
    year: 2020,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 320,
    algorithmicPrice: 290,
    lastSalePrice: 305,
    priceSpread: 10.3,
    totalVotes: 987,
    voteBreakdown: { fair: 345, overvalued: 444, undervalued: 198 },
    sentiment: 'bearish',
    sentimentScore: 35,
    expertConsensus: 285,
    communityConfidence: 58,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 380, marketPrice: 370 },
      { date: '2025-11-01', communityPrice: 365, marketPrice: 350 },
      { date: '2025-12-01', communityPrice: 350, marketPrice: 330 },
      { date: '2026-01-01', communityPrice: 340, marketPrice: 315 },
      { date: '2026-02-01', communityPrice: 330, marketPrice: 310 },
      { date: '2026-03-01', communityPrice: 320, marketPrice: 305 },
    ],
    lastUpdated: '2026-03-14T12:45:00Z',
  },
  {
    id: 'cp-004',
    cardName: '2019 Mosaic Ja Morant RC #219',
    player: 'Ja Morant',
    year: 2019,
    set: 'Panini Mosaic',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 185,
    algorithmicPrice: 200,
    lastSalePrice: 190,
    priceSpread: 7.9,
    totalVotes: 756,
    voteBreakdown: { fair: 302, overvalued: 151, undervalued: 303 },
    sentiment: 'neutral',
    sentimentScore: 50,
    expertConsensus: 195,
    communityConfidence: 62,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 220, marketPrice: 230 },
      { date: '2025-11-01', communityPrice: 210, marketPrice: 220 },
      { date: '2025-12-01', communityPrice: 200, marketPrice: 210 },
      { date: '2026-01-01', communityPrice: 195, marketPrice: 200 },
      { date: '2026-02-01', communityPrice: 190, marketPrice: 195 },
      { date: '2026-03-01', communityPrice: 185, marketPrice: 190 },
    ],
    lastUpdated: '2026-03-13T22:00:00Z',
  },
  {
    id: 'cp-005',
    cardName: '2018 Optic Rated Rookie Saquon Barkley #151',
    player: 'Saquon Barkley',
    year: 2018,
    set: 'Donruss Optic',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 95,
    algorithmicPrice: 85,
    lastSalePrice: 88,
    priceSpread: 11.4,
    totalVotes: 543,
    voteBreakdown: { fair: 163, overvalued: 272, undervalued: 108 },
    sentiment: 'bearish',
    sentimentScore: 32,
    expertConsensus: 80,
    communityConfidence: 45,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 120, marketPrice: 115 },
      { date: '2025-11-01', communityPrice: 115, marketPrice: 108 },
      { date: '2025-12-01', communityPrice: 108, marketPrice: 100 },
      { date: '2026-01-01', communityPrice: 102, marketPrice: 95 },
      { date: '2026-02-01', communityPrice: 98, marketPrice: 92 },
      { date: '2026-03-01', communityPrice: 95, marketPrice: 88 },
    ],
    lastUpdated: '2026-03-14T09:30:00Z',
  },
  {
    id: 'cp-006',
    cardName: '2020 Select Concourse Joe Burrow RC #44',
    player: 'Joe Burrow',
    year: 2020,
    set: 'Panini Select',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 275,
    algorithmicPrice: 260,
    lastSalePrice: 268,
    priceSpread: 5.8,
    totalVotes: 1124,
    voteBreakdown: { fair: 562, overvalued: 225, undervalued: 337 },
    sentiment: 'bullish',
    sentimentScore: 65,
    expertConsensus: 280,
    communityConfidence: 76,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 240, marketPrice: 235 },
      { date: '2025-11-01', communityPrice: 248, marketPrice: 240 },
      { date: '2025-12-01', communityPrice: 255, marketPrice: 248 },
      { date: '2026-01-01', communityPrice: 262, marketPrice: 255 },
      { date: '2026-02-01', communityPrice: 270, marketPrice: 262 },
      { date: '2026-03-01', communityPrice: 275, marketPrice: 268 },
    ],
    lastUpdated: '2026-03-14T14:20:00Z',
  },
  {
    id: 'cp-007',
    cardName: '1986 Fleer Michael Jordan RC #57',
    player: 'Michael Jordan',
    year: 1986,
    set: 'Fleer',
    grade: 'PSA 9',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 32000,
    algorithmicPrice: 31000,
    lastSalePrice: 31500,
    priceSpread: 3.2,
    totalVotes: 2876,
    voteBreakdown: { fair: 1438, overvalued: 575, undervalued: 863 },
    sentiment: 'bullish',
    sentimentScore: 70,
    expertConsensus: 33000,
    communityConfidence: 88,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 29500, marketPrice: 29000 },
      { date: '2025-11-01', communityPrice: 30200, marketPrice: 29800 },
      { date: '2025-12-01', communityPrice: 30800, marketPrice: 30200 },
      { date: '2026-01-01', communityPrice: 31200, marketPrice: 30700 },
      { date: '2026-02-01', communityPrice: 31600, marketPrice: 31100 },
      { date: '2026-03-01', communityPrice: 32000, marketPrice: 31500 },
    ],
    lastUpdated: '2026-03-14T21:00:00Z',
  },
  {
    id: 'cp-008',
    cardName: '2022 Bowman Chrome Jasson Dominguez 1st #BCP-1',
    player: 'Jasson Dominguez',
    year: 2022,
    set: 'Bowman Chrome',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 145,
    algorithmicPrice: 160,
    lastSalePrice: 150,
    priceSpread: 10.0,
    totalVotes: 623,
    voteBreakdown: { fair: 187, overvalued: 125, undervalued: 311 },
    sentiment: 'very_bullish',
    sentimentScore: 82,
    expertConsensus: 170,
    communityConfidence: 55,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 110, marketPrice: 120 },
      { date: '2025-11-01', communityPrice: 118, marketPrice: 125 },
      { date: '2025-12-01', communityPrice: 125, marketPrice: 130 },
      { date: '2026-01-01', communityPrice: 132, marketPrice: 138 },
      { date: '2026-02-01', communityPrice: 140, marketPrice: 145 },
      { date: '2026-03-01', communityPrice: 145, marketPrice: 150 },
    ],
    lastUpdated: '2026-03-14T16:00:00Z',
  },
  {
    id: 'cp-009',
    cardName: '2019 Prizm Zion Williamson RC #248',
    player: 'Zion Williamson',
    year: 2019,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 410,
    algorithmicPrice: 380,
    lastSalePrice: 395,
    priceSpread: 7.9,
    totalVotes: 1345,
    voteBreakdown: { fair: 538, overvalued: 538, undervalued: 269 },
    sentiment: 'neutral',
    sentimentScore: 45,
    expertConsensus: 370,
    communityConfidence: 52,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 480, marketPrice: 460 },
      { date: '2025-11-01', communityPrice: 465, marketPrice: 440 },
      { date: '2025-12-01', communityPrice: 445, marketPrice: 420 },
      { date: '2026-01-01', communityPrice: 430, marketPrice: 410 },
      { date: '2026-02-01', communityPrice: 420, marketPrice: 400 },
      { date: '2026-03-01', communityPrice: 410, marketPrice: 395 },
    ],
    lastUpdated: '2026-03-14T11:45:00Z',
  },
  {
    id: 'cp-010',
    cardName: '2021 Topps Chrome Julio Rodriguez RC #27',
    player: 'Julio Rodriguez',
    year: 2021,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 210,
    algorithmicPrice: 195,
    lastSalePrice: 200,
    priceSpread: 7.5,
    totalVotes: 891,
    voteBreakdown: { fair: 445, overvalued: 178, undervalued: 268 },
    sentiment: 'bullish',
    sentimentScore: 66,
    expertConsensus: 215,
    communityConfidence: 71,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 180, marketPrice: 175 },
      { date: '2025-11-01', communityPrice: 188, marketPrice: 180 },
      { date: '2025-12-01', communityPrice: 195, marketPrice: 185 },
      { date: '2026-01-01', communityPrice: 200, marketPrice: 190 },
      { date: '2026-02-01', communityPrice: 205, marketPrice: 195 },
      { date: '2026-03-01', communityPrice: 210, marketPrice: 200 },
    ],
    lastUpdated: '2026-03-14T15:10:00Z',
  },
  {
    id: 'cp-011',
    cardName: '2017 Optic Rated Rookie Patrick Mahomes #177',
    player: 'Patrick Mahomes',
    year: 2017,
    set: 'Donruss Optic',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 1850,
    algorithmicPrice: 1780,
    lastSalePrice: 1800,
    priceSpread: 3.9,
    totalVotes: 2134,
    voteBreakdown: { fair: 1067, overvalued: 427, undervalued: 640 },
    sentiment: 'bullish',
    sentimentScore: 69,
    expertConsensus: 1900,
    communityConfidence: 82,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 1650, marketPrice: 1620 },
      { date: '2025-11-01', communityPrice: 1700, marketPrice: 1660 },
      { date: '2025-12-01', communityPrice: 1750, marketPrice: 1700 },
      { date: '2026-01-01', communityPrice: 1790, marketPrice: 1740 },
      { date: '2026-02-01', communityPrice: 1820, marketPrice: 1770 },
      { date: '2026-03-01', communityPrice: 1850, marketPrice: 1800 },
    ],
    lastUpdated: '2026-03-14T19:45:00Z',
  },
  {
    id: 'cp-012',
    cardName: '2022 Prizm Silver Victor Wembanyama RC #275',
    player: 'Victor Wembanyama',
    year: 2022,
    set: 'Panini Prizm Silver',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 2800,
    algorithmicPrice: 2500,
    lastSalePrice: 2650,
    priceSpread: 12.0,
    totalVotes: 2567,
    voteBreakdown: { fair: 770, overvalued: 513, undervalued: 1284 },
    sentiment: 'very_bullish',
    sentimentScore: 85,
    expertConsensus: 3000,
    communityConfidence: 68,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 1800, marketPrice: 1700 },
      { date: '2025-11-01', communityPrice: 2000, marketPrice: 1900 },
      { date: '2025-12-01', communityPrice: 2200, marketPrice: 2100 },
      { date: '2026-01-01', communityPrice: 2450, marketPrice: 2300 },
      { date: '2026-02-01', communityPrice: 2650, marketPrice: 2500 },
      { date: '2026-03-01', communityPrice: 2800, marketPrice: 2650 },
    ],
    lastUpdated: '2026-03-14T22:00:00Z',
  },
  {
    id: 'cp-013',
    cardName: '2011 Topps Update Mike Trout RC #US175',
    player: 'Mike Trout',
    year: 2011,
    set: 'Topps Update',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 42000,
    algorithmicPrice: 40000,
    lastSalePrice: 41000,
    priceSpread: 4.9,
    totalVotes: 2943,
    voteBreakdown: { fair: 1472, overvalued: 589, undervalued: 882 },
    sentiment: 'bullish',
    sentimentScore: 67,
    expertConsensus: 43000,
    communityConfidence: 86,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 38000, marketPrice: 37500 },
      { date: '2025-11-01', communityPrice: 39200, marketPrice: 38500 },
      { date: '2025-12-01', communityPrice: 40000, marketPrice: 39200 },
      { date: '2026-01-01', communityPrice: 40800, marketPrice: 39800 },
      { date: '2026-02-01', communityPrice: 41500, marketPrice: 40500 },
      { date: '2026-03-01', communityPrice: 42000, marketPrice: 41000 },
    ],
    lastUpdated: '2026-03-14T20:30:00Z',
  },
  {
    id: 'cp-014',
    cardName: '2020 Prizm CeeDee Lamb RC #334',
    player: 'CeeDee Lamb',
    year: 2020,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 155,
    algorithmicPrice: 140,
    lastSalePrice: 148,
    priceSpread: 10.7,
    totalVotes: 678,
    voteBreakdown: { fair: 271, overvalued: 203, undervalued: 204 },
    sentiment: 'neutral',
    sentimentScore: 48,
    expertConsensus: 145,
    communityConfidence: 59,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 130, marketPrice: 125 },
      { date: '2025-11-01', communityPrice: 135, marketPrice: 128 },
      { date: '2025-12-01', communityPrice: 140, marketPrice: 132 },
      { date: '2026-01-01', communityPrice: 145, marketPrice: 138 },
      { date: '2026-02-01', communityPrice: 150, marketPrice: 143 },
      { date: '2026-03-01', communityPrice: 155, marketPrice: 148 },
    ],
    lastUpdated: '2026-03-14T13:15:00Z',
  },
  {
    id: 'cp-015',
    cardName: '2018 Topps Chrome Shohei Ohtani RC #150',
    player: 'Shohei Ohtani',
    year: 2018,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 980,
    algorithmicPrice: 920,
    lastSalePrice: 950,
    priceSpread: 6.5,
    totalVotes: 1567,
    voteBreakdown: { fair: 783, overvalued: 313, undervalued: 471 },
    sentiment: 'bullish',
    sentimentScore: 71,
    expertConsensus: 1000,
    communityConfidence: 78,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 850, marketPrice: 830 },
      { date: '2025-11-01', communityPrice: 880, marketPrice: 860 },
      { date: '2025-12-01', communityPrice: 910, marketPrice: 885 },
      { date: '2026-01-01', communityPrice: 940, marketPrice: 910 },
      { date: '2026-02-01', communityPrice: 960, marketPrice: 930 },
      { date: '2026-03-01', communityPrice: 980, marketPrice: 950 },
    ],
    lastUpdated: '2026-03-14T17:20:00Z',
  },
  {
    id: 'cp-016',
    cardName: '2023 Prizm Caleb Williams RC #301',
    player: 'Caleb Williams',
    year: 2023,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    imageUrl: '',
    communityPrice: 380,
    algorithmicPrice: 340,
    lastSalePrice: 360,
    priceSpread: 11.8,
    totalVotes: 1890,
    voteBreakdown: { fair: 567, overvalued: 756, undervalued: 567 },
    sentiment: 'very_bearish',
    sentimentScore: 22,
    expertConsensus: 310,
    communityConfidence: 42,
    priceHistory: [
      { date: '2025-10-01', communityPrice: 520, marketPrice: 500 },
      { date: '2025-11-01', communityPrice: 490, marketPrice: 470 },
      { date: '2025-12-01', communityPrice: 460, marketPrice: 430 },
      { date: '2026-01-01', communityPrice: 430, marketPrice: 400 },
      { date: '2026-02-01', communityPrice: 405, marketPrice: 380 },
      { date: '2026-03-01', communityPrice: 380, marketPrice: 360 },
    ],
    lastUpdated: '2026-03-14T10:00:00Z',
  },
];

// ---- Mock Data: Community Experts ----

const COMMUNITY_EXPERTS: CommunityExpert[] = [
  {
    id: 'exp-001',
    username: 'CardSharkPro',
    displayName: 'Marcus Chen',
    avatarUrl: '',
    tier: 'platinum',
    accuracy: 94.2,
    totalPredictions: 412,
    profitablePredictions: 388,
    avgReturn: 18.7,
    specialties: ['Basketball RC', 'Prizm', 'Graded Cards'],
    followers: 12450,
    reputation: 9850,
    joinedAt: '2022-03-15',
    recentPicks: [
      { cardName: 'Wembanyama Prizm Silver', prediction: 'Undervalued at $2500', outcome: 'correct' },
      { cardName: 'Doncic Prizm Silver', prediction: 'Hold above $4000', outcome: 'correct' },
      { cardName: 'Morant Mosaic', prediction: 'Sell before $200', outcome: 'pending' },
    ],
  },
  {
    id: 'exp-002',
    username: 'VintageKing',
    displayName: 'Robert Williams',
    avatarUrl: '',
    tier: 'platinum',
    accuracy: 91.8,
    totalPredictions: 356,
    profitablePredictions: 327,
    avgReturn: 22.4,
    specialties: ['Vintage', 'Pre-War', 'HOF Cards'],
    followers: 9870,
    reputation: 9420,
    joinedAt: '2021-11-08',
    recentPicks: [
      { cardName: 'Jordan Fleer PSA 9', prediction: 'Strong buy under $30K', outcome: 'correct' },
      { cardName: 'Trout Update PSA 10', prediction: 'Hold long-term', outcome: 'correct' },
      { cardName: 'Mantle 1952 Topps', prediction: 'Market floor reached', outcome: 'pending' },
    ],
  },
  {
    id: 'exp-003',
    username: 'GridironGuru',
    displayName: 'Sarah Johnson',
    avatarUrl: '',
    tier: 'gold',
    accuracy: 87.5,
    totalPredictions: 289,
    profitablePredictions: 253,
    avgReturn: 15.3,
    specialties: ['Football RC', 'QB Cards', 'Optic'],
    followers: 7650,
    reputation: 8200,
    joinedAt: '2022-06-20',
    recentPicks: [
      { cardName: 'Mahomes Optic PSA 10', prediction: 'Buy under $1800', outcome: 'correct' },
      { cardName: 'Burrow Select PSA 10', prediction: 'Steady climber', outcome: 'correct' },
      { cardName: 'Caleb Williams Prizm', prediction: 'Overvalued above $400', outcome: 'correct' },
    ],
  },
  {
    id: 'exp-004',
    username: 'DiamondHands88',
    displayName: 'Tyler Nakamura',
    avatarUrl: '',
    tier: 'gold',
    accuracy: 85.9,
    totalPredictions: 234,
    profitablePredictions: 201,
    avgReturn: 13.8,
    specialties: ['Baseball', 'Bowman Chrome', 'Prospects'],
    followers: 5430,
    reputation: 7600,
    joinedAt: '2022-09-12',
    recentPicks: [
      { cardName: 'Dominguez Bowman 1st', prediction: 'Sleeper pick', outcome: 'pending' },
      { cardName: 'J-Rod Chrome PSA 10', prediction: 'Trending up', outcome: 'correct' },
      { cardName: 'Ohtani Chrome PSA 10', prediction: 'Fair at $950', outcome: 'correct' },
    ],
  },
  {
    id: 'exp-005',
    username: 'WaxRipper',
    displayName: 'David Park',
    avatarUrl: '',
    tier: 'gold',
    accuracy: 84.1,
    totalPredictions: 198,
    profitablePredictions: 166,
    avgReturn: 11.2,
    specialties: ['Modern Basketball', 'Mosaic', 'Select'],
    followers: 4210,
    reputation: 7100,
    joinedAt: '2023-01-05',
    recentPicks: [
      { cardName: 'Zion Prizm PSA 10', prediction: 'Avoid for now', outcome: 'correct' },
      { cardName: 'Morant Mosaic PSA 10', prediction: 'Wait for dip', outcome: 'pending' },
      { cardName: 'Wemby Select PSA 10', prediction: 'Best rookie play', outcome: 'correct' },
    ],
  },
  {
    id: 'exp-006',
    username: 'MintCondition',
    displayName: 'Jessica Lee',
    avatarUrl: '',
    tier: 'silver',
    accuracy: 79.3,
    totalPredictions: 167,
    profitablePredictions: 132,
    avgReturn: 9.5,
    specialties: ['Grading Arbitrage', 'PSA Crossover', 'SGC'],
    followers: 3150,
    reputation: 5800,
    joinedAt: '2023-04-18',
    recentPicks: [
      { cardName: 'Herbert Prizm PSA 10', prediction: 'Sell at $320', outcome: 'pending' },
      { cardName: 'CeeDee Prizm PSA 10', prediction: 'Hold at $150', outcome: 'correct' },
      { cardName: 'Barkley Optic PSA 10', prediction: 'Cut losses', outcome: 'correct' },
    ],
  },
  {
    id: 'exp-007',
    username: 'ProspectHunter',
    displayName: 'Kevin Martinez',
    avatarUrl: '',
    tier: 'silver',
    accuracy: 77.8,
    totalPredictions: 145,
    profitablePredictions: 113,
    avgReturn: 8.1,
    specialties: ['Prospects', 'Bowman 1st', 'Minor League'],
    followers: 2890,
    reputation: 5200,
    joinedAt: '2023-07-22',
    recentPicks: [
      { cardName: 'Dominguez Bowman 1st', prediction: 'Breakout candidate', outcome: 'pending' },
      { cardName: 'Holliday Bowman 1st', prediction: 'Strong buy', outcome: 'correct' },
      { cardName: 'Leiter Bowman 1st', prediction: 'Wait and see', outcome: 'incorrect' },
    ],
  },
  {
    id: 'exp-008',
    username: 'SilverBullet',
    displayName: 'Amanda Torres',
    avatarUrl: '',
    tier: 'silver',
    accuracy: 76.4,
    totalPredictions: 132,
    profitablePredictions: 101,
    avgReturn: 7.6,
    specialties: ['Parallels', 'Silver Prizm', 'Numbered Cards'],
    followers: 2340,
    reputation: 4900,
    joinedAt: '2023-09-10',
    recentPicks: [
      { cardName: 'Doncic Prizm Silver', prediction: 'Premium justified', outcome: 'correct' },
      { cardName: 'LeBron Chrome Refractor', prediction: 'Trophy card', outcome: 'correct' },
      { cardName: 'Mahomes Silver Prizm', prediction: 'Peak pricing', outcome: 'pending' },
    ],
  },
  {
    id: 'exp-009',
    username: 'FlipKing',
    displayName: 'Chris Wong',
    avatarUrl: '',
    tier: 'bronze',
    accuracy: 72.1,
    totalPredictions: 98,
    profitablePredictions: 71,
    avgReturn: 6.3,
    specialties: ['Short-term Flips', 'Trending', 'Hype Cards'],
    followers: 1780,
    reputation: 3800,
    joinedAt: '2024-01-15',
    recentPicks: [
      { cardName: 'Caleb Williams Prizm', prediction: 'Quick flip at $400', outcome: 'incorrect' },
      { cardName: 'Wemby Prizm Silver', prediction: 'Momentum play', outcome: 'correct' },
      { cardName: 'Stroud Prizm', prediction: 'Buy the hype', outcome: 'correct' },
    ],
  },
  {
    id: 'exp-010',
    username: 'SetBuilder',
    displayName: 'Thomas Grant',
    avatarUrl: '',
    tier: 'bronze',
    accuracy: 70.5,
    totalPredictions: 87,
    profitablePredictions: 61,
    avgReturn: 5.1,
    specialties: ['Set Completion', 'Base Cards', 'Value Picks'],
    followers: 1240,
    reputation: 3200,
    joinedAt: '2024-03-08',
    recentPicks: [
      { cardName: 'J-Rod Chrome Base', prediction: 'Solid base pickup', outcome: 'correct' },
      { cardName: 'Ohtani Update Base', prediction: 'Budget friendly', outcome: 'correct' },
      { cardName: 'Trout Update Raw', prediction: 'Grade and flip', outcome: 'pending' },
    ],
  },
  {
    id: 'exp-011',
    username: 'GradeGuru',
    displayName: 'Natalie Simmons',
    avatarUrl: '',
    tier: 'bronze',
    accuracy: 68.9,
    totalPredictions: 76,
    profitablePredictions: 52,
    avgReturn: 4.8,
    specialties: ['BGS', 'Grading Trends', 'Sub-grades'],
    followers: 980,
    reputation: 2800,
    joinedAt: '2024-05-20',
    recentPicks: [
      { cardName: 'Mahomes BGS 9.5', prediction: 'Crossover to PSA', outcome: 'correct' },
      { cardName: 'Herbert BGS 10', prediction: 'Premium for Black Label', outcome: 'pending' },
      { cardName: 'LeBron BGS 9.5', prediction: 'Undervalued vs PSA 10', outcome: 'correct' },
    ],
  },
  {
    id: 'exp-012',
    username: 'HoopDreams',
    displayName: 'Derek Thompson',
    avatarUrl: '',
    tier: 'bronze',
    accuracy: 67.3,
    totalPredictions: 65,
    profitablePredictions: 44,
    avgReturn: 3.9,
    specialties: ['NBA Rookies', 'Draft Class', 'Emerging Stars'],
    followers: 720,
    reputation: 2400,
    joinedAt: '2024-08-14',
    recentPicks: [
      { cardName: 'Wemby Prizm Base', prediction: 'Good entry point', outcome: 'correct' },
      { cardName: 'Chet Prizm PSA 10', prediction: 'Sleeper', outcome: 'incorrect' },
      { cardName: 'Ant-Man Select', prediction: 'Rising star', outcome: 'correct' },
    ],
  },
];

// ---- Mock Data: Sentiment Polls ----

const SENTIMENT_POLLS: SentimentPoll[] = [
  {
    id: 'poll-001',
    question: 'Where is Wembanyama\'s Prizm Silver heading by end of 2026?',
    cardName: '2022 Prizm Silver Victor Wembanyama RC',
    player: 'Victor Wembanyama',
    options: [
      { label: 'Above $5,000', votes: 1245, percentage: 34.2 },
      { label: '$3,500 - $5,000', votes: 1089, percentage: 29.9 },
      { label: '$2,500 - $3,500', votes: 823, percentage: 22.6 },
      { label: 'Below $2,500', votes: 483, percentage: 13.3 },
    ],
    totalVotes: 3640,
    createdAt: '2026-03-10T10:00:00Z',
    expiresAt: '2026-03-20T10:00:00Z',
    isActive: true,
  },
  {
    id: 'poll-002',
    question: 'Is the LeBron Topps Chrome PSA 10 a good buy right now?',
    cardName: '2003 Topps Chrome LeBron James RC #111',
    player: 'LeBron James',
    options: [
      { label: 'Strong Buy', votes: 2156, percentage: 38.5 },
      { label: 'Hold', votes: 1890, percentage: 33.7 },
      { label: 'Wait for Dip', votes: 1123, percentage: 20.0 },
      { label: 'Sell', votes: 436, percentage: 7.8 },
    ],
    totalVotes: 5605,
    createdAt: '2026-03-08T14:00:00Z',
    expiresAt: '2026-03-18T14:00:00Z',
    isActive: true,
  },
  {
    id: 'poll-003',
    question: 'Best football RC investment for 2026?',
    cardName: null,
    player: null,
    options: [
      { label: 'Patrick Mahomes', votes: 3421, percentage: 31.8 },
      { label: 'Joe Burrow', votes: 2876, percentage: 26.7 },
      { label: 'Caleb Williams', votes: 1543, percentage: 14.3 },
      { label: 'CJ Stroud', votes: 1678, percentage: 15.6 },
      { label: 'Other', votes: 1245, percentage: 11.6 },
    ],
    totalVotes: 10763,
    createdAt: '2026-03-05T08:00:00Z',
    expiresAt: '2026-03-15T08:00:00Z',
    isActive: true,
  },
  {
    id: 'poll-004',
    question: 'What grading company do you trust most for modern cards?',
    cardName: null,
    player: null,
    options: [
      { label: 'PSA', votes: 6543, percentage: 52.1 },
      { label: 'BGS/Beckett', votes: 2890, percentage: 23.0 },
      { label: 'SGC', votes: 2123, percentage: 16.9 },
      { label: 'CGC', votes: 1005, percentage: 8.0 },
    ],
    totalVotes: 12561,
    createdAt: '2026-03-01T12:00:00Z',
    expiresAt: '2026-03-15T12:00:00Z',
    isActive: true,
  },
  {
    id: 'poll-005',
    question: 'Will Caleb Williams Prizm RC recover above $500?',
    cardName: '2023 Prizm Caleb Williams RC #301',
    player: 'Caleb Williams',
    options: [
      { label: 'Yes, within 6 months', votes: 876, percentage: 18.4 },
      { label: 'Yes, within a year', votes: 1234, percentage: 25.9 },
      { label: 'No, will stay flat', votes: 1543, percentage: 32.4 },
      { label: 'No, will drop further', votes: 1112, percentage: 23.3 },
    ],
    totalVotes: 4765,
    createdAt: '2026-03-12T16:00:00Z',
    expiresAt: '2026-03-22T16:00:00Z',
    isActive: true,
  },
  {
    id: 'poll-006',
    question: 'Which sport has the best ROI for rookie cards right now?',
    cardName: null,
    player: null,
    options: [
      { label: 'Basketball', votes: 4321, percentage: 36.8 },
      { label: 'Football', votes: 3456, percentage: 29.4 },
      { label: 'Baseball', votes: 2789, percentage: 23.7 },
      { label: 'Soccer/Other', votes: 1190, percentage: 10.1 },
    ],
    totalVotes: 11756,
    createdAt: '2026-02-28T10:00:00Z',
    expiresAt: '2026-03-14T10:00:00Z',
    isActive: false,
  },
  {
    id: 'poll-007',
    question: 'Michael Jordan Fleer RC: Has it bottomed out?',
    cardName: '1986 Fleer Michael Jordan RC #57',
    player: 'Michael Jordan',
    options: [
      { label: 'Yes, buy now', votes: 3678, percentage: 42.1 },
      { label: 'Close to bottom', votes: 2345, percentage: 26.8 },
      { label: 'More downside ahead', votes: 1567, percentage: 17.9 },
      { label: 'Too expensive regardless', votes: 1150, percentage: 13.2 },
    ],
    totalVotes: 8740,
    createdAt: '2026-02-25T09:00:00Z',
    expiresAt: '2026-03-11T09:00:00Z',
    isActive: false,
  },
  {
    id: 'poll-008',
    question: 'Ohtani Chrome PSA 10: Fair price or overvalued?',
    cardName: '2018 Topps Chrome Shohei Ohtani RC #150',
    player: 'Shohei Ohtani',
    options: [
      { label: 'Undervalued below $1000', votes: 2456, percentage: 35.8 },
      { label: 'Fair at current price', votes: 2123, percentage: 30.9 },
      { label: 'Slightly overvalued', votes: 1345, percentage: 19.6 },
      { label: 'Significantly overvalued', votes: 940, percentage: 13.7 },
    ],
    totalVotes: 6864,
    createdAt: '2026-03-11T11:00:00Z',
    expiresAt: '2026-03-21T11:00:00Z',
    isActive: true,
  },
];

// ---- Mock Data: Price Votes ----

const PRICE_VOTES: PriceVote[] = [
  {
    id: 'vote-001',
    cardId: 'cp-012',
    userId: 'u-001',
    username: 'CardSharkPro',
    vote: 'undervalued',
    priceEstimate: 3200,
    reasoning: 'Wemby is a generational talent. Once he leads the Spurs to the playoffs, this card will skyrocket past $5K.',
    timestamp: '2026-03-14T22:15:00Z',
    upvotes: 234,
    expertTier: 'platinum',
  },
  {
    id: 'vote-002',
    cardId: 'cp-012',
    userId: 'u-002',
    username: 'VintageKing',
    vote: 'fair_price',
    priceEstimate: 2800,
    reasoning: 'Market is properly pricing in the hype. Strong hold but don\'t overpay at this level.',
    timestamp: '2026-03-14T21:30:00Z',
    upvotes: 189,
    expertTier: 'platinum',
  },
  {
    id: 'vote-003',
    cardId: 'cp-002',
    userId: 'u-002',
    username: 'VintageKing',
    vote: 'undervalued',
    priceEstimate: 55000,
    reasoning: 'LeBron is the GOAT debate card. As he approaches retirement, prices will only go up. This is a legacy card.',
    timestamp: '2026-03-14T20:45:00Z',
    upvotes: 312,
    expertTier: 'platinum',
  },
  {
    id: 'vote-004',
    cardId: 'cp-011',
    userId: 'u-003',
    username: 'GridironGuru',
    vote: 'undervalued',
    priceEstimate: 2000,
    reasoning: 'Mahomes still has years of elite play ahead. This card has massive upside if he wins another Super Bowl.',
    timestamp: '2026-03-14T19:50:00Z',
    upvotes: 156,
    expertTier: 'gold',
  },
  {
    id: 'vote-005',
    cardId: 'cp-016',
    userId: 'u-003',
    username: 'GridironGuru',
    vote: 'overvalued',
    priceEstimate: 280,
    reasoning: 'Caleb Williams hasn\'t proven he can be a franchise QB yet. The Bears offense needs major fixes. Sell into any rally.',
    timestamp: '2026-03-14T18:30:00Z',
    upvotes: 198,
    expertTier: 'gold',
  },
  {
    id: 'vote-006',
    cardId: 'cp-001',
    userId: 'u-001',
    username: 'CardSharkPro',
    vote: 'fair_price',
    priceEstimate: 4300,
    reasoning: 'Luka is consistently elite. This card is a cornerstone holding. Fair value with slight upside.',
    timestamp: '2026-03-14T17:15:00Z',
    upvotes: 145,
    expertTier: 'platinum',
  },
  {
    id: 'vote-007',
    cardId: 'cp-007',
    userId: 'u-002',
    username: 'VintageKing',
    vote: 'undervalued',
    priceEstimate: 35000,
    reasoning: 'The Jordan Fleer is the hobby\'s Mona Lisa. Even a PSA 9 will always command premium. Generational buy.',
    timestamp: '2026-03-14T16:00:00Z',
    upvotes: 267,
    expertTier: 'platinum',
  },
  {
    id: 'vote-008',
    cardId: 'cp-003',
    userId: 'u-006',
    username: 'MintCondition',
    vote: 'overvalued',
    priceEstimate: 260,
    reasoning: 'Herbert\'s ceiling is capped by the Chargers. Too many PSA 10s in the pop report. Fair value is closer to $250.',
    timestamp: '2026-03-14T15:20:00Z',
    upvotes: 87,
    expertTier: 'silver',
  },
  {
    id: 'vote-009',
    cardId: 'cp-008',
    userId: 'u-004',
    username: 'DiamondHands88',
    vote: 'undervalued',
    priceEstimate: 180,
    reasoning: 'Dominguez is the real deal. Once he gets a full healthy season, this card will double.',
    timestamp: '2026-03-14T14:45:00Z',
    upvotes: 112,
    expertTier: 'gold',
  },
  {
    id: 'vote-010',
    cardId: 'cp-015',
    userId: 'u-004',
    username: 'DiamondHands88',
    vote: 'undervalued',
    priceEstimate: 1100,
    reasoning: 'Ohtani is a once-in-a-generation player. His Chrome RC should be north of $1K easily. Dodgers exposure adds value.',
    timestamp: '2026-03-14T13:30:00Z',
    upvotes: 134,
    expertTier: 'gold',
  },
  {
    id: 'vote-011',
    cardId: 'cp-009',
    userId: 'u-005',
    username: 'WaxRipper',
    vote: 'overvalued',
    priceEstimate: 350,
    reasoning: 'Zion\'s injury history is a massive red flag. The market hasn\'t fully priced in the risk. I\'d sell here.',
    timestamp: '2026-03-14T12:15:00Z',
    upvotes: 176,
    expertTier: 'gold',
  },
  {
    id: 'vote-012',
    cardId: 'cp-013',
    userId: 'u-002',
    username: 'VintageKing',
    vote: 'fair_price',
    priceEstimate: 42000,
    reasoning: 'Trout Update PSA 10 is a blue chip. Fair value around $42K. Won\'t see massive spikes but steady appreciation.',
    timestamp: '2026-03-14T11:00:00Z',
    upvotes: 203,
    expertTier: 'platinum',
  },
  {
    id: 'vote-013',
    cardId: 'cp-006',
    userId: 'u-003',
    username: 'GridironGuru',
    vote: 'undervalued',
    priceEstimate: 300,
    reasoning: 'Burrow is the best young QB in football. His Select RC at $275 is a steal. Buy before the next playoff run.',
    timestamp: '2026-03-14T10:30:00Z',
    upvotes: 98,
    expertTier: 'gold',
  },
  {
    id: 'vote-014',
    cardId: 'cp-010',
    userId: 'u-007',
    username: 'ProspectHunter',
    vote: 'undervalued',
    priceEstimate: 240,
    reasoning: 'J-Rod is an emerging superstar in Seattle. His Chrome RC is underappreciated relative to his talent level.',
    timestamp: '2026-03-14T09:45:00Z',
    upvotes: 67,
    expertTier: 'silver',
  },
  {
    id: 'vote-015',
    cardId: 'cp-005',
    userId: 'u-006',
    username: 'MintCondition',
    vote: 'overvalued',
    priceEstimate: 70,
    reasoning: 'Barkley is past his prime. The Eagles move helped but this card is a sell. Too much competition in the pop.',
    timestamp: '2026-03-14T09:00:00Z',
    upvotes: 54,
    expertTier: 'silver',
  },
  {
    id: 'vote-016',
    cardId: 'cp-014',
    userId: 'u-009',
    username: 'FlipKing',
    vote: 'fair_price',
    priceEstimate: 155,
    reasoning: 'CeeDee is a top-5 WR. His Prizm PSA 10 at $155 is reasonable. Could go either way from here.',
    timestamp: '2026-03-13T22:30:00Z',
    upvotes: 43,
    expertTier: 'bronze',
  },
  {
    id: 'vote-017',
    cardId: 'cp-012',
    userId: 'u-005',
    username: 'WaxRipper',
    vote: 'undervalued',
    priceEstimate: 3500,
    reasoning: 'Wemby is the future of the NBA. His defensive stats alone justify a higher valuation. Buy and hold.',
    timestamp: '2026-03-13T21:15:00Z',
    upvotes: 189,
    expertTier: 'gold',
  },
  {
    id: 'vote-018',
    cardId: 'cp-004',
    userId: 'u-012',
    username: 'HoopDreams',
    vote: 'undervalued',
    priceEstimate: 220,
    reasoning: 'Ja Morant is electric when healthy. The Mosaic PSA 10 at $185 is a bargain if he stays on the court.',
    timestamp: '2026-03-13T20:00:00Z',
    upvotes: 56,
    expertTier: 'bronze',
  },
  {
    id: 'vote-019',
    cardId: 'cp-011',
    userId: 'u-008',
    username: 'SilverBullet',
    vote: 'fair_price',
    priceEstimate: 1850,
    reasoning: 'Mahomes Optic is correctly priced. The market has found equilibrium here. Neither a screaming buy nor sell.',
    timestamp: '2026-03-13T18:45:00Z',
    upvotes: 78,
    expertTier: 'silver',
  },
  {
    id: 'vote-020',
    cardId: 'cp-016',
    userId: 'u-009',
    username: 'FlipKing',
    vote: 'overvalued',
    priceEstimate: 300,
    reasoning: 'Caleb Williams hype is dying fast. The Bears need to show improvement before this card stabilizes. Sell.',
    timestamp: '2026-03-13T17:30:00Z',
    upvotes: 123,
    expertTier: 'bronze',
  },
  {
    id: 'vote-021',
    cardId: 'cp-007',
    userId: 'u-001',
    username: 'CardSharkPro',
    vote: 'fair_price',
    priceEstimate: 32500,
    reasoning: 'The Jordan Fleer PSA 9 at $32K is fair. It\'s a grail card with proven track record. Safe long-term hold.',
    timestamp: '2026-03-13T16:15:00Z',
    upvotes: 201,
    expertTier: 'platinum',
  },
  {
    id: 'vote-022',
    cardId: 'cp-015',
    userId: 'u-010',
    username: 'SetBuilder',
    vote: 'fair_price',
    priceEstimate: 975,
    reasoning: 'Ohtani Chrome at $980 seems fair. Great two-way player but the Chrome base has high pop count.',
    timestamp: '2026-03-13T15:00:00Z',
    upvotes: 34,
    expertTier: 'bronze',
  },
  {
    id: 'vote-023',
    cardId: 'cp-002',
    userId: 'u-001',
    username: 'CardSharkPro',
    vote: 'undervalued',
    priceEstimate: 56000,
    reasoning: 'LeBron Chrome PSA 10 is a generational asset. When he retires, expect a massive spike. Load up now.',
    timestamp: '2026-03-13T14:00:00Z',
    upvotes: 287,
    expertTier: 'platinum',
  },
  {
    id: 'vote-024',
    cardId: 'cp-013',
    userId: 'u-004',
    username: 'DiamondHands88',
    vote: 'undervalued',
    priceEstimate: 45000,
    reasoning: 'Trout\'s legacy is cemented. His Update RC PSA 10 should be closer to $45K. Injuries have suppressed the price.',
    timestamp: '2026-03-13T12:30:00Z',
    upvotes: 145,
    expertTier: 'gold',
  },
  {
    id: 'vote-025',
    cardId: 'cp-006',
    userId: 'u-008',
    username: 'SilverBullet',
    vote: 'fair_price',
    priceEstimate: 275,
    reasoning: 'Burrow Select at $275 is fair. He\'s proven but the Bengals need to build around him better.',
    timestamp: '2026-03-13T11:15:00Z',
    upvotes: 61,
    expertTier: 'silver',
  },
  {
    id: 'vote-026',
    cardId: 'cp-001',
    userId: 'u-005',
    username: 'WaxRipper',
    vote: 'undervalued',
    priceEstimate: 4500,
    reasoning: 'Luka is a perennial MVP candidate. His Prizm Silver should command a premium over $4500.',
    timestamp: '2026-03-13T10:00:00Z',
    upvotes: 112,
    expertTier: 'gold',
  },
];

// ---- Mock Data: Trending Cards ----

const TRENDING_CARDS: TrendingCard[] = [
  {
    cardName: '2022 Prizm Silver Victor Wembanyama RC',
    player: 'Victor Wembanyama',
    mentions: 4567,
    sentimentChange: 12.5,
    priceChange: 15.2,
    communityBuzz: 98,
    topReason: 'Historic rookie season stats driving massive community excitement',
  },
  {
    cardName: '2023 Prizm Caleb Williams RC',
    player: 'Caleb Williams',
    mentions: 3890,
    sentimentChange: -18.3,
    priceChange: -12.1,
    communityBuzz: 92,
    topReason: 'Disappointing Bears season fueling sell-off debate',
  },
  {
    cardName: '2003 Topps Chrome LeBron James RC',
    player: 'LeBron James',
    mentions: 3245,
    sentimentChange: 5.2,
    priceChange: 3.8,
    communityBuzz: 87,
    topReason: 'Retirement rumors increasing legacy premium discussion',
  },
  {
    cardName: '2018 Topps Chrome Shohei Ohtani RC',
    player: 'Shohei Ohtani',
    mentions: 2876,
    sentimentChange: 8.1,
    priceChange: 6.5,
    communityBuzz: 84,
    topReason: 'Dodgers World Series contention boosting demand',
  },
  {
    cardName: '2017 Optic Rated Rookie Patrick Mahomes',
    player: 'Patrick Mahomes',
    mentions: 2654,
    sentimentChange: 4.3,
    priceChange: 2.8,
    communityBuzz: 81,
    topReason: 'Dynasty QB premium continues to grow',
  },
  {
    cardName: '1986 Fleer Michael Jordan RC',
    player: 'Michael Jordan',
    mentions: 2345,
    sentimentChange: 2.1,
    priceChange: 1.6,
    communityBuzz: 78,
    topReason: 'New documentary driving collector nostalgia',
  },
  {
    cardName: '2019 Prizm Zion Williamson RC',
    player: 'Zion Williamson',
    mentions: 2123,
    sentimentChange: -8.7,
    priceChange: -5.4,
    communityBuzz: 75,
    topReason: 'Ongoing injury concerns dividing the community',
  },
  {
    cardName: '2022 Bowman Chrome Jasson Dominguez 1st',
    player: 'Jasson Dominguez',
    mentions: 1987,
    sentimentChange: 15.3,
    priceChange: 10.2,
    communityBuzz: 72,
    topReason: 'Spring training performance generating prospect buzz',
  },
  {
    cardName: '2011 Topps Update Mike Trout RC',
    player: 'Mike Trout',
    mentions: 1876,
    sentimentChange: 1.8,
    priceChange: 2.4,
    communityBuzz: 69,
    topReason: 'Blue chip status maintaining steady collector interest',
  },
  {
    cardName: '2021 Topps Chrome Julio Rodriguez RC',
    player: 'Julio Rodriguez',
    mentions: 1654,
    sentimentChange: 7.2,
    priceChange: 5.0,
    communityBuzz: 66,
    topReason: 'Extension deal and MVP-caliber performance',
  },
  {
    cardName: '2020 Select Joe Burrow RC',
    player: 'Joe Burrow',
    mentions: 1543,
    sentimentChange: 3.9,
    priceChange: 2.6,
    communityBuzz: 63,
    topReason: 'Bengals playoff push creating steady demand',
  },
];

// ---- localStorage Persistence Helpers ----

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(`${STORAGE_PREFIX}_${key}`, fallback);
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(`${STORAGE_PREFIX}_${key}`, data);
}

// ---- Exported Functions ----

export function getConsensusPrices(): ConsensusPrice[] {
  return loadFromStorage<ConsensusPrice[]>('prices', CONSENSUS_PRICES);
}

export function getCommunityExperts(): CommunityExpert[] {
  return loadFromStorage<CommunityExpert[]>('experts', COMMUNITY_EXPERTS);
}

export function getTopExperts(): CommunityExpert[] {
  const experts = getCommunityExperts();
  return [...experts]
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 6);
}

export function getSentimentPolls(): SentimentPoll[] {
  return loadFromStorage<SentimentPoll[]>('polls', SENTIMENT_POLLS);
}

export function getActivePolls(): SentimentPoll[] {
  const polls = getSentimentPolls();
  return polls.filter(p => p.isActive);
}

export function getPriceVotes(cardId?: string): PriceVote[] {
  const votes = loadFromStorage<PriceVote[]>('votes', PRICE_VOTES);
  if (cardId) return votes.filter(v => v.cardId === cardId);
  return votes;
}

export function getTrendingCards(): TrendingCard[] {
  return loadFromStorage<TrendingCard[]>('trending', TRENDING_CARDS);
}

export function getConsensusSummary(): ConsensusSummary {
  const prices = getConsensusPrices();
  const experts = getCommunityExperts();
  const votes = getPriceVotes();

  const totalVotesThisWeek = votes.filter(v => {
    const voteDate = new Date(v.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return voteDate >= weekAgo;
  }).length;

  const avgAccuracy = experts.reduce((sum, e) => sum + e.accuracy, 0) / experts.length;
  const topExpertAccuracy = Math.max(...experts.map(e => e.accuracy));

  const communityVsMarketDeltas = prices.map(p =>
    ((p.communityPrice - p.lastSalePrice) / p.lastSalePrice) * 100
  );
  const avgDelta = communityVsMarketDeltas.reduce((s, d) => s + d, 0) / communityVsMarketDeltas.length;

  const sentimentScores = prices.map(p => p.sentimentScore);
  const avgSentiment = sentimentScores.reduce((s, v) => s + v, 0) / sentimentScores.length;

  let trendingSentiment: SentimentLevel;
  if (avgSentiment >= 75) trendingSentiment = 'very_bullish';
  else if (avgSentiment >= 60) trendingSentiment = 'bullish';
  else if (avgSentiment >= 40) trendingSentiment = 'neutral';
  else if (avgSentiment >= 25) trendingSentiment = 'bearish';
  else trendingSentiment = 'very_bearish';

  const mostDebated = [...prices]
    .sort((a, b) => b.priceSpread - a.priceSpread)
    .slice(0, 5)
    .map(p => ({ cardName: p.cardName, voteSpread: p.priceSpread }));

  return {
    totalCardsTracked: prices.length,
    activeVoters: experts.length * 18,
    avgCommunityAccuracy: Math.round(avgAccuracy * 10) / 10,
    communityVsMarketDelta: Math.round(avgDelta * 100) / 100,
    topExpertAccuracy,
    totalVotesThisWeek,
    trendingSentiment,
    mostDebated,
  };
}

export function castVote(cardId: string, vote: VoteType, estimate: number): void {
  const votes = getPriceVotes();
  const newVote: PriceVote = {
    id: `vote-${Date.now()}`,
    cardId,
    userId: 'u-current',
    username: 'You',
    vote,
    priceEstimate: estimate,
    reasoning: '',
    timestamp: new Date().toISOString(),
    upvotes: 0,
    expertTier: null,
  };
  votes.unshift(newVote);
  saveToStorage('votes', votes);
}

export function getSentimentColor(sentiment: SentimentLevel): string {
  switch (sentiment) {
    case 'very_bullish': return '#10b981';
    case 'bullish': return '#34d399';
    case 'neutral': return '#f59e0b';
    case 'bearish': return '#f87171';
    case 'very_bearish': return '#ef4444';
  }
}

export function getSentimentLabel(sentiment: SentimentLevel): string {
  switch (sentiment) {
    case 'very_bullish': return 'Very Bullish';
    case 'bullish': return 'Bullish';
    case 'neutral': return 'Neutral';
    case 'bearish': return 'Bearish';
    case 'very_bearish': return 'Very Bearish';
  }
}

export function getTierColor(tier: ExpertTier): string {
  switch (tier) {
    case 'platinum': return '#e5e7eb';
    case 'gold': return '#fbbf24';
    case 'silver': return '#9ca3af';
    case 'bronze': return '#d97706';
  }
}

export function getTierLabel(tier: ExpertTier): string {
  switch (tier) {
    case 'platinum': return 'Platinum';
    case 'gold': return 'Gold';
    case 'silver': return 'Silver';
    case 'bronze': return 'Bronze';
  }
}

export function formatCurrency(n: number): string {
  if (n >= 1000) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return '$' + n.toFixed(0);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
