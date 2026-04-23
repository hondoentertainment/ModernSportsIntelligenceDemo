// @ts-nocheck
// Tax Autopilot Service — Hobby Income Tax Classification & Estimation
// Feature #137: Auto-categorizes hobby vs investment income, tracks 1099-K
// thresholds, Schedule C/D recommendations, IRS dealer/collector status,
// and quarterly estimated tax calculations.

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface TaxProfile {
  taxYear: number;
  filingStatus: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';
  ordinaryRate: number;
  longTermRate: number;
  selfEmploymentRate: number;
  stateRate: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  isDealerClassified: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'buy' | 'sell' | 'trade';
  cardName: string;
  platform: string;
  amount: number;
  costBasis: number;
  gain: number;
  holdingDays: number;
  category: TaxCategoryType;
  description: string;
}

export type TaxCategoryType =
  | 'hobby_income'
  | 'investment_gain_short'
  | 'investment_gain_long'
  | 'dealer_inventory'
  | 'trade_exchange'
  | 'hobby_expense'
  | 'business_expense';

export interface TaxCategory {
  type: TaxCategoryType;
  label: string;
  total: number;
  count: number;
  scheduleType: 'C' | 'D' | '1' | 'none';
  color: string;
}

export interface QuarterlyEstimate {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  dueDate: string;
  estimatedIncome: number;
  estimatedTax: number;
  selfEmploymentTax: number;
  totalDue: number;
  paid: boolean;
  paidAmount: number;
  status: 'paid' | 'upcoming' | 'overdue' | 'current';
}

export interface ThresholdTracker {
  platform: string;
  grossSales: number;
  transactionCount: number;
  threshold1099K: number;
  oldThresholdAmount: number;
  oldThresholdTransactions: number;
  percentToThreshold: number;
  will1099BeIssued: boolean;
  projectedYearEnd: number;
}

export interface IRSClassification {
  status: 'dealer' | 'collector' | 'investor' | 'hybrid';
  confidence: number;
  factors: IRSFactor[];
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface IRSFactor {
  name: string;
  description: string;
  weight: number;
  score: number;
  maxScore: number;
  met: boolean;
  details: string;
}

export interface TaxRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'schedule' | 'deduction' | 'timing' | 'classification' | 'compliance';
  title: string;
  description: string;
  potentialSavings: number;
  action: string;
  deadline?: string;
}

export interface ScheduleComparison {
  schedule: 'C' | 'D';
  label: string;
  taxableIncome: number;
  estimatedTax: number;
  selfEmploymentTax: number;
  totalTax: number;
  allowedDeductions: string[];
  limitations: string[];
  netAfterTax: number;
}

