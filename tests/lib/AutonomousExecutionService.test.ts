import { beforeEach, describe, expect, it } from 'vitest';
import { AutonomousExecutionService } from '../../lib/trading/AutonomousExecutionService';
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
});
