// Grade Inflation Detector Service

// ---- Types ----

export interface GraderStandardsDrift {
  grader: 'PSA' | 'BGS' | 'SGC';
  year: number;
  submissionsK: number; // thousands
  psa10Rate: number; // percentage
  psa9Rate: number;
  driftIndex: number; // 100 = baseline 2015
  trend: 'inflating' | 'deflating' | 'stable';
}

export interface CardCategoryInflation {
  category: string;
  psa10RateChange: number; // % change from 5yr avg
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  implication: string;
}

export interface GradeArbitrageOpportunity {
  id: string;
  cardName: string;
  currentGrade: string;
  graderStandards: string;
  opportunityType: 'crossover' | 'resubmit' | 'hold';
  expectedGain: number;
  confidence: number;
  reasoning: string;
}

export interface PopGrowthAlert {
  id: string;
  cardSetName: string;
  sport: string;
  grader: string;
  popGrowthRate: number; // % per year
  currentPop: number;
  priceImpact: number;
  alertLevel: string;
}

export interface InflationSummary {
  overallDriftIndex: number;
  mostInflatedCategory: string;
  safestCategory: string;
  recommendedAction: string;
  lastUpdated: string;
}

// ---- Data Generation ----

const PSA_DRIFT_DATA: GraderStandardsDrift[] = [
  { grader: 'PSA', year: 2015, submissionsK: 1820, psa10Rate: 28.2, psa9Rate: 31.4, driftIndex: 100, trend: 'stable' },
  { grader: 'PSA', year: 2016, submissionsK: 2140, psa10Rate: 29.1, psa9Rate: 31.8, driftIndex: 103, trend: 'stable' },
  { grader: 'PSA', year: 2017, submissionsK: 2680, psa10Rate: 30.4, psa9Rate: 32.1, driftIndex: 108, trend: 'stable' },
  { grader: 'PSA', year: 2018, submissionsK: 3210, psa10Rate: 31.7, psa9Rate: 32.5, driftIndex: 112, trend: 'inflating' },
  { grader: 'PSA', year: 2019, submissionsK: 4350, psa10Rate: 33.2, psa9Rate: 33.0, driftIndex: 118, trend: 'inflating' },
  { grader: 'PSA', year: 2020, submissionsK: 7820, psa10Rate: 35.8, psa9Rate: 33.4, driftIndex: 127, trend: 'inflating' },
  { grader: 'PSA', year: 2021, submissionsK: 12400, psa10Rate: 38.1, psa9Rate: 33.9, driftIndex: 135, trend: 'inflating' },
  { grader: 'PSA', year: 2022, submissionsK: 9800, psa10Rate: 39.4, psa9Rate: 34.1, driftIndex: 140, trend: 'inflating' },
  { grader: 'PSA', year: 2023, submissionsK: 8600, psa10Rate: 40.7, psa9Rate: 34.5, driftIndex: 144, trend: 'inflating' },
  { grader: 'PSA', year: 2024, submissionsK: 9200, psa10Rate: 42.3, psa9Rate: 34.8, driftIndex: 150, trend: 'inflating' },
];

const BGS_DRIFT_DATA: GraderStandardsDrift[] = [
  { grader: 'BGS', year: 2015, submissionsK: 820, psa10Rate: 12.1, psa9Rate: 28.3, driftIndex: 100, trend: 'stable' },
  { grader: 'BGS', year: 2016, submissionsK: 940, psa10Rate: 12.4, psa9Rate: 28.7, driftIndex: 102, trend: 'stable' },
  { grader: 'BGS', year: 2017, submissionsK: 1100, psa10Rate: 12.8, psa9Rate: 29.1, driftIndex: 106, trend: 'stable' },
  { grader: 'BGS', year: 2018, submissionsK: 1350, psa10Rate: 13.2, psa9Rate: 29.6, driftIndex: 109, trend: 'stable' },
  { grader: 'BGS', year: 2019, submissionsK: 1820, psa10Rate: 13.9, psa9Rate: 30.2, driftIndex: 115, trend: 'inflating' },
  { grader: 'BGS', year: 2020, submissionsK: 3400, psa10Rate: 14.6, psa9Rate: 30.8, driftIndex: 121, trend: 'inflating' },
  { grader: 'BGS', year: 2021, submissionsK: 5200, psa10Rate: 15.1, psa9Rate: 31.4, driftIndex: 125, trend: 'inflating' },
  { grader: 'BGS', year: 2022, submissionsK: 4100, psa10Rate: 15.4, psa9Rate: 31.9, driftIndex: 127, trend: 'stable' },
  { grader: 'BGS', year: 2023, submissionsK: 3800, psa10Rate: 15.7, psa9Rate: 32.2, driftIndex: 130, trend: 'inflating' },
  { grader: 'BGS', year: 2024, submissionsK: 4200, psa10Rate: 16.0, psa9Rate: 32.6, driftIndex: 132, trend: 'inflating' },
];

