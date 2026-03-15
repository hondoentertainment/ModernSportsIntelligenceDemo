// ── Phase 133: Social Trading Tournament Arena ──────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────────

export type TournamentType = 'weekly' | 'monthly' | 'seasonal' | 'championship';
export type TournamentStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type TradeDirection = 'buy' | 'sell';

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  entry_fee: number;
  prize_pool: number;
  start_date: string;
  end_date: string;
  status: TournamentStatus;
  max_participants: number;
  current_participants: number;
  description: string;
  rules: string;
}

export interface TournamentEntry {
  id: string;
  tournament_id: string;
  user: string;
  portfolio_snapshot: PaperTradePortfolio;
  current_value: number;
  starting_value: number;
  pnl: number;
  pnl_pct: number;
  rank: number;
  prev_rank: number;
  trades: TradeAction[];
  joined_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  prev_rank: number;
  user: string;
  avatar_color: string;
  current_value: number;
  pnl: number;
  pnl_pct: number;
  trades_count: number;
  best_trade: string;
  is_you: boolean;
}

export interface TradeAction {
  id: string;
  tournament_id: string;
  card_name: string;
  direction: TradeDirection;
  quantity: number;
  price: number;
  timestamp: string;
  pnl_impact: number;
}

export interface TournamentResult {
  tournament_id: string;
  tournament_name: string;
  type: TournamentType;
  finish_rank: number;
  total_participants: number;
  final_pnl: number;
  final_pnl_pct: number;
  prize_won: number;
  top_trade: string;
  completed_date: string;
}

export interface SpectatorView {
  user: string;
  tournament_id: string;
  portfolio_cards: { card_name: string; allocation_pct: number; pnl: number }[];
  total_value: number;
  pnl: number;
  pnl_pct: number;
  recent_trades: TradeAction[];
  reveal_delay_hours: number;
}

export interface TournamentHistory {
  total_entered: number;
  total_winnings: number;
  best_finish: number;
  avg_finish_pct: number;
  win_rate: number;
  results: TournamentResult[];
}

export interface PaperTradePortfolio {
  cash: number;
  positions: { card_name: string; quantity: number; avg_cost: number; current_price: number; pnl: number }[];
  total_value: number;
}

export interface WinningStrategy {
  strategy_name: string;
  description: string;
  win_rate: number;
  avg_return_pct: number;
  example_user: string;
  key_trades: string[];
}

export interface TournamentStats {
  total_tournaments_hosted: number;
  total_prize_money_distributed: number;
  avg_participants_per_tournament: number;
  most_popular_type: TournamentType;
  biggest_single_win: number;
  top_winning_card: string;
}

export interface SeasonalChampionship {
  season: string;
  current_leader: string;
  your_points: number;
  leader_points: number;
  events_remaining: number;
  standings: { rank: number; user: string; points: number; events_played: number }[];
}

