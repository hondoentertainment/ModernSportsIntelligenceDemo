// ─────────────────────────────────────────────────────────────────────────────
// Calendar Effect Quantifier Service
// Measures and quantifies day-of-week, monthly, holiday, and event-driven
// pricing effects across sports card markets for timing optimization
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarEffect {
  id: string;
  effectName: string;
  type: 'day-of-week' | 'monthly' | 'holiday' | 'event';
  avgImpact: number;
  significance: number;
  sampleSize: number;
  direction: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface DayOfWeekEffect {
  day: string;
  avgReturn: number;
  avgVolume: number;
  listingCount: number;
  bestCategory: string;
  volatility: number;
}

export interface MonthlyEffect {
  month: string;
  avgReturn: number;
  winRate: number;
  bestPerformer: string;
  worstPerformer: string;
  volumeIndex: number;
  seasonalStrength: number;
}

export interface HolidayImpact {
  id: string;
  holiday: string;
  date: string;
  preEventDays: number;
  postEventDays: number;
  avgPriceMove: number;
  volumeSpike: number;
  bestStrategy: string;
  historicalWinRate: number;
}

// ── Calendar Effects ────────────────────────────────────────────────────────

const calendarEffects: CalendarEffect[] = [
  { id: 'CE-01', effectName: 'Sunday Auction Close Premium', type: 'day-of-week', avgImpact: 7.8, significance: 0.02, sampleSize: 14520, direction: 'positive', description: 'Auctions ending Sunday evening consistently close 7-8% higher than midweek due to maximum bidder participation.' },
  { id: 'CE-02', effectName: 'January Tax Liquidation Dip', type: 'monthly', avgImpact: -5.3, significance: 0.01, sampleSize: 8940, direction: 'negative', description: 'Sellers liquidate holdings in January for tax purposes, creating a predictable buying opportunity across all segments.' },
  { id: 'CE-03', effectName: 'Super Bowl Champion Spike', type: 'event', avgImpact: 18.5, significance: 0.005, sampleSize: 3200, direction: 'positive', description: 'Cards of Super Bowl winning players see an average 18.5% spike within 48 hours of the game, with QBs gaining the most.' },
  { id: 'CE-04', effectName: 'Friday Listing Discount', type: 'day-of-week', avgImpact: -3.2, significance: 0.04, sampleSize: 11800, direction: 'negative', description: 'Buy-it-now listings posted Friday afternoons are priced 3% below weekly average as sellers rush before the weekend.' },
  { id: 'CE-05', effectName: 'October Multi-Sport Overlap', type: 'monthly', avgImpact: 11.3, significance: 0.008, sampleSize: 6750, direction: 'positive', description: 'Simultaneous NFL, MLB postseason, and NBA/NHL openers in October create the highest composite demand of the year.' },
  { id: 'CE-06', effectName: 'Holiday Gift Demand Surge', type: 'holiday', avgImpact: 8.2, significance: 0.015, sampleSize: 5280, direction: 'positive', description: 'Gift-oriented purchasing drives sealed product and sub-$100 single prices up 8% from Thanksgiving through Christmas.' },
  { id: 'CE-07', effectName: 'All-Star Break Stagnation', type: 'event', avgImpact: -4.1, significance: 0.035, sampleSize: 4100, direction: 'negative', description: 'Mid-summer All-Star breaks across sports create a lull in trading activity and downward price drift.' },
  { id: 'CE-08', effectName: 'Monday Morning Momentum', type: 'day-of-week', avgImpact: 2.4, significance: 0.06, sampleSize: 13200, direction: 'positive', description: 'Monday listings benefit from weekend game performances, driving 2.4% higher sell-through rates on standout players.' },
];

// ── Day-of-Week Effects ─────────────────────────────────────────────────────

const dayOfWeekEffects: DayOfWeekEffect[] = [
  { day: 'Monday', avgReturn: 1.8, avgVolume: 12400, listingCount: 8950, bestCategory: 'Football', volatility: 3.2 },
  { day: 'Tuesday', avgReturn: 0.5, avgVolume: 11200, listingCount: 9100, bestCategory: 'Baseball', volatility: 2.8 },
  { day: 'Wednesday', avgReturn: -0.3, avgVolume: 10800, listingCount: 9400, bestCategory: 'Basketball', volatility: 2.5 },
  { day: 'Thursday', avgReturn: 0.9, avgVolume: 11600, listingCount: 8800, bestCategory: 'Multi-Sport', volatility: 3.0 },
  { day: 'Friday', avgReturn: -1.4, avgVolume: 10200, listingCount: 10200, bestCategory: 'Baseball', volatility: 3.5 },
  { day: 'Saturday', avgReturn: 2.8, avgVolume: 14800, listingCount: 7200, bestCategory: 'Football', volatility: 4.1 },
  { day: 'Sunday', avgReturn: 4.2, avgVolume: 16500, listingCount: 6800, bestCategory: 'Football', volatility: 4.8 },
];

// ── Monthly Effects ─────────────────────────────────────────────────────────

const monthlyEffects: MonthlyEffect[] = [
  { month: 'January', avgReturn: -3.8, winRate: 38, bestPerformer: 'Basketball Rookies', worstPerformer: 'Sealed Product', volumeIndex: 72, seasonalStrength: 25 },
  { month: 'February', avgReturn: 1.2, winRate: 52, bestPerformer: 'Football (Super Bowl)', worstPerformer: 'Baseball Veterans', volumeIndex: 80, seasonalStrength: 45 },
  { month: 'March', avgReturn: 4.5, winRate: 61, bestPerformer: 'Baseball Prospects', worstPerformer: 'Hockey Singles', volumeIndex: 95, seasonalStrength: 65 },
  { month: 'April', avgReturn: 7.8, winRate: 68, bestPerformer: 'MLB Rookies', worstPerformer: 'Football Off-Season', volumeIndex: 110, seasonalStrength: 78 },
  { month: 'May', avgReturn: 5.1, winRate: 63, bestPerformer: 'Bowman Chrome', worstPerformer: 'Basketball Off-Season', volumeIndex: 105, seasonalStrength: 70 },
  { month: 'June', avgReturn: 2.4, winRate: 55, bestPerformer: 'NBA Finals Cards', worstPerformer: 'Football Singles', volumeIndex: 92, seasonalStrength: 55 },
  { month: 'July', avgReturn: -1.8, winRate: 44, bestPerformer: 'Vintage Cards', worstPerformer: 'Modern Singles', volumeIndex: 78, seasonalStrength: 30 },
  { month: 'August', avgReturn: -0.5, winRate: 48, bestPerformer: 'Football Prospects', worstPerformer: 'Basketball Mid-Tier', volumeIndex: 82, seasonalStrength: 40 },
  { month: 'September', avgReturn: 9.2, winRate: 72, bestPerformer: 'NFL Rookies', worstPerformer: 'Baseball Mid-Tier', volumeIndex: 125, seasonalStrength: 85 },
  { month: 'October', avgReturn: 11.5, winRate: 75, bestPerformer: 'Football Prizm', worstPerformer: 'Soccer Cards', volumeIndex: 138, seasonalStrength: 92 },
  { month: 'November', avgReturn: 5.8, winRate: 62, bestPerformer: 'Sealed Hobby Boxes', worstPerformer: 'Baseball Off-Season', volumeIndex: 115, seasonalStrength: 68 },
  { month: 'December', avgReturn: 2.1, winRate: 54, bestPerformer: 'Gift-Tier Retail', worstPerformer: 'High-End Graded', volumeIndex: 98, seasonalStrength: 50 },
];

// ── Holiday Impacts ─────────────────────────────────────────────────────────

const holidayImpacts: HolidayImpact[] = [
  { id: 'HI-01', holiday: 'Super Bowl Sunday', date: '2026-02-08', preEventDays: 14, postEventDays: 5, avgPriceMove: 18.5, volumeSpike: 2.8, bestStrategy: 'Buy champion player cards within 2 hours of game end, sell into Monday morning euphoria', historicalWinRate: 78 },
  { id: 'HI-02', holiday: 'Opening Day (MLB)', date: '2026-04-02', preEventDays: 21, postEventDays: 7, avgPriceMove: 12.3, volumeSpike: 2.2, bestStrategy: 'Accumulate top rookie cards 3 weeks pre-Opening Day, hold through first week of season', historicalWinRate: 72 },
  { id: 'HI-03', holiday: 'NBA Draft Day', date: '2026-06-25', preEventDays: 30, postEventDays: 3, avgPriceMove: 15.8, volumeSpike: 3.1, bestStrategy: 'Buy consensus top-5 pick prospect cards 30 days before draft, sell within 48 hours post-selection', historicalWinRate: 68 },
  { id: 'HI-04', holiday: 'National Sports Card Day', date: '2026-08-08', preEventDays: 7, postEventDays: 7, avgPriceMove: 5.4, volumeSpike: 1.8, bestStrategy: 'Target exclusive promo cards distributed at card shows, flip within 2 weeks', historicalWinRate: 62 },
  { id: 'HI-05', holiday: 'NFL Kickoff', date: '2026-09-10', preEventDays: 14, postEventDays: 3, avgPriceMove: 14.2, volumeSpike: 2.5, bestStrategy: 'Load up on starting QB rookies 2 weeks before kickoff, ride the opening week momentum', historicalWinRate: 75 },
  { id: 'HI-06', holiday: 'World Series', date: '2026-10-24', preEventDays: 7, postEventDays: 5, avgPriceMove: 10.8, volumeSpike: 2.0, bestStrategy: 'Buy key players of pennant winners immediately after clinching, sell during Series', historicalWinRate: 65 },
  { id: 'HI-07', holiday: 'Black Friday', date: '2026-11-27', preEventDays: 3, postEventDays: 4, avgPriceMove: 8.5, volumeSpike: 3.5, bestStrategy: 'Buy sealed product at retail discount, hold until January when gift recipients list duplicates', historicalWinRate: 70 },
  { id: 'HI-08', holiday: 'Christmas', date: '2026-12-25', preEventDays: 21, postEventDays: 10, avgPriceMove: 6.2, volumeSpike: 1.9, bestStrategy: 'Sell into pre-Christmas gift demand, buy back in January correction', historicalWinRate: 66 },
  { id: 'HI-09', holiday: "Father's Day", date: '2026-06-21', preEventDays: 14, postEventDays: 2, avgPriceMove: 4.8, volumeSpike: 1.5, bestStrategy: 'List vintage and nostalgic cards 2 weeks before, targeting gift buyers seeking sentimental purchases', historicalWinRate: 58 },
  { id: 'HI-10', holiday: 'HOF Induction Weekend', date: '2026-07-26', preEventDays: 30, postEventDays: 7, avgPriceMove: 22.4, volumeSpike: 2.6, bestStrategy: 'Accumulate rookie cards of announced inductees immediately after January announcement, sell HOF weekend', historicalWinRate: 82 },
];

// ── Getter Functions ────────────────────────────────────────────────────────

export function getCalendarEffects(): CalendarEffect[] {
  return calendarEffects;
}

export function getDayOfWeekEffects(): DayOfWeekEffect[] {
  return dayOfWeekEffects;
}

export function getMonthlyEffects(): MonthlyEffect[] {
  return monthlyEffects;
}

export function getHolidayImpacts(): HolidayImpact[] {
  return holidayImpacts;
}

export function getCalendarSummary(): {
  strongestEffect: string;
  avgSignificance: number;
  totalEffectsTracked: number;
  nextHolidayEvent: string;
} {
  const sorted = [...calendarEffects].sort((a, b) => Math.abs(b.avgImpact) - Math.abs(a.avgImpact));
  const strongestEffect = sorted[0].effectName;

  const avgSignificance = Math.round(
    (calendarEffects.reduce((sum, e) => sum + e.significance, 0) / calendarEffects.length) * 1000
  ) / 1000;

  const totalEffectsTracked = calendarEffects.length + dayOfWeekEffects.length + monthlyEffects.length + holidayImpacts.length;

  const now = new Date(2026, 3, 18);
  const upcoming = holidayImpacts
    .filter(h => new Date(h.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextHolidayEvent = upcoming.length > 0 ? upcoming[0].holiday : 'None upcoming';

  return { strongestEffect, avgSignificance, totalEffectsTracked, nextHolidayEvent };
}

// ── Aggregate Helpers ───────────────────────────────────────────────────────

export function getPositiveEffects(): CalendarEffect[] {
  return calendarEffects.filter(e => e.direction === 'positive');
}

export function getNegativeEffects(): CalendarEffect[] {
  return calendarEffects.filter(e => e.direction === 'negative');
}

export function getHighSignificanceEffects(): CalendarEffect[] {
  return calendarEffects.filter(e => e.significance <= 0.05);
}

export function getBestTradingDay(): DayOfWeekEffect {
  return [...dayOfWeekEffects].sort((a, b) => b.avgReturn - a.avgReturn)[0];
}

export function getWorstTradingDay(): DayOfWeekEffect {
  return [...dayOfWeekEffects].sort((a, b) => a.avgReturn - b.avgReturn)[0];
}

export function getBestTradingMonth(): MonthlyEffect {
  return [...monthlyEffects].sort((a, b) => b.avgReturn - a.avgReturn)[0];
}

export function getUpcomingHolidays(): HolidayImpact[] {
  const now = new Date(2026, 3, 18);
  return holidayImpacts
    .filter(h => new Date(h.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getHighestWinRateHoliday(): HolidayImpact {
  return [...holidayImpacts].sort((a, b) => b.historicalWinRate - a.historicalWinRate)[0];
}

export function getAvgHolidayPriceMove(): number {
  return Math.round(
    (holidayImpacts.reduce((sum, h) => sum + h.avgPriceMove, 0) / holidayImpacts.length) * 10
  ) / 10;
}
