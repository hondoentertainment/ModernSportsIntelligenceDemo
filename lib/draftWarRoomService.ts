import { store } from './dal/syncStore';

// ── Interfaces ──────────────────────────────────────────────────────────────────

export type CardPresence = 'high' | 'medium' | 'low' | 'none';
export type DraftEventStatus = 'upcoming' | 'live' | 'completed';
export type LandingSpotFit = 'perfect' | 'good' | 'neutral' | 'poor';
export type DraftStrategy = 'buy_before' | 'buy_during' | 'buy_after' | 'sell_before' | 'sell_during' | 'avoid';

export interface DraftProspect {
  id: string;
  name: string;
  sport: string;
  position: string;
  school: string;
  mockDraftPosition: number;
  consensusRank: number;
  age: number;
  cardPresence: CardPresence;
  topCard: {
    description: string;
    currentValue: number;
  };
  draftNightProjection: {
    bestCase: number;
    likelyCase: number;
    worstCase: number;
  };
  landingSpotImpact: {
    bestTeam: string;
    bestTeamMultiplier: number;
    worstTeam: string;
    worstTeamMultiplier: number;
  };
  bustProbability: number;
  boomProbability: number;
}

export interface DraftEvent {
  id: string;
  sport: string;
  name: string;
  date: string;
  location: string;
  rounds: number;
  topProspects: string[];
  status: DraftEventStatus;
}

export interface LandingSpotAnalysis {
  prospect: string;
  team: string;
  fit: LandingSpotFit;
  cardImpact: number;
  reasoning: string;
  historicalComps: string;
}

export interface DraftNightStrategy {
  prospect: string;
  strategy: DraftStrategy;
  timing: string;
  reasoning: string;
  historicalPattern: string;
}

export interface DraftStats {
  upcomingDrafts: number;
  trackedProspects: number;
  avgDraftNightSurge: number;
  bestDraftNightGain: number;
  portfolioProspectExposure: number;
}

// ── Constants ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_draft_war_room';

// ── Mock Data ───────────────────────────────────────────────────────────────────

const NFL_PROSPECTS: DraftProspect[] = [
  {
    id: 'nfl-1', name: 'Shedeur Sanders', sport: 'NFL', position: 'QB', school: 'Colorado',
    mockDraftPosition: 1, consensusRank: 1, age: 22, cardPresence: 'high',
    topCard: { description: '2025 Bowman Chrome Auto #/150', currentValue: 485 },
    draftNightProjection: { bestCase: 750, likelyCase: 620, worstCase: 400 },
    landingSpotImpact: { bestTeam: 'Tennessee Titans', bestTeamMultiplier: 1.55, worstTeam: 'Cleveland Browns', worstTeamMultiplier: 0.85 },
    bustProbability: 18, boomProbability: 52,
  },
  {
    id: 'nfl-2', name: 'Cam Ward', sport: 'NFL', position: 'QB', school: 'Miami (FL)',
    mockDraftPosition: 2, consensusRank: 2, age: 23, cardPresence: 'high',
    topCard: { description: '2025 Bowman Chrome Auto #/99', currentValue: 410 },
    draftNightProjection: { bestCase: 680, likelyCase: 540, worstCase: 330 },
    landingSpotImpact: { bestTeam: 'New York Giants', bestTeamMultiplier: 1.50, worstTeam: 'Las Vegas Raiders', worstTeamMultiplier: 0.90 },
    bustProbability: 22, boomProbability: 45,
  },
  {
    id: 'nfl-3', name: 'Travis Hunter', sport: 'NFL', position: 'WR/CB', school: 'Colorado',
    mockDraftPosition: 3, consensusRank: 3, age: 21, cardPresence: 'high',
    topCard: { description: '2025 Bowman Chrome 1st Auto', currentValue: 620 },
    draftNightProjection: { bestCase: 950, likelyCase: 780, worstCase: 520 },
    landingSpotImpact: { bestTeam: 'Jacksonville Jaguars', bestTeamMultiplier: 1.45, worstTeam: 'New England Patriots', worstTeamMultiplier: 0.92 },
    bustProbability: 10, boomProbability: 65,
  },
  {
    id: 'nfl-4', name: 'Abdul Carter', sport: 'NFL', position: 'EDGE', school: 'Penn State',
    mockDraftPosition: 5, consensusRank: 4, age: 21, cardPresence: 'medium',
    topCard: { description: '2025 Bowman University Auto', currentValue: 185 },
    draftNightProjection: { bestCase: 340, likelyCase: 245, worstCase: 150 },
    landingSpotImpact: { bestTeam: 'Dallas Cowboys', bestTeamMultiplier: 1.40, worstTeam: 'Carolina Panthers', worstTeamMultiplier: 0.88 },
    bustProbability: 20, boomProbability: 40,
  },
  {
    id: 'nfl-5', name: 'Tetairoa McMillan', sport: 'NFL', position: 'WR', school: 'Arizona',
    mockDraftPosition: 6, consensusRank: 5, age: 21, cardPresence: 'medium',
    topCard: { description: '2025 Bowman Chrome Refractor Auto', currentValue: 275 },
    draftNightProjection: { bestCase: 480, likelyCase: 365, worstCase: 210 },
    landingSpotImpact: { bestTeam: 'New York Jets', bestTeamMultiplier: 1.38, worstTeam: 'New England Patriots', worstTeamMultiplier: 0.85 },
    bustProbability: 15, boomProbability: 48,
  },
  {
    id: 'nfl-6', name: 'Mason Graham', sport: 'NFL', position: 'DT', school: 'Michigan',
    mockDraftPosition: 4, consensusRank: 6, age: 21, cardPresence: 'low',
    topCard: { description: '2025 Bowman University Base Auto', currentValue: 85 },
    draftNightProjection: { bestCase: 150, likelyCase: 110, worstCase: 65 },
    landingSpotImpact: { bestTeam: 'Dallas Cowboys', bestTeamMultiplier: 1.25, worstTeam: 'Carolina Panthers', worstTeamMultiplier: 0.90 },
    bustProbability: 12, boomProbability: 30,
  },
];

