// ─── Social Trading & Community Picks Service ─── Phase 153 ───

// ─── Types ───────────────────────────────────────────────────

export interface TopTrader {
  id: string;
  username: string;
  verified: boolean;
  totalPicks: number;
  winRate: number;
  avgReturn: number;
  totalProfit: number;
  followers: number;
  currentStreak: number;
  reputationScore: number;
  joinDate: string;
  specialty: string;
}

export interface TradePick {
  id: string;
  traderName: string;
  cardName: string;
  type: 'buy' | 'sell' | 'hold';
  reasoning: string;
  targetPrice: number;
  currentPrice: number;
  timestamp: string;
  upvotes: number;
  outcome: 'win' | 'loss' | 'pending';
  result: 'win' | 'loss' | null;
}

export interface SentimentEntry {
  label: string;
  value: number;
}

export interface TraderPerformancePoint {
  traderName: string;
  wins: number;
  losses: number;
  pending: number;
}

export interface CommunityPoll {
  id: string;
  question: string;
  options: { label: string; votes: number }[];
  status: 'active' | 'closed';
  endDate: string;
  totalVotes: number;
}

export interface TradingChallenge {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'upcoming' | 'completed';
  participants: number;
  prizePool: number;
  duration: string;
  leader: string | null;
  startDate: string;
  endDate: string;
}

export interface MarketConsensusItem {
  cardName: string;
  consensus: 'bullish' | 'bearish' | 'neutral';
  currentPrice: number;
  targetPrice: number;
  confidence: number;
  contributors: number;
  bullishPercent: number;
}

export interface StreakRecord {
  traderName: string;
  type: 'win' | 'loss';
  streakLength: number;
  profitDuring: number;
  startDate: string;
  active: boolean;
}

export interface ActiveTrader {
  id: string;
  username: string;
  roiPercent: number;
  followers: number;
}

export interface DailyPick {
  cardName: string;
  type: string;
  outcome: 'win' | 'loss' | 'pending';
}

export interface TradingStats {
  communityProfit: number;
  accuracy: number;
  activeTraders: number;
  totalPicks: number;
}

export interface SocialTradingSummary {
  activeTraders: number;
  totalPicks: number;
  avgWinRate: number;
  totalCommunityProfit: number;
  activePolls: number;
  activeChallenges: number;
}

// ─── Storage ─────────────────────────────────────────────────

const STORAGE_KEY = 'social_trading_data';

