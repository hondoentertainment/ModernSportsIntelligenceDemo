import { store } from './dal/syncStore';
import { CardInventory, Sport } from '../types';

// ---- Types ----

export type RebalanceAlertType = 'drift' | 'concentration' | 'performance' | 'seasonal';
export type RebalanceAlertSeverity = 'critical' | 'warning' | 'info';

export interface RebalanceAlert {
  id: string;
  type: RebalanceAlertType;
  severity: RebalanceAlertSeverity;
  title: string;
  description: string;
  sport: Sport;
  currentAllocation: number; // percentage
  targetAllocation: number; // percentage
  driftAmount: number; // percentage (positive = over, negative = under)
  recommendedAction: string;
  createdAt: string;
  isAcknowledged: boolean;
}

export interface PortfolioTarget {
  sport: Sport;
  targetPercent: number;
  toleranceBand: number; // default 5%
  priority: number; // 1 = highest
}

export interface RebalanceConfig {
  targets: PortfolioTarget[];
  checkFrequency: 'daily' | 'weekly' | 'monthly';
  autoAcknowledge: boolean;
}

export interface SportDrift {
  sport: Sport;
  actualPercent: number;
  targetPercent: number;
  driftAmount: number; // actual - target
  absDrift: number;
  cardCount: number;
  totalValue: number;
}

export interface RebalanceSuggestion {
  sport: Sport;
  action: 'buy' | 'sell';
  amountUSD: number;
  reason: string;
  priority: number;
}

export interface RebalanceCostEstimate {
  totalCost: number;
  sellTransactionFees: number;
  buyTransactionFees: number;
  estimatedTaxImpact: number;
  netRebalanceValue: number;
}

export interface PortfolioHealthResult {
  score: number; // 0-100
  label: string;
  drifts: SportDrift[];
  totalCards: number;
  totalValue: number;
}

// ---- Constants ----

const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
const ALERT_STORAGE_KEY = 'rebalance_alert_history';
const CONFIG_STORAGE_KEY = 'rebalance_config';

// ---- Default Targets ----

export function getDefaultTargets(): PortfolioTarget[] {
  return [
    { sport: 'Baseball', targetPercent: 25, toleranceBand: 5, priority: 1 },
    { sport: 'Basketball', targetPercent: 25, toleranceBand: 5, priority: 2 },
    { sport: 'Football', targetPercent: 25, toleranceBand: 5, priority: 3 },
    { sport: 'Hockey', targetPercent: 15, toleranceBand: 5, priority: 4 },
    { sport: 'Soccer', targetPercent: 10, toleranceBand: 5, priority: 5 },
  ];
}

export function getDefaultConfig(): RebalanceConfig {
  return {
    targets: getDefaultTargets(),
    checkFrequency: 'weekly',
    autoAcknowledge: false,
  };
}

// ---- Helpers ----

function getActiveCards(inventory: CardInventory[]): CardInventory[] {
  return inventory.filter((c) => c.status !== 'sold');
}

function getCardValue(card: CardInventory): number {
  return card.currentValue ?? card.purchasePrice ?? 0;
}

function loadConfig(): RebalanceConfig {
  return store.get<RebalanceConfig>(CONFIG_STORAGE_KEY, getDefaultConfig());
}

function generateAlertId(sport: Sport, type: RebalanceAlertType): string {
  const day = new Date().toISOString().slice(0, 10);
  return `rebal-${sport.toLowerCase()}-${type}-${day}`;
}

// ---- Core Calculations ----

export function calculatePortfolioDrift(inventory: CardInventory[]): SportDrift[] {
  const active = getActiveCards(inventory);
  const config = loadConfig();
  const targets = config.targets;

  const totalValue = active.reduce((sum, c) => sum + getCardValue(c), 0);

  return SPORTS.map((sport) => {
    const sportCards = active.filter((c) => c.sport === sport);
    const sportValue = sportCards.reduce((sum, c) => sum + getCardValue(c), 0);
    const actualPercent = totalValue > 0 ? (sportValue / totalValue) * 100 : 0;
    const target = targets.find((t) => t.sport === sport);
    const targetPercent = target?.targetPercent ?? 0;
    const driftAmount = actualPercent - targetPercent;

    return {
      sport,
      actualPercent: Math.round(actualPercent * 100) / 100,
      targetPercent,
      driftAmount: Math.round(driftAmount * 100) / 100,
      absDrift: Math.abs(Math.round(driftAmount * 100) / 100),
      cardCount: sportCards.length,
      totalValue: Math.round(sportValue * 100) / 100,
    };
  });
}