const SGC_DRIFT_DATA: GraderStandardsDrift[] = [
  { grader: 'SGC', year: 2015, submissionsK: 310, psa10Rate: 22.5, psa9Rate: 29.8, driftIndex: 100, trend: 'stable' },
  { grader: 'SGC', year: 2016, submissionsK: 360, psa10Rate: 22.8, psa9Rate: 30.1, driftIndex: 101, trend: 'stable' },
  { grader: 'SGC', year: 2017, submissionsK: 420, psa10Rate: 23.2, psa9Rate: 30.5, driftIndex: 103, trend: 'stable' },
  { grader: 'SGC', year: 2018, submissionsK: 510, psa10Rate: 24.1, psa9Rate: 31.0, driftIndex: 107, trend: 'stable' },
  { grader: 'SGC', year: 2019, submissionsK: 680, psa10Rate: 25.3, psa9Rate: 31.6, driftIndex: 112, trend: 'inflating' },
  { grader: 'SGC', year: 2020, submissionsK: 1420, psa10Rate: 27.8, psa9Rate: 32.4, driftIndex: 124, trend: 'inflating' },
  { grader: 'SGC', year: 2021, submissionsK: 2800, psa10Rate: 29.4, psa9Rate: 33.1, driftIndex: 131, trend: 'inflating' },
  { grader: 'SGC', year: 2022, submissionsK: 2400, psa10Rate: 30.1, psa9Rate: 33.5, driftIndex: 134, trend: 'stable' },
  { grader: 'SGC', year: 2023, submissionsK: 2200, psa10Rate: 30.6, psa9Rate: 33.8, driftIndex: 136, trend: 'stable' },
  { grader: 'SGC', year: 2024, submissionsK: 2600, psa10Rate: 31.4, psa9Rate: 34.2, driftIndex: 140, trend: 'inflating' },
];

const CARD_CATEGORY_INFLATION: CardCategoryInflation[] = [
  {
    category: 'Modern Rookies (2018-Present)',
    psa10RateChange: 18.4,
    riskLevel: 'critical',
    implication: 'PSA 10 rates up 18% from 5yr avg — scarcity premium eroding rapidly. Existing 10s face significant downward price pressure.',
  },
  {
    category: 'Chrome Refractors',
    psa10RateChange: 14.2,
    riskLevel: 'high',
    implication: 'Refractor population growing 22% YoY. Near-term correction likely as market absorbs new supply.',
  },
  {
    category: 'Prizm Base Cards',
    psa10RateChange: 12.7,
    riskLevel: 'high',
    implication: 'Mass-market submission surge diluting gem mint exclusivity. Consider holding BGS 10 Blacks over PSA 10s.',
  },
  {
    category: 'Vintage Post-War (1950-1979)',
    psa10RateChange: 2.1,
    riskLevel: 'low',
    implication: 'Standards essentially unchanged. Physical card condition is still the limiting factor, not grader leniency.',
  },
  {
    category: 'Vintage Pre-War (Pre-1945)',
    psa10RateChange: -0.8,
    riskLevel: 'low',
    implication: 'Slightly tightening standards — existing high grades actually gaining relative scarcity. Safe hold.',
  },
  {
    category: 'Autograph Rookies',
    psa10RateChange: 8.3,
    riskLevel: 'medium',
    implication: 'Auto grade inflation moderate. PSA 10 autos still command premium but gap vs PSA 9 narrowing.',
  },
  {
    category: 'Short Print Variations',
    psa10RateChange: 10.9,
    riskLevel: 'medium',
    implication: 'SP variants seeing more generous centering standards. Previously borderline submissions now clearing.',
  },
  {
    category: 'Basketball Stars (2003-2010)',
    psa10RateChange: 4.6,
    riskLevel: 'low',
    implication: 'Moderate inflation but collector demand absorption keeps prices stable. Minor scarcity dilution.',
  },
  {
    category: 'Football Prospects',
    psa10RateChange: 15.8,
    riskLevel: 'critical',
    implication: 'Critical inflation zone. Football modern prospects have worst inflation rate after rookie cards. Exit window closing.',
  },
  {
    category: 'Hockey Young Guns',
    psa10RateChange: 6.2,
    riskLevel: 'medium',
    implication: 'Moderate drift. Canadian market keeps demand stable but inflation is real. Monitor closely in 2025.',
  },
];

