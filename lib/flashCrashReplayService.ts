// Flash Crash Replay Engine Service — Phase 13
// Study historical hobby market crashes with play-by-play replay

export interface CrashEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  peakDecline: number;
  recoveryTime: string;
  triggerCategory: string;
  affectedCategories: string[];
  totalValueLost: number;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
}

export interface CrashTimeline {
  id: string;
  crashId: string;
  timestamp: string;
  label: string;
  priceIndex: number;
  volumeIndex: number;
  event: string;
  sentiment: number;
}

export interface CrashMetric {
  id: string;
  crashId: string;
  metric: string;
  preCrash: number;
  atBottom: number;
  postRecovery: number;
  changePercent: number;
}

export interface RecoveryPath {
  id: string;
  crashId: string;
  month: number;
  priceRecovery: number;
  volumeRecovery: number;
  sentimentRecovery: number;
  newEntrants: number;
}

const MOCK_CRASHES: CrashEvent[] = [
  { id: 'crash-1', name: '2008 Financial Crisis Spillover', startDate: '2008-09-15', endDate: '2009-03-09', peakDecline: -42, recoveryTime: '18 months', triggerCategory: 'All Categories', affectedCategories: ['Vintage Baseball', 'Modern Basketball', 'Football RCs', 'Hockey'], totalValueLost: 2800000000, description: 'Global financial crisis caused widespread panic selling across all collectibles markets as liquidity dried up', severity: 'catastrophic' },
  { id: 'crash-2', name: '2020 COVID-19 Initial Shock', startDate: '2020-03-01', endDate: '2020-03-23', peakDecline: -35, recoveryTime: '2 months', triggerCategory: 'All Categories', affectedCategories: ['Modern Basketball', 'Football RCs', 'Baseball Prospects', 'Soccer'], totalValueLost: 1500000000, description: 'Pandemic lockdowns caused brief but sharp selloff before stimulus-driven recovery and hobby boom', severity: 'severe' },
  { id: 'crash-3', name: '2022 Modern Card Correction', startDate: '2022-06-01', endDate: '2023-01-15', peakDecline: -55, recoveryTime: '14 months', triggerCategory: 'Modern Basketball', affectedCategories: ['Basketball Prizm', 'Football Prizm', 'Modern RPAs', 'Panini Products'], totalValueLost: 3200000000, description: 'Post-pandemic overheating led to massive correction in modern card prices as speculative interest waned', severity: 'catastrophic' },
  { id: 'crash-4', name: '2015 Junk Wax Realization', startDate: '2015-01-01', endDate: '2015-08-30', peakDecline: -28, recoveryTime: '24+ months', triggerCategory: 'Late 80s/90s Cards', affectedCategories: ['1987-1993 Baseball', '1989-1993 Basketball', '1989-1993 Football'], totalValueLost: 450000000, description: 'Market finally accepted permanent devaluation of overproduced junk wax era cards', severity: 'moderate' },
  { id: 'crash-5', name: '2024 Panini License Loss Panic', startDate: '2024-01-15', endDate: '2024-04-30', peakDecline: -38, recoveryTime: '6 months', triggerCategory: 'Panini Products', affectedCategories: ['Panini Prizm', 'National Treasures', 'Panini Select', 'Panini Mosaic'], totalValueLost: 1800000000, description: 'Panini losing NBA and NFL licenses triggered uncertainty and selloff in all Panini-branded products', severity: 'severe' },
  { id: 'crash-6', name: '2019 eBay Authentication Scare', startDate: '2019-07-01', endDate: '2019-09-15', peakDecline: -18, recoveryTime: '3 months', triggerCategory: 'Graded Vintage', affectedCategories: ['PSA Graded Vintage', 'BGS Graded Modern', 'SGC Graded'], totalValueLost: 320000000, description: 'Wave of counterfeit grading slab reports caused temporary trust crisis in authenticated card market', severity: 'minor' },
];

