// ---- Types ----

export type DrawdownSeverity = 'minor' | 'moderate' | 'severe' | 'extreme';

export interface DrawdownEvent {
  id: string;
  name: string;
  peakDate: string;
  troughDate: string;
  recoveryDate: string | null;
  peakValue: number;
  troughValue: number;
  currentValue: number;
  drawdownPercent: number;
  recoveryPercent: number;
  daysToTrough: number;
  daysToRecovery: number | null;
  severity: DrawdownSeverity;
  cause: string;
  isActive: boolean;
}

export interface RecoveryEstimate {
  drawdownId: string;
  scenario: string;
  estimatedDays: number;
  estimatedDate: string;
  probability: number;
  requiredReturnRate: number;
  assumptions: string;
}

export interface DrawdownPath {
  drawdownId: string;
  date: string;
  value: number;
  drawdownFromPeak: number;
  recoveryFromTrough: number;
  dayNumber: number;
}

export interface RecoveryScenario {
  id: string;
  name: string;
  description: string;
  avgRecoveryDays: number;
  medianRecoveryDays: number;
  recoveryRate: number;
  historicalCount: number;
  projectedPath: { day: number; recoveryPercent: number }[];
}

// ---- Mock Data ----

const mockDrawdowns: DrawdownEvent[] = [
  { id: 'dd-1', name: 'Q2 2025 Bear Market', peakDate: '2025-04-01', troughDate: '2025-07-15', recoveryDate: '2025-12-20', peakValue: 48500, troughValue: 35200, currentValue: 52100, drawdownPercent: -27.4, recoveryPercent: 48.0, daysToTrough: 105, daysToRecovery: 158, severity: 'severe', cause: 'Broad market correction driven by grading company delays and overleveraged retail sellers', isActive: false },
  { id: 'dd-2', name: 'Football Offseason Slump 2025', peakDate: '2025-02-10', troughDate: '2025-05-20', recoveryDate: '2025-09-15', peakValue: 12400, troughValue: 9800, currentValue: 13100, drawdownPercent: -21.0, recoveryPercent: 33.7, daysToTrough: 99, daysToRecovery: 118, severity: 'moderate', cause: 'Seasonal demand decline for football cards during baseball season', isActive: false },
  { id: 'dd-3', name: 'Wembanyama Hype Correction', peakDate: '2026-03-20', troughDate: '2026-04-05', recoveryDate: null, peakValue: 14200, troughValue: 11400, currentValue: 12100, drawdownPercent: -19.7, recoveryPercent: 25.0, daysToTrough: 16, daysToRecovery: null, severity: 'moderate', cause: 'Hype-driven overshoot followed by rational repricing after early playoff exit', isActive: true },
  { id: 'dd-4', name: 'Baseball Prospect Flush 2024', peakDate: '2024-07-15', troughDate: '2024-09-30', recoveryDate: '2025-01-10', peakValue: 8900, troughValue: 6200, currentValue: 9400, drawdownPercent: -30.3, recoveryPercent: 51.6, daysToTrough: 77, daysToRecovery: 102, severity: 'severe', cause: 'Mass sell-off of prospect cards after poor minor league performances', isActive: false },
  { id: 'dd-5', name: 'Grading Scandal Shock 2024', peakDate: '2024-05-01', troughDate: '2024-06-15', recoveryDate: '2024-10-01', peakValue: 62000, troughValue: 42800, currentValue: 65800, drawdownPercent: -31.0, recoveryPercent: 53.7, daysToTrough: 45, daysToRecovery: 108, severity: 'extreme', cause: 'Major grading company credibility crisis shook market confidence', isActive: false },
  { id: 'dd-6', name: 'Modern Card Rotation Q3 2024', peakDate: '2024-08-10', troughDate: '2024-09-25', recoveryDate: '2024-11-30', peakValue: 22400, troughValue: 18500, currentValue: 24200, drawdownPercent: -17.4, recoveryPercent: 30.8, daysToTrough: 46, daysToRecovery: 66, severity: 'moderate', cause: 'Capital rotation from modern to vintage during market uncertainty', isActive: false },
  { id: 'dd-7', name: 'Rodriguez Injury Dip', peakDate: '2025-09-01', troughDate: '2025-10-15', recoveryDate: null, peakValue: 520, troughValue: 320, currentValue: 340, drawdownPercent: -38.5, recoveryPercent: 6.3, daysToTrough: 44, daysToRecovery: null, severity: 'severe', cause: 'Julio Rodriguez wrist fracture triggered sell-off in young star baseball cards', isActive: true },
  { id: 'dd-8', name: 'Crypto Correlation Crash 2024', peakDate: '2024-03-15', troughDate: '2024-04-20', recoveryDate: '2024-06-28', peakValue: 38200, troughValue: 30800, currentValue: 41500, drawdownPercent: -19.4, recoveryPercent: 34.7, daysToTrough: 36, daysToRecovery: 69, severity: 'moderate', cause: 'Correlation between crypto traders and card investors led to synchronized selling', isActive: false },
  { id: 'dd-9', name: 'Herbert Shoulder Slide', peakDate: '2026-01-15', troughDate: '2026-02-28', recoveryDate: null, peakValue: 155, troughValue: 85, currentValue: 92, drawdownPercent: -45.2, recoveryPercent: 10.0, daysToTrough: 44, daysToRecovery: null, severity: 'extreme', cause: 'Season-ending shoulder injury to Justin Herbert devastated Chargers card prices', isActive: true },
  { id: 'dd-10', name: 'Summer Liquidity Drain 2025', peakDate: '2025-06-01', troughDate: '2025-08-15', recoveryDate: '2025-10-20', peakValue: 15800, troughValue: 13200, currentValue: 16500, drawdownPercent: -16.5, recoveryPercent: 25.0, daysToTrough: 75, daysToRecovery: 66, severity: 'minor', cause: 'Seasonal liquidity decline as collectors shifted spending to summer activities', isActive: false },
];