export interface TaxSummary {
  profile: TaxProfile;
  categories: TaxCategory[];
  quarterlyEstimates: QuarterlyEstimate[];
  thresholds: ThresholdTracker[];
  classification: IRSClassification;
  recommendations: TaxRecommendation[];
  scheduleComparison: ScheduleComparison[];
  inventoryMethod: 'FIFO' | 'LIFO' | 'specific_id';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THRESHOLD_1099K_CURRENT = 600;
const THRESHOLD_1099K_OLD_AMOUNT = 20000;
const THRESHOLD_1099K_OLD_TRANSACTIONS = 200;
const SE_TAX_RATE = 0.153;
const SE_DEDUCTION_FACTOR = 0.9235;

// ---------------------------------------------------------------------------
// Mock Transactions (20+)
// ---------------------------------------------------------------------------

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-001', date: '2026-01-05', type: 'sell', cardName: '2023 Bowman Chrome Victor Wembanyama PSA 10', platform: 'eBay', amount: 1850, costBasis: 420, gain: 1430, holdingDays: 380, category: 'investment_gain_long', description: 'Sold graded rookie' },
  { id: 'tx-002', date: '2026-01-12', type: 'buy', cardName: '2025 Topps Chrome Cooper Flagg Auto /25', platform: 'eBay', amount: 0, costBasis: 1200, gain: 0, holdingDays: 0, category: 'hobby_expense', description: 'Purchased raw auto' },
  { id: 'tx-003', date: '2026-01-18', type: 'sell', cardName: '2024 Panini Prizm Caitlin Clark Silver', platform: 'COMC', amount: 475, costBasis: 95, gain: 380, holdingDays: 210, category: 'investment_gain_short', description: 'Sold short-term hold' },
  { id: 'tx-004', date: '2026-01-25', type: 'sell', cardName: '2020 Topps Chrome Luis Robert PSA 9', platform: 'eBay', amount: 310, costBasis: 180, gain: 130, holdingDays: 1450, category: 'investment_gain_long', description: 'Long-term sale' },
  { id: 'tx-005', date: '2026-02-02', type: 'trade', cardName: '2024 Donruss Caleb Williams Rated Rookie', platform: 'Trade Night', amount: 200, costBasis: 150, gain: 50, holdingDays: 120, category: 'trade_exchange', description: 'Traded at local show' },
  { id: 'tx-006', date: '2026-02-08', type: 'sell', cardName: '2023 Topps Update Corbin Carroll RC', platform: 'eBay', amount: 85, costBasis: 30, gain: 55, holdingDays: 400, category: 'hobby_income', description: 'Casual sale from personal collection' },
  { id: 'tx-007', date: '2026-02-14', type: 'sell', cardName: '2025 Panini Contenders Playoff Ticket /99', platform: 'Mercari', amount: 620, costBasis: 280, gain: 340, holdingDays: 45, category: 'dealer_inventory', description: 'Quick flip inventory item' },
  { id: 'tx-008', date: '2026-02-20', type: 'buy', cardName: '2025 Topps Series 1 Hobby Box (x3)', platform: 'Blowout Cards', amount: 0, costBasis: 750, gain: 0, holdingDays: 0, category: 'business_expense', description: 'Inventory purchase' },
  { id: 'tx-009', date: '2026-02-28', type: 'sell', cardName: '2024 Bowman 1st Chrome Lot (12 cards)', platform: 'eBay', amount: 340, costBasis: 190, gain: 150, holdingDays: 90, category: 'dealer_inventory', description: 'Lot sale from box breaks' },
  { id: 'tx-010', date: '2026-03-03', type: 'sell', cardName: '2023 Prizm Ja Morant Downtown', platform: 'MySlabs', amount: 1100, costBasis: 650, gain: 450, holdingDays: 520, category: 'investment_gain_long', description: 'Sold long-term investment' },
  { id: 'tx-011', date: '2026-03-05', type: 'sell', cardName: '2025 Topps Heritage Minor League Lot', platform: 'eBay', amount: 120, costBasis: 60, gain: 60, holdingDays: 30, category: 'hobby_income', description: 'Casual sale' },
  { id: 'tx-012', date: '2026-03-08', type: 'sell', cardName: '2024 Select Lamar Jackson Tie-Dye /25', platform: 'eBay', amount: 890, costBasis: 400, gain: 490, holdingDays: 160, category: 'investment_gain_short', description: 'Short-term investment sale' },
  { id: 'tx-013', date: '2026-03-10', type: 'buy', cardName: 'PSA Grading Submission (15 cards)', platform: 'PSA', amount: 0, costBasis: 375, gain: 0, holdingDays: 0, category: 'business_expense', description: 'Grading fees' },
  { id: 'tx-014', date: '2026-03-12', type: 'sell', cardName: '2022 Topps Chrome Julio Rodriguez Auto', platform: 'Goldin', amount: 2200, costBasis: 1100, gain: 1100, holdingDays: 730, category: 'investment_gain_long', description: 'Sold via auction house' },
  { id: 'tx-015', date: '2026-03-14', type: 'trade', cardName: '2025 Bowman Chrome 1st Lot for Vintage Mantle', platform: 'Card Show', amount: 500, costBasis: 350, gain: 150, holdingDays: 60, category: 'trade_exchange', description: 'Show trade-up' },
  { id: 'tx-016', date: '2026-01-20', type: 'sell', cardName: '2024 Topps Chrome Black Ohtani /75', platform: 'eBay', amount: 560, costBasis: 200, gain: 360, holdingDays: 280, category: 'investment_gain_short', description: 'Short-term investment' },
  { id: 'tx-017', date: '2026-02-05', type: 'sell', cardName: '2024 Panini Prizm WNBA Angel Reese Silver', platform: 'Mercari', amount: 145, costBasis: 40, gain: 105, holdingDays: 150, category: 'hobby_income', description: 'Casual hobby sale' },
  { id: 'tx-018', date: '2026-02-18', type: 'sell', cardName: '2025 Topps Now Moment Card Lot (8 cards)', platform: 'eBay', amount: 96, costBasis: 72, gain: 24, holdingDays: 14, category: 'dealer_inventory', description: 'Quick flip Topps Now' },
  { id: 'tx-019', date: '2026-03-01', type: 'sell', cardName: '2023 Optic Justin Jefferson Gold /10', platform: 'eBay', amount: 1750, costBasis: 900, gain: 850, holdingDays: 450, category: 'investment_gain_long', description: 'Long-term football hold' },
  { id: 'tx-020', date: '2026-03-06', type: 'buy', cardName: 'Card Show Table Rental + Travel', platform: 'Local Show', amount: 0, costBasis: 425, gain: 0, holdingDays: 0, category: 'business_expense', description: 'Show expenses' },
  { id: 'tx-021', date: '2026-03-09', type: 'sell', cardName: '2024 Topps Chrome Update Walker Buehler SP', platform: 'eBay', amount: 65, costBasis: 12, gain: 53, holdingDays: 35, category: 'hobby_income', description: 'Quick sale from rip' },
  { id: 'tx-022', date: '2026-03-11', type: 'sell', cardName: '2025 Bowman Draft 1st Chrome Auto Lot', platform: 'eBay', amount: 430, costBasis: 260, gain: 170, holdingDays: 22, category: 'dealer_inventory', description: 'Break inventory flip' },
  { id: 'tx-023', date: '2026-03-13', type: 'sell', cardName: '2024 Prizm Jayden Daniels Rookie Auto', platform: 'COMC', amount: 380, costBasis: 150, gain: 230, holdingDays: 110, category: 'investment_gain_short', description: 'Pre-season investment' },
];

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

