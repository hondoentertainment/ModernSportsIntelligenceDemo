// Phase 153: Social Trading & Community Picks
// Social trading platform with community picks, leaderboards, challenges, polls, and follow relationships

// ---- Types ----

export type PickCategory = 'buy' | 'sell' | 'hold' | 'short_term_flip' | 'long_term_hold' | 'avoid';

export type Sentiment = 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';

export interface TraderProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  joinDate: string;
  totalPicks: number;
  winRate: number;
  avgReturn: number;
  followers: number;
  following: number;
  reputation: number;
  streak: number;
  badges: string[];
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  verified: boolean;
}

export interface TradePick {
  id: string;
  traderId: string;
  traderName: string;
  cardName: string;
  player: string;
  category: PickCategory;
  sentiment: Sentiment;
  entryPrice: number;
  targetPrice: number;
  currentPrice: number;
  reasoning: string;
  confidence: number;
  postedDate: string;
  expirationDate: string;
  likes: number;
  comments: number;
  shares: number;
  status: 'active' | 'hit' | 'missed' | 'expired';
  result: number | null;
}

export interface PickResult {
  id: string;
  pickId: string;
  traderId: string;
  cardName: string;
  entryPrice: number;
  exitPrice: number;
  returnPercent: number;
  holdDays: number;
  outcome: 'profit' | 'loss' | 'break_even';
  closedDate: string;
}

export interface CommunityPoll {
  id: string;
  question: string;
  options: { label: string; votes: number; percent: number }[];
  totalVotes: number;
  createdBy: string;
  createdDate: string;
  expirationDate: string;
  status: 'active' | 'closed';
  category: string;
}

export interface TradingChallenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  rules: string[];
  status: 'upcoming' | 'active' | 'completed';
  winnerId: string | null;
  winnerName: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  traderId: string;
  traderName: string;
  totalReturn: number;
  winRate: number;
  totalPicks: number;
  avgHoldDays: number;
  streak: number;
  tier: string;
  change: number;
}

export interface FollowRelation {
  id: string;
  followerId: string;
  followingId: string;
  followDate: string;
  notifications: boolean;
}

export interface MarketConsensus {
  cardName: string;
  player: string;
  bullishPercent: number;
  bearishPercent: number;
  neutralPercent: number;
  totalVotes: number;
  averageTargetPrice: number;
  currentPrice: number;
  consensusSentiment: Sentiment;
}

export interface TradingSignal {
  id: string;
  cardName: string;
  player: string;
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reasoning: string;
  generatedDate: string;
  basedOnPicks: number;
  priceAtSignal: number;
}

export interface StreakRecord {
  id: string;
  traderId: string;
  traderName: string;
  streakType: 'winning' | 'losing';
  streakLength: number;
  startDate: string;
  endDate: string | null;
  active: boolean;
  totalReturn: number;
}

// ---- Storage Helpers ----

const STORAGE_KEY = 'msi_social_trading';

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
    // Storage full or unavailable
  }
}

