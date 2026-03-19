// Phase 90 – Regulatory & Compliance Center Service

// ---- Types ----

export interface TaxEvent {
  id: string;
  type: 'sale' | 'purchase' | 'exchange' | 'gift';
  date: string;
  card: string;
  player: string;
  proceeds: number;
  costBasis: number;
  gainLoss: number;
  holdingPeriod: 'short_term' | 'long_term';
  taxRate: number;
  status: 'reported' | 'pending' | 'flagged';
}

export interface ScheduleD {
  year: number;
  shortTermGains: number;
  shortTermLosses: number;
  longTermGains: number;
  longTermLosses: number;
  netGain: number;
  estimatedTax: number;
  transactions: TaxEvent[];
  washSaleAdjustments: number;
}

export interface ComplianceAlert {
  id: string;
  type: '1099_threshold' | 'aml_flag' | 'wash_sale' | 'reporting_deadline' | 'state_tax';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action: string;
  deadline?: string;
  amount?: number;
}

export interface AMLFlag {
  id: string;
  transactionId: string;
  reason: 'high_value' | 'rapid_succession' | 'unusual_pattern' | 'new_counterparty';
  amount: number;
  date: string;
  status: 'flagged' | 'reviewed' | 'cleared';
  riskScore: number;
}

export interface StateGuidance {
  state: string;
  salesTaxRate: number;
  collectiblesTaxRate: number;
  exemptions: string[];
  filingRequirements: string;
  notes: string;
}

