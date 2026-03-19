// ---- Types ----

export interface CenteringMeasurement {
  id: string;
  player: string;
  cardDescription: string;
  measuredAt: string;
  leftRight: { left: number; right: number; ratio: string };
  topBottom: { top: number; bottom: number; ratio: string };
  overallCenteringScore: number; // 0-100
  meetsThreshold: { psa10: boolean; bgs95: boolean; bgs10: boolean; sgc10: boolean };
  imageUrl: string;
}

export interface SubGradeImpact {
  id: string;
  measurementId: string;
  player: string;
  currentCenteringSubGrade: number;
  predictedPSAGrade: number;
  predictedBGSCentering: number;
  predictedSGCGrade: number;
  centeringImpactOnFinal: 'none' | 'minor' | 'moderate' | 'severe';
  potentialValueLoss: number;
  notes: string;
}

export interface GradeEstimate {
  id: string;
  measurementId: string;
  player: string;
  cardDescription: string;
  estimatedPSA: number;
  estimatedBGS: number;
  estimatedBGSSubgrades: { centering: number; edges: number; corners: number; surface: number };
  estimatedSGC: number;
  confidence: number;
  valueAtEstimatedGrade: number;
  valueAtNextGradeUp: number;
  gradePremium: number;
}

export interface CenteringHistory {
  id: string;
  player: string;
  cardDescription: string;
  measurements: { date: string; lrRatio: string; tbRatio: string; score: number }[];
  trend: 'improving' | 'stable' | 'declining';
  avgScore: number;
}

// ---- Mock Data ----

const MOCK_MEASUREMENTS: CenteringMeasurement[] = [
  {
    id: 'cm-1', player: 'Luka Doncic', cardDescription: '2018 Prizm Silver #280 Raw',
    measuredAt: '2026-03-15T09:12:00Z',
    leftRight: { left: 50.2, right: 49.8, ratio: '50/50' },
    topBottom: { top: 48.5, bottom: 51.5, ratio: '48/52' },
    overallCenteringScore: 96,
    meetsThreshold: { psa10: true, bgs95: true, bgs10: true, sgc10: true },
    imageUrl: '/centering/doncic-prizm.jpg',
  },
  {
    id: 'cm-2', player: 'Victor Wembanyama', cardDescription: '2023 Prizm Base #1 Raw',
    measuredAt: '2026-03-15T09:30:00Z',
    leftRight: { left: 55.1, right: 44.9, ratio: '55/45' },
    topBottom: { top: 52.3, bottom: 47.7, ratio: '52/48' },
    overallCenteringScore: 72,
    meetsThreshold: { psa10: true, bgs95: false, bgs10: false, sgc10: true },
    imageUrl: '/centering/wemby-base.jpg',
  },
  {
    id: 'cm-3', player: 'Shohei Ohtani', cardDescription: '2018 Topps Chrome #150 Raw',
    measuredAt: '2026-03-14T14:05:00Z',
    leftRight: { left: 52.8, right: 47.2, ratio: '53/47' },
    topBottom: { top: 50.1, bottom: 49.9, ratio: '50/50' },
    overallCenteringScore: 88,
    meetsThreshold: { psa10: true, bgs95: true, bgs10: false, sgc10: true },
    imageUrl: '/centering/ohtani-chrome.jpg',
  },
  {
    id: 'cm-4', player: 'Patrick Mahomes', cardDescription: '2017 Prizm #269 RC Raw',
    measuredAt: '2026-03-14T14:22:00Z',
    leftRight: { left: 58.4, right: 41.6, ratio: '58/42' },
    topBottom: { top: 56.2, bottom: 43.8, ratio: '56/44' },
    overallCenteringScore: 48,
    meetsThreshold: { psa10: false, bgs95: false, bgs10: false, sgc10: false },
    imageUrl: '/centering/mahomes-prizm.jpg',
  },
  {
    id: 'cm-5', player: 'Jayson Tatum', cardDescription: '2017 Prizm Silver #16 Raw',
    measuredAt: '2026-03-13T11:00:00Z',
    leftRight: { left: 51.5, right: 48.5, ratio: '52/48' },
    topBottom: { top: 49.2, bottom: 50.8, ratio: '49/51' },
    overallCenteringScore: 93,
    meetsThreshold: { psa10: true, bgs95: true, bgs10: true, sgc10: true },
    imageUrl: '/centering/tatum-silver.jpg',
  },
  {
    id: 'cm-6', player: 'Anthony Edwards', cardDescription: '2020 Prizm #258 RC Raw',
    measuredAt: '2026-03-13T11:18:00Z',
    leftRight: { left: 54.0, right: 46.0, ratio: '54/46' },
    topBottom: { top: 53.8, bottom: 46.2, ratio: '54/46' },
    overallCenteringScore: 68,
    meetsThreshold: { psa10: true, bgs95: false, bgs10: false, sgc10: true },
    imageUrl: '/centering/ant-prizm.jpg',
  },
  {
    id: 'cm-7', player: 'Caitlin Clark', cardDescription: '2024 Prizm Base #101 RC Raw',
    measuredAt: '2026-03-12T16:45:00Z',
    leftRight: { left: 61.2, right: 38.8, ratio: '61/39' },
    topBottom: { top: 50.5, bottom: 49.5, ratio: '51/49' },
    overallCenteringScore: 42,
    meetsThreshold: { psa10: false, bgs95: false, bgs10: false, sgc10: false },
    imageUrl: '/centering/clark-base.jpg',
  },
];