function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveData<T>(key: string, data: T): void {
  try { localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data)); } catch {}
}

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_TOP_TRADERS: TopTrader[] = [
  { id: 'T1', username: 'CardShark_Alpha', verified: true, totalPicks: 342, winRate: 78, avgReturn: 14.2, totalProfit: 48650, followers: 12400, currentStreak: 8, reputationScore: 96, joinDate: '2023-01-15', specialty: 'Rookie Cards' },
  { id: 'T2', username: 'WaxRipper_Pro', verified: true, totalPicks: 287, winRate: 72, avgReturn: 11.8, totalProfit: 39200, followers: 8900, currentStreak: 5, reputationScore: 92, joinDate: '2023-03-22', specialty: 'Box Breaks' },
  { id: 'T3', username: 'VintageVault', verified: true, totalPicks: 198, winRate: 81, avgReturn: 18.4, totalProfit: 52300, followers: 15200, currentStreak: 12, reputationScore: 98, joinDate: '2022-11-08', specialty: 'Vintage Pre-War' },
  { id: 'T4', username: 'GradeHunter99', verified: false, totalPicks: 256, winRate: 65, avgReturn: 8.7, totalProfit: 22100, followers: 4300, currentStreak: 3, reputationScore: 78, joinDate: '2023-06-14', specialty: 'PSA Submissions' },
  { id: 'T5', username: 'ProspectKing', verified: true, totalPicks: 412, winRate: 69, avgReturn: 10.3, totalProfit: 35800, followers: 11200, currentStreak: -2, reputationScore: 88, joinDate: '2022-09-01', specialty: 'Prospects' },
  { id: 'T6', username: 'SlabQueen', verified: true, totalPicks: 178, winRate: 84, avgReturn: 22.1, totalProfit: 61400, followers: 18500, currentStreak: 15, reputationScore: 99, joinDate: '2022-07-20', specialty: 'High-End Slabs' },
  { id: 'T7', username: 'FlipMaster_X', verified: false, totalPicks: 523, winRate: 61, avgReturn: 6.2, totalProfit: 18900, followers: 3200, currentStreak: -4, reputationScore: 65, joinDate: '2023-08-11', specialty: 'Quick Flips' },
  { id: 'T8', username: 'DiamondDealer', verified: true, totalPicks: 145, winRate: 76, avgReturn: 15.6, totalProfit: 28700, followers: 7600, currentStreak: 6, reputationScore: 90, joinDate: '2023-02-28', specialty: 'Baseball' },
  { id: 'T9', username: 'HoopDreams_Inv', verified: false, totalPicks: 389, winRate: 67, avgReturn: 9.1, totalProfit: 24500, followers: 5800, currentStreak: 1, reputationScore: 82, joinDate: '2023-04-05', specialty: 'Basketball' },
  { id: 'T10', username: 'GridironGuru', verified: true, totalPicks: 267, winRate: 73, avgReturn: 12.9, totalProfit: 33100, followers: 9400, currentStreak: 7, reputationScore: 91, joinDate: '2022-12-19', specialty: 'Football' },
  { id: 'T11', username: 'PatchCollector', verified: false, totalPicks: 134, winRate: 58, avgReturn: 5.4, totalProfit: 8200, followers: 1900, currentStreak: -1, reputationScore: 55, joinDate: '2024-01-10', specialty: 'Patch Cards' },
  { id: 'T12', username: 'AutoKingPin', verified: true, totalPicks: 312, winRate: 71, avgReturn: 11.0, totalProfit: 31500, followers: 8100, currentStreak: 4, reputationScore: 87, joinDate: '2023-05-17', specialty: 'Autographs' },
];

