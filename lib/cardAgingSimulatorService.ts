// Phase 247 — Card Aging Simulator Service
// Projects how cards degrade over time based on storage conditions

// ---- Types ----

export interface StorageCondition {
  type: 'ideal' | 'average' | 'poor';
  temperature: number;
  humidity: number;
  uvExposure: number;
  description: string;
}

export interface AgingSimulation {
  id: string;
  card: string;
  player: string;
  currentGrade: number;
  storageCondition: 'ideal' | 'average' | 'poor';
  projectedGrade1yr: number;
  projectedGrade5yr: number;
  projectedGrade10yr: number;
  degradationRate: number;
  recommendations: string[];
}

// ---- Mock Data ----

const storageConditions: StorageCondition[] = [
  {
    type: 'ideal',
    temperature: 68,
    humidity: 40,
    uvExposure: 0,
    description: 'Climate-controlled vault with zero UV exposure, acid-free holders, and stable humidity',
  },
  {
    type: 'average',
    temperature: 72,
    humidity: 55,
    uvExposure: 15,
    description: 'Indoor room storage with penny sleeves and toploaders, moderate temperature fluctuations',
  },
  {
    type: 'poor',
    temperature: 80,
    humidity: 70,
    uvExposure: 60,
    description: 'Uncontrolled environment such as garage or attic with direct sunlight and high humidity',
  },
];

const agingSimulations: AgingSimulation[] = [
  {
    id: 'as-001',
    card: '2023 Bowman Chrome 1st Auto',
    player: 'Jackson Holliday',
    currentGrade: 10,
    storageCondition: 'ideal',
    projectedGrade1yr: 10,
    projectedGrade5yr: 9.5,
    projectedGrade10yr: 9.5,
    degradationRate: 0.005,
    recommendations: [
      'Maintain current vault storage',
      'Re-case in updated PSA holder if available',
      'Monitor for holder yellowing annually',
    ],
  },
  {
    id: 'as-002',
    card: '1986 Fleer Michael Jordan RC #57',
    player: 'Michael Jordan',
    currentGrade: 8,
    storageCondition: 'average',
    projectedGrade1yr: 7.5,
    projectedGrade5yr: 7,
    projectedGrade10yr: 6,
    degradationRate: 0.035,
    recommendations: [
      'Upgrade to climate-controlled storage immediately',
      'Use UV-protective holder to prevent further yellowing',
      'Avoid handling without cotton gloves',
    ],
  },
  {
    id: 'as-003',
    card: '2018 Panini Prizm Silver Luka Doncic RC',
    player: 'Luka Doncic',
    currentGrade: 9.5,
    storageCondition: 'ideal',
    projectedGrade1yr: 9.5,
    projectedGrade5yr: 9.5,
    projectedGrade10yr: 9,
    degradationRate: 0.008,
    recommendations: [
      'Continue vault storage protocol',
      'Consider submitting for crossover if BGS holder',
      'Inspect seal integrity every 2 years',
    ],
  },
  {
    id: 'as-004',
    card: '2001 Topps Chrome Refractor Tom Brady RC',
    player: 'Tom Brady',
    currentGrade: 9,
    storageCondition: 'poor',
    projectedGrade1yr: 8,
    projectedGrade5yr: 6.5,
    projectedGrade10yr: 4,
    degradationRate: 0.065,
    recommendations: [
      'Relocate to climate-controlled environment urgently',
      'Chrome cards are highly susceptible to humidity damage',
      'Surface micro-scratching accelerates in high-UV conditions',
      'Reholder in a sealed UV-resistant case immediately',
    ],
  },
  {
    id: 'as-005',
    card: '2020 Panini National Treasures Justin Herbert RPA',
    player: 'Justin Herbert',
    currentGrade: 9,
    storageCondition: 'average',
    projectedGrade1yr: 9,
    projectedGrade5yr: 8.5,
    projectedGrade10yr: 7.5,
    degradationRate: 0.025,
    recommendations: [
      'Patch cards are vulnerable to adhesive degradation — upgrade storage',
      'Keep away from heat sources to preserve patch quality',
      'Consider safe deposit box for long-term holding',
    ],
  },
  {
    id: 'as-006',
    card: '1952 Topps Mickey Mantle #311',
    player: 'Mickey Mantle',
    currentGrade: 5,
    storageCondition: 'ideal',
    projectedGrade1yr: 5,
    projectedGrade5yr: 5,
    projectedGrade10yr: 4.5,
    degradationRate: 0.01,
    recommendations: [
      'Vintage cardboard is inherently fragile — maintain current vault conditions',
      'Avoid re-grading unless pursuing registry set',
      'Ensure holder is modern generation to prevent off-gassing',
    ],
  },
];

// ---- Service Functions ----

export function getAgingSimulations(): AgingSimulation[] {
  return [...agingSimulations];
}

export function getStorageConditions(): StorageCondition[] {
  return [...storageConditions];
}

export function getAgingStats() {
  const totalSimulations = agingSimulations.length;
  const avgDegradationRate =
    Math.round(
      (agingSimulations.reduce((sum, s) => sum + s.degradationRate, 0) / totalSimulations) * 1000
    ) / 1000;
  const atRiskCards = agingSimulations.filter((s) => s.degradationRate > 0.03).length;
  const perfectGrades = agingSimulations.filter((s) => s.currentGrade === 10).length;
  const conditionBreakdown = agingSimulations.reduce<Record<string, number>>((acc, s) => {
    acc[s.storageCondition] = (acc[s.storageCondition] || 0) + 1;
    return acc;
  }, {});
  const avgProjected10yr =
    Math.round(
      (agingSimulations.reduce((sum, s) => sum + s.projectedGrade10yr, 0) / totalSimulations) * 10
    ) / 10;

  return {
    totalSimulations,
    avgDegradationRate,
    atRiskCards,
    perfectGrades,
    conditionBreakdown,
    avgProjected10yr,
  };
}

const cardAgingSimulatorService = {
  getAgingSimulations,
  getStorageConditions,
  getAgingStats,
};

export default cardAgingSimulatorService;
