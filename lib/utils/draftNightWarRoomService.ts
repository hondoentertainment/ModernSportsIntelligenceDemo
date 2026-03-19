// ── Draft Night War Room Service ─────────────────────────────────────────────
// Synchronized watch parties with real-time card price tracking,
// group prediction markets, and live position-taking during NFL/MLB/NBA drafts.

// ── Types ────────────────────────────────────────────────────────────────────

export type DraftStatus = 'pre-draft' | 'live' | 'completed';
export type DraftSport = 'NFL' | 'MLB' | 'NBA' | 'NHL';
export type PredictionOutcome = 'correct' | 'incorrect' | 'pending';

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface DraftPick {
  pickNumber: number;
  round: number;
  team: string;
  playerName: string;
  position: string;
  college: string;
  preDraftCardPrice: number;
  postDraftCardPrice: number;
  priceChange: number;
  priceMovePercent: number;
  timestamp: string;
}

export interface WarRoomMember {
  userId: string;
  handle: string;
  predictions: number;
  correctPredictions: number;
  accuracy: number;
  activeTrades: number;
  profitLoss: number;
  isOnline: boolean;
}

export interface Prediction {
  id: string;
  memberHandle: string;
  type: 'pick-order' | 'team-fit' | 'price-move' | 'sleeper';
  content: string;
  targetPick: number | null;
  outcome: PredictionOutcome;
  points: number;
  timestamp: string;
}

export interface LiveTrade {
  id: string;
  memberHandle: string;
  action: 'buy' | 'sell' | 'hold';
  cardName: string;
  price: number;
  pickTrigger: number | null;
  timestamp: string;
  pnl: number | null;
}

export interface DraftWarRoom {
  id: string;
  name: string;
  draftSport: DraftSport;
  draftDate: string;
  status: DraftStatus;
  hostHandle: string;
  memberCount: number;
  members: WarRoomMember[];
  picks: DraftPick[];
  predictions: Prediction[];
  liveTrades: LiveTrade[];
  currentPick: number;
  totalPicks: number;
  preDraftVolume: number;
  liveDraftVolume: number;
  biggestMover: string;
  biggestDrop: string;
}

