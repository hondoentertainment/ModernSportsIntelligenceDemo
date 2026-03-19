import { describe, expect, it } from 'vitest';
import { buildComplianceBundle, evaluateRiskPolicy, RiskPolicy } from '../../lib/utils/riskOffice';
import { AutonomousAction } from '../../types';

describe('riskOffice', () => {
    const policy: RiskPolicy = {
        id: 'p1',
        name: 'Default',
        maxPositionPct: 40,
        maxDrawdownPct: 15,
        maxDailyActions: 3
    };

    it('evaluates policy and creates bundle', () => {
        const actions: AutonomousAction[] = [
            { id: 'a1', type: 'BUY', assetName: 'X', amount: 100, rationale: 'r', timestamp: new Date().toISOString(), status: 'pending' }
        ];

        const evalRes = evaluateRiskPolicy(policy, [1000, 990, 970, 960], actions, 30);
        const bundle = buildComplianceBundle(policy, [1000, 990, 970, 960], actions, evalRes);
        expect(bundle.summary.actionCount).toBe(1);
        expect(bundle.policy.id).toBe('p1');
    });
});