const mockRecoveryEstimates: RecoveryEstimate[] = [
  { drawdownId: 'dd-3', scenario: 'Base Case', estimatedDays: 45, estimatedDate: '2026-05-20', probability: 0.55, requiredReturnRate: 0.52, assumptions: 'Normal market conditions with gradual demand recovery' },
  { drawdownId: 'dd-3', scenario: 'Bull Case', estimatedDays: 25, estimatedDate: '2026-04-30', probability: 0.25, requiredReturnRate: 0.84, assumptions: 'Strong playoff run reignites demand for Wembanyama cards' },
  { drawdownId: 'dd-3', scenario: 'Bear Case', estimatedDays: 90, estimatedDate: '2026-07-04', probability: 0.20, requiredReturnRate: 0.23, assumptions: 'Extended cooling period if team underperforms expectations' },
  { drawdownId: 'dd-7', scenario: 'Base Case', estimatedDays: 120, estimatedDate: '2026-08-15', probability: 0.45, requiredReturnRate: 0.44, assumptions: 'Full recovery timeline following successful rehabilitation' },
  { drawdownId: 'dd-7', scenario: 'Bull Case', estimatedDays: 75, estimatedDate: '2026-06-30', probability: 0.20, requiredReturnRate: 0.71, assumptions: 'Earlier-than-expected return with strong spring training showing' },
  { drawdownId: 'dd-7', scenario: 'Bear Case', estimatedDays: 200, estimatedDate: '2026-11-01', probability: 0.35, requiredReturnRate: 0.26, assumptions: 'Complications delay return, persistent discount remains' },
  { drawdownId: 'dd-9', scenario: 'Base Case', estimatedDays: 180, estimatedDate: '2026-08-27', probability: 0.40, requiredReturnRate: 0.38, assumptions: 'Successful surgery with normal NFL recovery timeline' },
  { drawdownId: 'dd-9', scenario: 'Bull Case', estimatedDays: 120, estimatedDate: '2026-06-28', probability: 0.15, requiredReturnRate: 0.57, assumptions: 'Ahead-of-schedule recovery with positive medical updates' },
  { drawdownId: 'dd-9', scenario: 'Bear Case', estimatedDays: 365, estimatedDate: '2027-02-28', probability: 0.45, requiredReturnRate: 0.19, assumptions: 'Career-threatening injury narrative persists, partial recovery only' },
];

