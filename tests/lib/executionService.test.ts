import { beforeEach, describe, expect, it } from 'vitest';
import { ExecutionService, ExecutionAdapter, OrderIntent } from '../../lib/utils/executionService';

describe('executionService', () => {
    const adapter: ExecutionAdapter = {
        name: 'mock',
        submit: async (intent) => ({
            id: `ord-${intent.id}`,
            intentId: intent.id,
            venue: 'mock',
            state: 'submitted',
            submittedAt: new Date().toISOString(),
            filledQuantity: 0
        }),
        cancel: async () => true,
        status: async () => 'filled'
    };

    beforeEach(() => {
        localStorage.clear();
        ExecutionService.registerAdapter(adapter);
        ExecutionService.setKillSwitch(false);
    });

    it('fails pre-trade when kill-switch is active', () => {
        ExecutionService.setKillSwitch(true);
        const check = ExecutionService.preTradeCheck({
            id: 'i1', type: 'buy', assetId: 'a1', assetName: 'Asset', quantity: 1, price: 100, createdAt: new Date().toISOString()
        }, 1000);
        expect(check.approved).toBe(false);
    });

    it('submits and reconciles orders', async () => {
        const intent: OrderIntent = {
            id: 'i2', type: 'buy', assetId: 'a2', assetName: 'Asset2', quantity: 1, price: 100, createdAt: new Date().toISOString()
        };
        const order = await ExecutionService.submitIntent(intent, 'mock', 1000);
        expect(order.state).toBe('submitted');

        const reconciled = await ExecutionService.reconcileOpenOrders('mock');
        expect(reconciled[0].state).toBe('filled');
    });
});
