// ---- Types ----

export type DraftRound = '1st' | '2nd' | '3rd' | 'Undrafted';
export type PositionGroup = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'DB' | 'K' | 'P';
export type FuturesStatus = 'open' | 'closed' | 'settled';
export type ProjectionConfidence = 'high' | 'medium' | 'low';

export interface Prospect {
  id: string;
  name: string;
  school: string;
  position: PositionGroup;
  projectedRound: DraftRound;
  projectedPick: number;
  overallGrade: number;
  comparisonPlayer: string;
  keyStats: { label: string; value: string }[];
  cardPreDraftValue: number;
  cardPostDraftEstimate: number;
  hypeScore: number;
  riskScore: number;
}

export interface DraftScenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  impactedProspects: { prospectId: string; prospectName: string; pickChange: number; valueImpact: number }[];
  triggerCondition: string;
}

export interface FuturesPosition {
  id: string;
  prospectName: string;
  prospectId: string;
  positionType: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  unrealizedPnL: number;
  openDate: string;
  expirationDate: string;
  status: FuturesStatus;
  leverage: number;
}

export interface DraftProjection {
  id: string;
  prospectName: string;
  prospectId: string;
  bestCase: { pick: number; cardValue: number };
  baseCase: { pick: number; cardValue: number };
  worstCase: { pick: number; cardValue: number };
  confidence: ProjectionConfidence;
  keyDrivers: string[];
  lastUpdated: string;
}

export interface DraftStats {
  totalProspects: number;
  openPositions: number;
  totalExposure: number;
  unrealizedPnL: number;
  avgHypeScore: number;
  daysUntilDraft: number;
  scenariosModeled: number;
}

// ---- Mock Data ----

const mockProspects: Prospect[] = [
  {
    id: 'pr-001', name: 'Cam Ward', school: 'Miami', position: 'QB', projectedRound: '1st', projectedPick: 1, overallGrade: 94, comparisonPlayer: 'Patrick Mahomes',
    keyStats: [{ label: 'Pass Yards', value: '4,313' }, { label: 'TD/INT', value: '39/7' }, { label: '40-Yard', value: '4.62s' }, { label: 'QBR', value: '88.4' }],
    cardPreDraftValue: 285, cardPostDraftEstimate: 680, hypeScore: 96, riskScore: 22,
  },
  {
    id: 'pr-002', name: 'Shedeur Sanders', school: 'Colorado', position: 'QB', projectedRound: '1st', projectedPick: 4, overallGrade: 88, comparisonPlayer: 'Russell Wilson',
    keyStats: [{ label: 'Pass Yards', value: '4,134' }, { label: 'TD/INT', value: '37/10' }, { label: '40-Yard', value: '4.69s' }, { label: 'QBR', value: '82.1' }],
    cardPreDraftValue: 195, cardPostDraftEstimate: 420, hypeScore: 92, riskScore: 38,
  },
  {
    id: 'pr-003', name: 'Travis Hunter', school: 'Colorado', position: 'WR', projectedRound: '1st', projectedPick: 2, overallGrade: 97, comparisonPlayer: 'Champ Bailey / DeAndre Hopkins',
    keyStats: [{ label: 'Receptions', value: '96' }, { label: 'Rec Yards', value: '1,258' }, { label: 'INTs', value: '4' }, { label: 'TDs', value: '15' }],
    cardPreDraftValue: 320, cardPostDraftEstimate: 850, hypeScore: 99, riskScore: 15,
  },
  {
    id: 'pr-004', name: 'Abdul Carter', school: 'Penn State', position: 'LB', projectedRound: '1st', projectedPick: 6, overallGrade: 91, comparisonPlayer: 'Khalil Mack',
    keyStats: [{ label: 'Sacks', value: '12' }, { label: 'TFL', value: '19.5' }, { label: 'FF', value: '4' }, { label: '40-Yard', value: '4.48s' }],
    cardPreDraftValue: 42, cardPostDraftEstimate: 95, hypeScore: 78, riskScore: 25,
  },
  {
    id: 'pr-005', name: 'Tetairoa McMillan', school: 'Arizona', position: 'WR', projectedRound: '1st', projectedPick: 8, overallGrade: 90, comparisonPlayer: 'A.J. Green',
    keyStats: [{ label: 'Receptions', value: '84' }, { label: 'Rec Yards', value: '1,319' }, { label: 'TDs', value: '8' }, { label: '40-Yard', value: '4.43s' }],
    cardPreDraftValue: 38, cardPostDraftEstimate: 82, hypeScore: 74, riskScore: 28,
  },
  {
    id: 'pr-006', name: 'Mason Graham', school: 'Michigan', position: 'DL', projectedRound: '1st', projectedPick: 3, overallGrade: 93, comparisonPlayer: 'Chris Jones',
    keyStats: [{ label: 'Sacks', value: '5.5' }, { label: 'TFL', value: '10' }, { label: 'Run Stop %', value: '14.2%' }, { label: 'Pressures', value: '42' }],
    cardPreDraftValue: 28, cardPostDraftEstimate: 55, hypeScore: 68, riskScore: 18,
  },
  {
    id: 'pr-007', name: 'Ashton Jeanty', school: 'Boise State', position: 'RB', projectedRound: '1st', projectedPick: 12, overallGrade: 89, comparisonPlayer: 'Saquon Barkley',
    keyStats: [{ label: 'Rush Yards', value: '2,601' }, { label: 'TDs', value: '29' }, { label: 'YPC', value: '7.1' }, { label: '40-Yard', value: '4.41s' }],
    cardPreDraftValue: 55, cardPostDraftEstimate: 135, hypeScore: 85, riskScore: 42,
  },
  {
    id: 'pr-008', name: 'Will Johnson', school: 'Michigan', position: 'DB', projectedRound: '1st', projectedPick: 10, overallGrade: 87, comparisonPlayer: 'Jalen Ramsey',
    keyStats: [{ label: 'INTs', value: '3' }, { label: 'PBUs', value: '12' }, { label: 'Comp % Allowed', value: '38%' }, { label: '40-Yard', value: '4.45s' }],
    cardPreDraftValue: 22, cardPostDraftEstimate: 48, hypeScore: 65, riskScore: 30,
  },
];

