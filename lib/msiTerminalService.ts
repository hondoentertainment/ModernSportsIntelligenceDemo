// ── MSI Terminal Service — Bloomberg-Style Command Interface ────────────────────
// Phase 84: Professional command-line interface for sports card analytics

// ── Interfaces ──────────────────────────────────────────────────────────────────

export type CommandCategory = 'market' | 'portfolio' | 'player' | 'analytics' | 'system';

export type ResultType =
  | 'player_data'
  | 'portfolio_summary'
  | 'market_data'
  | 'chart'
  | 'table'
  | 'error'
  | 'help';

export interface TerminalCommand {
  command: string;
  description: string;
  category: CommandCategory;
  usage: string;
  example: string;
  aliases: string[];
}

export interface CommandResult {
  command: string;
  timestamp: string;
  resultType: ResultType;
  data: any;
  executionTime: number;
}

export interface PlayerQuickLook {
  name: string;
  sport: string;
  team: string;
  topCardValue: number;
  priceChange24h: number;
  priceChange7d: number;
  portfolioExposure: number;
  sentiment: number;
  recentSales: { date: string; price: number; card: string }[];
  keyStats: Record<string, string | number>;
}

export interface TerminalSession {
  id: string;
  commands: { input: string; result: CommandResult; timestamp: string }[];
  startedAt: string;
  commandCount: number;
}

export interface Workspace {
  id: string;
  name: string;
  panels: { type: string; command: string; position: number }[];
  createdAt: string;
}

// ── Constants ───────────────────────────────────────────────────────────────────

const HISTORY_KEY = 'msi_terminal_history';
const WORKSPACES_KEY = 'msi_terminal_workspaces';
const MAX_HISTORY = 200;

// ── Seeded random helper ────────────────────────────────────────────────────────

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ── Player database ─────────────────────────────────────────────────────────────

interface PlayerRecord {
  name: string;
  sport: string;
  team: string;
  topCardValue: number;
  sentiment: number;
  stats: Record<string, string | number>;
}

const PLAYER_DB: PlayerRecord[] = [
  { name: 'Patrick Mahomes', sport: 'Football', team: 'Kansas City Chiefs', topCardValue: 4850, sentiment: 92, stats: { 'Pass Yards': '5,250', 'TDs': 41, 'QBR': 78.3, 'Career Starts': 104 } },
  { name: 'LeBron James', sport: 'Basketball', team: 'Los Angeles Lakers', topCardValue: 12500, sentiment: 88, stats: { 'PPG': 25.7, 'RPG': 7.3, 'APG': 8.3, 'Championships': 4 } },
  { name: 'Shohei Ohtani', sport: 'Baseball', team: 'Los Angeles Dodgers', topCardValue: 8900, sentiment: 95, stats: { 'HR': 54, 'AVG': '.304', 'ERA': 3.14, 'Wins': 10 } },
  { name: 'Connor McDavid', sport: 'Hockey', team: 'Edmonton Oilers', topCardValue: 3200, sentiment: 90, stats: { 'Goals': 64, 'Assists': 89, 'Points': 153, '+/-': '+32' } },
  { name: 'Luka Doncic', sport: 'Basketball', team: 'Dallas Mavericks', topCardValue: 6300, sentiment: 85, stats: { 'PPG': 33.9, 'RPG': 9.2, 'APG': 9.8, 'All-Star': 5 } },
  { name: 'Mike Trout', sport: 'Baseball', team: 'Los Angeles Angels', topCardValue: 7200, sentiment: 68, stats: { 'HR': 378, 'AVG': '.300', 'WAR': 85.2, 'MVPs': 3 } },
  { name: 'Travis Kelce', sport: 'Football', team: 'Kansas City Chiefs', topCardValue: 2100, sentiment: 82, stats: { 'Rec Yards': '11,328', 'TDs': 76, 'Pro Bowls': 9, 'Catch%': '67.3' } },
  { name: 'Jayson Tatum', sport: 'Basketball', team: 'Boston Celtics', topCardValue: 3800, sentiment: 87, stats: { 'PPG': 26.9, 'RPG': 8.1, 'APG': 4.6, 'All-Star': 5 } },
  { name: 'Victor Wembanyama', sport: 'Basketball', team: 'San Antonio Spurs', topCardValue: 9500, sentiment: 96, stats: { 'PPG': 21.4, 'BPG': 3.6, 'RPG': 10.6, 'Height': "7'4\"" } },
  { name: 'Caitlin Clark', sport: 'Basketball', team: 'Indiana Fever', topCardValue: 2800, sentiment: 94, stats: { 'PPG': 19.2, 'APG': 8.4, '3P%': '.342', 'ROY': 'Yes' } },
  { name: 'Josh Allen', sport: 'Football', team: 'Buffalo Bills', topCardValue: 3500, sentiment: 84, stats: { 'Pass Yards': '4,544', 'TDs': 40, 'Rush TDs': 12, 'QBR': 71.6 } },
  { name: 'Aaron Judge', sport: 'Baseball', team: 'New York Yankees', topCardValue: 5100, sentiment: 86, stats: { 'HR': 62, 'RBI': 131, 'OPS': '.994', 'MVP': 2 } },
  { name: 'Tyreek Hill', sport: 'Football', team: 'Miami Dolphins', topCardValue: 1600, sentiment: 72, stats: { 'Rec Yards': '1,799', 'TDs': 13, 'YPC': 14.2, 'Speed': '4.29' } },
  { name: 'Nikola Jokic', sport: 'Basketball', team: 'Denver Nuggets', topCardValue: 4200, sentiment: 91, stats: { 'PPG': 26.4, 'RPG': 12.4, 'APG': 9.0, 'MVPs': 3 } },
  { name: 'Lamar Jackson', sport: 'Football', team: 'Baltimore Ravens', topCardValue: 2900, sentiment: 88, stats: { 'Pass Yards': '3,678', 'TDs': 24, 'Rush Yards': '821', 'MVP': 2 } },
  { name: 'Bryce Harper', sport: 'Baseball', team: 'Philadelphia Phillies', topCardValue: 3100, sentiment: 80, stats: { 'HR': 315, 'AVG': '.282', 'OPS': '.894', 'MVPs': 2 } },
  { name: 'Stephen Curry', sport: 'Basketball', team: 'Golden State Warriors', topCardValue: 8700, sentiment: 89, stats: { 'PPG': 26.4, '3PM': 3588, 'FT%': '.911', 'Championships': 4 } },
  { name: 'Mookie Betts', sport: 'Baseball', team: 'Los Angeles Dodgers', topCardValue: 2400, sentiment: 83, stats: { 'HR': 263, 'AVG': '.291', 'Gold Gloves': 6, 'MVP': 1 } },
  { name: 'CeeDee Lamb', sport: 'Football', team: 'Dallas Cowboys', topCardValue: 1900, sentiment: 79, stats: { 'Rec Yards': '1,749', 'TDs': 14, 'Receptions': 135, 'Pro Bowls': 3 } },
  { name: 'Auston Matthews', sport: 'Hockey', team: 'Toronto Maple Leafs', topCardValue: 2600, sentiment: 81, stats: { 'Goals': 69, 'Points': 107, 'Rocket Richard': 3, 'Hart': 1 } },
];