const MOCK_TRADE_PICKS: TradePick[] = [
  { id: 'P1', traderName: 'SlabQueen', cardName: '2023 Topps Chrome Victor Wembanyama RC PSA 10', type: 'buy', reasoning: 'Wemby ROTY lock, Chrome PSA 10 supply constrained. Target $2,500 by playoffs.', targetPrice: 2500, currentPrice: 1850, timestamp: '2025-12-14T09:30:00Z', upvotes: 342, outcome: 'pending', result: null },
  { id: 'P2', traderName: 'CardShark_Alpha', cardName: '2024 Bowman 1st Ethan Salas Auto', type: 'buy', reasoning: 'Top prospect in baseball, Padres fast-tracking. Buy before call-up hype.', targetPrice: 800, currentPrice: 420, timestamp: '2025-12-14T08:15:00Z', upvotes: 218, outcome: 'pending', result: null },
  { id: 'P3', traderName: 'VintageVault', cardName: '1952 Topps Mickey Mantle #311 PSA 4', type: 'hold', reasoning: 'Blue-chip vintage. Not selling below $180k. Market bottomed.', targetPrice: 220000, currentPrice: 175000, timestamp: '2025-12-13T22:00:00Z', upvotes: 567, outcome: 'pending', result: null },
  { id: 'P4', traderName: 'FlipMaster_X', cardName: '2024 Prizm Caleb Williams Silver PSA 10', type: 'sell', reasoning: 'Williams struggling. Sell before value drops further. Lock in profits.', targetPrice: 120, currentPrice: 185, timestamp: '2025-12-13T18:45:00Z', upvotes: 89, outcome: 'win', result: 'win' },
  { id: 'P5', traderName: 'ProspectKing', cardName: '2024 Bowman Chrome Travis Bazzana 1st Auto', type: 'buy', reasoning: '#1 overall pick, advanced bat. Will be in MLB by June.', targetPrice: 650, currentPrice: 380, timestamp: '2025-12-13T16:20:00Z', upvotes: 176, outcome: 'pending', result: null },
  { id: 'P6', traderName: 'GridironGuru', cardName: '2023 National Treasures CJ Stroud RPA /99', type: 'buy', reasoning: 'Texans deep playoff run incoming. RPA will spike with wins.', targetPrice: 4500, currentPrice: 3200, timestamp: '2025-12-13T14:10:00Z', upvotes: 298, outcome: 'win', result: 'win' },
  { id: 'P7', traderName: 'DiamondDealer', cardName: '2024 Topps Chrome Shohei Ohtani SP Refractor', type: 'buy', reasoning: 'Dodgers World Series hangover lifting. Ohtani SPs always bounce back.', targetPrice: 350, currentPrice: 240, timestamp: '2025-12-12T20:30:00Z', upvotes: 412, outcome: 'win', result: 'win' },
  { id: 'P8', traderName: 'HoopDreams_Inv', cardName: '2024 Prizm Zach Edey RC Silver', type: 'sell', reasoning: 'Edey production declining. Sell into any bounce. Prospects fading.', targetPrice: 25, currentPrice: 45, timestamp: '2025-12-12T15:00:00Z', upvotes: 56, outcome: 'loss', result: 'loss' },
  { id: 'P9', traderName: 'WaxRipper_Pro', cardName: '2024 Topps Series 1 Hobby Box', type: 'buy', reasoning: 'Best value in sealed right now. SP checklist is loaded.', targetPrice: 140, currentPrice: 95, timestamp: '2025-12-12T11:45:00Z', upvotes: 134, outcome: 'win', result: 'win' },
  { id: 'P10', traderName: 'AutoKingPin', cardName: '2023 Flawless Luka Doncic Auto /25', type: 'hold', reasoning: 'Luka finals appearance coming. Hold until Mavs deep run.', targetPrice: 8000, currentPrice: 5200, timestamp: '2025-12-11T19:00:00Z', upvotes: 389, outcome: 'pending', result: null },
  { id: 'P11', traderName: 'CardShark_Alpha', cardName: '2024 Select Jayden Daniels Concourse RC', type: 'buy', reasoning: 'OROY front-runner. Commanders playoff push will spike all his cards.', targetPrice: 80, currentPrice: 42, timestamp: '2025-12-11T09:30:00Z', upvotes: 203, outcome: 'win', result: 'win' },
  { id: 'P12', traderName: 'PatchCollector', cardName: '2023 Immaculate Chet Holmgren Patch Auto /49', type: 'sell', reasoning: 'Injury risk too high. Taking profits before next shutdown.', targetPrice: 180, currentPrice: 320, timestamp: '2025-12-10T14:20:00Z', upvotes: 67, outcome: 'loss', result: 'loss' },
];

const MOCK_SENTIMENT: SentimentEntry[] = [
  { label: 'Very Bullish', value: 35 },
  { label: 'Bullish', value: 28 },
  { label: 'Neutral', value: 18 },
  { label: 'Bearish', value: 12 },
  { label: 'Very Bearish', value: 7 },
];

const MOCK_TRADER_PERFORMANCE: TraderPerformancePoint[] = [
  { traderName: 'SlabQueen', wins: 42, losses: 8, pending: 5 },
  { traderName: 'VintageVault', wins: 38, losses: 9, pending: 3 },
  { traderName: 'CardShark', wins: 35, losses: 10, pending: 7 },
  { traderName: 'GridironGuru', wins: 32, losses: 12, pending: 4 },
  { traderName: 'DiamondDealer', wins: 28, losses: 9, pending: 6 },
  { traderName: 'ProspectKing', wins: 30, losses: 14, pending: 8 },
  { traderName: 'WaxRipper', wins: 26, losses: 10, pending: 5 },
  { traderName: 'AutoKingPin', wins: 24, losses: 8, pending: 4 },
];

