// ─────────────────────────────────────────────────────────────
// Decision Fatigue Guardian – Service Layer
// Tracks cognitive load and decision quality throughout
// trading sessions to protect against fatigue-driven errors
// ─────────────────────────────────────────────────────────────

export type DecisionType =
  | 'evaluation'
  | 'selection'
  | 'financial'
  | 'commitment'
  | 'navigation';

export type FatigueLevel =
  | 'fresh'
  | 'engaged'
  | 'fatigued'
  | 'impaired'
  | 'exhausted';

export interface SessionDecision {
  id: string;
  type: DecisionType;
  timestamp: string;
  description: string;
  value: number | null; // monetary if applicable
  qualityScore: number; // 0-100
  decisionNumber: number; // in session
}

export interface FatigueSession {
  id: string;
  startTime: string;
  endTime: string;
  totalDecisions: number;
  avgQualityFirst20: number; // 0-100
  avgQualityLast20: number; // 0-100
  qualityDegradation: number; // percentage
  highValueDecisionsWhileFatigued: number;
  moneyAtRisk: number;
  interventionsTriggered: number;
  fatigueOnset: number; // decision # when quality started dropping
}

export interface DecisionEnergyState {
  currentEnergy: number; // 0-100
  decisionsThisSession: number;
  fatigueLevel: FatigueLevel;
  avgQualityThisSession: number; // 0-100
  lastDecisionQuality: number; // 0-100
  bidDeviationFromTarget: number; // percentage
  sessionDuration: string;
  recommendedAction: string;
  cooldownRemaining: number | null; // seconds
}

export interface FatigueStats {
  totalSessions: number;
  avgDecisionsPerSession: number;
  avgFatigueOnset: number; // decision #
  totalMoneyProtected: number;
  avgQualityDegradation: number; // percentage
  bestSessionTime: string;
  worstSessionTime: string;
  sessionsWithIntervention: number;
}

export interface FatigueForensic {
  sessionId: string;
  decisionTimeline: { decisionNum: number; quality: number; type: DecisionType; fatigueLevel: FatigueLevel }[];
  qualityTrendline: number[];
  interventionPoints: number[];
  keyInsight: string;
}

// ── Mock Fatigue Sessions (6 sessions) ───────────────────────

const MOCK_FATIGUE_SESSIONS: FatigueSession[] = [
  {
    id: 'fs-001',
    startTime: '2026-03-16T09:00:00Z',
    endTime: '2026-03-16T12:45:00Z',
    totalDecisions: 68,
    avgQualityFirst20: 87,
    avgQualityLast20: 52,
    qualityDegradation: 40.2,
    highValueDecisionsWhileFatigued: 4,
    moneyAtRisk: 8200,
    interventionsTriggered: 3,
    fatigueOnset: 42,
  },
  {
    id: 'fs-002',
    startTime: '2026-03-15T10:00:00Z',
    endTime: '2026-03-15T11:30:00Z',
    totalDecisions: 24,
    avgQualityFirst20: 91,
    avgQualityLast20: 84,
    qualityDegradation: 7.7,
    highValueDecisionsWhileFatigued: 0,
    moneyAtRisk: 0,
    interventionsTriggered: 0,
    fatigueOnset: 22,
  },
  {
    id: 'fs-003',
    startTime: '2026-03-14T14:00:00Z',
    endTime: '2026-03-14T18:20:00Z',
    totalDecisions: 92,
    avgQualityFirst20: 82,
    avgQualityLast20: 38,
    qualityDegradation: 53.7,
    highValueDecisionsWhileFatigued: 7,
    moneyAtRisk: 14500,
    interventionsTriggered: 5,
    fatigueOnset: 35,
  },
  {
    id: 'fs-004',
    startTime: '2026-03-13T09:30:00Z',
    endTime: '2026-03-13T10:45:00Z',
    totalDecisions: 18,
    avgQualityFirst20: 94,
    avgQualityLast20: 90,
    qualityDegradation: 4.3,
    highValueDecisionsWhileFatigued: 0,
    moneyAtRisk: 0,
    interventionsTriggered: 0,
    fatigueOnset: 18,
  },
  {
    id: 'fs-005',
    startTime: '2026-03-12T20:00:00Z',
    endTime: '2026-03-12T23:55:00Z',
    totalDecisions: 85,
    avgQualityFirst20: 78,
    avgQualityLast20: 31,
    qualityDegradation: 60.3,
    highValueDecisionsWhileFatigued: 9,
    moneyAtRisk: 22400,
    interventionsTriggered: 6,
    fatigueOnset: 28,
  },
  {
    id: 'fs-006',
    startTime: '2026-03-11T11:00:00Z',
    endTime: '2026-03-11T13:15:00Z',
    totalDecisions: 35,
    avgQualityFirst20: 89,
    avgQualityLast20: 68,
    qualityDegradation: 23.6,
    highValueDecisionsWhileFatigued: 2,
    moneyAtRisk: 3100,
    interventionsTriggered: 1,
    fatigueOnset: 30,
  },
];