// ── Command Registry ────────────────────────────────────────────────────────────

const COMMAND_REGISTRY: TerminalCommand[] = [
  // Player commands
  { command: 'GO', description: 'Player quick-look — instant snapshot of player value & metrics', category: 'player', usage: '{PLAYER} <GO>', example: 'MAHOMES GO', aliases: ['LOOK', 'QL'] },
  { command: 'COMP', description: 'Player comparables — find similar players by value & trajectory', category: 'player', usage: '{PLAYER} COMP', example: 'LEBRON COMP', aliases: ['COMPARABLE', 'SIMILAR'] },
  { command: 'HIST', description: 'Player price history — 30/90/365 day price chart', category: 'player', usage: '{PLAYER} HIST', example: 'OHTANI HIST', aliases: ['HISTORY', 'PRICE'] },
  { command: 'NEWS', description: 'Player news feed — latest headlines affecting card value', category: 'player', usage: '{PLAYER} NEWS', example: 'WEMBY NEWS', aliases: ['HEADLINES', 'FEED'] },
  { command: 'DEPTH', description: 'Player depth analysis — full valuation breakdown', category: 'player', usage: '{PLAYER} DEPTH', example: 'MAHOMES DEPTH', aliases: ['DEEP', 'ANALYSIS'] },
  { command: 'TREND', description: 'Player trend indicators — momentum & trajectory signals', category: 'player', usage: '{PLAYER} TREND', example: 'CURRY TREND', aliases: ['MOMENTUM'] },
  { command: 'GRADE', description: 'Card grade distribution for player', category: 'player', usage: '{PLAYER} GRADE', example: 'JUDGE GRADE', aliases: ['PSA', 'BGS'] },
  // Portfolio commands
  { command: 'PORT', description: 'Portfolio summary — holdings, value, P&L', category: 'portfolio', usage: 'PORT', example: 'PORT', aliases: ['PORTFOLIO', 'HOLDINGS'] },
  { command: 'PORT PERF', description: 'Portfolio performance — returns by period', category: 'portfolio', usage: 'PORT PERF', example: 'PORT PERF', aliases: ['PERFORMANCE'] },
  { command: 'PORT RISK', description: 'Portfolio risk metrics — VaR, volatility, drawdown', category: 'portfolio', usage: 'PORT RISK', example: 'PORT RISK', aliases: ['RISK'] },
  { command: 'PORT ATTR', description: 'Portfolio attribution — P&L by sport, player, position', category: 'portfolio', usage: 'PORT ATTR', example: 'PORT ATTR', aliases: ['ATTRIBUTION'] },
  { command: 'PORT ALLOC', description: 'Portfolio allocation breakdown by category', category: 'portfolio', usage: 'PORT ALLOC', example: 'PORT ALLOC', aliases: ['ALLOCATION'] },
  { command: 'PORT OPT', description: 'Portfolio optimization suggestions', category: 'portfolio', usage: 'PORT OPT', example: 'PORT OPT', aliases: ['OPTIMIZE'] },
  // Market commands
  { command: 'MSI500', description: 'MSI 500 Index — sports card market composite index', category: 'market', usage: 'MSI500', example: 'MSI500', aliases: ['INDEX', 'MSI'] },
  { command: 'MOVERS', description: 'Top movers — biggest gainers & losers today', category: 'market', usage: 'MOVERS', example: 'MOVERS', aliases: ['TOP', 'GAINERS'] },
  { command: 'VOL', description: 'Market volatility index — fear/greed gauge', category: 'market', usage: 'VOL', example: 'VOL', aliases: ['VOLATILITY', 'VIX'] },
  { command: 'ARB', description: 'Arbitrage opportunities — cross-platform price gaps', category: 'market', usage: 'ARB', example: 'ARB', aliases: ['ARBITRAGE'] },
  { command: 'SECTOR', description: 'Sector performance — returns by sport/league', category: 'market', usage: 'SECTOR', example: 'SECTOR', aliases: ['SECTORS'] },
  { command: 'FLOW', description: 'Market flow data — buy/sell pressure indicators', category: 'market', usage: 'FLOW', example: 'FLOW', aliases: ['FLOWS'] },
  { command: 'HEAT', description: 'Market heatmap — visual sector performance', category: 'market', usage: 'HEAT', example: 'HEAT', aliases: ['HEATMAP'] },
  // Analytics commands
  { command: 'SCREEN', description: 'Card screener — filter by criteria (value, sport, trend)', category: 'analytics', usage: 'SCREEN {criteria}', example: 'SCREEN VALUE>1000 SPORT=NFL', aliases: ['SCREENER', 'FILTER'] },
  { command: 'CORR', description: 'Correlation matrix — cross-asset correlation analysis', category: 'analytics', usage: 'CORR', example: 'CORR', aliases: ['CORRELATION'] },
  { command: 'BETA', description: 'Portfolio beta — sensitivity to market movements', category: 'analytics', usage: 'BETA', example: 'BETA', aliases: ['SENSITIVITY'] },
  { command: 'SHARP', description: 'Sharpe ratio — risk-adjusted return metrics', category: 'analytics', usage: 'SHARP', example: 'SHARP', aliases: ['SHARPE'] },
  { command: 'VAR', description: 'Value at Risk calculation for portfolio', category: 'analytics', usage: 'VAR {confidence}', example: 'VAR 95', aliases: ['VALUE_AT_RISK'] },
  { command: 'MONTE', description: 'Monte Carlo simulation for portfolio scenarios', category: 'analytics', usage: 'MONTE {iterations}', example: 'MONTE 1000', aliases: ['MONTECARLO', 'MC'] },
  { command: 'BACKTEST', description: 'Strategy backtesting over historical data', category: 'analytics', usage: 'BACKTEST {strategy}', example: 'BACKTEST MOMENTUM', aliases: ['BT'] },
  // System commands
  { command: 'HELP', description: 'Show all available commands and usage', category: 'system', usage: 'HELP {category?}', example: 'HELP', aliases: ['?', 'COMMANDS'] },
  { command: 'HISTORY', description: 'Show command history for this session', category: 'system', usage: 'HISTORY', example: 'HISTORY', aliases: ['CMDHIST'] },
  { command: 'WS SAVE', description: 'Save current workspace layout', category: 'system', usage: 'WS SAVE {name}', example: 'WS SAVE my_layout', aliases: ['SAVE'] },
  { command: 'WS LOAD', description: 'Load a saved workspace layout', category: 'system', usage: 'WS LOAD {name}', example: 'WS LOAD my_layout', aliases: ['LOAD'] },
  { command: 'WS LIST', description: 'List all saved workspaces', category: 'system', usage: 'WS LIST', example: 'WS LIST', aliases: ['WORKSPACES'] },
  { command: 'CLEAR', description: 'Clear terminal output', category: 'system', usage: 'CLEAR', example: 'CLEAR', aliases: ['CLS'] },
  { command: 'STATUS', description: 'System status — connection, data freshness', category: 'system', usage: 'STATUS', example: 'STATUS', aliases: ['SYS'] },
  { command: 'THEME', description: 'Toggle terminal color theme', category: 'system', usage: 'THEME {name}', example: 'THEME CLASSIC', aliases: [] },
];