// ── Mock Tournaments ────────────────────────────────────────────────────────────

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 'tourn-001', name: 'Weekly Free-Roll Challenge', type: 'weekly',
    entry_fee: 0, prize_pool: 500, start_date: '2026-03-10T00:00:00Z', end_date: '2026-03-16T23:59:59Z',
    status: 'active', max_participants: 200, current_participants: 187,
    description: 'Free entry weekly tournament. Build the best paper portfolio in 7 days.',
    rules: 'Start with $10,000 virtual cash. Max 10 positions. No more than 25% in any single card.',
  },
  {
    id: 'tourn-002', name: 'March Madness Showdown', type: 'monthly',
    entry_fee: 25, prize_pool: 5000, start_date: '2026-03-01T00:00:00Z', end_date: '2026-03-31T23:59:59Z',
    status: 'active', max_participants: 100, current_participants: 94,
    description: 'Monthly championship focusing on basketball card markets during March Madness.',
    rules: 'Start with $50,000 virtual cash. Basketball cards only. Unlimited trades.',
  },
  {
    id: 'tourn-003', name: 'Rookie Rush Sprint', type: 'weekly',
    entry_fee: 10, prize_pool: 1500, start_date: '2026-03-12T00:00:00Z', end_date: '2026-03-18T23:59:59Z',
    status: 'active', max_participants: 150, current_participants: 142,
    description: 'Trade only rookie cards in this fast-paced weekly sprint.',
    rules: 'Start with $25,000 virtual cash. Rookie cards only. Max 15 trades per day.',
  },
  {
    id: 'tourn-004', name: 'Diamond Hands Derby', type: 'monthly',
    entry_fee: 100, prize_pool: 15000, start_date: '2026-03-01T00:00:00Z', end_date: '2026-03-31T23:59:59Z',
    status: 'active', max_participants: 50, current_participants: 48,
    description: 'High-stakes monthly tournament for serious traders. Buy and hold strategy focus.',
    rules: 'Start with $100,000 virtual cash. Max 5 trades total. Must hold minimum 72 hours.',
  },
  {
    id: 'tourn-005', name: 'Spring Season Championship', type: 'seasonal',
    entry_fee: 50, prize_pool: 25000, start_date: '2026-03-01T00:00:00Z', end_date: '2026-05-31T23:59:59Z',
    status: 'active', max_participants: 300, current_participants: 276,
    description: 'The premier seasonal championship. Points accumulate across weekly events.',
    rules: 'Compete in weekly sub-events. Top 10 finishes earn championship points. Grand prize at season end.',
  },
  {
    id: 'tourn-006', name: 'Weekend Warrior Blitz', type: 'weekly',
    entry_fee: 0, prize_pool: 250, start_date: '2026-03-20T00:00:00Z', end_date: '2026-03-22T23:59:59Z',
    status: 'upcoming', max_participants: 500, current_participants: 312,
    description: 'Free 48-hour weekend blitz. Fast trades, big swings.',
    rules: 'Start with $5,000 virtual cash. All card types. Unlimited trades.',
  },
  {
    id: 'tourn-007', name: 'Vintage Vault Invitational', type: 'monthly',
    entry_fee: 100, prize_pool: 10000, start_date: '2026-04-01T00:00:00Z', end_date: '2026-04-30T23:59:59Z',
    status: 'upcoming', max_participants: 75, current_participants: 41,
    description: 'Trade vintage cards (pre-2000) only. Knowledge is your edge.',
    rules: 'Start with $200,000 virtual cash. Vintage cards only. Min holding period 48 hours.',
  },
  {
    id: 'tourn-008', name: 'Grand Championship Finale 2026', type: 'championship',
    entry_fee: 0, prize_pool: 50000, start_date: '2026-06-01T00:00:00Z', end_date: '2026-06-30T23:59:59Z',
    status: 'upcoming', max_participants: 64, current_participants: 0,
    description: 'Invite-only championship for the top 64 seasonal performers. The ultimate showdown.',
    rules: 'Qualification required. Top 64 from Spring Season. Full market access. Winner takes $25,000.',
  },
];

// ── Mock Leaderboard Data ───────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500',
  'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500',
];

const MOCK_PARTICIPANTS: string[] = [
  'CardShark_88', 'WaxRipper_Pro', 'GemMintGuru', 'SlabKing420', 'PrizmHunter',
  'ToppsTrader', 'VintageVault_Ed', 'RookieChaser', 'PSA10Collector', 'BreakKingz',
  'SilverStack_Mike', 'ChromeChasers', 'PatchAutoKing', 'CardFlipMaster', 'HobbyBoxHero',
  'WembyWatcher', 'MahomesMaxi', 'OhtaniObsessed', 'YamalYolo', 'EdwardsElite',
  'JordanJuggler', 'GriffeyGrinder', 'TroutTrader', 'BradyBull', 'CurryCollector',
  'MantleMaven', 'RuthRelic', 'LeBronLover', 'ZionZealot', 'LukaLongterm',
  'HollidayHolder', 'WilliamsWin', 'CalebCatcher', 'StroudSniper', 'YoungGunYield',
  'HarperHawk', 'SotoSwinger', 'JudgeJuror', 'AcunaAce', 'DeversDealer',
  'LaytonLegend', 'NicksNiche', 'PeelzPro', 'RipCityRival', 'JabsFanatic',
  'PackManPaul', 'CardClinic_Joe', 'TurboBreaks_Dan', 'GradingGuild', 'WaxMuseum_Al',
];

