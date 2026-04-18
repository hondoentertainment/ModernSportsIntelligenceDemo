// ─────────────────────────────────────────────────────────────────────────────
// Momentum Half-Life Calculator Service
// Models the decay of price momentum from catalytic events in the sports card market
// ─────────────────────────────────────────────────────────────────────────────

export interface MomentumEvent {
  id: string;
  eventName: string;
  eventDate: string;
  category: string;
  initialImpact: number;
  currentResidual: number;
  halfLife: number;
  decayConstant: number;
  status: 'active' | 'decayed' | 'permanent';
  affectedCards: number;
}

export interface HalfLifeResult {
  id: string;
  eventType: string;
  avgHalfLife: number;
  medianHalfLife: number;
  minHalfLife: number;
  maxHalfLife: number;
  sampleSize: number;
  reliability: number;
  category: string;
}

export interface DecayProfile {
  id: string;
  profileName: string;
  decayShape: 'fast-exponential' | 'slow-exponential' | 'linear' | 'step-function' | 'permanent';
  avgInitialImpact: number;
  avgHalfLife: number;
  typicalEvents: string[];
  tradingImplication: string;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface TimingSignal {
  id: string;
  eventId: string;
  eventName: string;
  signalType: 'entry' | 'exit' | 'avoid';
  triggerCondition: string;
  expectedReturn: number;
  timeHorizon: string;
  confidence: number;
  status: 'active' | 'expired' | 'pending';
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const momentumEvents: MomentumEvent[] = [
  {
    id: 'ME-001', eventName: 'Wembanyama MVP Announcement', eventDate: '2026-03-28',
    category: 'Award', initialImpact: 42.5, currentResidual: 31.8, halfLife: 38,
    decayConstant: 0.0182, status: 'active', affectedCards: 147,
  },
  {
    id: 'ME-002', eventName: 'Chet Holmgren Trade to Lakers', eventDate: '2026-02-15',
    category: 'Trade Deadline', initialImpact: 28.3, currentResidual: 6.2, halfLife: 18,
    decayConstant: 0.0385, status: 'active', affectedCards: 63,
  },
  {
    id: 'ME-003', eventName: 'Jalen Brunson ACL Injury Return', eventDate: '2026-03-10',
    category: 'Injury Return', initialImpact: 35.1, currentResidual: 22.4, halfLife: 26,
    decayConstant: 0.0267, status: 'active', affectedCards: 89,
  },
  {
    id: 'ME-004', eventName: 'Skenes No-Hitter vs Dodgers', eventDate: '2026-04-05',
    category: 'Performance Milestone', initialImpact: 55.8, currentResidual: 48.2, halfLife: 31,
    decayConstant: 0.0224, status: 'active', affectedCards: 112,
  },
  {
    id: 'ME-005', eventName: 'Cooper Flagg #1 Draft Call-Up', eventDate: '2026-01-20',
    category: 'Prospect Call-Up', initialImpact: 67.2, currentResidual: 11.3, halfLife: 22,
    decayConstant: 0.0315, status: 'decayed', affectedCards: 204,
  },
  {
    id: 'ME-006', eventName: 'Luka Doncic Viral Dunk Compilation', eventDate: '2026-04-10',
    category: 'Viral Social Media', initialImpact: 18.4, currentResidual: 14.9, halfLife: 8,
    decayConstant: 0.0866, status: 'active', affectedCards: 38,
  },
  {
    id: 'ME-007', eventName: 'PSA Pop Report Crash for 86 Fleer Jordan', eventDate: '2026-03-01',
    category: 'Grading Pop Report', initialImpact: -12.5, currentResidual: -9.8, halfLife: 45,
    decayConstant: 0.0154, status: 'active', affectedCards: 15,
  },
  {
    id: 'ME-008', eventName: 'Topps 2026 Series 1 Release Day', eventDate: '2026-02-05',
    category: 'Product Release', initialImpact: 22.7, currentResidual: 3.1, halfLife: 14,
    decayConstant: 0.0495, status: 'decayed', affectedCards: 320,
  },
  {
    id: 'ME-009', eventName: 'Connor Bedard Hart Trophy Finalist', eventDate: '2026-04-12',
    category: 'Award', initialImpact: 31.4, currentResidual: 28.9, halfLife: 35,
    decayConstant: 0.0198, status: 'active', affectedCards: 95,
  },
  {
    id: 'ME-010', eventName: 'Ohtani 50/50 Card BGS Black Label', eventDate: '2025-11-15',
    category: 'Grading Pop Report', initialImpact: 88.0, currentResidual: 72.6, halfLife: 120,
    decayConstant: 0.00578, status: 'permanent', affectedCards: 4,
  },
  {
    id: 'ME-011', eventName: 'Panini Bankruptcy Filing News', eventDate: '2026-01-08',
    category: 'Industry News', initialImpact: -19.3, currentResidual: -5.4, halfLife: 25,
    decayConstant: 0.0277, status: 'decayed', affectedCards: 510,
  },
  {
    id: 'ME-012', eventName: 'Anthony Edwards Playoff Triple-Double', eventDate: '2026-04-16',
    category: 'Performance Milestone', initialImpact: 24.6, currentResidual: 23.8, halfLife: 28,
    decayConstant: 0.0248, status: 'active', affectedCards: 78,
  },
];

const halfLifeResults: HalfLifeResult[] = [
  { id: 'HL-001', eventType: 'Award', avgHalfLife: 36.5, medianHalfLife: 35, minHalfLife: 22, maxHalfLife: 60, sampleSize: 48, reliability: 0.89, category: 'Recognition' },
  { id: 'HL-002', eventType: 'Trade Deadline', avgHalfLife: 16.8, medianHalfLife: 15, minHalfLife: 7, maxHalfLife: 32, sampleSize: 73, reliability: 0.92, category: 'Roster Move' },
  { id: 'HL-003', eventType: 'Injury Return', avgHalfLife: 24.2, medianHalfLife: 22, minHalfLife: 12, maxHalfLife: 45, sampleSize: 56, reliability: 0.85, category: 'Health' },
  { id: 'HL-004', eventType: 'Performance Milestone', avgHalfLife: 29.5, medianHalfLife: 28, minHalfLife: 14, maxHalfLife: 55, sampleSize: 91, reliability: 0.94, category: 'On-Field' },
  { id: 'HL-005', eventType: 'Prospect Call-Up', avgHalfLife: 21.3, medianHalfLife: 20, minHalfLife: 10, maxHalfLife: 40, sampleSize: 64, reliability: 0.88, category: 'Roster Move' },
  { id: 'HL-006', eventType: 'Viral Social Media', avgHalfLife: 7.4, medianHalfLife: 6, minHalfLife: 2, maxHalfLife: 18, sampleSize: 112, reliability: 0.78, category: 'Sentiment' },
  { id: 'HL-007', eventType: 'Grading Pop Report', avgHalfLife: 58.2, medianHalfLife: 52, minHalfLife: 30, maxHalfLife: 120, sampleSize: 35, reliability: 0.82, category: 'Supply' },
  { id: 'HL-008', eventType: 'Product Release', avgHalfLife: 13.6, medianHalfLife: 12, minHalfLife: 5, maxHalfLife: 28, sampleSize: 84, reliability: 0.91, category: 'Supply' },
];

const decayProfiles: DecayProfile[] = [
  {
    id: 'DP-001', profileName: 'Flash Crash', decayShape: 'fast-exponential',
    avgInitialImpact: 19.2, avgHalfLife: 7,
    typicalEvents: ['Viral social media moments', 'Hot take shows', 'Rumor-driven spikes'],
    tradingImplication: 'Sell into the spike within 48 hours; fades rapidly after first weekend',
    riskLevel: 'high',
  },
  {
    id: 'DP-002', profileName: 'Steady Fade', decayShape: 'slow-exponential',
    avgInitialImpact: 32.5, avgHalfLife: 30,
    typicalEvents: ['Award announcements', 'Playoff runs', 'Injury returns'],
    tradingImplication: 'Gradual exit over 3-6 weeks; watch for secondary catalysts that reset decay',
    riskLevel: 'medium',
  },
  {
    id: 'DP-003', profileName: 'New Floor', decayShape: 'step-function',
    avgInitialImpact: 45.8, avgHalfLife: 90,
    typicalEvents: ['Hall of Fame induction', 'Record-breaking seasons', 'Iconic plays'],
    tradingImplication: 'Price resets to permanent new level; accumulate on any dip below step',
    riskLevel: 'low',
  },
  {
    id: 'DP-004', profileName: 'Hype Cycle', decayShape: 'linear',
    avgInitialImpact: 55.3, avgHalfLife: 20,
    typicalEvents: ['Prospect call-ups', 'Draft picks', 'Product releases'],
    tradingImplication: 'Linear grind lower; exit before the linear trend crosses break-even',
    riskLevel: 'high',
  },
  {
    id: 'DP-005', profileName: 'Legacy Lock', decayShape: 'permanent',
    avgInitialImpact: 78.4, avgHalfLife: 365,
    typicalEvents: ['Retirement announcements', 'Championship wins', 'BGS Black Label pop 1'],
    tradingImplication: 'Hold indefinitely; these events create permanent valuation shifts',
    riskLevel: 'low',
  },
];

const timingSignals: TimingSignal[] = [
  { id: 'TS-001', eventId: 'ME-004', eventName: 'Skenes No-Hitter vs Dodgers', signalType: 'entry', triggerCondition: 'Residual above 40% with half-life > 25 days', expectedReturn: 12.4, timeHorizon: '2-4 weeks', confidence: 84, status: 'active' },
  { id: 'TS-002', eventId: 'ME-002', eventName: 'Chet Holmgren Trade to Lakers', signalType: 'exit', triggerCondition: 'Residual below 25% of initial impact', expectedReturn: -3.2, timeHorizon: '1 week', confidence: 91, status: 'active' },
  { id: 'TS-003', eventId: 'ME-006', eventName: 'Luka Doncic Viral Dunk Compilation', signalType: 'avoid', triggerCondition: 'Social media spike with half-life under 10 days', expectedReturn: -8.5, timeHorizon: '3-5 days', confidence: 76, status: 'active' },
  { id: 'TS-004', eventId: 'ME-001', eventName: 'Wembanyama MVP Announcement', signalType: 'entry', triggerCondition: 'Award event with residual > 70% and large card pool', expectedReturn: 18.7, timeHorizon: '4-8 weeks', confidence: 88, status: 'active' },
  { id: 'TS-005', eventId: 'ME-010', eventName: 'Ohtani 50/50 Card BGS Black Label', signalType: 'entry', triggerCondition: 'Permanent decay profile with pop 1 scarcity', expectedReturn: 35.2, timeHorizon: '6-12 months', confidence: 92, status: 'active' },
  { id: 'TS-006', eventId: 'ME-005', eventName: 'Cooper Flagg #1 Draft Call-Up', signalType: 'exit', triggerCondition: 'Prospect hype decayed below 20% threshold', expectedReturn: -5.8, timeHorizon: 'Immediate', confidence: 87, status: 'expired' },
  { id: 'TS-007', eventId: 'ME-009', eventName: 'Connor Bedard Hart Trophy Finalist', signalType: 'entry', triggerCondition: 'Award finalist with early-career trajectory upside', expectedReturn: 14.1, timeHorizon: '3-6 weeks', confidence: 79, status: 'active' },
  { id: 'TS-008', eventId: 'ME-011', eventName: 'Panini Bankruptcy Filing News', signalType: 'avoid', triggerCondition: 'Negative industry event with broad card-pool impact', expectedReturn: -11.3, timeHorizon: '2-4 weeks', confidence: 83, status: 'expired' },
  { id: 'TS-009', eventId: 'ME-012', eventName: 'Anthony Edwards Playoff Triple-Double', signalType: 'entry', triggerCondition: 'Fresh performance milestone with residual > 90%', expectedReturn: 9.6, timeHorizon: '2-3 weeks', confidence: 74, status: 'pending' },
  { id: 'TS-010', eventId: 'ME-008', eventName: 'Topps 2026 Series 1 Release Day', signalType: 'exit', triggerCondition: 'Product release hype fully decayed below 15%', expectedReturn: -2.1, timeHorizon: 'Immediate', confidence: 95, status: 'expired' },
];

// ── Getter Functions ─────────────────────────────────────────────────────────

export function getMomentumEvents(): MomentumEvent[] {
  return momentumEvents;
}

export function getHalfLifeResults(): HalfLifeResult[] {
  return halfLifeResults;
}

export function getDecayProfiles(): DecayProfile[] {
  return decayProfiles;
}

export function getTimingSignals(): TimingSignal[] {
  return timingSignals;
}

export function getMomentumSummary(): {
  activeEvents: number;
  avgHalfLife: number;
  activeSignals: number;
  bestSignalReturn: number;
} {
  const activeEvents = momentumEvents.filter(e => e.status === 'active').length;
  const avgHalfLife = Math.round(
    momentumEvents.reduce((sum, e) => sum + e.halfLife, 0) / momentumEvents.length * 10
  ) / 10;
  const activeSignals = timingSignals.filter(s => s.status === 'active').length;
  const bestSignalReturn = Math.max(...timingSignals.map(s => s.expectedReturn));

  return { activeEvents, avgHalfLife, activeSignals, bestSignalReturn };
}
