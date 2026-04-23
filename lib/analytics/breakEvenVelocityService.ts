// @ts-nocheck
// Break-Even Velocity Calculator Service
// Calculates break-even TIME (not just price) factoring holding costs,
// opportunity cost, insurance, and storage per day.

export interface HoldingCost {
  category: 'storage' | 'insurance' | 'opportunity' | 'grading' | 'shipping' | 'platform_fees';
  label: string;
  dailyRate: number;
  monthlyRate: number;
  isRecurring: boolean;
  description: string;
}

export interface CostBreakdown {
  cardId: string;
  storageCostPerDay: number;
  insuranceCostPerDay: number;
  opportunityCostPerDay: number;
  gradingAmortizedPerDay: number;
  shippingAmortizedPerDay: number;
  platformFeesPerDay: number;
  totalDailyCost: number;
  totalCostToDate: number;
  costByCategory: HoldingCost[];
}

export interface OpportunityCost {
  annualRate: number;
  dailyRate: number;
  capitalDeployed: number;
  dailyOpportunityCost: number;
  cumulativeOpportunityCost: number;
  alternativeInvestment: string;
  alternativeReturn: number;
}

export interface BreakEvenAnalysis {
  cardId: string;
  cardName: string;
  playerName: string;
  sport: string;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  daysHeld: number;
  appreciationTotal: number;
  appreciationRate: number;
  dailyAppreciation: number;
  totalHoldingCosts: number;
  dailyHoldingCost: number;
  netDailyGain: number;
  breakEvenDays: number;
  breakEvenDate: string;
  daysUntilBreakEven: number;
  isProfitable: boolean;
  profitAfterCosts: number;
  roi: number;
  costBreakdown: CostBreakdown;
  status: 'profitable' | 'approaching' | 'far' | 'losing';
}

export interface VelocityScenario {
  id: string;
  name: string;
  description: string;
  storageTier: 'basic' | 'standard' | 'premium' | 'vault';
  storageDailyRate: number;
  insuranceLevel: 'none' | 'basic' | 'full' | 'premium';
  insuranceDailyRate: number;
  opportunityCostRate: number;
  breakEvenDays: number;
  breakEvenDate: string;
  monthlyCost: number;
  totalCostAtBreakEven: number;
  savingsVsBaseline: number;
}

export interface PortfolioCard {
  id: string;
  cardName: string;
  playerName: string;
  sport: string;
  year: string;
  set: string;
  grade: string;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  storageTier: 'basic' | 'standard' | 'premium' | 'vault';
  isInsured: boolean;
  insuranceLevel: 'none' | 'basic' | 'full' | 'premium';
  gradingFee: number;
  shippingCost: number;
}

export interface PortfolioBreakEvenSummary {
  totalCards: number;
  totalInvested: number;
  totalCurrentValue: number;
  totalHoldingCosts: number;
  totalNetProfit: number;
  averageBreakEvenDays: number;
  profitableCards: number;
  approachingCards: number;
  farCards: number;
  losingCards: number;
  fastestBreakEven: BreakEvenAnalysis | null;
  slowestBreakEven: BreakEvenAnalysis | null;
  dailyPortfolioCost: number;
  monthlyPortfolioCost: number;
  optimizationPotentialSavings: number;
}

// Storage rates by tier (per day)
const STORAGE_RATES: Record<string, number> = {
  basic: 0.05,
  standard: 0.25,
  premium: 0.75,
  vault: 2.00,
};

// Insurance rates by level (per day per $100 of value)
const INSURANCE_RATES: Record<string, number> = {
  none: 0,
  basic: 0.01,
  full: 0.15,
  premium: 0.50,
};

// Default opportunity cost (annual rate)
const DEFAULT_OPPORTUNITY_RATE = 0.07; // 7% annual