const mockScenarios: DraftScenario[] = [
  {
    id: 'ds-001', name: 'Titans Take Ward #1', description: 'Tennessee selects Cam Ward with the first overall pick, giving him the QB1 crown and maximum draft capital narrative.', probability: 0.62,
    impactedProspects: [
      { prospectId: 'pr-001', prospectName: 'Cam Ward', pickChange: 0, valueImpact: 45 },
      { prospectId: 'pr-002', prospectName: 'Shedeur Sanders', pickChange: -1, valueImpact: -15 },
      { prospectId: 'pr-003', prospectName: 'Travis Hunter', pickChange: 0, valueImpact: 5 },
    ],
    triggerCondition: 'Titans do not trade down from #1',
  },
  {
    id: 'ds-002', name: 'Browns Trade Up for Sanders', description: 'Cleveland trades up to #3 to select Shedeur Sanders, creating a bidding war narrative and elevating his card value.', probability: 0.28,
    impactedProspects: [
      { prospectId: 'pr-002', prospectName: 'Shedeur Sanders', pickChange: 1, valueImpact: 65 },
      { prospectId: 'pr-006', prospectName: 'Mason Graham', pickChange: -2, valueImpact: -8 },
    ],
    triggerCondition: 'Cleveland trades 2026 1st + 2025 2nd to move up',
  },
  {
    id: 'ds-003', name: 'Hunter Slides to #4', description: 'Surprising slide as 3 QBs go top 3. Travis Hunter falls to Giants at #4, reducing his narrative premium.', probability: 0.15,
    impactedProspects: [
      { prospectId: 'pr-003', prospectName: 'Travis Hunter', pickChange: -2, valueImpact: -25 },
      { prospectId: 'pr-001', prospectName: 'Cam Ward', pickChange: 0, valueImpact: 10 },
      { prospectId: 'pr-002', prospectName: 'Shedeur Sanders', pickChange: 1, valueImpact: 20 },
    ],
    triggerCondition: 'Teams prioritize QB need over BPA',
  },
  {
    id: 'ds-004', name: 'Jeanty Falls to Round 2', description: 'RB devaluation trend continues. Ashton Jeanty slides out of round 1 despite elite production, cratering his rookie card premium.', probability: 0.35,
    impactedProspects: [
      { prospectId: 'pr-007', prospectName: 'Ashton Jeanty', pickChange: -20, valueImpact: -55 },
    ],
    triggerCondition: 'No RB selected in first 31 picks',
  },
  {
    id: 'ds-005', name: 'Record QB Run (4 in Top 10)', description: 'Four quarterbacks go in the top 10, pushing non-QB prospects down the board.', probability: 0.22,
    impactedProspects: [
      { prospectId: 'pr-004', prospectName: 'Abdul Carter', pickChange: -4, valueImpact: -18 },
      { prospectId: 'pr-005', prospectName: 'Tetairoa McMillan', pickChange: -5, valueImpact: -22 },
      { prospectId: 'pr-008', prospectName: 'Will Johnson', pickChange: -6, valueImpact: -28 },
    ],
    triggerCondition: 'Multiple surprise QB selections in top 10',
  },
];