const MOCK_POLLS: CommunityPoll[] = [
  { id: 'PL1', question: 'Which rookie will have the best card value in 2026?', options: [{ label: 'Victor Wembanyama', votes: 1245 }, { label: 'Caitlin Clark', votes: 892 }, { label: 'Caleb Williams', votes: 634 }, { label: 'Paul Skenes', votes: 478 }], status: 'active', endDate: '2025-12-20', totalVotes: 3249 },
  { id: 'PL2', question: 'Best grading company for modern cards?', options: [{ label: 'PSA', votes: 2100 }, { label: 'BGS', votes: 1450 }, { label: 'SGC', votes: 890 }, { label: 'CGC', votes: 320 }], status: 'active', endDate: '2025-12-18', totalVotes: 4760 },
  { id: 'PL3', question: 'Will the hobby market recover by Q2 2026?', options: [{ label: 'Yes - Strong Recovery', votes: 1800 }, { label: 'Partial Recovery', votes: 2200 }, { label: 'Flat/Sideways', votes: 1100 }, { label: 'Further Decline', votes: 600 }], status: 'closed', endDate: '2025-12-01', totalVotes: 5700 },
  { id: 'PL4', question: 'Most overvalued card right now?', options: [{ label: 'Wemby Prizm Silver RC', votes: 980 }, { label: 'Caitlin Clark Prizm RC', votes: 1340 }, { label: 'Caleb Williams RPA', votes: 760 }, { label: 'Ohtani Topps Chrome SP', votes: 420 }], status: 'closed', endDate: '2025-11-25', totalVotes: 3500 },
];

const MOCK_CHALLENGES: TradingChallenge[] = [
  { id: 'C1', name: 'December Flip Challenge', description: 'Highest total profit from buy-sell flips in December wins.', status: 'active', participants: 342, prizePool: 5000, duration: '30 days', leader: 'SlabQueen', startDate: '2025-12-01', endDate: '2025-12-31' },
  { id: 'C2', name: 'Prospect Pick-Em', description: 'Pick 5 prospects. Highest combined card value gain wins.', status: 'active', participants: 567, prizePool: 3000, duration: '90 days', leader: 'ProspectKing', startDate: '2025-10-01', endDate: '2025-12-31' },
  { id: 'C3', name: '$100 to $1000 Challenge', description: 'Start with $100 budget. First to reach $1000 portfolio value wins.', status: 'upcoming', participants: 189, prizePool: 2500, duration: '60 days', leader: null, startDate: '2026-01-01', endDate: '2026-02-28' },
  { id: 'C4', name: 'Vintage Value Hunt', description: 'Find the best value vintage cards under $500. Community votes on best finds.', status: 'completed', participants: 234, prizePool: 4000, duration: '30 days', leader: 'VintageVault', startDate: '2025-11-01', endDate: '2025-11-30' },
];

const MOCK_CONSENSUS: MarketConsensusItem[] = [
  { cardName: 'Wembanyama Prizm Silver RC', consensus: 'bullish', currentPrice: 1850, targetPrice: 2800, confidence: 82, contributors: 456, bullishPercent: 78 },
  { cardName: 'Caitlin Clark Prizm RC', consensus: 'neutral', currentPrice: 320, targetPrice: 380, confidence: 55, contributors: 389, bullishPercent: 52 },
  { cardName: 'Shohei Ohtani Chrome SP', consensus: 'bullish', currentPrice: 240, targetPrice: 420, confidence: 74, contributors: 312, bullishPercent: 71 },
  { cardName: 'Caleb Williams Prizm Silver', consensus: 'bearish', currentPrice: 185, targetPrice: 120, confidence: 68, contributors: 278, bullishPercent: 32 },
  { cardName: 'Luka Doncic Select /25', consensus: 'bullish', currentPrice: 5200, targetPrice: 8500, confidence: 71, contributors: 198, bullishPercent: 69 },
  { cardName: 'CJ Stroud NT RPA /99', consensus: 'bullish', currentPrice: 3200, targetPrice: 5000, confidence: 79, contributors: 234, bullishPercent: 76 },
];