export function getTransactions(): Transaction[] {
  return MOCK_TRANSACTIONS;
}

export function categorizeTransactions(): TaxCategory[] {
  const categoryMap: Record<TaxCategoryType, { label: string; scheduleType: 'C' | 'D' | '1' | 'none'; color: string }> = {
    hobby_income: { label: 'Hobby Income', scheduleType: '1', color: '#84cc16' },
    investment_gain_short: { label: 'Short-Term Capital Gains', scheduleType: 'D', color: '#f97316' },
    investment_gain_long: { label: 'Long-Term Capital Gains', scheduleType: 'D', color: '#22d3ee' },
    dealer_inventory: { label: 'Dealer Inventory Sales', scheduleType: 'C', color: '#a78bfa' },
    trade_exchange: { label: 'Like-Kind / Trade Exchange', scheduleType: 'D', color: '#fbbf24' },
    hobby_expense: { label: 'Hobby Expenses', scheduleType: 'none', color: '#64748b' },
    business_expense: { label: 'Business Expenses', scheduleType: 'C', color: '#f87171' },
  };

  const groups: Record<TaxCategoryType, { total: number; count: number }> = {} as any;
  for (const key of Object.keys(categoryMap) as TaxCategoryType[]) {
    groups[key] = { total: 0, count: 0 };
  }

  for (const tx of MOCK_TRANSACTIONS) {
    groups[tx.category].count += 1;
    if (tx.type === 'sell' || tx.type === 'trade') {
      groups[tx.category].total += tx.gain;
    } else {
      groups[tx.category].total -= tx.costBasis;
    }
  }

  return (Object.keys(categoryMap) as TaxCategoryType[]).map((type) => ({
    type,
    label: categoryMap[type].label,
    total: groups[type].total,
    count: groups[type].count,
    scheduleType: categoryMap[type].scheduleType,
    color: categoryMap[type].color,
  }));
}