const MOCK_SUBGRADE_IMPACT: SubGradeImpact[] = [
  { id: 'sgi-1', measurementId: 'cm-1', player: 'Luka Doncic', currentCenteringSubGrade: 9.5, predictedPSAGrade: 10, predictedBGSCentering: 9.5, predictedSGCGrade: 10, centeringImpactOnFinal: 'none', potentialValueLoss: 0, notes: 'Near-perfect centering. No impact on final grade from centering.' },
  { id: 'sgi-2', measurementId: 'cm-2', player: 'Victor Wembanyama', currentCenteringSubGrade: 8.5, predictedPSAGrade: 9, predictedBGSCentering: 8.5, predictedSGCGrade: 9.5, centeringImpactOnFinal: 'moderate', potentialValueLoss: 85, notes: 'L/R shift of 55/45 will likely cap BGS centering at 8.5. PSA more lenient — may still get a 10.' },
  { id: 'sgi-3', measurementId: 'cm-3', player: 'Shohei Ohtani', currentCenteringSubGrade: 9.0, predictedPSAGrade: 10, predictedBGSCentering: 9.0, predictedSGCGrade: 10, centeringImpactOnFinal: 'minor', potentialValueLoss: 30, notes: 'Slight L/R shift. PSA will likely overlook. BGS centering will be 9 instead of 9.5.' },
  { id: 'sgi-4', measurementId: 'cm-4', player: 'Patrick Mahomes', currentCenteringSubGrade: 7.0, predictedPSAGrade: 8, predictedBGSCentering: 7.0, predictedSGCGrade: 8, centeringImpactOnFinal: 'severe', potentialValueLoss: 620, notes: 'Significantly off-center both L/R and T/B. Will cap PSA at 8 and BGS centering at 7. Submit to SGC for best chance at a 9.' },
  { id: 'sgi-5', measurementId: 'cm-5', player: 'Jayson Tatum', currentCenteringSubGrade: 9.5, predictedPSAGrade: 10, predictedBGSCentering: 9.5, predictedSGCGrade: 10, centeringImpactOnFinal: 'none', potentialValueLoss: 0, notes: 'Excellent centering all around. No limitations from centering.' },
  { id: 'sgi-6', measurementId: 'cm-6', player: 'Anthony Edwards', currentCenteringSubGrade: 8.0, predictedPSAGrade: 9, predictedBGSCentering: 8.0, predictedSGCGrade: 9, centeringImpactOnFinal: 'moderate', potentialValueLoss: 55, notes: 'Both axes at 54/46. PSA could still give a 10 but more likely a 9. BGS centering capped at 8.' },
  { id: 'sgi-7', measurementId: 'cm-7', player: 'Caitlin Clark', currentCenteringSubGrade: 6.5, predictedPSAGrade: 7, predictedBGSCentering: 6.5, predictedSGCGrade: 7, centeringImpactOnFinal: 'severe', potentialValueLoss: 40, notes: 'Heavily off-center L/R at 61/39. Not worth grading unless card has significant raw value.' },
];

