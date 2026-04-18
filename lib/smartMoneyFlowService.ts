// Smart Money Flow Index Service
// Follows "smart money" vs retail collector flow into card positions

export interface SmartMoneySignal {
  id: string;
  cardName: string;
  playerName: string;
  smartMoneyDirection: "inflow" | "outflow" | "neutral";
  retailDirection: "inflow" | "outflow" | "neutral";
  smartMoneyVolume: number;
  retailVolume: number;
  divergence: boolean;
  signalStrength: number;
  timestamp: string;
  sector: string;
  priceChange7d: number;
}

export interface FlowDirection {
  id: string;
  sector: string;
  smartMoneyFlow: number;
  retailFlow: number;
  netFlow: number;
  flowTrend: "accelerating" | "decelerating" | "stable" | "reversing";
  weekOverWeek: number;
  conviction: number;
}

export interface SmartVsRetail {
  id: string;
  metric: string;
  smartMoneyAvg: number;
  retailAvg: number;
  gap: number;
  advantage: "smart" | "retail" | "neutral";
  historicalAccuracy: number;
}

export interface FlowHistory {
  id: string;
  month: string;
  smartMoneyInflow: number;
  smartMoneyOutflow: number;
  retailInflow: number;
  retailOutflow: number;
  smartNetFlow: number;
  retailNetFlow: number;
  marketReturn: number;
}

const mockSignals: SmartMoneySignal[] = [
  { id: "sm1", cardName: "2018 Prizm Luka Doncic Silver PSA 10", playerName: "Luka Doncic", smartMoneyDirection: "inflow", retailDirection: "outflow", smartMoneyVolume: 245000, retailVolume: 180000, divergence: true, signalStrength: 82, timestamp: "2026-04-16", sector: "Modern Basketball", priceChange7d: -2.1 },
  { id: "sm2", cardName: "2023 Prizm Wembanyama Silver PSA 10", playerName: "Victor Wembanyama", smartMoneyDirection: "neutral", retailDirection: "inflow", smartMoneyVolume: 85000, retailVolume: 420000, divergence: true, signalStrength: 68, timestamp: "2026-04-16", sector: "Modern Basketball", priceChange7d: 5.8 },
  { id: "sm3", cardName: "1986 Fleer Jordan #57 PSA 9", playerName: "Michael Jordan", smartMoneyDirection: "inflow", retailDirection: "inflow", smartMoneyVolume: 520000, retailVolume: 310000, divergence: false, signalStrength: 91, timestamp: "2026-04-15", sector: "Vintage Basketball", priceChange7d: 3.2 },
  { id: "sm4", cardName: "2020 Prizm Herbert Silver PSA 10", playerName: "Justin Herbert", smartMoneyDirection: "inflow", retailDirection: "outflow", smartMoneyVolume: 125000, retailVolume: 95000, divergence: true, signalStrength: 75, timestamp: "2026-04-15", sector: "Modern Football", priceChange7d: -1.5 },
  { id: "sm5", cardName: "2019 Prizm Zion Silver PSA 10", playerName: "Zion Williamson", smartMoneyDirection: "outflow", retailDirection: "outflow", smartMoneyVolume: 180000, retailVolume: 220000, divergence: false, signalStrength: 85, timestamp: "2026-04-14", sector: "Modern Basketball", priceChange7d: -8.5 },
  { id: "sm6", cardName: "2011 Topps Update Trout RC PSA 10", playerName: "Mike Trout", smartMoneyDirection: "inflow", retailDirection: "neutral", smartMoneyVolume: 340000, retailVolume: 45000, divergence: true, signalStrength: 78, timestamp: "2026-04-14", sector: "Modern Baseball", priceChange7d: 4.2 },
  { id: "sm7", cardName: "2018 Topps Chrome Ohtani RC PSA 10", playerName: "Shohei Ohtani", smartMoneyDirection: "inflow", retailDirection: "inflow", smartMoneyVolume: 195000, retailVolume: 280000, divergence: false, signalStrength: 88, timestamp: "2026-04-13", sector: "Modern Baseball", priceChange7d: 8.1 },
  { id: "sm8", cardName: "2024 Prizm Caleb Williams Silver PSA 10", playerName: "Caleb Williams", smartMoneyDirection: "outflow", retailDirection: "inflow", smartMoneyVolume: 65000, retailVolume: 380000, divergence: true, signalStrength: 72, timestamp: "2026-04-13", sector: "Modern Football", priceChange7d: 12.5 },
  { id: "sm9", cardName: "2020 Prizm Burrow Silver PSA 10", playerName: "Joe Burrow", smartMoneyDirection: "inflow", retailDirection: "inflow", smartMoneyVolume: 210000, retailVolume: 175000, divergence: false, signalStrength: 80, timestamp: "2026-04-12", sector: "Modern Football", priceChange7d: 6.8 },
  { id: "sm10", cardName: "1952 Topps Mantle #311 PSA 5", playerName: "Mickey Mantle", smartMoneyDirection: "inflow", retailDirection: "neutral", smartMoneyVolume: 890000, retailVolume: 12000, divergence: true, signalStrength: 95, timestamp: "2026-04-12", sector: "Vintage Baseball", priceChange7d: 2.1 },
  { id: "sm11", cardName: "2022 Topps Chrome UCL Bellingham RC", playerName: "Jude Bellingham", smartMoneyDirection: "inflow", retailDirection: "inflow", smartMoneyVolume: 145000, retailVolume: 195000, divergence: false, signalStrength: 74, timestamp: "2026-04-11", sector: "Soccer", priceChange7d: 9.5 },
  { id: "sm12", cardName: "2021 Prizm Anthony Edwards Silver PSA 10", playerName: "Anthony Edwards", smartMoneyDirection: "inflow", retailDirection: "inflow", smartMoneyVolume: 310000, retailVolume: 345000, divergence: false, signalStrength: 92, timestamp: "2026-04-11", sector: "Modern Basketball", priceChange7d: 11.2 },
  { id: "sm13", cardName: "2003 Topps Chrome LeBron RC PSA 10", playerName: "LeBron James", smartMoneyDirection: "outflow", retailDirection: "neutral", smartMoneyVolume: 420000, retailVolume: 85000, divergence: true, signalStrength: 70, timestamp: "2026-04-10", sector: "Modern Basketball", priceChange7d: -3.8 },
  { id: "sm14", cardName: "2022 Prizm Paolo Banchero Silver PSA 10", playerName: "Paolo Banchero", smartMoneyDirection: "outflow", retailDirection: "inflow", smartMoneyVolume: 55000, retailVolume: 120000, divergence: true, signalStrength: 65, timestamp: "2026-04-10", sector: "Modern Basketball", priceChange7d: 2.2 },
  { id: "sm15", cardName: "2023 Topps Chrome Corbin Carroll RC PSA 10", playerName: "Corbin Carroll", smartMoneyDirection: "outflow", retailDirection: "outflow", smartMoneyVolume: 42000, retailVolume: 88000, divergence: false, signalStrength: 58, timestamp: "2026-04-09", sector: "Modern Baseball", priceChange7d: -12.5 },
  { id: "sm16", cardName: "2024 National Treasures Jayden Daniels RPA", playerName: "Jayden Daniels", smartMoneyDirection: "inflow", retailDirection: "inflow", smartMoneyVolume: 175000, retailVolume: 290000, divergence: false, signalStrength: 77, timestamp: "2026-04-09", sector: "Modern Football", priceChange7d: 15.8 }
];