export interface DraftWarRoomStats {
  draftsAttended: number;
  totalPredictions: number;
  predictionAccuracy: number;
  totalLiveTrades: number;
  draftNightPnL: number;
  bestPrediction: string;
  favoriteTeam: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const NFL_2026_MEMBERS: WarRoomMember[] = [
  { userId: 'u1', handle: 'RookieKingMVP', predictions: 8, correctPredictions: 5, accuracy: 62.5, activeTrades: 3, profitLoss: 1240, isOnline: true },
  { userId: 'u2', handle: 'WaxRippa', predictions: 6, correctPredictions: 4, accuracy: 66.7, activeTrades: 2, profitLoss: 890, isOnline: true },
  { userId: 'u3', handle: 'DraftDayTrader', predictions: 7, correctPredictions: 3, accuracy: 42.9, activeTrades: 4, profitLoss: -320, isOnline: true },
  { userId: 'u4', handle: 'MintyFreshPulls', predictions: 5, correctPredictions: 3, accuracy: 60.0, activeTrades: 1, profitLoss: 475, isOnline: true },
  { userId: 'u5', handle: 'SlabGod99', predictions: 4, correctPredictions: 2, accuracy: 50.0, activeTrades: 2, profitLoss: -85, isOnline: false },
];

const NFL_2026_PICKS: DraftPick[] = [
  { pickNumber: 1, round: 1, team: 'Tennessee Titans', playerName: 'Shedeur Sanders', position: 'QB', college: 'Colorado', preDraftCardPrice: 485, postDraftCardPrice: 742, priceChange: 257, priceMovePercent: 53.0, timestamp: '2026-04-23T20:02:00Z' },
  { pickNumber: 2, round: 1, team: 'Cleveland Browns', playerName: 'Cam Ward', position: 'QB', college: 'Miami (FL)', preDraftCardPrice: 410, postDraftCardPrice: 515, priceChange: 105, priceMovePercent: 25.6, timestamp: '2026-04-23T20:14:00Z' },
  { pickNumber: 3, round: 1, team: 'New York Giants', playerName: 'Travis Hunter', position: 'WR/CB', college: 'Colorado', preDraftCardPrice: 620, postDraftCardPrice: 985, priceChange: 365, priceMovePercent: 58.9, timestamp: '2026-04-23T20:26:00Z' },
  { pickNumber: 4, round: 1, team: 'New England Patriots', playerName: 'Mason Graham', position: 'DT', college: 'Michigan', preDraftCardPrice: 85, postDraftCardPrice: 110, priceChange: 25, priceMovePercent: 29.4, timestamp: '2026-04-23T20:38:00Z' },
  { pickNumber: 5, round: 1, team: 'Jacksonville Jaguars', playerName: 'Abdul Carter', position: 'EDGE', college: 'Penn State', preDraftCardPrice: 185, postDraftCardPrice: 265, priceChange: 80, priceMovePercent: 43.2, timestamp: '2026-04-23T20:50:00Z' },
  { pickNumber: 6, round: 1, team: 'Las Vegas Raiders', playerName: 'Tetairoa McMillan', position: 'WR', college: 'Arizona', preDraftCardPrice: 275, postDraftCardPrice: 310, priceChange: 35, priceMovePercent: 12.7, timestamp: '2026-04-23T21:02:00Z' },
  { pickNumber: 7, round: 1, team: 'New York Jets', playerName: 'Will Johnson', position: 'WR', college: 'Michigan', preDraftCardPrice: 145, postDraftCardPrice: 230, priceChange: 85, priceMovePercent: 58.6, timestamp: '2026-04-23T21:14:00Z' },
  { pickNumber: 8, round: 1, team: 'Carolina Panthers', playerName: 'Mykel Williams', position: 'EDGE', college: 'Georgia', preDraftCardPrice: 120, postDraftCardPrice: 155, priceChange: 35, priceMovePercent: 29.2, timestamp: '2026-04-23T21:26:00Z' },
  { pickNumber: 9, round: 1, team: 'Dallas Cowboys', playerName: 'Kelvin Banks Jr.', position: 'OT', college: 'Texas', preDraftCardPrice: 60, postDraftCardPrice: 95, priceChange: 35, priceMovePercent: 58.3, timestamp: '2026-04-23T21:38:00Z' },
  { pickNumber: 10, round: 1, team: 'Chicago Bears', playerName: 'Tyler Warren', position: 'TE', college: 'Penn State', preDraftCardPrice: 175, postDraftCardPrice: 290, priceChange: 115, priceMovePercent: 65.7, timestamp: '2026-04-23T21:50:00Z' },
  { pickNumber: 11, round: 1, team: 'San Francisco 49ers', playerName: 'Luther Burden III', position: 'WR', college: 'Missouri', preDraftCardPrice: 195, postDraftCardPrice: 340, priceChange: 145, priceMovePercent: 74.4, timestamp: '2026-04-23T22:02:00Z' },
  { pickNumber: 12, round: 1, team: 'Miami Dolphins', playerName: 'Colston Loveland', position: 'TE', college: 'Michigan', preDraftCardPrice: 130, postDraftCardPrice: 195, priceChange: 65, priceMovePercent: 50.0, timestamp: '2026-04-23T22:14:00Z' },
];

const NFL_2026_PREDICTIONS: Prediction[] = [
  { id: 'p1', memberHandle: 'RookieKingMVP', type: 'pick-order', content: 'Sanders goes #1 overall to Tennessee', targetPick: 1, outcome: 'correct', points: 100, timestamp: '2026-04-23T19:30:00Z' },
  { id: 'p2', memberHandle: 'WaxRippa', type: 'team-fit', content: 'Travis Hunter to Giants — perfect NYC market fit', targetPick: 3, outcome: 'correct', points: 150, timestamp: '2026-04-23T19:35:00Z' },
  { id: 'p3', memberHandle: 'DraftDayTrader', type: 'price-move', content: 'Hunter Bowman Chrome 1st Auto breaks $900 post-pick', targetPick: 3, outcome: 'correct', points: 200, timestamp: '2026-04-23T19:40:00Z' },
  { id: 'p4', memberHandle: 'MintyFreshPulls', type: 'sleeper', content: 'Tyler Warren to a top 10 pick — TE value spike', targetPick: 10, outcome: 'correct', points: 250, timestamp: '2026-04-23T19:45:00Z' },
  { id: 'p5', memberHandle: 'SlabGod99', type: 'pick-order', content: 'Cam Ward goes #1 over Sanders', targetPick: 1, outcome: 'incorrect', points: 0, timestamp: '2026-04-23T19:32:00Z' },
  { id: 'p6', memberHandle: 'RookieKingMVP', type: 'price-move', content: 'Mason Graham cards stay under $120 — DT tax', targetPick: 4, outcome: 'correct', points: 100, timestamp: '2026-04-23T20:35:00Z' },
  { id: 'p7', memberHandle: 'WaxRippa', type: 'sleeper', content: 'Luther Burden III to SF causes 70%+ spike', targetPick: 11, outcome: 'correct', points: 300, timestamp: '2026-04-23T21:55:00Z' },
  { id: 'p8', memberHandle: 'DraftDayTrader', type: 'team-fit', content: 'McMillan to Jets for 40%+ boost', targetPick: 6, outcome: 'incorrect', points: 0, timestamp: '2026-04-23T20:55:00Z' },
];

const NFL_2026_TRADES: LiveTrade[] = [
  { id: 't1', memberHandle: 'RookieKingMVP', action: 'buy', cardName: 'Shedeur Sanders Bowman Chrome Auto /150', price: 490, pickTrigger: 1, timestamp: '2026-04-23T20:03:00Z', pnl: 252 },
  { id: 't2', memberHandle: 'WaxRippa', action: 'buy', cardName: 'Travis Hunter Bowman Chrome 1st Auto', price: 625, pickTrigger: 3, timestamp: '2026-04-23T20:27:00Z', pnl: 360 },
  { id: 't3', memberHandle: 'DraftDayTrader', action: 'sell', cardName: 'Abdul Carter Bowman University Auto', price: 260, pickTrigger: 5, timestamp: '2026-04-23T20:52:00Z', pnl: 75 },
  { id: 't4', memberHandle: 'MintyFreshPulls', action: 'buy', cardName: 'Tyler Warren Penn St Chrome Auto', price: 180, pickTrigger: 10, timestamp: '2026-04-23T21:51:00Z', pnl: 110 },
  { id: 't5', memberHandle: 'DraftDayTrader', action: 'buy', cardName: 'Tetairoa McMillan Bowman Chrome Refractor', price: 280, pickTrigger: 6, timestamp: '2026-04-23T21:03:00Z', pnl: -45 },
  { id: 't6', memberHandle: 'SlabGod99', action: 'sell', cardName: 'Mason Graham Bowman Base Auto', price: 105, pickTrigger: 4, timestamp: '2026-04-23T20:40:00Z', pnl: 20 },
];

// NBA 2025 Completed Draft
const NBA_2025_MEMBERS: WarRoomMember[] = [
  { userId: 'u1', handle: 'RookieKingMVP', predictions: 6, correctPredictions: 4, accuracy: 66.7, activeTrades: 0, profitLoss: 2180, isOnline: false },
  { userId: 'u6', handle: 'HoopCardHustler', predictions: 7, correctPredictions: 5, accuracy: 71.4, activeTrades: 0, profitLoss: 3450, isOnline: false },
  { userId: 'u7', handle: 'LotteryPickLarry', predictions: 5, correctPredictions: 2, accuracy: 40.0, activeTrades: 0, profitLoss: -780, isOnline: false },
  { userId: 'u3', handle: 'DraftDayTrader', predictions: 8, correctPredictions: 5, accuracy: 62.5, activeTrades: 0, profitLoss: 1920, isOnline: false },
];

const NBA_2025_PICKS: DraftPick[] = [
  { pickNumber: 1, round: 1, team: 'Washington Wizards', playerName: 'Cooper Flagg', position: 'SF/PF', college: 'Duke', preDraftCardPrice: 1250, postDraftCardPrice: 2310, priceChange: 1060, priceMovePercent: 84.8, timestamp: '2025-06-25T20:00:00Z' },
  { pickNumber: 2, round: 1, team: 'Charlotte Hornets', playerName: 'Dylan Harper', position: 'SG', college: 'Rutgers', preDraftCardPrice: 420, postDraftCardPrice: 625, priceChange: 205, priceMovePercent: 48.8, timestamp: '2025-06-25T20:12:00Z' },
  { pickNumber: 3, round: 1, team: 'Brooklyn Nets', playerName: 'Ace Bailey', position: 'SF', college: 'Rutgers', preDraftCardPrice: 380, postDraftCardPrice: 540, priceChange: 160, priceMovePercent: 42.1, timestamp: '2025-06-25T20:24:00Z' },
  { pickNumber: 4, round: 1, team: 'Portland Trail Blazers', playerName: 'VJ Edgecombe', position: 'SG', college: 'Baylor', preDraftCardPrice: 160, postDraftCardPrice: 210, priceChange: 50, priceMovePercent: 31.3, timestamp: '2025-06-25T20:36:00Z' },
  { pickNumber: 5, round: 1, team: 'Sacramento Kings', playerName: 'Kasparas Jakucionis', position: 'PG', college: 'Illinois', preDraftCardPrice: 140, postDraftCardPrice: 195, priceChange: 55, priceMovePercent: 39.3, timestamp: '2025-06-25T20:48:00Z' },
  { pickNumber: 6, round: 1, team: 'San Antonio Spurs', playerName: 'Tre Johnson', position: 'SG', college: 'Texas', preDraftCardPrice: 200, postDraftCardPrice: 345, priceChange: 145, priceMovePercent: 72.5, timestamp: '2025-06-25T21:00:00Z' },
];

const NBA_2025_PREDICTIONS: Prediction[] = [
  { id: 'np1', memberHandle: 'HoopCardHustler', type: 'pick-order', content: 'Flagg #1 to Wizards — franchise cornerstone narrative', targetPick: 1, outcome: 'correct', points: 100, timestamp: '2025-06-25T19:15:00Z' },
  { id: 'np2', memberHandle: 'RookieKingMVP', type: 'price-move', content: 'Flagg Bowman Chrome breaks $2,000 post-draft', targetPick: 1, outcome: 'correct', points: 200, timestamp: '2025-06-25T19:20:00Z' },
  { id: 'np3', memberHandle: 'DraftDayTrader', type: 'team-fit', content: 'Harper to Hornets for LaMelo duo narrative', targetPick: 2, outcome: 'correct', points: 150, timestamp: '2025-06-25T19:22:00Z' },
  { id: 'np4', memberHandle: 'LotteryPickLarry', type: 'sleeper', content: 'Edgecombe goes top 3 — athletic upside', targetPick: 3, outcome: 'incorrect', points: 0, timestamp: '2025-06-25T19:25:00Z' },
  { id: 'np5', memberHandle: 'HoopCardHustler', type: 'price-move', content: 'Tre Johnson to Spurs causes 70%+ spike (Wemby effect)', targetPick: 6, outcome: 'correct', points: 300, timestamp: '2025-06-25T20:50:00Z' },
  { id: 'np6', memberHandle: 'DraftDayTrader', type: 'pick-order', content: 'Bailey goes before Harper', targetPick: 2, outcome: 'incorrect', points: 0, timestamp: '2025-06-25T19:18:00Z' },
  { id: 'np7', memberHandle: 'RookieKingMVP', type: 'team-fit', content: 'Jakucionis falls to Sacramento at 5', targetPick: 5, outcome: 'correct', points: 150, timestamp: '2025-06-25T19:30:00Z' },
];

const NBA_2025_TRADES: LiveTrade[] = [
  { id: 'nt1', memberHandle: 'HoopCardHustler', action: 'buy', cardName: 'Cooper Flagg Bowman University Chrome Auto', price: 1260, pickTrigger: 1, timestamp: '2025-06-25T20:01:00Z', pnl: 1050 },
  { id: 'nt2', memberHandle: 'RookieKingMVP', action: 'buy', cardName: 'Dylan Harper Bowman University Auto', price: 425, pickTrigger: 2, timestamp: '2025-06-25T20:13:00Z', pnl: 200 },
  { id: 'nt3', memberHandle: 'DraftDayTrader', action: 'buy', cardName: 'Tre Johnson Texas Chrome Auto', price: 205, pickTrigger: 6, timestamp: '2025-06-25T21:01:00Z', pnl: 140 },
  { id: 'nt4', memberHandle: 'LotteryPickLarry', action: 'buy', cardName: 'VJ Edgecombe Bowman Chrome', price: 165, pickTrigger: 4, timestamp: '2025-06-25T20:37:00Z', pnl: -45 },
  { id: 'nt5', memberHandle: 'HoopCardHustler', action: 'sell', cardName: 'Ace Bailey Bowman Auto #/199', price: 530, pickTrigger: 3, timestamp: '2025-06-25T20:30:00Z', pnl: 150 },
];

// MLB 2026 Upcoming Draft
const MLB_2026_MEMBERS: WarRoomMember[] = [
  { userId: 'u1', handle: 'RookieKingMVP', predictions: 3, correctPredictions: 0, accuracy: 0, activeTrades: 1, profitLoss: 0, isOnline: true },
  { userId: 'u8', handle: 'DiamondMintCo', predictions: 4, correctPredictions: 0, accuracy: 0, activeTrades: 2, profitLoss: 0, isOnline: true },
  { userId: 'u9', handle: 'ProspectHunter', predictions: 5, correctPredictions: 0, accuracy: 0, activeTrades: 1, profitLoss: 0, isOnline: false },
  { userId: 'u3', handle: 'DraftDayTrader', predictions: 3, correctPredictions: 0, accuracy: 0, activeTrades: 0, profitLoss: 0, isOnline: true },
  { userId: 'u10', handle: 'BowmanBreaker', predictions: 2, correctPredictions: 0, accuracy: 0, activeTrades: 1, profitLoss: 0, isOnline: false },
];

const MLB_2026_PREDICTIONS: Prediction[] = [
  { id: 'mp1', memberHandle: 'DiamondMintCo', type: 'pick-order', content: 'Jac Caglianone goes #1 overall to Guardians', targetPick: 1, outcome: 'pending', points: 0, timestamp: '2026-03-10T14:00:00Z' },
  { id: 'mp2', memberHandle: 'ProspectHunter', type: 'team-fit', content: 'Charlie Condon to Orioles — perfect fit for power bat', targetPick: 2, outcome: 'pending', points: 0, timestamp: '2026-03-11T09:30:00Z' },
  { id: 'mp3', memberHandle: 'RookieKingMVP', type: 'price-move', content: 'Caglianone Bowman 1st Chrome Auto hits $800+ on draft night', targetPick: 1, outcome: 'pending', points: 0, timestamp: '2026-03-12T11:00:00Z' },
  { id: 'mp4', memberHandle: 'DraftDayTrader', type: 'sleeper', content: 'Braden Montgomery sneaks into top 3 on athleticism', targetPick: 3, outcome: 'pending', points: 0, timestamp: '2026-03-13T16:20:00Z' },
  { id: 'mp5', memberHandle: 'BowmanBreaker', type: 'price-move', content: 'Tate Kolwyck Chrome Auto doubles if drafted top 5', targetPick: 5, outcome: 'pending', points: 0, timestamp: '2026-03-14T10:15:00Z' },
  { id: 'mp6', memberHandle: 'ProspectHunter', type: 'pick-order', content: 'A high school arm goes top 5 — surprise pick', targetPick: 5, outcome: 'pending', points: 0, timestamp: '2026-03-15T08:45:00Z' },
];

const MLB_2026_TRADES: LiveTrade[] = [
  { id: 'mt1', memberHandle: 'DiamondMintCo', action: 'buy', cardName: 'Jac Caglianone 2024 Bowman Chrome 1st Auto', price: 535, pickTrigger: null, timestamp: '2026-03-10T14:30:00Z', pnl: null },
  { id: 'mt2', memberHandle: 'DiamondMintCo', action: 'buy', cardName: 'Charlie Condon 2024 Bowman Chrome 1st Auto', price: 390, pickTrigger: null, timestamp: '2026-03-11T10:00:00Z', pnl: null },
  { id: 'mt3', memberHandle: 'RookieKingMVP', action: 'buy', cardName: 'Braden Montgomery 2024 Bowman Draft Auto', price: 250, pickTrigger: null, timestamp: '2026-03-12T11:30:00Z', pnl: null },
  { id: 'mt4', memberHandle: 'ProspectHunter', action: 'hold', cardName: 'Tate Kolwyck 2024 Bowman Draft Chrome Auto', price: 125, pickTrigger: null, timestamp: '2026-03-13T09:00:00Z', pnl: null },
  { id: 'mt5', memberHandle: 'BowmanBreaker', action: 'buy', cardName: 'Jac Caglianone Bowman University Chrome', price: 310, pickTrigger: null, timestamp: '2026-03-15T15:00:00Z', pnl: null },
];

// ── Public API ───────────────────────────────────────────────────────────────

export function getDraftWarRooms(): DraftWarRoom[] {
  return [
    {
      id: 'wr-nfl-2026',
      name: '2026 NFL Draft Night — Round 1 Live',
      draftSport: 'NFL',
      draftDate: '2026-04-23',
      status: 'live',
      hostHandle: 'RookieKingMVP',
      memberCount: 5,
      members: NFL_2026_MEMBERS,
      picks: NFL_2026_PICKS,
      predictions: NFL_2026_PREDICTIONS,
      liveTrades: NFL_2026_TRADES,
      currentPick: 13,
      totalPicks: 32,
      preDraftVolume: 184500,
      liveDraftVolume: 312800,
      biggestMover: 'Luther Burden III (+74.4%)',
      biggestDrop: 'Tetairoa McMillan (+12.7%)',
    },
    {
      id: 'wr-nba-2025',
      name: '2025 NBA Draft — Completed',
      draftSport: 'NBA',
      draftDate: '2025-06-25',
      status: 'completed',
      hostHandle: 'HoopCardHustler',
      memberCount: 4,
      members: NBA_2025_MEMBERS,
      picks: NBA_2025_PICKS,
      predictions: NBA_2025_PREDICTIONS,
      liveTrades: NBA_2025_TRADES,
      currentPick: 60,
      totalPicks: 60,
      preDraftVolume: 245000,
      liveDraftVolume: 478200,
      biggestMover: 'Cooper Flagg (+84.8%)',
      biggestDrop: 'VJ Edgecombe (+31.3%)',
    },
    {
      id: 'wr-mlb-2026',
      name: '2026 MLB Draft — Pre-Draft Lobby',
      draftSport: 'MLB',
      draftDate: '2026-07-12',
      status: 'pre-draft',
      hostHandle: 'DiamondMintCo',
      memberCount: 5,
      members: MLB_2026_MEMBERS,
      picks: [],
      predictions: MLB_2026_PREDICTIONS,
      liveTrades: MLB_2026_TRADES,
      currentPick: 0,
      totalPicks: 600,
      preDraftVolume: 92400,
      liveDraftVolume: 0,
      biggestMover: '—',
      biggestDrop: '—',
    },
  ];
}

export function getDraftWarRoomStats(): DraftWarRoomStats {
  return {
    draftsAttended: 7,
    totalPredictions: 42,
    predictionAccuracy: 61.9,
    totalLiveTrades: 28,
    draftNightPnL: 4825,
    bestPrediction: 'Flagg Bowman Chrome breaks $2K (NBA 2025)',
    favoriteTeam: 'New York Giants',
  };
}

export function getDraftStatusColor(status: DraftStatus): string {
  switch (status) {
    case 'live':
      return 'text-red-400';
    case 'pre-draft':
      return 'text-amber-400';
    case 'completed':
      return 'text-emerald-400';
    default:
      return 'text-slate-400';
  }
}

export function getPredictionColor(outcome: PredictionOutcome): string {
  switch (outcome) {
    case 'correct':
      return 'text-emerald-400';
    case 'incorrect':
      return 'text-red-400';
    case 'pending':
      return 'text-amber-400';
    default:
      return 'text-slate-400';
  }
}
