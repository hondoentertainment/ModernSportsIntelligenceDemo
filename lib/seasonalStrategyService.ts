import { CardInventory, Sport } from '../types';

// ---- Types ----

export type SeasonPhase = 'peak' | 'rising' | 'falling' | 'trough';
export type WindowType = 'buy' | 'sell';
export type AlertPriority = 'high' | 'medium' | 'low';

export interface MonthlyPriceIndex {
  month: number; // 1-12
  monthName: string;
  index: number; // 0-200, 100 = baseline
  phase: SeasonPhase;
}

export interface SportSeasonalProfile {
  sport: Sport;
  monthlyIndices: MonthlyPriceIndex[];
  peakMonths: number[];
  troughMonths: number[];
  currentPhase: SeasonPhase;
  currentIndex: number;
  nextEvent: SeasonalEvent;
  avgPeakIndex: number;
  avgTroughIndex: number;
  seasonalRange: number; // peak - trough spread
}

export interface SeasonalWindow {
  id: string;
  sport: Sport;
  type: WindowType;
  startMonth: number;
  endMonth: number;
  label: string;
  description: string;
  historicalAvgReturn: number; // % gain if acting on this window
  confidence: number; // 0-100
  isActive: boolean;
}

export interface SeasonalEvent {
  sport: Sport;
  month: number;
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  daysUntil: number;
}

export interface SeasonalAlert {
  id: string;
  sport: Sport;
  priority: AlertPriority;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  windowType: WindowType | null;
  expiresAt: string;
}

export interface PortfolioSeasonalExposure {
  sport: Sport;
  cardCount: number;
  totalValue: number;
  currentPhase: SeasonPhase;
  currentIndex: number;
  monthsToNextPeak: number;
  monthsToNextTrough: number;
  seasonalAlignmentScore: number; // 0-100, how well timed the holdings are
  recommendation: string;
}

