// @ts-nocheck
import { beforeEach, describe, expect, it } from 'vitest';
import {
    fetchExecutionApprovals,
    fetchExecutionFills,
    fetchMarketplaceListings,
    fetchScenarioRuns,
    insertExecutionApproval,
    insertExecutionFill,
    upsertMarketplaceListing,
    upsertScenarioRun,
} from '../../lib/utils/differentiatorData';

describe('differentiatorData', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('persists marketplace listings in local fallback mode', async () => {
        await upsertMarketplaceListing({
            id: 'listing-1',
            ownerUserId: 'user-1',
            counterpartyId: 'cp-1',
            sourceVenue: 'internal',
            title: 'Luka Doncic Prizm Silver',
            player: 'Luka Doncic',
            cardDescription: '2018 Panini Prizm Silver PSA 10',
            sport: 'Basketball',
            askingPrice: 5000,
            currency: 'USD',
            status: 'active',
            createdAt: new Date().toISOString(),
        });

        const listings = await fetchMarketplaceListings('user-1');
        expect(listings).toHaveLength(1);
        expect(listings[0].player).toBe('Luka Doncic');
    });

    it('persists scenario runs and execution records in local fallback mode', async () => {
        await upsertScenarioRun({
            id: 'run-1',
            ownerUserId: 'user-1',
            scenarioName: 'Crash',
            scenarioKind: 'market',
            portfolioValue: 1000,
            projectedValue: 800,
            navDelta: -200,
            inputs: {},
            outputs: {},
            createdAt: new Date().toISOString(),
        });

        await insertExecutionApproval({
            id: 'approval-1',
            intentId: 'intent-1',
            actorLabel: 'tester',
            decision: 'approve',
            createdAt: new Date().toISOString(),
        });

        await insertExecutionFill({
            id: 'fill-1',
            intentId: 'intent-1',
            venue: 'internal',
            fillQuantity: 1,
            fillPrice: 125,
            state: 'filled',
            createdAt: new Date().toISOString(),
        });

        const [runs, approvals, fills] = await Promise.all([
            fetchScenarioRuns('user-1'),
            fetchExecutionApprovals('intent-1'),
            fetchExecutionFills('intent-1'),
        ]);

        expect(runs).toHaveLength(1);
        expect(approvals).toHaveLength(1);
        expect(fills).toHaveLength(1);
    });
});