const NBA_PROSPECTS: DraftProspect[] = [
  {
    id: 'nba-1', name: 'Cooper Flagg', sport: 'NBA', position: 'SF/PF', school: 'Duke',
    mockDraftPosition: 1, consensusRank: 1, age: 18, cardPresence: 'high',
    topCard: { description: '2025 Bowman University Chrome Auto', currentValue: 1250 },
    draftNightProjection: { bestCase: 2200, likelyCase: 1800, worstCase: 1050 },
    landingSpotImpact: { bestTeam: 'Washington Wizards', bestTeamMultiplier: 1.60, worstTeam: 'Portland Trail Blazers', worstTeamMultiplier: 0.95 },
    bustProbability: 8, boomProbability: 72,
  },
  {
    id: 'nba-2', name: 'Dylan Harper', sport: 'NBA', position: 'SG', school: 'Rutgers',
    mockDraftPosition: 2, consensusRank: 2, age: 19, cardPresence: 'medium',
    topCard: { description: '2025 Bowman University Auto', currentValue: 420 },
    draftNightProjection: { bestCase: 720, likelyCase: 560, worstCase: 340 },
    landingSpotImpact: { bestTeam: 'Charlotte Hornets', bestTeamMultiplier: 1.45, worstTeam: 'Utah Jazz', worstTeamMultiplier: 0.88 },
    bustProbability: 15, boomProbability: 55,
  },
  {
    id: 'nba-3', name: 'Ace Bailey', sport: 'NBA', position: 'SF', school: 'Rutgers',
    mockDraftPosition: 3, consensusRank: 3, age: 19, cardPresence: 'medium',
    topCard: { description: '2025 Bowman University Auto #/199', currentValue: 380 },
    draftNightProjection: { bestCase: 650, likelyCase: 510, worstCase: 290 },
    landingSpotImpact: { bestTeam: 'Brooklyn Nets', bestTeamMultiplier: 1.42, worstTeam: 'Detroit Pistons', worstTeamMultiplier: 0.90 },
    bustProbability: 18, boomProbability: 50,
  },
  {
    id: 'nba-4', name: 'VJ Edgecombe', sport: 'NBA', position: 'SG', school: 'Baylor',
    mockDraftPosition: 5, consensusRank: 4, age: 19, cardPresence: 'low',
    topCard: { description: '2025 Bowman University Chrome', currentValue: 160 },
    draftNightProjection: { bestCase: 320, likelyCase: 220, worstCase: 120 },
    landingSpotImpact: { bestTeam: 'San Antonio Spurs', bestTeamMultiplier: 1.50, worstTeam: 'Portland Trail Blazers', worstTeamMultiplier: 0.85 },
    bustProbability: 22, boomProbability: 42,
  },
  {
    id: 'nba-5', name: 'Kasparas Jakucionis', sport: 'NBA', position: 'PG', school: 'Illinois',
    mockDraftPosition: 6, consensusRank: 5, age: 19, cardPresence: 'low',
    topCard: { description: '2025 Bowman University Auto', currentValue: 140 },
    draftNightProjection: { bestCase: 280, likelyCase: 195, worstCase: 100 },
    landingSpotImpact: { bestTeam: 'San Antonio Spurs', bestTeamMultiplier: 1.48, worstTeam: 'Utah Jazz', worstTeamMultiplier: 0.82 },
    bustProbability: 25, boomProbability: 38,
  },
];

