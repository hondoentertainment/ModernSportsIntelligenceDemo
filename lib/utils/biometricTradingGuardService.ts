// @ts-nocheck
// ─────────────────────────────────────────────────────────────
// Biometric Sentiment Trading Guard – Service Layer
// Wearable-powered emotional trading protection with AI coaching
// ─────────────────────────────────────────────────────────────

export type WearableSource = 'apple-watch' | 'fitbit' | 'garmin' | 'manual';

export type EmotionalState = 'calm' | 'elevated' | 'anxious' | 'euphoric' | 'panic';

export interface BiometricReading {
  id: string;
  timestamp: string;
  heartRate: number;
  hrv: number;
  stressLevel: number; // 0-100
  skinTemp: number;
  source: WearableSource;
}

export interface TradingSession {
  id: string;
  startTime: string;
  endTime: string;
  avgHeartRate: number;
  avgStress: number;
  tradesAttempted: number;
  tradesBlocked: number;
  cooldownsTriggered: number;
  emotionalState: EmotionalState;
}

export interface CooldownEvent {
  id: string;
  sessionId: string;
  triggeredAt: string;
  reason: string;
  heartRateAtTrigger: number;
  stressAtTrigger: number;
  tradeBlocked: {
    action: 'buy' | 'sell';
    cardName: string;
    value: number;
  };
  cooldownDuration: number; // minutes
  userOverride: boolean;
  outcomeIfExecuted: number; // positive = would have gained, negative = would have lost
}

export interface GuardConfig {
  heartRateThreshold: number;
  stressThreshold: number;
  cooldownMinutes: number;
  enableAutoBlock: boolean;
  enableCoaching: boolean;
  wearableConnected: boolean;
  wearableType: string;
}

export interface BiometricStats {
  totalSessions: number;
  tradesBlocked: number;
  moneyProtected: number;
  avgSessionStress: number;
  calmestSession: string;
  mostVolatileSession: string;
  coachingMessages: number;
}

// ── Coaching Messages ──────────────────────────────────────

const COACHING_MESSAGES: { trigger: EmotionalState; message: string }[] = [
  { trigger: 'elevated', message: 'Your heart rate is slightly elevated. Consider taking 3 deep breaths before making a decision.' },
  { trigger: 'anxious', message: 'High stress detected. Remember: the best trades are made with clarity, not urgency.' },
  { trigger: 'euphoric', message: 'Euphoria detected — this is when overconfidence leads to the biggest mistakes. Pause and review your thesis.' },
  { trigger: 'panic', message: 'Panic selling rarely works out. Step away for 5 minutes. The market will still be there.' },
  { trigger: 'elevated', message: 'Your biometrics suggest FOMO. Ask yourself: would I make this trade if no one else was watching?' },
  { trigger: 'anxious', message: 'Stress spike detected during rapid trading. Slowing down has historically saved you $2,340.' },
  { trigger: 'panic', message: 'Your HRV has dropped significantly. This is your body telling you to stop. Listen to it.' },
  { trigger: 'euphoric', message: 'You just had a big win — statistically, your next 3 trades after euphoria lose money 68% of the time.' },
];

// ── Mock Biometric Readings (20 readings over a trading day) ──