function generateLeaderboard(tournamentId: string, count: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const shuffled = [...MOCK_PARTICIPANTS].sort(() => Math.random() - 0.5).slice(0, count);

  for (let i = 0; i < shuffled.length; i++) {
    const pnl_pct = 25 - (i * 1.2) + (Math.random() * 4 - 2);
    const startVal = tournamentId === 'tourn-004' ? 100000 : tournamentId === 'tourn-002' ? 50000 : 10000;
    const pnl = startVal * (pnl_pct / 100);
    entries.push({
      rank: i + 1,
      prev_rank: Math.max(1, i + 1 + Math.floor(Math.random() * 5 - 2)),
      user: shuffled[i],
      avatar_color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      current_value: Math.round(startVal + pnl),
      pnl: Math.round(pnl),
      pnl_pct: Math.round(pnl_pct * 100) / 100,
      trades_count: Math.floor(Math.random() * 30) + 5,
      best_trade: ['Wemby Prizm Silver +18%', 'Ohtani Bowman Chrome +12%', 'Lamine Yamal +22%', 'Holliday BC 1st +15%', 'Caleb Williams Optic +31%'][i % 5],
      is_you: i === 7,
    });
  }

  return entries;
}

// ── Mock Trade Actions ──────────────────────────────────────────────────────────

const MOCK_MY_TRADES: TradeAction[] = [
  { id: 'trade-001', tournament_id: 'tourn-001', card_name: '2023 Prizm Silver Wembanyama RC', direction: 'buy', quantity: 2, price: 920, timestamp: '2026-03-10T09:30:00Z', pnl_impact: 340 },
  { id: 'trade-002', tournament_id: 'tourn-001', card_name: '2024 Optic Caleb Williams RC', direction: 'buy', quantity: 5, price: 185, timestamp: '2026-03-10T10:15:00Z', pnl_impact: 575 },
  { id: 'trade-003', tournament_id: 'tourn-001', card_name: '2022 Bowman Chrome 1st Jackson Holliday', direction: 'buy', quantity: 3, price: 310, timestamp: '2026-03-11T08:00:00Z', pnl_impact: 195 },
  { id: 'trade-004', tournament_id: 'tourn-001', card_name: '2024 Optic Caleb Williams RC', direction: 'sell', quantity: 3, price: 265, timestamp: '2026-03-12T16:30:00Z', pnl_impact: 240 },
  { id: 'trade-005', tournament_id: 'tourn-002', card_name: '2020 Prizm Anthony Edwards RC', direction: 'buy', quantity: 1, price: 1100, timestamp: '2026-03-02T11:00:00Z', pnl_impact: 150 },
  { id: 'trade-006', tournament_id: 'tourn-002', card_name: '2023 Prizm Silver Wembanyama RC', direction: 'buy', quantity: 1, price: 880, timestamp: '2026-03-05T09:45:00Z', pnl_impact: 420 },
  { id: 'trade-007', tournament_id: 'tourn-002', card_name: '2017 Prizm Jaylen Brown RC', direction: 'sell', quantity: 2, price: 405, timestamp: '2026-03-08T14:20:00Z', pnl_impact: -90 },
  { id: 'trade-008', tournament_id: 'tourn-003', card_name: '2024 Optic Caleb Williams RC', direction: 'buy', quantity: 8, price: 190, timestamp: '2026-03-12T07:30:00Z', pnl_impact: 560 },
  { id: 'trade-009', tournament_id: 'tourn-003', card_name: '2023 Topps Chrome Lamine Yamal RC', direction: 'buy', quantity: 1, price: 1200, timestamp: '2026-03-12T08:15:00Z', pnl_impact: 220 },
  { id: 'trade-010', tournament_id: 'tourn-003', card_name: '2024 Bowman Chrome 1st Roki Sasaki', direction: 'buy', quantity: 4, price: 280, timestamp: '2026-03-13T10:00:00Z', pnl_impact: 140 },
];

// ── Mock My Entries ─────────────────────────────────────────────────────────────