// Mock portfolio data
const mockPortfolioCards: PortfolioCard[] = [
  {
    id: 'bev-001',
    cardName: '2018 Prizm Silver #280',
    playerName: 'Luka Doncic',
    sport: 'Basketball',
    year: '2018',
    set: 'Panini Prizm',
    grade: 'PSA 10',
    purchasePrice: 4200,
    currentValue: 5850,
    purchaseDate: '2025-06-15',
    storageTier: 'vault',
    isInsured: true,
    insuranceLevel: 'premium',
    gradingFee: 150,
    shippingCost: 35,
  },
  {
    id: 'bev-002',
    cardName: '2020 Prizm Base #258',
    playerName: 'Justin Herbert',
    sport: 'Football',
    year: '2020',
    set: 'Panini Prizm',
    grade: 'PSA 10',
    purchasePrice: 320,
    currentValue: 445,
    purchaseDate: '2025-08-22',
    storageTier: 'standard',
    isInsured: true,
    insuranceLevel: 'basic',
    gradingFee: 50,
    shippingCost: 15,
  },
  {
    id: 'bev-003',
    cardName: '2011 Topps Update #US175',
    playerName: 'Mike Trout',
    sport: 'Baseball',
    year: '2011',
    set: 'Topps Update',
    grade: 'PSA 9',
    purchasePrice: 1850,
    currentValue: 2100,
    purchaseDate: '2025-11-01',
    storageTier: 'premium',
    isInsured: true,
    insuranceLevel: 'full',
    gradingFee: 100,
    shippingCost: 25,
  },
  {
    id: 'bev-004',
    cardName: '2018 Topps Chrome #150',
    playerName: 'Shohei Ohtani',
    sport: 'Baseball',
    year: '2018',
    set: 'Topps Chrome',
    grade: 'BGS 9.5',
    purchasePrice: 950,
    currentValue: 1380,
    purchaseDate: '2025-04-10',
    storageTier: 'premium',
    isInsured: true,
    insuranceLevel: 'full',
    gradingFee: 75,
    shippingCost: 20,
  },
  {
    id: 'bev-005',
    cardName: '2019 Mosaic #209',
    playerName: 'Ja Morant',
    sport: 'Basketball',
    year: '2019',
    set: 'Panini Mosaic',
    grade: 'PSA 10',
    purchasePrice: 275,
    currentValue: 310,
    purchaseDate: '2026-01-05',
    storageTier: 'basic',
    isInsured: false,
    insuranceLevel: 'none',
    gradingFee: 30,
    shippingCost: 12,
  },
  {
    id: 'bev-006',
    cardName: '2020 Topps Chrome #46',
    playerName: 'Yordan Alvarez',
    sport: 'Baseball',
    year: '2020',
    set: 'Topps Chrome',
    grade: 'PSA 10',
    purchasePrice: 180,
    currentValue: 165,
    purchaseDate: '2025-09-18',
    storageTier: 'basic',
    isInsured: false,
    insuranceLevel: 'none',
    gradingFee: 30,
    shippingCost: 10,
  },
  {
    id: 'bev-007',
    cardName: '2022 Bowman Chrome #BCP-1',
    playerName: 'Jackson Holliday',
    sport: 'Baseball',
    year: '2022',
    set: 'Bowman Chrome',
    grade: 'Raw',
    purchasePrice: 85,
    currentValue: 120,
    purchaseDate: '2025-12-10',
    storageTier: 'basic',
    isInsured: false,
    insuranceLevel: 'none',
    gradingFee: 0,
    shippingCost: 8,
  },
  {
    id: 'bev-008',
    cardName: '2018 Optic Rated Rookie #176',
    playerName: 'Lamar Jackson',
    sport: 'Football',
    year: '2018',
    set: 'Donruss Optic',
    grade: 'PSA 10',
    purchasePrice: 680,
    currentValue: 890,
    purchaseDate: '2025-07-03',
    storageTier: 'standard',
    isInsured: true,
    insuranceLevel: 'basic',
    gradingFee: 50,
    shippingCost: 15,
  },
  {
    id: 'bev-009',
    cardName: '2019 Prizm Draft #64',
    playerName: 'Zion Williamson',
    sport: 'Basketball',
    year: '2019',
    set: 'Prizm Draft',
    grade: 'PSA 9',
    purchasePrice: 420,
    currentValue: 355,
    purchaseDate: '2025-05-20',
    storageTier: 'standard',
    isInsured: true,
    insuranceLevel: 'basic',
    gradingFee: 50,
    shippingCost: 15,
  },
  {
    id: 'bev-010',
    cardName: '2023 Bowman #BP-100',
    playerName: 'Ethan Salas',
    sport: 'Baseball',
    year: '2023',
    set: 'Bowman',
    grade: 'Raw',
    purchasePrice: 45,
    currentValue: 72,
    purchaseDate: '2025-10-28',
    storageTier: 'basic',
    isInsured: false,
    insuranceLevel: 'none',
    gradingFee: 0,
    shippingCost: 5,
  },
  {
    id: 'bev-011',
    cardName: '2020 Select Concourse #44',
    playerName: 'Joe Burrow',
    sport: 'Football',
    year: '2020',
    set: 'Panini Select',
    grade: 'PSA 10',
    purchasePrice: 510,
    currentValue: 725,
    purchaseDate: '2025-03-15',
    storageTier: 'standard',
    isInsured: true,
    insuranceLevel: 'full',
    gradingFee: 50,
    shippingCost: 15,
  },
  {
    id: 'bev-012',
    cardName: '2003 Topps Chrome #221',
    playerName: 'LeBron James',
    sport: 'Basketball',
    year: '2003',
    set: 'Topps Chrome',
    grade: 'PSA 8',
    purchasePrice: 12500,
    currentValue: 14200,
    purchaseDate: '2025-01-20',
    storageTier: 'vault',
    isInsured: true,
    insuranceLevel: 'premium',
    gradingFee: 300,
    shippingCost: 50,
  },
];

