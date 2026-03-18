// Phase 131: Behavioral Finance & Collector Psychology Dashboard
// Cognitive bias detection, spending pattern analysis, and decision quality scoring

import { store } from './dal/syncStore';

// ---- Types ----

export type CognitiveBias =
  | 'endowment_effect'
  | 'anchoring'
  | 'loss_aversion'
  | 'fomo'
  | 'sunk_cost'
  | 'recency'
  | 'confirmation'
  | 'disposition_effect';

export type TriggerType = 'auction_loss' | 'market_spike' | 'social_media' | 'late_night' | 'post_break' | 'fomo_listing' | 'paycheck';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface BiasDetection {
  id: string;
  bias: CognitiveBias;
  severity: Severity;
  evidence: string;
  suggestion: string;
  detectedAt: string;
  relatedCardId?: string;
}

export interface SpendingPattern {
  hour_of_day: number;
  day_of_week: number;
  trigger_type: TriggerType;
  avg_amount: number;
  transaction_count: number;
}

export interface DecisionQuality {
  id: string;
  decision: string;
  cardName: string;
  outcome: 'profit' | 'loss' | 'hold' | 'pending';
  score: number;
  bias_detected: CognitiveBias | null;
  amount: number;
  date: string;
  notes: string;
}

export interface MonthlyReport {
  month: string;
  decisionScore: number;
  totalSpent: number;
  impulsePurchases: number;
  biasesTriggered: number;
  moneySavedByNudges: number;
  topBias: CognitiveBias;
  improvement: number;
}

export interface CoolDownRule {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
  cooldownMinutes: number;
  enabled: boolean;
  timesTriggered: number;
  moneySaved: number;
}

export interface ImpulseAlert {
  id: string;
  cardName: string;
  proposedAmount: number;
  fairMarketValue: number;
  overpayPercent: number;
  riskLevel: Severity;
  reason: string;
  timestamp: string;
}

export interface BehavioralProfile {
  overallScore: number;
  activeBiases: number;
  impulseLevel: Severity;
  nudgesActive: number;
  totalSavedByNudges: number;
  impulsePurchasesAvoided: number;
  avgDecisionQuality: number;
  streakDays: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  emotionalState: 'calm' | 'elevated' | 'impulsive';
}

export interface EmotionalTrigger {
  trigger: string;
  frequency: number;
  avgSpend: number;
  avgOverpay: number;
  lastOccurrence: string;
}

export interface OverpaymentEntry {
  cardName: string;
  pricePaid: number;
  fairValue: number;
  overpayAmount: number;
  overpayPercent: number;
  biasContributor: CognitiveBias;
  date: string;
}

