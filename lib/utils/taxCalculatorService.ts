// Phase 155 – Tax & Capital Gains Calculator Service
import { store } from '../dal/syncStore';

// ---- Types ----

export type TaxLotMethod = 'fifo' | 'lifo' | 'specific_id' | 'avg_cost';

export type TaxYear = 2024 | 2025 | 2026;

export interface TaxBracket {
  id: string;
  year: TaxYear;
  minIncome: number;
  maxIncome: number;
  rate: number;
  label: string;
  filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  cardName: string;
  date: string;
  amount: number;
  fees: number;
  platform: string;
  quantity: number;
  notes: string;
  lotId: string;
}

export interface CapitalGain {
  id: string;
  cardName: string;
  buyDate: string;
  sellDate: string;
  costBasis: number;
  saleProceeds: number;
  gain: number;
  holdingPeriod: number;
  isLongTerm: boolean;
  lotMethod: TaxLotMethod;
  fees: number;
  adjustedGain: number;
}

export interface TaxReport {
  id: string;
  year: TaxYear;
  shortTermGains: number;
  longTermGains: number;
  totalGains: number;
  shortTermLosses: number;
  longTermLosses: number;
  totalLosses: number;
  netGainLoss: number;
  estimatedTax: number;
  totalTransactions: number;
  deductibleExpenses: number;
  carryoverLoss: number;
  status: 'draft' | 'final' | 'filed';
}

export interface CostBasis {
  id: string;
  cardName: string;
  purchaseDate: string;
  purchasePrice: number;
  fees: number;
  adjustedBasis: number;
  currentValue: number;
  unrealizedGain: number;
  holdingDays: number;
  isLongTerm: boolean;
  platform: string;
  lotMethod: TaxLotMethod;
}

export interface WashSaleAlert {
  id: string;
  cardName: string;
  sellDate: string;
  sellAmount: number;
  loss: number;
  repurchaseDate: string;
  repurchaseAmount: number;
  daysBetween: number;
  disallowedLoss: number;
  adjustedBasis: number;
  status: 'active' | 'resolved' | 'pending_review';
}

export interface HarvestOpportunity {
  id: string;
  cardName: string;
  currentValue: number;
  costBasis: number;
  unrealizedLoss: number;
  potentialTaxSavings: number;
  holdingDays: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  washSaleRisk: boolean;
}

export interface DeductibleExpense {
  id: string;
  category: 'shipping' | 'grading' | 'insurance' | 'storage' | 'supplies' | 'software' | 'travel' | 'education';
  description: string;
  amount: number;
  date: string;
  deductible: boolean;
  notes: string;
}

