// Phase 38: Strategy Engine and Backtesting
import { store } from './dal/syncStore';

export type RuleOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq';

export interface StrategyRule {
    metric: string;
    operator: RuleOperator;
    threshold: number;
}

export interface StrategyDefinition {
    id: string;
    name: string;
    version: string;
    entryRules: StrategyRule[];
    exitRules: StrategyRule[];
    createdAt: string;
}

export interface StrategyContext {
    metrics: Record<string, number>;
}

export interface BacktestResult {
    trades: number;
    wins: number;
    losses: number;
    totalReturnPct: number;
    maxDrawdownPct: number;
    equityCurve: number[];
}

export interface StrategySnapshot {
    winRate: number;
    expectancy: number;
    score: number;
    overfitRisk: 'low' | 'medium' | 'high';
}

export interface PaperTradePosition {
    id: string;
    strategyId: string;
    assetName: string;
    entryPrice: number;
    currentPrice: number;
    status: 'open' | 'closed';
    openedAt: string;
    closedAt?: string;
    pnlPct: number;
}

const STRATEGY_REGISTRY_KEY = 'msi_strategy_registry';
const PAPER_TRADES_KEY = 'msi_strategy_paper_trades';

function evaluateRule(rule: StrategyRule, metrics: Record<string, number>): boolean {
    const value = metrics[rule.metric] ?? 0;
    switch (rule.operator) {
        case 'gt': return value > rule.threshold;
        case 'gte': return value >= rule.threshold;
        case 'lt': return value < rule.threshold;
        case 'lte': return value <= rule.threshold;
        case 'eq': return value === rule.threshold;
        default: return false;
    }
}

export function evaluateStrategySignal(strategy: StrategyDefinition, context: StrategyContext): 'entry' | 'exit' | 'hold' {
    const entry = strategy.entryRules.every(r => evaluateRule(r, context.metrics));
    const exit = strategy.exitRules.every(r => evaluateRule(r, context.metrics));
    if (entry) return 'entry';
    if (exit) return 'exit';
    return 'hold';
}

export function runBacktest(prices: number[], strategy: StrategyDefinition): BacktestResult {
    if (prices.length < 3) {
        return { trades: 0, wins: 0, losses: 0, totalReturnPct: 0, maxDrawdownPct: 0, equityCurve: [100] };
    }

    let cash = 100;
    let position = 0;
    let entryPrice = 0;
    let trades = 0;
    let wins = 0;
    let losses = 0;
    const equityCurve: number[] = [cash];

    for (let i = 1; i < prices.length; i++) {
        const prev = prices[i - 1];
        const curr = prices[i];
        const momentum = ((curr - prev) / prev) * 100;

        const signal = evaluateStrategySignal(strategy, {
            metrics: {
                price: curr,
                momentum,
                idx: i
            }
        });

        if (signal === 'entry' && position === 0) {
            position = cash / curr;
            entryPrice = curr;
            cash = 0;
            trades += 1;
        } else if (signal === 'exit' && position > 0) {
            cash = position * curr;
            if (curr > entryPrice) wins += 1;
            else losses += 1;
            position = 0;
        }

        const equity = cash + (position * curr);
        equityCurve.push(equity);
    }

    const finalEquity = equityCurve[equityCurve.length - 1];
    const totalReturnPct = ((finalEquity - 100) / 100) * 100;

    let peak = equityCurve[0];
    let maxDrawdownPct = 0;
    for (const point of equityCurve) {
        if (point > peak) peak = point;
        const drawdown = ((peak - point) / peak) * 100;
        if (drawdown > maxDrawdownPct) maxDrawdownPct = drawdown;
    }

    return {
        trades,
        wins,
        losses,
        totalReturnPct: Math.round(totalReturnPct * 100) / 100,
        maxDrawdownPct: Math.round(maxDrawdownPct * 100) / 100,
        equityCurve
    };
}

export function walkForwardValidate(prices: number[], strategy: StrategyDefinition, splits: number = 3): BacktestResult[] {
    const chunk = Math.max(3, Math.floor(prices.length / splits));
    const results: BacktestResult[] = [];

    for (let i = 0; i < prices.length; i += chunk) {
        const window = prices.slice(i, i + chunk);
        if (window.length >= 3) results.push(runBacktest(window, strategy));
    }

    return results;
}