const mockPositions: FuturesPosition[] = [
  { id: 'fp-001', prospectName: 'Cam Ward', prospectId: 'pr-001', positionType: 'long', entryPrice: 245, currentPrice: 285, quantity: 12, unrealizedPnL: 480, openDate: '2026-02-10', expirationDate: '2026-04-25', status: 'open', leverage: 2 },
  { id: 'fp-002', prospectName: 'Travis Hunter', prospectId: 'pr-003', positionType: 'long', entryPrice: 280, currentPrice: 320, quantity: 8, unrealizedPnL: 320, openDate: '2026-02-15', expirationDate: '2026-04-25', status: 'open', leverage: 1.5 },
  { id: 'fp-003', prospectName: 'Ashton Jeanty', prospectId: 'pr-007', positionType: 'short', entryPrice: 72, currentPrice: 55, quantity: 20, unrealizedPnL: 340, openDate: '2026-03-01', expirationDate: '2026-04-25', status: 'open', leverage: 3 },
  { id: 'fp-004', prospectName: 'Shedeur Sanders', prospectId: 'pr-002', positionType: 'long', entryPrice: 165, currentPrice: 195, quantity: 10, unrealizedPnL: 300, openDate: '2026-01-20', expirationDate: '2026-04-25', status: 'open', leverage: 2 },
  { id: 'fp-005', prospectName: 'Abdul Carter', prospectId: 'pr-004', positionType: 'long', entryPrice: 35, currentPrice: 42, quantity: 25, unrealizedPnL: 175, openDate: '2026-03-05', expirationDate: '2026-04-25', status: 'open', leverage: 1 },
  { id: 'fp-006', prospectName: 'Will Johnson', prospectId: 'pr-008', positionType: 'short', entryPrice: 28, currentPrice: 22, quantity: 30, unrealizedPnL: 180, openDate: '2026-03-10', expirationDate: '2026-04-25', status: 'open', leverage: 2 },
];

const mockProjections: DraftProjection[] = [
  { id: 'dp-001', prospectName: 'Cam Ward', prospectId: 'pr-001', bestCase: { pick: 1, cardValue: 850 }, baseCase: { pick: 1, cardValue: 680 }, worstCase: { pick: 5, cardValue: 320 }, confidence: 'high', keyDrivers: ['#1 overall lock', 'Franchise QB narrative', 'Large-market team'], lastUpdated: '2026-03-15' },
  { id: 'dp-002', prospectName: 'Travis Hunter', prospectId: 'pr-003', bestCase: { pick: 2, cardValue: 1100 }, baseCase: { pick: 2, cardValue: 850 }, worstCase: { pick: 5, cardValue: 450 }, confidence: 'high', keyDrivers: ['Two-way player narrative', 'Heisman winner', 'Generational talent comp'], lastUpdated: '2026-03-15' },
  { id: 'dp-003', prospectName: 'Shedeur Sanders', prospectId: 'pr-002', bestCase: { pick: 2, cardValue: 620 }, baseCase: { pick: 4, cardValue: 420 }, worstCase: { pick: 12, cardValue: 180 }, confidence: 'medium', keyDrivers: ['Deion factor', 'Media magnetism', 'Small school concern'], lastUpdated: '2026-03-14' },
  { id: 'dp-004', prospectName: 'Ashton Jeanty', prospectId: 'pr-007', bestCase: { pick: 8, cardValue: 200 }, baseCase: { pick: 15, cardValue: 135 }, worstCase: { pick: 38, cardValue: 45 }, confidence: 'low', keyDrivers: ['RB devaluation trend', 'Historic production', 'Positional bias'], lastUpdated: '2026-03-15' },
  { id: 'dp-005', prospectName: 'Abdul Carter', prospectId: 'pr-004', bestCase: { pick: 4, cardValue: 140 }, baseCase: { pick: 6, cardValue: 95 }, worstCase: { pick: 14, cardValue: 55 }, confidence: 'medium', keyDrivers: ['Elite pass rush', 'Defensive premium', 'Combine performance'], lastUpdated: '2026-03-14' },
  { id: 'dp-006', prospectName: 'Tetairoa McMillan', prospectId: 'pr-005', bestCase: { pick: 5, cardValue: 130 }, baseCase: { pick: 8, cardValue: 82 }, worstCase: { pick: 18, cardValue: 38 }, confidence: 'medium', keyDrivers: ['WR1 upside', 'Route running', 'Pro comparison'], lastUpdated: '2026-03-13' },
];

// ---- Public API ----

export function getProspects(): Prospect[] {
  return mockProspects;
}

export function getScenarios(): DraftScenario[] {
  return mockScenarios;
}

export function getPositions(): FuturesPosition[] {
  return mockPositions;
}

export function getProjections(): DraftProjection[] {
  return mockProjections;
}

export function getDraftStats(): DraftStats {
  return {
    totalProspects: mockProspects.length,
    openPositions: mockPositions.filter(p => p.status === 'open').length,
    totalExposure: mockPositions.reduce((acc, p) => acc + (p.currentPrice * p.quantity * p.leverage), 0),
    unrealizedPnL: mockPositions.reduce((acc, p) => acc + p.unrealizedPnL, 0),
    avgHypeScore: Math.round(mockProspects.reduce((a, b) => a + b.hypeScore, 0) / mockProspects.length),
    daysUntilDraft: 40,
    scenariosModeled: mockScenarios.length,
  };
}