const mockDrawdownPaths: DrawdownPath[] = [];
mockDrawdowns.forEach(dd => {
  const totalDays = dd.isActive ? 30 : (dd.daysToTrough + (dd.daysToRecovery || 60));
  for (let d = 0; d <= Math.min(totalDays, 120); d += 3) {
    const peakToTrough = dd.daysToTrough;
    let value: number;
    if (d <= peakToTrough) {
      const progress = d / peakToTrough;
      value = dd.peakValue - (dd.peakValue - dd.troughValue) * progress;
    } else {
      const recDays = d - peakToTrough;
      const targetValue = dd.isActive ? dd.currentValue : dd.peakValue;
      const totalRec = dd.daysToRecovery || 120;
      const progress = Math.min(recDays / totalRec, 1);
      value = dd.troughValue + (targetValue - dd.troughValue) * progress;
    }
    mockDrawdownPaths.push({
      drawdownId: dd.id,
      date: `Day ${d}`,
      value: Math.round(value),
      drawdownFromPeak: Math.round(((value - dd.peakValue) / dd.peakValue) * 1000) / 10,
      recoveryFromTrough: d > peakToTrough ? Math.round(((value - dd.troughValue) / (dd.peakValue - dd.troughValue)) * 1000) / 10 : 0,
      dayNumber: d,
    });
  }
});

const mockScenarios: RecoveryScenario[] = [
  {
    id: 'rs-1', name: 'V-Shape Recovery', description: 'Sharp bounce-back driven by catalyst event (award, trade, comeback game)',
    avgRecoveryDays: 42, medianRecoveryDays: 35, recoveryRate: 0.88, historicalCount: 12,
    projectedPath: [{ day: 0, recoveryPercent: 0 }, { day: 7, recoveryPercent: 15 }, { day: 14, recoveryPercent: 35 }, { day: 21, recoveryPercent: 58 }, { day: 28, recoveryPercent: 78 }, { day: 35, recoveryPercent: 92 }, { day: 42, recoveryPercent: 100 }],
  },
  {
    id: 'rs-2', name: 'U-Shape Recovery', description: 'Gradual bottoming with slow steady climb back as fundamentals reassert',
    avgRecoveryDays: 95, medianRecoveryDays: 88, recoveryRate: 0.82, historicalCount: 18,
    projectedPath: [{ day: 0, recoveryPercent: 0 }, { day: 15, recoveryPercent: 5 }, { day: 30, recoveryPercent: 12 }, { day: 45, recoveryPercent: 28 }, { day: 60, recoveryPercent: 52 }, { day: 75, recoveryPercent: 74 }, { day: 90, recoveryPercent: 92 }, { day: 95, recoveryPercent: 100 }],
  },
  {
    id: 'rs-3', name: 'L-Shape (Permanent Loss)', description: 'No full recovery - structural value destruction from scandal or career-ending injury',
    avgRecoveryDays: 0, medianRecoveryDays: 0, recoveryRate: 0.15, historicalCount: 5,
    projectedPath: [{ day: 0, recoveryPercent: 0 }, { day: 30, recoveryPercent: 8 }, { day: 60, recoveryPercent: 14 }, { day: 90, recoveryPercent: 18 }, { day: 120, recoveryPercent: 20 }, { day: 180, recoveryPercent: 22 }, { day: 365, recoveryPercent: 25 }],
  },
];

// ---- Getter Functions ----

export function getDrawdownEvents(): DrawdownEvent[] {
  return mockDrawdowns;
}

export function getActiveDrawdowns(): DrawdownEvent[] {
  return mockDrawdowns.filter(d => d.isActive);
}

export function getRecoveryEstimates(drawdownId?: string): RecoveryEstimate[] {
  if (drawdownId) return mockRecoveryEstimates.filter(r => r.drawdownId === drawdownId);
  return mockRecoveryEstimates;
}

export function getDrawdownPaths(drawdownId?: string): DrawdownPath[] {
  if (drawdownId) return mockDrawdownPaths.filter(p => p.drawdownId === drawdownId);
  return mockDrawdownPaths;
}

export function getRecoveryScenarios(): RecoveryScenario[] {
  return mockScenarios;
}

export function getDrawdownStats() {
  const active = mockDrawdowns.filter(d => d.isActive);
  const recovered = mockDrawdowns.filter(d => !d.isActive);
  return {
    totalDrawdowns: mockDrawdowns.length,
    activeDrawdowns: active.length,
    recoveredDrawdowns: recovered.length,
    avgRecoveryDays: Math.round(recovered.reduce((s, d) => s + (d.daysToRecovery || 0), 0) / recovered.length),
    worstDrawdown: Math.min(...mockDrawdowns.map(d => d.drawdownPercent)),
    avgDrawdown: Math.round(mockDrawdowns.reduce((s, d) => s + d.drawdownPercent, 0) / mockDrawdowns.length * 10) / 10,
  };
}