const MOCK_BIOMETRIC_READINGS: BiometricReading[] = [
  { id: 'br-001', timestamp: '2026-03-16T09:00:00Z', heartRate: 68, hrv: 62, stressLevel: 18, skinTemp: 97.2, source: 'apple-watch' },
  { id: 'br-002', timestamp: '2026-03-16T09:15:00Z', heartRate: 72, hrv: 58, stressLevel: 22, skinTemp: 97.3, source: 'apple-watch' },
  { id: 'br-003', timestamp: '2026-03-16T09:30:00Z', heartRate: 75, hrv: 55, stressLevel: 28, skinTemp: 97.4, source: 'apple-watch' },
  { id: 'br-004', timestamp: '2026-03-16T09:45:00Z', heartRate: 82, hrv: 48, stressLevel: 42, skinTemp: 97.6, source: 'apple-watch' },
  { id: 'br-005', timestamp: '2026-03-16T10:00:00Z', heartRate: 91, hrv: 38, stressLevel: 58, skinTemp: 97.9, source: 'apple-watch' },
  { id: 'br-006', timestamp: '2026-03-16T10:15:00Z', heartRate: 98, hrv: 32, stressLevel: 72, skinTemp: 98.1, source: 'apple-watch' },
  { id: 'br-007', timestamp: '2026-03-16T10:30:00Z', heartRate: 88, hrv: 40, stressLevel: 55, skinTemp: 97.8, source: 'apple-watch' },
  { id: 'br-008', timestamp: '2026-03-16T10:45:00Z', heartRate: 76, hrv: 52, stressLevel: 35, skinTemp: 97.5, source: 'apple-watch' },
  { id: 'br-009', timestamp: '2026-03-16T11:00:00Z', heartRate: 70, hrv: 60, stressLevel: 20, skinTemp: 97.3, source: 'apple-watch' },
  { id: 'br-010', timestamp: '2026-03-16T11:15:00Z', heartRate: 68, hrv: 63, stressLevel: 15, skinTemp: 97.2, source: 'apple-watch' },
  { id: 'br-011', timestamp: '2026-03-16T11:30:00Z', heartRate: 74, hrv: 56, stressLevel: 25, skinTemp: 97.4, source: 'apple-watch' },
  { id: 'br-012', timestamp: '2026-03-16T11:45:00Z', heartRate: 85, hrv: 42, stressLevel: 48, skinTemp: 97.7, source: 'apple-watch' },
  { id: 'br-013', timestamp: '2026-03-16T12:00:00Z', heartRate: 105, hrv: 25, stressLevel: 82, skinTemp: 98.4, source: 'apple-watch' },
  { id: 'br-014', timestamp: '2026-03-16T12:15:00Z', heartRate: 112, hrv: 20, stressLevel: 91, skinTemp: 98.6, source: 'apple-watch' },
  { id: 'br-015', timestamp: '2026-03-16T12:30:00Z', heartRate: 95, hrv: 34, stressLevel: 68, skinTemp: 98.0, source: 'apple-watch' },
  { id: 'br-016', timestamp: '2026-03-16T13:00:00Z', heartRate: 78, hrv: 50, stressLevel: 32, skinTemp: 97.5, source: 'apple-watch' },
  { id: 'br-017', timestamp: '2026-03-16T13:30:00Z', heartRate: 71, hrv: 59, stressLevel: 19, skinTemp: 97.3, source: 'apple-watch' },
  { id: 'br-018', timestamp: '2026-03-16T14:00:00Z', heartRate: 69, hrv: 61, stressLevel: 16, skinTemp: 97.2, source: 'apple-watch' },
  { id: 'br-019', timestamp: '2026-03-16T14:30:00Z', heartRate: 73, hrv: 57, stressLevel: 24, skinTemp: 97.4, source: 'apple-watch' },
  { id: 'br-020', timestamp: '2026-03-16T15:00:00Z', heartRate: 67, hrv: 64, stressLevel: 12, skinTemp: 97.1, source: 'apple-watch' },
];

// ── Mock Trading Sessions (6 sessions) ──

const MOCK_TRADING_SESSIONS: TradingSession[] = [
  {
    id: 'ts-001',
    startTime: '2026-03-16T09:00:00Z',
    endTime: '2026-03-16T10:30:00Z',
    avgHeartRate: 82,
    avgStress: 42,
    tradesAttempted: 8,
    tradesBlocked: 2,
    cooldownsTriggered: 1,
    emotionalState: 'elevated',
  },
  {
    id: 'ts-002',
    startTime: '2026-03-16T10:45:00Z',
    endTime: '2026-03-16T11:15:00Z',
    avgHeartRate: 69,
    avgStress: 17,
    tradesAttempted: 3,
    tradesBlocked: 0,
    cooldownsTriggered: 0,
    emotionalState: 'calm',
  },
  {
    id: 'ts-003',
    startTime: '2026-03-16T11:30:00Z',
    endTime: '2026-03-16T12:30:00Z',
    avgHeartRate: 99,
    avgStress: 72,
    tradesAttempted: 12,
    tradesBlocked: 5,
    cooldownsTriggered: 3,
    emotionalState: 'panic',
  },
  {
    id: 'ts-004',
    startTime: '2026-03-15T09:00:00Z',
    endTime: '2026-03-15T10:00:00Z',
    avgHeartRate: 74,
    avgStress: 28,
    tradesAttempted: 5,
    tradesBlocked: 0,
    cooldownsTriggered: 0,
    emotionalState: 'calm',
  },
  {
    id: 'ts-005',
    startTime: '2026-03-14T13:00:00Z',
    endTime: '2026-03-14T14:30:00Z',
    avgHeartRate: 93,
    avgStress: 65,
    tradesAttempted: 15,
    tradesBlocked: 4,
    cooldownsTriggered: 2,
    emotionalState: 'euphoric',
  },
  {
    id: 'ts-006',
    startTime: '2026-03-13T10:00:00Z',
    endTime: '2026-03-13T11:45:00Z',
    avgHeartRate: 86,
    avgStress: 52,
    tradesAttempted: 9,
    tradesBlocked: 3,
    cooldownsTriggered: 1,
    emotionalState: 'anxious',
  },
];

// ── Mock Cooldown Events (5 events) ──