const ARBITRAGE_OPPORTUNITIES: GradeArbitrageOpportunity[] = [
  {
    id: 'arb-001',
    cardName: '2020 Topps Chrome Justin Herbert PSA 9',
    currentGrade: 'PSA 9',
    graderStandards: 'SGC is grading 2020 Chrome more generously than PSA currently',
    opportunityType: 'crossover',
    expectedGain: 340,
    confidence: 78,
    reasoning: 'SGC 10 commands $890 vs PSA 9 $550. SGC has 31% gem rate on 2020 Chrome vs PSA 27%. Crossover probability high on centering-heavy PSA 9s.',
  },
  {
    id: 'arb-002',
    cardName: '2018 Prizm Luka Doncic RC PSA 8',
    currentGrade: 'PSA 8',
    graderStandards: 'PSA resubmit window — standards shifted in 2021',
    opportunityType: 'resubmit',
    expectedGain: 1200,
    confidence: 62,
    reasoning: 'Cards graded PSA 8 in 2018-2019 have 19% upgrade rate when resubmitted today due to standard drift. PSA 9 value is $2,100 vs PSA 8 $900.',
  },
  {
    id: 'arb-003',
    cardName: '1986 Fleer Michael Jordan BGS 8.5',
    currentGrade: 'BGS 8.5',
    graderStandards: 'Vintage standards stable — BGS strict as ever on pre-1990',
    opportunityType: 'hold',
    expectedGain: 0,
    confidence: 89,
    reasoning: 'BGS holds strict standards on vintage. No crossover advantage. Hold existing grade — BGS 8.5 on Jordan is already a premium position.',
  },
  {
    id: 'arb-004',
    cardName: '2021 Topps Chrome Julio Rodriguez Auto PSA 9',
    currentGrade: 'PSA 9',
    graderStandards: 'PSA inflating on 2021-2023 Chrome autos',
    opportunityType: 'resubmit',
    expectedGain: 280,
    confidence: 71,
    reasoning: 'PSA 10 auto rate on 2021-23 Chrome is up 11% from 2022. Borderline PSA 9 autos have real upgrade potential. Gain spread PSA 9 to 10 is $280.',
  },
  {
    id: 'arb-005',
    cardName: '2022 Bowman Chrome Gunnar Henderson SGC 9',
    currentGrade: 'SGC 9',
    graderStandards: 'PSA more lenient on 2022 Bowman than SGC',
    opportunityType: 'crossover',
    expectedGain: 195,
    confidence: 68,
    reasoning: 'PSA 10 achieves $480 vs SGC 9 $285. PSA gem rate on 2022 Bowman Chrome 8% higher than SGC. Crossover to PSA 10 viable on clean copies.',
  },
  {
    id: 'arb-006',
    cardName: '2019 Prizm Ja Morant RC PSA 9',
    currentGrade: 'PSA 9',
    graderStandards: 'Stable — no drift advantage',
    opportunityType: 'hold',
    expectedGain: 0,
    confidence: 82,
    reasoning: '2019 Prizm standards have been consistent. PSA 9 to 10 upgrade unlikely to justify submission cost. Hold and wait for player appreciation.',
  },
];