const MOCK_TIMELINES: CrashTimeline[] = [
  // 2022 Modern Card Correction timeline
  { id: 'tl-1', crashId: 'crash-3', timestamp: 'Jun 2022 W1', label: 'Pre-Crash Peak', priceIndex: 100, volumeIndex: 100, event: 'Market at all-time highs', sentiment: 85 },
  { id: 'tl-2', crashId: 'crash-3', timestamp: 'Jun 2022 W2', label: 'First Cracks', priceIndex: 94, volumeIndex: 115, event: 'Large sellers begin liquidating', sentiment: 72 },
  { id: 'tl-3', crashId: 'crash-3', timestamp: 'Jul 2022 W1', label: 'Acceleration', priceIndex: 82, volumeIndex: 140, event: 'Panic selling begins in Prizm', sentiment: 55 },
  { id: 'tl-4', crashId: 'crash-3', timestamp: 'Aug 2022 W1', label: 'Contagion', priceIndex: 68, volumeIndex: 165, event: 'Selloff spreads to all modern cards', sentiment: 38 },
  { id: 'tl-5', crashId: 'crash-3', timestamp: 'Sep 2022 W1', label: 'Capitulation', priceIndex: 52, volumeIndex: 180, event: 'Mass capitulation selling', sentiment: 22 },
  { id: 'tl-6', crashId: 'crash-3', timestamp: 'Oct 2022 W1', label: 'Dead Cat Bounce', priceIndex: 58, volumeIndex: 120, event: 'Brief recovery attempt fails', sentiment: 35 },
  { id: 'tl-7', crashId: 'crash-3', timestamp: 'Nov 2022 W1', label: 'Continued Decline', priceIndex: 48, volumeIndex: 85, event: 'Volume dries up as sellers exhaust', sentiment: 28 },
  { id: 'tl-8', crashId: 'crash-3', timestamp: 'Jan 2023 W1', label: 'Bottom', priceIndex: 45, volumeIndex: 55, event: 'Market finds floor at 55% decline', sentiment: 20 },
  // 2020 COVID timeline
  { id: 'tl-9', crashId: 'crash-2', timestamp: 'Mar 1 2020', label: 'Pre-Crash', priceIndex: 100, volumeIndex: 100, event: 'COVID concerns building', sentiment: 68 },
  { id: 'tl-10', crashId: 'crash-2', timestamp: 'Mar 9 2020', label: 'Initial Drop', priceIndex: 88, volumeIndex: 130, event: 'Sports leagues suspend play', sentiment: 45 },
  { id: 'tl-11', crashId: 'crash-2', timestamp: 'Mar 16 2020', label: 'Panic Phase', priceIndex: 72, volumeIndex: 175, event: 'Full lockdown announced', sentiment: 25 },
  { id: 'tl-12', crashId: 'crash-2', timestamp: 'Mar 23 2020', label: 'Bottom', priceIndex: 65, volumeIndex: 145, event: 'Maximum fear - stimulus announced', sentiment: 18 },
  { id: 'tl-13', crashId: 'crash-2', timestamp: 'Apr 6 2020', label: 'Recovery Begins', priceIndex: 78, volumeIndex: 160, event: 'The Last Dance airs, hobby booms', sentiment: 55 },
  { id: 'tl-14', crashId: 'crash-2', timestamp: 'May 2020', label: 'V-Recovery', priceIndex: 105, volumeIndex: 220, event: 'Stimulus checks fuel buying frenzy', sentiment: 82 },
];