const MOCK_MY_ENTRIES: TournamentEntry[] = [
  {
    id: 'entry-001', tournament_id: 'tourn-001', user: 'You',
    portfolio_snapshot: {
      cash: 2145,
      positions: [
        { card_name: '2023 Prizm Silver Wembanyama RC', quantity: 2, avg_cost: 920, current_price: 1090, pnl: 340 },
        { card_name: '2024 Optic Caleb Williams RC', quantity: 2, avg_cost: 185, current_price: 260, pnl: 150 },
        { card_name: '2022 Bowman Chrome 1st Jackson Holliday', quantity: 3, avg_cost: 310, current_price: 375, pnl: 195 },
      ],
      total_value: 12180,
    },
    current_value: 12180, starting_value: 10000, pnl: 2180, pnl_pct: 21.8,
    rank: 8, prev_rank: 11, trades: MOCK_MY_TRADES.filter(t => t.tournament_id === 'tourn-001'),
    joined_at: '2026-03-10T00:05:00Z',
  },
  {
    id: 'entry-002', tournament_id: 'tourn-002', user: 'You',
    portfolio_snapshot: {
      cash: 15420,
      positions: [
        { card_name: '2020 Prizm Anthony Edwards RC', quantity: 1, avg_cost: 1100, current_price: 1250, pnl: 150 },
        { card_name: '2023 Prizm Silver Wembanyama RC', quantity: 1, avg_cost: 880, current_price: 1300, pnl: 420 },
        { card_name: '2017 Prizm Jaylen Brown RC', quantity: 0, avg_cost: 0, current_price: 380, pnl: -90 },
      ],
      total_value: 52900,
    },
    current_value: 52900, starting_value: 50000, pnl: 2900, pnl_pct: 5.8,
    rank: 22, prev_rank: 25, trades: MOCK_MY_TRADES.filter(t => t.tournament_id === 'tourn-002'),
    joined_at: '2026-03-01T00:10:00Z',
  },
  {
    id: 'entry-003', tournament_id: 'tourn-003', user: 'You',
    portfolio_snapshot: {
      cash: 4180,
      positions: [
        { card_name: '2024 Optic Caleb Williams RC', quantity: 8, avg_cost: 190, current_price: 260, pnl: 560 },
        { card_name: '2023 Topps Chrome Lamine Yamal RC', quantity: 1, avg_cost: 1200, current_price: 1420, pnl: 220 },
        { card_name: '2024 Bowman Chrome 1st Roki Sasaki', quantity: 4, avg_cost: 280, current_price: 315, pnl: 140 },
      ],
      total_value: 27840,
    },
    current_value: 27840, starting_value: 25000, pnl: 2840, pnl_pct: 11.36,
    rank: 5, prev_rank: 8, trades: MOCK_MY_TRADES.filter(t => t.tournament_id === 'tourn-003'),
    joined_at: '2026-03-12T00:02:00Z',
  },
];

// ── Mock Tournament History ─────────────────────────────────────────────────────