export interface Form8949Entry {
  id: string;
  description: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: number;
  costBasis: number;
  adjustmentCode: string;
  adjustmentAmount: number;
  gainOrLoss: number;
  box: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

export interface TaxSummary {
  totalInvestment: number;
  totalReturns: number;
  netProfit: number;
  effectiveTaxRate: number;
  totalTaxesPaid: number;
  totalDeductions: number;
  avgHoldingPeriod: number;
  longTermPercentage: number;
  washSaleAdjustments: number;
  carryforwardLosses: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_tax_calculator';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.has(`${STORAGE_KEY}_${key}`) ? store.get<T>(`${STORAGE_KEY}_${key}`, null as unknown as T) : null;
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Format Helpers ----

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  if (value < 0) return `-$${Math.abs(value).toFixed(2)}`;
  return `$${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// ---- Mock Data ----

const TAX_BRACKETS: TaxBracket[] = [
  { id: 'tb_001', year: 2025, minIncome: 0, maxIncome: 11600, rate: 10, label: '10%', filingStatus: 'single' },
  { id: 'tb_002', year: 2025, minIncome: 11601, maxIncome: 47150, rate: 12, label: '12%', filingStatus: 'single' },
  { id: 'tb_003', year: 2025, minIncome: 47151, maxIncome: 100525, rate: 22, label: '22%', filingStatus: 'single' },
  { id: 'tb_004', year: 2025, minIncome: 100526, maxIncome: 191950, rate: 24, label: '24%', filingStatus: 'single' },
  { id: 'tb_005', year: 2025, minIncome: 191951, maxIncome: 243725, rate: 32, label: '32%', filingStatus: 'single' },
  { id: 'tb_006', year: 2025, minIncome: 243726, maxIncome: 609350, rate: 35, label: '35%', filingStatus: 'single' },
  { id: 'tb_007', year: 2025, minIncome: 609351, maxIncome: Infinity, rate: 37, label: '37%', filingStatus: 'single' },
];

const TRANSACTIONS: Transaction[] = [
  { id: 'tx_001', type: 'buy', cardName: '2023 Bowman Chrome Victor Wembanyama Auto PSA 10', date: '2024-01-15', amount: 2800, fees: 45, platform: 'eBay', quantity: 1, notes: 'Rookie auto, strong investment', lotId: 'lot_001' },
  { id: 'tx_002', type: 'buy', cardName: '2020 Prizm Justin Herbert Base PSA 10', date: '2024-02-03', amount: 320, fees: 15, platform: 'COMC', quantity: 1, notes: 'Buy the dip opportunity', lotId: 'lot_002' },
  { id: 'tx_003', type: 'buy', cardName: '2018 Optic Luka Doncic Rated Rookie PSA 10', date: '2024-02-14', amount: 1450, fees: 28, platform: 'eBay', quantity: 1, notes: 'Long-term hold target', lotId: 'lot_003' },
  { id: 'tx_004', type: 'sell', cardName: '2021 Topps Chrome Julio Rodriguez Auto', date: '2024-03-20', amount: 680, fees: 75, platform: 'eBay', quantity: 1, notes: 'Taking profits before season', lotId: 'lot_004' },
  { id: 'tx_005', type: 'buy', cardName: '2024 Topps Chrome Elly De La Cruz Auto', date: '2024-04-01', amount: 425, fees: 18, platform: 'MySlabs', quantity: 1, notes: 'Breakout candidate', lotId: 'lot_005' },
  { id: 'tx_006', type: 'buy', cardName: '2023 Select CeeDee Lamb Gold /10 BGS 9.5', date: '2024-04-15', amount: 1800, fees: 35, platform: 'Goldin', quantity: 1, notes: 'Low pop investment', lotId: 'lot_006' },
  { id: 'tx_007', type: 'sell', cardName: '2020 Prizm Joe Burrow Silver PSA 10', date: '2024-05-10', amount: 950, fees: 105, platform: 'eBay', quantity: 1, notes: 'Sold at peak pre-season hype', lotId: 'lot_007' },
  { id: 'tx_008', type: 'buy', cardName: '2023 Bowman Chrome Paul Skenes 1st Auto', date: '2024-05-20', amount: 550, fees: 22, platform: 'eBay', quantity: 1, notes: 'Top pitching prospect', lotId: 'lot_008' },
  { id: 'tx_009', type: 'buy', cardName: '1986 Fleer Michael Jordan RC BGS 8', date: '2024-06-01', amount: 18500, fees: 250, platform: 'Heritage Auctions', quantity: 1, notes: 'Blue-chip vintage investment', lotId: 'lot_009' },
  { id: 'tx_010', type: 'sell', cardName: '2022 Donruss Optic Brock Purdy Rated Rookie PSA 10', date: '2024-06-15', amount: 285, fees: 38, platform: 'eBay', quantity: 1, notes: 'Sold during hype cycle', lotId: 'lot_010' },
  { id: 'tx_011', type: 'buy', cardName: '2024 Topps Shohei Ohtani SP Variation', date: '2024-07-01', amount: 175, fees: 12, platform: 'Card Market', quantity: 2, notes: 'Dodgers era SP', lotId: 'lot_011' },
  { id: 'tx_012', type: 'sell', cardName: '2023 Bowman Chrome Victor Wembanyama Auto PSA 10', date: '2024-08-01', amount: 4200, fees: 462, platform: 'eBay', quantity: 1, notes: 'Realized gains after rookie season', lotId: 'lot_001' },
  { id: 'tx_013', type: 'buy', cardName: '2024 Prizm NFL Caleb Williams Base PSA 10', date: '2024-08-15', amount: 85, fees: 8, platform: 'eBay', quantity: 3, notes: 'Stacking rookie base', lotId: 'lot_012' },
  { id: 'tx_014', type: 'buy', cardName: '2020 Mosaic Ja Morant Pink Camo PSA 10', date: '2024-09-01', amount: 220, fees: 14, platform: 'COMC', quantity: 1, notes: 'Buying during injury dip', lotId: 'lot_013' },
  { id: 'tx_015', type: 'sell', cardName: '2024 Topps Shohei Ohtani SP Variation', date: '2024-09-20', amount: 240, fees: 30, platform: 'eBay', quantity: 1, notes: 'Quick flip on one copy', lotId: 'lot_011' },
  { id: 'tx_016', type: 'buy', cardName: '2023 Prizm Chet Holmgren Silver PSA 10', date: '2024-10-01', amount: 145, fees: 10, platform: 'eBay', quantity: 1, notes: 'Sophomore season spec', lotId: 'lot_014' },
  { id: 'tx_017', type: 'sell', cardName: '2020 Mosaic Ja Morant Pink Camo PSA 10', date: '2024-10-15', amount: 140, fees: 18, platform: 'eBay', quantity: 1, notes: 'Cut losses after further decline', lotId: 'lot_013' },
  { id: 'tx_018', type: 'buy', cardName: '2024 Bowman Chrome JJ Wetherholt 1st Auto', date: '2024-11-01', amount: 380, fees: 16, platform: 'eBay', quantity: 1, notes: '#1 overall pick prospect', lotId: 'lot_015' },
  { id: 'tx_019', type: 'sell', cardName: '2023 Prizm Chet Holmgren Silver PSA 10', date: '2024-11-20', amount: 110, fees: 15, platform: 'eBay', quantity: 1, notes: 'Disappointing season start', lotId: 'lot_014' },
  { id: 'tx_020', type: 'buy', cardName: '2024 Topps Chrome Pete Crow-Armstrong Auto', date: '2024-12-01', amount: 195, fees: 12, platform: 'eBay', quantity: 1, notes: 'Cubs rebuild piece', lotId: 'lot_016' },
  { id: 'tx_021', type: 'sell', cardName: '2020 Prizm Justin Herbert Base PSA 10', date: '2025-01-10', amount: 480, fees: 55, platform: 'eBay', quantity: 1, notes: 'Strong playoff run drove price up', lotId: 'lot_002' },
  { id: 'tx_022', type: 'buy', cardName: '2024 Prizm NBA Cooper Flagg RC PSA 10', date: '2025-01-20', amount: 750, fees: 25, platform: 'Goldin', quantity: 1, notes: '#1 pick hype investment', lotId: 'lot_017' },
  { id: 'tx_023', type: 'buy', cardName: '2024 Select Jayden Daniels Gold /10', date: '2025-02-01', amount: 2200, fees: 48, platform: 'PWCC', quantity: 1, notes: 'OROY winner, limited print', lotId: 'lot_018' },
  { id: 'tx_024', type: 'sell', cardName: '2018 Optic Luka Doncic Rated Rookie PSA 10', date: '2025-02-15', amount: 2100, fees: 231, platform: 'eBay', quantity: 1, notes: 'Sold during All-Star weekend', lotId: 'lot_003' },
  { id: 'tx_025', type: 'buy', cardName: '2024 Bowman Chrome Travis Bazzana 1st Auto', date: '2025-03-01', amount: 310, fees: 14, platform: 'eBay', quantity: 1, notes: 'Guardians top prospect', lotId: 'lot_019' },
  { id: 'tx_026', type: 'sell', cardName: '2024 Topps Chrome Elly De La Cruz Auto', date: '2025-03-15', amount: 580, fees: 64, platform: 'eBay', quantity: 1, notes: 'Solid return after breakout year', lotId: 'lot_005' },
  { id: 'tx_027', type: 'buy', cardName: '2025 Topps Series 1 Roki Sasaki SP RC', date: '2025-04-01', amount: 650, fees: 20, platform: 'eBay', quantity: 1, notes: 'Dodgers super-rookie', lotId: 'lot_020' },
  { id: 'tx_028', type: 'sell', cardName: '2024 Prizm NFL Caleb Williams Base PSA 10', date: '2025-04-20', amount: 55, fees: 8, platform: 'eBay', quantity: 2, notes: 'Poor rookie season, cutting losses', lotId: 'lot_012' },
  { id: 'tx_029', type: 'buy', cardName: '2025 Prizm NFL Shedeur Sanders Silver RC PSA 10', date: '2025-05-10', amount: 420, fees: 18, platform: 'eBay', quantity: 1, notes: '#1 pick rookie hype', lotId: 'lot_021' },
  { id: 'tx_030', type: 'sell', cardName: '2023 Select CeeDee Lamb Gold /10 BGS 9.5', date: '2025-06-01', amount: 2400, fees: 264, platform: 'Goldin', quantity: 1, notes: 'Contract extension drove value', lotId: 'lot_006' },
  { id: 'tx_031', type: 'buy', cardName: '2025 Bowman Chrome Konnor Griffin 1st Auto', date: '2025-06-15', amount: 280, fees: 14, platform: 'eBay', quantity: 1, notes: 'Top HS prospect', lotId: 'lot_022' },
  { id: 'tx_032', type: 'sell', cardName: '2023 Bowman Chrome Paul Skenes 1st Auto', date: '2025-07-01', amount: 1100, fees: 121, platform: 'eBay', quantity: 1, notes: 'Doubled after Cy Young season', lotId: 'lot_008' },
  { id: 'tx_033', type: 'buy', cardName: '2025 Topps Chrome Roki Sasaki Auto RC PSA 10', date: '2025-07-15', amount: 3200, fees: 65, platform: 'Goldin', quantity: 1, notes: 'Graded auto flagship RC', lotId: 'lot_023' },
  { id: 'tx_034', type: 'sell', cardName: '2024 Bowman Chrome JJ Wetherholt 1st Auto', date: '2025-08-01', amount: 520, fees: 57, platform: 'eBay', quantity: 1, notes: 'Call-up hype sale', lotId: 'lot_015' },
  { id: 'tx_035', type: 'buy', cardName: '2025 Prizm NBA Ace Bailey RC Silver PSA 10', date: '2025-09-01', amount: 185, fees: 12, platform: 'eBay', quantity: 2, notes: 'Lottery pick rookie stack', lotId: 'lot_024' },
  { id: 'tx_036', type: 'sell', cardName: '2024 Prizm NBA Cooper Flagg RC PSA 10', date: '2025-10-01', amount: 1650, fees: 181, platform: 'Goldin', quantity: 1, notes: 'Incredible rookie debut value spike', lotId: 'lot_017' },
  { id: 'tx_037', type: 'buy', cardName: '1993 SP Derek Jeter Foil RC PSA 8', date: '2025-11-01', amount: 5800, fees: 95, platform: 'Heritage Auctions', quantity: 1, notes: 'Classic 90s blue-chip', lotId: 'lot_025' },
  { id: 'tx_038', type: 'sell', cardName: '2024 Select Jayden Daniels Gold /10', date: '2025-12-01', amount: 3100, fees: 341, platform: 'PWCC', quantity: 1, notes: 'Pro Bowl season return', lotId: 'lot_018' },
  { id: 'tx_039', type: 'buy', cardName: '2026 Topps Series 1 Mystery Rookie SP', date: '2026-01-15', amount: 125, fees: 8, platform: 'eBay', quantity: 3, notes: 'Speculative early release', lotId: 'lot_026' },
  { id: 'tx_040', type: 'sell', cardName: '2025 Topps Series 1 Roki Sasaki SP RC', date: '2026-02-20', amount: 1100, fees: 121, platform: 'eBay', quantity: 1, notes: 'Dominant season increased value', lotId: 'lot_020' },
];

const CAPITAL_GAINS: CapitalGain[] = [
  { id: 'cg_001', cardName: '2021 Topps Chrome Julio Rodriguez Auto', buyDate: '2023-06-15', sellDate: '2024-03-20', costBasis: 420, saleProceeds: 680, gain: 260, holdingPeriod: 279, isLongTerm: false, lotMethod: 'fifo', fees: 75, adjustedGain: 185 },
  { id: 'cg_002', cardName: '2020 Prizm Joe Burrow Silver PSA 10', buyDate: '2023-09-10', sellDate: '2024-05-10', costBasis: 580, saleProceeds: 950, gain: 370, holdingPeriod: 243, isLongTerm: false, lotMethod: 'fifo', fees: 105, adjustedGain: 265 },
  { id: 'cg_003', cardName: '2022 Donruss Optic Brock Purdy Rated Rookie PSA 10', buyDate: '2023-03-01', sellDate: '2024-06-15', costBasis: 180, saleProceeds: 285, gain: 105, holdingPeriod: 472, isLongTerm: true, lotMethod: 'fifo', fees: 38, adjustedGain: 67 },
  { id: 'cg_004', cardName: '2023 Bowman Chrome Victor Wembanyama Auto PSA 10', buyDate: '2024-01-15', sellDate: '2024-08-01', costBasis: 2845, saleProceeds: 4200, gain: 1355, holdingPeriod: 199, isLongTerm: false, lotMethod: 'fifo', fees: 462, adjustedGain: 893 },
  { id: 'cg_005', cardName: '2024 Topps Shohei Ohtani SP Variation', buyDate: '2024-07-01', sellDate: '2024-09-20', costBasis: 99.50, saleProceeds: 240, gain: 140.50, holdingPeriod: 81, isLongTerm: false, lotMethod: 'avg_cost', fees: 30, adjustedGain: 110.50 },
  { id: 'cg_006', cardName: '2020 Mosaic Ja Morant Pink Camo PSA 10', buyDate: '2024-09-01', sellDate: '2024-10-15', costBasis: 234, saleProceeds: 140, gain: -94, holdingPeriod: 44, isLongTerm: false, lotMethod: 'fifo', fees: 18, adjustedGain: -112 },
  { id: 'cg_007', cardName: '2023 Prizm Chet Holmgren Silver PSA 10', buyDate: '2024-10-01', sellDate: '2024-11-20', costBasis: 155, saleProceeds: 110, gain: -45, holdingPeriod: 50, isLongTerm: false, lotMethod: 'fifo', fees: 15, adjustedGain: -60 },
  { id: 'cg_008', cardName: '2020 Prizm Justin Herbert Base PSA 10', buyDate: '2024-02-03', sellDate: '2025-01-10', costBasis: 335, saleProceeds: 480, gain: 145, holdingPeriod: 342, isLongTerm: false, lotMethod: 'fifo', fees: 55, adjustedGain: 90 },
  { id: 'cg_009', cardName: '2018 Optic Luka Doncic Rated Rookie PSA 10', buyDate: '2024-02-14', sellDate: '2025-02-15', costBasis: 1478, saleProceeds: 2100, gain: 622, holdingPeriod: 366, isLongTerm: true, lotMethod: 'fifo', fees: 231, adjustedGain: 391 },
  { id: 'cg_010', cardName: '2024 Topps Chrome Elly De La Cruz Auto', buyDate: '2024-04-01', sellDate: '2025-03-15', costBasis: 443, saleProceeds: 580, gain: 137, holdingPeriod: 348, isLongTerm: false, lotMethod: 'fifo', fees: 64, adjustedGain: 73 },
  { id: 'cg_011', cardName: '2024 Prizm NFL Caleb Williams Base PSA 10', buyDate: '2024-08-15', sellDate: '2025-04-20', costBasis: 62.67, saleProceeds: 55, gain: -7.67, holdingPeriod: 248, isLongTerm: false, lotMethod: 'avg_cost', fees: 8, adjustedGain: -15.67 },
  { id: 'cg_012', cardName: '2023 Select CeeDee Lamb Gold /10 BGS 9.5', buyDate: '2024-04-15', sellDate: '2025-06-01', costBasis: 1835, saleProceeds: 2400, gain: 565, holdingPeriod: 412, isLongTerm: true, lotMethod: 'fifo', fees: 264, adjustedGain: 301 },
  { id: 'cg_013', cardName: '2023 Bowman Chrome Paul Skenes 1st Auto', buyDate: '2024-05-20', sellDate: '2025-07-01', costBasis: 572, saleProceeds: 1100, gain: 528, holdingPeriod: 407, isLongTerm: true, lotMethod: 'fifo', fees: 121, adjustedGain: 407 },
  { id: 'cg_014', cardName: '2024 Bowman Chrome JJ Wetherholt 1st Auto', buyDate: '2024-11-01', sellDate: '2025-08-01', costBasis: 396, saleProceeds: 520, gain: 124, holdingPeriod: 273, isLongTerm: false, lotMethod: 'fifo', fees: 57, adjustedGain: 67 },
  { id: 'cg_015', cardName: '2024 Prizm NBA Cooper Flagg RC PSA 10', buyDate: '2025-01-20', sellDate: '2025-10-01', costBasis: 775, saleProceeds: 1650, gain: 875, holdingPeriod: 254, isLongTerm: false, lotMethod: 'fifo', fees: 181, adjustedGain: 694 },
  { id: 'cg_016', cardName: '2024 Select Jayden Daniels Gold /10', buyDate: '2025-02-01', sellDate: '2025-12-01', costBasis: 2248, saleProceeds: 3100, gain: 852, holdingPeriod: 303, isLongTerm: false, lotMethod: 'fifo', fees: 341, adjustedGain: 511 },
  { id: 'cg_017', cardName: '2025 Topps Series 1 Roki Sasaki SP RC', buyDate: '2025-04-01', sellDate: '2026-02-20', costBasis: 670, saleProceeds: 1100, gain: 430, holdingPeriod: 325, isLongTerm: false, lotMethod: 'fifo', fees: 121, adjustedGain: 309 },
];

const TAX_REPORTS: TaxReport[] = [
  { id: 'tr_2024', year: 2024, shortTermGains: 1731.50, longTermGains: 67, totalGains: 1798.50, shortTermLosses: 172, longTermLosses: 0, totalLosses: 172, netGainLoss: 1626.50, estimatedTax: 358, totalTransactions: 20, deductibleExpenses: 1240, carryoverLoss: 0, status: 'filed' },
  { id: 'tr_2025', year: 2025, shortTermGains: 1345, longTermGains: 1099, totalGains: 2444, shortTermLosses: 15.67, longTermLosses: 0, totalLosses: 15.67, netGainLoss: 2428.33, estimatedTax: 534, totalTransactions: 18, deductibleExpenses: 1580, carryoverLoss: 0, status: 'final' },
  { id: 'tr_2026', year: 2026, shortTermGains: 309, longTermGains: 0, totalGains: 309, shortTermLosses: 0, longTermLosses: 0, totalLosses: 0, netGainLoss: 309, estimatedTax: 68, totalTransactions: 4, deductibleExpenses: 280, carryoverLoss: 0, status: 'draft' },
];

function generateCostBasis(): CostBasis[] {
  const holdings: CostBasis[] = [
    { id: 'cb_001', cardName: '1986 Fleer Michael Jordan RC BGS 8', purchaseDate: '2024-06-01', purchasePrice: 18500, fees: 250, adjustedBasis: 18750, currentValue: 22000, unrealizedGain: 3250, holdingDays: 652, isLongTerm: true, platform: 'Heritage Auctions', lotMethod: 'specific_id' },
    { id: 'cb_002', cardName: '2024 Topps Shohei Ohtani SP Variation (1 remaining)', purchaseDate: '2024-07-01', purchasePrice: 87.50, fees: 6, adjustedBasis: 93.50, currentValue: 210, unrealizedGain: 116.50, holdingDays: 622, isLongTerm: true, platform: 'Card Market', lotMethod: 'avg_cost' },
    { id: 'cb_003', cardName: '2024 Prizm NFL Caleb Williams Base PSA 10 (1 remaining)', purchaseDate: '2024-08-15', purchasePrice: 28.33, fees: 2.67, adjustedBasis: 31, currentValue: 22, unrealizedGain: -9, holdingDays: 577, isLongTerm: true, platform: 'eBay', lotMethod: 'avg_cost' },
    { id: 'cb_004', cardName: '2024 Topps Chrome Pete Crow-Armstrong Auto', purchaseDate: '2024-12-01', purchasePrice: 195, fees: 12, adjustedBasis: 207, currentValue: 165, unrealizedGain: -42, holdingDays: 469, isLongTerm: true, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_005', cardName: '2024 Bowman Chrome Travis Bazzana 1st Auto', purchaseDate: '2025-03-01', purchasePrice: 310, fees: 14, adjustedBasis: 324, currentValue: 450, unrealizedGain: 126, holdingDays: 379, isLongTerm: true, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_006', cardName: '2025 Prizm NFL Shedeur Sanders Silver RC PSA 10', purchaseDate: '2025-05-10', purchasePrice: 420, fees: 18, adjustedBasis: 438, currentValue: 350, unrealizedGain: -88, holdingDays: 309, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_007', cardName: '2025 Bowman Chrome Konnor Griffin 1st Auto', purchaseDate: '2025-06-15', purchasePrice: 280, fees: 14, adjustedBasis: 294, currentValue: 320, unrealizedGain: 26, holdingDays: 273, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_008', cardName: '2025 Topps Chrome Roki Sasaki Auto RC PSA 10', purchaseDate: '2025-07-15', purchasePrice: 3200, fees: 65, adjustedBasis: 3265, currentValue: 4800, unrealizedGain: 1535, holdingDays: 243, isLongTerm: false, platform: 'Goldin', lotMethod: 'specific_id' },
    { id: 'cb_009', cardName: '2025 Prizm NBA Ace Bailey RC Silver PSA 10', purchaseDate: '2025-09-01', purchasePrice: 185, fees: 12, adjustedBasis: 197, currentValue: 240, unrealizedGain: 43, holdingDays: 195, isLongTerm: false, platform: 'eBay', lotMethod: 'avg_cost' },
    { id: 'cb_010', cardName: '2025 Prizm NBA Ace Bailey RC Silver PSA 10 (#2)', purchaseDate: '2025-09-01', purchasePrice: 185, fees: 12, adjustedBasis: 197, currentValue: 240, unrealizedGain: 43, holdingDays: 195, isLongTerm: false, platform: 'eBay', lotMethod: 'avg_cost' },
    { id: 'cb_011', cardName: '1993 SP Derek Jeter Foil RC PSA 8', purchaseDate: '2025-11-01', purchasePrice: 5800, fees: 95, adjustedBasis: 5895, currentValue: 6200, unrealizedGain: 305, holdingDays: 134, isLongTerm: false, platform: 'Heritage Auctions', lotMethod: 'specific_id' },
    { id: 'cb_012', cardName: '2026 Topps Series 1 Mystery Rookie SP (#1)', purchaseDate: '2026-01-15', purchasePrice: 125, fees: 8, adjustedBasis: 133, currentValue: 95, unrealizedGain: -38, holdingDays: 59, isLongTerm: false, platform: 'eBay', lotMethod: 'avg_cost' },
    { id: 'cb_013', cardName: '2026 Topps Series 1 Mystery Rookie SP (#2)', purchaseDate: '2026-01-15', purchasePrice: 125, fees: 8, adjustedBasis: 133, currentValue: 95, unrealizedGain: -38, holdingDays: 59, isLongTerm: false, platform: 'eBay', lotMethod: 'avg_cost' },
    { id: 'cb_014', cardName: '2026 Topps Series 1 Mystery Rookie SP (#3)', purchaseDate: '2026-01-15', purchasePrice: 125, fees: 8, adjustedBasis: 133, currentValue: 95, unrealizedGain: -38, holdingDays: 59, isLongTerm: false, platform: 'eBay', lotMethod: 'avg_cost' },
    // Additional historical cost basis entries for sold cards (resolved)
    { id: 'cb_015', cardName: '2021 Topps Chrome Julio Rodriguez Auto', purchaseDate: '2023-06-15', purchasePrice: 420, fees: 18, adjustedBasis: 438, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_016', cardName: '2020 Prizm Joe Burrow Silver PSA 10', purchaseDate: '2023-09-10', purchasePrice: 580, fees: 22, adjustedBasis: 602, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_017', cardName: '2022 Donruss Optic Brock Purdy Rated Rookie PSA 10', purchaseDate: '2023-03-01', purchasePrice: 180, fees: 10, adjustedBasis: 190, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: true, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_018', cardName: '2023 Bowman Chrome Victor Wembanyama Auto PSA 10', purchaseDate: '2024-01-15', purchasePrice: 2800, fees: 45, adjustedBasis: 2845, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_019', cardName: '2020 Prizm Justin Herbert Base PSA 10', purchaseDate: '2024-02-03', purchasePrice: 320, fees: 15, adjustedBasis: 335, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'COMC', lotMethod: 'fifo' },
    { id: 'cb_020', cardName: '2018 Optic Luka Doncic Rated Rookie PSA 10', purchaseDate: '2024-02-14', purchasePrice: 1450, fees: 28, adjustedBasis: 1478, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: true, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_021', cardName: '2024 Topps Chrome Elly De La Cruz Auto', purchaseDate: '2024-04-01', purchasePrice: 425, fees: 18, adjustedBasis: 443, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'MySlabs', lotMethod: 'fifo' },
    { id: 'cb_022', cardName: '2023 Select CeeDee Lamb Gold /10 BGS 9.5', purchaseDate: '2024-04-15', purchasePrice: 1800, fees: 35, adjustedBasis: 1835, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: true, platform: 'Goldin', lotMethod: 'fifo' },
    { id: 'cb_023', cardName: '2023 Bowman Chrome Paul Skenes 1st Auto', purchaseDate: '2024-05-20', purchasePrice: 550, fees: 22, adjustedBasis: 572, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: true, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_024', cardName: '2020 Mosaic Ja Morant Pink Camo PSA 10', purchaseDate: '2024-09-01', purchasePrice: 220, fees: 14, adjustedBasis: 234, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'COMC', lotMethod: 'fifo' },
    { id: 'cb_025', cardName: '2023 Prizm Chet Holmgren Silver PSA 10', purchaseDate: '2024-10-01', purchasePrice: 145, fees: 10, adjustedBasis: 155, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_026', cardName: '2024 Bowman Chrome JJ Wetherholt 1st Auto', purchaseDate: '2024-11-01', purchasePrice: 380, fees: 16, adjustedBasis: 396, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_027', cardName: '2024 Prizm NBA Cooper Flagg RC PSA 10', purchaseDate: '2025-01-20', purchasePrice: 750, fees: 25, adjustedBasis: 775, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'Goldin', lotMethod: 'fifo' },
    { id: 'cb_028', cardName: '2024 Select Jayden Daniels Gold /10', purchaseDate: '2025-02-01', purchasePrice: 2200, fees: 48, adjustedBasis: 2248, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'PWCC', lotMethod: 'fifo' },
    { id: 'cb_029', cardName: '2025 Topps Series 1 Roki Sasaki SP RC', purchaseDate: '2025-04-01', purchasePrice: 650, fees: 20, adjustedBasis: 670, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_030', cardName: '2024 Topps Shohei Ohtani SP Variation (sold copy)', purchaseDate: '2024-07-01', purchasePrice: 87.50, fees: 6, adjustedBasis: 93.50, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'Card Market', lotMethod: 'avg_cost' },
    { id: 'cb_031', cardName: '2024 Prizm NFL Caleb Williams Base PSA 10 (sold 2)', purchaseDate: '2024-08-15', purchasePrice: 56.67, fees: 5.33, adjustedBasis: 62, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'avg_cost' },
    { id: 'cb_032', cardName: '2022 Donruss Optic Brock Purdy RR PSA 10 (pre-2024 buy)', purchaseDate: '2023-03-01', purchasePrice: 180, fees: 10, adjustedBasis: 190, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: true, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_033', cardName: '2021 Topps Chrome J-Rod Auto (pre-2024 buy)', purchaseDate: '2023-06-15', purchasePrice: 420, fees: 18, adjustedBasis: 438, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_034', cardName: '2020 Prizm Joe Burrow Silver PSA 10 (pre-2024 buy)', purchaseDate: '2023-09-10', purchasePrice: 580, fees: 22, adjustedBasis: 602, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_035', cardName: '2023 Bowman Chrome Paul Skenes 1st Auto (copy 2 held)', purchaseDate: '2024-05-20', purchasePrice: 550, fees: 22, adjustedBasis: 572, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: true, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_036', cardName: '2024 Bowman Chrome JJ Wetherholt 1st Auto (sold)', purchaseDate: '2024-11-01', purchasePrice: 380, fees: 16, adjustedBasis: 396, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_037', cardName: '2024 Prizm NBA Cooper Flagg RC PSA 10 (sold)', purchaseDate: '2025-01-20', purchasePrice: 750, fees: 25, adjustedBasis: 775, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'Goldin', lotMethod: 'fifo' },
    { id: 'cb_038', cardName: '2024 Select Jayden Daniels Gold /10 (sold)', purchaseDate: '2025-02-01', purchasePrice: 2200, fees: 48, adjustedBasis: 2248, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'PWCC', lotMethod: 'fifo' },
    { id: 'cb_039', cardName: '2025 Topps Series 1 Roki Sasaki SP RC (sold)', purchaseDate: '2025-04-01', purchasePrice: 650, fees: 20, adjustedBasis: 670, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_040', cardName: '2023 Select CeeDee Lamb Gold /10 BGS 9.5 (sold)', purchaseDate: '2024-04-15', purchasePrice: 1800, fees: 35, adjustedBasis: 1835, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: true, platform: 'Goldin', lotMethod: 'fifo' },
    { id: 'cb_041', cardName: '2018 Optic Luka Doncic Rated Rookie PSA 10 (sold)', purchaseDate: '2024-02-14', purchasePrice: 1450, fees: 28, adjustedBasis: 1478, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: true, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_042', cardName: '2020 Prizm Justin Herbert Base PSA 10 (sold)', purchaseDate: '2024-02-03', purchasePrice: 320, fees: 15, adjustedBasis: 335, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'COMC', lotMethod: 'fifo' },
    { id: 'cb_043', cardName: '2020 Mosaic Ja Morant Pink Camo PSA 10 (sold)', purchaseDate: '2024-09-01', purchasePrice: 220, fees: 14, adjustedBasis: 234, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'COMC', lotMethod: 'fifo' },
    { id: 'cb_044', cardName: '2023 Prizm Chet Holmgren Silver PSA 10 (sold)', purchaseDate: '2024-10-01', purchasePrice: 145, fees: 10, adjustedBasis: 155, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_045', cardName: '2023 Bowman Chrome Victor Wembanyama Auto PSA 10 (sold)', purchaseDate: '2024-01-15', purchasePrice: 2800, fees: 45, adjustedBasis: 2845, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_046', cardName: '2024 Topps Chrome Elly De La Cruz Auto (sold)', purchaseDate: '2024-04-01', purchasePrice: 425, fees: 18, adjustedBasis: 443, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'MySlabs', lotMethod: 'fifo' },
    { id: 'cb_047', cardName: '2024 Prizm NFL Caleb Williams Base PSA 10 (sold pair)', purchaseDate: '2024-08-15', purchasePrice: 56.67, fees: 5.33, adjustedBasis: 62, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'avg_cost' },
    { id: 'cb_048', cardName: '2024 Topps Shohei Ohtani SP Variation (sold copy)', purchaseDate: '2024-07-01', purchasePrice: 87.50, fees: 6, adjustedBasis: 93.50, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'Card Market', lotMethod: 'avg_cost' },
    { id: 'cb_049', cardName: '2024 Bowman Chrome JJ Wetherholt 1st Auto (sold)', purchaseDate: '2024-11-01', purchasePrice: 380, fees: 16, adjustedBasis: 396, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'eBay', lotMethod: 'fifo' },
    { id: 'cb_050', cardName: '2024 Prizm NBA Cooper Flagg RC PSA 10 (sold)', purchaseDate: '2025-01-20', purchasePrice: 750, fees: 25, adjustedBasis: 775, currentValue: 0, unrealizedGain: 0, holdingDays: 0, isLongTerm: false, platform: 'Goldin', lotMethod: 'fifo' },
  ];

  return holdings;
}

const COST_BASIS_DATA = generateCostBasis();

const WASH_SALE_ALERTS: WashSaleAlert[] = [
  { id: 'ws_001', cardName: '2020 Mosaic Ja Morant Pink Camo PSA 10', sellDate: '2024-10-15', sellAmount: 140, loss: 94, repurchaseDate: '2024-11-05', repurchaseAmount: 135, daysBetween: 21, disallowedLoss: 94, adjustedBasis: 229, status: 'active' },
  { id: 'ws_002', cardName: '2023 Prizm Chet Holmgren Silver PSA 10', sellDate: '2024-11-20', sellAmount: 110, loss: 45, repurchaseDate: '2024-12-10', repurchaseAmount: 98, daysBetween: 20, disallowedLoss: 45, adjustedBasis: 143, status: 'resolved' },
  { id: 'ws_003', cardName: '2024 Prizm NFL Caleb Williams Base PSA 10', sellDate: '2025-04-20', sellAmount: 55, loss: 7.67, repurchaseDate: '2025-05-01', repurchaseAmount: 48, daysBetween: 11, disallowedLoss: 7.67, adjustedBasis: 55.67, status: 'active' },
  { id: 'ws_004', cardName: '2025 Prizm NFL Shedeur Sanders Silver RC PSA 10', sellDate: '2026-01-05', sellAmount: 310, loss: 128, repurchaseDate: '2026-01-20', repurchaseAmount: 295, daysBetween: 15, disallowedLoss: 128, adjustedBasis: 423, status: 'pending_review' },
  { id: 'ws_005', cardName: '2026 Topps Series 1 Mystery Rookie SP', sellDate: '2026-02-28', sellAmount: 80, loss: 53, repurchaseDate: '2026-03-10', repurchaseAmount: 75, daysBetween: 10, disallowedLoss: 53, adjustedBasis: 128, status: 'pending_review' },
];

const HARVEST_OPPORTUNITIES: HarvestOpportunity[] = [
  { id: 'ho_001', cardName: '2024 Topps Chrome Pete Crow-Armstrong Auto', currentValue: 165, costBasis: 207, unrealizedLoss: 42, potentialTaxSavings: 9.24, holdingDays: 469, recommendation: 'Sell to realize long-term capital loss. Low upside expected.', priority: 'high', washSaleRisk: false },
  { id: 'ho_002', cardName: '2025 Prizm NFL Shedeur Sanders Silver RC PSA 10', currentValue: 350, costBasis: 438, unrealizedLoss: 88, potentialTaxSavings: 19.36, holdingDays: 309, recommendation: 'Sell before year-end to harvest short-term loss against gains.', priority: 'high', washSaleRisk: true },
  { id: 'ho_003', cardName: '2024 Prizm NFL Caleb Williams Base PSA 10 (remaining)', currentValue: 22, costBasis: 31, unrealizedLoss: 9, potentialTaxSavings: 1.98, holdingDays: 577, recommendation: 'Minimal value remaining. Sell to clean up portfolio and realize loss.', priority: 'low', washSaleRisk: true },
  { id: 'ho_004', cardName: '2026 Topps Series 1 Mystery Rookie SP (#1)', currentValue: 95, costBasis: 133, unrealizedLoss: 38, potentialTaxSavings: 8.36, holdingDays: 59, recommendation: 'Recent purchase with quick decline. Wait for player reveal before selling.', priority: 'medium', washSaleRisk: false },
  { id: 'ho_005', cardName: '2026 Topps Series 1 Mystery Rookie SP (#2)', currentValue: 95, costBasis: 133, unrealizedLoss: 38, potentialTaxSavings: 8.36, holdingDays: 59, recommendation: 'Same as #1. Sell together to batch transaction costs.', priority: 'medium', washSaleRisk: false },
  { id: 'ho_006', cardName: '2026 Topps Series 1 Mystery Rookie SP (#3)', currentValue: 95, costBasis: 133, unrealizedLoss: 38, potentialTaxSavings: 8.36, holdingDays: 59, recommendation: 'Consider keeping one as speculative hold, sell two for losses.', priority: 'medium', washSaleRisk: false },
  { id: 'ho_007', cardName: '2025 Prizm NBA Ace Bailey RC Silver PSA 10 (#1)', currentValue: 240, costBasis: 197, unrealizedLoss: 0, potentialTaxSavings: 0, holdingDays: 195, recommendation: 'Currently at gain. Not a harvest candidate, but monitor for pullback.', priority: 'low', washSaleRisk: false },
  { id: 'ho_008', cardName: '2025 Bowman Chrome Konnor Griffin 1st Auto', currentValue: 320, costBasis: 294, unrealizedLoss: 0, potentialTaxSavings: 0, holdingDays: 273, recommendation: 'Small unrealized gain. Hold for long-term treatment approaching in ~92 days.', priority: 'low', washSaleRisk: false },
];

const DEDUCTIBLE_EXPENSES: DeductibleExpense[] = [
  { id: 'de_001', category: 'shipping', description: 'USPS Priority Mail shipping supplies and postage for card sales', amount: 285, date: '2024-12-31', deductible: true, notes: '2024 annual shipping costs' },
  { id: 'de_002', category: 'grading', description: 'PSA bulk submission (15 cards) — grading fees', amount: 450, date: '2024-08-15', deductible: true, notes: 'Deductible as cost of goods improvement' },
  { id: 'de_003', category: 'insurance', description: 'Collectibles insurance policy annual premium', amount: 240, date: '2024-06-01', deductible: true, notes: 'Covers collection up to $500k' },
  { id: 'de_004', category: 'storage', description: 'Safe deposit box rental at First National Bank', amount: 120, date: '2024-01-15', deductible: true, notes: 'Annual rental for ultra-premium cards' },
  { id: 'de_005', category: 'supplies', description: 'Top loaders, penny sleeves, one-touches, team bags', amount: 95, date: '2024-03-20', deductible: true, notes: 'Protection and storage supplies' },
  { id: 'de_006', category: 'software', description: 'Card tracking software subscription (CardLadder Pro)', amount: 50, date: '2024-07-01', deductible: true, notes: 'Annual subscription for market data' },
  { id: 'de_007', category: 'shipping', description: 'USPS and UPS shipping for 2025 card sales', amount: 340, date: '2025-12-31', deductible: true, notes: '2025 shipping expenses' },
  { id: 'de_008', category: 'grading', description: 'PSA regular submission (8 cards)', amount: 400, date: '2025-03-01', deductible: true, notes: '2025 grading costs' },
  { id: 'de_009', category: 'insurance', description: 'Collectibles insurance renewal — increased coverage', amount: 360, date: '2025-06-01', deductible: true, notes: 'Covers collection up to $750k' },
  { id: 'de_010', category: 'storage', description: 'Safe deposit box renewal', amount: 120, date: '2025-01-15', deductible: true, notes: 'Annual rental' },
  { id: 'de_011', category: 'supplies', description: 'Grading submission supplies, card savers, boxes', amount: 110, date: '2025-05-10', deductible: true, notes: 'Submission prep supplies' },
  { id: 'de_012', category: 'travel', description: 'National card show travel expenses (hotel, gas, food)', amount: 180, date: '2025-07-20', deductible: true, notes: 'Business travel for card acquisition' },
  { id: 'de_013', category: 'software', description: 'CardLadder Pro + Market Movers bundle', amount: 70, date: '2025-07-01', deductible: true, notes: 'Market analytics tools' },
  { id: 'de_014', category: 'shipping', description: 'Q1 2026 shipping costs', amount: 85, date: '2026-03-01', deductible: true, notes: '2026 YTD shipping' },
  { id: 'de_015', category: 'supplies', description: 'Card storage boxes, dividers, labels', amount: 45, date: '2026-02-10', deductible: true, notes: 'Organization supplies' },
  { id: 'de_016', category: 'insurance', description: 'Insurance premium Q1 2026', amount: 90, date: '2026-01-01', deductible: true, notes: 'Quarterly premium' },
  { id: 'de_017', category: 'education', description: 'Sports card investing course — online webinar series', amount: 60, date: '2025-09-15', deductible: true, notes: 'Business education expense' },
];

const FORM_8949_ENTRIES: Form8949Entry[] = [
  { id: 'f8_001', description: '2021 Topps Chrome Julio Rodriguez Auto — 1 unit', dateAcquired: '2023-06-15', dateSold: '2024-03-20', proceeds: 680, costBasis: 438, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 242, box: 'B' },
  { id: 'f8_002', description: '2020 Prizm Joe Burrow Silver PSA 10 — 1 unit', dateAcquired: '2023-09-10', dateSold: '2024-05-10', proceeds: 950, costBasis: 602, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 348, box: 'B' },
  { id: 'f8_003', description: '2022 Donruss Optic Brock Purdy RR PSA 10 — 1 unit', dateAcquired: '2023-03-01', dateSold: '2024-06-15', proceeds: 285, costBasis: 190, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 95, box: 'D' },
  { id: 'f8_004', description: '2023 Bowman Chrome Wembanyama Auto PSA 10 — 1 unit', dateAcquired: '2024-01-15', dateSold: '2024-08-01', proceeds: 4200, costBasis: 2845, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 1355, box: 'B' },
  { id: 'f8_005', description: '2024 Topps Ohtani SP Variation — 1 of 2 units', dateAcquired: '2024-07-01', dateSold: '2024-09-20', proceeds: 240, costBasis: 93.50, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 146.50, box: 'B' },
  { id: 'f8_006', description: '2020 Mosaic Ja Morant Pink Camo PSA 10 — 1 unit (WASH SALE)', dateAcquired: '2024-09-01', dateSold: '2024-10-15', proceeds: 140, costBasis: 234, adjustmentCode: 'W', adjustmentAmount: 94, gainOrLoss: 0, box: 'B' },
  { id: 'f8_007', description: '2023 Prizm Chet Holmgren Silver PSA 10 — 1 unit', dateAcquired: '2024-10-01', dateSold: '2024-11-20', proceeds: 110, costBasis: 155, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: -45, box: 'B' },
  { id: 'f8_008', description: '2020 Prizm Justin Herbert Base PSA 10 — 1 unit', dateAcquired: '2024-02-03', dateSold: '2025-01-10', proceeds: 480, costBasis: 335, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 145, box: 'B' },
  { id: 'f8_009', description: '2018 Optic Luka Doncic RR PSA 10 — 1 unit', dateAcquired: '2024-02-14', dateSold: '2025-02-15', proceeds: 2100, costBasis: 1478, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 622, box: 'D' },
  { id: 'f8_010', description: '2024 Topps Chrome Elly De La Cruz Auto — 1 unit', dateAcquired: '2024-04-01', dateSold: '2025-03-15', proceeds: 580, costBasis: 443, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 137, box: 'B' },
  { id: 'f8_011', description: '2024 Prizm NFL Caleb Williams PSA 10 — 2 of 3 units', dateAcquired: '2024-08-15', dateSold: '2025-04-20', proceeds: 110, costBasis: 124, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: -14, box: 'B' },
  { id: 'f8_012', description: '2023 Select CeeDee Lamb Gold /10 BGS 9.5 — 1 unit', dateAcquired: '2024-04-15', dateSold: '2025-06-01', proceeds: 2400, costBasis: 1835, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 565, box: 'D' },
  { id: 'f8_013', description: '2023 Bowman Chrome Paul Skenes 1st Auto — 1 unit', dateAcquired: '2024-05-20', dateSold: '2025-07-01', proceeds: 1100, costBasis: 572, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 528, box: 'D' },
  { id: 'f8_014', description: '2024 Bowman Chrome JJ Wetherholt 1st Auto — 1 unit', dateAcquired: '2024-11-01', dateSold: '2025-08-01', proceeds: 520, costBasis: 396, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 124, box: 'B' },
  { id: 'f8_015', description: '2024 Prizm NBA Cooper Flagg RC PSA 10 — 1 unit', dateAcquired: '2025-01-20', dateSold: '2025-10-01', proceeds: 1650, costBasis: 775, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 875, box: 'B' },
  { id: 'f8_016', description: '2024 Select Jayden Daniels Gold /10 — 1 unit', dateAcquired: '2025-02-01', dateSold: '2025-12-01', proceeds: 3100, costBasis: 2248, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 852, box: 'B' },
  { id: 'f8_017', description: '2025 Topps Series 1 Roki Sasaki SP RC — 1 unit', dateAcquired: '2025-04-01', dateSold: '2026-02-20', proceeds: 1100, costBasis: 670, adjustmentCode: '', adjustmentAmount: 0, gainOrLoss: 430, box: 'B' },
];

// ---- Config Helpers ----

const TAX_METHOD_CONFIG: Record<TaxLotMethod, { label: string; text: string; bg: string; border: string }> = {
  fifo: { label: 'FIFO', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  lifo: { label: 'LIFO', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  specific_id: { label: 'Specific ID', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  avg_cost: { label: 'Avg Cost', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

// ---- Public API ----

export function getTaxMethodConfig(method: TaxLotMethod): { label: string; text: string; bg: string; border: string } {
  return TAX_METHOD_CONFIG[method];
}

export function getTransactions(type?: 'buy' | 'sell'): Transaction[] {
  const cacheKey = `transactions_${type ?? 'all'}`;
  const cached = loadData<Transaction[]>(cacheKey);
  if (cached) return cached;

  let results = TRANSACTIONS;
  if (type) results = results.filter(t => t.type === type);

  saveData(cacheKey, results);
  return results;
}

export function getCapitalGains(year?: TaxYear): CapitalGain[] {
  const cacheKey = `capital_gains_${year ?? 'all'}`;
  const cached = loadData<CapitalGain[]>(cacheKey);
  if (cached) return cached;

  let results = CAPITAL_GAINS;
  if (year) {
    results = results.filter(cg => {
      const sellYear = new Date(cg.sellDate).getFullYear();
      return sellYear === year;
    });
  }

  saveData(cacheKey, results);
  return results;
}

export function getTaxBrackets(_year?: TaxYear): TaxBracket[] {
  const cached = loadData<TaxBracket[]>('tax_brackets');
  if (cached) return cached;
  saveData('tax_brackets', TAX_BRACKETS);
  return TAX_BRACKETS;
}

export function getTaxReports(): TaxReport[] {
  const cached = loadData<TaxReport[]>('tax_reports');
  if (cached) return cached;
  saveData('tax_reports', TAX_REPORTS);
  return TAX_REPORTS;
}

export function getCostBasis(activeOnly?: boolean): CostBasis[] {
  const cacheKey = `cost_basis_${activeOnly ? 'active' : 'all'}`;
  const cached = loadData<CostBasis[]>(cacheKey);
  if (cached) return cached;

  let results = COST_BASIS_DATA;
  if (activeOnly) results = results.filter(cb => cb.currentValue > 0);

  saveData(cacheKey, results);
  return results;
}

export function getWashSaleAlerts(): WashSaleAlert[] {
  const cached = loadData<WashSaleAlert[]>('wash_sales');
  if (cached) return cached;
  saveData('wash_sales', WASH_SALE_ALERTS);
  return WASH_SALE_ALERTS;
}

export function getHarvestOpportunities(): HarvestOpportunity[] {
  const cached = loadData<HarvestOpportunity[]>('harvest');
  if (cached) return cached;
  saveData('harvest', HARVEST_OPPORTUNITIES);
  return HARVEST_OPPORTUNITIES;
}

export function getDeductibleExpenses(year?: TaxYear): DeductibleExpense[] {
  const cacheKey = `expenses_${year ?? 'all'}`;
  const cached = loadData<DeductibleExpense[]>(cacheKey);
  if (cached) return cached;

  let results = DEDUCTIBLE_EXPENSES;
  if (year) {
    results = results.filter(e => new Date(e.date).getFullYear() === year);
  }

  saveData(cacheKey, results);
  return results;
}

export function getForm8949Entries(year?: TaxYear): Form8949Entry[] {
  const cacheKey = `form8949_${year ?? 'all'}`;
  const cached = loadData<Form8949Entry[]>(cacheKey);
  if (cached) return cached;

  let results = FORM_8949_ENTRIES;
  if (year) {
    results = results.filter(e => new Date(e.dateSold).getFullYear() === year);
  }

  saveData(cacheKey, results);
  return results;
}

export function getTaxSummary(): TaxSummary {
  const cacheKey = 'tax_summary';
  const cached = loadData<TaxSummary>(cacheKey);
  if (cached) return cached;

  const buys = TRANSACTIONS.filter(t => t.type === 'buy');
  const sells = TRANSACTIONS.filter(t => t.type === 'sell');
  const gains = CAPITAL_GAINS;
  const reports = TAX_REPORTS;

  const totalInvestment = buys.reduce((s, t) => s + t.amount * t.quantity + t.fees, 0);
  const totalReturns = sells.reduce((s, t) => s + t.amount * t.quantity - t.fees, 0);
  const netProfit = totalReturns - totalInvestment * 0.55;
  const totalTaxesPaid = reports.reduce((s, r) => s + r.estimatedTax, 0);
  const totalDeductions = DEDUCTIBLE_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const avgHoldingPeriod = Math.round(gains.reduce((s, g) => s + g.holdingPeriod, 0) / Math.max(1, gains.length));
  const longTermCount = gains.filter(g => g.isLongTerm).length;
  const longTermPercentage = Math.round((longTermCount / Math.max(1, gains.length)) * 100);
  const washSaleAdj = WASH_SALE_ALERTS.reduce((s, w) => s + w.disallowedLoss, 0);
  const effectiveTaxRate = totalReturns > 0 ? Math.round((totalTaxesPaid / totalReturns) * 10000) / 100 : 0;

  const summary: TaxSummary = {
    totalInvestment,
    totalReturns,
    netProfit,
    effectiveTaxRate,
    totalTaxesPaid,
    totalDeductions,
    avgHoldingPeriod,
    longTermPercentage,
    washSaleAdjustments: washSaleAdj,
    carryforwardLosses: 0,
  };

  saveData(cacheKey, summary);
  return summary;
}

export function calculateEstimatedTax(gain: number, isLongTerm: boolean, taxableIncome: number): { taxRate: number; estimatedTax: number; bracket: string } {
  if (isLongTerm) {
    let rate = 0;
    let bracket = '0%';
    if (taxableIncome > 518900) { rate = 20; bracket = '20%'; }
    else if (taxableIncome > 47025) { rate = 15; bracket = '15%'; }
    else { rate = 0; bracket = '0%'; }
    return { taxRate: rate, estimatedTax: Math.round(gain * rate / 100), bracket };
  }

  const brackets = TAX_BRACKETS;
  let applicableBracket = brackets[0];
  for (const b of brackets) {
    if (taxableIncome >= b.minIncome && taxableIncome <= b.maxIncome) {
      applicableBracket = b;
      break;
    }
  }

  return {
    taxRate: applicableBracket.rate,
    estimatedTax: Math.round(gain * applicableBracket.rate / 100),
    bracket: applicableBracket.label,
  };
}

export function getTaxReportByYear(year: TaxYear): TaxReport | null {
  const reports = getTaxReports();
  return reports.find(r => r.year === year) ?? null;
}

export function getPortfolioUnrealizedGains(): { totalUnrealizedGain: number; totalUnrealizedLoss: number; netUnrealized: number; positions: CostBasis[] } {
  const cacheKey = 'unrealized';
  const cached = loadData<{ totalUnrealizedGain: number; totalUnrealizedLoss: number; netUnrealized: number; positions: CostBasis[] }>(cacheKey);
  if (cached) return cached;

  const active = COST_BASIS_DATA.filter(cb => cb.currentValue > 0);
  const gains = active.filter(cb => cb.unrealizedGain > 0);
  const losses = active.filter(cb => cb.unrealizedGain < 0);

  const result = {
    totalUnrealizedGain: gains.reduce((s, cb) => s + cb.unrealizedGain, 0),
    totalUnrealizedLoss: Math.abs(losses.reduce((s, cb) => s + cb.unrealizedGain, 0)),
    netUnrealized: active.reduce((s, cb) => s + cb.unrealizedGain, 0),
    positions: active,
  };

  saveData(cacheKey, result);
  return result;
}

export function getAnnualBreakdown(): { year: TaxYear; buys: number; sells: number; totalSpent: number; totalReceived: number; netCashFlow: number; avgHoldPeriod: number; winRate: number }[] {
  const cacheKey = 'annual_breakdown';
  const cached = loadData<{ year: TaxYear; buys: number; sells: number; totalSpent: number; totalReceived: number; netCashFlow: number; avgHoldPeriod: number; winRate: number }[]>(cacheKey);
  if (cached) return cached;

  const years: TaxYear[] = [2024, 2025, 2026];
  const breakdown = years.map(year => {
    const yearTx = TRANSACTIONS.filter(t => new Date(t.date).getFullYear() === year);
    const yearBuys = yearTx.filter(t => t.type === 'buy');
    const yearSells = yearTx.filter(t => t.type === 'sell');
    const yearGains = CAPITAL_GAINS.filter(cg => new Date(cg.sellDate).getFullYear() === year);
    const wins = yearGains.filter(g => g.adjustedGain > 0).length;

    return {
      year,
      buys: yearBuys.length,
      sells: yearSells.length,
      totalSpent: yearBuys.reduce((s, t) => s + t.amount * t.quantity + t.fees, 0),
      totalReceived: yearSells.reduce((s, t) => s + t.amount * t.quantity - t.fees, 0),
      netCashFlow: yearSells.reduce((s, t) => s + t.amount * t.quantity - t.fees, 0) - yearBuys.reduce((s, t) => s + t.amount * t.quantity + t.fees, 0),
      avgHoldPeriod: yearGains.length > 0 ? Math.round(yearGains.reduce((s, g) => s + g.holdingPeriod, 0) / yearGains.length) : 0,
      winRate: yearGains.length > 0 ? Math.round((wins / yearGains.length) * 100) : 0,
    };
  });

  saveData(cacheKey, breakdown);
  return breakdown;
}

export function getPlatformBreakdown(): { platform: string; buyCount: number; sellCount: number; totalBought: number; totalSold: number; avgFeePercent: number }[] {
  const cacheKey = 'platform_breakdown';
  const cached = loadData<{ platform: string; buyCount: number; sellCount: number; totalBought: number; totalSold: number; avgFeePercent: number }[]>(cacheKey);
  if (cached) return cached;

  const platforms = [...new Set(TRANSACTIONS.map(t => t.platform))];
  const breakdown = platforms.map(platform => {
    const platTx = TRANSACTIONS.filter(t => t.platform === platform);
    const buys = platTx.filter(t => t.type === 'buy');
    const sells = platTx.filter(t => t.type === 'sell');
    const totalBought = buys.reduce((s, t) => s + t.amount * t.quantity, 0);
    const totalSold = sells.reduce((s, t) => s + t.amount * t.quantity, 0);
    const totalFees = platTx.reduce((s, t) => s + t.fees, 0);
    const totalVolume = totalBought + totalSold;
    const avgFeePercent = totalVolume > 0 ? Math.round((totalFees / totalVolume) * 10000) / 100 : 0;

    return {
      platform,
      buyCount: buys.length,
      sellCount: sells.length,
      totalBought,
      totalSold,
      avgFeePercent,
    };
  });

  saveData(cacheKey, breakdown);
  return breakdown;
}

export function getMonthlyGainLoss(): { month: string; shortTermGains: number; longTermGains: number; shortTermLosses: number; longTermLosses: number; net: number }[] {
  const cacheKey = 'monthly_gain_loss';
  const cached = loadData<{ month: string; shortTermGains: number; longTermGains: number; shortTermLosses: number; longTermLosses: number; net: number }[]>(cacheKey);
  if (cached) return cached;

  const months: { month: string; shortTermGains: number; longTermGains: number; shortTermLosses: number; longTermLosses: number; net: number }[] = [];

  for (let y = 2024; y <= 2026; y++) {
    const maxMonth = y === 2026 ? 3 : 12;
    for (let m = 1; m <= maxMonth; m++) {
      const monthStr = `${y}-${String(m).padStart(2, '0')}`;
      const monthGains = CAPITAL_GAINS.filter(cg => {
        const d = new Date(cg.sellDate);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });

      const stGains = monthGains.filter(g => !g.isLongTerm && g.adjustedGain > 0).reduce((s, g) => s + g.adjustedGain, 0);
      const ltGains = monthGains.filter(g => g.isLongTerm && g.adjustedGain > 0).reduce((s, g) => s + g.adjustedGain, 0);
      const stLosses = Math.abs(monthGains.filter(g => !g.isLongTerm && g.adjustedGain < 0).reduce((s, g) => s + g.adjustedGain, 0));
      const ltLosses = Math.abs(monthGains.filter(g => g.isLongTerm && g.adjustedGain < 0).reduce((s, g) => s + g.adjustedGain, 0));

      months.push({
        month: monthStr,
        shortTermGains: Math.round(stGains * 100) / 100,
        longTermGains: Math.round(ltGains * 100) / 100,
        shortTermLosses: Math.round(stLosses * 100) / 100,
        longTermLosses: Math.round(ltLosses * 100) / 100,
        net: Math.round((stGains + ltGains - stLosses - ltLosses) * 100) / 100,
      });
    }
  }

  saveData(cacheKey, months);
  return months;
}

export function getExpensesByCategory(): { category: string; total: number; count: number; avgAmount: number; percentOfTotal: number }[] {
  const cacheKey = 'expenses_by_category';
  const cached = loadData<{ category: string; total: number; count: number; avgAmount: number; percentOfTotal: number }[]>(cacheKey);
  if (cached) return cached;

  const categories = [...new Set(DEDUCTIBLE_EXPENSES.map(e => e.category))];
  const grandTotal = DEDUCTIBLE_EXPENSES.reduce((s, e) => s + e.amount, 0);

  const result = categories.map(category => {
    const catExpenses = DEDUCTIBLE_EXPENSES.filter(e => e.category === category);
    const total = catExpenses.reduce((s, e) => s + e.amount, 0);
    return {
      category,
      total,
      count: catExpenses.length,
      avgAmount: Math.round(total / catExpenses.length * 100) / 100,
      percentOfTotal: Math.round((total / grandTotal) * 10000) / 100,
    };
  }).sort((a, b) => b.total - a.total);

  saveData(cacheKey, result);
  return result;
}

export function getHoldingPeriodAnalysis(): { range: string; count: number; avgGain: number; winRate: number; totalGains: number }[] {
  const cacheKey = 'holding_period';
  const cached = loadData<{ range: string; count: number; avgGain: number; winRate: number; totalGains: number }[]>(cacheKey);
  if (cached) return cached;

  const ranges = [
    { label: '0-30 days', min: 0, max: 30 },
    { label: '31-90 days', min: 31, max: 90 },
    { label: '91-180 days', min: 91, max: 180 },
    { label: '181-365 days', min: 181, max: 365 },
    { label: '366+ days (Long-term)', min: 366, max: 9999 },
  ];

  const result = ranges.map(range => {
    const rangeGains = CAPITAL_GAINS.filter(g => g.holdingPeriod >= range.min && g.holdingPeriod <= range.max);
    const wins = rangeGains.filter(g => g.adjustedGain > 0).length;
    const totalGains = rangeGains.reduce((s, g) => s + g.adjustedGain, 0);

    return {
      range: range.label,
      count: rangeGains.length,
      avgGain: rangeGains.length > 0 ? Math.round(totalGains / rangeGains.length * 100) / 100 : 0,
      winRate: rangeGains.length > 0 ? Math.round((wins / rangeGains.length) * 100) : 0,
      totalGains: Math.round(totalGains * 100) / 100,
    };
  });

  saveData(cacheKey, result);
  return result;
}

export function getIRSComplianceChecklist(): { item: string; status: 'complete' | 'incomplete' | 'not_applicable'; description: string; dueDate: string }[] {
  return [
    { item: 'Form 8949 — Short-term transactions', status: 'complete', description: 'All short-term capital gains and losses reported on Form 8949 Part I (Box B — basis not reported to IRS)', dueDate: '2025-04-15' },
    { item: 'Form 8949 — Long-term transactions', status: 'complete', description: 'All long-term capital gains and losses reported on Form 8949 Part II (Box D)', dueDate: '2025-04-15' },
    { item: 'Schedule D — Capital gains summary', status: 'complete', description: 'Summary of all capital gains/losses transferred from Form 8949 to Schedule D', dueDate: '2025-04-15' },
    { item: 'Wash sale identification', status: 'complete', description: 'All wash sales identified and disallowed losses properly adjusted on Form 8949', dueDate: '2025-04-15' },
    { item: 'Cost basis documentation', status: 'complete', description: 'Purchase receipts, invoices, and platform records retained for all cost basis claims', dueDate: 'Ongoing' },
    { item: 'Schedule C (if applicable)', status: 'incomplete', description: 'If card trading is treated as a business, file Schedule C with business income/expenses', dueDate: '2025-04-15' },
    { item: '1099-K reconciliation', status: 'incomplete', description: 'Reconcile 1099-K forms from eBay, Goldin, and other platforms with reported sales', dueDate: '2026-04-15' },
    { item: 'Estimated tax payments', status: 'complete', description: 'Quarterly estimated payments made for 2025 tax year', dueDate: '2026-01-15' },
    { item: 'State tax obligations', status: 'incomplete', description: 'State capital gains tax filings may be required depending on state of residence', dueDate: '2026-04-15' },
    { item: 'Record retention (3-7 years)', status: 'complete', description: 'All transaction records, receipts, and tax documents retained for IRS audit period', dueDate: 'Ongoing' },
    { item: 'Hobby vs. business determination', status: 'incomplete', description: 'Evaluate whether card trading activity qualifies as business for Schedule C treatment', dueDate: '2026-04-15' },
    { item: 'Sales tax collection compliance', status: 'not_applicable', description: 'Sales tax not applicable for used goods in most states — verify with local regulations', dueDate: 'N/A' },
  ];
}

export function getLotMethodComparison(): { method: TaxLotMethod; totalGains: number; totalLosses: number; netGainLoss: number; estimatedTax: number; transactionCount: number }[] {
  const cacheKey = 'lot_method_comparison';
  const cached = loadData<{ method: TaxLotMethod; totalGains: number; totalLosses: number; netGainLoss: number; estimatedTax: number; transactionCount: number }[]>(cacheKey);
  if (cached) return cached;

  const methods: TaxLotMethod[] = ['fifo', 'lifo', 'specific_id', 'avg_cost'];
  const comparison = methods.map(method => {
    const methodGains = CAPITAL_GAINS.filter(g => g.lotMethod === method);
    const gains = methodGains.filter(g => g.adjustedGain > 0).reduce((s, g) => s + g.adjustedGain, 0);
    const losses = Math.abs(methodGains.filter(g => g.adjustedGain < 0).reduce((s, g) => s + g.adjustedGain, 0));
    const net = gains - losses;
    const estimatedTax = Math.round(net * 0.22);

    return {
      method,
      totalGains: Math.round(gains * 100) / 100,
      totalLosses: Math.round(losses * 100) / 100,
      netGainLoss: Math.round(net * 100) / 100,
      estimatedTax: Math.max(0, estimatedTax),
      transactionCount: methodGains.length,
    };
  });

  saveData(cacheKey, comparison);
  return comparison;
}

export function getTopGainersAndLosers(): { topGainers: { cardName: string; gain: number; roi: number; holdingDays: number }[]; topLosers: { cardName: string; loss: number; roi: number; holdingDays: number }[] } {
  const cacheKey = 'top_gainers_losers';
  const cached = loadData<{ topGainers: { cardName: string; gain: number; roi: number; holdingDays: number }[]; topLosers: { cardName: string; loss: number; roi: number; holdingDays: number }[] }>(cacheKey);
  if (cached) return cached;

  const sorted = [...CAPITAL_GAINS].sort((a, b) => b.adjustedGain - a.adjustedGain);

  const topGainers = sorted.slice(0, 5).map(g => ({
    cardName: g.cardName,
    gain: g.adjustedGain,
    roi: Math.round((g.adjustedGain / g.costBasis) * 10000) / 100,
    holdingDays: g.holdingPeriod,
  }));

  const topLosers = sorted.slice(-5).reverse().filter(g => g.adjustedGain < 0).map(g => ({
    cardName: g.cardName,
    loss: g.adjustedGain,
    roi: Math.round((g.adjustedGain / g.costBasis) * 10000) / 100,
    holdingDays: g.holdingPeriod,
  }));

  const result = { topGainers, topLosers };
  saveData(cacheKey, result);
  return result;
}

export function getFeeAnalysis(): { totalFees: number; feesByType: { type: string; total: number; count: number }[]; avgFeePercent: number; feesAsPercentOfGains: number } {
  const cacheKey = 'fee_analysis';
  const cached = loadData<{ totalFees: number; feesByType: { type: string; total: number; count: number }[]; avgFeePercent: number; feesAsPercentOfGains: number }>(cacheKey);
  if (cached) return cached;

  const buyFees = TRANSACTIONS.filter(t => t.type === 'buy').reduce((s, t) => s + t.fees, 0);
  const sellFees = TRANSACTIONS.filter(t => t.type === 'sell').reduce((s, t) => s + t.fees, 0);
  const totalFees = buyFees + sellFees;
  const totalVolume = TRANSACTIONS.reduce((s, t) => s + t.amount * t.quantity, 0);
  const totalGains = CAPITAL_GAINS.filter(g => g.adjustedGain > 0).reduce((s, g) => s + g.adjustedGain, 0);

  const result = {
    totalFees,
    feesByType: [
      { type: 'Buy-side fees', total: Math.round(buyFees * 100) / 100, count: TRANSACTIONS.filter(t => t.type === 'buy').length },
      { type: 'Sell-side fees', total: Math.round(sellFees * 100) / 100, count: TRANSACTIONS.filter(t => t.type === 'sell').length },
    ],
    avgFeePercent: Math.round((totalFees / totalVolume) * 10000) / 100,
    feesAsPercentOfGains: totalGains > 0 ? Math.round((totalFees / totalGains) * 10000) / 100 : 0,
  };

  saveData(cacheKey, result);
  return result;
}

export function getQuarterlyEstimatedPayments(): { quarter: string; dueDate: string; estimatedIncome: number; estimatedTax: number; status: 'paid' | 'due' | 'upcoming' }[] {
  return [
    { quarter: 'Q1 2025', dueDate: '2025-04-15', estimatedIncome: 553, estimatedTax: 122, status: 'paid' },
    { quarter: 'Q2 2025', dueDate: '2025-06-16', estimatedIncome: 774, estimatedTax: 170, status: 'paid' },
    { quarter: 'Q3 2025', dueDate: '2025-09-15', estimatedIncome: 761, estimatedTax: 167, status: 'paid' },
    { quarter: 'Q4 2025', dueDate: '2026-01-15', estimatedIncome: 1205, estimatedTax: 265, status: 'paid' },
    { quarter: 'Q1 2026', dueDate: '2026-04-15', estimatedIncome: 309, estimatedTax: 68, status: 'due' },
    { quarter: 'Q2 2026', dueDate: '2026-06-15', estimatedIncome: 0, estimatedTax: 0, status: 'upcoming' },
    { quarter: 'Q3 2026', dueDate: '2026-09-15', estimatedIncome: 0, estimatedTax: 0, status: 'upcoming' },
    { quarter: 'Q4 2026', dueDate: '2027-01-15', estimatedIncome: 0, estimatedTax: 0, status: 'upcoming' },
  ];
}

// ---- Page-compatible types & adapters (used by TaxCalculator page) ----

export interface CapitalGainsSummary {
  taxesOwed: number;
  shortTermGains: number;
  longTermGains: number;
  harvestingSavings: number;
  effectiveTaxRate: number;
}

export interface MonthlyGain {
  month: string;
  gains: number;
  losses: number;
  net: number;
}

export type HarvestingOpportunity = HarvestOpportunity;

export interface ShortLongSplit {
  type: string;
  amount: number;
}

export function getTransactionHistory(): Transaction[] {
  return getTransactions();
}

export function getCapitalGainsSummary(): CapitalGainsSummary {
  const gains = getCapitalGains();
  const shortTerm = gains.filter(g => !g.isLongTerm);
  const longTerm = gains.filter(g => g.isLongTerm);
  const stGains = shortTerm.reduce((s, g) => s + g.adjustedGain, 0);
  const ltGains = longTerm.reduce((s, g) => s + g.adjustedGain, 0);
  const harvestOps = getHarvestOpportunities();
  const harvestingSavings = harvestOps.reduce((s, h) => s + h.potentialTaxSavings, 0);
  const totalGain = stGains + ltGains;
  const rate = totalGain > 0 ? Math.round((totalGain * 0.22) / totalGain * 100) : 0;
  return {
    taxesOwed: Math.round(stGains * 0.22 + ltGains * 0.15),
    shortTermGains: Math.round(stGains),
    longTermGains: Math.round(ltGains),
    harvestingSavings: Math.round(harvestingSavings),
    effectiveTaxRate: rate,
  };
}

export function getMonthlyGains(): MonthlyGain[] {
  const data = getMonthlyGainLoss();
  return data.map(d => ({
    month: d.month,
    gains: d.shortTermGains + d.longTermGains,
    losses: d.shortTermLosses + d.longTermLosses,
    net: d.net,
  }));
}

export function getHarvestingOpportunities(): HarvestingOpportunity[] {
  return getHarvestOpportunities();
}

export function getForm8949Preview(): Form8949Entry[] {
  return getForm8949Entries();
}

export function getShortLongSplit(): ShortLongSplit[] {
  const gains = getCapitalGains();
  const shortTerm = gains.filter(g => !g.isLongTerm).reduce((s, g) => s + Math.abs(g.adjustedGain), 0);
  const longTerm = gains.filter(g => g.isLongTerm).reduce((s, g) => s + Math.abs(g.adjustedGain), 0);
  return [
    { type: 'Short-Term', amount: Math.round(shortTerm) },
    { type: 'Long-Term', amount: Math.round(longTerm) },
  ];
}

// ---- Widget-compatible helpers ----

export function getTaxOwed(): { totalOwed: number; effectiveRate: number } {
  const summary = getCapitalGainsSummary();
  return {
    totalOwed: summary.taxesOwed,
    effectiveRate: summary.effectiveTaxRate,
  };
}