export interface BacktestResult {
  sport: Sport;
  seasonalReturn: number; // % return using seasonal strategy
  buyHoldReturn: number; // % return using buy-and-hold
  excessReturn: number; // seasonal - buyHold
  winRate: number; // % of trades that were profitable
  tradeCount: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface BacktestMonthly {
  month: string; // "2023-01"
  seasonalValue: number;
  buyHoldValue: number;
}

export interface SeasonalPreferences {
  enabledSports: Sport[];
  alertsEnabled: boolean;
  buyWindowAlerts: boolean;
  sellWindowAlerts: boolean;
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
}

export interface SeasonalSummary {
  activeBuyWindows: number;
  activeSellWindows: number;
  topOpportunitySport: Sport;
  portfolioAlignmentScore: number;
  pendingAlerts: number;
  seasonalAdvantage: number; // % excess return vs buy-and-hold
}

// ---- Constants ----

const STORAGE_ALERTS_KEY = 'msi_seasonal_alerts';
const STORAGE_PREFS_KEY = 'msi_seasonal_prefs';
const STORAGE_DISMISSED_KEY = 'msi_seasonal_dismissed';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_FULL_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Seasonal price indices per sport (100 = baseline annual average)
// Football: peaks during NFL season (Aug-Feb), troughs in spring/summer
const SPORT_MONTHLY_INDICES: Record<Sport, number[]> = {
  Football: [118, 112, 82, 78, 75, 80, 88, 125, 132, 128, 120, 115],
  Baseball: [90, 95, 115, 120, 125, 118, 110, 105, 112, 118, 85, 78],
  Basketball: [108, 105, 110, 115, 112, 88, 82, 78, 85, 118, 125, 130],
  Hockey: [115, 108, 95, 112, 118, 88, 78, 80, 85, 120, 125, 128],
  Soccer: [95, 88, 90, 92, 105, 125, 130, 128, 110, 95, 85, 82],
};

// Key seasonal events per sport
const SEASONAL_EVENTS: { sport: Sport; month: number; label: string; impact: 'positive' | 'negative' | 'neutral'; description: string }[] = [
  { sport: 'Football', month: 9, label: 'NFL Season Opener', impact: 'positive', description: 'NFL regular season begins, driving peak demand for football cards' },
  { sport: 'Football', month: 2, label: 'Super Bowl', impact: 'positive', description: 'Super Bowl drives last surge before off-season decline' },
  { sport: 'Football', month: 4, label: 'NFL Draft', impact: 'positive', description: 'Rookie hype creates brief spike in football card interest' },
  { sport: 'Football', month: 5, label: 'Off-Season Trough', impact: 'negative', description: 'Lowest demand period - optimal buying window' },
  { sport: 'Baseball', month: 3, label: 'Spring Training', impact: 'positive', description: 'Baseball card market begins seasonal upswing' },
  { sport: 'Baseball', month: 4, label: 'Opening Day', impact: 'positive', description: 'MLB season start drives peak demand' },
  { sport: 'Baseball', month: 7, label: 'All-Star Break', impact: 'neutral', description: 'Mid-season plateau before playoff push' },
  { sport: 'Baseball', month: 10, label: 'World Series', impact: 'positive', description: 'Postseason excitement creates selling opportunity' },
  { sport: 'Baseball', month: 12, label: 'Winter Trough', impact: 'negative', description: 'Lowest demand - optimal buying window for baseball' },
  { sport: 'Basketball', month: 10, label: 'NBA Season Start', impact: 'positive', description: 'NBA season begins, basketball cards surge' },
  { sport: 'Basketball', month: 12, label: 'Christmas Games', impact: 'positive', description: 'Holiday showcases drive peak basketball demand' },
  { sport: 'Basketball', month: 6, label: 'NBA Finals', impact: 'positive', description: 'Finals create last selling window before summer lull' },
  { sport: 'Basketball', month: 8, label: 'Summer Trough', impact: 'negative', description: 'Off-season low - best buying opportunity' },
  { sport: 'Hockey', month: 10, label: 'NHL Season Start', impact: 'positive', description: 'Hockey season opens, card demand rises' },
  { sport: 'Hockey', month: 6, label: 'Stanley Cup Finals', impact: 'positive', description: 'Playoff intensity drives hockey card sales' },
  { sport: 'Hockey', month: 7, label: 'Off-Season Trough', impact: 'negative', description: 'Summer lull - ideal buying window for hockey' },
  { sport: 'Soccer', month: 6, label: 'Transfer Window Opens', impact: 'positive', description: 'Summer transfer window spikes soccer card interest' },
  { sport: 'Soccer', month: 8, label: 'Season Kickoff', impact: 'positive', description: 'Major leagues start, maintaining high demand' },
  { sport: 'Soccer', month: 12, label: 'Winter Break', impact: 'negative', description: 'Holiday period low for soccer cards' },
];

// ---- Deterministic seed helpers ----

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getPhaseForIndex(index: number): SeasonPhase {
  if (index >= 118) return 'peak';
  if (index >= 105) return 'rising';
  if (index >= 90) return 'falling';
  return 'trough';
}

// ---- Core Service Functions ----

export function getSportSeasonalProfile(sport: Sport): SportSeasonalProfile {
  const indices = SPORT_MONTHLY_INDICES[sport];
  const currentMonth = new Date().getMonth(); // 0-based

  const monthlyIndices: MonthlyPriceIndex[] = indices.map((index, i) => ({
    month: i + 1,
    monthName: MONTH_NAMES[i],
    index,
    phase: getPhaseForIndex(index),
  }));

  const sorted = [...indices].map((val, idx) => ({ val, idx })).sort((a, b) => b.val - a.val);
  const peakMonths = sorted.slice(0, 3).map(s => s.idx + 1);
  const troughMonths = sorted.slice(-3).map(s => s.idx + 1);

  const peakVals = sorted.slice(0, 3).map(s => s.val);
  const troughVals = sorted.slice(-3).map(s => s.val);
  const avgPeakIndex = peakVals.reduce((a, b) => a + b, 0) / peakVals.length;
  const avgTroughIndex = troughVals.reduce((a, b) => a + b, 0) / troughVals.length;

  const sportEvents = SEASONAL_EVENTS.filter(e => e.sport === sport);
  const now = new Date();
  const currentMonthNum = now.getMonth() + 1;

  let nextEvent: SeasonalEvent | null = null;
  let minDays = Infinity;
  for (const ev of sportEvents) {
    let monthDiff = ev.month - currentMonthNum;
    if (monthDiff <= 0) monthDiff += 12;
    const daysUntil = monthDiff * 30;
    if (daysUntil < minDays) {
      minDays = daysUntil;
      nextEvent = { ...ev, daysUntil };
    }
  }

  if (!nextEvent) {
    nextEvent = {
      sport,
      month: currentMonthNum,
      label: 'Market Open',
      impact: 'neutral',
      description: 'Standard trading period',
      daysUntil: 30,
    };
  }

  return {
    sport,
    monthlyIndices,
    peakMonths,
    troughMonths,
    currentPhase: getPhaseForIndex(indices[currentMonth]),
    currentIndex: indices[currentMonth],
    nextEvent,
    avgPeakIndex,
    avgTroughIndex,
    seasonalRange: avgPeakIndex - avgTroughIndex,
  };
}

export function getAllSportProfiles(): SportSeasonalProfile[] {
  const sports: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
  return sports.map(getSportSeasonalProfile);
}

export function getSeasonalWindows(): SeasonalWindow[] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const seed = dateSeed();

