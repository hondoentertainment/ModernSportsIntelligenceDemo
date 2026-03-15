import { CardInventory } from '../types';

// ---- Types ----

export type ConditionType =
  | 'price_above'
  | 'price_below'
  | 'pct_change'
  | 'roi_above'
  | 'roi_below'
  | 'holding_days_above'
  | 'anomaly_detected'
  | 'breakout_score_above';

export type ActionType =
  | 'move_to_trade_block'
  | 'generate_listing'
  | 'create_alert'
  | 'add_to_consignment'
  | 'notify'
  | 'log_journal';

export type RuleStatus = 'active' | 'paused' | 'dry_run';

export type LogicOperator = 'AND' | 'OR';

export interface RuleCondition {
  id: string;
  type: ConditionType;
  value: number;
  operator: LogicOperator;
}

export interface RuleAction {
  type: ActionType;
  label: string;
  metadata?: Record<string, string>;
}

export interface TradingRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  action: RuleAction;
  status: RuleStatus;
  priority: number; // 1-10
  maxTriggersPerDay: number;
  triggerCount: number;
  lastTriggered: string | null;
  createdAt: string;
}

export interface RuleTrigger {
  id: string;
  ruleId: string;
  ruleName: string;
  cardId: string;
  cardName: string;
  action: ActionType;
  actionLabel: string;
  result: string;
  timestamp: string;
  isDryRun: boolean;
}

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: Omit<RuleCondition, 'id'>[];
  action: RuleAction;
  priority: number;
  maxTriggersPerDay: number;
}

export interface BacktestResult {
  ruleId: string;
  ruleName: string;
  triggerCount: number;
  simulatedPL: number;
  hitRate: number;
  monthlyTriggers: { month: string; triggers: number; pl: number }[];
}

// ---- Constants ----

const RULES_KEY = 'msi_trading_rules';
const TRIGGERS_KEY = 'msi_rule_triggers';

// ---- Deterministic helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function generateId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateTriggerId(): string {
  return `trigger_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateConditionId(): string {
  return `cond_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Condition Labels ----

export const CONDITION_LABELS: Record<ConditionType, string> = {
  price_above: 'Current Value Above',
  price_below: 'Current Value Below',
  pct_change: 'Price Change % Above',
  roi_above: 'ROI % Above',
  roi_below: 'ROI % Below',
  holding_days_above: 'Holding Days Above',
  anomaly_detected: 'Anomaly Score Above',
  breakout_score_above: 'Breakout Score Above',
};

export const ACTION_LABELS: Record<ActionType, string> = {
  move_to_trade_block: 'Move to Trade Block',
  generate_listing: 'Generate Listing',
  create_alert: 'Create Alert',
  add_to_consignment: 'Add to Consignment',
  notify: 'Send Notification',
  log_journal: 'Log to Journal',
};

// ---- Card evaluation helpers ----

function getCardROI(card: CardInventory): number {
  const currentVal = card.currentValue ?? card.purchasePrice;
  if (card.purchasePrice <= 0) return 0;
  return ((currentVal - card.purchasePrice) / card.purchasePrice) * 100;
}

function getHoldingDays(card: CardInventory): number {
  const purchaseDate = new Date(card.purchaseDate).getTime();
  const now = Date.now();
  return Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
}

function getPctChange(card: CardInventory): number {
  // Simulate price change based on card value difference
  return getCardROI(card);
}