function getDaysHeld(purchaseDate: string): number {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  return Math.max(1, Math.floor((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24)));
}

function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

function getInsuranceDailyRate(level: string, cardValue: number): number {
  const ratePerHundred = INSURANCE_RATES[level] || 0;
  return (cardValue / 100) * ratePerHundred / 30; // monthly rate converted to daily
}

function buildCostBreakdown(card: PortfolioCard, opportunityRate: number = DEFAULT_OPPORTUNITY_RATE): CostBreakdown {
  const daysHeld = getDaysHeld(card.purchaseDate);
  const storageCostPerDay = STORAGE_RATES[card.storageTier] || 0.05;
  const insuranceCostPerDay = getInsuranceDailyRate(card.insuranceLevel, card.currentValue);
  const opportunityCostPerDay = (card.purchasePrice * opportunityRate) / 365;
  const gradingAmortizedPerDay = card.gradingFee > 0 ? card.gradingFee / Math.max(daysHeld, 365) : 0;
  const shippingAmortizedPerDay = card.shippingCost / Math.max(daysHeld, 180);
  const platformFeesPerDay = card.currentValue * 0.0001; // ~3.65% annually

  const totalDailyCost =
    storageCostPerDay +
    insuranceCostPerDay +
    opportunityCostPerDay +
    gradingAmortizedPerDay +
    shippingAmortizedPerDay +
    platformFeesPerDay;

  const costByCategory: HoldingCost[] = [
    {
      category: 'storage',
      label: `Storage (${card.storageTier})`,
      dailyRate: storageCostPerDay,
      monthlyRate: storageCostPerDay * 30,
      isRecurring: true,
      description: `${card.storageTier.charAt(0).toUpperCase() + card.storageTier.slice(1)} tier storage`,
    },
    {
      category: 'insurance',
      label: `Insurance (${card.insuranceLevel})`,
      dailyRate: insuranceCostPerDay,
      monthlyRate: insuranceCostPerDay * 30,
      isRecurring: true,
      description: card.insuranceLevel === 'none' ? 'No coverage' : `${card.insuranceLevel} coverage on $${card.currentValue}`,
    },
    {
      category: 'opportunity',
      label: 'Opportunity Cost',
      dailyRate: opportunityCostPerDay,
      monthlyRate: opportunityCostPerDay * 30,
      isRecurring: true,
      description: `${(opportunityRate * 100).toFixed(1)}% annual rate on $${card.purchasePrice}`,
    },
    {
      category: 'grading',
      label: 'Grading Fee (amortized)',
      dailyRate: gradingAmortizedPerDay,
      monthlyRate: gradingAmortizedPerDay * 30,
      isRecurring: false,
      description: card.gradingFee > 0 ? `$${card.gradingFee} amortized over hold period` : 'Ungraded',
    },
    {
      category: 'shipping',
      label: 'Shipping (amortized)',
      dailyRate: shippingAmortizedPerDay,
      monthlyRate: shippingAmortizedPerDay * 30,
      isRecurring: false,
      description: `$${card.shippingCost} amortized over hold period`,
    },
    {
      category: 'platform_fees',
      label: 'Platform Fees',
      dailyRate: platformFeesPerDay,
      monthlyRate: platformFeesPerDay * 30,
      isRecurring: true,
      description: 'Marketplace and tracking fees',
    },
  ];

  return {
    cardId: card.id,
    storageCostPerDay,
    insuranceCostPerDay,
    opportunityCostPerDay,
    gradingAmortizedPerDay,
    shippingAmortizedPerDay,
    platformFeesPerDay,
    totalDailyCost,
    totalCostToDate: totalDailyCost * daysHeld,
    costByCategory,
  };
}