// ---- Helpers ----

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function getTierConfig(tier: TraderProfile['tier']): { label: string; text: string; bg: string; border: string } {
  switch (tier) {
    case 'bronze': return { label: 'Bronze', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'silver': return { label: 'Silver', text: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };
    case 'gold': return { label: 'Gold', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    case 'platinum': return { label: 'Platinum', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    case 'diamond': return { label: 'Diamond', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
  }
}

export function getSentimentConfig(sentiment: Sentiment): { label: string; text: string; bg: string } {
  switch (sentiment) {
    case 'very_bullish': return { label: 'Very Bullish', text: 'text-green-400', bg: 'bg-green-500/10' };
    case 'bullish': return { label: 'Bullish', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'neutral': return { label: 'Neutral', text: 'text-gray-400', bg: 'bg-gray-500/10' };
    case 'bearish': return { label: 'Bearish', text: 'text-orange-400', bg: 'bg-orange-500/10' };
    case 'very_bearish': return { label: 'Very Bearish', text: 'text-red-400', bg: 'bg-red-500/10' };
  }
}

// ---- Mock Data: Trader Profiles (20) ----

const MOCK_TRADERS: TraderProfile[] = [
  { id: 'tp-1', username: 'CardKingMike', displayName: 'Mike "The King" Thompson', avatar: '/avatars/mike.jpg', bio: 'Full-time card trader since 2018. Specializing in basketball rookies and vintage baseball.', joinDate: '2023-06-15', totalPicks: 342, winRate: 72.5, avgReturn: 18.3, followers: 12450, following: 85, reputation: 9850, streak: 8, badges: ['Top Trader 2025', 'Century Club', 'Streak Master'], tier: 'diamond', verified: true },
  { id: 'tp-2', username: 'VintageVault', displayName: 'Sarah Chen', avatar: '/avatars/sarah.jpg', bio: 'Vintage card specialist. 20+ years collecting pre-war and post-war baseball.', joinDate: '2023-08-22', totalPicks: 189, winRate: 78.3, avgReturn: 22.1, followers: 8920, following: 42, reputation: 8750, streak: 5, badges: ['Vintage Expert', 'High Win Rate', 'Community Leader'], tier: 'diamond', verified: true },
  { id: 'tp-3', username: 'RookieHunter', displayName: 'James Williams', avatar: '/avatars/james.jpg', bio: 'Chasing the next big rookie card. Basketball and football focus.', joinDate: '2024-01-10', totalPicks: 275, winRate: 65.8, avgReturn: 14.7, followers: 6340, following: 120, reputation: 7200, streak: 3, badges: ['Rookie Specialist', 'Hot Streak'], tier: 'platinum', verified: true },
  { id: 'tp-4', username: 'FlipMaster99', displayName: 'Derek Johnson', avatar: '/avatars/derek.jpg', bio: 'Short-term flip specialist. Buy the dip, sell the hype.', joinDate: '2024-03-05', totalPicks: 520, winRate: 61.2, avgReturn: 11.5, followers: 4580, following: 200, reputation: 6100, streak: 0, badges: ['Volume Trader', 'Quick Flip King'], tier: 'gold', verified: false },
  { id: 'tp-5', username: 'GradedGemGal', displayName: 'Emily Rodriguez', avatar: '/avatars/emily.jpg', bio: 'PSA and BGS graded card expert. Focus on gem mint investments.', joinDate: '2023-11-18', totalPicks: 156, winRate: 74.4, avgReturn: 20.8, followers: 7810, following: 65, reputation: 8200, streak: 6, badges: ['Grading Expert', 'Consistent Winner'], tier: 'platinum', verified: true },
  { id: 'tp-6', username: 'SportsCardDad', displayName: 'Tom Baker', avatar: '/avatars/tom.jpg', bio: 'Casual collector turned investor. Teaching my kids the hobby.', joinDate: '2024-05-20', totalPicks: 98, winRate: 58.2, avgReturn: 8.5, followers: 2340, following: 150, reputation: 3800, streak: 2, badges: ['Community Member', 'Rising Star'], tier: 'silver', verified: false },
  { id: 'tp-7', username: 'WaxRipperPro', displayName: 'Marcus Lee', avatar: '/avatars/marcus.jpg', bio: 'Break king and wax ripper. Sealed product analysis and rip ROI tracking.', joinDate: '2024-02-14', totalPicks: 210, winRate: 55.7, avgReturn: 9.2, followers: 5120, following: 88, reputation: 5500, streak: 1, badges: ['Wax Expert', 'Break Specialist'], tier: 'gold', verified: true },
  { id: 'tp-8', username: 'HockeyCardQueen', displayName: 'Lisa Petrov', avatar: '/avatars/lisa.jpg', bio: 'Hockey card specialist. YG collector and prospect hunter.', joinDate: '2024-04-08', totalPicks: 145, winRate: 69.7, avgReturn: 16.3, followers: 3890, following: 72, reputation: 5900, streak: 4, badges: ['Hockey Expert', 'Niche Master'], tier: 'gold', verified: false },
  { id: 'tp-9', username: 'ProspectProphet', displayName: 'Anthony Davis', avatar: '/avatars/anthony.jpg', bio: 'Baseball prospect specialist. Bowman Chrome and 1st Bowman obsessed.', joinDate: '2023-09-30', totalPicks: 310, winRate: 67.4, avgReturn: 25.6, followers: 9250, following: 55, reputation: 8900, streak: 7, badges: ['Prospect Guru', 'High Return', 'Top 10 All-Time'], tier: 'diamond', verified: true },
  { id: 'tp-10', username: 'ModernMint', displayName: 'Rachel Kim', avatar: '/avatars/rachel.jpg', bio: 'Modern card market analyst. Data-driven picks and market commentary.', joinDate: '2024-06-12', totalPicks: 178, winRate: 71.3, avgReturn: 15.9, followers: 6780, following: 95, reputation: 7100, streak: 5, badges: ['Data Analyst', 'Rising Star', 'Consistent'], tier: 'platinum', verified: true },
  { id: 'tp-11', username: 'BigGameBob', displayName: 'Robert Garcia', avatar: '/avatars/robert.jpg', bio: 'High-stakes trader. Six-figure cards and auction specialist.', joinDate: '2023-07-25', totalPicks: 82, winRate: 76.8, avgReturn: 32.5, followers: 11200, following: 30, reputation: 9200, streak: 4, badges: ['Whale Trader', 'Auction Expert', 'High Roller'], tier: 'diamond', verified: true },
  { id: 'tp-12', username: 'CardboardCasual', displayName: 'Kevin O\'Brien', avatar: '/avatars/kevin.jpg', bio: 'Just here for the fun. Collecting what I love, sometimes it pays off.', joinDate: '2024-08-15', totalPicks: 45, winRate: 51.1, avgReturn: 3.2, followers: 890, following: 250, reputation: 1200, streak: 0, badges: ['Newcomer'], tier: 'bronze', verified: false },
  { id: 'tp-13', username: 'SetBuilderSteve', displayName: 'Steve Martinez', avatar: '/avatars/steve.jpg', bio: 'Set completion specialist. Master set builder and registry competitor.', joinDate: '2024-01-22', totalPicks: 125, winRate: 63.2, avgReturn: 12.8, followers: 3450, following: 110, reputation: 4800, streak: 2, badges: ['Set Builder', 'Registry Expert'], tier: 'gold', verified: false },
  { id: 'tp-14', username: 'GrailChaser', displayName: 'Diana Washington', avatar: '/avatars/diana.jpg', bio: 'Hunting the holy grails. Pre-war, vintage, and ultra-high-end modern.', joinDate: '2023-10-05', totalPicks: 68, winRate: 80.9, avgReturn: 28.4, followers: 7650, following: 40, reputation: 8100, streak: 9, badges: ['Grail Hunter', 'Win Streak Record', 'Verified Expert'], tier: 'diamond', verified: true },
  { id: 'tp-15', username: 'BreakEvenBrian', displayName: 'Brian Foster', avatar: '/avatars/brian.jpg', bio: 'Learning the ropes. Documenting my journey from casual to serious.', joinDate: '2025-01-08', totalPicks: 32, winRate: 46.9, avgReturn: -2.5, followers: 520, following: 300, reputation: 800, streak: 0, badges: ['Newcomer', 'Active Learner'], tier: 'bronze', verified: false },
  { id: 'tp-16', username: 'FootballFanatic', displayName: 'Chris Taylor', avatar: '/avatars/chris.jpg', bio: 'NFL card specialist. Quarterback rookies and skill position players.', joinDate: '2024-07-20', totalPicks: 195, winRate: 62.1, avgReturn: 10.8, followers: 4120, following: 135, reputation: 5200, streak: 3, badges: ['Football Expert', 'Draft Day Trader'], tier: 'gold', verified: true },
  { id: 'tp-17', username: 'PatchAutoQueen', displayName: 'Nicole Adams', avatar: '/avatars/nicole.jpg', bio: 'Patch auto collector and investor. The flashier the better.', joinDate: '2024-09-01', totalPicks: 88, winRate: 59.1, avgReturn: 7.5, followers: 2890, following: 175, reputation: 3400, streak: 1, badges: ['Auto Specialist', 'Patch Hunter'], tier: 'silver', verified: false },
  { id: 'tp-18', username: 'StatArb_Cards', displayName: 'David Park', avatar: '/avatars/david.jpg', bio: 'Quantitative approach to card investing. Former Wall Street analyst.', joinDate: '2024-04-15', totalPicks: 240, winRate: 73.8, avgReturn: 19.2, followers: 8450, following: 25, reputation: 8600, streak: 6, badges: ['Quant Trader', 'Data Driven', 'Wall Street'], tier: 'platinum', verified: true },
  { id: 'tp-19', username: 'RetroCollector', displayName: 'Frank Wilson', avatar: '/avatars/frank.jpg', bio: 'Junk wax era defender and 90s nostalgia collector. Some of it is actually worth something!', joinDate: '2024-11-20', totalPicks: 72, winRate: 54.2, avgReturn: 4.8, followers: 1650, following: 200, reputation: 2100, streak: 0, badges: ['Junk Wax Warrior', 'Nostalgia Trader'], tier: 'silver', verified: false },
  { id: 'tp-20', username: 'GlobalCollector', displayName: 'Yuki Tanaka', avatar: '/avatars/yuki.jpg', bio: 'International card market expert. Japanese baseball and soccer cards specialist.', joinDate: '2024-03-28', totalPicks: 155, winRate: 70.3, avgReturn: 21.5, followers: 5680, following: 60, reputation: 6800, streak: 5, badges: ['International Expert', 'Soccer Specialist', 'Cross-Market'], tier: 'platinum', verified: true },
];

// ---- Mock Data: Trade Picks (50) ----

const MOCK_PICKS: TradePick[] = [
  { id: 'pk-1', traderId: 'tp-1', traderName: 'CardKingMike', cardName: '2023 Prizm Victor Wembanyama RC', player: 'Victor Wembanyama', category: 'long_term_hold', sentiment: 'very_bullish', entryPrice: 1200, targetPrice: 3500, currentPrice: 1800, reasoning: 'Generational talent with ROTY locked up. Long-term dynasty potential makes this a hold for 3-5 years.', confidence: 92, postedDate: '2026-01-15', expirationDate: '2027-01-15', likes: 342, comments: 89, shares: 45, status: 'active', result: null },
  { id: 'pk-2', traderId: 'tp-2', traderName: 'VintageVault', cardName: '1952 Topps Mickey Mantle #311 PSA 3', player: 'Mickey Mantle', category: 'long_term_hold', sentiment: 'bullish', entryPrice: 85000, targetPrice: 120000, currentPrice: 92000, reasoning: 'Blue chip vintage that always recovers from dips. Current prices below 2021 peaks present buying opportunity.', confidence: 88, postedDate: '2026-02-01', expirationDate: '2028-02-01', likes: 256, comments: 67, shares: 38, status: 'active', result: null },
  { id: 'pk-3', traderId: 'tp-3', traderName: 'RookieHunter', cardName: '2024 Prizm Caleb Williams RC', player: 'Caleb Williams', category: 'buy', sentiment: 'bullish', entryPrice: 85, targetPrice: 200, currentPrice: 110, reasoning: 'Bears improving around him. Sophomore leap incoming — buy before the hype train leaves.', confidence: 75, postedDate: '2026-02-20', expirationDate: '2026-12-20', likes: 198, comments: 52, shares: 28, status: 'active', result: null },
  { id: 'pk-4', traderId: 'tp-4', traderName: 'FlipMaster99', cardName: '2023 Bowman Chrome Ethan Salas 1st', player: 'Ethan Salas', category: 'short_term_flip', sentiment: 'very_bullish', entryPrice: 145, targetPrice: 220, currentPrice: 195, reasoning: 'MLB callup imminent — ride the callup hype wave then sell into strength.', confidence: 82, postedDate: '2026-02-25', expirationDate: '2026-04-25', likes: 312, comments: 95, shares: 62, status: 'active', result: null },
  { id: 'pk-5', traderId: 'tp-5', traderName: 'GradedGemGal', cardName: '2018 Prizm Shai Gilgeous-Alexander PSA 10', player: 'Shai Gilgeous-Alexander', category: 'buy', sentiment: 'very_bullish', entryPrice: 650, targetPrice: 1500, currentPrice: 950, reasoning: 'MVP favorite with historically undervalued card. PSA 10 pop is manageable. Should 2-3x from here.', confidence: 90, postedDate: '2026-01-20', expirationDate: '2026-07-20', likes: 425, comments: 112, shares: 78, status: 'active', result: null },
  { id: 'pk-6', traderId: 'tp-9', traderName: 'ProspectProphet', cardName: '2025 Bowman Chrome Jac Caglianone 1st', player: 'Jac Caglianone', category: 'buy', sentiment: 'bullish', entryPrice: 35, targetPrice: 120, currentPrice: 48, reasoning: 'Two-way prospect with massive power. Hype will build as he climbs the minors in 2026.', confidence: 78, postedDate: '2026-03-01', expirationDate: '2027-03-01', likes: 189, comments: 43, shares: 25, status: 'active', result: null },
  { id: 'pk-7', traderId: 'tp-10', traderName: 'ModernMint', cardName: '2020 Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', category: 'sell', sentiment: 'bearish', entryPrice: 850, targetPrice: 500, currentPrice: 820, reasoning: 'Market is oversaturated with PSA 10 copies. Chargers struggling and card is trending down year over year.', confidence: 72, postedDate: '2026-02-15', expirationDate: '2026-08-15', likes: 145, comments: 88, shares: 32, status: 'active', result: null },
  { id: 'pk-8', traderId: 'tp-11', traderName: 'BigGameBob', cardName: '1986 Fleer Michael Jordan RC PSA 10', player: 'Michael Jordan', category: 'hold', sentiment: 'bullish', entryPrice: 42000, targetPrice: 55000, currentPrice: 45000, reasoning: 'GOAT card is the safest hold in the hobby. Will always maintain value and appreciate steadily.', confidence: 95, postedDate: '2026-01-05', expirationDate: '2028-01-05', likes: 520, comments: 134, shares: 92, status: 'active', result: null },
  { id: 'pk-9', traderId: 'tp-1', traderName: 'CardKingMike', cardName: '2020 Prizm Anthony Edwards RC PSA 10', player: 'Anthony Edwards', category: 'buy', sentiment: 'bullish', entryPrice: 480, targetPrice: 1200, currentPrice: 680, reasoning: 'Next face of the NBA. Playoff performances will drive this card to 4 figures easily.', confidence: 85, postedDate: '2026-02-10', expirationDate: '2026-08-10', likes: 298, comments: 76, shares: 41, status: 'active', result: null },
  { id: 'pk-10', traderId: 'tp-14', traderName: 'GrailChaser', cardName: '1933 Goudey Babe Ruth #53 PSA 2', player: 'Babe Ruth', category: 'long_term_hold', sentiment: 'very_bullish', entryPrice: 65000, targetPrice: 100000, currentPrice: 72000, reasoning: 'Pre-war Ruth will always be in demand. Current prices are well below 2021 highs. Patient money wins.', confidence: 94, postedDate: '2026-01-28', expirationDate: '2029-01-28', likes: 410, comments: 98, shares: 65, status: 'active', result: null },
  { id: 'pk-11', traderId: 'tp-4', traderName: 'FlipMaster99', cardName: '2024 Prizm Jayden Daniels RC', player: 'Jayden Daniels', category: 'sell', sentiment: 'bearish', entryPrice: 120, targetPrice: 60, currentPrice: 95, reasoning: 'Sophomore slump incoming for most QBs. Sell while OROY hype is still propping up prices.', confidence: 68, postedDate: '2026-03-05', expirationDate: '2026-09-05', likes: 112, comments: 65, shares: 18, status: 'active', result: null },
  { id: 'pk-12', traderId: 'tp-8', traderName: 'HockeyCardQueen', cardName: '2023 Upper Deck Connor Bedard YG', player: 'Connor Bedard', category: 'buy', sentiment: 'bullish', entryPrice: 180, targetPrice: 400, currentPrice: 165, reasoning: 'Injury dip is a buying opportunity. Bedard is generational — buy the fear.', confidence: 80, postedDate: '2026-02-18', expirationDate: '2026-11-18', likes: 178, comments: 54, shares: 29, status: 'active', result: null },
  { id: 'pk-13', traderId: 'tp-18', traderName: 'StatArb_Cards', cardName: '2017 Prizm Patrick Mahomes RC PSA 10', player: 'Patrick Mahomes', category: 'hold', sentiment: 'neutral', entryPrice: 4200, targetPrice: 5000, currentPrice: 4200, reasoning: 'Fair valued at current levels. Hold for dynasty status but do not chase at higher prices.', confidence: 70, postedDate: '2026-03-01', expirationDate: '2026-09-01', likes: 165, comments: 48, shares: 22, status: 'active', result: null },
  { id: 'pk-14', traderId: 'tp-3', traderName: 'RookieHunter', cardName: '2024 Prizm Zach Edey RC', player: 'Zach Edey', category: 'avoid', sentiment: 'bearish', entryPrice: 25, targetPrice: 10, currentPrice: 22, reasoning: 'Limited NBA ceiling for traditional big man. Do not buy into the hype.', confidence: 65, postedDate: '2026-03-08', expirationDate: '2026-09-08', likes: 88, comments: 120, shares: 15, status: 'active', result: null },
  { id: 'pk-15', traderId: 'tp-16', traderName: 'FootballFanatic', cardName: '2025 Prizm Shedeur Sanders RC', player: 'Shedeur Sanders', category: 'buy', sentiment: 'bullish', entryPrice: 55, targetPrice: 150, currentPrice: 72, reasoning: 'Name recognition and marketing power alone will drive this card. NFL Draft hype building.', confidence: 74, postedDate: '2026-03-10', expirationDate: '2026-12-10', likes: 210, comments: 85, shares: 45, status: 'active', result: null },
  { id: 'pk-16', traderId: 'tp-5', traderName: 'GradedGemGal', cardName: '1996 Topps Chrome Kobe Bryant RC PSA 9', player: 'Kobe Bryant', category: 'long_term_hold', sentiment: 'bullish', entryPrice: 6500, targetPrice: 9000, currentPrice: 6800, reasoning: 'Memorial demand maintains floor. PSA 9 is the sweet spot for value. Long-term appreciation guaranteed.', confidence: 88, postedDate: '2026-02-14', expirationDate: '2028-02-14', likes: 380, comments: 92, shares: 55, status: 'active', result: null },
  { id: 'pk-17', traderId: 'tp-7', traderName: 'WaxRipperPro', cardName: '2024 Topps Chrome Baseball Hobby Box', player: 'N/A', category: 'buy', sentiment: 'bullish', entryPrice: 280, targetPrice: 450, currentPrice: 320, reasoning: 'Strong rookie class and limited print run. Sealed product always appreciates if you can wait.', confidence: 70, postedDate: '2026-02-28', expirationDate: '2027-02-28', likes: 145, comments: 38, shares: 20, status: 'active', result: null },
  { id: 'pk-18', traderId: 'tp-20', traderName: 'GlobalCollector', cardName: '2023 Topps Chrome Shohei Ohtani', player: 'Shohei Ohtani', category: 'hold', sentiment: 'bullish', entryPrice: 280, targetPrice: 450, currentPrice: 310, reasoning: 'Dodgers + healthy pitching return = strong upside. International appeal adds premium.', confidence: 82, postedDate: '2026-03-02', expirationDate: '2026-10-02', likes: 265, comments: 71, shares: 38, status: 'active', result: null },
  { id: 'pk-19', traderId: 'tp-9', traderName: 'ProspectProphet', cardName: '2025 Bowman Chrome Travis Bazzana 1st', player: 'Travis Bazzana', category: 'buy', sentiment: 'very_bullish', entryPrice: 80, targetPrice: 200, currentPrice: 105, reasoning: '#1 overall pick making Opening Day roster. Cards will spike with first big league hit.', confidence: 85, postedDate: '2026-03-12', expirationDate: '2026-09-12', likes: 290, comments: 78, shares: 50, status: 'active', result: null },
  { id: 'pk-20', traderId: 'tp-6', traderName: 'SportsCardDad', cardName: '2019 Prizm Zion Williamson RC PSA 10', player: 'Zion Williamson', category: 'avoid', sentiment: 'very_bearish', entryPrice: 420, targetPrice: 200, currentPrice: 400, reasoning: 'Injury history makes this toxic. Do not catch this falling knife.', confidence: 80, postedDate: '2026-02-22', expirationDate: '2026-08-22', likes: 195, comments: 145, shares: 35, status: 'active', result: null },
  { id: 'pk-21', traderId: 'tp-1', traderName: 'CardKingMike', cardName: '2022 Prizm Paolo Banchero RC PSA 10', player: 'Paolo Banchero', category: 'buy', sentiment: 'bullish', entryPrice: 140, targetPrice: 350, currentPrice: 185, reasoning: 'All-Star trajectory at 22. Orlando is building something special. Great entry point right now.', confidence: 78, postedDate: '2026-03-08', expirationDate: '2026-12-08', likes: 220, comments: 58, shares: 32, status: 'active', result: null },
  { id: 'pk-22', traderId: 'tp-2', traderName: 'VintageVault', cardName: '1955 Topps Roberto Clemente RC PSA 5', player: 'Roberto Clemente', category: 'buy', sentiment: 'bullish', entryPrice: 20000, targetPrice: 30000, currentPrice: 22000, reasoning: 'Increasingly recognized as one of the most important cards in the hobby. Cultural significance adds premium.', confidence: 85, postedDate: '2026-02-10', expirationDate: '2028-02-10', likes: 310, comments: 72, shares: 48, status: 'active', result: null },
  { id: 'pk-23', traderId: 'tp-10', traderName: 'ModernMint', cardName: '2024 Topps Chrome Paul Skenes RC', player: 'Paul Skenes', category: 'buy', sentiment: 'bullish', entryPrice: 45, targetPrice: 120, currentPrice: 62, reasoning: 'ROTY winner with electric stuff. Pittsburgh is building a contender around him.', confidence: 76, postedDate: '2026-03-06', expirationDate: '2026-09-06', likes: 175, comments: 42, shares: 25, status: 'active', result: null },
  { id: 'pk-24', traderId: 'tp-14', traderName: 'GrailChaser', cardName: '1969 Topps Lew Alcindor RC PSA 7', player: 'Kareem Abdul-Jabbar', category: 'buy', sentiment: 'bullish', entryPrice: 12000, targetPrice: 18000, currentPrice: 13500, reasoning: 'All-time great at below-market prices. Scoring record nostalgia will cycle back.', confidence: 82, postedDate: '2026-01-22', expirationDate: '2027-07-22', likes: 245, comments: 62, shares: 40, status: 'active', result: null },
  { id: 'pk-25', traderId: 'tp-4', traderName: 'FlipMaster99', cardName: '2025 Prizm Cam Ward RC', player: 'Cam Ward', category: 'short_term_flip', sentiment: 'bullish', entryPrice: 40, targetPrice: 95, currentPrice: 58, reasoning: 'Draft hype machine is turning on. Flip this before the actual NFL season reality check.', confidence: 70, postedDate: '2026-03-12', expirationDate: '2026-06-12', likes: 155, comments: 48, shares: 22, status: 'active', result: null },
  { id: 'pk-26', traderId: 'tp-1', traderName: 'CardKingMike', cardName: '2022 Prizm Bennedict Mathurin RC', player: 'Bennedict Mathurin', category: 'sell', sentiment: 'bearish', entryPrice: 45, targetPrice: 20, currentPrice: 38, reasoning: 'Ceiling is limited role player. Sell now before market fully corrects.', confidence: 65, postedDate: '2026-03-01', expirationDate: '2026-06-01', likes: 95, comments: 42, shares: 12, status: 'active', result: null },
  { id: 'pk-27', traderId: 'tp-11', traderName: 'BigGameBob', cardName: '2003 Topps Chrome LeBron James RC PSA 10', player: 'LeBron James', category: 'hold', sentiment: 'bullish', entryPrice: 26000, targetPrice: 40000, currentPrice: 28000, reasoning: 'Retirement approaching will create massive demand surge. The GOAT debate card.', confidence: 90, postedDate: '2026-02-05', expirationDate: '2028-02-05', likes: 480, comments: 125, shares: 88, status: 'active', result: null },
  { id: 'pk-28', traderId: 'tp-18', traderName: 'StatArb_Cards', cardName: '2013 Prizm Giannis Antetokounmpo RC PSA 10', player: 'Giannis Antetokounmpo', category: 'sell', sentiment: 'bearish', entryPrice: 5200, targetPrice: 3800, currentPrice: 5100, reasoning: 'Trade rumor uncertainty and age curve suggest near-term downside. Lock in profits.', confidence: 72, postedDate: '2026-03-13', expirationDate: '2026-09-13', likes: 185, comments: 95, shares: 30, status: 'active', result: null },
  { id: 'pk-29', traderId: 'tp-8', traderName: 'HockeyCardQueen', cardName: '2024 Upper Deck Macklin Celebrini YG', player: 'Macklin Celebrini', category: 'buy', sentiment: 'bullish', entryPrice: 120, targetPrice: 300, currentPrice: 155, reasoning: '#1 pick showing elite skill. Buy before Calder Trophy conversation heats up.', confidence: 80, postedDate: '2026-02-28', expirationDate: '2026-08-28', likes: 168, comments: 45, shares: 28, status: 'active', result: null },
  { id: 'pk-30', traderId: 'tp-3', traderName: 'RookieHunter', cardName: '2024 Prizm Caitlin Clark RC', player: 'Caitlin Clark', category: 'buy', sentiment: 'very_bullish', entryPrice: 95, targetPrice: 300, currentPrice: 145, reasoning: 'WNBA superstar transcending the sport. Crossover appeal makes this a multi-bagger.', confidence: 88, postedDate: '2026-02-05', expirationDate: '2026-11-05', likes: 520, comments: 180, shares: 95, status: 'active', result: null },
  { id: 'pk-31', traderId: 'tp-5', traderName: 'GradedGemGal', cardName: '2009 NT Stephen Curry RC /99 BGS 9.5', player: 'Stephen Curry', category: 'hold', sentiment: 'bullish', entryPrice: 16000, targetPrice: 25000, currentPrice: 18500, reasoning: 'Greatest shooter ever with retirement approaching. Low pop, high demand.', confidence: 92, postedDate: '2026-01-30', expirationDate: '2027-06-30', likes: 345, comments: 88, shares: 55, status: 'active', result: null },
  { id: 'pk-32', traderId: 'tp-16', traderName: 'FootballFanatic', cardName: '2024 Prizm Marvin Harrison Jr RC', player: 'Marvin Harrison Jr', category: 'hold', sentiment: 'neutral', entryPrice: 65, targetPrice: 80, currentPrice: 58, reasoning: 'Disappointing rookie year but pedigree is elite. Hold through Year 2 breakout.', confidence: 62, postedDate: '2026-03-10', expirationDate: '2027-01-10', likes: 122, comments: 68, shares: 18, status: 'active', result: null },
  { id: 'pk-33', traderId: 'tp-7', traderName: 'WaxRipperPro', cardName: '2025 Topps Series 1 Hobby Box', player: 'N/A', category: 'buy', sentiment: 'bullish', entryPrice: 120, targetPrice: 200, currentPrice: 145, reasoning: 'Strong rookie class with Salas, Bazzana. Sealed prices will climb post-release.', confidence: 72, postedDate: '2026-03-05', expirationDate: '2027-03-05', likes: 130, comments: 35, shares: 18, status: 'active', result: null },
  { id: 'pk-34', traderId: 'tp-13', traderName: 'SetBuilderSteve', cardName: '2024 Topps Chrome Complete Set', player: 'Multiple', category: 'buy', sentiment: 'bullish', entryPrice: 450, targetPrice: 700, currentPrice: 510, reasoning: 'Hand-collated complete set with all key rookies. Always appreciates over time.', confidence: 75, postedDate: '2026-02-20', expirationDate: '2027-02-20', likes: 98, comments: 28, shares: 12, status: 'active', result: null },
  { id: 'pk-35', traderId: 'tp-17', traderName: 'PatchAutoQueen', cardName: '2023 NT Wembanyama RPA /99', player: 'Victor Wembanyama', category: 'long_term_hold', sentiment: 'very_bullish', entryPrice: 8500, targetPrice: 25000, currentPrice: 12000, reasoning: 'Cornerstone RPA of the next generation. This is a retirement fund card.', confidence: 90, postedDate: '2026-01-18', expirationDate: '2029-01-18', likes: 450, comments: 120, shares: 82, status: 'active', result: null },
  { id: 'pk-36', traderId: 'tp-12', traderName: 'CardboardCasual', cardName: '2024 Topps Heritage Baseball Box', player: 'N/A', category: 'buy', sentiment: 'neutral', entryPrice: 85, targetPrice: 120, currentPrice: 90, reasoning: 'Fun rip with decent rookie content. Not a home run but solid singles.', confidence: 55, postedDate: '2026-03-08', expirationDate: '2026-09-08', likes: 42, comments: 15, shares: 5, status: 'active', result: null },
  { id: 'pk-37', traderId: 'tp-9', traderName: 'ProspectProphet', cardName: '2024 Bowman Chrome Ethan Holliday 1st', player: 'Ethan Holliday', category: 'buy', sentiment: 'bullish', entryPrice: 18, targetPrice: 80, currentPrice: 25, reasoning: 'Top prep bat in 2024 draft class. Multi-sport athlete with huge ceiling.', confidence: 72, postedDate: '2026-03-01', expirationDate: '2028-03-01', likes: 145, comments: 38, shares: 22, status: 'active', result: null },
  { id: 'pk-38', traderId: 'tp-19', traderName: 'RetroCollector', cardName: '1989 Upper Deck Ken Griffey Jr RC PSA 9', player: 'Ken Griffey Jr', category: 'buy', sentiment: 'bullish', entryPrice: 180, targetPrice: 300, currentPrice: 195, reasoning: '90s nostalgia is real. PSA 9 is affordable and has room to run.', confidence: 68, postedDate: '2026-03-02', expirationDate: '2027-03-02', likes: 88, comments: 25, shares: 12, status: 'active', result: null },
  { id: 'pk-39', traderId: 'tp-15', traderName: 'BreakEvenBrian', cardName: '2024 Prizm Bronny James RC', player: 'Bronny James', category: 'sell', sentiment: 'very_bearish', entryPrice: 35, targetPrice: 10, currentPrice: 28, reasoning: 'Nepotism pick. Card has no long-term value without NBA production.', confidence: 70, postedDate: '2026-03-10', expirationDate: '2026-06-10', likes: 155, comments: 210, shares: 42, status: 'active', result: null },
  { id: 'pk-40', traderId: 'tp-20', traderName: 'GlobalCollector', cardName: '2024 Topps Chrome UCL Lamine Yamal', player: 'Lamine Yamal', category: 'buy', sentiment: 'very_bullish', entryPrice: 65, targetPrice: 250, currentPrice: 95, reasoning: 'Youngest Euros goalscorer ever. Soccer card market is booming globally.', confidence: 85, postedDate: '2026-02-15', expirationDate: '2027-02-15', likes: 280, comments: 72, shares: 55, status: 'active', result: null },
  { id: 'pk-41', traderId: 'tp-2', traderName: 'VintageVault', cardName: '1966 Topps Bobby Orr RC PSA 5', player: 'Bobby Orr', category: 'buy', sentiment: 'bullish', entryPrice: 18000, targetPrice: 28000, currentPrice: 20000, reasoning: 'Strongest vintage hockey card. Undervalued compared to basketball equivalents.', confidence: 84, postedDate: '2026-02-08', expirationDate: '2027-08-08', likes: 198, comments: 52, shares: 35, status: 'active', result: null },
  { id: 'pk-42', traderId: 'tp-10', traderName: 'ModernMint', cardName: '2022 Prizm Tyrese Maxey RC PSA 10', player: 'Tyrese Maxey', category: 'buy', sentiment: 'bullish', entryPrice: 85, targetPrice: 200, currentPrice: 120, reasoning: 'All-Star breakout in Philly. Still affordable for the production level. Data says buy.', confidence: 78, postedDate: '2026-03-05', expirationDate: '2026-09-05', likes: 165, comments: 45, shares: 28, status: 'active', result: null },
  { id: 'pk-43', traderId: 'tp-4', traderName: 'FlipMaster99', cardName: '2024 Prizm Drake Maye RC', player: 'Drake Maye', category: 'short_term_flip', sentiment: 'neutral', entryPrice: 28, targetPrice: 55, currentPrice: 32, reasoning: 'Patriots hype season incoming. Flip before regular season reality hits.', confidence: 60, postedDate: '2026-03-12', expirationDate: '2026-06-12', likes: 92, comments: 35, shares: 10, status: 'active', result: null },
  { id: 'pk-44', traderId: 'tp-14', traderName: 'GrailChaser', cardName: '1979 OPC Wayne Gretzky RC PSA 8', player: 'Wayne Gretzky', category: 'long_term_hold', sentiment: 'bullish', entryPrice: 65000, targetPrice: 95000, currentPrice: 70000, reasoning: 'The Great One. Hockey GOAT card at a reasonable PSA 8 entry. Generational wealth hold.', confidence: 92, postedDate: '2026-01-10', expirationDate: '2029-01-10', likes: 380, comments: 85, shares: 60, status: 'active', result: null },
  { id: 'pk-45', traderId: 'tp-6', traderName: 'SportsCardDad', cardName: '2023 Topps Chrome Corbin Carroll RC', player: 'Corbin Carroll', category: 'hold', sentiment: 'neutral', entryPrice: 22, targetPrice: 35, currentPrice: 18, reasoning: 'Sophomore slump has cratered the price. Hold for a rebound season.', confidence: 55, postedDate: '2026-03-08', expirationDate: '2026-10-08', likes: 65, comments: 28, shares: 8, status: 'active', result: null },
  { id: 'pk-46', traderId: 'tp-18', traderName: 'StatArb_Cards', cardName: '2011 Topps Update Mike Trout RC PSA 10', player: 'Mike Trout', category: 'sell', sentiment: 'bearish', entryPrice: 3800, targetPrice: 2800, currentPrice: 3700, reasoning: 'Injury track record and aging curve suggest peak value is behind us. Take profits.', confidence: 68, postedDate: '2026-03-02', expirationDate: '2026-09-02', likes: 145, comments: 92, shares: 25, status: 'active', result: null },
  { id: 'pk-47', traderId: 'tp-11', traderName: 'BigGameBob', cardName: '2023 NT Wembanyama Logoman 1/1', player: 'Victor Wembanyama', category: 'long_term_hold', sentiment: 'very_bullish', entryPrice: 250000, targetPrice: 750000, currentPrice: 320000, reasoning: 'The single most important modern basketball card. Once-in-a-generation asset.', confidence: 95, postedDate: '2026-01-25', expirationDate: '2030-01-25', likes: 850, comments: 250, shares: 180, status: 'active', result: null },
  { id: 'pk-48', traderId: 'tp-8', traderName: 'HockeyCardQueen', cardName: '2024 Upper Deck Matvei Michkov YG', player: 'Matvei Michkov', category: 'buy', sentiment: 'bullish', entryPrice: 85, targetPrice: 200, currentPrice: 110, reasoning: 'Russian phenom adapting to NHL quickly. Flyers have a future star.', confidence: 75, postedDate: '2026-03-08', expirationDate: '2026-12-08', likes: 135, comments: 40, shares: 22, status: 'active', result: null },
  { id: 'pk-49', traderId: 'tp-3', traderName: 'RookieHunter', cardName: '2023 Prizm Jaime Jaquez Jr RC', player: 'Jaime Jaquez Jr', category: 'avoid', sentiment: 'bearish', entryPrice: 15, targetPrice: 8, currentPrice: 12, reasoning: 'Limited star ceiling. Good player but not a card market mover.', confidence: 62, postedDate: '2026-03-10', expirationDate: '2026-06-10', likes: 55, comments: 32, shares: 8, status: 'active', result: null },
  { id: 'pk-50', traderId: 'tp-9', traderName: 'ProspectProphet', cardName: '2025 Bowman Chrome Charlie Condon 1st', player: 'Charlie Condon', category: 'buy', sentiment: 'bullish', entryPrice: 22, targetPrice: 75, currentPrice: 30, reasoning: 'College power bat with huge raw tools. If he hits in pro ball, this card explodes.', confidence: 70, postedDate: '2026-03-14', expirationDate: '2027-09-14', likes: 125, comments: 35, shares: 18, status: 'active', result: null },
];

// ---- Mock Data: Community Polls (10) ----

const MOCK_POLLS: CommunityPoll[] = [
  { id: 'poll-1', question: 'Who will be the most valuable rookie card from the 2024 NBA Draft class in 5 years?', options: [{ label: 'Zaccharie Risacher', votes: 1250, percent: 18.2 }, { label: 'Alex Sarr', votes: 2100, percent: 30.5 }, { label: 'Reed Sheppard', votes: 2450, percent: 35.6 }, { label: 'Donovan Clingan', votes: 680, percent: 9.9 }, { label: 'Other', votes: 400, percent: 5.8 }], totalVotes: 6880, createdBy: 'tp-1', createdDate: '2026-03-01', expirationDate: '2026-03-31', status: 'active', category: 'Basketball' },
  { id: 'poll-2', question: 'Best investment strategy in current market?', options: [{ label: 'Buy vintage blue chips', votes: 3200, percent: 38.1 }, { label: 'Speculate on rookies', votes: 1800, percent: 21.4 }, { label: 'Sealed product', votes: 1500, percent: 17.9 }, { label: 'Graded modern PSA 10s', votes: 1100, percent: 13.1 }, { label: 'Cash out and wait', votes: 800, percent: 9.5 }], totalVotes: 8400, createdBy: 'tp-2', createdDate: '2026-02-15', expirationDate: '2026-03-15', status: 'active', category: 'Strategy' },
  { id: 'poll-3', question: 'Which grading company do you trust most?', options: [{ label: 'PSA', votes: 5800, percent: 52.3 }, { label: 'BGS/Beckett', votes: 2400, percent: 21.6 }, { label: 'SGC', votes: 1800, percent: 16.2 }, { label: 'CGC', votes: 650, percent: 5.9 }, { label: 'Other', votes: 450, percent: 4.0 }], totalVotes: 11100, createdBy: 'tp-5', createdDate: '2026-02-01', expirationDate: '2026-03-01', status: 'closed', category: 'Grading' },
  { id: 'poll-4', question: 'Will Giannis be traded this offseason?', options: [{ label: 'Yes, 100%', votes: 1200, percent: 15.8 }, { label: 'Likely (60-80%)', votes: 2100, percent: 27.6 }, { label: 'Maybe (40-60%)', votes: 2500, percent: 32.9 }, { label: 'Unlikely', votes: 1400, percent: 18.4 }, { label: 'No way', votes: 400, percent: 5.3 }], totalVotes: 7600, createdBy: 'tp-10', createdDate: '2026-03-10', expirationDate: '2026-04-10', status: 'active', category: 'NBA' },
  { id: 'poll-5', question: 'Which sport has the best card investment outlook for 2026-2027?', options: [{ label: 'Basketball', votes: 4200, percent: 35.0 }, { label: 'Baseball', votes: 3800, percent: 31.7 }, { label: 'Football', votes: 2800, percent: 23.3 }, { label: 'Hockey', votes: 750, percent: 6.3 }, { label: 'Soccer', votes: 450, percent: 3.7 }], totalVotes: 12000, createdBy: 'tp-18', createdDate: '2026-02-20', expirationDate: '2026-03-20', status: 'active', category: 'Market' },
  { id: 'poll-6', question: 'What is your average card purchase price?', options: [{ label: 'Under $25', votes: 3500, percent: 35.0 }, { label: '$25-$100', votes: 3200, percent: 32.0 }, { label: '$100-$500', votes: 1800, percent: 18.0 }, { label: '$500-$2000', votes: 1000, percent: 10.0 }, { label: '$2000+', votes: 500, percent: 5.0 }], totalVotes: 10000, createdBy: 'tp-6', createdDate: '2026-03-05', expirationDate: '2026-04-05', status: 'active', category: 'Demographics' },
  { id: 'poll-7', question: 'Caitlin Clark RC: buy, hold, or sell at current prices?', options: [{ label: 'Strong Buy', votes: 3800, percent: 38.0 }, { label: 'Buy', votes: 2500, percent: 25.0 }, { label: 'Hold', votes: 2200, percent: 22.0 }, { label: 'Sell', votes: 1000, percent: 10.0 }, { label: 'Strong Sell', votes: 500, percent: 5.0 }], totalVotes: 10000, createdBy: 'tp-3', createdDate: '2026-03-12', expirationDate: '2026-04-12', status: 'active', category: 'WNBA' },
  { id: 'poll-8', question: 'Best card show of 2026?', options: [{ label: 'National (Chicago)', votes: 5500, percent: 45.8 }, { label: 'NSCC Regional', votes: 1800, percent: 15.0 }, { label: 'Card Expo Toronto', votes: 1200, percent: 10.0 }, { label: 'Dallas Card Show', votes: 2200, percent: 18.3 }, { label: 'Other', votes: 1300, percent: 10.9 }], totalVotes: 12000, createdBy: 'tp-11', createdDate: '2026-01-15', expirationDate: '2026-02-15', status: 'closed', category: 'Events' },
  { id: 'poll-9', question: 'How many cards do you own?', options: [{ label: 'Under 100', votes: 2200, percent: 22.0 }, { label: '100-500', votes: 3000, percent: 30.0 }, { label: '500-2000', votes: 2500, percent: 25.0 }, { label: '2000-10000', votes: 1500, percent: 15.0 }, { label: '10000+', votes: 800, percent: 8.0 }], totalVotes: 10000, createdBy: 'tp-12', createdDate: '2026-02-28', expirationDate: '2026-03-28', status: 'active', category: 'Demographics' },
  { id: 'poll-10', question: 'Biggest bust rookie card of 2023-2024?', options: [{ label: 'Zion Williamson (continued)', votes: 2800, percent: 28.0 }, { label: 'Brandon Miller', votes: 1500, percent: 15.0 }, { label: 'Chet Holmgren', votes: 2200, percent: 22.0 }, { label: 'Scoot Henderson', votes: 2500, percent: 25.0 }, { label: 'Other', votes: 1000, percent: 10.0 }], totalVotes: 10000, createdBy: 'tp-4', createdDate: '2026-03-08', expirationDate: '2026-04-08', status: 'active', category: 'Basketball' },
];

// ---- Mock Data: Trading Challenges (8) ----

const MOCK_CHALLENGES: TradingChallenge[] = [
  { id: 'tc-1', title: 'March Madness Pick Challenge', description: 'Pick 10 cards that will increase the most during March Madness. Top portfolio return wins.', startDate: '2026-03-15', endDate: '2026-04-08', entryFee: 0, prizePool: 500, participants: 342, maxParticipants: 500, rules: ['Pick exactly 10 cards', 'No changes after lock date', 'Cards must be under $500 each', 'Returns measured by market price change'], status: 'upcoming', winnerId: null, winnerName: null },
  { id: 'tc-2', title: 'Rookie of the Year Portfolio', description: 'Build the best ROY candidate portfolio across all sports. Season-long challenge.', startDate: '2025-10-01', endDate: '2026-06-30', entryFee: 25, prizePool: 5000, participants: 189, maxParticipants: 250, rules: ['Select 5 ROY candidates', 'Must include at least 2 sports', 'One swap allowed per month', 'Final values at season end'], status: 'active', winnerId: null, winnerName: null },
  { id: 'tc-3', title: '$100 to $1000 Challenge', description: 'Start with $100 budget and try to grow it to $1000 through card flipping in 90 days.', startDate: '2026-01-01', endDate: '2026-03-31', entryFee: 0, prizePool: 250, participants: 520, maxParticipants: 1000, rules: ['Starting budget of $100', 'All transactions must be documented', 'No additional capital', 'Highest portfolio value wins'], status: 'active', winnerId: null, winnerName: null },
  { id: 'tc-4', title: 'Vintage vs Modern Showdown', description: 'Team Vintage vs Team Modern — which investment strategy wins over 6 months?', startDate: '2026-01-15', endDate: '2026-07-15', entryFee: 10, prizePool: 2000, participants: 280, maxParticipants: 400, rules: ['Choose Team Vintage or Team Modern', 'Pick 5 cards matching your team', 'No crossover picks allowed', 'Average return determines winner'], status: 'active', winnerId: null, winnerName: null },
  { id: 'tc-5', title: 'NFL Draft Speculation Sprint', description: 'Pick which 2025 NFL Draft rookies will have the highest card values by Week 1.', startDate: '2026-04-24', endDate: '2026-09-07', entryFee: 0, prizePool: 300, participants: 0, maxParticipants: 500, rules: ['Pick 5 draft-eligible players', 'Locks at draft start', 'Values measured at NFL Week 1', 'Must be drafted to qualify'], status: 'upcoming', winnerId: null, winnerName: null },
  { id: 'tc-6', title: 'Winter Trading Gauntlet 2025', description: 'Month-long trading competition with weekly elimination rounds.', startDate: '2025-12-01', endDate: '2025-12-31', entryFee: 15, prizePool: 3000, participants: 400, maxParticipants: 400, rules: ['Weekly pick submissions', 'Bottom 25% eliminated each week', 'Final round is top 25 traders', 'Cumulative return wins'], status: 'completed', winnerId: 'tp-14', winnerName: 'GrailChaser' },
  { id: 'tc-7', title: 'Baseball Season Long Portfolio', description: 'Build the ultimate baseball card portfolio for the 2026 MLB season.', startDate: '2026-03-27', endDate: '2026-10-31', entryFee: 20, prizePool: 4000, participants: 85, maxParticipants: 300, rules: ['Pick 8 baseball cards', 'Two swaps allowed total', 'Must include 1 prospect', 'World Series bonus multiplier'], status: 'upcoming', winnerId: null, winnerName: null },
  { id: 'tc-8', title: 'Single Card Showdown', description: 'Each trader picks ONE card. Highest return percentage wins. Simple.', startDate: '2026-02-01', endDate: '2026-05-01', entryFee: 5, prizePool: 1500, participants: 650, maxParticipants: 1000, rules: ['Pick exactly 1 card', 'Card must be under $1000', 'No changes allowed', 'Pure return percentage wins'], status: 'active', winnerId: null, winnerName: null },
];

// ---- Service Functions ----

export function getTraderProfiles(): TraderProfile[] {
  const cached = loadData<TraderProfile[]>('trader_profiles');
  if (cached) return cached;
  saveData('trader_profiles', MOCK_TRADERS);
  return MOCK_TRADERS;
}

export function getTraderById(id: string): TraderProfile | undefined {
  const traders = getTraderProfiles();
  return traders.find(t => t.id === id);
}

export function getTradePicks(): TradePick[] {
  const cached = loadData<TradePick[]>('trade_picks');
  if (cached) return cached;
  saveData('trade_picks', MOCK_PICKS);
  return MOCK_PICKS;
}

export function getPicksByTrader(traderId: string): TradePick[] {
  const picks = getTradePicks();
  return picks.filter(p => p.traderId === traderId);
}

export function getPicksByCategory(category: PickCategory): TradePick[] {
  const picks = getTradePicks();
  return picks.filter(p => p.category === category);
}

export function getCommunityPolls(): CommunityPoll[] {
  const cached = loadData<CommunityPoll[]>('community_polls');
  if (cached) return cached;
  saveData('community_polls', MOCK_POLLS);
  return MOCK_POLLS;
}

export function getActivePolls(): CommunityPoll[] {
  const polls = getCommunityPolls();
  return polls.filter(p => p.status === 'active');
}

export function getTradingChallenges(): TradingChallenge[] {
  const cached = loadData<TradingChallenge[]>('trading_challenges');
  if (cached) return cached;
  saveData('trading_challenges', MOCK_CHALLENGES);
  return MOCK_CHALLENGES;
}

export function getActiveChallenges(): TradingChallenge[] {
  const challenges = getTradingChallenges();
  return challenges.filter(c => c.status === 'active' || c.status === 'upcoming');
}

export function getLeaderboard(): LeaderboardEntry[] {
  const traders = getTraderProfiles();
  return traders
    .sort((a, b) => b.avgReturn - a.avgReturn)
    .map((t, i) => ({
      rank: i + 1,
      traderId: t.id,
      traderName: t.displayName,
      totalReturn: t.avgReturn,
      winRate: t.winRate,
      totalPicks: t.totalPicks,
      avgHoldDays: Math.floor(Math.random() * 60) + 10,
      streak: t.streak,
      tier: t.tier,
      change: Math.floor(Math.random() * 5) - 2,
    }));
}

export function getTopTraders(limit: number = 10): TraderProfile[] {
  const traders = getTraderProfiles();
  return [...traders].sort((a, b) => b.reputation - a.reputation).slice(0, limit);
}

export function getMarketConsensus(player: string): MarketConsensus {
  const picks = getTradePicks().filter(p => p.player === player);
  const bullish = picks.filter(p => p.sentiment === 'bullish' || p.sentiment === 'very_bullish').length;
  const bearish = picks.filter(p => p.sentiment === 'bearish' || p.sentiment === 'very_bearish').length;
  const neutral = picks.filter(p => p.sentiment === 'neutral').length;
  const total = picks.length || 1;
  return {
    cardName: picks[0]?.cardName || player,
    player,
    bullishPercent: (bullish / total) * 100,
    bearishPercent: (bearish / total) * 100,
    neutralPercent: (neutral / total) * 100,
    totalVotes: total,
    averageTargetPrice: picks.reduce((sum, p) => sum + p.targetPrice, 0) / total,
    currentPrice: picks[0]?.currentPrice || 0,
    consensusSentiment: bullish > bearish ? 'bullish' : bearish > bullish ? 'bearish' : 'neutral',
  };
}

export function getTrendingPicks(limit: number = 10): TradePick[] {
  const picks = getTradePicks();
  return [...picks].sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)).slice(0, limit);
}

export function getPicksBySentiment(sentiment: Sentiment): TradePick[] {
  const picks = getTradePicks();
  return picks.filter(p => p.sentiment === sentiment);
}