function getBreakoutScore(card: CardInventory): number {
  // Use scarcity index or simulate a breakout score
  if (card.scarcityIndex !== undefined) return card.scarcityIndex;
  // Deterministic based on card id hash
  let hash = 0;
  for (let i = 0; i < card.id.length; i++) {
    hash = ((hash << 5) - hash + card.id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 100);
}

function getAnomalyScore(card: CardInventory): number {
  // Deterministic anomaly score based on card properties
  const roi = Math.abs(getCardROI(card));
  const holdDays = getHoldingDays(card);
  // High ROI + short hold = anomaly
  const score = Math.min(100, (roi * 0.6) + (holdDays < 30 ? 30 : 0));
  return Math.round(score);
}

// ---- Core evaluation ----

export function evaluateCondition(card: CardInventory, condition: RuleCondition): boolean {
  const currentVal = card.currentValue ?? card.purchasePrice;

  switch (condition.type) {
    case 'price_above':
      return currentVal > condition.value;
    case 'price_below':
      return currentVal < condition.value;
    case 'pct_change':
      return getPctChange(card) > condition.value;
    case 'roi_above':
      return getCardROI(card) > condition.value;
    case 'roi_below':
      return getCardROI(card) < condition.value;
    case 'holding_days_above':
      return getHoldingDays(card) > condition.value;
    case 'anomaly_detected':
      return getAnomalyScore(card) > condition.value;
    case 'breakout_score_above':
      return getBreakoutScore(card) > condition.value;
    default:
      return false;
  }
}

function evaluateConditions(card: CardInventory, conditions: RuleCondition[]): boolean {
  if (conditions.length === 0) return false;

  // First condition is always evaluated
  let result = evaluateCondition(card, conditions[0]);

  for (let i = 1; i < conditions.length; i++) {
    const cond = conditions[i];
    const condResult = evaluateCondition(card, cond);

    // The operator on condition[i] defines how it combines with the previous result
    if (cond.operator === 'AND') {
      result = result && condResult;
    } else {
      result = result || condResult;
    }
  }

  return result;
}

export function executeAction(
  action: RuleAction,
  card: CardInventory,
  rule: TradingRule
): RuleTrigger {
  const resultMessages: Record<ActionType, string> = {
    move_to_trade_block: `Moved "${card.player}" to trade block`,
    generate_listing: `Generated listing for "${card.player}" at $${(card.currentValue ?? card.purchasePrice).toFixed(2)}`,
    create_alert: `Alert created for "${card.player}" - Rule: ${rule.name}`,
    add_to_consignment: `Added "${card.player}" to consignment queue`,
    notify: `Notification sent: "${card.player}" triggered "${rule.name}"`,
    log_journal: `Journal entry logged for "${card.player}" - ${rule.name}`,
  };

  return {
    id: generateTriggerId(),
    ruleId: rule.id,
    ruleName: rule.name,
    cardId: card.id,
    cardName: `${card.year} ${card.manufacturer} ${card.player}`,
    action: action.type,
    actionLabel: ACTION_LABELS[action.type],
    result: resultMessages[action.type] ?? 'Action executed',
    timestamp: new Date().toISOString(),
    isDryRun: rule.status === 'dry_run',
  };
}

export function evaluateRules(
  cards: CardInventory[],
  rules: TradingRule[]
): RuleTrigger[] {
  const triggers: RuleTrigger[] = [];
  const today = new Date().toISOString().slice(0, 10);

  // Only evaluate active and dry_run rules, sorted by priority
  const activeRules = rules
    .filter(r => r.status === 'active' || r.status === 'dry_run')
    .sort((a, b) => a.priority - b.priority);

  // Load existing triggers to check daily limits
  const existingTriggers = loadTriggerHistory();
  const todayTriggerCounts: Record<string, number> = {};
  existingTriggers.forEach(t => {
    if (t.timestamp.slice(0, 10) === today) {
      todayTriggerCounts[t.ruleId] = (todayTriggerCounts[t.ruleId] ?? 0) + 1;
    }
  });

  const activeCards = cards.filter(c => c.status !== 'sold');

  for (const rule of activeRules) {
    const dailyCount = todayTriggerCounts[rule.id] ?? 0;
    if (dailyCount >= rule.maxTriggersPerDay) continue;

    let triggersRemaining = rule.maxTriggersPerDay - dailyCount;

    for (const card of activeCards) {
      if (triggersRemaining <= 0) break;

      if (evaluateConditions(card, rule.conditions)) {
        const trigger = executeAction(rule.action, card, rule);
        triggers.push(trigger);
        triggersRemaining--;
      }
    }
  }

  // Persist new triggers
  if (triggers.length > 0) {
    const allTriggers = [...existingTriggers, ...triggers];
    saveTriggerHistory(allTriggers);

    // Update rule trigger counts
    const updatedRules = rules.map(r => {
      const newTriggers = triggers.filter(t => t.ruleId === r.id);
      if (newTriggers.length > 0) {
        return {
          ...r,
          triggerCount: r.triggerCount + newTriggers.length,
          lastTriggered: newTriggers[newTriggers.length - 1].timestamp,
        };
      }
      return r;
    });
    saveRules(updatedRules);
  }

  return triggers;
}

// ---- Backtesting ----

export function backtestRule(rule: TradingRule, cards: CardInventory[]): BacktestResult {
  const monthlyTriggers: { month: string; triggers: number; pl: number }[] = [];
  let totalTriggers = 0;
  let totalPL = 0;
  let hits = 0;


  const activeCards = cards.filter(c => c.status !== 'sold');
  const now = new Date();
  const baseSeed = rule.id.length * 17 + rule.priority;

  for (let m = 11; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    let monthTriggerCount = 0;
    let monthPL = 0;

    for (let cardIdx = 0; cardIdx < activeCards.length; cardIdx++) {
      const card = activeCards[cardIdx];
      const currentVal = card.currentValue ?? card.purchasePrice;

      // Simulate historical price variation for this month
      const priceVariation = 1 + (seededRandom(baseSeed + m, cardIdx * 7 + 3) - 0.5) * 0.4;
      const historicalValue = currentVal * priceVariation;

      // Create a simulated card with historical value
      const simCard: CardInventory = {
        ...card,
        currentValue: Math.round(historicalValue * 100) / 100,
      };

      if (evaluateConditions(simCard, rule.conditions)) {
        monthTriggerCount++;
        totalTriggers++;

        // Simulate P/L from action
        const actionPL = (historicalValue - card.purchasePrice);
        monthPL += actionPL;
        totalPL += actionPL;

        if (actionPL > 0) hits++;
      }
    }

    monthlyTriggers.push({
      month: monthLabel,
      triggers: monthTriggerCount,
      pl: Math.round(monthPL * 100) / 100,
    });
  }

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    triggerCount: totalTriggers,
    simulatedPL: Math.round(totalPL * 100) / 100,
    hitRate: totalTriggers > 0 ? Math.round((hits / totalTriggers) * 100) : 0,
    monthlyTriggers,
  };
}