// ── Mock Session Decisions (15 decisions) ────────────────────

const MOCK_SESSION_DECISIONS: SessionDecision[] = [
  { id: 'sd-001', type: 'evaluation', timestamp: '2026-03-16T09:02:00Z', description: 'Assessed centering on 2023 Wembanyama Prizm Silver raw card listing', value: null, qualityScore: 92, decisionNumber: 1 },
  { id: 'sd-002', type: 'financial', timestamp: '2026-03-16T09:08:00Z', description: 'Set max bid of $4,100 on Wembanyama Prizm Silver PSA 10', value: 4100, qualityScore: 88, decisionNumber: 2 },
  { id: 'sd-003', type: 'selection', timestamp: '2026-03-16T09:15:00Z', description: 'Chose Prizm Silver over Optic Holo for portfolio balance', value: null, qualityScore: 90, decisionNumber: 3 },
  { id: 'sd-004', type: 'navigation', timestamp: '2026-03-16T09:22:00Z', description: 'Filtered auction results by ending soonest to find time-sensitive deals', value: null, qualityScore: 85, decisionNumber: 5 },
  { id: 'sd-005', type: 'commitment', timestamp: '2026-03-16T09:35:00Z', description: 'Committed to buy-it-now on 2018 Luka Doncic Prizm Base PSA 10 at $8,200', value: 8200, qualityScore: 82, decisionNumber: 8 },
  { id: 'sd-006', type: 'evaluation', timestamp: '2026-03-16T09:50:00Z', description: 'Compared pop reports for PSA 10 vs BGS 9.5 Ja Morant Prizm Silver', value: null, qualityScore: 86, decisionNumber: 12 },
  { id: 'sd-007', type: 'financial', timestamp: '2026-03-16T10:15:00Z', description: 'Set bid at $2,350 on Ja Morant Prizm Silver PSA 10 — slightly above target', value: 2350, qualityScore: 74, decisionNumber: 18 },
  { id: 'sd-008', type: 'selection', timestamp: '2026-03-16T10:40:00Z', description: 'Passed on 2020 Anthony Edwards Prizm Pink Ice — price seemed high', value: null, qualityScore: 71, decisionNumber: 25 },
  { id: 'sd-009', type: 'financial', timestamp: '2026-03-16T11:05:00Z', description: 'Impulse bid $1,900 on Cade Cunningham Optic Holo — exceeded target by 18%', value: 1900, qualityScore: 55, decisionNumber: 34 },
  { id: 'sd-010', type: 'evaluation', timestamp: '2026-03-16T11:20:00Z', description: 'Rushed assessment of Angel Reese Optic listing — missed centering issues', value: null, qualityScore: 42, decisionNumber: 40 },
  { id: 'sd-011', type: 'commitment', timestamp: '2026-03-16T11:35:00Z', description: 'Bought 2024 Caleb Williams Donruss Rated Rookie PSA 9 without checking recent comps', value: 120, qualityScore: 38, decisionNumber: 45 },
  { id: 'sd-012', type: 'financial', timestamp: '2026-03-16T11:55:00Z', description: 'Overbid by 32% on Jayden Daniels Prizm Base PSA 9 in auction frenzy', value: 158, qualityScore: 28, decisionNumber: 52 },
  { id: 'sd-013', type: 'navigation', timestamp: '2026-03-16T12:10:00Z', description: 'Scrolling through listings aimlessly — no clear acquisition target', value: null, qualityScore: 22, decisionNumber: 58 },
  { id: 'sd-014', type: 'evaluation', timestamp: '2026-03-16T12:25:00Z', description: 'Glanced at Brock Purdy Optic listing for 8 seconds before deciding to bid', value: null, qualityScore: 18, decisionNumber: 62 },
  { id: 'sd-015', type: 'financial', timestamp: '2026-03-16T12:40:00Z', description: 'Panic bid $1,450 on CJ Stroud Prizm Silver after seeing "last one" notification', value: 1450, qualityScore: 15, decisionNumber: 67 },
];