export function classifyIRSStatus(): IRSClassification {
  const factors: IRSFactor[] = [
    {
      name: 'Profit Motive',
      description: 'Activity is conducted with the intent to make a profit',
      weight: 20,
      score: 16,
      maxScore: 20,
      met: true,
      details: 'Net positive income of $5,597 across 23 transactions indicates profit motive.',
    },
    {
      name: 'Time & Effort',
      description: 'Considerable time and effort is devoted to the activity',
      weight: 15,
      score: 10,
      maxScore: 15,
      met: true,
      details: 'Regular selling activity across multiple platforms, averaging 3+ sales per week.',
    },
    {
      name: 'Expertise',
      description: 'Taxpayer has expertise or seeks expert advice',
      weight: 10,
      score: 7,
      maxScore: 10,
      met: true,
      details: 'Use of grading services and auction platforms suggests market knowledge.',
    },
    {
      name: 'History of Income/Losses',
      description: 'Activity shows a history of income or losses',
      weight: 15,
      score: 12,
      maxScore: 15,
      met: true,
      details: 'Consistent profits over the current tax year with mixed holding periods.',
    },
    {
      name: 'Appreciation Expectation',
      description: 'Assets are expected to appreciate in value',
      weight: 10,
      score: 8,
      maxScore: 10,
      met: true,
      details: 'Portfolio includes graded cards and rookies with appreciation track record.',
    },
    {
      name: 'Personal Pleasure',
      description: 'Activity has significant personal or recreational elements',
      weight: 10,
      score: 7,
      maxScore: 10,
      met: true,
      details: 'Trading card collecting inherently has personal enjoyment elements.',
    },
    {
      name: 'Regularity of Sales',
      description: 'Sales occur on a regular and continuous basis',
      weight: 10,
      score: 8,
      maxScore: 10,
      met: true,
      details: '16 sell transactions in ~2.5 months indicates regular selling activity.',
    },
    {
      name: 'Business-like Conduct',
      description: 'Activity is conducted in a business-like manner with records',
      weight: 10,
      score: 6,
      maxScore: 10,
      met: true,
      details: 'Tracks cost basis and uses multiple sales channels, but no formal entity.',
    },
  ];

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  const maxTotal = factors.reduce((sum, f) => sum + f.maxScore, 0);
  const confidence = Math.round((totalScore / maxTotal) * 100);

  let status: IRSClassification['status'] = 'collector';
  let riskLevel: IRSClassification['riskLevel'] = 'low';
  let recommendation = '';

  if (confidence >= 80) {
    status = 'dealer';
    riskLevel = 'high';
    recommendation = 'Your activity pattern strongly suggests dealer status. Consider filing Schedule C and paying self-employment tax. Consult a tax professional to formalize your business structure.';
  } else if (confidence >= 60) {
    status = 'hybrid';
    riskLevel = 'medium';
    recommendation = 'Your activity falls in a gray area between collector and dealer. Separate personal collection sales from inventory flips. Consider maintaining distinct records for each category.';
  } else if (confidence >= 40) {
    status = 'investor';
    riskLevel = 'low';
    recommendation = 'Your activity primarily resembles investment behavior. Report gains/losses on Schedule D using capital gains treatment.';
  } else {
    status = 'collector';
    riskLevel = 'low';
    recommendation = 'Your activity is consistent with hobby/collector status. Report income on Schedule 1 and be aware of hobby loss limitations.';
  }

  return { status, confidence, factors, recommendation, riskLevel };
}

