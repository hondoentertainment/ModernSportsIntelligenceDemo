import { store } from './dal/syncStore';
import { CardInventory, Sport } from '../types';

// ---- Types ----

export interface PlayerIndex {
  playerName: string;
  sport: Sport;
  team: string;
  currentValue: number;
  change24h: number;
  change7d: number;
  change30d: number;
  indexHistory: { month: string; value: number }[];
  cardsOwned: number;
  totalCardValue: number;
  careerPhase: 'rookie' | 'breakout' | 'prime' | 'decline';
}

export interface PlayerComparison {
  players: string[];
  data: { month: string; [playerName: string]: number | string }[];
}

export interface RookieClassIndex {
  year: number;
  sport: Sport;
  className: string;
  aggregateValue: number;
  change30d: number;
  players: {
    rank: number;
    name: string;
    value: number;
    change30d: number;
    team: string;
  }[];
  topPerformer: string;
  bottomPerformer: string;
}

export interface CareerArc {
  playerName: string;
  phases: { phase: string; startYear: number; endYear: number; avgValue: number }[];
  currentPhase: 'rookie' | 'breakout' | 'prime' | 'decline';
  valueCurve: { year: number; value: number }[];
  peakYear: number;
  peakValue: number;
}

export interface InjuryImpact {
  playerName: string;
  immediateDropPct: number;
  recoveryMonths: number;
  recoveryTimeline: { month: number; valuePct: number }[];
  historicalPattern: string;
  currentValuePct: number;
}

export interface TeamIndex {
  team: string;
  sport: Sport;
  totalValue: number;
  playerCount: number;
  change30d: number;
  topPlayer: string;
  sparkline: number[];
}

export interface SportIndex {
  sport: Sport;
  totalValue: number;
  volume: number;
  change30d: number;
  sparkline: number[];
  health: 'strong' | 'neutral' | 'weak';
}

export interface HotColdEntry {
  playerName: string;
  sport: Sport;
  team: string;
  changePct: number;
  currentValue: number;
  sparkline: number[];
  direction: 'hot' | 'cold';
}

// ---- Constants ----

const PREFS_KEY = 'msi_player_index_prefs';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ---- Pre-built player data ----

interface PlayerData {
  name: string;
  sport: Sport;
  team: string;
  baseValue: number;
  volatility: number;
  phase: 'rookie' | 'breakout' | 'prime' | 'decline';
  debutYear: number;
}