// ── Mock Fatigue Forensics (3 forensics) ─────────────────────

const MOCK_FATIGUE_FORENSICS: FatigueForensic[] = [
  {
    sessionId: 'fs-001',
    decisionTimeline: [
      { decisionNum: 1, quality: 92, type: 'evaluation', fatigueLevel: 'fresh' },
      { decisionNum: 5, quality: 88, type: 'navigation', fatigueLevel: 'fresh' },
      { decisionNum: 10, quality: 86, type: 'financial', fatigueLevel: 'fresh' },
      { decisionNum: 15, quality: 84, type: 'selection', fatigueLevel: 'engaged' },
      { decisionNum: 20, quality: 82, type: 'commitment', fatigueLevel: 'engaged' },
      { decisionNum: 25, quality: 78, type: 'evaluation', fatigueLevel: 'engaged' },
      { decisionNum: 30, quality: 72, type: 'financial', fatigueLevel: 'engaged' },
      { decisionNum: 35, quality: 65, type: 'selection', fatigueLevel: 'fatigued' },
      { decisionNum: 40, quality: 55, type: 'evaluation', fatigueLevel: 'fatigued' },
      { decisionNum: 45, quality: 48, type: 'financial', fatigueLevel: 'fatigued' },
      { decisionNum: 50, quality: 42, type: 'commitment', fatigueLevel: 'impaired' },
      { decisionNum: 55, quality: 35, type: 'financial', fatigueLevel: 'impaired' },
      { decisionNum: 60, quality: 28, type: 'navigation', fatigueLevel: 'exhausted' },
      { decisionNum: 65, quality: 22, type: 'evaluation', fatigueLevel: 'exhausted' },
      { decisionNum: 68, quality: 18, type: 'financial', fatigueLevel: 'exhausted' },
    ],
    qualityTrendline: [92, 90, 88, 86, 84, 82, 80, 78, 75, 72, 68, 65, 60, 55, 48, 42, 38, 35, 30, 25, 22, 18],
    interventionPoints: [42, 52, 60],
    keyInsight: 'Quality degradation began at decision #42 and accelerated rapidly after decision #52. Three high-value financial decisions were made during the impaired/exhausted phase, totaling $8,200 in exposure. A 15-minute break at decision #40 could have preserved quality above 65 for the remainder.',
  },
  {
    sessionId: 'fs-003',
    decisionTimeline: [
      { decisionNum: 1, quality: 85, type: 'evaluation', fatigueLevel: 'fresh' },
      { decisionNum: 10, quality: 82, type: 'financial', fatigueLevel: 'fresh' },
      { decisionNum: 20, quality: 78, type: 'selection', fatigueLevel: 'engaged' },
      { decisionNum: 30, quality: 68, type: 'commitment', fatigueLevel: 'engaged' },
      { decisionNum: 35, quality: 58, type: 'financial', fatigueLevel: 'fatigued' },
      { decisionNum: 45, quality: 45, type: 'evaluation', fatigueLevel: 'fatigued' },
      { decisionNum: 55, quality: 38, type: 'financial', fatigueLevel: 'impaired' },
      { decisionNum: 65, quality: 32, type: 'commitment', fatigueLevel: 'impaired' },
      { decisionNum: 75, quality: 25, type: 'navigation', fatigueLevel: 'exhausted' },
      { decisionNum: 85, quality: 18, type: 'financial', fatigueLevel: 'exhausted' },
      { decisionNum: 92, quality: 12, type: 'commitment', fatigueLevel: 'exhausted' },
    ],
    qualityTrendline: [85, 83, 82, 80, 78, 75, 72, 68, 62, 58, 52, 45, 42, 38, 35, 32, 28, 25, 22, 18, 15, 12],
    interventionPoints: [35, 48, 58, 70, 82],
    keyInsight: 'This was the worst session recorded — a late-afternoon marathon that extended nearly 4.5 hours. Fatigue onset was early at decision #35, likely due to the afternoon start time. Seven high-value decisions were made while impaired, with total exposure of $14,500. Session should have been capped at 30 decisions.',
  },
  {
    sessionId: 'fs-005',
    decisionTimeline: [
      { decisionNum: 1, quality: 80, type: 'evaluation', fatigueLevel: 'fresh' },
      { decisionNum: 8, quality: 76, type: 'financial', fatigueLevel: 'fresh' },
      { decisionNum: 15, quality: 72, type: 'selection', fatigueLevel: 'engaged' },
      { decisionNum: 22, quality: 65, type: 'commitment', fatigueLevel: 'engaged' },
      { decisionNum: 28, quality: 55, type: 'financial', fatigueLevel: 'fatigued' },
      { decisionNum: 35, quality: 42, type: 'evaluation', fatigueLevel: 'fatigued' },
      { decisionNum: 45, quality: 35, type: 'financial', fatigueLevel: 'impaired' },
      { decisionNum: 55, quality: 28, type: 'commitment', fatigueLevel: 'impaired' },
      { decisionNum: 65, quality: 22, type: 'navigation', fatigueLevel: 'exhausted' },
      { decisionNum: 75, quality: 18, type: 'financial', fatigueLevel: 'exhausted' },
      { decisionNum: 85, quality: 12, type: 'evaluation', fatigueLevel: 'exhausted' },
    ],
    qualityTrendline: [80, 78, 76, 74, 72, 68, 65, 60, 55, 48, 42, 38, 35, 32, 28, 25, 22, 18, 15, 12, 10, 8],
    interventionPoints: [28, 38, 48, 58, 68, 78],
    keyInsight: 'Late-night session (8pm-midnight) started with already-reduced baseline quality of 80. Fatigue onset was the earliest recorded at decision #28, consistent with circadian rhythm research. Nine high-value decisions were made while impaired, and the user overrode 4 of 6 intervention warnings. Total money at risk: $22,400.',
  },
];

