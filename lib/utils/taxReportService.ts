// Phase 200 – One-Click Tax Report (Form 8949) Service
import { store } from '../dal/syncStore';
import {
  SCHEDULE_D_COMPLETENESS_NOTE,
  SCHEDULE_D_METHODOLOGY_DISCLAIMER,
} from './taxLotService';

// ---- Types ----

export type TaxYear = 2023 | 2024 | 2025 | 2026;
export type HoldingPeriod = 'short_term' | 'long_term';
export type TransactionType = 'sale' | 'trade' | 'gift' | 'donation' | 'loss';
export type TaxBracket = '10%' | '12%' | '22%' | '24%' | '32%' | '35%' | '37%';
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
export type ReportFormat = 'form_8949' | 'schedule_d' | 'csv' | 'turbotax' | 'hrblock';

export interface TaxableTransaction {
  id: string;
  cardName: string;
  player: string;
  description: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: number;
  costBasis: number;
  adjustments: number;
  gainLoss: number;
  holdingPeriod: HoldingPeriod;
  transactionType: TransactionType;
  gradingFees: number;
  shippingFees: number;
  platformFees: number;
  totalFees: number;
  platform: string;
  washSale: boolean;
  washSaleDisallowed: number;
  form8949Box: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

export interface TaxSummary {
  taxYear: TaxYear;
  totalProceeds: number;
  totalCostBasis: number;
  totalGainLoss: number;
  shortTermGainLoss: number;
  longTermGainLoss: number;
  totalFees: number;
  totalTransactions: number;
  washSaleAdjustments: number;
  estimatedTax: number;
  effectiveRate: number;
  carryforwardLoss: number;
  netInvestmentIncome: number;
}

export interface Form8949Entry {
  description: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: number;
  costBasis: number;
  adjustmentCode: string;
  adjustmentAmount: number;
  gainLoss: number;
  box: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

export interface ScheduleD {
  shortTermFromForm8949: number;
  shortTermOther: number;
  totalShortTerm: number;
  longTermFromForm8949: number;
  longTermOther: number;
  totalLongTerm: number;
  netGainLoss: number;
  capitalLossCarryover: number;
  taxableGain: number;
}

export interface TaxOptimization {
  id: string;
  strategy: string;
  description: string;
  potentialSavings: number;
  risk: 'low' | 'medium' | 'high';
  action: string;
  deadline: string;
  implemented: boolean;
}

export interface MonthlyBreakdown {
  month: string;
  proceeds: number;
  costBasis: number;
  gainLoss: number;
  transactions: number;
  fees: number;
}

export interface TaxSettings {
  filingStatus: FilingStatus;
  taxBracket: TaxBracket;
  stateRate: number;
  state: string;
  includeGradingFees: boolean;
  includeShippingFees: boolean;
  includePlatformFees: boolean;
  costBasisMethod: 'fifo' | 'lifo' | 'specific_id' | 'average';
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_tax_report';
const CAPITAL_LOSS_LIMIT = 3000;

const BRACKET_RATES: Record<TaxBracket, number> = {
  '10%': 0.10,
  '12%': 0.12,
  '22%': 0.22,
  '24%': 0.24,
  '32%': 0.32,
  '35%': 0.35,
  '37%': 0.37,
};

const LONG_TERM_RATES: Record<TaxBracket, number> = {
  '10%': 0.00,
  '12%': 0.00,
  '22%': 0.15,
  '24%': 0.15,
  '32%': 0.15,
  '35%': 0.15,
  '37%': 0.20,
};

const STATE_RATES: Record<string, number> = {
  'California': 0.133,
  'New York': 0.109,
  'New Jersey': 0.1075,
  'Texas': 0.0,
  'Florida': 0.0,
  'Washington': 0.0,
  'Nevada': 0.0,
  'Illinois': 0.0495,
  'Pennsylvania': 0.0307,
  'Ohio': 0.04,
  'Massachusetts': 0.05,
  'Oregon': 0.099,
  'Minnesota': 0.0985,
  'Hawaii': 0.11,
  'Georgia': 0.055,
  'Arizona': 0.025,
  'Colorado': 0.044,
  'North Carolina': 0.0475,
  'Michigan': 0.0425,
  'Virginia': 0.0575,
};

// ---- Mock Transaction Data ----

const MOCK_TRANSACTIONS: TaxableTransaction[] = [
  // 2024 transactions – short-term sales
  {
    id: 'tx-001',
    cardName: '2023 Bowman Chrome Victor Wembanyama 1st Auto PSA 10',
    player: 'Victor Wembanyama',
    description: '2023 Bowman Chrome Victor Wembanyama 1st Bowman Auto PSA 10',
    dateAcquired: '2024-01-15',
    dateSold: '2024-06-20',
    proceeds: 4850,
    costBasis: 3200,
    adjustments: 0,
    gainLoss: 1650,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 50,
    shippingFees: 25,
    platformFees: 630.50,
    totalFees: 705.50,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-002',
    cardName: '2022 Topps Chrome Julio Rodriguez RC Auto PSA 10',
    player: 'Julio Rodriguez',
    description: '2022 Topps Chrome Julio Rodriguez Rookie Chrome Auto PSA 10',
    dateAcquired: '2024-02-10',
    dateSold: '2024-05-15',
    proceeds: 1200,
    costBasis: 890,
    adjustments: 0,
    gainLoss: 310,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 15,
    platformFees: 156,
    totalFees: 201,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-003',
    cardName: '2023 Panini Prizm Chet Holmgren Silver RC PSA 9',
    player: 'Chet Holmgren',
    description: '2023 Panini Prizm Chet Holmgren Silver Prizm Rookie PSA 9',
    dateAcquired: '2024-03-01',
    dateSold: '2024-07-10',
    proceeds: 320,
    costBasis: 475,
    adjustments: 0,
    gainLoss: -155,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 20,
    shippingFees: 8,
    platformFees: 41.60,
    totalFees: 69.60,
    platform: 'COMC',
    washSale: true,
    washSaleDisallowed: 155,
    form8949Box: 'A',
  },
  {
    id: 'tx-004',
    cardName: '2020 Panini Prizm Justin Herbert RC Silver PSA 10',
    player: 'Justin Herbert',
    description: '2020 Panini Prizm Justin Herbert Rookie Silver PSA 10',
    dateAcquired: '2024-01-20',
    dateSold: '2024-09-01',
    proceeds: 680,
    costBasis: 950,
    adjustments: 0,
    gainLoss: -270,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 12,
    platformFees: 88.40,
    totalFees: 130.40,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-005',
    cardName: '2023 Topps Chrome Corbin Carroll RC Auto PSA 10',
    player: 'Corbin Carroll',
    description: '2023 Topps Chrome Corbin Carroll Rookie Auto PSA 10',
    dateAcquired: '2024-04-05',
    dateSold: '2024-08-22',
    proceeds: 2100,
    costBasis: 1450,
    adjustments: 0,
    gainLoss: 650,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 40,
    shippingFees: 18,
    platformFees: 273,
    totalFees: 331,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-006',
    cardName: '2022 Panini Select Tyreek Hill Gold /10 PSA 10',
    player: 'Tyreek Hill',
    description: '2022 Panini Select Tyreek Hill Gold /10 PSA 10',
    dateAcquired: '2024-02-28',
    dateSold: '2024-10-15',
    proceeds: 3750,
    costBasis: 2800,
    adjustments: 0,
    gainLoss: 950,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 50,
    shippingFees: 22,
    platformFees: 487.50,
    totalFees: 559.50,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'C',
  },
  {
    id: 'tx-007',
    cardName: '2023 Topps Chrome Elly De La Cruz RC Refractor PSA 10',
    player: 'Elly De La Cruz',
    description: '2023 Topps Chrome Elly De La Cruz RC Refractor PSA 10',
    dateAcquired: '2024-05-12',
    dateSold: '2024-11-08',
    proceeds: 890,
    costBasis: 550,
    adjustments: 0,
    gainLoss: 340,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 25,
    shippingFees: 10,
    platformFees: 115.70,
    totalFees: 150.70,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-008',
    cardName: '2023 Panini Prizm Jalin Hyatt RC Silver PSA 9',
    player: 'Jalin Hyatt',
    description: '2023 Panini Prizm Jalin Hyatt Rookie Silver PSA 9',
    dateAcquired: '2024-06-01',
    dateSold: '2024-12-15',
    proceeds: 45,
    costBasis: 180,
    adjustments: 0,
    gainLoss: -135,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 20,
    shippingFees: 5,
    platformFees: 5.85,
    totalFees: 30.85,
    platform: 'COMC',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-009',
    cardName: '2020 Topps Chrome Luis Robert RC Auto PSA 10',
    player: 'Luis Robert',
    description: '2020 Topps Chrome Luis Robert Rookie Auto PSA 10',
    dateAcquired: '2024-03-20',
    dateSold: '2024-09-30',
    proceeds: 1650,
    costBasis: 1100,
    adjustments: 0,
    gainLoss: 550,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 35,
    shippingFees: 15,
    platformFees: 214.50,
    totalFees: 264.50,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-010',
    cardName: '2023 Bowman Chrome Skenes 1st Bowman Auto BGS 9.5',
    player: 'Paul Skenes',
    description: '2023 Bowman Chrome Paul Skenes 1st Bowman Auto BGS 9.5',
    dateAcquired: '2024-07-01',
    dateSold: '2024-12-20',
    proceeds: 5200,
    costBasis: 3800,
    adjustments: 0,
    gainLoss: 1400,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 65,
    shippingFees: 30,
    platformFees: 676,
    totalFees: 771,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'C',
  },
  // 2024 transactions – long-term sales
  {
    id: 'tx-011',
    cardName: '2018 Topps Chrome Shohei Ohtani RC PSA 10',
    player: 'Shohei Ohtani',
    description: '2018 Topps Chrome Shohei Ohtani Rookie PSA 10',
    dateAcquired: '2022-04-10',
    dateSold: '2024-05-01',
    proceeds: 2800,
    costBasis: 1200,
    adjustments: 0,
    gainLoss: 1600,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 18,
    platformFees: 364,
    totalFees: 412,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-012',
    cardName: '2019 Panini Prizm Zion Williamson RC Silver PSA 10',
    player: 'Zion Williamson',
    description: '2019 Panini Prizm Zion Williamson Rookie Silver PSA 10',
    dateAcquired: '2020-01-15',
    dateSold: '2024-03-20',
    proceeds: 450,
    costBasis: 1800,
    adjustments: 0,
    gainLoss: -1350,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 12,
    platformFees: 58.50,
    totalFees: 100.50,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-013',
    cardName: '2021 Topps Chrome Fernando Tatis Jr. Refractor PSA 10',
    player: 'Fernando Tatis Jr.',
    description: '2021 Topps Chrome Fernando Tatis Jr. Refractor PSA 10',
    dateAcquired: '2022-06-10',
    dateSold: '2024-08-15',
    proceeds: 380,
    costBasis: 650,
    adjustments: 0,
    gainLoss: -270,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 25,
    shippingFees: 10,
    platformFees: 49.40,
    totalFees: 84.40,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-014',
    cardName: '2018 Panini Prizm Luka Doncic RC Silver PSA 10',
    player: 'Luka Doncic',
    description: '2018 Panini Prizm Luka Doncic Rookie Silver PSA 10',
    dateAcquired: '2019-09-01',
    dateSold: '2024-02-28',
    proceeds: 6500,
    costBasis: 2400,
    adjustments: 0,
    gainLoss: 4100,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 50,
    shippingFees: 30,
    platformFees: 845,
    totalFees: 925,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'F',
  },
  {
    id: 'tx-015',
    cardName: '2020 Topps Chrome Kyle Lewis RC Auto PSA 10',
    player: 'Kyle Lewis',
    description: '2020 Topps Chrome Kyle Lewis Rookie Auto PSA 10',
    dateAcquired: '2021-02-20',
    dateSold: '2024-04-10',
    proceeds: 85,
    costBasis: 420,
    adjustments: 0,
    gainLoss: -335,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 10,
    platformFees: 11.05,
    totalFees: 51.05,
    platform: 'COMC',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-016',
    cardName: '2019 Topps Chrome Yordan Alvarez RC Auto PSA 10',
    player: 'Yordan Alvarez',
    description: '2019 Topps Chrome Yordan Alvarez Rookie Auto PSA 10',
    dateAcquired: '2022-08-15',
    dateSold: '2024-11-20',
    proceeds: 1850,
    costBasis: 800,
    adjustments: 0,
    gainLoss: 1050,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 35,
    shippingFees: 15,
    platformFees: 240.50,
    totalFees: 290.50,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-017',
    cardName: '2020 Panini Prizm Joe Burrow RC Silver PSA 10',
    player: 'Joe Burrow',
    description: '2020 Panini Prizm Joe Burrow Rookie Silver PSA 10',
    dateAcquired: '2021-01-10',
    dateSold: '2024-06-15',
    proceeds: 1100,
    costBasis: 750,
    adjustments: 0,
    gainLoss: 350,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 12,
    platformFees: 143,
    totalFees: 185,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-018',
    cardName: '2021 Panini Prizm Trevor Lawrence RC Gold /10 BGS 9.5',
    player: 'Trevor Lawrence',
    description: '2021 Panini Prizm Trevor Lawrence Rookie Gold /10 BGS 9.5',
    dateAcquired: '2022-03-01',
    dateSold: '2024-10-05',
    proceeds: 2200,
    costBasis: 3500,
    adjustments: 0,
    gainLoss: -1300,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 65,
    shippingFees: 25,
    platformFees: 286,
    totalFees: 376,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'F',
  },
  // 2025 transactions – short-term
  {
    id: 'tx-019',
    cardName: '2024 Topps Chrome Jackson Holliday RC Auto PSA 10',
    player: 'Jackson Holliday',
    description: '2024 Topps Chrome Jackson Holliday Rookie Auto PSA 10',
    dateAcquired: '2025-01-10',
    dateSold: '2025-04-15',
    proceeds: 1800,
    costBasis: 2500,
    adjustments: 0,
    gainLoss: -700,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 40,
    shippingFees: 18,
    platformFees: 234,
    totalFees: 292,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-020',
    cardName: '2024 Panini Prizm Caleb Williams RC Silver PSA 10',
    player: 'Caleb Williams',
    description: '2024 Panini Prizm Caleb Williams Rookie Silver PSA 10',
    dateAcquired: '2025-02-01',
    dateSold: '2025-06-20',
    proceeds: 950,
    costBasis: 600,
    adjustments: 0,
    gainLoss: 350,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 25,
    shippingFees: 10,
    platformFees: 123.50,
    totalFees: 158.50,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-021',
    cardName: '2024 Topps Chrome Paul Skenes RC Auto BGS 9.5',
    player: 'Paul Skenes',
    description: '2024 Topps Chrome Paul Skenes Rookie Auto BGS 9.5',
    dateAcquired: '2025-03-15',
    dateSold: '2025-07-30',
    proceeds: 3400,
    costBasis: 2200,
    adjustments: 0,
    gainLoss: 1200,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 50,
    shippingFees: 22,
    platformFees: 442,
    totalFees: 514,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'C',
  },
  {
    id: 'tx-022',
    cardName: '2024 Panini Prizm Jayden Daniels RC Silver PSA 10',
    player: 'Jayden Daniels',
    description: '2024 Panini Prizm Jayden Daniels Rookie Silver PSA 10',
    dateAcquired: '2025-01-20',
    dateSold: '2025-05-10',
    proceeds: 780,
    costBasis: 450,
    adjustments: 0,
    gainLoss: 330,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 25,
    shippingFees: 10,
    platformFees: 101.40,
    totalFees: 136.40,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-023',
    cardName: '2024 Bowman Chrome Travis Bazzana 1st Auto PSA 10',
    player: 'Travis Bazzana',
    description: '2024 Bowman Chrome Travis Bazzana 1st Bowman Auto PSA 10',
    dateAcquired: '2025-04-01',
    dateSold: '2025-08-15',
    proceeds: 2600,
    costBasis: 1800,
    adjustments: 0,
    gainLoss: 800,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 45,
    shippingFees: 20,
    platformFees: 338,
    totalFees: 403,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'C',
  },
  {
    id: 'tx-024',
    cardName: '2024 Topps Chrome Junior Caminero RC Refractor PSA 10',
    player: 'Junior Caminero',
    description: '2024 Topps Chrome Junior Caminero RC Refractor PSA 10',
    dateAcquired: '2025-02-15',
    dateSold: '2025-06-01',
    proceeds: 250,
    costBasis: 380,
    adjustments: 0,
    gainLoss: -130,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 20,
    shippingFees: 8,
    platformFees: 32.50,
    totalFees: 60.50,
    platform: 'COMC',
    washSale: true,
    washSaleDisallowed: 130,
    form8949Box: 'A',
  },
  {
    id: 'tx-025',
    cardName: '2024 Panini Prizm Marvin Harrison Jr. RC Silver PSA 10',
    player: 'Marvin Harrison Jr.',
    description: '2024 Panini Prizm Marvin Harrison Jr. Rookie Silver PSA 10',
    dateAcquired: '2025-03-01',
    dateSold: '2025-09-15',
    proceeds: 520,
    costBasis: 700,
    adjustments: 0,
    gainLoss: -180,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 25,
    shippingFees: 10,
    platformFees: 67.60,
    totalFees: 102.60,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-026',
    cardName: '2024 Topps Chrome Wyatt Langford RC Auto PSA 10',
    player: 'Wyatt Langford',
    description: '2024 Topps Chrome Wyatt Langford Rookie Auto PSA 10',
    dateAcquired: '2025-05-01',
    dateSold: '2025-10-20',
    proceeds: 680,
    costBasis: 900,
    adjustments: 0,
    gainLoss: -220,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 12,
    platformFees: 88.40,
    totalFees: 130.40,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-027',
    cardName: '2024 Panini Prizm Drake Maye RC Silver PSA 9',
    player: 'Drake Maye',
    description: '2024 Panini Prizm Drake Maye Rookie Silver PSA 9',
    dateAcquired: '2025-02-10',
    dateSold: '2025-07-05',
    proceeds: 320,
    costBasis: 200,
    adjustments: 0,
    gainLoss: 120,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 20,
    shippingFees: 8,
    platformFees: 41.60,
    totalFees: 69.60,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-028',
    cardName: '2023 Panini Prizm Anthony Richardson RC Silver PSA 10',
    player: 'Anthony Richardson',
    description: '2023 Panini Prizm Anthony Richardson RC Silver PSA 10',
    dateAcquired: '2025-01-05',
    dateSold: '2025-03-20',
    proceeds: 140,
    costBasis: 350,
    adjustments: 0,
    gainLoss: -210,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 20,
    shippingFees: 8,
    platformFees: 18.20,
    totalFees: 46.20,
    platform: 'COMC',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  // 2025 transactions – long-term
  {
    id: 'tx-029',
    cardName: '2022 Topps Chrome Adley Rutschman RC Auto PSA 10',
    player: 'Adley Rutschman',
    description: '2022 Topps Chrome Adley Rutschman Rookie Auto PSA 10',
    dateAcquired: '2023-03-10',
    dateSold: '2025-04-01',
    proceeds: 1400,
    costBasis: 900,
    adjustments: 0,
    gainLoss: 500,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 35,
    shippingFees: 15,
    platformFees: 182,
    totalFees: 232,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-030',
    cardName: '2021 Topps Chrome Bobby Witt Jr. RC Auto PSA 10',
    player: 'Bobby Witt Jr.',
    description: '2021 Topps Chrome Bobby Witt Jr. Rookie Auto PSA 10',
    dateAcquired: '2022-07-20',
    dateSold: '2025-02-15',
    proceeds: 3200,
    costBasis: 1500,
    adjustments: 0,
    gainLoss: 1700,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 45,
    shippingFees: 20,
    platformFees: 416,
    totalFees: 481,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'F',
  },
  {
    id: 'tx-031',
    cardName: '2019 Panini Prizm Ja Morant RC Silver PSA 10',
    player: 'Ja Morant',
    description: '2019 Panini Prizm Ja Morant Rookie Silver PSA 10',
    dateAcquired: '2020-06-15',
    dateSold: '2025-01-10',
    proceeds: 700,
    costBasis: 2200,
    adjustments: 0,
    gainLoss: -1500,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 12,
    platformFees: 91,
    totalFees: 133,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-032',
    cardName: '2020 Topps Chrome Ke\'Bryan Hayes RC Auto PSA 10',
    player: 'Ke\'Bryan Hayes',
    description: '2020 Topps Chrome Ke\'Bryan Hayes Rookie Auto PSA 10',
    dateAcquired: '2021-05-01',
    dateSold: '2025-06-20',
    proceeds: 120,
    costBasis: 550,
    adjustments: 0,
    gainLoss: -430,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 10,
    platformFees: 15.60,
    totalFees: 55.60,
    platform: 'COMC',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-033',
    cardName: '2020 Panini Prizm Tua Tagovailoa RC Silver PSA 10',
    player: 'Tua Tagovailoa',
    description: '2020 Panini Prizm Tua Tagovailoa Rookie Silver PSA 10',
    dateAcquired: '2021-03-15',
    dateSold: '2025-05-01',
    proceeds: 280,
    costBasis: 450,
    adjustments: 0,
    gainLoss: -170,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 25,
    shippingFees: 10,
    platformFees: 36.40,
    totalFees: 71.40,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-034',
    cardName: '2022 Panini Prizm Paolo Banchero RC Silver PSA 10',
    player: 'Paolo Banchero',
    description: '2022 Panini Prizm Paolo Banchero Rookie Silver PSA 10',
    dateAcquired: '2023-01-20',
    dateSold: '2025-03-10',
    proceeds: 380,
    costBasis: 550,
    adjustments: 0,
    gainLoss: -170,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 25,
    shippingFees: 10,
    platformFees: 49.40,
    totalFees: 84.40,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  // 2025 trades and donations
  {
    id: 'tx-035',
    cardName: '2023 Topps Chrome Gunnar Henderson RC Auto PSA 10',
    player: 'Gunnar Henderson',
    description: '2023 Topps Chrome Gunnar Henderson RC Auto PSA 10 (Trade)',
    dateAcquired: '2023-09-01',
    dateSold: '2025-08-01',
    proceeds: 2800,
    costBasis: 1600,
    adjustments: 0,
    gainLoss: 1200,
    holdingPeriod: 'long_term',
    transactionType: 'trade',
    gradingFees: 40,
    shippingFees: 18,
    platformFees: 0,
    totalFees: 58,
    platform: 'Private Trade',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-036',
    cardName: '2022 Panini National Treasures Breece Hall RPA /99',
    player: 'Breece Hall',
    description: '2022 Panini National Treasures Breece Hall RPA /99 (Donation)',
    dateAcquired: '2023-02-15',
    dateSold: '2025-09-01',
    proceeds: 0,
    costBasis: 800,
    adjustments: -800,
    gainLoss: -800,
    holdingPeriod: 'long_term',
    transactionType: 'donation',
    gradingFees: 0,
    shippingFees: 0,
    platformFees: 0,
    totalFees: 0,
    platform: 'Charitable Donation',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  // Additional 2024 transactions
  {
    id: 'tx-037',
    cardName: '2023 Topps Chrome Ronald Acuna Jr. Refractor PSA 10',
    player: 'Ronald Acuna Jr.',
    description: '2023 Topps Chrome Ronald Acuna Jr. Refractor PSA 10',
    dateAcquired: '2024-01-05',
    dateSold: '2024-07-15',
    proceeds: 420,
    costBasis: 280,
    adjustments: 0,
    gainLoss: 140,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 20,
    shippingFees: 8,
    platformFees: 54.60,
    totalFees: 82.60,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-038',
    cardName: '2023 Panini Prizm CJ Stroud RC Silver PSA 10',
    player: 'CJ Stroud',
    description: '2023 Panini Prizm CJ Stroud Rookie Silver PSA 10',
    dateAcquired: '2024-04-20',
    dateSold: '2024-11-30',
    proceeds: 1650,
    costBasis: 800,
    adjustments: 0,
    gainLoss: 850,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 12,
    platformFees: 214.50,
    totalFees: 256.50,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
  {
    id: 'tx-039',
    cardName: '2020 Panini Prizm Anthony Edwards RC Silver PSA 10',
    player: 'Anthony Edwards',
    description: '2020 Panini Prizm Anthony Edwards Rookie Silver PSA 10',
    dateAcquired: '2021-12-01',
    dateSold: '2024-04-20',
    proceeds: 4200,
    costBasis: 1500,
    adjustments: 0,
    gainLoss: 2700,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 35,
    shippingFees: 20,
    platformFees: 546,
    totalFees: 601,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'F',
  },
  {
    id: 'tx-040',
    cardName: '2024 Bowman Chrome Charlie Condon 1st Auto PSA 10',
    player: 'Charlie Condon',
    description: '2024 Bowman Chrome Charlie Condon 1st Bowman Auto PSA 10',
    dateAcquired: '2025-06-01',
    dateSold: '2025-11-15',
    proceeds: 1900,
    costBasis: 1200,
    adjustments: 0,
    gainLoss: 700,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 40,
    shippingFees: 18,
    platformFees: 247,
    totalFees: 305,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'C',
  },
  {
    id: 'tx-041',
    cardName: '2022 Topps Chrome Michael Harris II RC Auto PSA 10',
    player: 'Michael Harris II',
    description: '2022 Topps Chrome Michael Harris II Rookie Auto PSA 10',
    dateAcquired: '2023-04-10',
    dateSold: '2025-07-15',
    proceeds: 950,
    costBasis: 650,
    adjustments: 0,
    gainLoss: 300,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 12,
    platformFees: 123.50,
    totalFees: 165.50,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-042',
    cardName: '2023 Topps Chrome Jasson Dominguez RC Auto PSA 10',
    player: 'Jasson Dominguez',
    description: '2023 Topps Chrome Jasson Dominguez Rookie Auto PSA 10',
    dateAcquired: '2024-08-01',
    dateSold: '2025-02-28',
    proceeds: 450,
    costBasis: 1100,
    adjustments: 0,
    gainLoss: -650,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 12,
    platformFees: 58.50,
    totalFees: 100.50,
    platform: 'eBay',
    washSale: true,
    washSaleDisallowed: 650,
    form8949Box: 'A',
  },
  {
    id: 'tx-043',
    cardName: '2023 Panini Prizm Lamar Jackson Gold /10 PSA 10',
    player: 'Lamar Jackson',
    description: '2023 Panini Prizm Lamar Jackson Gold /10 PSA 10',
    dateAcquired: '2024-09-15',
    dateSold: '2025-01-20',
    proceeds: 4800,
    costBasis: 3200,
    adjustments: 0,
    gainLoss: 1600,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 65,
    shippingFees: 30,
    platformFees: 624,
    totalFees: 719,
    platform: 'Goldin',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'C',
  },
  {
    id: 'tx-044',
    cardName: '2019 Topps Chrome Bo Bichette RC Auto PSA 10',
    player: 'Bo Bichette',
    description: '2019 Topps Chrome Bo Bichette Rookie Auto PSA 10',
    dateAcquired: '2020-11-10',
    dateSold: '2024-12-01',
    proceeds: 380,
    costBasis: 600,
    adjustments: 0,
    gainLoss: -220,
    holdingPeriod: 'long_term',
    transactionType: 'sale',
    gradingFees: 30,
    shippingFees: 12,
    platformFees: 49.40,
    totalFees: 91.40,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'D',
  },
  {
    id: 'tx-045',
    cardName: '2024 Topps Chrome Jackson Merrill RC Auto PSA 10',
    player: 'Jackson Merrill',
    description: '2024 Topps Chrome Jackson Merrill Rookie Auto PSA 10',
    dateAcquired: '2025-04-15',
    dateSold: '2025-10-01',
    proceeds: 1350,
    costBasis: 850,
    adjustments: 0,
    gainLoss: 500,
    holdingPeriod: 'short_term',
    transactionType: 'sale',
    gradingFees: 35,
    shippingFees: 15,
    platformFees: 175.50,
    totalFees: 225.50,
    platform: 'eBay',
    washSale: false,
    washSaleDisallowed: 0,
    form8949Box: 'A',
  },
];

// ---- Mock Tax Optimizations ----

const MOCK_OPTIMIZATIONS: TaxOptimization[] = [
  {
    id: 'opt-001',
    strategy: 'Tax-Loss Harvesting',
    description: 'Sell underperforming Zion Williamson and Ja Morant holdings to offset short-term capital gains. Current unrealized losses of ~$2,400 available.',
    potentialSavings: 528,
    risk: 'low',
    action: 'Sell specific lots with unrealized losses before Dec 31',
    deadline: '2025-12-31',
    implemented: false,
  },
  {
    id: 'opt-002',
    strategy: 'Long-Term Holding Conversion',
    description: 'Hold 8 cards past 1-year mark to convert from short-term (up to 37%) to long-term capital gains rate (0-20%).',
    potentialSavings: 1850,
    risk: 'medium',
    action: 'Delay sales of identified cards until holding period exceeds 365 days',
    deadline: '2025-12-31',
    implemented: false,
  },
  {
    id: 'opt-003',
    strategy: 'Charitable Donation Strategy',
    description: 'Donate highly appreciated cards held >1 year to qualified charities. Deduct FMV without paying capital gains.',
    potentialSavings: 2100,
    risk: 'low',
    action: 'Donate 2022 Luka Doncic or similar appreciated long-term holdings',
    deadline: '2025-12-31',
    implemented: false,
  },
  {
    id: 'opt-004',
    strategy: 'Wash Sale Avoidance',
    description: 'Wait 31 days before repurchasing substantially identical cards after selling at a loss. Currently 3 transactions flagged.',
    potentialSavings: 206,
    risk: 'low',
    action: 'Review flagged wash sale transactions and adjust repurchase timing',
    deadline: '2025-12-31',
    implemented: false,
  },
  {
    id: 'opt-005',
    strategy: 'Fee Deduction Optimization',
    description: 'Ensure all grading, shipping, and platform fees are included in cost basis calculations to reduce taxable gains.',
    potentialSavings: 1420,
    risk: 'low',
    action: 'Audit fee records and update cost basis for all transactions',
    deadline: '2026-04-15',
    implemented: true,
  },
  {
    id: 'opt-006',
    strategy: 'Capital Loss Carryforward',
    description: 'Unused capital losses exceeding $3,000 annual limit can be carried forward to future tax years.',
    potentialSavings: 740,
    risk: 'low',
    action: 'Track carryforward amounts for 2026 tax planning',
    deadline: '2026-04-15',
    implemented: false,
  },
  {
    id: 'opt-007',
    strategy: 'Specific Identification Method',
    description: 'Switch from FIFO to specific identification for cost basis to strategically select lots with highest basis.',
    potentialSavings: 960,
    risk: 'medium',
    action: 'Elect specific identification method and document lot selections',
    deadline: '2025-12-31',
    implemented: false,
  },
  {
    id: 'opt-008',
    strategy: 'Quarterly Estimated Payments',
    description: 'Make quarterly estimated tax payments to avoid underpayment penalty. Current gains may trigger requirement.',
    potentialSavings: 320,
    risk: 'low',
    action: 'Calculate and submit Form 1040-ES quarterly payments',
    deadline: '2025-09-15',
    implemented: false,
  },
];

// ---- Helper Functions ----

export function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return n < 0 ? `-${formatted}` : formatted;
}

export function formatDate(d: string): string {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export function getHoldingPeriodLabel(hp: HoldingPeriod): string {
  return hp === 'short_term' ? 'Short-Term' : 'Long-Term';
}

// ---- localStorage Helpers ----

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(`${STORAGE_PREFIX}_${key}`, fallback);
}

function saveToStorage<T>(key: string, value: T): void {
  store.set(`${STORAGE_PREFIX}_${key}`, value);
}

// ---- Exported Functions ----

export function getTransactions(year?: TaxYear): TaxableTransaction[] {
  const all = MOCK_TRANSACTIONS;
  if (!year) return all;
  return all.filter((tx) => {
    const soldYear = new Date(tx.dateSold + 'T00:00:00').getFullYear();
    return soldYear === year;
  });
}

export function getTaxSummary(year?: TaxYear): TaxSummary {
  const txs = getTransactions(year);
  const settings = getTaxSettings();
  const taxYear: TaxYear = year ?? 2025;

  const totalProceeds = txs.reduce((s, t) => s + t.proceeds, 0);
  const totalCostBasis = txs.reduce((s, t) => s + t.costBasis, 0);
  const totalGainLoss = txs.reduce((s, t) => s + t.gainLoss, 0);

  const shortTermTxs = txs.filter((t) => t.holdingPeriod === 'short_term');
  const longTermTxs = txs.filter((t) => t.holdingPeriod === 'long_term');

  const shortTermGainLoss = shortTermTxs.reduce((s, t) => s + t.gainLoss, 0);
  const longTermGainLoss = longTermTxs.reduce((s, t) => s + t.gainLoss, 0);

  const totalFees = txs.reduce((s, t) => s + t.totalFees, 0);
  const washSaleAdjustments = txs.reduce((s, t) => s + t.washSaleDisallowed, 0);

  const estimatedTax = calculateEstimatedTax(totalGainLoss, settings.filingStatus, settings.taxBracket);
  const effectiveRate = totalProceeds > 0 ? Math.round((estimatedTax / totalGainLoss) * 10000) / 100 : 0;

  const netLoss = totalGainLoss < 0 ? totalGainLoss : 0;
  const carryforwardLoss = netLoss < -CAPITAL_LOSS_LIMIT ? netLoss + CAPITAL_LOSS_LIMIT : 0;

  return {
    taxYear,
    totalProceeds,
    totalCostBasis,
    totalGainLoss,
    shortTermGainLoss,
    longTermGainLoss,
    totalFees,
    totalTransactions: txs.length,
    washSaleAdjustments,
    estimatedTax: Math.max(0, estimatedTax),
    effectiveRate: totalGainLoss > 0 ? effectiveRate : 0,
    carryforwardLoss,
    netInvestmentIncome: totalGainLoss > 0 ? totalGainLoss : 0,
  };
}

export function generateForm8949(year?: TaxYear): Form8949Entry[] {
  const txs = getTransactions(year);
  return txs.map((tx) => ({
    description: tx.description,
    dateAcquired: tx.dateAcquired,
    dateSold: tx.dateSold,
    proceeds: tx.proceeds,
    costBasis: tx.costBasis,
    adjustmentCode: tx.washSale ? 'W' : tx.adjustments !== 0 ? 'B' : '',
    adjustmentAmount: tx.washSale ? tx.washSaleDisallowed : tx.adjustments,
    gainLoss: tx.gainLoss + (tx.washSale ? tx.washSaleDisallowed : 0),
    box: tx.form8949Box,
  }));
}

export function buildScheduleDStyleExport(year?: TaxYear): string {
  const txs = getTransactions(year);
  const summary = getTaxSummary(year);
  const scheduleD = generateScheduleD(year);
  const shortTerm = txs.filter((tx) => tx.holdingPeriod === 'short_term');
  const longTerm = txs.filter((tx) => tx.holdingPeriod === 'long_term');
  const stProceeds = shortTerm.reduce((s, t) => s + t.proceeds, 0);
  const stBasis = shortTerm.reduce((s, t) => s + t.costBasis, 0);
  const ltProceeds = longTerm.reduce((s, t) => s + t.proceeds, 0);
  const ltBasis = longTerm.reduce((s, t) => s + t.costBasis, 0);

  let output = 'MSI Schedule D–style packet — Capital Gains and Losses\n';
  output += `Tax Year: ${summary.taxYear}\n`;
  output += `Generated: ${new Date().toISOString()}\n\n`;
  output += 'Part I — Short-term (< 1 year)\n';
  output += `  Lots: ${shortTerm.length}\n`;
  output += `  Proceeds: ${formatCurrency(stProceeds)}\n`;
  output += `  Cost basis: ${formatCurrency(stBasis)}\n`;
  output += `  Line 7 (Form 8949 Boxes A–C): ${formatCurrency(scheduleD.shortTermFromForm8949)}\n`;
  output += `  Total short-term: ${formatCurrency(scheduleD.totalShortTerm)}\n\n`;
  output += 'Part II — Long-term (≥ 1 year)\n';
  output += `  Lots: ${longTerm.length}\n`;
  output += `  Proceeds: ${formatCurrency(ltProceeds)}\n`;
  output += `  Cost basis: ${formatCurrency(ltBasis)}\n`;
  output += `  Line 15 (Form 8949 Boxes D–F): ${formatCurrency(scheduleD.longTermFromForm8949)}\n`;
  output += `  Total long-term: ${formatCurrency(scheduleD.totalLongTerm)}\n\n`;
  output += 'Part III — Totals\n';
  output += `  Dispositions: ${summary.totalTransactions}\n`;
  output += `  Net gain/loss: ${formatCurrency(scheduleD.netGainLoss)}\n`;
  output += `  Capital loss carryover (illustrative): ${formatCurrency(scheduleD.capitalLossCarryover)}\n`;
  output += `  Taxable gain (illustrative): ${formatCurrency(scheduleD.taxableGain)}\n\n`;
  output += 'Methodology\n';
  output += `${SCHEDULE_D_METHODOLOGY_DISCLAIMER}\n\n`;
  output += `${SCHEDULE_D_COMPLETENESS_NOTE}\n`;
  return output;
}

export function generateScheduleD(year?: TaxYear): ScheduleD {
  const entries = generateForm8949(year);

  const shortTermEntries = entries.filter((e) => ['A', 'B', 'C'].includes(e.box));
  const longTermEntries = entries.filter((e) => ['D', 'E', 'F'].includes(e.box));

  const shortTermFromForm8949 = shortTermEntries.reduce((s, e) => s + e.gainLoss, 0);
  const longTermFromForm8949 = longTermEntries.reduce((s, e) => s + e.gainLoss, 0);

  const totalShortTerm = shortTermFromForm8949;
  const totalLongTerm = longTermFromForm8949;
  const netGainLoss = totalShortTerm + totalLongTerm;

  const capitalLossCarryover = netGainLoss < -CAPITAL_LOSS_LIMIT ? Math.abs(netGainLoss + CAPITAL_LOSS_LIMIT) : 0;
  const taxableGain = netGainLoss > 0 ? netGainLoss : Math.max(netGainLoss, -CAPITAL_LOSS_LIMIT);

  return {
    shortTermFromForm8949,
    shortTermOther: 0,
    totalShortTerm,
    longTermFromForm8949,
    longTermOther: 0,
    totalLongTerm,
    netGainLoss,
    capitalLossCarryover,
    taxableGain,
  };
}

export function getTaxOptimizations(): TaxOptimization[] {
  const stored = loadFromStorage<TaxOptimization[]>('optimizations', []);
  if (stored.length > 0) return stored;
  return MOCK_OPTIMIZATIONS;
}

export function getMonthlyBreakdown(year?: TaxYear): MonthlyBreakdown[] {
  const txs = getTransactions(year);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return months.map((month, idx) => {
    const monthTxs = txs.filter((tx) => {
      const d = new Date(tx.dateSold + 'T00:00:00');
      return d.getMonth() === idx;
    });

    return {
      month,
      proceeds: monthTxs.reduce((s, t) => s + t.proceeds, 0),
      costBasis: monthTxs.reduce((s, t) => s + t.costBasis, 0),
      gainLoss: monthTxs.reduce((s, t) => s + t.gainLoss, 0),
      transactions: monthTxs.length,
      fees: monthTxs.reduce((s, t) => s + t.totalFees, 0),
    };
  });
}

export function getTaxSettings(): TaxSettings {
  return loadFromStorage<TaxSettings>('settings', {
    filingStatus: 'single',
    taxBracket: '22%',
    stateRate: 0.05,
    state: 'California',
    includeGradingFees: true,
    includeShippingFees: true,
    includePlatformFees: true,
    costBasisMethod: 'fifo',
  });
}

export function updateTaxSettings(settings: Partial<TaxSettings>): TaxSettings {
  const current = getTaxSettings();
  const updated = { ...current, ...settings };
  if (settings.state && STATE_RATES[settings.state] !== undefined) {
    updated.stateRate = STATE_RATES[settings.state];
  }
  saveToStorage('settings', updated);
  return updated;
}

export function calculateEstimatedTax(
  gainLoss: number,
  filingStatus: FilingStatus,
  bracket: TaxBracket,
): number {
  if (gainLoss <= 0) return 0;

  // For simplicity we assume all short-term gains taxed at ordinary rate
  // and approximate a blended rate. In production this would split ST/LT.
  const federalRate = BRACKET_RATES[bracket];
  const longTermRate = LONG_TERM_RATES[bracket];

  // Use a blended approach: 60% short-term, 40% long-term (approximation)
  const blendedRate = federalRate * 0.6 + longTermRate * 0.4;

  // Net investment income tax (3.8%) for higher brackets
  const niitThresholds: Record<FilingStatus, number> = {
    single: 200000,
    married_joint: 250000,
    married_separate: 125000,
    head_of_household: 200000,
  };
  const niit = gainLoss > niitThresholds[filingStatus] ? 0.038 : 0;

  const settings = getTaxSettings();
  const stateRate = settings.stateRate;

  const totalRate = blendedRate + stateRate + niit;
  return Math.round(gainLoss * totalRate);
}

export function getWashSaleTransactions(): TaxableTransaction[] {
  return MOCK_TRANSACTIONS.filter((tx) => tx.washSale);
}

export function exportReport(format: ReportFormat, year?: TaxYear): string {
  const txs = getTransactions(year);
  const summary = getTaxSummary(year);
  const entries = generateForm8949(year);

  switch (format) {
    case 'form_8949': {
      const header = 'Form 8949 - Sales and Other Dispositions of Capital Assets\n';
      const subHeader = `Tax Year: ${summary.taxYear}\n\n`;

      const boxGroups: Record<string, Form8949Entry[]> = {};
      for (const entry of entries) {
        if (!boxGroups[entry.box]) boxGroups[entry.box] = [];
        boxGroups[entry.box].push(entry);
      }

      let output = header + subHeader;
      for (const [box, items] of Object.entries(boxGroups)) {
        output += `--- Box ${box} ---\n`;
        output += 'Description | Date Acquired | Date Sold | Proceeds | Cost Basis | Adj Code | Adj Amount | Gain/Loss\n';
        output += '-'.repeat(120) + '\n';
        for (const item of items) {
          output += `${item.description} | ${formatDate(item.dateAcquired)} | ${formatDate(item.dateSold)} | ${formatCurrency(item.proceeds)} | ${formatCurrency(item.costBasis)} | ${item.adjustmentCode || '-'} | ${formatCurrency(item.adjustmentAmount)} | ${formatCurrency(item.gainLoss)}\n`;
        }
        const boxTotal = items.reduce((s, i) => s + i.gainLoss, 0);
        output += `Box ${box} Total: ${formatCurrency(boxTotal)}\n\n`;
      }

      return output;
    }

    case 'schedule_d':
      return buildScheduleDStyleExport(year);

    case 'csv': {
      const headers = 'Description,Date Acquired,Date Sold,Proceeds,Cost Basis,Adjustment Code,Adjustment Amount,Gain/Loss,Box,Holding Period,Platform,Wash Sale\n';
      const rows = txs.map((tx) =>
        `"${tx.description}",${tx.dateAcquired},${tx.dateSold},${tx.proceeds},${tx.costBasis},${tx.washSale ? 'W' : ''},${tx.washSaleDisallowed},${tx.gainLoss},${tx.form8949Box},${tx.holdingPeriod},${tx.platform},${tx.washSale}`
      ).join('\n');
      return headers + rows;
    }

    case 'turbotax': {
      let output = 'TXF\nV042\nA TurboTax Import File\nD ' + summary.taxYear + '\n^\n';
      for (const tx of txs) {
        output += 'TD\n';
        output += `N323\n`; // Form 8949 code
        output += `C1\n`;
        output += `L1\n`;
        output += `P${tx.description}\n`;
        output += `D${formatDate(tx.dateAcquired)}\n`;
        output += `D${formatDate(tx.dateSold)}\n`;
        output += `$${tx.costBasis.toFixed(2)}\n`;
        output += `$${tx.proceeds.toFixed(2)}\n`;
        output += '^\n';
      }
      return output;
    }

    case 'hrblock': {
      let output = `H&R Block Import - Tax Year ${summary.taxYear}\n`;
      output += 'Transaction Type,Description,Acquired,Sold,Cost Basis,Proceeds,Gain/Loss\n';
      for (const tx of txs) {
        output += `Capital ${tx.holdingPeriod === 'short_term' ? 'Short' : 'Long'},"${tx.description}",${formatDate(tx.dateAcquired)},${formatDate(tx.dateSold)},${tx.costBasis.toFixed(2)},${tx.proceeds.toFixed(2)},${tx.gainLoss.toFixed(2)}\n`;
      }
      output += `\nSummary:\n`;
      output += `Total Proceeds: ${summary.totalProceeds.toFixed(2)}\n`;
      output += `Total Cost Basis: ${summary.totalCostBasis.toFixed(2)}\n`;
      output += `Net Gain/Loss: ${summary.totalGainLoss.toFixed(2)}\n`;
      return output;
    }

    default:
      return 'Unsupported format';
  }
}