const PLAYER_DATABASE: PlayerData[] = [
  // Football
  { name: 'Patrick Mahomes', sport: 'Football', team: 'Kansas City Chiefs', baseValue: 850, volatility: 0.12, phase: 'prime', debutYear: 2017 },
  { name: 'Josh Allen', sport: 'Football', team: 'Buffalo Bills', baseValue: 620, volatility: 0.15, phase: 'prime', debutYear: 2018 },
  { name: 'Lamar Jackson', sport: 'Football', team: 'Baltimore Ravens', baseValue: 480, volatility: 0.18, phase: 'prime', debutYear: 2018 },
  { name: 'Joe Burrow', sport: 'Football', team: 'Cincinnati Bengals', baseValue: 520, volatility: 0.20, phase: 'breakout', debutYear: 2020 },
  { name: 'Justin Jefferson', sport: 'Football', team: 'Minnesota Vikings', baseValue: 450, volatility: 0.22, phase: 'breakout', debutYear: 2020 },
  { name: 'Caleb Williams', sport: 'Football', team: 'Chicago Bears', baseValue: 380, volatility: 0.30, phase: 'rookie', debutYear: 2024 },
  { name: 'Jayden Daniels', sport: 'Football', team: 'Washington Commanders', baseValue: 340, volatility: 0.28, phase: 'rookie', debutYear: 2024 },
  { name: 'Drake Maye', sport: 'Football', team: 'New England Patriots', baseValue: 280, volatility: 0.32, phase: 'rookie', debutYear: 2024 },
  { name: 'Marvin Harrison Jr', sport: 'Football', team: 'Arizona Cardinals', baseValue: 360, volatility: 0.26, phase: 'rookie', debutYear: 2024 },
  { name: 'Malik Nabers', sport: 'Football', team: 'New York Giants', baseValue: 310, volatility: 0.27, phase: 'rookie', debutYear: 2024 },

  // Basketball
  { name: 'Victor Wembanyama', sport: 'Basketball', team: 'San Antonio Spurs', baseValue: 920, volatility: 0.25, phase: 'rookie', debutYear: 2023 },
  { name: 'Luka Doncic', sport: 'Basketball', team: 'Dallas Mavericks', baseValue: 780, volatility: 0.14, phase: 'prime', debutYear: 2018 },
  { name: 'Jayson Tatum', sport: 'Basketball', team: 'Boston Celtics', baseValue: 550, volatility: 0.12, phase: 'prime', debutYear: 2017 },
  { name: 'Anthony Edwards', sport: 'Basketball', team: 'Minnesota Timberwolves', baseValue: 620, volatility: 0.20, phase: 'breakout', debutYear: 2020 },
  { name: 'Zach Edey', sport: 'Basketball', team: 'Memphis Grizzlies', baseValue: 240, volatility: 0.35, phase: 'rookie', debutYear: 2024 },
  { name: 'Reed Sheppard', sport: 'Basketball', team: 'Houston Rockets', baseValue: 280, volatility: 0.32, phase: 'rookie', debutYear: 2024 },
  { name: 'LeBron James', sport: 'Basketball', team: 'Los Angeles Lakers', baseValue: 1200, volatility: 0.08, phase: 'decline', debutYear: 2003 },
  { name: 'Stephen Curry', sport: 'Basketball', team: 'Golden State Warriors', baseValue: 680, volatility: 0.10, phase: 'decline', debutYear: 2009 },

  // Baseball
  { name: 'Shohei Ohtani', sport: 'Baseball', team: 'Los Angeles Dodgers', baseValue: 1100, volatility: 0.16, phase: 'prime', debutYear: 2018 },
  { name: 'Juan Soto', sport: 'Baseball', team: 'New York Mets', baseValue: 580, volatility: 0.18, phase: 'prime', debutYear: 2018 },
  { name: 'Gunnar Henderson', sport: 'Baseball', team: 'Baltimore Orioles', baseValue: 420, volatility: 0.24, phase: 'breakout', debutYear: 2022 },
  { name: 'Paul Skenes', sport: 'Baseball', team: 'Pittsburgh Pirates', baseValue: 480, volatility: 0.30, phase: 'rookie', debutYear: 2024 },
  { name: 'Jackson Holliday', sport: 'Baseball', team: 'Baltimore Orioles', baseValue: 350, volatility: 0.28, phase: 'rookie', debutYear: 2024 },
  { name: 'Junior Caminero', sport: 'Baseball', team: 'Tampa Bay Rays', baseValue: 300, volatility: 0.32, phase: 'rookie', debutYear: 2024 },
  { name: 'Mike Trout', sport: 'Baseball', team: 'Los Angeles Angels', baseValue: 500, volatility: 0.10, phase: 'decline', debutYear: 2011 },

  // Hockey
  { name: 'Connor McDavid', sport: 'Hockey', team: 'Edmonton Oilers', baseValue: 750, volatility: 0.12, phase: 'prime', debutYear: 2015 },
  { name: 'Connor Bedard', sport: 'Hockey', team: 'Chicago Blackhawks', baseValue: 520, volatility: 0.28, phase: 'rookie', debutYear: 2023 },
  { name: 'Macklin Celebrini', sport: 'Hockey', team: 'San Jose Sharks', baseValue: 340, volatility: 0.30, phase: 'rookie', debutYear: 2024 },
  { name: 'Nathan MacKinnon', sport: 'Hockey', team: 'Colorado Avalanche', baseValue: 480, volatility: 0.14, phase: 'prime', debutYear: 2013 },

  // Soccer
  { name: 'Jude Bellingham', sport: 'Soccer', team: 'Real Madrid', baseValue: 680, volatility: 0.20, phase: 'breakout', debutYear: 2020 },
  { name: 'Erling Haaland', sport: 'Soccer', team: 'Manchester City', baseValue: 720, volatility: 0.16, phase: 'prime', debutYear: 2019 },
  { name: 'Kylian Mbappe', sport: 'Soccer', team: 'Real Madrid', baseValue: 650, volatility: 0.14, phase: 'prime', debutYear: 2016 },
  { name: 'Lionel Messi', sport: 'Soccer', team: 'Inter Miami', baseValue: 900, volatility: 0.08, phase: 'decline', debutYear: 2004 },
  { name: 'Lamine Yamal', sport: 'Soccer', team: 'FC Barcelona', baseValue: 560, volatility: 0.30, phase: 'rookie', debutYear: 2023 },
  { name: 'Endrick', sport: 'Soccer', team: 'Real Madrid', baseValue: 380, volatility: 0.32, phase: 'rookie', debutYear: 2024 },
];