// ── Data generators ─────────────────────────────────────────────────────────────

function findPlayer(query: string): PlayerRecord | undefined {
  const q = query.toUpperCase().trim();
  return PLAYER_DB.find(p => {
    const upper = p.name.toUpperCase();
    const last = upper.split(' ').pop() || '';
    const first = upper.split(' ')[0];
    return upper === q || last === q || first === q || upper.includes(q);
  });
}

function generatePlayerQuickLook(player: PlayerRecord, seed: string): PlayerQuickLook {
  const rng = seededRandom(simpleHash(seed + player.name));
  const change24h = (rng() - 0.45) * 12;
  const change7d = (rng() - 0.4) * 20;
  const sales: PlayerQuickLook['recentSales'] = [];
  for (let i = 0; i < 6; i++) {
    const daysAgo = Math.floor(rng() * 14) + 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    sales.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(player.topCardValue * (0.3 + rng() * 0.8)),
      card: pick(['2020 Prizm Base PSA 10', '2021 Select Premier Level', '2019 Optic Rated Rookie BGS 9.5', '2022 Bowman Chrome 1st Auto', '2020 Mosaic Base PSA 10', '2023 Topps Chrome RC'], rng),
    });
  }
  return {
    name: player.name,
    sport: player.sport,
    team: player.team,
    topCardValue: player.topCardValue,
    priceChange24h: Math.round(change24h * 100) / 100,
    priceChange7d: Math.round(change7d * 100) / 100,
    portfolioExposure: Math.round(rng() * 25 * 100) / 100,
    sentiment: player.sentiment,
    recentSales: sales.sort((a, b) => b.date.localeCompare(a.date)),
    keyStats: player.stats,
  };
}

function generatePriceHistory(player: PlayerRecord): { date: string; price: number }[] {
  const rng = seededRandom(simpleHash(player.name + 'hist'));
  const data: { date: string; price: number }[] = [];
  let price = player.topCardValue * 0.7;
  for (let i = 90; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    price = price * (1 + (rng() - 0.48) * 0.04);
    data.push({ date: d.toISOString().split('T')[0], price: Math.round(price) });
  }
  return data;
}

function generateComparables(player: PlayerRecord): { name: string; sport: string; value: number; change7d: number; similarity: number }[] {
  const rng = seededRandom(simpleHash(player.name + 'comp'));
  const sameSport = PLAYER_DB.filter(p => p.sport === player.sport && p.name !== player.name);
  const others = PLAYER_DB.filter(p => p.sport !== player.sport);
  const comps = [...sameSport.slice(0, 3), ...others.slice(0, 2)];
  return comps.map(c => ({
    name: c.name,
    sport: c.sport,
    value: c.topCardValue,
    change7d: Math.round((rng() - 0.4) * 18 * 100) / 100,
    similarity: Math.round((0.55 + rng() * 0.4) * 100),
  })).sort((a, b) => b.similarity - a.similarity);
}

function generatePlayerNews(player: PlayerRecord): { headline: string; source: string; time: string; impact: 'positive' | 'negative' | 'neutral' }[] {
  const rng = seededRandom(simpleHash(player.name + 'news' + new Date().toDateString()));
  const templates = [
    { t: `${player.name} posts career performance, card prices surge`, impact: 'positive' as const },
    { t: `Market analysts upgrade ${player.name} cards to "Strong Buy"`, impact: 'positive' as const },
    { t: `${player.team} announces contract extension for ${player.name}`, impact: 'positive' as const },
    { t: `${player.name} questionable for next game — market watches closely`, impact: 'negative' as const },
    { t: `PSA population report shows increased supply of ${player.name} rookies`, impact: 'negative' as const },
    { t: `New ${player.name} insert set announced by Panini`, impact: 'neutral' as const },
    { t: `Collector spotlight: Why ${player.name} is a long-term hold`, impact: 'positive' as const },
    { t: `${player.sport} season outlook: What it means for ${player.name} cards`, impact: 'neutral' as const },
  ];
  const sources = ['CardWire', 'BlowoutBuzz', 'PSA News', 'Beckett Live', 'Sports Card Investor', 'MSI Research'];
  const selected = templates.sort(() => rng() - 0.5).slice(0, 5);
  return selected.map((item, i) => ({
    headline: item.t,
    source: pick(sources, rng),
    time: `${Math.floor(rng() * 12) + 1}h ago`,
    impact: item.impact,
  }));
}

function generatePortfolioSummary(): any {
  const rng = seededRandom(simpleHash('port' + new Date().toDateString()));
  const holdings = PLAYER_DB.slice(0, 8).map(p => ({
    player: p.name,
    sport: p.sport,
    cards: Math.floor(rng() * 5) + 1,
    currentValue: Math.round(p.topCardValue * (0.4 + rng() * 0.7)),
    costBasis: Math.round(p.topCardValue * (0.3 + rng() * 0.5)),
    pnl: 0,
    weight: 0,
  }));
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  holdings.forEach(h => {
    h.pnl = Math.round(((h.currentValue - h.costBasis) / h.costBasis) * 10000) / 100;
    h.weight = Math.round((h.currentValue / totalValue) * 10000) / 100;
  });
  return {
    totalValue,
    totalCost: holdings.reduce((s, h) => s + h.costBasis, 0),
    totalPnL: Math.round(((totalValue - holdings.reduce((s, h) => s + h.costBasis, 0)) / holdings.reduce((s, h) => s + h.costBasis, 0)) * 10000) / 100,
    holdingsCount: holdings.reduce((s, h) => s + h.cards, 0),
    holdings: holdings.sort((a, b) => b.currentValue - a.currentValue),
    dayChange: Math.round((rng() - 0.45) * 4 * 100) / 100,
  };
}