const mockFlowDirections: FlowDirection[] = [
  { id: "fd1", sector: "Modern Basketball", smartMoneyFlow: 285000, retailFlow: 1245000, netFlow: 1530000, flowTrend: "stable", weekOverWeek: 2.5, conviction: 72 },
  { id: "fd2", sector: "Vintage Basketball", smartMoneyFlow: 520000, retailFlow: 310000, netFlow: 830000, flowTrend: "accelerating", weekOverWeek: 8.2, conviction: 88 },
  { id: "fd3", sector: "Modern Football", smartMoneyFlow: 375000, retailFlow: 940000, netFlow: 1315000, flowTrend: "accelerating", weekOverWeek: 12.1, conviction: 75 },
  { id: "fd4", sector: "Modern Baseball", smartMoneyFlow: 577000, retailFlow: 413000, netFlow: 990000, flowTrend: "decelerating", weekOverWeek: -3.5, conviction: 68 },
  { id: "fd5", sector: "Vintage Baseball", smartMoneyFlow: 890000, retailFlow: 12000, netFlow: 902000, flowTrend: "stable", weekOverWeek: 0.8, conviction: 95 },
  { id: "fd6", sector: "Soccer", smartMoneyFlow: 145000, retailFlow: 195000, netFlow: 340000, flowTrend: "accelerating", weekOverWeek: 18.5, conviction: 62 }
];