// ---- Rookie class data ----

const ROOKIE_CLASSES: Record<string, { name: string; team: string; baseValue: number }[]> = {
  '2024_Football': [
    { name: 'Caleb Williams', team: 'Chicago Bears', baseValue: 380 },
    { name: 'Jayden Daniels', team: 'Washington Commanders', baseValue: 340 },
    { name: 'Marvin Harrison Jr', team: 'Arizona Cardinals', baseValue: 360 },
    { name: 'Malik Nabers', team: 'New York Giants', baseValue: 310 },
    { name: 'Drake Maye', team: 'New England Patriots', baseValue: 280 },
    { name: 'Joe Alt', team: 'Los Angeles Chargers', baseValue: 220 },
    { name: 'Brock Bowers', team: 'Las Vegas Raiders', baseValue: 290 },
    { name: 'Rome Odunze', team: 'Chicago Bears', baseValue: 240 },
    { name: 'Bo Nix', team: 'Denver Broncos', baseValue: 250 },
    { name: 'Brian Thomas Jr', team: 'Jacksonville Jaguars', baseValue: 230 },
  ],
  '2024_Basketball': [
    { name: 'Zach Edey', team: 'Memphis Grizzlies', baseValue: 240 },
    { name: 'Reed Sheppard', team: 'Houston Rockets', baseValue: 280 },
    { name: 'Alex Sarr', team: 'Washington Wizards', baseValue: 260 },
    { name: 'Stephon Castle', team: 'San Antonio Spurs', baseValue: 220 },
    { name: 'Donovan Clingan', team: 'Portland Trail Blazers', baseValue: 210 },
    { name: 'Matas Buzelis', team: 'Chicago Bulls', baseValue: 190 },
    { name: 'Dalton Knecht', team: 'Los Angeles Lakers', baseValue: 200 },
    { name: 'Rob Dillingham', team: 'Minnesota Timberwolves', baseValue: 185 },
    { name: 'Cody Williams', team: 'Utah Jazz', baseValue: 175 },
    { name: 'Tidjane Salaun', team: 'Charlotte Hornets', baseValue: 170 },
  ],
  '2024_Baseball': [
    { name: 'Paul Skenes', team: 'Pittsburgh Pirates', baseValue: 480 },
    { name: 'Jackson Holliday', team: 'Baltimore Orioles', baseValue: 350 },
    { name: 'Junior Caminero', team: 'Tampa Bay Rays', baseValue: 300 },
    { name: 'Wyatt Langford', team: 'Texas Rangers', baseValue: 260 },
    { name: 'Jackson Merrill', team: 'San Diego Padres', baseValue: 240 },
    { name: 'Colton Cowser', team: 'Baltimore Orioles', baseValue: 220 },
    { name: 'Jackson Chourio', team: 'Milwaukee Brewers', baseValue: 280 },
    { name: 'Masyn Winn', team: 'St. Louis Cardinals', baseValue: 210 },
    { name: 'Andy Pages', team: 'Los Angeles Dodgers', baseValue: 190 },
    { name: 'Austin Wells', team: 'New York Yankees', baseValue: 200 },
  ],
};

// ---- Helper: Generate 12-month index for a player ----

function generate12MonthIndex(player: PlayerData): { month: string; value: number }[] {
  const seed = hashString(player.name) + dateSeed();
  const history: { month: string; value: number }[] = [];
  const now = new Date();

  let value = player.baseValue * seededRange(seed, 0, 0.85, 0.95);

  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = MONTHS[monthDate.getMonth()] + ' ' + String(monthDate.getFullYear()).slice(2);

    const drift = seededRange(seed, i * 3 + 1, -player.volatility * 0.5, player.volatility * 0.7);
    const noise = seededRange(seed, i * 3 + 2, -player.volatility * 0.3, player.volatility * 0.3);
    value = Math.max(value * 0.5, value * (1 + drift + noise));

    history.push({ month: monthLabel, value: Math.round(value * 100) / 100 });
  }

  // Ensure the last value is close to baseValue
  const lastIdx = history.length - 1;
  const scale = player.baseValue / history[lastIdx].value;
  for (let i = 0; i < history.length; i++) {
    const blend = i / lastIdx;
    const factor = 1 + (scale - 1) * blend;
    history[i].value = Math.round(history[i].value * factor * 100) / 100;
  }

  return history;
}

