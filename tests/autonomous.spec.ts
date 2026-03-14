import { describe, it, expect, beforeEach } from 'vitest';
import { AutonomousExecutionService } from '../lib/AutonomousExecutionService';
import { AutoPilotConfig, AutonomousAction, CardInventory } from '../types';

describe('AutonomousExecutionService', () => {
    const mockInventory: CardInventory[] = [
        {
            id: '1',
            player: 'Shohei Ohtani',
            year: 2018,
            manufacturer: 'Topps',
            cardNumber: '700',
            set: 'Update',
            sport: 'Baseball',
            league: 'MLB',
            isAutographed: false,
            condition: 'Mint',
            isGraded: true,
            gradingCompany: 'PSA',
            grade: '10',
            purchasePrice: 1000,
            purchaseDate: '2023-01-01',
            currentValue: 1200
        }
    ];

    beforeEach(() => {
        localStorage.clear();
    });

    it('stays inactive by default', () => {
        const config = AutonomousExecutionService.getConfig();
        expect(config.isActive).toBe(false);
    });

    it('saves and retrieves config', () => {
        const testConfig: AutoPilotConfig = {
            isActive: true,
            collar: {
                maxBudget: 5000,
                maxSpendPerAsset: 1000,
                riskTolerance: 'Aggressive',
                minActionConfidence: 0.65,
                requireApprovalAbove: 800,
                maxDailyActions: 10
            }
        };

        AutonomousExecutionService.saveConfig(testConfig);
        const retrieved = AutonomousExecutionService.getConfig();
        expect(retrieved.isActive).toBe(true);
        expect(retrieved.collar.maxBudget).toBe(5000);
    });

    it('records actions and prevents idempotent duplicates', async () => {
        const action: AutonomousAction = {
            id: 'test-id',
            type: 'BUY',
            assetName: 'Test Card',
            amount: 100,
            rationale: 'Test rationale',
            timestamp: new Date().toISOString(),
            status: 'pending',
            idempotencyKey: 'buy:test'
        };

        const first = await AutonomousExecutionService.addAction(action);
        const second = await AutonomousExecutionService.addAction({ ...action, id: 'test-id-2' });

        const actions = AutonomousExecutionService.getActions();
        expect(first).toBe(true);
        expect(second).toBe(false);
        expect(actions.length).toBe(1);
        expect(actions[0].assetName).toBe('Test Card');
    });

    it('enforces risk collars on candidate actions', () => {
        const config: AutoPilotConfig = {
            isActive: true,
            collar: {
                maxBudget: 200,
                maxSpendPerAsset: 150,
                riskTolerance: 'Balanced',
                minActionConfidence: 0.8,
                requireApprovalAbove: 100,
                maxDailyActions: 5
            }
        };

        const candidates: AutonomousAction[] = [
            {
                id: 'a1',
                type: 'BUY',
                assetName: 'Card A',
                amount: 120,
                confidence: 0.9,
                rationale: 'High conviction',
                timestamp: new Date().toISOString(),
                status: 'pending'
            },
            {
                id: 'a2',
                type: 'BUY',
                assetName: 'Card B',
                amount: 120,
                confidence: 0.7,
                rationale: 'Low confidence',
                timestamp: new Date().toISOString(),
                status: 'pending'
            }
        ];

        const gated = AutonomousExecutionService.enforceRiskCollars(candidates, config, []);
        expect(gated[0].policyDecision).toBe('needs_approval');
        expect(gated[1].policyDecision).toBe('blocked');
    });

    it('simulates cycle impact summary', () => {
        const actions: AutonomousAction[] = [
            {
                id: 'buy-1',
                type: 'BUY',
                assetName: 'Asset Buy',
                amount: 100,
                rationale: 'Buy',
                timestamp: new Date().toISOString(),
                status: 'pending',
                policyDecision: 'approved'
            },
            {
                id: 'sell-1',
                type: 'SELL',
                assetName: 'Asset Sell',
                amount: 70,
                rationale: 'Sell',
                timestamp: new Date().toISOString(),
                status: 'pending',
                policyDecision: 'approved'
            }
        ];

        const impact = AutonomousExecutionService.simulateCycleImpact(mockInventory, actions);
        expect(impact.projectedBuySpend).toBe(100);
        expect(impact.projectedSellValue).toBe(70);
        expect(impact.projectedNetCashDelta).toBe(-30);
    });
});
