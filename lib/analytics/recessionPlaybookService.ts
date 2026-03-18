export interface EconomicScenario {
  id: string;
  name: string;
  probability: number;
  severity: number;
  duration: string;
  strategy: string;
  holdActions: string[];
  buyActions: string[];
  sellActions: string[];
  historicalParallel: string;
}

const mockScenarios: EconomicScenario[] = [
  { id: "es-001", name: "Mild Recession", probability: 0.35, severity: 3, duration: "6-12 months", strategy: "Selective accumulation of blue-chip vintage", holdActions: ["PSA 10 rookies of active HOF-track players", "Pre-war tobacco cards"], buyActions: ["Vintage commons at 40%+ discount", "Undervalued HOF rookies"], sellActions: ["Modern parallels with thin markets", "Overgraded mid-tier slabs"], historicalParallel: "2001 dot-com correction: vintage held, modern dropped 25%" },
  { id: "es-002", name: "Severe Recession", probability: 0.12, severity: 8, duration: "18-36 months", strategy: "Capital preservation, liquidate speculative positions", holdActions: ["T206 Honus Wagner tier cards", "1952 Topps Mantle-class icons"], buyActions: ["Only if 60%+ below peak with cash reserves"], sellActions: ["All modern speculative holds", "Low-pop parallels", "Non-HOF autos"], historicalParallel: "2008 financial crisis: market dropped 40%, recovered in 3 years" },
  { id: "es-003", name: "Stagflation", probability: 0.18, severity: 6, duration: "12-24 months", strategy: "Rotate into tangible high-grade vintage as inflation hedge", holdActions: ["All graded vintage above $5K", "Sealed wax pre-2000"], buyActions: ["Gold-standard vintage as real asset hedge", "Sealed vintage wax"], sellActions: ["Raw cards vulnerable to regrade risk", "Modern retail products"], historicalParallel: "1970s stagflation: vintage cards outperformed equities by 15%" },
  { id: "es-004", name: "Deflation", probability: 0.08, severity: 7, duration: "12-18 months", strategy: "Hold cash, prepare aggressive buy list for bottom", holdActions: ["Only true 1/1 cards and iconic items"], buyActions: ["Wait for capitulation selling, target 50%+ discounts"], sellActions: ["Reduce exposure across all categories early", "Raise cash position to 60%+"], historicalParallel: "1930s deflation: collectibles lost 50% but recovered strongest post-cycle" },
];

export function getScenarios(): EconomicScenario[] {
  return mockScenarios;
}

export function getCurrentOutlook(): { scenario: string; probability: number } {
  const top = mockScenarios.reduce((max, s) => s.probability > max.probability ? s : max);
  return { scenario: top.name, probability: top.probability };
}

const recessionPlaybookService = { getScenarios, getCurrentOutlook };
export default recessionPlaybookService;