const MLB_PROSPECTS: DraftProspect[] = [
  {
    id: 'mlb-1', name: 'Jac Caglianone', sport: 'MLB', position: '1B/LHP', school: 'Florida',
    mockDraftPosition: 1, consensusRank: 1, age: 21, cardPresence: 'high',
    topCard: { description: '2024 Bowman Chrome 1st Auto', currentValue: 520 },
    draftNightProjection: { bestCase: 850, likelyCase: 680, worstCase: 420 },
    landingSpotImpact: { bestTeam: 'Cleveland Guardians', bestTeamMultiplier: 1.50, worstTeam: 'Colorado Rockies', worstTeamMultiplier: 0.80 },
    bustProbability: 20, boomProbability: 55,
  },
  {
    id: 'mlb-2', name: 'Charlie Condon', sport: 'MLB', position: '3B/1B', school: 'Georgia',
    mockDraftPosition: 2, consensusRank: 2, age: 21, cardPresence: 'medium',
    topCard: { description: '2024 Bowman Chrome 1st Auto', currentValue: 380 },
    draftNightProjection: { bestCase: 620, likelyCase: 490, worstCase: 300 },
    landingSpotImpact: { bestTeam: 'Baltimore Orioles', bestTeamMultiplier: 1.45, worstTeam: 'Oakland Athletics', worstTeamMultiplier: 0.82 },
    bustProbability: 22, boomProbability: 48,
  },
  {
    id: 'mlb-3', name: 'Braden Montgomery', sport: 'MLB', position: 'OF', school: 'Texas A&M',
    mockDraftPosition: 4, consensusRank: 3, age: 21, cardPresence: 'medium',
    topCard: { description: '2024 Bowman Draft Auto', currentValue: 245 },
    draftNightProjection: { bestCase: 420, likelyCase: 320, worstCase: 190 },
    landingSpotImpact: { bestTeam: 'Baltimore Orioles', bestTeamMultiplier: 1.40, worstTeam: 'Pittsburgh Pirates', worstTeamMultiplier: 0.85 },
    bustProbability: 25, boomProbability: 42,
  },
  {
    id: 'mlb-4', name: 'Tate Kolwyck', sport: 'MLB', position: 'SS', school: 'Vanderbilt',
    mockDraftPosition: 6, consensusRank: 4, age: 21, cardPresence: 'low',
    topCard: { description: '2024 Bowman Draft Chrome Auto', currentValue: 120 },
    draftNightProjection: { bestCase: 220, likelyCase: 160, worstCase: 85 },
    landingSpotImpact: { bestTeam: 'Detroit Tigers', bestTeamMultiplier: 1.35, worstTeam: 'Colorado Rockies', worstTeamMultiplier: 0.80 },
    bustProbability: 28, boomProbability: 35,
  },
];