// ---- Generate sparkline (7 points) ----

function generateSparkline(playerName: string, direction: number): number[] {
  const seed = hashString(playerName) + dateSeed();
  const points: number[] = [];
  let val = 100;
  for (let i = 0; i < 7; i++) {
    const change = seededRange(seed, i * 5 + 100, -3, 3) + direction * 0.5;
    val = Math.max(80, Math.min(120, val + change));
    points.push(Math.round(val * 10) / 10);
  }
  return points;
}

// ---- localStorage helpers ----

export function loadPrefs(): Record<string, unknown> {
  return store.get<Record<string, unknown>>(PREFS_KEY, {});
}

export function savePrefs(prefs: Record<string, unknown>): void {
  store.set(PREFS_KEY, prefs);
}

// ---- Public API ----

export function getPlayerIndex(playerName: string, cards: CardInventory[]): PlayerIndex | null {
  const player = PLAYER_DATABASE.find(
    p => p.name.toLowerCase() === playerName.toLowerCase()
  );

  if (!player) return null;

  const indexHistory = generate12MonthIndex(player);
  const playerCards = cards.filter(
    c => c.player.toLowerCase() === playerName.toLowerCase()
  );
  const totalCardValue = playerCards.reduce(
    (sum, c) => sum + (c.currentValue ?? c.purchasePrice),
    0
  );

  const seed = hashString(player.name) + dateSeed();
  const change24h = Math.round(seededRange(seed, 200, -player.volatility * 8, player.volatility * 8) * 100) / 100;
  const change7d = Math.round(seededRange(seed, 201, -player.volatility * 15, player.volatility * 15) * 100) / 100;
  const change30d = Math.round(seededRange(seed, 202, -player.volatility * 25, player.volatility * 25) * 100) / 100;

  return {
    playerName: player.name,
    sport: player.sport,
    team: player.team,
    currentValue: player.baseValue,
    change24h,
    change7d,
    change30d,
    indexHistory,
    cardsOwned: playerCards.length,
    totalCardValue: Math.round(totalCardValue * 100) / 100,
    careerPhase: player.phase,
  };
}

export function comparePlayers(playerNames: string[], cards: CardInventory[]): PlayerComparison {
  const indices = playerNames
    .map(name => getPlayerIndex(name, cards))
    .filter((idx): idx is PlayerIndex => idx !== null);

  if (indices.length === 0) {
    return { players: [], data: [] };
  }

  // Normalize all to base 100 at month 0
  const data: { month: string; [key: string]: number | string }[] = [];

  const monthCount = indices[0].indexHistory.length;
  for (let i = 0; i < monthCount; i++) {
    const entry: { month: string; [key: string]: number | string } = {
      month: indices[0].indexHistory[i].month,
    };

    for (const idx of indices) {
      const baseVal = idx.indexHistory[0].value;
      const normalized = baseVal > 0
        ? Math.round((idx.indexHistory[i].value / baseVal) * 100 * 100) / 100
        : 100;
      entry[idx.playerName] = normalized;
    }

    data.push(entry);
  }

  return {
    players: indices.map(idx => idx.playerName),
    data,
  };
}

export function getRookieClassIndexes(year: number, sport: Sport): RookieClassIndex | null {
  const key = `${year}_${sport}`;
  const rookies = ROOKIE_CLASSES[key];
  if (!rookies) return null;

  const seed = hashString(key) + dateSeed();

  const players = rookies.map((r, i) => {
    const change30d = Math.round(seededRange(seed, i * 10 + 300, -15, 20) * 100) / 100;
    const adjustedValue = Math.round(r.baseValue * (1 + seededRange(seed, i * 10 + 301, -0.1, 0.15)) * 100) / 100;
    return {
      rank: i + 1,
      name: r.name,
      value: adjustedValue,
      change30d,
      team: r.team,
    };
  });

  // Sort by value descending
  players.sort((a, b) => b.value - a.value);
  players.forEach((p, i) => (p.rank = i + 1));

  const aggregateValue = players.reduce((sum, p) => sum + p.value, 0);
  const change30d = Math.round(
    (players.reduce((sum, p) => sum + p.change30d, 0) / players.length) * 100
  ) / 100;

  return {
    year,
    sport,
    className: `${year} ${sport} Rookie Class`,
    aggregateValue: Math.round(aggregateValue * 100) / 100,
    change30d,
    players,
    topPerformer: players[0].name,
    bottomPerformer: players[players.length - 1].name,
  };
}