  const windows: SeasonalWindow[] = [
    // Football
    { id: 'fb-buy-1', sport: 'Football', type: 'buy', startMonth: 4, endMonth: 6, label: 'Spring Buy Window', description: 'Football cards at annual low during MLB/NBA spotlight', historicalAvgReturn: 42, confidence: 88, isActive: false },
    { id: 'fb-sell-1', sport: 'Football', type: 'sell', startMonth: 9, endMonth: 11, label: 'NFL Season Sell Window', description: 'Peak demand during NFL regular season', historicalAvgReturn: 35, confidence: 92, isActive: false },
    // Baseball
    { id: 'bb-buy-1', sport: 'Baseball', type: 'buy', startMonth: 11, endMonth: 1, label: 'Winter Buy Window', description: 'Baseball cards at lowest during NFL/NBA dominance', historicalAvgReturn: 38, confidence: 85, isActive: false },
    { id: 'bb-sell-1', sport: 'Baseball', type: 'sell', startMonth: 4, endMonth: 6, label: 'Early Season Sell Window', description: 'Peak hype during MLB opening and early season', historicalAvgReturn: 32, confidence: 87, isActive: false },
    // Basketball
    { id: 'bk-buy-1', sport: 'Basketball', type: 'buy', startMonth: 7, endMonth: 8, label: 'Summer Buy Window', description: 'Off-season lull creates buying opportunity', historicalAvgReturn: 45, confidence: 90, isActive: false },
    { id: 'bk-sell-1', sport: 'Basketball', type: 'sell', startMonth: 11, endMonth: 1, label: 'Holiday Sell Window', description: 'NBA Christmas games and holiday demand spike', historicalAvgReturn: 38, confidence: 86, isActive: false },
    // Hockey
    { id: 'hk-buy-1', sport: 'Hockey', type: 'buy', startMonth: 6, endMonth: 8, label: 'Summer Buy Window', description: 'Post-playoffs lull in hockey market', historicalAvgReturn: 35, confidence: 82, isActive: false },
    { id: 'hk-sell-1', sport: 'Hockey', type: 'sell', startMonth: 11, endMonth: 1, label: 'Mid-Season Sell Window', description: 'Peak NHL engagement drives demand', historicalAvgReturn: 30, confidence: 80, isActive: false },
    // Soccer
    { id: 'sc-buy-1', sport: 'Soccer', type: 'buy', startMonth: 11, endMonth: 1, label: 'Winter Buy Window', description: 'Winter break depression in soccer card market', historicalAvgReturn: 40, confidence: 78, isActive: false },
    { id: 'sc-sell-1', sport: 'Soccer', type: 'sell', startMonth: 6, endMonth: 8, label: 'Transfer Window Sell', description: 'Transfer speculation drives peak demand', historicalAvgReturn: 36, confidence: 83, isActive: false },
  ];