// ---- Templates ----

const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: 'tmpl_stop_loss',
    name: 'Stop-Loss (-20%)',
    description: 'Automatically flag cards that have dropped more than 20% from purchase price to cut losses early.',
    category: 'Risk Management',
    conditions: [
      { type: 'roi_below', value: -20, operator: 'AND' },
    ],
    action: { type: 'move_to_trade_block', label: 'Move to Trade Block' },
    priority: 1,
    maxTriggersPerDay: 10,
  },
  {
    id: 'tmpl_take_profit',
    name: 'Take-Profit (+50%)',
    description: 'Generate a listing when a card appreciates 50% or more to lock in gains.',
    category: 'Profit Taking',
    conditions: [
      { type: 'roi_above', value: 50, operator: 'AND' },
    ],
    action: { type: 'generate_listing', label: 'Generate Listing' },
    priority: 2,
    maxTriggersPerDay: 10,
  },
  {
    id: 'tmpl_momentum_exit',
    name: 'Momentum Exit',
    description: 'Exit positions with ROI above 100% that have been held for over 90 days to capture momentum gains.',
    category: 'Profit Taking',
    conditions: [
      { type: 'roi_above', value: 100, operator: 'AND' },
      { type: 'holding_days_above', value: 90, operator: 'AND' },
    ],
    action: { type: 'generate_listing', label: 'Generate Listing' },
    priority: 3,
    maxTriggersPerDay: 5,
  },
  {
    id: 'tmpl_tax_harvest',
    name: 'Tax-Loss Harvest',
    description: 'Identify cards with losses below -15% held under 365 days for potential tax-loss harvesting.',
    category: 'Tax Strategy',
    conditions: [
      { type: 'roi_below', value: -15, operator: 'AND' },
      { type: 'holding_days_above', value: 0, operator: 'AND' },
    ],
    action: { type: 'log_journal', label: 'Log to Journal' },
    priority: 4,
    maxTriggersPerDay: 10,
  },
  {
    id: 'tmpl_breakout_alert',
    name: 'Breakout Alert',
    description: 'Get notified when a card\'s breakout score exceeds 80, indicating potential rapid appreciation.',
    category: 'Opportunity',
    conditions: [
      { type: 'breakout_score_above', value: 80, operator: 'AND' },
    ],
    action: { type: 'create_alert', label: 'Create Alert' },
    priority: 5,
    maxTriggersPerDay: 5,
  },
  {
    id: 'tmpl_stale_position',
    name: 'Stale Position',
    description: 'Flag cards held over 365 days with less than 5% ROI that may be tying up capital.',
    category: 'Portfolio Health',
    conditions: [
      { type: 'holding_days_above', value: 365, operator: 'AND' },
      { type: 'roi_below', value: 5, operator: 'AND' },
    ],
    action: { type: 'notify', label: 'Send Notification' },
    priority: 6,
    maxTriggersPerDay: 10,
  },
  {
    id: 'tmpl_high_value_alert',
    name: 'High Value Threshold',
    description: 'Receive an alert when any card exceeds $500 in current value for premium portfolio tracking.',
    category: 'Monitoring',
    conditions: [
      { type: 'price_above', value: 500, operator: 'AND' },
    ],
    action: { type: 'create_alert', label: 'Create Alert' },
    priority: 7,
    maxTriggersPerDay: 5,
  },
];

export function getRuleTemplates(): RuleTemplate[] {
  return RULE_TEMPLATES;
}

export function createRuleFromTemplate(templateId: string): TradingRule | null {
  const template = RULE_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  return {
    id: generateId(),
    name: template.name,
    description: template.description,
    conditions: template.conditions.map(c => ({
      ...c,
      id: generateConditionId(),
    })),
    action: { ...template.action },
    status: 'dry_run',
    priority: template.priority,
    maxTriggersPerDay: template.maxTriggersPerDay,
    triggerCount: 0,
    lastTriggered: null,
    createdAt: new Date().toISOString(),
  };
}

// ---- Persistence ----

export function saveRules(rules: TradingRule[]): void {
  try {
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  } catch {
    // quota exceeded
  }
}

export function loadRules(): TradingRule[] {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TradingRule[];
  } catch {
    return [];
  }
}

export function saveTriggerHistory(triggers: RuleTrigger[]): void {
  try {
    // Keep last 500 triggers
    const trimmed = triggers.slice(-500);
    localStorage.setItem(TRIGGERS_KEY, JSON.stringify(trimmed));
  } catch {
    // quota exceeded
  }
}

export function loadTriggerHistory(): RuleTrigger[] {
  try {
    const raw = localStorage.getItem(TRIGGERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RuleTrigger[];
  } catch {
    return [];
  }
}