function generatePortfolioPerformance(): any {
  const rng = seededRandom(simpleHash('perf' + new Date().toDateString()));
  return {
    periods: [
      { label: '1D', return: Math.round((rng() - 0.45) * 4 * 100) / 100 },
      { label: '1W', return: Math.round((rng() - 0.4) * 8 * 100) / 100 },
      { label: '1M', return: Math.round((rng() - 0.35) * 15 * 100) / 100 },
      { label: '3M', return: Math.round((rng() - 0.3) * 25 * 100) / 100 },
      { label: 'YTD', return: Math.round((rng() - 0.3) * 35 * 100) / 100 },
      { label: '1Y', return: Math.round((rng() - 0.25) * 50 * 100) / 100 },
    ],
    benchmark: { name: 'MSI 500', return1Y: Math.round((rng() - 0.3) * 30 * 100) / 100 },
    alpha: Math.round((rng() * 10 - 2) * 100) / 100,
    bestMonth: `+${Math.round(rng() * 15 * 100) / 100}%`,
    worstMonth: `-${Math.round(rng() * 12 * 100) / 100}%`,
  };
}

function generatePortfolioRisk(): any {
  const rng = seededRandom(simpleHash('risk' + new Date().toDateString()));
  return {
    var95: Math.round(rng() * 8000 + 2000),
    var99: Math.round(rng() * 12000 + 5000),
    volatility: Math.round((rng() * 20 + 10) * 100) / 100,
    maxDrawdown: Math.round((rng() * 25 + 5) * 100) / 100,
    beta: Math.round((0.6 + rng() * 0.8) * 100) / 100,
    sharpeRatio: Math.round((0.5 + rng() * 2) * 100) / 100,
    sortinoRatio: Math.round((0.8 + rng() * 2.5) * 100) / 100,
    concentrationRisk: Math.round((rng() * 40 + 20) * 100) / 100,
    correlationToMarket: Math.round((0.3 + rng() * 0.6) * 100) / 100,
  };
}

function generateMSI500(): any {
  const rng = seededRandom(simpleHash('msi500' + new Date().toDateString()));
  const level = Math.round(5000 + rng() * 1000);
  const data: { date: string; value: number }[] = [];
  let v = level * 0.85;
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    v = v * (1 + (rng() - 0.47) * 0.015);
    data.push({ date: d.toISOString().split('T')[0], value: Math.round(v) });
  }
  return {
    level,
    change: Math.round((rng() - 0.45) * 3 * 100) / 100,
    high52w: Math.round(level * 1.12),
    low52w: Math.round(level * 0.78),
    advancers: Math.floor(rng() * 200 + 250),
    decliners: Math.floor(rng() * 200 + 150),
    unchanged: Math.floor(rng() * 50 + 30),
    volume: `$${Math.round(rng() * 50 + 30)}M`,
    chartData: data,
    sectors: [
      { name: 'Football', change: Math.round((rng() - 0.4) * 6 * 100) / 100, weight: 32 },
      { name: 'Basketball', change: Math.round((rng() - 0.4) * 6 * 100) / 100, weight: 28 },
      { name: 'Baseball', change: Math.round((rng() - 0.4) * 6 * 100) / 100, weight: 22 },
      { name: 'Hockey', change: Math.round((rng() - 0.4) * 6 * 100) / 100, weight: 10 },
      { name: 'Soccer', change: Math.round((rng() - 0.4) * 6 * 100) / 100, weight: 8 },
    ],
  };
}

function generateMovers(): any {
  const rng = seededRandom(simpleHash('movers' + new Date().toDateString()));
  const shuffled = [...PLAYER_DB].sort(() => rng() - 0.5);
  return {
    gainers: shuffled.slice(0, 5).map(p => ({
      name: p.name,
      sport: p.sport,
      change: Math.round((rng() * 15 + 2) * 100) / 100,
      value: p.topCardValue,
      volume: Math.floor(rng() * 50 + 10),
    })),
    losers: shuffled.slice(5, 10).map(p => ({
      name: p.name,
      sport: p.sport,
      change: -Math.round((rng() * 12 + 1) * 100) / 100,
      value: p.topCardValue,
      volume: Math.floor(rng() * 30 + 5),
    })),
    mostActive: shuffled.slice(10, 15).map(p => ({
      name: p.name,
      sport: p.sport,
      change: Math.round((rng() - 0.5) * 10 * 100) / 100,
      value: p.topCardValue,
      volume: Math.floor(rng() * 100 + 40),
    })),
  };
}

function generateVolatility(): any {
  const rng = seededRandom(simpleHash('vol' + new Date().toDateString()));
  const vix = Math.round((15 + rng() * 35) * 100) / 100;
  const data: { date: string; vix: number }[] = [];
  let v = vix * 0.9;
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    v = Math.max(8, Math.min(60, v + (rng() - 0.5) * 5));
    data.push({ date: d.toISOString().split('T')[0], vix: Math.round(v * 100) / 100 });
  }
  return {
    currentVix: vix,
    label: vix < 20 ? 'Low — Greed' : vix < 35 ? 'Moderate' : 'High — Fear',
    change: Math.round((rng() - 0.5) * 8 * 100) / 100,
    chartData: data,
    sectorVol: [
      { sector: 'Football', vol: Math.round((10 + rng() * 25) * 100) / 100 },
      { sector: 'Basketball', vol: Math.round((10 + rng() * 25) * 100) / 100 },
      { sector: 'Baseball', vol: Math.round((8 + rng() * 20) * 100) / 100 },
      { sector: 'Hockey', vol: Math.round((12 + rng() * 30) * 100) / 100 },
    ],
  };
}