export interface Nudge {
  id: string;
  type: 'warning' | 'suggestion' | 'block' | 'delay';
  message: string;
  priority: Severity;
  acknowledged: boolean;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_behavioral_finance';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.get<T | null>(`${STORAGE_KEY}_${key}`, null);
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Mock Data ----

const BIAS_DETECTIONS: BiasDetection[] = [
  {
    id: 'bd_001',
    bias: 'disposition_effect',
    severity: 'high',
    evidence: 'You hold cards at a loss 3.2x longer than winners. Average hold for losers: 214 days vs 67 days for profitable cards.',
    suggestion: 'Set automatic stop-loss alerts at -15% to counteract loss-holding behavior. Review losing positions weekly.',
    detectedAt: '2026-03-13T10:00:00Z',
  },
  {
    id: 'bd_002',
    bias: 'anchoring',
    severity: 'high',
    evidence: 'Your bids correlate 94% with listing prices rather than fair market value. You paid 18% over FMV on 7 of your last 12 purchases.',
    suggestion: 'Always check comparable sales before bidding. Use the Comp Forensics tool to establish FMV independently of listing price.',
    detectedAt: '2026-03-12T14:30:00Z',
  },
  {
    id: 'bd_003',
    bias: 'fomo',
    severity: 'critical',
    evidence: '82% of your auction purchases happen after 11pm when fatigue lowers inhibitions. 3 of your 5 worst overpays occurred between midnight and 2am.',
    suggestion: 'Enable the Late Night Cool-Down rule to add a 30-minute delay to purchases after 10pm. Consider setting a hard spending cap after 11pm.',
    detectedAt: '2026-03-11T23:45:00Z',
  },
  {
    id: 'bd_004',
    bias: 'recency',
    severity: 'medium',
    evidence: 'After the Wemby RC spike in January, you allocated 42% of your budget to basketball rookies. Historical avg allocation was 18%.',
    suggestion: 'Diversify across sport categories. Recent market spikes often correct within 60-90 days.',
    detectedAt: '2026-03-10T09:15:00Z',
  },
  {
    id: 'bd_005',
    bias: 'endowment_effect',
    severity: 'medium',
    evidence: 'You value cards you own at 35% above market price on average. Your listed sell prices are consistently 28-42% above recent comps.',
    suggestion: 'Price cards using the median of last 5 comparable sales, not your purchase price or perceived value.',
    detectedAt: '2026-03-09T16:20:00Z',
  },
  {
    id: 'bd_006',
    bias: 'sunk_cost',
    severity: 'high',
    evidence: 'You have continued to invest in 3 player portfolios despite -30% average decline because of prior investment. Total sunk: $12,400.',
    suggestion: 'Evaluate each holding independently of past investment. Ask: "Would I buy this card today at this price?"',
    detectedAt: '2026-03-08T11:00:00Z',
  },
  {
    id: 'bd_007',
    bias: 'loss_aversion',
    severity: 'medium',
    evidence: 'You rejected 4 profitable trade offers in the last month because each involved realizing a small loss on one card, despite net portfolio gain.',
    suggestion: 'Evaluate trades on total portfolio impact, not individual card P&L. A $50 loss enabling a $200 gain is a $150 win.',
    detectedAt: '2026-03-07T13:45:00Z',
  },
  {
    id: 'bd_008',
    bias: 'confirmation',
    severity: 'low',
    evidence: 'Your research sources skew 85% bullish. You follow 12 accounts that are positive on your holdings and 0 bearish analysts.',
    suggestion: 'Actively seek opposing viewpoints. Follow at least 3 contrarian market analysts to balance your information diet.',
    detectedAt: '2026-03-06T10:30:00Z',
  },
];

const SPENDING_PATTERNS: SpendingPattern[] = [
  // Late night patterns
  { hour_of_day: 23, day_of_week: 1, trigger_type: 'late_night', avg_amount: 1850, transaction_count: 8 },
  { hour_of_day: 0, day_of_week: 2, trigger_type: 'late_night', avg_amount: 2200, transaction_count: 6 },
  { hour_of_day: 23, day_of_week: 5, trigger_type: 'late_night', avg_amount: 3100, transaction_count: 12 },
  { hour_of_day: 1, day_of_week: 6, trigger_type: 'late_night', avg_amount: 2800, transaction_count: 5 },
  // Post-auction-loss revenge buying
  { hour_of_day: 22, day_of_week: 3, trigger_type: 'auction_loss', avg_amount: 4200, transaction_count: 4 },
  { hour_of_day: 21, day_of_week: 0, trigger_type: 'auction_loss', avg_amount: 3500, transaction_count: 3 },
  // FOMO after social media
  { hour_of_day: 10, day_of_week: 1, trigger_type: 'social_media', avg_amount: 1200, transaction_count: 7 },
  { hour_of_day: 12, day_of_week: 4, trigger_type: 'social_media', avg_amount: 950, transaction_count: 9 },
  { hour_of_day: 14, day_of_week: 2, trigger_type: 'social_media', avg_amount: 1450, transaction_count: 5 },
  // Post-break buying spikes
  { hour_of_day: 9, day_of_week: 1, trigger_type: 'post_break', avg_amount: 2600, transaction_count: 11 },
  { hour_of_day: 10, day_of_week: 1, trigger_type: 'post_break', avg_amount: 3200, transaction_count: 8 },
  // Market spike FOMO
  { hour_of_day: 15, day_of_week: 3, trigger_type: 'market_spike', avg_amount: 5500, transaction_count: 3 },
  { hour_of_day: 16, day_of_week: 4, trigger_type: 'market_spike', avg_amount: 4800, transaction_count: 4 },
  // Paycheck-driven spending
  { hour_of_day: 11, day_of_week: 5, trigger_type: 'paycheck', avg_amount: 2100, transaction_count: 14 },
  { hour_of_day: 13, day_of_week: 5, trigger_type: 'paycheck', avg_amount: 1800, transaction_count: 10 },
  // Calm rational buying
  { hour_of_day: 10, day_of_week: 3, trigger_type: 'fomo_listing', avg_amount: 780, transaction_count: 6 },
  { hour_of_day: 14, day_of_week: 1, trigger_type: 'fomo_listing', avg_amount: 1100, transaction_count: 4 },
  { hour_of_day: 11, day_of_week: 2, trigger_type: 'fomo_listing', avg_amount: 650, transaction_count: 3 },
];

const DECISION_HISTORY: DecisionQuality[] = [
  { id: 'dq_001', decision: 'Buy', cardName: '2023 Bowman Chrome Wembanyama RC Auto /99', outcome: 'profit', score: 88, bias_detected: null, amount: 28000, date: '2026-01-15', notes: 'Bought at FMV, sold 6 weeks later for $34,200. Clean decision with proper research.' },
  { id: 'dq_002', decision: 'Buy', cardName: '2020 Prizm Justin Herbert Silver PSA 10', outcome: 'loss', score: 32, bias_detected: 'fomo', amount: 8500, date: '2026-01-22', notes: 'Purchased at 1am after seeing Twitter hype. Paid 22% over FMV. Current value: $6,200.' },
  { id: 'dq_003', decision: 'Hold', cardName: '2019 Prizm Zion Williamson Silver PSA 10', outcome: 'loss', score: 28, bias_detected: 'disposition_effect', amount: 4200, date: '2025-11-01', notes: 'Held through 40% decline. Multiple sell signals ignored. Sunk cost mentality.' },
  { id: 'dq_004', decision: 'Sell', cardName: '1986 Fleer Jordan RC PSA 8', outcome: 'profit', score: 92, bias_detected: null, amount: 42000, date: '2026-02-10', notes: 'Sold at market peak after objective analysis. Took 15% profit. No emotional attachment.' },
  { id: 'dq_005', decision: 'Buy', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto', outcome: 'profit', score: 75, bias_detected: 'anchoring', amount: 2400, date: '2026-02-14', notes: 'Slightly anchored to listing price but still within FMV range. Made 8% profit.' },
  { id: 'dq_006', decision: 'Buy', cardName: '2018 Prizm Luka Doncic Silver PSA 10', outcome: 'hold', score: 65, bias_detected: 'recency', amount: 5200, date: '2026-02-20', notes: 'Bought after Luka playoff run hype. Price has been flat. Recency bias influenced timing.' },
  { id: 'dq_007', decision: 'Buy', cardName: '1952 Topps Mantle #311 SGC 2', outcome: 'profit', score: 95, bias_detected: null, amount: 125000, date: '2025-12-05', notes: 'Thorough research, waited 3 months for right example. Bought 8% below FMV at auction.' },
  { id: 'dq_008', decision: 'Sell', cardName: '2021 Topps Chrome Wander Franco RC Auto', outcome: 'loss', score: 45, bias_detected: 'loss_aversion', amount: 2400, date: '2026-01-30', notes: 'Held too long hoping to break even. Finally sold at -35%. Should have cut at -15%.' },
  { id: 'dq_009', decision: 'Buy', cardName: '2023 Panini Prizm Caleb Williams Silver RC', outcome: 'loss', score: 22, bias_detected: 'fomo', amount: 1800, date: '2026-03-01', notes: 'Panic bought after draft buzz on social media at midnight. Paid 30% premium. Down 18%.' },
  { id: 'dq_010', decision: 'Hold', cardName: '1993 SP Foil Jeter RC PSA 10', outcome: 'profit', score: 85, bias_detected: null, amount: 128000, date: '2025-10-15', notes: 'Patient hold strategy. Card has appreciated 12% since acquisition. No bias detected.' },
  { id: 'dq_011', decision: 'Buy', cardName: '2020 National Treasures Burrow RPA /99', outcome: 'profit', score: 78, bias_detected: null, amount: 15000, date: '2026-02-05', notes: 'Bought after thorough comp analysis. Paid at median FMV. Solid entry point.' },
  { id: 'dq_012', decision: 'Sell', cardName: '2019 Optic Ja Morant Silver PSA 10', outcome: 'loss', score: 38, bias_detected: 'sunk_cost', amount: 3200, date: '2026-02-28', notes: 'Kept averaging down on a declining card. Total investment: $5,800. Sold for $3,200.' },
  { id: 'dq_013', decision: 'Buy', cardName: '1948 Leaf Jackie Robinson RC SGC 3', outcome: 'hold', score: 90, bias_detected: null, amount: 95000, date: '2026-03-01', notes: 'Won at auction below estimate range. Pre-war vintage with strong fundamentals.' },
  { id: 'dq_014', decision: 'Buy', cardName: '2022 Panini Prizm Paolo Banchero Silver RC', outcome: 'loss', score: 25, bias_detected: 'fomo', amount: 420, date: '2026-03-05', notes: 'Bought 5 copies at 11:30pm after "last one" listing alert. All above FMV. Impulse buy.' },
  { id: 'dq_015', decision: 'Hold', cardName: '2003 Topps Chrome LeBron RC PSA 10', outcome: 'profit', score: 91, bias_detected: null, amount: 42000, date: '2025-09-20', notes: 'Long-term hold. Up 18% since purchase. Thesis intact. No behavioral red flags.' },
  { id: 'dq_016', decision: 'Buy', cardName: '2024 Bowman Chrome Paul Skenes Auto /150', outcome: 'hold', score: 55, bias_detected: 'recency', amount: 3800, date: '2026-03-08', notes: 'Bought after dominant spring training start. Recency bias likely inflated perceived value.' },
  { id: 'dq_017', decision: 'Sell', cardName: '2020 Prizm Anthony Edwards Silver PSA 10', outcome: 'profit', score: 82, bias_detected: null, amount: 2800, date: '2026-03-10', notes: 'Sold into strength after All-Star game hype. Captured 22% gain. Disciplined exit.' },
  { id: 'dq_018', decision: 'Buy', cardName: '2021 Panini Flawless Mac Jones RPA /25', outcome: 'loss', score: 18, bias_detected: 'sunk_cost', amount: 4500, date: '2025-12-20', notes: 'Doubled down after first purchase lost 25%. Card now down 55% total. Classic sunk cost trap.' },
  { id: 'dq_019', decision: 'Buy', cardName: '1979 OPC Wayne Gretzky RC PSA 7', outcome: 'hold', score: 88, bias_detected: null, amount: 85000, date: '2026-02-15', notes: 'Patient acquisition below market. Strong fundamentals. No emotional factors in decision.' },
  { id: 'dq_020', decision: 'Buy', cardName: '2023 Topps Chrome Elly De La Cruz RC Auto', outcome: 'loss', score: 35, bias_detected: 'anchoring', amount: 1200, date: '2026-03-02', notes: 'Anchored to initial listing of $1,500 and felt $1,200 was a deal. Comps show FMV of $850.' },
  { id: 'dq_021', decision: 'Hold', cardName: '2022 Panini Prizm Tyreek Hill Silver PSA 10', outcome: 'loss', score: 42, bias_detected: 'endowment_effect', amount: 380, date: '2026-01-10', notes: 'Turned down $350 offer because "it is worth at least $500 to me." Market says $280.' },
  { id: 'dq_022', decision: 'Buy', cardName: '1989 Upper Deck Griffey Jr RC PSA 10', outcome: 'profit', score: 86, bias_detected: null, amount: 8500, date: '2026-03-09', notes: 'Won at Heritage below estimate. Methodical approach with pre-set max bid.' },
  { id: 'dq_023', decision: 'Sell', cardName: '2020 Panini Select Justin Jefferson Silver', outcome: 'profit', score: 79, bias_detected: null, amount: 1400, date: '2026-03-11', notes: 'Sold after hitting target price. Took 30% profit without greed. Clean execution.' },
  { id: 'dq_024', decision: 'Buy', cardName: '2024 Topps Chrome Caitlin Clark RC', outcome: 'hold', score: 48, bias_detected: 'fomo', amount: 650, date: '2026-03-12', notes: 'Bought after viral social media post. FOMO-driven. Price already cooling off.' },
  { id: 'dq_025', decision: 'Hold', cardName: '2018 Prizm Trae Young Silver PSA 10', outcome: 'loss', score: 30, bias_detected: 'disposition_effect', amount: 1200, date: '2025-11-15', notes: 'Holding at -40% loss. Three sell signals ignored in last 90 days. Disposition effect active.' },
  { id: 'dq_026', decision: 'Buy', cardName: '2001 SP Authentic Tiger Woods RC Auto /900', outcome: 'profit', score: 84, bias_detected: null, amount: 22000, date: '2026-02-25', notes: 'Golf market thesis validated. Bought below FMV at PWCC. Methodical acquisition.' },
  { id: 'dq_027', decision: 'Buy', cardName: '2023 Prizm Victor Wembanyama Base PSA 10', outcome: 'loss', score: 20, bias_detected: 'fomo', amount: 280, date: '2026-03-03', notes: 'Bought 10 copies at 12:30am in a panic after seeing "sold out" alerts. All above FMV.' },
  { id: 'dq_028', decision: 'Sell', cardName: '1971 Topps Clemente #630 PSA 7', outcome: 'profit', score: 88, bias_detected: null, amount: 8200, date: '2026-03-07', notes: 'Exited at target. Resisted endowment effect. Clean, objective sell decision.' },
  { id: 'dq_029', decision: 'Buy', cardName: '2024 Bowman Chrome Jackson Holliday Auto', outcome: 'hold', score: 52, bias_detected: 'confirmation', amount: 1600, date: '2026-03-10', notes: 'Only read bullish analysis. Ignored bearish supply concerns. Confirmation bias detected.' },
  { id: 'dq_030', decision: 'Hold', cardName: '2021 Panini National Treasures Trevor Lawrence RPA', outcome: 'loss', score: 15, bias_detected: 'sunk_cost', amount: 6800, date: '2025-10-01', notes: 'Down 62%. Continued holding because of $11,000 total investment. Textbook sunk cost fallacy.' },
];

const MONTHLY_REPORTS: MonthlyReport[] = [
  { month: 'Oct 2025', decisionScore: 58, totalSpent: 48000, impulsePurchases: 6, biasesTriggered: 9, moneySavedByNudges: 2200, topBias: 'fomo', improvement: 0 },
  { month: 'Nov 2025', decisionScore: 62, totalSpent: 52000, impulsePurchases: 5, biasesTriggered: 7, moneySavedByNudges: 3100, topBias: 'disposition_effect', improvement: 6.9 },
  { month: 'Dec 2025', decisionScore: 65, totalSpent: 35000, impulsePurchases: 3, biasesTriggered: 5, moneySavedByNudges: 4500, topBias: 'sunk_cost', improvement: 4.8 },
  { month: 'Jan 2026', decisionScore: 68, totalSpent: 95000, impulsePurchases: 4, biasesTriggered: 6, moneySavedByNudges: 5800, topBias: 'recency', improvement: 4.6 },
  { month: 'Feb 2026', decisionScore: 72, totalSpent: 82000, impulsePurchases: 3, biasesTriggered: 5, moneySavedByNudges: 7200, topBias: 'anchoring', improvement: 5.9 },
  { month: 'Mar 2026', decisionScore: 74, totalSpent: 64000, impulsePurchases: 2, biasesTriggered: 4, moneySavedByNudges: 8400, topBias: 'fomo', improvement: 2.8 },
];

const COOL_DOWN_RULES: CoolDownRule[] = [
  { id: 'cdr_001', name: 'Late Night Guardian', description: 'Adds a 30-minute delay to any purchase over $500 made after 10pm', triggerCondition: 'time_after_22:00 AND amount > 500', cooldownMinutes: 30, enabled: true, timesTriggered: 14, moneySaved: 8200 },
  { id: 'cdr_002', name: 'Auction Loss Recovery', description: 'Blocks impulsive buying for 2 hours after losing an auction', triggerCondition: 'event:auction_loss AND time_since < 120min', cooldownMinutes: 120, enabled: true, timesTriggered: 8, moneySaved: 12400 },
  { id: 'cdr_003', name: 'FOMO Brake', description: '15-minute pause when buying a card that spiked >20% in the last 24 hours', triggerCondition: 'card_price_change_24h > 20%', cooldownMinutes: 15, enabled: true, timesTriggered: 11, moneySaved: 5600 },
  { id: 'cdr_004', name: 'Budget Sentinel', description: 'Requires confirmation when weekly spend exceeds $5,000', triggerCondition: 'weekly_spend > 5000', cooldownMinutes: 60, enabled: true, timesTriggered: 6, moneySaved: 9800 },
  { id: 'cdr_005', name: 'Duplicate Detector', description: 'Warns when buying a card you already own 3+ copies of', triggerCondition: 'card_copies_owned >= 3', cooldownMinutes: 10, enabled: false, timesTriggered: 3, moneySaved: 1800 },
  { id: 'cdr_006', name: 'Social Media Buffer', description: '20-minute delay on purchases made within 10 minutes of opening social media', triggerCondition: 'event:social_media_open AND time_since < 10min', cooldownMinutes: 20, enabled: true, timesTriggered: 19, moneySaved: 4200 },
];

const IMPULSE_ALERTS: ImpulseAlert[] = [
  { id: 'ia_001', cardName: '2024 Topps Chrome Caitlin Clark RC Auto', proposedAmount: 1200, fairMarketValue: 850, overpayPercent: 41.2, riskLevel: 'critical', reason: 'Card spiked 45% in last 6 hours due to viral tweet. High probability of reversion. Late-night purchase attempt.', timestamp: '2026-03-13T23:42:00Z' },
  { id: 'ia_002', cardName: '2023 Prizm Wembanyama Silver PSA 10', proposedAmount: 3800, fairMarketValue: 3200, overpayPercent: 18.8, riskLevel: 'high', reason: 'You lost a similar card at auction 45 minutes ago. Revenge buying pattern detected. FMV suggests waiting.', timestamp: '2026-03-12T21:15:00Z' },
  { id: 'ia_003', cardName: '2022 Bowman Chrome Gunnar Henderson Auto', proposedAmount: 680, fairMarketValue: 620, overpayPercent: 9.7, riskLevel: 'medium', reason: 'Weekly budget already at 92% capacity. Consider waiting for next cycle.', timestamp: '2026-03-11T14:30:00Z' },
];

const EMOTIONAL_TRIGGERS: EmotionalTrigger[] = [
  { trigger: 'Late Night Browsing (after 10pm)', frequency: 31, avgSpend: 2450, avgOverpay: 22.5, lastOccurrence: '2026-03-13' },
  { trigger: 'Post-Auction Loss Revenge', frequency: 12, avgSpend: 3800, avgOverpay: 28.3, lastOccurrence: '2026-03-12' },
  { trigger: 'Social Media FOMO', frequency: 24, avgSpend: 1150, avgOverpay: 15.8, lastOccurrence: '2026-03-12' },
  { trigger: 'Market Spike Chasing', frequency: 8, avgSpend: 5200, avgOverpay: 31.4, lastOccurrence: '2026-03-10' },
  { trigger: 'Payday Splurge', frequency: 18, avgSpend: 1950, avgOverpay: 12.1, lastOccurrence: '2026-03-07' },
  { trigger: 'Post-Vacation Re-entry', frequency: 4, avgSpend: 4100, avgOverpay: 24.6, lastOccurrence: '2026-02-18' },
];

const OVERPAYMENT_ANALYSIS: OverpaymentEntry[] = [
  { cardName: '2023 Prizm Caleb Williams Silver RC', pricePaid: 1800, fairValue: 1250, overpayAmount: 550, overpayPercent: 44.0, biasContributor: 'fomo', date: '2026-03-01' },
  { cardName: '2020 Prizm Justin Herbert Silver PSA 10', pricePaid: 8500, fairValue: 6800, overpayAmount: 1700, overpayPercent: 25.0, biasContributor: 'fomo', date: '2026-01-22' },
  { cardName: '2023 Topps Chrome Elly De La Cruz RC Auto', pricePaid: 1200, fairValue: 850, overpayAmount: 350, overpayPercent: 41.2, biasContributor: 'anchoring', date: '2026-03-02' },
  { cardName: '2024 Topps Chrome Caitlin Clark RC', pricePaid: 650, fairValue: 480, overpayAmount: 170, overpayPercent: 35.4, biasContributor: 'fomo', date: '2026-03-12' },
  { cardName: '2023 Prizm Wembanyama Base PSA 10 (x10)', pricePaid: 2800, fairValue: 2100, overpayAmount: 700, overpayPercent: 33.3, biasContributor: 'fomo', date: '2026-03-03' },
  { cardName: '2022 Panini Prizm Paolo Banchero Silver RC (x5)', pricePaid: 2100, fairValue: 1650, overpayAmount: 450, overpayPercent: 27.3, biasContributor: 'fomo', date: '2026-03-05' },
  { cardName: '2024 Bowman Chrome Jackson Holliday Auto', pricePaid: 1600, fairValue: 1350, overpayAmount: 250, overpayPercent: 18.5, biasContributor: 'confirmation', date: '2026-03-10' },
  { cardName: '2024 Bowman Chrome Paul Skenes Auto /150', pricePaid: 3800, fairValue: 3200, overpayAmount: 600, overpayPercent: 18.8, biasContributor: 'recency', date: '2026-03-08' },
  { cardName: '2018 Prizm Luka Doncic Silver PSA 10', pricePaid: 5200, fairValue: 4600, overpayAmount: 600, overpayPercent: 13.0, biasContributor: 'recency', date: '2026-02-20' },
  { cardName: '2022 Panini Prizm Tyreek Hill Silver PSA 10', pricePaid: 380, fairValue: 280, overpayAmount: 100, overpayPercent: 35.7, biasContributor: 'endowment_effect', date: '2026-01-10' },
];

const NUDGES: Nudge[] = [
  { id: 'n_001', type: 'warning', message: 'You are browsing after 11pm. Your overpay rate increases 42% during late-night sessions.', priority: 'high', acknowledged: false },
  { id: 'n_002', type: 'delay', message: 'Cool-down active: You lost an auction 35 minutes ago. Wait 85 more minutes before purchasing.', priority: 'critical', acknowledged: false },
  { id: 'n_003', type: 'suggestion', message: 'Consider checking comparable sales before bidding. Your anchoring bias has cost $3,870 this quarter.', priority: 'medium', acknowledged: true },
  { id: 'n_004', type: 'warning', message: 'Weekly spending at 87% of budget. $650 remaining before the Budget Sentinel triggers.', priority: 'medium', acknowledged: false },
  { id: 'n_005', type: 'block', message: 'Duplicate alert: You already own 4 copies of this card. Purchase blocked pending review.', priority: 'high', acknowledged: false },
  { id: 'n_006', type: 'suggestion', message: 'Your portfolio has 3 holdings down >30%. Review for potential sunk cost bias.', priority: 'low', acknowledged: true },
];

// ---- Public API ----

export function getBehavioralProfile(): BehavioralProfile {
  const cached = loadData<BehavioralProfile>('profile');
  if (cached) return cached;

  const profile: BehavioralProfile = {
    overallScore: 74,
    activeBiases: BIAS_DETECTIONS.filter(b => b.severity === 'high' || b.severity === 'critical').length,
    impulseLevel: 'medium',
    nudgesActive: NUDGES.filter(n => !n.acknowledged).length,
    totalSavedByNudges: COOL_DOWN_RULES.reduce((sum, r) => sum + r.moneySaved, 0),
    impulsePurchasesAvoided: 23,
    avgDecisionQuality: Math.round(DECISION_HISTORY.reduce((sum, d) => sum + d.score, 0) / DECISION_HISTORY.length),
    streakDays: 4,
    riskTolerance: 'moderate',
    emotionalState: 'elevated',
  };

  saveData('profile', profile);
  return profile;
}

export function detectBiases(_portfolio?: string[]): BiasDetection[] {
  const cached = loadData<BiasDetection[]>('bias_detections');
  if (cached && cached.length > 0) return cached;
  saveData('bias_detections', BIAS_DETECTIONS);
  return BIAS_DETECTIONS;
}

export function getSpendingPatterns(): SpendingPattern[] {
  return SPENDING_PATTERNS;
}

export function getDecisionHistory(): DecisionQuality[] {
  const cached = loadData<DecisionQuality[]>('decisions');
  if (cached && cached.length > 0) return cached;
  saveData('decisions', DECISION_HISTORY);
  return DECISION_HISTORY;
}

export function scoreDecisionQuality(decisions: DecisionQuality[]): number {
  if (decisions.length === 0) return 0;
  return Math.round(decisions.reduce((sum, d) => sum + d.score, 0) / decisions.length);
}

export function getMonthlyReport(month?: string): MonthlyReport[] {
  if (month) {
    const found = MONTHLY_REPORTS.filter(r => r.month === month);
    return found.length > 0 ? found : MONTHLY_REPORTS;
  }
  return MONTHLY_REPORTS;
}

export function getCoolDownRules(): CoolDownRule[] {
  const cached = loadData<CoolDownRule[]>('cooldown_rules');
  if (cached && cached.length > 0) return cached;
  saveData('cooldown_rules', COOL_DOWN_RULES);
  return COOL_DOWN_RULES;
}

export function checkImpulseAlert(_purchase?: { cardName: string; amount: number }): ImpulseAlert[] {
  return IMPULSE_ALERTS;
}

export function getNudges(): Nudge[] {
  const cached = loadData<Nudge[]>('nudges');
  if (cached && cached.length > 0) return cached;
  saveData('nudges', NUDGES);
  return NUDGES;
}

export function getBiasBreakdown(): { bias: CognitiveBias; count: number; totalCost: number; avgSeverity: number }[] {
  const biasMap: Record<string, { count: number; totalCost: number; severitySum: number }> = {};

  DECISION_HISTORY.forEach(d => {
    if (d.bias_detected) {
      if (!biasMap[d.bias_detected]) biasMap[d.bias_detected] = { count: 0, totalCost: 0, severitySum: 0 };
      biasMap[d.bias_detected].count += 1;
      if (d.outcome === 'loss') biasMap[d.bias_detected].totalCost += d.amount * 0.25;
      biasMap[d.bias_detected].severitySum += (100 - d.score);
    }
  });

  return Object.entries(biasMap).map(([bias, data]) => ({
    bias: bias as CognitiveBias,
    count: data.count,
    totalCost: Math.round(data.totalCost),
    avgSeverity: Math.round(data.severitySum / data.count),
  })).sort((a, b) => b.totalCost - a.totalCost);
}

export function getEmotionalSpendingTriggers(): EmotionalTrigger[] {
  return EMOTIONAL_TRIGGERS;
}

export function getOverpaymentAnalysis(): OverpaymentEntry[] {
  return OVERPAYMENT_ANALYSIS;
}

// ---- Helpers ----

export function getSeverityConfig(severity: Severity): { label: string; text: string; bg: string; border: string } {
  const map: Record<Severity, { label: string; text: string; bg: string; border: string }> = {
    low: { label: 'LOW', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    medium: { label: 'MEDIUM', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    high: { label: 'HIGH', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    critical: { label: 'CRITICAL', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };
  return map[severity];
}

export function getBiasConfig(bias: CognitiveBias): { label: string; text: string; bg: string; border: string } {
  const map: Record<CognitiveBias, { label: string; text: string; bg: string; border: string }> = {
    endowment_effect: { label: 'Endowment Effect', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    anchoring: { label: 'Anchoring', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    loss_aversion: { label: 'Loss Aversion', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    fomo: { label: 'FOMO', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    sunk_cost: { label: 'Sunk Cost', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    recency: { label: 'Recency Bias', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    confirmation: { label: 'Confirmation', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    disposition_effect: { label: 'Disposition Effect', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  };
  return map[bias];
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}
