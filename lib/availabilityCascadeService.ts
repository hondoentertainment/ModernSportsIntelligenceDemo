// Availability Cascade Tracker Service
// Track how repeated narratives become accepted market "truth"

export interface CascadeNarrative {
  id: string;
  narrative: string;
  category: string;
  strengthScore: number;
  truthScore: number;
  repetitions: number;
  originSource: string;
  originDate: string;
  currentReach: number;
  status: 'growing' | 'peaked' | 'declining' | 'debunked';
  affectedCards: string[];
  priceImpact: number;
  description: string;
}

export interface NarrativeStrength {
  month: string;
  narrativeId: string;
  narrativeName: string;
  strength: number;
  mentions: number;
  believability: number;
}

export interface TruthScore {
  narrativeId: string;
  narrative: string;
  claimedTruth: string;
  actualEvidence: string;
  truthScore: number;
  dataSupport: number;
  expertConsensus: number;
  historicalAccuracy: number;
  verdict: 'mostly-true' | 'mixed' | 'misleading' | 'false';
}

export interface CascadeHistory {
  month: string;
  activeNarratives: number;
  avgStrength: number;
  avgTruth: number;
  debunked: number;
  portfolioImpact: number;
}

const cascadeNarratives: CascadeNarrative[] = [
  { id: 'cn-1', narrative: 'Sports cards are the new stocks - only going up', category: 'Market Thesis', strengthScore: 82, truthScore: 25, repetitions: 4500, originSource: 'Hobby YouTube 2020', originDate: '2020-06-15', currentReach: 850000, status: 'declining', affectedCards: ['All modern rookies', 'Graded cards', 'Prospect autos'], priceImpact: 35, description: 'The narrative that cards are a reliable investment vehicle like equities has been widely repeated despite limited evidence' },
  { id: 'cn-2', narrative: 'PSA 10 always holds value - you cannot lose', category: 'Grading', strengthScore: 78, truthScore: 42, repetitions: 3200, originSource: 'Collector Forums', originDate: '2019-03-20', currentReach: 620000, status: 'peaked', affectedCards: ['All PSA 10 graded cards'], priceImpact: 28, description: 'The belief that a PSA 10 grade guarantees value retention ignores population increases and demand shifts' },
  { id: 'cn-3', narrative: 'This rookie class is the best ever', category: 'Annual Hype', strengthScore: 88, truthScore: 30, repetitions: 6200, originSource: 'Draft Coverage Media', originDate: '2026-01-10', currentReach: 1200000, status: 'growing', affectedCards: ['2024-2025 rookie class cards'], priceImpact: 45, description: 'Every draft class gets labeled as historic - this narrative recurs annually driving speculative buying' },
  { id: 'cn-4', narrative: 'Low population cards always appreciate', category: 'Supply Myth', strengthScore: 71, truthScore: 38, repetitions: 2800, originSource: 'Case Break Community', originDate: '2021-08-05', currentReach: 450000, status: 'peaked', affectedCards: ['Short prints', 'Low-numbered parallels', 'SSPs'], priceImpact: 32, description: 'Scarcity alone does not drive appreciation - demand must also exist for the specific card' },
  { id: 'cn-5', narrative: 'The hobby will never crash again like 1990s junk wax', category: 'Historical Amnesia', strengthScore: 65, truthScore: 35, repetitions: 1900, originSource: 'Hobby Podcasts', originDate: '2020-11-01', currentReach: 380000, status: 'declining', affectedCards: ['Modern overproduction sets'], priceImpact: 22, description: 'Dismissing cyclical risk because "this time is different" ignores fundamental market dynamics' },
  { id: 'cn-6', narrative: 'International market will 10x card prices', category: 'Demand Theory', strengthScore: 74, truthScore: 48, repetitions: 2400, originSource: 'Industry Reports', originDate: '2022-04-15', currentReach: 520000, status: 'growing', affectedCards: ['Soccer cards', 'Basketball global stars', 'Crossover athletes'], priceImpact: 25, description: 'International expansion is real but the 10x multiplier narrative lacks supporting data' },
  { id: 'cn-7', narrative: 'AI grading will replace PSA and crash prices', category: 'Technology Fear', strengthScore: 58, truthScore: 52, repetitions: 1500, originSource: 'Tech Media', originDate: '2024-09-20', currentReach: 280000, status: 'growing', affectedCards: ['All graded cards'], priceImpact: -12, description: 'AI grading will supplement but unlikely replace trusted brands entirely in the near term' },
  { id: 'cn-8', narrative: 'Fractional ownership is the future of high-end cards', category: 'Innovation Hype', strengthScore: 55, truthScore: 45, repetitions: 1200, originSource: 'Fintech Startups', originDate: '2023-06-10', currentReach: 220000, status: 'declining', affectedCards: ['High-value vintage cards', 'Six-figure modern cards'], priceImpact: 8, description: 'Multiple fractional platforms have struggled - the model has not proven sustainable at scale' },
];