function generateArbitrage(): any {
  const rng = seededRandom(simpleHash('arb' + new Date().toDateString()));
  return {
    opportunities: PLAYER_DB.slice(0, 6).map(p => ({
      player: p.name,
      card: pick(['2020 Prizm Base PSA 10', '2021 Select Tier 1', '2023 Bowman Chrome Auto'], rng),
      platformA: pick(['eBay', 'COMC', 'MySlabs'], rng),
      priceA: Math.round(p.topCardValue * (0.85 + rng() * 0.1)),
      platformB: pick(['StockX', 'Alt', 'Goldin'], rng),
      priceB: Math.round(p.topCardValue * (0.95 + rng() * 0.15)),
      spread: 0,
      confidence: Math.round((70 + rng() * 25) * 10) / 10,
    })).map(o => ({ ...o, spread: Math.round(((o.priceB - o.priceA) / o.priceA) * 10000) / 100 }))
      .filter(o => o.spread > 0)
      .sort((a, b) => b.spread - a.spread),
  };
}

function generateCorrelation(): any {
  const rng = seededRandom(simpleHash('corr' + new Date().toDateString()));
  const sports = ['Football', 'Basketball', 'Baseball', 'Hockey'];
  const matrix: { sport1: string; sport2: string; correlation: number }[] = [];
  for (let i = 0; i < sports.length; i++) {
    for (let j = i; j < sports.length; j++) {
      matrix.push({
        sport1: sports[i],
        sport2: sports[j],
        correlation: i === j ? 1 : Math.round((rng() * 0.7 - 0.1) * 100) / 100,
      });
    }
  }
  return { matrix, note: 'Cross-sport correlation based on 90-day rolling returns' };
}

function generateScreener(): any {
  const rng = seededRandom(simpleHash('screen' + new Date().toDateString()));
  return {
    results: PLAYER_DB.sort(() => rng() - 0.5).slice(0, 10).map(p => ({
      name: p.name,
      sport: p.sport,
      team: p.team,
      value: p.topCardValue,
      change7d: Math.round((rng() - 0.4) * 18 * 100) / 100,
      volume: Math.floor(rng() * 80 + 10),
      sentiment: p.sentiment,
      signal: pick(['STRONG BUY', 'BUY', 'HOLD', 'SELL'], rng),
    })),
    filters: 'Default — All Sports, Value > $0',
  };
}

function generateSharpe(): any {
  const rng = seededRandom(simpleHash('sharp' + new Date().toDateString()));
  return {
    portfolioSharpe: Math.round((0.5 + rng() * 2.5) * 100) / 100,
    benchmarkSharpe: Math.round((0.3 + rng() * 1.5) * 100) / 100,
    riskFreeRate: 4.5,
    portfolioReturn: Math.round((5 + rng() * 25) * 100) / 100,
    portfolioVol: Math.round((10 + rng() * 20) * 100) / 100,
    rating: '',
  };
}

function generateBeta(): any {
  const rng = seededRandom(simpleHash('beta' + new Date().toDateString()));
  return {
    portfolioBeta: Math.round((0.6 + rng() * 0.9) * 100) / 100,
    sectorBetas: [
      { sector: 'Football', beta: Math.round((0.7 + rng() * 0.6) * 100) / 100 },
      { sector: 'Basketball', beta: Math.round((0.8 + rng() * 0.7) * 100) / 100 },
      { sector: 'Baseball', beta: Math.round((0.5 + rng() * 0.5) * 100) / 100 },
      { sector: 'Hockey', beta: Math.round((0.9 + rng() * 0.8) * 100) / 100 },
    ],
    interpretation: '',
  };
}

// ── Command Execution Engine ────────────────────────────────────────────────────