export interface ComplianceStats {
  totalTaxEvents: number;
  estimatedTaxLiability: number;
  threshold1099Progress: number;
  activeAlerts: number;
  complianceScore: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_compliance_center';

// ---- Seed helpers ----

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ---- Simulated data generators ----

const PLAYERS = [
  'Mike Trout', 'Shohei Ohtani', 'Juan Soto', 'Ronald Acuna Jr',
  'Wander Franco', 'Julio Rodriguez', 'Bryce Harper', 'Mookie Betts',
  'Luka Doncic', 'Victor Wembanyama', 'Patrick Mahomes', 'Trevor Lawrence',
  'Connor McDavid', 'Jasson Dominguez', 'Gunnar Henderson', 'Elly De La Cruz',
];

const CARD_SETS = [
  'Topps Chrome', 'Bowman 1st', 'Prizm Silver', 'National Treasures',
  'Topps Heritage', 'Select Concourse', 'Donruss Optic', 'Flawless',
  'Immaculate', 'Panini One', 'Topps Update', 'Bowman Chrome',
];

function generateTaxEvents(year: number): TaxEvent[] {
  const events: TaxEvent[] = [];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const seed = year * 1000 + i;
    const r = seededRandom(seed);
    const r2 = seededRandom(seed + 500);
    const r3 = seededRandom(seed + 1000);
    const r4 = seededRandom(seed + 1500);
    const r5 = seededRandom(seed + 2000);

    const month = Math.floor(r * 12) + 1;
    const day = Math.floor(r2 * 28) + 1;
    const player = PLAYERS[Math.floor(r3 * PLAYERS.length)];
    const cardSet = CARD_SETS[Math.floor(r4 * CARD_SETS.length)];
    const typeIdx = r5;
    const type: TaxEvent['type'] = typeIdx < 0.5 ? 'sale' : typeIdx < 0.8 ? 'purchase' : typeIdx < 0.95 ? 'exchange' : 'gift';

    const costBasis = Math.round(50 + r * 4000);
    const proceeds = type === 'gift' ? 0 : Math.round(costBasis * (0.6 + r2 * 1.2));
    const gainLoss = proceeds - costBasis;
    const holdingPeriod: TaxEvent['holdingPeriod'] = r3 > 0.45 ? 'long_term' : 'short_term';
    const taxRate = holdingPeriod === 'short_term' ? 0.28 : 0.20;

    const statusVal = r4;
    const status: TaxEvent['status'] = statusVal < 0.6 ? 'reported' : statusVal < 0.85 ? 'pending' : 'flagged';

    events.push({
      id: `te-${year}-${i}`,
      type,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      card: `${year > 2023 ? year - 1 : year} ${cardSet}`,
      player,
      proceeds,
      costBasis,
      gainLoss,
      holdingPeriod,
      taxRate,
      status,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

function generateComplianceAlerts(): ComplianceAlert[] {
  return [
    {
      id: 'ca-1',
      type: '1099_threshold',
      severity: 'warning',
      message: 'Approaching $600 1099-K reporting threshold. Current gross proceeds: $547.',
      action: 'Track all sales carefully. Platforms will issue 1099-K if you exceed $600 in gross proceeds.',
      deadline: '2026-01-31',
      amount: 547,
    },
    {
      id: 'ca-2',
      type: 'wash_sale',
      severity: 'critical',
      message: 'Potential wash sale detected: Sold Trout Chrome at loss, repurchased similar card within 14 days.',
      action: 'Review IRS wash sale rules. Loss of $320 may be disallowed and added to replacement cost basis.',
      amount: 320,
    },
    {
      id: 'ca-3',
      type: 'reporting_deadline',
      severity: 'info',
      message: 'Q1 estimated tax payment due April 15, 2026.',
      action: 'File Form 1040-ES with estimated collectibles gains if expected tax owed exceeds $1,000.',
      deadline: '2026-04-15',
    },
    {
      id: 'ca-4',
      type: 'state_tax',
      severity: 'warning',
      message: 'California collectibles gains taxed as ordinary income (up to 13.3%). Ensure proper state filing.',
      action: 'Include Schedule D gains on California Form 540. No preferential capital gains rate in CA.',
    },
  ];
}

function generateAMLFlags(): AMLFlag[] {
  return [
    {
      id: 'aml-1',
      transactionId: 'te-2025-3',
      reason: 'high_value',
      amount: 8750,
      date: '2025-09-14',
      status: 'flagged',
      riskScore: 72,
    },
    {
      id: 'aml-2',
      transactionId: 'te-2025-7',
      reason: 'rapid_succession',
      amount: 4200,
      date: '2025-11-02',
      status: 'reviewed',
      riskScore: 45,
    },
  ];
}

const STATE_GUIDANCE: Record<string, StateGuidance> = {
  CA: {
    state: 'California',
    salesTaxRate: 7.25,
    collectiblesTaxRate: 13.3,
    exemptions: ['Occasional sales under $600 may not trigger reporting', 'Like-kind exchanges no longer available for collectibles post-2017'],
    filingRequirements: 'Report on Form 540 Schedule D. Collectibles gains taxed as ordinary income — no preferential rate. Estimated payments required quarterly if tax owed > $500.',
    notes: 'California does not offer a lower capital gains rate for collectibles. All gains taxed at marginal income rates up to 13.3%.',
  },
  NY: {
    state: 'New York',
    salesTaxRate: 8.0,
    collectiblesTaxRate: 8.82,
    exemptions: ['Resale certificates for dealers', 'Items purchased for resale exempt from sales tax'],
    filingRequirements: 'Report on IT-201 with federal Schedule D attachment. NYC residents add 3.876% city tax on gains.',
    notes: 'New York taxes collectibles gains as ordinary income. Combined state+city rate can reach 12.7% for NYC residents.',
  },
  TX: {
    state: 'Texas',
    salesTaxRate: 6.25,
    collectiblesTaxRate: 0,
    exemptions: ['No state income tax on capital gains', 'Occasional sales may qualify for casual sale exemption'],
    filingRequirements: 'No state income tax filing required. Sales tax applies to retail purchases of tangible personal property.',
    notes: 'Texas has no state income tax. Collectibles gains are only subject to federal taxes. Significant advantage for high-volume traders.',
  },
  FL: {
    state: 'Florida',
    salesTaxRate: 6.0,
    collectiblesTaxRate: 0,
    exemptions: ['No state income tax', 'Out-of-state buyers may be exempt from sales tax on shipped items'],
    filingRequirements: 'No state income tax filing required. Register for sales tax if selling tangible personal property in-state.',
    notes: 'Florida has no state income tax. Only federal collectibles rate (28% max) applies. Attractive for card investors.',
  },
};

// ---- Persistence ----

interface StoredData {
  taxEvents: TaxEvent[];
  alerts: ComplianceAlert[];
  amlFlags: AMLFlag[];
  generatedYear: number;
}

function loadOrGenerate(year: number): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredData = JSON.parse(raw);
      if (parsed.generatedYear === year) return parsed;
    }
  } catch { /* regenerate */ }

  const data: StoredData = {
    taxEvents: generateTaxEvents(year),
    alerts: generateComplianceAlerts(),
    amlFlags: generateAMLFlags(),
    generatedYear: year,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// ---- Public API ----

export function getTaxEvents(year?: number): TaxEvent[] {
  const y = year ?? new Date().getFullYear();
  return loadOrGenerate(y).taxEvents;
}

export function getScheduleD(year: number): ScheduleD {
  const events = getTaxEvents(year);

  const shortTermGains = events
    .filter(e => e.holdingPeriod === 'short_term' && e.gainLoss > 0)
    .reduce((sum, e) => sum + e.gainLoss, 0);
  const shortTermLosses = events
    .filter(e => e.holdingPeriod === 'short_term' && e.gainLoss < 0)
    .reduce((sum, e) => sum + Math.abs(e.gainLoss), 0);
  const longTermGains = events
    .filter(e => e.holdingPeriod === 'long_term' && e.gainLoss > 0)
    .reduce((sum, e) => sum + e.gainLoss, 0);
  const longTermLosses = events
    .filter(e => e.holdingPeriod === 'long_term' && e.gainLoss < 0)
    .reduce((sum, e) => sum + Math.abs(e.gainLoss), 0);

  const netGain = (shortTermGains - shortTermLosses) + (longTermGains - longTermLosses);

  // Wash sale adjustments (simulated)
  const washSaleAdjustments = getWashSaleAnalysis().length > 0 ? 320 : 0;

  const estimatedTax = Math.round(
    (shortTermGains - shortTermLosses) * 0.28 +
    (longTermGains - longTermLosses) * 0.20 +
    washSaleAdjustments * 0.28
  );

  return {
    year,
    shortTermGains,
    shortTermLosses,
    longTermGains,
    longTermLosses,
    netGain,
    estimatedTax: Math.max(0, estimatedTax),
    transactions: events,
    washSaleAdjustments,
  };
}

export function getComplianceAlerts(): ComplianceAlert[] {
  const data = loadOrGenerate(new Date().getFullYear());
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  return [...data.alerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function getAMLFlags(): AMLFlag[] {
  return loadOrGenerate(new Date().getFullYear()).amlFlags;
}

export function getStateGuidance(state: string): StateGuidance | null {
  return STATE_GUIDANCE[state.toUpperCase()] ?? null;
}

export function getAllStateGuidance(): StateGuidance[] {
  return Object.values(STATE_GUIDANCE);
}

export function getComplianceStats(): ComplianceStats {
  const year = new Date().getFullYear();
  const events = getTaxEvents(year);
  const alerts = getComplianceAlerts();
  const schedule = getScheduleD(year);

  const totalProceeds = events
    .filter(e => e.type === 'sale')
    .reduce((sum, e) => sum + e.proceeds, 0);

  const threshold1099Progress = Math.min(100, Math.round((totalProceeds / 600) * 100));

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const flaggedEvents = events.filter(e => e.status === 'flagged').length;

  // Score: start at 100, deduct for issues
  let complianceScore = 100;
  complianceScore -= criticalCount * 15;
  complianceScore -= warningCount * 5;
  complianceScore -= flaggedEvents * 3;
  if (threshold1099Progress > 90) complianceScore -= 5;
  complianceScore = Math.max(0, Math.min(100, complianceScore));

  return {
    totalTaxEvents: events.length,
    estimatedTaxLiability: schedule.estimatedTax,
    threshold1099Progress,
    activeAlerts: alerts.length,
    complianceScore,
  };
}

export function getWashSaleAnalysis(): { soldEvent: TaxEvent; reboughtEvent: TaxEvent; daysBetween: number; disallowedLoss: number }[] {
  const events = getTaxEvents();
  const sales = events.filter(e => e.type === 'sale' && e.gainLoss < 0);
  const purchases = events.filter(e => e.type === 'purchase');
  const results: { soldEvent: TaxEvent; reboughtEvent: TaxEvent; daysBetween: number; disallowedLoss: number }[] = [];

  for (const sale of sales) {
    for (const purchase of purchases) {
      if (sale.player === purchase.player) {
        const saleDate = new Date(sale.date).getTime();
        const purchaseDate = new Date(purchase.date).getTime();
        const daysBetween = Math.round((purchaseDate - saleDate) / (1000 * 60 * 60 * 24));

        if (daysBetween > 0 && daysBetween <= 30) {
          results.push({
            soldEvent: sale,
            reboughtEvent: purchase,
            daysBetween,
            disallowedLoss: Math.abs(sale.gainLoss),
          });
        }
      }
    }
  }

  return results;
}

export function getMonthlyGainLoss(year: number): { month: string; gains: number; losses: number }[] {
  const events = getTaxEvents(year);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return months.map((month, idx) => {
    const monthEvents = events.filter(e => {
      const m = parseInt(e.date.split('-')[1], 10) - 1;
      return m === idx;
    });

    const gains = monthEvents.filter(e => e.gainLoss > 0).reduce((s, e) => s + e.gainLoss, 0);
    const losses = monthEvents.filter(e => e.gainLoss < 0).reduce((s, e) => s + Math.abs(e.gainLoss), 0);

    return { month, gains, losses };
  });
}