export function get1099KStatus(): ThresholdTracker[] {
  const platformSales: Record<string, { gross: number; count: number }> = {};

  for (const tx of MOCK_TRANSACTIONS) {
    if (tx.type !== 'sell') continue;
    if (!platformSales[tx.platform]) {
      platformSales[tx.platform] = { gross: 0, count: 0 };
    }
    platformSales[tx.platform].gross += tx.amount;
    platformSales[tx.platform].count += 1;
  }

  const dayOfYear = Math.floor((Date.now() - new Date('2026-01-01').getTime()) / (1000 * 60 * 60 * 24));
  const projectionFactor = 365 / Math.max(dayOfYear, 1);

  return Object.entries(platformSales).map(([platform, data]) => {
    const projected = data.gross * projectionFactor;
    return {
      platform,
      grossSales: data.gross,
      transactionCount: data.count,
      threshold1099K: THRESHOLD_1099K_CURRENT,
      oldThresholdAmount: THRESHOLD_1099K_OLD_AMOUNT,
      oldThresholdTransactions: THRESHOLD_1099K_OLD_TRANSACTIONS,
      percentToThreshold: Math.min(100, Math.round((data.gross / THRESHOLD_1099K_CURRENT) * 100)),
      will1099BeIssued: data.gross >= THRESHOLD_1099K_CURRENT,
      projectedYearEnd: Math.round(projected),
    };
  });
}

export function calculateQuarterlyEstimates(): QuarterlyEstimate[] {
  const sells = MOCK_TRANSACTIONS.filter((tx) => tx.type === 'sell' || tx.type === 'trade');
  const totalGain = sells.reduce((s, tx) => s + tx.gain, 0);
  const annualizedGain = totalGain * (365 / 75); // ~75 days of data so far
  const effectiveRate = 0.24; // blended federal rate assumption

  const quarterIncomes = [
    sells.filter((tx) => tx.date < '2026-04-01').reduce((s, tx) => s + tx.gain, 0),
    Math.round(annualizedGain * 0.25),
    Math.round(annualizedGain * 0.25),
    Math.round(annualizedGain * 0.25),
  ];

  const quarters: QuarterlyEstimate[] = [
    {
      quarter: 'Q1',
      dueDate: '2026-04-15',
      estimatedIncome: quarterIncomes[0],
      estimatedTax: Math.round(quarterIncomes[0] * effectiveRate),
      selfEmploymentTax: Math.round(quarterIncomes[0] * SE_DEDUCTION_FACTOR * SE_TAX_RATE * 0.3),
      totalDue: 0,
      paid: false,
      paidAmount: 0,
      status: 'current',
    },
    {
      quarter: 'Q2',
      dueDate: '2026-06-15',
      estimatedIncome: quarterIncomes[1],
      estimatedTax: Math.round(quarterIncomes[1] * effectiveRate),
      selfEmploymentTax: Math.round(quarterIncomes[1] * SE_DEDUCTION_FACTOR * SE_TAX_RATE * 0.3),
      totalDue: 0,
      paid: false,
      paidAmount: 0,
      status: 'upcoming',
    },
    {
      quarter: 'Q3',
      dueDate: '2026-09-15',
      estimatedIncome: quarterIncomes[2],
      estimatedTax: Math.round(quarterIncomes[2] * effectiveRate),
      selfEmploymentTax: Math.round(quarterIncomes[2] * SE_DEDUCTION_FACTOR * SE_TAX_RATE * 0.3),
      totalDue: 0,
      paid: false,
      paidAmount: 0,
      status: 'upcoming',
    },
    {
      quarter: 'Q4',
      dueDate: '2027-01-15',
      estimatedIncome: quarterIncomes[3],
      estimatedTax: Math.round(quarterIncomes[3] * effectiveRate),
      selfEmploymentTax: Math.round(quarterIncomes[3] * SE_DEDUCTION_FACTOR * SE_TAX_RATE * 0.3),
      totalDue: 0,
      paid: false,
      paidAmount: 0,
      status: 'upcoming',
    },
  ];

  for (const q of quarters) {
    q.totalDue = q.estimatedTax + q.selfEmploymentTax;
  }

  return quarters;
}