const MOCK_METRICS: CrashMetric[] = [
  { id: 'cm-1', crashId: 'crash-3', metric: 'Avg Card Price', preCrash: 485, atBottom: 218, postRecovery: 342, changePercent: -55 },
  { id: 'cm-2', crashId: 'crash-3', metric: 'Daily Volume', preCrash: 12500, atBottom: 3800, postRecovery: 8200, changePercent: -70 },
  { id: 'cm-3', crashId: 'crash-3', metric: 'Active Listings', preCrash: 85000, atBottom: 142000, postRecovery: 95000, changePercent: 67 },
  { id: 'cm-4', crashId: 'crash-2', metric: 'Avg Card Price', preCrash: 225, atBottom: 146, postRecovery: 380, changePercent: -35 },
  { id: 'cm-5', crashId: 'crash-2', metric: 'Daily Volume', preCrash: 8500, atBottom: 2200, postRecovery: 15600, changePercent: -74 },
  { id: 'cm-6', crashId: 'crash-1', metric: 'Avg Card Price', preCrash: 178, atBottom: 103, postRecovery: 155, changePercent: -42 },
];

const MOCK_RECOVERY: RecoveryPath[] = [
  { id: 'rp-1', crashId: 'crash-3', month: 0, priceRecovery: 0, volumeRecovery: 0, sentimentRecovery: 0, newEntrants: 1200 },
  { id: 'rp-2', crashId: 'crash-3', month: 2, priceRecovery: 12, volumeRecovery: 18, sentimentRecovery: 15, newEntrants: 2800 },
  { id: 'rp-3', crashId: 'crash-3', month: 4, priceRecovery: 28, volumeRecovery: 35, sentimentRecovery: 32, newEntrants: 4500 },
  { id: 'rp-4', crashId: 'crash-3', month: 6, priceRecovery: 42, volumeRecovery: 52, sentimentRecovery: 48, newEntrants: 5200 },
  { id: 'rp-5', crashId: 'crash-3', month: 8, priceRecovery: 55, volumeRecovery: 64, sentimentRecovery: 58, newEntrants: 6100 },
  { id: 'rp-6', crashId: 'crash-3', month: 10, priceRecovery: 65, volumeRecovery: 72, sentimentRecovery: 68, newEntrants: 7400 },
  { id: 'rp-7', crashId: 'crash-3', month: 12, priceRecovery: 74, volumeRecovery: 80, sentimentRecovery: 76, newEntrants: 8200 },
  { id: 'rp-8', crashId: 'crash-3', month: 14, priceRecovery: 82, volumeRecovery: 88, sentimentRecovery: 84, newEntrants: 9500 },
  { id: 'rp-9', crashId: 'crash-2', month: 0, priceRecovery: 0, volumeRecovery: 0, sentimentRecovery: 0, newEntrants: 5000 },
  { id: 'rp-10', crashId: 'crash-2', month: 1, priceRecovery: 45, volumeRecovery: 55, sentimentRecovery: 52, newEntrants: 18000 },
  { id: 'rp-11', crashId: 'crash-2', month: 2, priceRecovery: 110, volumeRecovery: 145, sentimentRecovery: 95, newEntrants: 42000 },
];

export function getCrashEvents(): CrashEvent[] { return [...MOCK_CRASHES]; }
export function getCrashTimelines(crashId?: string): CrashTimeline[] { return crashId ? MOCK_TIMELINES.filter(t => t.crashId === crashId) : [...MOCK_TIMELINES]; }
export function getCrashMetrics(crashId?: string): CrashMetric[] { return crashId ? MOCK_METRICS.filter(m => m.crashId === crashId) : [...MOCK_METRICS]; }
export function getRecoveryPaths(crashId?: string): RecoveryPath[] { return crashId ? MOCK_RECOVERY.filter(r => r.crashId === crashId) : [...MOCK_RECOVERY]; }
export function getWorstCrash(): CrashEvent { return MOCK_CRASHES.reduce((worst, c) => c.peakDecline < worst.peakDecline ? c : worst); }
export function getAvgRecoveryMonths(): number { return 10; }
export function getTotalValueLost(): number { return MOCK_CRASHES.reduce((sum, c) => sum + c.totalValueLost, 0); }
