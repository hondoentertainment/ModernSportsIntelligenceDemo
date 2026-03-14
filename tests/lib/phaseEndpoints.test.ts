import { describe, expect, it, beforeEach } from 'vitest';
import {
    getExecutionOrders,
    postExecutionIntent,
    postIssueApiToken,
    postStrategyBacktest,
    postWorkflowRun,
    toggleExecutionKillSwitch
} from '../../lib/phaseEndpoints';
import { getDefaultWorkflowTemplates } from '../../lib/copilotService';

describe('phaseEndpoints', () => {
    beforeEach(() => {
        localStorage.clear();
        toggleExecutionKillSwitch(false);
    });

    it('runs execution endpoint path', async () => {
        const order = await postExecutionIntent({
            id: 'intent-1',
            type: 'buy',
            assetId: 'a1',
            assetName: 'Asset',
            quantity: 1,
            price: 100,
            createdAt: new Date().toISOString()
        }, 1000);

        const orders = await getExecutionOrders();
        expect(order.intentId).toBe('intent-1');
        expect(orders.length).toBeGreaterThan(0);
    });

    it('runs strategy/workflow/platform endpoints', () => {
        const strategy = {
            id: 's1',
            name: 'S',
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            entryRules: [{ metric: 'momentum', operator: 'gt' as const, threshold: 0 }],
            exitRules: [{ metric: 'momentum', operator: 'lt' as const, threshold: 0 }]
        };

        const bt = postStrategyBacktest([100, 102, 101, 105], strategy);
        const wf = postWorkflowRun(getDefaultWorkflowTemplates()[0], []);
        const token = postIssueApiToken('tenant-x', ['portfolio.read']);

        expect(bt.backtest.equityCurve.length).toBeGreaterThan(0);
        expect(wf.status).toBe('completed');
        expect(token.tenantId).toBe('tenant-x');
    });
});