const POP_GROWTH_ALERTS: PopGrowthAlert[] = [
  {
    id: 'pop-001',
    cardSetName: '2020 Topps Chrome Football',
    sport: 'Football',
    grader: 'PSA',
    popGrowthRate: 34.2,
    currentPop: 142800,
    priceImpact: -18,
    alertLevel: 'critical',
  },
  {
    id: 'pop-002',
    cardSetName: '2021 Prizm Basketball',
    sport: 'Basketball',
    grader: 'PSA',
    popGrowthRate: 28.7,
    currentPop: 98400,
    priceImpact: -12,
    alertLevel: 'high',
  },
  {
    id: 'pop-003',
    cardSetName: '2018 Topps Chrome Baseball',
    sport: 'Baseball',
    grader: 'BGS',
    popGrowthRate: 11.4,
    currentPop: 22100,
    priceImpact: -4,
    alertLevel: 'medium',
  },
  {
    id: 'pop-004',
    cardSetName: '2022 Bowman Chrome Baseball',
    sport: 'Baseball',
    grader: 'PSA',
    popGrowthRate: 41.8,
    currentPop: 187600,
    priceImpact: -22,
    alertLevel: 'critical',
  },
  {
    id: 'pop-005',
    cardSetName: '2020 Panini Prizm Football',
    sport: 'Football',
    grader: 'SGC',
    popGrowthRate: 52.3,
    currentPop: 64200,
    priceImpact: -28,
    alertLevel: 'critical',
  },
  {
    id: 'pop-006',
    cardSetName: '1952 Topps Baseball',
    sport: 'Baseball',
    grader: 'PSA',
    popGrowthRate: 2.1,
    currentPop: 8400,
    priceImpact: 3,
    alertLevel: 'low',
  },
  {
    id: 'pop-007',
    cardSetName: '2003-04 Topps Chrome Basketball',
    sport: 'Basketball',
    grader: 'PSA',
    popGrowthRate: 7.8,
    currentPop: 31200,
    priceImpact: -3,
    alertLevel: 'low',
  },
  {
    id: 'pop-008',
    cardSetName: '2019 Topps Chrome Sapphire Baseball',
    sport: 'Baseball',
    grader: 'BGS',
    popGrowthRate: 18.9,
    currentPop: 14800,
    priceImpact: -8,
    alertLevel: 'medium',
  },
];

const INFLATION_SUMMARY: InflationSummary = {
  overallDriftIndex: 147,
  mostInflatedCategory: 'Football Prospects',
  safestCategory: 'Vintage Pre-War (Pre-1945)',
  recommendedAction: 'Reduce exposure to modern football and baseball rookie PSA 10s. Rotate into vintage pre-war and BGS Black label equivalents where inflation is absent.',
  lastUpdated: '2024-12-15',
};

// ---- Exports ----

export function getGraderDriftData(): GraderStandardsDrift[] {
  return [...PSA_DRIFT_DATA, ...BGS_DRIFT_DATA, ...SGC_DRIFT_DATA];
}

export function getDriftByGrader(grader: 'PSA' | 'BGS' | 'SGC'): GraderStandardsDrift[] {
  return getGraderDriftData().filter(d => d.grader === grader);
}

export function getAllDriftByYear(): { year: number; PSA: number; BGS: number; SGC: number }[] {
  return PSA_DRIFT_DATA.map((psa, i) => ({
    year: psa.year,
    PSA: psa.psa10Rate,
    BGS: BGS_DRIFT_DATA[i].psa10Rate,
    SGC: SGC_DRIFT_DATA[i].psa10Rate,
  }));
}

export function getCardCategoryInflation(): CardCategoryInflation[] {
  return [...CARD_CATEGORY_INFLATION].sort((a, b) => b.psa10RateChange - a.psa10RateChange);
}

export function getArbitrageOpportunities(): GradeArbitrageOpportunity[] {
  return ARBITRAGE_OPPORTUNITIES;
}

export function getPopGrowthAlerts(): PopGrowthAlert[] {
  return [...POP_GROWTH_ALERTS].sort((a, b) => b.popGrowthRate - a.popGrowthRate);
}

export function getInflationSummary(): InflationSummary {
  return INFLATION_SUMMARY;
}
