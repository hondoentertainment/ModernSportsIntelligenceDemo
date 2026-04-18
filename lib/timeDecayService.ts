// Time Decay Modeler Service
// Models how card values decay over time from peak moments (rookie seasons, MVPs, championships)

export interface DecayModel {
  id: string;
  cardName: string;
  category: string;
  peakDate: string;
  peakValue: number;
  currentValue: number;
  decayRate: number;
  halfLife: number;
  decayType: 'exponential' | 'linear' | 'stepped' | 'logarithmic';
  floorValue: number;
  yearsToFloor: number;
}

export interface MilestoneImpact {
  id: string;
  milestone: string;
  category: string;
  avgPremiumAtMilestone: number;
  avgDecayAfter: number;
  typicalDuration: number;
  examples: string[];
  currentRelevance: 'high' | 'medium' | 'low';
}

export interface DecayCurvePoint {
  monthsFromPeak: number;
  percentOfPeak: number;
  category: string;
}

export interface DecayForecast {
  id: string;
  cardName: string;
  currentValue: number;
  forecast3m: number;
  forecast6m: number;
  forecast1y: number;
  forecast2y: number;
  decayScenario: 'accelerating' | 'stable' | 'decelerating' | 'bottoming';
  confidence: number;
}

export interface DecaySummary {
  avgDecayRate: number;
  fastestDecay: { card: string; rate: number };
  slowestDecay: { card: string; rate: number };
  cardsNearFloor: number;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const decayModels: DecayModel[] = [
  { id: 'dm-001', cardName: '2018 Luka Doncic Prizm Silver PSA 10', category: 'Rookie Hype', peakDate: '2021-02-14', peakValue: 14500, currentValue: 3200, decayRate: 32.4, halfLife: 280, decayType: 'exponential', floorValue: 1800, yearsToFloor: 1.8 },
  { id: 'dm-002', cardName: '2019 Zion Williamson National Treasures RPA /99', category: 'Rookie Hype', peakDate: '2020-10-18', peakValue: 78000, currentValue: 11500, decayRate: 45.2, halfLife: 195, decayType: 'exponential', floorValue: 6000, yearsToFloor: 1.2 },
  { id: 'dm-003', cardName: '2021 Shohei Ohtani Topps Chrome Gold /50', category: 'MVP Season', peakDate: '2023-11-16', peakValue: 22000, currentValue: 14800, decayRate: 18.5, halfLife: 520, decayType: 'logarithmic', floorValue: 8500, yearsToFloor: 3.4 },
  { id: 'dm-004', cardName: '2003 LeBron James Topps Chrome Refractor PSA 10', category: 'Championship', peakDate: '2021-01-24', peakValue: 225000, currentValue: 78000, decayRate: 22.8, halfLife: 410, decayType: 'logarithmic', floorValue: 45000, yearsToFloor: 2.8 },
  { id: 'dm-005', cardName: '2017 Patrick Mahomes Prizm Silver PSA 10', category: 'Championship', peakDate: '2024-02-11', peakValue: 18500, currentValue: 12200, decayRate: 15.6, halfLife: 610, decayType: 'linear', floorValue: 7500, yearsToFloor: 3.1 },
  { id: 'dm-006', cardName: '2018 Trae Young Prizm Silver PSA 10', category: 'Rookie Hype', peakDate: '2021-06-29', peakValue: 3800, currentValue: 520, decayRate: 48.7, halfLife: 165, decayType: 'exponential', floorValue: 280, yearsToFloor: 0.6 },
  { id: 'dm-007', cardName: '2020 Justin Herbert Optic Rated Rookie PSA 10', category: 'Rookie Hype', peakDate: '2021-09-12', peakValue: 4200, currentValue: 680, decayRate: 42.1, halfLife: 210, decayType: 'exponential', floorValue: 350, yearsToFloor: 0.9 },
  { id: 'dm-008', cardName: '1986 Michael Jordan Fleer PSA 10', category: 'Legacy', peakDate: '2021-04-18', peakValue: 738000, currentValue: 420000, decayRate: 10.2, halfLife: 980, decayType: 'stepped', floorValue: 280000, yearsToFloor: 4.5 },
  { id: 'dm-009', cardName: '2011 Mike Trout Update PSA 10', category: 'MVP Season', peakDate: '2020-08-15', peakValue: 115000, currentValue: 42000, decayRate: 19.4, halfLife: 480, decayType: 'stepped', floorValue: 28000, yearsToFloor: 2.2 },
  { id: 'dm-010', cardName: '2014 Aaron Judge Bowman Chrome Auto PSA 10', category: 'Record Season', peakDate: '2022-10-04', peakValue: 9800, currentValue: 4100, decayRate: 25.3, halfLife: 360, decayType: 'linear', floorValue: 2200, yearsToFloor: 2.0 },
];

const milestoneImpacts: MilestoneImpact[] = [
  { id: 'mi-001', milestone: 'Rookie Season', category: 'Career Start', avgPremiumAtMilestone: 340, avgDecayAfter: 38.5, typicalDuration: 18, examples: ['Victor Wembanyama 2023', 'Anthony Edwards 2020', 'Chet Holmgren 2023'], currentRelevance: 'high' },
  { id: 'mi-002', milestone: 'First All-Star', category: 'Early Career', avgPremiumAtMilestone: 85, avgDecayAfter: 14.2, typicalDuration: 6, examples: ['Tyrese Haliburton 2023', 'Paolo Banchero 2024', 'Scottie Barnes 2024'], currentRelevance: 'high' },
  { id: 'mi-003', milestone: 'MVP Award', category: 'Peak Performance', avgPremiumAtMilestone: 155, avgDecayAfter: 22.8, typicalDuration: 10, examples: ['Nikola Jokic 2021', 'Shohei Ohtani 2023', 'Lamar Jackson 2019'], currentRelevance: 'high' },
  { id: 'mi-004', milestone: 'Championship Win', category: 'Peak Performance', avgPremiumAtMilestone: 120, avgDecayAfter: 18.4, typicalDuration: 8, examples: ['Giannis Antetokounmpo 2021', 'Stephen Curry 2022', 'Nikola Jokic 2023'], currentRelevance: 'medium' },
  { id: 'mi-005', milestone: 'HOF Induction', category: 'Legacy', avgPremiumAtMilestone: 65, avgDecayAfter: 8.1, typicalDuration: 4, examples: ['Derek Jeter 2020', 'David Ortiz 2022', 'Tim Duncan 2020'], currentRelevance: 'medium' },
  { id: 'mi-006', milestone: 'Jersey Retirement', category: 'Legacy', avgPremiumAtMilestone: 42, avgDecayAfter: 6.5, typicalDuration: 3, examples: ['Kobe Bryant 2017', 'Dirk Nowitzki 2022', 'Dwyane Wade 2020'], currentRelevance: 'low' },
  { id: 'mi-007', milestone: 'Retirement', category: 'Career End', avgPremiumAtMilestone: 55, avgDecayAfter: 12.8, typicalDuration: 5, examples: ['Tom Brady 2023', 'Roger Federer 2022', 'Serena Williams 2022'], currentRelevance: 'medium' },
  { id: 'mi-008', milestone: 'Posthumous', category: 'Legacy', avgPremiumAtMilestone: 210, avgDecayAfter: 5.2, typicalDuration: 24, examples: ['Kobe Bryant 2020', 'Jose Fernandez 2016', 'Tyler Skaggs 2019'], currentRelevance: 'low' },
];

function generateDecayCurvePoints(): DecayCurvePoint[] {
  const points: DecayCurvePoint[] = [];

  for (let month = 0; month <= 24; month++) {
    // Exponential: rapid initial drop that slows over time
    points.push({
      monthsFromPeak: month,
      percentOfPeak: Math.round(100 * Math.exp(-0.08 * month)),
      category: 'exponential',
    });
    // Linear: steady constant-rate decline
    points.push({
      monthsFromPeak: month,
      percentOfPeak: Math.max(20, Math.round(100 - 3.2 * month)),
      category: 'linear',
    });
    // Stepped: holds at plateaus then drops in stages
    const steppedVal = month < 4 ? 100 : month < 8 ? 78 : month < 14 ? 55 : month < 20 ? 38 : 28;
    points.push({
      monthsFromPeak: month,
      percentOfPeak: steppedVal,
      category: 'stepped',
    });
    // Logarithmic: fast initial drop then flattens significantly
    points.push({
      monthsFromPeak: month,
      percentOfPeak: Math.max(35, Math.round(100 - 28 * Math.log(month + 1))),
      category: 'logarithmic',
    });
  }

  return points;
}

const decayCurvePoints: DecayCurvePoint[] = generateDecayCurvePoints();

const decayForecasts: DecayForecast[] = [
  { id: 'df-001', cardName: '2018 Luka Doncic Prizm Silver PSA 10', currentValue: 3200, forecast3m: 2850, forecast6m: 2540, forecast1y: 2100, forecast2y: 1800, decayScenario: 'decelerating', confidence: 78 },
  { id: 'df-002', cardName: '2019 Zion Williamson National Treasures RPA /99', currentValue: 11500, forecast3m: 9800, forecast6m: 8200, forecast1y: 6500, forecast2y: 6000, decayScenario: 'bottoming', confidence: 72 },
  { id: 'df-003', cardName: '2021 Shohei Ohtani Topps Chrome Gold /50', currentValue: 14800, forecast3m: 14100, forecast6m: 13200, forecast1y: 11600, forecast2y: 9500, decayScenario: 'stable', confidence: 81 },
  { id: 'df-004', cardName: '2003 LeBron James Topps Chrome Refractor PSA 10', currentValue: 78000, forecast3m: 74000, forecast6m: 69500, forecast1y: 61000, forecast2y: 52000, decayScenario: 'stable', confidence: 85 },
  { id: 'df-005', cardName: '2017 Patrick Mahomes Prizm Silver PSA 10', currentValue: 12200, forecast3m: 11600, forecast6m: 10900, forecast1y: 9800, forecast2y: 8400, decayScenario: 'stable', confidence: 79 },
  { id: 'df-006', cardName: '2018 Trae Young Prizm Silver PSA 10', currentValue: 520, forecast3m: 420, forecast6m: 350, forecast1y: 290, forecast2y: 280, decayScenario: 'bottoming', confidence: 74 },
  { id: 'df-007', cardName: '1986 Michael Jordan Fleer PSA 10', currentValue: 420000, forecast3m: 410000, forecast6m: 395000, forecast1y: 365000, forecast2y: 320000, decayScenario: 'decelerating', confidence: 88 },
  { id: 'df-008', cardName: '2014 Aaron Judge Bowman Chrome Auto PSA 10', currentValue: 4100, forecast3m: 3700, forecast6m: 3300, forecast1y: 2800, forecast2y: 2300, decayScenario: 'accelerating', confidence: 68 },
];

// ── Getter Functions ─────────────────────────────────────────────────────────

export function getDecayModels(): DecayModel[] {
  return decayModels;
}

export function getMilestoneImpacts(): MilestoneImpact[] {
  return milestoneImpacts;
}

export function getDecayCurvePoints(): DecayCurvePoint[] {
  return decayCurvePoints;
}

export function getDecayForecasts(): DecayForecast[] {
  return decayForecasts;
}

export function getDecaySummary(): DecaySummary {
  const rates = decayModels.map(m => m.decayRate);
  const avgDecayRate = parseFloat((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1));

  const fastest = decayModels.reduce((a, b) => (a.decayRate > b.decayRate ? a : b));
  const slowest = decayModels.reduce((a, b) => (a.decayRate < b.decayRate ? a : b));

  const cardsNearFloor = decayModels.filter(m => {
    const distToFloor = m.currentValue - m.floorValue;
    const totalDrop = m.peakValue - m.floorValue;
    return totalDrop > 0 && distToFloor / totalDrop < 0.15;
  }).length;

  return {
    avgDecayRate,
    fastestDecay: { card: fastest.cardName, rate: fastest.decayRate },
    slowestDecay: { card: slowest.cardName, rate: slowest.decayRate },
    cardsNearFloor,
  };
}