export function calculateBreakEven(
  cardId?: string,
  opportunityRate: number = DEFAULT_OPPORTUNITY_RATE
): BreakEvenAnalysis[] {
  const cards = cardId
    ? mockPortfolioCards.filter((c) => c.id === cardId)
    : mockPortfolioCards;

  return cards.map((card) => {
    const daysHeld = getDaysHeld(card.purchaseDate);
    const costBreakdown = buildCostBreakdown(card, opportunityRate);
    const appreciationTotal = card.currentValue - card.purchasePrice;
    const appreciationRate = appreciationTotal / card.purchasePrice;
    const dailyAppreciation = appreciationTotal / daysHeld;

    const totalCosts = costBreakdown.totalCostToDate + card.gradingFee + card.shippingCost;
    const netDailyGain = dailyAppreciation - costBreakdown.totalDailyCost;
    const profitAfterCosts = appreciationTotal - totalCosts;

    let breakEvenDays: number;
    if (netDailyGain <= 0) {
      breakEvenDays = dailyAppreciation > 0 ? Math.ceil(totalCosts / dailyAppreciation) * 2 : 9999;
    } else {
      const remainingToBreakEven = Math.max(0, totalCosts - appreciationTotal);
      breakEvenDays = remainingToBreakEven <= 0 ? 0 : Math.ceil(remainingToBreakEven / netDailyGain);
    }

    const daysUntilBreakEven = Math.max(0, breakEvenDays);
    const breakEvenDate = addDays(new Date(), daysUntilBreakEven);
    const isProfitable = profitAfterCosts > 0;

    let status: BreakEvenAnalysis['status'];
    if (isProfitable) {
      status = 'profitable';
    } else if (daysUntilBreakEven <= 90) {
      status = 'approaching';
    } else if (netDailyGain > 0) {
      status = 'far';
    } else {
      status = 'losing';
    }

    return {
      cardId: card.id,
      cardName: card.cardName,
      playerName: card.playerName,
      sport: card.sport,
      purchasePrice: card.purchasePrice,
      currentValue: card.currentValue,
      purchaseDate: card.purchaseDate,
      daysHeld,
      appreciationTotal,
      appreciationRate,
      dailyAppreciation,
      totalHoldingCosts: totalCosts,
      dailyHoldingCost: costBreakdown.totalDailyCost,
      netDailyGain,
      breakEvenDays: daysUntilBreakEven,
      breakEvenDate,
      daysUntilBreakEven,
      isProfitable,
      profitAfterCosts,
      roi: (profitAfterCosts / card.purchasePrice) * 100,
      costBreakdown,
      status,
    };
  });
}

export function getVelocityScenarios(cardId: string): VelocityScenario[] {
  const card = mockPortfolioCards.find((c) => c.id === cardId);
  if (!card) return [];

  const scenarios: Array<{
    id: string;
    name: string;
    description: string;
    storageTier: PortfolioCard['storageTier'];
    insuranceLevel: PortfolioCard['insuranceLevel'];
    oppRate: number;
  }> = [
    {
      id: 'current',
      name: 'Current Setup',
      description: 'Your existing storage and insurance configuration',
      storageTier: card.storageTier,
      insuranceLevel: card.insuranceLevel,
      oppRate: DEFAULT_OPPORTUNITY_RATE,
    },
    {
      id: 'downgrade-storage',
      name: 'Downgrade Storage',
      description: 'Move to basic storage to reduce daily costs',
      storageTier: 'basic',
      insuranceLevel: card.insuranceLevel,
      oppRate: DEFAULT_OPPORTUNITY_RATE,
    },
    {
      id: 'drop-insurance',
      name: 'Drop Insurance',
      description: 'Remove insurance coverage entirely',
      storageTier: card.storageTier,
      insuranceLevel: 'none',
      oppRate: DEFAULT_OPPORTUNITY_RATE,
    },
    {
      id: 'minimal',
      name: 'Minimal Costs',
      description: 'Basic storage, no insurance, lowest overhead',
      storageTier: 'basic',
      insuranceLevel: 'none',
      oppRate: DEFAULT_OPPORTUNITY_RATE,
    },
    {
      id: 'upgrade-vault',
      name: 'Vault Storage',
      description: 'Premium vault with full insurance for high-value protection',
      storageTier: 'vault',
      insuranceLevel: 'premium',
      oppRate: DEFAULT_OPPORTUNITY_RATE,
    },
    {
      id: 'low-opportunity',
      name: 'Low Opportunity Cost',
      description: 'Assume 3% alternative return instead of 7%',
      storageTier: card.storageTier,
      insuranceLevel: card.insuranceLevel,
      oppRate: 0.03,
    },
  ];

  const baseAnalysis = calculateBreakEven(cardId)[0];
  if (!baseAnalysis) return [];

  return scenarios.map((s) => {
    const modifiedCard: PortfolioCard = {
      ...card,
      storageTier: s.storageTier,
      insuranceLevel: s.insuranceLevel,
    };
    const costBreakdown = buildCostBreakdown(modifiedCard, s.oppRate);
    const netDaily = baseAnalysis.dailyAppreciation - costBreakdown.totalDailyCost;
    const totalCosts = costBreakdown.totalCostToDate + card.gradingFee + card.shippingCost;
    const remaining = Math.max(0, totalCosts - baseAnalysis.appreciationTotal);
    const breakEvenDays = netDaily > 0 ? Math.ceil(remaining / netDaily) : 9999;

    return {
      id: s.id,
      name: s.name,
      description: s.description,
      storageTier: s.storageTier,
      storageDailyRate: STORAGE_RATES[s.storageTier],
      insuranceLevel: s.insuranceLevel,
      insuranceDailyRate: getInsuranceDailyRate(s.insuranceLevel, card.currentValue),
      opportunityCostRate: s.oppRate,
      breakEvenDays,
      breakEvenDate: addDays(new Date(), breakEvenDays),
      monthlyCost: costBreakdown.totalDailyCost * 30,
      totalCostAtBreakEven: costBreakdown.totalDailyCost * breakEvenDays,
      savingsVsBaseline: (baseAnalysis.dailyHoldingCost - costBreakdown.totalDailyCost) * 30,
    };
  });
}