// ── Utility Helpers ──────────────────────────────────────────

export function getFatigueColor(level: FatigueLevel): string {
  const colors: Record<FatigueLevel, string> = {
    fresh: 'text-green-400',
    engaged: 'text-blue-400',
    fatigued: 'text-amber-400',
    impaired: 'text-orange-400',
    exhausted: 'text-red-400',
  };
  return colors[level];
}

export function getFatigueLabel(level: FatigueLevel): string {
  const labels: Record<FatigueLevel, string> = {
    fresh: 'Fresh & Sharp',
    engaged: 'Engaged & Focused',
    fatigued: 'Fatigue Setting In',
    impaired: 'Cognitively Impaired',
    exhausted: 'Exhausted — Stop Trading',
  };
  return labels[level];
}

export function getDecisionTypeLabel(type: DecisionType): string {
  const labels: Record<DecisionType, string> = {
    evaluation: 'Card Evaluation',
    selection: 'Selection / Comparison',
    financial: 'Financial Decision',
    commitment: 'Purchase Commitment',
    navigation: 'Navigation / Search',
  };
  return labels[type];
}

function classifyFatigueLevel(energy: number): FatigueLevel {
  if (energy >= 80) return 'fresh';
  if (energy >= 60) return 'engaged';
  if (energy >= 40) return 'fatigued';
  if (energy >= 20) return 'impaired';
  return 'exhausted';
}