const MOCK_STREAKS: StreakRecord[] = [
  { traderName: 'SlabQueen', type: 'win', streakLength: 15, profitDuring: 18200, startDate: '2025-11-20', active: true },
  { traderName: 'VintageVault', type: 'win', streakLength: 12, profitDuring: 14500, startDate: '2025-11-28', active: true },
  { traderName: 'CardShark_Alpha', type: 'win', streakLength: 8, profitDuring: 9800, startDate: '2025-12-04', active: true },
  { traderName: 'GridironGuru', type: 'win', streakLength: 7, profitDuring: 7200, startDate: '2025-12-06', active: true },
  { traderName: 'DiamondDealer', type: 'win', streakLength: 6, profitDuring: 5400, startDate: '2025-12-07', active: true },
  { traderName: 'FlipMaster_X', type: 'loss', streakLength: 4, profitDuring: -3200, startDate: '2025-12-10', active: true },
  { traderName: 'ProspectKing', type: 'win', streakLength: 11, profitDuring: 12800, startDate: '2025-11-15', active: false },
  { traderName: 'WaxRipper_Pro', type: 'win', streakLength: 9, profitDuring: 8900, startDate: '2025-11-22', active: false },
];

// ─── Exported Functions ──────────────────────────────────────

export function getTopTraders(): TopTrader[] {
  return loadData('topTraders', MOCK_TOP_TRADERS);
}

export function getTradePicks(): TradePick[] {
  return loadData('tradePicks', MOCK_TRADE_PICKS);
}

export function getSentimentDistribution(): SentimentEntry[] {
  return loadData('sentiment', MOCK_SENTIMENT);
}

export function getTraderPerformance(): TraderPerformancePoint[] {
  return loadData('traderPerformance', MOCK_TRADER_PERFORMANCE);
}

export function getCommunityPolls(): CommunityPoll[] {
  return loadData('polls', MOCK_POLLS);
}

export function getTradingChallenges(): TradingChallenge[] {
  return loadData('challenges', MOCK_CHALLENGES);
}

export function getMarketConsensus(): MarketConsensusItem[] {
  return loadData('consensus', MOCK_CONSENSUS);
}

export function getStreakRecords(): StreakRecord[] {
  return loadData('streaks', MOCK_STREAKS);
}

export function getSocialTradingSummary(): SocialTradingSummary {
  const traders = getTopTraders();
  const picks = getTradePicks();
  const polls = getCommunityPolls();
  const challenges = getTradingChallenges();
  const avgWin = traders.length > 0 ? Math.round(traders.reduce((s, t) => s + t.winRate, 0) / traders.length) : 0;
  const totalProfit = traders.reduce((s, t) => s + t.totalProfit, 0);
  return {
    activeTraders: traders.length,
    totalPicks: picks.length,
    avgWinRate: avgWin,
    totalCommunityProfit: totalProfit,
    activePolls: polls.filter(p => p.status === 'active').length,
    activeChallenges: challenges.filter(c => c.status === 'active').length,
  };
}

// Widget-specific functions
export function getActiveTraders(): ActiveTrader[] {
  const traders = getTopTraders();
  return traders.map(t => ({
    id: t.id,
    username: t.username,
    roiPercent: t.avgReturn,
    followers: t.followers,
  }));
}

export function getDailyPicks(): DailyPick[] {
  const picks = getTradePicks();
  return picks.map(p => ({
    cardName: p.cardName,
    type: p.type,
    outcome: p.outcome,
  }));
}

export function getLeaderboard(): ActiveTrader[] {
  const traders = getActiveTraders();
  return traders.sort((a, b) => b.roiPercent - a.roiPercent);
}

export function getTradingStats(): TradingStats {
  const summary = getSocialTradingSummary();
  return {
    communityProfit: summary.totalCommunityProfit,
    accuracy: summary.avgWinRate,
    activeTraders: summary.activeTraders,
    totalPicks: summary.totalPicks,
  };
}

export function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}

export function formatTimeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function saveTraderFollow(traderId: string): void {
  const follows = loadData<string[]>('follows', []);
  if (!follows.includes(traderId)) {
    follows.push(traderId);
    saveData('follows', follows);
  }
}
