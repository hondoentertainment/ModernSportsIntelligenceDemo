// Phase 253 — Auto-Buy Rule Engine Service
// Automated purchase rules based on configurable conditions for sports card acquisitions

// ---- Types ----

export interface RuleCondition {
  field: string;
  operator: 'lt' | 'gt' | 'eq' | 'contains';
  value: string | number;
}

export interface BuyRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  maxPrice: number;
  enabled: boolean;
  triggerCount: number;
  lastTriggered: string;
  budget: number;
  spent: number;
}

export interface RuleTriggerLog {
  ruleId: string;
  card: string;
  price: number;
  timestamp: string;
  status: 'executed' | 'blocked' | 'pending';
}

// ---- Mock Data ----

const buyRules: BuyRule[] = [
  {
    id: 'br-001',
    name: 'Wembanyama PSA 10 Sniper',
    conditions: [
      { field: 'player', operator: 'contains', value: 'Wembanyama' },
      { field: 'grade', operator: 'eq', value: 10 },
      { field: 'price', operator: 'lt', value: 500 },
    ],
    maxPrice: 500,
    enabled: true,
    triggerCount: 4,
    lastTriggered: '2026-03-14',
    budget: 5000,
    spent: 1840,
  },
  {
    id: 'br-002',
    name: 'Vintage Baseball Under Market',
    conditions: [
      { field: 'year', operator: 'lt', value: 1975 },
      { field: 'sport', operator: 'eq', value: 'Baseball' },
      { field: 'priceVsMarket', operator: 'lt', value: 0.85 },
    ],
    maxPrice: 2000,
    enabled: true,
    triggerCount: 7,
    lastTriggered: '2026-03-12',
    budget: 15000,
    spent: 8920,
  },
  {
    id: 'br-003',
    name: 'Rookie Auto Bargain Hunter',
    conditions: [
      { field: 'cardType', operator: 'contains', value: 'Auto' },
      { field: 'rookieCard', operator: 'eq', value: 'true' },
      { field: 'price', operator: 'lt', value: 150 },
    ],
    maxPrice: 150,
    enabled: true,
    triggerCount: 12,
    lastTriggered: '2026-03-16',
    budget: 3000,
    spent: 1450,
  },
  {
    id: 'br-004',
    name: 'Mahomes Numbered Parallels',
    conditions: [
      { field: 'player', operator: 'contains', value: 'Mahomes' },
      { field: 'numbered', operator: 'lt', value: 50 },
    ],
    maxPrice: 800,
    enabled: false,
    triggerCount: 2,
    lastTriggered: '2026-02-20',
    budget: 8000,
    spent: 1560,
  },
  {
    id: 'br-005',
    name: 'Ohtani Chrome Refractors',
    conditions: [
      { field: 'player', operator: 'contains', value: 'Ohtani' },
      { field: 'set', operator: 'contains', value: 'Chrome' },
      { field: 'parallel', operator: 'contains', value: 'Refractor' },
    ],
    maxPrice: 350,
    enabled: true,
    triggerCount: 6,
    lastTriggered: '2026-03-15',
    budget: 4000,
    spent: 1875,
  },
];

const triggerLogs: RuleTriggerLog[] = [
  {
    ruleId: 'br-001',
    card: '2023 Panini Prizm Victor Wembanyama RC PSA 10',
    price: 465,
    timestamp: '2026-03-14T14:22:00Z',
    status: 'executed',
  },
  {
    ruleId: 'br-002',
    card: '1969 Topps Reggie Jackson RC #260 PSA 6',
    price: 1850,
    timestamp: '2026-03-12T09:15:00Z',
    status: 'executed',
  },
  {
    ruleId: 'br-003',
    card: '2024 Bowman Chrome Jackson Holliday 1st Auto',
    price: 135,
    timestamp: '2026-03-16T18:45:00Z',
    status: 'executed',
  },
  {
    ruleId: 'br-003',
    card: '2024 Topps Chrome Elly De La Cruz Auto RC',
    price: 148,
    timestamp: '2026-03-15T11:30:00Z',
    status: 'blocked',
  },
  {
    ruleId: 'br-005',
    card: '2024 Topps Chrome Shohei Ohtani Gold Refractor /50',
    price: 340,
    timestamp: '2026-03-15T20:10:00Z',
    status: 'executed',
  },
  {
    ruleId: 'br-004',
    card: '2023 Panini Prizm Patrick Mahomes Gold /10',
    price: 780,
    timestamp: '2026-03-13T16:55:00Z',
    status: 'pending',
  },
];

// ---- Service Functions ----

export function getBuyRules(): BuyRule[] {
  return [...buyRules];
}

export function getTriggerLogs(): RuleTriggerLog[] {
  return [...triggerLogs];
}

export function getRuleEngineStats() {
  const totalRules = buyRules.length;
  const activeRules = buyRules.filter((r) => r.enabled).length;
  const disabledRules = totalRules - activeRules;
  const totalBudget = buyRules.reduce((sum, r) => sum + r.budget, 0);
  const totalSpent = buyRules.reduce((sum, r) => sum + r.spent, 0);
  const budgetUtilization = Math.round((totalSpent / totalBudget) * 100);
  const totalTriggers = buyRules.reduce((sum, r) => sum + r.triggerCount, 0);
  const executedLogs = triggerLogs.filter((l) => l.status === 'executed').length;
  const blockedLogs = triggerLogs.filter((l) => l.status === 'blocked').length;
  const pendingLogs = triggerLogs.filter((l) => l.status === 'pending').length;
  const avgPrice =
    Math.round(triggerLogs.reduce((sum, l) => sum + l.price, 0) / triggerLogs.length);

  return {
    totalRules,
    activeRules,
    disabledRules,
    totalBudget,
    totalSpent,
    budgetUtilization,
    totalTriggers,
    executedLogs,
    blockedLogs,
    pendingLogs,
    avgPurchasePrice: avgPrice,
  };
}

const autoBuyRuleEngineService = {
  getBuyRules,
  getTriggerLogs,
  getRuleEngineStats,
};

export default autoBuyRuleEngineService;