const mockSmartVsRetail: SmartVsRetail[] = [
  { id: "svr1", metric: "Average Hold Period (days)", smartMoneyAvg: 485, retailAvg: 42, gap: 443, advantage: "smart", historicalAccuracy: 78 },
  { id: "svr2", metric: "Win Rate (%)", smartMoneyAvg: 72, retailAvg: 45, gap: 27, advantage: "smart", historicalAccuracy: 85 },
  { id: "svr3", metric: "Avg Return (%)", smartMoneyAvg: 28.5, retailAvg: 8.2, gap: 20.3, advantage: "smart", historicalAccuracy: 82 },
  { id: "svr4", metric: "Transaction Size ($)", smartMoneyAvg: 4800, retailAvg: 185, gap: 4615, advantage: "smart", historicalAccuracy: 92 },
  { id: "svr5", metric: "Research Hours/Week", smartMoneyAvg: 15, retailAvg: 3, gap: 12, advantage: "smart", historicalAccuracy: 71 },
  { id: "svr6", metric: "FOMO Purchase Rate (%)", smartMoneyAvg: 8, retailAvg: 52, gap: 44, advantage: "smart", historicalAccuracy: 88 },
  { id: "svr7", metric: "Grading Submission Rate (%)", smartMoneyAvg: 85, retailAvg: 35, gap: 50, advantage: "smart", historicalAccuracy: 75 }
];

const mockFlowHistory: FlowHistory[] = [
  { id: "fh1", month: "2025-10", smartMoneyInflow: 4200000, smartMoneyOutflow: 1800000, retailInflow: 8500000, retailOutflow: 5200000, smartNetFlow: 2400000, retailNetFlow: 3300000, marketReturn: 5.2 },
  { id: "fh2", month: "2025-11", smartMoneyInflow: 4800000, smartMoneyOutflow: 1500000, retailInflow: 9200000, retailOutflow: 4800000, smartNetFlow: 3300000, retailNetFlow: 4400000, marketReturn: 8.1 },
  { id: "fh3", month: "2025-12", smartMoneyInflow: 3800000, smartMoneyOutflow: 2200000, retailInflow: 12000000, retailOutflow: 3500000, smartNetFlow: 1600000, retailNetFlow: 8500000, marketReturn: 12.5 },
  { id: "fh4", month: "2026-01", smartMoneyInflow: 5200000, smartMoneyOutflow: 1200000, retailInflow: 7800000, retailOutflow: 6500000, smartNetFlow: 4000000, retailNetFlow: 1300000, marketReturn: -2.8 },
  { id: "fh5", month: "2026-02", smartMoneyInflow: 5800000, smartMoneyOutflow: 1400000, retailInflow: 6500000, retailOutflow: 7200000, smartNetFlow: 4400000, retailNetFlow: -700000, marketReturn: -5.1 },
  { id: "fh6", month: "2026-03", smartMoneyInflow: 6200000, smartMoneyOutflow: 1800000, retailInflow: 8200000, retailOutflow: 5500000, smartNetFlow: 4400000, retailNetFlow: 2700000, marketReturn: 3.8 },
  { id: "fh7", month: "2026-04", smartMoneyInflow: 5500000, smartMoneyOutflow: 1600000, retailInflow: 9100000, retailOutflow: 4800000, smartNetFlow: 3900000, retailNetFlow: 4300000, marketReturn: 6.2 }
];

export function getSmartMoneySignals(): SmartMoneySignal[] {
  return mockSignals;
}

export function getFlowDirections(): FlowDirection[] {
  return mockFlowDirections;
}

export function getSmartVsRetail(): SmartVsRetail[] {
  return mockSmartVsRetail;
}

export function getFlowHistory(): FlowHistory[] {
  return mockFlowHistory;
}

export function getSmartMoneyStats() {
  const divergentSignals = mockSignals.filter(s => s.divergence).length;
  const smartInflow = mockSignals.filter(s => s.smartMoneyDirection === "inflow").length;
  const retailInflow = mockSignals.filter(s => s.retailDirection === "inflow").length;
  const avgSignalStrength = Math.round(mockSignals.reduce((s, sig) => s + sig.signalStrength, 0) / mockSignals.length);
  const totalSmartVolume = mockSignals.reduce((s, sig) => s + sig.smartMoneyVolume, 0);
  const totalRetailVolume = mockSignals.reduce((s, sig) => s + sig.retailVolume, 0);
  return { divergentSignals, smartInflow, retailInflow, avgSignalStrength, totalSmartVolume, totalRetailVolume, totalSignals: mockSignals.length };
}