const MOCK_TOURNAMENT_RESULTS: TournamentResult[] = [
  { tournament_id: 'past-001', tournament_name: 'Weekly Free-Roll #11', type: 'weekly', finish_rank: 3, total_participants: 195, final_pnl: 3420, final_pnl_pct: 34.2, prize_won: 100, top_trade: 'Wemby Prizm Silver +28%', completed_date: '2026-03-09T23:59:59Z' },
  { tournament_id: 'past-002', tournament_name: 'February Championship', type: 'monthly', finish_rank: 12, total_participants: 88, final_pnl: 8500, final_pnl_pct: 17.0, prize_won: 0, top_trade: 'Ohtani BC +15%', completed_date: '2026-02-28T23:59:59Z' },
  { tournament_id: 'past-003', tournament_name: 'Weekly Free-Roll #10', type: 'weekly', finish_rank: 1, total_participants: 210, final_pnl: 4800, final_pnl_pct: 48.0, prize_won: 250, top_trade: 'Caleb Williams Optic +44%', completed_date: '2026-03-02T23:59:59Z' },
  { tournament_id: 'past-004', tournament_name: 'Rookie Rush Sprint #8', type: 'weekly', finish_rank: 6, total_participants: 138, final_pnl: 5100, final_pnl_pct: 20.4, prize_won: 50, top_trade: 'Holliday BC 1st +19%', completed_date: '2026-03-05T23:59:59Z' },
  { tournament_id: 'past-005', tournament_name: 'Winter Season Championship', type: 'seasonal', finish_rank: 8, total_participants: 290, final_pnl: 42000, final_pnl_pct: 14.0, prize_won: 500, top_trade: 'LeBron Prizm Silver +22%', completed_date: '2026-02-28T23:59:59Z' },
  { tournament_id: 'past-006', tournament_name: 'Weekly Free-Roll #9', type: 'weekly', finish_rank: 15, total_participants: 180, final_pnl: 1200, final_pnl_pct: 12.0, prize_won: 0, top_trade: 'Edwards Prizm +11%', completed_date: '2026-02-23T23:59:59Z' },
  { tournament_id: 'past-007', tournament_name: 'Diamond Hands Feb', type: 'monthly', finish_rank: 5, total_participants: 45, final_pnl: 18700, final_pnl_pct: 18.7, prize_won: 750, top_trade: 'Wemby Prizm Silver +24%', completed_date: '2026-02-28T23:59:59Z' },
  { tournament_id: 'past-008', tournament_name: 'Rookie Rush Sprint #7', type: 'weekly', finish_rank: 2, total_participants: 145, final_pnl: 6300, final_pnl_pct: 25.2, prize_won: 150, top_trade: 'Yamal Topps Chrome +18%', completed_date: '2026-02-26T23:59:59Z' },
];

// ── Mock Winning Strategies ─────────────────────────────────────────────────────

const MOCK_WINNING_STRATEGIES: WinningStrategy[] = [
  {
    strategy_name: 'Hype Decay Rider', description: 'Buy cards 24-48h after influencer mentions when the initial spike reverts 40-60%. Ride the secondary floor.',
    win_rate: 68, avg_return_pct: 22.5, example_user: 'CardShark_88',
    key_trades: ['Wemby Prizm at $880 post-Gary V decay', 'Caleb Williams at $200 post-TikTok revert'],
  },
  {
    strategy_name: 'Rookie Momentum Stack', description: 'Concentrate on top 3 rookie cards showing consistent volume growth over 7 days. Sell on any 30%+ spike.',
    win_rate: 61, avg_return_pct: 18.3, example_user: 'RookieChaser',
    key_trades: ['Holliday BC 1st accumulation at $290', 'Stroud Prizm momentum entry at $420'],
  },
  {
    strategy_name: 'Vintage Value Play', description: 'Target undervalued vintage cards with upcoming hall-of-fame or anniversary catalysts. Hold through the event.',
    win_rate: 72, avg_return_pct: 15.8, example_user: 'VintageVault_Ed',
    key_trades: ['Griffey Topps Chrome before HOF anniversary', 'Jeter Bowman Chrome pre-ceremony'],
  },
  {
    strategy_name: 'Cross-Sport Arbitrage', description: 'Exploit pricing gaps between sports during off-season periods. Buy baseball in winter, football in summer.',
    win_rate: 58, avg_return_pct: 13.2, example_user: 'ChromeChasers',
    key_trades: ['Baseball buys in January', 'Football sells during NFL draft hype'],
  },
];

// ── Mock Seasonal Championship ──────────────────────────────────────────────────

const MOCK_SEASONAL_CHAMPIONSHIP: SeasonalChampionship = {
  season: 'Spring 2026',
  current_leader: 'CardShark_88',
  your_points: 2450,
  leader_points: 3800,
  events_remaining: 8,
  standings: [
    { rank: 1, user: 'CardShark_88', points: 3800, events_played: 4 },
    { rank: 2, user: 'GemMintGuru', points: 3200, events_played: 4 },
    { rank: 3, user: 'PrizmHunter', points: 2950, events_played: 3 },
    { rank: 4, user: 'WaxRipper_Pro', points: 2700, events_played: 4 },
    { rank: 5, user: 'SlabKing420', points: 2600, events_played: 3 },
    { rank: 6, user: 'RookieChaser', points: 2500, events_played: 4 },
    { rank: 7, user: 'You', points: 2450, events_played: 3 },
    { rank: 8, user: 'ToppsTrader', points: 2300, events_played: 4 },
    { rank: 9, user: 'PSA10Collector', points: 2100, events_played: 3 },
    { rank: 10, user: 'BreakKingz', points: 1950, events_played: 4 },
  ],
};

