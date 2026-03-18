import { beforeEach, describe, expect, it } from 'vitest';
import { AutonomousExecutionService } from '../../lib/AutonomousExecutionService';
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
});