export function generateRebalanceAlerts(inventory: CardInventory[]): RebalanceAlert[] {
  const drifts = calculatePortfolioDrift(inventory);
  const config = loadConfig();
  const alerts: RebalanceAlert[] = [];

  for (const drift of drifts) {
    const target = config.targets.find((t) => t.sport === drift.sport);
    const tolerance = target?.toleranceBand ?? 5;
    const absDrift = drift.absDrift;

    if (absDrift <= tolerance) continue;

    let severity: RebalanceAlertSeverity;
    if (absDrift > 15) {
      severity = 'critical';
    } else if (absDrift > 10) {
      severity = 'warning';
    } else {
      severity = 'info';
    }

    const direction = drift.driftAmount > 0 ? 'over' : 'under';
    const directionLabel = drift.driftAmount > 0 ? 'overallocated' : 'underallocated';

    const alert: RebalanceAlert = {
      id: generateAlertId(drift.sport, 'drift'),
      type: 'drift',
      severity,
      title: `${drift.sport} ${directionLabel} by ${absDrift.toFixed(1)}%`,
      description: `Your ${drift.sport} allocation is ${drift.actualPercent.toFixed(1)}% vs the ${drift.targetPercent}% target. This exceeds the ${tolerance}% tolerance band.`,
      sport: drift.sport,
      currentAllocation: drift.actualPercent,
      targetAllocation: drift.targetPercent,
      driftAmount: drift.driftAmount,
      recommendedAction:
        direction === 'over'
          ? `Consider reducing ${drift.sport} holdings by approximately $${Math.abs((drift.driftAmount / 100) * getTotalValue(inventory)).toFixed(0)} to return to target.`
          : `Consider adding ${drift.sport} cards worth approximately $${Math.abs((drift.driftAmount / 100) * getTotalValue(inventory)).toFixed(0)} to reach target allocation.`,
      createdAt: new Date().toISOString(),
      isAcknowledged: false,
    };

    alerts.push(alert);
  }

  // Concentration alert: any single sport > 50%
  for (const drift of drifts) {
    if (drift.actualPercent > 50) {
      alerts.push({
        id: generateAlertId(drift.sport, 'concentration'),
        type: 'concentration',
        severity: 'critical',
        title: `${drift.sport} concentration risk`,
        description: `${drift.sport} represents ${drift.actualPercent.toFixed(1)}% of your portfolio. High concentration increases risk.`,
        sport: drift.sport,
        currentAllocation: drift.actualPercent,
        targetAllocation: drift.targetPercent,
        driftAmount: drift.driftAmount,
        recommendedAction: `Diversify by reducing ${drift.sport} exposure and adding cards from underrepresented sports.`,
        createdAt: new Date().toISOString(),
        isAcknowledged: false,
      });
    }
  }

  // Seasonal alerts based on current month
  const month = new Date().getMonth(); // 0-11
  const seasonalSports: { sport: Sport; peakMonths: number[]; label: string }[] = [
    { sport: 'Baseball', peakMonths: [2, 3, 4, 5, 6, 7, 8, 9], label: 'MLB season (Mar-Oct)' },
    { sport: 'Basketball', peakMonths: [9, 10, 11, 0, 1, 2, 3, 4, 5], label: 'NBA season (Oct-Jun)' },
    { sport: 'Football', peakMonths: [7, 8, 9, 10, 11, 0, 1], label: 'NFL season (Aug-Feb)' },
    { sport: 'Hockey', peakMonths: [9, 10, 11, 0, 1, 2, 3, 4, 5], label: 'NHL season (Oct-Jun)' },
    { sport: 'Soccer', peakMonths: [7, 8, 9, 10, 11, 0, 1, 2, 3, 4], label: 'European season (Aug-May)' },
  ];

  for (const ss of seasonalSports) {
    const drift = drifts.find((d) => d.sport === ss.sport);
    if (!drift) continue;
    const isInSeason = ss.peakMonths.includes(month);
    if (isInSeason && drift.actualPercent < drift.targetPercent * 0.5 && drift.cardCount > 0) {
      alerts.push({
        id: generateAlertId(drift.sport, 'seasonal'),
        type: 'seasonal',
        severity: 'info',
        title: `${drift.sport} seasonal opportunity`,
        description: `${ss.label} is active. Your ${drift.sport} allocation is only ${drift.actualPercent.toFixed(1)}% — consider increasing exposure to capitalize on seasonal demand.`,
        sport: drift.sport,
        currentAllocation: drift.actualPercent,
        targetAllocation: drift.targetPercent,
        driftAmount: drift.driftAmount,
        recommendedAction: `Add ${drift.sport} cards during the active season to capture higher demand and liquidity.`,
        createdAt: new Date().toISOString(),
        isAcknowledged: false,
      });
    }
  }

  // Sort: critical first, then warning, then info
  const severityOrder: Record<RebalanceAlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

function getTotalValue(inventory: CardInventory[]): number {
  return getActiveCards(inventory).reduce((sum, c) => sum + getCardValue(c), 0);
}

export function getRebalanceSuggestions(inventory: CardInventory[]): RebalanceSuggestion[] {
  const drifts = calculatePortfolioDrift(inventory);
  const totalValue = getTotalValue(inventory);
  const suggestions: RebalanceSuggestion[] = [];

  for (const drift of drifts) {
    if (drift.absDrift <= 2) continue; // within acceptable range

    const amountUSD = Math.abs((drift.driftAmount / 100) * totalValue);

    if (drift.driftAmount > 0) {
      suggestions.push({
        sport: drift.sport,
        action: 'sell',
        amountUSD: Math.round(amountUSD),
        reason: `${drift.sport} is ${drift.driftAmount.toFixed(1)}% over target. Sell ~$${Math.round(amountUSD)} to rebalance.`,
        priority: drift.absDrift > 15 ? 1 : drift.absDrift > 10 ? 2 : 3,
      });
    } else {
      suggestions.push({
        sport: drift.sport,
        action: 'buy',
        amountUSD: Math.round(amountUSD),
        reason: `${drift.sport} is ${Math.abs(drift.driftAmount).toFixed(1)}% under target. Buy ~$${Math.round(amountUSD)} to rebalance.`,
        priority: drift.absDrift > 15 ? 1 : drift.absDrift > 10 ? 2 : 3,
      });
    }
  }

  suggestions.sort((a, b) => a.priority - b.priority);
  return suggestions;
}

export function calculateRebalanceCost(inventory: CardInventory[]): RebalanceCostEstimate {
  const suggestions = getRebalanceSuggestions(inventory);

  const sellTotal = suggestions
    .filter((s) => s.action === 'sell')
    .reduce((sum, s) => sum + s.amountUSD, 0);

  const buyTotal = suggestions
    .filter((s) => s.action === 'buy')
    .reduce((sum, s) => sum + s.amountUSD, 0);

  // Estimate fees: ~13% eBay seller fees, ~3% buyer platform fees, ~15% tax on gains
  const sellTransactionFees = Math.round(sellTotal * 0.13);
  const buyTransactionFees = Math.round(buyTotal * 0.03);
  const estimatedTaxImpact = Math.round(sellTotal * 0.15 * 0.3); // assume 30% of sells are gains, 15% tax
  const totalCost = sellTransactionFees + buyTransactionFees + estimatedTaxImpact;

  return {
    totalCost,
    sellTransactionFees,
    buyTransactionFees,
    estimatedTaxImpact,
    netRebalanceValue: Math.round(sellTotal + buyTotal),
  };
}

export function getPortfolioHealth(inventory: CardInventory[]): PortfolioHealthResult {
  const drifts = calculatePortfolioDrift(inventory);
  const active = getActiveCards(inventory);
  const totalValue = active.reduce((sum, c) => sum + getCardValue(c), 0);

  // Health score: start at 100, deduct for drift
  // Max deduction per sport proportional to its target weight
  let totalDeduction = 0;
  for (const drift of drifts) {
    // Each percent of drift deducts proportionally
    // 15%+ drift = maximum deduction for that sport
    const maxDeduction = drift.targetPercent; // max deduction equals weight
    const driftPenalty = Math.min(drift.absDrift / 15, 1) * maxDeduction;
    totalDeduction += driftPenalty;
  }

  const score = Math.max(0, Math.min(100, Math.round(100 - totalDeduction)));

  let label: string;
  if (score >= 90) label = 'Excellent';
  else if (score >= 75) label = 'Good';
  else if (score >= 60) label = 'Fair';
  else if (score >= 40) label = 'Poor';
  else label = 'Critical';

  return {
    score,
    label,
    drifts,
    totalCards: active.length,
    totalValue: Math.round(totalValue * 100) / 100,
  };
}

// ---- Alert Persistence ----

export function getAlertHistory(): RebalanceAlert[] {
  return store.get<RebalanceAlert[]>(ALERT_STORAGE_KEY, []);
}

export function saveAlertHistory(alerts: RebalanceAlert[]): void {
  store.set(ALERT_STORAGE_KEY, alerts);
}

export function acknowledgeAlert(alertId: string): RebalanceAlert[] {
  const history = getAlertHistory();
  const updated = history.map((a) =>
    a.id === alertId ? { ...a, isAcknowledged: true } : a
  );
  saveAlertHistory(updated);
  return updated;
}

export function persistAlerts(alerts: RebalanceAlert[]): void {
  const existing = getAlertHistory();
  const _existingIds = new Set(existing.map((a) => a.id));

  // Merge: keep acknowledged state from existing, add new ones
  const merged: RebalanceAlert[] = [];
  for (const alert of alerts) {
    const prev = existing.find((e) => e.id === alert.id);
    if (prev) {
      merged.push({ ...alert, isAcknowledged: prev.isAcknowledged });
    } else {
      merged.push(alert);
    }
  }

  // Keep old alerts not in current batch (historical)
  for (const old of existing) {
    if (!alerts.find((a) => a.id === old.id)) {
      merged.push(old);
    }
  }

  // Limit to last 100 alerts
  saveAlertHistory(merged.slice(0, 100));
}

export function saveConfig(config: RebalanceConfig): void {
  store.set(CONFIG_STORAGE_KEY, config);
}