const NHL_PROSPECTS: DraftProspect[] = [
  {
    id: 'nhl-1', name: 'James Hagens', sport: 'NHL', position: 'C', school: 'Boston College',
    mockDraftPosition: 1, consensusRank: 1, age: 18, cardPresence: 'medium',
    topCard: { description: '2025 Upper Deck CHL Auto', currentValue: 210 },
    draftNightProjection: { bestCase: 380, likelyCase: 290, worstCase: 170 },
    landingSpotImpact: { bestTeam: 'Chicago Blackhawks', bestTeamMultiplier: 1.45, worstTeam: 'San Jose Sharks', worstTeamMultiplier: 0.88 },
    bustProbability: 15, boomProbability: 50,
  },
  {
    id: 'nhl-2', name: 'Porter Martone', sport: 'NHL', position: 'RW', school: 'Brampton Steelheads',
    mockDraftPosition: 2, consensusRank: 2, age: 18, cardPresence: 'low',
    topCard: { description: '2025 Upper Deck CHL Auto', currentValue: 145 },
    draftNightProjection: { bestCase: 280, likelyCase: 200, worstCase: 110 },
    landingSpotImpact: { bestTeam: 'Anaheim Ducks', bestTeamMultiplier: 1.40, worstTeam: 'Columbus Blue Jackets', worstTeamMultiplier: 0.85 },
    bustProbability: 20, boomProbability: 42,
  },
  {
    id: 'nhl-3', name: 'Ivan Ryabkin', sport: 'NHL', position: 'LW', school: 'Yaroslavl (KHL)',
    mockDraftPosition: 3, consensusRank: 3, age: 18, cardPresence: 'none',
    topCard: { description: 'No licensed cards yet', currentValue: 0 },
    draftNightProjection: { bestCase: 150, likelyCase: 80, worstCase: 30 },
    landingSpotImpact: { bestTeam: 'Chicago Blackhawks', bestTeamMultiplier: 1.35, worstTeam: 'San Jose Sharks', worstTeamMultiplier: 0.82 },
    bustProbability: 30, boomProbability: 38,
  },
];

const DRAFT_EVENTS: DraftEvent[] = [
  {
    id: 'nfl-draft-2026', sport: 'NFL', name: '2026 NFL Draft', date: '2026-04-23',
    location: 'Green Bay, WI', rounds: 7,
    topProspects: ['nfl-1', 'nfl-2', 'nfl-3', 'nfl-4', 'nfl-5'],
    status: 'upcoming',
  },
  {
    id: 'nba-draft-2026', sport: 'NBA', name: '2026 NBA Draft', date: '2026-06-25',
    location: 'Brooklyn, NY', rounds: 2,
    topProspects: ['nba-1', 'nba-2', 'nba-3', 'nba-4', 'nba-5'],
    status: 'upcoming',
  },
  {
    id: 'mlb-draft-2026', sport: 'MLB', name: '2026 MLB Draft', date: '2026-07-12',
    location: 'Arlington, TX', rounds: 20,
    topProspects: ['mlb-1', 'mlb-2', 'mlb-3', 'mlb-4'],
    status: 'upcoming',
  },
  {
    id: 'nhl-draft-2026', sport: 'NHL', name: '2026 NHL Draft', date: '2026-06-27',
    location: 'Buffalo, NY', rounds: 7,
    topProspects: ['nhl-1', 'nhl-2', 'nhl-3'],
    status: 'upcoming',
  },
  {
    id: 'mls-draft-2026', sport: 'MLS', name: '2026 MLS SuperDraft', date: '2026-12-20',
    location: 'Virtual', rounds: 3,
    topProspects: [],
    status: 'upcoming',
  },
];

const ALL_PROSPECTS: DraftProspect[] = [...NFL_PROSPECTS, ...NBA_PROSPECTS, ...MLB_PROSPECTS, ...NHL_PROSPECTS];