export function getScheduleRecommendation(): ScheduleComparison[] {
  const sells = MOCK_TRANSACTIONS.filter((tx) => tx.type === 'sell' || tx.type === 'trade');
  const totalGain = sells.reduce((s, tx) => s + tx.gain, 0);
  const expenses = MOCK_TRANSACTIONS.filter((tx) => tx.type === 'buy' && (tx.category === 'business_expense')).reduce((s, tx) => s + tx.costBasis, 0);

  const scheduleCIncome = totalGain;
  const scheduleCDeductions = expenses;
  const scheduleCTaxable = scheduleCIncome - scheduleCDeductions;
  const scheduleCTax = Math.round(scheduleCTaxable * 0.24);
  const scheduleCse = Math.round(scheduleCTaxable * SE_DEDUCTION_FACTOR * SE_TAX_RATE);

  const longTermGains = sells.filter((tx) => tx.category === 'investment_gain_long').reduce((s, tx) => s + tx.gain, 0);
  const shortTermGains = sells.filter((tx) => tx.category !== 'investment_gain_long').reduce((s, tx) => s + tx.gain, 0);
  const scheduleDTax = Math.round(longTermGains * 0.15 + shortTermGains * 0.24);

  return [
    {
      schedule: 'C',
      label: 'Schedule C (Business / Dealer)',
      taxableIncome: scheduleCTaxable,
      estimatedTax: scheduleCTax,
      selfEmploymentTax: scheduleCse,
      totalTax: scheduleCTax + scheduleCse,
      allowedDeductions: [
        'Cost of goods sold (inventory)',
        'Grading & authentication fees',
        'Shipping & packaging supplies',
        'Card show booth rental & travel',
        'Home office deduction',
        'Platform seller fees',
        'Insurance on inventory',
      ],
      limitations: [
        'Subject to self-employment tax (15.3%)',
        'Must maintain business records',
        'Quarterly estimated payments required',
        'Potential audit risk as dealer classification',
      ],
      netAfterTax: scheduleCTaxable - scheduleCTax - scheduleCse,
    },
    {
      schedule: 'D',
      label: 'Schedule D (Capital Gains / Investor)',
      taxableIncome: totalGain,
      estimatedTax: scheduleDTax,
      selfEmploymentTax: 0,
      totalTax: scheduleDTax,
      allowedDeductions: [
        'Cost basis of sold items',
        'Capital loss carryforward ($3,000/yr)',
        'Investment advisory fees (limited)',
      ],
      limitations: [
        'No deduction for hobby expenses above income',
        'Cannot deduct grading/shipping as business expense',
        'Hobby loss rules limit deductions',
        'Wash sale rules may apply',
      ],
      netAfterTax: totalGain - scheduleDTax,
    },
  ];
}