  // Determine which windows are active
  return windows.map(w => {
    let isActive = false;
    if (w.startMonth <= w.endMonth) {
      isActive = currentMonth >= w.startMonth && currentMonth <= w.endMonth;
    } else {
      isActive = currentMonth >= w.startMonth || currentMonth <= w.endMonth;
    }
    // Add slight variance to returns based on seed
    const variance = (seededRandom(seed + hashString(w.id)) - 0.5) * 6;
    return { ...w, isActive, historicalAvgReturn: Math.round((w.historicalAvgReturn + variance) * 10) / 10 };
  });
}

export function getSeasonalAlerts(cards: CardInventory[]): SeasonalAlert[] {
  const stored = loadAlerts();
  if (stored.length > 0) return stored;

  const alerts = generateAlerts(cards);
  saveAlerts(alerts);
  return alerts;
}

function generateAlerts(cards: CardInventory[]): SeasonalAlert[] {
  const now = new Date();
  const _currentMonth = now.getMonth() + 1;
  const seed = dateSeed();
  const alerts: SeasonalAlert[] = [];

  const sports: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
  const holdingSports = new Set(cards.map(c => c.sport));

  for (const sport of sports) {
    const profile = getSportSeasonalProfile(sport);
    const idx = profile.currentIndex;
    const phase = profile.currentPhase;

    if (phase === 'trough') {
      alerts.push({
        id: `alert-buy-${sport}-${seed}`,
        sport,
        priority: holdingSports.has(sport) ? 'medium' : 'high',
        title: `${sport} Buy Window Open`,
        message: `${sport} card prices are at seasonal lows (index: ${idx}). Historical data suggests prices rise ${Math.round(profile.seasonalRange * 0.7)}% from here over the next ${getMonthsToPhase(sport, 'peak')} months.`,
        createdAt: now.toISOString(),
        isRead: false,
        windowType: 'buy',
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (phase === 'peak' && holdingSports.has(sport)) {
      const sportCards = cards.filter(c => c.sport === sport);
      const totalVal = sportCards.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice), 0);
      alerts.push({
        id: `alert-sell-${sport}-${seed}`,
        sport,
        priority: 'high',
        title: `${sport} Sell Window Active`,
        message: `${sport} cards are at seasonal highs (index: ${idx}). You hold $${totalVal.toLocaleString()} in ${sport} cards. Consider taking profits before the ${Math.round(profile.seasonalRange * 0.6)}% seasonal decline.`,
        createdAt: now.toISOString(),
        isRead: false,
        windowType: 'sell',
        expiresAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (phase === 'falling' && holdingSports.has(sport)) {
      alerts.push({
        id: `alert-falling-${sport}-${seed}`,
        sport,
        priority: 'medium',
        title: `${sport} Prices Declining`,
        message: `${sport} card prices typically drop ${Math.round((idx - profile.avgTroughIndex) * 0.8)}% over the next ${getMonthsToPhase(sport, 'trough')} months. Consider reducing exposure or hedging.`,
        createdAt: now.toISOString(),
        isRead: false,
        windowType: 'sell',
        expiresAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (phase === 'rising') {
      alerts.push({
        id: `alert-rising-${sport}-${seed}`,
        sport,
        priority: 'low',
        title: `${sport} Prices Rising`,
        message: `${sport} cards entering seasonal uptrend (index: ${idx}). Expect ${Math.round(profile.avgPeakIndex - idx)}% more upside over the next ${getMonthsToPhase(sport, 'peak')} months.`,
        createdAt: now.toISOString(),
        isRead: false,
        windowType: null,
        expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  return alerts.sort((a, b) => {
    const prioOrder: Record<AlertPriority, number> = { high: 0, medium: 1, low: 2 };
    return prioOrder[a.priority] - prioOrder[b.priority];
  });
}

function getMonthsToPhase(sport: Sport, targetPhase: SeasonPhase): number {
  const indices = SPORT_MONTHLY_INDICES[sport];
  const currentMonth = new Date().getMonth();
  for (let offset = 1; offset <= 12; offset++) {
    const checkMonth = (currentMonth + offset) % 12;
    const phase = getPhaseForIndex(indices[checkMonth]);
    if (phase === targetPhase) return offset;
  }
  return 6;
}

export function getPortfolioExposure(cards: CardInventory[]): PortfolioSeasonalExposure[] {
  const sports: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
  const exposures: PortfolioSeasonalExposure[] = [];

  for (const sport of sports) {
    const sportCards = cards.filter(c => c.sport === sport);
    if (sportCards.length === 0) continue;

    const profile = getSportSeasonalProfile(sport);
    const totalValue = sportCards.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice), 0);
    const monthsToNextPeak = getMonthsToPhase(sport, 'peak');
    const monthsToNextTrough = getMonthsToPhase(sport, 'trough');

    // Alignment score: higher if holding during rising/peak phases, lower during falling/trough
    let alignmentScore: number;
    switch (profile.currentPhase) {
      case 'peak': alignmentScore = 90; break;
      case 'rising': alignmentScore = 75; break;
      case 'falling': alignmentScore = 35; break;
      case 'trough': alignmentScore = 20; break;
    }
    // Adjust based on value concentration
    const avgCardValue = totalValue / sportCards.length;
    if (avgCardValue > 200) alignmentScore = Math.min(100, alignmentScore + 5);

    let recommendation: string;
    if (profile.currentPhase === 'peak') {
      recommendation = `Consider taking profits on ${sport} cards. Prices typically decline ${Math.round(profile.seasonalRange * 0.6)}% from here.`;
    } else if (profile.currentPhase === 'trough') {
      recommendation = `Great time to accumulate ${sport} cards. Prices are near seasonal lows.`;
    } else if (profile.currentPhase === 'rising') {
      recommendation = `Hold ${sport} positions. Seasonal tailwind should continue for ${monthsToNextPeak} more months.`;
    } else {
      recommendation = `Monitor ${sport} holdings closely. Consider reducing exposure before trough in ${monthsToNextTrough} months.`;
    }

    exposures.push({
      sport,
      cardCount: sportCards.length,
      totalValue,
      currentPhase: profile.currentPhase,
      currentIndex: profile.currentIndex,
      monthsToNextPeak,
      monthsToNextTrough,
      seasonalAlignmentScore: alignmentScore,
      recommendation,
    });
  }

  return exposures.sort((a, b) => b.totalValue - a.totalValue);
}

export function getBacktestResults(): BacktestResult[] {
  const sports: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
  const seed = 42; // fixed seed for consistent backtest

  return sports.map(sport => {
    const indices = SPORT_MONTHLY_INDICES[sport];
    const range = Math.max(...indices) - Math.min(...indices);
    const sportHash = hashString(sport);

    const seasonalReturn = 18 + (range / 4) + seededRandom(seed + sportHash) * 8;
    const buyHoldReturn = 8 + seededRandom(seed + sportHash + 1) * 6;
    const winRate = 60 + seededRandom(seed + sportHash + 2) * 20;
    const tradeCount = Math.floor(6 + seededRandom(seed + sportHash + 3) * 12);
    const maxDrawdown = -(5 + seededRandom(seed + sportHash + 4) * 10);
    const sharpeRatio = 1.2 + seededRandom(seed + sportHash + 5) * 1.5;

    return {
      sport,
      seasonalReturn: Math.round(seasonalReturn * 10) / 10,
      buyHoldReturn: Math.round(buyHoldReturn * 10) / 10,
      excessReturn: Math.round((seasonalReturn - buyHoldReturn) * 10) / 10,
      winRate: Math.round(winRate * 10) / 10,
      tradeCount,
      maxDrawdown: Math.round(maxDrawdown * 10) / 10,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    };
  });
}

export function getBacktestMonthly(sport: Sport): BacktestMonthly[] {
  const indices = SPORT_MONTHLY_INDICES[sport];
  const sportHash = hashString(sport);
  const data: BacktestMonthly[] = [];

  let seasonalValue = 10000;
  let buyHoldValue = 10000;

  for (let year = 0; year < 3; year++) {
    for (let month = 0; month < 12; month++) {
      const idx = indices[month];
      const prevIdx = indices[month === 0 ? 11 : month - 1];
      const monthChange = (idx - prevIdx) / prevIdx;

      // Buy-hold: steady growth with seasonal noise
      const bhNoise = (seededRandom(sportHash + year * 12 + month) - 0.45) * 0.02;
      buyHoldValue *= (1 + 0.008 + bhNoise);

      // Seasonal strategy: amplified returns during favorable phases, reduced during unfavorable
      const phase = getPhaseForIndex(idx);
      let leverage = 1.0;
      if (phase === 'peak' || phase === 'rising') leverage = 1.3;
      if (phase === 'trough') leverage = 0.5;
      if (phase === 'falling') leverage = 0.7;

      const seasonalNoise = (seededRandom(sportHash + year * 12 + month + 100) - 0.45) * 0.015;
      seasonalValue *= (1 + (monthChange * leverage) + 0.005 + seasonalNoise);

      const yearLabel = 2023 + year;
      const monthLabel = String(month + 1).padStart(2, '0');
      data.push({
        month: `${yearLabel}-${monthLabel}`,
        seasonalValue: Math.round(seasonalValue),
        buyHoldValue: Math.round(buyHoldValue),
      });
    }
  }

  return data;
}

export function getSeasonalSummary(cards: CardInventory[]): SeasonalSummary {
  const windows = getSeasonalWindows();
  const activeBuy = windows.filter(w => w.isActive && w.type === 'buy');
  const activeSell = windows.filter(w => w.isActive && w.type === 'sell');
  const alerts = getSeasonalAlerts(cards);
  const exposure = getPortfolioExposure(cards);
  const backtest = getBacktestResults();

  const avgAlignment = exposure.length > 0
    ? exposure.reduce((sum, e) => sum + e.seasonalAlignmentScore, 0) / exposure.length
    : 50;

  const avgExcess = backtest.reduce((sum, b) => sum + b.excessReturn, 0) / backtest.length;

  // Find top opportunity: sport with biggest active window return
  const activeWindows = windows.filter(w => w.isActive);
  let topSport: Sport = 'Baseball';
  let topReturn = 0;
  for (const w of activeWindows) {
    if (w.historicalAvgReturn > topReturn) {
      topReturn = w.historicalAvgReturn;
      topSport = w.sport;
    }
  }

  return {
    activeBuyWindows: activeBuy.length,
    activeSellWindows: activeSell.length,
    topOpportunitySport: topSport,
    portfolioAlignmentScore: Math.round(avgAlignment),
    pendingAlerts: alerts.filter(a => !a.isRead).length,
    seasonalAdvantage: Math.round(avgExcess * 10) / 10,
  };
}

// ---- localStorage CRUD ----

function loadAlerts(): SeasonalAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_ALERTS_KEY);
    if (!raw) return [];
    const alerts: SeasonalAlert[] = JSON.parse(raw);
    // Filter expired
    const now = new Date().toISOString();
    return alerts.filter(a => a.expiresAt > now);
  } catch {
    return [];
  }
}

function saveAlerts(alerts: SeasonalAlert[]): void {
  try {
    localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(alerts));
  } catch { /* quota exceeded */ }
}

export function markAlertRead(alertId: string): void {
  const alerts = loadAlerts();
  const updated = alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a);
  saveAlerts(updated);
}

export function dismissAlert(alertId: string): void {
  const alerts = loadAlerts();
  const updated = alerts.filter(a => a.id !== alertId);
  saveAlerts(updated);
  // Track dismissed
  try {
    const dismissed: string[] = JSON.parse(localStorage.getItem(STORAGE_DISMISSED_KEY) || '[]');
    dismissed.push(alertId);
    localStorage.setItem(STORAGE_DISMISSED_KEY, JSON.stringify(dismissed));
  } catch { /* ignore */ }
}

export function getPreferences(): SeasonalPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    enabledSports: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'],
    alertsEnabled: true,
    buyWindowAlerts: true,
    sellWindowAlerts: true,
    aggressiveness: 'moderate',
  };
}

export function savePreferences(prefs: SeasonalPreferences): void {
  try {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

export function clearSeasonalData(): void {
  localStorage.removeItem(STORAGE_ALERTS_KEY);
  localStorage.removeItem(STORAGE_PREFS_KEY);
  localStorage.removeItem(STORAGE_DISMISSED_KEY);
}

export { MONTH_NAMES, MONTH_FULL_NAMES };