// ── Mock Tournament Stats ───────────────────────────────────────────────────────

const MOCK_TOURNAMENT_STATS: TournamentStats = {
  total_tournaments_hosted: 156,
  total_prize_money_distributed: 425000,
  avg_participants_per_tournament: 132,
  most_popular_type: 'weekly',
  biggest_single_win: 25000,
  top_winning_card: '2023 Prizm Silver Wembanyama RC',
};

// ── Helper Functions ─────────────────────────────────────────────────────────────

export function tournamentTypeLabel(type: TournamentType): string {
  const map: Record<TournamentType, string> = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    seasonal: 'Seasonal',
    championship: 'Championship',
  };
  return map[type];
}

function tournamentTypeColor(type: TournamentType): string {
  const map: Record<TournamentType, string> = {
    weekly: 'text-emerald-400',
    monthly: 'text-blue-400',
    seasonal: 'text-purple-400',
    championship: 'text-amber-400',
  };
  return map[type];
}

export function tournamentTypeBadgeColor(type: TournamentType): string {
  const map: Record<TournamentType, string> = {
    weekly: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    monthly: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    seasonal: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    championship: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  };
  return map[type];
}

export function statusLabel(status: TournamentStatus): string {
  const map: Record<TournamentStatus, string> = {
    upcoming: 'Upcoming',
    active: 'Live',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status];
}

export function statusBadgeColor(status: TournamentStatus): string {
  const map: Record<TournamentStatus, string> = {
    upcoming: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    completed: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/40',
  };
  return map[status];
}

export function rankChangeIndicator(current: number, previous: number): { symbol: string; color: string } {
  if (current < previous) return { symbol: `▲${previous - current}`, color: 'text-emerald-400' };
  if (current > previous) return { symbol: `▼${current - previous}`, color: 'text-red-400' };
  return { symbol: '—', color: 'text-slate-500' };
}

// ── Public API ───────────────────────────────────────────────────────────────────

/** Get all currently active tournaments */
export function getActiveTournaments(): Tournament[] {
  return MOCK_TOURNAMENTS.filter(t => t.status === 'active');
}

/** Get all upcoming tournaments */
export function getUpcomingTournaments(): Tournament[] {
  return MOCK_TOURNAMENTS.filter(t => t.status === 'upcoming');
}

/** Get tournament leaderboard by tournament ID */
export function getTournamentLeaderboard(id: string): LeaderboardEntry[] {
  const tournament = MOCK_TOURNAMENTS.find(t => t.id === id);
  if (!tournament) return [];
  return generateLeaderboard(id, Math.min(tournament.current_participants, 25));
}

/** Get all tournaments user has entered */
export function getMyEntries(): TournamentEntry[] {
  return MOCK_MY_ENTRIES;
}

/** Join a tournament (simulated) */
export function joinTournament(id: string): { success: boolean; entry?: TournamentEntry; error?: string } {
  const tournament = MOCK_TOURNAMENTS.find(t => t.id === id);
  if (!tournament) return { success: false, error: 'Tournament not found' };
  if (tournament.current_participants >= tournament.max_participants) return { success: false, error: 'Tournament is full' };
  if (MOCK_MY_ENTRIES.some(e => e.tournament_id === id)) return { success: false, error: 'Already entered' };
  const startingCash = tournament.type === 'championship' ? 100000 : tournament.type === 'monthly' ? 50000 : 10000;
  const newEntry: TournamentEntry = {
    id: `entry-new-${Date.now()}`, tournament_id: id, user: 'You',
    portfolio_snapshot: { cash: startingCash, positions: [], total_value: startingCash },
    current_value: startingCash, starting_value: startingCash, pnl: 0, pnl_pct: 0,
    rank: tournament.current_participants + 1, prev_rank: tournament.current_participants + 1,
    trades: [], joined_at: new Date().toISOString(),
  };
  return { success: true, entry: newEntry };
}