const MOCK_GRADE_ESTIMATES: GradeEstimate[] = [
  { id: 'ge-1', measurementId: 'cm-1', player: 'Luka Doncic', cardDescription: '2018 Prizm Silver #280 Raw', estimatedPSA: 10, estimatedBGS: 9.5, estimatedBGSSubgrades: { centering: 9.5, edges: 9.5, corners: 9.5, surface: 9.5 }, estimatedSGC: 10, confidence: 88, valueAtEstimatedGrade: 720, valueAtNextGradeUp: 720, gradePremium: 0 },
  { id: 'ge-2', measurementId: 'cm-2', player: 'Victor Wembanyama', cardDescription: '2023 Prizm Base #1 Raw', estimatedPSA: 9, estimatedBGS: 9.0, estimatedBGSSubgrades: { centering: 8.5, edges: 9.5, corners: 9.0, surface: 9.5 }, estimatedSGC: 9.5, confidence: 75, valueAtEstimatedGrade: 165, valueAtNextGradeUp: 250, gradePremium: 51.5 },
  { id: 'ge-3', measurementId: 'cm-3', player: 'Shohei Ohtani', cardDescription: '2018 Topps Chrome #150 Raw', estimatedPSA: 10, estimatedBGS: 9.5, estimatedBGSSubgrades: { centering: 9.0, edges: 9.5, corners: 10, surface: 9.5 }, estimatedSGC: 10, confidence: 82, valueAtEstimatedGrade: 380, valueAtNextGradeUp: 380, gradePremium: 0 },
  { id: 'ge-4', measurementId: 'cm-4', player: 'Patrick Mahomes', cardDescription: '2017 Prizm #269 RC Raw', estimatedPSA: 8, estimatedBGS: 8.0, estimatedBGSSubgrades: { centering: 7.0, edges: 9.0, corners: 9.0, surface: 9.0 }, estimatedSGC: 8, confidence: 70, valueAtEstimatedGrade: 980, valueAtNextGradeUp: 1600, gradePremium: 63.3 },
  { id: 'ge-5', measurementId: 'cm-5', player: 'Jayson Tatum', cardDescription: '2017 Prizm Silver #16 Raw', estimatedPSA: 10, estimatedBGS: 9.5, estimatedBGSSubgrades: { centering: 9.5, edges: 9.5, corners: 9.0, surface: 10 }, estimatedSGC: 10, confidence: 85, valueAtEstimatedGrade: 510, valueAtNextGradeUp: 510, gradePremium: 0 },
  { id: 'ge-6', measurementId: 'cm-6', player: 'Anthony Edwards', cardDescription: '2020 Prizm #258 RC Raw', estimatedPSA: 9, estimatedBGS: 8.5, estimatedBGSSubgrades: { centering: 8.0, edges: 9.0, corners: 9.0, surface: 9.0 }, estimatedSGC: 9, confidence: 72, valueAtEstimatedGrade: 130, valueAtNextGradeUp: 195, gradePremium: 50.0 },
  { id: 'ge-7', measurementId: 'cm-7', player: 'Caitlin Clark', cardDescription: '2024 Prizm Base #101 RC Raw', estimatedPSA: 7, estimatedBGS: 7.5, estimatedBGSSubgrades: { centering: 6.5, edges: 9.0, corners: 8.5, surface: 9.0 }, estimatedSGC: 7, confidence: 65, valueAtEstimatedGrade: 30, valueAtNextGradeUp: 55, gradePremium: 83.3 },
];

const MOCK_HISTORY: CenteringHistory[] = [
  { id: 'ch-1', player: 'Luka Doncic', cardDescription: '2018 Prizm Silver #280', measurements: [{ date: '2026-01-10', lrRatio: '51/49', tbRatio: '49/51', score: 94 }, { date: '2026-02-14', lrRatio: '50/50', tbRatio: '48/52', score: 95 }, { date: '2026-03-15', lrRatio: '50/50', tbRatio: '48/52', score: 96 }], trend: 'stable', avgScore: 95 },
  { id: 'ch-2', player: 'Patrick Mahomes', cardDescription: '2017 Prizm #269 RC', measurements: [{ date: '2026-01-05', lrRatio: '57/43', tbRatio: '55/45', score: 50 }, { date: '2026-02-10', lrRatio: '58/42', tbRatio: '56/44', score: 48 }, { date: '2026-03-14', lrRatio: '58/42', tbRatio: '56/44', score: 48 }], trend: 'stable', avgScore: 48.7 },
  { id: 'ch-3', player: 'Jayson Tatum', cardDescription: '2017 Prizm Silver #16', measurements: [{ date: '2026-02-01', lrRatio: '52/48', tbRatio: '50/50', score: 91 }, { date: '2026-03-13', lrRatio: '52/48', tbRatio: '49/51', score: 93 }], trend: 'improving', avgScore: 92 },
];

// ---- Service Functions ----

export function getMeasurements(): CenteringMeasurement[] {
  return [...MOCK_MEASUREMENTS].sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
}

export function getSubGradeImpact(): SubGradeImpact[] {
  return [...MOCK_SUBGRADE_IMPACT].sort((a, b) => {
    const impactOrder = { none: 0, minor: 1, moderate: 2, severe: 3 };
    return impactOrder[b.centeringImpactOnFinal] - impactOrder[a.centeringImpactOnFinal];
  });
}

export function getGradeEstimates(): GradeEstimate[] {
  return [...MOCK_GRADE_ESTIMATES].sort((a, b) => b.confidence - a.confidence);
}

export function getHistory(): CenteringHistory[] {
  return [...MOCK_HISTORY].sort((a, b) => b.avgScore - a.avgScore);
}

export function getCenteringStats(): { totalScanned: number; avgScore: number; psa10Eligible: number; severeCount: number; topCard: string } {
  const measurements = MOCK_MEASUREMENTS;
  const total = measurements.length;
  const avgScore = Math.round(measurements.reduce((sum, m) => sum + m.overallCenteringScore, 0) / total * 10) / 10;
  const psa10Eligible = measurements.filter((m) => m.meetsThreshold.psa10).length;
  const severeCount = MOCK_SUBGRADE_IMPACT.filter((s) => s.centeringImpactOnFinal === 'severe').length;
  const best = [...measurements].sort((a, b) => b.overallCenteringScore - a.overallCenteringScore)[0];
  return { totalScanned: total, avgScore, psa10Eligible, severeCount, topCard: `${best.player} — ${best.cardDescription}` };
}

export default {
  getMeasurements,
  getSubGradeImpact,
  getGradeEstimates,
  getHistory,
  getCenteringStats,
};