export function executeCommand(input: string): CommandResult {
  const start = performance.now();
  const trimmed = input.trim().toUpperCase();
  const timestamp = new Date().toISOString();

  if (!trimmed) {
    return { command: input, timestamp, resultType: 'error', data: { message: 'Empty command. Type HELP for available commands.' }, executionTime: 0 };
  }

  // HELP
  if (trimmed === 'HELP' || trimmed === '?' || trimmed === 'COMMANDS') {
    const grouped: Record<string, TerminalCommand[]> = {};
    COMMAND_REGISTRY.forEach(cmd => {
      if (!grouped[cmd.category]) grouped[cmd.category] = [];
      grouped[cmd.category].push(cmd);
    });
    return { command: input, timestamp, resultType: 'help', data: { grouped, total: COMMAND_REGISTRY.length }, executionTime: performance.now() - start };
  }

  // HELP {category}
  if (trimmed.startsWith('HELP ')) {
    const cat = trimmed.replace('HELP ', '').toLowerCase() as CommandCategory;
    const cmds = COMMAND_REGISTRY.filter(c => c.category === cat);
    if (cmds.length === 0) {
      return { command: input, timestamp, resultType: 'error', data: { message: `Unknown category "${cat}". Valid: market, portfolio, player, analytics, system` }, executionTime: performance.now() - start };
    }
    return { command: input, timestamp, resultType: 'help', data: { grouped: { [cat]: cmds }, total: cmds.length }, executionTime: performance.now() - start };
  }

  // CLEAR
  if (trimmed === 'CLEAR' || trimmed === 'CLS') {
    return { command: input, timestamp, resultType: 'table', data: { action: 'clear' }, executionTime: performance.now() - start };
  }

  // HISTORY
  if (trimmed === 'HISTORY' || trimmed === 'CMDHIST') {
    const history = getCommandHistory();
    return { command: input, timestamp, resultType: 'table', data: { history }, executionTime: performance.now() - start };
  }

  // STATUS
  if (trimmed === 'STATUS' || trimmed === 'SYS') {
    return {
      command: input, timestamp, resultType: 'table', data: {
        status: 'ONLINE',
        dataFeed: 'Connected',
        latency: `${Math.floor(Math.random() * 20 + 5)}ms`,
        lastUpdate: new Date().toISOString(),
        uptime: '99.97%',
        commandsToday: getCommandHistory().length,
        version: 'MSI Terminal v1.0.84',
      },
      executionTime: performance.now() - start,
    };
  }

  // Portfolio commands
  if (trimmed === 'PORT' || trimmed === 'PORTFOLIO' || trimmed === 'HOLDINGS') {
    return { command: input, timestamp, resultType: 'portfolio_summary', data: generatePortfolioSummary(), executionTime: performance.now() - start };
  }
  if (trimmed === 'PORT PERF' || trimmed === 'PERFORMANCE') {
    return { command: input, timestamp, resultType: 'table', data: { type: 'performance', ...generatePortfolioPerformance() }, executionTime: performance.now() - start };
  }
  if (trimmed === 'PORT RISK' || trimmed === 'RISK') {
    return { command: input, timestamp, resultType: 'table', data: { type: 'risk', ...generatePortfolioRisk() }, executionTime: performance.now() - start };
  }
  if (trimmed === 'PORT ATTR' || trimmed === 'ATTRIBUTION') {
    const rng = seededRandom(simpleHash('attr' + new Date().toDateString()));
    return { command: input, timestamp, resultType: 'table', data: { type: 'attribution', bySport: [
      { sport: 'Football', pnl: Math.round((rng() - 0.3) * 3000), weight: 32 },
      { sport: 'Basketball', pnl: Math.round((rng() - 0.3) * 2500), weight: 28 },
      { sport: 'Baseball', pnl: Math.round((rng() - 0.3) * 2000), weight: 22 },
      { sport: 'Hockey', pnl: Math.round((rng() - 0.3) * 1000), weight: 10 },
    ] }, executionTime: performance.now() - start };
  }
  if (trimmed === 'PORT ALLOC' || trimmed === 'ALLOCATION') {
    const rng = seededRandom(simpleHash('alloc' + new Date().toDateString()));
    return { command: input, timestamp, resultType: 'chart', data: { type: 'allocation', slices: [
      { name: 'Football', value: Math.round(30 + rng() * 10) },
      { name: 'Basketball', value: Math.round(25 + rng() * 10) },
      { name: 'Baseball', value: Math.round(15 + rng() * 10) },
      { name: 'Hockey', value: Math.round(5 + rng() * 8) },
      { name: 'Other', value: Math.round(3 + rng() * 5) },
    ] }, executionTime: performance.now() - start };
  }
  if (trimmed === 'PORT OPT' || trimmed === 'OPTIMIZE') {
    return { command: input, timestamp, resultType: 'table', data: { type: 'optimization', suggestions: [
      { action: 'REDUCE', player: 'LeBron James', reason: 'Over-concentration risk (18% of portfolio)', impact: '+0.3 Sharpe' },
      { action: 'ADD', player: 'Victor Wembanyama', reason: 'High momentum + low correlation to holdings', impact: '+$2,400 expected' },
      { action: 'HEDGE', player: 'Mike Trout', reason: 'Injury risk — consider trimming position', impact: 'Risk reduction' },
      { action: 'HOLD', player: 'Patrick Mahomes', reason: 'Strong fundamentals, fair valued', impact: 'Stable' },
    ] }, executionTime: performance.now() - start };
  }

  // Market commands
  if (trimmed === 'MSI500' || trimmed === 'INDEX' || trimmed === 'MSI') {
    // Cross-reference: Market Indices (Phase 86) — use real index data when available
    let indexData: any;
    try {
      const { getIndices, getIndexComparison } = require('./marketIndicesService');
      const indices = getIndices();
      const msi500 = indices.find((idx: any) => idx.ticker === 'MSI500');
      if (msi500) {
        const comparison = getIndexComparison();
        indexData = {
          type: 'index',
          level: msi500.currentValue,
          change: msi500.changePercent,
          high52w: msi500.high52Week,
          low52w: msi500.low52Week,
          advancers: Math.floor(msi500.components * 0.55),
          decliners: Math.floor(msi500.components * 0.35),
          unchanged: Math.floor(msi500.components * 0.10),
          volume: `$${Math.round(msi500.dataPoints[msi500.dataPoints.length - 1]?.volume / 1000)}K`,
          chartData: msi500.dataPoints.map((dp: any) => ({ date: dp.date, value: dp.value })),
          sectors: comparison.indices.slice(0, 5).map((idx: any) => ({
            name: idx.name.replace('MSI ', ''),
            change: idx.returns.day,
            weight: Math.round(100 / comparison.indices.length),
          })),
          sharpeRatio: msi500.sharpeRatio,
          annualizedReturn: msi500.annualizedReturn,
          maxDrawdown: msi500.maxDrawdown,
        };
      }
    } catch {
      // Fall back to generated data if marketIndicesService is unavailable
    }
    if (!indexData) {
      indexData = { type: 'index', ...generateMSI500() };
    }
    return { command: input, timestamp, resultType: 'market_data', data: indexData, executionTime: performance.now() - start };
  }
  if (trimmed === 'MOVERS' || trimmed === 'TOP' || trimmed === 'GAINERS') {
    return { command: input, timestamp, resultType: 'market_data', data: { type: 'movers', ...generateMovers() }, executionTime: performance.now() - start };
  }
  if (trimmed === 'VOL' || trimmed === 'VOLATILITY' || trimmed === 'VIX') {
    return { command: input, timestamp, resultType: 'market_data', data: { type: 'volatility', ...generateVolatility() }, executionTime: performance.now() - start };
  }
  if (trimmed === 'ARB' || trimmed === 'ARBITRAGE') {
    return { command: input, timestamp, resultType: 'market_data', data: { type: 'arbitrage', ...generateArbitrage() }, executionTime: performance.now() - start };
  }
  if (trimmed === 'SECTOR' || trimmed === 'SECTORS') {
    const idx = generateMSI500();
    return { command: input, timestamp, resultType: 'table', data: { type: 'sectors', sectors: idx.sectors }, executionTime: performance.now() - start };
  }
  if (trimmed === 'FLOW' || trimmed === 'FLOWS') {
    const rng = seededRandom(simpleHash('flow' + new Date().toDateString()));
    return { command: input, timestamp, resultType: 'table', data: { type: 'flow', flows: [
      { sector: 'Football', buyPressure: Math.round(rng() * 100), sellPressure: Math.round(rng() * 100), net: 0 },
      { sector: 'Basketball', buyPressure: Math.round(rng() * 100), sellPressure: Math.round(rng() * 100), net: 0 },
      { sector: 'Baseball', buyPressure: Math.round(rng() * 100), sellPressure: Math.round(rng() * 100), net: 0 },
      { sector: 'Hockey', buyPressure: Math.round(rng() * 100), sellPressure: Math.round(rng() * 100), net: 0 },
    ].map(f => ({ ...f, net: f.buyPressure - f.sellPressure })) }, executionTime: performance.now() - start };
  }
  if (trimmed === 'HEAT' || trimmed === 'HEATMAP') {
    const idx = generateMSI500();
    return { command: input, timestamp, resultType: 'chart', data: { type: 'heatmap', sectors: idx.sectors }, executionTime: performance.now() - start };
  }

  // Analytics commands
  if (trimmed.startsWith('SCREEN') || trimmed.startsWith('SCREENER') || trimmed.startsWith('FILTER')) {
    return { command: input, timestamp, resultType: 'table', data: { type: 'screener', ...generateScreener() }, executionTime: performance.now() - start };
  }
  if (trimmed === 'CORR' || trimmed === 'CORRELATION') {
    return { command: input, timestamp, resultType: 'table', data: { type: 'correlation', ...generateCorrelation() }, executionTime: performance.now() - start };
  }
  if (trimmed === 'BETA' || trimmed === 'SENSITIVITY') {
    const beta = generateBeta();
    beta.interpretation = beta.portfolioBeta > 1 ? 'Portfolio is more volatile than the market' : 'Portfolio is less volatile than the market';
    return { command: input, timestamp, resultType: 'table', data: { type: 'beta', ...beta }, executionTime: performance.now() - start };
  }
  if (trimmed === 'SHARP' || trimmed === 'SHARPE') {
    const sharp = generateSharpe();
    sharp.rating = sharp.portfolioSharpe > 2 ? 'Excellent' : sharp.portfolioSharpe > 1 ? 'Good' : sharp.portfolioSharpe > 0.5 ? 'Average' : 'Below Average';
    return { command: input, timestamp, resultType: 'table', data: { type: 'sharpe', ...sharp }, executionTime: performance.now() - start };
  }
  if (trimmed.startsWith('VAR') || trimmed === 'VALUE_AT_RISK') {
    const risk = generatePortfolioRisk();
    return { command: input, timestamp, resultType: 'table', data: { type: 'var', var95: risk.var95, var99: risk.var99, note: '95% confidence: portfolio will not lose more than this in one day' }, executionTime: performance.now() - start };
  }
  if (trimmed.startsWith('MONTE') || trimmed.startsWith('MC ')) {
    const rng = seededRandom(simpleHash('monte' + new Date().toDateString()));
    const scenarios: { date: string; p10: number; p50: number; p90: number }[] = [];
    let p10 = 10000, p50 = 10000, p90 = 10000;
    for (let i = 0; i <= 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      p10 *= (1 + (rng() - 0.55) * 0.05);
      p50 *= (1 + (rng() - 0.4) * 0.05);
      p90 *= (1 + (rng() - 0.25) * 0.05);
      scenarios.push({ date: d.toISOString().split('T')[0].slice(0, 7), p10: Math.round(p10), p50: Math.round(p50), p90: Math.round(p90) });
    }
    return { command: input, timestamp, resultType: 'chart', data: { type: 'montecarlo', scenarios, iterations: 10000 }, executionTime: performance.now() - start };
  }
  if (trimmed.startsWith('BACKTEST') || trimmed.startsWith('BT ')) {
    const rng = seededRandom(simpleHash('bt' + new Date().toDateString()));
    return { command: input, timestamp, resultType: 'table', data: { type: 'backtest',
      strategy: trimmed.includes(' ') ? trimmed.split(' ').slice(1).join(' ') : 'MOMENTUM',
      totalReturn: Math.round((rng() * 40 + 5) * 100) / 100,
      annualized: Math.round((rng() * 25 + 3) * 100) / 100,
      maxDrawdown: Math.round((rng() * 20 + 5) * 100) / 100,
      winRate: Math.round((50 + rng() * 25) * 100) / 100,
      trades: Math.floor(rng() * 100 + 30),
      sharpe: Math.round((0.5 + rng() * 2) * 100) / 100,
    }, executionTime: performance.now() - start };
  }

  // Workspace commands
  if (trimmed.startsWith('WS SAVE') || trimmed.startsWith('SAVE ')) {
    const name = trimmed.replace(/^(WS SAVE|SAVE)\s*/, '') || 'default';
    const ws: Workspace = { id: Date.now().toString(), name, panels: [], createdAt: new Date().toISOString() };
    const workspaces = getSavedWorkspaces();
    workspaces.push(ws);
    try { localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces)); } catch { /* noop */ }
    return { command: input, timestamp, resultType: 'table', data: { message: `Workspace "${name}" saved successfully.`, workspace: ws }, executionTime: performance.now() - start };
  }
  if (trimmed.startsWith('WS LOAD') || trimmed.startsWith('LOAD ')) {
    const name = trimmed.replace(/^(WS LOAD|LOAD)\s*/, '') || 'default';
    const workspaces = getSavedWorkspaces();
    const ws = workspaces.find(w => w.name.toUpperCase() === name.toUpperCase());
    if (!ws) {
      return { command: input, timestamp, resultType: 'error', data: { message: `Workspace "${name}" not found. Use WS LIST to see available workspaces.` }, executionTime: performance.now() - start };
    }
    return { command: input, timestamp, resultType: 'table', data: { message: `Workspace "${ws.name}" loaded.`, workspace: ws }, executionTime: performance.now() - start };
  }
  if (trimmed === 'WS LIST' || trimmed === 'WORKSPACES') {
    return { command: input, timestamp, resultType: 'table', data: { workspaces: getSavedWorkspaces() }, executionTime: performance.now() - start };
  }

  // THEME
  if (trimmed.startsWith('THEME')) {
    return { command: input, timestamp, resultType: 'table', data: { message: 'Theme updated. Current: CLASSIC (green on black)' }, executionTime: performance.now() - start };
  }

  // Player commands: {PLAYER} GO, {PLAYER} COMP, etc.
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 1) {
    const lastWord = parts[parts.length - 1];
    const playerQuery = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];

    // Check if last word is a known player command
    const playerCommands: Record<string, (p: PlayerRecord) => CommandResult> = {
      GO: (p) => ({ command: input, timestamp, resultType: 'player_data', data: { type: 'quicklook', ...generatePlayerQuickLook(p, new Date().toDateString()) }, executionTime: performance.now() - start }),
      LOOK: (p) => ({ command: input, timestamp, resultType: 'player_data', data: { type: 'quicklook', ...generatePlayerQuickLook(p, new Date().toDateString()) }, executionTime: performance.now() - start }),
      QL: (p) => ({ command: input, timestamp, resultType: 'player_data', data: { type: 'quicklook', ...generatePlayerQuickLook(p, new Date().toDateString()) }, executionTime: performance.now() - start }),
      COMP: (p) => ({ command: input, timestamp, resultType: 'table', data: { type: 'comparables', player: p.name, comparables: generateComparables(p) }, executionTime: performance.now() - start }),
      COMPARABLE: (p) => ({ command: input, timestamp, resultType: 'table', data: { type: 'comparables', player: p.name, comparables: generateComparables(p) }, executionTime: performance.now() - start }),
      SIMILAR: (p) => ({ command: input, timestamp, resultType: 'table', data: { type: 'comparables', player: p.name, comparables: generateComparables(p) }, executionTime: performance.now() - start }),
      HIST: (p) => ({ command: input, timestamp, resultType: 'chart', data: { type: 'priceHistory', player: p.name, history: generatePriceHistory(p) }, executionTime: performance.now() - start }),
      HISTORY: (p) => ({ command: input, timestamp, resultType: 'chart', data: { type: 'priceHistory', player: p.name, history: generatePriceHistory(p) }, executionTime: performance.now() - start }),
      PRICE: (p) => ({ command: input, timestamp, resultType: 'chart', data: { type: 'priceHistory', player: p.name, history: generatePriceHistory(p) }, executionTime: performance.now() - start }),
      NEWS: (p) => ({ command: input, timestamp, resultType: 'table', data: { type: 'news', player: p.name, articles: generatePlayerNews(p) }, executionTime: performance.now() - start }),
      HEADLINES: (p) => ({ command: input, timestamp, resultType: 'table', data: { type: 'news', player: p.name, articles: generatePlayerNews(p) }, executionTime: performance.now() - start }),
      FEED: (p) => ({ command: input, timestamp, resultType: 'table', data: { type: 'news', player: p.name, articles: generatePlayerNews(p) }, executionTime: performance.now() - start }),
      DEPTH: (p) => {
        const ql = generatePlayerQuickLook(p, new Date().toDateString());
        const hist = generatePriceHistory(p);
        const comps = generateComparables(p);
        return { command: input, timestamp, resultType: 'player_data', data: { type: 'depth', ...ql, priceHistory: hist, comparables: comps }, executionTime: performance.now() - start };
      },
      DEEP: (p) => playerCommands.DEPTH(p),
      ANALYSIS: (p) => playerCommands.DEPTH(p),
      TREND: (p) => {
        const rng2 = seededRandom(simpleHash(p.name + 'trend'));
        return { command: input, timestamp, resultType: 'table', data: { type: 'trend', player: p.name, signals: {
          momentum: rng2() > 0.5 ? 'BULLISH' : 'BEARISH',
          rsi: Math.round(30 + rng2() * 50),
          macd: rng2() > 0.5 ? 'BUY' : 'SELL',
          volumeTrend: rng2() > 0.4 ? 'INCREASING' : 'DECLINING',
          support: Math.round(p.topCardValue * 0.85),
          resistance: Math.round(p.topCardValue * 1.15),
          '50DMA': Math.round(p.topCardValue * (0.9 + rng2() * 0.15)),
          '200DMA': Math.round(p.topCardValue * (0.8 + rng2() * 0.2)),
        } }, executionTime: performance.now() - start };
      },
      MOMENTUM: (p) => playerCommands.TREND(p),
      GRADE: (p) => {
        const rng2 = seededRandom(simpleHash(p.name + 'grade'));
        return { command: input, timestamp, resultType: 'table', data: { type: 'grade', player: p.name, distribution: [
          { grade: 'PSA 10', count: Math.floor(rng2() * 500 + 50), avgPrice: Math.round(p.topCardValue) },
          { grade: 'PSA 9', count: Math.floor(rng2() * 800 + 200), avgPrice: Math.round(p.topCardValue * 0.35) },
          { grade: 'BGS 9.5', count: Math.floor(rng2() * 300 + 30), avgPrice: Math.round(p.topCardValue * 0.65) },
          { grade: 'BGS 10', count: Math.floor(rng2() * 50 + 5), avgPrice: Math.round(p.topCardValue * 2.5) },
          { grade: 'SGC 10', count: Math.floor(rng2() * 200 + 20), avgPrice: Math.round(p.topCardValue * 0.7) },
          { grade: 'Raw', count: Math.floor(rng2() * 2000 + 500), avgPrice: Math.round(p.topCardValue * 0.15) },
        ] }, executionTime: performance.now() - start };
      },
      PSA: (p) => playerCommands.GRADE(p),
      BGS: (p) => playerCommands.GRADE(p),
    };

    if (playerCommands[lastWord]) {
      const player = findPlayer(playerQuery);
      if (player) {
        const result = playerCommands[lastWord](player);
        saveToHistory(input, result);
        return result;
      }
    }

    // Try the whole input as a player name with implicit GO
    const playerFull = findPlayer(trimmed);
    if (playerFull) {
      const result = playerCommands.GO(playerFull);
      saveToHistory(input, result);
      return result;
    }

    // Try first part as player
    if (parts.length === 1) {
      // Fuzzy match attempt
      const suggestions = getAutocompleteSuggestions(trimmed);
      if (suggestions.length > 0) {
        return { command: input, timestamp, resultType: 'error', data: {
          message: `Unknown command: "${input}". Did you mean one of these?`,
          suggestions,
        }, executionTime: performance.now() - start };
      }
    }
  }

  // Unknown command — provide suggestions
  const suggestions = getAutocompleteSuggestions(trimmed);
  const result: CommandResult = { command: input, timestamp, resultType: 'error', data: {
    message: `Unknown command: "${input}". Type HELP for available commands.`,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  }, executionTime: performance.now() - start };
  saveToHistory(input, result);
  return result;
}