const LANDING_SPOT_DATA: Record<string, LandingSpotAnalysis[]> = {
  'nfl-1': [
    { prospect: 'Shedeur Sanders', team: 'Tennessee Titans', fit: 'perfect', cardImpact: 55, reasoning: 'Franchise QB need with new coaching staff building around young talent. Massive media market multiplier via brand.', historicalComps: 'Trevor Lawrence to JAX (+48% draft night)' },
    { prospect: 'Shedeur Sanders', team: 'Cleveland Browns', fit: 'good', cardImpact: 25, reasoning: 'QB-needy team but smaller media footprint and offensive line concerns.', historicalComps: 'Baker Mayfield to CLE (+22% draft night)' },
    { prospect: 'Shedeur Sanders', team: 'New York Giants', fit: 'good', cardImpact: 42, reasoning: 'Huge NYC media market. Immediate starter. Could be next Eli Manning narrative.', historicalComps: 'Daniel Jones to NYG (+35% draft night)' },
    { prospect: 'Shedeur Sanders', team: 'Las Vegas Raiders', fit: 'neutral', cardImpact: 15, reasoning: 'Ownership instability and coaching carousel. Card market skeptical of Raiders QBs.', historicalComps: 'Derek Carr to OAK (+12% draft night)' },
    { prospect: 'Shedeur Sanders', team: 'New England Patriots', fit: 'poor', cardImpact: -5, reasoning: 'Belichick-era skepticism of drafted QBs lingers. System-limited ceiling.', historicalComps: 'Mac Jones to NE (-3% draft night)' },
  ],
  'nfl-3': [
    { prospect: 'Travis Hunter', team: 'Jacksonville Jaguars', fit: 'perfect', cardImpact: 45, reasoning: 'Two-way player could anchor defense AND offense. Generational flexibility play.', historicalComps: 'Deion Sanders HOF-level hype' },
    { prospect: 'Travis Hunter', team: 'New York Giants', fit: 'good', cardImpact: 38, reasoning: 'NYC market amplifies any star. Could line up both ways immediately.', historicalComps: 'Saquon Barkley to NYG (+40% draft night)' },
    { prospect: 'Travis Hunter', team: 'New England Patriots', fit: 'neutral', cardImpact: 10, reasoning: 'Belichick would maximize defensive value but limit offensive upside.', historicalComps: 'N/A — unique prospect' },
  ],
  'nba-1': [
    { prospect: 'Cooper Flagg', team: 'Washington Wizards', fit: 'perfect', cardImpact: 60, reasoning: 'Clear franchise cornerstone. Would be the face of a rebuilding franchise in a major market.', historicalComps: 'Victor Wembanyama to SAS (+85% draft night)' },
    { prospect: 'Cooper Flagg', team: 'Charlotte Hornets', fit: 'good', cardImpact: 38, reasoning: 'Good fit next to LaMelo Ball. Smaller market but exciting duo narrative.', historicalComps: 'LaMelo Ball to CHA (+32% draft night)' },
    { prospect: 'Cooper Flagg', team: 'Portland Trail Blazers', fit: 'neutral', cardImpact: 20, reasoning: 'Small market with limited national TV exposure. Good roster fit but muted card impact.', historicalComps: 'Scoot Henderson to POR (+15% draft night)' },
  ],
  'mlb-1': [
    { prospect: 'Jac Caglianone', team: 'Cleveland Guardians', fit: 'perfect', cardImpact: 50, reasoning: 'Excellent player development pipeline. Two-way intrigue maximizes card appeal.', historicalComps: 'Shohei Ohtani two-way hype trajectory' },
    { prospect: 'Jac Caglianone', team: 'Pittsburgh Pirates', fit: 'good', cardImpact: 25, reasoning: 'Good development track record, smaller market limits upside.', historicalComps: 'Paul Skenes to PIT (+30% draft)' },
    { prospect: 'Jac Caglianone', team: 'Colorado Rockies', fit: 'poor', cardImpact: -10, reasoning: 'Historically terrible at developing talent. Card market deeply skeptical.', historicalComps: 'No recent comp — market avoids Rockies picks' },
  ],
};