export function getCareerArc(playerName: string): CareerArc | null {
  const player = PLAYER_DATABASE.find(
    p => p.name.toLowerCase() === playerName.toLowerCase()
  );
  if (!player) return null;

  const seed = hashString(player.name);
  const currentYear = new Date().getFullYear();
  const yearsActive = currentYear - player.debutYear;

  const phases: { phase: string; startYear: number; endYear: number; avgValue: number }[] = [];
  const valueCurve: { year: number; value: number }[] = [];

  let peakYear = player.debutYear;
  let peakValue = 0;

  for (let y = 0; y <= yearsActive; y++) {
    const year = player.debutYear + y;
    let phaseMultiplier: number;

    if (y <= 1) {
      phaseMultiplier = seededRange(seed, y + 400, 0.6, 0.9);
    } else if (y <= 3) {
      phaseMultiplier = seededRange(seed, y + 400, 0.8, 1.2);
    } else if (y <= yearsActive * 0.7) {
      phaseMultiplier = seededRange(seed, y + 400, 0.9, 1.3);
    } else {
      phaseMultiplier = seededRange(seed, y + 400, 0.5, 0.9);
    }

    const value = Math.round(player.baseValue * phaseMultiplier * 100) / 100;
    valueCurve.push({ year, value });

    if (value > peakValue) {
      peakValue = value;
      peakYear = year;
    }
  }

  // Build phase ranges
  if (yearsActive >= 1) {
    phases.push({
      phase: 'Rookie',
      startYear: player.debutYear,
      endYear: Math.min(player.debutYear + 1, currentYear),
      avgValue: player.baseValue * 0.75,
    });
  }
  if (yearsActive >= 3) {
    phases.push({
      phase: 'Breakout',
      startYear: player.debutYear + 2,
      endYear: Math.min(player.debutYear + 3, currentYear),
      avgValue: player.baseValue * 1.0,
    });
  }
  if (yearsActive >= 5) {
    phases.push({
      phase: 'Prime',
      startYear: player.debutYear + 4,
      endYear: Math.min(player.debutYear + Math.round(yearsActive * 0.7), currentYear),
      avgValue: player.baseValue * 1.1,
    });
  }
  if (yearsActive >= 8) {
    phases.push({
      phase: 'Decline',
      startYear: player.debutYear + Math.round(yearsActive * 0.7) + 1,
      endYear: currentYear,
      avgValue: player.baseValue * 0.7,
    });
  }

  return {
    playerName: player.name,
    phases,
    currentPhase: player.phase,
    valueCurve,
    peakYear,
    peakValue,
  };
}

export function simulateInjuryImpact(playerName: string): InjuryImpact | null {
  const player = PLAYER_DATABASE.find(
    p => p.name.toLowerCase() === playerName.toLowerCase()
  );
  if (!player) return null;

  const seed = hashString(player.name) + 9999;
  const immediateDropPct = Math.round(seededRange(seed, 500, 10, 30) * 100) / 100;
  const recoveryMonths = Math.round(seededRange(seed, 501, 2, 6));

  const recoveryTimeline: { month: number; valuePct: number }[] = [];
  let currentPct = 100 - immediateDropPct;
  recoveryTimeline.push({ month: 0, valuePct: 100 });
  recoveryTimeline.push({ month: 1, valuePct: Math.round(currentPct * 100) / 100 });

  for (let m = 2; m <= recoveryMonths + 2; m++) {
    const recovery = (immediateDropPct / recoveryMonths) * seededRange(seed, 502 + m, 0.7, 1.3);
    currentPct = Math.min(100, currentPct + recovery);
    recoveryTimeline.push({ month: m, valuePct: Math.round(currentPct * 100) / 100 });
  }

  const patterns = [
    'Historically recovers 85-95% of pre-injury value within recovery window',
    'Similar injuries have shown V-shaped recovery patterns in card values',
    'Market typically overreacts to initial news, creating buying opportunities',
    'Recovery closely tracks return-to-play timeline announcements',
  ];

  return {
    playerName: player.name,
    immediateDropPct,
    recoveryMonths,
    recoveryTimeline,
    historicalPattern: patterns[Math.floor(seededRange(seed, 510, 0, patterns.length))],
    currentValuePct: Math.round(currentPct * 100) / 100,
  };
}