// ── Public API Functions ─────────────────────────────────────

export function getFatigueSessions(): FatigueSession[] {
  return MOCK_FATIGUE_SESSIONS;
}

export function getSessionDecisions(): SessionDecision[] {
  return MOCK_SESSION_DECISIONS;
}

export function getCurrentEnergyState(): DecisionEnergyState {
  // Simulate a "live" energy state with slight randomization
  const baseEnergy = 62 + Math.floor(Math.random() * 16 - 8);
  const clampedEnergy = Math.max(0, Math.min(100, baseEnergy));
  const level = classifyFatigueLevel(clampedEnergy);
  const decisions = 28 + Math.floor(Math.random() * 10 - 5);
  const avgQuality = clampedEnergy + Math.floor(Math.random() * 10 - 5);
  const lastQuality = clampedEnergy - 5 + Math.floor(Math.random() * 10);
  const bidDeviation = clampedEnergy < 50 ? 12 + Math.floor(Math.random() * 20) : 2 + Math.floor(Math.random() * 8);

  const recommendations: Record<FatigueLevel, string> = {
    fresh: 'Optimal trading conditions. Decision quality is high — proceed with confidence.',
    engaged: 'Still performing well. Consider setting a decision limit to preserve quality.',
    fatigued: 'Fatigue detected. Avoid high-value decisions. Take a 10-minute break.',
    impaired: 'Decision quality is significantly degraded. Stop trading and rest for 30 minutes.',
    exhausted: 'Critical fatigue. All trading activity should cease immediately. Resume tomorrow.',
  };

  return {
    currentEnergy: clampedEnergy,
    decisionsThisSession: decisions,
    fatigueLevel: level,
    avgQualityThisSession: Math.max(0, Math.min(100, avgQuality)),
    lastDecisionQuality: Math.max(0, Math.min(100, lastQuality)),
    bidDeviationFromTarget: Math.max(0, bidDeviation),
    sessionDuration: '2h 15m',
    recommendedAction: recommendations[level],
    cooldownRemaining: level === 'impaired' || level === 'exhausted' ? 600 + Math.floor(Math.random() * 600) : null,
  };
}

export function getFatigueStats(): FatigueStats {
  const sessions = MOCK_FATIGUE_SESSIONS;

  const avgDecisions = sessions.reduce((sum, s) => sum + s.totalDecisions, 0) / sessions.length;
  const avgOnset = sessions.reduce((sum, s) => sum + s.fatigueOnset, 0) / sessions.length;
  const totalProtected = sessions.reduce((sum, s) => sum + s.moneyAtRisk, 0);
  const avgDegradation = sessions.reduce((sum, s) => sum + s.qualityDegradation, 0) / sessions.length;
  const withIntervention = sessions.filter(s => s.interventionsTriggered > 0).length;

  return {
    totalSessions: sessions.length,
    avgDecisionsPerSession: Math.round(avgDecisions),
    avgFatigueOnset: Math.round(avgOnset),
    totalMoneyProtected: totalProtected,
    avgQualityDegradation: Math.round(avgDegradation * 10) / 10,
    bestSessionTime: '9:30 AM — 10:45 AM',
    worstSessionTime: '8:00 PM — 11:55 PM',
    sessionsWithIntervention: withIntervention,
  };
}

export function getFatigueForensics(): FatigueForensic[] {
  return MOCK_FATIGUE_FORENSICS;
}