/** Execute a paper trade in a tournament */
export function executePaperTrade(tournamentId: string, trade: Omit<TradeAction, 'id' | 'tournament_id' | 'timestamp' | 'pnl_impact'>): { success: boolean; trade?: TradeAction; error?: string } {
  const entry = MOCK_MY_ENTRIES.find(e => e.tournament_id === tournamentId);
  if (!entry) return { success: false, error: 'Not entered in this tournament' };
  const totalCost = trade.price * trade.quantity;
  if (trade.direction === 'buy' && totalCost > entry.portfolio_snapshot.cash) {
    return { success: false, error: 'Insufficient virtual cash' };
  }
  const newTrade: TradeAction = {
    id: `trade-${Date.now()}`, tournament_id: tournamentId,
    card_name: trade.card_name, direction: trade.direction,
    quantity: trade.quantity, price: trade.price,
    timestamp: new Date().toISOString(), pnl_impact: 0,
  };
  return { success: true, trade: newTrade };
}

/** Get full portfolio snapshot for an entry */
export function getPortfolioSnapshot(entryId: string): PaperTradePortfolio | null {
  const entry = MOCK_MY_ENTRIES.find(e => e.id === entryId);
  return entry?.portfolio_snapshot ?? null;
}

/** Spectate another user's portfolio (with delayed reveal) */
export function spectateUser(userId: string, tournamentId: string): SpectatorView {
  return {
    user: userId, tournament_id: tournamentId,
    portfolio_cards: [
      { card_name: '2023 Prizm Silver Wembanyama RC', allocation_pct: 35, pnl: 680 },
      { card_name: '2024 Optic Caleb Williams RC', allocation_pct: 20, pnl: 320 },
      { card_name: '2022 Bowman Chrome 1st Jackson Holliday', allocation_pct: 18, pnl: 145 },
      { card_name: 'Hidden Position (reveals in 4h)', allocation_pct: 15, pnl: 0 },
      { card_name: 'Hidden Position (reveals in 8h)', allocation_pct: 12, pnl: 0 },
    ],
    total_value: 13500, pnl: 3500, pnl_pct: 35.0,
    recent_trades: [
      { id: 'spec-t1', tournament_id: tournamentId, card_name: '2024 Optic Caleb Williams RC', direction: 'sell', quantity: 3, price: 270, timestamp: '2026-03-13T11:00:00Z', pnl_impact: 255 },
    ],
    reveal_delay_hours: 4,
  };
}

/** Get tournament history and results */
export function getTournamentHistory(): TournamentHistory {
  const results = MOCK_TOURNAMENT_RESULTS;
  const wins = results.filter(r => r.finish_rank <= 3);
  return {
    total_entered: results.length + MOCK_MY_ENTRIES.length,
    total_winnings: results.reduce((sum, r) => sum + r.prize_won, 0),
    best_finish: 1,
    avg_finish_pct: Math.round(results.reduce((sum, r) => sum + (r.finish_rank / r.total_participants) * 100, 0) / results.length),
    win_rate: Math.round((wins.length / results.length) * 100),
    results,
  };
}

/** Get winning strategies from top performers */
export function getWinningStrategies(): WinningStrategy[] {
  return MOCK_WINNING_STRATEGIES;
}

/** Get seasonal championship data */
export function getSeasonalChampionship(): SeasonalChampionship {
  return MOCK_SEASONAL_CHAMPIONSHIP;
}

/** Get paper trading portfolio for a specific tournament */
export function getPaperTradingPortfolio(tournamentId: string): PaperTradePortfolio | null {
  const entry = MOCK_MY_ENTRIES.find(e => e.tournament_id === tournamentId);
  return entry?.portfolio_snapshot ?? null;
}

/** Get overall tournament platform stats */
export function getTournamentStats(): TournamentStats {
  return MOCK_TOURNAMENT_STATS;
}

// Re-export helpers for use in components
export {
  tournamentTypeColor,
};

// ---- Page-compatible helpers (used by TournamentArena) ----