export function getRecommendations(): TaxRecommendation[] {
  return [
    {
      id: 'rec-01',
      priority: 'high',
      category: 'classification',
      title: 'Formalize Business Entity',
      description: 'Your sales volume and regularity suggest dealer-level activity. Forming an LLC or sole proprietorship may provide legal protection and clearer tax treatment.',
      potentialSavings: 1200,
      action: 'Consult with a CPA about forming an LLC for your card business.',
      deadline: '2026-04-15',
    },
    {
      id: 'rec-02',
      priority: 'high',
      category: 'compliance',
      title: 'File Q1 Estimated Payment',
      description: 'Based on your YTD income, you likely need to make quarterly estimated tax payments to avoid underpayment penalties.',
      potentialSavings: 450,
      action: 'Submit IRS Form 1040-ES with Q1 payment by April 15.',
      deadline: '2026-04-15',
    },
    {
      id: 'rec-03',
      priority: 'high',
      category: 'deduction',
      title: 'Track All Business Expenses',
      description: 'You have $1,550 in documented expenses but may be missing deductible costs like shipping supplies, mileage to card shows, and home office space.',
      potentialSavings: 800,
      action: 'Start tracking all card-related expenses with receipts. Consider a dedicated business credit card.',
    },
    {
      id: 'rec-04',
      priority: 'medium',
      category: 'timing',
      title: 'Defer Long-Term Gains to Next Year',
      description: 'Cards held over 365 days qualify for lower long-term capital gains rates. Consider holding cards approaching the 1-year mark.',
      potentialSavings: 620,
      action: 'Review cards purchased in Q1 2025 and hold until after the 365-day mark.',
    },
    {
      id: 'rec-05',
      priority: 'medium',
      category: 'schedule',
      title: 'Split Activity: Schedule C + Schedule D',
      description: 'Separate your quick-flip inventory (Schedule C) from long-term investments (Schedule D) to optimize tax treatment for each.',
      potentialSavings: 950,
      action: 'Maintain two distinct inventories: dealer stock and personal investment portfolio.',
    },
    {
      id: 'rec-06',
      priority: 'medium',
      category: 'deduction',
      title: 'Elect Specific Identification Method',
      description: 'Using specific identification for cost basis allows you to choose which lots to sell, optimizing gains and losses.',
      potentialSavings: 380,
      action: 'Document specific card purchases with receipts and track each card individually.',
    },
    {
      id: 'rec-07',
      priority: 'low',
      category: 'compliance',
      title: 'Prepare for 1099-K from eBay',
      description: 'Your eBay gross sales ($7,886) already exceed the $600 reporting threshold. Expect a 1099-K for this platform.',
      potentialSavings: 0,
      action: 'Ensure your cost basis records are accurate so you only pay tax on actual gains, not gross sales.',
    },
    {
      id: 'rec-08',
      priority: 'low',
      category: 'timing',
      title: 'Harvest Losses Before Year-End',
      description: 'If any holdings are currently underwater, consider selling to offset gains. Up to $3,000 in net losses can offset ordinary income.',
      potentialSavings: 720,
      action: 'Review portfolio for unrealized losses in Q4 and strategically realize them.',
    },
    {
      id: 'rec-09',
      priority: 'low',
      category: 'deduction',
      title: 'Consider Home Office Deduction',
      description: 'If you use a dedicated space for card inventory storage and sales management, you may qualify for the home office deduction.',
      potentialSavings: 540,
      action: 'Measure and document your dedicated card workspace. Use simplified method ($5/sq ft, up to 300 sq ft).',
    },
  ];
}

export function getTaxProfile(): TaxProfile {
  const sells = MOCK_TRANSACTIONS.filter((tx) => tx.type === 'sell' || tx.type === 'trade');
  const totalIncome = sells.reduce((s, tx) => s + tx.gain, 0);
  const buys = MOCK_TRANSACTIONS.filter((tx) => tx.type === 'buy');
  const totalExpenses = buys.reduce((s, tx) => s + tx.costBasis, 0);

  return {
    taxYear: 2026,
    filingStatus: 'single',
    ordinaryRate: 0.24,
    longTermRate: 0.15,
    selfEmploymentRate: SE_TAX_RATE,
    stateRate: 0.05,
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
    isDealerClassified: false,
  };
}

export function getTaxSummary(): TaxSummary {
  return {
    profile: getTaxProfile(),
    categories: categorizeTransactions(),
    quarterlyEstimates: calculateQuarterlyEstimates(),
    thresholds: get1099KStatus(),
    classification: classifyIRSStatus(),
    recommendations: getRecommendations(),
    scheduleComparison: getScheduleRecommendation(),
    inventoryMethod: 'specific_id',
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