const MOCK_COOLDOWN_EVENTS: CooldownEvent[] = [
  {
    id: 'cd-001',
    sessionId: 'ts-001',
    triggeredAt: '2026-03-16T10:02:00Z',
    reason: 'Heart rate exceeded 95 bpm during rapid sell attempt. Stress level at 72%.',
    heartRateAtTrigger: 98,
    stressAtTrigger: 72,
    tradeBlocked: { action: 'sell', cardName: '2023 Victor Wembanyama Prizm Silver PSA 10', value: 4200 },
    cooldownDuration: 10,
    userOverride: false,
    outcomeIfExecuted: -680, // Would have lost $680 — card recovered
  },
  {
    id: 'cd-002',
    sessionId: 'ts-003',
    triggeredAt: '2026-03-16T11:48:00Z',
    reason: 'Panic selling detected — 3 sell orders in 90 seconds with heart rate at 105 bpm.',
    heartRateAtTrigger: 105,
    stressAtTrigger: 82,
    tradeBlocked: { action: 'sell', cardName: '2018 Luka Doncic Prizm Base PSA 10', value: 8500 },
    cooldownDuration: 15,
    userOverride: false,
    outcomeIfExecuted: -2100, // Would have lost $2,100 — market rebounded
  },
  {
    id: 'cd-003',
    sessionId: 'ts-003',
    triggeredAt: '2026-03-16T12:05:00Z',
    reason: 'Euphoric buying spree — 4 buy orders after portfolio spike. HRV critically low at 20ms.',
    heartRateAtTrigger: 112,
    stressAtTrigger: 91,
    tradeBlocked: { action: 'buy', cardName: '2024 Angel Reese Optic Holo PSA 10', value: 1800 },
    cooldownDuration: 15,
    userOverride: false,
    outcomeIfExecuted: -420, // Card dropped 23% next day
  },
  {
    id: 'cd-004',
    sessionId: 'ts-005',
    triggeredAt: '2026-03-14T13:22:00Z',
    reason: 'Euphoric state detected after 3 consecutive profitable trades. Auto-block engaged.',
    heartRateAtTrigger: 96,
    stressAtTrigger: 58,
    tradeBlocked: { action: 'buy', cardName: '2022 Paolo Banchero Mosaic Gold /10 BGS 9.5', value: 3200 },
    cooldownDuration: 10,
    userOverride: true, // User overrode and bought anyway
    outcomeIfExecuted: 540, // Actually went up — user was right this time
  },
  {
    id: 'cd-005',
    sessionId: 'ts-006',
    triggeredAt: '2026-03-13T10:35:00Z',
    reason: 'Anxiety-driven sell detected. Skin temperature elevated. HRV declining trend over 20 minutes.',
    heartRateAtTrigger: 92,
    stressAtTrigger: 68,
    tradeBlocked: { action: 'sell', cardName: '2020 Justin Herbert Prizm Silver PSA 10', value: 2400 },
    cooldownDuration: 10,
    userOverride: false,
    outcomeIfExecuted: -890, // Card recovered within hours
  },
];

// ── Default Guard Config ──

let guardConfig: GuardConfig = {
  heartRateThreshold: 95,
  stressThreshold: 70,
  cooldownMinutes: 10,
  enableAutoBlock: true,
  enableCoaching: true,
  wearableConnected: true,
  wearableType: 'Apple Watch Series 10',
};

// ── Utility Helpers ──

function classifyEmotion(heartRate: number, stressLevel: number, hrv: number): EmotionalState {
  if (stressLevel >= 80 || (heartRate >= 105 && hrv <= 25)) return 'panic';
  if (stressLevel >= 60 && heartRate >= 90) return 'anxious';
  if (heartRate >= 90 && stressLevel < 50) return 'euphoric';
  if (heartRate >= 80 || stressLevel >= 40) return 'elevated';
  return 'calm';
}