const STRATEGIES: DraftNightStrategy[] = [
  { prospect: 'Shedeur Sanders', strategy: 'buy_before', timing: '1-2 weeks pre-draft', reasoning: 'Strong brand already built. Name recognition will drive immediate secondary market. Buy Bowman Chrome autos before consensus solidifies on landing spot.', historicalPattern: 'Top 3 NFL QB picks average +34% draft night' },
  { prospect: 'Cam Ward', strategy: 'buy_during', timing: 'Within 30 min of pick', reasoning: 'Market will overreact to landing spot. Wait for pick announcement, assess fit, buy during initial confusion window.', historicalPattern: 'QB2 in NFL drafts average +22% within 48 hours' },
  { prospect: 'Travis Hunter', strategy: 'buy_before', timing: '2-4 weeks pre-draft', reasoning: 'Unique two-way player narrative will dominate draft coverage. Bowman 1st autos are already moving. Early positioning is key.', historicalPattern: 'Generational defensive prospects avg +28% draft night' },
  { prospect: 'Cooper Flagg', strategy: 'buy_before', timing: 'Now / ASAP', reasoning: 'Consensus #1 with Wemby-level hype. Prices will only go up as draft approaches. College cards still relatively accessible.', historicalPattern: 'Consensus #1 NBA picks average +55% draft night (Wemby +85%)' },
  { prospect: 'Dylan Harper', strategy: 'buy_during', timing: 'During lottery reveal / draft night', reasoning: 'Value depends heavily on landing spot. Wait for lottery results, then position.', historicalPattern: 'NBA picks 2-5 average +18% draft night' },
  { prospect: 'Jac Caglianone', strategy: 'buy_before', timing: '1-3 weeks pre-draft', reasoning: 'Two-way intrigue plus Bowman 1st Chrome demand. MLB #1 picks consistently spike.', historicalPattern: 'MLB #1 pick Bowman 1st avg +55% within 48 hours' },
  { prospect: 'Charlie Condon', strategy: 'buy_after', timing: '1-2 weeks post-draft', reasoning: 'College bat profiles see post-draft dip as reality sets in on development timeline. Buy the dip.', historicalPattern: 'College hitters avg -8% week after draft, then recover over 6 months' },
  { prospect: 'James Hagens', strategy: 'buy_before', timing: '1-2 weeks pre-draft', reasoning: 'NHL prospect hype cycle is shorter. Buy into the wave early, limited card supply amplifies moves.', historicalPattern: 'NHL #1 picks avg +20% draft night, limited hobby attention' },
  { prospect: 'Mason Graham', strategy: 'avoid', timing: 'N/A', reasoning: 'Interior defensive linemen have minimal card market appeal. Low upside for hobby investors.', historicalPattern: 'Defensive tackles rarely sustain card value post-draft' },
  { prospect: 'Abdul Carter', strategy: 'sell_before', timing: '1 week pre-draft', reasoning: 'Edge rushers get pre-draft hype but rarely sustain post-draft. Sell into the hype cycle.', historicalPattern: 'Non-QB defensive prospects avg -12% within 30 days post-draft' },
];

// ── localStorage helpers ────────────────────────────────────────────────────────

function loadPersistedData(): { watchedProspects: string[] } {
  return store.get<{ watchedProspects: string[] }>(STORAGE_KEY, { watchedProspects: [] });
}

function persistData(data: { watchedProspects: string[] }): void {
  store.set(STORAGE_KEY, data);
}

export function watchProspect(prospectId: string): void {
  const data = loadPersistedData();
  if (!data.watchedProspects.includes(prospectId)) {
    data.watchedProspects.push(prospectId);
    persistData(data);
  }
}

export function unwatchProspect(prospectId: string): void {
  const data = loadPersistedData();
  data.watchedProspects = data.watchedProspects.filter(id => id !== prospectId);
  persistData(data);
}