const narrativeStrengthData: NarrativeStrength[] = [
  { month: 'Jan 2026', narrativeId: 'cn-1', narrativeName: 'Cards are new stocks', strength: 85, mentions: 380, believability: 55 },
  { month: 'Feb 2026', narrativeId: 'cn-1', narrativeName: 'Cards are new stocks', strength: 83, mentions: 350, believability: 48 },
  { month: 'Mar 2026', narrativeId: 'cn-1', narrativeName: 'Cards are new stocks', strength: 80, mentions: 310, believability: 42 },
  { month: 'Apr 2026', narrativeId: 'cn-1', narrativeName: 'Cards are new stocks', strength: 82, mentions: 340, believability: 38 },
  { month: 'Jan 2026', narrativeId: 'cn-3', narrativeName: 'Best rookie class ever', strength: 72, mentions: 450, believability: 62 },
  { month: 'Feb 2026', narrativeId: 'cn-3', narrativeName: 'Best rookie class ever', strength: 80, mentions: 580, believability: 68 },
  { month: 'Mar 2026', narrativeId: 'cn-3', narrativeName: 'Best rookie class ever', strength: 85, mentions: 720, believability: 72 },
  { month: 'Apr 2026', narrativeId: 'cn-3', narrativeName: 'Best rookie class ever', strength: 88, mentions: 850, believability: 75 },
  { month: 'Jan 2026', narrativeId: 'cn-6', narrativeName: 'International 10x demand', strength: 68, mentions: 200, believability: 55 },
  { month: 'Feb 2026', narrativeId: 'cn-6', narrativeName: 'International 10x demand', strength: 70, mentions: 220, believability: 58 },
  { month: 'Mar 2026', narrativeId: 'cn-6', narrativeName: 'International 10x demand', strength: 72, mentions: 250, believability: 60 },
  { month: 'Apr 2026', narrativeId: 'cn-6', narrativeName: 'International 10x demand', strength: 74, mentions: 280, believability: 62 },
];