// ── Autocomplete & Fuzzy Matching ───────────────────────────────────────────────

export function getAutocompleteSuggestions(partial: string): string[] {
  const p = partial.toUpperCase().trim();
  if (!p) return [];

  const results: string[] = [];

  // Match command names
  COMMAND_REGISTRY.forEach(cmd => {
    if (cmd.command.startsWith(p) || cmd.aliases.some(a => a.startsWith(p))) {
      results.push(cmd.usage);
    }
  });

  // Match player names
  PLAYER_DB.forEach(pl => {
    const upper = pl.name.toUpperCase();
    const last = upper.split(' ').pop() || '';
    if (upper.startsWith(p) || last.startsWith(p)) {
      results.push(`${pl.name.toUpperCase()} GO`);
    }
  });

  return results.slice(0, 8);
}

// ── History & Persistence ───────────────────────────────────────────────────────

function saveToHistory(input: string, result: CommandResult): void {
  try {
    const history = getCommandHistory();
    history.unshift({ input, timestamp: new Date().toISOString(), resultType: result.resultType });
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* noop */ }
}

export function getCommandHistory(): { input: string; timestamp: string; resultType: string }[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearCommandHistory(): void {
  try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
}

// ── Workspaces ──────────────────────────────────────────────────────────────────

export function getSavedWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function getCommandRegistry(): TerminalCommand[] {
  return [...COMMAND_REGISTRY];
}

export function getPlayerQuickLook(player: string): PlayerQuickLook | null {
  const found = findPlayer(player);
  if (!found) return null;
  return generatePlayerQuickLook(found, new Date().toDateString());
}
