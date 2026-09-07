import { beforeEach, describe, expect, it } from 'vitest';
import { AutonomousExecutionService, buildAutopilotIdempotencyKey } from '../../lib/trading/AutonomousExecutionService';
import { AutoPilotConfig, AutonomousAction } from '../../types';

describe('AutonomousExecutionService', () => {
    const config: AutoPilotConfig = {
        isActive: true,
        collar: {
            maxBudget: 500,
            maxSpendPerAsset: 250,
            riskTolerance: 'Balanced',
            minActionConfidence: 0.7,
            requireApprovalAbove: 200,
            maxDailyActions: 5,
            blockedPlayers: ['Blocked Player']
        }
    };

    beforeEach(() => {
        localStorage.clear();
        AutonomousExecutionService.saveConfig(config);
    });

    it('blocks actions that violate player and confidence rules', () => {
        const actions: AutonomousAction[] = [
            {
                id: 'a1',
                type: 'BUY',
                assetName: 'Blocked Player Bowman Chrome',
                amount: 150,
                rationale: 'Test',
                timestamp: new Date().toISOString(),
                status: 'pending',
                confidence: 0.9
            },
            {
                id: 'a2',
                type: 'BUY',
                assetName: 'Allowed Player',
                amount: 220,
                rationale: 'Test',
                timestamp: new Date().toISOString(),
                status: 'pending',
                confidence: 0.8
            }
        ];

        const gated = AutonomousExecutionService.enforceRiskCollars(actions, config);
        expect(gated[0].policyDecision).toBe('blocked');
        expect(gated[1].policyDecision).toBe('needs_approval');
    });

    it('approves queued actions through the operator checkpoint', async () => {
        await AutonomousExecutionService.addAction({
            id: 'a3',
            type: 'BUY',
            assetName: 'Approved Asset',
            amount: 220,
            rationale: 'Needs approval',
            timestamp: new Date().toISOString(),
            status: 'pending',
            policyDecision: 'needs_approval'
        });

        const updated = await AutonomousExecutionService.decideAction('a3', 'approve', 'tester');
        const action = updated.find(item => item.id === 'a3');

        expect(action?.status).toBe('submitted');
        expect(action?.approvalActor).toBe('tester');
    });

    it('routes low-confidence actions to human approval instead of blocking', () => {
        const gated = AutonomousExecutionService.enforceRiskCollars(
            [{
                id: 'low-conf',
                type: 'BUY',
                assetName: 'Cautious Bid',
                amount: 80,
                rationale: 'Thin tape',
                timestamp: new Date().toISOString(),
                status: 'pending',
                confidence: 0.4,
            }],
            config,
        );
        expect(gated[0].policyDecision).toBe('needs_approval');
        expect(gated[0].policyReason).toMatch(/human approval/i);
    });

    it('blocks spend that exceeds the daily budget or drawdown stop', () => {
        const daily: AutoPilotConfig = {
            ...config,
            collar: { ...config.collar, maxDailyBudget: 100, requireApprovalAbove: 1000, minActionConfidence: 0.1 },
        };
        const overDaily = AutonomousExecutionService.enforceRiskCollars(
            [{
                id: 'daily',
                type: 'BUY',
                assetName: 'Over Daily',
                amount: 150,
                rationale: 'Test',
                timestamp: new Date().toISOString(),
                status: 'pending',
                confidence: 0.9,
            }],
            daily,
        );
        expect(overDaily[0].policyDecision).toBe('blocked');
        expect(overDaily[0].policyReason).toMatch(/daily budget/i);

        const drawdown = AutonomousExecutionService.enforceRiskCollars(
            [{
                id: 'dd',
                type: 'BUY',
                assetName: 'After Drawdown',
                amount: 80,
                rationale: 'Test',
                timestamp: new Date().toISOString(),
                status: 'pending',
                confidence: 0.9,
            }],
            { ...config, collar: { ...config.collar, maxDrawdownPct: 10, requireApprovalAbove: 1000 } },
            [],
            [{ purchasePrice: 1000, currentValue: 800 } as never],
        );
        expect(drawdown[0].policyDecision).toBe('blocked');
        expect(drawdown[0].policyReason).toMatch(/drawdown/i);
    });

    it('evaluates external campaign spend against collars without live trades', () => {
        const blocked = AutonomousExecutionService.evaluateExternalSpend(400, config);
        expect(blocked.decision).toBe('blocked');
        const approval = AutonomousExecutionService.evaluateExternalSpend(220, config);
        expect(approval.decision).toBe('needs_approval');
        const ok = AutonomousExecutionService.evaluateExternalSpend(80, {
            ...config,
            collar: { ...config.collar, requireApprovalAbove: 500, minActionConfidence: 0.1 },
        });
        expect(ok.decision).toBe('approved');

        const lowConf = AutonomousExecutionService.evaluateExternalSpend(80, {
            ...config,
            collar: { ...config.collar, requireApprovalAbove: 500, minActionConfidence: 0.8 },
        }, [], [], 0.2);
        expect(lowConf.decision).toBe('needs_approval');

        const daily = AutonomousExecutionService.evaluateExternalSpend(50, {
            ...config,
            collar: { ...config.collar, maxDailyBudget: 100, maxSpendPerAsset: 200 },
        }, [{
            id: 'prior',
            type: 'BUY',
            assetName: 'Earlier',
            amount: 80,
            rationale: 'x',
            timestamp: new Date().toISOString(),
            status: 'submitted',
        }]);
        expect(daily.decision).toBe('blocked');
        expect(AutonomousExecutionService.portfolioDrawdownPct([
            { purchasePrice: 200, currentValue: 100 } as never,
        ])).toBe(50);
    });

    it('blocks campaign spend that exceeds cycle maxBudget even when per-asset allows it', () => {
        const cycle: AutoPilotConfig = {
            ...config,
            collar: {
                ...config.collar,
                maxBudget: 100,
                maxSpendPerAsset: 250,
                requireApprovalAbove: 1000,
                minActionConfidence: 0.1,
            },
        };
        const blocked = AutonomousExecutionService.evaluateExternalSpend(200, cycle);
        expect(blocked.decision).toBe('blocked');
        expect(blocked.reason).toMatch(/cycle budget/i);

        const under = AutonomousExecutionService.evaluateExternalSpend(80, cycle);
        expect(under.decision).toBe('approved');
    });

    it('applies the drawdown stop when campaign preview receives real inventory', () => {
        const drawdownCfg: AutoPilotConfig = {
            ...config,
            collar: {
                ...config.collar,
                maxDrawdownPct: 10,
                requireApprovalAbove: 1000,
                minActionConfidence: 0.1,
            },
        };
        const emptyInventory = AutonomousExecutionService.evaluateExternalSpend(80, drawdownCfg, [], []);
        expect(emptyInventory.decision).toBe('approved');

        const underwater = AutonomousExecutionService.evaluateExternalSpend(
            80,
            drawdownCfg,
            [],
            [{ purchasePrice: 1000, currentValue: 800 } as never],
        );
        expect(underwater.decision).toBe('blocked');
        expect(underwater.reason).toMatch(/drawdown/i);
    });

    it('builds a day-bucketed idempotency key without using a unique timestamp suffix', () => {
        const key = buildAutopilotIdempotencyKey({
            type: 'BUY',
            assetName: 'Mike Trout Chrome',
            cycleId: 'cycle-1',
            timestamp: '2026-09-07T15:00:00.000Z',
        });
        expect(key).toBe('BUY:mike-trout-chrome:cycle-1:2026-09-07');
        const again = buildAutopilotIdempotencyKey({
            type: 'BUY',
            assetName: 'Mike Trout Chrome',
            cycleId: 'cycle-1',
            timestamp: '2026-09-07T23:59:00.000Z',
        });
        expect(again).toBe(key);
    });

    it('blocks duplicate candidates that share an idempotency key', async () => {
        await AutonomousExecutionService.addAction({
            id: 'prior',
            type: 'BUY',
            assetName: 'Mike Trout Chrome',
            amount: 80,
            rationale: 'first',
            timestamp: '2026-09-07T10:00:00.000Z',
            status: 'pending',
            cycleId: 'cycle-1',
            idempotencyKey: 'BUY:mike-trout-chrome:cycle-1:2026-09-07',
        });
        const gated = AutonomousExecutionService.enforceRiskCollars(
            [{
                id: 'dup',
                type: 'BUY',
                assetName: 'Mike Trout Chrome',
                amount: 80,
                rationale: 'retry',
                timestamp: '2026-09-07T18:00:00.000Z',
                status: 'pending',
                cycleId: 'cycle-1',
                confidence: 0.9,
            }],
            { ...config, collar: { ...config.collar, requireApprovalAbove: 500, minActionConfidence: 0.1 } },
        );
        expect(gated[0].policyDecision).toBe('blocked');
        expect(gated[0].policyReason).toMatch(/idempotency/i);
    });

    it('refuses addAction when the idempotency key already exists', async () => {
        const action = {
            id: 'one',
            type: 'SELL' as const,
            assetName: 'Dup Asset',
            amount: 50,
            rationale: 'x',
            timestamp: new Date().toISOString(),
            status: 'pending' as const,
            idempotencyKey: 'SELL:dup-asset:default:2026-09-07',
        };
        expect(await AutonomousExecutionService.addAction(action)).toBe(true);
        expect(await AutonomousExecutionService.addAction({ ...action, id: 'two' })).toBe(false);
    });
});