export function summarizeBacktest(backtest: BacktestResult, walkForward: BacktestResult[]): StrategySnapshot {
    const winRate = backtest.trades > 0 ? backtest.wins / backtest.trades : 0;
    const expectancy = backtest.trades > 0 ? backtest.totalReturnPct / backtest.trades : 0;
    const walkForwardAverage = walkForward.length > 0
        ? walkForward.reduce((sum, result) => sum + result.totalReturnPct, 0) / walkForward.length
        : 0;
    const overfitGap = Math.abs(backtest.totalReturnPct - walkForwardAverage);
    const overfitRisk = overfitGap > 20 ? 'high' : overfitGap > 10 ? 'medium' : 'low';
    const score = Math.round(((backtest.totalReturnPct * 0.45) + (winRate * 100 * 0.35) - (backtest.maxDrawdownPct * 0.2)) * 100) / 100;

    return {
        winRate,
        expectancy,
        score,
        overfitRisk
    };
}

export function getDefaultStrategies(): StrategyDefinition[] {
    return [
        {
            id: 'momentum-breakout',
            name: 'Momentum Breakout',
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            entryRules: [{ metric: 'momentum', operator: 'gt', threshold: 1 }],
            exitRules: [{ metric: 'momentum', operator: 'lt', threshold: -1 }]
        },
        {
            id: 'mean-reversion',
            name: 'Mean Reversion',
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            entryRules: [{ metric: 'momentum', operator: 'lt', threshold: -2 }],
            exitRules: [{ metric: 'momentum', operator: 'gt', threshold: 1 }]
        }
    ];
}

export class StrategyRegistry {
    static getAll(): StrategyDefinition[] {
        const parsed = store.get<StrategyDefinition[]>(STRATEGY_REGISTRY_KEY, []);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
        return getDefaultStrategies();
    }

    static save(strategy: StrategyDefinition): StrategyDefinition[] {
        const existing = this.getAll();
        const idx = existing.findIndex(s => s.id === strategy.id);
        if (idx >= 0) existing[idx] = strategy;
        else existing.unshift(strategy);
        store.set(STRATEGY_REGISTRY_KEY, existing);
        return existing;
    }
}

export class PaperTradeLedger {
    static getAll(): PaperTradePosition[] {
        const parsed = store.get<PaperTradePosition[]>(PAPER_TRADES_KEY, []);
        return Array.isArray(parsed) ? parsed : [];
    }

    static saveAll(positions: PaperTradePosition[]): PaperTradePosition[] {
        store.set(PAPER_TRADES_KEY, positions);
        return positions;
    }

    static openPosition(strategyId: string, assetName: string, entryPrice: number): PaperTradePosition[] {
        const positions = this.getAll();
        positions.unshift({
            id: crypto.randomUUID(),
            strategyId,
            assetName,
            entryPrice,
            currentPrice: entryPrice,
            status: 'open',
            openedAt: new Date().toISOString(),
            pnlPct: 0
        });
        return this.saveAll(positions.slice(0, 25));
    }

    static markPosition(positionId: string, currentPrice: number): PaperTradePosition[] {
        const positions = this.getAll().map(position => {
            if (position.id !== positionId) return position;
            const pnlPct = position.entryPrice > 0 ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100 : 0;
            return {
                ...position,
                currentPrice,
                pnlPct: Math.round(pnlPct * 100) / 100
            };
        });
        return this.saveAll(positions);
    }

    static closePosition(positionId: string, exitPrice: number): PaperTradePosition[] {
        const positions = this.getAll().map(position => {
            if (position.id !== positionId) return position;
            const pnlPct = position.entryPrice > 0 ? ((exitPrice - position.entryPrice) / position.entryPrice) * 100 : 0;
            return {
                ...position,
                currentPrice: exitPrice,
                pnlPct: Math.round(pnlPct * 100) / 100,
                status: 'closed' as const,
                closedAt: new Date().toISOString()
            };
        });
        return this.saveAll(positions);
    }
}