function computeTradingReadiness(heartRate: number, stressLevel: number, hrv: number): number {
  // 0-100 score, higher = more ready to trade rationally
  let score = 100;
  if (heartRate > 80) score -= (heartRate - 80) * 1.5;
  if (stressLevel > 30) score -= (stressLevel - 30) * 0.8;
  if (hrv < 50) score -= (50 - hrv) * 0.6;
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ── Public API Functions ──

export function getBiometricReadings(sessionId?: string): BiometricReading[] {
  if (!sessionId) return MOCK_BIOMETRIC_READINGS;

  const session = MOCK_TRADING_SESSIONS.find(s => s.id === sessionId);
  if (!session) return [];

  const start = new Date(session.startTime).getTime();
  const end = new Date(session.endTime).getTime();

  return MOCK_BIOMETRIC_READINGS.filter(r => {
    const ts = new Date(r.timestamp).getTime();
    return ts >= start && ts <= end;
  });
}

export function getTradingSessions(): TradingSession[] {
  return MOCK_TRADING_SESSIONS;
}

export function getCooldownEvents(): CooldownEvent[] {
  return MOCK_COOLDOWN_EVENTS;
}

export function getBiometricStats(): BiometricStats {
  const sessions = MOCK_TRADING_SESSIONS;
  const cooldowns = MOCK_COOLDOWN_EVENTS;

  const totalBlocked = sessions.reduce((sum, s) => sum + s.tradesBlocked, 0);
  const moneyProtected = cooldowns
    .filter(c => !c.userOverride && c.outcomeIfExecuted < 0)
    .reduce((sum, c) => sum + Math.abs(c.outcomeIfExecuted), 0);

  const avgStress = sessions.reduce((sum, s) => sum + s.avgStress, 0) / sessions.length;

  const calmest = [...sessions].sort((a, b) => a.avgStress - b.avgStress)[0];
  const volatile = [...sessions].sort((a, b) => b.avgStress - a.avgStress)[0];

  return {
    totalSessions: sessions.length,
    tradesBlocked: totalBlocked,
    moneyProtected,
    avgSessionStress: Math.round(avgStress),
    calmestSession: calmest.id,
    mostVolatileSession: volatile.id,
    coachingMessages: 23,
  };
}

export function getGuardConfig(): GuardConfig {
  return { ...guardConfig };
}

export function updateGuardConfig(config: Partial<GuardConfig>): GuardConfig {
  guardConfig = { ...guardConfig, ...config };
  return { ...guardConfig };
}

export function getCurrentStressLevel(): {
  heartRate: number;
  hrv: number;
  stressLevel: number;
  emotionalState: EmotionalState;
  tradingReadiness: number;
  skinTemp: number;
  coachingMessage: string | null;
} {
  // Simulate "live" reading — use the latest mock reading with slight variance
  const latest = MOCK_BIOMETRIC_READINGS[MOCK_BIOMETRIC_READINGS.length - 1];
  const hr = latest.heartRate + Math.floor(Math.random() * 6 - 3);
  const hrvVal = latest.hrv + Math.floor(Math.random() * 4 - 2);
  const stress = latest.stressLevel + Math.floor(Math.random() * 8 - 4);
  const clampedStress = Math.max(0, Math.min(100, stress));

  const emotion = classifyEmotion(hr, clampedStress, hrvVal);
  const readiness = computeTradingReadiness(hr, clampedStress, hrvVal);

  const coaching = emotion !== 'calm'
    ? COACHING_MESSAGES.find(m => m.trigger === emotion)?.message ?? null
    : null;

  return {
    heartRate: hr,
    hrv: hrvVal,
    stressLevel: clampedStress,
    emotionalState: emotion,
    tradingReadiness: readiness,
    skinTemp: latest.skinTemp,
    coachingMessage: coaching,
  };
}

export function getMoneyProtected(): { total: number; breakdown: { cardName: string; saved: number }[] } {
  const saved = MOCK_COOLDOWN_EVENTS
    .filter(c => !c.userOverride && c.outcomeIfExecuted < 0)
    .map(c => ({
      cardName: c.tradeBlocked.cardName,
      saved: Math.abs(c.outcomeIfExecuted),
    }));

  return {
    total: saved.reduce((sum, s) => sum + s.saved, 0),
    breakdown: saved,
  };
}

export function getCoachingMessages(): typeof COACHING_MESSAGES {
  return COACHING_MESSAGES;
}

export function getEmotionalStateColor(state: EmotionalState): string {
  const colors: Record<EmotionalState, string> = {
    calm: 'text-green-400',
    elevated: 'text-amber-400',
    anxious: 'text-orange-400',
    euphoric: 'text-purple-400',
    panic: 'text-red-400',
  };
  return colors[state];
}

export function getEmotionalStateBg(state: EmotionalState): string {
  const bgs: Record<EmotionalState, string> = {
    calm: 'bg-green-500/20 border-green-500/30',
    elevated: 'bg-amber-500/20 border-amber-500/30',
    anxious: 'bg-orange-500/20 border-orange-500/30',
    euphoric: 'bg-purple-500/20 border-purple-500/30',
    panic: 'bg-red-500/20 border-red-500/30',
  };
  return bgs[state];
}

export function getReadinessLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 70) return { label: 'Ready to Trade', color: 'text-green-400', bg: 'bg-green-500/20' };
  if (score >= 40) return { label: 'Proceed with Caution', color: 'text-amber-400', bg: 'bg-amber-500/20' };
  return { label: 'Trading Not Advised', color: 'text-red-400', bg: 'bg-red-500/20' };
}

export function formatDuration(startTime: string, endTime: string): string {
  const ms = new Date(endTime).getTime() - new Date(startTime).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m`;
}

export function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