const truthScores: TruthScore[] = [
  { narrativeId: 'cn-1', narrative: 'Sports cards are the new stocks', claimedTruth: 'Cards provide stock-like returns with consistent appreciation', actualEvidence: 'Most cards lose value; only top 2-3% appreciate meaningfully', truthScore: 25, dataSupport: 18, expertConsensus: 22, historicalAccuracy: 35, verdict: 'misleading' },
  { narrativeId: 'cn-2', narrative: 'PSA 10 always holds value', claimedTruth: 'A PSA 10 grade guarantees your card maintains or gains value', actualEvidence: 'PSA 10 populations have exploded; many PSA 10 cards down 50%+', truthScore: 42, dataSupport: 35, expertConsensus: 45, historicalAccuracy: 48, verdict: 'misleading' },
  { narrativeId: 'cn-3', narrative: 'This rookie class is the best ever', claimedTruth: '2024-2025 rookie class is historically strong across all sports', actualEvidence: 'Every year is called the best; only time validates the claim', truthScore: 30, dataSupport: 25, expertConsensus: 32, historicalAccuracy: 28, verdict: 'misleading' },
  { narrativeId: 'cn-4', narrative: 'Low population cards always appreciate', claimedTruth: 'Scarcity drives inevitable price increases', actualEvidence: 'Many low-pop cards have crashed when demand evaporated', truthScore: 38, dataSupport: 32, expertConsensus: 40, historicalAccuracy: 42, verdict: 'mixed' },
  { narrativeId: 'cn-5', narrative: 'No crash like junk wax again', claimedTruth: 'Modern production controls prevent another market collapse', actualEvidence: 'Overproduction continues; 2021-2023 showed significant corrections', truthScore: 35, dataSupport: 28, expertConsensus: 38, historicalAccuracy: 40, verdict: 'misleading' },
  { narrativeId: 'cn-6', narrative: 'International market will 10x prices', claimedTruth: 'Global adoption will multiply demand by 10x or more', actualEvidence: 'International growth is real but gradual; 2-3x more realistic', truthScore: 48, dataSupport: 42, expertConsensus: 52, historicalAccuracy: 50, verdict: 'mixed' },
  { narrativeId: 'cn-7', narrative: 'AI grading will replace PSA', claimedTruth: 'AI-powered grading will make PSA/BGS obsolete within 5 years', actualEvidence: 'AI assists but brand trust takes decades to build; likely coexistence', truthScore: 52, dataSupport: 48, expertConsensus: 55, historicalAccuracy: 55, verdict: 'mixed' },
  { narrativeId: 'cn-8', narrative: 'Fractional ownership is the future', claimedTruth: 'Fractional platforms will democratize high-end card investing', actualEvidence: 'Multiple platforms have closed; liquidity and regulation challenges remain', truthScore: 45, dataSupport: 38, expertConsensus: 48, historicalAccuracy: 45, verdict: 'mixed' },
];

const cascadeHistoryData: CascadeHistory[] = [
  { month: 'Nov 2025', activeNarratives: 10, avgStrength: 72, avgTruth: 38, debunked: 1, portfolioImpact: -3200 },
  { month: 'Dec 2025', activeNarratives: 11, avgStrength: 74, avgTruth: 37, debunked: 0, portfolioImpact: -3500 },
  { month: 'Jan 2026', activeNarratives: 10, avgStrength: 75, avgTruth: 36, debunked: 1, portfolioImpact: -3800 },
  { month: 'Feb 2026', activeNarratives: 9, avgStrength: 73, avgTruth: 38, debunked: 1, portfolioImpact: -3400 },
  { month: 'Mar 2026', activeNarratives: 8, avgStrength: 71, avgTruth: 40, debunked: 1, portfolioImpact: -3100 },
  { month: 'Apr 2026', activeNarratives: 8, avgStrength: 72, avgTruth: 39, debunked: 0, portfolioImpact: -2900 },
];

export function getCascadeNarratives(): CascadeNarrative[] {
  return cascadeNarratives;
}

export function getNarrativeStrengthData(): NarrativeStrength[] {
  return narrativeStrengthData;
}

export function getTruthScores(): TruthScore[] {
  return truthScores;
}

export function getCascadeHistory(): CascadeHistory[] {
  return cascadeHistoryData;
}

export function getCascadeStats() {
  const active = cascadeNarratives.filter(n => n.status === 'growing' || n.status === 'peaked').length;
  const avgStrength = Math.round(cascadeNarratives.reduce((s, n) => s + n.strengthScore, 0) / cascadeNarratives.length);
  const avgTruth = Math.round(cascadeNarratives.reduce((s, n) => s + n.truthScore, 0) / cascadeNarratives.length);
  const totalReach = cascadeNarratives.reduce((s, n) => s + n.currentReach, 0);
  return { activeNarratives: active, avgStrength, avgTruth, totalReach };
}
