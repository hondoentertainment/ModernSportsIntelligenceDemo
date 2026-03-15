import { describe, expect, it } from 'vitest';
import {
    evaluateStrategySignal,
    runBacktest,
    walkForwardValidate,
    StrategyDefinition,
    summarizeBacktest,
    PaperTradeLedger
} from '../../lib/strategyEngine';

describe('strategyEngine', () => {
    const strategy: StrategyDefinition = {
        id: 's1',
        name: 'Momentum Test',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        entryRules: [{ metric: 'momentum', operator: 'gt', threshold: 0 }],
        exitRules: [{ metric: 'momentum', operator: 'lt', threshold: 0 }]
    };

    it('evaluates entry signal', () => {
        const signal = evaluateStrategySignal(strategy, { metrics: { momentum: 2 } });
        expect(signal).toBe('entry');
    });

    it('runs backtest and walk-forward', () => {
        const prices = [100, 103, 105, 101, 99, 102, 106];
        const res = runBacktest(prices, strategy);
        const wf = walkForwardValidate(prices, strategy, 2);
        expect(res.equityCurve.length).toBe(prices.length);
        expect(wf.length).toBeGreaterThan(0);
    });

    it('summarizes strategy health and supports paper trades', () => {
        localStorage.clear();
        const prices = [100, 103, 105, 101, 99, 102, 106];
        const res = runBacktest(prices, strategy);
        const wf = walkForwardValidate(prices, strategy, 2);
        const summary = summarizeBacktest(res, wf);

        expect(summary.score).toBeTypeOf('number');

        PaperTradeLedger.openPosition(strategy.id, 'Demo Asset', 100);
        const open = PaperTradeLedger.getAll()[0];
        expect(open.status).toBe('open');

        const closed = PaperTradeLedger.closePosition(open.id, 110)[0];
        expect(closed.status).toBe('closed');
        expect(closed.pnlPct).toBe(10);
    });
});