export function getCostBreakdown(cardId: string, opportunityRate?: number): CostBreakdown | null {
  const card = mockPortfolioCards.find((c) => c.id === cardId);
  if (!card) return null;
  return buildCostBreakdown(card, opportunityRate);
}

export function compareScenarios(
  cardId: string,
  scenarioIds: string[]
): VelocityScenario[] {
  const all = getVelocityScenarios(cardId);
  if (scenarioIds.length === 0) return all;
  return all.filter((s) => scenarioIds.includes(s.id));
}

export function getPortfolioBreakEvenSummary(): PortfolioBreakEvenSummary {
  const analyses = calculateBreakEven();

  const totalInvested = analyses.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalCurrentValue = analyses.reduce((sum, a) => sum + a.currentValue, 0);
  const totalHoldingCosts = analyses.reduce((sum, a) => sum + a.totalHoldingCosts, 0);
  const totalNetProfit = analyses.reduce((sum, a) => sum + a.profitAfterCosts, 0);
  const dailyPortfolioCost = analyses.reduce((sum, a) => sum + a.dailyHoldingCost, 0);

  const profitableCards = analyses.filter((a) => a.status === 'profitable').length;
  const approachingCards = analyses.filter((a) => a.status === 'approaching').length;
  const farCards = analyses.filter((a) => a.status === 'far').length;
  const losingCards = analyses.filter((a) => a.status === 'losing').length;

  const nonProfitable = analyses.filter((a) => !a.isProfitable);
  const avgBreakEven =
    nonProfitable.length > 0
      ? nonProfitable.reduce((sum, a) => sum + a.breakEvenDays, 0) / nonProfitable.length
      : 0;

  const sorted = [...analyses].sort((a, b) => a.breakEvenDays - b.breakEvenDays);

  // Estimate savings if all cards moved to minimal costs
  const minimalCostPerDay = analyses.reduce((sum, a) => {
    const card = mockPortfolioCards.find((c) => c.id === a.cardId)!;
    const minCard = { ...card, storageTier: 'basic' as const, insuranceLevel: 'none' as const };
    const minCost = buildCostBreakdown(minCard);
    return sum + (a.dailyHoldingCost - minCost.totalDailyCost);
  }, 0);

  return {
    totalCards: analyses.length,
    totalInvested,
    totalCurrentValue,
    totalHoldingCosts,
    totalNetProfit,
    averageBreakEvenDays: Math.round(avgBreakEven),
    profitableCards,
    approachingCards,
    farCards,
    losingCards,
    fastestBreakEven: sorted[0] || null,
    slowestBreakEven: sorted[sorted.length - 1] || null,
    dailyPortfolioCost,
    monthlyPortfolioCost: dailyPortfolioCost * 30,
    optimizationPotentialSavings: minimalCostPerDay * 30,
  };
}

export function getPortfolioCards(): PortfolioCard[] {
  return mockPortfolioCards;
}

export function getCardById(cardId: string): PortfolioCard | undefined {
  return mockPortfolioCards.find((c) => c.id === cardId);
}