export function isProspectWatched(prospectId: string): boolean {
  return loadPersistedData().watchedProspects.includes(prospectId);
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function getDraftEvents(): DraftEvent[] {
  return DRAFT_EVENTS.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getDraftProspects(sport?: string): DraftProspect[] {
  const prospects = sport ? ALL_PROSPECTS.filter(p => p.sport === sport) : ALL_PROSPECTS;
  return prospects.sort((a, b) => a.consensusRank - b.consensusRank);
}

export function getLandingSpotAnalysis(prospectId: string): LandingSpotAnalysis[] {
  return LANDING_SPOT_DATA[prospectId] || [];
}

export function getDraftNightStrategies(): DraftNightStrategy[] {
  return STRATEGIES;
}

export function getDraftStats(): DraftStats {
  const watched = loadPersistedData().watchedProspects;
  return {
    upcomingDrafts: DRAFT_EVENTS.filter(e => e.status === 'upcoming').length,
    trackedProspects: ALL_PROSPECTS.length,
    avgDraftNightSurge: 34,
    bestDraftNightGain: 85,
    portfolioProspectExposure: watched.length,
  };
}

export function getNextDraftEvent(): DraftEvent | null {
  const now = new Date();
  const upcoming = DRAFT_EVENTS
    .filter(e => new Date(e.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return upcoming[0] || null;
}

export function daysUntilDraft(dateStr: string): number {
  const now = new Date();
  const draft = new Date(dateStr);
  return Math.max(0, Math.ceil((draft.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

// ── Cross-reference: Player Trajectory (Phase 77) ────────────────────────────
// Bridge functions to integrate trajectory projections with draft prospect analysis

import { getAllPlayerTrajectories } from './playerTrajectoryService';

export interface ProspectTrajectoryComparison {
  prospectId: string;
  prospectName: string;
  sport: string;
  comparablePlayers: {
    trajectoryPlayer: string;
    trajectoryScore: number;
    peakProjectedValue: number;
    riskLevel: string;
    relevance: string;
  }[];
  projectedCareerArc: string;
  investmentOutlook: string;
}

/**
 * Enriches draft prospects with trajectory analysis from Phase 77.
 * Compares draft prospect profiles with existing player trajectories
 * to project career arc and card value trajectory.
 */
export function getProspectTrajectoryComparisons(sportFilter?: string): ProspectTrajectoryComparison[] {
  const prospects = getDraftProspects(sportFilter);
  const trajectories = getAllPlayerTrajectories();

  return prospects.slice(0, 10).map(prospect => {
    // Find trajectory players in same sport or similar position
    const relevantTrajectories = trajectories.filter(t =>
      t.sport === prospect.sport ||
      t.position === prospect.position
    );

    const comparablePlayers = relevantTrajectories.map(t => {
      // Calculate relevance based on position/sport match and age proximity
      let relevanceScore = 0;
      if (t.sport === prospect.sport) relevanceScore += 50;
      if (t.position === prospect.position) relevanceScore += 30;
      const ageDiff = Math.abs(t.age - prospect.age);
      relevanceScore += Math.max(0, 20 - ageDiff * 5);

      const relevance = relevanceScore >= 70 ? 'High' : relevanceScore >= 40 ? 'Medium' : 'Low';

      return {
        trajectoryPlayer: t.playerName,
        trajectoryScore: t.trajectoryScore,
        peakProjectedValue: t.peakProjectedValue,
        riskLevel: t.riskLevel,
        relevance,
      };
    }).sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      return (order[a.relevance as keyof typeof order] ?? 2) - (order[b.relevance as keyof typeof order] ?? 2);
    }).slice(0, 3);

    // Determine projected career arc based on prospect stats
    let projectedCareerArc = 'Standard Development';
    if (prospect.boomProbability >= 60) projectedCareerArc = 'Breakout Trajectory';
    else if (prospect.boomProbability >= 45) projectedCareerArc = 'Steady Rise';
    else if (prospect.bustProbability >= 25) projectedCareerArc = 'High Variance';

    // Investment outlook
    let investmentOutlook = 'Hold for development';
    if (prospect.boomProbability >= 60 && prospect.bustProbability < 15) {
      investmentOutlook = 'Strong long-term hold — generational upside with low bust risk';
    } else if (prospect.boomProbability >= 45) {
      investmentOutlook = 'Accumulate early — favorable risk/reward at current pre-draft prices';
    } else if (prospect.bustProbability >= 25) {
      investmentOutlook = 'Speculative position only — high bust risk warrants small allocation';
    }

    return {
      prospectId: prospect.id,
      prospectName: prospect.name,
      sport: prospect.sport,
      comparablePlayers,
      projectedCareerArc,
      investmentOutlook,
    };
  });
}