export function getTeamIndex(team: string, cards: CardInventory[]): TeamIndex | null {
  const teamPlayers = PLAYER_DATABASE.filter(
    p => p.team.toLowerCase() === team.toLowerCase()
  );
  if (teamPlayers.length === 0) return null;

  const seed = hashString(team) + dateSeed();
  const totalValue = teamPlayers.reduce((sum, p) => sum + p.baseValue, 0);
  const change30d = Math.round(seededRange(seed, 600, -8, 12) * 100) / 100;

  const teamCards = cards.filter(c =>
    teamPlayers.some(p => p.name.toLowerCase() === c.player.toLowerCase())
  );

  const topPlayer = [...teamPlayers].sort((a, b) => b.baseValue - a.baseValue)[0];

  return {
    team,
    sport: teamPlayers[0].sport,
    totalValue,
    playerCount: teamCards.length,
    change30d,
    topPlayer: topPlayer.name,
    sparkline: generateSparkline(team, change30d > 0 ? 1 : -1),
  };
}

export function getSportIndexes(cards: CardInventory[]): SportIndex[] {
  const sports: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
  const seed = dateSeed();

  return sports.map((sport, si) => {
    const sportPlayers = PLAYER_DATABASE.filter(p => p.sport === sport);
    const totalValue = sportPlayers.reduce((sum, p) => sum + p.baseValue, 0);
    const sportCards = cards.filter(c => c.sport === sport);
    const volume = sportCards.length;
    const change30d = Math.round(seededRange(seed, 700 + si, -6, 10) * 100) / 100;

    let health: 'strong' | 'neutral' | 'weak' = 'neutral';
    if (change30d > 3) health = 'strong';
    else if (change30d < -3) health = 'weak';

    return {
      sport,
      totalValue,
      volume,
      change30d,
      sparkline: generateSparkline(sport, change30d > 0 ? 1 : -1),
      health,
    };
  });
}

export function getHotColdList(
  cards: CardInventory[],
  period: '24h' | '7d' | '30d' = '7d'
): HotColdEntry[] {
  const seed = dateSeed();
  const periodOffsets: Record<string, number> = { '24h': 800, '7d': 900, '30d': 1000 };
  const offsetBase = periodOffsets[period];

  const entries: HotColdEntry[] = PLAYER_DATABASE.map((player, i) => {
    const volatilityScale = period === '24h' ? 1 : period === '7d' ? 2 : 3;
    const changePct = Math.round(
      seededRange(seed, offsetBase + i, -player.volatility * 30 * volatilityScale, player.volatility * 30 * volatilityScale) * 100
    ) / 100;

    return {
      playerName: player.name,
      sport: player.sport,
      team: player.team,
      changePct,
      currentValue: player.baseValue,
      sparkline: generateSparkline(player.name, changePct > 0 ? 1 : -1),
      direction: changePct >= 0 ? 'hot' as const : 'cold' as const,
    };
  });

  // Sort by absolute change
  entries.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));

  return entries;
}

// ---- Search helper ----

export function searchPlayers(query: string): PlayerData[] {
  if (!query || query.length < 2) return PLAYER_DATABASE.slice(0, 10);
  const lq = query.toLowerCase();
  return PLAYER_DATABASE.filter(
    p =>
      p.name.toLowerCase().includes(lq) ||
      p.team.toLowerCase().includes(lq) ||
      p.sport.toLowerCase().includes(lq)
  );
}

// ---- Get all teams ----

export function getAllTeams(): { team: string; sport: Sport }[] {
  const seen = new Set<string>();
  const teams: { team: string; sport: Sport }[] = [];
  for (const p of PLAYER_DATABASE) {
    if (!seen.has(p.team)) {
      seen.add(p.team);
      teams.push({ team: p.team, sport: p.sport });
    }
  }
  return teams.sort((a, b) => a.team.localeCompare(b.team));
}

export function getAvailableRookieClasses(): { year: number; sport: Sport }[] {
  return Object.keys(ROOKIE_CLASSES).map(key => {
    const [year, sport] = key.split('_');
    return { year: parseInt(year), sport: sport as Sport };
  });
}
